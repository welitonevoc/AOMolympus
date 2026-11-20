import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { AgeLevel, BuildingKind, PantheonId } from '../../game/types';
import type { GalleryCategory } from './studioTypes';

export interface GodotGlbFilenameParams {
  galleryCategory: GalleryCategory;
  pantheon: PantheonId;
  majorGod: string;
  unitId: string;
  buildingKind: BuildingKind;
  buildingAge: AgeLevel;
  extraId?: string;
}

/**
 * Normalizes any Portuguese/Unicode token (e.g. "Rá", "Ísis", "Fu Xi")
 * into a clean snake_case ASCII slug matching godot4/scripts/autoload/model_library.gd.
 */
export function slugifyGodotToken(raw: string): string {
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || 'model';
}

/**
 * Builds the exact .glb filename expected by godot4/scripts/autoload/model_library.gd:
 * - Buildings: <pantheon>_<deity>_<buildingKind>_t<age>.glb
 * - Units:     <pantheon>_<deity>_<unitId>.glb
 * - Other:     <category>_<slug>.glb
 */
export function buildGodotGlbFilename(params: GodotGlbFilenameParams): string {
  const civ = slugifyGodotToken(params.pantheon);
  const god = slugifyGodotToken(params.majorGod);

  if (params.galleryCategory === 'building') {
    const kind = slugifyGodotToken(params.buildingKind);
    const tier = Math.max(1, Math.min(5, Math.round(params.buildingAge)));
    return `${civ}_${god}_${kind}_t${tier}.glb`;
  }

  if (params.galleryCategory === 'unit') {
    const unit = slugifyGodotToken(params.unitId);
    return `${civ}_${god}_${unit}.glb`;
  }

  const category = slugifyGodotToken(params.galleryCategory);
  const item = slugifyGodotToken(params.extraId || 'asset');
  return `${category}_${item}.glb`;
}

/**
 * Clones a Three.js subject for Godot 4 GLB export without mutating the live scene:
 * - strips lights, cameras, and sprites unsupported or unwanted in static GLB assets
 * - converts ShaderMaterial to a clean MeshStandardMaterial fallback so GLTFExporter succeeds
 * - centers X/Z and grounds the lowest bounding-box Y flush at y = 0
 */
export function prepareObjectForGodotExport(source: THREE.Object3D): THREE.Group {
  const wrapper = new THREE.Group();
  wrapper.name = source.name || 'GodotExportRoot';

  const cloned = source.clone(true);
  cloned.position.set(0, 0, 0);
  cloned.rotation.set(0, 0, 0);
  cloned.updateMatrixWorld(true);

  const toRemove: THREE.Object3D[] = [];
  cloned.traverse((node) => {
    if (
      (node as THREE.Light).isLight ||
      (node as THREE.Camera).isCamera ||
      (node as THREE.Sprite).isSprite ||
      node.userData?.isHelper ||
      node.userData?.excludeFromExport
    ) {
      toRemove.push(node);
      return;
    }

    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((mat) => sanitizeMaterialForGltf(mat));
      } else if (mesh.material) {
        mesh.material = sanitizeMaterialForGltf(mesh.material);
      }
    }
  });

  for (const node of toRemove) {
    node.parent?.remove(node);
  }

  cloned.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(cloned);
  if (!bounds.isEmpty()) {
    const center = new THREE.Vector3();
    bounds.getCenter(center);
    cloned.position.x -= center.x;
    cloned.position.z -= center.z;
    cloned.position.y -= bounds.min.y;
    cloned.updateMatrixWorld(true);
  }

  wrapper.add(cloned);
  return wrapper;
}

function sanitizeMaterialForGltf(mat: THREE.Material): THREE.Material {
  if ((mat as THREE.ShaderMaterial).isShaderMaterial) {
    const uniforms = (mat as THREE.ShaderMaterial).uniforms as Record<string, { value?: unknown }> | undefined;
    const rawColor = uniforms?.uColor?.value ?? uniforms?.color?.value;
    const color = rawColor instanceof THREE.Color ? rawColor.clone() : new THREE.Color(0xcbd5e1);
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.15,
      side: mat.side,
    });
  }
  return mat;
}

/**
 * Exports a Three.js Object3D to a binary .glb file and triggers a browser download.
 */
export async function exportObjectToGlb(
  source: THREE.Object3D,
  filename: string
): Promise<number> {
  const prepared = prepareObjectForGodotExport(source);
  const exporter = new GLTFExporter();
  const glbBuffer = await exporter.parseAsync(prepared, {
    binary: true,
    onlyVisible: true,
  });

  if (!(glbBuffer instanceof ArrayBuffer)) {
    throw new Error('Falha ao gerar arquivo GLB binario.');
  }

  const blob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.glb') ? filename : `${filename}.glb`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return glbBuffer.byteLength;
}
