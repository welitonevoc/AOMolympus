import * as THREE from 'three';

export interface AresTextures {
  skinBump: THREE.CanvasTexture;
  shieldTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createAresTextures(): AresTextures {
  // 1. Bump map de pele guerreira com microtextura
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6500; i++) {
      const v = 120 + Math.floor(Math.random() * 16);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 2. Textura do Escudo Hoplon Espartano (Bronze Escurecido, Borda Dourada e Lambda Λ)
  const shieldCanvas = document.createElement('canvas');
  shieldCanvas.width = shieldCanvas.height = 512;
  const shCtx = shieldCanvas.getContext('2d');
  if (shCtx) {
    const radGrad = shCtx.createRadialGradient(256, 256, 30, 256, 256, 250);
    radGrad.addColorStop(0, '#573018');
    radGrad.addColorStop(0.65, '#3b1d0e');
    radGrad.addColorStop(0.84, '#7f1d1d');
    radGrad.addColorStop(0.92, '#eab308');
    radGrad.addColorStop(1, '#92400e');
    shCtx.fillStyle = radGrad;
    shCtx.fillRect(0, 0, 512, 512);

    shCtx.strokeStyle = 'rgba(254, 215, 170, 0.22)';
    shCtx.lineWidth = 2;
    for (let i = 0; i < 38; i++) {
      shCtx.beginPath();
      const sx = 80 + Math.random() * 352;
      const sy = 80 + Math.random() * 352;
      shCtx.moveTo(sx, sy);
      shCtx.lineTo(sx + (Math.random() - 0.5) * 65, sy + (Math.random() - 0.5) * 65);
      shCtx.stroke();
    }

    shCtx.strokeStyle = '#facc15';
    shCtx.lineWidth = 6;
    shCtx.beginPath();
    shCtx.arc(256, 256, 224, 0, Math.PI * 2);
    shCtx.stroke();

    // Símbolo Lambda Espartano (Λ)
    shCtx.save();
    shCtx.shadowColor = '#f97316';
    shCtx.shadowBlur = 18;
    shCtx.fillStyle = '#facc15';
    shCtx.beginPath();
    shCtx.moveTo(256, 118);
    shCtx.lineTo(356, 368);
    shCtx.lineTo(314, 368);
    shCtx.lineTo(256, 206);
    shCtx.lineTo(198, 368);
    shCtx.lineTo(156, 368);
    shCtx.closePath();
    shCtx.fill();
    shCtx.strokeStyle = '#ef4444';
    shCtx.lineWidth = 4;
    shCtx.stroke();
    shCtx.restore();
  }
  const shieldTex = new THREE.CanvasTexture(shieldCanvas);

  return { skinBump, shieldTex };
}

let cachedAresTextures: AresTextures | null = null;
export function getCachedAresTextures(): AresTextures {
  if (!cachedAresTextures) {
    cachedAresTextures = createAresTextures();
  }
  return cachedAresTextures;
}

export interface AresMaterials {
  skin: THREE.MeshStandardMaterial;
  skinShade: THREE.MeshStandardMaterial;
  scarMat: THREE.MeshStandardMaterial;
  beardDark: THREE.MeshStandardMaterial;
  darkBronze: THREE.MeshStandardMaterial;
  blackIron: THREE.MeshStandardMaterial;
  bloodGold: THREE.MeshStandardMaterial;
  crimsonArmor: THREE.MeshStandardMaterial;
  warCloak: THREE.MeshStandardMaterial;
  plumeCrimson: THREE.MeshStandardMaterial;
  leatherDark: THREE.MeshStandardMaterial;
  eyeEmber: THREE.MeshStandardMaterial;
  magmaEdge: THREE.MeshStandardMaterial;
  shieldFace: THREE.MeshStandardMaterial;
}

function createMaterials(textures: AresTextures): AresMaterials {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xb97a56,
      roughness: 0.42,
      metalness: 0.08,
      bumpMap: textures.skinBump,
      bumpScale: 0.0045,
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0x965c3c,
      roughness: 0.46,
      metalness: 0.08,
      bumpMap: textures.skinBump,
      bumpScale: 0.0045,
    }),
    scarMat: new THREE.MeshStandardMaterial({
      color: 0x6b3424,
      emissive: new THREE.Color(0x2a0804),
      emissiveIntensity: 0.25,
      roughness: 0.55,
    }),
    beardDark: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.65,
      metalness: 0.08,
    }),
    darkBronze: new THREE.MeshStandardMaterial({
      color: 0x451a03,
      emissive: new THREE.Color(0x1c0802),
      emissiveIntensity: 0.2,
      metalness: 0.88,
      roughness: 0.28,
    }),
    blackIron: new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      metalness: 0.92,
      roughness: 0.26,
    }),
    bloodGold: new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: new THREE.Color(0x451a03),
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.22,
    }),
    crimsonArmor: new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: new THREE.Color(0x2b0404),
      emissiveIntensity: 0.25,
      roughness: 0.48,
      metalness: 0.2,
      side: THREE.DoubleSide,
    }),
    warCloak: new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: new THREE.Color(0x3b0707),
      emissiveIntensity: 0.3,
      roughness: 0.62,
      metalness: 0.1,
      side: THREE.DoubleSide,
    }),
    plumeCrimson: new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: new THREE.Color(0x450a0a),
      emissiveIntensity: 0.35,
      roughness: 0.45,
    }),
    leatherDark: new THREE.MeshStandardMaterial({
      color: 0x29150c,
      roughness: 0.72,
      metalness: 0.08,
    }),
    eyeEmber: new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: new THREE.Color(0xf97316),
      emissiveIntensity: 4.2,
      roughness: 0.05,
    }),
    magmaEdge: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xef4444),
      emissiveIntensity: 3.8,
      roughness: 0.1,
    }),
    shieldFace: new THREE.MeshStandardMaterial({
      map: textures.shieldTex,
      metalness: 0.84,
      roughness: 0.28,
      side: THREE.DoubleSide,
    }),
  };
}

function group(parent: THREE.Group | null, x = 0, y = 0, z = 0): THREE.Group {
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
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

export interface AresParts {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  helm: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  sword: THREE.Group;
  swordAura: THREE.Mesh;
  swordTipAnchor: THREE.Group;
  hoplonShield: THREE.Group;
  crestSegments: Array<{ mesh: THREE.Mesh; baseX: number; phase: number; factor: number }>;
  pterugesStrips: Array<{ pivot: THREE.Group; baseRx: number; phase: number }>;
  cape: THREE.Mesh;
  capeBase: Float32Array;
}

export function buildAres(textures: AresTextures): AresParts {
  const M = createMaterials(textures);

  const root = new THREE.Group();
  const body = group(root, 0, 1.08, 0);

  // ------------------------------------------------------------------------
  // A. PELVE E PERNAS MACIÇAS (GREVAS DE BRONZE & FERRO)
  // ------------------------------------------------------------------------
  const pelvis = group(body, 0, 0.90, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.28, 22, 20), M.leatherDark, [0, 0, 0], [0, 0, 0], [1.16, 0.78, 0.88]);

  const legs: AresParts['legs'] = {
    L: {} as any,
    R: {} as any,
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.185, -0.04, 0);

    // Coxa musculosa
    sculpt(hip, new THREE.CylinderGeometry(0.168, 0.122, 0.50, 20), M.skin, [0, -0.24, 0], [0, 0, 0], [1.06, 1, 1.12]);
    const quadGeo = new THREE.SphereGeometry(0.132, 16, 16);
    sculpt(hip, quadGeo, M.skin, [s * 0.025, -0.21, 0.058], [0, 0, 0], [0.98, 1.85, 0.88]);
    sculpt(hip, quadGeo, M.skin, [s * 0.06, -0.24, 0.015], [0, 0, 0], [0.88, 1.75, 0.92]);

    // Joelho
    sculpt(hip, new THREE.SphereGeometry(0.105, 16, 16), M.skin, [0, -0.50, 0.016]);

    // Panturrilha e Grevas
    const knee = group(hip, 0, -0.51, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.108, 0.066, 0.46, 18), M.skin, [0, -0.23, 0], [0, 0, 0], [1.02, 1, 1.06]);
    sculpt(knee, new THREE.SphereGeometry(0.102, 16, 16), M.skin, [0, -0.15, -0.045], [0, 0, 0], [1.0, 1.65, 0.98]);

    // Greva frontal
    sculpt(knee, new THREE.CylinderGeometry(0.106, 0.072, 0.38, 18, 1, false, -0.9, 1.8), M.darkBronze, [0, -0.23, 0.012]);
    sculpt(knee, new THREE.ConeGeometry(0.055, 0.12, 5), M.bloodGold, [0, -0.02, 0.095], [0.15, 0, 0], [1.1, 1, 0.45]);

    // Sandália / Bota pesada de batalha
    const ankle = group(knee, 0, -0.46, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.115, 0.065, 0.24), M.leatherDark, [0, -0.02, 0.04], [0.05, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.124, 0.022, 0.255), M.darkBronze, [0, -0.052, 0.04], [0.05, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.118, 0.045, 0.06), M.bloodGold, [0, -0.015, 0.14], [0.2, 0, 0]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.24, -0.18, -0.14);
  legs.L.knee.rotation.set(0.32, 0, 0);
  legs.R.hip.rotation.set(0.20, 0.22, 0.16);
  legs.R.knee.rotation.set(0.26, 0, 0);

  // ------------------------------------------------------------------------
  // B. TRONCO MASSIVO (PEITORAIS COM CICATRIZES, 6-PACK & TRAPÉZIOS)
  // ------------------------------------------------------------------------
  const torso = group(body, 0, 1.34, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.29, -0.40),
    new THREE.Vector2(0.27, -0.20),
    new THREE.Vector2(0.34, 0.04),
    new THREE.Vector2(0.46, 0.28),
    new THREE.Vector2(0.41, 0.44),
    new THREE.Vector2(0.18, 0.51),
    new THREE.Vector2(0.01, 0.52),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.24, 1.02, 0.78]);

  // Peitorais
  const pecGeo = new THREE.SphereGeometry(0.245, 24, 24);
  sculpt(torso, pecGeo, M.skin, [-0.215, 0.23, 0.185], [0.12, -0.22, -0.14], [1.08, 0.88, 0.62]);
  sculpt(torso, pecGeo, M.skin, [0.215, 0.23, 0.185], [0.12, 0.22, 0.14], [1.08, 0.88, 0.62]);

  // Cicatrizes de combate no peito
  const chestScar1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.34, 0.34, 0.16),
    new THREE.Vector3(-0.18, 0.24, 0.29),
    new THREE.Vector3(-0.04, 0.14, 0.30),
  ]);
  sculpt(torso, new THREE.TubeGeometry(chestScar1, 14, 0.0085, 6, false), M.scarMat);

  const chestScar2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.28, 0.26, 0.25),
    new THREE.Vector3(0.14, 0.17, 0.29),
    new THREE.Vector3(0.22, 0.07, 0.27),
  ]);
  sculpt(torso, new THREE.TubeGeometry(chestScar2, 12, 0.0075, 6, false), M.scarMat);

  // Six-Pack Abdominal
  const abGeo = new THREE.SphereGeometry(0.098, 16, 16);
  [
    { y: 0.04, sx: 1.05, sy: 0.76, z: 0.242 },
    { y: -0.08, sx: 1.0, sy: 0.78, z: 0.238 },
    { y: -0.20, sx: 0.92, sy: 0.84, z: 0.226 },
  ].forEach((lvl) => {
    sculpt(torso, abGeo, M.skin, [-0.082, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.50]);
    sculpt(torso, abGeo, M.skin, [0.082, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.50]);
  });

  // Oblíquos, dorsais e trapézios
  const obliqueGeo = new THREE.CapsuleGeometry(0.092, 0.24, 10, 16);
  sculpt(torso, obliqueGeo, M.skin, [-0.285, -0.11, 0.095], [0.1, 0, -0.18], [0.88, 1, 0.88]);
  sculpt(torso, obliqueGeo, M.skin, [0.285, -0.11, 0.095], [0.1, 0, 0.18], [0.88, 1, 0.88]);

  const latGeo = new THREE.SphereGeometry(0.27, 20, 20);
  sculpt(torso, latGeo, M.skin, [-0.245, 0.17, -0.13], [0, 0, -0.25], [1.04, 1.36, 0.68]);
  sculpt(torso, latGeo, M.skin, [0.245, 0.17, -0.13], [0, 0, 0.25], [1.04, 1.36, 0.68]);

  const trapGeo = new THREE.SphereGeometry(0.245, 18, 18);
  sculpt(torso, trapGeo, M.skin, [-0.21, 0.43, -0.05], [0, 0, 0.42], [1.15, 0.68, 0.78]);
  sculpt(torso, trapGeo, M.skin, [0.21, 0.43, -0.05], [0, 0, -0.42], [1.15, 0.68, 0.78]);

  // Pescoço largo
  sculpt(torso, new THREE.CylinderGeometry(0.145, 0.182, 0.25, 20), M.skin, [0, 0.53, -0.01], [0.08, 0, 0], [1.02, 1, 1.08]);

  // Correia diagonal de couro e bronze
  const baldricCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.32, 0.42, 0.14),
    new THREE.Vector3(0.14, 0.16, 0.29),
    new THREE.Vector3(-0.12, -0.12, 0.27),
    new THREE.Vector3(-0.28, -0.34, 0.16),
  ]);
  const baldricGeo = new THREE.TubeGeometry(baldricCurve, 24, 0.032, 8, false);
  baldricGeo.scale(1, 1, 0.45);
  sculpt(torso, baldricGeo, M.leatherDark);
  sculpt(torso, new THREE.CylinderGeometry(0.055, 0.055, 0.022, 18), M.bloodGold, [0.12, 0.15, 0.295], [Math.PI / 2 - 0.15, 0.2, 0]);

  // ------------------------------------------------------------------------
  // C. CABEÇA FEROZ + CICATRIZ FACIAL + BARBA CERRADA + ELMO ESPARTANO
  // ------------------------------------------------------------------------
  const head = group(torso, 0, 0.75, 0.038);

  const skullGeo = new THREE.SphereGeometry(0.212, 36, 36);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.16;
    x *= 0.96;
    if (y < 0.02 && y > -0.09 && z > 0) { x *= 1.08; z *= 1.06; }
    if (y <= -0.08 && z > -0.02) { x *= 1.02; z *= 1.12; }
    if (z < -0.12) z *= 0.92;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  // Nariz grego
  sculpt(head, new THREE.BoxGeometry(0.034, 0.088, 0.052), M.skin, [0, 0.004, 0.202], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.022, 14, 14), M.skin, [0, -0.038, 0.216], [0, 0, 0], [1.05, 0.85, 1.05]);

  // Sobrancelhas franzidas
  const browRidge = new THREE.CapsuleGeometry(0.018, 0.068, 8, 12);
  sculpt(head, browRidge, M.skinShade, [-0.056, 0.044, 0.192], [0.12, 0.25, 1.24]);
  sculpt(head, browRidge, M.skinShade, [0.056, 0.044, 0.192], [0.12, -0.25, -1.24]);

  const eyebrow = new THREE.CapsuleGeometry(0.013, 0.066, 8, 12);
  sculpt(head, eyebrow, M.beardDark, [-0.056, 0.051, 0.201], [0.12, 0.25, 1.20], [1.1, 1, 0.85]);
  sculpt(head, eyebrow, M.beardDark, [0.056, 0.051, 0.201], [0.12, -0.25, -1.20], [1.1, 1, 0.85]);

  // Olhos incandescentes
  const eyeGeo = new THREE.SphereGeometry(0.021, 16, 16);
  sculpt(head, eyeGeo, M.eyeEmber, [-0.055, 0.022, 0.188], [0, 0, 0], [1.18, 0.66, 0.8]);
  sculpt(head, eyeGeo, M.eyeEmber, [0.055, 0.022, 0.188], [0, 0, 0], [1.18, 0.66, 0.8]);

  // Cicatriz facial cruzando o olho
  const faceScarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.072, 0.072, 0.195),
    new THREE.Vector3(-0.055, 0.025, 0.204),
    new THREE.Vector3(-0.036, -0.035, 0.206),
    new THREE.Vector3(-0.024, -0.078, 0.202),
  ]);
  sculpt(head, new THREE.TubeGeometry(faceScarCurve, 12, 0.0055, 6, false), M.scarMat);

  // Boca cerrada
  sculpt(head, new THREE.BoxGeometry(0.058, 0.011, 0.025), M.skinShade, [0, -0.092, 0.204], [0.1, 0, 0]);

  // Barba curta cerrada escura
  sculpt(head, new THREE.CylinderGeometry(0.182, 0.158, 0.12, 24, 1, false, -Math.PI * 0.42, Math.PI * 0.84), M.beardDark, [0, -0.115, 0.048], [0.12, 0, 0], [0.96, 1, 1.06]);
  sculpt(head, new THREE.BoxGeometry(0.095, 0.055, 0.045), M.beardDark, [0, -0.145, 0.195], [0.15, 0, 0]);
  sculpt(head, new THREE.CapsuleGeometry(0.012, 0.056, 8, 10), M.beardDark, [0, -0.074, 0.208], [0, 0, Math.PI / 2], [1, 1, 0.75]);

  // ------------------------------------------------------------------------
  // ELMO ESPARTANO COM CRISTA CARMESIM ARQUEADA
  // ------------------------------------------------------------------------
  const helm = group(head, 0, 0.035, -0.005);

  sculpt(
    helm,
    new THREE.SphereGeometry(0.228, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.56),
    M.darkBronze,
    [0, 0.02, 0],
    [-0.08, 0, 0],
    [0.98, 1.08, 1.06]
  );

  // Crista central metálica
  sculpt(helm, new THREE.BoxGeometry(0.038, 0.09, 0.36), M.bloodGold, [0, 0.23, -0.01], [-0.08, 0, 0]);

  // Protetor Nasal em T
  sculpt(helm, new THREE.BoxGeometry(0.024, 0.115, 0.032), M.bloodGold, [0, 0.035, 0.226], [-0.06, 0, 0]);

  // Sobrancelha metálica em V invertido
  sculpt(helm, new THREE.BoxGeometry(0.115, 0.026, 0.032), M.bloodGold, [-0.055, 0.066, 0.216], [0, 0.28, -0.22]);
  sculpt(helm, new THREE.BoxGeometry(0.115, 0.026, 0.032), M.bloodGold, [0.055, 0.066, 0.216], [0, -0.28, 0.22]);

  // Protetores de Bochechas
  for (const side of [-1, 1]) {
    const cheekGuard = group(helm, side * 0.165, -0.045, 0.115);
    cheekGuard.rotation.set(0.08, side * 0.52, side * -0.12);
    sculpt(cheekGuard, new THREE.BoxGeometry(0.024, 0.17, 0.135), M.darkBronze, [0, 0, 0]);
    sculpt(cheekGuard, new THREE.BoxGeometry(0.028, 0.175, 0.022), M.bloodGold, [0, 0, 0.065]);
  }

  // Protetor de Nuca
  sculpt(
    helm,
    new THREE.CylinderGeometry(0.215, 0.245, 0.15, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76),
    M.darkBronze,
    [0, -0.075, -0.015],
    [0.12, 0, 0]
  );

  // Crista de crina de cavalo vermelha carmesim
  const crestGroup = group(helm, 0, 0.26, -0.01);
  const crestSegments: AresParts['crestSegments'] = [];
  const numCrest = 22;
  for (let i = 0; i < numCrest; i++) {
    const t = i / (numCrest - 1);
    const ang = -0.55 + t * 2.55;
    const r = 0.26;
    const cy = Math.cos(ang) * r * 0.88 - 0.04;
    const cz = Math.sin(ang) * r * 1.15 - 0.04;
    const segH = 0.16 + Math.sin(t * Math.PI) * 0.06;

    const seg = sculpt(
      crestGroup,
      new THREE.BoxGeometry(0.028, segH, 0.036),
      M.plumeCrimson,
      [0, cy, cz],
      [ang, 0, 0]
    );
    crestSegments.push({ mesh: seg, baseX: 0, phase: i * 0.45, factor: 0.3 + t * 0.9 });
  }

  // ------------------------------------------------------------------------
  // D. OMBREIRAS PONTIAGUDAS E BRAÇOS DE GUERRA
  // ------------------------------------------------------------------------
  function createWarArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.49, 0.34, -0.01);

    const pauldron = group(arm, s * 0.02, 0.04, 0);
    pauldron.rotation.set(0.06, -s * 0.1, s * -0.34);

    for (let layer = 0; layer < 3; layer++) {
      const rad = 0.205 - layer * 0.016;
      sculpt(
        pauldron,
        new THREE.SphereGeometry(rad, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
        layer === 1 ? M.bloodGold : (layer === 0 ? M.blackIron : M.darkBronze),
        [0, 0.045 - layer * 0.048, 0],
        [0, 0, 0],
        [1.15, 0.76, 1.18]
      );
    }
    sculpt(pauldron, new THREE.ConeGeometry(0.032, 0.16, 6), M.bloodGold, [s * 0.08, 0.13, 0], [0, 0, s * -0.45]);

    sculpt(arm, new THREE.SphereGeometry(0.162, 20, 20), M.skin, [0, -0.02, 0], [0, 0, s * -0.25], [1.06, 1.16, 1.06]);
    sculpt(arm, new THREE.CapsuleGeometry(0.106, 0.28, 12, 18), M.skin, [s * 0.028, -0.19, 0], [0, 0, s * 0.08]);
    sculpt(arm, new THREE.SphereGeometry(0.098, 16, 16), M.skin, [s * 0.02, -0.18, 0.052], [0, 0, s * 0.08], [0.95, 1.48, 0.95]);
    sculpt(arm, new THREE.SphereGeometry(0.095, 16, 16), M.skin, [s * 0.058, -0.19, -0.045], [0, 0, s * 0.08], [0.96, 1.42, 0.92]);

    const elbow = group(arm, s * 0.048, -0.38, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.098, 0.064, 0.34, 18), M.skin, [0, -0.16, 0], [0, 0, 0], [1.06, 1, 0.96]);
    sculpt(elbow, new THREE.SphereGeometry(0.08, 14, 14), M.skin, [s * 0.022, -0.09, 0.024], [0, 0, 0], [0.96, 1.5, 0.96]);

    const bracer = group(elbow, 0, -0.25, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.078, 0.068, 0.13, 24, 1, true), M.blackIron, [0, 0, 0], [0, 0, 0], [1.06, 1, 0.97]);
    const bRing = new THREE.TorusGeometry(0.075, 0.008, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.bloodGold, [0, 0.058, 0], [0, 0, 0], [1.06, 1, 0.97]);
    sculpt(bracer, bRing, M.bloodGold, [0, -0.058, 0], [0, 0, 0], [1.06, 1, 0.97]);

    const hand = group(elbow, 0, -0.35, 0);
    sculpt(hand, new THREE.BoxGeometry(0.084, 0.092, 0.044), M.skin, [0, -0.02, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.012, 0.044, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.0195;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.072, 0.022], [1.3, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.045, -0.036, 0.026], [0.65, 0, -s * 0.65], [1.15, 0.9, 1.15]);

    return { arm, elbow, hand };
  }

  const rightArm = createWarArm(true);
  const leftArm = createWarArm(false);

  // ------------------------------------------------------------------------
  // E. ESPADA LARGA XIPHOS COM FIO INCANDESCENTE
  // ------------------------------------------------------------------------
  const sword = new THREE.Group();
  rightArm.hand.add(sword);
  sword.position.set(0, -0.04, 0.038);
  sword.rotation.set(Math.PI / 2, 0, 0);

  sculpt(sword, new THREE.SphereGeometry(0.042, 14, 14), M.bloodGold, [0, -0.22, 0], [0, 0, 0], [1.2, 0.85, 0.85]);
  sculpt(sword, new THREE.CylinderGeometry(0.024, 0.028, 0.24, 14), M.leatherDark, [0, -0.08, 0]);

  sculpt(sword, new THREE.BoxGeometry(0.24, 0.048, 0.068), M.bloodGold, [0, 0.05, 0]);
  sculpt(sword, new THREE.ConeGeometry(0.032, 0.08, 6), M.darkBronze, [-0.13, 0.05, 0], [0, 0, Math.PI / 2]);
  sculpt(sword, new THREE.ConeGeometry(0.032, 0.08, 6), M.darkBronze, [0.13, 0.05, 0], [0, 0, -Math.PI / 2]);

  const bladeLength = 1.48;
  const bladeGeo = new THREE.BoxGeometry(0.145, bladeLength, 0.022, 4, 16, 1);
  const bPos = bladeGeo.attributes.position;
  for (let i = 0; i < bPos.count; i++) {
    let x = bPos.getX(i), y = bPos.getY(i), z = bPos.getZ(i);
    const t = (y + bladeLength * 0.5) / bladeLength;
    let widthFactor = 1.0;
    if (t < 0.35) widthFactor = 0.82 + (t / 0.35) * 0.36;
    else if (t < 0.78) widthFactor = 1.18 - ((t - 0.35) / 0.43) * 0.14;
    else widthFactor = Math.max(0.02, 1.04 * (1 - (t - 0.78) / 0.22));

    x *= widthFactor;
    if (Math.abs(x) > 0.03) z *= 0.35;
    bPos.setXYZ(i, x, y, z);
  }
  bladeGeo.computeVertexNormals();
  sculpt(sword, bladeGeo, M.blackIron, [0, 0.07 + bladeLength * 0.5, 0]);

  sculpt(sword, new THREE.BoxGeometry(0.014, bladeLength * 0.92, 0.012), M.magmaEdge, [-0.072, 0.07 + bladeLength * 0.48, 0], [0, 0, -0.02]);
  sculpt(sword, new THREE.BoxGeometry(0.014, bladeLength * 0.92, 0.012), M.magmaEdge, [0.072, 0.07 + bladeLength * 0.48, 0], [0, 0, 0.02]);
  sculpt(sword, new THREE.BoxGeometry(0.016, bladeLength * 0.78, 0.026), M.magmaEdge, [0, 0.07 + bladeLength * 0.44, 0]);

  const swordAura = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, bladeLength * 0.98, 0.08),
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  swordAura.position.set(0, 0.07 + bladeLength * 0.5, 0);
  sword.add(swordAura);

  const swordTipAnchor = group(sword, 0, 0.07 + bladeLength, 0);

  // ------------------------------------------------------------------------
  // F. ESCUDO HOPLON COM LAMBDA ESPARTANO (Λ)
  // ------------------------------------------------------------------------
  const hoplonShield = group(leftArm.elbow, -0.065, -0.22, 0.02);
  hoplonShield.rotation.set(0, -Math.PI / 2, 0);

  const shieldDomeGeo = new THREE.SphereGeometry(0.68, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.28);
  shieldDomeGeo.rotateX(Math.PI / 2);
  sculpt(hoplonShield, shieldDomeGeo, M.shieldFace, [0, 0, -0.52]);

  sculpt(hoplonShield, new THREE.TorusGeometry(0.64, 0.032, 12, 48), M.bloodGold, [0, 0, 0.02]);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    sculpt(hoplonShield, new THREE.SphereGeometry(0.016, 8, 8), M.darkBronze, [Math.cos(a) * 0.64, Math.sin(a) * 0.64, 0.048]);
  }

  // ------------------------------------------------------------------------
  // G. CINTURÃO DE GUERRA + PTERUGES + CAPA CARMESIM
  // ------------------------------------------------------------------------
  const garments = group(torso, 0, 0, 0);

  const beltGeo = new THREE.TorusGeometry(0.30, 0.034, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.leatherDark, [0, -0.36, 0.01], [0.05, 0, -0.03], [1.12, 1, 0.85]);

  const goldBeltRim = new THREE.TorusGeometry(0.305, 0.012, 8, 36);
  goldBeltRim.rotateX(Math.PI / 2);
  sculpt(garments, goldBeltRim, M.bloodGold, [0, -0.34, 0.01], [0.05, 0, -0.03], [1.12, 1, 0.85]);

  sculpt(garments, new THREE.BoxGeometry(0.14, 0.11, 0.032), M.bloodGold, [0, -0.36, 0.265]);
  sculpt(garments, new THREE.OctahedronGeometry(0.034, 0), M.magmaEdge, [0, -0.36, 0.285]);

  const pterugesStrips: AresParts['pterugesStrips'] = [];
  const numStrips = 16;
  for (let i = 0; i < numStrips; i++) {
    const a = (i / numStrips) * Math.PI * 2;
    const stripPivot = group(garments, Math.sin(a) * 0.31, -0.40, Math.cos(a) * 0.24);
    stripPivot.rotation.set(Math.cos(a) * 0.14, a, -Math.sin(a) * 0.14);

    sculpt(stripPivot, new THREE.BoxGeometry(0.088, 0.42, 0.018), i % 2 === 0 ? M.crimsonArmor : M.leatherDark, [0, -0.21, 0]);
    sculpt(stripPivot, new THREE.BoxGeometry(0.092, 0.045, 0.022), M.bloodGold, [0, -0.41, 0]);

    pterugesStrips.push({ pivot: stripPivot, baseRx: stripPivot.rotation.x, phase: i * 0.5 });
  }

  const capeGeo = new THREE.PlaneGeometry(1.46, 1.98, 26, 34);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.99 - y) / 1.98));
    const archZ = -0.18 - Math.cos((x / 0.73) * Math.PI * 0.5) * 0.09;
    const z = archZ - normY * 0.55;
    const fx = x * (0.66 + normY * 0.78);
    const tatter = (Math.sin(x * 13) * 0.09 + Math.cos(x * 23) * 0.05) * Math.pow(normY, 2.2);
    const fy = y + tatter;
    cPos.setXYZ(i, fx, fy, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = fy;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.warCloak, [0, -0.46, -0.05]);

  return {
    root,
    body,
    torso,
    head,
    helm,
    legs,
    rightArm,
    leftArm,
    sword,
    swordAura,
    swordTipAnchor,
    hoplonShield,
    crestSegments,
    pterugesStrips,
    cape,
    capeBase,
  };
}

export function animateAres(
  ares: AresParts,
  dt: number,
  t: number,
  mode: 'postura' | 'investida' | 'sismico' | 'furia' = 'postura'
): void {
  const breath = Math.sin(t * 2.4) * 0.03;
  let pitch = 0.04, roll = 0, ay = 0;

  if (mode === 'investida') {
    pitch = 0.24;
    roll = -0.25;
    ay = Math.abs(Math.sin(t * 9.0)) * 0.14;

    ares.legs.L.hip.rotation.x = -0.55 + Math.sin(t * 9.0) * 0.45;
    ares.legs.L.knee.rotation.x = 0.65 + Math.max(0, -Math.cos(t * 9.0)) * 0.45;
    ares.legs.R.hip.rotation.x = -0.55 - Math.sin(t * 9.0) * 0.45;
    ares.legs.R.knee.rotation.x = 0.65 + Math.max(0, Math.cos(t * 9.0)) * 0.45;

    ares.leftArm.arm.rotation.set(-0.92, -0.55, -0.35);
    ares.leftArm.elbow.rotation.set(-1.1, -0.3, 0.25);
    ares.rightArm.arm.rotation.set(0.45, 0.2, 0.55);
    ares.rightArm.elbow.rotation.set(-0.75, 0.15, 0.2);
    ares.sword.rotation.set(Math.PI / 2 - 0.15, 0, 0);
  } else if (mode === 'sismico') {
    const cycle = (t * 0.72) % 1.0;
    if (cycle < 0.38) {
      const k = cycle / 0.38;
      const jumpCurve = Math.sin(k * Math.PI * 0.85);
      ay = jumpCurve * 1.45;
      pitch = -0.22 * k;
      ares.rightArm.arm.rotation.set(-0.45 * k, 0.1, 2.75 * k);
      ares.rightArm.elbow.rotation.set(0.75 * k, 0.1, 0.2);
      ares.sword.rotation.set(Math.PI / 2 - 0.45 * k, 0, 0);
      ares.leftArm.arm.rotation.set(-0.25, -0.25, -0.75);
      ares.legs.L.hip.rotation.x = -0.45 * k;
      ares.legs.L.knee.rotation.x = 0.75 * k;
      ares.legs.R.hip.rotation.x = 0.35 * k;
    } else if (cycle < 0.56) {
      const k = (cycle - 0.38) / 0.18;
      ay = 1.45 * (1 - k);
      pitch = -0.22 + 0.58 * k;
      ares.rightArm.arm.rotation.set(-0.45 + 1.35 * k, 0.1, 2.75 - 2.35 * k);
      ares.rightArm.elbow.rotation.set(0.75 - 0.55 * k, 0.1, 0.2);
      ares.sword.rotation.set(Math.PI / 2 + 0.45 * k, 0, 0);
      ares.legs.L.hip.rotation.x = -0.45;
      ares.legs.L.knee.rotation.x = 0.75;
      ares.legs.R.hip.rotation.x = 0.35;
    } else {
      const k = (cycle - 0.56) / 0.44;
      ay = 0;
      pitch = 0.36 * (1 - k) + 0.04 * k;
      ares.rightArm.arm.rotation.set(0.90 * (1 - k) - 0.15 * k, 0.12, 0.40 * (1 - k) + 0.48 * k);
      ares.rightArm.elbow.rotation.set(0.20 * (1 - k) - 0.45 * k, 0.15, 0.2);
      ares.sword.rotation.set(Math.PI / 2, 0, 0);
      ares.legs.L.hip.rotation.x = -0.24;
      ares.legs.L.knee.rotation.x = 0.32;
      ares.legs.R.hip.rotation.x = 0.20;
    }
  } else if (mode === 'furia') {
    pitch = -0.08 + Math.sin(t * 14) * 0.015;
    ares.rightArm.arm.rotation.set(-0.42, 0.15, 2.38 + Math.sin(t * 3.0) * 0.05);
    ares.rightArm.elbow.rotation.set(0.55, 0.2, 0.25);
    ares.sword.rotation.set(Math.PI / 2 - 0.25, 0, 0);
    ares.leftArm.arm.rotation.set(-0.35, -0.3, -0.82);
    ares.leftArm.elbow.rotation.set(-0.75, -0.2, 0.15);
    ares.legs.L.hip.rotation.x = -0.26;
    ares.legs.L.knee.rotation.x = 0.36;
    ares.legs.R.hip.rotation.x = 0.22;
  } else {
    ares.rightArm.arm.rotation.set(-0.15, 0.12, 0.48 + Math.sin(t * 2.0) * 0.03);
    ares.rightArm.elbow.rotation.set(-0.45, 0.15, 0.2);
    ares.sword.rotation.set(Math.PI / 2, 0, 0);
    ares.leftArm.arm.rotation.set(-0.42, -0.35, -0.52 + Math.cos(t * 1.8) * 0.03);
    ares.leftArm.elbow.rotation.set(-0.88, -0.25, 0.22);
    ares.legs.L.hip.rotation.x = -0.24;
    ares.legs.L.knee.rotation.x = 0.32;
    ares.legs.R.hip.rotation.x = 0.20;
    ares.legs.R.knee.rotation.x = 0.26;
  }

  ares.body.position.y = 1.08 + ay + breath;
  ares.body.rotation.set(pitch, 0, roll);

  const fireMult = mode === 'furia' ? 2.4 : 1.0;
  ares.swordAura.scale.set(1 + Math.sin(t * 18) * 0.15 * fireMult, 1, 1 + Math.cos(t * 16) * 0.2 * fireMult);
  (ares.swordAura.material as THREE.MeshBasicMaterial).opacity = 0.26 * fireMult;

  const wind = (mode === 'investida' || mode === 'furia') ? 2.0 : 1.0;
  for (const cs of ares.crestSegments) {
    cs.mesh.position.x = cs.baseX + Math.sin(t * 3.8 * wind - cs.phase) * 0.022 * cs.factor;
  }
  for (const pt of ares.pterugesStrips) {
    pt.pivot.rotation.x = pt.baseRx + Math.sin(t * 3.2 * wind + pt.phase) * 0.06;
  }

  const cAttr = ares.cape.geometry.attributes.position;
  for (let i = 0; i < cAttr.count; i++) {
    const bx = ares.capeBase[i * 3];
    const by = ares.capeBase[i * 3 + 1];
    const bz = ares.capeBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.99 - by) / 1.98));
    const wave1 = Math.sin(t * 3.4 * wind - normY * 4.5 + bx * 2.5) * 0.15 * normY;
    const wave2 = Math.cos(t * 2.4 * wind - normY * 3.0) * 0.065 * normY;
    cAttr.setXYZ(i, bx + Math.sin(t * 2.6 - normY * 3.0) * 0.04 * normY, by, bz + wave1 + wave2);
  }
  cAttr.needsUpdate = true;
  ares.cape.geometry.computeVertexNormals();
}
