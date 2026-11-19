import {
  AgeLevel,
  BUILDING_STATS,
  BuildingKind,
  DifficultyId,
  FAUNA_STATS,
  FaunaKind,
  MapId,
  MAPS,
  PANTHEONS,
  PantheonId,
  UNIT_STATS,
  UnitKind,
  WorldSizeId,
} from '../game/types';
import { getWorldSizeSpec, MapBiomeKind } from './mapCatalog';
import { BiomeTreeStyle, groundHeightAt } from './mapGeography';
import { RmsGeneratedMap, RmsPlacedObject, RmsTerrainCode } from './rmsEngine';
import { AtmosphericEmitterKind, TerrainRockKind } from '../textura/terreno/terrainObjectsAndFx';

export type EditorToolId =
  | 'select_move'
  | 'place_object'
  | 'delete_object'
  | 'place_wall'
  | 'paint_terrain'
  | 'paint_land'
  | 'elevate'
  | 'elevate_sample'
  | 'elevate_circular'
  | 'smooth'
  | 'roughen'
  | 'paint_water'
  | 'edit_water_beautify'
  | 'paint_cliff'
  | 'paint_forest'
  | 'terrain_copy'
  | 'terrain_paste';

export type EditorTerrainPaintId =
  | 'grass'
  | 'dirt'
  | 'road'
  | 'sand'
  | 'desert_dust'
  | 'cliff_rock'
  | 'egyptian_rock'
  | 'olympus_marble'
  | 'fertile'
  | 'marsh'
  | 'snow'
  | 'ice'
  | 'forest_floor'
  | 'hades_ash'
  | 'charred_dirt'
  | 'shallow_water'
  | 'deep_water'
  | 'lava';

export type EditorWaterMode = 'shallow' | 'river' | 'ocean';
export type EditorCliffStyle = 'greek_marble' | 'egypt_sandstone' | 'norse_granite' | 'ice_glacier' | 'hades_obsidian';
export type EditorForestStyle = BiomeTreeStyle | 'gaia_tree';

export type EditorObjectCategory =
  | 'all'
  | 'units'
  | 'buildings'
  | 'nature'
  | 'embellishment'
  | 'test'
  | 'current';

export type EditorPantheonFilter = 'all' | 'greek' | 'egyptian' | 'norse' | 'atlantean' | 'chinese' | 'gaia' | 'special';

export interface EditorObjectCatalogItem {
  id: string;
  name: string;
  category: Exclude<EditorObjectCategory, 'all' | 'current'>;
  pantheon: Exclude<EditorPantheonFilter, 'all'>;
  kindType: 'unit' | 'building' | 'tree' | 'fauna' | 'resource' | 'prop';
  unitKind?: UnitKind;
  buildingKind?: BuildingKind;
  treeStyle?: BiomeTreeStyle;
  faunaKind?: FaunaKind;
  resourceKind?: 'gold_mine' | 'berry' | 'relic' | 'settlement' | 'plenty_vault' | 'fish_spot';
  propKind?:
    | 'boulder'
    | 'columns'
    | 'ruins'
    | 'bridge'
    | 'hades_gate'
    | 'troy_gate'
    | 'troy_wall'
    | 'atlantis_wall'
    | 'statue_poseidon'
    | 'statue_cyclops'
    | 'statue_hydra'
    | 'statue_lion'
    | 'statue_major_god'
    | 'osiris_pyramid'
    | 'well_of_urd'
    | 'gaia_pool'
    | 'torii_gate'
    | 'tent'
    | 'torch'
    | 'flag'
    | 'fountain'
    | 'fence_wood'
    | 'fence_stone'
    | 'fence_iron'
    | 'market_stall'
    | 'sign'
    | 'dig_pile'
    | 'trojan_horse'
    | 'testing_dummy'
    | 'dwarven_forge';
  rockKind?: TerrainRockKind;
  emitterKind?: AtmosphericEmitterKind;
  defaultScale?: number;
  specialBadge?: string;
}

export interface PlacedScenarioObject {
  uid: string;
  catalogId: string;
  name: string;
  kindType: EditorObjectCatalogItem['kindType'];
  unitKind?: UnitKind;
  buildingKind?: BuildingKind;
  treeStyle?: BiomeTreeStyle;
  faunaKind?: FaunaKind;
  resourceKind?: EditorObjectCatalogItem['resourceKind'];
  propKind?: EditorObjectCatalogItem['propKind'];
  rockKind?: TerrainRockKind;
  emitterKind?: AtmosphericEmitterKind;
  playerSlot: number; // 0 = Gaia/Mother Nature, 1..12 = Players
  x: number;
  z: number;
  rotationY: number;
  scale: number;
}

export type DiplomacyStance = 'neutral' | 'ally' | 'enemy';

export interface ScenarioPlayerData {
  slot: number; // 1..12
  name: string;
  colorHex: string;
  pantheon: PantheonId;
  majorGod: string;
  startingAge: AgeLevel;
  minorGodAge2: string;
  minorGodAge3: string;
  minorGodAge4: string;
  control: 'human' | 'ai' | 'none';
  visibility: 'normal' | 'hidden';
  aiFile: 'Standard' | 'Aggressive' | 'Defensive' | 'Boomer' | 'Naval' | 'Passive';
  startingPop: number;
  resources: {
    food: number;
    wood: number;
    gold: number;
    favor: number;
  };
}

export interface ScenarioObjectiveItem {
  id: string;
  title: string;
  description: string;
  type: 'primary' | 'secondary' | 'hint' | 'spotlight';
  spotlightImage?: string;
}

export interface ScenarioLightingPreset {
  id: string;
  label: string;
  sunAzimuthDeg: number;
  sunElevationDeg: number;
  sunColorHex: number;
  sunIntensity: number;
  hemiSkyHex: number;
  hemiGroundHex: number;
  hemiIntensity: number;
  skyTopHex: string;
  skyHorizonHex: string;
  fogHex: number;
  fogDensity: number;
  exposure: number;
}

export interface ScenarioDocument {
  id: string;
  title: string;
  author: string;
  description: string;
  updatedAt: string;
  baseMapId: MapId | 'blank_grass';
  seed: number;
  worldSize: WorldSizeId;
  widthMeters: number;
  depthMeters: number;
  gridSize: number;
  maxPlayers: number;
  bonusPopulation: number;
  populationLimit: number;
  standardVictory: boolean;
  lightingId: string;
  skyBoxEnabled: boolean;
  sunAzimuthDeg: number;
  sunElevationDeg: number;
  globalElevationOffset: number;
  heightGrid: number[]; // gridSize * gridSize
  terrainGrid: number[]; // gridSize * gridSize (RmsTerrainCode or 8 for shallow water, 9 for lava)
  objects: PlacedScenarioObject[];
  players: ScenarioPlayerData[];
  diplomacy: Record<string, DiplomacyStance>; // key `${fromSlot}_${toSlot}`
  objectives: ScenarioObjectiveItem[];
  forbiddenByPlayer: Record<number, string[]>; // playerSlot -> array of unitKind/buildingKind
}

export interface CustomCampaignDocument {
  id: string;
  title: string;
  description: string;
  introCinematicText: string;
  coverTheme: 'olympus' | 'egypt' | 'norse' | 'atlantis' | 'erebus';
  coverImageUrl?: string;
  scenarioIds: string[];
  updatedAt: string;
}

export const PLAYER_COLORS: string[] = [
  '#38bdf8', // P1 Blue
  '#ef4444', // P2 Red
  '#facc15', // P3 Yellow
  '#22c55e', // P4 Green
  '#a855f7', // P5 Purple
  '#f97316', // P6 Orange
  '#14b8a6', // P7 Teal
  '#ec4899', // P8 Pink
  '#94a3b8', // P9 Silver
  '#84cc16', // P10 Lime
  '#fb7185', // P11 Rose
  '#eab308', // P12 Gold
];

export const TERRAIN_PAINT_PALETTE: {
  id: EditorTerrainPaintId;
  label: string;
  code: number;
  colorHex: number;
  swatch: string;
  landHeightDelta: number;
  desc: string;
}[] = [
  { id: 'grass', label: 'Grama Grega (GreekGrass1)', code: 1, colorHex: 0x587a43, swatch: '#587a43', landHeightDelta: 0.35, desc: 'Planície temperada padrão' },
  { id: 'fertile', label: 'Vale Fértil', code: 5, colorHex: 0x3f7b3e, swatch: '#3f7b3e', landHeightDelta: 0.25, desc: 'Solo verdejante de rio ou oásis' },
  { id: 'marsh', label: 'Lama / Pântano (Marsh)', code: 5, colorHex: 0x4a5738, swatch: '#4a5738', landHeightDelta: 0.14, desc: 'Solo alagadiço de pântanos e brejos' },
  { id: 'road', label: 'Estrada Grega (GreekRoad)', code: 2, colorHex: 0x9b896a, swatch: '#9b896a', landHeightDelta: 0.32, desc: 'Calçamento de pedra e terra batida' },
  { id: 'olympus_marble', label: 'Mármore do Olimpo (OlympusMarble)', code: 11, colorHex: 0xe6dfd0, swatch: '#e6dfd0', landHeightDelta: 0.65, desc: 'Ladrilhos sagrados de mármore branco' },
  { id: 'dirt', label: 'Terra Seca (EgyptianDirtA)', code: 2, colorHex: 0x8e704c, swatch: '#8e704c', landHeightDelta: 0.35, desc: 'Solo seco de acampamento / planície' },
  { id: 'sand', label: 'Areia Egípcia (EgyptianSand)', code: 3, colorHex: 0xd4b678, swatch: '#d4b678', landHeightDelta: 0.28, desc: 'Dunas douradas e praias costeiras' },
  { id: 'desert_dust', label: 'Poeira / Savana (DesertDust)', code: 3, colorHex: 0xc29e69, swatch: '#c29e69', landHeightDelta: 0.3, desc: 'Terra seca rachada e poeira árida' },
  { id: 'cliff_rock', label: 'Rocha / Penhasco (NorseCliff)', code: 4, colorHex: 0x6b6f75, swatch: '#6b6f75', landHeightDelta: 1.5, desc: 'Encosta rochosa elevada' },
  { id: 'egyptian_rock', label: 'Rocha Egípcia (EgyptianRock)', code: 4, colorHex: 0xa68256, swatch: '#a68256', landHeightDelta: 1.4, desc: 'Laje de arenito de cânion' },
  { id: 'hades_ash', label: 'Cinzas Vulcânicas (HadesAsh)', code: 10, colorHex: 0x544f52, swatch: '#544f52', landHeightDelta: 0.38, desc: 'Cinzas vulcânicas do Tártaro e Submundo' },
  { id: 'charred_dirt', label: 'Terra Carbonizada (CharredDirt)', code: 10, colorHex: 0x332b29, swatch: '#332b29', landHeightDelta: 0.32, desc: 'Solo queimado por vulcões e meteoros' },
  { id: 'snow', label: 'Neve Nórdica (NorseSnow)', code: 6, colorHex: 0xdbe5ef, swatch: '#dbe5ef', landHeightDelta: 0.45, desc: 'Solo nevado nórdico' },
  { id: 'ice', label: 'Gelo Glacial (Ice)', code: 6, colorHex: 0xaad4eb, swatch: '#aad4eb', landHeightDelta: 0.1, desc: 'Superfície de gelo e lagos congelados' },
  { id: 'forest_floor', label: 'Solo de Bosque', code: 7, colorHex: 0x3b522c, swatch: '#3b522c', landHeightDelta: 0.4, desc: 'Sub-bosque com folhas e musgo' },
  { id: 'shallow_water', label: 'Água Rasa (Retold)', code: 8, colorHex: 0x3898a8, swatch: '#3898a8', landHeightDelta: -0.45, desc: 'Transitável por tropas/navios e construtível' },
  { id: 'deep_water', label: 'Água Profunda', code: 0, colorHex: 0x165e82, swatch: '#165e82', landHeightDelta: -1.8, desc: 'Lagos, rios e oceanos navegáveis' },
  { id: 'lava', label: 'Magma / HadesLava (Intransponível)', code: 9, colorHex: 0xd94814, swatch: '#d94814', landHeightDelta: -1.2, desc: 'Fluxo luminoso de lava (não navegável)' },
];

export const CLIFF_STYLE_OPTIONS: { id: EditorCliffStyle; label: string; height: number; colorHex: number }[] = [
  { id: 'greek_marble', label: 'Penhasco Grego (Mármore)', height: 2.8, colorHex: 0x9c9689 },
  { id: 'egypt_sandstone', label: 'Cânion Egípcio (Arenito)', height: 2.6, colorHex: 0xb68b54 },
  { id: 'norse_granite', label: 'Rochedo Nórdico (Granito)', height: 3.1, colorHex: 0x5c6470 },
  { id: 'ice_glacier', label: 'Geleira de Midgard', height: 2.9, colorHex: 0x94c2d8 },
  { id: 'hades_obsidian', label: 'Abismo de Hades (Obsidiana)', height: 3.3, colorHex: 0x342a2e },
];

export const FOREST_STYLE_OPTIONS: { id: EditorForestStyle; label: string; treeStyle: BiomeTreeStyle }[] = [
  { id: 'nordic_pine', label: 'Floresta de Pinheiros (Pine)', treeStyle: 'nordic_pine' },
  { id: 'oak', label: 'Bosque de Carvalhos (Oak)', treeStyle: 'oak' },
  { id: 'palm', label: 'Palmeiral / Oásis', treeStyle: 'palm' },
  { id: 'snow_pine', label: 'Pinheiros Nevados', treeStyle: 'snow_pine' },
  { id: 'jungle', label: 'Selva Tropical', treeStyle: 'jungle' },
  { id: 'acacia', label: 'Acácias da Savana', treeStyle: 'acacia' },
  { id: 'marsh_cypress', label: 'Ciprestes / Pântano', treeStyle: 'marsh_cypress' },
  { id: 'oriental', label: 'Bosque Oriental / Bambu', treeStyle: 'oriental' },
  { id: 'birch', label: 'Bosque de Bétulas', treeStyle: 'birch' },
  { id: 'erebus_ash', label: 'Bosque Cinzento de Érebo', treeStyle: 'erebus_ash' },
  { id: 'gaia_tree', label: 'Bosque Sagrado de Gaia', treeStyle: 'oak' },
];

export const SCENARIO_LIGHTING_PRESETS: ScenarioLightingPreset[] = [
  { id: 'Default', label: 'Default (Dia Clássico)', sunAzimuthDeg: 38, sunElevationDeg: 52, sunColorHex: 0xfff5dc, sunIntensity: 2.4, hemiSkyHex: 0x8ec5fc, hemiGroundHex: 0x4b5c3e, hemiIntensity: 0.95, skyTopHex: '#1b3556', skyHorizonHex: '#7da5c9', fogHex: 0x6b8eb2, fogDensity: 0.0045, exposure: 1.08 },
  { id: 'Noon', label: 'Noon (Meio-Dia)', sunAzimuthDeg: 20, sunElevationDeg: 76, sunColorHex: 0xffffff, sunIntensity: 2.75, hemiSkyHex: 0xbce0ff, hemiGroundHex: 0x5c6d4a, hemiIntensity: 1.1, skyTopHex: '#255a96', skyHorizonHex: '#a5ccf0', fogHex: 0x8bb5db, fogDensity: 0.0038, exposure: 1.14 },
  { id: 'Dawn', label: 'Dawn (Amanhecer)', sunAzimuthDeg: -55, sunElevationDeg: 22, sunColorHex: 0xffb77a, sunIntensity: 2.1, hemiSkyHex: 0xf7b29c, hemiGroundHex: 0x45353a, hemiIntensity: 0.85, skyTopHex: '#2c294d', skyHorizonHex: '#e39b74', fogHex: 0xba7d6b, fogDensity: 0.0055, exposure: 1.02 },
  { id: 'Dusk', label: 'Dusk (Crepúsculo)', sunAzimuthDeg: 118, sunElevationDeg: 18, sunColorHex: 0xff8a4c, sunIntensity: 2.0, hemiSkyHex: 0xc26d6a, hemiGroundHex: 0x2c2228, hemiIntensity: 0.78, skyTopHex: '#231936', skyHorizonHex: '#cc6c49', fogHex: 0x8a4d45, fogDensity: 0.006, exposure: 0.98 },
  { id: 'Dusk2', label: 'Dusk2 (Pôr-do-Sol Dourado)', sunAzimuthDeg: 132, sunElevationDeg: 14, sunColorHex: 0xffa73b, sunIntensity: 1.9, hemiSkyHex: 0xd48d55, hemiGroundHex: 0x332419, hemiIntensity: 0.72, skyTopHex: '#1e1b30', skyHorizonHex: '#d98a41', fogHex: 0x8f5b3a, fogDensity: 0.0062, exposure: 0.96 },
  { id: 'Night', label: 'Night (Noite Lunar)', sunAzimuthDeg: -135, sunElevationDeg: 34, sunColorHex: 0x99bfff, sunIntensity: 0.85, hemiSkyHex: 0x294473, hemiGroundHex: 0x101726, hemiIntensity: 0.55, skyTopHex: '#050914', skyHorizonHex: '#162544', fogHex: 0x0e182d, fogDensity: 0.0072, exposure: 0.82 },
  { id: 'Night2', label: 'Night2 (Noite Profunda)', sunAzimuthDeg: -150, sunElevationDeg: 28, sunColorHex: 0x6f96e8, sunIntensity: 0.65, hemiSkyHex: 0x1d2e54, hemiGroundHex: 0x0a0f1a, hemiIntensity: 0.45, skyTopHex: '#03050c', skyHorizonHex: '#0e1933', fogHex: 0x091121, fogDensity: 0.008, exposure: 0.76 },
  { id: 'Eclipse', label: 'Eclipse (Eclipse Solar)', sunAzimuthDeg: 45, sunElevationDeg: 42, sunColorHex: 0xd98a5b, sunIntensity: 0.95, hemiSkyHex: 0x3b2a54, hemiGroundHex: 0x1a1421, hemiIntensity: 0.52, skyTopHex: '#0b0617', skyHorizonHex: '#4f2c3f', fogHex: 0x27192d, fogDensity: 0.0075, exposure: 0.84 },
  { id: 'Olympus', label: 'Olympus (Monte Olimpo)', sunAzimuthDeg: 30, sunElevationDeg: 60, sunColorHex: 0xfff0c2, sunIntensity: 2.65, hemiSkyHex: 0xd8ecff, hemiGroundHex: 0x7a6b4e, hemiIntensity: 1.15, skyTopHex: '#2c548a', skyHorizonHex: '#e6d8b5', fogHex: 0xc2b89d, fogDensity: 0.004, exposure: 1.15 },
  { id: 'Alfheim', label: 'Alfheim (Luz Nórdica)', sunAzimuthDeg: 52, sunElevationDeg: 44, sunColorHex: 0xe6f2ff, sunIntensity: 2.15, hemiSkyHex: 0x99c2e8, hemiGroundHex: 0x3d544c, hemiIntensity: 0.95, skyTopHex: '#1d3752', skyHorizonHex: '#8ab1c9', fogHex: 0x6c90a8, fogDensity: 0.0052, exposure: 1.04 },
  { id: 'Alfheim2', label: 'Alfheim2 (Aurora Suave)', sunAzimuthDeg: 64, sunElevationDeg: 36, sunColorHex: 0xcff5ea, sunIntensity: 1.85, hemiSkyHex: 0x6ec7c0, hemiGroundHex: 0x273b3a, hemiIntensity: 0.85, skyTopHex: '#102638', skyHorizonHex: '#63a8a2', fogHex: 0x457d7d, fogDensity: 0.0058, exposure: 1.0 },
  { id: 'Anatolia', label: 'Anatolia (Sol Mediterrâneo)', sunAzimuthDeg: 48, sunElevationDeg: 56, sunColorHex: 0xffe4a8, sunIntensity: 2.55, hemiSkyHex: 0x9ad1f5, hemiGroundHex: 0x7d6442, hemiIntensity: 0.98, skyTopHex: '#1f4f7d', skyHorizonHex: '#d6be8f', fogHex: 0xb59f79, fogDensity: 0.0044, exposure: 1.12 },
  { id: 'CloudExample', label: 'CloudExample (Nublado)', sunAzimuthDeg: 25, sunElevationDeg: 48, sunColorHex: 0xdce4ed, sunIntensity: 1.65, hemiSkyHex: 0x9fb0c2, hemiGroundHex: 0x434d47, hemiIntensity: 1.05, skyTopHex: '#3c4854', skyHorizonHex: '#8e9ba8', fogHex: 0x788491, fogDensity: 0.0062, exposure: 0.98 },
  { id: 'Erebus', label: 'Erebus (Brasas do Submundo)', sunAzimuthDeg: 85, sunElevationDeg: 28, sunColorHex: 0xff6230, sunIntensity: 1.75, hemiSkyHex: 0x6e261f, hemiGroundHex: 0x29110d, hemiIntensity: 0.68, skyTopHex: '#140608', skyHorizonHex: '#6e2319', fogHex: 0x421512, fogDensity: 0.0078, exposure: 0.92 },
  { id: 'Fimbulwinter', label: 'Fimbulwinter (Inverno Eterno)', sunAzimuthDeg: -40, sunElevationDeg: 26, sunColorHex: 0xb8dcff, sunIntensity: 1.5, hemiSkyHex: 0x7fa5cc, hemiGroundHex: 0x3b4d61, hemiIntensity: 0.88, skyTopHex: '#1c2c40', skyHorizonHex: '#8fa9c2', fogHex: 0x7590ab, fogDensity: 0.0074, exposure: 0.96 },
  { id: 'Ghost Lake', label: 'Ghost Lake (Névoa Glacial)', sunAzimuthDeg: -22, sunElevationDeg: 35, sunColorHex: 0xd6eeff, sunIntensity: 1.8, hemiSkyHex: 0xa2c8e0, hemiGroundHex: 0x4e606e, hemiIntensity: 0.95, skyTopHex: '#253c52', skyHorizonHex: '#adc8d9', fogHex: 0x92afc2, fogDensity: 0.0068, exposure: 1.02 },
  { id: 'Hades', label: 'Hades (Domínio dos Mortos)', sunAzimuthDeg: 95, sunElevationDeg: 24, sunColorHex: 0xd45b44, sunIntensity: 1.45, hemiSkyHex: 0x472536, hemiGroundHex: 0x1a0e14, hemiIntensity: 0.58, skyTopHex: '#0d060d', skyHorizonHex: '#4f1e28', fogHex: 0x2e131c, fogDensity: 0.0082, exposure: 0.88 },
  { id: 'Hades2', label: 'Hades2 (Fogo Verde Estígio)', sunAzimuthDeg: 105, sunElevationDeg: 22, sunColorHex: 0x52e09d, sunIntensity: 1.35, hemiSkyHex: 0x1f4f42, hemiGroundHex: 0x0d1c18, hemiIntensity: 0.58, skyTopHex: '#050f0d', skyHorizonHex: '#1c4d3e', fogHex: 0x123028, fogDensity: 0.008, exposure: 0.88 },
  { id: 'tdo', label: 'tdo (Alvorada Cinza)', sunAzimuthDeg: -70, sunElevationDeg: 16, sunColorHex: 0xcbd5e1, sunIntensity: 1.3, hemiSkyHex: 0x64748b, hemiGroundHex: 0x262f3b, hemiIntensity: 0.72, skyTopHex: '#17202e', skyHorizonHex: '#69788c', fogHex: 0x4c5a6e, fogDensity: 0.0065, exposure: 0.92 },
  { id: 'td1', label: 'td1 (Manhã Dourada)', sunAzimuthDeg: -35, sunElevationDeg: 34, sunColorHex: 0xffdf9e, sunIntensity: 2.15, hemiSkyHex: 0x9bc4e8, hemiGroundHex: 0x52573f, hemiIntensity: 0.9, skyTopHex: '#21456e', skyHorizonHex: '#c4b899', fogHex: 0x9fa18c, fogDensity: 0.0048, exposure: 1.05 },
  { id: 'td2', label: 'td2 (Meio-Dia Árido)', sunAzimuthDeg: 12, sunElevationDeg: 70, sunColorHex: 0xfff0c8, sunIntensity: 2.65, hemiSkyHex: 0xb8d9f0, hemiGroundHex: 0x856d49, hemiIntensity: 1.0, skyTopHex: '#285680', skyHorizonHex: '#deca9b', fogHex: 0xc2b086, fogDensity: 0.0042, exposure: 1.12 },
  { id: 'td3', label: 'td3 (Tarde Tempestuosa)', sunAzimuthDeg: 78, sunElevationDeg: 38, sunColorHex: 0xbac7d9, sunIntensity: 1.5, hemiSkyHex: 0x687b91, hemiGroundHex: 0x2c3633, hemiIntensity: 0.85, skyTopHex: '#1f2b38', skyHorizonHex: '#637587', fogHex: 0x4b5c6e, fogDensity: 0.0066, exposure: 0.94 },
  { id: 'td4', label: 'td4 (Entardecer Âmbar)', sunAzimuthDeg: 112, sunElevationDeg: 20, sunColorHex: 0xff9e54, sunIntensity: 2.05, hemiSkyHex: 0xbd7764, hemiGroundHex: 0x3b2a22, hemiIntensity: 0.78, skyTopHex: '#261d33', skyHorizonHex: '#d47c4a', fogHex: 0x94593e, fogDensity: 0.0058, exposure: 1.0 },
  { id: 'td5', label: 'td5 (Crepúsculo Violeta)', sunAzimuthDeg: 140, sunElevationDeg: 12, sunColorHex: 0xc47ae8, sunIntensity: 1.2, hemiSkyHex: 0x5c4282, hemiGroundHex: 0x1d1629, hemiIntensity: 0.62, skyTopHex: '#100a21', skyHorizonHex: '#634385', fogHex: 0x3a2852, fogDensity: 0.007, exposure: 0.88 },
  { id: 'td6', label: 'td6 (Meia-Noite Estrelada)', sunAzimuthDeg: -160, sunElevationDeg: 30, sunColorHex: 0x80aaff, sunIntensity: 0.75, hemiSkyHex: 0x243b6b, hemiGroundHex: 0x0d1424, hemiIntensity: 0.48, skyTopHex: '#040712', skyHorizonHex: '#132240', fogHex: 0x0c162b, fogDensity: 0.0078, exposure: 0.8 },
  { id: 'td7', label: 'td7 (Madrugada Gélida)', sunAzimuthDeg: -100, sunElevationDeg: 18, sunColorHex: 0xaad4f5, sunIntensity: 1.15, hemiSkyHex: 0x567799, hemiGroundHex: 0x202d3b, hemiIntensity: 0.65, skyTopHex: '#0f1c2e', skyHorizonHex: '#597a99', fogHex: 0x3b536b, fogDensity: 0.0068, exposure: 0.9 },
];

export function getLightingPresetById(id: string): ScenarioLightingPreset {
  return SCENARIO_LIGHTING_PRESETS.find((p) => p.id === id) ?? SCENARIO_LIGHTING_PRESETS[0];
}

function guessPantheonForUnit(kind: UnitKind): Exclude<EditorPantheonFilter, 'all'> {
  if (
    kind.startsWith('egypt_') ||
    ['pharaoh', 'priest', 'son_of_osiris', 'slinger', 'axeman', 'chariot_archer', 'camel_rider', 'war_elephant', 'siege_tower', 'sphinx', 'wadjet', 'roc', 'petsuchos', 'scarab', 'avenger', 'mummy', 'ra', 'isis', 'set'].includes(kind)
  ) {
    return 'egyptian';
  }
  if (
    kind.startsWith('norse_') ||
    ['ox_cart', 'hersir', 'godi', 'ulfsark', 'throwing_axeman', 'raiding_cavalry', 'huskarl', 'jarl', 'portable_ram', 'troll', 'valkyrie', 'einherjar', 'frost_giant', 'mountain_giant', 'battle_boar', 'kraken', 'rock_troll', 'fire_giant', 'fenris_wolf', 'nidhogg', 'jormungand', 'fafnir'].includes(kind)
  ) {
    return 'norse';
  }
  if (
    ['citizen', 'oracle', 'llama_caravan', 'murmillo', 'katapeltes', 'turma', 'cheiroballista', 'arcus', 'contarius', 'destroyer', 'fanatic', 'fire_siphon', 'onager', 'promethean', 'promethean_offspring', 'caladria', 'behemoth', 'stymphalian_bird', 'dryad', 'hekagigantes', 'argus', 'lampades', 'carnivora', 'tartarian_spawn', 'automaton'].includes(kind)
  ) {
    return 'atlantean';
  }
  if (
    ['chinese_peasant', 'kuafu', 'halberdier', 'chu_ko_nu', 'tiger_cavalry', 'fire_lance', 'nezha', 'jiang_ziya', 'qilin', 'taotie', 'yazi', 'azure_dragon'].includes(kind)
  ) {
    return 'chinese';
  }
  return 'greek';
}

function buildScenarioObjectCatalog(): EditorObjectCatalogItem[] {
  const items: EditorObjectCatalogItem[] = [];

  // 1. Playable Units from UNIT_STATS
  for (const [kind, spec] of Object.entries(UNIT_STATS) as [UnitKind, (typeof UNIT_STATS)[UnitKind]][]) {
    items.push({
      id: `unit_${kind}`,
      name: spec.name,
      category: 'units',
      pantheon: guessPantheonForUnit(kind),
      kindType: 'unit',
      unitKind: kind,
    });
  }

  // 2. Scenario Editor-Exclusive / Campaign Special Units (AoM: Retold)
  const specialUnits: EditorObjectCatalogItem[] = [
    { id: 'spc_arkantos_blessed', name: 'Arkantos (Abençoado)', category: 'units', pantheon: 'special', kindType: 'unit', unitKind: 'jason', defaultScale: 1.32, specialBadge: 'SPC' },
    { id: 'spc_arkantos_god', name: 'Arkantos (Deus)', category: 'units', pantheon: 'special', kindType: 'unit', unitKind: 'zeus', defaultScale: 1.15, specialBadge: 'SPC' },
    { id: 'spc_ajax_older', name: 'Ajax (Veterano SPC)', category: 'units', pantheon: 'special', kindType: 'unit', unitKind: 'ajax', defaultScale: 1.18, specialBadge: 'SPC' },
    { id: 'spc_amanra', name: 'Amanra (Heroína)', category: 'units', pantheon: 'egyptian', kindType: 'unit', unitKind: 'pharaoh', defaultScale: 1.05, specialBadge: 'SPC' },
    { id: 'spc_chiron', name: 'Quíron (Herói Centauro)', category: 'units', pantheon: 'greek', kindType: 'unit', unitKind: 'centaur', defaultScale: 1.2, specialBadge: 'SPC' },
    { id: 'spc_gargarensis', name: 'Gargarensis (Vilão Ciclope)', category: 'units', pantheon: 'special', kindType: 'unit', unitKind: 'cyclops', defaultScale: 1.35, specialBadge: 'SPC' },
    { id: 'spc_kamos', name: 'Kamos (Minotauro Pirata)', category: 'units', pantheon: 'special', kindType: 'unit', unitKind: 'minotaur', defaultScale: 1.3, specialBadge: 'SPC' },
    { id: 'spc_kastor', name: 'Kastor (Herói Atlante)', category: 'units', pantheon: 'atlantean', kindType: 'unit', unitKind: 'fanatic', defaultScale: 1.15, specialBadge: 'SPC' },
    { id: 'spc_reginleif', name: 'Reginleif (Valquíria Heroína)', category: 'units', pantheon: 'norse', kindType: 'unit', unitKind: 'valkyrie', defaultScale: 1.18, specialBadge: 'SPC' },
    { id: 'spc_king_folstag', name: 'Rei Folstag (Gigante de Gelo)', category: 'units', pantheon: 'norse', kindType: 'unit', unitKind: 'frost_giant', defaultScale: 1.35, specialBadge: 'SPC' },
    { id: 'spc_ornlu', name: 'Ornlu (Lobo Lendário)', category: 'units', pantheon: 'norse', kindType: 'unit', unitKind: 'fenris_wolf', defaultScale: 1.35, specialBadge: 'SPC' },
    { id: 'spc_circe', name: 'Circe (Feiticeira)', category: 'units', pantheon: 'greek', kindType: 'unit', unitKind: 'afrodite', defaultScale: 0.9, specialBadge: 'SPC' },
    { id: 'spc_titan_kronos', name: 'Titã Cronos (AotG)', category: 'units', pantheon: 'atlantean', kindType: 'unit', unitKind: 'titan', defaultScale: 1.25, specialBadge: 'SPC' },
    { id: 'spc_titan_gaia', name: 'Titã Gaia', category: 'units', pantheon: 'atlantean', kindType: 'unit', unitKind: 'titan', defaultScale: 1.2, specialBadge: 'SPC' },
    { id: 'spc_trojan_horse', name: 'Cavalo de Troia', category: 'units', pantheon: 'special', kindType: 'prop', propKind: 'trojan_horse', defaultScale: 1.35, specialBadge: 'SPC' },
    { id: 'spc_living_poseidon', name: 'Estátua Viva de Poseidon', category: 'units', pantheon: 'greek', kindType: 'prop', propKind: 'statue_poseidon', defaultScale: 1.45, specialBadge: 'SPC' },
    { id: 'spc_testing_dummy', name: 'Boneco de Treino (Testing Dummy)', category: 'test', pantheon: 'special', kindType: 'prop', propKind: 'testing_dummy', defaultScale: 1.0, specialBadge: 'TEST' },
  ];
  items.push(...specialUnits);

  // 3. Playable Buildings
  for (const [kind, spec] of Object.entries(BUILDING_STATS) as [BuildingKind, (typeof BUILDING_STATS)[BuildingKind]][]) {
    items.push({
      id: `bld_${kind}`,
      name: spec.name,
      category: 'buildings',
      pantheon: kind === 'monument' || kind === 'obelisk' ? 'egyptian' : kind === 'asgard_hill_fort' ? 'norse' : kind === 'sky_passage' ? 'atlantean' : 'greek',
      kindType: 'building',
      buildingKind: kind,
    });
  }

  // 4. Scenario Editor-Exclusive Campaign Buildings
  const specialBuildings: EditorObjectCatalogItem[] = [
    { id: 'spc_gate_troy', name: 'Portão de Troia', category: 'buildings', pantheon: 'special', kindType: 'prop', propKind: 'troy_gate', defaultScale: 1.25, specialBadge: 'SPC' },
    { id: 'spc_wall_troy', name: 'Muralha de Troia', category: 'buildings', pantheon: 'special', kindType: 'prop', propKind: 'troy_wall', defaultScale: 1.15, specialBadge: 'SPC' },
    { id: 'spc_wall_atlantis', name: 'Muralha de Atlântida', category: 'buildings', pantheon: 'atlantean', kindType: 'prop', propKind: 'atlantis_wall', defaultScale: 1.15, specialBadge: 'SPC' },
    { id: 'spc_hades_gate', name: 'Portão de Hades', category: 'buildings', pantheon: 'special', kindType: 'prop', propKind: 'hades_gate', defaultScale: 1.35, specialBadge: 'SPC' },
    { id: 'spc_bridge', name: 'Ponte de Pedra', category: 'buildings', pantheon: 'gaia', kindType: 'prop', propKind: 'bridge', defaultScale: 1.2, specialBadge: 'SPC' },
    { id: 'spc_osiris_pyramid', name: 'Pirâmide de Osíris', category: 'buildings', pantheon: 'egyptian', kindType: 'prop', propKind: 'osiris_pyramid', defaultScale: 1.4, specialBadge: 'SPC' },
    { id: 'spc_well_of_urd', name: 'Poço de Urd', category: 'buildings', pantheon: 'norse', kindType: 'prop', propKind: 'well_of_urd', defaultScale: 1.25, specialBadge: 'SPC' },
    { id: 'spc_dwarven_forge', name: 'Forja dos Anões', category: 'buildings', pantheon: 'norse', kindType: 'prop', propKind: 'dwarven_forge', defaultScale: 1.2, specialBadge: 'SPC' },
    { id: 'spc_gaia_pool', name: 'Fonte de Gaia', category: 'buildings', pantheon: 'atlantean', kindType: 'prop', propKind: 'gaia_pool', defaultScale: 1.2, specialBadge: 'SPC' },
    { id: 'spc_torii_gate', name: 'Portão Torii', category: 'buildings', pantheon: 'chinese', kindType: 'prop', propKind: 'torii_gate', defaultScale: 1.15, specialBadge: 'SPC' },
    { id: 'spc_plenty_vault', name: 'Cofre da Abundância', category: 'buildings', pantheon: 'gaia', kindType: 'resource', resourceKind: 'plenty_vault', defaultScale: 1.0, specialBadge: 'SPC' },
    { id: 'spc_abandoned_tc', name: 'Assentamento Abandonado', category: 'buildings', pantheon: 'gaia', kindType: 'resource', resourceKind: 'settlement', defaultScale: 1.0 },
  ];
  items.push(...specialBuildings);

  // 5. Nature: Trees, Resources, Fauna
  const treeItems: { id: string; name: string; style: BiomeTreeStyle; badge?: string }[] = [
    { id: 'tree_oak', name: 'Carvalho (Oak Tree)', style: 'oak' },
    { id: 'tree_pine', name: 'Pinheiro (Pine Tree)', style: 'nordic_pine' },
    { id: 'tree_palm', name: 'Palmeira (Palm Tree)', style: 'palm' },
    { id: 'tree_snow_pine', name: 'Pinheiro Nevado', style: 'snow_pine' },
    { id: 'tree_jungle', name: 'Árvore Tropical', style: 'jungle' },
    { id: 'tree_acacia', name: 'Acácia da Savana', style: 'acacia' },
    { id: 'tree_cypress', name: 'Cipreste / Pântano', style: 'marsh_cypress' },
    { id: 'tree_oriental', name: 'Árvore Oriental / Bambu', style: 'oriental' },
    { id: 'tree_birch', name: 'Bétula Nórdica', style: 'birch' },
    { id: 'tree_erebus', name: 'Árvore de Érebo', style: 'erebus_ash' },
    { id: 'tree_gaia', name: 'Árvore de Gaia (Gaia Tree)', style: 'oak', badge: 'SPC' },
  ];
  for (const t of treeItems) {
    items.push({
      id: t.id,
      name: t.name,
      category: 'nature',
      pantheon: 'gaia',
      kindType: 'tree',
      treeStyle: t.style,
      defaultScale: t.id === 'tree_gaia' ? 1.35 : 1.0,
      specialBadge: t.badge,
    });
  }

  items.push(
    { id: 'res_gold_mine', name: 'Mina de Ouro', category: 'nature', pantheon: 'gaia', kindType: 'resource', resourceKind: 'gold_mine' },
    { id: 'res_berry', name: 'Arbusto de Frutas', category: 'nature', pantheon: 'gaia', kindType: 'resource', resourceKind: 'berry' },
    { id: 'res_relic', name: 'Relíquia Sagrada', category: 'nature', pantheon: 'gaia', kindType: 'resource', resourceKind: 'relic' },
    { id: 'res_settlement', name: 'Marco de Assentamento', category: 'nature', pantheon: 'gaia', kindType: 'resource', resourceKind: 'settlement' },
    { id: 'res_fish', name: 'Cardume de Peixes', category: 'nature', pantheon: 'gaia', kindType: 'resource', resourceKind: 'fish_spot' }
  );

  for (const [kind, spec] of Object.entries(FAUNA_STATS) as [FaunaKind, (typeof FAUNA_STATS)[FaunaKind]][]) {
    items.push({
      id: `fauna_${kind}`,
      name: spec.name,
      category: 'nature',
      pantheon: 'gaia',
      kindType: 'fauna',
      faunaKind: kind,
    });
  }

  // Editor-exclusive bonus animals
  items.push(
    { id: 'spc_golden_fleece', name: 'Velo de Ouro (Golden Fleece)', category: 'nature', pantheon: 'special', kindType: 'fauna', faunaKind: 'goat', defaultScale: 1.25, specialBadge: 'SPC' },
    { id: 'spc_reindeer', name: 'Rena Ártica (Reindeer)', category: 'nature', pantheon: 'special', kindType: 'fauna', faunaKind: 'deer', defaultScale: 1.1, specialBadge: 'SPC' },
    { id: 'spc_alfred_alpaca', name: 'Alfred Alpaca', category: 'nature', pantheon: 'special', kindType: 'fauna', faunaKind: 'goat', defaultScale: 1.35, specialBadge: 'SPC' }
  );

  // 6. Embellishments & Statues
  const props: EditorObjectCatalogItem[] = [
    { id: 'emb_boulder', name: 'Rochedo / Pedra', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'boulder' },
    { id: 'emb_columns', name: 'Colunas Clássicas', category: 'embellishment', pantheon: 'greek', kindType: 'prop', propKind: 'columns' },
    { id: 'emb_ruins', name: 'Ruínas Antigas', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'ruins' },
    { id: 'emb_statue_major', name: 'Estátua de Deus Maior', category: 'embellishment', pantheon: 'greek', kindType: 'prop', propKind: 'statue_major_god' },
    { id: 'emb_statue_cyclops', name: 'Estátua de Ciclope', category: 'embellishment', pantheon: 'greek', kindType: 'prop', propKind: 'statue_cyclops' },
    { id: 'emb_statue_hydra', name: 'Estátua de Hidra', category: 'embellishment', pantheon: 'greek', kindType: 'prop', propKind: 'statue_hydra' },
    { id: 'emb_statue_lion', name: 'Estátua de Leão', category: 'embellishment', pantheon: 'egyptian', kindType: 'prop', propKind: 'statue_lion' },
    { id: 'emb_tent', name: 'Tenda Militar', category: 'embellishment', pantheon: 'greek', kindType: 'prop', propKind: 'tent' },
    { id: 'emb_torch', name: 'Tocha / Pira Acesa', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'torch' },
    { id: 'emb_flag', name: 'Estandarte / Bandeira', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'flag' },
    { id: 'emb_fountain', name: 'Fonte de Mármore', category: 'embellishment', pantheon: 'greek', kindType: 'prop', propKind: 'fountain' },
    { id: 'emb_fence_wood', name: 'Cerca de Madeira / Barricada', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'fence_wood' },
    { id: 'emb_fence_stone', name: 'Mureta de Pedra', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'fence_stone' },
    { id: 'emb_fence_iron', name: 'Grade de Ferro', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'fence_iron' },
    { id: 'emb_market_stall', name: 'Barraca de Mercado', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'market_stall' },
    { id: 'emb_sign', name: 'Placa de Sinalização', category: 'embellishment', pantheon: 'gaia', kindType: 'prop', propKind: 'sign' },
    { id: 'emb_dig_pile', name: 'Escavação / Pilha de Terra', category: 'embellishment', pantheon: 'egyptian', kindType: 'prop', propKind: 'dig_pile' },
    // Layer 2A — 3D Rocks & Geological Formations (Decorative vs Blocking)
    { id: 'rock_granite_small', name: 'Pedras de Granito (Rock Granite Small)', category: 'nature', pantheon: 'gaia', kindType: 'prop', rockKind: 'rock_granite_small', specialBadge: 'Decor' },
    { id: 'rock_granite_large', name: 'Rochedo de Granito (Bloqueia)', category: 'nature', pantheon: 'gaia', kindType: 'prop', rockKind: 'rock_granite_large', specialBadge: 'Colisão' },
    { id: 'rock_basalt_pillar', name: 'Pilar de Basalto Vulcânico', category: 'nature', pantheon: 'special', kindType: 'prop', rockKind: 'basalt_pillar', specialBadge: 'Colisão' },
    { id: 'rock_stalagmite', name: 'Estalagmite do Submundo', category: 'nature', pantheon: 'special', kindType: 'prop', rockKind: 'underworld_stalagmite', specialBadge: 'Colisão' },
    { id: 'rock_sandstone_mesa', name: 'Formação de Arenito Egípcia', category: 'nature', pantheon: 'egyptian', kindType: 'prop', rockKind: 'sandstone_mesa', specialBadge: 'Colisão' },
    { id: 'rock_olympus_marble', name: 'Afloramento de Mármore do Olimpo', category: 'embellishment', pantheon: 'greek', kindType: 'prop', rockKind: 'olympus_marble_rock', specialBadge: 'Decor' },
    // Layer 2B — Atmospheric FX & Particle Emitters
    { id: 'fx_wind_dust', name: 'Emissor FX: Poeira ao Vento', category: 'embellishment', pantheon: 'special', kindType: 'prop', emitterKind: 'wind_dust', specialBadge: 'FX' },
    { id: 'fx_volcanic_smoke', name: 'Emissor FX: Fumaça Vulcânica', category: 'embellishment', pantheon: 'special', kindType: 'prop', emitterKind: 'volcanic_smoke', specialBadge: 'FX' },
    { id: 'fx_magma_sparks', name: 'Emissor FX: Faíscas de Magma', category: 'embellishment', pantheon: 'special', kindType: 'prop', emitterKind: 'magma_sparks', specialBadge: 'FX' },
    { id: 'fx_low_mist', name: 'Emissor FX: Névoa Baixa', category: 'embellishment', pantheon: 'special', kindType: 'prop', emitterKind: 'low_mist', specialBadge: 'FX' },
    { id: 'fx_sunbeams', name: 'Emissor FX: Raios de Luz (Sunbeams)', category: 'embellishment', pantheon: 'special', kindType: 'prop', emitterKind: 'sunbeams', specialBadge: 'FX' },
  ];
  items.push(...props);

  return items;
}

export const SCENARIO_OBJECT_CATALOG: EditorObjectCatalogItem[] = buildScenarioObjectCatalog();

export function createDefaultPlayers(maxPlayers = 2): ScenarioPlayerData[] {
  const pantheonCycle: PantheonId[] = ['greek', 'egyptian', 'norse', 'atlantean', 'chinese'];
  const list: ScenarioPlayerData[] = [];
  for (let slot = 1; slot <= 12; slot++) {
    const pantheon = pantheonCycle[(slot - 1) % pantheonCycle.length];
    const pCfg = PANTHEONS[pantheon];
    list.push({
      slot,
      name: slot === 1 ? 'Jogador 1 (Herói)' : `Jogador ${slot}`,
      colorHex: PLAYER_COLORS[(slot - 1) % PLAYER_COLORS.length],
      pantheon,
      majorGod: pCfg.deity,
      startingAge: 1,
      minorGodAge2: 'Atena',
      minorGodAge3: 'Apolo',
      minorGodAge4: 'Hefesto',
      control: slot === 1 ? 'human' : slot <= maxPlayers ? 'ai' : 'none',
      visibility: 'normal',
      aiFile: slot % 2 === 0 ? 'Aggressive' : 'Standard',
      startingPop: 6,
      resources: { food: 350, wood: 300, gold: 200, favor: 15 },
    });
  }
  return list;
}

export function createDefaultDiplomacy(): Record<string, DiplomacyStance> {
  const map: Record<string, DiplomacyStance> = {};
  for (let a = 1; a <= 12; a++) {
    for (let b = 1; b <= 12; b++) {
      map[`${a}_${b}`] = a === b ? 'ally' : 'enemy';
    }
  }
  return map;
}

export function createScenarioDocument(opts?: {
  title?: string;
  baseMapId?: MapId | 'blank_grass';
  worldSize?: WorldSizeId;
  seed?: number;
  maxPlayers?: number;
}): ScenarioDocument {
  const baseMapId = opts?.baseMapId ?? 'blank_grass';
  const worldSize = opts?.worldSize ?? 'normal';
  const seed = opts?.seed ?? Math.floor(1000 + Math.random() * 89999);
  const maxPlayers = Math.max(2, Math.min(12, opts?.maxPlayers ?? 2));
  const sizeSpec = getWorldSizeSpec(worldSize);
  const gridSize = 64;
  const heightGrid = new Array<number>(gridSize * gridSize).fill(0.35);
  const terrainGrid = new Array<number>(gridSize * gridSize).fill(1);

  const half = sizeSpec.playableHalfSize;
  if (baseMapId !== 'blank_grass') {
    for (let gz = 0; gz < gridSize; gz++) {
      const wz = -half + (gz / (gridSize - 1)) * (half * 2);
      for (let gx = 0; gx < gridSize; gx++) {
        const wx = -half + (gx / (gridSize - 1)) * (half * 2);
        const h = groundHeightAt(wx, wz, baseMapId, worldSize);
        const idx = gz * gridSize + gx;
        heightGrid[idx] = Number(h.toFixed(3));
        if (h < -0.68) {
          terrainGrid[idx] = baseMapId === 'erebus' ? 9 : 0;
        } else if (h < -0.25) {
          terrainGrid[idx] = 8; // shallow water
        } else if (h > 1.35) {
          terrainGrid[idx] = 4;
        } else if (baseMapId === 'tundra' || baseMapId === 'midgard' || baseMapId === 'ghost_lake' || baseMapId === 'jotunheim') {
          terrainGrid[idx] = 6;
        } else if (baseMapId === 'oasis' || baseMapId === 'valley_of_the_kings' || baseMapId === 'nile' || baseMapId === 'savannah') {
          terrainGrid[idx] = 3;
        } else {
          terrainGrid[idx] = 1;
        }
      }
    }
  }

  // Starter Town Centers for active players arranged cleanly
  const objects: PlacedScenarioObject[] = [];
  const bo = sizeSpec.baseOffset;
  const spawnRing = Math.max(24, bo * 0.92);
  for (let p = 1; p <= maxPlayers; p++) {
    let sx = -bo;
    let sz = bo;
    if (maxPlayers === 2) {
      sx = p === 1 ? -bo : bo;
      sz = p === 1 ? bo : -bo;
    } else {
      const ang = ((p - 1) / maxPlayers) * Math.PI * 2 + Math.PI * 0.75;
      sx = Math.round(Math.cos(ang) * spawnRing);
      sz = Math.round(Math.sin(ang) * spawnRing);
    }
    objects.push({
      uid: `tc_p${p}_${seed}`,
      catalogId: 'bld_town_center',
      name: 'Centro da Cidade',
      kindType: 'building',
      buildingKind: 'town_center',
      playerSlot: p,
      x: sx,
      z: sz,
      rotationY: 0,
      scale: 1,
    });
    objects.push({
      uid: `vil_p${p}_1_${seed}`,
      catalogId: 'unit_villager',
      name: 'Aldeão',
      kindType: 'unit',
      unitKind: 'villager',
      playerSlot: p,
      x: sx + 4,
      z: sz + 4,
      rotationY: 0,
      scale: 1,
    });
    objects.push({
      uid: `gold_p${p}_${seed}`,
      catalogId: 'res_gold_mine',
      name: 'Mina de Ouro',
      kindType: 'resource',
      resourceKind: 'gold_mine',
      playerSlot: 0,
      x: sx + (sx < 0 ? 11 : -11),
      z: sz + (sz > 0 ? -9 : 9),
      rotationY: 0,
      scale: 1,
    });
  }

  return {
    id: `scn_${Date.now()}_${Math.floor(Math.random() * 999)}`,
    title:
      opts?.title ??
      (baseMapId === 'blank_grass'
        ? 'Novo Cenário Gramado'
        : `Cenário: ${MAPS[baseMapId]?.name ?? baseMapId}`),
    author: 'Arquitetos do Olimpo',
    description: 'Cenário criado no Editor 3D de Age of Mythology: Olympus.',
    updatedAt: new Date().toISOString(),
    baseMapId,
    seed,
    worldSize,
    widthMeters: sizeSpec.mapHalfSize * 2,
    depthMeters: sizeSpec.mapHalfSize * 2,
    gridSize,
    maxPlayers,
    bonusPopulation: 0,
    populationLimit: 160,
    standardVictory: true,
    lightingId: baseMapId === 'erebus' ? 'Erebus' : baseMapId === 'tundra' ? 'Fimbulwinter' : 'Default',
    skyBoxEnabled: true,
    sunAzimuthDeg: 38,
    sunElevationDeg: 52,
    globalElevationOffset: 0,
    heightGrid,
    terrainGrid,
    objects,
    players: createDefaultPlayers(maxPlayers),
    diplomacy: createDefaultDiplomacy(),
    objectives: [
      {
        id: 'obj_1',
        title: 'Conquistar o Território',
        description: 'Derrote as forças adversárias ou erga uma Maravilha para vencer o cenário.',
        type: 'primary',
      },
      {
        id: 'hint_1',
        title: 'Dica Estratégica',
        description: 'Explore as minas de ouro, relíquias e assentamentos neutros espalhados pelo mapa.',
        type: 'hint',
      },
    ],
    forbiddenByPlayer: {},
  };
}

// ── LocalStorage Persistence for Scenarios & Custom Campaigns ──
const SCENARIOS_STORAGE_KEY = 'aom_olympus_saved_scenarios_v1';
const CAMPAIGNS_STORAGE_KEY = 'aom_olympus_custom_campaigns_v1';

export function loadSavedScenarios(): ScenarioDocument[] {
  try {
    const raw = window.localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScenarioToStorage(doc: ScenarioDocument): ScenarioDocument[] {
  const stamped: ScenarioDocument = { ...doc, updatedAt: new Date().toISOString() };
  const list = loadSavedScenarios().filter((s) => s.id !== stamped.id);
  const next = [stamped, ...list].slice(0, 24);
  try {
    window.localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
  return next;
}

export function deleteScenarioFromStorage(id: string): ScenarioDocument[] {
  const next = loadSavedScenarios().filter((s) => s.id !== id);
  try {
    window.localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function loadCustomCampaigns(): CustomCampaignDocument[] {
  try {
    const raw = window.localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCampaignToStorage(camp: CustomCampaignDocument): CustomCampaignDocument[] {
  const stamped: CustomCampaignDocument = { ...camp, updatedAt: new Date().toISOString() };
  const list = loadCustomCampaigns().filter((c) => c.id !== stamped.id);
  const next = [stamped, ...list].slice(0, 12);
  try {
    window.localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

// ── Active Playtest Runtime Bridge ──
export interface ActiveScenarioPlaytest {
  doc: ScenarioDocument;
  playAsSlot: number;
  difficulty: DifficultyId;
}

let activeScenarioPlaytest: ActiveScenarioPlaytest | null = null;

export function setActiveScenarioPlaytest(payload: ActiveScenarioPlaytest | null) {
  activeScenarioPlaytest = payload;
}

export function getActiveScenarioPlaytest(): ActiveScenarioPlaytest | null {
  return activeScenarioPlaytest;
}

/**
 * Compiles a ScenarioDocument into a real RmsGeneratedMap so AoMEngine renders
 * the exact sculpted 3D heights, painted textures, shallow/deep water, and objects.
 */
export function compileScenarioToRmsMap(doc: ScenarioDocument): RmsGeneratedMap {
  const sizeSpec = getWorldSizeSpec(doc.worldSize);
  const gs = doc.gridSize;
  const half = sizeSpec.playableHalfSize;

  const heightGrid = new Float32Array(gs * gs);
  const terrainGrid = new Uint8Array(gs * gs);
  for (let i = 0; i < gs * gs; i++) {
    heightGrid[i] = (doc.heightGrid[i] ?? 0.35) + doc.globalElevationOffset;
    const rawCode = doc.terrainGrid[i] ?? 1;
    // Map extended editor codes (8=shallow water, 9=lava) to RmsTerrainCode 0..7
    terrainGrid[i] = rawCode === 8 ? 3 : rawCode === 9 ? 4 : Math.max(0, Math.min(7, rawCode));
  }

  const sampleHeight = (worldX: number, worldZ: number): number => {
    const u = Math.max(0, Math.min(1, (worldX + half) / (half * 2)));
    const v = Math.max(0, Math.min(1, (worldZ + half) / (half * 2)));
    const fx = u * (gs - 1);
    const fz = v * (gs - 1);
    const x0 = Math.floor(fx);
    const z0 = Math.floor(fz);
    const x1 = Math.min(gs - 1, x0 + 1);
    const z1 = Math.min(gs - 1, z0 + 1);
    const tx = fx - x0;
    const tz = fz - z0;
    const h00 = heightGrid[z0 * gs + x0];
    const h10 = heightGrid[z0 * gs + x1];
    const h01 = heightGrid[z1 * gs + x0];
    const h11 = heightGrid[z1 * gs + x1];
    const hx0 = h00 + (h10 - h00) * tx;
    const hx1 = h01 + (h11 - h01) * tx;
    return hx0 + (hx1 - hx0) * tz;
  };

  const sampleTerrainCode = (worldX: number, worldZ: number): RmsTerrainCode => {
    const u = Math.max(0, Math.min(1, (worldX + half) / (half * 2)));
    const v = Math.max(0, Math.min(1, (worldZ + half) / (half * 2)));
    const gx = Math.round(u * (gs - 1));
    const gz = Math.round(v * (gs - 1));
    return (terrainGrid[gz * gs + gx] as RmsTerrainCode) ?? 1;
  };

  // Detect dominant biome from painted terrain
  let snowCnt = 0;
  let sandCnt = 0;
  let lavaCnt = 0;
  for (let i = 0; i < doc.terrainGrid.length; i++) {
    if (doc.terrainGrid[i] === 6) snowCnt++;
    else if (doc.terrainGrid[i] === 3) sandCnt++;
    else if (doc.terrainGrid[i] === 9) lavaCnt++;
  }
  const total = Math.max(1, doc.terrainGrid.length);
  const biome: MapBiomeKind =
    lavaCnt / total > 0.12
      ? 'volcanic'
      : snowCnt / total > 0.28
      ? 'frozen'
      : sandCnt / total > 0.3
      ? 'desert'
      : 'temperate';

  const rmsObjects: RmsPlacedObject[] = [];
  for (const obj of doc.objects) {
    if (obj.kindType === 'tree') {
      rmsObjects.push({ id: obj.uid, proto: obj.treeStyle ?? 'oak', category: 'tree', x: obj.x, z: obj.z, playerSlot: 0 });
    } else if (obj.kindType === 'fauna' && obj.faunaKind) {
      rmsObjects.push({ id: obj.uid, proto: obj.faunaKind, category: 'fauna', x: obj.x, z: obj.z, playerSlot: 0, faunaKind: obj.faunaKind });
    } else if (obj.kindType === 'resource') {
      const cat =
        obj.resourceKind === 'gold_mine'
          ? 'gold'
          : obj.resourceKind === 'berry'
          ? 'berry'
          : obj.resourceKind === 'relic'
          ? 'relic'
          : obj.resourceKind === 'settlement'
          ? 'settlement'
          : obj.resourceKind === 'plenty_vault'
          ? 'vault'
          : 'fish';
      rmsObjects.push({ id: obj.uid, proto: obj.name, category: cat, x: obj.x, z: obj.z, playerSlot: 0 });
    }
  }

  const players = doc.players.slice(0, doc.maxPlayers).map((p) => {
    const tc = doc.objects.find((o) => o.playerSlot === p.slot && o.buildingKind === 'town_center');
    const x = tc?.x ?? (p.slot === 1 ? -sizeSpec.baseOffset : sizeSpec.baseOffset);
    const z = tc?.z ?? (p.slot === 1 ? sizeSpec.baseOffset : -sizeSpec.baseOffset);
    return {
      slot: p.slot,
      fracX: (x + half) / (half * 2),
      fracZ: (z + half) / (half * 2),
      x,
      z,
    };
  });

  return {
    scriptId: doc.id,
    title: doc.title,
    seed: doc.seed,
    worldSize: doc.worldSize,
    playerCount: doc.maxPlayers,
    logicalSizeMeters: doc.widthMeters,
    mapHalfSize: sizeSpec.mapHalfSize,
    playableHalfSize: half,
    gridSize: gs,
    biome,
    seaType: biome === 'volcanic' ? 'Hades Lava' : biome === 'frozen' ? 'Arctic Sea' : 'Greek Sea',
    heightGrid,
    terrainGrid,
    areas: [],
    connections: [],
    constraintsCount: 0,
    players,
    objects: rmsObjects,
    triggers: [],
    triggersSummary: {
      introMessage: doc.objectives[0]?.description,
      grantResources: doc.players[0]?.resources,
      destroyAllOnDefeat: false,
      triggerCount: 0,
    },
    fairness: [],
    logs: [],
    durationMs: 1,
    sampleHeight,
    sampleTerrainCode,
  };
}
