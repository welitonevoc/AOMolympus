import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  applyEntityFogVisibility,
  FogAndWeatherContext,
  setWeather,
  syncMinimapFogCache,
  updateWeather,
} from '../engine/weatherAndFogSystem';
import { MINIMAP_FOG_SIZE, UnitEntity } from '../engine/engineTypes';
import { UNIT_STATS } from '../types';

function makeFogWeatherCtx(overrides: Partial<FogAndWeatherContext> = {}): FogAndWeatherContext {
  const scene = new THREE.Scene();
  const fogGridSize = 64;
  const ctx: FogAndWeatherContext = {
    scene,
    mapId: 'mediterranean',
    revealedMap: false,
    fogMesh: null,
    fogTex: null,
    fogGridSize,
    fogState: new Uint8Array(fogGridSize * fogGridSize),
    fogDisplay: new Float32Array(fogGridSize * fogGridSize),
    fogTexData: new Uint8Array(fogGridSize * fogGridSize * 4),
    minimapFogCache: new Uint8Array(MINIMAP_FOG_SIZE * MINIMAP_FOG_SIZE),
    fogUpdateTimer: 0,
    setFogUpdateTimer: (val) => {
      ctx.fogUpdateTimer = val;
    },
    units: new Map(),
    buildings: new Map(),
    nodes: new Map(),
    settlements: new Map(),
    relics: new Map(),
    fauna: new Map(),
    researchedTechs: [],
    unitStats: (kind) => UNIT_STATS[kind],
    isWorldVisible: () => false,
    isWorldExplored: () => false,
    revealFogCircle: () => {},
    currentWeather: 'clear',
    setCurrentWeather: (w) => {
      ctx.currentWeather = w;
    },
    weatherParticles: null,
    setWeatherParticles: (pts) => {
      ctx.weatherParticles = pts;
    },
    weatherTimer: 0,
    setWeatherTimer: (val) => {
      ctx.weatherTimer = val;
    },
    notifyStatus: () => {},
    ...overrides,
  };
  return ctx;
}

describe('weatherAndFogSystem', () => {
  it('hides enemies in fog while keeping player units visible', () => {
    const playerMesh = new THREE.Group();
    const enemyMesh = new THREE.Group();
    const units = new Map<string, UnitEntity>([
      [
        'u_p',
        {
          id: 'u_p',
          kind: 'hoplite',
          team: 'player',
          mesh: playerMesh,
          hp: 100,
          maxHp: 100,
          selected: true,
        } as UnitEntity,
      ],
      [
        'u_e',
        {
          id: 'u_e',
          kind: 'hoplite',
          team: 'enemy',
          mesh: enemyMesh,
          hp: 100,
          maxHp: 100,
          selected: true,
        } as UnitEntity,
      ],
    ]);

    const ctx = makeFogWeatherCtx({ units, isWorldVisible: () => false });
    applyEntityFogVisibility(ctx);

    expect(playerMesh.visible).toBe(true);
    expect(enemyMesh.visible).toBe(false);
    expect(units.get('u_e')!.selected).toBe(false);
  });

  it('downsamples fogState into minimapFogCache preserving highest visibility state', () => {
    const ctx = makeFogWeatherCtx();
    ctx.fogState[0] = 2;
    syncMinimapFogCache(ctx);
    expect(ctx.minimapFogCache[0]).toBe(2);
    expect(ctx.minimapFogCache[MINIMAP_FOG_SIZE * MINIMAP_FOG_SIZE - 1]).toBe(0);
  });

  it('creates, updates, and cleanly disposes weather particle systems', () => {
    const ctx = makeFogWeatherCtx();
    setWeather(ctx, 'rain');
    expect(ctx.currentWeather).toBe('rain');
    expect(ctx.weatherParticles).not.toBeNull();
    expect(ctx.scene.children.length).toBe(1);

    const posAttr = ctx.weatherParticles!.geometry.attributes.position as THREE.BufferAttribute;
    const beforeY = posAttr.getY(0);
    updateWeather(ctx, 0.1);
    expect(posAttr.getY(0)).not.toBe(beforeY);

    setWeather(ctx, 'clear');
    expect(ctx.weatherParticles).toBeNull();
    expect(ctx.scene.children.length).toBe(0);
  });
});
