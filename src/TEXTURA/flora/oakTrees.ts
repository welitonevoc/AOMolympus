import * as THREE from 'three';
import type { MaterialPalette } from '../../game/models';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const TREE_PACK_GLB_URL = '/TEXTURA/flora/low_poly_forest_tree_pack.glb';

let cachedTreePackScene: THREE.Group | null = null;
const treePackLoader = new GLTFLoader();

treePackLoader.load(
  TREE_PACK_GLB_URL,
  (gltf) => {
    cachedTreePackScene = gltf.scene;
    cachedTreePackScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  },
  undefined,
  (err) => {
    console.warn('Failed to load low_poly_forest_tree_pack.glb, using procedural fallback:', err);
  }
);

/**
 * Constrói uma árvore 3D a partir do pack low_poly_forest_tree_pack.glb
 */
export function createAoMOakTreeMesh(
  pal: MaterialPalette,
  enableShadows: boolean,
  _forcedVariantIndex?: number
): THREE.Group {
  const root = new THREE.Group();

  if (cachedTreePackScene) {
    const clone = cachedTreePackScene.clone(true);
    clone.scale.setScalar(0.88);
    clone.position.set(0, 0, 0);
    if (enableShadows) {
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
    root.add(clone);
  } else {
    // Fallback low-poly tree while GLB loads
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.38, 2.1, 7),
      pal.timber
    );
    trunk.position.y = 1.05;
    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.5, 1),
      pal.foliagePine
    );
    foliage.position.y = 2.9;
    root.add(trunk, foliage);
  }

  // Sombra oval no chão
  const groundShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 20),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    })
  );
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.y = 0.03;
  root.add(groundShadow);

  return root;
}
