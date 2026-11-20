import * as THREE from 'three';
import { BuildingKind, PantheonId, TeamId } from '../../game/types';
import type { MaterialPalette } from '../../game/models';
import { buildProceduralEgyptianTemple } from './egyptianTempleModel';
import {
  buildEgyptianArchBuilding,
  isEgyptianArchBuilding,
  resolveEgyptianArchGod,
} from './egyptianArchitectureSuite';
import { buildProceduralEgyptianTownCenter } from './egyptianTownCenterModel';

export interface EgyptianBuildingMeshResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function createEgyptianBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  age: number = 1,
  pantheon: PantheonId = 'egyptian',
  majorGod?: string
): EgyptianBuildingMeshResult {
  const effGod = majorGod || (pantheon === 'egyptian' ? 'Rá' : String(pantheon));
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // 1. Centro da Cidade Egípcio (T1–T5)
  if (kind === 'town_center') {
    const tcGroup = new THREE.Group();
    const tcBuilt = buildProceduralEgyptianTownCenter(
      tcGroup,
      age,
      effGod,
      enableShadows
    );
    if (tcBuilt.flames.length > 0) {
      tcGroup.userData.tcFlames = tcBuilt.flames;
    }
    return {
      group: tcGroup,
      markerRadius: 3.9,
      barHeight: 5.5 + Math.max(0, Math.min(4, age - 1)) * 0.35,
      barWidth: 3.4,
      metropolisHalo: tcBuilt.metropolisHalo,
      metropolisCrystal: tcBuilt.metropolisCrystal,
    };
  }

  // 2. Templo Egípcio (T1–T5)
  if (kind === 'temple') {
    const templeGroup = new THREE.Group();
    const tBuilt = buildProceduralEgyptianTemple(templeGroup, age, effGod);
    if (enableShadows) {
      templeGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
    if (tBuilt.allFlames && tBuilt.allFlames.length > 0) {
      templeGroup.userData.tcFlames = tBuilt.allFlames;
    }
    return {
      group: templeGroup,
      markerRadius: 3.1,
      barHeight: 5.2 + Math.max(0, Math.min(4, age - 1)) * 0.3,
      barWidth: 2.6,
      beaconCrystal: tBuilt.beaconCrystal,
    };
  }

  // 3. Suite Épica Egípcia 3D (T1–T5 • Rá, Ísis & Set):
  //    siege_works, fortress, tower, farm, titan_gate, market, armory,
  //    gate, wall, barracks, stable, archery_range, house
  const archKind = isEgyptianArchBuilding(kind) ? kind : 'tower';
  const godKey = resolveEgyptianArchGod(effGod);
  const built = buildEgyptianArchBuilding(archKind, godKey, age, enableShadows, teamMat);
  built.root.scale.setScalar(built.meta.gameplayScale);

  const group = new THREE.Group();
  group.add(built.root);

  if (built.flames.length > 0) {
    group.userData.egyptArchFlames = built.flames;
    group.userData.tcFlames = built.flames;
  }
  if (built.flags.length > 0) {
    group.userData.egyptFlags = built.flags;
  }
  if (built.cranes.length > 0) {
    group.userData.greekCranes = built.cranes;
  }
  if (built.windmills.length > 0) {
    group.userData.greekWindmills = built.windmills;
  }
  if (built.waterwheels.length > 0) {
    group.userData.egyptWaterwheels = built.waterwheels;
  }
  if (built.cropClusters.length > 0) {
    group.userData.egyptCrops = built.cropClusters;
  }
  if (built.vortexPairs.length > 0) {
    group.userData.egyptVortexPairs = built.vortexPairs;
  }
  if (built.oilStreams.length > 0) {
    group.userData.egyptOilStreams = built.oilStreams;
  }
  if (built.gates.length > 0) {
    group.userData.greekGates = built.gates;
  }

  return {
    group,
    markerRadius: built.meta.markerRadius,
    barHeight: built.meta.barHeight + (built.effectiveTier - built.meta.minTier) * 0.25,
    barWidth: built.meta.barWidth,
    beaconCrystal: built.beaconCrystal,
    vortexRing: built.vortexRing,
    metropolisHalo: built.metropolisHalo,
    metropolisCrystal: built.metropolisCrystal,
  };
}
