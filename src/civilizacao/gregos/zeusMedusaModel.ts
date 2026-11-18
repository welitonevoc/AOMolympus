import * as THREE from 'three';
import { TeamId } from '../../game/types';

/* ==========================================================================
   1. TEXTURAS PROCEDURAIS PBR (ESCAMAS DE SERPENTE DOURADAS & VENTRE LISTRADO)
   ========================================================================== */
export interface MedusaTextures {
  tailTex: THREE.CanvasTexture;
  stoneTex: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
}

let cachedMedusaTextures: MedusaTextures | null = null;

export function createMedusaTextures(): MedusaTextures {
  if (cachedMedusaTextures) return cachedMedusaTextures;

  // Textura da cauda de serpente inspirada no AoM Retold
  const tailCanvas = document.createElement('canvas');
  tailCanvas.width = 512;
  tailCanvas.height = 512;
  const ctx = tailCanvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#6b6826';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 22;
    const cols = 16;
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
          2,
          x + cW * 0.5,
          y + rH * 0.5,
          cW * 0.65
        );
        grad.addColorStop(0, '#eab308');
        grad.addColorStop(0.65, '#716e24');
        grad.addColorStop(1, '#262b12');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x + cW * 0.5, y + rH * 0.5, cW * 0.48, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const bellyX = 186;
    const bellyW = 140;
    ctx.fillStyle = '#d6d3c9';
    ctx.fillRect(bellyX, 0, bellyW, 512);
    for (let y = 0; y < 512; y += 18) {
      ctx.fillStyle = 'rgba(68, 64, 60, 0.45)';
      ctx.fillRect(bellyX, y, bellyW, 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(bellyX + 4, y + 4, bellyW - 8, 5);
    }
  }

  const tailTex = new THREE.CanvasTexture(tailCanvas);
  tailTex.wrapS = tailTex.wrapT = THREE.RepeatWrapping;
  tailTex.colorSpace = THREE.SRGBColorSpace;

  // Textura de pedra granulada para petrificação do inimigo
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = stoneCanvas.height = 256;
  const sCtx = stoneCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#78716c';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3200; i++) {
      const v = 95 + Math.floor(Math.random() * 55);
      sCtx.fillStyle = `rgb(${v}, ${v - 2}, ${v - 5})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
    }
  }
  const stoneTex = new THREE.CanvasTexture(stoneCanvas);
  stoneTex.colorSpace = THREE.SRGBColorSpace;

  // Piso de mármore olímpico com emblema de Zeus
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#1e293b';
    fCtx.fillRect(0, 0, 1024, 1024);

    fCtx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
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

    const cx = 512, cy = 512;
    fCtx.strokeStyle = '#eab308';
    fCtx.lineWidth = 14;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 420, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#10b981';
    fCtx.lineWidth = 6;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 438, 0, Math.PI * 2);
    fCtx.stroke();
  }

  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.colorSpace = THREE.SRGBColorSpace;

  cachedMedusaTextures = { tailTex, stoneTex, floorTex };
  return cachedMedusaTextures;
}

/* ==========================================================================
   2. HELPERS DE ESCULTURA E CONSTRUÇÃO DA MEDUSA DE ZEUS
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

export interface MedusaArmHandle {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

export interface SnakeHairHandle {
  pivot: THREE.Group;
  phase: number;
  baseRx: number;
  baseRz: number;
}

export interface MedusaBuildResult {
  root: THREE.Group;
  tailMesh: THREE.Mesh;
  tailBase: Float32Array;
  torso: THREE.Group;
  head: THREE.Group;
  snakes: SnakeHairHandle[];
  rightArm: MedusaArmHandle;
  leftArm: MedusaArmHandle;
  bowGroup: THREE.Group;
  bowString: THREE.Mesh;
  nockedArrow: THREE.Group;
  nockedFlame: THREE.Mesh;
  bowTipAnchor: THREE.Group;
  eyesAnchor: THREE.Group;
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
}

export function buildMedusa(
  textures: MedusaTextures = createMedusaTextures(),
  team: TeamId = 'player',
  _enableShadows = true
): MedusaBuildResult {
  const teamColor = team === 'player' ? 0x1d4ed8 : 0xb91c1c;

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: 0x8f9e42, // Pele esverdeada/oliva clássica da Medusa do AoM Retold
      roughness: 0.42,
      metalness: 0.08
    }),
    tail: new THREE.MeshStandardMaterial({
      map: textures.tailTex,
      roughness: 0.36,
      metalness: 0.32
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x451a03,
      emissiveIntensity: 0.25,
      metalness: 0.92,
      roughness: 0.18
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: 0x92400e,
      metalness: 0.85,
      roughness: 0.28
    }),
    leather: new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.68
    }),
    zeusBlue: new THREE.MeshStandardMaterial({
      color: teamColor,
      emissive: team === 'player' ? 0x1e3a8a : 0x7f1d1d,
      emissiveIntensity: 0.3,
      roughness: 0.4
    }),
    snakeBody: new THREE.MeshStandardMaterial({
      color: 0x857f26,
      roughness: 0.38,
      metalness: 0.35
    }),
    gazeGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x10b981,
      emissiveIntensity: 4.5,
      roughness: 0.05
    }),
    fireGlow: new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    })
  };

  const root = new THREE.Group();

  // ========================================================================
  // 1. CAUDA LONGA E SINUOSA DE SERPENTE (GÓRGONA DO AOM RETOLD)
  // ========================================================================
  const tailGroup = group(root, 0, 0, 0);

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 1.32, 0.05),
    new THREE.Vector3(0.04, 0.85, -0.10),
    new THREE.Vector3(-0.08, 0.35, -0.45),
    new THREE.Vector3(0.12, 0.16, -1.05),
    new THREE.Vector3(-0.10, 0.11, -1.68),
    new THREE.Vector3(0.04, 0.06, -2.25)
  ]);

  const tailSegs = 48;
  const radialSegs = 20;
  const tubeGeo = new THREE.TubeGeometry(tailCurve, tailSegs, 0.25, radialSegs, false);
  const posAttr = tubeGeo.attributes.position;
  const tailBase = new Float32Array(posAttr.array.length);

  for (let i = 0; i <= tailSegs; i++) {
    const t = i / tailSegs;
    const center = tailCurve.getPointAt(t);
    const radiusFactor = Math.max(0.06, (1 - t * 0.90) * (1 + Math.sin(t * Math.PI) * 0.12));

    for (let j = 0; j <= radialSegs; j++) {
      const idx = i * (radialSegs + 1) + j;
      const vx = posAttr.getX(idx) - center.x;
      const vy = posAttr.getY(idx) - center.y;
      const vz = posAttr.getZ(idx) - center.z;

      const fx = center.x + vx * radiusFactor;
      const fy = Math.max(0.02, center.y + vy * radiusFactor);
      const fz = center.z + vz * radiusFactor;

      posAttr.setXYZ(idx, fx, fy, fz);
      tailBase[idx * 3] = fx;
      tailBase[idx * 3 + 1] = fy;
      tailBase[idx * 3 + 2] = fz;
    }
  }
  tubeGeo.computeVertexNormals();
  const tailMesh = sculpt(tailGroup, tubeGeo, M.tail);

  // ========================================================================
  // 2. TRONCO FEMININO ESGUIO, CORPETE DOURADO E ALJAVA NAS COSTAS
  // ========================================================================
  const torso = group(root, 0, 1.32, 0.05);

  const waistBelt = new THREE.TorusGeometry(0.22, 0.045, 10, 28);
  waistBelt.rotateX(Math.PI / 2);
  sculpt(torso, waistBelt, M.gold, [0, 0.02, 0], [0.06, 0, 0], [1.05, 1, 0.85]);
  sculpt(torso, new THREE.OctahedronGeometry(0.045, 0), M.zeusBlue, [0, 0.02, 0.21]);

  const torsoPts = [
    new THREE.Vector2(0.01, 0.0),
    new THREE.Vector2(0.19, 0.04),
    new THREE.Vector2(0.165, 0.22),
    new THREE.Vector2(0.23, 0.44),
    new THREE.Vector2(0.20, 0.58),
    new THREE.Vector2(0.09, 0.65),
    new THREE.Vector2(0.01, 0.66)
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 28), M.skin, [0, 0, 0], [0, 0, 0], [1.06, 1.0, 0.74]);

  sculpt(torso, new THREE.CylinderGeometry(0.225, 0.175, 0.26, 24), M.gold, [0, 0.36, 0.005], [0.04, 0, 0], [1.06, 1.0, 0.78]);
  sculpt(torso, new THREE.CylinderGeometry(0.230, 0.180, 0.06, 24), M.zeusBlue, [0, 0.24, 0.005], [0.04, 0, 0], [1.06, 1.0, 0.78]);

  const collar = new THREE.TorusGeometry(0.15, 0.016, 8, 24);
  collar.rotateX(Math.PI / 2);
  sculpt(torso, collar, M.gold, [0, 0.56, 0.01], [0.15, 0, 0]);

  const quiver = group(torso, -0.14, 0.36, -0.18);
  quiver.rotation.set(0.18, 0, -0.42);
  sculpt(quiver, new THREE.CylinderGeometry(0.075, 0.055, 0.62, 12), M.leather, [0, 0, 0]);
  sculpt(quiver, new THREE.CylinderGeometry(0.082, 0.082, 0.06, 12), M.gold, [0, 0.28, 0]);
  for (let a = 0; a < 5; a++) {
    const ang = (a / 5) * Math.PI * 2;
    sculpt(quiver, new THREE.CylinderGeometry(0.008, 0.008, 0.24, 6), M.gold, [Math.cos(ang) * 0.03, 0.36, Math.sin(ang) * 0.03]);
  }

  sculpt(torso, new THREE.CylinderGeometry(0.078, 0.095, 0.20, 16), M.skin, [0, 0.66, 0]);

  const head = group(torso, 0, 0.84, 0.02);
  sculpt(head, new THREE.SphereGeometry(0.162, 26, 26), M.skin, [0, 0, 0], [0, 0, 0], [0.90, 1.12, 0.96]);

  const eyeLeft = sculpt(head, new THREE.SphereGeometry(0.022, 12, 12), M.gazeGlow, [-0.048, 0.025, 0.148], [0, 0, 0], [1.18, 0.72, 0.75]);
  const eyeRight = sculpt(head, new THREE.SphereGeometry(0.022, 12, 12), M.gazeGlow, [0.048, 0.025, 0.148], [0, 0, 0], [1.18, 0.72, 0.75]);

  // ========================================================================
  // 3. COROA DE SERPENTES VIVAS E ANIMADAS NA CABEÇA (14 VÍBORAS 3D)
  // ========================================================================
  const snakes: SnakeHairHandle[] = [];
  const snakeCount = 14;
  for (let s = 0; s < snakeCount; s++) {
    const a = (s / snakeCount) * Math.PI * 2;
    const isOuter = s % 2 === 0;
    const baseR = isOuter ? 0.13 : 0.08;
    const sPivot = group(head, Math.cos(a) * baseR, 0.11, Math.sin(a) * baseR);
    sPivot.rotation.set(Math.sin(a) * 0.45, -a, -Math.cos(a) * 0.45);

    const sCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.06, 0.16, 0.04),
      new THREE.Vector3(-0.05, 0.32, -0.03),
      new THREE.Vector3(0.04, 0.46, 0.08)
    ]);
    sculpt(sPivot, new THREE.TubeGeometry(sCurve, 12, 0.019, 8, false), M.snakeBody);

    const sHead = group(sPivot, 0.04, 0.46, 0.08);
    sculpt(sHead, new THREE.ConeGeometry(0.028, 0.085, 6), M.gold, [0, 0.02, 0.03], [Math.PI / 2, 0, 0]);
    sculpt(sHead, new THREE.SphereGeometry(0.008, 6, 6), M.gazeGlow, [-0.014, 0.025, 0.02]);
    sculpt(sHead, new THREE.SphereGeometry(0.008, 6, 6), M.gazeGlow, [0.014, 0.025, 0.02]);

    snakes.push({ pivot: sPivot, phase: s * 0.65, baseRx: sPivot.rotation.x, baseRz: sPivot.rotation.z });
  }

  // ========================================================================
  // 4. BRAÇOS E ARCO RECURVO DOURADO COM FLECHAS FLAMEJANTES
  // ========================================================================
  function createMedusaArm(isRight: boolean): MedusaArmHandle {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.27, 0.48, 0);

    sculpt(arm, new THREE.SphereGeometry(0.095, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), M.gold, [s * 0.01, 0.02, 0], [0, 0, s * -0.3]);
    sculpt(arm, new THREE.CapsuleGeometry(0.052, 0.24, 10, 14), M.skin, [s * 0.015, -0.15, 0], [0, 0, s * 0.06]);

    const elbow = group(arm, s * 0.03, -0.30, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.048, 0.036, 0.26, 14), M.skin, [0, -0.13, 0]);
    sculpt(elbow, new THREE.CylinderGeometry(0.044, 0.040, 0.11, 14), M.gold, [0, -0.20, 0]);

    const hand = group(elbow, 0, -0.27, 0);
    sculpt(hand, new THREE.BoxGeometry(0.048, 0.058, 0.024), M.skin, [0, -0.015, 0]);

    return { arm, elbow, hand };
  }

  const rightArm = createMedusaArm(true);
  const leftArm = createMedusaArm(false);

  const bowGroup = group(leftArm.hand, 0, -0.02, 0.04);
  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.78, -0.16),
    new THREE.Vector3(0, -0.45, 0.14),
    new THREE.Vector3(0, 0.0, 0.22),
    new THREE.Vector3(0, 0.45, 0.14),
    new THREE.Vector3(0, 0.78, -0.16)
  ]);
  sculpt(bowGroup, new THREE.TubeGeometry(bowCurve, 24, 0.024, 8, false), M.gold);
  const bowString = sculpt(bowGroup, new THREE.CylinderGeometry(0.004, 0.004, 1.56, 6), M.gold, [0, 0, -0.16]);

  const nockedArrow = group(bowGroup, 0, 0, 0.18);
  sculpt(nockedArrow, new THREE.CylinderGeometry(0.010, 0.010, 0.92, 8), M.gold, [0, 0, 0.15], [Math.PI / 2, 0, 0]);
  const nockedFlame = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.22, 8), M.fireGlow);
  nockedFlame.rotation.x = Math.PI / 2;
  nockedFlame.position.set(0, 0, 0.62);
  nockedArrow.add(nockedFlame);

  const bowTipAnchor = group(bowGroup, 0, 0, 0.68);
  const eyesAnchor = group(head, 0, 0.025, 0.16);

  return {
    root,
    tailMesh,
    tailBase,
    torso,
    head,
    snakes,
    rightArm,
    leftArm,
    bowGroup,
    bowString,
    nockedArrow,
    nockedFlame,
    bowTipAnchor,
    eyesAnchor,
    eyeLeft,
    eyeRight
  };
}

export function animateMedusaModel(
  medusa: MedusaBuildResult,
  elapsed: number,
  mode: 'auto' | 'flechas' | 'vigilia' | 'gaze' = 'auto',
  gazeActive = false,
  bowShootProgress = 0
): void {
  // 1. Ondulação viva da cauda
  const tPos = medusa.tailMesh.geometry.attributes.position;
  for (let i = 0; i < tPos.count; i++) {
    const bx = medusa.tailBase[i * 3];
    const bz = medusa.tailBase[i * 3 + 2];
    const distBack = Math.max(0, -bz);
    const wave = Math.sin(elapsed * 3.2 - distBack * 2.6) * 0.085 * Math.min(1, distBack * 0.7);
    tPos.setX(i, bx + wave);
  }
  tPos.needsUpdate = true;

  // 2. Serpentes na cabeça
  medusa.snakes.forEach((sn) => {
    sn.pivot.rotation.x = sn.baseRx + Math.sin(elapsed * 4.5 + sn.phase) * 0.16;
    sn.pivot.rotation.z = sn.baseRz + Math.cos(elapsed * 4.2 + sn.phase) * 0.16;
  });

  // 3. Modos de ação
  if (gazeActive || mode === 'gaze') {
    medusa.torso.rotation.set(-0.12, 0, 0);
    medusa.head.rotation.set(0, 0, 0);
    medusa.leftArm.arm.rotation.set(-0.6, -0.5, -0.85);
    medusa.leftArm.elbow.rotation.set(-0.3, 0, 0);
    medusa.rightArm.arm.rotation.set(-0.6, 0.5, 0.85);
    medusa.rightArm.elbow.rotation.set(-0.3, 0, 0);
    medusa.nockedArrow.visible = false;
  } else if (mode === 'flechas' || mode === 'auto') {
    medusa.torso.rotation.set(0.05, -0.62, 0);
    medusa.head.rotation.set(0, 0.58, 0);

    medusa.leftArm.arm.rotation.set(-1.38, 0.58, -0.15);
    medusa.leftArm.elbow.rotation.set(-0.08, 0, 0);
    medusa.bowGroup.rotation.set(1.42, 0.12, -0.58);

    if (bowShootProgress < 0.65) {
      const draw = bowShootProgress / 0.65;
      medusa.rightArm.arm.rotation.set(-1.15, -0.35 + draw * 0.2, 0.45);
      medusa.rightArm.elbow.rotation.set(-1.15 - draw * 0.45, 0, 0);
      medusa.nockedArrow.visible = true;
      medusa.nockedArrow.position.z = 0.22 - draw * 0.28;
      medusa.nockedFlame.scale.setScalar(0.9 + Math.sin(elapsed * 22) * 0.25);
    } else {
      medusa.nockedArrow.visible = false;
      medusa.rightArm.arm.rotation.set(-1.15, -0.15, 0.52);
      medusa.rightArm.elbow.rotation.set(-1.45, 0, 0);
    }
  } else {
    // Vigília
    medusa.torso.rotation.set(0.02, Math.sin(elapsed * 0.6) * 0.14, 0);
    medusa.head.rotation.set(0, 0, 0);
    medusa.leftArm.arm.rotation.set(-0.45, -0.25, -0.35);
    medusa.leftArm.elbow.rotation.set(-0.65, 0, 0);
    medusa.bowGroup.rotation.set(1.05, 0.22, -0.25);
    medusa.rightArm.arm.rotation.set(-0.35, 0.25, 0.35);
    medusa.rightArm.elbow.rotation.set(-0.55, 0, 0);
    medusa.nockedArrow.visible = true;
    medusa.nockedArrow.position.z = 0.18;
  }
}
