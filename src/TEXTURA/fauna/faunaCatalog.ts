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
    biome: 'Savana / Oásis / Nilo',
  },
  deer: {
    kind: 'deer',
    labelPt: 'Cervo da Arcádia',
    coatHex: 0x9c6234,
    underbellyHex: 0xede5d8,
    hornOrTuskHex: 0xe6dac3,
    biome: 'Mediterrâneo / Alfheim / Terras Altas',
  },
  boar: {
    kind: 'boar',
    labelPt: 'Javali de Erimanto',
    coatHex: 0x4b3629,
    underbellyHex: 0x2f2219,
    hornOrTuskHex: 0xf3ead8,
    biome: 'Bosques / Pântano / Yucatán',
  },
  aurochs: {
    kind: 'aurochs',
    labelPt: 'Auroque Selvagem',
    coatHex: 0x3b2820,
    underbellyHex: 0x261812,
    hornOrTuskHex: 0xeee4d3,
    biome: 'Planícies / Midgard / Rei da Colina',
  },
  wolf: {
    kind: 'wolf',
    labelPt: 'Lobo Cinzento Ártico',
    coatHex: 0x6b7280,
    underbellyHex: 0x9ca3af,
    hornOrTuskHex: 0x1f2937,
    biome: 'Tundra / Jotunheim / Érebo',
  },
  reindeer: {
    kind: 'reindeer',
    labelPt: 'Rena Ártica',
    coatHex: 0x8a7564,
    underbellyHex: 0xedeff2,
    hornOrTuskHex: 0xd6cdb8,
    biome: 'Tundra / Lago Fantasma / Vinlandsaga',
  },
  musk_ox: {
    kind: 'musk_ox',
    labelPt: 'Boi-Almiscarado',
    coatHex: 0x372822,
    underbellyHex: 0x1e1612,
    hornOrTuskHex: 0xe5dcc8,
    biome: 'Tundra / Jotunheim / Vinlandsaga',
  },
  camel: {
    kind: 'camel',
    labelPt: 'Camelo Selvagem',
    coatHex: 0xd1a96f,
    underbellyHex: 0xf0dec0,
    hornOrTuskHex: 0x7a5c3a,
    biome: 'Oásis / Rio Nilo / Vale dos Reis',
  },
  lion: {
    kind: 'lion',
    labelPt: 'Leão da Savana',
    coatHex: 0xd49b4b,
    underbellyHex: 0xf5deb3,
    hornOrTuskHex: 0x693b14,
    biome: "Savana / Vale dos Reis / Poço d'Água",
  },
  crocodile: {
    kind: 'crocodile',
    labelPt: 'Crocodilo do Nilo',
    coatHex: 0x3b5933,
    underbellyHex: 0x9ca676,
    hornOrTuskHex: 0x263820,
    biome: 'Rio Nilo / Pântano / Yucatán',
  },
  goat: {
    kind: 'goat',
    labelPt: 'Cabra Montesa',
    coatHex: 0xded4c3,
    underbellyHex: 0xf7f3eb,
    hornOrTuskHex: 0x453b32,
    biome: 'Acrópole / Terras Altas / Ilhas',
  },
  hippo: {
    kind: 'hippo',
    labelPt: 'Hipopótamo',
    coatHex: 0x6b5b66,
    underbellyHex: 0x9c8691,
    hornOrTuskHex: 0xf2ede4,
    biome: "Rio Nilo / Pântano / Poço d'Água",
  },
  elephant_wild: {
    kind: 'elephant_wild',
    labelPt: 'Elefante Selvagem',
    coatHex: 0x73767d,
    underbellyHex: 0x5c5e63,
    hornOrTuskHex: 0xfaf5e8,
    biome: "Savana / Poço d'Água / Oásis",
  },
  bear: {
    kind: 'bear',
    labelPt: 'Urso Selvagem',
    coatHex: 0x5c3c24,
    underbellyHex: 0x422a18,
    hornOrTuskHex: 0x2b1d12,
    biome: 'Terras Altas / Jotunheim / Vinlandsaga',
  },
};

const coatMaterialCache = new Map<FaunaKind, THREE.MeshStandardMaterial>();
const hornMaterialCache = new Map<FaunaKind, THREE.MeshStandardMaterial>();

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

export function getFaunaAccentMaterial(kind: FaunaKind): THREE.MeshStandardMaterial {
  const cached = hornMaterialCache.get(kind);
  if (cached) return cached;
  const spec = FAUNA_TEXTURA_CATALOG[kind] ?? FAUNA_TEXTURA_CATALOG.deer;
  const mat = new THREE.MeshStandardMaterial({
    color: spec.hornOrTuskHex,
    roughness: 0.62,
    metalness: 0.08,
  });
  hornMaterialCache.set(kind, mat);
  return mat;
}
