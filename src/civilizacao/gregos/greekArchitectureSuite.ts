import * as THREE from 'three';
import { BuildingKind } from '../../game/types';

export type GreekArchGodKey = 'zeus' | 'poseidon' | 'hades';

export type GreekArchBuildingKey =
  | 'barracks'
  | 'stable'
  | 'archery_range'
  | 'siege_works'
  | 'fortress'
  | 'tower'
  | 'farm'
  | 'titan_gate'
  | 'market'
  | 'armory'
  | 'wall'
  | 'gate';

export interface GreekArchGodTheme {
  id: GreekArchGodKey;
  name: string;
  titleSuffix: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  marbleBase: number;
  marbleBright: number;
  trimHex: number;
  trimCss: string;
  goldHex: number;
  roofBase: string;
  roofRib: string;
  roofPatina: string;
  flameHex: number;
  glowHex: number;
  waterHex: number;
  cropHex: number;
  groundGrass: string;
  groundDirt: string;
  blessingDesc: string;
}

export const GREEK_ARCH_THEMES: Record<GreekArchGodKey, GreekArchGodTheme> = {
  zeus: {
    id: 'zeus',
    name: 'Zeus',
    titleSuffix: 'de Zeus',
    bgHex: 0x0f1f38,
    hemiSky: 0xfef9c3,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    marbleBase: 0xe6e1d3,
    marbleBright: 0xf8fafc,
    trimHex: 0x1d4ed8,
    trimCss: '#1d4ed8',
    goldHex: 0xfacc15,
    roofBase: '#8c5332',
    roofRib: '#d97706',
    roofPatina: '#6b4226',
    flameHex: 0xf59e0b,
    glowHex: 0x38bdf8,
    waterHex: 0x38bdf8,
    cropHex: 0xeab308,
    groundGrass: '#52802c',
    groundDirt: '#bfa070',
    blessingDesc: 'Tempestade Olímpica com raios celestiais e aura dourada',
  },
  poseidon: {
    id: 'poseidon',
    name: 'Poseidon',
    titleSuffix: 'de Poseidon',
    bgHex: 0x061f2e,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0c4a6e,
    rimHex: 0x2dd4bf,
    marbleBase: 0xdbeafe,
    marbleBright: 0xf0f9ff,
    trimHex: 0x0d9488,
    trimCss: '#0d9488',
    goldHex: 0xfbbf24,
    roofBase: '#2f6f66',
    roofRib: '#2dd4bf',
    roofPatina: '#115e59',
    flameHex: 0x2dd4bf,
    glowHex: 0x2dd4bf,
    waterHex: 0x06b6d4,
    cropHex: 0x84cc16,
    groundGrass: '#457a49',
    groundDirt: '#c2aa7e',
    blessingDesc: 'Maré Atlante com anéis aquáticos turbulentos e névoa marinha',
  },
  hades: {
    id: 'hades',
    name: 'Hades',
    titleSuffix: 'de Hades',
    bgHex: 0x080510,
    hemiSky: 0xa7f3d0,
    hemiGround: 0x2e1065,
    rimHex: 0x10b981,
    marbleBase: 0x3f3f46,
    marbleBright: 0x52525b,
    trimHex: 0x991b1b,
    trimCss: '#991b1b',
    goldHex: 0xd97706,
    roofBase: '#27272a',
    roofRib: '#dc2626',
    roofPatina: '#450a0a',
    flameHex: 0x10b981,
    glowHex: 0x10b981,
    waterHex: 0x10b981,
    cropHex: 0x65a30d,
    groundGrass: '#2e382b',
    groundDirt: '#4f463f',
    blessingDesc: 'Chamas Esmeraldas do Estige e fendas sombrias do Tártaro',
  },
};

export interface GreekArchBuildingMeta {
  name: string;
  minTier: number;
  focusOffset: [number, number, number];
}

export const GREEK_ARCH_META: Record<GreekArchBuildingKey, GreekArchBuildingMeta> = {
  barracks: { name: 'Quartéis', minTier: 1, focusOffset: [0, 1.3, 1.2] },
  stable: { name: 'Estábulos', minTier: 1, focusOffset: [-0.4, 1.1, 1.1] },
  archery_range: { name: 'Centro de Arquearia', minTier: 1, focusOffset: [0.3, 1.1, 1.3] },
  siege_works: { name: 'Oficina de Cerco', minTier: 3, focusOffset: [0.2, 1.4, 1.1] },
  fortress: { name: 'Arsenal Divino / Fortaleza', minTier: 1, focusOffset: [0, 1.7, 1.4] },
  tower: { name: 'Torre de Vigia', minTier: 1, focusOffset: [0, 2.3, 0.5] },
  farm: { name: 'Fazenda', minTier: 1, focusOffset: [-0.4, 1.1, 0.9] },
  titan_gate: { name: 'Portal do Titã', minTier: 4, focusOffset: [0, 2.2, 0.9] },
  market: { name: 'Mercado', minTier: 3, focusOffset: [0.2, 1.3, 1.2] },
  armory: { name: 'Ferreiro', minTier: 2, focusOffset: [0.2, 1.2, 1.2] },
  wall: { name: 'Muralha Grega', minTier: 1, focusOffset: [0, 1.3, 0.8] },
  gate: { name: 'Muralha & Portão', minTier: 1, focusOffset: [0, 1.4, 0.8] },
};

export interface GreekGatePivotPair {
  leftPivot: THREE.Group;
  rightPivot: THREE.Group;
  currentAngle: number;
}

export interface GreekArchBuildResult {
  root: THREE.Group;
  meta: GreekArchBuildingMeta;
  effectiveTier: number;
  flames: THREE.Object3D[];
  cranes: THREE.Object3D[];
  windmills: THREE.Object3D[];
  portalRings: THREE.Object3D[];
  gates: GreekGatePivotPair[];
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

const GREEK_ARCH_BUILDING_SET = new Set<string>(Object.keys(GREEK_ARCH_META));

export function isGreekArchBuilding(kind: BuildingKind | string): kind is GreekArchBuildingKey {
  return GREEK_ARCH_BUILDING_SET.has(kind);
}

export function resolveGreekArchGod(raw?: string): GreekArchGodKey {
  const s = (raw || 'zeus').toLowerCase();
  if (s.includes('poseidon')) return 'poseidon';
  if (s.includes('hades')) return 'hades';
  return 'zeus';
}

/* ==========================================================================
   PROCEDURAL PBR CANVAS TEXTURES (CACHED PER GOD / VARIANT)
   ========================================================================== */

const texCache = new Map<string, THREE.CanvasTexture>();

function makeCachedCanvasTex(
  key: string,
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  repeat = true
): THREE.CanvasTexture {
  const cached = texCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.userData.shared = true;
  texCache.set(key, tex);
  return tex;
}

function getMarbleTexture(isBright: boolean): THREE.CanvasTexture {
  return makeCachedCanvasTex(isBright ? 'gr_marble_bright' : 'gr_marble_base', 512, (ctx, s) => {
    ctx.fillStyle = isBright ? '#f4f1ea' : '#dcd7ca';
    ctx.fillRect(0, 0, s, s);

    const rows = 12;
    const rH = s / rows;
    const cols = 6;
    const cW = s / cols;
    let seed = isBright ? 7919 : 3571;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let r = 0; r < rows; r++) {
      const y = r * rH;
      const off = r % 2 === 0 ? 0 : cW * 0.5;
      for (let c = -1; c <= cols; c++) {
        const x = c * cW + off;
        const v = isBright ? 236 : 212;
        const d = Math.floor((rand() - 0.5) * 18);
        ctx.fillStyle = `rgb(${v + d}, ${v + d - 4}, ${v + d - 12})`;
        ctx.fillRect(x + 2, y + 2, cW - 4, rH - 4);
        ctx.strokeStyle = 'rgba(35, 33, 30, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, cW - 2, rH - 2);
      }
    }
  });
}

function getTiledRoofTexture(god: GreekArchGodKey): THREE.CanvasTexture {
  const theme = GREEK_ARCH_THEMES[god];
  return makeCachedCanvasTex(`gr_roof_${god}`, 512, (ctx, s) => {
    ctx.fillStyle = theme.roofBase;
    ctx.fillRect(0, 0, s, s);

    const tiles = 24;
    const tW = s / tiles;
    for (let i = 0; i < tiles; i++) {
      const x = i * tW;
      const grad = ctx.createLinearGradient(x, 0, x + tW, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0.34)');
      grad.addColorStop(0.35, theme.roofRib);
      grad.addColorStop(0.75, theme.roofPatina);
      grad.addColorStop(1, 'rgba(0,0,0,0.38)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, tW, s);
    }
    ctx.strokeStyle = 'rgba(15, 15, 15, 0.32)';
    ctx.lineWidth = 2;
    for (let y = 0; y < s; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(s, y);
      ctx.stroke();
    }
  });
}

function getStripedAwningTexture(god: GreekArchGodKey): THREE.CanvasTexture {
  const theme = GREEK_ARCH_THEMES[god];
  return makeCachedCanvasTex(`gr_awning_${god}`, 256, (ctx, s) => {
    const stripes = 12;
    const sW = s / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? theme.trimCss : '#f8fafc';
      ctx.fillRect(i * sW, 0, sW, s);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, s * 0.86, s, s * 0.14);
  }, false);
}

function getTargetTexture(god: GreekArchGodKey): THREE.CanvasTexture {
  const theme = GREEK_ARCH_THEMES[god];
  return makeCachedCanvasTex(`gr_target_${god}`, 256, (ctx, s) => {
    const cx = s / 2;
    const cy = s / 2;
    const rings = [
      { r: 120, c: '#78350f' },
      { r: 106, c: '#f8fafc' },
      { r: 80, c: theme.trimCss },
      { r: 54, c: '#f8fafc' },
      { r: 28, c: '#ef4444' },
    ];
    rings.forEach((ring) => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.fillStyle = ring.c;
      ctx.fill();
    });
  }, false);
}

export function getGreekArchGroundTexture(
  god: GreekArchGodKey,
  isHighTier = false
): THREE.CanvasTexture {
  const theme = GREEK_ARCH_THEMES[god];
  return makeCachedCanvasTex(`gr_ground_${god}_${isHighTier ? 'hi' : 'lo'}`, 512, (ctx, s) => {
    ctx.fillStyle = theme.groundGrass;
    ctx.fillRect(0, 0, s, s);

    let seed = 104729;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 35, 10, 0.14)';
      ctx.fillRect(rand() * s, rand() * s, 6, 6);
    }

    const cx = s / 2;
    const cy = s / 2;
    const dirtGrad = ctx.createRadialGradient(cx, cy, s * 0.17, cx, cy, s * 0.4);
    dirtGrad.addColorStop(0, theme.groundDirt);
    dirtGrad.addColorStop(0.76, theme.groundDirt);
    dirtGrad.addColorStop(1, 'rgba(191, 160, 112, 0)');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, 0, s, s);

    if (isHighTier) {
      ctx.fillStyle = 'rgba(148, 138, 122, 0.52)';
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const r = s * (0.26 + (i % 3) * 0.035);
        ctx.fillRect(cx + Math.cos(a) * r - 10, cy + Math.sin(a) * r - 8, 20, 16);
      }
    }
  }, false);
}

/* ==========================================================================
   ARCHITECTURAL PRIMITIVES & SHARED PROPS
   ========================================================================== */

interface GreekArchMats {
  marbleBase: THREE.MeshStandardMaterial;
  marbleBright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  banner: THREE.Material;
  gold: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  awning: THREE.MeshStandardMaterial;
  target: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  straw: THREE.MeshStandardMaterial;
  metalDark: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  glow: THREE.MeshStandardMaterial;
}

function createGreekArchMaterials(
  god: GreekArchGodKey,
  teamBannerMat?: THREE.Material
): GreekArchMats {
  const theme = GREEK_ARCH_THEMES[god];
  const trim = new THREE.MeshStandardMaterial({
    color: theme.trimHex,
    roughness: 0.36,
    metalness: 0.32,
  });

  return {
    marbleBase: new THREE.MeshStandardMaterial({
      map: getMarbleTexture(false),
      color: theme.marbleBase,
      roughness: 0.62,
      metalness: 0.08,
    }),
    marbleBright: new THREE.MeshStandardMaterial({
      map: getMarbleTexture(true),
      color: theme.marbleBright,
      roughness: 0.48,
      metalness: 0.12,
    }),
    trim,
    banner: teamBannerMat ?? trim,
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.25,
      metalness: 0.88,
      roughness: 0.2,
    }),
    roof: new THREE.MeshStandardMaterial({
      map: getTiledRoofTexture(god),
      roughness: 0.55,
      metalness: 0.16,
      side: THREE.DoubleSide,
    }),
    awning: new THREE.MeshStandardMaterial({
      map: getStripedAwningTexture(god),
      roughness: 0.65,
      side: THREE.DoubleSide,
    }),
    target: new THREE.MeshStandardMaterial({
      map: getTargetTexture(god),
      roughness: 0.6,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x6b3818,
      roughness: 0.72,
    }),
    straw: new THREE.MeshStandardMaterial({
      color: theme.cropHex,
      roughness: 0.85,
    }),
    metalDark: new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.75,
      roughness: 0.35,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x1e4d20,
      roughness: 0.82,
    }),
    water: new THREE.MeshStandardMaterial({
      color: theme.waterHex,
      emissive: theme.waterHex,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.3,
    }),
    flame: new THREE.MeshBasicMaterial({
      color: theme.flameHex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    }),
    glow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.glowHex,
      emissiveIntensity: 2.6,
      roughness: 0.1,
    }),
  };
}

function makeGroup(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function addBox(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  shadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = shadows;
  m.receiveShadow = shadows;
  parent.add(m);
  return m;
}

function addCyl(
  parent: THREE.Object3D,
  rt: number,
  rb: number,
  h: number,
  segs: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  shadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = shadows;
  m.receiveShadow = shadows;
  parent.add(m);
  return m;
}

function buildDivineSymbol3D(
  parent: THREE.Object3D,
  god: GreekArchGodKey,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  pos: [number, number, number],
  scale = 1.0,
  shadows = true
): THREE.Group {
  const symRoot = makeGroup(parent, pos[0], pos[1], pos[2]);
  symRoot.scale.setScalar(scale);

  if (god === 'zeus') {
    addBox(symRoot, 0.08, 0.34, 0.05, glowMat, [-0.04, 0.14, 0], [0, 0, -0.35], shadows);
    addBox(symRoot, 0.14, 0.06, 0.05, goldMat, [0, 0, 0], [0, 0, 0], shadows);
    addCyl(symRoot, 0.005, 0.07, 0.36, 4, glowMat, [0.05, -0.15, 0], [0, 0, Math.PI - 0.35], shadows);
  } else if (god === 'poseidon') {
    addCyl(symRoot, 0.025, 0.025, 0.56, 8, goldMat, [0, -0.06, 0], [0, 0, 0], shadows);
    addBox(symRoot, 0.28, 0.04, 0.04, goldMat, [0, 0.08, 0], [0, 0, 0], shadows);
    addCyl(symRoot, 0.005, 0.045, 0.28, 4, glowMat, [0, 0.24, 0], [0, 0, 0], shadows);
    for (const sx of [-1, 1]) {
      addCyl(symRoot, 0.005, 0.035, 0.22, 4, glowMat, [sx * 0.12, 0.2, 0], [0, 0, sx * -0.08], shadows);
    }
  } else {
    addCyl(symRoot, 0.025, 0.025, 0.46, 8, goldMat, [0, -0.12, 0], [0, 0, 0], shadows);
    addBox(symRoot, 0.24, 0.04, 0.04, goldMat, [0, 0.06, 0], [0, 0, 0], shadows);
    for (const sx of [-1, 1]) {
      addCyl(symRoot, 0.005, 0.042, 0.26, 4, glowMat, [sx * 0.1, 0.2, 0], [0, 0, 0], shadows);
    }
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), glowMat);
    skull.position.set(0, 0.06, 0.03);
    symRoot.add(skull);
  }

  return symRoot;
}

function buildPedimentRoof(
  parent: THREE.Object3D,
  w: number,
  d: number,
  h: number,
  roofMat: THREE.Material,
  wallMat: THREE.Material,
  trimMat: THREE.Material | null,
  yBase: number,
  rotY = 0,
  shadows = true
): THREE.Group {
  const g = makeGroup(parent, 0, yBase, 0);
  g.rotation.y = rotY;
  const rx = w * 0.5;
  const slopeLen = Math.hypot(rx, h);
  const slopeAng = Math.atan2(h, rx);

  addBox(g, slopeLen + 0.1, 0.08, d + 0.14, roofMat, [-rx * 0.5, h * 0.5, 0], [0, 0, slopeAng], shadows);
  addBox(g, slopeLen + 0.1, 0.08, d + 0.14, roofMat, [rx * 0.5, h * 0.5, 0], [0, 0, -slopeAng], shadows);
  addBox(g, 0.12, 0.09, d + 0.18, wallMat, [0, h + 0.03, 0], [0, 0, 0], shadows);

  const tri = new THREE.Shape();
  tri.moveTo(-rx, 0);
  tri.lineTo(rx, 0);
  tri.lineTo(0, h);
  tri.closePath();
  const geo = new THREE.ExtrudeGeometry(tri, { depth: d - 0.02, bevelEnabled: false });
  geo.translate(0, 0, -(d - 0.02) * 0.5);
  const ped = new THREE.Mesh(geo, wallMat);
  ped.castShadow = shadows;
  ped.receiveShadow = shadows;
  g.add(ped);

  if (trimMat) {
    addBox(g, w + 0.06, 0.07, d + 0.06, trimMat, [0, -0.02, 0], [0, 0, 0], shadows);
  }
  return g;
}

function buildBanner(
  parent: THREE.Object3D,
  woodMat: THREE.Material,
  bannerMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number],
  rotY = 0,
  shadows = true
): THREE.Group {
  const b = makeGroup(parent, pos[0], pos[1], pos[2]);
  b.rotation.y = rotY;
  addCyl(b, 0.03, 0.04, 1.65, 8, woodMat, [0, 0.825, 0], [0, 0, 0], shadows);
  addCyl(b, 0.005, 0.05, 0.14, 6, goldMat, [0, 1.7, 0], [0, 0, 0], shadows);
  addBox(b, 0.44, 0.04, 0.04, woodMat, [0.22, 1.52, 0], [0, 0, 0], shadows);
  addBox(b, 0.38, 0.62, 0.02, bannerMat, [0.22, 1.18, 0], [0, 0, 0], shadows);
  addBox(b, 0.14, 0.14, 0.03, goldMat, [0.22, 1.2, 0], [0, 0, Math.PI / 4], shadows);
  return b;
}

function buildBrazier(
  parent: THREE.Object3D,
  goldMat: THREE.Material,
  flameMat: THREE.Material,
  pos: [number, number, number],
  scale: number,
  flames: THREE.Object3D[],
  shadows = true
): THREE.Group {
  const g = makeGroup(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);
  addCyl(g, 0.14, 0.2, 0.09, 10, goldMat, [0, 0.045, 0], [0, 0, 0], shadows);
  addCyl(g, 0.045, 0.06, 0.42, 8, goldMat, [0, 0.28, 0], [0, 0, 0], shadows);
  addCyl(g, 0.24, 0.12, 0.14, 12, goldMat, [0, 0.54, 0], [0, 0, 0], shadows);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 10), flameMat);
  fl.position.set(0, 0.78, 0);
  g.add(fl);
  flames.push(fl);
  return g;
}

function buildBarrel(
  parent: THREE.Object3D,
  woodMat: THREE.Material,
  metalMat: THREE.Material,
  pos: [number, number, number],
  scale = 1.0,
  shadows = true
): THREE.Group {
  const g = makeGroup(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);
  addCyl(g, 0.16, 0.16, 0.42, 12, woodMat, [0, 0.21, 0], [0, 0, 0], shadows);
  addCyl(g, 0.17, 0.17, 0.04, 12, metalMat, [0, 0.11, 0], [0, 0, 0], shadows);
  addCyl(g, 0.17, 0.17, 0.04, 12, metalMat, [0, 0.31, 0], [0, 0, 0], shadows);
  return g;
}

function buildCypress(
  parent: THREE.Object3D,
  woodMat: THREE.Material,
  foliageMat: THREE.Material,
  pos: [number, number, number],
  scale = 1.0,
  shadows = true
): THREE.Group {
  const g = makeGroup(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);
  addCyl(g, 0.04, 0.07, 0.32, 8, woodMat, [0, 0.16, 0], [0, 0, 0], shadows);
  addCyl(g, 0.02, 0.24, 1.45, 10, foliageMat, [0, 0.96, 0], [0, 0, 0], shadows);
  return g;
}

function buildRoundShield(
  parent: THREE.Object3D,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number],
  rot: [number, number, number] = [0, 0, 0],
  radius = 0.26,
  shadows = true
): THREE.Group {
  const g = makeGroup(parent, pos[0], pos[1], pos[2]);
  g.rotation.set(rot[0], rot[1], rot[2]);
  addCyl(g, radius, radius, 0.04, 18, goldMat, [0, 0, 0], [Math.PI / 2, 0, 0], shadows);
  addCyl(g, radius * 0.82, radius * 0.82, 0.045, 18, trimMat, [0, 0, 0.005], [Math.PI / 2, 0, 0], shadows);
  const boss = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.25, 10, 10), goldMat);
  boss.position.z = 0.02;
  g.add(boss);
  return g;
}

/* ==========================================================================
   MAIN BUILDER — ALL 12 GREEK BUILDINGS WITH FULL T1–T5 EVOLUTION
   ========================================================================== */

export function buildGreekArchBuilding(
  kind: GreekArchBuildingKey,
  god: GreekArchGodKey,
  age: number,
  enableShadows = true,
  teamBannerMat?: THREE.Material
): GreekArchBuildResult {
  const meta = GREEK_ARCH_META[kind];
  const t = Math.max(meta.minTier, Math.min(5, Math.round(age)));
  const M = createGreekArchMaterials(god, teamBannerMat);
  const root = new THREE.Group();

  const flames: THREE.Object3D[] = [];
  const cranes: THREE.Object3D[] = [];
  const windmills: THREE.Object3D[] = [];
  const portalRings: THREE.Object3D[] = [];
  const gates: GreekGatePivotPair[] = [];
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  const sh = enableShadows;

  switch (kind) {
    /* 1. QUARTÉIS (BARRACKS) T1–T5 */
    case 'barracks': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;
      addBox(root, 4.8 + t * 0.2, 0.18, 4.4 + t * 0.2, M.marbleBase, [0, 0.09, 0], [0, 0, 0], sh);
      const y0 = 0.18;

      const mainH = 1.25 + t * 0.15;
      addBox(root, 3.6 + t * 0.15, mainH, 1.45, wallMat, [0, y0 + mainH * 0.5, -0.95], [0, 0, 0], sh);
      buildPedimentRoof(root, 3.75 + t * 0.15, 1.58, 0.5, M.roof, wallMat, M.trim, y0 + mainH, 0, sh);

      // Pórtico central de entrada
      addBox(root, 1.15, mainH * 0.85, 0.48, M.marbleBright, [0, y0 + mainH * 0.425, -0.05], [0, 0, 0], sh);
      addBox(root, 0.65, mainH * 0.65, 0.1, t >= 4 ? M.gold : M.wood, [0, y0 + mainH * 0.325, 0.2], [0, 0, 0], sh);
      buildPedimentRoof(root, 1.28, 0.58, 0.34, M.roof, M.marbleBright, M.trim, y0 + mainH * 0.85, 0, sh);

      // Alas laterais em L (T3) e em U (T4+)
      if (t >= 3) {
        addBox(root, 1.05, 1.05, 1.85, wallMat, [-1.45, y0 + 0.525, 0.55], [0, 0, 0], sh);
        buildPedimentRoof(root, 1.18, 1.98, 0.4, M.roof, wallMat, M.trim, y0 + 1.05, 0, sh);
      }
      if (t >= 4) {
        addBox(root, 1.05, 1.05, 1.85, wallMat, [1.45, y0 + 0.525, 0.55], [0, 0, 0], sh);
        buildPedimentRoof(root, 1.18, 1.98, 0.4, M.roof, wallMat, M.trim, y0 + 1.05, 0, sh);
      }

      // Boneco de treino de madeira e escudo hoplita
      addCyl(root, 0.06, 0.08, 1.05, 8, M.wood, [-0.55, y0 + 0.525, 0.95], [0, 0, 0], sh);
      addBox(root, 0.68, 0.08, 0.08, M.wood, [-0.55, y0 + 0.82, 0.95], [0, 0, 0], sh);
      buildRoundShield(root, M.trim, M.gold, [-0.22, y0 + 0.78, 0.98], [0, 0, 0], 0.18, sh);

      buildBanner(root, M.wood, M.banner, M.gold, [-1.35, y0, 1.65], 0, sh);
      buildBanner(root, M.wood, M.banner, M.gold, [1.35, y0, 1.65], 0, sh);

      if (t === 5) {
        buildBrazier(root, M.gold, M.flame, [-0.85, y0, 1.55], 0.95, flames, sh);
        buildBrazier(root, M.gold, M.flame, [0.85, y0, 1.55], 0.95, flames, sh);
        buildDivineSymbol3D(root, god, M.gold, M.glow, [0, y0 + mainH + 0.78, -0.95], 1.05, sh);
      }
      break;
    }

    /* 2. ESTÁBULOS (STABLE) T1–T5 */
    case 'stable': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;
      const colMat = t === 5 ? M.gold : M.wood;

      addBox(root, 4.5 + t * 0.2, 0.16, 4.0 + t * 0.2, M.marbleBase, [0, 0.08, 0], [0, 0, 0], sh);
      const y0 = 0.16;

      const barnH = t >= 3 ? 1.65 : 1.15;
      addBox(root, 3.1 + t * 0.15, barnH, 1.55, wallMat, [0.35, y0 + barnH * 0.5, -0.75], [0, 0, 0], sh);
      buildPedimentRoof(root, 3.25 + t * 0.15, 1.68, 0.48, M.roof, wallMat, M.trim, y0 + barnH, 0, sh);

      // Galeria lateral aberta em L com baias e postes
      const stallH = 0.98;
      const roofSlope = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.07, 1.35), M.roof);
      roofSlope.position.set(0.15, y0 + stallH + 0.12, 0.55);
      roofSlope.rotation.x = 0.22;
      roofSlope.castShadow = sh;
      roofSlope.receiveShadow = sh;
      root.add(roofSlope);

      for (let sx = -1.25; sx <= 1.55; sx += 0.7) {
        addCyl(root, 0.055, 0.065, stallH, 8, colMat, [sx, y0 + stallH * 0.5, 1.12], [0, 0, 0], sh);
        if (sx < 1.5) {
          addBox(root, 0.64, 0.36, 0.05, M.wood, [sx + 0.35, y0 + 0.22, 1.12], [0, 0, 0], sh);
        }
      }

      // Cavalos estilizados dentro das baias
      const numHorses = Math.min(t, 3);
      for (let h = 0; h < numHorses; h++) {
        const hx = -0.9 + h * 0.7;
        const horseMat = h % 2 === 0 ? M.marbleBright : M.wood;
        addBox(root, 0.28, 0.34, 0.62, horseMat, [hx, y0 + 0.52, 0.65], [0, 0, 0], sh);
        addBox(root, 0.14, 0.36, 0.18, horseMat, [hx, y0 + 0.76, 0.92], [0.35, 0, 0], sh);
      }

      // Montes de feno e barris no pátio
      const hay1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), M.straw);
      hay1.scale.set(1.2, 0.65, 1.0);
      hay1.position.set(-0.35, y0 + 0.18, 1.65);
      hay1.castShadow = sh;
      root.add(hay1);

      const hay2 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), M.straw);
      hay2.scale.set(1.1, 0.6, 1.0);
      hay2.position.set(0.22, y0 + 0.14, 1.75);
      hay2.castShadow = sh;
      root.add(hay2);

      buildBarrel(root, M.wood, M.metalDark, [1.85, y0, 0.35], 0.95, sh);
      buildBarrel(root, M.wood, M.metalDark, [2.15, y0, 0.55], 0.85, sh);
      buildBanner(root, M.wood, M.banner, M.gold, [0.75, y0, 1.85], 0, sh);

      if (t >= 4) {
        buildBrazier(root, M.gold, M.flame, [-1.85, y0, 1.55], 0.85, flames, sh);
      }
      if (t === 5) {
        buildDivineSymbol3D(root, god, M.gold, M.glow, [0.35, y0 + barnH + 0.78, -0.75], 1.0, sh);
      }
      break;
    }

    /* 3. CENTRO DE ARQUEARIA (ARCHERY RANGE) T1–T5 */
    case 'archery_range': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;

      addBox(root, 4.6 + t * 0.2, 0.16, 4.1 + t * 0.2, M.marbleBase, [0, 0.08, 0], [0, 0, 0], sh);
      const y0 = 0.16;

      const mainH = 1.15 + t * 0.14;
      addBox(root, 1.65, mainH, 2.85 + t * 0.15, wallMat, [-1.05, y0 + mainH * 0.5, -0.35], [0, 0, 0], sh);
      buildPedimentRoof(root, 1.78, 2.98 + t * 0.15, 0.48, M.roof, wallMat, M.trim, y0 + mainH, 0, sh);

      if (t >= 2) {
        const galW = 2.0 + t * 0.15;
        addBox(root, galW, 0.85, 0.72, wallMat, [0.85, y0 + 0.425, -0.95], [0, 0, 0], sh);
        const galRoof = new THREE.Mesh(new THREE.BoxGeometry(galW + 0.15, 0.07, 0.92), M.roof);
        galRoof.position.set(0.85, y0 + 0.95, -0.88);
        galRoof.rotation.x = 0.24;
        galRoof.castShadow = sh;
        galRoof.receiveShadow = sh;
        root.add(galRoof);

        const shieldsCount = Math.min(t + 1, 5);
        for (let s = 0; s < shieldsCount; s++) {
          const sx = 0.05 + s * 0.44;
          buildRoundShield(root, M.trim, M.gold, [sx, y0 + 0.44, -0.56], [0, 0, 0], 0.2, sh);
        }
      }

      addBox(root, 1.85, 0.05, 0.05, M.wood, [0.35, y0 + 0.32, 0.45], [0, 0, 0], sh);
      addBox(root, 2.15, 0.05, 0.05, M.wood, [0.55, y0 + 0.32, 1.15], [0, 0, 0], sh);

      const numTargets = Math.min(t, 3);
      for (let tg = 0; tg < numTargets; tg++) {
        const tx = 0.15 + tg * 0.72;
        const tz = 1.48 - tg * 0.15;
        addCyl(root, 0.025, 0.03, 0.85, 6, M.wood, [tx, y0 + 0.42, tz - 0.08], [-0.2, 0, 0], sh);
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 20), M.target);
        disc.rotation.set(Math.PI / 2 - 0.18, 0, 0);
        disc.position.set(tx, y0 + 0.46, tz);
        disc.castShadow = sh;
        root.add(disc);
        addCyl(root, 0.008, 0.008, 0.42, 6, M.gold, [tx + 0.04, y0 + 0.48, tz + 0.18], [Math.PI / 2 - 0.15, 0.1, 0], sh);
      }

      buildBanner(root, M.wood, M.banner, M.gold, [-0.25, y0, 1.65], 0, sh);
      if (t === 5) {
        buildBrazier(root, M.gold, M.flame, [-1.95, y0, 1.35], 0.9, flames, sh);
        buildDivineSymbol3D(root, god, M.gold, M.glow, [-1.05, y0 + mainH + 0.78, -0.35], 1.0, sh);
      }
      break;
    }

    /* 4. OFICINA DE CERCO (SIEGE WORKS) T3–T5 */
    case 'siege_works': {
      const wallMat = t >= 4 ? M.marbleBright : M.marbleBase;
      const accentMat = t === 5 ? M.gold : M.trim;

      addBox(root, 5.2 + (t - 3) * 0.3, 0.2, 4.6 + (t - 3) * 0.3, M.marbleBase, [0, 0.1, 0], [0, 0, 0], sh);
      if (t >= 4) addBox(root, 4.9, 0.14, 4.3, M.marbleBright, [0, 0.27, 0], [0, 0, 0], sh);
      const y0 = t >= 4 ? 0.34 : 0.2;

      const mainH = 1.65 + (t - 3) * 0.22;
      addBox(root, 4.2, mainH, 1.65, wallMat, [0, y0 + mainH * 0.5, -1.15], [0, 0, 0], sh);
      addBox(root, 4.32, 0.14, 1.76, accentMat, [0, y0 + mainH + 0.05, -1.15], [0, 0, 0], sh);
      buildPedimentRoof(root, 4.42, 1.85, 0.62, M.roof, wallMat, accentMat, y0 + mainH + 0.12, 0, sh);

      // Ala lateral esquerda de carpintaria
      addBox(root, 1.35, 1.25, 2.05, wallMat, [-1.65, y0 + 0.625, 0.55], [0, 0, 0], sh);
      buildPedimentRoof(root, 1.48, 2.18, 0.45, M.roof, wallMat, accentMat, y0 + 1.25, 0, sh);

      // Hangar aberto colunado à direita
      const rigH = 1.85 + (t - 3) * 0.18;
      for (const sx of [-0.35, 1.85]) {
        for (const sz of [-0.25, 1.55]) {
          addCyl(root, 0.1, 0.12, rigH, 12, t === 5 ? M.gold : M.marbleBright, [sx, y0 + rigH * 0.5, sz], [0, 0, 0], sh);
        }
      }
      addBox(root, 2.45, 0.16, 2.05, wallMat, [0.75, y0 + rigH + 0.08, 0.65], [0, 0, 0], sh);
      buildPedimentRoof(root, 2.55, 2.15, 0.55, M.roof, wallMat, accentMat, y0 + rigH + 0.16, 0, sh);

      // Aríete blindado monumental sob o hangar
      const machine = makeGroup(root, 0.75, y0, 0.65);
      addBox(machine, 1.15, 0.28, 1.75, M.wood, [0, 0.3, 0], [0, 0, 0], sh);
      for (const wx of [-0.64, 0.64]) {
        for (const wz of [-0.55, 0.55]) {
          addCyl(machine, 0.24, 0.24, 0.09, 16, M.metalDark, [wx, 0.24, wz], [0, 0, Math.PI / 2], sh);
        }
      }
      buildPedimentRoof(machine, 1.18, 1.65, 0.48, M.roof, M.wood, M.gold, 0.44, 0, sh);
      addCyl(machine, 0.16, 0.18, 2.05, 14, M.wood, [0, 0.62, 0.18], [Math.PI / 2, 0, 0], sh);
      addCyl(machine, 0.02, 0.22, 0.44, 12, M.gold, [0, 0.62, 1.32], [Math.PI / 2, 0, 0], sh);

      // Guindaste giratório no pátio frontal
      const crane = makeGroup(root, -0.65, y0, 1.35);
      addCyl(crane, 0.12, 0.16, 2.05, 12, M.wood, [0, 1.02, 0], [0, 0, 0], sh);
      addBox(crane, 0.12, 0.12, 1.85, t === 5 ? M.gold : M.wood, [0, 1.88, 0.45], [-0.38, 0, 0], sh);
      addCyl(crane, 0.015, 0.015, 0.75, 6, M.metalDark, [0, 1.75, 1.25], [0, 0, 0], sh);
      const loadStone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), M.marbleBright);
      loadStone.position.set(0, 1.35, 1.25);
      loadStone.castShadow = sh;
      crane.add(loadStone);
      cranes.push(crane);

      // Munição de pedra e estandartes
      for (let px = -1.35; px <= -0.85; px += 0.25) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), M.marbleBright);
        ball.position.set(px, y0 + 0.13, 1.85);
        ball.castShadow = sh;
        root.add(ball);
      }
      buildBanner(root, M.wood, M.banner, M.gold, [-2.15, y0, 1.65], 0, sh);
      buildBanner(root, M.wood, M.banner, M.gold, [2.15, y0, 1.65], 0, sh);

      if (t >= 4) {
        buildBrazier(root, M.gold, M.flame, [-1.95, y0, 1.95], 1.0, flames, sh);
        buildBrazier(root, M.gold, M.flame, [1.95, y0, 1.95], 1.0, flames, sh);
      }
      if (t === 5) {
        buildRoundShield(root, M.trim, M.gold, [-1.65, y0 + 0.85, 1.62], [0, 0, 0], 0.24, sh);
        buildRoundShield(root, M.trim, M.gold, [1.85, y0 + rigH + 0.1, 1.68], [0, 0, 0], 0.24, sh);
      }
      buildDivineSymbol3D(root, god, M.gold, M.glow, [0, y0 + mainH + 1.05, -1.15], 1.15, sh);
      break;
    }

    /* 5. ARSENAL DIVINO / FORTALEZA MILITAR (FORTRESS) T1–T5 */
    case 'fortress': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;
      const colMat = t === 5 ? M.gold : M.marbleBright;

      addBox(root, 5.2 + t * 0.25, 0.24, 4.8 + t * 0.25, M.marbleBase, [0, 0.12, 0], [0, 0, 0], sh);
      if (t >= 3) addBox(root, 4.9 + t * 0.22, 0.16, 4.5 + t * 0.22, M.marbleBright, [0, 0.3, 0], [0, 0, 0], sh);
      const y0 = t >= 3 ? 0.38 : 0.24;

      const fortW = 2.9 + t * 0.22;
      const fortH = 1.75 + t * 0.26;
      const fortD = 2.5 + t * 0.18;
      addBox(root, fortW, fortH, fortD, wallMat, [0, y0 + fortH * 0.5, -0.35], [0, 0, 0], sh);
      addBox(root, fortW + 0.18, 0.16, fortD + 0.18, M.trim, [0, y0 + fortH + 0.06, -0.35], [0, 0, 0], sh);
      addBox(root, fortW + 0.22, 0.08, fortD + 0.22, M.gold, [0, y0 + fortH + 0.16, -0.35], [0, 0, 0], sh);
      buildPedimentRoof(root, fortW + 0.26, fortD + 0.26, 0.65 + t * 0.06, M.roof, wallMat, M.gold, y0 + fortH + 0.2, 0, sh);

      if (t >= 3) {
        for (let cx = -1.15; cx <= 1.15; cx += 0.575) {
          if (Math.abs(cx) > 0.35) {
            addCyl(root, 0.09, 0.11, fortH * 0.88, 12, colMat, [cx, y0 + fortH * 0.44, fortD * 0.5 - 0.15], [0, 0, 0], sh);
          }
        }
      }

      addBox(root, 1.45, fortH * 0.76, 0.55, M.marbleBright, [0, y0 + fortH * 0.38, fortD * 0.5 - 0.12], [0, 0, 0], sh);
      addBox(root, 0.85, fortH * 0.6, 0.14, t >= 3 ? M.gold : M.wood, [0, y0 + fortH * 0.3, fortD * 0.5 + 0.16], [0, 0, 0], sh);

      // 4 Torres Bastião com Guaritas de Flechas (T2+)
      if (t >= 2) {
        const twH = fortH + 0.48;
        const ox = fortW * 0.5 + 0.38;
        const oz = fortD * 0.5 + 0.2;
        for (const sx of [-1, 1]) {
          for (const sz of [-1, 1]) {
            addBox(root, 0.82, twH, 0.82, wallMat, [sx * ox, y0 + twH * 0.5, sz * oz - 0.35], [0, 0, 0], sh);
            addBox(root, 0.96, 0.52, 0.96, M.marbleBright, [sx * ox, y0 + twH + 0.26, sz * oz - 0.35], [0, 0, 0], sh);
            addBox(root, 1.0, 0.08, 1.0, M.trim, [sx * ox, y0 + twH + 0.54, sz * oz - 0.35], [0, 0, 0], sh);
            addBox(root, 0.1, 0.28, 0.99, M.metalDark, [sx * ox - 0.22, y0 + twH + 0.26, sz * oz - 0.35], [0, 0, 0], sh);
            addBox(root, 0.1, 0.28, 0.99, M.metalDark, [sx * ox + 0.22, y0 + twH + 0.26, sz * oz - 0.35], [0, 0, 0], sh);
            const cap = new THREE.Mesh(new THREE.ConeGeometry(0.76, 0.55, 4), M.roof);
            cap.rotation.y = Math.PI / 4;
            cap.position.set(sx * ox, y0 + twH + 0.82, sz * oz - 0.35);
            cap.castShadow = sh;
            root.add(cap);
          }
        }
      }

      // Rastéis de armas douradas e escudos no pátio frontal
      for (const rx of [-1.25, 1.25]) {
        addBox(root, 0.75, 0.08, 0.28, M.wood, [rx, y0 + 0.42, fortD * 0.5 + 0.55], [0, 0, 0], sh);
        for (let sp = -0.25; sp <= 0.25; sp += 0.125) {
          addCyl(root, 0.015, 0.015, 1.15, 6, M.gold, [rx + sp, y0 + 0.58, fortD * 0.5 + 0.55], [0, 0, 0], sh);
        }
        buildRoundShield(root, M.trim, M.gold, [rx, y0 + 0.42, fortD * 0.5 + 0.72], [-0.2, 0, 0], 0.24, sh);
      }

      buildBanner(root, M.wood, M.banner, M.gold, [-fortW * 0.48, y0, fortD * 0.5 + 0.82], 0, sh);
      buildBanner(root, M.wood, M.banner, M.gold, [fortW * 0.48, y0, fortD * 0.5 + 0.82], 0, sh);

      if (t >= 4) {
        buildBrazier(root, M.gold, M.flame, [-0.95, y0, fortD * 0.5 + 0.95], 1.05, flames, sh);
        buildBrazier(root, M.gold, M.flame, [0.95, y0, fortD * 0.5 + 0.95], 1.05, flames, sh);
      }
      buildDivineSymbol3D(root, god, M.gold, M.glow, [0, y0 + fortH + 0.52, fortD * 0.5 - 0.16], 0.9 + t * 0.08, sh);

      if (t >= 5) {
        const apexY = y0 + fortH + 1.45;
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.055, 10, 28), M.glow);
        halo.rotation.x = Math.PI / 2;
        halo.position.set(0, apexY, -0.35);
        root.add(halo);
        metropolisHalo = halo;

        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), M.glow);
        crystal.position.set(0, apexY + 0.42, -0.35);
        root.add(crystal);
        metropolisCrystal = crystal;
      }
      break;
    }

    /* 6. TORRE DE VIGIA COM GUARITA DE FLECHAS (TOWER) T1–T5 */
    case 'tower': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;

      addBox(root, 2.5 + t * 0.16, 0.26, 2.5 + t * 0.16, M.marbleBase, [0, 0.13, 0], [0, 0, 0], sh);
      const y0 = 0.26;

      const twW = 1.22 + t * 0.08;
      const twH = 2.0 + t * 0.38;
      addBox(root, twW, twH, twW, wallMat, [0, y0 + twH * 0.5, 0], [0, 0, 0], sh);

      // Contrafortes nos cantos (T2+)
      if (t >= 2) {
        for (const sx of [-1, 1]) {
          for (const sz of [-1, 1]) {
            addBox(root, 0.24, twH * 0.85, 0.24, M.marbleBright, [sx * (twW * 0.48), y0 + twH * 0.425, sz * (twW * 0.48)], [0, 0, 0], sh);
          }
        }
      }

      // Faixa colorida da divindade e escudos progressivos
      addBox(root, twW + 0.14, 0.14, twW + 0.14, M.trim, [0, y0 + twH * 0.62, 0], [0, 0, 0], sh);
      if (t >= 2) {
        buildRoundShield(root, M.trim, M.gold, [0, y0 + twH * 0.62, twW * 0.5 + 0.09], [0, 0, 0], 0.26, sh);
        buildRoundShield(root, M.trim, M.gold, [0, y0 + twH * 0.62, -twW * 0.5 - 0.09], [0, Math.PI, 0], 0.26, sh);
      }
      if (t >= 3) {
        buildRoundShield(root, M.trim, M.gold, [twW * 0.5 + 0.09, y0 + twH * 0.62, 0], [0, Math.PI / 2, 0], 0.26, sh);
        buildRoundShield(root, M.trim, M.gold, [-twW * 0.5 - 0.09, y0 + twH * 0.62, 0], [0, -Math.PI / 2, 0], 0.26, sh);
      }

      // GUARITA DE FLECHAS SALIENTE NO TOPO (Machicolation / Sentry Box com Seteiras!)
      const gBoxY = y0 + twH;
      const gBoxW = twW + 0.52;
      const gBoxH = 0.72 + (t >= 4 ? 0.14 : 0);

      for (const off of [-0.36, 0, 0.36]) {
        addBox(root, 0.12, 0.22, gBoxW - 0.1, M.marbleBright, [off, gBoxY + 0.06, 0], [0, 0, 0], sh);
        addBox(root, gBoxW - 0.1, 0.22, 0.12, M.marbleBright, [0, gBoxY + 0.06, off], [0, 0, 0], sh);
      }

      addBox(root, gBoxW, gBoxH, gBoxW, t === 5 ? M.gold : M.marbleBright, [0, gBoxY + 0.16 + gBoxH * 0.5, 0], [0, 0, 0], sh);
      addBox(root, gBoxW + 0.08, 0.1, gBoxW + 0.08, M.trim, [0, gBoxY + 0.16 + gBoxH, 0], [0, 0, 0], sh);

      for (const sx of [-0.42, 0, 0.42]) {
        addBox(root, 0.09, gBoxH * 0.58, gBoxW + 0.04, M.metalDark, [sx, gBoxY + 0.16 + gBoxH * 0.52, 0], [0, 0, 0], sh);
        addBox(root, gBoxW + 0.04, gBoxH * 0.58, 0.09, M.metalDark, [0, gBoxY + 0.16 + gBoxH * 0.52, sx], [0, 0, 0], sh);
      }
      for (const dir of [1, -1]) {
        addCyl(root, 0.005, 0.025, 0.45, 6, M.gold, [0, gBoxY + 0.52, dir * (gBoxW * 0.5 + 0.18)], [dir * Math.PI / 2, 0, 0], sh);
        addCyl(root, 0.005, 0.025, 0.45, 6, M.gold, [dir * (gBoxW * 0.5 + 0.18), gBoxY + 0.52, 0], [0, 0, -dir * Math.PI / 2], sh);
      }

      const roofY = gBoxY + 0.2 + gBoxH;
      const pyr = new THREE.Mesh(new THREE.ConeGeometry(gBoxW * 0.82, 0.85, 4), M.roof);
      pyr.rotation.y = Math.PI / 4;
      pyr.position.set(0, roofY + 0.42, 0);
      pyr.castShadow = sh;
      pyr.receiveShadow = sh;
      root.add(pyr);

      if (t >= 4) {
        buildBrazier(root, M.gold, M.flame, [0, roofY + 0.82, 0], 0.85, flames, sh);
        // Pináculos blindados nos 4 cantos da guarita (Era IV — Torre Balista)
        for (const sx of [-1, 1]) {
          for (const sz of [-1, 1]) {
            addCyl(root, 0.02, 0.09, 0.34, 6, M.gold, [sx * (gBoxW * 0.46), roofY + 0.16, sz * (gBoxW * 0.46)], [0, 0, 0], sh);
          }
        }
      }
      if (t === 5) {
        buildDivineSymbol3D(root, god, M.gold, M.glow, [0, roofY + 1.85, 0], 0.95, sh);

        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 10, 26), M.glow);
        halo.rotation.x = Math.PI / 2;
        halo.position.set(0, roofY + 1.48, 0);
        root.add(halo);
        metropolisHalo = halo;

        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), M.glow);
        crystal.position.set(0, roofY + 2.38, 0);
        root.add(crystal);
        metropolisCrystal = crystal;
      }

      buildBanner(root, M.wood, M.banner, M.gold, [twW * 0.5 + 0.38, y0, twW * 0.5 + 0.28], 0, sh);
      break;
    }

    /* 7. FAZENDA (FARM) T1–T5 */
    case 'farm': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;

      addBox(root, 5.2, 0.12, 4.6, M.marbleBase, [0, 0.06, 0], [0, 0, 0], sh);
      const y0 = 0.12;

      const barnH = 1.15 + t * 0.14;
      addBox(root, 1.55, barnH, 1.75, wallMat, [-1.55, y0 + barnH * 0.5, -1.15], [0, 0, 0], sh);
      buildPedimentRoof(root, 1.68, 1.88, 0.48, M.roof, wallMat, M.trim, y0 + barnH, 0, sh);

      // Moinho de Vento Grego com 4 pás giratórias (T3+)
      if (t >= 3) {
        const millH = 1.65 + (t - 3) * 0.22;
        addCyl(root, 0.46, 0.58, millH, 14, wallMat, [-0.32, y0 + millH * 0.5, -1.25], [0, 0, 0], sh);
        addBox(root, 1.12, 0.1, 1.12, M.trim, [-0.32, y0 + millH, -1.25], [0, 0, 0], sh);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.52, 14), M.roof);
        cap.position.set(-0.32, y0 + millH + 0.3, -1.25);
        cap.castShadow = sh;
        root.add(cap);

        const rotor = makeGroup(root, -0.32, y0 + millH * 0.78, -0.68);
        addCyl(rotor, 0.06, 0.06, 0.24, 8, M.gold, [0, 0, 0], [Math.PI / 2, 0, 0], sh);
        for (let b = 0; b < 4; b++) {
          const blade = makeGroup(rotor, 0, 0, 0.08);
          blade.rotation.z = (b * Math.PI) / 2;
          addBox(blade, 0.05, 1.05, 0.04, M.wood, [0, 0.52, 0], [0, 0, 0], sh);
          addBox(blade, 0.24, 0.78, 0.02, M.awning, [0.1, 0.58, 0.02], [0, 0, 0], sh);
        }
        windmills.push(rotor);
      }

      // Campos de cultivo dourados/sagrados
      const rows = 5 + t;
      const cropH = 0.16 + t * 0.05;
      for (let r = 0; r < rows; r++) {
        const rz = -0.35 + r * 0.25;
        addBox(root, 2.55, 0.06, 0.16, M.wood, [1.05, y0 + 0.03, rz], [0, 0, 0], sh);
        addBox(root, 2.48, cropH, 0.12, M.straw, [1.05, y0 + 0.06 + cropH * 0.5, rz], [0, 0, 0], sh);
      }

      // Melões dourados
      for (let px = -0.45; px <= 0.25; px += 0.35) {
        const melon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), M.gold);
        melon.scale.set(1.2, 0.85, 1.2);
        melon.position.set(px, y0 + 0.12, 1.72);
        melon.castShadow = sh;
        root.add(melon);
      }

      if (t >= 3) {
        addBox(root, 0.22, 0.1, 2.75, M.water, [-0.42, y0 + 0.05, 0.75], [0, 0, 0], sh);
      }

      // Carroça de colheita e ciprestes
      addBox(root, 0.92, 0.2, 0.56, M.wood, [-1.45, y0 + 0.25, 1.05], [0, 0, 0], sh);
      addCyl(root, 0.2, 0.2, 0.07, 12, M.metalDark, [-1.45, y0 + 0.2, 1.36], [Math.PI / 2, 0, 0], sh);
      addCyl(root, 0.2, 0.2, 0.07, 12, M.metalDark, [-1.45, y0 + 0.2, 0.74], [Math.PI / 2, 0, 0], sh);
      addBox(root, 0.58, 0.26, 0.4, M.straw, [-1.45, y0 + 0.45, 1.05], [0, 0, 0], sh);
      buildCypress(root, M.wood, M.foliage, [2.25, 0, -1.65], 0.9, sh);
      if (t >= 4) {
        buildCypress(root, M.wood, M.foliage, [-2.25, 0, 1.65], 0.85, sh);
      }

      if (t === 5) {
        buildDivineSymbol3D(root, god, M.gold, M.glow, [-1.55, y0 + barnH + 0.78, -1.15], 0.95, sh);
      }
      break;
    }

    /* 8. PORTAL DO TITÃ (TITAN GATE) T4–T5 */
    case 'titan_gate': {
      const wallMat = M.marbleBright;
      const isApex = t >= 5;

      addBox(root, 5.4, 0.24, 4.8, M.marbleBase, [0, 0.12, 0], [0, 0, 0], sh);
      addBox(root, 5.0, 0.18, 4.4, wallMat, [0, 0.33, 0], [0, 0, 0], sh);
      const y0 = 0.42;

      const pit = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.08, 32), M.metalDark);
      pit.position.set(0, y0 + 0.04, 0);
      pit.receiveShadow = sh;
      root.add(pit);

      const pitRing = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.62, 32), M.glow);
      pitRing.rotation.x = -Math.PI / 2;
      pitRing.position.set(0, y0 + 0.09, 0);
      root.add(pitRing);

      const archH = isApex ? 3.65 : 2.95;
      for (const sx of [-1.65, 1.65]) {
        addBox(root, 0.85, archH, 0.95, wallMat, [sx, y0 + archH * 0.5, 0], [0, 0, 0], sh);
        addBox(root, 0.95, 0.18, 1.05, M.trim, [sx, y0 + archH * 0.35, 0], [0, 0, 0], sh);
        addBox(root, 0.95, 0.18, 1.05, M.trim, [sx, y0 + archH * 0.72, 0], [0, 0, 0], sh);
        addCyl(root, 0.15, 0.18, archH, 14, M.gold, [sx * 0.68, y0 + archH * 0.5, 0.45], [0, 0, 0], sh);
        addCyl(root, 0.15, 0.18, archH, 14, M.gold, [sx * 0.68, y0 + archH * 0.5, -0.45], [0, 0, 0], sh);
      }

      const lintelW = isApex ? 4.35 : 3.45;
      addBox(root, lintelW, 0.52, 1.05, wallMat, [0, y0 + archH + 0.26, 0], [0, 0, 0], sh);
      addBox(root, lintelW + 0.16, 0.14, 1.14, M.gold, [0, y0 + archH + 0.56, 0], [0, 0, 0], sh);
      if (isApex) {
        buildPedimentRoof(root, 4.45, 1.18, 0.82, M.roof, wallMat, M.gold, y0 + archH + 0.62, 0, sh);
      }

      const vortexOuter = new THREE.Mesh(
        new THREE.TorusGeometry(isApex ? 1.28 : 1.05, 0.11, 14, 36),
        M.glow
      );
      vortexOuter.position.set(0, y0 + archH * 0.54, 0);
      root.add(vortexOuter);
      portalRings.push(vortexOuter);
      vortexRing = vortexOuter;

      const vortexInner = new THREE.Mesh(
        new THREE.TorusGeometry(isApex ? 0.82 : 0.65, 0.07, 12, 28),
        M.gold
      );
      vortexInner.position.set(0, y0 + archH * 0.54, 0);
      root.add(vortexInner);
      portalRings.push(vortexInner);

      const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(isApex ? 0.36 : 0.28, 0), M.glow);
      coreGem.position.set(0, y0 + archH * 0.54, 0);
      root.add(coreGem);
      beaconCrystal = coreGem;

      for (const sx of [-2.05, 2.05]) {
        for (const sz of [-1.45, 1.45]) {
          buildBrazier(root, M.gold, M.flame, [sx, y0, sz], isApex ? 1.2 : 1.0, flames, sh);
        }
      }
      buildDivineSymbol3D(root, god, M.gold, M.glow, [0, y0 + archH + (isApex ? 1.65 : 0.95), 0], 1.35, sh);
      break;
    }

    /* 9. MERCADO / ÁGORA (MARKET) T3–T5 */
    case 'market': {
      const wallMat = t >= 4 ? M.marbleBright : M.marbleBase;

      addBox(root, 5.1 + (t - 3) * 0.25, 0.18, 4.6 + (t - 3) * 0.25, M.marbleBase, [0, 0.09, 0], [0, 0, 0], sh);
      const y0 = 0.18;

      const bldH = 1.75 + (t - 3) * 0.18;
      addBox(root, 3.05, bldH, 1.45, wallMat, [-0.45, y0 + bldH * 0.5, -1.15], [0, 0, 0], sh);
      buildPedimentRoof(root, 3.18, 1.58, 0.52, M.roof, wallMat, M.trim, y0 + bldH, 0, sh);

      addBox(root, 1.15, 1.15, 1.35, wallMat, [-1.95, y0 + 0.575, -0.35], [0, 0, 0], sh);
      buildPedimentRoof(root, 1.25, 1.45, 0.38, M.roof, wallMat, M.trim, y0 + 1.15, 0, sh);

      // Sacada balaustrada e escadaria lateral
      addBox(root, 2.95, 0.09, 0.52, M.marbleBright, [-0.45, y0 + 0.95, -0.25], [0, 0, 0], sh);
      addBox(root, 2.95, 0.07, 0.07, M.trim, [-0.45, y0 + 1.22, 0.0], [0, 0, 0], sh);
      for (let bx = -1.85; bx <= 0.95; bx += 0.24) {
        addCyl(root, 0.022, 0.022, 0.26, 6, t === 5 ? M.gold : M.metalDark, [bx, y0 + 1.08, 0.0], [0, 0, 0], sh);
      }
      addBox(root, 0.46, 0.09, 1.32, M.marbleBright, [1.28, y0 + 0.48, 0.25], [0.72, 0, 0], sh);

      // 4 Barracas com toldos listrados
      const stalls: Array<{ pos: [number, number, number]; rot: number }> = [
        { pos: [-1.25, y0, 1.28], rot: 0.28 },
        { pos: [0.05, y0, 1.38], rot: -0.15 },
        { pos: [1.35, y0, 1.12], rot: -0.42 },
        { pos: [1.85, y0, -0.15], rot: -1.15 },
      ];
      for (let s = 0; s < stalls.length; s++) {
        const st = makeGroup(root, stalls[s].pos[0], stalls[s].pos[1], stalls[s].pos[2]);
        st.rotation.y = stalls[s].rot;
        addBox(st, 0.98, 0.36, 0.52, M.wood, [0, 0.18, 0], [0, 0, 0], sh);
        addBox(st, 0.86, 0.09, 0.42, s % 2 === 0 ? M.gold : M.banner, [0, 0.38, 0], [0, 0, 0], sh);
        addCyl(st, 0.028, 0.028, 0.84, 8, t === 5 ? M.gold : M.wood, [-0.44, 0.42, -0.2], [0, 0, 0], sh);
        addCyl(st, 0.028, 0.028, 0.84, 8, t === 5 ? M.gold : M.wood, [0.44, 0.42, -0.2], [0, 0, 0], sh);
        const awning = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.04, 0.72), M.awning);
        awning.position.set(0, 0.78, 0.05);
        awning.rotation.x = 0.38;
        awning.castShadow = sh;
        st.add(awning);
      }

      addBox(root, 0.4, 0.34, 0.4, M.wood, [-0.45, y0 + 0.17, 0.42], [0, 0, 0], sh);
      buildBarrel(root, M.wood, M.metalDark, [0.18, y0, 0.52], 0.9, sh);
      addCyl(root, 0.11, 0.15, 0.38, 12, M.gold, [-0.12, y0 + 0.19, 0.62], [0, 0, 0], sh);
      buildBanner(root, M.wood, M.banner, M.gold, [-2.2, y0, 0.75], 0, sh);

      if (t >= 4) {
        buildBrazier(root, M.gold, M.flame, [-2.05, y0, 1.55], 0.9, flames, sh);
      }
      if (t === 5) {
        buildBrazier(root, M.gold, M.flame, [2.05, y0, 1.45], 0.9, flames, sh);
      }
      buildDivineSymbol3D(root, god, M.gold, M.glow, [-0.45, y0 + bldH + 0.85, -1.15], 1.05, sh);
      break;
    }

    /* 10. FERREIRO (ARMORY) T2–T5 */
    case 'armory': {
      const wallMat = t >= 4 ? M.marbleBright : M.marbleBase;

      addBox(root, 4.9 + (t - 2) * 0.22, 0.18, 4.4 + (t - 2) * 0.22, M.marbleBase, [0, 0.09, 0], [0, 0, 0], sh);
      const y0 = 0.18;

      const mainH = 1.38 + (t - 2) * 0.16;
      addBox(root, 1.75, mainH, 2.95, wallMat, [-1.15, y0 + mainH * 0.5, -0.35], [0, 0, 0], sh);
      buildPedimentRoof(root, 1.88, 3.08, 0.52, M.roof, wallMat, M.trim, y0 + mainH, 0, sh);

      addBox(root, 2.05, 1.05, 1.25, wallMat, [0.75, y0 + 0.525, -0.95], [0, 0, 0], sh);
      buildPedimentRoof(root, 2.15, 1.38, 0.42, M.roof, wallMat, M.trim, y0 + 1.05, 0, sh);

      // Alto-Forno circular de pedra com chaminé e brasas vivas
      const furnace = makeGroup(root, -0.05, y0, 1.22);
      addCyl(furnace, 0.58, 0.65, 0.42, 18, M.marbleBase, [0, 0.21, 0], [0, 0, 0], sh);
      addCyl(furnace, 0.3, 0.48, 0.68, 18, M.marbleBright, [0, 0.74, 0], [0, 0, 0], sh);
      addBox(furnace, 0.32, 0.28, 0.18, M.metalDark, [0, 0.32, 0.54], [0, 0, 0], sh);

      const emberFront = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.05), M.flame);
      emberFront.position.set(0, 0.32, 0.62);
      furnace.add(emberFront);
      flames.push(emberFront);

      const emberTop = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 14), M.flame);
      emberTop.position.set(0, 1.08, 0);
      furnace.add(emberTop);
      flames.push(emberTop);

      // Cocho de têmpera e bigorna
      addBox(root, 0.78, 0.28, 0.38, M.wood, [0.85, y0 + 0.14, 0.92], [0, 0, 0], sh);
      addBox(root, 0.68, 0.07, 0.28, M.water, [0.85, y0 + 0.26, 0.92], [0, 0, 0], sh);

      addBox(root, 0.38, 0.24, 0.2, M.metalDark, [0.48, y0 + 0.12, 0.18], [0, 0, 0], sh);
      addBox(root, 0.52, 0.12, 0.22, t >= 4 ? M.gold : M.metalDark, [0.48, y0 + 0.3, 0.18], [0, 0, 0], sh);

      // Roda hidráulica lateral giratória (T3+)
      if (t >= 3) {
        const wheel = makeGroup(root, -2.08, y0 + 0.62, -0.35);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 8, 20), M.wood);
        rim.rotation.y = Math.PI / 2;
        rim.castShadow = sh;
        wheel.add(rim);
        for (let sp = 0; sp < 4; sp++) {
          addBox(wheel, 0.04, 1.02, 0.06, M.wood, [0, 0, 0], [(sp * Math.PI) / 4, 0, 0], sh);
        }
        windmills.push(wheel);
      }

      buildBarrel(root, M.wood, M.metalDark, [-0.25, y0, 0.15], 0.92, sh);
      buildRoundShield(root, M.trim, M.gold, [1.72, y0 + 0.28, 0.12], [0, 0.5, -0.25], 0.26, sh);
      buildRoundShield(root, M.trim, M.gold, [1.78, y0 + 0.28, 0.52], [0, 0.5, -0.25], 0.26, sh);
      buildBanner(root, M.wood, M.banner, M.gold, [1.95, y0, -1.45], 0, sh);

      if (t >= 4) {
        buildRoundShield(root, M.trim, M.gold, [1.52, y0 + 0.28, 0.92], [0, 0.3, -0.2], 0.24, sh);
      }
      if (t === 5) {
        buildBrazier(root, M.gold, M.flame, [-2.05, y0, 1.45], 0.95, flames, sh);
        buildDivineSymbol3D(root, god, M.gold, M.glow, [-1.15, y0 + mainH + 0.82, -0.35], 1.05, sh);
      }
      break;
    }

    /* 11. MURALHA GREGA (WALL) T1–T5 — EVOLUÇÃO PROGRESSIVA DE ALTURA E MATERIAL */
    case 'wall': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;
      const wallH = 1.25 + t * 0.28; // T1=1.53, T2=1.81, T3=2.09, T4=2.37, T5=2.65
      addBox(root, 2.88, 0.22, 1.04, M.marbleBase, [0, 0.11, 0], [0, 0, 0], sh);
      const y0 = 0.22;

      addBox(root, 2.72, wallH, 0.82, wallMat, [0, y0 + wallH * 0.5, 0], [0, 0, 0], sh);
      addBox(root, 2.8, 0.13, 0.92, t >= 4 ? M.gold : M.trim, [0, y0 + wallH + 0.04, 0], [0, 0, 0], sh);

      // Ameias ou estacas de paliçada
      for (const cx of [-0.96, 0, 0.96]) {
        if (t === 1) {
          addCyl(root, 0.02, 0.18, 0.44, 6, M.wood, [cx, y0 + wallH + 0.24, 0], [0, 0, 0], sh);
        } else {
          addBox(root, 0.48, 0.34, 0.88, t === 5 ? M.gold : wallMat, [cx, y0 + wallH + 0.24, 0], [0, 0, 0], sh);
        }
      }

      if (t >= 3) {
        // Contrafortes laterais e escudos hoplitas
        addBox(root, 0.42, wallH + 0.22, 1.02, M.marbleBright, [-1.24, y0 + wallH * 0.5, 0], [0, 0, 0], sh);
        addBox(root, 0.42, wallH + 0.22, 1.02, M.marbleBright, [1.24, y0 + wallH * 0.5, 0], [0, 0, 0], sh);
        buildRoundShield(root, M.trim, M.gold, [0, y0 + wallH * 0.58, 0.46], [0, 0, 0], 0.24, sh);
      }

      if (t >= 5) {
        const finL = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), M.glow);
        finL.position.set(-1.24, y0 + wallH + 0.58, 0);
        root.add(finL);
        const finR = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), M.glow);
        finR.position.set(1.24, y0 + wallH + 0.58, 0);
        root.add(finR);
      }
      break;
    }

    /* 12. MURALHA & PORTÃO ARTICULADO (GATE) T1–T5 */
    case 'gate': {
      const wallMat = t === 1 ? M.wood : t >= 4 ? M.marbleBright : M.marbleBase;
      const gateMat = t === 1 ? M.wood : t >= 4 ? M.gold : M.trim;

      addBox(root, 6.2, 0.2, 2.6, M.marbleBase, [0, 0.1, 0], [0, 0, 0], sh);
      const y0 = 0.2;

      const wallH = 1.25 + t * 0.24;
      const twH = wallH + 0.65;

      for (const sx of [-1, 1]) {
        addBox(root, 1.45, wallH, 0.72, wallMat, [sx * 2.15, y0 + wallH * 0.5, 0], [0, 0, 0], sh);
        addBox(root, 1.5, 0.12, 0.82, M.trim, [sx * 2.15, y0 + wallH + 0.04, 0], [0, 0, 0], sh);
        for (let mx = -0.52; mx <= 0.52; mx += 0.52) {
          addBox(root, 0.28, 0.24, 0.16, wallMat, [sx * 2.15 + mx, y0 + wallH + 0.2, 0.3], [0, 0, 0], sh);
        }

        const bx = sx * 1.22;
        addBox(root, 0.92, twH, 1.05, wallMat, [bx, y0 + twH * 0.5, 0], [0, 0, 0], sh);
        addBox(root, 1.04, 0.14, 1.16, M.trim, [bx, y0 + twH + 0.05, 0], [0, 0, 0], sh);
        if (t >= 3) {
          addBox(root, 1.02, 0.45, 1.14, M.marbleBright, [bx, y0 + twH + 0.32, 0], [0, 0, 0], sh);
          addBox(root, 0.1, 0.24, 1.18, M.metalDark, [bx, y0 + twH + 0.32, 0], [0, 0, 0], sh);
          const cap = new THREE.Mesh(new THREE.ConeGeometry(0.84, 0.58, 4), M.roof);
          cap.rotation.y = Math.PI / 4;
          cap.position.set(bx, y0 + twH + 0.82, 0);
          cap.castShadow = sh;
          root.add(cap);
        }
        buildRoundShield(root, M.trim, M.gold, [bx, y0 + twH * 0.65, 0.55], [0, 0, 0], 0.24, sh);
        buildBanner(root, M.wood, M.banner, M.gold, [bx + sx * 0.35, y0, 0.68], 0, sh);
      }

      const archTopY = y0 + wallH;
      addBox(root, 1.65, 0.45, 0.85, wallMat, [0, archTopY - 0.12, 0], [0, 0, 0], sh);
      addBox(root, 1.72, 0.12, 0.92, M.gold, [0, archTopY + 0.14, 0], [0, 0, 0], sh);
      buildDivineSymbol3D(root, god, M.gold, M.glow, [0, archTopY + 0.58, 0.38], 0.82 + t * 0.06, sh);

      // Portão Duplo Articulado com pivôs nas dobradiças!
      const doorH = wallH - 0.36;
      const leftPivot = makeGroup(root, -0.74, y0, 0);
      const leftDoor = addBox(leftPivot, 0.72, doorH, 0.14, gateMat, [0.36, doorH * 0.5, 0], [0, 0, 0], sh);
      addBox(leftDoor, 0.62, 0.1, 0.18, M.gold, [0, 0.25, 0], [0, 0, 0], sh);
      addBox(leftDoor, 0.62, 0.1, 0.18, M.gold, [0, -0.25, 0], [0, 0, 0], sh);

      const rightPivot = makeGroup(root, 0.74, y0, 0);
      const rightDoor = addBox(rightPivot, 0.72, doorH, 0.14, gateMat, [-0.36, doorH * 0.5, 0], [0, 0, 0], sh);
      addBox(rightDoor, 0.62, 0.1, 0.18, M.gold, [0, 0.25, 0], [0, 0, 0], sh);
      addBox(rightDoor, 0.62, 0.1, 0.18, M.gold, [0, -0.25, 0], [0, 0, 0], sh);

      gates.push({ leftPivot, rightPivot, currentAngle: 0 });

      if (t >= 4) {
        buildBrazier(root, M.gold, M.flame, [-1.22, y0, 0.78], 0.85, flames, sh);
        buildBrazier(root, M.gold, M.flame, [1.22, y0, 0.78], 0.85, flames, sh);
      }
      if (t >= 5) {
        const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), M.glow);
        crown.position.set(0, y0 + twH + 1.28, 0);
        root.add(crown);
        beaconCrystal = crown;
      }
      break;
    }
  }

  return {
    root,
    meta,
    effectiveTier: t,
    flames,
    cranes,
    windmills,
    portalRings,
    gates,
    beaconCrystal,
    vortexRing,
    metropolisHalo,
    metropolisCrystal,
  };
}
