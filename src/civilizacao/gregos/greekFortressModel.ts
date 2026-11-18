import * as THREE from 'three';

/* ==========================================================================
   1. CONFIGURAÇÃO VISUAL DAS 3 DIVINDADES GREGAS (ZEUS, POSEIDON E HADES)
   ========================================================================== */
export interface GreekFortressTheme {
  id: 'zeus' | 'poseidon' | 'hades';
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
  trimColor: number;
  goldColor: number;
  roofBase: string;
  roofRib: string;
  roofPatina: string;
  statueColor: number;
  bannerColor: number;
  glowHex: number;
  arrowHex: number;
  groundGrass: string;
  groundDirt: string;
}

export const GREEK_FORTRESS_THEMES: Record<string, GreekFortressTheme> = {
  zeus: {
    id: 'zeus',
    godName: 'Zeus',
    t3Title: 'Fortaleza de Zeus • Tier 3 (Era Heroica)',
    t3Sub: 'Torres duplas de pedra calcária, telhados de telha terracota-bronze, frisos azul-olímpico e estátua de Hoplita guardião',
    t4Title: 'Cidadela Olímpica de Zeus • Tier 4 (Era Mítica)',
    t4Sub: 'Acrópole imperial monumental com colunata coríntia superior, telhado duplo escalonado em ouro, estátuas gêmeas e farol de relâmpagos',
    bgHex: 0x10203a,
    hemiSky: 0xfef9c3,
    hemiGround: 0x1e3a8a,
    rimHex: 0x38bdf8,
    wallColor: 0xd6d3c9,
    t4WallColor: 0xfef3c7,
    trimColor: 0x1d4ed8,      // Azul-olímpico nos frisos e pináculos
    goldColor: 0xfacc15,
    roofBase: '#8c5332',
    roofRib: '#d97706',
    roofPatina: '#577560',
    statueColor: 0xe2e8f0,
    bannerColor: 0x1e3a8a,
    glowHex: 0x38bdf8,
    arrowHex: 0xfef08a,
    groundGrass: '#4d7c2b',
    groundDirt: '#b89768'
  },
  poseidon: {
    id: 'poseidon',
    godName: 'Poseidon',
    t3Title: 'Fortaleza de Poseidon • Tier 3 (Era Heroica)',
    t3Sub: 'Muralhas de pedra costeira, telhados de cobre oxidado verde-marinho, frisos turquesa e estátua guardiã com tridente',
    t4Title: 'Cidadela Atlante de Poseidon • Tier 4 (Era Mítica)',
    t4Sub: 'Palácio-fortaleza colossal de mármore marinho com colunata superior, telhado escalonado de cobre e ouro, estátuas gêmeas e fontes sagradas',
    bgHex: 0x061f2e,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0c4a6e,
    rimHex: 0x2dd4bf,
    wallColor: 0xcbd5e1,
    t4WallColor: 0xe0f2fe,
    trimColor: 0x0d9488,      // Verde-turquesa oceânico nos frisos e pináculos
    goldColor: 0xf59e0b,
    roofBase: '#3f7a6c',
    roofRib: '#2dd4bf',
    roofPatina: '#115e59',
    statueColor: 0xcbd5e1,
    bannerColor: 0x0f766e,
    glowHex: 0x2dd4bf,
    arrowHex: 0x99f6e4,
    groundGrass: '#3f7a4c',
    groundDirt: '#c2a878'
  },
  hades: {
    id: 'hades',
    godName: 'Hades',
    t3Title: 'Fortaleza de Hades • Tier 3 (Era Heroica)',
    t3Sub: 'Bastião de pedra basáltica sombria, telhados de ardósia e cobre escuro, frisos carmesim, braseiros do Estige e guardião do Submundo',
    t4Title: 'Cidadela do Tártaro de Hades • Tier 4 (Era Mítica)',
    t4Sub: 'Fortaleza imperial de obsidiana e ouro sombrio com colunata monumental, telhado escalonado infernal, guardiões gêmeos e chamas espectrais',
    bgHex: 0x090612,
    hemiSky: 0xa7f3d0,
    hemiGround: 0x2e1065,
    rimHex: 0x10b981,
    wallColor: 0x52525b,
    t4WallColor: 0x3f3f46,
    trimColor: 0x991b1b,      // Carmesim / Brasa do Submundo nos frisos
    goldColor: 0xd97706,
    roofBase: '#27272a',
    roofRib: '#ea580c',
    roofPatina: '#450a0a',
    statueColor: 0x71717a,
    bannerColor: 0x450a0a,
    glowHex: 0x10b981,
    arrowHex: 0x6ee7b7,
    groundGrass: '#2f3e2e',
    groundDirt: '#574c42'
  }
};

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR (ALVENARIA GREGA, TELHAS CANELADAS E TERRENO)
   ========================================================================== */
export function createStoneWallTexture(isT4 = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = isT4 ? '#f5f0e1' : '#cfcabd';
  ctx.fillRect(0, 0, 512, 512);

  // Blocos de cantaria grega (Ashlar masonry)
  const rows = 12;
  const rowH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const cols = 6;
    const colW = 512 / cols;
    const offset = (r % 2 === 0) ? 0 : colW * 0.5;

    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const shade = 215 + Math.floor((Math.random() - 0.5) * 24);
      ctx.fillStyle = isT4
        ? `rgba(${shade + 25}, ${shade + 18}, ${shade - 5}, 0.45)`
        : `rgba(${shade}, ${shade - 5}, ${shade - 14}, 0.55)`;
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

      ctx.strokeStyle = 'rgba(40, 36, 30, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);
    }
  }

  // Detalhe de desgaste natural
  for (let i = 0; i < 2400; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,20,0.08)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createTiledRoofTexture(theme: GreekFortressTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = theme.roofBase;
  ctx.fillRect(0, 0, 512, 512);

  // Telhas caneladas gregas verticais
  const tileCount = 24;
  const tileW = 512 / tileCount;
  for (let i = 0; i < tileCount; i++) {
    const x = i * tileW;
    const grad = ctx.createLinearGradient(x, 0, x + tileW, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.32)');
    grad.addColorStop(0.35, theme.roofRib);
    grad.addColorStop(0.75, theme.roofPatina);
    grad.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, tileW, 512);
  }

  // Sobreposição horizontal das telhas
  ctx.strokeStyle = 'rgba(15, 15, 15, 0.32)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createGroundTexture(theme: GreekFortressTheme, isT4 = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Gramado mediterrâneo
  ctx.fillStyle = theme.groundGrass;
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 6500; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 35, 10, 0.14)';
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 10, 10);
  }

  const cx = 512, cy = 512;
  const dirtGrad = ctx.createRadialGradient(cx, cy, 180, cx, cy, 380);
  dirtGrad.addColorStop(0, theme.groundDirt);
  dirtGrad.addColorStop(0.75, theme.groundDirt);
  dirtGrad.addColorStop(1, 'rgba(184, 151, 104, 0)');
  ctx.fillStyle = dirtGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  if (isT4) {
    ctx.fillStyle = '#c28568';
    ctx.fillRect(cx - 295, cy - 295, 590, 590);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 8;
    ctx.strokeRect(cx - 295, cy - 295, 590, 590);

    ctx.strokeStyle = 'rgba(255, 250, 235, 0.35)';
    ctx.lineWidth = 2;
    for (let x = cx - 295; x <= cx + 295; x += 36) {
      ctx.beginPath(); ctx.moveTo(x, cy - 295); ctx.lineTo(x, cy + 295); ctx.stroke();
    }
    for (let y = cy - 295; y <= cy + 295; y += 36) {
      ctx.beginPath(); ctx.moveTo(cx - 295, y); ctx.lineTo(cx + 295, y); ctx.stroke();
    }
  }

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

function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  enableShadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = enableShadows;
  m.receiveShadow = enableShadows;
  parent.add(m);
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
  enableShadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = enableShadows;
  m.receiveShadow = enableShadows;
  parent.add(m);
  return m;
}

export function buildHipRoof(
  parent: THREE.Object3D,
  w: number,
  d: number,
  h: number,
  roofMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  yBase: number,
  enableShadows = true
): THREE.Group {
  const rGroup = group(parent, 0, yBase, 0);
  const rx = w * 0.5, rz = d * 0.5;
  const geom = new THREE.BufferGeometry();
  const verts = new Float32Array([
    // Frente (+Z)
    -rx, 0, rz,   rx, 0, rz,   0, h, 0,
    // Direita (+X)
     rx, 0, rz,   rx, 0, -rz,  0, h, 0,
    // Trás (-Z)
     rx, 0, -rz, -rx, 0, -rz,  0, h, 0,
    // Esquerda (-X)
    -rx, 0, -rz, -rx, 0, rz,   0, h, 0
  ]);
  const uvs = new Float32Array([
    0, 0, 1, 0, 0.5, 1,
    0, 0, 1, 0, 0.5, 1,
    0, 0, 1, 0, 0.5, 1,
    0, 0, 1, 0, 0.5, 1
  ]);
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(geom, roofMat);
  mesh.castShadow = enableShadows;
  mesh.receiveShadow = enableShadows;
  rGroup.add(mesh);

  cyl(rGroup, 0.02, 0.12, 0.28, 8, trimMat, [0, h + 0.12, 0], [0, 0, 0], enableShadows);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldMat);
  orb.position.set(0, h + 0.26, 0);
  orb.castShadow = enableShadows;
  rGroup.add(orb);

  return rGroup;
}

export function buildGableRoof(
  parent: THREE.Object3D,
  w: number,
  d: number,
  h: number,
  roofMat: THREE.Material,
  stoneMat: THREE.Material,
  trimMat: THREE.Material,
  yBase: number,
  enableShadows = true
): THREE.Group {
  const gGroup = group(parent, 0, yBase, 0);
  const rx = w * 0.5;

  const slopeLen = Math.hypot(rx, h);
  const slopeAng = Math.atan2(h, rx);
  box(gGroup, slopeLen + 0.08, 0.08, d + 0.12, roofMat, [-rx * 0.5, h * 0.5, 0], [0, 0, slopeAng], enableShadows);
  box(gGroup, slopeLen + 0.08, 0.08, d + 0.12, roofMat, [rx * 0.5, h * 0.5, 0], [0, 0, -slopeAng], enableShadows);

  box(gGroup, 0.12, 0.10, d + 0.16, trimMat, [0, h + 0.03, 0], [0, 0, 0], enableShadows);

  const triShape = new THREE.Shape();
  triShape.moveTo(-rx, 0);
  triShape.lineTo(rx, 0);
  triShape.lineTo(0, h);
  triShape.closePath();
  const triGeo = new THREE.ExtrudeGeometry(triShape, { depth: d - 0.04, bevelEnabled: false });
  triGeo.translate(0, 0, -(d - 0.04) * 0.5);
  const pediment = new THREE.Mesh(triGeo, stoneMat);
  pediment.castShadow = enableShadows;
  pediment.receiveShadow = enableShadows;
  gGroup.add(pediment);

  cyl(gGroup, 0.015, 0.09, 0.22, 8, trimMat, [0, h + 0.12, d * 0.5 + 0.02], [0, 0, 0], enableShadows);

  return gGroup;
}

export function buildGuardianStatue(
  parent: THREE.Object3D,
  statueMat: THREE.Material,
  trimMat: THREE.Material,
  goldMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  enableShadows = true
): THREE.Group {
  const stGroup = group(parent, pos[0], pos[1], pos[2]);
  stGroup.scale.setScalar(scale);

  // Pedestal de mármore com emblema dourado frontal
  box(stGroup, 0.72, 0.48, 0.72, statueMat, [0, 0.24, 0], [0, 0, 0], enableShadows);
  box(stGroup, 0.80, 0.08, 0.80, trimMat, [0, 0.50, 0], [0, 0, 0], enableShadows);
  cyl(stGroup, 0.14, 0.14, 0.06, 14, goldMat, [0, 0.24, 0.37], [Math.PI / 2, 0, 0], enableShadows);

  // Corpo esculpido do Hoplita de pedra
  const fig = group(stGroup, 0, 0.54, 0);
  cyl(fig, 0.075, 0.06, 0.52, 10, statueMat, [-0.11, 0.26, 0], [0, 0, 0], enableShadows);
  cyl(fig, 0.075, 0.06, 0.52, 10, statueMat, [0.11, 0.26, 0], [0, 0, 0], enableShadows);
  cyl(fig, 0.16, 0.22, 0.32, 12, statueMat, [0, 0.54, 0], [0, 0, 0], enableShadows);
  box(fig, 0.36, 0.07, 0.26, trimMat, [0, 0.66, 0], [0, 0, 0], enableShadows);
  box(fig, 0.40, 0.42, 0.24, statueMat, [0, 0.88, 0], [0, 0, 0], enableShadows);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), statueMat);
  head.position.set(0, 1.22, 0.02);
  head.castShadow = enableShadows;
  fig.add(head);
  box(fig, 0.04, 0.16, 0.26, trimMat, [0, 1.36, -0.02], [0, 0, 0], enableShadows);

  // Escudo Hoplon
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 18), statueMat);
  shield.rotation.set(0, 0, Math.PI / 2);
  shield.position.set(-0.26, 0.84, 0.06);
  shield.castShadow = enableShadows;
  fig.add(shield);
  const shieldRim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 8, 22), goldMat);
  shieldRim.rotation.set(0, Math.PI / 2, 0);
  shieldRim.position.set(-0.28, 0.84, 0.06);
  fig.add(shieldRim);

  // Lança Dory
  cyl(fig, 0.02, 0.02, 1.75, 8, goldMat, [0.26, 0.88, 0.12], [0, 0, 0], enableShadows);
  cyl(fig, 0.005, 0.045, 0.22, 6, goldMat, [0.26, 1.82, 0.12], [0, 0, 0], enableShadows);

  return stGroup;
}

export function buildFoliageAndProps(
  parent: THREE.Object3D,
  woodMat: THREE.Material,
  goldMat: THREE.Material,
  foliageMat: THREE.Material,
  enableShadows = true
): THREE.Group {
  const props = group(parent, 0, 0, 0);

  const treeSpots: [number, number, number][] = [
    [-2.55, 1.95, 1.0],
    [2.55, 1.95, 0.92],
    [-2.65, -1.65, 1.1],
    [2.65, -1.75, 0.95]
  ];
  treeSpots.forEach(([tx, tz, sc]) => {
    const t = group(props, tx, 0, tz);
    t.scale.setScalar(sc);
    cyl(t, 0.05, 0.08, 0.35, 8, woodMat, [0, 0.17, 0], [0, 0, 0], enableShadows);
    cyl(t, 0.02, 0.26, 1.45, 10, foliageMat, [0, 0.95, 0], [0, 0, 0], enableShadows);
  });

  const barrelSpots: [number, number][] = [
    [-2.25, 1.35],
    [-2.42, 1.05],
    [2.28, 1.25]
  ];
  barrelSpots.forEach(([bx, bz]) => {
    const b = group(props, bx, 0, bz);
    cyl(b, 0.14, 0.14, 0.34, 12, woodMat, [0, 0.17, 0], [0, 0, 0], enableShadows);
    cyl(b, 0.148, 0.148, 0.03, 12, goldMat, [0, 0.08, 0], [0, 0, 0], enableShadows);
    cyl(b, 0.148, 0.148, 0.03, 12, goldMat, [0, 0.26, 0], [0, 0, 0], enableShadows);
  });

  return props;
}

/* ==========================================================================
   4. CONSTRUÇÃO COMPLETA DA FORTALEZA GREGA (T3 HEROICA -> T4 MÍTICA)
   ========================================================================== */
export type GreekFortressAction = 'guarnicao' | 'defesa' | 'bencao';

export interface GreekFortressInstance {
  root: THREE.Group;
  tier3Group: THREE.Group;
  tier4Group: THREE.Group;
  apexCrystal: THREE.Mesh;
  divineRing: THREE.Mesh;
  banners: THREE.Mesh[];
  setTier: (tier: number) => void;
  applyGod: (godKey: 'zeus' | 'poseidon' | 'hades' | string) => void;
  getTier: () => number;
}

export function buildGreekFortress(
  initialGod = 'zeus',
  initialTier = 3,
  enableShadows = true
): GreekFortressInstance {
  const theme = GREEK_FORTRESS_THEMES[initialGod] || GREEK_FORTRESS_THEMES.zeus;

  const M = {
    wallT3: new THREE.MeshStandardMaterial({
      map: createStoneWallTexture(false),
      color: theme.wallColor,
      roughness: 0.68,
      metalness: 0.08
    }),
    wallT4: new THREE.MeshStandardMaterial({
      map: createStoneWallTexture(true),
      color: theme.t4WallColor,
      roughness: 0.52,
      metalness: 0.16
    }),
    trim: new THREE.MeshStandardMaterial({
      color: theme.trimColor,
      roughness: 0.38,
      metalness: 0.35
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldColor,
      emissive: new THREE.Color(0x3b2200),
      emissiveIntensity: 0.22,
      metalness: 0.90,
      roughness: 0.20
    }),
    roof: new THREE.MeshStandardMaterial({
      map: createTiledRoofTexture(theme),
      roughness: 0.55,
      metalness: 0.18,
      side: THREE.DoubleSide
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x5c2d16,
      roughness: 0.65
    }),
    darkInterior: new THREE.MeshStandardMaterial({
      color: 0x181512,
      roughness: 0.9
    }),
    statue: new THREE.MeshStandardMaterial({
      color: theme.statueColor,
      roughness: 0.48,
      metalness: 0.15
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x1e4620,
      roughness: 0.8
    }),
    banner: new THREE.MeshStandardMaterial({
      color: theme.bannerColor,
      roughness: 0.55,
      side: THREE.DoubleSide
    }),
    divineBeacon: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(theme.glowHex),
      emissiveIntensity: 2.8,
      roughness: 0.1
    })
  };

  const root = new THREE.Group();

  // ========================================================================
  // A. ESTRUTURA TIER 3 — ERA HEROICA (FIEL ÀS IMAGENS 1 E 2)
  // ========================================================================
  const tier3Group = group(root, 0, 0, 0);

  box(tier3Group, 4.35, 0.26, 4.05, M.wallT3, [0, 0.13, 0], [0, 0, 0], enableShadows);
  box(tier3Group, 4.42, 0.10, 4.12, M.trim, [0, 0.28, 0], [0, 0, 0], enableShadows);

  // 1. Torre Principal Esquerda
  const leftTower = group(tier3Group, -1.25, 0.30, -0.35);
  box(leftTower, 1.65, 2.35, 2.25, M.wallT3, [0, 1.175, 0], [0, 0, 0], enableShadows);
  box(leftTower, 1.74, 0.12, 2.34, M.trim, [0, 2.38, 0], [0, 0, 0], enableShadows);
  box(leftTower, 1.56, 0.52, 2.16, M.darkInterior, [0, 2.66, 0], [0, 0, 0], enableShadows);
  for (let cx = -0.66; cx <= 0.66; cx += 0.33) {
    cyl(leftTower, 0.065, 0.075, 0.54, 10, M.wallT3, [cx, 2.66, 1.04], [0, 0, 0], enableShadows);
    cyl(leftTower, 0.065, 0.075, 0.54, 10, M.wallT3, [cx, 2.66, -1.04], [0, 0, 0], enableShadows);
  }
  for (let cz = -0.82; cz <= 0.82; cz += 0.41) {
    cyl(leftTower, 0.065, 0.075, 0.54, 10, M.wallT3, [-0.74, 2.66, cz], [0, 0, 0], enableShadows);
    cyl(leftTower, 0.065, 0.075, 0.54, 10, M.wallT3, [0.74, 2.66, cz], [0, 0, 0], enableShadows);
  }
  box(leftTower, 1.76, 0.12, 2.36, M.wallT3, [0, 2.98, 0], [0, 0, 0], enableShadows);
  box(leftTower, 1.80, 0.07, 2.40, M.trim, [0, 3.06, 0], [0, 0, 0], enableShadows);
  buildHipRoof(leftTower, 1.82, 2.42, 0.62, M.roof, M.trim, M.gold, 3.10, enableShadows);

  // 2. Torre Direita
  const rightTower = group(tier3Group, 1.25, 0.30, -0.45);
  box(rightTower, 1.65, 1.95, 2.05, M.wallT3, [0, 0.975, 0], [0, 0, 0], enableShadows);
  box(rightTower, 1.74, 0.12, 2.14, M.trim, [0, 1.98, 0], [0, 0, 0], enableShadows);
  box(rightTower, 1.56, 0.48, 1.96, M.darkInterior, [0, 2.24, 0], [0, 0, 0], enableShadows);
  for (let cx = -0.66; cx <= 0.66; cx += 0.33) {
    cyl(rightTower, 0.065, 0.075, 0.50, 10, M.wallT3, [cx, 2.24, 0.94], [0, 0, 0], enableShadows);
    cyl(rightTower, 0.065, 0.075, 0.50, 10, M.wallT3, [cx, 2.24, -0.94], [0, 0, 0], enableShadows);
  }
  box(rightTower, 1.76, 0.12, 2.16, M.wallT3, [0, 2.52, 0], [0, 0, 0], enableShadows);
  box(rightTower, 1.80, 0.07, 2.20, M.trim, [0, 2.60, 0], [0, 0, 0], enableShadows);
  buildHipRoof(rightTower, 1.82, 2.22, 0.58, M.roof, M.trim, M.gold, 2.64, enableShadows);

  // 3. Corpo Central e Terraço Frontal com Barris
  const centerKeep = group(tier3Group, 0, 0.30, 0.15);
  box(centerKeep, 1.15, 2.10, 0.65, M.wallT3, [0, 1.05, -0.95], [0, 0, 0], enableShadows);
  buildGableRoof(centerKeep, 1.25, 0.72, 0.38, M.roof, M.wallT3, M.trim, 2.10, enableShadows);

  box(centerKeep, 2.15, 1.48, 1.75, M.wallT3, [0, 0.74, 0.78], [0, 0, 0], enableShadows);
  box(centerKeep, 2.18, 0.24, 0.14, M.wallT3, [0, 1.58, 1.58], [0, 0, 0], enableShadows);
  box(centerKeep, 0.14, 0.24, 1.75, M.wallT3, [-1.00, 1.58, 0.78], [0, 0, 0], enableShadows);
  box(centerKeep, 0.14, 0.24, 1.75, M.wallT3, [1.00, 1.58, 0.78], [0, 0, 0], enableShadows);

  cyl(centerKeep, 0.11, 0.11, 0.26, 10, M.wood, [-0.55, 1.61, 0.45], [0, 0, 0], enableShadows);
  cyl(centerKeep, 0.11, 0.11, 0.26, 10, M.wood, [0.45, 1.61, 0.52], [0, 0, 0], enableShadows);
  cyl(centerKeep, 0.11, 0.11, 0.26, 10, M.wood, [0.68, 1.61, 0.35], [0, 0, 0], enableShadows);

  // 4. Portão Principal Frontal com Escadaria e 4 Colunas Dóricas
  const gateGroup = group(tier3Group, -0.15, 0.30, 1.82);
  for (let s = 0; s < 4; s++) {
    box(gateGroup, 1.25 - s * 0.04, 0.08, 0.55 - s * 0.10, M.wallT3, [0, -0.26 + s * 0.07, 0.28 - s * 0.05], [0, 0, 0], enableShadows);
  }
  box(gateGroup, 0.88, 1.05, 0.12, M.wood, [0, 0.52, -0.02], [0, 0, 0], enableShadows);
  box(gateGroup, 0.04, 1.05, 0.14, M.gold, [0, 0.52, -0.01], [0, 0, 0], enableShadows);
  for (const cx of [-0.56, -0.42, 0.42, 0.56]) {
    cyl(gateGroup, 0.065, 0.078, 1.12, 12, M.wallT3, [cx, 0.56, 0.22], [0, 0, 0], enableShadows);
  }
  box(gateGroup, 1.38, 0.12, 0.54, M.wallT3, [0, 1.16, 0.14], [0, 0, 0], enableShadows);
  buildGableRoof(gateGroup, 1.44, 0.58, 0.38, M.roof, M.wallT3, M.trim, 1.22, enableShadows);

  // 5. Estátua Guardiã de Hoplita no Nicho Lateral Direito
  buildGuardianStatue(tier3Group, M.statue, M.trim, M.gold, [1.55, 0.30, 1.18], 1.0, enableShadows);

  // Estandartes da Divindade na fachada
  const banners: THREE.Mesh[] = [];
  for (const bx of [-1.25, 1.25]) {
    const bMesh = box(tier3Group, 0.32, 0.95, 0.03, M.banner, [bx, 1.65, 0.82], [0, 0, 0], enableShadows);
    box(tier3Group, 0.36, 0.05, 0.05, M.gold, [bx, 2.13, 0.82], [0, 0, 0], enableShadows);
    banners.push(bMesh);
  }

  // ========================================================================
  // B. ESTRUTURA TIER 4 — ERA MÍTICA IMPERIAL (MONUMENTAL)
  // ========================================================================
  const tier4Group = group(root, 0, 0, 0);
  tier4Group.visible = false;

  box(tier4Group, 5.20, 0.34, 4.85, M.wallT4, [0, 0.17, 0], [0, 0, 0], enableShadows);
  box(tier4Group, 5.30, 0.12, 4.95, M.trim, [0, 0.38, 0], [0, 0, 0], enableShadows);
  box(tier4Group, 5.34, 0.08, 4.99, M.gold, [0, 0.46, 0], [0, 0, 0], enableShadows);

  box(tier4Group, 4.75, 2.15, 4.35, M.wallT4, [0, 1.54, 0], [0, 0, 0], enableShadows);
  const bastionCoords: [number, number][] = [
    [-1.65, 2.18],
    [1.65, 2.18],
    [-2.42, -0.85],
    [2.42, -0.85]
  ];
  bastionCoords.forEach(([bx, bz]) => {
    box(tier4Group, 1.15, 2.05, 0.72, M.wallT4, [bx, 1.48, bz], [0, 0, 0], enableShadows);
    box(tier4Group, 1.22, 0.10, 0.78, M.gold, [bx, 2.52, bz], [0, 0, 0], enableShadows);
    box(tier4Group, 1.24, 0.08, 0.80, M.trim, [bx, 2.60, bz], [0, 0, 0], enableShadows);
  });

  box(tier4Group, 4.95, 0.16, 4.55, M.wallT4, [0, 2.68, 0], [0, 0, 0], enableShadows);
  box(tier4Group, 5.02, 0.09, 4.62, M.gold, [0, 2.80, 0], [0, 0, 0], enableShadows);

  // Pavilhão Superior Monumental
  const upperCitadel = group(tier4Group, 0, 2.84, -0.10);
  box(upperCitadel, 3.65, 1.15, 3.35, M.darkInterior, [0, 0.58, 0], [0, 0, 0], enableShadows);
  for (const sx of [-1.62, 1.62]) {
    for (const sz of [-1.48, 1.48]) {
      box(upperCitadel, 0.78, 1.22, 0.78, M.wallT4, [sx, 0.61, sz], [0, 0, 0], enableShadows);
      box(upperCitadel, 0.84, 0.08, 0.84, M.gold, [sx, 1.24, sz], [0, 0, 0], enableShadows);
    }
  }
  for (let cx = -1.05; cx <= 1.05; cx += 0.42) {
    cyl(upperCitadel, 0.085, 0.10, 1.18, 14, M.wallT4, [cx, 0.59, 1.62], [0, 0, 0], enableShadows);
    cyl(upperCitadel, 0.085, 0.10, 1.18, 14, M.wallT4, [cx, 0.59, -1.62], [0, 0, 0], enableShadows);
  }
  for (let cz = -0.95; cz <= 0.95; cz += 0.475) {
    cyl(upperCitadel, 0.085, 0.10, 1.18, 14, M.wallT4, [-1.76, 0.59, cz], [0, 0, 0], enableShadows);
    cyl(upperCitadel, 0.085, 0.10, 1.18, 14, M.wallT4, [1.76, 0.59, cz], [0, 0, 0], enableShadows);
  }

  box(upperCitadel, 4.15, 0.18, 3.85, M.wallT4, [0, 1.28, 0], [0, 0, 0], enableShadows);
  box(upperCitadel, 4.22, 0.09, 3.92, M.trim, [0, 1.40, 0], [0, 0, 0], enableShadows);
  box(upperCitadel, 4.26, 0.07, 3.96, M.gold, [0, 1.48, 0], [0, 0, 0], enableShadows);

  buildHipRoof(upperCitadel, 4.30, 4.00, 0.65, M.roof, M.trim, M.gold, 1.52, enableShadows);
  box(upperCitadel, 2.65, 0.34, 2.45, M.wallT4, [0, 2.02, 0], [0, 0, 0], enableShadows);
  box(upperCitadel, 2.74, 0.08, 2.54, M.gold, [0, 2.22, 0], [0, 0, 0], enableShadows);
  buildHipRoof(upperCitadel, 2.78, 2.58, 0.68, M.roof, M.trim, M.gold, 2.26, enableShadows);

  // Farol / Cristal Divino pulsante no ápice
  const apexCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), M.divineBeacon);
  apexCrystal.position.set(0, 3.22, 0);
  upperCitadel.add(apexCrystal);

  // Portão Imperial T4
  const t4Gate = group(tier4Group, 0, 0.48, 2.22);
  for (let s = 0; s < 5; s++) {
    box(t4Gate, 1.55 - s * 0.04, 0.09, 0.72 - s * 0.12, M.wallT4, [0, -0.42 + s * 0.09, 0.36 - s * 0.06], [0, 0, 0], enableShadows);
  }
  box(t4Gate, 1.05, 1.45, 0.14, M.wood, [0, 0.72, -0.02], [0, 0, 0], enableShadows);
  box(t4Gate, 0.06, 1.45, 0.16, M.gold, [0, 0.72, -0.01], [0, 0, 0], enableShadows);
  for (const cx of [-0.68, -0.50, 0.50, 0.68]) {
    cyl(t4Gate, 0.08, 0.095, 1.52, 14, M.wallT4, [cx, 0.76, 0.28], [0, 0, 0], enableShadows);
  }
  box(t4Gate, 1.65, 0.14, 0.68, M.gold, [0, 1.56, 0.18], [0, 0, 0], enableShadows);
  buildGableRoof(t4Gate, 1.72, 0.74, 0.48, M.roof, M.wallT4, M.trim, 1.63, enableShadows);

  // Estátuas Monumentais Gêmeas
  buildGuardianStatue(tier4Group, M.statue, M.trim, M.gold, [-1.65, 0.48, 2.72], 1.18, enableShadows);
  buildGuardianStatue(tier4Group, M.statue, M.trim, M.gold, [1.65, 0.48, 2.72], 1.18, enableShadows);

  // ========================================================================
  // C. VEGETAÇÃO, BARRIS E AURA DIVINA NO SOLO
  // ========================================================================
  const props = buildFoliageAndProps(root, M.wood, M.gold, M.foliage, enableShadows);

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
    props.scale.setScalar(isT4 ? 1.18 : 1.0);
  }

  function applyGod(godKey: 'zeus' | 'poseidon' | 'hades' | string) {
    const next = GREEK_FORTRESS_THEMES[godKey] || GREEK_FORTRESS_THEMES.zeus;
    M.wallT3.color.setHex(next.wallColor);
    M.wallT4.color.setHex(next.t4WallColor);
    M.trim.color.setHex(next.trimColor);
    M.gold.color.setHex(next.goldColor);
    M.statue.color.setHex(next.statueColor);
    M.banner.color.setHex(next.bannerColor);
    M.divineBeacon.emissive.setHex(next.glowHex);
    divineRing.material.color.setHex(next.glowHex);

    if (M.roof.map) M.roof.map.dispose();
    M.roof.map = createTiledRoofTexture(next);
    M.roof.needsUpdate = true;
  }

  setTier(initialTier);

  return {
    root,
    tier3Group,
    tier4Group,
    apexCrystal,
    divineRing,
    banners,
    setTier,
    applyGod,
    getTier: () => currentTier
  };
}
