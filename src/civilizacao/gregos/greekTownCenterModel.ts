import * as THREE from 'three';

/* ==========================================================================
   1. TEMAS VISUAIS DAS DIVINDADES GREGAS (ZEUS, POSEIDON, HADES)
   ========================================================================== */
export type GreekTownCenterGodKey = 'zeus' | 'poseidon' | 'hades';

export interface GreekTownCenterTheme {
  id: GreekTownCenterGodKey;
  godName: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  wallBase: number;
  wallBright: number;
  trimHex: number;
  goldHex: number;
  roofBase: string;
  roofRib: string;
  roofPatina: string;
  flameHex: number;
  glowHex: number;
  particleHex: number;
  groundGrass: string;
  groundDirt: string;
}

export const GREEK_TOWN_CENTER_THEMES: Record<GreekTownCenterGodKey, GreekTownCenterTheme> = {
  zeus: {
    id: 'zeus',
    godName: 'Zeus',
    bgHex: 0x102240,
    hemiSky: 0xfef9c3,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    wallBase: 0xe6e1d3,
    wallBright: 0xf8fafc,
    trimHex: 0x1d4ed8,
    goldHex: 0xfacc15,
    roofBase: '#8c5432',
    roofRib: '#c2713e',
    roofPatina: '#6e4730',
    flameHex: 0xf59e0b,
    glowHex: 0x38bdf8,
    particleHex: 0xfef08a,
    groundGrass: '#56852e',
    groundDirt: '#c2a474'
  },
  poseidon: {
    id: 'poseidon',
    godName: 'Poseidon',
    bgHex: 0x062030,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0c4a6e,
    rimHex: 0x2dd4bf,
    wallBase: 0xdbeafe,
    wallBright: 0xf0f9ff,
    trimHex: 0x0d9488,
    goldHex: 0xfacc15,
    roofBase: '#3d786b',
    roofRib: '#2dd4bf',
    roofPatina: '#134e4a',
    flameHex: 0x2dd4bf,
    glowHex: 0x2dd4bf,
    particleHex: 0x99f6e4,
    groundGrass: '#457a49',
    groundDirt: '#c2aa7e'
  },
  hades: {
    id: 'hades',
    godName: 'Hades',
    bgHex: 0x05030a,
    hemiSky: 0x6ee7b7,
    hemiGround: 0x1e0836,
    rimHex: 0x10b981,
    wallBase: 0x26262c,
    wallBright: 0x18181d,
    trimHex: 0x7f1d1d,
    goldHex: 0xb45309,
    roofBase: '#121216',
    roofRib: '#991b1b',
    roofPatina: '#052e16',
    flameHex: 0x10b981,
    glowHex: 0x10b981,
    particleHex: 0x10b981,
    groundGrass: '#1f261e',
    groundDirt: '#38302c'
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS COM CACHE (MÁRMORE, TELHADO E TERRENO)
   ========================================================================== */
const tcTexCache = new Map<string, THREE.CanvasTexture>();

function createStoneWallTexture(isBright = false): THREE.CanvasTexture {
  const key = `tc_stonewall_${isBright ? 'bright' : 'base'}`;
  if (tcTexCache.has(key)) return tcTexCache.get(key)!;
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = isBright ? '#f4f1ea' : '#dad4c5';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 14;
  const rH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rH;
    const cols = 7;
    const cW = 512 / cols;
    const off = (r % 2 === 0) ? 0 : cW * 0.5;
    for (let c = -1; c <= cols; c++) {
      const x = c * cW + off;
      const base = isBright ? 236 : 210;
      const delta = Math.floor((Math.random() - 0.5) * 22);
      ctx.fillStyle = `rgb(${base + delta}, ${base + delta - 5}, ${base + delta - 14})`;
      ctx.fillRect(x + 2, y + 2, cW - 4, rH - 4);
      ctx.strokeStyle = 'rgba(38, 34, 30, 0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, cW - 2, rH - 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tcTexCache.set(key, tex);
  return tex;
}

function createRoofTexture(theme: GreekTownCenterTheme): THREE.CanvasTexture {
  const key = `tc_roof_${theme.id}`;
  if (tcTexCache.has(key)) return tcTexCache.get(key)!;
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = theme.roofBase;
  ctx.fillRect(0, 0, 512, 512);

  const cols = 22;
  const cW = 512 / cols;
  for (let i = 0; i < cols; i++) {
    const x = i * cW;
    const grad = ctx.createLinearGradient(x, 0, x + cW, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.34)');
    grad.addColorStop(0.35, theme.roofRib);
    grad.addColorStop(0.75, theme.roofPatina);
    grad.addColorStop(1, 'rgba(0,0,0,0.40)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, cW, 512);
  }

  ctx.strokeStyle = 'rgba(20, 14, 10, 0.34)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 512; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tcTexCache.set(key, tex);
  return tex;
}

/* ==========================================================================
   3. HELPERS DE GEOMETRIA
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

export interface TownCenterMaterials {
  wallBase: THREE.MeshStandardMaterial;
  wallBright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  iron: THREE.MeshStandardMaterial;
  obsidian: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  divineGlow: THREE.MeshStandardMaterial;
  flames: THREE.Mesh[];
  emblems: Array<{ zeus: THREE.Group; poseidon: THREE.Group; hades: THREE.Group }>;
  godDecors: Array<{ zeusDeco: THREE.Group; poseidonDeco: THREE.Group; hadesDeco: THREE.Group }>;
}

export function createTownCenterMaterials(theme: GreekTownCenterTheme): TownCenterMaterials {
  return {
    wallBase: new THREE.MeshStandardMaterial({
      map: createStoneWallTexture(false),
      color: theme.wallBase,
      roughness: 0.72,
      metalness: 0.06
    }),
    wallBright: new THREE.MeshStandardMaterial({
      map: createStoneWallTexture(true),
      color: theme.wallBright,
      roughness: 0.54,
      metalness: 0.10
    }),
    trim: new THREE.MeshStandardMaterial({
      color: theme.trimHex,
      roughness: 0.38,
      metalness: 0.30
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.25,
      metalness: 0.90,
      roughness: 0.20
    }),
    roof: new THREE.MeshStandardMaterial({
      map: createRoofTexture(theme),
      roughness: 0.56,
      metalness: 0.16,
      side: THREE.DoubleSide
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x6b3818,
      roughness: 0.72
    }),
    iron: new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.78,
      roughness: 0.34
    }),
    obsidian: new THREE.MeshStandardMaterial({
      color: 0x111116,
      metalness: 0.45,
      roughness: 0.25
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
    godDecors: []
  };
}

function createDivineEmblem(
  parent: THREE.Object3D,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  emblemRegistry: Array<{ zeus: THREE.Group; poseidon: THREE.Group; hades: THREE.Group }> | null = null
): THREE.Group {
  const root = grp(parent, pos[0], pos[1], pos[2]);
  root.scale.setScalar(scale);

  // 1. ⚡ Raio Olímpico de Zeus
  const zeus = grp(root);
  box(zeus, 0.08, 0.34, 0.05, glowMat, [-0.04, 0.14, 0], [0, 0, -0.36]);
  box(zeus, 0.16, 0.06, 0.05, goldMat, [0, 0, 0]);
  cyl(zeus, 0.005, 0.07, 0.36, 4, glowMat, [0.05, -0.15, 0], [0, 0, Math.PI - 0.36]);
  const zRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.015, 8, 24), goldMat);
  zeus.add(zRing);

  // 2. 🔱 Tridente Sagrado de Poseidon
  const poseidon = grp(root);
  cyl(poseidon, 0.024, 0.024, 0.56, 8, goldMat, [0, -0.06, 0]);
  box(poseidon, 0.28, 0.04, 0.04, goldMat, [0, 0.08, 0]);
  cyl(poseidon, 0.005, 0.045, 0.28, 4, glowMat, [0, 0.24, 0]);
  for (const sx of [-1, 1]) {
    cyl(poseidon, 0.005, 0.035, 0.22, 4, glowMat, [sx * 0.12, 0.20, 0], [0, 0, sx * -0.06]);
  }
  const pRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.015, 8, 24), glowMat);
  poseidon.add(pRing);
  poseidon.visible = false;

  // 3. 💀 Bidente Infernal & Crânio de Hades
  const hades = grp(root);
  cyl(hades, 0.024, 0.024, 0.50, 8, goldMat, [0, -0.10, 0]);
  box(hades, 0.24, 0.04, 0.04, goldMat, [0, 0.06, 0]);
  for (const sx of [-1, 1]) {
    cyl(hades, 0.005, 0.042, 0.26, 4, glowMat, [sx * 0.10, 0.20, 0]);
  }
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), glowMat);
  skull.position.set(0, 0.05, 0.03);
  hades.add(skull);
  box(hades, 0.08, 0.05, 0.06, glowMat, [0, -0.01, 0.03]);
  const hRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 6, 6), glowMat);
  hades.add(hRing);
  hades.visible = false;

  if (emblemRegistry) emblemRegistry.push({ zeus, poseidon, hades });
  return root;
}

function buildGableRoof(
  parent: THREE.Object3D,
  w: number,
  d: number,
  h: number,
  roofMat: THREE.Material,
  wallMat: THREE.Material,
  _trimMat: THREE.Material,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  yBase: number,
  emblemRegistry: Array<{ zeus: THREE.Group; poseidon: THREE.Group; hades: THREE.Group }> | null,
  alongZ = true
): THREE.Group {
  const rGrp = grp(parent, 0, yBase, 0);
  if (!alongZ) rGrp.rotation.y = Math.PI / 2;
  const span = alongZ ? w : d;
  const length = alongZ ? d : w;
  const rx = span * 0.5;
  const rz = length * 0.5;

  const slopeLen = Math.hypot(rx, h);
  const slopeAng = Math.atan2(h, rx);
  box(rGrp, slopeLen + 0.10, 0.07, length + 0.14, roofMat, [-rx * 0.5, h * 0.5, 0], [0, 0, slopeAng]);
  box(rGrp, slopeLen + 0.10, 0.07, length + 0.14, roofMat, [rx * 0.5, h * 0.5, 0], [0, 0, -slopeAng]);
  box(rGrp, 0.11, 0.08, length + 0.18, wallMat, [0, h + 0.03, 0]);

  const triShape = new THREE.Shape();
  triShape.moveTo(-rx, 0);
  triShape.lineTo(rx, 0);
  triShape.lineTo(0, h);
  triShape.closePath();
  const triGeo = new THREE.ExtrudeGeometry(triShape, { depth: length - 0.02, bevelEnabled: false });
  triGeo.translate(0, 0, -(length - 0.02) * 0.5);
  const ped = new THREE.Mesh(triGeo, wallMat);
  ped.castShadow = true;
  ped.receiveShadow = true;
  rGrp.add(ped);

  if (emblemRegistry) {
    createDivineEmblem(rGrp, goldMat, glowMat, [0, h * 0.36, rz + 0.02], h * 1.15, emblemRegistry);
  }
  return rGrp;
}

function buildBrazier(
  parent: THREE.Object3D,
  goldMat: THREE.Material,
  flameMat: THREE.Material,
  flameRegistry: THREE.Mesh[] | null,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const b = grp(parent, pos[0], pos[1], pos[2]);
  b.scale.setScalar(scale);
  cyl(b, 0.12, 0.16, 0.08, 12, goldMat, [0, 0.04, 0]);
  cyl(b, 0.04, 0.05, 0.34, 10, goldMat, [0, 0.25, 0]);
  cyl(b, 0.20, 0.10, 0.12, 12, goldMat, [0, 0.46, 0]);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 10), flameMat);
  flame.position.set(0, 0.66, 0);
  b.add(flame);
  if (flameRegistry) flameRegistry.push(flame);
  return b;
}

function buildGuardianMonument(
  parent: THREE.Object3D,
  M: TownCenterMaterials,
  tier: number,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  scale = 1.0
): THREE.Group {
  const ped = grp(parent, pos[0], pos[1], pos[2]);
  ped.rotation.y = rotY;
  ped.scale.setScalar(scale);

  const trimM = tier >= 4 ? M.gold : M.trim;
  box(ped, 0.96, 0.15, 0.96, M.wallBase, [0, 0.075, 0]);
  box(ped, 0.82, 0.52, 0.82, M.wallBright, [0, 0.41, 0]);
  box(ped, 0.88, 0.09, 0.88, trimM, [0, 0.71, 0]);
  box(ped, 0.38, 0.30, 0.84, M.gold, [0, 0.41, 0]);

  const statMat = tier >= 3 ? M.gold : M.wallBright;
  const fig = grp(ped, 0, 0.76, 0);
  cyl(fig, 0.16, 0.21, 0.66, 14, statMat, [0, 0.33, 0]);
  box(fig, 0.42, 0.46, 0.26, statMat, [0, 0.86, 0]);
  box(fig, 0.44, 0.10, 0.28, trimM, [0, 0.66, 0]);

  if (tier >= 2) {
    box(fig, 0.38, 0.78, 0.06, M.trim, [0, 0.72, -0.15], [0.12, 0, 0]);
  }

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), statMat);
  head.position.set(0, 1.22, 0.02);
  fig.add(head);
  box(fig, 0.07, 0.20, 0.26, tier >= 2 ? M.gold : trimM, [0, 1.35, 0]);

  box(fig, 0.12, 0.38, 0.12, statMat, [0.26, 0.92, 0.12], [-0.45, 0, -0.25]);
  box(fig, 0.12, 0.38, 0.12, statMat, [-0.26, 0.92, 0.12], [-0.45, 0, 0.25]);
  cyl(fig, 0.022, 0.022, 1.78, 8, M.gold, [0.18, 0.88, 0.25]);
  createDivineEmblem(fig, M.gold, M.divineGlow, [0.18, 1.84, 0.25], 0.65, M.emblems);

  return ped;
}

/* ==========================================================================
   4. CONSTRUTOR ARQUITETÔNICO DO CENTRO DA CIDADE GREGO (T1 A T5)
   ========================================================================== */
export function buildGreekTownCenterStructure(
  parent: THREE.Object3D,
  M: TownCenterMaterials,
  tier: number
): THREE.Group {
  const root = grp(parent);
  const wallM = tier >= 4 ? M.wallBright : M.wallBase;
  const trimM = tier >= 4 ? M.gold : M.trim;
  const courtScale = 1 + (tier - 1) * 0.11;

  // 1. PLATAFORMA E PÁTIO CENTRAL EM MÁRMORE
  box(root, 3.85 * courtScale, 0.08, 3.65 * courtScale, M.wallBase, [0, 0.04, 0]);
  if (tier >= 3) {
    box(root, 4.15 * courtScale, 0.06, 3.95 * courtScale, M.wallBright, [0, 0.03, 0]);
    box(root, 4.20 * courtScale, 0.04, 4.00 * courtScale, trimM, [0, 0.08, 0]);
  }

  // 2. FOGUEIRA SAGRADA CENTRAL COM TRIPÉ E CALDEIRÃO DOURADO
  const hearth = grp(root, 0.22, 0.08, 0.18);
  if (tier >= 4) {
    cyl(hearth, 0.48, 0.56, 0.14, 16, M.wallBright, [0, 0.07, 0]);
    cyl(hearth, 0.52, 0.52, 0.05, 16, M.gold, [0, 0.15, 0]);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(
      hearth,
      0.14,
      0.10,
      0.12,
      M.wallBright,
      [Math.cos(a) * 0.30, 0.05 + (tier >= 4 ? 0.12 : 0), Math.sin(a) * 0.30],
      [0, a, 0]
    );
  }
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.22 + tier * 0.02, 0.45 + tier * 0.06, 12),
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

  // 3. SALÃO PRINCIPAL (FUNDO ESQUERDO)
  const mainH = 0.96 + (tier - 1) * 0.14;
  const mainHall = grp(root, -0.35 * courtScale, 0.08, -1.08 * courtScale);
  mainHall.rotation.y = -0.35;
  box(mainHall, 2.05, mainH, 1.20, wallM, [0, mainH * 0.5, 0]);
  box(mainHall, 2.10, 0.11, 1.25, trimM, [0, 0.18, 0]);

  box(mainHall, 0.52, 0.72, 0.08, M.wood, [0.15, 0.36, 0.62]);
  const colCount = tier >= 3 ? 4 : 2;
  for (let c = 0; c < colCount; c++) {
    const cx = -0.30 + (c / Math.max(1, colCount - 1)) * 0.90;
    cyl(mainHall, 0.055, 0.068, mainH, 12, tier >= 4 ? M.gold : M.wallBright, [cx, mainH * 0.5, 0.74]);
  }
  box(mainHall, 1.15, 0.12, 0.34, M.wallBright, [0.15, mainH + 0.04, 0.66]);

  box(mainHall, 0.76, 0.06, 0.88, M.roof, [-1.26, 0.82, 0.05], [0, 0, 0.25]);
  for (const sx of [-1.52, -1.02]) {
    for (const sz of [-0.28, 0.38]) {
      cyl(mainHall, 0.048, 0.058, 0.80, 10, tier >= 3 ? M.wallBright : M.wood, [sx, 0.40, sz]);
    }
  }
  cyl(mainHall, 0.14, 0.12, 0.28, 12, M.wood, [-1.18, 0.14, 0.34]);

  if (tier >= 2) {
    const upperH = 0.46 + (tier - 2) * 0.08;
    box(mainHall, 1.56, upperH, 0.90, M.wallBright, [0.10, mainH + upperH * 0.5, -0.04]);
    box(mainHall, 1.62, 0.08, 0.96, trimM, [0.10, mainH + 0.05, -0.04]);
    buildGableRoof(
      mainHall,
      1.68,
      1.02,
      0.38,
      M.roof,
      M.wallBright,
      trimM,
      M.gold,
      M.divineGlow,
      mainH + upperH,
      M.emblems,
      false
    );
  } else {
    buildGableRoof(
      mainHall,
      2.16,
      1.32,
      0.44,
      M.roof,
      wallM,
      trimM,
      M.gold,
      M.divineGlow,
      mainH,
      M.emblems,
      false
    );
  }

  // 4. PAVILHÃO SECUNDÁRIO / CONSELHO CÍVICO (FRENTE ESQUERDA)
  const subH = 0.80 + (tier - 1) * 0.08;
  const subHall = grp(root, -0.35 * courtScale, 0.08, 1.18 * courtScale);
  subHall.rotation.y = 0.48;
  box(subHall, 1.62, subH, 0.98, wallM, [0, subH * 0.5, 0]);
  box(subHall, 1.68, 0.10, 1.04, trimM, [0, 0.16, 0]);
  if (tier >= 3) {
    for (const sx of [-0.55, 0, 0.55]) {
      cyl(subHall, 0.05, 0.06, subH, 10, M.wallBright, [sx, subH * 0.5, 0.58]);
    }
  }
  buildGableRoof(
    subHall,
    1.74,
    1.10,
    0.36,
    M.roof,
    wallM,
    trimM,
    M.gold,
    M.divineGlow,
    subH,
    tier >= 2 ? M.emblems : null,
    false
  );

  // 5. SILO / ROTUNDA DE GRÃOS (LADO DIREITO)
  const silo = grp(root, 1.58 * courtScale, 0.08, -0.15);
  const siloR = 0.46 + (tier - 1) * 0.04;
  const siloH = 1.02 + (tier - 1) * 0.12;
  cyl(silo, siloR, siloR + 0.02, siloH, 20, wallM, [0, siloH * 0.5, 0]);
  cyl(silo, siloR + 0.03, siloR + 0.03, 0.08, 20, trimM, [0, 0.16, 0]);
  cyl(silo, siloR + 0.03, siloR + 0.03, 0.07, 20, M.gold, [0, siloH - 0.08, 0]);
  if (tier >= 4) {
    for (let c = 0; c < 8; c++) {
      const ca = (c / 8) * Math.PI * 2;
      cyl(
        silo,
        0.045,
        0.055,
        siloH,
        10,
        M.gold,
        [Math.cos(ca) * (siloR + 0.10), siloH * 0.5, Math.sin(ca) * (siloR + 0.10)]
      );
    }
  }
  cyl(silo, 0.12, siloR + 0.14, 0.36, 20, tier >= 5 ? M.gold : M.roof, [0, siloH + 0.18, 0]);
  createDivineEmblem(silo, M.gold, M.divineGlow, [0, siloH + 0.55, 0], 0.72, M.emblems);

  // 6. POÇO COMUNITÁRIO / FONTE SAGRADA NO PÁTIO
  const well = grp(root, 0.80 * courtScale, 0.08, -0.84 * courtScale);
  cyl(well, 0.24, 0.26, 0.30, 16, M.wallBright, [0, 0.15, 0]);
  cyl(well, 0.19, 0.19, 0.04, 16, M.water, [0, 0.29, 0]);
  box(well, 0.04, 0.46, 0.04, M.gold, [-0.22, 0.38, 0]);
  box(well, 0.04, 0.46, 0.04, M.gold, [0.22, 0.38, 0]);
  box(well, 0.52, 0.04, 0.04, M.gold, [0, 0.58, 0]);

  // 7. MURALHA PERIMETRAL, PORTÕES E TORRES DE VIGIA
  const fenceGroup = grp(root, 0, 0.08, 0);
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
        M.wallBright,
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
        tier >= 2 ? M.wallBright : M.wood,
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
    box(gate, 0.16, 0.84 + tier * 0.05, 0.16, M.wallBright, [-0.45, 0.42, 0]);
    box(gate, 0.16, 0.84 + tier * 0.05, 0.16, M.wallBright, [0.45, 0.42, 0]);
    box(gate, 1.14, 0.14, 0.20, M.wallBright, [0, 0.88 + tier * 0.05, 0]);
    box(gate, 1.18, 0.06, 0.22, trimM, [0, 0.97 + tier * 0.05, 0]);
    if (tier >= 3) {
      createDivineEmblem(gate, M.gold, M.divineGlow, [0, 1.24 + tier * 0.05, 0], 0.58, M.emblems);
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
    const tH = 1.45 + (tier - 3) * 0.25;
    towerCoords.forEach(([tx, tz]) => {
      const tw = grp(fenceGroup, tx, 0, tz);
      box(tw, 0.68, tH, 0.68, M.wallBright, [0, tH * 0.5, 0]);
      box(tw, 0.74, 0.10, 0.74, trimM, [0, tH + 0.05, 0]);
      cyl(tw, 0.04, 0.52, 0.42, 4, tier >= 5 ? M.gold : M.roof, [0, tH + 0.30, 0], [0, Math.PI / 4, 0]);
      createDivineEmblem(tw, M.gold, M.divineGlow, [0, tH + 0.68, 0], 0.55, M.emblems);
    });
  }

  // 8. ESTÁTUAS MONUMENTAIS DOS GUARDIÕES
  buildGuardianMonument(root, M, tier, [-1.84 * courtScale, 0.08, -0.05], 0.55, 1.0 + (tier - 1) * 0.06);
  if (tier >= 3) {
    buildGuardianMonument(root, M, tier, [1.84 * courtScale, 0.08, 0.85], -0.55, 1.0 + (tier - 1) * 0.06);
  }

  // 9. BRASEIROS SAGRADOS (T2+)
  if (tier >= 2) {
    buildBrazier(root, M.gold, M.flame, M.flames, [-0.68 * courtScale, 0.08, 1.72 * courtScale], 0.85 + tier * 0.06);
    buildBrazier(root, M.gold, M.flame, M.flames, [0.76 * courtScale, 0.08, 1.70 * courtScale], 0.85 + tier * 0.06);
  }

  // 10. ELEMENTOS EXCLUSIVOS DE CADA DEUS
  const godWrap = grp(root, 0, 0.08, 0);

  // ⚡ ZEUS: Estandartes olímpicos e símbolos de raio
  const zeusDeco = grp(godWrap);
  for (const [bx, bz] of [
    [-1.65 * courtScale, 1.18 * courtScale],
    [1.58 * courtScale, 1.18 * courtScale]
  ]) {
    cyl(zeusDeco, 0.024, 0.03, 1.15 + tier * 0.08, 8, M.gold, [bx, 0.58, bz]);
    box(zeusDeco, 0.03, 0.46, 0.26, M.trim, [bx, 0.90 + tier * 0.06, bz + 0.13]);
    createDivineEmblem(zeusDeco, M.gold, M.divineGlow, [bx, 1.25 + tier * 0.08, bz], 0.55);
  }

  // 🔱 POSEIDON: Fontes marinhas cristalinas e tridentes
  const poseidonDeco = grp(godWrap);
  cyl(poseidonDeco, 0.46, 0.52, 0.16, 18, M.wallBright, [0.98 * courtScale, 0.08, 0.68 * courtScale]);
  cyl(poseidonDeco, 0.40, 0.40, 0.04, 18, M.water, [0.98 * courtScale, 0.16, 0.68 * courtScale]);
  cyl(poseidonDeco, 0.06, 0.10, 0.45, 12, M.gold, [0.98 * courtScale, 0.28, 0.68 * courtScale]);
  const pTrident = createDivineEmblem(
    poseidonDeco,
    M.gold,
    M.divineGlow,
    [0.98 * courtScale, 0.72, 0.68 * courtScale],
    0.82
  );
  pTrident.children[0].visible = false;
  pTrident.children[1].visible = true;
  poseidonDeco.visible = false;

  // 💀 HADES: Obeliscos de obsidiana negra e chamas verdes do Estige
  const hadesDeco = grp(godWrap);
  const obeliskPositions = [
    [-1.92 * courtScale, -1.32 * courtScale],
    [2.02 * courtScale, -1.12 * courtScale],
    [-1.75 * courtScale, 1.35 * courtScale],
    [1.75 * courtScale, 1.35 * courtScale]
  ];
  obeliskPositions.forEach(([ox, oz], idx) => {
    if (idx >= 2 && tier < 3) return;
    const obH = 1.05 + tier * 0.14;
    cyl(hadesDeco, 0.09, 0.18, obH, 4, M.obsidian, [ox, obH * 0.5, oz], [0, Math.PI / 4, 0]);
    cyl(hadesDeco, 0.005, 0.09, 0.22, 4, M.divineGlow, [ox, obH + 0.11, oz], [0, Math.PI / 4, 0]);
    const flameOrb = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 8), M.flame);
    flameOrb.position.set(ox, obH + 0.30, oz);
    hadesDeco.add(flameOrb);
    M.flames.push(flameOrb);
  });
  hadesDeco.visible = false;

  M.godDecors.push({ zeusDeco, poseidonDeco, hadesDeco });
  return root;
}

/* ==========================================================================
   5. CONSTRUTOR PROCEDURAL PARA O ENGINE DO JOGO
   ========================================================================== */
export interface GreekTownCenterBuildResult {
  group: THREE.Group;
  materials: TownCenterMaterials;
  flames: THREE.Mesh[];
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function buildProceduralGreekTownCenter(
  targetGroup: THREE.Group,
  age: number = 1,
  godKey: string = 'zeus',
  enableShadows = true
): GreekTownCenterBuildResult {
  const normGod: GreekTownCenterGodKey = godKey.toLowerCase().includes('poseidon')
    ? 'poseidon'
    : godKey.toLowerCase().includes('hades')
    ? 'hades'
    : 'zeus';
  const theme = GREEK_TOWN_CENTER_THEMES[normGod] || GREEK_TOWN_CENTER_THEMES.zeus;
  const materials = createTownCenterMaterials(theme);

  const tier = Math.max(1, Math.min(5, Math.round(age)));
  const tcMesh = buildGreekTownCenterStructure(targetGroup, materials, tier);

  // Aplicar visibilidade exclusiva da divindade
  materials.emblems.forEach(e => {
    e.zeus.visible = (normGod === 'zeus');
    e.poseidon.visible = (normGod === 'poseidon');
    e.hades.visible = (normGod === 'hades');
  });
  materials.godDecors.forEach(d => {
    d.zeusDeco.visible = (normGod === 'zeus');
    d.poseidonDeco.visible = (normGod === 'poseidon');
    d.hadesDeco.visible = (normGod === 'hades');
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
export function buildGreekTownCenterStudio(godKey: string, initialTier: number, _isPbr = true) {
  const normGod: GreekTownCenterGodKey = godKey.toLowerCase().includes('poseidon')
    ? 'poseidon'
    : godKey.toLowerCase().includes('hades')
    ? 'hades'
    : 'zeus';
  const theme = GREEK_TOWN_CENTER_THEMES[normGod] || GREEK_TOWN_CENTER_THEMES.zeus;
  const M = createTownCenterMaterials(theme);

  const root = new THREE.Group();
  const tierHolders: Record<number, THREE.Group> = {};

  for (let t = 1; t <= 5; t++) {
    const holder = new THREE.Group();
    buildGreekTownCenterStructure(holder, M, t);
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
    const nextGod: GreekTownCenterGodKey = newGodKey.toLowerCase().includes('poseidon')
      ? 'poseidon'
      : newGodKey.toLowerCase().includes('hades')
      ? 'hades'
      : 'zeus';
    const nextTheme = GREEK_TOWN_CENTER_THEMES[nextGod] || GREEK_TOWN_CENTER_THEMES.zeus;

    M.wallBase.color.setHex(nextTheme.wallBase);
    M.wallBright.color.setHex(nextTheme.wallBright);
    M.trim.color.setHex(nextTheme.trimHex);
    M.gold.color.setHex(nextTheme.goldHex);
    M.flame.color.setHex(nextTheme.flameHex);
    M.divineGlow.emissive.setHex(nextTheme.glowHex);
    auraRing.material.color.setHex(nextTheme.glowHex);

    if (M.roof.map) M.roof.map.dispose();
    M.roof.map = createRoofTexture(nextTheme);
    M.roof.needsUpdate = true;

    M.emblems.forEach(e => {
      e.zeus.visible = (nextGod === 'zeus');
      e.poseidon.visible = (nextGod === 'poseidon');
      e.hades.visible = (nextGod === 'hades');
    });

    M.godDecors.forEach(d => {
      d.zeusDeco.visible = (nextGod === 'zeus');
      d.poseidonDeco.visible = (nextGod === 'poseidon');
      d.hadesDeco.visible = (nextGod === 'hades');
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
