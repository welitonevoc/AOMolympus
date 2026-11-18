import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO VISUAL DAS 3 DIVINDADES ATLANTES (KRONOS, ORANOS E GAIA)
   ========================================================================== */
export interface AtlanteanFortressTheme {
  id: 'kronos' | 'oranos' | 'gaia';
  godName: string;
  t3Title: string;
  t3Sub: string;
  t4Title: string;
  t4Sub: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  wallColor: number;
  t4WallColor: number;
  trimStone: number;      // Pedra cinza-ardósia / azul-celeste / verde com relevos
  accentBand: number;     // Azul-índigo / ouro / esmeralda nas faixas superiores
  orichalcum: number;
  statueColor: number;
  glowHex: number;
  boltHex: number;
  groundGrass: string;
  groundDirt: string;
  vineDensity: number;
}

export const ATLANTEAN_FORTRESS_THEMES: Record<string, AtlanteanFortressTheme> = {
  kronos: {
    id: 'kronos',
    godName: 'Kronos',
    t3Title: 'Palácio de Kronos • Tier 3 (Era Heroica)',
    t3Sub: 'Bastião octogonal com 3 cúpulas piramidais escalonadas, pilastras em azul-índigo cronológico, porta de Oricalco dourado e pátio elevado',
    t4Title: 'Cidadela Temporal de Kronos • Tier 4 (Era Mítica)',
    t4Sub: 'Fortaleza palaciana monumental de alas duplas paralelas, telhados trapezoidais escalonados, frisos azul-cobalto e Guardião Titânico de pedra',
    bgHex: 0x0b1324,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e1b4b,
    rimHex: 0x38bdf8,
    wallColor: 0xe5e0d5,
    t4WallColor: 0xf1ece1,
    trimStone: 0x475569,      // Pedra cinza-ardósia com relevos
    accentBand: 0x2563eb,     // Azul-índigo / cobalto nas faixas superiores
    orichalcum: 0xfacc15,
    statueColor: 0x78716c,
    glowHex: 0x38bdf8,
    boltHex: 0x7dd3fc,
    groundGrass: '#56822d',
    groundDirt: '#bfa378',
    vineDensity: 0.6
  },
  oranos: {
    id: 'oranos',
    godName: 'Oranos',
    t3Title: 'Palácio Celeste de Oranos • Tier 3 (Era Heroica)',
    t3Sub: 'Mármore branco-pérola com cúpulas piramidais esculpidas, frisos azul-céu, porta de Oricalco solar e brisa olímpica',
    t4Title: 'Cidadela dos Céus de Oranos • Tier 4 (Era Mítica)',
    t4Sub: 'Fortaleza dupla monumental de mármore alvo com telhados escalonados celestes, faixas douradas e Guardião Alado de pedra',
    bgHex: 0x091c30,
    hemiSky: 0xfef9c3,
    hemiGround: 0x0369a1,
    rimHex: 0xfacc15,
    wallColor: 0xf8fafc,
    t4WallColor: 0xffffff,
    trimStone: 0x38bdf8,      // Azul-celeste brilhante nas molduras
    accentBand: 0xfacc15,     // Ouro solar nos frisos
    orichalcum: 0xfde047,
    statueColor: 0xcbd5e1,
    glowHex: 0xfacc15,
    boltHex: 0xfef08a,
    groundGrass: '#5c8d32',
    groundDirt: '#cbb082',
    vineDensity: 0.35
  },
  gaia: {
    id: 'gaia',
    godName: 'Gaia',
    t3Title: 'Palácio da Terra de Gaia • Tier 3 (Era Heroica)',
    t3Sub: 'Santuário octogonal de mármore marfim coberto por heras e vinhas exuberantes, cúpulas escalonadas e frisos verde-esmeralda',
    t4Title: 'Cidadela Viva de Gaia • Tier 4 (Era Mítica)',
    t4Sub: 'Complexo duplo monumental envolto em vegetação sagrada, telhados escalonados de pedra antiga, frisos esmeralda e Guardião da Terra',
    bgHex: 0x061812,
    hemiSky: 0xd1fae5,
    hemiGround: 0x064e3b,
    rimHex: 0x10b981,
    wallColor: 0xe7e2d3,
    t4WallColor: 0xf0ece0,
    trimStone: 0x065f46,      // Verde-esmeralda profundo nas pilastras e cúpulas
    accentBand: 0x10b981,     // Esmeralda luminoso
    orichalcum: 0xf59e0b,
    statueColor: 0x57534e,
    glowHex: 0x10b981,
    boltHex: 0x6ee7b7,
    groundGrass: '#3e7326',
    groundDirt: '#9e845c',
    vineDensity: 1.0
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR (ESTUQUE ATLANTE, RELEVOS ESPIRAIS E TELHAS)
   ========================================================================== */
export function createAtlanteanWallTexture(isT4: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Estuque de mármore claro com base de pedra talhada
  ctx.fillStyle = isT4 ? '#eee9dd' : '#e2dcd0';
  ctx.fillRect(0, 0, 512, 512);

  // Textura sutil de reboco antigo
  for (let i = 0; i < 3200; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(60,55,45,0.08)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 6, 6);
  }

  // Faixa inferior de blocos de pedra esculpida
  ctx.fillStyle = 'rgba(110, 105, 95, 0.35)';
  ctx.fillRect(0, 415, 512, 97);
  ctx.strokeStyle = 'rgba(40, 38, 35, 0.45)';
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 64) {
    ctx.strokeRect(x, 415, 64, 48);
    ctx.strokeRect(x + 32, 463, 64, 49);
  }

  // Friso superior com espirais e ondas atlantes em relevo
  ctx.fillStyle = 'rgba(95, 90, 80, 0.32)';
  ctx.fillRect(0, 0, 512, 68);
  ctx.strokeStyle = 'rgba(35, 32, 28, 0.55)';
  ctx.lineWidth = 3;
  for (let x = 16; x < 512; x += 36) {
    ctx.beginPath();
    ctx.arc(x, 34, 12, 0, Math.PI * 1.65);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSteppedRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(0, 0, 512, 512);

  // Degraus horizontais de pedra talhada das cúpulas e telhados atlantes
  const steps = 16;
  const stepH = 512 / steps;
  for (let s = 0; s < steps; s++) {
    const y = s * stepH;
    const grad = ctx.createLinearGradient(0, y, 0, y + stepH);
    grad.addColorStop(0, 'rgba(255,255,255,0.22)');
    grad.addColorStop(0.75, 'rgba(120,115,108,0.15)');
    grad.addColorStop(1, 'rgba(20,20,22,0.52)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 512, stepH);

    // Juntas verticais alternadas entre os blocos
    ctx.strokeStyle = 'rgba(25, 25, 28, 0.42)';
    ctx.lineWidth = 2;
    const off = s % 2 === 0 ? 0 : 32;
    for (let x = -32; x < 512; x += 64) {
      ctx.strokeRect(x + off, y, 64, stepH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCarvedTrimTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 256, 512);

  // Glifos e espirais atlantes gravados nas pilastras e molduras
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.52)';
  ctx.lineWidth = 4;
  for (let y = 24; y < 512; y += 44) {
    ctx.strokeRect(18, y - 14, 220, 32);
    ctx.beginPath();
    ctx.arc(72, y + 2, 10, 0, Math.PI * 1.75);
    ctx.moveTo(128, y - 8);
    ctx.lineTo(128, y + 12);
    ctx.arc(184, y + 2, 10, Math.PI, Math.PI * 2.75);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createAtlanteanGroundTexture(theme: AtlanteanFortressTheme): THREE.CanvasTexture {
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
  dirtGrad.addColorStop(0, theme.groundDirt);
  dirtGrad.addColorStop(0.76, theme.groundDirt);
  dirtGrad.addColorStop(1, 'rgba(191, 163, 120, 0)');
  ctx.fillStyle = dirtGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Lajes de pedra antiga no caminho frontal
  ctx.fillStyle = 'rgba(135, 125, 110, 0.55)';
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

// Cúpula Piramidal Curva Escalonada Atlante (Iconografia central de Kronos, Oranos e Gaia)
function buildAtlanteanCurvedDome(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  roofMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Group {
  const dGroup = group(parent, pos[0], pos[1], pos[2]);

  // Base octogonal de transição com cornija esculpida
  cyl(dGroup, radius * 1.04, radius * 1.08, 0.22, 8, trimMat, [0, 0.11, 0], [0, Math.PI / 8, 0], castShadow);
  cyl(dGroup, radius * 1.07, radius * 1.07, 0.06, 8, goldMat, [0, 0.23, 0], [0, Math.PI / 8, 0], castShadow);

  // Corpo piramidal octogonal suavemente arqueado (Lathe de 8 lados)
  const pts = [
    new THREE.Vector2(radius * 1.02, 0.24),
    new THREE.Vector2(radius * 0.94, 0.24 + height * 0.25),
    new THREE.Vector2(radius * 0.78, 0.24 + height * 0.55),
    new THREE.Vector2(radius * 0.54, 0.24 + height * 0.82),
    new THREE.Vector2(radius * 0.32, 0.24 + height)
  ];
  const domeGeo = new THREE.LatheGeometry(pts, 8);
  domeGeo.rotateY(Math.PI / 8);
  const domeMesh = new THREE.Mesh(domeGeo, roofMat);
  domeMesh.castShadow = castShadow;
  domeMesh.receiveShadow = true;
  dGroup.add(domeMesh);

  // Nervuras angulares esculpidas nas 8 arestas da cúpula
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.11, height * 1.05, 0.14), trimMat);
    rib.position.set(Math.cos(a) * radius * 0.66, 0.24 + height * 0.5, Math.sin(a) * radius * 0.66);
    rib.rotation.set(0, -a, 0.42);
    rib.castShadow = castShadow;
    dGroup.add(rib);
  }

  // Lanterna / Pináculo escalonado atlante no topo da cúpula
  const topY = 0.24 + height;
  cyl(dGroup, radius * 0.36, radius * 0.40, 0.16, 8, trimMat, [0, topY + 0.08, 0], [0, Math.PI / 8, 0], castShadow);
  cyl(dGroup, radius * 0.26, radius * 0.30, 0.18, 8, roofMat, [0, topY + 0.25, 0], [0, Math.PI / 8, 0], castShadow);
  cyl(dGroup, radius * 0.20, radius * 0.24, 0.14, 8, trimMat, [0, topY + 0.41, 0], [0, Math.PI / 8, 0], castShadow);
  cyl(dGroup, 0.04, radius * 0.14, 0.18, 8, goldMat, [0, topY + 0.56, 0], [0, Math.PI / 8, 0], castShadow);

  return dGroup;
}

// Telhado Trapezoidal Escalonado Alongado (Iconografia do Tier 4 - Cidadela de Alas Duplas)
function buildAtlanteanSteppedLongRoof(
  parent: THREE.Object3D,
  length: number,
  widthBot: number,
  height: number,
  roofMat: THREE.Material,
  trimMat: THREE.Material,
  accentMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  castShadow = true
): THREE.Group {
  const rGroup = group(parent, pos[0], pos[1], pos[2]);

  // Cornija dupla colorida na base do telhado
  box(rGroup, length + 0.24, 0.14, widthBot + 0.24, trimMat, [0, 0.07, 0], [0, 0, 0], castShadow);
  box(rGroup, length + 0.28, 0.08, widthBot + 0.28, accentMat, [0, 0.17, 0], [0, 0, 0], castShadow);

  // Corpo trapezoidal inclinado de 4 águas escalonadas
  const rxB = length * 0.5;
  const rzB = widthBot * 0.5;
  const rxT = length * 0.44;
  const rzT = widthBot * 0.18;
  const y0 = 0.21;
  const y1 = 0.21 + height;

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
     rxB, y0, rzB,   rxT, y1, -rzT,  rxT, y1, rzT,
    // Topo
    -rxT, y1, rzT,   rxT, y1, rzT,   rxT, y1, -rzT,
    -rxT, y1, rzT,   rxT, y1, -rzT, -rxT, y1, -rzT
  ]);
  const uvs = new Float32Array(30 * 2);
  for (let i = 0; i < 30; i++) {
    uvs[i * 2] = (verts[i * 3] + rxB) / length;
    uvs[i * 2 + 1] = (verts[i * 3 + 1] - y0) / height;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  const roofMesh = new THREE.Mesh(geom, roofMat);
  roofMesh.castShadow = castShadow;
  roofMesh.receiveShadow = true;
  rGroup.add(roofMesh);

  // Cumeeira central elevada + Torres de ponta nos extremos do telhado
  box(rGroup, length * 0.88, 0.22, widthBot * 0.34, trimMat, [0, y1 + 0.11, 0], [0, 0, 0], castShadow);
  box(rGroup, length * 0.90, 0.06, widthBot * 0.38, accentMat, [0, y1 + 0.24, 0], [0, 0, 0], castShadow);

  for (const sx of [-1, 1]) {
    const capX = sx * (length * 0.38);
    box(rGroup, 0.56, 0.34, widthBot * 0.44, trimMat, [capX, y1 + 0.15, 0], [0, 0, 0], castShadow);
    box(rGroup, 0.60, 0.07, widthBot * 0.48, accentMat, [capX, y1 + 0.34, 0], [0, 0, 0], castShadow);
  }

  return rGroup;
}

// Estátua Guardiã Titânica Atlante no Nicho Lateral
function buildAtlanteanTitanStatue(
  parent: THREE.Object3D,
  statueMat: THREE.Material,
  accentMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  castShadow = true
): THREE.Group {
  const stGroup = group(parent, pos[0], pos[1], pos[2]);
  stGroup.scale.setScalar(scale);

  // Pedestal escalonado com faixa iluminada da divindade
  box(stGroup, 0.85, 0.42, 0.85, statueMat, [0, 0.21, 0], [0, 0, 0], castShadow);
  box(stGroup, 0.92, 0.12, 0.92, accentMat, [0, 0.46, 0], [0, 0, 0], castShadow);
  box(stGroup, 0.88, 0.06, 0.88, goldMat, [0, 0.54, 0], [0, 0, 0], castShadow);

  // Colosso/Titã esculpido em pedra bruta e Oricalco
  const fig = group(stGroup, 0, 0.58, 0);
  // Pernas maciças de pedra
  box(fig, 0.22, 0.65, 0.24, statueMat, [-0.15, 0.32, 0.04], [0, 0, 0], castShadow);
  box(fig, 0.22, 0.65, 0.24, statueMat, [0.15, 0.32, -0.04], [0, 0, 0], castShadow);
  // Cinturão de Oricalco
  box(fig, 0.58, 0.14, 0.38, accentMat, [0, 0.70, 0], [0, 0, 0], castShadow);
  // Tronco largo titânico com ombreiras de rocha
  box(fig, 0.68, 0.62, 0.40, statueMat, [0, 1.06, 0], [0, 0, 0], castShadow);
  box(fig, 0.26, 0.24, 0.44, statueMat, [-0.42, 1.26, 0], [0, 0, 0.25], castShadow);
  box(fig, 0.26, 0.24, 0.44, statueMat, [0.42, 1.26, 0], [0, 0, -0.25], castShadow);
  // Cabeça com barba esculpida e coroa atlante
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), statueMat);
  head.position.set(0, 1.52, 0.04);
  head.castShadow = castShadow;
  fig.add(head);
  cyl(fig, 0.17, 0.17, 0.08, 8, goldMat, [0, 1.66, 0.04], [0, 0, 0], castShadow);

  // Braços cruzados sobre o martelo/cetro monumental
  box(fig, 0.20, 0.58, 0.22, statueMat, [-0.42, 0.94, 0.12], [-0.45, 0, 0.2], castShadow);
  box(fig, 0.20, 0.58, 0.22, statueMat, [0.42, 0.94, 0.12], [-0.45, 0, -0.2], castShadow);
  cyl(fig, 0.04, 0.04, 1.45, 8, goldMat, [0, 0.78, 0.32], [0, 0, 0], castShadow);

  return stGroup;
}

// Vinhas e arbustos nas paredes (especialmente exuberante para Gaia)
function buildWallVines(
  parent: THREE.Object3D,
  foliageMat: THREE.Material,
  spots: [number, number, number, number][]
): THREE.Group {
  const vGroup = group(parent, 0, 0, 0);
  spots.forEach(([vx, vy, vz, sc]) => {
    const cluster = group(vGroup, vx, vy, vz);
    cluster.scale.setScalar(sc);
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), foliageMat);
      leaf.position.set(
        (Math.random() - 0.5) * 0.35,
        i * 0.22,
        (Math.random() - 0.5) * 0.25
      );
      cluster.add(leaf);
    }
  });
  return vGroup;
}

/* ==========================================================================
   4. CONSTRUÇÃO COMPLETA DO PALÁCIO / FORTALEZA ATLANTE (T3 -> T4)
   ========================================================================== */
export type AtlanteanFortressAction = 'guarnicao' | 'defesa' | 'bencao';

export interface AtlanteanFortressInstance {
  root: THREE.Group;
  tier3Group: THREE.Group;
  tier4Group: THREE.Group;
  coreCrystal: THREE.Mesh;
  divineRing: THREE.Mesh;
  setTier: (tier: number) => void;
  applyGod: (godKey: 'kronos' | 'oranos' | 'gaia' | string) => void;
  getTier: () => number;
}

export function buildAtlanteanFortress(
  initialGod: string = 'kronos',
  initialTier: number = 3,
  enableShadows: boolean = true
): AtlanteanFortressInstance {
  const normGod = initialGod.toLowerCase();
  const theme =
    normGod.includes('oranos') || normGod.includes('urano')
      ? ATLANTEAN_FORTRESS_THEMES.oranos
      : normGod.includes('gaia')
      ? ATLANTEAN_FORTRESS_THEMES.gaia
      : ATLANTEAN_FORTRESS_THEMES.kronos;

  const M = {
    wallT3: new THREE.MeshStandardMaterial({
      map: createAtlanteanWallTexture(false),
      color: theme.wallColor,
      roughness: 0.62,
      metalness: 0.08
    }),
    wallT4: new THREE.MeshStandardMaterial({
      map: createAtlanteanWallTexture(true),
      color: theme.t4WallColor,
      roughness: 0.54,
      metalness: 0.12
    }),
    trimStone: new THREE.MeshStandardMaterial({
      map: createCarvedTrimTexture(),
      color: theme.trimStone,
      roughness: 0.45,
      metalness: 0.28
    }),
    accentBand: new THREE.MeshStandardMaterial({
      color: theme.accentBand,
      roughness: 0.35,
      metalness: 0.42
    }),
    roofStepped: new THREE.MeshStandardMaterial({
      map: createSteppedRoofTexture(),
      roughness: 0.58,
      metalness: 0.14
    }),
    orichalcum: new THREE.MeshStandardMaterial({
      color: theme.orichalcum,
      emissive: 0x3b2200,
      emissiveIntensity: 0.28,
      metalness: 0.92,
      roughness: 0.18
    }),
    darkInterior: new THREE.MeshStandardMaterial({
      color: 0x161822,
      roughness: 0.9
    }),
    statue: new THREE.MeshStandardMaterial({
      color: theme.statueColor,
      roughness: 0.55,
      metalness: 0.18
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x2d6a27,
      roughness: 0.82
    }),
    beaconMat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.glowHex,
      emissiveIntensity: 3.0,
      roughness: 0.1
    })
  };

  const root = new THREE.Group();

  // ========================================================================
  // A. ESTRUTURA TIER 3 — PALÁCIO ATLANTE DE 3 CÚPULAS
  //    Corpo octogonal com pátio frontal elevado em lajes, duas torres
  //    octogonais laterais e uma torre central alta com cúpulas curvas!
  // ========================================================================
  const tier3Group = group(root, 0, 0, 0);

  // Embazamento octogonal de pedra
  cyl(tier3Group, 2.55, 2.65, 0.24, 8, M.trimStone, [0, 0.12, 0.15], [0, Math.PI / 8, 0], enableShadows);

  // 1. Corpo Frontal Octogonal Baixo com Terraço Superior
  const frontOctagon = group(tier3Group, 0, 0.24, 0.55);
  cyl(frontOctagon, 2.05, 2.12, 1.55, 8, M.wallT3, [0, 0.775, 0], [0, Math.PI / 8, 0], enableShadows);
  cyl(frontOctagon, 2.16, 2.10, 0.16, 8, M.trimStone, [0, 1.60, 0], [0, Math.PI / 8, 0], enableShadows);
  cyl(frontOctagon, 1.92, 1.92, 0.06, 8, M.roofStepped, [0, 1.69, 0], [0, Math.PI / 8, 0], enableShadows);
  for (const px of [-0.58, 0.58]) {
    box(frontOctagon, 0.22, 0.26, 0.22, M.trimStone, [px, 1.78, 1.88], [0, 0, 0], enableShadows);
  }

  // Janelas duplas verticais nas faces dianteiras
  for (const side of [-1, 1]) {
    const winGroup = group(frontOctagon, side * 1.15, 0.78, 1.58);
    winGroup.rotation.y = side * 0.55;
    box(winGroup, 0.12, 0.36, 0.06, M.darkInterior, [-0.10, 0, 0], [0, 0, 0], false);
    box(winGroup, 0.12, 0.36, 0.06, M.darkInterior, [0.10, 0, 0], [0, 0, 0], false);
  }

  // 2. Pórtico Frontal com Pilastras Esculpidas e Porta de Oricalco Dourado com Argola
  const gateT3 = group(tier3Group, 0, 0.24, 2.52);
  for (const side of [-1, 1]) {
    box(gateT3, 0.26, 1.48, 0.36, M.trimStone, [side * 0.48, 0.74, -0.05], [0, 0, 0], enableShadows);
    box(gateT3, 0.38, 0.95, 0.34, M.wallT3, [side * 0.78, 0.475, -0.14], [0, 0, 0], enableShadows);
    box(gateT3, 0.44, 0.12, 0.40, M.trimStone, [side * 0.78, 0.98, -0.14], [0, 0, 0], enableShadows);
  }
  box(gateT3, 0.64, 1.16, 0.14, M.orichalcum, [0, 0.58, -0.06], [0, 0, 0], enableShadows);
  const doorRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 8, 20), M.trimStone);
  doorRing.position.set(0, 0.62, 0.03);
  doorRing.castShadow = enableShadows;
  gateT3.add(doorRing);
  box(gateT3, 0.98, 0.24, 0.42, M.trimStone, [0, 1.32, -0.04], [0, 0, 0], enableShadows);
  box(gateT3, 0.62, 0.16, 0.44, M.trimStone, [0, 1.50, -0.04], [0, 0, 0], enableShadows);

  // 3. Torre Lateral Esquerda com Cúpula Piramidal Escalonada
  const towerL = group(tier3Group, -1.78, 0.24, -0.15);
  cyl(towerL, 1.12, 1.16, 1.92, 8, M.wallT3, [0, 0.96, 0], [0, Math.PI / 8, 0], enableShadows);
  buildAtlanteanCurvedDome(towerL, 1.14, 1.25, M.roofStepped, M.trimStone, M.orichalcum, [0, 1.92, 0], enableShadows);

  // 4. Torre Lateral Direita com Cúpula Piramidal Escalonada
  const towerR = group(tier3Group, 1.78, 0.24, -0.15);
  cyl(towerR, 1.12, 1.16, 1.92, 8, M.wallT3, [0, 0.96, 0], [0, Math.PI / 8, 0], enableShadows);
  buildAtlanteanCurvedDome(towerR, 1.14, 1.25, M.roofStepped, M.trimStone, M.orichalcum, [0, 1.92, 0], enableShadows);

  // 5. Torre Central Principal Mais Alta e Imponente
  const towerCenter = group(tier3Group, 0, 0.24, -0.95);
  cyl(towerCenter, 1.42, 1.48, 2.25, 8, M.wallT3, [0, 1.125, 0], [0, Math.PI / 8, 0], enableShadows);
  buildAtlanteanCurvedDome(towerCenter, 1.45, 1.65, M.roofStepped, M.trimStone, M.orichalcum, [0, 2.25, 0], enableShadows);

  // Vinhas e arbustos nas paredes do Palácio T3
  const vinesT3 = buildWallVines(tier3Group, M.foliage, [
    [-1.25, 0.24, 1.85, 1.0],
    [1.35, 0.24, 1.75, 1.15],
    [-2.45, 0.24, 0.45, 0.9]
  ]);

  // ========================================================================
  // B. ESTRUTURA TIER 4 — CIDADELA IMPERIAL DE ALAS DUPLAS
  //    Dois grandes pavilhões alongados paralelos com telhados trapezoidais
  //    escalonados, corpo central elevado, faixas coloridas brilhantes,
  //    pórtico fortificado e a Estátua Titânica Guardiã no nicho direito!
  // ========================================================================
  const tier4Group = group(root, 0, 0, 0);
  tier4Group.visible = false;

  // Base imperial
  box(tier4Group, 4.85, 0.26, 4.45, M.trimStone, [0, 0.13, 0], [0, 0, 0], enableShadows);
  box(tier4Group, 4.92, 0.08, 4.52, M.accentBand, [0, 0.28, 0], [0, 0, 0], enableShadows);

  // 1. Ala Frontal Alongada com Telhado Escalonado Monumental
  const wingFront = group(tier4Group, 0, 0.32, 1.15);
  box(wingFront, 4.45, 2.35, 1.45, M.wallT4, [0, 1.175, 0], [0, 0, 0], enableShadows);
  for (const px of [-2.12, -0.72, 0.72, 2.12]) {
    box(wingFront, 0.24, 2.38, 1.54, M.trimStone, [px, 1.19, 0], [0, 0, 0], enableShadows);
  }
  box(wingFront, 4.52, 0.16, 1.52, M.trimStone, [0, 1.25, 0], [0, 0, 0], enableShadows);
  for (const sx of [-1, 1]) {
    box(wingFront, 0.10, 0.28, 0.10, M.darkInterior, [sx * 2.24, 1.75, -0.22], [0, 0, 0], false);
    box(wingFront, 0.10, 0.28, 0.10, M.darkInterior, [sx * 2.24, 1.75, 0.22], [0, 0, 0], false);
  }
  buildAtlanteanSteppedLongRoof(wingFront, 4.55, 1.52, 1.18, M.roofStepped, M.trimStone, M.accentBand, [0, 2.35, 0], enableShadows);

  // 2. Ala Traseira Alongada Paralela
  const wingBack = group(tier4Group, 0, 0.32, -1.15);
  box(wingBack, 4.45, 2.35, 1.45, M.wallT4, [0, 1.175, 0], [0, 0, 0], enableShadows);
  for (const px of [-2.12, -0.72, 0.72, 2.12]) {
    box(wingBack, 0.24, 2.38, 1.54, M.trimStone, [px, 1.19, 0], [0, 0, 0], enableShadows);
  }
  box(wingBack, 4.52, 0.16, 1.52, M.trimStone, [0, 1.25, 0], [0, 0, 0], enableShadows);
  buildAtlanteanSteppedLongRoof(wingBack, 4.55, 1.52, 1.18, M.roofStepped, M.trimStone, M.accentBand, [0, 2.35, 0], enableShadows);

  // 3. Corpo Central Conectando as Duas Alas com Terraço Elevado
  const centerBridge = group(tier4Group, 0, 0.32, 0);
  box(centerBridge, 3.65, 2.15, 1.25, M.wallT4, [0, 1.075, 0], [0, 0, 0], enableShadows);
  box(centerBridge, 3.75, 0.18, 1.35, M.trimStone, [0, 2.22, 0], [0, 0, 0], enableShadows);
  box(centerBridge, 3.45, 0.06, 1.05, M.roofStepped, [0, 2.32, 0], [0, 0, 0], enableShadows);

  // 4. Pórtico Frontal Fortificado de Entrada
  const gateT4 = group(tier4Group, -0.25, 0.32, 1.98);
  box(gateT4, 1.15, 1.25, 0.48, M.trimStone, [0, 0.625, 0], [0, 0, 0], enableShadows);
  box(gateT4, 0.62, 0.95, 0.52, M.orichalcum, [0, 0.475, 0.02], [0, 0, 0], enableShadows);
  box(gateT4, 1.28, 0.22, 0.56, M.trimStone, [0, 1.32, 0], [0, 0, 0], enableShadows);
  box(gateT4, 0.85, 0.16, 0.58, M.accentBand, [0, 1.48, 0], [0, 0, 0], enableShadows);

  // 5. Estátua Guardiã Titânica Atlante no Nicho Lateral Direito
  buildAtlanteanTitanStatue(tier4Group, M.statue, M.accentBand, M.orichalcum, [2.32, 0.32, 0.0], 1.05, enableShadows);

  // Vinhas nas paredes da Cidadela T4
  const vinesT4 = buildWallVines(tier4Group, M.foliage, [
    [1.85, 0.32, 1.92, 1.15],
    [1.85, 1.35, 0.78, 1.05],
    [2.15, 0.32, -1.85, 1.0]
  ]);

  // Núcleo / Cristal de Energia Atlante flutuando entre as duas alas no T4
  const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), M.beaconMat);
  coreCrystal.position.set(0, 3.15, 0);
  coreCrystal.castShadow = enableShadows;
  tier4Group.add(coreCrystal);

  // ========================================================================
  // C. AURA DE ATLÂNTIDA NO SOLO
  // ========================================================================
  const divineRing = new THREE.Mesh(
    new THREE.RingGeometry(3.25, 3.55, 64),
    new THREE.MeshBasicMaterial({
      color: theme.glowHex,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  divineRing.rotation.x = -Math.PI / 2;
  divineRing.position.y = 0.03;
  root.add(divineRing);

  let currentTier = initialTier;

  function setTier(tier: number) {
    currentTier = tier;
    const isT4 = tier >= 4;
    tier3Group.visible = !isT4;
    tier4Group.visible = isT4;
  }

  function applyGod(godKey: string) {
    const raw = (godKey || 'kronos').toLowerCase();
    const next =
      raw.includes('oranos') || raw.includes('urano')
        ? ATLANTEAN_FORTRESS_THEMES.oranos
        : raw.includes('gaia')
        ? ATLANTEAN_FORTRESS_THEMES.gaia
        : ATLANTEAN_FORTRESS_THEMES.kronos;

    M.wallT3.color.setHex(next.wallColor);
    M.wallT4.color.setHex(next.t4WallColor);
    M.trimStone.color.setHex(next.trimStone);
    M.accentBand.color.setHex(next.accentBand);
    M.orichalcum.color.setHex(next.orichalcum);
    M.statue.color.setHex(next.statueColor);
    M.beaconMat.emissive.setHex(next.glowHex);
    (divineRing.material as THREE.MeshBasicMaterial).color.setHex(next.glowHex);

    vinesT3.scale.setScalar(next.vineDensity);
    vinesT4.scale.setScalar(next.vineDensity);
  }

  setTier(initialTier);
  applyGod(initialGod);

  return {
    root,
    tier3Group,
    tier4Group,
    coreCrystal,
    divineRing,
    setTier,
    applyGod,
    getTier: () => currentTier
  };
}

export const buildAtlanteanFortressStudio = buildAtlanteanFortress;
