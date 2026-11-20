import * as THREE from 'three';
import { AgeLevel, BuildingKind, PantheonId, TeamId } from './types';
import type { MaterialPalette } from './models';

export const EXPANDED_BUILDING_KINDS: ReadonlySet<BuildingKind> = new Set<BuildingKind>([
  'village_center',
  'granary',
  'storehouse',
  'lumber_camp',
  'mining_camp',
  'economic_guild',
  'counter_barracks',
  'great_hall',
  'dock',
  'monument',
  'obelisk',
  'lighthouse',
  'wall',
  'gate',
  'mirror_tower',
  'asgard_hill_fort',
  'sky_passage',
  'wonder',
]);

export function isExpandedBuildingKind(kind: BuildingKind): boolean {
  return EXPANDED_BUILDING_KINDS.has(kind);
}

export interface ExpandedBuildingMeshResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
}

interface CultureMaterials {
  wall: THREE.Material;
  trim: THREE.Material;
  roof: THREE.Material;
  base: THREE.Material;
  accent: THREE.Material;
}

function resolveCultureMats(pantheon: PantheonId, pal: MaterialPalette, teamMat: THREE.Material): CultureMaterials {
  if (pantheon === 'egyptian') {
    return {
      wall: pal.sandstone,
      trim: pal.gold,
      roof: pal.sandstoneDark,
      base: pal.sandstoneDark,
      accent: pal.turquoise,
    };
  }
  if (pantheon === 'norse' || pantheon === 'jotunn') {
    return {
      wall: pal.norseTimber,
      trim: pal.bronze,
      roof: pal.norseSlate,
      base: pal.stoneDark,
      accent: pal.iceBlue,
    };
  }
  if (pantheon === 'atlantean') {
    return {
      wall: pal.ivory,
      trim: pal.orichalcum,
      roof: pal.turquoise,
      base: pal.obsidian,
      accent: pal.crystalGlow,
    };
  }
  if (pantheon === 'chinese') {
    return {
      wall: pal.crimson,
      trim: pal.gold,
      roof: pal.jade,
      base: pal.ivory,
      accent: pal.goldOre,
    };
  }
  // Greek & default
  return {
    wall: pal.marble,
    trim: pal.bronze,
    roof: pal.terracotta,
    base: pal.stoneDark,
    accent: teamMat,
  };
}

export function createExpandedBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  pantheon: PantheonId,
  majorGod?: string,
  age: AgeLevel = 1
): ExpandedBuildingMeshResult {
  const group = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const cm = resolveCultureMats(pantheon, pal, teamMat);

  const addPart = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx, ry, rz);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    group.add(m);
    return m;
  };

  let markerRadius = 2.4;
  let barHeight = 3.8;
  let barWidth = 2.4;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;

  if (kind === 'village_center') {
    // Compact cultural fortified outpost hall with watch post & supply crates
    addPart(new THREE.BoxGeometry(5.6, 0.34, 4.8), cm.base, 0, 0.17, 0);
    addPart(new THREE.BoxGeometry(4.6, 1.85, 3.8), cm.wall, 0, 1.24, -0.15);
    if (pantheon === 'egyptian') {
      addPart(new THREE.BoxGeometry(4.8, 0.24, 4.0), cm.trim, 0, 2.24, -0.15);
      addPart(new THREE.CylinderGeometry(0.16, 0.2, 2.0, 8), cm.trim, -1.7, 1.3, 1.9);
      addPart(new THREE.CylinderGeometry(0.16, 0.2, 2.0, 8), cm.trim, 1.7, 1.3, 1.9);
    } else if (pantheon === 'atlantean') {
      addPart(new THREE.SphereGeometry(1.55, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), cm.roof, 0, 2.15, -0.15);
      addPart(new THREE.TorusGeometry(1.62, 0.08, 6, 18), cm.trim, 0, 2.18, -0.15, Math.PI / 2, 0, 0);
    } else {
      const roof = addPart(new THREE.ConeGeometry(3.2, 1.45, 4), cm.roof, 0, 2.86, -0.15, 0, Math.PI / 4, 0);
      roof.scale.set(1.2, 1, 1.0);
    }
    // Doorway + Banner pole + supply barrels
    addPart(new THREE.BoxGeometry(1.15, 1.35, 0.24), pal.timber, 0, 0.96, 1.82);
    addPart(new THREE.CylinderGeometry(0.06, 0.07, 3.8, 6), cm.trim, 2.1, 2.1, 1.4);
    addPart(new THREE.BoxGeometry(1.05, 0.65, 0.07), teamMat, 2.6, 3.45, 1.4);
    addPart(new THREE.CylinderGeometry(0.26, 0.22, 0.55, 8), pal.timber, -2.0, 0.58, 1.45);
    addPart(new THREE.BoxGeometry(0.55, 0.45, 0.5), pal.goldOre, -1.35, 0.54, 1.65);
    markerRadius = 3.1;
    barHeight = 4.2;
    barWidth = 3.0;
  } else if (kind === 'granary') {
    // Round grain silo + covered threshing porch + wheat sacks
    addPart(new THREE.BoxGeometry(3.4, 0.22, 3.0), cm.base, 0, 0.11, 0);
    addPart(new THREE.CylinderGeometry(1.08, 1.18, 2.05, 14), cm.wall, -0.45, 1.24, 0);
    addPart(new THREE.ConeGeometry(1.28, 1.1, 14), cm.roof, -0.45, 2.8, 0);
    addPart(new THREE.CylinderGeometry(0.68, 0.74, 1.45, 12), cm.wall, 0.92, 0.92, -0.3);
    addPart(new THREE.ConeGeometry(0.84, 0.78, 12), cm.roof, 0.92, 2.02, -0.3);
    addPart(new THREE.BoxGeometry(0.95, 0.42, 0.65), pal.goldOre, 0.85, 0.42, 0.72);
    addPart(new THREE.BoxGeometry(0.7, 0.45, 0.08), teamMat, -0.45, 1.5, 1.15);
    markerRadius = 1.75;
    barHeight = 3.5;
    barWidth = 2.0;
  } else if (kind === 'storehouse' || kind === 'lumber_camp' || kind === 'mining_camp') {
    const isLumber = kind === 'lumber_camp';
    const isMining = kind === 'mining_camp';
    addPart(new THREE.BoxGeometry(3.5, 0.24, 3.0), cm.base, 0, 0.12, 0);
    addPart(new THREE.BoxGeometry(2.6, 1.45, 2.0), cm.wall, -0.15, 0.96, -0.15);
    if (pantheon === 'egyptian') {
      addPart(new THREE.BoxGeometry(2.75, 0.16, 2.15), cm.trim, -0.15, 1.74, -0.15);
    } else {
      addPart(new THREE.ConeGeometry(2.05, 1.05, 4), cm.roof, -0.15, 2.2, -0.15, 0, Math.PI / 4, 0);
    }
    // Lean-to canopy
    addPart(new THREE.BoxGeometry(1.4, 0.1, 1.6), cm.roof, 1.25, 1.35, 0.25, 0, 0, -0.22);
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), pal.timber, 1.75, 0.7, 0.85);
    addPart(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), pal.timber, 1.75, 0.7, -0.45);
    if (isLumber || kind === 'storehouse') {
      for (let i = 0; i < 3; i++) {
        addPart(new THREE.CylinderGeometry(0.14, 0.14, 1.15, 7), pal.timber, 1.05, 0.35 + i * 0.22, 0.45, Math.PI / 2, 0, 0);
      }
    }
    if (isMining || kind === 'storehouse') {
      addPart(new THREE.DodecahedronGeometry(0.36, 0), pal.goldOre, -0.95, 0.46, 1.05);
      addPart(new THREE.DodecahedronGeometry(0.28, 0), pal.goldOre, -0.45, 0.42, 1.15);
    }
    addPart(new THREE.BoxGeometry(0.65, 0.42, 0.06), teamMat, -0.15, 1.18, 0.92);
    markerRadius = 1.75;
    barHeight = 3.1;
    barWidth = 2.0;
  } else if (kind === 'economic_guild') {
    // Atlantean circular colonnade pavilion with glowing crystal centerpiece & supply scales
    addPart(new THREE.CylinderGeometry(2.35, 2.55, 0.32, 12), cm.base, 0, 0.16, 0);
    addPart(new THREE.CylinderGeometry(1.95, 2.1, 0.22, 12), cm.wall, 0, 0.42, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      addPart(
        new THREE.CylinderGeometry(0.11, 0.13, 1.85, 8),
        cm.wall,
        Math.cos(a) * 1.68,
        1.42,
        Math.sin(a) * 1.68
      );
    }
    addPart(new THREE.SphereGeometry(1.85, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), cm.roof, 0, 2.32, 0);
    addPart(new THREE.TorusGeometry(1.9, 0.09, 6, 18), cm.trim, 0, 2.34, 0, Math.PI / 2, 0, 0);
    beaconCrystal = addPart(new THREE.OctahedronGeometry(0.42, 0), pal.crystalGlow, 0, 1.45, 0);
    addPart(new THREE.BoxGeometry(0.85, 0.5, 0.08), teamMat, 0, 1.85, 1.82);
    markerRadius = 2.35;
    barHeight = 4.4;
    barWidth = 2.4;
  } else if (kind === 'counter_barracks') {
    // Atlantean angular tactical barracks with dual spear racks and turquoise domed bastion
    addPart(new THREE.BoxGeometry(4.8, 0.34, 4.2), cm.base, 0, 0.17, 0);
    addPart(new THREE.BoxGeometry(4.2, 1.9, 3.4), cm.wall, 0, 1.28, 0);
    addPart(new THREE.BoxGeometry(4.4, 0.2, 3.6), cm.trim, 0, 2.26, 0);
    addPart(new THREE.ConeGeometry(2.15, 1.25, 6), cm.roof, 0, 2.98, 0);
    // Flanking spear pylons
    addPart(new THREE.BoxGeometry(0.72, 2.55, 0.72), cm.trim, -1.9, 1.55, 1.55);
    addPart(new THREE.BoxGeometry(0.72, 2.55, 0.72), cm.trim, 1.9, 1.55, 1.55);
    addPart(new THREE.OctahedronGeometry(0.28, 0), pal.crystalGlow, -1.9, 3.05, 1.55);
    addPart(new THREE.OctahedronGeometry(0.28, 0), pal.crystalGlow, 1.9, 3.05, 1.55);
    addPart(new THREE.BoxGeometry(1.15, 1.4, 0.14), pal.obsidian, 0, 1.0, 1.72);
    addPart(new THREE.BoxGeometry(0.95, 0.65, 0.08), teamMat, 0, 2.0, 1.78);
    markerRadius = 2.6;
    barHeight = 4.1;
    barWidth = 2.6;
  } else if (kind === 'great_hall') {
    // Norse Retold Great Hall: dragon-prow gabled timber hall with shield wall & glowing hearth
    addPart(new THREE.BoxGeometry(5.2, 0.38, 4.4), pal.stoneDark, 0, 0.19, 0);
    addPart(new THREE.BoxGeometry(4.6, 1.85, 3.4), pal.norseTimber, 0, 1.28, 0);
    const roof = addPart(new THREE.ConeGeometry(3.2, 1.9, 4), pal.norseSlate, 0, 3.1, 0, 0, Math.PI / 4, 0);
    roof.scale.set(1.25, 1, 0.95);
    // Carved ridge dragon prows
    addPart(new THREE.ConeGeometry(0.24, 0.95, 5), pal.gold, -2.05, 4.05, 0, 0, 0, 0.48);
    addPart(new THREE.ConeGeometry(0.24, 0.95, 5), pal.gold, 2.05, 4.05, 0, 0, 0, -0.48);
    // Round shields along facade
    for (const sx of [-1.45, -0.75, 0.75, 1.45]) {
      addPart(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12), teamMat, sx, 1.38, 1.75, Math.PI / 2, 0, 0);
    }
    addPart(new THREE.BoxGeometry(1.0, 1.35, 0.18), pal.timber, 0, 1.02, 1.72);
    addPart(new THREE.BoxGeometry(0.9, 0.55, 0.08), teamMat, 0, 2.45, 1.75);
    markerRadius = 2.75;
    barHeight = 4.4;
    barWidth = 2.8;
  } else if (kind === 'dock') {
    // Timber pier planks over water-level pilings + crane mast + moored skiff hull + team sail
    for (const px of [-1.8, -0.9, 0, 0.9, 1.8]) {
      for (const pz of [-1.4, 0, 1.4]) {
        addPart(new THREE.CylinderGeometry(0.12, 0.14, 1.15, 7), pal.timber, px, 0.55, pz);
      }
    }
    addPart(new THREE.BoxGeometry(4.6, 0.22, 3.6), pal.timber, 0, 0.95, 0);
    addPart(new THREE.BoxGeometry(2.6, 1.55, 2.0), cm.wall, -0.85, 1.8, -0.55);
    addPart(new THREE.ConeGeometry(1.9, 0.95, 4), cm.roof, -0.85, 3.02, -0.55, 0, Math.PI / 4, 0);
    // Loading crane + hanging cargo crate
    addPart(new THREE.CylinderGeometry(0.09, 0.11, 3.0, 8), pal.timber, 1.45, 2.45, 0.4);
    addPart(new THREE.BoxGeometry(1.35, 0.1, 0.12), pal.timber, 1.85, 3.8, 0.4, 0, 0, -0.28);
    addPart(new THREE.BoxGeometry(0.45, 0.45, 0.45), pal.goldOre, 2.2, 2.95, 0.4);
    // Team banner
    addPart(new THREE.BoxGeometry(0.95, 0.58, 0.06), teamMat, 0.95, 3.4, 0.4);
    markerRadius = 2.7;
    barHeight = 4.2;
    barWidth = 2.6;
  } else if (kind === 'monument') {
    // Stepped Egyptian golden-capped monument with lotus pillars & radiant sun orb
    addPart(new THREE.BoxGeometry(3.2, 0.4, 3.2), pal.sandstoneDark, 0, 0.2, 0);
    addPart(new THREE.BoxGeometry(2.4, 0.42, 2.4), pal.sandstone, 0, 0.6, 0);
    addPart(new THREE.BoxGeometry(1.65, 0.45, 1.65), pal.sandstoneDark, 0, 1.02, 0);
    addPart(new THREE.CylinderGeometry(0.45, 0.66, 2.35, 4), pal.sandstone, 0, 2.4, 0, 0, Math.PI / 4, 0);
    addPart(new THREE.ConeGeometry(0.54, 0.85, 4), pal.gold, 0, 3.95, 0, 0, Math.PI / 4, 0);
    // Corner turquoise & gold braziers
    for (const [cx, cz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) {
      addPart(new THREE.CylinderGeometry(0.14, 0.18, 0.9, 6), pal.turquoise, cx, 0.82, cz);
    }
    beaconCrystal = addPart(new THREE.OctahedronGeometry(0.32, 0), pal.goldOre, 0, 4.65, 0);
    addPart(new THREE.BoxGeometry(0.75, 0.45, 0.08), teamMat, 0, 1.85, 0.62);
    markerRadius = 1.85;
    barHeight = 5.0;
    barWidth = 2.0;
  } else if (kind === 'obelisk') {
    // Tall slender Egyptian sandstone & gold-tip scout obelisk
    addPart(new THREE.BoxGeometry(1.5, 0.34, 1.5), pal.sandstoneDark, 0, 0.17, 0);
    addPart(new THREE.BoxGeometry(1.05, 0.32, 1.05), pal.sandstone, 0, 0.5, 0);
    addPart(new THREE.CylinderGeometry(0.24, 0.42, 3.35, 4), pal.sandstone, 0, 2.32, 0, 0, Math.PI / 4, 0);
    addPart(new THREE.ConeGeometry(0.34, 0.72, 4), pal.gold, 0, 4.34, 0, 0, Math.PI / 4, 0);
    beaconCrystal = addPart(new THREE.OctahedronGeometry(0.2, 0), pal.turquoise, 0, 4.92, 0);
    addPart(new THREE.BoxGeometry(0.45, 0.32, 0.06), teamMat, 0, 1.4, 0.4);
    markerRadius = 1.1;
    barHeight = 5.2;
    barWidth = 1.4;
  } else if (kind === 'lighthouse') {
    // Towering tiered Pharos Lighthouse with glowing solar brazier crystal
    addPart(new THREE.BoxGeometry(3.8, 0.5, 3.8), pal.sandstoneDark, 0, 0.25, 0);
    addPart(new THREE.BoxGeometry(2.8, 2.8, 2.8), pal.sandstone, 0, 1.9, 0);
    addPart(new THREE.CylinderGeometry(1.15, 1.38, 2.1, 8), pal.ivory, 0, 4.35, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addPart(new THREE.CylinderGeometry(0.08, 0.09, 1.2, 6), pal.gold, Math.cos(a) * 0.78, 5.95, Math.sin(a) * 0.78);
    }
    addPart(new THREE.ConeGeometry(1.05, 0.85, 8), pal.gold, 0, 6.95, 0);
    beaconCrystal = addPart(new THREE.OctahedronGeometry(0.48, 0), pal.ember, 0, 5.95, 0);
    addPart(new THREE.BoxGeometry(0.95, 0.6, 0.08), teamMat, 0, 2.1, 1.44);
    markerRadius = 2.2;
    barHeight = 7.6;
    barWidth = 2.5;
  } else if (kind === 'wall') {
    // Evolving Wall across all 5 Ages:
    // Age 1: Rough wood palisade -> Age 2: Braced timber/bronze -> Age 3: Stone masonry
    // Age 4: Fortified Citadel / Orichalcum -> Age 5: Era dos Deuses gilded battlements & glowing beacons
    const wallHeight = age >= 5 ? 2.85 : age >= 4 ? 2.55 : age >= 3 ? 2.2 : age >= 2 ? 1.92 : 1.65;
    const isWood = age <= 2 && pantheon !== 'atlantean';
    const bodyMat = isWood
      ? pal.timber
      : age >= 4 && pantheon === 'atlantean'
        ? pal.orichalcum
        : cm.wall;
    addPart(new THREE.BoxGeometry(2.85, 0.26, 1.05), cm.base, 0, 0.13, 0);
    addPart(new THREE.BoxGeometry(2.7, wallHeight, 0.82), bodyMat, 0, 0.26 + wallHeight / 2, 0);
    if (age >= 2) {
      // Horizontal reinforcement cross-band / stone stringcourse
      addPart(
        new THREE.BoxGeometry(2.78, 0.18, 0.92),
        age >= 4 ? pal.gold : cm.trim,
        0,
        0.26 + wallHeight * 0.74,
        0
      );
    }
    // Battlements / Crenellations
    for (const cx of [-0.95, 0, 0.95]) {
      addPart(
        isWood ? new THREE.ConeGeometry(0.24, 0.55, 5) : new THREE.BoxGeometry(0.55, 0.38, 0.92),
        age >= 5 ? pal.gold : age >= 4 ? cm.trim : cm.base,
        cx,
        0.26 + wallHeight + 0.19,
        0
      );
    }
    if (age >= 4) {
      // Flanking reinforced end-buttresses
      addPart(new THREE.BoxGeometry(0.42, wallHeight + 0.28, 1.04), cm.trim, -1.28, 0.26 + wallHeight * 0.5, 0);
      addPart(new THREE.BoxGeometry(0.42, wallHeight + 0.28, 1.04), cm.trim, 1.28, 0.26 + wallHeight * 0.5, 0);
    }
    if (age >= 5) {
      // Era V gilded corner finials
      addPart(new THREE.OctahedronGeometry(0.22, 0), cm.accent, -1.28, 0.26 + wallHeight + 0.56, 0);
      addPart(new THREE.OctahedronGeometry(0.22, 0), cm.accent, 1.28, 0.26 + wallHeight + 0.56, 0);
    }
    addPart(new THREE.BoxGeometry(0.6, 0.4, 0.08), teamMat, 0, 0.26 + wallHeight * 0.55, 0.46);
    markerRadius = 1.45;
    barHeight = wallHeight + (age >= 5 ? 1.35 : 1.0);
    barWidth = 1.8;
  } else if (kind === 'gate') {
    // Fortified arched gatehouse evolving cleanly from Age 1 -> Age 5
    const gateH = age >= 5 ? 3.2 : age >= 4 ? 2.85 : age >= 3 ? 2.45 : age >= 2 ? 2.18 : 1.92;
    const isWood = age <= 2 && pantheon !== 'atlantean';
    const pillarMat = isWood ? pal.timber : age >= 4 && pantheon === 'atlantean' ? pal.orichalcum : cm.base;
    addPart(new THREE.BoxGeometry(1.05, gateH, 1.25), pillarMat, -1.25, gateH / 2, 0);
    addPart(new THREE.BoxGeometry(1.05, gateH, 1.25), pillarMat, 1.25, gateH / 2, 0);
    addPart(new THREE.BoxGeometry(3.45, 0.68, 1.12), isWood ? pal.timber : cm.wall, 0, gateH + 0.2, 0);
    addPart(new THREE.ConeGeometry(0.74, 0.74, 4), age >= 5 ? pal.gold : cm.roof, -1.25, gateH + 0.74, 0, 0, Math.PI / 4, 0);
    addPart(new THREE.ConeGeometry(0.74, 0.74, 4), age >= 5 ? pal.gold : cm.roof, 1.25, gateH + 0.74, 0, 0, Math.PI / 4, 0);
    if (age >= 2) {
      addPart(new THREE.BoxGeometry(3.55, 0.18, 1.22), age >= 4 ? pal.gold : cm.trim, 0, gateH + 0.56, 0);
    }
    if (age >= 3) {
      // Flanking watch parapet shields on towers
      addPart(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10), cm.trim, -1.25, gateH * 0.65, 0.65, Math.PI / 2, 0, 0);
      addPart(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10), cm.trim, 1.25, gateH * 0.65, 0.65, Math.PI / 2, 0, 0);
    }
    if (age >= 4) {
      // Fortified crest & glowing tower lanterns
      addPart(new THREE.BoxGeometry(1.15, 0.42, 0.9), cm.trim, 0, gateH + 0.8, 0);
      addPart(new THREE.OctahedronGeometry(0.22, 0), pal.ember, -1.25, gateH + 1.25, 0);
      addPart(new THREE.OctahedronGeometry(0.22, 0), pal.ember, 1.25, gateH + 1.25, 0);
    }
    if (age >= 5) {
      // Era V Divine Gatehouse Crown
      beaconCrystal = addPart(new THREE.OctahedronGeometry(0.32, 0), cm.accent, 0, gateH + 1.48, 0);
    }
    // Portcullis bars overhead
    addPart(new THREE.BoxGeometry(1.5, 0.38, 0.16), age >= 4 ? pal.gold : pal.steel, 0, gateH - 0.35, 0);
    addPart(new THREE.BoxGeometry(0.85, 0.52, 0.08), teamMat, 0, gateH + 0.25, 0.62);
    markerRadius = 1.65;
    barHeight = gateH + (age >= 5 ? 1.95 : 1.5);
    barWidth = 2.2;
  } else if (kind === 'mirror_tower') {
    // Atlantean Helios Mirror Tower: slender orichalcum spire with golden parabolic sun mirror & radiant crystal
    addPart(new THREE.CylinderGeometry(1.45, 1.72, 0.44, 10), pal.obsidian, 0, 0.22, 0);
    addPart(new THREE.CylinderGeometry(0.88, 1.18, 3.4, 10), pal.ivory, 0, 2.1, 0);
    addPart(new THREE.CylinderGeometry(1.02, 0.94, 0.34, 10), pal.orichalcum, 0, 3.9, 0);
    // Reflective Golden Mirror Dish + Solar Crystal Focus
    const dish = addPart(new THREE.CylinderGeometry(0.85, 0.52, 0.26, 12), pal.gold, 0, 4.75, 0, Math.PI / 3, 0, 0);
    dish.castShadow = true;
    beaconCrystal = addPart(new THREE.OctahedronGeometry(0.45, 0), pal.ember, 0, 4.95, 0.35);
    addPart(new THREE.BoxGeometry(0.72, 0.48, 0.08), teamMat, 0, 2.2, 1.08);
    markerRadius = 1.8;
    barHeight = 5.8;
    barWidth = 2.1;
  } else if (kind === 'asgard_hill_fort') {
    // Freyr's Asgardian Hill Fort: Norse stone keep reinforced with glowing golden Asgardian runes & watch spires
    addPart(new THREE.BoxGeometry(6.6, 0.52, 6.6), pal.stoneDark, 0, 0.26, 0);
    addPart(new THREE.BoxGeometry(5.6, 2.8, 5.6), pal.norseTimber, 0, 1.9, 0);
    for (const [cx, cz] of [[-2.35, -2.35], [2.35, -2.35], [-2.35, 2.35], [2.35, 2.35]]) {
      addPart(new THREE.CylinderGeometry(0.68, 0.78, 3.85, 8), pal.stoneDark, cx, 2.4, cz);
      addPart(new THREE.ConeGeometry(0.88, 1.25, 8), pal.gold, cx, 4.92, cz);
    }
    const hallRoof = addPart(new THREE.ConeGeometry(3.4, 2.1, 4), pal.gold, 0, 4.35, 0, 0, Math.PI / 4, 0);
    hallRoof.scale.set(1.1, 1, 1.1);
    beaconCrystal = addPart(new THREE.OctahedronGeometry(0.45, 0), pal.goldOre, 0, 5.8, 0);
    addPart(new THREE.BoxGeometry(1.3, 0.85, 0.1), teamMat, 0, 2.1, 2.88);
    markerRadius = 3.6;
    barHeight = 6.4;
    barWidth = 3.2;
  } else if (kind === 'sky_passage') {
    // Uranos Sky Passage: Floating orichalcum portal ring over marble dais + spinning cosmic torus
    addPart(new THREE.CylinderGeometry(2.15, 2.45, 0.36, 12), pal.obsidian, 0, 0.18, 0);
    addPart(new THREE.CylinderGeometry(1.75, 1.9, 0.22, 12), pal.ivory, 0, 0.47, 0);
    addPart(new THREE.CylinderGeometry(0.22, 0.26, 2.9, 8), pal.orichalcum, -1.35, 1.9, 0);
    addPart(new THREE.CylinderGeometry(0.22, 0.26, 2.9, 8), pal.orichalcum, 1.35, 1.9, 0);
    addPart(new THREE.TorusGeometry(1.42, 0.18, 10, 24), pal.orichalcum, 0, 2.25, 0);
    vortexRing = addPart(new THREE.TorusGeometry(1.06, 0.1, 8, 24), pal.crystalGlow, 0, 2.25, 0);
    beaconCrystal = addPart(new THREE.OctahedronGeometry(0.44, 0), pal.iceBlue, 0, 2.25, 0);
    addPart(new THREE.BoxGeometry(0.75, 0.45, 0.08), teamMat, 0, 0.8, 1.85);
    markerRadius = 2.3;
    barHeight = 4.2;
    barWidth = 2.4;
  } else if (kind === 'wonder') {
    // Monumental Age IV/V Wonder tailored per Pantheon / Major God
    addPart(new THREE.BoxGeometry(7.8, 0.56, 7.8), cm.base, 0, 0.28, 0);
    addPart(new THREE.BoxGeometry(6.6, 0.52, 6.6), cm.wall, 0, 0.82, 0);
    if (pantheon === 'egyptian') {
      // Colossal Pyramid / Sun Sanctuary
      addPart(new THREE.ConeGeometry(4.2, 5.4, 4), pal.sandstone, 0, 3.75, 0, 0, Math.PI / 4, 0);
      addPart(new THREE.ConeGeometry(1.25, 1.65, 4), pal.gold, 0, 5.95, 0, 0, Math.PI / 4, 0);
      beaconCrystal = addPart(new THREE.OctahedronGeometry(0.65, 0), pal.goldOre, 0, 7.35, 0);
    } else if (pantheon === 'norse' || pantheon === 'jotunn') {
      // Grand Tiered Valhalla Timber & Gold Stave Spire
      addPart(new THREE.BoxGeometry(5.2, 2.4, 4.4), pal.norseTimber, 0, 2.25, 0);
      addPart(new THREE.ConeGeometry(3.5, 2.2, 4), pal.gold, 0, 4.45, 0, 0, Math.PI / 4, 0);
      addPart(new THREE.ConeGeometry(2.2, 2.3, 4), pal.norseSlate, 0, 5.9, 0, 0, Math.PI / 4, 0);
      beaconCrystal = addPart(new THREE.OctahedronGeometry(0.58, 0), pal.iceBlue, 0, 7.45, 0);
    } else if (pantheon === 'atlantean') {
      // Orichalcum Celestial Ziggurat & Floating Crown
      addPart(new THREE.CylinderGeometry(2.8, 3.4, 1.6, 8), pal.ivory, 0, 1.85, 0);
      addPart(new THREE.CylinderGeometry(2.0, 2.6, 1.8, 8), pal.orichalcum, 0, 3.55, 0);
      addPart(new THREE.SphereGeometry(1.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), pal.turquoise, 0, 4.45, 0);
      vortexRing = addPart(new THREE.TorusGeometry(2.45, 0.14, 10, 28), pal.crystalGlow, 0, 5.2, 0, Math.PI / 2, 0, 0);
      beaconCrystal = addPart(new THREE.OctahedronGeometry(0.7, 0), pal.crystalGlow, 0, 6.75, 0);
    } else if (pantheon === 'chinese') {
      // Colossal Chinese Imperial Pagoda of the Immortal Pillars
      for (let tier = 0; tier < 5; tier++) {
        const s = 1 - tier * 0.15;
        const baseY = 1.2 + tier * 1.15;
        addPart(new THREE.CylinderGeometry(2.2 * s, 2.35 * s, 0.85, 8), pal.crimson, 0, baseY + 0.35, 0);
        addPart(new THREE.ConeGeometry(2.95 * s, 0.65, 8), tier % 2 === 0 ? pal.jade : pal.gold, 0, baseY + 0.95, 0);
      }
      beaconCrystal = addPart(new THREE.OctahedronGeometry(0.68, 0), pal.goldOre, 0, 7.65, 0);
    } else {
      // Greek Colossal Pantheon / Zeus Gold-Ivory Rotunda
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        addPart(new THREE.CylinderGeometry(0.18, 0.22, 3.1, 8), pal.marble, Math.cos(a) * 2.55, 2.6, Math.sin(a) * 2.55);
      }
      addPart(new THREE.CylinderGeometry(2.2, 2.4, 2.8, 12), pal.ivory, 0, 2.45, 0);
      addPart(new THREE.SphereGeometry(2.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), pal.gold, 0, 4.15, 0);
      beaconCrystal = addPart(new THREE.OctahedronGeometry(0.65, 0), pal.goldOre, 0, 7.2, 0);
    }
    void majorGod;
    addPart(new THREE.BoxGeometry(1.6, 0.95, 0.12), teamMat, 0, 2.2, 3.35);
    markerRadius = 4.4;
    barHeight = 8.2;
    barWidth = 3.8;
  }

  return { group, markerRadius, barHeight, barWidth, beaconCrystal, vortexRing };
}
