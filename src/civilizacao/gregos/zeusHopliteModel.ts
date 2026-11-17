import * as THREE from 'three';

export type ZeusHopliteAction = 'guarda' | 'marcha' | 'corrida' | 'ataque' | 'defesa';
export type HopliteTierId = 1 | 2 | 3 | 4;

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
    metalness: 0.90,
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
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5500; i++) {
      const v = 122 + Math.floor(Math.random() * 14);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

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
      let mx = Math.random() * 1024,
        my = 0;
      fCtx.moveTo(mx, my);
      while (my < 1024) {
        my += 32;
        mx += (Math.random() - 0.5) * 45;
        fCtx.lineTo(mx, my);
      }
      fCtx.stroke();
    }

    const cx = 512,
      cy = 512;
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

export interface ZeusHopliteRig {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  spear: THREE.Group;
  thrustCone: THREE.Mesh;
  spearTipAnchor: THREE.Group;
  hoplonShield: THREE.Group;
  crestSegments: Array<{ mesh: THREE.Mesh; phase: number; factor: number }>;
  cape: THREE.Mesh;
  capeBase: Float32Array;
  getTier: () => HopliteTierId;
  setTier: (tier: HopliteTierId) => void;
  // internal animation state
  animState: {
    hx: number;
    hz: number;
    thrustTimer: number;
    sparkTriggered: boolean;
    blockTimer: number;
    blockSparkDone: boolean;
  };
}

export function buildZeusHoplite(
  textures: ZeusHopliteTextures = getCachedZeusHopliteTextures(),
  initialTier: HopliteTierId = 3
): ZeusHopliteRig {
  const spec0 = ZEUS_HOPLITE_TIERS[initialTier] ?? ZEUS_HOPLITE_TIERS[3];

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: 0xc98a5b,
      roughness: 0.44,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.0035,
    }),
    beard: new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.65,
    }),
    armorMain: new THREE.MeshStandardMaterial({
      color: spec0.armorHex,
      metalness: spec0.metalness,
      roughness: spec0.roughness,
    }),
    armorAccent: new THREE.MeshStandardMaterial({
      color: spec0.accentHex,
      emissive: new THREE.Color(0x3b2200),
      emissiveIntensity: 0.25,
      metalness: 0.9,
      roughness: 0.2,
    }),
    greaveMat: new THREE.MeshStandardMaterial({
      color: spec0.greaveHex,
      metalness: spec0.metalness,
      roughness: spec0.roughness,
    }),
    leatherMat: new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.72,
    }),
    chitonMat: new THREE.MeshStandardMaterial({
      map: textures.chitonTex,
      roughness: 0.56,
      side: THREE.DoubleSide,
    }),
    crestMat: new THREE.MeshStandardMaterial({
      color: spec0.crestColorHex,
      emissive: new THREE.Color(0x1e293b),
      emissiveIntensity: 0.25,
      roughness: 0.45,
    }),
    cloakMat: new THREE.MeshStandardMaterial({
      color: spec0.cloakColorHex,
      emissive: new THREE.Color(0x091326),
      emissiveIntensity: 0.25,
      roughness: 0.54,
      side: THREE.DoubleSide,
    }),
    shieldMat: new THREE.MeshStandardMaterial({
      map: textures.createZeusShieldTexture(initialTier),
      metalness: 0.78,
      roughness: 0.26,
      side: THREE.DoubleSide,
    }),
    spearShaftMat: new THREE.MeshStandardMaterial({
      color: 0x5c2d16,
      roughness: 0.62,
    }),
    electricMat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: spec0.electricGlow,
      roughness: 0.1,
    }),
  };

  const root = new THREE.Group();
  const body = group(root, 0, 1.04, 0);

  const tier2Parts: THREE.Object3D[] = [];
  const tier3Parts: THREE.Object3D[] = [];
  const tier4Parts: THREE.Object3D[] = [];

  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.24, 20, 18), M.leatherMat, [0, 0, 0], [0, 0, 0], [1.14, 0.78, 0.85]);

  const legs = {
    L: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
    R: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.155, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.145, 0.105, 0.48, 18), M.skin, [0, -0.23, 0], [0, 0, 0], [1.04, 1, 1.08]);
    sculpt(hip, new THREE.SphereGeometry(0.112, 14, 14), M.skin, [s * 0.02, -0.2, 0.048], [0, 0, 0], [0.96, 1.8, 0.86]);
    sculpt(hip, new THREE.SphereGeometry(0.088, 14, 14), M.skin, [0, -0.48, 0.015]);

    const knee = group(hip, 0, -0.49, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.09, 0.056, 0.44, 16), M.skin, [0, -0.22, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.085, 14, 14), M.skin, [0, -0.15, -0.038], [0, 0, 0], [0.98, 1.65, 0.96]);

    sculpt(knee, new THREE.CylinderGeometry(0.092, 0.06, 0.35, 16, 1, false, -0.88, 1.76), M.greaveMat, [0, -0.22, 0.01]);
    const kneeCap = sculpt(knee, new THREE.ConeGeometry(0.048, 0.1, 5), M.armorAccent, [0, -0.02, 0.082], [0.15, 0, 0], [1.1, 1, 0.42]);
    tier2Parts.push(kneeCap);

    const ankle = group(knee, 0, -0.44, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.098, 0.052, 0.22), M.leatherMat, [0, -0.02, 0.038]);
    sculpt(ankle, new THREE.BoxGeometry(0.106, 0.018, 0.232), M.greaveMat, [0, -0.046, 0.038]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.22, -0.14, -0.1);
  legs.L.knee.rotation.set(0.28, 0, 0);
  legs.R.hip.rotation.set(0.18, 0.16, 0.12);
  legs.R.knee.rotation.set(0.22, 0, 0);

  const torso = group(body, 0, 1.3, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.43),
    new THREE.Vector2(0.26, -0.39),
    new THREE.Vector2(0.24, -0.19),
    new THREE.Vector2(0.3, 0.04),
    new THREE.Vector2(0.39, 0.27),
    new THREE.Vector2(0.34, 0.42),
    new THREE.Vector2(0.15, 0.49),
    new THREE.Vector2(0.01, 0.5),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 32), M.skin, [0, 0, 0], [0, 0, 0], [1.18, 1.02, 0.75]);

  const cuirassPts = [
    new THREE.Vector2(0.01, -0.36),
    new THREE.Vector2(0.27, -0.32),
    new THREE.Vector2(0.255, -0.15),
    new THREE.Vector2(0.315, 0.05),
    new THREE.Vector2(0.405, 0.27),
    new THREE.Vector2(0.34, 0.39),
    new THREE.Vector2(0.19, 0.42),
    new THREE.Vector2(0.01, 0.42),
  ];
  sculpt(torso, new THREE.LatheGeometry(cuirassPts, 36), M.armorMain, [0, 0.01, 0], [0, 0, 0], [1.19, 1.0, 0.78]);

  for (const side of [-1, 1]) {
    sculpt(torso, new THREE.BoxGeometry(0.085, 0.03, 0.32), M.armorAccent, [side * 0.22, 0.4, 0.01], [0.1, 0, side * -0.12]);
  }

  const pecArmorGeo = new THREE.SphereGeometry(0.2, 20, 20);
  const pecArmorL = sculpt(torso, pecArmorGeo, M.armorMain, [-0.18, 0.22, 0.175], [0.12, -0.22, -0.14], [1.05, 0.85, 0.55]);
  const pecArmorR = sculpt(torso, pecArmorGeo, M.armorMain, [0.18, 0.22, 0.175], [0.12, 0.22, 0.14], [1.05, 0.85, 0.55]);
  tier3Parts.push(pecArmorL, pecArmorR);

  const abArmorGeo = new THREE.SphereGeometry(0.082, 12, 12);
  [0.03, -0.08, -0.19].forEach((ay) => {
    const abL = sculpt(torso, abArmorGeo, M.armorMain, [-0.072, ay, 0.225], [0, 0, 0], [1.0, 0.75, 0.45]);
    const abR = sculpt(torso, abArmorGeo, M.armorMain, [0.072, ay, 0.225], [0, 0, 0], [1.0, 0.75, 0.45]);
    tier3Parts.push(abL, abR);
  });

  const chestEmblem = group(torso, 0, 0.19, 0.255);
  sculpt(chestEmblem, new THREE.ConeGeometry(0.032, 0.11, 4), M.armorAccent, [-0.012, 0.04, 0], [0, 0, -0.32], [1, 1, 0.35]);
  sculpt(chestEmblem, new THREE.ConeGeometry(0.032, 0.11, 4), M.armorAccent, [0.012, -0.04, 0], [0, 0, Math.PI - 0.32], [1, 1, 0.35]);
  tier2Parts.push(chestEmblem);

  const gorget = new THREE.TorusGeometry(0.21, 0.024, 10, 32);
  gorget.rotateX(Math.PI / 2);
  const gorgetMesh = sculpt(torso, gorget, M.armorAccent, [0, 0.41, 0.01], [0.16, 0, 0], [1.15, 1, 0.9]);
  tier4Parts.push(gorgetMesh);

  sculpt(torso, new THREE.CylinderGeometry(0.115, 0.145, 0.24, 18), M.skin, [0, 0.51, -0.008], [0.06, 0, 0]);

  const head = group(torso, 0, 0.72, 0.032);
  sculpt(head, new THREE.SphereGeometry(0.185, 28, 28), M.skin, [0, 0, 0], [0, 0, 0], [0.92, 1.14, 0.98]);
  sculpt(head, new THREE.CylinderGeometry(0.16, 0.14, 0.1, 20, 1, false, -Math.PI * 0.4, Math.PI * 0.8), M.beard, [0, -0.1, 0.04], [0.1, 0, 0], [0.95, 1, 1.04]);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0x38bdf8), emissiveIntensity: 1.5 });
  sculpt(head, new THREE.SphereGeometry(0.018, 12, 12), eyeMat, [-0.048, 0.02, 0.172], [0, 0, 0], [1.15, 0.7, 0.8]);
  sculpt(head, new THREE.SphereGeometry(0.018, 12, 12), eyeMat, [0.048, 0.02, 0.172], [0, 0, 0], [1.15, 0.7, 0.8]);

  const helm = group(head, 0, 0.032, -0.004);
  sculpt(helm, new THREE.SphereGeometry(0.205, 30, 22, 0, Math.PI * 2, 0, Math.PI * 0.56), M.armorMain, [0, 0.02, 0], [-0.08, 0, 0], [0.98, 1.08, 1.06]);
  sculpt(helm, new THREE.BoxGeometry(0.02, 0.105, 0.028), M.armorAccent, [0, 0.03, 0.204], [-0.06, 0, 0]);
  for (const side of [-1, 1]) {
    const cheek = group(helm, side * 0.148, -0.042, 0.102);
    cheek.rotation.set(0.08, side * 0.5, side * -0.12);
    sculpt(cheek, new THREE.BoxGeometry(0.02, 0.15, 0.12), M.armorMain);
  }
  sculpt(helm, new THREE.CylinderGeometry(0.195, 0.22, 0.13, 22, 1, true, Math.PI * 0.62, Math.PI * 0.76), M.armorMain, [0, -0.068, -0.014], [0.12, 0, 0]);

  const crestMount = group(helm, 0, 0.22, -0.01);
  sculpt(crestMount, new THREE.BoxGeometry(0.032, 0.075, 0.28), M.armorAccent, [0, 0, 0], [-0.08, 0, 0]);
  const crestSegments: Array<{ mesh: THREE.Mesh; phase: number; factor: number }> = [];
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const ang = -0.5 + t * 2.45;
    const r = 0.23;
    const cy = Math.cos(ang) * r * 0.88 - 0.03;
    const cz = Math.sin(ang) * r * 1.12 - 0.03;
    const seg = sculpt(crestMount, new THREE.BoxGeometry(0.024, 0.14 + Math.sin(t * Math.PI) * 0.05, 0.032), M.crestMat, [0, cy, cz], [ang, 0, 0]);
    crestSegments.push({ mesh: seg, phase: i * 0.45, factor: 0.3 + t * 0.9 });
  }
  tier2Parts.push(crestMount);

  const helmWings = group(helm, 0, 0.08, -0.02);
  for (const side of [-1, 1]) {
    const wPivot = group(helmWings, side * 0.19, 0, 0);
    wPivot.rotation.set(-0.2, side * 0.35, side * -0.25);
    for (let f = 0; f < 4; f++) {
      sculpt(
        wPivot,
        new THREE.ConeGeometry(0.024, 0.22 - f * 0.03, 5),
        M.armorAccent,
        [side * (0.04 + f * 0.015), 0.08 + f * 0.025, -0.04 - f * 0.045],
        [-0.85, 0, side * -0.45],
        [0.45, 1, 1]
      );
    }
  }
  tier4Parts.push(helmWings);

  function createHopliteArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.42, 0.33, -0.008);

    const pauldronT2 = sculpt(arm, new THREE.SphereGeometry(0.165, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), M.armorMain, [s * 0.015, 0.035, 0], [0, 0, s * -0.32], [1.12, 0.76, 1.15]);
    tier2Parts.push(pauldronT2);

    const pauldronT4 = sculpt(arm, new THREE.SphereGeometry(0.185, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), M.armorAccent, [s * 0.02, 0.06, 0], [0, 0, s * -0.35], [1.14, 0.72, 1.16]);
    tier4Parts.push(pauldronT4);

    sculpt(arm, new THREE.SphereGeometry(0.128, 16, 16), M.skin, [0, -0.01, 0]);
    sculpt(arm, new THREE.CapsuleGeometry(0.085, 0.26, 12, 16), M.skin, [s * 0.022, -0.17, 0], [0, 0, s * 0.07]);

    const elbow = group(arm, s * 0.04, -0.34, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.082, 0.054, 0.31, 16), M.skin, [0, -0.15, 0]);

    const bracer = sculpt(elbow, new THREE.CylinderGeometry(0.066, 0.058, 0.11, 20, 1, true), M.armorAccent, [0, -0.24, 0]);
    tier2Parts.push(bracer);

    const hand = group(elbow, 0, -0.32, 0);
    sculpt(hand, new THREE.BoxGeometry(0.068, 0.078, 0.034), M.skin, [0, -0.018, 0]);

    return { arm, elbow, hand };
  }

  const rightArm = createHopliteArm(true);
  const leftArm = createHopliteArm(false);

  const spear = new THREE.Group();
  rightArm.hand.add(spear);
  spear.position.set(0, -0.035, 0.032);
  spear.rotation.set(Math.PI / 2, 0, 0);

  sculpt(spear, new THREE.CylinderGeometry(0.02, 0.023, 2.75, 14), M.spearShaftMat, [0, 0.35, 0]);
  sculpt(spear, new THREE.ConeGeometry(0.034, 0.22, 8), M.armorAccent, [0, -1.12, 0], [Math.PI, 0, 0]);

  const spearHead = group(spear, 0, 1.72, 0);
  sculpt(spearHead, new THREE.CylinderGeometry(0.036, 0.024, 0.1, 12), M.armorAccent, [0, 0.04, 0]);
  sculpt(spearHead, new THREE.ConeGeometry(0.065, 0.44, 4), M.armorAccent, [0, 0.3, 0], [0, 0, 0], [1.0, 1.0, 0.24]);
  const spearElectric = sculpt(spearHead, new THREE.BoxGeometry(0.014, 0.34, 0.024), M.electricMat, [0, 0.26, 0]);
  tier3Parts.push(spearElectric);

  // Cone de perfuração elétrica / estocada
  const thrustCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.95, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  thrustCone.position.set(0, 0.38, 0);
  spearHead.add(thrustCone);

  const spearTipAnchor = group(spearHead, 0, 0.52, 0);

  const hoplonShield = group(leftArm.elbow, -0.055, -0.22, 0.02);
  hoplonShield.rotation.set(0, -Math.PI / 2, 0);

  const shieldDomeGeo = new THREE.SphereGeometry(0.6, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.28);
  shieldDomeGeo.rotateX(Math.PI / 2);
  sculpt(hoplonShield, shieldDomeGeo, M.shieldMat, [0, 0, -0.46]);
  sculpt(hoplonShield, new THREE.TorusGeometry(0.57, 0.028, 10, 44), M.armorAccent, [0, 0, 0.02]);

  const garments = group(torso, 0, 0, 0);
  const beltGeo = new THREE.TorusGeometry(0.275, 0.028, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.leatherMat, [0, -0.35, 0.01], [0.05, 0, -0.03], [1.12, 1, 0.84]);
  sculpt(garments, new THREE.BoxGeometry(0.11, 0.085, 0.026), M.armorAccent, [0, -0.35, 0.24]);

  const pterugesGroup = group(garments, 0, -0.38, 0);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    sculpt(
      pterugesGroup,
      new THREE.BoxGeometry(0.078, 0.34, 0.016),
      i % 2 === 0 ? M.leatherMat : M.armorMain,
      [Math.sin(a) * 0.28, -0.17, Math.cos(a) * 0.22],
      [Math.cos(a) * 0.14, a, -Math.sin(a) * 0.14]
    );
  }
  tier2Parts.push(pterugesGroup);

  const skirtGeo = new THREE.CylinderGeometry(0.26, 0.48, 0.64, 44, 16, true);
  const skPos = skirtGeo.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    const x = skPos.getX(i);
    const y = skPos.getY(i);
    const z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.32 - y) / 0.64));
    const pleat = Math.sin(angle * 16) * 0.024 * (0.2 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    skPos.setXYZ(i, Math.cos(angle) * r * 1.06, y, Math.sin(angle) * r * 0.84);
  }
  skirtGeo.computeVertexNormals();
  sculpt(garments, skirtGeo, M.chitonMat, [0, -0.62, 0], [0.04, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.32, 1.76, 22, 28);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i);
    const y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.88 - y) / 1.76));
    const archZ = -0.17 - Math.cos((x / 0.66) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.48;
    const fx = x * (0.62 + normY * 0.74);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.cloakMat, [0, -0.44, -0.04]);
  tier3Parts.push(cape);

  let currentTier: HopliteTierId = initialTier;

  function applyTier(tier: HopliteTierId) {
    currentTier = tier;
    root.userData.armorTier = tier;
    const nextSpec = ZEUS_HOPLITE_TIERS[tier] ?? ZEUS_HOPLITE_TIERS[3];

    M.armorMain.color.setHex(nextSpec.armorHex);
    M.armorMain.metalness = nextSpec.metalness;
    M.armorMain.roughness = nextSpec.roughness;

    M.armorAccent.color.setHex(nextSpec.accentHex);
    M.greaveMat.color.setHex(nextSpec.greaveHex);
    M.greaveMat.metalness = nextSpec.metalness;
    M.greaveMat.roughness = nextSpec.roughness;

    M.crestMat.color.setHex(nextSpec.crestColorHex);
    M.cloakMat.color.setHex(nextSpec.cloakColorHex);
    M.electricMat.emissiveIntensity = nextSpec.electricGlow;

    if (M.shieldMat.map) M.shieldMat.map.dispose();
    M.shieldMat.map = textures.createZeusShieldTexture(tier);
    M.shieldMat.needsUpdate = true;

    tier2Parts.forEach((p) => {
      p.visible = tier >= 2;
    });
    tier3Parts.forEach((p) => {
      p.visible = tier >= 3;
    });
    tier4Parts.forEach((p) => {
      p.visible = tier >= 4;
    });
  }

  root.userData.setArmorTier = applyTier;
  applyTier(initialTier);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    spear,
    thrustCone,
    spearTipAnchor,
    hoplonShield,
    crestSegments,
    cape,
    capeBase,
    getTier: () => currentTier,
    setTier: applyTier,
    animState: {
      hx: 0,
      hz: 0,
      thrustTimer: 0,
      sparkTriggered: false,
      blockTimer: 0,
      blockSparkDone: false,
    },
  };
}

export function animateZeusHoplite(
  hoplite: ZeusHopliteRig,
  dt: number,
  t: number,
  action: ZeusHopliteAction,
  onSpark?: (pos: THREE.Vector3) => void
): void {
  let hy = 0;
  let yaw = Math.sin(t * 0.35) * 0.12;
  let pitch = 0.02;
  let roll = 0;
  let torsoYaw = 0;
  const breath = Math.sin(t * 2.2) * 0.022;

  const st = hoplite.animState;
  const tmpV = new THREE.Vector3();

  if (action === 'marcha') {
    const a = t * 0.85;
    const R = 2.65;
    st.hx = Math.cos(a) * R;
    st.hz = Math.sin(a) * R;
    yaw = -a;
    pitch = 0.07;
    roll = -0.06;

    const stride = t * 5.2;
    const sinS = Math.sin(stride);
    const cosS = Math.cos(stride);
    hy = Math.abs(cosS) * 0.045;
    torsoYaw = sinS * 0.08;

    hoplite.legs.L.hip.rotation.x = -0.16 + sinS * 0.36;
    hoplite.legs.L.knee.rotation.x = 0.22 + Math.max(0, -cosS) * 0.36;
    hoplite.legs.R.hip.rotation.x = -0.16 - sinS * 0.36;
    hoplite.legs.R.knee.rotation.x = 0.22 + Math.max(0, cosS) * 0.36;

    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    hoplite.leftArm.arm.rotation.set(-0.68, -0.42, -0.4);
    hoplite.leftArm.elbow.rotation.set(-0.92, -0.22, 0.22);
    hoplite.rightArm.arm.rotation.set(-0.78 - sinS * 0.12, 0.18, 0.45);
    hoplite.rightArm.elbow.rotation.set(-0.58 + sinS * 0.1, 0.15, 0.2);
  } else if (action === 'corrida') {
    const a = t * 1.65;
    const R = 2.85;
    st.hx = Math.cos(a) * R;
    st.hz = Math.sin(a) * R;
    yaw = -a;
    pitch = 0.24;
    roll = -0.22;

    const stride = t * 10.5;
    const sinS = Math.sin(stride);
    const cosS = Math.cos(stride);
    hy = Math.abs(cosS) * 0.11;
    torsoYaw = sinS * 0.14;

    hoplite.legs.L.hip.rotation.x = -0.35 + sinS * 0.62;
    hoplite.legs.L.knee.rotation.x = 0.45 + Math.max(0, -cosS) * 0.65;
    hoplite.legs.R.hip.rotation.x = -0.35 - sinS * 0.62;
    hoplite.legs.R.knee.rotation.x = 0.45 + Math.max(0, cosS) * 0.65;

    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    hoplite.leftArm.arm.rotation.set(-0.82, -0.52, -0.36);
    hoplite.leftArm.elbow.rotation.set(-1.05, -0.28, 0.24);
    hoplite.rightArm.arm.rotation.set(-1.12 - sinS * 0.18, 0.16, 0.4);
    hoplite.rightArm.elbow.rotation.set(-0.78 + sinS * 0.14, 0.15, 0.18);
  } else if (action === 'ataque') {
    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    const prevTimer = st.thrustTimer;
    st.thrustTimer = (st.thrustTimer + dt * 1.45) % 1.0;
    if (st.thrustTimer < prevTimer) st.sparkTriggered = false;

    // Estocada em linha reta horizontal perfeita
    if (st.thrustTimer < 0.28) {
      const p = st.thrustTimer / 0.28;
      const ease = p * p;
      torsoYaw = -0.25 * ease;
      pitch = 0.04 * ease;
      st.hz = -0.15 * ease;

      hoplite.legs.L.hip.rotation.set(-0.25, -0.14, -0.1);
      hoplite.legs.L.knee.rotation.set(0.32, 0, 0);
      hoplite.legs.R.hip.rotation.set(0.22, 0.16, 0.12);
      hoplite.legs.R.knee.rotation.set(0.26, 0, 0);

      const armX = -0.85 * (1 - ease) + 0.52 * ease;
      const elbowX = -0.55 * (1 - ease) - 1.32 * ease;
      const armZ = 0.45 * (1 - ease) + 0.06 * ease;
      const elbowZ = 0.2 * (1 - ease) + 0.0 * ease;

      hoplite.rightArm.arm.rotation.set(armX, 0.05, armZ);
      hoplite.rightArm.elbow.rotation.set(elbowX, 0.0, elbowZ);
      hoplite.spear.rotation.set(Math.PI / 2 - (armX + elbowX), 0, -(armZ + elbowZ));

      hoplite.leftArm.arm.rotation.set(-0.78, -0.48, -0.35);
      hoplite.leftArm.elbow.rotation.set(-1.05, -0.25, 0.24);
      (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;
    } else if (st.thrustTimer < 0.52) {
      const p = (st.thrustTimer - 0.28) / 0.24;
      const lunge = Math.sin(p * Math.PI * 0.5);
      torsoYaw = -0.25 + 0.55 * lunge;
      pitch = 0.04 + 0.12 * lunge;
      st.hz = -0.15 + 0.65 * lunge;
      hy = -0.07 * lunge;

      hoplite.legs.L.hip.rotation.set(-0.25 - 0.34 * lunge, -0.14, -0.1);
      hoplite.legs.L.knee.rotation.set(0.32 + 0.32 * lunge, 0, 0);
      hoplite.legs.R.hip.rotation.set(0.22 + 0.3 * lunge, 0.16, 0.12);
      hoplite.legs.R.knee.rotation.set(0.26 - 0.14 * lunge, 0, 0);

      const armX = 0.52 - 1.98 * lunge;
      const elbowX = -1.32 + 1.26 * lunge;
      const armZ = 0.06 * (1 - lunge);

      hoplite.rightArm.arm.rotation.set(armX, 0.02, armZ);
      hoplite.rightArm.elbow.rotation.set(elbowX, 0.0, 0.0);
      hoplite.spear.rotation.set(Math.PI / 2 - (armX + elbowX) - pitch, 0, -armZ);

      hoplite.leftArm.arm.rotation.set(-0.62, -0.65, -0.48);
      hoplite.leftArm.elbow.rotation.set(-0.95, -0.28, 0.22);

      (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.8;
      hoplite.thrustCone.scale.set(1, 0.85 + lunge * 0.65, 1);

      if (lunge > 0.88 && !st.sparkTriggered) {
        st.sparkTriggered = true;
        hoplite.root.updateMatrixWorld(true);
        hoplite.spearTipAnchor.getWorldPosition(tmpV);
        if (onSpark) onSpark(tmpV);
      }
    } else {
      const k = (st.thrustTimer - 0.52) / 0.48;
      const rem = 1 - k;
      torsoYaw = 0.3 * rem;
      pitch = 0.16 * rem;
      st.hz = 0.5 * rem;
      hy = -0.07 * rem;

      hoplite.legs.L.hip.rotation.set(-0.22 - 0.37 * rem, -0.14, -0.1);
      hoplite.legs.L.knee.rotation.set(0.28 + 0.36 * rem, 0, 0);
      hoplite.legs.R.hip.rotation.set(0.18 + 0.34 * rem, 0.16, 0.12);
      hoplite.legs.R.knee.rotation.set(0.22 - 0.1 * rem, 0, 0);

      const armX = -1.46 * rem - 0.85 * k;
      const elbowX = -0.06 * rem - 0.55 * k;
      const armZ = 0.45 * k;
      const elbowZ = 0.2 * k;

      hoplite.rightArm.arm.rotation.set(armX, 0.02 * rem + 0.18 * k, armZ);
      hoplite.rightArm.elbow.rotation.set(elbowX, 0.15 * k, elbowZ);
      hoplite.spear.rotation.set(Math.PI / 2 - (armX + elbowX) * rem - pitch, 0, -(armZ + elbowZ) * rem);

      hoplite.leftArm.arm.rotation.set(-0.62 * rem - 0.68 * k, -0.65 * rem - 0.42 * k, -0.48 * rem - 0.42 * k);
      hoplite.leftArm.elbow.rotation.set(-0.95 * rem - 0.92 * k, -0.25, 0.22);
      (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  } else if (action === 'defesa') {
    hoplite.spear.rotation.set(Math.PI / 2, 0, 0);
    (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;

    const prevBlock = st.blockTimer;
    st.blockTimer = (st.blockTimer + dt * 0.85) % 1.0;
    if (st.blockTimer < prevBlock) st.blockSparkDone = false;

    const hitPulse = st.blockTimer > 0.45 && st.blockTimer < 0.72 ? Math.sin(((st.blockTimer - 0.45) / 0.27) * Math.PI) : 0;

    if (hitPulse > 0.85 && !st.blockSparkDone) {
      st.blockSparkDone = true;
      hoplite.root.updateMatrixWorld(true);
      hoplite.hoplonShield.getWorldPosition(tmpV);
      tmpV.z += 0.18;
      if (onSpark) onSpark(tmpV);
    }

    hy = -0.14 - hitPulse * 0.04;
    st.hz = -0.18 * hitPulse;
    pitch = 0.14 - hitPulse * 0.12;
    torsoYaw = 0.28 - hitPulse * 0.08;

    hoplite.legs.L.hip.rotation.set(-0.48 - hitPulse * 0.1, -0.18, -0.14);
    hoplite.legs.L.knee.rotation.set(0.68 + hitPulse * 0.14, 0, 0);
    hoplite.legs.R.hip.rotation.set(0.36 + hitPulse * 0.08, 0.22, 0.18);
    hoplite.legs.R.knee.rotation.set(0.56 + hitPulse * 0.12, 0, 0);

    hoplite.leftArm.arm.rotation.set(-0.72 - hitPulse * 0.08, 0.35, 0.58);
    hoplite.leftArm.elbow.rotation.set(-1.35, 0.45, -1.15);

    hoplite.hoplonShield.position.set(0.02, -0.26, 0.1 - hitPulse * 0.03);
    hoplite.hoplonShield.rotation.set(1.18, -0.22, -0.35);

    hoplite.rightArm.arm.rotation.set(-1.32 + hitPulse * 0.06, 0.16, 0.36);
    hoplite.rightArm.elbow.rotation.set(-0.62, 0.15, 0.2);
  } else {
    // Guarda de Falange
    st.hx = 0;
    st.hz = 0;
    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    hoplite.spear.rotation.set(Math.PI / 2, 0, 0);
    (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;
    hoplite.leftArm.arm.rotation.set(-0.68, -0.42, -0.42 + Math.sin(t * 1.6) * 0.02);
    hoplite.leftArm.elbow.rotation.set(-0.92, -0.22, 0.22);
    hoplite.rightArm.arm.rotation.set(-0.85, 0.18, 0.45 + Math.cos(t * 1.6) * 0.02);
    hoplite.rightArm.elbow.rotation.set(-0.55, 0.15, 0.2);

    hoplite.legs.L.hip.rotation.set(-0.22, -0.14, -0.1);
    hoplite.legs.L.knee.rotation.set(0.28, 0, 0);
    hoplite.legs.R.hip.rotation.set(0.18, 0.16, 0.12);
    hoplite.legs.R.knee.rotation.set(0.22, 0, 0);
  }

  hoplite.root.position.set(st.hx, hy, st.hz);
  hoplite.root.rotation.set(0, yaw, 0);
  hoplite.body.position.y = 1.04 + breath;
  hoplite.body.rotation.set(pitch, torsoYaw, roll);

  const wind = action === 'marcha' || action === 'corrida' ? (action === 'corrida' ? 2.4 : 1.6) : 1.0;
  for (const cs of hoplite.crestSegments) {
    cs.mesh.position.x = Math.sin(t * 3.4 * wind - cs.phase) * 0.016 * cs.factor;
  }

  if (hoplite.cape.visible) {
    const cAttr = hoplite.cape.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cAttr.count; i++) {
      const bx = hoplite.capeBase[i * 3];
      const by = hoplite.capeBase[i * 3 + 1];
      const bz = hoplite.capeBase[i * 3 + 2];
      const normY = Math.max(0, Math.min(1, (0.88 - by) / 1.76));
      const wave = Math.sin(t * 3.2 * wind - normY * 4.5 + bx * 2.5) * 0.12 * normY;
      cAttr.setXYZ(i, bx, by, bz + wave);
    }
    cAttr.needsUpdate = true;
    hoplite.cape.geometry.computeVertexNormals();
  }
}

export function createZeusHopliteArena(textures: ZeusHopliteTextures = getCachedZeusHopliteTextures()): THREE.Group {
  const arena = new THREE.Group();

  const arenaFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 7.5, 0.32, 72),
    new THREE.MeshStandardMaterial({ map: textures.floorTex, roughness: 0.36, metalness: 0.14 })
  );
  arenaFloor.position.y = -0.16;
  arenaFloor.receiveShadow = true;
  arena.add(arenaFloor);

  const goldRing = new THREE.Mesh(
    new THREE.RingGeometry(4.45, 4.56, 72),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
  );
  goldRing.rotation.x = -Math.PI / 2;
  goldRing.position.y = 0.015;
  arena.add(goldRing);

  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.42 });
  const goldColMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.88, roughness: 0.22 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const col = group(arena, Math.cos(a) * 5.8, 0, Math.sin(a) * 5.8);
    sculpt(col, new THREE.BoxGeometry(0.7, 0.14, 0.7), marbleMat, [0, 0.07, 0]);
    sculpt(col, new THREE.CylinderGeometry(0.22, 0.26, 2.75, 18), marbleMat, [0, 1.52, 0]);
    sculpt(col, new THREE.BoxGeometry(0.64, 0.14, 0.64), marbleMat, [0, 2.96, 0]);
    sculpt(col, new THREE.BoxGeometry(0.54, 0.05, 0.54), goldColMat, [0, 3.06, 0]);
  }

  return arena;
}
