import * as THREE from 'three';
import { BuildingKind } from '../../game/types';

/* ==========================================================================
   1. IDENTIDADE VISUAL DAS 3 DIVINDADES ATLANTES (KRONOS, ORANOS & GAIA)
   ========================================================================== */
export type AtlanteanArchGodKey = 'kronos' | 'oranos' | 'gaia';

export type AtlanteanArchBuildingKey =
  | 'siege_works'
  | 'counter_barracks'
  | 'tower'
  | 'mirror_tower'
  | 'farm'
  | 'titan_gate'
  | 'market'
  | 'armory'
  | 'wall'
  | 'gate'
  | 'barracks'
  | 'stable'
  | 'archery_range'
  | 'house';

export interface AtlanteanArchTheme {
  id: AtlanteanArchGodKey;
  godName: string;
  title: string;
  subtitle: string;
  bgHex: number;
  hemiSky: number;
  hemiGround: number;
  rimHex: number;
  wallBase: number;
  wallBright: number;
  trimStone: number;
  accentBand: number;
  goldHex: number;
  glowHex: number;
  glowBright: number;
  vortexOuter: number;
  vortexInner: number;
  silkBase: string;
  silkStripe: string;
  silkTrim: string;
  statueHex: number;
  groundGrass: string;
  groundDirt: string;
  ringColor1: string;
  ringColor2: string;
  oceanHex: number;
  horizonHex: number;
  titleColor: string;
}

export const ATLANTEAN_ARCH_THEMES: Record<AtlanteanArchGodKey, AtlanteanArchTheme> = {
  kronos: {
    id: 'kronos',
    godName: 'Kronos',
    title: 'de Kronos',
    subtitle: 'Arquitetura Temporal • Blocos em Levitação Temporal, Anéis Astrolábicos e Ampulhetas de Energia',
    bgHex: 0x0b1324,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e1b4b,
    rimHex: 0x38bdf8,
    wallBase: 0xe5e0d5,
    wallBright: 0xf1ece1,
    trimStone: 0x475569,
    accentBand: 0x2563eb,
    goldHex: 0xfacc15,
    glowHex: 0x38bdf8,
    glowBright: 0x7dd3fc,
    vortexOuter: 0x38bdf8,
    vortexInner: 0x2563eb,
    silkBase: '#f8fafc',
    silkStripe: '#2563eb',
    silkTrim: '#facc15',
    statueHex: 0x78716c,
    groundGrass: '#4b732d',
    groundDirt: '#bfa378',
    ringColor1: '#2563eb',
    ringColor2: '#facc15',
    oceanHex: 0x0c2442,
    horizonHex: 0x13223b,
    titleColor: '#7dd3fc',
  },
  oranos: {
    id: 'oranos',
    godName: 'Oranos',
    title: 'de Oranos',
    subtitle: 'Arquitetura Celeste • Mini-Portais de Passagem Celeste, Esferas Solares, Guardiões Alados e Raios de Luz',
    bgHex: 0x091c30,
    hemiSky: 0xfef9c3,
    hemiGround: 0x0369a1,
    rimHex: 0xfacc15,
    wallBase: 0xf8fafc,
    wallBright: 0xffffff,
    trimStone: 0x38bdf8,
    accentBand: 0xfacc15,
    goldHex: 0xfde047,
    glowHex: 0xfacc15,
    glowBright: 0xfef08a,
    vortexOuter: 0xfacc15,
    vortexInner: 0x38bdf8,
    silkBase: '#ffffff',
    silkStripe: '#0284c7',
    silkTrim: '#fde047',
    statueHex: 0xcbd5e1,
    groundGrass: '#548436',
    groundDirt: '#cbb082',
    ringColor1: '#38bdf8',
    ringColor2: '#fde047',
    oceanHex: 0x0b3656,
    horizonHex: 0x0e2f4d,
    titleColor: '#fde047',
  },
  gaia: {
    id: 'gaia',
    godName: 'Gaia',
    title: 'de Gaia',
    subtitle: 'Arquitetura Viva • Raízes e Vinhas nas Pilastras, Árvores Frondosas, Flores Esmeralda e Esporos Luminosos',
    bgHex: 0x061812,
    hemiSky: 0xd1fae5,
    hemiGround: 0x064e3b,
    rimHex: 0x10b981,
    wallBase: 0xe7e2d3,
    wallBright: 0xf0ece0,
    trimStone: 0x065f46,
    accentBand: 0x10b981,
    goldHex: 0xf59e0b,
    glowHex: 0x10b981,
    glowBright: 0x6ee7b7,
    vortexOuter: 0x10b981,
    vortexInner: 0xf59e0b,
    silkBase: '#f0fdf4',
    silkStripe: '#065f46',
    silkTrim: '#f59e0b',
    statueHex: 0x57534e,
    groundGrass: '#386e26',
    groundDirt: '#9e845c',
    ringColor1: '#10b981',
    ringColor2: '#f59e0b',
    oceanHex: 0x082e2b,
    horizonHex: 0x0a291f,
    titleColor: '#6ee7b7',
  },
};

export const ATLANTEAN_ARCH_ERA_NAMES: Record<number, string> = {
  1: 'Arcaico',
  2: 'Clássico',
  3: 'Heroico',
  4: 'Mítico',
  5: 'Imperial',
};

export interface AtlanteanArchBuildingMeta {
  label: string;
  minTier: 1 | 2 | 3 | 4;
  gameplayScale: number;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  focus: [number, number, number];
  tierDescriptions: Record<number, string>;
}

export const ATLANTEAN_ARCH_BUILDING_META: Record<AtlanteanArchBuildingKey, AtlanteanArchBuildingMeta> = {
  siege_works: {
    label: 'Oficina de Cerco Atlante',
    minTier: 3,
    gameplayScale: 0.96,
    markerRadius: 2.9,
    barHeight: 4.5,
    barWidth: 2.7,
    focus: [0, 1.5, 1.1],
    tierDescriptions: {
      3: 'Plataforma octogonal de engenharia com pórtico-ponte suspenso de calibragem (anel de Oricalco energizado), Sifão de Fogo blindado e Cheiroballista de torção dupla',
      4: 'Estaleiro fortificado com torres octogonais de cúpulas curvas laterais, Sifão de Fogo reforçado, Cheiroballista de Oricalco e guardião titânico',
      5: 'Complexo Imperial de Engenharia com alas simétricas escalonadas, cristal de calibração flutuante sob a ponte, cúpulas douradas e piras sagradas',
    },
  },
  counter_barracks: {
    label: 'Arsenal Divino (Observatório de Armas)',
    minTier: 2,
    gameplayScale: 0.95,
    markerRadius: 2.7,
    barHeight: 4.6,
    barWidth: 2.6,
    focus: [0, 1.7, 1.1],
    tierDescriptions: {
      2: 'Cofre octogonal escalonado com cúpula aberta coroada por anéis astrolábicos giratórios de Oricalco e pedestais radiais exibindo escudos trapezoidais de Murmillo',
      3: 'Observatório heroico ampliado com lâminas douradas flutuando sobre feixes de luz divina nos pedestais radiais e porta circular rúnica',
      4: 'Arsenal Mítico com duplo terraço octogonal, anéis astrolábicos triplos giratórios, piras energéticas e guardiões titânicos',
      5: 'Santuário Imperial de Oricalco com 4 torres satélites octogonais, núcleo prismático levitando no topo e escudos divinos irradiando energia',
    },
  },
  tower: {
    label: 'Torre de Espelho Atlante',
    minTier: 1,
    gameplayScale: 1.04,
    markerRadius: 1.75,
    barHeight: 5.4,
    barWidth: 2.0,
    focus: [0, 2.2, 1.0],
    tierDescriptions: {
      1: 'Torre-farol octogonal chanfrada arcaica com base escalonada, seteiras atlantes e pira de energia',
      2: 'Torre de observação clássica com pilastras esculpidas em relevos espirais, escudos de Murmillo e varanda octogonal',
      3: 'Torre heroica coroada por cúpula piramidal curva escalonada de 8 nervuras com lanterna luminosa e emblema divino',
      4: 'Icônica Torre de Espelho Mítica: grande espelho parabólico giratório de Oricalco polido com cristal focal disparando feixe concentrado de luz',
      5: 'Torre de Espelho Imperial Suprema: espelho parabólico duplo dourado de máxima potência, contrafortes chanfrados, guardiões na base e coroa divina',
    },
  },
  mirror_tower: {
    label: 'Torre de Espelho de Hélio',
    minTier: 4,
    gameplayScale: 1.08,
    markerRadius: 1.85,
    barHeight: 6.2,
    barWidth: 2.1,
    focus: [0, 2.4, 1.0],
    tierDescriptions: {
      4: 'Torre de Espelho de Hélio: grande espelho parabólico giratório de Oricalco polido com cristal focal disparando feixe concentrado de luz solar',
      5: 'Torre de Espelho Imperial Suprema: espelho parabólico duplo dourado de máxima potência, guardiões titânicos na base e aura solar divina',
    },
  },
  farm: {
    label: 'Jardins Concêntricos Hidropônicos',
    minTier: 1,
    gameplayScale: 0.9,
    markerRadius: 2.45,
    barHeight: 2.7,
    barWidth: 2.1,
    focus: [0, 1.2, 1.1],
    tierDescriptions: {
      1: 'Terraço circular concêntrico arcaico inspirado nos anéis de Atlântida, com canal circular de água cristalina, arcos de trigo dourado e fonte hidráulica central',
      2: 'Dois terraços hidropônicos escalonados com Fonte-Obelisco giratória jorrando arcos contínuos d’água sobre canteiros de trigo e videiras ondulantes',
      3: 'Três terraços concêntricos completos com canais luminosos, pontes radiais de mármore esculpido e arcos de videiras exuberantes',
      4: 'Jardins Suspensos Míticos com colunata circular de Oricalco emoldurando os canais e Fonte-Obelisco de cristal energizado',
      5: 'Jardins Suspensos Imperiais de Atlântida coroados por cúpula vazada de vidro e Oricalco sobre a fonte central e piras votivas',
    },
  },
  titan_gate: {
    label: 'Portal do Titã (Monólito Estelar)',
    minTier: 4,
    gameplayScale: 1.18,
    markerRadius: 4.1,
    barHeight: 7.4,
    barWidth: 3.5,
    focus: [0, 2.1, 1.0],
    tierDescriptions: {
      4: 'Monólito Estelar Octogonal: grande anel monumental inclinado de pedra talhada e Oricalco apoiado por 4 contrafortes curvos sobre espelho d’água abissal, com giroscópio triplo contra-rotativo',
      5: 'Monólito Estelar Supremo: 4 torres octogonais de contenção com cúpulas douradas, guardiões titânicos, feixe vertical de ascensão e giroscópio em potência máxima',
    },
  },
  market: {
    label: 'Ágora Concêntrica Atlante',
    minTier: 3,
    gameplayScale: 0.94,
    markerRadius: 2.7,
    barHeight: 4.3,
    barWidth: 2.5,
    focus: [0, 1.4, 1.0],
    tierDescriptions: {
      3: 'Anfiteatro comercial em semicírculo com rotunda de cúpula curva escalonada ao fundo, bancadas curvas com toldos trapezoidais e Globo Astrolábico de Oricalco girando no centro',
      4: 'Ágora Mítica ampliada com torres octogonais nas extremidades da ferradura, ânforas douradas e guardião titânico',
      5: 'Grande Empório Imperial Concêntrico com cúpulas escalonadas douradas, Globo Astrolábico monumental e piras sagradas',
    },
  },
  armory: {
    label: 'Refinaria de Oricalco',
    minTier: 2,
    gameplayScale: 0.95,
    markerRadius: 2.6,
    barHeight: 4.4,
    barWidth: 2.5,
    focus: [0, 1.4, 1.1],
    tierDescriptions: {
      2: 'Refinaria octogonal escalonada com cadinho central elevado de Oricalco fundido incandescente, 3 calhas radiais em estrela e prensa mecânica animada',
      3: 'Refinaria heroica coroada por lanterna-chaminé octogonal vazada acima da forja e prensa-martelo de Oricalco',
      4: 'Fundição Mítica com canais circulares de resfriamento, cúpula ventilada, piras e guardião titânico',
      5: 'Refinaria Imperial de Oricalco Puro com lanterna-cúpula dourada, 3 torres de condensação octogonais e prensa monumental',
    },
  },
  wall: {
    label: 'Muralha Chanfrada Atlante',
    minTier: 1,
    gameplayScale: 0.92,
    markerRadius: 1.45,
    barHeight: 2.7,
    barWidth: 1.8,
    focus: [0, 1.2, 1.3],
    tierDescriptions: {
      1: 'Muralha trapezoidal chanfrada arcaica com ameias em degraus atlantes e fundação de ardósia',
      2: 'Muralha clássica de mármore e ardósia talhada com frisos gravados e ameias reforçadas',
      3: 'Muralha heroica com coroa dourada de Oricalco nas ameias e bastiões laterais octogonais',
      4: 'Muralha mítica fortificada com contrafortes de Oricalco e pináculos cristalinos',
      5: 'Muralha Imperial de Atlântida com torres laterais coroadas em ouro e energia divina',
    },
  },
  gate: {
    label: 'Muralha & Portão Rúnico Atlante',
    minTier: 1,
    gameplayScale: 0.68,
    markerRadius: 1.95,
    barHeight: 3.6,
    barWidth: 2.4,
    focus: [0, 1.4, 1.5],
    tierDescriptions: {
      1: 'Muralha trapezoidal chanfrada arcaica com bastiões octogonais e Portão Duplo deslizante com fecho circular rúnico',
      2: 'Muralha clássica de mármore talhado com passadiço superior e portão deslizante de bronze e Oricalco',
      3: 'Muralha heroica flanqueada por torres octogonais com cúpulas piramidais curvas escalonadas e portão dourado',
      4: 'Muralha mítica monumental com portão deslizante de Oricalco dourado e guardiões titânicos',
      5: 'Muralha Imperial de Atlântida com torres colossais de cúpulas douradas, piras sagradas e portão rúnico energizado',
    },
  },
  barracks: {
    label: 'Caserna Atlante & Arena de Duelo',
    minTier: 2,
    gameplayScale: 0.95,
    markerRadius: 2.75,
    barHeight: 4.5,
    barWidth: 2.6,
    focus: [0, 1.15, 1.05],
    tierDescriptions: {
      2: 'Bastião octogonal fortificado com portal frontal saliente, porta dupla reforçada de bronze e Oricalco, escadaria de pedra, estandarte militar e arena de treinamento',
      3: 'Caserna heroica coroada por cúpula piramidal curva escalonada, pórtico avançado com 2 colunas atlantes, porta dupla de Oricalco dourado e escudos de Murmillo',
      4: 'Complexo Militar Mítico com alas duplas de telhados trapezoidais escalonados, grande portal de 4 colunas, braseiros na escadaria e dois guardiões atlantes',
      5: 'Cidadela Militar Imperial com pórtico olímpico de 4 colunas douradas, porta dupla colossal de Oricalco com runa central luminosa, 3 cúpulas escalonadas e cristal levitante',
    },
  },
  stable: {
    label: 'Picadeiro Circular Atlante',
    minTier: 2,
    gameplayScale: 0.94,
    markerRadius: 2.75,
    barHeight: 4.3,
    barWidth: 2.6,
    focus: [0, 1.3, 1.1],
    tierDescriptions: {
      2: 'Picadeiro em ferradura curva com baias radiais cobertas por telhados escalonados em arco, pista circular de cavalaria e bebedouro octogonal cristalino no centro',
      3: 'Picadeiro heroico com arco de Oricalco sobre a entrada da pista e baias trabalhadas',
      4: 'Complexo Equestre Mítico com torres octogonais de cúpulas curvas nas pontas da ferradura e piras sagradas',
      5: 'Picadeiro Imperial de Atlântida com cúpulas douradas, colunata de Oricalco e guardião titânico',
    },
  },
  archery_range: {
    label: 'Galeria de Precisão Atlante',
    minTier: 2,
    gameplayScale: 0.94,
    markerRadius: 2.7,
    barHeight: 4.4,
    barWidth: 2.55,
    focus: [0, 1.4, 1.2],
    tierDescriptions: {
      2: 'Estrutura em semi-octógono escalonado de dois níveis com galeria elevada de atiradores, alvos circulares em arco e linhas de mira douradas no piso',
      3: 'Academia de Precisão heroica com balista leve de treino montada no terraço superior e alvos de Oricalco em arco',
      4: 'Galeria Mítica com duas torres octogonais de observação com cúpulas curvas, guardiões arqueiros gêmeos e prismas de calibração',
      5: 'Santuário Imperial de Precisão com cúpula central dourada, colunas de Oricalco e piras sagradas',
    },
  },
  house: {
    label: 'Mansão Atlante Evolutiva',
    minTier: 1,
    gameplayScale: 0.64,
    markerRadius: 1.25,
    barHeight: 2.35,
    barWidth: 1.45,
    focus: [0, 1.3, 0.9],
    tierDescriptions: {
      1: 'Residência octogonal arcaica compacta em mármore claro com terraço geométrico, porta de Oricalco e canal raso na fundação',
      2: 'Casa clássica evoluída com pórtico trapezoidal, colunas atlantes esculpidas e friso colorido',
      3: 'Residência heroica ampliada com segunda torre octogonal coroada por cúpula piramidal curva escalonada',
      4: 'Mansão Mítica com alas laterais simétricas de telhados trapezoidais e espelhos d’água cristalinos integrados ao pátio',
      5: 'Palacete Imperial de Atlântida com 3 cúpulas escalonadas douradas, cristal flutuante sobre o terraço e piras de Oricalco',
    },
  },
};

const ATLANTEAN_ARCH_BUILDING_SET = new Set<string>(Object.keys(ATLANTEAN_ARCH_BUILDING_META));

export function isAtlanteanArchBuilding(kind: BuildingKind): kind is AtlanteanArchBuildingKey {
  return ATLANTEAN_ARCH_BUILDING_SET.has(kind);
}

export function resolveAtlanteanArchGod(majorGod?: string): AtlanteanArchGodKey {
  const norm = (majorGod || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  if (norm.includes('oranos') || norm.includes('urano')) return 'oranos';
  if (norm.includes('gaia')) return 'gaia';
  return 'kronos';
}

/* ==========================================================================
   2. TEXTURAS PROCEDURAIS PBR ATLANTES COM CACHE
   ========================================================================== */
const atlTexCache = new Map<string, THREE.CanvasTexture>();

function makeCachedTex(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat = true
): THREE.CanvasTexture {
  const cached = atlTexCache.get(key);
  if (cached) return cached;

  if (typeof document === 'undefined') {
    const empty = new THREE.Texture() as THREE.CanvasTexture;
    empty.userData.shared = true;
    atlTexCache.set(key, empty);
    return empty;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, w, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  tex.userData.shared = true;
  tex.needsUpdate = true;
  atlTexCache.set(key, tex);
  return tex;
}

function getAtlanteanWallTex(bright: boolean): THREE.CanvasTexture {
  return makeCachedTex(`atl_arch_wall_${bright ? 'bright' : 'base'}`, 512, 512, (ctx) => {
    ctx.fillStyle = bright ? '#f1ece1' : '#e5e0d5';
    ctx.fillRect(0, 0, 512, 512);

    // Deterministic stone grain
    let seed = bright ? 913 : 421;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 2400; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(60,55,45,0.07)';
      ctx.fillRect(rand() * 512, rand() * 512, 5, 5);
    }

    // Carved ashlar foundation blocks
    ctx.fillStyle = 'rgba(105, 100, 90, 0.30)';
    ctx.fillRect(0, 412, 512, 100);
    ctx.strokeStyle = 'rgba(40, 38, 35, 0.44)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.strokeRect(x, 412, 64, 50);
      ctx.strokeRect(x + 32, 462, 64, 50);
    }

    // Upper Atlantean spiral wave frieze
    ctx.fillStyle = 'rgba(90, 85, 75, 0.26)';
    ctx.fillRect(0, 0, 512, 68);
    ctx.strokeStyle = 'rgba(35, 32, 28, 0.52)';
    ctx.lineWidth = 3;
    for (let x = 18; x < 512; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 34, 11, 0, Math.PI * 1.65);
      ctx.stroke();
    }
  });
}

function getSteppedRoofTex(): THREE.CanvasTexture {
  return makeCachedTex('atl_arch_stepped_roof', 512, 512, (ctx) => {
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(0, 0, 512, 512);

    const steps = 16;
    const stepH = 512 / steps;
    for (let s = 0; s < steps; s++) {
      const y = s * stepH;
      const grad = ctx.createLinearGradient(0, y, 0, y + stepH);
      grad.addColorStop(0, 'rgba(255,255,255,0.24)');
      grad.addColorStop(0.75, 'rgba(120,115,108,0.14)');
      grad.addColorStop(1, 'rgba(20,20,22,0.52)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, 512, stepH);

      ctx.strokeStyle = 'rgba(25, 25, 28, 0.42)';
      ctx.lineWidth = 2;
      const off = s % 2 === 0 ? 0 : 32;
      for (let x = -32; x < 512; x += 64) {
        ctx.strokeRect(x + off, y, 64, stepH);
      }
    }
  });
}

function getCarvedTrimTex(): THREE.CanvasTexture {
  return makeCachedTex('atl_arch_carved_trim', 256, 512, (ctx) => {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 256, 512);

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.52)';
    ctx.lineWidth = 4;
    for (let y = 24; y < 512; y += 44) {
      ctx.strokeRect(18, y - 14, 220, 32);
      ctx.beginPath();
      ctx.arc(72, y + 2, 10, 0, Math.PI * 1.75);
      ctx.moveTo(128, y - 8);
      ctx.lineTo(128, y + 12);
      ctx.arc(184, y + 2, 10, Math.PI, Math.PI * 2.75);
      ctx.stroke();
    }
  });
}

function getAtlanteanSilkTex(theme: AtlanteanArchTheme): THREE.CanvasTexture {
  return makeCachedTex(`atl_arch_silk_${theme.id}`, 512, 256, (ctx) => {
    ctx.fillStyle = theme.silkBase;
    ctx.fillRect(0, 0, 512, 256);

    for (let x = 0; x < 512; x += 64) {
      ctx.fillStyle = theme.silkStripe;
      ctx.globalAlpha = 0.16;
      ctx.fillRect(x, 0, 24, 256);
      ctx.globalAlpha = 1.0;
    }

    ctx.fillStyle = theme.silkStripe;
    ctx.fillRect(0, 188, 512, 46);
    ctx.fillStyle = theme.silkTrim;
    ctx.fillRect(0, 182, 512, 6);
    ctx.fillRect(0, 234, 512, 6);

    ctx.strokeStyle = theme.silkTrim;
    ctx.lineWidth = 3.5;
    for (let x = 18; x < 512; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 211, 11, 0, Math.PI * 1.6);
      ctx.stroke();
    }
  });
}

function getTargetTex(theme: AtlanteanArchTheme): THREE.CanvasTexture {
  return makeCachedTex(`atl_arch_target_${theme.id}`, 256, 256, (ctx) => {
    const cx = 128;
    const cy = 128;
    const rings = ['#e5e0d5', theme.silkStripe, '#f8fafc', theme.silkTrim, '#38bdf8'];
    const radii = [122, 96, 70, 44, 20];
    rings.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx, cy, radii[i], 0, Math.PI * 2);
      ctx.fill();
    });
  }, false);
}

export function getAtlanteanArchGroundTexture(godKey: AtlanteanArchGodKey): THREE.CanvasTexture {
  const theme = ATLANTEAN_ARCH_THEMES[godKey] || ATLANTEAN_ARCH_THEMES.kronos;
  return makeCachedTex(`atl_arch_ground_${theme.id}`, 1024, 1024, (ctx) => {
    ctx.fillStyle = theme.groundGrass;
    ctx.fillRect(0, 0, 1024, 1024);

    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 4800; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(15,35,10,0.14)';
      ctx.fillRect(rand() * 1024, rand() * 1024, 10, 10);
    }

    const cx = 512;
    const cy = 512;
    const dirtGrad = ctx.createRadialGradient(cx, cy, 180, cx, cy, 435);
    dirtGrad.addColorStop(0, theme.groundDirt);
    dirtGrad.addColorStop(0.76, theme.groundDirt);
    dirtGrad.addColorStop(1, 'rgba(191,163,120,0)');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    const waterRings = [408, 342, 276];
    waterRings.forEach((r, idx) => {
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
      ctx.lineWidth = idx === 0 ? 20 : 12;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = idx % 2 === 0 ? theme.ringColor1 : theme.ringColor2;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r + (idx === 0 ? 10 : 6), 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(250, 204, 21, 0.32)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 210, cy + Math.sin(a) * 210);
      ctx.lineTo(cx + Math.cos(a) * 425, cy + Math.sin(a) * 425);
      ctx.stroke();
    }
  }, false);
}

/* ==========================================================================
   3. MATERIAIS E TIPOS DE ANIMAÇÃO
   ========================================================================== */
export interface AtlanteanRotatorRef {
  node: THREE.Object3D;
  axis: 'x' | 'y' | 'z';
  speed: number;
}

export interface AtlanteanFloaterRef {
  node: THREE.Object3D;
  baseY: number;
  amp: number;
  speed: number;
  phase: number;
}

export interface AtlanteanCropRef {
  node: THREE.Object3D;
  phase: number;
}

export interface AtlanteanGyroscopeRef {
  outer: THREE.Object3D;
  mid: THREE.Object3D;
  inner: THREE.Object3D;
  core: THREE.Object3D;
}

export interface AtlanteanSlidingGateRef {
  left: THREE.Object3D;
  right: THREE.Object3D;
  baseX: number;
  currentSlide: number;
}

export interface AtlanteanPressRef {
  node: THREE.Object3D;
  baseY: number;
}

export interface AtlanteanMirrorRef {
  pivot: THREE.Object3D;
  beam: THREE.Mesh;
  crystal: THREE.Object3D;
}

interface AtlMats {
  wallBase: THREE.MeshStandardMaterial;
  wallBright: THREE.MeshStandardMaterial;
  trimStone: THREE.MeshStandardMaterial;
  accentBand: THREE.MeshStandardMaterial;
  roofStepped: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  bronze: THREE.MeshStandardMaterial;
  mirrorGold: THREE.MeshStandardMaterial;
  silk: THREE.MeshStandardMaterial;
  target: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  statue: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  cropGold: THREE.MeshStandardMaterial;
  cropGreen: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  glowMat: THREE.MeshStandardMaterial;
  molten: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  fireJet: THREE.MeshBasicMaterial;
  vortexOuter: THREE.MeshBasicMaterial;
  vortexInner: THREE.MeshBasicMaterial;
  teamBanner: THREE.Material;
}

function createAtlMats(theme: AtlanteanArchTheme, teamMat?: THREE.Material): AtlMats {
  const accentBand = new THREE.MeshStandardMaterial({
    color: theme.accentBand,
    roughness: 0.34,
    metalness: 0.42,
  });
  return {
    wallBase: new THREE.MeshStandardMaterial({
      map: getAtlanteanWallTex(false),
      color: theme.wallBase,
      roughness: 0.62,
    }),
    wallBright: new THREE.MeshStandardMaterial({
      map: getAtlanteanWallTex(true),
      color: theme.wallBright,
      roughness: 0.50,
    }),
    trimStone: new THREE.MeshStandardMaterial({
      map: getCarvedTrimTex(),
      color: theme.trimStone,
      roughness: 0.44,
      metalness: 0.28,
    }),
    accentBand,
    roofStepped: new THREE.MeshStandardMaterial({
      map: getSteppedRoofTex(),
      roughness: 0.56,
      metalness: 0.14,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.goldHex,
      emissive: 0x3b2200,
      emissiveIntensity: 0.26,
      metalness: 0.92,
      roughness: 0.18,
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: 0x8a5a2b,
      metalness: 0.80,
      roughness: 0.28,
    }),
    mirrorGold: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0x78350f,
      emissiveIntensity: 0.35,
      metalness: 0.96,
      roughness: 0.10,
      side: THREE.DoubleSide,
    }),
    silk: new THREE.MeshStandardMaterial({
      map: getAtlanteanSilkTex(theme),
      roughness: 0.56,
      side: THREE.DoubleSide,
    }),
    target: new THREE.MeshStandardMaterial({
      map: getTargetTex(theme),
      roughness: 0.52,
    }),
    wood: new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.70 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x131722, roughness: 0.92 }),
    statue: new THREE.MeshStandardMaterial({
      color: theme.statueHex,
      roughness: 0.46,
      metalness: 0.22,
    }),
    foliage: new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.76 }),
    cropGold: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.62 }),
    cropGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.68 }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.42,
      roughness: 0.10,
      transparent: true,
      opacity: 0.88,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.32,
      roughness: 0.08,
      metalness: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    glowMat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.glowHex,
      emissiveIntensity: 3.0,
      roughness: 0.12,
    }),
    molten: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf97316,
      emissiveIntensity: 3.6,
      roughness: 0.18,
    }),
    flame: new THREE.MeshBasicMaterial({
      color: theme.glowHex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    }),
    fireJet: new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    }),
    vortexOuter: new THREE.MeshBasicMaterial({
      color: theme.vortexOuter,
      transparent: true,
      opacity: 0.86,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
    vortexInner: new THREE.MeshBasicMaterial({
      color: theme.vortexInner,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
    teamBanner: teamMat ?? accentBand,
  };
}

/* ==========================================================================
   4. HELPERS GEOMÉTRICOS EXCLUSIVOS DE ATLÂNTIDA
   ========================================================================== */
function grp(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function box(
  parent: THREE.Object3D | null,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  if (parent) parent.add(m);
  return m;
}

function cyl(
  parent: THREE.Object3D | null,
  rt: number,
  rb: number,
  h: number,
  segs: number,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  if (parent) parent.add(m);
  return m;
}

function buildOctagonalFoundation(
  parent: THREE.Object3D,
  radius: number,
  h: number,
  M: AtlMats,
  hasChannel = true
): THREE.Group {
  const f = grp(parent, 0, 0, 0);
  cyl(f, radius + 0.14, radius + 0.24, h * 0.55, 8, M.trimStone, [0, h * 0.275, 0], [0, Math.PI / 8, 0]);
  cyl(f, radius, radius + 0.08, h * 0.45, 8, M.wallBase, [0, h * 0.775, 0], [0, Math.PI / 8, 0]);
  cyl(f, radius + 0.03, radius + 0.03, 0.04, 8, M.accentBand, [0, h + 0.02, 0], [0, Math.PI / 8, 0]);
  if (hasChannel) {
    const ch = new THREE.Mesh(new THREE.RingGeometry(radius * 0.78, radius * 0.87, 32), M.water);
    ch.rotation.x = -Math.PI / 2;
    ch.position.y = h + 0.045;
    f.add(ch);
  }
  return f;
}

function buildCurvedOctagonalDome(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  M: AtlMats,
  pos: [number, number, number] = [0, 0, 0],
  goldenCap = false
): THREE.Group {
  const dGroup = grp(parent, pos[0], pos[1], pos[2]);
  cyl(dGroup, radius * 1.04, radius * 1.08, 0.16, 8, M.trimStone, [0, 0.08, 0], [0, Math.PI / 8, 0]);
  cyl(dGroup, radius * 1.07, radius * 1.07, 0.05, 8, M.gold, [0, 0.18, 0], [0, Math.PI / 8, 0]);

  const pts = [
    new THREE.Vector2(radius * 1.02, 0.20),
    new THREE.Vector2(radius * 0.92, 0.20 + height * 0.26),
    new THREE.Vector2(radius * 0.74, 0.20 + height * 0.56),
    new THREE.Vector2(radius * 0.50, 0.20 + height * 0.84),
    new THREE.Vector2(radius * 0.28, 0.20 + height),
  ];
  const domeGeo = new THREE.LatheGeometry(pts, 8);
  domeGeo.rotateY(Math.PI / 8);
  const domeMesh = new THREE.Mesh(domeGeo, goldenCap ? M.gold : M.roofStepped);
  dGroup.add(domeMesh);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, height * 1.02, 0.10), M.trimStone);
    rib.position.set(Math.cos(a) * radius * 0.65, 0.20 + height * 0.5, Math.sin(a) * radius * 0.65);
    rib.rotation.set(0, -a, 0.42);
    dGroup.add(rib);
  }

  const topY = 0.20 + height;
  cyl(dGroup, radius * 0.34, radius * 0.38, 0.12, 8, M.trimStone, [0, topY + 0.06, 0], [0, Math.PI / 8, 0]);
  cyl(dGroup, radius * 0.22, radius * 0.26, 0.14, 8, M.accentBand, [0, topY + 0.18, 0], [0, Math.PI / 8, 0]);
  cyl(dGroup, 0.03, radius * 0.14, 0.18, 8, M.gold, [0, topY + 0.34, 0], [0, Math.PI / 8, 0]);
  return dGroup;
}

function buildSteppedTrapezoidRoof(
  parent: THREE.Object3D,
  length: number,
  widthBot: number,
  height: number,
  M: AtlMats,
  pos: [number, number, number] = [0, 0, 0],
  withCaps = true
): THREE.Group {
  const rGroup = grp(parent, pos[0], pos[1], pos[2]);
  box(rGroup, length + 0.20, 0.12, widthBot + 0.20, M.trimStone, [0, 0.06, 0]);
  box(rGroup, length + 0.24, 0.07, widthBot + 0.24, M.accentBand, [0, 0.15, 0]);

  const rxB = length * 0.5;
  const rzB = widthBot * 0.5;
  const rxT = length * 0.42;
  const rzT = widthBot * 0.20;
  const y0 = 0.18;
  const y1 = 0.18 + height;

  const geom = new THREE.BufferGeometry();
  const verts = new Float32Array([
    -rxB, y0, rzB,   rxB, y0, rzB,   rxT, y1, rzT,
    -rxB, y0, rzB,   rxT, y1, rzT,  -rxT, y1, rzT,
     rxB, y0, -rzB, -rxB, y0, -rzB, -rxT, y1, -rzT,
     rxB, y0, -rzB, -rxT, y1, -rzT,  rxT, y1, -rzT,
    -rxB, y0, -rzB, -rxB, y0, rzB,  -rxT, y1, rzT,
    -rxB, y0, -rzB, -rxT, y1, rzT,  -rxT, y1, -rzT,
     rxB, y0, rzB,   rxB, y0, -rzB,  rxT, y1, -rzT,
     rxB, y0, rzB,   rxT, y1, -rzT,  rxT, y1, rzT,
    -rxT, y1, rzT,   rxT, y1, rzT,   rxT, y1, -rzT,
    -rxT, y1, rzT,   rxT, y1, -rzT, -rxT, y1, -rzT,
  ]);
  const uvs = new Float32Array(30 * 2);
  for (let i = 0; i < 30; i++) {
    uvs[i * 2] = (verts[i * 3] + rxB) / length;
    uvs[i * 2 + 1] = (verts[i * 3 + 1] - y0) / height;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  rGroup.add(new THREE.Mesh(geom, M.roofStepped));

  box(rGroup, length * 0.86, 0.16, widthBot * 0.36, M.trimStone, [0, y1 + 0.08, 0]);
  box(rGroup, length * 0.88, 0.05, widthBot * 0.40, M.accentBand, [0, y1 + 0.18, 0]);

  if (withCaps) {
    for (const sx of [-1, 1]) {
      const capX = sx * (length * 0.36);
      box(rGroup, 0.38, 0.24, widthBot * 0.46, M.trimStone, [capX, y1 + 0.12, 0]);
      box(rGroup, 0.42, 0.06, widthBot * 0.50, M.gold, [capX, y1 + 0.26, 0]);
    }
  }
  return rGroup;
}

function buildAtlanteanPillar(
  parent: THREE.Object3D,
  h: number,
  M: AtlMats,
  pos: [number, number, number] = [0, 0, 0],
  radius = 0.10,
  isGold = false
): THREE.Group {
  const c = grp(parent, pos[0], pos[1], pos[2]);
  const shaftMat = isGold ? M.gold : M.wallBright;
  cyl(c, radius * 1.45, radius * 1.60, 0.12, 8, M.trimStone, [0, 0.06, 0], [0, Math.PI / 8, 0]);
  cyl(c, radius * 1.25, radius * 1.35, 0.07, 8, M.gold, [0, 0.15, 0], [0, Math.PI / 8, 0]);
  cyl(c, radius * 0.92, radius * 1.05, h - 0.34, 8, shaftMat, [0, 0.18 + (h - 0.34) * 0.5, 0], [0, Math.PI / 8, 0]);
  cyl(c, radius * 1.15, radius * 1.15, 0.05, 8, M.accentBand, [0, h - 0.22, 0], [0, Math.PI / 8, 0]);
  cyl(c, radius * 1.45, radius * 1.02, 0.12, 8, M.gold, [0, h - 0.11, 0], [0, Math.PI / 8, 0]);
  cyl(c, radius * 1.55, radius * 1.45, 0.08, 8, M.trimStone, [0, h - 0.02, 0], [0, Math.PI / 8, 0]);
  return c;
}

function buildOrichalcumPortal(
  parent: THREE.Object3D,
  w: number,
  h: number,
  M: AtlMats,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0
): THREE.Group {
  const g = grp(parent, pos[0], pos[1], pos[2]);
  g.rotation.y = rotY;
  for (const s of [-1, 1]) {
    box(g, w * 0.22, h, 0.28, M.trimStone, [s * (w * 0.46), h * 0.5, 0]);
    box(g, w * 0.26, 0.10, 0.34, M.accentBand, [s * (w * 0.46), h + 0.05, 0]);
  }
  box(g, w * 0.72, h * 0.88, 0.12, M.gold, [0, h * 0.44, -0.02]);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(w * 0.11, 0.018, 8, 22), M.trimStone);
  ring.position.set(0, h * 0.46, 0.06);
  g.add(ring);
  const innerRune = new THREE.Mesh(new THREE.OctahedronGeometry(w * 0.06, 0), M.glowMat);
  innerRune.position.set(0, h * 0.46, 0.06);
  g.add(innerRune);

  box(g, w * 0.78, 0.05, 0.18, M.glowMat, [0, h * 0.90, 0.03]);
  box(g, w * 1.18, 0.18, 0.34, M.trimStone, [0, h + 0.16, 0.02]);
  box(g, w * 0.82, 0.14, 0.36, M.accentBand, [0, h + 0.31, 0.02]);
  return g;
}

function buildOctagonalTower(
  parent: THREE.Object3D,
  radius: number,
  h: number,
  M: AtlMats,
  pos: [number, number, number] = [0, 0, 0],
  withDome = true,
  goldenDome = false
): THREE.Group {
  const tw = grp(parent, pos[0], pos[1], pos[2]);
  cyl(tw, radius * 1.04, radius * 1.08, 0.16, 8, M.trimStone, [0, 0.08, 0], [0, Math.PI / 8, 0]);
  cyl(tw, radius * 0.94, radius, h, 8, M.wallBright, [0, 0.16 + h * 0.5, 0], [0, Math.PI / 8, 0]);
  cyl(tw, radius * 1.02, radius * 0.98, 0.09, 8, M.accentBand, [0, 0.16 + h * 0.56, 0], [0, Math.PI / 8, 0]);
  box(tw, 0.10, 0.32, 0.06, M.dark, [-0.09, 0.16 + h * 0.72, radius * 0.92]);
  box(tw, 0.10, 0.32, 0.06, M.dark, [0.09, 0.16 + h * 0.72, radius * 0.92]);
  if (withDome) {
    buildCurvedOctagonalDome(tw, radius * 0.98, radius * 1.06, M, [0, 0.16 + h, 0], goldenDome);
  } else {
    cyl(tw, radius * 1.06, radius * 1.02, 0.14, 8, M.trimStone, [0, 0.16 + h + 0.07, 0], [0, Math.PI / 8, 0]);
    cyl(tw, radius * 1.08, radius * 1.08, 0.05, 8, M.gold, [0, 0.16 + h + 0.16, 0], [0, Math.PI / 8, 0]);
  }
  return tw;
}

function buildMurmilloShield(
  parent: THREE.Object3D,
  M: AtlMats,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const sh = grp(parent, pos[0], pos[1], pos[2]);
  sh.rotation.set(rot[0], rot[1], rot[2]);
  sh.scale.setScalar(scale);
  box(sh, 0.36, 0.54, 0.04, M.trimStone, [0, 0, 0]);
  box(sh, 0.40, 0.06, 0.055, M.gold, [0, 0.26, 0]);
  box(sh, 0.32, 0.06, 0.055, M.gold, [0, -0.26, 0]);
  const boss = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), M.gold);
  boss.scale.set(1, 1.3, 0.5);
  boss.position.z = 0.03;
  sh.add(boss);
  return sh;
}

function buildEnergyBrazier(
  parent: THREE.Object3D,
  M: AtlMats,
  flamesList: THREE.Mesh[],
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const b = grp(parent, pos[0], pos[1], pos[2]);
  b.scale.setScalar(scale);
  cyl(b, 0.15, 0.21, 0.10, 8, M.trimStone, [0, 0.05, 0], [0, Math.PI / 8, 0]);
  cyl(b, 0.05, 0.07, 0.38, 8, M.gold, [0, 0.29, 0], [0, Math.PI / 8, 0]);
  cyl(b, 0.26, 0.13, 0.14, 8, M.gold, [0, 0.54, 0], [0, Math.PI / 8, 0]);
  const fl = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 1), M.flame);
  fl.scale.set(0.85, 1.55, 0.85);
  fl.position.set(0, 0.76, 0);
  b.add(fl);
  flamesList.push(fl);
  return b;
}

function buildCasernaMonumentalPortal(
  parent: THREE.Object3D,
  tier: number,
  M: AtlMats,
  flamesList: THREE.Mesh[],
  pos: [number, number, number] = [0, 0, 0]
): THREE.Group {
  const p = grp(parent, pos[0], pos[1], pos[2]);

  const doorW = 0.96 + (tier - 2) * 0.14;
  const doorH = 1.12 + (tier - 2) * 0.14;
  const depth = 0.38 + (tier - 2) * 0.08;
  const leafW = doorW * 0.5;
  const isGoldLeaf = tier >= 3;
  const leafMat = isGoldLeaf ? M.gold : M.bronze;

  const stairSteps = tier >= 5 ? 4 : tier >= 4 ? 3 : 2;
  const stairW = doorW + (tier >= 5 ? 1.10 : 0.65);
  box(p, stairW, 0.08, 0.34, M.trimStone, [0, 0.04, depth * 0.5 + 0.16]);
  for (let s = 0; s < stairSteps; s++) {
    const sh = 0.065 * (stairSteps - s);
    const sz = depth * 0.5 + 0.32 + s * 0.18;
    const sw = stairW + s * 0.14;
    box(p, sw, sh, 0.18, s % 2 === 0 ? M.wallBright : M.trimStone, [0, sh * 0.5 - 0.18, sz]);
  }

  box(p, doorW + 0.64, doorH + 0.24, depth, M.wallBright, [0, (doorH + 0.24) * 0.5, 0]);

  for (const s of [-1, 1]) {
    const px = s * (doorW * 0.5 + 0.22);
    box(p, 0.28, doorH + 0.22, depth + 0.16, M.trimStone, [px, (doorH + 0.22) * 0.5, 0.06]);
    box(p, 0.32, 0.10, depth + 0.20, M.accentBand, [px, doorH * 0.35, 0.06]);
    box(p, 0.32, 0.10, depth + 0.20, M.accentBand, [px, doorH * 0.78, 0.06]);
    box(p, 0.34, 0.12, depth + 0.24, M.gold, [px, doorH + 0.16, 0.06]);
  }

  const doorFaceZ = depth * 0.5 + 0.02;
  box(p, doorW + 0.10, doorH + 0.06, 0.10, M.dark, [0, doorH * 0.5 + 0.04, doorFaceZ - 0.03]);

  for (const s of [-1, 1]) {
    const lx = s * (leafW * 0.5);
    box(p, leafW - 0.035, doorH - 0.02, 0.08, leafMat, [lx, doorH * 0.5 + 0.04, doorFaceZ]);
    box(p, leafW - 0.12, doorH * 0.32, 0.03, isGoldLeaf ? M.trimStone : M.gold, [lx, doorH * 0.28 + 0.04, doorFaceZ + 0.04]);
    box(p, leafW - 0.12, doorH * 0.32, 0.03, isGoldLeaf ? M.trimStone : M.gold, [lx, doorH * 0.72 + 0.04, doorFaceZ + 0.04]);
    if (!isGoldLeaf) {
      box(p, leafW - 0.04, 0.06, 0.04, M.gold, [lx, doorH * 0.5 + 0.04, doorFaceZ + 0.04]);
    }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.085 + (tier - 2) * 0.01, 0.018, 8, 22),
      isGoldLeaf ? M.trimStone : M.gold
    );
    ring.position.set(lx - s * 0.05, doorH * 0.50 + 0.04, doorFaceZ + 0.065);
    p.add(ring);
  }

  box(p, 0.035, doorH, 0.10, M.dark, [0, doorH * 0.5 + 0.04, doorFaceZ + 0.015]);

  if (tier >= 4) {
    const centerRune = new THREE.Mesh(new THREE.OctahedronGeometry(0.11 + (tier - 4) * 0.04, 0), M.glowMat);
    centerRune.scale.set(0.85, 1.35, 0.45);
    centerRune.position.set(0, doorH * 0.56 + 0.04, doorFaceZ + 0.07);
    p.add(centerRune);
  }

  const lintelY = doorH + 0.18;
  box(p, doorW + 0.24, 0.07, depth + 0.20, M.glowMat, [0, lintelY - 0.04, 0.08]);
  box(p, doorW + 0.88, 0.18, depth + 0.28, M.trimStone, [0, lintelY + 0.10, 0.08]);
  box(p, doorW + 0.56, 0.16, depth + 0.26, M.accentBand, [0, lintelY + 0.27, 0.08]);
  box(p, doorW + 0.24, 0.14, depth + 0.22, M.gold, [0, lintelY + 0.42, 0.08]);

  const crest = grp(p, 0, lintelY + 0.48, depth * 0.5 + 0.20);
  box(crest, 0.06, 0.68, 0.03, M.gold, [0, 0.04, -0.02], [0, 0, 0.72]);
  box(crest, 0.06, 0.68, 0.03, M.gold, [0, 0.04, -0.02], [0, 0, -0.72]);
  buildMurmilloShield(crest, M, [0, 0.04, 0.02], [0, 0, 0], 0.68 + (tier - 2) * 0.06);

  if (tier === 2) {
    const banner = grp(p, doorW * 0.5 + 0.52, 0, depth * 0.5 + 0.24);
    cyl(banner, 0.024, 0.03, 1.55, 8, M.gold, [0, 0.78, 0]);
    box(banner, 0.34, 0.52, 0.03, M.teamBanner, [0.18, 1.24, 0]);
    box(banner, 0.36, 0.06, 0.04, M.gold, [0.18, 1.50, 0]);
  }
  if (tier >= 3) {
    const colH = doorH + 0.20;
    const colZ = depth * 0.5 + 0.42;
    for (const s of [-1, 1]) {
      buildAtlanteanPillar(p, colH, M, [s * (doorW * 0.5 + 0.30), 0, colZ], 0.085, tier === 5);
      buildMurmilloShield(p, M, [s * (doorW * 0.5 + 0.48), doorH * 0.58, 0.06], [0, s * 0.32, 0], 0.72);
    }
    box(p, doorW + 0.92, 0.14, 0.54, M.trimStone, [0, colH + 0.07, colZ - 0.12]);
    box(p, doorW + 0.96, 0.06, 0.58, M.accentBand, [0, colH + 0.17, colZ - 0.12]);
  }
  if (tier >= 4) {
    const colH = doorH + 0.20;
    const colZ = depth * 0.5 + 0.42;
    for (const s of [-1, 1]) {
      buildAtlanteanPillar(p, colH, M, [s * (doorW * 0.5 + 0.68), 0, colZ - 0.08], 0.092, tier === 5);
      buildEnergyBrazier(p, M, flamesList, [s * (stairW * 0.5 + 0.18), -0.10, depth * 0.5 + 0.68], 0.78 + (tier - 4) * 0.12);
    }
    box(p, doorW + 1.66, 0.16, 0.58, M.trimStone, [0, colH + 0.08, colZ - 0.12]);
    box(p, doorW + 1.72, 0.06, 0.62, M.gold, [0, colH + 0.19, colZ - 0.12]);
  }

  return p;
}

// Estátua Guardiã Titânica Atlante — apenas o adorno da divindade ativa é instanciado
function buildTitanGuardian(
  parent: THREE.Object3D,
  godKey: AtlanteanArchGodKey,
  M: AtlMats,
  rotatorsList: AtlanteanRotatorRef[],
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  variant: 'warrior' | 'archer' = 'warrior'
): THREE.Group {
  const g = grp(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);

  cyl(g, 0.42, 0.48, 0.32, 8, M.trimStone, [0, 0.16, 0], [0, Math.PI / 8, 0]);
  cyl(g, 0.46, 0.46, 0.07, 8, M.accentBand, [0, 0.35, 0], [0, Math.PI / 8, 0]);
  cyl(g, 0.44, 0.44, 0.05, 8, M.gold, [0, 0.41, 0], [0, Math.PI / 8, 0]);

  const fig = grp(g, 0, 0.44, 0);
  box(fig, 0.18, 0.56, 0.20, M.statue, [-0.12, 0.28, 0.03]);
  box(fig, 0.18, 0.56, 0.20, M.statue, [0.12, 0.28, -0.03]);
  box(fig, 0.48, 0.12, 0.32, M.accentBand, [0, 0.60, 0]);
  box(fig, 0.56, 0.52, 0.34, M.statue, [0, 0.90, 0]);
  for (const s of [-1, 1]) {
    box(fig, 0.22, 0.20, 0.36, M.statue, [s * 0.35, 1.06, 0], [0, 0, s * -0.22]);
  }
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), M.statue);
  head.position.set(0, 1.28, 0.03);
  fig.add(head);
  cyl(fig, 0.14, 0.14, 0.06, 8, M.gold, [0, 1.40, 0.03]);

  if (variant === 'archer') {
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 18, Math.PI), M.gold);
    bow.position.set(0, 0.92, 0.26);
    bow.rotation.set(0, 0, -Math.PI / 2);
    fig.add(bow);
  } else {
    cyl(fig, 0.028, 0.028, 1.38, 8, M.gold, [0.22, 0.76, 0.22]);
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), M.glowMat);
    orb.position.set(0.22, 1.48, 0.22);
    fig.add(orb);
  }

  if (godKey === 'kronos') {
    const kronosHalo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 8, 28), M.glowMat);
    kronosHalo.position.set(0, 1.18, -0.22);
    fig.add(kronosHalo);
    rotatorsList.push({ node: kronosHalo, axis: 'z', speed: 1.2 });
  } else if (godKey === 'oranos') {
    const oranosWings = grp(fig, 0, 0.98, -0.18);
    for (const s of [-1, 1]) {
      box(oranosWings, 0.58, 0.14, 0.04, M.gold, [s * 0.35, 0.16, -0.04], [0.15, s * -0.35, s * 0.42]);
      box(oranosWings, 0.46, 0.11, 0.04, M.wallBright, [s * 0.30, 0.02, -0.06], [0.15, s * -0.35, s * 0.25]);
    }
  } else {
    const gaiaLeaves = grp(fig, 0, 1.40, 0.03);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const lf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 0), M.foliage);
      lf.position.set(Math.cos(a) * 0.16, 0.04, Math.sin(a) * 0.16);
      gaiaLeaves.add(lf);
    }
    const gaiaGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), M.glowMat);
    gaiaGem.position.set(0, 0.12, 0);
    gaiaLeaves.add(gaiaGem);
  }

  return g;
}

// Kit 3D Exclusivo da Divindade Ativa (Kronos / Oranos / Gaia)
function attachActiveAtlanteanGodKit(
  parent: THREE.Object3D,
  godKey: AtlanteanArchGodKey,
  M: AtlMats,
  rotatorsList: AtlanteanRotatorRef[],
  floatersList: AtlanteanFloaterRef[],
  radius = 2.6
): void {
  const wrap = grp(parent, 0, 0, 0);

  if (godKey === 'kronos') {
    for (const s of [-1, 1]) {
      const px = s * radius;
      const pz = radius * 0.52;
      const base = grp(wrap, px, 0, pz);
      cyl(base, 0.34, 0.42, 0.20, 8, M.trimStone, [0, 0.10, 0], [0, Math.PI / 8, 0]);
      const hg = grp(base, 0, 0.72, 0);
      cyl(hg, 0.16, 0.02, 0.26, 8, M.glowMat, [0, 0.14, 0]);
      cyl(hg, 0.02, 0.16, 0.26, 8, M.glowMat, [0, -0.14, 0]);
      cyl(hg, 0.22, 0.22, 0.04, 8, M.gold, [0, 0.28, 0]);
      cyl(hg, 0.22, 0.22, 0.04, 8, M.gold, [0, -0.28, 0]);
      const astroRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.020, 8, 28), M.glowMat);
      hg.add(astroRing);
      rotatorsList.push({ node: astroRing, axis: 'z', speed: s * 1.4 });
      floatersList.push({ node: hg, baseY: 0.72, amp: 0.08, speed: 2.0, phase: s });

      for (let b = 0; b < 3; b++) {
        const a = b * 2.1 + (s > 0 ? 0.5 : 2.5);
        const blk = box(
          wrap,
          0.22,
          0.18,
          0.22,
          M.trimStone,
          [px + Math.cos(a) * 0.55, 1.15 + b * 0.42, pz + Math.sin(a) * 0.55],
          [b * 0.4, b * 0.6, 0.3]
        );
        floatersList.push({ node: blk, baseY: 1.15 + b * 0.42, amp: 0.12, speed: 1.4 + b * 0.3, phase: a });
        rotatorsList.push({ node: blk, axis: 'y', speed: s * 0.55 });
      }
    }
    return;
  }

  if (godKey === 'oranos') {
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (const s of [-1, 1]) {
      const px = s * radius;
      const pz = radius * 0.52;
      const portal = grp(wrap, px, 0, pz);
      cyl(portal, 0.46, 0.54, 0.16, 8, M.wallBright, [0, 0.08, 0], [0, Math.PI / 8, 0]);
      const skyRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.032, 10, 32), M.gold);
      skyRing1.position.set(0, 0.85, 0);
      const skyRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.022, 8, 28), M.glowMat);
      skyRing2.position.set(0, 0.85, 0);
      const solarOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 1), M.glowMat);
      solarOrb.position.set(0, 0.85, 0);
      portal.add(skyRing1, skyRing2, solarOrb);

      const lightBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.45, 3.2, 16, 1, true), beamMat);
      lightBeam.position.set(0, 1.65, 0);
      lightBeam.userData.ignoreRaycast = true;
      portal.add(lightBeam);

      rotatorsList.push({ node: skyRing1, axis: 'y', speed: s * 1.1 });
      rotatorsList.push({ node: skyRing2, axis: 'z', speed: -s * 1.9 });
      floatersList.push({ node: solarOrb, baseY: 0.85, amp: 0.09, speed: 2.6, phase: s });
    }
    return;
  }

  // Gaia: árvores frondosas, flores esmeralda luminosas e vinhas orgânicas
  for (const s of [-1, 1]) {
    const px = s * radius;
    const pz = radius * 0.52;
    const garden = grp(wrap, px, 0, pz);
    cyl(garden, 0.52, 0.58, 0.16, 8, M.trimStone, [0, 0.08, 0], [0, Math.PI / 8, 0]);
    cyl(garden, 0.08, 0.13, 0.96, 8, M.wood, [0, 0.60, 0]);
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.50, 1), M.foliage);
    crown1.position.set(0, 1.32, 0);
    garden.add(crown1);
    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), M.foliage);
    crown2.position.set(s * 0.24, 1.15, 0.18);
    garden.add(crown2);

    for (let fl = 0; fl < 4; fl++) {
      const a = (fl / 4) * Math.PI * 2;
      const flower = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), M.glowMat);
      flower.position.set(Math.cos(a) * 0.34, 0.22, Math.sin(a) * 0.34);
      garden.add(flower);
    }

    const vine = grp(wrap, s * (radius * 0.62), 0.24, radius * 0.44);
    for (let v = 0; v < 6; v++) {
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13, 0), M.foliage);
      leaf.position.set(Math.sin(v * 1.2) * 0.15, v * 0.22, Math.cos(v * 1.2) * 0.14);
      vine.add(leaf);
    }
    const topBud = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), M.glowMat);
    topBud.position.set(0, 1.38, 0);
    vine.add(topBud);
  }
}

/* ==========================================================================
   5. CONSTRUTOR PRINCIPAL DA SUÍTE ARQUITETÔNICA ATLANTE (14 TIPOS T1–T5)
   ========================================================================== */
export interface AtlanteanArchBuildResult {
  root: THREE.Group;
  meta: AtlanteanArchBuildingMeta;
  theme: AtlanteanArchTheme;
  effectiveTier: number;
  flames: THREE.Mesh[];
  rotators: AtlanteanRotatorRef[];
  floaters: AtlanteanFloaterRef[];
  cropClusters: AtlanteanCropRef[];
  gyroscopes: AtlanteanGyroscopeRef[];
  slidingGates: AtlanteanSlidingGateRef[];
  pressHammers: AtlanteanPressRef[];
  mirrorAssemblies: AtlanteanMirrorRef[];
  fountainHeads: THREE.Object3D[];
  towerFireOriginY?: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function buildAtlanteanArchBuilding(
  kind: AtlanteanArchBuildingKey,
  godKey: AtlanteanArchGodKey,
  age: number,
  enableShadows: boolean,
  teamMat?: THREE.Material
): AtlanteanArchBuildResult {
  const theme = ATLANTEAN_ARCH_THEMES[godKey] || ATLANTEAN_ARCH_THEMES.kronos;
  const meta = ATLANTEAN_ARCH_BUILDING_META[kind];
  const M = createAtlMats(theme, teamMat);

  const clampedAge = Math.max(1, Math.min(5, Math.round(age)));
  const t = Math.max(meta.minTier, clampedAge);

  const root = new THREE.Group();
  const flames: THREE.Mesh[] = [];
  const rotators: AtlanteanRotatorRef[] = [];
  const floaters: AtlanteanFloaterRef[] = [];
  const cropClusters: AtlanteanCropRef[] = [];
  const gyroscopes: AtlanteanGyroscopeRef[] = [];
  const slidingGates: AtlanteanSlidingGateRef[] = [];
  const pressHammers: AtlanteanPressRef[] = [];
  const mirrorAssemblies: AtlanteanMirrorRef[] = [];
  const fountainHeads: THREE.Object3D[] = [];

  let towerFireOriginY: number | undefined;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  // 1. OFICINA DE CERCO ATLANTE (T3–T5)
  if (kind === 'siege_works') {
    const rad = 2.35 + (t - 3) * 0.26;
    buildOctagonalFoundation(root, rad, 0.32, M, true);

    const bridgeH = 1.95 + (t - 3) * 0.24;
    for (const s of [-1, 1]) {
      box(root, 0.44, bridgeH, 0.64, M.trimStone, [s * 1.48, 0.32 + bridgeH * 0.5, -0.35]);
      box(root, 0.48, 0.10, 0.68, M.accentBand, [s * 1.48, 0.32 + bridgeH * 0.72, -0.35]);
    }
    box(root, 3.45, 0.28, 0.72, M.wallBright, [0, 0.32 + bridgeH + 0.14, -0.35]);
    box(root, 3.55, 0.08, 0.78, M.gold, [0, 0.32 + bridgeH + 0.30, -0.35]);
    buildSteppedTrapezoidRoof(root, 3.35, 0.80, 0.48, M, [0, 0.32 + bridgeH + 0.34, -0.35], true);

    const calRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.036, 10, 32), M.gold);
    calRing.position.set(0, 0.32 + bridgeH - 0.52, -0.35);
    root.add(calRing);
    const calInner = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.022, 8, 24), M.glowMat);
    calInner.position.copy(calRing.position);
    root.add(calInner);
    rotators.push({ node: calRing, axis: 'y', speed: 0.9 });
    rotators.push({ node: calInner, axis: 'z', speed: -1.8 });

    // Sifão de Fogo (Fire Siphon)
    const siphon = grp(root, -0.82, 0.36, 0.62);
    siphon.rotation.y = 0.22;
    box(siphon, 0.76, 0.34, 1.18, M.bronze, [0, 0.38, 0]);
    box(siphon, 0.80, 0.12, 1.22, M.gold, [0, 0.58, 0]);
    cyl(siphon, 0.22, 0.24, 0.55, 14, M.gold, [0, 0.88, -0.18]);
    cyl(siphon, 0.075, 0.11, 1.15, 12, M.bronze, [0, 0.84, 0.45], [Math.PI / 2 - 0.10, 0, 0]);
    cyl(siphon, 0.11, 0.08, 0.16, 12, M.gold, [0, 0.90, 1.02], [Math.PI / 2 - 0.10, 0, 0]);
    const fireJet = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.55, 10), M.fireJet);
    fireJet.rotation.x = Math.PI / 2 - 0.10;
    fireJet.position.set(0, 0.93, 1.32);
    siphon.add(fireJet);
    flames.push(fireJet);
    for (const wx of [-0.42, 0.42]) {
      for (const wz of [-0.36, 0.36]) {
        cyl(siphon, 0.22, 0.22, 0.08, 12, M.bronze, [wx, 0.22, wz], [0, 0, Math.PI / 2]);
        cyl(siphon, 0.08, 0.08, 0.11, 8, M.gold, [wx, 0.22, wz], [0, 0, Math.PI / 2]);
      }
    }

    // Cheiroballista
    const ballista = grp(root, 0.88, 0.36, 0.65);
    ballista.rotation.y = -0.25;
    cyl(ballista, 0.28, 0.34, 0.24, 8, M.trimStone, [0, 0.12, 0], [0, Math.PI / 8, 0]);
    box(ballista, 0.18, 0.12, 1.05, M.bronze, [0, 0.46, 0.08], [-0.14, 0, 0]);
    for (const bx of [-0.28, 0.28]) {
      cyl(ballista, 0.09, 0.09, 0.36, 10, M.gold, [bx, 0.52, 0.28]);
      box(ballista, 0.44, 0.05, 0.06, M.bronze, [bx * 1.45, 0.52, 0.16], [0, bx > 0 ? -0.45 : 0.45, 0]);
    }
    cyl(ballista, 0.015, 0.025, 0.82, 6, M.glowMat, [0, 0.55, 0.22], [Math.PI / 2 - 0.14, 0, 0]);

    if (t >= 4) {
      buildOctagonalTower(root, 0.64, bridgeH + 0.15, M, [-1.85, 0.32, -0.35], true, t === 5);
      buildOctagonalTower(root, 0.64, bridgeH + 0.15, M, [1.85, 0.32, -0.35], true, t === 5);
      buildTitanGuardian(root, godKey, M, rotators, [0, 0.32, -1.48], 0.86);
    }
    if (t === 5) {
      for (const s of [-1, 1]) {
        const wing = grp(root, s * 1.98, 0.32, 0.65);
        box(wing, 0.92, 1.25, 1.35, M.wallBase, [0, 0.625, 0]);
        buildSteppedTrapezoidRoof(wing, 1.00, 1.42, 0.52, M, [0, 1.25, 0], false);
      }
      const calCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), M.glowMat);
      calCrystal.position.set(0, 0.32 + bridgeH - 0.52, -0.35);
      root.add(calCrystal);
      floaters.push({ node: calCrystal, baseY: calCrystal.position.y, amp: 0.10, speed: 2.5, phase: 0 });
      rotators.push({ node: calCrystal, axis: 'y', speed: 1.6 });
      buildEnergyBrazier(root, M, flames, [-1.25, 0.32, 1.75], 0.92);
      buildEnergyBrazier(root, M, flames, [1.25, 0.32, 1.75], 0.92);
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.42);
  }

  // 2. ARSENAL DIVINO / QUARTEL DE CONTRA-ATAQUE (T2–T5)
  else if (kind === 'counter_barracks') {
    const rad = 2.15 + t * 0.22;
    buildOctagonalFoundation(root, rad, 0.30, M, true);

    const baseH = 1.25 + t * 0.16;
    cyl(root, 1.35 + t * 0.08, 1.48 + t * 0.08, baseH, 8, M.wallBright, [0, 0.30 + baseH * 0.5, 0], [0, Math.PI / 8, 0]);
    cyl(root, 1.48 + t * 0.08, 1.42 + t * 0.08, 0.14, 8, M.trimStone, [0, 0.30 + baseH + 0.07, 0], [0, Math.PI / 8, 0]);
    cyl(root, 1.52 + t * 0.08, 1.52 + t * 0.08, 0.06, 8, M.accentBand, [0, 0.30 + baseH + 0.17, 0], [0, Math.PI / 8, 0]);

    const upperY = 0.30 + baseH + 0.20;
    const upperR = 0.95 + t * 0.06;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      buildAtlanteanPillar(root, 0.82, M, [Math.cos(a) * upperR, upperY, Math.sin(a) * upperR], 0.085, t >= 4);
    }
    const ringCrown = new THREE.Mesh(new THREE.TorusGeometry(upperR, 0.08, 8, 8), M.trimStone);
    ringCrown.rotation.x = Math.PI / 2;
    ringCrown.rotation.z = Math.PI / 8;
    ringCrown.position.y = upperY + 0.85;
    root.add(ringCrown);

    const astroCenterY = upperY + 1.22;
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.036, 10, 32), M.gold);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.028, 10, 28), M.glowMat);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), M.glowMat);
    r1.position.y = r2.position.y = core.position.y = astroCenterY;
    r1.rotation.x = Math.PI / 4;
    r2.rotation.y = Math.PI / 3;
    root.add(r1, r2, core);
    rotators.push({ node: r1, axis: 'y', speed: 0.9 });
    rotators.push({ node: r2, axis: 'x', speed: -1.4 });
    rotators.push({ node: core, axis: 'y', speed: 1.8 });
    beaconCrystal = core;

    if (t >= 4) {
      const r3 = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.026, 8, 36), M.gold);
      r3.position.y = astroCenterY;
      r3.rotation.z = Math.PI / 5;
      root.add(r3);
      rotators.push({ node: r3, axis: 'z', speed: 0.7 });
    }

    buildOrichalcumPortal(root, 0.95, 1.12, M, [0, 0.30, 1.38 + t * 0.08]);

    const pedCount = t >= 4 ? 6 : 4;
    for (let p = 0; p < pedCount; p++) {
      const a = (p / pedCount) * Math.PI * 2 + 0.52;
      if (Math.abs(Math.sin(a) - 1) < 0.15 && Math.abs(Math.cos(a)) < 0.3) continue;
      const px = Math.cos(a) * (rad - 0.35);
      const pz = Math.sin(a) * (rad - 0.35);
      const ped = grp(root, px, 0.30, pz);
      cyl(ped, 0.22, 0.26, 0.45, 8, M.trimStone, [0, 0.225, 0], [0, Math.PI / 8, 0]);
      cyl(ped, 0.24, 0.24, 0.05, 8, M.glowMat, [0, 0.48, 0], [0, Math.PI / 8, 0]);
      if (p % 2 === 0) {
        const sh = buildMurmilloShield(ped, M, [0, 0.88, 0], [0, -a + Math.PI / 2, 0], 0.85);
        floaters.push({ node: sh, baseY: 0.88, amp: 0.06, speed: 2.2, phase: p });
      } else {
        const blade = grp(ped, 0, 0.92, 0);
        box(blade, 0.08, 0.56, 0.025, M.gold, [0, 0, 0]);
        box(blade, 0.22, 0.04, 0.05, M.trimStone, [0, -0.22, 0]);
        floaters.push({ node: blade, baseY: 0.92, amp: 0.07, speed: 2.4, phase: p });
        rotators.push({ node: blade, axis: 'y', speed: 1.5 });
      }
    }

    if (t >= 4) {
      buildTitanGuardian(root, godKey, M, rotators, [-1.35, 0.30, rad * 0.72], 0.86);
      buildTitanGuardian(root, godKey, M, rotators, [1.35, 0.30, rad * 0.72], 0.86);
    }
    if (t === 5) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        buildOctagonalTower(root, 0.46, 1.75, M, [Math.cos(a) * (rad - 0.15), 0.30, Math.sin(a) * (rad - 0.15)], true, true);
      }
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.42);
  }

  // 3. TORRE DE VIGIA / TORRE DE ESPELHO ATLANTE (T1–T5) & TORRE DE ESPELHO DE HÉLIO (T4–T5)
  else if (kind === 'tower' || kind === 'mirror_tower') {
    const baseR = 1.15 + t * 0.10;
    const h = 1.75 + t * 0.44;
    buildOctagonalFoundation(root, baseR, 0.32, M, t >= 3);

    cyl(root, 0.62 + t * 0.03, 0.88 + t * 0.05, h, 8, M.wallBright, [0, 0.32 + h * 0.5, 0], [0, Math.PI / 8, 0]);
    cyl(root, 0.78 + t * 0.04, 0.78 + t * 0.04, 0.10, 8, M.accentBand, [0, 0.32 + h * 0.52, 0], [0, Math.PI / 8, 0]);

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      box(
        root,
        0.28,
        h * 0.52,
        0.42,
        M.trimStone,
        [Math.cos(a) * 0.85, 0.32 + h * 0.24, Math.sin(a) * 0.85],
        [0, -a + Math.PI / 2, 0]
      );
    }

    const topY = 0.32 + h;
    cyl(root, 0.92 + t * 0.04, 0.74 + t * 0.04, 0.24, 8, M.trimStone, [0, topY + 0.12, 0], [0, Math.PI / 8, 0]);
    cyl(root, 0.96 + t * 0.04, 0.96 + t * 0.04, 0.06, 8, M.gold, [0, topY + 0.26, 0], [0, Math.PI / 8, 0]);

    if (t <= 2) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        box(
          root,
          0.22,
          0.30,
          0.12,
          M.wallBright,
          [Math.cos(a) * 0.82, topY + 0.42, Math.sin(a) * 0.82],
          [0, -a + Math.PI / 2, 0]
        );
      }
      buildEnergyBrazier(root, M, flames, [0, topY + 0.28, 0], 0.85);
      // T2 classical upgrade: carved shields + balcony corner finials (strict T2 > T1 mesh count)
      if (t === 2) {
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          buildMurmilloShield(
            root,
            M,
            [Math.cos(a) * 0.95, topY + 0.28, Math.sin(a) * 0.95],
            [0, -a + Math.PI / 2, 0],
            0.55
          );
        }
      }
      towerFireOriginY = topY + 0.75;
    } else if (t === 3) {
      // T3 Heroic Watchtower with curved 8-ribbed octagonal dome + balcony colonnade
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        cyl(root, 0.05, 0.06, 0.36, 6, M.gold, [Math.cos(a) * 0.88, topY + 0.44, Math.sin(a) * 0.88]);
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        buildMurmilloShield(
          root,
          M,
          [Math.cos(a) * 0.98, topY + 0.14, Math.sin(a) * 0.98],
          [0, -a + Math.PI / 2, 0],
          0.62
        );
      }
      buildCurvedOctagonalDome(root, 0.86, 0.95, M, [0, topY + 0.56, 0], false);
      const topOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), M.glowMat);
      topOrb.position.y = topY + 2.15;
      root.add(topOrb);
      rotators.push({ node: topOrb, axis: 'y', speed: 1.6 });
      beaconCrystal = topOrb;
      towerFireOriginY = topY + 2.15;
    } else {
      // T4–T5: Icônica Torre de Espelho Atlante!
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        buildAtlanteanPillar(root, 0.62, M, [Math.cos(a) * 0.94, topY + 0.28, Math.sin(a) * 0.94], 0.055, t === 5);
      }
      buildEnergyBrazier(root, M, flames, [-0.95, 0.32, 0.95], 0.72);
      buildEnergyBrazier(root, M, flames, [0.95, 0.32, 0.95], 0.72);

      const mirrorPivot = grp(root, 0, topY + 0.95, 0);
      cyl(mirrorPivot, 0.12, 0.16, 0.70, 8, M.gold, [0, -0.35, 0]);
      box(mirrorPivot, 1.38, 0.10, 0.16, M.gold, [0, -0.02, 0]);
      box(mirrorPivot, 0.10, 0.72, 0.16, M.gold, [-0.66, 0.32, 0]);
      box(mirrorPivot, 0.10, 0.72, 0.16, M.gold, [0.66, 0.32, 0]);

      const mPts = [
        new THREE.Vector2(0.01, -0.22),
        new THREE.Vector2(0.28, -0.18),
        new THREE.Vector2(0.52, -0.08),
        new THREE.Vector2(0.68 + (t - 4) * 0.12, 0.08),
      ];
      const dishGeo = new THREE.LatheGeometry(mPts, 24);
      dishGeo.rotateX(Math.PI / 2);
      const dish = new THREE.Mesh(dishGeo, M.mirrorGold);
      dish.position.set(0, 0.34, -0.08);
      mirrorPivot.add(dish);

      const mirrorRim = new THREE.Mesh(new THREE.TorusGeometry(0.68 + (t - 4) * 0.12, 0.045, 8, 28), M.trimStone);
      mirrorRim.position.set(0, 0.34, 0.02);
      mirrorPivot.add(mirrorRim);

      const focusCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), M.glowMat);
      focusCrystal.position.set(0, 0.34, 0.36);
      mirrorPivot.add(focusCrystal);
      beaconCrystal = focusCrystal;

      const beamLen = 5.4;
      const beamGeo = new THREE.CylinderGeometry(0.05, 0.24, beamLen, 14, 1, true);
      beamGeo.rotateX(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({
        color: theme.glowBright,
        transparent: true,
        opacity: 0.44,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.set(0, 0.34 - 0.65, 0.36 + beamLen * 0.48);
      beamMesh.rotation.x = 0.24;
      beamMesh.userData.ignoreRaycast = true;
      mirrorPivot.add(beamMesh);

      mirrorAssemblies.push({ pivot: mirrorPivot, beam: beamMesh, crystal: focusCrystal });
      towerFireOriginY = topY + 1.28;

      if (t === 5) {
        buildTitanGuardian(root, godKey, M, rotators, [-1.35, 0, 1.15], 0.82);
        buildTitanGuardian(root, godKey, M, rotators, [1.35, 0, 1.15], 0.82);

        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(1.05, 0.06, 10, 32),
          M.gold
        );
        halo.rotation.x = Math.PI / 2;
        halo.position.set(0, topY + 1.95, 0);
        root.add(halo);
        metropolisHalo = halo;

        const crownCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), M.glowMat);
        crownCrystal.position.set(0, topY + 2.35, 0);
        root.add(crownCrystal);
        metropolisCrystal = crownCrystal;
      }
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, 2.05);
  }

  // 4. FAZENDA / JARDINS CONCÊNTRICOS HIDROPÔNICOS (T1–T5)
  else if (kind === 'farm') {
    const numTerraces = Math.min(3, Math.max(1, t));

    cyl(root, 2.65, 2.78, 0.22, 32, M.trimStone, [0, 0.11, 0]);
    const ch1 = new THREE.Mesh(new THREE.RingGeometry(2.22, 2.52, 36), M.water);
    ch1.rotation.x = -Math.PI / 2;
    ch1.position.y = 0.23;
    root.add(ch1);

    for (let b = 0; b < 4; b++) {
      const a = (b / 4) * Math.PI * 2;
      box(root, 0.48, 0.08, 0.56, M.wallBright, [Math.cos(a) * 2.38, 0.24, Math.sin(a) * 2.38], [0, -a + Math.PI / 2, 0]);
    }

    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      if (Math.abs(Math.sin(a * 2)) < 0.25) continue;
      const r = 1.92;
      const stalk = grp(root, Math.cos(a) * r, 0.22, Math.sin(a) * r);
      const hSt = 0.34 + (i % 3) * 0.06;
      cyl(stalk, 0.018, 0.032, hSt, 6, i % 3 === 0 ? M.cropGreen : M.cropGold, [0, hSt * 0.5, 0]);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 5), i % 3 === 0 ? M.cropGreen : M.cropGold);
      head.position.y = hSt + 0.06;
      stalk.add(head);
      cropClusters.push({ node: stalk, phase: i * 0.6 });
    }

    if (numTerraces >= 2) {
      cyl(root, 1.62, 1.72, 0.44, 32, M.wallBright, [0, 0.22, 0]);
      const ch2 = new THREE.Mesh(new THREE.RingGeometry(1.30, 1.54, 32), M.water);
      ch2.rotation.x = -Math.PI / 2;
      ch2.position.y = 0.45;
      root.add(ch2);

      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + 0.2;
        const r = 1.08;
        const stalk = grp(root, Math.cos(a) * r, 0.44, Math.sin(a) * r);
        cyl(stalk, 0.02, 0.034, 0.38, 6, M.cropGold, [0, 0.19, 0]);
        const head = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.17, 5), M.cropGold);
        head.position.y = 0.44;
        stalk.add(head);
        cropClusters.push({ node: stalk, phase: i * 0.9 });
      }
    }

    const centerY = numTerraces >= 3 ? 0.68 : numTerraces === 2 ? 0.44 : 0.22;
    if (numTerraces >= 3) {
      cyl(root, 0.88, 0.96, 0.68, 16, M.trimStone, [0, 0.34, 0]);
      cyl(root, 0.90, 0.90, 0.05, 16, M.gold, [0, 0.69, 0]);
    }

    const fntBase = grp(root, 0, centerY, 0);
    cyl(fntBase, 0.26, 0.36, 0.95 + t * 0.12, 8, M.wallBright, [0, 0.48 + t * 0.06, 0], [0, Math.PI / 8, 0]);
    const headPivot = grp(fntBase, 0, 0.96 + t * 0.12, 0);
    cyl(headPivot, 0.16, 0.22, 0.24, 8, M.gold, [0, 0.12, 0]);
    const fntCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), M.glowMat);
    fntCrystal.position.y = 0.42;
    headPivot.add(fntCrystal);

    for (let w = 0; w < 4; w++) {
      const a = (w / 4) * Math.PI * 2;
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.032, 8, 18, Math.PI * 0.72), M.water);
      arc.position.set(Math.cos(a) * 0.56, -0.22, Math.sin(a) * 0.56);
      arc.rotation.y = -a;
      arc.rotation.z = 0.22;
      headPivot.add(arc);
    }
    fountainHeads.push(headPivot);

    if (t >= 4) {
      for (let c = 0; c < 8; c++) {
        const a = (c / 8) * Math.PI * 2 + Math.PI / 8;
        buildAtlanteanPillar(root, 1.48, M, [Math.cos(a) * 1.62, 0.44, Math.sin(a) * 1.62], 0.072, t === 5);
      }
      const topHalo = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.07, 8, 32), M.gold);
      topHalo.rotation.x = Math.PI / 2;
      topHalo.position.y = 1.94;
      root.add(topHalo);
    }

    if (t === 5) {
      const domeGlass = new THREE.Mesh(
        new THREE.SphereGeometry(1.58, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
        M.glass
      );
      domeGlass.position.y = 1.94;
      root.add(domeGlass);
      for (let r = 0; r < 8; r++) {
        const a = (r / 8) * Math.PI * 2;
        const rib = new THREE.Mesh(new THREE.TorusGeometry(1.60, 0.03, 6, 20, Math.PI * 0.5), M.gold);
        rib.position.y = 1.94;
        rib.rotation.y = a;
        root.add(rib);
      }
      buildEnergyBrazier(root, M, flames, [-1.95, 0.22, 1.95], 0.88);
      buildEnergyBrazier(root, M, flames, [1.95, 0.22, 1.95], 0.88);
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, 2.95);
  }

  // 5. PORTAL DO TITÃ — MONÓLITO ESTELAR OCTOGONAL ATLANTE (T4–T5)
  else if (kind === 'titan_gate') {
    const rad = 2.65 + (t - 4) * 0.35;
    buildOctagonalFoundation(root, rad, 0.34, M, false);

    cyl(root, 1.95, 1.95, 0.08, 32, M.dark, [0, 0.36, 0]);
    const waterMirror = new THREE.Mesh(new THREE.CircleGeometry(1.88, 32), M.water);
    waterMirror.rotation.x = -Math.PI / 2;
    waterMirror.position.y = 0.41;
    root.add(waterMirror);
    const rimGold = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.09, 8, 32), M.gold);
    rimGold.rotation.x = Math.PI / 2;
    rimGold.position.y = 0.42;
    root.add(rimGold);

    const monoGrp = grp(root, 0, 2.05 + (t - 4) * 0.22, 0);
    monoGrp.rotation.x = 0.22;
    const starRing = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.22, 8, 8), M.trimStone);
    starRing.rotation.z = Math.PI / 8;
    monoGrp.add(starRing);
    const starGold = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.07, 8, 8), M.gold);
    starGold.rotation.z = Math.PI / 8;
    monoGrp.add(starGold);

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const butt = grp(root, Math.cos(a) * 1.95, 0.34, Math.sin(a) * 1.95);
      butt.rotation.y = -a + Math.PI / 2;
      box(butt, 0.42, 1.85, 0.56, M.wallBright, [0, 0.85, 0.15], [-0.34, 0, 0]);
      box(butt, 0.46, 0.10, 0.60, M.accentBand, [0, 1.45, -0.05], [-0.34, 0, 0]);
    }

    const outerV = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.07, 10, 32), M.vortexOuter);
    const midV = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.06, 10, 28), M.vortexInner);
    const innerV = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 8, 24), M.gold);
    const coreV = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), M.glowMat);
    monoGrp.add(outerV, midV, innerV, coreV);
    gyroscopes.push({ outer: outerV, mid: midV, inner: innerV, core: coreV });
    vortexRing = outerV;
    beaconCrystal = coreV;

    const vertBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.72, 6.2, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: theme.glowBright,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    vertBeam.position.y = 3.1;
    vertBeam.userData.ignoreRaycast = true;
    root.add(vertBeam);

    if (t === 5) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        buildOctagonalTower(root, 0.56, 2.35, M, [Math.cos(a) * 2.48, 0.34, Math.sin(a) * 2.48], true, true);
      }
      buildTitanGuardian(root, godKey, M, rotators, [-1.35, 0.34, 2.35], 0.92);
      buildTitanGuardian(root, godKey, M, rotators, [1.35, 0.34, 2.35], 0.92);
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.45);
  }

  // 6. MERCADO / ÁGORA CONCÊNTRICA ATLANTE (T3–T5)
  else if (kind === 'market') {
    const rad = 2.45 + (t - 3) * 0.25;
    buildOctagonalFoundation(root, rad, 0.28, M, true);

    const rotH = 1.65 + (t - 3) * 0.16;
    cyl(root, 1.15, 1.22, rotH, 8, M.wallBright, [0, 0.28 + rotH * 0.5, -1.05], [0, Math.PI / 8, 0]);
    buildCurvedOctagonalDome(root, 1.18, 1.05, M, [0, 0.28 + rotH, -1.05], t === 5);
    buildOrichalcumPortal(root, 0.88, 1.05, M, [0, 0.28, 0.05]);

    const stallAngles = [-1.95, -1.35, -0.75, 0.75, 1.35, 1.95];
    stallAngles.forEach((a, idx) => {
      const sr = rad - 0.58;
      const st = grp(root, Math.sin(a) * sr, 0.28, Math.cos(a) * sr);
      st.rotation.y = a + Math.PI;
      box(st, 0.82, 0.38, 0.44, M.wallBase, [0, 0.19, 0]);
      box(st, 0.86, 0.05, 0.48, M.gold, [0, 0.40, 0]);
      buildAtlanteanPillar(st, 1.06, M, [-0.36, 0, -0.18], 0.045);
      buildAtlanteanPillar(st, 1.06, M, [0.36, 0, -0.18], 0.045);
      box(st, 0.94, 0.05, 0.68, M.silk, [0, 1.10, 0.04], [0.22, 0, 0]);
      cyl(st, 0.08, 0.05, 0.24, 10, idx % 2 === 0 ? M.accentBand : M.trimStone, [-0.20, 0.54, 0]);
      box(st, 0.20, 0.12, 0.16, M.gold, [0.18, 0.48, 0]);
    });

    const globeStand = grp(root, 0, 0.28, 0.72);
    cyl(globeStand, 0.38, 0.46, 0.46, 8, M.trimStone, [0, 0.23, 0], [0, Math.PI / 8, 0]);
    cyl(globeStand, 0.42, 0.42, 0.06, 8, M.gold, [0, 0.48, 0], [0, Math.PI / 8, 0]);
    const globe = grp(globeStand, 0, 1.05, 0);
    const gSphere = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), M.accentBand);
    const gRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 28), M.gold);
    const gRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 28), M.gold);
    gRing2.rotation.y = Math.PI / 2;
    const gRing3 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.018, 8, 32), M.glowMat);
    gRing3.rotation.x = Math.PI / 3;
    globe.add(gSphere, gRing1, gRing2, gRing3);
    rotators.push({ node: globe, axis: 'y', speed: 0.95 });
    rotators.push({ node: gRing3, axis: 'z', speed: -1.3 });

    if (t >= 4) {
      buildOctagonalTower(root, 0.54, 1.95, M, [-rad + 0.35, 0.28, -0.55], true, t === 5);
      buildOctagonalTower(root, 0.54, 1.95, M, [rad - 0.35, 0.28, -0.55], true, t === 5);
      buildTitanGuardian(root, godKey, M, rotators, [0, 0.28, 1.82], 0.80);
    }
    if (t === 5) {
      buildEnergyBrazier(root, M, flames, [-1.15, 0.28, 1.95], 0.90);
      buildEnergyBrazier(root, M, flames, [1.15, 0.28, 1.95], 0.90);
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.42);
  }

  // 7. FERREIRO / REFINARIA DE ORICALCO (T2–T5)
  else if (kind === 'armory') {
    const rad = 2.25 + t * 0.20;
    buildOctagonalFoundation(root, rad, 0.32, M, t >= 4);

    cyl(root, 0.86, 1.02, 0.78, 8, M.trimStone, [0, 0.32 + 0.39, 0], [0, Math.PI / 8, 0]);
    cyl(root, 0.92, 0.92, 0.08, 8, M.gold, [0, 1.12, 0], [0, Math.PI / 8, 0]);
    cyl(root, 0.72, 0.72, 0.14, 16, M.molten, [0, 1.14, 0]);

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const chGrp = grp(root, 0, 0.32, 0);
      chGrp.rotation.y = a;
      box(chGrp, 0.26, 0.16, 1.22, M.trimStone, [0, 0.42, 1.18], [0.28, 0, 0]);
      box(chGrp, 0.14, 0.08, 1.18, M.molten, [0, 0.48, 1.18], [0.28, 0, 0]);
      cyl(chGrp, 0.34, 0.40, 0.24, 8, M.wallBright, [0, 0.12, 1.84], [0, Math.PI / 8, 0]);
      cyl(chGrp, 0.22, 0.22, 0.06, 8, M.molten, [0, 0.25, 1.84], [0, Math.PI / 8, 0]);
    }

    const roofH = 1.95 + t * 0.20;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      buildAtlanteanPillar(root, roofH, M, [Math.cos(a) * 1.18, 0.32, Math.sin(a) * 1.18], 0.11, t === 5);
    }
    cyl(root, 1.38, 1.44, 0.20, 8, M.trimStone, [0, 0.32 + roofH + 0.10, 0], [0, Math.PI / 8, 0]);
    cyl(root, 1.42, 1.42, 0.07, 8, M.accentBand, [0, 0.32 + roofH + 0.22, 0], [0, Math.PI / 8, 0]);

    if (t >= 3) {
      buildCurvedOctagonalDome(root, 1.22, 0.92 + (t - 3) * 0.15, M, [0, 0.32 + roofH + 0.24, 0], t === 5);
    } else {
      cyl(root, 0.85, 1.15, 0.55, 8, M.roofStepped, [0, 0.32 + roofH + 0.52, 0], [0, Math.PI / 8, 0]);
    }

    const pressGroup = grp(root, 0, 1.95, 0);
    cyl(pressGroup, 0.10, 0.10, 1.10, 8, M.gold, [0, 0.35, 0]);
    cyl(pressGroup, 0.42, 0.48, 0.28, 8, M.gold, [0, -0.25, 0], [0, Math.PI / 8, 0]);
    cyl(pressGroup, 0.46, 0.46, 0.06, 8, M.glowMat, [0, -0.38, 0], [0, Math.PI / 8, 0]);
    pressHammers.push({ node: pressGroup, baseY: 1.92 });

    if (t >= 4) {
      buildTitanGuardian(root, godKey, M, rotators, [0, 0.32, rad - 0.28], 0.86);
      buildEnergyBrazier(root, M, flames, [-1.42, 0.32, 1.42], 0.88);
      buildEnergyBrazier(root, M, flames, [1.42, 0.32, 1.42], 0.88);
    }
    if (t === 5) {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
        buildOctagonalTower(root, 0.48, 1.85, M, [Math.cos(a) * (rad - 0.18), 0.32, Math.sin(a) * (rad - 0.18)], true, true);
      }
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.42);
  }

  // 8A. MURALHA CHANFRADA ATLANTE (T1–T5 — segmento de muralha com crescimento estrito T1->T5)
  else if (kind === 'wall') {
    const wallH = 1.45 + (t - 1) * 0.32;
    box(root, 2.86, wallH * 0.45, 0.92, M.trimStone, [0, wallH * 0.225, 0]);
    box(root, 2.74, wallH * 0.55, 0.74, M.wallBright, [0, wallH * 0.45 + wallH * 0.275, 0]);
    box(root, 2.90, 0.10, 0.80, M.accentBand, [0, wallH + 0.04, 0]);

    for (let m = -2; m <= 2; m++) {
      box(root, 0.32, 0.24, 0.22, M.trimStone, [m * 0.54, wallH + 0.20, 0.24]);
      if (t >= 3) {
        box(root, 0.18, 0.14, 0.22, M.gold, [m * 0.54, wallH + 0.38, 0.24]);
      }
    }
    if (t >= 2) {
      box(root, 2.82, 0.08, 0.84, M.gold, [0, wallH * 0.48, 0]);
    }
    if (t >= 4) {
      for (const sx of [-1.26, 1.26]) {
        cyl(root, 0.26, 0.32, wallH + 0.38, 8, M.trimStone, [sx, (wallH + 0.38) * 0.5, 0], [0, Math.PI / 8, 0]);
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), M.glowMat);
        crystal.position.set(sx, wallH + 0.56, 0);
        root.add(crystal);
      }
    }
    if (t === 5) {
      for (const sx of [-1.26, 1.26]) {
        buildCurvedOctagonalDome(root, 0.34, 0.42, M, [sx, wallH + 0.48, 0], true);
      }
    }
    box(root, 0.62, 0.42, 0.06, M.teamBanner, [0, wallH * 0.64, 0.42]);
  }

  // 8B. MURALHA & PORTÃO RÚNICO DESLIZANTE (T1–T5 — crescimento estrito T1->T5)
  else if (kind === 'gate') {
    const wallH = 1.25 + t * 0.28;
    const gateW = 1.62;

    for (const side of [-1, 1]) {
      const wx = side * 1.95;
      box(root, 2.02, wallH * 0.45, 0.78, M.trimStone, [wx, wallH * 0.225, 0]);
      box(root, 2.00, wallH * 0.55, 0.62, M.wallBright, [wx, wallH * 0.45 + wallH * 0.275, 0]);
      box(root, 2.08, 0.09, 0.68, M.accentBand, [wx, wallH + 0.04, 0]);
      for (let m = -2; m <= 2; m++) {
        box(root, 0.26, 0.22, 0.18, M.trimStone, [wx + m * 0.38, wallH + 0.18, 0.22]);
        if (t >= 3) box(root, 0.14, 0.12, 0.18, M.gold, [wx + m * 0.38, wallH + 0.34, 0.22]);
      }
    }

    const twH = wallH + 0.45 + (t >= 4 ? (t - 3) * 0.22 : 0);
    buildOctagonalTower(root, 0.56 + t * 0.03, twH, M, [-1.05, 0, 0], t >= 3, t === 5);
    buildOctagonalTower(root, 0.56 + t * 0.03, twH, M, [1.05, 0, 0], t >= 3, t === 5);

    box(root, 2.38, 0.28, 0.68, M.wallBright, [0, wallH + 0.14, 0]);
    box(root, 2.46, 0.08, 0.74, M.accentBand, [0, wallH + 0.31, 0]);

    const doorH = wallH - 0.06;
    const leafW = gateW * 0.5;
    const doorMat = t >= 3 ? M.gold : M.bronze;

    const leftLeaf = grp(root, -leafW * 0.5, doorH * 0.5, 0.04);
    box(leftLeaf, leafW - 0.02, doorH, 0.12, doorMat, [0, 0, 0]);
    box(leftLeaf, leafW - 0.06, 0.08, 0.15, M.trimStone, [0, doorH * 0.22, 0]);
    const halfRingL = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 16, Math.PI), M.glowMat);
    halfRingL.rotation.z = Math.PI / 2;
    halfRingL.position.set(leafW * 0.5 - 0.02, 0, 0.08);
    leftLeaf.add(halfRingL);

    const rightLeaf = grp(root, leafW * 0.5, doorH * 0.5, 0.04);
    box(rightLeaf, leafW - 0.02, doorH, 0.12, doorMat, [0, 0, 0]);
    box(rightLeaf, leafW - 0.06, 0.08, 0.15, M.trimStone, [0, doorH * 0.22, 0]);
    const halfRingR = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 16, Math.PI), M.glowMat);
    halfRingR.rotation.z = -Math.PI / 2;
    halfRingR.position.set(-leafW * 0.5 + 0.02, 0, 0.08);
    rightLeaf.add(halfRingR);

    slidingGates.push({ left: leftLeaf, right: rightLeaf, baseX: leafW * 0.5, currentSlide: 0 });

    if (t >= 4) {
      buildTitanGuardian(root, godKey, M, rotators, [-1.58, 0, 0.92], 0.86);
      buildTitanGuardian(root, godKey, M, rotators, [1.58, 0, 0.92], 0.86);
    }
    if (t === 5) {
      buildEnergyBrazier(root, M, flames, [-1.05, 0, 1.08], 0.92);
      buildEnergyBrazier(root, M, flames, [1.05, 0, 1.08], 0.92);
      const gateCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), M.glowMat);
      gateCrystal.position.set(0, wallH + 1.05, 0);
      root.add(gateCrystal);
      beaconCrystal = gateCrystal;
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, 2.75);
  }

  // 9. QUARTEL / CASERNA ATLANTE (T2–T5)
  else if (kind === 'barracks') {
    const rad = 2.48 + (t - 2) * 0.22;
    buildOctagonalFoundation(root, rad, 0.30, M, false);

    const bastH = 1.54 + (t - 2) * 0.22;
    const bastR = 1.24 + (t - 2) * 0.10;
    const bastZ = -0.82;
    cyl(root, bastR * 0.96, bastR, bastH, 8, M.wallBright, [0, 0.30 + bastH * 0.5, bastZ], [0, Math.PI / 8, 0]);
    cyl(root, bastR * 1.02, bastR * 0.98, 0.10, 8, M.accentBand, [0, 0.30 + bastH * 0.56, bastZ], [0, Math.PI / 8, 0]);

    const bastFrontZ = bastZ + bastR * Math.cos(Math.PI / 8);
    const portalZ = bastFrontZ + 0.12;
    buildCasernaMonumentalPortal(root, t, M, flames, [0, 0.30, portalZ]);

    const arenaZ = portalZ + 1.28;
    const arena = grp(root, 0, 0.31, arenaZ);
    const arenaRim = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 8, 28), M.trimStone);
    arenaRim.rotation.x = Math.PI / 2;
    arenaRim.position.y = 0.04;
    arena.add(arenaRim);
    cyl(arena, 0.65, 0.65, 0.03, 28, M.wallBase, [0, 0.01, 0]);
    const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.32, 24), M.accentBand);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.03;
    arena.add(innerRing);

    for (const s of [-1, 1]) {
      const rack = grp(root, s * (1.42 + (t - 2) * 0.12), 0.30, portalZ + 0.72);
      rack.rotation.y = s * -0.42;
      box(rack, 0.65, 0.06, 0.18, M.trimStone, [0, 0.03, 0]);
      for (let l = -1; l <= 1; l++) {
        cyl(rack, 0.012, 0.014, 1.12, 6, M.wood, [l * 0.16, 0.56, 0]);
        cyl(rack, 0.004, 0.03, 0.16, 4, M.gold, [l * 0.16, 1.18, 0]);
      }
      buildMurmilloShield(rack, M, [s * 0.42, 0.32, 0.05], [-0.2, 0, 0], 0.88);
    }

    if (t === 2) {
      cyl(root, bastR * 1.06, bastR * 1.02, 0.16, 8, M.trimStone, [0, 0.30 + bastH + 0.08, bastZ], [0, Math.PI / 8, 0]);
      cyl(root, bastR * 1.08, bastR * 1.08, 0.05, 8, M.gold, [0, 0.30 + bastH + 0.18, bastZ], [0, Math.PI / 8, 0]);
    } else {
      buildCurvedOctagonalDome(root, bastR * 1.02, 1.12 + (t - 3) * 0.16, M, [0, 0.30 + bastH, bastZ], t === 5);
    }

    if (t >= 4) {
      for (const s of [-1, 1]) {
        const wing = grp(root, s * (1.68 + (t - 4) * 0.18), 0.30, bastZ + 0.08);
        box(wing, 1.12, 1.58, 1.75, M.wallBase, [0, 0.79, 0]);
        buildSteppedTrapezoidRoof(wing, 1.20, 1.84, 0.65, M, [0, 1.58, 0], true);
      }
      buildTitanGuardian(root, godKey, M, rotators, [-1.58, 0.30, portalZ + 1.05], 0.86);
      buildTitanGuardian(root, godKey, M, rotators, [1.58, 0.30, portalZ + 1.05], 0.86);
    }
    if (t === 5) {
      buildOctagonalTower(root, 0.56, 2.08, M, [-1.96, 0.30, bastZ + 0.95], true, true);
      buildOctagonalTower(root, 0.56, 2.08, M, [1.96, 0.30, bastZ + 0.95], true, true);
      const tCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), M.glowMat);
      tCrystal.position.set(0, 1.48, arenaZ);
      root.add(tCrystal);
      floaters.push({ node: tCrystal, baseY: 1.48, amp: 0.10, speed: 2.3, phase: 0 });
      rotators.push({ node: tCrystal, axis: 'y', speed: 1.5 });
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.42);
  }

  // 10. ESTÁBULOS / PICADEIRO CIRCULAR EM FERRADURA (T2–T5)
  else if (kind === 'stable') {
    const rad = 2.45 + t * 0.16;
    buildOctagonalFoundation(root, rad, 0.28, M, false);

    const track = new THREE.Mesh(new THREE.RingGeometry(0.65, 1.38, 32), M.wallBase);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.295;
    root.add(track);
    cyl(root, 0.48, 0.54, 0.28, 8, M.trimStone, [0, 0.42, 0.18], [0, Math.PI / 8, 0]);
    cyl(root, 0.40, 0.40, 0.06, 8, M.water, [0, 0.56, 0.18], [0, Math.PI / 8, 0]);

    const bayAngles = [-1.85, -1.15, -0.45, 0.45, 1.15, 1.85];
    const bayH = 1.35 + t * 0.12;
    bayAngles.forEach((a) => {
      const br = rad - 0.62;
      const bay = grp(root, Math.sin(a) * br, 0.28, -Math.cos(a) * br);
      bay.rotation.y = -a;
      box(bay, 0.88, bayH, 0.22, M.wallBright, [0, bayH * 0.5, -0.44]);
      box(bay, 0.08, bayH * 0.72, 0.88, M.wood, [-0.42, bayH * 0.36, 0]);
      box(bay, 0.08, bayH * 0.72, 0.88, M.wood, [0.42, bayH * 0.36, 0]);
      box(bay, 0.78, 0.46, 0.06, M.wood, [0, 0.23, 0.42]);
      buildAtlanteanPillar(bay, bayH, M, [-0.40, 0, 0.44], 0.055, t === 5);
      buildAtlanteanPillar(bay, bayH, M, [0.40, 0, 0.44], 0.055, t === 5);
      buildSteppedTrapezoidRoof(bay, 0.96, 1.05, 0.45, M, [0, bayH, 0], false);
      box(bay, 0.52, 0.16, 0.22, M.cropGold, [0, 0.16, -0.22]);
    });

    if (t >= 3) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.055, 8, 24, Math.PI), M.gold);
      arch.position.set(0, 1.15, 1.38);
      root.add(arch);
      buildAtlanteanPillar(root, 1.15, M, [-0.95, 0.28, 1.38], 0.075, t >= 4);
      buildAtlanteanPillar(root, 1.15, M, [0.95, 0.28, 1.38], 0.075, t >= 4);
    }

    if (t >= 4) {
      buildOctagonalTower(root, 0.58, bayH + 0.55, M, [-rad + 0.38, 0.28, 0.78], true, t === 5);
      buildOctagonalTower(root, 0.58, bayH + 0.55, M, [rad - 0.38, 0.28, 0.78], true, t === 5);
      buildEnergyBrazier(root, M, flames, [-1.25, 0.28, 1.72], 0.88);
      buildEnergyBrazier(root, M, flames, [1.25, 0.28, 1.72], 0.88);
    }
    if (t === 5) {
      buildCurvedOctagonalDome(root, 0.82, 0.92, M, [0, 0.28 + bayH + 0.45, -rad + 0.65], true);
      buildTitanGuardian(root, godKey, M, rotators, [0, 0.28, -0.58], 0.84);
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.40);
  }

  // 11. CENTRO DE ARQUEARIA / GALERIA DE PRECISÃO (T2–T5)
  else if (kind === 'archery_range') {
    const rad = 2.40 + t * 0.18;
    buildOctagonalFoundation(root, rad, 0.28, M, false);

    const galH1 = 1.18 + t * 0.10;
    const galH2 = 0.85 + t * 0.08;
    box(root, 2.75, galH1, 1.05, M.wallBright, [0, 0.28 + galH1 * 0.5, -1.12]);
    box(root, 2.90, 0.12, 1.18, M.trimStone, [0, 0.28 + galH1 + 0.06, -1.06]);
    for (const cx of [-1.12, -0.38, 0.38, 1.12]) {
      buildAtlanteanPillar(root, galH2, M, [cx, 0.28 + galH1 + 0.12, -0.62], 0.065, t === 5);
    }
    box(root, 2.55, galH2, 0.36, M.wallBase, [0, 0.28 + galH1 + 0.12 + galH2 * 0.5, -1.42]);
    buildSteppedTrapezoidRoof(root, 2.82, 1.24, 0.62, M, [0, 0.28 + galH1 + 0.12 + galH2, -1.02], t >= 3);

    if (t >= 3) {
      const tb = grp(root, 0, 0.28 + galH1 + 0.12, -0.82);
      cyl(tb, 0.14, 0.18, 0.24, 8, M.trimStone, [0, 0.12, 0]);
      box(tb, 0.12, 0.08, 0.68, M.gold, [0, 0.32, 0.10]);
      box(tb, 0.62, 0.05, 0.06, M.bronze, [0, 0.34, 0.28]);
    }

    const targetAngles = [-0.62, -0.22, 0.22, 0.62];
    targetAngles.forEach((a, idx) => {
      if (t === 2 && idx === 3) return;
      const dist = 1.65;
      const tx = Math.sin(a) * dist;
      const tz = -0.20 + Math.cos(a) * dist;

      box(root, 0.035, 0.02, dist * 0.85, M.gold, [tx * 0.5, 0.30, -0.20 + (tz + 0.20) * 0.5], [0, a, 0]);

      const tg = grp(root, tx, 0.28, tz);
      tg.rotation.y = a + Math.PI;
      cyl(tg, 0.22, 0.26, 0.36, 8, M.trimStone, [0, 0.18, 0], [0, Math.PI / 8, 0]);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.07, 24), M.target);
      disc.rotation.x = Math.PI / 2;
      disc.position.set(0, 0.66, 0);
      tg.add(disc);
      const tRim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 24), M.gold);
      tRim.position.set(0, 0.66, 0.02);
      tg.add(tRim);
      if (t >= 4) {
        const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), M.glowMat);
        prism.position.set(0, 1.08, 0);
        tg.add(prism);
      }
    });

    if (t >= 4) {
      buildOctagonalTower(root, 0.56, galH1 + galH2 + 0.25, M, [-1.72, 0.28, -0.95], true, t === 5);
      buildOctagonalTower(root, 0.56, galH1 + galH2 + 0.25, M, [1.72, 0.28, -0.95], true, t === 5);
      buildTitanGuardian(root, godKey, M, rotators, [-1.52, 0.28, 0.75], 0.86, 'archer');
      buildTitanGuardian(root, godKey, M, rotators, [1.52, 0.28, 0.75], 0.86, 'archer');
    }
    if (t === 5) {
      buildCurvedOctagonalDome(root, 0.78, 0.85, M, [0, 0.28 + galH1 + galH2 + 0.92, -1.02], true);
      buildEnergyBrazier(root, M, flames, [-0.88, 0.28, 1.82], 0.90);
      buildEnergyBrazier(root, M, flames, [0.88, 0.28, 1.82], 0.90);
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, rad + 0.40);
  }

  // 12. CASA DA POPULAÇÃO / MANSÃO ATLANTE (T1–T5)
  else {
    const sc = 0.92 + t * 0.06;
    const hBase = buildOctagonalFoundation(root, 1.55, 0.24, M, true);
    hBase.scale.set(sc * 1.18, 1, sc * 1.18);
    const hCore = cyl(root, 1.08, 1.14, 1.24, 8, M.wallBright, [0, 0.24 + 0.62, 0], [0, Math.PI / 8, 0]);
    hCore.scale.set(sc, 1, sc);
    const hTerrace = cyl(root, 1.18, 1.14, 0.14, 8, M.trimStone, [0, 1.55, 0], [0, Math.PI / 8, 0]);
    hTerrace.scale.set(sc, 1, sc);

    const hFrontFacade = grp(root, 0, 0.24, 1.02 * sc);
    buildOrichalcumPortal(hFrontFacade, 0.68, 0.92, M, [0, 0, 0]);

    if (t >= 2) {
      buildAtlanteanPillar(hFrontFacade, 1.18, M, [-0.62, 0, 0.36], 0.068, t === 5);
      buildAtlanteanPillar(hFrontFacade, 1.18, M, [0.62, 0, 0.36], 0.068, t === 5);
      box(hFrontFacade, 1.52, 0.14, 0.52, M.trimStone, [0, 1.24, 0.24]);
      box(hFrontFacade, 1.58, 0.06, 0.58, M.accentBand, [0, 1.34, 0.24]);
    }

    if (t >= 3) {
      cyl(root, 0.78, 0.84, 0.88, 8, M.wallBright, [0, 2.02, -0.15], [0, Math.PI / 8, 0]);
      if (t === 3 || t === 4) {
        buildCurvedOctagonalDome(root, 0.82, 0.88, M, [0, 2.46, -0.15], false);
      }
    }

    if (t >= 4) {
      for (const s of [-1, 1]) {
        const wing = grp(root, s * 1.48, 0.24, -0.05);
        box(wing, 0.92, 1.15, 1.28, M.wallBase, [0, 0.575, 0]);
        buildSteppedTrapezoidRoof(wing, 1.00, 1.36, 0.48, M, [0, 1.15, 0], false);
        box(root, 0.76, 0.14, 0.54, M.trimStone, [s * 1.48, 0.31, 1.02]);
        box(root, 0.64, 0.04, 0.42, M.water, [s * 1.48, 0.39, 1.02]);
      }
    }

    if (t === 5) {
      buildCurvedOctagonalDome(root, 0.52, 0.56, M, [-1.48, 1.90, -0.05], true);
      buildCurvedOctagonalDome(root, 0.52, 0.56, M, [1.48, 1.90, -0.05], true);
      buildCurvedOctagonalDome(root, 0.86, 0.96, M, [0, 2.46, -0.15], true);
      const hCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.20, 0), M.glowMat);
      hCrystal.position.set(0, 2.06, 1.15);
      root.add(hCrystal);
      floaters.push({ node: hCrystal, baseY: 2.06, amp: 0.09, speed: 2.5, phase: 0 });
      rotators.push({ node: hCrystal, axis: 'y', speed: 1.5 });
      buildEnergyBrazier(root, M, flames, [-0.92, 0.24, 1.62], 0.82);
      buildEnergyBrazier(root, M, flames, [0.92, 0.24, 1.62], 0.82);
    }

    attachActiveAtlanteanGodKit(root, godKey, M, rotators, floaters, 2.18);
  }

  root.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = enableShadows;
      m.receiveShadow = enableShadows;
    }
  });

  return {
    root,
    meta,
    theme,
    effectiveTier: t,
    flames,
    rotators,
    floaters,
    cropClusters,
    gyroscopes,
    slidingGates,
    pressHammers,
    mirrorAssemblies,
    fountainHeads,
    towerFireOriginY,
    beaconCrystal,
    vortexRing,
    metropolisHalo,
    metropolisCrystal,
  };
}
