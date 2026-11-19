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
export type ZeusHopliteAction = HopliteAction;
export type ZeusHopliteRig = BaseHopliteRig;

export interface ZeusHopliteTierSpec {
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
  boltColorHex: number;
  crestColorHex: number;
  cloakColorHex: number;
  electricGlow: number;
}

export const ZEUS_HOPLITE_TIERS: Record<HopliteTierId, ZeusHopliteTierSpec> = {
  1: {
    tier: 1,
    id: 'map_01',
    name: 'Hoplita Padrão (Map 01)',
    subtitle: 'Era Arcaica / Clássica — Couraça de Couro (Linothorax) & Bronze Simples',
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

export interface ZeusHopliteTextures {
  skinBump: THREE.CanvasTexture;
  chitonTex: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
  createZeusShieldTexture: (tier: HopliteTierId) => THREE.CanvasTexture;
}

let cachedTextures: ZeusHopliteTextures | null = null;

export function createZeusHopliteTextures(): ZeusHopliteTextures {
  const skinBump = createHopliteSkinBumpTexture();

  const chitonCanvas = document.createElement('canvas');
  chitonCanvas.width = 512;
  chitonCanvas.height = 256;
  const cCtx = chitonCanvas.getContext('2d');
  if (cCtx) {
    cCtx.fillStyle = '#f8fafc';
    cCtx.fillRect(0, 0, 512, 256);
    cCtx.fillStyle = 'rgba(148, 163, 184, 0.16)';
    for (let x = 0; x < 512; x += 8) cCtx.fillRect(x, 0, 3, 256);

    cCtx.fillStyle = '#1e3a8a';
    cCtx.fillRect(0, 198, 512, 38);
    cCtx.fillStyle = '#eab308';
    cCtx.fillRect(0, 194, 512, 4);
    cCtx.fillRect(0, 236, 512, 4);

    cCtx.strokeStyle = '#fef08a';
    cCtx.lineWidth = 3;
    for (let x = 0; x < 512; x += 32) {
      cCtx.beginPath();
      cCtx.moveTo(x + 4, 229);
      cCtx.lineTo(x + 4, 205);
      cCtx.lineTo(x + 24, 205);
      cCtx.lineTo(x + 24, 223);
      cCtx.lineTo(x + 12, 223);
      cCtx.lineTo(x + 12, 213);
      cCtx.lineTo(x + 18, 213);
      cCtx.stroke();
    }
  }
  const chitonTex = new THREE.CanvasTexture(chitonCanvas);
  chitonTex.wrapS = chitonTex.wrapT = THREE.RepeatWrapping;

  function createZeusShieldTexture(tier: HopliteTierId): THREE.CanvasTexture {
    const spec = ZEUS_HOPLITE_TIERS[tier] ?? ZEUS_HOPLITE_TIERS[3];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const bgHex = '#' + spec.shieldBgHex.toString(16).padStart(6, '0');
    const rimHex = '#' + spec.shieldRimHex.toString(16).padStart(6, '0');
    const boltHex = '#' + spec.boltColorHex.toString(16).padStart(6, '0');

    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, bgHex);
    grad.addColorStop(0.76, bgHex);
    grad.addColorStop(0.84, rimHex);
    grad.addColorStop(0.94, '#0f172a');
    grad.addColorStop(1, rimHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = rimHex;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(256, 256, 210, 0, Math.PI * 2);
    ctx.stroke();

    if (tier >= 2) {
      ctx.strokeStyle = boltHex;
      ctx.lineWidth = tier >= 3 ? 3 : 2;
      const rays = tier === 4 ? 16 : tier === 3 ? 12 : 8;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(256 + Math.cos(a) * 145, 256 + Math.sin(a) * 145);
        ctx.lineTo(256 + Math.cos(a) * 195, 256 + Math.sin(a) * 195);
        ctx.stroke();
      }
    }

    ctx.save();
    if (tier >= 3) {
      ctx.shadowColor = tier === 4 ? '#38bdf8' : '#facc15';
      ctx.shadowBlur = 22;
    }
    if (tier >= 3) {
      ctx.fillStyle = rimHex;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(256 + side * 24, 240);
        ctx.quadraticCurveTo(256 + side * 125, 185, 256 + side * 155, 225);
        ctx.quadraticCurveTo(256 + side * 110, 255, 256 + side * 135, 275);
        ctx.quadraticCurveTo(256 + side * 85, 285, 256 + side * 24, 270);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.fillStyle = boltHex;
    ctx.beginPath();
    ctx.moveTo(278, 118);
    ctx.lineTo(212, 254);
    ctx.lineTo(254, 254);
    ctx.lineTo(232, 394);
    ctx.lineTo(304, 248);
    ctx.lineTo(260, 248);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = tier === 4 ? 4 : 2;
    ctx.stroke();
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#e2e8f0';
    fCtx.fillRect(0, 0, 1024, 1024);

    fCtx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
    fCtx.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
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
    fCtx.strokeStyle = '#1e3a8a';
    fCtx.lineWidth = 16;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 420, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#eab308';
    fCtx.lineWidth = 7;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 435, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.fillStyle = 'rgba(30, 58, 138, 0.85)';
    fCtx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = i % 2 === 0 ? 220 : 95;
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

  return { skinBump, chitonTex, floorTex, createZeusShieldTexture };
}

export function getCachedZeusHopliteTextures(): ZeusHopliteTextures {
  if (!cachedTextures) {
    cachedTextures = createZeusHopliteTextures();
  }
  return cachedTextures;
}

export function buildZeusHoplite(
  textures: ZeusHopliteTextures = getCachedZeusHopliteTextures(),
  initialTier: HopliteTierId = 3
): ZeusHopliteRig {
  return buildGreekHopliteBase({
    initialTier,
    getTierSpec: (tier) => {
      const s = ZEUS_HOPLITE_TIERS[tier] ?? ZEUS_HOPLITE_TIERS[3];
      return { ...s, glowIntensity: s.electricGlow };
    },
    createShieldTexture: textures.createZeusShieldTexture,
    skinBump: textures.skinBump,
    chitonTex: textures.chitonTex,
    glowColorHex: 0xffffff,
    glowEmissiveHex: 0x38bdf8,
    eyeEmissiveHex: 0x38bdf8,
    eyeEmissiveIntensity: 1.5,
    thrustConeHex: 0x38bdf8,
    thrustConeRadius: 0.24,
    thrustConeHeight: 0.95,
    thrustConeY: 0.38,
    thrustConeMaxOpacity: 0.8,
    spearTipY: 0.52,
    attachChestEmblem: (torso, mats, tier2Parts) => {
      const chestEmblem = hopliteGroup(torso, 0, 0.19, 0.255);
      hopliteSculpt(
        chestEmblem,
        new THREE.ConeGeometry(0.032, 0.11, 4),
        mats.armorAccent,
        [-0.012, 0.04, 0],
        [0, 0, -0.32],
        [1, 1, 0.35]
      );
      hopliteSculpt(
        chestEmblem,
        new THREE.ConeGeometry(0.032, 0.11, 4),
        mats.armorAccent,
        [0.012, -0.04, 0],
        [0, 0, Math.PI - 0.32],
        [1, 1, 0.35]
      );
      tier2Parts.push(chestEmblem);
    },
    attachHelmOrnament: (helm, mats, tier4Parts) => {
      const helmWings = hopliteGroup(helm, 0, 0.08, -0.02);
      for (const side of [-1, 1]) {
        const wPivot = hopliteGroup(helmWings, side * 0.19, 0, 0);
        wPivot.rotation.set(-0.2, side * 0.35, side * -0.25);
        for (let f = 0; f < 4; f++) {
          hopliteSculpt(
            wPivot,
            new THREE.ConeGeometry(0.024, 0.22 - f * 0.03, 5),
            mats.armorAccent,
            [side * (0.04 + f * 0.015), 0.08 + f * 0.025, -0.04 - f * 0.045],
            [-0.85, 0, side * -0.45],
            [0.45, 1, 1]
          );
        }
      }
      tier4Parts.push(helmWings);
    },
    attachSpearHead: (spearHead, mats, tier3Parts) => {
      hopliteSculpt(spearHead, new THREE.CylinderGeometry(0.036, 0.024, 0.1, 12), mats.armorAccent, [0, 0.04, 0]);
      hopliteSculpt(
        spearHead,
        new THREE.ConeGeometry(0.065, 0.44, 4),
        mats.armorAccent,
        [0, 0.3, 0],
        [0, 0, 0],
        [1.0, 1.0, 0.24]
      );
      const spearElectric = hopliteSculpt(spearHead, new THREE.BoxGeometry(0.014, 0.34, 0.024), mats.glowMat, [0, 0.26, 0]);
      tier3Parts.push(spearElectric);
    },
  });
}

export function animateZeusHoplite(
  hoplite: ZeusHopliteRig,
  dt: number,
  t: number,
  action: ZeusHopliteAction,
  onSpark?: (pos: THREE.Vector3) => void
): void {
  animateGreekHopliteBase(hoplite, dt, t, action, onSpark);
}

export function createZeusHopliteArena(textures: ZeusHopliteTextures = getCachedZeusHopliteTextures()): THREE.Group {
  return buildGreekHopliteArenaColumns({
    floorTex: textures.floorTex,
    floorRoughness: 0.36,
    floorMetalness: 0.14,
    ringColorHex: 0xfacc15,
    ringOpacity: 0.8,
    colColorHex: 0xf8fafc,
    colRoughness: 0.42,
    capColorHex: 0xfacc15,
    capMetalness: 0.88,
    capRoughness: 0.22,
  }).arena;
}
