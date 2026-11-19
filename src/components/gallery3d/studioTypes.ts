import { EGYPT_ARCH_BUILDING_META, isEgyptianArchBuilding } from '../../civilizacao/egipcios/egyptianArchitectureSuite';
import {
  AgeLevel,
  BuildingKind,
  FaunaKind,
  MapExpansion,
  PantheonId,
  UnitKind,
  WorldSizeId,
} from '../../game/types';
import { InspectableUnitId } from '../gallery3dCatalog';
import { MapId } from '../../game/types';

export interface HopliteUvBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: '3d' | 'sprite' | 'brg' | 'uv2d';
  activeTier: 1 | 2 | 3 | 4;
  onSelectMode: (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => void;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
}

export type GalleryCategory = 'unit' | 'building' | 'map' | 'terrain' | 'fauna' | 'flora' | 'utensil' | 'relic';
export type LightingMood = 'studio' | 'day' | 'dusk' | 'night';
export type CameraPreset = 'iso' | 'front' | 'side' | 'top';
export type UnitCategoryFilter = 'all' | 'god' | 'hero' | 'troop' | 'myth';
export type MapExpansionFilter = 'all' | MapExpansion;
export type FaunaDietFilter = 'all' | 'pacific' | 'aggressive';
export type FloraTypeFilter = 'all' | 'tree' | 'resource';
export type UtensilCategoryFilter = 'all' | 'work' | 'domestic' | 'ritual';
export type RelicPantheonFilter = 'all' | 'greek' | 'egyptian' | 'norse' | 'atlantean';

export interface DioramaMetrics {
  minHeight: number;
  maxHeight: number;
  waterCoveragePct: number;
  effectiveBiome: string;
  worldSizeLabel: string;
  dimsLabel: string;
  playableDimsLabel: string;
  baseDistance: number;
  treeClusterCount: number;
  goldMineCount: number;
  settlementCount: number;
  faunaCount: number;
}

export interface LightingPresetConfig {
  label: string;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  keyColor: number;
  keyIntensity: number;
  keyPos: [number, number, number];
  rimColor: number;
  rimIntensity: number;
  rimPos: [number, number, number];
  exposure: number;
}

export const LIGHTING_PRESETS: Record<LightingMood, LightingPresetConfig> = {
  studio: {
    label: 'Estúdio',
    hemiSky: 0xfffbeb,
    hemiGround: 0x1e293b,
    hemiIntensity: 1.25,
    keyColor: 0xfff3da,
    keyIntensity: 2.1,
    keyPos: [5, 8, 5],
    rimColor: 0x38bdf8,
    rimIntensity: 0.95,
    rimPos: [-5, 3.5, -4],
    exposure: 1.15,
  },
  day: {
    label: 'Dia Solar',
    hemiSky: 0xe0f2fe,
    hemiGround: 0x4d3f2c,
    hemiIntensity: 1.45,
    keyColor: 0xffffff,
    keyIntensity: 2.6,
    keyPos: [7, 11, 4],
    rimColor: 0xbae6fd,
    rimIntensity: 0.65,
    rimPos: [-4, 4, -5],
    exposure: 1.22,
  },
  dusk: {
    label: 'Crepúsculo',
    hemiSky: 0xfdba74,
    hemiGround: 0x1e1b4b,
    hemiIntensity: 1.1,
    keyColor: 0xfb923c,
    keyIntensity: 2.35,
    keyPos: [8, 4.2, 4],
    rimColor: 0x818cf8,
    rimIntensity: 1.15,
    rimPos: [-6, 3, -4],
    exposure: 1.12,
  },
  night: {
    label: 'Noturno',
    hemiSky: 0x38bdf8,
    hemiGround: 0x090d16,
    hemiIntensity: 0.78,
    keyColor: 0x93c5fd,
    keyIntensity: 1.38,
    keyPos: [4, 8, 5],
    rimColor: 0xfacc15,
    rimIntensity: 1.42,
    rimPos: [-5, 4, -5],
    exposure: 1.04,
  },
};

export const WEATHER_LABELS: Record<string, string> = {
  clear: 'Céu Limpo',
  rain: 'Chuva',
  snow: 'Neve',
  sandstorm: 'Tempestade de Areia',
};

export const SPECIAL_RULE_LABELS: Record<string, string> = {
  koth_vault: 'Rei da Colina (Cofre Central)',
  nomad: 'Nômade (Sem Centro Inicial)',
  sudden_death: 'Morte Súbita (1 Centro Máximo)',
  megalopolis: 'Megalópole (Base Fortificada)',
  valley_guardians: 'Guardiões do Vale',
  land_unknown: 'Semente Terrestre Aleatória',
  the_unknown: 'Semente Mundial Aleatória',
  sea_of_worms: 'Mar de Vermes',
  total_war: 'Guerra Total I (.xs/.xml — Anel + Continente + Dia/Noite)',
  rms_custom: 'Script Procedural AoM: Retold (.xs / .xml)',
};

export const BUILDING_ERA_SPECS: {
  tier: AgeLevel;
  title: string;
  desc: string;
}[] = [
  {
    tier: 1,
    title: 'T1 · Era Arcaica',
    desc: 'Base fundamental com cantaria rústica, madeira inicial e marcas do clã.',
  },
  {
    tier: 2,
    title: 'T2 · Era Clássica',
    desc: 'Colunatas frontais, frisos esculpidos e reforços estruturais de guerra.',
  },
  {
    tier: 3,
    title: 'T3 · Era Heroica',
    desc: 'Alas expandidas, estátuas votivas, baluartes e pátios monumentais.',
  },
  {
    tier: 4,
    title: 'T4 · Era Mítica',
    desc: 'Cúpulas sagradas, obeliscos e detalhes de oricalco e ouro divino.',
  },
  {
    tier: 5,
    title: 'T5 · Metrópole Divina',
    desc: 'Apogeu civilizacional com coroação celeste, halo rúnico e cristal de poder.',
  },
];

export function formatHex(hexNum: number): string {
  return `#${hexNum.toString(16).padStart(6, '0')}`;
}

export function isGreekOrEgyptianGod(unit: UnitKind | InspectableUnitId, civ: PantheonId): boolean {
  if (civ === 'greek') {
    return (
      unit === 'zeus' ||
      unit === 'poseidon' ||
      unit === 'hades' ||
      unit === 'artemis' ||
      unit === 'hefesto' ||
      unit === 'dionisio' ||
      unit === 'afrodite' ||
      unit === 'apolo' ||
      unit === 'ares' ||
      unit === 'atena' ||
      unit === 'hermes'
    );
  }
  if (civ === 'egyptian') {
    return unit === 'ra' || unit === 'isis' || unit === 'set';
  }
  return false;
}

export interface FramingParams {
  galleryCategory: GalleryCategory;
  mapWorldSize: WorldSizeId;
  selectedTerrainKind: 'surface' | 'rock' | 'fx';
  selectedFauna: FaunaKind;
  selectedFloraCategory: 'tree' | 'resource';
  selectedFloraResourceKind?: string;
  selectedBuilding: BuildingKind;
  selectedCiv: PantheonId;
  buildingAge: AgeLevel;
  selectedUnit: InspectableUnitId;
  selectedMap?: MapId;
}

export interface FramingSpec {
  target: [number, number, number];
  offset: [number, number, number];
  baseDist: number;
}

export function getFramingForSubject(params: FramingParams, focusHead: boolean): FramingSpec {
  const {
    galleryCategory,
    mapWorldSize,
    selectedTerrainKind,
    selectedFauna,
    selectedFloraCategory,
    selectedFloraResourceKind,
    selectedBuilding,
    selectedCiv,
    buildingAge,
    selectedUnit,
  } = params;

  if (galleryCategory === 'map') {
    const sizeMult = mapWorldSize === 'giant' ? 1.38 : mapWorldSize === 'large' ? 1.16 : 0.94;
    return {
      target: [0, 0.2, 0],
      offset: [9.4 * sizeMult, 8.6 * sizeMult, 9.4 * sizeMult],
      baseDist: 15.6 * sizeMult,
    };
  }
  if (galleryCategory === 'terrain') {
    if (selectedTerrainKind === 'fx') {
      return {
        target: [0, 1.5, 0],
        offset: [4.8, 3.2, 5.4],
        baseDist: 7.9,
      };
    }
    if (selectedTerrainKind === 'rock') {
      return {
        target: [0, 1.05, 0],
        offset: [4.2, 2.7, 4.6],
        baseDist: 6.7,
      };
    }
    return {
      target: [0, 0.85, 0],
      offset: [4.7, 3.8, 4.9],
      baseDist: 7.7,
    };
  }
  if (galleryCategory === 'fauna') {
    const large =
      selectedFauna === 'elephant_wild' ||
      selectedFauna === 'hippo' ||
      selectedFauna === 'camel' ||
      selectedFauna === 'aurochs' ||
      selectedFauna === 'musk_ox';
    const dist = large ? 4.6 : 3.6;
    const ty = large ? 0.85 : 0.6;
    return {
      target: [0, ty, 0],
      offset: [dist * 0.65, dist * 0.35, dist * 0.72],
      baseDist: dist,
    };
  }
  if (galleryCategory === 'flora') {
    const isLargeLandmark =
      selectedFloraCategory === 'tree' ||
      selectedFloraResourceKind === 'plenty_vault' ||
      selectedFloraResourceKind === 'settlement';
    const dist = isLargeLandmark ? 6.8 : 4.2;
    const ty = selectedFloraCategory === 'tree' ? 1.75 : 0.85;
    return {
      target: [0, ty, 0],
      offset: [dist * 0.56, dist * 0.34, dist * 0.78],
      baseDist: dist,
    };
  }
  if (galleryCategory === 'utensil') {
    return {
      target: [0, 0.75, 0],
      offset: [2.5, 1.5, 3.0],
      baseDist: 4.1,
    };
  }
  if (galleryCategory === 'relic') {
    return {
      target: [0, 1.0, 0],
      offset: [2.3, 1.4, 3.1],
      baseDist: 4.1,
    };
  }
  if (galleryCategory === 'building') {
    const isTemple = selectedBuilding === 'temple';
    const isEgyptArch = selectedCiv === 'egyptian' && isEgyptianArchBuilding(selectedBuilding);
    if (isEgyptArch) {
      const meta = EGYPT_ARCH_BUILDING_META[selectedBuilding];
      if (focusHead) {
        const dist = meta.focusDist;
        return {
          target: [0, meta.focusTargetY, 0.85],
          offset: [dist * 0.24, dist * 0.22, dist * 0.94],
          baseDist: dist,
        };
      }
      const effTier = Math.max(meta.minTier, Math.min(5, buildingAge));
      const dist = meta.overviewDist + (effTier - meta.minTier) * 0.55;
      return {
        target: [0, 1.35, 0],
        offset: [dist * 0.54, dist * 0.42, dist * 0.72],
        baseDist: dist,
      };
    }
    if (isTemple && focusHead) {
      const dist = 5.2;
      const ty = buildingAge === 5 ? 2.25 : 1.45;
      return {
        target: [0, ty, 0],
        offset: [dist * 0.25, dist * 0.20, dist * 0.94],
        baseDist: dist,
      };
    }
    const dist = isTemple ? (buildingAge === 5 ? 13.0 : 8.5 + (buildingAge - 1) * 1.0) : (buildingAge === 5 ? 10.4 : 8.6);
    const ty = isTemple ? 1.45 + buildingAge * 0.12 : 1.55;
    return {
      target: [0, ty, 0],
      offset: [dist * 0.64, dist * 0.44, dist * 0.64],
      baseDist: dist,
    };
  }

  // Units & Gods
  const isGod = isGreekOrEgyptianGod(selectedUnit, selectedCiv);
  if (isGod) {
    const isMajor =
      selectedUnit === 'zeus' ||
      selectedUnit === 'poseidon' ||
      selectedUnit === 'hades' ||
      selectedUnit === 'isis' ||
      selectedUnit === 'set' ||
      selectedUnit === 'ra';
    const focusY = focusHead ? (isMajor ? 2.25 : 1.55) : isMajor ? 1.85 : 1.45;
    const dist = focusHead ? (isMajor ? 2.9 : 2.2) : isMajor ? 7.2 : 6.0;
    return {
      target: [0, focusY, 0],
      offset: [0, dist * 0.14, dist],
      baseDist: dist,
    };
  }

  if (selectedCiv === 'greek' && selectedUnit === 'medusa') {
    const dist = focusHead ? 3.2 : 5.4;
    const fy = focusHead ? 1.6 : 1.35;
    return {
      target: [0, fy, 0.2],
      offset: [dist * 0.35, dist * 0.22, dist * 0.9],
      baseDist: dist,
    };
  }
  if (selectedCiv === 'greek' && selectedUnit === 'colossus') {
    const dist = focusHead ? 4.2 : 7.6;
    const fy = focusHead ? 3.0 : 2.1;
    return {
      target: [0, fy, 0],
      offset: [dist * 0.42, dist * 0.26, dist * 0.86],
      baseDist: dist,
    };
  }
  if (selectedCiv === 'greek' && selectedUnit === 'hydra') {
    const dist = focusHead ? 5.2 : 8.8;
    const fy = focusHead ? 2.05 : 1.45;
    const fz = focusHead ? 0.25 : 0.75;
    return {
      target: [0, fy, fz],
      offset: [dist * 0.38, dist * 0.26, dist * 0.88],
      baseDist: dist,
    };
  }
  if (selectedCiv === 'greek' && selectedUnit === 'manticore') {
    const dist = focusHead ? 3.6 : 10.6;
    const fy = focusHead ? 1.45 : 1.35;
    const fz = focusHead ? -1.25 : 1.25;
    return {
      target: [focusHead ? 0.25 : 0, fy, fz],
      offset: [dist * 0.42, dist * 0.28, dist * 0.86],
      baseDist: dist,
    };
  }
  if (selectedCiv === 'greek' && selectedUnit === 'cyclops') {
    const dist = focusHead ? 4.2 : 11.2;
    const fy = focusHead ? 3.15 : 1.55;
    const fz = focusHead ? -0.65 : 1.45;
    return {
      target: [0, fy, fz],
      offset: [dist * 0.42, dist * 0.3, dist * 0.85],
      baseDist: dist,
    };
  }

  const isTitan = selectedUnit === 'titan';
  const isGiantMyth =
    (selectedCiv !== 'greek' && selectedUnit === 'cyclops') ||
    selectedUnit === 'colossus' ||
    selectedUnit === 'hydra' ||
    selectedUnit === 'war_elephant' ||
    selectedUnit === 'roc' ||
    selectedUnit === 'siege_tower' ||
    selectedUnit === 'frost_giant' ||
    selectedUnit === 'mountain_giant' ||
    selectedUnit === 'fire_giant' ||
    selectedUnit === 'nidhogg' ||
    selectedUnit === 'kraken' ||
    selectedUnit === 'jormungand' ||
    selectedUnit === 'fafnir' ||
    selectedUnit === 'hekagigantes' ||
    selectedUnit === 'behemoth' ||
    selectedUnit === 'argus';
  const isMountedOrSiege =
    selectedUnit === 'cavalry' ||
    selectedUnit === 'prodromos' ||
    selectedUnit === 'chariot_archer' ||
    selectedUnit === 'camel_rider' ||
    selectedUnit === 'raiding_cavalry' ||
    selectedUnit === 'jarl' ||
    selectedUnit === 'valkyrie' ||
    selectedUnit === 'battle_boar' ||
    selectedUnit === 'rock_troll' ||
    selectedUnit === 'troll' ||
    selectedUnit === 'einherjar' ||
    selectedUnit === 'fenris_wolf' ||
    selectedUnit === 'ox_cart' ||
    selectedUnit === 'portable_ram' ||
    selectedUnit === 'norse_ballista' ||
    selectedUnit === 'sphinx' ||
    selectedUnit === 'wadjet' ||
    selectedUnit === 'petsuchos' ||
    selectedUnit === 'scarab' ||
    selectedUnit === 'avenger' ||
    selectedUnit === 'mummy' ||
    selectedUnit === 'son_of_osiris' ||
    selectedUnit === 'egypt_catapult' ||
    selectedUnit === 'bellerophon' ||
    selectedUnit === 'pegasus' ||
    selectedUnit === 'manticore' ||
    selectedUnit === 'phoenix' ||
    selectedUnit === 'ram' ||
    selectedUnit === 'siege' ||
    selectedUnit === 'promethean' ||
    selectedUnit === 'automaton' ||
    selectedUnit === 'caladria' ||
    selectedUnit === 'satyr' ||
    selectedUnit === 'stymphalian_bird' ||
    selectedUnit === 'dryad' ||
    selectedUnit === 'lampades' ||
    selectedUnit === 'carnivora' ||
    selectedUnit === 'tartarian_spawn';

  const dist = isTitan ? 7.4 : isGiantMyth ? 6.8 : isMountedOrSiege ? 6.0 : 4.6;
  const ty = isTitan ? 1.45 : isGiantMyth ? 1.7 : isMountedOrSiege ? 1.25 : 1.05;
  return {
    target: [0, ty, 0],
    offset: [dist * 0.42, dist * 0.24, dist * 0.86],
    baseDist: dist,
  };
}
