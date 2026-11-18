import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO DAS 3 DIVINDADES DO EGITO (RÁ, ÍSIS E SET) E TIERS T1–T5
   ========================================================================== */
export type EgyptianTempleGodKey = 'ra' | 'isis' | 'set';
export type EgyptianTempleAction = 'favor' | 'milagre';

export interface EgyptianTempleTierInfo {
  title: string;
  sub: string;
}

export interface EgyptianTempleTheme {
  id: EgyptianTempleGodKey;
  godName: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  sandstoneBase: number;
  sandstoneBright: number;
  trimHex: number;
  goldHex: number;
  flameHex: number;
  glowHex: number;
  groundGrass: string;
  groundDirt: string;
  tiers: Record<number, EgyptianTempleTierInfo>;
}

export const EGYPT_TEMPLE_THEMES: Record<EgyptianTempleGodKey, EgyptianTempleTheme> = {
  ra: {
    id: 'ra',
    godName: 'Rá',
    bgHex: 0x1f1408,
    hemiSky: 0xfef9c3,
    hemiGround: 0x854d0e,
    rimHex: 0xfacc15,
    sandstoneBase: 0xdec79b,
    sandstoneBright: 0xf2e4c6,
    trimHex: 0x1d4ed8,         // Azul-lápis-lazúli sagrado
    goldHex: 0xfacc15,
    flameHex: 0xf59e0b,
    glowHex: 0xfacc15,
    groundGrass: '#5c7739',
    groundDirt: '#c8a772',
    tiers: {
      1: { title: 'Altar Primitivo de Rá • Tier 1', sub: 'Santuário rústico em arenito talhado, colunas de madeira, pira solar e esteiras sagradas' },
      2: { title: 'Santuário Solar de Rá • Tier 2', sub: 'Pátio aberto com colunas em flor de papiro, portão com lintel cavetto e braseiros de cobre' },
      3: { title: 'Templo de Pilones de Rá • Tier 3', sub: 'Fachada monumental com dois pilões gêmeos com cornijas em azul lapis, obeliscos dourados e estátua de Faraó' },
      4: { title: 'Grande Templo Esfinge de Rá • Tier 4', sub: 'Santuário imperial com a majestosa Esfinge de Gizé guardando o átrio, pilões elevados e braseiros sagrados' },
      5: { title: 'Maravilha Pirâmide de Rá • Tier 5 (Ápice)', sub: 'Ápice supremo da fé egípcia: A Grande Pirâmide de calcário dourado com Capitel em Ouro Maciço e pilões protetores' }
    }
  },
  isis: {
    id: 'isis',
    godName: 'Ísis',
    bgHex: 0x071921,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0f766e,
    rimHex: 0x2dd4bf,
    sandstoneBase: 0xe2e8f0,
    sandstoneBright: 0xf8fafc,
    trimHex: 0x0d9488,         // Turquesa do Nilo
    goldHex: 0xfacc15,
    flameHex: 0x2dd4bf,
    glowHex: 0x2dd4bf,
    groundGrass: '#4d7c3f',
    groundDirt: '#cdb384',
    tiers: {
      1: { title: 'Altar de Ísis • Tier 1', sub: 'Santuário fluvial sagrado com oferendas de lótus e brasas turquesa' },
      2: { title: 'Santuário de Ísis • Tier 2', sub: 'Templo em calcário claro com colunas lótus e portão sagrado' },
      3: { title: 'Templo de Pilones de Ísis • Tier 3', sub: 'Templo com pilões de calcário branco, cornijas turquesa e símbolo ankh' },
      4: { title: 'Grande Templo de Ísis • Tier 4', sub: 'Santuário monumental com jardins suspensos, obeliscos e estátuas aladas' },
      5: { title: 'Maravilha Pirâmide de Ísis • Tier 5 (Ápice)', sub: 'Ápice arquitetônico: Pirâmide de calcário puro com capitel em ouro e cristal mágico' }
    }
  },
  set: {
    id: 'set',
    godName: 'Set',
    bgHex: 0x160906,
    hemiSky: 0xffedd5,
    hemiGround: 0x7c2d12,
    rimHex: 0xea580c,
    sandstoneBase: 0xc79c73,
    sandstoneBright: 0xd6b189,
    trimHex: 0xb91c1c,         // Vermelho-deserto / Terracota
    goldHex: 0xf59e0b,
    flameHex: 0xea580c,
    glowHex: 0xea580c,
    groundGrass: '#4f5d2f',
    groundDirt: '#a87d52',
    tiers: {
      1: { title: 'Altar Umbral de Set • Tier 1', sub: 'Santuário de pedra vermelha do deserto com braseiro de chamas abrasadoras' },
      2: { title: 'Santuário de Set • Tier 2', sub: 'Templo fortificado em arenito avermelhado com pilões baixos e estandartes de caçador' },
      3: { title: 'Templo de Pilones de Set • Tier 3', sub: 'Templo com pilões de arenito escuro, cornijas carmesim e o emblema bestial' },
      4: { title: 'Grande Templo do Caos • Tier 4', sub: 'Santuário monumental com estátuas de feras do deserto e braseiros de fogo infernal' },
      5: { title: 'Maravilha Pirâmide de Set • Tier 5 (Ápice)', sub: 'Ápice arquitetônico: Pirâmide avermelhada do caos com topo incandescente de fogo e ouro' }
    }
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR (ARENITO EGÍPCIO E LAJES DE TERRAÇO)
   ========================================================================== */
export function createEgyptianSandstoneTexture(isBright = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = isBright ? '#f2e4c6' : '#dec79b';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 14;
    const rowH = 512 / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const cols = 5;
      const colW = 512 / cols;
      const offset = (r % 2 === 0) ? 0 : colW * 0.5;

      for (let c = -1; c <= cols; c++) {
        const x = c * colW + offset;
        const shade = 220 + Math.floor((Math.random() - 0.5) * 20);
        ctx.fillStyle = `rgba(${shade}, ${shade - 18}, ${shade - 48}, 0.45)`;
        ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

        ctx.strokeStyle = 'rgba(92, 68, 36, 0.30)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createGroundTexture(theme: EgyptianTempleTheme, isT5 = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = theme.groundGrass;
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 6500; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(20, 35, 10, 0.14)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 10, 10);
    }

    const cx = 512, cy = 512;
    const dirtGrad = ctx.createRadialGradient(cx, cy, 190, cx, cy, 410);
    dirtGrad.addColorStop(0, theme.groundDirt);
    dirtGrad.addColorStop(0.76, theme.groundDirt);
    dirtGrad.addColorStop(1, 'rgba(200, 167, 114, 0)');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    if (isT5) {
      ctx.fillStyle = 'rgba(145, 125, 98, 0.65)';
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const r = 285 + (i % 3) * 35;
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
   3. HELPERS DE ARQUITETURA E ESTÁTUAS EGÍPCIAS
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

// Pilone Egípcio (Paredes inclinadas + Cornija Cavetto)
export function buildEgyptianPylon(
  parent: THREE.Object3D | null,
  wBot: number,
  dBot: number,
  h: number,
  stoneMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0]
): THREE.Group {
  const pGroup = group(parent, pos[0], pos[1], pos[2]);
  const wTop = wBot * 0.88;
  const dTop = dBot * 0.88;
  const rxB = wBot * 0.5, rzB = dBot * 0.5;
  const rxT = wTop * 0.5, rzT = dTop * 0.5;

  const geom = new THREE.BufferGeometry();
  const verts = new Float32Array([
    -rxB, 0, rzB,   rxB, 0, rzB,   rxT, h, rzT,
    -rxB, 0, rzB,   rxT, h, rzT,  -rxT, h, rzT,
     rxB, 0, -rzB, -rxB, 0, -rzB, -rxT, h, -rzT,
     rxB, 0, -rzB, -rxT, h, -rzT,  rxT, h, -rzT,
    -rxB, 0, -rzB, -rxB, 0, rzB,  -rxT, h, rzT,
    -rxB, 0, -rzB, -rxT, h, rzT,  -rxT, h, -rzT,
     rxB, 0, rzB,   rxB, 0, -rzB,  rxT, h, -rzT,
     rxB, 0, rzB,   rxT, h, -rzT,  rxT, h, rzT,
    -rxT, h, rzT,   rxT, h, rzT,   rxT, h, -rzT,
    -rxT, h, rzT,   rxT, h, -rzT, -rxT, h, -rzT
  ]);
  const uvs = new Float32Array(30 * 2);
  for (let i = 0; i < 30; i++) {
    uvs[i * 2] = (verts[i * 3] + rxB) / wBot;
    uvs[i * 2 + 1] = verts[i * 3 + 1] / h;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  const bodyMesh = new THREE.Mesh(geom, stoneMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  pGroup.add(bodyMesh);

  box(pGroup, wTop + 0.22, 0.14, dTop + 0.22, stoneMat, [0, h + 0.05, 0]);
  box(pGroup, wTop + 0.26, 0.08, dTop + 0.26, trimMat, [0, h + 0.14, 0]);
  box(pGroup, wTop + 0.10, 0.05, dTop + 0.10, goldMat, [0, h + 0.19, 0]);

  return pGroup;
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

export function buildSphinxStatue(
  parent: THREE.Object3D | null,
  stoneMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const sGroup = group(parent, pos[0], pos[1], pos[2]);
  sGroup.scale.setScalar(scale);

  box(sGroup, 2.25, 0.36, 1.25, stoneMat, [0, 0.18, 0]);
  box(sGroup, 2.32, 0.08, 1.32, goldMat, [0, 0.38, 0]);

  box(sGroup, 1.65, 0.55, 0.72, stoneMat, [0, 0.64, 0]);
  box(sGroup, 0.26, 0.32, 0.55, stoneMat, [-0.55, 0.32, 0.55]);
  box(sGroup, 0.26, 0.32, 0.55, stoneMat, [0.55, 0.32, 0.55]);

  const head = group(sGroup, 0, 1.12, -0.45);
  box(head, 0.42, 0.48, 0.42, stoneMat, [0, 0, 0]);
  box(head, 0.48, 0.42, 0.46, goldMat, [0, 0.05, -0.02]);
  box(head, 0.12, 0.28, 0.08, goldMat, [0, -0.32, 0.22]);

  return sGroup;
}

export function buildStandingPharaohStatue(
  parent: THREE.Object3D | null,
  stoneMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const stGroup = group(parent, pos[0], pos[1], pos[2]);
  stGroup.scale.setScalar(scale);

  box(stGroup, 0.88, 0.52, 0.88, stoneMat, [0, 0.26, 0]);
  box(stGroup, 0.94, 0.09, 0.94, trimMat, [0, 0.55, 0]);
  box(stGroup, 0.42, 0.32, 0.90, goldMat, [0, 0.26, 0]);

  const fig = group(stGroup, 0, 0.60, 0);
  cyl(fig, 0.18, 0.26, 0.95, 14, stoneMat, [0, 0.475, 0]);
  box(fig, 0.46, 0.48, 0.28, stoneMat, [0, 1.15, 0]);
  box(fig, 0.48, 0.10, 0.30, trimMat, [0, 0.96, 0]);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), stoneMat);
  head.position.set(0, 1.54, 0.02);
  fig.add(head);

  // Nemes real
  box(fig, 0.38, 0.44, 0.34, goldMat, [0, 1.58, -0.04]);
  box(fig, 0.08, 0.28, 0.06, goldMat, [0, 1.34, 0.15]); // Barba real

  // Braços cruzados com cajado e mangual
  box(fig, 0.14, 0.42, 0.14, stoneMat, [0.24, 1.15, 0.14], [-0.5, 0, -0.4]);
  box(fig, 0.14, 0.42, 0.14, stoneMat, [-0.24, 1.15, 0.14], [-0.5, 0, 0.4]);
  cyl(fig, 0.02, 0.02, 0.85, 8, goldMat, [0.12, 1.20, 0.22], [0.4, 0, -0.5]);
  cyl(fig, 0.02, 0.02, 0.85, 8, goldMat, [-0.12, 1.20, 0.22], [0.4, 0, 0.5]);

  return stGroup;
}

/* ==========================================================================
   4. CONSTRUÇÃO COMPLETA DO TEMPLO EGÍPCIO (TIERS T1 A T5)
   ========================================================================== */
export interface EgyptianTempleMaterials {
  sandstoneBase: THREE.MeshStandardMaterial;
  sandstoneBright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  darkInterior: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  divineGlow: THREE.MeshStandardMaterial;
}

export interface EgyptianTempleSystemResult {
  root: THREE.Group;
  tierGroups: Record<number, THREE.Group>;
  favorRing: THREE.Mesh;
  allFlames: THREE.Mesh[];
  materials: EgyptianTempleMaterials;
  setTier: (tier: number) => void;
  applyGod: (godKey: EgyptianTempleGodKey) => void;
  getTier: () => number;
}

export function buildEgyptianTempleSystem(
  initialGod: EgyptianTempleGodKey = 'ra',
  initialTier = 5
): EgyptianTempleSystemResult {
  const theme = EGYPT_TEMPLE_THEMES[initialGod] || EGYPT_TEMPLE_THEMES.ra;

  const M: EgyptianTempleMaterials = {
    sandstoneBase: new THREE.MeshStandardMaterial({
      map: createEgyptianSandstoneTexture(false),
      color: theme.sandstoneBase,
      roughness: 0.65,
      metalness: 0.05
    }),
    sandstoneBright: new THREE.MeshStandardMaterial({
      map: createEgyptianSandstoneTexture(true),
      color: theme.sandstoneBright,
      roughness: 0.55,
      metalness: 0.08
    }),
    trim: new THREE.MeshStandardMaterial({
      color: theme.trimHex,
      roughness: 0.35,
      metalness: 0.4
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3a2000,
      emissiveIntensity: 0.3,
      metalness: 0.92,
      roughness: 0.18
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.7
    }),
    darkInterior: new THREE.MeshStandardMaterial({
      color: 0x181512,
      roughness: 0.95
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

  // ========================================================================
  // TIER 1 — ALTAR PRIMITIVO
  // ========================================================================
  const t1 = group(root, 0, 0, 0);
  box(t1, 2.85, 0.22, 2.55, M.sandstoneBase, [0, 0.11, 0]);
  box(t1, 1.05, 0.68, 0.78, M.sandstoneBright, [0, 0.72, -0.15]);
  box(t1, 1.15, 0.10, 0.88, M.trim, [0, 1.10, -0.15]);
  for (const sx of [-0.95, 0.95]) {
    for (const sz of [-0.75, 0.55]) {
      cyl(t1, 0.08, 0.10, 1.35, 10, M.wood, [sx, 1.05, sz]);
    }
  }
  const bT1 = buildSacredBrazier(t1, M.gold, M.flame, [0, 0.38, 0.68], 0.85);
  allFlames.push(bT1.flame);
  tierGroups[1] = t1;

  // ========================================================================
  // TIER 2 — SANTUÁRIO SOLAR (COLUNATA DE PAPIRO)
  // ========================================================================
  const t2 = group(root, 0, 0, 0);
  box(t2, 3.45, 0.22, 3.85, M.sandstoneBase, [0, 0.11, 0]);
  box(t2, 2.35, 1.48, 2.25, M.sandstoneBase, [0, 1.14, -0.35]);
  box(t2, 0.75, 1.05, 0.10, M.wood, [0, 0.92, 0.78]);
  for (const cx of [-1.05, -0.38, 0.38, 1.05]) {
    cyl(t2, 0.10, 0.14, 1.48, 12, M.sandstoneBright, [cx, 1.14, 1.35]);
  }
  box(t2, 2.70, 0.16, 3.15, M.trim, [0, 1.96, 0.42]);
  const bT2L = buildSacredBrazier(t2, M.gold, M.flame, [-1.35, 0.22, 1.72], 0.9);
  const bT2R = buildSacredBrazier(t2, M.gold, M.flame, [1.35, 0.22, 1.72], 0.9);
  allFlames.push(bT2L.flame, bT2R.flame);
  tierGroups[2] = t2;

  // ========================================================================
  // TIER 3 — TEMPLO DE PILONES
  // ========================================================================
  const t3 = group(root, 0, 0, 0);
  box(t3, 3.85, 0.16, 4.65, M.sandstoneBase, [0, 0.08, 0]);
  box(t3, 3.38, 0.16, 4.18, M.sandstoneBright, [0, 0.24, 0]);

  buildEgyptianPylon(t3, 1.45, 1.25, 2.15, M.sandstoneBright, M.trim, M.gold, [-1.15, 0.32, 1.25]);
  buildEgyptianPylon(t3, 1.45, 1.25, 2.15, M.sandstoneBright, M.trim, M.gold, [1.15, 0.32, 1.25]);

  box(t3, 0.95, 1.35, 0.22, M.wood, [0, 0.98, 1.25]);
  box(t3, 0.75, 1.15, 0.26, M.gold, [0, 0.88, 1.25]);

  for (const sx of [-1.85, 1.85]) {
    cyl(t3, 0.08, 0.12, 2.45, 4, M.sandstoneBright, [sx, 1.54, 1.85]);
    cyl(t3, 0.04, 0.08, 0.45, 4, M.gold, [sx, 2.98, 1.85]);
  }

  buildStandingPharaohStatue(t3, M.sandstoneBright, M.trim, M.gold, [-2.25, 0.32, 0.15], 1.05);
  const bT3 = buildSacredBrazier(t3, M.gold, M.flame, [0, 0.32, 2.22], 1.0);
  allFlames.push(bT3.flame);
  tierGroups[3] = t3;

  // ========================================================================
  // TIER 4 — GRANDE TEMPLO ESFINGE
  // ========================================================================
  const t4 = group(root, 0, 0, 0);
  box(t4, 4.45, 0.24, 5.15, M.sandstoneBase, [0, 0.12, 0]);
  box(t4, 4.25, 0.24, 4.95, M.sandstoneBright, [0, 0.36, 0]);

  buildSphinxStatue(t4, M.sandstoneBright, M.gold, [0, 0.60, -0.45], 1.15);

  buildEgyptianPylon(t4, 1.65, 1.45, 2.55, M.sandstoneBright, M.trim, M.gold, [-1.35, 0.60, 1.65]);
  buildEgyptianPylon(t4, 1.65, 1.45, 2.55, M.sandstoneBright, M.trim, M.gold, [1.35, 0.60, 1.65]);

  const bT4L = buildSacredBrazier(t4, M.gold, M.flame, [-1.35, 0.60, 2.55], 1.15);
  const bT4R = buildSacredBrazier(t4, M.gold, M.flame, [1.35, 0.60, 2.55], 1.15);
  allFlames.push(bT4L.flame, bT4R.flame);
  tierGroups[4] = t4;

  // ========================================================================
  // TIER 5 — MARAVILHA PIRÂMIDE
  // ========================================================================
  const t5 = group(root, 0, 0, 0);
  box(t5, 5.45, 0.16, 5.65, M.sandstoneBase, [0, 0.08, 0]);
  box(t5, 5.20, 0.16, 5.40, M.sandstoneBright, [0, 0.24, 0]);

  const pySize = 3.65;
  const pyH = 3.65;
  const pyGeo = new THREE.ConeGeometry(pySize * 0.72, pyH, 4);
  pyGeo.rotateY(Math.PI / 4);
  const pyramid = new THREE.Mesh(pyGeo, M.sandstoneBright);
  pyramid.position.set(0, 0.24 + pyH * 0.5, 0);
  pyramid.castShadow = true;
  pyramid.receiveShadow = true;
  t5.add(pyramid);

  const capstone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.68, 4), M.gold);
  capstone.rotation.y = Math.PI / 4;
  capstone.position.set(0, 0.24 + pyH + 0.34, 0);
  t5.add(capstone);

  for (const side of [-1, 1]) {
    buildEgyptianPylon(t5, 0.95, 0.85, 1.45, M.sandstoneBright, M.trim, M.gold, [side * 1.55, 0.40, 1.85]);
  }
  const bT5L = buildSacredBrazier(t5, M.gold, M.flame, [-1.55, 0.40, 2.55], 1.25);
  const bT5R = buildSacredBrazier(t5, M.gold, M.flame, [1.55, 0.40, 2.55], 1.25);
  allFlames.push(bT5L.flame, bT5R.flame);

  tierGroups[5] = t5;

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

  function applyGod(godKey: EgyptianTempleGodKey) {
    const next = EGYPT_TEMPLE_THEMES[godKey] || EGYPT_TEMPLE_THEMES.ra;
    M.sandstoneBase.color.setHex(next.sandstoneBase);
    M.sandstoneBright.color.setHex(next.sandstoneBright);
    M.trim.color.setHex(next.trimHex);
    M.gold.color.setHex(next.goldHex);
    M.flame.color.setHex(next.flameHex);
    M.divineGlow.emissive.setHex(next.glowHex);
    favorRing.material.color.setHex(next.glowHex);
  }

  setTier(initialTier);
  applyGod(initialGod);

  return {
    root,
    tierGroups,
    favorRing,
    allFlames,
    materials: M,
    setTier,
    applyGod,
    getTier: () => currentTier
  };
}

export function buildEgyptianTempleStudio(
  godKey: EgyptianTempleGodKey = 'ra',
  tier = 5,
  _enableShadows = true
): EgyptianTempleSystemResult {
  return buildEgyptianTempleSystem(godKey, tier);
}

/**
 * Lightweight in-game procedural Egyptian Temple building for the battlefield.
 */
export function buildProceduralEgyptianTemple(
  groupTarget: THREE.Group,
  age = 1,
  godKey = 'ra'
): { beaconCrystal: THREE.Object3D; allFlames?: THREE.Mesh[] } {
  const normGod = (
    godKey.includes('isis') ? 'isis' : godKey.includes('set') ? 'set' : 'ra'
  ) as EgyptianTempleGodKey;

  const effTier = Math.max(1, Math.min(5, age));
  const sys = buildEgyptianTempleSystem(normGod, effTier);
  groupTarget.add(sys.root);

  const beaconCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.MeshBasicMaterial({
      color: EGYPT_TEMPLE_THEMES[normGod].glowHex,
      wireframe: true
    })
  );
  beaconCrystal.position.y = 4.2 + (effTier >= 4 ? 1.0 : 0);
  groupTarget.add(beaconCrystal);

  return { beaconCrystal, allFlames: sys.allFlames };
}
