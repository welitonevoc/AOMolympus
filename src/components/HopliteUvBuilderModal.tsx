import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Box,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  CloudLightning,
  Compass,
  Crown,
  Eye,
  Flame,
  Hammer,
  Layers,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Moon,
  Mountain,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Shield,
  Shuffle,
  Skull,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Swords,
  Trees,
  User,
  Users,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { EraIcon, getEraSubtitle } from './EraIcon';
import {
  buildFloraOrResourceStudioMesh,
  buildMapDiorama,
  GALLERY_FAUNA_ITEMS,
  GALLERY_FLORA_ITEMS,
  GALLERY_MAP_ITEMS,
  getBuildingsForCivAndGod,
  getUnitsForCivAndGod,
  InspectableUnitId,
  MAJOR_GODS_BY_CIV,
  MapDioramaHandle,
} from './gallery3dCatalog';
import {
  buildRelicArtifactMesh,
  buildUtensilMesh,
  GALLERY_RELIC_ITEMS,
  GALLERY_UTENSIL_ITEMS,
  StudioArtifactHandle,
} from './gallery3dArtifacts';
import {
  AOM_HOPLITE_UV_TIERS,
  createGreekUnitMesh,
  HopliteArmorTier,
} from '../civilizacao/gregos/gregosModels';
import {
  animateZeusHoplite,
  buildZeusHoplite,
  createZeusHopliteArena,
  getCachedZeusHopliteTextures,
  HopliteTierId,
  ZeusHopliteAction,
} from '../civilizacao/gregos/zeusHopliteModel';
import {
  animatePoseidonHoplite,
  buildPoseidonHoplite,
  createPoseidonHopliteArena,
  getCachedPoseidonHopliteTextures,
  PoseidonHopliteAction,
} from '../civilizacao/gregos/poseidonHopliteModel';
import {
  animateHadesHoplite,
  buildHadesHoplite,
  createHadesHopliteArena,
  getCachedHadesHopliteTextures,
  HadesHopliteAction,
} from '../civilizacao/gregos/hadesHopliteModel';
import {
  buildGreekVillager,
  GOD_VILLAGER_THEMES,
  GreekVillagerInstance,
} from '../civilizacao/gregos/greekVillagerModel';
import {
  buildNorseWorker,
  NORSE_GOD_THEMES,
  NorseWorkerInstance,
  NorseWorkerRole,
  NorseWorkerTask,
} from '../civilizacao/nordicos/norseVillagerModel';
import {
  buildAtlanteanCitizen,
  buildAtlanteanLlama,
  ATLANTEAN_GOD_THEMES,
  AtlanteanCitizenInstance,
  AtlanteanLlamaInstance,
  AtlanteanAction,
} from '../civilizacao/atlantes/atlanteanVillagerModel';
import {
  buildEgyptianLaborer,
  EGYPTIAN_GOD_THEMES,
  EgyptianLaborerInstance,
  EgyptianLaborerAction,
} from '../civilizacao/egipcios/egyptianVillagerModel';
import {
  buildGreekFortress as buildGreekFortressStudio,
  GREEK_FORTRESS_THEMES,
  GreekFortressAction,
} from '../civilizacao/gregos/greekFortressModel';
import {
  buildAtlanteanFortress as buildAtlanteanFortressStudio,
  ATLANTEAN_FORTRESS_THEMES,
  AtlanteanFortressAction,
} from '../civilizacao/atlantes/atlanteanFortressModel';
import {
  buildNorseHillFort as buildNorseFortressStudio,
  NORSE_FORTRESS_THEMES,
  NorseFortressAction,
} from '../civilizacao/nordicos/norseFortressModel';
import {
  buildGreekTempleStudio,
  GREEK_TEMPLE_THEMES,
  GreekTempleGodKey,
  GreekTempleAction,
} from '../civilizacao/gregos/greekTempleModel';
import {
  buildEgyptianTempleStudio,
  EGYPT_TEMPLE_THEMES,
  EgyptianTempleGodKey,
  EgyptianTempleAction,
} from '../civilizacao/egipcios/egyptianTempleModel';
import {
  buildMedusa as buildStudioMedusa,
  animateMedusaModel as animateStudioMedusa,
  MedusaBuildResult,
} from '../civilizacao/gregos/zeusMedusaModel';
import {
  buildZeusColossus as buildStudioColossus,
  animateColossusModel as animateStudioColossus,
  COLOSSUS_TIERS,
  ColossusBuildResult,
} from '../civilizacao/gregos/zeusColossusModel';
import {
  buildZeusHydra as buildStudioHydra,
  animateHydraModel as animateStudioHydra,
  HydraBuildResult,
} from '../civilizacao/gregos/zeusHydraModel';
import {
  buildZeusManticore as buildStudioManticore,
  animateManticoreModel as animateStudioManticore,
  ManticoreBuildResult,
} from '../civilizacao/gregos/zeusManticoreModel';
import {
  buildZeusCyclops as buildStudioCyclops,
  animateCyclopsModel as animateStudioCyclops,
  CyclopsBuildResult,
  createCyclopsTextures,
} from '../civilizacao/gregos/zeusCyclopsModel';
import {
  animateZeus,
  buildZeus,
  createZeusTempleEnvironment,
  getCachedZeusTextures,
} from '../civilizacao/gregos/zeusModel';
import {
  animatePoseidon,
  buildPoseidon,
  createPoseidonEnvironment,
  getCachedPoseidonTextures,
} from '../civilizacao/gregos/poseidonModel';
import {
  animateHades,
  buildHades,
  createHadesUnderworldEnvironment,
  getCachedHadesTextures,
  HadesUnderworldEnvironment,
} from '../civilizacao/gregos/hadesModel';
import {
  animateArtemis,
  buildArtemis,
  getCachedArtemisTextures,
} from '../civilizacao/gregos/artemisModel';
import {
  animateHephaestus,
  buildHephaestus,
  getCachedHephaestusTextures,
} from '../civilizacao/gregos/hefestoModel';
import {
  animateDionysus,
  buildDionysus,
  getCachedDionysusTextures,
} from '../civilizacao/gregos/dionisioModel';
import {
  animateAphrodite,
  buildAphrodite,
  getCachedAphroditeTextures,
} from '../civilizacao/gregos/afroditeModel';
import {
  animateApollo,
  buildApollo,
  getCachedApolloTextures,
} from '../civilizacao/gregos/apoloModel';
import {
  animateAres,
  buildAres,
  getCachedAresTextures,
} from '../civilizacao/gregos/aresModel';
import {
  animateAthena,
  buildAthena,
  getCachedAtenaTextures,
} from '../civilizacao/gregos/atenaModel';
import {
  animateHermes,
  buildHermes,
  getCachedHermesTextures,
} from '../civilizacao/gregos/hermesModel';
import {
  animateIsis,
  buildIsis,
  getCachedIsisTextures,
} from '../civilizacao/egipcios/isisModel';
import {
  animateSet,
  buildSet,
  getCachedSetTextures,
} from '../civilizacao/egipcios/setModel';
import {
  animateRa,
  buildRa,
  getCachedRaTextures,
} from '../civilizacao/egipcios/raModel';
import { getEffectiveMapConfig, rollUnknownMapVariant } from '../game/mapGeography';
import {
  createBuildingMesh,
  createFaunaMesh,
  createMaterialPalette,
  createUnitMesh,
} from '../game/models';
import {
  createContactShadowTexture,
  createMarbleTexture,
  createSelectionRingTexture,
} from '../game/textures';
import {
  AgeLevel,
  BUILDING_STATS,
  BuildingKind,
  FaunaKind,
  MapExpansion,
  MapId,
  MAPS,
  PANTHEONS,
  PantheonId,
  UNIT_STATS,
  UnitKind,
} from '../game/types';

export { MAJOR_GODS_BY_CIV, getUnitsForCivAndGod, getBuildingsForCivAndGod };
export type { InspectableUnitId };

interface HopliteUvBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: '3d' | 'sprite' | 'brg' | 'uv2d';
  activeTier: 1 | 2 | 3 | 4;
  onSelectMode: (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => void;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
}

type GalleryCategory = 'unit' | 'building' | 'map' | 'fauna' | 'flora' | 'utensil' | 'relic';
type LightingMood = 'studio' | 'day' | 'dusk' | 'night';
type CameraPreset = 'iso' | 'front' | 'side' | 'top';
type UnitCategoryFilter = 'all' | 'god' | 'hero' | 'troop' | 'myth';
type MapExpansionFilter = 'all' | MapExpansion;
type FaunaDietFilter = 'all' | 'pacific' | 'aggressive';
type FloraTypeFilter = 'all' | 'tree' | 'resource';
type UtensilCategoryFilter = 'all' | 'work' | 'domestic' | 'ritual';
type RelicPantheonFilter = 'all' | 'greek' | 'egyptian' | 'norse' | 'atlantean';

const LIGHTING_PRESETS: Record<
  LightingMood,
  {
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
> = {
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

const WEATHER_LABELS: Record<string, string> = {
  clear: 'Céu Limpo',
  rain: 'Chuva',
  snow: 'Neve',
  sandstorm: 'Tempestade de Areia',
};

const SPECIAL_RULE_LABELS: Record<string, string> = {
  koth_vault: 'Rei da Colina (Cofre Central)',
  nomad: 'Nômade (Sem Centro Inicial)',
  sudden_death: 'Morte Súbita (1 Centro Máximo)',
  megalopolis: 'Megalópole (Base Fortificada)',
  valley_guardians: 'Guardiões do Vale',
  land_unknown: 'Semente Terrestre Aleatória',
  the_unknown: 'Semente Mundial Aleatória',
  sea_of_worms: 'Mar de Vermes',
};

const BUILDING_ERA_SPECS: {
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

// Reusable temporaries for zero GC in animation loop
const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _targetDesired = new THREE.Vector3();
const _tmpColor = new THREE.Color();

function formatHex(hexNum: number): string {
  return `#${hexNum.toString(16).padStart(6, '0')}`;
}

function isGreekOrEgyptianGod(unit: UnitKind, civ: PantheonId): boolean {
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

export function HopliteUvBuilderModal({
  isOpen,
  onClose,
  activeMode: _activeMode,
  activeTier,
  onSelectMode: _onSelectMode,
  onSelectTier,
}: HopliteUvBuilderModalProps) {
  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const entityMeshRef = useRef<THREE.Group | null>(null);
  const dioramaHandleRef = useRef<MapDioramaHandle | null>(null);
  const artifactHandleRef = useRef<StudioArtifactHandle | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const camTransitionRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(0, 2, 7),
    target: new THREE.Vector3(0, 1.2, 0),
  });
  const baseDistanceRef = useRef<number>(7);

  // Top-level studio state
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategory>('unit');
  const [lightingMood, setLightingMood] = useState<LightingMood>('studio');
  const [autoRotate3D, setAutoRotate3D] = useState<boolean>(true);
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState<boolean>(true);
  const [specDrawerOpen, setSpecDrawerOpen] = useState<boolean>(true);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [showHumanScale, setShowHumanScale] = useState<boolean>(false);

  // Units & Buildings state
  const [selectedCiv, setSelectedCiv] = useState<PantheonId>('greek');
  const [selectedMajorGod, setSelectedMajorGod] = useState<string>('Zeus');
  const [selectedUnit, setSelectedUnit] = useState<InspectableUnitId>('zeus');
  const [unitFilter, setUnitFilter] = useState<UnitCategoryFilter>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingKind>('town_center');
  const [buildingAge, setBuildingAge] = useState<AgeLevel>(5);
  const [animState, setAnimState] = useState<'idle' | 'move' | 'attack'>('attack');

  // Map & Geography state
  const [selectedMap, setSelectedMap] = useState<MapId>('highland');
  const [mapExpansionFilter, setMapExpansionFilter] = useState<MapExpansionFilter>('all');
  const [mapWireframe, setMapWireframe] = useState<boolean>(false);
  const [mapShowFlora, setMapShowFlora] = useState<boolean>(true);
  const [mapShowFauna, setMapShowFauna] = useState<boolean>(true);
  const [mapSeedTick, setMapSeedTick] = useState<number>(0);
  const [dioramaMetrics, setDioramaMetrics] = useState<{
    minHeight: number;
    maxHeight: number;
    waterCoveragePct: number;
    effectiveBiome: string;
  }>({
    minHeight: 0,
    maxHeight: 0,
    waterCoveragePct: 0,
    effectiveBiome: 'Terras Altas',
  });

  // Fauna state
  const [selectedFauna, setSelectedFauna] = useState<FaunaKind>('deer');
  const [faunaFilter, setFaunaFilter] = useState<FaunaDietFilter>('all');
  const [faunaAnim, setFaunaAnim] = useState<'idle' | 'walk' | 'run'>('walk');

  // Flora & Resources state
  const [selectedFloraId, setSelectedFloraId] = useState<string>('oak');
  const [floraFilter, setFloraFilter] = useState<FloraTypeFilter>('all');
  const [floraVariantSeed, setFloraVariantSeed] = useState<number>(0);
  const [floraWind, setFloraWind] = useState<boolean>(true);

  // Utensils & Relics state
  const [selectedUtensilId, setSelectedUtensilId] = useState<string>('amphora');
  const [utensilFilter, setUtensilFilter] = useState<UtensilCategoryFilter>('all');
  const [selectedRelicId, setSelectedRelicId] = useState<string>('chalice_athena');
  const [relicPantheonFilter, setRelicPantheonFilter] = useState<RelicPantheonFilter>('all');
  const [artifactAuraActive, setArtifactAuraActive] = useState<boolean>(true);

  // God / Hoplite / Myrmidon special states
  const [zeusMode, setZeusMode] = useState<'pairar' | 'voar' | 'raios' | 'tempestade'>('pairar');
  const [poseidonMode, setPoseidonMode] = useState<'conduzido' | 'correnteza' | 'golpe' | 'tsunami'>('conduzido');
  const [hadesMode, setHadesMode] = useState<'reinar' | 'marcha' | 'chama' | 'portal'>('reinar');
  const [artemisMode, setArtemisMode] = useState<'vigilia' | 'cacada' | 'raizes' | 'alcateia'>('vigilia');
  const [hefestoMode, setHefestoMode] = useState<'forja' | 'martelo' | 'automato' | 'erupcao'>('forja');
  const [dionisioMode, setDionisioMode] = useState<'banquete' | 'danca' | 'vinhas' | 'extase'>('banquete');
  const [afroditeMode, setAfroditeMode] = useState<'graca' | 'danca' | 'encanto' | 'mare'>('graca');
  const [apoloMode, setApoloMode] = useState<'pairar' | 'voo' | 'flecha' | 'helio'>('pairar');
  const [aresMode, setAresMode] = useState<'postura' | 'investida' | 'sismico' | 'furia'>('postura');
  const [atenaMode, setAtenaMode] = useState<'guardia' | 'avanco' | 'egide' | 'furia'>('guardia');
  const [hermesMode, setHermesMode] = useState<'flutuar' | 'velocidade' | 'rajada' | 'relampago'>('flutuar');
  const [isisMode, setIsisMode] = useState<'majestade' | 'heka' | 'ankh' | 'sopdet'>('majestade');
  const [setMode, setSetMode] = useState<'senhor' | 'tempestade' | 'deserto' | 'monstro'>('senhor');
  const [raMode, setRaMode] = useState<'gloria' | 'bencao' | 'chuva' | 'ira'>('gloria');
  const [hopliteAction, setHopliteAction] = useState<ZeusHopliteAction>('guarda');
  const [villagerGender, setVillagerGender] = useState<'homem' | 'mulher' | 'ambos'>('ambos');
  const [villagerTask, setVillagerTask] = useState<'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir'>('vigilia');
  const [egyptianLaborerGender, setEgyptianLaborerGender] = useState<'homem' | 'mulher' | 'ambos'>('ambos');
  const [egyptianLaborerTask, setEgyptianLaborerTask] = useState<EgyptianLaborerAction>('vigilia');
  const [atlanteanCitizenMode, setAtlanteanCitizenMode] = useState<'todos' | 'homem' | 'mulher'>('todos');
  const [atlanteanCitizenTask, setAtlanteanCitizenTask] = useState<AtlanteanAction>('vigilia');
  const [atlanteanIsHero, setAtlanteanIsHero] = useState<boolean>(false);
  const [norseWorkerMode, setNorseWorkerMode] = useState<NorseWorkerRole | 'todos'>('todos');
  const [norseWorkerTask, setNorseWorkerTask] = useState<NorseWorkerTask>('vigilia');
  const [fortressAction, setFortressAction] = useState<GreekFortressAction>('guarnicao');
  const [atlanteanFortressAction, setAtlanteanFortressAction] = useState<AtlanteanFortressAction>('guarnicao');
  const [norseFortressAction, setNorseFortressAction] = useState<NorseFortressAction>('guarnicao');
  const [templeAction, setTempleAction] = useState<'favor' | 'milagre'>('favor');
  const [focusDivine, setFocusDivine] = useState<boolean>(false);
  const [myrmidonFury, setMyrmidonFury] = useState<boolean>(true);

  // Zeus Myth Units Studio States
  const [medusaMode, setMedusaMode] = useState<'auto' | 'flechas' | 'vigilia'>('auto');
  const [medusaGazeCooldown, setMedusaGazeCooldown] = useState<number>(0);
  const [colossusTier, setColossusTier] = useState<number>(1);
  const [colossusAction, setColossusAction] = useState<'slam' | 'marcha' | 'eat_tree' | 'vigilia'>('slam');
  const [hydraActionMode, setHydraActionMode] = useState<'combate' | 'vigilia' | 'manual_bite'>('combate');
  const [hydraTargetCount, setHydraTargetCount] = useState<number>(1);
  const [hydraHeads, setHydraHeads] = useState<number>(1);
  const [hydraTotalDamage, setHydraTotalDamage] = useState<number>(0);
  const [hydraTotalHits, setHydraTotalHits] = useState<number>(0);
  const [manticoreMode, setManticoreMode] = useState<'combate' | 'vigilia'>('combate');
  const [manticoreVolleyCooldown, setManticoreVolleyCooldown] = useState<number>(0);
  const [manticoreAutoCast, setManticoreAutoCast] = useState<boolean>(true);
  const [manticoreTargetCount, setManticoreTargetCount] = useState<number>(5);
  const [manticoreFrontline, setManticoreFrontline] = useState<boolean>(true);
  const [manticoreQuillsFired, setManticoreQuillsFired] = useState<number>(0);
  const [manticorePiercingDamage, setManticorePiercingDamage] = useState<number>(0);
  const [cyclopsMode, setCyclopsMode] = useState<'combate' | 'vigilia'>('combate');
  const [cyclopsThrowCooldown, setCyclopsThrowCooldown] = useState<number>(0);
  const [cyclopsAutoCast, setCyclopsAutoCast] = useState<boolean>(true);
  const [cyclopsIsElder, setCyclopsIsElder] = useState<boolean>(false);
  const [cyclopsTotalDamage, setCyclopsTotalDamage] = useState<number>(0);
  const [cyclopsTargetId, setCyclopsTargetId] = useState<number>(1);
  const [cyclopsToast, setCyclopsToast] = useState<string | null>(null);

  // Refs synced without recreating WebGLRenderer
  const cyclopsModeRef = useRef(cyclopsMode);
  cyclopsModeRef.current = cyclopsMode;
  const cyclopsThrowCooldownRef = useRef(cyclopsThrowCooldown);
  cyclopsThrowCooldownRef.current = cyclopsThrowCooldown;
  const cyclopsAutoCastRef = useRef(cyclopsAutoCast);
  cyclopsAutoCastRef.current = cyclopsAutoCast;
  const cyclopsIsElderRef = useRef(cyclopsIsElder);
  cyclopsIsElderRef.current = cyclopsIsElder;
  const cyclopsTargetIdRef = useRef(cyclopsTargetId);
  cyclopsTargetIdRef.current = cyclopsTargetId;
  const manticoreModeRef = useRef(manticoreMode);
  manticoreModeRef.current = manticoreMode;
  const manticoreVolleyCooldownRef = useRef(manticoreVolleyCooldown);
  manticoreVolleyCooldownRef.current = manticoreVolleyCooldown;
  const manticoreAutoCastRef = useRef(manticoreAutoCast);
  manticoreAutoCastRef.current = manticoreAutoCast;
  const manticoreTargetCountRef = useRef(manticoreTargetCount);
  manticoreTargetCountRef.current = manticoreTargetCount;
  const manticoreFrontlineRef = useRef(manticoreFrontline);
  manticoreFrontlineRef.current = manticoreFrontline;
  const medusaModeRef = useRef(medusaMode);
  medusaModeRef.current = medusaMode;
  const medusaGazeCooldownRef = useRef(medusaGazeCooldown);
  medusaGazeCooldownRef.current = medusaGazeCooldown;
  const colossusTierRef = useRef(colossusTier);
  colossusTierRef.current = colossusTier;
  const colossusActionRef = useRef(colossusAction);
  colossusActionRef.current = colossusAction;
  const hydraActionModeRef = useRef(hydraActionMode);
  hydraActionModeRef.current = hydraActionMode;
  const hydraTargetCountRef = useRef(hydraTargetCount);
  hydraTargetCountRef.current = hydraTargetCount;
  const hydraHeadsRef = useRef(hydraHeads);
  hydraHeadsRef.current = hydraHeads;
  const hydraTotalDamageRef = useRef(hydraTotalDamage);
  hydraTotalDamageRef.current = hydraTotalDamage;
  const fortressActionRef = useRef(fortressAction);
  fortressActionRef.current = fortressAction;
  const atlanteanFortressActionRef = useRef(atlanteanFortressAction);
  atlanteanFortressActionRef.current = atlanteanFortressAction;
  const norseFortressActionRef = useRef(norseFortressAction);
  norseFortressActionRef.current = norseFortressAction;
  const templeActionRef = useRef(templeAction);
  templeActionRef.current = templeAction;
  const animStateRef = useRef(animState);
  animStateRef.current = animState;
  const autoRotateRef = useRef(autoRotate3D);
  autoRotateRef.current = autoRotate3D;
  const lightingMoodRef = useRef(lightingMood);
  lightingMoodRef.current = lightingMood;
  const mapWireframeRef = useRef(mapWireframe);
  mapWireframeRef.current = mapWireframe;
  const mapShowFloraRef = useRef(mapShowFlora);
  mapShowFloraRef.current = mapShowFlora;
  const mapShowFaunaRef = useRef(mapShowFauna);
  mapShowFaunaRef.current = mapShowFauna;
  const faunaAnimRef = useRef(faunaAnim);
  faunaAnimRef.current = faunaAnim;
  const floraWindRef = useRef(floraWind);
  floraWindRef.current = floraWind;
  const artifactAuraRef = useRef(artifactAuraActive);
  artifactAuraRef.current = artifactAuraActive;
  const hopliteActionRef = useRef(hopliteAction);
  hopliteActionRef.current = hopliteAction;
  const villagerGenderRef = useRef(villagerGender);
  villagerGenderRef.current = villagerGender;
  const villagerTaskRef = useRef(villagerTask);
  villagerTaskRef.current = villagerTask;
  const egyptianLaborerGenderRef = useRef(egyptianLaborerGender);
  egyptianLaborerGenderRef.current = egyptianLaborerGender;
  const egyptianLaborerTaskRef = useRef(egyptianLaborerTask);
  egyptianLaborerTaskRef.current = egyptianLaborerTask;
  const atlanteanCitizenModeRef = useRef(atlanteanCitizenMode);
  atlanteanCitizenModeRef.current = atlanteanCitizenMode;
  const atlanteanCitizenTaskRef = useRef(atlanteanCitizenTask);
  atlanteanCitizenTaskRef.current = atlanteanCitizenTask;
  const atlanteanIsHeroRef = useRef(atlanteanIsHero);
  atlanteanIsHeroRef.current = atlanteanIsHero;
  const norseWorkerModeRef = useRef(norseWorkerMode);
  norseWorkerModeRef.current = norseWorkerMode;
  const norseWorkerTaskRef = useRef(norseWorkerTask);
  norseWorkerTaskRef.current = norseWorkerTask;
  const myrmidonFuryRef = useRef(myrmidonFury);
  myrmidonFuryRef.current = myrmidonFury;
  const focusDivineRef = useRef(focusDivine);
  focusDivineRef.current = focusDivine;
  const zeusModeRef = useRef(zeusMode);
  zeusModeRef.current = zeusMode;
  const poseidonModeRef = useRef(poseidonMode);
  poseidonModeRef.current = poseidonMode;
  const hadesModeRef = useRef(hadesMode);
  hadesModeRef.current = hadesMode;
  const artemisModeRef = useRef(artemisMode);
  artemisModeRef.current = artemisMode;
  const hefestoModeRef = useRef(hefestoMode);
  hefestoModeRef.current = hefestoMode;
  const dionisioModeRef = useRef(dionisioMode);
  dionisioModeRef.current = dionisioMode;
  const afroditeModeRef = useRef(afroditeMode);
  afroditeModeRef.current = afroditeMode;
  const apoloModeRef = useRef(apoloMode);
  apoloModeRef.current = apoloMode;
  const aresModeRef = useRef(aresMode);
  aresModeRef.current = aresMode;
  const atenaModeRef = useRef(atenaMode);
  atenaModeRef.current = atenaMode;
  const hermesModeRef = useRef(hermesMode);
  hermesModeRef.current = hermesMode;
  const isisModeRef = useRef(isisMode);
  isisModeRef.current = isisMode;
  const setModeRef = useRef(setMode);
  setModeRef.current = setMode;
  const raModeRef = useRef(raMode);
  raModeRef.current = raMode;

  const selectedFloraItem = useMemo(
    () => GALLERY_FLORA_ITEMS.find((f) => f.id === selectedFloraId) || GALLERY_FLORA_ITEMS[0],
    [selectedFloraId]
  );

  const selectedMapCfg = useMemo(() => MAPS[selectedMap], [selectedMap]);
  const selectedFaunaCfg = useMemo(
    () => GALLERY_FAUNA_ITEMS.find((f) => f.kind === selectedFauna) || GALLERY_FAUNA_ITEMS[0],
    [selectedFauna]
  );

  const currentCivUnits = useMemo(
    () => getUnitsForCivAndGod(selectedCiv, selectedMajorGod),
    [selectedCiv, selectedMajorGod]
  );
  const filteredUnits = useMemo(
    () => (unitFilter === 'all' ? currentCivUnits : currentCivUnits.filter((u) => u.category === unitFilter)),
    [currentCivUnits, unitFilter]
  );
  const currentCivBuildings = useMemo(
    () => getBuildingsForCivAndGod(selectedCiv, selectedMajorGod),
    [selectedCiv, selectedMajorGod]
  );
  const filteredMaps = useMemo(
    () =>
      mapExpansionFilter === 'all'
        ? GALLERY_MAP_ITEMS
        : GALLERY_MAP_ITEMS.filter((m) => m.expansion === mapExpansionFilter),
    [mapExpansionFilter]
  );
  const filteredFauna = useMemo(
    () =>
      faunaFilter === 'all'
        ? GALLERY_FAUNA_ITEMS
        : faunaFilter === 'pacific'
        ? GALLERY_FAUNA_ITEMS.filter((f) => !f.retaliates)
        : GALLERY_FAUNA_ITEMS.filter((f) => f.retaliates),
    [faunaFilter]
  );
  const filteredFlora = useMemo(
    () =>
      floraFilter === 'all'
        ? GALLERY_FLORA_ITEMS
        : GALLERY_FLORA_ITEMS.filter((f) => f.category === floraFilter),
    [floraFilter]
  );
  const selectedUtensilCfg = useMemo(
    () => GALLERY_UTENSIL_ITEMS.find((u) => u.id === selectedUtensilId) || GALLERY_UTENSIL_ITEMS[0],
    [selectedUtensilId]
  );
  const filteredUtensils = useMemo(
    () =>
      utensilFilter === 'all'
        ? GALLERY_UTENSIL_ITEMS
        : GALLERY_UTENSIL_ITEMS.filter((u) => u.category === utensilFilter),
    [utensilFilter]
  );
  const selectedRelicCfg = useMemo(
    () => GALLERY_RELIC_ITEMS.find((r) => r.id === selectedRelicId) || GALLERY_RELIC_ITEMS[0],
    [selectedRelicId]
  );
  const filteredRelics = useMemo(
    () =>
      relicPantheonFilter === 'all'
        ? GALLERY_RELIC_ITEMS
        : GALLERY_RELIC_ITEMS.filter((r) => r.pantheon === relicPantheonFilter),
    [relicPantheonFilter]
  );

  // Compute canonical studio framing for current subject
  const getFramingForSubject = (focusHead: boolean): { target: [number, number, number]; offset: [number, number, number]; baseDist: number } => {
    if (galleryCategory === 'map') {
      return {
        target: [0, 0.25, 0],
        offset: [9.4, 8.6, 9.4],
        baseDist: 15.6,
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
        selectedFloraItem.category === 'tree' ||
        selectedFloraItem.resourceKind === 'plenty_vault' ||
        selectedFloraItem.resourceKind === 'settlement';
      const dist = isLargeLandmark ? 6.8 : 4.2;
      const ty = selectedFloraItem.category === 'tree' ? 1.75 : 0.85;
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
  };

  const triggerCameraPreset = (preset: CameraPreset) => {
    const framing = getFramingForSubject(focusDivine);
    const d = framing.baseDist;
    const [tx, ty, tz] = framing.target;
    let ox = framing.offset[0];
    let oy = framing.offset[1];
    let oz = framing.offset[2];

    if (preset === 'front') {
      ox = 0;
      oy = d * 0.14;
      oz = d;
    } else if (preset === 'side') {
      ox = d;
      oy = d * 0.18;
      oz = 0;
    } else if (preset === 'top') {
      ox = 0.02;
      oy = d * 1.15;
      oz = 0.02;
    }

    camTransitionRef.current.target.set(tx, ty, tz);
    camTransitionRef.current.pos.set(tx + ox, ty + oy, tz + oz);
    camTransitionRef.current.active = true;
  };

  const adjustZoom = (factor: number) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    camTransitionRef.current.active = false;
    _v3A.copy(cam.position).sub(ctrl.target);
    const currentLen = Math.max(0.5, _v3A.length());
    const nextLen = THREE.MathUtils.clamp(currentLen * factor, ctrl.minDistance, ctrl.maxDistance);
    _v3A.setLength(nextLen);
    cam.position.copy(ctrl.target).add(_v3A);
    ctrl.update();
    const pct = Math.round((baseDistanceRef.current / nextLen) * 100);
    setZoomPercent(THREE.MathUtils.clamp(pct, 30, 350));
  };

  // Keyboard shortcuts: Esc closes, H toggles Cinema Mode
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'h' || e.key === 'H') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        setCinemaMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Smoothly update camera focus when toggling focusDivine on Gods or Temples
  useEffect(() => {
    if (!isOpen) return;
    const isTemple = galleryCategory === 'building' && selectedBuilding === 'temple';
    const isGod = galleryCategory === 'unit' && isGreekOrEgyptianGod(selectedUnit, selectedCiv);
    if (!isTemple && !isGod) return;
    const framing = getFramingForSubject(focusDivine);
    const ctrl = controlsRef.current;
    const cam = cameraRef.current;
    if (!ctrl || !cam) return;

    _v3A.copy(cam.position).sub(ctrl.target);
    if (_v3A.lengthSq() < 0.01) {
      _v3A.set(0, 0.2, 1);
    }
    _v3A.normalize().multiplyScalar(framing.baseDist);
    camTransitionRef.current.target.set(framing.target[0], framing.target[1], framing.target[2]);
    camTransitionRef.current.pos.copy(camTransitionRef.current.target).add(_v3A);
    camTransitionRef.current.active = true;
    baseDistanceRef.current = framing.baseDist;
  }, [focusDivine, isOpen]);

  // Keep Myrmidon fury synced immediately
  useEffect(() => {
    if (galleryCategory === 'unit' && selectedUnit === 'myrmidon' && entityMeshRef.current) {
      entityMeshRef.current.userData.setCombatFury?.(myrmidonFury ? 1.0 : 0.0);
    }
  }, [myrmidonFury, galleryCategory, selectedUnit, activeTier]);

  // Keep Map diorama layers synced immediately without rebuilding terrain
  useEffect(() => {
    const h = dioramaHandleRef.current;
    if (!h) return;
    h.wireframeMesh.visible = mapWireframe;
    h.floraGroup.visible = mapShowFlora;
    h.faunaGroup.visible = mapShowFauna;
  }, [mapWireframe, mapShowFlora, mapShowFauna]);

  const handleSelectCiv = (civ: PantheonId) => {
    setSelectedCiv(civ);
    const godList = MAJOR_GODS_BY_CIV[civ] || MAJOR_GODS_BY_CIV.greek!;
    const firstGod = godList[0].id;
    setSelectedMajorGod(firstGod);
    const validUnits = getUnitsForCivAndGod(civ, firstGod);
    setSelectedUnit(validUnits[0].id);
    setFocusDivine(false);
  };

  const handleSelectMajorGod = (godId: string) => {
    setSelectedMajorGod(godId);
    if (selectedCiv === 'greek') {
      if (godId.toLowerCase() === 'zeus') setSelectedUnit('zeus');
      else if (godId.toLowerCase() === 'poseidon') setSelectedUnit('poseidon');
      else if (godId.toLowerCase() === 'hades') setSelectedUnit('hades');
    } else if (selectedCiv === 'egyptian') {
      if (godId.toLowerCase() === 'rá' || godId.toLowerCase() === 'ra') setSelectedUnit('ra');
      else if (godId.toLowerCase() === 'ísis' || godId.toLowerCase() === 'isis') setSelectedUnit('isis');
      else if (godId.toLowerCase() === 'set') setSelectedUnit('set');
    }
    setFocusDivine(false);
  };

  useEffect(() => {
    setFocusDivine(false);
  }, [galleryCategory, selectedUnit, selectedBuilding, selectedCiv, selectedMajorGod]);

  // ==========================================
  // CORE 3D ENGINE (OrbitControls + PMREM + All 5 Categories)
  // ==========================================
  useEffect(() => {
    if (!isOpen || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    const defaultBg = new THREE.Color(0x0b0e14);
    scene.background = defaultBg.clone();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 160);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = LIGHTING_PRESETS[lightingMoodRef.current].exposure;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Procedural PBR studio reflection environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // OrbitControls with smooth damping & horizon lock
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.enablePan = true;
    controls.screenSpacePanning = false;
    controls.minPolarAngle = 0.06;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minDistance = 1.4;
    controls.maxDistance = 32;
    controls.autoRotate = !isSoftwareGl && autoRotateRef.current;
    controls.autoRotateSpeed = 1.35;
    controlsRef.current = controls;

    const onControlStart = () => {
      camTransitionRef.current.active = false;
    };
    let lastZoomUiSync = 0;
    const onControlChange = () => {
      const now = performance.now();
      if (now - lastZoomUiSync < 90) return;
      lastZoomUiSync = now;
      const dist = camera.position.distanceTo(controls.target);
      if (dist > 0.05) {
        const pct = Math.round((baseDistanceRef.current / dist) * 100);
        setZoomPercent(THREE.MathUtils.clamp(pct, 30, 350));
      }
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    // ResizeObserver so collapsible drawers or window resizing stays crisp
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(1, Math.floor(entry.contentRect.width));
      const h = Math.max(1, Math.floor(entry.contentRect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 3-Point Studio Lighting Rig
    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 1.25);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff3da, 2.1);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -9;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.95);
    rimLight.position.set(-5, 3.5, -4);
    scene.add(rimLight);

    // God special FX point lights
    const flashLight = new THREE.PointLight(0xfff3c4, 0, 16);
    scene.add(flashLight);

    const impactLight = new THREE.PointLight(0x2dd4bf, 0, 16);
    scene.add(impactLight);

    const bidentLight = new THREE.PointLight(0x10b981, 0, 10);
    scene.add(bidentLight);

    const hadesBlastLight = new THREE.PointLight(0x34d399, 0, 15);
    scene.add(hadesBlastLight);

    const environmentGroup = new THREE.Group();
    scene.add(environmentGroup);

    const localDisposables: Array<{ dispose: () => void }> = [];

    // ==========================================
    // SISTEMA DE FAÍSCAS (ZEUS)
    // ==========================================
    const SPARK_N = 220;
    const sparkPos = new Float32Array(SPARK_N * 3).fill(-100);
    const sparkVel = new Float32Array(SPARK_N * 3);
    const sparkLife = new Float32Array(SPARK_N);
    let sparkIdx = 0;
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xfff3a0,
      size: 0.09,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    function spawnSpark(p: THREE.Vector3) {
      const i = sparkIdx;
      sparkIdx = (sparkIdx + 1) % SPARK_N;
      sparkPos[i * 3] = p.x;
      sparkPos[i * 3 + 1] = 0.1;
      sparkPos[i * 3 + 2] = p.z;
      sparkVel[i * 3] = (Math.random() - 0.5) * 3.4;
      sparkVel[i * 3 + 1] = Math.random() * 3.2 + 1.2;
      sparkVel[i * 3 + 2] = (Math.random() - 0.5) * 3.4;
      sparkLife[i] = 0.5 + Math.random() * 0.4;
    }

    // ==========================================
    // SISTEMA DE BORRIFOS D'ÁGUA (POSEIDON)
    // ==========================================
    const SPRAY_N = 260;
    const sprayPos = new Float32Array(SPRAY_N * 3).fill(-100);
    const sprayVel = new Float32Array(SPRAY_N * 3);
    const sprayLife = new Float32Array(SPRAY_N);
    let sprayIdx = 0;
    const sprayGeo = new THREE.BufferGeometry();
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    const sprayMat = new THREE.PointsMaterial({
      color: 0xccfbf1,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprayPoints = new THREE.Points(sprayGeo, sprayMat);
    scene.add(sprayPoints);

    function spawnSpray(originX: number, originY: number, originZ: number, spreadH: number, vMin: number, vSpread: number) {
      const i = sprayIdx;
      sprayIdx = (sprayIdx + 1) % SPRAY_N;
      sprayPos[i * 3] = originX + (Math.random() - 0.5) * 0.3;
      sprayPos[i * 3 + 1] = originY;
      sprayPos[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.3;
      sprayVel[i * 3] = (Math.random() - 0.5) * spreadH;
      sprayVel[i * 3 + 1] = vMin + Math.random() * vSpread;
      sprayVel[i * 3 + 2] = (Math.random() - 0.5) * spreadH;
      sprayLife[i] = 0.6 + Math.random() * 0.4;
    }

    const bolts: Array<{ meshes: THREE.Mesh[]; life: number; max: number }> = [];
    const shockwaves: Array<{ mesh: THREE.Mesh; life: number; max: number; delay: number }> = [];
    const geysers: Array<{ mesh: THREE.Mesh; gx: number; gz: number; life: number; max: number; delay: number; erupted: boolean }> = [];

    // Tsunami 3D Mesh
    const tsunamiGroup = new THREE.Group();
    tsunamiGroup.visible = false;
    scene.add(tsunamiGroup);

    const tsuWidth = 14.0;
    const tsuGeo = new THREE.PlaneGeometry(tsuWidth, 4.2, 48, 24);
    const tsuAttr = tsuGeo.attributes.position;
    for (let i = 0; i < tsuAttr.count; i++) {
      const y = tsuAttr.getY(i);
      const ny = (y + 2.1) / 4.2;
      const curl = Math.pow(ny, 2.2) * 2.2;
      tsuAttr.setZ(i, tsuAttr.getZ(i) - curl);
    }
    tsuGeo.computeVertexNormals();
    const tsuMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.18,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const tsuWall = new THREE.Mesh(tsuGeo, tsuMat);
    tsuWall.position.y = 2.0;
    tsunamiGroup.add(tsuWall);

    const crestPuffs: Array<{ mesh: THREE.Mesh; baseX: number; baseY: number; phase: number }> = [];
    const puffGeo = new THREE.SphereGeometry(0.36, 8, 8);
    const puffMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdfa,
      emissive: new THREE.Color(0x5eead4),
      emissiveIntensity: 0.45,
      roughness: 0.5,
    });
    for (let c = 0; c < 22; c++) {
      const bx = (c / 21 - 0.5) * (tsuWidth - 0.4);
      const puff = new THREE.Mesh(puffGeo, puffMat);
      puff.position.set(bx, 4.0, -2.1);
      tsunamiGroup.add(puff);
      crestPuffs.push({ mesh: puff, baseX: bx, baseY: 4.0, phase: c * 0.4 });
    }
    let tsunamiZ = -12.0;

    function triggerZeusBolt(from: THREE.Vector3, to: THREE.Vector3) {
      const pts = [from.clone()];
      const len = from.distanceTo(to);
      const n = Math.max(5, Math.round(len * 3.2));
      for (let i = 1; i < n; i++) {
        const p = from.clone().lerp(to, i / n);
        const j = len * 0.05;
        p.x += (Math.random() - 0.5) * j;
        p.y += (Math.random() - 0.5) * j;
        p.z += (Math.random() - 0.5) * j;
        pts.push(p);
      }
      pts.push(to.clone());
      const curve = new THREE.CatmullRomCurve3(pts);

      const core = new THREE.Mesh(
        new THREE.TubeGeometry(curve, n * 5, 0.024, 6, false),
        new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      const glow = new THREE.Mesh(
        new THREE.TubeGeometry(curve, n * 5, 0.08, 6, false),
        new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      const electric = new THREE.Mesh(
        new THREE.TubeGeometry(curve, n * 5, 0.14, 6, false),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
      );

      scene.add(core, glow, electric);
      bolts.push({ meshes: [core, glow, electric], life: 0.4, max: 0.4 });

      flashLight.position.set(to.x, 0.8, to.z);
      flashLight.intensity = 10.0;
      for (let s = 0; s < 16; s++) spawnSpark(to);
    }

    function triggerPoseidonSlam(originX: number, originZ: number) {
      for (let k = 0; k < 3; k++) {
        const sw = new THREE.Mesh(
          new THREE.RingGeometry(0.3, 0.65, 32),
          new THREE.MeshBasicMaterial({
            color: 0x2dd4bf,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        sw.rotation.x = -Math.PI / 2;
        sw.position.set(originX, 0.12 + k * 0.03, originZ);
        scene.add(sw);
        shockwaves.push({ mesh: sw, life: 1.1, max: 1.1, delay: k * 0.12 });
      }

      for (let g = 0; g < 5; g++) {
        const dist = 1.3 + g * 1.0;
        const ang = (g - 2) * 0.22;
        const gx = originX + Math.sin(ang) * dist;
        const gz = originZ + Math.cos(ang) * dist;
        const gCol = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.45, 3.2, 16),
          new THREE.MeshStandardMaterial({
            color: 0x0ea5e9,
            emissive: new THREE.Color(0x2dd4bf),
            emissiveIntensity: 0.55,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
          })
        );
        gCol.position.set(gx, 0.1, gz);
        gCol.scale.set(1, 0.01, 1);
        scene.add(gCol);
        geysers.push({ mesh: gCol, gx, gz, life: 1.1, max: 1.1, delay: g * 0.09, erupted: false });
      }

      impactLight.position.set(originX, 1.2, originZ);
      impactLight.intensity = 8.5;
      for (let i = 0; i < 30; i++) spawnSpray(originX, 0.2, originZ, 4.5, 2.0, 5.0);
    }

    // ==========================================
    // SISTEMAS DE PODERES DE HADES
    // ==========================================
    let hadesEnv: HadesUnderworldEnvironment | null = null;
    let hadesBidentAnchor: THREE.Group | null = null;

    const ASH_N = 200;
    const ashPos = new Float32Array(ASH_N * 3);
    const ashVel = new Float32Array(ASH_N * 3);
    const ashLife = new Float32Array(ASH_N);
    let ashIdx = 0;
    for (let i = 0; i < ASH_N; i++) {
      ashPos[i * 3] = (Math.random() - 0.5) * 13;
      ashPos[i * 3 + 1] = Math.random() * 5.2;
      ashPos[i * 3 + 2] = (Math.random() - 0.5) * 13;
      ashVel[i * 3] = (Math.random() - 0.5) * 0.25;
      ashVel[i * 3 + 1] = 0.22 + Math.random() * 0.45;
      ashVel[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      ashLife[i] = 999;
    }
    const ashGeo = new THREE.BufferGeometry();
    ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPos, 3));
    const ashMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ashPoints = new THREE.Points(ashGeo, ashMat);
    ashPoints.visible = false;
    scene.add(ashPoints);

    function spawnSoulBurst(x: number, y: number, z: number, count = 16) {
      for (let c = 0; c < count; c++) {
        const i = ashIdx;
        ashIdx = (ashIdx + 1) % 70;
        ashPos[i * 3] = x;
        ashPos[i * 3 + 1] = y;
        ashPos[i * 3 + 2] = z;
        ashVel[i * 3] = (Math.random() - 0.5) * 4.0;
        ashVel[i * 3 + 1] = 1.3 + Math.random() * 3.8;
        ashVel[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
        ashLife[i] = 0.75 + Math.random() * 0.5;
      }
    }

    const tartarusBolts: Array<{
      mesh: THREE.Group;
      start: THREE.Vector3;
      target: THREE.Vector3;
      progress: number;
      speed: number;
    }> = [];
    const hellfirePools: Array<{
      pool: THREE.Mesh;
      pillar: THREE.Mesh;
      life: number;
      max: number;
    }> = [];
    const hadesShadowTrails: Array<{
      mesh: THREE.Mesh;
      life: number;
      max: number;
    }> = [];

    const tartarusCoreGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const tartarusCoreMat = new THREE.MeshBasicMaterial({ color: 0xa7f3d0 });
    const tartarusAuraGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const tartarusAuraMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    function triggerTartarusFlame(startPos: THREE.Vector3) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 2.8;
      const target = new THREE.Vector3(Math.cos(a) * r, 0.08, Math.sin(a) * r);

      const boltGroup = new THREE.Group();
      boltGroup.position.copy(startPos);
      boltGroup.add(new THREE.Mesh(tartarusCoreGeo, tartarusCoreMat));
      boltGroup.add(new THREE.Mesh(tartarusAuraGeo, tartarusAuraMat));
      scene.add(boltGroup);

      tartarusBolts.push({
        mesh: boltGroup,
        start: startPos.clone(),
        target,
        progress: 0,
        speed: 2.4,
      });
    }

    function eruptHellfire(pos: THREE.Vector3) {
      const pool = new THREE.Mesh(
        new THREE.CircleGeometry(0.72, 24),
        new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(pos.x, 0.04, pos.z);
      scene.add(pool);

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.45, 2.2, 14, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.78,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      pillar.position.set(pos.x, 1.1, pos.z);
      scene.add(pillar);

      hellfirePools.push({ pool, pillar, life: 0.75, max: 0.75 });
      hadesBlastLight.position.set(pos.x, 0.9, pos.z);
      hadesBlastLight.intensity = 8.5;
      spawnSoulBurst(pos.x, 0.2, pos.z, 20);
    }

    function spawnShadowTrail(x: number, z: number) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.82, 24),
        new THREE.MeshBasicMaterial({
          color: 0x581c87,
          transparent: true,
          opacity: 0.62,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.04, z);
      scene.add(ring);
      hadesShadowTrails.push({ mesh: ring, life: 1.0, max: 1.0 });
    }

    const portalGroup = new THREE.Group();
    portalGroup.visible = false;
    scene.add(portalGroup);

    const portalDiscGeo = new THREE.RingGeometry(0.25, 3.5, 64);
    const portalDiscMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const portalDisc = new THREE.Mesh(portalDiscGeo, portalDiscMat);
    portalDisc.rotation.x = -Math.PI / 2;
    portalDisc.position.y = 0.025;
    portalGroup.add(portalDisc);

    const portalInnerGeo = new THREE.RingGeometry(1.4, 2.2, 48);
    const portalInnerMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const portalInnerRing = new THREE.Mesh(portalInnerGeo, portalInnerMat);
    portalInnerRing.rotation.x = -Math.PI / 2;
    portalInnerRing.position.y = 0.03;
    portalGroup.add(portalInnerRing);

    const hadesWraiths: Array<{
      group: THREE.Group;
      radius: number;
      speed: number;
      phase: number;
      vSpeed: number;
      baseHeight: number;
    }> = [];
    const wraithSkullGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const wraithTailGeo = new THREE.ConeGeometry(0.14, 0.7, 10);
    wraithTailGeo.rotateX(Math.PI);
    const wraithMatA = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wraithMatB = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    for (let i = 0; i < 10; i++) {
      const wg = new THREE.Group();
      const wMat = i % 2 === 0 ? wraithMatA : wraithMatB;
      const headM = new THREE.Mesh(wraithSkullGeo, wMat);
      const tailM = new THREE.Mesh(wraithTailGeo, wMat);
      tailM.position.y = -0.32;
      wg.add(headM, tailM);
      portalGroup.add(wg);
      hadesWraiths.push({
        group: wg,
        radius: 0.8 + Math.random() * 2.2,
        speed: (0.4 + Math.random() * 0.7) * (i % 2 === 0 ? 1 : -1),
        phase: (i / 10) * Math.PI * 2,
        vSpeed: 0.8 + Math.random() * 1.2,
        baseHeight: Math.random() * 3.5,
      });
    }

    let zeusClouds: Array<{ g: THREE.Group; baseY: number; ph: number }> = [];
    let poseidonOceanPos: THREE.BufferAttribute | null = null;
    let poseidonOceanInitY: Float32Array | null = null;

    const marbleTex = createMarbleTexture(1);
    const shadowTex = createContactShadowTexture();
    const ringPlayerTex = createSelectionRingTexture('#38bdf8');
    const ringEnemyTex = createSelectionRingTexture('#ef4444');
    const pal = createMaterialPalette(marbleTex, shadowTex, ringPlayerTex, ringEnemyTex, 0x2563eb);

    const addPedestal = (radiusTop: number, radiusBottom: number, ringColor: number) => {
      const pedGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, 0.22, 44);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x131924,
        roughness: 0.52,
        metalness: 0.38,
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = -0.11;
      pedestal.receiveShadow = true;
      environmentGroup.add(pedestal);

      const ringGeo = new THREE.RingGeometry(radiusTop - 0.16, radiusTop - 0.06, 44);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.012;
      environmentGroup.add(ring);

      localDisposables.push(pedGeo, pedMat, ringGeo, ringMat);
    };

    // Build subject + environment
    const buildCurrentEntity = () => {
      if (entityMeshRef.current) {
        scene.remove(entityMeshRef.current);
        entityMeshRef.current = null;
      }
      if (dioramaHandleRef.current) {
        scene.remove(dioramaHandleRef.current.group);
        dioramaHandleRef.current.dispose();
        dioramaHandleRef.current = null;
      }
      if (artifactHandleRef.current) {
        scene.remove(artifactHandleRef.current.group);
        artifactHandleRef.current.dispose();
        artifactHandleRef.current = null;
      }
      while (environmentGroup.children.length > 0) {
        environmentGroup.remove(environmentGroup.children[0]);
      }
      zeusClouds = [];
      poseidonOceanPos = null;
      poseidonOceanInitY = null;
      tsunamiGroup.visible = false;
      hadesEnv = null;
      hadesBidentAnchor = null;
      ashPoints.visible = false;
      portalGroup.visible = false;
      bidentLight.intensity = 0;
      hadesBlastLight.intensity = 0;

      let group: THREE.Group;

      if (galleryCategory === 'map') {
        const mapCfg = getEffectiveMapConfig(selectedMap);
        const skyBg = new THREE.Color(mapCfg.skyColorHex).multiplyScalar(0.16);
        scene.background = skyBg;
        scene.fog = new THREE.FogExp2(skyBg.getHex(), 0.014);

        const handle = buildMapDiorama(selectedMap, pal, {
          showFlora: mapShowFloraRef.current,
          showFauna: mapShowFaunaRef.current,
          showWireframe: mapWireframeRef.current,
        });
        dioramaHandleRef.current = handle;
        group = handle.group;
        setDioramaMetrics({
          minHeight: Number(handle.minHeight.toFixed(2)),
          maxHeight: Number(handle.maxHeight.toFixed(2)),
          waterCoveragePct: handle.waterCoveragePct,
          effectiveBiome: mapCfg.biomeLabel,
        });
      } else if (galleryCategory === 'fauna') {
        scene.background = new THREE.Color(0x0b1019);
        scene.fog = new THREE.FogExp2(0x0b1019, 0.018);
        addPedestal(1.85, 2.05, selectedFaunaCfg.retaliates ? 0xf97316 : 0x34d399);

        group = createFaunaMesh(selectedFauna, pal, !isSoftwareGl);
        const large =
          selectedFauna === 'elephant_wild' ||
          selectedFauna === 'hippo' ||
          selectedFauna === 'camel' ||
          selectedFauna === 'aurochs' ||
          selectedFauna === 'musk_ox';
        group.scale.setScalar(large ? 1.1 : 1.25);

        if (showHumanScale) {
          const refVillager = createUnitMesh('villager', 'player', pal, !isSoftwareGl, selectedCiv, selectedMajorGod);
          refVillager.position.set(-1.32, 0, 0.35);
          refVillager.rotation.y = 0.4;
          environmentGroup.add(refVillager);
        }
      } else if (galleryCategory === 'flora') {
        const mapPreview = MAPS[selectedFloraItem.previewMapId] || MAPS.mediterranean;
        const floraBg = new THREE.Color(mapPreview.skyColorHex).multiplyScalar(0.14);
        scene.background = floraBg;
        scene.fog = new THREE.FogExp2(floraBg.getHex(), 0.016);
        addPedestal(
          selectedFloraItem.category === 'tree' || selectedFloraItem.resourceKind === 'settlement' ? 2.4 : 1.8,
          selectedFloraItem.category === 'tree' || selectedFloraItem.resourceKind === 'settlement' ? 2.65 : 2.0,
          selectedFloraItem.category === 'tree' ? 0x22c55e : 0xfacc15
        );

        group = buildFloraOrResourceStudioMesh(selectedFloraItem, pal, floraVariantSeed);
        if (showHumanScale) {
          const refVillager = createUnitMesh('villager', 'player', pal, !isSoftwareGl, selectedCiv, selectedMajorGod);
          refVillager.position.set(-1.75, 0, 0.7);
          refVillager.rotation.y = 0.45;
          environmentGroup.add(refVillager);
        }
      } else if (galleryCategory === 'utensil') {
        scene.background = new THREE.Color(0x0d1017);
        scene.fog = new THREE.FogExp2(0x0d1017, 0.018);
        addPedestal(1.85, 2.05, selectedUtensilCfg.accentHex);

        const handle = buildUtensilMesh(selectedUtensilId, pal, !isSoftwareGl);
        artifactHandleRef.current = handle;
        group = handle.group;

        if (showHumanScale) {
          const refVillager = createUnitMesh('villager', 'player', pal, !isSoftwareGl, selectedCiv, selectedMajorGod);
          refVillager.position.set(-1.45, 0, 0.45);
          refVillager.rotation.y = 0.4;
          environmentGroup.add(refVillager);
        }
      } else if (galleryCategory === 'relic') {
        const relicBg = new THREE.Color(selectedRelicCfg.auraHex).multiplyScalar(0.11);
        scene.background = relicBg;
        scene.fog = new THREE.FogExp2(relicBg.getHex(), 0.02);
        addPedestal(1.9, 2.15, selectedRelicCfg.auraHex);

        const handle = buildRelicArtifactMesh(selectedRelicId, pal, !isSoftwareGl);
        artifactHandleRef.current = handle;
        group = handle.group;

        if (showHumanScale) {
          const refVillager = createUnitMesh('villager', 'player', pal, !isSoftwareGl, selectedCiv, selectedMajorGod);
          refVillager.position.set(-1.5, 0, 0.45);
          refVillager.rotation.y = 0.42;
          environmentGroup.add(refVillager);
        }
      } else if (galleryCategory === 'building') {
        if (selectedCiv === 'greek' && selectedBuilding === 'fortress') {
          const godKey = (
            selectedMajorGod.toLowerCase() === 'poseidon'
              ? 'poseidon'
              : selectedMajorGod.toLowerCase() === 'hades'
              ? 'hades'
              : 'zeus'
          ) as 'zeus' | 'poseidon' | 'hades';
          const theme = GREEK_FORTRESS_THEMES[godKey] || GREEK_FORTRESS_THEMES.zeus;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.016);
          addPedestal(3.2, 3.5, theme.goldColor);

          const effTier = buildingAge >= 4 ? 4 : 3;
          const fortress = buildGreekFortressStudio(godKey, effTier, !isSoftwareGl);
          group = fortress.root;

          const arrowGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.75, 6);
          arrowGeo.rotateX(Math.PI / 2);
          const arrowMat = new THREE.MeshBasicMaterial({ color: theme.arrowHex });
          const activeArrows: Array<{ mesh: THREE.Mesh; start: THREE.Vector3; target: THREE.Vector3; progress: number; speed: number }> = [];

          let volleyTimer = 0;
          function spawnVolley(isT4: boolean) {
            const count = isT4 ? 8 : 5;
            const originY = isT4 ? 4.4 : 3.2;
            for (let i = 0; i < count; i++) {
              const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
              const dist = 4.6 + Math.random() * 2.8;
              const start = new THREE.Vector3(Math.cos(a) * 1.4, originY, Math.sin(a) * 1.4);
              const target = new THREE.Vector3(Math.cos(a) * dist, 0.05, Math.sin(a) * dist);

              const mesh = new THREE.Mesh(arrowGeo, arrowMat);
              mesh.position.copy(start);
              environmentGroup.add(mesh);

              activeArrows.push({ mesh, start, target, progress: 0, speed: 1.45 + Math.random() * 0.35 });
            }
          }

          let lastTierApplied = effTier;

          group.userData.animatePose = (dt: number) => {
            const act = fortressActionRef.current;
            const currentT = buildingAge >= 4 ? 4 : 3;
            if (currentT !== lastTierApplied) {
              lastTierApplied = currentT;
              fortress.setTier(currentT);
            }

            if (fortress.apexCrystal) {
              fortress.apexCrystal.rotation.y += dt * 1.4;
              fortress.apexCrystal.position.y = 3.22 + Math.sin(simTime * 2.6) * 0.06;
            }

            // Aura Divina
            const targetAura = act === 'bencao' ? 0.78 : (currentT === 4 ? 0.25 : 0.0);
            const ringMat = fortress.divineRing.material as THREE.MeshBasicMaterial;
            ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetAura, 4, dt);
            fortress.divineRing.rotation.z += dt * 0.4;
            fortress.divineRing.scale.setScalar(1 + Math.sin(simTime * 3.5) * 0.04);

            // Disparo de flechas
            if (act === 'defesa') {
              volleyTimer -= dt;
              if (volleyTimer <= 0) {
                volleyTimer = 0.75;
                spawnVolley(currentT === 4);
              }
            }

            for (let i = activeArrows.length - 1; i >= 0; i--) {
              const ar = activeArrows[i];
              ar.progress += dt * ar.speed;
              const p = Math.min(1, ar.progress);
              const pos = new THREE.Vector3().lerpVectors(ar.start, ar.target, p);
              pos.y += Math.sin(p * Math.PI) * 1.35;
              ar.mesh.position.copy(pos);

              const nextP = Math.min(1, p + 0.04);
              const nextPos = new THREE.Vector3().lerpVectors(ar.start, ar.target, nextP);
              nextPos.y += Math.sin(nextP * Math.PI) * 1.35;
              ar.mesh.lookAt(nextPos);

              if (p >= 1) {
                environmentGroup.remove(ar.mesh);
                ar.mesh.geometry.dispose();
                activeArrows.splice(i, 1);
              }
            }
          };
        } else if (selectedCiv === 'atlantean' && selectedBuilding === 'fortress') {
          const rawGod = selectedMajorGod.toLowerCase();
          const godKey = (
            rawGod.includes('oranos') || rawGod.includes('urano')
              ? 'oranos'
              : rawGod.includes('gaia')
              ? 'gaia'
              : 'kronos'
          ) as 'kronos' | 'oranos' | 'gaia';
          const theme = ATLANTEAN_FORTRESS_THEMES[godKey] || ATLANTEAN_FORTRESS_THEMES.kronos;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.016);
          addPedestal(3.4, 3.7, theme.orichalcum);

          const effTier = buildingAge >= 4 ? 4 : 3;
          const fortress = buildAtlanteanFortressStudio(godKey, effTier, !isSoftwareGl);
          group = fortress.root;

          const boltGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.85, 6);
          boltGeo.rotateX(Math.PI / 2);
          const boltMat = new THREE.MeshBasicMaterial({ color: theme.boltHex });
          const activeBolts: Array<{ mesh: THREE.Mesh; start: THREE.Vector3; target: THREE.Vector3; progress: number; speed: number }> = [];

          let boltTimer = 0;
          function spawnAtlanteanVolley(isT4: boolean) {
            const count = isT4 ? 8 : 6;
            const originY = isT4 ? 3.4 : 3.2;
            for (let i = 0; i < count; i++) {
              const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
              const dist = 4.6 + Math.random() * 2.8;
              const start = new THREE.Vector3(Math.cos(a) * 1.4, originY, Math.sin(a) * 1.4);
              const target = new THREE.Vector3(Math.cos(a) * dist, 0.05, Math.sin(a) * dist);

              const mesh = new THREE.Mesh(boltGeo, boltMat);
              mesh.position.copy(start);
              environmentGroup.add(mesh);

              activeBolts.push({ mesh, start, target, progress: 0, speed: 1.55 + Math.random() * 0.35 });
            }
          }

          let lastTierApplied = effTier;

          group.userData.animatePose = (dt: number) => {
            const act = atlanteanFortressActionRef.current;
            const currentT = buildingAge >= 4 ? 4 : 3;
            if (currentT !== lastTierApplied) {
              lastTierApplied = currentT;
              fortress.setTier(currentT);
            }

            if (fortress.coreCrystal) {
              fortress.coreCrystal.rotation.y += dt * 1.6;
              fortress.coreCrystal.position.y = 3.15 + Math.sin(simTime * 2.6) * 0.08;
            }

            // Aura de Atlântida
            const targetAura = act === 'bencao' ? 0.78 : (currentT === 4 ? 0.25 : 0.0);
            const ringMat = fortress.divineRing.material as THREE.MeshBasicMaterial;
            ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetAura, 4, dt);
            fortress.divineRing.rotation.z += dt * 0.4;
            fortress.divineRing.scale.setScalar(1 + Math.sin(simTime * 3.5) * 0.04);

            // Rajada de Oricalco
            if (act === 'defesa') {
              boltTimer -= dt;
              if (boltTimer <= 0) {
                boltTimer = 0.72;
                spawnAtlanteanVolley(currentT === 4);
              }
            }

            for (let i = activeBolts.length - 1; i >= 0; i--) {
              const b = activeBolts[i];
              b.progress += dt * b.speed;
              const p = Math.min(1, b.progress);
              const pos = new THREE.Vector3().lerpVectors(b.start, b.target, p);
              pos.y += Math.sin(p * Math.PI) * 1.25;
              b.mesh.position.copy(pos);

              const nextP = Math.min(1, p + 0.04);
              const nextPos = new THREE.Vector3().lerpVectors(b.start, b.target, nextP);
              nextPos.y += Math.sin(nextP * Math.PI) * 1.25;
              b.mesh.lookAt(nextPos);

              if (p >= 1) {
                environmentGroup.remove(b.mesh);
                b.mesh.geometry.dispose();
                activeBolts.splice(i, 1);
              }
            }
          };
        } else if (selectedCiv === 'norse' && selectedBuilding === 'fortress') {
          const rawGod = selectedMajorGod.toLowerCase();
          const godKey = (
            rawGod.includes('thor')
              ? 'thor'
              : rawGod.includes('loki')
              ? 'loki'
              : rawGod.includes('freyr')
              ? 'freyr'
              : 'odin'
          ) as 'odin' | 'thor' | 'loki' | 'freyr';
          const theme = NORSE_FORTRESS_THEMES[godKey] || NORSE_FORTRESS_THEMES.odin;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.016);
          addPedestal(3.4, 3.7, theme.goldColor);

          const effTier = buildingAge >= 4 ? 4 : 3;
          const fortress = buildNorseFortressStudio(godKey, effTier, !isSoftwareGl);
          group = fortress.root;

          const spearGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.88, 6);
          spearGeo.rotateX(Math.PI / 2);
          const spearMat = new THREE.MeshBasicMaterial({ color: theme.spearHex });
          const activeSpears: Array<{ mesh: THREE.Mesh; start: THREE.Vector3; target: THREE.Vector3; progress: number; speed: number }> = [];

          let volleyTimer = 0;
          function spawnNorseVolley(isT4: boolean) {
            const count = isT4 ? 8 : 5;
            const originY = isT4 ? 3.8 : 2.8;
            for (let i = 0; i < count; i++) {
              const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
              const dist = 4.6 + Math.random() * 2.8;
              const start = new THREE.Vector3(Math.cos(a) * 1.5, originY, Math.sin(a) * 1.5);
              const target = new THREE.Vector3(Math.cos(a) * dist, 0.05, Math.sin(a) * dist);

              const mesh = new THREE.Mesh(spearGeo, spearMat);
              mesh.position.copy(start);
              environmentGroup.add(mesh);

              activeSpears.push({ mesh, start, target, progress: 0, speed: 1.45 + Math.random() * 0.35 });
            }
          }

          const SNOW_COUNT = 240;
          const snowPos = new Float32Array(SNOW_COUNT * 3);
          for (let i = 0; i < SNOW_COUNT; i++) {
            snowPos[i * 3] = (Math.random() - 0.5) * 12;
            snowPos[i * 3 + 1] = Math.random() * 5.5;
            snowPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
          }
          const snowGeo = new THREE.BufferGeometry();
          snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
          const snowMat = new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.08, transparent: true, opacity: 0.0 });
          const snowPoints = new THREE.Points(snowGeo, snowMat);
          environmentGroup.add(snowPoints);

          let lastTierApplied = effTier;
          let lastFrostState = false;

          group.userData.animatePose = (dt: number) => {
            const act = norseFortressActionRef.current;
            const currentT = buildingAge >= 4 ? 4 : 3;
            if (currentT !== lastTierApplied) {
              lastTierApplied = currentT;
              fortress.setTier(currentT);
            }

            const isFrost = act === 'geada';
            if (isFrost !== lastFrostState) {
              lastFrostState = isFrost;
              fortress.setFrostState(isFrost);
            }

            const targetFrostOpacity = isFrost ? 0.85 : (currentT === 4 ? 0.22 : 0.0);
            const ringMat = fortress.frostRing.material as THREE.MeshBasicMaterial;
            ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetFrostOpacity, 4, dt);
            fortress.frostRing.rotation.z += dt * 0.35;

            snowMat.opacity = THREE.MathUtils.damp(snowMat.opacity, isFrost ? 0.9 : 0.0, 4, dt);
            if (snowMat.opacity > 0.02) {
              const sAttr = snowGeo.attributes.position;
              for (let i = 0; i < SNOW_COUNT; i++) {
                let sy = sAttr.getY(i) - dt * 1.4;
                if (sy < 0) sy = 5.5;
                sAttr.setY(i, sy);
              }
              sAttr.needsUpdate = true;
            }

            if (act === 'defesa') {
              volleyTimer -= dt;
              if (volleyTimer <= 0) {
                volleyTimer = 0.72;
                spawnNorseVolley(currentT === 4);
              }
            }

            for (let i = activeSpears.length - 1; i >= 0; i--) {
              const sp = activeSpears[i];
              sp.progress += dt * sp.speed;
              const p = Math.min(1, sp.progress);
              const pos = new THREE.Vector3().lerpVectors(sp.start, sp.target, p);
              pos.y += Math.sin(p * Math.PI) * 1.35;
              sp.mesh.position.copy(pos);

              const nextP = Math.min(1, p + 0.04);
              const nextPos = new THREE.Vector3().lerpVectors(sp.start, sp.target, nextP);
              nextPos.y += Math.sin(nextP * Math.PI) * 1.35;
              sp.mesh.lookAt(nextPos);

              if (p >= 1) {
                environmentGroup.remove(sp.mesh);
                sp.mesh.geometry.dispose();
                activeSpears.splice(i, 1);
              }
            }
          };
        } else if (selectedCiv === 'greek' && selectedBuilding === 'temple') {
          const rawGod = selectedMajorGod.toLowerCase();
          const godKey = (
            rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus'
          ) as GreekTempleGodKey;
          const theme = GREEK_TEMPLE_THEMES[godKey] || GREEK_TEMPLE_THEMES.zeus;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
          addPedestal(3.6, 4.0, theme.goldHex);

          const effTier = Math.max(1, Math.min(5, buildingAge));
          const temple = buildGreekTempleStudio(godKey, effTier, !isSoftwareGl);
          group = temple.root;

          // Miracle light beam
          const miracleBeam = new THREE.Mesh(
            new THREE.CylinderGeometry(1.15, 2.25, 14, 32, 1, true),
            new THREE.MeshBasicMaterial({
              color: theme.glowHex,
              transparent: true,
              opacity: 0.0,
              blending: THREE.AdditiveBlending,
              side: THREE.DoubleSide,
              depthWrite: false
            })
          );
          miracleBeam.position.y = 7.0;
          environmentGroup.add(miracleBeam);

          // Favor particles
          const FAVOR_N = 140;
          const favorPos = new Float32Array(FAVOR_N * 3);
          const favorSpeed = new Float32Array(FAVOR_N);
          for (let i = 0; i < FAVOR_N; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 0.8 + Math.random() * 2.8;
            favorPos[i * 3] = Math.cos(a) * r;
            favorPos[i * 3 + 1] = Math.random() * 5.5;
            favorPos[i * 3 + 2] = Math.sin(a) * r;
            favorSpeed[i] = 0.45 + Math.random() * 0.75;
          }
          const favorGeo = new THREE.BufferGeometry();
          favorGeo.setAttribute('position', new THREE.BufferAttribute(favorPos, 3));
          const favorMat = new THREE.PointsMaterial({
            color: theme.glowHex,
            size: 0.11,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          const favorPoints = new THREE.Points(favorGeo, favorMat);
          environmentGroup.add(favorPoints);

          let lastTierApplied = effTier;
          let elapsed = 0;

          group.userData.animatePose = (dt: number) => {
            elapsed += dt;
            const currentT = Math.max(1, Math.min(5, buildingAge));
            if (currentT !== lastTierApplied) {
              lastTierApplied = currentT;
              temple.setTier(currentT);
            }

            // Animate flames
            temple.allFlames.forEach((fl, idx) => {
              fl.scale.set(
                1 + Math.sin(elapsed * 12 + idx) * 0.14,
                1 + Math.cos(elapsed * 15 + idx) * 0.22,
                1 + Math.sin(elapsed * 11 + idx) * 0.14
              );
            });

            // Action: favor vs milagre
            const act = templeActionRef.current;
            const isMiracle = act === 'milagre';

            const beamTarget = isMiracle ? 0.65 : 0.0;
            const mbMat = miracleBeam.material as THREE.MeshBasicMaterial;
            mbMat.opacity = THREE.MathUtils.damp(mbMat.opacity, beamTarget, 4, dt);
            miracleBeam.rotation.y += dt * 1.2;

            const ringTarget = isMiracle ? 0.85 : (0.18 + currentT * 0.04);
            const ringMat = temple.favorRing.material as THREE.MeshBasicMaterial;
            ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, ringTarget, 4, dt);
            temple.favorRing.rotation.z += dt * 0.35;

            // Particles update
            const fAttr = favorGeo.attributes.position;
            const speedMult = isMiracle ? 2.8 : 1.0;
            for (let i = 0; i < FAVOR_N; i++) {
              let fy = fAttr.getY(i) + favorSpeed[i] * dt * speedMult;
              if (fy > 6.2) fy = 0.2;
              fAttr.setY(i, fy);
            }
            fAttr.needsUpdate = true;
          };
        } else if (selectedCiv === 'egyptian' && selectedBuilding === 'temple') {
          const rawGod = selectedMajorGod.toLowerCase();
          const godKey = (
            rawGod.includes('isis') ? 'isis' : rawGod.includes('set') ? 'set' : 'ra'
          ) as EgyptianTempleGodKey;
          const theme = EGYPT_TEMPLE_THEMES[godKey] || EGYPT_TEMPLE_THEMES.ra;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
          addPedestal(3.6, 4.0, theme.goldHex);

          const effTier = Math.max(1, Math.min(5, buildingAge));
          const temple = buildEgyptianTempleStudio(godKey, effTier, !isSoftwareGl);
          group = temple.root;

          // Solar beam for milagre
          const solarBeam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.85, 2.45, 14, 32, 1, true),
            new THREE.MeshBasicMaterial({
              color: theme.glowHex,
              transparent: true,
              opacity: 0.0,
              blending: THREE.AdditiveBlending,
              side: THREE.DoubleSide,
              depthWrite: false
            })
          );
          solarBeam.position.y = 7.0;
          environmentGroup.add(solarBeam);

          // Favor particles
          const FAVOR_N = 140;
          const favorPos = new Float32Array(FAVOR_N * 3);
          const favorSpeed = new Float32Array(FAVOR_N);
          for (let i = 0; i < FAVOR_N; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 0.8 + Math.random() * 2.8;
            favorPos[i * 3] = Math.cos(a) * r;
            favorPos[i * 3 + 1] = Math.random() * 5.5;
            favorPos[i * 3 + 2] = Math.sin(a) * r;
            favorSpeed[i] = 0.45 + Math.random() * 0.75;
          }
          const favorGeo = new THREE.BufferGeometry();
          favorGeo.setAttribute('position', new THREE.BufferAttribute(favorPos, 3));
          const favorMat = new THREE.PointsMaterial({
            color: theme.glowHex,
            size: 0.11,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          const favorPoints = new THREE.Points(favorGeo, favorMat);
          environmentGroup.add(favorPoints);

          let lastTierApplied = effTier;
          let elapsed = 0;

          group.userData.animatePose = (dt: number) => {
            elapsed += dt;
            const currentT = Math.max(1, Math.min(5, buildingAge));
            if (currentT !== lastTierApplied) {
              lastTierApplied = currentT;
              temple.setTier(currentT);
            }

            temple.allFlames.forEach((fl, idx) => {
              fl.scale.set(
                1 + Math.sin(elapsed * 12 + idx) * 0.14,
                1 + Math.cos(elapsed * 15 + idx) * 0.22,
                1 + Math.sin(elapsed * 11 + idx) * 0.14
              );
            });

            const act = templeActionRef.current;
            const isMiracle = act === 'milagre';

            const beamTarget = isMiracle ? 0.65 : 0.0;
            const sbMat = solarBeam.material as THREE.MeshBasicMaterial;
            sbMat.opacity = THREE.MathUtils.damp(sbMat.opacity, beamTarget, 4, dt);
            solarBeam.rotation.y += dt * 1.2;

            const ringTarget = isMiracle ? 0.85 : (0.18 + currentT * 0.04);
            const ringMat = temple.favorRing.material as THREE.MeshBasicMaterial;
            ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, ringTarget, 4, dt);
            temple.favorRing.rotation.z += dt * 0.35;

            const fAttr = favorGeo.attributes.position;
            const speedMult = isMiracle ? 2.8 : 1.0;
            for (let i = 0; i < FAVOR_N; i++) {
              let fy = fAttr.getY(i) + favorSpeed[i] * dt * speedMult;
              if (fy > 6.2) fy = 0.2;
              fAttr.setY(i, fy);
            }
            fAttr.needsUpdate = true;
          };
        } else {
          scene.background = defaultBg.clone();
          scene.fog = new THREE.FogExp2(0x0b0e14, 0.014);
          addPedestal(3.1, 3.4, 0xd4af37);

          group = createBuildingMesh(
            selectedBuilding,
            'player',
            pal,
            !isSoftwareGl,
            selectedCiv,
            selectedMajorGod,
            buildingAge
          );
        }

        if (showHumanScale) {
          const refVillager = createUnitMesh('villager', 'player', pal, !isSoftwareGl, selectedCiv, selectedMajorGod);
          refVillager.position.set(-2.55, 0, 1.9);
          refVillager.rotation.y = 0.55;
          environmentGroup.add(refVillager);
        }
      } else {
        // galleryCategory === 'unit'
        if (selectedUnit === 'zeus' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x7fb8bd);
          scene.fog = new THREE.FogExp2(0x7fb8bd, 0.018);

          const zTex = getCachedZeusTextures();
          const temple = createZeusTempleEnvironment(environmentGroup, zTex);
          zeusClouds = temple.clouds;

          const blobGeo = new THREE.CircleGeometry(1.9, 24);
          const blobMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.38,
            depthWrite: false,
          });
          const blob = new THREE.Mesh(blobGeo, blobMat);
          blob.rotation.x = -Math.PI / 2;
          blob.position.y = 0.02;
          environmentGroup.add(blob);
          localDisposables.push(blobGeo, blobMat);

          const zeus = buildZeus(zTex);
          group = zeus.flight;
          group.scale.setScalar(1.38);
          group.position.set(0, 0.25, 0);
          group.userData.animatePose = (dt: number) => {
            animateZeus(zeus, dt, simTime, zeusModeRef.current);
          };
        } else if (selectedUnit === 'poseidon' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x04151f);
          scene.fog = new THREE.FogExp2(0x04151f, 0.022);

          const pTex = getCachedPoseidonTextures();
          const oceanEnv = createPoseidonEnvironment(environmentGroup, pTex);
          poseidonOceanPos = oceanEnv.oceanPos as THREE.BufferAttribute;
          poseidonOceanInitY = new Float32Array(oceanEnv.oceanPos.count);
          for (let i = 0; i < oceanEnv.oceanPos.count; i++) {
            poseidonOceanInitY[i] = oceanEnv.oceanPos.getY(i);
          }

          const poseidon = buildPoseidon(pTex);
          group = poseidon.vessel;
          group.scale.setScalar(1.05);
          group.position.set(0, -0.1, 0);
          group.userData.animatePose = (dt: number) => {
            const m = poseidonModeRef.current;
            animatePoseidon(poseidon, dt, simTime, m === 'conduzido' ? 'ondas' : m);
            if (m === 'correnteza' && Math.random() < 0.3) {
              spawnSpray((Math.random() - 0.5) * 1.2, 0.2, (Math.random() - 0.5) * 1.2, 2.5, 1.2, 2.8);
            }
          };
        } else if (selectedUnit === 'hades' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x090b14);
          scene.fog = new THREE.FogExp2(0x090b14, 0.026);
          ashPoints.visible = true;

          const hTex = getCachedHadesTextures();
          hadesEnv = createHadesUnderworldEnvironment(environmentGroup, hTex);

          const hades = buildHades(hTex);
          hadesBidentAnchor = hades.bidentAnchor;
          group = hades.vessel;
          group.scale.setScalar(1.02);
          group.position.set(0, -0.05, 0);
          let trailTimer = 0;
          group.userData.animatePose = (dt: number) => {
            const m = hadesModeRef.current;
            animateHades(hades, dt, simTime, m, bidentLight, false);
            if (m === 'marcha') {
              trailTimer -= dt;
              if (trailTimer <= 0) {
                trailTimer = 0.12;
                spawnShadowTrail(hades.vessel.position.x, hades.vessel.position.z);
              }
            }
          };
        } else if (selectedUnit === 'artemis' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x050d14);
          scene.fog = new THREE.FogExp2(0x050d14, 0.02);
          addPedestal(2.3, 2.5, 0x38bdf8);

          const aTex = getCachedArtemisTextures();
          const artemis = buildArtemis(aTex);
          group = artemis.root;
          group.scale.setScalar(0.81);
          group.userData.animatePose = (dt: number) => {
            animateArtemis(artemis, dt, simTime, artemisModeRef.current);
          };
        } else if (selectedUnit === 'hefesto' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x160b07);
          scene.fog = new THREE.FogExp2(0x160b07, 0.025);
          addPedestal(2.3, 2.5, 0xea580c);

          const anvilGeo = new THREE.BoxGeometry(0.72, 0.22, 0.36);
          const anvilMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.9, roughness: 0.2 });
          const anvil = new THREE.Mesh(anvilGeo, anvilMat);
          anvil.position.set(0.18, 0.65, 0.95);
          anvil.receiveShadow = true;
          environmentGroup.add(anvil);
          localDisposables.push(anvilGeo, anvilMat);

          const hTex = getCachedHephaestusTextures();
          const hefesto = buildHephaestus(hTex);
          group = hefesto.root;
          group.scale.setScalar(0.85);
          group.userData.animatePose = (dt: number) => {
            animateHephaestus(hefesto, dt, simTime, hefestoModeRef.current);
          };
        } else if (selectedUnit === 'dionisio' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x1a0726);
          scene.fog = new THREE.FogExp2(0x1a0726, 0.02);
          addPedestal(2.3, 2.5, 0xa855f7);

          const dTex = getCachedDionysusTextures();
          const dionisio = buildDionysus(dTex);
          group = dionisio.root;
          group.scale.setScalar(0.83);
          group.userData.animatePose = (dt: number) => {
            animateDionysus(dionisio, dt, simTime, dionisioModeRef.current);
          };
        } else if (selectedUnit === 'afrodite' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x2a0e1d);
          scene.fog = new THREE.FogExp2(0x3b1228, 0.016);
          addPedestal(2.4, 2.6, 0xfb7185);

          const aTex = getCachedAphroditeTextures();
          const afrodite = buildAphrodite(aTex);
          group = afrodite.root;
          group.scale.setScalar(1.22);
          group.userData.animatePose = (dt: number) => {
            animateAphrodite(afrodite, dt, simTime, afroditeModeRef.current);
          };
        } else if (selectedUnit === 'apolo' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x181206);
          scene.fog = new THREE.FogExp2(0x241808, 0.016);
          addPedestal(2.4, 2.6, 0xfacc15);

          const apoTex = getCachedApolloTextures();
          const apolo = buildApollo(apoTex);
          group = apolo.root;
          group.scale.setScalar(0.82);
          group.userData.animatePose = (dt: number) => {
            animateApollo(apolo, dt, simTime, apoloModeRef.current);
          };
        } else if (selectedUnit === 'ares' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x190806);
          scene.fog = new THREE.FogExp2(0x280c08, 0.018);
          addPedestal(2.4, 2.6, 0xef4444);

          const aresTex = getCachedAresTextures();
          const ares = buildAres(aresTex);
          group = ares.root;
          group.scale.setScalar(0.79);
          group.userData.animatePose = (dt: number) => {
            animateAres(ares, dt, simTime, aresModeRef.current);
          };
        } else if (selectedUnit === 'atena' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x0c1628);
          scene.fog = new THREE.FogExp2(0x13233e, 0.016);
          addPedestal(2.4, 2.6, 0xfacc15);

          const atenaTex = getCachedAtenaTextures();
          const atena = buildAthena(atenaTex);
          group = atena.root;
          group.scale.setScalar(0.80);
          group.userData.animatePose = (dt: number) => {
            animateAthena(atena, dt, simTime, atenaModeRef.current);
          };
        } else if (selectedUnit === 'hermes' && selectedCiv === 'greek') {
          scene.background = new THREE.Color(0x0c1d30);
          scene.fog = new THREE.FogExp2(0x102842, 0.018);
          addPedestal(2.4, 2.6, 0x2dd4bf);

          const hermesTex = getCachedHermesTextures();
          const hermes = buildHermes(hermesTex);
          group = hermes.root;
          group.scale.setScalar(0.81);
          group.userData.animatePose = (dt: number) => {
            animateHermes(hermes, dt, simTime, hermesModeRef.current);
          };
        } else if (selectedUnit === 'isis' && selectedCiv === 'egyptian') {
          scene.background = new THREE.Color(0x050508);
          scene.fog = new THREE.FogExp2(0x050508, 0.022);

          const isisTex = getCachedIsisTextures();
          const pedGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.2, 48);
          const pedMat = new THREE.MeshStandardMaterial({ map: isisTex.floorTex, roughness: 0.5, metalness: 0.2 });
          const pedestal = new THREE.Mesh(pedGeo, pedMat);
          pedestal.position.y = -0.1;
          pedestal.receiveShadow = true;
          environmentGroup.add(pedestal);

          const ringGeo = new THREE.RingGeometry(2.4, 2.65, 48);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.01;
          environmentGroup.add(ring);

          const obeliskMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7 });
          const goldTipMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1, roughness: 0.1 });
          const obBaseGeo = new THREE.BoxGeometry(1.0, 0.35, 1.0);
          const obShaftGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.0, 4);
          const obTipGeo = new THREE.ConeGeometry(0.26, 0.6, 4);
          for (const x of [-3.0, 3.0]) {
            const obelisk = new THREE.Group();
            obelisk.position.set(x, 0, -2.8);
            const baseMesh = new THREE.Mesh(obBaseGeo, obeliskMat);
            const shaftMesh = new THREE.Mesh(obShaftGeo, obeliskMat);
            shaftMesh.position.y = 1.65;
            shaftMesh.rotation.y = Math.PI / 4;
            const tipMesh = new THREE.Mesh(obTipGeo, goldTipMat);
            tipMesh.position.y = 3.45;
            tipMesh.rotation.y = Math.PI / 4;
            obelisk.add(baseMesh, shaftMesh, tipMesh);
            environmentGroup.add(obelisk);
          }
          localDisposables.push(pedGeo, pedMat, ringGeo, ringMat, obeliskMat, goldTipMat, obBaseGeo, obShaftGeo, obTipGeo);

          const isis = buildIsis(isisTex);
          group = isis.root;
          group.scale.setScalar(0.85);
          group.userData.animatePose = (dt: number) => {
            animateIsis(isis, dt, simTime, isisModeRef.current);
          };
        } else if (selectedUnit === 'set' && selectedCiv === 'egyptian') {
          scene.background = new THREE.Color(0x0b0504);
          scene.fog = new THREE.FogExp2(0x0b0504, 0.022);

          const setTex = getCachedSetTextures();
          const pedGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.2, 48);
          const pedMat = new THREE.MeshStandardMaterial({ map: setTex.floorTex, roughness: 0.6, metalness: 0.1 });
          const pedestal = new THREE.Mesh(pedGeo, pedMat);
          pedestal.position.y = -0.1;
          pedestal.receiveShadow = true;
          environmentGroup.add(pedestal);

          const ringGeo = new THREE.RingGeometry(2.4, 2.65, 48);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.01;
          environmentGroup.add(ring);

          const obeliskMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7 });
          const chaosTipMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, emissive: 0x7e22ce, emissiveIntensity: 0.8 });
          const obBaseGeo = new THREE.BoxGeometry(1.0, 0.35, 1.0);
          const obShaftGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.0, 4);
          const obTipGeo = new THREE.ConeGeometry(0.26, 0.6, 4);
          for (const x of [-3.0, 3.0]) {
            const obelisk = new THREE.Group();
            obelisk.position.set(x, 0, -2.8);
            const baseMesh = new THREE.Mesh(obBaseGeo, obeliskMat);
            const shaftMesh = new THREE.Mesh(obShaftGeo, obeliskMat);
            shaftMesh.position.y = 1.65;
            shaftMesh.rotation.y = Math.PI / 4;
            const tipMesh = new THREE.Mesh(obTipGeo, chaosTipMat);
            tipMesh.position.y = 3.45;
            tipMesh.rotation.y = Math.PI / 4;
            obelisk.add(baseMesh, shaftMesh, tipMesh);
            environmentGroup.add(obelisk);
          }
          localDisposables.push(pedGeo, pedMat, ringGeo, ringMat, obeliskMat, chaosTipMat, obBaseGeo, obShaftGeo, obTipGeo);

          const setGod = buildSet(setTex);
          group = setGod.root;
          group.scale.setScalar(0.85);
          group.userData.animatePose = (dt: number) => {
            animateSet(setGod, dt, simTime, setModeRef.current);
          };
        } else if (selectedUnit === 'ra' && selectedCiv === 'egyptian') {
          scene.background = new THREE.Color(0x1e3a8a);
          scene.fog = new THREE.FogExp2(0x1e3a8a, 0.016);

          const raTex = getCachedRaTextures();
          const pedGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.2, 48);
          const pedMat = new THREE.MeshStandardMaterial({ map: raTex.floorTex, roughness: 0.42, metalness: 0.15 });
          const pedestal = new THREE.Mesh(pedGeo, pedMat);
          pedestal.position.y = -0.1;
          pedestal.receiveShadow = true;
          environmentGroup.add(pedestal);

          const ringGeo = new THREE.RingGeometry(2.4, 2.65, 48);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.01;
          environmentGroup.add(ring);

          const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xd6b076, roughness: 0.68, metalness: 0.1 });
          const goldColMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.92, roughness: 0.18 });
          const lapisColMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.25 });
          const colBaseGeo = new THREE.BoxGeometry(0.65, 0.15, 0.65);
          const colShaftGeo = new THREE.CylinderGeometry(0.22, 0.28, 2.4, 16);
          const colBandGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16);
          const colCapGeo = new THREE.CylinderGeometry(0.38, 0.22, 0.28, 16);
          const colAbacusGeo = new THREE.BoxGeometry(0.58, 0.12, 0.58);
          const colSunGeo = new THREE.SphereGeometry(0.14, 14, 14);

          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + 0.25;
            const dist = 3.6;
            const col = new THREE.Group();
            col.position.set(Math.cos(a) * dist, 0, Math.sin(a) * dist);
            col.rotation.y = -a + Math.PI / 2;

            const baseMesh = new THREE.Mesh(colBaseGeo, sandstoneMat);
            baseMesh.position.y = 0.075;
            const shaftMesh = new THREE.Mesh(colShaftGeo, sandstoneMat);
            shaftMesh.position.y = 1.35;
            const f1 = new THREE.Mesh(colBandGeo, goldColMat);
            f1.position.y = 0.8;
            const f2 = new THREE.Mesh(colBandGeo, lapisColMat);
            f2.position.y = 1.4;
            const f3 = new THREE.Mesh(colBandGeo, goldColMat);
            f3.position.y = 2.0;
            const capMesh = new THREE.Mesh(colCapGeo, goldColMat);
            capMesh.position.y = 2.65;
            const abacusMesh = new THREE.Mesh(colAbacusGeo, sandstoneMat);
            abacusMesh.position.y = 2.85;
            const sunDiskMesh = new THREE.Mesh(colSunGeo, goldColMat);
            sunDiskMesh.position.y = 3.08;
            sunDiskMesh.scale.set(1, 1, 0.35);

            col.add(baseMesh, shaftMesh, f1, f2, f3, capMesh, abacusMesh, sunDiskMesh);
            environmentGroup.add(col);
          }
          localDisposables.push(
            pedGeo, pedMat, ringGeo, ringMat, sandstoneMat, goldColMat, lapisColMat,
            colBaseGeo, colShaftGeo, colBandGeo, colCapGeo, colAbacusGeo, colSunGeo
          );

          const raGod = buildRa(raTex);
          group = raGod.root;
          group.scale.setScalar(0.85);
          group.userData.animatePose = (dt: number) => {
            animateRa(raGod, dt, simTime, raModeRef.current);
          };
        } else if (selectedCiv === 'greek' && selectedUnit === 'hoplite') {
          if (selectedMajorGod === 'Poseidon') {
            scene.background = new THREE.Color(0x062336);
            scene.fog = new THREE.FogExp2(0x062336, 0.02);

            const pTex = getCachedPoseidonHopliteTextures();
            const hopliteRig = buildPoseidonHoplite(pTex, (activeTier as HopliteTierId) || 3);
            group = hopliteRig.root;
            group.scale.setScalar(0.95);
            const arena = createPoseidonHopliteArena(pTex);
            environmentGroup.add(arena);

            group.userData.setArmorTier = (tier: number) => {
              hopliteRig.setTier(tier as HopliteTierId);
            };
            group.userData.animatePose = (dt: number) => {
              animatePoseidonHoplite(
                hopliteRig,
                dt,
                simTime,
                hopliteActionRef.current as PoseidonHopliteAction,
                (p) => {
                  spawnSpark(p);
                }
              );
            };
          } else if (selectedMajorGod === 'Hades') {
            scene.background = new THREE.Color(0x090712);
            scene.fog = new THREE.FogExp2(0x090712, 0.022);

            const hTex = getCachedHadesHopliteTextures();
            const hopliteRig = buildHadesHoplite(hTex, (activeTier as HopliteTierId) || 3);
            group = hopliteRig.root;
            group.scale.setScalar(0.95);
            const { arena, torches } = createHadesHopliteArena(hTex);
            environmentGroup.add(arena);

            group.userData.setArmorTier = (tier: number) => {
              hopliteRig.setTier(tier as HopliteTierId);
            };
            group.userData.animatePose = (dt: number) => {
              torches.forEach((tr) => {
                tr.mesh.scale.set(
                  1 + Math.sin(simTime * 11 + tr.phase) * 0.15,
                  1 + Math.cos(simTime * 13 + tr.phase) * 0.22,
                  1
                );
              });
              animateHadesHoplite(
                hopliteRig,
                dt,
                simTime,
                hopliteActionRef.current as HadesHopliteAction,
                (p) => {
                  spawnSpark(p);
                }
              );
            };
          } else {
            scene.background = new THREE.Color(0x132644);
            scene.fog = new THREE.FogExp2(0x132644, 0.02);

            const hTex = getCachedZeusHopliteTextures();
            const hopliteRig = buildZeusHoplite(hTex, (activeTier as HopliteTierId) || 3);
            group = hopliteRig.root;
            group.scale.setScalar(0.95);
            const arena = createZeusHopliteArena(hTex);
            environmentGroup.add(arena);

            group.userData.setArmorTier = (tier: number) => {
              hopliteRig.setTier(tier as HopliteTierId);
            };
            group.userData.animatePose = (dt: number) => {
              animateZeusHoplite(hopliteRig, dt, simTime, hopliteActionRef.current, (p) => {
                spawnSpark(p);
              });
            };
          }
        } else if (selectedCiv === 'greek' && selectedUnit === 'villager') {
          const godKey = (
            selectedMajorGod === 'Poseidon'
              ? 'poseidon'
              : selectedMajorGod === 'Hades'
              ? 'hades'
              : 'zeus'
          ) as 'zeus' | 'poseidon' | 'hades';
          const theme = GOD_VILLAGER_THEMES[godKey] || GOD_VILLAGER_THEMES.zeus;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
          addPedestal(2.2, 2.4, theme.accentHex);

          const maleVillager = buildGreekVillager(false, godKey, !isSoftwareGl);
          const femaleVillager = buildGreekVillager(true, godKey, !isSoftwareGl);
          const villagerRoot = new THREE.Group();
          villagerRoot.add(maleVillager.root);
          villagerRoot.add(femaleVillager.root);
          group = villagerRoot;

          const animateStudioVillager = (
            v: GreekVillagerInstance,
            _dt: number,
            t: number,
            offsetX: number,
            phaseOffset: number,
            task: string
          ) => {
            if (!v.root.visible) return;

            let vx = offsetX;
            let vz = 0;
            let vy = 0;
            let yaw = 0;
            let pitch = 0;
            let torsoYaw = 0;
            const breath = Math.sin(t * 2.3 + phaseOffset) * 0.018;

            if (task === 'andar') {
              const a = t * 0.95 + phaseOffset;
              const R = v.isFemale ? 1.6 : 2.0;
              vx = Math.cos(a) * R;
              vz = Math.sin(a) * R;
              yaw = -a;
              pitch = 0.06;

              const stride = t * 5.6 + phaseOffset;
              const sinS = Math.sin(stride);
              const cosS = Math.cos(stride);
              vy = Math.abs(cosS) * 0.04;
              torsoYaw = sinS * 0.08;

              v.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
              v.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
              v.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
              v.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

              v.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
              v.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
              v.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
              v.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
            } else if (task === 'madeira' || task === 'ouro' || task === 'construir') {
              vx = offsetX;
              vz = 0.25;
              yaw = v.isFemale ? -0.22 : 0.22;

              const speed = task === 'construir' ? 5.2 : 3.8;
              const swing = (t * speed + phaseOffset) % (Math.PI * 2);
              const strike = Math.sin(swing);

              pitch = 0.14 + strike * 0.16;
              torsoYaw = -0.18 + strike * 0.28;

              v.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
              v.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
              v.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
              v.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

              v.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
              v.legs.L.knee.rotation.set(0.28, 0, 0);
              v.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
              v.legs.R.knee.rotation.set(0.22, 0, 0);

              if (strike > 0.92) {
                spawnSpark(new THREE.Vector3(vx, 0.6, 0.8));
              }
            } else if (task === 'fruta') {
              vx = offsetX;
              vz = 0.28;
              yaw = v.isFemale ? -0.20 : 0.20;

              const pick = Math.sin(t * 3.4 + phaseOffset);
              pitch = 0.22 + pick * 0.08;
              torsoYaw = pick * 0.18;

              v.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
              v.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

              v.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
              v.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

              v.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
              v.legs.L.knee.rotation.set(0.26, 0, 0);
              v.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
              v.legs.R.knee.rotation.set(0.22, 0, 0);
            } else {
              vx = offsetX;
              vz = 0;
              yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (v.isFemale ? -0.14 : 0.14);

              v.rightArm.arm.rotation.set(-0.14, 0.08, 0.16 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
              v.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
              v.leftArm.arm.rotation.set(-0.14, -0.08, -0.16 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
              v.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

              v.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
              v.legs.L.knee.rotation.set(0.16, 0, 0);
              v.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
              v.legs.R.knee.rotation.set(0.14, 0, 0);
            }

            v.root.position.set(vx, vy, vz);
            v.root.rotation.set(0, yaw, 0);
            v.body.position.y = 1.00 * v.heightScale + breath;
            v.body.rotation.set(pitch, torsoYaw, 0);
          };

          group.userData.animatePose = (dt: number) => {
            const currentGender = villagerGenderRef.current;
            const currentTask = villagerTaskRef.current;

            maleVillager.root.visible = currentGender === 'ambos' || currentGender === 'homem';
            femaleVillager.root.visible = currentGender === 'ambos' || currentGender === 'mulher';

            maleVillager.setToolMode(currentTask);
            femaleVillager.setToolMode(currentTask);

            const maleOffset = currentGender === 'ambos' ? -0.58 : 0;
            const femaleOffset = currentGender === 'ambos' ? 0.58 : 0;

            const t = simTime;
            animateStudioVillager(maleVillager, dt, t, maleOffset, 0, currentTask);
            animateStudioVillager(femaleVillager, dt, t, femaleOffset, 1.4, currentTask);
          };
        } else if (
          selectedCiv === 'norse' &&
          (selectedUnit === 'villager' || selectedUnit === 'norse_dwarf')
        ) {
          const godKey = (
            selectedMajorGod.toLowerCase() === 'thor'
              ? 'thor'
              : selectedMajorGod.toLowerCase() === 'loki'
              ? 'loki'
              : selectedMajorGod.toLowerCase() === 'freyr'
              ? 'freyr'
              : 'odin'
          );
          const theme = NORSE_GOD_THEMES[godKey] || NORSE_GOD_THEMES.odin;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
          addPedestal(2.4, 2.6, theme.ringHex);

          const norseMan = buildNorseWorker('homem', godKey, !isSoftwareGl);
          const norseWoman = buildNorseWorker('mulher', godKey, !isSoftwareGl);
          const norseDwarf = buildNorseWorker('anao', godKey, !isSoftwareGl);

          const norseWorkerRoot = new THREE.Group();
          norseWorkerRoot.add(norseMan.root);
          norseWorkerRoot.add(norseWoman.root);
          norseWorkerRoot.add(norseDwarf.root);
          group = norseWorkerRoot;

          const animateStudioNorseWorker = (
            w: NorseWorkerInstance,
            _dt: number,
            t: number,
            slotOffsetX: number,
            phaseOffset: number,
            currentTask: NorseWorkerTask,
            currentMode: string
          ) => {
            if (!w.root.visible) return;

            let vx = slotOffsetX;
            let vz = 0;
            let vy = 0;
            let yaw = 0;
            let pitch = 0;
            let torsoYaw = 0;
            const breath = Math.sin(t * 2.3 + phaseOffset) * 0.016;

            if (currentTask === 'andar') {
              const a = t * 0.95 + phaseOffset;
              const R = w.isDwarf ? 1.6 : (w.isFemale ? 1.9 : 2.2);
              vx = Math.cos(a) * R;
              vz = Math.sin(a) * R;
              yaw = -a;
              pitch = 0.06;

              const stepFreq = w.isDwarf ? 7.2 : 5.6;
              const stride = t * stepFreq + phaseOffset;
              const sinS = Math.sin(stride);
              const cosS = Math.cos(stride);
              vy = Math.abs(cosS) * 0.04;
              torsoYaw = sinS * 0.09;

              w.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
              w.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
              w.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
              w.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

              w.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
              w.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
              w.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
              w.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
            } else if (currentTask === 'madeira' || currentTask === 'ouro' || currentTask === 'construir') {
              vx = currentMode === 'todos' ? slotOffsetX : 0;
              vz = 0.25;
              yaw = currentMode === 'todos' ? -slotOffsetX * 0.45 : 0;

              const speed = (w.isDwarf && currentTask === 'ouro') ? 5.6 : (currentTask === 'construir' ? 5.0 : 3.9);
              const swing = (t * speed + phaseOffset) % (Math.PI * 2);
              const strike = Math.sin(swing);

              pitch = 0.14 + strike * 0.16;
              torsoYaw = -0.18 + strike * 0.28;

              w.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
              w.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
              w.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
              w.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

              w.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
              w.legs.L.knee.rotation.set(0.28, 0, 0);
              w.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
              w.legs.R.knee.rotation.set(0.22, 0, 0);

              if (strike > 0.92) {
                spawnSpark(new THREE.Vector3(vx, 0.5, 0.8));
              }
            } else if (currentTask === 'fruta') {
              vx = currentMode === 'todos' ? slotOffsetX : 0;
              vz = 0.28;
              yaw = currentMode === 'todos' ? -slotOffsetX * 0.45 : 0;

              const pick = Math.sin(t * 3.4 + phaseOffset);
              pitch = 0.22 + pick * 0.08;
              torsoYaw = pick * 0.18;

              w.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
              w.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

              w.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
              w.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

              w.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
              w.legs.L.knee.rotation.set(0.26, 0, 0);
              w.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
              w.legs.R.knee.rotation.set(0.22, 0, 0);
            } else {
              vx = currentMode === 'todos' ? slotOffsetX : 0;
              vz = (currentMode === 'todos' && w.isDwarf) ? 0.18 : 0;
              yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (currentMode === 'todos' ? -slotOffsetX * 0.18 : 0);

              w.rightArm.arm.rotation.set(-0.14, 0.08, 0.18 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
              w.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
              w.leftArm.arm.rotation.set(-0.14, -0.08, -0.18 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
              w.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

              w.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
              w.legs.L.knee.rotation.set(0.16, 0, 0);
              w.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
              w.legs.R.knee.rotation.set(0.14, 0, 0);
            }

            w.root.position.set(vx, vy, vz);
            w.root.rotation.set(0, yaw, 0);
            w.body.position.y = w.baseHipY + breath;
            w.body.rotation.set(pitch, torsoYaw, 0);
          };

          group.userData.animatePose = (dt: number) => {
            const currentMode = norseWorkerModeRef.current;
            const currentTask = norseWorkerTaskRef.current;

            const isSpecificDwarfUnit = selectedUnit === 'norse_dwarf';
            const effMode = isSpecificDwarfUnit && currentMode === 'todos' ? 'anao' : currentMode;

            norseMan.root.visible = effMode === 'todos' || effMode === 'homem';
            norseWoman.root.visible = effMode === 'todos' || effMode === 'mulher';
            norseDwarf.root.visible = effMode === 'todos' || effMode === 'anao';

            norseMan.setToolMode(currentTask);
            norseWoman.setToolMode(currentTask);
            norseDwarf.setToolMode(currentTask);

            const t = simTime;
            animateStudioNorseWorker(norseMan, dt, t, -0.82, 0, currentTask, effMode);
            animateStudioNorseWorker(norseDwarf, dt, t, 0.0, 0.9, currentTask, effMode);
            animateStudioNorseWorker(norseWoman, dt, t, 0.82, 1.8, currentTask, effMode);
          };
        } else if (
          selectedCiv === 'egyptian' &&
          selectedUnit === 'villager'
        ) {
          const godKey = (
            selectedMajorGod.toLowerCase() === 'isis' || selectedMajorGod.toLowerCase() === 'ísis'
              ? 'isis'
              : selectedMajorGod.toLowerCase() === 'set'
              ? 'set'
              : 'ra'
          ) as 'ra' | 'isis' | 'set';
          const theme = EGYPTIAN_GOD_THEMES[godKey] || EGYPTIAN_GOD_THEMES.ra;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
          addPedestal(2.2, 2.4, theme.accentHex);

          const maleLaborer = buildEgyptianLaborer(false, godKey, !isSoftwareGl);
          const femaleLaborer = buildEgyptianLaborer(true, godKey, !isSoftwareGl);
          const laborerRoot = new THREE.Group();
          laborerRoot.add(maleLaborer.root);
          laborerRoot.add(femaleLaborer.root);
          group = laborerRoot;

          const animateStudioEgyptianLaborer = (
            v: EgyptianLaborerInstance,
            _dt: number,
            t: number,
            offsetX: number,
            phaseOffset: number,
            task: EgyptianLaborerAction
          ) => {
            if (!v.root.visible) return;

            let vx = offsetX;
            let vz = 0;
            let vy = 0;
            let yaw = 0;
            let pitch = 0;
            let torsoYaw = 0;
            const breath = Math.sin(t * 2.3 + phaseOffset) * 0.018;

            if (task === 'andar') {
              const a = t * 0.95 + phaseOffset;
              const R = v.isFemale ? 1.6 : 2.0;
              vx = Math.cos(a) * R;
              vz = Math.sin(a) * R;
              yaw = -a;
              pitch = 0.06;

              const stride = t * 5.6 + phaseOffset;
              const sinS = Math.sin(stride);
              const cosS = Math.cos(stride);
              vy = Math.abs(cosS) * 0.04;
              torsoYaw = sinS * 0.08;

              v.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
              v.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
              v.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
              v.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

              v.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
              v.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
              v.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
              v.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
            } else if (task === 'madeira' || task === 'ouro' || task === 'construir') {
              vx = offsetX;
              vz = 0.25;
              yaw = v.isFemale ? -0.22 : 0.22;

              const speed = task === 'construir' ? 5.2 : 3.8;
              const swing = (t * speed + phaseOffset) % (Math.PI * 2);
              const strike = Math.sin(swing);

              pitch = 0.14 + strike * 0.16;
              torsoYaw = -0.18 + strike * 0.28;

              v.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
              v.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
              v.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
              v.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

              v.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
              v.legs.L.knee.rotation.set(0.28, 0, 0);
              v.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
              v.legs.R.knee.rotation.set(0.22, 0, 0);

              if (strike > 0.92) {
                spawnSpark(new THREE.Vector3(vx, 0.6, 0.8));
              }
            } else if (task === 'fruta') {
              vx = offsetX;
              vz = 0.28;
              yaw = v.isFemale ? -0.20 : 0.20;

              const pick = Math.sin(t * 3.4 + phaseOffset);
              pitch = 0.22 + pick * 0.08;
              torsoYaw = pick * 0.18;

              v.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
              v.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

              v.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
              v.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

              v.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
              v.legs.L.knee.rotation.set(0.26, 0, 0);
              v.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
              v.legs.R.knee.rotation.set(0.22, 0, 0);
            } else {
              vx = offsetX;
              vz = 0;
              yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (v.isFemale ? -0.14 : 0.14);

              v.rightArm.arm.rotation.set(-0.14, 0.08, 0.16 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
              v.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
              v.leftArm.arm.rotation.set(-0.14, -0.08, -0.16 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
              v.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

              v.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
              v.legs.L.knee.rotation.set(0.16, 0, 0);
              v.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
              v.legs.R.knee.rotation.set(0.14, 0, 0);
            }

            v.root.position.set(vx, vy, vz);
            v.root.rotation.set(0, yaw, 0);
            v.body.position.y = 1.00 * v.heightScale + breath;
            v.body.rotation.set(pitch, torsoYaw, 0);
          };

          group.userData.animatePose = (dt: number) => {
            const currentGender = egyptianLaborerGenderRef.current;
            const currentTask = egyptianLaborerTaskRef.current;

            maleLaborer.root.visible = currentGender === 'ambos' || currentGender === 'homem';
            femaleLaborer.root.visible = currentGender === 'ambos' || currentGender === 'mulher';

            maleLaborer.setToolMode(currentTask);
            femaleLaborer.setToolMode(currentTask);

            const maleOffset = currentGender === 'ambos' ? -0.58 : 0;
            const femaleOffset = currentGender === 'ambos' ? 0.58 : 0;

            const t = simTime;
            animateStudioEgyptianLaborer(maleLaborer, dt, t, maleOffset, 0, currentTask);
            animateStudioEgyptianLaborer(femaleLaborer, dt, t, femaleOffset, 1.4, currentTask);
          };
        } else if (
          selectedCiv === 'atlantean' &&
          (selectedUnit === 'villager' || selectedUnit === 'citizen')
        ) {
          const godKey = (
            selectedMajorGod.toLowerCase() === 'urano' || selectedMajorGod.toLowerCase() === 'oranos'
              ? 'oranos'
              : selectedMajorGod.toLowerCase() === 'gaia'
              ? 'gaia'
              : 'kronos'
          ) as 'kronos' | 'oranos' | 'gaia';
          const theme = ATLANTEAN_GOD_THEMES[godKey] || ATLANTEAN_GOD_THEMES.kronos;

          scene.background = new THREE.Color(theme.bgHex);
          scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
          addPedestal(2.4, 2.6, theme.ringHex);

          const atlanteanMan = buildAtlanteanCitizen(false, godKey, !isSoftwareGl);
          const atlanteanWoman = buildAtlanteanCitizen(true, godKey, !isSoftwareGl);
          const atlanteanLlama = buildAtlanteanLlama(godKey, !isSoftwareGl);

          const atlanteanRoot = new THREE.Group();
          atlanteanRoot.add(atlanteanMan.root);
          atlanteanRoot.add(atlanteanWoman.root);
          atlanteanRoot.add(atlanteanLlama.root);
          group = atlanteanRoot;

          const animateStudioAtlanteanCitizen = (
            c: AtlanteanCitizenInstance,
            dt: number,
            t: number,
            offsetX: number,
            phaseOffset: number,
            task: AtlanteanAction,
            mode: string,
            isHero: boolean
          ) => {
            if (!c.root.visible) return;

            let vx = offsetX;
            let vz = 0;
            let vy = 0;
            let yaw = 0;
            let pitch = 0;
            let torsoYaw = 0;
            const breath = Math.sin(t * 2.3 + phaseOffset) * 0.016;

            if (task === 'andar') {
              const a = t * 0.92 + phaseOffset * 0.4;
              const R = c.isFemale ? 1.6 : 2.0;
              vx = Math.cos(a) * R;
              vz = Math.sin(a) * R;
              yaw = -a;
              pitch = 0.06;

              const stride = t * 5.6 + phaseOffset;
              const sinS = Math.sin(stride);
              const cosS = Math.cos(stride);
              vy = Math.abs(cosS) * 0.04;
              torsoYaw = sinS * 0.08;

              c.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
              c.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
              c.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
              c.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

              c.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
              c.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
              c.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
              c.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
            } else if (task === 'madeira' || task === 'ouro' || task === 'construir') {
              vx = mode === 'todos' ? offsetX : -0.25;
              vz = 0.25;
              yaw = mode === 'todos' ? -offsetX * 0.42 : 0.15;

              const speed = isHero ? 5.2 : 3.9;
              const swing = (t * speed + phaseOffset) % (Math.PI * 2);
              const strike = Math.sin(swing);

              pitch = 0.14 + strike * 0.16;
              torsoYaw = -0.18 + strike * 0.28;

              c.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
              c.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
              c.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
              c.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

              c.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
              c.legs.L.knee.rotation.set(0.28, 0, 0);
              c.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
              c.legs.R.knee.rotation.set(0.22, 0, 0);

              if (strike > 0.92) {
                spawnSpark(new THREE.Vector3(vx, 0.6, 0.8));
              }
            } else if (task === 'fruta') {
              vx = mode === 'todos' ? offsetX : -0.25;
              vz = 0.28;
              yaw = mode === 'todos' ? -offsetX * 0.42 : 0.15;

              const pick = Math.sin(t * 3.4 + phaseOffset);
              pitch = 0.22 + pick * 0.08;
              torsoYaw = pick * 0.18;

              c.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
              c.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

              c.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
              c.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

              c.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
              c.legs.L.knee.rotation.set(0.26, 0, 0);
              c.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
              c.legs.R.knee.rotation.set(0.22, 0, 0);
            } else {
              vx = offsetX;
              vz = 0;
              yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (mode === 'todos' ? -offsetX * 0.14 : 0);

              c.rightArm.arm.rotation.set(-0.14, 0.08, 0.16 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
              c.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
              c.leftArm.arm.rotation.set(-0.14, -0.08, -0.16 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
              c.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

              c.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
              c.legs.L.knee.rotation.set(0.16, 0, 0);
              c.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
              c.legs.R.knee.rotation.set(0.14, 0, 0);
            }

            c.root.position.set(vx, vy, vz);
            c.root.rotation.set(0, yaw, 0);
            c.body.position.y = 1.00 * c.heightScale + breath;
            c.body.rotation.set(pitch, torsoYaw, 0);

            if (isHero) {
              c.heroGroundAura.rotation.z += dt * 1.6;
              c.heroGroundAura.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
            }
          };

          const animateStudioLlama = (
            llama: AtlanteanLlamaInstance,
            _dt: number,
            t: number,
            task: AtlanteanAction,
            mode: string
          ) => {
            let lx = mode === 'todos' ? 0.95 : 0.65;
            let lz = -0.10;
            let ly = 0;
            let yaw = -0.22 + Math.sin(t * 0.6) * 0.08;

            if (task === 'andar') {
              const a = t * 0.92 - 0.55;
              const R = 1.85;
              lx = Math.cos(a) * R;
              lz = Math.sin(a) * R;
              yaw = -a;

              const stride = t * 6.4;
              ly = Math.abs(Math.cos(stride)) * 0.04;
              for (const lg of llama.legs) {
                lg.pivot.rotation.x = Math.sin(stride + lg.phase) * 0.36;
              }
            } else {
              for (const lg of llama.legs) {
                lg.pivot.rotation.x = 0;
              }
              llama.head.rotation.y = Math.sin(t * 1.4) * 0.18;
              llama.head.rotation.x = Math.cos(t * 1.1) * 0.08;
            }

            llama.root.position.set(lx, ly, lz);
            llama.root.rotation.set(0, yaw, 0);
          };

          let lastHeroState = false;

          group.userData.animatePose = (dt: number) => {
            const currentMode = atlanteanCitizenModeRef.current;
            const currentTask = atlanteanCitizenTaskRef.current;
            const isHero = atlanteanIsHeroRef.current;

            if (isHero !== lastHeroState) {
              lastHeroState = isHero;
              atlanteanMan.setHeroState(isHero);
              atlanteanWoman.setHeroState(isHero);
            }

            atlanteanMan.root.visible = currentMode === 'todos' || currentMode === 'homem';
            atlanteanWoman.root.visible = currentMode === 'todos' || currentMode === 'mulher';
            atlanteanLlama.root.visible = true;

            atlanteanMan.setToolMode(currentTask);
            atlanteanWoman.setToolMode(currentTask);

            const manX = currentMode === 'todos' ? -0.78 : -0.28;
            const womanX = currentMode === 'todos' ? 0.12 : -0.28;

            const t = simTime;
            animateStudioAtlanteanCitizen(atlanteanMan, dt, t, manX, 0, currentTask, currentMode, isHero);
            animateStudioAtlanteanCitizen(atlanteanWoman, dt, t, womanX, 1.3, currentTask, currentMode, isHero);
            animateStudioLlama(atlanteanLlama, dt, t, currentTask, currentMode);
          };
        } else if (
          selectedCiv === 'greek' &&
          (selectedUnit === 'hipaspist' || selectedUnit === 'myrmidon')
        ) {
          scene.background = defaultBg.clone();
          scene.fog = new THREE.FogExp2(0x0b0e14, 0.015);
          addPedestal(1.5, 1.65, 0xd4af37);

          group = createGreekUnitMesh(selectedUnit, 'player', pal, !isSoftwareGl, activeTier);
          group.userData.setArmorTier?.(activeTier);
          group.userData.setMode?.('3d');
          if (selectedUnit === 'myrmidon') {
            group.userData.setCombatFury?.(myrmidonFuryRef.current ? 1.0 : 0.0);
          }
        } else if (selectedCiv === 'greek' && selectedUnit === 'medusa') {
          scene.background = new THREE.Color(0x080d1a);
          scene.fog = new THREE.FogExp2(0x080d1a, 0.016);
          addPedestal(2.2, 2.4, 0xfacc15);

          const medusaRig = buildStudioMedusa();
          const medusaGroup = new THREE.Group();
          medusaGroup.add(medusaRig.root);

          // Alvo: Soldado inimigo que é petrificado pelo olhar
          const targetRoot = new THREE.Group();
          targetRoot.position.set(0, 0, 2.6);
          targetRoot.rotation.y = Math.PI;

          const soldierMat = new THREE.MeshStandardMaterial({
            color: 0xb91c1c,
            roughness: 0.35,
            metalness: 0.6,
          });
          const stoneTargetMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.88,
            metalness: 0.05,
          });

          const soldierMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.25, 10), soldierMat);
          soldierMesh.position.y = 0.65;
          const soldierHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), soldierMat);
          soldierHead.position.y = 1.45;
          const soldierShield = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 14), soldierMat);
          soldierShield.rotation.z = Math.PI / 2;
          soldierShield.position.set(-0.35, 0.85, 0.1);
          targetRoot.add(soldierMesh, soldierHead, soldierShield);
          medusaGroup.add(targetRoot);

          // Cone do feixe petrificante
          const gazeGeo = new THREE.ConeGeometry(0.9, 2.8, 16, 1, true);
          gazeGeo.rotateX(-Math.PI / 2);
          gazeGeo.translate(0, 0, 1.4);
          const gazeMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const gazeBeam = new THREE.Mesh(gazeGeo, gazeMat);
          gazeBeam.position.set(0, 1.45, 0.1);
          medusaGroup.add(gazeBeam);

          group = medusaGroup;

          let gazeTimer = 0;
          let isPetrified = false;

          group.userData.triggerGaze = () => {
            if (medusaGazeCooldownRef.current <= 0) {
              gazeTimer = 3.5;
              isPetrified = true;
              setMedusaGazeCooldown(20);
            }
          };

          group.userData.animatePose = (dt: number) => {
            const mode = medusaModeRef.current;
            const t = simTime;

            if (gazeTimer > 0) {
              gazeTimer -= dt;
              gazeMat.opacity = Math.min(0.75, gazeTimer * 0.8);
              if (gazeTimer <= 0) {
                isPetrified = false;
                gazeMat.opacity = 0;
              }
            } else if (mode === 'auto' && Math.sin(t * 0.28) > 0.94 && medusaGazeCooldownRef.current <= 0) {
              gazeTimer = 3.2;
              isPetrified = true;
              setMedusaGazeCooldown(20);
            }

            if (medusaGazeCooldownRef.current > 0) {
              setMedusaGazeCooldown((prev) => Math.max(0, prev - dt));
            }

            const activeMat = isPetrified ? stoneTargetMat : soldierMat;
            soldierMesh.material = activeMat;
            soldierHead.material = activeMat;
            soldierShield.material = activeMat;

            const bowProgress = (t * 1.4) % 1.0;
            const gazeActive = gazeTimer > 0;
            animateStudioMedusa(medusaRig, t, mode, gazeActive, bowProgress);

            if (gazeActive && Math.random() < 0.4) {
              spawnSpark(new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.0, 2.5));
            }
          };
        } else if (selectedCiv === 'greek' && selectedUnit === 'colossus') {
          scene.background = new THREE.Color(0x09101c);
          scene.fog = new THREE.FogExp2(0x09101c, 0.016);
          addPedestal(2.8, 3.0, 0xd97706);

          const colossusGroup = new THREE.Group();
          let currentRigTier = colossusTierRef.current;
          let colossusRig = buildStudioColossus({
            teamId: 'player',
            tier: currentRigTier,
            scale: 0.95,
          });
          colossusGroup.add(colossusRig.root);

          // Árvore sagrada de cura ao lado
          const treeRoot = new THREE.Group();
          treeRoot.position.set(1.85, 0, 0.4);
          const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3d22, roughness: 0.8 });
          const leavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.4, 8), woodMat);
          trunk.position.y = 1.2;
          const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), leavesMat);
          foliage1.position.set(0, 2.3, 0);
          foliage1.scale.set(1.1, 0.9, 1.1);
          const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), leavesMat);
          foliage2.position.set(0.15, 2.9, -0.1);
          treeRoot.add(trunk, foliage1, foliage2);
          colossusGroup.add(treeRoot);

          group = colossusGroup;

          let lastActionProgress = 0;

          group.userData.setTier = (t: number) => {
            if (t !== currentRigTier) {
              currentRigTier = t;
              colossusGroup.remove(colossusRig.root);
              colossusRig = buildStudioColossus({
                teamId: 'player',
                tier: currentRigTier,
                scale: 0.95,
              });
              colossusGroup.add(colossusRig.root);
            }
          };

          group.userData.animatePose = (dt: number) => {
            const targetTier = colossusTierRef.current;
            if (targetTier !== currentRigTier) {
              group.userData.setTier(targetTier);
            }

            const action = colossusActionRef.current;
            const t = simTime;

            if (action === 'slam') {
              lastActionProgress = (t * 0.95) % 1.0;
              if (lastActionProgress > 0.58 && lastActionProgress < 0.65) {
                spawnSpark(new THREE.Vector3(0, 0.1, 1.2));
              }
            } else if (action === 'eat_tree') {
              lastActionProgress = (t * 0.85) % 1.0;
              foliage1.rotation.y = Math.sin(t * 5.0) * 0.08;
              if (Math.random() < 0.35) {
                spawnSpark(new THREE.Vector3(1.2 + Math.random() * 0.4, 1.8, 0.3));
              }
            } else if (action === 'marcha') {
              lastActionProgress = (t * 1.2) % 1.0;
            } else {
              lastActionProgress = 0;
            }

            animateStudioColossus(colossusRig, t, dt, action, lastActionProgress);
          };
        } else if (selectedCiv === 'greek' && selectedUnit === 'hydra') {
          scene.background = new THREE.Color(0x08101e);
          scene.fog = new THREE.FogExp2(0x08101e, 0.016);
          addPedestal(3.2, 3.4, 0x1d4ed8);

          const hydraRig = buildStudioHydra({ teamId: 'player', scale: 0.95 });
          const hydraGroup = new THREE.Group();
          hydraGroup.add(hydraRig.root);

          // Soldados inimigos na arena
          const enemySoldiersRoot = new THREE.Group();
          enemySoldiersRoot.position.set(0, 0, 2.55);
          const armorMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.65, roughness: 0.35 });
          const skinMat = new THREE.MeshStandardMaterial({ color: 0xc98d62, roughness: 0.5 });
          const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.82, roughness: 0.28 });

          const soldierNodes = [-0.92, 0.0, 0.92].map((xOff, idx) => {
            const sGroup = new THREE.Group();
            sGroup.position.set(xOff, 0, idx === 1 ? 0 : -0.22);
            sGroup.rotation.y = Math.PI;

            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.75, 10), armorMat);
            torso.position.y = 0.8;
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skinMat);
            head.position.y = 1.35;
            const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 14), bronzeMat);
            shield.rotation.z = Math.PI / 2;
            shield.position.set(-0.32, 0.85, 0.08);
            sGroup.add(torso, head, shield);
            enemySoldiersRoot.add(sGroup);
            return { group: sGroup, isCenter: idx === 1, hitFlash: 0 };
          });
          hydraGroup.add(enemySoldiersRoot);

          group = hydraGroup;

          let biteTimer = 0;
          let biteImpactDone = false;
          let currentHeadCount = hydraHeadsRef.current;

          group.userData.triggerBite = () => {
            biteTimer = 0.01;
            biteImpactDone = false;
          };

          group.userData.setHeadCount = (cnt: number) => {
            hydraRig.setHeadCount(cnt);
            currentHeadCount = cnt;
          };

          group.userData.animatePose = (dt: number) => {
            const action = hydraActionModeRef.current;
            const targets = hydraTargetCountRef.current;
            const desiredHeads = hydraHeadsRef.current;
            const t = simTime;

            if (desiredHeads !== currentHeadCount) {
              group.userData.setHeadCount(desiredHeads);
            }

            soldierNodes.forEach((s) => {
              s.group.visible = s.isCenter || targets === 3;
            });

            let biteStrike = 0;
            if (action === 'combate' || action === 'manual_bite') {
              biteTimer += dt * 0.95;
              if (biteTimer >= 1.0) {
                biteTimer %= 1.0;
                biteImpactDone = false;
              }

              if (biteTimer < 0.34) {
                const p = biteTimer / 0.34;
                biteStrike = -0.35 * Math.sin(p * Math.PI * 0.5);
              } else if (biteTimer < 0.62) {
                const p = (biteTimer - 0.34) / 0.28;
                biteStrike = -0.35 + 1.35 * Math.sin(p * Math.PI * 0.5);

                if (p > 0.78 && !biteImpactDone) {
                  biteImpactDone = true;
                  soldierNodes.forEach((s) => {
                    if (s.group.visible) {
                      s.hitFlash = 0.25;
                      spawnSpark(new THREE.Vector3(s.group.position.x, 0.65, 2.55));
                    }
                  });

                  setHydraTotalHits((h) => h + 1);
                  setHydraTotalDamage((prevDmg) => {
                    const dmgStep = currentHeadCount * 30 * targets;
                    const newDmg = Math.min(1600, prevDmg + dmgStep);
                    const autoHeads = Math.min(5, 1 + Math.floor(newDmg / 400));
                    if (autoHeads > currentHeadCount) {
                      setHydraHeads(autoHeads);
                      group.userData.setHeadCount(autoHeads);
                    }
                    return newDmg;
                  });
                }
              } else {
                const rem = 1 - (biteTimer - 0.62) / 0.38;
                biteStrike = 1.0 * rem;
              }
            }

            soldierNodes.forEach((s) => {
              if (s.hitFlash > 0) {
                s.hitFlash = Math.max(0, s.hitFlash - dt);
                const knock = Math.sin((s.hitFlash / 0.25) * Math.PI) * 0.18;
                s.group.position.z = (s.isCenter ? 0 : -0.22) + knock;
              } else {
                s.group.position.z = s.isCenter ? 0 : -0.22;
              }
            });

            animateStudioHydra(hydraRig, t, dt, biteStrike, false);
          };
        } else if (selectedCiv === 'greek' && selectedUnit === 'manticore') {
          scene.background = new THREE.Color(0x0c192e);
          scene.fog = new THREE.FogExp2(0x0c192e, 0.016);
          addPedestal(3.2, 3.4, 0xfacc15);

          const manticoreRig = buildStudioManticore({ teamId: 'player', scale: 0.95 });
          const manticoreGroup = new THREE.Group();
          manticoreRig.root.position.set(0.25, 0, -1.25);
          manticoreGroup.add(manticoreRig.root);

          // Escolta Hoplita de Zeus (Linha de frente)
          const hopliteMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.88, roughness: 0.22 });
          const hopliteBlue = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45 });
          const frontlineEscort = new THREE.Group();
          frontlineEscort.position.set(-0.55, 0, 1.35);

          const hTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.75, 10), hopliteBlue);
          hTorso.position.y = 0.8;
          const hCuirass = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.26), hopliteMat);
          hCuirass.position.y = 1.18;
          const hHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), hopliteMat);
          hHead.position.y = 1.62;
          const hShield = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.05, 18), hopliteMat);
          hShield.position.set(-0.12, 1.16, 0.26);
          const hSpear = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.05, 8), hopliteMat);
          hSpear.rotation.x = 0.55;
          hSpear.position.set(0.3, 1.15, 0.25);
          frontlineEscort.add(hTorso, hCuirass, hHead, hShield, hSpear);
          manticoreGroup.add(frontlineEscort);

          // Formação de 5 Soldados Inimigos (1 Alvo Central ou Grupo Compacto)
          const enemyArmor = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.7, roughness: 0.35 });
          const enemyBronze = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.82, roughness: 0.28 });

          const enemyGroup = new THREE.Group();
          enemyGroup.position.set(0, 0, 4.15);

          const soldierOffsets = [
            { x: 0.0, z: 0.0, isolated: true },
            { x: -0.78, z: -0.25, isolated: false },
            { x: 0.78, z: -0.25, isolated: false },
            { x: -0.45, z: 0.48, isolated: false },
            { x: 0.45, z: 0.48, isolated: false },
          ];

          const enemySoldiers = soldierOffsets.map((off) => {
            const s = new THREE.Group();
            s.position.set(off.x, 0, off.z);
            s.rotation.y = Math.PI;

            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.72, 10), enemyArmor);
            torso.position.y = 0.78;
            const cuirass = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.48, 0.25), enemyBronze);
            cuirass.position.y = 1.15;
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), enemyBronze);
            head.position.y = 1.58;
            const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 16), enemyBronze);
            shield.rotation.z = Math.PI / 2;
            shield.position.set(-0.3, 1.1, 0.12);
            s.add(torso, cuirass, head, shield);
            enemyGroup.add(s);
            return { root: s, isolated: off.isolated, baseX: off.x, baseZ: off.z, hitFlash: 0 };
          });
          manticoreGroup.add(enemyGroup);

          group = manticoreGroup;

          // Projéteis de Espinhos (Rajada & Disparo Básico)
          const activeQuills: Array<{
            mesh: THREE.Mesh;
            start: THREE.Vector3;
            target: THREE.Vector3;
            progress: number;
            speed: number;
            isSpecial: boolean;
          }> = [];

          const quillProjGeo = new THREE.ConeGeometry(0.028, 0.68, 6);
          quillProjGeo.rotateX(Math.PI / 2);
          const basicQuillMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
          const volleyQuillMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

          const spawnQuill = (targetPos: THREE.Vector3, isSpecial: boolean) => {
            manticoreGroup.updateMatrixWorld(true);
            const start = new THREE.Vector3();
            manticoreRig.tailTipAnchor.getWorldPosition(start);

            const mesh = new THREE.Mesh(quillProjGeo, isSpecial ? volleyQuillMat : basicQuillMat);
            mesh.scale.setScalar(isSpecial ? 1.35 : 1.0);
            mesh.position.copy(start);
            scene.add(mesh);

            activeQuills.push({
              mesh,
              start,
              target: targetPos.clone(),
              progress: 0,
              speed: isSpecial ? 2.75 : 2.35,
              isSpecial,
            });
          };

          let volleyCooldown = 0;
          let volleyCastTimer = 0;
          let volleyFired = false;
          let basicShotTimer = 0;
          let basicShotFired = false;

          group.userData.triggerVolley = () => {
            if (volleyCooldown <= 0 && volleyCastTimer <= 0) {
              volleyCastTimer = 0.95;
              volleyFired = false;
              volleyCooldown = 12.0;
              setManticoreVolleyCooldown(12.0);
            }
          };

          group.userData.animatePose = (dt: number) => {
            const action = manticoreModeRef.current;
            const autoCast = manticoreAutoCastRef.current;
            const targetCount = manticoreTargetCountRef.current;
            const frontlineOn = manticoreFrontlineRef.current;
            const t = simTime;

            // Escolta hoplita visibilidade
            frontlineEscort.visible = frontlineOn;

            // Visibilidade dos soldados inimigos
            enemySoldiers.forEach((s) => {
              s.root.visible = targetCount === 5 ? true : s.isolated;
            });

            // Cooldown da Rajada Especial
            if (volleyCooldown > 0) {
              volleyCooldown = Math.max(0, volleyCooldown - dt);
              setManticoreVolleyCooldown(volleyCooldown);
            } else if (action === 'combate' && autoCast && volleyCastTimer <= 0) {
              group.userData.triggerVolley();
            }

            // Animação da cauda e asas
            let tailWhipForward = 0;
            let wingFlap = Math.sin(t * 2.8) * 0.14;
            let jawOpen = Math.max(0, Math.sin(t * 2.2)) * 0.08;

            if (volleyCastTimer > 0) {
              volleyCastTimer -= dt;
              const p = 1 - volleyCastTimer / 0.95;
              if (p < 0.42) {
                const prep = p / 0.42;
                tailWhipForward = -0.35 * prep;
                wingFlap = 0.55 * prep;
                jawOpen = 0.45 * prep;
              } else {
                const snap = (p - 0.42) / 0.58;
                tailWhipForward = -0.35 + 1.45 * Math.sin(Math.min(1, snap * 2.2) * Math.PI * 0.5);
                wingFlap = 0.55 - 0.85 * Math.sin(Math.min(1, snap * 2.0) * Math.PI * 0.5);
                jawOpen = 0.45 * (1 - snap);

                if (!volleyFired) {
                  volleyFired = true;
                  const visibleSoldiers = enemySoldiers.filter((s) => s.root.visible);
                  for (let q = 0; q < 9; q++) {
                    const targetSoldier = visibleSoldiers[q % visibleSoldiers.length];
                    const spreadX = (q - 4) * (targetCount === 5 ? 0.24 : 0.08);
                    const tPos = new THREE.Vector3(
                      targetSoldier.baseX + spreadX,
                      1.15 + (Math.random() - 0.5) * 0.35,
                      4.15 + targetSoldier.baseZ
                    );
                    spawnQuill(tPos, true);
                  }
                }
              }
            } else if (action === 'combate') {
              const prevShot = basicShotTimer;
              basicShotTimer = (basicShotTimer + dt * 0.95) % 1.0;
              if (basicShotTimer < prevShot) basicShotFired = false;

              if (basicShotTimer < 0.35) {
                tailWhipForward = -0.22 * (basicShotTimer / 0.35);
              } else if (basicShotTimer < 0.65) {
                const f = (basicShotTimer - 0.35) / 0.3;
                tailWhipForward = -0.22 + 0.95 * Math.sin(f * Math.PI * 0.5);
                wingFlap = Math.sin(f * Math.PI) * 0.28;
                jawOpen = Math.sin(f * Math.PI) * 0.25;

                if (f > 0.65 && !basicShotFired) {
                  basicShotFired = true;
                  const visibleSoldiers = enemySoldiers.filter((s) => s.root.visible);
                  const tgt = visibleSoldiers[Math.floor(Math.random() * visibleSoldiers.length)];
                  spawnQuill(new THREE.Vector3(tgt.baseX, 1.2, 4.15 + tgt.baseZ), false);
                }
              } else {
                const rem = 1 - (basicShotTimer - 0.65) / 0.35;
                tailWhipForward = 0.73 * rem;
              }
            }

            // Atualização dos espinhos em voo
            for (let i = activeQuills.length - 1; i >= 0; i--) {
              const q = activeQuills[i];
              q.progress += dt * q.speed;
              const p = Math.min(1, q.progress);
              const pos = new THREE.Vector3().lerpVectors(q.start, q.target, p);
              pos.y += Math.sin(p * Math.PI) * (q.isSpecial ? 0.55 : 0.38);
              q.mesh.position.copy(pos);

              const nextP = Math.min(1, p + 0.05);
              const nextPos = new THREE.Vector3().lerpVectors(q.start, q.target, nextP);
              nextPos.y += Math.sin(nextP * Math.PI) * (q.isSpecial ? 0.55 : 0.38);
              q.mesh.lookAt(nextPos);

              if (p >= 1) {
                setManticoreQuillsFired((c) => c + 1);
                setManticorePiercingDamage((d) => d + (q.isSpecial ? 45 : 28));

                spawnSpark(q.target);

                enemySoldiers.forEach((s) => {
                  if (s.root.visible && Math.hypot(s.baseX - q.target.x, 4.15 + s.baseZ - q.target.z) < 0.75) {
                    s.hitFlash = 0.22;
                  }
                });

                scene.remove(q.mesh);
                activeQuills.splice(i, 1);
              }
            }

            enemySoldiers.forEach((s) => {
              if (s.hitFlash > 0) {
                s.hitFlash = Math.max(0, s.hitFlash - dt);
                s.root.position.z = s.baseZ + Math.sin((s.hitFlash / 0.22) * Math.PI) * 0.16;
              } else {
                s.root.position.z = s.baseZ;
              }
            });

            animateStudioManticore(manticoreRig, t, dt, tailWhipForward, wingFlap, jawOpen, false);
          };
        } else if (selectedCiv === 'greek' && selectedUnit === 'cyclops') {
          scene.background = new THREE.Color(0x0c1a30);
          scene.fog = new THREE.FogExp2(0x0c1a30, 0.016);

          const cyclopsTex = createCyclopsTextures();
          const cyclopsGroup = new THREE.Group();

          // Arena mediterrânea de Zeus
          const arenaFloor = new THREE.Mesh(
            new THREE.CylinderGeometry(8.8, 9.1, 0.34, 72),
            new THREE.MeshStandardMaterial({ map: cyclopsTex.floorTex, roughness: 0.72, metalness: 0.06 })
          );
          arenaFloor.position.y = -0.17;
          arenaFloor.receiveShadow = true;
          cyclopsGroup.add(arenaFloor);

          // Colunas de mármore dórico em arco atrás
          const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });
          for (let i = 0; i < 6; i++) {
            const a = Math.PI + ((i - 2.5) / 5) * Math.PI * 0.85;
            const col = new THREE.Group();
            col.position.set(Math.cos(a) * 7.2, 0, Math.sin(a) * 7.2);

            const baseM = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.15, 0.72), marbleMat);
            baseM.position.y = 0.075;
            const shaftM = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.8, 16), marbleMat);
            shaftM.position.y = 1.55;
            const capM = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.15, 0.66), marbleMat);
            capM.position.y = 3.02;

            col.add(baseM, shaftM, capM);
            cyclopsGroup.add(col);
          }

          // Ciclope de Zeus (Escala e Rig)
          const cyclops = buildStudioCyclops({ teamId: 'player', textures: cyclopsTex });
          cyclops.root.position.set(0, 0, -0.65);
          cyclopsGroup.add(cyclops.root);

          // Luz de impacto pontual
          const impactLight = new THREE.PointLight(0xef4444, 0, 14);
          cyclopsGroup.add(impactLight);

          // Exército Inimigo (Linha de frente com soldados humanos e herói imune + Linha de trás com arqueiros)
          interface StudioEnemyUnit {
            id: number;
            name: string;
            type: 'infantry' | 'hero' | 'archer';
            validToThrow: boolean;
            isBackline: boolean;
            root: THREE.Group;
            model: THREE.Group;
            ring: THREE.Mesh;
            baseRingColor: number;
            baseX: number;
            baseZ: number;
            knockdownTimer: number;
          }

          const armyUnits: StudioEnemyUnit[] = [];
          const clickableMeshes: THREE.Mesh[] = [];

          const infMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.72, roughness: 0.32 });
          const archMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.55 });
          const heroArmorMat = new THREE.MeshStandardMaterial({
            color: 0x7e22ce,
            emissive: 0x4c1d95,
            emissiveIntensity: 0.45,
            metalness: 0.9,
            roughness: 0.2,
          });
          const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
          const skinMat = new THREE.MeshStandardMaterial({ color: 0xc98d62, roughness: 0.48 });

          const createEnemyUnit = (
            id: number,
            name: string,
            type: 'infantry' | 'hero' | 'archer',
            validToThrow: boolean,
            x: number,
            z: number,
            isBackline = false
          ) => {
            const uRoot = new THREE.Group();
            uRoot.position.set(x, 0, z);
            uRoot.rotation.y = Math.PI;

            const isHero = type === 'hero';
            const bodyMat = isHero ? heroArmorMat : type === 'archer' ? archMat : infMat;
            const sc = isHero ? 1.18 : 1.0;

            const model = new THREE.Group();
            model.scale.setScalar(sc);
            uRoot.add(model);

            const addHitPart = (
              geo: THREE.BufferGeometry,
              mat: THREE.Material,
              pos: [number, number, number],
              rot: [number, number, number] = [0, 0, 0]
            ) => {
              const m = new THREE.Mesh(geo, mat);
              m.position.set(pos[0], pos[1], pos[2]);
              m.rotation.set(rot[0], rot[1], rot[2]);
              m.castShadow = true;
              m.userData.unitId = id;
              clickableMeshes.push(m);
              model.add(m);
              return m;
            };

            addHitPart(new THREE.CylinderGeometry(0.08, 0.06, 0.65, 10), skinMat, [-0.12, 0.35, 0]);
            addHitPart(new THREE.CylinderGeometry(0.08, 0.06, 0.65, 10), skinMat, [0.12, 0.35, 0]);
            addHitPart(new THREE.CylinderGeometry(0.18, 0.26, 0.36, 12), bodyMat, [0, 0.78, 0]);
            addHitPart(new THREE.BoxGeometry(0.44, 0.48, 0.25), isHero ? heroArmorMat : bronzeMat, [0, 1.15, 0]);
            addHitPart(new THREE.SphereGeometry(0.14, 14, 14), skinMat, [0, 1.54, 0]);

            if (isHero) {
              addHitPart(new THREE.ConeGeometry(0.18, 0.34, 6), bronzeMat, [0, 1.78, 0]);
            } else if (type === 'archer') {
              addHitPart(new THREE.TorusGeometry(0.38, 0.018, 6, 16, Math.PI), bronzeMat, [-0.28, 1.15, 0.18], [0, Math.PI / 2, 0]);
            } else {
              addHitPart(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 16), bronzeMat, [-0.3, 1.1, 0.12], [0, 0, Math.PI / 2]);
            }

            const ringColor = validToThrow ? (isBackline ? 0x38bdf8 : 0x10b981) : 0xa855f7;
            const ring = new THREE.Mesh(
              new THREE.RingGeometry(0.38, 0.5, 24),
              new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.025;
            uRoot.add(ring);

            const unitObj: StudioEnemyUnit = {
              id,
              name,
              type,
              validToThrow,
              isBackline,
              root: uRoot,
              model,
              ring,
              baseRingColor: ringColor,
              baseX: x,
              baseZ: z,
              knockdownTimer: 0,
            };
            armyUnits.push(unitObj);
            cyclopsGroup.add(uRoot);
            return unitObj;
          };

          // Linha de Frente
          createEnemyUnit(1, 'Hoplita 1 (Esquerda)', 'infantry', true, -0.95, 1.85, false);
          createEnemyUnit(2, 'Hoplita 2 (Direita)', 'infantry', true, 0.85, 1.85, false);
          createEnemyUnit(3, 'Herói Imune (Mítico)', 'hero', false, 1.95, 2.15, false);

          // Linha de Trás (Arqueiros Agrupados)
          createEnemyUnit(4, 'Arqueiro 1', 'archer', true, -1.05, 4.45, true);
          createEnemyUnit(5, 'Arqueiro 2', 'archer', true, -0.35, 4.65, true);
          createEnemyUnit(6, 'Arqueiro 3', 'archer', true, 0.35, 4.65, true);
          createEnemyUnit(7, 'Arqueiro 4', 'archer', true, 1.05, 4.45, true);

          const highlightTargetRing = (targetId: number) => {
            armyUnits.forEach((u) => {
              if (u.id === targetId) {
                (u.ring.material as THREE.MeshBasicMaterial).color.setHex(0xfacc15);
                u.ring.scale.setScalar(1.25);
              } else {
                (u.ring.material as THREE.MeshBasicMaterial).color.setHex(u.baseRingColor);
                u.ring.scale.setScalar(1.0);
              }
            });
          };
          highlightTargetRing(cyclopsTargetIdRef.current);

          // Partículas de Impacto
          const PART_N = 90;
          const partPos = new Float32Array(PART_N * 3).fill(-100);
          const partVel = new Float32Array(PART_N * 3);
          const partLife = new Float32Array(PART_N);
          let partIdx = 0;

          const partGeo = new THREE.BufferGeometry();
          partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
          const partMat = new THREE.PointsMaterial({
            color: 0xfacc15,
            size: 0.16,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          cyclopsGroup.add(new THREE.Points(partGeo, partMat));

          const spawnImpactBurst = (pos: THREE.Vector3, colorHex: number, count = 24) => {
            partMat.color.setHex(colorHex);
            for (let k = 0; k < count; k++) {
              const i = partIdx;
              partIdx = (partIdx + 1) % PART_N;
              partPos[i * 3] = pos.x + (Math.random() - 0.5) * 0.4;
              partPos[i * 3 + 1] = pos.y + 0.15;
              partPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.4;
              partVel[i * 3] = (Math.random() - 0.5) * 6.0;
              partVel[i * 3 + 1] = 2.0 + Math.random() * 4.5;
              partVel[i * 3 + 2] = (Math.random() - 0.5) * 6.0;
              partLife[i] = 0.35 + Math.random() * 0.25;
            }
            impactLight.color.setHex(colorHex);
            impactLight.position.copy(pos);
            impactLight.intensity = 10.0;
          };

          const updateParticles = (dt: number) => {
            for (let i = 0; i < PART_N; i++) {
              if (partLife[i] <= 0) continue;
              partLife[i] -= dt;
              partVel[i * 3 + 1] -= 11.0 * dt;
              partPos[i * 3] += partVel[i * 3] * dt;
              partPos[i * 3 + 1] += partVel[i * 3 + 1] * dt;
              partPos[i * 3 + 2] += partVel[i * 3 + 2] * dt;
              if (partLife[i] <= 0) partPos[i * 3 + 1] = -100;
            }
            partGeo.attributes.position.needsUpdate = true;
          };

          // Ondas de Choque
          const shockWaves: Array<{ mesh: THREE.Mesh; life: number; max: number; maxScale: number }> = [];
          const spawnShockWave = (x: number, z: number, colorHex: number, maxScale = 4.5) => {
            const ring = new THREE.Mesh(
              new THREE.RingGeometry(0.4, 0.85, 48),
              new THREE.MeshBasicMaterial({
                color: colorHex,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false,
              })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(x, 0.04, z);
            cyclopsGroup.add(ring);
            shockWaves.push({ mesh: ring, life: 0.9, max: 0.9, maxScale });
          };

          // Mecânica do Arremesso & Combate
          const THROW_COOLDOWN_MAX = 20.0;
          let throwCooldown = 0;
          let throwPhase: 'none' | 'grab' | 'windup' | 'flight' = 'none';
          let throwTimer = 0;
          let grabbedUnit: StudioEnemyUnit | null = null;
          const flightStart = new THREE.Vector3();
          const flightTarget = new THREE.Vector3(0, 0.15, 4.55);

          let clubTimer = 0;
          let clubHitDone = false;
          const tmpHandPos = new THREE.Vector3();

          const triggerToast = (msg: string) => {
            setCyclopsToast(msg);
            setTimeout(() => setCyclopsToast(null), 2800);
          };

          const startThrowSequence = (unitOverride?: StudioEnemyUnit) => {
            if (throwCooldown > 0 || throwPhase !== 'none') return;

            const targetId = cyclopsTargetIdRef.current;
            const candidate = unitOverride || armyUnits.find((u) => u.id === targetId) || armyUnits[0];

            if (!candidate || !candidate.validToThrow) {
              triggerToast('⚠️ Alvo Inválido! O Ciclope só arremessa soldados humanos!');
              return;
            }

            grabbedUnit = candidate;
            throwPhase = 'grab';
            throwTimer = 0;
            throwCooldown = THROW_COOLDOWN_MAX;
            setCyclopsThrowCooldown(THROW_COOLDOWN_MAX);
          };

          cyclopsGroup.userData.triggerThrow = () => {
            startThrowSequence();
          };

          cyclopsGroup.userData.selectTarget = (uid: number) => {
            const u = armyUnits.find((unit) => unit.id === uid);
            if (!u) return;
            if (!u.validToThrow) {
              triggerToast('⚠️ Herói / Unidade Mítica! O Ciclope só pode arremessar soldados humanos.');
              return;
            }
            setCyclopsTargetId(uid);
            highlightTargetRing(uid);
            if (throwCooldown <= 0 && throwPhase === 'none') {
              startThrowSequence(u);
            } else {
              triggerToast(`🎯 Alvo selecionado: ${u.name} (Aguardando recarga)`);
            }
          };

          cyclopsGroup.userData.toggleElder = () => {
            const nextElder = !cyclops.isElder();
            cyclops.setElderState(nextElder);
            setCyclopsIsElder(nextElder);
            spawnShockWave(0, -0.65, nextElder ? 0xef4444 : 0xfacc15, 4.8);
            spawnImpactBurst(new THREE.Vector3(0, 2.0, -0.65), nextElder ? 0xef4444 : 0xfacc15, 25);
          };

          group = cyclopsGroup;

          cyclopsGroup.userData.animatePose = (dt: number) => {
            const action = cyclopsModeRef.current;
            const autoCast = cyclopsAutoCastRef.current;
            const isElderDesired = cyclopsIsElderRef.current;
            const t = simTime;

            if (cyclops.isElder() !== isElderDesired) {
              cyclops.setElderState(isElderDesired);
            }

            // 1. Cooldown de 20 segundos do Arremesso
            if (throwCooldown > 0) {
              throwCooldown = Math.max(0, throwCooldown - dt);
              setCyclopsThrowCooldown(throwCooldown);
            } else if (action === 'combate' && autoCast && throwPhase === 'none') {
              startThrowSequence();
            }

            // 2. Animação do Ciclope
            const heavyBreath = Math.sin(t * 2.0) * 0.025;
            let torsoPitch = 0.02;
            let torsoYaw = 0;
            let rootZ = -0.65;

            if (throwPhase !== 'none' && grabbedUnit) {
              throwTimer += dt;

              if (throwPhase === 'grab') {
                // Fase 1 (0 -> 0.55s): Avança e agarra o soldado com a mão esquerda
                const p = Math.min(1, throwTimer / 0.55);
                rootZ = -0.65 + p * 1.15;
                torsoPitch = 0.42 * p;
                torsoYaw = 0.35 * p;

                cyclops.leftArm.arm.rotation.set(-1.35 * p, 0.25, -0.25);
                cyclops.leftArm.elbow.rotation.set(-0.35 * p, 0, 0);
                cyclops.rightArm.arm.rotation.set(-0.25, 0.25, 0.45);
                cyclops.rightArm.elbow.rotation.set(-0.55, 0, 0);

                if (p >= 1) {
                  throwPhase = 'windup';
                  throwTimer = 0;
                }
              } else if (throwPhase === 'windup') {
                // Fase 2 (0 -> 0.50s): Ergue o soldado acima do ombro
                const p = Math.min(1, throwTimer / 0.5);
                rootZ = 0.5 - p * 0.65;
                torsoPitch = 0.42 - 0.65 * p;
                torsoYaw = 0.35 - 0.85 * p;

                cyclops.leftArm.arm.rotation.set(-2.45 * p - 1.35 * (1 - p), -0.2, -0.35);
                cyclops.leftArm.elbow.rotation.set(-0.65 * p, 0, 0);

                cyclops.root.updateMatrixWorld(true);
                cyclops.grabAnchor.getWorldPosition(tmpHandPos);
                grabbedUnit.root.position.copy(tmpHandPos);
                grabbedUnit.model.rotation.set(Math.PI * 0.5, t * 6, 0);

                if (p >= 1) {
                  throwPhase = 'flight';
                  throwTimer = 0;
                  flightStart.copy(tmpHandPos);
                  flightTarget.set(0, 0.15, 4.55);
                }
              } else if (throwPhase === 'flight') {
                // Fase 3 (0 -> 0.55s): Arremesso parabólico sobre os arqueiros
                const p = Math.min(1, throwTimer / 0.55);
                torsoPitch = -0.23 + 0.55 * Math.sin(p * Math.PI * 0.5);
                torsoYaw = -0.5 + 0.95 * Math.sin(p * Math.PI * 0.5);

                cyclops.leftArm.arm.rotation.set(-2.45 + 1.85 * p, 0.3, -0.25);
                cyclops.leftArm.elbow.rotation.set(-0.2, 0, 0);

                const curPos = new THREE.Vector3().lerpVectors(flightStart, flightTarget, p);
                curPos.y += Math.sin(p * Math.PI) * 2.45;
                grabbedUnit.root.position.copy(curPos);
                grabbedUnit.model.rotation.set(p * Math.PI * 4, p * 5, p * 3);

                if (p >= 1) {
                  const isElder = cyclops.isElder();
                  const blastRadius = isElder ? 2.15 : 1.45;
                  const colorHex = isElder ? 0xef4444 : 0xfacc15;

                  spawnShockWave(flightTarget.x, flightTarget.z, colorHex, isElder ? 5.6 : 4.0);
                  spawnImpactBurst(flightTarget, colorHex, isElder ? 34 : 22);

                  let hitCount = 0;
                  armyUnits.forEach((u) => {
                    const dist = Math.hypot(u.baseX - flightTarget.x, u.baseZ - flightTarget.z);
                    if (u === grabbedUnit || dist <= blastRadius) {
                      u.knockdownTimer = 3.5;
                      hitCount++;
                    }
                  });

                  setCyclopsTotalDamage((prev) => prev + 65 * hitCount);
                  grabbedUnit = null;
                  throwPhase = 'none';
                }
              }
            } else if (action === 'combate') {
              // Ataque Normal com Clava ou Garfo de Guerra
              const prevClub = clubTimer;
              clubTimer = (clubTimer + dt * 0.85) % 1.0;
              if (clubTimer < prevClub) clubHitDone = false;

              rootZ = 0.25;
              if (clubTimer < 0.42) {
                const p = clubTimer / 0.42;
                torsoYaw = -0.35 * p;
                torsoPitch = -0.08 * p;
                cyclops.rightArm.arm.rotation.set(-2.1 * p - 0.35 * (1 - p), 0.15, 0.32);
                cyclops.rightArm.elbow.rotation.set(-0.75 * p, 0, 0);
              } else if (clubTimer < 0.72) {
                const p = (clubTimer - 0.42) / 0.3;
                const slam = Math.sin(p * Math.PI * 0.5);
                torsoYaw = -0.35 + 0.75 * slam;
                torsoPitch = -0.08 + 0.3 * slam;
                cyclops.rightArm.arm.rotation.set(-2.1 + 1.75 * slam, 0.12, 0.25);
                cyclops.rightArm.elbow.rotation.set(-0.75 + 0.55 * slam, 0, 0);

                if (slam > 0.88 && !clubHitDone) {
                  clubHitDone = true;
                  const isElder = cyclops.isElder();
                  const hitPos = new THREE.Vector3(0, 0.45, 1.75);
                  spawnImpactBurst(hitPos, isElder ? 0xef4444 : 0xfacc15, isElder ? 22 : 12);
                  if (isElder) {
                    spawnShockWave(0, 1.75, 0xef4444, 3.4);
                    setCyclopsTotalDamage((prev) => prev + 75);
                  } else {
                    setCyclopsTotalDamage((prev) => prev + 40);
                  }
                }
              } else {
                const rem = 1 - (clubTimer - 0.72) / 0.28;
                torsoYaw = 0.4 * rem;
                torsoPitch = 0.22 * rem;
                cyclops.rightArm.arm.rotation.set(-0.35, 0.15, 0.3);
                cyclops.rightArm.elbow.rotation.set(-0.35, 0, 0);
              }

              cyclops.leftArm.arm.rotation.set(-0.45, -0.25, -0.35);
              cyclops.leftArm.elbow.rotation.set(-0.65, 0, 0);
            } else {
              // Vigília
              torsoYaw = Math.sin(t * 0.45) * 0.1;
              cyclops.rightArm.arm.rotation.set(-0.35, 0.15, 0.3 + Math.sin(t * 1.5) * 0.02);
              cyclops.rightArm.elbow.rotation.set(-0.42, 0, 0);
              cyclops.leftArm.arm.rotation.set(-0.35, -0.2, -0.32 - Math.cos(t * 1.5) * 0.02);
              cyclops.leftArm.elbow.rotation.set(-0.55, 0, 0);
            }

            cyclops.root.position.z = THREE.MathUtils.damp(cyclops.root.position.z, rootZ, 7, dt);
            cyclops.body.position.y = 1.02 * cyclops.scaleFactor + heavyBreath;
            cyclops.torso.rotation.set(torsoPitch, torsoYaw, 0);
            cyclops.auraRing.rotation.z += dt * 0.45;

            // 3. Atualização dos soldados derrubados
            armyUnits.forEach((u) => {
              if (u === grabbedUnit) return;
              if (u.knockdownTimer > 0) {
                u.knockdownTimer = Math.max(0, u.knockdownTimer - dt);
                u.root.position.set(u.baseX, 0.18, u.baseZ + 0.35);
                u.model.rotation.set(-Math.PI * 0.48, 0, 0.25);
              } else {
                u.root.position.set(u.baseX, 0, u.baseZ);
                u.model.rotation.set(0, 0, 0);
              }
            });

            // 4. Ondas de Choque
            for (let i = shockWaves.length - 1; i >= 0; i--) {
              const sw = shockWaves[i];
              sw.life -= dt;
              const k = Math.max(0, sw.life / sw.max);
              sw.mesh.scale.setScalar(1 + (1 - k) * sw.maxScale);
              (sw.mesh.material as THREE.MeshBasicMaterial).opacity = 0.95 * k;
              if (sw.life <= 0) {
                cyclopsGroup.remove(sw.mesh);
                sw.mesh.geometry.dispose();
                (sw.mesh.material as THREE.Material).dispose();
                shockWaves.splice(i, 1);
              }
            }

            impactLight.intensity = Math.max(0, impactLight.intensity - dt * 22);
            updateParticles(dt);
          };
        } else {
          scene.background = defaultBg.clone();
          scene.fog = new THREE.FogExp2(0x0b0e14, 0.015);
          addPedestal(1.55, 1.72, 0xd4af37);

          group = createUnitMesh(
            selectedUnit as UnitKind,
            'player',
            pal,
            !isSoftwareGl,
            selectedCiv,
            selectedMajorGod
          );
          group.userData.setArmorTier?.(activeTier);
          group.userData.setMode?.('3d');
          if (selectedUnit === 'titan') {
            group.scale.setScalar(0.28);
            group.position.y = -0.04;
          }
        }
      }

      scene.add(group);
      entityMeshRef.current = group;

      // Apply canonical OrbitControls framing for the newly built subject
      const framing = getFramingForSubject(focusDivineRef.current);
      baseDistanceRef.current = framing.baseDist;
      controls.target.set(framing.target[0], framing.target[1], framing.target[2]);
      camera.position.set(
        framing.target[0] + framing.offset[0],
        framing.target[1] + framing.offset[1],
        framing.target[2] + framing.offset[2]
      );
      controls.update();
      setZoomPercent(100);
    };

    buildCurrentEntity();

    let frameId = 0;
    let timeoutId = 0;
    let lastTime = performance.now();
    let simTime = 0;
    let lastBoltTime = 0;
    let lastSlamTime = 0;
    let lastHadesFlameTime = 0;
    let lastMoodApplied: LightingMood | null = null;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        timeoutId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timeoutId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timeoutId = window.setTimeout(cb, 80);
        }
      };
      timeoutId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      simTime += dt;

      // Apply Lighting Mood dynamically without rebuilding scene
      const activeMood = lightingMoodRef.current;
      if (activeMood !== lastMoodApplied) {
        lastMoodApplied = activeMood;
        const lp = LIGHTING_PRESETS[activeMood];
        hemi.color.setHex(lp.hemiSky);
        hemi.groundColor.setHex(lp.hemiGround);
        hemi.intensity = lp.hemiIntensity;
        keyLight.color.setHex(lp.keyColor);
        keyLight.intensity = lp.keyIntensity;
        keyLight.position.set(lp.keyPos[0], lp.keyPos[1], lp.keyPos[2]);
        rimLight.color.setHex(lp.rimColor);
        rimLight.intensity = lp.rimIntensity;
        rimLight.position.set(lp.rimPos[0], lp.rimPos[1], lp.rimPos[2]);
        renderer.toneMappingExposure = lp.exposure;
      }

      // Smooth damped camera preset transitions
      const tr = camTransitionRef.current;
      if (tr.active) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, tr.pos.x, 7.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, tr.pos.y, 7.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, tr.pos.z, 7.5, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, tr.target.x, 7.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, tr.target.y, 7.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, tr.target.z, 7.5, dt);
        if (camera.position.distanceToSquared(tr.pos) < 0.002 && controls.target.distanceToSquared(tr.target) < 0.001) {
          tr.active = false;
        }
      }

      controls.autoRotate = !isSoftwareGl && !tr.active && autoRotateRef.current;
      controls.update();

      // Category-specific procedural animations
      if (galleryCategory === 'map' && dioramaHandleRef.current) {
        const h = dioramaHandleRef.current;
        h.waterMesh.position.y = -0.68 * 0.58 + Math.sin(simTime * 1.4) * 0.018;
        if (h.floraGroup.visible && h.floraCanopies.length > 0) {
          for (let i = 0; i < h.floraCanopies.length; i++) {
            h.floraCanopies[i].rotation.z = Math.sin(simTime * 1.6 + i * 0.7) * 0.04;
          }
        }
        if (h.faunaGroup.visible && h.faunaMeshes.length > 0) {
          for (let i = 0; i < h.faunaMeshes.length; i++) {
            const fm = h.faunaMeshes[i];
            const ud = fm.userData;
            if (ud.bodyGroup) {
              (ud.bodyGroup as THREE.Object3D).position.y = Math.sin(simTime * 2.3 + i) * 0.015;
            }
          }
        }
      } else if (galleryCategory === 'fauna' && entityMeshRef.current) {
        const ud = entityMeshRef.current.userData;
        const leftLeg = ud.leftLeg as THREE.Object3D | undefined;
        const rightLeg = ud.rightLeg as THREE.Object3D | undefined;
        const backLeftLeg = ud.backLeftLeg as THREE.Object3D | undefined;
        const backRightLeg = ud.backRightLeg as THREE.Object3D | undefined;
        const bodyGroup = ud.bodyGroup as THREE.Object3D | undefined;
        const mode = faunaAnimRef.current;

        if (mode === 'idle') {
          if (leftLeg) leftLeg.rotation.x = 0;
          if (rightLeg) rightLeg.rotation.x = 0;
          if (backLeftLeg) backLeftLeg.rotation.x = 0;
          if (backRightLeg) backRightLeg.rotation.x = 0;
          if (bodyGroup) {
            bodyGroup.rotation.x = 0;
            bodyGroup.position.y = Math.sin(simTime * 2.2) * 0.018;
          }
        } else if (mode === 'walk') {
          const ph = simTime * 4.8;
          const sw = Math.sin(ph) * 0.34;
          if (leftLeg) leftLeg.rotation.x = sw;
          if (backRightLeg) backRightLeg.rotation.x = sw;
          if (rightLeg) rightLeg.rotation.x = -sw;
          if (backLeftLeg) backLeftLeg.rotation.x = -sw;
          if (bodyGroup) {
            bodyGroup.rotation.x = 0;
            bodyGroup.position.y = Math.abs(Math.sin(ph)) * 0.03;
          }
        } else {
          // Gallop / Run
          const ph = simTime * 9.5;
          const frontSw = Math.sin(ph) * 0.56;
          const backSw = -Math.sin(ph + 0.35) * 0.56;
          if (leftLeg) leftLeg.rotation.x = frontSw;
          if (rightLeg) rightLeg.rotation.x = frontSw * 0.9;
          if (backLeftLeg) backLeftLeg.rotation.x = backSw;
          if (backRightLeg) backRightLeg.rotation.x = backSw * 0.9;
          if (bodyGroup) {
            bodyGroup.rotation.x = Math.cos(ph) * 0.065;
            bodyGroup.position.y = Math.abs(Math.sin(ph)) * 0.065;
          }
        }
      } else if (galleryCategory === 'flora' && entityMeshRef.current) {
        const canopy = entityMeshRef.current.userData.oakCanopyGroup as THREE.Object3D | undefined;
        if (canopy) {
          if (floraWindRef.current) {
            canopy.rotation.z = Math.sin(simTime * 1.45) * 0.045;
            canopy.rotation.x = Math.cos(simTime * 1.1) * 0.03;
          } else {
            canopy.rotation.set(0, 0, 0);
          }
        }
      } else if (
        (galleryCategory === 'utensil' || galleryCategory === 'relic') &&
        artifactHandleRef.current?.animate
      ) {
        artifactHandleRef.current.animate(simTime, dt, artifactAuraRef.current);
      } else if (galleryCategory === 'unit') {
        // Olympus clouds
        if (zeusClouds.length > 0) {
          for (const c of zeusClouds) {
            c.g.rotation.y += dt * 0.04;
          }
        }

        // Poseidon waves
        if (poseidonOceanPos && poseidonOceanInitY) {
          for (let i = 0; i < poseidonOceanPos.count; i++) {
            const x = poseidonOceanPos.getX(i);
            const z = poseidonOceanPos.getZ(i);
            const wave = Math.sin(simTime * 2.2 + x * 0.6) * Math.cos(simTime * 1.8 + z * 0.6) * 0.14;
            poseidonOceanPos.setY(i, poseidonOceanInitY[i] + wave);
          }
          poseidonOceanPos.needsUpdate = true;
        }

        // Hades runes & pillar flames
        if (hadesEnv) {
          for (const rg of hadesEnv.runeRings) {
            rg.rotation.z += dt * 0.08;
          }
          for (const pf of hadesEnv.pillarFlames) {
            const fl = 1 + Math.sin(simTime * 6.0 + pf.phase) * 0.12;
            pf.f1.scale.set(fl, fl * 1.1, fl);
            pf.f2.scale.set(fl * 0.95, fl, fl * 0.95);
          }
        }

        // God Ability FX
        if (selectedCiv === 'greek' && selectedUnit === 'zeus') {
          const zm = zeusModeRef.current;
          _tmpColor.setHex(zm === 'tempestade' ? 0x1e2e38 : 0x7fb8bd);
          (scene.background as THREE.Color).copy(_tmpColor);

          const interval = zm === 'tempestade' ? 0.65 : zm === 'raios' ? 1.4 : 999;
          if (simTime - lastBoltTime > interval) {
            lastBoltTime = simTime;
            const targetX = (Math.random() - 0.5) * 6.0;
            const targetZ = (Math.random() - 0.5) * 6.0;
            _v3A.set(targetX + (Math.random() - 0.5) * 2, 7.5, targetZ + (Math.random() - 0.5) * 2);
            _v3B.set(targetX, 0.05, targetZ);
            triggerZeusBolt(_v3A, _v3B);
          }
        } else if (selectedCiv === 'greek' && selectedUnit === 'poseidon') {
          const pm = poseidonModeRef.current;
          if (pm === 'golpe') {
            tsunamiGroup.visible = false;
            if (simTime - lastSlamTime > 2.4) {
              lastSlamTime = simTime;
              triggerPoseidonSlam(0, 0);
            }
          } else if (pm === 'tsunami') {
            tsunamiGroup.visible = true;
            tsunamiZ += dt * 6.0;
            tsunamiGroup.position.z = tsunamiZ;
            for (const puff of crestPuffs) {
              puff.mesh.position.y = puff.baseY + Math.sin(simTime * 8 + puff.phase) * 0.14;
            }
            if (Math.random() < 0.4) {
              spawnSpray((Math.random() - 0.5) * 10, 3.8, tsunamiZ + 1.8, 3.8, 1.5, 3.5);
            }
            if (tsunamiZ > 12.0) tsunamiZ = -12.0;
          } else {
            tsunamiGroup.visible = false;
          }
        } else if (selectedCiv === 'greek' && selectedUnit === 'hades') {
          const hm = hadesModeRef.current;
          if (hm === 'portal') {
            (scene.background as THREE.Color).setHex(0x040308);
            portalGroup.visible = true;
            portalDisc.rotation.z += dt * 0.45;
            portalInnerRing.rotation.z -= dt * 0.65;
            for (const w of hadesWraiths) {
              const ang = simTime * w.speed + w.phase;
              w.baseHeight += dt * w.vSpeed;
              if (w.baseHeight > 4.2) {
                w.baseHeight = 0.1;
                w.phase = Math.random() * Math.PI * 2;
              }
              w.group.position.set(Math.cos(ang) * w.radius, w.baseHeight, Math.sin(ang) * w.radius);
              w.group.rotation.y = -ang + Math.PI / 2;
              w.group.rotation.x = Math.sin(simTime * 3.5 + w.phase) * 0.25;
            }
          } else {
            (scene.background as THREE.Color).setHex(0x090b14);
            portalGroup.visible = false;
          }

          if (hm === 'chama' && simTime - lastHadesFlameTime > 0.68) {
            lastHadesFlameTime = simTime;
            if (hadesBidentAnchor) {
              hadesBidentAnchor.getWorldPosition(_v3A);
              triggerTartarusFlame(_v3A);
            }
          }
        }

        // Procedural character / god pose animation
        if (entityMeshRef.current?.userData.animatePose) {
          const moving = animStateRef.current === 'move';
          const attacking = animStateRef.current === 'attack';
          const attackT = attacking ? (simTime % 1.2) / 1.2 : null;
          const actionState = attacking
            ? selectedUnit === 'villager'
              ? 'gather'
              : 'attack'
            : moving
            ? 'move'
            : 'idle';
          entityMeshRef.current.userData.animatePose(dt, moving, 3.2, attackT, actionState, 'wood');
        }
      }

      // Particle Physics (Sparks, Spray, Ash, Bolts, Shockwaves, Geysers, Tartarus)
      for (let i = 0; i < SPARK_N; i++) {
        if (sparkLife[i] > 0) {
          sparkLife[i] -= dt;
          sparkVel[i * 3 + 1] -= 9.5 * dt;
          sparkPos[i * 3] += sparkVel[i * 3] * dt;
          sparkPos[i * 3 + 1] += sparkVel[i * 3 + 1] * dt;
          sparkPos[i * 3 + 2] += sparkVel[i * 3 + 2] * dt;
          if (sparkLife[i] <= 0) sparkPos[i * 3 + 1] = -100;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      for (let i = 0; i < SPRAY_N; i++) {
        if (sprayLife[i] > 0) {
          sprayLife[i] -= dt;
          sprayVel[i * 3 + 1] -= 9.0 * dt;
          sprayPos[i * 3] += sprayVel[i * 3] * dt;
          sprayPos[i * 3 + 1] += sprayVel[i * 3 + 1] * dt;
          sprayPos[i * 3 + 2] += sprayVel[i * 3 + 2] * dt;
          if (sprayLife[i] <= 0) sprayPos[i * 3 + 1] = -100;
        }
      }
      sprayGeo.attributes.position.needsUpdate = true;

      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.life -= dt;
        const alpha = Math.max(0, b.life / b.max);
        b.meshes.forEach((m) => {
          if (!Array.isArray(m.material)) m.material.opacity = alpha;
        });
        if (b.life <= 0) {
          b.meshes.forEach((m) => {
            scene.remove(m);
            m.geometry.dispose();
            if (!Array.isArray(m.material)) m.material.dispose();
          });
          bolts.splice(i, 1);
        }
      }

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        if (sw.delay > 0) {
          sw.delay -= dt;
          continue;
        }
        sw.life -= dt;
        const progress = 1 - sw.life / sw.max;
        const sc = 1 + progress * 7.5;
        sw.mesh.scale.set(sc, sc, 1);
        if (!Array.isArray(sw.mesh.material)) {
          sw.mesh.material.opacity = Math.max(0, sw.life / sw.max);
        }
        if (sw.life <= 0) {
          scene.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          if (!Array.isArray(sw.mesh.material)) sw.mesh.material.dispose();
          shockwaves.splice(i, 1);
        }
      }

      for (let i = geysers.length - 1; i >= 0; i--) {
        const g = geysers[i];
        if (g.delay > 0) {
          g.delay -= dt;
          continue;
        }
        if (!g.erupted) {
          g.erupted = true;
          for (let s = 0; s < 18; s++) spawnSpray(g.gx, 1.2, g.gz, 2.5, 3.2, 4.0);
        }
        g.life -= dt;
        const p = 1 - g.life / g.max;
        if (p < 0.28) {
          g.mesh.scale.set(1.1, (p / 0.28) * 1.5, 1.1);
        } else {
          const fade = g.life / (g.max * 0.72);
          g.mesh.scale.set(1.0 + (1 - fade) * 0.4, 1.5 * fade, 1.0 + (1 - fade) * 0.4);
          if (!Array.isArray(g.mesh.material)) g.mesh.material.opacity = Math.max(0, fade * 0.85);
        }
        if (g.life <= 0) {
          scene.remove(g.mesh);
          g.mesh.geometry.dispose();
          if (!Array.isArray(g.mesh.material)) g.mesh.material.dispose();
          geysers.splice(i, 1);
        }
      }

      if (ashPoints.visible) {
        for (let i = 0; i < ASH_N; i++) {
          if (i < 70 && ashLife[i] < 100) {
            if (ashLife[i] <= 0) continue;
            ashLife[i] -= dt;
            ashVel[i * 3 + 1] -= 4.2 * dt;
            ashPos[i * 3] += ashVel[i * 3] * dt;
            ashPos[i * 3 + 1] += ashVel[i * 3 + 1] * dt;
            ashPos[i * 3 + 2] += ashVel[i * 3 + 2] * dt;
            if (ashLife[i] <= 0) ashPos[i * 3 + 1] = -100;
          } else {
            ashPos[i * 3] += Math.sin(simTime + i) * 0.12 * dt;
            ashPos[i * 3 + 1] += ashVel[i * 3 + 1] * dt;
            ashPos[i * 3 + 2] += Math.cos(simTime + i) * 0.12 * dt;
            if (ashPos[i * 3 + 1] > 5.5) {
              ashPos[i * 3 + 1] = 0.05;
              ashPos[i * 3] = (Math.random() - 0.5) * 12;
              ashPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
            }
          }
        }
        ashGeo.attributes.position.needsUpdate = true;
      }

      for (let i = tartarusBolts.length - 1; i >= 0; i--) {
        const b = tartarusBolts[i];
        b.progress += dt * b.speed;
        const p = Math.min(1, b.progress);
        b.mesh.position.lerpVectors(b.start, b.target, p);
        b.mesh.position.y += Math.sin(p * Math.PI) * 0.6;
        b.mesh.rotation.y += dt * 10;
        if (p >= 1) {
          eruptHellfire(b.target);
          scene.remove(b.mesh);
          tartarusBolts.splice(i, 1);
        }
      }

      for (let i = hellfirePools.length - 1; i >= 0; i--) {
        const hf = hellfirePools[i];
        hf.life -= dt;
        const k = Math.max(0, hf.life / hf.max);
        hf.pool.scale.setScalar(1 + (1 - k) * 0.8);
        (hf.pool.material as THREE.Material).opacity = 0.9 * k;
        hf.pillar.scale.set(1 + (1 - k) * 0.5, 1 + (1 - k) * 0.8, 1 + (1 - k) * 0.5);
        (hf.pillar.material as THREE.Material).opacity = 0.78 * k;
        if (hf.life <= 0) {
          scene.remove(hf.pool);
          scene.remove(hf.pillar);
          hf.pool.geometry.dispose();
          (hf.pool.material as THREE.Material).dispose();
          hf.pillar.geometry.dispose();
          (hf.pillar.material as THREE.Material).dispose();
          hellfirePools.splice(i, 1);
        }
      }

      for (let i = hadesShadowTrails.length - 1; i >= 0; i--) {
        const st = hadesShadowTrails[i];
        st.life -= dt;
        const k = Math.max(0, st.life / st.max);
        st.mesh.scale.setScalar(1 + (1 - k) * 2.2);
        (st.mesh.material as THREE.Material).opacity = 0.62 * k;
        if (st.life <= 0) {
          scene.remove(st.mesh);
          st.mesh.geometry.dispose();
          (st.mesh.material as THREE.Material).dispose();
          hadesShadowTrails.splice(i, 1);
        }
      }

      if (flashLight.intensity > 0) flashLight.intensity = Math.max(0, flashLight.intensity - dt * 24);
      if (impactLight.intensity > 0) impactLight.intensity = Math.max(0, impactLight.intensity - dt * 18);
      if (hadesBlastLight.intensity > 0) hadesBlastLight.intensity = Math.max(0, hadesBlastLight.intensity - dt * 20);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      controlsRef.current = null;
      cameraRef.current = null;

      if (dioramaHandleRef.current) {
        dioramaHandleRef.current.dispose();
        dioramaHandleRef.current = null;
      }
      if (artifactHandleRef.current) {
        artifactHandleRef.current.dispose();
        artifactHandleRef.current = null;
      }
      localDisposables.forEach((d) => d.dispose());

      bolts.forEach((b) =>
        b.meshes.forEach((m) => {
          m.geometry.dispose();
          if (!Array.isArray(m.material)) m.material.dispose();
        })
      );
      shockwaves.forEach((sw) => {
        sw.mesh.geometry.dispose();
        if (!Array.isArray(sw.mesh.material)) sw.mesh.material.dispose();
      });
      geysers.forEach((g) => {
        g.mesh.geometry.dispose();
        if (!Array.isArray(g.mesh.material)) g.mesh.material.dispose();
      });
      hellfirePools.forEach((hf) => {
        hf.pool.geometry.dispose();
        (hf.pool.material as THREE.Material).dispose();
        hf.pillar.geometry.dispose();
        (hf.pillar.material as THREE.Material).dispose();
      });
      hadesShadowTrails.forEach((st) => {
        st.mesh.geometry.dispose();
        (st.mesh.material as THREE.Material).dispose();
      });

      sparkGeo.dispose();
      sparkMat.dispose();
      sprayGeo.dispose();
      sprayMat.dispose();
      ashGeo.dispose();
      ashMat.dispose();
      tsuGeo.dispose();
      tsuMat.dispose();
      puffGeo.dispose();
      puffMat.dispose();
      tartarusCoreGeo.dispose();
      tartarusCoreMat.dispose();
      tartarusAuraGeo.dispose();
      tartarusAuraMat.dispose();
      portalDiscGeo.dispose();
      portalDiscMat.dispose();
      portalInnerGeo.dispose();
      portalInnerMat.dispose();
      wraithSkullGeo.dispose();
      wraithTailGeo.dispose();
      wraithMatA.dispose();
      wraithMatB.dispose();
      envRT.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [
    isOpen,
    galleryCategory,
    selectedUnit,
    selectedBuilding,
    activeTier,
    buildingAge,
    selectedCiv,
    selectedMajorGod,
    selectedMap,
    mapSeedTick,
    selectedFauna,
    selectedFloraId,
    floraVariantSeed,
    selectedUtensilId,
    selectedRelicId,
    showHumanScale,
  ]);

  if (!isOpen) return null;

  const activeUnitInfo =
    currentCivUnits.find((u) => u.id === selectedUnit) || currentCivUnits[0];
  const activeBuildingInfo =
    currentCivBuildings.find((b) => b.id === selectedBuilding) || currentCivBuildings[0];
  const activeUnitStats = UNIT_STATS[selectedUnit];
  const activeBuildingStats = BUILDING_STATS[selectedBuilding];
  const showGreekArmorTiers =
    galleryCategory === 'unit' &&
    selectedCiv === 'greek' &&
    (selectedUnit === 'hoplite' ||
      selectedUnit === 'hipaspist' ||
      selectedUnit === 'myrmidon' ||
      selectedUnit === 'peltast' ||
      selectedUnit === 'archer' ||
      selectedUnit === 'gastraphetes' ||
      selectedUnit === 'cavalry' ||
      selectedUnit === 'prodromos');

  const isGodUnit = galleryCategory === 'unit' && isGreekOrEgyptianGod(selectedUnit, selectedCiv);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090f] text-[#f3efe6] overflow-hidden select-none">
      {/* 1. Full-Viewport Dedicated 3D Studio Canvas */}
      <div
        ref={mount3DRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {cyclopsToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/95 border border-amber-400 text-amber-200 text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md animate-bounce pointer-events-none">
          {cyclopsToast}
        </div>
      )}

      {/* 2. Top Studio Header Bar (hidden in Cinema Mode except restore pill) */}
      {cinemaMode ? (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCinemaMode(false)}
            className="flex items-center gap-2 rounded-lg border border-[#d4af37]/45 bg-[#0e131d]/92 px-3 py-1.5 text-xs font-semibold text-[#f5e3b0] shadow-lg hover:bg-[#182032] cursor-pointer"
          >
            <Minimize2 className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Mostrar Interface (H)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Fechar Galeria 3D (Esc)"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0e131d]/92 text-[#d1d5db] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <header className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-20 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 rounded-xl border border-[#d4af37]/30 bg-[#0d121c]/95 px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
          {/* Brand Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 text-[#f5e3b0]">
              <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-display text-xs sm:text-sm font-bold text-[#f5e3b0] truncate">
                Estúdio 3D · Galeria Mitológica
              </div>
              <div className="text-[10px] text-[#9ca3af] hidden md:block truncate">
                Arraste para orbitar · Scroll para zoom · Botão direito para deslocar
              </div>
            </div>
          </div>

          {/* 7 Studio Categories */}
          <nav className="order-3 lg:order-none w-full lg:w-auto flex items-center gap-1 rounded-lg border border-white/10 bg-[#080b12] p-1 overflow-x-auto max-w-full">
            {(
              [
                { id: 'unit', label: 'Unidades & Deuses', icon: Crown },
                { id: 'building', label: 'Construções', icon: Building2 },
                { id: 'map', label: 'Mapas & Relevo', icon: Mountain },
                { id: 'fauna', label: 'Fauna', icon: Compass },
                { id: 'flora', label: 'Flora & Recursos', icon: Trees },
                { id: 'utensil', label: 'Utensílios', icon: Hammer },
                { id: 'relic', label: 'Relíquias', icon: Sparkles },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = galleryCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryCategory(tab.id)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#d4af37] text-[#090c12] shadow'
                      : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Studio Camera, Lighting & Window Actions */}
          <div className="flex items-center gap-1.5">
            {/* Camera Presets */}
            <div className="hidden lg:flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#080b12] p-0.5">
              <Camera className="h-3.5 w-3.5 text-[#d4af37] mx-1.5" />
              {(
                [
                  { id: 'iso', label: 'Iso' },
                  { id: 'front', label: 'Frente' },
                  { id: 'side', label: 'Lado' },
                  { id: 'top', label: 'Topo' },
                ] as const
              ).map((camBtn) => (
                <button
                  key={camBtn.id}
                  type="button"
                  onClick={() => triggerCameraPreset(camBtn.id)}
                  className="rounded px-2 py-1 text-[10px] font-semibold text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  {camBtn.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => triggerCameraPreset('iso')}
                title="Resetar Câmera"
                className="rounded p-1 text-[#d4af37] hover:bg-white/10 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Lighting Mood Selector */}
            <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#080b12] p-0.5">
              {(
                [
                  { id: 'studio', label: 'Estúdio', icon: Sparkles },
                  { id: 'day', label: 'Dia', icon: Sun },
                  { id: 'dusk', label: 'Ocaso', icon: Flame },
                  { id: 'night', label: 'Noite', icon: Moon },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = lightingMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setLightingMood(m.id)}
                    title={`Iluminação: ${LIGHTING_PRESETS[m.id].label}`}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden xl:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCinemaMode(true)}
              title="Modo Cinema (Tecla H)"
              className="flex h-8 items-center gap-1 rounded-lg border border-white/12 bg-[#141a28] px-2.5 text-[11px] font-semibold text-[#d1d5db] hover:border-[#d4af37]/40 hover:text-white cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Cinema</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Fechar Galeria 3D (Esc)"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-[#141a28] text-[#9ca3af] hover:border-rose-400/40 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
      )}

      {/* 3. Left Collapsible Catalog Drawer */}
      {!cinemaMode && (
        <aside
          className={`absolute top-[92px] sm:top-24 lg:top-20 bottom-16 sm:bottom-20 left-2 sm:left-3 z-20 flex items-start transition-transform duration-200 pointer-events-none ${
            leftDrawerOpen ? 'translate-x-0' : '-translate-x-[calc(100%-2.25rem)]'
          }`}
        >
          <div className="pointer-events-auto flex h-full w-[min(268px,calc(100vw-3.25rem))] sm:w-80 flex-col rounded-xl border border-white/12 bg-[#0d121c]/95 shadow-[0_18px_48px_rgba(0,0,0,0.75)] overflow-hidden">
            {/* Drawer Content based on Category */}
            {(galleryCategory === 'unit' || galleryCategory === 'building') && (
              <div className="border-b border-white/10 p-3 space-y-2.5 bg-[#111827]/70">
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      { id: 'greek', name: 'Gregos' },
                      { id: 'egyptian', name: 'Egípcios' },
                      { id: 'norse', name: 'Nórdicos' },
                      { id: 'atlantean', name: 'Atlantes' },
                    ] as const
                  ).map((civ) => (
                    <button
                      key={civ.id}
                      type="button"
                      onClick={() => handleSelectCiv(civ.id)}
                      className={`rounded-md py-1.5 px-1 text-[10px] font-bold border transition cursor-pointer ${
                        selectedCiv === civ.id
                          ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5e3b0]'
                          : 'border-white/10 bg-[#0c111b] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {civ.name}
                    </button>
                  ))}
                </div>

                {/* Major Gods */}
                <div className="grid grid-cols-3 gap-1">
                  {(MAJOR_GODS_BY_CIV[selectedCiv] || MAJOR_GODS_BY_CIV.greek!).map((god) => {
                    const isSel = selectedMajorGod.toLowerCase() === god.id.toLowerCase();
                    return (
                      <button
                        key={god.id}
                        type="button"
                        onClick={() => handleSelectMajorGod(god.id)}
                        style={{
                          borderColor: isSel ? god.color : undefined,
                          backgroundColor: isSel ? `${god.color}22` : undefined,
                          color: isSel ? god.color : undefined,
                        }}
                        className={`rounded-md py-1 px-1.5 text-[11px] font-bold border transition cursor-pointer truncate ${
                          isSel
                            ? 'shadow'
                            : 'border-white/10 bg-[#0c111b] text-[#9ca3af] hover:text-white'
                        }`}
                        title={god.title}
                      >
                        {god.name}
                      </button>
                    );
                  })}
                </div>

                {/* Unit Subcategory Filter */}
                {galleryCategory === 'unit' && (
                  <div className="flex items-center gap-1 overflow-x-auto pt-0.5">
                    {(
                      [
                        { id: 'all', label: 'Todos' },
                        { id: 'god', label: 'Deuses' },
                        { id: 'hero', label: 'Heróis' },
                        { id: 'troop', label: 'Tropas' },
                        { id: 'myth', label: 'Míticas' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setUnitFilter(f.id)}
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer whitespace-nowrap ${
                          unitFilter === f.id
                            ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                            : 'bg-[#090d16] text-[#9ca3af] hover:text-white border border-white/5'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {galleryCategory === 'map' && (
              <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                    Mapas & Biomas ({filteredMaps.length})
                  </span>
                  <MapIcon className="h-3.5 w-3.5 text-[#d4af37]" />
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'base', label: 'Clássicos' },
                      { id: 'titans', label: 'Titans' },
                      { id: 'bonus', label: 'Bônus' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMapExpansionFilter(f.id)}
                      className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                        mapExpansionFilter === f.id
                          ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5e3b0]'
                          : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {galleryCategory === 'fauna' && (
              <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                    Fauna Selvagem ({filteredFauna.length})
                  </span>
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      { id: 'all', label: 'Todas' },
                      { id: 'pacific', label: 'Pacífica' },
                      { id: 'aggressive', label: 'Feroz / Retalia' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFaunaFilter(f.id)}
                      className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                        faunaFilter === f.id
                          ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
                          : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {galleryCategory === 'flora' && (
              <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                    Flora & Recursos ({filteredFlora.length})
                  </span>
                  <Trees className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'tree', label: 'Árvores (10)' },
                      { id: 'resource', label: 'Recursos (5)' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFloraFilter(f.id)}
                      className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                        floraFilter === f.id
                          ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
                          : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {galleryCategory === 'utensil' && (
              <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                    Utensílios & Forja (<span className="font-mono-num">{filteredUtensils.length}</span>)
                  </span>
                  <Hammer className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'work', label: 'Trabalho' },
                      { id: 'domestic', label: 'Domésticos' },
                      { id: 'ritual', label: 'Ritual' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setUtensilFilter(f.id)}
                      className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                        utensilFilter === f.id
                          ? 'border-amber-400/70 bg-amber-500/20 text-amber-200'
                          : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {galleryCategory === 'relic' && (
              <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                    Relíquias Sagradas (<span className="font-mono-num">{filteredRelics.length}</span>)
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {(
                    [
                      { id: 'all', label: 'Todas' },
                      { id: 'greek', label: 'Gregos' },
                      { id: 'egyptian', label: 'Egípcios' },
                      { id: 'norse', label: 'Nórdicos' },
                      { id: 'atlantean', label: 'Atlantes' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRelicPantheonFilter(f.id)}
                      className={`rounded py-1 text-[9px] font-semibold border transition cursor-pointer ${
                        relicPantheonFilter === f.id
                          ? 'border-sky-400/70 bg-sky-500/20 text-sky-200'
                          : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scrollable Item Catalog */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {galleryCategory === 'unit' &&
                filteredUnits.map((u) => {
                  const isSelected = selectedUnit === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUnit(u.id)}
                      className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5e3b0]'
                          : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="font-display text-xs font-bold truncate">{u.name}</span>
                        <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[#9ca3af]">
                          {u.category === 'god'
                            ? 'Deus'
                            : u.category === 'hero'
                            ? 'Herói'
                            : u.category === 'myth'
                            ? 'Mítico'
                            : 'Tropa'}
                        </span>
                      </div>
                      <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-2">{u.role}</span>
                    </button>
                  );
                })}

              {galleryCategory === 'building' &&
                currentCivBuildings.map((b) => {
                  const isSelected = selectedBuilding === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBuilding(b.id)}
                      className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5e3b0]'
                          : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                      }`}
                    >
                      <span className="font-display text-xs font-bold">{b.name}</span>
                      <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-2">{b.role}</span>
                    </button>
                  );
                })}

              {galleryCategory === 'map' &&
                filteredMaps.map((m) => {
                  const isSelected = selectedMap === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMap(m.id)}
                      className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5e3b0]'
                          : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                            style={{ backgroundColor: m.terrainTint }}
                          />
                          <span className="font-display text-xs font-bold truncate">{m.name}</span>
                        </div>
                        <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-[#cbd5e1]">
                          {m.biomeLabel}
                        </span>
                      </div>
                      <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{m.subtitle}</span>
                    </button>
                  );
                })}

              {galleryCategory === 'fauna' &&
                filteredFauna.map((f) => {
                  const isSelected = selectedFauna === f.kind;
                  return (
                    <button
                      key={f.kind}
                      type="button"
                      onClick={() => setSelectedFauna(f.kind)}
                      className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                          : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                            style={{ backgroundColor: formatHex(f.coatHex) }}
                          />
                          <span className="font-display text-xs font-bold truncate">{f.labelPt}</span>
                        </div>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 font-mono-num text-[9px] font-semibold ${
                            f.retaliates
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {f.foodAmount} Alimento
                        </span>
                      </div>
                      <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{f.biome}</span>
                    </button>
                  );
                })}

              {galleryCategory === 'flora' &&
                filteredFlora.map((f) => {
                  const isSelected = selectedFloraId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFloraId(f.id)}
                      className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                          : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="font-display text-xs font-bold truncate">{f.name}</span>
                        <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 font-mono-num text-[9px] text-[#cbd5e1]">
                          {f.category === 'tree' ? 'Árvore' : 'Recurso'}
                        </span>
                      </div>
                      <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{f.yieldLabel}</span>
                    </button>
                  );
                })}

              {galleryCategory === 'utensil' &&
                filteredUtensils.map((u) => {
                  const isSelected = selectedUtensilId === u.id;
                  const catLabel =
                    u.category === 'work'
                      ? 'Trabalho'
                      : u.category === 'ritual'
                      ? 'Ritual'
                      : 'Doméstico';
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUtensilId(u.id)}
                      className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 text-amber-100'
                          : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                            style={{ backgroundColor: formatHex(u.accentHex) }}
                          />
                          <span className="font-display text-xs font-bold truncate">{u.name}</span>
                        </div>
                        <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-[#cbd5e1]">
                          {catLabel}
                        </span>
                      </div>
                      <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{u.usage}</span>
                    </button>
                  );
                })}

              {galleryCategory === 'relic' &&
                filteredRelics.map((r) => {
                  const isSelected = selectedRelicId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRelicId(r.id)}
                      className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/15 text-sky-100'
                          : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                            style={{ backgroundColor: formatHex(r.auraHex) }}
                          />
                          <span className="font-display text-xs font-bold truncate">{r.name}</span>
                        </div>
                        <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-[#cbd5e1]">
                          {PANTHEONS[r.pantheon].name}
                        </span>
                      </div>
                      <span className="mt-0.5 text-[10px] text-amber-300/90 line-clamp-1">{r.bonusLabel}</span>
                    </button>
                  );
                })}
            </div>

            {/* Footer Tier Evolution Strip inside Left Drawer (Building T1-T5 or Greek Unit T1-T4) */}
            {galleryCategory === 'building' && (
              <div className="border-t border-amber-500/25 bg-[#090d16] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Evolução Arquitetônica (T1–T5)
                  </span>
                  <span className="font-mono-num text-[10px] text-amber-200">
                    {buildingAge === 5 ? 'T5 Metrópole' : `Era ${buildingAge}`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {BUILDING_ERA_SPECS.map((spec) => {
                    const isSel = buildingAge === spec.tier;
                    return (
                      <button
                        key={spec.tier}
                        type="button"
                        onClick={() => {
                          setBuildingAge(spec.tier);
                          if (spec.tier <= 4) {
                            onSelectTier(spec.tier as 1 | 2 | 3 | 4);
                          }
                        }}
                        title={`${spec.title} — ${getEraSubtitle(spec.tier, selectedCiv)}`}
                        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border py-1 transition cursor-pointer ${
                          isSel
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-white/10 bg-[#101624] text-[#9ca3af] hover:text-white'
                        }`}
                      >
                        <EraIcon age={spec.tier} pantheon={selectedCiv} size={22} active={isSel} />
                        <span className="font-mono-num text-[9px] font-bold">T{spec.tier}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showGreekArmorTiers && (
              <div className="border-t border-amber-500/25 bg-[#090d16] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Armadura & UV Grega (T1–T4)
                  </span>
                  <span className="font-mono-num text-[10px] text-amber-200">
                    {AOM_HOPLITE_UV_TIERS[activeTier as HopliteArmorTier]?.name}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {([1, 2, 3, 4] as HopliteArmorTier[]).map((t) => {
                    const spec = AOM_HOPLITE_UV_TIERS[t];
                    const isSel = activeTier === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onSelectTier(t)}
                        title={`${spec.name}: ${spec.subtitle}`}
                        className={`rounded-md border py-1.5 text-center transition cursor-pointer ${
                          isSel
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-white/10 bg-[#101624] text-[#9ca3af] hover:text-white'
                        }`}
                      >
                        <span className="font-mono-num text-[11px] font-bold">T{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Collapse Toggle Handle */}
          <button
            type="button"
            onClick={() => setLeftDrawerOpen((v) => !v)}
            title={leftDrawerOpen ? 'Recolher Catálogo' : 'Abrir Catálogo'}
            className="pointer-events-auto ml-1.5 mt-2 flex h-9 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0d121c]/95 text-[#d4af37] shadow-lg hover:bg-[#172033] cursor-pointer"
          >
            {leftDrawerOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </aside>
      )}

      {/* 4. Right Collapsible Geographic / Spec Card */}
      {!cinemaMode && (
        <aside
          className={`hidden md:flex absolute top-24 lg:top-20 bottom-20 right-3 z-20 items-start transition-transform duration-200 pointer-events-none ${
            specDrawerOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2.25rem)]'
          }`}
        >
          <button
            type="button"
            onClick={() => setSpecDrawerOpen((v) => !v)}
            title={specDrawerOpen ? 'Recolher Ficha Técnica' : 'Abrir Ficha Técnica'}
            className="pointer-events-auto mr-1.5 mt-2 flex h-9 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0d121c]/95 text-[#d4af37] shadow-lg hover:bg-[#172033] cursor-pointer"
          >
            {specDrawerOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div className="pointer-events-auto flex max-h-full w-72 flex-col rounded-xl border border-white/12 bg-[#0d121c]/95 p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.75)] overflow-y-auto space-y-3">
            {galleryCategory === 'map' && (
              <>
                <div className="border-b border-white/10 pb-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                      Geografia & Terreno
                    </span>
                    <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#cbd5e1]">
                      {selectedMapCfg.expansion}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                    {selectedMapCfg.name}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                    {selectedMapCfg.subtitle}
                  </p>
                </div>

                {/* Relief Telemetry */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                    <div className="text-[9px] uppercase text-[#9ca3af]">Altitude</div>
                    <div className="mt-0.5 font-mono-num text-xs font-bold text-amber-300">
                      {dioramaMetrics.minHeight}..{dioramaMetrics.maxHeight}m
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                    <div className="text-[9px] uppercase text-[#9ca3af]">Água/Lava</div>
                    <div className="mt-0.5 font-mono-num text-xs font-bold text-sky-300">
                      {dioramaMetrics.waterCoveragePct}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                    <div className="text-[9px] uppercase text-[#9ca3af]">Bioma</div>
                    <div className="mt-0.5 text-[10px] font-bold text-emerald-300 truncate">
                      {dioramaMetrics.effectiveBiome}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                      Flora Geográfica
                    </div>
                    <div className="mt-0.5 text-[#e2e8f0]">{selectedMapCfg.floraLabel}</div>
                  </div>
                  <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      Fauna Nativa
                    </div>
                    <div className="mt-0.5 text-[#e2e8f0]">{selectedMapCfg.faunaLabel}</div>
                  </div>
                  <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-sky-300">
                      Climas do Mapa
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedMapCfg.weatherPool.map((w) => (
                        <span
                          key={w}
                          className="rounded border border-white/10 bg-[#090d16] px-1.5 py-0.5 text-[10px] text-[#cbd5e1]"
                        >
                          {WEATHER_LABELS[w] ?? w}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedMapCfg.specialRule && (
                    <div className="rounded-lg border border-amber-400/35 bg-amber-500/10 p-2.5">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                        Regra Especial
                      </div>
                      <div className="mt-0.5 text-[#fde68a]">
                        {SPECIAL_RULE_LABELS[selectedMapCfg.specialRule] ?? selectedMapCfg.specialRule}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terrain & Hydrology Swatches */}
                <div className="border-t border-white/10 pt-2.5">
                  <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Paleta Geológica
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: selectedMapCfg.terrainTint }}
                      />
                      <span className="text-[#9ca3af]">Solo</span>
                    </div>
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(selectedMapCfg.cliffHex) }}
                      />
                      <span className="text-[#9ca3af]">Encosta</span>
                    </div>
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(selectedMapCfg.waterColorHex) }}
                      />
                      <span className="text-[#9ca3af]">Água</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {galleryCategory === 'fauna' && (
              <>
                <div className="border-b border-white/10 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Ficha Zoológica 3D
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        selectedFaunaCfg.retaliates
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {selectedFaunaCfg.retaliates ? 'Retalia' : 'Pacífica'}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                    {selectedFaunaCfg.labelPt}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                    {selectedFaunaCfg.role}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                    <div className="text-[9px] uppercase text-[#9ca3af]">Vida (HP)</div>
                    <div className="font-mono-num text-sm font-bold text-emerald-300">
                      {selectedFaunaCfg.maxHp}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                    <div className="text-[9px] uppercase text-[#9ca3af]">Alimento</div>
                    <div className="font-mono-num text-sm font-bold text-amber-300">
                      {selectedFaunaCfg.foodAmount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                    <div className="text-[9px] uppercase text-[#9ca3af]">Ataque</div>
                    <div className="font-mono-num text-sm font-bold text-rose-300">
                      {selectedFaunaCfg.attack}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                    <div className="text-[9px] uppercase text-[#9ca3af]">Velocidade</div>
                    <div className="font-mono-num text-sm font-bold text-sky-300">
                      {selectedFaunaCfg.speed.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5 text-[11px]">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-sky-300">
                    Biomas de Ocorrência
                  </div>
                  <div className="mt-0.5 text-[#e2e8f0]">{selectedFaunaCfg.biome}</div>
                </div>

                <div className="border-t border-white/10 pt-2.5">
                  <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">
                    Pelagem & Anatomia
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(selectedFaunaCfg.coatHex) }}
                      />
                      <span className="text-[#9ca3af]">Pelagem</span>
                    </div>
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(selectedFaunaCfg.underbellyHex) }}
                      />
                      <span className="text-[#9ca3af]">Ventre</span>
                    </div>
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(selectedFaunaCfg.hornOrTuskHex) }}
                      />
                      <span className="text-[#9ca3af]">Chifre/Presa</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {galleryCategory === 'flora' && (
              <>
                <div className="border-b border-white/10 pb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    {selectedFloraItem.category === 'tree' ? 'Espécie Botânica' : 'Nó de Recurso & Marco'}
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                    {selectedFloraItem.name}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                    {selectedFloraItem.desc}
                  </p>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                    <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Rendimento</div>
                    <div className="mt-0.5 font-mono-num text-xs font-bold text-amber-300">
                      {selectedFloraItem.yieldLabel}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                    <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Afinidade Geográfica</div>
                    <div className="mt-0.5 text-[#e2e8f0]">{selectedFloraItem.biomeAffinity}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                    <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Variação Morfológica</div>
                    <div className="mt-0.5 font-mono-num text-xs text-emerald-300">
                      Semente #{floraVariantSeed} (de 5 variações)
                    </div>
                  </div>
                </div>
              </>
            )}

            {galleryCategory === 'utensil' && (
              <>
                <div className="border-b border-white/10 pb-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Utensílio & Artefato Civil
                    </span>
                    <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#cbd5e1]">
                      {selectedUtensilCfg.category === 'work'
                        ? 'Trabalho'
                        : selectedUtensilCfg.category === 'ritual'
                        ? 'Ritual'
                        : 'Doméstico'}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                    {selectedUtensilCfg.name}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                    {selectedUtensilCfg.desc}
                  </p>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                    <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Afinidade Cultural</div>
                    <div className="mt-0.5 font-semibold text-amber-200">{selectedUtensilCfg.civAffinity}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                    <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Função / Uso</div>
                    <div className="mt-0.5 text-[#e2e8f0]">{selectedUtensilCfg.usage}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                    <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Materiais</div>
                    <div className="mt-0.5 text-[#cbd5e1]">{selectedUtensilCfg.materialLabel}</div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-[#9ca3af]">Acabamento</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-6 rounded-sm border border-white/25"
                      style={{ backgroundColor: formatHex(selectedUtensilCfg.accentHex) }}
                    />
                    <span className="font-mono-num text-[#cbd5e1]">
                      {formatHex(selectedUtensilCfg.accentHex)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {galleryCategory === 'relic' && (
              <>
                <div className="border-b border-white/10 pb-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                      {PANTHEONS[selectedRelicCfg.pantheon].name} · {selectedRelicCfg.tierLabel}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                    {selectedRelicCfg.name}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                    {selectedRelicCfg.desc}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-400/35 bg-amber-500/10 p-2.5 text-[11px]">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                    Bônus no Templo
                  </div>
                  <div className="mt-0.5 font-semibold text-[#fde68a]">{selectedRelicCfg.bonusLabel}</div>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                    <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Origem Mitológica</div>
                    <div className="mt-0.5 text-[#e2e8f0]">{selectedRelicCfg.origin}</div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-[#9ca3af]">Aura Mítica</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-6 rounded-sm border border-white/25"
                      style={{ backgroundColor: formatHex(selectedRelicCfg.auraHex) }}
                    />
                    <span className="font-mono-num text-[#cbd5e1]">
                      {formatHex(selectedRelicCfg.auraHex)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {galleryCategory === 'building' && (
              <>
                <div className="border-b border-white/10 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                      {PANTHEONS[selectedCiv].name} · {selectedMajorGod}
                    </span>
                    <span className="font-mono-num rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                      T{buildingAge}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                    {activeBuildingInfo.name}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                    {activeBuildingInfo.role}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px]">
                  {selectedCiv === 'greek' && selectedBuilding === 'temple' ? (
                    (() => {
                      const rawGod = selectedMajorGod.toLowerCase();
                      const godKey = (
                        rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus'
                      ) as GreekTempleGodKey;
                      const info = GREEK_TEMPLE_THEMES[godKey]?.tiers[buildingAge];
                      return (
                        <>
                          <div className="font-bold text-amber-300">
                            {info?.title || `Templo Grego • Tier ${buildingAge}`}
                          </div>
                          <div className="mt-0.5 text-[#fde68a]/90">
                            {info?.sub || BUILDING_ERA_SPECS[buildingAge - 1]?.desc}
                          </div>
                        </>
                      );
                    })()
                  ) : selectedCiv === 'egyptian' && selectedBuilding === 'temple' ? (
                    (() => {
                      const rawGod = selectedMajorGod.toLowerCase();
                      const godKey = (
                        rawGod.includes('isis') ? 'isis' : rawGod.includes('set') ? 'set' : 'ra'
                      ) as EgyptianTempleGodKey;
                      const info = EGYPT_TEMPLE_THEMES[godKey]?.tiers[buildingAge];
                      return (
                        <>
                          <div className="font-bold text-amber-300">
                            {info?.title || `Templo Egípcio • Tier ${buildingAge}`}
                          </div>
                          <div className="mt-0.5 text-[#fde68a]/90">
                            {info?.sub || BUILDING_ERA_SPECS[buildingAge - 1]?.desc}
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <div className="font-bold text-amber-300">
                        {BUILDING_ERA_SPECS[buildingAge - 1]?.title}
                      </div>
                      <div className="mt-0.5 text-[#fde68a]/90">
                        {BUILDING_ERA_SPECS[buildingAge - 1]?.desc}
                      </div>
                    </>
                  )}
                </div>

                {activeBuildingStats && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">Vida Base</div>
                      <div className="font-mono-num text-sm font-bold text-emerald-300">
                        {activeBuildingStats.maxHp}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">População</div>
                      <div className="font-mono-num text-sm font-bold text-sky-300">
                        +{activeBuildingStats.popBonus ?? 0}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">Ataque</div>
                      <div className="font-mono-num text-sm font-bold text-rose-300">
                        {activeBuildingStats.attack ?? 0}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">Raio</div>
                      <div className="font-mono-num text-sm font-bold text-amber-300">
                        {activeBuildingStats.radius.toFixed(1)}m
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {galleryCategory === 'unit' && (
              <>
                <div className="border-b border-white/10 pb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                    {PANTHEONS[selectedCiv].name} · {selectedMajorGod}
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                    {activeUnitInfo.name}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                    {activeUnitInfo.role}
                  </p>
                </div>

                {activeUnitStats && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">Vida (HP)</div>
                      <div className="font-mono-num text-sm font-bold text-emerald-300">
                        {activeUnitStats.maxHp}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">Ataque</div>
                      <div className="font-mono-num text-sm font-bold text-rose-300">
                        {activeUnitStats.attack}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">Alcance</div>
                      <div className="font-mono-num text-sm font-bold text-amber-300">
                        {activeUnitStats.range.toFixed(1)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                      <div className="text-[9px] uppercase text-[#9ca3af]">Velocidade</div>
                      <div className="font-mono-num text-sm font-bold text-sky-300">
                        {activeUnitStats.speed.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )}

                {showGreekArmorTiers && (() => {
                  const activeSpec =
                    AOM_HOPLITE_UV_TIERS[activeTier as HopliteArmorTier] ?? AOM_HOPLITE_UV_TIERS[3];
                  return (
                    <div className="border-t border-white/10 pt-2.5 space-y-2">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        Paleta UV Tier {activeTier} · {activeSpec.name}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                        <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                          <div
                            className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                            style={{ backgroundColor: formatHex(activeSpec.armorHex) }}
                          />
                          <span className="text-[#9ca3af]">Couraça</span>
                        </div>
                        <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                          <div
                            className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                            style={{ backgroundColor: formatHex(activeSpec.accentHex) }}
                          />
                          <span className="text-[#9ca3af]">Detalhe</span>
                        </div>
                        <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                          <div
                            className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                            style={{ backgroundColor: formatHex(activeSpec.greaveHex) }}
                          />
                          <span className="text-[#9ca3af]">Grevas</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </aside>
      )}

      {/* 5. Compact Bottom Studio Control Dock */}
      {!cinemaMode && (
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 rounded-xl border border-white/15 bg-[#0d121c]/95 px-2 py-1.5 sm:px-2.5 sm:py-2 shadow-[0_16px_42px_rgba(0,0,0,0.85)] max-w-[96vw] overflow-x-auto">
          {/* Category-Specific Controls */}
          {galleryCategory === 'unit' && selectedUnit === 'zeus' && selectedCiv === 'greek' ? (
            <>
              <button
                type="button"
                onClick={() => setZeusMode('pairar')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  zeusMode === 'pairar'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Pairar</span>
              </button>
              <button
                type="button"
                onClick={() => setZeusMode('voar')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  zeusMode === 'voar'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                }`}
              >
                <Wind className="h-3.5 w-3.5" />
                <span>Voar</span>
              </button>
              <button
                type="button"
                onClick={() => setZeusMode('raios')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  zeusMode === 'raios'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Lançar Raios</span>
              </button>
              <button
                type="button"
                onClick={() => setZeusMode('tempestade')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  zeusMode === 'tempestade'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                }`}
              >
                <CloudLightning className="h-3.5 w-3.5" />
                <span>Tempestade</span>
              </button>
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'poseidon' && selectedCiv === 'greek' ? (
            <>
              <button
                type="button"
                onClick={() => setPoseidonMode('conduzido')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  poseidonMode === 'conduzido'
                    ? 'bg-teal-400 text-slate-950 shadow'
                    : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                }`}
              >
                <Waves className="h-3.5 w-3.5" />
                <span>Conduzido</span>
              </button>
              <button
                type="button"
                onClick={() => setPoseidonMode('correnteza')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  poseidonMode === 'correnteza'
                    ? 'bg-teal-400 text-slate-950 shadow'
                    : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                }`}
              >
                <Wind className="h-3.5 w-3.5" />
                <span>Correnteza</span>
              </button>
              <button
                type="button"
                onClick={() => setPoseidonMode('golpe')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  poseidonMode === 'golpe'
                    ? 'bg-teal-400 text-slate-950 shadow'
                    : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                }`}
              >
                <Swords className="h-3.5 w-3.5" />
                <span>Golpe Tridente</span>
              </button>
              <button
                type="button"
                onClick={() => setPoseidonMode('tsunami')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  poseidonMode === 'tsunami'
                    ? 'bg-teal-400 text-slate-950 shadow'
                    : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tsunami</span>
              </button>
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'hades' && selectedCiv === 'greek' ? (
            <>
              <button
                type="button"
                onClick={() => setHadesMode('reinar')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hadesMode === 'reinar'
                    ? 'bg-emerald-400 text-slate-950 shadow'
                    : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Reinar</span>
              </button>
              <button
                type="button"
                onClick={() => setHadesMode('marcha')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hadesMode === 'marcha'
                    ? 'bg-purple-400 text-slate-950 shadow'
                    : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/15'
                }`}
              >
                <Wind className="h-3.5 w-3.5" />
                <span>Marcha Sombria</span>
              </button>
              <button
                type="button"
                onClick={() => setHadesMode('chama')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hadesMode === 'chama'
                    ? 'bg-emerald-400 text-slate-950 shadow'
                    : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Chama Tártaro</span>
              </button>
              <button
                type="button"
                onClick={() => setHadesMode('portal')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hadesMode === 'portal'
                    ? 'bg-purple-400 text-slate-950 shadow'
                    : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/15'
                }`}
              >
                <Skull className="h-3.5 w-3.5" />
                <span>Portal Almas</span>
              </button>
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'artemis' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'vigilia', label: 'Vigília Lunar', icon: Compass },
                  { id: 'cacada', label: 'Caçada Ágil', icon: Wind },
                  { id: 'raizes', label: 'Raízes Espinhosas', icon: Sparkles },
                  { id: 'alcateia', label: 'Alcateia Noturna', icon: Crown },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setArtemisMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      artemisMode === m.id
                        ? 'bg-sky-400 text-slate-950 shadow'
                        : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'hefesto' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'forja', label: 'Forja Divina', icon: Flame },
                  { id: 'martelo', label: 'Golpe Bigorna', icon: Swords },
                  { id: 'automato', label: 'Autômato Ouro', icon: Crown },
                  { id: 'erupcao', label: 'Erupção Lemnos', icon: Zap },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setHefestoMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      hefestoMode === m.id
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'dionisio' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'banquete', label: 'Banquete', icon: Crown },
                  { id: 'danca', label: 'Dança Báquica', icon: Wind },
                  { id: 'vinhas', label: 'Vinhas', icon: Sparkles },
                  { id: 'extase', label: 'Êxtase', icon: Zap },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDionisioMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      dionisioMode === m.id
                        ? 'bg-purple-500 text-white shadow'
                        : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'afrodite' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'graca', label: 'Graça Divina', icon: Crown },
                  { id: 'danca', label: 'Pétalas', icon: Wind },
                  { id: 'encanto', label: 'Encanto', icon: Sparkles },
                  { id: 'mare', label: 'Maré Paixão', icon: Waves },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAfroditeMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      afroditeMode === m.id
                        ? 'bg-rose-500 text-white shadow'
                        : 'border border-rose-400/30 text-rose-200 hover:bg-rose-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'apolo' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'pairar', label: 'Pairar Solar', icon: Sun },
                  { id: 'voo', label: 'Voo Radiante', icon: Wind },
                  { id: 'flecha', label: 'Flecha Divina', icon: Sparkles },
                  { id: 'helio', label: 'Chama Hélio', icon: Flame },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setApoloMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      apoloMode === m.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'ares' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'postura', label: 'Postura Guerra', icon: Shield },
                  { id: 'investida', label: 'Investida', icon: Wind },
                  { id: 'sismico', label: 'Sísmico', icon: Zap },
                  { id: 'furia', label: 'Fúria Sangue', icon: Flame },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAresMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      aresMode === m.id
                        ? 'bg-red-600 text-white shadow'
                        : 'border border-red-400/30 text-red-200 hover:bg-red-500/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'atena' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'guardia', label: 'Guardiã', icon: Shield },
                  { id: 'avanco', label: 'Avanço Tático', icon: Wind },
                  { id: 'egide', label: 'Égide', icon: Sparkles },
                  { id: 'furia', label: 'Fúria Estratégica', icon: Flame },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAtenaMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      atenaMode === m.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'hermes' && selectedCiv === 'greek' ? (
            <>
              {(
                [
                  { id: 'flutuar', label: 'Flutuar', icon: Wind },
                  { id: 'velocidade', label: 'Velocidade', icon: Zap },
                  { id: 'rajada', label: 'Rajada Vento', icon: Sparkles },
                  { id: 'relampago', label: 'Passo Relâmpago', icon: Flame },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setHermesMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      hermesMode === m.id
                        ? 'bg-teal-500 text-slate-950 shadow'
                        : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'isis' && selectedCiv === 'egyptian' ? (
            <>
              {(
                [
                  { id: 'majestade', label: 'Majestade Alada', icon: Wind },
                  { id: 'heka', label: 'Magia Heka', icon: Sparkles },
                  { id: 'ankh', label: 'Sopro Ankh', icon: Shield },
                  { id: 'sopdet', label: 'Estrela Sopdet', icon: Flame },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setIsisMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isisMode === m.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'set' && selectedCiv === 'egyptian' ? (
            <>
              {(
                [
                  { id: 'senhor', label: 'Senhor Caos', icon: Crown },
                  { id: 'tempestade', label: 'Tempestade Areia', icon: Wind },
                  { id: 'deserto', label: 'Ira Deserto', icon: Zap },
                  { id: 'monstro', label: 'Horda Monstros', icon: Skull },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSetMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      setMode === m.id
                        ? 'bg-orange-500 text-white shadow'
                        : 'border border-orange-400/30 text-orange-200 hover:bg-orange-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedUnit === 'ra' && selectedCiv === 'egyptian' ? (
            <>
              {(
                [
                  { id: 'gloria', label: 'Glória Solar', icon: Sun },
                  { id: 'bencao', label: 'Bênção Faraó', icon: Sparkles },
                  { id: 'chuva', label: 'Chuva Dourada', icon: Wind },
                  { id: 'ira', label: 'Raio de Rá', icon: Zap },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRaMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      raMode === m.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'greek' && selectedUnit === 'hoplite' ? (
            <>
              {(
                selectedMajorGod === 'Poseidon'
                  ? [
                      { id: 'guarda', label: 'Guarda Marinha', icon: Shield },
                      { id: 'marcha', label: 'Marcha', icon: Play },
                      { id: 'corrida', label: 'Corrida', icon: Wind },
                      { id: 'ataque', label: 'Estocada Tridente', icon: Zap },
                      { id: 'defesa', label: 'Muralha de Coral', icon: Shield },
                    ]
                  : selectedMajorGod === 'Hades'
                  ? [
                      { id: 'guarda', label: 'Guarda Sombria', icon: Shield },
                      { id: 'marcha', label: 'Marcha', icon: Play },
                      { id: 'corrida', label: 'Corrida', icon: Wind },
                      { id: 'ataque', label: 'Estocada Bidente', icon: Zap },
                      { id: 'defesa', label: 'Égide do Tártaro', icon: Shield },
                    ]
                  : [
                      { id: 'guarda', label: 'Guarda Falange', icon: Shield },
                      { id: 'marcha', label: 'Marcha', icon: Play },
                      { id: 'corrida', label: 'Corrida', icon: Wind },
                      { id: 'ataque', label: 'Ataque Lança', icon: Zap },
                      { id: 'defesa', label: 'Defesa Escudo', icon: Shield },
                    ]
              ).map((act) => {
                const Icon = act.icon;
                const isPoseidon = selectedMajorGod === 'Poseidon';
                const isHades = selectedMajorGod === 'Hades';
                const activeColor = isPoseidon
                  ? 'bg-teal-400 text-slate-950 shadow'
                  : isHades
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-amber-400 text-slate-950 shadow';
                const inactiveColor = isPoseidon
                  ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                  : isHades
                  ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                  : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setHopliteAction(act.id as ZeusHopliteAction)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      hopliteAction === act.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'greek' && selectedUnit === 'villager' ? (
            <>
              {/* Controles de Gênero do Aldeão */}
              {(
                [
                  { id: 'ambos', label: 'Ambos', icon: Users },
                  { id: 'homem', label: 'Homem', icon: User },
                  { id: 'mulher', label: 'Mulher', icon: User },
                ] as const
              ).map((g) => {
                const Icon = g.icon;
                const isPoseidon = selectedMajorGod === 'Poseidon';
                const isHades = selectedMajorGod === 'Hades';
                const activeColor = isPoseidon
                  ? 'bg-teal-400 text-slate-950 shadow'
                  : isHades
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-amber-400 text-slate-950 shadow';
                const inactiveColor = isPoseidon
                  ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                  : isHades
                  ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                  : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setVillagerGender(g.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      villagerGender === g.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{g.label}</span>
                  </button>
                );
              })}
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Tarefas e Ferramentas dos Aldeões */}
              {(
                [
                  { id: 'vigilia', label: 'Vigília', icon: Shield },
                  { id: 'andar', label: 'Andando', icon: Play },
                  { id: 'madeira', label: 'Madeira', icon: Trees },
                  { id: 'ouro', label: 'Ouro', icon: Sparkles },
                  { id: 'fruta', label: 'Frutas', icon: Sun },
                  { id: 'construir', label: 'Construir', icon: Hammer },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const isPoseidon = selectedMajorGod === 'Poseidon';
                const isHades = selectedMajorGod === 'Hades';
                const activeColor = isPoseidon
                  ? 'bg-teal-400 text-slate-950 shadow'
                  : isHades
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-amber-400 text-slate-950 shadow';
                const inactiveColor = isPoseidon
                  ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                  : isHades
                  ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                  : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setVillagerTask(t.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      villagerTask === t.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'norse' && (selectedUnit === 'villager' || selectedUnit === 'norse_dwarf') ? (
            <>
              {/* Papel / Trabalhador Nórdico */}
              {(
                [
                  { id: 'todos', label: 'Todos (3)', icon: Users },
                  { id: 'homem', label: 'Coletor', icon: User },
                  { id: 'mulher', label: 'Coletora', icon: User },
                  { id: 'anao', label: 'Anão Minerador', icon: Hammer },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'thor'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : god === 'loki'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : god === 'freyr'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'bg-sky-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'thor'
                    ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    : god === 'loki'
                    ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                    : god === 'freyr'
                    ? 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setNorseWorkerMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      norseWorkerMode === m.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Tarefas / Ferramentas Nórdicas */}
              {(
                [
                  { id: 'vigilia', label: 'Vigília', icon: Shield },
                  { id: 'andar', label: 'Andando', icon: Play },
                  { id: 'madeira', label: 'Pinheiro', icon: Trees },
                  { id: 'ouro', label: 'Ouro', icon: Sparkles },
                  { id: 'fruta', label: 'Bagas', icon: Sun },
                  { id: 'construir', label: 'Construir', icon: Hammer },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'thor'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : god === 'loki'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : god === 'freyr'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'bg-sky-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'thor'
                    ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    : god === 'loki'
                    ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                    : god === 'freyr'
                    ? 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNorseWorkerTask(t.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      norseWorkerTask === t.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'egyptian' && selectedUnit === 'villager' ? (
            <>
              {/* Controles de Gênero do Trabalhador Egípcio */}
              {(
                [
                  { id: 'ambos', label: 'Ambos', icon: Users },
                  { id: 'homem', label: 'Homem', icon: User },
                  { id: 'mulher', label: 'Mulher', icon: User },
                ] as const
              ).map((g) => {
                const Icon = g.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'isis' || god === 'ísis'
                    ? 'bg-teal-400 text-slate-950 shadow'
                    : god === 'set'
                    ? 'bg-orange-500 text-slate-950 shadow'
                    : 'bg-amber-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'isis' || god === 'ísis'
                    ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                    : god === 'set'
                    ? 'border border-orange-400/30 text-orange-200 hover:bg-orange-400/15'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setEgyptianLaborerGender(g.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      egyptianLaborerGender === g.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{g.label}</span>
                  </button>
                );
              })}
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Tarefas e Ferramentas Egípcias */}
              {(
                [
                  { id: 'vigilia', label: 'Vigília', icon: Shield },
                  { id: 'andar', label: 'Andando', icon: Play },
                  { id: 'madeira', label: 'Palmeira', icon: Trees },
                  { id: 'ouro', label: 'Ouro', icon: Sparkles },
                  { id: 'fruta', label: 'Tâmaras', icon: Sun },
                  { id: 'construir', label: 'Templo', icon: Hammer },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'isis' || god === 'ísis'
                    ? 'bg-teal-400 text-slate-950 shadow'
                    : god === 'set'
                    ? 'bg-orange-500 text-slate-950 shadow'
                    : 'bg-amber-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'isis' || god === 'ísis'
                    ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                    : god === 'set'
                    ? 'border border-orange-400/30 text-orange-200 hover:bg-orange-400/15'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEgyptianLaborerTask(t.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      egyptianLaborerTask === t.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'atlantean' && (selectedUnit === 'villager' || selectedUnit === 'citizen') ? (
            <>
              {/* Botão de Promoção a Herói Atlante */}
              <button
                type="button"
                onClick={() => setAtlanteanIsHero(!atlanteanIsHero)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  atlanteanIsHero
                    ? 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/50 ring-2 ring-yellow-200'
                    : 'border border-amber-400/40 text-amber-300 bg-amber-950/40 hover:bg-amber-900/40'
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>{atlanteanIsHero ? 'Herói Ativo' : 'Promover Herói'}</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Modo do Cidadão Atlante */}
              {(
                [
                  { id: 'todos', label: 'Casal + Lhama', icon: Users },
                  { id: 'homem', label: 'Cidadão', icon: User },
                  { id: 'mulher', label: 'Cidadã', icon: User },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'gaia'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : god === 'urano' || god === 'oranos'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-sky-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'gaia'
                    ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                    : god === 'urano' || god === 'oranos'
                    ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAtlanteanCitizenMode(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      atlanteanCitizenMode === m.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Tarefas e Ferramentas Atlantes */}
              {(
                [
                  { id: 'vigilia', label: 'Vigília', icon: Shield },
                  { id: 'andar', label: 'Com Lhama', icon: Play },
                  { id: 'madeira', label: 'Madeira', icon: Trees },
                  { id: 'ouro', label: 'Ouro', icon: Sparkles },
                  { id: 'fruta', label: 'Frutas', icon: Sun },
                  { id: 'construir', label: 'Construir', icon: Hammer },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'gaia'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : god === 'urano' || god === 'oranos'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-sky-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'gaia'
                    ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                    : god === 'urano' || god === 'oranos'
                    ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAtlanteanCitizenTask(t.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      atlanteanCitizenTask === t.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'greek' && selectedUnit === 'medusa' ? (
            <>
              {/* Controles da Medusa de Zeus */}
              <button
                type="button"
                onClick={() => setMedusaMode('auto')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  medusaMode === 'auto'
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Swords className="h-3.5 w-3.5" />
                <span>🏹 Combate Auto</span>
              </button>
              <button
                type="button"
                onClick={() => setMedusaMode('flechas')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  medusaMode === 'flechas'
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>🎯 Só Flechas</span>
              </button>
              <button
                type="button"
                onClick={() => setMedusaMode('vigilia')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  medusaMode === 'vigilia'
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>🛡️ Vigília</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.triggerGaze?.()}
                disabled={medusaGazeCooldown > 0}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  medusaGazeCooldown > 0
                    ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300/60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 ring-1 ring-emerald-300'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {medusaGazeCooldown > 0
                    ? `⏳ Olhar (${Math.ceil(medusaGazeCooldown)}s)`
                    : '⚡ Olhar Petrificante'}
                </span>
              </button>
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'greek' && selectedUnit === 'colossus' ? (
            <>
              {/* Tiers do Colosso de Zeus */}
              {(
                [
                  { tier: 1, label: 'Bronze' },
                  { tier: 2, label: 'Prata (Talos)' },
                  { tier: 3, label: 'Ouro (Rodes)' },
                ] as const
              ).map((spec) => (
                <button
                  key={spec.tier}
                  type="button"
                  onClick={() => setColossusTier(spec.tier)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    colossusTier === spec.tier
                      ? spec.tier === 3
                        ? 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-400/30 ring-1 ring-amber-300'
                        : spec.tier === 2
                        ? 'bg-gradient-to-r from-slate-200 to-sky-300 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-1 ring-sky-300'
                        : 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 font-black shadow-lg shadow-amber-600/30 ring-1 ring-amber-500'
                      : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                  }`}
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>{spec.label}</span>
                </button>
              ))}
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Ações do Colosso */}
              <button
                type="button"
                onClick={() => setColossusAction('slam')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  colossusAction === 'slam'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Swords className="h-3.5 w-3.5" />
                <span>⚔️ Montante</span>
              </button>
              <button
                type="button"
                onClick={() => setColossusAction('marcha')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  colossusAction === 'marcha'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                <span>🛡️ Marcha</span>
              </button>
              <button
                type="button"
                onClick={() => setColossusAction('eat_tree')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  colossusAction === 'eat_tree'
                    ? 'bg-emerald-400 text-slate-950 shadow ring-1 ring-emerald-300'
                    : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                }`}
              >
                <Trees className="h-3.5 w-3.5" />
                <span>🌲 Devorar Árvore</span>
              </button>
              <button
                type="button"
                onClick={() => setColossusAction('vigilia')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  colossusAction === 'vigilia'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Vigília</span>
              </button>
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'greek' && selectedUnit === 'hydra' ? (
            <>
              {/* Controles da Hidra de Zeus */}
              <button
                type="button"
                onClick={() => setHydraActionMode('combate')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hydraActionMode === 'combate'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Swords className="h-3.5 w-3.5" />
                <span>🐉 Auto Bote</span>
              </button>
              <button
                type="button"
                onClick={() => setHydraActionMode('vigilia')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hydraActionMode === 'vigilia'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Vigília</span>
              </button>
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.triggerBite?.()}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold border border-amber-400/40 text-amber-200 hover:bg-amber-400/20 active:scale-95 transition cursor-pointer whitespace-nowrap"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>⚡ Morder</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHydraTotalDamage(0);
                  setHydraTotalHits(0);
                  setHydraHeads(1);
                  entityMeshRef.current?.userData?.setHeadCount?.(1);
                }}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold border border-red-400/30 text-red-300 hover:bg-red-400/15 transition cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Alvos da Hidra */}
              <button
                type="button"
                onClick={() => setHydraTargetCount(1)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hydraTargetCount === 1
                    ? 'bg-blue-500 text-white shadow ring-1 ring-blue-300'
                    : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>1 Soldado</span>
              </button>
              <button
                type="button"
                onClick={() => setHydraTargetCount(3)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  hydraTargetCount === 3
                    ? 'bg-blue-500 text-white shadow ring-1 ring-blue-300'
                    : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>3 Soldados</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Seletor Manual de Cabeças */}
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setHydraHeads(cnt);
                    entityMeshRef.current?.userData?.setHeadCount?.(cnt);
                  }}
                  className={`flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    hydraHeads === cnt
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow'
                      : 'border border-amber-400/30 text-amber-200/80 hover:bg-amber-400/15'
                  }`}
                >
                  <span>{cnt} Cab ({cnt * 30})</span>
                </button>
              ))}
              {/* HUD Badge de Dano e Barra */}
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-amber-400/30 px-2.5 py-1 text-xs">
                <span className="font-bold text-amber-300">💥 {hydraTotalDamage}/1600</span>
                <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((hydraTotalDamage / 1600) * 100))}%` }}
                  />
                </div>
              </div>
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'greek' && selectedUnit === 'manticore' ? (
            <>
              {/* Controles da Mantícora de Zeus */}
              <button
                type="button"
                onClick={() => setManticoreMode('combate')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  manticoreMode === 'combate'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Swords className="h-3.5 w-3.5" />
                <span>🦂 Ataque à Distância</span>
              </button>
              <button
                type="button"
                onClick={() => setManticoreMode('vigilia')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  manticoreMode === 'vigilia'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>🦁 Vigília Alada</span>
              </button>
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.triggerVolley?.()}
                disabled={manticoreVolleyCooldown > 0}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  manticoreVolleyCooldown > 0
                    ? 'bg-red-950/60 border border-red-500/30 text-red-300/60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-800 text-white font-black shadow-lg shadow-red-500/40 hover:scale-105 active:scale-95 ring-1 ring-red-300'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {manticoreVolleyCooldown > 0
                    ? `⏳ Recarga (${manticoreVolleyCooldown.toFixed(1)}s)`
                    : '💥 Rajada de Espinhos (PRONTO)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setManticoreAutoCast((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  manticoreAutoCast
                    ? 'bg-emerald-600 text-white font-black shadow ring-1 ring-emerald-300'
                    : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
                }`}
              >
                <span>{manticoreAutoCast ? '⚙️ Auto-Cast: ON' : '⚙️ Auto-Cast: OFF'}</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Alvos da Mantícora */}
              <button
                type="button"
                onClick={() => setManticoreTargetCount(1)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  manticoreTargetCount === 1
                    ? 'bg-sky-500 text-white shadow ring-1 ring-sky-300'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>1 Alvo</span>
              </button>
              <button
                type="button"
                onClick={() => setManticoreTargetCount(5)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  manticoreTargetCount === 5
                    ? 'bg-sky-500 text-white shadow ring-1 ring-sky-300'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>5 Alvos (Grupo)</span>
              </button>
              <button
                type="button"
                onClick={() => setManticoreFrontline((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  manticoreFrontline
                    ? 'bg-blue-600 text-amber-300 font-bold shadow ring-1 ring-amber-300'
                    : 'border border-blue-400/30 text-blue-200 hover:bg-blue-400/15'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{manticoreFrontline ? '🛡️ Escolta: ON' : '⚠️ Escolta: OFF'}</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* HUD Badge de Recarga e Dano */}
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-red-500/30 px-2.5 py-1 text-xs">
                <span className="font-bold text-red-300">🦂 Recarga:</span>
                <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-100"
                    style={{
                      width: `${Math.round(((12.0 - manticoreVolleyCooldown) / 12.0) * 100)}%`,
                    }}
                  />
                </div>
                <span className="font-bold text-amber-300">🏹 {manticoreQuillsFired} espinhos</span>
                <span className="text-slate-400">💥 {manticorePiercingDamage} dano</span>
              </div>
            </>
          ) : galleryCategory === 'unit' && selectedCiv === 'greek' && selectedUnit === 'cyclops' ? (
            <>
              {/* Controles do Ciclope de Zeus */}
              <button
                type="button"
                onClick={() => setCyclopsMode('combate')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsMode === 'combate'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Swords className="h-3.5 w-3.5" />
                <span>🔨 Combate (Arremesso + Clava)</span>
              </button>
              <button
                type="button"
                onClick={() => setCyclopsMode('vigilia')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsMode === 'vigilia'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>👁️ Vigília</span>
              </button>
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.triggerThrow?.()}
                disabled={cyclopsThrowCooldown > 0}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsThrowCooldown > 0
                    ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300/60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/40 hover:scale-105 active:scale-95 ring-1 ring-amber-300'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {cyclopsThrowCooldown > 0
                    ? `⏳ Recarga (${cyclopsThrowCooldown.toFixed(1)}s)`
                    : '🤾 Arremessar Inimigo (PRONTO)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.toggleElder?.()}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsIsElder
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-black shadow-lg shadow-red-500/40 ring-1 ring-red-300'
                    : 'border border-amber-400/30 text-amber-300 hover:bg-amber-400/15'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>{cyclopsIsElder ? '🌟 Ciclope Ancião (Ativo)' : '⚡ Vontade de Cronos (Ciclope Ancião)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCyclopsAutoCast((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsAutoCast
                    ? 'bg-emerald-600 text-white font-black shadow ring-1 ring-emerald-300'
                    : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
                }`}
              >
                <span>{cyclopsAutoCast ? '⚙️ Auto-Arremesso: ON' : '⚙️ Auto-Arremesso: OFF'}</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* Alvos Manuais */}
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.selectTarget?.(1)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsTargetId === 1
                    ? 'bg-amber-500 text-slate-950 font-bold shadow ring-1 ring-amber-300'
                    : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Hoplita 1</span>
              </button>
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.selectTarget?.(2)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsTargetId === 2
                    ? 'bg-amber-500 text-slate-950 font-bold shadow ring-1 ring-amber-300'
                    : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/15'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Hoplita 2</span>
              </button>
              <button
                type="button"
                onClick={() => entityMeshRef.current?.userData?.selectTarget?.(3)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  cyclopsTargetId === 3
                    ? 'bg-purple-600 text-white font-bold shadow ring-1 ring-purple-300'
                    : 'border border-purple-400/30 text-purple-300 hover:bg-purple-400/15'
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Herói (Imune)</span>
              </button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              {/* HUD Badge de Recarga e Dano */}
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-amber-500/30 px-2.5 py-1 text-xs">
                <span className="font-bold text-amber-300">🤾 Recarga:</span>
                <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
                    style={{
                      width: `${Math.round(((20.0 - cyclopsThrowCooldown) / 20.0) * 100)}%`,
                    }}
                  />
                </div>
                <span className="font-bold text-amber-300">💥 {cyclopsTotalDamage} dano</span>
                <span className="text-slate-400">{cyclopsIsElder ? '🎯 65 (Raio +50%)' : '🎯 65 (Área)'}</span>
              </div>
            </>
          ) : galleryCategory === 'unit' ? (
            <>
              <button
                type="button"
                onClick={() => setAnimState('idle')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  animState === 'idle' ? 'bg-[#d4af37] text-[#090c12]' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Guarda</span>
              </button>
              <button
                type="button"
                onClick={() => setAnimState('move')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  animState === 'move' ? 'bg-[#d4af37] text-[#090c12]' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                <span>Marcha</span>
              </button>
              <button
                type="button"
                onClick={() => setAnimState('attack')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  animState === 'attack' ? 'bg-[#d4af37] text-[#090c12]' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Swords className="h-3.5 w-3.5" />
                <span>Ataque</span>
              </button>
              {selectedUnit === 'myrmidon' && selectedCiv === 'greek' && (
                <button
                  type="button"
                  onClick={() => setMyrmidonFury((v) => !v)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    myrmidonFury
                      ? 'bg-sky-400 text-slate-950 shadow'
                      : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>{myrmidonFury ? 'Fúria de Zeus: ON' : 'Fúria de Zeus: OFF'}</span>
                </button>
              )}
            </>
          ) : galleryCategory === 'building' && selectedCiv === 'greek' && selectedBuilding === 'temple' ? (
            <>
              {/* Deuses Patronos do Templo Grego */}
              {(
                [
                  { id: 'Zeus', label: '⚡ Zeus', active: 'bg-gradient-to-r from-amber-300 to-blue-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
                  { id: 'Poseidon', label: '🔱 Poseidon', active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
                  { id: 'Hades', label: '💀 Hades', active: 'bg-gradient-to-r from-orange-500 to-purple-800 text-white font-black shadow-lg shadow-orange-500/30 ring-1 ring-orange-400' },
                ] as const
              ).map((g) => {
                const isSel = selectedMajorGod.toLowerCase() === g.id.toLowerCase();
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedMajorGod(g.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Tiers T1 a T5 */}
              {(
                [
                  { tier: 1, label: 'T1 • Altar' },
                  { tier: 2, label: 'T2 • Santuário' },
                  { tier: 3, label: 'T3 • Heroico' },
                  { tier: 4, label: 'T4 • Mítico' },
                  { tier: 5, label: 'T5 • Maravilha' },
                ] as const
              ).map((t) => (
                <button
                  key={t.tier}
                  type="button"
                  onClick={() => {
                    setBuildingAge(t.tier);
                    if (t.tier <= 4) {
                      onSelectTier(t.tier as 1 | 2 | 3 | 4);
                    }
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    buildingAge === t.tier
                      ? t.tier === 5
                        ? 'bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-200'
                        : 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                      : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Ações do Templo */}
              <button
                type="button"
                onClick={() => setTempleAction('favor')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  templeAction === 'favor'
                    ? 'bg-sky-400 text-slate-950 shadow'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gerando Favor Divino</span>
              </button>
              <button
                type="button"
                onClick={() => setTempleAction('milagre')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  templeAction === 'milagre'
                    ? 'bg-amber-400 text-slate-950 shadow ring-1 ring-amber-300 font-black'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Invocar Milagre Supremo</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => setFocusDivine((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  focusDivine
                    ? 'bg-sky-500 text-slate-950 shadow font-black'
                    : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{focusDivine ? 'Visão Geral' : 'Focar Estátua Divina'}</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'building' && selectedCiv === 'egyptian' && selectedBuilding === 'temple' ? (
            <>
              {/* Deuses Patronos do Templo Egípcio */}
              {(
                [
                  { id: 'Ra', label: '☀️ Rá', active: 'bg-gradient-to-r from-amber-300 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
                  { id: 'Isis', label: '🪷 Ísis', active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
                  { id: 'Set', label: '🏜️ Set', active: 'bg-gradient-to-r from-red-600 to-orange-700 text-white font-black shadow-lg shadow-red-500/30 ring-1 ring-orange-400' },
                ] as const
              ).map((g) => {
                const isSel = selectedMajorGod.toLowerCase() === g.id.toLowerCase();
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedMajorGod(g.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Tiers T1 a T5 */}
              {(
                [
                  { tier: 1, label: 'T1 • Altar' },
                  { tier: 2, label: 'T2 • Santuário' },
                  { tier: 3, label: 'T3 • Pilones' },
                  { tier: 4, label: 'T4 • Esfinge' },
                  { tier: 5, label: 'T5 • Pirâmide' },
                ] as const
              ).map((t) => (
                <button
                  key={t.tier}
                  type="button"
                  onClick={() => {
                    setBuildingAge(t.tier);
                    if (t.tier <= 4) {
                      onSelectTier(t.tier as 1 | 2 | 3 | 4);
                    }
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    buildingAge === t.tier
                      ? t.tier === 5
                        ? 'bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-200'
                        : 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                      : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Ações do Templo */}
              <button
                type="button"
                onClick={() => setTempleAction('favor')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  templeAction === 'favor'
                    ? 'bg-sky-400 text-slate-950 shadow'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gerando Favor Divino</span>
              </button>
              <button
                type="button"
                onClick={() => setTempleAction('milagre')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  templeAction === 'milagre'
                    ? 'bg-amber-400 text-slate-950 shadow ring-1 ring-amber-300 font-black'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Sopro Solar</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => setFocusDivine((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  focusDivine
                    ? 'bg-sky-500 text-slate-950 shadow font-black'
                    : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{focusDivine ? 'Visão Geral' : 'Focar Estátua / Ápice'}</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'building' && selectedCiv === 'greek' && selectedBuilding === 'fortress' ? (
            <>
              {/* Deuses Patronos da Fortaleza Grega */}
              {(
                [
                  { id: 'Zeus', label: 'Zeus', icon: Zap, active: 'bg-gradient-to-r from-amber-300 to-blue-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
                  { id: 'Poseidon', label: 'Poseidon', icon: Waves, active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
                  { id: 'Hades', label: 'Hades', icon: Skull, active: 'bg-gradient-to-r from-orange-500 to-purple-800 text-white font-black shadow-lg shadow-orange-500/30 ring-1 ring-orange-400' },
                ] as const
              ).map((g) => {
                const Icon = g.icon;
                const isSel = selectedMajorGod.toLowerCase() === g.id.toLowerCase();
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedMajorGod(g.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isSel
                        ? g.active
                        : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{g.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Tiers T3 (Heroica) e T4 (Mítica) */}
              <button
                type="button"
                onClick={() => {
                  setBuildingAge(3);
                  onSelectTier(3);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buildingAge <= 3
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                }`}
              >
                <span>T3 • Era Heroica</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBuildingAge(4);
                  onSelectTier(4);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buildingAge >= 4
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                }`}
              >
                <span>T4 • Era Mítica</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Ações da Fortaleza */}
              {(
                [
                  { id: 'guarnicao', label: 'Guarnição Ativa', icon: Shield },
                  { id: 'defesa', label: 'Disparo de Flechas', icon: Sparkles },
                  { id: 'bencao', label: 'Aura Divina', icon: Sun },
                ] as const
              ).map((act) => {
                const Icon = act.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'poseidon'
                    ? 'bg-teal-400 text-slate-950 shadow'
                    : god === 'hades'
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-amber-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'poseidon'
                    ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
                    : god === 'hades'
                    ? 'border border-orange-400/30 text-orange-200 hover:bg-orange-400/15'
                    : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setFortressAction(act.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      fortressAction === act.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{act.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'building' && selectedCiv === 'atlantean' && selectedBuilding === 'fortress' ? (
            <>
              {/* Deuses Patronos Atlantes */}
              {(
                [
                  { id: 'Kronos', label: '⏳ Kronos', active: 'bg-gradient-to-r from-sky-400 to-indigo-700 text-white font-black shadow-lg shadow-sky-500/30 ring-1 ring-sky-300' },
                  { id: 'Oranos', label: '🌪️ Oranos', active: 'bg-gradient-to-r from-amber-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
                  { id: 'Gaia', label: '🌿 Gaia', active: 'bg-gradient-to-r from-emerald-400 to-emerald-800 text-white font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' },
                ] as const
              ).map((g) => {
                const rawGod = selectedMajorGod.toLowerCase();
                const isSel = rawGod === g.id.toLowerCase() || (g.id === 'Oranos' && rawGod === 'urano') || (g.id === 'Kronos' && rawGod === 'cronos');
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedMajorGod(g.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isSel
                        ? g.active
                        : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Tiers T3 (Palácio 3 Cúpulas) e T4 (Cidadela Imperial) */}
              <button
                type="button"
                onClick={() => {
                  setBuildingAge(3);
                  onSelectTier(3);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buildingAge <= 3
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                }`}
              >
                <span>T3 • Palácio (3 Cúpulas)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBuildingAge(4);
                  onSelectTier(4);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buildingAge >= 4
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                }`}
              >
                <span>T4 • Cidadela Imperial</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Ações da Fortaleza Atlante */}
              {(
                [
                  { id: 'guarnicao', label: 'Guarnição Ativa', icon: Shield },
                  { id: 'defesa', label: 'Rajada de Oricalco', icon: Sparkles },
                  { id: 'bencao', label: 'Aura de Atlântida', icon: Sun },
                ] as const
              ).map((act) => {
                const Icon = act.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'gaia'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : god === 'oranos' || god === 'urano'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-sky-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'gaia'
                    ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                    : god === 'oranos' || god === 'urano'
                    ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setAtlanteanFortressAction(act.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      atlanteanFortressAction === act.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{act.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'building' && selectedCiv === 'norse' && selectedBuilding === 'fortress' ? (
            <>
              {/* Deuses Patronos Nórdicos */}
              {(
                [
                  { id: 'Odin', label: '🐺 Odin', active: 'bg-gradient-to-r from-sky-400 to-blue-700 text-white font-black shadow-lg shadow-sky-500/30 ring-1 ring-sky-300' },
                  { id: 'Thor', label: '🔨 Thor', active: 'bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 font-black shadow-lg shadow-red-500/30 ring-1 ring-amber-300' },
                  { id: 'Loki', label: '🐍 Loki', active: 'bg-gradient-to-r from-emerald-400 to-emerald-800 text-white font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' },
                  { id: 'Freyr', label: '🌾 Freyr', active: 'bg-gradient-to-r from-amber-300 to-lime-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-lime-400' },
                ] as const
              ).map((g) => {
                const rawGod = selectedMajorGod.toLowerCase();
                const isSel = rawGod === g.id.toLowerCase();
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedMajorGod(g.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isSel
                        ? g.active
                        : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Tiers T3 (Hill Fort Heroico) e T4 (Cidadela de Valhalla) */}
              <button
                type="button"
                onClick={() => {
                  setBuildingAge(3);
                  onSelectTier(3);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buildingAge <= 3
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                }`}
              >
                <span>T3 • Hill Fort Heroico</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBuildingAge(4);
                  onSelectTier(4);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  buildingAge >= 4
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                }`}
              >
                <span>T4 • Cidadela de Valhalla</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Ações do Hill Fort Nórdico */}
              {(
                [
                  { id: 'guarnicao', label: 'Guarnição Ativa', icon: Shield },
                  { id: 'defesa', label: 'Saraivada de Lanças', icon: Sparkles },
                  { id: 'geada', label: 'Geada de Fim de Inverno', icon: Sun },
                ] as const
              ).map((act) => {
                const Icon = act.icon;
                const god = selectedMajorGod.toLowerCase();
                const activeColor =
                  god === 'thor'
                    ? 'bg-red-500 text-white shadow'
                    : god === 'loki'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : god === 'freyr'
                    ? 'bg-yellow-400 text-slate-950 shadow'
                    : 'bg-sky-400 text-slate-950 shadow';
                const inactiveColor =
                  god === 'thor'
                    ? 'border border-red-400/30 text-red-200 hover:bg-red-400/15'
                    : god === 'loki'
                    ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
                    : god === 'freyr'
                    ? 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
                    : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setNorseFortressAction(act.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      norseFortressAction === act.id ? activeColor : inactiveColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{act.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'building' ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] px-1">
                Era:
              </span>
              {([1, 2, 3, 4, 5] as AgeLevel[]).map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => {
                    setBuildingAge(age);
                    if (age <= 4) onSelectTier(age as 1 | 2 | 3 | 4);
                  }}
                  className={`rounded-lg px-2.5 py-1 font-mono-num text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    buildingAge === age
                      ? 'bg-[#d4af37] text-[#090c12]'
                      : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
                  }`}
                >
                  {age === 5 ? 'T5 Metrópole' : `T${age}`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'map' ? (
            <>
              <button
                type="button"
                onClick={() => setMapWireframe((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  mapWireframe
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'border border-white/12 text-[#cbd5e1] hover:bg-white/10'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Malha Relevo</span>
              </button>
              <button
                type="button"
                onClick={() => setMapShowFlora((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  mapShowFlora
                    ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Trees className="h-3.5 w-3.5" />
                <span>Flora & Minas</span>
              </button>
              <button
                type="button"
                onClick={() => setMapShowFauna((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  mapShowFauna
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Fauna Local</span>
              </button>
              {(selectedMap === 'land_unknown' || selectedMap === 'the_unknown') && (
                <button
                  type="button"
                  onClick={() => {
                    rollUnknownMapVariant(selectedMap);
                    setMapSeedTick((t) => t + 1);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>Sortear Semente</span>
                </button>
              )}
            </>
          ) : galleryCategory === 'fauna' ? (
            <>
              {(
                [
                  { id: 'idle', label: 'Parado', icon: Pause },
                  { id: 'walk', label: 'Caminhar', icon: Play },
                  { id: 'run', label: 'Correr / Galope', icon: Wind },
                ] as const
              ).map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setFaunaAnim(a.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      faunaAnim === a.id
                        ? 'bg-emerald-400 text-slate-950 shadow'
                        : 'border border-white/12 text-[#cbd5e1] hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{a.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'utensil' ? (
            <>
              <button
                type="button"
                onClick={() => setArtifactAuraActive((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  artifactAuraActive
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Brasas / Efeitos</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : galleryCategory === 'relic' ? (
            <>
              <button
                type="button"
                onClick={() => setArtifactAuraActive((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  artifactAuraActive
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Aura Sagrada</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          ) : (
            // Flora & Resources controls
            <>
              <button
                type="button"
                onClick={() => setFloraVariantSeed((s) => (s + 1) % 5)}
                className="flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span className="font-mono-num">Variante #{floraVariantSeed}</span>
              </button>
              {selectedFloraItem.category === 'tree' && (
                <button
                  type="button"
                  onClick={() => setFloraWind((v) => !v)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    floraWind
                      ? 'bg-teal-500/25 text-teal-200 border border-teal-400/50'
                      : 'border border-white/12 text-[#9ca3af] hover:text-white'
                  }`}
                >
                  <Wind className="h-3.5 w-3.5" />
                  <span>Brisa na Copa</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHumanScale((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  showHumanScale
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                    : 'border border-white/12 text-[#9ca3af] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Escala Aldeão</span>
              </button>
            </>
          )}

          {isGodUnit && (
            <button
              type="button"
              onClick={() => setFocusDivine((v) => !v)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                focusDivine
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{focusDivine ? 'Visão Geral' : 'Focar Rosto/Arma'}</span>
            </button>
          )}

          <div className="h-5 w-px bg-white/15 mx-0.5 shrink-0" />

          {/* Auto-Rotate 360° */}
          <button
            type="button"
            onClick={() => setAutoRotate3D((v) => !v)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              autoRotate3D
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'border border-white/10 text-[#9ca3af] hover:text-white'
            }`}
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Girar 360°</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => adjustZoom(1.22)}
              title="Afastar (-)"
              className="flex h-7 w-7 items-center justify-center rounded bg-[#1a2232] text-[#f5e3b0] font-bold hover:bg-[#253046] cursor-pointer"
            >
              -
            </button>
            <span className="font-mono-num text-[11px] text-[#cbd5e1] min-w-[2.6rem] text-center">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={() => adjustZoom(0.82)}
              title="Aproximar (+)"
              className="flex h-7 w-7 items-center justify-center rounded bg-[#1a2232] text-[#f5e3b0] font-bold hover:bg-[#253046] cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { HopliteArmorTierModal } from './HopliteArmorTierModal';
