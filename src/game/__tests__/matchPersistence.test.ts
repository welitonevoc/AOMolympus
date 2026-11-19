import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import {
  clearSavedMatchFromStorage,
  hasSavedMatchInStorage,
  MATCH_SAVE_KEY,
  readSavedMatchFromStorage,
  writeSavedMatchToStorage,
} from '../saveLoadSystem';
import {
  loadMatchFromStorage,
  MatchPersistenceContext,
  saveMatchToStorage,
} from '../engine/matchPersistenceSystem';
import { BuildingEntity, FaunaEntity, RelicEntity, ResourceNodeEntity, SettlementEntity, UnitEntity } from '../engine/engineTypes';
import { GodPowerId, TechId } from '../types';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (idx: number) => Array.from(store.keys())[idx] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });
  return store;
}

describe('saveLoadSystem localStorage layer', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it('writes, reads, detects, and clears saved matches cleanly', () => {
    expect(hasSavedMatchInStorage()).toBe(false);
    expect(writeSavedMatchToStorage({ age: 3, pantheon: 'norse' })).toBe(true);
    expect(hasSavedMatchInStorage()).toBe(true);
    expect(readSavedMatchFromStorage<{ age: number; pantheon: string }>()).toEqual({
      age: 3,
      pantheon: 'norse',
    });

    clearSavedMatchFromStorage();
    expect(hasSavedMatchInStorage()).toBe(false);
    expect(readSavedMatchFromStorage()).toBeNull();
  });

  it('migrates legacy save key automatically and handles corrupted JSON safely', () => {
    localStorage.setItem('aom_saved_match', JSON.stringify({ pantheon: 'egyptian', age: 2 }));
    expect(hasSavedMatchInStorage()).toBe(true);
    expect(localStorage.getItem(MATCH_SAVE_KEY)).toBeTruthy();
    expect(localStorage.getItem('aom_saved_match')).toBeNull();

    localStorage.setItem(MATCH_SAVE_KEY, '{broken-json');
    expect(readSavedMatchFromStorage()).toBeNull();
  });
});

describe('Match Persistence Save/Load Round-Trip', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it('returns false when no save exists in storage', () => {
    const ctx = {
      clearEntities: vi.fn(),
    } as unknown as MatchPersistenceContext;
    expect(loadMatchFromStorage(ctx)).toBe(false);
    expect(ctx.clearEntities).not.toHaveBeenCalled();
  });

  it('saves and restores full match state including entities, hero promotion, carcasses, relics, and fog bitmap', () => {
    const unitMesh = new THREE.Group();
    unitMesh.position.set(14, 0, -9);
    const bMesh = new THREE.Group();
    bMesh.position.set(-12, 0, 18);
    const nodeMesh = new THREE.Group();
    nodeMesh.position.set(6, 0, 7);
    const settleMesh = new THREE.Group();
    settleMesh.position.set(22, 0, 22);
    const relicMesh = new THREE.Group();
    relicMesh.position.set(-18, 0, -14);
    const faunaMesh = new THREE.Group();
    faunaMesh.position.set(8, 0, -16);

    const state = {
      pantheon: 'atlantean' as const,
      majorGodName: 'Cronos',
      enemyPantheon: 'greek' as const,
      difficulty: 'hard' as const,
      mapId: 'mediterranean' as const,
      gameType: 'supremacy' as const,
      visibilityMode: 'normal' as const,
      worldSize: 'normal' as const,
      matchSeed: 1337,
      revealedMap: false,
      dayNightCycle: true,
      titansEnabled: true,
      treatyRemaining: 30,
      formation: 'phalanx' as const,
      elapsedSeconds: 412,
      age: 3 as const,
      enemyAge: 2 as const,
      chosenMinorGods: ['Prometheus', 'Hyperion'],
      unlockedPowers: ['black_hole', 'chaos', 'tremor'] as GodPowerId[],
      researchedTechs: ['copper_weapons', 'perception'] as TechId[],
      enemyResearchedTechs: ['copper_weapons'] as TechId[],
      playerDestroyedValue: 850,
      enemyDestroyedValue: 220,
      relicsHeld: 1,
      regentUnitId: null as string | null,
      marketRates: { food: 1.15, wood: 0.9, gold: 1.0 },
      resources: { food: 640, wood: 480, gold: 710, favor: 42 },
      enemyResources: { food: 500, wood: 400, gold: 300, favor: 20 },
      godPowerCooldowns: { deconstruction: 15, valor: 0, chaos: 45 } as never,
      stats: {
        unitsTrained: 18,
        enemiesDefeated: 11,
        buildingsBuilt: 9,
        powersCast: 3,
        techsResearched: 2,
      },
    };

    const saveCtx = {
      scene: new THREE.Scene(),
      palette: { tunicPlayer: new THREE.MeshStandardMaterial() } as never,
      isSoftwareGl: true,
      fogState: new Uint8Array([0, 2, 1, 0]),
      fogDisplay: new Float32Array([0, 2, 1, 0]),
      units: new Map<string, UnitEntity>([
        [
          'u_hero',
          {
            id: 'u_hero',
            kind: 'murmillo',
            team: 'player',
            mesh: unitMesh,
            hp: 155,
            maxHp: 180,
            isPromotedHero: true,
          } as unknown as UnitEntity,
        ],
      ]),
      buildings: new Map<string, BuildingEntity>([
        [
          'b_tc',
          {
            id: 'b_tc',
            kind: 'town_center',
            team: 'player',
            mesh: bMesh,
            hp: 1800,
            maxHp: 2400,
            isConstructed: false,
            buildProgress: 0.6,
            settlementId: 'st1',
          } as unknown as BuildingEntity,
        ],
      ]),
      nodes: new Map<string, ResourceNodeEntity>([
        ['n1', { id: 'n1', kind: 'gold_mine', mesh: nodeMesh, amount: 1450 } as unknown as ResourceNodeEntity],
      ]),
      settlements: new Map<string, SettlementEntity>([
        ['st1', { id: 'st1', mesh: settleMesh } as unknown as SettlementEntity],
      ]),
      relics: new Map<string, RelicEntity>([
        [
          'r1',
          {
            id: 'r1',
            name: 'Cálice de Atena',
            bonusLabel: '+15 Ouro',
            mesh: relicMesh,
            claimedByTeam: 'player',
          } as unknown as RelicEntity,
        ],
      ]),
      fauna: new Map<string, FaunaEntity>([
        [
          'f1',
          {
            id: 'f1',
            kind: 'deer',
            mesh: faunaMesh,
            hp: 0,
            foodAmount: 95,
            isCarcass: true,
            ownerTeam: 'player',
            isSetConverted: true,
          } as unknown as FaunaEntity,
        ],
      ]),
      getSnapshotFields: () => state,
      notifyStatus: vi.fn(),
      emitHudSnapshot: vi.fn(),
    } as unknown as MatchPersistenceContext;

    expect(saveMatchToStorage(saveCtx)).toBe(true);

    // Prepare a clean target context to load into
    let loadedFields: Parameters<MatchPersistenceContext['applyLoadedFields']>[0] | null = null;
    const spawnedUnits: UnitEntity[] = [];
    const spawnedBuildings: BuildingEntity[] = [];
    const spawnedNodes: ResourceNodeEntity[] = [];
    const spawnedRelics: RelicEntity[] = [];
    const spawnedFauna: FaunaEntity[] = [];
    const promotedHeroIds: string[] = [];

    const loadCtx: MatchPersistenceContext = {
      scene: new THREE.Scene(),
      palette: { tunicPlayer: new THREE.MeshStandardMaterial() } as never,
      isSoftwareGl: true,
      fogState: new Uint8Array(4),
      fogDisplay: new Float32Array(4),
      units: new Map(),
      buildings: new Map(),
      nodes: new Map(),
      settlements: new Map(),
      relics: new Map(),
      fauna: new Map(),
      getSnapshotFields: () => ({
        ...state,
        godPowerCooldowns: { deconstruction: 0, valor: 0, chaos: 0 } as never,
      }),
      applyLoadedFields: (fields) => {
        loadedFields = fields;
      },
      setKothVaultMesh: vi.fn(),
      clearEntities: vi.fn(),
      rebuildTerrainForMap: vi.fn(),
      getBuildingScale: () => ({ x: 1, y: 1, z: 1 }),
      spawnBuilding: (kind, team, x, z, isConstructed, id, settlementId) => {
        const mesh = new THREE.Group();
        mesh.position.set(x, 0, z);
        const b = {
          id: id ?? 'b',
          kind,
          team,
          mesh,
          hp: 2400,
          maxHp: 2400,
          isConstructed,
          buildProgress: isConstructed ? 1 : 0,
          settlementId,
        } as unknown as BuildingEntity;
        spawnedBuildings.push(b);
        return b;
      },
      spawnUnit: (kind, team, x, z, id) => {
        const mesh = new THREE.Group();
        mesh.position.set(x, 0, z);
        const u = {
          id: id ?? 'u',
          kind,
          team,
          mesh,
          hp: 120,
          maxHp: 180,
          isPromotedHero: false,
        } as unknown as UnitEntity;
        spawnedUnits.push(u);
        return u;
      },
      applyHeroPromotionToUnit: (u) => {
        u.isPromotedHero = true;
        u.maxHp = 220;
        promotedHeroIds.push(u.id);
      },
      spawnNode: (kind, x, z, id) => {
        const mesh = new THREE.Group();
        mesh.position.set(x, 0, z);
        const n = { id: id ?? 'n', kind, mesh, amount: 0 } as unknown as ResourceNodeEntity;
        spawnedNodes.push(n);
        return n;
      },
      spawnSettlement: (x, z, id) => {
        const mesh = new THREE.Group();
        mesh.position.set(x, 0, z);
        return { id: id ?? 'st', mesh } as unknown as SettlementEntity;
      },
      spawnRelic: (name, bonusLabel, x, z, id) => {
        const mesh = new THREE.Group();
        mesh.position.set(x, 0, z);
        const r = { id: id ?? 'r', name, bonusLabel, mesh, claimedByTeam: null } as unknown as RelicEntity;
        spawnedRelics.push(r);
        return r;
      },
      spawnFauna: (kind, x, z, id) => {
        const mesh = new THREE.Group();
        mesh.position.set(x, 0, z);
        const f = {
          id: id ?? 'f',
          kind,
          mesh,
          hp: 60,
          foodAmount: 150,
          isCarcass: false,
          ownerTeam: null,
          isSetConverted: false,
        } as unknown as FaunaEntity;
        spawnedFauna.push(f);
        return f;
      },
      setFaunaOwnerVisual: vi.fn(),
      updateFogOfWar: vi.fn(),
      initFogOfWar: vi.fn(),
      syncNavObstacles: vi.fn(),
      resolveUnitCollisions: vi.fn(),
      finalizeLoadedMatch: vi.fn(),
      notifyStatus: vi.fn(),
      emitHudSnapshot: vi.fn(),
    };

    expect(loadMatchFromStorage(loadCtx)).toBe(true);
    expect(loadedFields).not.toBeNull();
    expect(loadedFields!.pantheon).toBe('atlantean');
    expect(loadedFields!.age).toBe(3);
    expect(loadedFields!.resources).toEqual(state.resources);
    expect(loadedFields!.chosenMinorGods).toEqual(['Prometheus', 'Hyperion']);
    expect(loadedFields!.stats.enemiesDefeated).toBe(11);

    // Building partial construction scale & HP restored
    expect(spawnedBuildings).toHaveLength(1);
    expect(spawnedBuildings[0].hp).toBe(1800);
    expect(spawnedBuildings[0].mesh.scale.y).toBeCloseTo(0.25 + 0.75 * 0.6, 4);

    // Unit hero promotion & HP restored
    expect(promotedHeroIds).toEqual(['u_hero']);
    expect(spawnedUnits[0].hp).toBe(155);

    // Node, claimed relic hidden, carcass rotated
    expect(spawnedNodes[0].amount).toBe(1450);
    expect(spawnedRelics[0].claimedByTeam).toBe('player');
    expect(spawnedRelics[0].mesh.visible).toBe(false);
    expect(spawnedFauna[0].isCarcass).toBe(true);
    expect(spawnedFauna[0].isSetConverted).toBe(true);
    expect(spawnedFauna[0].mesh.rotation.z).toBeCloseTo(Math.PI / 2.2, 4);

    // Fog bitmap restored
    expect(Array.from(loadCtx.fogState)).toEqual([0, 1, 1, 0]);
    expect(loadCtx.updateFogOfWar).toHaveBeenCalledWith(1, true);
    expect(loadCtx.syncNavObstacles).toHaveBeenCalled();
    expect(loadCtx.finalizeLoadedMatch).toHaveBeenCalled();
  });
});
