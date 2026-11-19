import * as THREE from 'three';

export interface CaribdisTextures {
  scaleBump: THREE.CanvasTexture;
  whirlTex: THREE.CanvasTexture;
  waterTex: THREE.CanvasTexture;
}

export function createCaribdisTextures(): CaribdisTextures {
  const scaleCanvas = document.createElement('canvas');
  scaleCanvas.width = scaleCanvas.height = 256;
  const sCtx = scaleCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#707070';
    sCtx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 16) {
      for (let x = 0; x < 256; x += 16) {
        const ox = y % 32 === 0 ? 0 : 8;
        sCtx.strokeStyle = '#d4d4d4';
        sCtx.lineWidth = 2;
        sCtx.beginPath();
        sCtx.arc(x + ox, y, 10, 0, Math.PI);
        sCtx.stroke();
      }
    }
  }
  const scaleBump = new THREE.CanvasTexture(scaleCanvas);
  scaleBump.wrapS = scaleBump.wrapT = THREE.RepeatWrapping;
  scaleBump.repeat.set(6, 6);

  const whirlCanvas = document.createElement('canvas');
  whirlCanvas.width = whirlCanvas.height = 512;
  const wCtx = whirlCanvas.getContext('2d');
  if (wCtx) {
    wCtx.fillStyle = '#042f2e';
    wCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 180; i++) {
      const y = Math.random() * 512;
      wCtx.strokeStyle = i % 3 === 0 ? 'rgba(45, 212, 191, 0.42)' : 'rgba(224, 242, 254, 0.30)';
      wCtx.lineWidth = 2 + Math.random() * 5;
      wCtx.beginPath();
      wCtx.moveTo(0, y);
      wCtx.bezierCurveTo(170, y + 26, 340, y - 26, 512, y);
      wCtx.stroke();
    }
  }
  const whirlTex = new THREE.CanvasTexture(whirlCanvas);
  whirlTex.wrapS = whirlTex.wrapT = THREE.RepeatWrapping;
  whirlTex.repeat.set(3, 2);

  const waterCanvas = document.createElement('canvas');
  waterCanvas.width = waterCanvas.height = 256;
  const fCtx = waterCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#03354a';
    fCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 850; i++) {
      const r = 3 + Math.random() * 14;
      fCtx.strokeStyle = `rgba(94, 234, 212, ${0.1 + Math.random() * 0.24})`;
      fCtx.lineWidth = 1.4;
      fCtx.beginPath();
      fCtx.arc(Math.random() * 256, Math.random() * 256, r, 0, Math.PI * 2);
      fCtx.stroke();
    }
  }
  const waterTex = new THREE.CanvasTexture(waterCanvas);
  waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
  waterTex.repeat.set(5, 5);

  return { scaleBump, whirlTex, waterTex };
}

let _cachedCaribdisTex: CaribdisTextures | null = null;
export function getCachedCaribdisTextures(): CaribdisTextures {
  if (!_cachedCaribdisTex) _cachedCaribdisTex = createCaribdisTextures();
  return _cachedCaribdisTex;
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

export interface CharybdisTitan {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  jawPivot: THREE.Group;
  mouthCore: THREE.Mesh;
  breathBeam: THREE.Mesh;
  armL: THREE.Group;
  armR: THREE.Group;
  forearmLPivot: THREE.Group;
  forearmRPivot: THREE.Group;
  clawUpper: THREE.Group;
  clawLower: THREE.Group;
  whirlpoolGroup: THREE.Group;
  whirlRings: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }>;
  backTentacles: Array<{
    root: THREE.Group;
    segs: Array<{ pivot: THREE.Group; phase: number }>;
  }>;
  faceTentacles: Array<{ mesh: THREE.Mesh; side: number; phase: number }>;
}

export function buildCharybdisTitan(textures: CaribdisTextures): CharybdisTitan {
  const abyssSkin = new THREE.MeshStandardMaterial({
    color: 0x0f3b4c,
    roughness: 0.36,
    metalness: 0.24,
    bumpMap: textures.scaleBump,
    bumpScale: 0.0065,
  });

  const chitinArmor = new THREE.MeshStandardMaterial({
    color: 0x111827,
    emissive: new THREE.Color(0x042f2e),
    emissiveIntensity: 0.25,
    roughness: 0.28,
    metalness: 0.72,
    bumpMap: textures.scaleBump,
    bumpScale: 0.005,
  });

  const atlanteanGold = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: new THREE.Color(0x291102),
    emissiveIntensity: 0.22,
    metalness: 0.9,
    roughness: 0.24,
  });

  const bioTealVein = new THREE.MeshStandardMaterial({
    color: 0x99f6e4,
    emissive: new THREE.Color(0x14b8a6),
    emissiveIntensity: 1.55,
    roughness: 0.1,
  });

  const coralGlow = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 1.45,
    roughness: 0.12,
  });

  const eyeAbyss = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0x2dd4bf),
    emissiveIntensity: 1.8,
    roughness: 0.05,
  });

  const fangIvory = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    emissive: new THREE.Color(0x0f766e),
    emissiveIntensity: 0.2,
    roughness: 0.25,
  });

  const whirlWater = new THREE.MeshStandardMaterial({
    map: textures.whirlTex,
    color: 0x0ea5e9,
    emissive: new THREE.Color(0x0f766e),
    emissiveIntensity: 0.7,
    roughness: 0.18,
    metalness: 0.25,
    transparent: true,
    opacity: 0.86,
    side: THREE.DoubleSide,
  });

  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xf0f9ff,
    emissive: new THREE.Color(0x5eead4),
    emissiveIntensity: 0.5,
    roughness: 0.6,
    transparent: true,
    opacity: 0.9,
  });

  const tentacleMat = new THREE.MeshStandardMaterial({
    color: 0x134e4a,
    emissive: new THREE.Color(0x042f2e),
    emissiveIntensity: 0.35,
    roughness: 0.34,
    metalness: 0.2,
    bumpMap: textures.scaleBump,
    bumpScale: 0.004,
  });

  const titanRoot = new THREE.Group();

  // Redemoinho Devorador
  const whirlpoolGroup = group(titanRoot, 0, 0, 0);

  const funnelGeo = new THREE.CylinderGeometry(1.18, 1.85, 1.75, 44, 20, true);
  const fPos = funnelGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const x = fPos.getX(i);
    const y = fPos.getY(i);
    const z = fPos.getZ(i);
    const normY = (y + 0.875) / 1.75;
    const ang = Math.atan2(z, x);
    const spiral = Math.sin(ang * 5 + normY * 8.5) * 0.11 * (0.4 + normY * 0.6);
    const r = Math.sqrt(x * x + z * z) + spiral;
    fPos.setXYZ(i, Math.cos(ang) * r, y, Math.sin(ang) * r);
  }
  funnelGeo.computeVertexNormals();
  const funnelMesh = new THREE.Mesh(funnelGeo, whirlWater);
  funnelMesh.position.y = 0.85;
  whirlpoolGroup.add(funnelMesh);

  const baseFoamRing = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.22, 12, 44), foamMat);
  baseFoamRing.rotation.x = Math.PI / 2;
  baseFoamRing.position.y = 0.1;
  whirlpoolGroup.add(baseFoamRing);

  const whirlRings: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }> = [];
  for (let r = 0; r < 5; r++) {
    const t = r / 4;
    const rad = 1.78 - t * 0.56;
    const wRing = new THREE.Mesh(
      new THREE.TorusGeometry(rad, 0.036, 8, 40),
      new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0x2dd4bf : 0x38bdf8,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    wRing.rotation.x = Math.PI / 2 + (r % 2 === 0 ? 0.12 : -0.12);
    wRing.position.y = 0.22 + t * 1.38;
    whirlpoolGroup.add(wRing);
    whirlRings.push({ mesh: wRing, baseY: wRing.position.y, phase: r * 1.25 });
  }

  // Tronco Titânico
  const body = group(titanRoot, 0, 1.65, 0);
  body.scale.setScalar(1.35);

  const torso = group(body, 0, 0.48, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.45),
    new THREE.Vector2(0.34, -0.4),
    new THREE.Vector2(0.31, -0.2),
    new THREE.Vector2(0.4, 0.04),
    new THREE.Vector2(0.55, 0.29),
    new THREE.Vector2(0.48, 0.45),
    new THREE.Vector2(0.23, 0.52),
    new THREE.Vector2(0.01, 0.53),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), abyssSkin, [0, 0, 0], [0, 0, 0], [1.28, 1.04, 0.82]);

  const pecGeo = new THREE.SphereGeometry(0.27, 24, 24);
  sculpt(torso, pecGeo, chitinArmor, [-0.235, 0.23, 0.195], [0.12, -0.22, -0.14], [1.1, 0.9, 0.64]);
  sculpt(torso, pecGeo, chitinArmor, [0.235, 0.23, 0.195], [0.12, 0.22, 0.14], [1.1, 0.9, 0.64]);

  // Veias bioluminescentes
  const bioVeinL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.36, 0.14),
    new THREE.Vector3(-0.22, 0.25, 0.29),
    new THREE.Vector3(-0.08, 0.14, 0.31),
    new THREE.Vector3(-0.15, -0.04, 0.29),
  ]);
  sculpt(torso, new THREE.TubeGeometry(bioVeinL, 16, 0.0095, 6, false), bioTealVein);

  const bioVeinR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.4, 0.36, 0.14),
    new THREE.Vector3(0.22, 0.25, 0.29),
    new THREE.Vector3(0.08, 0.14, 0.31),
    new THREE.Vector3(0.15, -0.04, 0.29),
  ]);
  sculpt(torso, new THREE.TubeGeometry(bioVeinR, 16, 0.0095, 6, false), bioTealVein);

  // Espinhos dorsais
  for (let sp = 0; sp < 5; sp++) {
    const sy = 0.42 - sp * 0.16;
    const len = 0.26 - sp * 0.025;
    sculpt(
      torso,
      new THREE.ConeGeometry(0.042, len, 5),
      sp % 2 === 0 ? coralGlow : chitinArmor,
      [0, sy, -0.28],
      [-1.15, 0, 0],
      [0.65, 1, 1]
    );
  }

  // Tentáculos dorsais gigantes
  const backTentacles: Array<{
    root: THREE.Group;
    segs: Array<{ pivot: THREE.Group; phase: number }>;
  }> = [];

  const tentacleSpecs = [
    { x: -0.38, y: 0.32, z: -0.22, yaw: 0.55, roll: 0.45 },
    { x: 0.38, y: 0.32, z: -0.22, yaw: -0.55, roll: -0.45 },
    { x: -0.46, y: 0.04, z: -0.2, yaw: 0.72, roll: 0.65 },
    { x: 0.46, y: 0.04, z: -0.2, yaw: -0.72, roll: -0.65 },
  ];

  tentacleSpecs.forEach((spec, idx) => {
    const tRoot = group(torso, spec.x, spec.y, spec.z);
    tRoot.rotation.set(0.15, spec.yaw, spec.roll);

    const segs: Array<{ pivot: THREE.Group; phase: number }> = [];
    let parentSeg: THREE.Group = tRoot;
    for (let s = 0; s < 6; s++) {
      const t = s / 5;
      const rad = 0.082 * (1 - t * 0.65);
      const segPivot = group(parentSeg, 0, s === 0 ? 0 : 0.24, s === 0 ? 0 : -0.05);
      sculpt(segPivot, new THREE.CylinderGeometry(rad * 0.82, rad, 0.28, 12), tentacleMat, [0, 0.12, -0.02], [-0.22, 0, 0]);
      if (s < 5) {
        sculpt(segPivot, new THREE.SphereGeometry(rad * 0.42, 8, 8), bioTealVein, [0, 0.12, rad * 0.75]);
      }
      segs.push({ pivot: segPivot, phase: idx * 1.1 + s * 0.55 });
      parentSeg = segPivot;
    }
    backTentacles.push({ root: tRoot, segs });
  });

  // Cabeça
  const head = group(torso, 0, 0.78, 0.04);
  const skullGeo = new THREE.SphereGeometry(0.23, 36, 36);
  sculpt(head, skullGeo, abyssSkin);

  for (const side of [-1, 1]) {
    sculpt(head, new THREE.SphereGeometry(0.026, 14, 14), eyeAbyss, [side * 0.065, 0.03, 0.202], [0, 0, 0], [1.25, 0.65, 0.85]);
    sculpt(head, new THREE.SphereGeometry(0.015, 10, 10), eyeAbyss, [side * 0.115, 0.055, 0.175], [0, 0, 0], [1.1, 0.7, 0.85]);
  }

  const mouthCore = sculpt(head, new THREE.SphereGeometry(0.055, 12, 12), bioTealVein, [0, -0.075, 0.16]);

  const jawPivot = group(head, 0, -0.085, 0.09);
  sculpt(jawPivot, new THREE.BoxGeometry(0.15, 0.055, 0.16), chitinArmor, [0, -0.02, 0.08]);
  for (const side of [-1, 1]) {
    sculpt(jawPivot, new THREE.ConeGeometry(0.016, 0.068, 5), fangIvory, [side * 0.052, 0.025, 0.14], [0.15, 0, side * 0.12]);
  }

  const faceTentacles: Array<{ mesh: THREE.Mesh; side: number; phase: number }> = [];
  for (const side of [-1, 1]) {
    const fTent = sculpt(
      head,
      new THREE.ConeGeometry(0.026, 0.32, 8),
      tentacleMat,
      [side * 0.12, -0.14, 0.17],
      [Math.PI - 0.18, 0, side * 0.22]
    );
    faceTentacles.push({ mesh: fTent, side, phase: side * 0.9 });
  }

  // Coroa de corais
  const coralCrown = group(head, 0, 0.15, 0);
  const crownRing = new THREE.TorusGeometry(0.22, 0.022, 10, 36);
  crownRing.rotateX(Math.PI / 2);
  sculpt(coralCrown, crownRing, atlanteanGold, [0, 0, 0], [0.12, 0, 0], [0.96, 1, 1.06]);
  for (let c = 0; c < 7; c++) {
    const a = ((c - 3) / 3) * Math.PI * 0.65;
    const h = 0.24 - Math.abs(c - 3) * 0.025;
    sculpt(
      coralCrown,
      new THREE.ConeGeometry(0.035, h, 6),
      c % 2 === 0 ? coralGlow : chitinArmor,
      [Math.sin(a) * 0.19, h * 0.5 + 0.02, Math.cos(a) * 0.19],
      [0.15, -a, a * 0.35]
    );
  }

  // Braços & Garra-Pinça
  const armL = group(torso, -0.58, 0.36, 0);
  sculpt(armL, new THREE.SphereGeometry(0.22, 18, 18), chitinArmor, [0, 0, 0], [0, 0, 0.2]);
  sculpt(armL, new THREE.CylinderGeometry(0.14, 0.16, 0.42, 16), abyssSkin, [-0.14, -0.22, 0], [0, 0, 0.35]);

  const forearmLPivot = group(armL, -0.26, -0.42, 0);
  sculpt(forearmLPivot, new THREE.CylinderGeometry(0.18, 0.14, 0.48, 16), chitinArmor, [0, -0.22, 0]);

  const clawRoot = group(forearmLPivot, 0, -0.48, 0);
  const clawUpper = group(clawRoot, 0, 0, 0);
  sculpt(clawUpper, new THREE.ConeGeometry(0.09, 0.54, 8), chitinArmor, [-0.08, -0.26, 0.04], [0.2, 0, 0.28], [1.2, 1, 0.6]);
  const clawLower = group(clawRoot, 0, 0, 0);
  sculpt(clawLower, new THREE.ConeGeometry(0.08, 0.5, 8), chitinArmor, [0.08, -0.24, -0.04], [-0.2, 0, -0.28], [1.1, 1, 0.6]);

  // Braço Direito
  const armR = group(torso, 0.58, 0.36, 0);
  sculpt(armR, new THREE.SphereGeometry(0.22, 18, 18), chitinArmor, [0, 0, 0], [0, 0, -0.2]);
  sculpt(armR, new THREE.CylinderGeometry(0.14, 0.16, 0.42, 16), abyssSkin, [0.14, -0.22, 0], [0, 0, -0.35]);

  const forearmRPivot = group(armR, 0.26, -0.42, 0);
  sculpt(forearmRPivot, new THREE.CylinderGeometry(0.18, 0.14, 0.48, 16), chitinArmor, [0, -0.22, 0]);

  const handR = group(forearmRPivot, 0, -0.48, 0);
  sculpt(handR, new THREE.BoxGeometry(0.24, 0.2, 0.26), abyssSkin);

  const breathBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.85, 8.5, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  breathBeam.rotation.x = -Math.PI / 2;
  breathBeam.position.set(0, 0, 4.3);
  head.add(breathBeam);

  return {
    root: titanRoot,
    body,
    torso,
    head,
    jawPivot,
    mouthCore,
    breathBeam,
    armL,
    armR,
    forearmLPivot,
    forearmRPivot,
    clawUpper,
    clawLower,
    whirlpoolGroup,
    whirlRings,
    backTentacles,
    faceTentacles,
  };
}
