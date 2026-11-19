import minorHorusImg from '../assets/images/minor_horus_1794937407134.jpg';
import minorPrometheusImg from '../assets/images/minor_prometheus_1794937410006.jpg';
import minorSkadiImg from '../assets/images/minor_skadi_1794937409845.jpg';
import mapOlympusCitadelImg from '../assets/images/olympus_citadel_hero_1794768157018.jpg';

import { MapId, PantheonId } from './types';

function encodeSvgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makePortraitSvg(title: string, emblem: string, accent: string, bgTop: string, bgBottom: string): string {
  const safeTitle = title.replace(/[<>&"']/g, '');
  const safeEmblem = emblem.replace(/[<>&"']/g, '');
  return encodeSvgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bgTop}"/>
          <stop offset="100%" stop-color="${bgBottom}"/>
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="42%" r="48%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.48"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="240" height="240" fill="url(#bg)"/>
      <circle cx="120" cy="100" r="88" fill="url(#halo)"/>
      <circle cx="120" cy="100" r="58" fill="none" stroke="${accent}" stroke-width="2.5" stroke-opacity="0.65"/>
      <text x="120" y="114" text-anchor="middle" font-family="Georgia, serif" font-size="46" font-weight="bold" fill="#fef3c7">${safeEmblem}</text>
      <rect x="14" y="182" width="212" height="38" rx="6" fill="#090d14" fill-opacity="0.78" stroke="${accent}" stroke-opacity="0.55"/>
      <text x="120" y="206" text-anchor="middle" font-family="Georgia, serif" font-size="16" font-weight="bold" letter-spacing="1.2" fill="#f8e6b4">${safeTitle}</text>
    </svg>`
  );
}

function makeLandscapeSvg(title: string, sky: string, horizon: string, ground: string, water: string): string {
  const safeTitle = title.replace(/[<>&"']/g, '');
  return encodeSvgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 220">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${sky}"/>
          <stop offset="100%" stop-color="${horizon}"/>
        </linearGradient>
      </defs>
      <rect width="480" height="220" fill="url(#sky)"/>
      <circle cx="385" cy="54" r="24" fill="#fef08a" fill-opacity="0.75"/>
      <path d="M0 145 L95 92 L185 132 L285 78 L390 128 L480 96 L480 220 L0 220 Z" fill="${ground}"/>
      <path d="M0 170 Q130 155 240 176 T480 168 L480 220 L0 220 Z" fill="${water}" fill-opacity="0.88"/>
      <rect x="18" y="168" width="210" height="32" rx="6" fill="#070a10" fill-opacity="0.72"/>
      <text x="32" y="189" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#f3d27a">${safeTitle}</text>
    </svg>`
  );
}

const godZeusImg = makePortraitSvg('ZEUS', '⚡', '#facc15', '#1d3557', '#0b1324');
const godPoseidonImg = makePortraitSvg('POSEIDON', 'Ψ', '#38bdf8', '#0c4a6e', '#081826');
const godHadesImg = makePortraitSvg('HADES', 'Ω', '#a855f7', '#2e1065', '#090714');
const godDemeterImg = makePortraitSvg('DEMÉTER', '🌾', '#84cc16', '#26401c', '#0b1409');
const godRaImg = makePortraitSvg('RÁ', '☀', '#f59e0b', '#78350f', '#1c0f05');
const godIsisImg = makePortraitSvg('ÍSIS', '☥', '#eab308', '#1e3a5f', '#0a1426');
const godSetImg = makePortraitSvg('SET', '🜂', '#dc2626', '#450a0a', '#120505');
const godOdinImg = makePortraitSvg('ODIN', 'ᛟ', '#60a5fa', '#1e293b', '#090d16');
const godThorImg = makePortraitSvg('THOR', '🔨', '#fbbf24', '#334155', '#0f172a');
const godLokiImg = makePortraitSvg('LOKI', '🔥', '#f97316', '#3b0764', '#11041c');
const godFreyrImg = makePortraitSvg('FREYR', '🌿', '#34d399', '#14532d', '#061f12');
const godCronosImg = makePortraitSvg('CRONOS', '⏳', '#c084fc', '#311042', '#0b0614');
const godUranoImg = makePortraitSvg('URANO', '✦', '#38bdf8', '#172554', '#080e24');
const godGaiaImg = makePortraitSvg('GAIA', '🌳', '#4ade80', '#166534', '#072213');

const civChineseImg = makePortraitSvg('CHINESES', '龍', '#ef4444', '#7f1d1d', '#1c0707');
const civJapaneseImg = makePortraitSvg('JAPONESES', '⛩', '#fb7185', '#4c0519', '#140309');
const civAztecImg = makePortraitSvg('ASTECAS', '☉', '#10b981', '#064e3b', '#041a14');
const civRomanImg = makePortraitSvg('ROMANOS', '🦅', '#f43f5e', '#7f1d1d', '#190808');
const civEldritchImg = makePortraitSvg('ELDRITCH', '👁', '#a855f7', '#1e1b4b', '#060514');
const civCelticImg = makePortraitSvg('CELTAS', '☘', '#22c55e', '#14532d', '#061a0e');
const civBabylonianImg = makePortraitSvg('BABILÔNIOS', '🦁', '#f59e0b', '#1e3a8a', '#09122e');
const civLakotaImg = makePortraitSvg('LAKOTA', '🏹', '#fb923c', '#7c2d12', '#1c0a04');
const civJotunnImg = makePortraitSvg('JOTUNN', '❄', '#7dd3fc', '#0f172a', '#050914');

const mapNileDesertImg = makeLandscapeSvg('DESERTO & NILO', '#38bdf8', '#fde68a', '#b45309', '#0284c7');
const mapNordicFjordsImg = makeLandscapeSvg('FIORDES NÓRDICOS', '#64748b', '#cbd5e1', '#334155', '#0c4a6e');
const mapErebusLavaImg = makeLandscapeSvg('ÉREBO VULCÂNICO', '#1c1917', '#7f1d1d', '#292524', '#dc2626');
const mapSavannahJungleImg = makeLandscapeSvg('SAVANA & SELVA', '#38bdf8', '#bbf7d0', '#4d7c0f', '#0e7490');
const mapAegeanIslandsImg = makeLandscapeSvg('MAR EGEU', '#0284c7', '#bae6fd', '#65a30d', '#0369a1');

const minorAthenaImg = makePortraitSvg('ATENA', '🦉', '#facc15', '#1e3a8a', '#0a1430');
const minorAresImg = makePortraitSvg('ARES', '⚔', '#ef4444', '#7f1d1d', '#1c0606');
const minorHermesImg = makePortraitSvg('HERMES', '🪽', '#38bdf8', '#1e293b', '#0b111c');
const minorApolloImg = makePortraitSvg('APOLO', '☀', '#fbbf24', '#713f12', '#1f1105');
const minorAphroditeImg = makePortraitSvg('AFRODITE', '🐚', '#f472b6', '#831843', '#240715');
const minorHephaestusImg = makePortraitSvg('HEFESTO', '⚒', '#f97316', '#431407', '#140603');
const minorArtemisImg = makePortraitSvg('ÁRTEMIS', '🌙', '#a7f3d0', '#064e3b', '#041a14');
const minorBastImg = makePortraitSvg('BAST', '🐈', '#eab308', '#422006', '#140a02');
const minorAnubisImg = makePortraitSvg('ANÚBIS', '⚖', '#a855f7', '#27272a', '#09090b');
const minorFreyjaImg = makePortraitSvg('FREYJA', '❄', '#f472b6', '#312e81', '#0f0e29');
const minorHelImg = makePortraitSvg('HEL', '💀', '#94a3b8', '#1e1b4b', '#070614');

const GOD_PORTRAITS_BY_KEY: Record<string, string> = {
  zeus: godZeusImg,
  poseidon: godPoseidonImg,
  hades: godHadesImg,
  demeter: godDemeterImg,
  'deméter': godDemeterImg,
  ra: godRaImg,
  'rá': godRaImg,
  isis: godIsisImg,
  'ísis': godIsisImg,
  set: godSetImg,
  odin: godOdinImg,
  thor: godThorImg,
  loki: godLokiImg,
  freyr: godFreyrImg,
  cronos: godCronosImg,
  urano: godUranoImg,
  oranos: godUranoImg,
  gaia: godGaiaImg,
};

const PANTHEON_PORTRAITS: Record<PantheonId, string> = {
  greek: godZeusImg,
  egyptian: godRaImg,
  norse: godOdinImg,
  atlantean: godCronosImg,
  chinese: civChineseImg,
  japanese: civJapaneseImg,
  aztec: civAztecImg,
  roman: civRomanImg,
  eldritch: civEldritchImg,
  celtic: civCelticImg,
  babylonian: civBabylonianImg,
  lakota: civLakotaImg,
  jotunn: civJotunnImg,
};

const MINOR_GOD_PORTRAITS: Record<string, string> = {
  // Gregos
  athena: minorAthenaImg,
  ares: minorAresImg,
  hermes: minorHermesImg,
  apollo: minorApolloImg,
  dionysos: minorAphroditeImg,
  aphrodite: minorAphroditeImg,
  hephaestus: minorHephaestusImg,
  hera: minorAthenaImg,
  artemis: minorArtemisImg,
  // Egípcios
  bast: minorBastImg,
  ptah: minorHephaestusImg,
  anubis: minorAnubisImg,
  hathor: minorBastImg,
  nephthys: minorAnubisImg,
  sekhmet: minorAresImg,
  horus: minorHorusImg,
  osiris: minorHorusImg,
  thoth: minorApolloImg,
  // Nórdicos
  forseti: minorHermesImg,
  freyja: minorFreyjaImg,
  heimdall: minorAthenaImg,
  skadi: minorSkadiImg,
  bragi: minorFreyjaImg,
  njord: godPoseidonImg,
  aegir: godPoseidonImg,
  baldr: minorApolloImg,
  tyr: minorAresImg,
  hel: minorHelImg,
  vidar: minorSkadiImg,
  // Atlantes
  prometheus: minorPrometheusImg,
  okeanus: godPoseidonImg,
  leto: minorArtemisImg,
  hyperion: minorApolloImg,
  theia: minorAphroditeImg,
  rheia: godGaiaImg,
  helios: minorApolloImg,
  hekate: minorHelImg,
  atlas: godCronosImg,
  // Expansões
  divine_war2: minorAresImg,
  divine_eco2: godDemeterImg,
  divine_storm3: godThorImg,
  divine_shadow3: minorHelImg,
  divine_apocalypse4: minorPrometheusImg,
  divine_abyss4: minorAnubisImg,
};

export function getMajorGodPortrait(godIdOrName: string, pantheon: PantheonId): string {
  const key = godIdOrName.trim().toLowerCase();
  return GOD_PORTRAITS_BY_KEY[key] ?? PANTHEON_PORTRAITS[pantheon] ?? godZeusImg;
}

export function getMinorGodPortrait(minorGodId: string, pantheon: PantheonId): string {
  const key = minorGodId.trim().toLowerCase();
  return MINOR_GOD_PORTRAITS[key] ?? PANTHEON_PORTRAITS[pantheon] ?? minorAthenaImg;
}

export function getPantheonCoverPortrait(pantheon: PantheonId): string {
  return PANTHEON_PORTRAITS[pantheon] ?? godZeusImg;
}

const MAP_LANDSCAPE_IMAGES: Record<MapId, string> = {
  // ── The Titans ──
  highland: mapOlympusCitadelImg,
  islands: mapAegeanIslandsImg,
  land_unknown: mapSavannahJungleImg,
  marsh: mapSavannahJungleImg,
  megalopolis: mapOlympusCitadelImg,
  tundra: mapNordicFjordsImg,

  // ── Base ──
  acropolis: mapOlympusCitadelImg,
  alfheim: mapNordicFjordsImg,
  anatolia: mapNileDesertImg,
  archipelago: mapAegeanIslandsImg,
  erebus: mapErebusLavaImg,
  ghost_lake: mapNordicFjordsImg,
  jotunheim: mapNordicFjordsImg,
  king_of_the_hill: mapOlympusCitadelImg,
  mediterranean: mapAegeanIslandsImg,
  midgard: mapNordicFjordsImg,
  nile: mapNileDesertImg,
  nomad: mapSavannahJungleImg,
  oasis: mapNileDesertImg,
  savannah: mapSavannahJungleImg,
  sea_of_worms: mapAegeanIslandsImg,
  sudden_death: mapOlympusCitadelImg,
  team_migration: mapAegeanIslandsImg,
  the_unknown: mapAegeanIslandsImg,
  valley_of_the_kings: mapNileDesertImg,
  vinlandsaga: mapNordicFjordsImg,
  watering_hole: mapSavannahJungleImg,

  // ── Bonus ──
  yucatan: mapSavannahJungleImg,
  yellow_river: mapSavannahJungleImg,
  total_war: mapAegeanIslandsImg,
  rms_custom: mapOlympusCitadelImg,
};

export function getMapLandscapeImage(mapId: MapId): string {
  return MAP_LANDSCAPE_IMAGES[mapId] ?? mapOlympusCitadelImg;
}
