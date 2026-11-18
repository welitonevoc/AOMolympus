import * as THREE from 'three';

export interface NorseGodTheme {
  id: 'odin' | 'thor' | 'loki' | 'freyr';
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
  furHex: number;
  accentHex: number;
  toolMetalHex: number;
  sparkHex: number;
  maleHair: number;
  femaleHair: number;
  dwarfHair: number;
}

export const NORSE_GOD_THEMES: Record<string, NorseGodTheme> = {
  odin: {
    id: 'odin',
    title: 'Coletores Nórdicos & Anão de Odin',
    subtitle: 'Túnicas de lã azul-real de Valhalla, peles de lobo cinzento, detalhes dourados e o Anão mestre da mineração',
    bgHex: 0x0c192c,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    ringHex: 0x38bdf8,
    tunicBase: '#1e3a8a',
    tunicStripe: '#0f172a',
    tunicTrim: '#facc15',
    furHex: 0x64748b,
    accentHex: 0xfacc15,
    toolMetalHex: 0x94a3b8,
    sparkHex: 0x7dd3fc,
    maleHair: 0xb45309,
    femaleHair: 0xfacc15,
    dwarfHair: 0x9a3412
  },
  thor: {
    id: 'thor',
    title: 'Coletores Nórdicos & Anão de Thor',
    subtitle: 'Vestes em vermelho-trovão de Midgard com peles marrons de urso, fivelas de bronze e ferro rúnico',
    bgHex: 0x1c0f0d,
    hemiSky: 0xfef3c7,
    hemiGround: 0x7f1d1d,
    rimHex: 0xf97316,
    ringHex: 0xf59e0b,
    tunicBase: '#7f1d1d',
    tunicStripe: '#450a0a',
    tunicTrim: '#f59e0b',
    furHex: 0x5c3317,
    accentHex: 0xf59e0b,
    toolMetalHex: 0xcbd5e1,
    sparkHex: 0xfef08a,
    maleHair: 0xd97706,
    femaleHair: 0xb45309,
    dwarfHair: 0x78350f
  },
  loki: {
    id: 'loki',
    title: 'Coletores Nórdicos & Anão de Loki',
    subtitle: 'Túnicas verde-floresta de Jotunheim com bordados rúnicos em bronze e peles escuras das montanhas',
    bgHex: 0x071914,
    hemiSky: 0xd1fae5,
    hemiGround: 0x064e3b,
    rimHex: 0x10b981,
    ringHex: 0x10b981,
    tunicBase: '#065f46',
    tunicStripe: '#022c22',
    tunicTrim: '#34d399',
    furHex: 0x334155,
    accentHex: 0xd97706,
    toolMetalHex: 0x94a3b8,
    sparkHex: 0x6ee7b7,
    maleHair: 0x27272a,
    femaleHair: 0x9a3412,
    dwarfHair: 0x1f2937
  },
  freyr: {
    id: 'freyr',
    title: 'Coletores Nórdicos & Anão de Freyr',
    subtitle: 'Vestes em dourado-trigo e verde-bosque de Alfheim com peles claras de cervo e ouro da colheita',
    bgHex: 0x161b0c,
    hemiSky: 0xfef9c3,
    hemiGround: 0x3f6212,
    rimHex: 0xfacc15,
    ringHex: 0xa3e635,
    tunicBase: '#a16207',
    tunicStripe: '#365314',
    tunicTrim: '#fef08a',
    furHex: 0xd6d3d1,
    accentHex: 0xfacc15,
    toolMetalHex: 0xfde047,
    sparkHex: 0xfef08a,
    maleHair: 0xeab308,
    femaleHair: 0xfef08a,
    dwarfHair: 0xb45309
  }
};

export function createNorseWoolTexture(theme: NorseGodTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = theme.tunicBase;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let x = 0; x < 512; x += 6) ctx.fillRect(x, 0, 2, 256);
    for (let y = 0; y < 256; y += 6) ctx.fillRect(0, y, 512, 2);

    ctx.fillStyle = theme.tunicStripe;
    ctx.fillRect(0, 194, 512, 42);
    ctx.fillStyle = theme.tunicTrim;
    ctx.fillRect(0, 190, 512, 4);
    ctx.fillRect(0, 236, 512, 4);

    ctx.strokeStyle = theme.tunicTrim;
    ctx.lineWidth = 3;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 16, 200);
      ctx.lineTo(x + 26, 215);
      ctx.lineTo(x + 16, 230);
      ctx.lineTo(x + 6, 215);
      ctx.closePath();
      ctx.moveTo(x + 16, 200);
      ctx.lineTo(x + 16, 230);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSnowArenaTexture(theme: NorseGodTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 3200; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(248, 250, 252, 0.45)' : 'rgba(71, 85, 105, 0.22)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 12, 12);
    }

    const cx = 512, cy = 512;
    ctx.strokeStyle = theme.tunicBase;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 420, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = theme.tunicTrim;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy, 436, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = theme.tunicBase;
    ctx.lineWidth = 8;
    for (let t = 0; t < 3; t++) {
      const rot = (t / 3) * Math.PI * 2;
      ctx.beginPath();
      for (let v = 0; v < 3; v++) {
        const a = rot + (v / 3) * Math.PI * 2;
        const px = cx + Math.cos(a) * 145;
        const py = cy + Math.sin(a) * 145;
        if (v === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type NorseWorkerRole = 'homem' | 'mulher' | 'anao';
export type NorseWorkerTask = 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir';

export interface NorseWorkerInstance {
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
  setToolMode: (act: NorseWorkerTask) => void;
  applyGodTheme: (godKey: string) => void;
  role: NorseWorkerRole;
  isFemale: boolean;
  isDwarf: boolean;
  baseHipY: number;
}

export function buildNorseWorker(
  role: NorseWorkerRole,
  initialGod: string = 'odin',
  highQuality: boolean = true
): NorseWorkerInstance {
  const theme = NORSE_GOD_THEMES[initialGod] || NORSE_GOD_THEMES.odin;
  const isFemale = role === 'mulher';
  const isDwarf = role === 'anao';

  const hairHex = isDwarf ? theme.dwarfHair : (isFemale ? theme.femaleHair : theme.maleHair);
  const skinHex = isDwarf ? 0xd99b72 : (isFemale ? 0xedd0be : 0xdfb193);

  const M = {
    skin: new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.46, metalness: 0.04 }),
    hair: new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.62 }),
    tunic: new THREE.MeshStandardMaterial({
      map: createNorseWoolTexture(theme),
      roughness: 0.68,
      side: THREE.DoubleSide
    }),
    fur: new THREE.MeshStandardMaterial({ color: theme.furHex, roughness: 0.85 }),
    pants: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.72 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.72 }),
    accent: new THREE.MeshStandardMaterial({ color: theme.accentHex, metalness: 0.86, roughness: 0.24 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b3818, roughness: 0.65 }),
    toolMetal: new THREE.MeshStandardMaterial({ color: theme.toolMetalHex, metalness: 0.88, roughness: 0.22 }),
    lipMat: new THREE.MeshStandardMaterial({ color: isFemale ? 0xc86d6d : 0xa86454, roughness: 0.45 }),
    eyeIris: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
  };

  const root = new THREE.Group();

  function grp(parent: THREE.Group | null, x = 0, y = 0, z = 0): THREE.Group {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    if (parent) parent.add(g);
    return g;
  }

  function sculpt(
    parent: THREE.Group | null,
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
    if (highQuality) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    if (parent) parent.add(m);
    return m;
  }

  const scaleY = isDwarf ? 0.72 : (isFemale ? 0.95 : 1.02);
  const scaleXZ = isDwarf ? 1.18 : (isFemale ? 0.94 : 1.0);
  const baseHipY = 1.00 * scaleY;

  const body = grp(root, 0, baseHipY, 0);
  body.scale.set(scaleXZ, scaleY, scaleXZ);

  // Pelve
  const pelvis = grp(body, 0, 0.88, 0);
  const hipWidth = isFemale ? 1.08 : (isDwarf ? 1.16 : 0.98);
  sculpt(pelvis, new THREE.SphereGeometry(0.195, 18, 16), M.pants, [0, 0, 0], [0, 0, 0], [hipWidth, 0.78, 0.84]);

  // Pernas
  const legs = {} as {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  const legSpread = isFemale ? 0.125 : (isDwarf ? 0.15 : 0.135);
  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = grp(pelvis, s * legSpread, -0.04, 0);

    const thighRTop = isFemale ? 0.106 : (isDwarf ? 0.128 : 0.114);
    const thighRBot = isFemale ? 0.078 : (isDwarf ? 0.096 : 0.084);
    sculpt(hip, new THREE.CylinderGeometry(thighRTop, thighRBot, 0.48, 16), M.pants, [0, -0.23, 0]);
    sculpt(hip, new THREE.SphereGeometry(thighRBot * 1.02, 12, 12), M.pants, [0, -0.47, 0.01]);

    const knee = grp(hip, 0, -0.48, 0);
    const calfRTop = isFemale ? 0.076 : (isDwarf ? 0.092 : 0.082);
    const calfRBot = isFemale ? 0.052 : (isDwarf ? 0.064 : 0.056);
    sculpt(knee, new THREE.CylinderGeometry(calfRTop, calfRBot, 0.44, 16), M.leather, [0, -0.22, 0]);
    const bootFur = new THREE.TorusGeometry(calfRTop * 1.05, 0.022, 8, 20);
    bootFur.rotateX(Math.PI / 2);
    sculpt(knee, bootFur, M.fur, [0, -0.06, 0]);

    const ankle = grp(knee, 0, -0.44, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.092, 0.055, 0.21), M.leather, [0, -0.022, 0.036]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
  legs.L.knee.rotation.set(0.16, 0, 0);
  legs.R.hip.rotation.set(0.10, 0.08, 0.04);
  legs.R.knee.rotation.set(0.14, 0, 0);

  // Tronco
  const torso = grp(body, 0, 1.28, 0);
  const shoulderW = isFemale ? 0.255 : (isDwarf ? 0.345 : 0.305);
  const waistW = isFemale ? 0.178 : (isDwarf ? 0.255 : 0.210);

  const tunicPts = [
    new THREE.Vector2(0.01, -0.38),
    new THREE.Vector2(0.22, -0.34),
    new THREE.Vector2(waistW + 0.018, -0.15),
    new THREE.Vector2(waistW + 0.045, 0.05),
    new THREE.Vector2(shoulderW + 0.018, 0.27),
    new THREE.Vector2(shoulderW * 0.78, 0.38),
    new THREE.Vector2(0.14, 0.39),
    new THREE.Vector2(0.01, 0.39)
  ];
  sculpt(torso, new THREE.LatheGeometry(tunicPts, 32), M.tunic, [0, 0.01, 0], [0, 0, 0], [1.10, 1.0, 0.78]);

  // Gola de pele de lobo
  const furCollar = new THREE.TorusGeometry(shoulderW * 0.72, 0.045, 10, 28);
  furCollar.rotateX(Math.PI / 2);
  sculpt(torso, furCollar, M.fur, [0, 0.38, 0.0], [0.14, 0, 0], [1.18, 1, 0.88]);

  if (isFemale) {
    for (const side of [-1, 1]) {
      sculpt(torso, new THREE.SphereGeometry(0.028, 12, 12), M.accent, [side * 0.11, 0.22, 0.17], [0, 0, 0], [0.85, 1.25, 0.45]);
    }
  }

  // Cinto de couro
  const belt = new THREE.TorusGeometry(waistW + 0.03, 0.028, 10, 28);
  belt.rotateX(Math.PI / 2);
  sculpt(torso, belt, M.leather, [0, -0.16, 0.005], [0.04, 0, 0], [1.12, 1, 0.82]);
  sculpt(torso, new THREE.CylinderGeometry(0.036, 0.036, 0.018, 14), M.accent, [0, -0.16, (waistW + 0.03) * 0.84], [Math.PI / 2, 0, 0]);

  // Saiote / Túnica inferior
  const skirtH = isFemale ? 0.94 : 0.54;
  const skirtBotR = isFemale ? 0.34 : (isDwarf ? 0.38 : 0.35);
  const skirtY = isFemale ? -0.62 : -0.42;
  const skirtGeo = new THREE.CylinderGeometry(waistW + 0.02, skirtBotR, skirtH, 36, 12, true);
  const skPos = skirtGeo.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    const x = skPos.getX(i);
    const y = skPos.getY(i);
    const z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (skirtH * 0.5 - y) / skirtH));
    const pleat = Math.sin(angle * 16) * 0.018 * (0.2 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    skPos.setXYZ(i, Math.cos(angle) * r * 1.05, y, Math.sin(angle) * r * 0.85);
  }
  skirtGeo.computeVertexNormals();
  sculpt(torso, skirtGeo, M.tunic, [0, skirtY, 0], [0.02, 0, 0]);

  // Pescoço e Cabeça
  sculpt(torso, new THREE.CylinderGeometry(0.085, 0.108, 0.20, 16), M.skin, [0, 0.48, -0.005], [0.05, 0, 0]);

  const head = grp(torso, 0, 0.68, 0.025);
  if (isDwarf) {
    head.scale.set(0.92, 1.24, 0.92);
  }
  const headScaleX = isFemale ? 0.88 : (isDwarf ? 1.02 : 0.94);
  sculpt(head, new THREE.SphereGeometry(0.172, 28, 28), M.skin, [0, 0, 0], [0, 0, 0], [headScaleX, 1.12, 0.98]);

  const noseW = isDwarf ? 0.032 : 0.020;
  sculpt(head, new THREE.BoxGeometry(noseW, 0.068, 0.038), M.skin, [0, 0.005, 0.164], [-0.12, 0, 0]);
  if (isDwarf) {
    sculpt(head, new THREE.SphereGeometry(0.026, 12, 12), M.skin, [0, -0.025, 0.180]);
  }
  sculpt(head, new THREE.BoxGeometry(0.038, 0.012, 0.018), M.lipMat, [0, -0.068, 0.158]);

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  for (const side of [-1, 1]) {
    sculpt(head, new THREE.SphereGeometry(0.019, 12, 12), eyeWhiteMat, [side * 0.050, 0.022, 0.152], [0, 0, 0], [1.15, 0.72, 0.75]);
    sculpt(head, new THREE.SphereGeometry(0.011, 10, 10), M.eyeIris, [side * 0.050, 0.022, 0.162]);
    sculpt(head, new THREE.BoxGeometry(0.048, 0.008, 0.015), M.hair, [side * 0.050, 0.044, 0.158], [0, 0, side * -0.08]);
  }

  sculpt(head, new THREE.SphereGeometry(0.182, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62), M.hair, [0, 0.028, -0.01], [-0.12, 0, 0], [headScaleX * 1.04, 1.06, 1.04]);

  if (isFemale) {
    for (const side of [-1, 1]) {
      const braidCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.13, 0.04, 0.04),
        new THREE.Vector3(side * 0.16, -0.14, 0.10),
        new THREE.Vector3(side * 0.14, -0.34, 0.12)
      ]);
      sculpt(head, new THREE.TubeGeometry(braidCurve, 12, 0.022, 8, false), M.hair);
      sculpt(head, new THREE.CylinderGeometry(0.024, 0.024, 0.022, 10), M.accent, [side * 0.14, -0.32, 0.12]);
    }
    const circlet = new THREE.TorusGeometry(0.168, 0.009, 8, 32);
    circlet.rotateX(Math.PI / 2);
    sculpt(head, circlet, M.accent, [0, 0.095, 0.005], [0.20, 0, 0], [0.92, 1, 1.02]);
  } else if (isDwarf) {
    sculpt(head, new THREE.SphereGeometry(0.188, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), M.leather, [0, 0.04, -0.005], [-0.1, 0, 0], [1.06, 1.05, 1.06]);
    const capRim = new THREE.TorusGeometry(0.184, 0.018, 8, 28);
    capRim.rotateX(Math.PI / 2);
    sculpt(head, capRim, M.fur, [0, 0.06, 0.005], [0.12, 0, 0], [1.06, 1, 1.06]);

    sculpt(head, new THREE.CapsuleGeometry(0.024, 0.075, 8, 10), M.hair, [-0.045, -0.055, 0.172], [0.1, 0.3, 1.2]);
    sculpt(head, new THREE.CapsuleGeometry(0.024, 0.075, 8, 10), M.hair, [0.045, -0.055, 0.172], [0.1, -0.3, -1.2]);

    for (const side of [-1, 1]) {
      sculpt(head, new THREE.ConeGeometry(0.055, 0.42, 10), M.hair, [side * 0.055, -0.24, 0.145], [Math.PI - 0.12, 0, side * 0.08]);
      sculpt(head, new THREE.CylinderGeometry(0.032, 0.028, 0.035, 12), M.accent, [side * 0.068, -0.32, 0.155], [-0.12, 0, side * 0.08]);
    }
  } else {
    sculpt(head, new THREE.ConeGeometry(0.11, 0.24, 12), M.hair, [0, -0.15, 0.13], [Math.PI - 0.15, 0, 0], [1.1, 1, 0.75]);
    for (const side of [-1, 1]) {
      sculpt(head, new THREE.CapsuleGeometry(0.025, 0.16, 8, 10), M.hair, [side * 0.14, -0.08, 0.02], [0.1, 0, side * -0.1]);
    }
  }

  // Braços
  function createArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const armX = isFemale ? 0.295 : (isDwarf ? 0.385 : 0.345);
    const arm = grp(torso, s * armX, 0.32, -0.005);

    const upperR = isFemale ? 0.058 : (isDwarf ? 0.085 : 0.070);
    sculpt(arm, new THREE.SphereGeometry(upperR * 1.15, 14, 14), M.tunic, [0, -0.01, 0]);
    sculpt(arm, new THREE.CapsuleGeometry(upperR, 0.24, 10, 14), M.tunic, [s * 0.015, -0.15, 0], [0, 0, s * 0.06]);

    const elbow = grp(arm, s * 0.03, -0.30, 0);
    const foreRTop = isFemale ? 0.052 : (isDwarf ? 0.076 : 0.062);
    const foreRBot = isFemale ? 0.038 : (isDwarf ? 0.056 : 0.045);
    sculpt(elbow, new THREE.CylinderGeometry(foreRTop, foreRBot, 0.28, 14), M.skin, [0, -0.14, 0]);

    const bracer = new THREE.CylinderGeometry(foreRBot * 1.15, foreRBot * 1.08, 0.09, 16, 1, true);
    sculpt(elbow, bracer, M.leather, [0, -0.22, 0]);

    const hand = grp(elbow, 0, -0.29, 0);
    sculpt(hand, new THREE.BoxGeometry(0.054, 0.066, 0.028), M.skin, [0, -0.015, 0]);

    return { arm, elbow, hand };
  }

  const rightArm = createArm(true);
  const leftArm = createArm(false);

  // Ferramentas
  const axe = grp(rightArm.hand, 0, -0.025, 0.02);
  axe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(axe, new THREE.CylinderGeometry(0.016, 0.018, 0.96, 10), M.wood, [0, 0.28, 0]);
  sculpt(axe, new THREE.BoxGeometry(0.032, 0.16, 0.22), M.toolMetal, [0, 0.68, 0.08]);
  sculpt(axe, new THREE.BoxGeometry(0.012, 0.22, 0.07), M.accent, [0, 0.68, 0.18]);

  const pickaxe = grp(rightArm.hand, 0, -0.025, 0.02);
  pickaxe.rotation.set(Math.PI / 2, 0, 0);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.016, 0.018, 0.94, 10), M.wood, [0, 0.28, 0]);
  sculpt(pickaxe, new THREE.CylinderGeometry(0.028, 0.028, 0.09, 10), isDwarf ? M.accent : M.toolMetal, [0, 0.68, 0]);
  sculpt(pickaxe, new THREE.ConeGeometry(0.026, 0.26, 5), M.toolMetal, [0, 0.68, 0.14], [Math.PI / 2 + 0.18, 0, 0]);
  sculpt(pickaxe, new THREE.ConeGeometry(0.026, 0.26, 5), M.toolMetal, [0, 0.68, -0.14], [-Math.PI / 2 - 0.18, 0, 0]);

  const hammer = grp(rightArm.hand, 0, -0.025, 0.02);
  hammer.rotation.set(Math.PI / 2, 0, 0);
  sculpt(hammer, new THREE.CylinderGeometry(0.015, 0.017, 0.58, 10), M.wood, [0, 0.18, 0]);
  sculpt(hammer, new THREE.BoxGeometry(0.11, 0.11, 0.20), M.toolMetal, [0, 0.44, 0]);

  const basket = grp(leftArm.hand, 0, -0.04, 0.06);
  sculpt(basket, new THREE.CylinderGeometry(0.18, 0.12, 0.20, 16), M.wood, [0, -0.04, 0.06], [0.25, 0, 0]);
  const berryCols = [0xdc2626, 0x2563eb, 0x7e22ce, 0xf59e0b];
  for (let f = 0; f < 6; f++) {
    const fa = (f / 6) * Math.PI * 2;
    sculpt(
      basket,
      new THREE.SphereGeometry(0.042, 10, 10),
      new THREE.MeshStandardMaterial({ color: berryCols[f % berryCols.length], roughness: 0.35 }),
      [Math.cos(fa) * 0.07, 0.065, 0.085 + Math.sin(fa) * 0.07]
    );
  }

  const tools = { axe, pickaxe, hammer, basket };

  function setToolMode(act: NorseWorkerTask) {
    tools.axe.visible = act === 'madeira';
    tools.pickaxe.visible = act === 'ouro';
    tools.hammer.visible = act === 'construir';
    tools.basket.visible = act === 'fruta';
  }
  setToolMode('vigilia');

  function applyGodTheme(godKey: string) {
    const next = NORSE_GOD_THEMES[godKey.toLowerCase()] || NORSE_GOD_THEMES.odin;
    M.hair.color.setHex(isDwarf ? next.dwarfHair : (isFemale ? next.femaleHair : next.maleHair));
    M.fur.color.setHex(next.furHex);
    M.accent.color.setHex(next.accentHex);
    M.toolMetal.color.setHex(next.toolMetalHex);

    if (M.tunic.map) M.tunic.map.dispose();
    M.tunic.map = createNorseWoolTexture(next);
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
    role,
    isFemale,
    isDwarf,
    baseHipY
  };
}
