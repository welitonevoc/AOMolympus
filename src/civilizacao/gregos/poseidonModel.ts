import * as THREE from 'three';

export interface PoseidonProceduralTextures {
  skinBump: THREE.CanvasTexture;
  tunicTex: THREE.CanvasTexture;
  stoneTex: THREE.CanvasTexture;
  waterTex: THREE.CanvasTexture;
}

export function createPoseidonProceduralTextures(): PoseidonProceduralTextures {
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

  // 1.2 Saiote / Himation Atlante
  const tunicCanvas = document.createElement('canvas');
  tunicCanvas.width = 512;
  tunicCanvas.height = 256;
  const tCtx = tunicCanvas.getContext('2d');
  if (tCtx) {
    const grad = tCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#083344');
    grad.addColorStop(0.65, '#115e59');
    grad.addColorStop(1, '#042f2e');
    tCtx.fillStyle = grad;
    tCtx.fillRect(0, 0, 512, 256);

    tCtx.strokeStyle = 'rgba(45, 212, 191, 0.16)';
    tCtx.lineWidth = 2;
    for (let y = 16; y < 200; y += 24) {
      for (let x = 0; x < 512; x += 32) {
        tCtx.beginPath();
        tCtx.arc(x + 16, y, 14, 0, Math.PI);
        tCtx.stroke();
      }
    }

    tCtx.fillStyle = '#ca8a04';
    tCtx.fillRect(0, 206, 512, 36);
    tCtx.fillStyle = '#04151f';
    tCtx.fillRect(0, 204, 512, 3);
    tCtx.fillRect(0, 242, 512, 3);
    for (let x = 0; x < 512; x += 32) {
      tCtx.beginPath();
      tCtx.arc(x + 16, 224, 10, 0, Math.PI * 1.65);
      tCtx.strokeStyle = '#04151f';
      tCtx.lineWidth = 3;
      tCtx.stroke();
    }
  }
  const tunicTex = new THREE.CanvasTexture(tunicCanvas);
  tunicTex.wrapS = tunicTex.wrapT = THREE.RepeatWrapping;

  // 1.3 Pedra Atlante Submersa
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = stoneCanvas.height = 256;
  const mCtx = stoneCanvas.getContext('2d');
  if (mCtx) {
    mCtx.fillStyle = '#1e3a44';
    mCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1200; i++) {
      mCtx.fillStyle = i % 2 === 0 ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.25)';
      mCtx.fillRect(Math.random() * 256, Math.random() * 256, 6, 6);
    }
    mCtx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
    mCtx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      mCtx.beginPath();
      let mx = Math.random() * 256, my = 0;
      mCtx.moveTo(mx, my);
      while (my < 256) {
        my += 22;
        mx += (Math.random() - 0.5) * 28;
        mCtx.lineTo(mx, my);
      }
      mCtx.stroke();
    }
  }
  const stoneTex = new THREE.CanvasTexture(stoneCanvas);
  stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping;

  // 1.4 Textura procedural de espuma/caustics
  const foamCanvas = document.createElement('canvas');
  foamCanvas.width = foamCanvas.height = 256;
  const fCtx = foamCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#0284c7';
    fCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const r = 2 + Math.random() * 14;
      fCtx.strokeStyle = `rgba(224, 242, 254, ${0.12 + Math.random() * 0.28})`;
      fCtx.lineWidth = 1.5;
      fCtx.beginPath();
      fCtx.arc(Math.random() * 256, Math.random() * 256, r, 0, Math.PI * 2);
      fCtx.stroke();
    }
  }
  const waterTex = new THREE.CanvasTexture(foamCanvas);
  waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
  waterTex.repeat.set(3, 3);

  return { skinBump, tunicTex, stoneTex, waterTex };
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

export function createPoseidonMaterials(textures: PoseidonProceduralTextures) {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xa9704c,
      roughness: 0.38,
      metalness: 0.1,
      bumpMap: textures.skinBump,
      bumpScale: 0.004
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0x8c5838,
      roughness: 0.42,
      metalness: 0.1,
      bumpMap: textures.skinBump,
      bumpScale: 0.004
    }),
    tattooGlow: new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: new THREE.Color(0x14b8a6),
      emissiveIntensity: 2.2,
      roughness: 0.2
    }),
    hairDarkSea: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.48,
      metalness: 0.15
    }),
    hairTealStreak: new THREE.MeshStandardMaterial({
      color: 0x134e4a,
      emissive: new THREE.Color(0x042f2e),
      emissiveIntensity: 0.35,
      roughness: 0.42,
      metalness: 0.2
    }),
    beardSilverTeal: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.45,
      metalness: 0.15
    }),
    atlanteanBronze: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: new THREE.Color(0x291102),
      emissiveIntensity: 0.25,
      metalness: 0.88,
      roughness: 0.24
    }),
    darkGold: new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      emissive: new THREE.Color(0x3b2200),
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.2
    }),
    blackGold: new THREE.MeshStandardMaterial({
      color: 0x292524,
      emissive: new THREE.Color(0x1c1917),
      metalness: 0.92,
      roughness: 0.22
    }),
    abyssGem: new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: new THREE.Color(0x0d9488),
      emissiveIntensity: 2.6,
      roughness: 0.12,
      metalness: 0.3
    }),
    tunic: new THREE.MeshStandardMaterial({
      map: textures.tunicTex,
      color: 0xffffff,
      roughness: 0.58,
      metalness: 0.08,
      side: THREE.DoubleSide
    }),
    cape: new THREE.MeshStandardMaterial({
      color: 0x062c3b,
      emissive: new THREE.Color(0x021219),
      roughness: 0.5,
      metalness: 0.18,
      side: THREE.DoubleSide
    }),
    eyeEmerald: new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 3.4,
      roughness: 0.08
    }),
    vortexWater: new THREE.MeshStandardMaterial({
      map: textures.waterTex,
      color: 0x0ea5e9,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.55,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.84,
      side: THREE.DoubleSide
    }),
    foamWhite: new THREE.MeshStandardMaterial({
      color: 0xf0f9ff,
      emissive: new THREE.Color(0x7dd3fc),
      emissiveIntensity: 0.45,
      roughness: 0.65,
      transparent: true,
      opacity: 0.9
    })
  };
}

export interface PoseidonMeshHierarchy {
  vessel: THREE.Group;
  vortexGroup: THREE.Group;
  vortexCone: THREE.Mesh;
  swirlRings: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }>;
  baseFoam: THREE.Mesh;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  trident: THREE.Group;
  tridentHead: THREE.Group;
  tridentCore: THREE.Mesh;
  tridentHalo: THREE.Mesh;
  tridentTipAnchor: THREE.Group;
  tridentTipGlow: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  beardBraids: Array<{ group: THREE.Group; side: number; phase: number }>;
  hairStrands: Array<{ mesh: THREE.Mesh; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  cape: THREE.Mesh;
  capeBase: Float32Array;
}

export function buildPoseidon(textures: PoseidonProceduralTextures): PoseidonMeshHierarchy {
  const M = createPoseidonMaterials(textures);
  const vessel = new THREE.Group();
  const vortexGroup = group(vessel, 0, 0, 0);

  const vortexGeo = new THREE.CylinderGeometry(0.46, 0.98, 1.35, 36, 16, true);
  const vPos = vortexGeo.attributes.position;
  for (let i = 0; i < vPos.count; i++) {
    const x = vPos.getX(i), y = vPos.getY(i), z = vPos.getZ(i);
    const normY = (y + 0.675) / 1.35;
    const ang = Math.atan2(z, x);
    const spiral = Math.sin(ang * 4 + normY * 7.5) * 0.075 * (1 - normY * 0.4);
    const r = Math.sqrt(x * x + z * z) + spiral;
    vPos.setXYZ(i, Math.cos(ang) * r, y, Math.sin(ang) * r);
  }
  vortexGeo.computeVertexNormals();
  const vortexCone = new THREE.Mesh(vortexGeo, M.vortexWater);
  vortexCone.position.y = 0.62;
  vortexGroup.add(vortexCone);

  const innerVortex = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.65, 1.25, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  innerVortex.position.y = 0.6;
  vortexGroup.add(innerVortex);

  const baseFoam = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 12, 36), M.foamWhite);
  baseFoam.rotation.x = Math.PI / 2;
  baseFoam.position.y = 0.08;
  vortexGroup.add(baseFoam);

  const swirlRings: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }> = [];
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const rad = 0.88 - t * 0.42;
    const sw = new THREE.Mesh(
      new THREE.TorusGeometry(rad, 0.032, 8, 32),
      new THREE.MeshBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sw.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.14 : -0.14);
    sw.position.y = 0.18 + t * 0.92;
    vortexGroup.add(sw);
    swirlRings.push({ mesh: sw, baseY: sw.position.y, phase: i * 1.4 });
  }

  const body = group(vessel, 0, 1.18, 0);

  const pelvis = group(body, 0, 0.92, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.26, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.15, 0.75, 0.85]);

  const legs: any = {};
  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.18, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.15, 0.106, 0.48, 20), M.skin, [0, -0.23, 0], [0, 0, 0], [1.04, 1, 1.1]);
    const quadGeo = new THREE.SphereGeometry(0.115, 16, 16);
    sculpt(hip, quadGeo, M.skin, [s * 0.022, -0.20, 0.052], [0, 0, 0], [0.95, 1.85, 0.85]);
    sculpt(hip, quadGeo, M.skin, [s * 0.052, -0.23, 0.01], [0, 0, 0], [0.85, 1.75, 0.9]);

    sculpt(hip, new THREE.SphereGeometry(0.094, 16, 16), M.skin, [0, -0.48, 0.015], [0, 0, 0], [0.95, 0.95, 1.02]);

    const knee = group(hip, 0, -0.49, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.095, 0.058, 0.44, 18), M.skin, [0, -0.22, 0], [0, 0, 0], [0.96, 1, 1.03]);
    sculpt(knee, new THREE.SphereGeometry(0.09, 16, 16), M.skin, [0, -0.15, -0.04], [0, 0, 0], [0.97, 1.65, 0.96]);

    sculpt(knee, new THREE.CylinderGeometry(0.092, 0.062, 0.34, 14, 1, false, -0.8, 1.6), M.atlanteanBronze, [0, -0.23, 0.012]);

    const ankle = group(knee, 0, -0.44, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.098, 0.05, 0.22), M.skin, [0, -0.02, 0.04], [0.08, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.108, 0.018, 0.238), M.darkGold, [0, -0.046, 0.04], [0.08, 0, 0]);
    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.28, -0.15, -0.12);
  legs.L.knee.rotation.set(0.36, 0, 0);
  legs.R.hip.rotation.set(0.22, 0.18, 0.14);
  legs.R.knee.rotation.set(0.24, 0, 0);

  const torso = group(body, 0, 1.35, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.27, -0.40),
    new THREE.Vector2(0.24, -0.20),
    new THREE.Vector2(0.30, 0.03),
    new THREE.Vector2(0.41, 0.27),
    new THREE.Vector2(0.36, 0.43),
    new THREE.Vector2(0.16, 0.50),
    new THREE.Vector2(0.01, 0.51)
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.22, 1.0, 0.75]);

  const pecGeo = new THREE.SphereGeometry(0.225, 24, 24);
  sculpt(torso, pecGeo, M.skin, [-0.195, 0.23, 0.17], [0.12, -0.22, -0.14], [1.07, 0.86, 0.60]);
  sculpt(torso, pecGeo, M.skin, [0.195, 0.23, 0.17], [0.12, 0.22, 0.14], [1.07, 0.86, 0.60]);

  const chestRuneCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.34, 0.34, 0.10),
    new THREE.Vector3(-0.24, 0.28, 0.24),
    new THREE.Vector3(-0.14, 0.21, 0.27),
    new THREE.Vector3(-0.18, 0.12, 0.25)
  ]);
  sculpt(torso, new THREE.TubeGeometry(chestRuneCurve, 16, 0.008, 6, false), M.tattooGlow);

  const shoulderRuneCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.38, 0.36, -0.02),
    new THREE.Vector3(-0.32, 0.25, 0.16),
    new THREE.Vector3(-0.25, 0.16, 0.22)
  ]);
  sculpt(torso, new THREE.TubeGeometry(shoulderRuneCurve, 12, 0.007, 6, false), M.tattooGlow);

  const abGeo = new THREE.SphereGeometry(0.088, 16, 16);
  [
    { y: 0.04, sx: 1.0, sy: 0.75, z: 0.218 },
    { y: -0.075, sx: 0.96, sy: 0.78, z: 0.214 },
    { y: -0.195, sx: 0.88, sy: 0.84, z: 0.204 }
  ].forEach(lvl => {
    sculpt(torso, abGeo, M.skin, [-0.074, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.48]);
    sculpt(torso, abGeo, M.skin, [0.074, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.48]);
  });

  const obliqueGeo = new THREE.CapsuleGeometry(0.082, 0.23, 10, 16);
  sculpt(torso, obliqueGeo, M.skin, [-0.255, -0.11, 0.088], [0.1, 0, -0.18], [0.86, 1, 0.86]);
  sculpt(torso, obliqueGeo, M.skin, [0.255, -0.11, 0.088], [0.1, 0, 0.18], [0.86, 1, 0.86]);

  const latGeo = new THREE.SphereGeometry(0.245, 20, 20);
  sculpt(torso, latGeo, M.skin, [-0.22, 0.17, -0.12], [0, 0, -0.25], [1.02, 1.35, 0.66]);
  sculpt(torso, latGeo, M.skin, [0.22, 0.17, -0.12], [0, 0, 0.25], [1.02, 1.35, 0.66]);

  const trapGeo = new THREE.SphereGeometry(0.225, 18, 18);
  sculpt(torso, trapGeo, M.skin, [-0.19, 0.42, -0.045], [0, 0, 0.42], [1.12, 0.66, 0.76]);
  sculpt(torso, trapGeo, M.skin, [0.19, 0.42, -0.045], [0, 0, -0.42], [1.12, 0.66, 0.76]);

  sculpt(torso, new THREE.CylinderGeometry(0.128, 0.162, 0.26, 20), M.skin, [0, 0.53, -0.01], [0.08, 0, 0], [1, 1, 1.06]);

  const head = group(torso, 0, 0.75, 0.038);

  const skullGeo = new THREE.SphereGeometry(0.21, 36, 36);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.24;
    x *= 0.88;
    if (y < 0.03 && y > -0.10 && z > 0) { x *= 1.12; z *= 1.08; }
    if (y <= -0.09 && z > -0.02) { x *= 0.90; z *= 1.12; }
    if (z < -0.12) z *= 0.92;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  const cheekGeo = new THREE.BoxGeometry(0.065, 0.048, 0.065);
  sculpt(head, cheekGeo, M.skin, [-0.078, -0.012, 0.158], [0.15, -0.45, -0.2]);
  sculpt(head, cheekGeo, M.skin, [0.078, -0.012, 0.158], [0.15, 0.45, 0.2]);

  const noseUpper = new THREE.BoxGeometry(0.028, 0.065, 0.056);
  sculpt(head, noseUpper, M.skin, [0, 0.018, 0.198], [-0.22, 0, 0]);
  const noseLower = new THREE.BoxGeometry(0.026, 0.052, 0.054);
  sculpt(head, noseLower, M.skin, [0, -0.026, 0.206], [0.06, 0, 0]);
  sculpt(head, new THREE.ConeGeometry(0.02, 0.038, 10), M.skin, [0, -0.046, 0.218], [1.45, 0, 0]);

  const browRidge = new THREE.CapsuleGeometry(0.017, 0.072, 8, 12);
  sculpt(head, browRidge, M.skinShade, [-0.052, 0.046, 0.186], [0.12, 0.25, 1.24]);
  sculpt(head, browRidge, M.skinShade, [0.052, 0.046, 0.186], [0.12, -0.25, -1.24]);

  const eyebrow = new THREE.CapsuleGeometry(0.014, 0.072, 8, 12);
  sculpt(head, eyebrow, M.hairDarkSea, [-0.052, 0.054, 0.196], [0.12, 0.25, 1.20], [1.1, 1, 0.85]);
  sculpt(head, eyebrow, M.hairDarkSea, [0.052, 0.054, 0.196], [0.12, -0.25, -1.20], [1.1, 1, 0.85]);

  sculpt(head, new THREE.BoxGeometry(0.008, 0.034, 0.015), M.skinShade, [-0.01, 0.048, 0.198], [0, 0, 0.08]);
  sculpt(head, new THREE.BoxGeometry(0.008, 0.034, 0.015), M.skinShade, [0, 0.01, 0.198], [0, 0, -0.08]);

  const eyeGeo = new THREE.SphereGeometry(0.02, 16, 16);
  sculpt(head, eyeGeo, M.eyeEmerald, [-0.052, 0.024, 0.182], [0, 0, 0], [1.18, 0.62, 0.8]);
  sculpt(head, eyeGeo, M.eyeEmerald, [0.052, 0.024, 0.182], [0, 0, 0], [1.18, 0.62, 0.8]);

  const eyelidGeo = new THREE.BoxGeometry(0.05, 0.014, 0.03);
  sculpt(head, eyelidGeo, M.skinShade, [-0.052, 0.033, 0.191], [0.18, 0.22, -0.24]);
  sculpt(head, eyelidGeo, M.skinShade, [0.052, 0.033, 0.191], [0.18, -0.22, 0.24]);

  const stacheCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.01, -0.072, 0.205),
    new THREE.Vector3(-0.055, -0.088, 0.198),
    new THREE.Vector3(-0.082, -0.145, 0.172)
  ]);
  const stacheCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.01, -0.072, 0.205),
    new THREE.Vector3(0.055, -0.088, 0.198),
    new THREE.Vector3(0.082, -0.145, 0.172)
  ]);
  sculpt(head, new THREE.TubeGeometry(stacheCurveL, 12, 0.018, 8, false), M.hairDarkSea);
  sculpt(head, new THREE.TubeGeometry(stacheCurveR, 12, 0.018, 8, false), M.hairDarkSea);

  const beardBraids: Array<{ group: THREE.Group; side: number; phase: number }> = [];
  for (const side of [-1, 1]) {
    const braidGroup = group(head, side * 0.044, -0.11, 0.175);

    const braidGeo = new THREE.ConeGeometry(0.046, 0.34, 14);
    braidGeo.rotateX(Math.PI);
    sculpt(braidGroup, braidGeo, side === -1 ? M.hairDarkSea : M.beardSilverTeal, [0, -0.15, 0.01], [-0.12, 0, side * 0.09], [1.05, 1, 0.85]);
    sculpt(braidGroup, braidGeo, side === -1 ? M.beardSilverTeal : M.hairDarkSea, [side * 0.012, -0.14, -0.008], [-0.10, 0.2, side * 0.06], [0.85, 0.95, 0.8]);

    const claspGeo = new THREE.CylinderGeometry(0.025, 0.022, 0.036, 14);
    sculpt(braidGroup, claspGeo, M.darkGold, [side * 0.018, -0.22, 0.028], [-0.12, 0, side * 0.09]);
    sculpt(braidGroup, new THREE.TorusGeometry(0.024, 0.005, 8, 16), M.abyssGem, [side * 0.018, -0.22, 0.028], [Math.PI / 2 - 0.12, 0, 0]);

    beardBraids.push({ group: braidGroup, side, phase: side * 0.8 });
  }

  sculpt(head, new THREE.BoxGeometry(0.032, 0.16, 0.075), M.hairDarkSea, [-0.092, -0.05, 0.105], [0, -0.35, -0.12]);
  sculpt(head, new THREE.BoxGeometry(0.032, 0.16, 0.075), M.hairDarkSea, [0.092, -0.05, 0.105], [0, 0.35, 0.12]);

  sculpt(head, new THREE.SphereGeometry(0.215, 24, 24), M.hairDarkSea, [0, 0.055, -0.02], [-0.1, 0, 0], [0.98, 1.04, 1.08]);
  const hairStrands: Array<{ mesh: THREE.Mesh; phase: number }> = [];
  for (let i = 0; i < 26; i++) {
    const angle = (i / 26) * Math.PI * 1.65 + Math.PI * 0.68;
    const r = 0.185;
    const sx = Math.sin(angle) * r;
    const sz = Math.cos(angle) * r - 0.01;
    const sy = 0.09 + Math.cos(angle * 2) * 0.02;
    const len = 0.54 + (i % 4) * 0.08;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const flare = 1 + t * 0.42;
      pts.push(new THREE.Vector3(
        sx * flare + Math.sin(t * Math.PI * 2.6 + i) * 0.038,
        sy - t * len,
        sz * flare - t * 0.16
      ));
    }
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.034 * (1 - 0.15 * (i % 2)), 8, false);
    const strand = sculpt(head, tube, i % 3 === 0 ? M.hairTealStreak : M.hairDarkSea);
    hairStrands.push({ mesh: strand, phase: i * 0.42 });
  }

  const helm = group(head, 0, 0.115, 0.01);
  helm.rotation.x = 0.12;

  const browBand = new THREE.CylinderGeometry(0.205, 0.198, 0.058, 32, 1, true, -Math.PI * 0.65, Math.PI * 1.3);
  sculpt(helm, browBand, M.atlanteanBronze, [0, 0, 0], [0, 0, 0], [0.95, 1, 1.06]);

  sculpt(helm, new THREE.ConeGeometry(0.042, 0.13, 6), M.darkGold, [0, 0.055, 0.212], [-0.18, 0, 0], [1, 1, 0.45]);
  sculpt(helm, new THREE.OctahedronGeometry(0.025, 0), M.abyssGem, [0, 0.005, 0.218], [0, 0, 0], [0.8, 1.4, 0.6]);

  for (const side of [-1, 1]) {
    const finGroup = group(helm, side * 0.195, 0.02, 0.02);
    finGroup.rotation.set(-0.25, side * 0.35, side * -0.28);
    for (let f = 0; f < 4; f++) {
      sculpt(
        finGroup,
        new THREE.ConeGeometry(0.022, 0.14 - f * 0.018, 5),
        f % 2 === 0 ? M.darkGold : M.atlanteanBronze,
        [0, 0.03 + f * 0.018, -0.03 - f * 0.035],
        [-1.15, 0, 0],
        [0.45, 1, 1]
      );
    }
  }

  function createMuscularArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.45, 0.34, -0.01);

    sculpt(arm, new THREE.SphereGeometry(0.148, 20, 20), M.skin, [0, 0, 0], [0, 0, s * -0.25], [1.06, 1.16, 1.06]);
    sculpt(arm, new THREE.SphereGeometry(0.108, 16, 16), M.skin, [s * 0.03, -0.04, 0.06], [0.2, 0, 0], [0.95, 1.2, 0.9]);

    sculpt(arm, new THREE.CapsuleGeometry(0.096, 0.27, 12, 18), M.skin, [s * 0.025, -0.18, 0], [0, 0, s * 0.08]);
    sculpt(arm, new THREE.SphereGeometry(0.09, 16, 16), M.skin, [s * 0.018, -0.17, 0.046], [0, 0, s * 0.08], [0.92, 1.45, 0.92]);
    sculpt(arm, new THREE.SphereGeometry(0.088, 16, 16), M.skin, [s * 0.052, -0.18, -0.04], [0, 0, s * 0.08], [0.95, 1.4, 0.9]);

    const elbow = group(arm, s * 0.045, -0.36, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.09, 0.058, 0.33, 18), M.skin, [0, -0.155, 0], [0, 0, 0], [1.05, 1, 0.95]);
    sculpt(elbow, new THREE.SphereGeometry(0.074, 14, 14), M.skin, [s * 0.02, -0.085, 0.022], [0, 0, 0], [0.95, 1.5, 0.95]);

    const bracer = group(elbow, 0, -0.25, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.072, 0.063, 0.11, 24, 1, true), M.atlanteanBronze, [0, 0, 0], [0, 0, 0], [1.06, 1, 0.97]);
    const bRing = new THREE.TorusGeometry(0.069, 0.007, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.darkGold, [0, 0.05, 0], [0, 0, 0], [1.06, 1, 0.97]);
    sculpt(bracer, bRing, M.darkGold, [0, -0.05, 0], [0, 0, 0], [1.06, 1, 0.97]);

    const hand = group(elbow, 0, -0.34, 0);
    sculpt(hand, new THREE.BoxGeometry(0.076, 0.085, 0.038), M.skin, [0, -0.02, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.011, 0.04, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.018;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.066, 0.02], [1.25, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.042, -0.032, 0.024], [0.6, 0, -s * 0.65], [1.1, 0.9, 1.1]);

    return { arm, elbow, hand };
  }

  const rightArm = createMuscularArm(true);
  const leftArm = createMuscularArm(false);

  const pauldron = group(rightArm.arm, 0.03, 0.04, 0);
  pauldron.rotation.set(0.06, -0.1, -0.32);
  for (let layer = 0; layer < 3; layer++) {
    const rad = 0.185 - layer * 0.015;
    sculpt(
      pauldron,
      new THREE.SphereGeometry(rad, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.48),
      layer === 1 ? M.darkGold : M.atlanteanBronze,
      [0, 0.04 - layer * 0.045, 0],
      [0, 0, 0],
      [1.12, 0.72, 1.16]
    );
  }
  sculpt(pauldron, new THREE.OctahedronGeometry(0.034, 0), M.abyssGem, [0.06, 0.08, 0.11]);

  const trident = new THREE.Group();
  rightArm.hand.add(trident);
  trident.position.set(0, -0.04, 0.035);

  sculpt(trident, new THREE.CylinderGeometry(0.026, 0.03, 2.95, 18), M.blackGold, [0, 0.18, 0]);

  const gripSpiralPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const ang = t * Math.PI * 10;
    const y = -0.55 + t * 1.65;
    gripSpiralPts.push(new THREE.Vector3(Math.cos(ang) * 0.033, y, Math.sin(ang) * 0.033));
  }
  sculpt(trident, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gripSpiralPts), 48, 0.007, 6, false), M.darkGold);

  sculpt(trident, new THREE.CylinderGeometry(0.042, 0.028, 0.14, 14), M.atlanteanBronze, [0, -1.32, 0]);
  sculpt(trident, new THREE.ConeGeometry(0.048, 0.26, 10), M.darkGold, [0, -1.52, 0], [Math.PI, 0, 0], [1, 1, 0.55]);

  const tridentHead = group(trident, 0, 1.66, 0);

  sculpt(tridentHead, new THREE.CylinderGeometry(0.068, 0.034, 0.18, 16), M.atlanteanBronze, [0, 0.05, 0]);

  const mainArc = new THREE.TorusGeometry(0.31, 0.028, 12, 32, Math.PI);
  mainArc.rotateZ(Math.PI);
  sculpt(tridentHead, mainArc, M.atlanteanBronze, [0, 0.28, 0], [0, 0, 0], [1.05, 0.78, 0.7]);

  const innerArc = new THREE.TorusGeometry(0.24, 0.018, 10, 28, Math.PI);
  innerArc.rotateZ(Math.PI);
  sculpt(tridentHead, innerArc, M.darkGold, [0, 0.25, 0], [0, 0, 0], [1.05, 0.75, 0.7]);

  const tridentCore = sculpt(tridentHead, new THREE.OctahedronGeometry(0.078, 1), M.abyssGem, [0, 0.16, 0], [0, 0, 0], [0.85, 1.35, 0.75]);
  const tridentHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.01, 8, 28),
    new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  tridentHalo.position.set(0, 0.16, 0);
  tridentHead.add(tridentHalo);

  sculpt(tridentHead, new THREE.CylinderGeometry(0.016, 0.038, 0.56, 12), M.darkGold, [0, 0.38, 0], [0, 0, 0], [1, 1, 0.5]);
  sculpt(tridentHead, new THREE.ConeGeometry(0.064, 0.34, 8), M.darkGold, [0, 0.80, 0], [0, 0, 0], [1, 1, 0.35]);
  sculpt(tridentHead, new THREE.BoxGeometry(0.012, 0.38, 0.032), M.tattooGlow, [0, 0.45, 0]);

  for (const side of [-1, 1]) {
    const prongGroup = group(tridentHead, side * 0.31, 0.28, 0);

    const prongCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.04, 0.22, 0),
      new THREE.Vector3(side * 0.015, 0.46, 0)
    ]);
    sculpt(prongGroup, new THREE.TubeGeometry(prongCurve, 14, 0.022, 8, false), M.atlanteanBronze);

    sculpt(prongGroup, new THREE.ConeGeometry(0.048, 0.26, 8), M.darkGold, [side * 0.01, 0.56, 0], [0, 0, side * 0.08], [1, 1, 0.35]);
    sculpt(prongGroup, new THREE.ConeGeometry(0.026, 0.12, 6), M.atlanteanBronze, [-side * 0.025, 0.42, 0], [0, 0, side * 2.45], [0.8, 1, 0.4]);
  }

  const tridentTipAnchor = group(tridentHead, 0, 0.96, 0);
  const tridentTipGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 14, 12),
    new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    })
  );
  tridentTipAnchor.add(tridentTipGlow);

  const garments = group(torso, 0, 0, 0);

  const beltGeo = new THREE.TorusGeometry(0.28, 0.028, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.atlanteanBronze, [0, -0.35, 0.01], [0.06, 0, -0.04], [1.07, 1, 0.83]);

  const buckleGroup = group(garments, 0, -0.35, 0.235);
  sculpt(buckleGroup, new THREE.CylinderGeometry(0.068, 0.068, 0.024, 20), M.darkGold, [0, 0, 0], [Math.PI / 2, 0, 0]);
  sculpt(buckleGroup, new THREE.OctahedronGeometry(0.034, 0), M.abyssGem, [0, 0, 0.015]);

  const skirtGeo = new THREE.CylinderGeometry(0.285, 0.56, 0.86, 48, 20, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = (0.43 - y) / 0.86;
    const pleat = Math.sin(angle * 10) * 0.032 * (0.25 + normY * 0.95);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.06;
    z = Math.sin(angle) * r * 0.84 - normY * 0.08;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.tunic, [0, -0.77, 0], [0.04, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.36, 1.88, 24, 32);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = (0.94 - y) / 1.88;
    const archZ = -0.18 - Math.cos((x / 0.68) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.52;
    const fx = x * (0.65 + normY * 0.74);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.cape, [0, -0.45, -0.04]);

  return {
    vessel,
    vortexGroup,
    vortexCone,
    swirlRings,
    baseFoam,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    trident,
    tridentHead,
    tridentCore,
    tridentHalo,
    tridentTipAnchor,
    tridentTipGlow,
    beardBraids,
    hairStrands,
    skirtMesh,
    skirtBase,
    cape,
    capeBase
  };
}

export function createPoseidonEnvironment(scene: THREE.Scene | THREE.Group, textures: PoseidonProceduralTextures) {
  const oceanGeo = new THREE.PlaneGeometry(34, 34, 96, 96);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanPos = oceanGeo.attributes.position;
  const oceanColors = new Float32Array(oceanPos.count * 3);
  oceanGeo.setAttribute('color', new THREE.BufferAttribute(oceanColors, 3));

  const oceanMat = new THREE.MeshStandardMaterial({
    map: textures.waterTex,
    vertexColors: true,
    roughness: 0.22,
    metalness: 0.35,
    flatShading: false
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.receiveShadow = true;
  scene.add(oceanMesh);

  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.stoneTex,
    color: 0x64748b,
    roughness: 0.65,
    metalness: 0.1
  });
  const bronzeRingMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.85,
    roughness: 0.28
  });
  const runeRingMat = new THREE.MeshStandardMaterial({
    color: 0x2dd4bf,
    emissive: new THREE.Color(0x0d9488),
    emissiveIntensity: 1.5
  });

  const pillars: Array<{ group: THREE.Group; baseY: number; phase: number }> = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const dist = 5.6 + (i % 2) * 0.5;
    const pGroup = group(scene, Math.cos(a) * dist, -0.4, Math.sin(a) * dist);
    pGroup.rotation.set((i % 3 - 1) * 0.06, a, ((i + 1) % 3 - 1) * 0.05);

    const height = 2.6 + (i % 3) * 0.55;
    sculpt(pGroup, new THREE.CylinderGeometry(0.28, 0.34, height, 16), stoneMat, [0, height * 0.5, 0]);
    sculpt(pGroup, new THREE.TorusGeometry(0.32, 0.03, 8, 24), bronzeRingMat, [0, height * 0.45, 0], [Math.PI / 2, 0, 0]);
    sculpt(pGroup, new THREE.TorusGeometry(0.30, 0.015, 8, 24), runeRingMat, [0, height * 0.72, 0], [Math.PI / 2, 0, 0]);
    sculpt(pGroup, new THREE.BoxGeometry(0.72, 0.18, 0.72), stoneMat, [0, height + 0.08, 0]);

    pillars.push({ group: pGroup, baseY: -0.4, phase: i * 0.9 });
  }

  return { oceanMesh, oceanGeo, oceanPos, pillars };
}
