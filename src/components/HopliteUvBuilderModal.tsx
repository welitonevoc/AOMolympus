import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Box,
  Building2,
  CloudLightning,
  Compass,
  Eye,
  Play,
  RotateCw,
  Shield,
  Sparkles,
  Swords,
  User,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { createGreekUnitMesh } from '../civilizacao/gregos/gregosModels';
import {
  buildZeus,
  createZeusProceduralTextures,
  createZeusTempleEnvironment,
} from '../civilizacao/gregos/zeusModel';
import {
  buildPoseidon,
  createPoseidonEnvironment,
  createPoseidonProceduralTextures,
} from '../civilizacao/gregos/poseidonModel';
import { createBuildingMesh, createMaterialPalette, createUnitMesh } from '../game/models';
import { BuildingKind, PantheonId, UnitKind } from '../game/types';
import {
  createContactShadowTexture,
  createMarbleTexture,
  createSelectionRingTexture,
} from '../game/textures';

interface HopliteUvBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: '3d' | 'sprite' | 'brg' | 'uv2d';
  activeTier: 1 | 2 | 3 | 4;
  onSelectMode: (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => void;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
}

export type InspectableUnitId = UnitKind | 'zeus' | 'poseidon';

interface CivEntityOption {
  id: InspectableUnitId;
  name: string;
  role: string;
}

/**
 * Catálogo de unidades e deuses estritamente dividido por civilização.
 * Zeus e Poseidon são deuses gregos e aparecem EXCLUSIVAMENTE no Panteão Grego!
 */
const CIVILIZATION_UNITS: Partial<Record<PantheonId, CivEntityOption[]>> = {
  greek: [
    { id: 'zeus', name: '⚡ Zeus (Deus Maior)', role: 'Pai dos Deuses — Empunha Raios Divinos e convoca Tempestades' },
    { id: 'poseidon', name: '🌊 Poseidon (Deus dos Mares)', role: 'Senhor dos Mares — Conduzido por vórtices, golpeia com tridente e invoca tsunamis' },
    { id: 'hoplite', name: 'Hoplita Espartano', role: 'Infantaria pesada com lança e escudo hoplon' },
    { id: 'hipaspist', name: 'Hipaspista', role: 'Infantaria de elite ágil' },
    { id: 'archer', name: 'Arqueiro Toxotes', role: 'Combatente à distância' },
    { id: 'cavalry', name: 'Cavalaria Pródromo', role: 'Cavalaria rápida de reconhecimento' },
    { id: 'hero', name: 'Herói (Ajax / Odisseu)', role: 'Líder lendário com aura mítica' },
    { id: 'villager', name: 'Aldeão Grego', role: 'Unidade econômica de coleta' },
    { id: 'minotaur', name: 'Minotauro Mítico', role: 'Criatura mítica feroz' },
  ],
  egyptian: [
    { id: 'hoplite', name: 'Homem das Armas (Spearman)', role: 'Infantaria pesada núbia com escudo largo' },
    { id: 'archer', name: 'Arqueiro Núbio', role: 'Arqueiro veloz do deserto com arco composto' },
    { id: 'cavalry', name: 'Carruagem de Guerra', role: 'Cavalaria ligeira de ataque à distância' },
    { id: 'hero', name: 'Faraó / Sacerdote', role: 'Líder espiritual e guardião de monumentos' },
    { id: 'villager', name: 'Aldeão Egípcio', role: 'Trabalhador e construtor de pirâmides' },
    { id: 'minotaur', name: 'Anubita Mítico', role: 'Guardião chacal ágil com saltos mortais' },
  ],
  norse: [
    { id: 'hoplite', name: 'Ulfsark', role: 'Infantaria rápida capaz de erguer construções' },
    { id: 'hipaspist', name: 'Lançador de Machados', role: 'Guerreiro com machados arremessados' },
    { id: 'cavalry', name: 'Cavaleiro Saqueador', role: 'Cavalaria nórdica de ataque surpresa' },
    { id: 'hero', name: 'Hersir (Herói)', role: 'Guerreiro devoto que gera favor em combate' },
    { id: 'villager', name: 'Coletor Nórdico', role: 'Unidade com carro de bois para entrega rápida' },
    { id: 'minotaur', name: 'Gigante do Gelo', role: 'Monstro colossal com sopro congelante' },
  ],
  atlantean: [
    { id: 'hoplite', name: 'Murmillo', role: 'Infantaria pesada com espada de oricalco e escudo' },
    { id: 'archer', name: 'Arcus', role: 'Arqueiro de elite com flechas perfurantes' },
    { id: 'cavalry', name: 'Contarius', role: 'Cavalaria de lança longa e impacto devastador' },
    { id: 'hero', name: 'Herói Atlante', role: 'Guerreiro consagrado com bênção de Cronos' },
    { id: 'villager', name: 'Cidadão Atlante', role: 'Econômico auto-suficiente com mula de carga' },
    { id: 'minotaur', name: 'Autômato Mítico', role: 'Constructo de bronze autoregenerativo' },
  ],
};

const INSPECTABLE_BUILDINGS: { id: BuildingKind; name: string; role: string }[] = [
  { id: 'town_center', name: 'Centro da Cidade', role: 'Sede principal — treina aldeões e avança eras' },
  { id: 'barracks', name: 'Quartel', role: 'Treina infantaria e soldados' },
  { id: 'armory', name: 'Arsenal', role: 'Pesquisa tecnologias de armas e armaduras' },
  { id: 'temple', name: 'Templo', role: 'Gera Favor e treina unidades míticas' },
  { id: 'fortress', name: 'Fortaleza', role: 'Defesa pesada e cerco' },
  { id: 'house', name: 'Casa', role: 'Aumenta o limite de população' },
  { id: 'tower', name: 'Torre de Vigia', role: 'Defesa avançada contra invasores' },
];

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

  const [entityType, setEntityType] = useState<'unit' | 'building'>('unit');
  const [selectedCiv, setSelectedCiv] = useState<PantheonId>('greek');
  const [selectedUnit, setSelectedUnit] = useState<InspectableUnitId>('zeus');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingKind>('town_center');
  const [animState, setAnimState] = useState<'idle' | 'move' | 'attack'>('attack');
  const [autoRotate3D, setAutoRotate3D] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Modos de Animação e Poderes dos Deuses Gregos
  const [zeusMode, setZeusMode] = useState<'pairar' | 'voar' | 'raios' | 'tempestade'>('pairar');
  const [poseidonMode, setPoseidonMode] = useState<'conduzido' | 'correnteza' | 'golpe' | 'tsunami'>('conduzido');
  const [focusDivine, setFocusDivine] = useState(false);

  const animStateRef = useRef(animState);
  animStateRef.current = animState;
  const autoRotateRef = useRef(autoRotate3D);
  autoRotateRef.current = autoRotate3D;
  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  const zeusModeRef = useRef(zeusMode);
  zeusModeRef.current = zeusMode;
  const poseidonModeRef = useRef(poseidonMode);
  poseidonModeRef.current = poseidonMode;
  const focusDivineRef = useRef(focusDivine);
  focusDivineRef.current = focusDivine;

  // Garante que, ao mudar de civilização, unidades que não pertencem ao panteão sejam desmarcadas
  const handleSelectCiv = (civ: PantheonId) => {
    setSelectedCiv(civ);
    const validUnits = CIVILIZATION_UNITS[civ] || CIVILIZATION_UNITS.greek!;
    if (!validUnits.some((u) => u.id === selectedUnit)) {
      setSelectedUnit(validUnits[0].id);
    }
    setFocusDivine(false);
  };

  useEffect(() => {
    setZoomLevel(1.0);
    setFocusDivine(false);
  }, [entityType, selectedUnit, selectedBuilding, selectedCiv]);

  useEffect(() => {
    if (!isOpen || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const defaultBg = new THREE.Color(0x0b0e14);
    scene.background = defaultBg.clone();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomLevel((prev) => Math.max(0.4, Math.min(3.0, prev - e.deltaY * 0.002)));
    };
    container.addEventListener('wheel', onWheel, { passive: false });

    // 360º Mouse Drag Orbit / Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !entityMeshRef.current) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      entityMeshRef.current.rotation.y += dx * 0.01;
      entityMeshRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, entityMeshRef.current.rotation.x + dy * 0.008));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Luzes da Cena
    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 1.25);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xfff3da, 2.0);
    dir.position.set(4, 7, 5);
    dir.castShadow = true;
    scene.add(dir);

    const rim = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rim.position.set(-4, 3, -4);
    scene.add(rim);

    // Luzes de Efeitos Especiais dos Deuses
    const flashLight = new THREE.PointLight(0xfff3c4, 0, 16);
    scene.add(flashLight);

    const impactLight = new THREE.PointLight(0x2dd4bf, 0, 16);
    scene.add(impactLight);

    // Grupos dedicados
    const environmentGroup = new THREE.Group();
    scene.add(environmentGroup);

    const fxGroup = new THREE.Group();
    scene.add(fxGroup);

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
    const sparkPoints = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({
        color: 0xfff3a0,
        size: 0.09,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
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
    const sprayPoints = new THREE.Points(
      sprayGeo,
      new THREE.PointsMaterial({
        color: 0xccfbf1,
        size: 0.08,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
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

    // Raios e Ondas de Choque
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

    // Crista de Espuma do Tsunami
    const crestPuffs: Array<{ mesh: THREE.Mesh; baseX: number; baseY: number; phase: number }> = [];
    const puffMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdfa,
      emissive: new THREE.Color(0x5eead4),
      emissiveIntensity: 0.45,
      roughness: 0.5,
    });
    for (let c = 0; c < 22; c++) {
      const bx = (c / 21 - 0.5) * (tsuWidth - 0.4);
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 8), puffMat);
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

    let zeusClouds: Array<{ g: THREE.Group; baseY: number; ph: number }> = [];
    let poseidonOceanPos: THREE.BufferAttribute | null = null;
    let poseidonOceanInitY: Float32Array | null = null;

    const marbleTex = createMarbleTexture(1);
    const shadowTex = createContactShadowTexture();
    const ringPlayerTex = createSelectionRingTexture('#38bdf8');
    const ringEnemyTex = createSelectionRingTexture('#ef4444');
    const pal = createMaterialPalette(marbleTex, shadowTex, ringPlayerTex, ringEnemyTex, 0x2563eb);

    // ==========================================
    // CONSTRUÇÃO E MONTAGEM DA ENTIDADE & CENÁRIO
    // ==========================================
    const buildCurrentEntity = () => {
      // Limpeza do modelo anterior
      if (entityMeshRef.current) {
        scene.remove(entityMeshRef.current);
      }
      // Limpeza do cenário anterior
      while (environmentGroup.children.length > 0) {
        const c = environmentGroup.children[0];
        environmentGroup.remove(c);
      }
      zeusClouds = [];
      poseidonOceanPos = null;
      poseidonOceanInitY = null;
      tsunamiGroup.visible = false;

      let group: THREE.Group;

      if (entityType === 'unit') {
        if (selectedUnit === 'zeus' && selectedCiv === 'greek') {
          // ===============================
          // CENÁRIO DO OLIMPO (ZEUS)
          // ===============================
          scene.background = new THREE.Color(0x7fb8bd);
          scene.fog = new THREE.FogExp2(0x7fb8bd, 0.018);

          const zTex = createZeusProceduralTextures();
          const temple = createZeusTempleEnvironment(environmentGroup, zTex);
          zeusClouds = temple.clouds;

          // Sombra suave de chão
          const blobMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.38,
            depthWrite: false,
          });
          const blob = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), blobMat);
          blob.rotation.x = -Math.PI / 2;
          blob.position.y = 0.02;
          environmentGroup.add(blob);

          const zeus = buildZeus(zTex);
          group = zeus.flight;
          group.scale.setScalar(0.72);
          group.position.set(0, 0.15, 0);

          group.userData.animatePose = (dt: number) => {
            const m = zeusModeRef.current;
            const wind = m === 'voar' ? 2.4 : m === 'tempestade' ? 2.8 : 1.2;

            // Barba ondulante
            for (const b of zeus.beardLocks) {
              b.mesh.rotation.x = b.rx + Math.sin(simTime * 2.8 * wind + b.phase) * 0.045;
              b.mesh.rotation.z = b.rz + Math.cos(simTime * 2.2 * wind + b.phase) * 0.035;
            }

            // Capa esvoaçante de linho
            const cAttr = zeus.cape.geometry.attributes.position;
            for (let i = 0; i < cAttr.count; i++) {
              const bx = zeus.capeBase[i * 3];
              const by = zeus.capeBase[i * 3 + 1];
              const bz = zeus.capeBase[i * 3 + 2];
              const normY = (0.91 - by) / 1.82;
              const wave1 = Math.sin(simTime * 3.4 * wind - normY * 4.5 + bx * 2.6) * 0.14 * normY;
              cAttr.setXYZ(i, bx, by, bz + wave1);
            }
            cAttr.needsUpdate = true;

            // Variação de Pose conforme modo de Zeus
            if (m === 'voar') {
              const t = simTime * 2.6;
              zeus.flight.position.y = 0.22 + Math.sin(t) * 0.15;
              zeus.flight.position.z = Math.sin(t * 1.4) * 0.18;
              zeus.flight.rotation.x = 0.28 + Math.sin(t * 0.8) * 0.06;
              zeus.flight.rotation.z = Math.sin(t * 1.1) * 0.1;
              zeus.ring2.rotation.z += dt * 1.2;
            } else if (m === 'raios') {
              const cycle = (simTime * 1.5) % (Math.PI * 2);
              const raise = (Math.sin(cycle) + 1) * 0.5;
              zeus.flight.position.y = 0.2 + raise * 0.12;
              zeus.flight.rotation.x = -raise * 0.1;
              zeus.rightArm.arm.rotation.x = -1.1 - raise * 0.9;
              zeus.handAnchor.rotation.z = Math.sin(simTime * 8) * 0.2;
              zeus.handGlow.scale.setScalar(1.5 + raise * 0.8);
              zeus.leftOrb.scale.setScalar(1.2 + raise * 0.4);
              zeus.ring2.rotation.z += dt * (1.0 + raise * 2.0);
            } else if (m === 'tempestade') {
              const t = simTime * 3.8;
              zeus.flight.position.y = 0.25 + Math.sin(t) * 0.12;
              zeus.flight.rotation.x = Math.sin(t * 0.7) * 0.08;
              zeus.flight.rotation.z = Math.cos(t * 1.2) * 0.1;
              zeus.ring2.rotation.z += dt * 3.2;
              zeus.handGlow.scale.setScalar(1.6 + Math.sin(simTime * 16) * 0.5);
              zeus.leftOrb.scale.setScalar(1.4 + Math.cos(simTime * 14) * 0.3);
            } else {
              // Pairar padrão
              const t = simTime * 1.8;
              zeus.flight.position.y = 0.15 + Math.sin(t) * 0.08;
              zeus.flight.position.z = 0;
              zeus.flight.rotation.x = Math.sin(t * 0.6) * 0.04;
              zeus.flight.rotation.z = Math.cos(t * 0.5) * 0.03;
              zeus.rightArm.arm.rotation.x = -0.3;
              zeus.handAnchor.rotation.z = 0;
              zeus.handGlow.scale.setScalar(1.2);
              zeus.ring2.rotation.z += dt * 0.65;
            }

            zeus.ring1.material.opacity = 0.38 + 0.22 * Math.sin(simTime * 2.2);
            const pulse = 1 + Math.sin(simTime * 16) * 0.16;
            zeus.handGlow.scale.setScalar(1.2 * pulse);
          };
        } else if (selectedUnit === 'poseidon' && selectedCiv === 'greek') {
          // ===============================
          // CENÁRIO DO OCEANO (POSEIDON)
          // ===============================
          scene.background = new THREE.Color(0x04151f);
          scene.fog = new THREE.FogExp2(0x04151f, 0.022);

          const pTex = createPoseidonProceduralTextures();
          const oceanEnv = createPoseidonEnvironment(environmentGroup, pTex);
          poseidonOceanPos = oceanEnv.oceanPos as THREE.BufferAttribute;
          poseidonOceanInitY = new Float32Array(oceanEnv.oceanPos.count);
          for (let i = 0; i < oceanEnv.oceanPos.count; i++) {
            poseidonOceanInitY[i] = oceanEnv.oceanPos.getY(i);
          }

          const poseidon = buildPoseidon(pTex);
          group = poseidon.vessel;
          group.scale.setScalar(0.72);
          group.position.set(0, -0.2, 0);

          group.userData.animatePose = (dt: number) => {
            const m = poseidonModeRef.current;

            if (m === 'correnteza') {
              const t = simTime * 2.5;
              poseidon.vessel.position.z = Math.sin(t * 1.1) * 0.25;
              poseidon.vessel.rotation.x = 0.18 + Math.sin(t * 0.8) * 0.05;
              poseidon.vortexGroup.rotation.y += dt * 2.8;
              for (const r of poseidon.swirlRings) {
                r.mesh.rotation.y -= dt * 4.0;
                r.mesh.position.y = r.baseY + Math.sin(simTime * 4 + r.phase) * 0.07;
              }
              if (Math.random() < 0.3) {
                spawnSpray((Math.random() - 0.5) * 1.2, 0.2, (Math.random() - 0.5) * 1.2, 2.5, 1.2, 2.8);
              }
            } else if (m === 'golpe') {
              const cycle = (simTime * 1.4) % 2.4;
              if (cycle < 1.1) {
                // Ergue tridente
                const prep = cycle / 1.1;
                poseidon.rightArm.arm.rotation.x = -0.3 - prep * 1.6;
                poseidon.body.position.y = 1.05 + prep * 0.25;
              } else if (cycle < 1.5) {
                // Impacto nas águas
                poseidon.rightArm.arm.rotation.x = 0.35;
                poseidon.body.position.y = 0.92;
                poseidon.tridentCore.scale.setScalar(1.7);
              } else {
                // Recuperação
                poseidon.rightArm.arm.rotation.x = -0.3;
                poseidon.body.position.y = 1.05;
              }
              poseidon.vortexGroup.rotation.y += dt * 1.8;
            } else if (m === 'tsunami') {
              const t = simTime * 3.0;
              poseidon.body.position.y = 1.18 + Math.sin(t) * 0.1;
              poseidon.rightArm.arm.rotation.x = -1.35 + Math.sin(t * 0.6) * 0.15;
              poseidon.leftArm.arm.rotation.x = -1.2 + Math.cos(t * 0.6) * 0.15;
              poseidon.vortexGroup.rotation.y += dt * 3.6;
              for (const r of poseidon.swirlRings) {
                r.mesh.rotation.y -= dt * 4.5;
              }
              poseidon.tridentCore.scale.setScalar(1.5 + Math.sin(t * 6) * 0.35);
            } else {
              // Conduzido pelas águas (padrão)
              const t = simTime * 1.6;
              poseidon.vessel.position.z = 0;
              poseidon.vessel.rotation.x = 0;
              poseidon.body.position.y = 1.05 + Math.sin(t) * 0.07;
              poseidon.rightArm.arm.rotation.x = -0.3;
              poseidon.leftArm.arm.rotation.x = 0;
              poseidon.vortexGroup.rotation.y += dt * 1.4;
              for (const r of poseidon.swirlRings) {
                r.mesh.rotation.y -= dt * 2.2;
                r.mesh.position.y = r.baseY + Math.sin(simTime * 2.6 + r.phase) * 0.04;
              }
              const pulse = 1 + Math.sin(simTime * 8) * 0.2;
              poseidon.tridentCore.scale.setScalar(1.2 * pulse);
            }
          };
        } else if (selectedUnit === 'hoplite' || selectedUnit === 'hipaspist') {
          // ===============================
          // CENÁRIO PADRÃO (PEDESTAL)
          // ===============================
          scene.background = defaultBg.clone();
          scene.fog = null;

          const pedGeo = new THREE.CylinderGeometry(1.4, 1.55, 0.16, 32);
          const pedMat = new THREE.MeshStandardMaterial({ color: 0x161c28, roughness: 0.5, metalness: 0.4 });
          const pedestal = new THREE.Mesh(pedGeo, pedMat);
          pedestal.position.y = -0.08;
          pedestal.receiveShadow = true;
          environmentGroup.add(pedestal);

          const ringGeo = new THREE.RingGeometry(1.25, 1.34, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.01;
          environmentGroup.add(ring);

          group = createGreekUnitMesh(selectedUnit, 'player', pal, true, activeTier);
          group.userData.setArmorTier?.(activeTier);
          group.userData.setMode?.('3d');
        } else {
          scene.background = defaultBg.clone();
          scene.fog = null;

          const pedGeo = new THREE.CylinderGeometry(1.4, 1.55, 0.16, 32);
          const pedMat = new THREE.MeshStandardMaterial({ color: 0x161c28, roughness: 0.5, metalness: 0.4 });
          const pedestal = new THREE.Mesh(pedGeo, pedMat);
          pedestal.position.y = -0.08;
          pedestal.receiveShadow = true;
          environmentGroup.add(pedestal);

          const ringGeo = new THREE.RingGeometry(1.25, 1.34, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.01;
          environmentGroup.add(ring);

          group = createUnitMesh(selectedUnit as UnitKind, 'player', pal, true);
        }
      } else {
        scene.background = defaultBg.clone();
        scene.fog = null;

        const pedGeo = new THREE.CylinderGeometry(2.4, 2.65, 0.2, 32);
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x161c28, roughness: 0.5, metalness: 0.4 });
        const pedestal = new THREE.Mesh(pedGeo, pedMat);
        pedestal.position.y = -0.1;
        pedestal.receiveShadow = true;
        environmentGroup.add(pedestal);

        group = createBuildingMesh(selectedBuilding, 'player', pal, true, selectedCiv);
      }

      scene.add(group);
      entityMeshRef.current = group;
    };

    buildCurrentEntity();

    let frameId = 0;
    let lastTime = performance.now();
    let simTime = 0;
    let lastBoltTime = 0;
    let lastSlamTime = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      simTime += dt;

      // Animação das nuvens do Olimpo
      if (zeusClouds.length > 0) {
        for (const c of zeusClouds) {
          c.g.rotation.y += dt * 0.04;
        }
      }

      // Animação das ondas da superfície marinha de Poseidon
      if (poseidonOceanPos && poseidonOceanInitY) {
        for (let i = 0; i < poseidonOceanPos.count; i++) {
          const x = poseidonOceanPos.getX(i);
          const z = poseidonOceanPos.getZ(i);
          const wave = Math.sin(simTime * 2.2 + x * 0.6) * Math.cos(simTime * 1.8 + z * 0.6) * 0.14;
          poseidonOceanPos.setY(i, poseidonOceanInitY[i] + wave);
        }
        poseidonOceanPos.needsUpdate = true;
      }

      // ==========================================
      // DISPARO DE PODERES & EFEITOS
      // ==========================================
      if (selectedCiv === 'greek' && selectedUnit === 'zeus') {
        const zm = zeusModeRef.current;
        // Céu dinâmico conforme modo
        if (zm === 'tempestade') {
          (scene.background as THREE.Color).setHex(0x1e2e38);
        } else {
          (scene.background as THREE.Color).setHex(0x7fb8bd);
        }

        const interval = zm === 'tempestade' ? 0.65 : zm === 'raios' ? 1.4 : 999;
        if (simTime - lastBoltTime > interval) {
          lastBoltTime = simTime;
          const targetX = (Math.random() - 0.5) * 6.0;
          const targetZ = (Math.random() - 0.5) * 6.0;
          const skyFrom = new THREE.Vector3(targetX + (Math.random() - 0.5) * 2, 7.5, targetZ + (Math.random() - 0.5) * 2);
          const groundTo = new THREE.Vector3(targetX, 0.05, targetZ);
          triggerZeusBolt(skyFrom, groundTo);
        }
      } else if (selectedCiv === 'greek' && selectedUnit === 'poseidon') {
        const pm = poseidonModeRef.current;
        if (pm === 'golpe') {
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
          if (tsunamiZ > 12.0) {
            tsunamiZ = -12.0;
          }
        } else {
          tsunamiGroup.visible = false;
        }
      }

      // ==========================================
      // ATUALIZAÇÃO DE FÍSICA DE PARTÍCULAS & FX
      // ==========================================
      // Faíscas
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

      // Borrifos
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

      // Raios
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
          });
          bolts.splice(i, 1);
        }
      }

      // Ondas de choque
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        if (sw.delay > 0) {
          sw.delay -= dt;
          continue;
        }
        sw.life -= dt;
        const progress = 1 - sw.life / sw.max;
        const scale = 1 + progress * 7.5;
        sw.mesh.scale.set(scale, scale, 1);
        if (!Array.isArray(sw.mesh.material)) {
          sw.mesh.material.opacity = Math.max(0, sw.life / sw.max);
        }
        if (sw.life <= 0) {
          scene.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          shockwaves.splice(i, 1);
        }
      }

      // Gêiseres
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
          const sy = (p / 0.28) * 1.5;
          g.mesh.scale.set(1.1, sy, 1.1);
        } else {
          const fade = g.life / (g.max * 0.72);
          g.mesh.scale.set(1.0 + (1 - fade) * 0.4, 1.5 * fade, 1.0 + (1 - fade) * 0.4);
          if (!Array.isArray(g.mesh.material)) g.mesh.material.opacity = Math.max(0, fade * 0.85);
        }
        if (g.life <= 0) {
          scene.remove(g.mesh);
          g.mesh.geometry.dispose();
          geysers.splice(i, 1);
        }
      }

      // Decaimento de luzes de impacto
      if (flashLight.intensity > 0) flashLight.intensity = Math.max(0, flashLight.intensity - dt * 24);
      if (impactLight.intensity > 0) impactLight.intensity = Math.max(0, impactLight.intensity - dt * 18);

      // Rotação da entidade
      if (autoRotateRef.current && entityMeshRef.current) {
        entityMeshRef.current.rotation.y += dt * 0.45;
      }

      // Animação procedural de pose
      if (entityMeshRef.current?.userData.animatePose) {
        const moving = animStateRef.current === 'move';
        const attacking = animStateRef.current === 'attack';
        const attackT = attacking ? (simTime % 1.2) / 1.2 : null;
        const actionState = attacking ? (selectedUnit === 'villager' ? 'gather' : 'attack') : moving ? 'move' : 'idle';
        entityMeshRef.current.userData.animatePose(dt, moving, 3.2, attackT, actionState, 'wood');
      }

      // Enquadramento e Foco da Câmera
      const isGod = (selectedUnit === 'zeus' || selectedUnit === 'poseidon') && selectedCiv === 'greek';
      const isFocus = focusDivineRef.current && isGod;

      if (isFocus) {
        // Câmera de close-up no rosto divino e armas
        const focusY = selectedUnit === 'zeus' ? 1.4 : 1.5;
        camera.position.set(0, focusY, 2.0 / zoomRef.current);
        camera.lookAt(0, focusY, 0);
      } else {
        const isBuilding = entityType === 'building';
        const baseDist = isGod ? 5.8 : isBuilding ? 8.5 : 4.8;
        const baseHeight = isGod ? 1.35 : isBuilding ? 1.6 : 1.1;
        const dist = baseDist / zoomRef.current;
        const height = baseHeight * (1 + (1 - zoomRef.current) * 0.2);

        camera.position.set(0, height, dist);
        camera.lookAt(0, baseHeight, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isOpen, entityType, selectedUnit, selectedBuilding, activeTier, selectedCiv]);

  if (!isOpen) return null;

  const currentCivUnits = CIVILIZATION_UNITS[selectedCiv] || CIVILIZATION_UNITS.greek!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090f]/85 p-3 backdrop-blur-md">
      <div className="flex w-full max-w-5xl flex-col rounded-2xl border border-[#d4af37]/60 bg-[#10141d] text-[#f3efe6] shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#161c28] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3d27a]">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f3d27a]">Modelo 3D/2.5D — Age of Mythology</h2>
              <p className="text-xs text-[#9ca3af]">
                Inspecione deuses olímpicos com cenários de templo/oceano e poderes em tempo real, tropas com rigging e edifícios em 360°
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#121620] text-[#9ca3af] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Panel: Entity Selectors */}
          <div className="col-span-1 md:col-span-4 border-r border-white/10 bg-[#121620]/70 p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Seletor de Civilização (Panteão) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#f3d27a]">Civilização (Panteão)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'greek', name: 'Grega' },
                  { id: 'egyptian', name: 'Egípcia' },
                  { id: 'norse', name: 'Nórdica' },
                  { id: 'atlantean', name: 'Atlanteana' },
                ].map((civ) => (
                  <button
                    key={civ.id}
                    type="button"
                    onClick={() => handleSelectCiv(civ.id as PantheonId)}
                    className={`rounded-lg py-1.5 px-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                      selectedCiv === civ.id
                        ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f3d27a]'
                        : 'border-white/10 bg-[#161c28] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    {civ.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Alternador de Categoria */}
            <div className="flex rounded-xl bg-[#171c28] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setEntityType('unit')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  entityType === 'unit' ? 'bg-[#d4af37] text-[#0b0e14] shadow' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                <span>{selectedCiv === 'greek' ? 'Deuses & Tropas' : 'Unidades & Heróis'}</span>
              </button>
              <button
                type="button"
                onClick={() => setEntityType('building')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  entityType === 'building' ? 'bg-[#d4af37] text-[#0b0e14] shadow' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Edificações</span>
              </button>
            </div>

            {/* Lista de Entidades */}
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
              {entityType === 'unit'
                ? currentCivUnits.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUnit(u.id)}
                      className={`flex flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                        selectedUnit === u.id
                          ? u.id === 'zeus'
                            ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300'
                            : u.id === 'poseidon'
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                            : 'border-[#d4af37] bg-[#d4af37]/15 text-[#f3d27a]'
                          : 'border-white/10 bg-[#171c26]/60 text-[#d1d5db] hover:border-white/25 hover:bg-[#1f2636]'
                      }`}
                    >
                      <span className="font-display text-sm font-bold">{u.name}</span>
                      <span className="text-[11px] text-[#9ca3af]">{u.role}</span>
                    </button>
                  ))
                : INSPECTABLE_BUILDINGS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBuilding(b.id)}
                      className={`flex flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                        selectedBuilding === b.id
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f3d27a]'
                          : 'border-white/10 bg-[#171c26]/60 text-[#d1d5db] hover:border-white/25 hover:bg-[#1f2636]'
                      }`}
                    >
                      <span className="font-display text-sm font-bold">{b.name}</span>
                      <span className="text-[11px] text-[#9ca3af]">{b.role}</span>
                    </button>
                  ))}
            </div>

            {/* Nível de Armadura do Hoplita (se grego e hoplita) */}
            {entityType === 'unit' && selectedUnit === 'hoplite' && selectedCiv === 'greek' && (
              <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#171c28] p-3">
                <span className="text-xs font-bold text-[#f3d27a]">Nível de Armadura do Hoplita</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onSelectTier(tier as any)}
                      className={`rounded py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        activeTier === tier ? 'bg-[#d4af37] text-[#0b0e14]' : 'bg-[#222938] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      T{tier}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: 3D Viewport & Interactive Animation Controls */}
          <div className="col-span-1 md:col-span-8 flex flex-col bg-[#0b0e14] relative">
            <div
              ref={mount3DRef}
              className="flex-1 w-full h-[380px] md:h-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
            />

            {/* Floating Action Bar com Poderes e Animações Específicas */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#161c28]/92 p-2 shadow-2xl backdrop-blur-md max-w-[95%] overflow-x-auto">
              {entityType === 'unit' && selectedUnit === 'zeus' && selectedCiv === 'greek' ? (
                // Poderes e Animações de Zeus
                <>
                  <button
                    type="button"
                    onClick={() => setZeusMode('pairar')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      zeusMode === 'pairar'
                        ? 'bg-yellow-400 text-slate-950 shadow-md'
                        : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/20'
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
                        ? 'bg-yellow-400 text-slate-950 shadow-md'
                        : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/20'
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
                        ? 'bg-yellow-400 text-slate-950 shadow-md'
                        : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/20'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Lançar raios</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setZeusMode('tempestade')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      zeusMode === 'tempestade'
                        ? 'bg-yellow-400 text-slate-950 shadow-md'
                        : 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/20'
                    }`}
                  >
                    <CloudLightning className="h-3.5 w-3.5" />
                    <span>Tempestade</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusDivine(!focusDivine)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      focusDivine
                        ? 'bg-sky-500 text-slate-950 shadow-md'
                        : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{focusDivine ? 'Visão Corpo' : 'Focar Rosto'}</span>
                  </button>
                  <div className="h-5 w-[1px] bg-white/15 mx-1" />
                </>
              ) : entityType === 'unit' && selectedUnit === 'poseidon' && selectedCiv === 'greek' ? (
                // Poderes e Animações de Poseidon
                <>
                  <button
                    type="button"
                    onClick={() => setPoseidonMode('conduzido')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      poseidonMode === 'conduzido'
                        ? 'bg-teal-400 text-slate-950 shadow-md'
                        : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/20'
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
                        ? 'bg-teal-400 text-slate-950 shadow-md'
                        : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/20'
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
                        ? 'bg-teal-400 text-slate-950 shadow-md'
                        : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/20'
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
                        ? 'bg-teal-400 text-slate-950 shadow-md'
                        : 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/20'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Tsunami</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusDivine(!focusDivine)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      focusDivine
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'border border-amber-400/40 text-amber-200 hover:bg-amber-400/20'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{focusDivine ? 'Visão Corpo' : 'Focar Tridente'}</span>
                  </button>
                  <div className="h-5 w-[1px] bg-white/15 mx-1" />
                </>
              ) : entityType === 'unit' ? (
                // Animações para Tropas e Heróis Normais
                <>
                  <button
                    type="button"
                    onClick={() => setAnimState('idle')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      animState === 'idle' ? 'bg-[#d4af37] text-[#0b0e14]' : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Guarda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimState('move')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      animState === 'move' ? 'bg-[#d4af37] text-[#0b0e14]' : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Marcha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimState('attack')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      animState === 'attack' ? 'bg-[#d4af37] text-[#0b0e14]' : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <Swords className="h-3.5 w-3.5" />
                    <span>Ataque</span>
                  </button>
                  <div className="h-5 w-[1px] bg-white/15 mx-1" />
                </>
              ) : null}

              {/* Botão de Rotação Automática 360° */}
              <button
                type="button"
                onClick={() => setAutoRotate3D(!autoRotate3D)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  autoRotate3D ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Girar 360°</span>
              </button>

              {/* Controles de Zoom Numérico (+ / -) */}
              <div className="h-5 w-[1px] bg-white/15 mx-1" />
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(0.4, prev - 0.25))}
                  title="Aproximar Zoom (-)"
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#1f2636] text-[#f3d27a] font-bold hover:bg-[#2a344a] cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-[11px] text-[#9ca3af] px-1">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(3.0, prev + 0.25))}
                  title="Afastar Zoom (+)"
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#1f2636] text-[#f3d27a] font-bold hover:bg-[#2a344a] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
