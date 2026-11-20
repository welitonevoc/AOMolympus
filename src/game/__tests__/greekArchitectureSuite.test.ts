import { beforeAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createBuildingMesh, createMaterialPalette, MaterialPalette } from '../models';
import {
  buildGreekArchBuilding,
  GREEK_ARCH_THEMES,
  GreekArchBuildingKey,
  GreekArchGodKey,
  isGreekArchBuilding,
  resolveGreekArchGod,
} from '../../civilizacao/gregos/greekArchitectureSuite';
import { AgeLevel } from '../types';

function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    save: () => {},
    restore: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
  };
  return {
    width: 256,
    height: 256,
    getContext: () => ctx,
  };
}

function measureMesh(root: THREE.Object3D): { meshCount: number; maxY: number } {
  root.updateMatrixWorld(true);
  let meshCount = 0;
  let maxY = 0;
  const box = new THREE.Box3();
  root.traverse((obj) => {
    if (obj.userData?.ignoreRaycast) return;
    const m = obj as THREE.Mesh;
    if (m.isMesh && m.geometry) {
      meshCount++;
      box.setFromObject(m);
      if (!box.isEmpty() && box.max.y > maxY) {
        maxY = box.max.y;
      }
    }
  });
  return { meshCount, maxY };
}

const ALL_SUITE_BUILDINGS: GreekArchBuildingKey[] = [
  'barracks',
  'stable',
  'archery_range',
  'siege_works',
  'fortress',
  'tower',
  'farm',
  'titan_gate',
  'market',
  'armory',
  'wall',
  'gate',
];

const GREEK_GODS: Array<{ label: string; key: GreekArchGodKey }> = [
  { label: 'Zeus', key: 'zeus' },
  { label: 'Poseidon', key: 'poseidon' },
  { label: 'Hades', key: 'hades' },
];

describe('Greek Architecture Suite (T1-T5 across Zeus, Poseidon, Hades)', () => {
  let pal: MaterialPalette;

  beforeAll(() => {
    if (typeof globalThis.document === 'undefined') {
      (globalThis as unknown as { document: { createElement: (tag: string) => unknown } }).document = {
        createElement: () => createMockCanvas(),
      };
    }
    const tex = new THREE.CanvasTexture(createMockCanvas() as unknown as HTMLCanvasElement);
    pal = createMaterialPalette(tex, tex, tex, tex, 0x38bdf8);
  });

  it('resolves Zeus, Poseidon, and Hades god keys cleanly', () => {
    expect(resolveGreekArchGod('Zeus')).toBe('zeus');
    expect(resolveGreekArchGod('Poseidon')).toBe('poseidon');
    expect(resolveGreekArchGod('Hades')).toBe('hades');
    expect(resolveGreekArchGod(undefined)).toBe('zeus');
    expect(Object.keys(GREEK_ARCH_THEMES)).toEqual(['zeus', 'poseidon', 'hades']);
  });

  it('builds all 12 Greek suite buildings across all 3 gods and all 5 ages with visible evolution', () => {
    for (const kind of ALL_SUITE_BUILDINGS) {
      expect(isGreekArchBuilding(kind)).toBe(true);
      for (const god of GREEK_GODS) {
        const m1 = createBuildingMesh(kind, 'player', pal, false, 'greek', god.label, 1);
        const m5 = createBuildingMesh(kind, 'player', pal, false, 'greek', god.label, 5);
        const s1 = measureMesh(m1);
        const s5 = measureMesh(m5);

        expect(s1.meshCount, `${god.label} ${kind} T1 has geometry`).toBeGreaterThan(4);
        expect(
          s5.meshCount > s1.meshCount || s5.maxY > s1.maxY + 0.05,
          `${god.label} ${kind} must evolve from T1 to T5`
        ).toBe(true);
      }
    }
  });

  it('wires all real-time animated sub-parts (cranes, windmills, waterwheel, portal rings, hinged gates, flames)', () => {
    const siege = createBuildingMesh('siege_works', 'player', pal, false, 'greek', 'Zeus', 4);
    expect(Array.isArray(siege.userData.greekCranes)).toBe(true);
    expect((siege.userData.greekCranes as THREE.Object3D[]).length).toBeGreaterThan(0);
    expect(Array.isArray(siege.userData.tcFlames)).toBe(true);

    const farmT3 = createBuildingMesh('farm', 'player', pal, false, 'greek', 'Poseidon', 3);
    expect(Array.isArray(farmT3.userData.greekWindmills)).toBe(true);
    expect((farmT3.userData.greekWindmills as THREE.Object3D[]).length).toBe(1);

    const armoryT3 = createBuildingMesh('armory', 'player', pal, false, 'greek', 'Hades', 3);
    expect(Array.isArray(armoryT3.userData.greekWindmills)).toBe(true);
    expect((armoryT3.userData.greekWindmills as THREE.Object3D[]).length).toBe(1);
    expect(Array.isArray(armoryT3.userData.tcFlames)).toBe(true);

    const titan = createBuildingMesh('titan_gate', 'player', pal, false, 'greek', 'Zeus', 5);
    expect(Array.isArray(titan.userData.greekPortalRings)).toBe(true);
    expect((titan.userData.greekPortalRings as THREE.Object3D[]).length).toBe(2);
    expect(titan.userData.beaconCrystal).toBeDefined();

    const gate = createBuildingMesh('gate', 'player', pal, false, 'greek', 'Poseidon', 4);
    expect(Array.isArray(gate.userData.greekGates)).toBe(true);
    const gatePairs = gate.userData.greekGates as Array<{ leftPivot: THREE.Object3D; rightPivot: THREE.Object3D }>;
    expect(gatePairs.length).toBe(1);
    expect(gatePairs[0].leftPivot).toBeDefined();
    expect(gatePairs[0].rightPivot).toBeDefined();
  });

  it('produces distinct T1 -> T5 fortress progression including T5 divine halo & crystal', () => {
    const heights = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) => {
      const built = buildGreekArchBuilding('fortress', 'zeus', age, false);
      return { age, built, ...measureMesh(built.root) };
    });

    expect(heights[1].meshCount).toBeGreaterThan(heights[0].meshCount);
    expect(heights[4].maxY).toBeGreaterThan(heights[2].maxY);
    expect(heights[4].built.metropolisHalo).toBeDefined();
    expect(heights[4].built.metropolisCrystal).toBeDefined();
  });
});
