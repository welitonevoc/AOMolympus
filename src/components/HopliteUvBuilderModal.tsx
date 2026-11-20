import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AtlanteanAction } from '../civilizacao/atlantes/atlanteanVillagerModel';
import { AtlanteanFortressAction } from '../civilizacao/atlantes/atlanteanFortressModel';
import { isEgyptianArchBuilding } from '../civilizacao/egipcios/egyptianArchitectureSuite';
import { isAtlanteanArchBuilding } from '../civilizacao/atlantes/atlanteanArchitectureSuite';
import { EgyptianLaborerAction } from '../civilizacao/egipcios/egyptianVillagerModel';
import { GreekFortressAction } from '../civilizacao/gregos/greekFortressModel';
import { ZeusHopliteAction } from '../civilizacao/gregos/zeusHopliteModel';
import { NorseFortressAction } from '../civilizacao/nordicos/norseFortressModel';
import { NorseWorkerRole, NorseWorkerTask } from '../civilizacao/nordicos/norseVillagerModel';
import {
  AgeLevel,
  BUILDING_STATS,
  BuildingKind,
  FaunaKind,
  MapId,
  MAPS,
  PantheonId,
  UNIT_STATS,
  WorldSizeId,
} from '../game/types';
import { GALLERY_RELIC_ITEMS, GALLERY_UTENSIL_ITEMS } from './gallery3dArtifacts';
import {
  GALLERY_FAUNA_ITEMS,
  GALLERY_FLORA_ITEMS,
  GALLERY_MAP_ITEMS,
  getBuildingsForCivAndGod,
  getUnitsForCivAndGod,
  InspectableUnitId,
  MAJOR_GODS_BY_CIV,
} from './gallery3dCatalog';
import { GALLERY_TERRAIN_ITEMS, TerrainGalleryFilter } from './gallery3dTerrain';
import {
  CameraPreset,
  DioramaMetrics,
  FaunaDietFilter,
  FloraTypeFilter,
  FramingSpec,
  GalleryCategory,
  getFramingForSubject,
  HopliteUvBuilderModalProps,
  isGreekOrEgyptianGod,
  LightingMood,
  MapExpansionFilter,
  RelicPantheonFilter,
  UnitCategoryFilter,
  UtensilCategoryFilter,
} from './gallery3d/studioTypes';
import { buildGodotGlbFilename, exportObjectToGlb } from './gallery3d/exportGlbForGodot';

const LazyStudioSceneCanvas = lazy(() =>
  import('./gallery3d/StudioSceneCanvas').then((m) => ({ default: m.StudioSceneCanvas }))
);
const LazyStudioHeaderBar = lazy(() =>
  import('./gallery3d/StudioHeaderBar').then((m) => ({ default: m.StudioHeaderBar }))
);
const LazyStudioCatalogDrawer = lazy(() =>
  import('./gallery3d/StudioCatalogDrawer').then((m) => ({ default: m.StudioCatalogDrawer }))
);
const LazyStudioSpecDrawer = lazy(() =>
  import('./gallery3d/StudioSpecDrawer').then((m) => ({ default: m.StudioSpecDrawer }))
);
const LazyStudioBottomDock = lazy(() =>
  import('./gallery3d/StudioBottomDock').then((m) => ({ default: m.StudioBottomDock }))
);

export { MAJOR_GODS_BY_CIV, getUnitsForCivAndGod, getBuildingsForCivAndGod };
export type { InspectableUnitId };

const _v3A = new THREE.Vector3();

export function HopliteUvBuilderModal({
  isOpen,
  onClose,
  activeMode: _activeMode,
  activeTier,
  onSelectMode: _onSelectMode,
  onSelectTier,
}: HopliteUvBuilderModalProps) {
  void _activeMode;
  void _onSelectMode;

  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const entityMeshRef = useRef<THREE.Group | null>(null);
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
  const [isExportingGlb, setIsExportingGlb] = useState<boolean>(false);
  const [glbExportLabel, setGlbExportLabel] = useState<string | null>(null);

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
  const [mapWorldSize, setMapWorldSize] = useState<WorldSizeId>('normal');
  const [mapExpansionFilter, setMapExpansionFilter] = useState<MapExpansionFilter>('all');
  const [mapWireframe, setMapWireframe] = useState<boolean>(false);
  const [mapShowFlora, setMapShowFlora] = useState<boolean>(true);
  const [mapShowFauna, setMapShowFauna] = useState<boolean>(true);
  const [mapSeedTick, setMapSeedTick] = useState<number>(0);
  const [dioramaMetrics, setDioramaMetrics] = useState<DioramaMetrics>({
    minHeight: 0,
    maxHeight: 0,
    waterCoveragePct: 0,
    effectiveBiome: 'Terras Altas',
    worldSizeLabel: 'Normal',
    dimsLabel: '148×148',
    playableDimsLabel: '116×116',
    baseDistance: 96,
    treeClusterCount: 0,
    goldMineCount: 0,
    settlementCount: 0,
    faunaCount: 0,
  });

  // Fauna, Flora, Utensils, Relics & Terrain states
  const [selectedFauna, setSelectedFauna] = useState<FaunaKind>('deer');
  const [faunaFilter, setFaunaFilter] = useState<FaunaDietFilter>('all');
  const [faunaAnim, setFaunaAnim] = useState<'idle' | 'walk' | 'run'>('walk');
  const [selectedFloraId, setSelectedFloraId] = useState<string>('oak');
  const [floraFilter, setFloraFilter] = useState<FloraTypeFilter>('all');
  const [floraVariantSeed, setFloraVariantSeed] = useState<number>(0);
  const [floraWind, setFloraWind] = useState<boolean>(true);
  const [selectedUtensilId, setSelectedUtensilId] = useState<string>('amphora');
  const [utensilFilter, setUtensilFilter] = useState<UtensilCategoryFilter>('all');
  const [selectedRelicId, setSelectedRelicId] = useState<string>('chalice_athena');
  const [relicPantheonFilter, setRelicPantheonFilter] = useState<RelicPantheonFilter>('all');
  const [artifactAuraActive, setArtifactAuraActive] = useState<boolean>(true);
  const [selectedTerrainId, setSelectedTerrainId] = useState<string>('surface:hades_lava');
  const [terrainFilter, setTerrainFilter] = useState<TerrainGalleryFilter>('all');
  const [terrainVariantSeed, setTerrainVariantSeed] = useState<number>(0);
  const [terrainWireframe, setTerrainWireframe] = useState<boolean>(false);
  const [terrainFxActive, setTerrainFxActive] = useState<boolean>(true);
  const [terrainRedTide, setTerrainRedTide] = useState<boolean>(false);

  // God / Hoplite / Myrmidon / Myth Unit special states
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

  const [medusaMode, setMedusaMode] = useState<'auto' | 'flechas' | 'vigilia'>('auto');
  const [medusaGazeCooldown, setMedusaGazeCooldown] = useState<number>(0);
  const [colossusTier, setColossusTier] = useState<number>(1);
  const [colossusAction, setColossusAction] = useState<'slam' | 'marcha' | 'eat_tree' | 'vigilia'>('slam');
  const [hydraActionMode, setHydraActionMode] = useState<'combate' | 'vigilia' | 'manual_bite'>('combate');
  const [hydraTargetCount, setHydraTargetCount] = useState<number>(1);
  const [hydraHeads, setHydraHeads] = useState<number>(1);
  const [hydraTotalDamage, setHydraTotalDamage] = useState<number>(0);
  const [, setHydraTotalHits] = useState<number>(0);
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

  // Derived catalog selections
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
  const selectedTerrainItem = useMemo(
    () => GALLERY_TERRAIN_ITEMS.find((t) => t.id === selectedTerrainId) || GALLERY_TERRAIN_ITEMS[0],
    [selectedTerrainId]
  );
  const filteredTerrains = useMemo(
    () =>
      terrainFilter === 'all'
        ? GALLERY_TERRAIN_ITEMS
        : GALLERY_TERRAIN_ITEMS.filter((t) => t.filterGroup === terrainFilter),
    [terrainFilter]
  );

  const getFraming = useCallback(
    (focusHead: boolean): FramingSpec =>
      getFramingForSubject(
        {
          galleryCategory,
          mapWorldSize,
          selectedTerrainKind: selectedTerrainItem.kind,
          selectedFauna,
          selectedFloraCategory: selectedFloraItem.category,
          selectedFloraResourceKind: selectedFloraItem.resourceKind,
          selectedBuilding,
          selectedCiv,
          buildingAge,
          selectedUnit,
          selectedMap,
        },
        focusHead
      ),
    [
      galleryCategory,
      mapWorldSize,
      selectedTerrainItem.kind,
      selectedFauna,
      selectedFloraItem.category,
      selectedFloraItem.resourceKind,
      selectedBuilding,
      selectedCiv,
      buildingAge,
      selectedUnit,
      selectedMap,
    ]
  );

  const triggerCameraPreset = (preset: CameraPreset) => {
    const framing = getFraming(focusDivine);
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

  useEffect(() => {
    if (!isOpen) return;
    const isTemple = galleryCategory === 'building' && selectedBuilding === 'temple';
    const isEgyptArch =
      galleryCategory === 'building' &&
      selectedCiv === 'egyptian' &&
      isEgyptianArchBuilding(selectedBuilding);
    const isAtlanteanArch =
      galleryCategory === 'building' &&
      selectedCiv === 'atlantean' &&
      isAtlanteanArchBuilding(selectedBuilding);
    const isGod = galleryCategory === 'unit' && isGreekOrEgyptianGod(selectedUnit, selectedCiv);
    if (!isTemple && !isEgyptArch && !isAtlanteanArch && !isGod) return;
    const framing = getFraming(focusDivine);
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
  }, [focusDivine, isOpen, galleryCategory, selectedBuilding, selectedCiv, selectedUnit, getFraming]);

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

  const handleExportGodotGlb = useCallback(async () => {
    const subject = entityMeshRef.current;
    if (!subject || isExportingGlb) return;
    setIsExportingGlb(true);
    setGlbExportLabel(null);
    try {
      const extraId =
        galleryCategory === 'map'
          ? selectedMap
          : galleryCategory === 'fauna'
            ? selectedFauna
            : galleryCategory === 'flora'
              ? selectedFloraId
              : galleryCategory === 'utensil'
                ? selectedUtensilId
                : galleryCategory === 'relic'
                  ? selectedRelicId
                  : selectedTerrainId;
      const filename = buildGodotGlbFilename({
        galleryCategory,
        pantheon: selectedCiv,
        majorGod: selectedMajorGod,
        unitId: selectedUnit,
        buildingKind: selectedBuilding,
        buildingAge,
        extraId,
      });
      await exportObjectToGlb(subject, filename);
      setGlbExportLabel('GLB salvo!');
      window.setTimeout(() => setGlbExportLabel(null), 2400);
    } catch (err) {
      console.error('Erro ao exportar GLB para Godot 4:', err);
      setGlbExportLabel('Erro GLB');
      window.setTimeout(() => setGlbExportLabel(null), 2400);
    } finally {
      setIsExportingGlb(false);
    }
  }, [
    buildingAge,
    galleryCategory,
    isExportingGlb,
    selectedBuilding,
    selectedCiv,
    selectedFauna,
    selectedFloraId,
    selectedMajorGod,
    selectedMap,
    selectedRelicId,
    selectedTerrainId,
    selectedUnit,
    selectedUtensilId,
  ]);

  if (!isOpen) return null;

  const activeUnitInfo = currentCivUnits.find((u) => u.id === selectedUnit) || currentCivUnits[0];
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
      <div
        ref={mount3DRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      <Suspense fallback={null}>
        <LazyStudioSceneCanvas
          isOpen={isOpen}
          mount3DRef={mount3DRef}
          entityMeshRef={entityMeshRef}
          controlsRef={controlsRef}
          cameraRef={cameraRef}
          camTransitionRef={camTransitionRef}
          baseDistanceRef={baseDistanceRef}
          galleryCategory={galleryCategory}
          lightingMood={lightingMood}
          autoRotate3D={autoRotate3D}
          showHumanScale={showHumanScale}
          selectedCiv={selectedCiv}
          selectedMajorGod={selectedMajorGod}
          selectedUnit={selectedUnit}
          selectedBuilding={selectedBuilding}
          activeTier={activeTier}
          buildingAge={buildingAge}
          animState={animState}
          focusDivine={focusDivine}
          selectedMap={selectedMap}
          mapWorldSize={mapWorldSize}
          mapWireframe={mapWireframe}
          mapShowFlora={mapShowFlora}
          mapShowFauna={mapShowFauna}
          mapSeedTick={mapSeedTick}
          setDioramaMetrics={setDioramaMetrics}
          selectedFauna={selectedFauna}
          selectedFaunaCfg={selectedFaunaCfg}
          faunaAnim={faunaAnim}
          selectedFloraId={selectedFloraId}
          selectedFloraItem={selectedFloraItem}
          floraVariantSeed={floraVariantSeed}
          floraWind={floraWind}
          selectedUtensilId={selectedUtensilId}
          utensilAccentHex={selectedUtensilCfg.accentHex}
          selectedRelicId={selectedRelicId}
          relicAuraHex={selectedRelicCfg.auraHex}
          artifactAuraActive={artifactAuraActive}
          selectedTerrainId={selectedTerrainId}
          selectedTerrainItem={selectedTerrainItem}
          terrainVariantSeed={terrainVariantSeed}
          terrainWireframe={terrainWireframe}
          terrainFxActive={terrainFxActive}
          terrainRedTide={terrainRedTide}
          zeusMode={zeusMode}
          poseidonMode={poseidonMode}
          hadesMode={hadesMode}
          artemisMode={artemisMode}
          hefestoMode={hefestoMode}
          dionisioMode={dionisioMode}
          afroditeMode={afroditeMode}
          apoloMode={apoloMode}
          aresMode={aresMode}
          atenaMode={atenaMode}
          hermesMode={hermesMode}
          isisMode={isisMode}
          setMode={setMode}
          raMode={raMode}
          hopliteAction={hopliteAction}
          villagerGender={villagerGender}
          villagerTask={villagerTask}
          egyptianLaborerGender={egyptianLaborerGender}
          egyptianLaborerTask={egyptianLaborerTask}
          atlanteanCitizenMode={atlanteanCitizenMode}
          atlanteanCitizenTask={atlanteanCitizenTask}
          atlanteanIsHero={atlanteanIsHero}
          norseWorkerMode={norseWorkerMode}
          norseWorkerTask={norseWorkerTask}
          fortressAction={fortressAction}
          atlanteanFortressAction={atlanteanFortressAction}
          norseFortressAction={norseFortressAction}
          templeAction={templeAction}
          myrmidonFury={myrmidonFury}
          medusaMode={medusaMode}
          medusaGazeCooldown={medusaGazeCooldown}
          setMedusaGazeCooldown={setMedusaGazeCooldown}
          colossusTier={colossusTier}
          colossusAction={colossusAction}
          hydraActionMode={hydraActionMode}
          hydraTargetCount={hydraTargetCount}
          hydraHeads={hydraHeads}
          setHydraHeads={setHydraHeads}
          setHydraTotalDamage={setHydraTotalDamage}
          setHydraTotalHits={setHydraTotalHits}
          manticoreMode={manticoreMode}
          manticoreVolleyCooldown={manticoreVolleyCooldown}
          manticoreAutoCast={manticoreAutoCast}
          manticoreTargetCount={manticoreTargetCount}
          manticoreFrontline={manticoreFrontline}
          setManticoreVolleyCooldown={setManticoreVolleyCooldown}
          setManticoreQuillsFired={setManticoreQuillsFired}
          setManticorePiercingDamage={setManticorePiercingDamage}
          cyclopsMode={cyclopsMode}
          cyclopsThrowCooldown={cyclopsThrowCooldown}
          cyclopsAutoCast={cyclopsAutoCast}
          cyclopsIsElder={cyclopsIsElder}
          cyclopsTargetId={cyclopsTargetId}
          setCyclopsThrowCooldown={setCyclopsThrowCooldown}
          setCyclopsIsElder={setCyclopsIsElder}
          setCyclopsTotalDamage={setCyclopsTotalDamage}
          setCyclopsTargetId={setCyclopsTargetId}
          setCyclopsToast={setCyclopsToast}
          setZoomPercent={setZoomPercent}
          getFraming={getFraming}
        />

        {cyclopsToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/95 border border-amber-400 text-amber-200 text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md animate-bounce pointer-events-none">
            {cyclopsToast}
          </div>
        )}

        <LazyStudioHeaderBar
          cinemaMode={cinemaMode}
          setCinemaMode={setCinemaMode}
          galleryCategory={galleryCategory}
          setGalleryCategory={setGalleryCategory}
          lightingMood={lightingMood}
          setLightingMood={setLightingMood}
          triggerCameraPreset={triggerCameraPreset}
          onClose={onClose}
        />

        {!cinemaMode && (
          <>
            <LazyStudioCatalogDrawer
              leftDrawerOpen={leftDrawerOpen}
              setLeftDrawerOpen={setLeftDrawerOpen}
              galleryCategory={galleryCategory}
              selectedCiv={selectedCiv}
              handleSelectCiv={handleSelectCiv}
              selectedMajorGod={selectedMajorGod}
              handleSelectMajorGod={handleSelectMajorGod}
              unitFilter={unitFilter}
              setUnitFilter={setUnitFilter}
              filteredUnits={filteredUnits}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              currentCivBuildings={currentCivBuildings}
              selectedBuilding={selectedBuilding}
              setSelectedBuilding={setSelectedBuilding}
              buildingAge={buildingAge}
              setBuildingAge={setBuildingAge}
              activeTier={activeTier}
              onSelectTier={onSelectTier}
              showGreekArmorTiers={showGreekArmorTiers}
              mapExpansionFilter={mapExpansionFilter}
              setMapExpansionFilter={setMapExpansionFilter}
              mapWorldSize={mapWorldSize}
              setMapWorldSize={setMapWorldSize}
              filteredMaps={filteredMaps}
              selectedMap={selectedMap}
              setSelectedMap={setSelectedMap}
              faunaFilter={faunaFilter}
              setFaunaFilter={setFaunaFilter}
              filteredFauna={filteredFauna}
              selectedFauna={selectedFauna}
              setSelectedFauna={setSelectedFauna}
              terrainFilter={terrainFilter}
              setTerrainFilter={setTerrainFilter}
              filteredTerrains={filteredTerrains}
              selectedTerrainId={selectedTerrainId}
              setSelectedTerrainId={setSelectedTerrainId}
              floraFilter={floraFilter}
              setFloraFilter={setFloraFilter}
              filteredFlora={filteredFlora}
              selectedFloraId={selectedFloraId}
              setSelectedFloraId={setSelectedFloraId}
              utensilFilter={utensilFilter}
              setUtensilFilter={setUtensilFilter}
              filteredUtensils={filteredUtensils}
              selectedUtensilId={selectedUtensilId}
              setSelectedUtensilId={setSelectedUtensilId}
              relicPantheonFilter={relicPantheonFilter}
              setRelicPantheonFilter={setRelicPantheonFilter}
              filteredRelics={filteredRelics}
              selectedRelicId={selectedRelicId}
              setSelectedRelicId={setSelectedRelicId}
            />

            <LazyStudioSpecDrawer
              specDrawerOpen={specDrawerOpen}
              setSpecDrawerOpen={setSpecDrawerOpen}
              galleryCategory={galleryCategory}
              selectedMapCfg={selectedMapCfg}
              dioramaMetrics={dioramaMetrics}
              selectedFaunaCfg={selectedFaunaCfg}
              selectedTerrainItem={selectedTerrainItem}
              selectedFloraItem={selectedFloraItem}
              floraVariantSeed={floraVariantSeed}
              selectedUtensilCfg={selectedUtensilCfg}
              selectedRelicCfg={selectedRelicCfg}
              selectedCiv={selectedCiv}
              selectedMajorGod={selectedMajorGod}
              selectedBuilding={selectedBuilding}
              buildingAge={buildingAge}
              activeBuildingInfo={activeBuildingInfo}
              activeUnitInfo={activeUnitInfo}
              activeUnitStats={activeUnitStats}
              activeBuildingStats={activeBuildingStats}
              showGreekArmorTiers={showGreekArmorTiers}
              activeTier={activeTier}
            />

            <LazyStudioBottomDock
              galleryCategory={galleryCategory}
              isGodUnit={isGodUnit}
              focusDivine={focusDivine}
              setFocusDivine={setFocusDivine}
              autoRotate3D={autoRotate3D}
              setAutoRotate3D={setAutoRotate3D}
              zoomPercent={zoomPercent}
              adjustZoom={adjustZoom}
              onExportGodotGlb={handleExportGodotGlb}
              isExportingGlb={isExportingGlb}
              glbExportLabel={glbExportLabel}
              unitControlsProps={{
                selectedUnit,
                selectedCiv,
                selectedMajorGod,
                entityMeshRef,
                zeusMode,
                setZeusMode,
                poseidonMode,
                setPoseidonMode,
                hadesMode,
                setHadesMode,
                artemisMode,
                setArtemisMode,
                hefestoMode,
                setHefestoMode,
                dionisioMode,
                setDionisioMode,
                afroditeMode,
                setAfroditeMode,
                apoloMode,
                setApoloMode,
                aresMode,
                setAresMode,
                atenaMode,
                setAtenaMode,
                hermesMode,
                setHermesMode,
                isisMode,
                setIsisMode,
                setMode,
                setSetMode,
                raMode,
                setRaMode,
                hopliteAction,
                setHopliteAction,
                villagerGender,
                setVillagerGender,
                villagerTask,
                setVillagerTask,
                norseWorkerMode,
                setNorseWorkerMode,
                norseWorkerTask,
                setNorseWorkerTask,
                egyptianLaborerGender,
                setEgyptianLaborerGender,
                egyptianLaborerTask,
                setEgyptianLaborerTask,
                atlanteanIsHero,
                setAtlanteanIsHero,
                atlanteanCitizenMode,
                setAtlanteanCitizenMode,
                atlanteanCitizenTask,
                setAtlanteanCitizenTask,
                medusaMode,
                setMedusaMode,
                medusaGazeCooldown,
                colossusTier,
                setColossusTier,
                colossusAction,
                setColossusAction,
                hydraActionMode,
                setHydraActionMode,
                hydraTargetCount,
                setHydraTargetCount,
                hydraHeads,
                setHydraHeads,
                hydraTotalDamage,
                setHydraTotalDamage,
                setHydraTotalHits,
                manticoreMode,
                setManticoreMode,
                manticoreVolleyCooldown,
                manticoreAutoCast,
                setManticoreAutoCast,
                manticoreTargetCount,
                setManticoreTargetCount,
                manticoreFrontline,
                setManticoreFrontline,
                manticoreQuillsFired,
                manticorePiercingDamage,
                cyclopsMode,
                setCyclopsMode,
                cyclopsThrowCooldown,
                cyclopsIsElder,
                cyclopsAutoCast,
                setCyclopsAutoCast,
                cyclopsTargetId,
                cyclopsTotalDamage,
                animState,
                setAnimState,
                myrmidonFury,
                setMyrmidonFury,
              }}
              worldControlsProps={{
                selectedCiv,
                selectedMajorGod,
                setSelectedMajorGod,
                selectedBuilding,
                buildingAge,
                setBuildingAge,
                onSelectTier,
                fortressAction,
                setFortressAction,
                atlanteanFortressAction,
                setAtlanteanFortressAction,
                norseFortressAction,
                setNorseFortressAction,
                templeAction,
                setTempleAction,
                focusDivine,
                setFocusDivine,
                showHumanScale,
                setShowHumanScale,
                selectedMap,
                mapWorldSize,
                setMapWorldSize,
                mapWireframe,
                setMapWireframe,
                mapShowFlora,
                setMapShowFlora,
                mapShowFauna,
                setMapShowFauna,
                setMapSeedTick,
                faunaAnim,
                setFaunaAnim,
                artifactAuraActive,
                setArtifactAuraActive,
                selectedTerrainItem,
                terrainVariantSeed,
                setTerrainVariantSeed,
                terrainFxActive,
                setTerrainFxActive,
                terrainWireframe,
                setTerrainWireframe,
                terrainRedTide,
                setTerrainRedTide,
                selectedFloraItem,
                floraVariantSeed,
                setFloraVariantSeed,
                floraWind,
                setFloraWind,
              }}
            />
          </>
        )}
      </Suspense>
    </div>
  );
}

export { HopliteArmorTierModal } from './HopliteArmorTierModal';
