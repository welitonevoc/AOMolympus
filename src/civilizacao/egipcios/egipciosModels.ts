import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { createRaHumanUnitMesh, EgyptianHumanUnitKind } from './raHumanModels';
import { createRaMythUnitMesh, EgyptianMythUnitKind } from './raMythModels';

export interface EgyptianMarkerSpec {
  markerRadius: number;
  barHeight: number;
  barWidth: number;
}

const HUMAN_MAP: Record<string, EgyptianHumanUnitKind> = {
  villager: 'villager',
  priest: 'priest',
  pharaoh: 'pharaoh',
  son_of_osiris: 'son_of_osiris',
  egypt_spearman: 'egypt_spearman',
  slinger: 'slinger',
  axeman: 'axeman',
  chariot_archer: 'chariot_archer',
  camel_rider: 'camel_rider',
  war_elephant: 'war_elephant',
  siege_tower: 'siege_tower',
  egypt_catapult: 'egypt_catapult',
  // Clean Egyptian fallbacks for generic shared IDs
  hoplite: 'egypt_spearman',
  hipaspist: 'axeman',
  myrmidon: 'axeman',
  peltast: 'slinger',
  archer: 'slinger',
  gastraphetes: 'chariot_archer',
  cavalry: 'chariot_archer',
  prodromos: 'camel_rider',
  hero: 'pharaoh',
  ajax: 'pharaoh',
  jason: 'pharaoh',
  odysseus: 'priest',
  perseus: 'pharaoh',
  bellerophon: 'chariot_archer',
  hippolyta: 'priest',
  theseus: 'pharaoh',
  ram: 'siege_tower',
  siege: 'egypt_catapult',
};

const MYTH_MAP: Record<string, EgyptianMythUnitKind> = {
  sphinx: 'sphinx',
  wadjet: 'wadjet',
  roc: 'roc',
  petsuchos: 'petsuchos',
  scarab: 'scarab',
  avenger: 'avenger',
  mummy: 'mummy',
  titan: 'titan',
  // Clean Egyptian fallbacks for shared myth IDs
  minotaur: 'sphinx',
  centaur: 'roc',
  cyclops: 'wadjet',
  manticore: 'petsuchos',
  medusa: 'mummy',
  hydra: 'wadjet',
  colossus: 'war_elephant' as unknown as EgyptianMythUnitKind,
  nymph: 'sphinx',
  pegasus: 'roc',
  satyr: 'avenger',
  automaton: 'scarab',
  iron_dwarf: 'scarab',
  phoenix: 'roc',
};

export function getEgyptianUnitMarkerSpec(kind: string): EgyptianMarkerSpec {
  switch (kind) {
    case 'titan':
      return { markerRadius: 2.2, barHeight: 9.8, barWidth: 2.8 };
    case 'war_elephant':
    case 'colossus':
      return { markerRadius: 1.25, barHeight: 3.4, barWidth: 1.75 };
    case 'siege_tower':
    case 'egypt_catapult':
    case 'ram':
    case 'siege':
      return { markerRadius: 1.05, barHeight: 3.1, barWidth: 1.6 };
    case 'chariot_archer':
    case 'cavalry':
      return { markerRadius: 0.95, barHeight: 2.35, barWidth: 1.45 };
    case 'camel_rider':
    case 'prodromos':
      return { markerRadius: 0.78, barHeight: 2.55, barWidth: 1.4 };
    case 'sphinx':
    case 'petsuchos':
    case 'scarab':
    case 'roc':
      return { markerRadius: 0.92, barHeight: 2.65, barWidth: 1.5 };
    case 'wadjet':
    case 'avenger':
    case 'mummy':
      return { markerRadius: 0.72, barHeight: 2.45, barWidth: 1.35 };
    case 'son_of_osiris':
      return { markerRadius: 0.65, barHeight: 2.55, barWidth: 1.35 };
    case 'pharaoh':
    case 'priest':
      return { markerRadius: 0.56, barHeight: 2.1, barWidth: 1.15 };
    default:
      return { markerRadius: 0.48, barHeight: 1.9, barWidth: 1.0 };
  }
}

export function createEgyptianUnitMesh(
  kind: string,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  if (kind === 'colossus') {
    return createRaHumanUnitMesh('war_elephant', team, pal, enableShadows);
  }
  const mythKind = MYTH_MAP[kind];
  if (mythKind) {
    return createRaMythUnitMesh(mythKind, team, pal, enableShadows);
  }
  const humanKind = HUMAN_MAP[kind] ?? 'egypt_spearman';
  return createRaHumanUnitMesh(humanKind, team, pal, enableShadows);
}
