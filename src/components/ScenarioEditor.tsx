import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  Copy,
  Eraser,
  Grid,
  Layers,
  Mountain,
  Move,
  Paintbrush,
  Play,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
  Sun,
  Trees,
  Undo2,
  Waves,
  X,
} from 'lucide-react';
import { createMaterialPalette } from '../game/models';
import { createContactShadowTexture, createMarbleTexture, createSelectionRingTexture } from '../game/textures';
import { DifficultyId, MapId, MatchStartOptions, PantheonId, WorldSizeId } from '../game/types';
import {
  CLIFF_STYLE_OPTIONS,
  EditorCliffStyle,
  EditorForestStyle,
  EditorObjectCatalogItem,
  EditorObjectCategory,
  EditorPantheonFilter,
  EditorTerrainPaintId,
  EditorToolId,
  EditorWaterMode,
  FOREST_STYLE_OPTIONS,
  PLAYER_COLORS,
  SCENARIO_OBJECT_CATALOG,
  ScenarioDocument,
  TERRAIN_PAINT_PALETTE,
  PlacedScenarioObject,
  buildPlacedScenarioObjectMesh,
  compileScenarioToRmsMap,
  createScenarioDocument,
  getLightingPresetById,
  saveScenarioToStorage,
  setActiveRmsMap,
  setActiveScenarioPlaytest,
} from '../maps';
import { EditorModalId, ScenarioEditorModals } from './ScenarioEditorModals';
import {
  EDITOR_COMMANDS_LIST,
  EditorSnapshot,
  makeSkyGradientTexture,
  sampleGridHeight,
  TERRAIN_CODE_COLORS,
  TerrainClipboard,
  TopMenuId,
} from './scenarioEditor/editorHelpers';

interface ScenarioEditorProps {
  onClose: () => void;
  onStartMatch: (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    options?: MatchStartOptions
  ) => void;
  gameSpeed?: number;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({ onClose, onStartMatch, gameSpeed = 1 }) => {
  const [doc, setDoc] = useState<ScenarioDocument>(() =>
    createScenarioDocument({ baseMapId: 'blank_grass', worldSize: 'normal', maxPlayers: 2, title: 'Cenário do Olimpo' })
  );
  const docRef = useRef<ScenarioDocument>(doc);
  docRef.current = doc;

  // UI & Menu state
  const [openMenu, setOpenMenu] = useState<TopMenuId>(null);
  const [activeModal, setActiveModal] = useState<EditorModalId>(null);
  const [showCommandsWindow, setShowCommandsWindow] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string>('Editor 3D pronto — Atalhos: O Objetos • T Terra • W Água • C Penhasco • F Floresta • E Comandos • K Escala • Y Sol');

  // Tool state
  const [activeTool, setActiveTool] = useState<EditorToolId>('place_object');
  const [brushRadius, setBrushRadius] = useState<number>(6);
  const [brushStrength, setBrushStrength] = useState<number>(0.45);
  const [paintTerrainId, setPaintTerrainId] = useState<EditorTerrainPaintId>('grass');
  const [waterMode, setWaterMode] = useState<EditorWaterMode>('shallow');
  const [cliffStyle, setCliffStyle] = useState<EditorCliffStyle>('greek_marble');
  const [forestStyle, setForestStyle] = useState<EditorForestStyle>('nordic_pine');
  const [sampledElevation, setSampledElevation] = useState<number | null>(null);

  // Object tool state
  const [activePlayerSlot, setActivePlayerSlot] = useState<number>(1);
  const [objCategory, setObjCategory] = useState<EditorObjectCategory>('all');
  const [objPantheon, setObjPantheon] = useState<EditorPantheonFilter>('all');
  const [objSearch, setObjSearch] = useState<string>('');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('unit_hoplite');
  const [placementRotation, setPlacementRotation] = useState<number>(0);
  const [placementScale, setPlacementScale] = useState<number>(1);
  const [alignToGrid, setAlignToGrid] = useState<boolean>(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // Clipboards & Undo/Redo
  const [copiedObject, setCopiedObject] = useState<PlacedScenarioObject | null>(null);
  const [unitPasteMode, setUnitPasteMode] = useState<boolean>(false);
  const [pasteRotation, setPasteRotation] = useState<number>(0);
  const [terrainClipboard, setTerrainClipboard] = useState<TerrainClipboard | null>(null);
  const undoStackRef = useRef<EditorSnapshot[]>([]);
  const redoStackRef = useRef<EditorSnapshot[]>([]);
  const [historyVersion, setHistoryVersion] = useState<number>(0);

  // Sync live tool params into ref for pointer handlers
  const toolStateRef = useRef({
    activeTool,
    brushRadius,
    brushStrength,
    paintTerrainId,
    waterMode,
    cliffStyle,
    forestStyle,
    sampledElevation,
    activePlayerSlot,
    selectedCatalogId,
    placementRotation,
    placementScale,
    alignToGrid,
    selectedUid,
    copiedObject,
    unitPasteMode,
    pasteRotation,
    terrainClipboard,
  });
  toolStateRef.current = {
    activeTool,
    brushRadius,
    brushStrength,
    paintTerrainId,
    waterMode,
    cliffStyle,
    forestStyle,
    sampledElevation,
    activePlayerSlot,
    selectedCatalogId,
    placementRotation,
    placementScale,
    alignToGrid,
    selectedUid,
    copiedObject,
    unitPasteMode,
    pasteRotation,
    terrainClipboard,
  };

  // Three.js refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const objectMeshesRef = useRef<Map<string, { group: THREE.Group; signature: string }>>(new Map());
  const paletteRef = useRef<ReturnType<typeof createMaterialPalette> | null>(null);
  const brushRingRef = useRef<THREE.Mesh | null>(null);
  const selectRingRef = useRef<THREE.Mesh | null>(null);
  const copyRectMeshRef = useRef<THREE.LineLoop | null>(null);
  const wallPreviewGroupRef = useRef<THREE.Group | null>(null);
  const skyTexRef = useRef<THREE.CanvasTexture | null>(null);
  const isSoftwareGlRef = useRef<boolean>(false);

  // Camera orbit/pan state
  const camTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const camYawRef = useRef<number>(Math.PI * 0.25);
  const camPitchRef = useRef<number>(0.88);
  const camDistRef = useRef<number>(72);
  const keysDownRef = useRef<Set<string>>(new Set());

  // Pointer drag state
  const dragModeRef = useRef<'none' | 'paint' | 'pan' | 'orbit' | 'move_obj' | 'terrain_copy' | 'wall_drag'>('none');
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartWorldRef = useRef<{ x: number; z: number } | null>(null);
  const strokeSavedUndoRef = useRef<boolean>(false);
  const forestLastSpawnRef = useRef<{ x: number; z: number } | null>(null);

  const pushUndoSnapshot = useCallback((sourceDoc?: ScenarioDocument) => {
    const d = sourceDoc ?? docRef.current;
    undoStackRef.current.push({
      heightGrid: [...d.heightGrid],
      terrainGrid: [...d.terrainGrid],
      objects: d.objects.map((o) => ({ ...o })),
    });
    if (undoStackRef.current.length > 35) undoStackRef.current.shift();
    redoStackRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, []);

  const handleUndo = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (!prev) {
      setStatusBanner('Nada para desfazer.');
      return;
    }
    const curr = docRef.current;
    redoStackRef.current.push({
      heightGrid: [...curr.heightGrid],
      terrainGrid: [...curr.terrainGrid],
      objects: curr.objects.map((o) => ({ ...o })),
    });
    setDoc((d) => ({ ...d, heightGrid: prev.heightGrid, terrainGrid: prev.terrainGrid, objects: prev.objects }));
    setHistoryVersion((v) => v + 1);
    setStatusBanner('Ação desfeita (Ctrl+Z).');
  }, []);

  const handleRedo = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) {
      setStatusBanner('Nada para refazer.');
      return;
    }
    const curr = docRef.current;
    undoStackRef.current.push({
      heightGrid: [...curr.heightGrid],
      terrainGrid: [...curr.terrainGrid],
      objects: curr.objects.map((o) => ({ ...o })),
    });
    setDoc((d) => ({ ...d, heightGrid: next.heightGrid, terrainGrid: next.terrainGrid, objects: next.objects }));
    setHistoryVersion((v) => v + 1);
    setStatusBanner('Ação refeita (Ctrl+Y).');
  }, []);

  const selectedObject = useMemo(
    () => doc.objects.find((o) => o.uid === selectedUid) ?? null,
    [doc.objects, selectedUid]
  );

  // Filtered catalog list
  const filteredCatalog = useMemo(() => {
    const q = objSearch.trim().toLowerCase();
    const placedIds = new Set(doc.objects.map((o) => o.catalogId));
    return SCENARIO_OBJECT_CATALOG.filter((item) => {
      if (objCategory === 'current') {
        if (!placedIds.has(item.id)) return false;
      } else if (objCategory !== 'all' && item.category !== objCategory) {
        return false;
      }
      if (objPantheon !== 'all' && item.pantheon !== objPantheon) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [objCategory, objPantheon, objSearch, doc.objects]);

  const rebuildTerrainGeometry = useCallback((targetDoc: ScenarioDocument) => {
    const mesh = terrainMeshRef.current;
    if (!mesh) return;
    const gs = targetDoc.gridSize;
    const oldGeo = mesh.geometry;
    const geo = new THREE.PlaneGeometry(targetDoc.widthMeters, targetDoc.depthMeters, gs - 1, gs - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const tmpColor = new THREE.Color();
    const rockTint = new THREE.Color(0x6e6963);

    for (let i = 0; i < pos.count; i++) {
      const h = (targetDoc.heightGrid[i] ?? 0.35) + targetDoc.globalElevationOffset;
      pos.setY(i, h);

      const code = targetDoc.terrainGrid[i] ?? 1;
      const base = TERRAIN_CODE_COLORS[code] ?? TERRAIN_CODE_COLORS[1];
      tmpColor.copy(base);

      // Subtle elevation & slope variation for visual readability
      const gx = i % gs;
      const gz = Math.floor(i / gs);
      const hR = targetDoc.heightGrid[gz * gs + Math.min(gs - 1, gx + 1)] ?? h;
      const hD = targetDoc.heightGrid[Math.min(gs - 1, gz + 1) * gs + gx] ?? h;
      const slope = Math.abs(hR - (targetDoc.heightGrid[i] ?? 0.35)) + Math.abs(hD - (targetDoc.heightGrid[i] ?? 0.35));
      if (slope > 0.55 && code !== 0 && code !== 8 && code !== 9) {
        tmpColor.lerp(rockTint, Math.min(0.65, slope * 0.45));
      }
      const shade = 0.88 + Math.max(-0.18, Math.min(0.24, (h - 0.3) * 0.08));
      colors[i * 3] = Math.min(1, tmpColor.r * shade);
      colors[i * 3 + 1] = Math.min(1, tmpColor.g * shade);
      colors[i * 3 + 2] = Math.min(1, tmpColor.b * shade);
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    mesh.geometry = geo;
    oldGeo?.dispose();

    // Update water plane size & height
    if (waterMeshRef.current) {
      const wOld = waterMeshRef.current.geometry;
      waterMeshRef.current.geometry = new THREE.PlaneGeometry(targetDoc.widthMeters, targetDoc.depthMeters);
      waterMeshRef.current.geometry.rotateX(-Math.PI / 2);
      wOld?.dispose();
      waterMeshRef.current.position.y = -0.22 + targetDoc.globalElevationOffset;

      let lavaCount = 0;
      let shallowCount = 0;
      for (let i = 0; i < targetDoc.terrainGrid.length; i++) {
        if (targetDoc.terrainGrid[i] === 9) lavaCount++;
        else if (targetDoc.terrainGrid[i] === 8) shallowCount++;
      }
      const mat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
      if (lavaCount > 45) {
        mat.color.setHex(0xff551a);
        mat.emissive.setHex(0x8a1c00);
        mat.emissiveIntensity = 0.55;
        mat.opacity = 0.88;
      } else if (shallowCount > 25) {
        mat.color.setHex(0x2899b8);
        mat.emissive.setHex(0x093142);
        mat.emissiveIntensity = 0.2;
        mat.opacity = 0.66;
      } else {
        mat.color.setHex(0x1b6d96);
        mat.emissive.setHex(0x062030);
        mat.emissiveIntensity = 0.16;
        mat.opacity = 0.72;
      }
    }

    // Update grid helper
    if (gridHelperRef.current && sceneRef.current) {
      sceneRef.current.remove(gridHelperRef.current);
      gridHelperRef.current.geometry?.dispose();
      const maxDim = Math.max(targetDoc.widthMeters, targetDoc.depthMeters);
      const gh = new THREE.GridHelper(maxDim, Math.max(16, Math.round(maxDim / 4)), 0xd4af37, 0x334155);
      gh.position.y = 0.42 + targetDoc.globalElevationOffset;
      gh.visible = showGridOverlay;
      sceneRef.current.add(gh);
      gridHelperRef.current = gh;
    }
  }, [showGridOverlay]);

  // Sync lighting & sky preset
  const applyLightingToScene = useCallback((targetDoc: ScenarioDocument) => {
    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const hemi = hemiLightRef.current;
    const renderer = rendererRef.current;
    if (!scene || !sun || !hemi || !renderer) return;

    const preset = getLightingPresetById(targetDoc.lightingId);
    const azRad = THREE.MathUtils.degToRad(targetDoc.sunAzimuthDeg);
    const elRad = THREE.MathUtils.degToRad(Math.max(5, Math.min(86, targetDoc.sunElevationDeg)));
    const dist = 115;
    sun.position.set(
      Math.cos(elRad) * Math.cos(azRad) * dist,
      Math.sin(elRad) * dist,
      Math.cos(elRad) * Math.sin(azRad) * dist
    );
    sun.color.setHex(preset.sunColorHex);
    // Lower sun naturally dims direct intensity slightly and creates warmer dramatic shadows
    const elevFactor = Math.max(0.45, Math.min(1.15, targetDoc.sunElevationDeg / 45));
    sun.intensity = preset.sunIntensity * elevFactor;

    hemi.color.setHex(preset.hemiSkyHex);
    hemi.groundColor.setHex(preset.hemiGroundHex);
    hemi.intensity = preset.hemiIntensity;

    scene.fog = new THREE.FogExp2(preset.fogHex, preset.fogDensity * 0.55);
    renderer.toneMappingExposure = preset.exposure;

    if (skyTexRef.current) {
      skyTexRef.current.dispose();
      skyTexRef.current = null;
    }
    if (targetDoc.skyBoxEnabled) {
      const tex = makeSkyGradientTexture(preset.skyTopHex, preset.skyHorizonHex);
      skyTexRef.current = tex;
      scene.background = tex;
    } else {
      scene.background = new THREE.Color(preset.fogHex);
    }
  }, []);

  // Sync placed objects incrementally
  const syncPlacedObjects = useCallback((targetDoc: ScenarioDocument) => {
    const group = objectsGroupRef.current;
    const pal = paletteRef.current;
    if (!group || !pal) return;

    const playerPantheons: Record<number, PantheonId> = {};
    for (const p of targetDoc.players) playerPantheons[p.slot] = p.pantheon;

    const map = objectMeshesRef.current;
    const seen = new Set<string>();
    const shadows = !isSoftwareGlRef.current;

    for (const obj of targetDoc.objects) {
      seen.add(obj.uid);
      const sig = `${obj.catalogId}|${obj.playerSlot}|${playerPantheons[obj.playerSlot] ?? 'greek'}|${obj.buildingKind ?? ''}`;
      let entry = map.get(obj.uid);
      if (!entry || entry.signature !== sig) {
        if (entry) group.remove(entry.group);
        const built = buildPlacedScenarioObjectMesh(obj, pal, playerPantheons, shadows);
        group.add(built);
        entry = { group: built, signature: sig };
        map.set(obj.uid, entry);
      }
      const groundY = sampleGridHeight(targetDoc, obj.x, obj.z);
      entry.group.position.set(obj.x, Math.max(-0.22 + targetDoc.globalElevationOffset, groundY), obj.z);
      entry.group.rotation.y = obj.rotationY;
      entry.group.scale.setScalar(obj.scale || 1);
      entry.group.userData.scenarioUid = obj.uid;
    }

    for (const [uid, entry] of map.entries()) {
      if (!seen.has(uid)) {
        group.remove(entry.group);
        map.delete(uid);
      }
    }
  }, []);

  // Initialize Three.js scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Software WebGL detection probe
    let isSw = false;
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') || probe.getContext('webgl');
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        const rendererStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
        isSw = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
      }
    } catch {
      isSw = false;
    }
    isSoftwareGlRef.current = isSw;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSw,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSw ? 1 : 2));
    renderer.setSize(mount.clientWidth || 960, mount.clientHeight || 600);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.shadowMap.enabled = !isSw;
    if (!isSw) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // RoomEnvironment IBL
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.40;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      46,
      (mount.clientWidth || 960) / Math.max(1, mount.clientHeight || 600),
      0.5,
      620
    );
    cameraRef.current = camera;

    const hemi = new THREE.HemisphereLight(0x8ec5fc, 0x4b5c3e, 0.72);
    scene.add(hemi);
    hemiLightRef.current = hemi;

    const sun = new THREE.DirectionalLight(0xfff5dc, 1.85);
    sun.position.set(60, 85, 45);
    if (!isSw) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.near = 10;
      sun.shadow.camera.far = 280;
      sun.shadow.camera.left = -95;
      sun.shadow.camera.right = 95;
      sun.shadow.camera.top = 95;
      sun.shadow.camera.bottom = -95;
      sun.shadow.bias = -0.0005;
    }
    scene.add(sun);
    sunLightRef.current = sun;

    const marbleTex = createMarbleTexture(1);
    const shadowTex = createContactShadowTexture();
    const ringPlayerTex = createSelectionRingTexture('#38bdf8');
    const ringEnemyTex = createSelectionRingTexture('#ef4444');
    paletteRef.current = createMaterialPalette(marbleTex, shadowTex, ringPlayerTex, ringEnemyTex, 0x38bdf8);

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      flatShading: false,
    });
    const terrainMesh = new THREE.Mesh(new THREE.PlaneGeometry(148, 148, 1, 1), terrainMat);
    terrainMesh.receiveShadow = !isSw;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1b6d96,
      roughness: 0.16,
      metalness: 0.28,
      transparent: true,
      opacity: 0.72,
    });
    const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(148, 148), waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -0.22;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    const gridHelper = new THREE.GridHelper(148, 37, 0xd4af37, 0x334155);
    gridHelper.position.y = 0.42;
    gridHelper.visible = false;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // 3D Brush Ring Cursor
    const brushGeo = new THREE.RingGeometry(0.86, 1.0, 40);
    brushGeo.rotateX(-Math.PI / 2);
    const brushMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthTest: false });
    const brushRing = new THREE.Mesh(brushGeo, brushMat);
    brushRing.visible = false;
    brushRing.renderOrder = 20;
    scene.add(brushRing);
    brushRingRef.current = brushRing;

    // 3D Selection Ring
    const selGeo = new THREE.RingGeometry(1.4, 1.72, 32);
    selGeo.rotateX(-Math.PI / 2);
    const selMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthTest: false });
    const selRing = new THREE.Mesh(selGeo, selMat);
    selRing.visible = false;
    selRing.renderOrder = 22;
    scene.add(selRing);
    selectRingRef.current = selRing;

    // Terrain Copy Rectangle Outline
    const rectPts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(0, 0, 1),
    ];
    const copyRectGeo = new THREE.BufferGeometry().setFromPoints(rectPts);
    const copyRect = new THREE.LineLoop(copyRectGeo, new THREE.LineBasicMaterial({ color: 0x34d399, depthTest: false }));
    copyRect.visible = false;
    copyRect.renderOrder = 25;
    scene.add(copyRect);
    copyRectMeshRef.current = copyRect;

    // Wall Drag Preview Group
    const wallPreview = new THREE.Group();
    scene.add(wallPreview);
    wallPreviewGroupRef.current = wallPreview;

    // Initial sync
    rebuildTerrainGeometry(docRef.current);
    applyLightingToScene(docRef.current);
    syncPlacedObjects(docRef.current);

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      if (!mount) return;
      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || 500;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    // Paced render loop (fenceSync on software WebGL, rAF on hardware GPU)
    let disposed = false;
    let rafId = 0;
    let lastTs = performance.now();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (isSw && gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          if (!sync || gl.clientWaitSync(sync, 0, 0) !== gl.TIMEOUT_EXPIRED) {
            if (sync) gl.deleteSync(sync);
            cb();
          } else {
            setTimeout(poll, 4);
          }
        };
        setTimeout(poll, 0);
      } else {
        rafId = requestAnimationFrame(cb);
      }
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      // Keyboard camera pan (WASD / Arrows)
      const keys = keysDownRef.current;
      if (keys.size > 0) {
        const panSpeed = Math.max(22, camDistRef.current * 0.65) * dt;
        const yaw = camYawRef.current;
        const fwdX = -Math.sin(yaw);
        const fwdZ = -Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);
        let dx = 0;
        let dz = 0;
        if (keys.has('KeyW') || keys.has('ArrowUp')) {
          dx += fwdX;
          dz += fwdZ;
        }
        if (keys.has('KeyS') || keys.has('ArrowDown')) {
          dx -= fwdX;
          dz -= fwdZ;
        }
        if (keys.has('KeyD') || keys.has('ArrowRight')) {
          dx += rightX;
          dz += rightZ;
        }
        if (keys.has('KeyA') || keys.has('ArrowLeft')) {
          dx -= rightX;
          dz -= rightZ;
        }
        if (dx !== 0 || dz !== 0) {
          const len = Math.hypot(dx, dz) || 1;
          const halfW = docRef.current.widthMeters * 0.52;
          const halfD = docRef.current.depthMeters * 0.52;
          camTargetRef.current.x = Math.max(-halfW, Math.min(halfW, camTargetRef.current.x + (dx / len) * panSpeed));
          camTargetRef.current.z = Math.max(-halfD, Math.min(halfD, camTargetRef.current.z + (dz / len) * panSpeed));
        }
      }

      // Position camera from yaw/pitch/distance
      const dist = camDistRef.current;
      const pitch = camPitchRef.current;
      const yaw = camYawRef.current;
      const tgt = camTargetRef.current;
      const horiz = Math.cos(pitch) * dist;
      camera.position.set(
        tgt.x + Math.sin(yaw) * horiz,
        tgt.y + Math.sin(pitch) * dist,
        tgt.z + Math.cos(yaw) * horiz
      );
      camera.lookAt(tgt.x, tgt.y, tgt.z);

      // Update selection ring position
      const selId = toolStateRef.current.selectedUid;
      if (selectRingRef.current) {
        const selObj = selId ? docRef.current.objects.find((o) => o.uid === selId) : null;
        if (selObj) {
          const y = sampleGridHeight(docRef.current, selObj.x, selObj.z);
          selectRingRef.current.visible = true;
          selectRingRef.current.position.set(selObj.x, Math.max(-0.1, y + 0.15), selObj.z);
          selectRingRef.current.scale.setScalar(Math.max(0.8, (selObj.scale || 1) * (selObj.kindType === 'building' ? 1.85 : 1.0)));
        } else {
          selectRingRef.current.visible = false;
        }
      }

      renderer.render(scene, camera);
      afterDraw(tick);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      envRT.dispose();
      skyTexRef.current?.dispose();
      terrainMesh.geometry?.dispose();
      terrainMat.dispose();
      waterMesh.geometry?.dispose();
      waterMat.dispose();
      brushGeo.dispose();
      brushMat.dispose();
      selGeo.dispose();
      selMat.dispose();
      copyRectGeo.dispose();
      objectMeshesRef.current.clear();
      renderer.dispose();
    };
  }, [applyLightingToScene, rebuildTerrainGeometry, syncPlacedObjects]);

  // Re-sync Three.js whenever doc changes
  useEffect(() => {
    rebuildTerrainGeometry(doc);
    applyLightingToScene(doc);
    syncPlacedObjects(doc);
  }, [doc, rebuildTerrainGeometry, applyLightingToScene, syncPlacedObjects]);

  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGridOverlay;
  }, [showGridOverlay]);

  // Helper: Raycast pointer onto terrain plane
  const raycastTerrainPoint = useCallback((clientX: number, clientY: number): THREE.Vector3 | null => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    const terrain = terrainMeshRef.current;
    if (!mount || !camera || !terrain) return null;
    const rect = mount.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(terrain, false);
    if (hits.length > 0) return hits[0].point;
    // Fallback intersection on y=0 plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -docRef.current.globalElevationOffset);
    const pt = new THREE.Vector3();
    return raycaster.ray.intersectPlane(plane, pt) ? pt : null;
  }, []);

  // Helper: Pick closest placed object near world point
  const pickObjectAtWorld = useCallback((wx: number, wz: number, maxDist = 3.2): PlacedScenarioObject | null => {
    let best: PlacedScenarioObject | null = null;
    let bestD = maxDist;
    for (const o of docRef.current.objects) {
      const hitR = (o.kindType === 'building' ? 3.8 : 2.2) * Math.max(0.7, o.scale || 1);
      const d = Math.hypot(o.x - wx, o.z - wz);
      if (d <= Math.max(maxDist, hitR) && d < bestD) {
        bestD = d;
        best = o;
      }
    }
    return best;
  }, []);

  // Apply terrain brush at world (wx, wz)
  const applyTerrainBrushAt = useCallback((wx: number, wz: number, shiftKey: boolean) => {
    const ts = toolStateRef.current;
    const tool = ts.activeTool;
    const radius = ts.brushRadius;
    const strength = ts.brushStrength;

    setDoc((prev) => {
      const gs = prev.gridSize;
      const halfW = prev.widthMeters / 2;
      const halfD = prev.depthMeters / 2;
      const cellW = prev.widthMeters / (gs - 1);
      const cellD = prev.depthMeters / (gs - 1);
      const cx = ((wx + halfW) / prev.widthMeters) * (gs - 1);
      const cz = ((wz + halfD) / prev.depthMeters) * (gs - 1);
      const radCellsX = Math.ceil(radius / Math.max(0.2, cellW));
      const radCellsZ = Math.ceil(radius / Math.max(0.2, cellD));

      const minX = Math.max(0, Math.floor(cx - radCellsX));
      const maxX = Math.min(gs - 1, Math.ceil(cx + radCellsX));
      const minZ = Math.max(0, Math.floor(cz - radCellsZ));
      const maxZ = Math.min(gs - 1, Math.ceil(cz + radCellsZ));

      const nextH = [...prev.heightGrid];
      const nextT = [...prev.terrainGrid];
      const nextObjects = [...prev.objects];

      const paintDef = TERRAIN_PAINT_PALETTE.find((p) => p.id === ts.paintTerrainId) ?? TERRAIN_PAINT_PALETTE[0];
      const cliffDef = CLIFF_STYLE_OPTIONS.find((c) => c.id === ts.cliffStyle) ?? CLIFF_STYLE_OPTIONS[0];
      const forestDef = FOREST_STYLE_OPTIONS.find((f) => f.id === ts.forestStyle) ?? FOREST_STYLE_OPTIONS[0];

      // Sample elevation on first click if needed
      let targetSampleH = ts.sampledElevation;
      if (tool === 'elevate_sample' && targetSampleH === null) {
        const sx = Math.max(0, Math.min(gs - 1, Math.round(cx)));
        const sz = Math.max(0, Math.min(gs - 1, Math.round(cz)));
        targetSampleH = prev.heightGrid[sz * gs + sx] ?? 0.35;
        setSampledElevation(targetSampleH);
      }

      for (let gz = minZ; gz <= maxZ; gz++) {
        for (let gx = minX; gx <= maxX; gx++) {
          const px = -halfW + gx * cellW;
          const pz = -halfD + gz * cellD;
          const dist = Math.hypot(px - wx, pz - wz);
          if (dist > radius) continue;
          const falloff = Math.cos((dist / Math.max(0.01, radius)) * (Math.PI / 2));
          const idx = gz * gs + gx;

          if (tool === 'paint_terrain') {
            nextT[idx] = paintDef.code;
          } else if (tool === 'paint_land') {
            nextT[idx] = paintDef.code;
            const targetH = paintDef.landHeightDelta;
            nextH[idx] = nextH[idx] + (targetH - nextH[idx]) * Math.min(1, falloff * strength * 0.75);
          } else if (tool === 'elevate') {
            const dir = shiftKey ? -1 : 1;
            nextH[idx] = Math.max(-4.5, Math.min(10, nextH[idx] + dir * falloff * strength * 0.65));
          } else if (tool === 'elevate_circular') {
            // Flat-top circular plateau / crater
            const plateauMask = dist < radius * 0.7 ? 1 : falloff;
            const dir = shiftKey ? -1 : 1;
            nextH[idx] = Math.max(-4.5, Math.min(10, nextH[idx] + dir * plateauMask * strength * 0.6));
          } else if (tool === 'elevate_sample') {
            const tgt = targetSampleH ?? 0.35;
            nextH[idx] = nextH[idx] + (tgt - nextH[idx]) * Math.min(1, falloff * 0.85);
          } else if (tool === 'smooth') {
            let sum = 0;
            let cnt = 0;
            for (let dz = -1; dz <= 1; dz++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = Math.max(0, Math.min(gs - 1, gx + dx));
                const nz = Math.max(0, Math.min(gs - 1, gz + dz));
                sum += prev.heightGrid[nz * gs + nx] ?? 0.35;
                cnt++;
              }
            }
            const avg = sum / Math.max(1, cnt);
            nextH[idx] = nextH[idx] + (avg - nextH[idx]) * Math.min(1, falloff * strength * 1.15);
          } else if (tool === 'roughen') {
            const noise = (Math.sin(gx * 12.9898 + gz * 78.233 + performance.now() * 0.001) * 43758.5453) % 1;
            const jitter = (noise - 0.5) * 0.9 * strength * falloff;
            nextH[idx] = Math.max(-4, Math.min(9.5, nextH[idx] + jitter));
          } else if (tool === 'paint_water') {
            if (ts.waterMode === 'shallow') {
              // Retold passable & buildable Shallow Water
              nextT[idx] = 8;
              const targetH = -0.36;
              nextH[idx] = nextH[idx] + (targetH - nextH[idx]) * Math.min(1, falloff * 0.85);
            } else if (ts.waterMode === 'river') {
              nextT[idx] = dist > radius * 0.72 ? 8 : 0;
              const targetH = dist > radius * 0.72 ? -0.38 : -1.45;
              nextH[idx] = nextH[idx] + (targetH - nextH[idx]) * Math.min(1, falloff * 0.85);
            } else {
              nextT[idx] = 0;
              const targetH = -2.25;
              nextH[idx] = nextH[idx] + (targetH - nextH[idx]) * Math.min(1, falloff * 0.85);
            }
          } else if (tool === 'paint_cliff') {
            nextT[idx] = ts.cliffStyle === 'ice_glacier' ? 6 : 4;
            const plateau = dist < radius * 0.62 ? 1 : falloff;
            const targetH = shiftKey ? 0.35 : cliffDef.height;
            nextH[idx] = nextH[idx] + (targetH - nextH[idx]) * Math.min(1, plateau * 0.72);
          } else if (tool === 'paint_forest') {
            nextT[idx] = 7;
          } else if (tool === 'edit_water_beautify') {
            // Soften water shoreline + paint fertile sand/grass rim
            const h = prev.heightGrid[idx] ?? 0.35;
            if (h > -0.35 && h < 0.75) {
              nextT[idx] = dist > radius * 0.65 ? 5 : 3;
            }
          }
        }
      }

      // Forest tool spawns dense trees cleanly spaced
      if (tool === 'paint_forest') {
        const last = forestLastSpawnRef.current;
        if (!last || Math.hypot(wx - last.x, wz - last.z) >= Math.max(2.2, radius * 0.48)) {
          forestLastSpawnRef.current = { x: wx, z: wz };
          const count = Math.max(2, Math.min(6, Math.round(radius * 0.65)));
          for (let i = 0; i < count; i++) {
            const ang = (i / count) * Math.PI * 2 + Math.random() * 0.9;
            const rr = Math.random() * radius * 0.85;
            const tx = wx + Math.cos(ang) * rr;
            const tz = wz + Math.sin(ang) * rr;
            const tooClose = nextObjects.some((o) => Math.hypot(o.x - tx, o.z - tz) < 2.0);
            if (!tooClose) {
              nextObjects.push({
                uid: `tree_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                catalogId: `tree_${forestDef.treeStyle}`,
                name: forestDef.label,
                kindType: 'tree',
                treeStyle: forestDef.treeStyle,
                playerSlot: 0,
                x: Number(tx.toFixed(2)),
                z: Number(tz.toFixed(2)),
                rotationY: Math.random() * Math.PI * 2,
                scale: 0.85 + Math.random() * 0.35,
              });
            }
          }
        }
      }

      // Edit Water Beautify: decorate shoreline with rocks, willow/palm trees & fish spots
      if (tool === 'edit_water_beautify') {
        const last = forestLastSpawnRef.current;
        if (!last || Math.hypot(wx - last.x, wz - last.z) >= Math.max(4.5, radius * 0.75)) {
          forestLastSpawnRef.current = { x: wx, z: wz };
          for (let i = 0; i < 4; i++) {
            const ang = (i / 4) * Math.PI * 2 + Math.random() * 0.7;
            const rr = radius * (0.45 + Math.random() * 0.5);
            const sx = wx + Math.cos(ang) * rr;
            const sz = wz + Math.sin(ang) * rr;
            const h = sampleGridHeight({ ...prev, heightGrid: nextH }, sx, sz) - prev.globalElevationOffset;
            const tooClose = nextObjects.some((o) => Math.hypot(o.x - sx, o.z - sz) < 2.6);
            if (tooClose) continue;
            if (h < -0.55) {
              nextObjects.push({
                uid: `fish_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                catalogId: 'res_fish_spot',
                name: 'Cardume de Peixes',
                kindType: 'resource',
                resourceKind: 'fish_spot',
                playerSlot: 0,
                x: Number(sx.toFixed(2)),
                z: Number(sz.toFixed(2)),
                rotationY: 0,
                scale: 1,
              });
            } else if (h >= -0.15 && h < 1.2) {
              const isRock = i % 2 === 0;
              nextObjects.push(
                isRock
                  ? {
                      uid: `rock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                      catalogId: 'prop_boulder',
                      name: 'Rocha Costeira',
                      kindType: 'prop',
                      propKind: 'boulder',
                      playerSlot: 0,
                      x: Number(sx.toFixed(2)),
                      z: Number(sz.toFixed(2)),
                      rotationY: Math.random() * Math.PI * 2,
                      scale: 0.7 + Math.random() * 0.5,
                    }
                  : {
                      uid: `shore_tree_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                      catalogId: 'tree_cypress',
                      name: 'Cipreste da Margem',
                      kindType: 'tree',
                      treeStyle: 'marsh_cypress',
                      playerSlot: 0,
                      x: Number(sx.toFixed(2)),
                      z: Number(sz.toFixed(2)),
                      rotationY: Math.random() * Math.PI * 2,
                      scale: 0.9,
                    }
              );
            }
          }
        }
      }

      return { ...prev, heightGrid: nextH, terrainGrid: nextT, objects: nextObjects };
    });
  }, []);

  // Stamp copied terrain patch centered at (wx, wz)
  const pasteTerrainAt = useCallback((wx: number, wz: number) => {
    const clip = toolStateRef.current.terrainClipboard;
    if (!clip) {
      setStatusBanner('Nenhum bloco de terreno copiado. Use Editar → Copiar Terreno primeiro.');
      return;
    }
    pushUndoSnapshot();
    setDoc((prev) => {
      const gs = prev.gridSize;
      const halfW = prev.widthMeters / 2;
      const halfD = prev.depthMeters / 2;
      const cx = Math.round(((wx + halfW) / prev.widthMeters) * (gs - 1));
      const cz = Math.round(((wz + halfD) / prev.depthMeters) * (gs - 1));
      const startX = cx - Math.floor(clip.cols / 2);
      const startZ = cz - Math.floor(clip.rows / 2);
      const nextH = [...prev.heightGrid];
      const nextT = [...prev.terrainGrid];
      for (let r = 0; r < clip.rows; r++) {
        for (let c = 0; c < clip.cols; c++) {
          const gx = startX + c;
          const gz = startZ + r;
          if (gx < 0 || gx >= gs || gz < 0 || gz >= gs) continue;
          const srcIdx = r * clip.cols + c;
          const dstIdx = gz * gs + gx;
          nextH[dstIdx] = clip.heights[srcIdx];
          nextT[dstIdx] = clip.terrains[srcIdx];
        }
      }
      return { ...prev, heightGrid: nextH, terrainGrid: nextT };
    });
    setStatusBanner(`Terreno colado (${clip.cols}×${clip.rows} células).`);
  }, [pushUndoSnapshot]);

  // Place object from catalog or paste copied object
  const placeObjectAt = useCallback((wx: number, wz: number) => {
    const ts = toolStateRef.current;
    const snapX = ts.alignToGrid ? Math.round(wx / 2) * 2 : Number(wx.toFixed(2));
    const snapZ = ts.alignToGrid ? Math.round(wz / 2) * 2 : Number(wz.toFixed(2));

    if (ts.unitPasteMode && ts.copiedObject) {
      pushUndoSnapshot();
      const pasted: PlacedScenarioObject = {
        ...ts.copiedObject,
        uid: `paste_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        x: snapX,
        z: snapZ,
        rotationY: ts.pasteRotation,
      };
      setDoc((prev) => ({ ...prev, objects: [...prev.objects, pasted] }));
      setSelectedUid(pasted.uid);
      setStatusBanner(`Colado: ${pasted.name} (P${pasted.playerSlot}). Roda do mouse gira • Esc sai da colagem.`);
      return;
    }

    const item = SCENARIO_OBJECT_CATALOG.find((c) => c.id === ts.selectedCatalogId);
    if (!item) return;

    pushUndoSnapshot();
    const slot = item.kindType === 'tree' || item.kindType === 'fauna' || item.kindType === 'resource' ? 0 : ts.activePlayerSlot;
    const placed: PlacedScenarioObject = {
      uid: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      catalogId: item.id,
      name: item.name,
      kindType: item.kindType,
      unitKind: item.unitKind,
      buildingKind: item.buildingKind,
      treeStyle: item.treeStyle,
      faunaKind: item.faunaKind,
      resourceKind: item.resourceKind,
      propKind: item.propKind,
      rockKind: item.rockKind,
      emitterKind: item.emitterKind,
      playerSlot: slot,
      x: snapX,
      z: snapZ,
      rotationY: ts.placementRotation,
      scale: (item.defaultScale ?? 1) * ts.placementScale,
    };
    setDoc((prev) => ({ ...prev, objects: [...prev.objects, placed] }));
    setSelectedUid(placed.uid);
    setStatusBanner(`Colocado: ${item.name} (${slot === 0 ? 'Gaia' : `Jogador ${slot}`}).`);
  }, [pushUndoSnapshot]);

  // Delete objects within brush radius
  const deleteObjectsAt = useCallback((wx: number, wz: number) => {
    const r = Math.max(2.2, toolStateRef.current.brushRadius * 0.65);
    setDoc((prev) => {
      const remaining = prev.objects.filter((o) => Math.hypot(o.x - wx, o.z - wz) > r);
      if (remaining.length === prev.objects.length) return prev;
      return { ...prev, objects: remaining };
    });
  }, []);

  // Build wall preview meshes during drag
  const updateWallPreview = useCallback((start: { x: number; z: number }, end: { x: number; z: number }) => {
    const grp = wallPreviewGroupRef.current;
    if (!grp) return;
    while (grp.children.length > 0) {
      const ch = grp.children[0] as THREE.Mesh;
      grp.remove(ch);
      ch.geometry?.dispose();
    }
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const dist = Math.hypot(dx, dz);
    const step = 3.2;
    const count = Math.max(1, Math.floor(dist / step) + 1);
    const ang = Math.atan2(dx, dz);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.72 });
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const px = start.x + dx * t;
      const pz = start.z + dz * t;
      const py = sampleGridHeight(docRef.current, px, pz);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.0, 2.9), mat);
      seg.position.set(px, py + 1.0, pz);
      seg.rotation.y = ang;
      grp.add(seg);
    }
  }, []);

  const clearWallPreview = useCallback(() => {
    const grp = wallPreviewGroupRef.current;
    if (!grp) return;
    while (grp.children.length > 0) {
      const ch = grp.children[0] as THREE.Mesh;
      grp.remove(ch);
      ch.geometry?.dispose();
    }
  }, []);

  // Viewport pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setOpenMenu(null);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Right click -> Pan camera; Middle click or Alt+Left -> Orbit camera
    if (e.button === 2) {
      dragModeRef.current = 'pan';
      return;
    }
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      dragModeRef.current = 'orbit';
      return;
    }
    if (e.button !== 0) return;

    const pt = raycastTerrainPoint(e.clientX, e.clientY);
    if (!pt) return;

    const ts = toolStateRef.current;

    if (ts.unitPasteMode && ts.copiedObject) {
      placeObjectAt(pt.x, pt.z);
      return;
    }

    if (ts.activeTool === 'place_object') {
      placeObjectAt(pt.x, pt.z);
      return;
    }

    if (ts.activeTool === 'select_move') {
      const hit = pickObjectAtWorld(pt.x, pt.z, 3.6);
      if (hit) {
        setSelectedUid(hit.uid);
        dragModeRef.current = 'move_obj';
        strokeSavedUndoRef.current = false;
        setStatusBanner(`Selecionado: ${hit.name} (${hit.playerSlot === 0 ? 'Gaia' : `P${hit.playerSlot}`}) — Arraste para mover • K/Shift+K escala • Ctrl+C copia.`);
      } else {
        setSelectedUid(null);
      }
      return;
    }

    if (ts.activeTool === 'terrain_copy') {
      dragModeRef.current = 'terrain_copy';
      dragStartWorldRef.current = { x: pt.x, z: pt.z };
      return;
    }

    if (ts.activeTool === 'terrain_paste') {
      pasteTerrainAt(pt.x, pt.z);
      return;
    }

    if (ts.activeTool === 'place_wall') {
      dragModeRef.current = 'wall_drag';
      dragStartWorldRef.current = { x: pt.x, z: pt.z };
      updateWallPreview({ x: pt.x, z: pt.z }, { x: pt.x, z: pt.z });
      return;
    }

    // Brush-based terrain or delete tools
    pushUndoSnapshot();
    strokeSavedUndoRef.current = true;
    forestLastSpawnRef.current = null;
    dragModeRef.current = 'paint';

    if (ts.activeTool === 'delete_object') {
      deleteObjectsAt(pt.x, pt.z);
    } else {
      if (ts.activeTool === 'elevate_sample' && e.shiftKey) {
        // Shift+Click re-samples elevation
        setSampledElevation(null);
        toolStateRef.current.sampledElevation = null;
      }
      applyTerrainBrushAt(pt.x, pt.z, e.shiftKey);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    if (dragModeRef.current === 'pan') {
      const scale = camDistRef.current * 0.0022;
      const yaw = camYawRef.current;
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);
      const fwdX = -Math.sin(yaw);
      const fwdZ = -Math.cos(yaw);
      const halfW = docRef.current.widthMeters * 0.55;
      const halfD = docRef.current.depthMeters * 0.55;
      camTargetRef.current.x = Math.max(
        -halfW,
        Math.min(halfW, camTargetRef.current.x - dx * rightX * scale + dy * fwdX * scale)
      );
      camTargetRef.current.z = Math.max(
        -halfD,
        Math.min(halfD, camTargetRef.current.z - dx * rightZ * scale + dy * fwdZ * scale)
      );
      return;
    }

    if (dragModeRef.current === 'orbit') {
      camYawRef.current -= dx * 0.006;
      camPitchRef.current = Math.max(0.28, Math.min(1.48, camPitchRef.current + dy * 0.006));
      return;
    }

    const pt = raycastTerrainPoint(e.clientX, e.clientY);
    if (!pt) return;

    const ts = toolStateRef.current;

    // Update 3D Brush Ring Cursor
    if (brushRingRef.current) {
      const isBrushTool =
        ts.activeTool !== 'select_move' &&
        ts.activeTool !== 'terrain_copy' &&
        ts.activeTool !== 'place_wall';
      brushRingRef.current.visible = isBrushTool;
      if (isBrushTool) {
        brushRingRef.current.position.set(pt.x, Math.max(-0.1, pt.y + 0.16), pt.z);
        const r =
          ts.activeTool === 'place_object' || ts.unitPasteMode
            ? 1.5
            : ts.activeTool === 'delete_object'
            ? Math.max(2.2, ts.brushRadius * 0.65)
            : ts.brushRadius;
        brushRingRef.current.scale.setScalar(r);
        const mat = brushRingRef.current.material as THREE.MeshBasicMaterial;
        mat.color.setHex(
          ts.unitPasteMode
            ? 0x34d399
            : ts.activeTool === 'delete_object'
            ? 0xef4444
            : ts.activeTool === 'paint_water' || ts.activeTool === 'edit_water_beautify'
            ? 0x38bdf8
            : ts.activeTool === 'paint_forest'
            ? 0x4ade80
            : 0xfacc15
        );
      }
    }

    if (dragModeRef.current === 'move_obj' && ts.selectedUid) {
      if (!strokeSavedUndoRef.current) {
        pushUndoSnapshot();
        strokeSavedUndoRef.current = true;
      }
      const nx = ts.alignToGrid ? Math.round(pt.x / 2) * 2 : Number(pt.x.toFixed(2));
      const nz = ts.alignToGrid ? Math.round(pt.z / 2) * 2 : Number(pt.z.toFixed(2));
      const targetUid = ts.selectedUid;
      setDoc((prev) => ({
        ...prev,
        objects: prev.objects.map((o) => (o.uid === targetUid ? { ...o, x: nx, z: nz } : o)),
      }));
      return;
    }

    if (dragModeRef.current === 'terrain_copy' && dragStartWorldRef.current && copyRectMeshRef.current) {
      const s = dragStartWorldRef.current;
      const y = Math.max(0.4, pt.y + 0.45);
      const posAttr = copyRectMeshRef.current.geometry.attributes.position as THREE.BufferAttribute;
      posAttr.setXYZ(0, s.x, y, s.z);
      posAttr.setXYZ(1, pt.x, y, s.z);
      posAttr.setXYZ(2, pt.x, y, pt.z);
      posAttr.setXYZ(3, s.x, y, pt.z);
      posAttr.needsUpdate = true;
      copyRectMeshRef.current.visible = true;
      return;
    }

    if (dragModeRef.current === 'wall_drag' && dragStartWorldRef.current) {
      updateWallPreview(dragStartWorldRef.current, { x: pt.x, z: pt.z });
      return;
    }

    if (dragModeRef.current === 'paint') {
      if (ts.activeTool === 'delete_object') {
        deleteObjectsAt(pt.x, pt.z);
      } else {
        applyTerrainBrushAt(pt.x, pt.z, e.shiftKey);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const mode = dragModeRef.current;
    dragModeRef.current = 'none';

    if (mode === 'terrain_copy' && dragStartWorldRef.current) {
      const pt = raycastTerrainPoint(e.clientX, e.clientY);
      if (copyRectMeshRef.current) copyRectMeshRef.current.visible = false;
      if (pt) {
        const d = docRef.current;
        const gs = d.gridSize;
        const halfW = d.widthMeters / 2;
        const halfD = d.depthMeters / 2;
        const gx0 = Math.max(0, Math.min(gs - 1, Math.round(((Math.min(dragStartWorldRef.current.x, pt.x) + halfW) / d.widthMeters) * (gs - 1))));
        const gx1 = Math.max(0, Math.min(gs - 1, Math.round(((Math.max(dragStartWorldRef.current.x, pt.x) + halfW) / d.widthMeters) * (gs - 1))));
        const gz0 = Math.max(0, Math.min(gs - 1, Math.round(((Math.min(dragStartWorldRef.current.z, pt.z) + halfD) / d.depthMeters) * (gs - 1))));
        const gz1 = Math.max(0, Math.min(gs - 1, Math.round(((Math.max(dragStartWorldRef.current.z, pt.z) + halfD) / d.depthMeters) * (gs - 1))));
        const cols = Math.max(1, gx1 - gx0 + 1);
        const rows = Math.max(1, gz1 - gz0 + 1);
        const heights: number[] = [];
        const terrains: number[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = (gz0 + r) * gs + (gx0 + c);
            heights.push(d.heightGrid[idx] ?? 0.35);
            terrains.push(d.terrainGrid[idx] ?? 1);
          }
        }
        setTerrainClipboard({ cols, rows, heights, terrains });
        setActiveTool('terrain_paste');
        setStatusBanner(`Bloco de terreno copiado (${cols}×${rows}) — Clique no mapa para Colar Terreno.`);
      }
      dragStartWorldRef.current = null;
      return;
    }

    if (mode === 'wall_drag' && dragStartWorldRef.current) {
      const pt = raycastTerrainPoint(e.clientX, e.clientY);
      clearWallPreview();
      if (pt) {
        const start = dragStartWorldRef.current;
        const dx = pt.x - start.x;
        const dz = pt.z - start.z;
        const dist = Math.hypot(dx, dz);
        const step = 3.2;
        const count = Math.max(1, Math.floor(dist / step) + 1);
        const ang = Math.atan2(dx, dz);
        pushUndoSnapshot();
        const slot = toolStateRef.current.activePlayerSlot;
        const newWalls: PlacedScenarioObject[] = [];
        for (let i = 0; i < count; i++) {
          const t = count === 1 ? 0 : i / (count - 1);
          newWalls.push({
            uid: `wall_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`,
            catalogId: 'bld_wall',
            name: 'Muralha',
            kindType: 'building',
            buildingKind: 'wall',
            playerSlot: slot,
            x: Number((start.x + dx * t).toFixed(2)),
            z: Number((start.z + dz * t).toFixed(2)),
            rotationY: ang,
            scale: 1,
          });
        }
        setDoc((prev) => ({ ...prev, objects: [...prev.objects, ...newWalls] }));
        setStatusBanner(`${newWalls.length} segmentos de Muralha erguidos (P${slot}). Selecione um segmento para converter em Portão!`);
      }
      dragStartWorldRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const ts = toolStateRef.current;
    // AoM Rule: Mouse wheel rotates copied units in Unit Paste mode (or holding R / placing objects with Shift)
    if (ts.unitPasteMode && ts.copiedObject) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? Math.PI / 8 : -Math.PI / 8;
      setPasteRotation((r) => r + delta);
      setStatusBanner(`Rotação do objeto colado: ${Math.round((((ts.pasteRotation + delta) * 180) / Math.PI) % 360)}°`);
      return;
    }
    if (e.shiftKey && ts.activeTool === 'place_object') {
      e.preventDefault();
      setPlacementRotation((r) => r + (e.deltaY > 0 ? Math.PI / 8 : -Math.PI / 8));
      return;
    }
    if (e.shiftKey && ts.selectedUid) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? Math.PI / 8 : -Math.PI / 8;
      const uid = ts.selectedUid;
      setDoc((prev) => ({
        ...prev,
        objects: prev.objects.map((o) => (o.uid === uid ? { ...o, rotationY: o.rotationY + delta } : o)),
      }));
      return;
    }
    camDistRef.current = Math.max(18, Math.min(220, camDistRef.current + e.deltaY * 0.08));
  };

  // Official AoM / Retold Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');
      if (isInput || activeModal !== null) return;

      const key = e.key.toLowerCase();

      // Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (key === 'z') {
          e.preventDefault();
          handleUndo();
          return;
        }
        if (key === 'y') {
          e.preventDefault();
          handleRedo();
          return;
        }
        if (key === 'c') {
          const selId = toolStateRef.current.selectedUid;
          const found = selId ? docRef.current.objects.find((o) => o.uid === selId) : null;
          if (found) {
            e.preventDefault();
            setCopiedObject({ ...found });
            setPasteRotation(found.rotationY);
            setStatusBanner(`Copiado: ${found.name} (P${found.playerSlot}) — Pressione Ctrl+V para colar (roda do mouse rotaciona).`);
          }
          return;
        }
        if (key === 'v') {
          if (toolStateRef.current.copiedObject) {
            e.preventDefault();
            setUnitPasteMode(true);
            setActiveTool('place_object');
            setStatusBanner(`Modo Colar Unidade ativo: clique no mapa para posicionar (roda do mouse rotaciona • Esc cancela).`);
          }
          return;
        }
        return;
      }

      // WASD / Arrow camera pan keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        // Note: W without modifier also opens Water Tool in AoM! Let's keep W for Water Tool (official shortcut) and use Arrow keys + right-drag for pan, while A/S/D/Arrows also pan smoothly!
        if (e.code !== 'KeyW') {
          keysDownRef.current.add(e.code);
        }
      }

      if (key === 'o') {
        e.preventDefault();
        setUnitPasteMode(false);
        setActiveTool('place_object');
        setDrawerOpen(true);
        setStatusBanner('Atalho O: Menu Colocar Objetos aberto.');
      } else if (key === 'c') {
        e.preventDefault();
        setUnitPasteMode(false);
        setActiveTool('paint_cliff');
        setDrawerOpen(true);
        setStatusBanner('Atalho C: Ferramenta de Penhasco (Cliff Tool) ativa.');
      } else if (key === 'f') {
        e.preventDefault();
        setUnitPasteMode(false);
        setActiveTool('paint_forest');
        setDrawerOpen(true);
        setStatusBanner('Atalho F: Ferramenta de Floresta (Forest Tool) ativa.');
      } else if (key === 't') {
        e.preventDefault();
        setUnitPasteMode(false);
        setActiveTool('paint_land');
        setDrawerOpen(true);
        setStatusBanner('Atalho T: Pintar Terra (Paint Land) ativo.');
      } else if (key === 'w') {
        e.preventDefault();
        setUnitPasteMode(false);
        setActiveTool('paint_water');
        setDrawerOpen(true);
        setStatusBanner('Atalho W: Ferramenta de Água (Water Tool — inclui Água Rasa Retold) ativa.');
      } else if (key === 'e') {
        e.preventDefault();
        setShowCommandsWindow((prev) => !prev);
      } else if (key === 'k') {
        // K scales UP selected object; Shift+K scales DOWN selected object (visual scale only)
        const selId = toolStateRef.current.selectedUid;
        if (selId) {
          e.preventDefault();
          const factor = e.shiftKey ? 0.9 : 1.12;
          setDoc((prev) => ({
            ...prev,
            objects: prev.objects.map((o) =>
              o.uid === selId ? { ...o, scale: Number(Math.max(0.25, Math.min(4.5, (o.scale || 1) * factor)).toFixed(2)) } : o
            ),
          }));
          setStatusBanner(e.shiftKey ? 'Shift+K: Escala visual reduzida (colisão inalterada).' : 'K: Escala visual ampliada (colisão inalterada).');
        }
      } else if (key === 'y') {
        // Y moves sun SE (lower lighting, longer shadows NW); Shift+Y moves sun NW
        e.preventDefault();
        setDoc((prev) => {
          const nextAz = e.shiftKey ? prev.sunAzimuthDeg - 12 : prev.sunAzimuthDeg + 12;
          const nextEl = e.shiftKey
            ? Math.min(82, prev.sunElevationDeg + 5)
            : Math.max(10, prev.sunElevationDeg - 5);
          return { ...prev, sunAzimuthDeg: nextAz, sunElevationDeg: nextEl };
        });
        setStatusBanner(
          e.shiftKey
            ? 'Shift+Y: Sol movido em direção ao horizonte Noroeste.'
            : 'Y: Sol movido para o horizonte Sudeste (sombras mais longas ao Noroeste).'
        );
      } else if (key === 'delete' || key === 'backspace') {
        const selId = toolStateRef.current.selectedUid;
        if (selId) {
          e.preventDefault();
          pushUndoSnapshot();
          setDoc((prev) => ({ ...prev, objects: prev.objects.filter((o) => o.uid !== selId) }));
          setSelectedUid(null);
          setStatusBanner('Objeto selecionado removido.');
        }
      } else if (key === 'escape') {
        setOpenMenu(null);
        setUnitPasteMode(false);
        setShowCommandsWindow(false);
        setActiveTool('select_move');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [activeModal, handleRedo, handleUndo, pushUndoSnapshot]);

  // Actions invoked from menus/modals
  const handleGenerateNewMap = useCallback(
    (opts: { baseMapId: MapId | 'blank_grass'; worldSize: WorldSizeId; seed: number; maxPlayers: number; title: string }) => {
      undoStackRef.current = [];
      redoStackRef.current = [];
      setSelectedUid(null);
      setUnitPasteMode(false);
      const fresh = createScenarioDocument(opts);
      setDoc(fresh);
      camTargetRef.current.set(0, 0, 0);
      camDistRef.current = opts.worldSize === 'giant' ? 115 : opts.worldSize === 'large' ? 92 : 72;
      setHistoryVersion((v) => v + 1);
      setStatusBanner(`Novo mapa gerado: ${fresh.title} (${fresh.widthMeters}×${fresh.depthMeters}m, Semente ${fresh.seed}).`);
    },
    []
  );

  const handleSaveScenario = useCallback(() => {
    saveScenarioToStorage(docRef.current);
    setStatusBanner(`Cenário "${docRef.current.title}" salvo localmente com sucesso!`);
  }, []);

  const handleLoadScenario = useCallback((loaded: ScenarioDocument) => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    setSelectedUid(null);
    setDoc(loaded);
    camTargetRef.current.set(0, 0, 0);
    setHistoryVersion((v) => v + 1);
    setStatusBanner(`Cenário carregado: "${loaded.title}" (${loaded.objects.length} objetos).`);
  }, []);

  const handleApplyGlobalElevation = useCallback(
    (delta: number) => {
      pushUndoSnapshot();
      setDoc((prev) => ({
        ...prev,
        heightGrid: prev.heightGrid.map((h) => Math.max(-5, Math.min(12, Number((h + delta).toFixed(3))))),
      }));
      setStatusBanner(`Elevação global ajustada em ${delta >= 0 ? `+${delta}` : delta}m.`);
    },
    [pushUndoSnapshot]
  );

  const handleResizeMapSides = useCallback(
    (widthMeters: number, depthMeters: number) => {
      pushUndoSnapshot();
      setDoc((prev) => {
        const halfW = widthMeters / 2;
        const halfD = depthMeters / 2;
        return {
          ...prev,
          widthMeters,
          depthMeters,
          // Keep objects clamped inside resized rectangle without regenerating terrain
          objects: prev.objects.filter((o) => Math.abs(o.x) <= halfW && Math.abs(o.z) <= halfD),
        };
      });
      setStatusBanner(`Dimensões do mapa atualizadas para ${widthMeters}m × ${depthMeters}m sem regenerar o terreno.`);
    },
    [pushUndoSnapshot]
  );

  const handleConvertSelectedWallToGate = useCallback(() => {
    if (!selectedObject) return;
    if (selectedObject.buildingKind !== 'wall' && selectedObject.propKind !== 'troy_wall') {
      setStatusBanner('Selecione uma Muralha primeiro para convertê-la em Portão.');
      return;
    }
    pushUndoSnapshot();
    setDoc((prev) => ({
      ...prev,
      objects: prev.objects.map((o) =>
        o.uid === selectedObject.uid
          ? o.propKind === 'troy_wall'
            ? { ...o, propKind: 'troy_gate', catalogId: 'prop_troy_gate', name: 'Portão de Troia' }
            : { ...o, buildingKind: 'gate', catalogId: 'bld_gate', name: 'Portão Fortificado' }
          : o
      ),
    }));
    setStatusBanner('Muralha convertida em Portão!');
  }, [pushUndoSnapshot, selectedObject]);

  const handleAlignSelectedToGrid = useCallback(() => {
    if (!selectedObject) return;
    pushUndoSnapshot();
    setDoc((prev) => ({
      ...prev,
      objects: prev.objects.map((o) =>
        o.uid === selectedObject.uid
          ? { ...o, x: Math.round(o.x / 2) * 2, z: Math.round(o.z / 2) * 2, rotationY: Math.round(o.rotationY / (Math.PI / 2)) * (Math.PI / 2) }
          : o
      ),
    }));
    setStatusBanner(`${selectedObject.name} alinhado à grade ortogonal.`);
  }, [pushUndoSnapshot, selectedObject]);

  const handlePlaytest = useCallback(
    (playAsSlot: number, difficulty: DifficultyId, targetDoc?: ScenarioDocument) => {
      const scenario = targetDoc ?? docRef.current;
      saveScenarioToStorage(scenario);
      const compiledRms = compileScenarioToRmsMap(scenario);
      setActiveRmsMap(compiledRms);
      setActiveScenarioPlaytest({ doc: scenario, playAsSlot, difficulty });
      const player = scenario.players.find((p) => p.slot === playAsSlot) ?? scenario.players[0];
      const enemyCandidate = scenario.players.find((p) => p.slot !== playAsSlot && p.control !== 'none');
      const colorNum = parseInt(player.colorHex.replace('#', ''), 16) || 0x38bdf8;
      onStartMatch(player.pantheon, difficulty, 'rms_custom', true, {
        startingAge: player.startingAge,
        worldSize: scenario.worldSize,
        scenarioTitle: scenario.title,
        majorGodName: player.majorGod,
        enemyPantheon: enemyCandidate?.pantheon,
        playerColorHex: colorNum,
        gameSpeed,
      });
    },
    [gameSpeed, onStartMatch]
  );

  const activeToolLabel = useMemo(() => {
    const map: Record<EditorToolId, string> = {
      select_move: 'Selecionar / Mover',
      place_object: unitPasteMode ? 'Colar Objeto (Ctrl+V)' : 'Colocar Objetos (O)',
      delete_object: 'Apagar Objetos',
      place_wall: 'Muralha (Arrastar)',
      paint_terrain: 'Pintar Terreno',
      paint_land: 'Pintar Terra (T)',
      elevate: 'Elevar / Rebaixar',
      elevate_sample: 'Elevar por Amostra',
      elevate_circular: 'Elevação Circular',
      smooth: 'Suavizar',
      roughen: 'Tornar Áspero',
      paint_water: 'Água (W)',
      edit_water_beautify: 'Embelezar Água',
      paint_cliff: 'Penhasco (C)',
      paint_forest: 'Floresta (F)',
      terrain_copy: 'Copiar Terreno',
      terrain_paste: 'Colar Terreno',
    };
    return map[activeTool];
  }, [activeTool, unitPasteMode]);

  // Menu dropdown helper
  const renderMenuButton = (id: Exclude<TopMenuId, null>, label: string, items: { label: string; shortcut?: string; action: () => void; divider?: boolean }[]) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu((m) => (m === id ? null : id))}
        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold cursor-pointer ${
          openMenu === id ? 'bg-[#d4af37] text-[#0d1017]' : 'text-[#e2e8f0] hover:bg-white/10'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className="h-3 w-3 opacity-75" />
      </button>
      {openMenu === id && (
        <div className="absolute left-0 top-full mt-1 z-40 w-64 rounded border border-[#d4af37]/45 bg-[#0f1522] py-1 shadow-2xl">
          {items.map((it, idx) => (
            <React.Fragment key={idx}>
              {it.divider && <div className="my-1 border-t border-white/10" />}
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  it.action();
                }}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-[#e2e8f0] hover:bg-[#1e293b] hover:text-[#f3d27a] cursor-pointer"
              >
                <span>{it.label}</span>
                {it.shortcut && <span className="text-[10px] text-[#94a3b8] font-mono">{it.shortcut}</span>}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#090d14] text-white select-none">
      {/* Top AoM Scenario Editor Menu Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4af37]/35 bg-[#0d121d] px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="mr-1 flex items-center gap-1 rounded border border-white/15 bg-[#161e2e] px-2 py-1 text-xs text-[#cbd5e1] hover:border-[#d4af37] hover:text-white cursor-pointer"
            title="Voltar ao Menu"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Menu</span>
          </button>

          <span className="mr-2 hidden md:inline text-xs font-bold tracking-wide text-[#f3d27a]">
            EDITOR DE CENÁRIOS
          </span>

          {renderMenuButton('map', 'Mapa', [
            { label: 'Novo Mapa / Gerar Mapa Aleatório...', action: () => setActiveModal('new_map') },
            { label: 'Salvar Cenário', action: handleSaveScenario },
            { label: 'Carregar / Exportar / Importar...', action: () => setActiveModal('save_load') },
            { label: 'Voltar ao Menu Principal', divider: true, action: onClose },
          ])}

          {renderMenuButton('edit', 'Editar', [
            { label: 'Desfazer', shortcut: 'Ctrl+Z', action: handleUndo },
            { label: 'Refazer', shortcut: 'Ctrl+Y', action: handleRedo },
            {
              label: 'Copiar Objeto Selecionado',
              shortcut: 'Ctrl+C',
              divider: true,
              action: () => {
                if (!selectedObject) {
                  setStatusBanner('Selecione um objeto primeiro para copiar.');
                  return;
                }
                setCopiedObject({ ...selectedObject });
                setPasteRotation(selectedObject.rotationY);
                setStatusBanner(`Copiado: ${selectedObject.name}. Use Ctrl+V para colar.`);
              },
            },
            {
              label: 'Colar Objeto (Roda gira)',
              shortcut: 'Ctrl+V',
              action: () => {
                if (!copiedObject) {
                  setStatusBanner('Copie um objeto primeiro (Ctrl+C).');
                  return;
                }
                setUnitPasteMode(true);
                setActiveTool('place_object');
                setStatusBanner('Modo Colar Objeto ativo — clique no terreno (roda do mouse rotaciona).');
              },
            },
            {
              label: 'Copiar Terreno (Arrastar Retângulo)',
              divider: true,
              action: () => {
                setUnitPasteMode(false);
                setActiveTool('terrain_copy');
                setStatusBanner('Arraste um retângulo sobre o terreno para copiar relevo e texturas.');
              },
            },
            {
              label: 'Colar Terreno',
              action: () => {
                setUnitPasteMode(false);
                setActiveTool('terrain_paste');
                setStatusBanner(terrainClipboard ? 'Clique no terreno para carimbar o bloco copiado.' : 'Copie um bloco de terreno primeiro.');
              },
            },
            { label: 'Criador de Campanhas (Campaign Maker)...', divider: true, action: () => setActiveModal('campaign_maker') },
          ])}

          {renderMenuButton('scenario', 'Cenário', [
            { label: 'Dados dos Jogadores (12 Slots + Idade Inicial)...', action: () => setActiveModal('player_data') },
            { label: 'Dados do Cenário (População e Vitória)...', action: () => setActiveModal('scenario_data') },
            { label: 'Resumo do Cenário (World / Player / Misc)...', action: () => setActiveModal('scenario_summary') },
            { label: 'Objetivos, Dicas e Spotlight (SL)...', divider: true, action: () => setActiveModal('objectives') },
            { label: 'Unidades e Prédios Proibidos...', action: () => setActiveModal('forbidden_units') },
            { label: 'Diplomacia (Grade 12×12)...', action: () => setActiveModal('diplomacy') },
            { label: 'Testar Cenário Agora (Playtest)...', divider: true, action: () => setActiveModal('playtest') },
          ])}

          {renderMenuButton('world', 'Mundo', [
            { label: 'Iluminação e SkyBox (26 Presets AoM)...', action: () => setActiveModal('world_lighting') },
            {
              label: 'Mover Sol para Sudeste (Sombras Longas)',
              shortcut: 'Y',
              action: () =>
                setDoc((prev) => ({
                  ...prev,
                  sunAzimuthDeg: prev.sunAzimuthDeg + 14,
                  sunElevationDeg: Math.max(10, prev.sunElevationDeg - 6),
                })),
            },
            {
              label: 'Mover Sol para Noroeste',
              shortcut: 'Shift+Y',
              action: () =>
                setDoc((prev) => ({
                  ...prev,
                  sunAzimuthDeg: prev.sunAzimuthDeg - 14,
                  sunElevationDeg: Math.min(82, prev.sunElevationDeg + 6),
                })),
            },
            { label: 'Tamanho do Mapa (Expandir / Reduzir Lados)...', divider: true, action: () => setActiveModal('world_size') },
            { label: 'Elevação Global do Mapa...', action: () => setActiveModal('world_elevation') },
          ])}

          {renderMenuButton('terrain', 'Terreno', [
            { label: 'Pintar Terreno (Somente Textura)', action: () => { setUnitPasteMode(false); setActiveTool('paint_terrain'); setDrawerOpen(true); } },
            { label: 'Pintar Terra (Textura + Elevação)', shortcut: 'T', action: () => { setUnitPasteMode(false); setActiveTool('paint_land'); setDrawerOpen(true); } },
            { label: 'Elevar / Rebaixar (Shift reduz)', divider: true, action: () => { setUnitPasteMode(false); setActiveTool('elevate'); setDrawerOpen(true); } },
            { label: 'Elevar por Amostra', action: () => { setUnitPasteMode(false); setSampledElevation(null); setActiveTool('elevate_sample'); setDrawerOpen(true); } },
            { label: 'Elevação Circular (Platô)', action: () => { setUnitPasteMode(false); setActiveTool('elevate_circular'); setDrawerOpen(true); } },
            { label: 'Suavizar Relevo (Smooth)', action: () => { setUnitPasteMode(false); setActiveTool('smooth'); setDrawerOpen(true); } },
            { label: 'Tornar Áspero (Roughen)', action: () => { setUnitPasteMode(false); setActiveTool('roughen'); setDrawerOpen(true); } },
            { label: 'Ferramenta de Água (Água Rasa Retold / Rio / Mar)', shortcut: 'W', divider: true, action: () => { setUnitPasteMode(false); setActiveTool('paint_water'); setDrawerOpen(true); } },
            { label: 'Editar / Embelezar Água (Beautify)', action: () => { setUnitPasteMode(false); setActiveTool('edit_water_beautify'); setDrawerOpen(true); } },
            { label: 'Ferramenta de Penhasco / Cânion', shortcut: 'C', divider: true, action: () => { setUnitPasteMode(false); setActiveTool('paint_cliff'); setDrawerOpen(true); } },
            { label: 'Ferramenta de Floresta', shortcut: 'F', action: () => { setUnitPasteMode(false); setActiveTool('paint_forest'); setDrawerOpen(true); } },
          ])}

          {renderMenuButton('objects', 'Objetos', [
            { label: 'Colocar Objetos (Unidades, Prédios, Especiais)', shortcut: 'O', action: () => { setUnitPasteMode(false); setActiveTool('place_object'); setDrawerOpen(true); } },
            { label: 'Selecionar / Mover / Inspecionar', action: () => { setUnitPasteMode(false); setActiveTool('select_move'); setDrawerOpen(true); } },
            { label: 'Apagar Objetos (Pincel)', action: () => { setUnitPasteMode(false); setActiveTool('delete_object'); setDrawerOpen(true); } },
            { label: 'Construir Muralha (Arrastar)', divider: true, action: () => { setUnitPasteMode(false); setActiveTool('place_wall'); setDrawerOpen(true); } },
            { label: 'Converter Muralha Selecionada em Portão', action: handleConvertSelectedWallToGate },
            { label: 'Alinhar Objeto Selecionado à Grade', action: handleAlignSelectedToGrid },
          ])}
        </div>

        {/* Right Quick Action Bar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStackRef.current.length === 0 && historyVersion >= 0}
            className="rounded border border-white/10 bg-[#151c2b] p-1.5 text-[#cbd5e1] hover:border-[#d4af37] disabled:opacity-40 cursor-pointer"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStackRef.current.length === 0 && historyVersion >= 0}
            className="rounded border border-white/10 bg-[#151c2b] p-1.5 text-[#cbd5e1] hover:border-[#d4af37] disabled:opacity-40 cursor-pointer"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowCommandsWindow((s) => !s)}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-xs font-semibold cursor-pointer ${
              showCommandsWindow
                ? 'border-[#f3d27a] bg-[#263248] text-[#f3d27a]'
                : 'border-white/15 bg-[#151c2b] text-[#cbd5e1] hover:border-[#d4af37]'
            }`}
            title="Comandos Rápidos do Editor (Atalho E)"
          >
            <Command className="h-3.5 w-3.5" />
            <span>Comandos (E)</span>
          </button>
          <button
            type="button"
            onClick={handleSaveScenario}
            className="flex items-center gap-1 rounded border border-white/15 bg-[#151c2b] px-2 py-1 text-xs text-[#cbd5e1] hover:border-[#d4af37] cursor-pointer"
            title="Salvar Cenário"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salvar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('playtest')}
            className="flex items-center gap-1 rounded border border-[#f5d77f] bg-[#d4af37] px-3 py-1 text-xs font-bold text-[#0d1017] hover:bg-[#e5c14d] cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Testar Cenário</span>
          </button>
        </div>
      </div>

      {/* Main Editor Workspace: Unobstructed 3D Viewport + Collapsible Tool Drawer */}
      <div className="relative flex-1 overflow-hidden">
        {/* Isolated 3D WebGL Canvas */}
        <div
          ref={mountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          className="h-full w-full cursor-crosshair"
        />

        {/* Compact Left Tool Inspector Drawer */}
        <div
          className={`absolute left-2 top-2 bottom-9 z-20 flex transition-all duration-200 ${
            drawerOpen ? 'w-72' : 'w-9'
          }`}
        >
          {drawerOpen ? (
            <div className="flex h-full w-full flex-col overflow-hidden rounded border border-[#d4af37]/35 bg-[#0c111c]/95 shadow-2xl">
              {/* Tool Quick Icons Strip */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#121928] px-2 py-1.5">
                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: 'select_move', icon: Move, title: 'Selecionar / Mover' },
                      { id: 'place_object', icon: Layers, title: 'Objetos (O)' },
                      { id: 'paint_land', icon: Paintbrush, title: 'Pintar Terra (T)' },
                      { id: 'elevate', icon: Mountain, title: 'Elevar / Penhasco' },
                      { id: 'paint_water', icon: Waves, title: 'Água (W)' },
                      { id: 'paint_forest', icon: Trees, title: 'Floresta (F)' },
                      { id: 'delete_object', icon: Eraser, title: 'Apagar Objetos' },
                    ] as { id: EditorToolId; icon: React.ComponentType<{ className?: string }>; title: string }[]
                  ).map((btn) => {
                    const Icon = btn.icon;
                    const active = activeTool === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => {
                          setUnitPasteMode(false);
                          setActiveTool(btn.id);
                        }}
                        title={btn.title}
                        className={`rounded p-1.5 cursor-pointer ${
                          active ? 'bg-[#d4af37] text-[#0d1017]' : 'text-[#94a3b8] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded p-1 text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer"
                  title="Recolher Painel"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Active Tool Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-[11px]">
                <span className="font-bold text-[#f3d27a]">{activeToolLabel}</span>
                <span className="text-[#94a3b8]">{doc.objects.length} objs</span>
              </div>

              {/* Contextual Tool Controls */}
              <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3">
                {/* Brush Controls for Terrain / Delete Tools */}
                {activeTool !== 'place_object' &&
                  activeTool !== 'select_move' &&
                  activeTool !== 'place_wall' &&
                  activeTool !== 'terrain_copy' &&
                  activeTool !== 'terrain_paste' && (
                    <div className="space-y-2 rounded border border-white/10 bg-[#121a29] p-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] text-[#cbd5e1] mb-1">
                          <span>Raio do Pincel</span>
                          <span className="font-mono text-[#f3d27a]">{brushRadius}m</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={24}
                          step={1}
                          value={brushRadius}
                          onChange={(e) => setBrushRadius(Number(e.target.value))}
                          className="w-full accent-[#d4af37]"
                        />
                      </div>
                      {activeTool !== 'delete_object' && (
                        <div>
                          <div className="flex justify-between text-[11px] text-[#cbd5e1] mb-1">
                            <span>Intensidade</span>
                            <span className="font-mono text-[#f3d27a]">{Math.round(brushStrength * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.15}
                            max={1}
                            step={0.05}
                            value={brushStrength}
                            onChange={(e) => setBrushStrength(Number(e.target.value))}
                            className="w-full accent-[#d4af37]"
                          />
                        </div>
                      )}
                      {(activeTool === 'elevate' || activeTool === 'elevate_circular' || activeTool === 'paint_cliff') && (
                        <div className="text-[10px] text-[#94a3b8]">
                          Clique: elevar • <strong className="text-white">Shift + Clique</strong>: rebaixar / nivelar.
                        </div>
                      )}
                      {activeTool === 'elevate_sample' && (
                        <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
                          <span>Altura amostrada: {sampledElevation !== null ? `${sampledElevation.toFixed(2)}m` : 'Clique no terreno'}</span>
                          <button
                            type="button"
                            onClick={() => setSampledElevation(null)}
                            className="rounded border border-white/15 px-1.5 py-0.5 text-white hover:border-[#d4af37] cursor-pointer"
                          >
                            Reamostrar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {/* Terrain Texture Swatches */}
                {(activeTool === 'paint_terrain' || activeTool === 'paint_land') && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[#f3d27a]">Textura do Terreno</div>
                    <div className="grid grid-cols-1 gap-1">
                      {TERRAIN_PAINT_PALETTE.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPaintTerrainId(t.id)}
                          className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left cursor-pointer ${
                            paintTerrainId === t.id
                              ? 'border-[#f3d27a] bg-[#222d42] text-white'
                              : 'border-white/10 bg-[#121826] text-[#cbd5e1] hover:border-white/25'
                          }`}
                        >
                          <span className="h-4 w-4 shrink-0 rounded border border-white/30" style={{ backgroundColor: t.swatch }} />
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-[11px]">{t.label}</div>
                            <div className="truncate text-[10px] text-[#94a3b8]">{t.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Water Tool Modes */}
                {(activeTool === 'paint_water' || activeTool === 'edit_water_beautify') && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#f3d27a]">Tipo de Água</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(
                        [
                          { id: 'shallow', label: 'Água Rasa (Retold)', desc: 'Transitável por tropas/navios e permite construções' },
                          { id: 'river', label: 'Rio / Lago Navegável', desc: 'Leito profundo no centro com margens rasas' },
                          { id: 'ocean', label: 'Oceano Profundo', desc: 'Águas profundas para frotas navais e pesca' },
                        ] as { id: EditorWaterMode; label: string; desc: string }[]
                      ).map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setActiveTool('paint_water');
                            setWaterMode(w.id);
                          }}
                          className={`rounded border p-2 text-left cursor-pointer ${
                            activeTool === 'paint_water' && waterMode === w.id
                              ? 'border-[#38bdf8] bg-[#142a3d] text-white'
                              : 'border-white/10 bg-[#121826] text-[#cbd5e1]'
                          }`}
                        >
                          <div className="font-semibold text-[11px]">{w.label}</div>
                          <div className="text-[10px] text-[#94a3b8]">{w.desc}</div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setActiveTool('edit_water_beautify')}
                        className={`flex items-center gap-2 rounded border p-2 text-left cursor-pointer ${
                          activeTool === 'edit_water_beautify'
                            ? 'border-[#34d399] bg-[#112e2a] text-white'
                            : 'border-white/10 bg-[#121826] text-[#cbd5e1]'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#34d399]" />
                        <div>
                          <div className="font-semibold text-[11px]">Embelezar Margens (Beautify)</div>
                          <div className="text-[10px] text-[#94a3b8]">Adiciona rochas, salgueiros e cardumes</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Cliff Tool Options */}
                {activeTool === 'paint_cliff' && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[#f3d27a]">Estilo de Penhasco / Cânion</div>
                    {CLIFF_STYLE_OPTIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCliffStyle(c.id)}
                        className={`flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-[11px] cursor-pointer ${
                          cliffStyle === c.id
                            ? 'border-[#f3d27a] bg-[#222d42] text-white'
                            : 'border-white/10 bg-[#121826] text-[#cbd5e1]'
                        }`}
                      >
                        <span>{c.label}</span>
                        <span className="font-mono text-[10px] text-[#94a3b8]">+{c.height}m</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Forest Tool Options */}
                {activeTool === 'paint_forest' && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[#f3d27a]">Bioma da Floresta</div>
                    {FOREST_STYLE_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setForestStyle(f.id)}
                        className={`flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-[11px] cursor-pointer ${
                          forestStyle === f.id
                            ? 'border-[#4ade80] bg-[#162d22] text-white'
                            : 'border-white/10 bg-[#121826] text-[#cbd5e1]'
                        }`}
                      >
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Terrain Copy / Paste Helper */}
                {(activeTool === 'terrain_copy' || activeTool === 'terrain_paste') && (
                  <div className="space-y-2 rounded border border-white/10 bg-[#121a29] p-2.5 text-[11px] text-[#cbd5e1]">
                    <div className="font-bold text-[#f3d27a]">
                      {activeTool === 'terrain_copy' ? 'Copiar Terreno' : 'Colar Terreno'}
                    </div>
                    <p className="text-[#94a3b8]">
                      {activeTool === 'terrain_copy'
                        ? 'Clique e arraste um retângulo no terreno 3D para capturar relevo e texturas.'
                        : terrainClipboard
                        ? `Bloco pronto (${terrainClipboard.cols}×${terrainClipboard.rows} células). Clique no mapa para carimbar.`
                        : 'Nenhum terreno copiado ainda.'}
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveTool('terrain_copy')}
                        className="flex-1 rounded border border-white/15 bg-[#1b2436] py-1 text-[11px] cursor-pointer"
                      >
                        Copiar Área
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTool('terrain_paste')}
                        disabled={!terrainClipboard}
                        className="flex-1 rounded border border-[#d4af37]/45 bg-[#253147] py-1 text-[11px] text-[#f3d27a] disabled:opacity-40 cursor-pointer"
                      >
                        Colar Área
                      </button>
                    </div>
                  </div>
                )}

                {/* Wall Drag Tool */}
                {activeTool === 'place_wall' && (
                  <div className="space-y-2 rounded border border-white/10 bg-[#121a29] p-2.5 text-[11px] text-[#cbd5e1]">
                    <div className="font-bold text-[#f3d27a]">Construir Muralha (Arrastar)</div>
                    <p className="text-[#94a3b8]">
                      Clique e arraste no terreno para estender uma linha contínua de muralhas para o Jogador {activePlayerSlot}.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: doc.maxPlayers }, (_, i) => i + 1).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setActivePlayerSlot(slot)}
                          className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] cursor-pointer ${
                            activePlayerSlot === slot ? 'border-[#f3d27a] bg-[#243047] text-white' : 'border-white/10 bg-[#0d121d] text-[#94a3b8]'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLAYER_COLORS[slot - 1] }} />
                          P{slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Object Placement Browser */}
                {activeTool === 'place_object' && (
                  <div className="space-y-2.5">
                    {unitPasteMode && copiedObject && (
                      <div className="rounded border border-[#34d399]/60 bg-[#0e2a24] p-2 text-[11px]">
                        <div className="flex items-center justify-between font-bold text-[#34d399]">
                          <span>Colando: {copiedObject.name}</span>
                          <button type="button" onClick={() => setUnitPasteMode(false)} className="cursor-pointer">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-[#a7f3d0] mt-0.5">
                          Clique no mapa para colar • Roda do mouse rotaciona • Esc cancela
                        </div>
                      </div>
                    )}

                    {/* Player Owner Selector */}
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Dono do Objeto</div>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => setActivePlayerSlot(0)}
                          className={`rounded border px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                            activePlayerSlot === 0 ? 'border-[#f3d27a] bg-[#263248] text-white' : 'border-white/10 bg-[#121826] text-[#94a3b8]'
                          }`}
                        >
                          Gaia
                        </button>
                        {Array.from({ length: doc.maxPlayers }, (_, i) => i + 1).map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setActivePlayerSlot(slot)}
                            className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                              activePlayerSlot === slot ? 'border-[#f3d27a] bg-[#263248] text-white' : 'border-white/10 bg-[#121826] text-[#94a3b8]'
                            }`}
                          >
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLAYER_COLORS[slot - 1] }} />
                            P{slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-1">
                      {(
                        [
                          { id: 'all', label: 'Todos' },
                          { id: 'units', label: 'Unidades' },
                          { id: 'buildings', label: 'Prédios' },
                          { id: 'nature', label: 'Natureza' },
                          { id: 'embellishment', label: 'Ornamentos' },
                          { id: 'test', label: 'Teste' },
                          { id: 'current', label: 'No Mapa' },
                        ] as { id: EditorObjectCategory; label: string }[]
                      ).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setObjCategory(cat.id)}
                          className={`rounded border px-1.5 py-0.5 text-[10px] cursor-pointer ${
                            objCategory === cat.id
                              ? 'border-[#f3d27a] bg-[#d4af37] text-[#0d1017] font-bold'
                              : 'border-white/10 bg-[#121826] text-[#cbd5e1]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Pantheon Filter + Search */}
                    <div className="flex gap-1.5">
                      <select
                        value={objPantheon}
                        onChange={(e) => setObjPantheon(e.target.value as EditorPantheonFilter)}
                        className="rounded border border-white/15 bg-[#0f1522] px-1.5 py-1 text-[11px] text-white"
                      >
                        <option value="all">Todos Panteões</option>
                        <option value="greek">Grego</option>
                        <option value="egyptian">Egípcio</option>
                        <option value="norse">Nórdico</option>
                        <option value="atlantean">Atlante</option>
                        <option value="chinese">Chinês</option>
                        <option value="gaia">Gaia</option>
                        <option value="special">Especiais / Campanha</option>
                      </select>
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-2 top-1.5 h-3 w-3 text-[#64748b]" />
                        <input
                          value={objSearch}
                          onChange={(e) => setObjSearch(e.target.value)}
                          placeholder="Buscar..."
                          className="w-full rounded border border-white/15 bg-[#0f1522] pl-6 pr-2 py-1 text-[11px] text-white"
                        />
                      </div>
                    </div>

                    {/* Placement Transform Controls */}
                    <div className="grid grid-cols-2 gap-2 rounded border border-white/10 bg-[#121a29] p-2">
                      <label className="text-[10px] text-[#94a3b8]">
                        Escala: <strong className="text-[#f3d27a]">{placementScale.toFixed(2)}x</strong>
                        <input
                          type="range"
                          min={0.4}
                          max={3.0}
                          step={0.1}
                          value={placementScale}
                          onChange={(e) => setPlacementScale(Number(e.target.value))}
                          className="w-full accent-[#d4af37]"
                        />
                      </label>
                      <label className="text-[10px] text-[#94a3b8]">
                        Rotação: <strong className="text-[#f3d27a]">{Math.round((placementRotation * 180) / Math.PI)}°</strong>
                        <input
                          type="range"
                          min={0}
                          max={Math.PI * 2}
                          step={Math.PI / 8}
                          value={placementRotation}
                          onChange={(e) => setPlacementRotation(Number(e.target.value))}
                          className="w-full accent-[#d4af37]"
                        />
                      </label>
                      <label className="col-span-2 flex items-center gap-1.5 text-[10px] text-[#cbd5e1] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alignToGrid}
                          onChange={(e) => setAlignToGrid(e.target.checked)}
                        />
                        <span>Alinhar automaticamente à grade (2m)</span>
                      </label>
                    </div>

                    {/* Scrollable Object List */}
                    <div className="max-h-72 overflow-y-auto space-y-1 pr-0.5">
                      {filteredCatalog.map((item: EditorObjectCatalogItem) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setUnitPasteMode(false);
                            setSelectedCatalogId(item.id);
                          }}
                          className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left text-[11px] cursor-pointer ${
                            selectedCatalogId === item.id && !unitPasteMode
                              ? 'border-[#f3d27a] bg-[#232f46] text-white font-semibold'
                              : 'border-white/10 bg-[#121826] text-[#cbd5e1] hover:border-white/25'
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          {item.specialBadge && (
                            <span className="ml-1 shrink-0 rounded bg-[#d4af37]/20 px-1 py-0.5 text-[9px] text-[#f3d27a]">
                              {item.specialBadge}
                            </span>
                          )}
                        </button>
                      ))}
                      {filteredCatalog.length === 0 && (
                        <div className="py-4 text-center text-[11px] text-[#64748b]">Nenhum objeto encontrado.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selection / Object Info Inspector */}
                {activeTool === 'select_move' && (
                  <div className="space-y-2">
                    {selectedObject ? (
                      <div className="space-y-2 rounded border border-[#38bdf8]/45 bg-[#101c2d] p-2.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#7dd3fc]">{selectedObject.name}</span>
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                            {selectedObject.playerSlot === 0 ? 'Gaia' : `P${selectedObject.playerSlot}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-[#94a3b8]">
                          <span>Pos X: <strong className="text-white">{selectedObject.x.toFixed(1)}m</strong></span>
                          <span>Pos Z: <strong className="text-white">{selectedObject.z.toFixed(1)}m</strong></span>
                          <span>Escala: <strong className="text-[#f3d27a]">{selectedObject.scale.toFixed(2)}x</strong></span>
                          <span>Rotação: <strong className="text-white">{Math.round((selectedObject.rotationY * 180) / Math.PI)}°</strong></span>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() =>
                              setDoc((prev) => ({
                                ...prev,
                                objects: prev.objects.map((o) =>
                                  o.uid === selectedObject.uid
                                    ? { ...o, scale: Number(Math.min(4.5, o.scale * 1.15).toFixed(2)) }
                                    : o
                                ),
                              }))
                            }
                            className="rounded border border-white/15 bg-[#1b273b] px-2 py-1 text-[10px] hover:border-[#d4af37] cursor-pointer"
                          >
                            Escala + (K)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDoc((prev) => ({
                                ...prev,
                                objects: prev.objects.map((o) =>
                                  o.uid === selectedObject.uid
                                    ? { ...o, scale: Number(Math.max(0.25, o.scale * 0.88).toFixed(2)) }
                                    : o
                                ),
                              }))
                            }
                            className="rounded border border-white/15 bg-[#1b273b] px-2 py-1 text-[10px] hover:border-[#d4af37] cursor-pointer"
                          >
                            Escala - (Shift+K)
                          </button>
                          <button
                            type="button"
                            onClick={handleAlignSelectedToGrid}
                            className="rounded border border-white/15 bg-[#1b273b] px-2 py-1 text-[10px] hover:border-[#d4af37] cursor-pointer"
                          >
                            Alinhar Grade
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCopiedObject({ ...selectedObject });
                              setPasteRotation(selectedObject.rotationY);
                              setUnitPasteMode(true);
                              setActiveTool('place_object');
                            }}
                            className="flex items-center gap-1 rounded border border-white/15 bg-[#1b273b] px-2 py-1 text-[10px] hover:border-[#d4af37] cursor-pointer"
                          >
                            <Copy className="h-3 w-3" /> Duplicar
                          </button>
                          {(selectedObject.buildingKind === 'wall' || selectedObject.propKind === 'troy_wall') && (
                            <button
                              type="button"
                              onClick={handleConvertSelectedWallToGate}
                              className="w-full rounded border border-[#f3d27a] bg-[#2b374f] px-2 py-1 text-[10px] font-bold text-[#f3d27a] cursor-pointer"
                            >
                              Converter Muralha em Portão
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              pushUndoSnapshot();
                              setDoc((prev) => ({ ...prev, objects: prev.objects.filter((o) => o.uid !== selectedObject.uid) }));
                              setSelectedUid(null);
                            }}
                            className="w-full rounded border border-red-500/40 bg-red-950/50 px-2 py-1 text-[10px] text-red-300 hover:bg-red-900/60 cursor-pointer"
                          >
                            Remover Objeto (Del)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded border border-white/10 bg-[#121a29] p-3 text-[11px] text-[#94a3b8]">
                        Clique em qualquer unidade, construção ou monumento no mapa 3D para inspecionar, arrastar, escalar (<strong className="text-white">K / Shift+K</strong>) ou copiar (<strong className="text-white">Ctrl+C</strong>).
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-10 w-9 items-center justify-center rounded border border-[#d4af37]/40 bg-[#0c111c]/95 text-[#f3d27a] hover:bg-[#1a2438] cursor-pointer"
              title="Expandir Painel de Ferramentas"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Floating Official Editor Commands Window (Shortcut: E) */}
        {showCommandsWindow && (
          <div className="absolute right-3 top-3 z-30 w-72 rounded border border-[#d4af37]/55 bg-[#0d1320] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#151e30] px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
                <Sliders className="h-3.5 w-3.5" />
                <span>Comandos do Editor (E)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCommandsWindow(false)}
                className="text-[#94a3b8] hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1 p-2 max-h-[65vh] overflow-y-auto">
              {EDITOR_COMMANDS_LIST.map((cmd) => (
                <button
                  key={cmd.enName}
                  type="button"
                  onClick={() => {
                    setUnitPasteMode(false);
                    setActiveTool(cmd.tool);
                    if (cmd.presetForest) setForestStyle(cmd.presetForest);
                    setDrawerOpen(true);
                    setStatusBanner(`Ferramenta selecionada: ${cmd.label} (${cmd.enName}).`);
                  }}
                  className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-left text-[11px] cursor-pointer ${
                    activeTool === cmd.tool
                      ? 'border-[#f3d27a] bg-[#24314a] text-white font-semibold'
                      : 'border-white/10 bg-[#121928] text-[#cbd5e1] hover:border-[#d4af37]/40'
                  }`}
                >
                  <span>{cmd.label}</span>
                  <span className="text-[9px] text-[#64748b]">{cmd.enName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Viewport Camera & Overlay Controls (Bottom Right) */}
        <div className="absolute right-3 bottom-10 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGridOverlay((g) => !g)}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] cursor-pointer ${
              showGridOverlay
                ? 'border-[#f3d27a] bg-[#24314a] text-[#f3d27a]'
                : 'border-white/15 bg-[#0c111c]/90 text-[#cbd5e1]'
            }`}
            title="Exibir / Ocultar Grade"
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Grade</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('world_lighting')}
            className="flex items-center gap-1 rounded border border-white/15 bg-[#0c111c]/90 px-2 py-1 text-[11px] text-[#cbd5e1] hover:border-[#d4af37] cursor-pointer"
            title="Iluminação e SkyBox"
          >
            <Sun className="h-3.5 w-3.5 text-[#f3d27a]" />
            <span>{doc.lightingId}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              camTargetRef.current.set(0, 0, 0);
              camYawRef.current = Math.PI * 0.25;
              camPitchRef.current = 0.88;
              camDistRef.current = 72;
            }}
            className="flex items-center gap-1 rounded border border-white/15 bg-[#0c111c]/90 px-2 py-1 text-[11px] text-[#cbd5e1] hover:border-[#d4af37] cursor-pointer"
            title="Resetar Câmera"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-white/10 bg-[#0b1019] px-3 py-1 text-[11px] text-[#cbd5e1]">
          <span className="truncate">{statusBanner}</span>
          <span className="hidden lg:inline shrink-0 text-[10px] text-[#94a3b8]">
            Botão Direito: Mover Câmera • Alt+Arrastar / Meio: Orbitar • Roda: Zoom (Shift+Roda gira) • {doc.widthMeters}×{doc.depthMeters}m
          </span>
        </div>
      </div>

      {/* All 13 Scenario Editor Modals */}
      <ScenarioEditorModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        doc={doc}
        onUpdateDoc={setDoc}
        onGenerateNewMap={handleGenerateNewMap}
        onSaveScenario={handleSaveScenario}
        onLoadScenario={handleLoadScenario}
        onApplyGlobalElevation={handleApplyGlobalElevation}
        onResizeMapSides={handleResizeMapSides}
        onPlaytest={handlePlaytest}
      />
    </div>
  );
};
