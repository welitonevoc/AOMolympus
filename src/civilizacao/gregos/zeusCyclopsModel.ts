import * as THREE from 'three';
import { TeamId } from '../../game/types';

/* ==========================================================================
   1. TEXTURAS PROCEDURAIS PBR (PELE DO CICLOPE, PELOS CAPRINOS & ARMADURA ANCIÃ)
   ========================================================================== */
export interface CyclopsTextures {
  goatFurTex: THREE.CanvasTexture;
  scaleArmorTex: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
}

let cachedCyclopsTextures: CyclopsTextures | null = null;

export function createCyclopsTextures(): CyclopsTextures {
  if (cachedCyclopsTextures) return cachedCyclopsTextures;

  // 1. Pelagem caprina marrom escura para as pernas de sátiro/ciclope
  const furCanvas = document.createElement('canvas');
  furCanvas.width = furCanvas.height = 256;
  const fCtx = furCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#3b2416';
    fCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3500; i++) {
      const v = 35 + Math.floor(Math.random() * 38);
      fCtx.fillStyle = `rgb(${v + 24}, ${v + 10}, ${v})`;
      fCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 10);
    }
  }
  const goatFurTex = new THREE.CanvasTexture(furCanvas);
  goatFurTex.wrapS = goatFurTex.wrapT = THREE.RepeatWrapping;
  goatFurTex.colorSpace = THREE.SRGBColorSpace;

  // 2. Armadura escamada de prata e ouro (Melhoria Vontade de Cronos — Ares)
  const scaleCanvas = document.createElement('canvas');
  scaleCanvas.width = scaleCanvas.height = 512;
  const sCtx = scaleCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#94a3b8';
    sCtx.fillRect(0, 0, 512, 512);
    const rows = 18;
    const cols = 16;
    const rH = 512 / rows;
    const cW = 512 / cols;
    for (let r = 0; r < rows; r++) {
      const y = r * rH;
      const off = r % 2 === 0 ? 0 : cW * 0.5;
      for (let c = -1; c <= cols; c++) {
        const x = c * cW + off;
        const g = sCtx.createRadialGradient(x + cW * 0.5, y + rH * 0.35, 2, x + cW * 0.5, y + rH * 0.5, cW * 0.6);
        g.addColorStop(0, '#f8fafc');
        g.addColorStop(0.65, '#94a3b8');
        g.addColorStop(1, '#334155');
        sCtx.fillStyle = g;
        sCtx.beginPath();
        sCtx.arc(x + cW * 0.5, y + rH * 0.5, cW * 0.48, 0, Math.PI * 2);
        sCtx.fill();
      }
    }
  }
  const scaleArmorTex = new THREE.CanvasTexture(scaleCanvas);
  scaleArmorTex.wrapS = scaleArmorTex.wrapT = THREE.RepeatWrapping;
  scaleArmorTex.colorSpace = THREE.SRGBColorSpace;

  // 3. Arena mediterrânea de Zeus
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const aCtx = floorCanvas.getContext('2d');
  if (aCtx) {
    aCtx.fillStyle = '#5c822d';
    aCtx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 6500; i++) {
      aCtx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(20, 40, 10, 0.14)';
      aCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 10, 10);
    }

    const cx = 512;
    const cy = 512;
    const dirtGrad = aCtx.createRadialGradient(cx, cy, 180, cx, cy, 430);
    dirtGrad.addColorStop(0, '#c2a370');
    dirtGrad.addColorStop(0.75, '#b59462');
    dirtGrad.addColorStop(1, 'rgba(181, 148, 98, 0)');
    aCtx.fillStyle = dirtGrad;
    aCtx.fillRect(0, 0, 1024, 1024);

    aCtx.strokeStyle = '#1d4ed8';
    aCtx.lineWidth = 14;
    aCtx.beginPath();
    aCtx.arc(cx, cy, 425, 0, Math.PI * 2);
    aCtx.stroke();

    aCtx.strokeStyle = '#facc15';
    aCtx.lineWidth = 6;
    aCtx.beginPath();
    aCtx.arc(cx, cy, 442, 0, Math.PI * 2);
    aCtx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.colorSpace = THREE.SRGBColorSpace;

  cachedCyclopsTextures = { goatFurTex, scaleArmorTex, floorTex };
  return cachedCyclopsTextures;
}

/* ==========================================================================
   2. HELPERS DE ESCULTURA E TIPAGEM
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

export interface CyclopsArmRig {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

export interface CyclopsLegRig {
  hip: THREE.Group;
  knee: THREE.Group;
  ankle: THREE.Group;
}

export interface CyclopsBuildResult {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: { L: CyclopsLegRig; R: CyclopsLegRig };
  rightArm: CyclopsArmRig;
  leftArm: CyclopsArmRig;
  grabAnchor: THREE.Group;
  auraRing: THREE.Mesh;
  scaleFactor: number;
  setElderState: (flag: boolean) => void;
  isElder: () => boolean;
}

export interface ZeusCyclopsOptions {
  teamId?: TeamId;
  scale?: number;
  textures?: CyclopsTextures;
  enableShadows?: boolean;
}

/* ==========================================================================
   3. CONSTRUÇÃO DO CICLOPE DE ZEUS (PADRÃO & ANCIÃO - VONTADE DE CRONOS)
   ========================================================================== */
export function buildZeusCyclops(options: ZeusCyclopsOptions = {}): CyclopsBuildResult {
  const scaleMult = options.scale ?? 1.0;
  const textures = options.textures ?? createCyclopsTextures();
  const teamColor = options.teamId === 'enemy' ? 0xef4444 : 0x1d4ed8;

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: 0xb59c6b, // Pele ocre-esverdeada gigantesca
      roughness: 0.52,
      metalness: 0.05,
    }),
    goatFur: new THREE.MeshStandardMaterial({
      map: textures.goatFurTex,
      roughness: 0.85,
    }),
    hoof: new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.45,
    }),
    tunicWhite: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.75,
    }),
    zeusBlue: new THREE.MeshStandardMaterial({
      color: teamColor,
      roughness: 0.45,
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.28,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x451a03,
      emissiveIntensity: 0.22,
      metalness: 0.92,
      roughness: 0.18,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.92,
      roughness: 0.2,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x5c3317,
      roughness: 0.72,
    }),
    hornMat: new THREE.MeshStandardMaterial({
      color: 0xe7e5e4,
      roughness: 0.35,
    }),
    elderScaleArmor: new THREE.MeshStandardMaterial({
      map: textures.scaleArmorTex,
      metalness: 0.85,
      roughness: 0.25,
    }),
    elderCrimson: new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.45,
    }),
    eyeWhite: new THREE.MeshStandardMaterial({
      color: 0xfef9c3,
      roughness: 0.18,
    }),
    eyeIris: new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.95,
      roughness: 0.1,
    }),
  };

  const root = new THREE.Group();
  const baseParts: THREE.Object3D[] = [];
  const elderParts: THREE.Object3D[] = [];

  // Escala colossal (1.35x maior que um soldado humano padrão)
  const scaleFactor = 1.35 * scaleMult;
  const body = group(root, 0, 1.02 * scaleFactor, 0);
  body.scale.setScalar(scaleFactor);

  // ========================================================================
  // 1. PERNAS CAPRINAS PELUDAS COM CASCOS FENDIDOS
  // ========================================================================
  const pelvis = group(body, 0, 0.86, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.28, 18, 16), M.goatFur, [0, 0, 0], [0, 0, 0], [1.18, 0.82, 0.9]);

  const legs: { L: CyclopsLegRig; R: CyclopsLegRig } = {
    L: {} as CyclopsLegRig,
    R: {} as CyclopsLegRig,
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.19, -0.04, 0);

    // Coxa musculosa peluda
    sculpt(hip, new THREE.CylinderGeometry(0.18, 0.13, 0.46, 16), M.goatFur, [0, -0.22, 0.04], [-0.22, 0, 0]);
    const knee = group(hip, 0, -0.42, 0.08);

    // Jarrete caprino invertido (perna de sátiro/ciclope)
    sculpt(knee, new THREE.CylinderGeometry(0.12, 0.085, 0.44, 14), M.goatFur, [0, -0.22, -0.04], [0.18, 0, 0]);

    // Faixa azul-olímpico no tornozelo
    const legWrap = sculpt(knee, new THREE.CylinderGeometry(0.095, 0.092, 0.14, 14), M.zeusBlue, [0, -0.32, -0.06], [0.18, 0, 0]);
    baseParts.push(legWrap);

    // Cascos fendidos gigantes
    const ankle = group(knee, 0, -0.44, -0.06);
    sculpt(ankle, new THREE.BoxGeometry(0.075, 0.11, 0.18), M.hoof, [-0.042, -0.04, 0.04]);
    sculpt(ankle, new THREE.BoxGeometry(0.075, 0.11, 0.18), M.hoof, [0.042, -0.04, 0.04]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.14, -0.1, -0.06);
  legs.R.hip.rotation.set(0.12, 0.1, 0.06);

  // ========================================================================
  // 2. TRONCO GIGANTE, TÚNICA EXOMIS (BASE) & ARMADURA ESCAMADA (ANCIÃO)
  // ========================================================================
  const torso = group(body, 0, 1.32, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.3, -0.4),
    new THREE.Vector2(0.28, -0.16),
    new THREE.Vector2(0.38, 0.08),
    new THREE.Vector2(0.49, 0.3),
    new THREE.Vector2(0.42, 0.45),
    new THREE.Vector2(0.18, 0.52),
    new THREE.Vector2(0.01, 0.53),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 32), M.skin, [0, 0, 0], [0, 0, 0], [1.24, 1.04, 0.82]);

  // --- Veste Base: Túnica Exomis branca presa no ombro esquerdo com broche ---
  const baseTunic = group(torso, 0, 0, 0);
  sculpt(baseTunic, new THREE.CylinderGeometry(0.34, 0.42, 0.65, 24), M.tunicWhite, [0, -0.22, 0], [0, 0, 0], [1.18, 1.0, 0.84]);
  sculpt(baseTunic, new THREE.BoxGeometry(0.24, 0.66, 0.44), M.tunicWhite, [-0.22, 0.18, 0.01], [0, 0, 0.42]);
  sculpt(baseTunic, new THREE.CylinderGeometry(0.065, 0.065, 0.04, 14), M.bronze, [-0.28, 0.4, 0.18], [0.3, 0, -0.3]);
  baseParts.push(baseTunic);

  // --- Armadura do Ciclope Ancião (Melhoria Vontade de Cronos - Ares) ---
  const elderArmor = group(torso, 0, 0, 0);
  sculpt(elderArmor, new THREE.LatheGeometry(torsoPts, 32), M.elderScaleArmor, [0, 0.01, 0], [0, 0, 0], [1.26, 1.05, 0.85]);
  sculpt(elderArmor, new THREE.BoxGeometry(0.32, 0.36, 0.06), M.elderCrimson, [0, 0.18, 0.33]);
  sculpt(elderArmor, new THREE.BoxGeometry(0.36, 0.4, 0.04), M.gold, [0, 0.18, 0.32]);

  // Ombreiras pontiagudas douradas nos dois ombros
  for (const side of [-1, 1]) {
    sculpt(elderArmor, new THREE.ConeGeometry(0.24, 0.42, 5), M.gold, [side * 0.48, 0.46, 0], [0, 0, side * -0.85], [1.0, 1.0, 1.3]);
  }

  // Saiote laminado de prata e ouro com barra carmesim
  sculpt(elderArmor, new THREE.CylinderGeometry(0.35, 0.52, 0.62, 24), M.tunicWhite, [0, -0.45, 0], [0, 0, 0], [1.18, 1.0, 0.86]);
  sculpt(elderArmor, new THREE.CylinderGeometry(0.51, 0.54, 0.1, 24), M.elderCrimson, [0, -0.72, 0], [0, 0, 0], [1.18, 1.0, 0.86]);
  for (let p = -2; p <= 2; p++) {
    sculpt(elderArmor, new THREE.BoxGeometry(0.11, 0.52, 0.04), M.gold, [p * 0.12, -0.44, 0.36], [-0.14, 0, 0]);
  }
  elderArmor.visible = false;
  elderParts.push(elderArmor);

  // ========================================================================
  // 3. CABEÇA DE CICLOPE COM UM ÚNICO OLHO CENTRAL, CHIFRE NA TESTA & PRESAS
  // ========================================================================
  sculpt(torso, new THREE.CylinderGeometry(0.16, 0.2, 0.22, 18), M.skin, [0, 0.54, 0]);

  const head = group(torso, 0, 0.78, 0.04);
  // Crânio robusto e mandíbula pesada
  sculpt(head, new THREE.SphereGeometry(0.22, 24, 24), M.skin, [0, 0.02, 0], [0, 0, 0], [0.94, 1.15, 1.02]);
  sculpt(head, new THREE.BoxGeometry(0.28, 0.16, 0.26), M.skin, [0, -0.1, 0.06]);

  // Sobrancelha grossa franzida
  sculpt(head, new THREE.BoxGeometry(0.26, 0.055, 0.1), M.skin, [0, 0.09, 0.19]);

  // O Único Olho Central do Ciclope
  const cyclopsEye = group(head, 0, 0.035, 0.21);
  sculpt(cyclopsEye, new THREE.SphereGeometry(0.058, 16, 16), M.eyeWhite, [0, 0, 0], [0, 0, 0], [1.35, 0.78, 0.65]);
  sculpt(cyclopsEye, new THREE.SphereGeometry(0.032, 14, 14), M.eyeIris, [0, 0, 0.024], [0, 0, 0], [1.0, 1.0, 0.6]);

  // Presas inferiores salientes e orelhas pontudas
  for (const side of [-1, 1]) {
    sculpt(head, new THREE.ConeGeometry(0.02, 0.075, 5), M.hornMat, [side * 0.085, -0.1, 0.2], [0.15, 0, side * -0.18]);
    sculpt(head, new THREE.ConeGeometry(0.045, 0.16, 5), M.skin, [side * 0.22, 0.02, -0.02], [0, 0, side * -1.1]);
  }

  // Chifre Único Central na testa
  sculpt(head, new THREE.ConeGeometry(0.065, 0.28, 10), M.hornMat, [0, 0.28, 0.06], [0.22, 0, 0]);

  // ========================================================================
  // 4. BRAÇOS GIGANTES, CLAVA / GARFO DE GUERRA & ESCUDO HOPLON
  // ========================================================================
  function createCyclopsArm(isRight: boolean): CyclopsArmRig {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.52, 0.34, 0);

    sculpt(arm, new THREE.SphereGeometry(0.165, 16, 16), M.skin, [0, -0.01, 0]);
    sculpt(arm, new THREE.CapsuleGeometry(0.115, 0.28, 12, 16), M.skin, [s * 0.02, -0.18, 0], [0, 0, s * 0.06]);

    const elbow = group(arm, s * 0.04, -0.36, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.105, 0.082, 0.34, 16), M.skin, [0, -0.16, 0]);

    // Braçadeira azul-olímpico (Base) ou bronze (Ancião)
    const wristBase = sculpt(elbow, new THREE.CylinderGeometry(0.095, 0.086, 0.14, 16), M.zeusBlue, [0, -0.25, 0]);
    baseParts.push(wristBase);

    const wristElder = sculpt(elbow, new THREE.CylinderGeometry(0.098, 0.088, 0.18, 16), M.bronze, [0, -0.24, 0]);
    wristElder.visible = false;
    elderParts.push(wristElder);

    const hand = group(elbow, 0, -0.35, 0);
    sculpt(hand, new THREE.BoxGeometry(0.11, 0.12, 0.08), M.skin, [0, -0.02, 0]);

    return { arm, elbow, hand };
  }

  const rightArm = createCyclopsArm(true);
  const leftArm = createCyclopsArm(false);

  // --- Arma Base: Clava de Ferro Pontiaguda ---
  const baseClub = group(rightArm.hand, 0, -0.04, 0.04);
  baseClub.rotation.set(Math.PI / 2, 0, 0);
  sculpt(baseClub, new THREE.CylinderGeometry(0.028, 0.032, 1.35, 10), M.wood, [0, 0.35, 0]);
  sculpt(baseClub, new THREE.CylinderGeometry(0.095, 0.045, 0.45, 6), M.steel, [0, 0.95, 0]);
  sculpt(baseClub, new THREE.ConeGeometry(0.095, 0.24, 6), M.steel, [0, 1.29, 0]);
  baseParts.push(baseClub);

  // --- Arma do Ciclope Ancião: Garfo de Guerra / Bidente Gigante ---
  const elderFork = group(rightArm.hand, 0, -0.04, 0.04);
  elderFork.rotation.set(Math.PI / 2, 0, 0);
  sculpt(elderFork, new THREE.CylinderGeometry(0.026, 0.028, 2.25, 10), M.wood, [0, 0.55, 0]);
  sculpt(elderFork, new THREE.BoxGeometry(0.32, 0.05, 0.05), M.steel, [0, 1.55, 0]);
  sculpt(elderFork, new THREE.ConeGeometry(0.035, 0.42, 4), M.steel, [0, 1.78, 0]);
  for (const side of [-1, 1]) {
    sculpt(elderFork, new THREE.ConeGeometry(0.032, 0.48, 4), M.steel, [side * 0.14, 1.8, 0]);
  }
  elderFork.visible = false;
  elderParts.push(elderFork);

  // --- Escudo Hoplon no Braço Esquerdo ---
  const shield = group(leftArm.elbow, -0.09, -0.22, 0.02);
  shield.rotation.set(0, -Math.PI / 2, 0);
  sculpt(shield, new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24), M.bronze, [0, 0, 0], [Math.PI / 2, 0, 0]);
  sculpt(shield, new THREE.TorusGeometry(0.52, 0.032, 8, 32), M.zeusBlue, [0, 0, 0.03]);
  baseParts.push(shield);

  // Âncora na mão esquerda para segurar o soldado humano arremessado
  const grabAnchor = group(leftArm.hand, 0, -0.06, 0.08);

  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.25, 48),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.025;
  root.add(auraRing);

  let isElderFlag = false;
  function setElderState(flag: boolean) {
    isElderFlag = flag;
    baseParts.forEach((p) => {
      p.visible = !flag;
    });
    elderParts.forEach((p) => {
      p.visible = flag;
    });
    (auraRing.material as THREE.MeshBasicMaterial).color.setHex(flag ? 0xef4444 : 0xfacc15);
    auraRing.scale.setScalar(flag ? 1.22 : 1.0);
  }

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    grabAnchor,
    auraRing,
    scaleFactor,
    setElderState,
    isElder: () => isElderFlag,
  };
}

/* ==========================================================================
   4. LOOP DE ANIMAÇÃO DO CICLOPE (IDLE, ANDANDO & GOLPE DE CLAVA/ARREMESSO)
   ========================================================================== */
export function animateCyclopsModel(
  cyclops: CyclopsBuildResult,
  elapsed: number,
  dt: number,
  moving = false,
  speed = 1.0,
  attackT: number | null = null
): void {
  const heavyBreath = Math.sin(elapsed * 2.0) * 0.025;
  cyclops.body.position.y = 1.02 * cyclops.scaleFactor + heavyBreath;
  cyclops.auraRing.rotation.z += dt * 0.45;

  if (moving) {
    const walkPhase = elapsed * Math.max(3.5, speed * 1.9);
    const st = Math.sin(walkPhase) * 0.45;
    cyclops.legs.L.hip.rotation.x = -0.14 + st;
    cyclops.legs.R.hip.rotation.x = 0.12 - st;
    cyclops.legs.L.knee.rotation.x = Math.max(0, -st * 0.5);
    cyclops.legs.R.knee.rotation.x = Math.max(0, st * 0.5);

    cyclops.torso.rotation.y = Math.sin(walkPhase * 0.5) * 0.1;
  } else {
    cyclops.legs.L.hip.rotation.x = THREE.MathUtils.damp(cyclops.legs.L.hip.rotation.x, -0.14, 8, dt);
    cyclops.legs.R.hip.rotation.x = THREE.MathUtils.damp(cyclops.legs.R.hip.rotation.x, 0.12, 8, dt);
    cyclops.legs.L.knee.rotation.x = THREE.MathUtils.damp(cyclops.legs.L.knee.rotation.x, 0, 8, dt);
    cyclops.legs.R.knee.rotation.x = THREE.MathUtils.damp(cyclops.legs.R.knee.rotation.x, 0, 8, dt);
    cyclops.torso.rotation.y = Math.sin(elapsed * 0.45) * 0.08;
  }

  if (attackT !== null) {
    const s = Math.sin(attackT * Math.PI);
    // Golpe devastador com a clava na mão direita e avanço do escudo na esquerda
    cyclops.rightArm.arm.rotation.set(-2.1 * (1 - s) + 0.4 * s, 0.15, 0.32);
    cyclops.rightArm.elbow.rotation.set(-0.75 + 0.55 * s, 0, 0);

    cyclops.leftArm.arm.rotation.set(-1.35 * s, 0.25, -0.25);
    cyclops.leftArm.elbow.rotation.set(-0.35 * s, 0, 0);
    cyclops.torso.rotation.x = 0.22 * s;
  } else {
    // Postura de vigília / respiração
    cyclops.rightArm.arm.rotation.set(-0.35, 0.15, 0.3 + Math.sin(elapsed * 1.5) * 0.02);
    cyclops.rightArm.elbow.rotation.set(-0.42, 0, 0);
    cyclops.leftArm.arm.rotation.set(-0.35, -0.2, -0.32 - Math.cos(elapsed * 1.5) * 0.02);
    cyclops.leftArm.elbow.rotation.set(-0.55, 0, 0);
    cyclops.torso.rotation.x = THREE.MathUtils.damp(cyclops.torso.rotation.x, 0, 7, dt);
  }
}
