import { MapBiomeKind } from '../../maps/mapCatalog';

export type TerrainCategoryId =
  | 'rock_cliff'
  | 'magma_underworld'
  | 'dust_sand_ash'
  | 'mud_snow'
  | 'grass_fertile'
  | 'water';

export type TerrainCivBiome =
  | 'greek'
  | 'egyptian'
  | 'norse'
  | 'atlantean'
  | 'hades'
  | 'olympus'
  | 'campaign';

export interface RetoldTerrainEntry {
  id: string;
  xsName: string;
  rmConstant: string;
  label: string;
  category: TerrainCategoryId;
  civBiome: TerrainCivBiome;
  /** Mapped code for height/terrain grid (0=deep water, 1=grass, 2=road/dirt, 3=sand/dust, 4=rock/cliff, 5=fertile/marsh, 6=snow/ice, 7=forest, 8=shallow water, 9=lava/magma, 10=ash/charred, 11=olympus marble) */
  terrainCode: number;
  colorHex: number;
  swatch: string;
  landHeightDelta: number;
  passable: boolean;
  navigableWater: boolean;
  buildable: boolean;
  emissiveFlow?: boolean;
  biomeHint: MapBiomeKind;
  desc: string;
}

/**
 * Layer 1 — Age of Mythology: Retold (Bang Engine) Terrain Painting Catalog
 * Organized by biome/civilization and material category (Rock, Magma, Dust/Ash, Mud/Snow, Water).
 */
export const RETOLD_TERRAIN_CATALOG: RetoldTerrainEntry[] = [
  // ── Rocha e Pedra (Rock / Cliff / Cobblestone) ──
  {
    id: 'greek_road',
    xsName: 'GreekRoad',
    rmConstant: 'cTerrainGreekRoad1',
    label: 'Estrada Grega (GreekRoad)',
    category: 'rock_cliff',
    civBiome: 'greek',
    terrainCode: 2,
    colorHex: 0x9b8c71,
    swatch: '#9b8c71',
    landHeightDelta: 0.32,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'temperate',
    desc: 'Calçamento de pedra clássico helênico',
  },
  {
    id: 'norse_cliff',
    xsName: 'NorseCliff',
    rmConstant: 'cTerrainNorseCliff1',
    label: 'Penhasco Nórdico (NorseCliff)',
    category: 'rock_cliff',
    civBiome: 'norse',
    terrainCode: 4,
    colorHex: 0x5c6470,
    swatch: '#5c6470',
    landHeightDelta: 2.8,
    passable: false,
    navigableWater: false,
    buildable: false,
    biomeHint: 'frozen',
    desc: 'Encosta rochosa íngreme e intransponível de granito nórdico',
  },
  {
    id: 'norse_grass_rocks',
    xsName: 'NorseGrassRocks2',
    rmConstant: 'cTerrainNorseGrassRocks2',
    label: 'Solo Rochoso Nórdico (NorseGrassRocks2)',
    category: 'rock_cliff',
    civBiome: 'norse',
    terrainCode: 4,
    colorHex: 0x677063,
    swatch: '#677063',
    landHeightDelta: 0.75,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'frozen',
    desc: 'Grama alpina entremeada com pedregulhos',
  },
  {
    id: 'egyptian_rock',
    xsName: 'EgyptianRock',
    rmConstant: 'cTerrainEgyptianRock1',
    label: 'Rocha Egípcia (EgyptianRock)',
    category: 'rock_cliff',
    civBiome: 'egyptian',
    terrainCode: 4,
    colorHex: 0xa68256,
    swatch: '#a68256',
    landHeightDelta: 1.4,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'desert',
    desc: 'Laje de arenito seco de cânions do Nilo',
  },
  {
    id: 'olympus_marble',
    xsName: 'OlympusMarble',
    rmConstant: 'cTerrainOlympusMarble1',
    label: 'Mármore do Olimpo (OlympusMarble)',
    category: 'rock_cliff',
    civBiome: 'olympus',
    terrainCode: 11,
    colorHex: 0xe6dfd0,
    swatch: '#e6dfd0',
    landHeightDelta: 0.65,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'temperate',
    desc: 'Ladrilhos sagrados de mármore branco do Monte Olimpo',
  },
  {
    id: 'atlantean_cobble',
    xsName: 'AtlanteanCobblestone',
    rmConstant: 'cTerrainAtlanteanRoad1',
    label: 'Pedra Atlante (Cobblestone)',
    category: 'rock_cliff',
    civBiome: 'atlantean',
    terrainCode: 2,
    colorHex: 0x8a929e,
    swatch: '#8a929e',
    landHeightDelta: 0.35,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'temperate',
    desc: 'Pavimentação imperial de Atlântida',
  },

  // ── Magma e Submundo (Hades / Underworld / Lava) ──
  {
    id: 'hades_lava',
    xsName: 'HadesLava',
    rmConstant: 'cTerrainHadesLava1',
    label: 'Magma de Hades (HadesLava)',
    category: 'magma_underworld',
    civBiome: 'hades',
    terrainCode: 9,
    colorHex: 0xd94814,
    swatch: '#d94814',
    landHeightDelta: -1.1,
    passable: false,
    navigableWater: false,
    buildable: false,
    emissiveFlow: true,
    biomeHint: 'volcanic',
    desc: 'Terreno intransponível de magma com fluxo luminoso (não navegável)',
  },
  {
    id: 'hades_cliff',
    xsName: 'HadesCliff',
    rmConstant: 'cTerrainHadesCliff1',
    label: 'Penhasco de Hades (HadesCliff)',
    category: 'magma_underworld',
    civBiome: 'hades',
    terrainCode: 4,
    colorHex: 0x3b2c30,
    swatch: '#3b2c30',
    landHeightDelta: 3.1,
    passable: false,
    navigableWater: false,
    buildable: false,
    biomeHint: 'volcanic',
    desc: 'Escarpas vulcânicas negras de obsidiana',
  },
  {
    id: 'hades_flat',
    xsName: 'HadesFlat',
    rmConstant: 'cTerrainHadesFlat1',
    label: 'Planície do Submundo (HadesFlat)',
    category: 'magma_underworld',
    civBiome: 'hades',
    terrainCode: 10,
    colorHex: 0x453b3d,
    swatch: '#453b3d',
    landHeightDelta: 0.35,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'volcanic',
    desc: 'Rocha basáltica plana do Érebo',
  },

  // ── Poeira, Areia, Cinzas e Lama (Dirt / Sand / Dust / Ash / Snow) ──
  {
    id: 'egyptian_sand',
    xsName: 'EgyptianSand',
    rmConstant: 'cTerrainEgyptianSand1',
    label: 'Areia Egípcia (EgyptianSand)',
    category: 'dust_sand_ash',
    civBiome: 'egyptian',
    terrainCode: 3,
    colorHex: 0xd4b678,
    swatch: '#d4b678',
    landHeightDelta: 0.28,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'desert',
    desc: 'Dunas douradas do deserto',
  },
  {
    id: 'egyptian_dirt',
    xsName: 'EgyptianDirtA',
    rmConstant: 'cTerrainEgyptianDirtA',
    label: 'Terra Seca Egípcia (EgyptianDirtA)',
    category: 'dust_sand_ash',
    civBiome: 'egyptian',
    terrainCode: 2,
    colorHex: 0x9e7d52,
    swatch: '#9e7d52',
    landHeightDelta: 0.35,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'desert',
    desc: 'Terra batida e poeira árida de planície',
  },
  {
    id: 'savannah',
    xsName: 'Savannah',
    rmConstant: 'cTerrainSavannahA',
    label: 'Savana (Savannah)',
    category: 'dust_sand_ash',
    civBiome: 'egyptian',
    terrainCode: 3,
    colorHex: 0xb09854,
    swatch: '#b09854',
    landHeightDelta: 0.35,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'savannah',
    desc: 'Capim dourado e solo ressecado de savana',
  },
  {
    id: 'desert_dust',
    xsName: 'DesertDust',
    rmConstant: 'cTerrainDesertDust1',
    label: 'Poeira do Deserto (DesertDust)',
    category: 'dust_sand_ash',
    civBiome: 'egyptian',
    terrainCode: 3,
    colorHex: 0xc29e69,
    swatch: '#c29e69',
    landHeightDelta: 0.3,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'desert',
    desc: 'Terra seca rachada com poeira solta ao vento',
  },
  {
    id: 'hades_ash',
    xsName: 'HadesAsh',
    rmConstant: 'cTerrainHadesAsh1',
    label: 'Cinzas Vulcânicas (HadesAsh)',
    category: 'dust_sand_ash',
    civBiome: 'hades',
    terrainCode: 10,
    colorHex: 0x544f52,
    swatch: '#544f52',
    landHeightDelta: 0.38,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'volcanic',
    desc: 'Cinzas espessas de zonas vulcânicas e do Tártaro',
  },
  {
    id: 'charred_dirt',
    xsName: 'CharredDirt',
    rmConstant: 'cTerrainCharredDirt1',
    label: 'Terra Carbonizada (CharredDirt)',
    category: 'dust_sand_ash',
    civBiome: 'campaign',
    terrainCode: 10,
    colorHex: 0x332b29,
    swatch: '#332b29',
    landHeightDelta: 0.32,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'volcanic',
    desc: 'Solo queimado por incêndios, meteoros ou vulcões',
  },
  {
    id: 'marsh',
    xsName: 'Marsh',
    rmConstant: 'cTerrainMarsh1',
    label: 'Lama / Pântano (Marsh)',
    category: 'mud_snow',
    civBiome: 'campaign',
    terrainCode: 5,
    colorHex: 0x4a5738,
    swatch: '#4a5738',
    landHeightDelta: 0.14,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'tropical',
    desc: 'Solo alagadiço e lamacento de brejos',
  },
  {
    id: 'norse_snow',
    xsName: 'NorseSnow',
    rmConstant: 'cTerrainNorseSnow1',
    label: 'Neve Nórdica (NorseSnow)',
    category: 'mud_snow',
    civBiome: 'norse',
    terrainCode: 6,
    colorHex: 0xdce6f0,
    swatch: '#dce6f0',
    landHeightDelta: 0.45,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'frozen',
    desc: 'Manto de neve profunda da tundra de Midgard',
  },
  {
    id: 'ice',
    xsName: 'Ice',
    rmConstant: 'cTerrainIce1',
    label: 'Gelo Glacial (Ice)',
    category: 'mud_snow',
    civBiome: 'norse',
    terrainCode: 6,
    colorHex: 0xaad4eb,
    swatch: '#aad4eb',
    landHeightDelta: 0.08,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'frozen',
    desc: 'Superfície de lago congelado e geleiras',
  },

  // ── Pradaria, Bosque e Água ──
  {
    id: 'greek_grass',
    xsName: 'GreekGrass1',
    rmConstant: 'cTerrainGreekGrass1',
    label: 'Grama Grega (GreekGrass1)',
    category: 'grass_fertile',
    civBiome: 'greek',
    terrainCode: 1,
    colorHex: 0x587a43,
    swatch: '#587a43',
    landHeightDelta: 0.35,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'temperate',
    desc: 'Pradaria temperada padrão do Mediterrâneo',
  },
  {
    id: 'forest_floor',
    xsName: 'GreekForestFloor',
    rmConstant: 'cTerrainGreekForestFloor1',
    label: 'Solo de Bosque (ForestFloor)',
    category: 'grass_fertile',
    civBiome: 'greek',
    terrainCode: 7,
    colorHex: 0x3b522c,
    swatch: '#3b522c',
    landHeightDelta: 0.4,
    passable: true,
    navigableWater: false,
    buildable: true,
    biomeHint: 'temperate',
    desc: 'Sub-bosque com folhas, raízes e musgo',
  },
  {
    id: 'shallow_water',
    xsName: 'ShallowWater',
    rmConstant: 'cTerrainShallowWater1',
    label: 'Água Rasa (Retold)',
    category: 'water',
    civBiome: 'campaign',
    terrainCode: 8,
    colorHex: 0x3898a8,
    swatch: '#3898a8',
    landHeightDelta: -0.42,
    passable: true,
    navigableWater: true,
    buildable: true,
    biomeHint: 'temperate',
    desc: 'Transitável por tropas terrestres e navios, e permite construções',
  },
  {
    id: 'deep_water',
    xsName: 'GreekSea',
    rmConstant: 'cTerrainGreekWater1',
    label: 'Água Profunda (GreekSea)',
    category: 'water',
    civBiome: 'greek',
    terrainCode: 0,
    colorHex: 0x165e82,
    swatch: '#165e82',
    landHeightDelta: -1.8,
    passable: false,
    navigableWater: true,
    buildable: false,
    biomeHint: 'temperate',
    desc: 'Lagos, rios e oceanos navegáveis com cardumes',
  },
];

/**
 * Resolves any AoM: Retold terrain name OR cTerrain* RM constant into a catalog entry.
 */
export function resolveRetoldTerrain(nameOrConst: string): RetoldTerrainEntry | null {
  const clean = nameOrConst.replace(/^["']|["']$/g, '').trim().toLowerCase();
  if (!clean) return null;

  for (const entry of RETOLD_TERRAIN_CATALOG) {
    if (
      entry.id === clean ||
      entry.xsName.toLowerCase() === clean ||
      entry.rmConstant.toLowerCase() === clean
    ) {
      return entry;
    }
  }

  // Partial matching for Retold suffixes (e.g. EgyptianDirtB, HadesLava2, NorseCliffA)
  if (clean.includes('hadeslava') || clean.includes('lava') || clean.includes('magma')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'hades_lava') ?? null;
  }
  if (clean.includes('hadescliff')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'hades_cliff') ?? null;
  }
  if (clean.includes('hadesash')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'hades_ash') ?? null;
  }
  if (clean.includes('charred')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'charred_dirt') ?? null;
  }
  if (clean.includes('hadesflat')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'hades_flat') ?? null;
  }
  if (clean.includes('olympusmarble') || clean.includes('marble')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'olympus_marble') ?? null;
  }
  if (clean.includes('norsecliff')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'norse_cliff') ?? null;
  }
  if (clean.includes('norsegrassrocks')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'norse_grass_rocks') ?? null;
  }
  if (clean.includes('egyptianrock')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'egyptian_rock') ?? null;
  }
  if (clean.includes('egyptiandirt')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'egyptian_dirt') ?? null;
  }
  if (clean.includes('egyptiansand')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'egyptian_sand') ?? null;
  }
  if (clean.includes('desertdust') || clean.includes('dust')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'desert_dust') ?? null;
  }
  if (clean.includes('savannah')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'savannah') ?? null;
  }
  if (clean.includes('marsh') || clean.includes('swamp') || clean.includes('mud')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'marsh') ?? null;
  }
  if (clean.includes('norsesnow') || clean.includes('snow')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'norse_snow') ?? null;
  }
  if (clean.includes('ice')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'ice') ?? null;
  }
  if (clean.includes('greekroad') || clean.includes('cobble')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'greek_road') ?? null;
  }
  if (clean.includes('shallow')) {
    return RETOLD_TERRAIN_CATALOG.find((e) => e.id === 'shallow_water') ?? null;
  }
  return null;
}

/**
 * Generates an AoM: Retold compatible MythRMConstants.txt dump
 * (equivalent to enabling GenerateRMConstants + GenerateTRConstants in user.cfg).
 */
export function generateMythRMConstantsTxt(): string {
  const lines: string[] = [
    '// =====================================================================',
    '// MythRMConstants.txt — Age of Mythology: Olympus (Bang Engine Layer)',
    '// Equivalente a user.cfg: GenerateRMConstants + GenerateTRConstants',
    '// =====================================================================',
    '',
    '// 1. TERRAIN PAINTING CONSTANTS (cTerrain*)',
  ];

  RETOLD_TERRAIN_CATALOG.forEach((t, idx) => {
    lines.push(
      `extern const int ${t.rmConstant} = ${idx + 1}; // "${t.xsName}" [${t.civBiome}] passable=${t.passable} navigable=${t.navigableWater}`
    );
  });

  lines.push(
    '',
    '// 2. CLIFF TYPE CONSTANTS (cCliff*)',
    'extern const string cCliffGreekMarble = "GreekCliff";',
    'extern const string cCliffNorseGranite = "NorseCliff";',
    'extern const string cCliffEgyptianSandstone = "EgyptianCliff";',
    'extern const string cCliffIceGlacier = "IceCliff";',
    'extern const string cCliffHadesObsidian = "HadesCliff";',
    '',
    '// 3. 3D ROCK FORMATIONS & EMBELLISHMENT PROTOS',
    'extern const string cUnitRockGraniteSmall = "Rock Granite Small"; // decorativa (sem colisão)',
    'extern const string cUnitRockGraniteLarge = "Rock Granite Large"; // bloqueia caminho e construção',
    'extern const string cUnitBasaltPillar = "Basalt Pillar"; // pilar vulcânico bloqueador',
    'extern const string cUnitStalagmite = "Stalagmite"; // estalagmite do Submundo bloqueadora',
    'extern const string cUnitEgyptianRockFormation = "Egyptian Rock Formation";',
    'extern const string cUnitOlympusMarbleOutcrop = "Olympus Marble Outcrop";',
    '',
    '// 4. ATMOSPHERIC FX & PARTICLE EMITTERS',
    'extern const string cFxWindDust = "FX Wind Dust";',
    'extern const string cFxVolcanicSmoke = "FX Volcanic Smoke";',
    'extern const string cFxMagmaSparks = "FX Magma Sparks";',
    'extern const string cFxLowMist = "FX Low Mist";',
    'extern const string cFxSunbeams = "FX Sunbeams";',
    '',
    '// 5. LIGHTING & SKYBOX PRESETS (trSetLighting)',
    'extern const string cLightingDefault = "Default";',
    'extern const string cLightingDawn = "Dawn";',
    'extern const string cLightingDusk = "Dusk";',
    'extern const string cLightingNight = "Night";',
    'extern const string cLightingEclipse = "Eclipse";',
    'extern const string cLightingOlympus = "Olympus";',
    'extern const string cLightingErebus = "Erebus";',
    'extern const string cLightingFimbulwinter = "Fimbulwinter";',
    'extern const string cLightingHades = "Hades";',
    '',
    '// 6. TRIGGER CONSTANTS (GenerateTRConstants)',
    'extern const int cTrEffectChangeLighting = 101;',
    'extern const int cTrEffectRevealMap = 102;',
    'extern const int cTrEffectGrantResources = 103;',
    'extern const int cTrEffectSpawnEmitter = 104;',
    'extern const int cTrEffectTerrainPaint = 105;'
  );

  return lines.join('\n');
}
