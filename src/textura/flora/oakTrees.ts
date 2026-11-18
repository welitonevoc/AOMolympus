import * as THREE from 'three';
import type { MaterialPalette } from '../../game/models';

export const WORLD_G_OAK_SPRITE_URL = '/assets/aistudio/world_g_oak_sprite_map_e4a96f19.png';
export const TEXTURA_FLORA_OAK_URL = '/textura/flora/world_g_oak_sprite_map.png';

export interface OakTreeVariantSpec {
  id: string;
  index: number;
  name: string;
  seasonLabel: string;
  col: number; // 0..2
  row: number; // 0 (top row in image) or 1 (bottom row in image)
  heightScale: number;
  widthScale: number;
  foliageTintHex: number;
}

/**
 * As 6 variações de Carvalho Grego (world_g_oak_sprite_map.png - 3 colunas x 2 linhas)
 */
export const OAK_TREE_VARIANTS: OakTreeVariantSpec[] = [
  {
    id: 'oak_lush_green',
    index: 0,
    name: 'Carvalho Grego Frondoso',
    seasonLabel: 'Primavera / Verão',
    col: 0,
    row: 0,
    heightScale: 1.06,
    widthScale: 1.02,
    foliageTintHex: 0x3b7a2e,
  },
  {
    id: 'oak_autumn_bronze',
    index: 1,
    name: 'Carvalho Dourado de Outono',
    seasonLabel: 'Outono Bronze',
    col: 1,
    row: 0,
    heightScale: 1.1,
    widthScale: 1.12,
    foliageTintHex: 0x9a5b1a,
  },
  {
    id: 'oak_mediterranean_green',
    index: 2,
    name: 'Carvalho Mediterrâneo',
    seasonLabel: 'Verão Claro',
    col: 2,
    row: 0,
    heightScale: 0.96,
    widthScale: 0.98,
    foliageTintHex: 0x458b32,
  },
  {
    id: 'oak_crimson_russet',
    index: 3,
    name: 'Carvalho Rubro da Arcádia',
    seasonLabel: 'Outono Rubro',
    col: 0,
    row: 1,
    heightScale: 0.94,
    widthScale: 0.92,
    foliageTintHex: 0x85351b,
  },
  {
    id: 'oak_golden_yellow',
    index: 4,
    name: 'Carvalho Solar Olímpico',
    seasonLabel: 'Outono Dourado',
    col: 1,
    row: 1,
    heightScale: 1.0,
    widthScale: 1.05,
    foliageTintHex: 0xc29b1c,
  },
  {
    id: 'oak_ancient_olive',
    index: 5,
    name: 'Carvalho Ancião do Olimpo',
    seasonLabel: 'Floresta Densa',
    col: 2,
    row: 1,
    heightScale: 1.08,
    widthScale: 1.0,
    foliageTintHex: 0x4b5d22,
  },
];

let sharedOakAtlasTexture: THREE.Texture | null = null;
const variantMaterialsCache = new Map<number, THREE.MeshStandardMaterial>();
const variantDepthMaterialsCache = new Map<number, THREE.MeshDepthMaterial>();
const variantPlaneGeometriesCache = new Map<string, THREE.PlaneGeometry>();

export function getOakAtlasTexture(): THREE.Texture {
  if (sharedOakAtlasTexture) return sharedOakAtlasTexture;
  const loader = new THREE.TextureLoader();
  const tex = loader.load(WORLD_G_OAK_SPRITE_URL);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  sharedOakAtlasTexture = tex;
  return tex;
}

/**
 * Cria um PlaneGeometry com coordenadas UV recortando exatamente 1 das 6 árvores
 * na grade 3x2 do arquivo world_g_oak_sprite_map.png.
 */
function getOakSpritePlaneGeometry(col: number, row: number, width: number, height: number): THREE.PlaneGeometry {
  const key = `${col}_${row}_${width.toFixed(2)}_${height.toFixed(2)}`;
  const cached = variantPlaneGeometriesCache.get(key);
  if (cached) return cached;

  const geo = new THREE.PlaneGeometry(width, height);
  // Transladar o pivô para a base do tronco (y = 0 fica na raiz da árvore)
  geo.translate(0, height * 0.48, 0);

  // Em Three.js UV, v=1 é o topo da imagem e v=0 é a base.
  // Linha superior (row = 0) -> v de 0.50 a 1.00
  // Linha inferior (row = 1) -> v de 0.00 a 0.50
  const padU = 0.006;
  const padV = 0.008;
  const u0 = col / 3 + padU;
  const u1 = (col + 1) / 3 - padU;
  const v0 = row === 0 ? 0.5 + padV : 0.0 + padV;
  const v1 = row === 0 ? 1.0 - padV : 0.5 - padV;

  const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
  // Ordem padrão dos vértices de PlaneGeometry:
  // 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
  uvAttr.setXY(0, u0, v1);
  uvAttr.setXY(1, u1, v1);
  uvAttr.setXY(2, u0, v0);
  uvAttr.setXY(3, u1, v0);
  uvAttr.needsUpdate = true;

  variantPlaneGeometriesCache.set(key, geo);
  return geo;
}

function getOakVariantMaterial(variantIndex: number): THREE.MeshStandardMaterial {
  const idx = ((variantIndex % OAK_TREE_VARIANTS.length) + OAK_TREE_VARIANTS.length) % OAK_TREE_VARIANTS.length;
  const cached = variantMaterialsCache.get(idx);
  if (cached) return cached;

  const tex = getOakAtlasTexture();
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.16,
    side: THREE.DoubleSide,
    roughness: 0.86,
    metalness: 0.02,
  });
  variantMaterialsCache.set(idx, mat);
  return mat;
}

function getOakDepthMaterial(): THREE.MeshDepthMaterial {
  const cached = variantDepthMaterialsCache.get(0);
  if (cached) return cached;
  const tex = getOakAtlasTexture();
  const depthMat = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: tex,
    alphaTest: 0.2,
  });
  variantDepthMaterialsCache.set(0, depthMat);
  return depthMat;
}

let treeSpawnCounter = 0;

/**
 * Constrói uma árvore 2.5D/3D estilo Age of Mythology usando o sprite map real
 * `world_g_oak_sprite_map.png` combinado com tronco 3D e planos cruzados volumétricos.
 */
export function createAoMOakTreeMesh(
  pal: MaterialPalette,
  enableShadows: boolean,
  forcedVariantIndex?: number
): THREE.Group {
  const root = new THREE.Group();
  const variantIdx =
    forcedVariantIndex !== undefined
      ? ((forcedVariantIndex % OAK_TREE_VARIANTS.length) + OAK_TREE_VARIANTS.length) % OAK_TREE_VARIANTS.length
      : treeSpawnCounter++ % OAK_TREE_VARIANTS.length;

  const spec = OAK_TREE_VARIANTS[variantIdx];
  const baseWidth = 4.5 * spec.widthScale;
  const baseHeight = 5.7 * spec.heightScale;

  // 1. Sombra oval suave no chão (assenta a árvore no terreno como no AoM)
  const groundShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.55 * spec.widthScale, 20),
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

  // 2. Tronco 3D central de madeira para dar solidez na base ao girar a câmera
  const trunkHeight = 1.65 * spec.heightScale;
  const trunkMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.28, trunkHeight, 7),
    pal.timber
  );
  trunkMesh.position.set(0, trunkHeight * 0.5, 0);
  if (enableShadows) {
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
  }
  root.add(trunkMesh);

  // 3. Planos cruzados 2.5D/3D (0°, 60°, 120°) com o sprite original do Carvalho (world_g_oak_sprite_map)
  // Isso garante que a árvore nunca fique "amassada" de lado e exiba volume real em qualquer ângulo!
  const canopyGroup = new THREE.Group();
  const planeGeo = getOakSpritePlaneGeometry(spec.col, spec.row, baseWidth, baseHeight);
  const spriteMat = getOakVariantMaterial(variantIdx);
  const depthMat = getOakDepthMaterial();

  const angles = [0, Math.PI / 3, (2 * Math.PI) / 3];
  angles.forEach((angle, planeIdx) => {
    const plane = new THREE.Mesh(planeGeo, spriteMat);
    plane.customDepthMaterial = depthMat;
    plane.rotation.y = angle;
    // Leve variação de escala no plano secundário para dar volume orgânico à copa
    if (planeIdx > 0) {
      plane.scale.set(0.94, 0.98, 0.94);
    }
    if (enableShadows) {
      plane.castShadow = true;
      plane.receiveShadow = true;
    }
    canopyGroup.add(plane);
  });

  // Rotação inicial variada por árvore para que a floresta pareça 100% orgânica
  canopyGroup.rotation.y = (variantIdx * 1.17) % (Math.PI * 2);
  root.add(canopyGroup);

  root.userData.oakCanopyGroup = canopyGroup;
  root.userData.oakVariant = spec;

  return root;
}
