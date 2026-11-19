import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO VISUAL DAS DIVINDADES EGÍPCIAS (RÁ, ÍSIS, SET)
   ========================================================================== */
export type EgyptianTownCenterGodKey = 'ra' | 'isis' | 'set';

export interface EgyptianTownCenterTheme {
  id: EgyptianTownCenterGodKey;
  godName: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  stoneBase: number;
  stoneBright: number;
  trimHex: number;
  secondaryHex: number;
  goldHex: number;
  statueHex: number;
  flameHex: number;
  glowHex: number;
  particleHex: number;
  linenBase: string;
  linenStripe: string;
  linenTrim: string;
  groundGrass: string;
  groundDirt: string;
}

export const EGYPTIAN_TOWN_CENTER_THEMES: Record<EgyptianTownCenterGodKey, EgyptianTownCenterTheme> = {
  ra: {
    id: 'ra',
    godName: 'Rá',
    bgHex: 0x1a1207,
    hemiSky: 0xfef9c3,
    hemiGround: 0x854d0e,
    rimHex: 0xfacc15,
    stoneBase: 0xdec79b,
    stoneBright: 0xf2e4c6,
    trimHex: 0x1d4ed8,
    secondaryHex: 0xb45309,
    goldHex: 0xfacc15,
    statueHex: 0xd9b979,
    flameHex: 0xf59e0b,
    glowHex: 0xfacc15,
    particleHex: 0xfef08a,
    linenBase: '#fffbeb',
    linenStripe: '#1e3a8a',
    linenTrim: '#f59e0b',
    groundGrass: '#65832d',
    groundDirt: '#c8a772'
  },
  isis: {
    id: 'isis',
    godName: 'Ísis',
    bgHex: 0x071921,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0f766e,
    rimHex: 0x2dd4bf,
    stoneBase: 0xe2e8f0,
    stoneBright: 0xf8fafc,
    trimHex: 0x0d9488,
    secondaryHex: 0x1e3a8a,
    goldHex: 0xfacc15,
    statueHex: 0xcbd5e1,
    flameHex: 0x2dd4bf,
    glowHex: 0x2dd4bf,
    particleHex: 0x99f6e4,
    linenBase: '#f0fdfa',
    linenStripe: '#0f766e',
    linenTrim: '#2dd4bf',
    groundGrass: '#4d7c3f',
    groundDirt: '#cdb384'
  },
  set: {
    id: 'set',
    godName: 'Set',
    bgHex: 0x160906,
    hemiSky: 0xffedd5,
    hemiGround: 0x7c2d12,
    rimHex: 0xea580c,
    stoneBase: 0xc79c73,
    stoneBright: 0xd6b189,
    trimHex: 0xb91c1c,
    secondaryHex: 0x451a03,
    goldHex: 0xf59e0b,
    statueHex: 0x78716c,
    flameHex: 0xea580c,
    glowHex: 0xea580c,
    particleHex: 0xfb923c,
    linenBase: '#fef3c7',
    linenStripe: '#7c2d12',
    linenTrim: '#ea580c',
    groundGrass: '#4f5d2f',
    groundDirt: '#a87d52'
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS COM CACHE (ARENITO, TELHAS, LINHO)
   ========================================================================== */
const etcTexCache = new Map<string, THREE.CanvasTexture>();

function createSandstoneTexture(isBright = false): THREE.CanvasTexture {
  const key = `etc_sandstone_${isBright ? 'bright' : 'base'}`;
  if (etcTexCache.has(key)) return etcTexCache.get(key)!;
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(c);

  ctx.fillStyle = isBright ? '#f2e4c6' : '#dec79b';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 14, rH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rH;
    const cols = 5, cW = 512 / cols;
    const off = (r % 2 === 0) ? 0 : cW * 0.5;
    for (let col = -1; col <= cols; col++) {
      const x = col * cW + off;
      const shade = (isBright ? 232 : 212) + Math.floor((Math.random() - 0.5) * 20);
      ctx.fillStyle = `rgba(${shade}, ${shade - 16}, ${shade - 44}, 0.48)`;
      ctx.fillRect(x + 2, y + 2, cW - 4, rH - 4);
      ctx.strokeStyle = 'rgba(85, 62, 32, 0.30)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, cW - 2, rH - 2);
    }
  }
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,250,235,0.10)' : 'rgba(80,55,25,0.09)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  etcTexCache.set(key, tex);
  return tex;
}

function createRoofTilesTexture(): THREE.CanvasTexture {
  const key = 'etc_roof_tiles';
  if (etcTexCache.has(key)) return etcTexCache.get(key)!;
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(c);

  ctx.fillStyle = '#d6c39e';
  ctx.fillRect(0, 0, 512, 512);
  const grid = 8, cell = 512 / grid;
  for (let gx = 0; gx < grid; gx++) {
    for (let gy = 0; gy < grid; gy++) {
      const shade = 205 + Math.floor((Math.random() - 0.5) * 24);
      ctx.fillStyle = `rgb(${shade}, ${shade - 14}, ${shade - 36})`;
      ctx.fillRect(gx * cell + 3, gy * cell + 3, cell - 6, cell - 6);
      ctx.strokeStyle = 'rgba(75, 58, 35, 0.42)';
      ctx.lineWidth = 3;
      ctx.strokeRect(gx * cell + 1.5, gy * cell + 1.5, cell - 3, cell - 3);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  etcTexCache.set(key, tex);
  return tex;
}

function createLinenTexture(theme: EgyptianTownCenterTheme): THREE.CanvasTexture {
  const key = `etc_linen_${theme.id}`;
  if (etcTexCache.has(key)) return etcTexCache.get(key)!;
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(c);

  ctx.fillStyle = theme.linenBase;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = 'rgba(120, 80, 20, 0.10)';
  for (let x = 0; x < 512; x += 6) ctx.fillRect(x, 0, 2, 256);

  ctx.fillStyle = theme.linenStripe;
  ctx.fillRect(0, 192, 512, 42);
  ctx.fillStyle = theme.linenTrim;
  ctx.fillRect(0, 188, 512, 4);
  ctx.fillRect(0, 234, 512, 4);

  ctx.fillStyle = theme.linenTrim;
  for (let x = 6; x < 512; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 6, 198);
    ctx.lineTo(x + 12, 228);
    ctx.lineTo(x, 228);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  etcTexCache.set(key, tex);
  return tex;
}

/* ==========================================================================
   3. HELPERS DE GEOMETRIA EGÍPCIA
   ========================================================================== */
function grp(parent: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function box(
  parent: THREE.Object3D,
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
  if (parent) parent.add(m);
  return m;
}

function cyl(
  parent: THREE.Object3D,
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
  if (parent) parent.add(m);
  return m;
}

export interface EgyptianTownCenterMaterials {
  stoneBase: THREE.MeshStandardMaterial;
  stoneBright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  statue: THREE.MeshStandardMaterial;
  roofTiles: THREE.MeshStandardMaterial;
  linen: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  obsidian: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  divineGlow: THREE.MeshStandardMaterial;
  flames: THREE.Mesh[];
  emblems: Array<{ ra: THREE.Group; isis: THREE.Group; set: THREE.Group }>;
  guardianHeads: Array<{ raSun: THREE.Mesh; isisHorns: THREE.Group; setHead: THREE.Group }>;
  godDecors: Array<{ raDeco: THREE.Group; isisDeco: THREE.Group; setDeco: THREE.Group }>;
}

export function createEgyptianTownCenterMaterials(theme: EgyptianTownCenterTheme): EgyptianTownCenterMaterials {
  return {
    stoneBase: new THREE.MeshStandardMaterial({
      map: createSandstoneTexture(false),
      color: theme.stoneBase,
      roughness: 0.70,
      metalness: 0.06
    }),
    stoneBright: new THREE.MeshStandardMaterial({
      map: createSandstoneTexture(true),
      color: theme.stoneBright,
      roughness: 0.54,
      metalness: 0.10
    }),
    trim: new THREE.MeshStandardMaterial({
      color: theme.trimHex,
      roughness: 0.38,
      metalness: 0.32
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.25,
      metalness: 0.90,
      roughness: 0.20
    }),
    statue: new THREE.MeshStandardMaterial({
      color: theme.statueHex,
      roughness: 0.45,
      metalness: 0.22
    }),
    roofTiles: new THREE.MeshStandardMaterial({
      map: createRoofTilesTexture(),
      roughness: 0.60,
      metalness: 0.10
    }),
    linen: new THREE.MeshStandardMaterial({
      map: createLinenTexture(theme),
      roughness: 0.58,
      side: THREE.DoubleSide
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x6b3818,
      roughness: 0.72
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x1a140e,
      roughness: 0.92
    }),
    obsidian: new THREE.MeshStandardMaterial({
      color: 0x161218,
      metalness: 0.45,
      roughness: 0.25
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.78
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
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
    guardianHeads: [],
    godDecors: []
  };
}

function createEgyptianEmblem(
  parent: THREE.Object3D,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  _trimMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  registry: Array<{ ra: THREE.Group; isis: THREE.Group; set: THREE.Group }> | null = null
): THREE.Group {
  const root = grp(parent, pos[0], pos[1], pos[2]);
  root.scale.setScalar(scale);

  // 1. ☀️ RÁ: Disco Solar Radiante com Asas
  const ra = grp(root);
  const sunOrb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), glowMat);
  ra.add(sunOrb);
  const raRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.016, 8, 24), goldMat);
  ra.add(raRing);
  for (const s of [-1, 1]) {
    box(ra, 0.28, 0.06, 0.03, goldMat, [s * 0.24, 0.01, 0], [0, 0, s * 0.12]);
  }

  // 2. 🪽 ÍSIS: Chifres Hathóricos, Disco Solar e Ankh
  const isis = grp(root);
  const isisDisk = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 14), glowMat);
  isisDisk.position.set(0, 0.10, 0);
  isis.add(isisDisk);
  const horns = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 20, Math.PI), goldMat);
  horns.rotation.z = Math.PI;
  horns.position.set(0, 0.16, 0);
  isis.add(horns);
  const ankhLoop = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 8, 18), glowMat);
  ankhLoop.position.set(0, -0.05, 0);
  isis.add(ankhLoop);
  box(isis, 0.18, 0.026, 0.026, goldMat, [0, -0.13, 0]);
  box(isis, 0.026, 0.16, 0.026, goldMat, [0, -0.20, 0]);
  isis.visible = false;

  // 3. 🐺 SET: Cetro Was e Emblema do Deserto
  const set = grp(root);
  const setRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 6, 6), glowMat);
  set.add(setRing);
  cyl(set, 0.022, 0.022, 0.48, 8, goldMat, [0, -0.02, 0]);
  box(set, 0.08, 0.07, 0.18, glowMat, [0, 0.18, 0.04], [0.25, 0, 0]);
  for (const s of [-1, 1]) {
    box(set, 0.03, 0.18, 0.04, goldMat, [s * 0.05, 0.28, -0.02]);
  }
  set.visible = false;

  if (registry) registry.push({ ra, isis, set });
  return root;
}

function buildEgyptianPylon(
  parent: THREE.Object3D,
  wBot: number,
  dBot: number,
  h: number,
  M: EgyptianTownCenterMaterials,
  pos: [number, number, number] = [0, 0, 0],
  addVents = true
): THREE.Group {
  const p = grp(parent, pos[0], pos[1], pos[2]);
  const wTop = wBot * 0.88, dTop = dBot * 0.88;
  const rxB = wBot * 0.5, rzB = dBot * 0.5, rxT = wTop * 0.5, rzT = dTop * 0.5;

  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    -rxB, 0, rzB,   rxB, 0, rzB,   rxT, h, rzT,
    -rxB, 0, rzB,   rxT, h, rzT,  -rxT, h, rzT,
     rxB, 0, -rzB, -rxB, 0, -rzB, -rxT, h, -rzT,
     rxB, 0, -rzB, -rxT, h, -rzT,  rxT, h, -rzT,
    -rxB, 0, -rzB, -rxB, 0, rzB,  -rxT, h, rzT,
    -rxB, 0, -rzB, -rxT, h, rzT,  -rxT, h, -rzT,
     rxB, 0, rzB,   rxB, 0, -rzB,  rxT, h, -rzT,
     rxB, 0, rzB,   rxT, h, -rzT,  rxT, h, rzT,
    -rxT, h, rzT,   rxT, h, rzT,   rxT, h, -rzT,
    -rxT, h, rzT,   rxT, h, -rzT, -rxT, h, -rzT
  ]);
  const uvs = new Float32Array(30 * 2);
  for (let i = 0; i < 30; i++) {
    uvs[i * 2] = (verts[i * 3] + rxB) / wBot;
    uvs[i * 2 + 1] = verts[i * 3 + 1] / h;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();

  const body = new THREE.Mesh(geo, M.stoneBright);
  body.castShadow = true;
  body.receiveShadow = true;
  p.add(body);

  box(p, wTop + 0.18, 0.12, dTop + 0.18, M.stoneBright, [0, h + 0.05, 0]);
  box(p, wTop + 0.22, 0.07, dTop + 0.22, M.trim, [0, h + 0.13, 0]);
  box(p, wTop + 0.10, 0.05, dTop + 0.10, M.roofTiles, [0, h + 0.18, 0]);

  if (addVents) {
    const count = Math.max(2, Math.floor(wTop / 0.52));
    for (let i = 0; i < count; i++) {
      const vx = -wTop * 0.34 + (count === 1 ? 0 : (i / (count - 1)) * wTop * 0.68);
      box(p, 0.13, 0.16, 0.05, M.dark, [vx, h - 0.30, rzT + 0.01]);
      box(p, 0.13, 0.16, 0.05, M.dark, [vx, h - 0.30, -rzT - 0.01]);
    }
  }
  return p;
}

function buildLotusColumn(
  parent: THREE.Object3D,
  h: number,
  M: EgyptianTownCenterMaterials,
  pos: [number, number, number] = [0, 0, 0],
  radius = 0.085,
  isGold = false
): THREE.Group {
  const c = grp(parent, pos[0], pos[1], pos[2]);
  const shaftMat = isGold ? M.gold : M.stoneBright;
  cyl(c, radius * 1.4, radius * 1.5, 0.09, 14, M.stoneBase, [0, 0.045, 0]);
  cyl(c, radius * 0.90, radius * 1.10, h - 0.28, 14, shaftMat, [0, 0.09 + (h - 0.28) * 0.5, 0]);
  cyl(c, radius * 1.04, radius * 1.04, 0.04, 14, M.trim, [0, h - 0.20, 0]);
  cyl(c, radius * 1.60, radius * 1.00, 0.14, 14, shaftMat, [0, h - 0.09, 0]);
  box(c, radius * 2.6, 0.06, radius * 2.6, M.stoneBase, [0, h + 0.01, 0]);
  return c;
}

function buildWingedSun(
  parent: THREE.Object3D,
  M: EgyptianTownCenterMaterials,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const g = grp(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);
  const disk = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), M.gold);
  disk.scale.set(1, 1, 0.45);
  g.add(disk);
  for (const s of [-1, 1]) {
    box(g, 0.36, 0.08, 0.04, M.gold, [s * 0.25, 0.02, 0], [0, 0, s * 0.08]);
    box(g, 0.30, 0.035, 0.05, M.trim, [s * 0.23, -0.025, 0.01], [0, 0, s * 0.08]);
  }
  return g;
}

function buildBrazier(
  parent: THREE.Object3D,
  M: EgyptianTownCenterMaterials,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const b = grp(parent, pos[0], pos[1], pos[2]);
  b.scale.setScalar(scale);
  cyl(b, 0.12, 0.16, 0.08, 12, M.gold, [0, 0.04, 0]);
  cyl(b, 0.04, 0.05, 0.34, 10, M.gold, [0, 0.25, 0]);
  cyl(b, 0.20, 0.10, 0.12, 12, M.gold, [0, 0.46, 0]);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 10), M.flame);
  flame.position.set(0, 0.66, 0);
  b.add(flame);
  M.flames.push(flame);
  return b;
}

function buildEgyptianGuardian(
  parent: THREE.Object3D,
  M: EgyptianTownCenterMaterials,
  tier: number,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  scale = 1.0
): THREE.Group {
  const ped = grp(parent, pos[0], pos[1], pos[2]);
  ped.rotation.y = rotY;
  ped.scale.setScalar(scale);

  const trimM = tier >= 4 ? M.gold : M.trim;
  box(ped, 0.92, 0.14, 0.92, M.stoneBase, [0, 0.07, 0]);
  box(ped, 0.78, 0.48, 0.78, M.stoneBright, [0, 0.38, 0]);
  box(ped, 0.84, 0.08, 0.84, trimM, [0, 0.66, 0]);
  box(ped, 0.36, 0.28, 0.80, M.gold, [0, 0.38, 0]);

  const statMat = tier >= 3 ? M.gold : M.statue;
  const fig = grp(ped, 0, 0.70, 0);

  cyl(fig, 0.08, 0.065, 0.56, 10, statMat, [-0.10, 0.28, 0.05], [-0.08, 0, 0]);
  cyl(fig, 0.08, 0.065, 0.56, 10, statMat, [0.10, 0.28, -0.04], [0.06, 0, 0]);
  cyl(fig, 0.17, 0.22, 0.38, 12, trimM, [0, 0.58, 0]);
  box(fig, 0.40, 0.44, 0.24, statMat, [0, 0.96, 0]);
  cyl(fig, 0.19, 0.22, 0.07, 12, M.gold, [0, 1.15, 0]);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), statMat);
  head.position.set(0, 1.32, 0.02);
  fig.add(head);
  box(fig, 0.34, 0.28, 0.24, M.gold, [0, 1.24, -0.02]);

  const raSun = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), M.gold);
  raSun.scale.set(1, 1, 0.35);
  raSun.position.set(0, 1.56, 0.02);
  fig.add(raSun);

  const isisHorns = grp(fig, 0, 1.48, 0.02);
  box(isisHorns, 0.03, 0.24, 0.03, M.gold, [-0.13, 0.10, 0], [0, 0, -0.25]);
  box(isisHorns, 0.03, 0.24, 0.03, M.gold, [0.13, 0.10, 0], [0, 0, 0.25]);
  const isisDisk = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), M.divineGlow);
  isisDisk.position.set(0, 0.12, 0);
  isisHorns.add(isisDisk);
  isisHorns.visible = false;

  const setHead = grp(fig, 0, 1.32, 0.02);
  box(setHead, 0.06, 0.06, 0.24, statMat, [0, -0.02, 0.14]);
  box(setHead, 0.035, 0.26, 0.05, M.gold, [-0.07, 0.22, -0.02]);
  box(setHead, 0.035, 0.26, 0.05, M.gold, [0.07, 0.22, -0.02]);
  setHead.visible = false;

  M.guardianHeads.push({ raSun, isisHorns, setHead });

  cyl(fig, 0.02, 0.02, 1.80, 8, M.gold, [0.24, 0.90, 0.18]);
  createEgyptianEmblem(fig, M.gold, M.divineGlow, M.trim, [0.24, 1.88, 0.18], 0.65, M.emblems);

  return ped;
}

function buildPalmTree(
  parent: THREE.Object3D,
  h: number,
  M: EgyptianTownCenterMaterials,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const p = grp(parent, pos[0], pos[1], pos[2]);
  p.scale.setScalar(scale);
  cyl(p, 0.07, 0.12, h, 10, M.wood, [0, h * 0.5, 0], [0.05, 0, 0.04]);
  for (let f = 0; f < 7; f++) {
    const a = (f / 7) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.78, 4), M.foliage);
    frond.position.set(Math.cos(a) * 0.28, h + 0.04, Math.sin(a) * 0.28);
    frond.rotation.set(1.05, -a, 0);
    frond.scale.set(1, 1, 0.24);
    frond.castShadow = true;
    p.add(frond);
  }
  return p;
}

/* ==========================================================================
   4. CONSTRUTOR ARQUITETÔNICO DO CENTRO DA CIDADE EGÍPCIO (T1 A T5)
   ========================================================================== */
export function buildEgyptianTownCenterStructure(
  parent: THREE.Object3D,
  M: EgyptianTownCenterMaterials,
  tier: number
): THREE.Group {
  const root = grp(parent);
  const wallM = tier >= 4 ? M.stoneBright : M.stoneBase;
  const trimM = tier >= 4 ? M.gold : M.trim;
  const courtScale = 1 + (tier - 1) * 0.11;

  // 1. PLATAFORMA ESCALONADA DE ARENITO E OURO
  box(root, 3.85 * courtScale, 0.09, 3.65 * courtScale, M.stoneBase, [0, 0.045, 0]);
  if (tier >= 3) {
    box(root, 4.18 * courtScale, 0.07, 3.98 * courtScale, M.stoneBright, [0, 0.035, 0]);
    box(root, 4.24 * courtScale, 0.04, 4.04 * courtScale, trimM, [0, 0.09, 0]);
  }
  if (tier === 5) {
    box(root, 4.50 * courtScale, 0.06, 4.30 * courtScale, M.gold, [0, 0.03, 0]);
  }

  // 2. FOGUEIRA SAGRADA CENTRAL COM TRIPÉ E CALDEIRÃO DE OURO
  const hearth = grp(root, 0.20, 0.09, 0.16);
  if (tier >= 4) {
    cyl(hearth, 0.48, 0.56, 0.14, 16, M.stoneBright, [0, 0.07, 0]);
    cyl(hearth, 0.52, 0.52, 0.05, 16, M.gold, [0, 0.15, 0]);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(
      hearth,
      0.14,
      0.10,
      0.12,
      M.stoneBright,
      [Math.cos(a) * 0.30, 0.05 + (tier >= 4 ? 0.12 : 0), Math.sin(a) * 0.30],
      [0, a, 0]
    );
  }
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.22 + tier * 0.02, 0.46 + tier * 0.06, 12),
    M.flame
  );
  fire.position.set(0, 0.26 + (tier >= 4 ? 0.12 : 0), 0);
  hearth.add(fire);
  M.flames.push(fire);

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    cyl(
      hearth,
      0.02,
      0.024,
      0.78,
      8,
      M.gold,
      [Math.cos(a) * 0.20, 0.38 + (tier >= 4 ? 0.12 : 0), Math.sin(a) * 0.20],
      [Math.sin(a) * 0.42, 0, -Math.cos(a) * 0.42]
    );
  }
  cyl(hearth, 0.15, 0.11, 0.16, 14, M.gold, [0, 0.48 + (tier >= 4 ? 0.12 : 0), 0]);

  // 3. SALÃO ADMINISTRATIVO PRINCIPAL (FUNDO ESQUERDO)
  const mainH = 0.98 + (tier - 1) * 0.14;
  const mainHall = grp(root, -0.35 * courtScale, 0.09, -1.08 * courtScale);
  mainHall.rotation.y = -0.35;
  box(mainHall, 2.08, mainH, 1.24, wallM, [0, mainH * 0.5, 0]);
  box(mainHall, 2.14, 0.11, 1.30, trimM, [0, 0.18, 0]);
  box(mainHall, 2.18, 0.10, 1.34, trimM, [0, mainH + 0.04, 0]);

  box(mainHall, 0.52, 0.72, 0.08, M.wood, [0.15, 0.36, 0.64]);
  const colCount = tier >= 3 ? 4 : 2;
  for (let c = 0; c < colCount; c++) {
    const cx = -0.30 + (c / Math.max(1, colCount - 1)) * 0.90;
    buildLotusColumn(mainHall, mainH, M, [cx, 0, 0.76], 0.062, tier >= 4);
  }
  box(mainHall, 1.18, 0.12, 0.36, M.stoneBright, [0.15, mainH + 0.05, 0.68]);

  // Anexo lateral com toldo de linho egípcio listrado
  box(mainHall, 0.78, 0.06, 0.90, M.linen, [-1.26, 0.84, 0.05], [0, 0, 0.24]);
  for (const sx of [-1.52, -1.02]) {
    for (const sz of [-0.28, 0.38]) {
      cyl(mainHall, 0.048, 0.058, 0.80, 10, tier >= 3 ? M.stoneBright : M.wood, [sx, 0.40, sz]);
    }
  }
  cyl(mainHall, 0.14, 0.12, 0.28, 12, M.wood, [-1.18, 0.14, 0.34]);

  if (tier >= 2) {
    const upperH = 0.48 + (tier - 2) * 0.08;
    box(mainHall, 1.60, upperH, 0.94, M.stoneBright, [0.10, mainH + upperH * 0.5, -0.04]);
    box(mainHall, 1.72, 0.09, 1.06, trimM, [0.10, mainH + upperH + 0.04, -0.04]);
    box(mainHall, 1.64, 0.05, 0.98, M.roofTiles, [0.10, mainH + upperH + 0.10, -0.04]);
    buildWingedSun(mainHall, M, [0.10, mainH + upperH * 0.52, 0.45], 0.92);
    createEgyptianEmblem(mainHall, M.gold, M.divineGlow, M.trim, [0.10, mainH + upperH + 0.44, 0.12], 0.78, M.emblems);

    if (tier === 5) {
      const py = new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.95, 4), M.stoneBright);
      py.rotation.y = Math.PI / 4;
      py.position.set(0.10, mainH + upperH + 0.58, -0.04);
      mainHall.add(py);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.30, 4), M.gold);
      cap.rotation.y = Math.PI / 4;
      cap.position.set(0.10, mainH + upperH + 1.05, -0.04);
      mainHall.add(cap);
    }
  } else {
    box(mainHall, 2.12, 0.06, 1.28, M.roofTiles, [0, mainH + 0.11, 0]);
    buildWingedSun(mainHall, M, [0.15, mainH * 0.82, 0.65], 0.78);
  }

  // 4. PAVILHÃO DE CONSELHO / TRIBUNAL DO FARAÓ (FRENTE ESQUERDA)
  const subH = 0.82 + (tier - 1) * 0.08;
  const subHall = grp(root, -0.35 * courtScale, 0.09, 1.18 * courtScale);
  subHall.rotation.y = 0.48;
  box(subHall, 1.64, subH, 1.00, wallM, [0, subH * 0.5, 0]);
  box(subHall, 1.72, 0.10, 1.08, trimM, [0, 0.16, 0]);
  box(subHall, 1.76, 0.09, 1.12, trimM, [0, subH + 0.04, 0]);
  box(subHall, 1.66, 0.05, 1.02, M.roofTiles, [0, subH + 0.10, 0]);
  if (tier >= 3) {
    for (const sx of [-0.55, 0, 0.55]) {
      buildLotusColumn(subHall, subH, M, [sx, 0, 0.60], 0.055, tier >= 4);
    }
  }
  if (tier >= 2) {
    createEgyptianEmblem(subHall, M.gold, M.divineGlow, M.trim, [0, subH + 0.38, 0.25], 0.65, M.emblems);
  }

  // 5. GRANEIRO / SILO DO NILO (LADO DIREITO)
  const silo = grp(root, 1.58 * courtScale, 0.09, -0.15);
  const siloR = 0.46 + (tier - 1) * 0.04;
  const siloH = 1.04 + (tier - 1) * 0.12;
  cyl(silo, siloR * 0.88, siloR + 0.03, siloH, 20, wallM, [0, siloH * 0.5, 0]);
  cyl(silo, siloR + 0.04, siloR + 0.04, 0.08, 20, trimM, [0, 0.16, 0]);
  cyl(silo, siloR * 0.92, siloR * 0.92, 0.08, 20, M.gold, [0, siloH - 0.04, 0]);
  if (tier >= 4) {
    for (let c = 0; c < 8; c++) {
      const ca = (c / 8) * Math.PI * 2;
      buildLotusColumn(
        silo,
        siloH,
        M,
        [Math.cos(ca) * (siloR + 0.10), 0, Math.sin(ca) * (siloR + 0.10)],
        0.048,
        true
      );
    }
  }
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(siloR * 0.92, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    tier >= 4 ? M.gold : M.stoneBright
  );
  dome.position.set(0, siloH, 0);
  dome.castShadow = true;
  silo.add(dome);
  createEgyptianEmblem(silo, M.gold, M.divineGlow, M.trim, [0, siloH + siloR + 0.34, 0], 0.72, M.emblems);

  // 6. POÇO / ESPELHO D'ÁGUA SAGRADO NO PÁTIO
  const well = grp(root, 0.80 * courtScale, 0.09, -0.84 * courtScale);
  cyl(well, 0.25, 0.27, 0.30, 16, M.stoneBright, [0, 0.15, 0]);
  cyl(well, 0.20, 0.20, 0.04, 16, M.water, [0, 0.29, 0]);
  box(well, 0.04, 0.46, 0.04, M.gold, [-0.22, 0.38, 0]);
  box(well, 0.04, 0.46, 0.04, M.gold, [0.22, 0.38, 0]);
  box(well, 0.52, 0.04, 0.04, M.gold, [0, 0.58, 0]);

  // 7. MURALHA PERIMETRAL, PORTÕES DE PILONES E TORRES DE VIGIA (T3+)
  const fenceGroup = grp(root, 0, 0.09, 0);
  const radX = 2.22 * courtScale;
  const radZ = 2.04 * courtScale;
  if (tier >= 3) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      if ((a > 0.52 && a < 1.18) || (a > 2.22 && a < 2.88)) continue;
      const rx = Math.cos(a) * radX;
      const rz = Math.sin(a) * radZ;
      box(
        fenceGroup,
        0.36,
        0.46 + (tier - 3) * 0.10,
        0.14,
        M.stoneBright,
        [rx, 0.23, rz],
        [0, -a + Math.PI / 2, 0]
      );
      box(
        fenceGroup,
        0.38,
        0.06,
        0.16,
        trimM,
        [rx, 0.48 + (tier - 3) * 0.10, rz],
        [0, -a + Math.PI / 2, 0]
      );
    }
  } else {
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      if ((a > 0.55 && a < 1.15) || (a > 2.25 && a < 2.85)) continue;
      box(
        fenceGroup,
        0.055,
        0.42,
        0.055,
        tier >= 2 ? M.stoneBright : M.wood,
        [Math.cos(a) * radX, 0.21, Math.sin(a) * radZ],
        [0, -a, 0]
      );
    }
  }

  for (const [gx, gz, rotY] of [
    [-1.38 * courtScale, 1.42 * courtScale, 0.65],
    [1.32 * courtScale, 1.42 * courtScale, -0.65]
  ]) {
    const gate = grp(fenceGroup, gx, 0, gz);
    gate.rotation.y = rotY;
    const pH = 0.88 + tier * 0.08;
    if (tier >= 3) {
      buildEgyptianPylon(gate, 0.34, 0.32, pH, M, [-0.46, 0, 0], false);
      buildEgyptianPylon(gate, 0.34, 0.32, pH, M, [0.46, 0, 0], false);
      box(gate, 1.18, 0.14, 0.28, M.stoneBright, [0, pH + 0.06, 0]);
      box(gate, 1.22, 0.07, 0.32, trimM, [0, pH + 0.15, 0]);
      buildWingedSun(gate, M, [0, pH + 0.06, 0.16], 0.72);
      createEgyptianEmblem(gate, M.gold, M.divineGlow, M.trim, [0, pH + 0.45, 0], 0.58, M.emblems);
    } else {
      box(gate, 0.18, pH, 0.18, M.stoneBright, [-0.45, pH * 0.5, 0]);
      box(gate, 0.18, pH, 0.18, M.stoneBright, [0.45, pH * 0.5, 0]);
      box(gate, 1.14, 0.14, 0.22, M.stoneBright, [0, pH + 0.05, 0]);
      box(gate, 1.18, 0.06, 0.24, trimM, [0, pH + 0.14, 0]);
    }
  }

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
    const tH = 1.48 + (tier - 3) * 0.28;
    towerCoords.forEach(([tx, tz]) => {
      const tw = grp(fenceGroup, tx, 0, tz);
      buildEgyptianPylon(tw, 0.78, 0.78, tH, M, [0, 0, 0], true);
      if (tier === 5) {
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.36, 4), M.gold);
        cap.rotation.y = Math.PI / 4;
        cap.position.set(0, tH + 0.36, 0);
        tw.add(cap);
      }
      createEgyptianEmblem(tw, M.gold, M.divineGlow, M.trim, [0, tH + (tier === 5 ? 0.72 : 0.48), 0], 0.55, M.emblems);
    });
  }

  // 8. ESTÁTUAS MONUMENTAIS DOS GUARDIÕES EGÍPCIOS
  buildEgyptianGuardian(root, M, tier, [-1.84 * courtScale, 0.09, -0.05], 0.55, 1.0 + (tier - 1) * 0.06);
  if (tier >= 3) {
    buildEgyptianGuardian(root, M, tier, [1.84 * courtScale, 0.09, 0.85], -0.55, 1.0 + (tier - 1) * 0.06);
  }

  // 9. BRASEIROS SAGRADOS (T2+)
  if (tier >= 2) {
    buildBrazier(root, M, [-0.68 * courtScale, 0.09, 1.72 * courtScale], 0.85 + tier * 0.06);
    buildBrazier(root, M, [0.76 * courtScale, 0.09, 1.70 * courtScale], 0.85 + tier * 0.06);
  }

  // 10. ELEMENTOS EXCLUSIVOS DE CADA DEUS EGÍPCIO (RÁ, ÍSIS E SET)
  const godWrap = grp(root, 0, 0.09, 0);

  // ☀️ RÁ: Estandartes Solares e Obeliscos Dourados
  const raDeco = grp(godWrap);
  for (const [bx, bz] of [
    [-1.65 * courtScale, 1.18 * courtScale],
    [1.58 * courtScale, 1.18 * courtScale]
  ]) {
    cyl(raDeco, 0.024, 0.03, 1.18 + tier * 0.08, 8, M.gold, [bx, 0.59, bz]);
    box(raDeco, 0.03, 0.46, 0.26, M.trim, [bx, 0.92 + tier * 0.06, bz + 0.13]);
    createEgyptianEmblem(raDeco, M.gold, M.divineGlow, M.trim, [bx, 1.28 + tier * 0.08, bz], 0.55);
  }
  if (tier >= 3) {
    for (const ox of [-1.15 * courtScale, 1.15 * courtScale]) {
      const obH = 1.10 + tier * 0.14;
      cyl(raDeco, 0.09, 0.15, obH, 4, M.stoneBright, [ox, obH * 0.5, 1.85 * courtScale], [0, Math.PI / 4, 0]);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.28, 4), M.gold);
      tip.rotation.y = Math.PI / 4;
      tip.position.set(ox, obH + 0.14, 1.85 * courtScale);
      raDeco.add(tip);
    }
  }

  // 🪽 ÍSIS: Espelhos d'Água do Nilo, Palmeiras Sagradas e Emblemas de Lótus/Ankh
  const isisDeco = grp(godWrap);
  cyl(isisDeco, 0.46, 0.52, 0.16, 18, M.stoneBright, [0.98 * courtScale, 0.08, 0.68 * courtScale]);
  cyl(isisDeco, 0.40, 0.40, 0.04, 18, M.water, [0.98 * courtScale, 0.16, 0.68 * courtScale]);
  buildPalmTree(isisDeco, 1.15 + tier * 0.10, M, [-1.52 * courtScale, 0, 1.15 * courtScale], 0.95);
  if (tier >= 3) {
    buildPalmTree(isisDeco, 1.25 + tier * 0.10, M, [1.52 * courtScale, 0, 1.25 * courtScale], 1.0);
  }
  const isisEmb = createEgyptianEmblem(
    isisDeco,
    M.gold,
    M.divineGlow,
    M.trim,
    [0.98 * courtScale, 0.68, 0.68 * courtScale],
    0.82
  );
  isisEmb.children[0].visible = false;
  isisEmb.children[1].visible = true;
  isisDeco.visible = false;

  // 🐺 SET: Obeliscos Sombrios de Obsidiana, Braseiros Flamejantes e Roda de Biga
  const setDeco = grp(godWrap);
  const obeliskPositions = [
    [-1.92 * courtScale, -1.32 * courtScale],
    [2.02 * courtScale, -1.12 * courtScale],
    [-1.75 * courtScale, 1.35 * courtScale],
    [1.75 * courtScale, 1.35 * courtScale]
  ];
  obeliskPositions.forEach(([ox, oz], idx) => {
    if (idx >= 2 && tier < 3) return;
    const obH = 1.08 + tier * 0.14;
    cyl(setDeco, 0.09, 0.18, obH, 4, M.obsidian, [ox, obH * 0.5, oz], [0, Math.PI / 4, 0]);
    cyl(setDeco, 0.005, 0.09, 0.22, 4, M.divineGlow, [ox, obH + 0.11, oz], [0, Math.PI / 4, 0]);
    const flameOrb = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 8), M.flame);
    flameOrb.position.set(ox, obH + 0.30, oz);
    setDeco.add(flameOrb);
    M.flames.push(flameOrb);
  });
  const wheel = grp(setDeco, 1.02 * courtScale, 0.30, 0.72 * courtScale);
  wheel.rotation.set(0, -0.4, 0.16);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.028, 8, 20), M.wood);
  wheel.add(rim);
  for (let s = 0; s < 3; s++) {
    box(wheel, 0.54, 0.022, 0.022, M.gold, [0, 0, 0], [0, 0, (s / 3) * Math.PI]);
  }
  setDeco.visible = false;

  M.godDecors.push({ raDeco, isisDeco, setDeco });
  return root;
}

/* ==========================================================================
   5. CONSTRUTOR PROCEDURAL PARA O ENGINE DO JOGO
   ========================================================================== */
export interface EgyptianTownCenterBuildResult {
  group: THREE.Group;
  materials: EgyptianTownCenterMaterials;
  flames: THREE.Mesh[];
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function buildProceduralEgyptianTownCenter(
  targetGroup: THREE.Group,
  age: number = 1,
  godKey: string = 'ra',
  enableShadows = true
): EgyptianTownCenterBuildResult {
  const normGod: EgyptianTownCenterGodKey = godKey.toLowerCase().includes('isis')
    ? 'isis'
    : godKey.toLowerCase().includes('set')
    ? 'set'
    : 'ra';
  const theme = EGYPTIAN_TOWN_CENTER_THEMES[normGod] || EGYPTIAN_TOWN_CENTER_THEMES.ra;
  const materials = createEgyptianTownCenterMaterials(theme);

  const tier = Math.max(1, Math.min(5, Math.round(age)));
  const tcMesh = buildEgyptianTownCenterStructure(targetGroup, materials, tier);

  materials.emblems.forEach(e => {
    e.ra.visible = (normGod === 'ra');
    e.isis.visible = (normGod === 'isis');
    e.set.visible = (normGod === 'set');
  });

  materials.guardianHeads.forEach(gh => {
    gh.raSun.visible = (normGod === 'ra');
    gh.isisHorns.visible = (normGod === 'isis');
    gh.setHead.visible = (normGod === 'set');
  });

  materials.godDecors.forEach(d => {
    d.raDeco.visible = (normGod === 'ra');
    d.isisDeco.visible = (normGod === 'isis');
    d.setDeco.visible = (normGod === 'set');
  });

  if (enableShadows) {
    tcMesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  if (tier >= 4) {
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.65, 48),
      new THREE.MeshBasicMaterial({
        color: theme.glowHex,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    targetGroup.add(halo);
    metropolisHalo = halo;

    const apex = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35, 1),
      materials.gold
    );
    apex.position.set(0, 3.2, 0);
    targetGroup.add(apex);
    metropolisCrystal = apex;
  }

  return {
    group: tcMesh,
    materials,
    flames: materials.flames,
    metropolisHalo,
    metropolisCrystal
  };
}

/* ==========================================================================
   6. STUDIO ADAPTER (STUDIO 3D GALLERY COM LIVE CONTROLS)
   ========================================================================== */
export function buildEgyptianTownCenterStudio(godKey: string, initialTier: number, _isPbr = true) {
  const normGod: EgyptianTownCenterGodKey = godKey.toLowerCase().includes('isis')
    ? 'isis'
    : godKey.toLowerCase().includes('set')
    ? 'set'
    : 'ra';
  const theme = EGYPTIAN_TOWN_CENTER_THEMES[normGod] || EGYPTIAN_TOWN_CENTER_THEMES.ra;
  const M = createEgyptianTownCenterMaterials(theme);

  const root = new THREE.Group();
  const tierHolders: Record<number, THREE.Group> = {};

  for (let t = 1; t <= 5; t++) {
    const holder = new THREE.Group();
    buildEgyptianTownCenterStructure(holder, M, t);
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
    const nextGod: EgyptianTownCenterGodKey = newGodKey.toLowerCase().includes('isis')
      ? 'isis'
      : newGodKey.toLowerCase().includes('set')
      ? 'set'
      : 'ra';
    const nextTheme = EGYPTIAN_TOWN_CENTER_THEMES[nextGod] || EGYPTIAN_TOWN_CENTER_THEMES.ra;

    M.stoneBase.color.setHex(nextTheme.stoneBase);
    M.stoneBright.color.setHex(nextTheme.stoneBright);
    M.trim.color.setHex(nextTheme.trimHex);
    M.gold.color.setHex(nextTheme.goldHex);
    M.statue.color.setHex(nextTheme.statueHex);
    M.flame.color.setHex(nextTheme.flameHex);
    M.divineGlow.emissive.setHex(nextTheme.glowHex);
    auraRing.material.color.setHex(nextTheme.glowHex);

    if (M.linen.map) M.linen.map.dispose();
    M.linen.map = createLinenTexture(nextTheme);
    M.linen.needsUpdate = true;

    M.emblems.forEach(e => {
      e.ra.visible = (nextGod === 'ra');
      e.isis.visible = (nextGod === 'isis');
      e.set.visible = (nextGod === 'set');
    });

    M.guardianHeads.forEach(gh => {
      gh.raSun.visible = (nextGod === 'ra');
      gh.isisHorns.visible = (nextGod === 'isis');
      gh.setHead.visible = (nextGod === 'set');
    });

    M.godDecors.forEach(d => {
      d.raDeco.visible = (nextGod === 'ra');
      d.isisDeco.visible = (nextGod === 'isis');
      d.setDeco.visible = (nextGod === 'set');
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
