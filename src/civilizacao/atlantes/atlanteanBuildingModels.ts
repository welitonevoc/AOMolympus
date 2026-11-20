import * as THREE from 'three';
import { BuildingKind, PantheonId, TeamId } from '../../game/types';
import type { MaterialPalette } from '../../game/models';
import { buildAtlanteanFortress as buildProceduralAtlanteanFortress } from './atlanteanFortressModel';
import { buildProceduralAtlanteanTownCenter } from './atlanteanTownCenterModel';
import {
  AtlanteanArchBuildResult,
  buildAtlanteanArchBuilding,
  isAtlanteanArchBuilding,
  resolveAtlanteanArchGod,
} from './atlanteanArchitectureSuite';

// ─── Helper: Attach Atlantean Suite Animation Refs to Building Group ─────────

export function attachAtlanteanArchUserData(
  group: THREE.Group,
  built: AtlanteanArchBuildResult
): void {
  if (built.flames.length > 0) {
    group.userData.tcFlames = built.flames;
    group.userData.atlanteanFlames = built.flames;
  }
  if (built.rotators.length > 0) {
    group.userData.atlanteanRotators = built.rotators;
  }
  if (built.floaters.length > 0) {
    group.userData.atlanteanFloaters = built.floaters;
  }
  if (built.cropClusters.length > 0) {
    group.userData.egyptCrops = built.cropClusters;
  }
  if (built.gyroscopes.length > 0) {
    group.userData.atlanteanGyroscopes = built.gyroscopes;
  }
  if (built.slidingGates.length > 0) {
    group.userData.atlanteanSlidingGates = built.slidingGates;
  }
  if (built.pressHammers.length > 0) {
    group.userData.atlanteanPresses = built.pressHammers;
  }
  if (built.mirrorAssemblies.length > 0) {
    group.userData.atlanteanMirrors = built.mirrorAssemblies;
  }
  if (built.fountainHeads.length > 0) {
    group.userData.atlanteanFountains = built.fountainHeads;
  }
}

// ─── Atlantean Temple Builder (Preserved with Orichalcum & Crystal Sanctuary) ─

function buildAtlanteanTemple(
  group: THREE.Group,
  pal: MaterialPalette,
  teamMat: THREE.Material
): { beaconCrystal: THREE.Object3D } {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.75, 0.42, 8), pal.obsidian);
  base.position.y = 0.21;
  base.rotation.y = Math.PI / 8;
  group.add(base);

  const dais = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.25, 0.24, 8), pal.ivory);
  dais.position.y = 0.54;
  dais.rotation.y = Math.PI / 8;
  group.add(dais);

  const sanctuary = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.58, 2.35, 8), pal.ivory);
  sanctuary.position.y = 1.82;
  sanctuary.rotation.y = Math.PI / 8;
  group.add(sanctuary);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.4, 8), pal.orichalcum);
    col.position.set(Math.cos(a) * 1.82, 1.85, Math.sin(a) * 1.82);
    group.add(col);
  }

  const cornice = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 1.98, 0.24, 8), pal.orichalcum);
  cornice.position.y = 3.12;
  cornice.rotation.y = Math.PI / 8;
  group.add(cornice);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    pal.turquoise
  );
  dome.position.y = 3.24;
  group.add(dome);

  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.25, 0.08), teamMat);
  banner.position.set(0, 1.75, 1.95);
  group.add(banner);

  const beaconCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), pal.crystalGlow);
  beaconCrystal.position.y = 5.35;
  group.add(beaconCrystal);

  return { beaconCrystal };
}

// ─── Main Export: Atlantean Building Dispatcher ──────────────────────────────

export interface AtlanteanBuildingBuildResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function createAtlanteanBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows = true,
  age = 1,
  pantheon: PantheonId = 'atlantean',
  majorGod?: string
): AtlanteanBuildingBuildResult {
  const group = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const effGod = resolveAtlanteanArchGod(majorGod || String(pantheon || 'kronos'));

  let markerRadius = 1.5;
  let barHeight = 2.8;
  let barWidth = 1.7;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  if (kind === 'town_center') {
    const res = buildProceduralAtlanteanTownCenter(group, age, effGod, enableShadows);
    metropolisHalo = res.metropolisHalo;
    metropolisCrystal = res.metropolisCrystal;
    if (res.flames && res.flames.length > 0) {
      group.userData.tcFlames = res.flames;
      group.userData.atlanteanFlames = res.flames;
    }
    if (res.relics && res.relics.length > 0) {
      group.userData.atlanteanRelics = res.relics;
    }
    if (res.relicRings && res.relicRings.length > 0) {
      group.userData.atlanteanRelicRings = res.relicRings;
    }
    group.scale.setScalar(1.0 + (age - 1) * 0.055);
    markerRadius = 3.6 + (age - 1) * 0.22;
    barHeight = 3.8 + (age - 1) * 0.55;
    barWidth = 3.2 + (age - 1) * 0.15;
  } else if (kind === 'fortress') {
    const effTier = age >= 4 ? 4 : 3;
    const fortress = buildProceduralAtlanteanFortress(effGod, effTier, enableShadows);
    group.add(fortress.root);
    metropolisHalo = fortress.divineRing;
    metropolisCrystal = fortress.coreCrystal;
    group.scale.setScalar(1.22 + (age - 3) * 0.05);
    markerRadius = 3.4 + (age - 3) * 0.25;
    barHeight = 5.0 + (age - 3) * 0.45;
    barWidth = 3.2 + (age - 3) * 0.15;
  } else if (kind === 'temple') {
    const res = buildAtlanteanTemple(group, pal, teamMat);
    beaconCrystal = res.beaconCrystal;
    group.scale.setScalar(1.42);
    markerRadius = 3.0;
    barHeight = 5.8;
    barWidth = 2.8;
  } else if (isAtlanteanArchBuilding(kind)) {
    const built = buildAtlanteanArchBuilding(kind, effGod, age, enableShadows, teamMat);
    built.root.scale.setScalar(built.meta.gameplayScale);
    group.add(built.root);
    attachAtlanteanArchUserData(group, built);

    beaconCrystal = built.beaconCrystal;
    vortexRing = built.vortexRing;
    metropolisHalo = built.metropolisHalo;
    metropolisCrystal = built.metropolisCrystal;

    const ageDelta = Math.max(0, built.effectiveTier - built.meta.minTier);
    markerRadius = built.meta.markerRadius + ageDelta * 0.12;
    barHeight = built.meta.barHeight + ageDelta * 0.35;
    barWidth = built.meta.barWidth;
  } else {
    // Fallback to Atlantean watch tower from suite for any unmapped building
    const built = buildAtlanteanArchBuilding('tower', effGod, age, enableShadows, teamMat);
    built.root.scale.setScalar(built.meta.gameplayScale);
    group.add(built.root);
    attachAtlanteanArchUserData(group, built);
    beaconCrystal = built.beaconCrystal;
    metropolisHalo = built.metropolisHalo;
    metropolisCrystal = built.metropolisCrystal;
    markerRadius = built.meta.markerRadius;
    barHeight = built.meta.barHeight;
    barWidth = built.meta.barWidth;
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
