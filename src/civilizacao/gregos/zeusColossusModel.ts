import * as THREE from 'three';
import { TeamId } from '../../game/types';

/* ==========================================================================
   1. ESPECIFICAÇÃO DAS 3 EVOLUÇÕES DO COLOSSO DE ZEUS (BRONZE -> PRATA -> OURO)
   ========================================================================== */
export interface ColossusTierSpec {
  tier: number;
  title: string;
  subtitle: string;
  metalHex: number;
  accentHex: number;
  bladeHex: number;
  metalness: number;
  roughness: number;
  crestHex: number;
  skirtHex: number;
  eyeHex: number;
  eyeIntensity: number;
  auraHex: number;
}

export const COLOSSUS_TIERS: Record<number, ColossusTierSpec> = {
  1: {
    tier: 1,
    title: 'Colosso de Bronze • Era Mítica (Base)',
    subtitle: 'Autômato gigante forjado em bronze maciço com couraça muscular esculpida, elmo coríntio fechado, túnica azul-olímpico e espada grande',
    metalHex: 0xb87634,
    accentHex: 0xeab308,
    bladeHex: 0xd69e54,
    metalness: 0.86,
    roughness: 0.28,
    crestHex: 0x1d4ed8,
    skirtHex: 0x1e3a8a,
    eyeHex: 0x38bdf8,
    eyeIntensity: 1.8,
    auraHex: 0xd97706
  },
  2: {
    tier: 2,
    title: 'Colosso de Prata • Melhoria: Mão de Talos',
    subtitle: 'Corpo reforçado em prata olímpica polida com ombreiras duplas, brilho estelar e lâmina rúnica prateada de alto impacto',
    metalHex: 0xdbe4ee,
    accentHex: 0x38bdf8,
    bladeHex: 0xf1f5f9,
    metalness: 0.94,
    roughness: 0.18,
    crestHex: 0x2563eb,
    skirtHex: 0x1e3a8a,
    eyeHex: 0x38bdf8,
    eyeIntensity: 2.8,
    auraHex: 0x38bdf8
  },
  3: {
    tier: 3,
    title: 'Colosso de Ouro • Melhoria Suprema: Colosso de Rodes',
    subtitle: 'Ápice divino em ouro olímpico radiante: crista dourada incandescente, ornamentos solares nos ombros e espada carregada pelos raios de Zeus',
    metalHex: 0xfacc15,
    accentHex: 0xfef08a,
    bladeHex: 0xfde047,
    metalness: 0.96,
    roughness: 0.14,
    crestHex: 0xfacc15,
    skirtHex: 0x1d4ed8,
    eyeHex: 0xfef08a,
    eyeIntensity: 4.2,
    auraHex: 0xfacc15
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR (METAL FORJADO COM PÁTINA & PISO DO OLIMPO)
   ========================================================================== */
let cachedColossusTextures: { metalBump: THREE.CanvasTexture; skirtTex: THREE.CanvasTexture; floorTex: THREE.CanvasTexture } | null = null;

export function createForgedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 4200; i++) {
      const v = 116 + Math.floor(Math.random() * 24);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createColossusSkirtTexture(teamColor = '#1e3a8a'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = teamColor;
    ctx.fillRect(0, 0, 512, 256);

    for (let x = 0; x < 512; x += 16) {
      ctx.fillStyle = (x / 16) % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 13, 28, 0.28)';
      ctx.fillRect(x, 0, 8, 256);
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 192, 512, 46);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 187, 512, 5);
    ctx.fillRect(0, 238, 512, 5);

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3.5;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 4, 230);
      ctx.lineTo(x + 4, 200);
      ctx.lineTo(x + 24, 200);
      ctx.lineTo(x + 24, 222);
      ctx.lineTo(x + 12, 222);
      ctx.lineTo(x + 12, 211);
      ctx.lineTo(x + 19, 211);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createColossusFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 1024, 1024);

    const grid = 8;
    const cell = 1024 / grid;
    for (let gx = 0; gx < grid; gx++) {
      for (let gy = 0; gy < grid; gy++) {
        const shade = 195 + Math.floor((Math.random() - 0.5) * 22);
        ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 12})`;
        ctx.fillRect(gx * cell + 3, gy * cell + 3, cell - 6, cell - 6);
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
        ctx.lineWidth = 3;
        ctx.strokeRect(gx * cell + 1.5, gy * cell + 1.5, cell - 3, cell - 3);
      }
    }

    const cx = 512, cy = 512;
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 420, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, 432, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function getCachedColossusTextures(): { metalBump: THREE.CanvasTexture; skirtTex: THREE.CanvasTexture; floorTex: THREE.CanvasTexture } {
  if (!cachedColossusTextures) {
    cachedColossusTextures = {
      metalBump: createForgedMetalTexture(),
      skirtTex: createColossusSkirtTexture(),
      floorTex: createColossusFloorTexture()
    };
  }
  return cachedColossusTextures;
}

/* ==========================================================================
   3. HELPERS DE ESCULTURA TITÂNICA E CONSTRUÇÃO DO COLOSSO
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

export interface ColossusArmHandle {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

export interface ColossusLegHandle {
  hip: THREE.Group;
  knee: THREE.Group;
  ankle: THREE.Group;
}

export interface CrestSegmentHandle {
  mesh: THREE.Mesh;
  phase: number;
  factor: number;
}

export interface ColossusBuildResult {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: Record<'L' | 'R', ColossusLegHandle>;
  rightArm: ColossusArmHandle;
  leftArm: ColossusArmHandle;
  greatsword: THREE.Group;
  slashTrail: THREE.Mesh;
  swordTipAnchor: THREE.Group;
  auraRing: THREE.Mesh;
  crestSegments: CrestSegmentHandle[];
  royalCape: THREE.Mesh;
  capeBase: Float32Array;
  colossusScale: number;
  setTier: (tier: number) => void;
  getTier: () => number;
}

export function buildColossus(
  metalBump: THREE.CanvasTexture,
  initialTier = 1,
  team: TeamId = 'player',
  _enableShadows = true
): ColossusBuildResult {
  const spec0 = COLOSSUS_TIERS[initialTier] || COLOSSUS_TIERS[1];
  const teamSkirtColor = team === 'player' ? '#1e3a8a' : '#7f1d1d';
  const skirtTex = createColossusSkirtTexture(teamSkirtColor);

  const M = {
    bodyMetal: new THREE.MeshStandardMaterial({
      color: spec0.metalHex,
      metalness: spec0.metalness,
      roughness: spec0.roughness,
      bumpMap: metalBump,
      bumpScale: 0.004
    }),
    accentMetal: new THREE.MeshStandardMaterial({
      color: spec0.accentHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.25,
      metalness: 0.94,
      roughness: 0.16
    }),
    bladeMetal: new THREE.MeshStandardMaterial({
      color: spec0.bladeHex,
      emissive: 0x1e293b,
      emissiveIntensity: 0.2,
      metalness: 0.96,
      roughness: 0.14
    }),
    skirtCloth: new THREE.MeshStandardMaterial({
      map: skirtTex,
      color: 0xffffff,
      roughness: 0.54,
      side: THREE.DoubleSide
    }),
    crestMat: new THREE.MeshStandardMaterial({
      color: spec0.crestHex,
      emissive: team === 'player' ? 0x1e3a8a : 0x7f1d1d,
      emissiveIntensity: 0.25,
      roughness: 0.42
    }),
    cloakMat: new THREE.MeshStandardMaterial({
      color: team === 'player' ? 0x1e3a8a : 0x7f1d1d,
      emissive: team === 'player' ? 0x091326 : 0x450a0a,
      emissiveIntensity: 0.25,
      roughness: 0.52,
      side: THREE.DoubleSide
    }),
    darkJoint: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.75,
      roughness: 0.45
    }),
    soberEyeMat: new THREE.MeshStandardMaterial({
      color: 0x475569,
      emissive: 0x0f172a,
      emissiveIntensity: 0.2,
      metalness: 0.65,
      roughness: 0.35
    }),
    soberPupilMat: new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.8
    })
  };

  const root = new THREE.Group();
  const colossusScale = 1.28;
  const body = group(root, 0, 1.06 * colossusScale, 0);
  body.scale.setScalar(colossusScale);

  const tier2Parts: THREE.Object3D[] = [];
  const tier3Parts: THREE.Object3D[] = [];

  // ========================================================================
  // 1. PELVE, SAIOTE PTERUGES & PERNAS
  // ========================================================================
  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.28, 22, 18), M.bodyMetal, [0, 0, 0], [0, 0, 0], [1.22, 0.82, 0.90]);

  const skirtGroup = group(pelvis, 0, -0.02, 0);
  const innerSkirtGeo = new THREE.CylinderGeometry(0.30, 0.52, 0.56, 36, 10, true);
  const skPos = innerSkirtGeo.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    const x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.28 - y) / 0.56));
    const pleat = Math.sin(angle * 16) * 0.022 * (0.25 + normY * 0.85);
    const r = Math.sqrt(x * x + z * z) + pleat;
    skPos.setXYZ(i, Math.cos(angle) * r * 1.16, y, Math.sin(angle) * r * 0.88);
  }
  innerSkirtGeo.computeVertexNormals();
  const innerSkirt = new THREE.Mesh(innerSkirtGeo, M.skirtCloth);
  innerSkirt.position.set(0, -0.24, 0);
  innerSkirt.castShadow = true;
  innerSkirt.receiveShadow = true;
  skirtGroup.add(innerSkirt);

  const strapCount = 14;
  for (let i = 0; i < strapCount; i++) {
    const a = (i / strapCount) * Math.PI * 2;
    const sinA = Math.sin(a), cosA = Math.cos(a);

    const longStrap = sculpt(
      skirtGroup,
      new THREE.BoxGeometry(0.105, 0.48, 0.026),
      M.bodyMetal,
      [sinA * 0.35, -0.23, cosA * 0.275],
      [cosA * 0.22, a, -sinA * 0.22]
    );
    sculpt(longStrap, new THREE.BoxGeometry(0.024, 0.42, 0.032), M.accentMetal, [0, 0, 0]);
    sculpt(longStrap, new THREE.SphereGeometry(0.022, 8, 8), M.accentMetal, [0, -0.19, 0.016]);

    const shortStrap = sculpt(
      skirtGroup,
      new THREE.BoxGeometry(0.115, 0.22, 0.030),
      M.accentMetal,
      [sinA * 0.355, -0.10, cosA * 0.282],
      [cosA * 0.24, a, -sinA * 0.24]
    );
    sculpt(shortStrap, new THREE.BoxGeometry(0.085, 0.16, 0.034), M.bodyMetal, [0, 0.01, 0]);
  }

  const frontApron = sculpt(skirtGroup, new THREE.BoxGeometry(0.18, 0.50, 0.034), M.accentMetal, [0, -0.24, 0.285], [-0.18, 0, 0]);
  sculpt(frontApron, new THREE.BoxGeometry(0.13, 0.44, 0.038), M.skirtCloth, [0, 0, 0.002]);
  sculpt(frontApron, new THREE.OctahedronGeometry(0.036, 0), M.accentMetal, [0, -0.16, 0.022]);

  const buildLeg = (side: 'L' | 'R'): ColossusLegHandle => {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.19, -0.05, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.175, 0.132, 0.48, 20), M.bodyMetal, [0, -0.23, 0], [0, 0, 0], [1.08, 1, 1.12]);
    sculpt(hip, new THREE.SphereGeometry(0.115, 16, 16), M.darkJoint, [0, -0.48, 0]);

    const knee = group(hip, 0, -0.49, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.125, 0.088, 0.45, 18), M.bodyMetal, [0, -0.22, 0.01], [0, 0, 0], [1.06, 1, 1.12]);
    sculpt(knee, new THREE.ConeGeometry(0.072, 0.16, 5), M.accentMetal, [0, -0.02, 0.115], [0.18, 0, 0], [1.15, 1, 0.45]);
    sculpt(knee, new THREE.TorusGeometry(0.105, 0.016, 8, 22), M.accentMetal, [0, -0.34, 0.01], [Math.PI / 2, 0, 0]);

    const ankle = group(knee, 0, -0.45, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.145, 0.085, 0.28), M.bodyMetal, [0, -0.03, 0.045]);
    sculpt(ankle, new THREE.BoxGeometry(0.155, 0.026, 0.295), M.accentMetal, [0, -0.068, 0.045]);

    return { hip, knee, ankle };
  };

  const legs: Record<'L' | 'R', ColossusLegHandle> = {
    L: buildLeg('L'),
    R: buildLeg('R'),
  };

  legs.L.hip.rotation.set(-0.18, -0.12, -0.08);
  legs.L.knee.rotation.set(0.24, 0, 0);
  legs.R.hip.rotation.set(0.15, 0.14, 0.10);
  legs.R.knee.rotation.set(0.20, 0, 0);

  // ========================================================================
  // 2. TORSO MUSCULAR & RAIO DE ZEUS NO PEITO
  // ========================================================================
  const torso = group(body, 0, 1.32, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.30, -0.40),
    new THREE.Vector2(0.28, -0.18),
    new THREE.Vector2(0.36, 0.05),
    new THREE.Vector2(0.48, 0.28),
    new THREE.Vector2(0.42, 0.44),
    new THREE.Vector2(0.18, 0.51),
    new THREE.Vector2(0.01, 0.52)
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.bodyMetal, [0, 0, 0], [0, 0, 0], [1.22, 1.04, 0.80]);

  const pecGeo = new THREE.SphereGeometry(0.24, 22, 22);
  sculpt(torso, pecGeo, M.bodyMetal, [-0.22, 0.23, 0.20], [0.12, -0.22, -0.14], [1.10, 0.88, 0.56]);
  sculpt(torso, pecGeo, M.bodyMetal, [0.22, 0.23, 0.20], [0.12, 0.22, 0.14], [1.10, 0.88, 0.56]);

  const abGeo = new THREE.SphereGeometry(0.10, 14, 14);
  [0.03, -0.09, -0.21].forEach((ay) => {
    sculpt(torso, abGeo, M.bodyMetal, [-0.09, ay, 0.265], [0, 0, 0], [1.05, 0.78, 0.48]);
    sculpt(torso, abGeo, M.bodyMetal, [0.09, ay, 0.265], [0, 0, 0], [1.05, 0.78, 0.48]);
  });

  const chestBolt = group(torso, 0, 0.20, 0.305);
  sculpt(chestBolt, new THREE.ConeGeometry(0.044, 0.16, 4), M.accentMetal, [-0.018, 0.065, 0], [0, 0, -0.34], [1, 1, 0.38]);
  sculpt(chestBolt, new THREE.BoxGeometry(0.075, 0.026, 0.028), M.accentMetal, [0, 0.005, 0], [0, 0, -0.15]);
  sculpt(chestBolt, new THREE.ConeGeometry(0.044, 0.17, 4), M.accentMetal, [0.020, -0.065, 0], [0, 0, Math.PI - 0.34], [1, 1, 0.38]);

  const belt = new THREE.TorusGeometry(0.32, 0.036, 10, 32);
  belt.rotateX(Math.PI / 2);
  sculpt(torso, belt, M.accentMetal, [0, -0.38, 0.01], [0.04, 0, 0], [1.18, 1, 0.86]);
  sculpt(torso, new THREE.BoxGeometry(0.15, 0.12, 0.04), M.accentMetal, [0, -0.38, 0.29]);

  const gorget = new THREE.TorusGeometry(0.24, 0.032, 10, 32);
  gorget.rotateX(Math.PI / 2);
  sculpt(torso, gorget, M.accentMetal, [0, 0.44, 0.01], [0.16, 0, 0], [1.18, 1, 0.92]);

  // CAPA REAL OLÍMPICA (TIER 3)
  const cloakGroup = group(torso, 0, 0.42, -0.22);
  for (const side of [-1, 1]) {
    sculpt(cloakGroup, new THREE.CylinderGeometry(0.055, 0.055, 0.03, 14), M.accentMetal, [side * 0.32, 0.02, 0.06], [0.3, 0, side * -0.3]);
  }
  const capeGeo = new THREE.PlaneGeometry(1.48, 1.85, 22, 26);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.925 - y) / 1.85));
    const archZ = -0.04 - Math.cos((x / 0.74) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.36;
    const fx = x * (0.58 + normY * 0.68);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const royalCape = sculpt(cloakGroup, capeGeo, M.cloakMat, [0, -0.92, -0.04]);
  tier3Parts.push(cloakGroup);

  // ========================================================================
  // 3. CABEÇA, ELMO CORÍNTIO & CRISTA MONUMENTAL
  // ========================================================================
  sculpt(torso, new THREE.CylinderGeometry(0.145, 0.175, 0.24, 20), M.darkJoint, [0, 0.54, -0.005], [0.05, 0, 0]);

  const head = group(torso, 0, 0.76, 0.025);
  sculpt(head, new THREE.SphereGeometry(0.185, 24, 24), M.darkJoint, [0, 0, 0], [0, 0, 0], [0.94, 1.15, 1.0]);

  for (const side of [-1, 1]) {
    const eyePivot = group(head, side * 0.062, 0.034, 0.182);
    eyePivot.rotation.set(0, side * 0.22, side * -0.10);
    sculpt(eyePivot, new THREE.SphereGeometry(0.024, 14, 12), M.soberEyeMat, [0, 0, 0], [0, 0, 0], [1.35, 0.68, 0.65]);
    sculpt(eyePivot, new THREE.SphereGeometry(0.013, 10, 10), M.soberPupilMat, [0, -0.001, 0.011], [0, 0, 0], [1.0, 0.9, 0.6]);
    sculpt(eyePivot, new THREE.BoxGeometry(0.064, 0.012, 0.024), M.bodyMetal, [0, 0.014, 0.006], [0.1, 0, side * -0.08]);
  }

  const helm = group(head, 0, 0.02, 0);
  sculpt(helm, new THREE.SphereGeometry(0.215, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.58), M.bodyMetal, [0, 0.03, 0], [-0.06, 0, 0], [0.98, 1.12, 1.06]);
  sculpt(helm, new THREE.BoxGeometry(0.034, 0.14, 0.042), M.accentMetal, [0, 0.02, 0.215], [-0.05, 0, 0]);
  for (const side of [-1, 1]) {
    const cheek = group(helm, side * 0.145, -0.055, 0.115);
    cheek.rotation.set(0.06, side * 0.42, side * -0.08);
    sculpt(cheek, new THREE.BoxGeometry(0.035, 0.18, 0.14), M.bodyMetal);
    sculpt(cheek, new THREE.BoxGeometry(0.038, 0.024, 0.145), M.accentMetal, [0, -0.08, 0]);
  }
  sculpt(helm, new THREE.CylinderGeometry(0.205, 0.235, 0.16, 22, 1, true, Math.PI * 0.62, Math.PI * 0.76), M.bodyMetal, [0, -0.07, -0.015], [0.12, 0, 0]);

  const crestMount = group(helm, 0, 0.25, -0.01);
  sculpt(crestMount, new THREE.BoxGeometry(0.052, 0.12, 0.36), M.accentMetal, [0, 0.01, -0.01], [-0.10, 0, 0]);
  const crestSegments: CrestSegmentHandle[] = [];
  const crestCount = 26;
  for (let i = 0; i < crestCount; i++) {
    const t = i / (crestCount - 1);
    const ang = -0.62 + t * 2.75;
    const r = 0.31;
    const cy = Math.cos(ang) * r * 0.95 + 0.01;
    const cz = Math.sin(ang) * r * 1.18 - 0.03;
    const plumeH = 0.22 + Math.sin(t * Math.PI) * 0.08;
    const seg = sculpt(
      crestMount,
      new THREE.BoxGeometry(0.038, plumeH, 0.042),
      M.crestMat,
      [0, cy, cz],
      [ang, 0, 0]
    );
    crestSegments.push({ mesh: seg, phase: i * 0.38, factor: 0.3 + t * 0.9 });
  }

  // ========================================================================
  // 4. BRAÇOS TITÂNICOS & MONTANTE COLOSSAL
  // ========================================================================
  function createColossusArm(isRight: boolean): ColossusArmHandle {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.50, 0.34, -0.008);

    sculpt(arm, new THREE.SphereGeometry(0.19, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), M.bodyMetal, [s * 0.02, 0.04, 0], [0, 0, s * -0.32], [1.14, 0.80, 1.18]);

    const pauldronT2 = sculpt(arm, new THREE.SphereGeometry(0.215, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.44), M.accentMetal, [s * 0.025, 0.075, 0], [0, 0, s * -0.36], [1.16, 0.76, 1.20]);
    tier2Parts.push(pauldronT2);

    sculpt(arm, new THREE.SphereGeometry(0.155, 18, 18), M.bodyMetal, [0, -0.01, 0]);
    sculpt(arm, new THREE.CapsuleGeometry(0.108, 0.28, 12, 16), M.bodyMetal, [s * 0.024, -0.18, 0], [0, 0, s * 0.07]);

    const elbow = group(arm, s * 0.045, -0.36, 0);
    sculpt(elbow, new THREE.SphereGeometry(0.095, 14, 14), M.darkJoint, [0, 0, 0]);
    sculpt(elbow, new THREE.CylinderGeometry(0.102, 0.076, 0.33, 18), M.bodyMetal, [0, -0.16, 0]);
    sculpt(elbow, new THREE.TorusGeometry(0.096, 0.016, 8, 22), M.accentMetal, [0, -0.08, 0], [Math.PI / 2, 0, 0]);
    sculpt(elbow, new THREE.TorusGeometry(0.080, 0.016, 8, 22), M.accentMetal, [0, -0.27, 0], [Math.PI / 2, 0, 0]);

    const hand = group(elbow, 0, -0.34, 0);
    sculpt(hand, new THREE.BoxGeometry(0.095, 0.105, 0.065), M.accentMetal, [0, -0.02, 0]);

    return { arm, elbow, hand };
  }

  const rightArm = createColossusArm(true);
  const leftArm = createColossusArm(false);

  // MONTANTE COLOSSAL
  const greatsword = group(rightArm.hand, 0, -0.04, 0.03);
  greatsword.rotation.set(Math.PI / 2, 0, 0);

  sculpt(greatsword, new THREE.SphereGeometry(0.048, 12, 12), M.accentMetal, [0, -0.32, 0]);
  sculpt(greatsword, new THREE.CylinderGeometry(0.026, 0.030, 0.38, 12), M.darkJoint, [0, -0.12, 0]);
  sculpt(greatsword, new THREE.BoxGeometry(0.42, 0.065, 0.085), M.accentMetal, [0, 0.08, 0]);
  for (const side of [-1, 1]) {
    sculpt(greatsword, new THREE.ConeGeometry(0.045, 0.12, 6), M.accentMetal, [side * 0.22, 0.08, 0], [0, 0, side * -Math.PI / 2]);
  }

  const bladeLen = 1.95;
  const bladeGroup = group(greatsword, 0, 0.11, 0);
  sculpt(bladeGroup, new THREE.BoxGeometry(0.16, bladeLen * 0.78, 0.028), M.bladeMetal, [0, bladeLen * 0.39, 0]);

  const fullerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.4,
    roughness: 0.1
  });
  sculpt(bladeGroup, new THREE.BoxGeometry(0.035, bladeLen * 0.72, 0.034), fullerMat, [0, bladeLen * 0.38, 0]);
  sculpt(bladeGroup, new THREE.ConeGeometry(0.114, bladeLen * 0.24, 4), M.bladeMetal, [0, bladeLen * 0.89, 0], [0, Math.PI / 4, 0], [1.0, 1.0, 0.25]);

  const slashTrail = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 2.35, 32, 1, -0.4, 1.5),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  slashTrail.rotation.y = Math.PI / 2;
  slashTrail.position.set(0, 1.05, 0.35);
  greatsword.add(slashTrail);

  const swordTipAnchor = group(bladeGroup, 0, bladeLen, 0);

  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.15, 48),
    new THREE.MeshBasicMaterial({
      color: spec0.auraHex,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.025;
  root.add(auraRing);

  let currentTier = initialTier;

  function setTier(tier: number) {
    currentTier = Math.max(1, Math.min(3, tier));
    const next = COLOSSUS_TIERS[currentTier] || COLOSSUS_TIERS[1];
    M.bodyMetal.color.setHex(next.metalHex);
    M.bodyMetal.metalness = next.metalness;
    M.bodyMetal.roughness = next.roughness;

    M.accentMetal.color.setHex(next.accentHex);
    M.bladeMetal.color.setHex(next.bladeHex);
    M.crestMat.color.setHex(next.crestHex);

    fullerMat.emissive.setHex(next.eyeHex);
    fullerMat.emissiveIntensity = currentTier === 3 ? 2.2 : currentTier === 2 ? 1.1 : 0.3;
    auraRing.material.color.setHex(next.auraHex);
    slashTrail.material.color.setHex(next.eyeHex);

    tier2Parts.forEach((p) => {
      p.visible = currentTier >= 2;
    });
    tier3Parts.forEach((p) => {
      p.visible = currentTier >= 3;
    });
  }

  setTier(initialTier);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    greatsword,
    slashTrail,
    swordTipAnchor,
    auraRing,
    crestSegments,
    royalCape,
    capeBase,
    colossusScale,
    setTier,
    getTier: () => currentTier
  };
}

export interface ColossusBuildOptions {
  teamId?: TeamId;
  tier?: number;
  scale?: number;
}

export function buildZeusColossus(options: ColossusBuildOptions = {}): ColossusBuildResult {
  const tex = getCachedColossusTextures();
  const res = buildColossus(tex.metalBump, options.tier || 1, options.teamId || 'player');
  if (options.scale && options.scale !== 1.0) {
    res.root.scale.setScalar(options.scale);
  }
  return res;
}

export function animateColossusModel(
  colossus: ColossusBuildResult,
  elapsed: number,
  _dt: number,
  action: 'vigilia' | 'marcha' | 'ataque' | 'devorar' | 'slam' | 'eat_tree' = 'vigilia',
  attackProgress = 0,
  strideProgress = 0
): void {
  const normalizedAction = action === 'slam' ? 'ataque' : action === 'eat_tree' ? 'devorar' : action;
  const heavyBreath = Math.sin(elapsed * 1.8) * 0.025;
  colossus.body.position.y = 1.06 * colossus.colossusScale + heavyBreath;

  if (normalizedAction === 'marcha') {
    const sinS = Math.sin(strideProgress);
    const cosS = Math.cos(strideProgress);

    colossus.legs.L.hip.rotation.x = -0.15 + sinS * 0.42;
    colossus.legs.L.knee.rotation.x = 0.22 + Math.max(0, -cosS) * 0.42;
    colossus.legs.R.hip.rotation.x = -0.15 - sinS * 0.42;
    colossus.legs.R.knee.rotation.x = 0.22 + Math.max(0, cosS) * 0.42;

    colossus.rightArm.arm.rotation.set(-0.45 - sinS * 0.22, 0.15, 0.32);
    colossus.rightArm.elbow.rotation.set(-0.48, 0.1, 0.1);
    colossus.leftArm.arm.rotation.set(-0.25 + sinS * 0.28, -0.15, -0.28);
    colossus.leftArm.elbow.rotation.set(-0.35, -0.1, -0.1);
  } else if (normalizedAction === 'ataque') {
    if (attackProgress < 0.38) {
      const p = attackProgress / 0.38;
      const ease = p * p;
      colossus.rightArm.arm.rotation.set(-2.35 * ease - 0.35 * (1 - ease), 0.18, 0.35);
      colossus.rightArm.elbow.rotation.set(-0.85 * ease - 0.45 * (1 - ease), 0, 0);
      colossus.leftArm.arm.rotation.set(-1.65 * ease, -0.45 * ease, -0.25);
      colossus.leftArm.elbow.rotation.set(-0.65 * ease, 0, 0);
    } else if (attackProgress < 0.65) {
      const p = (attackProgress - 0.38) / 0.27;
      const slam = Math.sin(p * Math.PI * 0.5);
      colossus.rightArm.arm.rotation.set(-2.35 + 1.85 * slam, 0.12, 0.22);
      colossus.rightArm.elbow.rotation.set(-0.85 + 0.65 * slam, 0, 0);
      colossus.leftArm.arm.rotation.set(-1.65 + 1.25 * slam, -0.25, -0.35);
      colossus.leftArm.elbow.rotation.set(-0.65 + 0.35 * slam, 0, 0);
      (colossus.slashTrail.material as THREE.Material).opacity = Math.sin(p * Math.PI) * 0.85;
    } else {
      const k = (attackProgress - 0.65) / 0.35;
      const rem = 1 - k;
      colossus.rightArm.arm.rotation.set(-0.50 * rem - 0.35 * k, 0.15, 0.28);
      colossus.rightArm.elbow.rotation.set(-0.20 * rem - 0.45 * k, 0, 0);
      colossus.leftArm.arm.rotation.set(-0.40 * rem - 0.22 * k, -0.15, -0.28);
      colossus.leftArm.elbow.rotation.set(-0.30, 0, 0);
      (colossus.slashTrail.material as THREE.Material).opacity = 0;
    }
  } else if (normalizedAction === 'devorar') {
    const chew = Math.sin(elapsed * 4.5);
    colossus.leftArm.arm.rotation.set(-1.25 + chew * 0.12, -0.22, -0.18);
    colossus.leftArm.elbow.rotation.set(-0.35 - chew * 0.25, 0, 0);
    colossus.rightArm.arm.rotation.set(-0.32, 0.18, 0.32);
    colossus.rightArm.elbow.rotation.set(-0.48, 0, 0);
  } else {
    // Vigília
    colossus.rightArm.arm.rotation.set(-0.35, 0.15, 0.28 + Math.sin(elapsed * 1.4) * 0.02);
    colossus.rightArm.elbow.rotation.set(-0.45, 0.08, 0.08);
    colossus.leftArm.arm.rotation.set(-0.22, -0.14, -0.28 - Math.cos(elapsed * 1.4) * 0.02);
    colossus.leftArm.elbow.rotation.set(-0.32, -0.08, -0.08);

    colossus.legs.L.hip.rotation.set(-0.18, -0.12, -0.08);
    colossus.legs.L.knee.rotation.set(0.24, 0, 0);
    colossus.legs.R.hip.rotation.set(0.15, 0.14, 0.10);
    colossus.legs.R.knee.rotation.set(0.20, 0, 0);
  }

  // Animação de crista e capa
  const wind = action === 'marcha' || action === 'ataque' ? 2.0 : 1.0;
  for (const cs of colossus.crestSegments) {
    cs.mesh.position.x = Math.sin(elapsed * 3.0 * wind - cs.phase) * 0.015 * cs.factor;
  }
  if (colossus.royalCape.parent?.visible) {
    const cAttr = colossus.royalCape.geometry.attributes.position;
    for (let i = 0; i < cAttr.count; i++) {
      const bx = colossus.capeBase[i * 3];
      const by = colossus.capeBase[i * 3 + 1];
      const bz = colossus.capeBase[i * 3 + 2];
      const normY = Math.max(0, Math.min(1, (0.925 - by) / 1.85));
      const wave = Math.sin(elapsed * 2.8 * wind - normY * 4.2 + bx * 2.2) * 0.11 * normY;
      cAttr.setXYZ(i, bx, by, bz + wave);
    }
    cAttr.needsUpdate = true;
    colossus.royalCape.geometry.computeVertexNormals();
  }
}
