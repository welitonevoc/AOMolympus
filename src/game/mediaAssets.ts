import godCronosImg from '../assets/images/god_cronos_1795121376307.jpg';
import godDemeterImg from '../assets/images/god_demeter_1795121446731.jpg';
import godFreyrImg from '../assets/images/god_freyr_1795121379821.jpg';
import godFuxiImg from '../assets/images/god_fuxi_1795121379264.jpg';
import godGaiaImg from '../assets/images/god_gaia_1795121443392.jpg';
import godHadesImg from '../assets/images/god_hades_1795121382402.jpg';
import godIsisImg from '../assets/images/god_isis_1795121377823.jpg';
import godLokiImg from '../assets/images/god_loki_1795121492099.jpg';
import godNuwaImg from '../assets/images/god_nuwa_1795121442653.jpg';
import godOdinImg from '../assets/images/god_odin_1795121378948.jpg';
import godPoseidonImg from '../assets/images/god_poseidon_1795121381693.jpg';
import godRaImg from '../assets/images/god_ra_1795121377571.jpg';
import godSetImg from '../assets/images/god_set_1795121442507.jpg';
import godShennongImg from '../assets/images/god_shennong_1795121385670.jpg';
import godThorImg from '../assets/images/god_thor_1795121380520.jpg';
import godUranoImg from '../assets/images/god_urano_1795121379668.jpg';
import godZeusImg from '../assets/images/god_zeus_1795121378343.jpg';

import mapAegeanIslandsImg from '../assets/images/map_aegean_islands_1795121379463.jpg';
import mapErebusLavaImg from '../assets/images/map_erebus_lava_1795121380261.jpg';
import mapNileDesertImg from '../assets/images/map_nile_desert_1795121378637.jpg';
import mapNordicFjordsImg from '../assets/images/map_nordic_fjords_1795121376458.jpg';
import mapSavannahJungleImg from '../assets/images/map_savannah_jungle_1795121381811.jpg';
import mapOlympusCitadelImg from '../assets/images/olympus_citadel_hero_1794768157018.jpg';

import minorAnubisImg from '../assets/images/minor_anubis_1795121379262.jpg';
import minorApolloImg from '../assets/images/minor_apollo_1795121444032.jpg';
import minorAresImg from '../assets/images/minor_ares_1795121389862.jpg';
import minorAthenaImg from '../assets/images/minor_athena_1795121377095.jpg';
import minorFreyjaImg from '../assets/images/minor_freyja_1795121441841.jpg';
import minorHelImg from '../assets/images/minor_hel_1795121380282.jpg';
import minorHorusImg from '../assets/images/minor_horus_1794937407134.jpg';
import minorPrometheusImg from '../assets/images/minor_prometheus_1794937410006.jpg';
import minorSkadiImg from '../assets/images/minor_skadi_1794937409845.jpg';

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

// Coming-soon expansion emblem cards
const civJapaneseImg = makePortraitSvg('JAPONESES', '⛩', '#fb7185', '#4c0519', '#140309');
const civAztecImg = makePortraitSvg('ASTECAS', '☉', '#10b981', '#064e3b', '#041a14');
const civRomanImg = makePortraitSvg('ROMANOS', '🦅', '#f43f5e', '#7f1d1d', '#190808');
const civEldritchImg = makePortraitSvg('ELDRITCH', '👁', '#a855f7', '#1e1b4b', '#060514');
const civCelticImg = makePortraitSvg('CELTAS', '☘', '#22c55e', '#14532d', '#061a0e');
const civBabylonianImg = makePortraitSvg('BABILÔNIOS', '🦁', '#f59e0b', '#1e3a8a', '#09122e');
const civLakotaImg = makePortraitSvg('LAKOTA', '🏹', '#fb923c', '#7c2d12', '#1c0a04');
const civJotunnImg = makePortraitSvg('JOTUNN', '❄', '#7dd3fc', '#0f172a', '#050914');

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const GOD_PORTRAITS_BY_KEY: Record<string, string> = {
  zeus: godZeusImg,
  poseidon: godPoseidonImg,
  hades: godHadesImg,
  demeter: godDemeterImg,
  ra: godRaImg,
  isis: godIsisImg,
  set: godSetImg,
  odin: godOdinImg,
  thor: godThorImg,
  loki: godLokiImg,
  freyr: godFreyrImg,
  cronos: godCronosImg,
  kronos: godCronosImg,
  urano: godUranoImg,
  oranos: godUranoImg,
  gaia: godGaiaImg,
  'fu xi': godFuxiImg,
  fuxi: godFuxiImg,
  'nu wa': godNuwaImg,
  nuwa: godNuwaImg,
  shennong: godShennongImg,
};

const PANTHEON_PORTRAITS: Record<PantheonId, string> = {
  greek: godZeusImg,
  egyptian: godRaImg,
  norse: godOdinImg,
  atlantean: godCronosImg,
  chinese: godFuxiImg,
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
  hermes: minorApolloImg,
  apollo: minorApolloImg,
  dionysos: godDemeterImg,
  aphrodite: godDemeterImg,
  hephaestus: minorPrometheusImg,
  hera: minorAthenaImg,
  artemis: minorSkadiImg,
  // Egípcios
  bast: godIsisImg,
  ptah: godRaImg,
  anubis: minorAnubisImg,
  hathor: godIsisImg,
  nephthys: minorAnubisImg,
  sekhmet: godSetImg,
  horus: minorHorusImg,
  osiris: minorHorusImg,
  thoth: godRaImg,
  // Nórdicos
  forseti: godFreyrImg,
  freyja: minorFreyjaImg,
  heimdall: godOdinImg,
  skadi: minorSkadiImg,
  bragi: minorFreyjaImg,
  njord: godPoseidonImg,
  aegir: godPoseidonImg,
  baldr: godFreyrImg,
  tyr: godThorImg,
  hel: minorHelImg,
  vidar: minorSkadiImg,
  // Atlantes
  prometheus: minorPrometheusImg,
  okeanus: godPoseidonImg,
  leto: godGaiaImg,
  hyperion: minorApolloImg,
  theia: godUranoImg,
  rheia: godGaiaImg,
  helios: minorApolloImg,
  hekate: minorHelImg,
  atlas: godCronosImg,
  // Chineses (Immortal Pillars)
  chiyou: minorAresImg,
  xuannu: godNuwaImg,
  houtu: godShennongImg,
  gonggong: godPoseidonImg,
  huangdi: godFuxiImg,
  zhurong: minorPrometheusImg,
  // Expansões
  divine_war2: minorAresImg,
  divine_eco2: godDemeterImg,
  divine_storm3: godThorImg,
  divine_shadow3: minorHelImg,
  divine_apocalypse4: minorPrometheusImg,
  divine_abyss4: minorAnubisImg,
};

export function getMajorGodPortrait(godIdOrName: string, pantheon: PantheonId): string {
  const key = normalizeKey(godIdOrName);
  return GOD_PORTRAITS_BY_KEY[key] ?? PANTHEON_PORTRAITS[pantheon] ?? godZeusImg;
}

export function getMinorGodPortrait(minorGodId: string, pantheon: PantheonId): string {
  const key = normalizeKey(minorGodId);
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
