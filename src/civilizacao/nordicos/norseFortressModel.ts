import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO VISUAL DAS 4 DIVINDADES NÓRDICAS (ODIN, THOR, LOKI, FREYR)
   ========================================================================== */
export interface NorseFortressTheme {
  id: 'odin' | 'thor' | 'loki' | 'freyr';
  godName: string;
  t3Title: string;
  t3Sub: string;
  t4Title: string;
  t4Sub: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  woodWall: number;
  t4WoodWall: number;
  logTrim: number;
  accentColor: number;    // Azul-real, vermelho-trovão, verde-serpente, verde-bosque
  goldColor: number;
  roofShingleA: string;
  roofShingleB: string;
  statueWood: number;
  glowHex: number;
  spearHex: number;
  groundGrass: string;
  groundDirt: string;
}

export const NORSE_FORTRESS_THEMES: Record<string, NorseFortressTheme> = {
  odin: {
    id: 'odin',
    godName: 'Odin',
    t3Title: 'Hill Fort de Odin • Tier 3 (Era Heroica)',
    t3Sub: 'Salões gêmeos de carvalho com telhas de madeira dourada, cumeeiras azul-real de Valhalla, escudos vikings e aríetes de dragão',
    t4Title: 'Cidadela de Valhalla de Odin • Tier 4 (Era Mítica)',
    t4Sub: 'Fortaleza nórdica monumental de dois andares com passarela elevada, telhados de escamas de madeira, mastros e Guardião Viking esculpido',
    bgHex: 0x0c1829,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    woodWall: 0x9c7448,
    t4WoodWall: 0x8a643c,
    logTrim: 0x5c3e21,
    accentColor: 0x1d4ed8,    // Azul-real nas cumeeiras e estandartes
    goldColor: 0xfacc15,
    roofShingleA: '#b89558',
    roofShingleB: '#7c5d32',
    statueWood: 0xb88b54,
    glowHex: 0x38bdf8,
    spearHex: 0xbae6fd,
    groundGrass: '#4f7a2d',
    groundDirt: '#a8926e'
  },
  thor: {
    id: 'thor',
    godName: 'Thor',
    t3Title: 'Hill Fort de Thor • Tier 3 (Era Heroica)',
    t3Sub: 'Bastião de madeira avermelhada de Midgard, telhas de ferro e carvalho escuro, cumeeiras vermelho-trovão e aríetes dourados',
    t4Title: 'Cidadela do Trovão de Thor • Tier 4 (Era Mítica)',
    t4Sub: 'Fortaleza imperial de dois andares em carvalho escuro e ferro forjado, frisos carmesim, mastros de guerra e Guardião do Trovão',
    bgHex: 0x1a0e0c,
    hemiSky: 0xfef3c7,
    hemiGround: 0x7f1d1d,
    rimHex: 0xf97316,
    woodWall: 0x85583a,
    t4WoodWall: 0x73492f,
    logTrim: 0x451a03,
    accentColor: 0xb91c1c,    // Vermelho-trovão nas cumeeiras e escudos
    goldColor: 0xf59e0b,
    roofShingleA: '#8c6244',
    roofShingleB: '#4a3525',
    statueWood: 0xa67346,
    glowHex: 0xf59e0b,
    spearHex: 0xfef08a,
    groundGrass: '#52732b',
    groundDirt: '#9e825e'
  },
  loki: {
    id: 'loki',
    godName: 'Loki',
    t3Title: 'Hill Fort de Loki • Tier 3 (Era Heroica)',
    t3Sub: 'Forte sombrio das florestas de Jotunheim com madeira envelhecida, cumeeiras verde-serpente, estandartes rúnicos e aríetes de bronze',
    t4Title: 'Cidadela de Jotunheim de Loki • Tier 4 (Era Mítica)',
    t4Sub: 'Complexo de dois andares em madeira escura musgosa, detalhes verde-esmeralda, passarelas elevadas e Guardião Rúnico esculpido',
    bgHex: 0x071713,
    hemiSky: 0xd1fae5,
    hemiGround: 0x064e3b,
    rimHex: 0x10b981,
    woodWall: 0x73634f,
    t4WoodWall: 0x615240,
    logTrim: 0x3b3228,
    accentColor: 0x059669,    // Verde-serpente esmeralda
    goldColor: 0xd97706,
    roofShingleA: '#7a755c',
    roofShingleB: '#474637',
    statueWood: 0x8f7d65,
    glowHex: 0x10b981,
    spearHex: 0x6ee7b7,
    groundGrass: '#3e692c',
    groundDirt: '#8c7d65'
  },
  freyr: {
    id: 'freyr',
    godName: 'Freyr',
    t3Title: 'Hill Fort de Freyr • Tier 3 (Era Heroica)',
    t3Sub: 'Salões nobres de madeira clara de Alfheim com telhas dourado-trigo, cumeeiras verde-bosque solar e aríetes ornamentados',
    t4Title: 'Cidadela Solar de Freyr • Tier 4 (Era Mítica)',
    t4Sub: 'Fortaleza majestosa de dois andares em madeira dourada e bronze polido, frisos verde-oliva e Guardião da Colheita esculpido',
    bgHex: 0x14190c,
    hemiSky: 0xfef9c3,
    hemiGround: 0x3f6212,
    rimHex: 0xfacc15,
    woodWall: 0xb58d52,
    t4WoodWall: 0xa37b42,
    logTrim: 0x6b4c23,
    accentColor: 0x4d7c0f,    // Verde-bosque solar de Alfheim
    goldColor: 0xfacc15,
    roofShingleA: '#d4b46a',
    roofShingleB: '#8f7236',
    statueWood: 0xc99e5b,
    glowHex: 0xa3e635,
    spearHex: 0xfef08a,
    groundGrass: '#5c8529',
    groundDirt: '#b89f6e'
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR (TÁBUAS DE CARVALHO, TELHAS E SOLO)
   ========================================================================== */
export function createNorsePlankTexture(isT4: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isT4 ? '#9e7748' : '#b08856';
  ctx.fillRect(0, 0, 512, 512);

  // Tábuas verticais de carvalho nórdico
  const planks = 16;
  const pW = 512 / planks;
  for (let i = 0; i < planks; i++) {
    const x = i * pW;
    const shade = 165 + Math.floor((Math.random() - 0.5) * 28);
    ctx.fillStyle = `rgba(${shade}, ${Math.floor(shade * 0.76)}, ${Math.floor(shade * 0.48)}, 0.45)`;
    ctx.fillRect(x + 1, 0, pW - 2, 512);

    ctx.strokeStyle = 'rgba(32, 20, 10, 0.52)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Vigas horizontais reforçadas com rebites de ferro
  for (const y of [40, 256, 472]) {
    ctx.fillStyle = 'rgba(55, 35, 18, 0.55)';
    ctx.fillRect(0, y - 14, 512, 28);
    ctx.fillStyle = 'rgba(25, 25, 28, 0.65)';
    for (let rx = 16; rx < 512; rx += 32) {
      ctx.beginPath();
      ctx.arc(rx, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWoodShingleTexture(theme: NorseFortressTheme, isFrost: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isFrost ? '#bae6fd' : theme.roofShingleB;
  ctx.fillRect(0, 0, 512, 512);

  const rows = 14;
  const cols = 12;
  const rH = 512 / rows;
  const cW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rH;
    const offset = r % 2 === 0 ? 0 : cW * 0.5;
    for (let c = -1; c <= cols; c++) {
      const x = c * cW + offset;
      const grad = ctx.createLinearGradient(0, y, 0, y + rH);
      if (isFrost) {
        grad.addColorStop(0, '#f0f9ff');
        grad.addColorStop(0.6, '#7dd3fc');
        grad.addColorStop(1, '#0369a1');
      } else {
        grad.addColorStop(0, theme.roofShingleA);
        grad.addColorStop(0.75, theme.roofShingleB);
        grad.addColorStop(1, '#26170a');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 1, cW - 4, rH - 2);

      ctx.strokeStyle = isFrost ? 'rgba(12, 74, 110, 0.45)' : 'rgba(20, 12, 6, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, cW - 2, rH - 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createNorseGroundTexture(theme: NorseFortressTheme, isFrost: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = theme.groundGrass;
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 6500; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 35, 10, 0.14)';
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 10, 10);
  }

  const cx = 512;
  const cy = 512;
  const dirtGrad = ctx.createRadialGradient(cx, cy, 180, cx, cy, 385);
  dirtGrad.addColorStop(0, isFrost ? '#cbd5e1' : theme.groundDirt);
  dirtGrad.addColorStop(0.76, isFrost ? '#94a3b8' : theme.groundDirt);
  dirtGrad.addColorStop(1, 'rgba(168, 146, 110, 0)');
  ctx.fillStyle = dirtGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Lajes rústicas de pedra no caminho frontal
  ctx.fillStyle = isFrost ? 'rgba(224, 242, 254, 0.7)' : 'rgba(120, 118, 112, 0.55)';
  for (let i = 0; i < 20; i++) {
    const px = cx - 150 + (i % 6) * 50 + (Math.random() - 0.5) * 10;
    const py = cy + 165 + Math.floor(i / 6) * 42 + (Math.random() - 0.5) * 10;
    ctx.fillRect(px, py, 38, 28);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ==========================================================================
   3. HELPERS DE GEOMETRIA E DETALHAMENTO ARQUITETÔNICO
   ========================================================================== */
function group(parent: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

function cyl(
  parent: THREE.Object3D,
  rt: number,
  rb: number,
  h: number,
  segs: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

// Telhado Nórdico de 4 Águas Alongadas com Cumeeira Colorida e Proas de Dragão nos Extremos
function buildNorseLonghouseRoof(
  parent: THREE.Object3D,
  length: number,
  widthBot: number,
  height: number,
  roofMat: THREE.Material,
  logMat: THREE.Material,
  accentMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Group {
  const rGroup = group(parent, pos[0], pos[1], pos[2]);

  const rxB = length * 0.5;
  const rzB = widthBot * 0.5;
  const rxT = length * 0.36;
  const rzT = 0.06;
  const y0 = 0;
  const y1 = height;

  const geom = new THREE.BufferGeometry();
  const verts = new Float32Array([
    // Frente (+Z)
    -rxB, y0, rzB,  rxB, y0, rzB,  rxT, y1, rzT,
    -rxB, y0, rzB,  rxT, y1, rzT, -rxT, y1, rzT,
    // Trás (-Z)
     rxB, y0, -rzB, -rxB, y0, -rzB, -rxT, y1, -rzT,
     rxB, y0, -rzB, -rxT, y1, -rzT,  rxT, y1, -rzT,
    // Esquerda (-X)
    -rxB, y0, -rzB, -rxB, y0, rzB,  -rxT, y1, rzT,
    -rxB, y0, -rzB, -rxT, y1, rzT,  -rxT, y1, -rzT,
    // Direita (+X)
     rxB, y0, rzB,   rxB, y0, -rzB,  rxT, y1, -rzT,
     rxB, y0, rzB,   rxT, y1, -rzT,  rxT, y1, rzT
  ]);
  const uvs = new Float32Array(24 * 2);
  for (let i = 0; i < 24; i++) {
    uvs[i * 2] = (verts[i * 3] + rxB) / length;
    uvs[i * 2 + 1] = verts[i * 3 + 1] / height;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  const roofMesh = new THREE.Mesh(geom, roofMat);
  roofMesh.castShadow = castShadow;
  roofMesh.receiveShadow = true;
  rGroup.add(roofMesh);

  // Viga de cumeeira colorida
  box(rGroup, length * 0.74, 0.12, 0.16, accentMat, [0, y1 + 0.04, 0], [0, 0, 0], castShadow);

  // Proas / Escudos Ornamentais nos dois extremos da cumeeira
  for (const sx of [-1, 1]) {
    const finX = sx * (length * 0.37);
    const finial = group(rGroup, finX, y1 + 0.06, 0);
    box(finial, 0.08, 0.42, 0.12, logMat, [0, 0.18, 0], [0, 0, sx * -0.15], castShadow);
    cyl(finial, 0.14, 0.14, 0.06, 6, accentMat, [sx * 0.03, 0.36, 0], [0, 0, Math.PI / 2], castShadow);
    cyl(finial, 0.15, 0.15, 0.03, 6, goldMat, [sx * 0.03, 0.36, 0], [0, 0, Math.PI / 2], castShadow);
  }

  return rGroup;
}

// Aríete de Cerco Viking com Cabeça de Dragão Dourada
function buildBatteringRam(
  parent: THREE.Object3D,
  logMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Group {
  const ram = group(parent, pos[0], pos[1], pos[2]);
  ram.rotation.set(rot[0], rot[1], rot[2]);

  // Tronco maciço com cintas de ferro/ouro
  cyl(ram, 0.13, 0.14, 1.45, 12, logMat, [0, 0, 0], [0, 0, Math.PI / 2], castShadow);
  for (const rx of [-0.45, -0.10, 0.25]) {
    cyl(ram, 0.145, 0.145, 0.06, 12, goldMat, [rx, 0, 0], [0, 0, Math.PI / 2], castShadow);
  }
  // Cabeça de dragão dourada
  const head = group(ram, 0.82, 0.02, 0);
  box(head, 0.34, 0.22, 0.22, goldMat, [0, 0, 0], [0, 0, 0], castShadow);
  box(head, 0.24, 0.12, 0.18, goldMat, [0.16, 0.04, 0], [0, 0, 0], castShadow);
  box(head, 0.20, 0.07, 0.15, goldMat, [0.14, -0.07, 0], [0, 0, -0.18], castShadow);
  box(head, 0.18, 0.05, 0.04, goldMat, [-0.10, 0.14, 0.08], [0.2, 0, 0.35], castShadow);
  box(head, 0.18, 0.05, 0.04, goldMat, [-0.10, 0.14, -0.08], [-0.2, 0, 0.35], castShadow);

  return ram;
}

// Estátua Guardiã Viking Colossal em Madeira Esculpida e Ouro
function buildNorseGuardianStatue(
  parent: THREE.Object3D,
  woodMat: THREE.Material,
  accentMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  castShadow = true
): THREE.Group {
  const stGroup = group(parent, pos[0], pos[1], pos[2]);
  stGroup.scale.setScalar(scale);

  // Pedestal de tronco esculpido
  cyl(stGroup, 0.38, 0.44, 0.46, 12, woodMat, [0, 0.23, 0], [0, 0, 0], castShadow);
  cyl(stGroup, 0.42, 0.42, 0.10, 12, accentMat, [0, 0.48, 0], [0, 0, 0], castShadow);
  cyl(stGroup, 0.40, 0.40, 0.06, 12, goldMat, [0, 0.56, 0], [0, 0, 0], castShadow);

  const fig = group(stGroup, 0, 0.60, 0);
  box(fig, 0.16, 0.52, 0.18, woodMat, [-0.12, 0.26, 0], [0, 0, 0], castShadow);
  box(fig, 0.16, 0.52, 0.18, woodMat, [0.12, 0.26, 0], [0, 0, 0], castShadow);
  box(fig, 0.46, 0.48, 0.28, woodMat, [0, 0.72, 0], [0, 0, 0], castShadow);
  box(fig, 0.48, 0.09, 0.30, accentMat, [0, 0.56, 0], [0, 0, 0], castShadow);
  box(fig, 0.12, 0.11, 0.32, goldMat, [0, 0.56, 0], [0, 0, 0], castShadow);

  // Machado / Martelo Viking
  box(fig, 0.42, 0.18, 0.22, woodMat, [0, 0.82, 0.16], [0, 0, 0], castShadow);
  cyl(fig, 0.025, 0.025, 1.15, 8, goldMat, [0, 0.78, 0.26], [0, 0, 0], castShadow);
  box(fig, 0.26, 0.16, 0.14, goldMat, [0, 1.32, 0.26], [0, 0, 0], castShadow);

  // Cabeça e Elmo Viking com chifres/asas
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), woodMat);
  head.position.set(0, 1.14, 0.02);
  head.castShadow = castShadow;
  fig.add(head);
  box(fig, 0.20, 0.24, 0.14, woodMat, [0, 1.00, 0.12], [0, 0, 0], castShadow);
  cyl(fig, 0.16, 0.16, 0.07, 14, accentMat, [0, 1.22, 0.02], [0, 0, 0], castShadow);
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.32, 6), goldMat);
    horn.position.set(side * 0.20, 1.36, 0.02);
    horn.rotation.set(0.1, 0, side * -0.45);
    horn.castShadow = castShadow;
    fig.add(horn);
  }

  return stGroup;
}

// Estandarte Nórdico
function buildNorseBanner(
  parent: THREE.Object3D,
  logMat: THREE.Material,
  accentMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Group {
  const b = group(parent, pos[0], pos[1], pos[2]);
  cyl(b, 0.025, 0.03, 1.65, 8, logMat, [0, 0.82, 0], [0, 0, 0], castShadow);
  cyl(b, 0.005, 0.04, 0.18, 6, goldMat, [0, 1.72, 0], [0, 0, 0], castShadow);
  box(b, 0.36, 0.04, 0.04, goldMat, [0, 1.48, 0.04], [0, 0, 0], castShadow);
  box(b, 0.32, 0.56, 0.02, accentMat, [0, 1.18, 0.04], [0, 0, 0], castShadow);
  box(b, 0.16, 0.22, 0.03, goldMat, [0, 1.20, 0.04], [0, 0, 0], castShadow);
  return b;
}

/* ==========================================================================
   4. CONSTRUÇÃO COMPLETA DA FORTALEZA NÓRDICA HILL FORT (T3 -> T4)
   ========================================================================== */
export type NorseFortressAction = 'guarnicao' | 'defesa' | 'geada';

export interface NorseFortressInstance {
  root: THREE.Group;
  tier3Group: THREE.Group;
  tier4Group: THREE.Group;
  frostRing: THREE.Mesh;
  setTier: (tier: number) => void;
  applyGod: (godKey: 'odin' | 'thor' | 'loki' | 'freyr' | string) => void;
  setFrostState: (active: boolean) => void;
  getTier: () => number;
}

export function buildNorseHillFort(
  initialGod: string = 'odin',
  initialTier: number = 3,
  enableShadows: boolean = true
): NorseFortressInstance {
  const normGod = initialGod.toLowerCase();
  const theme =
    normGod.includes('thor')
      ? NORSE_FORTRESS_THEMES.thor
      : normGod.includes('loki')
      ? NORSE_FORTRESS_THEMES.loki
      : normGod.includes('freyr')
      ? NORSE_FORTRESS_THEMES.freyr
      : NORSE_FORTRESS_THEMES.odin;

  const M = {
    woodT3: new THREE.MeshStandardMaterial({
      map: createNorsePlankTexture(false),
      color: theme.woodWall,
      roughness: 0.72,
      metalness: 0.05
    }),
    woodT4: new THREE.MeshStandardMaterial({
      map: createNorsePlankTexture(true),
      color: theme.t4WoodWall,
      roughness: 0.65,
      metalness: 0.08
    }),
    logTrim: new THREE.MeshStandardMaterial({
      color: theme.logTrim,
      roughness: 0.78
    }),
    accent: new THREE.MeshStandardMaterial({
      color: theme.accentColor,
      roughness: 0.42,
      metalness: 0.25
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldColor,
      emissive: 0x3b2200,
      emissiveIntensity: 0.22,
      metalness: 0.88,
      roughness: 0.22
    }),
    roofShingle: new THREE.MeshStandardMaterial({
      map: createWoodShingleTexture(theme, false),
      roughness: 0.62,
      metalness: 0.10,
      side: THREE.DoubleSide
    }),
    darkInterior: new THREE.MeshStandardMaterial({
      color: 0x16110c,
      roughness: 0.9
    }),
    statueWood: new THREE.MeshStandardMaterial({
      color: theme.statueWood,
      roughness: 0.56,
      metalness: 0.12
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x265922,
      roughness: 0.82
    }),
    stoneCap: new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.65
    }),
    frostAuraMat: new THREE.MeshBasicMaterial({
      color: theme.glowHex,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  };

  const root = new THREE.Group();

  // ========================================================================
  // A. ESTRUTURA TIER 3 — HILL FORT HEROICO
  //    Paliçada externa de madeira com pilares de canto, dois grandes
  //    salões longos paralelos com telhados de telhas e proas de dragão,
  //    bastiões frontais com escudos redondos, barris e aríetes!
  // ========================================================================
  const tier3Group = group(root, 0, 0, 0);

  // Embazamento de madeira e pedra
  box(tier3Group, 4.55, 0.20, 4.25, M.logTrim, [0, 0.10, 0], [0, 0, 0], enableShadows);

  // 1. Paliçada Perimetral de Madeira com Pilares de Canto
  const wallH = 1.48;
  box(tier3Group, 4.35, wallH, 0.22, M.woodT3, [0, 0.20 + wallH * 0.5, -1.95], [0, 0, 0], enableShadows);
  box(tier3Group, 0.22, wallH, 3.90, M.woodT3, [-2.08, 0.20 + wallH * 0.5, 0], [0, 0, 0], enableShadows);
  box(tier3Group, 0.22, wallH, 3.90, M.woodT3, [2.08, 0.20 + wallH * 0.5, 0], [0, 0, 0], enableShadows);

  const postCoords = [
    [-2.10, -1.96], [2.10, -1.96],
    [-2.10,  0.0],  [2.10,  0.0],
    [-2.10,  1.88], [2.10,  1.88]
  ];
  postCoords.forEach(([px, pz]) => {
    box(tier3Group, 0.28, wallH + 0.22, 0.28, M.logTrim, [px, 0.20 + (wallH + 0.22) * 0.5, pz], [0, 0, 0], enableShadows);
    box(tier3Group, 0.24, 0.14, 0.24, M.stoneCap, [px, 0.20 + wallH + 0.28, pz], [0, 0, 0], enableShadows);
  });

  // 2. Salão Longo Frontal (Longhouse 1)
  const hallFront = group(tier3Group, 0, 0.20, 0.65);
  box(hallFront, 3.85, 1.85, 1.35, M.woodT3, [0, 0.925, 0], [0, 0, 0], enableShadows);
  box(hallFront, 3.90, 0.22, 1.40, M.accent, [0, 1.68, 0], [0, 0, 0], enableShadows);
  for (let wx = -1.5; wx <= 1.5; wx += 0.6) {
    box(hallFront, 0.10, 0.24, 1.44, M.logTrim, [wx, 1.68, 0], [0, 0, 0], enableShadows);
  }
  buildNorseLonghouseRoof(hallFront, 4.15, 1.65, 1.15, M.roofShingle, M.logTrim, M.accent, M.gold, [0, 1.85, 0], enableShadows);

  // 3. Salão Longo Traseiro (Longhouse 2)
  const hallBack = group(tier3Group, 0, 0.20, -1.05);
  box(hallBack, 3.85, 1.95, 1.35, M.woodT3, [0, 0.975, 0], [0, 0, 0], enableShadows);
  box(hallBack, 3.90, 0.22, 1.40, M.accent, [0, 1.78, 0], [0, 0, 0], enableShadows);
  for (let wx = -1.5; wx <= 1.5; wx += 0.6) {
    box(hallBack, 0.10, 0.24, 1.44, M.logTrim, [wx, 1.78, 0], [0, 0, 0], enableShadows);
  }
  buildNorseLonghouseRoof(hallBack, 4.15, 1.65, 1.15, M.roofShingle, M.logTrim, M.accent, M.gold, [0, 1.95, 0], enableShadows);

  // 4. Portão Principal Gradeado + Dois Bastiões Dianteiros
  const gateT3 = group(tier3Group, 0, 0.20, 1.35);
  box(gateT3, 1.05, 1.18, 0.18, M.darkInterior, [0, 0.59, 0], [0, 0, 0], false);
  for (let gx = -0.36; gx <= 0.36; gx += 0.18) {
    box(gateT3, 0.05, 1.14, 0.22, M.logTrim, [gx, 0.59, 0.01], [0, 0, 0], enableShadows);
  }
  for (let gy = 0.22; gy <= 0.98; gy += 0.25) {
    box(gateT3, 0.98, 0.05, 0.22, M.logTrim, [0, gy, 0.01], [0, 0, 0], enableShadows);
  }

  // Bastião Frontal Esquerdo com Escudos Vikings
  const bastionL = group(tier3Group, -1.35, 0.20, 1.85);
  box(bastionL, 1.35, 1.05, 0.95, M.woodT3, [0, 0.525, 0], [0, 0, 0], enableShadows);
  box(bastionL, 1.40, 0.16, 0.08, M.logTrim, [0, 1.12, 0.44], [0, 0, 0], enableShadows);
  box(bastionL, 0.08, 0.16, 1.00, M.logTrim, [-0.66, 1.12, 0], [0, 0, 0], enableShadows);
  box(bastionL, 0.08, 0.16, 1.00, M.logTrim, [0.66, 1.12, 0], [0, 0, 0], enableShadows);
  buildNorseBanner(bastionL, M.logTrim, M.accent, M.gold, [-0.32, 0.85, 0.38], enableShadows);
  for (const [sx, sz, rz] of [[0.18, 0.12, 0.35], [0.38, -0.08, -0.25]]) {
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16), M.accent);
    sh.position.set(sx, 1.08, sz);
    sh.rotation.set(0.25, 0, rz);
    sh.castShadow = enableShadows;
    bastionL.add(sh);
    const umbo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), M.gold);
    umbo.position.set(sx, 1.11, sz);
    umbo.castShadow = enableShadows;
    bastionL.add(umbo);
  }

  // Bastião Frontal Direito com Barris
  const bastionR = group(tier3Group, 1.35, 0.20, 1.85);
  box(bastionR, 1.35, 1.05, 0.95, M.woodT3, [0, 0.525, 0], [0, 0, 0], enableShadows);
  box(bastionR, 1.40, 0.16, 0.08, M.logTrim, [0, 1.12, 0.44], [0, 0, 0], enableShadows);
  box(bastionR, 0.08, 0.16, 1.00, M.logTrim, [-0.66, 1.12, 0], [0, 0, 0], enableShadows);
  box(bastionR, 0.08, 0.16, 1.00, M.logTrim, [0.66, 1.12, 0], [0, 0, 0], enableShadows);
  buildNorseBanner(bastionR, M.logTrim, M.accent, M.gold, [0.32, 0.85, 0.38], enableShadows);
  cyl(bastionR, 0.13, 0.13, 0.28, 12, M.logTrim, [-0.28, 1.18, 0.10], [0, 0, 0], enableShadows);
  cyl(bastionR, 0.13, 0.13, 0.28, 12, M.logTrim, [-0.02, 1.18, -0.12], [0, 0, 0], enableShadows);
  cyl(tier3Group, 0.15, 0.15, 0.34, 12, M.logTrim, [0.55, 0.37, 1.65], [0, 0, 0], enableShadows);
  cyl(tier3Group, 0.12, 0.12, 0.26, 12, M.logTrim, [0.42, 0.33, 1.98], [0, 0, 0], enableShadows);

  // Dois Aríetes de Cerco com Cabeça de Dragão Dourada
  buildBatteringRam(tier3Group, M.logTrim, M.gold, [-0.95, 0.22, 2.55], [0, -0.15, 0], enableShadows);
  buildBatteringRam(tier3Group, M.logTrim, M.gold, [0.82, 0.85, 2.28], [0, 0.2, 1.35], enableShadows);

  // ========================================================================
  // B. ESTRUTURA TIER 4 — CIDADELA IMPERIAL DE VALHALLA
  //    Fortaleza nórdica monumental de DOIS ANDARES com duas alas altas
  //    paralelas, passarelas superiores sobre um pátio interno profundo,
  //    pórtico arqueado reforçado, mastros e o Colosso Guardião Viking!
  // ========================================================================
  const tier4Group = group(root, 0, 0, 0);
  tier4Group.visible = false;

  box(tier4Group, 4.95, 0.26, 4.65, M.logTrim, [0, 0.13, 0], [0, 0, 0], enableShadows);

  // 1. Ala Frontal de Dois Andares
  const wingT4Front = group(tier4Group, 0, 0.26, 1.25);
  box(wingT4Front, 4.45, 1.65, 1.55, M.woodT4, [0, 0.825, 0], [0, 0, 0], enableShadows);
  box(wingT4Front, 4.54, 0.18, 1.64, M.accent, [0, 1.54, 0], [0, 0, 0], enableShadows);
  for (const px of [-2.18, -1.10, 0.0, 1.10, 2.18]) {
    box(wingT4Front, 0.22, 1.72, 1.68, M.logTrim, [px, 0.86, 0], [0, 0, 0], enableShadows);
    box(wingT4Front, 0.20, 0.12, 0.20, M.stoneCap, [px, 1.78, 0.82], [0, 0, 0], enableShadows);
  }
  box(wingT4Front, 4.25, 1.25, 1.42, M.woodT4, [0, 2.28, 0], [0, 0, 0], enableShadows);
  box(wingT4Front, 4.30, 0.24, 1.46, M.accent, [0, 2.76, 0], [0, 0, 0], enableShadows);
  for (let wx = -1.6; wx <= 1.6; wx += 0.64) {
    box(wingT4Front, 0.10, 0.26, 1.50, M.logTrim, [wx, 2.76, 0], [0, 0, 0], enableShadows);
  }
  buildNorseLonghouseRoof(wingT4Front, 4.55, 1.72, 1.25, M.roofShingle, M.logTrim, M.accent, M.gold, [0, 2.90, 0], enableShadows);

  // 2. Ala Traseira de Dois Andares
  const wingT4Back = group(tier4Group, 0, 0.26, -1.25);
  box(wingT4Back, 4.45, 1.65, 1.55, M.woodT4, [0, 0.825, 0], [0, 0, 0], enableShadows);
  box(wingT4Back, 4.54, 0.18, 1.64, M.accent, [0, 1.54, 0], [0, 0, 0], enableShadows);
  for (const px of [-2.18, -1.10, 0.0, 1.10, 2.18]) {
    box(wingT4Back, 0.22, 1.72, 1.68, M.logTrim, [px, 0.86, 0], [0, 0, 0], enableShadows);
  }
  box(wingT4Back, 4.25, 1.25, 1.42, M.woodT4, [0, 2.28, 0], [0, 0, 0], enableShadows);
  box(wingT4Back, 4.30, 0.24, 1.46, M.accent, [0, 2.76, 0], [0, 0, 0], enableShadows);
  for (let wx = -1.6; wx <= 1.6; wx += 0.64) {
    box(wingT4Back, 0.10, 0.26, 1.50, M.logTrim, [wx, 2.76, 0], [0, 0, 0], enableShadows);
  }
  buildNorseLonghouseRoof(wingT4Back, 4.55, 1.72, 1.25, M.roofShingle, M.logTrim, M.accent, M.gold, [0, 2.90, 0], enableShadows);

  // 3. Passarelas Elevadas e Pátio Central Profundo + Mastros
  const bridgeT4 = group(tier4Group, 0, 0.26, 0);
  box(bridgeT4, 0.45, 2.15, 1.15, M.woodT4, [-1.85, 1.075, 0], [0, 0, 0], enableShadows);
  box(bridgeT4, 0.45, 2.15, 1.15, M.woodT4, [1.85, 1.075, 0], [0, 0, 0], enableShadows);
  box(bridgeT4, 3.45, 0.24, 0.55, M.logTrim, [0, 2.05, 0], [0, 0, 0], enableShadows);
  for (const [mx, mz] of [[-1.1, 0.22], [1.1, 0.22], [-1.1, -0.22], [1.1, -0.22]]) {
    cyl(bridgeT4, 0.02, 0.03, 1.35, 6, M.logTrim, [mx, 2.75, mz], [0, 0, 0], enableShadows);
  }

  // 4. Pórtico Frontal Reforçado em Arco
  const gateT4 = group(tier4Group, -0.55, 0.26, 2.12);
  box(gateT4, 1.25, 1.35, 0.36, M.logTrim, [0, 0.675, 0], [0, 0, 0], enableShadows);
  box(gateT4, 0.88, 1.12, 0.40, M.woodT4, [0, 0.56, 0.02], [0, 0, 0], enableShadows);
  box(gateT4, 1.38, 0.18, 0.46, M.logTrim, [0, 1.40, 0.04], [0, 0, 0], enableShadows);
  box(gateT4, 1.10, 0.14, 0.48, M.accent, [0, 1.54, 0.04], [0, 0, 0], enableShadows);

  // 5. Colosso Guardião Viking Esculpido
  buildNorseGuardianStatue(tier4Group, M.statueWood, M.accent, M.gold, [1.55, 0.26, 2.22], 1.12, enableShadows);

  // Vegetação trepadeira nos muros
  for (const [vx, vz] of [[-2.25, 1.65], [2.25, 1.55], [0.75, 2.05]]) {
    const v = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), M.foliage);
    v.position.set(vx, 0.55, vz);
    v.castShadow = enableShadows;
    tier4Group.add(v);
  }

  // ========================================================================
  // C. AURA DE GEADA / RUNAS NO SOLO
  // ========================================================================
  const frostRing = new THREE.Mesh(new THREE.RingGeometry(3.25, 3.65, 64), M.frostAuraMat);
  frostRing.rotation.x = -Math.PI / 2;
  frostRing.position.y = 0.03;
  root.add(frostRing);

  let currentTier = initialTier;
  let currentGodKey = initialGod;
  let isFrostActive = false;

  function updateRoofMaterial() {
    const th = NORSE_FORTRESS_THEMES[currentGodKey] || NORSE_FORTRESS_THEMES.odin;
    if (M.roofShingle.map) M.roofShingle.map.dispose();
    M.roofShingle.map = createWoodShingleTexture(th, isFrostActive);
    M.roofShingle.needsUpdate = true;
  }

  function setTier(tier: number) {
    currentTier = tier;
    const isT4 = tier >= 4;
    tier3Group.visible = !isT4;
    tier4Group.visible = isT4;
  }

  function applyGod(godKey: string) {
    const raw = (godKey || 'odin').toLowerCase();
    currentGodKey = raw.includes('thor')
      ? 'thor'
      : raw.includes('loki')
      ? 'loki'
      : raw.includes('freyr')
      ? 'freyr'
      : 'odin';

    const next = NORSE_FORTRESS_THEMES[currentGodKey] || NORSE_FORTRESS_THEMES.odin;
    M.woodT3.color.setHex(next.woodWall);
    M.woodT4.color.setHex(next.t4WoodWall);
    M.logTrim.color.setHex(next.logTrim);
    M.accent.color.setHex(next.accentColor);
    M.gold.color.setHex(next.goldColor);
    M.statueWood.color.setHex(next.statueWood);
    (frostRing.material as THREE.MeshBasicMaterial).color.setHex(next.glowHex);
    updateRoofMaterial();
  }

  function setFrostState(active: boolean) {
    isFrostActive = active;
    updateRoofMaterial();
  }

  setTier(initialTier);
  applyGod(initialGod);

  return {
    root,
    tier3Group,
    tier4Group,
    frostRing,
    setTier,
    applyGod,
    setFrostState,
    getTier: () => currentTier
  };
}

export const buildNorseFortressStudio = buildNorseHillFort;
