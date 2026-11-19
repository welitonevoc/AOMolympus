import * as THREE from 'three';

export interface AphroditeTextures {
  skinBump: THREE.CanvasTexture;
  silkTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createAphroditeTextures(): AphroditeTextures {
  // 1. Bump map ultrafino para pele acetinada
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4200; i++) {
      const v = 125 + Math.floor(Math.random() * 8);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 2. Seda Perolada e Rosa-Flor com bordado dourado de ondas e rosas
  const silkCanvas = document.createElement('canvas');
  silkCanvas.width = 512;
  silkCanvas.height = 256;
  const tCtx = silkCanvas.getContext('2d');
  if (tCtx) {
    const grad = tCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#fff1f2');
    grad.addColorStop(0.55, '#ffe4e6');
    grad.addColorStop(0.82, '#fecdd3');
    grad.addColorStop(1, '#fda4af');
    tCtx.fillStyle = grad;
    tCtx.fillRect(0, 0, 512, 256);

    // Pregas delicadas de seda fluida
    tCtx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    for (let x = 0; x < 512; x += 8) tCtx.fillRect(x, 0, 3, 256);

    // Barra dourada ornamentada com volutas marinhas
    tCtx.fillStyle = '#be185d';
    tCtx.fillRect(0, 206, 512, 34);
    tCtx.fillStyle = '#facc15';
    tCtx.fillRect(0, 202, 512, 5);
    tCtx.fillRect(0, 240, 512, 5);

    tCtx.strokeStyle = '#fef08a';
    tCtx.lineWidth = 2.6;
    for (let x = 0; x < 512; x += 32) {
      tCtx.beginPath();
      tCtx.arc(x + 16, 223, 10, 0, Math.PI * 1.65);
      tCtx.stroke();
    }
  }
  const silkTex = new THREE.CanvasTexture(silkCanvas);
  silkTex.wrapS = silkTex.wrapT = THREE.RepeatWrapping;

  return { skinBump, silkTex };
}

let cachedAphroditeTextures: AphroditeTextures | null = null;
export function getCachedAphroditeTextures(): AphroditeTextures {
  if (!cachedAphroditeTextures) {
    cachedAphroditeTextures = createAphroditeTextures();
  }
  return cachedAphroditeTextures;
}

export interface AphroditeMaterials {
  skin: THREE.MeshStandardMaterial;
  blushSkin: THREE.MeshStandardMaterial;
  lipRose: THREE.MeshStandardMaterial;
  hairHoneyGold: THREE.MeshStandardMaterial;
  hairChampagne: THREE.MeshStandardMaterial;
  goldPolished: THREE.MeshStandardMaterial;
  roseGold: THREE.MeshStandardMaterial;
  pearlMat: THREE.MeshStandardMaterial;
  nacreShell: THREE.MeshStandardMaterial;
  rubyHeartGem: THREE.MeshStandardMaterial;
  eyeWhite: THREE.MeshStandardMaterial;
  eyeSapphireSky: THREE.MeshStandardMaterial;
  eyePupil: THREE.MeshStandardMaterial;
  lashBrown: THREE.MeshStandardMaterial;
  silkDress: THREE.MeshStandardMaterial;
  roseShawl: THREE.MeshStandardMaterial;
  doveWhite: THREE.MeshStandardMaterial;
}

function createMaterials(textures: AphroditeTextures): AphroditeMaterials {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xf0c4a8,
      roughness: 0.32,
      metalness: 0.04,
      bumpMap: textures.skinBump,
      bumpScale: 0.002,
    }),
    blushSkin: new THREE.MeshStandardMaterial({
      color: 0xeba598,
      roughness: 0.34,
      metalness: 0.04,
    }),
    lipRose: new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0x4c0519,
      emissiveIntensity: 0.2,
      roughness: 0.24,
      metalness: 0.06,
    }),
    hairHoneyGold: new THREE.MeshStandardMaterial({
      color: 0xf6c945,
      emissive: 0x422006,
      emissiveIntensity: 0.2,
      roughness: 0.30,
      metalness: 0.22,
    }),
    hairChampagne: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0x523105,
      emissiveIntensity: 0.22,
      roughness: 0.28,
      metalness: 0.24,
    }),
    goldPolished: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x422006,
      emissiveIntensity: 0.24,
      metalness: 0.94,
      roughness: 0.16,
    }),
    roseGold: new THREE.MeshStandardMaterial({
      color: 0xfda4af,
      emissive: 0x4c0519,
      emissiveIntensity: 0.22,
      metalness: 0.88,
      roughness: 0.2,
    }),
    pearlMat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffe4e6,
      emissiveIntensity: 0.35,
      roughness: 0.14,
      metalness: 0.35,
    }),
    nacreShell: new THREE.MeshStandardMaterial({
      color: 0xfff1f2,
      emissive: 0xfecdd3,
      emissiveIntensity: 0.28,
      roughness: 0.22,
      metalness: 0.45,
      side: THREE.DoubleSide,
    }),
    rubyHeartGem: new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 1.5,
      roughness: 0.08,
      metalness: 0.3,
    }),
    eyeWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf8fafc,
      emissiveIntensity: 0.25,
      roughness: 0.08,
    }),
    eyeSapphireSky: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
      roughness: 0.06,
    }),
    eyePupil: new THREE.MeshStandardMaterial({
      color: 0x0c244a,
      roughness: 0.1,
    }),
    lashBrown: new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.45,
    }),
    silkDress: new THREE.MeshStandardMaterial({
      map: textures.silkTex,
      color: 0xffffff,
      roughness: 0.44,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
    roseShawl: new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0x4c0519,
      emissiveIntensity: 0.32,
      roughness: 0.38,
      metalness: 0.12,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    }),
    doveWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffe4e6,
      emissiveIntensity: 0.35,
      roughness: 0.35,
    }),
  };
}

function group(parent?: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D,
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
  parent.add(m);
  return m;
}

export interface AphroditeParts {
  root: THREE.Group;
  shellPlatform: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  floatingMirrorGroup: THREE.Group;
  venusMirror: THREE.Group;
  magicHandAnchor: THREE.Group;
  magicHandGlow: THREE.Mesh;
  leftHandGlow: THREE.Mesh;
  hairStrands: Array<{ mesh: THREE.Mesh; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  shawlMesh: THREE.Mesh;
  shawlBase: Float32Array;
  doveOrbitGroup: THREE.Group;
  dove: THREE.Group;
  doveWingL: THREE.Group;
  doveWingR: THREE.Group;
}

export function buildAphrodite(textures?: AphroditeTextures): AphroditeParts {
  const tex = textures || getCachedAphroditeTextures();
  const M = createMaterials(tex);
  const root = new THREE.Group();

  // ------------------------------------------------------------------------
  // A. CONCHA GIGANTE DE NÁCAR E PÉROLAS FLUTUANTE SOB OS PÉS DE AFRODITE
  // ------------------------------------------------------------------------
  const shellPlatform = group(root, 0, 0.28, 0);

  const shellGeo = new THREE.SphereGeometry(1.18, 40, 24, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.46);
  const shPos = shellGeo.attributes.position;
  for (let i = 0; i < shPos.count; i++) {
    let x = shPos.getX(i), y = shPos.getY(i), z = shPos.getZ(i);
    const ang = Math.atan2(z, x);
    const r = Math.hypot(x, z);
    const scallop = Math.sin(ang * 14) * 0.032 * (r / 1.18);
    y += scallop;
    z *= 1.15;
    shPos.setXYZ(i, x, y, z);
  }
  shellGeo.computeVertexNormals();
  sculpt(shellPlatform, shellGeo, M.nacreShell, [0, 0.72, -0.05], [0.06, 0, 0], [1.05, 0.65, 1.0]);

  const shellRim = new THREE.TorusGeometry(1.16, 0.018, 10, 48);
  shellRim.rotateX(Math.PI / 2);
  sculpt(shellPlatform, shellRim, M.goldPolished, [0, 0.04, -0.05], [0.06, 0, 0], [1.05, 1.15, 1]);

  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const px = Math.cos(a) * 1.21;
    const pz = Math.sin(a) * 1.32 - 0.05;
    const py = 0.05 + Math.sin(a * 14) * 0.025 - pz * 0.06;
    sculpt(shellPlatform, new THREE.SphereGeometry(0.032, 12, 12), M.pearlMat, [px, py, pz]);
  }

  // ------------------------------------------------------------------------
  // B. CORPO FEMININO GRACIOSO E ESCULPIDO DE AFRODITE (y = 0.34)
  // ------------------------------------------------------------------------
  const body = group(root, 0, 0.34, 0);

  const pelvis = group(body, 0, 0.94, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.22, 24, 22), M.skin, [0, 0, 0], [0, 0, 0], [1.12, 0.80, 0.86]);

  const legs: AphroditeParts['legs'] = {
    L: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
    R: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() }
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.128, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.126, 0.084, 0.54, 22), M.skin, [0, -0.26, 0], [0, 0, 0], [1.02, 1, 1.06]);
    sculpt(hip, new THREE.SphereGeometry(0.095, 16, 16), M.skin, [s * 0.012, -0.22, 0.038], [0, 0, 0], [0.94, 1.8, 0.86]);

    sculpt(hip, new THREE.SphereGeometry(0.072, 16, 16), M.skin, [0, -0.54, 0.014]);

    const knee = group(hip, 0, -0.55, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.074, 0.044, 0.50, 20), M.skin, [0, -0.25, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.07, 16, 16), M.skin, [0, -0.17, -0.03], [0, 0, 0], [0.95, 1.65, 0.95]);

    const anklet = new THREE.TorusGeometry(0.052, 0.0055, 8, 24);
    anklet.rotateX(Math.PI / 2);
    sculpt(knee, anklet, M.goldPolished, [0, -0.45, 0.01]);
    sculpt(knee, new THREE.SphereGeometry(0.014, 10, 10), M.pearlMat, [s * 0.052, -0.45, 0.01]);

    const ankle = group(knee, 0, -0.50, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.076, 0.04, 0.19), M.skin, [0, -0.018, 0.035], [0.14, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.082, 0.012, 0.20), M.goldPolished, [0, -0.038, 0.035], [0.14, 0, 0]);

    const strap = new THREE.TorusGeometry(0.05, 0.0045, 8, 20);
    strap.rotateX(Math.PI / 2);
    sculpt(ankle, strap, M.goldPolished, [0, 0.018, -0.018], [0.08, 0, 0]);
    sculpt(ankle, strap, M.roseGold, [0, 0.052, -0.018], [0.08, 0, 0]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.22, -0.10, -0.04);
  legs.L.knee.rotation.set(0.28, 0, 0);
  legs.R.hip.rotation.set(0.10, 0.08, 0.04);
  legs.R.knee.rotation.set(0.10, 0, 0);

  // ------------------------------------------------------------------------
  // C. TRONCO FEMININO GRACIOSO, VESTE DE SEDA E JOIAS DE OURO E PÉROLAS
  // ------------------------------------------------------------------------
  const torso = group(body, 0, 1.38, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.225, -0.40),
    new THREE.Vector2(0.162, -0.18),
    new THREE.Vector2(0.202, 0.04),
    new THREE.Vector2(0.268, 0.26),
    new THREE.Vector2(0.238, 0.40),
    new THREE.Vector2(0.105, 0.47),
    new THREE.Vector2(0.01, 0.48)
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 40), M.skin, [0, 0, 0], [0, 0, 0], [1.14, 1.02, 0.74]);

  const bustGeo = new THREE.SphereGeometry(0.132, 24, 24);
  sculpt(torso, bustGeo, M.silkDress, [-0.108, 0.20, 0.132], [0.08, -0.18, 0], [0.96, 0.94, 0.80]);
  sculpt(torso, bustGeo, M.silkDress, [0.108, 0.20, 0.132], [0.08, 0.18, 0], [0.96, 0.94, 0.80]);

  const bodiceCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.18, 0.36, 0.11),
    new THREE.Vector3(-0.08, 0.16, 0.21),
    new THREE.Vector3(0.06, -0.08, 0.19),
    new THREE.Vector3(0.16, -0.32, 0.15)
  ]);
  const bodiceSash = new THREE.TubeGeometry(bodiceCurve, 24, 0.075, 12, false);
  bodiceSash.scale(1.1, 1, 0.45);
  sculpt(torso, bodiceSash, M.silkDress);

  const necklace = new THREE.TorusGeometry(0.155, 0.011, 10, 32);
  necklace.rotateX(Math.PI / 2);
  sculpt(torso, necklace, M.goldPolished, [0, 0.38, 0.015], [0.22, 0, 0], [1.12, 1, 0.92]);
  for (let p = -4; p <= 4; p++) {
    const pa = p * 0.22;
    sculpt(
      torso,
      new THREE.SphereGeometry(0.013, 10, 10),
      M.pearlMat,
      [Math.sin(pa) * 0.165, 0.345 - Math.cos(pa) * 0.018, Math.cos(pa) * 0.152]
    );
  }
  sculpt(torso, new THREE.OctahedronGeometry(0.022, 0), M.rubyHeartGem, [0, 0.315, 0.168], [0, 0, 0], [0.95, 1.25, 0.55]);

  sculpt(torso, new THREE.CylinderGeometry(0.082, 0.104, 0.25, 22), M.skin, [0, 0.51, -0.005], [0.05, 0, 0]);

  // ------------------------------------------------------------------------
  // D. ROSTO DE EXTREMA BELEZA CLÁSSICA + CABELOS DOURADOS + TIARA
  // ------------------------------------------------------------------------
  const head = group(torso, 0, 0.72, 0.032);

  const skullGeo = new THREE.SphereGeometry(0.180, 44, 44);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.15;
    x *= 0.87;
    if (y < 0.02 && y > -0.05 && z > 0) {
      x *= 1.03;
      z *= 1.04;
    }
    if (y <= -0.05 && z > -0.02) {
      const chinTaper = Math.max(0.54, 1.0 - ((-0.05 - y) / 0.15) * 0.44);
      x *= chinTaper;
      z *= 1.02;
    }
    if (z < -0.10) z *= 0.94;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  const cheekGeo = new THREE.SphereGeometry(0.04, 16, 16);
  sculpt(head, cheekGeo, M.blushSkin, [-0.06, -0.015, 0.142], [0, -0.3, 0], [1.08, 0.82, 0.58]);
  sculpt(head, cheekGeo, M.blushSkin, [0.06, -0.015, 0.142], [0, 0.3, 0], [1.08, 0.82, 0.58]);

  sculpt(head, new THREE.BoxGeometry(0.016, 0.066, 0.035), M.skin, [0, 0.002, 0.173], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.013, 14, 14), M.skin, [0, -0.030, 0.185], [0, 0, 0], [0.9, 0.78, 0.95]);

  const browGeo = new THREE.CapsuleGeometry(0.0048, 0.050, 8, 12);
  sculpt(head, browGeo, M.lashBrown, [-0.047, 0.045, 0.166], [0.1, 0.25, 1.44]);
  sculpt(head, browGeo, M.lashBrown, [0.047, 0.045, 0.166], [0.1, -0.25, -1.44]);

  for (const side of [-1, 1]) {
    const eyeGroup = group(head, side * 0.047, 0.017, 0.156);
    eyeGroup.rotation.y = side * 0.18;

    sculpt(eyeGroup, new THREE.SphereGeometry(0.022, 18, 18), M.eyeWhite, [0, 0, 0], [0, 0, 0], [1.18, 0.92, 0.65]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.015, 16, 16), M.eyeSapphireSky, [-side * 0.002, -0.001, 0.009], [0, 0, 0], [0.95, 1.08, 0.55]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.0078, 12, 12), M.eyePupil, [-side * 0.002, -0.001, 0.014], [0, 0, 0], [0.9, 1.05, 0.5]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.0042, 8, 8), M.eyeWhite, [-side * 0.006, 0.005, 0.016]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.0024, 8, 8), M.eyeWhite, [side * 0.004, -0.004, 0.016]);
    sculpt(eyeGroup, new THREE.BoxGeometry(0.050, 0.006, 0.018), M.lashBrown, [side * 0.003, 0.015, 0.008], [0.12, 0, side * -0.10]);
  }

  sculpt(head, new THREE.CapsuleGeometry(0.0072, 0.028, 8, 12), M.lipRose, [0, -0.070, 0.171], [0, 0, Math.PI / 2], [1, 1, 0.78]);
  sculpt(head, new THREE.CapsuleGeometry(0.0088, 0.024, 8, 12), M.lipRose, [0, -0.081, 0.169], [0, 0, Math.PI / 2], [1, 1, 0.85]);

  // Cabelos Longos Ondulados Loiro-Mel
  const hairStrands: Array<{ mesh: THREE.Mesh; phase: number }> = [];

  sculpt(head, new THREE.SphereGeometry(0.188, 28, 28), M.hairHoneyGold, [0, 0.036, -0.018], [-0.08, 0, 0], [0.98, 1.06, 1.06]);

  for (const side of [-1, 1]) {
    const waveFrontPts = [
      new THREE.Vector3(side * 0.015, 0.165, 0.135),
      new THREE.Vector3(side * 0.105, 0.115, 0.135),
      new THREE.Vector3(side * 0.168, 0.015, 0.105),
      new THREE.Vector3(side * 0.182, -0.145, 0.095),
      new THREE.Vector3(side * 0.155, -0.320, 0.115),
      new THREE.Vector3(side * 0.135, -0.480, 0.125)
    ];
    const frontTube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(waveFrontPts), 20, 0.032, 10, false);
    const frontLock = sculpt(head, frontTube, M.hairChampagne);
    hairStrands.push({ mesh: frontLock, phase: side * 0.7 });
  }

  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 1.55 + Math.PI * 0.725;
    const r = 0.168;
    const sx = Math.sin(angle) * r;
    const sz = Math.cos(angle) * r - 0.012;
    const sy = 0.048 + Math.cos(angle * 2) * 0.018;
    const len = 0.84 + (i % 4) * 0.095;
    const pts = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      const flare = 1 + t * 0.48;
      pts.push(new THREE.Vector3(
        sx * flare + Math.sin(t * Math.PI * 2.8 + i * 0.65) * 0.044,
        sy - t * len,
        sz * flare - t * 0.18
      ));
    }
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.031 * (1 - 0.14 * (i % 2)), 8, false);
    const strand = sculpt(head, tube, i % 3 === 0 ? M.hairChampagne : M.hairHoneyGold);
    hairStrands.push({ mesh: strand, phase: i * 0.36 });
  }

  // Tiara Dourada e Brincos
  const tiara = group(head, 0, 0.118, 0.012);
  tiara.rotation.x = 0.16;

  const tiaraBand = new THREE.TorusGeometry(0.182, 0.0085, 10, 36, Math.PI * 1.4);
  tiaraBand.rotateX(Math.PI / 2);
  tiaraBand.rotateY(-Math.PI * 0.2);
  sculpt(tiara, tiaraBand, M.goldPolished, [0, 0, 0], [0, 0, 0], [0.95, 1, 1.05]);

  sculpt(tiara, new THREE.ConeGeometry(0.034, 0.075, 7), M.goldPolished, [0, 0.032, 0.184], [-0.15, 0, 0], [1.1, 1, 0.35]);
  sculpt(tiara, new THREE.SphereGeometry(0.018, 12, 12), M.pearlMat, [0, 0.016, 0.192]);

  for (const side of [-1, 1]) {
    sculpt(tiara, new THREE.TorusGeometry(0.022, 0.008, 8, 16), M.roseGold, [side * 0.165, 0.01, 0.06], [0, side * 1.1, 0]);
    sculpt(tiara, new THREE.SphereGeometry(0.012, 10, 10), M.pearlMat, [side * 0.168, 0.01, 0.06]);
    sculpt(head, new THREE.SphereGeometry(0.012, 10, 10), M.goldPolished, [side * 0.162, -0.025, 0.01]);
    sculpt(head, new THREE.SphereGeometry(0.016, 12, 12), M.pearlMat, [side * 0.166, -0.052, 0.01]);
  }

  // ------------------------------------------------------------------------
  // E. BRAÇOS GRACIOSOS E ESPELHO DE VÊNUS FLUTUANTE
  // ------------------------------------------------------------------------
  function createGracefulArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.31, 0.32, -0.005);

    sculpt(arm, new THREE.SphereGeometry(0.088, 18, 18), M.skin);
    sculpt(arm, new THREE.CapsuleGeometry(0.058, 0.26, 12, 16), M.skin, [s * 0.015, -0.17, 0], [0, 0, s * 0.05]);

    if (!isRight) {
      const upperArmlet = new THREE.TorusGeometry(0.062, 0.0055, 8, 24);
      upperArmlet.rotateX(Math.PI / 2);
      sculpt(arm, upperArmlet, M.goldPolished, [s * 0.012, -0.14, 0]);
      sculpt(arm, upperArmlet, M.roseGold, [s * 0.014, -0.16, 0]);
    }

    const elbow = group(arm, s * 0.028, -0.34, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.056, 0.038, 0.30, 18), M.skin, [0, -0.145, 0]);

    const wristBand = new THREE.TorusGeometry(0.044, 0.0055, 8, 24);
    wristBand.rotateX(Math.PI / 2);
    sculpt(elbow, wristBand, M.goldPolished, [0, -0.25, 0]);
    sculpt(elbow, new THREE.SphereGeometry(0.012, 10, 10), M.pearlMat, [s * 0.045, -0.25, 0]);

    const hand = group(elbow, 0, -0.31, 0);
    sculpt(hand, new THREE.BoxGeometry(0.050, 0.062, 0.024), M.skin, [0, -0.014, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.007, 0.034, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.012;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.048, 0.01], [isRight ? 0.45 : 0.95, 0, (f - 1.5) * 0.06]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.028, -0.022, 0.015], [0.45, 0, -s * 0.55], [1.0, 0.88, 1.0]);

    return { arm, elbow, hand };
  }

  const rightArm = createGracefulArm(true);
  const leftArm = createGracefulArm(false);

  // Espelho Sagrado de Vênus flutuando ao lado
  const floatingMirrorGroup = new THREE.Group();
  root.add(floatingMirrorGroup);

  const venusMirror = new THREE.Group();
  floatingMirrorGroup.add(venusMirror);

  sculpt(venusMirror, new THREE.CylinderGeometry(0.011, 0.015, 0.22, 12), M.goldPolished, [0, -0.04, 0]);
  sculpt(venusMirror, new THREE.SphereGeometry(0.02, 12, 12), M.pearlMat, [0, -0.15, 0]);

  const mirrorFrame = new THREE.TorusGeometry(0.135, 0.016, 10, 32);
  sculpt(venusMirror, mirrorFrame, M.goldPolished, [0, 0.19, 0], [0, 0, 0], [0.85, 1.15, 1]);
  sculpt(venusMirror, new THREE.OctahedronGeometry(0.022, 0), M.rubyHeartGem, [0, 0.345, 0]);

  const mirrorGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffe4e6,
      emissive: 0xfb7185,
      emissiveIntensity: 1.9,
      metalness: 0.95,
      roughness: 0.05,
      side: THREE.DoubleSide
    })
  );
  mirrorGlass.position.set(0, 0.19, 0);
  mirrorGlass.scale.set(0.85, 1.15, 1);
  venusMirror.add(mirrorGlass);

  const magicHandAnchor = group(rightArm.hand, 0, -0.055, 0.035);
  const magicHandGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  magicHandAnchor.add(magicHandGlow);

  const leftHandGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  leftHandGlow.position.set(0, -0.055, 0.035);
  leftArm.hand.add(leftHandGlow);

  // ------------------------------------------------------------------------
  // F. VESTE DE SEDA FLUIDA E XALE DE VÊNUS
  // ------------------------------------------------------------------------
  const garments = group(torso, 0, 0, 0);

  const beltGeo = new THREE.TorusGeometry(0.195, 0.015, 10, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.goldPolished, [0, -0.18, 0.005], [0.04, 0, 0], [1.14, 1, 0.80]);
  sculpt(garments, new THREE.OctahedronGeometry(0.026, 0), M.rubyHeartGem, [0, -0.18, 0.165], [0, 0, 0], [1.0, 1.25, 0.55]);

  const skirtGeo = new THREE.CylinderGeometry(0.195, 0.62, 1.26, 56, 24, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = (0.63 - y) / 1.26;
    const pleat = Math.sin(angle * 18) * 0.026 * (0.2 + normY * 0.95);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.06;
    z = Math.sin(angle) * r * 0.86 - normY * 0.05;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.silkDress, [0, -0.80, 0], [0.03, 0, 0]);

  const shawlGeo = new THREE.PlaneGeometry(1.75, 1.75, 28, 32);
  const shlPos = shawlGeo.attributes.position;
  const shawlBase = new Float32Array(shlPos.array.length);
  for (let i = 0; i < shlPos.count; i++) {
    const x = shlPos.getX(i), y = shlPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.875 - y) / 1.75));
    const uX = x / 0.875;
    const archZ = -0.18 - Math.cos(uX * Math.PI * 0.5) * 0.14;
    const z = archZ - normY * 0.42;
    const fx = x * (0.78 + Math.sin(normY * Math.PI) * 0.35);
    shlPos.setXYZ(i, fx, y, z);
    shawlBase[i * 3] = fx;
    shawlBase[i * 3 + 1] = y;
    shawlBase[i * 3 + 2] = z;
  }
  shawlGeo.computeVertexNormals();
  const shawlMesh = sculpt(garments, shawlGeo, M.roseShawl, [0, -0.35, -0.05]);

  // ------------------------------------------------------------------------
  // G. POMBA BRANCA SAGRADA
  // ------------------------------------------------------------------------
  const doveOrbitGroup = new THREE.Group();
  root.add(doveOrbitGroup);

  const dove = new THREE.Group();
  doveOrbitGroup.add(dove);

  sculpt(dove, new THREE.SphereGeometry(0.085, 16, 16), M.doveWhite, [0, 0, 0], [0.3, 0, 0], [0.85, 1.45, 0.85]);
  const doveHead = group(dove, 0, 0.11, 0.045);
  sculpt(doveHead, new THREE.SphereGeometry(0.052, 14, 14), M.doveWhite);
  sculpt(doveHead, new THREE.ConeGeometry(0.012, 0.036, 6), M.goldPolished, [0, -0.005, 0.055], [Math.PI / 2, 0, 0]);
  sculpt(dove, new THREE.ConeGeometry(0.065, 0.16, 6), M.doveWhite, [0, -0.13, -0.05], [-2.4, 0, 0], [1.3, 1, 0.2]);

  const doveWingL = group(dove, -0.065, 0.04, 0);
  sculpt(doveWingL, new THREE.BoxGeometry(0.24, 0.01, 0.11), M.doveWhite, [-0.11, 0, -0.01], [0.1, 0.15, 0]);

  const doveWingR = group(dove, 0.065, 0.04, 0);
  sculpt(doveWingR, new THREE.BoxGeometry(0.24, 0.01, 0.11), M.doveWhite, [0.11, 0, -0.01], [0.1, -0.15, 0]);

  return {
    root,
    shellPlatform,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    floatingMirrorGroup,
    venusMirror,
    magicHandAnchor,
    magicHandGlow,
    leftHandGlow,
    hairStrands,
    skirtMesh,
    skirtBase,
    shawlMesh,
    shawlBase,
    doveOrbitGroup,
    dove,
    doveWingL,
    doveWingR,
  };
}

export function animateAphrodite(
  aphrodite: AphroditeParts,
  dt: number,
  t: number,
  mode: 'graca' | 'danca' | 'encanto' | 'mare' = 'graca'
): void {
  const floatY = Math.sin(t * 1.65) * 0.08;
  let pitch = 0.02, roll = 0;

  if (mode === 'danca') {
    pitch = 0.08;
    roll = -0.16;
  }

  aphrodite.body.position.y = floatY;
  aphrodite.body.rotation.set(pitch, 0, roll);
  aphrodite.shellPlatform.rotation.y = Math.sin(t * 0.5) * 0.08;

  aphrodite.legs.L.hip.rotation.x = -0.22 + Math.sin(t * 2.0) * 0.04;
  aphrodite.legs.R.hip.rotation.x = 0.10 - Math.sin(t * 2.0) * 0.04;

  if (mode === 'encanto') {
    aphrodite.rightArm.arm.rotation.set(-0.92, 0.28, 0.95 + Math.sin(t * 2.2) * 0.06);
    aphrodite.rightArm.elbow.rotation.set(-0.42, 0.2, 0.22);
    aphrodite.leftArm.arm.rotation.set(-0.78, -0.28, -0.88 + Math.cos(t * 2.2) * 0.06);
    aphrodite.leftArm.elbow.rotation.set(-0.48, -0.2, -0.22);
  } else if (mode === 'mare') {
    aphrodite.rightArm.arm.rotation.set(-0.35, 0.25, 2.15 + Math.sin(t * 2.0) * 0.06);
    aphrodite.rightArm.elbow.rotation.set(0.45, 0.2, 0.25);
    aphrodite.leftArm.arm.rotation.set(-0.35, -0.25, -2.05 + Math.cos(t * 2.0) * 0.06);
    aphrodite.leftArm.elbow.rotation.set(0.45, -0.2, -0.25);
  } else {
    aphrodite.leftArm.arm.rotation.set(-0.32, -0.25, -0.68 + Math.sin(t * 1.5) * 0.045);
    aphrodite.leftArm.elbow.rotation.set(-0.68, -0.22, -0.18);
    aphrodite.rightArm.arm.rotation.set(-0.26, 0.22, 0.58 + Math.cos(t * 1.5) * 0.045);
    aphrodite.rightArm.elbow.rotation.set(-0.62, 0.25, 0.18);
  }

  // Espelho de Vênus orbital
  const mirrorAng = t * 0.72 + 2.35;
  aphrodite.floatingMirrorGroup.position.set(
    Math.cos(mirrorAng) * 0.94,
    1.88 + Math.sin(t * 2.1) * 0.09,
    Math.sin(mirrorAng) * 0.94
  );
  aphrodite.floatingMirrorGroup.rotation.y = -mirrorAng + Math.PI / 2;
  aphrodite.venusMirror.rotation.z = Math.sin(t * 1.6) * 0.06;

  // Pomba sagrada
  const doveAng = t * 1.1;
  aphrodite.doveOrbitGroup.position.set(
    Math.cos(doveAng) * 0.98,
    2.55 + Math.sin(t * 2.5) * 0.14,
    Math.sin(doveAng) * 0.98
  );
  aphrodite.doveOrbitGroup.rotation.y = -doveAng;
  aphrodite.dove.rotation.z = -0.22;
  const doveFlap = Math.sin(t * 12.0) * 0.55;
  aphrodite.doveWingL.rotation.z = doveFlap;
  aphrodite.doveWingR.rotation.z = -doveFlap;

  // Brilho mágico das mãos
  const handBoost = (mode === 'encanto' || mode === 'mare') ? 0.55 : 0;
  aphrodite.magicHandGlow.scale.setScalar(0.85 + Math.sin(t * 10) * 0.18 + handBoost);
  aphrodite.leftHandGlow.scale.setScalar(0.85 + Math.cos(t * 10) * 0.18 + handBoost);

  // Vento nos cabelos, xale e saia
  const wind = (mode === 'danca' || mode === 'mare') ? 1.85 : 1.0;
  for (const s of aphrodite.hairStrands) {
    s.mesh.rotation.x = Math.sin(t * 2.2 * wind + s.phase) * 0.035;
    s.mesh.rotation.z = Math.cos(t * 1.8 * wind + s.phase) * 0.028;
  }

  const shAttr = aphrodite.shawlMesh.geometry.attributes.position;
  for (let i = 0; i < shAttr.count; i++) {
    const bx = aphrodite.shawlBase[i * 3];
    const by = aphrodite.shawlBase[i * 3 + 1];
    const bz = aphrodite.shawlBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.875 - by) / 1.75));
    const wave = Math.sin(t * 2.8 * wind - normY * 4.0 + bx * 2.5) * 0.14 * normY;
    shAttr.setXYZ(i, bx + Math.sin(t * 2.2 - normY * 3.0) * 0.04 * normY, by, bz + wave);
  }
  shAttr.needsUpdate = true;
  aphrodite.shawlMesh.geometry.computeVertexNormals();

  const skAttr = aphrodite.skirtMesh.geometry.attributes.position;
  for (let i = 0; i < skAttr.count; i++) {
    const bx = aphrodite.skirtBase[i * 3];
    const by = aphrodite.skirtBase[i * 3 + 1];
    const bz = aphrodite.skirtBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.63 - by) / 1.26));
    skAttr.setZ(i, bz + Math.sin(t * 3.0 * wind - normY * 4.0 + bx * 4.0) * 0.042 * normY);
  }
  skAttr.needsUpdate = true;
  aphrodite.skirtMesh.geometry.computeVertexNormals();
}
