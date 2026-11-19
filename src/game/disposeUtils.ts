import * as THREE from 'three';

/**
 * Safely disposes Three.js geometries and materials inside an Object3D subtree
 * without disposing shared materials/textures that belong to a global MaterialPalette.
 */
export function disposeObject3D(
  root: THREE.Object3D | null | undefined,
  protectedMaterials?: ReadonlySet<THREE.Material>,
  protectedGeometries?: ReadonlySet<THREE.BufferGeometry>
): void {
  if (!root) return;

  const disposedGeos = new Set<THREE.BufferGeometry>();
  const disposedMats = new Set<THREE.Material>();

  root.traverse((obj) => {
    const renderable = obj as THREE.Mesh | THREE.Line | THREE.Points;
    if (
      !(renderable as THREE.Mesh).isMesh &&
      !(renderable as THREE.Line).isLine &&
      !(renderable as THREE.Points).isPoints
    ) {
      return;
    }

    const geo = renderable.geometry;
    if (geo && !disposedGeos.has(geo) && !protectedGeometries?.has(geo)) {
      geo.dispose();
      disposedGeos.add(geo);
    }

    const mat = renderable.material;
    if (!mat) return;
    if (Array.isArray(mat)) {
      for (const m of mat) {
        if (m && !disposedMats.has(m) && !protectedMaterials?.has(m)) {
          disposeMaterialTextures(m);
          m.dispose();
          disposedMats.add(m);
        }
      }
    } else if (!disposedMats.has(mat) && !protectedMaterials?.has(mat)) {
      disposeMaterialTextures(mat);
      mat.dispose();
      disposedMats.add(mat);
    }
  });
}

function disposeMaterialTextures(mat: THREE.Material): void {
  const std = mat as THREE.MeshStandardMaterial;
  // Only dispose textures explicitly tagged as transient/per-instance (`userData.disposable === true`)
  const maps: (THREE.Texture | null | undefined)[] = [
    std.map,
    std.normalMap,
    std.roughnessMap,
    std.metalnessMap,
    std.emissiveMap,
    std.alphaMap,
  ];
  for (const tex of maps) {
    if (tex && tex.userData?.disposable === true) {
      tex.dispose();
    }
  }
}

/**
 * Collects all Material references owned by a MaterialPalette object so shared
 * materials are never disposed when individual units/buildings are cleared.
 */
export function collectPaletteMaterials(palette: unknown): Set<THREE.Material> {
  const set = new Set<THREE.Material>();
  if (!palette || typeof palette !== 'object') return set;
  for (const val of Object.values(palette as Record<string, unknown>)) {
    if (val instanceof THREE.Material) {
      set.add(val);
    }
  }
  return set;
}
