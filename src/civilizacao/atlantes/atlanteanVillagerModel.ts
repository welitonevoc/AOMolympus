import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO VISUAL DAS 3 DIVINDADES ATLANTES (KRONOS, ORANOS, GAIA)
   ========================================================================== */
export interface AtlanteanGodTheme {
  id: 'kronos' | 'oranos' | 'gaia';
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
  llamaBlanket: number;
}

export const ATLANTEAN_GOD_THEMES: Record<string, AtlanteanGodTheme> = {
  kronos: {
    id: 'kronos',
    title: 'Cidadãos Atlantes de Kronos & Lhama de Carga',
    subtitle: 'Anel astrolábico cronológico giratório nas costas, fivela de ampulheta temporal, braceletes de ardósia e Lhama com anel temporal',
    bgHex: 0x0d1528,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e1b4b,
    rimHex: 0x38bdf8,
    ringHex: 0x38bdf8,
    tunicBase: '#f8fafc',
    tunicStripe: '#312e81',
    tunicTrim: '#facc15',
    sashHex: 0x1d4ed8,
    accentHex: 0xfacc15,
    toolMetalHex: 0xf59e0b,
    sparkHex: 0x7dd3fc,
    llamaBlanket: 0x312e81
  },
  oranos: {
    id: 'oranos',
    title: 'Cidadãos Atlantes de Oranos & Lhama de Carga',
    subtitle: 'Asas celestes douradas e branco-pérola nas costas, tiara solar radiante, punhos luminosos e Lhama com asas douradas nos alforjes',
    bgHex: 0x0a1e32,
    hemiSky: 0xfef9c3,
    hemiGround: 0x0369a1,
    rimHex: 0xfacc15,
    ringHex: 0xfacc15,
    tunicBase: '#fffbeb',
    tunicStripe: '#0284c7',
    tunicTrim: '#eab308',
    sashHex: 0x0ea5e9,
    accentHex: 0xfde047,
    toolMetalHex: 0xfacc15,
    sparkHex: 0xfef08a,
    llamaBlanket: 0x0284c7
  },
  gaia: {
    id: 'gaia',
    title: 'Cidadãos Atlantes de Gaia & Lhama de Carga',
    subtitle: 'Coroa de folhas e brotos esmeralda, guirlanda vegetal na cintura e barra, brotos nos tornozelos e Lhama ornamentada com flores',
    bgHex: 0x071a14,
    hemiSky: 0xd1fae5,
    hemiGround: 0x064e3b,
    rimHex: 0x10b981,
    ringHex: 0x10b981,
    tunicBase: '#f0fdf4',
    tunicStripe: '#065f46',
    tunicTrim: '#f59e0b',
    sashHex: 0x059669,
    accentHex: 0xfacc15,
    toolMetalHex: 0xd97706,
    sparkHex: 0x6ee7b7,
    llamaBlanket: 0x065f46
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS
   ========================================================================== */
export function createAtlanteanClothTexture(theme: AtlanteanGodTheme): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = theme.tunicBase;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
  for (let x = 0; x < 512; x += 8) ctx.fillRect(x, 0, 3, 256);

  // Barrado geométrico atlante com espirais e ondas de Oricalco
  ctx.fillStyle = theme.tunicStripe;
  ctx.fillRect(0, 194, 512, 42);
  ctx.fillStyle = theme.tunicTrim;
  ctx.fillRect(0, 190, 512, 4);
  ctx.fillRect(0, 236, 512, 4);

  ctx.strokeStyle = theme.tunicTrim;
  ctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.arc(x + 16, 215, 10, 0, Math.PI * 1.5);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createAtlanteanFloorTexture(theme: AtlanteanGodTheme): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let mx = Math.random() * 1024, my = 0;
    ctx.moveTo(mx, my);
    while (my < 1024) {
      my += 32;
      mx += (Math.random() - 0.5) * 45;
      ctx.lineTo(mx, my);
    }
    ctx.stroke();
  }

  const cx = 512, cy = 512;
  const rings = [420, 330, 240];
  rings.forEach((r, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? theme.tunicStripe : theme.tunicTrim;
    ctx.lineWidth = idx === 0 ? 18 : 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

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

export type AtlanteanAction = 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir';

export interface AtlanteanCitizenInstance {
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
  heroGroundAura: THREE.Mesh;
  godFootAura?: THREE.Mesh;
  kronosBackHalo?: THREE.Group;
  oranosWings?: THREE.Group;
  setToolMode: (act: AtlanteanAction) => void;
  setHeroState: (isHero: boolean) => void;
  applyGodTheme: (godKey: string) => void;
  isFemale: boolean;
  heightScale: number;
  baseBodyY?: number;
}

export function buildAtlanteanCitizen(
  isFemale: boolean,
  initialGod: string = 'kronos',
  enableShadows = true
): AtlanteanCitizenInstance {
  const theme = ATLANTEAN_GOD_THEMES[initialGod] || ATLANTEAN_GOD_THEMES.kronos;

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: isFemale ? 0xdfb08c : 0xc99268,
      emissive: 0xfacc15,
      emissiveIntensity: 0.0,
      roughness: 0.44,
      metalness: 0.06
    }),
    hair: new THREE.MeshStandardMaterial({
      color: isFemale ? 0x3b2314 : 0x29180e,
      roughness: 0.62
    }),
    tunic: new THREE.MeshStandardMaterial({
      map: createAtlanteanClothTexture(theme),
      emissive: 0xfacc15,
      emissiveIntensity: 0.0,
      roughness: 0.52,
      side: THREE.DoubleSide
    }),
    sash: new THREE.MeshStandardMaterial({
      color: theme.sashHex,
      emissive: 0xfacc15,
      emissiveIntensity: 0.0,
      roughness: 0.48,
      side: THREE.DoubleSide
    }),
    orichalcum: new THREE.MeshStandardMaterial({
      color: theme.accentHex,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.15,
      metalness: 0.92,
      roughness: 0.18
    }),
    slateStone: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.45,
      metalness: 0.35
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.65
    }),
    pearlWhite: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xfef08a,
      emissiveIntensity: 0.18,
      roughness: 0.28
    }),
    divineGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.ringHex,
      emissiveIntensity: 2.3,
      roughness: 0.15
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
      emissive: 0xfacc15,
      emissiveIntensity: 0.1,
      metalness: 0.90,
      roughness: 0.20
    }),
    lipMat: new THREE.MeshStandardMaterial({
      color: isFemale ? 0xc86d6d : 0xa86454,
      roughness: 0.45
    }),
    eyeIris: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.0,
      roughness: 0.15
    })
  };

  const root = new THREE.Group();
  const heightScale = isFemale ? 0.95 : 1.0;
  const baseBodyY = 0.13 * heightScale;
  const body = group(root, 0, baseBodyY, 0);
  body.scale.setScalar(heightScale);

  const heroParts: THREE.Object3D[] = [];
  const godAdornments: Record<string, THREE.Object3D[]> = { kronos: [], oranos: [], gaia: [] };

  // Pelve e Pernas
  const pelvis = group(body, 0, 0.88, 0);
  const hipWidth = isFemale ? 1.08 : 0.98;
  sculpt(pelvis, new THREE.SphereGeometry(0.19, 18, 16), M.tunic, [0, 0, 0], [0, 0, 0], [hipWidth, 0.78, 0.82], enableShadows);

  const legs = {} as AtlanteanCitizenInstance['legs'];
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

    const heroGreave = sculpt(knee, new THREE.CylinderGeometry(calfRTop * 1.08, calfRBot * 1.12, 0.34, 16, 1, false, -0.88, 1.76), M.orichalcum, [0, -0.22, 0.01], [0, 0, 0], [1, 1, 1], enableShadows);
    heroGreave.visible = false;
    heroParts.push(heroGreave);

    const ankle = group(knee, 0, -0.44, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.082, 0.016, 0.20), M.leather, [0, -0.042, 0.035], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(ankle, new THREE.BoxGeometry(0.076, 0.032, 0.18), M.skin, [0, -0.022, 0.032], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(ankle, new THREE.BoxGeometry(0.086, 0.012, 0.024), M.orichalcum, [0, -0.008, 0.06], [0, 0, 0], [1, 1, 1], enableShadows);

    // GAIA: Brotos botânicos junto às sandálias
    const gaiaAnkle = group(ankle, 0, -0.005, 0.01);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      sculpt(gaiaAnkle, new THREE.DodecahedronGeometry(0.020, 0), M.foliage, [Math.cos(a) * 0.055, 0.01, Math.sin(a) * 0.065], [0, 0, 0], [1, 1, 1], enableShadows);
    }
    sculpt(gaiaAnkle, new THREE.OctahedronGeometry(0.016, 0), M.divineGlow, [s * 0.055, 0.028, 0.02], [0, 0, 0], [1, 1, 1], enableShadows);
    godAdornments.gaia.push(gaiaAnkle);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.08, -0.08, -0.04);
  legs.L.knee.rotation.set(0.10, 0, 0);
  legs.R.hip.rotation.set(0.06, 0.08, 0.04);
  legs.R.knee.rotation.set(0.08, 0, 0);

  // Tronco
  const torso = group(body, 0, 1.28, 0);
  const shoulderW = isFemale ? 0.255 : 0.305;
  const waistW = isFemale ? 0.175 : 0.205;

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

  const collar = new THREE.TorusGeometry(0.18, 0.016, 8, 28);
  collar.rotateX(Math.PI / 2);
  sculpt(torso, collar, M.orichalcum, [0, 0.37, 0.01], [0.16, 0, 0], [1.12, 1, 0.88], enableShadows);

  const heroBreastplate = sculpt(torso, new THREE.LatheGeometry(tunicPts, 32), M.orichalcum, [0, 0.015, 0.004], [0, 0, 0], [1.12, 1.01, 0.78], enableShadows);
  heroBreastplate.visible = false;
  heroParts.push(heroBreastplate);

  sculpt(torso, new THREE.BoxGeometry(0.075, 0.64, 0.24), M.sash, [0, 0.04, 0.01], [0, 0, isFemale ? 0.48 : -0.52], [1, 1, 1], enableShadows);
  const belt = new THREE.TorusGeometry(waistW + 0.025, 0.022, 10, 28);
  belt.rotateX(Math.PI / 2);
  sculpt(torso, belt, M.sash, [0, -0.16, 0.005], [0.04, 0, 0], [1.12, 1, 0.80], enableShadows);
  sculpt(torso, new THREE.OctahedronGeometry(0.032, 0), M.orichalcum, [0, -0.16, (waistW + 0.025) * 0.84], [0, 0, 0], [1, 1, 1], enableShadows);

  // Adornos Exclusivos dos Deuses
  // Kronos: Anel astrolábico nas costas + ampulheta na faixa
  const kronosBackHalo = group(torso, 0, 0.22, -0.22);
  const kOuterRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.014, 8, 32), M.divineGlow);
  const kInnerRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.011, 8, 24), M.orichalcum);
  kronosBackHalo.add(kOuterRing, kInnerRing);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    sculpt(kronosBackHalo, new THREE.BoxGeometry(0.025, 0.08, 0.018), M.slateStone, [Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0], [0, 0, a + Math.PI / 2], [1, 1, 1], enableShadows);
  }
  const kHourglassTop = sculpt(torso, new THREE.ConeGeometry(0.026, 0.045, 6), M.divineGlow, [0, -0.135, (waistW + 0.03) * 0.86], [Math.PI, 0, 0], [1, 1, 1], enableShadows);
  const kHourglassBot = sculpt(torso, new THREE.ConeGeometry(0.026, 0.045, 6), M.divineGlow, [0, -0.185, (waistW + 0.03) * 0.86], [0, 0, 0], [1, 1, 1], enableShadows);
  godAdornments.kronos.push(kronosBackHalo, kHourglassTop, kHourglassBot);

  // Oranos: Asas celestes nas costas + borda luminosa na faixa
  const oranosWings = group(torso, 0, 0.20, -0.17);
  for (const s of [-1, 1] as const) {
    sculpt(oranosWings, new THREE.BoxGeometry(0.32, 0.085, 0.022), M.orichalcum, [s * 0.20, 0.10, -0.03], [0.15, s * -0.32, s * 0.42], [1, 1, 1], enableShadows);
    sculpt(oranosWings, new THREE.BoxGeometry(0.26, 0.070, 0.020), M.pearlWhite, [s * 0.18, 0.02, -0.04], [0.15, s * -0.32, s * 0.22], [1, 1, 1], enableShadows);
    sculpt(oranosWings, new THREE.BoxGeometry(0.18, 0.055, 0.018), M.divineGlow, [s * 0.14, -0.05, -0.05], [0.15, s * -0.32, s * 0.05], [1, 1, 1], enableShadows);
  }
  const oranosSashGlow = sculpt(torso, new THREE.BoxGeometry(0.086, 0.65, 0.246), M.divineGlow, [0, 0.04, 0.01], [0, 0, isFemale ? 0.48 : -0.52], [1, 1, 1], enableShadows);
  godAdornments.oranos.push(oranosWings, oranosSashGlow);

  // Gaia: Guirlanda vegetal na cintura e na faixa
  const gaiaTorsoVines = group(torso, 0, 0, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const vx = Math.cos(a) * (waistW + 0.045) * 1.12;
    const vz = Math.sin(a) * (waistW + 0.045) * 0.82;
    sculpt(gaiaTorsoVines, new THREE.DodecahedronGeometry(0.032, 0), M.foliage, [vx, -0.16 + (i % 2) * 0.02, vz], [0, 0, 0], [1, 1, 1], enableShadows);
    if (i % 2 === 0) {
      sculpt(gaiaTorsoVines, new THREE.OctahedronGeometry(0.022, 0), M.divineGlow, [vx * 1.04, -0.14, vz * 1.04], [0, 0, 0], [1, 1, 1], enableShadows);
    }
  }
  for (let b = 0; b < 5; b++) {
    const tFrac = (b - 2) * 0.11;
    sculpt(gaiaTorsoVines, new THREE.DodecahedronGeometry(0.028, 0), M.foliage, [-tFrac * 0.55, 0.04 + tFrac, 0.145], [0, 0, 0], [1, 1, 1], enableShadows);
  }
  godAdornments.gaia.push(gaiaTorsoVines);

  const heroCape = sculpt(torso, new THREE.PlaneGeometry(1.05, 1.38, 14, 18), M.sash, [0, -0.32, -0.18], [0.14, 0, 0], [1, 1, 1], enableShadows);
  heroCape.visible = false;
  heroParts.push(heroCape);

  const skirtH = isFemale ? 0.96 : 0.56;
  const skirtBotR = isFemale ? 0.34 : 0.36;
  const skirtY = isFemale ? -0.64 : -0.44;
  const skirtGeo = new THREE.CylinderGeometry(0.21, skirtBotR, skirtH, 36, 12, true);
  const skPos = skirtGeo.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (skirtH * 0.5 - y) / skirtH));
    const pleat = Math.sin(angle * 16) * 0.018 * (0.2 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    skPos.setXYZ(i, Math.cos(angle) * r * 1.05, y, Math.sin(angle) * r * 0.84);
  }
  skirtGeo.computeVertexNormals();
  sculpt(torso, skirtGeo, M.tunic, [0, skirtY, 0], [0.02, 0, 0], [1, 1, 1], enableShadows);

  const gaiaSkirtTrim = group(torso, 0, skirtY - skirtH * 0.45, 0);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    sculpt(gaiaSkirtTrim, new THREE.DodecahedronGeometry(0.030, 0), M.foliage, [Math.cos(a) * skirtBotR * 1.03, 0.03, Math.sin(a) * skirtBotR * 0.83], [0, 0, 0], [1, 1, 1], enableShadows);
  }
  godAdornments.gaia.push(gaiaSkirtTrim);

  // Pescoço e Cabeça
  sculpt(torso, new THREE.CylinderGeometry(0.082, 0.102, 0.22, 16), M.skin, [0, 0.48, -0.005], [0.05, 0, 0], [1, 1, 1], enableShadows);

  const head = group(torso, 0, 0.68, 0.025);
  const headScaleX = isFemale ? 0.88 : 0.93;
  sculpt(head, new THREE.SphereGeometry(0.168, 28, 28), M.skin, [0, 0, 0], [0, 0, 0], [headScaleX, 1.12, 0.96], enableShadows);

  sculpt(head, new THREE.BoxGeometry(0.018, 0.068, 0.032), M.skin, [0, 0.005, 0.158], [-0.10, 0, 0], [1, 1, 1], enableShadows);
  sculpt(head, new THREE.BoxGeometry(0.038, 0.012, 0.018), M.lipMat, [0, -0.068, 0.154], [0, 0, 0], [1, 1, 1], enableShadows);

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  for (const side of [-1, 1] as const) {
    sculpt(head, new THREE.SphereGeometry(0.019, 12, 12), eyeWhiteMat, [side * 0.048, 0.022, 0.148], [0, 0, 0], [1.15, 0.72, 0.75], enableShadows);
    sculpt(head, new THREE.SphereGeometry(0.011, 10, 10), M.eyeIris, [side * 0.048, 0.022, 0.158], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(head, new THREE.BoxGeometry(0.046, 0.007, 0.014), M.hair, [side * 0.048, 0.044, 0.154], [0, 0, side * -0.08], [1, 1, 1], enableShadows);
  }

  sculpt(head, new THREE.SphereGeometry(0.178, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62), M.hair, [0, 0.025, -0.01], [-0.12, 0, 0], [headScaleX * 1.03, 1.08, 1.02], enableShadows);
  if (isFemale) {
    sculpt(head, new THREE.SphereGeometry(0.088, 18, 18), M.hair, [0, -0.02, -0.18], [0, 0, 0], [0.95, 1.05, 1.15], enableShadows);
  }
  const diadem = new THREE.TorusGeometry(0.168, 0.010, 8, 32);
  diadem.rotateX(Math.PI / 2);
  sculpt(head, diadem, M.orichalcum, [0, 0.092, 0.005], [0.20, 0, 0], [headScaleX * 1.02, 1, 1.02], enableShadows);

  // Adornos de Cabeça por Deus
  const kronosGem = sculpt(head, new THREE.OctahedronGeometry(0.028, 0), M.divineGlow, [0, 0.122, 0.152], [0, 0, 0], [1, 1, 1], enableShadows);
  godAdornments.kronos.push(kronosGem);

  const oranosTiara = group(head, 0, 0.122, 0.145);
  sculpt(oranosTiara, new THREE.OctahedronGeometry(0.026, 0), M.divineGlow, [0, 0.01, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  for (const s of [-1, 1] as const) {
    sculpt(oranosTiara, new THREE.ConeGeometry(0.012, 0.065, 4), M.orichalcum, [s * 0.045, 0.02, -0.01], [0.1, 0, s * -0.45], [1, 1, 1], enableShadows);
  }
  godAdornments.oranos.push(oranosTiara);

  const gaiaCrown = group(head, 0, 0.095, 0.005);
  gaiaCrown.rotation.x = 0.20;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    sculpt(gaiaCrown, new THREE.DodecahedronGeometry(0.024, 0), M.foliage, [Math.cos(a) * 0.172 * headScaleX, 0.008, Math.sin(a) * 0.172], [0, 0, 0], [1, 1, 1], enableShadows);
    if (i % 3 === 0) {
      sculpt(gaiaCrown, new THREE.OctahedronGeometry(0.018, 0), M.divineGlow, [Math.cos(a) * 0.18 * headScaleX, 0.024, Math.sin(a) * 0.18], [0, 0, 0], [1, 1, 1], enableShadows);
    }
  }
  godAdornments.gaia.push(gaiaCrown);

  const heroCrown = group(head, 0, 0.14, 0.04);
  sculpt(heroCrown, new THREE.ConeGeometry(0.024, 0.14, 4), M.orichalcum, [0, 0.05, 0.12], [0.2, 0, 0], [1, 1, 1], enableShadows);
  sculpt(heroCrown, new THREE.ConeGeometry(0.018, 0.10, 4), M.orichalcum, [-0.07, 0.03, 0.10], [0.2, 0, 0.28], [1, 1, 1], enableShadows);
  sculpt(heroCrown, new THREE.ConeGeometry(0.018, 0.10, 4), M.orichalcum, [0.07, 0.03, 0.10], [0.2, 0, -0.28], [1, 1, 1], enableShadows);
  heroCrown.visible = false;
  heroParts.push(heroCrown);

  // Braços
  function createAtlanteanArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const armX = isFemale ? 0.295 : 0.345;
    const arm = group(torso, s * armX, 0.32, -0.005);

    const upperR = isFemale ? 0.056 : 0.068;
    sculpt(arm, new THREE.SphereGeometry(upperR * 1.15, 14, 14), M.skin, [0, -0.01, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(arm, new THREE.CylinderGeometry(upperR, upperR * 0.88, 0.26, 14), M.skin, [s * 0.015, -0.15, 0], [0, 0, s * 0.06], [1, 1, 1], enableShadows);
    sculpt(arm, new THREE.SphereGeometry(upperR * 0.88, 12, 12), M.skin, [s * 0.025, -0.28, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const gaiaShoulder = group(arm, s * 0.015, 0.01, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      sculpt(gaiaShoulder, new THREE.DodecahedronGeometry(0.032, 0), M.foliage, [Math.cos(a) * upperR * 1.15, 0.01, Math.sin(a) * upperR * 1.15], [0, 0, 0], [1, 1, 1], enableShadows);
    }
    sculpt(gaiaShoulder, new THREE.OctahedronGeometry(0.024, 0), M.divineGlow, [s * 0.03, 0.045, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    godAdornments.gaia.push(gaiaShoulder);

    const heroPauldron = sculpt(arm, new THREE.SphereGeometry(0.115, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), M.orichalcum, [s * 0.015, 0.025, 0], [0, 0, s * -0.32], [1.1, 0.75, 1.12], enableShadows);
    heroPauldron.visible = false;
    heroParts.push(heroPauldron);

    const elbow = group(arm, s * 0.03, -0.30, 0);
    const foreRTop = isFemale ? 0.052 : 0.062;
    const foreRBot = isFemale ? 0.038 : 0.045;
    sculpt(elbow, new THREE.CylinderGeometry(foreRTop, foreRBot, 0.28, 14), M.skin, [0, -0.14, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    const kBracelet = sculpt(elbow, new THREE.CylinderGeometry(foreRBot * 1.16, foreRBot * 1.12, 0.065, 12), M.slateStone, [0, -0.22, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    const kBraceletTrim = sculpt(elbow, new THREE.TorusGeometry(foreRBot * 1.16, 0.007, 6, 16), M.orichalcum, [0, -0.19, 0], [Math.PI / 2, 0, 0], [1, 1, 1], enableShadows);
    godAdornments.kronos.push(kBracelet, kBraceletTrim);

    const oWristRing = sculpt(elbow, new THREE.TorusGeometry(foreRBot * 1.22, 0.009, 8, 20), M.divineGlow, [0, -0.22, 0], [Math.PI / 2, 0, 0], [1, 1, 1], enableShadows);
    godAdornments.oranos.push(oWristRing);

    const gBracelet = group(elbow, 0, -0.22, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      sculpt(gBracelet, new THREE.DodecahedronGeometry(0.022, 0), M.foliage, [Math.cos(a) * foreRBot * 1.18, 0, Math.sin(a) * foreRBot * 1.18], [0, 0, 0], [1, 1, 1], enableShadows);
    }
    godAdornments.gaia.push(gBracelet);

    const hand = group(elbow, 0, -0.29, 0);
    sculpt(hand, new THREE.BoxGeometry(0.052, 0.064, 0.026), M.skin, [0, -0.015, 0], [0, 0, 0], [1, 1, 1], enableShadows);

    return { arm, elbow, hand };
  }

  const rightArm = createAtlanteanArm(true);
  const leftArm = createAtlanteanArm(false);

  // Ferramentas de Trabalho Atlantes
  const tools = {} as AtlanteanCitizenInstance['tools'];
  const axe = group(rightArm.hand, 0, -0.025, 0.02);
  axe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(axe, new THREE.CylinderGeometry(0.015, 0.017, 0.92, 10), M.wood, [0, 0.28, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(axe, new THREE.BoxGeometry(0.03, 0.14, 0.20), M.toolMetal, [0, 0.66, 0.07], [0, 0, 0], [1, 1, 1], enableShadows);
  tools.axe = axe;

  const pickaxe = group(rightArm.hand, 0, -0.025, 0.02);
  pickaxe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.015, 0.017, 0.92, 10), M.wood, [0, 0.28, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.024, 0.024, 0.08, 10), M.toolMetal, [0, 0.68, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.ConeGeometry(0.024, 0.24, 5), M.toolMetal, [0, 0.68, 0.13], [Math.PI / 2 + 0.18, 0, 0], [1, 1, 1], enableShadows);
  sculpt(pickaxe, new THREE.ConeGeometry(0.024, 0.24, 5), M.toolMetal, [0, 0.68, -0.13], [-Math.PI / 2 - 0.18, 0, 0], [1, 1, 1], enableShadows);
  tools.pickaxe = pickaxe;

  const hammer = group(rightArm.hand, 0, -0.025, 0.02);
  hammer.rotation.set(Math.PI / 2, 0, 0);
  sculpt(hammer, new THREE.CylinderGeometry(0.014, 0.016, 0.56, 10), M.wood, [0, 0.18, 0], [0, 0, 0], [1, 1, 1], enableShadows);
  sculpt(hammer, new THREE.CylinderGeometry(0.038, 0.038, 0.18, 12), M.toolMetal, [0, 0.42, 0], [Math.PI / 2, 0, 0], [1, 1, 1], enableShadows);
  tools.hammer = hammer;

  const basket = group(leftArm.hand, 0, -0.04, 0.06);
  sculpt(basket, new THREE.CylinderGeometry(0.18, 0.12, 0.20, 18), M.leather, [0, -0.04, 0.06], [0.25, 0, 0], [1, 1, 1], enableShadows);
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
  tools.basket = basket;

  const heroGroundAura = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.68, 36),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  heroGroundAura.rotation.x = -Math.PI / 2;
  heroGroundAura.position.y = 0.025;
  heroGroundAura.visible = false;
  root.add(heroGroundAura);

  const godFootAura = new THREE.Mesh(
    new THREE.RingGeometry(0.24, 0.34, 32),
    new THREE.MeshBasicMaterial({
      color: theme.ringHex,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  godFootAura.rotation.x = -Math.PI / 2;
  godFootAura.position.y = 0.012;
  root.add(godFootAura);

  function setToolMode(act: AtlanteanAction) {
    tools.axe.visible = act === 'madeira';
    tools.pickaxe.visible = act === 'ouro';
    tools.hammer.visible = act === 'construir';
    tools.basket.visible = act === 'fruta';
  }
  setToolMode('vigilia');

  function setHeroState(isHero: boolean) {
    heroParts.forEach(p => { p.visible = isHero; });
    heroGroundAura.visible = isHero;
    oranosWings.scale.setScalar(isHero ? 1.55 : 1.0);

    M.skin.emissiveIntensity = isHero ? 0.28 : 0.0;
    M.tunic.emissiveIntensity = isHero ? 0.35 : 0.0;
    M.sash.emissiveIntensity = isHero ? 0.32 : 0.0;
    M.orichalcum.emissiveIntensity = isHero ? 0.75 : 0.15;
    M.toolMetal.emissiveIntensity = isHero ? 0.65 : 0.10;
    M.eyeIris.emissiveIntensity = isHero ? 2.4 : 0.0;
  }

  function applyGodTheme(godKey: string) {
    const next = ATLANTEAN_GOD_THEMES[godKey] || ATLANTEAN_GOD_THEMES.kronos;
    M.sash.color.setHex(next.sashHex);
    M.orichalcum.color.setHex(next.accentHex);
    M.toolMetal.color.setHex(next.toolMetalHex);
    M.divineGlow.emissive.setHex(next.ringHex);
    godFootAura.material.color.setHex(next.ringHex);

    Object.keys(godAdornments).forEach(k => {
      const active = (k === godKey);
      godAdornments[k].forEach(obj => { obj.visible = active; });
    });

    if (M.tunic.map) M.tunic.map.dispose();
    M.tunic.map = createAtlanteanClothTexture(next);
    M.tunic.needsUpdate = true;
  }

  applyGodTheme(initialGod);

  return {
    root, body, torso, head, legs,
    rightArm, leftArm, tools, heroGroundAura, godFootAura,
    kronosBackHalo, oranosWings,
    setToolMode, setHeroState, applyGodTheme,
    isFemale, heightScale, baseBodyY
  };
}

/* ==========================================================================
   4. CONSTRUÇÃO DA LHAMA DE CARGA ATLANTE
   ========================================================================== */
export interface AtlanteanLlamaInstance {
  root: THREE.Group;
  body: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  legs: Array<{ pivot: THREE.Group; phase: number }>;
  kBackRing?: THREE.Mesh;
  baseBodyY?: number;
  applyGodTheme: (godKey: string) => void;
}

export function buildAtlanteanLlama(
  initialGod: string = 'kronos',
  enableShadows = true
): AtlanteanLlamaInstance {
  const theme = ATLANTEAN_GOD_THEMES[initialGod] || ATLANTEAN_GOD_THEMES.kronos;

  const M = {
    wool: new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.88 }),
    faceSkin: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 }),
    blanket: new THREE.MeshStandardMaterial({ color: theme.llamaBlanket, roughness: 0.58 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.88, roughness: 0.22 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.75 }),
    hoof: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }),
    foliage: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 }),
    pearlWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28 }),
    divineGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.ringHex,
      emissiveIntensity: 2.1,
      roughness: 0.15
    })
  };

  const root = new THREE.Group();
  const baseBodyY = 0.82;
  const body = group(root, 0, baseBodyY, 0);
  const llamaGodParts: Record<string, THREE.Object3D[]> = { kronos: [], oranos: [], gaia: [] };

  // Tronco fofo de lã da Lhama construído com Cylinder + Sphere (compatível r128)
  sculpt(body, new THREE.CylinderGeometry(0.24, 0.24, 0.62, 18), M.wool, [0, 0, 0], [Math.PI / 2, 0, 0], [0.95, 1.0, 1.05], enableShadows);
  sculpt(body, new THREE.SphereGeometry(0.24, 18, 16), M.wool, [0, 0, 0.31], [0, 0, 0], [0.95, 1.05, 1.0], enableShadows);
  sculpt(body, new THREE.SphereGeometry(0.24, 18, 16), M.wool, [0, 0, -0.31], [0, 0, 0], [0.95, 1.05, 1.0], enableShadows);

  sculpt(body, new THREE.ConeGeometry(0.07, 0.22, 8), M.wool, [0, 0.08, -0.45], [-2.3, 0, 0], [1, 1, 1], enableShadows);
  sculpt(body, new THREE.CylinderGeometry(0.255, 0.255, 0.44, 18, 1, true, -Math.PI * 0.75, Math.PI * 1.5), M.blanket, [0, 0.02, 0], [0, 0, Math.PI / 2], [1, 1, 1], enableShadows);

  // Kronos: Anel temporal sobre o dorso da Lhama
  const kBackRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.013, 8, 28), M.divineGlow);
  kBackRing.rotation.x = Math.PI / 2;
  kBackRing.position.set(0, 0.34, -0.02);
  body.add(kBackRing);
  llamaGodParts.kronos.push(kBackRing);

  for (const side of [-1, 1] as const) {
    sculpt(body, new THREE.BoxGeometry(0.14, 0.24, 0.30), M.leather, [side * 0.28, -0.02, -0.02], [0, 0, side * -0.12], [1, 1, 1], enableShadows);
    sculpt(body, new THREE.BoxGeometry(0.15, 0.04, 0.31), M.gold, [side * 0.28, 0.06, -0.02], [0, 0, side * -0.12], [1, 1, 1], enableShadows);

    const kStar = sculpt(body, new THREE.OctahedronGeometry(0.036, 0), M.divineGlow, [side * 0.355, -0.02, -0.02], [0, 0, 0], [1, 1, 1], enableShadows);
    llamaGodParts.kronos.push(kStar);

    const oWing = group(body, side * 0.35, 0.04, -0.02);
    sculpt(oWing, new THREE.BoxGeometry(0.03, 0.07, 0.28), M.gold, [0, 0.03, -0.04], [0.22, 0, side * -0.25], [1, 1, 1], enableShadows);
    sculpt(oWing, new THREE.BoxGeometry(0.025, 0.05, 0.22), M.pearlWhite, [side * 0.01, -0.01, -0.06], [0.15, 0, side * -0.20], [1, 1, 1], enableShadows);
    llamaGodParts.oranos.push(oWing);

    const gSprout = group(body, side * 0.28, 0.11, -0.02);
    sculpt(gSprout, new THREE.DodecahedronGeometry(0.045, 0), M.foliage, [0, 0.02, 0.04], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(gSprout, new THREE.DodecahedronGeometry(0.038, 0), M.foliage, [0, 0.03, -0.05], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(gSprout, new THREE.OctahedronGeometry(0.028, 0), M.divineGlow, [0, 0.065, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    llamaGodParts.gaia.push(gSprout);
  }

  const neck = group(body, 0, 0.14, 0.36);
  sculpt(neck, new THREE.CylinderGeometry(0.11, 0.16, 0.58, 16), M.wool, [0, 0.26, 0.06], [0.22, 0, 0], [1, 1, 1], enableShadows);
  const neckCollar = new THREE.TorusGeometry(0.135, 0.016, 8, 22);
  neckCollar.rotateX(Math.PI / 2);
  sculpt(neck, neckCollar, M.gold, [0, 0.24, 0.06], [0.22, 0, 0], [1, 1, 1], enableShadows);

  const oChestSun = sculpt(neck, new THREE.OctahedronGeometry(0.038, 0), M.divineGlow, [0, 0.20, 0.19], [0, 0, 0], [1, 1, 1], enableShadows);
  llamaGodParts.oranos.push(oChestSun);

  const gGarland = group(neck, 0, 0.24, 0.06);
  gGarland.rotation.x = 0.22;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sculpt(gGarland, new THREE.DodecahedronGeometry(0.032, 0), M.foliage, [Math.cos(a) * 0.148, 0, Math.sin(a) * 0.148], [0, 0, 0], [1, 1, 1], enableShadows);
    if (i % 2 === 0) {
      sculpt(gGarland, new THREE.OctahedronGeometry(0.020, 0), M.divineGlow, [Math.cos(a) * 0.165, 0.01, Math.sin(a) * 0.165], [0, 0, 0], [1, 1, 1], enableShadows);
    }
  }
  llamaGodParts.gaia.push(gGarland);

  const head = group(neck, 0, 0.54, 0.14);
  sculpt(head, new THREE.SphereGeometry(0.125, 16, 16), M.wool, [0, 0, 0], [0, 0, 0], [0.85, 0.95, 1.15], enableShadows);
  sculpt(head, new THREE.CylinderGeometry(0.055, 0.075, 0.16, 12), M.faceSkin, [0, -0.02, 0.14], [Math.PI / 2, 0, 0], [1, 1, 1], enableShadows);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 });
  for (const side of [-1, 1] as const) {
    sculpt(head, new THREE.SphereGeometry(0.018, 10, 10), eyeMat, [side * 0.078, 0.025, 0.06], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(head, new THREE.ConeGeometry(0.026, 0.18, 6), M.faceSkin, [side * 0.062, 0.14, -0.02], [-0.15, 0, side * -0.18], [1, 1, 1], enableShadows);
  }

  const legs: Array<{ pivot: THREE.Group; phase: number }> = [];
  const legCoords: [number, number, number][] = [
    [-0.13, -0.14, 0.28],
    [0.13, -0.14, 0.28],
    [-0.13, -0.14, -0.28],
    [0.13, -0.14, -0.28]
  ];
  legCoords.forEach(([lx, ly, lz], idx) => {
    const legPivot = group(body, lx, ly, lz);
    sculpt(legPivot, new THREE.CylinderGeometry(0.068, 0.044, 0.36, 12), M.wool, [0, -0.18, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(legPivot, new THREE.CylinderGeometry(0.042, 0.036, 0.30, 10), M.faceSkin, [0, -0.48, 0], [0, 0, 0], [1, 1, 1], enableShadows);
    sculpt(legPivot, new THREE.CylinderGeometry(0.040, 0.044, 0.06, 10), M.hoof, [0, -0.65, 0.01], [0, 0, 0], [1, 1, 1], enableShadows);
    legs.push({ pivot: legPivot, phase: (idx === 0 || idx === 3) ? 0 : Math.PI });
  });

  function applyGodTheme(godKey: string) {
    const next = ATLANTEAN_GOD_THEMES[godKey] || ATLANTEAN_GOD_THEMES.kronos;
    M.blanket.color.setHex(next.llamaBlanket);
    M.divineGlow.emissive.setHex(next.ringHex);
    Object.keys(llamaGodParts).forEach(k => {
      const active = (k === godKey);
      llamaGodParts[k].forEach(obj => { obj.visible = active; });
    });
  }

  applyGodTheme(initialGod);

  return { root, body, neck, head, legs, applyGodTheme, baseBodyY, kBackRing };
}
