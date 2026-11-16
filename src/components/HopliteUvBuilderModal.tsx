import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Box,
  Building2,
  CloudLightning,
  Compass,
  Crown,
  Eye,
  Flame,
  Play,
  RotateCw,
  Shield,
  Skull,
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
import {
  buildHades,
  createHadesProceduralTextures,
  createHadesUnderworldEnvironment,
  HadesUnderworldEnvironment,
} from '../civilizacao/gregos/hadesModel';
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

export type InspectableUnitId = UnitKind | 'zeus' | 'poseidon' | 'hades';

interface CivEntityOption {
  id: InspectableUnitId;
  name: string;
  role: string;
}

/**
 * Catálogo de unidades e deuses estritamente dividido por civilização.
 * Zeus, Poseidon e Hades são deuses gregos e aparecem EXCLUSIVAMENTE no Panteão Grego!
 */
export interface MajorGodOption {
  id: string;
  name: string;
  title: string;
  color: string;
  titanName: string;
  titanRole: string;
}

export const MAJOR_GODS_BY_CIV: Partial<Record<PantheonId, MajorGodOption[]>> = {
  greek: [
    {
      id: 'Zeus',
      name: 'Zeus',
      title: 'Pai dos Deuses (Céus & Tempestades)',
      color: '#eab308',
      titanName: 'Titã Tifão - Senhor dos Furacões (Titã de Zeus)',
      titanRole: 'Colosso tempestuoso dos céus com asas monumentais de tempestade, vórtice de tornados e relâmpagos apocalípticos.',
    },
    {
      id: 'Poseidon',
      name: 'Poseidon',
      title: 'Senhor dos Mares (Oceanos & Terremotos)',
      color: '#2dd4bf',
      titanName: 'Titã Caríbdis - Colosso das Profundezas (Titã de Poseidon)',
      titanRole: 'Colosso abissal emergido sobre redemoinho devorador, com carapaça de coral negro, pinça titânica e tentáculos dorsais.',
    },
    {
      id: 'Hades',
      name: 'Hades',
      title: 'Soberano do Submundo (Tártaro & Riquezas)',
      color: '#10b981',
      titanName: 'Titã Cérbero - Guardião do Submundo (Titã de Hades)',
      titanRole: 'Colosso bestial de três cabeças caninas do Tártaro, correntes de ferro negro, garras de basalto e cauda de serpente víbora.',
    },
  ],
  egyptian: [
    {
      id: 'Rá',
      name: 'Rá',
      title: 'Deus do Sol (Luz Divina & Glória)',
      color: '#f59e0b',
      titanName: 'Avatar Solar (Titã de Rá)',
      titanRole: 'Colosso solar alado em armadura de ouro reluzente com disco solar flamejante e cetro Ankh monumental.',
    },
    {
      id: 'Ísis',
      name: 'Ísis',
      title: 'Deusa da Magia (Proteção & Fertilidade)',
      color: '#06b6d4',
      titanName: 'Guardiã Celeste do Nilo (Titã de Ísis)',
      titanRole: 'Colosso alado de marfim e turquesa, coroada com o disco hathórico e cetro de lótus primordial.',
    },
    {
      id: 'Set',
      name: 'Set',
      title: 'Deus do Caos (Tempestades de Areia & Feras)',
      color: '#ef4444',
      titanName: 'Besta Titânica do Caos (Titã de Set)',
      titanRole: 'Besta colossal do deserto com orelhas rígidas e foice Khopesh rubra de basalto e chamas do deserto.',
    },
  ],
  norse: [
    {
      id: 'Thor',
      name: 'Thor',
      title: 'Deus do Trovão (Força Heroica & Tempestades)',
      color: '#38bdf8',
      titanName: 'Gigante do Trovão Mjölnir (Titã de Thor)',
      titanRole: 'Titã guerreiro com chifres maciços de bronze e um martelo monumental Mjölnir de granito rúnico.',
    },
    {
      id: 'Odin',
      name: 'Odin',
      title: 'Pai de Todos (Sabedoria & Runas de Guerra)',
      color: '#818cf8',
      titanName: 'Gigante Primordial Ymir (Titã de Odin)',
      titanRole: 'Ancestral colossal de gelo eterno com runas brilhantes, asas de corvo e a lança sagrada Gungnir.',
    },
    {
      id: 'Loki',
      name: 'Loki',
      title: 'Mestre da Trapaça (Chamas & Mudança de Forma)',
      color: '#f97316',
      titanName: 'Gigante de Fogo Surtr (Titã de Loki)',
      titanRole: 'Monstruosidade titânica de chamas eternas de Muspelheim com espada monumental de magma puro.',
    },
  ],
  atlantean: [
    {
      id: 'Cronos',
      name: 'Cronos',
      title: 'Titã Primordial do Tempo (Oricalco & Teletransporte)',
      color: '#fbbf24',
      titanName: 'Senhor Supremo do Tempo (Titã de Cronos)',
      titanRole: 'Titã primordial com anéis de oricalco flutuantes em órbita temporal e a foice estelar da eternidade.',
    },
    {
      id: 'Urano',
      name: 'Urano',
      title: 'Titã dos Céus (Vórtices & Portais Celestiais)',
      color: '#a855f7',
      titanName: 'Vórtice Celestial (Titã de Urano)',
      titanRole: 'Titã cósmico envolto por anéis de plasma etéreo, empunhando uma lâmina luminosa transcendental.',
    },
    {
      id: 'Gaia',
      name: 'Gaia',
      title: 'Mãe Terra (Natureza Viva & Regeneração)',
      color: '#22c55e',
      titanName: 'Mãe Terra Primordial (Titã de Gaia)',
      titanRole: 'Titã vegetal de rocha viva e raízes sagradas com folhagens esmeraldas e clava florestal colossal.',
    },
  ],
};

export function getUnitsForCivAndGod(civ: PantheonId, majorGod: string): CivEntityOption[] {
  const godList = MAJOR_GODS_BY_CIV[civ] || MAJOR_GODS_BY_CIV.greek!;
  const godInfo = godList.find((g) => g.id.toLowerCase() === (majorGod || '').toLowerCase()) || godList[0];

  if (civ === 'greek') {
    const isZeus = godInfo.id.toLowerCase() === 'zeus';
    const isPoseidon = godInfo.id.toLowerCase() === 'poseidon';
    const isHades = godInfo.id.toLowerCase() === 'hades';

    const godUnit: CivEntityOption = isZeus
      ? { id: 'zeus', name: '⚡ Zeus (Deus Maior)', role: 'Pai dos Deuses — Empunha Raios Divinos e convoca Tempestades' }
      : isPoseidon
      ? { id: 'poseidon', name: '🌊 Poseidon (Deus dos Mares)', role: 'Senhor dos Mares — Conduzido por vórtices, golpeia com tridente e invoca tsunamis' }
      : { id: 'hades', name: '💀 Hades (Senhor do Submundo)', role: 'Monarca dos Mortos — Empunha o Bidente Real, invoca Chamas do Tártaro e o Portal das Almas' };

    return [
      godUnit,
      {
        id: 'hoplite',
        name: isZeus ? 'Hoplita de Zeus' : isPoseidon ? 'Hoplita do Tridente' : 'Hoplita do Tártaro',
        role: isZeus ? 'Infantaria pesada consagrada ao deus dos raios' : isPoseidon ? 'Guerreiro costeiro com bênção das marés' : 'Guarda fúnebre com armadura de bronze escuro',
      },
      {
        id: 'hipaspist',
        name: isZeus ? 'Hipaspista Celestial' : isPoseidon ? 'Hipaspista das Ondas' : 'Hipaspista das Sombras',
        role: 'Infantaria de choque ágil com velocidade e vestes temáticas',
      },
      {
        id: 'archer',
        name: isZeus ? 'Toxotes da Tempestade' : isPoseidon ? 'Toxotes da Correnteza' : 'Toxotes das Sombras',
        role: 'Arqueiro de precisão disparando flechas consagradas',
      },
      {
        id: 'cavalry',
        name: isZeus ? 'Pródromo de Zeus' : isPoseidon ? 'Hetaireia de Poseidon' : 'Pródromo Espectral',
        role: isPoseidon ? 'Cavalaria de elite com bônus a cavalos e estábulos' : 'Cavalaria de reconhecimento veloz',
      },
      {
        id: 'hero',
        name: isZeus ? 'Herói (Jasão / Hércules)' : isPoseidon ? 'Herói (Teseu / Atalanta)' : 'Herói (Aquiles / Perseu)',
        role: 'Líder semideus lendário abençoado com proezas heroicas',
      },
      {
        id: 'villager',
        name: isZeus ? 'Aldeão Devoto de Zeus' : isPoseidon ? 'Aldeão Pescador de Poseidon' : 'Aldeão Mineiro de Hades',
        role: isHades ? 'Econômico com bônus de extração de ouro e pedras' : 'Unidade econômica de coleta e construção',
      },
      {
        id: 'minotaur',
        name: isZeus ? 'Minotauro de Creta' : isPoseidon ? 'Centauro das Marés' : 'Cérbero Guardião',
        role: 'Criatura mítica feroz de dano esmagador',
      },
      {
        id: 'titan',
        name: `⚡ ${godInfo.titanName}`,
        role: godInfo.titanRole,
      },
    ];
  }

  if (civ === 'egyptian') {
    const isRa = godInfo.id.toLowerCase() === 'rá';
    const isIsis = godInfo.id.toLowerCase() === 'ísis';

    return [
      {
        id: 'hoplite',
        name: isRa ? 'Lanceiro Solar de Rá' : isIsis ? 'Guardião do Nilo de Ísis' : 'Homem de Armas do Caos (Set)',
        role: isRa ? 'Infantaria pesada com couraça dourada refletora da luz solar' : isIsis ? 'Guerreiro com proteção mágica do Nilo' : 'Soldado de assalto imbuído pela tempestade de areia',
      },
      {
        id: 'archer',
        name: isRa ? 'Arqueiro Solar de Rá' : isIsis ? 'Arqueiro Protetor de Ísis' : 'Arqueiro do Vento Escuro (Set)',
        role: 'Arqueiro veloz do deserto com arco composto e flechas incendiárias',
      },
      {
        id: 'cavalry',
        name: isRa ? 'Carruagem Sagrada de Rá' : isIsis ? 'Carruagem Real de Ísis' : 'Carruagem de Ataque de Set',
        role: 'Cavalaria ligeira móvel de assédio e ataque em movimento',
      },
      {
        id: 'hero',
        name: isRa ? 'Faraó de Rá' : isIsis ? 'Sacerdotisa de Ísis' : 'Sumo Sacerdote de Set',
        role: 'Líder espiritual consagrado capaz de abençoar monumentos e erguer feitiços',
      },
      {
        id: 'villager',
        name: isRa ? 'Construtor Solar de Rá' : isIsis ? 'Agricultor Fértil de Ísis' : 'Coletor Nômade de Set',
        role: 'Aldeão trabalhador e construtor dedicado às grandes maravilhas',
      },
      {
        id: 'minotaur',
        name: isRa ? 'Anubita Solar' : isIsis ? 'Esfinge Sagrada' : 'Besta Chacal do Caos',
        role: 'Criatura mítica ágil dotada de saltos fulminantes e garras mortais',
      },
      {
        id: 'titan',
        name: `☀️ ${godInfo.titanName}`,
        role: godInfo.titanRole,
      },
    ];
  }

  if (civ === 'norse') {
    const isThor = godInfo.id.toLowerCase() === 'thor';
    const isOdin = godInfo.id.toLowerCase() === 'odin';

    return [
      {
        id: 'hoplite',
        name: isThor ? 'Ulfsark do Trovão (Thor)' : isOdin ? 'Ulfsark de Odin' : 'Ulfsark Ígneo de Loki',
        role: 'Infantaria rápida nórdica capaz de erguer construções militares no campo',
      },
      {
        id: 'hipaspist',
        name: isThor ? 'Lançador de Machados Mjölnir' : isOdin ? 'Guerreiro Rúnico de Odin' : 'Lançador de Machados Ígneos',
        role: 'Guerreiro devastador com machados arremessados',
      },
      {
        id: 'cavalry',
        name: isThor ? 'Cavaleiro Forjado de Thor' : isOdin ? 'Saqueador Corvo de Odin' : 'Saqueador de Cinzas de Loki',
        role: 'Cavalaria nórdica de ataque surpresa e invasão relâmpago',
      },
      {
        id: 'hero',
        name: isThor ? 'Hersir do Trovão (Thor)' : isOdin ? 'Hersir Sábio de Odin' : 'Hersir Trapaceiro de Loki',
        role: 'Guerreiro devoto que gera Favor místico em combate',
      },
      {
        id: 'villager',
        name: isThor ? 'Anão Minerador de Thor' : isOdin ? 'Coletor de Yggdrasil' : 'Servo Astuto de Loki',
        role: 'Unidade com carro de bois para transporte instantâneo de recursos',
      },
      {
        id: 'minotaur',
        name: isThor ? 'Gigante de Tempestade' : isOdin ? 'Gigante de Gelo Ancestral' : 'Gigante de Fogo do Muspelheim',
        role: 'Monstro colossal nórdico de força sísmica',
      },
      {
        id: 'titan',
        name: `❄️ ${godInfo.titanName}`,
        role: godInfo.titanRole,
      },
    ];
  }

  // Atlantean
  const isCronos = godInfo.id.toLowerCase() === 'cronos';
  const isUrano = godInfo.id.toLowerCase() === 'urano';

  return [
    {
      id: 'hoplite',
      name: isCronos ? 'Murmillo do Tempo (Cronos)' : isUrano ? 'Murmillo Celeste (Urano)' : 'Murmillo Silvestre (Gaia)',
      role: 'Infantaria pesada com armadura de oricalco e escudo protetor',
    },
    {
      id: 'archer',
      name: isCronos ? 'Arcus da Entropia' : isUrano ? 'Arcus do Éter' : 'Arcus da Natureza',
      role: 'Arqueiro de elite com flechas perfurantes mágicas',
    },
    {
      id: 'cavalry',
      name: isCronos ? 'Contarius Temporal' : isUrano ? 'Contarius Estelar' : 'Contarius da Rocha Viva',
      role: 'Cavalaria pesada de impacto com lança longa de oricalco',
    },
    {
      id: 'hero',
      name: isCronos ? 'Herói de Cronos' : isUrano ? 'Herói Celeste de Urano' : 'Herói Guardião de Gaia',
      role: 'Guerreiro consagrado com poderes de metamorfose heroica',
    },
    {
      id: 'villager',
      name: isCronos ? 'Cidadão Croniano' : isUrano ? 'Cidadão dos Céus' : 'Cidadão de Gaia',
      role: 'Trabalhador autossuficiente com mula de carga que dispensa entrepostos',
    },
    {
      id: 'minotaur',
      name: isCronos ? 'Autômato do Tempo' : isUrano ? 'Autômato Celestial' : 'Autômato de Madeira Viva',
      role: 'Constructo de oricalco vivo com autorreparação contínua',
    },
    {
      id: 'titan',
      name: `🔮 ${godInfo.titanName}`,
      role: godInfo.titanRole,
    },
  ];
}

export function getBuildingsForCivAndGod(civ: PantheonId, majorGod: string): { id: BuildingKind; name: string; role: string }[] {
  const god = majorGod || 'Zeus';
  return [
    { id: 'town_center', name: `Centro da Cidade (${god})`, role: `Sede principal consagrada a ${god} — treina aldeões e avança eras` },
    { id: 'barracks', name: `Quartel de ${god}`, role: `Treina e equipa soldados sob a bênção marcial de ${god}` },
    { id: 'armory', name: `Arsenal Divino de ${god}`, role: `Forja armas e armaduras aprimoradas com tecnologias de ${god}` },
    { id: 'temple', name: `Templo Sagrado de ${god}`, role: `Gera Favor divino e treina criaturas míticas devotas a ${god}` },
    { id: 'fortress', name: `Fortaleza de ${god}`, role: `Bastião de defesa impenetrável e armas de cerco sob a proteção de ${god}` },
    { id: 'house', name: `Habitação (${god})`, role: `Abriga os povos eleitos e eleva a capacidade populacional do império` },
    { id: 'tower', name: `Torre Balística de ${god}`, role: `Guarda avançada que vigia fronteiras e dispara projéteis abençoados` },
  ];
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

  const [entityType, setEntityType] = useState<'unit' | 'building'>('unit');
  const [selectedCiv, setSelectedCiv] = useState<PantheonId>('greek');
  const [selectedMajorGod, setSelectedMajorGod] = useState<string>('Zeus');
  const [selectedUnit, setSelectedUnit] = useState<InspectableUnitId>('zeus');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingKind>('town_center');
  const [animState, setAnimState] = useState<'idle' | 'move' | 'attack'>('attack');
  const [autoRotate3D, setAutoRotate3D] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Modos de Animação e Poderes dos Deuses Gregos
  const [zeusMode, setZeusMode] = useState<'pairar' | 'voar' | 'raios' | 'tempestade'>('pairar');
  const [poseidonMode, setPoseidonMode] = useState<'conduzido' | 'correnteza' | 'golpe' | 'tsunami'>('conduzido');
  const [hadesMode, setHadesMode] = useState<'reinar' | 'marcha' | 'chama' | 'portal'>('reinar');
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
  const hadesModeRef = useRef(hadesMode);
  hadesModeRef.current = hadesMode;
  const focusDivineRef = useRef(focusDivine);
  focusDivineRef.current = focusDivine;

  // Garante que, ao mudar de civilização, o primeiro Deus Maior e suas unidades sejam selecionados
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
    }
  };

  useEffect(() => {
    setZoomLevel(1.0);
    setFocusDivine(false);
  }, [entityType, selectedUnit, selectedBuilding, selectedCiv, selectedMajorGod]);

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
    let orbitYaw = 0;
    let orbitPitch = 0.12;

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

      const isGod = (selectedUnit === 'zeus' || selectedUnit === 'poseidon' || selectedUnit === 'hades') && selectedCiv === 'greek';
      if (isGod) {
        // No caso dos deuses, a câmera orbita em 360° e o deus permanece fixo no centro
        orbitYaw -= dx * 0.008;
        orbitPitch = Math.max(-0.4, Math.min(0.65, orbitPitch + dy * 0.006));
      } else {
        entityMeshRef.current.rotation.y += dx * 0.01;
        entityMeshRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, entityMeshRef.current.rotation.x + dy * 0.008));
      }
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

    // Luzes de Efeitos Especiais dos Deuses (Zeus, Poseidon e Hades)
    const flashLight = new THREE.PointLight(0xfff3c4, 0, 16);
    scene.add(flashLight);

    const impactLight = new THREE.PointLight(0x2dd4bf, 0, 16);
    scene.add(impactLight);

    const bidentLight = new THREE.PointLight(0x10b981, 0, 10);
    scene.add(bidentLight);

    const hadesBlastLight = new THREE.PointLight(0x34d399, 0, 15);
    scene.add(hadesBlastLight);

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

    // ==========================================
    // SISTEMAS DE PODERES DE HADES (SUBMUNDO)
    // ==========================================
    let hadesEnv: HadesUnderworldEnvironment | null = null;
    let hadesBidentAnchor: THREE.Group | null = null;

    // Cinzas e Almas Flutuantes
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
    const ashPoints = new THREE.Points(
      ashGeo,
      new THREE.PointsMaterial({
        color: 0x6ee7b7,
        size: 0.08,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
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

    // Projéteis e Crateras da Chama do Tártaro
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

    function triggerTartarusFlame(startPos: THREE.Vector3) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 2.8;
      const target = new THREE.Vector3(Math.cos(a) * r, 0.08, Math.sin(a) * r);

      const boltGroup = new THREE.Group();
      boltGroup.position.copy(startPos);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xa7f3d0 })
      );
      const aura = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        new THREE.MeshBasicMaterial({
          color: 0x9333ea,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      boltGroup.add(core, aura);
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

    // Portal das Almas
    const portalGroup = new THREE.Group();
    portalGroup.visible = false;
    scene.add(portalGroup);

    const portalDisc = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 3.5, 64),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    portalDisc.rotation.x = -Math.PI / 2;
    portalDisc.position.y = 0.025;
    portalGroup.add(portalDisc);

    const portalInnerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 2.2, 48),
      new THREE.MeshBasicMaterial({
        color: 0x9333ea,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
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

    for (let i = 0; i < 10; i++) {
      const wg = new THREE.Group();
      const wMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x34d399 : 0xc084fc,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
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

    // ==========================================
    // CONSTRUÇÃO E MONTAGEM DA ENTIDADE & CENÁRIO
    // ==========================================
    const buildCurrentEntity = () => {
      orbitYaw = 0;
      orbitPitch = 0.12;
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
      hadesEnv = null;
      hadesBidentAnchor = null;
      ashPoints.visible = false;
      portalGroup.visible = false;
      bidentLight.intensity = 0;
      hadesBlastLight.intensity = 0;

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
        } else if (selectedUnit === 'hades' && selectedCiv === 'greek') {
          // ===============================
          // CENÁRIO DO SUBMUNDO (HADES)
          // ===============================
          scene.background = new THREE.Color(0x090b14);
          scene.fog = new THREE.FogExp2(0x090b14, 0.026);
          ashPoints.visible = true;

          const hTex = createHadesProceduralTextures();
          hadesEnv = createHadesUnderworldEnvironment(environmentGroup, hTex);

          const hades = buildHades(hTex);
          hadesBidentAnchor = hades.bidentAnchor;
          group = hades.vessel;
          group.scale.setScalar(0.72);
          group.position.set(0, -0.1, 0);

          let trailTimer = 0;
          const tmpV = new THREE.Vector3();

          group.userData.animatePose = (dt: number) => {
            const m = hadesModeRef.current;
            const t = simTime;

            // 1. Deslize sombrio e bob de flutuação
            let gx = 0;
            let gz = 0;
            let yaw = Math.sin(t * 0.35) * 0.16;
            let tiltPitch = 0.03;
            let tiltRoll = 0;
            const hoverBob = Math.sin(t * 1.4) * 0.06;

            if (m === 'marcha') {
              const a = t * 0.65;
              const R = 2.4;
              gx = Math.cos(a) * R;
              gz = Math.sin(a) * R;
              yaw = -a;
              tiltPitch = 0.16;
              tiltRoll = -0.2;

              trailTimer -= dt;
              if (trailTimer <= 0) {
                trailTimer = 0.12;
                spawnShadowTrail(gx, gz);
              }
            } else {
              gx = Math.sin(t * 0.45) * 0.2;
              gz = Math.cos(t * 0.38) * 0.15;
            }

            hades.vessel.position.set(gx, -0.1, gz);
            hades.vessel.rotation.set(0, yaw, 0);
            hades.body.position.y = 1.12 + hoverBob;
            hades.body.rotation.set(tiltPitch, 0, tiltRoll);

            // Vórtice de fumaça sombria e almas orbitando aos pés
            hades.shadowCone.rotation.y -= dt * (m === 'marcha' ? 4.5 : 2.2);
            hades.groundAuraRing.scale.setScalar(1 + Math.sin(t * 3.0) * 0.06);
            for (const w of hades.orbitingWisps) {
              const ang = t * w.speed + w.phase;
              w.mesh.position.set(
                Math.cos(ang) * w.radius,
                w.height + Math.sin(t * 2.5 + w.phase) * 0.15,
                Math.sin(ang) * w.radius
              );
            }

            // 2. Postura e Animação do Bidente Real
            if (m === 'chama') {
              hades.rightArm.arm.rotation.set(-0.55, 0.15, 1.35);
              hades.rightArm.elbow.rotation.set(-0.35, 0.2, 0.25);
              hades.bident.rotation.set(0.95, 0, -0.35);
              hades.leftArm.arm.rotation.set(0.45, -0.3, -0.85);
            } else if (m === 'portal') {
              hades.rightArm.arm.rotation.set(-0.50, 0.15, 2.38 + Math.sin(t * 2.0) * 0.04);
              hades.rightArm.elbow.rotation.set(0.55, 0.2, 0.28);
              hades.bident.rotation.set(0.22, 0, -0.24);
              hades.leftArm.arm.rotation.set(0.55, -0.35, -1.15);
            } else if (m === 'marcha') {
              hades.rightArm.arm.rotation.set(0.32, 0.15, 0.72);
              hades.rightArm.elbow.rotation.set(-0.45, 0.1, 0.22);
              hades.bident.rotation.set(0.85, 0.1, -0.36);
              hades.leftArm.arm.rotation.set(0.28, -0.22, -0.78);
            } else {
              // Reinar
              hades.rightArm.arm.rotation.set(-0.18, 0.12, 0.55 + Math.sin(t * 1.4) * 0.03);
              hades.rightArm.elbow.rotation.set(-0.52, 0.15, 0.22);
              hades.bident.rotation.set(0.18, 0, -0.46);
              hades.leftArm.arm.rotation.set(0.25, -0.2, -0.74 + Math.cos(t * 1.3) * 0.03);
            }

            // Núcleo de Alma aprisionada entre as pontas do Bidente
            hades.soulOrb.rotation.y += dt * 3.0;
            hades.soulRing1.rotation.z += dt * 3.6;
            hades.soulRing2.rotation.y -= dt * 3.2;

            const powerMult = m === 'chama' || m === 'portal' ? 1.55 : 1.0;
            hades.bidentGlow.scale.setScalar((0.9 + Math.sin(t * 14) * 0.18) * powerMult);

            hades.bidentAnchor.getWorldPosition(tmpV);
            bidentLight.position.copy(tmpV);
            bidentLight.intensity = 2.4 * powerMult + Math.sin(t * 16) * 0.4;

            // Vento no manto esfarrapado, saiote e cabelos
            const wind = m === 'marcha' || m === 'portal' ? 1.85 : 1.0;
            hades.beardTip.rotation.x = -0.14 + Math.sin(t * 2.4 * wind) * 0.035;
            for (const s of hades.hairStrands) {
              s.mesh.rotation.x = Math.sin(t * 2.3 * wind + s.phase) * 0.04;
              s.mesh.rotation.z = Math.cos(t * 1.8 * wind + s.phase) * 0.032;
            }

            const cAttr = hades.cape.geometry.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i < cAttr.count; i++) {
              const bx = hades.capeBase[i * 3];
              const by = hades.capeBase[i * 3 + 1];
              const bz = hades.capeBase[i * 3 + 2];
              const normY = Math.max(0, Math.min(1, (0.98 - by) / 1.96));
              const wave1 = Math.sin(t * 3.1 * wind - normY * 4.5 + bx * 2.5) * 0.14 * normY;
              const wave2 = Math.cos(t * 2.1 * wind - normY * 3.0) * 0.06 * normY;
              cAttr.setXYZ(i, bx + Math.sin(t * 2.3 - normY * 3.0) * 0.035 * normY, by, bz + wave1 + wave2);
            }
            cAttr.needsUpdate = true;
            hades.cape.geometry.computeVertexNormals();

            const skAttr = hades.skirtMesh.geometry.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i < skAttr.count; i++) {
              const bx = hades.skirtBase[i * 3];
              const by = hades.skirtBase[i * 3 + 1];
              const bz = hades.skirtBase[i * 3 + 2];
              const normY = Math.max(0, Math.min(1, (0.46 - by) / 0.92));
              skAttr.setZ(i, bz + Math.sin(t * 3.3 * wind - normY * 4.0 + bx * 4.0) * 0.042 * normY);
            }
            skAttr.needsUpdate = true;
            hades.skirtMesh.geometry.computeVertexNormals();
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

          group = createUnitMesh(selectedUnit as UnitKind, 'player', pal, true, selectedCiv, selectedMajorGod);
          if (selectedUnit === 'titan') {
            group.scale.setScalar(0.48);
            group.position.y = -0.05;
          }
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

        group = createBuildingMesh(selectedBuilding, 'player', pal, true, selectedCiv, selectedMajorGod);
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
    let lastHadesFlameTime = 0;

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

      // Chamas e runas do Submundo de Hades
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
            w.group.position.set(
              Math.cos(ang) * w.radius,
              w.baseHeight,
              Math.sin(ang) * w.radius
            );
            w.group.rotation.y = -ang + Math.PI / 2;
            w.group.rotation.x = Math.sin(simTime * 3.5 + w.phase) * 0.25;
          }
        } else {
          (scene.background as THREE.Color).setHex(0x090b14);
          portalGroup.visible = false;
        }

        if (hm === 'chama') {
          if (simTime - lastHadesFlameTime > 0.68) {
            lastHadesFlameTime = simTime;
            if (hadesBidentAnchor) {
              const startV = new THREE.Vector3();
              hadesBidentAnchor.getWorldPosition(startV);
              triggerTartarusFlame(startV);
            }
          }
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

      // Cinzas e Almas de Hades
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

      // Projéteis da Chama do Tártaro
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

      // Poças e Colunas de Fogo Necromântico do Tártaro
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
          hf.pillar.geometry.dispose();
          hellfirePools.splice(i, 1);
        }
      }

      // Rastros de Sombra de Hades
      for (let i = hadesShadowTrails.length - 1; i >= 0; i--) {
        const st = hadesShadowTrails[i];
        st.life -= dt;
        const k = Math.max(0, st.life / st.max);
        st.mesh.scale.setScalar(1 + (1 - k) * 2.2);
        (st.mesh.material as THREE.Material).opacity = 0.62 * k;
        if (st.life <= 0) {
          scene.remove(st.mesh);
          st.mesh.geometry.dispose();
          hadesShadowTrails.splice(i, 1);
        }
      }

      // Decaimento de luzes de impacto
      if (flashLight.intensity > 0) flashLight.intensity = Math.max(0, flashLight.intensity - dt * 24);
      if (impactLight.intensity > 0) impactLight.intensity = Math.max(0, impactLight.intensity - dt * 18);
      if (hadesBlastLight.intensity > 0) hadesBlastLight.intensity = Math.max(0, hadesBlastLight.intensity - dt * 20);

      // Rotação da entidade / Órbita 360° da câmera
      const isGod = (selectedUnit === 'zeus' || selectedUnit === 'poseidon' || selectedUnit === 'hades') && selectedCiv === 'greek';

      if (autoRotateRef.current) {
        if (isGod) {
          // No caso dos deuses, quem gira em 360° é o cenário e a câmera ao redor; o deus fica fixo no centro
          orbitYaw += dt * 0.35;
        } else if (entityMeshRef.current) {
          entityMeshRef.current.rotation.y += dt * 0.45;
        }
      }

      if (isGod && entityMeshRef.current) {
        // Assegura que o deus permaneça sempre centralizado de frente
        entityMeshRef.current.rotation.x = 0;
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
      const isFocus = focusDivineRef.current && isGod;

      if (isGod) {
        // Câmera orbital 360° ao redor do Deus posicionado no centro exato
        const focusY = isFocus ? (selectedUnit === 'zeus' ? 1.4 : selectedUnit === 'poseidon' ? 1.5 : 1.48) : 1.35;
        const effDist = isFocus ? 2.0 / zoomRef.current : 5.8 / zoomRef.current;

        const horizDist = effDist * Math.cos(orbitPitch);
        const camX = Math.sin(orbitYaw) * horizDist;
        const camZ = Math.cos(orbitYaw) * horizDist;
        const camY = focusY + effDist * Math.sin(orbitPitch);

        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, focusY, 0);
      } else {
        const isBuilding = entityType === 'building';
        const isTitan = selectedUnit === 'titan';
        const baseDist = isBuilding ? 8.5 : isTitan ? 10.5 : 4.8;
        const baseHeight = isBuilding ? 1.6 : isTitan ? 2.8 : 1.1;
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
  }, [isOpen, entityType, selectedUnit, selectedBuilding, activeTier, selectedCiv, selectedMajorGod]);

  if (!isOpen) return null;

  const currentCivUnits = getUnitsForCivAndGod(selectedCiv, selectedMajorGod);
  const currentCivBuildings = getBuildingsForCivAndGod(selectedCiv, selectedMajorGod);

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

            {/* Subcategoria: Deuses Maiores */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f3d27a]">Deus Maior</span>
                <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider">Subcategoria</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(MAJOR_GODS_BY_CIV[selectedCiv] || MAJOR_GODS_BY_CIV.greek!).map((god) => {
                  const isSel = selectedMajorGod.toLowerCase() === god.id.toLowerCase();
                  return (
                    <button
                      key={god.id}
                      type="button"
                      onClick={() => handleSelectMajorGod(god.id)}
                      style={{
                        borderColor: isSel ? god.color : undefined,
                        backgroundColor: isSel ? `${god.color}26` : undefined,
                        color: isSel ? god.color : undefined,
                      }}
                      className={`rounded-lg py-1.5 px-1.5 text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                        isSel
                          ? 'shadow-md font-bold'
                          : 'border-white/10 bg-[#161c28] text-[#9ca3af] hover:text-white hover:border-white/20'
                      }`}
                      title={god.title}
                    >
                      <span className="truncate w-full">{god.name}</span>
                    </button>
                  );
                })}
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
                            : u.id === 'hades'
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                            : 'border-[#d4af37] bg-[#d4af37]/15 text-[#f3d27a]'
                          : 'border-white/10 bg-[#171c26]/60 text-[#d1d5db] hover:border-white/25 hover:bg-[#1f2636]'
                      }`}
                    >
                      <span className="font-display text-sm font-bold">{u.name}</span>
                      <span className="text-[11px] text-[#9ca3af]">{u.role}</span>
                    </button>
                  ))
                : currentCivBuildings.map((b) => (
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
              ) : entityType === 'unit' && selectedUnit === 'hades' && selectedCiv === 'greek' ? (
                // Poderes e Animações de Hades
                <>
                  <button
                    type="button"
                    onClick={() => setHadesMode('reinar')}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      hadesMode === 'reinar'
                        ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/20'
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
                        ? 'bg-purple-400 text-slate-950 shadow-md shadow-purple-500/30'
                        : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/20'
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
                        ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/20'
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
                        ? 'bg-purple-400 text-slate-950 shadow-md shadow-purple-500/30'
                        : 'border border-purple-400/30 text-purple-200 hover:bg-purple-400/20'
                    }`}
                  >
                    <Skull className="h-3.5 w-3.5" />
                    <span>Portal Almas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusDivine(!focusDivine)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      focusDivine
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/20'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{focusDivine ? 'Visão Corpo' : 'Focar Rosto/Bidente'}</span>
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
