import { beforeAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createBuildingMesh, createMaterialPalette, MaterialPalette } from '../models';
import {
  buildEgyptianArchBuilding,
  EGYPT_ARCH_THEMES,
  EgyptianArchBuildingKey,
  EgyptianArchGodKey,
  isEgyptianArchBuilding,
  resolveEgyptianArchGod,
} from '../../civilizacao/egipcios/egyptianArchitectureSuite';
import { AgeLevel } from '../types';

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

const ALL_EGYPT_SUITE_BUILDINGS: EgyptianArchBuildingKey[] = [
  'siege_works',
  'fortress',
  'tower',
  'farm',
  'titan_gate',
  'market',
  'armory',
  'gate',
  'wall',
  'barracks',
  'stable',
  'archery_range',
  'house',
];

const EGYPT_GODS: Array<{ label: string; key: EgyptianArchGodKey }> = [
  { label: 'Rá', key: 'ra' },
  { label: 'Ísis', key: 'isis' },
  { label: 'Set', key: 'set' },
];

describe('Egyptian Architecture Suite (T1-T5 across Rá, Ísis, Set)', () => {
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

  it('resolves Rá, Ísis, Set, and Seth god keys cleanly', () => {
    expect(resolveEgyptianArchGod('Rá')).toBe('ra');
    expect(resolveEgyptianArchGod('Ra')).toBe('ra');
    expect(resolveEgyptianArchGod('Ísis')).toBe('isis');
    expect(resolveEgyptianArchGod('Isis')).toBe('isis');
    expect(resolveEgyptianArchGod('Set')).toBe('set');
    expect(resolveEgyptianArchGod('Seth')).toBe('set');
    expect(resolveEgyptianArchGod(undefined)).toBe('ra');
    expect(Object.keys(EGYPT_ARCH_THEMES)).toEqual(['ra', 'isis', 'set']);
  });

  it('builds all 13 Egyptian suite buildings across all 3 gods with visible T1 -> T5 evolution', () => {
    for (const kind of ALL_EGYPT_SUITE_BUILDINGS) {
      expect(isEgyptianArchBuilding(kind)).toBe(true);
      for (const god of EGYPT_GODS) {
        const m1 = createBuildingMesh(kind, 'player', pal, false, 'egyptian', god.label, 1);
        const m5 = createBuildingMesh(kind, 'player', pal, false, 'egyptian', god.label, 5);
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

  it('wires all real-time animated sub-parts (cranes, windmills, waterwheel, crops, vortex, oil, gates, flags, flames)', () => {
    const siege = createBuildingMesh('siege_works', 'player', pal, false, 'egyptian', 'Rá', 4);
    expect(Array.isArray(siege.userData.greekCranes)).toBe(true);
    expect((siege.userData.greekCranes as THREE.Object3D[]).length).toBeGreaterThan(0);

    const farmT3 = createBuildingMesh('farm', 'player', pal, false, 'egyptian', 'Ísis', 3);
    expect(Array.isArray(farmT3.userData.greekWindmills)).toBe(true);
    expect((farmT3.userData.greekWindmills as THREE.Object3D[]).length).toBeGreaterThan(0);
    expect(Array.isArray(farmT3.userData.egyptCrops)).toBe(true);
    expect((farmT3.userData.egyptCrops as THREE.Object3D[]).length).toBeGreaterThan(0);

    const armoryT3 = createBuildingMesh('armory', 'player', pal, false, 'egyptian', 'Set', 3);
    expect(Array.isArray(armoryT3.userData.egyptWaterwheels)).toBe(true);
    expect((armoryT3.userData.egyptWaterwheels as THREE.Object3D[]).length).toBeGreaterThan(0);
    expect(Array.isArray(armoryT3.userData.egyptArchFlames)).toBe(true);
    expect((armoryT3.userData.egyptArchFlames as THREE.Object3D[]).length).toBeGreaterThan(0);

    const titan = createBuildingMesh('titan_gate', 'player', pal, false, 'egyptian', 'Rá', 5);
    expect(Array.isArray(titan.userData.egyptVortexPairs)).toBe(true);
    expect((titan.userData.egyptVortexPairs as unknown[]).length).toBeGreaterThan(0);
    expect(titan.userData.beaconCrystal).toBeDefined();
    expect(titan.userData.vortexRing).toBeDefined();
    expect(Array.isArray(titan.userData.egyptFlags)).toBe(true);

    const towerT5 = createBuildingMesh('tower', 'player', pal, false, 'egyptian', 'Set', 5);
    expect(Array.isArray(towerT5.userData.egyptOilStreams)).toBe(true);
    expect((towerT5.userData.egyptOilStreams as THREE.Object3D[]).length).toBeGreaterThan(0);
    expect(towerT5.userData.metropolisHalo).toBeDefined();
    expect(towerT5.userData.metropolisCrystal).toBeDefined();

    const gate = createBuildingMesh('gate', 'player', pal, false, 'egyptian', 'Ísis', 4);
    expect(Array.isArray(gate.userData.greekGates)).toBe(true);
    const gatePairs = gate.userData.greekGates as Array<{ leftPivot: THREE.Object3D; rightPivot: THREE.Object3D }>;
    expect(gatePairs.length).toBe(1);
    expect(gatePairs[0].leftPivot).toBeDefined();
    expect(gatePairs[0].rightPivot).toBeDefined();

    const fortressT5 = createBuildingMesh('fortress', 'player', pal, false, 'egyptian', 'Rá', 5);
    expect(fortressT5.userData.metropolisHalo).toBeDefined();
    expect(fortressT5.userData.metropolisCrystal).toBeDefined();
    expect(Array.isArray(fortressT5.userData.egyptFlags)).toBe(true);
  });

  it('produces strict T1 -> T5 height & detail progression on wall, gate, tower, and house', () => {
    const ages: AgeLevel[] = [1, 2, 3, 4, 5];

    const wallStats = ages.map((age) => measureMesh(buildEgyptianArchBuilding('wall', 'ra', age, false).root));
    for (let i = 1; i < wallStats.length; i++) {
      expect(wallStats[i].maxY, `Egyptian wall T${i + 1} taller than T${i}`).toBeGreaterThan(wallStats[i - 1].maxY);
    }

    const gateStats = ages.map((age) => measureMesh(buildEgyptianArchBuilding('gate', 'isis', age, false).root));
    for (let i = 1; i < gateStats.length; i++) {
      expect(gateStats[i].maxY, `Egyptian gate T${i + 1} taller than T${i}`).toBeGreaterThan(gateStats[i - 1].maxY);
    }

    const towerStats = ages.map((age) => {
      const built = buildEgyptianArchBuilding('tower', 'set', age, false);
      return { built, ...measureMesh(built.root) };
    });
    for (let i = 1; i < towerStats.length; i++) {
      expect(towerStats[i].meshCount, `Egyptian tower T${i + 1} richer than T${i}`).toBeGreaterThan(
        towerStats[i - 1].meshCount
      );
    }
    expect(towerStats[4].built.metropolisHalo).toBeDefined();
    expect(towerStats[4].built.metropolisCrystal).toBeDefined();

    const houseStats = ages.map((age) => measureMesh(buildEgyptianArchBuilding('house', 'ra', age, false).root));
    expect(houseStats[4].meshCount).toBeGreaterThan(houseStats[0].meshCount);
    expect(houseStats[4].maxY).toBeGreaterThan(houseStats[0].maxY);
  });
});
