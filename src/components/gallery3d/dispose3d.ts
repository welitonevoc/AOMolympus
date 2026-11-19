import * as THREE from 'three';
import { MaterialPalette } from '../../game/models';

const TEXTURE_SLOTS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'emissiveMap',
  'alphaMap',
  'aoMap',
  'bumpMap',
  'displacementMap',
  'envMap',
  'lightMap',
  'specularMap',
] as const;

export interface DisposeOptions {
  /** Geometries / materials / textures intentionally managed externally (e.g. MaterialPalette). */
  skipMaterials?: Set<THREE.Material>;
}

/** Disposes a single Three.js material and any non-shared texture maps attached to it. */
export function disposeMaterial(
  mat: THREE.Material,
  skipMaterials?: Set<THREE.Material>
): void {
  if (skipMaterials?.has(mat)) return;
  if ((mat.userData as Record<string, unknown> | undefined)?.shared) return;

  const matRecord = mat as unknown as Record<string, unknown>;
  for (const slot of TEXTURE_SLOTS) {
    const tex = matRecord[slot];
    if (tex instanceof THREE.Texture && !(tex.userData as Record<string, unknown> | undefined)?.shared) {
      tex.dispose();
    }
  }
  mat.dispose();
}

/**
 * Recursively disposes GPU geometries, materials, and non-shared textures inside an Object3D subtree,
 * plus any custom `userData.disposeExtra()` callback attached by a studio subject builder.
 */
export function disposeObject3D(
  root: THREE.Object3D | null | undefined,
  options?: DisposeOptions
): void {
  if (!root) return;

  const disposedGeos = new Set<THREE.BufferGeometry>();
  const disposedMats = new Set<THREE.Material>();

  root.traverse((obj) => {
    const extra = obj.userData?.disposeExtra;
    if (typeof extra === 'function') {
      (extra as () => void)();
    }

    const renderable = obj as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };

    if (renderable.geometry && !disposedGeos.has(renderable.geometry)) {
      if (!(renderable.geometry.userData as Record<string, unknown> | undefined)?.shared) {
        renderable.geometry.dispose();
      }
      disposedGeos.add(renderable.geometry);
    }

    const mat = renderable.material;
    if (Array.isArray(mat)) {
      for (const m of mat) {
        if (!disposedMats.has(m)) {
          disposeMaterial(m, options?.skipMaterials);
          disposedMats.add(m);
        }
      }
    } else if (mat && !disposedMats.has(mat)) {
      disposeMaterial(mat, options?.skipMaterials);
      disposedMats.add(mat);
    }
  });
}

/** Disposes every material inside a studio MaterialPalette instance. */
export function disposeMaterialPalette(pal: MaterialPalette): void {
  for (const mat of Object.values(pal)) {
    if (mat instanceof THREE.Material) {
      mat.dispose();
    }
  }
}
