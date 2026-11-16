import * as THREE from 'three';

export interface HermesTextures {
  skinBump: THREE.CanvasTexture;
  chitonTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createHermesTextures(): HermesTextures {
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5500; i++) {
      const v = 123 + Math.floor(Math.random() * 12);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  const chitonCanvas = document.createElement('canvas');
  chitonCanvas.width = 512;
  chitonCanvas.height = 256;
  const cCtx = chitonCanvas.getContext('2d');
  if (cCtx) {
    const grad = cCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.68, '#fef3c7');
    grad.addColorStop(1, '#e0f2fe');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, 512, 256);

    cCtx.fillStyle = 'rgba(14, 116, 144, 0.08)';
    for (let x = 0; x < 512; x += 10) cCtx.fillRect(x, 0, 3, 256);

    cCtx.fillStyle = '#0d9488';
    cCtx.fillRect(0, 196, 512, 42);
    cCtx.fillStyle = '#facc15';
    cCtx.fillRect(0, 192, 512, 5);
    cCtx.fillRect(0, 238, 512, 5);

    cCtx.strokeStyle = '#fef08a';
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

let cachedHermesTextures: HermesTextures | null = null;
export function getCachedHermesTextures(): HermesTextures {
  if (!cachedHermesTextures) {
    cachedHermesTextures = createHermesTextures();
  }
  return cachedHermesTextures;
}

export interface HermesMaterials {
  skin: THREE.MeshStandardMaterial;
  skinShade: THREE.MeshStandardMaterial;
  hairGoldBrown: THREE.MeshStandardMaterial;
  hairHighlight: THREE.MeshStandardMaterial;
  goldPolished: THREE.MeshStandardMaterial;
  bronzeTraveler: THREE.MeshStandardMaterial;
  leatherBelt: THREE.MeshStandardMaterial;
  wingIvory: THREE.MeshStandardMaterial;
  wingGoldTip: THREE.MeshStandardMaterial;
  turquoiseGem: THREE.MeshStandardMaterial;
  emeraldEye: THREE.MeshStandardMaterial;
  eyeGoldSky: THREE.MeshStandardMaterial;
  chiton: THREE.MeshStandardMaterial;
  chlamysCloak: THREE.MeshStandardMaterial;
}

function createMaterials(textures: HermesTextures): HermesMaterials {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xd69b6e,
      roughness: 0.38,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.003,
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0xc08256,
      roughness: 0.42,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.003,
    }),
    hairGoldBrown: new THREE.MeshStandardMaterial({
      color: 0x92541e,
      emissive: new THREE.Color(0x241102),
      emissiveIntensity: 0.15,
      roughness: 0.36,
      metalness: 0.15,
    }),
    hairHighlight: new THREE.MeshStandardMaterial({
      color: 0xd99b38,
      emissive: new THREE.Color(0x331d03),
      emissiveIntensity: 0.18,
      roughness: 0.32,
      metalness: 0.2,
    }),
    goldPolished: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0x422006),
      emissiveIntensity: 0.24,
      metalness: 0.92,
      roughness: 0.18,
    }),
    bronzeTraveler: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: new THREE.Color(0x291102),
      emissiveIntensity: 0.2,
      metalness: 0.86,
      roughness: 0.26,
    }),
    leatherBelt: new THREE.MeshStandardMaterial({
      color: 0x5c2d16,
      roughness: 0.65,
      metalness: 0.1,
    }),
    wingIvory: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xfef9c3),
      emissiveIntensity: 0.22,
      roughness: 0.35,
      metalness: 0.12,
    }),
    wingGoldTip: new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: new THREE.Color(0x713f12),
      emissiveIntensity: 0.28,
      metalness: 0.88,
      roughness: 0.2,
    }),
    turquoiseGem: new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: new THREE.Color(0x0d9488),
      emissiveIntensity: 2.6,
      roughness: 0.1,
      metalness: 0.3,
    }),
    emeraldEye: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: new THREE.Color(0x059669),
      emissiveIntensity: 2.8,
      roughness: 0.08,
    }),
    eyeGoldSky: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 2.8,
      roughness: 0.08,
    }),
    chiton: new THREE.MeshStandardMaterial({
      map: textures.chitonTex,
      color: 0xffffff,
      roughness: 0.52,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
    chlamysCloak: new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      emissive: new THREE.Color(0x042f2e),
      emissiveIntensity: 0.32,
      roughness: 0.46,
      metalness: 0.14,
      side: THREE.DoubleSide,
    }),
  };
}

function group(parent: THREE.Group | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Group | null,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1]
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

function buildWingPair(
  parent: THREE.Group,
  matPrimary: THREE.Material,
  matTip: THREE.Material,
  scale = 1.0
): { left: THREE.Group; right: THREE.Group } {
  const pair: { left: THREE.Group; right: THREE.Group } = { left: null as any, right: null as any };
  for (const side of [-1, 1] as const) {
    const pivot = group(parent, side * 0.02, 0, 0);
    for (let f = 0; f < 5; f++) {
      const t = f / 4;
      const len = (0.28 - t * 0.09) * scale;
      const feather = sculpt(
        pivot,
        new THREE.ConeGeometry(0.022 * scale, len, 6),
        f < 2 ? matTip : matPrimary,
        [side * (len * 0.45), (0.04 - t * 0.045) * scale, -t * 0.03 * scale],
        [-0.25, side * -0.22, side * (-1.35 + t * 0.35)],
        [0.42, 1, 1]
      );
      feather.castShadow = true;
    }
    if (side === -1) pair.left = pivot;
    else pair.right = pivot;
  }
  return pair;
}

export interface HermesParts {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  caduceus: THREE.Group;
  caduceusCrystal: THREE.Mesh;
  caduceusHalo: THREE.Mesh;
  caduceusAnchor: THREE.Group;
  caduceusGlow: THREE.Mesh;
  petasosWings: { left: THREE.Group; right: THREE.Group };
  talariaWings: Array<{ left: THREE.Group; right: THREE.Group }>;
  caduceusWings: { left: THREE.Group; right: THREE.Group };
  hairCurls: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  cape: THREE.Mesh;
  capeBase: Float32Array;
}

export function buildHermes(textures: HermesTextures): HermesParts {
  const M = createMaterials(textures);

  const root = new THREE.Group();
  const body = group(root, 0, 1.12, 0);

  // A. Pelve e Pernas
  const pelvis = group(body, 0, 0.90, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.225, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.06, 0.76, 0.80]);

  const legs: HermesParts['legs'] = {
    L: {} as any,
    R: {} as any,
  };
  const talariaWings: HermesParts['talariaWings'] = [];

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.145, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.132, 0.092, 0.50, 20), M.skin, [0, -0.24, 0], [0, 0, 0], [1.0, 1, 1.06]);
    const quadGeo = new THREE.SphereGeometry(0.102, 16, 16);
    sculpt(hip, quadGeo, M.skin, [s * 0.018, -0.21, 0.046], [0, 0, 0], [0.94, 1.82, 0.86]);

    sculpt(hip, new THREE.SphereGeometry(0.082, 16, 16), M.skin, [0, -0.50, 0.014]);

    const knee = group(hip, 0, -0.51, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.084, 0.050, 0.46, 18), M.skin, [0, -0.23, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.08, 16, 16), M.skin, [0, -0.15, -0.035], [0, 0, 0], [0.96, 1.65, 0.95]);

    sculpt(knee, new THREE.CylinderGeometry(0.078, 0.054, 0.28, 16, 1, false, -0.8, 1.6), M.goldPolished, [0, -0.26, 0.008]);

    const ankle = group(knee, 0, -0.46, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.086, 0.046, 0.21), M.skin, [0, -0.02, 0.038], [0.26, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.094, 0.015, 0.224), M.goldPolished, [0, -0.044, 0.038], [0.26, 0, 0]);

    const strap = new THREE.TorusGeometry(0.056, 0.0055, 8, 20);
    strap.rotateX(Math.PI / 2);
    for (let k = 0; k < 3; k++) {
      sculpt(ankle, strap, k === 1 ? M.leatherBelt : M.goldPolished, [0, 0.02 + k * 0.042, -0.02], [0.12, 0, 0]);
    }

    const ankleWingsMount = group(ankle, 0, 0.05, -0.02);
    const wPair = buildWingPair(ankleWingsMount, M.wingIvory, M.wingGoldTip, 0.85);
    talariaWings.push(wPair);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.42, -0.06, -0.04);
  legs.L.knee.rotation.set(0.62, 0, 0);
  legs.R.hip.rotation.set(0.24, 0.06, 0.05);
  legs.R.knee.rotation.set(0.28, 0, 0);

  // B. Tronco
  const torso = group(body, 0, 1.32, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.43),
    new THREE.Vector2(0.23, -0.39),
    new THREE.Vector2(0.20, -0.19),
    new THREE.Vector2(0.25, 0.03),
    new THREE.Vector2(0.35, 0.26),
    new THREE.Vector2(0.31, 0.42),
    new THREE.Vector2(0.135, 0.49),
    new THREE.Vector2(0.01, 0.50),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.14, 1.02, 0.70]);

  const pecGeo = new THREE.SphereGeometry(0.195, 22, 22);
  sculpt(torso, pecGeo, M.skin, [-0.165, 0.22, 0.15], [0.12, -0.22, -0.14], [1.04, 0.85, 0.56]);
  sculpt(torso, pecGeo, M.skin, [0.165, 0.22, 0.15], [0.12, 0.22, 0.14], [1.04, 0.85, 0.56]);

  const abGeo = new THREE.SphereGeometry(0.078, 14, 14);
  [
    { y: 0.04, sx: 0.96, sy: 0.75, z: 0.192 },
    { y: -0.075, sx: 0.92, sy: 0.78, z: 0.188 },
    { y: -0.19, sx: 0.84, sy: 0.84, z: 0.178 },
  ].forEach((lvl) => {
    sculpt(torso, abGeo, M.skin, [-0.064, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.46]);
    sculpt(torso, abGeo, M.skin, [0.064, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.46]);
  });

  const obliqueGeo = new THREE.CapsuleGeometry(0.07, 0.22, 10, 14);
  sculpt(torso, obliqueGeo, M.skin, [-0.22, -0.11, 0.078], [0.1, 0, -0.18], [0.85, 1, 0.85]);
  sculpt(torso, obliqueGeo, M.skin, [0.22, -0.11, 0.078], [0.1, 0, 0.18], [0.85, 1, 0.85]);

  const latGeo = new THREE.SphereGeometry(0.215, 18, 18);
  sculpt(torso, latGeo, M.skin, [-0.19, 0.17, -0.105], [0, 0, -0.25], [1.0, 1.32, 0.64]);
  sculpt(torso, latGeo, M.skin, [0.19, 0.17, -0.105], [0, 0, 0.25], [1.0, 1.32, 0.64]);

  sculpt(torso, new THREE.CylinderGeometry(0.11, 0.138, 0.25, 20), M.skin, [0, 0.52, -0.008], [0.07, 0, 0]);

  // C. Cabeça e Pétaso
  const head = group(torso, 0, 0.73, 0.032);

  const skullGeo = new THREE.SphereGeometry(0.192, 38, 38);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.16;
    x *= 0.90;
    if (y < 0.02 && y > -0.08 && z > 0) { x *= 1.04; z *= 1.04; }
    if (y <= -0.08 && z > -0.02) {
      const taper = Math.max(0.68, 1.0 - ((-0.08 - y) / 0.14) * 0.30);
      x *= taper;
      z *= 1.05;
    }
    if (z < -0.11) z *= 0.93;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  const cheekGeo = new THREE.SphereGeometry(0.045, 16, 16);
  sculpt(head, cheekGeo, M.skin, [-0.068, -0.016, 0.15], [0, -0.3, 0], [1.1, 0.85, 0.65]);
  sculpt(head, cheekGeo, M.skin, [0.068, -0.016, 0.15], [0, 0.3, 0], [1.1, 0.85, 0.65]);

  sculpt(head, new THREE.BoxGeometry(0.022, 0.078, 0.042), M.skin, [0, 0.004, 0.184], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.016, 14, 14), M.skin, [0, -0.034, 0.198], [0, 0, 0], [0.95, 0.82, 1.0]);

  const browGeo = new THREE.CapsuleGeometry(0.0085, 0.056, 8, 12);
  sculpt(head, browGeo, M.hairGoldBrown, [-0.052, 0.048, 0.178], [0.1, 0.25, 1.38]);
  sculpt(head, browGeo, M.hairGoldBrown, [0.052, 0.048, 0.178], [0.1, -0.25, -1.38]);

  const eyeGeo = new THREE.SphereGeometry(0.019, 16, 16);
  sculpt(head, eyeGeo, M.eyeGoldSky, [-0.052, 0.022, 0.172], [0, 0, 0], [1.15, 0.78, 0.8]);
  sculpt(head, eyeGeo, M.eyeGoldSky, [0.052, 0.022, 0.172], [0, 0, 0], [1.15, 0.78, 0.8]);

  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.026, -0.076, 0.182),
    new THREE.Vector3(0, -0.082, 0.188),
    new THREE.Vector3(0.026, -0.076, 0.182),
  ]);
  sculpt(head, new THREE.TubeGeometry(mouthCurve, 10, 0.006, 6, false), M.skinShade);

  const hairCurls: HermesParts['hairCurls'] = [];
  sculpt(head, new THREE.SphereGeometry(0.198, 24, 24), M.hairGoldBrown, [0, 0.04, -0.02], [-0.08, 0, 0], [1.02, 1.02, 1.06]);

  for (let i = 0; i < 22; i++) {
    const ang = (i / 22) * Math.PI * 2;
    const isFront = Math.cos(ang) > 0.35;
    const rad = isFront ? 0.175 : 0.192;
    const cx = Math.sin(ang) * rad;
    const cz = Math.cos(ang) * rad - 0.01;
    const cy = isFront ? 0.072 : (0.02 - (i % 3) * 0.045);
    const curlSize = isFront ? 0.032 : (0.046 + (i % 2) * 0.012);

    const curl = sculpt(
      head,
      new THREE.SphereGeometry(curlSize, 12, 12),
      i % 3 === 0 ? M.hairHighlight : M.hairGoldBrown,
      [cx, cy, cz],
      [0.2, ang, 0],
      [1.0, 1.25, 0.9]
    );
    hairCurls.push({ mesh: curl, baseY: cy, phase: i * 0.55 });
  }

  // PÉTASO
  const petasos = group(head, 0, 0.118, -0.005);
  petasos.rotation.set(-0.14, 0, 0);

  const brimGeo = new THREE.CylinderGeometry(0.21, 0.34, 0.026, 36);
  sculpt(petasos, brimGeo, M.bronzeTraveler, [0, 0, 0], [0, 0, 0], [0.96, 1, 1.08]);

  const brimRim = new THREE.TorusGeometry(0.338, 0.009, 8, 40);
  brimRim.rotateX(Math.PI / 2);
  sculpt(petasos, brimRim, M.goldPolished, [0, -0.01, 0], [0, 0, 0], [0.96, 1, 1.08]);

  sculpt(
    petasos,
    new THREE.SphereGeometry(0.195, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
    M.goldPolished,
    [0, 0.005, 0],
    [0, 0, 0],
    [0.95, 0.72, 1.04]
  );
  sculpt(petasos, new THREE.OctahedronGeometry(0.022, 0), M.turquoiseGem, [0, 0.045, 0.198], [0, 0, 0], [0.85, 1.3, 0.6]);

  const petasosWingMount = group(petasos, 0, 0.055, -0.01);
  const petasosWings = buildWingPair(petasosWingMount, M.wingIvory, M.wingGoldTip, 1.05);

  // D. Braços
  function createHermesArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.39, 0.33, -0.008);

    sculpt(arm, new THREE.SphereGeometry(0.125, 18, 18), M.skin, [0, 0, 0], [0, 0, s * -0.22], [1.04, 1.12, 1.04]);
    sculpt(arm, new THREE.CapsuleGeometry(0.08, 0.26, 12, 16), M.skin, [s * 0.02, -0.17, 0], [0, 0, s * 0.07]);
    sculpt(arm, new THREE.SphereGeometry(0.074, 14, 14), M.skin, [s * 0.015, -0.16, 0.038], [0, 0, s * 0.07], [0.92, 1.42, 0.92]);

    const elbow = group(arm, s * 0.038, -0.34, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.074, 0.048, 0.31, 18), M.skin, [0, -0.15, 0]);

    const bracer = group(elbow, 0, -0.24, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.058, 0.052, 0.08, 24, 1, true), M.goldPolished);
    const bRing = new THREE.TorusGeometry(0.056, 0.005, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.bronzeTraveler, [0, 0.038, 0]);
    sculpt(bracer, bRing, M.bronzeTraveler, [0, -0.038, 0]);

    const hand = group(elbow, 0, -0.32, 0);
    sculpt(hand, new THREE.BoxGeometry(0.064, 0.074, 0.032), M.skin, [0, -0.018, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.009, 0.036, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.0155;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.058, 0.016], [isRight ? 1.2 : 0.35, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.035, -0.028, 0.02], [0.55, 0, -s * 0.6], [1.05, 0.9, 1.05]);

    return { arm, elbow, hand };
  }

  const rightArm = createHermesArm(true);
  const leftArm = createHermesArm(false);

  // E. CADUCEU
  const caduceus = new THREE.Group();
  rightArm.hand.add(caduceus);
  caduceus.position.set(0, -0.035, 0.032);

  sculpt(caduceus, new THREE.CylinderGeometry(0.02, 0.022, 2.35, 16), M.goldPolished, [0, 0.16, 0]);
  sculpt(caduceus, new THREE.ConeGeometry(0.032, 0.18, 8), M.bronzeTraveler, [0, -1.08, 0], [Math.PI, 0, 0]);

  const caduceusHead = group(caduceus, 0, 1.18, 0);
  const caduceusCrystal = sculpt(caduceusHead, new THREE.OctahedronGeometry(0.075, 1), M.turquoiseGem, [0, 0.24, 0], [0, 0, 0], [0.85, 1.35, 0.85]);

  const caduceusHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.125, 0.008, 8, 28),
    new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  caduceusHalo.position.set(0, 0.24, 0);
  caduceusHead.add(caduceusHalo);

  const caduceusWingMount = group(caduceusHead, 0, 0.18, 0);
  const caduceusWings = buildWingPair(caduceusWingMount, M.wingIvory, M.wingGoldTip, 1.15);

  for (const side of [-1, 1] as const) {
    const snakePts: THREE.Vector3[] = [];
    const turns = 2.5;
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const y = -0.45 + t * 0.62;
      const env = Math.sin(t * Math.PI * 0.85) * 0.085 + 0.025;
      const ang = t * Math.PI * 2 * turns + (side === 1 ? 0 : Math.PI);
      snakePts.push(new THREE.Vector3(Math.cos(ang) * env, y, Math.sin(ang) * env));
    }
    const snakeCurve = new THREE.CatmullRomCurve3(snakePts);
    sculpt(caduceusHead, new THREE.TubeGeometry(snakeCurve, 36, 0.015, 8, false), side === 1 ? M.goldPolished : M.bronzeTraveler);

    const sHead = group(caduceusHead, side * 0.085, 0.17, 0.02);
    sHead.rotation.set(0.2, side * -0.4, side * 0.55);
    sculpt(sHead, new THREE.ConeGeometry(0.022, 0.065, 8), M.goldPolished, [0, 0, 0], [Math.PI / 2, 0, 0], [1.1, 1, 0.65]);
    sculpt(sHead, new THREE.SphereGeometry(0.006, 8, 8), M.emeraldEye, [-0.011, 0.008, 0.012]);
    sculpt(sHead, new THREE.SphereGeometry(0.006, 8, 8), M.emeraldEye, [0.011, 0.008, 0.012]);
  }

  const caduceusAnchor = group(caduceusHead, 0, 0.34, 0);
  const caduceusGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  caduceusAnchor.add(caduceusGlow);

  // F. Vestimentas
  const garments = group(torso, 0, 0, 0);

  const sashCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.18, -0.36, 0.18),
    new THREE.Vector3(-0.22, 0.05, 0.20),
    new THREE.Vector3(-0.20, 0.40, 0.11),
    new THREE.Vector3(-0.18, 0.42, -0.11),
    new THREE.Vector3(-0.15, 0.05, -0.18),
    new THREE.Vector3(-0.12, -0.36, -0.15),
  ]);
  const sashGeo = new THREE.TubeGeometry(sashCurve, 28, 0.095, 12, false);
  sashGeo.scale(1.12, 1, 0.46);
  sculpt(garments, sashGeo, M.chiton);

  const fibula = group(garments, -0.22, 0.41, 0.12);
  fibula.rotation.set(-0.35, -0.25, 0);
  sculpt(fibula, new THREE.CylinderGeometry(0.048, 0.048, 0.016, 20), M.goldPolished, [0, 0, 0], [Math.PI / 2, 0, 0]);
  sculpt(fibula, new THREE.OctahedronGeometry(0.022, 0), M.turquoiseGem, [0, 0, 0.012]);

  const beltGeo = new THREE.TorusGeometry(0.245, 0.022, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.leatherBelt, [0, -0.34, 0.008], [0.05, 0, -0.03], [1.06, 1, 0.80]);
  sculpt(garments, new THREE.BoxGeometry(0.085, 0.068, 0.022), M.goldPolished, [0, -0.34, 0.205]);

  const skirtGeo = new THREE.CylinderGeometry(0.245, 0.44, 0.56, 44, 16, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.28 - y) / 0.56));
    const pleat = Math.sin(angle * 16) * 0.024 * (0.25 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.05;
    z = Math.sin(angle) * r * 0.82 - normY * 0.06;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.chiton, [0, -0.61, 0], [0.04, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.18, 1.32, 22, 26);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.66 - y) / 1.32));
    const archZ = -0.15 - Math.cos((x / 0.59) * Math.PI * 0.5) * 0.06;
    const z = archZ - normY * 0.45;
    const fx = x * (0.55 + normY * 0.72);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.chlamysCloak, [-0.06, -0.22, -0.04], [0, -0.12, 0.08]);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    caduceus,
    caduceusCrystal,
    caduceusHalo,
    caduceusAnchor,
    caduceusGlow,
    petasosWings,
    talariaWings,
    caduceusWings,
    hairCurls,
    skirtMesh,
    skirtBase,
    cape,
    capeBase,
  };
}

export function animateHermes(
  hermes: HermesParts,
  dt: number,
  t: number,
  mode: 'flutuar' | 'velocidade' | 'rajada' | 'relampago' = 'flutuar'
): void {
  let pitch = 0.06, roll = 0;
  const hoverY = Math.sin(t * 2.2) * 0.09;

  if (mode === 'velocidade') {
    pitch = 0.38;
    roll = -0.45;
  } else if (mode === 'relampago') {
    pitch = 0.18;
  } else if (mode === 'rajada') {
    pitch = 0.12;
  }

  hermes.body.position.y = 1.12 + hoverY;
  hermes.body.rotation.set(pitch, 0, roll);

  const runFreq = mode === 'velocidade' ? 8.0 : 2.2;
  hermes.legs.L.hip.rotation.x = -0.42 + Math.sin(t * runFreq) * 0.14;
  hermes.legs.L.knee.rotation.x = 0.62 + Math.cos(t * runFreq) * 0.12;
  hermes.legs.R.hip.rotation.x = 0.24 - Math.sin(t * runFreq) * 0.14;
  hermes.legs.R.knee.rotation.x = 0.28 - Math.cos(t * runFreq) * 0.12;

  if (mode === 'rajada') {
    hermes.rightArm.arm.rotation.set(-1.35, 0.15, 0.35);
    hermes.rightArm.elbow.rotation.set(-0.25, 0.1, 0.15);
    hermes.caduceus.rotation.set(0.35, 0, -0.15);
    hermes.leftArm.arm.rotation.set(0.45, -0.3, -0.85);
  } else if (mode === 'velocidade') {
    hermes.rightArm.arm.rotation.set(0.55, 0.2, 0.65);
    hermes.rightArm.elbow.rotation.set(-0.65, 0.15, 0.2);
    hermes.caduceus.rotation.set(1.1, 0.2, -0.3);
    hermes.leftArm.arm.rotation.set(0.62, -0.25, -0.78);
  } else {
    hermes.rightArm.arm.rotation.set(-0.28, 0.15, 0.72 + Math.sin(t * 2.0) * 0.04);
    hermes.rightArm.elbow.rotation.set(-0.68, 0.2, 0.25);
    hermes.caduceus.rotation.set(0.22, Math.sin(t * 1.8) * 0.15, -0.38);
    hermes.leftArm.arm.rotation.set(0.28, -0.22, -0.76 + Math.cos(t * 1.8) * 0.04);
    hermes.leftArm.elbow.rotation.set(-0.52, -0.2, -0.18);
  }

  const flapSpeed = (mode === 'velocidade' || mode === 'relampago') ? 24.0 : 12.5;
  const flapAmp = (mode === 'velocidade' || mode === 'relampago') ? 0.45 : 0.28;

  for (const tw of hermes.talariaWings) {
    const f = Math.sin(t * flapSpeed) * flapAmp;
    tw.left.rotation.z = f;
    tw.right.rotation.z = -f;
  }
  const pf = Math.sin(t * (flapSpeed * 0.65)) * (flapAmp * 0.65);
  hermes.petasosWings.left.rotation.z = pf;
  hermes.petasosWings.right.rotation.z = -pf;

  const cf = Math.sin(t * (flapSpeed * 0.75)) * (flapAmp * 0.7);
  hermes.caduceusWings.left.rotation.z = cf;
  hermes.caduceusWings.right.rotation.z = -cf;
  hermes.caduceusCrystal.rotation.y += dt * 3.5;
  hermes.caduceusHalo.rotation.z -= dt * 4.0;

  const wind = (mode === 'velocidade' || mode === 'rajada') ? 2.1 : 1.0;
  for (const c of hermes.hairCurls) {
    c.mesh.position.y = c.baseY + Math.sin(t * 3.2 * wind + c.phase) * 0.008;
  }

  const cAttr = hermes.cape.geometry.attributes.position;
  for (let i = 0; i < cAttr.count; i++) {
    const bx = hermes.capeBase[i * 3];
    const by = hermes.capeBase[i * 3 + 1];
    const bz = hermes.capeBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.66 - by) / 1.32));
    const wave1 = Math.sin(t * 3.8 * wind - normY * 4.5 + bx * 2.8) * 0.14 * normY;
    const wave2 = Math.cos(t * 2.6 * wind - normY * 3.0) * 0.06 * normY;
    cAttr.setXYZ(i, bx + Math.sin(t * 2.8 - normY * 3.0) * 0.04 * normY, by, bz + wave1 + wave2);
  }
  cAttr.needsUpdate = true;
  hermes.cape.geometry.computeVertexNormals();

  const skAttr = hermes.skirtMesh.geometry.attributes.position;
  for (let i = 0; i < skAttr.count; i++) {
    const bx = hermes.skirtBase[i * 3];
    const by = hermes.skirtBase[i * 3 + 1];
    const bz = hermes.skirtBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.28 - by) / 0.56));
    skAttr.setZ(i, bz + Math.sin(t * 3.8 * wind - normY * 4.0 + bx * 4.0) * 0.04 * normY);
  }
  skAttr.needsUpdate = true;
  hermes.skirtMesh.geometry.computeVertexNormals();
}
