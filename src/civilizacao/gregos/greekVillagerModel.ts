import * as THREE from 'three';

export interface GodVillagerTheme {
  id: 'zeus' | 'poseidon' | 'hades';
  title: string;
  subtitle: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  ringHex: number;
  tunicBase: string;
  tunicStripe: string;
  tunicTrim: string;
  sashHex: number;
  accentHex: number;
  toolMetalHex: number;
  sparkHex: number;
  maleSkin: number;
  femaleSkin: number;
  maleHair: number;
  femaleHair: number;
}

export const GOD_VILLAGER_THEMES: Record<string, GodVillagerTheme> = {
  zeus: {
    id: 'zeus',
    title: 'Aldeões Gregos de Zeus',
    subtitle: 'Túnica Chiton e Peplos em linho alvo com meandro azul-olímpico, faixa dourada e ferramentas de bronze solar',
    bgHex: 0x132644,
    hemiSky: 0xfef9c3,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    ringHex: 0xfacc15,
    tunicBase: '#f8fafc',
    tunicStripe: '#1e3a8a',
    tunicTrim: '#eab308',
    sashHex: 0x1d4ed8,
    accentHex: 0xfacc15,
    toolMetalHex: 0xd97706,
    sparkHex: 0xfef08a,
    maleSkin: 0xc98d62,
    femaleSkin: 0xdfaa84,
    maleHair: 0x3b2314,
    femaleHair: 0x4a2c18
  },
  poseidon: {
    id: 'poseidon',
    title: 'Aldeões Gregos de Poseidon',
    subtitle: 'Vestes em linho marinho com ondas turquesa, faixa de coral-azul e ferramentas de bronze atlante',
    bgHex: 0x062336,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0c4a6e,
    rimHex: 0x2dd4bf,
    ringHex: 0x2dd4bf,
    tunicBase: '#ecfeff',
    tunicStripe: '#0f766e',
    tunicTrim: '#2dd4bf',
    sashHex: 0x0284c7,
    accentHex: 0x5eead4,
    toolMetalHex: 0x0d9488,
    sparkHex: 0x99f6e4,
    maleSkin: 0xc28558,
    femaleSkin: 0xdba47e,
    maleHair: 0x1e293b,
    femaleHair: 0x293548
  },
  hades: {
    id: 'hades',
    title: 'Aldeões Gregos de Hades',
    subtitle: 'Túnicas cinza-carvão do Submundo com borda carmesim, detalhes em ferro escuro e brasas espectrais',
    bgHex: 0x090712,
    hemiSky: 0xa7f3d0,
    hemiGround: 0x2e1065,
    rimHex: 0x10b981,
    ringHex: 0xea580c,
    tunicBase: '#3f3f46',
    tunicStripe: '#7f1d1d',
    tunicTrim: '#ea580c',
    sashHex: 0x450a0a,
    accentHex: 0xea580c,
    toolMetalHex: 0x71717a,
    sparkHex: 0x6ee7b7,
    maleSkin: 0xae917e,
    femaleSkin: 0xc7afa0,
    maleHair: 0x18181b,
    femaleHair: 0x1f1926
  }
};

export function createVillagerTunicTexture(theme: GodVillagerTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = theme.tunicBase;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
  for (let x = 0; x < 512; x += 8) ctx.fillRect(x, 0, 3, 256);

  ctx.fillStyle = theme.tunicStripe;
  ctx.fillRect(0, 196, 512, 40);
  ctx.fillStyle = theme.tunicTrim;
  ctx.fillRect(0, 192, 512, 4);
  ctx.fillRect(0, 236, 512, 4);

  ctx.strokeStyle = theme.tunicTrim;
  ctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x + 4, 229);
    ctx.lineTo(x + 4, 204);
    ctx.lineTo(x + 24, 204);
    ctx.lineTo(x + 24, 223);
    ctx.lineTo(x + 12, 223);
    ctx.lineTo(x + 12, 213);
    ctx.lineTo(x + 18, 213);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function group(parent?: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  shadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  if (parent) parent.add(m);
  return m;
}

export interface GreekVillagerInstance {
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
  tools: {
    axe: THREE.Group;
    pickaxe: THREE.Group;
    hammer: THREE.Group;
    basket: THREE.Group;
  };
  setToolMode: (act: 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir') => void;
  applyGodTheme: (godKey: 'zeus' | 'poseidon' | 'hades') => void;
  isFemale: boolean;
  heightScale: number;
}

export function buildGreekVillager(
  isFemale = false,
  initialGod: 'zeus' | 'poseidon' | 'hades' = 'zeus',
  enableShadows = true
): GreekVillagerInstance {
  const theme = GOD_VILLAGER_THEMES[initialGod] || GOD_VILLAGER_THEMES.zeus;

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: isFemale ? theme.femaleSkin : theme.maleSkin,
      roughness: 0.48,
      metalness: 0.04
    }),
    hair: new THREE.MeshStandardMaterial({
      color: isFemale ? theme.femaleHair : theme.maleHair,
      roughness: 0.65
    }),
    tunic: new THREE.MeshStandardMaterial({
      map: createVillagerTunicTexture(theme),
      roughness: 0.60,
      side: THREE.DoubleSide
    }),
    sash: new THREE.MeshStandardMaterial({
      color: theme.sashHex,
      roughness: 0.55,
      side: THREE.DoubleSide
    }),
    accent: new THREE.MeshStandardMaterial({
      color: theme.accentHex,
      metalness: 0.85,
      roughness: 0.25
    }),
    leather: new THREE.MeshStandardMaterial({
      color: 0x5c2d16,
      roughness: 0.72
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x6b3818,
      roughness: 0.65
    }),
    toolMetal: new THREE.MeshStandardMaterial({
      color: theme.toolMetalHex,
      metalness: 0.85,
      roughness: 0.25
    }),
    lipMat: new THREE.MeshStandardMaterial({
      color: isFemale ? 0xc86d6d : 0xa86454,
      roughness: 0.45
    }),
    eyeIris: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2
    })
  };

  const root = new THREE.Group();
  const heightScale = isFemale ? 0.94 : 1.0;
  const body = group(root, 0, 1.00 * heightScale, 0);
  body.scale.setScalar(heightScale);

  const pelvis = group(body, 0, 0.88, 0);
  const hipWidth = isFemale ? 1.08 : 0.96;
  sculpt(pelvis, new THREE.SphereGeometry(0.19, 18, 16), M.tunic, [0, 0, 0], [0, 0, 0], [hipWidth, 0.78, 0.82], enableShadows);

  const legs = {
    L: { hip: group(), knee: group(), ankle: group() },
    R: { hip: group(), knee: group(), ankle: group() }
  };
  const legSpread = isFemale ? 0.125 : 0.135;
  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * legSpread, -0.04, 0);

    const thighRTop = isFemale ? 0.105 : 0.112;
    const thighRBot = isFemale ? 0.075 : 0.082;
    sculpt(hip, new THREE.CylinderGeometry(thighRTop, thighRBot, 0.48, 16), M.skin, [0, -0.23, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(hip, new THREE.SphereGeometry(thighRBot * 1.02, 12, 12), M.skin, [0, -0.47, 0.01], [0, 0, 0], [1, 1, 1], enableShadows);

    const knee = group(hip, 0, -0.48, 0);
    const calfRTop = isFemale ? 0.072 : 0.078;
    const calfRBot = isFemale ? 0.045 : 0.050;
    sculpt(knee, new THREE.CylinderGeometry(calfRTop, calfRBot, 0.44, 16), M.skin, [0, -0.22, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const ankle = group(knee, 0, -0.44, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.082, 0.016, 0.20), M.leather, [0, -0.042, 0.035], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(ankle, new THREE.BoxGeometry(0.076, 0.032, 0.18), M.skin, [0, -0.022, 0.032], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(ankle, new THREE.BoxGeometry(0.084, 0.012, 0.024), M.leather, [0, -0.008, 0.06], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(ankle, new THREE.BoxGeometry(0.084, 0.012, 0.024), M.leather, [0, -0.005, 0.00], [0, 0, 0], [1, 1, 1], enableShadows);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
  legs.L.knee.rotation.set(0.16, 0, 0);
  legs.R.hip.rotation.set(0.10, 0.08, 0.04);
  legs.R.knee.rotation.set(0.14, 0, 0);

  const torso = group(body, 0, 1.28, 0);
  const shoulderW = isFemale ? 0.255 : 0.305;
  const waistW = isFemale ? 0.175 : 0.205;
  const torsoPts = [
    new THREE.Vector2(0.01, -0.42),
    new THREE.Vector2(0.20, -0.38),
    new THREE.Vector2(waistW, -0.16),
    new THREE.Vector2(waistW + 0.03, 0.04),
    new THREE.Vector2(shoulderW, 0.26),
    new THREE.Vector2(shoulderW * 0.85, 0.40),
    new THREE.Vector2(0.10, 0.46),
    new THREE.Vector2(0.01, 0.47)
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 28), M.skin, [0, 0, 0], [0, 0, 0], [1.08, 1.0, 0.72], enableShadows);

  const tunicPts = [
    new THREE.Vector2(0.01, -0.38),
    new THREE.Vector2(0.215, -0.34),
    new THREE.Vector2(waistW + 0.015, -0.15),
    new THREE.Vector2(waistW + 0.045, 0.05),
    new THREE.Vector2(shoulderW + 0.015, 0.27),
    new THREE.Vector2(shoulderW * 0.78, 0.37),
    new THREE.Vector2(0.14, 0.38),
    new THREE.Vector2(0.01, 0.38)
  ];
  sculpt(torso, new THREE.LatheGeometry(tunicPts, 32), M.tunic, [0, 0.01, 0], [0, 0, 0], [1.10, 1.0, 0.76], enableShadows);

  for (const side of [-1, 1]) {
    if (!isFemale && side === 1) continue;
    sculpt(torso, new THREE.CylinderGeometry(0.022, 0.022, 0.016, 12), M.accent, [side * (shoulderW * 0.68), 0.37, 0.02], [0.2, 0, 0], [1, 1, 1], enableShadows);
  }

  sculpt(torso, new THREE.BoxGeometry(0.075, 0.64, 0.24), M.sash, [0, 0.04, 0.01], [0, 0, isFemale ? 0.48 : -0.52], [1, 1, 1], enableShadows);
  const belt = new THREE.TorusGeometry(waistW + 0.025, 0.022, 10, 28);
  belt.rotateX(Math.PI / 2);
  sculpt(torso, belt, M.sash, [0, -0.16, 0.005], [0.04, 0, 0], [1.12, 1, 0.80], enableShadows);

  const buckleZ = (waistW + 0.025) * 0.82;
  const zeusBuckle = group(torso, 0, -0.16, buckleZ);
  sculpt(zeusBuckle, new THREE.ConeGeometry(0.018, 0.055, 4), M.accent, [-0.006, 0.018, 0], [0, 0, -0.32], [1, 1, 0.35], enableShadows);
  sculpt(zeusBuckle, new THREE.ConeGeometry(0.018, 0.055, 4), M.accent, [0.006, -0.018, 0], [0, 0, Math.PI - 0.32], [1, 1, 0.35], enableShadows);

  const poseidonBuckle = group(torso, 0, -0.16, buckleZ);
  sculpt(poseidonBuckle, new THREE.BoxGeometry(0.010, 0.075, 0.016), M.accent, [0, 0, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(poseidonBuckle, new THREE.BoxGeometry(0.046, 0.010, 0.016), M.accent, [0, 0, 0.018], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(poseidonBuckle, new THREE.BoxGeometry(0.009, 0.032, 0.016), M.accent, [-0.020, 0.030, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(poseidonBuckle, new THREE.BoxGeometry(0.009, 0.032, 0.016), M.accent, [0.020, 0.030, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  poseidonBuckle.visible = false;

  const hadesBuckle = group(torso, 0, -0.16, buckleZ);
  sculpt(hadesBuckle, new THREE.BoxGeometry(0.010, 0.045, 0.016), M.accent, [0, -0.016, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(hadesBuckle, new THREE.BoxGeometry(0.042, 0.010, 0.016), M.accent, [0, 0.008, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(hadesBuckle, new THREE.BoxGeometry(0.010, 0.042, 0.016), M.accent, [-0.017, 0.025, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(hadesBuckle, new THREE.BoxGeometry(0.010, 0.042, 0.016), M.accent, [0.017, 0.025, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  hadesBuckle.visible = false;

  const skirtH = isFemale ? 0.96 : 0.56;
  const skirtBotR = isFemale ? 0.34 : 0.36;
  const skirtY = isFemale ? -0.64 : -0.44;
  const skirtGeo = new THREE.CylinderGeometry(0.21, skirtBotR, skirtH, 36, 12, true);
  const skPos = skirtGeo.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    const x = skPos.getX(i);
    const y = skPos.getY(i);
    const z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (skirtH * 0.5 - y) / skirtH));
    const pleat = Math.sin(angle * 16) * 0.018 * (0.2 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    skPos.setXYZ(i, Math.cos(angle) * r * 1.05, y, Math.sin(angle) * r * 0.84);
  }
  skirtGeo.computeVertexNormals();
  sculpt(torso, skirtGeo, M.tunic, [0, skirtY, 0], [0.02, 0, 0], [1, 1, 1], enableShadows);

  sculpt(torso, new THREE.CylinderGeometry(0.082, 0.102, 0.22, 16), M.skin, [0, 0.48, -0.005], [0.05, 0, 0], [1, 1, 1], enableShadows);

  const head = group(torso, 0, 0.68, 0.025);
  const headScaleX = isFemale ? 0.88 : 0.93;
  sculpt(head, new THREE.SphereGeometry(0.168, 28, 28), M.skin, [0, 0, 0], [0, 0, 0], [headScaleX, 1.12, 0.96], enableShadows);

  sculpt(head, new THREE.BoxGeometry(0.018, 0.068, 0.032), M.skin, [0, 0.005, 0.158], [-0.10, 0, 0], [1, 1, 1], enableShadows);
  sculpt(head, new THREE.BoxGeometry(0.038, 0.012, 0.018), M.lipMat, [0, -0.068, 0.154], [0, 0, 0], [1, 1, 1], enableShadows);

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  for (const side of [-1, 1]) {
    sculpt(head, new THREE.SphereGeometry(0.019, 12, 12), eyeWhiteMat, [side * 0.048, 0.022, 0.148], [0, 0, 0], [1.15, 0.72, 0.75], enableShadows);
    sculpt(head, new THREE.SphereGeometry(0.011, 10, 10), M.eyeIris, [side * 0.048, 0.022, 0.158], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(head, new THREE.BoxGeometry(0.046, 0.007, 0.014), M.hair, [side * 0.048, 0.044, 0.154], [0, 0, side * -0.08], [1, 1, 1], enableShadows);
  }

  if (isFemale) {
    sculpt(head, new THREE.SphereGeometry(0.178, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62), M.hair, [0, 0.025, -0.01], [-0.12, 0, 0], [0.94, 1.08, 1.02], enableShadows);
    sculpt(head, new THREE.SphereGeometry(0.088, 18, 18), M.hair, [0, -0.02, -0.18], [0, 0, 0], [0.95, 1.05, 1.15], enableShadows);
    for (const side of [-1, 1]) {
      sculpt(head, new THREE.CapsuleGeometry(0.022, 0.14, 8, 10), M.hair, [side * 0.125, -0.07, 0.07], [0.15, 0, side * -0.12], [1, 1, 1], enableShadows);
    }
    const headband = new THREE.TorusGeometry(0.166, 0.009, 8, 32);
    headband.rotateX(Math.PI / 2);
    sculpt(head, headband, M.accent, [0, 0.095, 0.005], [0.22, 0, 0], [0.92, 1, 1.02], enableShadows);
  } else {
    sculpt(head, new THREE.SphereGeometry(0.180, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62), M.hair, [0, 0.028, -0.01], [-0.14, 0, 0], [0.98, 1.06, 1.04], enableShadows);
    for (let c = 0; c < 10; c++) {
      const a = (c / 10) * Math.PI * 2;
      sculpt(head, new THREE.SphereGeometry(0.036, 10, 10), M.hair, [Math.sin(a) * 0.155, 0.06 + (c % 2) * 0.03, Math.cos(a) * 0.155], [0, 0, 0], [1, 1, 1], enableShadows);
    }
    const fillet = new THREE.TorusGeometry(0.172, 0.008, 8, 32);
    fillet.rotateX(Math.PI / 2);
    sculpt(head, fillet, M.accent, [0, 0.085, 0.005], [0.20, 0, 0], [0.96, 1, 1.02], enableShadows);
  }

  function createVillagerArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const armX = isFemale ? 0.295 : 0.345;
    const arm = group(torso, s * armX, 0.32, -0.005);

    const upperR = isFemale ? 0.056 : 0.068;
    sculpt(arm, new THREE.SphereGeometry(upperR * 1.15, 14, 14), M.skin, [0, -0.01, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(arm, new THREE.CapsuleGeometry(upperR, 0.24, 10, 14), M.skin, [s * 0.015, -0.15, 0], [0, 0, s * 0.06], [1, 1, 1], enableShadows);

    const armlet = new THREE.TorusGeometry(upperR * 1.04, 0.006, 6, 20);
    armlet.rotateX(Math.PI / 2);
    sculpt(arm, armlet, M.accent, [s * 0.014, -0.14, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const elbow = group(arm, s * 0.03, -0.30, 0);
    const foreRTop = isFemale ? 0.052 : 0.062;
    const foreRBot = isFemale ? 0.038 : 0.045;
    sculpt(elbow, new THREE.CylinderGeometry(foreRTop, foreRBot, 0.28, 14), M.skin, [0, -0.14, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const hand = group(elbow, 0, -0.29, 0);
    sculpt(hand, new THREE.BoxGeometry(0.052, 0.064, 0.026), M.skin, [0, -0.015, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    return { arm, elbow, hand };
  }

  const rightArm = createVillagerArm(true);
  const leftArm = createVillagerArm(false);

  const axe = group(rightArm.hand, 0, -0.025, 0.02);
  axe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(axe, new THREE.CylinderGeometry(0.015, 0.017, 0.92, 10), M.wood, [0, 0.28, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(axe, new THREE.BoxGeometry(0.03, 0.14, 0.20), M.toolMetal, [0, 0.66, 0.07], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(axe, new THREE.BoxGeometry(0.012, 0.18, 0.06), M.accent, [0, 0.66, 0.16], [0, 0, 0], [1, 1, 1], enableShadows);

  const pickaxe = group(rightArm.hand, 0, -0.025, 0.02);
  pickaxe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.015, 0.017, 0.92, 10), M.wood, [0, 0.28, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.024, 0.024, 0.08, 10), M.toolMetal, [0, 0.68, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.ConeGeometry(0.024, 0.24, 5), M.toolMetal, [0, 0.68, 0.13], [Math.PI / 2 + 0.18, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.ConeGeometry(0.024, 0.24, 5), M.toolMetal, [0, 0.68, -0.13], [-Math.PI / 2 - 0.18, 0, 0], [1, 1, 1], enableShadows);

  const hammer = group(rightArm.hand, 0, -0.025, 0.02);
  hammer.rotation.set(Math.PI / 2, 0, 0);
  sculpt(hammer, new THREE.CylinderGeometry(0.014, 0.016, 0.56, 10), M.wood, [0, 0.18, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(hammer, new THREE.CylinderGeometry(0.038, 0.038, 0.18, 12), M.toolMetal, [0, 0.42, 0], [Math.PI / 2, 0, 0], [1, 1, 1], enableShadows);

  const basket = group(leftArm.hand, 0, -0.04, 0.06);
  const basketGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.20, 18);
  sculpt(basket, basketGeo, M.leather, [0, -0.04, 0.06], [0.25, 0, 0], [1, 1, 1], enableShadows);
  const rimBasket = new THREE.TorusGeometry(0.18, 0.014, 8, 22);
  rimBasket.rotateX(Math.PI / 2);
  sculpt(basket, rimBasket, M.accent, [0, 0.055, 0.085], [0.25, 0, 0], [1, 1, 1], enableShadows);

  const fruitCols = [0xdc2626, 0xf59e0b, 0x7e22ce, 0x16a34a];
  for (let f = 0; f < 6; f++) {
    const fa = (f / 6) * Math.PI * 2;
    sculpt(
      basket,
      new THREE.SphereGeometry(0.042, 10, 10),
      new THREE.MeshStandardMaterial({ color: fruitCols[f % fruitCols.length], roughness: 0.35 }),
      [Math.cos(fa) * 0.07, 0.065, 0.085 + Math.sin(fa) * 0.07],
      [0, 0, 0],
      [1, 1, 1],
      enableShadows
    );
  }

  const tools = { axe, pickaxe, hammer, basket };

  function setToolMode(act: 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir') {
    tools.axe.visible = act === 'madeira';
    tools.pickaxe.visible = act === 'ouro';
    tools.hammer.visible = act === 'construir';
    tools.basket.visible = act === 'fruta';
  }
  setToolMode('vigilia');

  function applyGodTheme(godKey: 'zeus' | 'poseidon' | 'hades') {
    const next = GOD_VILLAGER_THEMES[godKey] || GOD_VILLAGER_THEMES.zeus;
    M.skin.color.setHex(isFemale ? next.femaleSkin : next.maleSkin);
    M.hair.color.setHex(isFemale ? next.femaleHair : next.maleHair);
    M.sash.color.setHex(next.sashHex);
    M.accent.color.setHex(next.accentHex);
    M.toolMetal.color.setHex(next.toolMetalHex);

    zeusBuckle.visible = godKey === 'zeus';
    poseidonBuckle.visible = godKey === 'poseidon';
    hadesBuckle.visible = godKey === 'hades';

    if (M.tunic.map) M.tunic.map.dispose();
    M.tunic.map = createVillagerTunicTexture(next);
    M.tunic.needsUpdate = true;
  }

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    tools,
    setToolMode,
    applyGodTheme,
    isFemale,
    heightScale
  };
}
