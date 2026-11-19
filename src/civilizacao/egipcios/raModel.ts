import * as THREE from 'three';

export interface RaTextures {
  skinBump: THREE.CanvasTexture;
  nemesTex: THREE.CanvasTexture;
  kiltTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export type RaMode = 'gloria' | 'bencao' | 'chuva' | 'ira';

export interface RaModel {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: {
    arm: THREE.Group;
    elbow: THREE.Group;
    hand: THREE.Group;
  };
  leftArm: {
    arm: THREE.Group;
    elbow: THREE.Group;
    hand: THREE.Group;
  };
  wasOrbitGroup: THREE.Group;
  wasScepter: THREE.Group;
  wasEnergyRing: THREE.Mesh;
  ankhOrbitGroup: THREE.Group;
  ankhArtifact: THREE.Group;
  ankhInnerGlow: THREE.Mesh;
  sunDisk: THREE.Group;
  sunAura: THREE.Mesh;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  materials: {
    skin: THREE.MeshStandardMaterial;
    pureGold: THREE.MeshStandardMaterial;
    warmGold: THREE.MeshStandardMaterial;
    lapisLazuli: THREE.MeshStandardMaterial;
    turquoise: THREE.MeshStandardMaterial;
    obsidianKohl: THREE.MeshStandardMaterial;
    nemesMat: THREE.MeshStandardMaterial;
    kiltMat: THREE.MeshStandardMaterial;
    solarDiscMat: THREE.MeshStandardMaterial;
    eyeSolarGold: THREE.MeshStandardMaterial;
  };
}

let cachedRaTextures: RaTextures | null = null;

export function getCachedRaTextures(): RaTextures {
  if (cachedRaTextures) return cachedRaTextures;

  // Bump map de pele e escultura
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

  // Textura do Nemes (Listras de Ouro Polido e Azul Lápis-Lazúli)
  const nemesCanvas = document.createElement('canvas');
  nemesCanvas.width = 512;
  nemesCanvas.height = 512;
  const nCtx = nemesCanvas.getContext('2d');
  if (nCtx) {
    const stripeH = 16;
    for (let y = 0; y < 512; y += stripeH) {
      const isGold = (y / stripeH) % 2 === 0;
      nCtx.fillStyle = isGold ? '#facc15' : '#172554';
      nCtx.fillRect(0, y, 512, stripeH);
      nCtx.fillStyle = isGold ? '#fef08a' : '#1e40af';
      nCtx.fillRect(0, y, 512, 3);
    }
  }
  const nemesTex = new THREE.CanvasTexture(nemesCanvas);
  nemesTex.wrapS = nemesTex.wrapT = THREE.RepeatWrapping;

  // Saiote Shendyt de Linho Branco Plissado com Barrado de Ouro e Turquesa
  const kiltCanvas = document.createElement('canvas');
  kiltCanvas.width = 512;
  kiltCanvas.height = 256;
  const kCtx = kiltCanvas.getContext('2d');
  if (kCtx) {
    const kGrad = kCtx.createLinearGradient(0, 0, 0, 256);
    kGrad.addColorStop(0, '#fffbeb');
    kGrad.addColorStop(0.72, '#fef3c7');
    kGrad.addColorStop(1, '#fde68a');
    kCtx.fillStyle = kGrad;
    kCtx.fillRect(0, 0, 512, 256);

    kCtx.fillStyle = 'rgba(180, 120, 20, 0.16)';
    for (let x = 0; x < 512; x += 6) kCtx.fillRect(x, 0, 2, 256);

    kCtx.fillStyle = '#1e3a8a';
    kCtx.fillRect(0, 198, 512, 42);
    kCtx.fillStyle = '#facc15';
    kCtx.fillRect(0, 193, 512, 5);
    kCtx.fillRect(0, 240, 512, 5);
    for (let x = 8; x < 512; x += 24) {
      kCtx.fillStyle = (x / 24) % 2 === 0 ? '#06b6d4' : '#facc15';
      kCtx.fillRect(x, 205, 14, 28);
    }
  }
  const kiltTex = new THREE.CanvasTexture(kiltCanvas);
  kiltTex.wrapS = kiltTex.wrapT = THREE.RepeatWrapping;

  // Piso do Santuário de Heliópolis com Mandala Solar Egípcia
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    const fGrad = fCtx.createRadialGradient(512, 512, 40, 512, 512, 512);
    fGrad.addColorStop(0, '#fef3c7');
    fGrad.addColorStop(0.45, '#e7c686');
    fGrad.addColorStop(0.85, '#b88946');
    fGrad.addColorStop(1, '#855822');
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 3200; i++) {
      fCtx.fillStyle = i % 2 === 0 ? 'rgba(255, 251, 235, 0.22)' : 'rgba(92, 56, 16, 0.16)';
      fCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 6, 6);
    }

    const cx = 512;
    const cy = 512;
    fCtx.strokeStyle = '#1e3a8a';
    fCtx.lineWidth = 18;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 425, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#eab308';
    fCtx.lineWidth = 8;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 442, 0, Math.PI * 2);
    fCtx.stroke();
    fCtx.beginPath();
    fCtx.arc(cx, cy, 408, 0, Math.PI * 2);
    fCtx.stroke();

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + 0.22;
      const isMajor = i % 2 === 0;
      const outerR = isMajor ? 330 : 245;
      const halfW = isMajor ? 0.13 : 0.09;

      fCtx.fillStyle = isMajor ? '#eab308' : '#0891b2';
      fCtx.beginPath();
      fCtx.moveTo(cx, cy);
      fCtx.lineTo(cx + Math.cos(a - halfW) * 90, cy + Math.sin(a - halfW) * 90);
      fCtx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
      fCtx.lineTo(cx + Math.cos(a + halfW) * 90, cy + Math.sin(a + halfW) * 90);
      fCtx.closePath();
      fCtx.fill();
      fCtx.strokeStyle = '#fef08a';
      fCtx.lineWidth = 2.5;
      fCtx.stroke();
    }

    fCtx.fillStyle = '#facc15';
    fCtx.beginPath();
    fCtx.arc(cx, cy, 76, 0, Math.PI * 2);
    fCtx.fill();
    fCtx.strokeStyle = '#1e3a8a';
    fCtx.lineWidth = 7;
    fCtx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);

  cachedRaTextures = { skinBump, nemesTex, kiltTex, floorTex };
  return cachedRaTextures;
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

export function buildRa(textures?: RaTextures): RaModel {
  const tex = textures || getCachedRaTextures();

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: 0xc58654,
      roughness: 0.36,
      metalness: 0.08,
      bumpMap: tex.skinBump,
      bumpScale: 0.0028,
    }),
    pureGold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x451a03,
      emissiveIntensity: 0.28,
      metalness: 0.95,
      roughness: 0.14,
    }),
    warmGold: new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0x3b1702,
      emissiveIntensity: 0.24,
      metalness: 0.9,
      roughness: 0.2,
    }),
    lapisLazuli: new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0x0f172a,
      emissiveIntensity: 0.3,
      metalness: 0.55,
      roughness: 0.24,
    }),
    turquoise: new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0e7490,
      emissiveIntensity: 0.45,
      metalness: 0.5,
      roughness: 0.22,
    }),
    obsidianKohl: new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.85,
      roughness: 0.22,
    }),
    nemesMat: new THREE.MeshStandardMaterial({
      map: tex.nemesTex,
      metalness: 0.35,
      roughness: 0.35,
      side: THREE.DoubleSide,
    }),
    kiltMat: new THREE.MeshStandardMaterial({
      map: tex.kiltTex,
      roughness: 0.48,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
    solarDiscMat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.65,
      roughness: 0.08,
    }),
    eyeSolarGold: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfde047,
      emissiveIntensity: 1.7,
      roughness: 0.05,
    }),
  };

  const root = new THREE.Group();
  const body = group(root, 0, 1.12, 0);

  // A. Pelve e Pernas
  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.22, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.08, 0.78, 0.82]);

  const legs = {
    L: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
    R: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.14, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.128, 0.09, 0.5, 20), M.skin, [0, -0.24, 0], [0, 0, 0], [1.02, 1, 1.06]);
    sculpt(hip, new THREE.SphereGeometry(0.098, 16, 16), M.skin, [s * 0.016, -0.21, 0.042], [0, 0, 0], [0.94, 1.8, 0.86]);
    sculpt(hip, new THREE.SphereGeometry(0.08, 16, 16), M.skin, [0, -0.5, 0.014]);

    const knee = group(hip, 0, -0.51, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.08, 0.048, 0.46, 18), M.skin, [0, -0.23, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.076, 16, 16), M.skin, [0, -0.15, -0.034], [0, 0, 0], [0.96, 1.65, 0.95]);

    const anklet = new THREE.TorusGeometry(0.056, 0.008, 8, 24);
    anklet.rotateX(Math.PI / 2);
    sculpt(knee, anklet, M.pureGold, [0, -0.41, 0.008]);

    const ankle = group(knee, 0, -0.46, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.084, 0.044, 0.21), M.skin, [0, -0.02, 0.038], [0.2, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.092, 0.015, 0.224), M.pureGold, [0, -0.042, 0.038], [0.2, 0, 0]);
    const strap = new THREE.TorusGeometry(0.054, 0.005, 8, 20);
    strap.rotateX(Math.PI / 2);
    sculpt(ankle, strap, M.pureGold, [0, 0.02, -0.02], [0.12, 0, 0]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.26, -0.08, -0.04);
  legs.L.knee.rotation.set(0.34, 0, 0);
  legs.R.hip.rotation.set(0.18, 0.08, 0.04);
  legs.R.knee.rotation.set(0.2, 0, 0);

  // B. Tronco Real + Colar Usekh
  const torso = group(body, 0, 1.32, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.43),
    new THREE.Vector2(0.225, -0.39),
    new THREE.Vector2(0.195, -0.19),
    new THREE.Vector2(0.245, 0.03),
    new THREE.Vector2(0.345, 0.26),
    new THREE.Vector2(0.305, 0.42),
    new THREE.Vector2(0.13, 0.49),
    new THREE.Vector2(0.01, 0.5),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.14, 1.02, 0.72]);

  const pecGeo = new THREE.SphereGeometry(0.19, 22, 22);
  sculpt(torso, pecGeo, M.skin, [-0.16, 0.22, 0.148], [0.12, -0.22, -0.14], [1.04, 0.85, 0.56]);
  sculpt(torso, pecGeo, M.skin, [0.16, 0.22, 0.148], [0.12, 0.22, 0.14], [1.04, 0.85, 0.56]);

  const abGeo = new THREE.SphereGeometry(0.075, 14, 14);
  [
    { y: 0.03, sx: 0.94, sy: 0.75, z: 0.188 },
    { y: -0.08, sx: 0.9, sy: 0.78, z: 0.184 },
  ].forEach((lvl) => {
    sculpt(torso, abGeo, M.skin, [-0.06, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.44]);
    sculpt(torso, abGeo, M.skin, [0.06, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.44]);
  });

  const collarMats = [M.pureGold, M.lapisLazuli, M.pureGold, M.turquoise, M.pureGold, M.lapisLazuli];
  for (let c = 0; c < 6; c++) {
    const colRad = 0.155 + c * 0.028;
    const usekh = new THREE.TorusGeometry(colRad, 0.015, 10, 36, Math.PI * 1.15);
    usekh.rotateX(Math.PI / 2);
    usekh.rotateY(-Math.PI * 0.075);
    sculpt(torso, usekh, collarMats[c], [0, 0.41 - c * 0.022, 0.02 + c * 0.006], [0.18, 0, 0], [1.08, 1, 0.78]);
  }

  const scarab = group(torso, 0, 0.24, 0.228);
  sculpt(scarab, new THREE.SphereGeometry(0.032, 14, 14), M.pureGold, [0, 0, 0], [0, 0, 0], [0.85, 1.25, 0.45]);
  sculpt(scarab, new THREE.OctahedronGeometry(0.02, 0), M.turquoise, [0, 0, 0.012]);

  sculpt(torso, new THREE.CylinderGeometry(0.105, 0.132, 0.25, 20), M.skin, [0, 0.52, -0.006], [0.06, 0, 0]);

  // C. Elmo / Coroa Faraônica de Rá (Nemes + Falcão Dourado + Disco Solar + Uraeus)
  const head = group(torso, 0, 0.73, 0.032);

  sculpt(head, new THREE.SphereGeometry(0.185, 36, 36), M.pureGold, [0, 0.01, 0.005], [0, 0, 0], [0.92, 1.14, 0.98]);

  const beakGroup = group(head, 0, -0.01, 0.165);
  const upperBeakCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.035, -0.01),
    new THREE.Vector3(0, 0.025, 0.065),
    new THREE.Vector3(0, -0.015, 0.105),
    new THREE.Vector3(0, -0.055, 0.095),
  ]);
  sculpt(beakGroup, new THREE.TubeGeometry(upperBeakCurve, 16, 0.026, 10, false), M.pureGold, [0, 0, 0], [0, 0, 0], [0.85, 1.1, 1.0]);
  sculpt(beakGroup, new THREE.ConeGeometry(0.022, 0.065, 8), M.pureGold, [0, -0.058, 0.092], [2.75, 0, 0], [0.8, 1, 1]);
  sculpt(beakGroup, new THREE.ConeGeometry(0.024, 0.085, 8), M.warmGold, [0, -0.048, 0.045], [1.65, 0, 0], [0.85, 1, 0.8]);

  for (const side of [-1, 1]) {
    const eyeGroup = group(head, side * 0.068, 0.038, 0.148);
    eyeGroup.rotation.y = side * 0.34;

    sculpt(eyeGroup, new THREE.SphereGeometry(0.022, 16, 16), M.eyeSolarGold, [0, 0, 0], [0, 0, 0], [1.22, 0.72, 0.7]);
    sculpt(eyeGroup, new THREE.BoxGeometry(0.068, 0.008, 0.016), M.lapisLazuli, [side * 0.012, 0.014, 0.008], [0, 0, side * -0.14]);
    sculpt(eyeGroup, new THREE.BoxGeometry(0.062, 0.007, 0.016), M.lapisLazuli, [side * 0.008, -0.013, 0.008], [0, 0, side * 0.08]);
    sculpt(eyeGroup, new THREE.BoxGeometry(0.009, 0.055, 0.014), M.lapisLazuli, [0, -0.042, 0.01], [0.1, 0, side * -0.15]);
  }

  const royalBeard = group(head, 0, -0.12, 0.155);
  sculpt(royalBeard, new THREE.CylinderGeometry(0.022, 0.014, 0.22, 12), M.lapisLazuli, [0, -0.1, 0], [0.14, 0, 0]);
  for (let b = 0; b < 4; b++) {
    const by = -0.03 - b * 0.045;
    sculpt(royalBeard, new THREE.TorusGeometry(0.021 - b * 0.0015, 0.0045, 8, 16), M.pureGold, [0, by, b * 0.006], [Math.PI / 2 + 0.14, 0, 0]);
  }

  const nemesCrown = group(head, 0, 0.02, -0.01);

  const frontBand = new THREE.CylinderGeometry(0.194, 0.19, 0.042, 32, 1, true, -Math.PI * 0.65, Math.PI * 1.3);
  sculpt(nemesCrown, frontBand, M.pureGold, [0, 0.105, 0.01], [0.08, 0, 0], [0.96, 1, 1.06]);

  sculpt(nemesCrown, new THREE.SphereGeometry(0.245, 32, 24), M.nemesMat, [0, 0.06, -0.04], [-0.14, 0, 0], [1.14, 1.04, 1.08]);

  for (const side of [-1, 1]) {
    const lappetPts = [
      new THREE.Vector3(side * 0.21, 0.08, 0.04),
      new THREE.Vector3(side * 0.23, -0.08, 0.1),
      new THREE.Vector3(side * 0.19, -0.26, 0.15),
      new THREE.Vector3(side * 0.16, -0.4, 0.17),
    ];
    const lappetTube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lappetPts), 18, 0.048, 10, false);
    lappetTube.scale(1.15, 1, 0.42);
    sculpt(nemesCrown, lappetTube, M.nemesMat);

    sculpt(nemesCrown, new THREE.CylinderGeometry(0.042, 0.036, 0.035, 12), M.pureGold, [side * 0.184, -0.41, 0.072], [0.15, 0, 0], [1.1, 1, 0.55]);
  }

  sculpt(nemesCrown, new THREE.CylinderGeometry(0.042, 0.024, 0.36, 14), M.nemesMat, [0, -0.18, -0.24], [0.18, 0, 0]);
  sculpt(nemesCrown, new THREE.CylinderGeometry(0.028, 0.028, 0.03, 12), M.pureGold, [0, -0.34, -0.27], [0.18, 0, 0]);

  // Uraeus e Grande Disco Solar Coroado
  const browUraeus = group(nemesCrown, 0, 0.125, 0.205);
  sculpt(browUraeus, new THREE.CylinderGeometry(0.014, 0.02, 0.11, 10), M.pureGold, [0, 0.04, 0], [-0.15, 0, 0]);
  sculpt(browUraeus, new THREE.SphereGeometry(0.032, 12, 12), M.pureGold, [0, 0.09, 0.015], [0, 0, 0], [1.15, 1.35, 0.45]);
  sculpt(browUraeus, new THREE.OctahedronGeometry(0.014, 0), M.turquoise, [0, 0.09, 0.028]);

  const sunCrownGroup = group(nemesCrown, 0, 0.44, -0.02);

  for (const side of [-1, 1]) {
    const cradleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.05, -0.2, 0.02),
      new THREE.Vector3(side * 0.24, -0.1, 0.02),
      new THREE.Vector3(side * 0.28, 0.1, 0.02),
      new THREE.Vector3(side * 0.2, 0.26, 0.02),
    ]);
    sculpt(sunCrownGroup, new THREE.TubeGeometry(cradleCurve, 18, 0.022, 8, false), M.pureGold);
  }

  const sunDisk = group(sunCrownGroup, 0, 0.04, 0.02);
  sculpt(sunDisk, new THREE.SphereGeometry(0.22, 28, 28), M.solarDiscMat, [0, 0, 0], [0, 0, 0], [1, 1, 0.32]);
  sculpt(sunDisk, new THREE.TorusGeometry(0.225, 0.024, 12, 40), M.pureGold);

  const sunAura = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  sunAura.scale.set(1, 1, 0.35);
  sunDisk.add(sunAura);

  // D. Braços e Mãos Abertas
  function createRaArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.39, 0.33, -0.008);

    sculpt(
      arm,
      new THREE.SphereGeometry(0.132, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.48),
      M.pureGold,
      [s * 0.01, 0.03, 0],
      [0, 0, s * -0.25],
      [1.08, 0.78, 1.12]
    );

    sculpt(arm, new THREE.SphereGeometry(0.112, 18, 18), M.skin, [0, -0.01, 0]);
    sculpt(arm, new THREE.CapsuleGeometry(0.074, 0.26, 12, 16), M.skin, [s * 0.018, -0.17, 0], [0, 0, s * 0.06]);

    const armlet = new THREE.TorusGeometry(0.078, 0.009, 8, 24);
    armlet.rotateX(Math.PI / 2);
    sculpt(arm, armlet, M.pureGold, [s * 0.015, -0.14, 0]);
    sculpt(arm, armlet, M.turquoise, [s * 0.017, -0.16, 0]);

    const elbow = group(arm, s * 0.035, -0.34, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.072, 0.048, 0.31, 18), M.skin, [0, -0.15, 0]);

    const bracer = group(elbow, 0, -0.23, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.058, 0.052, 0.11, 24, 1, true), M.pureGold);
    const bRing = new THREE.TorusGeometry(0.056, 0.006, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.lapisLazuli, [0, 0.05, 0]);
    sculpt(bracer, bRing, M.lapisLazuli, [0, -0.05, 0]);
    sculpt(bracer, new THREE.OctahedronGeometry(0.016, 0), M.turquoise, [s * 0.058, 0, 0]);

    const hand = group(elbow, 0, -0.32, 0);
    sculpt(hand, new THREE.BoxGeometry(0.062, 0.072, 0.03), M.skin, [0, -0.016, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.0085, 0.035, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.015;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.054, 0.01], [0.32, 0, (f - 1.5) * 0.05]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.034, -0.025, 0.018], [0.45, 0, -s * 0.55], [1.05, 0.9, 1.05]);

    return { arm, elbow, hand };
  }

  const rightArm = createRaArm(true);
  const leftArm = createRaArm(false);

  // E. Artefatos Sagrados Flutuando em Pé
  // 1. Cetro Was flutuando em pé à direita
  const wasOrbitGroup = new THREE.Group();
  root.add(wasOrbitGroup);
  const wasScepter = new THREE.Group();
  wasOrbitGroup.add(wasScepter);

  sculpt(wasScepter, new THREE.CylinderGeometry(0.02, 0.018, 2.25, 16), M.pureGold, [0, 0, 0]);
  for (const wy of [-0.75, -0.35, 0.15, 0.65, 0.95]) {
    sculpt(wasScepter, new THREE.CylinderGeometry(0.027, 0.027, 0.036, 16), wy > 0 ? M.turquoise : M.lapisLazuli, [0, wy, 0]);
  }
  sculpt(wasScepter, new THREE.ConeGeometry(0.026, 0.16, 4), M.pureGold, [-0.028, -1.16, 0], [Math.PI, 0, -0.28]);
  sculpt(wasScepter, new THREE.ConeGeometry(0.026, 0.16, 4), M.pureGold, [0.028, -1.16, 0], [Math.PI, 0, 0.28]);

  const wasTop = group(wasScepter, 0, 1.15, 0);
  sculpt(wasTop, new THREE.BoxGeometry(0.065, 0.11, 0.042), M.pureGold, [0, 0.02, 0]);
  sculpt(wasTop, new THREE.ConeGeometry(0.034, 0.18, 5), M.pureGold, [0, 0.04, 0.09], [1.85, 0, 0], [0.85, 1, 1]);
  sculpt(wasTop, new THREE.ConeGeometry(0.016, 0.12, 4), M.pureGold, [-0.02, 0.11, -0.03], [-0.45, 0, 0.15]);
  sculpt(wasTop, new THREE.ConeGeometry(0.016, 0.12, 4), M.pureGold, [0.02, 0.11, -0.03], [-0.45, 0, -0.15]);
  sculpt(wasTop, new THREE.OctahedronGeometry(0.022, 0), M.turquoise, [0, 0.03, 0.025]);

  const wasEnergyRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.008, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  wasEnergyRing.rotation.x = Math.PI / 2;
  wasEnergyRing.position.y = 0.25;
  wasScepter.add(wasEnergyRing);

  // 2. Chave Ankh flutuando em pé à esquerda
  const ankhOrbitGroup = new THREE.Group();
  root.add(ankhOrbitGroup);
  const ankhArtifact = new THREE.Group();
  ankhOrbitGroup.add(ankhArtifact);

  sculpt(ankhArtifact, new THREE.BoxGeometry(0.055, 0.48, 0.032), M.pureGold, [0, -0.22, 0]);
  sculpt(ankhArtifact, new THREE.BoxGeometry(0.022, 0.42, 0.038), M.lapisLazuli, [0, -0.22, 0]);
  sculpt(ankhArtifact, new THREE.BoxGeometry(0.42, 0.055, 0.032), M.pureGold, [0, 0.04, 0]);
  sculpt(ankhArtifact, new THREE.BoxGeometry(0.36, 0.022, 0.038), M.turquoise, [0, 0.04, 0]);
  sculpt(ankhArtifact, new THREE.OctahedronGeometry(0.036, 0), M.solarDiscMat, [0, 0.04, 0]);

  const ankhLoop = new THREE.TorusGeometry(0.125, 0.026, 12, 36);
  sculpt(ankhArtifact, ankhLoop, M.pureGold, [0, 0.22, 0], [0, 0, 0], [0.88, 1.32, 0.75]);

  const ankhInnerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 14),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ankhInnerGlow.position.set(0, 0.22, 0);
  ankhInnerGlow.scale.set(0.85, 1.25, 0.35);
  ankhArtifact.add(ankhInnerGlow);

  // F. Saiote Real Egípcio Shendyt + Avental Cerimonial
  const garments = group(torso, 0, 0, 0);

  const beltGeo = new THREE.TorusGeometry(0.245, 0.026, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.pureGold, [0, -0.34, 0.008], [0.05, 0, -0.03], [1.08, 1, 0.82]);

  const cartouche = group(garments, 0, -0.34, 0.205);
  sculpt(cartouche, new THREE.CylinderGeometry(0.052, 0.052, 0.024, 20), M.pureGold, [0, 0, 0], [Math.PI / 2, 0, 0], [1.2, 1, 0.9]);
  sculpt(cartouche, new THREE.OctahedronGeometry(0.028, 0), M.turquoise, [0, 0, 0.014]);

  const skirtGeo = new THREE.CylinderGeometry(0.245, 0.46, 0.78, 48, 18, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i);
    let y = skPos.getY(i);
    let z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.39 - y) / 0.78));
    const pleat = Math.sin(angle * 22) * 0.022 * (0.25 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.06;
    z = Math.sin(angle) * r * 0.82 - normY * 0.06;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.kiltMat, [0, -0.72, 0], [0.04, 0, 0]);

  const apron = group(garments, 0, -0.58, 0.215);
  apron.rotation.x = -0.08;
  sculpt(apron, new THREE.BoxGeometry(0.16, 0.48, 0.022), M.pureGold);
  sculpt(apron, new THREE.BoxGeometry(0.11, 0.42, 0.026), M.lapisLazuli);
  for (let r = 0; r < 5; r++) {
    sculpt(apron, new THREE.BoxGeometry(0.12, 0.024, 0.03), r % 2 === 0 ? M.pureGold : M.turquoise, [0, 0.16 - r * 0.08, 0]);
  }

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    wasOrbitGroup,
    wasScepter,
    wasEnergyRing,
    ankhOrbitGroup,
    ankhArtifact,
    ankhInnerGlow,
    sunDisk,
    sunAura,
    skirtMesh,
    skirtBase,
    materials: M,
  };
}

export function animateRa(ra: RaModel, dt: number, t: number, mode: RaMode = 'gloria') {
  const hoverY = Math.sin(t * 1.65) * 0.08;
  ra.body.position.y = 1.12 + hoverY;

  // Postura dos braços
  if (mode === 'ira') {
    ra.rightArm.arm.rotation.set(-0.42, 0.22, 1.15 + Math.sin(t * 2.2) * 0.05);
    ra.rightArm.elbow.rotation.set(-0.45, 0.2, 0.2);
    ra.leftArm.arm.rotation.set(-0.42, -0.22, -1.15 - Math.cos(t * 2.2) * 0.05);
    ra.leftArm.elbow.rotation.set(-0.45, -0.2, -0.2);
  } else {
    ra.rightArm.arm.rotation.set(-0.28, 0.2, 0.72 + Math.sin(t * 1.6) * 0.04);
    ra.rightArm.elbow.rotation.set(-0.62, 0.25, 0.18);
    ra.leftArm.arm.rotation.set(-0.28, -0.2, -0.72 - Math.cos(t * 1.6) * 0.04);
    ra.leftArm.elbow.rotation.set(-0.62, -0.25, -0.18);
  }

  // Artefatos sagrados flutuando em pé verticais ao lado de cada mão
  const artifactBobR = Math.sin(t * 2.4) * 0.08;
  const artifactBobL = Math.cos(t * 2.4) * 0.08;

  ra.wasOrbitGroup.position.set(0.86, 2.02 + hoverY + artifactBobR, 0.24);
  ra.wasScepter.rotation.set(0, Math.sin(t * 0.9) * 0.22, 0);
  ra.wasEnergyRing.rotation.z += dt * 2.8;

  ra.ankhOrbitGroup.position.set(-0.86, 2.08 + hoverY + artifactBobL, 0.24);
  ra.ankhArtifact.rotation.set(0, Math.sin(t * 1.2) * 0.35, 0);
  ra.ankhInnerGlow.scale.set(0.85 + Math.sin(t * 8) * 0.12, 1.25 + Math.sin(t * 8) * 0.12, 0.35);

  // Pulso do Disco Solar
  const powerBoost = mode === 'ira' || mode === 'chuva' || mode === 'bencao' ? 1.45 : 1.0;
  ra.sunDisk.scale.setScalar(1 + Math.sin(t * 6) * 0.05 * powerBoost);
  ra.sunAura.scale.set(1.1 + Math.cos(t * 8) * 0.12, 1.1 + Math.cos(t * 8) * 0.12, 0.35);

  // Ondulação do saiote real Shendyt
  const skAttr = ra.skirtMesh.geometry.attributes.position;
  for (let i = 0; i < skAttr.count; i++) {
    const bx = ra.skirtBase[i * 3];
    const by = ra.skirtBase[i * 3 + 1];
    const bz = ra.skirtBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.39 - by) / 0.78));
    skAttr.setZ(i, bz + Math.sin(t * 2.8 - normY * 3.5 + bx * 4.0) * 0.025 * normY);
  }
  skAttr.needsUpdate = true;
  ra.skirtMesh.geometry.computeVertexNormals();
}
