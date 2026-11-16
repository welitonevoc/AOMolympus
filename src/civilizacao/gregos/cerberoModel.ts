import * as THREE from 'three';

export interface CerberusTextures {
  skinBump: THREE.CanvasTexture;
  armorTex: THREE.CanvasTexture;
  obsidianTex: THREE.CanvasTexture;
}

export function createCerberusTextures(): CerberusTextures {
  // 1. Bump map rugoso de pele monstruosa titânica
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8000; i++) {
      const v = 114 + Math.floor(Math.random() * 26);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(5, 5);

  // 2. Saiote de Guerra de Couro Negro e Bronze Forjado
  const armorCanvas = document.createElement('canvas');
  armorCanvas.width = 512;
  armorCanvas.height = 256;
  const aCtx = armorCanvas.getContext('2d');
  if (aCtx) {
    const grad = aCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.6, '#1c1917');
    grad.addColorStop(1, '#29150c');
    aCtx.fillStyle = grad;
    aCtx.fillRect(0, 0, 512, 256);

    aCtx.fillStyle = '#451a03';
    aCtx.fillRect(0, 204, 512, 36);
    for (let x = 0; x < 512; x += 32) {
      aCtx.strokeStyle = '#ea580c';
      aCtx.lineWidth = 2.5;
      aCtx.beginPath();
      aCtx.moveTo(x + 16, 209);
      aCtx.lineTo(x + 25, 222);
      aCtx.lineTo(x + 16, 235);
      aCtx.lineTo(x + 7, 222);
      aCtx.closePath();
      aCtx.stroke();
    }
  }
  const armorTex = new THREE.CanvasTexture(armorCanvas);
  armorTex.wrapS = armorTex.wrapT = THREE.RepeatWrapping;

  // 3. Portões do Submundo: Obsidiana Rachada
  const obsCanvas = document.createElement('canvas');
  obsCanvas.width = obsCanvas.height = 512;
  const oCtx = obsCanvas.getContext('2d');
  if (oCtx) {
    oCtx.fillStyle = '#090a0f';
    oCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1500; i++) {
      oCtx.fillStyle = i % 2 === 0 ? 'rgba(28, 30, 42, 0.35)' : 'rgba(2, 2, 5, 0.55)';
      oCtx.fillRect(Math.random() * 512, Math.random() * 512, 6, 6);
    }
    const cx = 256, cy = 256;
    oCtx.strokeStyle = '#ea580c';
    oCtx.lineWidth = 8;
    oCtx.beginPath();
    oCtx.arc(cx, cy, 210, 0, Math.PI * 2);
    oCtx.stroke();
  }
  const obsidianTex = new THREE.CanvasTexture(obsCanvas);

  return { skinBump, armorTex, obsidianTex };
}

let _cachedCerberusTex: CerberusTextures | null = null;
export function getCachedCerberusTextures(): CerberusTextures {
  if (!_cachedCerberusTex) _cachedCerberusTex = createCerberusTextures();
  return _cachedCerberusTex;
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

export interface HoundHead {
  headRoot: THREE.Group;
  jawPivot: THREE.Group;
  throatGlow: THREE.Mesh;
}

export function buildHoundHead(
  M: Record<string, THREE.Material>,
  isCenterAlpha = false,
  scaleFactor = 1.0
): HoundHead {
  const headRoot = new THREE.Group();
  headRoot.scale.setScalar(scaleFactor);

  // Crânio lupino musculoso
  sculpt(headRoot, new THREE.SphereGeometry(0.175, 24, 24), M.houndFurDark, [0, 0.03, 0], [0, 0, 0], [1.06, 0.94, 1.18]);

  // Crista sagital e espinhos na nuca
  for (let s = 0; s < 6; s++) {
    const t = s / 5;
    sculpt(
      headRoot,
      new THREE.ConeGeometry(0.038, 0.18 - t * 0.04, 5),
      s % 2 === 0 ? M.houndFurDark : M.blackIron,
      [0, 0.16 - t * 0.04, -0.02 - t * 0.16],
      [-0.55 - t * 0.45, 0, 0],
      [0.55, 1, 1]
    );
  }

  // Orelhas pontudas
  for (const side of [-1, 1]) {
    const ear = sculpt(
      headRoot,
      new THREE.ConeGeometry(0.046, 0.18, 5),
      M.houndFurDark,
      [side * 0.115, 0.16, -0.04],
      [-0.18, side * 0.15, side * -0.32],
      [0.45, 1, 0.85]
    );
    if (side === 1 && isCenterAlpha) {
      sculpt(ear, new THREE.TorusGeometry(0.022, 0.005, 6, 16), M.tarnishedBronze, [0.02, 0.02, 0.01], [0, Math.PI / 2, 0]);
    }
  }

  // Olhos Infernais Luminosos
  const eyeMat = isCenterAlpha ? M.eyeSoulAlpha : M.eyeHellfire;
  for (const side of [-1, 1]) {
    sculpt(headRoot, new THREE.SphereGeometry(0.022, 14, 14), eyeMat, [side * 0.066, 0.042, 0.142], [0, 0, 0], [1.15, 0.72, 0.85]);
  }

  // Focinho Superior
  const upperSnout = group(headRoot, 0, 0.005, 0.15);
  sculpt(upperSnout, new THREE.BoxGeometry(0.135, 0.095, 0.21), M.houndMuzzle, [0, 0, 0.08], [0.04, 0, 0]);
  sculpt(upperSnout, new THREE.BoxGeometry(0.068, 0.048, 0.042), M.blackIron, [0, 0.018, 0.185]);

  // Garganta incandescente
  const throatGlow = sculpt(headRoot, new THREE.SphereGeometry(0.065, 12, 12), M.mawGlow, [0, -0.035, 0.13]);

  // Presas Superiores
  for (const side of [-1, 1]) {
    sculpt(upperSnout, new THREE.ConeGeometry(0.016, 0.068, 6), M.fangBone, [side * 0.046, -0.068, 0.155], [Math.PI, 0, side * -0.08]);
    sculpt(upperSnout, new THREE.ConeGeometry(0.011, 0.044, 5), M.fangBone, [side * 0.052, -0.058, 0.105], [Math.PI, 0, 0]);
  }

  // Mandíbula Inferior Articulada
  const jawPivot = group(headRoot, 0, -0.042, 0.08);
  sculpt(jawPivot, new THREE.BoxGeometry(0.112, 0.046, 0.19), M.houndMuzzle, [0, -0.015, 0.11]);
  for (const side of [-1, 1]) {
    sculpt(jawPivot, new THREE.ConeGeometry(0.014, 0.058, 6), M.fangBone, [side * 0.038, 0.025, 0.185], [0.12, 0, side * 0.08]);
  }
  sculpt(jawPivot, new THREE.BoxGeometry(0.048, 0.014, 0.13), M.mawGlow, [0, 0.008, 0.12], [0.08, 0, 0]);

  return { headRoot, jawPivot, throatGlow };
}

export interface CerberusTitan {
  titanRoot: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  necksGroup: THREE.Group;
  neckCenter: THREE.Group;
  neckLeft: THREE.Group;
  neckRight: THREE.Group;
  headCenterObj: HoundHead;
  headLeftObj: HoundHead;
  headRightObj: HoundHead;
  tailSegments: Array<{ pivot: THREE.Group; phase: number }>;
  veinMatHell: THREE.MeshStandardMaterial;
  veinMatSoul: THREE.MeshStandardMaterial;
}

export function buildCerberusTitan(textures: CerberusTextures): CerberusTitan {
  const M = {
    titanSkin: new THREE.MeshStandardMaterial({
      color: 0x3b3f4a,
      roughness: 0.48,
      metalness: 0.14,
      bumpMap: textures.skinBump,
      bumpScale: 0.006,
    }),
    houndFurDark: new THREE.MeshStandardMaterial({
      color: 0x16161d,
      roughness: 0.58,
      metalness: 0.12,
      bumpMap: textures.skinBump,
      bumpScale: 0.005,
    }),
    houndMuzzle: new THREE.MeshStandardMaterial({
      color: 0x262630,
      roughness: 0.52,
      metalness: 0.15,
    }),
    hellfireVein: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xea580c),
      emissiveIntensity: 3.2,
      roughness: 0.12,
    }),
    soulVein: new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 2.6,
      roughness: 0.15,
    }),
    blackIron: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.92,
      roughness: 0.28,
    }),
    tarnishedBronze: new THREE.MeshStandardMaterial({
      color: 0x92400e,
      emissive: new THREE.Color(0x290d02),
      emissiveIntensity: 0.25,
      metalness: 0.88,
      roughness: 0.3,
    }),
    fangBone: new THREE.MeshStandardMaterial({
      color: 0xf5f5f4,
      emissive: new THREE.Color(0x451a03),
      emissiveIntensity: 0.2,
      roughness: 0.28,
      metalness: 0.1,
    }),
    mawGlow: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xf97316),
      emissiveIntensity: 4.0,
      roughness: 0.1,
    }),
    eyeHellfire: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xf97316),
      emissiveIntensity: 4.2,
      roughness: 0.05,
    }),
    eyeSoulAlpha: new THREE.MeshStandardMaterial({
      color: 0xd1fae5,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 4.4,
      roughness: 0.05,
    }),
    loincloth: new THREE.MeshStandardMaterial({
      map: textures.armorTex,
      roughness: 0.65,
      metalness: 0.15,
      side: THREE.DoubleSide,
    }),
    serpentScale: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: new THREE.Color(0x064e3b),
      emissiveIntensity: 0.35,
      roughness: 0.38,
      metalness: 0.35,
    }),
  };

  const titanRoot = new THREE.Group();
  const body = group(titanRoot, 0, 1.32, 0);
  body.scale.setScalar(1.32);

  // A. Pelve e Pernas
  const pelvis = group(body, 0, 0.9, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.3, 22, 20), M.titanSkin, [0, 0, 0], [0, 0, 0], [1.18, 0.78, 0.88]);

  const legs = {} as CerberusTitan['legs'];
  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.195, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.18, 0.132, 0.52, 20), M.titanSkin, [0, -0.25, 0], [0, 0, 0], [1.08, 1, 1.14]);
    const quadGeo = new THREE.SphereGeometry(0.142, 16, 16);
    sculpt(hip, quadGeo, M.titanSkin, [s * 0.026, -0.22, 0.062], [0, 0, 0], [1.0, 1.85, 0.9]);

    const thighVein = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.12, -0.08, 0.08),
      new THREE.Vector3(s * 0.14, -0.24, 0.11),
      new THREE.Vector3(s * 0.1, -0.4, 0.09),
    ]);
    sculpt(hip, new THREE.TubeGeometry(thighVein, 10, 0.008, 6, false), M.hellfireVein);

    const knee = group(hip, 0, -0.53, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.116, 0.072, 0.46, 18), M.titanSkin, [0, -0.23, 0]);

    const shackle = new THREE.TorusGeometry(0.088, 0.018, 8, 20);
    shackle.rotateX(Math.PI / 2);
    sculpt(knee, shackle, M.blackIron, [0, -0.39, 0.01]);

    const ankle = group(knee, 0, -0.46, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.13, 0.068, 0.25), M.titanSkin, [0, -0.02, 0.04]);
    for (let c = -1; c <= 1; c++) {
      sculpt(ankle, new THREE.ConeGeometry(0.018, 0.085, 6), M.fangBone, [c * 0.042, -0.032, 0.18], [1.45, 0, 0]);
    }
    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.18, -0.18, -0.15);
  legs.L.knee.rotation.set(0.24, 0, 0);
  legs.L.ankle.rotation.set(-0.06, 0, 0.14);

  legs.R.hip.rotation.set(0.16, 0.22, 0.16);
  legs.R.knee.rotation.set(0.2, 0, 0);
  legs.R.ankle.rotation.set(-0.06, 0, -0.14);

  // B. Tronco
  const torso = group(body, 0, 1.34, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.31, -0.4),
    new THREE.Vector2(0.29, -0.2),
    new THREE.Vector2(0.37, 0.04),
    new THREE.Vector2(0.52, 0.29),
    new THREE.Vector2(0.46, 0.45),
    new THREE.Vector2(0.26, 0.52),
    new THREE.Vector2(0.01, 0.53),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.titanSkin, [0, 0, 0], [0, 0, 0], [1.28, 1.04, 0.82]);

  const pecGeo = new THREE.SphereGeometry(0.27, 24, 24);
  sculpt(torso, pecGeo, M.titanSkin, [-0.23, 0.23, 0.195], [0.12, -0.22, -0.14], [1.1, 0.9, 0.64]);
  sculpt(torso, pecGeo, M.titanSkin, [0.23, 0.23, 0.195], [0.12, 0.22, 0.14], [1.1, 0.9, 0.64]);

  const vein1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.38, 0.35, 0.14),
    new THREE.Vector3(-0.22, 0.25, 0.29),
    new THREE.Vector3(-0.08, 0.14, 0.31),
    new THREE.Vector3(-0.14, -0.02, 0.29),
  ]);
  sculpt(torso, new THREE.TubeGeometry(vein1, 16, 0.009, 6, false), M.hellfireVein);

  const vein2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.38, 0.35, 0.14),
    new THREE.Vector3(0.22, 0.25, 0.29),
    new THREE.Vector3(0.08, 0.14, 0.31),
    new THREE.Vector3(0.14, -0.02, 0.29),
  ]);
  sculpt(torso, new THREE.TubeGeometry(vein2, 16, 0.009, 6, false), M.soulVein);

  // C. Três Cabeças de Cão Infernal
  const necksGroup = group(torso, 0, 0.48, 0.02);

  // Central
  const neckCenter = group(necksGroup, 0, 0.04, 0.02);
  sculpt(neckCenter, new THREE.CylinderGeometry(0.145, 0.185, 0.28, 18), M.titanSkin, [0, 0.12, 0], [0.12, 0, 0]);
  const collarC = new THREE.TorusGeometry(0.162, 0.022, 8, 24);
  collarC.rotateX(Math.PI / 2);
  sculpt(neckCenter, collarC, M.blackIron, [0, 0.15, 0.01], [0.12, 0, 0]);
  const headCenterObj = buildHoundHead(M, true, 1.14);
  headCenterObj.headRoot.position.set(0, 0.32, 0.04);
  neckCenter.add(headCenterObj.headRoot);

  // Esquerda
  const neckLeft = group(necksGroup, -0.25, 0.0, 0.01);
  neckLeft.rotation.set(0.08, 0.34, 0.26);
  sculpt(neckLeft, new THREE.CylinderGeometry(0.125, 0.16, 0.26, 16), M.titanSkin, [0, 0.11, 0]);
  const headLeftObj = buildHoundHead(M, false, 0.96);
  headLeftObj.headRoot.position.set(0, 0.28, 0.03);
  neckLeft.add(headLeftObj.headRoot);

  // Direita
  const neckRight = group(necksGroup, 0.25, 0.0, 0.01);
  neckRight.rotation.set(0.08, -0.34, -0.26);
  sculpt(neckRight, new THREE.CylinderGeometry(0.125, 0.16, 0.26, 16), M.titanSkin, [0, 0.11, 0]);
  const headRightObj = buildHoundHead(M, false, 0.96);
  headRightObj.headRoot.position.set(0, 0.28, 0.03);
  neckRight.add(headRightObj.headRoot);

  // D. Braços Titânicos
  function createTitanArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.56, 0.35, -0.01);

    sculpt(
      arm,
      new THREE.SphereGeometry(0.21, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.48),
      M.blackIron,
      [s * 0.02, 0.04, 0],
      [0, 0, s * -0.35],
      [1.15, 0.78, 1.18]
    );
    sculpt(arm, new THREE.SphereGeometry(0.185, 20, 20), M.titanSkin, [0, -0.02, 0], [0, 0, s * -0.25], [1.08, 1.18, 1.08]);
    sculpt(arm, new THREE.CapsuleGeometry(0.122, 0.3, 12, 18), M.titanSkin, [s * 0.03, -0.2, 0], [0, 0, s * 0.08]);

    const elbow = group(arm, s * 0.052, -0.4, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.116, 0.078, 0.36, 18), M.titanSkin, [0, -0.17, 0]);

    for (let r = 0; r < 3; r++) {
      const chainRing = new THREE.TorusGeometry(0.095 - r * 0.006, 0.014, 8, 20);
      chainRing.rotateX(Math.PI / 2);
      sculpt(elbow, chainRing, M.blackIron, [0, -0.18 - r * 0.055, 0], [0.15, 0, r * 0.2]);
    }

    const hand = group(elbow, 0, -0.37, 0);
    sculpt(hand, new THREE.BoxGeometry(0.105, 0.11, 0.055), M.titanSkin, [0, -0.02, 0]);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.025;
      sculpt(hand, new THREE.CapsuleGeometry(0.015, 0.048, 6, 8), M.titanSkin, [fx, -0.08, 0.024], [1.15, 0, 0]);
      sculpt(hand, new THREE.ConeGeometry(0.014, 0.075, 5), M.fangBone, [fx, -0.125, 0.055], [1.85, 0, 0]);
    }
    return { arm, elbow, hand };
  }

  const rightArm = createTitanArm(true);
  const leftArm = createTitanArm(false);

  // E. Saiote e Cauda de Serpente
  const garments = group(torso, 0, 0, 0);
  const beltGeo = new THREE.TorusGeometry(0.32, 0.038, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.blackIron, [0, -0.36, 0.01], [0.05, 0, -0.03], [1.16, 1, 0.88]);

  const skirtGeo = new THREE.CylinderGeometry(0.32, 0.58, 0.86, 44, 16, true);
  sculpt(garments, skirtGeo, M.loincloth, [0, -0.78, 0], [0.04, 0, 0]);

  const tailGroup = group(pelvis, 0, -0.05, -0.24);
  const tailSegments: Array<{ pivot: THREE.Group; phase: number }> = [];
  let parentTail = tailGroup;
  for (let seg = 0; seg < 7; seg++) {
    const t = seg / 6;
    const rad = 0.095 * (1 - t * 0.62);
    const segPivot = group(parentTail, 0, seg === 0 ? 0 : -0.18, seg === 0 ? 0 : -0.12);
    sculpt(segPivot, new THREE.CylinderGeometry(rad * 0.85, rad, 0.24, 12), M.serpentScale, [0, -0.09, -0.06], [0.65, 0, 0]);
    if (seg === 6) {
      sculpt(segPivot, new THREE.ConeGeometry(0.065, 0.18, 6), M.serpentScale, [0, -0.22, -0.14], [1.85, 0, 0], [1.2, 1, 0.6]);
      sculpt(segPivot, new THREE.SphereGeometry(0.015, 8, 8), M.eyeSoulAlpha, [-0.032, -0.2, -0.16]);
      sculpt(segPivot, new THREE.SphereGeometry(0.015, 8, 8), M.eyeSoulAlpha, [0.032, -0.2, -0.16]);
    }
    tailSegments.push({ pivot: segPivot, phase: seg * 0.65 });
    parentTail = segPivot;
  }

  return {
    titanRoot,
    body,
    torso,
    legs,
    rightArm,
    leftArm,
    necksGroup,
    neckCenter,
    neckLeft,
    neckRight,
    headCenterObj,
    headLeftObj,
    headRightObj,
    tailSegments,
    veinMatHell: M.hellfireVein,
    veinMatSoul: M.soulVein,
  };
}
