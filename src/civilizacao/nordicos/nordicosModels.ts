import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { createNorseHumanUnitMesh, NorseHumanUnitKind } from './norseHumanModels';
import { createNorseMythUnitMesh, NorseMythUnitKind } from './norseMythModels';

export interface NorseMarkerSpec {
  markerRadius: number;
  barHeight: number;
  barWidth: number;
}

const NORSE_HUMAN_MAP: Record<string, NorseHumanUnitKind> = {
  villager: 'villager',
  norse_dwarf: 'norse_dwarf',
  ox_cart: 'ox_cart',
  hersir: 'hersir',
  godi: 'godi',
  ulfsark: 'ulfsark',
  throwing_axeman: 'throwing_axeman',
  raiding_cavalry: 'raiding_cavalry',
  huskarl: 'huskarl',
  jarl: 'jarl',
  portable_ram: 'portable_ram',
  norse_ballista: 'norse_ballista',
  // Clean Norse fallbacks for generic shared IDs
  hoplite: 'ulfsark',
  hipaspist: 'throwing_axeman',
  myrmidon: 'huskarl',
  peltast: 'throwing_axeman',
  archer: 'throwing_axeman',
  gastraphetes: 'godi',
  cavalry: 'raiding_cavalry',
  prodromos: 'jarl',
  hero: 'hersir',
  ajax: 'hersir',
  jason: 'hersir',
  odysseus: 'godi',
  perseus: 'hersir',
  bellerophon: 'jarl',
  hippolyta: 'godi',
  theseus: 'hersir',
  ram: 'portable_ram',
  siege: 'norse_ballista',
};

const NORSE_MYTH_MAP: Record<string, NorseMythUnitKind> = {
  troll: 'troll',
  valkyrie: 'valkyrie',
  einherjar: 'einherjar',
  frost_giant: 'frost_giant',
  mountain_giant: 'mountain_giant',
  battle_boar: 'battle_boar',
  kraken: 'kraken',
  rock_troll: 'rock_troll',
  fire_giant: 'fire_giant',
  fenris_wolf: 'fenris_wolf',
  nidhogg: 'nidhogg',
  jormungand: 'jormungand',
  fafnir: 'fafnir',
  titan: 'titan',
  // Clean Norse fallbacks for shared myth IDs
  minotaur: 'troll',
  centaur: 'valkyrie',
  cyclops: 'frost_giant',
  manticore: 'fire_giant',
  medusa: 'jormungand',
  hydra: 'nidhogg',
  colossus: 'mountain_giant',
  nymph: 'valkyrie',
  pegasus: 'nidhogg',
  satyr: 'einherjar',
  automaton: 'battle_boar',
  iron_dwarf: 'rock_troll',
  phoenix: 'nidhogg',
};

export function getNorseUnitMarkerSpec(kind: string): NorseMarkerSpec {
  switch (kind) {
    case 'titan':
      return { markerRadius: 2.2, barHeight: 9.8, barWidth: 2.8 };
    case 'nidhogg':
      return { markerRadius: 1.4, barHeight: 4.4, barWidth: 2.0 };
    case 'fafnir':
    case 'mountain_giant':
    case 'fire_giant':
    case 'frost_giant':
    case 'kraken':
    case 'jormungand':
    case 'cyclops':
    case 'colossus':
    case 'hydra':
      return { markerRadius: 1.15, barHeight: 3.3, barWidth: 1.7 };
    case 'portable_ram':
    case 'norse_ballista':
    case 'ram':
    case 'siege':
      return { markerRadius: 1.0, barHeight: 2.9, barWidth: 1.55 };
    case 'raiding_cavalry':
    case 'jarl':
    case 'valkyrie':
    case 'battle_boar':
    case 'fenris_wolf':
    case 'ox_cart':
    case 'cavalry':
    case 'prodromos':
      return { markerRadius: 0.85, barHeight: 2.45, barWidth: 1.4 };
    case 'troll':
    case 'rock_troll':
    case 'einherjar':
    case 'hersir':
    case 'godi':
      return { markerRadius: 0.62, barHeight: 2.25, barWidth: 1.25 };
    default:
      return { markerRadius: 0.48, barHeight: 1.9, barWidth: 1.0 };
  }
}

export function createNorseUnitMesh(
  kind: string,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const mythKind = NORSE_MYTH_MAP[kind];
  if (mythKind) {
    return createNorseMythUnitMesh(mythKind, team, pal, enableShadows);
  }
  const humanKind = NORSE_HUMAN_MAP[kind] ?? 'ulfsark';
  return createNorseHumanUnitMesh(humanKind, team, pal, enableShadows);
}
