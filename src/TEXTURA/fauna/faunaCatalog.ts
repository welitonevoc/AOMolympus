import * as THREE from 'three';
import { FaunaKind } from '../../game/types';

export interface FaunaTextureSpec {
  kind: FaunaKind;
  labelPt: string;
  coatHex: number;
  underbellyHex: number;
  hornOrTuskHex: number;
  biome: string;
}

export const FAUNA_TEXTURA_CATALOG: Record<FaunaKind, FaunaTextureSpec> = {
  gazelle: {
    kind: 'gazelle',
    labelPt: 'Gazela do Deserto',
    coatHex: 0xc89d66,
    underbellyHex: 0xf4efe6,
    hornOrTuskHex: 0x3b3530,
    biome: 'Mediterrâneo / Oásis / Nilo',
  },
  deer: {
    kind: 'deer',
    labelPt: 'Cervo da Arcádia',
    coatHex: 0x9c6234,
    underbellyHex: 0xede5d8,
    hornOrTuskHex: 0xe6dac3,
    biome: 'Floresta de Carvalhos / Acrópole',
  },
  boar: {
    kind: 'boar',
    labelPt: 'Javali de Erimanto',
    coatHex: 0x4b3629,
    underbellyHex: 0x2f2219,
    hornOrTuskHex: 0xf3ead8,
    biome: 'Bosques Gregos / Alfheim',
  },
  aurochs: {
    kind: 'aurochs',
    labelPt: 'Auroque Selvagem',
    coatHex: 0x3b2820,
    underbellyHex: 0x261812,
    hornOrTuskHex: 0xeee4d3,
    biome: 'Planícies / Jotunheim',
  },
  wolf: {
    kind: 'wolf',
    labelPt: 'Lobo Cinzento Ártico',
    coatHex: 0x6b7280,
    underbellyHex: 0x9ca3af,
    hornOrTuskHex: 0x1f2937,
    biome: 'Predador Territorial',
  },
};

const coatMaterialCache = new Map<FaunaKind, THREE.MeshStandardMaterial>();

export function getFaunaCoatMaterial(kind: FaunaKind): THREE.MeshStandardMaterial {
  const cached = coatMaterialCache.get(kind);
  if (cached) return cached;
  const spec = FAUNA_TEXTURA_CATALOG[kind] ?? FAUNA_TEXTURA_CATALOG.deer;
  const mat = new THREE.MeshStandardMaterial({
    color: spec.coatHex,
    roughness: 0.82,
    metalness: 0.04,
  });
  coatMaterialCache.set(kind, mat);
  return mat;
}
