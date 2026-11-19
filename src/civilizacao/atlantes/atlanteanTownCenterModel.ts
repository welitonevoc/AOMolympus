import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO VISUAL DAS DIVINDADES ATLANTES (KRONOS, ORANOS, GAIA)
   ========================================================================== */
export type AtlanteanTownCenterGodKey = 'kronos' | 'oranos' | 'gaia';

export interface AtlanteanTownCenterTheme {
  id: AtlanteanTownCenterGodKey;
  godName: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  wallBase: number;
  wallBright: number;
  trimHex: number;
  accentHex: number;
  goldHex: number;
  flameHex: number;
  glowHex: number;
  particleHex: number;
  groundGrass: string;
  groundDirt: string;
  floorRing1: string;
  floorRing2: string;
}

export const ATLANTEAN_TOWN_CENTER_THEMES: Record<AtlanteanTownCenterGodKey, AtlanteanTownCenterTheme> = {
  kronos: {
    id: 'kronos',
    godName: 'Kronos',
    bgHex: 0x0b1324,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e1b4b,
    rimHex: 0x38bdf8,
    wallBase: 0xe5e0d5,
    wallBright: 0xf1ece1,
    trimHex: 0x475569,
    accentHex: 0x2563eb,
    goldHex: 0xfacc15,
    flameHex: 0x38bdf8,
    glowHex: 0x38bdf8,
    particleHex: 0x7dd3fc,
    groundGrass: '#56822d',
    groundDirt: '#bfa378',
    floorRing1: '#312e81',
    floorRing2: '#facc15'
  },
  oranos: {
    id: 'oranos',
    godName: 'Oranos',
    bgHex: 0x091c30,
    hemiSky: 0xfef9c3,
    hemiGround: 0x0369a1,
    rimHex: 0xfacc15,
    wallBase: 0xf8fafc,
    wallBright: 0xffffff,
    trimHex: 0x38bdf8,
    accentHex: 0xfacc15,
    goldHex: 0xfde047,
    flameHex: 0xfacc15,
    glowHex: 0xfacc15,
    particleHex: 0xfef08a,
    groundGrass: '#5c8d32',
    groundDirt: '#cbb082',
    floorRing1: '#0284c7',
    floorRing2: '#fde047'
  },
  gaia: {
    id: 'gaia',
    godName: 'Gaia',
    bgHex: 0x061812,
    hemiSky: 0xd1fae5,
    hemiGround: 0x064e3b,
    rimHex: 0x10b981,
    wallBase: 0xe7e2d3,
    wallBright: 0xf0ece0,
    trimHex: 0x065f46,
    accentHex: 0x10b981,
    goldHex: 0xf59e0b,
    flameHex: 0x10b981,
    glowHex: 0x10b981,
    particleHex: 0x6ee7b7,
    groundGrass: '#3e7326',
    groundDirt: '#9e845c',
    floorRing1: '#065f46',
    floorRing2: '#f59e0b'
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS ATLANTES
   ========================================================================== */
const texCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateTexture(key: string, fn: () => THREE.CanvasTexture): THREE.CanvasTexture {
  if (texCache.has(key)) return texCache.get(key)!;
  const tex = fn();
  texCache.set(key, tex);
  return tex;
}

export function createAtlanteanWallTexture(isBright = false): THREE.CanvasTexture {
  return getOrCreateTexture(`atl_wall_${isBright}`, () => {
    if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = isBright ? '#f1ece1' : '#e5e0d5';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(60,55,45,0.07)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 6, 6);
    }
    ctx.fillStyle = 'rgba(105, 100, 90, 0.30)';
    ctx.fillRect(0, 416, 512, 96);
    ctx.strokeStyle = 'rgba(40, 38, 35, 0.42)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.strokeRect(x, 416, 64, 48);
      ctx.strokeRect(x + 32, 464, 64, 48);
    }
    ctx.fillStyle = 'rgba(90, 85, 75, 0.26)';
    ctx.fillRect(0, 0, 512, 64);
    ctx.strokeStyle = 'rgba(35, 32, 28, 0.50)';
    ctx.lineWidth = 3;
    for (let x = 18; x < 512; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 32, 11, 0, Math.PI * 1.65);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });
}

export function createSteppedRoofTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('atl_stepped_roof', () => {
    if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(0, 0, 512, 512);
    const steps = 16;
    const stepH = 512 / steps;
    for (let s = 0; s < steps; s++) {
      const y = s * stepH;
      const grad = ctx.createLinearGradient(0, y, 0, y + stepH);
      grad.addColorStop(0, 'rgba(255,255,255,0.24)');
      grad.addColorStop(0.75, 'rgba(120,115,108,0.14)');
      grad.addColorStop(1, 'rgba(20,20,22,0.50)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, 512, stepH);
      ctx.strokeStyle = 'rgba(25, 25, 28, 0.40)';
      ctx.lineWidth = 2;
      const off = (s % 2 === 0) ? 0 : 32;
      for (let x = -32; x < 512; x += 64) {
        ctx.strokeRect(x + off, y, 64, stepH);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });
}

export function createCarvedTrimTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('atl_carved_trim', () => {
    if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 256, 512);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.50)';
    ctx.lineWidth = 4;
    for (let y = 24; y < 512; y += 44) {
      ctx.strokeRect(18, y - 14, 220, 32);
      ctx.beginPath();
      ctx.arc(72, y + 2, 10, 0, Math.PI * 1.75);
      ctx.moveTo(128, y - 8);
      ctx.lineTo(128, y + 12);
      ctx.arc(184, y + 2, 10, Math.PI, Math.PI * 2.75);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  });
}

/* ==========================================================================
   3. ESTRUTURAS DE MATERIAIS & REGISTROS
   ========================================================================= */
export interface AtlanteanTownCenterMaterials {
  wallBase: THREE.MeshStandardMaterial;
  wallBright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  statue: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  divineGlow: THREE.MeshStandardMaterial;
  flames: THREE.Mesh[];
  emblems: Array<{ kronos: THREE.Group; oranos: THREE.Group; gaia: THREE.Group }>;
  godDecors: Array<{ kronosDeco: THREE.Group; oranosDeco: THREE.Group; gaiaDeco: THREE.Group }>;
  relics: THREE.Mesh[];
  relicRings: THREE.Mesh[];
  statueWings: THREE.Group[];
}

export function createAtlanteanTownCenterMaterials(theme: AtlanteanTownCenterTheme): AtlanteanTownCenterMaterials {
  return {
    wallBase: new THREE.MeshStandardMaterial({
      map: createAtlanteanWallTexture(false),
      color: theme.wallBase,
      roughness: 0.64,
      metalness: 0.08
    }),
    wallBright: new THREE.MeshStandardMaterial({
      map: createAtlanteanWallTexture(true),
      color: theme.wallBright,
      roughness: 0.52,
      metalness: 0.12
    }),
    trim: new THREE.MeshStandardMaterial({
      map: createCarvedTrimTexture(),
      color: theme.trimHex,
      roughness: 0.44,
      metalness: 0.26
    }),
    accent: new THREE.MeshStandardMaterial({
      color: theme.accentHex,
      roughness: 0.34,
      metalness: 0.42
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.28,
      metalness: 0.90,
      roughness: 0.20
    }),
    roof: new THREE.MeshStandardMaterial({
      map: createSteppedRoofTexture(),
      roughness: 0.56,
      metalness: 0.14,
      side: THREE.DoubleSide
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x5c3317,
      roughness: 0.72
    }),
    statue: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.52,
      metalness: 0.18
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.78
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.40,
      roughness: 0.12
    }),
    flame: new THREE.MeshBasicMaterial({
      color: theme.flameHex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    }),
    divineGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.glowHex,
      emissiveIntensity: 2.8,
      roughness: 0.12
    }),
    flames: [],
    emblems: [],
    godDecors: [],
    relics: [],
    relicRings: [],
    statueWings: []
  };
}

/* ==========================================================================
   4. HELPERS GEOMÉTRICOS ATLANTES
   ========================================================================== */
function grp(parent?: THREE.Group, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function box(
  parent: THREE.Group,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function cyl(
  parent: THREE.Group,
  rt: number,
  rb: number,
  h: number,
  segs: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function createAtlanteanEmblem(
  parent: THREE.Group,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  accentMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  emblemRegistry?: Array<{ kronos: THREE.Group; oranos: THREE.Group; gaia: THREE.Group }>
): THREE.Group {
  const root = grp(parent, pos[0], pos[1], pos[2]);
  root.scale.setScalar(scale);

  const kronos = grp(root);
  kronos.add(new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 8, 24), goldMat));
  kronos.add(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 8, 24), glowMat));
  cyl(kronos, 0.11, 0.01, 0.16, 8, glowMat, [0, 0.08, 0]);
  cyl(kronos, 0.01, 0.11, 0.16, 8, glowMat, [0, -0.08, 0]);
  box(kronos, 0.24, 0.03, 0.05, goldMat, [0, 0.16, 0]);
  box(kronos, 0.24, 0.03, 0.05, goldMat, [0, -0.16, 0]);

  const oranos = grp(root);
  oranos.add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 28), glowMat));
  oranos.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.10, 0), goldMat));
  for (const s of [-1, 1]) {
    box(oranos, 0.24, 0.05, 0.03, goldMat, [s * 0.20, 0.06, 0], [0, 0, s * 0.35]);
    box(oranos, 0.18, 0.04, 0.03, glowMat, [s * 0.17, -0.03, 0], [0, 0, s * 0.18]);
  }
  oranos.visible = false;

  const gaia = grp(root);
  gaia.add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 24), accentMat));
  const gSeed = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), glowMat);
  gSeed.scale.set(0.85, 1.35, 0.85);
  gaia.add(gSeed);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 5), accentMat);
    leaf.position.set(Math.cos(a) * 0.20, Math.sin(a) * 0.20, 0);
    leaf.rotation.z = a - Math.PI / 2;
    gaia.add(leaf);
  }
  gaia.visible = false;

  if (emblemRegistry) emblemRegistry.push({ kronos, oranos, gaia });
  return root;
}

export function buildSteppedTrapezoidRoof(
  parent: THREE.Group,
  length: number,
  widthBot: number,
  height: number,
  roofMat: THREE.Material,
  trimMat: THREE.Material,
  accentMat: THREE.Material,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  emblemRegistry?: Array<{ kronos: THREE.Group; oranos: THREE.Group; gaia: THREE.Group }> | null,
  withCaps = true
): THREE.Group {
  const rGroup = grp(parent, pos[0], pos[1], pos[2]);
  box(rGroup, length + 0.20, 0.10, widthBot + 0.20, trimMat, [0, 0.05, 0]);
  box(rGroup, length + 0.24, 0.06, widthBot + 0.24, accentMat, [0, 0.13, 0]);

  const rxB = length * 0.5, rzB = widthBot * 0.5;
  const rxT = length * 0.42, rzT = widthBot * 0.20;
  const y0 = 0.16, y1 = 0.16 + height;

  const geom = new THREE.BufferGeometry();
  const verts = new Float32Array([
    -rxB, y0, rzB,   rxB, y0, rzB,   rxT, y1, rzT,
    -rxB, y0, rzB,   rxT, y1, rzT,  -rxT, y1, rzT,
     rxB, y0, -rzB, -rxB, y0, -rzB, -rxT, y1, -rzT,
     rxB, y0, -rzB, -rxT, y1, -rzT,  rxT, y1, -rzT,
    -rxB, y0, -rzB, -rxB, y0, rzB,  -rxT, y1, rzT,
    -rxB, y0, -rzB, -rxT, y1, rzT,  -rxT, y1, -rzT,
     rxB, y0, rzB,   rxB, y0, -rzB,  rxT, y1, -rzT,
     rxB, y0, rzB,   rxT, y1, -rzT,  rxT, y1, rzT,
    -rxT, y1, rzT,   rxT, y1, rzT,   rxT, y1, -rzT,
    -rxT, y1, rzT,   rxT, y1, -rzT, -rxT, y1, -rzT
  ]);
  const uvs = new Float32Array(30 * 2);
  for (let i = 0; i < 30; i++) {
    uvs[i * 2] = (verts[i * 3] + rxB) / length;
    uvs[i * 2 + 1] = (verts[i * 3 + 1] - y0) / height;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  const roofMesh = new THREE.Mesh(geom, roofMat);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  rGroup.add(roofMesh);

  box(rGroup, length * 0.86, 0.14, widthBot * 0.36, trimMat, [0, y1 + 0.07, 0]);
  box(rGroup, length * 0.88, 0.05, widthBot * 0.40, accentMat, [0, y1 + 0.16, 0]);

  if (withCaps) {
    for (const sx of [-1, 1]) {
      const capX = sx * (length * 0.36);
      box(rGroup, 0.36, 0.22, widthBot * 0.46, trimMat, [capX, y1 + 0.10, 0]);
      box(rGroup, 0.40, 0.05, widthBot * 0.50, accentMat, [capX, y1 + 0.23, 0]);
    }
  }

  if (emblemRegistry) {
    createAtlanteanEmblem(rGroup, goldMat, glowMat, accentMat, [0, y0 + height * 0.48, rzB * 0.72], 0.72, emblemRegistry);
  }
  return rGroup;
}

export function buildCurvedOctagonalDome(
  parent: THREE.Group,
  radius: number,
  height: number,
  roofMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0]
): THREE.Group {
  const dGroup = grp(parent, pos[0], pos[1], pos[2]);
  cyl(dGroup, radius * 1.04, radius * 1.08, 0.14, 8, trimMat, [0, 0.07, 0], [0, Math.PI / 8, 0]);
  cyl(dGroup, radius * 1.06, radius * 1.06, 0.05, 8, goldMat, [0, 0.16, 0], [0, Math.PI / 8, 0]);

  const pts = [
    new THREE.Vector2(radius * 1.02, 0.18),
    new THREE.Vector2(radius * 0.92, 0.18 + height * 0.26),
    new THREE.Vector2(radius * 0.74, 0.18 + height * 0.56),
    new THREE.Vector2(radius * 0.50, 0.18 + height * 0.84),
    new THREE.Vector2(radius * 0.28, 0.18 + height)
  ];
  const domeGeo = new THREE.LatheGeometry(pts, 8);
  domeGeo.rotateY(Math.PI / 8);
  const domeMesh = new THREE.Mesh(domeGeo, roofMat);
  domeMesh.castShadow = true;
  domeMesh.receiveShadow = true;
  dGroup.add(domeMesh);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.07, height * 1.02, 0.09), trimMat);
    rib.position.set(Math.cos(a) * radius * 0.65, 0.18 + height * 0.5, Math.sin(a) * radius * 0.65);
    rib.rotation.set(0, -a, 0.42);
    rib.castShadow = true;
    dGroup.add(rib);
  }

  const topY = 0.18 + height;
  cyl(dGroup, radius * 0.34, radius * 0.38, 0.11, 8, trimMat, [0, topY + 0.055, 0], [0, Math.PI / 8, 0]);
  cyl(dGroup, radius * 0.22, radius * 0.26, 0.12, 8, roofMat, [0, topY + 0.16, 0], [0, Math.PI / 8, 0]);
  cyl(dGroup, 0.03, radius * 0.14, 0.15, 8, goldMat, [0, topY + 0.28, 0], [0, Math.PI / 8, 0]);
  return dGroup;
}

export function buildAtlanteanBrazier(
  parent: THREE.Group,
  goldMat: THREE.Material,
  accentMat: THREE.Material,
  flameMat: THREE.Material,
  flameRegistry?: THREE.Mesh[],
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const b = grp(parent, pos[0], pos[1], pos[2]);
  b.scale.setScalar(scale);
  cyl(b, 0.14, 0.18, 0.08, 8, goldMat, [0, 0.04, 0], [0, Math.PI / 8, 0]);
  cyl(b, 0.05, 0.07, 0.34, 8, accentMat, [0, 0.25, 0], [0, Math.PI / 8, 0]);
  cyl(b, 0.22, 0.11, 0.12, 8, goldMat, [0, 0.46, 0], [0, Math.PI / 8, 0]);
  const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), flameMat);
  flame.scale.set(0.85, 1.55, 0.85);
  flame.position.set(0, 0.64, 0);
  b.add(flame);
  if (flameRegistry) flameRegistry.push(flame);
  return b;
}

export function buildAtlanteanGuardianMonument(
  parent: THREE.Group,
  M: AtlanteanTownCenterMaterials,
  tier: number,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  scale = 1.0
): THREE.Group {
  const ped = grp(parent, pos[0], pos[1], pos[2]);
  ped.rotation.y = rotY;
  ped.scale.setScalar(scale);

  box(ped, 0.96, 0.15, 0.96, M.trim, [0, 0.075, 0]);
  box(ped, 0.82, 0.52, 0.82, M.wallBright, [0, 0.41, 0]);
  box(ped, 0.88, 0.09, 0.88, M.accent, [0, 0.71, 0]);
  box(ped, 0.38, 0.30, 0.84, M.gold, [0, 0.41, 0]);

  const statMat = tier >= 3 ? M.gold : M.statue;
  const fig = grp(ped, 0, 0.76, 0);
  box(fig, 0.18, 0.62, 0.20, statMat, [-0.12, 0.31, 0.03]);
  box(fig, 0.18, 0.62, 0.20, statMat, [0.12, 0.31, -0.03]);
  box(fig, 0.48, 0.12, 0.32, M.accent, [0, 0.64, 0]);
  box(fig, 0.56, 0.52, 0.34, statMat, [0, 0.94, 0]);
  box(fig, 0.22, 0.20, 0.36, statMat, [0.35, 1.10, 0], [0, 0, -0.22]);
  box(fig, 0.22, 0.20, 0.36, statMat, [-0.35, 1.10, 0], [0, 0, 0.22]);

  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), statMat);
  head.position.set(0, 1.32, 0.03);
  fig.add(head);
  cyl(fig, 0.15, 0.15, 0.07, 8, M.gold, [0, 1.44, 0.03]);

  box(fig, 0.12, 0.38, 0.12, statMat, [0.26, 0.96, 0.12], [-0.45, 0, -0.25]);
  box(fig, 0.12, 0.38, 0.12, statMat, [-0.26, 0.96, 0.12], [-0.45, 0, 0.25]);
  cyl(fig, 0.024, 0.024, 1.82, 8, M.gold, [0.18, 0.90, 0.25]);
  createAtlanteanEmblem(fig, M.gold, M.divineGlow, M.accent, [0.18, 1.88, 0.25], 0.68, M.emblems);

  const wings = grp(fig, 0, 0.98, -0.18);
  for (const s of [-1, 1]) {
    box(wings, 0.52, 0.14, 0.04, M.gold, [s * 0.32, 0.16, -0.04], [0.15, s * -0.35, s * 0.42]);
    box(wings, 0.42, 0.11, 0.04, M.wallBright, [s * 0.28, 0.02, -0.06], [0.15, s * -0.35, s * 0.25]);
  }
  wings.visible = false;
  M.statueWings.push(wings);

  return ped;
}

/* ==========================================================================
   5. CONSTRUÇÃO COMPLETA DOS TIERS T1–T5
   ========================================================================== */
export function buildAtlanteanTownCenterStructure(
  parent: THREE.Group,
  M: AtlanteanTownCenterMaterials,
  tier: number
): void {
  const wallM = tier >= 4 ? M.wallBright : M.wallBase;
  const courtScale = 1 + (tier - 1) * 0.11;

  // Pátio concêntrico octogonal com anéis
  cyl(parent, 2.25 * courtScale, 2.38 * courtScale, 0.10, 8, M.trim, [0, 0.05, 0], [0, Math.PI / 8, 0]);
  cyl(parent, 2.18 * courtScale, 2.22 * courtScale, 0.04, 8, M.wallBright, [0, 0.11, 0], [0, Math.PI / 8, 0]);
  if (tier >= 3) {
    cyl(parent, 2.42 * courtScale, 2.48 * courtScale, 0.07, 8, M.accent, [0, 0.035, 0], [0, Math.PI / 8, 0]);
  }

  // Altar central com relíquia divina de Oricalco
  const altar = grp(parent, 0.18, 0.13, 0.18);
  cyl(altar, 0.44, 0.52, 0.12, 8, M.trim, [0, 0.06, 0], [0, Math.PI / 8, 0]);
  cyl(altar, 0.34, 0.38, 0.18, 8, M.wallBright, [0, 0.21, 0], [0, Math.PI / 8, 0]);
  cyl(altar, 0.38, 0.38, 0.05, 8, M.gold, [0, 0.32, 0], [0, Math.PI / 8, 0]);

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.35;
    cyl(
      altar,
      0.022,
      0.028,
      0.65,
      8,
      M.gold,
      [Math.cos(a) * 0.22, 0.55, Math.sin(a) * 0.22],
      [Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25]
    );
  }
  const relic = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 + tier * 0.025, 0), M.divineGlow);
  relic.position.set(0, 0.72 + tier * 0.04, 0);
  altar.add(relic);
  M.relics.push(relic);

  const relicRing = new THREE.Mesh(new THREE.TorusGeometry(0.30 + tier * 0.03, 0.016, 8, 28), M.gold);
  relicRing.position.copy(relic.position);
  relicRing.rotation.x = Math.PI / 3;
  altar.add(relicRing);
  M.relicRings.push(relicRing);

  // Salão Cívico Principal
  const mainH = 0.98 + (tier - 1) * 0.14;
  const mainHall = grp(parent, -0.36 * courtScale, 0.13, -1.04 * courtScale);
  mainHall.rotation.y = -0.35;
  box(mainHall, 2.08, mainH, 1.24, wallM, [0, mainH * 0.5, 0]);
  box(mainHall, 2.14, 0.12, 1.30, M.trim, [0, 0.18, 0]);
  box(mainHall, 2.16, 0.06, 1.32, M.accent, [0, mainH - 0.04, 0]);

  box(mainHall, 0.54, 0.74, 0.08, M.gold, [0.15, 0.37, 0.64]);
  const doorRing = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 8, 18), M.trim);
  doorRing.position.set(0.15, 0.40, 0.69);
  mainHall.add(doorRing);

  const colCount = tier >= 3 ? 4 : 2;
  for (let c = 0; c < colCount; c++) {
    const cx = -0.30 + (c / Math.max(1, colCount - 1)) * 0.90;
    cyl(mainHall, 0.055, 0.068, mainH, 12, tier >= 4 ? M.gold : M.wallBright, [cx, mainH * 0.5, 0.76]);
  }
  box(mainHall, 1.18, 0.12, 0.36, M.trim, [0.15, mainH + 0.04, 0.68]);

  // Alpendre lateral
  box(mainHall, 0.78, 0.07, 0.88, M.roof, [-1.28, 0.82, 0.05], [0, 0, 0.22]);
  for (const sx of [-1.54, -1.04]) {
    for (const sz of [-0.28, 0.38]) {
      cyl(mainHall, 0.048, 0.058, 0.80, 10, M.trim, [sx, 0.40, sz]);
    }
  }
  cyl(mainHall, 0.14, 0.12, 0.28, 12, M.gold, [-1.18, 0.14, 0.34]);

  if (tier >= 2) {
    const upperH = 0.48 + (tier - 2) * 0.08;
    box(mainHall, 1.58, upperH, 0.94, M.wallBright, [0.10, mainH + upperH * 0.5, -0.04]);
    box(mainHall, 1.64, 0.08, 1.00, M.accent, [0.10, mainH + 0.05, -0.04]);
    buildSteppedTrapezoidRoof(
      mainHall,
      1.72,
      1.06,
      0.46,
      M.roof,
      M.trim,
      M.accent,
      M.gold,
      M.divineGlow,
      [0.10, mainH + upperH, -0.04],
      M.emblems,
      tier >= 3
    );
    if (tier >= 3) {
      buildCurvedOctagonalDome(
        mainHall,
        0.52 + (tier - 3) * 0.08,
        0.62 + (tier - 3) * 0.10,
        M.roof,
        M.trim,
        M.gold,
        [0.10, mainH + upperH + 0.64, -0.04]
      );
    }
  } else {
    buildSteppedTrapezoidRoof(
      mainHall,
      2.18,
      1.36,
      0.48,
      M.roof,
      M.trim,
      M.accent,
      M.gold,
      M.divineGlow,
      [0, mainH, 0],
      M.emblems,
      false
    );
  }

  // Ala Secundária / Salão do Conselho
  const subH = 0.82 + (tier - 1) * 0.09;
  const subHall = grp(parent, -0.36 * courtScale, 0.13, 1.16 * courtScale);
  subHall.rotation.y = 0.48;
  box(subHall, 1.66, subH, 1.00, wallM, [0, subH * 0.5, 0]);
  box(subHall, 1.72, 0.10, 1.06, M.trim, [0, 0.16, 0]);
  box(subHall, 1.74, 0.05, 1.08, M.accent, [0, subH - 0.03, 0]);
  if (tier >= 3) {
    for (const sx of [-0.55, 0, 0.55]) {
      cyl(subHall, 0.05, 0.06, subH, 10, M.wallBright, [sx, subH * 0.5, 0.60]);
    }
  }
  buildSteppedTrapezoidRoof(
    subHall,
    1.78,
    1.12,
    0.42,
    M.roof,
    M.trim,
    M.accent,
    M.gold,
    M.divineGlow,
    [0, subH, 0],
    tier >= 2 ? M.emblems : null,
    tier >= 4
  );
  if (tier >= 5) {
    buildCurvedOctagonalDome(subHall, 0.44, 0.52, M.roof, M.trim, M.gold, [0, subH + 0.58, 0]);
  }

  // Celeiro / Silo Octogonal de Provisões
  const silo = grp(parent, 1.56 * courtScale, 0.13, -0.15);
  const siloR = 0.48 + (tier - 1) * 0.045;
  const siloH = 1.04 + (tier - 1) * 0.12;
  cyl(silo, siloR, siloR + 0.03, siloH, 8, wallM, [0, siloH * 0.5, 0], [0, Math.PI / 8, 0]);
  cyl(silo, siloR + 0.04, siloR + 0.04, 0.09, 8, M.trim, [0, 0.16, 0], [0, Math.PI / 8, 0]);
  cyl(silo, siloR + 0.04, siloR + 0.04, 0.07, 8, M.accent, [0, siloH - 0.06, 0], [0, Math.PI / 8, 0]);
  if (tier >= 4) {
    for (let c = 0; c < 8; c++) {
      const ca = (c / 8) * Math.PI * 2 + Math.PI / 8;
      cyl(silo, 0.045, 0.055, siloH, 10, M.gold, [
        Math.cos(ca) * (siloR + 0.10),
        siloH * 0.5,
        Math.sin(ca) * (siloR + 0.10)
      ]);
    }
  }
  buildCurvedOctagonalDome(silo, siloR + 0.04, 0.48 + tier * 0.06, M.roof, M.trim, M.gold, [0, siloH, 0]);
  createAtlanteanEmblem(
    silo,
    M.gold,
    M.divineGlow,
    M.accent,
    [0, siloH + 0.85 + tier * 0.06, 0],
    0.72,
    M.emblems
  );

  // Fonte Sagrada com Água de Oricalco
  const fountain = grp(parent, 0.82 * courtScale, 0.13, -0.84 * courtScale);
  cyl(fountain, 0.28, 0.32, 0.26, 16, M.trim, [0, 0.13, 0]);
  cyl(fountain, 0.22, 0.22, 0.04, 16, M.water, [0, 0.25, 0]);
  cyl(fountain, 0.05, 0.08, 0.36, 12, M.gold, [0, 0.32, 0]);
  const fRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 20), M.accent);
  fRing.rotation.x = Math.PI / 2;
  fRing.position.set(0, 0.48, 0);
  fountain.add(fRing);

  // Muralha Perimetral & Portões
  const fenceGroup = grp(parent, 0, 0.13, 0);
  const radX = 2.24 * courtScale;
  const radZ = 2.06 * courtScale;
  if (tier >= 3) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      if ((a > 0.52 && a < 1.18) || (a > 2.22 && a < 2.88)) continue;
      const rx = Math.cos(a) * radX;
      const rz = Math.sin(a) * radZ;
      box(fenceGroup, 0.36, 0.48 + (tier - 3) * 0.10, 0.14, M.wallBright, [rx, 0.24, rz], [0, -a + Math.PI / 2, 0]);
      box(fenceGroup, 0.38, 0.06, 0.16, M.accent, [rx, 0.50 + (tier - 3) * 0.10, rz], [0, -a + Math.PI / 2, 0]);
    }
  } else {
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      if ((a > 0.55 && a < 1.15) || (a > 2.25 && a < 2.85)) continue;
      box(fenceGroup, 0.06, 0.44, 0.06, tier >= 2 ? M.trim : M.gold, [Math.cos(a) * radX, 0.22, Math.sin(a) * radZ], [0, -a, 0]);
    }
  }

  // Portões Monumentais
  for (const [gx, gz, rotY] of [
    [-1.38 * courtScale, 1.42 * courtScale, 0.65],
    [1.32 * courtScale, 1.42 * courtScale, -0.65]
  ]) {
    const gate = grp(fenceGroup, gx, 0, gz);
    gate.rotation.y = rotY;
    box(gate, 0.18, 0.86 + tier * 0.05, 0.18, M.trim, [-0.45, 0.43, 0]);
    box(gate, 0.18, 0.86 + tier * 0.05, 0.18, M.trim, [0.45, 0.43, 0]);
    box(gate, 1.16, 0.14, 0.22, M.wallBright, [0, 0.90 + tier * 0.05, 0]);
    box(gate, 1.20, 0.06, 0.24, M.accent, [0, 0.99 + tier * 0.05, 0]);
    if (tier >= 3) {
      createAtlanteanEmblem(gate, M.gold, M.divineGlow, M.accent, [0, 1.26 + tier * 0.05, 0], 0.58, M.emblems);
    }
  }

  // Torres de Vigia Octogonais
  if (tier >= 3) {
    const towerCoords = tier >= 4
      ? [
          [-radX * 0.92, -radZ * 0.92],
          [radX * 0.92, -radZ * 0.92],
          [-radX * 0.95, radZ * 0.88],
          [radX * 0.95, radZ * 0.88]
        ]
      : [
          [-radX * 0.92, -radZ * 0.92],
          [radX * 0.92, -radZ * 0.92]
        ];
    const tH = 1.48 + (tier - 3) * 0.25;
    towerCoords.forEach(([tx, tz]) => {
      const tw = grp(fenceGroup, tx, 0, tz);
      cyl(tw, 0.42, 0.46, tH, 8, M.wallBright, [0, tH * 0.5, 0], [0, Math.PI / 8, 0]);
      cyl(tw, 0.48, 0.46, 0.10, 8, M.accent, [0, tH + 0.05, 0], [0, Math.PI / 8, 0]);
      buildCurvedOctagonalDome(tw, 0.44, 0.46, M.roof, M.trim, M.gold, [0, tH + 0.10, 0]);
    });
  }

  // Guardiões Monumentais de Atlântida
  buildAtlanteanGuardianMonument(parent, M, tier, [-1.84 * courtScale, 0.13, -0.05], 0.55, 1.0 + (tier - 1) * 0.06);
  if (tier >= 3) {
    buildAtlanteanGuardianMonument(parent, M, tier, [1.84 * courtScale, 0.13, 0.85], -0.55, 1.0 + (tier - 1) * 0.06);
  }

  // Braseiros cerimoniais de Oricalco
  if (tier >= 2) {
    buildAtlanteanBrazier(parent, M.gold, M.accent, M.flame, M.flames, [-0.68 * courtScale, 0.13, 1.72 * courtScale], 0.85 + tier * 0.06);
    buildAtlanteanBrazier(parent, M.gold, M.accent, M.flame, M.flames, [0.76 * courtScale, 0.13, 1.70 * courtScale], 0.85 + tier * 0.06);
  }

  // Decorações Exclusivas dos Deuses Maiores (Kronos, Oranos, Gaia)
  const godWrap = grp(parent, 0, 0.13, 0);

  // Kronos: Relógios de sol / Ampulhetas de Oricalco e anéis temporais
  const kronosDeco = grp(godWrap);
  for (const [bx, bz] of [
    [-1.65 * courtScale, 1.18 * courtScale],
    [1.58 * courtScale, 1.18 * courtScale]
  ]) {
    cyl(kronosDeco, 0.09, 0.16, 1.18 + tier * 0.10, 8, M.trim, [bx, 0.59, bz], [0, Math.PI / 8, 0]);
    const kRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.016, 8, 24), M.divineGlow);
    kRing.position.set(bx, 1.25 + tier * 0.10, bz);
    kronosDeco.add(kRing);
    M.relicRings.push(kRing);
    createAtlanteanEmblem(kronosDeco, M.gold, M.divineGlow, M.accent, [bx, 1.25 + tier * 0.10, bz], 0.55);
  }

  // Oranos: Vórtice celeste e monólito celestial
  const oranosDeco = grp(godWrap);
  cyl(oranosDeco, 0.46, 0.52, 0.16, 8, M.wallBright, [0.98 * courtScale, 0.08, 0.68 * courtScale], [0, Math.PI / 8, 0]);
  cyl(oranosDeco, 0.38, 0.38, 0.04, 8, M.divineGlow, [0.98 * courtScale, 0.16, 0.68 * courtScale], [0, Math.PI / 8, 0]);
  cyl(oranosDeco, 0.05, 0.09, 0.45, 8, M.gold, [0.98 * courtScale, 0.28, 0.68 * courtScale]);
  const oEmb = createAtlanteanEmblem(oranosDeco, M.gold, M.divineGlow, M.accent, [0.98 * courtScale, 0.72, 0.68 * courtScale], 0.82);
  oEmb.children[0].visible = false;
  oEmb.children[1].visible = true;
  oranosDeco.visible = false;

  // Gaia: Bosques sagrados de Atlântida e sementes divinas
  const gaiaDeco = grp(godWrap);
  const treeSpots = [
    [-1.92 * courtScale, -1.28 * courtScale],
    [1.98 * courtScale, -1.10 * courtScale],
    [-1.72 * courtScale, 1.32 * courtScale],
    [1.72 * courtScale, 1.32 * courtScale]
  ];
  treeSpots.forEach(([tx, tz], idx) => {
    if (idx >= 2 && tier < 3) return;
    cyl(gaiaDeco, 0.26, 0.30, 0.10, 12, M.trim, [tx, 0.05, tz]);
    cyl(gaiaDeco, 0.05, 0.09, 0.72 + tier * 0.08, 8, M.wood, [tx, 0.38, tz]);
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + tier * 0.03, 1), M.foliage);
    crown.position.set(tx, 0.85 + tier * 0.08, tz);
    crown.castShadow = true;
    gaiaDeco.add(crown);
    const seedGlow = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), M.divineGlow);
    seedGlow.position.set(tx, 1.24 + tier * 0.08, tz);
    gaiaDeco.add(seedGlow);
  });
  gaiaDeco.visible = false;

  M.godDecors.push({ kronosDeco, oranosDeco, gaiaDeco });
}

/* ==========================================================================
   6. DISPATCHER PROCEDURAL PARA O JOGO
   ========================================================================== */
export interface ProceduralAtlanteanTownCenterResult {
  group: THREE.Group;
  materials: AtlanteanTownCenterMaterials;
  flames: THREE.Mesh[];
  relics: THREE.Mesh[];
  relicRings: THREE.Mesh[];
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function buildProceduralAtlanteanTownCenter(
  targetGroup: THREE.Group,
  age: number,
  godKey: string,
  enableShadows = true
): ProceduralAtlanteanTownCenterResult {
  const normGod: AtlanteanTownCenterGodKey =
    godKey.toLowerCase().includes('oranos') || godKey.toLowerCase().includes('urano')
      ? 'oranos'
      : godKey.toLowerCase().includes('gaia')
      ? 'gaia'
      : 'kronos';

  const theme = ATLANTEAN_TOWN_CENTER_THEMES[normGod] || ATLANTEAN_TOWN_CENTER_THEMES.kronos;
  const materials = createAtlanteanTownCenterMaterials(theme);
  const tier = Math.max(1, Math.min(5, Math.round(age)));

  const tcMesh = new THREE.Group();
  buildAtlanteanTownCenterStructure(tcMesh, materials, tier);

  // Ativa divindade correta
  materials.emblems.forEach(e => {
    e.kronos.visible = (normGod === 'kronos');
    e.oranos.visible = (normGod === 'oranos');
    e.gaia.visible = (normGod === 'gaia');
  });
  materials.godDecors.forEach(d => {
    d.kronosDeco.visible = (normGod === 'kronos');
    d.oranosDeco.visible = (normGod === 'oranos');
    d.gaiaDeco.visible = (normGod === 'gaia');
  });
  materials.statueWings.forEach(w => {
    w.visible = (normGod === 'oranos');
  });

  tcMesh.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = enableShadows;
      child.receiveShadow = enableShadows;
    }
  });

  targetGroup.add(tcMesh);

  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  // Em T4 e T5 (Metrópole Mítica e Capital Olímpica), adiciona aura e orbe flutuante
  if (tier >= 4) {
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.8 + (tier - 4) * 0.35, 3.2 + (tier - 4) * 0.35, 48),
      new THREE.MeshBasicMaterial({
        color: theme.glowHex,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    targetGroup.add(halo);
    metropolisHalo = halo;

    const apex = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35 + (tier - 4) * 0.12, 1),
      materials.divineGlow
    );
    apex.position.set(0, 3.2, 0);
    targetGroup.add(apex);
    metropolisCrystal = apex;
  }

  return {
    group: tcMesh,
    materials,
    flames: materials.flames,
    relics: materials.relics,
    relicRings: materials.relicRings,
    metropolisHalo,
    metropolisCrystal
  };
}

/* ==========================================================================
   7. STUDIO ADAPTER PARA A GALERIA 3D
   ========================================================================== */
export function buildAtlanteanTownCenterStudio(godKey: string, initialTier: number, _isPbr = true) {
  const normGod: AtlanteanTownCenterGodKey =
    godKey.toLowerCase().includes('oranos') || godKey.toLowerCase().includes('urano')
      ? 'oranos'
      : godKey.toLowerCase().includes('gaia')
      ? 'gaia'
      : 'kronos';
  const theme = ATLANTEAN_TOWN_CENTER_THEMES[normGod] || ATLANTEAN_TOWN_CENTER_THEMES.kronos;
  const M = createAtlanteanTownCenterMaterials(theme);

  const root = new THREE.Group();
  const tierHolders: Record<number, THREE.Group> = {};

  for (let t = 1; t <= 5; t++) {
    const holder = new THREE.Group();
    buildAtlanteanTownCenterStructure(holder, M, t);
    root.add(holder);
    tierHolders[t] = holder;
    holder.visible = (t === initialTier);
  }

  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(2.65, 2.98, 64),
    new THREE.MeshBasicMaterial({
      color: theme.glowHex,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.03;
  root.add(auraRing);

  let currentTier = initialTier;

  function setTier(t: number) {
    currentTier = Math.max(1, Math.min(5, t));
    for (let i = 1; i <= 5; i++) {
      if (tierHolders[i]) {
        tierHolders[i].visible = (i === currentTier);
      }
    }
    const ringScale = 1 + (currentTier - 1) * 0.11;
    auraRing.scale.setScalar(ringScale);
    auraRing.material.opacity = 0.16 + currentTier * 0.04;
  }

  function applyGod(newGodKey: string) {
    const nextGod: AtlanteanTownCenterGodKey =
      newGodKey.toLowerCase().includes('oranos') || newGodKey.toLowerCase().includes('urano')
        ? 'oranos'
        : newGodKey.toLowerCase().includes('gaia')
        ? 'gaia'
        : 'kronos';
    const nextTheme = ATLANTEAN_TOWN_CENTER_THEMES[nextGod] || ATLANTEAN_TOWN_CENTER_THEMES.kronos;

    M.wallBase.color.setHex(nextTheme.wallBase);
    M.wallBright.color.setHex(nextTheme.wallBright);
    M.trim.color.setHex(nextTheme.trimHex);
    M.accent.color.setHex(nextTheme.accentHex);
    M.gold.color.setHex(nextTheme.goldHex);
    M.flame.color.setHex(nextTheme.flameHex);
    M.divineGlow.emissive.setHex(nextTheme.glowHex);
    auraRing.material.color.setHex(nextTheme.glowHex);

    M.emblems.forEach(e => {
      e.kronos.visible = (nextGod === 'kronos');
      e.oranos.visible = (nextGod === 'oranos');
      e.gaia.visible = (nextGod === 'gaia');
    });

    M.godDecors.forEach(d => {
      d.kronosDeco.visible = (nextGod === 'kronos');
      d.oranosDeco.visible = (nextGod === 'oranos');
      d.gaiaDeco.visible = (nextGod === 'gaia');
    });

    M.statueWings.forEach(w => {
      w.visible = (nextGod === 'oranos');
    });
  }

  setTier(initialTier);
  applyGod(normGod);

  return {
    root,
    M,
    auraRing,
    setTier,
    applyGod,
    getTier: () => currentTier
  };
}
