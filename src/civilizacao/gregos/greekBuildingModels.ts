import * as THREE from 'three';
import { BuildingKind, PantheonId, TeamId } from '../../game/types';
import type { MaterialPalette } from '../../game/models';
import { buildProceduralGreekTemple } from './greekTempleModel';
import { buildProceduralGreekHouse } from './greekHouseModel';
import { buildProceduralGreekTownCenter } from './greekTownCenterModel';
import {
  buildGreekArchBuilding,
  GreekArchBuildingKey,
  isGreekArchBuilding,
  resolveGreekArchGod,
} from './greekArchitectureSuite';

export interface GreekBuildingBuildResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

const ARCH_GAMEPLAY_LAYOUT: Record<
  GreekArchBuildingKey,
  { scale: number; markerRadius: number; barHeight: number; barWidth: number }
> = {
  barracks: { scale: 0.96, markerRadius: 2.75, barHeight: 4.3, barWidth: 2.6 },
  archery_range: { scale: 0.96, markerRadius: 2.75, barHeight: 4.3, barWidth: 2.6 },
  stable: { scale: 0.96, markerRadius: 2.75, barHeight: 4.3, barWidth: 2.6 },
  armory: { scale: 0.96, markerRadius: 2.6, barHeight: 4.2, barWidth: 2.45 },
  siege_works: { scale: 0.98, markerRadius: 2.9, barHeight: 4.5, barWidth: 2.7 },
  market: { scale: 0.98, markerRadius: 2.8, barHeight: 4.3, barWidth: 2.6 },
  fortress: { scale: 1.08, markerRadius: 3.55, barHeight: 5.4, barWidth: 3.3 },
  tower: { scale: 1.02, markerRadius: 1.65, barHeight: 5.8, barWidth: 1.9 },
  farm: { scale: 0.96, markerRadius: 2.55, barHeight: 3.1, barWidth: 2.2 },
  titan_gate: { scale: 1.22, markerRadius: 4.2, barHeight: 6.8, barWidth: 3.6 },
  wall: { scale: 1.0, markerRadius: 1.45, barHeight: 3.2, barWidth: 1.8 },
  gate: { scale: 0.72, markerRadius: 2.1, barHeight: 4.4, barWidth: 2.5 },
};

export function createGreekBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows = true,
  age = 1,
  pantheon: PantheonId = 'greek',
  majorGod?: string
): GreekBuildingBuildResult {
  const group = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const effGod = resolveGreekArchGod(majorGod || String(pantheon || 'zeus'));

  let markerRadius = 1.5;
  let barHeight = 2.8;
  let barWidth = 1.7;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  if (kind === 'town_center') {
    const res = buildProceduralGreekTownCenter(group, age, effGod, enableShadows);
    metropolisHalo = res.metropolisHalo;
    metropolisCrystal = res.metropolisCrystal;
    if (res.flames && res.flames.length > 0) {
      group.userData.tcFlames = res.flames;
    }
    group.scale.setScalar(1.05 + (age - 1) * 0.05);
    markerRadius = 3.6 + (age - 1) * 0.22;
    barHeight = 3.8 + (age - 1) * 0.5;
    barWidth = 3.2 + (age - 1) * 0.15;
  } else if (kind === 'temple') {
    const res = buildProceduralGreekTemple(group, age, effGod);
    beaconCrystal = res.beaconCrystal;
    group.scale.setScalar(1.2 + (age - 1) * 0.08);
    markerRadius = 2.6 + (age - 1) * 0.15;
    barHeight = 4.4 + (age - 1) * 0.3;
    barWidth = 2.6 + (age - 1) * 0.1;
  } else if (kind === 'house') {
    buildProceduralGreekHouse(group, age, effGod, enableShadows);
    group.scale.setScalar(1.22);
    markerRadius = 1.35 + (age - 1) * 0.12;
    barHeight = 2.2 + (age - 1) * 0.25;
    barWidth = 1.4 + (age - 1) * 0.1;
  } else if (isGreekArchBuilding(kind)) {
    const built = buildGreekArchBuilding(kind, effGod, age, enableShadows, teamMat);
    group.add(built.root);

    if (built.flames.length > 0) group.userData.tcFlames = built.flames;
    if (built.cranes.length > 0) group.userData.greekCranes = built.cranes;
    if (built.windmills.length > 0) group.userData.greekWindmills = built.windmills;
    if (built.portalRings.length > 0) group.userData.greekPortalRings = built.portalRings;
    if (built.gates.length > 0) group.userData.greekGates = built.gates;

    beaconCrystal = built.beaconCrystal;
    vortexRing = built.vortexRing;
    metropolisHalo = built.metropolisHalo;
    metropolisCrystal = built.metropolisCrystal;

    const layout = ARCH_GAMEPLAY_LAYOUT[kind];
    const ageScaleBoost = 1 + Math.max(0, built.effectiveTier - built.meta.minTier) * 0.03;
    group.scale.setScalar(layout.scale * ageScaleBoost);
    markerRadius = layout.markerRadius;
    barHeight = layout.barHeight + Math.max(0, age - 1) * 0.25;
    barWidth = layout.barWidth;
  }

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = enableShadows;
      child.receiveShadow = enableShadows;
    }
  });

  return {
    group,
    markerRadius,
    barHeight,
    barWidth,
    beaconCrystal,
    vortexRing,
    metropolisHalo,
    metropolisCrystal,
  };
}
