import * as THREE from 'three';
import { TeamId } from '../../game/types';

/* ==========================================================================
   1. TEXTURAS PROCEDURAIS PBR (PELAGEM LEONINA, MEMBRANA DE ASA & ARENA)
   ========================================================================== */
export interface ManticoreTextures {
  furTex: THREE.CanvasTexture;
  wingTex: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
}

let cachedManticoreTextures: ManticoreTextures | null = null;

export function createManticoreTextures(): ManticoreTextures {
  if (cachedManticoreTextures) return cachedManticoreTextures;

  // 1. Pelagem escura texturizada de leão-escorpião
  const furCanvas = document.createElement('canvas');
  furCanvas.width = furCanvas.height = 512;
  const ctx = furCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#332924';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 6000; i++) {
      const shade = 35 + Math.floor(Math.random() * 42);
      ctx.fillStyle = `rgba(${shade + 12}, ${shade + 4}, ${shade}, 0.55)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 12);
    }
  }
  const furTex = new THREE.CanvasTexture(furCanvas);
  furTex.wrapS = furTex.wrapT = THREE.RepeatWrapping;
  furTex.repeat.set(2, 2);
  furTex.colorSpace = THREE.SRGBColorSpace;

  // 2. Membrana das asas de morcego em degradê escuro-carmesim
  const wingCanvas = document.createElement('canvas');
  wingCanvas.width = 256;
  wingCanvas.height = 256;
  const wCtx = wingCanvas.getContext('2d');
  if (wCtx) {
    const wGrad = wCtx.createLinearGradient(0, 0, 0, 256);
    wGrad.addColorStop(0, '#1c1917');
    wGrad.addColorStop(0.45, '#7f1d1d');
    wGrad.addColorStop(0.85, '#b91c1c');
    wGrad.addColorStop(1, '#450a0a');
    wCtx.fillStyle = wGrad;
    wCtx.fillRect(0, 0, 256, 256);

    // Veias da membrana
    wCtx.strokeStyle = 'rgba(24, 15, 12, 0.45)';
    wCtx.lineWidth = 2;
    for (let x = 24; x < 256; x += 36) {
      wCtx.beginPath();
      wCtx.moveTo(x, 0);
      wCtx.quadraticCurveTo(x + 14, 128, x - 8, 256);
      wCtx.stroke();
    }
  }
  const wingTex = new THREE.CanvasTexture(wingCanvas);
  wingTex.colorSpace = THREE.SRGBColorSpace;

  // 3. Arena de Deserto / Campo Grego
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#c89d5c';
    fCtx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 6500; i++) {
      fCtx.fillStyle = i % 2 === 0 ? 'rgba(255, 240, 200, 0.14)' : 'rgba(110, 72, 28, 0.16)';
      fCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 10, 8);
    }

    const cx = 512;
    const cy = 512;
    fCtx.strokeStyle = '#1d4ed8';
    fCtx.lineWidth = 14;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 420, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#facc15';
    fCtx.lineWidth = 6;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 438, 0, Math.PI * 2);
    fCtx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.colorSpace = THREE.SRGBColorSpace;

  cachedManticoreTextures = { furTex, wingTex, floorTex };
  return cachedManticoreTextures;
}

/* ==========================================================================
   2. INTERFACES E TIPAGENS DO MODELO
   ========================================================================== */
export interface ManticoreTailSegNode {
  pivot: THREE.Group;
  baseRx: number;
  phase: number;
}

export interface ManticoreWingNode {
  pivot: THREE.Group;
  outer: THREE.Group;
  baseRz: number;
}

export interface ManticoreLegNode {
  hip: THREE.Group;
  knee: THREE.Group;
  phase: number;
}

export interface ManticoreBuildResult {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  neckHeadGroup: THREE.Group;
  jaw: THREE.Group;
  wings: { L: ManticoreWingNode; R: ManticoreWingNode };
  legs: ManticoreLegNode[];
  tailSegments: ManticoreTailSegNode[];
  tailClub: THREE.Group;
  tailQuills: THREE.Mesh[];
  tailTipAnchor: THREE.Group;
}

export interface ManticoreBuildOptions {
  teamId?: TeamId | 'gaia' | 'red';
  textures?: ManticoreTextures;
  scale?: number;
}

/* ==========================================================================
   3. HELPERS DE ESCULTURA E CONSTRUÇÃO DA MANTÍCORA DE ZEUS
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

export function buildZeusManticore(options: ManticoreBuildOptions = {}): ManticoreBuildResult {
  const textures = options.textures || createManticoreTextures();

  let teamBlueHex = 0x1d4ed8;
  let teamEmissiveHex = 0x1e3a8a;
  if (options.teamId === 'gaia') {
    teamBlueHex = 0x15803d;
    teamEmissiveHex = 0x166534;
  } else if (options.teamId === 'enemy' || options.teamId === 'red') {
    teamBlueHex = 0xb91c1c;
    teamEmissiveHex = 0x991b1b;
  }

  const M = {
    furBody: new THREE.MeshStandardMaterial({
      map: textures.furTex,
      color: 0x44362f,
      roughness: 0.72,
      metalness: 0.06
    }),
    mane: new THREE.MeshStandardMaterial({
      color: 0x3b1812,
      roughness: 0.85
    }),
    faceSkin: new THREE.MeshStandardMaterial({
      color: 0x6e5a4f,
      roughness: 0.56
    }),
    zeusBlue: new THREE.MeshStandardMaterial({
      color: teamBlueHex,
      emissive: teamEmissiveHex,
      emissiveIntensity: 0.28,
      roughness: 0.36,
      metalness: 0.3
    }),
    wingMembrane: new THREE.MeshStandardMaterial({
      map: textures.wingTex,
      roughness: 0.52,
      metalness: 0.12,
      side: THREE.DoubleSide
    }),
    wingBone: new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.45,
      metalness: 0.35
    }),
    quillMat: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.55
    }),
    hornTooth: new THREE.MeshStandardMaterial({
      color: 0xe7e5e4,
      roughness: 0.32
    }),
    eyeGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfacc15,
      emissiveIntensity: 1.65,
      roughness: 0.05
    })
  };

  const root = new THREE.Group();
  root.name = 'ZeusManticoreRoot';

  if (options.scale && options.scale !== 1.0) {
    root.scale.setScalar(options.scale);
  }

  const body = group(root, 0, 0.84, -0.25);

  // 1. CORPO LEONINO MUSCULOSO & PLACAS DORSAIS AZUL-COBALTO DE ZEUS
  const torso = group(body, 0, 0, 0);

  sculpt(torso, new THREE.SphereGeometry(0.42, 20, 18), M.furBody, [0, 0.08, 0.32], [0, 0, 0], [0.96, 1.02, 1.15]);
  sculpt(torso, new THREE.CapsuleGeometry(0.32, 0.72, 12, 18), M.furBody, [0, 0.02, -0.15], [Math.PI / 2, 0, 0], [0.92, 1.0, 0.88]);

  // Escamas/Placas dorsais azul-cobalto de Zeus alinhadas ao longo da coluna
  for (let r = 0; r < 5; r++) {
    const rz = 0.05 - r * 0.17;
    for (const sx of [-0.11, 0.11]) {
      sculpt(
        torso,
        new THREE.BoxGeometry(0.16, 0.06, 0.14),
        M.zeusBlue,
        [sx, 0.36 - r * 0.015, rz],
        [0.15, 0, sx * -1.4]
      );
    }
  }

  // 2. JUBA ESPESSA, ROSTO FEROZ HUMANOIDE-LEONINO & CHIFRES CURVOS
  const neckHeadGroup = group(torso, 0, 0.16, 0.58);

  sculpt(neckHeadGroup, new THREE.SphereGeometry(0.34, 20, 18), M.mane, [0, 0.03, 0.02], [0, 0, 0], [0.86, 0.96, 0.95]);
  for (let m = 0; m < 12; m++) {
    const a = (m / 12) * Math.PI * 2;
    sculpt(
      neckHeadGroup,
      new THREE.ConeGeometry(0.11, 0.32, 6),
      M.mane,
      [Math.cos(a) * 0.25, Math.sin(a) * 0.27 + 0.03, -0.06],
      [-0.8, 0, -a + Math.PI / 2]
    );
  }

  const head = group(neckHeadGroup, 0, 0.02, 0.25);
  sculpt(head, new THREE.BoxGeometry(0.24, 0.25, 0.27), M.faceSkin, [0, 0, 0]);
  sculpt(head, new THREE.BoxGeometry(0.26, 0.06, 0.13), M.furBody, [0, 0.08, 0.11]);
  sculpt(head, new THREE.BoxGeometry(0.17, 0.1, 0.15), M.faceSkin, [0, -0.03, 0.15]);

  for (const sx of [-1, 1]) {
    sculpt(head, new THREE.SphereGeometry(0.022, 10, 10), M.eyeGlow, [sx * 0.072, 0.035, 0.14]);
    sculpt(head, new THREE.ConeGeometry(0.015, 0.065, 5), M.hornTooth, [sx * 0.052, -0.08, 0.19], [Math.PI, 0, 0]);
    sculpt(head, new THREE.ConeGeometry(0.014, 0.055, 5), M.hornTooth, [sx * 0.045, -0.095, 0.18]);
  }

  const jaw = group(head, 0, -0.095, 0.04);
  sculpt(jaw, new THREE.BoxGeometry(0.15, 0.06, 0.2), M.faceSkin, [0, -0.02, 0.08]);

  for (const sx of [-1, 1]) {
    const hornCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.09, 0.12, 0.07),
      new THREE.Vector3(sx * 0.17, 0.23, 0.15),
      new THREE.Vector3(sx * 0.19, 0.32, 0.24)
    ]);
    sculpt(head, new THREE.TubeGeometry(hornCurve, 12, 0.022, 8, false), M.hornTooth);
  }

  // 3. ASAS DE MORCEGO MEMBRANOSAS ARTICULADAS
  const buildWing = (side: 'L' | 'R'): ManticoreWingNode => {
    const s = side === 'R' ? 1 : -1;
    const wingPivot = group(torso, s * 0.28, 0.34, 0.24);

    sculpt(wingPivot, new THREE.CylinderGeometry(0.036, 0.028, 0.72, 8), M.wingBone, [s * 0.32, 0.24, -0.04], [0, 0, s * -0.95]);
    sculpt(wingPivot, new THREE.ConeGeometry(0.03, 0.18, 5), M.hornTooth, [s * 0.64, 0.46, 0.02], [0.3, 0, s * -0.4]);

    const outerWing = group(wingPivot, s * 0.62, 0.42, -0.04);
    sculpt(outerWing, new THREE.CylinderGeometry(0.024, 0.014, 0.95, 8), M.wingBone, [s * 0.44, -0.06, -0.06], [0, 0, s * -1.68]);
    sculpt(outerWing, new THREE.CylinderGeometry(0.02, 0.012, 0.85, 8), M.wingBone, [s * 0.34, -0.26, -0.18], [0.2, 0, s * -2.15]);

    const memShape = new THREE.Shape();
    memShape.moveTo(0, 0);
    memShape.lineTo(s * 0.62, 0.42);
    memShape.lineTo(s * 1.48, 0.3);
    memShape.quadraticCurveTo(s * 1.15, -0.05, s * 1.25, -0.42);
    memShape.quadraticCurveTo(s * 0.82, -0.25, s * 0.55, -0.48);
    memShape.quadraticCurveTo(s * 0.28, -0.22, 0, -0.28);
    memShape.closePath();

    const memGeo = new THREE.ShapeGeometry(memShape);
    const memMesh = new THREE.Mesh(memGeo, M.wingMembrane);
    memMesh.position.set(0, 0, -0.04);
    memMesh.castShadow = true;
    wingPivot.add(memMesh);

    return { pivot: wingPivot, outer: outerWing, baseRz: s * 0.22 };
  };

  const wings: { L: ManticoreWingNode; R: ManticoreWingNode } = {
    L: buildWing('L'),
    R: buildWing('R'),
  };

  // 4. QUATRO PATAS LEONINAS MUSCULOSAS COM GARRAS
  const legs: ManticoreLegNode[] = [];
  const legSpecs = [
    { x: -0.32, z: 0.46, phase: 0 },
    { x: 0.32, z: 0.46, phase: Math.PI },
    { x: -0.34, z: -0.46, phase: Math.PI },
    { x: 0.34, z: -0.46, phase: 0 }
  ];

  legSpecs.forEach((ls) => {
    const hip = group(torso, ls.x, -0.04, ls.z);
    sculpt(hip, new THREE.SphereGeometry(0.19, 14, 14), M.furBody, [0, 0, 0], [0, 0, 0], [0.95, 1.18, 1.05]);
    sculpt(hip, new THREE.CylinderGeometry(0.14, 0.1, 0.42, 12), M.furBody, [0, -0.2, -0.04], [-0.2, 0, 0]);

    const knee = group(hip, 0, -0.38, -0.08);
    sculpt(knee, new THREE.CylinderGeometry(0.1, 0.085, 0.4, 12), M.furBody, [0, -0.2, 0.05], [0.15, 0, 0]);

    const paw = group(knee, 0, -0.4, 0.08);
    sculpt(paw, new THREE.SphereGeometry(0.12, 12, 10), M.furBody, [0, -0.01, 0.04], [0, 0, 0], [1.0, 0.65, 1.25]);
    for (let c = -1; c <= 1; c++) {
      sculpt(paw, new THREE.ConeGeometry(0.018, 0.08, 5), M.hornTooth, [c * 0.045, -0.02, 0.16], [Math.PI / 2, 0, 0]);
    }
    legs.push({ hip, knee, phase: ls.phase });
  });

  // 5. CAUDA DE ESCORPIÃO ARTICULADA CRAVEJADA DE ESPINHOS
  const tailSegments: ManticoreTailSegNode[] = [];
  let parentTail: THREE.Object3D = torso;
  let attachY = 0.14;
  let attachZ = -0.58;

  const segCount = 6;
  for (let t = 0; t < segCount; t++) {
    const rBot = 0.17 * Math.pow(0.84, t);
    const rTop = 0.17 * Math.pow(0.84, t + 1);
    const segLen = 0.35;
    const segPivot = group(parentTail, 0, attachY, attachZ);

    const baseRx = 0.46 + t * 0.07;
    segPivot.rotation.x = baseRx;

    sculpt(segPivot, new THREE.CylinderGeometry(rTop, rBot, segLen, 12), M.furBody, [0, 0, -segLen * 0.5], [Math.PI / 2, 0, 0]);
    sculpt(segPivot, new THREE.TorusGeometry(rBot * 0.96, 0.022, 8, 16), M.zeusBlue, [0, 0, -0.04]);

    if (t >= 2) {
      for (const sx of [-1, 1]) {
        sculpt(segPivot, new THREE.ConeGeometry(0.022, 0.16, 5), M.quillMat, [sx * rTop, 0.04, -segLen * 0.5], [0, 0, sx * -0.85]);
      }
    }

    tailSegments.push({ pivot: segPivot, baseRx, phase: t * 0.5 });
    parentTail = segPivot;
    attachY = 0;
    attachZ = -segLen + 0.02;
  }

  // Bulbo Terminal da Cauda + Leque de 11 Espinhos
  const tailClub = group(parentTail, 0, 0, attachZ);
  sculpt(tailClub, new THREE.SphereGeometry(0.14, 14, 14), M.mane, [0, 0, -0.06], [0, 0, 0], [1.1, 0.95, 1.25]);

  const tailQuills: THREE.Mesh[] = [];
  for (let q = 0; q < 11; q++) {
    const spreadA = ((q - 5) / 5) * 0.65;
    const pitchA = ((q % 3) - 1) * 0.22;
    const quill = sculpt(
      tailClub,
      new THREE.ConeGeometry(0.022, 0.44, 5),
      M.quillMat,
      [Math.sin(spreadA) * 0.08, Math.sin(pitchA) * 0.06, -0.22],
      [-Math.PI / 2 + pitchA, spreadA, 0]
    );
    tailQuills.push(quill);
  }

  const tailTipAnchor = group(tailClub, 0, 0, -0.35);

  return {
    root,
    body,
    torso,
    neckHeadGroup,
    jaw,
    wings,
    legs,
    tailSegments,
    tailClub,
    tailQuills,
    tailTipAnchor
  };
}

/* ==========================================================================
   4. LOOP DE ANIMAÇÃO DA MANTÍCORA (CHICOTADA DA CAUDA, ASAS & RUGIDO)
   ========================================================================== */
export function animateManticoreModel(
  manticore: ManticoreBuildResult,
  elapsed: number,
  _dt: number,
  tailWhipForward = 0,
  wingFlap = 0,
  jawOpen = 0,
  isWalking = false
): void {
  // 1. Elevação e respiração felina
  manticore.body.position.y = 0.84 + Math.sin(elapsed * 2.4) * 0.025 + Math.max(0, tailWhipForward) * 0.06;
  manticore.torso.rotation.x = -Math.max(0, tailWhipForward) * 0.14;
  manticore.jaw.rotation.x = jawOpen;

  // 2. Asas de morcego
  manticore.wings.L.pivot.rotation.z = -manticore.wings.L.baseRz - wingFlap;
  manticore.wings.R.pivot.rotation.z = manticore.wings.R.baseRz + wingFlap;

  // 3. Cauda de escorpião com chicotada em arco sobre as costas
  manticore.tailSegments.forEach((ts) => {
    const idleWave = Math.sin(elapsed * 3.0 - ts.phase) * 0.05;
    ts.pivot.rotation.x = ts.baseRx + idleWave + tailWhipForward * 0.14;
    ts.pivot.rotation.y = Math.cos(elapsed * 2.4 - ts.phase) * 0.05;
  });

  // 4. Patas
  if (isWalking) {
    manticore.legs.forEach((leg) => {
      leg.hip.rotation.x = Math.sin(elapsed * 5.0 + leg.phase) * 0.38;
      leg.knee.rotation.x = Math.max(0, Math.cos(elapsed * 5.0 + leg.phase)) * 0.32;
    });
  } else {
    manticore.legs.forEach((leg) => {
      leg.hip.rotation.x = Math.sin(elapsed * 1.6 + leg.phase) * 0.04;
      leg.knee.rotation.x = 0;
    });
  }
}
