import * as THREE from 'three';

/* ==========================================================================
   1. TEMAS VISUAIS DAS 4 DIVINDADES NÓRDICAS (ODIN, THOR, LOKI, FREYR)
   ========================================================================== */
export type NorseTownCenterGodKey = 'odin' | 'thor' | 'loki' | 'freyr';

export interface NorseTownCenterTheme {
  id: NorseTownCenterGodKey;
  godName: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  wallBase: number;
  wallBright: number;
  logDark: number;
  trimHex: number;
  goldHex: number;
  roofA: string;
  roofB: string;
  roofPatina: string;
  flameHex: number;
  glowHex: number;
  particleHex: number;
  groundGrass: string;
  groundDirt: string;
}

export const NORSE_TOWN_CENTER_THEMES: Record<NorseTownCenterGodKey, NorseTownCenterTheme> = {
  odin: {
    id: 'odin',
    godName: 'Odin',
    bgHex: 0x091526,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    wallBase: 0x9c7448,
    wallBright: 0xb88b54,
    logDark: 0x452b14,
    trimHex: 0x1e3a8a,
    goldHex: 0xfacc15,
    roofA: '#c49d59',
    roofB: '#7a5a2e',
    roofPatina: '#473318',
    flameHex: 0x38bdf8,
    glowHex: 0x38bdf8,
    particleHex: 0xbae6fd,
    groundGrass: '#48732a',
    groundDirt: '#a8926e'
  },
  thor: {
    id: 'thor',
    godName: 'Thor',
    bgHex: 0x1b0b09,
    hemiSky: 0xfef3c7,
    hemiGround: 0x7f1d1d,
    rimHex: 0xef4444,
    wallBase: 0x855336,
    wallBright: 0xa16643,
    logDark: 0x3b1608,
    trimHex: 0xb91c1c,
    goldHex: 0xf59e0b,
    roofA: '#9c6644',
    roofB: '#523421',
    roofPatina: '#2e1a0f',
    flameHex: 0xf59e0b,
    glowHex: 0xef4444,
    particleHex: 0xfef08a,
    groundGrass: '#4e6e29',
    groundDirt: '#9e825e'
  },
  loki: {
    id: 'loki',
    godName: 'Loki',
    bgHex: 0x051410,
    hemiSky: 0xd1fae5,
    hemiGround: 0x064e3b,
    rimHex: 0x10b981,
    wallBase: 0x695c4c,
    wallBright: 0x827360,
    logDark: 0x29231c,
    trimHex: 0x065f46,
    goldHex: 0xd97706,
    roofA: '#7d775c',
    roofB: '#454334',
    roofPatina: '#24241b',
    flameHex: 0x10b981,
    glowHex: 0x10b981,
    particleHex: 0x6ee7b7,
    groundGrass: '#3b6329',
    groundDirt: '#8c7d65'
  },
  freyr: {
    id: 'freyr',
    godName: 'Freyr',
    bgHex: 0x121808,
    hemiSky: 0xfef9c3,
    hemiGround: 0x3f6212,
    rimHex: 0xfacc15,
    wallBase: 0xb58e52,
    wallBright: 0xd4aa68,
    logDark: 0x573c18,
    trimHex: 0x65a30d,
    goldHex: 0xfacc15,
    roofA: '#d9b86c',
    roofB: '#8f7236',
    roofPatina: '#54411c',
    flameHex: 0xfacc15,
    glowHex: 0xa3e635,
    particleHex: 0xfef08a,
    groundGrass: '#588027',
    groundDirt: '#b89f6e'
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS COM CACHE (TÁBUAS DE CARVALHO E TELHAS DE MADEIRA)
   ========================================================================== */
const ntcTexCache = new Map<string, THREE.CanvasTexture>();

function createNorsePlankTexture(isBright = false): THREE.CanvasTexture {
  const key = `ntc_plank_${isBright ? 'bright' : 'base'}`;
  if (ntcTexCache.has(key)) return ntcTexCache.get(key)!;
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = isBright ? '#c49a68' : '#9c7344';
  ctx.fillRect(0, 0, 512, 512);

  const planks = 16;
  const pW = 512 / planks;
  for (let i = 0; i < planks; i++) {
    const x = i * pW;
    const base = isBright ? 195 : 155;
    const delta = Math.floor((Math.random() - 0.5) * 28);
    ctx.fillStyle = `rgb(${base + delta}, ${Math.floor((base + delta) * 0.74)}, ${Math.floor((base + delta) * 0.45)})`;
    ctx.fillRect(x + 1, 0, pW - 2, 512);
    ctx.strokeStyle = 'rgba(26, 15, 7, 0.52)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  for (const y of [46, 256, 466]) {
    ctx.fillStyle = 'rgba(40, 22, 10, 0.52)';
    ctx.fillRect(0, y - 12, 512, 24);
    ctx.fillStyle = 'rgba(20, 20, 24, 0.65)';
    for (let rx = 16; rx < 512; rx += 32) {
      ctx.beginPath();
      ctx.arc(rx, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  ntcTexCache.set(key, tex);
  return tex;
}

function createShingleRoofTexture(theme: NorseTownCenterTheme): THREE.CanvasTexture {
  const key = `ntc_roof_${theme.id}`;
  if (ntcTexCache.has(key)) return ntcTexCache.get(key)!;
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = theme.roofB;
  ctx.fillRect(0, 0, 512, 512);

  const rows = 14;
  const cols = 12;
  const rH = 512 / rows;
  const cW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rH;
    const off = (r % 2 === 0) ? 0 : cW * 0.5;
    for (let c = -1; c <= cols; c++) {
      const x = c * cW + off;
      const grad = ctx.createLinearGradient(0, y, 0, y + rH);
      grad.addColorStop(0, theme.roofA);
      grad.addColorStop(0.7, theme.roofB);
      grad.addColorStop(1, theme.roofPatina);
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 1, cW - 4, rH - 2);
      ctx.strokeStyle = 'rgba(18, 10, 4, 0.58)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, cW - 2, rH - 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  ntcTexCache.set(key, tex);
  return tex;
}

/* ==========================================================================
   3. HELPERS DE GEOMETRIA NÓRDICA
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

export interface NorseTownCenterMaterials {
  wallBase: THREE.MeshStandardMaterial;
  wallBright: THREE.MeshStandardMaterial;
  logDark: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  iron: THREE.MeshStandardMaterial;
  obsidian: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  divineGlow: THREE.MeshStandardMaterial;
  flames: THREE.Mesh[];
  emblems: Array<{ odin: THREE.Group; thor: THREE.Group; loki: THREE.Group; freyr: THREE.Group }>;
  godAltars: Array<{ odinAlt: THREE.Group; thorAlt: THREE.Group; lokiAlt: THREE.Group; freyrAlt: THREE.Group }>;
}

export function createNorseTownCenterMaterials(theme: NorseTownCenterTheme): NorseTownCenterMaterials {
  return {
    wallBase: new THREE.MeshStandardMaterial({
      map: createNorsePlankTexture(false),
      color: theme.wallBase,
      roughness: 0.72,
      metalness: 0.06
    }),
    wallBright: new THREE.MeshStandardMaterial({
      map: createNorsePlankTexture(true),
      color: theme.wallBright,
      roughness: 0.58,
      metalness: 0.12
    }),
    logDark: new THREE.MeshStandardMaterial({
      color: theme.logDark,
      roughness: 0.78
    }),
    stone: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.84
    }),
    trim: new THREE.MeshStandardMaterial({
      color: theme.trimHex,
      roughness: 0.40,
      metalness: 0.28
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.25,
      metalness: 0.90,
      roughness: 0.20
    }),
    roof: new THREE.MeshStandardMaterial({
      map: createShingleRoofTexture(theme),
      roughness: 0.58,
      metalness: 0.14,
      side: THREE.DoubleSide
    }),
    iron: new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.80,
      roughness: 0.34
    }),
    obsidian: new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.40,
      roughness: 0.32
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
    godAltars: []
  };
}

function createDivineEmblem(
  parent: THREE.Object3D,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  trimMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  emblemRegistry: Array<{ odin: THREE.Group; thor: THREE.Group; loki: THREE.Group; freyr: THREE.Group }> | null = null
): THREE.Group {
  const root = grp(parent, pos[0], pos[1], pos[2]);
  root.scale.setScalar(scale);

  cyl(root, 0.25, 0.25, 0.04, 20, trimMat, [0, 0, -0.01], [Math.PI / 2, 0, 0]);
  const borderRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 8, 24), goldMat);
  root.add(borderRing);

  // 1. 🐺 ODIN: Valknut
  const odin = grp(root);
  for (let i = 0; i < 3; i++) {
    const rotZ = (i / 3) * Math.PI * 2;
    const ox = Math.sin(rotZ) * 0.06;
    const oy = Math.cos(rotZ) * 0.06;
    const triRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 6, 3), glowMat);
    triRing.position.set(ox, oy, 0.02);
    triRing.rotation.z = rotZ;
    odin.add(triRing);
  }

  // 2. 🔨 THOR: Martelo Sagrado Mjölnir
  const thor = grp(root);
  box(thor, 0.22, 0.11, 0.045, glowMat, [0, 0.07, 0.02]);
  box(thor, 0.24, 0.04, 0.05, goldMat, [0, 0.07, 0.025]);
  cyl(thor, 0.022, 0.026, 0.26, 8, goldMat, [0, -0.05, 0.02]);
  thor.visible = false;

  // 3. 🐍 LOKI: Serpente do Mundo Jörmungandr
  const loki = grp(root);
  const serpentRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.026, 10, 24, Math.PI * 1.72), glowMat);
  serpentRing.position.set(0, 0, 0.02);
  loki.add(serpentRing);
  const sHead = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.10, 6), goldMat);
  sHead.position.set(0.11, 0.09, 0.025);
  sHead.rotation.z = -0.7;
  loki.add(sHead);
  loki.visible = false;

  // 4. 🌾 FREYR: Javali Dourado Gullinbursti & Sol
  const freyr = grp(root);
  const sunCore = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), glowMat);
  sunCore.position.set(0, 0, 0.02);
  freyr.add(sunCore);
  for (let r = 0; r < 8; r++) {
    const ra = (r / 8) * Math.PI * 2;
    box(
      freyr,
      0.025,
      0.12,
      0.02,
      goldMat,
      [Math.cos(ra) * 0.14, Math.sin(ra) * 0.14, 0.02],
      [0, 0, ra + Math.PI / 2]
    );
  }
  freyr.visible = false;

  if (emblemRegistry) emblemRegistry.push({ odin, thor, loki, freyr });
  return root;
}

function buildVikingShield(
  parent: THREE.Object3D,
  goldMat: THREE.Material,
  trimMat: THREE.Material,
  woodMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  radius = 0.20
): THREE.Group {
  const sh = grp(parent, pos[0], pos[1], pos[2]);
  sh.rotation.set(rot[0], rot[1], rot[2]);
  cyl(sh, radius, radius, 0.028, 18, trimMat, [0, 0, 0], [Math.PI / 2, 0, 0]);
  cyl(sh, radius * 0.62, radius * 0.62, 0.032, 18, woodMat, [0, 0, 0], [Math.PI / 2, 0, 0]);
  cyl(sh, radius * 1.05, radius * 1.05, 0.018, 18, goldMat, [0, 0, -0.004], [Math.PI / 2, 0, 0]);
  const umbo = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.24, 10, 10), goldMat);
  umbo.position.set(0, 0, 0.015);
  sh.add(umbo);
  return sh;
}

function buildNorseGableRoof(
  parent: THREE.Object3D,
  w: number,
  d: number,
  h: number,
  roofMat: THREE.Material,
  wallMat: THREE.Material,
  logMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  yBase: number,
  emblemRegistry: Array<{ odin: THREE.Group; thor: THREE.Group; loki: THREE.Group; freyr: THREE.Group }> | null,
  hasDragon = true,
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
  box(rGrp, slopeLen + 0.14, 0.08, length + 0.18, roofMat, [-rx * 0.5, h * 0.5, 0], [0, 0, slopeAng]);
  box(rGrp, slopeLen + 0.14, 0.08, length + 0.18, roofMat, [rx * 0.5, h * 0.5, 0], [0, 0, -slopeAng]);

  box(rGrp, 0.13, 0.10, length + 0.22, trimMat, [0, h + 0.04, 0]);

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

  if (hasDragon) {
    for (const sz of [-1, 1]) {
      const fin = grp(rGrp, 0, h + 0.05, sz * (rz + 0.06));
      box(fin, 0.09, 0.12, 0.26, logMat, [0, 0.16, sz * 0.10], [sz * 0.45, 0, 0]);
      box(fin, 0.10, 0.09, 0.20, goldMat, [0, 0.28, sz * 0.22], [sz * 0.15, 0, 0]);
      for (const sx of [-1, 1]) {
        box(fin, 0.07, 0.36, 0.07, logMat, [sx * 0.07, 0.12, 0], [0, 0, sx * -0.45]);
        box(fin, 0.09, 0.10, 0.09, goldMat, [sx * 0.15, 0.28, 0], [0, 0, sx * -0.45]);
      }
    }
  }

  if (emblemRegistry) {
    createDivineEmblem(rGrp, goldMat, glowMat, trimMat, [0, h * 0.38, rz + 0.03], h * 1.12, emblemRegistry);
  }
  return rGrp;
}

function buildBrazier(
  parent: THREE.Object3D,
  stoneMat: THREE.Material,
  goldMat: THREE.Material,
  flameMat: THREE.Material,
  flameRegistry: THREE.Mesh[] | null,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const b = grp(parent, pos[0], pos[1], pos[2]);
  b.scale.setScalar(scale);
  cyl(b, 0.16, 0.20, 0.10, 10, stoneMat, [0, 0.05, 0]);
  cyl(b, 0.06, 0.08, 0.28, 10, stoneMat, [0, 0.22, 0]);
  cyl(b, 0.22, 0.12, 0.14, 12, goldMat, [0, 0.42, 0]);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.36, 10), flameMat);
  flame.position.set(0, 0.62, 0);
  b.add(flame);
  if (flameRegistry) flameRegistry.push(flame);
  return b;
}

function buildRunestone(
  parent: THREE.Object3D,
  stoneMat: THREE.Material,
  glowMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const rs = grp(parent, pos[0], pos[1], pos[2]);
  rs.scale.setScalar(scale);

  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.30, 0), stoneMat);
  rock.position.set(0, 0.44, 0);
  rock.scale.set(0.85, 1.60, 0.44);
  rock.castShadow = true;
  rock.receiveShadow = true;
  rs.add(rock);

  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.014, 8, 24, Math.PI), glowMat);
  arch.position.set(0, 0.52, 0.12);
  rs.add(arch);

  box(rs, 0.02, 0.38, 0.02, glowMat, [0, 0.44, 0.125]);
  box(rs, 0.018, 0.14, 0.018, glowMat, [0.045, 0.52, 0.125], [0, 0, -0.55]);
  box(rs, 0.018, 0.14, 0.018, glowMat, [-0.045, 0.44, 0.125], [0, 0, 0.55]);

  cyl(rs, 0.32, 0.36, 0.10, 8, stoneMat, [0, 0.05, 0]);
  cyl(rs, 0.33, 0.33, 0.03, 8, goldMat, [0, 0.10, 0]);
  return rs;
}

function buildGuardianMonument(
  parent: THREE.Object3D,
  M: NorseTownCenterMaterials,
  tier: number,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  scale = 1.0
): THREE.Group {
  const ped = grp(parent, pos[0], pos[1], pos[2]);
  ped.rotation.y = rotY;
  ped.scale.setScalar(scale);

  const trimM = tier >= 4 ? M.gold : M.trim;
  box(ped, 0.94, 0.15, 0.94, M.stone, [0, 0.075, 0]);
  box(ped, 0.80, 0.50, 0.80, M.logDark, [0, 0.40, 0]);
  box(ped, 0.86, 0.09, 0.86, trimM, [0, 0.69, 0]);
  box(ped, 0.38, 0.28, 0.82, M.gold, [0, 0.40, 0]);

  const statMat = tier >= 4 ? M.gold : M.wallBright;
  const fig = grp(ped, 0, 0.74, 0);
  box(fig, 0.15, 0.54, 0.16, statMat, [-0.11, 0.27, 0]);
  box(fig, 0.15, 0.54, 0.16, statMat, [0.11, 0.27, 0]);
  box(fig, 0.44, 0.48, 0.26, statMat, [0, 0.74, 0]);
  box(fig, 0.46, 0.10, 0.28, trimM, [0, 0.56, 0]);

  if (tier >= 2) {
    box(fig, 0.40, 0.78, 0.06, M.trim, [0, 0.68, -0.15], [0.12, 0, 0]);
  }

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), statMat);
  head.position.set(0, 1.12, 0.02);
  fig.add(head);
  box(fig, 0.18, 0.22, 0.12, statMat, [0, 0.98, 0.11]);
  cyl(fig, 0.145, 0.145, 0.06, 14, trimM, [0, 1.20, 0.02]);
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.28, 6), M.gold);
    horn.position.set(side * 0.18, 1.32, 0.02);
    horn.rotation.set(0.1, 0, side * -0.45);
    fig.add(horn);
  }

  box(fig, 0.12, 0.36, 0.12, statMat, [0.24, 0.82, 0.12], [-0.45, 0, -0.25]);
  box(fig, 0.12, 0.36, 0.12, statMat, [-0.24, 0.82, 0.12], [-0.45, 0, 0.25]);
  cyl(fig, 0.022, 0.022, 1.55, 8, M.gold, [0, 0.82, 0.24]);
  box(fig, 0.26, 0.16, 0.08, M.gold, [0, 1.48, 0.24]);
  createDivineEmblem(fig, M.gold, M.divineGlow, M.trim, [0, 1.82, 0.24], 0.62, M.emblems);

  return ped;
}

function buildExclusiveGodAltar(
  parent: THREE.Object3D,
  M: NorseTownCenterMaterials,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const wrap = grp(parent, pos[0], pos[1], pos[2]);
  wrap.scale.setScalar(scale);

  cyl(wrap, 0.42, 0.48, 0.18, 8, M.stone, [0, 0.09, 0]);
  cyl(wrap, 0.44, 0.44, 0.06, 8, M.trim, [0, 0.20, 0]);
  cyl(wrap, 0.43, 0.43, 0.04, 8, M.gold, [0, 0.25, 0]);

  // 1. 🐺 ODIN: Lança Gungnir + Valknut + Corvos
  const odinAlt = grp(wrap);
  cyl(odinAlt, 0.032, 0.042, 1.45, 10, M.gold, [0, 0.98, 0]);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.28, 4), M.divineGlow);
  tip.position.set(0, 1.80, 0);
  odinAlt.add(tip);
  box(odinAlt, 0.72, 0.055, 0.055, M.logDark, [0, 1.32, 0]);
  for (const sx of [-0.30, 0.30]) {
    const raven = grp(odinAlt, sx, 1.40, 0);
    box(raven, 0.08, 0.14, 0.16, M.obsidian, [0, 0, 0], [0.3, 0, 0]);
    const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), M.obsidian);
    rHead.position.set(0, 0.09, 0.06);
    raven.add(rHead);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.06, 4), M.gold);
    beak.position.set(0, 0.09, 0.11);
    beak.rotation.x = Math.PI / 2;
    raven.add(beak);
  }
  const odinEmb = createDivineEmblem(odinAlt, M.gold, M.divineGlow, M.trim, [0, 0.86, 0.06], 0.92);
  odinEmb.children[2].visible = true;

  // 2. 🔨 THOR: Bigorna Sagrada + Martelo Mjölnir + Chifres
  const thorAlt = grp(wrap);
  box(thorAlt, 0.48, 0.26, 0.28, M.iron, [0, 0.40, 0]);
  const hammer = grp(thorAlt, 0, 0.92, 0);
  hammer.rotation.z = 0.20;
  cyl(hammer, 0.04, 0.045, 0.88, 10, M.logDark, [0, 0.15, 0]);
  box(hammer, 0.50, 0.26, 0.26, M.gold, [0, 0.48, 0]);
  box(hammer, 0.52, 0.11, 0.28, M.divineGlow, [0, 0.48, 0]);
  for (const sx of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.36, 6), M.gold);
    horn.position.set(sx * 0.28, 0.62, 0);
    horn.rotation.z = sx * -0.55;
    thorAlt.add(horn);
  }
  thorAlt.visible = false;

  // 3. 🐍 LOKI: Totem Serpente em Espiral + Orbe
  const lokiAlt = grp(wrap);
  cyl(lokiAlt, 0.07, 0.09, 1.35, 10, M.logDark, [0, 0.95, 0]);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 3.5;
    const sy = 0.38 + (i / 14) * 1.15;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), i % 2 === 0 ? M.trim : M.gold);
    seg.position.set(Math.cos(a) * 0.13, sy, Math.sin(a) * 0.13);
    lokiAlt.add(seg);
  }
  box(lokiAlt, 0.16, 0.12, 0.24, M.gold, [0, 1.62, 0.06], [0.2, 0, 0]);
  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), M.divineGlow);
  orb.position.set(0, 1.82, 0);
  lokiAlt.add(orb);
  lokiAlt.visible = false;

  // 4. 🌾 FREYR: Altar com Javali Gullinbursti & Halo Solar
  const freyrAlt = grp(wrap);
  cyl(freyrAlt, 0.08, 0.10, 0.92, 10, M.logDark, [0, 0.74, 0]);
  const boar = grp(freyrAlt, 0, 1.34, 0);
  box(boar, 0.22, 0.22, 0.44, M.gold, [0, 0, 0]);
  box(boar, 0.16, 0.16, 0.22, M.gold, [0, -0.02, 0.26], [0.2, 0, 0]);
  for (const sx of [-1, 1]) {
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 6), M.divineGlow);
    tusk.position.set(sx * 0.08, -0.03, 0.35);
    tusk.rotation.set(0.4, 0, sx * -0.5);
    boar.add(tusk);
  }
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.022, 8, 24), M.divineGlow);
  halo.position.set(0, 0.08, -0.15);
  boar.add(halo);
  freyrAlt.visible = false;

  M.godAltars.push({ odinAlt, thorAlt, lokiAlt, freyrAlt });
  return wrap;
}

/* ==========================================================================
   4. CONSTRUTOR ARQUITETÔNICO DO CENTRO DA CIDADE NÓRDICO (T1 A T5)
   ========================================================================== */
export function buildNorseTownCenterStructure(
  parent: THREE.Object3D,
  M: NorseTownCenterMaterials,
  tier: number
): THREE.Group {
  const root = grp(parent);
  const wallM = tier >= 4 ? M.wallBright : M.wallBase;
  const trimM = tier >= 4 ? M.gold : M.trim;
  const courtScale = 1 + (tier - 1) * 0.11;

  // 1. PLATAFORMA EM PEDRA RÚSTICA E TERRA BATIDA
  box(root, 3.90 * courtScale, 0.08, 3.70 * courtScale, M.stone, [0, 0.04, 0]);
  if (tier >= 3) {
    box(root, 4.20 * courtScale, 0.06, 4.00 * courtScale, M.logDark, [0, 0.03, 0]);
    box(root, 4.25 * courtScale, 0.04, 4.05 * courtScale, trimM, [0, 0.08, 0]);
  }

  // 2. FOGUEIRA COMUNAL CENTRAL COM CALDEIRÃO EM TRIPÉ
  const hearth = grp(root, 0.22, 0.08, 0.18);
  if (tier >= 4) {
    cyl(hearth, 0.48, 0.56, 0.14, 12, M.stone, [0, 0.07, 0]);
    cyl(hearth, 0.52, 0.52, 0.05, 12, M.gold, [0, 0.15, 0]);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(
      hearth,
      0.14,
      0.10,
      0.12,
      M.stone,
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
      0.022,
      0.026,
      0.80,
      8,
      M.logDark,
      [Math.cos(a) * 0.20, 0.38 + (tier >= 4 ? 0.12 : 0), Math.sin(a) * 0.20],
      [Math.sin(a) * 0.42, 0, -Math.cos(a) * 0.42]
    );
  }
  cyl(hearth, 0.15, 0.11, 0.16, 14, M.iron, [0, 0.48 + (tier >= 4 ? 0.12 : 0), 0]);

  // 3. GRANDE SALÃO PRINCIPAL (MEAD HALL / LONGHOUSE)
  const mainH = 0.98 + (tier - 1) * 0.14;
  const mainHall = grp(root, -0.35 * courtScale, 0.08, -1.08 * courtScale);
  mainHall.rotation.y = -0.35;
  box(mainHall, 2.15, mainH, 1.25, wallM, [0, mainH * 0.5, 0]);
  box(mainHall, 2.22, 0.12, 1.32, trimM, [0, 0.18, 0]);

  box(mainHall, 0.56, 0.74, 0.08, M.logDark, [0.15, 0.37, 0.64]);
  const postCount = tier >= 3 ? 4 : 2;
  for (let c = 0; c < postCount; c++) {
    const cx = -0.30 + (c / Math.max(1, postCount - 1)) * 0.90;
    cyl(mainHall, 0.055, 0.068, mainH, 10, tier >= 4 ? M.gold : M.logDark, [cx, mainH * 0.5, 0.76]);
  }
  box(mainHall, 1.18, 0.12, 0.34, M.logDark, [0.15, mainH + 0.04, 0.68]);

  if (tier >= 2) {
    for (const sx of [-0.72, -0.45, 0.75]) {
      buildVikingShield(mainHall, M.gold, M.trim, M.logDark, [sx, 0.62, 0.66], [0, 0, 0], 0.18);
    }
  }

  box(mainHall, 0.78, 0.07, 0.90, M.roof, [-1.32, 0.84, 0.05], [0, 0, 0.25]);
  for (const sx of [-1.56, -1.06]) {
    for (const sz of [-0.28, 0.38]) {
      cyl(mainHall, 0.048, 0.058, 0.82, 8, M.logDark, [sx, 0.41, sz]);
    }
  }
  cyl(mainHall, 0.14, 0.12, 0.28, 12, M.logDark, [-1.22, 0.14, 0.34]);

  if (tier >= 2) {
    const upperH = 0.48 + (tier - 2) * 0.08;
    box(mainHall, 1.62, upperH, 0.92, wallM, [0.10, mainH + upperH * 0.5, -0.04]);
    box(mainHall, 1.68, 0.09, 0.98, trimM, [0.10, mainH + 0.05, -0.04]);
    buildNorseGableRoof(
      mainHall,
      1.76,
      1.06,
      0.42,
      M.roof,
      wallM,
      M.logDark,
      trimM,
      M.gold,
      M.divineGlow,
      mainH + upperH,
      M.emblems,
      true,
      false
    );
  } else {
    buildNorseGableRoof(
      mainHall,
      2.26,
      1.38,
      0.48,
      M.roof,
      wallM,
      M.logDark,
      trimM,
      M.gold,
      M.divineGlow,
      mainH,
      M.emblems,
      true,
      false
    );
  }

  // 4. SALÃO SECUNDÁRIO / CASA DO CONSELHO DOS CLÃS
  const subH = 0.82 + (tier - 1) * 0.08;
  const subHall = grp(root, -0.35 * courtScale, 0.08, 1.18 * courtScale);
  subHall.rotation.y = 0.48;
  box(subHall, 1.66, subH, 1.00, wallM, [0, subH * 0.5, 0]);
  box(subHall, 1.72, 0.10, 1.06, trimM, [0, 0.16, 0]);
  if (tier >= 3) {
    for (const sx of [-0.55, 0, 0.55]) {
      cyl(subHall, 0.05, 0.06, subH, 8, M.logDark, [sx, subH * 0.5, 0.58]);
    }
  }
  if (tier >= 5) {
    for (const sx of [-0.45, 0, 0.45]) {
      buildVikingShield(subHall, M.gold, M.trim, M.logDark, [sx, subH * 0.65, 0.53], [0, 0, 0], 0.16);
    }
  }
  buildNorseGableRoof(
    subHall,
    1.80,
    1.14,
    0.40,
    M.roof,
    wallM,
    M.logDark,
    trimM,
    M.gold,
    M.divineGlow,
    subH,
    tier >= 2 ? M.emblems : null,
    true,
    false
  );

  // 5. SILO CIRCULAR DE PROVISÕES
  const silo = grp(root, 1.58 * courtScale, 0.08, -0.15);
  const siloR = 0.46 + (tier - 1) * 0.04;
  const siloH = 1.02 + (tier - 1) * 0.12;
  cyl(silo, siloR, siloR + 0.02, siloH, 16, wallM, [0, siloH * 0.5, 0]);
  cyl(silo, siloR + 0.03, siloR + 0.03, 0.08, 16, trimM, [0, 0.16, 0]);
  cyl(silo, siloR + 0.03, siloR + 0.03, 0.07, 16, M.gold, [0, siloH - 0.08, 0]);
  if (tier >= 4) {
    for (let c = 0; c < 8; c++) {
      const ca = (c / 8) * Math.PI * 2;
      cyl(
        silo,
        0.045,
        0.055,
        siloH,
        8,
        M.gold,
        [Math.cos(ca) * (siloR + 0.10), siloH * 0.5, Math.sin(ca) * (siloR + 0.10)]
      );
    }
  }
  cyl(silo, 0.08, siloR + 0.15, 0.38, 16, tier >= 4 ? M.gold : M.roof, [0, siloH + 0.19, 0]);
  createDivineEmblem(silo, M.gold, M.divineGlow, trimM, [0, siloH + 0.55, 0], 0.72, M.emblems);

  // 6. POÇO COMUNITÁRIO COBERTO
  const well = grp(root, 0.80 * courtScale, 0.08, -0.84 * courtScale);
  cyl(well, 0.24, 0.26, 0.30, 12, M.stone, [0, 0.15, 0]);
  cyl(well, 0.19, 0.19, 0.04, 12, M.water, [0, 0.29, 0]);
  box(well, 0.045, 0.48, 0.045, M.logDark, [-0.22, 0.38, 0]);
  box(well, 0.045, 0.48, 0.045, M.logDark, [0.22, 0.38, 0]);
  if (tier >= 2) {
    buildNorseGableRoof(
      well,
      0.58,
      0.46,
      0.22,
      M.roof,
      wallM,
      M.logDark,
      trimM,
      M.gold,
      M.divineGlow,
      0.60,
      null,
      false,
      true
    );
  } else {
    box(well, 0.52, 0.04, 0.04, M.logDark, [0, 0.58, 0]);
  }

  // 7. PALIÇADA PERIMETRAL, PORTÕES E TORRES DE VIGIA COM PROAS DRAKKAR
  const fenceGroup = grp(root, 0, 0.08, 0);
  const radX = 2.24 * courtScale;
  const radZ = 2.06 * courtScale;
  if (tier >= 3) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      if ((a > 0.52 && a < 1.18) || (a > 2.22 && a < 2.88)) continue;
      const rx = Math.cos(a) * radX;
      const rz = Math.sin(a) * radZ;
      box(
        fenceGroup,
        0.36,
        0.48 + (tier - 3) * 0.10,
        0.14,
        wallM,
        [rx, 0.24, rz],
        [0, -a + Math.PI / 2, 0]
      );
      box(
        fenceGroup,
        0.38,
        0.06,
        0.16,
        trimM,
        [rx, 0.50 + (tier - 3) * 0.10, rz],
        [0, -a + Math.PI / 2, 0]
      );
    }
  } else {
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      if ((a > 0.55 && a < 1.15) || (a > 2.25 && a < 2.85)) continue;
      cyl(fenceGroup, 0.032, 0.038, 0.46, 6, M.logDark, [Math.cos(a) * radX, 0.23, Math.sin(a) * radZ]);
    }
  }

  for (const [gx, gz, rotY] of [
    [-1.38 * courtScale, 1.42 * courtScale, 0.65],
    [1.32 * courtScale, 1.42 * courtScale, -0.65]
  ]) {
    const gate = grp(fenceGroup, gx, 0, gz);
    gate.rotation.y = rotY;
    box(gate, 0.18, 0.86 + tier * 0.05, 0.18, M.logDark, [-0.45, 0.43, 0]);
    box(gate, 0.18, 0.86 + tier * 0.05, 0.18, M.logDark, [0.45, 0.43, 0]);
    box(gate, 1.16, 0.14, 0.22, M.logDark, [0, 0.90 + tier * 0.05, 0]);
    box(gate, 1.20, 0.06, 0.24, trimM, [0, 0.99 + tier * 0.05, 0]);
    if (tier >= 3) {
      createDivineEmblem(gate, M.gold, M.divineGlow, trimM, [0, 1.26 + tier * 0.05, 0], 0.58, M.emblems);
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
    const tH = 1.48 + (tier - 3) * 0.25;
    towerCoords.forEach(([tx, tz]) => {
      const tw = grp(fenceGroup, tx, 0, tz);
      box(tw, 0.70, tH, 0.70, wallM, [0, tH * 0.5, 0]);
      box(tw, 0.76, 0.10, 0.76, trimM, [0, tH + 0.05, 0]);
      cyl(tw, 0.04, 0.54, 0.44, 4, tier >= 5 ? M.gold : M.roof, [0, tH + 0.32, 0], [0, Math.PI / 4, 0]);
      createDivineEmblem(tw, M.gold, M.divineGlow, trimM, [0, tH + 0.70, 0], 0.56, M.emblems);
    });
  }

  // 8. ESTÁTUAS GUARDIÃS VIKINGS ESCULPIDAS
  buildGuardianMonument(root, M, tier, [-1.84 * courtScale, 0.08, -0.05], 0.55, 1.0 + (tier - 1) * 0.06);
  if (tier >= 3) {
    buildGuardianMonument(root, M, tier, [1.84 * courtScale, 0.08, 0.85], -0.55, 1.0 + (tier - 1) * 0.06);
  }

  // 9. BRASEIROS VIKINGS (T2+) E PEDRAS RÚNICAS (T3+)
  if (tier >= 2) {
    buildBrazier(root, M.stone, M.gold, M.flame, M.flames, [-0.68 * courtScale, 0.08, 1.72 * courtScale], 0.85 + tier * 0.06);
    buildBrazier(root, M.stone, M.gold, M.flame, M.flames, [0.76 * courtScale, 0.08, 1.70 * courtScale], 0.85 + tier * 0.06);
  }
  if (tier >= 3) {
    buildRunestone(root, M.stone, M.divineGlow, M.gold, [-1.52 * courtScale, 0.08, 1.05 * courtScale], 0.85 + (tier - 3) * 0.08);
    if (tier >= 4) {
      buildRunestone(root, M.stone, M.divineGlow, M.gold, [1.48 * courtScale, 0.08, 1.05 * courtScale], 0.85 + (tier - 3) * 0.08);
    }
  }

  // 10. ALTAR / TOTEM SUPREMO EXCLUSIVO DO DEUS (T4 & T5)
  if (tier >= 4) {
    buildExclusiveGodAltar(root, M, [0.02 * courtScale, 0.08, 1.56 * courtScale], tier === 5 ? 1.05 : 0.86);
  }

  return root;
}

/* ==========================================================================
   5. CONSTRUTOR PROCEDURAL PARA O ENGINE DO JOGO
   ========================================================================== */
export interface NorseTownCenterBuildResult {
  group: THREE.Group;
  materials: NorseTownCenterMaterials;
  flames: THREE.Mesh[];
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function buildProceduralNorseTownCenter(
  targetGroup: THREE.Group,
  age: number = 1,
  godKey: string = 'odin',
  enableShadows = true
): NorseTownCenterBuildResult {
  const normGod: NorseTownCenterGodKey = godKey.toLowerCase().includes('thor')
    ? 'thor'
    : godKey.toLowerCase().includes('loki')
    ? 'loki'
    : godKey.toLowerCase().includes('freyr')
    ? 'freyr'
    : 'odin';
  const theme = NORSE_TOWN_CENTER_THEMES[normGod] || NORSE_TOWN_CENTER_THEMES.odin;
  const materials = createNorseTownCenterMaterials(theme);

  const tier = Math.max(1, Math.min(5, Math.round(age)));
  const tcMesh = buildNorseTownCenterStructure(targetGroup, materials, tier);

  materials.emblems.forEach(e => {
    e.odin.visible = (normGod === 'odin');
    e.thor.visible = (normGod === 'thor');
    e.loki.visible = (normGod === 'loki');
    e.freyr.visible = (normGod === 'freyr');
  });

  materials.godAltars.forEach(a => {
    a.odinAlt.visible = (normGod === 'odin');
    a.thorAlt.visible = (normGod === 'thor');
    a.lokiAlt.visible = (normGod === 'loki');
    a.freyrAlt.visible = (normGod === 'freyr');
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
export function buildNorseTownCenterStudio(godKey: string, initialTier: number, _isPbr = true) {
  const normGod: NorseTownCenterGodKey = godKey.toLowerCase().includes('thor')
    ? 'thor'
    : godKey.toLowerCase().includes('loki')
    ? 'loki'
    : godKey.toLowerCase().includes('freyr')
    ? 'freyr'
    : 'odin';
  const theme = NORSE_TOWN_CENTER_THEMES[normGod] || NORSE_TOWN_CENTER_THEMES.odin;
  const M = createNorseTownCenterMaterials(theme);

  const root = new THREE.Group();
  const tierHolders: Record<number, THREE.Group> = {};

  for (let t = 1; t <= 5; t++) {
    const holder = new THREE.Group();
    buildNorseTownCenterStructure(holder, M, t);
    root.add(holder);
    tierHolders[t] = holder;
    holder.visible = (t === initialTier);
  }

  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(2.70, 3.05, 64),
    new THREE.MeshBasicMaterial({
      color: theme.glowHex,
      transparent: true,
      opacity: 0.24,
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
    auraRing.material.opacity = 0.18 + currentTier * 0.04;
  }

  function applyGod(newGodKey: string) {
    const nextGod: NorseTownCenterGodKey = newGodKey.toLowerCase().includes('thor')
      ? 'thor'
      : newGodKey.toLowerCase().includes('loki')
      ? 'loki'
      : newGodKey.toLowerCase().includes('freyr')
      ? 'freyr'
      : 'odin';
    const nextTheme = NORSE_TOWN_CENTER_THEMES[nextGod] || NORSE_TOWN_CENTER_THEMES.odin;

    M.wallBase.color.setHex(nextTheme.wallBase);
    M.wallBright.color.setHex(nextTheme.wallBright);
    M.logDark.color.setHex(nextTheme.logDark);
    M.trim.color.setHex(nextTheme.trimHex);
    M.gold.color.setHex(nextTheme.goldHex);
    M.flame.color.setHex(nextTheme.flameHex);
    M.divineGlow.emissive.setHex(nextTheme.glowHex);
    auraRing.material.color.setHex(nextTheme.glowHex);

    if (M.roof.map) M.roof.map.dispose();
    M.roof.map = createShingleRoofTexture(nextTheme);
    M.roof.needsUpdate = true;

    M.emblems.forEach(e => {
      e.odin.visible = (nextGod === 'odin');
      e.thor.visible = (nextGod === 'thor');
      e.loki.visible = (nextGod === 'loki');
      e.freyr.visible = (nextGod === 'freyr');
    });

    M.godAltars.forEach(a => {
      a.odinAlt.visible = (nextGod === 'odin');
      a.thorAlt.visible = (nextGod === 'thor');
      a.lokiAlt.visible = (nextGod === 'loki');
      a.freyrAlt.visible = (nextGod === 'freyr');
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
