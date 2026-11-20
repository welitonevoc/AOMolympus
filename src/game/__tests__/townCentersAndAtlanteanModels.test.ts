import { beforeAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createBuildingMesh, createMaterialPalette, createUnitMesh, getCivLook, MaterialPalette } from '../models';
import { AgeLevel } from '../types';
import { getUnitsForCivAndGod } from '../../components/gallery3dCatalog';

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

function countMeshes(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) count++;
  });
  return count;
}

describe('Procedural Town Centers (T1-T5) and Atlantean Citizen & Pack Llama', () => {
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

  it('resolves Oranos, Urano, Freyr, and accented Ísis to their proper architectural styles', () => {
    expect(getCivLook('atlantean', pal, 'Oranos').style).toBe('atlantean');
    expect(getCivLook('atlantean', pal, 'Urano').style).toBe('atlantean');
    expect(getCivLook('atlantean', pal, 'Kronos').style).toBe('atlantean');
    expect(getCivLook('atlantean', pal, 'Gaia').style).toBe('atlantean');
    expect(getCivLook('egyptian', pal, 'Rá').style).toBe('egyptian');
    expect(getCivLook('egyptian', pal, 'Ísis').style).toBe('egyptian');
    expect(getCivLook('egyptian', pal, 'Set').style).toBe('egyptian');
    expect(getCivLook('norse', pal, 'Freyr').style).toBe('norse');
  });

  it('builds Norse Town Centers across T1-T5 for Odin, Thor, Loki, and Freyr with flames and T4/T5 pinnacle', () => {
    for (const god of ['Odin', 'Thor', 'Loki', 'Freyr']) {
      for (const age of [1, 2, 3, 4, 5] as AgeLevel[]) {
        const mesh = createBuildingMesh('town_center', 'player', pal, false, 'norse', god, age);
        expect(countMeshes(mesh)).toBeGreaterThan(25);
        expect(Array.isArray(mesh.userData.tcFlames)).toBe(true);
        if (age >= 4) {
          expect(mesh.userData.metropolisHalo).toBeDefined();
          expect(mesh.userData.metropolisCrystal).toBeDefined();
        }
      }
    }
  });

  it('builds Egyptian Town Centers across T1-T5 for Rá, accented Ísis, and Set without falling back to legacy models', () => {
    for (const god of ['Rá', 'Ísis', 'Set']) {
      for (const age of [1, 2, 3, 4, 5] as AgeLevel[]) {
        const mesh = createBuildingMesh('town_center', 'player', pal, false, 'egyptian', god, age);
        expect(countMeshes(mesh)).toBeGreaterThan(25);
        expect(Array.isArray(mesh.userData.tcFlames)).toBe(true);
        if (age >= 4) {
          expect(mesh.userData.metropolisHalo).toBeDefined();
          expect(mesh.userData.metropolisCrystal).toBeDefined();
        }
      }
    }
  });

  it('builds Atlantean Town Centers across T1-T5 for Kronos, Oranos, and Gaia with floating orichalcum relics', () => {
    for (const god of ['Kronos', 'Oranos', 'Gaia']) {
      for (const age of [1, 2, 3, 4, 5] as AgeLevel[]) {
        const mesh = createBuildingMesh('town_center', 'player', pal, false, 'atlantean', god, age);
        expect(countMeshes(mesh)).toBeGreaterThan(25);
        expect(Array.isArray(mesh.userData.atlanteanRelics)).toBe(true);
        expect(Array.isArray(mesh.userData.atlanteanRelicRings)).toBe(true);
        if (age >= 2) {
          expect(Array.isArray(mesh.userData.tcFlames)).toBe(true);
        }
        if (age >= 4) {
          expect(mesh.userData.metropolisHalo).toBeDefined();
          expect(mesh.userData.metropolisCrystal).toBeDefined();
        }
      }
    }
  });

  it('builds Greek Town Centers across T1-T5 for Zeus, Poseidon, and Hades', () => {
    for (const god of ['Zeus', 'Poseidon', 'Hades']) {
      for (const age of [1, 2, 3, 4, 5] as AgeLevel[]) {
        const mesh = createBuildingMesh('town_center', 'player', pal, false, 'greek', god, age);
        expect(countMeshes(mesh)).toBeGreaterThan(25);
        expect(Array.isArray(mesh.userData.tcFlames)).toBe(true);
      }
    }
  });

  it('spawns studio-grade Atlantean Citizen (with Hero transformation) and Pack Llama for Kronos, Oranos, and Gaia', () => {
    for (const god of ['Kronos', 'Oranos', 'Gaia']) {
      const citizen = createUnitMesh('citizen', 'player', pal, false, 'atlantean', god);
      expect(countMeshes(citizen)).toBeGreaterThan(30);
      expect(typeof citizen.userData.setHeroVisual).toBe('function');
      expect(typeof citizen.userData.animatePose).toBe('function');
      expect(() => {
        citizen.userData.setHeroVisual(true);
        citizen.userData.animatePose(0.016, true, 3.2, null, 'gather_gold');
        citizen.userData.setHeroVisual(false);
      }).not.toThrow();

      const llama = createUnitMesh('llama_caravan', 'player', pal, false, 'atlantean', god);
      expect(countMeshes(llama)).toBeGreaterThan(20);
      expect(typeof llama.userData.animatePose).toBe('function');
      expect(() => {
        llama.userData.animatePose(0.016, true, 3.5);
        llama.userData.animatePose(0.016, false, 0);
      }).not.toThrow();
    }
  });

  it('includes both Atlantean Citizen and Lhama de Carga Atlante in 3D Gallery catalog', () => {
    const units = getUnitsForCivAndGod('atlantean', 'Kronos');
    expect(units.some((u) => u.id === 'citizen')).toBe(true);
    expect(units.some((u) => u.id === 'llama_caravan')).toBe(true);
  });
});
