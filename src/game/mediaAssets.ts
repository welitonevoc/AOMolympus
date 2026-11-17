import godZeusImg from '../assets/images/god_zeus_1794935872951.jpg';
import godPoseidonImg from '../assets/images/god_poseidon_1794935874784.jpg';
import godHadesImg from '../assets/images/god_hades_1794935875112.jpg';
import godDemeterImg from '../assets/images/god_demeter_1794935874091.jpg';
import godRaImg from '../assets/images/god_ra_1794935874680.jpg';
import godIsisImg from '../assets/images/god_isis_1794935874045.jpg';
import godSetImg from '../assets/images/god_set_1794935873945.jpg';
import godOdinImg from '../assets/images/god_odin_1794935876002.jpg';
import godThorImg from '../assets/images/god_thor_1794935875855.jpg';
import godLokiImg from '../assets/images/god_loki_1794935875515.jpg';
import godFreyrImg from '../assets/images/god_freyr_1794935877209.jpg';
import godCronosImg from '../assets/images/god_cronos_1794935877475.jpg';
import godUranoImg from '../assets/images/god_urano_1794935877600.jpg';
import godGaiaImg from '../assets/images/god_gaia_1794935877803.jpg';

import civChineseImg from '../assets/images/civ_chinese_1794935878318.jpg';
import civJapaneseImg from '../assets/images/civ_japanese_1794935878522.jpg';
import civAztecImg from '../assets/images/civ_aztec_1794935963461.jpg';
import civRomanImg from '../assets/images/civ_roman_1794935965675.jpg';
import civEldritchImg from '../assets/images/civ_eldritch_1794935879670.jpg';
import civCelticImg from '../assets/images/civ_celtic_1794935965001.jpg';
import civBabylonianImg from '../assets/images/civ_babylonian_1794935964093.jpg';
import civLakotaImg from '../assets/images/civ_lakota_1794935964447.jpg';
import civJotunnImg from '../assets/images/civ_jotunn_1794935965923.jpg';

import mapOlympusCitadelImg from '../assets/images/olympus_citadel_hero_1794768157018.jpg';
import mapNileDesertImg from '../assets/images/map_nile_desert_1794935965661.jpg';
import mapNordicFjordsImg from '../assets/images/map_nordic_fjords_1794935965539.jpg';
import mapErebusLavaImg from '../assets/images/map_erebus_lava_1794935965953.jpg';
import mapSavannahJungleImg from '../assets/images/map_savannah_jungle_1794935883522.jpg';
import mapAegeanIslandsImg from '../assets/images/map_aegean_islands_1794935967469.jpg';

import { MapId, PantheonId } from './types';

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

export function getMajorGodPortrait(godIdOrName: string, pantheon: PantheonId): string {
  const key = godIdOrName.trim().toLowerCase();
  return GOD_PORTRAITS_BY_KEY[key] ?? PANTHEON_PORTRAITS[pantheon] ?? godZeusImg;
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
};

export function getMapLandscapeImage(mapId: MapId): string {
  return MAP_LANDSCAPE_IMAGES[mapId] ?? mapOlympusCitadelImg;
}
