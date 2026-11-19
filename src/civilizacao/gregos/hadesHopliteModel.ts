import * as THREE from 'three';
import {
  animateGreekHopliteBase,
  BaseHopliteRig,
  buildGreekHopliteArenaColumns,
  buildGreekHopliteBase,
  createHopliteSkinBumpTexture,
  HopliteAction,
  HopliteTierId,
  hopliteGroup,
  hopliteSculpt,
} from './greekHopliteBase';

export type { HopliteTierId };
export type HadesHopliteAction = HopliteAction;
export type HadesHopliteRig = BaseHopliteRig;

export interface HadesHopliteTierSpec {
  tier: HopliteTierId;
  id: string;
  name: string;
  subtitle: string;
  armorHex: number;
  accentHex: number;
  greaveHex: number;
  metalness: number;
  roughness: number;
  shieldRimHex: number;
  shieldBgHex: number;
  bidentHex: number;
  crestColorHex: number;
  cloakColorHex: number;
  soulGlow: number;
}

export const HADES_HOPLITE_TIERS: Record<HopliteTierId, HadesHopliteTierSpec> = {
  1: {
    tier: 1,
    id: 'hades_01',
    name: 'Hoplita Umbral (Map 01)',
    subtitle: 'Era Arcaica — Ferro Escurecido do Submundo & Túnica Cinza-Carvão',
    armorHex: 0x3f3f46,
    accentHex: 0xea580c,
    greaveHex: 0x27272a,
    metalness: 0.62,
    roughness: 0.48,
    shieldRimHex: 0x9a3412,
    shieldBgHex: 0x09090b,
    bidentHex: 0xf97316,
    crestColorHex: 0x991b1b,
    cloakColorHex: 0x18181b,
    soulGlow: 0.25,
  },
  2: {
    tier: 2,
    id: 'hades_02',
    name: 'Hoplita Estígio (Map 02)',
    subtitle: 'Era Heroica — Bronze Infernal Forjado, Ombreiras & Crista Púrpura',
    armorHex: 0x78350f,
    accentHex: 0x10b981,
    greaveHex: 0x5c2d16,
    metalness: 0.82,
    roughness: 0.3,
    shieldRimHex: 0xea580c,
    shieldBgHex: 0x140d1f,
    bidentHex: 0x34d399,
    crestColorHex: 0x7e22ce,
    cloakColorHex: 0x2e1065,
    soulGlow: 0.55,
  },
  3: {
    tier: 3,
    id: 'hades_03',
    name: 'Hoplita de Ouro Sombrio (Map 03)',
    subtitle: 'Era Mítica — Couraça de Ouro Amaldiçoado, Escudo do Bidente & Almas do Estige',
    armorHex: 0xd97706,
    accentHex: 0x10b981,
    greaveHex: 0xb45309,
    metalness: 0.92,
    roughness: 0.2,
    shieldRimHex: 0xfacc15,
    shieldBgHex: 0x090612,
    bidentHex: 0x6ee7b7,
    crestColorHex: 0xea580c,
    cloakColorHex: 0x450a0a,
    soulGlow: 1.25,
  },
  4: {
    tier: 4,
    id: 'hades_04',
    name: 'Campeão do Tártaro (Map 04)',
    subtitle: 'Era dos Titãs — Armadura de Obsidiana & Prata Espectral com Chifres Infernais',
    armorHex: 0x1e1b2e,
    accentHex: 0x10b981,
    greaveHex: 0x2e294e,
    metalness: 0.95,
    roughness: 0.16,
    shieldRimHex: 0x10b981,
    shieldBgHex: 0x030206,
    bidentHex: 0xa7f3d0,
    crestColorHex: 0x10b981,
    cloakColorHex: 0x090514,
    soulGlow: 2.2,
  },
};

export interface HadesHopliteTextures {
  skinBump: THREE.CanvasTexture;
  chitonTex: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
  createHadesShieldTexture: (tier: HopliteTierId) => THREE.CanvasTexture;
}

let cachedTextures: HadesHopliteTextures | null = null;

export function createHadesHopliteTextures(): HadesHopliteTextures {
  const skinBump = createHopliteSkinBumpTexture();

  const chitonCanvas = document.createElement('canvas');
  chitonCanvas.width = 512;
  chitonCanvas.height = 256;
  const cCtx = chitonCanvas.getContext('2d');
  if (cCtx) {
    cCtx.fillStyle = '#27272a';
    cCtx.fillRect(0, 0, 512, 256);
    cCtx.fillStyle = 'rgba(9, 9, 11, 0.25)';
    for (let x = 0; x < 512; x += 8) cCtx.fillRect(x, 0, 3, 256);

    cCtx.fillStyle = '#450a0a';
    cCtx.fillRect(0, 198, 512, 38);
    cCtx.fillStyle = '#ea580c';
    cCtx.fillRect(0, 194, 512, 4);
    cCtx.fillRect(0, 236, 512, 4);

    cCtx.strokeStyle = '#6ee7b7';
    cCtx.lineWidth = 2.8;
    for (let x = 0; x < 512; x += 32) {
      cCtx.beginPath();
      cCtx.moveTo(x + 16, 204);
      cCtx.lineTo(x + 26, 217);
      cCtx.lineTo(x + 16, 230);
      cCtx.lineTo(x + 6, 217);
      cCtx.closePath();
      cCtx.stroke();
    }
  }
  const chitonTex = new THREE.CanvasTexture(chitonCanvas);
  chitonTex.wrapS = chitonTex.wrapT = THREE.RepeatWrapping;

  function createHadesShieldTexture(tier: HopliteTierId): THREE.CanvasTexture {
    const spec = HADES_HOPLITE_TIERS[tier] ?? HADES_HOPLITE_TIERS[3];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const bgHex = '#' + spec.shieldBgHex.toString(16).padStart(6, '0');
    const rimHex = '#' + spec.shieldRimHex.toString(16).padStart(6, '0');
    const bidHex = '#' + spec.bidentHex.toString(16).padStart(6, '0');

    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, '#1e1035');
    grad.addColorStop(0.55, bgHex);
    grad.addColorStop(0.8, bgHex);
    grad.addColorStop(0.86, rimHex);
    grad.addColorStop(0.95, '#09090b');
    grad.addColorStop(1, rimHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = rimHex;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 206, 0, Math.PI * 2);
    ctx.stroke();

    const spikeCount = tier === 4 ? 20 : tier === 3 ? 16 : 12;
    ctx.fillStyle = bidHex;
    for (let i = 0; i < spikeCount; i++) {
      const a = (i / spikeCount) * Math.PI * 2;
      const sx1 = 256 + Math.cos(a - 0.06) * 195;
      const sy1 = 256 + Math.sin(a - 0.06) * 195;
      const sx2 = 256 + Math.cos(a + 0.06) * 195;
      const sy2 = 256 + Math.sin(a + 0.06) * 195;
      const tipX = 256 + Math.cos(a) * 165;
      const tipY = 256 + Math.sin(a) * 165;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(sx2, sy2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.save();
    if (tier >= 3) {
      ctx.shadowColor = tier === 4 ? '#10b981' : '#ea580c';
      ctx.shadowBlur = 24;
    }

    ctx.strokeStyle = bidHex;
    ctx.fillStyle = bidHex;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(256, 398);
    ctx.lineTo(256, 232);
    ctx.stroke();

    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(202, 148);
    ctx.quadraticCurveTo(202, 232, 256, 232);
    ctx.quadraticCurveTo(310, 232, 310, 148);
    ctx.stroke();

    for (const side of [-1, 1]) {
      const px = 256 + side * 54;
      ctx.beginPath();
      ctx.moveTo(px, 108);
      ctx.lineTo(px - 17, 158);
      ctx.lineTo(px + 17, 158);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = rimHex;
    ctx.beginPath();
    ctx.arc(256, 232, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#12101a';
    fCtx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 3800; i++) {
      fCtx.fillStyle = i % 2 === 0 ? 'rgba(30, 27, 46, 0.45)' : 'rgba(5, 4, 10, 0.55)';
      fCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 10, 10);
    }

    const cx = 512;
    const cy = 512;
    fCtx.strokeStyle = '#ea580c';
    fCtx.lineWidth = 16;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 420, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#10b981';
    fCtx.lineWidth = 7;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 436, 0, Math.PI * 2);
    fCtx.stroke();

    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      fCtx.strokeStyle = i % 2 === 0 ? 'rgba(16, 185, 129, 0.65)' : 'rgba(234, 88, 12, 0.75)';
      fCtx.lineWidth = 3.5;
      fCtx.beginPath();
      fCtx.moveTo(cx + Math.cos(a) * 85, cy + Math.sin(a) * 85);
      fCtx.lineTo(cx + Math.cos(a + 0.08) * 240, cy + Math.sin(a + 0.08) * 240);
      fCtx.lineTo(cx + Math.cos(a) * 405, cy + Math.sin(a) * 405);
      fCtx.stroke();
    }
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);

  return { skinBump, chitonTex, floorTex, createHadesShieldTexture };
}

export function getCachedHadesHopliteTextures(): HadesHopliteTextures {
  if (!cachedTextures) {
    cachedTextures = createHadesHopliteTextures();
  }
  return cachedTextures;
}

export function buildHadesHoplite(
  textures: HadesHopliteTextures = getCachedHadesHopliteTextures(),
  initialTier: HopliteTierId = 3
): HadesHopliteRig {
  return buildGreekHopliteBase({
    initialTier,
    getTierSpec: (tier) => {
      const s = HADES_HOPLITE_TIERS[tier] ?? HADES_HOPLITE_TIERS[3];
      return { ...s, glowIntensity: s.soulGlow };
    },
    createShieldTexture: textures.createHadesShieldTexture,
    skinBump: textures.skinBump,
    chitonTex: textures.chitonTex,
    skinHex: 0xbf8258,
    beardHex: 0x18181b,
    leatherHex: 0x27120b,
    spearShaftHex: 0x291a16,
    armorAccentEmissiveHex: 0x064e3b,
    crestEmissiveHex: 0x2e1065,
    cloakEmissiveHex: 0x1f0707,
    glowColorHex: 0x6ee7b7,
    glowEmissiveHex: 0x10b981,
    eyeEmissiveHex: 0xea580c,
    eyeEmissiveIntensity: 2.2,
    thrustConeHex: 0x10b981,
    thrustConeRadius: 0.26,
    thrustConeHeight: 0.98,
    thrustConeY: 0.4,
    thrustConeMaxOpacity: 0.85,
    spearTipY: 0.54,
    attachChestEmblem: (torso, mats, tier2Parts) => {
      const chestBident = hopliteGroup(torso, 0, 0.19, 0.256);
      hopliteSculpt(chestBident, new THREE.BoxGeometry(0.016, 0.09, 0.022), mats.armorAccent, [0, -0.03, 0]);
      hopliteSculpt(chestBident, new THREE.BoxGeometry(0.068, 0.015, 0.022), mats.armorAccent, [0, 0.015, 0]);
      hopliteSculpt(chestBident, new THREE.BoxGeometry(0.015, 0.075, 0.022), mats.armorAccent, [-0.028, 0.045, 0]);
      hopliteSculpt(chestBident, new THREE.BoxGeometry(0.015, 0.075, 0.022), mats.armorAccent, [0.028, 0.045, 0]);
      tier2Parts.push(chestBident);
    },
    attachHelmOrnament: (helm, mats, tier4Parts) => {
      const helmHorns = hopliteGroup(helm, 0, 0.08, -0.02);
      for (const side of [-1, 1]) {
        const hPivot = hopliteGroup(helmHorns, side * 0.18, 0.02, 0.02);
        hPivot.rotation.set(0.15, side * 0.25, side * -0.35);
        hopliteSculpt(
          hPivot,
          new THREE.ConeGeometry(0.034, 0.28, 6),
          mats.armorAccent,
          [side * 0.04, 0.12, 0],
          [0, 0, side * -0.25]
        );
        hopliteSculpt(
          hPivot,
          new THREE.ConeGeometry(0.022, 0.18, 5),
          mats.armorMain,
          [side * 0.06, 0.05, -0.07],
          [-0.45, 0, side * -0.45]
        );
      }
      tier4Parts.push(helmHorns);
    },
    attachSpearHead: (spearHead, mats, tier3Parts) => {
      hopliteSculpt(spearHead, new THREE.CylinderGeometry(0.038, 0.024, 0.11, 12), mats.armorAccent, [0, 0.04, 0]);
      hopliteSculpt(spearHead, new THREE.BoxGeometry(0.2, 0.03, 0.026), mats.armorAccent, [0, 0.11, 0]);
      for (const side of [-1, 1]) {
        hopliteSculpt(
          spearHead,
          new THREE.ConeGeometry(0.044, 0.44, 4),
          mats.armorAccent,
          [side * 0.082, 0.31, 0],
          [0, 0, 0],
          [0.95, 1.0, 0.24]
        );
      }
      const spearSoulCore = hopliteSculpt(spearHead, new THREE.OctahedronGeometry(0.042, 0), mats.glowMat, [0, 0.15, 0]);
      tier3Parts.push(spearSoulCore);
    },
  });
}

export function animateHadesHoplite(
  hoplite: HadesHopliteRig,
  dt: number,
  t: number,
  action: HadesHopliteAction = 'guarda',
  onSoulSpark?: (pos: THREE.Vector3) => void
): void {
  animateGreekHopliteBase(hoplite, dt, t, action, onSoulSpark);
}

export function createHadesHopliteArena(
  textures: HadesHopliteTextures = getCachedHadesHopliteTextures()
): { arena: THREE.Group; torches: { mesh: THREE.Mesh; phase: number }[] } {
  return buildGreekHopliteArenaColumns({
    floorTex: textures.floorTex,
    floorRoughness: 0.36,
    floorMetalness: 0.35,
    ringColorHex: 0xea580c,
    ringOpacity: 0.85,
    colColorHex: 0x18181b,
    colRoughness: 0.55,
    colMetalness: 0.45,
    capColorHex: 0x92400e,
    capMetalness: 0.88,
    capRoughness: 0.25,
    radialSegments: 8,
    withTorches: true,
  });
}
