import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO DAS 3 DIVINDADES GREGAS (ZEUS, POSEIDON E HADES) E TIERS T1–T5
   ========================================================================== */
export type GreekTempleGodKey = 'zeus' | 'poseidon' | 'hades';
export type GreekTempleAction = 'favor' | 'milagre';

export interface GreekTempleTierInfo {
  title: string;
  sub: string;
}

export interface GreekTempleTheme {
  id: GreekTempleGodKey;
  godName: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  marbleBase: number;
  marbleBright: number;
  trimHex: number;
  goldHex: number;
  roofBase: string;
  roofRib: string;
  roofPatina: string;
  flameHex: number;
  glowHex: number;
  groundGrass: string;
  groundDirt: string;
  tiers: Record<number, GreekTempleTierInfo>;
}

export const GREEK_TEMPLE_THEMES: Record<GreekTempleGodKey, GreekTempleTheme> = {
  zeus: {
    id: 'zeus',
    godName: 'Zeus',
    bgHex: 0x10203a,
    hemiSky: 0xfef9c3,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    marbleBase: 0xe8e4d8,
    marbleBright: 0xf8fafc,
    trimHex: 0x1d4ed8,        // Azul-olímpico clássico
    goldHex: 0xfacc15,
    roofBase: '#8c6239',
    roofRib: '#d97706',
    roofPatina: '#577a62',
    flameHex: 0xf59e0b,
    glowHex: 0x38bdf8,
    groundGrass: '#52802c',
    groundDirt: '#bfa070',
    tiers: {
      1: { title: 'Altar Arcaico de Zeus • Tier 1', sub: 'Santuário primitivo em pedra calcária, colunas de madeira, pira votiva e estandarte azul-olímpico' },
      2: { title: 'Santuário Clássico de Zeus • Tier 2', sub: 'Templo dórico retangular com frontão triangular, telhas de terracota-bronze e braseiros sagrados' },
      3: { title: 'Templo Heroico de Zeus • Tier 3', sub: 'Templo períptero cercado por colunas dóricas, ciprestes e a Estátua de Zeus em pé no pedestal lateral' },
      4: { title: 'Grande Templo Mítico de Zeus • Tier 4', sub: 'Santuário monumental elevado com escadaria dupla, frisos de ouro olímpico e guardiões gêmeos' },
      5: { title: 'Maravilha de Zeus • Tier 5 (Estátua de Olímpia)', sub: 'Ápice arquitetônico: Pátio períptero em U de mármore, braseiros acesos e a Estátua Colossal de Zeus Entronizado em Ouro' }
    }
  },
  poseidon: {
    id: 'poseidon',
    godName: 'Poseidon',
    bgHex: 0x061f2e,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0c4a6e,
    rimHex: 0x2dd4bf,
    marbleBase: 0xdbeafe,
    marbleBright: 0xf0f9ff,
    trimHex: 0x0d9488,        // Turquesa marinho nas cornijas
    goldHex: 0xfacc15,
    roofBase: '#3f7a6c',
    roofRib: '#2dd4bf',
    roofPatina: '#115e59',
    flameHex: 0x2dd4bf,
    glowHex: 0x2dd4bf,
    groundGrass: '#457a49',
    groundDirt: '#c2aa7e',
    tiers: {
      1: { title: 'Altar Costeiro de Poseidon • Tier 1', sub: 'Santuário marinho primitivo com pedras do litoral, ofertas de conchas e chama turquesa' },
      2: { title: 'Santuário de Poseidon • Tier 2', sub: 'Templo dórico com telhado de cobre oxidado verde-água, frisos turquesa e tridente no frontão' },
      3: { title: 'Templo Heroico de Poseidon • Tier 3', sub: 'Templo períptero com colunata completa e a Estátua de Poseidon em pé empunhando o Tridente Sagrado' },
      4: { title: 'Grande Templo Atlante de Poseidon • Tier 4', sub: 'Santuário elevado com fontes cristalinas, escadarias de mármore marinho e guardiões do Tridente' },
      5: { title: 'Maravilha de Poseidon • Tier 5 (Colosso dos Mares)', sub: 'Ápice arquitetônico: Colunata monumental em U, espelho d’água sagrado e o Trono Dourado de Poseidon com Tridente' }
    }
  },
  hades: {
    id: 'hades',
    godName: 'Hades',
    bgHex: 0x090612,
    hemiSky: 0xa7f3d0,
    hemiGround: 0x2e1065,
    rimHex: 0x10b981,
    marbleBase: 0x52525b,
    marbleBright: 0x3f3f46,
    trimHex: 0x991b1b,        // Carmesim do Submundo
    goldHex: 0xd97706,
    roofBase: '#27272a',
    roofRib: '#ea580c',
    roofPatina: '#450a0a',
    flameHex: 0x10b981,
    glowHex: 0x10b981,
    groundGrass: '#33402e',
    groundDirt: '#594e45',
    tiers: {
      1: { title: 'Altar Umbral de Hades • Tier 1', sub: 'Altar sombrio de obsidiana com braseiro de chamas verdes do Estige e runas do Submundo' },
      2: { title: 'Santuário Estígio de Hades • Tier 2', sub: 'Templo de basalto escuro com telhado de ardósia, frisos carmesim e piras espectrais' },
      3: { title: 'Templo Heroico de Hades • Tier 3', sub: 'Templo períptero sombrio com a Estátua de Hades em pé empunhando o Bidente Infernal' },
      4: { title: 'Grande Templo do Tártaro • Tier 4', sub: 'Santuário monumental de obsidiana e ouro amaldiçoado com escadarias duplas e guardiões gêmeos' },
      5: { title: 'Maravilha de Hades • Tier 5 (Trono do Submundo)', sub: 'Ápice arquitetônico: Pátio períptero em U de obsidiana e ouro, piras esmeraldas e o Colosso de Hades Entronizado' }
    }
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR (MÁRMORE GREGO, TELHAS CANELADAS E PISO QUADRICULADO)
   ========================================================================== */
export function createMarbleTexture(isBright = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = isBright ? '#f4f1ea' : '#dcd7ca';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 12;
    const rH = 512 / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rH;
      const cols = 6;
      const cW = 512 / cols;
      const off = (r % 2 === 0) ? 0 : cW * 0.5;
      for (let c = -1; c <= cols; c++) {
        const x = c * cW + off;
        const v = isBright ? 236 : 212;
        const d = Math.floor((Math.random() - 0.5) * 18);
        ctx.fillStyle = `rgb(${v + d}, ${v + d - 4}, ${v + d - 12})`;
        ctx.fillRect(x + 2, y + 2, cW - 4, rH - 4);
        ctx.strokeStyle = 'rgba(40, 38, 35, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, cW - 2, rH - 2);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createTiledRoofTexture(theme: GreekTempleTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = theme.roofBase;
    ctx.fillRect(0, 0, 512, 512);

    const tiles = 24;
    const tW = 512 / tiles;
    for (let i = 0; i < tiles; i++) {
      const x = i * tW;
      const grad = ctx.createLinearGradient(x, 0, x + tW, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0.32)');
      grad.addColorStop(0.35, theme.roofRib);
      grad.addColorStop(0.75, theme.roofPatina);
      grad.addColorStop(1, 'rgba(0,0,0,0.38)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, tW, 512);
    }

    ctx.strokeStyle = 'rgba(15, 15, 15, 0.30)';
    ctx.lineWidth = 2;
    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWonderCourtFloorTexture(_theme: GreekTempleTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 512, 512);

    const grid = 10;
    const cell = 512 / grid;
    for (let gx = 0; gx < grid; gx++) {
      for (let gy = 0; gy < grid; gy++) {
        const isAlt = (gx + gy) % 2 === 0;
        ctx.fillStyle = isAlt ? '#cbd5e1' : '#94a3b8';
        ctx.fillRect(gx * cell + 2, gy * cell + 2, cell - 4, cell - 4);
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(gx * cell + 1, gy * cell + 1, cell - 2, cell - 2);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createGroundTexture(theme: GreekTempleTheme, isT5 = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = theme.groundGrass;
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 6500; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 35, 10, 0.14)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 10, 10);
    }

    const cx = 512, cy = 512;
    const dirtGrad = ctx.createRadialGradient(cx, cy, 190, cx, cy, 410);
    dirtGrad.addColorStop(0, theme.groundDirt);
    dirtGrad.addColorStop(0.76, theme.groundDirt);
    dirtGrad.addColorStop(1, 'rgba(191, 160, 112, 0)');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    if (isT5) {
      ctx.fillStyle = 'rgba(130, 118, 102, 0.58)';
      for (let i = 0; i < 42; i++) {
        const a = (i / 42) * Math.PI * 2;
        const r = 275 + (i % 3) * 38;
        const px = cx + Math.cos(a) * r - 22;
        const py = cy + Math.sin(a) * r - 18;
        ctx.fillRect(px, py, 44, 34);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ==========================================================================
   3. HELPERS DE ARQUITETURA RELIGIOSA GREGA E ESTÁTUAS DIVINAS
   ========================================================================== */
function group(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function box(
  parent: THREE.Object3D | null,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

function cyl(
  parent: THREE.Object3D | null,
  rt: number,
  rb: number,
  h: number,
  segs: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

export interface DivineSymbolPair {
  zeusBolt: THREE.Group;
  poseidonTrident: THREE.Group;
  hadesBident: THREE.Group;
}

export function createDivineSymbol3D(
  parent: THREE.Object3D | null,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  symbolList: DivineSymbolPair[] | null = null
): DivineSymbolPair {
  const symRoot = group(parent, pos[0], pos[1], pos[2]);
  symRoot.scale.setScalar(scale);

  // 1. ⚡ Raio Olímpico de Zeus
  const zeusBolt = group(symRoot, 0, 0, 0);
  box(zeusBolt, 0.08, 0.34, 0.05, glowMat, [-0.04, 0.14, 0], [0, 0, -0.35]);
  box(zeusBolt, 0.14, 0.06, 0.05, goldMat, [0, 0, 0]);
  cyl(zeusBolt, 0.005, 0.07, 0.36, 4, glowMat, [0.05, -0.15, 0], [0, 0, Math.PI - 0.35]);

  // 2. 🔱 Tridente Sagrado de Poseidon
  const poseidonTrident = group(symRoot, 0, 0, 0);
  cyl(poseidonTrident, 0.025, 0.025, 0.56, 8, goldMat, [0, -0.06, 0]);
  box(poseidonTrident, 0.28, 0.04, 0.04, goldMat, [0, 0.08, 0]);
  cyl(poseidonTrident, 0.005, 0.045, 0.28, 4, glowMat, [0, 0.24, 0]);
  for (const sx of [-1, 1]) {
    cyl(poseidonTrident, 0.005, 0.035, 0.22, 4, glowMat, [sx * 0.12, 0.20, 0], [0, 0, sx * -0.08]);
  }
  poseidonTrident.visible = false;

  // 3. 💀 Bidente Sagrado & Crânio de Hades
  const hadesBident = group(symRoot, 0, 0, 0);
  cyl(hadesBident, 0.025, 0.025, 0.46, 8, goldMat, [0, -0.12, 0]);
  box(hadesBident, 0.24, 0.04, 0.04, goldMat, [0, 0.06, 0]);
  for (const sx of [-1, 1]) {
    cyl(hadesBident, 0.005, 0.042, 0.26, 4, glowMat, [sx * 0.10, 0.20, 0]);
  }
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), glowMat);
  skull.position.set(0, 0.06, 0.03);
  hadesBident.add(skull);
  hadesBident.visible = false;

  const entry = { zeusBolt, poseidonTrident, hadesBident };
  if (symbolList) symbolList.push(entry);
  return entry;
}

export function buildGreekPedimentRoof(
  parent: THREE.Object3D | null,
  w: number,
  d: number,
  h: number,
  roofMat: THREE.Material,
  marbleMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  yBase: number,
  symbolList: DivineSymbolPair[] | null = null
): THREE.Group {
  const roofRoot = group(parent, 0, yBase, 0);

  // Frontão Triangular
  const triShape = new THREE.Shape();
  triShape.moveTo(-w * 0.5, 0);
  triShape.lineTo(w * 0.5, 0);
  triShape.lineTo(0, h);
  triShape.closePath();

  const triGeom = new THREE.ExtrudeGeometry(triShape, { depth: d, bevelEnabled: false });
  triGeom.translate(0, 0, -d * 0.5);
  const frontBack = new THREE.Mesh(triGeom, marbleMat);
  frontBack.castShadow = true;
  frontBack.receiveShadow = true;
  roofRoot.add(frontBack);

  // Cornijas inclinadas
  const slopeLen = Math.hypot(w * 0.5, h) + 0.18;
  const slopeAngle = Math.atan2(h, w * 0.5);
  box(roofRoot, slopeLen, 0.10, d + 0.22, roofMat, [-w * 0.25, h * 0.5, 0], [0, 0, slopeAngle]);
  box(roofRoot, slopeLen, 0.10, d + 0.22, roofMat, [w * 0.25, h * 0.5, 0], [0, 0, -slopeAngle]);

  // Cumeeira central
  box(roofRoot, 0.18, 0.14, d + 0.28, trimMat, [0, h + 0.04, 0]);
  box(roofRoot, 0.10, 0.12, d + 0.32, goldMat, [0, h + 0.11, 0]);

  // Acrotérios nos 3 cantos
  cyl(roofRoot, 0.01, 0.08, 0.32, 6, goldMat, [0, h + 0.28, d * 0.5]);
  cyl(roofRoot, 0.01, 0.08, 0.32, 6, goldMat, [0, h + 0.28, -d * 0.5]);
  cyl(roofRoot, 0.01, 0.06, 0.24, 6, goldMat, [-w * 0.5, 0.14, d * 0.5]);
  cyl(roofRoot, 0.01, 0.06, 0.24, 6, goldMat, [w * 0.5, 0.14, d * 0.5]);

  // Símbolo Divino esculpido no tímpano
  createDivineSymbol3D(roofRoot, goldMat, glowMat, [0, h * 0.42, d * 0.5 + 0.05], 0.72, symbolList);
  createDivineSymbol3D(roofRoot, goldMat, glowMat, [0, h * 0.42, -d * 0.5 - 0.05], 0.72, symbolList);

  return roofRoot;
}

export function buildSacredBrazier(
  parent: THREE.Object3D | null,
  goldMat: THREE.Material,
  flameMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): { bGroup: THREE.Group; flame: THREE.Mesh } {
  const bGroup = group(parent, pos[0], pos[1], pos[2]);
  bGroup.scale.setScalar(scale);

  cyl(bGroup, 0.16, 0.22, 0.10, 12, goldMat, [0, 0.05, 0]);
  cyl(bGroup, 0.05, 0.07, 0.48, 10, goldMat, [0, 0.34, 0]);
  cyl(bGroup, 0.28, 0.14, 0.16, 14, goldMat, [0, 0.64, 0]);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.46, 10), flameMat);
  flame.position.set(0, 0.90, 0);
  bGroup.add(flame);

  return { bGroup, flame };
}

export function buildStandingDeityStatue(
  parent: THREE.Object3D | null,
  marbleMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  glowMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  symbolList: DivineSymbolPair[] | null = null
): THREE.Group {
  const stGroup = group(parent, pos[0], pos[1], pos[2]);
  stGroup.scale.setScalar(scale);

  // Pedestal de mármore com placa dourada e friso colorido
  box(stGroup, 0.88, 0.52, 0.88, marbleMat, [0, 0.26, 0]);
  box(stGroup, 0.94, 0.09, 0.94, trimMat, [0, 0.55, 0]);
  box(stGroup, 0.42, 0.32, 0.90, goldMat, [0, 0.26, 0]);

  const fig = group(stGroup, 0, 0.60, 0);
  cyl(fig, 0.18, 0.26, 0.95, 14, marbleMat, [0, 0.475, 0]);
  box(fig, 0.46, 0.48, 0.28, marbleMat, [0, 1.15, 0]);
  box(fig, 0.48, 0.10, 0.30, trimMat, [0, 0.96, 0]);

  // Cabeça esculpida com barba e coroa divina
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), marbleMat);
  head.position.set(0, 1.54, 0.02);
  fig.add(head);
  box(fig, 0.18, 0.22, 0.14, marbleMat, [0, 1.40, 0.12]);
  cyl(fig, 0.16, 0.16, 0.06, 14, goldMat, [0, 1.66, 0.02]);

  // Braço direito empunhando a haste com o símbolo da divindade
  box(fig, 0.14, 0.45, 0.14, marbleMat, [0.30, 1.24, 0.12], [-0.45, 0, -0.25]);
  box(fig, 0.16, 0.09, 0.16, trimMat, [0.28, 1.32, 0.04]);
  cyl(fig, 0.025, 0.025, 2.05, 8, goldMat, [0.34, 1.02, 0.22], [0.06, 0, 0]);
  createDivineSymbol3D(fig, goldMat, glowMat, [0.34, 2.15, 0.29], 0.85, symbolList);

  // Braço esquerdo segurando relíquia
  box(fig, 0.14, 0.42, 0.14, marbleMat, [-0.28, 1.12, 0.14], [-0.55, 0, 0.2]);
  box(fig, 0.16, 0.09, 0.16, trimMat, [-0.28, 1.28, 0.04]);
  const handRelic = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), goldMat);
  handRelic.position.set(-0.28, 0.94, 0.28);
  fig.add(handRelic);

  return stGroup;
}

export function buildColossalEnthronedDeity(
  parent: THREE.Object3D | null,
  goldMat: THREE.Material,
  trimMat: THREE.Material,
  marbleMat: THREE.Material,
  glowMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  symbolList: DivineSymbolPair[] | null = null
): { cGroup: THREE.Group; crown: THREE.Mesh; topSym: DivineSymbolPair } {
  const cGroup = group(parent, pos[0], pos[1], pos[2]);

  // 1. Plataforma Escalonada de Mármore e Ouro
  box(cGroup, 2.15, 0.22, 2.35, marbleMat, [0, 0.11, 0.15]);
  box(cGroup, 2.22, 0.08, 2.42, trimMat, [0, 0.25, 0.15]);
  box(cGroup, 1.85, 0.26, 1.95, goldMat, [0, 0.42, 0.10]);
  box(cGroup, 1.90, 0.07, 2.00, trimMat, [0, 0.58, 0.10]);

  // 2. Grande Trono Imperial de Mármore Branco
  const throne = group(cGroup, 0, 0.62, -0.10);
  box(throne, 1.48, 0.68, 1.15, marbleMat, [0, 0.34, 0]);
  box(throne, 0.24, 0.95, 1.22, marbleMat, [-0.66, 0.475, 0.05]);
  box(throne, 0.24, 0.95, 1.22, marbleMat, [0.66, 0.475, 0.05]);
  box(throne, 0.28, 0.10, 1.28, goldMat, [-0.66, 0.98, 0.05]);
  box(throne, 0.28, 0.10, 1.28, goldMat, [0.66, 0.98, 0.05]);

  box(throne, 1.38, 1.95, 0.26, marbleMat, [0, 1.15, -0.46]);
  box(throne, 1.44, 0.10, 0.32, goldMat, [0, 2.14, -0.46]);
  const backTri = new THREE.Shape();
  backTri.moveTo(-0.74, 0);
  backTri.lineTo(0.74, 0);
  backTri.lineTo(0, 0.48);
  backTri.closePath();
  const backPed = new THREE.Mesh(new THREE.ExtrudeGeometry(backTri, { depth: 0.30, bevelEnabled: false }), marbleMat);
  backPed.position.set(0, 2.18, -0.61);
  backPed.castShadow = true;
  throne.add(backPed);

  // 3. O DEUS COLOSSAL ENTRONIZADO EM OURO
  const god = group(throne, 0, 0.68, 0.12);
  box(god, 0.92, 0.34, 0.72, goldMat, [0, 0.12, 0.26]);
  box(god, 0.88, 0.64, 0.36, goldMat, [0, -0.32, 0.52]);
  box(god, 0.22, 0.12, 0.34, goldMat, [-0.24, -0.62, 0.68]);
  box(god, 0.22, 0.12, 0.34, goldMat, [0.24, -0.62, 0.68]);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.38, 0.88, 18), goldMat);
  torso.position.set(0, 0.68, -0.02);
  torso.scale.set(1.15, 1.0, 0.78);
  torso.castShadow = true;
  god.add(torso);

  box(god, 0.24, 0.92, 0.62, goldMat, [-0.28, 0.72, 0.02], [0, 0, -0.28]);
  box(god, 0.22, 0.56, 0.22, goldMat, [-0.58, 0.76, 0.06], [-0.25, 0, 0.18]);
  box(god, 0.20, 0.20, 0.56, goldMat, [-0.66, 0.42, 0.32]);
  box(god, 0.22, 0.56, 0.22, goldMat, [0.58, 0.76, 0.06], [-0.25, 0, -0.18]);
  box(god, 0.20, 0.20, 0.56, goldMat, [0.66, 0.42, 0.32]);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), goldMat);
  head.position.set(0, 1.34, 0.06);
  head.scale.set(0.95, 1.12, 1.0);
  head.castShadow = true;
  god.add(head);

  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.44, 12), goldMat);
  beard.position.set(0, 1.10, 0.22);
  beard.rotation.set(Math.PI - 0.15, 0, 0);
  god.add(beard);

  const crown = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 8, 24), glowMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.set(0, 1.48, 0.06);
  god.add(crown);

  const relicGroup = group(god, 0.66, 0.52, 0.58);
  cyl(relicGroup, 0.025, 0.025, 1.55, 8, goldMat, [0, 0.40, 0], [0.15, 0, 0]);
  const topSym = createDivineSymbol3D(relicGroup, goldMat, glowMat, [0, 1.34, 0.14], 1.15, symbolList);

  return { cGroup, crown, topSym };
}

/* ==========================================================================
   4. SISTEMA COMPLETO DO TEMPLO GREGO EVOLUTIVO (TIERS T1 A T5)
   ========================================================================== */
export interface GreekTempleMaterials {
  marbleBase: THREE.MeshStandardMaterial;
  marbleBright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  wonderFloor: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  darkInterior: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  divineGlow: THREE.MeshStandardMaterial;
}

export interface GreekTempleSystemResult {
  root: THREE.Group;
  tierGroups: Record<number, THREE.Group>;
  colossalDeity: { cGroup: THREE.Group; crown: THREE.Mesh; topSym: DivineSymbolPair };
  favorRing: THREE.Mesh;
  allFlames: THREE.Mesh[];
  allSymbols: DivineSymbolPair[];
  materials: GreekTempleMaterials;
  setTier: (tier: number) => void;
  applyGod: (godKey: GreekTempleGodKey) => void;
  getTier: () => number;
}

export function buildGreekTempleSystem(
  initialGod: GreekTempleGodKey = 'zeus',
  initialTier = 5
): GreekTempleSystemResult {
  const theme = GREEK_TEMPLE_THEMES[initialGod] || GREEK_TEMPLE_THEMES.zeus;

  const M: GreekTempleMaterials = {
    marbleBase: new THREE.MeshStandardMaterial({
      map: createMarbleTexture(false),
      color: theme.marbleBase,
      roughness: 0.62,
      metalness: 0.08
    }),
    marbleBright: new THREE.MeshStandardMaterial({
      map: createMarbleTexture(true),
      color: theme.marbleBright,
      roughness: 0.48,
      metalness: 0.12
    }),
    trim: new THREE.MeshStandardMaterial({
      color: theme.trimHex,
      roughness: 0.36,
      metalness: 0.35
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.28,
      metalness: 0.92,
      roughness: 0.18
    }),
    roof: new THREE.MeshStandardMaterial({
      map: createTiledRoofTexture(theme),
      roughness: 0.54,
      metalness: 0.18,
      side: THREE.DoubleSide
    }),
    wonderFloor: new THREE.MeshStandardMaterial({
      map: createWonderCourtFloorTexture(theme),
      roughness: 0.44,
      metalness: 0.16
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x5c2d16,
      roughness: 0.68
    }),
    darkInterior: new THREE.MeshStandardMaterial({
      color: 0x161412,
      roughness: 0.9
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x1e4d20,
      roughness: 0.8
    }),
    flame: new THREE.MeshBasicMaterial({
      color: theme.flameHex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    }),
    divineGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.glowHex,
      emissiveIntensity: 3.2,
      roughness: 0.1
    })
  };

  const root = new THREE.Group();
  const tierGroups: Record<number, THREE.Group> = {};
  const allFlames: THREE.Mesh[] = [];
  const allSymbols: DivineSymbolPair[] = [];

  // ========================================================================
  // TIER 1 — ALTAR ARCAICO
  // ========================================================================
  const t1 = group(root, 0, 0, 0);
  box(t1, 2.85, 0.22, 2.55, M.marbleBase, [0, 0.11, 0]);
  box(t1, 1.05, 0.68, 0.78, M.marbleBright, [0, 0.72, -0.15]);
  box(t1, 1.15, 0.10, 0.88, M.trim, [0, 1.10, -0.15]);
  for (const sx of [-0.95, 0.95]) {
    for (const sz of [-0.75, 0.55]) {
      cyl(t1, 0.08, 0.10, 1.35, 10, M.wood, [sx, 1.05, sz]);
    }
  }
  box(t1, 2.15, 0.14, 1.65, M.wood, [0, 1.78, -0.10]);
  const bT1 = buildSacredBrazier(t1, M.gold, M.flame, [0, 0.38, 0.68], 0.85);
  allFlames.push(bT1.flame);
  tierGroups[1] = t1;

  // ========================================================================
  // TIER 2 — SANTUÁRIO CLÁSSICO
  // ========================================================================
  const t2 = group(root, 0, 0, 0);
  box(t2, 3.45, 0.22, 3.85, M.marbleBase, [0, 0.11, 0]);
  box(t2, 3.15, 0.18, 3.55, M.marbleBright, [0, 0.30, 0]);
  box(t2, 2.35, 1.48, 2.25, M.marbleBase, [0, 1.14, -0.35]);
  box(t2, 0.75, 1.05, 0.10, M.wood, [0, 0.92, 0.78]);

  for (const cx of [-0.95, -0.32, 0.32, 0.95]) {
    cyl(t2, 0.09, 0.11, 1.48, 12, M.marbleBright, [cx, 1.14, 1.25]);
  }
  box(t2, 2.45, 0.16, 3.45, M.marbleBright, [0, 1.96, 0.15]);
  box(t2, 2.50, 0.08, 3.50, M.trim, [0, 2.06, 0.15]);
  buildGreekPedimentRoof(t2, 2.55, 3.65, 0.55, M.roof, M.marbleBright, M.trim, M.gold, M.divineGlow, 2.10, allSymbols);

  const bT2L = buildSacredBrazier(t2, M.gold, M.flame, [-1.35, 0.22, 1.72], 0.9);
  const bT2R = buildSacredBrazier(t2, M.gold, M.flame, [1.35, 0.22, 1.72], 0.9);
  allFlames.push(bT2L.flame, bT2R.flame);
  tierGroups[2] = t2;

  // ========================================================================
  // TIER 3 — TEMPLO HEROICO PERÍPTERO COM ESTÁTUA
  // ========================================================================
  const t3 = group(root, 0.35, 0, 0);
  box(t3, 3.85, 0.16, 4.65, M.marbleBase, [0, 0.08, 0]);
  box(t3, 3.62, 0.16, 4.42, M.marbleBase, [0, 0.24, 0]);
  box(t3, 3.38, 0.16, 4.18, M.marbleBright, [0, 0.40, 0]);

  box(t3, 2.25, 1.65, 2.85, M.marbleBase, [0, 1.30, 0]);
  box(t3, 0.85, 1.25, 0.12, M.wood, [0, 1.10, 1.44]);

  for (let cx = -1.42; cx <= 1.42; cx += 0.71) {
    cyl(t3, 0.10, 0.12, 1.65, 14, M.marbleBright, [cx, 1.30, 1.88]);
    cyl(t3, 0.10, 0.12, 1.65, 14, M.marbleBright, [cx, 1.30, -1.88]);
  }
  for (let cz = -1.25; cz <= 1.25; cz += 0.625) {
    cyl(t3, 0.10, 0.12, 1.65, 14, M.marbleBright, [-1.42, 1.30, cz]);
    cyl(t3, 0.10, 0.12, 1.65, 14, M.marbleBright, [1.42, 1.30, cz]);
  }

  box(t3, 3.18, 0.18, 4.08, M.marbleBright, [0, 2.21, 0]);
  box(t3, 3.24, 0.09, 4.14, M.trim, [0, 2.33, 0]);
  buildGreekPedimentRoof(t3, 3.30, 4.20, 0.68, M.roof, M.marbleBright, M.trim, M.gold, M.divineGlow, 2.38, allSymbols);

  buildStandingDeityStatue(t3, M.marbleBright, M.trim, M.gold, M.divineGlow, [-2.45, 0, 0.65], 1.12, allSymbols);

  for (const [tx, tz] of [[-1.95, 1.95], [1.95, 1.95], [1.95, -1.65]]) {
    const tree = group(t3, tx, 0, tz);
    cyl(tree, 0.05, 0.08, 0.35, 8, M.wood, [0, 0.17, 0]);
    cyl(tree, 0.02, 0.28, 1.65, 10, M.foliage, [0, 1.05, 0]);
  }
  const bT3 = buildSacredBrazier(t3, M.gold, M.flame, [-1.15, 0.48, 2.22], 1.0);
  allFlames.push(bT3.flame);
  tierGroups[3] = t3;

  // ========================================================================
  // TIER 4 — GRANDE TEMPLO MÍTICO
  // ========================================================================
  const t4 = group(root, 0, 0, 0);
  box(t4, 4.45, 0.24, 5.15, M.marbleBase, [0, 0.12, 0]);
  box(t4, 4.25, 0.24, 4.95, M.marbleBright, [0, 0.36, 0]);
  box(t4, 4.30, 0.08, 5.00, M.gold, [0, 0.50, 0]);

  for (let s = 0; s < 4; s++) {
    box(t4, 1.85 - s * 0.06, 0.12, 0.72 - s * 0.14, M.marbleBright, [0, 0.06 + s * 0.12, 2.75 - s * 0.08]);
  }

  box(t4, 2.75, 1.95, 3.35, M.marbleBase, [0, 1.50, -0.15]);
  box(t4, 1.05, 1.45, 0.14, M.gold, [0, 1.25, 1.54]);

  for (let cx = -1.68; cx <= 1.68; cx += 0.56) {
    const isCorner = Math.abs(cx) > 1.5;
    cyl(t4, 0.11, 0.13, 1.95, 14, isCorner ? M.gold : M.marbleBright, [cx, 1.50, 2.05]);
    cyl(t4, 0.11, 0.13, 1.95, 14, isCorner ? M.gold : M.marbleBright, [cx, 1.50, -2.25]);
  }
  for (let cz = -1.65; cz <= 1.45; cz += 0.62) {
    cyl(t4, 0.11, 0.13, 1.95, 14, M.marbleBright, [-1.68, 1.50, cz]);
    cyl(t4, 0.11, 0.13, 1.95, 14, M.marbleBright, [1.68, 1.50, cz]);
  }

  box(t4, 3.72, 0.20, 4.65, M.marbleBright, [0, 2.57, -0.10]);
  box(t4, 3.78, 0.10, 4.71, M.trim, [0, 2.71, -0.10]);
  box(t4, 3.82, 0.08, 4.75, M.gold, [0, 2.80, -0.10]);
  buildGreekPedimentRoof(t4, 3.86, 4.80, 0.82, M.roof, M.marbleBright, M.trim, M.gold, M.divineGlow, 2.84, allSymbols);

  buildStandingDeityStatue(t4, M.marbleBright, M.trim, M.gold, M.divineGlow, [-2.55, 0, 1.65], 1.15, allSymbols);
  buildStandingDeityStatue(t4, M.marbleBright, M.trim, M.gold, M.divineGlow, [2.55, 0, 1.65], 1.15, allSymbols);

  const bT4L = buildSacredBrazier(t4, M.gold, M.flame, [-1.25, 0.54, 2.38], 1.15);
  const bT4R = buildSacredBrazier(t4, M.gold, M.flame, [1.25, 0.54, 2.38], 1.15);
  allFlames.push(bT4L.flame, bT4R.flame);
  tierGroups[4] = t4;

  // ========================================================================
  // TIER 5 — MARAVILHA OLÍMPICA
  // ========================================================================
  const t5 = group(root, 0, 0, 0);

  box(t5, 5.45, 0.16, 5.65, M.marbleBase, [0, 0.08, 0]);
  box(t5, 5.20, 0.16, 5.40, M.marbleBright, [0, 0.24, 0]);
  box(t5, 4.92, 0.08, 5.12, M.wonderFloor, [0, 0.34, 0]);

  const colY = 0.36;
  const colH = 2.05;
  for (let cz = -2.15; cz <= 2.15; cz += 0.716) {
    cyl(t5, 0.12, 0.14, colH, 16, M.marbleBright, [-2.18, colY + colH * 0.5, cz]);
    cyl(t5, 0.12, 0.14, colH, 16, M.marbleBright, [2.18, colY + colH * 0.5, cz]);
  }
  for (let cx = -1.45; cx <= 1.45; cx += 0.725) {
    cyl(t5, 0.12, 0.14, colH, 16, M.marbleBright, [cx, colY + colH * 0.5, -2.18]);
  }

  const entY = colY + colH;
  box(t5, 0.44, 0.20, 4.78, M.marbleBright, [-2.18, entY + 0.10, 0]);
  box(t5, 0.48, 0.09, 4.82, M.trim, [-2.18, entY + 0.24, 0]);
  box(t5, 0.50, 0.06, 4.84, M.gold, [-2.18, entY + 0.31, 0]);

  box(t5, 0.44, 0.20, 4.78, M.marbleBright, [2.18, entY + 0.10, 0]);
  box(t5, 0.48, 0.09, 4.82, M.trim, [2.18, entY + 0.24, 0]);
  box(t5, 0.50, 0.06, 4.84, M.gold, [2.18, entY + 0.31, 0]);

  box(t5, 4.78, 0.20, 0.44, M.marbleBright, [0, entY + 0.10, -2.18]);
  box(t5, 4.82, 0.09, 0.48, M.trim, [0, entY + 0.24, -2.18]);
  box(t5, 4.84, 0.06, 0.50, M.gold, [0, entY + 0.31, -2.18]);

  const colossalDeity = buildColossalEnthronedDeity(t5, M.gold, M.trim, M.marbleBright, M.divineGlow, [0, 0.38, -0.55], allSymbols);

  const bT5L = buildSacredBrazier(t5, M.gold, M.flame, [-1.22, 0.38, 1.35], 1.32);
  const bT5R = buildSacredBrazier(t5, M.gold, M.flame, [1.22, 0.38, 1.35], 1.32);
  allFlames.push(bT5L.flame, bT5R.flame);

  for (let cz = -2.1; cz <= 2.1; cz += 1.05) {
    for (const sx of [-1, 1]) {
      const tree = group(t5, sx * 2.95, 0, cz);
      cyl(tree, 0.05, 0.08, 0.35, 8, M.wood, [0, 0.17, 0]);
      cyl(tree, 0.02, 0.26, 1.65, 10, M.foliage, [0, 1.05, 0]);
    }
  }

  tierGroups[5] = t5;

  // AURA DE FAVOR NO SOLO
  const favorRing = new THREE.Mesh(
    new THREE.RingGeometry(3.55, 3.92, 64),
    new THREE.MeshBasicMaterial({
      color: theme.glowHex,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  favorRing.rotation.x = -Math.PI / 2;
  favorRing.position.y = 0.03;
  root.add(favorRing);

  let currentTier = initialTier;

  function setTier(tier: number) {
    currentTier = tier;
    for (let k = 1; k <= 5; k++) {
      if (tierGroups[k]) {
        tierGroups[k].visible = (k === tier);
      }
    }
  }

  function applyGod(godKey: GreekTempleGodKey) {
    const next = GREEK_TEMPLE_THEMES[godKey] || GREEK_TEMPLE_THEMES.zeus;
    M.marbleBase.color.setHex(next.marbleBase);
    M.marbleBright.color.setHex(next.marbleBright);
    M.trim.color.setHex(next.trimHex);
    M.gold.color.setHex(next.goldHex);
    M.flame.color.setHex(next.flameHex);
    M.divineGlow.emissive.setHex(next.glowHex);
    favorRing.material.color.setHex(next.glowHex);

    allSymbols.forEach(sym => {
      sym.zeusBolt.visible = (godKey === 'zeus');
      sym.poseidonTrident.visible = (godKey === 'poseidon');
      sym.hadesBident.visible = (godKey === 'hades');
    });

    if (M.roof.map) M.roof.map.dispose();
    M.roof.map = createTiledRoofTexture(next);
    M.roof.needsUpdate = true;
  }

  setTier(initialTier);
  applyGod(initialGod);

  return {
    root,
    tierGroups,
    colossalDeity,
    favorRing,
    allFlames,
    allSymbols,
    materials: M,
    setTier,
    applyGod,
    getTier: () => currentTier
  };
}

export function buildGreekTempleStudio(
  godKey: GreekTempleGodKey = 'zeus',
  tier = 5,
  _enableShadows = true
): GreekTempleSystemResult {
  return buildGreekTempleSystem(godKey, tier);
}

/**
 * Lightweight in-game procedural Greek Temple building for the battlefield.
 */
export function buildProceduralGreekTemple(
  groupTarget: THREE.Group,
  age = 1,
  godKey = 'zeus'
): { beaconCrystal: THREE.Object3D; allFlames?: THREE.Mesh[] } {
  const normGod = (
    godKey.includes('poseidon') ? 'poseidon' : godKey.includes('hades') ? 'hades' : 'zeus'
  ) as GreekTempleGodKey;

  const effTier = Math.max(1, Math.min(5, age));
  const sys = buildGreekTempleSystem(normGod, effTier);
  groupTarget.add(sys.root);

  // Return top beacon for standard game aura
  const beaconCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.MeshBasicMaterial({
      color: GREEK_TEMPLE_THEMES[normGod].glowHex,
      wireframe: true
    })
  );
  beaconCrystal.position.y = 4.2 + (effTier >= 4 ? 1.0 : 0);
  groupTarget.add(beaconCrystal);

  return { beaconCrystal, allFlames: sys.allFlames };
}
