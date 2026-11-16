import * as THREE from 'three';

export interface ArtemisTextures {
  skinBump: THREE.CanvasTexture;
  chitonTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createArtemisTextures(): ArtemisTextures {
  // 1. Bump map fino de pele lunar
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4800; i++) {
      const v = 124 + Math.floor(Math.random() * 10);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 2. Chiton Curto de Caçadora (Verde-Floresta Profundo com Meandro Grego em Prata e Azul-Lunar)
  const chitonCanvas = document.createElement('canvas');
  chitonCanvas.width = 512;
  chitonCanvas.height = 256;
  const cCtx = chitonCanvas.getContext('2d');
  if (cCtx) {
    const grad = cCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.68, '#065f46');
    grad.addColorStop(1, '#022c22');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, 512, 256);

    // Linho leve
    cCtx.fillStyle = 'rgba(209, 250, 229, 0.08)';
    for (let x = 0; x < 512; x += 8) cCtx.fillRect(x, 0, 3, 256);

    // Barra de Prata Lunar e Azul-Celeste
    cCtx.fillStyle = '#cbd5e1';
    cCtx.fillRect(0, 198, 512, 38);
    cCtx.fillStyle = '#38bdf8';
    cCtx.fillRect(0, 194, 512, 4);
    cCtx.fillRect(0, 236, 512, 4);

    cCtx.strokeStyle = '#0f172a';
    cCtx.lineWidth = 3;
    for (let x = 0; x < 512; x += 32) {
      cCtx.beginPath();
      cCtx.moveTo(x + 4, 229);
      cCtx.lineTo(x + 4, 205);
      cCtx.lineTo(x + 24, 205);
      cCtx.lineTo(x + 24, 223);
      cCtx.lineTo(x + 12, 223);
      cCtx.lineTo(x + 12, 213);
      cCtx.lineTo(x + 18, 213);
      cCtx.stroke();
    }
  }
  const chitonTex = new THREE.CanvasTexture(chitonCanvas);
  chitonTex.wrapS = chitonTex.wrapT = THREE.RepeatWrapping;

  return { skinBump, chitonTex };
}

let _cachedArtemisTex: ArtemisTextures | null = null;
export function getCachedArtemisTextures(): ArtemisTextures {
  if (!_cachedArtemisTex) _cachedArtemisTex = createArtemisTextures();
  return _cachedArtemisTex;
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

export interface ArtemisLegJoints {
  hip: THREE.Group;
  knee: THREE.Group;
  ankle: THREE.Group;
}

export interface ArtemisArmJoints {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

export interface ArtemisModel {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: ArtemisLegJoints;
    R: ArtemisLegJoints;
  };
  rightArm: ArtemisArmJoints;
  leftArm: ArtemisArmJoints;
  lunarGlaive: THREE.Group;
  glaiveOrb: THREE.Mesh;
  glaiveAnchor: THREE.Group;
  glaiveGlow: THREE.Mesh;
  leftOrbGlow: THREE.Mesh;
  ponytailGroup: THREE.Group;
  ponyStrands: Array<{ mesh: THREE.Mesh; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  cape: THREE.Mesh;
  capeBase: Float32Array;
  stagOrbitGroup: THREE.Group;
  stag: THREE.Group;
  stagLegs: Array<{ pivot: THREE.Group; phase: number }>;
}

export function createArtemisMaterials(textures: ArtemisTextures): Record<string, THREE.Material> {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xe6b898,
      roughness: 0.35,
      metalness: 0.05,
      bumpMap: textures.skinBump,
      bumpScale: 0.0022,
    }),
    lipRose: new THREE.MeshStandardMaterial({
      color: 0xd96b78,
      roughness: 0.28,
      metalness: 0.04,
    }),
    hairSilverMoon: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      emissive: new THREE.Color(0x1e3a8a),
      emissiveIntensity: 0.22,
      roughness: 0.30,
      metalness: 0.22,
    }),
    hairIceHighlight: new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.26,
      roughness: 0.28,
      metalness: 0.25,
    }),
    silverPolished: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: new THREE.Color(0x1e293b),
      emissiveIntensity: 0.25,
      metalness: 0.95,
      roughness: 0.14,
    }),
    moonBronze: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: new THREE.Color(0x0f172a),
      emissiveIntensity: 0.2,
      metalness: 0.88,
      roughness: 0.24,
    }),
    moonCore: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 3.6,
      roughness: 0.08,
    }),
    leatherForest: new THREE.MeshStandardMaterial({
      color: 0x3f2312,
      roughness: 0.65,
      metalness: 0.08,
    }),
    hunterChiton: new THREE.MeshStandardMaterial({
      map: textures.chitonTex,
      color: 0xffffff,
      roughness: 0.52,
      metalness: 0.06,
      side: THREE.DoubleSide,
    }),
    forestCloak: new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: new THREE.Color(0x022c22),
      emissiveIntensity: 0.32,
      roughness: 0.50,
      metalness: 0.12,
      side: THREE.DoubleSide,
    }),
    eyeWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xe2e8f0),
      emissiveIntensity: 0.25,
      roughness: 0.08,
    }),
    eyeMoonSilver: new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 2.8,
      roughness: 0.06,
    }),
    eyePupil: new THREE.MeshStandardMaterial({
      color: 0x082f49,
      roughness: 0.1,
    }),
    stagIvory: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: new THREE.Color(0xbae6fd),
      emissiveIntensity: 0.38,
      roughness: 0.35,
      metalness: 0.15,
    }),
  };
}

export function buildArtemis(textures: ArtemisTextures): ArtemisModel {
  const M = createArtemisMaterials(textures);

  const root = new THREE.Group();
  const body = group(root, 0, 1.12, 0);

  // ------------------------------------------------------------------------
  // A. PELVE E PERNAS ÁGEIS DE CAÇADORA + BOTAS ALTAS DE PRATA E COURO
  // ------------------------------------------------------------------------
  const pelvis = group(body, 0, 0.90, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.22, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.08, 0.78, 0.82]);

  const legs: Record<'L' | 'R', ArtemisLegJoints> = {} as any;
  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.135, -0.04, 0);

    // Coxa esguia e atlética
    sculpt(hip, new THREE.CylinderGeometry(0.128, 0.088, 0.52, 20), M.skin, [0, -0.25, 0], [0, 0, 0], [1.0, 1, 1.06]);
    sculpt(hip, new THREE.SphereGeometry(0.098, 16, 16), M.skin, [s * 0.015, -0.21, 0.042], [0, 0, 0], [0.92, 1.8, 0.85]);

    // Joelho
    sculpt(hip, new THREE.SphereGeometry(0.076, 16, 16), M.skin, [0, -0.52, 0.014]);

    // Botas altas de caçadora olímpica em couro escuro e grevas de prata lunar
    const knee = group(hip, 0, -0.53, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.080, 0.050, 0.48, 18), M.leatherForest, [0, -0.24, 0]);
    sculpt(knee, new THREE.CylinderGeometry(0.082, 0.054, 0.36, 16, 1, false, -0.85, 1.7), M.silverPolished, [0, -0.24, 0.008]);
    sculpt(knee, new THREE.TorusGeometry(0.036, 0.007, 8, 20, Math.PI * 1.25), M.silverPolished, [0, -0.03, 0.076], [0, 0, -0.4]);

    const ankle = group(knee, 0, -0.48, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.082, 0.048, 0.20), M.leatherForest, [0, -0.02, 0.035], [0.18, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.088, 0.015, 0.21), M.silverPolished, [0, -0.044, 0.035], [0.18, 0, 0]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.34, -0.08, -0.05);
  legs.L.knee.rotation.set(0.50, 0, 0);
  legs.R.hip.rotation.set(0.20, 0.08, 0.05);
  legs.R.knee.rotation.set(0.24, 0, 0);

  // ------------------------------------------------------------------------
  // B. TRONCO ATLÉTICO FEMININO + PEITORAL LEVE DE PRATA LUNAR
  // ------------------------------------------------------------------------
  const torso = group(body, 0, 1.34, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.225, -0.40),
    new THREE.Vector2(0.172, -0.18),
    new THREE.Vector2(0.212, 0.04),
    new THREE.Vector2(0.280, 0.26),
    new THREE.Vector2(0.250, 0.41),
    new THREE.Vector2(0.112, 0.48),
    new THREE.Vector2(0.01, 0.49),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.14, 1.02, 0.72]);

  const tunicBodice = new THREE.LatheGeometry([
    new THREE.Vector2(0.01, -0.34),
    new THREE.Vector2(0.195, -0.30),
    new THREE.Vector2(0.180, -0.14),
    new THREE.Vector2(0.220, 0.06),
    new THREE.Vector2(0.285, 0.25),
    new THREE.Vector2(0.220, 0.34),
    new THREE.Vector2(0.01, 0.34),
  ], 36);
  sculpt(torso, tunicBodice, M.hunterChiton, [0, 0.02, 0], [0, 0, 0], [1.15, 1.0, 0.76]);

  const bustPlateGeo = new THREE.SphereGeometry(0.13, 20, 20);
  sculpt(torso, bustPlateGeo, M.silverPolished, [-0.112, 0.20, 0.132], [0.1, -0.2, 0], [0.94, 0.90, 0.76]);
  sculpt(torso, bustPlateGeo, M.silverPolished, [0.112, 0.20, 0.132], [0.1, 0.2, 0], [0.94, 0.90, 0.76]);

  const chestMoon = new THREE.TorusGeometry(0.045, 0.011, 8, 24, Math.PI * 1.35);
  sculpt(torso, chestMoon, M.moonCore, [0, 0.17, 0.225], [0, 0, -0.45]);

  sculpt(torso, new THREE.CylinderGeometry(0.086, 0.108, 0.25, 20), M.skin, [0, 0.51, -0.005], [0.06, 0, 0]);

  // ------------------------------------------------------------------------
  // C. ROSTO DE CAÇADORA DIVINA + DIADEMA DE LUA CRESCENTE + RABO DE CAVALO PRATEADO
  // ------------------------------------------------------------------------
  const head = group(torso, 0, 0.72, 0.032);

  const skullGeo = new THREE.SphereGeometry(0.182, 40, 40);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.15;
    x *= 0.88;
    if (y < 0.02 && y > -0.06 && z > 0) { x *= 1.03; z *= 1.04; }
    if (y <= -0.06 && z > -0.02) {
      const chinTaper = Math.max(0.55, 1.0 - ((-0.06 - y) / 0.15) * 0.42);
      x *= chinTaper;
      z *= 1.02;
    }
    if (z < -0.10) z *= 0.94;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  const cheekGeo = new THREE.SphereGeometry(0.041, 16, 16);
  sculpt(head, cheekGeo, M.skin, [-0.061, -0.015, 0.142], [0, -0.3, 0], [1.08, 0.82, 0.62]);
  sculpt(head, cheekGeo, M.skin, [0.061, -0.015, 0.142], [0, 0.3, 0], [1.08, 0.82, 0.62]);

  sculpt(head, new THREE.BoxGeometry(0.017, 0.068, 0.036), M.skin, [0, 0.002, 0.174], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.014, 14, 14), M.skin, [0, -0.031, 0.186], [0, 0, 0], [0.92, 0.8, 0.96]);

  const browGeo = new THREE.CapsuleGeometry(0.0052, 0.052, 8, 12);
  sculpt(head, browGeo, M.moonBronze, [-0.048, 0.046, 0.168], [0.1, 0.25, 1.40]);
  sculpt(head, browGeo, M.moonBronze, [0.048, 0.046, 0.168], [0.1, -0.25, -1.40]);

  for (const side of [-1, 1] as const) {
    const eyeGroup = group(head, side * 0.048, 0.018, 0.158);
    eyeGroup.rotation.y = side * 0.18;

    sculpt(eyeGroup, new THREE.SphereGeometry(0.021, 16, 16), M.eyeWhite, [0, 0, 0], [0, 0, 0], [1.16, 0.88, 0.65]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.0145, 16, 16), M.eyeMoonSilver, [-side * 0.002, -0.001, 0.009], [0, 0, 0], [0.95, 1.06, 0.55]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.0075, 12, 12), M.eyePupil, [-side * 0.002, -0.001, 0.014], [0, 0, 0], [0.9, 1.05, 0.5]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.004, 8, 8), M.eyeWhite, [-side * 0.006, 0.005, 0.016]);
    sculpt(eyeGroup, new THREE.BoxGeometry(0.048, 0.006, 0.018), M.moonBronze, [0, 0.014, 0.008], [0.12, 0, side * -0.08]);
  }

  sculpt(head, new THREE.CapsuleGeometry(0.0072, 0.028, 8, 12), M.lipRose, [0, -0.072, 0.172], [0, 0, Math.PI / 2], [1, 1, 0.75]);
  sculpt(head, new THREE.CapsuleGeometry(0.0086, 0.024, 8, 12), M.lipRose, [0, -0.082, 0.170], [0, 0, Math.PI / 2], [1, 1, 0.8]);

  // Cabelos prateados
  sculpt(head, new THREE.SphereGeometry(0.188, 28, 28), M.hairSilverMoon, [0, 0.032, -0.016], [-0.08, 0, 0], [0.96, 1.06, 1.05]);

  for (const side of [-1, 1] as const) {
    const frontLockPts = [
      new THREE.Vector3(side * 0.06, 0.14, 0.135),
      new THREE.Vector3(side * 0.145, 0.05, 0.115),
      new THREE.Vector3(side * 0.162, -0.08, 0.105),
      new THREE.Vector3(side * 0.145, -0.22, 0.115),
    ];
    sculpt(head, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(frontLockPts), 14, 0.022, 8, false), M.hairIceHighlight);
  }

  const ponytailGroup = group(head, 0, 0.12, -0.175);
  sculpt(ponytailGroup, new THREE.CylinderGeometry(0.036, 0.032, 0.045, 16), M.silverPolished, [0, 0, 0], [0.55, 0, 0]);

  const ponyStrands: Array<{ mesh: THREE.Mesh; phase: number }> = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const ox = Math.cos(a) * 0.022;
    const oy = Math.sin(a) * 0.022;
    const len = 0.62 + (i % 3) * 0.07;
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const spread = 1 + t * 2.4;
      pts.push(new THREE.Vector3(
        ox * spread + Math.sin(t * Math.PI * 2.2 + i) * 0.028,
        oy * spread - t * len + Math.sin(t * Math.PI) * 0.12,
        -t * 0.32
      ));
    }
    const strand = sculpt(
      ponytailGroup,
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.024 * (1 - 0.15 * (i % 2)), 8, false),
      i % 2 === 0 ? M.hairSilverMoon : M.hairIceHighlight
    );
    ponyStrands.push({ mesh: strand, phase: i * 0.42 });
  }

  // Diadema de Lua Crescente de Prata
  const moonDiadem = group(head, 0, 0.118, 0.012);
  moonDiadem.rotation.x = 0.16;
  const diademBand = new THREE.TorusGeometry(0.182, 0.0085, 10, 36, Math.PI * 1.45);
  diademBand.rotateX(Math.PI / 2);
  diademBand.rotateY(-Math.PI * 0.225);
  sculpt(moonDiadem, diademBand, M.silverPolished, [0, 0, 0], [0, 0, 0], [0.95, 1, 1.05]);
  const crescentCrown = new THREE.TorusGeometry(0.044, 0.010, 10, 28, Math.PI * 1.38);
  sculpt(moonDiadem, crescentCrown, M.moonCore, [0, 0.048, 0.186], [-0.15, 0, -0.58]);

  // ------------------------------------------------------------------------
  // D. BRAÇOS ATLÉTICOS E BRACELETES LUNARES DE PRATA
  // ------------------------------------------------------------------------
  function createArtemisArm(isRight: boolean): ArtemisArmJoints {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.34, 0.33, -0.005);

    sculpt(
      arm,
      new THREE.SphereGeometry(0.105, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.46),
      M.silverPolished,
      [s * 0.01, 0.025, 0],
      [0, 0, s * -0.25],
      [1.06, 0.74, 1.1]
    );

    sculpt(arm, new THREE.SphereGeometry(0.094, 18, 18), M.skin, [0, -0.01, 0]);
    sculpt(arm, new THREE.CapsuleGeometry(0.064, 0.26, 12, 16), M.skin, [s * 0.018, -0.17, 0], [0, 0, s * 0.06]);

    const elbow = group(arm, s * 0.032, -0.34, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.062, 0.042, 0.31, 18), M.skin, [0, -0.15, 0]);

    const bracer = group(elbow, 0, -0.21, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.056, 0.046, 0.14, 20, 1, true), M.leatherForest);
    const bRing = new THREE.TorusGeometry(0.054, 0.005, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.silverPolished, [0, 0.065, 0]);
    sculpt(bracer, bRing, M.silverPolished, [0, -0.065, 0]);

    const hand = group(elbow, 0, -0.32, 0);
    sculpt(hand, new THREE.BoxGeometry(0.056, 0.066, 0.028), M.skin, [0, -0.015, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.0085, 0.034, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.014;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.052, 0.015], [1.1, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.032, -0.025, 0.018], [0.55, 0, -s * 0.6], [1.05, 0.9, 1.05]);

    return { arm, elbow, hand };
  }

  const rightArm = createArtemisArm(true);
  const leftArm = createArtemisArm(false);

  // ------------------------------------------------------------------------
  // E. GLAIVE / FOICE CRESCENTE LUNAR DE DUAS LÂMINAS (NA MÃO DIREITA)
  // ------------------------------------------------------------------------
  const lunarGlaive = new THREE.Group();
  rightArm.hand.add(lunarGlaive);
  lunarGlaive.position.set(0, -0.035, 0.03);

  sculpt(lunarGlaive, new THREE.CylinderGeometry(0.019, 0.021, 2.82, 16), M.moonBronze, [0, 0.16, 0]);
  for (const gy of [-0.45, -0.10, 0.25, 1.38]) {
    sculpt(lunarGlaive, new THREE.CylinderGeometry(0.025, 0.025, 0.038, 16), M.silverPolished, [0, gy, 0]);
  }

  const lowerBlade = new THREE.TorusGeometry(0.14, 0.016, 8, 24, Math.PI * 1.15);
  sculpt(lunarGlaive, lowerBlade, M.silverPolished, [0, -1.28, 0], [0, 0, Math.PI * 0.42], [0.85, 1.15, 0.35]);

  const glaiveHead = group(lunarGlaive, 0, 1.54, 0);
  sculpt(glaiveHead, new THREE.CylinderGeometry(0.036, 0.024, 0.12, 14), M.silverPolished, [0, 0.04, 0]);

  const glaiveOrb = sculpt(glaiveHead, new THREE.OctahedronGeometry(0.068, 1), M.moonCore, [0, 0.28, 0], [0, 0, 0], [0.85, 1.15, 0.85]);

  const mainCrescent = new THREE.TorusGeometry(0.34, 0.032, 10, 36, Math.PI * 1.32);
  sculpt(glaiveHead, mainCrescent, M.silverPolished, [0.06, 0.30, 0], [0, 0, -Math.PI * 0.66], [1.05, 1.25, 0.28]);

  const edgeCrescent = new THREE.TorusGeometry(0.365, 0.011, 8, 36, Math.PI * 1.25);
  sculpt(glaiveHead, edgeCrescent, M.moonCore, [0.06, 0.30, 0], [0, 0, -Math.PI * 0.625], [1.05, 1.25, 0.22]);

  const glaiveAnchor = group(glaiveHead, 0.28, 0.30, 0);
  const glaiveGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
  );
  glaiveAnchor.add(glaiveGlow);

  const leftOrbGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  leftOrbGlow.position.set(0, -0.055, 0.035);
  leftArm.hand.add(leftOrbGlow);

  // ------------------------------------------------------------------------
  // F. VESTIMENTA DE CAÇADORA (CHITON CURTO VERDE-FLORESTA E MANTO LUNAR)
  // ------------------------------------------------------------------------
  const garments = group(torso, 0, 0, 0);

  const beltGeo = new THREE.TorusGeometry(0.21, 0.018, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.leatherForest, [0, -0.18, 0.005], [0.04, 0, 0], [1.14, 1, 0.78]);
  sculpt(garments, new THREE.TorusGeometry(0.032, 0.008, 8, 20, Math.PI * 1.35), M.silverPolished, [0, -0.18, 0.175], [0, 0, -0.5]);

  const skirtGeo = new THREE.CylinderGeometry(0.21, 0.44, 0.62, 48, 18, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.31 - y) / 0.62));
    const pleat = Math.sin(angle * 18) * 0.022 * (0.2 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.06;
    z = Math.sin(angle) * r * 0.84 - normY * 0.06;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.hunterChiton, [0, -0.48, 0], [0.03, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.26, 1.62, 24, 30);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.81 - y) / 1.62));
    const archZ = -0.15 - Math.cos((x / 0.63) * Math.PI * 0.5) * 0.07;
    const z = archZ - normY * 0.46;
    const fx = x * (0.58 + normY * 0.75);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.forestCloak, [0, -0.36, -0.04]);

  // ------------------------------------------------------------------------
  // G. CORÇA SAGRADA DE PRATA (COMPANHEIRA ESPIRITUAL ORBITANDO AO REDOR)
  // ------------------------------------------------------------------------
  const stagOrbitGroup = new THREE.Group();
  root.add(stagOrbitGroup);

  const stag = new THREE.Group();
  stagOrbitGroup.add(stag);

  sculpt(stag, new THREE.CylinderGeometry(0.11, 0.12, 0.52, 16), M.stagIvory, [0, 0.52, 0], [Math.PI / 2, 0, 0], [0.85, 1, 1.15]);
  sculpt(stag, new THREE.CylinderGeometry(0.055, 0.085, 0.34, 14), M.stagIvory, [0, 0.72, 0.24], [0.42, 0, 0]);
  const stagHead = group(stag, 0, 0.88, 0.34);
  sculpt(stagHead, new THREE.SphereGeometry(0.075, 14, 14), M.stagIvory, [0, 0, 0], [0.2, 0, 0], [0.82, 0.9, 1.35]);
  sculpt(stagHead, new THREE.SphereGeometry(0.014, 8, 8), M.moonCore, [-0.048, 0.015, 0.03]);
  sculpt(stagHead, new THREE.SphereGeometry(0.014, 8, 8), M.moonCore, [0.048, 0.015, 0.03]);

  for (const side of [-1, 1] as const) {
    const antlerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.03, 0.05, -0.01),
      new THREE.Vector3(side * 0.09, 0.18, -0.04),
      new THREE.Vector3(side * 0.12, 0.32, 0.02),
      new THREE.Vector3(side * 0.08, 0.42, 0.06),
    ]);
    sculpt(stagHead, new THREE.TubeGeometry(antlerCurve, 14, 0.009, 6, false), M.silverPolished);
    sculpt(stagHead, new THREE.ConeGeometry(0.008, 0.11, 5), M.moonCore, [side * 0.09, 0.23, 0.03], [0.55, 0, side * -0.3]);
    sculpt(stagHead, new THREE.ConeGeometry(0.008, 0.11, 5), M.moonCore, [side * 0.12, 0.33, -0.02], [-0.45, 0, side * -0.4]);
  }

  const stagLegs: Array<{ pivot: THREE.Group; phase: number }> = [];
  const legOffsets = [
    [-0.07, 0.42, 0.18],
    [0.07, 0.42, 0.18],
    [-0.07, 0.42, -0.18],
    [0.07, 0.42, -0.18],
  ];
  legOffsets.forEach(([lx, ly, lz], idx) => {
    const sl = group(stag, lx, ly, lz);
    sculpt(sl, new THREE.CylinderGeometry(0.024, 0.014, 0.42, 10), M.stagIvory, [0, -0.21, 0]);
    stagLegs.push({ pivot: sl, phase: idx * Math.PI * 0.5 });
  });

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    lunarGlaive,
    glaiveOrb,
    glaiveAnchor,
    glaiveGlow,
    leftOrbGlow,
    ponytailGroup,
    ponyStrands,
    skirtMesh,
    skirtBase,
    cape,
    capeBase,
    stagOrbitGroup,
    stag,
    stagLegs,
  };
}

export function animateArtemis(
  artemis: ArtemisModel,
  dt: number,
  t: number,
  mode: 'vigilia' | 'cacada' | 'raizes' | 'alcateia' = 'vigilia'
) {
  let pitch = 0.04;
  let roll = 0;
  const hoverY = Math.sin(t * 1.7) * 0.08;

  if (mode === 'cacada') {
    pitch = 0.22;
    roll = -0.26;
  }

  artemis.body.position.y = 1.12 + hoverY;
  artemis.body.rotation.set(pitch, 0, roll);

  // Braços e Foice Lunar
  if (mode === 'raizes') {
    const sweep = t * 3.2;
    artemis.rightArm.arm.rotation.set(-0.65 + Math.sin(sweep) * 0.45, 0.25, 1.35 + Math.cos(sweep) * 0.4);
    artemis.rightArm.elbow.rotation.set(-0.35, 0.2, 0.2);
    artemis.lunarGlaive.rotation.set(0.85, sweep * 0.5, -0.3);

    artemis.leftArm.arm.rotation.set(-0.85, -0.35, -0.75);
    artemis.leftArm.elbow.rotation.set(-0.45, -0.2, 0.15);
  } else if (mode === 'alcateia') {
    artemis.rightArm.arm.rotation.set(-0.45, 0.15, 2.38 + Math.sin(t * 2.2) * 0.04);
    artemis.rightArm.elbow.rotation.set(0.55, 0.2, 0.25);
    artemis.lunarGlaive.rotation.set(0.20, 0, -0.22);

    artemis.leftArm.arm.rotation.set(-0.45, -0.25, -0.85 + Math.cos(t * 2) * 0.05);
    artemis.leftArm.elbow.rotation.set(-0.55, -0.15, 0.15);
  } else if (mode === 'cacada') {
    artemis.rightArm.arm.rotation.set(0.38, 0.15, 0.72);
    artemis.rightArm.elbow.rotation.set(-0.45, 0.1, 0.22);
    artemis.lunarGlaive.rotation.set(0.95, 0.1, -0.35);

    artemis.leftArm.arm.rotation.set(-0.35, -0.25, -0.68);
    artemis.leftArm.elbow.rotation.set(-0.62, -0.2, 0.15);
  } else {
    // Vigília Lunar
    artemis.rightArm.arm.rotation.set(-0.18, 0.12, 0.55 + Math.sin(t * 1.4) * 0.025);
    artemis.rightArm.elbow.rotation.set(-0.52, 0.15, 0.22);
    artemis.lunarGlaive.rotation.set(0.18, 0, -0.45);

    artemis.leftArm.arm.rotation.set(-0.28, -0.22, -0.64 + Math.cos(t * 1.4) * 0.03);
    artemis.leftArm.elbow.rotation.set(-0.68, -0.2, 0.18);
  }

  // Corça Sagrada de Prata
  const stagSpeed = (mode === 'cacada') ? 1.85 : 1.05;
  const stagRadius = (mode === 'cacada') ? 1.55 : 1.18;
  const stagAng = t * stagSpeed + 1.2;
  artemis.stagOrbitGroup.position.set(
    Math.cos(stagAng) * stagRadius,
    0.05 + Math.abs(Math.sin(t * 7.5)) * 0.12,
    Math.sin(stagAng) * stagRadius
  );
  artemis.stagOrbitGroup.rotation.y = -stagAng;
  for (const sl of artemis.stagLegs) {
    sl.pivot.rotation.x = Math.sin(t * 7.5 + sl.phase) * 0.45;
  }

  // Brilho da foice e orbes
  const powerBoost = (mode === 'raizes' || mode === 'alcateia') ? 1.45 : 1.0;
  artemis.glaiveOrb.rotation.y += dt * 3.0;
  artemis.glaiveGlow.scale.setScalar((0.9 + Math.sin(t * 14) * 0.2) * powerBoost);
  artemis.leftOrbGlow.scale.setScalar((0.85 + Math.cos(t * 12) * 0.18) * powerBoost);

  // Rabo de cavalo
  const wind = (mode === 'cacada' || mode === 'alcateia') ? 1.85 : 1.0;
  artemis.ponytailGroup.rotation.x = Math.sin(t * 2.6 * wind) * 0.08;
  for (const ps of artemis.ponyStrands) {
    ps.mesh.rotation.y = Math.sin(t * 3.0 * wind + ps.phase) * 0.045;
  }

  // Deformação da capa e saiote ao vento
  const skPos = artemis.skirtMesh.geometry.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    const bx = artemis.skirtBase[i * 3];
    const by = artemis.skirtBase[i * 3 + 1];
    const bz = artemis.skirtBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.31 - by) / 0.62));
    const wave = Math.sin(t * 4.0 * wind + by * 8 + bx * 4) * 0.02 * normY;
    skPos.setXYZ(i, bx + wave * 0.5, by, bz + wave);
  }
  artemis.skirtMesh.geometry.attributes.position.needsUpdate = true;

  const cPos = artemis.cape.geometry.attributes.position;
  for (let i = 0; i < cPos.count; i++) {
    const bx = artemis.capeBase[i * 3];
    const by = artemis.capeBase[i * 3 + 1];
    const bz = artemis.capeBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.81 - by) / 1.62));
    const flutter = Math.sin(t * 5.2 * wind + bx * 6 + by * 4) * 0.06 * normY;
    cPos.setXYZ(i, bx, by, bz - flutter - normY * (mode === 'cacada' ? 0.35 : 0.08));
  }
  artemis.cape.geometry.attributes.position.needsUpdate = true;
}
