import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { buildBrgHopliteGeometry, evaluateBrgClip, remapUvRegion64 } from '../../game/brgAnimation';
import { GreekWeaponStyle, HopliteAnimator } from './hopliteAnimator';

export type HopliteArmorTier = 1 | 2 | 3 | 4;
export type HopliteRenderMode = '3d' | 'brg' | 'uv2d' | 'sprite';
export type GreekWarriorKind = 'hoplite' | 'hipaspist' | 'myrmidon';

export interface HopliteUvTierSpec {
  tier: HopliteArmorTier;
  id: string;
  name: string;
  subtitle: string;
  url: string;
  armorHex: number;
  accentHex: number;
  greaveHex: number;
  metalness?: number;
  roughness?: number;
  shieldRimHex?: number;
  shieldBgHex?: number;
  boltColorHex?: number;
  crestColorHex?: number;
  cloakColorHex?: number;
  electricGlow?: number;
}

export const AOM_HOPLITE_UV_TIERS: Record<HopliteArmorTier, HopliteUvTierSpec> = {
  1: {
    tier: 1,
    id: 'map_01',
    name: 'Hoplita Padrão (Map 01)',
    subtitle: 'Era Arcaica / Clássica — Couraça de Couro (Linothorax) & Bronze Simples',
    url: '/assets/aistudio/infantry_g_hoplite_map_01_66c270c4.png',
    armorHex: 0xb4783c,
    accentHex: 0xd97706,
    greaveHex: 0x8b5a2b,
    metalness: 0.45,
    roughness: 0.55,
    shieldRimHex: 0x92400e,
    shieldBgHex: 0x1e3a8a,
    boltColorHex: 0xd97706,
    crestColorHex: 0xdc2626,
    cloakColorHex: 0x1d4ed8,
    electricGlow: 0.0,
  },
  2: {
    tier: 2,
    id: 'map_02',
    name: 'Hoplita Médio (Map 02)',
    subtitle: 'Era Heroica — Peitoral de Bronze Forjado, Ombreiras & Crista Dupla',
    url: '/assets/aistudio/infantry_g_hoplite_map_02_e1e4f7fd.png',
    armorHex: 0xc88b22,
    accentHex: 0xf59e0b,
    greaveHex: 0xb47828,
    metalness: 0.78,
    roughness: 0.32,
    shieldRimHex: 0xd97706,
    shieldBgHex: 0x1e40af,
    boltColorHex: 0xfacc15,
    crestColorHex: 0x2563eb,
    cloakColorHex: 0x1e3a8a,
    electricGlow: 0.25,
  },
  3: {
    tier: 3,
    id: 'map_03',
    name: 'Hoplita Pesado (Map 03)',
    subtitle: 'Era Mítica — Couraça Muscular & Grevas de Ouro Olímpico',
    url: '/assets/aistudio/infantry_g_hoplite_map_03_fb1ce0e0.png',
    armorHex: 0xfacc15,
    accentHex: 0xfef08a,
    greaveHex: 0xeab308,
    metalness: 0.9,
    roughness: 0.22,
    shieldRimHex: 0xfacc15,
    shieldBgHex: 0x0f172a,
    boltColorHex: 0xfef08a,
    crestColorHex: 0xfacc15,
    cloakColorHex: 0x7f1d1d,
    electricGlow: 0.8,
  },
  4: {
    tier: 4,
    id: 'map_04',
    name: 'Hoplita Campeão (Map 04)',
    subtitle: 'Era dos Titãs — Armadura Muscular de Prata Divina, Aço & Raio de Zeus',
    url: '/assets/aistudio/infantry_g_hoplite_map_04_2dddf78e.png',
    armorHex: 0xe2e8f0,
    accentHex: 0x38bdf8,
    greaveHex: 0xcbd5e1,
    metalness: 0.95,
    roughness: 0.16,
    shieldRimHex: 0x38bdf8,
    shieldBgHex: 0x090d16,
    boltColorHex: 0x7dd3fc,
    crestColorHex: 0x38bdf8,
    cloakColorHex: 0x0c4a6e,
    electricGlow: 1.5,
  },
};

export interface UvAtlasRegionInfo {
  id: string;
  label: string;
  description: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
}

export const HOPLITE_UV_REGIONS: UvAtlasRegionInfo[] = [
  {
    id: 'face',
    label: 'Rosto & Cabeça',
    description: 'Olhos, sobrancelhas, nariz, boca e queixo do guerreiro (14,26 → 23,42)',
    x0: 14,
    y0: 26,
    x1: 23,
    y1: 42,
    color: '#38bdf8',
  },
  {
    id: 'cuirass',
    label: 'Torso & Couraça Muscular',
    description: 'Peitoral anatômico que evolui de couro/bronze (01/02) para Ouro (03) e Prata (04)',
    x0: 42,
    y0: 24,
    x1: 63,
    y1: 51,
    color: '#facc15',
  },
  {
    id: 'pteruges',
    label: 'Faldão Pteruges (Couro)',
    description: 'Tiras de couro cravadas com tachas metálicas na cintura (1,43 → 36,52)',
    x0: 1,
    y0: 43,
    x1: 36,
    y1: 52,
    color: '#f97316',
  },
  {
    id: 'chiton',
    label: 'Túnica Chiton Pregueada',
    description: 'Barra inferior de linho pregueado sob o faldão (1,52 → 35,63)',
    x0: 1,
    y0: 52,
    x1: 35,
    y1: 63,
    color: '#e2e8f0',
  },
  {
    id: 'greaves',
    label: 'Cnêmides (Grevas / Caneleiras)',
    description: 'Proteção de canela em couro, bronze, ouro ou prata (5,16 → 13,25)',
    x0: 5,
    y0: 16,
    x1: 13,
    y1: 25,
    color: '#a855f7',
  },
  {
    id: 'back',
    label: 'Costas & Escápulas',
    description: 'Musculatura dorsal superior (1,1 → 17,15)',
    x0: 1,
    y0: 1,
    x1: 17,
    y1: 15,
    color: '#4ade80',
  },
  {
    id: 'arms',
    label: 'Braços & Ombros',
    description: 'Bíceps e antebraços musculosos (2,27 → 13,36)',
    x0: 2,
    y0: 27,
    x1: 13,
    y1: 36,
    color: '#fb7185',
  },
  {
    id: 'thighs',
    label: 'Coxas & Joelhos',
    description: 'Pernas superiores e articulação do joelho (44,52 → 58,63)',
    x0: 44,
    y0: 52,
    x1: 58,
    y1: 63,
    color: '#2dd4bf',
  },
  {
    id: 'sandals',
    label: 'Sandálias Espartanas',
    description: 'Tiras de couro trançadas nos pés e tornozelos (29,1 → 54,11)',
    x0: 29,
    y0: 1,
    x1: 54,
    y1: 11,
    color: '#fbbf24',
  },
];

const textureLoader = new THREE.TextureLoader();
let cachedSpriteTexture: THREE.Texture | null = null;
let cachedArmorBump: THREE.CanvasTexture | null = null;
const cachedUvTextures = new Map<HopliteArmorTier, THREE.Texture>();
const cachedUvImages = new Map<HopliteArmorTier, HTMLImageElement>();
const cachedPaperDollSheets = new Map<string, THREE.CanvasTexture>();
const cachedShieldTextures = new Map<string, THREE.CanvasTexture>();
const cachedCapeTextures = new Map<string, THREE.CanvasTexture>();

export function getHopliteUvTexture(tier: HopliteArmorTier = 3): THREE.Texture {
  const existing = cachedUvTextures.get(tier);
  if (existing) return existing;

  const spec = AOM_HOPLITE_UV_TIERS[tier] ?? AOM_HOPLITE_UV_TIERS[3];
  const tex = textureLoader.load(spec.url, (loaded) => {
    if (loaded.image) {
      cachedUvImages.set(tier, loaded.image as HTMLImageElement);
    }
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  cachedUvTextures.set(tier, tex);
  return tex;
}

function getHopliteSpriteTexture(): THREE.Texture {
  if (!cachedSpriteTexture) {
    cachedSpriteTexture = textureLoader.load('/assets/hoplita-iso.png');
    cachedSpriteTexture.colorSpace = THREE.SRGBColorSpace;
    cachedSpriteTexture.magFilter = THREE.NearestFilter;
    cachedSpriteTexture.minFilter = THREE.LinearMipmapLinearFilter;
    cachedSpriteTexture.wrapS = THREE.ClampToEdgeWrapping;
    cachedSpriteTexture.wrapT = THREE.ClampToEdgeWrapping;
  }
  return cachedSpriteTexture;
}

function getArmorBumpTexture(): THREE.CanvasTexture {
  if (cachedArmorBump) return cachedArmorBump;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) {
    const v = 112 + Math.floor(Math.random() * 34);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 128, Math.random() * 128, 1.2 + Math.random() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  cachedArmorBump = tex;
  return tex;
}

/**
 * Procedural Greek Meander-trimmed War Cloak texture.
 */
function getCapeTexture(kind: GreekWarriorKind, team: TeamId): THREE.CanvasTexture {
  const key = `${kind}_${team}`;
  const existing = cachedCapeTextures.get(key);
  if (existing) return existing;

  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  const isMyrmidon = kind === 'myrmidon';
  const isHipaspist = kind === 'hipaspist';

  const baseTop =
    team === 'enemy'
      ? '#450a0a'
      : isMyrmidon
      ? '#3b0712'
      : isHipaspist
      ? '#1d3a8a'
      : '#991b1b';
  const baseBot =
    team === 'enemy'
      ? '#7f1d1d'
      : isMyrmidon
      ? '#1e1b4b'
      : isHipaspist
      ? '#1e40af'
      : '#b91c1c';

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, baseTop);
  grad.addColorStop(0.75, baseBot);
  grad.addColorStop(1, '#111827');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle vertical cloth folds
  for (let x = 0; x < 256; x += 16) {
    ctx.fillStyle = x % 32 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, 0, 8, 256);
  }

  // Golden Greek meander border near bottom
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 212, 256, 5);
  ctx.fillRect(0, 240, 256, 5);
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 3;
  for (let x = 4; x < 256; x += 24) {
    ctx.strokeRect(x, 220, 16, 16);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedCapeTextures.set(key, tex);
  return tex;
}

/**
 * High-resolution procedural shield textures per warrior kind and Tier (T1–T4).
 */
function getWarriorShieldTexture(
  kind: GreekWarriorKind,
  tier: HopliteArmorTier,
  team: TeamId
): THREE.CanvasTexture {
  const key = `${kind}_${tier}_${team}`;
  const existing = cachedShieldTextures.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const teamAccent = team === 'enemy' ? '#991b1b' : '#b91c1c';

  if (kind === 'hoplite') {
    // Hoplite Argive Hoplon Shield (Bronze -> Gold -> Silver-Electrum + Lambda Λ + Zeus bolts on T4)
    const palettes: Record<HopliteArmorTier, [string, string, string, string]> = {
      1: ['#d97706', '#92400e', '#5c2d0c', '#78350f'],
      2: ['#fde047', '#d97706', '#9a5411', '#78350f'],
      3: ['#fef08a', '#eab308', '#a16207', '#713f12'],
      4: ['#f8fafc', '#cbd5e1', '#64748b', '#f59e0b'],
    };
    const [c0, c1, c2, rimCol] = palettes[tier];
    const grad = ctx.createRadialGradient(225, 210, 24, 256, 256, 252);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.42, c1);
    grad.addColorStop(0.82, c2);
    grad.addColorStop(1, rimCol);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 252, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring / Meander on T3-T4
    ctx.strokeStyle = tier >= 3 ? '#fef08a' : 'rgba(69, 26, 3, 0.5)';
    ctx.lineWidth = tier >= 3 ? 6 : 4;
    ctx.beginPath();
    ctx.arc(256, 256, 206, 0, Math.PI * 2);
    ctx.stroke();

    if (tier >= 2) {
      const studCount = tier === 2 ? 20 : 28;
      for (let i = 0; i < studCount; i++) {
        const a = (i / studCount) * Math.PI * 2;
        ctx.fillStyle = tier === 4 ? '#fde047' : '#fef08a';
        ctx.beginPath();
        ctx.arc(256 + Math.cos(a) * 232, 256 + Math.sin(a) * 232, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Spartan Lambda (Λ)
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = team === 'enemy' ? '#7f1d1d' : tier === 4 ? '#1e3a8a' : '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(256, 108);
    ctx.lineTo(364, 382);
    ctx.lineTo(302, 382);
    ctx.lineTo(256, 224);
    ctx.lineTo(210, 382);
    ctx.lineTo(148, 382);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#92400e';
    ctx.lineWidth = tier >= 3 ? 4.5 : 2.5;
    ctx.stroke();

    // T4 Zeus Flanking Lightning Bolts
    if (tier === 4) {
      ctx.fillStyle = '#facc15';
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(256 + side * 125, 240);
        ctx.scale(side, 1);
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.lineTo(18, -5);
        ctx.lineTo(4, -5);
        ctx.lineTo(22, 52);
        ctx.lineTo(-10, 8);
        ctx.lineTo(4, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  } else if (kind === 'hipaspist') {
    // Hypaspist Agile Aspis / Pelte Shield: Royal blue/crimson + Greek Starburst
    const fieldCol =
      team === 'enemy'
        ? ['#7f1d1d', '#450a0a']
        : tier === 1
        ? ['#573b22', '#2b1b0e']
        : tier === 2
        ? ['#1e3a8a', '#0f172a']
        : tier === 3
        ? ['#1d4ed8', '#172554']
        : ['#0284c7', '#0f172a'];
    const rimCol =
      tier === 1 ? '#92400e' : tier === 2 ? '#d97706' : tier === 3 ? '#facc15' : '#e2e8f0';

    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, fieldCol[0]);
    grad.addColorStop(0.78, fieldCol[1]);
    grad.addColorStop(0.88, rimCol);
    grad.addColorStop(1, '#451a03');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    // Outer double ring
    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 204, 0, Math.PI * 2);
    ctx.stroke();

    // 8-to-16 point Greek Starburst emblem
    const rays = tier <= 2 ? 8 : 12;
    ctx.save();
    ctx.translate(256, 256);
    ctx.fillStyle = tier === 1 ? '#d97706' : tier === 2 ? '#fbbf24' : tier === 3 ? '#fef08a' : '#f8fafc';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    for (let i = 0; i < rays; i++) {
      ctx.save();
      ctx.rotate((i / rays) * Math.PI * 2);
      const len = i % 2 === 0 ? 155 : 105;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(14, -55);
      ctx.lineTo(0, -len);
      ctx.lineTo(-14, -55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Central raised boss
    ctx.fillStyle = tier >= 3 ? '#facc15' : '#b45309';
    ctx.beginPath();
    ctx.arc(256, 256, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    // Myrmidon Fierce Storm-Aegis Shield: Obsidian-Crimson + Golden/Electric Zeus Thunderbolt
    const palettes: Record<HopliteArmorTier, [string, string, string]> = {
      1: ['#3f2314', '#1c110a', '#92400e'],
      2: ['#450a0a', '#18181b', '#d97706'],
      3: ['#581c1c', '#0f172a', '#facc15'],
      4: ['#1e1b4b', '#090d16', '#38bdf8'],
    };
    const [f0, f1, trim] = palettes[tier];
    const grad = ctx.createRadialGradient(256, 240, 20, 256, 256, 250);
    grad.addColorStop(0, f0);
    grad.addColorStop(0.75, f1);
    grad.addColorStop(0.89, trim);
    grad.addColorStop(1, '#18181b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    // Jagged inner Aegis ring
    ctx.strokeStyle = tier === 4 ? '#facc15' : trim;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 198, 0, Math.PI * 2);
    ctx.stroke();

    // Spiked studs around border
    const studs = 16;
    for (let i = 0; i < studs; i++) {
      const a = (i / studs) * Math.PI * 2;
      ctx.fillStyle = tier >= 3 ? '#fef08a' : '#d97706';
      ctx.beginPath();
      ctx.arc(256 + Math.cos(a) * 228, 256 + Math.sin(a) * 228, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Winged Eagle + Zeus Thunderbolt Emblem
    ctx.save();
    ctx.translate(256, 256);
    if (tier >= 2) {
      ctx.fillStyle = tier === 4 ? '#facc15' : '#eab308';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 24, -10);
        ctx.lineTo(s * 145, -75);
        ctx.lineTo(s * 118, -15);
        ctx.lineTo(s * 135, 10);
        ctx.lineTo(s * 28, 28);
        ctx.closePath();
        ctx.fill();
      }
    }
    // Central Thunderbolt
    ctx.shadowColor = tier === 4 ? '#38bdf8' : '#facc15';
    ctx.shadowBlur = tier === 4 ? 22 : 12;
    ctx.fillStyle = tier === 4 ? '#e0f2fe' : tier === 3 ? '#fef08a' : '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(12, -135);
    ctx.lineTo(-42, -8);
    ctx.lineTo(4, -8);
    ctx.lineTo(-22, 138);
    ctx.lineTo(48, 4);
    ctx.lineTo(2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = teamAccent;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedShieldTextures.set(key, tex);
  return tex;
}

/**
 * Draws a single 2D articulated Paper-Doll frame of the warrior on a 2D CanvasContext
 * by slicing the exact regions from the uploaded 64x64 AoM UV texture (`infantry_g_hoplite_map_01..04.png`).
 */
export function drawHoplite2DPaperDollFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement | null,
  tier: HopliteArmorTier,
  team: TeamId,
  row: number, // 0 = idle angles, 1 = walk cycle, 2 = attack lunge
  col: number, // 0..5 frame index
  cellW: number,
  cellH: number,
  offsetX = 0,
  offsetY = 0
) {
  const spec = AOM_HOPLITE_UV_TIERS[tier];
  const cx = offsetX + cellW * 0.5;
  const cy = offsetY + cellH * 0.56;
  const scale = Math.min(cellW, cellH) / 240;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = false;

  const phase = (col / 6) * Math.PI * 2;
  const isWalk = row === 1;
  const isAttack = row === 2;

  const stride = isWalk ? Math.sin(phase) * 22 : isAttack ? Math.sin((col / 5) * Math.PI) * 18 : 0;
  const bobY = isWalk ? -Math.abs(Math.cos(phase)) * 7 : isAttack ? -Math.sin((col / 5) * Math.PI) * 5 : Math.sin(phase) * 2;
  const thrust = isAttack ? Math.sin((col / 5) * Math.PI) : 0;
  const bodyLean = isWalk ? 0.08 : isAttack ? thrust * 0.22 : 0;

  const drawUvSlice = (
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    fallbackColor: string
  ) => {
    if (img && (img instanceof HTMLCanvasElement || (img.complete && img.naturalWidth > 0))) {
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(dx, dy, dw, dh);
    }
  };

  const armorCss = `#${spec.armorHex.toString(16).padStart(6, '0')}`;
  const accentCss = `#${spec.accentHex.toString(16).padStart(6, '0')}`;
  const teamCss = team === 'enemy' ? '#991b1b' : '#b91c1c';

  ctx.translate(0, bobY);
  ctx.rotate(bodyLean);

  // 1. Back Spear (Doru) + Right Arm
  ctx.save();
  ctx.translate(18 + thrust * 26, -24 + thrust * 4);
  ctx.rotate(isAttack ? 0.15 + thrust * 0.32 : isWalk ? -0.15 + Math.sin(phase) * 0.18 : -0.25);
  drawUvSlice(2, 27, 11, 9, -8, -6, 26, 16, '#d69e72');
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-85, 2, 195, 5);
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(110, -3);
  ctx.lineTo(138, 4.5);
  ctx.lineTo(110, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = armorCss;
  ctx.fillRect(-93, 1, 9, 7);
  ctx.restore();

  // 2. Back Leg (Right Leg)
  ctx.save();
  ctx.translate(12 - stride * 0.65, 22);
  ctx.rotate((-stride * Math.PI) / 140);
  drawUvSlice(44, 52, 14, 11, -10, 0, 20, 26, '#d69e72');
  drawUvSlice(5, 16, 8, 9, -9, 24, 18, 28, armorCss);
  drawUvSlice(29, 1, 25, 10, -10, 48, 26, 12, '#5a3418');
  ctx.restore();

  // 3. Front Leg (Left Leg)
  ctx.save();
  ctx.translate(-12 + stride * 0.65, 22);
  ctx.rotate((stride * Math.PI) / 140);
  drawUvSlice(44, 52, 14, 11, -10, 0, 20, 26, '#d69e72');
  drawUvSlice(5, 16, 8, 9, -9, 24, 18, 28, armorCss);
  drawUvSlice(29, 1, 25, 10, -10, 48, 26, 12, '#5a3418');
  ctx.restore();

  // 4. Pleated White Chiton Skirt
  drawUvSlice(1, 52, 34, 11, -26, 12, 52, 18, '#e2e8f0');

  // 5. Leather Pteruges Battle Skirt
  drawUvSlice(1, 43, 35, 9, -28, -4, 56, 20, '#78350f');

  // 6. Torso & Muscle Cuirass
  drawUvSlice(42, 24, 21, 27, -25, -52, 50, 52, armorCss);

  ctx.fillStyle = teamCss;
  ctx.fillRect(-26, -6, 52, 5);

  // 7. Head, Face & Corinthian Helmet
  ctx.save();
  ctx.translate(0, -68);
  ctx.fillStyle = team === 'enemy' ? '#991b1b' : '#dc2626';
  ctx.beginPath();
  ctx.arc(0, -14, 24, Math.PI * 0.85, Math.PI * 2.15);
  ctx.fill();
  ctx.fillStyle = accentCss;
  ctx.fillRect(-14, -18, 28, 5);

  ctx.fillStyle = armorCss;
  ctx.beginPath();
  ctx.arc(0, -2, 17, Math.PI, 0);
  ctx.fill();

  drawUvSlice(14, 26, 9, 16, -12, -6, 24, 26, '#e5b887');

  ctx.fillStyle = armorCss;
  ctx.fillRect(-15, -2, 5, 18);
  ctx.fillRect(10, -2, 5, 18);
  ctx.restore();

  // 8. Left Arm & Spartan Hoplon Shield
  ctx.save();
  ctx.translate(-22 + thrust * 8, -22);
  ctx.fillStyle = armorCss;
  ctx.beginPath();
  ctx.arc(0, 8, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accentCss;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.strokeStyle = teamCss;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-10, 20);
  ctx.lineTo(0, -4);
  ctx.lineTo(10, 20);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

export function getUvPaperDollSpriteSheetTexture(tier: HopliteArmorTier, team: TeamId): THREE.CanvasTexture {
  const key = `${tier}_${team}`;
  const existing = cachedPaperDollSheets.get(key);
  if (existing) return existing;

  const cols = 6;
  const rows = 3;
  const cellW = 160;
  const cellH = 192;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellW;
  canvas.height = rows * cellH;
  const ctx = canvas.getContext('2d')!;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearFilter;

  const renderAllFrames = (img: HTMLImageElement | null) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        drawHoplite2DPaperDollFrame(ctx, img, tier, team, r, c, cellW, cellH, c * cellW, r * cellH);
      }
    }
    tex.needsUpdate = true;
  };

  const cachedImg = cachedUvImages.get(tier) ?? null;
  renderAllFrames(cachedImg);

  if (!cachedImg) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedUvImages.set(tier, img);
      renderAllFrames(img);
    };
    img.src = AOM_HOPLITE_UV_TIERS[tier].url;
  }

  cachedPaperDollSheets.set(key, tex);
  return tex;
}

// ============================================================
// SCULPTED REUSABLE GEOMETRIES FOR ZEUS WARRIORS
// ============================================================
interface GreekSculptGeos {
  cuirassHoplite: THREE.LatheGeometry;
  cuirassHipaspist: THREE.LatheGeometry;
  cuirassMyrmidon: THREE.LatheGeometry;
  domedShield: THREE.LatheGeometry;
  kopisBlade: THREE.ExtrudeGeometry;
  xiphosBlade: THREE.ExtrudeGeometry;
  spearBlade: THREE.ExtrudeGeometry;
  boltSigil: THREE.ExtrudeGeometry;
  capeLong: THREE.ExtrudeGeometry;
  capeShort: THREE.ExtrudeGeometry;
  crestTall: THREE.ExtrudeGeometry;
  crestCompact: THREE.ExtrudeGeometry;
  crestSwept: THREE.ExtrudeGeometry;
  wingFin: THREE.ExtrudeGeometry;
  hornFin: THREE.ExtrudeGeometry;
}

let cachedGreekGeos: GreekSculptGeos | null = null;

function getGreekSculptGeos(S: number): GreekSculptGeos {
  if (cachedGreekGeos) return cachedGreekGeos;

  // Anatomical muscled cuirass profiles
  const cuirassHoplite = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, -0.02 * S),
      new THREE.Vector2(0.255 * S, 0.0 * S),
      new THREE.Vector2(0.23 * S, 0.14 * S),
      new THREE.Vector2(0.295 * S, 0.36 * S),
      new THREE.Vector2(0.28 * S, 0.50 * S),
      new THREE.Vector2(0.115 * S, 0.57 * S),
    ],
    16
  );

  const cuirassHipaspist = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, -0.02 * S),
      new THREE.Vector2(0.23 * S, 0.0 * S),
      new THREE.Vector2(0.205 * S, 0.14 * S),
      new THREE.Vector2(0.275 * S, 0.37 * S),
      new THREE.Vector2(0.26 * S, 0.50 * S),
      new THREE.Vector2(0.11 * S, 0.56 * S),
    ],
    16
  );

  const cuirassMyrmidon = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, -0.02 * S),
      new THREE.Vector2(0.27 * S, 0.0 * S),
      new THREE.Vector2(0.235 * S, 0.14 * S),
      new THREE.Vector2(0.32 * S, 0.38 * S),
      new THREE.Vector2(0.305 * S, 0.52 * S),
      new THREE.Vector2(0.125 * S, 0.59 * S),
    ],
    16
  );

  // Convex Greek Hoplon / Aspis Shield Dome
  const domedShield = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.0, 0.085 * S),
      new THREE.Vector2(0.24 * S, 0.068 * S),
      new THREE.Vector2(0.44 * S, 0.028 * S),
      new THREE.Vector2(0.54 * S, 0.0),
      new THREE.Vector2(0.51 * S, -0.02 * S),
    ],
    22
  );
  domedShield.rotateX(Math.PI / 2);

  // Curved Greek Kopis Blade (Hypaspist)
  const kopisShape = new THREE.Shape();
  kopisShape.moveTo(0, 0);
  kopisShape.lineTo(0.055 * S, 0);
  kopisShape.quadraticCurveTo(0.095 * S, 0.28 * S, 0.125 * S, 0.58 * S);
  kopisShape.quadraticCurveTo(0.09 * S, 0.82 * S, -0.01 * S, 0.92 * S);
  kopisShape.quadraticCurveTo(0.01 * S, 0.54 * S, -0.025 * S, 0.25 * S);
  kopisShape.closePath();
  const kopisBlade = new THREE.ExtrudeGeometry(kopisShape, {
    depth: 0.024 * S,
    bevelEnabled: true,
    bevelThickness: 0.008 * S,
    bevelSize: 0.008 * S,
    bevelSegments: 1,
  });
  kopisBlade.translate(0, 0, -0.012 * S);

  // Broad Leaf-shaped Greek Xiphos Blade (Myrmidon)
  const xiphosShape = new THREE.Shape();
  xiphosShape.moveTo(-0.048 * S, 0);
  xiphosShape.lineTo(0.048 * S, 0);
  xiphosShape.quadraticCurveTo(0.04 * S, 0.28 * S, 0.072 * S, 0.62 * S);
  xiphosShape.lineTo(0, 1.04 * S);
  xiphosShape.lineTo(-0.072 * S, 0.62 * S);
  xiphosShape.quadraticCurveTo(-0.04 * S, 0.28 * S, -0.048 * S, 0);
  xiphosShape.closePath();
  const xiphosBlade = new THREE.ExtrudeGeometry(xiphosShape, {
    depth: 0.026 * S,
    bevelEnabled: true,
    bevelThickness: 0.01 * S,
    bevelSize: 0.01 * S,
    bevelSegments: 1,
  });
  xiphosBlade.translate(0, 0, -0.013 * S);

  // Leaf Spearhead (Hoplite Doru)
  const spShape = new THREE.Shape();
  spShape.moveTo(-0.036 * S, 0);
  spShape.lineTo(0.036 * S, 0);
  spShape.quadraticCurveTo(0.075 * S, 0.16 * S, 0, 0.48 * S);
  spShape.quadraticCurveTo(-0.075 * S, 0.16 * S, -0.036 * S, 0);
  spShape.closePath();
  const spearBlade = new THREE.ExtrudeGeometry(spShape, {
    depth: 0.022 * S,
    bevelEnabled: true,
    bevelThickness: 0.008 * S,
    bevelSize: 0.008 * S,
    bevelSegments: 1,
  });
  spearBlade.translate(0, 0, -0.011 * S);

  // Zeus Thunderbolt Chest Sigil
  const boltShape = new THREE.Shape();
  boltShape.moveTo(0.02 * S, 0.13 * S);
  boltShape.lineTo(-0.055 * S, -0.01 * S);
  boltShape.lineTo(0.005 * S, -0.01 * S);
  boltShape.lineTo(-0.03 * S, -0.14 * S);
  boltShape.lineTo(0.06 * S, 0.01 * S);
  boltShape.lineTo(0.0, 0.01 * S);
  boltShape.closePath();
  const boltSigil = new THREE.ExtrudeGeometry(boltShape, {
    depth: 0.022 * S,
    bevelEnabled: false,
  });

  // Flowing War Capes
  const makeCape = (len: number, widthBot: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(-0.24 * S, 0);
    sh.lineTo(0.24 * S, 0);
    sh.lineTo(widthBot * S, -len * S);
    sh.quadraticCurveTo(0, -(len + 0.12) * S, -widthBot * S, -len * S);
    sh.closePath();
    return new THREE.ExtrudeGeometry(sh, {
      depth: 0.026 * S,
      bevelEnabled: true,
      bevelThickness: 0.008 * S,
      bevelSize: 0.008 * S,
      bevelSegments: 1,
    });
  };
  const capeLong = makeCape(0.95, 0.42);
  const capeShort = makeCape(0.68, 0.34);

  // Horsehair Helmet Crests
  const makeCrest = (hScale: number, zBack: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(0.24 * S, -0.04 * S);
    sh.quadraticCurveTo(0.26 * S, 0.28 * S * hScale, 0.08 * S, 0.38 * S * hScale);
    sh.quadraticCurveTo(-0.16 * S, 0.40 * S * hScale, -zBack * S, 0.20 * S * hScale);
    sh.quadraticCurveTo(-(zBack + 0.07) * S, -0.06 * S, -0.30 * S, -0.16 * S);
    sh.quadraticCurveTo(-0.26 * S, 0.06 * S, -0.14 * S, 0.20 * S * hScale);
    sh.quadraticCurveTo(0.08 * S, 0.24 * S * hScale, 0.18 * S, 0.0);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: 0.065 * S,
      bevelEnabled: true,
      bevelThickness: 0.015 * S,
      bevelSize: 0.015 * S,
      bevelSegments: 2,
    });
    g.center();
    return g;
  };
  const crestTall = makeCrest(1.18, 0.38);
  const crestCompact = makeCrest(0.62, 0.26);

  // Swept Attic / Myrmidon Plume Tail
  const sweptShape = new THREE.Shape();
  sweptShape.moveTo(0.12 * S, 0.02 * S);
  sweptShape.quadraticCurveTo(0.04 * S, 0.24 * S, -0.22 * S, 0.26 * S);
  sweptShape.quadraticCurveTo(-0.48 * S, 0.16 * S, -0.52 * S, -0.22 * S);
  sweptShape.quadraticCurveTo(-0.34 * S, -0.04 * S, -0.16 * S, 0.12 * S);
  sweptShape.quadraticCurveTo(0.0 * S, 0.14 * S, 0.06 * S, -0.02 * S);
  sweptShape.closePath();
  const crestSwept = new THREE.ExtrudeGeometry(sweptShape, {
    depth: 0.06 * S,
    bevelEnabled: true,
    bevelThickness: 0.012 * S,
    bevelSize: 0.012 * S,
    bevelSegments: 1,
  });
  crestSwept.center();

  // Attic Wing Fin (Hypaspist T3-T4)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.10 * S, 0.26 * S);
  wingShape.lineTo(0.02 * S, 0.22 * S);
  wingShape.lineTo(-0.08 * S, 0.30 * S);
  wingShape.lineTo(-0.10 * S, 0.04 * S);
  wingShape.closePath();
  const wingFin = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.018 * S,
    bevelEnabled: false,
  });

  // Myrmidon Horn / Lightning Crest Fin
  const hornShape = new THREE.Shape();
  hornShape.moveTo(0, 0);
  hornShape.quadraticCurveTo(0.12 * S, 0.14 * S, 0.05 * S, 0.34 * S);
  hornShape.quadraticCurveTo(0.01 * S, 0.16 * S, -0.06 * S, 0.04 * S);
  hornShape.closePath();
  const hornFin = new THREE.ExtrudeGeometry(hornShape, {
    depth: 0.024 * S,
    bevelEnabled: true,
    bevelThickness: 0.006 * S,
    bevelSize: 0.006 * S,
    bevelSegments: 1,
  });

  cachedGreekGeos = {
    cuirassHoplite,
    cuirassHipaspist,
    cuirassMyrmidon,
    domedShield,
    kopisBlade,
    xiphosBlade,
    spearBlade,
    boltSigil,
    capeLong,
    capeShort,
    crestTall,
    crestCompact,
    crestSwept,
    wingFin,
    hornFin,
  };
  return cachedGreekGeos;
}

// ============================================================
// TIER PALETTE CONFIG PER WARRIOR KIND
// ============================================================
interface TierMaterialPalette {
  armorHex: number;
  accentHex: number;
  greaveHex: number;
  bladeHex: number;
  crestHex: number;
  tunicHex: number;
  roughness: number;
  metalness: number;
  emissiveHex: number;
  emissiveIntensity: number;
}

function getTierPalette(
  kind: GreekWarriorKind,
  tier: HopliteArmorTier,
  team: TeamId
): TierMaterialPalette {
  const isEnemy = team === 'enemy';
  if (kind === 'myrmidon') {
    const crestBase = isEnemy ? 0x991b1b : tier >= 3 ? 0xdc2626 : 0x7f1d1d;
    const tunicBase = isEnemy ? 0x450a0a : 0x111827;
    switch (tier) {
      case 1:
        return {
          armorHex: 0x5c3a21,
          accentHex: 0xb45309,
          greaveHex: 0x442a18,
          bladeHex: 0x94a3b8,
          crestHex: crestBase,
          tunicHex: tunicBase,
          roughness: 0.42,
          metalness: 0.72,
          emissiveHex: 0x000000,
          emissiveIntensity: 0,
        };
      case 2:
        return {
          armorHex: 0x784418,
          accentHex: 0xeab308,
          greaveHex: 0x5c3412,
          bladeHex: 0xcbd5e1,
          crestHex: crestBase,
          tunicHex: tunicBase,
          roughness: 0.3,
          metalness: 0.86,
          emissiveHex: 0x220c02,
          emissiveIntensity: 0.15,
        };
      case 3:
        return {
          armorHex: 0xd99b1e,
          accentHex: 0xfef08a,
          greaveHex: 0xb45309,
          bladeHex: 0xfef3c7,
          crestHex: isEnemy ? 0xb91c1c : 0xeab308,
          tunicHex: 0x1e1b4b,
          roughness: 0.22,
          metalness: 0.92,
          emissiveHex: 0x451a03,
          emissiveIntensity: 0.22,
        };
      case 4:
        return {
          armorHex: 0xcbd5e1,
          accentHex: 0xfacc15,
          greaveHex: 0x94a3b8,
          bladeHex: 0xe0f2fe,
          crestHex: isEnemy ? 0xef4444 : 0x38bdf8,
          tunicHex: 0x0f172a,
          roughness: 0.16,
          metalness: 0.95,
          emissiveHex: 0x0284c7,
          emissiveIntensity: 0.28,
        };
    }
  }

  if (kind === 'hipaspist') {
    const crestBase = isEnemy ? 0xb91c1c : tier >= 3 ? 0x2563eb : 0xdc2626;
    const tunicBase = isEnemy ? 0x7f1d1d : 0x1e3a8a;
    switch (tier) {
      case 1:
        return {
          armorHex: 0x9a6539,
          accentHex: 0xb45309,
          greaveHex: 0x784b26,
          bladeHex: 0x94a3b8,
          crestHex: crestBase,
          tunicHex: tunicBase,
          roughness: 0.44,
          metalness: 0.65,
          emissiveHex: 0x000000,
          emissiveIntensity: 0,
        };
      case 2:
        return {
          armorHex: 0xc28127,
          accentHex: 0xf59e0b,
          greaveHex: 0x9c6419,
          bladeHex: 0xcbd5e1,
          crestHex: crestBase,
          tunicHex: tunicBase,
          roughness: 0.29,
          metalness: 0.84,
          emissiveHex: 0x000000,
          emissiveIntensity: 0,
        };
      case 3:
        return {
          armorHex: 0xefc02e,
          accentHex: 0xfef08a,
          greaveHex: 0xd99b1e,
          bladeHex: 0xe2e8f0,
          crestHex: crestBase,
          tunicHex: isEnemy ? 0x991b1b : 0x1d4ed8,
          roughness: 0.21,
          metalness: 0.91,
          emissiveHex: 0x291802,
          emissiveIntensity: 0.12,
        };
      case 4:
        return {
          armorHex: 0xe2e8f0,
          accentHex: 0xfbbf24,
          greaveHex: 0xcbd5e1,
          bladeHex: 0xf8fafc,
          crestHex: isEnemy ? 0xef4444 : 0x38bdf8,
          tunicHex: isEnemy ? 0x991b1b : 0x1e40af,
          roughness: 0.16,
          metalness: 0.95,
          emissiveHex: 0x0c4a6e,
          emissiveIntensity: 0.16,
        };
    }
  }

  // Hoplite (Zeus Phalanx Backbone)
  const crestBase = isEnemy ? 0x991b1b : 0xdc2626;
  const tunicBase = isEnemy ? 0x991b1b : 0xf8fafc;
  switch (tier) {
    case 1:
      return {
        armorHex: 0xa66e3c,
        accentHex: 0xd97706,
        greaveHex: 0x7c4d24,
        bladeHex: 0x94a3b8,
        crestHex: crestBase,
        tunicHex: tunicBase,
        roughness: 0.42,
        metalness: 0.66,
        emissiveHex: 0x000000,
        emissiveIntensity: 0,
      };
    case 2:
      return {
        armorHex: 0xc88b22,
        accentHex: 0xf59e0b,
        greaveHex: 0xa86f18,
        bladeHex: 0xcbd5e1,
        crestHex: crestBase,
        tunicHex: tunicBase,
        roughness: 0.28,
        metalness: 0.85,
        emissiveHex: 0x000000,
        emissiveIntensity: 0,
      };
    case 3:
      return {
        armorHex: 0xf5c427,
        accentHex: 0xfef08a,
        greaveHex: 0xeab308,
        bladeHex: 0xe2e8f0,
        crestHex: crestBase,
        tunicHex: tunicBase,
        roughness: 0.2,
        metalness: 0.92,
        emissiveHex: 0x332004,
        emissiveIntensity: 0.12,
      };
    case 4:
      return {
        armorHex: 0xe2e8f0,
        accentHex: 0xfbbf24,
        greaveHex: 0xcbd5e1,
        bladeHex: 0xf8fafc,
        crestHex: crestBase,
        tunicHex: tunicBase,
        roughness: 0.16,
        metalness: 0.95,
        emissiveHex: 0x1e293b,
        emissiveIntensity: 0.14,
      };
  }
}

export function createGreekUnitMesh(
  kind: GreekWarriorKind,
  team: TeamId,
  _pal: MaterialPalette,
  enableShadows: boolean,
  initialTier: HopliteArmorTier = 3
): THREE.Group {
  const root = new THREE.Group();
  let currentTier: HopliteArmorTier = initialTier;
  let currentMode: HopliteRenderMode = '3d';
  let combatFury = 0; // 0..1 intensity for Myrmidon combat fury aura

  const uvTex = getHopliteUvTexture(currentTier);
  const tierPal = getTierPalette(kind, currentTier, team);
  const armorBump = getArmorBumpTexture();

  const S = kind === 'myrmidon' ? 0.62 : kind === 'hipaspist' ? 0.56 : 0.59;
  const geos = getGreekSculptGeos(S);

  // Materials with distinct PBR roughness & metalness variation
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe0b084,
    roughness: 0.62,
    metalness: 0.04,
  });

  const tunicMat = new THREE.MeshStandardMaterial({
    color: tierPal.tunicHex,
    roughness: 0.86,
    metalness: 0.02,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: kind === 'myrmidon' ? 0x3b1f10 : 0x6b3818,
    roughness: 0.78,
    metalness: 0.08,
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: tierPal.armorHex,
    roughness: tierPal.roughness,
    metalness: tierPal.metalness,
    bumpMap: armorBump,
    bumpScale: 0.008,
    emissive: new THREE.Color(tierPal.emissiveHex),
    emissiveIntensity: tierPal.emissiveIntensity,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: tierPal.accentHex,
    roughness: 0.2,
    metalness: 0.92,
    emissive: new THREE.Color(kind === 'myrmidon' && currentTier >= 3 ? 0x451a03 : 0x000000),
    emissiveIntensity: kind === 'myrmidon' && currentTier >= 3 ? 0.25 : 0,
  });

  const greaveMat = new THREE.MeshStandardMaterial({
    color: tierPal.greaveHex,
    roughness: tierPal.roughness + 0.04,
    metalness: tierPal.metalness,
    bumpMap: armorBump,
    bumpScale: 0.006,
  });

  const bladeMat = new THREE.MeshStandardMaterial({
    color: tierPal.bladeHex,
    roughness: 0.14,
    metalness: 0.96,
    emissive: new THREE.Color(kind === 'myrmidon' && currentTier === 4 ? 0x38bdf8 : 0x000000),
    emissiveIntensity: kind === 'myrmidon' && currentTier === 4 ? 0.35 : 0,
  });

  const crestMat = new THREE.MeshStandardMaterial({
    color: tierPal.crestHex,
    roughness: 0.82,
    metalness: 0.04,
  });

  const capeMat = new THREE.MeshStandardMaterial({
    map: getCapeTexture(kind, team),
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const woodShaftMat = new THREE.MeshStandardMaterial({
    color: 0x6b3a16,
    roughness: 0.76,
    metalness: 0.04,
  });

  const shieldFrontMat = new THREE.MeshStandardMaterial({
    map: getWarriorShieldTexture(kind, currentTier, team),
    roughness: 0.32,
    metalness: 0.72,
  });

  const lightningAuraMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Track tier-gated accessory meshes (visible when tier >= minTier && tier <= maxTier)
  const tierGatedParts: Array<{ obj: THREE.Object3D; minTier: number; maxTier?: number }> = [];
  const regTier = (obj: THREE.Object3D, minTier: number, maxTier?: number) => {
    tierGatedParts.push({ obj, minTier, maxTier });
    obj.visible = currentTier >= minTier && (maxTier === undefined || currentTier <= maxTier);
    return obj;
  };

  // ==========================================
  // 1. TRUE 3D SCULPTED GREEK WARRIOR RIG
  // ==========================================
  const group3D = new THREE.Group();

  const addMesh = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    parent.add(m);
    return m;
  };

  // --- 1.1 Ground Contact Shadow ---
  const shadowGeo = new THREE.CircleGeometry(0.48, 24);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.set(0, 0.02, 0);
  contactShadow.userData.ignoreRaycast = true;
  group3D.add(contactShadow);

  // Pivot hierarchy for HopliteAnimator
  const hipY = 0.72 * S;
  const spine = new THREE.Group();
  spine.position.set(0, hipY, 0);
  const upper = new THREE.Group();
  upper.position.set(0, -hipY, 0);
  spine.add(upper);
  group3D.add(spine);

  // --- 1.2 Sculpted Anatomical Torso & Cuirass ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.98 * S, 0);

  const cuirassGeo =
    kind === 'myrmidon'
      ? geos.cuirassMyrmidon
      : kind === 'hipaspist'
      ? geos.cuirassHipaspist
      : geos.cuirassHoplite;

  // On Hypaspist T1, show linen/leather tunic torso; T2+ wears sculpted armor
  const cuirass = addMesh(torsoGroup, cuirassGeo, armorMat);
  cuirass.position.y = 0.02 * S;

  // Molded pectoral muscle plates (more prominent on T2+)
  const pecGeo = new THREE.SphereGeometry(0.115 * S, 12, 8);
  const leftPec = addMesh(torsoGroup, pecGeo, armorMat);
  leftPec.scale.set(1.18, 0.78, 0.48);
  leftPec.position.set(-0.115 * S, 0.41 * S, 0.235 * S);
  regTier(leftPec, kind === 'myrmidon' ? 1 : 2);

  const rightPec = addMesh(torsoGroup, pecGeo, armorMat);
  rightPec.scale.set(1.18, 0.78, 0.48);
  rightPec.position.set(0.115 * S, 0.41 * S, 0.235 * S);
  regTier(rightPec, kind === 'myrmidon' ? 1 : 2);

  // Anatomical sculpted abdominal segments (T3-T4)
  for (let row = 0; row < 2; row++) {
    for (const side of [-1, 1]) {
      const ab = addMesh(torsoGroup, new THREE.SphereGeometry(0.055 * S, 8, 6), armorMat);
      ab.scale.set(1.05, 0.75, 0.45);
      ab.position.set(side * 0.065 * S, (0.24 - row * 0.09) * S, 0.22 * S);
      regTier(ab, 3);
    }
  }

  // Distinct Torso Identity Overlays per Warrior Kind:
  if (kind === 'hoplite') {
    // Chest Sunburst / Gorgoneion Medallion (T3-T4)
    const med = addMesh(torsoGroup, new THREE.CylinderGeometry(0.085 * S, 0.085 * S, 0.03 * S, 14), accentMat);
    med.rotation.x = Math.PI / 2;
    med.position.set(0, 0.36 * S, 0.28 * S);
    regTier(med, 3);
  } else if (kind === 'hipaspist') {
    // Diagonal Leather Baldric Strap across chest + Sheathed Scabbard at Left Hip
    const baldric = addMesh(torsoGroup, new THREE.BoxGeometry(0.08 * S, 0.66 * S, 0.04 * S), leatherMat);
    baldric.position.set(0, 0.31 * S, 0.255 * S);
    baldric.rotation.z = -0.58;
    const baldricBack = addMesh(torsoGroup, new THREE.BoxGeometry(0.08 * S, 0.66 * S, 0.04 * S), leatherMat);
    baldricBack.position.set(0, 0.31 * S, -0.24 * S);
    baldricBack.rotation.z = 0.58;
    const baldricBuckle = addMesh(torsoGroup, new THREE.BoxGeometry(0.11 * S, 0.09 * S, 0.055 * S), accentMat);
    baldricBuckle.position.set(0.04 * S, 0.34 * S, 0.265 * S);
    regTier(baldricBuckle, 2);
  } else {
    // Myrmidon: Zeus Thunderbolt Chest Sigil + Segmented Collar Gorget
    const boltSigil = addMesh(torsoGroup, geos.boltSigil, accentMat);
    boltSigil.position.set(0, 0.35 * S, 0.275 * S);
    regTier(boltSigil, 2);

    const gorget = addMesh(torsoGroup, new THREE.TorusGeometry(0.19 * S, 0.034 * S, 8, 16), accentMat);
    gorget.rotation.x = Math.PI / 2 - 0.15;
    gorget.position.set(0, 0.54 * S, 0.02 * S);
    regTier(gorget, 2);
  }

  // Waist Belt + Gold Buckle
  const belt = addMesh(torsoGroup, new THREE.CylinderGeometry(0.275 * S, 0.275 * S, 0.08 * S, 16), leatherMat);
  belt.position.y = 0.02 * S;
  const beltRim = addMesh(torsoGroup, new THREE.CylinderGeometry(0.285 * S, 0.285 * S, 0.035 * S, 16), accentMat);
  beltRim.position.y = 0.04 * S;
  regTier(beltRim, 2);

  // Pleated Chiton Skirt
  const chitonSkirtGeo = new THREE.CylinderGeometry(0.27 * S, 0.39 * S, 0.35 * S, 16);
  const skirtPleats = addMesh(torsoGroup, chitonSkirtGeo, tunicMat);
  skirtPleats.position.y = -0.18 * S;

  // Leather Pteruges Battle Skirt Strips with Metallic Studs on T2+
  const pterugesCount = 10;
  const ptStripGeo = new THREE.BoxGeometry(0.072 * S, 0.30 * S, 0.024 * S);
  const ptStudGeo = new THREE.BoxGeometry(0.068 * S, 0.05 * S, 0.03 * S);
  for (let i = 0; i < pterugesCount; i++) {
    const angle = (i / pterugesCount) * Math.PI * 2;
    const radius = 0.305 * S;
    const px = Math.sin(angle) * radius;
    const pz = Math.cos(angle) * radius;
    const pt = addMesh(torsoGroup, ptStripGeo, leatherMat);
    pt.position.set(px, -0.14 * S, pz);
    pt.rotation.y = angle;
    const tip = addMesh(torsoGroup, ptStudGeo, accentMat);
    tip.position.set(px * 1.03, -0.26 * S, pz * 1.03);
    tip.rotation.y = angle;
    regTier(tip, 2);
  }

  // Flowing War Capes (Back of Torso)
  if (kind === 'hoplite') {
    const cape = addMesh(torsoGroup, geos.capeLong, capeMat);
    cape.position.set(0, 0.52 * S, -0.24 * S);
    cape.rotation.x = 0.16;
    regTier(cape, 3);
  } else if (kind === 'hipaspist') {
    const cape = addMesh(torsoGroup, geos.capeShort, capeMat);
    cape.position.set(0, 0.48 * S, -0.23 * S);
    cape.rotation.x = 0.22;
    regTier(cape, 3);
  } else {
    // Myrmidon wears fierce crimson-meander cape from T2 upward, wider on T3-T4
    const capeBase = addMesh(torsoGroup, geos.capeShort, capeMat);
    capeBase.position.set(0, 0.52 * S, -0.25 * S);
    capeBase.rotation.x = 0.18;
    regTier(capeBase, 2, 2);

    const capeGrand = addMesh(torsoGroup, geos.capeLong, capeMat);
    capeGrand.scale.set(1.12, 1.05, 1.0);
    capeGrand.position.set(0, 0.54 * S, -0.25 * S);
    capeGrand.rotation.x = 0.16;
    regTier(capeGrand, 3);
  }

  upper.add(torsoGroup);

  // --- 1.3 Head, Face & Warrior-Specific Helmets (T1-T4) ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.72 * S, 0);

  const neck = addMesh(headGroup, new THREE.CylinderGeometry(0.095 * S, 0.108 * S, 0.18 * S, 10), skinMat);
  neck.position.y = -0.06 * S;

  const faceGeo = remapUvRegion64(new THREE.SphereGeometry(0.185 * S, 14, 12), 14, 26, 23, 42);
  faceGeo.rotateY(-Math.PI / 2);
  const face = addMesh(headGroup, faceGeo, skinMat);
  face.position.set(0, 0.12 * S, 0.03 * S);

  if (kind === 'hoplite') {
    // HOPLITE: Corinthian Helmet Evolution T1 -> T4
    const helmDome = addMesh(
      headGroup,
      new THREE.SphereGeometry(0.242 * S, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.68),
      armorMat
    );
    helmDome.position.set(0, 0.15 * S, 0);

    // Cheek guards (T2+) + Nasal Guard (T2+)
    const cheekGeo = new THREE.BoxGeometry(0.052 * S, 0.22 * S, 0.16 * S);
    const leftCheek = addMesh(headGroup, cheekGeo, armorMat);
    leftCheek.position.set(-0.19 * S, 0.04 * S, 0.07 * S);
    leftCheek.rotation.y = 0.25;
    regTier(leftCheek, 2);

    const rightCheek = addMesh(headGroup, cheekGeo, armorMat);
    rightCheek.position.set(0.19 * S, 0.04 * S, 0.07 * S);
    rightCheek.rotation.y = -0.25;
    regTier(rightCheek, 2);

    const nasal = addMesh(headGroup, new THREE.BoxGeometry(0.038 * S, 0.14 * S, 0.045 * S), armorMat);
    nasal.position.set(0, 0.13 * S, 0.23 * S);
    regTier(nasal, 2);

    // Brow Crown Band (T3-T4)
    const browCrown = addMesh(headGroup, new THREE.TorusGeometry(0.235 * S, 0.025 * S, 8, 18), accentMat);
    browCrown.rotation.x = Math.PI / 2;
    browCrown.position.set(0, 0.21 * S, 0.01 * S);
    regTier(browCrown, 3);

    // T1 Compact Bristle Comb
    const crestT1 = addMesh(headGroup, geos.crestCompact, crestMat);
    crestT1.position.set(0, 0.45 * S, -0.02 * S);
    crestT1.rotation.y = Math.PI / 2;
    regTier(crestT1, 1, 1);

    // T2-T3 Full Scarlet Horsehair Crest
    const crestBase = addMesh(headGroup, new THREE.BoxGeometry(0.07 * S, 0.08 * S, 0.44 * S), accentMat);
    crestBase.position.set(0, 0.39 * S, -0.02 * S);
    regTier(crestBase, 2);

    const crestT23 = addMesh(headGroup, geos.crestTall, crestMat);
    crestT23.position.set(0, 0.59 * S, -0.04 * S);
    crestT23.rotation.y = Math.PI / 2;
    regTier(crestT23, 2, 3);

    // T4 Towering Grand Double-Tiered Champion Crest + Gold Spine
    const crestT4 = addMesh(headGroup, geos.crestTall, crestMat);
    crestT4.scale.set(1.22, 1.22, 1.15);
    crestT4.position.set(0, 0.63 * S, -0.05 * S);
    crestT4.rotation.y = Math.PI / 2;
    regTier(crestT4, 4);

    const crestCrownStripe = addMesh(headGroup, geos.crestCompact, accentMat);
    crestCrownStripe.scale.set(1.15, 0.75, 1.25);
    crestCrownStripe.position.set(0, 0.48 * S, -0.03 * S);
    crestCrownStripe.rotation.y = Math.PI / 2;
    regTier(crestCrownStripe, 4);
  } else if (kind === 'hipaspist') {
    // HYPASPIST: Sleek Conical Pilos (T1) -> Attic-Thracian Winged War Helm (T2-T4)
    // Open-face athletic silhouette clearly distinct from Hoplite!
    const atticCap = addMesh(
      headGroup,
      new THREE.SphereGeometry(0.23 * S, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
      armorMat
    );
    atticCap.position.set(0, 0.16 * S, -0.01 * S);

    // Raised Attic Front Visor Peak
    const peak = addMesh(headGroup, new THREE.CylinderGeometry(0.235 * S, 0.245 * S, 0.06 * S, 14, 1, false, -0.9, 1.8), accentMat);
    peak.position.set(0, 0.22 * S, 0.03 * S);
    peak.rotation.x = -0.22;
    regTier(peak, 2);

    // T1 Conical Pilos Tip
    const pilosTip = addMesh(headGroup, new THREE.ConeGeometry(0.16 * S, 0.20 * S, 12), armorMat);
    pilosTip.position.set(0, 0.36 * S, -0.01 * S);
    regTier(pilosTip, 1, 1);

    // T2+ Swept-Back Horsehair Tail Crest (dynamic flowing back!)
    const crestHolder = addMesh(headGroup, new THREE.BoxGeometry(0.06 * S, 0.07 * S, 0.34 * S), accentMat);
    crestHolder.position.set(0, 0.38 * S, -0.06 * S);
    regTier(crestHolder, 2);

    const sweptPlume = addMesh(headGroup, geos.crestSwept, crestMat);
    sweptPlume.position.set(0, 0.44 * S, -0.18 * S);
    sweptPlume.rotation.y = Math.PI / 2;
    regTier(sweptPlume, 2);

    // T3-T4 Twin Golden Temple Wing Fins!
    const wingL = addMesh(headGroup, geos.wingFin, accentMat);
    wingL.position.set(-0.22 * S, 0.24 * S, 0.02 * S);
    wingL.rotation.set(0.15, -0.25, 0.35);
    regTier(wingL, 3);

    const wingR = addMesh(headGroup, geos.wingFin, accentMat);
    wingR.position.set(0.22 * S, 0.24 * S, 0.02 * S);
    wingR.rotation.set(0.15, 0.25, -0.35);
    regTier(wingR, 3);

    // T4 High Diadem & Cheek-Straps
    const diadem = addMesh(headGroup, new THREE.TorusGeometry(0.228 * S, 0.024 * S, 8, 16), accentMat);
    diadem.rotation.x = Math.PI / 2;
    diadem.position.set(0, 0.23 * S, 0);
    regTier(diadem, 4);
  } else {
    // MYRMIDON: Fierce Dark-Bronze / Obsidian & Electrum War Helm + Twin Horns + Towering Plume
    const myrmDome = addMesh(
      headGroup,
      new THREE.SphereGeometry(0.248 * S, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.66),
      armorMat
    );
    myrmDome.position.set(0, 0.16 * S, 0);

    // Angular Brow Visor
    const visor = addMesh(headGroup, new THREE.BoxGeometry(0.36 * S, 0.07 * S, 0.16 * S), accentMat);
    visor.position.set(0, 0.21 * S, 0.17 * S);
    visor.rotation.x = 0.22;

    // Fierce Angular Cheek-Fangs (T2+)
    for (const side of [-1, 1]) {
      const fang = addMesh(headGroup, new THREE.BoxGeometry(0.055 * S, 0.24 * S, 0.16 * S), armorMat);
      fang.position.set(side * 0.19 * S, 0.03 * S, 0.08 * S);
      fang.rotation.y = -side * 0.32;
      fang.rotation.z = side * 0.1;
      regTier(fang, 2);
    }

    // Subtle Glowing Zeus Eyes on T3-T4
    for (const side of [-1, 1]) {
      const eyeGlow = addMesh(
        headGroup,
        new THREE.SphereGeometry(0.024 * S, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
      );
      eyeGlow.position.set(side * 0.068 * S, 0.145 * S, 0.205 * S);
      regTier(eyeGlow, 3);
    }

    // Fierce Sweeping Plume (T1 compact, T2-T4 towering!)
    const mCrest1 = addMesh(headGroup, geos.crestCompact, crestMat);
    mCrest1.position.set(0, 0.45 * S, -0.02 * S);
    mCrest1.rotation.y = Math.PI / 2;
    regTier(mCrest1, 1, 1);

    const mCrestHolder = addMesh(headGroup, new THREE.BoxGeometry(0.08 * S, 0.09 * S, 0.46 * S), accentMat);
    mCrestHolder.position.set(0, 0.41 * S, -0.02 * S);
    regTier(mCrestHolder, 2);

    const mCrestFull = addMesh(headGroup, geos.crestTall, crestMat);
    mCrestFull.scale.set(1.22, 1.24, 1.2);
    mCrestFull.position.set(0, 0.64 * S, -0.05 * S);
    mCrestFull.rotation.y = Math.PI / 2;
    regTier(mCrestFull, 2);

    // T3-T4 Twin Golden Lightning Horns on Helmet!
    const hornL = addMesh(headGroup, geos.hornFin, accentMat);
    hornL.position.set(-0.22 * S, 0.24 * S, 0.04 * S);
    hornL.rotation.set(0.15, 0.1, 0.42);
    regTier(hornL, 3);

    const hornR = addMesh(headGroup, geos.hornFin, accentMat);
    hornR.position.set(0.22 * S, 0.24 * S, 0.04 * S);
    hornR.rotation.set(0.15, -0.1, -0.42);
    hornR.scale.x = -1;
    regTier(hornR, 3);
  }

  upper.add(headGroup);

  // --- 1.4 Legs, Knee Pivots & Tiered Greaves (Cnêmides) ---
  const thighGeo = new THREE.CylinderGeometry(0.102 * S, 0.086 * S, 0.34 * S, 10);
  const greaveGeo = new THREE.CylinderGeometry(0.095 * S, 0.075 * S, 0.38 * S, 10);
  const sandalGeo = new THREE.BoxGeometry(0.104 * S, 0.068 * S, 0.23 * S);

  const buildLeg = (side: -1 | 1) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.145 * S, 0.72 * S, 0);
    const thigh = addMesh(leg, thighGeo, skinMat);
    thigh.position.y = -0.17 * S;

    // Upper thigh tasset armor plate on T3-T4
    const tasset = addMesh(leg, new THREE.CylinderGeometry(0.114 * S, 0.104 * S, 0.18 * S, 10), armorMat);
    tasset.position.set(0, -0.12 * S, 0);
    regTier(tasset, 3);

    const lowerLeg = new THREE.Group();
    lowerLeg.position.set(0, -0.34 * S, 0);
    leg.add(lowerLeg);

    const knee = addMesh(lowerLeg, new THREE.SphereGeometry(0.082 * S, 8, 8), greaveMat);
    knee.position.set(0, 0, 0.025 * S);
    regTier(knee, 2);

    const greave = addMesh(lowerLeg, greaveGeo, greaveMat);
    greave.position.set(0, -0.18 * S, 0.01 * S);

    // Ornate golden knee-wing trim on T4
    const kneeWing = addMesh(lowerLeg, new THREE.ConeGeometry(0.045 * S, 0.12 * S, 4), accentMat);
    kneeWing.position.set(0, 0.05 * S, 0.085 * S);
    kneeWing.rotation.x = 0.2;
    regTier(kneeWing, 4);

    const foot = addMesh(lowerLeg, sandalGeo, leatherMat);
    foot.position.set(0, -0.35 * S, 0.05 * S);

    group3D.add(leg);
    return { leg, lowerLeg };
  };

  const { leg: leftLeg, lowerLeg: lowerLegL } = buildLeg(-1);
  const { leg: rightLeg, lowerLeg: lowerLegR } = buildLeg(1);

  // --- 1.5 Left Arm & Warrior-Specific Shield (Hoplon / Aspis / Zeus Aegis) ---
  const armGeo = new THREE.CylinderGeometry(0.084 * S, 0.074 * S, 0.44 * S, 10);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.36 * S, 1.34 * S, 0);

  // Left Shoulder Pauldrons (progressively larger T2 -> T4)
  const pauldronL = addMesh(
    leftArm,
    new THREE.SphereGeometry(0.145 * S, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    armorMat
  );
  pauldronL.position.set(0, 0.05 * S, 0);
  regTier(pauldronL, kind === 'myrmidon' ? 1 : 2);

  const pauldronTrimL = addMesh(
    leftArm,
    new THREE.TorusGeometry(0.148 * S, 0.022 * S, 6, 14),
    accentMat
  );
  pauldronTrimL.rotation.x = Math.PI / 2;
  pauldronTrimL.position.set(0, 0.04 * S, 0);
  regTier(pauldronTrimL, 3);

  if (kind === 'myrmidon') {
    const spikeL = addMesh(leftArm, new THREE.ConeGeometry(0.055 * S, 0.18 * S, 6), accentMat);
    spikeL.position.set(-0.10 * S, 0.17 * S, 0);
    spikeL.rotation.z = 0.6;
    regTier(spikeL, 2);
  }

  const armMeshL = addMesh(leftArm, armGeo, skinMat);
  armMeshL.position.set(0, -0.22 * S, 0.06 * S);
  armMeshL.rotation.x = -0.35;

  // Forearm Vambrace (T3-T4)
  const bracerL = addMesh(leftArm, new THREE.CylinderGeometry(0.088 * S, 0.08 * S, 0.22 * S, 10), armorMat);
  bracerL.position.set(0, -0.29 * S, 0.10 * S);
  bracerL.rotation.x = -0.35;
  regTier(bracerL, 3);

  // Shield Assembly
  const shieldGroup = new THREE.Group();
  const shieldScale = kind === 'hipaspist' ? 0.84 : kind === 'myrmidon' ? 0.96 : 1.04;
  shieldGroup.scale.setScalar(shieldScale);
  shieldGroup.position.set(-0.14 * S, -0.20 * S, 0.28 * S);
  shieldGroup.rotation.y = 0.25;

  const shieldDisc = addMesh(shieldGroup, geos.domedShield, shieldFrontMat);
  const rimMesh = addMesh(shieldGroup, new THREE.TorusGeometry(0.535 * S, 0.036 * S, 8, 24), armorMat);
  rimMesh.position.z = 0.015 * S;

  // Extra Shield Boss / Gold Stud Ring on T3-T4
  const shieldBoss = addMesh(shieldGroup, new THREE.SphereGeometry(0.095 * S, 10, 8), accentMat);
  shieldBoss.scale.set(1, 1, 0.55);
  shieldBoss.position.z = 0.09 * S;
  regTier(shieldBoss, kind === 'hoplite' ? 4 : 3);

  const porpax = addMesh(
    shieldGroup,
    new THREE.CylinderGeometry(0.14 * S, 0.14 * S, 0.06 * S, 8, 1, true),
    leatherMat
  );
  porpax.position.z = -0.04 * S;
  porpax.rotation.x = Math.PI / 2;
  leftArm.add(shieldGroup);
  upper.add(leftArm);

  // --- 1.6 Right Arm & Warrior-Specific Weapon (Doru Spear / Kopis / Zeus Xiphos) ---
  const rightArm = new THREE.Group();
  rightArm.position.set(0.36 * S, 1.34 * S, -0.04 * S);

  const pauldronR = addMesh(
    rightArm,
    new THREE.SphereGeometry(0.145 * S, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    armorMat
  );
  pauldronR.position.set(0, 0.05 * S, 0);
  regTier(pauldronR, kind === 'myrmidon' ? 1 : 2);

  const pauldronTrimR = addMesh(
    rightArm,
    new THREE.TorusGeometry(0.148 * S, 0.022 * S, 6, 14),
    accentMat
  );
  pauldronTrimR.rotation.x = Math.PI / 2;
  pauldronTrimR.position.set(0, 0.04 * S, 0);
  regTier(pauldronTrimR, 3);

  if (kind === 'myrmidon') {
    const spikeR = addMesh(rightArm, new THREE.ConeGeometry(0.055 * S, 0.18 * S, 6), accentMat);
    spikeR.position.set(0.10 * S, 0.17 * S, 0);
    spikeR.rotation.z = -0.6;
    regTier(spikeR, 2);
  }

  const armMeshR = addMesh(rightArm, armGeo, skinMat);
  armMeshR.position.set(0, -0.22 * S, 0.08 * S);
  armMeshR.rotation.x = -0.45;

  const bracerR = addMesh(rightArm, new THREE.CylinderGeometry(0.088 * S, 0.08 * S, 0.22 * S, 10), armorMat);
  bracerR.position.set(0, -0.29 * S, 0.12 * S);
  bracerR.rotation.x = -0.45;
  regTier(bracerR, 3);

  // Weapon Group attached to Right Hand
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(0.06 * S, -0.34 * S, 0.19 * S);

  if (kind === 'hoplite') {
    // HOPLITE: Long Doru Phalanx Spear
    weaponGroup.rotation.x = Math.PI / 2.35;
    const shaft = addMesh(weaponGroup, new THREE.CylinderGeometry(0.025 * S, 0.025 * S, 2.75 * S, 8), woodShaftMat);
    shaft.position.y = 0.45 * S;

    const spearHead = addMesh(weaponGroup, geos.spearBlade, bladeMat);
    spearHead.position.y = 1.76 * S;

    const collar = addMesh(weaponGroup, new THREE.CylinderGeometry(0.038 * S, 0.036 * S, 0.14 * S, 8), accentMat);
    collar.position.y = 1.72 * S;

    const goldRing = addMesh(weaponGroup, new THREE.TorusGeometry(0.036 * S, 0.012 * S, 6, 12), accentMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 1.15 * S;
    regTier(goldRing, 3);

    const sauroter = addMesh(weaponGroup, new THREE.ConeGeometry(0.052 * S, 0.32 * S, 6), armorMat);
    sauroter.rotation.x = Math.PI;
    sauroter.position.y = -0.98 * S;
  } else if (kind === 'hipaspist') {
    // HYPASPIST: Curved Greek Kopis Sabre
    weaponGroup.rotation.x = Math.PI / 2.1;
    const pommel = addMesh(weaponGroup, new THREE.SphereGeometry(0.045 * S, 8, 8), accentMat);
    pommel.position.y = -0.14 * S;
    const grip = addMesh(weaponGroup, new THREE.CylinderGeometry(0.028 * S, 0.03 * S, 0.22 * S, 8), leatherMat);
    grip.position.y = -0.02 * S;
    const guard = addMesh(weaponGroup, new THREE.BoxGeometry(0.14 * S, 0.04 * S, 0.06 * S), accentMat);
    guard.position.y = 0.09 * S;
    const blade = addMesh(weaponGroup, geos.kopisBlade, bladeMat);
    blade.position.set(0, 0.10 * S, 0);
    blade.rotation.y = Math.PI / 2;
  } else {
    // MYRMIDON: Broad Leaf-Shaped Xiphos + Storm Lightning Aura
    weaponGroup.rotation.x = Math.PI / 2.1;
    const pommel = addMesh(weaponGroup, new THREE.OctahedronGeometry(0.055 * S, 0), accentMat);
    pommel.position.y = -0.16 * S;
    const grip = addMesh(weaponGroup, new THREE.CylinderGeometry(0.032 * S, 0.034 * S, 0.24 * S, 8), leatherMat);
    grip.position.y = -0.03 * S;
    const crossguard = addMesh(weaponGroup, new THREE.BoxGeometry(0.24 * S, 0.05 * S, 0.07 * S), accentMat);
    crossguard.position.y = 0.10 * S;
    const blade = addMesh(weaponGroup, geos.xiphosBlade, bladeMat);
    blade.position.set(0, 0.12 * S, 0);

    // Subtle lightning sheath around blade (activates on T4 or Combat Fury)
    const auraMesh = addMesh(weaponGroup, geos.xiphosBlade, lightningAuraMat);
    auraMesh.position.set(0, 0.12 * S, 0);
    auraMesh.scale.set(1.38, 1.05, 1.8);
    auraMesh.castShadow = false;
    auraMesh.receiveShadow = false;
  }

  rightArm.add(weaponGroup);
  upper.add(rightArm);

  // Lightning Spark Ring around Myrmidon shoulders/torso for Combat Fury & T4
  const furyRing = new THREE.Mesh(new THREE.TorusGeometry(0.55 * S, 0.018 * S, 6, 20), lightningAuraMat);
  furyRing.rotation.x = Math.PI / 2;
  furyRing.position.set(0, 0.2 * S, 0);
  if (kind === 'myrmidon') {
    group3D.add(furyRing);
  }

  root.add(group3D);

  // ==========================================
  // 2. 2D / 2.5D SPRITE SHEET BILLBOARD
  // ==========================================
  const groupSprite = new THREE.Group();
  groupSprite.visible = false;

  const isoSpriteTexture = getHopliteSpriteTexture().clone();
  const uvPaperDollTexture = getUvPaperDollSpriteSheetTexture(currentTier, team).clone();
  const cols = 6;
  const rows = 3;

  const spriteShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  spriteShadowMesh.rotation.x = -Math.PI / 2;
  spriteShadowMesh.position.set(0, 0.02, 0);
  spriteShadowMesh.userData.ignoreRaycast = true;
  groupSprite.add(spriteShadowMesh);

  const spriteMat = new THREE.MeshBasicMaterial({
    map: uvPaperDollTexture,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.DoubleSide,
  });

  const planeGeo = new THREE.PlaneGeometry(1.18, 1.48);
  const spriteMesh = new THREE.Mesh(planeGeo, spriteMat);
  spriteMesh.position.set(0, 0.74, 0);
  groupSprite.add(spriteMesh);

  root.add(groupSprite);

  // ==========================================
  // 3. 2.5D BRG VERTEX-CACHE MORPHING MODEL
  // ==========================================
  const groupBrg = new THREE.Group();
  groupBrg.visible = false;
  const { geometry: brgGeo, animState: brgAnimState } = buildBrgHopliteGeometry();
  const brgMat = new THREE.MeshStandardMaterial({
    map: uvTex,
    roughness: 0.35,
    metalness: 0.35,
  });
  const brgMesh = new THREE.Mesh(brgGeo, brgMat);
  if (enableShadows) {
    brgMesh.castShadow = true;
    brgMesh.receiveShadow = true;
  }
  brgMesh.scale.set(0.76, 0.76, 0.76);
  brgMesh.position.set(0, 0.56, 0);
  groupBrg.add(brgMesh);

  const brgShadow = new THREE.Mesh(shadowGeo, shadowMat);
  brgShadow.rotation.x = -Math.PI / 2;
  brgShadow.position.set(0, 0.02, 0);
  brgShadow.userData.ignoreRaycast = true;
  groupBrg.add(brgShadow);

  root.add(groupBrg);

  // ==========================================
  // 4. METADATA & CONTROLLERS
  // ==========================================
  root.userData.isSpriteSheet = true;
  root.userData.group3D = group3D;
  root.userData.groupSprite = groupSprite;
  root.userData.groupBrg = groupBrg;
  root.userData.spriteMesh = spriteMesh;
  root.userData.texture = uvPaperDollTexture;
  root.userData.cols = cols;
  root.userData.rows = rows;
  root.userData.currentFrame = 0;
  root.userData.armorTier = currentTier;
  root.userData.warriorKind = kind;

  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  root.userData.headGroup = headGroup;

  const weaponStyle: GreekWeaponStyle = kind === 'hoplite' ? 'spear' : 'sword';
  const poseAnimator = new HopliteAnimator(
    {
      spine,
      upper,
      head: headGroup,
      legL: leftLeg,
      legR: rightLeg,
      lowerLegL,
      lowerLegR,
      armL: leftArm,
      armR: rightArm,
    },
    weaponStyle
  );

  let animClock = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    animClock += dt;
    poseAnimator.update(dt, moving, speed, attackT);
    if (kind === 'myrmidon') {
      const baseGlow = currentTier === 4 ? 0.22 : 0.0;
      const furyGlow = combatFury * 0.65;
      const pulse = 0.85 + Math.sin(animClock * 9.0) * 0.15;
      lightningAuraMat.opacity = Math.min(0.85, (baseGlow + furyGlow) * pulse);
      furyRing.rotation.z = animClock * (2.5 + combatFury * 4.5);
      furyRing.position.y = 0.18 * S + Math.sin(animClock * 4.2) * 0.08 * S;
    }
  };

  root.userData.setCombatFury = (furyRatio: number) => {
    combatFury = Math.max(0, Math.min(1, furyRatio));
    if (kind === 'myrmidon') {
      bladeMat.emissiveIntensity =
        (currentTier === 4 ? 0.35 : 0.08) + combatFury * 1.15;
    }
  };

  root.userData.setFrame = (frameIndex: number) => {
    const activeTex = root.userData.texture as THREE.Texture;
    const col = frameIndex % cols;
    const row = Math.floor(frameIndex / cols);
    activeTex.repeat.set(1 / cols, 1 / rows);
    activeTex.offset.set(col / cols, 1 - (row + 1) / rows);
  };

  root.userData.setArmorTier = (tier: HopliteArmorTier) => {
    currentTier = tier;
    root.userData.armorTier = tier;
    const nextUvTex = getHopliteUvTexture(tier);
    const nextPal = getTierPalette(kind, tier, team);

    brgMat.map = nextUvTex;
    brgMat.needsUpdate = true;

    // Update PBR armor/accent/greave/blade/crest/tunic materials
    armorMat.color.setHex(nextPal.armorHex);
    armorMat.roughness = nextPal.roughness;
    armorMat.metalness = nextPal.metalness;
    armorMat.emissive.setHex(nextPal.emissiveHex);
    armorMat.emissiveIntensity = nextPal.emissiveIntensity;

    accentMat.color.setHex(nextPal.accentHex);
    accentMat.emissive.setHex(kind === 'myrmidon' && tier >= 3 ? 0x451a03 : 0x000000);
    accentMat.emissiveIntensity = kind === 'myrmidon' && tier >= 3 ? 0.25 : 0;

    greaveMat.color.setHex(nextPal.greaveHex);
    greaveMat.roughness = nextPal.roughness + 0.04;
    greaveMat.metalness = nextPal.metalness;

    bladeMat.color.setHex(nextPal.bladeHex);
    bladeMat.emissive.setHex(kind === 'myrmidon' && tier === 4 ? 0x38bdf8 : 0x000000);
    bladeMat.emissiveIntensity = (kind === 'myrmidon' && tier === 4 ? 0.35 : 0.0) + combatFury * 1.15;

    crestMat.color.setHex(nextPal.crestHex);
    tunicMat.color.setHex(nextPal.tunicHex);

    // Swap procedural shield texture to match Warrior Kind + Tier
    shieldFrontMat.map = getWarriorShieldTexture(kind, tier, team);
    shieldFrontMat.needsUpdate = true;

    // Toggle tier-progressive 3D armor pieces!
    for (const entry of tierGatedParts) {
      entry.obj.visible =
        tier >= entry.minTier && (entry.maxTier === undefined || tier <= entry.maxTier);
    }

    if (currentMode === 'uv2d') {
      const nextSheet = getUvPaperDollSpriteSheetTexture(tier, team).clone();
      spriteMat.map = nextSheet;
      spriteMat.needsUpdate = true;
      root.userData.texture = nextSheet;
      root.userData.setFrame(root.userData.currentFrame || 0);
    }
  };

  root.userData.setMode = (mode: HopliteRenderMode) => {
    currentMode = mode;
    if (mode === '3d') {
      group3D.visible = true;
      groupSprite.visible = false;
      groupBrg.visible = false;
    } else if (mode === 'brg') {
      group3D.visible = false;
      groupSprite.visible = false;
      groupBrg.visible = true;
    } else if (mode === 'uv2d') {
      group3D.visible = false;
      groupSprite.visible = true;
      groupBrg.visible = false;
      const sheet = getUvPaperDollSpriteSheetTexture(currentTier, team).clone();
      spriteMat.map = sheet;
      spriteMat.needsUpdate = true;
      root.userData.texture = sheet;
      root.userData.setFrame(root.userData.currentFrame || 0);
    } else {
      group3D.visible = false;
      groupSprite.visible = true;
      groupBrg.visible = false;
      spriteMat.map = isoSpriteTexture;
      spriteMat.needsUpdate = true;
      root.userData.texture = isoSpriteTexture;
      root.userData.setFrame(root.userData.currentFrame || 0);
    }
  };

  const brgPosAttr = brgGeo.getAttribute('position') as THREE.BufferAttribute;
  const brgNormAttr = brgGeo.getAttribute('normal') as THREE.BufferAttribute;
  root.userData.updateBrg = (dt: number, state: string) => {
    if (!groupBrg.visible) return;
    const clipName = state === 'attack' ? 'attack' : state === 'move' ? 'walk' : 'idle';
    brgAnimState.play(clipName);
    const anim = brgAnimState.update(dt);
    if (anim) {
      evaluateBrgClip(anim.clip, anim.t, brgPosAttr.array as Float32Array, brgNormAttr.array as Float32Array);
      brgPosAttr.needsUpdate = true;
      brgNormAttr.needsUpdate = true;
    }
  };

  root.userData.setFrame(0);
  return root;
}
