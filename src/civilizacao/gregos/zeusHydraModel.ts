import * as THREE from 'three';
import { TeamId } from '../../game/types';

/* ==========================================================================
   1. TEXTURAS PROCEDURAIS PBR (ESCAMAS OLIVA-AREIA & PLACAS VENTRAIS)
   ========================================================================== */
export interface HydraTextures {
  skinTex: THREE.CanvasTexture;
  bellyTex: THREE.CanvasTexture;
}

let cachedHydraTextures: HydraTextures | null = null;

export function createHydraTextures(): HydraTextures {
  if (cachedHydraTextures) return cachedHydraTextures;

  // 1. Textura de escamas dracônicas verde-oliva com degradê radial
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 512;
  const ctx = skinCanvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#9aa378';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 24;
    const cols = 20;
    const rH = 512 / rows;
    const cW = 512 / cols;

    for (let r = 0; r < rows; r++) {
      const y = r * rH;
      const off = r % 2 === 0 ? 0 : cW * 0.5;
      for (let c = -1; c <= cols; c++) {
        const x = c * cW + off;
        const grad = ctx.createRadialGradient(
          x + cW * 0.5,
          y + rH * 0.4,
          1,
          x + cW * 0.5,
          y + rH * 0.5,
          cW * 0.65
        );
        grad.addColorStop(0, '#c2c89e');
        grad.addColorStop(0.65, '#8a9468');
        grad.addColorStop(1, '#485236');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x + cW * 0.5, y + rH * 0.5, cW * 0.48, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(45, 52, 32, 0.14)' : 'rgba(235, 240, 215, 0.12)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 8, 4);
    }
  }

  const skinTex = new THREE.CanvasTexture(skinCanvas);
  skinTex.wrapS = skinTex.wrapT = THREE.RepeatWrapping;
  skinTex.repeat.set(2, 2);
  skinTex.colorSpace = THREE.SRGBColorSpace;

  // 2. Placas ventrais claras listradas
  const bellyCanvas = document.createElement('canvas');
  bellyCanvas.width = 256;
  bellyCanvas.height = 512;
  const bCtx = bellyCanvas.getContext('2d');

  if (bCtx) {
    bCtx.fillStyle = '#d6d1bc';
    bCtx.fillRect(0, 0, 256, 512);
    for (let y = 0; y < 512; y += 22) {
      bCtx.fillStyle = 'rgba(72, 65, 48, 0.42)';
      bCtx.fillRect(0, y, 256, 5);
      bCtx.fillStyle = 'rgba(255, 255, 250, 0.28)';
      bCtx.fillRect(0, y + 5, 256, 6);
    }
  }

  const bellyTex = new THREE.CanvasTexture(bellyCanvas);
  bellyTex.wrapS = bellyTex.wrapT = THREE.RepeatWrapping;
  bellyTex.colorSpace = THREE.SRGBColorSpace;

  cachedHydraTextures = { skinTex, bellyTex };
  return cachedHydraTextures;
}

/* ==========================================================================
   2. CONFIGURAÇÕES DAS FORMAÇÕES DE CABEÇA (1 A 5 CABEÇAS)
   ========================================================================== */
export interface HeadFormationConfig {
  yaw: number;
  roll: number;
  pitch: number;
  x: number;
  y: number;
  hScale: number;
}

export const HEAD_FORMATIONS: Record<number, HeadFormationConfig[]> = {
  1: [{ yaw: 0.0, roll: 0.0, pitch: 0.0, x: 0.0, y: 0.0, hScale: 1.05 }],
  2: [
    { yaw: -0.34, roll: 0.22, pitch: -0.04, x: -0.10, y: 0.02, hScale: 1.02 },
    { yaw: 0.34, roll: -0.22, pitch: 0.04, x: 0.10, y: -0.02, hScale: 0.98 }
  ],
  3: [
    { yaw: -0.52, roll: 0.34, pitch: -0.08, x: -0.14, y: 0.0, hScale: 0.96 },
    { yaw: 0.0, roll: 0.0, pitch: 0.08, x: 0.0, y: 0.10, hScale: 1.05 },
    { yaw: 0.52, roll: -0.34, pitch: -0.08, x: 0.14, y: -0.03, hScale: 0.96 }
  ],
  4: [
    { yaw: -0.66, roll: 0.42, pitch: -0.12, x: -0.16, y: -0.02, hScale: 0.94 },
    { yaw: -0.22, roll: 0.14, pitch: 0.08, x: -0.06, y: 0.10, hScale: 1.02 },
    { yaw: 0.22, roll: -0.14, pitch: 0.08, x: 0.06, y: 0.06, hScale: 1.00 },
    { yaw: 0.66, roll: -0.42, pitch: -0.12, x: 0.16, y: -0.04, hScale: 0.94 }
  ],
  5: [
    { yaw: -0.78, roll: 0.48, pitch: -0.14, x: -0.18, y: -0.04, hScale: 0.92 },
    { yaw: -0.38, roll: 0.24, pitch: 0.06, x: -0.09, y: 0.08, hScale: 0.98 },
    { yaw: 0.0, roll: 0.0, pitch: 0.16, x: 0.0, y: 0.16, hScale: 1.06 },
    { yaw: 0.38, roll: -0.24, pitch: 0.06, x: 0.09, y: 0.06, hScale: 0.98 },
    { yaw: 0.78, roll: -0.48, pitch: -0.14, x: 0.18, y: -0.05, hScale: 0.92 }
  ]
};

export interface HydraHeadNode {
  index: number;
  neckRoot: THREE.Group;
  seg1: THREE.Group;
  seg2: THREE.Group;
  seg3: THREE.Group;
  headPivot: THREE.Group;
  jawPivot: THREE.Group;
  biteTipAnchor: THREE.Group;
  targetYaw: number;
  targetRoll: number;
  targetPitch: number;
  targetX: number;
  targetY: number;
  growScale: number;
  active: boolean;
}

export interface HydraLegNode {
  hip: THREE.Group;
  knee: THREE.Group;
  phase: number;
}

export interface HydraTailSegNode {
  group: THREE.Group;
  phase: number;
}

export interface HydraBuildResult {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  cervicalTrunk: THREE.Group;
  tailSegs: HydraTailSegNode[];
  legs: HydraLegNode[];
  heads: HydraHeadNode[];
  HEAD_FORMATIONS: typeof HEAD_FORMATIONS;
  setHeadCount: (count: number, instant?: boolean) => void;
  getHeadCount: () => number;
}

/* ==========================================================================
   3. CONSTRUTOR DA HIDRA DE ZEUS
   ========================================================================== */
function group(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D | null,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1]
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

export interface HydraBuildOptions {
  teamId?: TeamId;
  textures?: HydraTextures;
  scale?: number;
}

export function buildZeusHydra(options: HydraBuildOptions = {}): HydraBuildResult {
  const textures = options.textures || createHydraTextures();

  let teamBlueHex = 0x1d4ed8;
  let teamEmissiveHex = 0x1e3a8a;
  if (options.teamId === 'gaia') {
    teamBlueHex = 0x15803d;
    teamEmissiveHex = 0x166534;
  } else if (options.teamId === 'red') {
    teamBlueHex = 0xb91c1c;
    teamEmissiveHex = 0x991b1b;
  }

  const M = {
    skin: new THREE.MeshStandardMaterial({
      map: textures.skinTex,
      roughness: 0.56,
      metalness: 0.08
    }),
    belly: new THREE.MeshStandardMaterial({
      map: textures.bellyTex,
      roughness: 0.62,
      metalness: 0.05
    }),
    zeusBlue: new THREE.MeshStandardMaterial({
      color: teamBlueHex,
      emissive: teamEmissiveHex,
      emissiveIntensity: 0.35,
      roughness: 0.36,
      metalness: 0.32
    }),
    finCrest: new THREE.MeshStandardMaterial({
      color: 0xd6ccb2,
      roughness: 0.52,
      side: THREE.DoubleSide
    }),
    claw: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.4
    }),
    tooth: new THREE.MeshStandardMaterial({
      color: 0xfefce8,
      roughness: 0.25
    }),
    mouthInside: new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.6
    }),
    eyeGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfacc15,
      emissiveIntensity: 3.2,
      roughness: 0.05
    })
  };

  const root = new THREE.Group();
  root.name = 'ZeusHydraRoot';

  if (options.scale && options.scale !== 1.0) {
    root.scale.setScalar(options.scale);
  }

  const body = group(root, 0, 0.78, -0.15);

  // 1. TRONCO QUADRÚPEDE ESGUIO COM PLACAS DORSAIS AZUL-COBALTO DE ZEUS
  const torso = group(body, 0, 0, 0);

  sculpt(
    torso,
    new THREE.CapsuleGeometry(0.36, 1.05, 14, 22),
    M.skin,
    [0, 0.04, 0],
    [Math.PI / 2, 0, 0],
    [0.96, 1.0, 0.84]
  );
  sculpt(
    torso,
    new THREE.CapsuleGeometry(0.28, 0.92, 12, 18),
    M.belly,
    [0, -0.11, 0.02],
    [Math.PI / 2, 0, 0],
    [0.9, 1.0, 0.74]
  );

  for (let s = 0; s < 6; s++) {
    const sz = -0.58 + s * 0.22;
    const rad = 0.13 + Math.sin((s / 5) * Math.PI) * 0.04;
    sculpt(
      torso,
      new THREE.SphereGeometry(rad, 12, 10),
      M.zeusBlue,
      [0, 0.33, sz],
      [0, 0, 0],
      [1.15, 0.55, 1.1]
    );
  }

  // 2. CAUDA REPTILIANA ARTICULADA
  const tailSegs: HydraTailSegNode[] = [];
  let parentTail: THREE.Object3D = torso;
  let lastZ = -0.68;
  for (let t = 0; t < 5; t++) {
    const rTop = 0.28 * Math.pow(0.74, t);
    const rBot = 0.28 * Math.pow(0.74, t + 1);
    const segLen = 0.36;
    const segPivot = group(parentTail, 0, t === 0 ? -0.02 : 0, lastZ);
    sculpt(
      segPivot,
      new THREE.CylinderGeometry(rBot, rTop, segLen, 14),
      M.skin,
      [0, -0.03, -segLen * 0.5],
      [Math.PI / 2 - 0.08, 0, 0]
    );
    if (t < 3) {
      sculpt(
        segPivot,
        new THREE.SphereGeometry(rTop * 0.42, 10, 8),
        M.zeusBlue,
        [0, rTop * 0.85, -segLen * 0.45],
        [0, 0, 0],
        [1, 0.55, 1.1]
      );
    }
    tailSegs.push({ group: segPivot, phase: t * 0.65 });
    parentTail = segPivot;
    lastZ = -segLen + 0.03;
  }

  // 3. QUATRO PATAS REPTILIANAS COM GARRAS ESCURAS
  const legs: HydraLegNode[] = [];
  const legSpecs = [
    { x: -0.34, z: 0.42, phase: 0 },
    { x: 0.34, z: 0.42, phase: Math.PI },
    { x: -0.36, z: -0.44, phase: Math.PI },
    { x: 0.36, z: -0.44, phase: 0 }
  ];

  legSpecs.forEach((ls) => {
    const hip = group(torso, ls.x, -0.06, ls.z);
    sculpt(hip, new THREE.SphereGeometry(0.18, 14, 14), M.skin, [0, 0, 0], [0, 0, 0], [0.95, 1.15, 1.05]);
    sculpt(hip, new THREE.CylinderGeometry(0.14, 0.11, 0.36, 12), M.skin, [0, -0.18, -0.04], [-0.22, 0, 0]);

    const knee = group(hip, 0, -0.34, -0.08);
    sculpt(knee, new THREE.CylinderGeometry(0.11, 0.095, 0.36, 12), M.skin, [0, -0.18, 0.05], [0.16, 0, 0]);

    const foot = group(knee, 0, -0.36, 0.08);
    sculpt(foot, new THREE.BoxGeometry(0.2, 0.08, 0.24), M.skin, [0, -0.02, 0.04]);
    for (let c = -1; c <= 1; c++) {
      sculpt(
        foot,
        new THREE.ConeGeometry(0.022, 0.09, 5),
        M.claw,
        [c * 0.06, -0.03, 0.17],
        [Math.PI / 2, 0, 0]
      );
    }
    legs.push({ hip, knee, phase: ls.phase });
  });

  // 4. TRONCO CERVICAL ÚNICO DE ONDE BROTAM OS PESCOÇOS
  const heads: HydraHeadNode[] = [];
  const chestAnchor = group(torso, 0, 0.14, 0.56);

  const cervicalTrunk = group(chestAnchor, 0, 0, 0);
  sculpt(
    cervicalTrunk,
    new THREE.CylinderGeometry(0.28, 0.34, 0.62, 18),
    M.skin,
    [0, 0.24, 0.1],
    [0.42, 0, 0],
    [1.14, 1.0, 0.92]
  );
  sculpt(
    cervicalTrunk,
    new THREE.CylinderGeometry(0.21, 0.26, 0.58, 16),
    M.belly,
    [0, 0.22, 0.17],
    [0.42, 0, 0],
    [0.98, 1.0, 0.85]
  );
  for (let c = 0; c < 3; c++) {
    sculpt(
      cervicalTrunk,
      new THREE.SphereGeometry(0.105, 12, 10),
      M.zeusBlue,
      [0, 0.12 + c * 0.15, -0.08 + c * 0.06],
      [0, 0, 0],
      [1.15, 0.55, 1.05]
    );
  }

  const bifurcationPoint = group(cervicalTrunk, 0, 0.44, 0.2);

  for (let hIdx = 0; hIdx < 5; hIdx++) {
    const neckRoot = group(bifurcationPoint, 0, 0, 0);

    const seg1 = group(neckRoot, 0, 0, 0);
    sculpt(seg1, new THREE.CylinderGeometry(0.165, 0.21, 0.42, 14), M.skin, [0, 0.18, 0.06], [0.28, 0, 0]);
    sculpt(seg1, new THREE.SphereGeometry(0.08, 10, 8), M.zeusBlue, [0, 0.2, -0.06], [0, 0, 0], [1, 0.6, 1.1]);

    const seg2 = group(seg1, 0, 0.36, 0.12);
    sculpt(seg2, new THREE.CylinderGeometry(0.145, 0.165, 0.56, 14), M.skin, [0, 0.26, 0.03], [0.1, 0, 0]);
    sculpt(seg2, new THREE.CylinderGeometry(0.11, 0.128, 0.52, 12), M.belly, [0, 0.26, 0.075], [0.1, 0, 0]);
    sculpt(seg2, new THREE.SphereGeometry(0.074, 10, 8), M.zeusBlue, [0, 0.27, -0.1], [0, 0, 0], [1, 0.6, 1.1]);

    const seg3 = group(seg2, 0, 0.52, 0.05);
    sculpt(seg3, new THREE.CylinderGeometry(0.13, 0.145, 0.54, 14), M.skin, [0, 0.26, -0.02], [-0.12, 0, 0]);
    sculpt(seg3, new THREE.CylinderGeometry(0.098, 0.115, 0.5, 12), M.belly, [0, 0.26, 0.03], [-0.12, 0, 0]);
    sculpt(seg3, new THREE.SphereGeometry(0.068, 10, 8), M.zeusBlue, [0, 0.27, -0.13], [0, 0, 0], [1, 0.6, 1.1]);

    const headPivot = group(seg3, 0, 0.52, -0.03);

    sculpt(headPivot, new THREE.BoxGeometry(0.28, 0.18, 0.34), M.skin, [0, 0.04, 0.12]);
    sculpt(headPivot, new THREE.BoxGeometry(0.2, 0.12, 0.26), M.skin, [0, 0.03, 0.36]);
    sculpt(headPivot, new THREE.BoxGeometry(0.17, 0.04, 0.24), M.mouthInside, [0, -0.02, 0.34]);

    for (const sx of [-1, 1]) {
      sculpt(
        headPivot,
        new THREE.ConeGeometry(0.016, 0.065, 5),
        M.tooth,
        [sx * 0.075, -0.04, 0.44],
        [Math.PI, 0, 0]
      );
      sculpt(
        headPivot,
        new THREE.ConeGeometry(0.014, 0.055, 5),
        M.tooth,
        [sx * 0.082, -0.04, 0.34],
        [Math.PI, 0, 0]
      );
    }

    for (const sx of [-1, 1]) {
      sculpt(headPivot, new THREE.SphereGeometry(0.026, 10, 10), M.eyeGlow, [sx * 0.125, 0.07, 0.2]);
      sculpt(
        headPivot,
        new THREE.BoxGeometry(0.05, 0.025, 0.12),
        M.skin,
        [sx * 0.12, 0.1, 0.2],
        [0.1, 0, sx * -0.25]
      );
    }

    for (const sx of [-1, 1]) {
      const finGroup = group(headPivot, sx * 0.13, 0.08, -0.02);
      finGroup.rotation.set(0.25, sx * 0.45, sx * -0.35);
      sculpt(
        finGroup,
        new THREE.ConeGeometry(0.085, 0.34, 4),
        M.finCrest,
        [sx * 0.08, 0.12, -0.06],
        [-0.45, 0, sx * -0.4],
        [0.35, 1, 1]
      );
      sculpt(
        finGroup,
        new THREE.ConeGeometry(0.065, 0.26, 4),
        M.finCrest,
        [sx * 0.09, 0.02, -0.1],
        [-0.65, 0, sx * -0.55],
        [0.35, 1, 1]
      );
    }

    const jawPivot = group(headPivot, 0, -0.03, 0.14);
    sculpt(jawPivot, new THREE.BoxGeometry(0.18, 0.07, 0.32), M.belly, [0, -0.02, 0.16]);
    for (const sx of [-1, 1]) {
      sculpt(jawPivot, new THREE.ConeGeometry(0.014, 0.055, 5), M.tooth, [sx * 0.068, 0.03, 0.28]);
    }

    const biteTipAnchor = group(headPivot, 0, 0, 0.48);

    heads.push({
      index: hIdx,
      neckRoot,
      seg1,
      seg2,
      seg3,
      headPivot,
      jawPivot,
      biteTipAnchor,
      targetYaw: 0,
      targetRoll: 0,
      targetPitch: 0,
      targetX: 0,
      targetY: 0,
      growScale: hIdx === 0 ? 1.0 : 0.001,
      active: hIdx === 0
    });
  }

  let activeHeadCount = 1;

  function setHeadCount(count: number, instant = false): void {
    activeHeadCount = Math.max(1, Math.min(5, Math.floor(count)));
    const formation = HEAD_FORMATIONS[activeHeadCount];

    heads.forEach((h, idx) => {
      if (idx < activeHeadCount) {
        h.active = true;
        h.neckRoot.visible = true;
        const cfg = formation[idx];
        h.targetYaw = cfg.yaw;
        h.targetRoll = cfg.roll || 0;
        h.targetPitch = cfg.pitch;
        h.targetX = cfg.x;
        h.targetY = cfg.y || 0;
        if (instant) h.growScale = cfg.hScale;
      } else {
        h.active = false;
        if (instant) {
          h.growScale = 0.001;
          h.neckRoot.visible = false;
        }
      }
    });
  }

  setHeadCount(1, true);

  return {
    root,
    body,
    torso,
    cervicalTrunk,
    tailSegs,
    legs,
    heads,
    HEAD_FORMATIONS,
    setHeadCount,
    getHeadCount: () => activeHeadCount
  };
}

/* ==========================================================================
   4. LOOP DE ANIMAÇÃO DA HIDRA (BOTE RASANTE & ONDULAÇÃO)
   ========================================================================== */
export function animateHydraModel(
  hydra: HydraBuildResult,
  elapsed: number,
  dt: number,
  biteStrike = 0,
  isWalking = false
): void {
  // 1. Elevação e respiração do corpo
  hydra.body.position.y = 0.78 + Math.sin(elapsed * 2.2) * 0.025;

  // 2. Ondulação da cauda
  hydra.tailSegs.forEach((ts) => {
    ts.group.rotation.y = Math.sin(elapsed * 2.6 - ts.phase) * 0.14;
  });

  // 3. Patas
  if (isWalking) {
    hydra.legs.forEach((leg) => {
      leg.hip.rotation.x = Math.sin(elapsed * 4.5 + leg.phase) * 0.35;
      leg.knee.rotation.x = Math.max(0, Math.cos(elapsed * 4.5 + leg.phase)) * 0.28;
    });
  } else {
    hydra.legs.forEach((leg) => {
      leg.hip.rotation.x = Math.sin(elapsed * 1.5 + leg.phase) * 0.04;
      leg.knee.rotation.x = 0;
    });
  }

  // 4. Lunge de ataque ou respiração
  const forwardLunge = Math.max(0, biteStrike);
  const windUp = Math.max(0, -biteStrike);

  hydra.torso.position.z = forwardLunge * 0.32;
  hydra.torso.rotation.x = forwardLunge * 0.24 - windUp * 0.12;
  hydra.cervicalTrunk.rotation.x = forwardLunge * 0.42 - windUp * 0.18;

  const activeCount = hydra.getHeadCount();
  const formation = hydra.HEAD_FORMATIONS[activeCount];

  hydra.heads.forEach((h, idx) => {
    const targetScale = h.active ? formation[idx]?.hScale || 1.0 : 0.001;
    h.growScale = THREE.MathUtils.damp(h.growScale, targetScale, 6.5, dt);

    if (!h.active && h.growScale < 0.02) {
      h.neckRoot.visible = false;
      return;
    }

    h.neckRoot.scale.setScalar(h.growScale);
    h.neckRoot.position.x = THREE.MathUtils.damp(h.neckRoot.position.x, h.targetX, 6.0, dt);
    h.neckRoot.position.y = THREE.MathUtils.damp(h.neckRoot.position.y, h.targetY, 6.0, dt);

    const idleSwayY = Math.sin(elapsed * 2.4 + idx * 1.1) * 0.06;
    const idleSwayX = Math.cos(elapsed * 2.1 + idx * 0.9) * 0.045;

    const spreadFactor = 1 - forwardLunge * 0.22;
    const currentYaw = THREE.MathUtils.damp(
      h.neckRoot.rotation.y,
      h.targetYaw * spreadFactor + idleSwayY,
      6.0,
      dt
    );
    const currentRoll = THREE.MathUtils.damp(
      h.neckRoot.rotation.z,
      h.targetRoll * spreadFactor,
      6.0,
      dt
    );
    h.neckRoot.rotation.y = currentYaw;
    h.neckRoot.rotation.z = currentRoll;

    h.seg1.rotation.z = h.targetRoll * 0.35;
    h.seg2.rotation.z = h.targetRoll * 0.2;
    h.headPivot.rotation.z = -h.targetRoll * 1.35;

    h.seg1.rotation.x = h.targetPitch + idleSwayX + forwardLunge * 0.75 - windUp * 0.25;
    h.seg2.rotation.x = idleSwayX * 0.8 + forwardLunge * 0.65 - windUp * 0.22;
    h.seg3.rotation.x = forwardLunge * 0.32;
    h.headPivot.rotation.x = -forwardLunge * 0.92;

    const jawOpen = forwardLunge * 0.68 + Math.max(0, Math.sin(elapsed * 3 + idx)) * 0.06;
    h.jawPivot.rotation.x = jawOpen;
  });
}
