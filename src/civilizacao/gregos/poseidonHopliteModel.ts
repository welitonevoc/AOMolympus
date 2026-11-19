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
export type PoseidonHopliteAction = HopliteAction;
export type PoseidonHopliteRig = BaseHopliteRig;

export interface PoseidonHopliteTierSpec {
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
  tridentHex: number;
  crestColorHex: number;
  cloakColorHex: number;
  aquaGlow: number;
}

export const POSEIDON_HOPLITE_TIERS: Record<HopliteTierId, PoseidonHopliteTierSpec> = {
  1: {
    tier: 1,
    id: 'poseidon_01',
    name: 'Hoplita Costeiro (Map 01)',
    subtitle: 'Era Arcaica — Couraça de Bronze Oxidado Marinho & Linho Verde-Água',
    armorHex: 0x5c766d,
    accentHex: 0x2dd4bf,
    greaveHex: 0x475e56,
    metalness: 0.52,
    roughness: 0.5,
    shieldRimHex: 0x0f766e,
    shieldBgHex: 0x082f49,
    tridentHex: 0x5eead4,
    crestColorHex: 0x0d9488,
    cloakColorHex: 0x115e59,
    aquaGlow: 0.15,
  },
  2: {
    tier: 2,
    id: 'poseidon_02',
    name: 'Hoplita de Oricalco (Map 02)',
    subtitle: 'Era Heroica — Bronze de Oricalco, Ombreiras Escamadas & Crista Turquesa',
    armorHex: 0xb47b38,
    accentHex: 0x2dd4bf,
    greaveHex: 0x9a652a,
    metalness: 0.8,
    roughness: 0.3,
    shieldRimHex: 0x2dd4bf,
    shieldBgHex: 0x0c4a6e,
    tridentHex: 0x99f6e4,
    crestColorHex: 0x06b6d4,
    cloakColorHex: 0x0369a1,
    aquaGlow: 0.45,
  },
  3: {
    tier: 3,
    id: 'poseidon_03',
    name: 'Hoplita Atlante (Map 03)',
    subtitle: 'Era Mítica — Couraça de Ouro Atlante, Escudo do Tridente & Lança-Tridente',
    armorHex: 0xeab308,
    accentHex: 0x2dd4bf,
    greaveHex: 0xca8a04,
    metalness: 0.92,
    roughness: 0.2,
    shieldRimHex: 0xfacc15,
    shieldBgHex: 0x042f2e,
    tridentHex: 0x5eead4,
    crestColorHex: 0x2dd4bf,
    cloakColorHex: 0x042f2e,
    aquaGlow: 1.1,
  },
  4: {
    tier: 4,
    id: 'poseidon_04',
    name: 'Campeão Abissal (Map 04)',
    subtitle: 'Era dos Titãs — Prata Marinha Espelhada, Barbatanas Reais & Fúria dos Mares',
    armorHex: 0xdbeafe,
    accentHex: 0x00f5d4,
    greaveHex: 0xbae6fd,
    metalness: 0.96,
    roughness: 0.14,
    shieldRimHex: 0x38bdf8,
    shieldBgHex: 0x020617,
    tridentHex: 0xe0f2fe,
    crestColorHex: 0x38bdf8,
    cloakColorHex: 0x082f49,
    aquaGlow: 2.0,
  },
};

export interface PoseidonHopliteTextures {
  skinBump: THREE.CanvasTexture;
  chitonTex: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
  createPoseidonShieldTexture: (tier: HopliteTierId) => THREE.CanvasTexture;
}

let cachedTextures: PoseidonHopliteTextures | null = null;

export function createPoseidonHopliteTextures(): PoseidonHopliteTextures {
  const skinBump = createHopliteSkinBumpTexture();

  const chitonCanvas = document.createElement('canvas');
  chitonCanvas.width = 512;
  chitonCanvas.height = 256;
  const cCtx = chitonCanvas.getContext('2d');
  if (cCtx) {
    cCtx.fillStyle = '#ecfeff';
    cCtx.fillRect(0, 0, 512, 256);
    cCtx.fillStyle = 'rgba(13, 148, 136, 0.15)';
    for (let x = 0; x < 512; x += 8) cCtx.fillRect(x, 0, 3, 256);

    cCtx.fillStyle = '#0f766e';
    cCtx.fillRect(0, 198, 512, 38);
    cCtx.fillStyle = '#facc15';
    cCtx.fillRect(0, 194, 512, 4);
    cCtx.fillRect(0, 236, 512, 4);

    cCtx.strokeStyle = '#99f6e4';
    cCtx.lineWidth = 3.2;
    for (let x = 0; x < 512; x += 32) {
      cCtx.beginPath();
      cCtx.arc(x + 16, 222, 12, Math.PI, 0, false);
      cCtx.arc(x + 22, 222, 6, 0, Math.PI, false);
      cCtx.stroke();
    }
  }
  const chitonTex = new THREE.CanvasTexture(chitonCanvas);
  chitonTex.wrapS = chitonTex.wrapT = THREE.RepeatWrapping;

  function createPoseidonShieldTexture(tier: HopliteTierId): THREE.CanvasTexture {
    const spec = POSEIDON_HOPLITE_TIERS[tier] ?? POSEIDON_HOPLITE_TIERS[3];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const bgHex = '#' + spec.shieldBgHex.toString(16).padStart(6, '0');
    const rimHex = '#' + spec.shieldRimHex.toString(16).padStart(6, '0');
    const triHex = '#' + spec.tridentHex.toString(16).padStart(6, '0');

    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, '#0c4a6e');
    grad.addColorStop(0.55, bgHex);
    grad.addColorStop(0.8, bgHex);
    grad.addColorStop(0.86, rimHex);
    grad.addColorStop(0.95, '#042f2e');
    grad.addColorStop(1, rimHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = rimHex;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 206, 0, Math.PI * 2);
    ctx.stroke();

    const waveCount = tier === 4 ? 24 : tier === 3 ? 18 : 12;
    ctx.strokeStyle = triHex;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < waveCount; i++) {
      const a = (i / waveCount) * Math.PI * 2;
      const wx = 256 + Math.cos(a) * 182;
      const wy = 256 + Math.sin(a) * 182;
      ctx.beginPath();
      ctx.arc(wx, wy, 12, a - 0.8, a + 1.4);
      ctx.stroke();
    }

    ctx.save();
    if (tier >= 3) {
      ctx.shadowColor = tier === 4 ? '#38bdf8' : '#2dd4bf';
      ctx.shadowBlur = 24;
    }

    ctx.strokeStyle = triHex;
    ctx.fillStyle = triHex;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(256, 395);
    ctx.lineTo(256, 122);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(186, 175);
    ctx.quadraticCurveTo(186, 228, 256, 228);
    ctx.quadraticCurveTo(326, 228, 326, 175);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(256, 102);
    ctx.lineTo(238, 146);
    ctx.lineTo(274, 146);
    ctx.closePath();
    ctx.fill();

    for (const side of [-1, 1]) {
      const px = 256 + side * 70;
      ctx.beginPath();
      ctx.moveTo(px, 134);
      ctx.lineTo(px - 14, 176);
      ctx.lineTo(px + 14, 176);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(256, 395, 13, 0, Math.PI * 2);
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
    fCtx.fillStyle = '#cbd5e1';
    fCtx.fillRect(0, 0, 1024, 1024);

    fCtx.strokeStyle = 'rgba(15, 118, 110, 0.22)';
    fCtx.lineWidth = 2.5;
    for (let i = 0; i < 42; i++) {
      fCtx.beginPath();
      let mx = Math.random() * 1024;
      let my = 0;
      fCtx.moveTo(mx, my);
      while (my < 1024) {
        my += 32;
        mx += (Math.random() - 0.5) * 45;
        fCtx.lineTo(mx, my);
      }
      fCtx.stroke();
    }

    const cx = 512;
    const cy = 512;
    fCtx.strokeStyle = '#0f766e';
    fCtx.lineWidth = 18;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 420, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#2dd4bf';
    fCtx.lineWidth = 7;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 436, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.fillStyle = 'rgba(14, 116, 144, 0.85)';
    fCtx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = i % 2 === 0 ? 235 : 100;
      if (i === 0) fCtx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else fCtx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    fCtx.closePath();
    fCtx.fill();
    fCtx.strokeStyle = '#facc15';
    fCtx.lineWidth = 5;
    fCtx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);

  return { skinBump, chitonTex, floorTex, createPoseidonShieldTexture };
}

export function getCachedPoseidonHopliteTextures(): PoseidonHopliteTextures {
  if (!cachedTextures) {
    cachedTextures = createPoseidonHopliteTextures();
  }
  return cachedTextures;
}

export function buildPoseidonHoplite(
  textures: PoseidonHopliteTextures = getCachedPoseidonHopliteTextures(),
  initialTier: HopliteTierId = 3
): PoseidonHopliteRig {
  return buildGreekHopliteBase({
    initialTier,
    getTierSpec: (tier) => {
      const s = POSEIDON_HOPLITE_TIERS[tier] ?? POSEIDON_HOPLITE_TIERS[3];
      return { ...s, glowIntensity: s.aquaGlow };
    },
    createShieldTexture: textures.createPoseidonShieldTexture,
    skinBump: textures.skinBump,
    chitonTex: textures.chitonTex,
    armorAccentEmissiveHex: 0x064e3b,
    crestEmissiveHex: 0x0f172a,
    cloakEmissiveHex: 0x042f2e,
    glowColorHex: 0x99f6e4,
    glowEmissiveHex: 0x2dd4bf,
    eyeEmissiveHex: 0x2dd4bf,
    eyeEmissiveIntensity: 1.8,
    thrustConeHex: 0x2dd4bf,
    thrustConeRadius: 0.26,
    thrustConeHeight: 0.98,
    thrustConeY: 0.4,
    thrustConeMaxOpacity: 0.85,
    spearTipY: 0.54,
    attachChestEmblem: (torso, mats, tier2Parts) => {
      const chestTrident = hopliteGroup(torso, 0, 0.19, 0.256);
      hopliteSculpt(chestTrident, new THREE.BoxGeometry(0.016, 0.14, 0.022), mats.armorAccent, [0, 0, 0]);
      hopliteSculpt(chestTrident, new THREE.BoxGeometry(0.075, 0.014, 0.022), mats.armorAccent, [0, 0.035, 0]);
      hopliteSculpt(chestTrident, new THREE.BoxGeometry(0.014, 0.055, 0.022), mats.armorAccent, [-0.032, 0.055, 0]);
      hopliteSculpt(chestTrident, new THREE.BoxGeometry(0.014, 0.055, 0.022), mats.armorAccent, [0.032, 0.055, 0]);
      tier2Parts.push(chestTrident);
    },
    attachHelmOrnament: (helm, mats, tier4Parts) => {
      const helmFins = hopliteGroup(helm, 0, 0.08, -0.02);
      for (const side of [-1, 1]) {
        const fPivot = hopliteGroup(helmFins, side * 0.19, 0, 0);
        fPivot.rotation.set(-0.2, side * 0.35, side * -0.25);
        for (let f = 0; f < 4; f++) {
          hopliteSculpt(
            fPivot,
            new THREE.ConeGeometry(0.026, 0.24 - f * 0.03, 4),
            mats.armorAccent,
            [side * (0.04 + f * 0.015), 0.08 + f * 0.025, -0.04 - f * 0.045],
            [-0.85, 0, side * -0.45],
            [0.42, 1, 1]
          );
        }
      }
      tier4Parts.push(helmFins);
    },
    attachSpearHead: (spearHead, mats, tier3Parts) => {
      hopliteSculpt(spearHead, new THREE.CylinderGeometry(0.038, 0.024, 0.11, 12), mats.armorAccent, [0, 0.04, 0]);
      hopliteSculpt(
        spearHead,
        new THREE.ConeGeometry(0.056, 0.46, 4),
        mats.armorAccent,
        [0, 0.32, 0],
        [0, 0, 0],
        [1.0, 1.0, 0.24]
      );
      hopliteSculpt(spearHead, new THREE.BoxGeometry(0.24, 0.026, 0.024), mats.armorAccent, [0, 0.14, 0]);
      for (const side of [-1, 1]) {
        hopliteSculpt(
          spearHead,
          new THREE.ConeGeometry(0.036, 0.3, 4),
          mats.armorAccent,
          [side * 0.11, 0.28, 0],
          [0, 0, side * -0.06],
          [0.9, 1.0, 0.24]
        );
      }
      const spearAquaCore = hopliteSculpt(spearHead, new THREE.BoxGeometry(0.016, 0.36, 0.026), mats.glowMat, [0, 0.28, 0]);
      tier3Parts.push(spearAquaCore);
    },
  });
}

export function animatePoseidonHoplite(
  hoplite: PoseidonHopliteRig,
  dt: number,
  t: number,
  action: PoseidonHopliteAction = 'guarda',
  onAquaSpray?: (pos: THREE.Vector3) => void
): void {
  animateGreekHopliteBase(hoplite, dt, t, action, onAquaSpray);
}

export function createPoseidonHopliteArena(
  textures: PoseidonHopliteTextures = getCachedPoseidonHopliteTextures()
): THREE.Group {
  return buildGreekHopliteArenaColumns({
    floorTex: textures.floorTex,
    floorRoughness: 0.34,
    floorMetalness: 0.16,
    ringColorHex: 0x2dd4bf,
    ringOpacity: 0.85,
    colColorHex: 0xe2e8f0,
    colRoughness: 0.4,
    capColorHex: 0x14b8a6,
    capMetalness: 0.85,
    capRoughness: 0.22,
  }).arena;
}
