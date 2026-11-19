import * as THREE from 'three';

/* ============================================================================
   ARQUITETURA EGÍPCIA • 6 CONSTRUÇÕES + HIERÓGLIFOS PROCEDURAIS • RÁ / ÍSIS / SET
   Baseado na especificação oficial de evolução por Tier (T1–T5) e identidade
   visual distinta por divindade maior (Solar / Lótus / Deserto).
   ============================================================================ */

export type EgyptianArchGodKey = 'ra' | 'isis' | 'set';

export type EgyptianArchBuildingKey =
  | 'barracks'
  | 'stable'
  | 'archery_range'
  | 'house'
  | 'market'
  | 'armory';

export interface EgyptianArchTheme {
  id: EgyptianArchGodKey;
  name: string;
  title: string;
  bg: number;
  hemiSky: number;
  hemiGround: number;
  rim: number;
  stone: number;
  bright: number;
  trim: number;
  sec: number;
  gold: number;
  statue: number;
  glow: number;
  grass: string;
  dirt: string;
  style: 'solar' | 'lotus' | 'desert';
  subtitle: string;
}

export const EGYPT_ARCH_THEMES: Record<EgyptianArchGodKey, EgyptianArchTheme> = {
  ra: {
    id: 'ra',
    name: 'Rá',
    title: 'de Rá',
    bg: 0x1a1207,
    hemiSky: 0xfef9c3,
    hemiGround: 0x854d0e,
    rim: 0xfacc15,
    stone: 0xe8d4a8,
    bright: 0xf6e8c8,
    trim: 0x1e40af,
    sec: 0xb45309,
    gold: 0xfacc15,
    statue: 0xd4b87a,
    glow: 0xfacc15,
    grass: '#6b8a3a',
    dirt: '#c9a66b',
    style: 'solar',
    subtitle: 'Arquitetura solar com frisos hieroglíficos e ornamentos dourados',
  },
  isis: {
    id: 'isis',
    name: 'Ísis',
    title: 'de Ísis',
    bg: 0x061820,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0f766e,
    rim: 0x2dd4bf,
    stone: 0xe8eef5,
    bright: 0xf8fafc,
    trim: 0x0d9488,
    sec: 0x1e3a8a,
    gold: 0xfacc15,
    statue: 0xc5d0dc,
    glow: 0x2dd4bf,
    grass: '#4a7c45',
    dirt: '#cbb892',
    style: 'lotus',
    subtitle: 'Arquitetura elegante com colunas de lótus e hieróglifos mágicos',
  },
  set: {
    id: 'set',
    name: 'Set',
    title: 'de Set',
    bg: 0x140805,
    hemiSky: 0xffedd5,
    hemiGround: 0x7c2d12,
    rim: 0xea580c,
    stone: 0xc48a5e,
    bright: 0xd6a67a,
    trim: 0xb91c1c,
    sec: 0x3f1a0a,
    gold: 0xf59e0b,
    statue: 0x6b635a,
    glow: 0xea580c,
    grass: '#4a5a2e',
    dirt: '#a87a4e',
    style: 'desert',
    subtitle: 'Arquitetura do deserto com braseiros e hieróglifos de força',
  },
};

export const EGYPT_ARCH_ERA_NAMES: Record<number, string> = {
  1: 'Arcaico',
  2: 'Clássico',
  3: 'Heroico',
  4: 'Mítico',
  5: 'Olímpico',
};

export interface EgyptianArchBuildingMeta {
  id: EgyptianArchBuildingKey;
  label: string;
  minTier: 1 | 2;
  gameplayScale: number;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  focusTargetY: number;
  focusDist: number;
  overviewDist: number;
}

export const EGYPT_ARCH_BUILDING_META: Record<EgyptianArchBuildingKey, EgyptianArchBuildingMeta> = {
  barracks: {
    id: 'barracks',
    label: 'Quartel',
    minTier: 2,
    gameplayScale: 0.92,
    markerRadius: 2.75,
    barHeight: 4.35,
    barWidth: 2.6,
    focusTargetY: 1.6,
    focusDist: 5.2,
    overviewDist: 9.8,
  },
  stable: {
    id: 'stable',
    label: 'Estábulos',
    minTier: 2,
    gameplayScale: 0.86,
    markerRadius: 2.8,
    barHeight: 4.1,
    barWidth: 2.65,
    focusTargetY: 1.45,
    focusDist: 5.4,
    overviewDist: 10.2,
  },
  archery_range: {
    id: 'archery_range',
    label: 'Centro de Arquearia',
    minTier: 2,
    gameplayScale: 0.88,
    markerRadius: 2.7,
    barHeight: 4.05,
    barWidth: 2.55,
    focusTargetY: 1.4,
    focusDist: 5.3,
    overviewDist: 10.0,
  },
  house: {
    id: 'house',
    label: 'Casa da População',
    minTier: 1,
    gameplayScale: 0.78,
    markerRadius: 1.35,
    barHeight: 2.35,
    barWidth: 1.45,
    focusTargetY: 1.25,
    focusDist: 4.4,
    overviewDist: 7.8,
  },
  market: {
    id: 'market',
    label: 'Mercado',
    minTier: 2,
    gameplayScale: 0.86,
    markerRadius: 2.8,
    barHeight: 4.05,
    barWidth: 2.65,
    focusTargetY: 1.45,
    focusDist: 5.5,
    overviewDist: 10.2,
  },
  armory: {
    id: 'armory',
    label: 'Ferreiro',
    minTier: 2,
    gameplayScale: 0.94,
    markerRadius: 2.65,
    barHeight: 4.45,
    barWidth: 2.55,
    focusTargetY: 1.5,
    focusDist: 5.1,
    overviewDist: 9.6,
  },
};

export function isEgyptianArchBuilding(kind: string): kind is EgyptianArchBuildingKey {
  return (
    kind === 'barracks' ||
    kind === 'stable' ||
    kind === 'archery_range' ||
    kind === 'house' ||
    kind === 'market' ||
    kind === 'armory'
  );
}

export function resolveEgyptianArchGod(majorGod?: string): EgyptianArchGodKey {
  const raw = (majorGod || 'ra').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (raw.includes('isis')) return 'isis';
  if (raw.includes('set')) return 'set';
  return 'ra';
}

/* ===================== PRNG DETERMINÍSTICO PARA TEXTURAS ===================== */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ===================== TEXTURAS PROCEDURAIS COM CACHE ===================== */
let _sandstoneTex: THREE.CanvasTexture | null = null;
let _sandstoneBrightTex: THREE.CanvasTexture | null = null;
let _roofTex: THREE.CanvasTexture | null = null;
const _hieroglyphTexCache: Partial<Record<EgyptianArchGodKey, THREE.CanvasTexture>> = {};
const _groundTexCache: Partial<Record<EgyptianArchGodKey, THREE.CanvasTexture>> = {};

function createSandstoneTexture(bright: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const x = c.getContext('2d')!;
  const rand = createRng(bright ? 4109 : 1973);

  x.fillStyle = bright ? '#f3e6c4' : '#dfc89a';
  x.fillRect(0, 0, 512, 512);

  const rows = 13;
  const rh = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    const cols = 5;
    const cw = 512 / cols;
    const off = r % 2 ? cw * 0.5 : 0;
    for (let col = -1; col <= cols; col++) {
      const px = col * cw + off;
      const sh = 218 + (((rand() - 0.5) * 24) | 0);
      x.fillStyle = `rgba(${sh},${sh - 16},${sh - 45},0.4)`;
      x.fillRect(px + 2, y + 2, cw - 4, rh - 4);
      x.strokeStyle = 'rgba(90,65,35,0.28)';
      x.lineWidth = 1.8;
      x.strokeRect(px + 1, y + 1, cw - 2, rh - 2);
    }
  }
  for (let i = 0; i < 1800; i++) {
    x.fillStyle = i % 2 ? 'rgba(255,250,235,0.08)' : 'rgba(75,50,22,0.07)';
    x.fillRect(rand() * 512, rand() * 512, 3.5, 3.5);
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function getSandstoneTexture(bright: boolean): THREE.CanvasTexture {
  if (bright) {
    if (!_sandstoneBrightTex) _sandstoneBrightTex = createSandstoneTexture(true);
    return _sandstoneBrightTex;
  }
  if (!_sandstoneTex) _sandstoneTex = createSandstoneTexture(false);
  return _sandstoneTex;
}

function getRoofTexture(): THREE.CanvasTexture {
  if (_roofTex) return _roofTex;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const x = c.getContext('2d')!;
  const rand = createRng(8821);

  x.fillStyle = '#d4c09a';
  x.fillRect(0, 0, 512, 512);
  const g = 8;
  const cell = 512 / g;
  for (let i = 0; i < g; i++) {
    for (let j = 0; j < g; j++) {
      const sh = 200 + (((rand() - 0.5) * 28) | 0);
      x.fillStyle = `rgb(${sh},${sh - 12},${sh - 32})`;
      x.fillRect(i * cell + 2, j * cell + 2, cell - 4, cell - 4);
      x.strokeStyle = 'rgba(70,55,32,0.38)';
      x.lineWidth = 2;
      x.strokeRect(i * cell + 1, j * cell + 1, cell - 2, cell - 2);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  _roofTex = t;
  return t;
}

export function getEgyptianArchGroundTexture(god: EgyptianArchGodKey): THREE.CanvasTexture {
  const cached = _groundTexCache[god];
  if (cached) return cached;
  const th = EGYPT_ARCH_THEMES[god];
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const x = c.getContext('2d')!;
  const rand = createRng(god === 'ra' ? 301 : god === 'isis' ? 302 : 303);

  x.fillStyle = th.grass;
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2400; i++) {
    x.fillStyle = i % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(18,30,8,0.11)';
    x.fillRect(rand() * 512, rand() * 512, 5, 5);
  }
  const g = x.createRadialGradient(256, 256, 80, 256, 256, 195);
  g.addColorStop(0, th.dirt);
  g.addColorStop(0.72, th.dirt);
  g.addColorStop(1, 'rgba(200,165,110,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 512);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _groundTexCache[god] = t;
  return t;
}

/* ===================== HIERÓGLIFOS PROCEDURAIS ===================== */
function drawHieroglyph(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  ink: string,
  accent: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  switch (type) {
    case 'sun':
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
        ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
        ctx.stroke();
      }
      break;
    case 'scarab':
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-9, -2, 6, 4.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(9, -2, 6, 4.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'eye':
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.quadraticCurveTo(0, -11, 13, 0);
      ctx.quadraticCurveTo(0, 11, -13, 0);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(2, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.beginPath();
      ctx.moveTo(-11, -7);
      ctx.quadraticCurveTo(0, -13, 11, -5);
      ctx.stroke();
      break;
    case 'falcon':
      ctx.beginPath();
      ctx.moveTo(-7, 7);
      ctx.lineTo(0, -11);
      ctx.lineTo(7, 7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(5, 0, 9, 4.5, 0.55, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'shen':
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();
      break;
    case 'cartouche':
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-15, -8, 30, 16, 8);
      } else {
        ctx.rect(-15, -8, 30, 16);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-15, 8);
      ctx.lineTo(15, 8);
      ctx.stroke();
      break;
    case 'ankh':
      ctx.beginPath();
      ctx.arc(0, -7, 5.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -1.5);
      ctx.lineTo(0, 13);
      ctx.moveTo(-8, 3.5);
      ctx.lineTo(8, 3.5);
      ctx.stroke();
      break;
    case 'tjet':
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(0, 11);
      ctx.moveTo(-6, -3);
      ctx.lineTo(6, -3);
      ctx.moveTo(-4.5, 3);
      ctx.lineTo(4.5, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-4.5, -7, 3.5, 0, Math.PI * 2);
      ctx.arc(4.5, -7, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'wings':
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-16, -9, -20, 2);
      ctx.quadraticCurveTo(-9, 5, 0, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(16, -9, 20, 2);
      ctx.quadraticCurveTo(9, 5, 0, 0);
      ctx.fill();
      break;
    case 'throne':
      ctx.fillRect(-7, -3, 14, 11);
      ctx.fillRect(-9, 8, 18, 3.5);
      break;
    case 'lotus':
      ctx.beginPath();
      ctx.moveTo(0, 9);
      ctx.quadraticCurveTo(-9, -1, 0, -11);
      ctx.quadraticCurveTo(9, -1, 0, 9);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-6, 0, 4.5, 7, -0.5, 0, Math.PI * 2);
      ctx.ellipse(6, 0, 4.5, 7, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'cobra':
      ctx.beginPath();
      ctx.moveTo(0, 11);
      ctx.quadraticCurveTo(-5, 0, 0, -9);
      ctx.quadraticCurveTo(5, 0, 0, 11);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -11, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'setAnimal':
      ctx.beginPath();
      ctx.moveTo(-5, 7);
      ctx.lineTo(-3.5, -5);
      ctx.lineTo(0, -13);
      ctx.lineTo(3.5, -5);
      ctx.lineTo(5, 7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3.5, -5);
      ctx.lineTo(-8, -15);
      ctx.lineTo(-1.5, -7);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3.5, -5);
      ctx.lineTo(8, -15);
      ctx.lineTo(1.5, -7);
      ctx.fill();
      break;
    case 'was':
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(0, 11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4.5, -13);
      ctx.lineTo(0, -19);
      ctx.lineTo(4.5, -13);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3.5, 11);
      ctx.lineTo(0, 7);
      ctx.lineTo(3.5, 11);
      ctx.stroke();
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(9, -3);
      ctx.lineTo(7, 9);
      ctx.lineTo(-7, 9);
      ctx.lineTo(-9, -3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'arrow':
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(0, 11);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4.5, -7);
      ctx.lineTo(0, -13);
      ctx.lineTo(4.5, -7);
      ctx.fill();
      break;
    case 'power':
      ctx.beginPath();
      ctx.moveTo(-7, 7);
      ctx.lineTo(0, -11);
      ctx.lineTo(7, 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-2.5, 7, 5, 5);
      break;
  }
  ctx.restore();
}

function getHieroglyphTexture(god: EgyptianArchGodKey): THREE.CanvasTexture {
  const cached = _hieroglyphTexCache[god];
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const rand = createRng(god === 'ra' ? 9101 : god === 'isis' ? 9202 : 9303);

  const themes: Record<EgyptianArchGodKey, { bg: string; border: string; ink: string; accent: string }> = {
    ra: { bg: '#e8d4a8', border: '#facc15', ink: '#5c3a1a', accent: '#d97706' },
    isis: { bg: '#e8eef5', border: '#0d9488', ink: '#1e3a5f', accent: '#2dd4bf' },
    set: { bg: '#c48a5e', border: '#b91c1c', ink: '#3f1a0a', accent: '#ea580c' },
  };
  const t = themes[god];

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, 1024, 128);
  ctx.fillStyle = t.border;
  ctx.fillRect(0, 0, 1024, 9);
  ctx.fillRect(0, 119, 1024, 9);

  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(1024, 16);
  ctx.moveTo(0, 112);
  ctx.lineTo(1024, 112);
  ctx.stroke();

  const symbols =
    god === 'ra'
      ? ['sun', 'scarab', 'eye', 'falcon', 'ankh', 'was', 'shen', 'cartouche']
      : god === 'isis'
        ? ['ankh', 'tjet', 'wings', 'throne', 'lotus', 'cobra', 'ankh', 'tjet']
        : ['setAnimal', 'was', 'shield', 'arrow', 'power', 'setAnimal', 'was', 'shield'];

  let px = 28;
  while (px < 990) {
    const sym = symbols[Math.floor(rand() * symbols.length)];
    drawHieroglyph(ctx, sym, px, 64, t.ink, t.accent);
    px += 30 + rand() * 20;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(2.5, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  _hieroglyphTexCache[god] = tex;
  return tex;
}

/* ===================== MATERIAIS POR DIVINDADE (CACHED) ===================== */
interface EgyptArchMatSet {
  stone: THREE.MeshStandardMaterial;
  bright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  sec: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  statue: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  hieroglyph: THREE.MeshStandardMaterial;
  target: THREE.MeshStandardMaterial;
  furnace: THREE.MeshStandardMaterial;
}

const _matSetCache: Partial<Record<EgyptianArchGodKey, EgyptArchMatSet>> = {};

function getEgyptArchMats(god: EgyptianArchGodKey): EgyptArchMatSet {
  const existing = _matSetCache[god];
  if (existing) return existing;

  const th = EGYPT_ARCH_THEMES[god];
  const mats: EgyptArchMatSet = {
    stone: new THREE.MeshStandardMaterial({
      map: getSandstoneTexture(false),
      color: th.stone,
      roughness: 0.65,
      metalness: 0.05,
    }),
    bright: new THREE.MeshStandardMaterial({
      map: getSandstoneTexture(true),
      color: th.bright,
      roughness: 0.5,
      metalness: 0.08,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: th.trim,
      roughness: 0.36,
      metalness: 0.3,
    }),
    sec: new THREE.MeshStandardMaterial({
      color: th.sec,
      roughness: 0.46,
      metalness: 0.2,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: th.gold,
      emissive: 0x3b2200,
      emissiveIntensity: 0.2,
      metalness: 0.9,
      roughness: 0.17,
    }),
    statue: new THREE.MeshStandardMaterial({
      color: th.statue,
      roughness: 0.42,
      metalness: 0.18,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x5a2c14,
      roughness: 0.68,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x1a140e,
      roughness: 0.9,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.75,
      side: THREE.DoubleSide,
    }),
    roof: new THREE.MeshStandardMaterial({
      map: getRoofTexture(),
      roughness: 0.6,
      metalness: 0.07,
    }),
    flame: new THREE.MeshBasicMaterial({
      color: th.glow,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    hieroglyph: new THREE.MeshStandardMaterial({
      map: getHieroglyphTexture(god),
      roughness: 0.55,
      metalness: 0.08,
    }),
    target: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
    }),
    furnace: new THREE.MeshStandardMaterial({
      color: 0x3a1a08,
      emissive: th.glow,
      emissiveIntensity: 1.6,
      roughness: 0.4,
    }),
  };

  _matSetCache[god] = mats;
  return mats;
}

/* ===================== HELPERS DE CONSTRUÇÃO ===================== */
function makeGroup(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function makeBox(
  parent: THREE.Object3D | null,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  shadows = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  if (parent) parent.add(mesh);
  return mesh;
}

function makeCyl(
  parent: THREE.Object3D | null,
  rt: number,
  rb: number,
  h: number,
  seg: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  shadows = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  if (parent) parent.add(mesh);
  return mesh;
}

function buildPylon(
  parent: THREE.Object3D,
  w: number,
  d: number,
  h: number,
  M: EgyptArchMatSet,
  pos: [number, number, number],
  god: EgyptianArchGodKey,
  shadows: boolean,
  vents = true
): THREE.Group {
  const p = makeGroup(parent, pos[0], pos[1], pos[2]);
  const taper = god === 'set' ? 0.84 : 0.88;
  const wT = w * taper;
  const dT = d * taper;
  const rxB = w * 0.5;
  const rzB = d * 0.5;
  const rxT = wT * 0.5;
  const rzT = dT * 0.5;

  const geo = new THREE.BufferGeometry();
  const v = new Float32Array([
    // Frente
    -rxB, 0, rzB, rxB, 0, rzB, rxT, h, rzT,
    -rxB, 0, rzB, rxT, h, rzT, -rxT, h, rzT,
    // Trás
    rxB, 0, -rzB, -rxB, 0, -rzB, -rxT, h, -rzT,
    rxB, 0, -rzB, -rxT, h, -rzT, rxT, h, -rzT,
    // Esquerda
    -rxB, 0, -rzB, -rxB, 0, rzB, -rxT, h, rzT,
    -rxB, 0, -rzB, -rxT, h, rzT, -rxT, h, -rzT,
    // Direita
    rxB, 0, rzB, rxB, 0, -rzB, rxT, h, -rzT,
    rxB, 0, rzB, rxT, h, -rzT, rxT, h, rzT,
    // Topo
    -rxT, h, rzT, rxT, h, rzT, rxT, h, -rzT,
    -rxT, h, rzT, rxT, h, -rzT, -rxT, h, -rzT,
  ]);
  const uv = new Float32Array(60);
  for (let i = 0; i < 30; i++) {
    uv[i * 2] = (v[i * 3] + rxB) / Math.max(0.001, w);
    uv[i * 2 + 1] = v[i * 3 + 1] / Math.max(0.001, h);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.computeVertexNormals();

  const body = new THREE.Mesh(geo, M.bright);
  body.castShadow = shadows;
  body.receiveShadow = shadows;
  p.add(body);

  // Friso hieroglífico no topo do pilone
  makeBox(p, wT + 0.06, 0.14, dT + 0.06, M.hieroglyph, [0, h - 0.1, 0], [0, 0, 0], shadows);
  makeBox(p, wT + 0.2, 0.13, dT + 0.2, M.bright, [0, h + 0.04, 0], [0, 0, 0], shadows);
  makeBox(p, wT + 0.24, 0.07, dT + 0.24, M.trim, [0, h + 0.12, 0], [0, 0, 0], shadows);
  makeBox(p, wT + 0.08, 0.045, dT + 0.08, M.gold, [0, h + 0.17, 0], [0, 0, 0], shadows);

  if (vents) {
    const n = Math.max(2, Math.floor(wT / 0.5));
    for (let i = 0; i < n; i++) {
      const vx = -wT * 0.32 + (n === 1 ? 0 : (i / (n - 1)) * wT * 0.64);
      makeBox(p, 0.14, 0.17, 0.05, M.dark, [vx, h - 0.36, rzT + 0.02], [0, 0, 0], false);
      makeBox(p, 0.14, 0.17, 0.05, M.dark, [vx, h - 0.36, -rzT - 0.02], [0, 0, 0], false);
    }
  }
  return p;
}

function buildWingedSun(
  parent: THREE.Object3D,
  M: EgyptArchMatSet,
  pos: [number, number, number],
  scale: number,
  god: EgyptianArchGodKey,
  shadows: boolean
): THREE.Group {
  const g = makeGroup(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale * (god === 'ra' ? 1.15 : 1));
  const disk = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), M.gold);
  disk.scale.set(1, 1, 0.4);
  disk.castShadow = shadows;
  g.add(disk);
  for (const s of [-1, 1]) {
    makeBox(g, 0.48, 0.11, 0.04, M.gold, [s * 0.32, 0.02, 0], [0, 0, s * 0.09], shadows);
    makeBox(g, 0.4, 0.05, 0.045, M.trim, [s * 0.3, -0.03, 0.01], [0, 0, s * 0.09], shadows);
    makeBox(g, 0.22, 0.035, 0.03, M.gold, [s * 0.42, 0.01, 0], [0, 0, s * 0.15], shadows);
  }
  if (god === 'ra') {
    makeBox(g, 0.04, 0.12, 0.04, M.gold, [0, 0.18, 0], [0, 0, 0], shadows);
  }
  return g;
}

function buildLotusColumn(
  parent: THREE.Object3D,
  h: number,
  M: EgyptArchMatSet,
  pos: [number, number, number],
  shadows: boolean
): THREE.Group {
  const g = makeGroup(parent, pos[0], pos[1], pos[2]);
  makeCyl(g, 0.09, 0.11, h * 0.7, 12, M.bright, [0, h * 0.35, 0], [0, 0, 0], shadows);
  makeCyl(g, 0.16, 0.09, 0.18, 12, M.trim, [0, h * 0.78, 0], [0, 0, 0], shadows);
  makeCyl(g, 0.18, 0.14, 0.08, 12, M.gold, [0, h * 0.88, 0], [0, 0, 0], shadows);
  makeCyl(g, 0.13, 0.11, 0.1, 12, M.gold, [0, 0.05, 0], [0, 0, 0], shadows);
  return g;
}

function buildGuardian(
  parent: THREE.Object3D,
  M: EgyptArchMatSet,
  pos: [number, number, number],
  scale: number,
  god: EgyptianArchGodKey,
  shadows: boolean
): THREE.Group {
  const st = makeGroup(parent, pos[0], pos[1], pos[2]);
  st.scale.setScalar(scale);
  makeBox(st, 0.7, 0.34, 0.7, M.statue, [0, 0.17, 0], [0, 0, 0], shadows);
  makeBox(st, 0.76, 0.07, 0.76, M.trim, [0, 0.36, 0], [0, 0, 0], shadows);
  makeBox(st, 0.72, 0.05, 0.72, M.gold, [0, 0.42, 0], [0, 0, 0], shadows);

  const fig = makeGroup(st, 0, 0.44, 0);
  makeCyl(fig, 0.075, 0.06, 0.55, 10, M.statue, [-0.1, 0.28, 0.05], [-0.08, 0, 0], shadows);
  makeCyl(fig, 0.075, 0.06, 0.55, 10, M.statue, [0.1, 0.28, -0.04], [0.06, 0, 0], shadows);
  makeCyl(fig, 0.16, 0.2, 0.34, 12, M.trim, [0, 0.58, 0], [0, 0, 0], shadows);
  makeBox(fig, 0.34, 0.06, 0.24, M.gold, [0, 0.74, 0], [0, 0, 0], shadows);
  makeBox(fig, 0.38, 0.42, 0.22, M.statue, [0, 0.96, 0], [0, 0, 0], shadows);
  makeCyl(fig, 0.18, 0.2, 0.08, 12, M.gold, [0, 1.14, 0], [0, 0, 0], shadows);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 14), M.statue);
  head.position.set(0, 1.3, 0.02);
  head.castShadow = shadows;
  fig.add(head);
  makeBox(fig, 0.32, 0.28, 0.22, M.gold, [0, 1.24, -0.02], [0, 0, 0], shadows);

  if (god === 'ra') {
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), M.gold);
    sun.scale.set(1, 1, 0.32);
    sun.position.set(0, 1.54, 0.02);
    fig.add(sun);
  } else if (god === 'isis') {
    makeBox(fig, 0.03, 0.26, 0.03, M.gold, [-0.14, 1.5, 0.02], [0, 0, -0.28], shadows);
    makeBox(fig, 0.03, 0.26, 0.03, M.gold, [0.14, 1.5, 0.02], [0, 0, 0.28], shadows);
    const disk = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), M.gold);
    disk.position.set(0, 1.62, 0.02);
    fig.add(disk);
  } else {
    makeBox(fig, 0.055, 0.055, 0.26, M.statue, [0, 1.28, 0.16], [0, 0, 0], shadows);
    makeBox(fig, 0.035, 0.28, 0.05, M.gold, [-0.08, 1.48, -0.02], [0, 0, 0], shadows);
    makeBox(fig, 0.035, 0.28, 0.05, M.gold, [0.08, 1.48, -0.02], [0, 0, 0], shadows);
  }
  makeCyl(fig, 0.02, 0.02, 1.7, 8, M.gold, [0.26, 0.9, 0.12], [0.12, 0, 0], shadows);
  return st;
}

function buildBrazier(
  parent: THREE.Object3D,
  M: EgyptArchMatSet,
  pos: [number, number, number],
  scale: number,
  flames: THREE.Mesh[],
  shadows: boolean
): THREE.Group {
  const g = makeGroup(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);
  makeCyl(g, 0.15, 0.2, 0.1, 12, M.gold, [0, 0.05, 0], [0, 0, 0], shadows);
  makeCyl(g, 0.05, 0.07, 0.45, 10, M.gold, [0, 0.32, 0], [0, 0, 0], shadows);
  makeCyl(g, 0.26, 0.14, 0.15, 14, M.gold, [0, 0.6, 0], [0, 0, 0], shadows);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 10), M.flame);
  flame.position.set(0, 0.88, 0);
  g.add(flame);
  flames.push(flame);
  return g;
}

function addHieroglyphBand(
  parent: THREE.Object3D,
  M: EgyptArchMatSet,
  w: number,
  h: number,
  d: number,
  y: number,
  z = 0,
  shadows = true
): void {
  makeBox(parent, w, h, d, M.hieroglyph, [0, y, z], [0, 0, 0], shadows);
}

function addTeamBannerPair(
  parent: THREE.Object3D,
  M: EgyptArchMatSet,
  teamMat: THREE.Material,
  offsetX: number,
  baseY: number,
  offsetZ: number,
  height: number,
  shadows: boolean
): void {
  for (const side of [-1, 1]) {
    makeCyl(
      parent,
      0.032,
      0.04,
      height,
      8,
      M.gold,
      [side * offsetX, baseY + height * 0.5, offsetZ],
      [0, 0, 0],
      shadows
    );
    makeBox(
      parent,
      0.34,
      height * 0.42,
      0.04,
      teamMat,
      [side * offsetX, baseY + height * 0.72, offsetZ + 0.04],
      [0, 0, 0],
      shadows
    );
  }
}

/* ===================== BUILDERS DAS 6 CONSTRUÇÕES ===================== */

function buildBarracksMesh(
  tier: number,
  god: EgyptianArchGodKey,
  M: EgyptArchMatSet,
  flames: THREE.Mesh[],
  shadows: boolean,
  teamBannerMat?: THREE.Material
): THREE.Group {
  const root = new THREE.Group();
  const t = Math.max(2, Math.min(5, tier));
  const s = 1 + (t - 2) * 0.11;
  const isRa = god === 'ra';
  const isIsis = god === 'isis';
  const isSet = god === 'set';

  makeBox(root, 4.6 * s, 0.24, 4.0 * s, M.sec, [0, 0.12, 0], [0, 0, 0], shadows);
  makeBox(root, 4.4 * s, 0.14, 3.8 * s, M.stone, [0, 0.28, 0], [0, 0, 0], shadows);
  for (let i = 0; i < 3; i++) {
    makeBox(root, (2.2 - i * 0.15) * s, 0.08, 0.4 * s, M.bright, [0, 0.08 + i * 0.08, 2.05 * s - i * 0.12], [0, 0, 0], shadows);
  }

  const bodyH = 1.9 + (t - 2) * 0.32;
  makeBox(root, 3.6 * s, bodyH, 2.8 * s, M.bright, [0, 0.35 + bodyH / 2, 0], [0, 0, 0], shadows);

  // Friso de hieróglifos no topo
  addHieroglyphBand(root, M, 3.7 * s, 0.18, 2.9 * s, 0.35 + bodyH + 0.08, 0, shadows);
  makeBox(root, 3.55 * s, 0.05, 2.75 * s, M.gold, [0, 0.35 + bodyH + 0.18, 0], [0, 0, 0], shadows);

  if (t >= 3) {
    const ph = 2.2 + (t - 3) * 0.35;
    const pw = isSet ? 1.25 : 1.15;
    buildPylon(root, pw * s, 0.95 * s, ph, M, [-1.7 * s, 0.35, 1.55 * s], god, shadows);
    buildPylon(root, pw * s, 0.95 * s, ph, M, [1.7 * s, 0.35, 1.55 * s], god, shadows);
  }

  makeBox(root, 1.35 * s, 1.7 * s, 0.32 * s, M.stone, [0, 1.0 * s, 1.5 * s], [0, 0, 0], shadows);
  makeBox(root, 1.0 * s, 1.4 * s, 0.36 * s, M.wood, [0, 0.85 * s, 1.52 * s], [0, 0, 0], shadows);
  makeBox(root, 0.07 * s, 1.4 * s, 0.38 * s, M.gold, [0, 0.85 * s, 1.54 * s], [0, 0, 0], shadows);
  makeBox(root, 0.12 * s, 1.7 * s, 0.15 * s, M.gold, [-0.6 * s, 1.0 * s, 1.55 * s], [0, 0, 0], shadows);
  makeBox(root, 0.12 * s, 1.7 * s, 0.15 * s, M.gold, [0.6 * s, 1.0 * s, 1.55 * s], [0, 0, 0], shadows);

  if (t >= 3) {
    buildWingedSun(root, M, [0, 1.95 * s, 1.65 * s], 0.95 + (t - 3) * 0.08, god, shadows);
    if (isIsis) {
      buildLotusColumn(root, 1.9 * s, M, [-1.1 * s, 0.35, 1.1 * s], shadows);
      buildLotusColumn(root, 1.9 * s, M, [1.1 * s, 0.35, 1.1 * s], shadows);
    } else {
      makeCyl(root, 0.1 * s, 0.12 * s, 1.9 * s, 12, M.bright, [-1.1 * s, 1.2 * s, 1.1 * s], [0, 0, 0], shadows);
      makeCyl(root, 0.1 * s, 0.12 * s, 1.9 * s, 12, M.bright, [1.1 * s, 1.2 * s, 1.1 * s], [0, 0, 0], shadows);
      makeCyl(root, 0.14 * s, 0.14 * s, 0.12, 12, M.gold, [-1.1 * s, 2.15 * s, 1.1 * s], [0, 0, 0], shadows);
      makeCyl(root, 0.14 * s, 0.14 * s, 0.12, 12, M.gold, [1.1 * s, 2.15 * s, 1.1 * s], [0, 0, 0], shadows);
    }
  }

  for (const sx of [-1.15, 1.15]) {
    makeBox(root, 0.4 * s, 0.5 * s, 0.07 * s, M.gold, [sx * s, 1.25 * s, 1.45 * s], [0, 0, 0], shadows);
    if (isRa) {
      makeBox(root, 0.18 * s, 0.18 * s, 0.08 * s, M.trim, [sx * s, 1.25 * s, 1.48 * s], [0, 0, 0], shadows);
    }
  }

  if (t >= 4) {
    buildGuardian(root, M, [2.25 * s, 0.35, 0.9 * s], 1.0, god, shadows);
    if (t >= 5) {
      buildGuardian(root, M, [-2.25 * s, 0.35, 0.9 * s], 1.0, god, shadows);
    }
  }

  if (isSet && t >= 3) {
    buildBrazier(root, M, [-2.0 * s, 0.35, 1.8 * s], 0.9, flames, shadows);
    buildBrazier(root, M, [2.0 * s, 0.35, 1.8 * s], 0.9, flames, shadows);
  }

  if (isIsis && t >= 3) {
    for (const [px, pz] of [
      [-1.8, 1.9],
      [1.8, 1.9],
      [-2.1, 0.4],
      [2.1, 0.4],
    ]) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 5), M.foliage);
      leaf.position.set(px * s, 0.55, pz * s);
      leaf.rotation.x = 0.3;
      leaf.castShadow = shadows;
      root.add(leaf);
    }
  }

  if (t >= 5) {
    for (const sx of [-1.9, 1.9]) {
      makeCyl(root, 0.06 * s, 0.09 * s, 1.1 * s, 6, M.bright, [sx * s, 2.6 * s, -0.3 * s], [0, 0, 0], shadows);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12 * s, 0.28 * s, 4), M.gold);
      tip.position.set(sx * s, 3.3 * s, -0.3 * s);
      tip.castShadow = shadows;
      root.add(tip);
    }
  }

  if (teamBannerMat) {
    addTeamBannerPair(root, M, teamBannerMat, 1.05 * s, 0.35, 1.88 * s, 1.65 * s, shadows);
  }

  return root;
}

function buildStablesMesh(
  tier: number,
  god: EgyptianArchGodKey,
  M: EgyptArchMatSet,
  flames: THREE.Mesh[],
  shadows: boolean,
  teamBannerMat?: THREE.Material
): THREE.Group {
  const root = new THREE.Group();
  const t = Math.max(2, Math.min(5, tier));
  const s = 1 + (t - 2) * 0.1;
  const isIsis = god === 'isis';
  const isSet = god === 'set';

  makeBox(root, 5.4 * s, 0.2, 3.9 * s, M.sec, [0, 0.1, 0], [0, 0, 0], shadows);
  makeBox(root, 5.2 * s, 0.12, 3.7 * s, M.stone, [0, 0.24, 0], [0, 0, 0], shadows);
  makeBox(root, 4.8 * s, 1.55 + (t - 2) * 0.22, 2.5 * s, M.bright, [0, 1.05 + (t - 2) * 0.1, -0.25 * s], [0, 0, 0], shadows);

  for (let i = -2; i <= 2; i++) {
    if (isIsis) {
      buildLotusColumn(root, 1.75 + (t - 2) * 0.18, M, [i * 0.95 * s, 0.24, 1.35 * s], shadows);
    } else {
      makeCyl(root, 0.09 * s, 0.11 * s, 1.75 + (t - 2) * 0.18, 11, M.bright, [i * 0.95 * s, 1.05, 1.35 * s], [0, 0, 0], shadows);
    }
  }

  makeBox(root, 5.0 * s, 0.13, 2.9 * s, M.roof, [0, 2.0 + (t - 2) * 0.18, 0.15 * s], [0, 0, 0], shadows);
  addHieroglyphBand(root, M, 5.1 * s, 0.14, 3.0 * s, 2.15 + (t - 2) * 0.18, 0.15 * s, shadows);

  makeBox(root, 1.5 * s, 1.25 * s, 0.09 * s, M.wood, [0, 0.8, 1.55 * s], [0, 0, 0], shadows);
  makeBox(root, 0.06 * s, 1.25 * s, 0.11 * s, M.gold, [0, 0.8, 1.57 * s], [0, 0, 0], shadows);

  if (t >= 3) {
    buildWingedSun(root, M, [0, 2.25 + (t - 2) * 0.15, 1.5 * s], 0.85, god, shadows);
  }
  if (t >= 4) {
    buildPylon(root, 0.95 * s, 0.8 * s, 1.9, M, [-2.4 * s, 0.24, 1.5 * s], god, shadows, false);
    buildPylon(root, 0.95 * s, 0.8 * s, 1.9, M, [2.4 * s, 0.24, 1.5 * s], god, shadows, false);
  }
  if (isSet && t >= 3) {
    buildBrazier(root, M, [-2.5 * s, 0.24, 1.9 * s], 0.85, flames, shadows);
    buildBrazier(root, M, [2.5 * s, 0.24, 1.9 * s], 0.85, flames, shadows);
  }

  if (teamBannerMat) {
    addTeamBannerPair(root, M, teamBannerMat, 1.45 * s, 0.24, 1.72 * s, 1.55 * s, shadows);
  }

  return root;
}

function buildArcheryMesh(
  tier: number,
  god: EgyptianArchGodKey,
  M: EgyptArchMatSet,
  flames: THREE.Mesh[],
  shadows: boolean,
  teamBannerMat?: THREE.Material
): THREE.Group {
  const root = new THREE.Group();
  const t = Math.max(2, Math.min(5, tier));
  const s = 1 + (t - 2) * 0.1;
  const isIsis = god === 'isis';
  const isSet = god === 'set';

  makeBox(root, 4.9 * s, 0.18, 4.5 * s, M.sec, [0, 0.09, 0], [0, 0, 0], shadows);
  makeBox(root, 4.7 * s, 0.12, 4.3 * s, M.stone, [0, 0.22, 0], [0, 0, 0], shadows);
  makeBox(root, 3.4 * s, 1.55 + (t - 2) * 0.28, 1.9 * s, M.bright, [0, 1.05 + (t - 2) * 0.12, -0.7 * s], [0, 0, 0], shadows);

  for (const sx of [-1.35, -0.45, 0.45, 1.35]) {
    if (isIsis) {
      buildLotusColumn(root, 1.7 + (t - 2) * 0.2, M, [sx * s, 0.22, 0.75 * s], shadows);
    } else {
      makeCyl(root, 0.085 * s, 0.1 * s, 1.7 + (t - 2) * 0.2, 11, M.bright, [sx * s, 1.0, 0.75 * s], [0, 0, 0], shadows);
    }
  }
  addHieroglyphBand(root, M, 3.0 * s, 0.14, 0.55 * s, 1.95 + (t - 2) * 0.2, 0.75 * s, shadows);

  const count = t >= 4 ? 4 : 2;
  for (let i = 0; i < count; i++) {
    const tx = (i % 2 ? -1.4 : 1.4) * s;
    const tz = (i < 2 ? 1.7 : 2.35) * s;
    makeCyl(root, 0.38 * s, 0.38 * s, 0.07, 16, M.target, [tx, 0.85, tz], [Math.PI / 2, 0, 0], shadows);
    makeCyl(root, 0.13 * s, 0.13 * s, 0.08, 12, M.gold, [tx, 0.85, tz], [Math.PI / 2, 0, 0], shadows);
  }

  if (t >= 3) {
    buildWingedSun(root, M, [0, 2.2 + (t - 2) * 0.15, 0.95 * s], 0.9, god, shadows);
  }
  if (t >= 4) {
    buildPylon(root, 1.0 * s, 0.85 * s, 2.1, M, [-2.0 * s, 0.22, 1.5 * s], god, shadows);
    buildPylon(root, 1.0 * s, 0.85 * s, 2.1, M, [2.0 * s, 0.22, 1.5 * s], god, shadows);
  }
  if (isSet && t >= 3) {
    buildBrazier(root, M, [-2.1 * s, 0.22, 2.0 * s], 0.82, flames, shadows);
    buildBrazier(root, M, [2.1 * s, 0.22, 2.0 * s], 0.82, flames, shadows);
  }

  if (teamBannerMat) {
    addTeamBannerPair(root, M, teamBannerMat, 1.65 * s, 0.22, 1.15 * s, 1.5 * s, shadows);
  }

  return root;
}

function buildHouseMesh(
  tier: number,
  god: EgyptianArchGodKey,
  M: EgyptArchMatSet,
  flames: THREE.Mesh[],
  shadows: boolean,
  teamBannerMat?: THREE.Material
): THREE.Group {
  const root = new THREE.Group();
  const t = Math.max(1, Math.min(5, tier));
  const s = 0.82 + t * 0.09;
  const isIsis = god === 'isis';
  const isSet = god === 'set';

  makeBox(root, 2.8 * s, 0.18, 2.6 * s, M.sec, [0, 0.09, 0], [0, 0, 0], shadows);
  makeBox(root, 2.65 * s, 0.1, 2.45 * s, M.stone, [0, 0.22, 0], [0, 0, 0], shadows);

  const bodyH = 1.15 + (t - 1) * 0.3;
  makeBox(root, 2.25 * s, bodyH, 2.05 * s, M.bright, [0, 0.28 + bodyH / 2, 0], [0, 0, 0], shadows);
  makeBox(root, 0.6 * s, 0.95 * s, 0.08 * s, M.wood, [0, 0.72, 1.08 * s], [0, 0, 0], shadows);
  if (t >= 2) {
    makeBox(root, 0.05 * s, 0.95 * s, 0.1 * s, M.gold, [0, 0.72, 1.1 * s], [0, 0, 0], shadows);
    for (const sx of [-0.75, 0.75]) {
      makeBox(root, 0.3 * s, 0.34 * s, 0.06 * s, M.dark, [sx * s, 1.15, 1.05 * s], [0, 0, 0], false);
    }
  }

  addHieroglyphBand(root, M, 2.4 * s, 0.12, 2.2 * s, 0.28 + bodyH + 0.06, 0, shadows);

  if (t >= 3) {
    makeBox(root, 2.3 * s, 0.05, 2.1 * s, M.gold, [0, 0.28 + bodyH + 0.14, 0], [0, 0, 0], shadows);
    if (isIsis) {
      buildLotusColumn(root, bodyH * 0.95, M, [-1.2 * s, 0.28, 1.0 * s], shadows);
      buildLotusColumn(root, bodyH * 0.95, M, [1.2 * s, 0.28, 1.0 * s], shadows);
    } else {
      makeCyl(root, 0.08 * s, 0.1 * s, bodyH * 0.95, 10, M.bright, [-1.2 * s, 0.28 + bodyH * 0.45, 1.0 * s], [0, 0, 0], shadows);
      makeCyl(root, 0.08 * s, 0.1 * s, bodyH * 0.95, 10, M.bright, [1.2 * s, 0.28 + bodyH * 0.45, 1.0 * s], [0, 0, 0], shadows);
    }
  }

  if (t >= 4) {
    buildPylon(root, 0.75 * s, 0.65 * s, 1.55, M, [-1.5 * s, 0.22, 0.4 * s], god, shadows, false);
    buildPylon(root, 0.75 * s, 0.65 * s, 1.55, M, [1.5 * s, 0.22, 0.4 * s], god, shadows, false);
  }

  if (t >= 5) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.38 * s, 0.6 * s, 4), M.gold);
    cone.rotation.y = Math.PI / 4;
    cone.position.set(0, 0.28 + bodyH + 0.4, 0);
    cone.castShadow = shadows;
    root.add(cone);
    buildWingedSun(root, M, [0, 0.28 + bodyH + 0.12, 1.15 * s], 0.75, god, shadows);
  }

  if (isSet && t >= 3) {
    buildBrazier(root, M, [0, 0.28, 1.4 * s], 0.7, flames, shadows);
  }

  if (isIsis && t >= 3) {
    for (const sx of [-1.3, 1.3]) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 5), M.foliage);
      leaf.position.set(sx * s, 0.5, 1.3 * s);
      leaf.castShadow = shadows;
      root.add(leaf);
    }
  }

  if (teamBannerMat) {
    // Discreta faixa de cor do jogador acima da entrada da casa
    makeBox(root, 0.68 * s, 0.1 * s, 0.1 * s, teamBannerMat, [0, 1.24 * s, 1.08 * s], [0, 0, 0], shadows);
  }

  return root;
}

function buildMarketMesh(
  tier: number,
  god: EgyptianArchGodKey,
  M: EgyptArchMatSet,
  flames: THREE.Mesh[],
  shadows: boolean,
  teamBannerMat?: THREE.Material
): THREE.Group {
  const root = new THREE.Group();
  const t = Math.max(2, Math.min(5, tier));
  const s = 1 + (t - 2) * 0.1;
  const isIsis = god === 'isis';
  const isSet = god === 'set';

  makeBox(root, 5.5 * s, 0.18, 4.0 * s, M.sec, [0, 0.09, 0], [0, 0, 0], shadows);
  makeBox(root, 5.3 * s, 0.12, 3.8 * s, M.stone, [0, 0.22, 0], [0, 0, 0], shadows);

  for (let i = -2; i <= 2; i++) {
    if (isIsis) {
      buildLotusColumn(root, 1.8 + (t - 2) * 0.22, M, [i * 0.95 * s, 0.22, 1.3 * s], shadows);
    } else {
      makeCyl(root, 0.09 * s, 0.11 * s, 1.8 + (t - 2) * 0.22, 12, M.bright, [i * 0.95 * s, 1.05, 1.3 * s], [0, 0, 0], shadows);
    }
  }

  addHieroglyphBand(root, M, 4.9 * s, 0.14, 0.65 * s, 2.05 + (t - 2) * 0.22, 1.3 * s, shadows);
  makeBox(root, 4.5 * s, 1.55 + (t - 2) * 0.28, 2.1 * s, M.bright, [0, 1.05 + (t - 2) * 0.12, -0.55 * s], [0, 0, 0], shadows);

  for (let i = -1; i <= 1; i++) {
    makeBox(root, 0.75 * s, 0.38 * s, 0.55 * s, M.wood, [i * 1.4 * s, 0.48, 0.7 * s], [0, 0, 0], shadows);
    makeCyl(root, 0.13 * s, 0.16 * s, 0.42 * s, 10, M.sec, [i * 1.4 * s + 0.38 * s, 0.55, 0.35 * s], [0, 0, 0], shadows);
  }

  if (t >= 3) {
    buildWingedSun(root, M, [0, 2.25 + (t - 2) * 0.2, 1.4 * s], 0.95, god, shadows);
  }
  if (t >= 4) {
    buildPylon(root, 0.9 * s, 0.75 * s, 2.0, M, [-2.5 * s, 0.22, 0.9 * s], god, shadows, false);
    buildPylon(root, 0.9 * s, 0.75 * s, 2.0, M, [2.5 * s, 0.22, 0.9 * s], god, shadows, false);
  }
  if (isSet && t >= 3) {
    buildBrazier(root, M, [-2.4 * s, 0.22, 1.65 * s], 0.82, flames, shadows);
    buildBrazier(root, M, [2.4 * s, 0.22, 1.65 * s], 0.82, flames, shadows);
  }

  if (teamBannerMat) {
    addTeamBannerPair(root, M, teamBannerMat, 1.85 * s, 0.22, 1.62 * s, 1.55 * s, shadows);
  }

  return root;
}

function buildForgeMesh(
  tier: number,
  god: EgyptianArchGodKey,
  M: EgyptArchMatSet,
  flames: THREE.Mesh[],
  shadows: boolean,
  teamBannerMat?: THREE.Material
): THREE.Group {
  const root = new THREE.Group();
  const t = Math.max(2, Math.min(5, tier));
  const s = 1 + (t - 2) * 0.1;
  const isSet = god === 'set';

  makeBox(root, 4.3 * s, 0.2, 3.7 * s, M.sec, [0, 0.1, 0], [0, 0, 0], shadows);
  makeBox(root, 4.1 * s, 0.12, 3.5 * s, M.stone, [0, 0.24, 0], [0, 0, 0], shadows);
  makeBox(root, 3.5 * s, 1.75 + (t - 2) * 0.28, 2.55 * s, M.bright, [0, 1.15 + (t - 2) * 0.12, 0], [0, 0, 0], shadows);
  addHieroglyphBand(root, M, 3.6 * s, 0.16, 2.65 * s, 2.1 + (t - 2) * 0.14, 0, shadows);

  // Fornalha incandescente e chaminé
  makeBox(root, 1.2 * s, 0.95 * s, 1.0 * s, M.furnace, [0, 0.85, 1.35 * s], [0, 0, 0], shadows);
  makeBox(root, 1.0 * s, 0.65 * s, 0.8 * s, M.dark, [0, 0.75, 1.4 * s], [0, 0, 0], false);
  makeCyl(root, 0.24 * s, 0.3 * s, 1.9 + (t - 2) * 0.28, 11, M.stone, [0, 2.3 + (t - 2) * 0.12, 1.15 * s], [0, 0, 0], shadows);
  makeCyl(root, 0.32 * s, 0.32 * s, 0.14, 11, M.trim, [0, 3.25 + (t - 2) * 0.12, 1.15 * s], [0, 0, 0], shadows);

  // Bigorna dourada
  makeBox(root, 0.55 * s, 0.28 * s, 0.32 * s, M.gold, [1.2 * s, 0.48, 1.05 * s], [0, 0, 0], shadows);
  makeBox(root, 0.16 * s, 0.38 * s, 0.16 * s, M.sec, [1.2 * s, 0.3, 1.05 * s], [0, 0, 0], shadows);

  // Portão
  makeBox(root, 1.1 * s, 1.45 * s, 0.22 * s, M.wood, [0, 0.95, 1.55 * s], [0, 0, 0], shadows);
  if (t >= 3) {
    makeBox(root, 0.06 * s, 1.45 * s, 0.24 * s, M.gold, [0, 0.95, 1.57 * s], [0, 0, 0], shadows);
    buildWingedSun(root, M, [0, 2.15 + (t - 2) * 0.15, 1.65 * s], 0.85, god, shadows);
  }
  if (t >= 4) {
    buildPylon(root, 0.95 * s, 0.8 * s, 2.1, M, [-1.9 * s, 0.24, 1.45 * s], god, shadows, false);
    buildPylon(root, 0.95 * s, 0.8 * s, 2.1, M, [1.9 * s, 0.24, 1.45 * s], god, shadows, false);
  }
  if (isSet) {
    buildBrazier(root, M, [-1.6 * s, 0.24, 1.8 * s], 0.9, flames, shadows);
    buildBrazier(root, M, [1.6 * s, 0.24, 1.8 * s], 0.9, flames, shadows);
  }

  if (teamBannerMat) {
    addTeamBannerPair(root, M, teamBannerMat, 1.42 * s, 0.24, 1.72 * s, 1.55 * s, shadows);
  }

  return root;
}

/* ===================== EXPORT PRINCIPAL ===================== */

export interface EgyptianArchBuildResult {
  root: THREE.Group;
  flames: THREE.Mesh[];
  furnaceMat: THREE.MeshStandardMaterial;
  theme: EgyptianArchTheme;
  meta: EgyptianArchBuildingMeta;
  effectiveTier: number;
  title: string;
  subtitle: string;
}

export function buildEgyptianArchBuilding(
  buildingKey: EgyptianArchBuildingKey,
  god: EgyptianArchGodKey,
  tier: number,
  enableShadows = true,
  teamBannerMat?: THREE.Material
): EgyptianArchBuildResult {
  const theme = EGYPT_ARCH_THEMES[god];
  const meta = EGYPT_ARCH_BUILDING_META[buildingKey];
  const effectiveTier = Math.max(meta.minTier, Math.min(5, Math.round(tier)));
  const M = getEgyptArchMats(god);
  const flames: THREE.Mesh[] = [];

  let root: THREE.Group;
  switch (buildingKey) {
    case 'barracks':
      root = buildBarracksMesh(effectiveTier, god, M, flames, enableShadows, teamBannerMat);
      break;
    case 'stable':
      root = buildStablesMesh(effectiveTier, god, M, flames, enableShadows, teamBannerMat);
      break;
    case 'archery_range':
      root = buildArcheryMesh(effectiveTier, god, M, flames, enableShadows, teamBannerMat);
      break;
    case 'house':
      root = buildHouseMesh(effectiveTier, god, M, flames, enableShadows, teamBannerMat);
      break;
    case 'market':
      root = buildMarketMesh(effectiveTier, god, M, flames, enableShadows, teamBannerMat);
      break;
    case 'armory':
      root = buildForgeMesh(effectiveTier, god, M, flames, enableShadows, teamBannerMat);
      break;
  }

  const eraName = EGYPT_ARCH_ERA_NAMES[effectiveTier] || `Era ${effectiveTier}`;
  const title = `${meta.label} ${theme.title} • Tier ${effectiveTier} (${eraName})`;
  const subtitle = theme.subtitle;

  return {
    root,
    flames,
    furnaceMat: M.furnace,
    theme,
    meta,
    effectiveTier,
    title,
    subtitle,
  };
}
