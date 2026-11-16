import * as THREE from 'three';

export interface HephaestusTextures {
  skinBump: THREE.CanvasTexture;
  apronTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createHephaestusTextures(): HephaestusTextures {
  // 1. Bump map de pele rústica de ferreiro
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6500; i++) {
      const v = 120 + Math.floor(Math.random() * 16);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 2. Avental Pesado de Couro Curtido com Rebites de Bronze e Fuligem
  const apronCanvas = document.createElement('canvas');
  apronCanvas.width = 512;
  apronCanvas.height = 256;
  const aCtx = apronCanvas.getContext('2d');
  if (aCtx) {
    const aGrad = aCtx.createLinearGradient(0, 0, 0, 256);
    aGrad.addColorStop(0, '#451a03');
    aGrad.addColorStop(0.6, '#291004');
    aGrad.addColorStop(1, '#1c0a03');
    aCtx.fillStyle = aGrad;
    aCtx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 800; i++) {
      aCtx.fillStyle = i % 2 === 0 ? 'rgba(12, 6, 3, 0.25)' : 'rgba(180, 83, 9, 0.14)';
      aCtx.fillRect(Math.random() * 512, Math.random() * 256, 12, 6);
    }

    aCtx.fillStyle = '#b45309';
    aCtx.fillRect(0, 206, 512, 34);
    aCtx.fillStyle = '#facc15';
    for (let x = 16; x < 512; x += 32) {
      aCtx.beginPath();
      aCtx.arc(x, 223, 5, 0, Math.PI * 2);
      aCtx.fill();
    }
  }
  const apronTex = new THREE.CanvasTexture(apronCanvas);
  apronTex.wrapS = apronTex.wrapT = THREE.RepeatWrapping;

  return { skinBump, apronTex };
}

let _cachedHephaestusTex: HephaestusTextures | null = null;
export function getCachedHephaestusTextures(): HephaestusTextures {
  if (!_cachedHephaestusTex) _cachedHephaestusTex = createHephaestusTextures();
  return _cachedHephaestusTex;
}

function group(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D | null,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos = [0, 0, 0],
  rot = [0, 0, 0],
  scale = [1, 1, 1]
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

export interface HephaestusLegJoints {
  hip: THREE.Group;
  knee: THREE.Group;
  ankle: THREE.Group;
  kneeGear?: THREE.Mesh;
}

export interface HephaestusArmJoints {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

export interface HephaestusModel {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: HephaestusLegJoints;
    R: HephaestusLegJoints;
  };
  rightArm: HephaestusArmJoints;
  leftArm: HephaestusArmJoints;
  hammer: THREE.Group;
  hammerHead: THREE.Group;
  hammerImpactAnchor: THREE.Group;
  hotIngot: THREE.Mesh;
  beardLocks: Array<{ mesh: THREE.Mesh; rx: number; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
}

export function createHephaestusMaterials(textures: HephaestusTextures): Record<string, THREE.Material> {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xb0724c,
      roughness: 0.44,
      metalness: 0.08,
      bumpMap: textures.skinBump,
      bumpScale: 0.0045,
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0x8a5436,
      roughness: 0.48,
      metalness: 0.08,
    }),
    beardCharcoal: new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.62,
      metalness: 0.1,
    }),
    beardCopperStreak: new THREE.MeshStandardMaterial({
      color: 0x7c2d12,
      emissive: new THREE.Color(0x2a0802),
      emissiveIntensity: 0.25,
      roughness: 0.55,
    }),
    forgedBronze: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: new THREE.Color(0x291102),
      emissiveIntensity: 0.25,
      metalness: 0.92,
      roughness: 0.22,
    }),
    divineGold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0x451a03),
      emissiveIntensity: 0.3,
      metalness: 0.94,
      roughness: 0.18,
    }),
    blackSteel: new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      metalness: 0.92,
      roughness: 0.26,
    }),
    magmaGlow: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xf97316),
      emissiveIntensity: 3.8,
      roughness: 0.1,
    }),
    apronLeather: new THREE.MeshStandardMaterial({
      map: textures.apronTex,
      roughness: 0.68,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
    eyeAmberFire: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 3.8,
      roughness: 0.06,
    }),
  };
}

export function buildHephaestus(textures: HephaestusTextures): HephaestusModel {
  const M = createHephaestusMaterials(textures);

  const root = new THREE.Group();
  const body = group(root, 0, 1.06, 0);

  // A. PELVE E PERNAS (PERNA DIREITA MUSCULOSA + PERNA ESQUERDA MECÂNICA DOURADA)
  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.28, 22, 20), M.apronLeather, [0, 0, 0], [0, 0, 0], [1.18, 0.78, 0.88]);

  const legs: Record<'L' | 'R', HephaestusLegJoints> = {} as any;

  // PERNA DIREITA (Humana, maciça e musculosa)
  {
    const hipR = group(pelvis, 0.185, -0.04, 0);
    sculpt(hipR, new THREE.CylinderGeometry(0.165, 0.12, 0.48, 20), M.skin, [0, -0.23, 0], [0, 0, 0], [1.06, 1, 1.12]);
    sculpt(hipR, new THREE.SphereGeometry(0.13, 16, 16), M.skin, [0.025, -0.20, 0.056], [0, 0, 0], [0.98, 1.82, 0.88]);
    sculpt(hipR, new THREE.SphereGeometry(0.102, 16, 16), M.skin, [0, -0.48, 0.015]);

    const kneeR = group(hipR, 0, -0.49, 0);
    sculpt(kneeR, new THREE.CylinderGeometry(0.106, 0.065, 0.45, 18), M.skin, [0, -0.22, 0]);
    sculpt(kneeR, new THREE.SphereGeometry(0.10, 16, 16), M.skin, [0, -0.15, -0.042], [0, 0, 0], [1.0, 1.65, 0.98]);
    sculpt(kneeR, new THREE.CylinderGeometry(0.104, 0.07, 0.34, 16, 1, false, -0.85, 1.7), M.forgedBronze, [0, -0.22, 0.012]);

    const ankleR = group(kneeR, 0, -0.45, 0.02);
    sculpt(ankleR, new THREE.BoxGeometry(0.115, 0.065, 0.24), M.apronLeather, [0, -0.02, 0.04]);
    sculpt(ankleR, new THREE.BoxGeometry(0.124, 0.022, 0.255), M.forgedBronze, [0, -0.052, 0.04]);

    legs.R = { hip: hipR, knee: kneeR, ankle: ankleR };
  }

  // PERNA ESQUERDA (PRÓTESE MECÂNICA DE BRONZE E OURO FORJADA POR HEFESTO)
  {
    const hipL = group(pelvis, -0.185, -0.04, 0);

    sculpt(hipL, new THREE.CylinderGeometry(0.155, 0.11, 0.34, 20), M.skin, [0, -0.16, 0], [0, 0, 0], [1.05, 1, 1.1]);
    sculpt(hipL, new THREE.CylinderGeometry(0.125, 0.095, 0.18, 20), M.forgedBronze, [0, -0.36, 0]);
    sculpt(hipL, new THREE.TorusGeometry(0.122, 0.014, 8, 24), M.divineGold, [0, -0.28, 0], [Math.PI / 2, 0, 0]);

    const kneeGear = sculpt(hipL, new THREE.CylinderGeometry(0.088, 0.088, 0.15, 16), M.divineGold, [0, -0.48, 0.01], [0, 0, Math.PI / 2]);
    sculpt(hipL, new THREE.CylinderGeometry(0.045, 0.045, 0.165, 12), M.magmaGlow, [0, -0.48, 0.01], [0, 0, Math.PI / 2]);

    const kneeL = group(hipL, 0, -0.49, 0);
    sculpt(kneeL, new THREE.CylinderGeometry(0.048, 0.038, 0.44, 14), M.blackSteel, [0, -0.22, 0]);
    sculpt(kneeL, new THREE.CylinderGeometry(0.026, 0.022, 0.38, 12), M.divineGold, [0, -0.20, -0.055], [-0.08, 0, 0]);
    sculpt(kneeL, new THREE.BoxGeometry(0.085, 0.34, 0.045), M.forgedBronze, [0, -0.22, 0.048]);
    sculpt(kneeL, new THREE.BoxGeometry(0.024, 0.26, 0.052), M.magmaGlow, [0, -0.22, 0.05]);

    const ankleL = group(kneeL, 0, -0.45, 0.02);
    sculpt(ankleL, new THREE.BoxGeometry(0.11, 0.055, 0.24), M.forgedBronze, [0, -0.02, 0.04]);
    sculpt(ankleL, new THREE.BoxGeometry(0.12, 0.022, 0.255), M.divineGold, [0, -0.05, 0.04]);
    sculpt(ankleL, new THREE.CylinderGeometry(0.04, 0.04, 0.13, 12), M.divineGold, [0, 0.01, -0.02], [0, 0, Math.PI / 2]);

    legs.L = { hip: hipL, knee: kneeL, ankle: ankleL, kneeGear };
  }

  legs.L.hip.rotation.set(-0.22, -0.14, -0.12);
  legs.L.knee.rotation.set(0.28, 0, 0);
  legs.R.hip.rotation.set(0.18, 0.16, 0.14);
  legs.R.knee.rotation.set(0.22, 0, 0);

  // B. TRONCO COLOSSAL DE FERREIRO
  const torso = group(body, 0, 1.32, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.30, -0.40),
    new THREE.Vector2(0.28, -0.20),
    new THREE.Vector2(0.35, 0.04),
    new THREE.Vector2(0.47, 0.28),
    new THREE.Vector2(0.42, 0.44),
    new THREE.Vector2(0.19, 0.51),
    new THREE.Vector2(0.01, 0.52),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.26, 1.0, 0.80]);

  const pecGeo = new THREE.SphereGeometry(0.25, 24, 24);
  sculpt(torso, pecGeo, M.skin, [-0.22, 0.23, 0.19], [0.12, -0.22, -0.14], [1.08, 0.88, 0.62]);
  sculpt(torso, pecGeo, M.skin, [0.22, 0.23, 0.19], [0.12, 0.22, 0.14], [1.08, 0.88, 0.62]);

  const abGeo = new THREE.SphereGeometry(0.10, 16, 16);
  [
    { y: 0.04, sx: 1.06, sy: 0.76, z: 0.246 },
    { y: -0.08, sx: 1.02, sy: 0.78, z: 0.242 },
  ].forEach((lvl) => {
    sculpt(torso, abGeo, M.skin, [-0.084, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.50]);
    sculpt(torso, abGeo, M.skin, [0.084, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.50]);
  });

  const latGeo = new THREE.SphereGeometry(0.275, 20, 20);
  sculpt(torso, latGeo, M.skin, [-0.25, 0.17, -0.135], [0, 0, -0.25], [1.05, 1.36, 0.68]);
  sculpt(torso, latGeo, M.skin, [0.25, 0.17, -0.135], [0, 0, 0.25], [1.05, 1.36, 0.68]);

  const trapGeo = new THREE.SphereGeometry(0.25, 18, 18);
  sculpt(torso, trapGeo, M.skin, [-0.215, 0.43, -0.05], [0, 0, 0.42], [1.16, 0.68, 0.78]);
  sculpt(torso, trapGeo, M.skin, [0.215, 0.43, -0.05], [0, 0, -0.42], [1.16, 0.68, 0.78]);

  sculpt(torso, new THREE.CylinderGeometry(0.15, 0.188, 0.25, 20), M.skin, [0, 0.53, -0.01], [0.08, 0, 0], [1.04, 1, 1.08]);

  // C. ROSTO DE MESTRE FERREIRO + BARBA TRANÇADA + VISOR DE FORJA
  const head = group(torso, 0, 0.74, 0.04);

  const skullGeo = new THREE.SphereGeometry(0.214, 36, 36);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.15;
    x *= 0.98;
    if (y < 0.02 && y > -0.09 && z > 0) { x *= 1.08; z *= 1.06; }
    if (y <= -0.08 && z > -0.02) { x *= 1.04; z *= 1.12; }
    if (z < -0.12) z *= 0.92;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  sculpt(head, new THREE.BoxGeometry(0.038, 0.086, 0.054), M.skin, [0, 0.004, 0.204], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.025, 14, 14), M.skin, [0, -0.038, 0.218], [0, 0, 0], [1.1, 0.85, 1.05]);

  const eyebrow = new THREE.CapsuleGeometry(0.015, 0.068, 8, 12);
  sculpt(head, eyebrow, M.beardCharcoal, [-0.058, 0.050, 0.202], [0.1, 0.25, 1.32], [1.12, 1, 0.85]);
  sculpt(head, eyebrow, M.beardCharcoal, [0.058, 0.050, 0.202], [0.1, -0.25, -1.32], [1.12, 1, 0.85]);

  const eyeGeo = new THREE.SphereGeometry(0.021, 16, 16);
  sculpt(head, eyeGeo, M.eyeAmberFire, [-0.056, 0.022, 0.188], [0, 0, 0], [1.16, 0.70, 0.8]);
  sculpt(head, eyeGeo, M.eyeAmberFire, [0.056, 0.022, 0.188], [0, 0, 0], [1.16, 0.70, 0.8]);

  const beardLocks: Array<{ mesh: THREE.Mesh; rx: number; phase: number }> = [];
  const mustacheGeo = new THREE.CapsuleGeometry(0.026, 0.078, 10, 14);
  sculpt(head, mustacheGeo, M.beardCharcoal, [-0.048, -0.082, 0.206], [0.15, 0.35, 1.15], [1.15, 1, 0.88]);
  sculpt(head, mustacheGeo, M.beardCharcoal, [0.048, -0.082, 0.206], [0.15, -0.35, -1.15], [1.15, 1, 0.88]);

  const lockGeo = new THREE.ConeGeometry(0.072, 0.25, 14);
  lockGeo.rotateX(Math.PI);
  const beardSpecs = [
    { pos: [0, -0.21, 0.17], rot: [-0.16, 0, 0], scale: [1.45, 1.65, 0.98], mat: M.beardCharcoal },
    { pos: [-0.076, -0.19, 0.145], rot: [-0.12, -0.25, -0.14], scale: [1.1, 1.55, 0.9], mat: M.beardCopperStreak },
    { pos: [0.076, -0.19, 0.145], rot: [-0.12, 0.25, 0.14], scale: [1.1, 1.55, 0.9], mat: M.beardCopperStreak },
    { pos: [-0.045, -0.30, 0.14], rot: [-0.20, -0.12, -0.08], scale: [0.85, 1.25, 0.75], mat: M.beardCharcoal },
    { pos: [0.045, -0.30, 0.14], rot: [-0.20, 0.12, 0.08], scale: [0.85, 1.25, 0.75], mat: M.beardCharcoal },
  ];
  beardSpecs.forEach((sp, i) => {
    const m = sculpt(head, lockGeo, sp.mat, sp.pos, sp.rot, sp.scale);
    beardLocks.push({ mesh: m, rx: sp.rot[0], phase: i * 0.7 });
  });

  for (const side of [-1, 1] as const) {
    sculpt(head, new THREE.CylinderGeometry(0.028, 0.025, 0.04, 14), M.divineGold, [side * 0.048, -0.26, 0.16], [-0.18, 0, side * 0.08]);
  }

  sculpt(head, new THREE.SphereGeometry(0.222, 24, 24), M.beardCharcoal, [0, 0.05, -0.02], [-0.08, 0, 0], [1.05, 1.03, 1.08]);

  const goggleBand = new THREE.TorusGeometry(0.214, 0.016, 10, 36);
  goggleBand.rotateX(Math.PI / 2);
  sculpt(head, goggleBand, M.apronLeather, [0, 0.11, 0.01], [0.18, 0, 0], [0.98, 1, 1.06]);

  for (const side of [-1, 1] as const) {
    const lensGroup = group(head, side * 0.068, 0.135, 0.195);
    lensGroup.rotation.set(-0.32, side * 0.24, 0);
    sculpt(lensGroup, new THREE.CylinderGeometry(0.042, 0.042, 0.032, 18), M.forgedBronze, [0, 0, 0], [Math.PI / 2, 0, 0]);
    sculpt(lensGroup, new THREE.CylinderGeometry(0.034, 0.034, 0.036, 16), M.magmaGlow, [0, 0, 0], [Math.PI / 2, 0, 0]);
  }

  // D. BRAÇOS COLOSSAIS + MANOPLA + MARTELO DIVINO
  function createSmithArm(isRight: boolean): HephaestusArmJoints {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.50, 0.34, -0.01);

    sculpt(arm, new THREE.SphereGeometry(0.168, 20, 20), M.skin, [0, -0.02, 0], [0, 0, s * -0.25], [1.08, 1.16, 1.08]);
    sculpt(arm, new THREE.CapsuleGeometry(0.112, 0.28, 12, 18), M.skin, [s * 0.028, -0.19, 0], [0, 0, s * 0.08]);
    sculpt(arm, new THREE.SphereGeometry(0.104, 16, 16), M.skin, [s * 0.02, -0.18, 0.054], [0, 0, s * 0.08], [0.96, 1.48, 0.96]);
    sculpt(arm, new THREE.SphereGeometry(0.10, 16, 16), M.skin, [s * 0.06, -0.19, -0.046], [0, 0, s * 0.08], [0.96, 1.42, 0.92]);

    const elbow = group(arm, s * 0.05, -0.38, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.104, 0.068, 0.34, 18), M.skin, [0, -0.16, 0], [0, 0, 0], [1.06, 1, 0.96]);

    const bracer = group(elbow, 0, -0.25, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.082, 0.072, 0.14, 24, 1, true), M.apronLeather, [0, 0, 0], [0, 0, 0], [1.06, 1, 0.97]);
    const bRing = new THREE.TorusGeometry(0.079, 0.008, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.divineGold, [0, 0.062, 0], [0, 0, 0], [1.06, 1, 0.97]);
    sculpt(bracer, bRing, M.divineGold, [0, -0.062, 0], [0, 0, 0], [1.06, 1, 0.97]);

    const hand = group(elbow, 0, -0.35, 0);
    sculpt(hand, new THREE.BoxGeometry(0.088, 0.095, 0.046), M.skin, [0, -0.02, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.013, 0.044, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.02;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.074, 0.022], [1.3, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.046, -0.038, 0.028], [0.65, 0, -s * 0.65], [1.15, 0.9, 1.15]);

    return { arm, elbow, hand };
  }

  const rightArm = createSmithArm(true);
  const leftArm = createSmithArm(false);

  const smithPauldron = group(leftArm.arm, -0.03, 0.05, 0);
  smithPauldron.rotation.set(0.06, 0.12, 0.34);
  for (let layer = 0; layer < 2; layer++) {
    sculpt(
      smithPauldron,
      new THREE.SphereGeometry(0.205 - layer * 0.018, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
      layer === 0 ? M.forgedBronze : M.divineGold,
      [0, 0.045 - layer * 0.048, 0],
      [0, 0, 0],
      [1.15, 0.78, 1.18]
    );
  }

  // E. O GRANDE MARTELO DIVINO DE HEFESTO
  const hammer = new THREE.Group();
  rightArm.hand.add(hammer);
  hammer.position.set(0, -0.045, 0.04);
  hammer.rotation.set(Math.PI / 2, 0, 0);

  sculpt(hammer, new THREE.CylinderGeometry(0.028, 0.034, 1.52, 16), M.blackSteel, [0, 0.35, 0]);
  for (const hy of [-0.28, 0.0, 0.25, 0.78]) {
    sculpt(hammer, new THREE.CylinderGeometry(0.038, 0.038, 0.045, 16), M.divineGold, [0, hy, 0]);
  }
  sculpt(hammer, new THREE.SphereGeometry(0.046, 14, 14), M.divineGold, [0, -0.42, 0]);

  const hammerHead = group(hammer, 0, 0.98, 0);
  sculpt(hammerHead, new THREE.BoxGeometry(0.56, 0.26, 0.26), M.blackSteel);
  sculpt(hammerHead, new THREE.BoxGeometry(0.06, 0.28, 0.28), M.divineGold, [-0.14, 0, 0]);
  sculpt(hammerHead, new THREE.BoxGeometry(0.06, 0.28, 0.28), M.divineGold, [0.14, 0, 0]);
  sculpt(hammerHead, new THREE.CylinderGeometry(0.145, 0.145, 0.05, 16), M.forgedBronze, [-0.29, 0, 0], [0, 0, Math.PI / 2]);
  sculpt(hammerHead, new THREE.CylinderGeometry(0.145, 0.145, 0.05, 16), M.forgedBronze, [0.29, 0, 0], [0, 0, Math.PI / 2]);
  sculpt(hammerHead, new THREE.OctahedronGeometry(0.085, 0), M.magmaGlow, [0, 0, 0.135], [0, 0, 0], [1.4, 0.9, 0.4]);
  sculpt(hammerHead, new THREE.OctahedronGeometry(0.085, 0), M.magmaGlow, [0, 0, -0.135], [0, 0, 0], [1.4, 0.9, 0.4]);

  const hammerImpactAnchor = group(hammerHead, 0, 0.15, 0);

  const tongs = new THREE.Group();
  leftArm.hand.add(tongs);
  tongs.position.set(0, -0.045, 0.04);
  tongs.rotation.set(Math.PI / 2, 0, 0);

  sculpt(tongs, new THREE.CylinderGeometry(0.014, 0.014, 0.72, 10), M.blackSteel, [-0.018, 0.18, 0], [0, 0, -0.04]);
  sculpt(tongs, new THREE.CylinderGeometry(0.014, 0.014, 0.72, 10), M.blackSteel, [0.018, 0.18, 0], [0, 0, 0.04]);
  sculpt(tongs, new THREE.CylinderGeometry(0.026, 0.026, 0.036, 12), M.divineGold, [0, 0.34, 0], [Math.PI / 2, 0, 0]);
  const hotIngot = sculpt(tongs, new THREE.BoxGeometry(0.12, 0.24, 0.065), M.magmaGlow, [0, 0.56, 0]);

  // F. AVENTAL PESADO DE COURO DO FERREIRO
  const garments = group(torso, 0, 0, 0);

  const apronStrap = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, 0.42, 0.14),
    new THREE.Vector3(-0.08, 0.16, 0.31),
    new THREE.Vector3(0.08, -0.14, 0.30),
    new THREE.Vector3(0.22, -0.36, 0.20),
  ]);
  const strapGeo = new THREE.TubeGeometry(apronStrap, 20, 0.036, 8, false);
  strapGeo.scale(1, 1, 0.42);
  sculpt(garments, strapGeo, M.apronLeather);

  const beltGeo = new THREE.TorusGeometry(0.31, 0.036, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.apronLeather, [0, -0.36, 0.01], [0.05, 0, -0.03], [1.14, 1, 0.86]);
  sculpt(garments, new THREE.CylinderGeometry(0.075, 0.075, 0.028, 16), M.divineGold, [0, -0.36, 0.275], [Math.PI / 2, 0, 0]);
  sculpt(garments, new THREE.OctahedronGeometry(0.034, 0), M.magmaGlow, [0, -0.36, 0.295]);

  const skirtGeo = new THREE.CylinderGeometry(0.31, 0.56, 0.88, 44, 16, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.44 - y) / 0.88));
    const pleat = Math.sin(angle * 10) * 0.025 * (0.2 + normY * 0.85);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.08;
    z = Math.sin(angle) * r * 0.85 - normY * 0.05;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.apronLeather, [0, -0.78, 0], [0.04, 0, 0]);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    hammer,
    hammerHead,
    hammerImpactAnchor,
    hotIngot,
    beardLocks,
    skirtMesh,
    skirtBase,
  };
}

export function animateHephaestus(
  hephaestus: HephaestusModel,
  dt: number,
  t: number,
  mode: 'forja' | 'martelo' | 'automato' | 'erupcao' = 'forja'
) {
  const breath = Math.sin(t * 2.2) * 0.025;
  hephaestus.body.position.y = 1.06 + breath;

  if (hephaestus.legs.L.kneeGear) {
    hephaestus.legs.L.kneeGear.rotation.x += dt * 1.4;
  }

  if (mode === 'martelo' || mode === 'forja') {
    const cycle = (t * (mode === 'martelo' ? 1.15 : 0.65)) % 1.0;

    if (cycle < 0.45) {
      const k = cycle / 0.45;
      hephaestus.rightArm.arm.rotation.set(-0.45 * k, 0.15, 2.35 * k);
      hephaestus.rightArm.elbow.rotation.set(0.65 * k, 0.15, 0.2);
      hephaestus.torso.rotation.x = -0.14 * k;
    } else if (cycle < 0.62) {
      const k = (cycle - 0.45) / 0.17;
      hephaestus.rightArm.arm.rotation.set(-0.45 + 0.85 * k, 0.15, 2.35 - 1.85 * k);
      hephaestus.rightArm.elbow.rotation.set(0.65 - 0.85 * k, 0.15, 0.2);
      hephaestus.torso.rotation.x = -0.14 + 0.34 * k;
    } else {
      const k = (cycle - 0.62) / 0.38;
      hephaestus.rightArm.arm.rotation.set(0.40 * (1 - k), 0.15, 0.50);
      hephaestus.rightArm.elbow.rotation.set(-0.20 * (1 - k) - 0.35 * k, 0.15, 0.2);
      hephaestus.torso.rotation.x = 0.20 * (1 - k);
    }

    hephaestus.leftArm.arm.rotation.set(-0.55, -0.3, -0.45);
    hephaestus.leftArm.elbow.rotation.set(-0.75, -0.2, 0.15);
  } else {
    // automato ou erupcao
    hephaestus.rightArm.arm.rotation.set(-0.38, 0.15, 2.32 + Math.sin(t * 2.2) * 0.04);
    hephaestus.rightArm.elbow.rotation.set(0.55, 0.2, 0.25);
    hephaestus.leftArm.arm.rotation.set(-0.35, -0.25, -0.68);
    hephaestus.leftArm.elbow.rotation.set(-0.75, -0.2, 0.15);
    hephaestus.torso.rotation.x = -0.05;
  }

  for (const b of hephaestus.beardLocks) {
    b.mesh.rotation.x = b.rx + Math.sin(t * 2.4 + b.phase) * 0.03;
  }

  const skAttr = hephaestus.skirtMesh.geometry.attributes.position;
  for (let i = 0; i < skAttr.count; i++) {
    const bx = hephaestus.skirtBase[i * 3];
    const by = hephaestus.skirtBase[i * 3 + 1];
    const bz = hephaestus.skirtBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.44 - by) / 0.88));
    skAttr.setZ(i, bz + Math.sin(t * 2.8 - normY * 3.5 + bx * 3.5) * 0.028 * normY);
  }
  skAttr.needsUpdate = true;
}
