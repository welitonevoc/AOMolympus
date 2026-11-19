import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AtlanteanAction } from '../../civilizacao/atlantes/atlanteanVillagerModel';
import { AtlanteanFortressAction } from '../../civilizacao/atlantes/atlanteanFortressModel';
import { EgyptianLaborerAction } from '../../civilizacao/egipcios/egyptianVillagerModel';
import { GreekFortressAction } from '../../civilizacao/gregos/greekFortressModel';
import { HadesUnderworldEnvironment } from '../../civilizacao/gregos/hadesModel';
import { ZeusHopliteAction } from '../../civilizacao/gregos/zeusHopliteModel';
import { NorseFortressAction } from '../../civilizacao/nordicos/norseFortressModel';
import { NorseWorkerRole, NorseWorkerTask } from '../../civilizacao/nordicos/norseVillagerModel';
import { createFaunaMesh, createMaterialPalette, createUnitMesh } from '../../game/models';
import {
  createContactShadowTexture,
  createMarbleTexture,
  createSelectionRingTexture,
} from '../../game/textures';
import {
  AgeLevel,
  BuildingKind,
  FaunaKind,
  MapId,
  MAPS,
  PantheonId,
  WorldSizeId,
} from '../../game/types';
import { getEffectiveMapConfig } from '../../maps';
import { buildRelicArtifactMesh, buildUtensilMesh, StudioArtifactHandle } from '../gallery3dArtifacts';
import {
  buildFloraOrResourceStudioMesh,
  buildMapDiorama,
  GalleryFaunaItem,
  GalleryFloraItem,
  InspectableUnitId,
  MapDioramaHandle,
} from '../gallery3dCatalog';
import { buildTerrainGalleryMesh, GalleryTerrainItem, StudioTerrainHandle } from '../gallery3dTerrain';
import { buildBuildingStudioSubject } from './buildBuildingStudioSubject';
import { buildGodStudioSubject } from './buildGodStudioSubject';
import { buildGenericUnitStudioSubject, buildHumanUnitStudioSubject } from './buildHumanUnitStudioSubject';
import { buildMythUnitStudioSubject } from './buildMythUnitStudioSubject';
import { disposeMaterialPalette, disposeObject3D } from './dispose3d';
import {
  DioramaMetrics,
  FramingSpec,
  GalleryCategory,
  LIGHTING_PRESETS,
  LightingMood,
} from './studioTypes';

const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();
const _tmpColor = new THREE.Color();

export interface StudioSceneCanvasProps {
  isOpen: boolean;
  mount3DRef: MutableRefObject<HTMLDivElement | null>;
  entityMeshRef: MutableRefObject<THREE.Group | null>;
  controlsRef: MutableRefObject<OrbitControls | null>;
  cameraRef: MutableRefObject<THREE.PerspectiveCamera | null>;
  camTransitionRef: MutableRefObject<{ active: boolean; pos: THREE.Vector3; target: THREE.Vector3 }>;
  baseDistanceRef: MutableRefObject<number>;

  galleryCategory: GalleryCategory;
  lightingMood: LightingMood;
  autoRotate3D: boolean;
  showHumanScale: boolean;

  selectedCiv: PantheonId;
  selectedMajorGod: string;
  selectedUnit: InspectableUnitId;
  selectedBuilding: BuildingKind;
  activeTier: 1 | 2 | 3 | 4;
  buildingAge: AgeLevel;
  animState: 'idle' | 'move' | 'attack';
  focusDivine: boolean;

  selectedMap: MapId;
  mapWorldSize: WorldSizeId;
  mapWireframe: boolean;
  mapShowFlora: boolean;
  mapShowFauna: boolean;
  mapSeedTick: number;
  setDioramaMetrics: Dispatch<SetStateAction<DioramaMetrics>>;

  selectedFauna: FaunaKind;
  selectedFaunaCfg: GalleryFaunaItem;
  faunaAnim: 'idle' | 'walk' | 'run';

  selectedFloraId: string;
  selectedFloraItem: GalleryFloraItem;
  floraVariantSeed: number;
  floraWind: boolean;

  selectedUtensilId: string;
  utensilAccentHex: number;
  selectedRelicId: string;
  relicAuraHex: number;
  artifactAuraActive: boolean;

  selectedTerrainId: string;
  selectedTerrainItem: GalleryTerrainItem;
  terrainVariantSeed: number;
  terrainWireframe: boolean;
  terrainFxActive: boolean;
  terrainRedTide: boolean;

  zeusMode: 'pairar' | 'voar' | 'raios' | 'tempestade';
  poseidonMode: 'conduzido' | 'correnteza' | 'golpe' | 'tsunami';
  hadesMode: 'reinar' | 'marcha' | 'chama' | 'portal';
  artemisMode: 'vigilia' | 'cacada' | 'raizes' | 'alcateia';
  hefestoMode: 'forja' | 'martelo' | 'automato' | 'erupcao';
  dionisioMode: 'banquete' | 'danca' | 'vinhas' | 'extase';
  afroditeMode: 'graca' | 'danca' | 'encanto' | 'mare';
  apoloMode: 'pairar' | 'voo' | 'flecha' | 'helio';
  aresMode: 'postura' | 'investida' | 'sismico' | 'furia';
  atenaMode: 'guardia' | 'avanco' | 'egide' | 'furia';
  hermesMode: 'flutuar' | 'velocidade' | 'rajada' | 'relampago';
  isisMode: 'majestade' | 'heka' | 'ankh' | 'sopdet';
  setMode: 'senhor' | 'tempestade' | 'deserto' | 'monstro';
  raMode: 'gloria' | 'bencao' | 'chuva' | 'ira';
  hopliteAction: ZeusHopliteAction;
  villagerGender: 'homem' | 'mulher' | 'ambos';
  villagerTask: 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir';
  egyptianLaborerGender: 'homem' | 'mulher' | 'ambos';
  egyptianLaborerTask: EgyptianLaborerAction;
  atlanteanCitizenMode: 'todos' | 'homem' | 'mulher';
  atlanteanCitizenTask: AtlanteanAction;
  atlanteanIsHero: boolean;
  norseWorkerMode: NorseWorkerRole | 'todos';
  norseWorkerTask: NorseWorkerTask;
  fortressAction: GreekFortressAction;
  atlanteanFortressAction: AtlanteanFortressAction;
  norseFortressAction: NorseFortressAction;
  templeAction: 'favor' | 'milagre';
  myrmidonFury: boolean;

  medusaMode: 'auto' | 'flechas' | 'vigilia';
  medusaGazeCooldown: number;
  setMedusaGazeCooldown: Dispatch<SetStateAction<number>>;
  colossusTier: number;
  colossusAction: 'slam' | 'marcha' | 'eat_tree' | 'vigilia';
  hydraActionMode: 'combate' | 'vigilia' | 'manual_bite';
  hydraTargetCount: number;
  hydraHeads: number;
  setHydraHeads: Dispatch<SetStateAction<number>>;
  setHydraTotalDamage: Dispatch<SetStateAction<number>>;
  setHydraTotalHits: Dispatch<SetStateAction<number>>;
  manticoreMode: 'combate' | 'vigilia';
  manticoreVolleyCooldown: number;
  manticoreAutoCast: boolean;
  manticoreTargetCount: number;
  manticoreFrontline: boolean;
  setManticoreVolleyCooldown: Dispatch<SetStateAction<number>>;
  setManticoreQuillsFired: Dispatch<SetStateAction<number>>;
  setManticorePiercingDamage: Dispatch<SetStateAction<number>>;
  cyclopsMode: 'combate' | 'vigilia';
  cyclopsThrowCooldown: number;
  cyclopsAutoCast: boolean;
  cyclopsIsElder: boolean;
  cyclopsTargetId: number;
  setCyclopsThrowCooldown: Dispatch<SetStateAction<number>>;
  setCyclopsIsElder: Dispatch<SetStateAction<boolean>>;
  setCyclopsTotalDamage: Dispatch<SetStateAction<number>>;
  setCyclopsTargetId: Dispatch<SetStateAction<number>>;
  setCyclopsToast: Dispatch<SetStateAction<string | null>>;

  setZoomPercent: Dispatch<SetStateAction<number>>;
  getFraming: (focusHead: boolean) => FramingSpec;
}

export function StudioSceneCanvas(props: StudioSceneCanvasProps) {
  const {
    isOpen,
    mount3DRef,
    entityMeshRef,
    controlsRef,
    cameraRef,
    camTransitionRef,
    baseDistanceRef,
    galleryCategory,
    lightingMood,
    autoRotate3D,
    showHumanScale,
    selectedCiv,
    selectedMajorGod,
    selectedUnit,
    selectedBuilding,
    activeTier,
    buildingAge,
    animState,
    focusDivine,
    selectedMap,
    mapWorldSize,
    mapWireframe,
    mapShowFlora,
    mapShowFauna,
    mapSeedTick,
    setDioramaMetrics,
    selectedFauna,
    selectedFaunaCfg,
    faunaAnim,
    selectedFloraId,
    selectedFloraItem,
    floraVariantSeed,
    floraWind,
    selectedUtensilId,
    utensilAccentHex,
    selectedRelicId,
    relicAuraHex,
    artifactAuraActive,
    selectedTerrainId,
    selectedTerrainItem,
    terrainVariantSeed,
    terrainWireframe,
    terrainFxActive,
    terrainRedTide,
    setZoomPercent,
    getFraming,
  } = props;

  const dioramaHandleRef = useRef<MapDioramaHandle | null>(null);
  const artifactHandleRef = useRef<StudioArtifactHandle | null>(null);
  const terrainHandleRef = useRef<StudioTerrainHandle | null>(null);

  // Synced refs avoiding renderer rebuilds for interaction toggles
  const cyclopsModeRef = useRef(props.cyclopsMode);
  cyclopsModeRef.current = props.cyclopsMode;
  const cyclopsAutoCastRef = useRef(props.cyclopsAutoCast);
  cyclopsAutoCastRef.current = props.cyclopsAutoCast;
  const cyclopsIsElderRef = useRef(props.cyclopsIsElder);
  cyclopsIsElderRef.current = props.cyclopsIsElder;
  const cyclopsTargetIdRef = useRef(props.cyclopsTargetId);
  cyclopsTargetIdRef.current = props.cyclopsTargetId;
  const manticoreModeRef = useRef(props.manticoreMode);
  manticoreModeRef.current = props.manticoreMode;
  const manticoreAutoCastRef = useRef(props.manticoreAutoCast);
  manticoreAutoCastRef.current = props.manticoreAutoCast;
  const manticoreTargetCountRef = useRef(props.manticoreTargetCount);
  manticoreTargetCountRef.current = props.manticoreTargetCount;
  const manticoreFrontlineRef = useRef(props.manticoreFrontline);
  manticoreFrontlineRef.current = props.manticoreFrontline;
  const medusaModeRef = useRef(props.medusaMode);
  medusaModeRef.current = props.medusaMode;
  const medusaGazeCooldownRef = useRef(props.medusaGazeCooldown);
  medusaGazeCooldownRef.current = props.medusaGazeCooldown;
  const colossusTierRef = useRef(props.colossusTier);
  colossusTierRef.current = props.colossusTier;
  const colossusActionRef = useRef(props.colossusAction);
  colossusActionRef.current = props.colossusAction;
  const hydraActionModeRef = useRef(props.hydraActionMode);
  hydraActionModeRef.current = props.hydraActionMode;
  const hydraTargetCountRef = useRef(props.hydraTargetCount);
  hydraTargetCountRef.current = props.hydraTargetCount;
  const hydraHeadsRef = useRef(props.hydraHeads);
  hydraHeadsRef.current = props.hydraHeads;
  const fortressActionRef = useRef(props.fortressAction);
  fortressActionRef.current = props.fortressAction;
  const atlanteanFortressActionRef = useRef(props.atlanteanFortressAction);
  atlanteanFortressActionRef.current = props.atlanteanFortressAction;
  const norseFortressActionRef = useRef(props.norseFortressAction);
  norseFortressActionRef.current = props.norseFortressAction;
  const templeActionRef = useRef(props.templeAction);
  templeActionRef.current = props.templeAction;
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
  const terrainFxActiveRef = useRef(terrainFxActive);
  terrainFxActiveRef.current = terrainFxActive;
  const hopliteActionRef = useRef(props.hopliteAction);
  hopliteActionRef.current = props.hopliteAction;
  const villagerGenderRef = useRef(props.villagerGender);
  villagerGenderRef.current = props.villagerGender;
  const villagerTaskRef = useRef(props.villagerTask);
  villagerTaskRef.current = props.villagerTask;
  const egyptianLaborerGenderRef = useRef(props.egyptianLaborerGender);
  egyptianLaborerGenderRef.current = props.egyptianLaborerGender;
  const egyptianLaborerTaskRef = useRef(props.egyptianLaborerTask);
  egyptianLaborerTaskRef.current = props.egyptianLaborerTask;
  const atlanteanCitizenModeRef = useRef(props.atlanteanCitizenMode);
  atlanteanCitizenModeRef.current = props.atlanteanCitizenMode;
  const atlanteanCitizenTaskRef = useRef(props.atlanteanCitizenTask);
  atlanteanCitizenTaskRef.current = props.atlanteanCitizenTask;
  const atlanteanIsHeroRef = useRef(props.atlanteanIsHero);
  atlanteanIsHeroRef.current = props.atlanteanIsHero;
  const norseWorkerModeRef = useRef(props.norseWorkerMode);
  norseWorkerModeRef.current = props.norseWorkerMode;
  const norseWorkerTaskRef = useRef(props.norseWorkerTask);
  norseWorkerTaskRef.current = props.norseWorkerTask;
  const myrmidonFuryRef = useRef(props.myrmidonFury);
  myrmidonFuryRef.current = props.myrmidonFury;
  const focusDivineRef = useRef(focusDivine);
  focusDivineRef.current = focusDivine;
  const zeusModeRef = useRef(props.zeusMode);
  zeusModeRef.current = props.zeusMode;
  const poseidonModeRef = useRef(props.poseidonMode);
  poseidonModeRef.current = props.poseidonMode;
  const hadesModeRef = useRef(props.hadesMode);
  hadesModeRef.current = props.hadesMode;
  const artemisModeRef = useRef(props.artemisMode);
  artemisModeRef.current = props.artemisMode;
  const hefestoModeRef = useRef(props.hefestoMode);
  hefestoModeRef.current = props.hefestoMode;
  const dionisioModeRef = useRef(props.dionisioMode);
  dionisioModeRef.current = props.dionisioMode;
  const afroditeModeRef = useRef(props.afroditeMode);
  afroditeModeRef.current = props.afroditeMode;
  const apoloModeRef = useRef(props.apoloMode);
  apoloModeRef.current = props.apoloMode;
  const aresModeRef = useRef(props.aresMode);
  aresModeRef.current = props.aresMode;
  const atenaModeRef = useRef(props.atenaMode);
  atenaModeRef.current = props.atenaMode;
  const hermesModeRef = useRef(props.hermesMode);
  hermesModeRef.current = props.hermesMode;
  const isisModeRef = useRef(props.isisMode);
  isisModeRef.current = props.isisMode;
  const setModeRef = useRef(props.setMode);
  setModeRef.current = props.setMode;
  const raModeRef = useRef(props.raMode);
  raModeRef.current = props.raMode;

  useEffect(() => {
    if (galleryCategory === 'unit' && selectedUnit === 'myrmidon' && entityMeshRef.current) {
      entityMeshRef.current.userData.setCombatFury?.(props.myrmidonFury ? 1.0 : 0.0);
    }
  }, [props.myrmidonFury, galleryCategory, selectedUnit, activeTier, entityMeshRef]);

  useEffect(() => {
    const h = dioramaHandleRef.current;
    if (!h) return;
    h.wireframeMesh.visible = mapWireframe;
    h.floraGroup.visible = mapShowFlora;
    h.faunaGroup.visible = mapShowFauna;
  }, [mapWireframe, mapShowFlora, mapShowFauna]);

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

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

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

    // Zeus sparks
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
    scene.add(new THREE.Points(sparkGeo, sparkMat));

    const spawnSpark = (p: THREE.Vector3) => {
      const i = sparkIdx;
      sparkIdx = (sparkIdx + 1) % SPARK_N;
      sparkPos[i * 3] = p.x;
      sparkPos[i * 3 + 1] = 0.1;
      sparkPos[i * 3 + 2] = p.z;
      sparkVel[i * 3] = (Math.random() - 0.5) * 3.4;
      sparkVel[i * 3 + 1] = Math.random() * 3.2 + 1.2;
      sparkVel[i * 3 + 2] = (Math.random() - 0.5) * 3.4;
      sparkLife[i] = 0.5 + Math.random() * 0.4;
    };

    // Poseidon spray
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
    scene.add(new THREE.Points(sprayGeo, sprayMat));

    const spawnSpray = (originX: number, originY: number, originZ: number, spreadH: number, vMin: number, vSpread: number) => {
      const i = sprayIdx;
      sprayIdx = (sprayIdx + 1) % SPRAY_N;
      sprayPos[i * 3] = originX + (Math.random() - 0.5) * 0.3;
      sprayPos[i * 3 + 1] = originY;
      sprayPos[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.3;
      sprayVel[i * 3] = (Math.random() - 0.5) * spreadH;
      sprayVel[i * 3 + 1] = vMin + Math.random() * vSpread;
      sprayVel[i * 3 + 2] = (Math.random() - 0.5) * spreadH;
      sprayLife[i] = 0.6 + Math.random() * 0.4;
    };

    const bolts: Array<{ meshes: THREE.Mesh[]; life: number; max: number }> = [];
    const shockwaves: Array<{ mesh: THREE.Mesh; life: number; max: number; delay: number }> = [];
    const geysers: Array<{ mesh: THREE.Mesh; gx: number; gz: number; life: number; max: number; delay: number; erupted: boolean }> = [];

    const tsunamiGroup = new THREE.Group();
    tsunamiGroup.visible = false;
    scene.add(tsunamiGroup);

    const tsuWidth = 14.0;
    const tsuGeo = new THREE.PlaneGeometry(tsuWidth, 4.2, 48, 24);
    const tsuAttr = tsuGeo.attributes.position;
    for (let i = 0; i < tsuAttr.count; i++) {
      const y = tsuAttr.getY(i);
      const ny = (y + 2.1) / 4.2;
      tsuAttr.setZ(i, tsuAttr.getZ(i) - Math.pow(ny, 2.2) * 2.2);
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

    const triggerZeusBolt = (from: THREE.Vector3, to: THREE.Vector3) => {
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
    };

    const triggerPoseidonSlam = (originX: number, originZ: number) => {
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
    };

    // Hades powers
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

    const spawnSoulBurst = (x: number, y: number, z: number, count = 16) => {
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
    };

    const tartarusBolts: Array<{ mesh: THREE.Group; start: THREE.Vector3; target: THREE.Vector3; progress: number; speed: number }> = [];
    const hellfirePools: Array<{ pool: THREE.Mesh; pillar: THREE.Mesh; life: number; max: number }> = [];
    const hadesShadowTrails: Array<{ mesh: THREE.Mesh; life: number; max: number }> = [];

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

    const triggerTartarusFlame = (startPos: THREE.Vector3) => {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 2.8;
      const target = new THREE.Vector3(Math.cos(a) * r, 0.08, Math.sin(a) * r);

      const boltGroup = new THREE.Group();
      boltGroup.position.copy(startPos);
      boltGroup.add(new THREE.Mesh(tartarusCoreGeo, tartarusCoreMat));
      boltGroup.add(new THREE.Mesh(tartarusAuraGeo, tartarusAuraMat));
      scene.add(boltGroup);

      tartarusBolts.push({ mesh: boltGroup, start: startPos.clone(), target, progress: 0, speed: 2.4 });
    };

    const eruptHellfire = (pos: THREE.Vector3) => {
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
    };

    const spawnShadowTrail = (x: number, z: number) => {
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
    };

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
    const palMatSet = new Set<THREE.Material>(Object.values(pal));

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

    let simTime = 0;
    const getSimTime = () => simTime;

    const clearCurrentSubjectGpu = () => {
      if (entityMeshRef.current) {
        scene.remove(entityMeshRef.current);
        disposeObject3D(entityMeshRef.current, { skipMaterials: palMatSet });
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
      if (terrainHandleRef.current) {
        scene.remove(terrainHandleRef.current.group);
        terrainHandleRef.current.dispose();
        terrainHandleRef.current = null;
      }
      disposeObject3D(environmentGroup, { skipMaterials: palMatSet });
      while (environmentGroup.children.length > 0) {
        environmentGroup.remove(environmentGroup.children[0]);
      }
    };

    const buildCurrentEntity = () => {
      clearCurrentSubjectGpu();
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
          worldSize: mapWorldSize,
        });
        dioramaHandleRef.current = handle;
        group = handle.group;
        setDioramaMetrics({
          minHeight: Number(handle.minHeight.toFixed(2)),
          maxHeight: Number(handle.maxHeight.toFixed(2)),
          waterCoveragePct: handle.waterCoveragePct,
          effectiveBiome: mapCfg.biomeLabel,
          worldSizeLabel: handle.worldSizeLabel,
          dimsLabel: handle.dimsLabel,
          playableDimsLabel: handle.playableDimsLabel,
          baseDistance: handle.baseDistance,
          treeClusterCount: handle.treeClusterCount,
          goldMineCount: handle.goldMineCount,
          settlementCount: handle.settlementCount,
          faunaCount: handle.faunaCount,
        });
      } else if (galleryCategory === 'terrain') {
        const terrainBg =
          selectedTerrainItem.filterGroup === 'magma'
            ? new THREE.Color(0x160908)
            : selectedTerrainItem.filterGroup === 'water'
            ? new THREE.Color(terrainRedTide ? 0x1a080b : 0x07141f)
            : new THREE.Color(0x0c111a);
        scene.background = terrainBg;
        scene.fog = new THREE.FogExp2(terrainBg.getHex(), 0.015);

        const handle = buildTerrainGalleryMesh(selectedTerrainItem, {
          showWireframe: terrainWireframe,
          variantSeed: terrainVariantSeed,
          redTide: terrainRedTide,
          castShadows: !isSoftwareGl,
        });
        terrainHandleRef.current = handle;
        group = handle.group;

        if (showHumanScale) {
          const refVillager = createUnitMesh('villager', 'player', pal, !isSoftwareGl, selectedCiv, selectedMajorGod);
          refVillager.position.set(-2.65, 0.32, 1.45);
          refVillager.rotation.y = 0.55;
          environmentGroup.add(refVillager);
        }
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
        addPedestal(1.85, 2.05, utensilAccentHex);

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
        const relicBg = new THREE.Color(relicAuraHex).multiplyScalar(0.11);
        scene.background = relicBg;
        scene.fog = new THREE.FogExp2(relicBg.getHex(), 0.02);
        addPedestal(1.9, 2.15, relicAuraHex);

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
        group = buildBuildingStudioSubject({
          scene,
          environmentGroup,
          defaultBg,
          pal,
          isSoftwareGl,
          selectedCiv,
          selectedMajorGod,
          selectedBuilding,
          buildingAge,
          showHumanScale,
          getSimTime,
          fortressActionRef,
          atlanteanFortressActionRef,
          norseFortressActionRef,
          templeActionRef,
          addPedestal,
        });
      } else {
        const godRes = buildGodStudioSubject({
          scene,
          environmentGroup,
          selectedCiv,
          selectedUnit,
          bidentLight,
          ashPoints,
          getSimTime,
          addPedestal,
          pushLocalDisposable: (d) => localDisposables.push(d),
          spawnSpray,
          spawnShadowTrail,
          zeusModeRef,
          poseidonModeRef,
          hadesModeRef,
          artemisModeRef,
          hefestoModeRef,
          dionisioModeRef,
          afroditeModeRef,
          apoloModeRef,
          aresModeRef,
          atenaModeRef,
          hermesModeRef,
          isisModeRef,
          setModeRef,
          raModeRef,
        });

        if (godRes) {
          group = godRes.group;
          if (godRes.zeusClouds) zeusClouds = godRes.zeusClouds;
          if (godRes.poseidonOceanPos) poseidonOceanPos = godRes.poseidonOceanPos;
          if (godRes.poseidonOceanInitY) poseidonOceanInitY = godRes.poseidonOceanInitY;
          if (godRes.hadesEnv) hadesEnv = godRes.hadesEnv;
          if (godRes.hadesBidentAnchor) hadesBidentAnchor = godRes.hadesBidentAnchor;
        } else {
          const humanGroup = buildHumanUnitStudioSubject({
            scene,
            environmentGroup,
            defaultBg,
            pal,
            isSoftwareGl,
            selectedCiv,
            selectedMajorGod,
            selectedUnit,
            activeTier,
            getSimTime,
            addPedestal,
            spawnSpark,
            hopliteActionRef,
            villagerGenderRef,
            villagerTaskRef,
            norseWorkerModeRef,
            norseWorkerTaskRef,
            egyptianLaborerGenderRef,
            egyptianLaborerTaskRef,
            atlanteanCitizenModeRef,
            atlanteanCitizenTaskRef,
            atlanteanIsHeroRef,
            myrmidonFuryRef,
          });
          if (humanGroup) {
            group = humanGroup;
          } else {
            const mythGroup = buildMythUnitStudioSubject({
              scene,
              selectedCiv,
              selectedUnit,
              getSimTime,
              addPedestal,
              spawnSpark,
              medusaModeRef,
              medusaGazeCooldownRef,
              setMedusaGazeCooldown: props.setMedusaGazeCooldown,
              colossusTierRef,
              colossusActionRef,
              hydraActionModeRef,
              hydraTargetCountRef,
              hydraHeadsRef,
              setHydraHeads: props.setHydraHeads,
              setHydraTotalDamage: props.setHydraTotalDamage,
              setHydraTotalHits: props.setHydraTotalHits,
              manticoreModeRef,
              manticoreAutoCastRef,
              manticoreTargetCountRef,
              manticoreFrontlineRef,
              setManticoreVolleyCooldown: props.setManticoreVolleyCooldown,
              setManticoreQuillsFired: props.setManticoreQuillsFired,
              setManticorePiercingDamage: props.setManticorePiercingDamage,
              cyclopsModeRef,
              cyclopsAutoCastRef,
              cyclopsIsElderRef,
              cyclopsTargetIdRef,
              setCyclopsThrowCooldown: props.setCyclopsThrowCooldown,
              setCyclopsIsElder: props.setCyclopsIsElder,
              setCyclopsTotalDamage: props.setCyclopsTotalDamage,
              setCyclopsTargetId: props.setCyclopsTargetId,
              setCyclopsToast: props.setCyclopsToast,
            });
            group =
              mythGroup ??
              buildGenericUnitStudioSubject({
                scene,
                defaultBg,
                pal,
                isSoftwareGl,
                selectedUnit,
                selectedCiv,
                selectedMajorGod,
                activeTier,
                addPedestal,
              });
          }
        }
      }

      scene.add(group);
      entityMeshRef.current = group;

      const framing = getFraming(focusDivineRef.current);
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
      } else if (galleryCategory === 'terrain' && terrainHandleRef.current) {
        terrainHandleRef.current.animate(simTime, dt, terrainFxActiveRef.current);
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
      } else if (galleryCategory === 'building' && entityMeshRef.current?.userData.animatePose) {
        entityMeshRef.current.userData.animatePose(dt, false, 0, null, 'idle', 'wood');
      } else if (galleryCategory === 'unit') {
        if (zeusClouds.length > 0) {
          for (const c of zeusClouds) c.g.rotation.y += dt * 0.04;
        }
        if (poseidonOceanPos && poseidonOceanInitY) {
          for (let i = 0; i < poseidonOceanPos.count; i++) {
            const x = poseidonOceanPos.getX(i);
            const z = poseidonOceanPos.getZ(i);
            const wave = Math.sin(simTime * 2.2 + x * 0.6) * Math.cos(simTime * 1.8 + z * 0.6) * 0.14;
            poseidonOceanPos.setY(i, poseidonOceanInitY[i] + wave);
          }
          poseidonOceanPos.needsUpdate = true;
        }
        if (hadesEnv) {
          for (const rg of hadesEnv.runeRings) rg.rotation.z += dt * 0.08;
          for (const pf of hadesEnv.pillarFlames) {
            const fl = 1 + Math.sin(simTime * 6.0 + pf.phase) * 0.12;
            pf.f1.scale.set(fl, fl * 1.1, fl);
            pf.f2.scale.set(fl * 0.95, fl, fl * 0.95);
          }
        }

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

      // Particle updates
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

      clearCurrentSubjectGpu();
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

      disposeMaterialPalette(pal);
      marbleTex.dispose();
      shadowTex.dispose();
      ringPlayerTex.dispose();
      ringEnemyTex.dispose();

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
    mapWorldSize,
    mapSeedTick,
    selectedFauna,
    selectedFloraId,
    floraVariantSeed,
    selectedUtensilId,
    selectedRelicId,
    selectedTerrainId,
    terrainVariantSeed,
    terrainWireframe,
    terrainRedTide,
    showHumanScale,
  ]);

  return (
    <div
      ref={mount3DRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}
