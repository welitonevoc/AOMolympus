import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import {
  buildSerializedMatch,
  MatchPersistenceContext,
} from '../engine/matchPersistenceSystem';
import {
  assignControlGroup,
  CameraAndInputContext,
  selectControlGroup,
} from '../engine/cameraAndInputSystem';
import { matchesUnitProducer } from '../engine/buildingsAndProductionSystem';
import { getCivUnitSpec } from '../divineData';

describe('Stage 1 extracted engine modules', () => {
  it('serializes match state including units, buildings, and explored fog bitmap', () => {
    const unitMesh = new THREE.Group();
    unitMesh.position.set(12, 0, -8);
    const bMesh = new THREE.Group();
    bMesh.position.set(-10, 0, 15);

    const ctx = {
      fogState: new Uint8Array([0, 1, 2, 0]),
      units: new Map([
        [
          'u1',
          {
            id: 'u1',
            kind: 'hoplite',
            team: 'player',
            mesh: unitMesh,
            hp: 110,
            isPromotedHero: false,
          },
        ],
      ]),
      buildings: new Map([
        [
          'b1',
          {
            id: 'b1',
            kind: 'town_center',
            team: 'player',
            mesh: bMesh,
            hp: 2400,
            isConstructed: true,
            buildProgress: 1,
          },
        ],
      ]),
      nodes: new Map(),
      settlements: new Map(),
      fauna: new Map(),
      relics: new Map(),
      getSnapshotFields: () => ({
        pantheon: 'greek',
        majorGodName: 'Zeus',
        enemyPantheon: 'egyptian',
        difficulty: 'normal',
        mapId: 'mediterranean',
        gameType: 'supremacy',
        visibilityMode: 'normal',
        worldSize: 'normal',
        matchSeed: 42,
        revealedMap: false,
        dayNightCycle: true,
        titansEnabled: true,
        treatyRemaining: 0,
        formation: 'box',
        elapsedSeconds: 120,
        age: 2,
        enemyAge: 2,
        chosenMinorGods: ['athena'],
        unlockedPowers: ['lightning', 'restoration'],
        researchedTechs: ['copper_weapons'],
        enemyResearchedTechs: [],
        playerDestroyedValue: 100,
        enemyDestroyedValue: 40,
        relicsHeld: 1,
        regentUnitId: null,
        marketRates: { food: 1, wood: 1, gold: 1 },
        resources: { food: 300, wood: 250, gold: 200, favor: 15 },
        enemyResources: { food: 300, wood: 250, gold: 200, favor: 10 },
        godPowerCooldowns: {} as never,
        stats: {
          unitsTrained: 5,
          enemiesDefeated: 2,
          buildingsBuilt: 3,
          powersCast: 1,
          techsResearched: 1,
        },
      }),
    } as unknown as MatchPersistenceContext;

    const serialized = buildSerializedMatch(ctx);
    expect(serialized.pantheon).toBe('greek');
    expect(serialized.units).toHaveLength(1);
    expect(serialized.units[0]).toMatchObject({ id: 'u1', x: 12, z: -8, hp: 110 });
    expect(serialized.buildings).toHaveLength(1);
    expect(serialized.fogExplored).toEqual([0, 1, 1, 0]);
  });

  it('assigns and recalls control groups cleanly and focuses camera on double-tap/forceFocus', () => {
    const m1 = new THREE.Group();
    m1.position.set(10, 0, 20);
    const u1 = { id: 'u1', team: 'player', selected: true, hp: 100, state: 'idle', mesh: m1 };
    const u2 = { id: 'u2', team: 'player', selected: false, hp: 100, state: 'idle', mesh: new THREE.Group() };
    const jumpCameraTo = vi.fn();

    const ctx = {
      phase: 'playing',
      controlGroups: new Map<number, string[]>(),
      lastControlGroupKey: -1,
      lastControlGroupTime: 0,
      units: new Map([
        ['u1', u1],
        ['u2', u2],
      ]),
      buildings: new Map(),
      nodes: new Map(),
      settlements: new Map(),
      relics: new Map(),
      fauna: new Map(),
      setCameraState: vi.fn(),
      jumpCameraTo,
      triggerUnitVoice: vi.fn(),
      notifyStatus: vi.fn(),
      emitHudSnapshot: vi.fn(),
    } as unknown as CameraAndInputContext;

    assignControlGroup(ctx, 1);
    expect(ctx.controlGroups.get(1)).toEqual(['u1']);

    u1.selected = false;
    u2.selected = true;
    selectControlGroup(ctx, 1, true);
    expect(u1.selected).toBe(true);
    expect(u2.selected).toBe(false);
    expect(jumpCameraTo).toHaveBeenCalledWith(10, 20);
  });

  it('matches unit producers accurately across pantheon buildings', () => {
    const hoplite = getCivUnitSpec('greek', 'hoplite');
    const fishingShip = getCivUnitSpec('greek', 'fishing_ship');
    const hersir = getCivUnitSpec('norse', 'hersir');

    expect(matchesUnitProducer('hoplite', hoplite, 'barracks')).toBe(true);
    expect(matchesUnitProducer('hoplite', hoplite, 'dock')).toBe(false);
    expect(matchesUnitProducer('fishing_ship', fishingShip, 'dock')).toBe(true);
    expect(matchesUnitProducer('hersir', hersir, 'great_hall')).toBe(true);
    expect(matchesUnitProducer('hersir', hersir, 'temple')).toBe(true);
  });
});
