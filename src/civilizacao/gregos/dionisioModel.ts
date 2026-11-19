import * as THREE from 'three';

export interface DionysusTextures {
  skinBump: THREE.CanvasTexture;
  nebrisTex: THREE.CanvasTexture;
  tunicTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createDionysusTextures(): DionysusTextures {
  // 1. Bump map suave da pele
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5500; i++) {
      const v = 123 + Math.floor(Math.random() * 12);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 2. Nébris (Pele de Pantera / Leopardo Sagrada cruzando o ombro de Dionísio)
  const peltCanvas = document.createElement('canvas');
  peltCanvas.width = 512;
  peltCanvas.height = 256;
  const pCtx = peltCanvas.getContext('2d');
  if (pCtx) {
    const pGrad = pCtx.createLinearGradient(0, 0, 512, 256);
    pGrad.addColorStop(0, '#d97706');
    pGrad.addColorStop(0.5, '#b45309');
    pGrad.addColorStop(1, '#92400e');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 85; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 256;
      const rad = 8 + Math.random() * 8;
      pCtx.fillStyle = '#78350f';
      pCtx.beginPath();
      pCtx.arc(rx, ry, rad * 0.65, 0, Math.PI * 2);
      pCtx.fill();

      pCtx.strokeStyle = '#1c1917';
      pCtx.lineWidth = 3.5;
      pCtx.beginPath();
      pCtx.arc(rx, ry, rad, 0.3, Math.PI * 1.65);
      pCtx.stroke();
    }
  }
  const nebrisTex = new THREE.CanvasTexture(peltCanvas);
  nebrisTex.wrapS = nebrisTex.wrapT = THREE.RepeatWrapping;

  // 3. Himation Púrpura Imperial & Vinho Profundo com borda dourada
  const tunicCanvas = document.createElement('canvas');
  tunicCanvas.width = 512;
  tunicCanvas.height = 256;
  const tCtx = tunicCanvas.getContext('2d');
  if (tCtx) {
    const tGrad = tCtx.createLinearGradient(0, 0, 0, 256);
    tGrad.addColorStop(0, '#581c87');
    tGrad.addColorStop(0.62, '#4c1d95');
    tGrad.addColorStop(1, '#3b0764');
    tCtx.fillStyle = tGrad;
    tCtx.fillRect(0, 0, 512, 256);

    tCtx.fillStyle = 'rgba(233, 213, 255, 0.08)';
    for (let x = 0; x < 512; x += 10) tCtx.fillRect(x, 0, 3, 256);

    tCtx.fillStyle = '#eab308';
    tCtx.fillRect(0, 200, 512, 38);
    tCtx.fillStyle = '#3b0764';
    tCtx.fillRect(0, 196, 512, 4);
    tCtx.fillRect(0, 238, 512, 4);

    tCtx.strokeStyle = '#3b0764';
    tCtx.lineWidth = 3;
    for (let x = 0; x < 512; x += 32) {
      tCtx.beginPath();
      tCtx.moveTo(x, 219);
      tCtx.quadraticCurveTo(x + 8, 207, x + 16, 219);
      tCtx.quadraticCurveTo(x + 24, 231, x + 32, 219);
      tCtx.stroke();
    }
  }
  const tunicTex = new THREE.CanvasTexture(tunicCanvas);
  tunicTex.wrapS = tunicTex.wrapT = THREE.RepeatWrapping;

  return { skinBump, nebrisTex, tunicTex };
}

let _cachedDionysusTex: DionysusTextures | null = null;
export function getCachedDionysusTextures(): DionysusTextures {
  if (!_cachedDionysusTex) _cachedDionysusTex = createDionysusTextures();
  return _cachedDionysusTex;
}

function group(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D | null,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos = [0, 0, 0],
  rot = [0, 0, 0],
  scale = [1, 1, 1]
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

export interface DionysusLegJoints {
  hip: THREE.Group;
  knee: THREE.Group;
  ankle: THREE.Group;
}

export interface DionysusArmJoints {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

export interface DionysusModel {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: DionysusLegJoints;
    R: DionysusLegJoints;
  };
  rightArm: DionysusArmJoints;
  leftArm: DionysusArmJoints;
  thyrsus: THREE.Group;
  thyrsusHead: THREE.Group;
  pineCore: THREE.Mesh;
  thyrsusAnchor: THREE.Group;
  thyrsusGlow: THREE.Mesh;
  ribbonL: THREE.Mesh;
  ribbonR: THREE.Mesh;
  chalice: THREE.Group;
  chaliceGlow: THREE.Mesh;
  hairCurls: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  cape: THREE.Mesh;
  capeBase: Float32Array;
}

export function createDionysusMaterials(textures: DionysusTextures): Record<string, THREE.Material> {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xd5976c,
      roughness: 0.38,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.003,
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0xbd7d53,
      roughness: 0.42,
      metalness: 0.06,
    }),
    hairDarkAuburn: new THREE.MeshStandardMaterial({
      color: 0x2e1028,
      emissive: new THREE.Color(0x1a0518),
      emissiveIntensity: 0.22,
      roughness: 0.36,
      metalness: 0.16,
    }),
    hairWineHighlight: new THREE.MeshStandardMaterial({
      color: 0x6b21a8,
      emissive: new THREE.Color(0x2e084d),
      emissiveIntensity: 0.25,
      roughness: 0.34,
      metalness: 0.2,
    }),
    ivyGreen: new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      emissive: new THREE.Color(0x052e16),
      emissiveIntensity: 0.25,
      roughness: 0.48,
      side: THREE.DoubleSide,
    }),
    grapePurple: new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: new THREE.Color(0x3b0764),
      emissiveIntensity: 0.35,
      roughness: 0.22,
      metalness: 0.2,
    }),
    goldPolished: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0x422006),
      emissiveIntensity: 0.25,
      metalness: 0.92,
      roughness: 0.18,
    }),
    bronzeWood: new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.55,
      metalness: 0.25,
    }),
    pineConeMat: new THREE.MeshStandardMaterial({
      color: 0x92400e,
      emissive: new THREE.Color(0x451a03),
      emissiveIntensity: 0.3,
      roughness: 0.42,
      metalness: 0.45,
    }),
    nebrisPelt: new THREE.MeshStandardMaterial({
      map: textures.nebrisTex,
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
    purpleTunic: new THREE.MeshStandardMaterial({
      map: textures.tunicTex,
      color: 0xffffff,
      roughness: 0.50,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
    wineLiquid: new THREE.MeshStandardMaterial({
      color: 0xc026d3,
      emissive: new THREE.Color(0x86198f),
      emissiveIntensity: 2.2,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.92,
    }),
    eyeAmethyst: new THREE.MeshStandardMaterial({
      color: 0xf0abfc,
      emissive: new THREE.Color(0xc026d3),
      emissiveIntensity: 2.9,
      roughness: 0.08,
    }),
  };
}

export function buildDionysus(textures: DionysusTextures): DionysusModel {
  const M = createDionysusMaterials(textures);

  const root = new THREE.Group();
  const body = group(root, 0, 1.10, 0);

  // A. PELVE E PERNAS ATLÉTICAS E DESCONTRAÍDAS
  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.24, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.10, 0.78, 0.84]);

  const buildLeg = (side: 'L' | 'R'): DionysusLegJoints => {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.15, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.138, 0.098, 0.50, 20), M.skin, [0, -0.24, 0], [0, 0, 0], [1.02, 1, 1.07]);
    sculpt(hip, new THREE.SphereGeometry(0.106, 16, 16), M.skin, [s * 0.018, -0.21, 0.046], [0, 0, 0], [0.94, 1.82, 0.86]);
    sculpt(hip, new THREE.SphereGeometry(0.086, 16, 16), M.skin, [0, -0.50, 0.014]);

    const knee = group(hip, 0, -0.51, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.086, 0.052, 0.46, 18), M.skin, [0, -0.23, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.082, 16, 16), M.skin, [0, -0.15, -0.036], [0, 0, 0], [0.96, 1.65, 0.95]);

    const vineWrap = new THREE.TorusGeometry(0.068, 0.006, 8, 20);
    vineWrap.rotateX(Math.PI / 2);
    sculpt(knee, vineWrap, M.goldPolished, [0, -0.34, 0.005], [0.15, 0, 0]);
    sculpt(knee, vineWrap, M.ivyGreen, [0, -0.28, 0.005], [-0.15, 0, 0]);

    const ankle = group(knee, 0, -0.46, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.09, 0.048, 0.21), M.skin, [0, -0.02, 0.038], [0.22, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.098, 0.015, 0.225), M.goldPolished, [0, -0.044, 0.038], [0.22, 0, 0]);
    return { hip, knee, ankle };
  };

  const legs: Record<'L' | 'R', DionysusLegJoints> = {
    L: buildLeg('L'),
    R: buildLeg('R'),
  };

  legs.L.hip.rotation.set(-0.36, -0.10, -0.06);
  legs.L.knee.rotation.set(0.55, 0, 0);
  legs.R.hip.rotation.set(0.20, 0.10, 0.06);
  legs.R.knee.rotation.set(0.25, 0, 0);

  // B. TRONCO ATLÉTICO ESCULPIDO + NEBRIS
  const torso = group(body, 0, 1.32, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.43),
    new THREE.Vector2(0.245, -0.39),
    new THREE.Vector2(0.215, -0.19),
    new THREE.Vector2(0.265, 0.03),
    new THREE.Vector2(0.37, 0.26),
    new THREE.Vector2(0.33, 0.42),
    new THREE.Vector2(0.145, 0.49),
    new THREE.Vector2(0.01, 0.50),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.16, 1.02, 0.74]);

  const pecGeo = new THREE.SphereGeometry(0.205, 22, 22);
  sculpt(torso, pecGeo, M.skin, [-0.175, 0.22, 0.16], [0.12, -0.22, -0.14], [1.05, 0.85, 0.58]);
  sculpt(torso, pecGeo, M.skin, [0.175, 0.22, 0.16], [0.12, 0.22, 0.14], [1.05, 0.85, 0.58]);

  const abGeo = new THREE.SphereGeometry(0.082, 14, 14);
  [
    { y: 0.04, sx: 0.98, sy: 0.75, z: 0.202 },
    { y: -0.075, sx: 0.94, sy: 0.78, z: 0.198 },
    { y: -0.19, sx: 0.86, sy: 0.84, z: 0.188 },
  ].forEach((lvl) => {
    sculpt(torso, abGeo, M.skin, [-0.068, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.48]);
    sculpt(torso, abGeo, M.skin, [0.068, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.48]);
  });

  const obliqueGeo = new THREE.CapsuleGeometry(0.075, 0.22, 10, 14);
  sculpt(torso, obliqueGeo, M.skin, [-0.235, -0.11, 0.082], [0.1, 0, -0.18], [0.85, 1, 0.85]);
  sculpt(torso, obliqueGeo, M.skin, [0.235, -0.11, 0.082], [0.1, 0, 0.18], [0.85, 1, 0.85]);

  const latGeo = new THREE.SphereGeometry(0.225, 18, 18);
  sculpt(torso, latGeo, M.skin, [-0.20, 0.17, -0.112], [0, 0, -0.25], [1.0, 1.32, 0.65]);
  sculpt(torso, latGeo, M.skin, [0.20, 0.17, -0.112], [0, 0, 0.25], [1.0, 1.32, 0.65]);
  sculpt(torso, new THREE.CylinderGeometry(0.116, 0.146, 0.25, 20), M.skin, [0, 0.52, -0.008], [0.07, 0, 0]);

  // NEBRIS: Faixa de Pele de Pantera
  const nebrisCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, -0.35, 0.21),
    new THREE.Vector3(0.04, -0.06, 0.25),
    new THREE.Vector3(-0.18, 0.24, 0.21),
    new THREE.Vector3(-0.23, 0.44, 0.11),
    new THREE.Vector3(-0.20, 0.45, -0.12),
    new THREE.Vector3(-0.04, 0.08, -0.21),
    new THREE.Vector3(0.16, -0.34, -0.18),
  ]);
  const nebrisGeo = new THREE.TubeGeometry(nebrisCurve, 32, 0.105, 12, false);
  nebrisGeo.scale(1.15, 1, 0.44);
  sculpt(torso, nebrisGeo, M.nebrisPelt);

  sculpt(torso, new THREE.CylinderGeometry(0.048, 0.048, 0.02, 20), M.goldPolished, [-0.22, 0.42, 0.13], [-0.35, -0.25, 0]);
  sculpt(torso, new THREE.OctahedronGeometry(0.024, 0), M.grapePurple, [-0.22, 0.42, 0.145]);

  // C. ROSTO JOVEM + COROA DE VIDEIRAS E UVAS
  const head = group(torso, 0, 0.73, 0.032);

  const skullGeo = new THREE.SphereGeometry(0.194, 38, 38);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.15;
    x *= 0.91;
    if (y < 0.02 && y > -0.08 && z > 0) { x *= 1.04; z *= 1.04; }
    if (y <= -0.08 && z > -0.02) {
      const taper = Math.max(0.66, 1.0 - ((-0.08 - y) / 0.14) * 0.32);
      x *= taper;
      z *= 1.04;
    }
    if (z < -0.11) z *= 0.93;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  const cheekGeo = new THREE.SphereGeometry(0.045, 16, 16);
  sculpt(head, cheekGeo, M.skin, [-0.068, -0.015, 0.15], [0, -0.3, 0], [1.1, 0.85, 0.65]);
  sculpt(head, cheekGeo, M.skin, [0.068, -0.015, 0.15], [0, 0.3, 0], [1.1, 0.85, 0.65]);

  sculpt(head, new THREE.BoxGeometry(0.022, 0.078, 0.042), M.skin, [0, 0.004, 0.185], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.016, 14, 14), M.skin, [0, -0.034, 0.199], [0, 0, 0], [0.95, 0.82, 1.0]);

  const browGeo = new THREE.CapsuleGeometry(0.0085, 0.056, 8, 12);
  sculpt(head, browGeo, M.hairDarkAuburn, [-0.052, 0.048, 0.179], [0.1, 0.25, 1.40]);
  sculpt(head, browGeo, M.hairDarkAuburn, [0.052, 0.048, 0.179], [0.1, -0.25, -1.40]);

  const eyeGeo = new THREE.SphereGeometry(0.019, 16, 16);
  sculpt(head, eyeGeo, M.eyeAmethyst, [-0.052, 0.022, 0.173], [0, 0, 0], [1.15, 0.76, 0.8]);
  sculpt(head, eyeGeo, M.eyeAmethyst, [0.052, 0.022, 0.173], [0, 0, 0], [1.15, 0.76, 0.8]);

  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.032, -0.072, 0.180),
    new THREE.Vector3(0, -0.086, 0.189),
    new THREE.Vector3(0.032, -0.072, 0.180),
  ]);
  sculpt(head, new THREE.TubeGeometry(smileCurve, 12, 0.007, 6, false), M.skinShade);

  const hairCurls: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }> = [];
  sculpt(head, new THREE.SphereGeometry(0.20, 24, 24), M.hairDarkAuburn, [0, 0.04, -0.02], [-0.08, 0, 0], [1.03, 1.03, 1.07]);

  for (let i = 0; i < 34; i++) {
    const ang = (i / 34) * Math.PI * 2;
    const isFront = Math.cos(ang) > 0.38;
    const rad = isFront ? 0.18 : 0.198;
    const cx = Math.sin(ang) * rad;
    const cz = Math.cos(ang) * rad - 0.01;
    const cy = isFront ? 0.074 : (0.04 - (i % 5) * 0.052);
    const curlSize = isFront ? 0.034 : (0.048 + (i % 2) * 0.014);

    const curl = sculpt(
      head,
      new THREE.SphereGeometry(curlSize, 12, 12),
      i % 3 === 0 ? M.hairWineHighlight : M.hairDarkAuburn,
      [cx, cy, cz],
      [0.2, ang, 0],
      [1.05, 1.28, 0.95]
    );
    hairCurls.push({ mesh: curl, baseY: cy, phase: i * 0.48 });
  }

  // Coroa de Videiras
  const vineCrown = group(head, 0, 0.105, 0.01);
  vineCrown.rotation.x = 0.2;
  const crownVine = new THREE.TorusGeometry(0.20, 0.014, 10, 36);
  crownVine.rotateX(Math.PI / 2);
  sculpt(vineCrown, crownVine, M.ivyGreen, [0, 0, 0], [0, 0, 0], [0.98, 1, 1.06]);

  const ivyLeafGeo = new THREE.SphereGeometry(0.034, 8, 8);
  ivyLeafGeo.scale(0.85, 1.25, 0.18);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    sculpt(
      vineCrown,
      ivyLeafGeo,
      M.ivyGreen,
      [Math.sin(a) * 0.205, 0.015, Math.cos(a) * 0.218],
      [0.35, a, (i % 2 === 0 ? 0.3 : -0.3)]
    );
  }

  for (const side of [-1, 1] as const) {
    const cluster = group(vineCrown, side * 0.195, -0.02, 0.06);
    for (let g = 0; g < 6; g++) {
      const gx = ((g % 2) - 0.5) * 0.022;
      const gy = -Math.floor(g / 2) * 0.022;
      const gz = (g % 3) * 0.008;
      sculpt(cluster, new THREE.SphereGeometry(0.016, 10, 10), M.grapePurple, [gx, gy, gz]);
    }
  }

  // D. BRAÇOS + TIRSO + CÁLICE (KANTHAROS)
  function createDionysusArm(isRight: boolean): DionysusArmJoints {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.41, 0.33, -0.008);

    sculpt(arm, new THREE.SphereGeometry(0.132, 18, 18), M.skin, [0, 0, 0], [0, 0, s * -0.22], [1.04, 1.12, 1.04]);
    sculpt(arm, new THREE.CapsuleGeometry(0.084, 0.26, 12, 16), M.skin, [s * 0.02, -0.17, 0], [0, 0, s * 0.07]);
    sculpt(arm, new THREE.SphereGeometry(0.078, 14, 14), M.skin, [s * 0.015, -0.16, 0.038], [0, 0, s * 0.07], [0.92, 1.42, 0.92]);

    const elbow = group(arm, s * 0.038, -0.34, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.078, 0.052, 0.31, 18), M.skin, [0, -0.15, 0]);

    const bracer = group(elbow, 0, -0.24, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.062, 0.055, 0.085, 24, 1, true), M.goldPolished);
    const bRing = new THREE.TorusGeometry(0.06, 0.0055, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.ivyGreen, [0, 0.04, 0]);
    sculpt(bracer, bRing, M.ivyGreen, [0, -0.04, 0]);

    const hand = group(elbow, 0, -0.32, 0);
    sculpt(hand, new THREE.BoxGeometry(0.068, 0.078, 0.034), M.skin, [0, -0.018, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.0095, 0.036, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.016;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.058, 0.016], [1.15, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.036, -0.028, 0.02], [0.55, 0, -s * 0.6], [1.05, 0.9, 1.05]);

    return { arm, elbow, hand };
  }

  const rightArm = createDionysusArm(true);
  const leftArm = createDionysusArm(false);

  // E. TIRSO (THYRSUS) NA MÃO DIREITA
  const thyrsus = new THREE.Group();
  rightArm.hand.add(thyrsus);
  thyrsus.position.set(0, -0.035, 0.032);

  sculpt(thyrsus, new THREE.CylinderGeometry(0.022, 0.025, 2.78, 16), M.bronzeWood, [0, 0.18, 0]);
  sculpt(thyrsus, new THREE.ConeGeometry(0.034, 0.2, 8), M.goldPolished, [0, -1.28, 0], [Math.PI, 0, 0]);

  const staffVinePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const ang = t * Math.PI * 10;
    const y = -0.95 + t * 2.35;
    staffVinePts.push(new THREE.Vector3(Math.cos(ang) * 0.032, y, Math.sin(ang) * 0.032));
  }
  sculpt(thyrsus, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(staffVinePts), 54, 0.0085, 6, false), M.ivyGreen);

  const ribbonL = sculpt(thyrsus, new THREE.BoxGeometry(0.035, 0.42, 0.006), M.purpleTunic, [-0.04, 1.24, 0.02], [0.1, 0, 0.28]);
  const ribbonR = sculpt(thyrsus, new THREE.BoxGeometry(0.035, 0.42, 0.006), M.purpleTunic, [0.04, 1.24, -0.02], [-0.1, 0, -0.28]);

  const thyrsusHead = group(thyrsus, 0, 1.56, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sculpt(
      thyrsusHead,
      ivyLeafGeo,
      M.ivyGreen,
      [Math.cos(a) * 0.068, -0.04, Math.sin(a) * 0.068],
      [0.65, -a, 0],
      [1.4, 1.4, 1.0]
    );
  }

  const pineCore = sculpt(thyrsusHead, new THREE.SphereGeometry(0.095, 18, 18), M.pineConeMat, [0, 0.12, 0], [0, 0, 0], [0.95, 1.65, 0.95]);
  for (let ring = 0; ring < 4; ring++) {
    const ry = 0.02 + ring * 0.062;
    const rad = Math.sin(((ring + 0.6) / 4.6) * Math.PI) * 0.092;
    const count = 7;
    for (let s = 0; s < count; s++) {
      const sa = (s / count) * Math.PI * 2 + ring * 0.45;
      sculpt(
        thyrsusHead,
        new THREE.ConeGeometry(0.026, 0.065, 5),
        ring % 2 === 0 ? M.goldPolished : M.grapePurple,
        [Math.cos(sa) * rad, ry, Math.sin(sa) * rad],
        [Math.sin(sa) * 0.55, -sa, -Math.cos(sa) * 0.55]
      );
    }
  }

  const thyrsusAnchor = group(thyrsusHead, 0, 0.28, 0);
  const thyrsusGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  thyrsusAnchor.add(thyrsusGlow);

  // F. CÁLICE DOURADO (KANTHAROS) NA MÃO ESQUERDA
  const chalice = group(leftArm.hand, 0, -0.055, 0.055);
  chalice.rotation.set(Math.PI / 2, 0, 0);

  sculpt(chalice, new THREE.CylinderGeometry(0.025, 0.055, 0.03, 18), M.goldPolished, [0, -0.09, 0]);
  sculpt(chalice, new THREE.CylinderGeometry(0.014, 0.018, 0.07, 14), M.goldPolished, [0, -0.045, 0]);
  sculpt(chalice, new THREE.CylinderGeometry(0.078, 0.038, 0.11, 22), M.goldPolished, [0, 0.035, 0]);
  for (const side of [-1, 1] as const) {
    const handleArc = new THREE.TorusGeometry(0.052, 0.006, 8, 20, Math.PI * 1.35);
    sculpt(chalice, handleArc, M.goldPolished, [side * 0.072, 0.065, 0], [0, 0, side === 1 ? -0.4 : 2.1]);
  }
  sculpt(chalice, new THREE.CylinderGeometry(0.072, 0.072, 0.01, 20), M.wineLiquid, [0, 0.088, 0]);

  const chaliceGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xe879f9,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  chaliceGlow.position.y = 0.11;
  chalice.add(chaliceGlow);

  // G. VESTIMENTA BÁQUICA
  const garments = group(torso, 0, 0, 0);

  const beltGeo = new THREE.TorusGeometry(0.26, 0.024, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.goldPolished, [0, -0.34, 0.008], [0.05, 0, -0.03], [1.06, 1, 0.82]);
  sculpt(garments, new THREE.OctahedronGeometry(0.03, 0), M.grapePurple, [0, -0.34, 0.215]);

  const skirtGeo = new THREE.CylinderGeometry(0.26, 0.54, 0.86, 48, 18, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.43 - y) / 0.86));
    const pleat = Math.sin(angle * 13) * 0.03 * (0.25 + normY * 0.92);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.05;
    z = Math.sin(angle) * r * 0.83 - normY * 0.08;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.purpleTunic, [0, -0.76, 0], [0.04, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.36, 1.86, 24, 32);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.93 - y) / 1.86));
    const archZ = -0.17 - Math.cos((x / 0.68) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.52;
    const fx = x * (0.64 + normY * 0.74);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.purpleTunic, [0, -0.45, -0.04]);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    thyrsus,
    thyrsusHead,
    pineCore,
    thyrsusAnchor,
    thyrsusGlow,
    ribbonL,
    ribbonR,
    chalice,
    chaliceGlow,
    hairCurls,
    skirtMesh,
    skirtBase,
    cape,
    capeBase,
  };
}

export function animateDionysus(
  dionysus: DionysusModel,
  dt: number,
  t: number,
  mode: 'banquete' | 'danca' | 'vinhas' | 'extase' = 'banquete'
) {
  let pitch = 0.04;
  let roll = 0;
  const hoverY = Math.sin(t * 1.8) * 0.08;

  if (mode === 'danca') {
    pitch = 0.12;
    roll = -0.22;
  }

  dionysus.body.position.y = 1.10 + hoverY;
  dionysus.body.rotation.set(pitch, 0, roll);

  dionysus.legs.L.hip.rotation.x = -0.36 + Math.sin(t * 2.2) * 0.08;
  dionysus.legs.R.hip.rotation.x = 0.20 - Math.sin(t * 2.2) * 0.08;

  if (mode === 'vinhas') {
    dionysus.rightArm.arm.rotation.set(-0.45, 0.15, 2.35 + Math.sin(t * 5.0) * 0.18);
    dionysus.rightArm.elbow.rotation.set(0.45, 0.2, 0.25);
    dionysus.thyrsus.rotation.set(0.25, 0, -0.22);
    dionysus.leftArm.arm.rotation.set(-0.42, -0.3, -0.75);
    dionysus.leftArm.elbow.rotation.set(-0.85, -0.2, 0.15);
  } else if (mode === 'extase') {
    dionysus.rightArm.arm.rotation.set(-0.35, 0.15, 2.35 + Math.sin(t * 2.4) * 0.06);
    dionysus.rightArm.elbow.rotation.set(0.45, 0.2, 0.25);
    dionysus.thyrsus.rotation.set(0.20, 0, -0.22);
    dionysus.leftArm.arm.rotation.set(-0.45, -0.25, -2.15 + Math.cos(t * 2.4) * 0.06);
    dionysus.leftArm.elbow.rotation.set(-0.45, -0.2, 0.15);
  } else {
    dionysus.rightArm.arm.rotation.set(-0.18, 0.12, 0.58 + Math.sin(t * 1.6) * 0.03);
    dionysus.rightArm.elbow.rotation.set(-0.52, 0.15, 0.22);
    dionysus.thyrsus.rotation.set(0.18, 0, -0.44);
    dionysus.leftArm.arm.rotation.set(-0.62, -0.35, -0.68 + Math.cos(t * 1.8) * 0.05);
    dionysus.leftArm.elbow.rotation.set(-1.05, -0.25, 0.18);
  }

  const festBoost = (mode === 'extase' || mode === 'vinhas') ? 1.5 : 1.0;
  dionysus.thyrsusGlow.scale.setScalar((0.9 + Math.sin(t * 12) * 0.18) * festBoost);
  dionysus.chaliceGlow.scale.setScalar((0.85 + Math.cos(t * 10) * 0.16) * festBoost);

  const wind = (mode === 'danca' || mode === 'extase') ? 1.85 : 1.0;
  for (const c of dionysus.hairCurls) {
    c.mesh.position.y = c.baseY + Math.sin(t * 2.8 * wind + c.phase) * 0.008;
  }
  dionysus.ribbonL.rotation.z = 0.28 + Math.sin(t * 4.2 * wind) * 0.14;
  dionysus.ribbonR.rotation.z = -0.28 + Math.cos(t * 4.0 * wind) * 0.14;

  const cAttr = dionysus.cape.geometry.attributes.position;
  for (let i = 0; i < cAttr.count; i++) {
    const bx = dionysus.capeBase[i * 3];
    const by = dionysus.capeBase[i * 3 + 1];
    const bz = dionysus.capeBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.93 - by) / 1.86));
    const wave1 = Math.sin(t * 3.2 * wind - normY * 4.5 + bx * 2.5) * 0.13 * normY;
    const wave2 = Math.cos(t * 2.2 * wind - normY * 3.0) * 0.055 * normY;
    cAttr.setXYZ(i, bx + Math.sin(t * 2.4 - normY * 3.0) * 0.032 * normY, by, bz + wave1 + wave2);
  }
  cAttr.needsUpdate = true;
  dionysus.cape.geometry.computeVertexNormals();

  const skAttr = dionysus.skirtMesh.geometry.attributes.position;
  for (let i = 0; i < skAttr.count; i++) {
    const bx = dionysus.skirtBase[i * 3];
    const by = dionysus.skirtBase[i * 3 + 1];
    const bz = dionysus.skirtBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.43 - by) / 0.86));
    skAttr.setZ(i, bz + Math.sin(t * 3.4 * wind - normY * 4.0 + bx * 4.0) * 0.04 * normY);
  }
  skAttr.needsUpdate = true;
  dionysus.skirtMesh.geometry.computeVertexNormals();
}
