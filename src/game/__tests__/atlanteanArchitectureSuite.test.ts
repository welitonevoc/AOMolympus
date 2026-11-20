import { beforeAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createBuildingMesh, createMaterialPalette, MaterialPalette } from '../models';
import { hasBespokeAgeEvolution } from '../models/buildingAgeEvolution';
import { AgeLevel } from '../types';
import {
  ATLANTEAN_ARCH_BUILDING_META,
  ATLANTEAN_ARCH_THEMES,
  AtlanteanArchBuildingKey,
  isAtlanteanArchBuilding,
  resolveAtlanteanArchGod,
} from '../../civilizacao/atlantes/atlanteanArchitectureSuite';

function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    arc: () => {},
    ellipse: () => {},
    fill: () => {},
    stroke: () => {},
    fillText: () => {},
    strokeText: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    setLineDash: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
  };
  return {
    width: 256,
    height: 256,
    getContext: () => ctx,
  };
}

const ALL_ATLANTEAN_ARCH_BUILDINGS: AtlanteanArchBuildingKey[] = [
  'siege_works',
  'counter_barracks',
  'tower',
  'mirror_tower',
  'farm',
  'titan_gate',
  'market',
  'armory',
  'wall',
  'gate',
  'barracks',
  'stable',
  'archery_range',
  'house',
];

function countMeshes(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) count++;
  });
  return count;
}

function measureMaxY(root: THREE.Object3D): number {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  return box.max.y;
}

describe('Atlantean Architecture Suite (Kronos, Oranos & Gaia • T1–T5)', () => {
  let pal: MaterialPalette;

  beforeAll(() => {
    if (typeof globalThis.document === 'undefined') {
      (globalThis as unknown as { document: { createElement: (tag: string) => unknown } }).document = {
        createElement: () => createMockCanvas(),
      };
    }
    const tex = new THREE.CanvasTexture(createMockCanvas() as unknown as HTMLCanvasElement);
    pal = createMaterialPalette(tex, tex, tex, tex, 0xfbbf24);
  });

  it('resolves all Atlantean major god aliases accurately', () => {
    expect(resolveAtlanteanArchGod('Cronos')).toBe('kronos');
    expect(resolveAtlanteanArchGod('Kronos')).toBe('kronos');
    expect(resolveAtlanteanArchGod('Urano')).toBe('oranos');
    expect(resolveAtlanteanArchGod('Oranos')).toBe('oranos');
    expect(resolveAtlanteanArchGod('Gaia')).toBe('gaia');
    expect(resolveAtlanteanArchGod('')).toBe('kronos');
    expect(Object.keys(ATLANTEAN_ARCH_THEMES)).toEqual(['kronos', 'oranos', 'gaia']);
  });

  it('registers all 14 Atlantean structures as bespoke evolving models', () => {
    for (const kind of ALL_ATLANTEAN_ARCH_BUILDINGS) {
      expect(isAtlanteanArchBuilding(kind)).toBe(true);
      expect(hasBespokeAgeEvolution('atlantean', kind)).toBe(true);
    }
  });

  it('builds every Atlantean structure across Kronos, Oranos and Gaia with visible tier growth', () => {
    const gods = ['Cronos', 'Urano', 'Gaia'] as const;

    for (const god of gods) {
      for (const kind of ALL_ATLANTEAN_ARCH_BUILDINGS) {
        const meta = ATLANTEAN_ARCH_BUILDING_META[kind];
        const minAge = meta.minTier as AgeLevel;
        const low = createBuildingMesh(kind, 'player', pal, false, 'atlantean', god, minAge);
        const high = createBuildingMesh(kind, 'player', pal, false, 'atlantean', god, 5);

        const lowCount = countMeshes(low);
        const highCount = countMeshes(high);

        expect(lowCount, `${god} ${kind} minTier`).toBeGreaterThan(8);
        expect(highCount, `${god} ${kind} T5 > T${minAge}`).toBeGreaterThan(lowCount);
      }
    }
  });

  it('evolves Atlantean tower, wall, gate, and house progressively across T1→T5', () => {
    const towerCounts = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) =>
      countMeshes(createBuildingMesh('tower', 'player', pal, false, 'atlantean', 'Cronos', age))
    );
    for (let i = 1; i < towerCounts.length; i++) {
      expect(towerCounts[i], `tower T${i + 1} > T${i}`).toBeGreaterThan(towerCounts[i - 1]);
    }

    const wallHeights = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) =>
      measureMaxY(createBuildingMesh('wall', 'player', pal, false, 'atlantean', 'Urano', age))
    );
    for (let i = 1; i < wallHeights.length; i++) {
      expect(wallHeights[i], `wall T${i + 1} taller than T${i}`).toBeGreaterThan(wallHeights[i - 1]);
    }

    const gateHeights = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) =>
      measureMaxY(createBuildingMesh('gate', 'player', pal, false, 'atlantean', 'Gaia', age))
    );
    for (let i = 1; i < gateHeights.length; i++) {
      expect(gateHeights[i], `gate T${i + 1} taller than T${i}`).toBeGreaterThan(gateHeights[i - 1]);
    }

    const houseCounts = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) =>
      countMeshes(createBuildingMesh('house', 'player', pal, false, 'atlantean', 'Cronos', age))
    );
    for (let i = 1; i < houseCounts.length; i++) {
      expect(houseCounts[i], `house T${i + 1} > T${i}`).toBeGreaterThan(houseCounts[i - 1]);
    }
  });

  it('exposes real-time animated userData refs for all specialized Atlantean structures', () => {
    const gate = createBuildingMesh('gate', 'player', pal, false, 'atlantean', 'Cronos', 5);
    expect(Array.isArray(gate.userData.atlanteanSlidingGates)).toBe(true);
    expect((gate.userData.atlanteanSlidingGates as unknown[]).length).toBeGreaterThan(0);

    const titanGate = createBuildingMesh('titan_gate', 'player', pal, false, 'atlantean', 'Urano', 5);
    expect(Array.isArray(titanGate.userData.atlanteanGyroscopes)).toBe(true);
    expect((titanGate.userData.atlanteanGyroscopes as unknown[]).length).toBeGreaterThan(0);
    expect(titanGate.userData.vortexRing).toBeDefined();
    expect(titanGate.userData.beaconCrystal).toBeDefined();

    const armory = createBuildingMesh('armory', 'player', pal, false, 'atlantean', 'Cronos', 4);
    expect(Array.isArray(armory.userData.atlanteanPresses)).toBe(true);
    expect((armory.userData.atlanteanPresses as unknown[]).length).toBeGreaterThan(0);

    const mirrorTower = createBuildingMesh('mirror_tower', 'player', pal, false, 'atlantean', 'Urano', 5);
    expect(Array.isArray(mirrorTower.userData.atlanteanMirrors)).toBe(true);
    expect((mirrorTower.userData.atlanteanMirrors as unknown[]).length).toBeGreaterThan(0);
    expect(mirrorTower.userData.metropolisHalo).toBeDefined();
    expect(mirrorTower.userData.metropolisCrystal).toBeDefined();

    const farm = createBuildingMesh('farm', 'player', pal, false, 'atlantean', 'Gaia', 4);
    expect(Array.isArray(farm.userData.egyptCrops)).toBe(true);
    expect((farm.userData.egyptCrops as unknown[]).length).toBeGreaterThan(0);
    expect(Array.isArray(farm.userData.atlanteanFountains)).toBe(true);
    expect((farm.userData.atlanteanFountains as unknown[]).length).toBeGreaterThan(0);

    const market = createBuildingMesh('market', 'player', pal, false, 'atlantean', 'Cronos', 5);
    expect(Array.isArray(market.userData.atlanteanRotators)).toBe(true);
    expect((market.userData.atlanteanRotators as unknown[]).length).toBeGreaterThan(0);
    expect(Array.isArray(market.userData.atlanteanFlames)).toBe(true);

    const arsenal = createBuildingMesh('counter_barracks', 'player', pal, false, 'atlantean', 'Cronos', 5);
    expect(Array.isArray(arsenal.userData.atlanteanRotators)).toBe(true);
    expect(Array.isArray(arsenal.userData.atlanteanFloaters)).toBe(true);
  });
});
