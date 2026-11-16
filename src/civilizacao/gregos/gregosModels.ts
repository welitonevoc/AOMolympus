import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { buildBrgHopliteGeometry, evaluateBrgClip, remapUvRegion64 } from '../../game/brgAnimation';

export type HopliteArmorTier = 1 | 2 | 3 | 4;
export type HopliteRenderMode = '3d' | 'brg' | 'uv2d' | 'sprite';

export interface HopliteUvTierSpec {
  tier: HopliteArmorTier;
  id: string;
  name: string;
  subtitle: string;
  url: string;
  armorHex: number;
  accentHex: number;
  greaveHex: number;
}

export const AOM_HOPLITE_UV_TIERS: Record<HopliteArmorTier, HopliteUvTierSpec> = {
  1: {
    tier: 1,
    id: 'map_01',
    name: 'Hoplita Padrão (Map 01)',
    subtitle: 'Era Arcaica / Clássica — Couraça de Couro & Bronze',
    url: '/assets/aistudio/infantry_g_hoplite_map_01_66c270c4.png',
    armorHex: 0xb4783c,
    accentHex: 0xd97706,
    greaveHex: 0x8b5a2b,
  },
  2: {
    tier: 2,
    id: 'map_02',
    name: 'Hoplita Médio (Map 02)',
    subtitle: 'Era Heroica — Peitoral de Bronze Forjado',
    url: '/assets/aistudio/infantry_g_hoplite_map_02_e1e4f7fd.png',
    armorHex: 0xc88b22,
    accentHex: 0xf59e0b,
    greaveHex: 0xb47828,
  },
  3: {
    tier: 3,
    id: 'map_03',
    name: 'Hoplita Pesado (Map 03)',
    subtitle: 'Era Mítica — Couraça Muscular & Grevas de Ouro',
    url: '/assets/aistudio/infantry_g_hoplite_map_03_fb1ce0e0.png',
    armorHex: 0xfacc15,
    accentHex: 0xfef08a,
    greaveHex: 0xeab308,
  },
  4: {
    tier: 4,
    id: 'map_04',
    name: 'Hoplita Campeão (Map 04)',
    subtitle: 'Era dos Titãs — Armadura Muscular de Prata & Aço',
    url: '/assets/aistudio/infantry_g_hoplite_map_04_2dddf78e.png',
    armorHex: 0xe2e8f0,
    accentHex: 0xf8fafc,
    greaveHex: 0xcbd5e1,
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
    description: 'Olhos, sobrancelhas, nariz, boca e queixo do Hoplita (14,26 → 23,42)',
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
    description: 'Barra inferior de linho branco pregueado sob o faldão (1,52 → 35,63)',
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
let cachedHoplonTexture: THREE.CanvasTexture | null = null;
const cachedUvTextures = new Map<HopliteArmorTier, THREE.Texture>();
const cachedUvImages = new Map<HopliteArmorTier, HTMLImageElement>();
const cachedPaperDollSheets = new Map<string, THREE.CanvasTexture>();

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
  // Crisp pixel-art/retro filtering faithful to 64x64 AoM DDT textures
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

/**
 * Draws a single 2D articulated Paper-Doll frame of the Hoplite on a 2D CanvasContext
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

  // Animation kinematics
  const phase = (col / 6) * Math.PI * 2;
  const isWalk = row === 1;
  const isAttack = row === 2;

  const stride = isWalk ? Math.sin(phase) * 22 : isAttack ? Math.sin((col / 5) * Math.PI) * 18 : 0;
  const bobY = isWalk ? -Math.abs(Math.cos(phase)) * 7 : isAttack ? -Math.sin((col / 5) * Math.PI) * 5 : Math.sin(phase) * 2;
  const thrust = isAttack ? Math.sin((col / 5) * Math.PI) : 0;
  const bodyLean = isWalk ? 0.08 : isAttack ? thrust * 0.22 : 0;

  // Helper to draw a cropped UV region from the 64x64 image or fallback color
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

  // 1. Back Spear (Doru) +Right Arm (drawn behind or lunging)
  ctx.save();
  ctx.translate(18 + thrust * 26, -24 + thrust * 4);
  ctx.rotate(isAttack ? 0.15 + thrust * 0.32 : isWalk ? -0.15 + Math.sin(phase) * 0.18 : -0.25);
  // Arm slice [2, 27, 11, 9]
  drawUvSlice(2, 27, 11, 9, -8, -6, 26, 16, '#d69e72');
  // Spear shaft
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-85, 2, 195, 5);
  // Spearhead steel
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(110, -3);
  ctx.lineTo(138, 4.5);
  ctx.lineTo(110, 12);
  ctx.closePath();
  ctx.fill();
  // Bronze butt-spike
  ctx.fillStyle = armorCss;
  ctx.fillRect(-93, 1, 9, 7);
  ctx.restore();

  // 2. Back Leg (Right Leg)
  ctx.save();
  ctx.translate(12 - stride * 0.65, 22);
  ctx.rotate((-stride * Math.PI) / 140);
  // Thigh [44, 52, 14, 11]
  drawUvSlice(44, 52, 14, 11, -10, 0, 20, 26, '#d69e72');
  // Greave [5, 16, 8, 9]
  drawUvSlice(5, 16, 8, 9, -9, 24, 18, 28, armorCss);
  // Sandal [29, 1, 25, 10]
  drawUvSlice(29, 1, 25, 10, -10, 48, 26, 12, '#5a3418');
  ctx.restore();

  // 3. Front Leg (Left Leg)
  ctx.save();
  ctx.translate(-12 + stride * 0.65, 22);
  ctx.rotate((stride * Math.PI) / 140);
  // Thigh [44, 52, 14, 11]
  drawUvSlice(44, 52, 14, 11, -10, 0, 20, 26, '#d69e72');
  // Greave [5, 16, 8, 9]
  drawUvSlice(5, 16, 8, 9, -9, 24, 18, 28, armorCss);
  // Sandal [29, 1, 25, 10]
  drawUvSlice(29, 1, 25, 10, -10, 48, 26, 12, '#5a3418');
  ctx.restore();

  // 4. Pleated White Chiton Skirt [1, 52, 34, 11]
  drawUvSlice(1, 52, 34, 11, -26, 12, 52, 18, '#e2e8f0');

  // 5. Leather Pteruges Battle Skirt [1, 43, 35, 9]
  drawUvSlice(1, 43, 35, 9, -28, -4, 56, 20, '#78350f');

  // 6. Torso & Muscle Cuirass [42, 24, 21, 27]
  drawUvSlice(42, 24, 21, 27, -25, -52, 50, 52, armorCss);

  // Team color belt sash
  ctx.fillStyle = teamCss;
  ctx.fillRect(-26, -6, 52, 5);

  // 7. Head, Face [14, 26, 9, 16] & Corinthian Helmet
  ctx.save();
  ctx.translate(0, -68);
  // Horsehair Scarlet Crest Plume
  ctx.fillStyle = team === 'enemy' ? '#991b1b' : '#dc2626';
  ctx.beginPath();
  ctx.arc(0, -14, 24, Math.PI * 0.85, Math.PI * 2.15);
  ctx.fill();
  ctx.fillStyle = accentCss;
  ctx.fillRect(-14, -18, 28, 5);

  // Helmet Dome
  ctx.fillStyle = armorCss;
  ctx.beginPath();
  ctx.arc(0, -2, 17, Math.PI, 0);
  ctx.fill();

  // AoM Painted Face [14, 26, 9, 16]
  drawUvSlice(14, 26, 9, 16, -12, -6, 24, 26, '#e5b887');

  // Helmet Cheekguards
  ctx.fillStyle = armorCss;
  ctx.fillRect(-15, -2, 5, 18);
  ctx.fillRect(10, -2, 5, 18);
  ctx.restore();

  // 8. Left Arm & Spartan Hoplon Shield
  ctx.save();
  ctx.translate(-22 + thrust * 8, -22);
  // Shield Disc with Lambda
  ctx.fillStyle = armorCss;
  ctx.beginPath();
  ctx.arc(0, 8, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accentCss;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // Spartan Lambda (Λ)
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

/**
 * Generates an 18-frame (6 cols x 3 rows) 2D Sprite Sheet CanvasTexture assembled directly
 * from the uploaded 64x64 AoM UV texture map!
 */
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

/**
 * Procedural authentic Greek Hoplon / Aspis Shield face texture.
 * Features a circular polished bronze gradient field, outer bronze rim with 28 gold studs,
 * and the iconic crimson Spartan Lambda (Λ) glyph emblazoned in the center with 3D drop shadow.
 */
function getHoplonShieldTexture(): THREE.CanvasTexture {
  if (cachedHoplonTexture) return cachedHoplonTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(230, 210, 30, 256, 256, 250);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.32, '#d97706');
  grad.addColorStop(0.68, '#b45309');
  grad.addColorStop(0.88, '#78350f');
  grad.addColorStop(1, '#92400e');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(256, 256, 250, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(69, 26, 3, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 210, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 256, 206, 0, Math.PI * 2);
  ctx.stroke();

  const studCount = 28;
  for (let i = 0; i < studCount; i++) {
    const angle = (i / studCount) * Math.PI * 2;
    const sx = 256 + Math.cos(angle) * 232;
    const sy = 256 + Math.sin(angle) * 232;

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 7;

  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(256, 105);
  ctx.lineTo(365, 385);
  ctx.lineTo(300, 385);
  ctx.lineTo(256, 220);
  ctx.lineTo(212, 385);
  ctx.lineTo(147, 385);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedHoplonTexture = tex;
  return cachedHoplonTexture;
}

export function createGreekUnitMesh(
  kind: 'hoplite' | 'hipaspist',
  team: TeamId,
  _pal: MaterialPalette,
  enableShadows: boolean,
  initialTier: HopliteArmorTier = 3
): THREE.Group {
  const root = new THREE.Group();
  let currentTier: HopliteArmorTier = initialTier;
  let currentMode: HopliteRenderMode = '3d';

  const uvTex = getHopliteUvTexture(currentTier);
  const tierSpec = AOM_HOPLITE_UV_TIERS[currentTier];

  // Shared UV-mapped material powered by the uploaded 64x64 AoM texture!
  const uvBodyMat = new THREE.MeshStandardMaterial({
    map: uvTex,
    roughness: 0.42,
    metalness: 0.18,
  });

  const uvArmorMat = new THREE.MeshStandardMaterial({
    map: uvTex,
    roughness: 0.28,
    metalness: 0.62,
  });

  const bronzeArmorMat = new THREE.MeshStandardMaterial({
    color: tierSpec.armorHex,
    roughness: 0.28,
    metalness: 0.82,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: tierSpec.accentHex,
    roughness: 0.22,
    metalness: 0.9,
  });

  const tunicRedMat = new THREE.MeshStandardMaterial({
    color: team === 'enemy' ? 0x991b1b : 0xb91c1c,
    roughness: 0.72,
    metalness: 0.05,
  });

  const crestRedMat = new THREE.MeshStandardMaterial({
    color: team === 'enemy' ? 0x991b1b : 0xdc2626,
    roughness: 0.85,
    metalness: 0.05,
  });

  const woodShaftMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.78,
    metalness: 0.05,
  });

  const spearSteelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.95,
  });

  const shieldFrontMat = new THREE.MeshStandardMaterial({
    map: getHoplonShieldTexture(),
    roughness: 0.35,
    metalness: 0.7,
  });

  // ==========================================
  // 1. TRUE 3D VOLUMETRIC HOPLITE MAPPED WITH AOM 64x64 UV ATLAS
  // ==========================================
  const group3D = new THREE.Group();
  const S = 0.58; // Unit scale matching AoM RTS proportions

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

  // --- 1.2 Torso & Muscled Cuirass (UV Mapped to [42, 24, 63, 51]) ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.98 * S, 0);

  // Anatomical Muscled Breastplate mapped directly to the uploaded AoM Cuirass UV region!
  const cuirassGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.29 * S, 0.26 * S, 0.58 * S, 16, 2),
    42, 24, 63, 51
  );
  cuirassGeo.rotateY(Math.PI); // align front UV seam forward
  const cuirass = addMesh(torsoGroup, cuirassGeo, uvArmorMat);
  cuirass.position.y = 0.28 * S;

  // Sculpted pectoral muscle relief mapped to upper cuirass [44, 25, 62, 42]
  const pecGeo = remapUvRegion64(new THREE.SphereGeometry(0.11 * S, 10, 8), 44, 35, 62, 48);
  const leftPec = addMesh(torsoGroup, pecGeo, uvArmorMat);
  leftPec.scale.set(1.1, 0.75, 0.45);
  leftPec.position.set(-0.11 * S, 0.40 * S, 0.23 * S);

  const rightPec = addMesh(torsoGroup, pecGeo, uvArmorMat);
  rightPec.scale.set(1.1, 0.75, 0.45);
  rightPec.position.set(0.11 * S, 0.40 * S, 0.23 * S);

  // Belt in faction / accent trim
  const belt = addMesh(torsoGroup, new THREE.CylinderGeometry(0.28 * S, 0.28 * S, 0.07 * S, 14), goldAccentMat);
  belt.position.y = 0.02 * S;

  // Pleated White Chiton Skirt Hem mapped to AoM UV [1, 52, 35, 63]
  const chitonSkirtGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.28 * S, 0.39 * S, 0.36 * S, 16),
    1, 52, 35, 63
  );
  const skirtPleats = addMesh(torsoGroup, chitonSkirtGeo, uvBodyMat);
  skirtPleats.position.y = -0.18 * S;

  // Leather Pteruges Battle Skirt Strips mapped to AoM UV [1, 43, 36, 52]
  const pterugesGeo = remapUvRegion64(
    new THREE.CylinderGeometry(0.29 * S, 0.36 * S, 0.24 * S, 16),
    1, 43, 36, 52
  );
  const pterugesMesh = addMesh(torsoGroup, pterugesGeo, uvBodyMat);
  pterugesMesh.position.y = -0.10 * S;

  const pterugesCount = 10;
  const ptStripGeo = remapUvRegion64(new THREE.BoxGeometry(0.07 * S, 0.30 * S, 0.024 * S), 2, 43, 14, 52);
  for (let i = 0; i < pterugesCount; i++) {
    const angle = (i / pterugesCount) * Math.PI * 2;
    const px = Math.sin(angle) * 0.31 * S;
    const pz = Math.cos(angle) * 0.31 * S;
    const pt = addMesh(torsoGroup, ptStripGeo, uvBodyMat);
    pt.position.set(px, -0.14 * S, pz);
    pt.rotation.y = angle;
  }
  group3D.add(torsoGroup);

  // --- 1.3 Head & Painted AoM Face [14, 26, 23, 42] + Corinthian Helmet ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.72 * S, 0);

  // Neck mapped to skin [15, 36, 22, 42]
  const neckGeo = remapUvRegion64(new THREE.CylinderGeometry(0.09 * S, 0.10 * S, 0.16 * S, 8), 15, 36, 22, 42);
  const neck = addMesh(headGroup, neckGeo, uvBodyMat);
  neck.position.y = -0.06 * S;

  // Face inside helmet mapped directly to the AoM painted face [14, 26, 23, 42]!
  const faceGeo = remapUvRegion64(new THREE.SphereGeometry(0.185 * S, 14, 12), 14, 26, 23, 42);
  faceGeo.rotateY(-Math.PI / 2); // Orient UV center toward +Z (front of face)
  const face = addMesh(headGroup, faceGeo, uvBodyMat);
  face.position.set(0, 0.12 * S, 0.03 * S);

  // Corinthian Helmet Dome
  const helmDome = addMesh(
    headGroup,
    new THREE.SphereGeometry(0.24 * S, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.68),
    bronzeArmorMat
  );
  helmDome.position.set(0, 0.15 * S, 0);

  // Cheek guards (left & right) leaving the AoM painted eyes/nose/mouth visible!
  const cheekGeo = new THREE.BoxGeometry(0.05 * S, 0.22 * S, 0.16 * S);
  const leftCheek = addMesh(headGroup, cheekGeo, bronzeArmorMat);
  leftCheek.position.set(-0.19 * S, 0.04 * S, 0.07 * S);
  leftCheek.rotation.y = 0.25;

  const rightCheek = addMesh(headGroup, cheekGeo, bronzeArmorMat);
  rightCheek.position.set(0.19 * S, 0.04 * S, 0.07 * S);
  rightCheek.rotation.y = -0.25;

  // Crest Mount Box
  const crestBase = addMesh(headGroup, new THREE.BoxGeometry(0.065 * S, 0.08 * S, 0.44 * S), goldAccentMat);
  crestBase.position.set(0, 0.38 * S, -0.02 * S);

  // Scarlet Horsehair Crest (Sweeping Arch)
  const crestShape = new THREE.Shape();
  crestShape.moveTo(0.24 * S, -0.04 * S);
  crestShape.quadraticCurveTo(0.26 * S, 0.28 * S, 0.08 * S, 0.38 * S);
  crestShape.quadraticCurveTo(-0.16 * S, 0.40 * S, -0.34 * S, 0.20 * S);
  crestShape.quadraticCurveTo(-0.40 * S, -0.06 * S, -0.30 * S, -0.16 * S);
  crestShape.quadraticCurveTo(-0.26 * S, 0.06 * S, -0.14 * S, 0.20 * S);
  crestShape.quadraticCurveTo(0.08 * S, 0.24 * S, 0.18 * S, 0.0);
  crestShape.closePath();

  const crestGeo = new THREE.ExtrudeGeometry(crestShape, {
    depth: 0.065 * S,
    bevelEnabled: true,
    bevelThickness: 0.015 * S,
    bevelSize: 0.015 * S,
    bevelSegments: 2,
  });
  crestGeo.center();
  const crestMesh = addMesh(headGroup, crestGeo, crestRedMat);
  crestMesh.position.set(0, 0.58 * S, -0.04 * S);
  crestMesh.rotation.y = Math.PI / 2;

  group3D.add(headGroup);

  // --- 1.4 Legs with UV-Mapped Thighs [44,52,58,63], Greaves [5,16,13,25] & Sandals [29,1,54,11] ---
  const thighGeo = remapUvRegion64(new THREE.CylinderGeometry(0.10 * S, 0.085 * S, 0.34 * S, 10), 44, 52, 58, 63);
  const greaveGeo = remapUvRegion64(new THREE.CylinderGeometry(0.092 * S, 0.074 * S, 0.38 * S, 10), 5, 16, 13, 25);
  const sandalGeo = remapUvRegion64(new THREE.BoxGeometry(0.098 * S, 0.065 * S, 0.22 * S), 29, 1, 54, 11);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14 * S, 0.72 * S, 0);
  const thighL = addMesh(leftLeg, thighGeo, uvBodyMat);
  thighL.position.y = -0.17 * S;
  const kneeL = addMesh(leftLeg, new THREE.SphereGeometry(0.075 * S, 8, 8), bronzeArmorMat);
  kneeL.position.set(0, -0.34 * S, 0.02 * S);
  const greaveL = addMesh(leftLeg, greaveGeo, uvArmorMat);
  greaveL.position.set(0, -0.52 * S, 0.01 * S);
  const footL = addMesh(leftLeg, sandalGeo, uvBodyMat);
  footL.position.set(0, -0.69 * S, 0.05 * S);
  group3D.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14 * S, 0.72 * S, 0);
  const thighR = addMesh(rightLeg, thighGeo, uvBodyMat);
  thighR.position.y = -0.17 * S;
  const kneeR = addMesh(rightLeg, new THREE.SphereGeometry(0.075 * S, 8, 8), bronzeArmorMat);
  kneeR.position.set(0, -0.34 * S, 0.02 * S);
  const greaveR = addMesh(rightLeg, greaveGeo, uvArmorMat);
  greaveR.position.set(0, -0.52 * S, 0.01 * S);
  const footR = addMesh(rightLeg, sandalGeo, uvBodyMat);
  footR.position.set(0, -0.69 * S, 0.05 * S);
  group3D.add(rightLeg);

  // --- 1.5 Left Arm [2,27,13,36] & Hoplon Shield with Spartan Lambda (Λ) ---
  const armGeo = remapUvRegion64(new THREE.CylinderGeometry(0.082 * S, 0.075 * S, 0.44 * S, 10), 2, 27, 13, 36);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.36 * S, 1.34 * S, 0);
  const pauldronL = addMesh(leftArm, new THREE.SphereGeometry(0.13 * S, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), bronzeArmorMat);
  pauldronL.position.set(0, 0.06 * S, 0);
  const armMeshL = addMesh(leftArm, armGeo, uvBodyMat);
  armMeshL.position.set(0, -0.22 * S, 0.06 * S);
  armMeshL.rotation.x = -0.35;

  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(-0.14 * S, -0.20 * S, 0.28 * S);
  shieldGroup.rotation.y = 0.25;
  const shieldDisc = addMesh(shieldGroup, new THREE.CylinderGeometry(0.55 * S, 0.53 * S, 0.05 * S, 24), shieldFrontMat);
  shieldDisc.rotation.x = Math.PI / 2;
  const rimMesh = addMesh(shieldGroup, new THREE.TorusGeometry(0.55 * S, 0.035 * S, 8, 24), bronzeArmorMat);
  rimMesh.position.z = 0.025 * S;
  const porpax = addMesh(shieldGroup, new THREE.CylinderGeometry(0.14 * S, 0.14 * S, 0.06 * S, 8, 1, true), bronzeArmorMat);
  porpax.position.z = -0.04 * S;
  porpax.rotation.x = Math.PI / 2;
  leftArm.add(shieldGroup);
  group3D.add(leftArm);

  // --- 1.6 Right Arm [2,27,13,36] & Doru Spear ---
  const rightArm = new THREE.Group();
  rightArm.position.set(0.36 * S, 1.34 * S, -0.05 * S);
  const pauldronR = addMesh(rightArm, new THREE.SphereGeometry(0.13 * S, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), bronzeArmorMat);
  pauldronR.position.set(0, 0.06 * S, 0);
  const armMeshR = addMesh(rightArm, armGeo, uvBodyMat);
  armMeshR.position.set(0, -0.22 * S, 0.08 * S);
  armMeshR.rotation.x = -0.45;

  const spearGroup = new THREE.Group();
  spearGroup.position.set(0.06 * S, -0.26 * S, 0.18 * S);
  spearGroup.rotation.x = Math.PI / 2.35;
  const shaft = addMesh(spearGroup, new THREE.CylinderGeometry(0.024 * S, 0.024 * S, 2.7 * S, 8), woodShaftMat);
  shaft.position.y = 0.45 * S;
  const spearHead = addMesh(spearGroup, new THREE.ConeGeometry(0.065 * S, 0.46 * S, 6), spearSteelMat);
  spearHead.position.y = 1.95 * S;
  const collar = addMesh(spearGroup, new THREE.CylinderGeometry(0.035 * S, 0.035 * S, 0.12 * S, 8), bronzeArmorMat);
  collar.position.y = 1.74 * S;
  const sauroter = addMesh(spearGroup, new THREE.ConeGeometry(0.05 * S, 0.32 * S, 6), bronzeArmorMat);
  sauroter.rotation.x = Math.PI;
  sauroter.position.y = -0.98 * S;
  rightArm.add(spearGroup);
  group3D.add(rightArm);

  root.add(group3D);

  // ==========================================
  // 2. 2D / 2.5D SPRITE SHEET BILLBOARD (Supports both UV Paper-Doll & Iso PNG)
  // ==========================================
  const groupSprite = new THREE.Group();
  groupSprite.visible = false; // 3D UV is active by default

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
  // 3. 2.5D BRG VERTEX-CACHE MORPHING MODEL (AoM Native BRG Engine + 64x64 UV Map)
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

  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  root.userData.headGroup = headGroup;

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
    const nextSpec = AOM_HOPLITE_UV_TIERS[tier] ?? AOM_HOPLITE_UV_TIERS[3];

    uvBodyMat.map = nextUvTex;
    uvBodyMat.needsUpdate = true;
    uvArmorMat.map = nextUvTex;
    uvArmorMat.needsUpdate = true;
    brgMat.map = nextUvTex;
    brgMat.needsUpdate = true;

    bronzeArmorMat.color.setHex(nextSpec.armorHex);
    goldAccentMat.color.setHex(nextSpec.accentHex);

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
  void kind;
  void tunicRedMat;

  return root;
}
