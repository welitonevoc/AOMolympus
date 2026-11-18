import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { BiomeTreeStyle } from '../maps';

export const FOREST_PACK_GLB_URL = '/textura/flora/low_poly_forest_tree_pack.glb';

interface NormalizedTreeVariant {
  id: string;
  trunkGeo: THREE.BufferGeometry;
  trunkBaseMat: THREE.MeshStandardMaterial;
  branchGeo: THREE.BufferGeometry;
  branchBaseMat: THREE.MeshStandardMaterial;
  baseRadius: number;
}

const STYLE_TINT_CONFIG: Partial<
  Record<
    BiomeTreeStyle,
    {
      trunkTint: number;
      leafTint: number;
      heightScale: number;
      preferredIndices: number[];
    }
  >
> = {
  oak: {
    trunkTint: 0xffffff,
    leafTint: 0x86c45e,
    heightScale: 1.0,
    preferredIndices: [0, 1, 2, 3],
  },
  birch: {
    trunkTint: 0xe6eef2,
    leafTint: 0xbad959,
    heightScale: 0.96,
    preferredIndices: [1, 3],
  },
  jungle: {
    trunkTint: 0x9c8269,
    leafTint: 0x3eb85d,
    heightScale: 1.12,
    preferredIndices: [0, 2],
  },
  marsh_cypress: {
    trunkTint: 0x7d6b5d,
    leafTint: 0x5c8a52,
    heightScale: 1.04,
    preferredIndices: [2, 3],
  },
  nordic_pine: {
    trunkTint: 0x99795c,
    leafTint: 0x4b7f5e,
    heightScale: 1.06,
    preferredIndices: [0, 1, 2],
  },
  snow_pine: {
    trunkTint: 0x948980,
    leafTint: 0xaad4cf,
    heightScale: 1.04,
    preferredIndices: [0, 2],
  },
  oriental: {
    trunkTint: 0xa89b6e,
    leafTint: 0x87b854,
    heightScale: 0.95,
    preferredIndices: [1, 3],
  },
};

export const GLB_SUPPORTED_TREE_STYLES = new Set<BiomeTreeStyle>(
  Object.keys(STYLE_TINT_CONFIG) as BiomeTreeStyle[]
);

let cachedVariants: NormalizedTreeVariant[] | null = null;
let loadPromise: Promise<NormalizedTreeVariant[]> | null = null;
let loadFailed = false;
const readyCallbacks = new Set<() => void>();
const tintedMaterialCache = new Map<string, THREE.MeshStandardMaterial>();
let sharedShadowMat: THREE.MeshBasicMaterial | null = null;

function getSharedShadowMat(): THREE.MeshBasicMaterial {
  if (!sharedShadowMat) {
    sharedShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
  }
  return sharedShadowMat;
}

function toStandardMat(src: THREE.Material | THREE.Material[], isBranch: boolean): THREE.MeshStandardMaterial {
  const first = Array.isArray(src) ? src[0] : src;
  const std = first as THREE.MeshStandardMaterial;
  const cloned = new THREE.MeshStandardMaterial({
    map: std?.map ?? null,
    color: std?.color ? std.color.clone() : new THREE.Color(0xffffff),
    roughness: isBranch ? 0.78 : 0.9,
    metalness: 0.02,
    side: THREE.DoubleSide,
    alphaTest: isBranch ? 0.35 : 0,
    transparent: false,
    depthWrite: true,
  });
  return cloned;
}

function getStyledMaterial(
  variantIdx: number,
  part: 'trunk' | 'branch',
  style: BiomeTreeStyle,
  baseMat: THREE.MeshStandardMaterial
): THREE.MeshStandardMaterial {
  const cfg = STYLE_TINT_CONFIG[style] ?? STYLE_TINT_CONFIG.oak!;
  const tintHex = part === 'trunk' ? cfg.trunkTint : cfg.leafTint;
  const key = `${variantIdx}:${part}:${style}:${tintHex}`;
  const existing = tintedMaterialCache.get(key);
  if (existing) return existing;

  const mat = baseMat.clone();
  mat.color.multiply(new THREE.Color(tintHex));
  tintedMaterialCache.set(key, mat);
  return mat;
}

function buildVariantsFromScene(sceneRoot: THREE.Object3D): NormalizedTreeVariant[] {
  sceneRoot.updateMatrixWorld(true);

  interface MeshEntry {
    mesh: THREE.Mesh;
    center: THREE.Vector3;
    box: THREE.Box3;
  }

  const trunks: MeshEntry[] = [];
  const branches: MeshEntry[] = [];

  sceneRoot.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const name = mesh.name || mesh.parent?.name || '';
    const box = new THREE.Box3().setFromObject(mesh);
    if (box.isEmpty()) return;
    const center = new THREE.Vector3();
    box.getCenter(center);
    if (name.includes('Tree_Trunk')) {
      trunks.push({ mesh, center, box });
    } else if (name.includes('Tree_Branches')) {
      branches.push({ mesh, center, box });
    }
  });

  // Sort deterministically by world X so variant indices stay consistent across sessions
  trunks.sort((a, b) => a.center.x - b.center.x);

  const usedBranches = new Set<number>();
  const variants: NormalizedTreeVariant[] = [];

  for (let i = 0; i < trunks.length; i++) {
    const trunk = trunks[i];
    let bestBranchIdx = -1;
    let bestDist = Infinity;

    for (let j = 0; j < branches.length; j++) {
      if (usedBranches.has(j)) continue;
      const br = branches[j];
      const d = Math.hypot(br.center.x - trunk.center.x, br.center.z - trunk.center.z);
      if (d < bestDist) {
        bestDist = d;
        bestBranchIdx = j;
      }
    }

    if (bestBranchIdx === -1) continue;
    usedBranches.add(bestBranchIdx);
    const branch = branches[bestBranchIdx];

    const trunkGeo = trunk.mesh.geometry.clone();
    trunkGeo.applyMatrix4(trunk.mesh.matrixWorld);
    const branchGeo = branch.mesh.geometry.clone();
    branchGeo.applyMatrix4(branch.mesh.matrixWorld);

    trunkGeo.computeBoundingBox();
    branchGeo.computeBoundingBox();

    const combinedBox = new THREE.Box3();
    if (trunkGeo.boundingBox) combinedBox.union(trunkGeo.boundingBox);
    if (branchGeo.boundingBox) combinedBox.union(branchGeo.boundingBox);

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    combinedBox.getSize(size);
    combinedBox.getCenter(center);

    // Center XZ around trunk base and place base cleanly at y = 0
    const trunkBox = trunkGeo.boundingBox ?? combinedBox;
    const trunkCenter = new THREE.Vector3();
    trunkBox.getCenter(trunkCenter);

    const targetHeight = 5.6 + (i % 2) * 0.45;
    const uniformScale = size.y > 0.01 ? targetHeight / size.y : 1;

    const normalizeGeo = (g: THREE.BufferGeometry) => {
      g.translate(-trunkCenter.x, -combinedBox.min.y, -trunkCenter.z);
      g.scale(uniformScale, uniformScale, uniformScale);
      g.computeBoundingBox();
      g.computeBoundingSphere();
    };
    normalizeGeo(trunkGeo);
    normalizeGeo(branchGeo);

    variants.push({
      id: `glb_tree_${i}`,
      trunkGeo,
      trunkBaseMat: toStandardMat(trunk.mesh.material, false),
      branchGeo,
      branchBaseMat: toStandardMat(branch.mesh.material, true),
      baseRadius: Math.max(1.2, Math.min(2.0, Math.max(size.x, size.z) * uniformScale * 0.38)),
    });
  }

  return variants;
}

export function preloadForestPackGlb(): Promise<NormalizedTreeVariant[]> {
  if (cachedVariants) return Promise.resolve(cachedVariants);
  if (loadPromise) return loadPromise;

  const loader = new GLTFLoader();
  loadPromise = new Promise<NormalizedTreeVariant[]>((resolve) => {
    loader.load(
      FOREST_PACK_GLB_URL,
      (gltf) => {
        try {
          const parsed = buildVariantsFromScene(gltf.scene);
          cachedVariants = parsed;
          for (const cb of readyCallbacks) {
            try {
              cb();
            } catch {}
          }
          readyCallbacks.clear();
          resolve(parsed);
        } catch {
          loadFailed = true;
          resolve([]);
        }
      },
      undefined,
      () => {
        loadFailed = true;
        resolve([]);
      }
    );
  });

  return loadPromise;
}

export function isForestPackGlbReady(): boolean {
  return Boolean(cachedVariants && cachedVariants.length > 0);
}

export function onForestPackGlbReady(cb: () => void) {
  if (cachedVariants && cachedVariants.length > 0) {
    cb();
    return;
  }
  if (loadFailed) return;
  readyCallbacks.add(cb);
  preloadForestPackGlb();
}

/**
 * Instantiates a normalized 3D tree from low_poly_forest_tree_pack.glb tinted for the target biome.
 * Returns null while the GLB is still loading so callers can display an instant fallback and swap on ready.
 */
export function cloneGlbForestTree(
  style: BiomeTreeStyle,
  enableShadows: boolean,
  variantSeed = 0
): THREE.Group | null {
  if (!cachedVariants || cachedVariants.length === 0) {
    if (!loadFailed) preloadForestPackGlb();
    return null;
  }

  const cfg = STYLE_TINT_CONFIG[style] ?? STYLE_TINT_CONFIG.oak!;
  const pool = cfg.preferredIndices.filter((idx) => idx < cachedVariants!.length);
  const variantIdx = pool.length > 0 ? pool[Math.abs(variantSeed) % pool.length] : Math.abs(variantSeed) % cachedVariants.length;
  const spec = cachedVariants[variantIdx];

  const root = new THREE.Group();
  const scaleVar = (0.9 + ((Math.abs(variantSeed) % 5) * 0.045)) * cfg.heightScale;

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(spec.baseRadius * scaleVar, 16),
    getSharedShadowMat()
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  root.add(shadow);

  const trunkMat = getStyledMaterial(variantIdx, 'trunk', style, spec.trunkBaseMat);
  const branchMat = getStyledMaterial(variantIdx, 'branch', style, spec.branchBaseMat);

  const trunkMesh = new THREE.Mesh(spec.trunkGeo, trunkMat);
  trunkMesh.scale.setScalar(scaleVar);
  if (enableShadows) {
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
  }
  root.add(trunkMesh);

  const canopyGroup = new THREE.Group();
  const branchMesh = new THREE.Mesh(spec.branchGeo, branchMat);
  branchMesh.scale.setScalar(scaleVar);
  if (enableShadows) {
    branchMesh.castShadow = true;
    branchMesh.receiveShadow = true;
  }
  canopyGroup.add(branchMesh);
  root.add(canopyGroup);

  root.userData.oakCanopyGroup = canopyGroup;
  root.userData.isGlbForestTree = true;
  root.userData.glbTreeVariant = variantIdx;
  return root;
}
