import * as THREE from 'three';

/* ============================================================================
   ARQUITETURA EGÍPCIA 3D ÉPICA (RÁ, ÍSIS & SET) • T1–T5
   Suite completa das 13 edificações egípcias com texturas procedurais PBR
   (arenito hieroglífico, lajes, linho egípcio listrado, alvo concêntrico e
   mosaico do Nilo), Kits Exclusivos de Santuário Divino por deus (Pilares
   Solares de Rá, Espelhos d'Água com Ankh de Ísis e Obeliscos de Obsidiana em
   Chamas de Set) e animações em tempo real (flâmulas, guindaste, moinho,
   roda hidráulica, plantações ondulantes, vórtice do Titã, óleo fervente e
   portão articulado).
   ============================================================================ */

export type EgyptianArchGodKey = 'ra' | 'isis' | 'set';

export type EgyptianArchBuildingKey =
  | 'siege_works'
  | 'fortress'
  | 'tower'
  | 'farm'
  | 'titan_gate'
  | 'market'
  | 'armory'
  | 'gate'
  | 'wall'
  | 'barracks'
  | 'stable'
  | 'archery_range'
  | 'house';

export interface EgyptianArchTheme {
  id: EgyptianArchGodKey;
  name: string;
  title: string;
  bg: number;
  hemiSky: number;
  hemiGround: number;
  rim: number;
  stone: number;
  bright: number;
  trim: number;
  sec: number;
  gold: number;
  flameHex: number;
  statue: number;
  glow: number;
  vortexOuter: number;
  vortexInner: number;
  linenBase: string;
  linenStripe: string;
  linenTrim: string;
  grass: string;
  dirt: string;
  style: 'solar' | 'lotus' | 'desert';
  subtitle: string;
}

export const EGYPT_ARCH_THEMES: Record<EgyptianArchGodKey, EgyptianArchTheme> = {
  ra: {
    id: 'ra',
    name: 'Rá',
    title: 'de Rá',
    bg: 0x1c1206,
    hemiSky: 0xfef9c3,
    hemiGround: 0x854d0e,
    rim: 0xfacc15,
    stone: 0xe2c998,
    bright: 0xf7e8c4,
    trim: 0x1d4ed8,
    sec: 0xb45309,
    gold: 0xfacc15,
    flameHex: 0xf59e0b,
    statue: 0xdfc082,
    glow: 0xfacc15,
    vortexOuter: 0xfacc15,
    vortexInner: 0x38bdf8,
    linenBase: '#fffbeb',
    linenStripe: '#1e3a8a',
    linenTrim: '#f59e0b',
    grass: '#6a8a2e',
    dirt: '#cfa96e',
    style: 'solar',
    subtitle: 'Esplendor Solar • Cobras Uraeus, Discos Solares e Obeliscos de Ouro',
  },
  isis: {
    id: 'isis',
    name: 'Ísis',
    title: 'de Ísis',
    bg: 0x061922,
    hemiSky: 0xccfbf1,
    hemiGround: 0x0f766e,
    rim: 0x2dd4bf,
    stone: 0xe2ece9,
    bright: 0xf8fafc,
    trim: 0x0d9488,
    sec: 0x1e3a8a,
    gold: 0xfacc15,
    flameHex: 0x2dd4bf,
    statue: 0xd1dce8,
    glow: 0x2dd4bf,
    vortexOuter: 0x2dd4bf,
    vortexInner: 0x3b82f6,
    linenBase: '#f0fdfa',
    linenStripe: '#0f766e',
    linenTrim: '#2dd4bf',
    grass: '#467d46',
    dirt: '#d2bb8e',
    style: 'lotus',
    subtitle: 'Magia do Nilo • Espelhos d’Água de Lótus, Cruz Ankh e Jardins Sagrados',
  },
  set: {
    id: 'set',
    name: 'Set',
    title: 'de Set',
    bg: 0x170805,
    hemiSky: 0xffedd5,
    hemiGround: 0x7c2d12,
    rim: 0xea580c,
    stone: 0xc99a70,
    bright: 0xdab288,
    trim: 0xb91c1c,
    sec: 0x451a03,
    gold: 0xf59e0b,
    flameHex: 0xea580c,
    statue: 0x80766e,
    glow: 0xea580c,
    vortexOuter: 0xea580c,
    vortexInner: 0x9333ea,
    linenBase: '#fef3c7',
    linenStripe: '#7f1d1d',
    linenTrim: '#ea580c',
    grass: '#4c592c',
    dirt: '#ad7e52',
    style: 'desert',
    subtitle: 'Tempestade do Deserto • Obeliscos de Obsidiana em Chamas, Bronze e Escudos de Guerra',
  },
};

export const EGYPT_ARCH_ERA_NAMES: Record<number, string> = {
  1: 'Arcaico',
  2: 'Clássico',
  3: 'Heroico',
  4: 'Mítico',
  5: 'Imperial',
};

export interface EgyptianArchBuildingMeta {
  id: EgyptianArchBuildingKey;
  label: string;
  minTier: 1 | 2 | 3 | 4;
  gameplayScale: number;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  focusTargetY: number;
  focusDist: number;
  overviewDist: number;
  tierDescriptions: Partial<Record<1 | 2 | 3 | 4 | 5, string>>;
}

export const EGYPT_ARCH_BUILDING_META: Record<EgyptianArchBuildingKey, EgyptianArchBuildingMeta> = {
  siege_works: {
    id: 'siege_works',
    label: 'Oficina de Cerco',
    minTier: 3,
    gameplayScale: 0.92,
    markerRadius: 2.95,
    barHeight: 4.5,
    barWidth: 2.8,
    focusTargetY: 1.5,
    focusDist: 5.4,
    overviewDist: 10.4,
    tierDescriptions: {
      3: 'Hangar colunado duplo em arenito hieroglífico, aríete blindado com cabeça de carneiro em ouro, catapulta onagro tensionada e guindaste giratório',
      4: 'Estaleiro de cerco fortificado com pilones, mastros com estandartes ao vento, esfinge guardiã, guindaste dourado e armamentos pesados',
      5: 'Arsenal Imperial de Cerco com pilones colossais, obeliscos hieroglíficos, esfinges gêmeas, guindaste real e guardião divino',
    },
  },
  fortress: {
    id: 'fortress',
    label: 'Fortaleza Migdol / Arsenal Divino',
    minTier: 2,
    gameplayScale: 1.05,
    markerRadius: 3.5,
    barHeight: 5.8,
    barWidth: 3.2,
    focusTargetY: 1.5,
    focusDist: 5.6,
    overviewDist: 10.8,
    tierDescriptions: {
      2: 'Salão hipostilo de armamentos com colunata de lótus, pedestal de relíquia dourada, rastéis de lanças e escudos egípcios',
      3: 'Fortaleza fortificada com pilones laterais, mastros cerimoniais, disco solar alado, rastéis de armas em ouro e braseiros',
      4: 'Fortaleza Mítica com fachada monumental, relíquia flutuante, estátuas guardiãs e ornamentos exclusivos da divindade',
      5: 'Fortaleza Imperial com quatro pilones, colunata dourada, esfinges gêmeas, obeliscos hieroglíficos e coroação celeste',
    },
  },
  tower: {
    id: 'tower',
    label: 'Torre de Vigia',
    minTier: 1,
    gameplayScale: 1.04,
    markerRadius: 1.65,
    barHeight: 5.5,
    barWidth: 1.9,
    focusTargetY: 2.0,
    focusDist: 4.8,
    overviewDist: 9.2,
    tierDescriptions: {
      1: 'Torre de vigia egípcia em arenito e madeira com plataforma elevada, seteiras e pontas de flechas nas quatro faces',
      2: 'Torre clássica talhada com guaritas de flechas salientes, contrafortes e cornija Cavetto',
      3: 'Torre heroica com friso hieroglífico, disco solar alado, braseiro de sinalização no topo e mastros cerimoniais',
      4: 'Torre mítica de defesa ativa: caldeirões de bronze derramando cascatas de óleo fervente nas 4 faces',
      5: 'Torre-Obelisco Imperial com piramídio de ouro maciço, esfinges na base, óleo quente contínuo e aura divina',
    },
  },
  farm: {
    id: 'farm',
    label: 'Fazenda do Nilo',
    minTier: 1,
    gameplayScale: 0.86,
    markerRadius: 2.25,
    barHeight: 3.0,
    barWidth: 2.0,
    focusTargetY: 1.4,
    focusDist: 5.2,
    overviewDist: 9.8,
    tierDescriptions: {
      1: 'Herdade agrícola do Nilo com moinho de vento giratório de 4 velas, canal de irrigação com comporta e ponte, silo cônico e espantalho',
      2: 'Fazenda clássica com canteiros orgânicos de trigo dourado e linho ondulantes ao vento, pérgola sombreada e ânforas',
      3: 'Propriedade próspera com moinho em arenito hieroglífico, palmeiras tamareiras e disco solar no silo',
      4: 'Fazenda Mítica com moinho solar dourado, palmeiral exuberante e estátua guardiã da abundância',
      5: 'Celeiro Imperial do Faraó com moinho monumental em ouro, obelisco agrícola, colheita dourada e braseiros votivos',
    },
  },
  titan_gate: {
    id: 'titan_gate',
    label: 'Portal do Titã',
    minTier: 4,
    gameplayScale: 1.12,
    markerRadius: 4.0,
    barHeight: 7.4,
    barWidth: 3.5,
    focusTargetY: 2.1,
    focusDist: 6.4,
    overviewDist: 12.2,
    tierDescriptions: {
      4: 'Escavação monumental com pilones colossais, mastros cerimoniais, escadaria ritual, esfinges gêmeas e vórtice duplo contra-rotativo',
      5: 'Portal Supremo do Titã com 4 pilones hieroglíficos, obeliscos dourados, estátuas guardiãs e vórtice em máxima potência',
    },
  },
  market: {
    id: 'market',
    label: 'Mercado do Oásis',
    minTier: 2,
    gameplayScale: 0.88,
    markerRadius: 2.8,
    barHeight: 4.15,
    barWidth: 2.65,
    focusTargetY: 1.4,
    focusDist: 5.4,
    overviewDist: 10.2,
    tierDescriptions: {
      2: 'Bazar mercantil do Nilo com barracas listradas de linho, especiarias, ânforas e Balança de Ma’at em ouro',
      3: 'Grande bazar com 4 barracas listradas de linho, sacada colunada com balaustrada dourada e tapete cerimonial',
      4: 'Empório mercantil com pilones laterais, mastros com flâmulas e estátua guardiã central',
      5: 'Mercado Imperial do Faraó com 4 barracas reais, sacada dourada, esfinges na entrada, obeliscos gêmeos e braseiros',
    },
  },
  armory: {
    id: 'armory',
    label: 'Ferreiro & Alto-Forno',
    minTier: 2,
    gameplayScale: 0.9,
    markerRadius: 2.7,
    barHeight: 4.6,
    barWidth: 2.6,
    focusTargetY: 1.4,
    focusDist: 5.3,
    overviewDist: 10.0,
    tierDescriptions: {
      2: 'Oficina metalúrgica com aqueduto elevado movendo roda hidráulica giratória, alto-forno de brasas vivas, fole, bigorna com martelo e cocho',
      3: 'Forja em arenito hieroglífico com clerestório, chaminé-pilone, calha de metal fundido, lingotes de ouro e mastros',
      4: 'Fundição Mítica com pilones monumentais, roda hidráulica dourada, alto-forno incandescente e estátua guardiã',
      5: 'Forja Sagrada Imperial com roda hidráulica dourada, obeliscos hieroglíficos, esfinges protetoras e relíquias forjadas',
    },
  },
  gate: {
    id: 'gate',
    label: 'Muralha & Portão Articulado',
    minTier: 1,
    gameplayScale: 0.78,
    markerRadius: 1.95,
    barHeight: 3.8,
    barWidth: 2.4,
    focusTargetY: 1.4,
    focusDist: 5.2,
    overviewDist: 9.6,
    tierDescriptions: {
      1: 'Paliçada defensiva arcaica com bastiões de pedra talhada e portão duplo articulado em madeira reforçada',
      2: 'Muralha clássica de arenito com ameias egípcias, pilones laterais e portão articulado reforçado',
      3: 'Muralha heroica com pilones flanqueando o portão articulado, passadiço superior, mastros e disco solar alado',
      4: 'Muralha mítica monumental com pilones hieroglíficos, portão articulado dourado e esfinges guardiãs',
      5: 'Muralha Divina Imperial com pilones colossais, obeliscos, esfinges gêmeas, braseiros no topo e portão dourado',
    },
  },
  wall: {
    id: 'wall',
    label: 'Muralha Egípcia',
    minTier: 1,
    gameplayScale: 1.0,
    markerRadius: 1.45,
    barHeight: 3.1,
    barWidth: 1.8,
    focusTargetY: 1.2,
    focusDist: 4.5,
    overviewDist: 8.2,
    tierDescriptions: {
      1: 'Paliçada arcaica de madeira sobre embasamento de arenito',
      2: 'Muralha clássica de arenito hieroglífico com cornija e ameias egípcias',
      3: 'Muralha heroica reforçada com disco solar alado e friso real',
      4: 'Muralha mítica com pilones de canto e revestimento dourado',
      5: 'Muralha Imperial com pilones monumentais e pináculos piramidais de ouro',
    },
  },
  barracks: {
    id: 'barracks',
    label: 'Quartel Egípcio',
    minTier: 2,
    gameplayScale: 0.92,
    markerRadius: 2.75,
    barHeight: 4.35,
    barWidth: 2.6,
    focusTargetY: 1.4,
    focusDist: 5.3,
    overviewDist: 9.9,
    tierDescriptions: {
      2: 'Pátio militar com galeria de colunas lotiformes, toldo de linho listrado, rastéis de lanças e escudos pintados',
      3: 'Quartel fortificado com pilones de guarda, mastros com estandartes ao vento, disco solar alado e braseiro',
      4: 'Quartel Mítico com pilones duplos, colunata imperial, braseiro sagrado, estátua guardiã e esfinge na entrada',
      5: 'Cidadela Militar Imperial com quatro torres-pilone, obeliscos hieroglíficos, esfinges gêmeas e guardiões dourados',
    },
  },
  stable: {
    id: 'stable',
    label: 'Estábulos do Nilo',
    minTier: 2,
    gameplayScale: 0.88,
    markerRadius: 2.8,
    barHeight: 4.15,
    barWidth: 2.65,
    focusTargetY: 1.4,
    focusDist: 5.4,
    overviewDist: 10.1,
    tierDescriptions: {
      2: 'Cocheira real com colunas lotiformes, baias com feno dourado, bebedouro de pedra cristalina e roda de biga',
      3: 'Estábulos heroicos com mezanino superior de feno e biga de guerra egípcia completa estacionada no pátio',
      4: 'Estábulo Mítico com pilones laterais, biga real dourada, disco solar alado, mastros e braseiros',
      5: 'Complexo Imperial de Cavalaria e Bigas com pilones monumentais, obeliscos, guardião e biga faraônica',
    },
  },
  archery_range: {
    id: 'archery_range',
    label: 'Centro de Arquearia',
    minTier: 2,
    gameplayScale: 0.88,
    markerRadius: 2.75,
    barHeight: 4.1,
    barWidth: 2.55,
    focusTargetY: 1.4,
    focusDist: 5.3,
    overviewDist: 10.0,
    tierDescriptions: {
      2: 'Galeria de tiro com colunas de lótus, pilones laterais, toldo listrado, 3 alvos circulares com flechas cravadas e suportes de arcos',
      3: 'Academia de Arquearia com terraço elevado de observação, mastros de vento e 4 alvos egípcios',
      4: 'Complexo Mítico de Arqueiros com alas simétricas, disco solar alado e estátuas guardiãs gêmeas',
      5: 'Santuário Imperial de Arquearia com pilones monumentais, obeliscos hieroglíficos, braseiros e alvos de precisão',
    },
  },
  house: {
    id: 'house',
    label: 'Casa da População',
    minTier: 1,
    gameplayScale: 0.72,
    markerRadius: 1.35,
    barHeight: 2.55,
    barWidth: 1.45,
    focusTargetY: 1.3,
    focusDist: 4.4,
    overviewDist: 7.9,
    tierDescriptions: {
      1: 'Residência egípcia refinada em arenito claro com cornija colorida, pórtico de colunas de lótus, disco solar, escada externa e ânforas',
      2: 'Casa clássica ampliada com jardineiras de lótus, toldo listrado e moldura dourada',
      3: 'Residência nobre de dois pavimentos com varanda colunada, toldo real e terraço panorâmico',
      4: 'Vila egípcia monumental com pátio murado e jardim de palmeiras tamareiras',
      5: 'Palacete Faraônico com pilones de entrada, pináculo piramidal dourado, jardim exuberante e braseiros sagrados',
    },
  },
};

const EGYPT_ARCH_BUILDING_SET = new Set<string>(Object.keys(EGYPT_ARCH_BUILDING_META));

export function isEgyptianArchBuilding(kind: string): kind is EgyptianArchBuildingKey {
  return EGYPT_ARCH_BUILDING_SET.has(kind);
}

export function resolveEgyptianArchGod(majorGod?: string): EgyptianArchGodKey {
  const norm = (majorGod ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  if (norm.includes('isis')) return 'isis';
  if (norm.includes('set') || norm.includes('seth')) return 'set';
  return 'ra';
}

/* ============================================================================
   TEXTURAS PROCEDURAIS PBR EGÍPCIAS (CACHEADAS E SEGURAS PARA SSR/VITEST)
   ============================================================================ */

const texCache = new Map<string, THREE.CanvasTexture>();

function makeCachedTex(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  repeat = false
): THREE.CanvasTexture {
  const existing = texCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  }
  texCache.set(key, tex);
  return tex;
}

function getSandstoneTex(bright: boolean): THREE.CanvasTexture {
  const tex = makeCachedTex(
    bright ? 'egypt_epic_sandstone_bright' : 'egypt_epic_sandstone_base',
    512,
    512,
    (ctx) => {
      ctx.fillStyle = bright ? '#f4e6c8' : '#dfc89a';
      ctx.fillRect(0, 0, 512, 512);

      const rows = 12;
      const rowH = 512 / rows;
      let seed = bright ? 9137 : 4219;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      for (let r = 0; r < rows; r++) {
        const y = r * rowH;
        const cols = 4;
        const colW = 512 / cols;
        const off = r % 2 === 0 ? 0 : colW * 0.5;
        for (let col = -1; col <= cols; col++) {
          const x = col * colW + off;
          const shade = (bright ? 236 : 216) + Math.floor((rand() - 0.5) * 18);
          ctx.fillStyle = `rgba(${shade}, ${shade - 16}, ${shade - 44}, 0.48)`;
          ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);
          ctx.strokeStyle = 'rgba(88, 62, 30, 0.34)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);
        }
        // Faixas sutis de hieróglifos gravados em baixo-relevo
        if (r === 3 || r === 8) {
          ctx.fillStyle = 'rgba(105, 72, 32, 0.24)';
          ctx.fillRect(0, y + 4, 512, 3);
          ctx.fillRect(0, y + rowH - 7, 512, 3);
          for (let gx = 14; gx < 500; gx += 34) {
            ctx.strokeStyle = 'rgba(95, 65, 28, 0.35)';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(gx + 8, y + 16, 4.5, 0, Math.PI * 2);
            ctx.moveTo(gx + 8, y + 21);
            ctx.lineTo(gx + 8, y + 32);
            ctx.moveTo(gx + 3, y + 25);
            ctx.lineTo(gx + 13, y + 25);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(gx + 20, y + 28);
            ctx.lineTo(gx + 25, y + 14);
            ctx.lineTo(gx + 30, y + 28);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < 1600; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,250,235,0.10)' : 'rgba(80,55,25,0.09)';
        ctx.fillRect(rand() * 512, rand() * 512, 3, 3);
      }
    },
    true
  );
  tex.repeat.set(2, 2);
  return tex;
}

function getRoofTilesTex(): THREE.CanvasTexture {
  return makeCachedTex('egypt_epic_roof_tiles', 512, 512, (ctx) => {
    ctx.fillStyle = '#d9c49c';
    ctx.fillRect(0, 0, 512, 512);
    let seed = 7331;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const grid = 8;
    const cell = 512 / grid;
    for (let gx = 0; gx < grid; gx++) {
      for (let gy = 0; gy < grid; gy++) {
        const shade = 208 + Math.floor((rand() - 0.5) * 22);
        ctx.fillStyle = `rgb(${shade}, ${shade - 14}, ${shade - 36})`;
        ctx.fillRect(gx * cell + 3, gy * cell + 3, cell - 6, cell - 6);
        ctx.strokeStyle = 'rgba(75, 58, 35, 0.44)';
        ctx.lineWidth = 3;
        ctx.strokeRect(gx * cell + 1.5, gy * cell + 1.5, cell - 3, cell - 3);
      }
    }
  });
}

function getLinenTex(god: EgyptianArchGodKey): THREE.CanvasTexture {
  const theme = EGYPT_ARCH_THEMES[god];
  return makeCachedTex(
    `egypt_epic_linen_${god}`,
    512,
    256,
    (ctx) => {
      ctx.fillStyle = theme.linenBase;
      ctx.fillRect(0, 0, 512, 256);

      for (let x = 0; x < 512; x += 64) {
        ctx.fillStyle = theme.linenStripe;
        ctx.globalAlpha = 0.16;
        ctx.fillRect(x, 0, 26, 256);
        ctx.globalAlpha = 1.0;
      }
      ctx.fillStyle = 'rgba(120, 80, 20, 0.09)';
      for (let x = 0; x < 512; x += 6) ctx.fillRect(x, 0, 2, 256);

      ctx.fillStyle = theme.linenStripe;
      ctx.fillRect(0, 188, 512, 46);
      ctx.fillStyle = theme.linenTrim;
      ctx.fillRect(0, 182, 512, 6);
      ctx.fillRect(0, 234, 512, 6);

      ctx.fillStyle = theme.linenTrim;
      for (let x = 6; x < 512; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x + 6, 194);
        ctx.lineTo(x + 12, 228);
        ctx.lineTo(x, 228);
        ctx.closePath();
        ctx.fill();
      }
    },
    true
  );
}

function getTargetTex(god: EgyptianArchGodKey): THREE.CanvasTexture {
  const theme = EGYPT_ARCH_THEMES[god];
  return makeCachedTex(`egypt_epic_target_${god}`, 256, 256, (ctx) => {
    const cx = 128;
    const cy = 128;
    const rings = ['#e5c98b', theme.linenStripe, '#f8fafc', theme.linenTrim, '#facc15'];
    const radii = [122, 96, 70, 44, 20];
    rings.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx, cy, radii[i], 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

export function getEgyptianArchGroundTexture(god: EgyptianArchGodKey): THREE.CanvasTexture {
  const theme = EGYPT_ARCH_THEMES[god];
  return makeCachedTex(`egypt_epic_ground_${god}`, 1024, 1024, (ctx) => {
    ctx.fillStyle = theme.grass;
    ctx.fillRect(0, 0, 1024, 1024);

    let seed = god === 'isis' ? 3001 : god === 'set' ? 5003 : 1009;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = 0; i < 4800; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(20, 35, 10, 0.14)';
      ctx.fillRect(rand() * 1024, rand() * 1024, 10, 10);
    }

    const cx = 512;
    const cy = 512;
    const dirtGrad = ctx.createRadialGradient(cx, cy, 190, cx, cy, 420);
    dirtGrad.addColorStop(0, theme.dirt);
    dirtGrad.addColorStop(0.75, theme.dirt);
    dirtGrad.addColorStop(1, 'rgba(200, 167, 114, 0)');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = theme.linenStripe;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, 352, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = theme.linenTrim;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 368, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(145, 125, 96, 0.52)';
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const px = cx + Math.cos(a) * 320 - 18;
      const py = cy + Math.sin(a) * 320 - 14;
      ctx.fillRect(px, py, 36, 28);
    }
  });
}

/* ============================================================================
   TIPOS DE ANIMAÇÃO E RESULTADO DO CONSTRUTOR
   ============================================================================ */

export interface EgyptianFlagRef {
  node: THREE.Object3D;
  phase: number;
}

export interface EgyptianCropRef {
  node: THREE.Object3D;
  phase: number;
}

export interface EgyptianVortexPair {
  outer: THREE.Object3D;
  inner: THREE.Object3D;
  core: THREE.Object3D;
}

export interface EgyptianOilStreamRef {
  stream: THREE.Object3D;
  pool: THREE.Object3D;
  phase: number;
}

export interface EgyptianGatePair {
  leftPivot: THREE.Object3D;
  rightPivot: THREE.Object3D;
  currentAngle: number;
}

export interface EgyptianArchBuildResult {
  root: THREE.Group;
  meta: EgyptianArchBuildingMeta;
  effectiveTier: number;
  flames: THREE.Object3D[];
  furnaceMat: THREE.MeshStandardMaterial;
  flags: EgyptianFlagRef[];
  cranes: THREE.Object3D[];
  windmills: THREE.Object3D[];
  waterwheels: THREE.Object3D[];
  cropClusters: EgyptianCropRef[];
  vortexPairs: EgyptianVortexPair[];
  gates: EgyptianGatePair[];
  oilStreams: EgyptianOilStreamRef[];
  towerFireOriginY?: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

interface EgyptMats {
  stoneBase: THREE.MeshStandardMaterial;
  stoneBright: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  banner: THREE.Material;
  secondary: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  roofTiles: THREE.MeshStandardMaterial;
  linen: THREE.MeshStandardMaterial;
  target: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  obsidian: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  statue: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  cropGold: THREE.MeshStandardMaterial;
  cropGreen: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  oil: THREE.MeshBasicMaterial;
  ember: THREE.MeshStandardMaterial;
  flame: THREE.MeshBasicMaterial;
  vortexOuter: THREE.MeshBasicMaterial;
  vortexInner: THREE.MeshBasicMaterial;
}

interface BuildCtx {
  M: EgyptMats;
  god: EgyptianArchGodKey;
  enableShadows: boolean;
  flames: THREE.Object3D[];
  flags: EgyptianFlagRef[];
  cranes: THREE.Object3D[];
  windmills: THREE.Object3D[];
  waterwheels: THREE.Object3D[];
  cropClusters: EgyptianCropRef[];
  vortexPairs: EgyptianVortexPair[];
  gates: EgyptianGatePair[];
  oilStreams: EgyptianOilStreamRef[];
}

/* ============================================================================
   PRIMITIVAS ARQUITETÔNICAS EGÍPCIAS & ORNAMENTOS CULTURAIS
   ============================================================================ */

function grp(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function box(
  ctx: BuildCtx,
  parent: THREE.Object3D,
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
  if (ctx.enableShadows) {
    m.castShadow = true;
    m.receiveShadow = true;
  }
  parent.add(m);
  return m;
}

function cyl(
  ctx: BuildCtx,
  parent: THREE.Object3D,
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
  if (ctx.enableShadows) {
    m.castShadow = true;
    m.receiveShadow = true;
  }
  parent.add(m);
  return m;
}

function buildPylon(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  wBot: number,
  dBot: number,
  h: number,
  pos: [number, number, number] = [0, 0, 0],
  addVents = true
): THREE.Group {
  const { M } = ctx;
  const p = grp(parent, pos[0], pos[1], pos[2]);
  const wTop = wBot * 0.86;
  const dTop = dBot * 0.86;
  const rxB = wBot * 0.5;
  const rzB = dBot * 0.5;
  const rxT = wTop * 0.5;
  const rzT = dTop * 0.5;

  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    -rxB, 0, rzB, rxB, 0, rzB, rxT, h, rzT,
    -rxB, 0, rzB, rxT, h, rzT, -rxT, h, rzT,
    rxB, 0, -rzB, -rxB, 0, -rzB, -rxT, h, -rzT,
    rxB, 0, -rzB, -rxT, h, -rzT, rxT, h, -rzT,
    -rxB, 0, -rzB, -rxB, 0, rzB, -rxT, h, rzT,
    -rxB, 0, -rzB, -rxT, h, rzT, -rxT, h, -rzT,
    rxB, 0, rzB, rxB, 0, -rzB, rxT, h, -rzT,
    rxB, 0, rzB, rxT, h, -rzT, rxT, h, rzT,
    -rxT, h, rzT, rxT, h, rzT, rxT, h, -rzT,
    -rxT, h, rzT, rxT, h, -rzT, -rxT, h, -rzT,
  ]);
  const uvs = new Float32Array(30 * 2);
  for (let i = 0; i < 30; i++) {
    uvs[i * 2] = (verts[i * 3] + rxB) / wBot;
    uvs[i * 2 + 1] = verts[i * 3 + 1] / h;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();

  const body = new THREE.Mesh(geo, M.stoneBright);
  if (ctx.enableShadows) {
    body.castShadow = true;
    body.receiveShadow = true;
  }
  p.add(body);

  box(ctx, p, wTop + 0.08, 0.06, dTop + 0.08, M.gold, [0, h - 0.01, 0]);
  box(ctx, p, wTop + 0.22, 0.13, dTop + 0.22, M.stoneBright, [0, h + 0.07, 0]);
  box(ctx, p, wTop + 0.28, 0.08, dTop + 0.28, M.trim, [0, h + 0.16, 0]);
  box(ctx, p, wTop + 0.12, 0.05, dTop + 0.12, M.roofTiles, [0, h + 0.22, 0]);

  if (addVents) {
    const count = Math.max(2, Math.floor(wTop / 0.52));
    for (let i = 0; i < count; i++) {
      const vx = -wTop * 0.34 + (count === 1 ? 0 : (i / (count - 1)) * wTop * 0.68);
      box(ctx, p, 0.13, 0.18, 0.06, M.dark, [vx, h - 0.36, rzT + 0.015]);
      box(ctx, p, 0.13, 0.18, 0.06, M.dark, [vx, h - 0.36, -rzT - 0.015]);
    }
  }
  return p;
}

function buildLotusColumn(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  h: number,
  pos: [number, number, number] = [0, 0, 0],
  radius = 0.11,
  isGold = false
): THREE.Group {
  const { M } = ctx;
  const c = grp(parent, pos[0], pos[1], pos[2]);
  const shaftMat = isGold ? M.gold : M.stoneBright;
  cyl(ctx, c, radius * 1.48, radius * 1.6, 0.1, 14, M.stoneBase, [0, 0.05, 0]);
  cyl(ctx, c, radius * 0.9, radius * 1.14, h - 0.32, 14, shaftMat, [0, 0.1 + (h - 0.32) * 0.5, 0]);
  cyl(ctx, c, radius * 1.05, radius * 1.05, 0.05, 14, M.trim, [0, h - 0.24, 0]);
  cyl(ctx, c, radius * 1.08, radius * 1.08, 0.04, 14, M.gold, [0, h - 0.19, 0]);
  cyl(ctx, c, radius * 1.72, radius * 1.02, 0.16, 14, shaftMat, [0, h - 0.09, 0]);
  box(ctx, c, radius * 2.9, 0.07, radius * 2.9, M.stoneBase, [0, h + 0.02, 0]);
  return c;
}

function buildTempleFlagpole(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  h: number,
  pos: [number, number, number] = [0, 0, 0]
): THREE.Group {
  const { M } = ctx;
  const fp = grp(parent, pos[0], pos[1], pos[2]);
  cyl(ctx, fp, 0.024, 0.032, h, 8, M.gold, [0, h * 0.5, 0]);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), M.gold);
  orb.position.set(0, h + 0.04, 0);
  fp.add(orb);
  const pennantPivot = grp(fp, 0, h - 0.14, 0.02);
  box(ctx, pennantPivot, 0.02, 0.58, 0.26, M.banner, [0, -0.22, 0.14]);
  box(ctx, pennantPivot, 0.024, 0.08, 0.28, M.gold, [0, -0.48, 0.14]);
  ctx.flags.push({ node: pennantPivot, phase: pos[0] * 1.7 + pos[2] });
  return fp;
}

function buildWingedSun(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const { M } = ctx;
  const g = grp(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);
  const disk = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), M.gold);
  disk.scale.set(1, 1, 0.45);
  g.add(disk);
  for (const s of [-1, 1]) {
    box(ctx, g, 0.42, 0.09, 0.04, M.gold, [s * 0.28, 0.02, 0], [0, 0, s * 0.08]);
    box(ctx, g, 0.36, 0.04, 0.05, M.trim, [s * 0.26, -0.03, 0.01], [0, 0, s * 0.08]);
    cyl(ctx, g, 0.022, 0.016, 0.14, 8, M.gold, [s * 0.15, -0.06, 0.03], [0, 0, s * -0.22]);
  }
  return g;
}

function buildMiniSphinx(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  scale = 1.0
): THREE.Group {
  const { M } = ctx;
  const sp = grp(parent, pos[0], pos[1], pos[2]);
  sp.rotation.y = rotY;
  sp.scale.setScalar(scale);

  box(ctx, sp, 0.58, 0.22, 1.08, M.stoneBase, [0, 0.11, 0]);
  box(ctx, sp, 0.62, 0.06, 1.12, M.trim, [0, 0.24, 0]);
  box(ctx, sp, 0.38, 0.32, 0.68, M.statue, [0, 0.42, -0.08]);
  box(ctx, sp, 0.11, 0.14, 0.38, M.statue, [-0.14, 0.33, 0.34]);
  box(ctx, sp, 0.11, 0.14, 0.38, M.statue, [0.14, 0.33, 0.34]);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), M.statue);
  head.position.set(0, 0.68, 0.24);
  sp.add(head);
  box(ctx, sp, 0.32, 0.26, 0.24, M.gold, [0, 0.64, 0.19]);
  box(ctx, sp, 0.05, 0.14, 0.04, M.gold, [0, 0.5, 0.33]);
  return sp;
}

function buildObelisk(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  h: number,
  pos: [number, number, number] = [0, 0, 0]
): THREE.Group {
  const { M } = ctx;
  const o = grp(parent, pos[0], pos[1], pos[2]);
  box(ctx, o, 0.46, 0.18, 0.46, M.stoneBase, [0, 0.09, 0]);
  box(ctx, o, 0.5, 0.06, 0.5, M.trim, [0, 0.2, 0]);
  cyl(ctx, o, 0.11, 0.17, h, 4, M.stoneBright, [0, 0.22 + h * 0.5, 0], [0, Math.PI / 4, 0]);
  box(ctx, o, 0.07, h * 0.78, 0.26, M.trim, [0, 0.22 + h * 0.5, 0]);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 4), M.gold);
  tip.position.set(0, 0.22 + h + 0.18, 0);
  tip.rotation.y = Math.PI / 4;
  o.add(tip);
  return o;
}

function buildBrazier(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const { M } = ctx;
  const g = grp(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);
  cyl(ctx, g, 0.14, 0.21, 0.09, 12, M.gold, [0, 0.045, 0]);
  cyl(ctx, g, 0.045, 0.065, 0.44, 10, M.gold, [0, 0.31, 0]);
  cyl(ctx, g, 0.25, 0.13, 0.15, 14, M.gold, [0, 0.58, 0]);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.44, 10), M.flame);
  fl.position.set(0, 0.84, 0);
  g.add(fl);
  ctx.flames.push(fl);
  return g;
}

function buildGuardian(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const { M, god } = ctx;
  const g = grp(parent, pos[0], pos[1], pos[2]);
  g.scale.setScalar(scale);

  box(ctx, g, 0.68, 0.32, 0.68, M.statue, [0, 0.16, 0]);
  box(ctx, g, 0.74, 0.07, 0.74, M.trim, [0, 0.35, 0]);
  box(ctx, g, 0.7, 0.05, 0.7, M.gold, [0, 0.41, 0]);

  const fig = grp(g, 0, 0.44, 0);
  cyl(ctx, fig, 0.07, 0.055, 0.52, 10, M.statue, [-0.09, 0.26, 0.05], [-0.08, 0, 0]);
  cyl(ctx, fig, 0.07, 0.055, 0.52, 10, M.statue, [0.09, 0.26, -0.04], [0.06, 0, 0]);
  cyl(ctx, fig, 0.15, 0.2, 0.34, 12, M.trim, [0, 0.54, 0]);
  box(ctx, fig, 0.36, 0.4, 0.2, M.statue, [0, 0.9, 0]);
  cyl(ctx, fig, 0.18, 0.2, 0.06, 12, M.gold, [0, 1.08, 0]);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), M.statue);
  head.position.set(0, 1.24, 0.02);
  fig.add(head);
  box(ctx, fig, 0.3, 0.25, 0.2, M.gold, [0, 1.16, -0.02]);

  if (god === 'ra') {
    const raCrown = grp(fig, 0, 1.46, 0.02);
    const raDisk = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), M.gold);
    raDisk.scale.set(1, 1, 0.35);
    raCrown.add(raDisk);
  } else if (god === 'isis') {
    const isisHorns = grp(fig, 0, 1.4, 0.02);
    box(ctx, isisHorns, 0.028, 0.24, 0.028, M.gold, [-0.12, 0.1, 0], [0, 0, -0.26]);
    box(ctx, isisHorns, 0.028, 0.24, 0.028, M.gold, [0.12, 0.1, 0], [0, 0, 0.26]);
    const isisOrb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), M.vortexOuter);
    isisOrb.position.set(0, 0.1, 0);
    isisHorns.add(isisOrb);
  } else {
    const setParts = grp(fig, 0, 1.24, 0.02);
    box(ctx, setParts, 0.055, 0.055, 0.24, M.statue, [0, -0.02, 0.13]);
    box(ctx, setParts, 0.032, 0.26, 0.045, M.gold, [-0.065, 0.21, -0.02]);
    box(ctx, setParts, 0.032, 0.26, 0.045, M.gold, [0.065, 0.21, -0.02]);
  }

  cyl(ctx, fig, 0.018, 0.018, 1.65, 8, M.gold, [0.24, 0.86, 0.1], [0.1, 0, 0]);
  return g;
}

function attachGodSanctuaryKit(ctx: BuildCtx, parent: THREE.Object3D, radius = 2.45): void {
  const { M, god } = ctx;
  const wrap = grp(parent, 0, 0, 0);

  if (god === 'ra') {
    for (const s of [-1, 1]) {
      const px = s * radius;
      const pz = radius * 0.62;
      const ped = grp(wrap, px, 0, pz);
      box(ctx, ped, 0.44, 0.22, 0.44, M.stoneBright, [0, 0.11, 0]);
      cyl(ctx, ped, 0.11, 0.15, 0.95, 8, M.stoneBright, [0, 0.68, 0]);
      const sunRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 8, 24), M.gold);
      sunRing.position.set(0, 1.42, 0);
      ped.add(sunRing);
      const sunCore = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), M.ember);
      sunCore.position.set(0, 1.42, 0);
      ped.add(sunCore);
    }
  } else if (god === 'isis') {
    for (const s of [-1, 1]) {
      const px = s * radius;
      const pz = radius * 0.62;
      const pool = grp(wrap, px, 0, pz);
      cyl(ctx, pool, 0.48, 0.54, 0.18, 18, M.stoneBright, [0, 0.09, 0]);
      cyl(ctx, pool, 0.41, 0.41, 0.05, 18, M.water, [0, 0.17, 0]);
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), M.gold);
        petal.position.set(Math.cos(a) * 0.1, 0.22, Math.sin(a) * 0.1);
        petal.rotation.set(0.85, -a, 0);
        pool.add(petal);
      }
      const ankh = grp(pool, 0, 0.88, 0);
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 18), M.vortexOuter);
      loop.position.y = 0.18;
      ankh.add(loop);
      box(ctx, ankh, 0.28, 0.04, 0.04, M.gold, [0, 0.04, 0]);
      box(ctx, ankh, 0.04, 0.26, 0.04, M.gold, [0, -0.06, 0]);
    }
  } else {
    for (const s of [-1, 1]) {
      const px = s * radius;
      const pz = radius * 0.62;
      const ob = grp(wrap, px, 0, pz);
      box(ctx, ob, 0.46, 0.2, 0.46, M.obsidian, [0, 0.1, 0]);
      cyl(ctx, ob, 0.09, 0.18, 1.35, 4, M.obsidian, [0, 0.88, 0], [0, Math.PI / 4, 0]);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 4), M.ember);
      tip.rotation.y = Math.PI / 4;
      tip.position.set(0, 1.66, 0);
      ob.add(tip);
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.36, 8), M.flame);
      fl.position.set(0, 1.92, 0);
      ob.add(fl);
      ctx.flames.push(fl);
    }
  }
}

function buildPalmTree(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  h: number,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0
): THREE.Group {
  const { M } = ctx;
  const p = grp(parent, pos[0], pos[1], pos[2]);
  p.scale.setScalar(scale);
  cyl(ctx, p, 0.07, 0.12, h, 10, M.wood, [0, h * 0.5, 0], [0.05, 0, 0.04]);
  for (let f = 0; f < 7; f++) {
    const a = (f / 7) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.82, 4), M.foliage);
    frond.position.set(Math.cos(a) * 0.3, h + 0.04, Math.sin(a) * 0.3);
    frond.rotation.set(1.05, -a, 0);
    frond.scale.set(1, 1, 0.24);
    if (ctx.enableShadows) frond.castShadow = true;
    p.add(frond);
  }
  return p;
}

function buildChariotWheel(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
): THREE.Group {
  const { M } = ctx;
  const w = grp(parent, pos[0], pos[1], pos[2]);
  w.rotation.set(rot[0], rot[1], rot[2]);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 8, 20), M.wood);
  if (ctx.enableShadows) rim.castShadow = true;
  w.add(rim);
  for (let s = 0; s < 3; s++) {
    box(ctx, w, 0.6, 0.025, 0.025, M.gold, [0, 0, 0], [0, 0, (s / 3) * Math.PI]);
  }
  return w;
}

function buildEgyptianWarChariot(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  isRoyal = false
): THREE.Group {
  const { M } = ctx;
  const ch = grp(parent, pos[0], pos[1], pos[2]);
  ch.rotation.y = rotY;
  const bodyMat = isRoyal ? M.gold : M.trim;
  box(ctx, ch, 0.72, 0.44, 0.52, bodyMat, [0, 0.52, 0]);
  box(ctx, ch, 0.76, 0.06, 0.56, M.gold, [0, 0.75, 0]);
  box(ctx, ch, 0.68, 0.05, 0.5, M.wood, [0, 0.3, 0]);
  cyl(ctx, ch, 0.025, 0.025, 0.96, 8, M.wood, [0, 0.32, 0], [0, 0, Math.PI / 2]);
  buildChariotWheel(ctx, ch, [-0.46, 0.32, 0], [0, Math.PI / 2, 0]);
  buildChariotWheel(ctx, ch, [0.46, 0.32, 0], [0, Math.PI / 2, 0]);
  cyl(ctx, ch, 0.022, 0.028, 1.15, 8, M.wood, [0, 0.38, 0.72], [Math.PI / 2 - 0.14, 0, 0]);
  box(ctx, ch, 0.58, 0.03, 0.04, M.gold, [0, 0.46, 1.24]);
  cyl(ctx, ch, 0.06, 0.05, 0.38, 8, M.secondary, [0.38, 0.56, 0.12], [0.22, 0, -0.18]);
  return ch;
}

function buildWeaponRack(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  goldenWeapons = false
): THREE.Group {
  const { M } = ctx;
  const r = grp(parent, pos[0], pos[1], pos[2]);
  r.rotation.y = rotY;
  box(ctx, r, 0.9, 0.06, 0.24, M.wood, [0, 0.03, 0]);
  box(ctx, r, 0.06, 0.75, 0.06, M.wood, [-0.38, 0.38, 0]);
  box(ctx, r, 0.06, 0.75, 0.06, M.wood, [0.38, 0.38, 0]);
  box(ctx, r, 0.92, 0.06, 0.06, M.wood, [0, 0.74, 0]);
  const shaftMat = goldenWeapons ? M.gold : M.wood;
  for (let i = -2; i <= 2; i++) {
    cyl(ctx, r, 0.012, 0.014, 1.15, 8, shaftMat, [i * 0.14, 0.58, 0.05], [-0.14, 0, 0]);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 4), M.gold);
    tip.position.set(i * 0.14, 1.18, -0.03);
    tip.rotation.x = -0.14;
    r.add(tip);
  }
  const shield = grp(r, 0.56, 0.38, 0.08);
  shield.rotation.x = -0.22;
  box(ctx, shield, 0.34, 0.52, 0.03, goldenWeapons ? M.gold : M.trim, [0, 0, 0]);
  cyl(ctx, shield, 0.17, 0.17, 0.03, 14, goldenWeapons ? M.gold : M.trim, [0, 0.26, 0], [Math.PI / 2, 0, 0]);
  box(ctx, shield, 0.06, 0.58, 0.045, M.trim, [0, 0.08, 0.01]);
  return r;
}

function buildArcheryTarget(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  pos: [number, number, number] = [0, 0, 0],
  rotY = 0,
  scale = 1.0
): THREE.Group {
  const { M } = ctx;
  const t = grp(parent, pos[0], pos[1], pos[2]);
  t.rotation.y = rotY;
  t.scale.setScalar(scale);
  box(ctx, t, 0.06, 0.85, 0.06, M.wood, [-0.18, 0.4, -0.1], [0.22, 0, 0]);
  box(ctx, t, 0.06, 0.85, 0.06, M.wood, [0.18, 0.4, -0.1], [0.22, 0, 0]);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.08, 24), M.target);
  disc.rotation.set(Math.PI / 2 - 0.18, 0, 0);
  disc.position.set(0, 0.58, 0.04);
  if (ctx.enableShadows) disc.castShadow = true;
  t.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.025, 8, 24), M.gold);
  rim.rotation.x = -0.18;
  rim.position.set(0, 0.58, 0.08);
  t.add(rim);
  cyl(ctx, t, 0.008, 0.008, 0.28, 6, M.gold, [0.02, 0.6, 0.18], [Math.PI / 2 - 0.12, 0.06, 0]);
  cyl(ctx, t, 0.008, 0.008, 0.26, 6, M.gold, [-0.05, 0.54, 0.17], [Math.PI / 2 - 0.16, -0.08, 0]);
  return t;
}

function buildWatchTower(
  ctx: BuildCtx,
  parent: THREE.Object3D,
  h: number,
  pos: [number, number, number] = [0, 0, 0],
  scale = 1.0,
  tier = 3
): THREE.Group {
  const { M } = ctx;
  const tw = grp(parent, pos[0], pos[1], pos[2]);
  tw.scale.setScalar(scale);

  box(ctx, tw, 1.5, 0.24, 1.5, M.secondary, [0, 0.12, 0]);
  box(ctx, tw, 1.32, 0.16, 1.32, M.stoneBase, [0, 0.32, 0]);
  buildPylon(ctx, tw, 1.16, 1.16, h, [0, 0.4, 0], tier >= 2);

  if (tier >= 2) {
    // Contrafortes angulares talhados da Torre Clássica+
    for (const sx of [-0.58, 0.58]) {
      for (const sz of [-0.58, 0.58]) {
        box(ctx, tw, 0.18, h * 0.45, 0.18, M.stoneBase, [sx, 0.4 + h * 0.22, sz]);
      }
    }
  }

  if (tier >= 3) {
    box(ctx, tw, 1.16, 0.09, 1.16, M.trim, [0, 0.4 + h * 0.52, 0]);
    buildWingedSun(ctx, tw, [0, 0.4 + h * 0.52, 0.6], 0.88);
  }

  const yBox = 0.4 + h + 0.18;
  const distOut = 0.58;
  const faces: Array<{ pos: [number, number, number]; rotY: number }> = [
    { pos: [0, yBox, distOut], rotY: 0 },
    { pos: [0, yBox, -distOut], rotY: Math.PI },
    { pos: [distOut, yBox, 0], rotY: Math.PI / 2 },
    { pos: [-distOut, yBox, 0], rotY: -Math.PI / 2 },
  ];

  faces.forEach((f, idx) => {
    const ho = grp(tw, f.pos[0], f.pos[1], f.pos[2]);
    ho.rotation.y = f.rotY;
    box(ctx, ho, 0.74, 0.48, 0.26, M.stoneBright, [0, 0, 0]);
    box(ctx, ho, 0.78, 0.08, 0.3, M.trim, [0, 0.27, 0]);
    for (const sx of [-0.2, 0, 0.2]) {
      box(ctx, ho, 0.045, 0.26, 0.05, M.dark, [sx, 0.03, 0.12]);
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.16, 4), M.gold);
      arrow.rotation.x = Math.PI / 2;
      arrow.position.set(sx, 0.03, 0.19);
      ho.add(arrow);
    }

    if (tier >= 4) {
      const cauldron = grp(ho, 0, -0.14, 0.16);
      cyl(ctx, cauldron, 0.17, 0.11, 0.15, 12, M.gold, [0, 0, 0], [0.42, 0, 0]);
      const streamH = yBox - 0.26;
      const stream = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.12, streamH, 10, 1, true),
        M.oil
      );
      stream.position.set(0, -streamH * 0.5 - 0.04, 0.08);
      cauldron.add(stream);
      const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.04, 14), M.ember);
      pool.position.set(0, -streamH - 0.03, 0.08);
      cauldron.add(pool);
      ctx.oilStreams.push({ stream, pool, phase: idx * 1.5 });
    }
  });

  if (tier >= 3 && tier < 5) {
    buildBrazier(ctx, tw, [0, yBox + 0.3, 0], 0.88);
  }
  if (tier === 5) {
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.6, 4), M.gold);
    cap.rotation.y = Math.PI / 4;
    cap.position.set(0, yBox + 0.58, 0);
    tw.add(cap);
  }
  return tw;
}

/* ============================================================================
   CONSTRUTOR PRINCIPAL DAS 13 EDIFICAÇÕES EGÍPCIAS (T1–T5)
   ============================================================================ */

export function buildEgyptianArchBuilding(
  buildingKey: EgyptianArchBuildingKey,
  god: EgyptianArchGodKey,
  age: number,
  enableShadows: boolean,
  teamBannerMat?: THREE.Material
): EgyptianArchBuildResult {
  const theme = EGYPT_ARCH_THEMES[god];
  const meta = EGYPT_ARCH_BUILDING_META[buildingKey];
  const t = Math.max(meta.minTier, Math.min(5, Math.round(age || 1)));

  const M: EgyptMats = {
    stoneBase: new THREE.MeshStandardMaterial({
      map: getSandstoneTex(false),
      color: theme.stone,
      roughness: 0.66,
    }),
    stoneBright: new THREE.MeshStandardMaterial({
      map: getSandstoneTex(true),
      color: theme.bright,
      roughness: 0.5,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: theme.trim,
      roughness: 0.36,
      metalness: 0.34,
    }),
    banner:
      teamBannerMat ??
      new THREE.MeshStandardMaterial({
        color: theme.trim,
        roughness: 0.42,
        metalness: 0.25,
      }),
    secondary: new THREE.MeshStandardMaterial({
      color: theme.sec,
      roughness: 0.48,
      metalness: 0.24,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: theme.gold,
      emissive: 0x3b2200,
      emissiveIntensity: 0.26,
      metalness: 0.92,
      roughness: 0.18,
    }),
    roofTiles: new THREE.MeshStandardMaterial({
      map: getRoofTilesTex(),
      roughness: 0.6,
    }),
    linen: new THREE.MeshStandardMaterial({
      map: getLinenTex(god),
      roughness: 0.56,
      side: THREE.DoubleSide,
    }),
    target: new THREE.MeshStandardMaterial({
      map: getTargetTex(god),
      roughness: 0.54,
    }),
    wood: new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.66 }),
    obsidian: new THREE.MeshStandardMaterial({ color: 0x16121a, metalness: 0.45, roughness: 0.25 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a140e, roughness: 0.92 }),
    statue: new THREE.MeshStandardMaterial({
      color: theme.statue,
      roughness: 0.42,
      metalness: 0.24,
    }),
    foliage: new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.76 }),
    cropGold: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.64 }),
    cropGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.38,
      roughness: 0.1,
    }),
    oil: new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
    ember: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: theme.flameHex,
      emissiveIntensity: 3.5,
      roughness: 0.18,
    }),
    flame: new THREE.MeshBasicMaterial({
      color: theme.flameHex,
      transparent: true,
      opacity: 0.92,
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
  };

  const root = new THREE.Group();
  const ctx: BuildCtx = {
    M,
    god,
    enableShadows,
    flames: [],
    flags: [],
    cranes: [],
    windmills: [],
    waterwheels: [],
    cropClusters: [],
    vortexPairs: [],
    gates: [],
    oilStreams: [],
  };

  let towerFireOriginY: number | undefined;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  // ==========================================================================
  // 1. OFICINA DE CERCO (T3–T5)
  // ==========================================================================
  if (buildingKey === 'siege_works') {
    const bw = 4.2 + (t - 2) * 0.34;
    const bd = 3.8 + (t - 2) * 0.3;
    box(ctx, root, bw, 0.2, bd, M.secondary, [0, 0.1, 0]);
    box(ctx, root, bw - 0.18, 0.12, bd - 0.18, M.stoneBase, [0, 0.26, 0]);
    box(ctx, root, bw - 0.42, 0.04, bd - 0.42, M.roofTiles, [0, 0.34, 0]);

    const hangW = 3.45 + (t - 3) * 0.26;
    const hangH = 1.75 + (t - 3) * 0.18;
    const hangZ = -0.78;
    box(ctx, root, hangW, hangH, 0.28, M.stoneBright, [0, 0.32 + hangH * 0.5, hangZ - 0.78]);
    for (const s of [-1, 1]) {
      box(ctx, root, 0.28, hangH, 1.56, M.stoneBright, [s * (hangW * 0.5 - 0.14), 0.32 + hangH * 0.5, hangZ]);
    }
    for (const cx of [-hangW * 0.42, 0, hangW * 0.42]) {
      buildLotusColumn(ctx, root, hangH, [cx, 0.32, hangZ + 0.76], 0.095, t === 5);
    }
    box(ctx, root, hangW + 0.26, 0.16, 1.78, M.stoneBright, [0, 0.32 + hangH + 0.08, hangZ]);
    box(ctx, root, hangW + 0.34, 0.1, 1.86, M.trim, [0, 0.32 + hangH + 0.2, hangZ]);
    box(ctx, root, hangW + 0.14, 0.06, 1.66, M.roofTiles, [0, 0.32 + hangH + 0.28, hangZ]);
    buildWingedSun(ctx, root, [0, 0.32 + hangH + 0.08, hangZ + 0.92], 1.12);

    // Baia Esquerda: Aríete Blindado Egípcio
    const ram = grp(root, -0.88, 0.32, 0.28);
    box(ctx, ram, 0.78, 0.66, 1.24, M.wood, [0, 0.56, 0]);
    box(ctx, ram, 0.86, 0.14, 1.32, M.trim, [0, 0.92, 0]);
    box(ctx, ram, 0.72, 0.08, 1.28, M.gold, [0, 1.0, 0]);
    cyl(ctx, ram, 0.12, 0.14, 1.65, 12, M.wood, [0, 0.48, 0.18], [Math.PI / 2, 0, 0]);
    const ramHead = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.36, 8), M.gold);
    ramHead.rotation.x = Math.PI / 2;
    ramHead.position.set(0, 0.48, 1.08);
    ram.add(ramHead);
    for (const sx of [-0.44, 0.44]) {
      for (const sz of [-0.38, 0.38]) {
        buildChariotWheel(ctx, ram, [sx, 0.3, sz], [0, Math.PI / 2, 0]);
      }
    }

    // Baia Direita: Catapulta Onagro Tensionada
    const cata = grp(root, 0.88, 0.32, 0.26);
    box(ctx, cata, 0.78, 0.16, 1.18, M.wood, [0, 0.32, 0]);
    box(ctx, cata, 0.1, 0.62, 0.14, M.wood, [-0.34, 0.66, -0.1]);
    box(ctx, cata, 0.1, 0.62, 0.14, M.wood, [0.34, 0.66, -0.1]);
    box(ctx, cata, 0.8, 0.12, 0.14, M.gold, [0, 0.94, -0.1]);
    const arm = grp(cata, 0, 0.42, 0.28);
    arm.rotation.x = -0.68;
    box(ctx, arm, 0.1, 1.05, 0.1, M.wood, [0, 0.46, 0]);
    cyl(ctx, arm, 0.16, 0.1, 0.12, 10, M.gold, [0, 0.98, 0.06]);
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), M.stoneBase);
    boulder.position.set(0, 1.08, 0.06);
    arm.add(boulder);
    for (const sx of [-0.44, 0.44]) {
      for (const sz of [-0.36, 0.36]) {
        buildChariotWheel(ctx, cata, [sx, 0.28, sz], [0, Math.PI / 2, 0]);
      }
    }

    // Guindaste Giratório com Bloco Hieroglífico
    const craneBase = grp(root, 1.72, 0.32, 1.25);
    cyl(ctx, craneBase, 0.24, 0.3, 0.38, 12, M.stoneBright, [0, 0.19, 0]);
    const cranePivot = grp(craneBase, 0, 0.38, 0);
    cyl(ctx, cranePivot, 0.08, 0.1, 2.05, 10, t >= 4 ? M.gold : M.wood, [0, 1.02, 0]);
    box(ctx, cranePivot, 0.1, 0.1, 1.65, M.wood, [0, 1.92, -0.52], [-0.28, 0, 0]);
    box(ctx, cranePivot, 0.28, 0.24, 0.3, M.stoneBase, [0, 1.68, 0.22]);
    cyl(ctx, cranePivot, 0.014, 0.014, 0.85, 6, M.gold, [0, 1.68, -1.24]);
    box(ctx, cranePivot, 0.42, 0.38, 0.42, M.stoneBright, [0, 1.18, -1.24]);
    box(ctx, cranePivot, 0.45, 0.06, 0.45, M.trim, [0, 1.18, -1.24]);
    ctx.cranes.push(cranePivot);

    // Munição
    const ammo = grp(root, -1.62, 0.32, 1.28);
    const ammoCoords: Array<[number, number, number]> = [
      [0, 0.14, 0],
      [0.28, 0.14, 0.04],
      [0.14, 0.14, 0.26],
      [0.14, 0.36, 0.1],
    ];
    ammoCoords.forEach(([ax, ay, az]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), M.stoneBase);
      rock.position.set(ax, ay, az);
      if (enableShadows) rock.castShadow = true;
      ammo.add(rock);
    });

    if (t >= 4) {
      buildPylon(ctx, root, 0.96, 0.92, hangH + 0.72, [-hangW * 0.56, 0.32, hangZ - 0.1], true);
      buildPylon(ctx, root, 0.96, 0.92, hangH + 0.72, [hangW * 0.56, 0.32, hangZ - 0.1], true);
      buildTempleFlagpole(ctx, root, hangH + 1.25, [-hangW * 0.56, 0.32, hangZ + 0.48]);
      buildTempleFlagpole(ctx, root, hangH + 1.25, [hangW * 0.56, 0.32, hangZ + 0.48]);
      buildMiniSphinx(ctx, root, [-1.45, 0.32, 1.68], 0.16, 0.82);
      buildBrazier(ctx, root, [0, 0.32, 1.72], 0.95);
    }
    if (t === 5) {
      buildObelisk(ctx, root, 2.1, [-2.25, 0.32, 1.72]);
      buildObelisk(ctx, root, 2.1, [2.25, 0.32, 1.72]);
      buildMiniSphinx(ctx, root, [1.45, 0.32, 1.68], -0.16, 0.82);
      buildGuardian(ctx, root, [0, 0.32 + hangH + 0.3, hangZ], 0.85);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 2. FORTALEZA MIGDOL / ARSENAL DIVINO (T2–T5)
  // ==========================================================================
  else if (buildingKey === 'fortress') {
    const bw = 3.8 + t * 0.34;
    const bd = 3.4 + t * 0.3;
    box(ctx, root, bw, 0.2, bd, M.secondary, [0, 0.1, 0]);
    box(ctx, root, bw - 0.16, 0.12, bd - 0.16, M.stoneBase, [0, 0.26, 0]);
    box(ctx, root, 1.5, 0.1, 0.3, M.stoneBright, [0, 0.05, bd * 0.5 + 0.08]);

    const hallW = 2.85 + t * 0.26;
    const hallH = 1.55 + t * 0.18;
    box(ctx, root, hallW, hallH, 1.55, M.stoneBright, [0, 0.32 + hallH * 0.5, -0.58]);
    box(ctx, root, hallW + 0.24, 0.12, 1.78, M.trim, [0, 0.32 + hallH + 0.06, -0.58]);
    box(ctx, root, hallW + 0.12, 0.06, 1.66, M.roofTiles, [0, 0.32 + hallH + 0.15, -0.58]);

    const colCount = t >= 4 ? 6 : 4;
    for (let i = 0; i < colCount; i++) {
      const cx = -hallW * 0.44 + (i / (colCount - 1)) * (hallW * 0.88);
      buildLotusColumn(ctx, root, hallH, [cx, 0.32, 0.45], 0.088, t >= 4);
    }
    box(ctx, root, hallW + 0.18, 0.14, 0.46, M.stoneBright, [0, 0.32 + hallH + 0.05, 0.45]);
    box(ctx, root, hallW + 0.24, 0.08, 0.52, M.trim, [0, 0.32 + hallH + 0.15, 0.45]);
    buildWingedSun(ctx, root, [0, 0.32 + hallH + 0.06, 0.72], 1.05 + t * 0.04);

    // Pedestal Central de Relíquia Sagrada
    const relicPed = grp(root, 0, 0.32, 0.92);
    box(ctx, relicPed, 0.66, 0.42, 0.66, M.stoneBright, [0, 0.21, 0]);
    box(ctx, relicPed, 0.72, 0.08, 0.72, M.gold, [0, 0.46, 0]);
    const relicOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), M.gold);
    relicOrb.position.set(0, 0.86, 0);
    relicPed.add(relicOrb);
    const relicRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 24), M.vortexOuter);
    relicRing.position.set(0, 0.86, 0);
    relicPed.add(relicRing);
    beaconCrystal = relicOrb;
    vortexRing = relicRing;

    buildWeaponRack(ctx, root, [-1.18, 0.32, 1.08], 0.24, true);
    buildWeaponRack(ctx, root, [1.18, 0.32, 1.08], -0.24, true);

    if (t >= 3) {
      buildPylon(ctx, root, 0.92, 0.9, hallH + 0.58, [-hallW * 0.55, 0.32, -0.45], true);
      buildPylon(ctx, root, 0.92, 0.9, hallH + 0.58, [hallW * 0.55, 0.32, -0.45], true);
      buildTempleFlagpole(ctx, root, hallH + 1.15, [-hallW * 0.55, 0.32, 0.12]);
      buildTempleFlagpole(ctx, root, hallH + 1.15, [hallW * 0.55, 0.32, 0.12]);
      buildBrazier(ctx, root, [-0.62, 0.32, 1.48], 0.9);
      buildBrazier(ctx, root, [0.62, 0.32, 1.48], 0.9);
    }
    if (t >= 4) {
      buildGuardian(ctx, root, [-1.62, 0.32, 1.25], 0.92);
      buildGuardian(ctx, root, [1.62, 0.32, 1.25], 0.92);
    }
    if (t === 5) {
      buildPylon(ctx, root, 0.9, 0.88, hallH + 0.7, [-hallW * 0.55, 0.32, 0.88], true);
      buildPylon(ctx, root, 0.9, 0.88, hallH + 0.7, [hallW * 0.55, 0.32, 0.88], true);
      buildObelisk(ctx, root, 2.05, [-2.22, 0.32, 1.65]);
      buildObelisk(ctx, root, 2.05, [2.22, 0.32, 1.65]);
      buildMiniSphinx(ctx, root, [-1.05, 0.32, 1.75], 0.14, 0.84);
      buildMiniSphinx(ctx, root, [1.05, 0.32, 1.75], -0.14, 0.84);

      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 8, 28), M.gold);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(0, 0.32 + hallH + 1.05, -0.58);
      root.add(halo);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), M.ember);
      crystal.position.set(0, 0.32 + hallH + 1.42, -0.58);
      root.add(crystal);
      metropolisHalo = halo;
      metropolisCrystal = crystal;
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 3. TORRE DE VIGIA ÚNICA (T1–T5) — FLECHAS DE FOGO & ÓLEO QUENTE (T4+)
  // ==========================================================================
  else if (buildingKey === 'tower') {
    const twH = 1.65 + t * 0.42;
    const twScale = 0.95 + t * 0.06;
    buildWatchTower(ctx, root, twH, [0, 0, 0], twScale, t);
    towerFireOriginY = (0.4 + twH + 0.18) * twScale;

    if (t >= 3) {
      buildTempleFlagpole(ctx, root, twH * twScale + 0.85, [-0.95, 0, 0.95]);
      buildTempleFlagpole(ctx, root, twH * twScale + 0.85, [0.95, 0, 0.95]);
    }
    if (t === 5) {
      buildMiniSphinx(ctx, root, [-1.18, 0, 1.25], 0.25, 0.84);
      buildMiniSphinx(ctx, root, [1.18, 0, 1.25], -0.25, 0.84);
      buildObelisk(ctx, root, 1.85, [-1.68, 0, -1.35]);
      buildObelisk(ctx, root, 1.85, [1.68, 0, -1.35]);

      const crownY = (0.4 + twH + 1.25) * twScale;
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.055, 8, 24), M.gold);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(0, crownY, 0);
      root.add(halo);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), M.ember);
      crystal.position.set(0, crownY + 0.34, 0);
      root.add(crystal);
      metropolisHalo = halo;
      metropolisCrystal = crystal;
    }
    attachGodSanctuaryKit(ctx, root, 2.2);
  }

  // ==========================================================================
  // 4. FAZENDA DO NILO (T1–T5) — MOINHO, CANAL, SILO, PÉRGOLA & COLHEITA
  // ==========================================================================
  else if (buildingKey === 'farm') {
    const bw = 4.4 + t * 0.24;
    const bd = 4.2 + t * 0.22;
    box(ctx, root, bw, 0.14, bd, M.secondary, [0, 0.07, 0]);
    box(ctx, root, bw - 0.18, 0.08, bd - 0.18, M.stoneBase, [0, 0.18, 0]);

    // Canal de irrigação com ponte e comporta
    box(ctx, root, 0.78, 0.22, bd - 0.36, M.stoneBright, [-0.15, 0.22, 0]);
    box(ctx, root, 0.56, 0.08, bd - 0.42, M.water, [-0.15, 0.31, 0]);
    box(ctx, root, 1.05, 0.1, 0.72, M.wood, [-0.15, 0.38, 0.52]);
    box(ctx, root, 1.05, 0.18, 0.06, M.gold, [-0.15, 0.48, 0.85]);
    box(ctx, root, 1.05, 0.18, 0.06, M.gold, [-0.15, 0.48, 0.19]);
    box(ctx, root, 0.08, 0.65, 0.08, M.wood, [-0.52, 0.56, -0.78]);
    box(ctx, root, 0.08, 0.65, 0.08, M.wood, [0.22, 0.56, -0.78]);
    box(ctx, root, 0.82, 0.08, 0.08, M.gold, [-0.15, 0.86, -0.78]);
    box(ctx, root, 0.54, 0.34, 0.05, M.wood, [-0.15, 0.46, -0.78]);

    // Moinho de vento giratório de 4 velas em linho egípcio
    const millX = -1.38;
    const millZ = -1.12;
    const millH = 1.68 + t * 0.22;
    const millGrp = grp(root, millX, 0.22, millZ);
    cyl(ctx, millGrp, 0.44, 0.64, millH, 12, t >= 4 ? M.stoneBright : M.stoneBase, [0, millH * 0.5, 0]);
    cyl(ctx, millGrp, 0.48, 0.48, 0.1, 12, M.trim, [0, millH + 0.04, 0]);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.48, 12), t >= 4 ? M.gold : M.linen);
    cap.position.set(0, millH + 0.32, 0);
    millGrp.add(cap);
    const sailHub = grp(millGrp, 0, millH - 0.14, 0.5);
    cyl(ctx, sailHub, 0.09, 0.09, 0.2, 10, M.gold, [0, 0, 0], [Math.PI / 2, 0, 0]);
    for (let s = 0; s < 4; s++) {
      const blade = grp(sailHub, 0, 0, 0);
      blade.rotation.z = (s / 4) * Math.PI * 2;
      box(ctx, blade, 0.06, 1.28, 0.04, M.wood, [0, 0.64, 0]);
      box(ctx, blade, 0.36, 0.96, 0.02, M.linen, [0.18, 0.72, 0.02]);
    }
    ctx.windmills.push(sailHub);

    // Silo Cônico
    const silo = grp(root, 1.22, 0.22, -1.18);
    const sH = 1.15 + t * 0.14;
    cyl(ctx, silo, 0.46, 0.56, sH, 16, M.stoneBright, [0, sH * 0.5, 0]);
    cyl(ctx, silo, 0.52, 0.52, 0.08, 16, M.trim, [0, sH * 0.85, 0]);
    const sDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      t >= 4 ? M.gold : M.stoneBase
    );
    sDome.position.set(0, sH, 0);
    silo.add(sDome);
    if (t >= 3) buildWingedSun(ctx, silo, [0, sH * 0.65, 0.54], 0.72);

    // Pérgola sombreada
    const perg = grp(root, 1.22, 0.22, 0.18);
    for (const px of [-0.46, 0.46]) {
      for (const pz of [-0.36, 0.36]) buildLotusColumn(ctx, perg, 1.08, [px, 0, pz], 0.055);
    }
    box(ctx, perg, 1.15, 0.06, 0.95, M.linen, [0, 1.12, 0], [0.1, 0, 0]);
    cyl(ctx, perg, 0.16, 0.19, 0.34, 10, M.cropGold, [-0.22, 0.17, 0.08]);
    cyl(ctx, perg, 0.15, 0.18, 0.3, 10, M.cropGold, [0.08, 0.15, 0.14]);
    cyl(ctx, perg, 0.1, 0.07, 0.36, 10, M.secondary, [0.34, 0.18, -0.06]);

    // Canteiros orgânicos ondulantes ao vento
    const beds = [
      { cx: -1.35, cz: 0.78, mat: M.cropGold },
      { cx: 1.15, cz: 1.32, mat: M.cropGreen },
      { cx: -1.35, cz: 1.56, mat: M.cropGreen },
    ];
    beds.forEach((b, bi) => {
      box(ctx, root, 1.48, 0.1, 0.68, M.secondary, [b.cx, 0.25, b.cz]);
      for (let r = -2; r <= 2; r++) {
        for (let c = -1; c <= 1; c++) {
          const stalkPivot = grp(root, b.cx + r * 0.26, 0.3, b.cz + c * 0.2);
          const hStalk = 0.36 + ((r + c + bi + 6) % 3) * 0.06;
          cyl(ctx, stalkPivot, 0.015, 0.032, hStalk, 6, b.mat, [0, hStalk * 0.5, 0]);
          const headMesh = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 5), b.mat);
          headMesh.position.y = hStalk + 0.05;
          stalkPivot.add(headMesh);
          ctx.cropClusters.push({ node: stalkPivot, phase: r * 0.7 + c * 1.1 + bi });
        }
      }
    });

    // Espantalho egípcio
    const scare = grp(root, -0.92, 0.22, 0.96);
    cyl(ctx, scare, 0.025, 0.03, 0.95, 8, M.wood, [0, 0.47, 0]);
    box(ctx, scare, 0.64, 0.05, 0.05, M.wood, [0, 0.7, 0]);
    box(ctx, scare, 0.24, 0.36, 0.16, M.linen, [0, 0.58, 0]);
    const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), M.cropGold);
    sHead.position.y = 0.9;
    scare.add(sHead);

    if (t >= 3) {
      buildPalmTree(ctx, root, 1.55, [-1.95, 0.22, -0.15], 0.95);
      buildPalmTree(ctx, root, 1.7, [1.98, 0.22, -0.65], 1.0);
    }
    if (t >= 4) {
      buildGuardian(ctx, root, [0.52, 0.22, -1.48], 0.85);
    }
    if (t === 5) {
      buildObelisk(ctx, root, 1.95, [2.05, 0.22, 1.55]);
      buildBrazier(ctx, root, [-0.72, 0.22, 1.85], 0.92);
      buildBrazier(ctx, root, [0.42, 0.22, 1.85], 0.92);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.54);
  }

  // ==========================================================================
  // 5. PORTAL DO TITÃ (T4–T5) — ESCAVAÇÃO, PILONES COLOSSAIS & VÓRTICE DUPLO
  // ==========================================================================
  else if (buildingKey === 'titan_gate') {
    const bw = 4.8 + (t - 4) * 0.5;
    const bd = 4.6 + (t - 4) * 0.45;
    box(ctx, root, bw, 0.24, bd, M.secondary, [0, 0.12, 0]);
    box(ctx, root, bw - 0.22, 0.14, bd - 0.22, M.stoneBase, [0, 0.31, 0]);

    cyl(ctx, root, 1.65, 1.48, 0.12, 24, M.dark, [0, 0.35, -0.1]);
    const pitRim = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.1, 8, 32), M.gold);
    pitRim.rotation.x = Math.PI / 2;
    pitRim.position.set(0, 0.41, -0.1);
    root.add(pitRim);

    for (let s = 0; s < 4; s++) {
      box(ctx, root, 1.85 - s * 0.12, 0.1, 0.36, M.stoneBright, [0, 0.05 + s * 0.09, bd * 0.46 - s * 0.22]);
    }

    const pH = 3.15 + (t - 4) * 0.55;
    buildPylon(ctx, root, 1.38, 1.28, pH, [-1.52, 0.38, -0.15], true);
    buildPylon(ctx, root, 1.38, 1.28, pH, [1.52, 0.38, -0.15], true);
    box(ctx, root, 4.35, 0.34, 1.15, M.stoneBright, [0, 0.38 + pH + 0.1, -0.15]);
    box(ctx, root, 4.48, 0.14, 1.26, M.trim, [0, 0.38 + pH + 0.32, -0.15]);
    buildWingedSun(ctx, root, [0, 0.38 + pH + 0.12, 0.48], 1.55);

    const vGrp = grp(root, 0, 1.85 + (t - 4) * 0.22, -0.15);
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.1, 10, 32), M.vortexOuter);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 10, 28), M.vortexInner);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), M.ember);
    vGrp.add(outerRing, innerRing, core);
    ctx.vortexPairs.push({ outer: outerRing, inner: innerRing, core });
    vortexRing = outerRing;
    beaconCrystal = core;

    buildTempleFlagpole(ctx, root, pH + 1.05, [-1.52, 0.38, 0.58]);
    buildTempleFlagpole(ctx, root, pH + 1.05, [1.52, 0.38, 0.58]);
    buildMiniSphinx(ctx, root, [-1.45, 0.38, 1.55], 0.18, 0.92);
    buildMiniSphinx(ctx, root, [1.45, 0.38, 1.55], -0.18, 0.92);
    buildBrazier(ctx, root, [-0.88, 0.38, 1.82], 1.05);
    buildBrazier(ctx, root, [0.88, 0.38, 1.82], 1.05);

    if (t === 5) {
      buildPylon(ctx, root, 1.1, 1.05, pH * 0.84, [-1.95, 0.38, -1.35], true);
      buildPylon(ctx, root, 1.1, 1.05, pH * 0.84, [1.95, 0.38, -1.35], true);
      buildObelisk(ctx, root, 2.35, [-2.35, 0.38, 1.58]);
      buildObelisk(ctx, root, 2.35, [2.35, 0.38, 1.58]);
      buildGuardian(ctx, root, [-2.18, 0.38, 0.35], 1.02);
      buildGuardian(ctx, root, [2.18, 0.38, 0.35], 1.02);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 6. MERCADO DO OÁSIS (T2–T5) — BARRACAS LISTRADAS, SACADA & BALANÇA DE MA'AT
  // ==========================================================================
  else if (buildingKey === 'market') {
    const bw = 4.0 + (t - 2) * 0.34;
    const bd = 3.6 + (t - 2) * 0.3;
    box(ctx, root, bw, 0.2, bd, M.secondary, [0, 0.1, 0]);
    box(ctx, root, bw - 0.16, 0.12, bd - 0.16, M.stoneBase, [0, 0.26, 0]);
    box(ctx, root, 2.1, 0.03, 2.55, M.linen, [0, 0.33, 0.28]);

    const hallW = 2.85 + Math.max(0, t - 2) * 0.26;
    const hallH = 1.5 + Math.max(0, t - 2) * 0.16;
    box(ctx, root, hallW, hallH, 1.25, M.stoneBright, [0, 0.32 + hallH * 0.5, -1.02]);
    box(ctx, root, hallW + 0.24, 0.12, 1.48, M.trim, [0, 0.32 + hallH + 0.06, -1.02]);

    if (t >= 3) {
      const balcY = 0.32 + hallH * 0.56;
      box(ctx, root, hallW * 0.88, 0.1, 0.58, M.stoneBright, [0, balcY, -0.14]);
      box(ctx, root, hallW * 0.88, 0.24, 0.06, M.gold, [0, balcY + 0.16, 0.12]);
      for (const bx of [-hallW * 0.36, -hallW * 0.12, hallW * 0.12, hallW * 0.36]) {
        buildLotusColumn(ctx, root, hallH * 0.46, [bx, balcY + 0.05, 0.1], 0.055, t === 5);
      }
    }
    buildWingedSun(ctx, root, [0, 0.32 + hallH + 0.06, -0.22], 1.05);

    const stallPos: Array<[number, number]> =
      t === 2
        ? [
            [-1.32, 0.42],
            [1.32, 0.42],
          ]
        : [
            [-1.38, -0.05],
            [1.38, -0.05],
            [-1.38, 1.05],
            [1.38, 1.05],
          ];
    stallPos.forEach(([sx, sz], idx) => {
      const st = grp(root, sx, 0.32, sz);
      buildLotusColumn(ctx, st, 1.15, [-0.38, 0, 0.32], 0.055);
      buildLotusColumn(ctx, st, 1.15, [0.38, 0, 0.32], 0.055);
      buildLotusColumn(ctx, st, 1.15, [-0.38, 0, -0.32], 0.055);
      buildLotusColumn(ctx, st, 1.15, [0.38, 0, -0.32], 0.055);
      box(ctx, st, 0.96, 0.06, 0.86, M.linen, [0, 1.2, 0], [0.16, 0, 0]);
      box(ctx, st, 0.78, 0.34, 0.44, M.wood, [0, 0.17, 0.05]);
      box(ctx, st, 0.22, 0.18, 0.22, M.gold, [-0.18, 0.43, 0.05]);
      cyl(ctx, st, 0.1, 0.06, 0.3, 10, idx % 2 === 0 ? M.secondary : M.trim, [0.18, 0.48, 0.05]);
    });

    // Balança de Ma'at
    const scaleStand = grp(root, 0, 0.32, 0.78);
    box(ctx, scaleStand, 0.68, 0.42, 0.48, M.stoneBright, [0, 0.21, 0]);
    box(ctx, scaleStand, 0.72, 0.06, 0.52, M.trim, [0, 0.44, 0]);
    cyl(ctx, scaleStand, 0.022, 0.032, 0.46, 8, M.gold, [0, 0.68, 0]);
    box(ctx, scaleStand, 0.5, 0.025, 0.025, M.gold, [0, 0.88, 0]);
    cyl(ctx, scaleStand, 0.09, 0.04, 0.04, 10, M.gold, [-0.22, 0.76, 0]);
    cyl(ctx, scaleStand, 0.09, 0.04, 0.04, 10, M.gold, [0.22, 0.76, 0]);

    if (t >= 4) {
      buildPylon(ctx, root, 0.92, 0.88, hallH + 0.68, [-hallW * 0.56, 0.32, -0.95], true);
      buildPylon(ctx, root, 0.92, 0.88, hallH + 0.68, [hallW * 0.56, 0.32, -0.95], true);
      buildTempleFlagpole(ctx, root, hallH + 1.15, [-hallW * 0.56, 0.32, -0.42]);
      buildTempleFlagpole(ctx, root, hallH + 1.15, [hallW * 0.56, 0.32, -0.42]);
      buildGuardian(ctx, root, [0, 0.32, -0.18], 0.88);
    }
    if (t === 5) {
      buildObelisk(ctx, root, 2.05, [-2.12, 0.32, 1.65]);
      buildObelisk(ctx, root, 2.05, [2.12, 0.32, 1.65]);
      buildMiniSphinx(ctx, root, [-0.88, 0.32, 1.72], 0.14, 0.82);
      buildMiniSphinx(ctx, root, [0.88, 0.32, 1.72], -0.14, 0.82);
      buildBrazier(ctx, root, [-1.45, 0.32, 1.72], 0.95);
      buildBrazier(ctx, root, [1.45, 0.32, 1.72], 0.95);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 7. FERREIRO & ALTO-FORNO (T2–T5) — AQUEDUTO & RODA HIDRÁULICA GIRATÓRIA
  // ==========================================================================
  else if (buildingKey === 'armory') {
    const bw = 4.1 + t * 0.34;
    const bd = 3.8 + t * 0.32;

    box(ctx, root, bw, 0.2, bd, M.secondary, [0, 0.1, 0]);
    box(ctx, root, bw - 0.18, 0.14, bd - 0.18, M.stoneBase, [0, 0.27, 0]);
    box(ctx, root, bw - 0.42, 0.04, bd - 0.42, M.roofTiles, [0, 0.35, 0]);
    box(ctx, root, 1.55, 0.12, 0.32, M.stoneBright, [0, 0.06, bd * 0.5 + 0.1]);
    box(ctx, root, 1.35, 0.12, 0.22, M.stoneBright, [0, 0.18, bd * 0.5 - 0.02]);

    const hallW = 2.65 + t * 0.24;
    const hallH = 1.62 + t * 0.18;
    const hallD = 1.75;
    const hallZ = -0.68;

    box(ctx, root, hallW, hallH, 0.34, M.stoneBright, [0, 0.34 + hallH * 0.5, hallZ - hallD * 0.5]);
    box(ctx, root, hallW * 0.72, hallH * 0.65, 0.12, M.dark, [0, 0.34 + hallH * 0.38, hallZ - hallD * 0.5 + 0.16]);
    for (const s of [-1, 1]) {
      box(ctx, root, 0.32, hallH, hallD, M.stoneBright, [s * (hallW * 0.5 - 0.16), 0.34 + hallH * 0.5, hallZ]);
      box(ctx, root, 0.14, hallH * 0.85, 0.38, M.stoneBase, [s * (hallW * 0.5 + 0.06), 0.34 + hallH * 0.42, hallZ - 0.35]);
      box(ctx, root, 0.14, hallH * 0.85, 0.38, M.stoneBase, [s * (hallW * 0.5 + 0.06), 0.34 + hallH * 0.42, hallZ + 0.35]);
    }
    const colCount = t >= 4 ? 4 : 3;
    for (let i = 0; i < colCount; i++) {
      const cx = -hallW * 0.38 + (i / (colCount - 1)) * (hallW * 0.76);
      buildLotusColumn(ctx, root, hallH, [cx, 0.34, hallZ + hallD * 0.5], 0.095, t === 5);
    }
    box(ctx, root, hallW + 0.26, 0.18, hallD + 0.26, M.stoneBright, [0, 0.34 + hallH + 0.09, hallZ]);
    box(ctx, root, hallW + 0.34, 0.1, hallD + 0.34, M.trim, [0, 0.34 + hallH + 0.22, hallZ]);
    box(ctx, root, hallW + 0.14, 0.06, hallD + 0.14, M.roofTiles, [0, 0.34 + hallH + 0.3, hallZ]);

    if (t >= 3) {
      const clH = 0.56 + (t - 3) * 0.1;
      box(ctx, root, hallW * 0.68, clH, hallD * 0.62, M.stoneBright, [0, 0.34 + hallH + 0.32 + clH * 0.5, hallZ - 0.08]);
      box(ctx, root, hallW * 0.74, 0.09, hallD * 0.68, M.trim, [0, 0.34 + hallH + 0.32 + clH + 0.04, hallZ - 0.08]);
      for (const vx of [-0.45, 0, 0.45]) {
        box(ctx, root, 0.22, 0.22, 0.06, M.dark, [vx, 0.34 + hallH + 0.32 + clH * 0.5, hallZ - 0.08 + hallD * 0.31 + 0.01]);
      }
      buildWingedSun(ctx, root, [0, 0.34 + hallH + 0.1, hallZ + hallD * 0.5 + 0.16], 1.05 + (t - 3) * 0.08);
    } else {
      buildWingedSun(ctx, root, [0, 0.34 + hallH + 0.1, hallZ + hallD * 0.5 + 0.16], 0.9);
    }

    // Chaminé-pilone + Alto-forno
    const chimH = 2.35 + t * 0.36;
    buildPylon(ctx, root, 1.05, 1.05, chimH, [-hallW * 0.28, 0.34, hallZ - 0.18], false);
    const topFire = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.48, 8), M.flame);
    topFire.position.set(-hallW * 0.28, 0.34 + chimH + 0.42, hallZ - 0.18);
    root.add(topFire);
    ctx.flames.push(topFire);

    const furnace = grp(root, -hallW * 0.28, 0.34, 0.44);
    box(ctx, furnace, 1.18, 0.96, 0.94, M.stoneBase, [0, 0.48, 0]);
    box(ctx, furnace, 1.3, 0.12, 1.04, M.trim, [0, 1.0, 0]);
    box(ctx, furnace, 0.72, 0.56, 0.2, M.dark, [0, 0.46, 0.4]);
    box(ctx, furnace, 0.8, 0.08, 0.22, M.gold, [0, 0.76, 0.41]);
    const emberCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 1), M.ember);
    emberCore.scale.set(1.22, 0.78, 1.05);
    emberCore.position.set(0, 0.44, 0.34);
    furnace.add(emberCore);
    box(ctx, furnace, 0.44, 0.26, 0.38, M.wood, [-0.78, 0.34, 0.1], [0, 0, -0.22]);
    box(ctx, furnace, 0.46, 0.06, 0.4, M.gold, [-0.78, 0.46, 0.1], [0, 0, -0.22]);
    if (t >= 3) {
      box(ctx, furnace, 0.18, 0.08, 0.62, M.stoneBase, [0, 0.24, 0.72], [0.22, 0, 0]);
      box(ctx, furnace, 0.1, 0.05, 0.58, M.ember, [0, 0.27, 0.72], [0.22, 0, 0]);
      box(ctx, furnace, 0.46, 0.14, 0.34, M.stoneBright, [0, 0.07, 1.04]);
      box(ctx, furnace, 0.32, 0.06, 0.2, M.ember, [0, 0.14, 1.04]);
    }

    // Aqueduto e Roda Hidráulica Giratória
    const wheelX = -hallW * 0.5 - 0.36;
    const wheelGroup = grp(root, wheelX, 0.96, -0.22);
    box(ctx, wheelGroup, 0.3, 1.24, 0.28, M.stoneBase, [0, 0.02, -0.95]);
    box(ctx, wheelGroup, 0.3, 1.24, 0.28, M.stoneBase, [0, 0.02, -0.35]);
    box(ctx, wheelGroup, 0.38, 0.16, 1.38, M.stoneBright, [0, 0.66, -0.58]);
    box(ctx, wheelGroup, 0.26, 0.06, 1.34, M.water, [0, 0.75, -0.58]);
    box(ctx, wheelGroup, 0.2, 0.62, 0.1, M.water, [0, 0.38, 0.04]);
    box(ctx, wheelGroup, 0.44, 0.2, 2.25, M.stoneBase, [0, -0.52, 0.28]);
    box(ctx, wheelGroup, 0.32, 0.06, 2.15, M.water, [0, -0.41, 0.28]);

    const wheel = grp(wheelGroup, 0, 0, 0);
    cyl(ctx, wheel, 0.12, 0.12, 0.34, 12, M.gold, [0, 0, 0], [0, 0, Math.PI / 2]);
    const wRim1 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 24), M.wood);
    wRim1.rotation.y = Math.PI / 2;
    wRim1.position.x = -0.1;
    const wRim2 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 24), M.wood);
    wRim2.rotation.y = Math.PI / 2;
    wRim2.position.x = 0.1;
    wheel.add(wRim1, wRim2);
    for (let p = 0; p < 8; p++) {
      box(ctx, wheel, 0.28, 0.05, 1.24, t >= 4 ? M.gold : M.wood, [0, 0, 0], [(p / 8) * Math.PI * 2, 0, 0]);
    }
    ctx.waterwheels.push(wheel);

    // Bigorna, Cocho, Pedra de Amolar, Lingotes e Armas
    const anvil = grp(root, 0.42, 0.34, 0.64);
    cyl(ctx, anvil, 0.2, 0.24, 0.38, 12, M.wood, [0, 0.19, 0]);
    cyl(ctx, anvil, 0.215, 0.215, 0.05, 12, M.gold, [0, 0.3, 0]);
    box(ctx, anvil, 0.54, 0.18, 0.24, M.gold, [0, 0.46, 0]);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 8), M.gold);
    horn.rotation.z = -Math.PI / 2;
    horn.position.set(0.36, 0.48, 0);
    anvil.add(horn);
    box(ctx, anvil, 0.05, 0.3, 0.05, M.wood, [0.1, 0.65, 0.04], [0.22, 0, 0.48]);
    box(ctx, anvil, 0.17, 0.1, 0.1, M.secondary, [0.04, 0.77, 0.06], [0.22, 0, 0.48]);

    const quench = grp(root, 1.22, 0.34, 0.68);
    box(ctx, quench, 0.64, 0.42, 0.48, M.stoneBright, [0, 0.21, 0]);
    box(ctx, quench, 0.68, 0.06, 0.52, M.trim, [0, 0.43, 0]);
    box(ctx, quench, 0.54, 0.06, 0.38, M.water, [0, 0.42, 0]);

    const grind = grp(root, 1.22, 0.34, 1.32);
    box(ctx, grind, 0.08, 0.5, 0.4, M.wood, [0, 0.25, 0]);
    const stoneWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.09, 18), M.stoneBright);
    stoneWheel.rotation.z = Math.PI / 2;
    stoneWheel.position.set(0, 0.44, 0);
    grind.add(stoneWheel);

    for (let l = 0; l < 5; l++) {
      box(ctx, root, 0.24, 0.075, 0.12, M.gold, [0.32 + (l % 3) * 0.16, 0.38 + Math.floor(l / 3) * 0.08, 1.32]);
    }
    buildWeaponRack(ctx, root, [hallW * 0.34, 0.34, 0.05], -0.22, t >= 3);
    if (t >= 3) {
      buildWeaponRack(ctx, root, [hallW * 0.34, 0.34, -0.78], -0.1, t >= 4);
      buildTempleFlagpole(ctx, root, hallH + 1.15, [-hallW * 0.48, 0.34, 0.22]);
      buildTempleFlagpole(ctx, root, hallH + 1.15, [hallW * 0.48, 0.34, 0.22]);
    }
    if (t >= 4) {
      buildPylon(ctx, root, 0.96, 0.92, hallH + 0.72, [hallW * 0.56, 0.34, -0.58], true);
      buildGuardian(ctx, root, [hallW * 0.58, 0.34, 1.12], 0.95);
      buildBrazier(ctx, root, [-0.62, 0.34, 1.68], 0.96);
      buildBrazier(ctx, root, [0.62, 0.34, 1.68], 0.96);
    }
    if (t === 5) {
      buildObelisk(ctx, root, 2.15, [-2.18, 0.34, 1.65]);
      buildObelisk(ctx, root, 2.15, [2.18, 0.34, 1.65]);
      buildMiniSphinx(ctx, root, [-1.15, 0.34, 1.76], 0.15, 0.85);
      buildMiniSphinx(ctx, root, [1.15, 0.34, 1.76], -0.15, 0.85);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 8. MURALHA & PORTÃO ARTICULADO (T1–T5)
  // ==========================================================================
  else if (buildingKey === 'gate') {
    const wallH = 1.18 + t * 0.28;
    const gateW = 1.58;

    for (const side of [-1, 1]) {
      const wx = side * 1.88;
      if (t === 1) {
        box(ctx, root, 1.88, 0.36, 0.58, M.stoneBase, [wx, 0.18, 0]);
        for (let p = -4; p <= 4; p++) {
          cyl(ctx, root, 0.07, 0.09, wallH, 8, M.wood, [wx + p * 0.19, wallH * 0.5, 0]);
        }
        box(ctx, root, 1.88, 0.08, 0.22, M.wood, [wx, wallH * 0.65, 0]);
      } else {
        box(ctx, root, 1.98, wallH, 0.64, M.stoneBright, [wx, wallH * 0.5, 0]);
        box(ctx, root, 2.06, 0.1, 0.72, M.trim, [wx, wallH + 0.05, 0]);
        for (let m = -2; m <= 2; m++) {
          box(ctx, root, 0.24, 0.22, 0.22, M.stoneBright, [wx + m * 0.36, wallH + 0.2, 0.22]);
        }
      }
    }

    const pH = wallH + 0.58;
    if (t === 1) {
      box(ctx, root, 0.7, pH, 0.7, M.stoneBase, [-0.98, pH * 0.5, 0]);
      box(ctx, root, 0.7, pH, 0.7, M.stoneBase, [0.98, pH * 0.5, 0]);
    } else {
      buildPylon(ctx, root, 0.88, 0.88, pH, [-1.0, 0, 0], t >= 3);
      buildPylon(ctx, root, 0.88, 0.88, pH, [1.0, 0, 0], t >= 3);
      box(ctx, root, 2.4, 0.24, 0.74, M.stoneBright, [0, wallH + 0.12, 0]);
      box(ctx, root, 2.48, 0.1, 0.8, M.trim, [0, wallH + 0.28, 0]);
      if (t >= 3) {
        buildWingedSun(ctx, root, [0, wallH + 0.12, 0.42], 1.1);
        buildTempleFlagpole(ctx, root, pH + 0.85, [-1.0, 0, 0.52]);
        buildTempleFlagpole(ctx, root, pH + 0.85, [1.0, 0, 0.52]);
      }
    }

    // Portas duplas articuladas
    const doorH = wallH - 0.08;
    const leafW = gateW * 0.5;
    const doorMat = t >= 4 ? M.gold : M.wood;

    const leftPivot = grp(root, -leafW, 0, 0.05);
    box(ctx, leftPivot, leafW - 0.02, doorH, 0.1, doorMat, [leafW * 0.5, doorH * 0.5, 0]);
    box(ctx, leftPivot, leafW - 0.06, 0.08, 0.13, M.trim, [leafW * 0.5, doorH * 0.7, 0]);

    const rightPivot = grp(root, leafW, 0, 0.05);
    box(ctx, rightPivot, leafW - 0.02, doorH, 0.1, doorMat, [-leafW * 0.5, doorH * 0.5, 0]);
    box(ctx, rightPivot, leafW - 0.06, 0.08, 0.13, M.trim, [-leafW * 0.5, doorH * 0.7, 0]);
    ctx.gates.push({ leftPivot, rightPivot, currentAngle: 0 });

    if (t >= 4) {
      buildMiniSphinx(ctx, root, [-1.52, 0, 0.88], 0.12, 0.9);
      buildMiniSphinx(ctx, root, [1.52, 0, 0.88], -0.12, 0.9);
    }
    if (t === 5) {
      buildObelisk(ctx, root, 2.05, [-2.42, 0, 0.82]);
      buildObelisk(ctx, root, 2.05, [2.42, 0, 0.82]);
      buildBrazier(ctx, root, [-1.0, pH + 0.22, 0], 0.92);
      buildBrazier(ctx, root, [1.0, pH + 0.22, 0], 0.92);
    }
    attachGodSanctuaryKit(ctx, root, 2.65);
  }

  // ==========================================================================
  // 8B. SEGMENTO DE MURALHA EGÍPCIA (T1–T5)
  // ==========================================================================
  else if (buildingKey === 'wall') {
    const wallH = 1.24 + t * 0.28;
    if (t === 1) {
      box(ctx, root, 2.75, 0.36, 0.82, M.stoneBase, [0, 0.18, 0]);
      for (let p = -5; p <= 5; p++) {
        cyl(ctx, root, 0.08, 0.1, wallH, 8, M.wood, [p * 0.24, wallH * 0.5, 0]);
      }
      box(ctx, root, 2.75, 0.1, 0.24, M.wood, [0, wallH * 0.65, 0]);
    } else {
      box(ctx, root, 2.84, 0.24, 0.96, M.secondary, [0, 0.12, 0]);
      box(ctx, root, 2.76, wallH, 0.74, M.stoneBright, [0, wallH * 0.5, 0]);
      box(ctx, root, 2.86, 0.1, 0.84, M.trim, [0, wallH + 0.05, 0]);
      for (let m = -3; m <= 3; m++) {
        box(ctx, root, 0.26, 0.22, 0.24, M.stoneBright, [m * 0.38, wallH + 0.2, 0.24]);
        box(ctx, root, 0.26, 0.22, 0.24, M.stoneBright, [m * 0.38, wallH + 0.2, -0.24]);
      }
      if (t >= 3) {
        buildWingedSun(ctx, root, [0, wallH * 0.68, 0.41], 0.85);
      }
      if (t >= 4) {
        const pH = wallH + (t === 5 ? 0.36 : 0.3);
        buildPylon(ctx, root, 0.64, 0.88, pH, [-1.22, 0, 0], false);
        buildPylon(ctx, root, 0.64, 0.88, pH, [1.22, 0, 0], false);
        if (t === 5) {
          for (const sx of [-1.22, 1.22]) {
            const cap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.44, 4), M.gold);
            cap.rotation.y = Math.PI / 4;
            cap.position.set(sx, pH + 0.46, 0);
            root.add(cap);
          }
        }
      }
    }
    box(ctx, root, 0.52, 0.36, 0.06, M.banner, [0, wallH * 0.42, 0.41]);
  }

  // ==========================================================================
  // 9. QUARTEL EGÍPCIO (T2–T5)
  // ==========================================================================
  else if (buildingKey === 'barracks') {
    const bw = 3.4 + t * 0.35;
    const bd = 3.1 + t * 0.32;
    box(ctx, root, bw, 0.2, bd, M.secondary, [0, 0.1, 0]);
    box(ctx, root, bw - 0.16, 0.12, bd - 0.16, M.stoneBase, [0, 0.26, 0]);

    if (t === 2) {
      box(ctx, root, 2.85, 1.4, 1.88, M.stoneBright, [0, 1.02, -0.35]);
      box(ctx, root, 3.05, 0.12, 2.08, M.trim, [0, 1.78, -0.35]);
      buildLotusColumn(ctx, root, 1.32, [-1.18, 0.32, 0.95], 0.09);
      buildLotusColumn(ctx, root, 1.32, [1.18, 0.32, 0.95], 0.09);
      box(ctx, root, 2.6, 0.06, 0.88, M.linen, [0, 1.62, 0.72], [0.16, 0, 0]);
      buildWingedSun(ctx, root, [0, 1.48, 0.62], 0.88);
      buildWeaponRack(ctx, root, [-0.88, 0.32, 1.2], 0.15);
      buildWeaponRack(ctx, root, [0.88, 0.32, 1.2], -0.15);
    } else if (t === 3) {
      buildPylon(ctx, root, 1.38, 1.18, 2.15, [-1.08, 0.32, 0.35]);
      buildPylon(ctx, root, 1.38, 1.18, 2.15, [1.08, 0.32, 0.35]);
      buildTempleFlagpole(ctx, root, 2.65, [-1.08, 0.32, 0.98]);
      buildTempleFlagpole(ctx, root, 2.65, [1.08, 0.32, 0.98]);
      box(ctx, root, 2.6, 1.68, 1.58, M.stoneBase, [0, 1.16, -0.55]);
      buildWingedSun(ctx, root, [0, 1.68, 0.58], 1.0);
      buildWeaponRack(ctx, root, [-1.28, 0.32, 1.28], 0.22);
      buildWeaponRack(ctx, root, [1.28, 0.32, 1.28], -0.22);
      buildBrazier(ctx, root, [0, 0.32, 1.5], 0.88);
    } else if (t === 4) {
      buildPylon(ctx, root, 1.58, 1.32, 2.52, [-1.28, 0.32, 0.45]);
      buildPylon(ctx, root, 1.58, 1.32, 2.52, [1.28, 0.32, 0.45]);
      buildTempleFlagpole(ctx, root, 2.95, [-1.28, 0.32, 1.15]);
      buildTempleFlagpole(ctx, root, 2.95, [1.28, 0.32, 1.15]);
      box(ctx, root, 3.4, 2.1, 1.88, M.stoneBright, [0, 1.37, -0.65]);
      buildWingedSun(ctx, root, [0, 2.02, 0.68], 1.15);
      buildMiniSphinx(ctx, root, [-1.52, 0.32, 1.52], 0.16, 0.88);
      buildGuardian(ctx, root, [1.72, 0.32, 1.48], 0.94);
      buildBrazier(ctx, root, [-0.55, 0.32, 1.68], 0.95);
    } else {
      for (const sx of [-1.48, 1.48]) {
        for (const sz of [-1.15, 1.05]) buildPylon(ctx, root, 1.28, 1.22, 2.75, [sx, 0.32, sz]);
      }
      box(ctx, root, 2.7, 2.4, 2.48, M.stoneBright, [0, 1.52, -0.05]);
      buildWingedSun(ctx, root, [0, 2.2, 1.25], 1.3);
      buildObelisk(ctx, root, 2.05, [-2.12, 0.32, 1.78]);
      buildObelisk(ctx, root, 2.05, [2.12, 0.32, 1.78]);
      buildMiniSphinx(ctx, root, [-0.88, 0.32, 1.92], 0.12, 0.88);
      buildMiniSphinx(ctx, root, [0.88, 0.32, 1.92], -0.12, 0.88);
      buildGuardian(ctx, root, [-1.55, 0.32, 1.85], 0.96);
      buildGuardian(ctx, root, [1.55, 0.32, 1.85], 0.96);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 10. ESTÁBULOS DO NILO (T2–T5)
  // ==========================================================================
  else if (buildingKey === 'stable') {
    const bw = 3.8 + t * 0.34;
    const bd = 3.3 + t * 0.3;
    box(ctx, root, bw, 0.2, bd, M.secondary, [0, 0.1, 0]);
    box(ctx, root, bw - 0.16, 0.12, bd - 0.16, M.stoneBase, [0, 0.26, 0]);

    const stallCount = t >= 4 ? 4 : 3;
    const wallW = 2.85 + t * 0.28;
    const wallH = 1.42 + t * 0.15;
    box(ctx, root, wallW, wallH, 0.28, M.stoneBright, [0, 0.32 + wallH * 0.5, -0.88]);
    box(ctx, root, wallW + 0.26, 0.12, 1.68, M.trim, [0, 0.32 + wallH + 0.06, -0.22]);
    box(ctx, root, wallW + 0.18, 0.08, 1.6, M.linen, [0, 0.32 + wallH + 0.15, -0.22]);

    if (t >= 3) {
      box(ctx, root, wallW * 0.58, 0.6, 0.96, M.stoneBright, [0, 0.32 + wallH + 0.44, -0.65]);
      box(ctx, root, wallW * 0.64, 0.08, 1.04, M.trim, [0, 0.32 + wallH + 0.78, -0.65]);
      box(ctx, root, 0.36, 0.24, 0.26, M.cropGold, [-0.22, 0.32 + wallH + 0.24, -0.18]);
      box(ctx, root, 0.36, 0.24, 0.26, M.cropGold, [0.22, 0.32 + wallH + 0.24, -0.18]);
    }

    for (let i = 0; i <= stallCount; i++) {
      const sx = -wallW * 0.46 + (i / stallCount) * (wallW * 0.92);
      buildLotusColumn(ctx, root, wallH, [sx, 0.32, 0.45], 0.088, t === 5);
      box(ctx, root, 0.08, wallH * 0.74, 1.22, M.wood, [sx, 0.32 + wallH * 0.37, -0.2]);
      if (i < stallCount) {
        const midX = sx + (wallW * 0.92) / (stallCount * 2);
        box(ctx, root, 0.54, 0.46, 0.05, M.wood, [midX, 0.55, 0.4]);
        box(ctx, root, 0.44, 0.18, 0.22, M.stoneBase, [midX, 0.41, -0.64]);
        box(ctx, root, 0.38, 0.1, 0.18, M.cropGold, [midX, 0.52, -0.64]);
      }
    }

    box(ctx, root, 0.88, 0.24, 0.34, M.stoneBright, [-1.18, 0.44, 1.08]);
    box(ctx, root, 0.76, 0.05, 0.22, M.water, [-1.18, 0.55, 1.08]);
    box(ctx, root, 0.42, 0.26, 0.32, M.cropGold, [-1.54, 0.45, 0.55]);
    box(ctx, root, 0.38, 0.24, 0.3, M.cropGold, [-1.5, 0.7, 0.55]);

    buildChariotWheel(ctx, root, [-wallW * 0.5 - 0.12, 0.64, 0.05], [0, Math.PI / 2, 0.15]);
    if (t >= 3) buildEgyptianWarChariot(ctx, root, [0.95, 0.32, 0.98], -0.45, t >= 4);

    if (t >= 4) {
      buildPylon(ctx, root, 0.9, 0.9, 2.4, [-wallW * 0.54, 0.32, -0.55], true);
      buildPylon(ctx, root, 0.9, 0.9, 2.4, [wallW * 0.54, 0.32, -0.55], true);
      buildTempleFlagpole(ctx, root, 2.75, [-wallW * 0.54, 0.32, 0.05]);
      buildTempleFlagpole(ctx, root, 2.75, [wallW * 0.54, 0.32, 0.05]);
      buildWingedSun(ctx, root, [0, 0.32 + wallH + 0.06, 0.64], 1.1);
      buildBrazier(ctx, root, [-1.58, 0.32, 1.4], 0.92);
      buildBrazier(ctx, root, [1.58, 0.32, 1.4], 0.92);
    }
    if (t === 5) {
      buildObelisk(ctx, root, 1.95, [-2.08, 0.32, 1.5]);
      buildObelisk(ctx, root, 1.95, [2.08, 0.32, 1.5]);
      buildGuardian(ctx, root, [-0.45, 0.32, 1.4], 0.95);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 11. CENTRO DE ARQUEARIA (T2–T5)
  // ==========================================================================
  else if (buildingKey === 'archery_range') {
    const bw = 3.7 + t * 0.36;
    const bd = 3.6 + t * 0.32;
    box(ctx, root, bw, 0.2, bd, M.secondary, [0, 0.1, 0]);
    box(ctx, root, bw - 0.16, 0.12, bd - 0.16, M.stoneBase, [0, 0.26, 0]);

    const pavW = 2.8 + t * 0.28;
    const pavH = 1.58 + t * 0.18;
    box(ctx, root, pavW, pavH, 1.25, M.stoneBright, [0, 0.32 + pavH * 0.5, -1.05]);
    box(ctx, root, pavW + 0.26, 0.12, 1.48, M.trim, [0, 0.32 + pavH + 0.06, -0.95]);
    box(ctx, root, pavW + 0.16, 0.07, 1.38, M.roofTiles, [0, 0.32 + pavH + 0.15, -0.95]);
    box(ctx, root, pavW + 0.2, 0.06, 0.86, M.linen, [0, 0.32 + pavH - 0.05, -0.22], [0.2, 0, 0]);

    const cols = t >= 4 ? 5 : 4;
    for (let i = 0; i < cols; i++) {
      const cx = -pavW * 0.44 + (i / (cols - 1)) * (pavW * 0.88);
      buildLotusColumn(ctx, root, pavH, [cx, 0.32, -0.35], 0.09, t === 5);
    }

    buildPylon(ctx, root, 0.84 + t * 0.05, 0.84 + t * 0.05, pavH + 0.5, [-pavW * 0.56, 0.32, -0.92], t >= 3);
    buildPylon(ctx, root, 0.84 + t * 0.05, 0.84 + t * 0.05, pavH + 0.5, [pavW * 0.56, 0.32, -0.92], t >= 3);
    buildWingedSun(ctx, root, [0, 0.32 + pavH + 0.06, -0.2], 0.98 + t * 0.05);

    if (t >= 3) {
      box(ctx, root, pavW * 0.58, 0.65, 0.85, M.stoneBright, [0, 0.32 + pavH + 0.48, -1.05]);
      box(ctx, root, pavW * 0.64, 0.09, 0.92, M.trim, [0, 0.32 + pavH + 0.84, -1.05]);
      buildTempleFlagpole(ctx, root, pavH + 1.15, [-pavW * 0.56, 0.32, -0.36]);
      buildTempleFlagpole(ctx, root, pavH + 1.15, [pavW * 0.56, 0.32, -0.36]);
    }

    for (const s of [-1, 1]) {
      const wx = s * (pavW * 0.52);
      const bowRack = grp(root, wx, 0.32, 0.22);
      box(ctx, bowRack, 0.18, 0.84, 0.55, M.wood, [0, 0.42, 0]);
      for (let b = -1; b <= 1; b++) {
        const arc = new THREE.Mesh(
          new THREE.TorusGeometry(0.28, 0.018, 6, 16, Math.PI * 1.15),
          M.gold
        );
        arc.rotation.set(0, Math.PI / 2, -Math.PI * 0.08);
        arc.position.set(s * -0.1, 0.48, b * 0.16);
        bowRack.add(arc);
      }
      cyl(ctx, root, 0.11, 0.08, 0.48, 12, M.secondary, [s * (pavW * 0.36), 0.56, 0.15]);
    }

    const targetCount = t === 2 ? 3 : 4;
    box(ctx, root, bw - 0.55, 0.34, 0.18, M.stoneBase, [0, 0.49, 1.5]);
    for (let i = 0; i < targetCount; i++) {
      const tx = -(targetCount - 1) * 0.44 + i * 0.88;
      buildArcheryTarget(
        ctx,
        root,
        [tx, 0.32, 1.12 + (i % 2) * 0.16],
        (i - 1.5) * -0.06,
        0.88 + t * 0.04
      );
    }

    if (t >= 4) {
      buildGuardian(ctx, root, [-pavW * 0.6, 0.32, 0.72], 0.92);
      buildGuardian(ctx, root, [pavW * 0.6, 0.32, 0.72], 0.92);
    }
    if (t === 5) {
      buildObelisk(ctx, root, 2.0, [-2.08, 0.32, 1.6]);
      buildObelisk(ctx, root, 2.0, [2.08, 0.32, 1.6]);
      buildBrazier(ctx, root, [-0.65, 0.32, 1.7], 0.95);
      buildBrazier(ctx, root, [0.65, 0.32, 1.7], 0.95);
    }
    attachGodSanctuaryKit(ctx, root, bw * 0.58);
  }

  // ==========================================================================
  // 12. CASA DA POPULAÇÃO (T1–T5 EVOLUTIVA)
  // ==========================================================================
  else {
    const scaleXZ = 0.92 + t * 0.06;
    const scaleY = 0.96 + t * 0.03;

    const hPlat1 = box(ctx, root, 2.6, 0.16, 2.4, M.stoneBase, [0, 0.08, 0]);
    const hPlat2 = box(ctx, root, 2.4, 0.1, 2.2, M.stoneBright, [0, 0.21, 0]);
    const hMainBody = box(ctx, root, 1.82, 1.34, 1.56, M.stoneBright, [0, 0.93, -0.1]);
    const hCornice = box(ctx, root, 1.98, 0.11, 1.72, M.trim, [0, 1.65, -0.1]);
    const hRoof = box(ctx, root, 1.88, 0.06, 1.62, M.roofTiles, [0, 1.73, -0.1]);

    hPlat1.scale.set(scaleXZ * 1.15, 1, scaleXZ * 1.15);
    hPlat2.scale.set(scaleXZ * 1.12, 1, scaleXZ * 1.12);
    hMainBody.scale.set(scaleXZ, scaleY, scaleXZ);
    hCornice.scale.set(scaleXZ, 1, scaleXZ);
    hRoof.scale.set(scaleXZ, 1, scaleXZ);

    const frontZ = -0.1 + 1.56 * 0.5 * scaleXZ;
    const hFrontFacade = grp(root, 0, 0, frontZ);
    box(ctx, hFrontFacade, 0.56, 0.92, 0.12, M.wood, [0, 0.72, 0.04]);
    box(ctx, hFrontFacade, 0.04, 0.92, 0.14, M.gold, [0, 0.72, 0.05]);
    box(ctx, hFrontFacade, 0.7, 1.02, 0.08, M.gold, [0, 0.77, 0.02]);
    box(ctx, hFrontFacade, 0.78, 0.09, 0.14, M.trim, [0, 1.28, 0.05]);
    buildWingedSun(ctx, hFrontFacade, [0, 1.42, 0.07], 0.76);

    buildLotusColumn(ctx, hFrontFacade, 1.28, [-0.62, 0.26, 0.34], 0.07);
    buildLotusColumn(ctx, hFrontFacade, 1.28, [0.62, 0.26, 0.34], 0.07);
    box(ctx, hFrontFacade, 1.5, 0.05, 0.56, M.linen, [0, 1.52, 0.22], [0.18, 0, 0]);

    box(ctx, hFrontFacade, 0.34, 0.26, 0.08, M.dark, [-0.58, 1.2, 0.02]);
    box(ctx, hFrontFacade, 0.34, 0.26, 0.08, M.dark, [0.58, 1.2, 0.02]);
    cyl(ctx, hFrontFacade, 0.11, 0.07, 0.34, 12, M.secondary, [0.88, 0.43, 0.24]);
    cyl(ctx, hFrontFacade, 0.09, 0.06, 0.28, 12, M.gold, [1.06, 0.4, 0.18]);

    const stairsX = -(1.82 * 0.5) * scaleXZ - 0.16;
    const hStairs = grp(root, stairsX, 0.26, 0.02);
    for (let s = 0; s < 5; s++) {
      box(ctx, hStairs, 0.28, 0.24 + s * 0.24, 0.24, M.stoneBright, [
        0,
        (0.24 + s * 0.24) * 0.5,
        0.45 - s * 0.22,
      ]);
    }

    if (t >= 2) {
      box(ctx, hFrontFacade, 0.68, 0.22, 0.28, M.stoneBase, [-0.74, 0.37, 0.46]);
      box(ctx, hFrontFacade, 0.68, 0.22, 0.28, M.stoneBase, [0.74, 0.37, 0.46]);
      for (const jx of [-0.84, -0.64, 0.64, 0.84]) {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), M.foliage);
        bush.position.set(jx, 0.52, 0.46);
        hFrontFacade.add(bush);
      }
    }

    if (t >= 3) {
      box(ctx, root, 1.44, 0.98, 1.2, M.stoneBright, [0, 2.2, -0.18]);
      box(ctx, root, 1.6, 0.1, 1.36, M.trim, [0, 2.74, -0.18]);
      box(ctx, root, 1.5, 0.06, 1.26, M.roofTiles, [0, 2.82, -0.18]);
      box(ctx, root, 0.44, 0.72, 0.1, M.wood, [0, 2.08, 0.42]);
      box(ctx, root, 0.54, 0.78, 0.07, M.gold, [0, 2.11, 0.41]);
      buildLotusColumn(ctx, root, 0.98, [-0.62, 1.74, 0.64], 0.065);
      buildLotusColumn(ctx, root, 0.98, [0.62, 1.74, 0.64], 0.065);
      box(ctx, root, 1.46, 0.05, 0.62, M.linen, [0, 2.66, 0.56], [0.18, 0, 0]);
    }

    if (t >= 4) {
      buildPalmTree(ctx, root, 1.42, [-1.5, 0.26, 1.0], 0.92);
      buildPalmTree(ctx, root, 1.6, [1.5, 0.26, -0.78], 1.0);
      box(ctx, root, 1.15, 0.52, 0.16, M.stoneBright, [-1.14, 0.52, 1.54]);
      box(ctx, root, 1.15, 0.52, 0.16, M.stoneBright, [1.14, 0.52, 1.54]);
      box(ctx, root, 0.16, 0.52, 2.98, M.stoneBright, [-1.68, 0.52, 0.05]);
      box(ctx, root, 0.16, 0.52, 2.98, M.stoneBright, [1.68, 0.52, 0.05]);
    }

    if (t === 5) {
      buildPylon(ctx, root, 0.76, 0.7, 1.76, [-0.82, 0.26, 1.5], false);
      buildPylon(ctx, root, 0.76, 0.7, 1.76, [0.82, 0.26, 1.5], false);
      buildBrazier(ctx, root, [-0.82, 0.26, 2.02], 0.84);
      buildBrazier(ctx, root, [0.82, 0.26, 2.02], 0.84);
      const hFinial = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 4), M.gold);
      hFinial.position.set(0, 3.1, -0.18);
      hFinial.rotation.y = Math.PI / 4;
      root.add(hFinial);
    }

    attachGodSanctuaryKit(ctx, root, 2.05);
  }

  return {
    root,
    meta,
    effectiveTier: t,
    flames: ctx.flames,
    furnaceMat: M.ember,
    flags: ctx.flags,
    cranes: ctx.cranes,
    windmills: ctx.windmills,
    waterwheels: ctx.waterwheels,
    cropClusters: ctx.cropClusters,
    vortexPairs: ctx.vortexPairs,
    gates: ctx.gates,
    oilStreams: ctx.oilStreams,
    towerFireOriginY,
    beaconCrystal,
    vortexRing,
    metropolisHalo,
    metropolisCrystal,
  };
}
