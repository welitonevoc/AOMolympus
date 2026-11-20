import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { AtlanteanHumanUnitKind, createAtlanteanHumanUnitMesh } from './atlanteanHumanModels';
import { AtlanteanMythUnitKind, createAtlanteanMythUnitMesh } from './atlanteanMythModels';

export interface AtlanteanMarkerSpec {
  markerRadius: number;
  barHeight: number;
  barWidth: number;
}

const ATLANTEAN_HUMAN_MAP: Record<string, AtlanteanHumanUnitKind> = {
  citizen: 'citizen',
  oracle: 'oracle',
  llama_caravan: 'llama_caravan',
  murmillo: 'murmillo',
  katapeltes: 'katapeltes',
  turma: 'turma',
  cheiroballista: 'cheiroballista',
  arcus: 'arcus',
  contarius: 'contarius',
  destroyer: 'destroyer',
  fanatic: 'fanatic',
  fire_siphon: 'fire_siphon',
  onager: 'onager',
  // Clean Atlantean fallbacks for shared generic IDs
  villager: 'citizen',
  hoplite: 'murmillo',
  hipaspist: 'katapeltes',
  myrmidon: 'fanatic',
  peltast: 'turma',
  archer: 'arcus',
  gastraphetes: 'cheiroballista',
  cavalry: 'contarius',
  prodromos: 'turma',
  hero: 'oracle',
  ajax: 'destroyer',
  jason: 'murmillo',
  odysseus: 'arcus',
  perseus: 'fanatic',
  bellerophon: 'contarius',
  hippolyta: 'arcus',
  theseus: 'murmillo',
  ram: 'fire_siphon',
  siege: 'onager',
};

const ATLANTEAN_MYTH_MAP: Record<string, AtlanteanMythUnitKind> = {
  promethean: 'promethean',
  promethean_offspring: 'promethean_offspring',
  automaton: 'automaton',
  caladria: 'caladria',
  behemoth: 'behemoth',
  satyr: 'satyr',
  stymphalian_bird: 'stymphalian_bird',
  dryad: 'dryad',
  hekagigantes: 'hekagigantes',
  argus: 'argus',
  lampades: 'lampades',
  carnivora: 'carnivora',
  tartarian_spawn: 'tartarian_spawn',
  // Clean fallbacks for shared myth IDs
  minotaur: 'promethean',
  centaur: 'satyr',
  cyclops: 'behemoth',
  manticore: 'stymphalian_bird',
  medusa: 'lampades',
  hydra: 'argus',
  colossus: 'hekagigantes',
  nymph: 'dryad',
  pegasus: 'caladria',
  iron_dwarf: 'automaton',
  phoenix: 'stymphalian_bird',
};

export function getAtlanteanUnitMarkerSpec(kind: string): AtlanteanMarkerSpec {
  switch (kind) {
    case 'titan':
      return { markerRadius: 2.2, barHeight: 9.8, barWidth: 2.8 };
    case 'behemoth':
    case 'hekagigantes':
    case 'cyclops':
    case 'colossus':
      return { markerRadius: 1.25, barHeight: 3.45, barWidth: 1.75 };
    case 'fire_siphon':
    case 'onager':
    case 'cheiroballista':
    case 'ram':
    case 'siege':
      return { markerRadius: 1.0, barHeight: 2.75, barWidth: 1.55 };
    case 'argus':
    case 'carnivora':
    case 'promethean':
    case 'tartarian_spawn':
      return { markerRadius: 0.92, barHeight: 2.7, barWidth: 1.45 };
    case 'turma':
    case 'contarius':
    case 'llama_caravan':
    case 'cavalry':
    case 'prodromos':
      return { markerRadius: 0.85, barHeight: 2.45, barWidth: 1.4 };
    case 'caladria':
    case 'stymphalian_bird':
      return { markerRadius: 0.72, barHeight: 2.9, barWidth: 1.3 };
    case 'destroyer':
    case 'fanatic':
    case 'automaton':
    case 'satyr':
    case 'lampades':
      return { markerRadius: 0.62, barHeight: 2.25, barWidth: 1.2 };
    default:
      return { markerRadius: 0.5, barHeight: 1.92, barWidth: 1.05 };
  }
}

export function createAtlanteanUnitMesh(
  kind: string,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  majorGod?: string
): THREE.Group {
  const mythKind = ATLANTEAN_MYTH_MAP[kind];
  if (mythKind) {
    return createAtlanteanMythUnitMesh(mythKind, team, pal, enableShadows);
  }
  const humanKind = ATLANTEAN_HUMAN_MAP[kind] ?? 'murmillo';
  return createAtlanteanHumanUnitMesh(humanKind, team, pal, enableShadows, majorGod);
}
