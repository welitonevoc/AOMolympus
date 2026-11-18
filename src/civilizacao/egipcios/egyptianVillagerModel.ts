import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO VISUAL DAS 3 DIVINDADES DO EGITO (RÁ, ÍSIS E SET)
   ========================================================================== */
export interface EgyptianGodTheme {
  id: 'ra' | 'isis' | 'set';
  title: string;
  subtitle: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  ringHex: number;
  linenBase: string;
  linenStripe: string;
  linenTrim: string;
  sashHex: number;
  accentHex: number;
  toolMetalHex: number;
  sparkHex: number;
  maleSkin: number;
  femaleSkin: number;
}

export const EGYPTIAN_GOD_THEMES: Record<string, EgyptianGodTheme> = {
  ra: {
    id: 'ra',
    title: 'Trabalhadores Egípcios de Rá',
    subtitle: 'Shenti e vestido Kalasiris de linho alvo com barrado solar em ouro e lápis-lazúli, toucado e ferramentas forjadas',
    bgHex: 0x1a1207,
    hemiSky: 0xfef9c3,
    hemiGround: 0x854d0e,
    rimHex: 0xfacc15,
    ringHex: 0xfacc15,
    linenBase: '#fffbeb',
    linenStripe: '#1e3a8a',
    linenTrim: '#f59e0b',
    sashHex: 0xd97706,
    accentHex: 0xfacc15,
    toolMetalHex: 0xd97706,
    sparkHex: 0xfef08a,
    maleSkin: 0xc48352,
    femaleSkin: 0xd69a6c
  },
  isis: {
    id: 'isis',
    title: 'Trabalhadores Egípcios de Ísis',
    subtitle: 'Linho fino do Nilo com padrões de lótus turquesa e azul-cobalto, joias de ouro e ferramentas sagradas',
    bgHex: 0x071921,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0f766e,
    rimHex: 0x2dd4bf,
    ringHex: 0x2dd4bf,
    linenBase: '#f0fdfa',
    linenStripe: '#0f766e',
    linenTrim: '#2dd4bf',
    sashHex: 0x0284c7,
    accentHex: 0xfacc15,
    toolMetalHex: 0x0d9488,
    sparkHex: 0x99f6e4,
    maleSkin: 0xbe7e4e,
    femaleSkin: 0xd29568
  },
  set: {
    id: 'set',
    title: 'Trabalhadores Egípcios de Set',
    subtitle: 'Vestes em linho ocre e terracota do deserto vermelho com barrados de obsidiana, ouro escuro e bronze',
    bgHex: 0x160906,
    hemiSky: 0xffedd5,
    hemiGround: 0x7c2d12,
    rimHex: 0xea580c,
    ringHex: 0xea580c,
    linenBase: '#fef3c7',
    linenStripe: '#7c2d12',
    linenTrim: '#ea580c',
    sashHex: 0x9a3412,
    accentHex: 0xf59e0b,
    toolMetalHex: 0x78716c,
    sparkHex: 0xfb923c,
    maleSkin: 0xb57546,
    femaleSkin: 0xc98c60
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR PARA LINHO EGÍPCIO E ARENITO DO NILO
   ========================================================================== */
export function createEgyptianLinenTexture(theme: EgyptianGodTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = theme.linenBase;
  ctx.fillRect(0, 0, 512, 256);

  // Pregas plissadas finas típicas do linho egípcio antigo
  ctx.fillStyle = 'rgba(120, 80, 20, 0.10)';
  for (let x = 0; x < 512; x += 6) ctx.fillRect(x, 0, 2, 256);

  // Barrado egípcio com pétalas de lótus estilizadas
  ctx.fillStyle = theme.linenStripe;
  ctx.fillRect(0, 196, 512, 40);
  ctx.fillStyle = theme.linenTrim;
  ctx.fillRect(0, 192, 512, 4);
  ctx.fillRect(0, 236, 512, 4);

  ctx.fillStyle = theme.linenTrim;
  for (let x = 6; x < 512; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 6, 202);
    ctx.lineTo(x + 12, 230);
    ctx.lineTo(x, 230);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSandstoneFloorTexture(theme: EgyptianGodTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#e7c686';
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 3600; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 251, 235, 0.25)' : 'rgba(120, 72, 24, 0.18)';
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 8, 8);
  }

  const cx = 512, cy = 512;
  ctx.strokeStyle = theme.linenStripe;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, 420, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = theme.linenTrim;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, 436, 0, Math.PI * 2);
  ctx.stroke();

  // Disco solar alado / estrela egípcia no centro
  ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = theme.linenTrim;
  ctx.lineWidth = 6;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ==========================================================================
   3. HELPERS DE MODELAGEM
   ========================================================================== */
function group(parent: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  enableShadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.castShadow = enableShadows;
  m.receiveShadow = enableShadows;
  parent.add(m);
  return m;
}

export type EgyptianLaborerAction = 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir';

export interface EgyptianLaborerInstance {
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
  setToolMode: (act: EgyptianLaborerAction) => void;
  applyGodTheme: (godKey: string) => void;
  isFemale: boolean;
  heightScale: number;
}

export function buildEgyptianLaborer(
  isFemale: boolean,
  initialGod: string = 'ra',
  enableShadows = true
): EgyptianLaborerInstance {
  const theme = EGYPTIAN_GOD_THEMES[initialGod] || EGYPTIAN_GOD_THEMES.ra;

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: isFemale ? theme.femaleSkin : theme.maleSkin,
      roughness: 0.44,
      metalness: 0.05
    }),
    hair: new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.58
    }),
    linen: new THREE.MeshStandardMaterial({
      map: createEgyptianLinenTexture(theme),
      roughness: 0.56,
      side: THREE.DoubleSide
    }),
    sash: new THREE.MeshStandardMaterial({
      color: theme.sashHex,
      roughness: 0.52,
      side: THREE.DoubleSide
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.accentHex,
      metalness: 0.88,
      roughness: 0.22
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
      roughness: 0.24
    }),
    lipMat: new THREE.MeshStandardMaterial({
      color: isFemale ? 0xc2635b : 0x9e5948,
      roughness: 0.45
    }),
    eyeIris: new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.15
    })
  };

  const root = new THREE.Group();
  const heightScale = isFemale ? 0.94 : 1.0;
  const body = group(root, 0, 1.00 * heightScale, 0);
  body.scale.setScalar(heightScale);

  // Pelve esguia
  const pelvis = group(body, 0, 0.88, 0);
  const hipWidth = isFemale ? 1.08 : 0.96;
  sculpt(pelvis, new THREE.SphereGeometry(0.19, 18, 16), M.linen, [0, 0, 0], [0, 0, 0], [hipWidth, 0.78, 0.82], enableShadows);

  // Pernas esguias e sandálias de papiro/couro egípcias
  const legs = {
    L: {} as { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group },
    R: {} as { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group }
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

    // Tornozeleira dourada
    const anklet = new THREE.TorusGeometry(calfRBot * 1.12, 0.006, 6, 18);
    anklet.rotateX(Math.PI / 2);
    sculpt(knee, anklet, M.gold, [0, -0.39, 0.01], [0, 0, 0], [1, 1, 1], enableShadows);

    const ankle = group(knee, 0, -0.44, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.082, 0.015, 0.20), M.leather, [0, -0.042, 0.035], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(ankle, new THREE.BoxGeometry(0.076, 0.032, 0.18), M.skin, [0, -0.022, 0.032], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(ankle, new THREE.BoxGeometry(0.082, 0.010, 0.020), M.gold, [0, -0.008, 0.05], [0, 0, 0], [1, 1, 1], enableShadows);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
  legs.L.knee.rotation.set(0.16, 0, 0);
  legs.R.hip.rotation.set(0.10, 0.08, 0.04);
  legs.R.knee.rotation.set(0.14, 0, 0);

  // Tronco: Homem egípcio com peito bronzeado descoberto + colar Usekh + Shenti;
  // Mulher egípcia com vestido justo Kalasiris de alças e colar Usekh!
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

  if (isFemale) {
    // Vestido Kalasiris egípcio em linho fino ajustado ao corpo
    const dressPts = [
      new THREE.Vector2(0.01, -0.38),
      new THREE.Vector2(0.215, -0.34),
      new THREE.Vector2(waistW + 0.015, -0.15),
      new THREE.Vector2(waistW + 0.042, 0.05),
      new THREE.Vector2(shoulderW * 0.96, 0.24),
      new THREE.Vector2(0.16, 0.26),
      new THREE.Vector2(0.01, 0.26)
    ];
    sculpt(torso, new THREE.LatheGeometry(dressPts, 32), M.linen, [0, 0.01, 0], [0, 0, 0], [1.10, 1.0, 0.76], enableShadows);
    // Alças nos ombros
    for (const side of [-1, 1] as const) {
      sculpt(torso, new THREE.BoxGeometry(0.042, 0.18, 0.20), M.linen, [side * 0.14, 0.32, 0.01], [0.12, 0, side * -0.12], [1, 1, 1], enableShadows);
    }
  }

  // Colar Egípcio Usekh em ouro e cor da divindade
  for (let c = 0; c < 3; c++) {
    const colRad = 0.15 + c * 0.026;
    const usekh = new THREE.TorusGeometry(colRad, 0.013, 8, 28, Math.PI * 1.1);
    usekh.rotateX(Math.PI / 2);
    usekh.rotateY(-Math.PI * 0.05);
    sculpt(torso, usekh, c % 2 === 0 ? M.gold : M.sash, [0, 0.38 - c * 0.020, 0.02 + c * 0.005], [0.18, 0, 0], [1.08, 1, 0.78], enableShadows);
  }

  // Cinturão egípcio + Faixa
  const belt = new THREE.TorusGeometry(waistW + 0.025, 0.024, 10, 28);
  belt.rotateX(Math.PI / 2);
  sculpt(torso, belt, M.sash, [0, -0.16, 0.005], [0.04, 0, 0], [1.12, 1, 0.80], enableShadows);
  sculpt(torso, new THREE.BoxGeometry(0.075, 0.055, 0.022), M.gold, [0, -0.16, (waistW + 0.025) * 0.84], [0, 0, 0], [1, 1, 1], enableShadows);

  // Saiote Shenti (Homem: até os joelhos com dobra frontal plissada; Mulher: saia longa Kalasiris)
  const skirtH = isFemale ? 0.96 : 0.54;
  const skirtBotR = isFemale ? 0.32 : 0.34;
  const skirtY = isFemale ? -0.64 : -0.43;
  const skirtGeo = new THREE.CylinderGeometry(0.21, skirtBotR, skirtH, 36, 12, true);
  const skPos = skirtGeo.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    const x = skPos.getX(i);
    const y = skPos.getY(i);
    const z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (skirtH * 0.5 - y) / skirtH));
    const pleat = Math.sin(angle * 18) * 0.015 * (0.2 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    skPos.setXYZ(i, Math.cos(angle) * r * 1.05, y, Math.sin(angle) * r * 0.84);
  }
  skirtGeo.computeVertexNormals();
  sculpt(torso, skirtGeo, M.linen, [0, skirtY, 0], [0.02, 0, 0], [1, 1, 1], enableShadows);

  if (!isFemale) {
    // Painel triangular frontal típico do Shenti egípcio masculino
    const apron = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.38, 4), M.linen);
    apron.position.set(0, -0.38, 0.19);
    apron.rotation.set(-0.08, 0, Math.PI);
    apron.scale.set(1.1, 1, 0.18);
    apron.castShadow = enableShadows;
    torso.add(apron);
  }

  // Pescoço e Cabeça Egípcia com Delineado Kohl e Cabelos Negros
  sculpt(torso, new THREE.CylinderGeometry(0.082, 0.102, 0.22, 16), M.skin, [0, 0.48, -0.005], [0.05, 0, 0], [1, 1, 1], enableShadows);

  const head = group(torso, 0, 0.68, 0.025);
  const headScaleX = isFemale ? 0.88 : 0.93;
  sculpt(head, new THREE.SphereGeometry(0.168, 28, 28), M.skin, [0, 0, 0], [0, 0, 0], [headScaleX, 1.12, 0.96], enableShadows);

  sculpt(head, new THREE.BoxGeometry(0.018, 0.068, 0.032), M.skin, [0, 0.005, 0.158], [-0.10, 0, 0], [1, 1, 1], enableShadows);
  sculpt(head, new THREE.BoxGeometry(0.038, 0.012, 0.018), M.lipMat, [0, -0.068, 0.154], [0, 0, 0], [1, 1, 1], enableShadows);

  // Olhos egípcios com delineado Kohl
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  for (const side of [-1, 1] as const) {
    sculpt(head, new THREE.SphereGeometry(0.019, 12, 12), eyeWhiteMat, [side * 0.048, 0.022, 0.148], [0, 0, 0], [1.15, 0.72, 0.75], enableShadows);
    sculpt(head, new THREE.SphereGeometry(0.011, 10, 10), M.eyeIris, [side * 0.048, 0.022, 0.158], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(head, new THREE.BoxGeometry(0.056, 0.007, 0.014), M.hair, [side * 0.052, 0.028, 0.154], [0, 0, side * -0.10], [1, 1, 1], enableShadows);
  }

  // Penteados Egípcios Clássicos
  if (isFemale) {
    // Peruca / Cabelo liso longo egípcio dividido em duas mechas frontais sobre os ombros + faixa dourada
    sculpt(head, new THREE.SphereGeometry(0.180, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.64), M.hair, [0, 0.025, -0.01], [-0.10, 0, 0], [0.95, 1.08, 1.04], enableShadows);
    for (const side of [-1, 1] as const) {
      sculpt(head, new THREE.BoxGeometry(0.058, 0.34, 0.075), M.hair, [side * 0.135, -0.10, 0.04], [0.12, 0, side * -0.16], [1, 1, 1], enableShadows);
      sculpt(head, new THREE.CylinderGeometry(0.032, 0.032, 0.020, 10), M.gold, [side * 0.155, -0.24, 0.06], [0.12, 0, side * -0.16], [1, 1, 1], enableShadows);
    }
    const circlet = new THREE.TorusGeometry(0.168, 0.009, 8, 32);
    circlet.rotateX(Math.PI / 2);
    sculpt(head, circlet, M.gold, [0, 0.095, 0.005], [0.20, 0, 0], [0.93, 1, 1.02], enableShadows);
  } else {
    // Toucado / Lenço de linho do trabalhador egípcio (Khat) com faixa da divindade
    sculpt(head, new THREE.SphereGeometry(0.182, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.66), M.linen, [0, 0.025, -0.015], [-0.14, 0, 0], [0.98, 1.08, 1.08], enableShadows);
    const headBand = new THREE.TorusGeometry(0.174, 0.011, 8, 32);
    headBand.rotateX(Math.PI / 2);
    sculpt(head, headBand, M.sash, [0, 0.088, 0.005], [0.20, 0, 0], [0.97, 1, 1.04], enableShadows);
  }

  // Braços articulados com braceletes dourados egípcios
  function createEgyptianArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const armX = isFemale ? 0.295 : 0.345;
    const arm = group(torso, s * armX, 0.32, -0.005);

    const upperR = isFemale ? 0.056 : 0.068;
    sculpt(arm, new THREE.SphereGeometry(upperR * 1.15, 14, 14), M.skin, [0, -0.01, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(arm, new THREE.CapsuleGeometry(upperR, 0.24, 10, 14), M.skin, [s * 0.015, -0.15, 0], [0, 0, s * 0.06], [1, 1, 1], enableShadows);

    const armlet = new THREE.TorusGeometry(upperR * 1.04, 0.007, 6, 20);
    armlet.rotateX(Math.PI / 2);
    sculpt(arm, armlet, M.gold, [s * 0.014, -0.14, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const elbow = group(arm, s * 0.03, -0.30, 0);
    const foreRTop = isFemale ? 0.052 : 0.062;
    const foreRBot = isFemale ? 0.038 : 0.045;
    sculpt(elbow, new THREE.CylinderGeometry(foreRTop, foreRBot, 0.28, 14), M.skin, [0, -0.14, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const wristBand = new THREE.TorusGeometry(foreRBot * 1.08, 0.006, 6, 18);
    wristBand.rotateX(Math.PI / 2);
    sculpt(elbow, wristBand, M.gold, [0, -0.25, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const hand = group(elbow, 0, -0.29, 0);
    sculpt(hand, new THREE.BoxGeometry(0.052, 0.064, 0.026), M.skin, [0, -0.015, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    return { arm, elbow, hand };
  }

  const rightArm = createEgyptianArm(true);
  const leftArm = createEgyptianArm(false);

  // ========================================================================
  // FERRAMENTAS EGÍPCIAS DE COLETA (ENXADA/MACHADO, PICARETA, CESTO, MAÇO)
  // ========================================================================
  const axe = group(rightArm.hand, 0, -0.025, 0.02);
  axe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(axe, new THREE.CylinderGeometry(0.015, 0.017, 0.92, 10), M.wood, [0, 0.28, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(axe, new THREE.BoxGeometry(0.03, 0.14, 0.20), M.toolMetal, [0, 0.66, 0.07], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(axe, new THREE.BoxGeometry(0.012, 0.18, 0.06), M.gold, [0, 0.66, 0.16], [0, 0, 0], [1, 1, 1], enableShadows);

  const pickaxe = group(rightArm.hand, 0, -0.025, 0.02);
  pickaxe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.015, 0.017, 0.92, 10), M.wood, [0, 0.28, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.024, 0.024, 0.08, 10), M.toolMetal, [0, 0.68, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.ConeGeometry(0.024, 0.24, 5), M.toolMetal, [0, 0.68, 0.13], [Math.PI / 2 + 0.18, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.ConeGeometry(0.024, 0.24, 5), M.toolMetal, [0, 0.68, -0.13], [-Math.PI / 2 - 0.18, 0, 0], [1, 1, 1], enableShadows);

  const hammer = group(rightArm.hand, 0, -0.025, 0.02);
  hammer.rotation.set(Math.PI / 2, 0, 0);
  sculpt(hammer, new THREE.CylinderGeometry(0.014, 0.016, 0.56, 10), M.wood, [0, 0.18, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(hammer, new THREE.CylinderGeometry(0.042, 0.036, 0.18, 12), M.wood, [0, 0.42, 0], [Math.PI / 2, 0, 0], [1, 1, 1], enableShadows);

  const basket = group(leftArm.hand, 0, -0.04, 0.06);
  sculpt(basket, new THREE.CylinderGeometry(0.18, 0.12, 0.20, 18), M.leather, [0, -0.04, 0.06], [0.25, 0, 0], [1, 1, 1], enableShadows);
  const rimBasket = new THREE.TorusGeometry(0.18, 0.014, 8, 22);
  rimBasket.rotateX(Math.PI / 2);
  sculpt(basket, rimBasket, M.gold, [0, 0.055, 0.085], [0.25, 0, 0], [1, 1, 1], enableShadows);
  const dateCols = [0x92400e, 0xd97706, 0xb45309, 0xf59e0b];
  for (let f = 0; f < 6; f++) {
    const fa = (f / 6) * Math.PI * 2;
    sculpt(
      basket,
      new THREE.SphereGeometry(0.042, 10, 10),
      new THREE.MeshStandardMaterial({ color: dateCols[f % dateCols.length], roughness: 0.35 }),
      [Math.cos(fa) * 0.07, 0.065, 0.085 + Math.sin(fa) * 0.07],
      [0, 0, 0],
      [1, 1, 1],
      enableShadows
    );
  }

  const tools = { axe, pickaxe, hammer, basket };

  function setToolMode(act: EgyptianLaborerAction) {
    tools.axe.visible = act === 'madeira';
    tools.pickaxe.visible = act === 'ouro';
    tools.hammer.visible = act === 'construir';
    tools.basket.visible = act === 'fruta';
  }
  setToolMode('vigilia');

  function applyGodTheme(godKey: string) {
    const next = EGYPTIAN_GOD_THEMES[godKey] || EGYPTIAN_GOD_THEMES.ra;
    M.skin.color.setHex(isFemale ? next.femaleSkin : next.maleSkin);
    M.sash.color.setHex(next.sashHex);
    M.gold.color.setHex(next.accentHex);
    M.toolMetal.color.setHex(next.toolMetalHex);

    if (M.linen.map) M.linen.map.dispose();
    M.linen.map = createEgyptianLinenTexture(next);
    M.linen.needsUpdate = true;
  }

  return {
    root, body, torso, head, legs,
    rightArm, leftArm, tools,
    setToolMode, applyGodTheme,
    isFemale, heightScale
  };
}
