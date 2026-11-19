import * as THREE from 'three';

export type HopliteAction = 'guarda' | 'marcha' | 'corrida' | 'ataque' | 'defesa';
export type HopliteTierId = 1 | 2 | 3 | 4;

export interface BaseHopliteTierSpec {
  tier: HopliteTierId;
  id: string;
  name: string;
  subtitle: string;
  armorHex: number;
  accentHex: number;
  greaveHex: number;
  metalness: number;
  roughness: number;
  shieldRimHex: number;
  shieldBgHex: number;
  crestColorHex: number;
  cloakColorHex: number;
  glowIntensity: number;
}

export interface HopliteMaterialBundle {
  skin: THREE.MeshStandardMaterial;
  beard: THREE.MeshStandardMaterial;
  armorMain: THREE.MeshStandardMaterial;
  armorAccent: THREE.MeshStandardMaterial;
  greaveMat: THREE.MeshStandardMaterial;
  leatherMat: THREE.MeshStandardMaterial;
  chitonMat: THREE.MeshStandardMaterial;
  crestMat: THREE.MeshStandardMaterial;
  cloakMat: THREE.MeshStandardMaterial;
  shieldMat: THREE.MeshStandardMaterial;
  spearShaftMat: THREE.MeshStandardMaterial;
  glowMat: THREE.MeshStandardMaterial;
}

export interface BaseHopliteRig {
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
  spear: THREE.Group;
  thrustCone: THREE.Mesh;
  spearTipAnchor: THREE.Group;
  hoplonShield: THREE.Group;
  crestSegments: Array<{ mesh: THREE.Mesh; phase: number; factor: number }>;
  cape: THREE.Mesh;
  capeBase: Float32Array;
  getTier: () => HopliteTierId;
  setTier: (tier: HopliteTierId) => void;
  animState: {
    hx: number;
    hz: number;
    thrustTimer: number;
    sparkTriggered: boolean;
    blockTimer: number;
    blockSparkDone: boolean;
  };
}

export interface HopliteVariantHooks {
  initialTier: HopliteTierId;
  getTierSpec: (tier: HopliteTierId) => BaseHopliteTierSpec;
  createShieldTexture: (tier: HopliteTierId) => THREE.CanvasTexture;
  skinBump: THREE.CanvasTexture;
  chitonTex: THREE.CanvasTexture;
  skinHex?: number;
  beardHex?: number;
  leatherHex?: number;
  spearShaftHex?: number;
  armorAccentEmissiveHex?: number;
  crestEmissiveHex?: number;
  cloakEmissiveHex?: number;
  glowColorHex: number;
  glowEmissiveHex: number;
  eyeEmissiveHex: number;
  eyeEmissiveIntensity: number;
  thrustConeHex: number;
  thrustConeRadius?: number;
  thrustConeHeight?: number;
  thrustConeY?: number;
  thrustConeMaxOpacity?: number;
  spearTipY?: number;
  attachChestEmblem: (torso: THREE.Group, mats: HopliteMaterialBundle, tier2Parts: THREE.Object3D[]) => void;
  attachHelmOrnament: (helm: THREE.Group, mats: HopliteMaterialBundle, tier4Parts: THREE.Object3D[]) => void;
  attachSpearHead: (
    spearHead: THREE.Group,
    mats: HopliteMaterialBundle,
    tier3Parts: THREE.Object3D[]
  ) => void;
}

export function hopliteGroup(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

export function hopliteSculpt(
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

export function createHopliteSkinBumpTexture(): THREE.CanvasTexture {
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5500; i++) {
      const v = 122 + Math.floor(Math.random() * 14);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);
  return skinBump;
}

export function buildGreekHopliteBase(hooks: HopliteVariantHooks): BaseHopliteRig {
  const spec0 = hooks.getTierSpec(hooks.initialTier);

  const M: HopliteMaterialBundle = {
    skin: new THREE.MeshStandardMaterial({
      color: hooks.skinHex ?? 0xc98a5b,
      roughness: 0.44,
      metalness: 0.06,
      bumpMap: hooks.skinBump,
      bumpScale: 0.0035,
    }),
    beard: new THREE.MeshStandardMaterial({
      color: hooks.beardHex ?? 0x292524,
      roughness: 0.65,
    }),
    armorMain: new THREE.MeshStandardMaterial({
      color: spec0.armorHex,
      metalness: spec0.metalness,
      roughness: spec0.roughness,
    }),
    armorAccent: new THREE.MeshStandardMaterial({
      color: spec0.accentHex,
      emissive: new THREE.Color(hooks.armorAccentEmissiveHex ?? 0x3b2200),
      emissiveIntensity: 0.25,
      metalness: 0.9,
      roughness: 0.2,
    }),
    greaveMat: new THREE.MeshStandardMaterial({
      color: spec0.greaveHex,
      metalness: spec0.metalness,
      roughness: spec0.roughness,
    }),
    leatherMat: new THREE.MeshStandardMaterial({
      color: hooks.leatherHex ?? 0x451a03,
      roughness: 0.72,
    }),
    chitonMat: new THREE.MeshStandardMaterial({
      map: hooks.chitonTex,
      roughness: 0.56,
      side: THREE.DoubleSide,
    }),
    crestMat: new THREE.MeshStandardMaterial({
      color: spec0.crestColorHex,
      emissive: new THREE.Color(hooks.crestEmissiveHex ?? 0x1e293b),
      emissiveIntensity: 0.25,
      roughness: 0.45,
    }),
    cloakMat: new THREE.MeshStandardMaterial({
      color: spec0.cloakColorHex,
      emissive: new THREE.Color(hooks.cloakEmissiveHex ?? 0x091326),
      emissiveIntensity: 0.25,
      roughness: 0.54,
      side: THREE.DoubleSide,
    }),
    shieldMat: new THREE.MeshStandardMaterial({
      map: hooks.createShieldTexture(hooks.initialTier),
      metalness: 0.78,
      roughness: 0.26,
      side: THREE.DoubleSide,
    }),
    spearShaftMat: new THREE.MeshStandardMaterial({
      color: hooks.spearShaftHex ?? 0x5c2d16,
      roughness: 0.62,
    }),
    glowMat: new THREE.MeshStandardMaterial({
      color: hooks.glowColorHex,
      emissive: new THREE.Color(hooks.glowEmissiveHex),
      emissiveIntensity: spec0.glowIntensity,
      roughness: 0.1,
    }),
  };

  const root = new THREE.Group();
  const body = hopliteGroup(root, 0, 1.04, 0);

  const tier2Parts: THREE.Object3D[] = [];
  const tier3Parts: THREE.Object3D[] = [];
  const tier4Parts: THREE.Object3D[] = [];

  const pelvis = hopliteGroup(body, 0, 0.88, 0);
  hopliteSculpt(pelvis, new THREE.SphereGeometry(0.24, 20, 18), M.leatherMat, [0, 0, 0], [0, 0, 0], [1.14, 0.78, 0.85]);

  const legs = {
    L: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
    R: { hip: new THREE.Group(), knee: new THREE.Group(), ankle: new THREE.Group() },
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = hopliteGroup(pelvis, s * 0.155, -0.04, 0);

    hopliteSculpt(hip, new THREE.CylinderGeometry(0.145, 0.105, 0.48, 18), M.skin, [0, -0.23, 0], [0, 0, 0], [1.04, 1, 1.08]);
    hopliteSculpt(hip, new THREE.SphereGeometry(0.112, 14, 14), M.skin, [s * 0.02, -0.2, 0.048], [0, 0, 0], [0.96, 1.8, 0.86]);
    hopliteSculpt(hip, new THREE.SphereGeometry(0.088, 14, 14), M.skin, [0, -0.48, 0.015]);

    const knee = hopliteGroup(hip, 0, -0.49, 0);
    hopliteSculpt(knee, new THREE.CylinderGeometry(0.09, 0.056, 0.44, 16), M.skin, [0, -0.22, 0]);
    hopliteSculpt(knee, new THREE.SphereGeometry(0.085, 14, 14), M.skin, [0, -0.15, -0.038], [0, 0, 0], [0.98, 1.65, 0.96]);

    hopliteSculpt(
      knee,
      new THREE.CylinderGeometry(0.092, 0.06, 0.35, 16, 1, false, -0.88, 1.76),
      M.greaveMat,
      [0, -0.22, 0.01]
    );
    const kneeCap = hopliteSculpt(
      knee,
      new THREE.ConeGeometry(0.048, 0.1, 5),
      M.armorAccent,
      [0, -0.02, 0.082],
      [0.15, 0, 0],
      [1.1, 1, 0.42]
    );
    tier2Parts.push(kneeCap);

    const ankle = hopliteGroup(knee, 0, -0.44, 0.02);
    hopliteSculpt(ankle, new THREE.BoxGeometry(0.098, 0.052, 0.22), M.leatherMat, [0, -0.02, 0.038]);
    hopliteSculpt(ankle, new THREE.BoxGeometry(0.106, 0.018, 0.232), M.greaveMat, [0, -0.046, 0.038]);

    legs[side] = { hip, knee, ankle };
  }

  legs.L.hip.rotation.set(-0.22, -0.14, -0.1);
  legs.L.knee.rotation.set(0.28, 0, 0);
  legs.R.hip.rotation.set(0.18, 0.16, 0.12);
  legs.R.knee.rotation.set(0.22, 0, 0);

  const torso = hopliteGroup(body, 0, 1.3, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.43),
    new THREE.Vector2(0.26, -0.39),
    new THREE.Vector2(0.24, -0.19),
    new THREE.Vector2(0.3, 0.04),
    new THREE.Vector2(0.39, 0.27),
    new THREE.Vector2(0.34, 0.42),
    new THREE.Vector2(0.15, 0.49),
    new THREE.Vector2(0.01, 0.5),
  ];
  hopliteSculpt(torso, new THREE.LatheGeometry(torsoPts, 32), M.skin, [0, 0, 0], [0, 0, 0], [1.18, 1.02, 0.75]);

  const cuirassPts = [
    new THREE.Vector2(0.01, -0.36),
    new THREE.Vector2(0.27, -0.32),
    new THREE.Vector2(0.255, -0.15),
    new THREE.Vector2(0.315, 0.05),
    new THREE.Vector2(0.405, 0.27),
    new THREE.Vector2(0.34, 0.39),
    new THREE.Vector2(0.19, 0.42),
    new THREE.Vector2(0.01, 0.42),
  ];
  hopliteSculpt(torso, new THREE.LatheGeometry(cuirassPts, 36), M.armorMain, [0, 0.01, 0], [0, 0, 0], [1.19, 1.0, 0.78]);

  for (const side of [-1, 1]) {
    hopliteSculpt(torso, new THREE.BoxGeometry(0.085, 0.03, 0.32), M.armorAccent, [side * 0.22, 0.4, 0.01], [0.1, 0, side * -0.12]);
  }

  const pecArmorGeo = new THREE.SphereGeometry(0.2, 20, 20);
  const pecArmorL = hopliteSculpt(torso, pecArmorGeo, M.armorMain, [-0.18, 0.22, 0.175], [0.12, -0.22, -0.14], [1.05, 0.85, 0.55]);
  const pecArmorR = hopliteSculpt(torso, pecArmorGeo, M.armorMain, [0.18, 0.22, 0.175], [0.12, 0.22, 0.14], [1.05, 0.85, 0.55]);
  tier3Parts.push(pecArmorL, pecArmorR);

  const abArmorGeo = new THREE.SphereGeometry(0.082, 12, 12);
  [0.03, -0.08, -0.19].forEach((ay) => {
    const abL = hopliteSculpt(torso, abArmorGeo, M.armorMain, [-0.072, ay, 0.225], [0, 0, 0], [1.0, 0.75, 0.45]);
    const abR = hopliteSculpt(torso, abArmorGeo, M.armorMain, [0.072, ay, 0.225], [0, 0, 0], [1.0, 0.75, 0.45]);
    tier3Parts.push(abL, abR);
  });

  hooks.attachChestEmblem(torso, M, tier2Parts);

  const gorget = new THREE.TorusGeometry(0.21, 0.024, 10, 32);
  gorget.rotateX(Math.PI / 2);
  const gorgetMesh = hopliteSculpt(torso, gorget, M.armorAccent, [0, 0.41, 0.01], [0.16, 0, 0], [1.15, 1, 0.9]);
  tier4Parts.push(gorgetMesh);

  hopliteSculpt(torso, new THREE.CylinderGeometry(0.115, 0.145, 0.24, 18), M.skin, [0, 0.51, -0.008], [0.06, 0, 0]);

  const head = hopliteGroup(torso, 0, 0.72, 0.032);
  hopliteSculpt(head, new THREE.SphereGeometry(0.185, 28, 28), M.skin, [0, 0, 0], [0, 0, 0], [0.92, 1.14, 0.98]);
  hopliteSculpt(
    head,
    new THREE.CylinderGeometry(0.16, 0.14, 0.1, 20, 1, false, -Math.PI * 0.4, Math.PI * 0.8),
    M.beard,
    [0, -0.1, 0.04],
    [0.1, 0, 0],
    [0.95, 1, 1.04]
  );
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(hooks.eyeEmissiveHex),
    emissiveIntensity: hooks.eyeEmissiveIntensity,
  });
  hopliteSculpt(head, new THREE.SphereGeometry(0.018, 12, 12), eyeMat, [-0.048, 0.02, 0.172], [0, 0, 0], [1.15, 0.7, 0.8]);
  hopliteSculpt(head, new THREE.SphereGeometry(0.018, 12, 12), eyeMat, [0.048, 0.02, 0.172], [0, 0, 0], [1.15, 0.7, 0.8]);

  const helm = hopliteGroup(head, 0, 0.032, -0.004);
  hopliteSculpt(
    helm,
    new THREE.SphereGeometry(0.205, 30, 22, 0, Math.PI * 2, 0, Math.PI * 0.56),
    M.armorMain,
    [0, 0.02, 0],
    [-0.08, 0, 0],
    [0.98, 1.08, 1.06]
  );
  hopliteSculpt(helm, new THREE.BoxGeometry(0.02, 0.105, 0.028), M.armorAccent, [0, 0.03, 0.204], [-0.06, 0, 0]);
  for (const side of [-1, 1]) {
    const cheek = hopliteGroup(helm, side * 0.148, -0.042, 0.102);
    cheek.rotation.set(0.08, side * 0.5, side * -0.12);
    hopliteSculpt(cheek, new THREE.BoxGeometry(0.02, 0.15, 0.12), M.armorMain);
  }
  hopliteSculpt(
    helm,
    new THREE.CylinderGeometry(0.195, 0.22, 0.13, 22, 1, true, Math.PI * 0.62, Math.PI * 0.76),
    M.armorMain,
    [0, -0.068, -0.014],
    [0.12, 0, 0]
  );

  const crestMount = hopliteGroup(helm, 0, 0.22, -0.01);
  hopliteSculpt(crestMount, new THREE.BoxGeometry(0.032, 0.075, 0.28), M.armorAccent, [0, 0, 0], [-0.08, 0, 0]);
  const crestSegments: Array<{ mesh: THREE.Mesh; phase: number; factor: number }> = [];
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const ang = -0.5 + t * 2.45;
    const r = 0.23;
    const cy = Math.cos(ang) * r * 0.88 - 0.03;
    const cz = Math.sin(ang) * r * 1.12 - 0.03;
    const seg = hopliteSculpt(
      crestMount,
      new THREE.BoxGeometry(0.024, 0.14 + Math.sin(t * Math.PI) * 0.05, 0.032),
      M.crestMat,
      [0, cy, cz],
      [ang, 0, 0]
    );
    crestSegments.push({ mesh: seg, phase: i * 0.45, factor: 0.3 + t * 0.9 });
  }
  tier2Parts.push(crestMount);

  hooks.attachHelmOrnament(helm, M, tier4Parts);

  function createHopliteArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = hopliteGroup(torso, s * 0.42, 0.33, -0.008);

    const pauldronT2 = hopliteSculpt(
      arm,
      new THREE.SphereGeometry(0.165, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
      M.armorMain,
      [s * 0.015, 0.035, 0],
      [0, 0, s * -0.32],
      [1.12, 0.76, 1.15]
    );
    tier2Parts.push(pauldronT2);

    const pauldronT4 = hopliteSculpt(
      arm,
      new THREE.SphereGeometry(0.185, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.42),
      M.armorAccent,
      [s * 0.02, 0.06, 0],
      [0, 0, s * -0.35],
      [1.14, 0.72, 1.16]
    );
    tier4Parts.push(pauldronT4);

    hopliteSculpt(arm, new THREE.SphereGeometry(0.128, 16, 16), M.skin, [0, -0.01, 0]);
    hopliteSculpt(arm, new THREE.CapsuleGeometry(0.085, 0.26, 12, 16), M.skin, [s * 0.022, -0.17, 0], [0, 0, s * 0.07]);

    const elbow = hopliteGroup(arm, s * 0.04, -0.34, 0);
    hopliteSculpt(elbow, new THREE.CylinderGeometry(0.082, 0.054, 0.31, 16), M.skin, [0, -0.15, 0]);

    const bracer = hopliteSculpt(elbow, new THREE.CylinderGeometry(0.066, 0.058, 0.11, 20, 1, true), M.armorAccent, [0, -0.24, 0]);
    tier2Parts.push(bracer);

    const hand = hopliteGroup(elbow, 0, -0.32, 0);
    hopliteSculpt(hand, new THREE.BoxGeometry(0.068, 0.078, 0.034), M.skin, [0, -0.018, 0]);

    return { arm, elbow, hand };
  }

  const rightArm = createHopliteArm(true);
  const leftArm = createHopliteArm(false);

  const spear = new THREE.Group();
  rightArm.hand.add(spear);
  spear.position.set(0, -0.035, 0.032);
  spear.rotation.set(Math.PI / 2, 0, 0);

  hopliteSculpt(spear, new THREE.CylinderGeometry(0.02, 0.023, 2.75, 14), M.spearShaftMat, [0, 0.35, 0]);
  hopliteSculpt(spear, new THREE.ConeGeometry(0.034, 0.22, 8), M.armorAccent, [0, -1.12, 0], [Math.PI, 0, 0]);

  const spearHead = hopliteGroup(spear, 0, 1.72, 0);
  hooks.attachSpearHead(spearHead, M, tier3Parts);

  const thrustCone = new THREE.Mesh(
    new THREE.ConeGeometry(hooks.thrustConeRadius ?? 0.24, hooks.thrustConeHeight ?? 0.95, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: hooks.thrustConeHex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  thrustCone.position.set(0, hooks.thrustConeY ?? 0.38, 0);
  thrustCone.userData.maxOpacity = hooks.thrustConeMaxOpacity ?? 0.8;
  spearHead.add(thrustCone);

  const spearTipAnchor = hopliteGroup(spearHead, 0, hooks.spearTipY ?? 0.52, 0);

  const hoplonShield = hopliteGroup(leftArm.elbow, -0.055, -0.22, 0.02);
  hoplonShield.rotation.set(0, -Math.PI / 2, 0);

  const shieldDomeGeo = new THREE.SphereGeometry(0.6, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.28);
  shieldDomeGeo.rotateX(Math.PI / 2);
  hopliteSculpt(hoplonShield, shieldDomeGeo, M.shieldMat, [0, 0, -0.46]);
  hopliteSculpt(hoplonShield, new THREE.TorusGeometry(0.57, 0.028, 10, 44), M.armorAccent, [0, 0, 0.02]);

  const garments = hopliteGroup(torso, 0, 0, 0);
  const beltGeo = new THREE.TorusGeometry(0.275, 0.028, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  hopliteSculpt(garments, beltGeo, M.leatherMat, [0, -0.35, 0.01], [0.05, 0, -0.03], [1.12, 1, 0.84]);
  hopliteSculpt(garments, new THREE.BoxGeometry(0.11, 0.085, 0.026), M.armorAccent, [0, -0.35, 0.24]);

  const pterugesGroup = hopliteGroup(garments, 0, -0.38, 0);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    hopliteSculpt(
      pterugesGroup,
      new THREE.BoxGeometry(0.078, 0.34, 0.016),
      i % 2 === 0 ? M.leatherMat : M.armorMain,
      [Math.sin(a) * 0.28, -0.17, Math.cos(a) * 0.22],
      [Math.cos(a) * 0.14, a, -Math.sin(a) * 0.14]
    );
  }
  tier2Parts.push(pterugesGroup);

  const skirtGeo = new THREE.CylinderGeometry(0.26, 0.48, 0.64, 44, 16, true);
  const skPos = skirtGeo.attributes.position;
  for (let i = 0; i < skPos.count; i++) {
    const x = skPos.getX(i);
    const y = skPos.getY(i);
    const z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = Math.max(0, Math.min(1, (0.32 - y) / 0.64));
    const pleat = Math.sin(angle * 16) * 0.024 * (0.2 + normY * 0.9);
    const r = Math.sqrt(x * x + z * z) + pleat;
    skPos.setXYZ(i, Math.cos(angle) * r * 1.06, y, Math.sin(angle) * r * 0.84);
  }
  skirtGeo.computeVertexNormals();
  hopliteSculpt(garments, skirtGeo, M.chitonMat, [0, -0.62, 0], [0.04, 0, 0]);

  const capeGeo = new THREE.PlaneGeometry(1.32, 1.76, 22, 28);
  const cPos = capeGeo.attributes.position;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i);
    const y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.88 - y) / 1.76));
    const archZ = -0.17 - Math.cos((x / 0.66) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.48;
    const fx = x * (0.62 + normY * 0.74);
    cPos.setXYZ(i, fx, y, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = y;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = hopliteSculpt(garments, capeGeo, M.cloakMat, [0, -0.44, -0.04]);
  tier3Parts.push(cape);

  let currentTier: HopliteTierId = hooks.initialTier;

  function applyTier(tier: HopliteTierId) {
    currentTier = tier;
    root.userData.armorTier = tier;
    const nextSpec = hooks.getTierSpec(tier);

    M.armorMain.color.setHex(nextSpec.armorHex);
    M.armorMain.metalness = nextSpec.metalness;
    M.armorMain.roughness = nextSpec.roughness;

    M.armorAccent.color.setHex(nextSpec.accentHex);
    M.greaveMat.color.setHex(nextSpec.greaveHex);
    M.greaveMat.metalness = nextSpec.metalness;
    M.greaveMat.roughness = nextSpec.roughness;

    M.crestMat.color.setHex(nextSpec.crestColorHex);
    M.cloakMat.color.setHex(nextSpec.cloakColorHex);
    M.glowMat.emissiveIntensity = nextSpec.glowIntensity;

    if (M.shieldMat.map) M.shieldMat.map.dispose();
    M.shieldMat.map = hooks.createShieldTexture(tier);
    M.shieldMat.needsUpdate = true;

    tier2Parts.forEach((p) => {
      p.visible = tier >= 2;
    });
    tier3Parts.forEach((p) => {
      p.visible = tier >= 3;
    });
    tier4Parts.forEach((p) => {
      p.visible = tier >= 4;
    });
  }

  root.userData.setArmorTier = (t: number) => applyTier((t as HopliteTierId) || 3);
  applyTier(hooks.initialTier);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    spear,
    thrustCone,
    spearTipAnchor,
    hoplonShield,
    crestSegments,
    cape,
    capeBase,
    getTier: () => currentTier,
    setTier: applyTier,
    animState: {
      hx: 0,
      hz: 0,
      thrustTimer: 0,
      sparkTriggered: false,
      blockTimer: 0,
      blockSparkDone: false,
    },
  };
}

const _sparkTmpV = new THREE.Vector3();

export function animateGreekHopliteBase(
  hoplite: BaseHopliteRig,
  dt: number,
  t: number,
  action: HopliteAction = 'guarda',
  onEffect?: (pos: THREE.Vector3) => void
): void {
  let hy = 0;
  let yaw = Math.sin(t * 0.35) * 0.12;
  let pitch = 0.02;
  let roll = 0;
  let torsoYaw = 0;
  const breath = Math.sin(t * 2.2) * 0.022;

  const st = hoplite.animState;
  const maxThrustOpacity = (hoplite.thrustCone.userData.maxOpacity as number | undefined) ?? 0.8;

  if (action === 'marcha') {
    const a = t * 0.85;
    const R = 2.65;
    st.hx = Math.cos(a) * R;
    st.hz = Math.sin(a) * R;
    yaw = -a;
    pitch = 0.07;
    roll = -0.06;

    const stride = t * 5.2;
    const sinS = Math.sin(stride);
    const cosS = Math.cos(stride);
    hy = Math.abs(cosS) * 0.045;
    torsoYaw = sinS * 0.08;

    hoplite.legs.L.hip.rotation.x = -0.16 + sinS * 0.36;
    hoplite.legs.L.knee.rotation.x = 0.22 + Math.max(0, -cosS) * 0.36;
    hoplite.legs.R.hip.rotation.x = -0.16 - sinS * 0.36;
    hoplite.legs.R.knee.rotation.x = 0.22 + Math.max(0, cosS) * 0.36;

    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    hoplite.leftArm.arm.rotation.set(-0.68, -0.42, -0.4);
    hoplite.leftArm.elbow.rotation.set(-0.92, -0.22, 0.22);
    hoplite.rightArm.arm.rotation.set(-0.78 - sinS * 0.12, 0.18, 0.45);
    hoplite.rightArm.elbow.rotation.set(-0.58 + sinS * 0.1, 0.15, 0.2);
  } else if (action === 'corrida') {
    const a = t * 1.65;
    const R = 2.85;
    st.hx = Math.cos(a) * R;
    st.hz = Math.sin(a) * R;
    yaw = -a;
    pitch = 0.24;
    roll = -0.22;

    const stride = t * 10.5;
    const sinS = Math.sin(stride);
    const cosS = Math.cos(stride);
    hy = Math.abs(cosS) * 0.11;
    torsoYaw = sinS * 0.14;

    hoplite.legs.L.hip.rotation.x = -0.35 + sinS * 0.62;
    hoplite.legs.L.knee.rotation.x = 0.45 + Math.max(0, -cosS) * 0.65;
    hoplite.legs.R.hip.rotation.x = -0.35 - sinS * 0.62;
    hoplite.legs.R.knee.rotation.x = 0.45 + Math.max(0, cosS) * 0.65;

    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    hoplite.leftArm.arm.rotation.set(-0.82, -0.52, -0.36);
    hoplite.leftArm.elbow.rotation.set(-1.05, -0.28, 0.24);
    hoplite.rightArm.arm.rotation.set(-1.12 - sinS * 0.18, 0.16, 0.4);
    hoplite.rightArm.elbow.rotation.set(-0.78 + sinS * 0.14, 0.15, 0.18);
  } else if (action === 'ataque') {
    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    const prevTimer = st.thrustTimer;
    st.thrustTimer = (st.thrustTimer + dt * 1.45) % 1.0;
    if (st.thrustTimer < prevTimer) st.sparkTriggered = false;

    if (st.thrustTimer < 0.28) {
      const p = st.thrustTimer / 0.28;
      const ease = p * p;
      torsoYaw = -0.25 * ease;
      pitch = 0.04 * ease;
      st.hz = -0.15 * ease;

      hoplite.legs.L.hip.rotation.set(-0.25, -0.14, -0.1);
      hoplite.legs.L.knee.rotation.set(0.32, 0, 0);
      hoplite.legs.R.hip.rotation.set(0.22, 0.16, 0.12);
      hoplite.legs.R.knee.rotation.set(0.26, 0, 0);

      const armX = -0.85 * (1 - ease) + 0.52 * ease;
      const elbowX = -0.55 * (1 - ease) - 1.32 * ease;
      const armZ = 0.45 * (1 - ease) + 0.06 * ease;
      const elbowZ = 0.2 * (1 - ease);

      hoplite.rightArm.arm.rotation.set(armX, 0.05, armZ);
      hoplite.rightArm.elbow.rotation.set(elbowX, 0.0, elbowZ);
      hoplite.spear.rotation.set(Math.PI / 2 - (armX + elbowX), 0, -(armZ + elbowZ));

      hoplite.leftArm.arm.rotation.set(-0.78, -0.48, -0.35);
      hoplite.leftArm.elbow.rotation.set(-1.05, -0.25, 0.24);
      (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;
    } else if (st.thrustTimer < 0.52) {
      const p = (st.thrustTimer - 0.28) / 0.24;
      const lunge = Math.sin(p * Math.PI * 0.5);
      torsoYaw = -0.25 + 0.55 * lunge;
      pitch = 0.04 + 0.12 * lunge;
      st.hz = -0.15 + 0.65 * lunge;
      hy = -0.07 * lunge;

      hoplite.legs.L.hip.rotation.set(-0.25 - 0.34 * lunge, -0.14, -0.1);
      hoplite.legs.L.knee.rotation.set(0.32 + 0.32 * lunge, 0, 0);
      hoplite.legs.R.hip.rotation.set(0.22 + 0.3 * lunge, 0.16, 0.12);
      hoplite.legs.R.knee.rotation.set(0.26 - 0.14 * lunge, 0, 0);

      const armX = 0.52 - 1.98 * lunge;
      const elbowX = -1.32 + 1.26 * lunge;
      const armZ = 0.06 * (1 - lunge);

      hoplite.rightArm.arm.rotation.set(armX, 0.02, armZ);
      hoplite.rightArm.elbow.rotation.set(elbowX, 0.0, 0.0);
      hoplite.spear.rotation.set(Math.PI / 2 - (armX + elbowX) - pitch, 0, -armZ);

      hoplite.leftArm.arm.rotation.set(-0.62, -0.65, -0.48);
      hoplite.leftArm.elbow.rotation.set(-0.95, -0.28, 0.22);

      (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * maxThrustOpacity;
      hoplite.thrustCone.scale.set(1, 0.85 + lunge * 0.65, 1);

      if (lunge > 0.88 && !st.sparkTriggered) {
        st.sparkTriggered = true;
        hoplite.root.updateMatrixWorld(true);
        hoplite.spearTipAnchor.getWorldPosition(_sparkTmpV);
        onEffect?.(_sparkTmpV);
      }
    } else {
      const k = (st.thrustTimer - 0.52) / 0.48;
      const rem = 1 - k;
      torsoYaw = 0.3 * rem;
      pitch = 0.16 * rem;
      st.hz = 0.5 * rem;
      hy = -0.07 * rem;

      hoplite.legs.L.hip.rotation.set(-0.22 - 0.37 * rem, -0.14, -0.1);
      hoplite.legs.L.knee.rotation.set(0.28 + 0.36 * rem, 0, 0);
      hoplite.legs.R.hip.rotation.set(0.18 + 0.34 * rem, 0.16, 0.12);
      hoplite.legs.R.knee.rotation.set(0.22 - 0.1 * rem, 0, 0);

      const armX = -1.46 * rem - 0.85 * k;
      const elbowX = -0.06 * rem - 0.55 * k;
      const armZ = 0.45 * k;
      const elbowZ = 0.2 * k;

      hoplite.rightArm.arm.rotation.set(armX, 0.02 * rem + 0.18 * k, armZ);
      hoplite.rightArm.elbow.rotation.set(elbowX, 0.15 * k, elbowZ);
      hoplite.spear.rotation.set(Math.PI / 2 - (armX + elbowX) * rem - pitch, 0, -(armZ + elbowZ) * rem);

      hoplite.leftArm.arm.rotation.set(-0.62 * rem - 0.68 * k, -0.65 * rem - 0.42 * k, -0.48 * rem - 0.42 * k);
      hoplite.leftArm.elbow.rotation.set(-0.95 * rem - 0.92 * k, -0.25, 0.22);
      (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  } else if (action === 'defesa') {
    hoplite.spear.rotation.set(Math.PI / 2, 0, 0);
    (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;

    const prevBlock = st.blockTimer;
    st.blockTimer = (st.blockTimer + dt * 0.85) % 1.0;
    if (st.blockTimer < prevBlock) st.blockSparkDone = false;

    const hitPulse =
      st.blockTimer > 0.45 && st.blockTimer < 0.72
        ? Math.sin(((st.blockTimer - 0.45) / 0.27) * Math.PI)
        : 0;

    if (hitPulse > 0.85 && !st.blockSparkDone) {
      st.blockSparkDone = true;
      hoplite.root.updateMatrixWorld(true);
      hoplite.hoplonShield.getWorldPosition(_sparkTmpV);
      _sparkTmpV.z += 0.18;
      onEffect?.(_sparkTmpV);
    }

    hy = -0.14 - hitPulse * 0.04;
    st.hz = -0.18 * hitPulse;
    pitch = 0.14 - hitPulse * 0.12;
    torsoYaw = 0.28 - hitPulse * 0.08;

    hoplite.legs.L.hip.rotation.set(-0.48 - hitPulse * 0.1, -0.18, -0.14);
    hoplite.legs.L.knee.rotation.set(0.68 + hitPulse * 0.14, 0, 0);
    hoplite.legs.R.hip.rotation.set(0.36 + hitPulse * 0.08, 0.22, 0.18);
    hoplite.legs.R.knee.rotation.set(0.56 + hitPulse * 0.12, 0, 0);

    hoplite.leftArm.arm.rotation.set(-0.72 - hitPulse * 0.08, 0.35, 0.58);
    hoplite.leftArm.elbow.rotation.set(-1.35, 0.45, -1.15);

    hoplite.hoplonShield.position.set(0.02, -0.26, 0.1 - hitPulse * 0.03);
    hoplite.hoplonShield.rotation.set(1.18, -0.22, -0.35);

    hoplite.rightArm.arm.rotation.set(-1.32 + hitPulse * 0.06, 0.16, 0.36);
    hoplite.rightArm.elbow.rotation.set(-0.62, 0.15, 0.2);
  } else {
    st.hx = 0;
    st.hz = 0;
    hoplite.hoplonShield.position.set(-0.055, -0.22, 0.02);
    hoplite.hoplonShield.rotation.set(0, -Math.PI / 2, 0);
    hoplite.spear.rotation.set(Math.PI / 2, 0, 0);
    (hoplite.thrustCone.material as THREE.MeshBasicMaterial).opacity = 0;
    hoplite.leftArm.arm.rotation.set(-0.68, -0.42, -0.42 + Math.sin(t * 1.6) * 0.02);
    hoplite.leftArm.elbow.rotation.set(-0.92, -0.22, 0.22);
    hoplite.rightArm.arm.rotation.set(-0.85, 0.18, 0.45 + Math.cos(t * 1.6) * 0.02);
    hoplite.rightArm.elbow.rotation.set(-0.55, 0.15, 0.2);

    hoplite.legs.L.hip.rotation.set(-0.22, -0.14, -0.1);
    hoplite.legs.L.knee.rotation.set(0.28, 0, 0);
    hoplite.legs.R.hip.rotation.set(0.18, 0.16, 0.12);
    hoplite.legs.R.knee.rotation.set(0.22, 0, 0);
  }

  hoplite.root.position.set(st.hx, hy, st.hz);
  hoplite.root.rotation.set(0, yaw, 0);
  hoplite.body.position.y = 1.04 + breath;
  hoplite.body.rotation.set(pitch, torsoYaw, roll);

  const wind = action === 'marcha' || action === 'corrida' ? (action === 'corrida' ? 2.4 : 1.6) : 1.0;
  for (const cs of hoplite.crestSegments) {
    cs.mesh.position.x = Math.sin(t * 3.4 * wind - cs.phase) * 0.016 * cs.factor;
  }

  if (hoplite.cape.visible) {
    const cAttr = hoplite.cape.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cAttr.count; i++) {
      const bx = hoplite.capeBase[i * 3];
      const by = hoplite.capeBase[i * 3 + 1];
      const bz = hoplite.capeBase[i * 3 + 2];
      const normY = Math.max(0, Math.min(1, (0.88 - by) / 1.76));
      const wave = Math.sin(t * 3.2 * wind - normY * 4.5 + bx * 2.5) * 0.12 * normY;
      cAttr.setXYZ(i, bx, by, bz + wave);
    }
    cAttr.needsUpdate = true;
    hoplite.cape.geometry.computeVertexNormals();
  }
}

export function buildGreekHopliteArenaColumns(opts: {
  floorTex: THREE.CanvasTexture;
  floorRoughness: number;
  floorMetalness: number;
  ringColorHex: number;
  ringOpacity: number;
  colColorHex: number;
  colRoughness: number;
  colMetalness?: number;
  capColorHex: number;
  capMetalness: number;
  capRoughness: number;
  radialSegments?: number;
  withTorches?: boolean;
}): { arena: THREE.Group; torches: { mesh: THREE.Mesh; phase: number }[] } {
  const arena = new THREE.Group();

  const arenaFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 7.5, 0.32, 72),
    new THREE.MeshStandardMaterial({
      map: opts.floorTex,
      roughness: opts.floorRoughness,
      metalness: opts.floorMetalness,
    })
  );
  arenaFloor.position.y = -0.16;
  arenaFloor.receiveShadow = true;
  arena.add(arenaFloor);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(4.45, 4.56, 72),
    new THREE.MeshBasicMaterial({
      color: opts.ringColorHex,
      transparent: true,
      opacity: opts.ringOpacity,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.015;
  arena.add(ring);

  const colMat = new THREE.MeshStandardMaterial({
    color: opts.colColorHex,
    roughness: opts.colRoughness,
    metalness: opts.colMetalness ?? 0.0,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: opts.capColorHex,
    metalness: opts.capMetalness,
    roughness: opts.capRoughness,
  });
  const torchMat = opts.withTorches
    ? new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
    : null;
  const torches: { mesh: THREE.Mesh; phase: number }[] = [];

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const col = hopliteGroup(arena, Math.cos(a) * 5.8, 0, Math.sin(a) * 5.8);
    hopliteSculpt(col, new THREE.BoxGeometry(0.7, 0.14, 0.7), colMat, [0, 0.07, 0]);
    hopliteSculpt(
      col,
      new THREE.CylinderGeometry(0.22, 0.26, 2.75, opts.radialSegments ?? 18),
      colMat,
      [0, 1.52, 0]
    );
    hopliteSculpt(col, new THREE.BoxGeometry(0.64, 0.14, 0.64), colMat, [0, 2.96, 0]);
    hopliteSculpt(col, new THREE.BoxGeometry(0.54, 0.05, 0.54), capMat, [0, 3.06, 0]);

    if (torchMat) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 8), torchMat);
      flame.position.y = 3.28;
      col.add(flame);
      torches.push({ mesh: flame, phase: i * 0.9 });
    }
  }

  return { arena, torches };
}
