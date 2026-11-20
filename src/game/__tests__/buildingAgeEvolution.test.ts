import { beforeAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createBuildingMesh, createMaterialPalette, MaterialPalette } from '../models';
import { getCivBuildingSpec } from '../divineData';
import { AgeLevel, BUILDING_STATS, BuildingKind, PANTHEONS, PantheonId } from '../types';

function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    roundRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    fill: () => {},
    stroke: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    fillText: () => {},
    strokeText: () => {},
    setLineDash: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    getImageData: (_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(Math.max(4, w * h * 4)),
    }),
    putImageData: () => {},
  };
  return {
    width: 256,
    height: 256,
    getContext: () => ctx,
  };
}

function measureVisualMetrics(root: THREE.Object3D): { meshCount: number; maxY: number } {
  root.updateMatrixWorld(true);
  let meshCount = 0;
  let maxY = 0;
  const box = new THREE.Box3();
  root.traverse((obj) => {
    if (obj.userData?.ignoreRaycast) return;
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      meshCount++;
      box.setFromObject(mesh);
      if (!box.isEmpty() && box.max.y > maxY) {
        maxY = box.max.y;
      }
    }
  });
  return { meshCount, maxY };
}

const CORE_PANTHEONS: PantheonId[] = ['greek', 'egyptian', 'norse', 'atlantean', 'chinese'];
const ALL_BUILDING_KINDS = Object.keys(BUILDING_STATS) as BuildingKind[];

describe('Universal Building Age Evolution (Ages I -> V across all civilizations)', () => {
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

  it('evolves EVERY building kind visually from Era I to Era V across ALL 5 playable civilizations', () => {
    for (const pantheon of CORE_PANTHEONS) {
      const god = PANTHEONS[pantheon].deity;
      for (const kind of ALL_BUILDING_KINDS) {
        const m1 = createBuildingMesh(kind, 'player', pal, false, pantheon, god, 1);
        const m3 = createBuildingMesh(kind, 'player', pal, false, pantheon, god, 3);
        const m5 = createBuildingMesh(kind, 'player', pal, false, pantheon, god, 5);

        expect(m1.userData.ageTier, `${pantheon} ${kind} T1 tag`).toBe(1);
        expect(m3.userData.ageTier, `${pantheon} ${kind} T3 tag`).toBe(3);
        expect(m5.userData.ageTier, `${pantheon} ${kind} T5 tag`).toBe(5);

        const s1 = measureVisualMetrics(m1);
        const s5 = measureVisualMetrics(m5);

        const evolved = s5.meshCount > s1.meshCount || s5.maxY > s1.maxY + 0.05;
        expect(
          evolved,
          `${pantheon} ${kind} must visibly evolve between Age 1 (meshes=${s1.meshCount}, maxY=${s1.maxY.toFixed(2)}) and Age 5 (meshes=${s5.meshCount}, maxY=${s5.maxY.toFixed(2)})`
        ).toBe(true);
      }
    }
  });

  it('evolves defensive Towers progressively through Vigia (T1-2) -> Guarda (T3) -> Balista (T4) -> Divina (T5)', () => {
    for (const pantheon of CORE_PANTHEONS) {
      const god = PANTHEONS[pantheon].deity;
      const metrics = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) => {
        const mesh = createBuildingMesh('tower', 'player', pal, false, pantheon, god, age);
        return { age, mesh, ...measureVisualMetrics(mesh) };
      });

      expect(metrics[1].meshCount, `${pantheon} tower T2 > T1`).toBeGreaterThan(metrics[0].meshCount);
      expect(metrics[2].meshCount, `${pantheon} tower T3 (Guarda) > T2`).toBeGreaterThan(metrics[1].meshCount);
      expect(metrics[3].meshCount, `${pantheon} tower T4 (Balista) > T3`).toBeGreaterThan(metrics[2].meshCount);
      expect(metrics[4].meshCount, `${pantheon} tower T5 (Divina) > T4`).toBeGreaterThan(metrics[3].meshCount);
      expect(metrics[4].mesh.userData.metropolisHalo).toBeDefined();
      expect(metrics[4].mesh.userData.metropolisCrystal).toBeDefined();

      const spec1 = getCivBuildingSpec(pantheon, 'tower', god, 1);
      const spec3 = getCivBuildingSpec(pantheon, 'tower', god, 3);
      const spec4 = getCivBuildingSpec(pantheon, 'tower', god, 4);
      expect(spec3.maxHp).toBeGreaterThan(spec1.maxHp);
      expect(spec4.maxHp).toBeGreaterThan(spec3.maxHp);
    }
  });

  it('evolves Walls and Gates across every Age from 1 to 5 for all civilizations', () => {
    for (const pantheon of CORE_PANTHEONS) {
      const god = PANTHEONS[pantheon].deity;
      for (const kind of ['wall', 'gate'] as const) {
        const heights = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) =>
          measureVisualMetrics(createBuildingMesh(kind, 'player', pal, false, pantheon, god, age)).maxY
        );
        for (let i = 1; i < heights.length; i++) {
          expect(
            heights[i],
            `${pantheon} ${kind} Age ${i + 1} height should exceed Age ${i}`
          ).toBeGreaterThan(heights[i - 1]);
        }
      }
    }
  });

  it('evolves Chinese Town Center across T1-T5 with imperial lanterns and Era IV/V pinnacle', () => {
    const metrics = ([1, 2, 3, 4, 5] as AgeLevel[]).map((age) => {
      const mesh = createBuildingMesh('town_center', 'player', pal, false, 'chinese', 'Fu Xi', age);
      return { age, mesh, ...measureVisualMetrics(mesh) };
    });

    for (let i = 1; i < metrics.length; i++) {
      expect(
        metrics[i].maxY,
        `Chinese TC T${i + 1} height should exceed T${i}`
      ).toBeGreaterThan(metrics[i - 1].maxY);
    }
    expect(Array.isArray(metrics[3].mesh.userData.tcFlames)).toBe(true);
    expect(metrics[3].mesh.userData.metropolisHalo).toBeDefined();
    expect(metrics[4].mesh.userData.metropolisCrystal).toBeDefined();
  });

  it('evolves Age III/IV late-game buildings (fortress, siege_works, wonder, titan_gate) into Era V', () => {
    const lateBuildings: BuildingKind[] = ['fortress', 'siege_works', 'wonder', 'titan_gate'];
    for (const pantheon of CORE_PANTHEONS) {
      const god = PANTHEONS[pantheon].deity;
      for (const kind of lateBuildings) {
        const startAge: AgeLevel = kind === 'wonder' || kind === 'titan_gate' ? 4 : 3;
        const mStart = createBuildingMesh(kind, 'player', pal, false, pantheon, god, startAge);
        const m5 = createBuildingMesh(kind, 'player', pal, false, pantheon, god, 5);
        const sStart = measureVisualMetrics(mStart);
        const s5 = measureVisualMetrics(m5);

        const evolved = s5.meshCount > sStart.meshCount || s5.maxY > sStart.maxY + 0.05;
        expect(
          evolved,
          `${pantheon} ${kind} must evolve from Age ${startAge} to Age 5`
        ).toBe(true);
      }
    }
  });
});
