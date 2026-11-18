import { FaunaKind } from '../../game/types';
import { MapId, MAPS, MapWeatherKind, WorldSizeId } from './mapCatalog';

export type BiomeTreeStyle =
  | 'oak'
  | 'nordic_pine'
  | 'snow_pine'
  | 'palm'
  | 'marsh_cypress'
  | 'acacia'
  | 'jungle'
  | 'erebus_ash'
  | 'birch'
  | 'oriental';

export type BiomeRockStyle = 'stone' | 'sandstone' | 'ice' | 'obsidian' | 'mossy';
export type BiomeBerryStyle = 'temperate' | 'desert_date' | 'frost_berry' | 'jungle_fruit' | 'erebus_fungus';

export interface MapBiomeVisuals {
  /** [baseHex, roadHex, sandHex, highHex] */
  terrainPalette: [number, number, number, number];
  fertileHex: number;
  treeStyle: BiomeTreeStyle;
  secondaryTreeStyle?: BiomeTreeStyle;
  rockStyle: BiomeRockStyle;
  berryStyle: BiomeBerryStyle;
  weatherPool: MapWeatherKind[];
  waterEmissiveHex?: number;
  waterEmissiveIntensity?: number;
}

export interface MapResourceProfile {
  /** Starter & mid-map tree clusters: [x, z, count] */
  treeClusters: [number, number, number][];
  /** Gold mine coordinates & optional amount override */
  goldSpots: [number, number, number?][];
  /** Berry / foraging bushes */
  berrySpots: [number, number][];
  /** Neutral settlement foundations */
  settlementSpots: [number, number][];
  /** Fauna herd spawns: [FaunaKind, x, z] */
  faunaSpawns: [FaunaKind, number, number][];
  /** Dominant hunt kinds for Great Hunt god power */
  huntPool: FaunaKind[];
  /** Decorative ambient marine life pool for water/island/river maps */
  aquaticDecorPool: ('sea_turtle' | 'dolphin' | 'whale')[];
}

export const MAP_HALF_SIZE_GEO = 74;
export const PLAYABLE_HALF_SIZE_GEO = 58;

export interface UnknownRollState {
  seed: number;
  terrainTemplate:
    | 'highland'
    | 'oasis'
    | 'savannah'
    | 'marsh'
    | 'tundra'
    | 'acropolis'
    | 'islands'
    | 'archipelago'
    | 'valley_of_the_kings'
    | 'midgard';
  biomeTemplate: Exclude<MapId, 'land_unknown' | 'the_unknown'>;
  noiseOffsetX: number;
  noiseOffsetZ: number;
}

const LAND_ONLY_TEMPLATES: UnknownRollState['terrainTemplate'][] = [
  'acropolis',
  'savannah',
  'tundra',
  'oasis',
  'valley_of_the_kings',
  'highland',
  'marsh',
];

const ANY_WORLD_TEMPLATES: UnknownRollState['terrainTemplate'][] = [
  ...LAND_ONLY_TEMPLATES,
  'islands',
  'archipelago',
  'midgard',
];

const UNKNOWN_BIOME_POOL_LAND: Exclude<MapId, 'land_unknown' | 'the_unknown'>[] = [
  'mediterranean',
  'alfheim',
  'savannah',
  'tundra',
  'oasis',
  'acropolis',
  'valley_of_the_kings',
  'marsh',
  'yucatan',
  'yellow_river',
];

const UNKNOWN_BIOME_POOL_ALL: Exclude<MapId, 'land_unknown' | 'the_unknown'>[] = [
  ...UNKNOWN_BIOME_POOL_LAND,
  'islands',
  'archipelago',
  'midgard',
  'vinlandsaga',
  'ghost_lake',
  'erebus',
];

function seededUnit(seed: number, salt: number): number {
  const n = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

let activeLandUnknown: UnknownRollState = {
  seed: 101,
  terrainTemplate: 'savannah',
  biomeTemplate: 'savannah',
  noiseOffsetX: 3.1,
  noiseOffsetZ: -2.4,
};

let activeTheUnknown: UnknownRollState = {
  seed: 202,
  terrainTemplate: 'archipelago',
  biomeTemplate: 'islands',
  noiseOffsetX: -4.2,
  noiseOffsetZ: 5.7,
};

/**
 * Rolls a fresh deterministic terrain & biome seed for Terra Desconhecida / O Desconhecido
 * at the start of a match so groundHeightAt, Minimap, NavGrid, Flora & Fauna stay 100% synced.
 */
export function rollUnknownMapVariant(mapId: MapId, explicitSeed?: number): UnknownRollState | null {
  if (mapId !== 'land_unknown' && mapId !== 'the_unknown') return null;
  const seed = explicitSeed ?? Math.floor(Math.random() * 100000) + 17;
  if (mapId === 'land_unknown') {
    const tIdx = Math.floor(seededUnit(seed, 1) * LAND_ONLY_TEMPLATES.length);
    const bIdx = Math.floor(seededUnit(seed, 2) * UNKNOWN_BIOME_POOL_LAND.length);
    activeLandUnknown = {
      seed,
      terrainTemplate: LAND_ONLY_TEMPLATES[tIdx],
      biomeTemplate: UNKNOWN_BIOME_POOL_LAND[bIdx],
      noiseOffsetX: (seededUnit(seed, 3) - 0.5) * 16,
      noiseOffsetZ: (seededUnit(seed, 4) - 0.5) * 16,
    };
    return activeLandUnknown;
  } else {
    const tIdx = Math.floor(seededUnit(seed, 5) * ANY_WORLD_TEMPLATES.length);
    const bIdx = Math.floor(seededUnit(seed, 6) * UNKNOWN_BIOME_POOL_ALL.length);
    activeTheUnknown = {
      seed,
      terrainTemplate: ANY_WORLD_TEMPLATES[tIdx],
      biomeTemplate: UNKNOWN_BIOME_POOL_ALL[bIdx],
      noiseOffsetX: (seededUnit(seed, 7) - 0.5) * 16,
      noiseOffsetZ: (seededUnit(seed, 8) - 0.5) * 16,
    };
    return activeTheUnknown;
  }
}

export function getActiveUnknownState(mapId: MapId): UnknownRollState | null {
  if (mapId === 'land_unknown') return activeLandUnknown;
  if (mapId === 'the_unknown') return activeTheUnknown;
  return null;
}

export function resolveEffectiveMapId(mapId: MapId): Exclude<MapId, 'land_unknown' | 'the_unknown'> {
  if (mapId === 'land_unknown') return activeLandUnknown.biomeTemplate;
  if (mapId === 'the_unknown') return activeTheUnknown.biomeTemplate;
  return mapId;
}

const BIOME_VISUALS: Record<Exclude<MapId, 'land_unknown' | 'the_unknown'>, MapBiomeVisuals> = {
  // The Titans
  highland: {
    terrainPalette: [0x517042, 0x938667, 0xb8a67a, 0x7d8070],
    fertileHex: 0x4f7d38,
    treeStyle: 'oak',
    secondaryTreeStyle: 'birch',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  islands: {
    terrainPalette: [0x5b7c46, 0xa89668, 0xd8c38d, 0x738a56],
    fertileHex: 0x568c3e,
    treeStyle: 'palm',
    secondaryTreeStyle: 'oak',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  marsh: {
    terrainPalette: [0x3d593c, 0x625a46, 0x4b6345, 0x566e46],
    fertileHex: 0x386634,
    treeStyle: 'marsh_cypress',
    secondaryTreeStyle: 'oak',
    rockStyle: 'mossy',
    berryStyle: 'temperate',
    weatherPool: ['rain', 'rain', 'clear'],
  },
  megalopolis: {
    terrainPalette: [0x5c7545, 0xb2a58c, 0xcab992, 0x82846a],
    fertileHex: 0x57803c,
    treeStyle: 'oak',
    secondaryTreeStyle: 'marsh_cypress',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  tundra: {
    terrainPalette: [0xa9b8c8, 0x788492, 0xcad6e2, 0xe8eff7],
    fertileHex: 0x7d929e,
    treeStyle: 'snow_pine',
    secondaryTreeStyle: 'nordic_pine',
    rockStyle: 'ice',
    berryStyle: 'frost_berry',
    weatherPool: ['snow', 'snow', 'clear'],
  },

  // Base Game (21)
  acropolis: {
    terrainPalette: [0x627c47, 0xb3ab9b, 0xcab688, 0x948d7f],
    fertileHex: 0x587f3d,
    treeStyle: 'oak',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'clear', 'rain'],
  },
  alfheim: {
    terrainPalette: [0x6f897e, 0x7a746c, 0x9aa8b8, 0xe2e8f0],
    fertileHex: 0x4b6e58,
    treeStyle: 'nordic_pine',
    secondaryTreeStyle: 'birch',
    rockStyle: 'stone',
    berryStyle: 'frost_berry',
    weatherPool: ['clear', 'snow', 'rain'],
  },
  anatolia: {
    terrainPalette: [0x9e8453, 0xb89d6b, 0xd4b67a, 0x8f744c],
    fertileHex: 0x6f8440,
    treeStyle: 'acacia',
    secondaryTreeStyle: 'oak',
    rockStyle: 'sandstone',
    berryStyle: 'desert_date',
    weatherPool: ['clear', 'sandstorm'],
  },
  archipelago: {
    terrainPalette: [0x627f48, 0xb29c68, 0xdec890, 0x798f58],
    fertileHex: 0x4f8a41,
    treeStyle: 'palm',
    secondaryTreeStyle: 'jungle',
    rockStyle: 'sandstone',
    berryStyle: 'jungle_fruit',
    weatherPool: ['clear', 'rain'],
  },
  erebus: {
    terrainPalette: [0x3d302f, 0x524542, 0x262121, 0x573b2f],
    fertileHex: 0x4a2e28,
    treeStyle: 'erebus_ash',
    rockStyle: 'obsidian',
    berryStyle: 'erebus_fungus',
    weatherPool: ['clear', 'sandstorm'],
    waterEmissiveHex: 0x7f1d1d,
    waterEmissiveIntensity: 0.58,
  },
  ghost_lake: {
    terrainPalette: [0x9cb1c2, 0x64748b, 0xcbd5e1, 0xf1f5f9],
    fertileHex: 0x7e96a8,
    treeStyle: 'snow_pine',
    secondaryTreeStyle: 'nordic_pine',
    rockStyle: 'ice',
    berryStyle: 'frost_berry',
    weatherPool: ['snow', 'clear'],
  },
  jotunheim: {
    terrainPalette: [0x8b9dad, 0x5b6778, 0xcbd5e1, 0xf8fafc],
    fertileHex: 0x667d8c,
    treeStyle: 'snow_pine',
    secondaryTreeStyle: 'nordic_pine',
    rockStyle: 'ice',
    berryStyle: 'frost_berry',
    weatherPool: ['snow', 'snow', 'clear'],
  },
  king_of_the_hill: {
    terrainPalette: [0x587442, 0xa89b79, 0xc8b588, 0x878370],
    fertileHex: 0x58823c,
    treeStyle: 'oak',
    secondaryTreeStyle: 'birch',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  mediterranean: {
    terrainPalette: [0x557540, 0x9d8a64, 0xcab688, 0x6b7c4f],
    fertileHex: 0x58823a,
    treeStyle: 'oak',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'clear', 'rain'],
  },
  midgard: {
    terrainPalette: [0x567054, 0x857f72, 0xb8b29b, 0x9cb0ba],
    fertileHex: 0x4d7348,
    treeStyle: 'nordic_pine',
    secondaryTreeStyle: 'birch',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain', 'snow'],
  },
  nile: {
    terrainPalette: [0xd4b475, 0xb5955a, 0xc29e61, 0xe0c489],
    fertileHex: 0x5f8738,
    treeStyle: 'palm',
    rockStyle: 'sandstone',
    berryStyle: 'desert_date',
    weatherPool: ['clear', 'sandstorm'],
  },
  nomad: {
    terrainPalette: [0x6c7a48, 0x9a8d68, 0xc0ae7e, 0x82845b],
    fertileHex: 0x5f8242,
    treeStyle: 'birch',
    secondaryTreeStyle: 'oak',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  oasis: {
    terrainPalette: [0xd9b370, 0xb88f4c, 0xe2c78c, 0xc79248],
    fertileHex: 0x568236,
    treeStyle: 'palm',
    secondaryTreeStyle: 'acacia',
    rockStyle: 'sandstone',
    berryStyle: 'desert_date',
    weatherPool: ['clear', 'sandstorm', 'sandstorm'],
  },
  savannah: {
    terrainPalette: [0xb88d48, 0x9e773c, 0xd4b26e, 0x9e6a32],
    fertileHex: 0x7c8f36,
    treeStyle: 'acacia',
    rockStyle: 'sandstone',
    berryStyle: 'desert_date',
    weatherPool: ['clear', 'sandstorm'],
  },
  sea_of_worms: {
    terrainPalette: [0x547349, 0x9a8c66, 0xc2b07e, 0x76825c],
    fertileHex: 0x4f7d40,
    treeStyle: 'marsh_cypress',
    secondaryTreeStyle: 'oak',
    rockStyle: 'mossy',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  sudden_death: {
    terrainPalette: [0x566b46, 0x8d8573, 0xb3a582, 0x78766a],
    fertileHex: 0x4e753e,
    treeStyle: 'oak',
    secondaryTreeStyle: 'nordic_pine',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  team_migration: {
    terrainPalette: [0x5d7948, 0xa2936b, 0xd0be8c, 0x748556],
    fertileHex: 0x5a8540,
    treeStyle: 'birch',
    secondaryTreeStyle: 'palm',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
  valley_of_the_kings: {
    terrainPalette: [0xcd9d56, 0xa87638, 0xe0ba76, 0xa15e2a],
    fertileHex: 0x748a3a,
    treeStyle: 'palm',
    rockStyle: 'sandstone',
    berryStyle: 'desert_date',
    weatherPool: ['clear', 'sandstorm'],
  },
  vinlandsaga: {
    terrainPalette: [0x567255, 0x878374, 0xc2c8cc, 0x9db2be],
    fertileHex: 0x497344,
    treeStyle: 'birch',
    secondaryTreeStyle: 'nordic_pine',
    rockStyle: 'stone',
    berryStyle: 'frost_berry',
    weatherPool: ['clear', 'snow', 'rain'],
  },
  watering_hole: {
    terrainPalette: [0xba8f50, 0x9c7640, 0xd4b274, 0xa26d38],
    fertileHex: 0x628c3a,
    treeStyle: 'acacia',
    secondaryTreeStyle: 'palm',
    rockStyle: 'sandstone',
    berryStyle: 'desert_date',
    weatherPool: ['clear', 'sandstorm'],
  },

  // Bonus (2)
  yucatan: {
    terrainPalette: [0x3f6e34, 0x7a6946, 0xa89467, 0x567d46],
    fertileHex: 0x357830,
    treeStyle: 'jungle',
    secondaryTreeStyle: 'palm',
    rockStyle: 'mossy',
    berryStyle: 'jungle_fruit',
    weatherPool: ['rain', 'clear'],
  },
  yellow_river: {
    terrainPalette: [0x747c3e, 0xa38c54, 0xbca468, 0x8a7d4a],
    fertileHex: 0x588236,
    treeStyle: 'oriental',
    secondaryTreeStyle: 'birch',
    rockStyle: 'stone',
    berryStyle: 'temperate',
    weatherPool: ['clear', 'rain'],
  },
};

export function getMapBiomeVisuals(mapId: MapId): MapBiomeVisuals {
  const eff = resolveEffectiveMapId(mapId);
  return BIOME_VISUALS[eff] ?? BIOME_VISUALS.mediterranean;
}

export function getEffectiveMapConfig(mapId: MapId) {
  if (mapId === 'land_unknown' || mapId === 'the_unknown') {
    const eff = resolveEffectiveMapId(mapId);
    const base = MAPS[eff];
    const outer = MAPS[mapId];
    return {
      ...base,
      id: mapId,
      name: outer.name,
      subtitle: `${outer.subtitle} · Bioma Atual: ${base.name}`,
      specialRule: outer.specialRule,
    };
  }
  return MAPS[mapId];
}

/**
 * Computes terrain elevation at world (x, z) for any of the 29 maps.
 * Guarantees player base (-34, 34) and enemy base (34, -34) rest on solid ground
 * and ensures all water-divided maps provide navigable shallow reefs/fords >= -0.26
 * (above NavigationGrid's WATER_WALK_LIMIT = -0.34).
 */
export function groundHeightAt(x: number, z: number, mapId: MapId = 'mediterranean'): number {
  const distPlayer = Math.hypot(x + 34, z - 34);
  const distEnemy = Math.hypot(x - 34, z + 34);
  const baseFlatten =
    Math.min(1, Math.max(0, (distPlayer - 11) / 10)) *
    Math.min(1, Math.max(0, (distEnemy - 11) / 10));

  const edgeDist = Math.max(Math.abs(x), Math.abs(z));
  let shoreDrop = 0;
  if (edgeDist > PLAYABLE_HALF_SIZE_GEO) {
    const t = Math.min(1, (edgeDist - PLAYABLE_HALF_SIZE_GEO) / (MAP_HALF_SIZE_GEO - PLAYABLE_HALF_SIZE_GEO));
    shoreDrop = -t * t * 4.2;
  }

  let effectiveKey: string = mapId;
  let nxOff = 0;
  let nzOff = 0;
  if (mapId === 'land_unknown') {
    effectiveKey = activeLandUnknown.terrainTemplate;
    nxOff = activeLandUnknown.noiseOffsetX;
    nzOff = activeLandUnknown.noiseOffsetZ;
  } else if (mapId === 'the_unknown') {
    effectiveKey = activeTheUnknown.terrainTemplate;
    nxOff = activeTheUnknown.noiseOffsetX;
    nzOff = activeTheUnknown.noiseOffsetZ;
  }

  const sx = x + nxOff;
  const sz = z + nzOff;

  if (effectiveKey === 'acropolis') {
    const pPlateau = Math.max(0, 1 - Math.max(0, (distPlayer - 15) / 12)) * 2.1;
    const ePlateau = Math.max(0, 1 - Math.max(0, (distEnemy - 15) / 12)) * 2.1;
    const centerBasin = Math.sin(sx * 0.05) * Math.cos(sz * 0.05) * 0.55 * baseFlatten;
    return Math.max(-3.6, 0.35 + pPlateau + ePlateau + centerBasin + shoreDrop);
  }

  if (effectiveKey === 'highland') {
    const riverDist = Math.abs(x - z) / Math.SQRT2;
    const fordA = Math.hypot(x + 15, z + 15);
    const fordB = Math.hypot(x - 15, z - 15);
    const fordFactor =
      Math.min(1, Math.max(0, (fordA - 5.5) / 4.5)) *
      Math.min(1, Math.max(0, (fordB - 5.5) / 4.5));
    const riverDip = riverDist < 9.5 ? -Math.cos((riverDist / 9.5) * (Math.PI / 2)) * 1.48 * fordFactor : 0;
    const highlands = (Math.sin(sx * 0.065) * Math.cos(sz * 0.065) * 1.65 + 0.55) * baseFlatten;
    const midPlateaus = Math.max(0, 1 - Math.abs(riverDist - 24) / 14) * 1.05 * baseFlatten;
    return Math.max(-3.6, 0.42 + highlands + midPlateaus + riverDip + shoreDrop);
  }

  if (effectiveKey === 'islands') {
    const dCenter = Math.hypot(x, z);
    const onPlayerIsland = Math.max(0, 1 - Math.max(0, distPlayer - 15) / 8);
    const onEnemyIsland = Math.max(0, 1 - Math.max(0, distEnemy - 15) / 8);
    const onCenterIsland = Math.max(0, 1 - Math.max(0, dCenter - 11) / 6.5);
    const landMask = Math.max(onPlayerIsland, onEnemyIsland, onCenterIsland);
    const diagSandbar = Math.abs(x + z) / Math.SQRT2 < 5.6 && Math.hypot(x, z) < 42 ? 1 : 0;
    const seaDepth = landMask > 0.05 ? 0 : diagSandbar ? -0.95 : -2.1;
    const islandTop = landMask * 1.15 + Math.sin(sx * 0.09) * Math.cos(sz * 0.09) * 0.35 * landMask * baseFlatten;
    return Math.max(-3.6, Math.min(2.2, 0.72 + seaDepth + islandTop + shoreDrop));
  }

  if (effectiveKey === 'archipelago') {
    const d1 = Math.hypot(x + 34, z - 34);
    const d2 = Math.hypot(x - 34, z + 34);
    const d3 = Math.hypot(x, z);
    const d4 = Math.hypot(x + 22, z + 18);
    const d5 = Math.hypot(x - 22, z - 18);
    const nearest = Math.min(d1, d2, d3, d4, d5);
    const isletMask = Math.max(0, 1 - Math.max(0, nearest - 10.5) / 7);
    const reefBridge =
      (Math.abs(x + z) / Math.SQRT2 < 5.2 && Math.hypot(x, z) < 42) ||
      (Math.abs(x - z) / Math.SQRT2 < 4.5 && Math.hypot(x, z) < 30);
    const baseY = isletMask > 0.05 ? 0.55 + isletMask * 0.65 : reefBridge ? -0.22 : -1.55;
    return Math.max(-3.6, baseY + shoreDrop);
  }

  if (effectiveKey === 'team_migration' || effectiveKey === 'vinlandsaga') {
    const onPlayerIsle = Math.max(0, 1 - Math.max(0, distPlayer - 12.5) / 6);
    const onEnemyIsle = Math.max(0, 1 - Math.max(0, distEnemy - 12.5) / 6);
    const distContinent = Math.hypot(x * 0.85, z * 0.85);
    const onContinent = Math.max(0, 1 - Math.max(0, distContinent - 20) / 8);
    const channelBridge = Math.abs(x + z) / Math.SQRT2 < 6.0 && Math.hypot(x, z) < 42;
    const land = Math.max(onPlayerIsle, onEnemyIsle, onContinent);
    const yBase = land > 0.05 ? 0.45 + land * 0.68 : channelBridge ? -0.20 : -1.65;
    const relief = Math.sin(sx * 0.07) * Math.cos(sz * 0.07) * 0.55 * land * baseFlatten;
    return Math.max(-3.6, yBase + relief + shoreDrop);
  }

  if (effectiveKey === 'marsh') {
    const bogWave = Math.sin(sx * 0.085) * Math.cos(sz * 0.085) + Math.sin((sx - sz) * 0.06) * 0.55;
    const pool = bogWave * 0.58 * baseFlatten;
    return Math.max(-3.6, 0.36 + pool + shoreDrop);
  }

  if (effectiveKey === 'tundra') {
    const gentleSteppe = (Math.sin(sx * 0.048) * Math.cos(sz * 0.052) * 0.8 + Math.cos((sx + sz) * 0.04) * 0.35) * baseFlatten;
    return Math.max(-3.6, 0.42 + gentleSteppe + shoreDrop);
  }

  if (effectiveKey === 'anatolia') {
    const dSeaNW = Math.hypot(x + 42, z + 42);
    const dSeaSE = Math.hypot(x - 42, z - 42);
    const seaBasin =
      (dSeaNW < 22 ? -Math.cos((dSeaNW / 22) * (Math.PI / 2)) * 2.1 : 0) +
      (dSeaSE < 22 ? -Math.cos((dSeaSE / 22) * (Math.PI / 2)) * 2.1 : 0);
    const ridge = Math.sin(sx * 0.055) * Math.cos(sz * 0.055) * 1.15 * baseFlatten;
    return Math.max(-3.6, 0.48 + ridge + seaBasin + shoreDrop);
  }

  if (effectiveKey === 'midgard') {
    const r = Math.hypot(x, z);
    const rimDip = r > 44 ? -Math.min(2.6, (r - 44) * 0.22) : 0;
    const hills = (Math.sin(sx * 0.06) * Math.cos(sz * 0.06) * 1.1 + 0.35) * baseFlatten;
    return Math.max(-3.6, 0.46 + hills + rimDip + shoreDrop);
  }

  if (effectiveKey === 'king_of_the_hill') {
    const r = Math.hypot(x, z);
    const hillCore = Math.max(0, 1 - Math.max(0, r - 9.5) / 14) * 1.75;
    const outerFlat = Math.sin(sx * 0.05) * Math.cos(sz * 0.05) * 0.48 * baseFlatten;
    return Math.max(-3.6, 0.38 + hillCore + outerFlat + shoreDrop);
  }

  if (effectiveKey === 'savannah') {
    const plain = (Math.sin(sx * 0.04) * Math.cos(sz * 0.04) * 0.55 + Math.cos(sx * 0.09) * 0.2) * baseFlatten;
    return Math.max(-3.6, 0.42 + plain + shoreDrop);
  }

  if (effectiveKey === 'watering_hole') {
    const holes: [number, number, number][] = [
      [0, 0, 8.5],
      [-20, -16, 6.5],
      [20, 16, 6.5],
      [-18, 20, 5.5],
      [18, -20, 5.5],
    ];
    let pondDip = 0;
    for (const [hx, hz, hr] of holes) {
      const d = Math.hypot(x - hx, z - hz);
      if (d < hr) {
        pondDip = Math.min(pondDip, -Math.cos((d / hr) * (Math.PI / 2)) * 0.65);
      }
    }
    const flatSteppe = Math.sin(sx * 0.045) * Math.cos(sz * 0.045) * 0.45 * baseFlatten;
    return Math.max(-3.6, 0.40 + flatSteppe + pondDip + shoreDrop);
  }

  if (effectiveKey === 'valley_of_the_kings') {
    const canyonDist = Math.abs(x + z) / Math.SQRT2;
    const flankingDunes = canyonDist > 16 ? Math.min(2.4, (canyonDist - 16) * 0.14) * baseFlatten : 0;
    const ripples = Math.sin(sx * 0.065) * Math.cos(sz * 0.065) * 0.65 * baseFlatten;
    return Math.max(-3.6, 0.36 + flankingDunes + ripples + shoreDrop);
  }

  if (effectiveKey === 'sea_of_worms') {
    const curveCenter = Math.sin(x * 0.09) * 14;
    const wormDist = Math.abs(z - curveCenter);
    const bridgeBlend = Math.min(1, Math.max(0, (Math.hypot(x, z) - 7.5) / 6));
    const canalDip = wormDist < 6.2 ? -Math.cos((wormDist / 6.2) * (Math.PI / 2)) * 1.15 * bridgeBlend * baseFlatten : 0;
    const coast = Math.sin(sx * 0.06) * Math.cos(sz * 0.06) * 0.9 * baseFlatten;
    return Math.max(-3.6, 0.44 + coast + canalDip + shoreDrop);
  }

  if (effectiveKey === 'nile' || effectiveKey === 'yellow_river') {
    const dunes = (Math.sin(sx * 0.05 + sz * 0.03) * 0.8 + Math.cos(sz * 0.07) * 0.35) * baseFlatten;
    const riverDist = Math.abs(x - z) / Math.SQRT2;
    const fordRadius = effectiveKey === 'yellow_river' ? 10.5 : 8.5;
    const fordBlend = Math.min(1, Math.max(0, (Math.hypot(x, z) - fordRadius) / 8));
    const riverDip = riverDist < 8 ? -Math.cos((riverDist / 8) * (Math.PI / 2)) * 1.45 * fordBlend : 0;
    return Math.max(-3.6, 0.42 + dunes + riverDip + shoreDrop);
  }

  if (effectiveKey === 'ghost_lake') {
    const r = Math.hypot(x, z);
    const rim = Math.max(0, Math.min(1, (r - 19) / 12));
    const hills = (Math.sin(sx * 0.07) * Math.cos(sz * 0.07) * 1.35 + 0.55) * rim * baseFlatten;
    return Math.max(-3.6, 0.12 + hills + shoreDrop);
  }

  if (effectiveKey === 'oasis') {
    const r = Math.hypot(x, z);
    const pondDip = r < 9.5 ? -Math.cos((r / 9.5) * (Math.PI / 2)) * 1.55 : 0;
    const dunes = (Math.sin(sx * 0.06 + sz * 0.04) * 0.9 + Math.cos(sx * 0.08 - sz * 0.05) * 0.4) * baseFlatten;
    return Math.max(-3.6, 0.45 + dunes + pondDip + shoreDrop);
  }

  if (effectiveKey === 'jotunheim') {
    const valleyDist = Math.abs(x + z) / Math.SQRT2;
    const ridgeWall = valleyDist > 21 ? Math.min(3.1, (valleyDist - 21) * 0.24) * baseFlatten : 0;
    const frostHills = Math.sin(sx * 0.08) * Math.cos(sz * 0.08) * 0.9 * baseFlatten;
    return Math.max(-3.6, 0.42 + ridgeWall + frostHills + shoreDrop);
  }

  if (effectiveKey === 'erebus') {
    const riverDist = Math.abs(x - z) / Math.SQRT2;
    const bridgeBlend = Math.min(1, Math.max(0, (Math.hypot(x, z) - 9.5) / 6));
    const lavaTrench = riverDist < 6.5 ? -Math.cos((riverDist / 6.5) * (Math.PI / 2)) * 1.65 * bridgeBlend : 0;
    const crags = Math.sin(sx * 0.09) * Math.cos(sz * 0.08) * 1.45 * baseFlatten;
    return Math.max(-3.6, 0.48 + crags + lavaTrench + shoreDrop);
  }

  if (effectiveKey === 'yucatan') {
    const jungleTerrace =
      (Math.sin(sx * 0.06) * Math.cos(sz * 0.06) * 1.15 + Math.cos((sx - sz) * 0.08) * 0.5) * baseFlatten;
    return Math.max(-3.6, 0.4 + jungleTerrace + shoreDrop);
  }

  if (effectiveKey === 'alfheim') {
    const ridges =
      (Math.sin(sx * 0.075) * Math.cos(sz * 0.075) * 1.9 + Math.sin((sx - sz) * 0.08) * 0.75) * baseFlatten;
    return Math.max(-3.6, 0.48 + ridges + shoreDrop);
  }

  const hill =
    (Math.sin(sx * 0.065) * Math.cos(sz * 0.065) * 1.35 + Math.sin((sx + sz) * 0.09) * 0.55) * baseFlatten;
  return Math.max(-3.6, 0.35 + hill + shoreDrop);
}

/**
 * Generates authentic Flora, Gold, Berry, Settlement & All-5-Category Fauna distributions tailored per map.
 */
export function buildMapResourceProfile(
  mapId: MapId,
  worldSize: WorldSizeId
): MapResourceProfile {
  const eff = resolveEffectiveMapId(mapId);

  const defaultSettlements: [number, number][] =
    eff === 'sudden_death'
      ? []
      : eff === 'king_of_the_hill'
      ? [
          [-18, 42],
          [-44, 14],
          [18, -42],
          [44, -14],
        ]
      : eff === 'islands' || eff === 'archipelago'
      ? [
          [-24, 30],
          [24, -30],
          [-4, 4],
          [4, -4],
        ]
      : eff === 'team_migration' || eff === 'vinlandsaga'
      ? [
          [-10, 12],
          [10, -12],
          [-16, -16],
          [16, 16],
        ]
      : [
          [-15, 42],
          [-42, 12],
          [15, -42],
          [42, -12],
        ];

  const defaultBerries: [number, number][] = [
    [-41, 38],
    [-39, 41],
    [41, -38],
    [39, -41],
    [-8, 10],
    [8, -10],
  ];
  if (worldSize !== 'normal') {
    defaultBerries.push([-14, 22], [14, -22]);
  }

  let goldSpots: [number, number, number?][] = [
    [-26, 43, 950],
    [-43, 22, 950],
    [26, -43, 950],
    [43, -22, 950],
    [-11, -11, 1100],
    [11, 11, 1100],
  ];
  if (eff !== 'king_of_the_hill') {
    goldSpots.push([0, 0, 1200]);
  }

  if (eff === 'valley_of_the_kings') {
    goldSpots = [
      [-28, 42, 850],
      [28, -42, 850],
      [-6, 6, 1500],
      [6, -6, 1500],
      [-14, 14, 1400],
      [14, -14, 1400],
      [0, 0, 1800],
    ];
  } else if (eff === 'team_migration' || eff === 'vinlandsaga') {
    goldSpots = [
      [-31, 41, 550],
      [31, -41, 550],
      [-8, 8, 1350],
      [8, -8, 1350],
      [-14, -12, 1350],
      [14, 12, 1350],
      [0, 0, 1500],
    ];
  }

  if (worldSize === 'large' || worldSize === 'giant') {
    goldSpots.push([-20, -24, 1050], [20, 24, 1050]);
  }
  if (worldSize === 'giant') {
    goldSpots.push([-32, -8, 1100], [32, 8, 1100]);
  }

  let treeClusters: [number, number, number][] = [
    [-47, 34, 6],
    [-24, 49, 5],
    [47, -34, 6],
    [24, -49, 5],
    [-24, -20, 7],
    [24, 20, 7],
    [-12, 16, 4],
    [12, -16, 4],
  ];

  if (eff === 'tundra') {
    treeClusters = [
      [-45, 34, 3],
      [45, -34, 3],
      [-18, -18, 4],
      [18, 18, 4],
      [-10, 12, 2],
      [10, -12, 2],
    ];
  } else if (eff === 'oasis') {
    treeClusters = [
      [-44, 33, 3],
      [44, -33, 3],
      [-11, 6, 6],
      [11, -6, 6],
      [-6, -11, 6],
      [6, 11, 6],
      [-12, -12, 4],
      [12, 12, 4],
    ];
  } else if (eff === 'marsh' || eff === 'yucatan' || eff === 'alfheim') {
    treeClusters.push([-32, 16, 7], [32, -16, 7], [-16, -32, 6], [16, 32, 6]);
  } else if (eff === 'king_of_the_hill') {
    treeClusters = [
      [-46, 35, 6],
      [-23, 48, 5],
      [46, -35, 6],
      [23, -48, 5],
      [-20, 18, 5],
      [20, -18, 5],
      [-22, -20, 6],
      [22, 20, 6],
    ];
  }

  if (worldSize !== 'normal') {
    treeClusters.push([-34, -34, 5], [34, 34, 5]);
  }

  // Biome-authentic Fauna herds across all AoM: Retold categories:
  // Herdables (cow, goat, pig, turkey, capybara, yak), Starter Chickens, Passive Huntables, Defensive Lurable Huntables & Predators
  const herdsByMap: Record<
    Exclude<MapId, 'land_unknown' | 'the_unknown'>,
    { huntPool: FaunaKind[]; spawns: [FaunaKind, number, number][] }
  > = {
    tundra: {
      huntPool: ['reindeer', 'moose', 'musk_ox', 'wolf'],
      spawns: [
        ['yak', -30, 31], ['yak', -28, 32], ['yak', 30, -31], ['yak', 28, -32],
        ['reindeer', -28, 27], ['reindeer', -26, 25], ['moose', -24, 26],
        ['musk_ox', -39, 24], ['musk_ox', -41, 22],
        ['reindeer', 28, -27], ['moose', 26, -25], ['musk_ox', 39, -24],
        ['reindeer', -12, 8], ['moose', 12, -8], ['wolf', -16, -14], ['wolf', 16, 14], ['bear', 0, -12], ['bear', 0, 12],
      ],
    },
    ghost_lake: {
      huntPool: ['reindeer', 'moose', 'musk_ox', 'bear'],
      spawns: [
        ['yak', -30, 31], ['yak', 30, -31],
        ['reindeer', -29, 26], ['reindeer', -27, 24], ['moose', -40, 24],
        ['reindeer', 29, -26], ['moose', 27, -24], ['deer', 40, -24],
        ['musk_ox', -22, -16], ['musk_ox', 22, 16],
        ['wolf', -12, -6], ['wolf', 12, 6], ['bear', -20, 10], ['bear', 20, -10],
      ],
    },
    jotunheim: {
      huntPool: ['musk_ox', 'moose', 'reindeer', 'bear'],
      spawns: [
        ['yak', -30, 30], ['yak', 30, -30],
        ['reindeer', -28, 26], ['moose', -26, 24], ['musk_ox', -38, 24],
        ['reindeer', 28, -26], ['moose', 38, -24],
        ['bear', -14, 10], ['bear', 14, -10], ['wolf', -6, -6], ['wolf', 6, 6],
      ],
    },
    nile: {
      huntPool: ['gazelle', 'camel', 'hippo', 'crocodile'],
      spawns: [
        ['goat', -30, 30], ['goat', -29, 32], ['goat', 30, -30], ['goat', 29, -32],
        ['chicken', -37, 36], ['chicken', -38, 37], ['chicken', 37, -36], ['chicken', 38, -37],
        ['gazelle', -28, 27], ['gazelle', -26, 25], ['camel', -39, 25],
        ['gazelle', 28, -27], ['gazelle', 26, -25], ['camel', 39, -25],
        ['hippo', -10, -6], ['hippo', 10, 6], ['crocodile', -14, -12], ['crocodile', 14, 12], ['hyena', 8, 16], ['hyena', -8, -16],
      ],
    },
    oasis: {
      huntPool: ['camel', 'gazelle', 'elephant_wild', 'hyena'],
      spawns: [
        ['goat', -30, 30], ['goat', 30, -30],
        ['chicken', -37, 36], ['chicken', 37, -36],
        ['camel', -28, 27], ['gazelle', -26, 25], ['gazelle', -39, 25],
        ['camel', 28, -27], ['gazelle', 39, -25],
        ['elephant_wild', -14, 6], ['elephant_wild', 14, -6],
        ['lion', -16, -12], ['lion', 16, 12], ['hyena', -22, 18], ['hyena', 22, -18],
      ],
    },
    valley_of_the_kings: {
      huntPool: ['camel', 'gazelle', 'hyena', 'lion'],
      spawns: [
        ['goat', -30, 31], ['goat', 30, -31],
        ['camel', -28, 27], ['gazelle', -26, 25], ['gazelle', -38, 25],
        ['camel', 28, -27], ['gazelle', 38, -25],
        ['lion', -8, 4], ['lion', 8, -4], ['hyena', -3, -8], ['hyena', 3, 8],
        ['crocodile', -12, 12], ['crocodile', 12, -12],
      ],
    },
    savannah: {
      huntPool: ['zebra', 'giraffe', 'rhino', 'elephant_wild'],
      spawns: [
        ['goat', -30, 30], ['goat', 30, -30],
        ['zebra', -28, 27], ['zebra', -26, 25], ['giraffe', -24, 24],
        ['rhino', -39, 24], ['elephant_wild', -41, 22],
        ['zebra', 28, -27], ['giraffe', 26, -25], ['rhino', 39, -24],
        ['elephant_wild', -12, 14], ['elephant_wild', 12, -14],
        ['lion', -16, -12], ['lion', 16, 12], ['hyena', 0, 14], ['hyena', 0, -14],
      ],
    },
    watering_hole: {
      huntPool: ['zebra', 'giraffe', 'rhino', 'hippo'],
      spawns: [
        ['goat', -30, 31], ['goat', 30, -31],
        ['zebra', -28, 27], ['giraffe', -26, 25], ['rhino', -18, 17],
        ['zebra', 28, -27], ['elephant_wild', 18, -17],
        ['hippo', -4, 4], ['hippo', 4, -4], ['rhino', -20, -14], ['hippo', 20, 14],
        ['lion', -14, -18], ['hyena', 14, 18], ['crocodile', 2, 6],
      ],
    },
    marsh: {
      huntPool: ['boar', 'deer', 'hippo', 'alligator'],
      spawns: [
        ['capybara', -30, 31], ['capybara', -29, 32], ['pig', 30, -31], ['capybara', 29, -32],
        ['deer', -28, 27], ['boar', -39, 24], ['deer', 28, -27], ['boar', 39, -24],
        ['crocodile', -18, 18], ['alligator', 18, -18], ['alligator', -8, -8], ['crocodile', 8, 8],
        ['hippo', -24, 12], ['hippo', 24, -12], ['boar', -14, 22], ['boar', 14, -22],
      ],
    },
    highland: {
      huntPool: ['deer', 'moose', 'boar', 'bear'],
      spawns: [
        ['goat', -30, 30], ['cow', -28, 31], ['goat', 30, -30], ['cow', 28, -31],
        ['moose', -28, 27], ['deer', -39, 25], ['moose', 28, -27], ['deer', 39, -25],
        ['bear', -18, -12], ['bear', 18, 12], ['boar', -20, 22], ['boar', 20, -22],
        ['wolf', -10, 16], ['wolf', 10, -16],
      ],
    },
    acropolis: {
      huntPool: ['deer', 'boar', 'aurochs', 'wolf'],
      spawns: [
        ['goat', -30, 31], ['goat', -29, 30], ['goat', 30, -31], ['goat', 29, -30],
        ['chicken', -37, 36], ['chicken', -38, 35], ['chicken', 37, -36], ['chicken', 38, -35],
        ['deer', -39, 25], ['deer', 39, -25],
        ['boar', -18, 26], ['boar', 18, -26],
        ['aurochs', -6, -6], ['aurochs', 6, 6], ['wolf', -14, -10], ['wolf', 14, 10],
      ],
    },
    islands: {
      huntPool: ['boar', 'deer', 'gazelle', 'goat'],
      spawns: [
        ['pig', -30, 30], ['goat', -29, 32], ['pig', 30, -30], ['goat', 29, -32],
        ['chicken', -37, 36], ['chicken', 37, -36],
        ['boar', -39, 24], ['boar', 39, -24],
        ['deer', -4, 4], ['deer', 4, -4], ['boar', 0, -6],
      ],
    },
    archipelago: {
      huntPool: ['boar', 'deer', 'gazelle', 'crocodile'],
      spawns: [
        ['pig', -30, 30], ['goat', 30, -30],
        ['chicken', -37, 36], ['chicken', 37, -36],
        ['boar', -38, 25], ['boar', 38, -25],
        ['crocodile', -20, -18], ['crocodile', 20, 18], ['deer', -3, 3], ['deer', 3, -3],
      ],
    },
    anatolia: {
      huntPool: ['gazelle', 'boar', 'aurochs', 'lion'],
      spawns: [
        ['goat', -30, 30], ['turkey', -29, 31], ['goat', 30, -30], ['turkey', 29, -31],
        ['gazelle', -26, 25], ['boar', -39, 25],
        ['gazelle', 26, -25], ['boar', 39, -25],
        ['aurochs', -10, 8], ['aurochs', 10, -8], ['lion', 0, -14], ['lion', 0, 14],
      ],
    },
    alfheim: {
      huntPool: ['deer', 'moose', 'aurochs', 'bear'],
      spawns: [
        ['cow', -30, 30], ['cow', -28, 31], ['cow', 30, -30], ['cow', 28, -31],
        ['moose', -28, 27], ['deer', -26, 25], ['boar', -39, 25],
        ['deer', 28, -27], ['boar', 39, -25],
        ['aurochs', -14, 14], ['aurochs', 14, -14],
        ['bear', -18, -16], ['bear', 18, 16], ['wolf', 10, 6], ['wolf', -10, -6],
      ],
    },
    midgard: {
      huntPool: ['moose', 'deer', 'aurochs', 'wolf'],
      spawns: [
        ['cow', -30, 30], ['pig', -29, 32], ['cow', 30, -30], ['pig', 29, -32],
        ['moose', -28, 27], ['reindeer', -26, 25], ['aurochs', -39, 25],
        ['deer', 28, -27], ['aurochs', 39, -25],
        ['boar', -18, 28], ['boar', 18, -28],
        ['bear', -16, -12], ['bear', 16, 12], ['wolf', 8, -8], ['wolf', -8, 8],
      ],
    },
    vinlandsaga: {
      huntPool: ['moose', 'reindeer', 'musk_ox', 'bear'],
      spawns: [
        ['cow', -30, 30], ['turkey', -29, 31], ['cow', 30, -30], ['turkey', 29, -31],
        ['moose', -28, 27], ['deer', -38, 26], ['moose', 28, -27], ['deer', 38, -26],
        ['reindeer', -8, 12], ['reindeer', 8, -12], ['musk_ox', -14, -12], ['musk_ox', 14, 12],
        ['bear', -4, -4], ['bear', 4, 4],
      ],
    },
    erebus: {
      huntPool: ['boar', 'aurochs', 'wolf', 'bear'],
      spawns: [
        ['pig', -30, 30], ['goat', 30, -30],
        ['boar', -28, 27], ['boar', -39, 25], ['boar', 28, -27], ['boar', 39, -25],
        ['wolf', -16, 16], ['wolf', 16, -16], ['bear', -18, -10], ['bear', 18, 10],
      ],
    },
    yucatan: {
      huntPool: ['deer', 'boar', 'tiger', 'alligator'],
      spawns: [
        ['capybara', -30, 30], ['turkey', -29, 31], ['capybara', 30, -30], ['turkey', 29, -31],
        ['deer', -28, 27], ['boar', -26, 25], ['deer', -39, 25],
        ['deer', 28, -27], ['boar', 39, -25],
        ['alligator', -16, 14], ['alligator', 16, -14], ['tiger', -10, -14], ['tiger', 10, 14],
      ],
    },
    yellow_river: {
      huntPool: ['deer', 'boar', 'aurochs', 'tiger'],
      spawns: [
        ['yak', -30, 30], ['pig', -29, 31], ['yak', 30, -30], ['pig', 29, -31],
        ['chicken', -37, 36], ['chicken', 37, -36],
        ['deer', -28, 27], ['boar', -39, 25], ['deer', 28, -27], ['boar', 39, -25],
        ['aurochs', -14, 12], ['aurochs', 14, -12], ['tiger', -20, 20], ['tiger', 20, -20],
      ],
    },
    sea_of_worms: {
      huntPool: ['deer', 'boar', 'alligator', 'crocodile'],
      spawns: [
        ['pig', -30, 30], ['goat', 30, -30],
        ['boar', -39, 25], ['boar', 39, -25],
        ['alligator', -12, 8], ['crocodile', 12, -8], ['deer', -20, 18], ['deer', 20, -18],
      ],
    },
    king_of_the_hill: {
      huntPool: ['aurochs', 'deer', 'boar', 'wolf'],
      spawns: [
        ['cow', -30, 30], ['cow', 30, -30],
        ['chicken', -37, 36], ['chicken', 37, -36],
        ['deer', -28, 27], ['boar', -39, 25], ['deer', 28, -27], ['boar', 39, -25],
        ['aurochs', -18, 18], ['aurochs', 18, -18], ['wolf', -16, -12], ['wolf', 16, 12],
      ],
    },
    megalopolis: {
      huntPool: ['deer', 'boar', 'aurochs', 'gazelle'],
      spawns: [
        ['cow', -30, 28], ['pig', -28, 30], ['cow', 30, -28], ['pig', 28, -30],
        ['chicken', -38, 34], ['chicken', 38, -34],
        ['deer', -24, 24], ['boar', -44, 24], ['deer', 24, -24], ['boar', 44, -24],
        ['aurochs', -10, -8], ['aurochs', 10, 8],
      ],
    },
    nomad: {
      huntPool: ['gazelle', 'deer', 'boar', 'aurochs'],
      spawns: [
        ['cow', -30, 30], ['goat', 30, -30],
        ['gazelle', -28, 27], ['deer', -39, 25], ['gazelle', 28, -27], ['deer', 39, -25],
        ['boar', -18, 28], ['boar', 18, -28], ['aurochs', -4, -4], ['aurochs', 6, 6],
        ['wolf', 11, 5], ['wolf', -11, -5],
      ],
    },
    sudden_death: {
      huntPool: ['aurochs', 'boar', 'deer', 'wolf'],
      spawns: [
        ['cow', -30, 30], ['pig', 30, -30],
        ['deer', -28, 27], ['boar', -39, 25], ['deer', 28, -27], ['boar', 39, -25],
        ['aurochs', -12, 12], ['aurochs', 12, -12], ['wolf', -8, -8], ['wolf', 8, 8],
      ],
    },
    team_migration: {
      huntPool: ['deer', 'gazelle', 'boar', 'bear'],
      spawns: [
        ['pig', -30, 30], ['turkey', 30, -30],
        ['gazelle', -29, 28], ['boar', -38, 26], ['gazelle', 29, -28], ['boar', 38, -26],
        ['deer', -8, 10], ['deer', 8, -10], ['aurochs', -12, -10], ['aurochs', 12, 10],
        ['bear', 0, -14], ['bear', 0, 14],
      ],
    },
    mediterranean: {
      huntPool: ['deer', 'boar', 'gazelle', 'aurochs'],
      spawns: [
        ['cow', -30, 30], ['goat', -29, 31], ['cow', 30, -30], ['goat', 29, -31],
        ['chicken', -37, 36], ['chicken', -38, 35], ['chicken', 37, -36], ['chicken', 38, -35],
        ['gazelle', -28, 27], ['deer', -39, 25], ['boar', -18, 28],
        ['gazelle', 25, -22], ['deer', 46, -23], ['boar', 18, -28],
        ['aurochs', -4, -4], ['wolf', 11, 5], ['wolf', -11, -5],
      ],
    },
  };

  const herdData = herdsByMap[eff] ?? herdsByMap.mediterranean;
  const faunaSpawns = [...herdData.spawns];
  if (worldSize !== 'normal') {
    faunaSpawns.push(
      [herdData.huntPool[0], -28, -28],
      [herdData.huntPool[1], 28, 28],
      [herdData.huntPool[2], 6, 18],
      [herdData.huntPool[0], -6, -18]
    );
  }

  const coldMarineMaps: Exclude<MapId, 'land_unknown' | 'the_unknown'>[] = [
    'midgard',
    'vinlandsaga',
    'ghost_lake',
    'tundra',
    'highland',
  ];
  const aquaticDecorPool: ('sea_turtle' | 'dolphin' | 'whale')[] = coldMarineMaps.includes(eff)
    ? ['whale', 'dolphin']
    : ['sea_turtle', 'dolphin', 'whale'];

  return {
    treeClusters,
    goldSpots,
    berrySpots: defaultBerries,
    settlementSpots: defaultSettlements,
    faunaSpawns,
    huntPool: herdData.huntPool,
    aquaticDecorPool,
  };
}
