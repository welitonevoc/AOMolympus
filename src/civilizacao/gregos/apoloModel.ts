import * as THREE from 'three';

export interface ApolloTextures {
  skinBump: THREE.CanvasTexture;
  tunicTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export function createApolloTextures(): ApolloTextures {
  // 1. Bump map suave da pele
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5200; i++) {
      const v = 123 + Math.floor(Math.random() * 12);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 2. Himation Branco Solar com Meandro Grego Dourado e Âmbar
  const tunicCanvas = document.createElement('canvas');
  tunicCanvas.width = 512;
  tunicCanvas.height = 256;
  const tCtx = tunicCanvas.getContext('2d');
  if (tCtx) {
    const grad = tCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.68, '#fef3c7');
    grad.addColorStop(1, '#fde68a');
    tCtx.fillStyle = grad;
    tCtx.fillRect(0, 0, 512, 256);

    tCtx.fillStyle = 'rgba(217, 119, 6, 0.12)';
    for (let x = 0; x < 512; x += 9) tCtx.fillRect(x, 0, 3, 256);

    tCtx.fillStyle = '#b45309';
    tCtx.fillRect(0, 198, 512, 40);
    tCtx.fillStyle = '#facc15';
    tCtx.fillRect(0, 194, 512, 5);
    tCtx.fillRect(0, 238, 512, 5);

    tCtx.strokeStyle = '#fef08a';
    tCtx.lineWidth = 3;
    for (let x = 0; x < 512; x += 32) {
      tCtx.beginPath();
      tCtx.moveTo(x + 4, 230);
      tCtx.lineTo(x + 4, 206);
      tCtx.lineTo(x + 24, 206);
      tCtx.lineTo(x + 24, 224);
      tCtx.lineTo(x + 12, 224);
      tCtx.lineTo(x + 12, 214);
      tCtx.lineTo(x + 18, 214);
      tCtx.stroke();
    }
  }
  const tunicTex = new THREE.CanvasTexture(tunicCanvas);
  tunicTex.wrapS = tunicTex.wrapT = THREE.RepeatWrapping;

  return { skinBump, tunicTex };
}

let cachedApolloTextures: ApolloTextures | null = null;
export function getCachedApolloTextures(): ApolloTextures {
  if (!cachedApolloTextures) {
    cachedApolloTextures = createApolloTextures();
  }
  return cachedApolloTextures;
}

export interface ApolloMaterials {
  skin: THREE.MeshStandardMaterial;
  skinShade: THREE.MeshStandardMaterial;
  hairSunGold: THREE.MeshStandardMaterial;
  hairAmberCurl: THREE.MeshStandardMaterial;
  goldPolished: THREE.MeshStandardMaterial;
  amberBronze: THREE.MeshStandardMaterial;
  solarCore: THREE.MeshStandardMaterial;
  ivoryGrip: THREE.MeshStandardMaterial;
  cedarWood: THREE.MeshStandardMaterial;
  amberGem: THREE.MeshStandardMaterial;
  solarRayMat: THREE.MeshBasicMaterial;
  eyeSolarGold: THREE.MeshStandardMaterial;
  tunic: THREE.MeshStandardMaterial;
  scarletSolarCloak: THREE.MeshStandardMaterial;
  featherWhite: THREE.MeshStandardMaterial;
}

function createMaterials(textures: ApolloTextures): ApolloMaterials {
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xdca478,
      roughness: 0.36,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.0028,
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0xc5895e,
      roughness: 0.40,
      metalness: 0.06,
      bumpMap: textures.skinBump,
      bumpScale: 0.0028,
    }),
    hairSunGold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x451a03,
      emissiveIntensity: 0.25,
      roughness: 0.34,
      metalness: 0.22,
    }),
    hairAmberCurl: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x3b1502,
      emissiveIntensity: 0.22,
      roughness: 0.36,
      metalness: 0.2,
    }),
    goldPolished: new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0x713f12,
      emissiveIntensity: 0.3,
      metalness: 0.94,
      roughness: 0.16,
    }),
    amberBronze: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x3b1803,
      emissiveIntensity: 0.24,
      metalness: 0.88,
      roughness: 0.22,
    }),
    solarCore: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 1.65,
      roughness: 0.08,
    }),
    ivoryGrip: new THREE.MeshStandardMaterial({
      color: 0xfefce8,
      roughness: 0.35,
      metalness: 0.08,
    }),
    cedarWood: new THREE.MeshStandardMaterial({
      color: 0x7c2d12,
      emissive: 0x290c04,
      emissiveIntensity: 0.2,
      roughness: 0.42,
      metalness: 0.14,
    }),
    amberGem: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.4,
      roughness: 0.1,
      metalness: 0.25,
    }),
    solarRayMat: new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    eyeSolarGold: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfacc15,
      emissiveIntensity: 1.65,
      roughness: 0.06,
    }),
    tunic: new THREE.MeshStandardMaterial({
      map: textures.tunicTex,
      color: 0xffffff,
      roughness: 0.52,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
    scarletSolarCloak: new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      emissive: 0x450a0a,
      emissiveIntensity: 0.35,
      roughness: 0.48,
      metalness: 0.14,
      side: THREE.DoubleSide,
    }),
    featherWhite: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    }),
  };
}

function group(parent?: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D,
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
  parent.add(m);
  return m;
}

export interface ApolloParts {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };
  };
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  solarBow: THREE.Group;
  bowString: THREE.Line;
  bowStringNockY: number;
  bowStringNockZ: number;
  nockedArrow: THREE.Group;
  arrowAnchor: THREE.Group;
  arrowGlow: THREE.Mesh;
  solarHaloGroup: THREE.Group;
  hairCurls: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }>;
  lyreOrbitGroup: THREE.Group;
  lyre: THREE.Group;
  lyreStrings: Array<{ front: THREE.Mesh; back: THREE.Mesh; baseX: number; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  cape: THREE.Mesh;
  capeBase: Float32Array;
}

export function buildApollo(textures?: ApolloTextures): ApolloParts {
  const tex = textures || getCachedApolloTextures();
  const M = createMaterials(tex);
  const root = new THREE.Group();
  const body = group(root, 0, 1.12, 0);

  // ------------------------------------------------------------------------
  // A. PELVE E PERNAS ATLÉTICAS
  // ------------------------------------------------------------------------
  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.23, 22, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.08, 0.78, 0.82]);

  const legs: ApolloParts['legs'] = {
    L: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
    R: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() }
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.145, -0.04, 0);

    sculpt(hip, new THREE.CylinderGeometry(0.135, 0.095, 0.50, 20), M.skin, [0, -0.24, 0], [0, 0, 0], [1.02, 1, 1.06]);
    sculpt(hip, new THREE.SphereGeometry(0.105, 16, 16), M.skin, [s * 0.018, -0.21, 0.045], [0, 0, 0], [0.94, 1.82, 0.86]);

    sculpt(hip, new THREE.SphereGeometry(0.084, 16, 16), M.skin, [0, -0.50, 0.014]);

    const knee = group(hip, 0, -0.51, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.085, 0.052, 0.46, 18), M.skin, [0, -0.23, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.08, 16, 16), M.skin, [0, -0.15, -0.035], [0, 0, 0], [0.96, 1.65, 0.95]);
    sculpt(knee, new THREE.CylinderGeometry(0.082, 0.055, 0.32, 16, 1, false, -0.82, 1.64), M.goldPolished, [0, -0.24, 0.008]);

    const ankle = group(knee, 0, -0.46, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.088, 0.046, 0.21), M.skin, [0, -0.02, 0.038], [0.22, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.096, 0.015, 0.224), M.goldPolished, [0, -0.044, 0.038], [0.22, 0, 0]);

    const strap = new THREE.TorusGeometry(0.058, 0.0055, 8, 20);
    strap.rotateX(Math.PI / 2);
    for (let k = 0; k < 3; k++) {
      sculpt(ankle, strap, M.goldPolished, [0, 0.02 + k * 0.042, -0.02], [0.1, 0, 0]);
    }
    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.34, -0.08, -0.05);
  legs.L.knee.rotation.set(0.48, 0, 0);
  legs.R.hip.rotation.set(0.22, 0.08, 0.05);
  legs.R.knee.rotation.set(0.24, 0, 0);

  // ------------------------------------------------------------------------
  // B. TRONCO APOLÍNEO
  // ------------------------------------------------------------------------
  const torso = group(body, 0, 1.32, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.43),
    new THREE.Vector2(0.235, -0.39),
    new THREE.Vector2(0.205, -0.19),
    new THREE.Vector2(0.255, 0.03),
    new THREE.Vector2(0.36, 0.26),
    new THREE.Vector2(0.32, 0.42),
    new THREE.Vector2(0.14, 0.49),
    new THREE.Vector2(0.01, 0.50)
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.15, 1.02, 0.72]);

  const pecGeo = new THREE.SphereGeometry(0.20, 22, 22);
  sculpt(torso, pecGeo, M.skin, [-0.17, 0.22, 0.155], [0.12, -0.22, -0.14], [1.04, 0.85, 0.56]);
  sculpt(torso, pecGeo, M.skin, [0.17, 0.22, 0.155], [0.12, 0.22, 0.14], [1.04, 0.85, 0.56]);

  const abGeo = new THREE.SphereGeometry(0.08, 14, 14);
  [
    { y: 0.04, sx: 0.96, sy: 0.75, z: 0.196 },
    { y: -0.075, sx: 0.92, sy: 0.78, z: 0.192 },
    { y: -0.19, sx: 0.84, sy: 0.84, z: 0.182 }
  ].forEach(lvl => {
    sculpt(torso, abGeo, M.skin, [-0.066, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.46]);
    sculpt(torso, abGeo, M.skin, [0.066, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.46]);
  });

  const obliqueGeo = new THREE.CapsuleGeometry(0.072, 0.22, 10, 14);
  sculpt(torso, obliqueGeo, M.skin, [-0.225, -0.11, 0.08], [0.1, 0, -0.18], [0.85, 1, 0.85]);
  sculpt(torso, obliqueGeo, M.skin, [0.225, -0.11, 0.08], [0.1, 0, 0.18], [0.85, 1, 0.85]);

  const latGeo = new THREE.SphereGeometry(0.22, 18, 18);
  sculpt(torso, latGeo, M.skin, [-0.195, 0.17, -0.11], [0, 0, -0.25], [1.0, 1.32, 0.64]);
  sculpt(torso, latGeo, M.skin, [0.195, 0.17, -0.11], [0, 0, 0.25], [1.0, 1.32, 0.64]);

  sculpt(torso, new THREE.CylinderGeometry(0.112, 0.142, 0.25, 20), M.skin, [0, 0.52, -0.008], [0.07, 0, 0]);

  // ------------------------------------------------------------------------
  // C. ROSTO CLÁSSICO SERENO + CACHOS DOURADOS + AURÉOLA SOLAR
  // ------------------------------------------------------------------------
  const head = group(torso, 0, 0.73, 0.032);

  const skullGeo = new THREE.SphereGeometry(0.192, 38, 38);
  const sPos = skullGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.16;
    x *= 0.90;
    if (y < 0.02 && y > -0.08 && z > 0) { x *= 1.03; z *= 1.04; }
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

  const cheekGeo = new THREE.SphereGeometry(0.044, 16, 16);
  sculpt(head, cheekGeo, M.skin, [-0.066, -0.015, 0.148], [0, -0.3, 0], [1.08, 0.85, 0.64]);
  sculpt(head, cheekGeo, M.skin, [0.066, -0.015, 0.148], [0, 0.3, 0], [1.08, 0.85, 0.64]);

  sculpt(head, new THREE.BoxGeometry(0.022, 0.078, 0.042), M.skin, [0, 0.004, 0.184], [-0.14, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.016, 14, 14), M.skin, [0, -0.034, 0.198], [0, 0, 0], [0.94, 0.82, 0.98]);

  const browGeo = new THREE.CapsuleGeometry(0.008, 0.056, 8, 12);
  sculpt(head, browGeo, M.hairAmberCurl, [-0.052, 0.048, 0.178], [0.1, 0.25, 1.40]);
  sculpt(head, browGeo, M.hairAmberCurl, [0.052, 0.048, 0.178], [0.1, -0.25, -1.40]);

  const eyeGeo = new THREE.SphereGeometry(0.019, 16, 16);
  sculpt(head, eyeGeo, M.eyeSolarGold, [-0.052, 0.022, 0.172], [0, 0, 0], [1.15, 0.76, 0.8]);
  sculpt(head, eyeGeo, M.eyeSolarGold, [0.052, 0.022, 0.172], [0, 0, 0], [1.15, 0.76, 0.8]);

  sculpt(head, new THREE.CapsuleGeometry(0.009, 0.036, 8, 12), M.skinShade, [0, -0.078, 0.184], [0, 0, Math.PI / 2], [1, 1, 0.75]);

  const hairCurls: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }> = [];
  sculpt(head, new THREE.SphereGeometry(0.198, 24, 24), M.hairSunGold, [0, 0.042, -0.018], [-0.08, 0, 0], [1.03, 1.03, 1.07]);

  for (let i = 0; i < 28; i++) {
    const ang = (i / 28) * Math.PI * 2;
    const isFront = Math.cos(ang) > 0.35;
    const rad = isFront ? 0.178 : 0.196;
    const cx = Math.sin(ang) * rad;
    const cz = Math.cos(ang) * rad - 0.01;
    const cy = isFront ? 0.076 : (0.03 - (i % 4) * 0.045);
    const curlSize = isFront ? 0.034 : (0.048 + (i % 2) * 0.012);

    const curl = sculpt(
      head,
      new THREE.SphereGeometry(curlSize, 12, 12),
      i % 2 === 0 ? M.hairSunGold : M.hairAmberCurl,
      [cx, cy, cz],
      [0.2, ang, 0],
      [1.05, 1.25, 0.95]
    );
    hairCurls.push({ mesh: curl, baseY: cy, phase: i * 0.5 });
  }

  // Coroa de Louros Dourada
  const laurelCrown = group(head, 0, 0.105, 0.012);
  laurelCrown.rotation.x = 0.22;
  const circlet = new THREE.TorusGeometry(0.196, 0.009, 10, 36, Math.PI * 1.7);
  circlet.rotateX(Math.PI / 2);
  circlet.rotateY(-Math.PI * 0.35);
  sculpt(laurelCrown, circlet, M.goldPolished, [0, 0, 0], [0, 0, 0], [0.96, 1, 1.05]);

  const leafGeo = new THREE.SphereGeometry(0.025, 10, 10);
  leafGeo.scale(0.55, 1.45, 0.22);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const ang = side * (0.28 + t * 2.2);
      sculpt(
        laurelCrown,
        leafGeo,
        M.goldPolished,
        [Math.sin(ang) * 0.192, (1 - t) * 0.014, Math.cos(ang) * 0.206],
        [0.3, ang, side * -0.55]
      );
    }
  }

  // Auréola Solar Radiante
  const solarHaloGroup = group(head, 0, 0.05, -0.22);
  const haloInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.012, 8, 48),
    new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  const haloOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.008, 8, 48),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  solarHaloGroup.add(haloInnerRing, haloOuterRing);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const isMajor = i % 2 === 0;
    const rayLen = isMajor ? 0.36 : 0.24;
    const rayMid = 0.36 + rayLen * 0.5;
    const rayMesh = new THREE.Mesh(
      new THREE.ConeGeometry(isMajor ? 0.026 : 0.016, rayLen, 4),
      M.solarRayMat
    );
    rayMesh.position.set(Math.cos(a) * rayMid, Math.sin(a) * rayMid, 0);
    rayMesh.rotation.z = a - Math.PI / 2;
    rayMesh.scale.z = 0.2;
    solarHaloGroup.add(rayMesh);
  }

  // ------------------------------------------------------------------------
  // D. BRAÇOS ATLÉTICOS
  // ------------------------------------------------------------------------
  function createApolloArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.40, 0.33, -0.008);

    sculpt(arm, new THREE.SphereGeometry(0.128, 18, 18), M.skin, [0, 0, 0], [0, 0, s * -0.22], [1.04, 1.12, 1.04]);
    sculpt(arm, new THREE.CapsuleGeometry(0.082, 0.26, 12, 16), M.skin, [s * 0.02, -0.17, 0], [0, 0, s * 0.07]);
    sculpt(arm, new THREE.SphereGeometry(0.076, 14, 14), M.skin, [s * 0.015, -0.16, 0.038], [0, 0, s * 0.07], [0.92, 1.42, 0.92]);

    const elbow = group(arm, s * 0.038, -0.34, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.076, 0.050, 0.31, 18), M.skin, [0, -0.15, 0]);

    const bracer = group(elbow, 0, -0.24, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.06, 0.054, 0.085, 24, 1, true), M.goldPolished);
    const bRing = new THREE.TorusGeometry(0.058, 0.0055, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.amberBronze, [0, 0.04, 0]);
    sculpt(bracer, bRing, M.amberBronze, [0, -0.04, 0]);
    sculpt(bracer, new THREE.OctahedronGeometry(0.018, 0), M.amberGem, [s * 0.06, 0, 0]);

    const hand = group(elbow, 0, -0.32, 0);
    sculpt(hand, new THREE.BoxGeometry(0.066, 0.076, 0.032), M.skin, [0, -0.018, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.009, 0.036, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.0155;
      sculpt(hand, fingerGeo, M.skin, [fx, -0.058, 0.016], [1.1, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skin, [-s * 0.035, -0.028, 0.02], [0.55, 0, -s * 0.6], [1.05, 0.9, 1.05]);

    return { arm, elbow, hand };
  }

  const rightArm = createApolloArm(true);
  const leftArm = createApolloArm(false);

  // ------------------------------------------------------------------------
  // E. ARCO SOLAR RECURVO + FLECHA DE LUZ
  // ------------------------------------------------------------------------
  const solarBow = new THREE.Group();
  leftArm.hand.add(solarBow);
  solarBow.position.set(0, -0.04, 0.045);

  const bowStringNockY = 0.86;
  const bowStringNockZ = -0.175;

  for (const dirY of [-1, 1]) {
    const limbPts = [
      new THREE.Vector3(0, dirY * 0.10, 0.01),
      new THREE.Vector3(0, dirY * 0.28, 0.035),
      new THREE.Vector3(0, dirY * 0.48, 0.005),
      new THREE.Vector3(0, dirY * 0.68, -0.095),
      new THREE.Vector3(0, dirY * 0.82, -0.185),
      new THREE.Vector3(0, dirY * 0.94, -0.135)
    ];
    const limbCurve = new THREE.CatmullRomCurve3(limbPts);

    sculpt(solarBow, new THREE.TubeGeometry(limbCurve, 28, 0.018, 10, false), M.goldPolished);

    const innerPts = [
      new THREE.Vector3(0, dirY * 0.13, 0.025),
      new THREE.Vector3(0, dirY * 0.34, 0.052),
      new THREE.Vector3(0, dirY * 0.56, 0.015),
      new THREE.Vector3(0, dirY * 0.74, -0.085)
    ];
    sculpt(solarBow, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(innerPts), 20, 0.011, 8, false), M.amberBronze);

    sculpt(
      solarBow,
      new THREE.ConeGeometry(0.018, 0.14, 4),
      M.goldPolished,
      [0, dirY * 0.46, 0.055],
      [dirY * 0.95, 0, 0],
      [0.35, 1, 1]
    );

    const nockPos: [number, number, number] = [0, dirY * bowStringNockY, bowStringNockZ];
    sculpt(solarBow, new THREE.SphereGeometry(0.018, 12, 12), M.ivoryGrip, nockPos);
    const nockCollar = new THREE.TorusGeometry(0.019, 0.0045, 8, 16);
    nockCollar.rotateX(Math.PI / 2);
    sculpt(solarBow, nockCollar, M.goldPolished, [0, dirY * (bowStringNockY - 0.015), bowStringNockZ + 0.005]);

    sculpt(
      solarBow,
      new THREE.ConeGeometry(0.016, 0.11, 5),
      M.goldPolished,
      [0, dirY * 0.96, -0.115],
      [dirY * 0.42, 0, 0],
      [0.45, 1, 1]
    );
  }

  sculpt(solarBow, new THREE.CylinderGeometry(0.025, 0.025, 0.22, 16), M.ivoryGrip, [0, 0, 0.01]);
  for (const gy of [-0.11, -0.055, 0.055, 0.11]) {
    const gripRing = new THREE.TorusGeometry(0.027, 0.0055, 8, 20);
    gripRing.rotateX(Math.PI / 2);
    sculpt(solarBow, gripRing, M.goldPolished, [0, gy, 0.01]);
  }
  sculpt(solarBow, new THREE.CylinderGeometry(0.036, 0.036, 0.018, 16), M.goldPolished, [0, 0, 0.036], [Math.PI / 2, 0, 0], [0.85, 1, 1.35]);
  sculpt(solarBow, new THREE.OctahedronGeometry(0.02, 0), M.amberGem, [0, 0, 0.046], [0, 0, 0], [0.8, 1.3, 0.6]);

  const stringGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, bowStringNockY, bowStringNockZ),
    new THREE.Vector3(0, 0, bowStringNockZ),
    new THREE.Vector3(0, -bowStringNockY, bowStringNockZ)
  ]);
  const bowString = new THREE.Line(
    stringGeo,
    new THREE.LineBasicMaterial({ color: 0xfef08a, linewidth: 2 })
  );
  solarBow.add(bowString);

  const nockedArrow = new THREE.Group();
  rightArm.hand.add(nockedArrow);
  nockedArrow.position.set(0, -0.04, 0.035);
  nockedArrow.rotation.set(Math.PI / 2, 0, 0);

  sculpt(nockedArrow, new THREE.CylinderGeometry(0.009, 0.009, 1.18, 8), M.solarCore, [0, 0.36, 0]);
  sculpt(nockedArrow, new THREE.ConeGeometry(0.034, 0.17, 4), M.goldPolished, [0, 0.98, 0], [0, 0, 0], [1.0, 1.0, 0.26]);
  sculpt(nockedArrow, new THREE.BoxGeometry(0.01, 0.12, 0.018), M.solarCore, [0, 0.94, 0]);
  sculpt(nockedArrow, new THREE.BoxGeometry(0.058, 0.13, 0.006), M.featherWhite, [0, -0.17, 0]);
  sculpt(nockedArrow, new THREE.BoxGeometry(0.006, 0.13, 0.058), M.featherWhite, [0, -0.17, 0]);

  const arrowAnchor = group(nockedArrow, 0, 1.02, 0);
  const arrowGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  arrowAnchor.add(arrowGlow);

  // ------------------------------------------------------------------------
  // F. ALJAVA DOURADA + LIRA KITHARA
  // ------------------------------------------------------------------------
  const quiver = group(torso, -0.12, 0.18, -0.22);
  quiver.rotation.set(0.18, 0.1, -0.45);
  sculpt(quiver, new THREE.CylinderGeometry(0.075, 0.055, 0.68, 16), M.amberBronze);
  sculpt(quiver, new THREE.TorusGeometry(0.076, 0.01, 8, 20), M.goldPolished, [0, 0.33, 0], [Math.PI / 2, 0, 0]);
  sculpt(quiver, new THREE.TorusGeometry(0.066, 0.008, 8, 20), M.goldPolished, [0, 0.05, 0], [Math.PI / 2, 0, 0]);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const fx = Math.cos(a) * 0.032;
    const fz = Math.sin(a) * 0.032;
    sculpt(quiver, new THREE.CylinderGeometry(0.008, 0.008, 0.25, 6), M.solarCore, [fx, 0.42, fz]);
    sculpt(quiver, new THREE.BoxGeometry(0.036, 0.08, 0.005), M.featherWhite, [fx, 0.50, fz], [0, a, 0]);
  }

  const lyreOrbitGroup = new THREE.Group();
  root.add(lyreOrbitGroup);

  const lyre = new THREE.Group();
  lyreOrbitGroup.add(lyre);

  const soundboxShape = new THREE.Shape();
  soundboxShape.moveTo(-0.125, -0.24);
  soundboxShape.lineTo(0.125, -0.24);
  soundboxShape.lineTo(0.165, -0.05);
  soundboxShape.lineTo(-0.165, -0.05);
  soundboxShape.closePath();

  const soundboxGeo = new THREE.ExtrudeGeometry(soundboxShape, {
    depth: 0.054,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3
  });
  soundboxGeo.center();
  sculpt(lyre, soundboxGeo, M.cedarWood, [0, -0.145, 0]);

  sculpt(lyre, new THREE.BoxGeometry(0.35, 0.022, 0.076), M.goldPolished, [0, -0.045, 0]);
  sculpt(lyre, new THREE.BoxGeometry(0.27, 0.026, 0.078), M.goldPolished, [0, -0.245, 0]);
  sculpt(lyre, new THREE.BoxGeometry(0.18, 0.024, 0.068), M.amberBronze, [0, -0.268, 0]);

  for (const zSide of [-1, 1]) {
    const zFace = zSide * 0.036;
    sculpt(lyre, new THREE.TorusGeometry(0.042, 0.006, 8, 24), M.goldPolished, [0, -0.142, zFace]);
    sculpt(lyre, new THREE.CylinderGeometry(0.024, 0.024, 0.008, 16), M.amberGem, [0, -0.142, zFace], [Math.PI / 2, 0, 0]);
    for (let r = 0; r < 8; r++) {
      const ra = (r / 8) * Math.PI * 2;
      sculpt(
        lyre,
        new THREE.ConeGeometry(0.007, 0.024, 4),
        M.goldPolished,
        [Math.cos(ra) * 0.052, -0.142 + Math.sin(ra) * 0.052, zFace],
        [0, 0, ra - Math.PI / 2],
        [1, 1, 0.4]
      );
    }
  }

  sculpt(lyre, new THREE.BoxGeometry(0.21, 0.018, 0.084), M.ivoryGrip, [0, -0.195, 0]);
  sculpt(lyre, new THREE.BoxGeometry(0.22, 0.008, 0.086), M.goldPolished, [0, -0.204, 0]);

  for (const side of [-1, 1]) {
    const armPts = [
      new THREE.Vector3(side * 0.145, -0.05, 0),
      new THREE.Vector3(side * 0.215, 0.03, 0),
      new THREE.Vector3(side * 0.225, 0.13, 0),
      new THREE.Vector3(side * 0.165, 0.23, 0),
      new THREE.Vector3(side * 0.145, 0.28, 0)
    ];
    sculpt(lyre, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(armPts), 24, 0.019, 10, false), M.goldPolished);

    sculpt(lyre, new THREE.TorusGeometry(0.023, 0.005, 8, 16), M.amberBronze, [side * 0.185, -0.01, 0], [Math.PI / 2.6, 0, 0]);
    sculpt(lyre, new THREE.TorusGeometry(0.022, 0.005, 8, 16), M.amberBronze, [side * 0.212, 0.15, 0], [Math.PI / 2.2, 0, 0]);

    const scrollGroup = group(lyre, side * 0.145, 0.285, 0);
    sculpt(scrollGroup, new THREE.TorusGeometry(0.026, 0.011, 10, 20, Math.PI * 1.45), M.goldPolished, [side * 0.015, 0.012, 0], [0, 0, side * -0.4]);
    sculpt(scrollGroup, new THREE.SphereGeometry(0.014, 10, 10), M.amberGem, [side * 0.015, 0.012, 0]);
  }

  const jugumY = 0.235;
  sculpt(lyre, new THREE.CylinderGeometry(0.016, 0.016, 0.37, 16), M.goldPolished, [0, jugumY, 0], [0, 0, Math.PI / 2]);
  sculpt(lyre, new THREE.CylinderGeometry(0.018, 0.018, 0.26, 16), M.ivoryGrip, [0, jugumY, 0], [0, 0, Math.PI / 2]);

  for (const side of [-1, 1]) {
    sculpt(lyre, new THREE.SphereGeometry(0.022, 12, 12), M.goldPolished, [side * 0.195, jugumY, 0]);
    sculpt(lyre, new THREE.ConeGeometry(0.016, 0.045, 8), M.amberBronze, [side * 0.22, jugumY, 0], [0, 0, side * -Math.PI / 2]);
  }

  const lyreStrings: Array<{ front: THREE.Mesh; back: THREE.Mesh; baseX: number; phase: number }> = [];
  const lyreStringMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 1.8,
    metalness: 0.9,
    roughness: 0.15
  });

  const bridgeY = -0.195;
  const stringLen = jugumY - bridgeY;
  const stringMidY = (jugumY + bridgeY) * 0.5;

  for (let s = -3; s <= 3; s++) {
    const sx = s * 0.028;
    sculpt(lyre, new THREE.BoxGeometry(0.011, 0.044, 0.026), M.goldPolished, [sx, jugumY + 0.012, 0], [0.25, 0, 0]);

    const strMesh = sculpt(
      lyre,
      new THREE.CylinderGeometry(0.0024, 0.0024, stringLen, 6),
      lyreStringMat,
      [sx, stringMidY, 0.032]
    );
    const strMeshBack = sculpt(
      lyre,
      new THREE.CylinderGeometry(0.0024, 0.0024, stringLen, 6),
      lyreStringMat,
      [sx, stringMidY, -0.032]
    );
    lyreStrings.push({ front: strMesh, back: strMeshBack, baseX: sx, phase: s * 0.9 });
  }

  // ------------------------------------------------------------------------
  // G. VESTIMENTA SOLAR
  // ------------------------------------------------------------------------
  const garments = group(torso, 0, 0, 0);

  const sashCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.19, -0.36, 0.19),
    new THREE.Vector3(-0.23, 0.05, 0.21),
    new THREE.Vector3(-0.21, 0.41, 0.12),
    new THREE.Vector3(-0.19, 0.43, -0.12),
    new THREE.Vector3(-0.16, 0.05, -0.19),
    new THREE.Vector3(-0.13, -0.36, -0.16)
  ]);
  const sashGeo = new THREE.TubeGeometry(sashCurve, 28, 0.098, 12, false);
  sashGeo.scale(1.12, 1, 0.46);
  sculpt(garments, sashGeo, M.tunic);

  sculpt(garments, new THREE.CylinderGeometry(0.048, 0.048, 0.018, 20), M.goldPolished, [-0.21, 0.41, 0.13], [-0.35, -0.25, 0]);

  const beltGeo = new THREE.TorusGeometry(0.25, 0.022, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.goldPolished, [0, -0.34, 0.008], [0.05, 0, -0.03], [1.06, 1, 0.80]);
  sculpt(garments, new THREE.OctahedronGeometry(0.028, 0), M.solarCore, [0, -0.34, 0.205]);

  const skirtGeo = new THREE.CylinderGeometry(0.25, 0.52, 0.82, 48, 18, true);
  const skPos = skirtGeo.attributes.position;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.41 - y) / 0.82));
    const pleat = Math.sin(angle * 14) * 0.028 * (0.25 + normY * 0.92);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.05;
    z = Math.sin(angle) * r * 0.82 - normY * 0.08;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.tunic, [0, -0.74, 0], [0.04, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.32, 1.84, 24, 32);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.92 - y) / 1.84));
    const archZ = -0.17 - Math.cos((x / 0.66) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.50;
    const fx = x * (0.62 + normY * 0.74);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.scarletSolarCloak, [0, -0.44, -0.04]);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    solarBow,
    bowString,
    bowStringNockY,
    bowStringNockZ,
    nockedArrow,
    arrowAnchor,
    arrowGlow,
    solarHaloGroup,
    hairCurls,
    lyreOrbitGroup,
    lyre,
    lyreStrings,
    skirtMesh,
    skirtBase,
    cape,
    capeBase,
  };
}

export function animateApollo(
  apollo: ApolloParts,
  dt: number,
  t: number,
  mode: 'pairar' | 'voo' | 'flecha' | 'helio' = 'pairar'
): void {
  const hoverY = Math.sin(t * 1.65) * 0.09;
  let pitch = 0.05, roll = 0;

  if (mode === 'voo') {
    pitch = 0.22;
    roll = -0.28;
  }

  apollo.body.position.y = 1.12 + hoverY;
  apollo.body.rotation.set(pitch, 0, roll);

  apollo.legs.L.hip.rotation.x = -0.34 + Math.sin(t * 2.0) * 0.04;
  apollo.legs.R.hip.rotation.x = 0.22 - Math.sin(t * 2.0) * 0.04;

  let drawTension = 0;
  if (mode === 'flecha') {
    apollo.leftArm.arm.rotation.set(-1.35, -0.35, -0.35);
    apollo.leftArm.elbow.rotation.set(-0.15, 0, 0);
    apollo.solarBow.rotation.set(0, 0, 0.15);

    drawTension = Math.max(0, Math.sin(t * 4.5));
    apollo.rightArm.arm.rotation.set(-1.25, 0.25, 0.65);
    apollo.rightArm.elbow.rotation.set(-1.35 + drawTension * 0.35, 0.2, 0.15);
    apollo.nockedArrow.visible = drawTension > 0.15;
  } else if (mode === 'helio') {
    apollo.nockedArrow.visible = true;
    apollo.leftArm.arm.rotation.set(-0.45, -0.25, -2.25 + Math.sin(t * 2) * 0.04);
    apollo.leftArm.elbow.rotation.set(-0.35, -0.1, 0);
    apollo.rightArm.arm.rotation.set(-0.45, 0.25, 2.25 + Math.cos(t * 2) * 0.04);
    apollo.rightArm.elbow.rotation.set(-0.35, 0.1, 0);
    apollo.solarBow.rotation.set(0, 0, 0);
  } else {
    apollo.nockedArrow.visible = true;
    apollo.leftArm.arm.rotation.set(-0.62, -0.35, -0.55 + Math.sin(t * 1.4) * 0.03);
    apollo.leftArm.elbow.rotation.set(-0.52, -0.2, 0.15);
    apollo.solarBow.rotation.set(0.15, 0, 0.25);

    apollo.rightArm.arm.rotation.set(-0.28, 0.18, 0.58 + Math.cos(t * 1.4) * 0.03);
    apollo.rightArm.elbow.rotation.set(-0.78, 0.2, 0.22);
  }

  const sAttr = apollo.bowString.geometry.attributes.position;
  sAttr.setXYZ(0, 0, apollo.bowStringNockY, apollo.bowStringNockZ);
  sAttr.setXYZ(1, 0, 0, apollo.bowStringNockZ - drawTension * 0.36);
  sAttr.setXYZ(2, 0, -apollo.bowStringNockY, apollo.bowStringNockZ);
  sAttr.needsUpdate = true;

  apollo.solarHaloGroup.rotation.z += dt * (0.45 + (mode === 'helio' ? 1.2 : 0));

  const lyreAng = -t * 0.75 + 0.55;
  apollo.lyreOrbitGroup.position.set(
    Math.cos(lyreAng) * 1.02,
    2.18 + Math.sin(t * 2.2) * 0.11,
    Math.sin(lyreAng) * 1.02
  );
  apollo.lyreOrbitGroup.rotation.y = -lyreAng + Math.PI / 2;
  apollo.lyre.rotation.z = Math.sin(t * 1.8) * 0.06;

  for (const ls of apollo.lyreStrings) {
    const vib = Math.sin(t * 28 + ls.phase) * 0.0022;
    ls.front.position.x = ls.baseX + vib;
    ls.back.position.x = ls.baseX - vib;
  }

  apollo.arrowGlow.scale.setScalar(0.9 + Math.sin(t * 14) * 0.2 + drawTension * 0.4);

  const wind = (mode === 'voo' || mode === 'helio') ? 1.85 : 1.0;
  for (const c of apollo.hairCurls) {
    c.mesh.position.y = c.baseY + Math.sin(t * 2.6 * wind + c.phase) * 0.007;
  }

  const cAttr = apollo.cape.geometry.attributes.position;
  for (let i = 0; i < cAttr.count; i++) {
    const bx = apollo.capeBase[i * 3];
    const by = apollo.capeBase[i * 3 + 1];
    const bz = apollo.capeBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.92 - by) / 1.84));
    const wave1 = Math.sin(t * 3.2 * wind - normY * 4.5 + bx * 2.5) * 0.13 * normY;
    const wave2 = Math.cos(t * 2.2 * wind - normY * 3.0) * 0.055 * normY;
    cAttr.setXYZ(i, bx + Math.sin(t * 2.4 - normY * 3.0) * 0.032 * normY, by, bz + wave1 + wave2);
  }
  cAttr.needsUpdate = true;
  apollo.cape.geometry.computeVertexNormals();

  const skAttr = apollo.skirtMesh.geometry.attributes.position;
  for (let i = 0; i < skAttr.count; i++) {
    const bx = apollo.skirtBase[i * 3];
    const by = apollo.skirtBase[i * 3 + 1];
    const bz = apollo.skirtBase[i * 3 + 2];
    const normY = Math.max(0, Math.min(1, (0.41 - by) / 0.82));
    skAttr.setZ(i, bz + Math.sin(t * 3.4 * wind - normY * 4.0 + bx * 4.0) * 0.038 * normY);
  }
  skAttr.needsUpdate = true;
  apollo.skirtMesh.geometry.computeVertexNormals();
}
