import * as THREE from 'three';

export interface AtenaTextures {
  skinBump: THREE.CanvasTexture;
  chitonTex: THREE.CanvasTexture;
  shieldTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createAtenaTextures(): AtenaTextures {
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) {
      const v = 124 + Math.floor(Math.random() * 10);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  const chitonCanvas = document.createElement('canvas');
  chitonCanvas.width = 512;
  chitonCanvas.height = 256;
  const cCtx = chitonCanvas.getContext('2d');
  if (cCtx) {
    const grad = cCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.7, '#fef3c7');
    grad.addColorStop(1, '#fde68a');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 0, 512, 256);

    cCtx.fillStyle = 'rgba(180, 140, 80, 0.14)';
    for (let x = 0; x < 512; x += 8) {
      cCtx.fillRect(x, 0, 3, 256);
    }

    cCtx.fillStyle = '#1e3a8a';
    cCtx.fillRect(0, 198, 512, 42);
    cCtx.fillStyle = '#eab308';
    cCtx.fillRect(0, 194, 512, 5);
    cCtx.fillRect(0, 239, 512, 5);

    cCtx.strokeStyle = '#facc15';
    cCtx.lineWidth = 3;
    for (let x = 0; x < 512; x += 32) {
      cCtx.beginPath();
      cCtx.moveTo(x + 4, 230);
      cCtx.lineTo(x + 4, 206);
      cCtx.lineTo(x + 24, 206);
      cCtx.lineTo(x + 24, 224);
      cCtx.lineTo(x + 12, 224);
      cCtx.lineTo(x + 12, 214);
      cCtx.lineTo(x + 18, 214);
      cCtx.stroke();
    }
  }
  const chitonTex = new THREE.CanvasTexture(chitonCanvas);
  chitonTex.wrapS = chitonTex.wrapT = THREE.RepeatWrapping;

  const shieldCanvas = document.createElement('canvas');
  shieldCanvas.width = shieldCanvas.height = 512;
  const shCtx = shieldCanvas.getContext('2d');
  if (shCtx) {
    const radGrad = shCtx.createRadialGradient(256, 256, 20, 256, 256, 250);
    radGrad.addColorStop(0, '#fef08a');
    radGrad.addColorStop(0.35, '#eab308');
    radGrad.addColorStop(0.75, '#b45309');
    radGrad.addColorStop(0.92, '#1e3a8a');
    radGrad.addColorStop(1, '#facc15');
    shCtx.fillStyle = radGrad;
    shCtx.fillRect(0, 0, 512, 512);

    shCtx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
    shCtx.lineWidth = 2.5;
    for (let r = 65; r <= 215; r += 24) {
      const count = Math.floor((2 * Math.PI * r) / 26);
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const sx = 256 + Math.cos(a) * r;
        const sy = 256 + Math.sin(a) * r;
        shCtx.beginPath();
        shCtx.arc(sx, sy, 14, a - 1.1, a + 1.1);
        shCtx.stroke();
      }
    }

    shCtx.strokeStyle = '#fde047';
    shCtx.lineWidth = 4;
    shCtx.beginPath();
    shCtx.arc(256, 256, 232, 0, Math.PI * 2);
    shCtx.stroke();
  }
  const shieldTex = new THREE.CanvasTexture(shieldCanvas);

  return { skinBump, chitonTex, shieldTex };
}

let cachedAtenaTextures: AtenaTextures | null = null;
export function getCachedAtenaTextures(): AtenaTextures {
  if (!cachedAtenaTextures) {
    cachedAtenaTextures = createAtenaTextures();
  }
  return cachedAtenaTextures;
}

export interface AtenaMaterials {
  skin: THREE.MeshStandardMaterial;
  skinWarm: THREE.MeshStandardMaterial;
  lipRose: THREE.MeshStandardMaterial;
  hairPinkPetal: THREE.MeshStandardMaterial;
  hairPinkHighlight: THREE.MeshStandardMaterial;
  goldPolished: THREE.MeshStandardMaterial;
  bronzePolished: THREE.MeshStandardMaterial;
  sapphireGem: THREE.MeshStandardMaterial;
  divineLight: THREE.MeshStandardMaterial;
  chiton: THREE.MeshStandardMaterial;
  royalCloak: THREE.MeshStandardMaterial;
  plumeIvory: THREE.MeshStandardMaterial;
  plumeBlue: THREE.MeshStandardMaterial;
  shieldFace: THREE.MeshStandardMaterial;
  eyeWhite: THREE.MeshStandardMaterial;
  eyeEmerald: THREE.MeshStandardMaterial;
  eyePupil: THREE.MeshStandardMaterial;
  owlIvory: THREE.MeshStandardMaterial;
  owlGold: THREE.MeshStandardMaterial;
}

function createMaterials(textures: AtenaTextures): AtenaMaterials {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xe2b08d,
      roughness: 0.36,
      metalness: 0.05,
      bumpMap: textures.skinBump,
      bumpScale: 0.0025,
    }),
    skinWarm: new THREE.MeshStandardMaterial({
      color: 0xd19874,
      roughness: 0.38,
      metalness: 0.05,
      bumpMap: textures.skinBump,
      bumpScale: 0.0025,
    }),
    lipRose: new THREE.MeshStandardMaterial({
      color: 0xe17076,
      roughness: 0.30,
      metalness: 0.04,
    }),
    hairPinkPetal: new THREE.MeshStandardMaterial({
      color: 0xf48fb1,
      emissive: new THREE.Color(0x3b0d22),
      emissiveIntensity: 0.18,
      roughness: 0.34,
      metalness: 0.14,
    }),
    hairPinkHighlight: new THREE.MeshStandardMaterial({
      color: 0xf8bbd0,
      emissive: new THREE.Color(0x4a122c),
      emissiveIntensity: 0.2,
      roughness: 0.30,
      metalness: 0.18,
    }),
    goldPolished: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0x422006),
      emissiveIntensity: 0.22,
      metalness: 0.92,
      roughness: 0.18,
    }),
    bronzePolished: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: new THREE.Color(0x291202),
      emissiveIntensity: 0.2,
      metalness: 0.88,
      roughness: 0.24,
    }),
    sapphireGem: new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: new THREE.Color(0x1d4ed8),
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.3,
    }),
    divineLight: new THREE.MeshStandardMaterial({
      color: 0xfef9c3,
      emissive: new THREE.Color(0xfacc15),
      emissiveIntensity: 1.55,
      roughness: 0.1,
    }),
    chiton: new THREE.MeshStandardMaterial({
      map: textures.chitonTex,
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
    royalCloak: new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: new THREE.Color(0x091536),
      emissiveIntensity: 0.35,
      roughness: 0.48,
      metalness: 0.15,
      side: THREE.DoubleSide,
    }),
    plumeIvory: new THREE.MeshStandardMaterial({
      color: 0xfefce8,
      roughness: 0.55,
      metalness: 0.05,
    }),
    plumeBlue: new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.52,
      metalness: 0.1,
    }),
    shieldFace: new THREE.MeshStandardMaterial({
      map: textures.shieldTex,
      metalness: 0.82,
      roughness: 0.24,
      side: THREE.DoubleSide,
    }),
    eyeWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xe2e8f0),
      emissiveIntensity: 0.25,
      roughness: 0.1,
    }),
    eyeEmerald: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: new THREE.Color(0x34d399),
      emissiveIntensity: 2.2,
      roughness: 0.08,
    }),
    eyePupil: new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.1,
    }),
    owlIvory: new THREE.MeshStandardMaterial({
      color: 0xf5f5f4,
      roughness: 0.55,
      metalness: 0.08,
    }),
    owlGold: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.45,
      metalness: 0.35,
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

export interface AtenaParts {
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
  spear: THREE.Group;
  aegisShield: THREE.Group;
  hairStrands: Array<{ mesh: THREE.Mesh; baseRotZ: number; phase: number }>;
  crestSegments: Array<{ mesh: THREE.Mesh; baseX: number; phase: number }>;
  owlGroup: THREE.Group;
  owlHead: THREE.Group;
  owlWings: Array<{ wing: THREE.Group; s: number }>;
  cape: THREE.Mesh;
  capeBase: Float32Array;
}

export function buildAthena(textures: AtenaTextures): AtenaParts {
  const M = createMaterials(textures);

  const root = new THREE.Group();
  const body = group(root, 0, 1.08, 0);

  // A. Pelve e Pernas
  const pelvis = group(body, 0, 0.90, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.225, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.08, 0.78, 0.82]);

  const buildLeg = (side: 'L' | 'R') => {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.135, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.128, 0.088, 0.52, 20), M.skin, [0, -0.25, 0], [0, 0, 0], [1.0, 1, 1.06]);
    sculpt(hip, new THREE.SphereGeometry(0.098, 16, 16), M.skin, [s * 0.015, -0.21, 0.042], [0, 0, 0], [0.92, 1.8, 0.85]);

    sculpt(hip, new THREE.SphereGeometry(0.078, 16, 16), M.skin, [0, -0.52, 0.014]);

    const knee = group(hip, 0, -0.53, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.078, 0.048, 0.48, 18), M.skin, [0, -0.24, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.074, 16, 16), M.skin, [0, -0.16, -0.032], [0, 0, 0], [0.95, 1.65, 0.95]);

    sculpt(knee, new THREE.CylinderGeometry(0.078, 0.052, 0.36, 16, 1, false, -0.85, 1.7), M.goldPolished, [0, -0.24, 0.008]);
    sculpt(knee, new THREE.ConeGeometry(0.042, 0.09, 6), M.goldPolished, [0, -0.04, 0.072], [0.15, 0, 0], [1, 1, 0.4]);

    const ankle = group(knee, 0, -0.48, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.082, 0.044, 0.20), M.skin, [0, -0.02, 0.035], [0.18, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.088, 0.014, 0.21), M.goldPolished, [0, -0.042, 0.035], [0.18, 0, 0]);

    const strap = new THREE.TorusGeometry(0.054, 0.005, 8, 20);
    strap.rotateX(Math.PI / 2);
    sculpt(ankle, strap, M.goldPolished, [0, 0.02, -0.02], [0.1, 0, 0]);
    sculpt(ankle, strap, M.goldPolished, [0, 0.06, -0.02], [0.1, 0, 0]);

    return { hip, knee, ankle };
  };

  const legs: AtenaParts['legs'] = {
    L: buildLeg('L'),
    R: buildLeg('R'),
  };

  legs.L.hip.rotation.set(-0.22, -0.08, -0.04);
  legs.L.knee.rotation.set(0.28, 0, 0);
  legs.R.hip.rotation.set(0.16, 0.08, 0.04);
  legs.R.knee.rotation.set(0.18, 0, 0);

  // B. Tronco
  const torso = group(body, 0, 1.34, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.44),
    new THREE.Vector2(0.225, -0.40),
    new THREE.Vector2(0.175, -0.18),
    new THREE.Vector2(0.215, 0.04),
    new THREE.Vector2(0.285, 0.26),
    new THREE.Vector2(0.255, 0.41),
    new THREE.Vector2(0.115, 0.48),
    new THREE.Vector2(0.01, 0.49),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.14, 1.02, 0.72]);

  const cuirassPts = [
    new THREE.Vector2(0.01, -0.34),
    new THREE.Vector2(0.195, -0.30),
    new THREE.Vector2(0.182, -0.14),
    new THREE.Vector2(0.225, 0.06),
    new THREE.Vector2(0.292, 0.26),
    new THREE.Vector2(0.245, 0.36),
    new THREE.Vector2(0.145, 0.38),
    new THREE.Vector2(0.01, 0.38),
  ];
  sculpt(torso, new THREE.LatheGeometry(cuirassPts, 36), M.goldPolished, [0, 0.02, 0], [0, 0, 0], [1.15, 1.0, 0.76]);

  const bustArmorGeo = new THREE.SphereGeometry(0.135, 22, 22);
  sculpt(torso, bustArmorGeo, M.goldPolished, [-0.115, 0.21, 0.135], [0.1, -0.2, 0], [0.95, 0.92, 0.78]);
  sculpt(torso, bustArmorGeo, M.goldPolished, [0.115, 0.21, 0.135], [0.1, 0.2, 0], [0.95, 0.92, 0.78]);

  const gorgonBadge = group(torso, 0, 0.16, 0.225);
  sculpt(gorgonBadge, new THREE.CylinderGeometry(0.062, 0.062, 0.02, 24), M.bronzePolished, [0, 0, 0], [Math.PI / 2, 0, 0]);
  sculpt(gorgonBadge, new THREE.TorusGeometry(0.062, 0.008, 8, 24), M.goldPolished);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sculpt(
      gorgonBadge,
      new THREE.ConeGeometry(0.012, 0.042, 6),
      M.goldPolished,
      [Math.cos(a) * 0.068, Math.sin(a) * 0.068, 0.005],
      [0, 0, a - Math.PI / 2]
    );
  }
  sculpt(gorgonBadge, new THREE.OctahedronGeometry(0.024, 0), M.sapphireGem, [0, 0, 0.014]);

  const collar = new THREE.TorusGeometry(0.165, 0.018, 10, 32);
  collar.rotateX(Math.PI / 2);
  sculpt(torso, collar, M.goldPolished, [0, 0.40, 0.01], [0.18, 0, 0], [1.15, 1, 0.92]);

  sculpt(torso, new THREE.CylinderGeometry(0.088, 0.112, 0.25, 20), M.skin, [0, 0.51, -0.005], [0.06, 0, 0]);

  // C. Cabeça e Rosto
  const head = group(torso, 0, 0.72, 0.032);

  const skullGeo = new THREE.SphereGeometry(0.182, 40, 40);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.15;
    x *= 0.88;
    if (y < 0.02 && y > -0.06 && z > 0) {
      x *= 1.03;
      z *= 1.04;
    }
    if (y <= -0.06 && z > -0.02) {
      const chinTaper = Math.max(0.55, 1.0 - ((-0.06 - y) / 0.15) * 0.42);
      x *= chinTaper;
      z *= 1.02;
    }
    if (z < -0.10) z *= 0.94;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skin);

  const cheekGeo = new THREE.SphereGeometry(0.042, 16, 16);
  sculpt(head, cheekGeo, M.skin, [-0.062, -0.016, 0.142], [0, -0.3, 0], [1.08, 0.82, 0.62]);
  sculpt(head, cheekGeo, M.skin, [0.062, -0.016, 0.142], [0, 0.3, 0], [1.08, 0.82, 0.62]);

  sculpt(head, new THREE.BoxGeometry(0.018, 0.068, 0.036), M.skin, [0, 0.002, 0.175], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.014, 14, 14), M.skin, [0, -0.031, 0.187], [0, 0, 0], [0.92, 0.8, 0.96]);

  for (const s of [-1, 1]) {
    const eyeGroup = group(head, s * 0.048, 0.018, 0.162);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.018, 16, 16), M.eyeWhite, [0, 0, 0], [0, 0, 0], [1.15, 0.75, 0.65]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.011, 14, 14), M.eyeEmerald, [0, 0, 0.009], [0, 0, 0], [1.05, 1.05, 0.55]);
    sculpt(eyeGroup, new THREE.SphereGeometry(0.0055, 10, 10), M.eyePupil, [0, 0, 0.013]);
    const brow = new THREE.CapsuleGeometry(0.007, 0.045, 6, 8);
    sculpt(head, brow, M.hairPinkPetal, [s * 0.048, 0.044, 0.168], [0.1, -s * 0.22, s * -0.15]);
  }

  sculpt(head, new THREE.BoxGeometry(0.038, 0.009, 0.018), M.lipRose, [0, -0.068, 0.174], [0.12, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.008, 10, 10), M.lipRose, [0, -0.065, 0.178]);

  // Cabelos Rosa-Pétala
  const hairGroup = group(head, 0, 0.08, -0.02);
  const hairStrands: AtenaParts['hairStrands'] = [];

  sculpt(hairGroup, new THREE.CapsuleGeometry(0.022, 0.14, 8, 12), M.hairPinkPetal, [-0.052, -0.02, 0.165], [0.35, -0.25, -0.45]);
  sculpt(hairGroup, new THREE.CapsuleGeometry(0.022, 0.14, 8, 12), M.hairPinkPetal, [0.052, -0.02, 0.165], [0.35, 0.25, 0.45]);

  for (const s of [-1, 1]) {
    for (let j = 0; j < 3; j++) {
      const strand = sculpt(
        hairGroup,
        new THREE.CapsuleGeometry(0.024 - j * 0.004, 0.42 + j * 0.08, 8, 12),
        j === 1 ? M.hairPinkHighlight : M.hairPinkPetal,
        [s * (0.13 + j * 0.035), -0.22 - j * 0.06, 0.06 - j * 0.04],
        [0.15, 0, s * -0.18]
      );
      hairStrands.push({ mesh: strand, baseRotZ: s * -0.18, phase: j * 0.6 });
    }
  }

  for (let k = 0; k < 6; k++) {
    const a = (k / 5 - 0.5) * 0.85;
    const strand = sculpt(
      hairGroup,
      new THREE.CapsuleGeometry(0.038, 0.72, 8, 14),
      k % 2 === 0 ? M.hairPinkHighlight : M.hairPinkPetal,
      [a * 0.32, -0.38, -0.15 - Math.cos(a) * 0.04],
      [-0.15, 0, a * 0.3]
    );
    hairStrands.push({ mesh: strand, baseRotZ: a * 0.3, phase: k * 0.5 });
  }

  // Elmo Ático
  const helm = group(head, 0, 0.085, -0.01);
  sculpt(
    helm,
    new THREE.SphereGeometry(0.198, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.48),
    M.goldPolished,
    [0, 0.02, 0],
    [-0.12, 0, 0]
  );
  sculpt(helm, new THREE.BoxGeometry(0.18, 0.038, 0.025), M.goldPolished, [0, 0.055, 0.165], [-0.15, 0, 0]);
  sculpt(helm, new THREE.OctahedronGeometry(0.022, 0), M.sapphireGem, [0, 0.062, 0.182]);

  for (const s of [-1, 1]) {
    sculpt(helm, new THREE.BoxGeometry(0.016, 0.12, 0.08), M.goldPolished, [s * 0.17, -0.03, 0.07], [0.1, s * 0.35, 0]);
  }

  const crestGroup = group(helm, 0, 0.22, 0);
  sculpt(crestGroup, new THREE.BoxGeometry(0.032, 0.08, 0.32), M.goldPolished, [0, 0, -0.01], [-0.08, 0, 0]);

  const crestSegments: AtenaParts['crestSegments'] = [];
  const numCrest = 20;
  for (let i = 0; i < numCrest; i++) {
    const t = i / (numCrest - 1);
    const ang = -0.6 + t * 2.4;
    const r = 0.24;
    const cy = Math.cos(ang) * r * 0.85 + 0.02;
    const cz = Math.sin(ang) * r * 1.05 - 0.02;
    const segH = 0.18 + Math.sin(t * Math.PI) * 0.05;

    const seg = sculpt(
      crestGroup,
      new THREE.BoxGeometry(0.024, segH, 0.034),
      i % 3 === 1 ? M.plumeBlue : M.plumeIvory,
      [0, cy, cz],
      [ang, 0, 0]
    );
    crestSegments.push({ mesh: seg, baseX: 0, phase: i * 0.45 });
  }

  // D. Braços
  function createGoddessArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.36, 0.32, -0.01);

    sculpt(arm, new THREE.SphereGeometry(0.105, 18, 18), M.skin, [0, 0, 0], [0, 0, s * -0.2], [1, 1.15, 1]);
    sculpt(arm, new THREE.CapsuleGeometry(0.068, 0.24, 10, 16), M.skin, [s * 0.018, -0.15, 0], [0, 0, s * 0.06]);
    sculpt(arm, new THREE.SphereGeometry(0.125, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), M.goldPolished, [s * 0.01, 0.02, 0], [0, 0, s * -0.22]);

    const elbow = group(arm, s * 0.028, -0.30, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.062, 0.045, 0.28, 16), M.skin, [0, -0.13, 0]);

    const bracer = group(elbow, 0, -0.18, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.058, 0.052, 0.12, 20, 1, true), M.goldPolished);
    sculpt(bracer, new THREE.OctahedronGeometry(0.014, 0), M.sapphireGem, [0, 0, 0.055]);

    const hand = group(elbow, 0, -0.28, 0);
    sculpt(hand, new THREE.BoxGeometry(0.058, 0.072, 0.034), M.skin, [0, -0.02, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.009, 0.038, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.014;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.055, 0.016], [1.2, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.032, -0.028, 0.02], [0.6, 0, -s * 0.6]);

    return { arm, elbow, hand };
  }

  const rightArm = createGoddessArm(true);
  const leftArm = createGoddessArm(false);

  // Lança Doru
  const spear = new THREE.Group();
  rightArm.hand.add(spear);
  spear.position.set(0, -0.04, 0.02);

  sculpt(spear, new THREE.CylinderGeometry(0.018, 0.018, 2.85, 16), M.goldPolished, [0, 0.35, 0]);
  const spearBladeGeo = new THREE.ConeGeometry(0.065, 0.44, 4);
  spearBladeGeo.scale(1, 1, 0.28);
  sculpt(spear, spearBladeGeo, M.divineLight, [0, 1.88, 0]);
  sculpt(spear, new THREE.CylinderGeometry(0.026, 0.032, 0.12, 12), M.bronzePolished, [0, 1.62, 0]);
  sculpt(spear, new THREE.ConeGeometry(0.035, 0.18, 6), M.goldPolished, [0, -1.14, 0], [Math.PI, 0, 0]);

  // Escudo Égide
  const aegisShield = group(leftArm.elbow, -0.06, -0.16, 0.02);
  aegisShield.rotation.set(0, -Math.PI / 2, 0);

  const shieldDomeGeo = new THREE.SphereGeometry(0.64, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.26);
  shieldDomeGeo.rotateX(Math.PI / 2);
  sculpt(aegisShield, shieldDomeGeo, M.shieldFace, [0, 0, -0.50]);
  sculpt(aegisShield, new THREE.TorusGeometry(0.60, 0.028, 12, 44), M.goldPolished, [0, 0, 0.015]);
  sculpt(aegisShield, new THREE.SphereGeometry(0.088, 16, 16), M.goldPolished, [0, 0, 0.065], [0, 0, 0], [1, 1, 0.4]);
  sculpt(aegisShield, new THREE.OctahedronGeometry(0.032, 0), M.sapphireGem, [0, 0, 0.095]);

  // E. Coruja Sagrada
  const owlGroup = group(root, -0.68, 2.05, 0.28);
  sculpt(owlGroup, new THREE.SphereGeometry(0.12, 16, 16), M.owlIvory, [0, 0, 0], [0, 0, 0], [0.95, 1.25, 0.95]);

  const owlHead = group(owlGroup, 0, 0.14, 0.04);
  sculpt(owlHead, new THREE.SphereGeometry(0.092, 16, 16), M.owlIvory);
  sculpt(owlHead, new THREE.ConeGeometry(0.016, 0.04, 4), M.owlGold, [0, -0.018, 0.095], [-Math.PI / 2, 0, 0]);
  for (const s of [-1, 1]) {
    sculpt(owlHead, new THREE.SphereGeometry(0.022, 12, 12), M.goldPolished, [s * 0.036, 0.016, 0.072]);
    sculpt(owlHead, new THREE.SphereGeometry(0.010, 8, 8), M.eyePupil, [s * 0.036, 0.016, 0.088]);
  }

  const owlWings: AtenaParts['owlWings'] = [];
  for (const s of [-1, 1]) {
    const wing = group(owlGroup, s * 0.10, 0.02, -0.02);
    sculpt(wing, new THREE.BoxGeometry(0.03, 0.22, 0.15), M.owlIvory, [s * 0.06, -0.04, 0], [0, 0, s * -0.4]);
    owlWings.push({ wing, s });
  }

  // F. Vestes
  const garments = group(torso, 0, 0, 0);

  const beltGeo = new THREE.TorusGeometry(0.24, 0.024, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.goldPolished, [0, -0.28, 0], [0.06, 0, 0], [1.1, 1, 0.85]);

  const skirtPts = [
    new THREE.Vector2(0.20, -0.28),
    new THREE.Vector2(0.23, -0.45),
    new THREE.Vector2(0.29, -0.72),
    new THREE.Vector2(0.36, -0.98),
    new THREE.Vector2(0.39, -1.18),
  ];
  sculpt(garments, new THREE.LatheGeometry(skirtPts, 36), M.chiton, [0, 0, 0], [0, 0, 0], [1.08, 1, 0.88]);

  const capeGeo = new THREE.PlaneGeometry(1.35, 1.85, 24, 30);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.925 - y) / 1.85));
    const archZ = -0.16 - Math.cos((x / 0.675) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.48;
    const fx = x * (0.65 + normY * 0.72);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.royalCloak, [0, -0.42, -0.04]);

  return {
    root,
    body,
    torso,
    head,
    helm,
    legs,
    rightArm,
    leftArm,
    spear,
    aegisShield,
    hairStrands,
    crestSegments,
    owlGroup,
    owlHead,
    owlWings,
    cape,
    capeBase,
  };
}

export function animateAthena(
  athena: AtenaParts,
  dt: number,
  t: number,
  mode: 'guardia' | 'avanco' | 'egide' | 'furia' = 'guardia'
): void {
  const breath = Math.sin(t * 2.2) * 0.025;
  let pitch = 0.03, roll = 0, ay = 0;

  if (mode === 'avanco') {
    pitch = 0.16;
    roll = -0.12;
    ay = Math.abs(Math.sin(t * 6.5)) * 0.08;

    athena.legs.L.hip.rotation.x = -0.42 + Math.sin(t * 6.5) * 0.35;
    athena.legs.L.knee.rotation.x = 0.48 + Math.max(0, -Math.cos(t * 6.5)) * 0.35;
    athena.legs.R.hip.rotation.x = -0.42 - Math.sin(t * 6.5) * 0.35;
    athena.legs.R.knee.rotation.x = 0.48 + Math.max(0, Math.cos(t * 6.5)) * 0.35;

    athena.leftArm.arm.rotation.set(-0.85, -0.45, -0.32);
    athena.leftArm.elbow.rotation.set(-0.95, -0.2, 0.15);
    athena.rightArm.arm.rotation.set(0.35, 0.15, 0.45);
    athena.rightArm.elbow.rotation.set(-0.65, 0.15, 0.15);
    athena.spear.rotation.set(Math.PI / 2 - 0.2, 0, 0);
  } else if (mode === 'egide') {
    athena.leftArm.arm.rotation.set(-1.15, -0.25, -0.45);
    athena.leftArm.elbow.rotation.set(-0.55, 0, 0.1);
    athena.rightArm.arm.rotation.set(-0.25, 0.15, 0.42);
    athena.rightArm.elbow.rotation.set(-0.55, 0.1, 0.1);
    athena.spear.rotation.set(0, 0, 0);
  } else if (mode === 'furia') {
    athena.rightArm.arm.rotation.set(-0.35, 0.15, 2.35 + Math.sin(t * 2) * 0.04);
    athena.rightArm.elbow.rotation.set(0.45, 0.15, 0.2);
    athena.spear.rotation.set(-0.25, 0, 0);
    athena.leftArm.arm.rotation.set(-0.45, -0.35, -0.62);
    athena.leftArm.elbow.rotation.set(-0.75, -0.15, 0.15);
  } else {
    athena.rightArm.arm.rotation.set(-0.15, 0.12, 0.42 + Math.sin(t * 1.8) * 0.02);
    athena.rightArm.elbow.rotation.set(-0.45, 0.12, 0.15);
    athena.spear.rotation.set(0, 0, 0);
    athena.leftArm.arm.rotation.set(-0.38, -0.25, -0.45);
    athena.leftArm.elbow.rotation.set(-0.65, -0.15, 0.15);
  }

  athena.body.position.y = 1.08 + ay + breath;
  athena.body.rotation.set(pitch, 0, roll);

  const owlHoverY = Math.sin(t * 3.2) * 0.06;
  athena.owlGroup.position.set(-0.68, 2.05 + owlHoverY, 0.28);
  athena.owlHead.rotation.y = Math.sin(t * 1.2) * 0.35;
  for (const w of athena.owlWings) {
    w.wing.rotation.z = Math.sin(t * 14) * 0.35 * w.s;
  }

  const wind = (mode === 'avanco' || mode === 'furia') ? 1.8 : 1.0;
  for (const h of athena.hairStrands) {
    h.mesh.rotation.z = h.baseRotZ + Math.sin(t * 3.2 * wind + h.phase) * 0.035;
  }
  for (const cs of athena.crestSegments) {
    cs.mesh.position.x = cs.baseX + Math.sin(t * 3.6 * wind - cs.phase) * 0.016;
  }

  const cAttr = athena.cape.geometry.attributes.position;
  for (let i = 0; i < cAttr.count; i++) {
    const bx = athena.capeBase[i * 3];
    const by = athena.capeBase[i * 3 + 1];
    const bz = athena.capeBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.925 - by) / 1.85));
    const wave = Math.sin(t * 3.4 * wind - normY * 4.2 + bx * 2.2) * 0.12 * normY;
    cAttr.setXYZ(i, bx + Math.sin(t * 2.5 - normY * 2.8) * 0.03 * normY, by, bz + wave);
  }
  cAttr.needsUpdate = true;
  athena.cape.geometry.computeVertexNormals();
}
