import * as THREE from 'three';
import { MapId, PANTHEONS, PantheonId, WorldSizeId } from '../types';
import { getWorldSizeSpec, groundHeightAt as computeGeoGroundHeightAt, WORLD_SIZE_SPECS } from '../../maps';

export const MAP_HALF_SIZE = 74;
export const PLAYABLE_HALF_SIZE = 58;
export { getWorldSizeSpec, WORLD_SIZE_SPECS };

/**
 * Deterministic heightfield per AoM map biome & WorldSizeId.
 * Delegates to shared mapGeography engine so Mesh, Minimap, NavGrid & Spawners match 100%.
 */
export function groundHeightAt(
  x: number,
  z: number,
  mapId: MapId = 'mediterranean',
  worldSize: WorldSizeId = 'normal'
): number {
  return computeGeoGroundHeightAt(x, z, mapId, worldSize);
}

export interface MaterialPalette {
  marble: THREE.MeshStandardMaterial;
  stoneDark: THREE.MeshStandardMaterial;
  terracotta: THREE.MeshStandardMaterial;
  timber: THREE.MeshStandardMaterial;
  bronze: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  skin: THREE.MeshStandardMaterial;
  tunicPlayer: THREE.MeshStandardMaterial;
  tunicEnemy: THREE.MeshStandardMaterial;
  furBrown: THREE.MeshStandardMaterial;
  cyclopsSkin: THREE.MeshStandardMaterial;
  sandstone: THREE.MeshStandardMaterial;
  sandstoneDark: THREE.MeshStandardMaterial;
  turquoise: THREE.MeshStandardMaterial;
  norseTimber: THREE.MeshStandardMaterial;
  norseSlate: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
  orichalcum: THREE.MeshStandardMaterial;
  obsidian: THREE.MeshStandardMaterial;
  chitin: THREE.MeshStandardMaterial;
  iceBlue: THREE.MeshStandardMaterial;
  jade: THREE.MeshStandardMaterial;
  crimson: THREE.MeshStandardMaterial;
  lapis: THREE.MeshStandardMaterial;
  ember: THREE.MeshStandardMaterial;
  foliagePine: THREE.MeshStandardMaterial;
  foliageDark: THREE.MeshStandardMaterial;
  berryRed: THREE.MeshStandardMaterial;
  goldOre: THREE.MeshStandardMaterial;
  crystalGlow: THREE.MeshStandardMaterial;
  shadowMat: THREE.MeshBasicMaterial;
  ringPlayerMat: THREE.MeshBasicMaterial;
  ringEnemyMat: THREE.MeshBasicMaterial;
}

export function createMaterialPalette(
  marbleTex: THREE.CanvasTexture,
  shadowTex: THREE.CanvasTexture,
  ringPlayerTex: THREE.CanvasTexture,
  ringEnemyTex: THREE.CanvasTexture,
  playerBannerHex: number
): MaterialPalette {
  return {
    marble: new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xf0eadc,
      roughness: 0.7,
      metalness: 0.06,
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      color: 0x5c6066,
      roughness: 0.86,
      metalness: 0.1,
    }),
    terracotta: new THREE.MeshStandardMaterial({
      color: 0xb65436,
      roughness: 0.76,
      metalness: 0.04,
    }),
    timber: new THREE.MeshStandardMaterial({
      color: 0x6e472b,
      roughness: 0.84,
      metalness: 0.03,
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: 0xc9933b,
      roughness: 0.26,
      metalness: 0.88,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xf4c44e,
      roughness: 0.2,
      metalness: 0.94,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0x9aa4b2,
      roughness: 0.24,
      metalness: 0.9,
    }),
    skin: new THREE.MeshStandardMaterial({
      color: 0xd9a782,
      roughness: 0.66,
      metalness: 0.02,
    }),
    tunicPlayer: new THREE.MeshStandardMaterial({
      color: playerBannerHex,
      roughness: 0.6,
      metalness: 0.1,
    }),
    tunicEnemy: new THREE.MeshStandardMaterial({
      color: 0xc82333,
      roughness: 0.6,
      metalness: 0.1,
    }),
    furBrown: new THREE.MeshStandardMaterial({
      color: 0x5a3b26,
      roughness: 0.9,
      metalness: 0.02,
    }),
    cyclopsSkin: new THREE.MeshStandardMaterial({
      color: 0x7b886b,
      roughness: 0.74,
      metalness: 0.04,
    }),
    sandstone: new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xd9b372,
      roughness: 0.85,
      metalness: 0.03,
    }),
    sandstoneDark: new THREE.MeshStandardMaterial({
      color: 0x9c7945,
      roughness: 0.9,
      metalness: 0.04,
    }),
    turquoise: new THREE.MeshStandardMaterial({
      color: 0x0f9e99,
      roughness: 0.4,
      metalness: 0.26,
    }),
    norseTimber: new THREE.MeshStandardMaterial({
      color: 0x4b301e,
      roughness: 0.88,
      metalness: 0.03,
    }),
    norseSlate: new THREE.MeshStandardMaterial({
      color: 0x364152,
      roughness: 0.8,
      metalness: 0.1,
    }),
    ivory: new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xf5f0e2,
      roughness: 0.6,
      metalness: 0.08,
    }),
    orichalcum: new THREE.MeshStandardMaterial({
      color: 0xd98a2b,
      roughness: 0.22,
      metalness: 0.9,
    }),
    obsidian: new THREE.MeshStandardMaterial({
      color: 0x222530,
      roughness: 0.46,
      metalness: 0.42,
    }),
    chitin: new THREE.MeshStandardMaterial({
      color: 0x265c42,
      roughness: 0.28,
      metalness: 0.7,
    }),
    iceBlue: new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.18,
    }),
    jade: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.34,
      metalness: 0.28,
    }),
    crimson: new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.48,
      metalness: 0.22,
    }),
    lapis: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.32,
      metalness: 0.35,
    }),
    ember: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.15,
      roughness: 0.25,
      metalness: 0.15,
    }),
    foliagePine: new THREE.MeshStandardMaterial({
      color: 0x2e5e32,
      roughness: 0.85,
      metalness: 0.02,
    }),
    foliageDark: new THREE.MeshStandardMaterial({
      color: 0x204726,
      roughness: 0.88,
      metalness: 0.02,
    }),
    berryRed: new THREE.MeshStandardMaterial({
      color: 0xd63348,
      roughness: 0.45,
      metalness: 0.05,
    }),
    goldOre: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x92400e,
      emissiveIntensity: 0.48,
      roughness: 0.16,
      metalness: 0.94,
    }),
    crystalGlow: new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x14b8a6,
      emissiveIntensity: 1.4,
      roughness: 0.15,
      metalness: 0.2,
    }),
    shadowMat: new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    }),
    ringPlayerMat: new THREE.MeshBasicMaterial({
      map: ringPlayerTex,
      transparent: true,
      depthWrite: false,
    }),
    ringEnemyMat: new THREE.MeshBasicMaterial({
      map: ringEnemyTex,
      transparent: true,
      depthWrite: false,
    }),
  };
}

export interface CivLook {
  style: 'greek' | 'egyptian' | 'norse' | 'atlantean' | 'chinese';
  wallMat: THREE.Material;
  trimMat: THREE.Material;
  roofMat: THREE.Material;
  armorMat: THREE.Material;
  mountMat: THREE.Material;
  titanBodyMat: THREE.Material;
  titanCoreMat: THREE.Material;
}

export function getCivLook(pantheon: PantheonId, pal: MaterialPalette, majorGod?: string): CivLook {
  const style = PANTHEONS[pantheon].archStyle;

  if (majorGod) {
    const mg = majorGod
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    // GREGOS: Zeus, Poseidon, Hades
    if (mg.includes('zeus')) {
      return {
        style: 'greek',
        wallMat: pal.marble,
        trimMat: pal.gold,
        roofMat: pal.terracotta,
        armorMat: pal.gold,
        mountMat: pal.furBrown,
        titanBodyMat: pal.marble,
        titanCoreMat: pal.goldOre,
      };
    }
    if (mg.includes('poseidon')) {
      return {
        style: 'greek',
        wallMat: pal.marble,
        trimMat: pal.turquoise,
        roofMat: pal.turquoise,
        armorMat: pal.bronze,
        mountMat: pal.sandstone,
        titanBodyMat: pal.orichalcum,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('hades')) {
      return {
        style: 'greek',
        wallMat: pal.obsidian,
        trimMat: pal.stoneDark,
        roofMat: pal.crimson,
        armorMat: pal.steel,
        mountMat: pal.obsidian,
        titanBodyMat: pal.obsidian,
        titanCoreMat: pal.ember,
      };
    }

    // EGÍPCIOS: Rá, Ísis, Set (word boundaries so 'oranos'/'urano' never match 'ra')
    if (/\bra\b/.test(mg)) {
      return {
        style: 'egyptian',
        wallMat: pal.sandstone,
        trimMat: pal.gold,
        roofMat: pal.gold,
        armorMat: pal.gold,
        mountMat: pal.sandstone,
        titanBodyMat: pal.gold,
        titanCoreMat: pal.goldOre,
      };
    }
    if (/\bisis\b/.test(mg)) {
      return {
        style: 'egyptian',
        wallMat: pal.sandstone,
        trimMat: pal.turquoise,
        roofMat: pal.lapis,
        armorMat: pal.ivory,
        mountMat: pal.sandstone,
        titanBodyMat: pal.ivory,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (/\b(set|seth)\b/.test(mg)) {
      return {
        style: 'egyptian',
        wallMat: pal.sandstoneDark,
        trimMat: pal.ember,
        roofMat: pal.obsidian,
        armorMat: pal.steel,
        mountMat: pal.furBrown,
        titanBodyMat: pal.sandstoneDark,
        titanCoreMat: pal.ember,
      };
    }

    // NÓRDICOS: Odin, Thor, Loki
    if (mg.includes('odin')) {
      return {
        style: 'norse',
        wallMat: pal.norseTimber,
        trimMat: pal.timber,
        roofMat: pal.norseSlate,
        armorMat: pal.steel,
        mountMat: pal.furBrown,
        titanBodyMat: pal.iceBlue,
        titanCoreMat: pal.iceBlue,
      };
    }
    if (mg.includes('thor')) {
      return {
        style: 'norse',
        wallMat: pal.stoneDark,
        trimMat: pal.bronze,
        roofMat: pal.norseSlate,
        armorMat: pal.bronze,
        mountMat: pal.furBrown,
        titanBodyMat: pal.bronze,
        titanCoreMat: pal.goldOre,
      };
    }
    if (mg.includes('loki')) {
      return {
        style: 'norse',
        wallMat: pal.obsidian,
        trimMat: pal.ember,
        roofMat: pal.crimson,
        armorMat: pal.steel,
        mountMat: pal.obsidian,
        titanBodyMat: pal.obsidian,
        titanCoreMat: pal.ember,
      };
    }

    if (mg.includes('freyr') || mg.includes('frey')) {
      return {
        style: 'norse',
        wallMat: pal.norseTimber,
        trimMat: pal.gold,
        roofMat: pal.foliagePine,
        armorMat: pal.gold,
        mountMat: pal.furBrown,
        titanBodyMat: pal.gold,
        titanCoreMat: pal.goldOre,
      };
    }

    // ATLANTES: Cronos, Urano/Oranos, Gaia
    if (mg.includes('cronos') || mg.includes('kronos')) {
      return {
        style: 'atlantean',
        wallMat: pal.obsidian,
        trimMat: pal.orichalcum,
        roofMat: pal.crimson,
        armorMat: pal.orichalcum,
        mountMat: pal.ivory,
        titanBodyMat: pal.orichalcum,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('urano') || mg.includes('oranos') || mg.includes('ouranos')) {
      return {
        style: 'atlantean',
        wallMat: pal.ivory,
        trimMat: pal.turquoise,
        roofMat: pal.turquoise,
        armorMat: pal.crystalGlow,
        mountMat: pal.ivory,
        titanBodyMat: pal.ivory,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('gaia')) {
      return {
        style: 'atlantean',
        wallMat: pal.stoneDark,
        trimMat: pal.jade,
        roofMat: pal.timber,
        armorMat: pal.jade,
        mountMat: pal.furBrown,
        titanBodyMat: pal.jade,
        titanCoreMat: pal.goldOre,
      };
    }

    // CHINESES: Fu Xi, Nü Wa, Shennong
    if (mg.includes('fu xi')) {
      return {
        style: 'chinese',
        wallMat: pal.crimson,
        trimMat: pal.gold,
        roofMat: pal.jade,
        armorMat: pal.gold,
        mountMat: pal.ivory,
        titanBodyMat: pal.jade,
        titanCoreMat: pal.goldOre,
      };
    }
    if (mg.includes('nü wa') || mg.includes('nu wa')) {
      return {
        style: 'chinese',
        wallMat: pal.ivory,
        trimMat: pal.jade,
        roofMat: pal.jade,
        armorMat: pal.jade,
        mountMat: pal.ivory,
        titanBodyMat: pal.jade,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('shennong')) {
      return {
        style: 'chinese',
        wallMat: pal.crimson,
        trimMat: pal.bronze,
        roofMat: pal.gold,
        armorMat: pal.bronze,
        mountMat: pal.furBrown,
        titanBodyMat: pal.ember,
        titanCoreMat: pal.goldOre,
      };
    }
  }

  switch (pantheon) {
    case 'greek':
      return { style, wallMat: pal.marble, trimMat: pal.bronze, roofMat: pal.terracotta, armorMat: pal.bronze, mountMat: pal.furBrown, titanBodyMat: pal.bronze, titanCoreMat: pal.goldOre };
    case 'egyptian':
      return { style, wallMat: pal.sandstone, trimMat: pal.turquoise, roofMat: pal.gold, armorMat: pal.ivory, mountMat: pal.sandstone, titanBodyMat: pal.gold, titanCoreMat: pal.crystalGlow };
    case 'norse':
      return { style, wallMat: pal.norseTimber, trimMat: pal.timber, roofMat: pal.norseSlate, armorMat: pal.steel, mountMat: pal.furBrown, titanBodyMat: pal.iceBlue, titanCoreMat: pal.iceBlue };
    case 'atlantean':
      return { style, wallMat: pal.ivory, trimMat: pal.orichalcum, roofMat: pal.turquoise, armorMat: pal.orichalcum, mountMat: pal.ivory, titanBodyMat: pal.orichalcum, titanCoreMat: pal.crystalGlow };
    case 'chinese':
      return { style: 'chinese', wallMat: pal.crimson, trimMat: pal.gold, roofMat: pal.jade, armorMat: pal.jade, mountMat: pal.ivory, titanBodyMat: pal.jade, titanCoreMat: pal.goldOre };
    case 'aztec':
      return { style: 'egyptian', wallMat: pal.sandstoneDark, trimMat: pal.jade, roofMat: pal.gold, armorMat: pal.jade, mountMat: pal.furBrown, titanBodyMat: pal.jade, titanCoreMat: pal.ember };
    case 'roman':
      return { style: 'greek', wallMat: pal.marble, trimMat: pal.gold, roofMat: pal.crimson, armorMat: pal.steel, mountMat: pal.furBrown, titanBodyMat: pal.marble, titanCoreMat: pal.crimson };
    case 'japanese':
      return { style: 'norse', wallMat: pal.ivory, trimMat: pal.crimson, roofMat: pal.obsidian, armorMat: pal.crimson, mountMat: pal.obsidian, titanBodyMat: pal.obsidian, titanCoreMat: pal.ember };
    case 'eldritch':
      return { style: 'atlantean', wallMat: pal.obsidian, trimMat: pal.crystalGlow, roofMat: pal.obsidian, armorMat: pal.obsidian, mountMat: pal.obsidian, titanBodyMat: pal.obsidian, titanCoreMat: pal.crystalGlow };
    case 'celtic':
      return { style: 'norse', wallMat: pal.stoneDark, trimMat: pal.jade, roofMat: pal.timber, armorMat: pal.steel, mountMat: pal.furBrown, titanBodyMat: pal.stoneDark, titanCoreMat: pal.jade };
    case 'babylonian':
      return { style: 'egyptian', wallMat: pal.lapis, trimMat: pal.gold, roofMat: pal.gold, armorMat: pal.bronze, mountMat: pal.sandstone, titanBodyMat: pal.lapis, titanCoreMat: pal.goldOre };
    case 'lakota':
      return { style: 'norse', wallMat: pal.sandstone, trimMat: pal.turquoise, roofMat: pal.furBrown, armorMat: pal.furBrown, mountMat: pal.sandstone, titanBodyMat: pal.bronze, titanCoreMat: pal.iceBlue };
    case 'jotunn':
      return { style: 'norse', wallMat: pal.norseSlate, trimMat: pal.iceBlue, roofMat: pal.ember, armorMat: pal.iceBlue, mountMat: pal.stoneDark, titanBodyMat: pal.ember, titanCoreMat: pal.ember };
  }
}
