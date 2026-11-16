import * as THREE from 'three';

export interface ZeusProceduralTextures {
  skinBump: THREE.CanvasTexture;
  tunicTex: THREE.CanvasTexture;
  marbleTex: THREE.CanvasTexture;
}

export function createZeusProceduralTextures(): ZeusProceduralTextures {
  // 1.1 Bump map de pele
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6500; i++) {
      const v = 122 + Math.floor(Math.random() * 14);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 1.2 Textura de Himation (borda meandro grego)
  const tunicCanvas = document.createElement('canvas');
  tunicCanvas.width = 512;
  tunicCanvas.height = 256;
  const tCtx = tunicCanvas.getContext('2d');
  if (tCtx) {
    tCtx.fillStyle = '#f8fafc';
    tCtx.fillRect(0, 0, 512, 256);

    tCtx.fillStyle = 'rgba(203, 213, 225, 0.28)';
    for (let y = 0; y < 256; y += 4) tCtx.fillRect(0, y, 512, 1);

    tCtx.fillStyle = '#eab308';
    tCtx.fillRect(0, 206, 512, 38);
    tCtx.fillStyle = '#854d0e';
    tCtx.fillRect(0, 204, 512, 3);
    tCtx.fillRect(0, 244, 512, 3);
    for (let x = 0; x < 512; x += 32) {
      tCtx.fillRect(x + 4, 212, 22, 4);
      tCtx.fillRect(x + 22, 212, 4, 22);
      tCtx.fillRect(x + 10, 230, 16, 4);
      tCtx.fillRect(x + 10, 220, 4, 14);
    }
  }
  const tunicTex = new THREE.CanvasTexture(tunicCanvas);
  tunicTex.wrapS = tunicTex.wrapT = THREE.RepeatWrapping;

  // 1.3 Textura de mármore branco veiado
  const marbleCanvas = document.createElement('canvas');
  marbleCanvas.width = marbleCanvas.height = 256;
  const mCtx = marbleCanvas.getContext('2d');
  if (mCtx) {
    mCtx.fillStyle = '#f3efe6';
    mCtx.fillRect(0, 0, 256, 256);
    mCtx.strokeStyle = 'rgba(168, 162, 158, 0.25)';
    mCtx.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      mCtx.beginPath();
      let mx = Math.random() * 256, my = 0;
      mCtx.moveTo(mx, my);
      while (my < 256) {
        my += 20;
        mx += (Math.random() - 0.5) * 28;
        mCtx.lineTo(mx, my);
      }
      mCtx.stroke();
    }
  }
  const marbleTex = new THREE.CanvasTexture(marbleCanvas);
  marbleTex.wrapS = marbleTex.wrapT = THREE.RepeatWrapping;

  return { skinBump, tunicTex, marbleTex };
}

function group(parent?: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D | null,
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

export function createZeusMaterials(textures: ZeusProceduralTextures) {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xc9885b,
      roughness: 0.44,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.004
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0xb57247,
      roughness: 0.48,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.004
    }),
    beard: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.48,
      metalness: 0.1
    }),
    silver: new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      roughness: 0.42,
      metalness: 0.18
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0x422006),
      emissiveIntensity: 0.25,
      metalness: 0.86,
      roughness: 0.22
    }),
    laurel: new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: new THREE.Color(0x3f2e00),
      emissiveIntensity: 0.3,
      metalness: 0.85,
      roughness: 0.24,
      side: THREE.DoubleSide
    }),
    tunic: new THREE.MeshStandardMaterial({
      map: textures.tunicTex,
      color: 0xffffff,
      roughness: 0.65,
      metalness: 0.04,
      side: THREE.DoubleSide
    }),
    cape: new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: new THREE.Color(0x220404),
      roughness: 0.56,
      metalness: 0.12,
      side: THREE.DoubleSide
    }),
    eyeGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 3.4,
      roughness: 0.08
    }),
    eyeIris: new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 2.2
    }),
    sandalLeather: new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.7
    })
  };
}

export interface ZeusMeshHierarchy {
  flight: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  handAnchor: THREE.Group;
  handGlow: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  leftOrb: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  beardLocks: Array<{ mesh: THREE.Mesh; rx: number; rz: number; phase: number }>;
  hairStrands: Array<{ mesh: THREE.Mesh; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  cape: THREE.Mesh;
  capeBase: Float32Array;
  ring1: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  ring2: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
}

export function buildZeus(textures: ZeusProceduralTextures): ZeusMeshHierarchy {
  const M = createZeusMaterials(textures);
  const flight = new THREE.Group();
  const body = new THREE.Group();
  flight.add(body);

  // A. Pelve e Pernas
  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.25, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.12, 0.74, 0.82]);

  const legs: any = {};
  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.165, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.145, 0.102, 0.50, 20), M.skin, [0, -0.24, 0], [0, 0, 0], [1.02, 1, 1.08]);
    const quadGeo = new THREE.SphereGeometry(0.112, 16, 16);
    sculpt(hip, quadGeo, M.skin, [s * 0.022, -0.21, 0.052], [0, 0, 0], [0.95, 1.85, 0.85]);
    sculpt(hip, quadGeo, M.skin, [s * 0.052, -0.24, 0.01], [0, 0, 0], [0.85, 1.75, 0.9]);

    sculpt(hip, new THREE.SphereGeometry(0.092, 16, 16), M.skin, [0, -0.50, 0.015], [0, 0, 0], [0.95, 0.95, 1.02]);

    const knee = group(hip, 0, -0.51, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.092, 0.056, 0.46, 18), M.skin, [0, -0.23, 0], [0, 0, 0], [0.95, 1, 1.02]);
    sculpt(knee, new THREE.SphereGeometry(0.088, 16, 16), M.skin, [0, -0.16, -0.04], [0, 0, 0], [0.96, 1.65, 0.95]);

    const ankle = group(knee, 0, -0.46, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.095, 0.052, 0.22), M.skin, [0, -0.02, 0.04], [0.32, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.104, 0.016, 0.235), M.gold, [0, -0.048, 0.04], [0.32, 0, 0]);

    const strapGeo = new THREE.TorusGeometry(0.062, 0.0065, 8, 20);
    strapGeo.rotateX(Math.PI / 2);
    for (let k = 0; k < 3; k++) {
      sculpt(ankle, strapGeo, M.gold, [0, 0.025 + k * 0.048, -0.02], [0.12, 0, 0], [0.95, 1, 1.06]);
    }
    legs[side] = { hip, knee, ankle };
  }

  legs.R.hip.rotation.set(0.18, 0.04, 0.05);
  legs.R.knee.rotation.set(0.22, 0, 0);
  legs.L.hip.rotation.set(-0.48, -0.06, -0.04);
  legs.L.knee.rotation.set(0.75, 0, 0);

  // B. Tronco
  const torso = group(body, 0, 1.32, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.26, -0.40),
    new THREE.Vector2(0.23, -0.20),
    new THREE.Vector2(0.28, 0.03),
    new THREE.Vector2(0.39, 0.27),
    new THREE.Vector2(0.34, 0.43),
    new THREE.Vector2(0.15, 0.50),
    new THREE.Vector2(0.01, 0.51)
  ];
  const torsoLathe = new THREE.LatheGeometry(torsoPts, 36);
  sculpt(torso, torsoLathe, M.skin, [0, 0, 0], [0, 0, 0], [1.18, 1.0, 0.72]);

  const pecGeo = new THREE.SphereGeometry(0.215, 24, 24);
  sculpt(torso, pecGeo, M.skin, [-0.185, 0.23, 0.165], [0.12, -0.22, -0.14], [1.05, 0.85, 0.58]);
  sculpt(torso, pecGeo, M.skin, [0.185, 0.23, 0.165], [0.12, 0.22, 0.14], [1.05, 0.85, 0.58]);

  const abGeo = new THREE.SphereGeometry(0.086, 16, 16);
  const abLevels = [
    { y: 0.04, sx: 0.98, sy: 0.75, z: 0.212 },
    { y: -0.075, sx: 0.94, sy: 0.78, z: 0.208 },
    { y: -0.195, sx: 0.86, sy: 0.84, z: 0.198 }
  ];
  abLevels.forEach(lvl => {
    sculpt(torso, abGeo, M.skin, [-0.07, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.48]);
    sculpt(torso, abGeo, M.skin, [0.07, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.48]);
  });

  const obliqueGeo = new THREE.CapsuleGeometry(0.078, 0.23, 10, 16);
  sculpt(torso, obliqueGeo, M.skin, [-0.245, -0.11, 0.085], [0.1, 0, -0.18], [0.85, 1, 0.85]);
  sculpt(torso, obliqueGeo, M.skin, [0.245, -0.11, 0.085], [0.1, 0, 0.18], [0.85, 1, 0.85]);

  const latGeo = new THREE.SphereGeometry(0.235, 20, 20);
  sculpt(torso, latGeo, M.skin, [-0.21, 0.17, -0.115], [0, 0, -0.25], [1.0, 1.35, 0.65]);
  sculpt(torso, latGeo, M.skin, [0.21, 0.17, -0.115], [0, 0, 0.25], [1.0, 1.35, 0.65]);

  const trapGeo = new THREE.SphereGeometry(0.215, 18, 18);
  sculpt(torso, trapGeo, M.skin, [-0.18, 0.42, -0.045], [0, 0, 0.42], [1.1, 0.65, 0.75]);
  sculpt(torso, trapGeo, M.skin, [0.18, 0.42, -0.045], [0, 0, -0.42], [1.1, 0.65, 0.75]);

  sculpt(torso, new THREE.CylinderGeometry(0.122, 0.155, 0.26, 20), M.skin, [0, 0.53, -0.01], [0.08, 0, 0], [1, 1, 1.05]);
  const scmGeo = new THREE.CapsuleGeometry(0.028, 0.18, 8, 12);
  sculpt(torso, scmGeo, M.skinShade, [-0.075, 0.51, 0.055], [0.22, 0.2, -0.32]);
  sculpt(torso, scmGeo, M.skinShade, [0.075, 0.51, 0.055], [0.22, -0.2, 0.32]);

  // C. Cabeça e Rosto
  const head = group(torso, 0, 0.74, 0.035);
  const skullGeo = new THREE.SphereGeometry(0.212, 36, 36);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.18;
    if (y < 0.03 && y > -0.12 && z > 0) { x *= 1.05; z *= 1.06; }
    if (y <= -0.08 && z > -0.02) { x *= 0.93; z *= 1.09; }
    if (z < -0.12) z *= 0.92;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin, [0, 0, 0], [0, 0, 0], [0.92, 1.0, 0.98]);

  const cheekGeo = new THREE.SphereGeometry(0.054, 16, 16);
  sculpt(head, cheekGeo, M.skin, [-0.082, -0.015, 0.162], [0, -0.3, 0], [1.15, 0.85, 0.7]);
  sculpt(head, cheekGeo, M.skin, [0.082, -0.015, 0.162], [0, 0.3, 0], [1.15, 0.85, 0.7]);

  sculpt(head, new THREE.BoxGeometry(0.034, 0.092, 0.052), M.skin, [0, 0.005, 0.202], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.022, 14, 14), M.skin, [0, -0.041, 0.218], [0, 0, 0], [1.0, 0.85, 1.05]);
  sculpt(head, new THREE.SphereGeometry(0.014, 12, 12), M.skin, [-0.018, -0.045, 0.205], [0, 0, 0], [1, 0.8, 1]);
  sculpt(head, new THREE.SphereGeometry(0.014, 12, 12), M.skin, [0.018, -0.045, 0.205], [0, 0, 0], [1, 0.8, 1]);

  const browRidge = new THREE.CapsuleGeometry(0.018, 0.066, 8, 12);
  sculpt(head, browRidge, M.skin, [-0.056, 0.048, 0.188], [0.1, 0.25, 1.38]);
  sculpt(head, browRidge, M.skin, [0.056, 0.048, 0.188], [0.1, -0.25, -1.38]);

  const eyebrow = new THREE.CapsuleGeometry(0.014, 0.064, 8, 12);
  sculpt(head, eyebrow, M.beard, [-0.056, 0.056, 0.198], [0.1, 0.25, 1.33], [1.1, 1, 0.8]);
  sculpt(head, eyebrow, M.beard, [0.056, 0.056, 0.198], [0.1, -0.25, -1.33], [1.1, 1, 0.8]);

  const eyeGeo = new THREE.SphereGeometry(0.021, 16, 16);
  sculpt(head, eyeGeo, M.eyeGlow, [-0.056, 0.025, 0.184], [0, 0, 0], [1.15, 0.72, 0.8]);
  sculpt(head, eyeGeo, M.eyeGlow, [0.056, 0.025, 0.184], [0, 0, 0], [1.15, 0.72, 0.8]);

  const irisGeo = new THREE.SphereGeometry(0.011, 12, 12);
  sculpt(head, irisGeo, M.eyeIris, [-0.056, 0.025, 0.197]);
  sculpt(head, irisGeo, M.eyeIris, [0.056, 0.025, 0.197]);

  const eyelidGeo = new THREE.BoxGeometry(0.05, 0.013, 0.028);
  sculpt(head, eyelidGeo, M.skin, [-0.056, 0.035, 0.192], [0.15, 0.2, -0.12]);
  sculpt(head, eyelidGeo, M.skin, [0.056, 0.035, 0.192], [0.15, -0.2, 0.12]);

  sculpt(head, new THREE.CapsuleGeometry(0.013, 0.046, 8, 12), M.skinShade, [0, -0.102, 0.195], [0, 0, Math.PI / 2], [1, 1, 0.8]);

  const mustacheGeo = new THREE.CapsuleGeometry(0.023, 0.072, 10, 14);
  sculpt(head, mustacheGeo, M.beard, [-0.044, -0.08, 0.202], [0.15, 0.35, 1.15], [1.1, 1, 0.85]);
  sculpt(head, mustacheGeo, M.beard, [0.044, -0.08, 0.202], [0.15, -0.35, -1.15], [1.1, 1, 0.85]);

  const beardLocks: Array<{ mesh: THREE.Mesh; rx: number; rz: number; phase: number }> = [];
  const lockGeo = new THREE.ConeGeometry(0.066, 0.22, 16);
  lockGeo.rotateX(Math.PI);
  const beardSpecs = [
    { pos: [0, -0.21, 0.165], rot: [-0.18, 0, 0], scale: [1.35, 1.75, 0.95], mat: M.beard },
    { pos: [-0.072, -0.19, 0.14], rot: [-0.12, -0.25, -0.14], scale: [1.05, 1.65, 0.88], mat: M.silver },
    { pos: [0.072, -0.19, 0.14], rot: [-0.12, 0.25, 0.14], scale: [1.05, 1.65, 0.88], mat: M.silver },
    { pos: [-0.115, -0.13, 0.075], rot: [-0.05, -0.45, -0.22], scale: [0.95, 1.4, 0.85], mat: M.beard },
    { pos: [0.115, -0.13, 0.075], rot: [-0.05, 0.45, 0.22], scale: [0.95, 1.4, 0.85], mat: M.beard },
    { pos: [0, -0.32, 0.145], rot: [-0.25, 0.08, 0.06], scale: [0.9, 1.35, 0.75], mat: M.beard },
    { pos: [-0.044, -0.30, 0.125], rot: [-0.22, -0.15, -0.1], scale: [0.75, 1.25, 0.7], mat: M.silver },
    { pos: [0.044, -0.30, 0.125], rot: [-0.22, 0.15, 0.1], scale: [0.75, 1.25, 0.7], mat: M.silver }
  ] as const;
  beardSpecs.forEach((sp, i) => {
    const m = sculpt(head, lockGeo, sp.mat, sp.pos as any, sp.rot as any, sp.scale as any);
    beardLocks.push({ mesh: m, rx: sp.rot[0], rz: sp.rot[2], phase: i * 0.65 });
  });

  sculpt(head, new THREE.SphereGeometry(0.222, 24, 24), M.beard, [0, 0.052, -0.025], [-0.1, 0, 0], [1.04, 1.02, 1.08]);
  const hairStrands: Array<{ mesh: THREE.Mesh; phase: number }> = [];
  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 1.55 + Math.PI * 0.72;
    const r = 0.192;
    const sx = Math.sin(angle) * r;
    const sz = Math.cos(angle) * r - 0.01;
    const sy = 0.088 + Math.cos(angle * 2) * 0.02;
    const len = 0.40 + (i % 3) * 0.065;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      const flare = 1 + t * 0.36;
      pts.push(new THREE.Vector3(
        sx * flare + Math.sin(t * Math.PI * 2.2 + i) * 0.03,
        sy - t * len,
        sz * flare - t * 0.14
      ));
    }
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.036 * (1 - 0.14 * (i % 2)), 8, false);
    const strand = sculpt(head, tube, i % 3 === 0 ? M.silver : M.beard);
    hairStrands.push({ mesh: strand, phase: i * 0.45 });
  }

  const crown = group(head, 0, 0.112, 0.015);
  crown.rotation.x = 0.24;
  const circlet = new THREE.TorusGeometry(0.21, 0.01, 10, 36, Math.PI * 1.72);
  circlet.rotateX(Math.PI / 2);
  circlet.rotateY(-Math.PI * 0.36);
  sculpt(crown, circlet, M.gold, [0, 0, 0], [0, 0, 0], [0.96, 1, 1.05]);

  const leafGeo = new THREE.SphereGeometry(0.027, 10, 10);
  leafGeo.scale(0.55, 1.45, 0.22);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const ang = side * (0.28 + t * 2.25);
      sculpt(
        crown,
        leafGeo,
        M.laurel,
        [Math.sin(ang) * 0.204, (1 - t) * 0.015, Math.cos(ang) * 0.22],
        [0.3, ang, side * -0.55]
      );
    }
  }

  // D. Braços
  function createMuscularArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.43, 0.34, -0.01);

    sculpt(arm, new THREE.SphereGeometry(0.142, 20, 20), M.skin, [0, 0, 0], [0, 0, s * -0.25], [1.05, 1.15, 1.05]);
    sculpt(arm, new THREE.SphereGeometry(0.105, 16, 16), M.skin, [s * 0.03, -0.04, 0.06], [0.2, 0, 0], [0.95, 1.2, 0.9]);

    sculpt(arm, new THREE.CapsuleGeometry(0.092, 0.27, 12, 18), M.skin, [s * 0.025, -0.18, 0], [0, 0, s * 0.08]);
    sculpt(arm, new THREE.SphereGeometry(0.086, 16, 16), M.skin, [s * 0.018, -0.17, 0.046], [0, 0, s * 0.08], [0.92, 1.45, 0.92]);
    sculpt(arm, new THREE.SphereGeometry(0.084, 16, 16), M.skin, [s * 0.052, -0.18, -0.04], [0, 0, s * 0.08], [0.95, 1.4, 0.9]);

    const elbow = group(arm, s * 0.045, -0.36, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.086, 0.056, 0.33, 18), M.skin, [0, -0.155, 0], [0, 0, 0], [1.05, 1, 0.95]);
    sculpt(elbow, new THREE.SphereGeometry(0.07, 14, 14), M.skin, [s * 0.02, -0.085, 0.022], [0, 0, 0], [0.95, 1.5, 0.95]);

    const bracer = group(elbow, 0, -0.26, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.067, 0.061, 0.082, 24, 1, true), M.gold, [0, 0, 0], [0, 0, 0], [1.05, 1, 0.96]);
    const bRing = new THREE.TorusGeometry(0.064, 0.006, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.gold, [0, 0.038, 0], [0, 0, 0], [1.05, 1, 0.96]);
    sculpt(bracer, bRing, M.gold, [0, -0.038, 0], [0, 0, 0], [1.05, 1, 0.96]);

    const hand = group(elbow, 0, -0.34, 0);
    sculpt(hand, new THREE.BoxGeometry(0.074, 0.082, 0.036), M.skin, [0, -0.02, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.0105, 0.04, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.0175;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.065, isRight ? 0.018 : 0.005], [isRight ? 0.9 : 0.25, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.04, -0.032, 0.022], [0.5, 0, -s * 0.6], [1.1, 0.9, 1.1]);

    return { arm, elbow, hand };
  }

  const rightArm = createMuscularArm(true);
  rightArm.arm.rotation.set(-0.35, 0.15, 2.38);
  rightArm.elbow.rotation.set(0.55, 0.2, 0.35);

  const leftArm = createMuscularArm(false);
  leftArm.arm.rotation.set(0.32, -0.25, -0.78);
  leftArm.elbow.rotation.set(-0.65, -0.3, -0.25);

  const heldBolt = new THREE.Group();
  rightArm.hand.add(heldBolt);
  heldBolt.position.set(0, -0.04, 0.04);
  heldBolt.rotation.set(0.35, 0.2, -0.25);

  const boltCoreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xfde047),
    emissiveIntensity: 3.6,
    roughness: 0.1
  });
  const boltAuraMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const boltPts = [
    new THREE.Vector3(0, 0.82, 0),
    new THREE.Vector3(0.085, 0.40, 0.03),
    new THREE.Vector3(-0.055, 0.32, -0.02),
    new THREE.Vector3(0.055, -0.02, 0.02),
    new THREE.Vector3(-0.075, -0.10, -0.02),
    new THREE.Vector3(0.048, -0.43, 0.02),
    new THREE.Vector3(-0.04, -0.78, 0)
  ];
  for (let i = 0; i < boltPts.length - 1; i++) {
    const p1 = boltPts[i], p2 = boltPts[i + 1];
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const taper = 1 - Math.abs((i / (boltPts.length - 1)) - 0.5) * 1.55;
    const r1 = Math.max(0.008, 0.04 * taper);
    const r2 = Math.max(0.008, 0.036 * taper);

    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, len * 1.08, 8), boltCoreMat);
    seg.position.copy(mid);
    seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    heldBolt.add(seg);

    const aura = new THREE.Mesh(new THREE.CylinderGeometry(r1 * 2.1, r2 * 2.1, len * 1.12, 8), boltAuraMat);
    aura.position.copy(mid);
    aura.quaternion.copy(seg.quaternion);
    heldBolt.add(aura);
  }

  const handAnchor = group(heldBolt, 0, 0.84, 0);
  const handGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xfff3a0,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    })
  );
  handAnchor.add(handGlow);

  const leftOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 14, 14),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  leftOrb.position.set(0, -0.08, 0.05);
  leftArm.hand.add(leftOrb);

  // E. Vestimentas e Auréolas
  const garments = group(torso, 0, 0, 0);

  const sashCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.21, -0.40, 0.21),
    new THREE.Vector3(-0.25, 0.05, 0.23),
    new THREE.Vector3(-0.23, 0.42, 0.13),
    new THREE.Vector3(-0.21, 0.44, -0.13),
    new THREE.Vector3(-0.17, 0.05, -0.21),
    new THREE.Vector3(-0.14, -0.40, -0.17)
  ]);
  const sashGeo = new THREE.TubeGeometry(sashCurve, 32, 0.105, 12, false);
  sashGeo.scale(1.15, 1, 0.48);
  sculpt(garments, sashGeo, M.tunic);

  const broochGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.018, 24);
  broochGeo.rotateX(Math.PI / 2);
  sculpt(garments, broochGeo, M.gold, [-0.23, 0.41, 0.14], [-0.4, -0.2, 0]);

  const beltGeo = new THREE.TorusGeometry(0.27, 0.024, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.gold, [0, -0.35, 0.01], [0.06, 0, -0.04], [1.06, 1, 0.82]);

  const skirtGeo = new THREE.CylinderGeometry(0.275, 0.54, 0.84, 48, 20, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = (0.42 - y) / 0.84;
    const pleat = Math.sin(angle * 12) * 0.026 * (0.3 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.05;
    z = Math.sin(angle) * r * 0.82 - normY * 0.1;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.tunic, [0, -0.76, 0], [0.05, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.32, 1.82, 24, 32);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = (0.91 - y) / 1.82;
    const archZ = -0.17 - Math.cos((x / 0.66) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.52;
    const fx = x * (0.65 + normY * 0.72);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.cape, [0, -0.44, -0.04]);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xfde68a,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.014, 8, 72), ringMat);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.set(0, 1.15, 0);
  body.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.011, 8, 72), ringMat.clone());
  ring2.rotation.set(Math.PI / 2.35, 0, 0.32);
  ring2.position.set(0, 1.15, 0);
  body.add(ring2);

  return {
    flight,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    handAnchor,
    handGlow,
    leftOrb,
    beardLocks,
    hairStrands,
    skirtMesh,
    skirtBase,
    cape,
    capeBase,
    ring1,
    ring2
  };
}

export function createZeusTempleEnvironment(scene: THREE.Scene, textures: ZeusProceduralTextures) {
  // Chão circular do Templo + Anéis dourados concêntricos
  const groundMat = new THREE.MeshStandardMaterial({
    map: textures.marbleTex,
    color: 0x5a9c94,
    roughness: 0.85,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(7.2, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  for (const [r, w] of [[3.5, 0.055], [4.15, 0.035], [4.8, 0.02]]) {
    const rg = new THREE.Mesh(
      new THREE.RingGeometry(r, r + w, 72),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
    );
    rg.rotation.x = -Math.PI / 2;
    rg.position.y = 0.01;
    scene.add(rg);
  }

  const marbleMat = new THREE.MeshStandardMaterial({
    map: textures.marbleTex,
    color: 0xf5f5f4,
    roughness: 0.55,
    metalness: 0.05
  });
  const goldColMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.78,
    roughness: 0.25
  });

  const shaftGeo = new THREE.CylinderGeometry(0.22, 0.26, 2.65, 24, 1);
  const shPos = shaftGeo.attributes.position;
  for (let i = 0; i < shPos.count; i++) {
    const x = shPos.getX(i), y = shPos.getY(i), z = shPos.getZ(i);
    const ang = Math.atan2(z, x);
    const flute = Math.cos(ang * 16) * 0.008;
    const r = Math.sqrt(x * x + z * z) - flute;
    shPos.setXYZ(i, Math.cos(ang) * r, y, Math.sin(ang) * r);
  }
  shaftGeo.computeVertexNormals();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const col = group(scene, Math.cos(a) * 5.2, 0, Math.sin(a) * 5.2);

    sculpt(col, new THREE.BoxGeometry(0.68, 0.14, 0.68), marbleMat, [0, 0.07, 0]);
    sculpt(col, new THREE.CylinderGeometry(0.30, 0.33, 0.12, 20), marbleMat, [0, 0.20, 0]);
    sculpt(col, shaftGeo, marbleMat, [0, 1.56, 0]);
    sculpt(col, new THREE.CylinderGeometry(0.32, 0.22, 0.16, 20), marbleMat, [0, 2.95, 0]);
    sculpt(col, new THREE.BoxGeometry(0.64, 0.14, 0.64), marbleMat, [0, 3.09, 0]);
    sculpt(col, new THREE.BoxGeometry(0.54, 0.055, 0.54), goldColMat, [0, 3.19, 0]);
  }

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0x1e293b),
    emissiveIntensity: 0.15,
    roughness: 0.95
  });
  const clouds: Array<{ g: THREE.Group; baseY: number; ph: number }> = [];
  const puffGeo = new THREE.SphereGeometry(0.55, 16, 14);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.35;
    const dist = 2.9 + (i % 2) * 0.65;
    const g = group(scene, Math.cos(a) * dist, 0.45 + (i % 3) * 0.15, Math.sin(a) * dist);
    for (let k = 0; k < 5; k++) {
      const sc = 0.75 + Math.random() * 0.5;
      const m = new THREE.Mesh(puffGeo, cloudMat);
      m.position.set((k - 2) * 0.42, (k % 2) * 0.12, (Math.random() - 0.5) * 0.35);
      m.scale.set(1.3 * sc, 0.65 * sc, 1.1 * sc);
      g.add(m);
    }
    clouds.push({ g, baseY: g.position.y, ph: Math.random() * 6 });
  }

  return { ground, clouds };
}
