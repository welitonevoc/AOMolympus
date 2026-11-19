import * as THREE from 'three';
import type { MaterialPalette } from '../../game/models';
import { BiomeTreeStyle } from '../../maps';
import { createAoMOakTreeMesh } from './oakTrees';
import {
  cloneGlbForestTree,
  GLB_SUPPORTED_TREE_STYLES,
  onForestPackGlbReady,
} from './forestPackGlb';

interface CachedTreeMaterials {
  birchBark: THREE.MeshStandardMaterial;
  birchLeaf: THREE.MeshStandardMaterial;
  snowCap: THREE.MeshStandardMaterial;
  pineGreen: THREE.MeshStandardMaterial;
  palmBark: THREE.MeshStandardMaterial;
  palmFrond: THREE.MeshStandardMaterial;
  acaciaBark: THREE.MeshStandardMaterial;
  acaciaCanopy: THREE.MeshStandardMaterial;
  cypressBark: THREE.MeshStandardMaterial;
  cypressMoss: THREE.MeshStandardMaterial;
  jungleLeaf: THREE.MeshStandardMaterial;
  erebusChar: THREE.MeshStandardMaterial;
  erebusEmber: THREE.MeshStandardMaterial;
  bambooStalk: THREE.MeshStandardMaterial;
  orientalLeaf: THREE.MeshStandardMaterial;
  groundShadow: THREE.MeshBasicMaterial;
}

let cachedMats: CachedTreeMaterials | null = null;

function getTreeMaterials(): CachedTreeMaterials {
  if (cachedMats) return cachedMats;
  cachedMats = {
    birchBark: new THREE.MeshStandardMaterial({ color: 0xdbe2e6, roughness: 0.88, metalness: 0.02 }),
    birchLeaf: new THREE.MeshStandardMaterial({ color: 0x86a838, roughness: 0.74, metalness: 0.02 }),
    snowCap: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.58, metalness: 0.04 }),
    pineGreen: new THREE.MeshStandardMaterial({ color: 0x224c3a, roughness: 0.80, metalness: 0.02 }),
    palmBark: new THREE.MeshStandardMaterial({ color: 0x855e3c, roughness: 0.92, metalness: 0.02 }),
    palmFrond: new THREE.MeshStandardMaterial({ color: 0x4c8527, roughness: 0.68, metalness: 0.03 }),
    acaciaBark: new THREE.MeshStandardMaterial({ color: 0x6b4e35, roughness: 0.92, metalness: 0.02 }),
    acaciaCanopy: new THREE.MeshStandardMaterial({ color: 0x6c872c, roughness: 0.76, metalness: 0.02 }),
    cypressBark: new THREE.MeshStandardMaterial({ color: 0x46392d, roughness: 0.92, metalness: 0.02 }),
    cypressMoss: new THREE.MeshStandardMaterial({ color: 0x355c37, roughness: 0.82, metalness: 0.02 }),
    jungleLeaf: new THREE.MeshStandardMaterial({ color: 0x1e7a39, roughness: 0.66, metalness: 0.04 }),
    erebusChar: new THREE.MeshStandardMaterial({ color: 0x231d1c, roughness: 0.95, metalness: 0.06 }),
    erebusEmber: new THREE.MeshStandardMaterial({ color: 0x7c2d12, emissive: 0x9a3412, emissiveIntensity: 0.35, roughness: 0.55 }),
    bambooStalk: new THREE.MeshStandardMaterial({ color: 0x739337, roughness: 0.56, metalness: 0.04 }),
    orientalLeaf: new THREE.MeshStandardMaterial({ color: 0x4f7f29, roughness: 0.72, metalness: 0.02 }),
    groundShadow: new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
  };
  return cachedMats;
}

function addShadowOval(root: THREE.Group, radius: number, mat: THREE.MeshBasicMaterial) {
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(radius, 18), mat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  root.add(shadow);
}

function addMesh(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  enableShadows: boolean
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (enableShadows) {
    m.castShadow = true;
    m.receiveShadow = true;
  }
  parent.add(m);
  return m;
}

function createProceduralBiomeTreeMesh(
  style: BiomeTreeStyle,
  pal: MaterialPalette,
  enableShadows: boolean,
  variantSeed = 0
): THREE.Group {
  if (style === 'oak') {
    return createAoMOakTreeMesh(pal, enableShadows, variantSeed);
  }

  const m = getTreeMaterials();
  const root = new THREE.Group();
  const canopyGroup = new THREE.Group();
  root.add(canopyGroup);
  root.userData.oakCanopyGroup = canopyGroup;

  const scaleVar = 0.92 + ((variantSeed % 5) * 0.045);

  if (style === 'nordic_pine' || style === 'snow_pine') {
    addShadowOval(root, 1.35 * scaleVar, m.groundShadow);
    const trunk = addMesh(root, new THREE.CylinderGeometry(0.14, 0.28, 2.2 * scaleVar, 7), pal.timber, 0, 1.1 * scaleVar, 0, enableShadows);
    trunk.rotation.z = ((variantSeed % 3) - 1) * 0.03;

    const leafMat = style === 'snow_pine' ? m.pineGreen : pal.foliagePine;
    const tiers = [
      { r: 1.45, h: 1.85, y: 2.3 },
      { r: 1.12, h: 1.65, y: 3.45 },
      { r: 0.78, h: 1.35, y: 4.45 },
    ];
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      addMesh(canopyGroup, new THREE.ConeGeometry(t.r * scaleVar, t.h * scaleVar, 7), leafMat, 0, t.y * scaleVar, 0, enableShadows);
      if (style === 'snow_pine') {
        const cap = addMesh(
          canopyGroup,
          new THREE.ConeGeometry(t.r * 0.86 * scaleVar, t.h * 0.42 * scaleVar, 7),
          m.snowCap,
          0,
          (t.y + t.h * 0.31) * scaleVar,
          0,
          enableShadows
        );
        cap.rotation.y = i * 0.4;
      }
    }
    return root;
  }

  if (style === 'palm') {
    addShadowOval(root, 1.25 * scaleVar, m.groundShadow);
    const lean = ((variantSeed % 2 === 0 ? 1 : -1) * 0.14);
    const seg1 = addMesh(root, new THREE.CylinderGeometry(0.16, 0.24, 1.8 * scaleVar, 7), m.palmBark, 0, 0.9 * scaleVar, 0, enableShadows);
    seg1.rotation.z = lean * 0.4;
    const seg2 = addMesh(root, new THREE.CylinderGeometry(0.13, 0.16, 1.7 * scaleVar, 7), m.palmBark, -lean * 0.55, 2.45 * scaleVar, 0, enableShadows);
    seg2.rotation.z = lean;
    const seg3 = addMesh(root, new THREE.CylinderGeometry(0.11, 0.13, 1.5 * scaleVar, 7), m.palmBark, -lean * 1.35, 3.85 * scaleVar, 0, enableShadows);
    seg3.rotation.z = lean * 1.3;

    const crownX = -lean * 1.9;
    const crownY = 4.65 * scaleVar;
    canopyGroup.position.set(crownX, crownY, 0);
    // Date / coconut cluster
    addMesh(canopyGroup, new THREE.SphereGeometry(0.24, 7, 6), m.palmBark, 0, -0.15, 0, enableShadows);
    // 6 arching palm fronds
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + (variantSeed * 0.4);
      const frondWrap = new THREE.Group();
      frondWrap.rotation.y = ang;
      const blade = addMesh(frondWrap, new THREE.BoxGeometry(0.46, 0.08, 1.85 * scaleVar), m.palmFrond, 0, 0.05, 0.92 * scaleVar, enableShadows);
      blade.rotation.x = 0.34;
      const tip = addMesh(frondWrap, new THREE.ConeGeometry(0.22, 0.72 * scaleVar, 4), m.palmFrond, 0, -0.22, 1.88 * scaleVar, enableShadows);
      tip.rotation.x = Math.PI / 2 + 0.52;
      canopyGroup.add(frondWrap);
    }
    return root;
  }

  if (style === 'acacia') {
    addShadowOval(root, 1.85 * scaleVar, m.groundShadow);
    addMesh(root, new THREE.CylinderGeometry(0.18, 0.32, 2.2 * scaleVar, 7), m.acaciaBark, 0, 1.1 * scaleVar, 0, enableShadows);
    const b1 = addMesh(root, new THREE.CylinderGeometry(0.09, 0.14, 1.6 * scaleVar, 6), m.acaciaBark, 0.45, 2.75 * scaleVar, 0.15, enableShadows);
    b1.rotation.z = -0.45;
    const b2 = addMesh(root, new THREE.CylinderGeometry(0.09, 0.14, 1.55 * scaleVar, 6), m.acaciaBark, -0.42, 2.7 * scaleVar, -0.15, enableShadows);
    b2.rotation.z = 0.44;

    // Characteristic wide flat umbrella savannah crown
    const disc1 = addMesh(canopyGroup, new THREE.CylinderGeometry(2.15 * scaleVar, 1.65 * scaleVar, 0.42, 10), m.acaciaCanopy, 0, 3.65 * scaleVar, 0, enableShadows);
    disc1.scale.set(1.15, 1, 0.92);
    addMesh(canopyGroup, new THREE.CylinderGeometry(1.35 * scaleVar, 1.05 * scaleVar, 0.34, 9), pal.foliagePine, 0.85, 3.35 * scaleVar, 0.35, enableShadows);
    addMesh(canopyGroup, new THREE.CylinderGeometry(1.25 * scaleVar, 0.95 * scaleVar, 0.32, 9), pal.foliageDark, -0.78, 3.4 * scaleVar, -0.32, enableShadows);
    return root;
  }

  if (style === 'marsh_cypress') {
    addShadowOval(root, 1.6 * scaleVar, m.groundShadow);
    // Flared swamp buttress + gnarled trunk
    addMesh(root, new THREE.CylinderGeometry(0.24, 0.52, 1.2 * scaleVar, 8), m.cypressBark, 0, 0.6 * scaleVar, 0, enableShadows);
    addMesh(root, new THREE.CylinderGeometry(0.16, 0.25, 2.1 * scaleVar, 7), m.cypressBark, 0.05, 2.1 * scaleVar, 0, enableShadows);
    // Drooping moss-draped foliage clusters
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(1.18 * scaleVar, 1), m.cypressMoss, 0, 3.65 * scaleVar, 0, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.86 * scaleVar, 1), pal.foliageDark, -0.78, 3.1 * scaleVar, 0.4, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.84 * scaleVar, 1), m.cypressMoss, 0.74, 3.18 * scaleVar, -0.35, enableShadows);
    // Hanging willow/moss tendrils
    for (const [hx, hz] of [[-0.85, 0.35], [0.8, -0.25], [0.15, 0.78]]) {
      addMesh(canopyGroup, new THREE.CylinderGeometry(0.06, 0.02, 1.15 * scaleVar, 5), m.cypressMoss, hx, 2.25 * scaleVar, hz, enableShadows);
    }
    return root;
  }

  if (style === 'jungle') {
    addShadowOval(root, 1.75 * scaleVar, m.groundShadow);
    addMesh(root, new THREE.CylinderGeometry(0.24, 0.44, 2.8 * scaleVar, 8), pal.timber, 0, 1.4 * scaleVar, 0, enableShadows);
    const cMain = addMesh(canopyGroup, new THREE.DodecahedronGeometry(1.52 * scaleVar, 1), m.jungleLeaf, 0, 3.85 * scaleVar, 0, enableShadows);
    cMain.scale.set(1.12, 0.88, 1.12);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(1.02 * scaleVar, 1), pal.foliagePine, -0.92, 3.35 * scaleVar, 0.42, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.98 * scaleVar, 1), pal.foliageDark, 0.88, 3.45 * scaleVar, -0.4, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.82 * scaleVar, 1), m.jungleLeaf, 0.25, 4.72 * scaleVar, 0.15, enableShadows);
    return root;
  }

  if (style === 'erebus_ash') {
    addShadowOval(root, 1.3 * scaleVar, m.groundShadow);
    const trunk = addMesh(root, new THREE.CylinderGeometry(0.14, 0.32, 2.6 * scaleVar, 6), m.erebusChar, 0, 1.3 * scaleVar, 0, enableShadows);
    trunk.rotation.z = 0.08;
    const arm1 = addMesh(canopyGroup, new THREE.CylinderGeometry(0.06, 0.14, 1.65 * scaleVar, 5), m.erebusChar, 0.55, 2.85 * scaleVar, 0.2, enableShadows);
    arm1.rotation.z = -0.68;
    const arm2 = addMesh(canopyGroup, new THREE.CylinderGeometry(0.06, 0.13, 1.55 * scaleVar, 5), m.erebusChar, -0.52, 2.95 * scaleVar, -0.22, enableShadows);
    arm2.rotation.z = 0.72;
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.55 * scaleVar, 0), m.erebusEmber, 0.95, 3.35 * scaleVar, 0.22, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.52 * scaleVar, 0), m.erebusEmber, -0.9, 3.42 * scaleVar, -0.25, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.62 * scaleVar, 0), m.erebusChar, 0, 3.6 * scaleVar, 0, enableShadows);
    return root;
  }

  if (style === 'birch') {
    addShadowOval(root, 1.35 * scaleVar, m.groundShadow);
    addMesh(root, new THREE.CylinderGeometry(0.12, 0.2, 2.6 * scaleVar, 7), m.birchBark, -0.18, 1.3 * scaleVar, 0.06, enableShadows);
    const sub = addMesh(root, new THREE.CylinderGeometry(0.09, 0.15, 2.2 * scaleVar, 6), m.birchBark, 0.22, 1.1 * scaleVar, -0.08, enableShadows);
    sub.rotation.z = -0.14;
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(1.12 * scaleVar, 1), m.birchLeaf, -0.22, 3.35 * scaleVar, 0.12, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.88 * scaleVar, 1), pal.foliagePine, 0.52, 3.05 * scaleVar, -0.22, enableShadows);
    addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.75 * scaleVar, 1), m.birchLeaf, 0.05, 4.15 * scaleVar, 0, enableShadows);
    return root;
  }

  // 'oriental' (Bamboo & Willow clump)
  addShadowOval(root, 1.4 * scaleVar, m.groundShadow);
  for (const [sx, sz, tilt] of [
    [-0.35, 0.2, 0.06],
    [0.32, -0.18, -0.08],
    [0.08, 0.35, 0.04],
  ]) {
    const stalk = addMesh(root, new THREE.CylinderGeometry(0.08, 0.11, 3.2 * scaleVar, 6), m.bambooStalk, sx, 1.6 * scaleVar, sz, enableShadows);
    stalk.rotation.z = tilt;
  }
  addMesh(canopyGroup, new THREE.DodecahedronGeometry(1.12 * scaleVar, 1), m.orientalLeaf, 0, 3.65 * scaleVar, 0, enableShadows);
  addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.82 * scaleVar, 1), pal.foliageDark, -0.62, 3.25 * scaleVar, 0.35, enableShadows);
  addMesh(canopyGroup, new THREE.DodecahedronGeometry(0.82 * scaleVar, 1), m.orientalLeaf, 0.62, 3.32 * scaleVar, -0.28, enableShadows);
  return root;
}

export function createBiomeTreeMesh(
  style: BiomeTreeStyle,
  pal: MaterialPalette,
  enableShadows: boolean,
  variantSeed = 0
): THREE.Group {
  // Mix 3D GLB forest oaks with AoM sprite oaks, and use 3D GLB silhouettes for other forest biomes
  const shouldUseGlb =
    GLB_SUPPORTED_TREE_STYLES.has(style) && (style !== 'oak' || variantSeed % 2 === 0);

  if (!shouldUseGlb) {
    return createProceduralBiomeTreeMesh(style, pal, enableShadows, variantSeed);
  }

  const readyGlb = cloneGlbForestTree(style, enableShadows, variantSeed);
  if (readyGlb) {
    return readyGlb;
  }

  // Instant procedural fallback while low_poly_forest_tree_pack.glb loads asynchronously
  const wrapper = createProceduralBiomeTreeMesh(style, pal, enableShadows, variantSeed);
  onForestPackGlbReady(() => {
    const upgraded = cloneGlbForestTree(style, enableShadows, variantSeed);
    if (!upgraded) return;
    while (wrapper.children.length > 0) {
      wrapper.remove(wrapper.children[0]);
    }
    while (upgraded.children.length > 0) {
      wrapper.add(upgraded.children[0]);
    }
    wrapper.userData.oakCanopyGroup = upgraded.userData.oakCanopyGroup;
    wrapper.userData.isGlbForestTree = true;
    wrapper.userData.glbTreeVariant = upgraded.userData.glbTreeVariant;
  });
  return wrapper;
}

