import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import {
  awardNorseCombatFavor,
  computeTeamFavorBreakdown,
  FavorSystemContext,
  getOracleVisionMetrics,
} from '../engine/favorAndEconomySystem';
import {
  advanceAge,
  BuildingsAndProductionContext,
  cancelTrainingItem,
  chooseMinorGod,
  researchTech,
  trainUnit,
} from '../engine/buildingsAndProductionSystem';
import { BuildingEntity, UnitEntity } from '../engine/engineTypes';
import { getCivBuildingSpec, getCivUnitSpec, TECH_SPECS } from '../divineData';
import { AGE_COSTS, PantheonId, ResourceType, TeamId, UnitKind } from '../types';

function makeUnit(
  id: string,
  kind: UnitKind,
  team: TeamId,
  x: number,
  z: number,
  overrides: Partial<UnitEntity> = {},
): UnitEntity {
  const mesh = new THREE.Group();
  mesh.position.set(x, 0, z);
  return {
    id,
    kind,
    team,
    mesh,
    hp: 100,
    maxHp: 100,
    state: 'idle',
    selected: false,
    isPromotedHero: false,
    ...overrides,
  } as unknown as UnitEntity;
}

function makeBuilding(
  id: string,
  kind: BuildingEntity['kind'],
  team: TeamId,
  x: number,
  z: number,
  overrides: Partial<BuildingEntity> = {},
): BuildingEntity {
  const mesh = new THREE.Group();
  mesh.position.set(x, 0, z);
  return {
    id,
    kind,
    team,
    mesh,
    hp: 1200,
    maxHp: 1200,
    radius: 2.5,
    isConstructed: true,
    buildProgress: 1,
    selected: false,
    trainingQueue: [],
    repeatTraining: false,
    rallyPoint: null,
    attackTimer: 0,
    ...overrides,
  } as unknown as BuildingEntity;
}

function createFavorCtx(overrides: Partial<FavorSystemContext> = {}): FavorSystemContext {
  const pantheon: PantheonId = 'greek';
  return {
    units: new Map(),
    buildings: new Map(),
    researchedTechs: [],
    enemyResearchedTechs: [],
    chosenMinorGods: [],
    enemyAge: 1,
    majorGodName: 'Zeus',
    enemyPantheon: 'egyptian',
    resources: { food: 500, wood: 500, gold: 500, favor: 0 },
    enemyResources: { food: 500, wood: 500, gold: 500, favor: 0 },
    playerCombatFavorRate: 0,
    enemyCombatFavorRate: 0,
    relicsHeld: 0,
    addCombatFavor: vi.fn(),
    teamPantheon: (team) => (team === 'player' ? pantheon : 'egyptian'),
    unitStats: (kind, team) => getCivUnitSpec(team === 'player' ? pantheon : 'egyptian', kind),
    isWorkerKind: (kind) =>
      kind === 'villager' || kind === 'norse_dwarf' || kind === 'citizen' || kind === 'chinese_peasant' || kind === 'kuafu',
    getUnitRadius: () => 0.6,
    isTeamIsis: () => false,
    isTeamRa: () => false,
    ...overrides,
  };
}

function createProductionCtx(
  overrides: Partial<BuildingsAndProductionContext> = {},
): BuildingsAndProductionContext {
  const resources: Record<ResourceType, number> = { food: 2000, wood: 2000, gold: 2000, favor: 200 };
  const ctx: BuildingsAndProductionContext = {
    phase: 'playing',
    pantheon: 'greek',
    enemyPantheon: 'egyptian',
    majorGodName: 'Zeus',
    age: 1,
    advancingToAge: null,
    pendingMinorGodAge: null,
    chosenMinorGods: [],
    unlockedPowers: ['lightning'],
    researchedTechs: [],
    enemyResearchedTechs: [],
    activeTechResearch: null,
    resources,
    enemyResources: { food: 500, wood: 500, gold: 500, favor: 50 },
    relicsHeld: 0,
    treatyRemaining: 0,
    elapsedSeconds: 0,
    playableHalfSize: 60,
    isSoftwareGl: true,
    stats: {
      unitsTrained: 0,
      enemiesDefeated: 0,
      buildingsBuilt: 0,
      powersCast: 0,
      techsResearched: 0,
    },
    units: new Map(),
    buildings: new Map(),
    nodes: new Map(),
    fauna: new Map(),
    navGrid: {} as never,
    vfxManager: null,
    favorTimer: 0,
    playerCombatFavorRate: 0,
    enemyCombatFavorRate: 0,
    recentPlayerCombatFavor: 0,
    recentEnemyCombatFavor: 0,
    playerPharaohRespawnTimer: 0,
    enemyPharaohRespawnTimer: 0,
    setAdvancingAge: vi.fn((age) => {
      ctx.advancingToAge = age;
    }),
    setPendingMinorGodAge: vi.fn((age) => {
      ctx.pendingMinorGodAge = age;
    }),
    setActiveTechResearch: vi.fn((res) => {
      ctx.activeTechResearch = res;
    }),
    setFavorTimers: vi.fn(),
    unitStats: (kind, team = 'player') => getCivUnitSpec(team === 'player' ? ctx.pantheon : ctx.enemyPantheon, kind),
    buildingStats: (kind, team = 'player') =>
      getCivBuildingSpec(team === 'player' ? ctx.pantheon : ctx.enemyPantheon, kind, ctx.majorGodName, ctx.age),
    isGodSummonedOrQueued: () => false,
    getPopulation: () => ({ current: 5, cap: 30 }),
    canAfford: (pool, cost) =>
      (cost.food ?? 0) <= pool.food &&
      (cost.wood ?? 0) <= pool.wood &&
      (cost.gold ?? 0) <= pool.gold &&
      (cost.favor ?? 0) <= pool.favor,
    deductCost: (pool, cost) => {
      pool.food -= cost.food ?? 0;
      pool.wood -= cost.wood ?? 0;
      pool.gold -= cost.gold ?? 0;
      pool.favor -= cost.favor ?? 0;
    },
    isWorkerKind: (k) => k === 'villager',
    isBuilderKind: (k) => k === 'villager',
    isTeamIsis: () => false,
    getUnitRadius: () => 0.6,
    spawnUnit: vi.fn(),
    findNearestFishSpot: () => null,
    findNearestDropOff: () => null,
    findNearestEnemy: () => null,
    stationOxCartNearTarget: vi.fn(),
    autoDispatchIdleOxCartToNode: vi.fn(),
    computeTeamFavorBreakdown: () => ({ totalRate: 0.1 }),
    spawnPillarVfx: vi.fn(),
    spawnRingVfx: vi.fn(),
    spawnDivineParticleBurst: vi.fn(),
    spawnProjectile: vi.fn(),
    updateHealthBarVisual: vi.fn(),
    triggerUnitVoice: vi.fn(),
    emitMpCommand: vi.fn(),
    notifyStatus: vi.fn(),
    emitHudSnapshot: vi.fn(),
    ...overrides,
  };
  return ctx;
}

describe('Favor Formulas by Pantheon', () => {
  it('calculates Greek temple prayer favor with diminishing returns, Zeus +20%, and Golden Apples +20%', () => {
    const temple = makeBuilding('t1', 'temple', 'player', 0, 0, { radius: 2.5 });
    const v1 = makeUnit('v1', 'villager', 'player', 3.2, 0, { state: 'pray', targetEntityId: 't1' });
    const v2 = makeUnit('v2', 'villager', 'player', -3.2, 0, { state: 'pray', targetEntityId: 't1' });
    const vFar = makeUnit('v3', 'villager', 'player', 20, 0, { state: 'pray', targetEntityId: 't1' });

    const baseCtx = createFavorCtx({
      majorGodName: 'Poseidon',
      buildings: new Map([['t1', temple]]),
      units: new Map([
        ['v1', v1],
        ['v2', v2],
        ['v3', vFar],
      ]),
    });
    const baseResult = computeTeamFavorBreakdown(baseCtx, 'player');
    expect(baseResult.prayingCount).toBe(2);
    // 0.1 altar + 0.24 + 0.24 / 1.14
    const expectedBasePrayer = 0.24 + 0.24 / 1.14;
    expect(baseResult.totalRate).toBeCloseTo(0.1 + expectedBasePrayer, 4);

    const boostedCtx = createFavorCtx({
      majorGodName: 'Zeus',
      researchedTechs: ['golden_apples'],
      buildings: new Map([['t1', temple]]),
      units: new Map([
        ['v1', v1],
        ['v2', v2],
      ]),
    });
    const boostedResult = computeTeamFavorBreakdown(boostedCtx, 'player');
    expect(boostedResult.totalRate).toBeCloseTo(0.1 + expectedBasePrayer * 1.2 * 1.2, 4);
  });

  it('calculates Egyptian monument favor up to 5 monuments with Isis, Necropolis, and Pharaoh/Ra empowerment', () => {
    const buildings = new Map<string, BuildingEntity>();
    for (let i = 0; i < 6; i++) {
      buildings.set(
        `m${i}`,
        makeBuilding(`m${i}`, 'monument', 'player', i * 6, 0, {
          empoweredTimer: i === 0 ? 10 : 0,
          empoweredBy: i === 0 ? 'pharaoh' : undefined,
        }),
      );
    }

    const raCtx = createFavorCtx({
      majorGodName: 'Rá',
      researchedTechs: ['necropolis'],
      teamPantheon: () => 'egyptian',
      isTeamRa: () => true,
      buildings,
    });
    const raResult = computeTeamFavorBreakdown(raCtx, 'player');
    expect(raResult.empoweredMonuments).toBe(1);
    // 5 monuments capped: 1 empowered by Pharaoh under Ra (1.9x) + 4 regular, all with Necropolis (1.25x)
    const expectedMonuments = 0.75 * 1.25 * 1.9 + 4 * (0.75 * 1.25);
    expect(raResult.totalRate).toBeCloseTo(0.1 + expectedMonuments, 4);

    const isisCtx = createFavorCtx({
      majorGodName: 'Ísis',
      teamPantheon: () => 'egyptian',
      isTeamIsis: () => true,
      buildings: new Map([['m0', makeBuilding('m0', 'monument', 'player', 0, 0)]]),
    });
    const isisResult = computeTeamFavorBreakdown(isisCtx, 'player');
    expect(isisResult.totalRate).toBeCloseTo(0.1 + 0.75 * 1.25, 4);
  });

  it('awards Norse combat favor (Hersir 3.4x, Odin Great Hall +25%, cap 200) and Thor Hammer passive favor', () => {
    const addCombatFavor = vi.fn();
    const ctx = createFavorCtx({
      majorGodName: 'Odin',
      teamPantheon: () => 'norse',
      researchedTechs: ['hammer_of_the_gods'],
      playerCombatFavorRate: 1.5,
      addCombatFavor,
      units: new Map([
        ['h1', makeUnit('h1', 'hersir', 'player', 0, 0)],
        ['h2', makeUnit('h2', 'hersir', 'player', 4, 0)],
      ]),
    });

    // Workers do not earn combat favor
    awardNorseCombatFavor(ctx, 'player', 'villager', false, 50);
    expect(ctx.resources.favor).toBe(0);

    // Hersir from Great Hall under Odin earns damage * 0.011 * 3.4 * 1.25
    awardNorseCombatFavor(ctx, 'player', 'hersir', true, 40);
    const expectedGain = 40 * 0.011 * 3.4 * 1.25;
    expect(ctx.resources.favor).toBeCloseTo(expectedGain, 4);
    expect(addCombatFavor).toHaveBeenCalledWith('player', expect.closeTo(expectedGain, 4));

    // Favor pool is capped at 200
    ctx.resources.favor = 199.5;
    awardNorseCombatFavor(ctx, 'player', 'hersir', true, 100);
    expect(ctx.resources.favor).toBe(200);

    // Breakdown includes Altar (0.1) + combatRate (1.5) + 2 Hersirs * 0.48
    const breakdown = computeTeamFavorBreakdown(ctx, 'player');
    expect(breakdown.totalRate).toBeCloseTo(0.1 + 1.5 + 2 * 0.48, 4);
  });

  it('calculates Atlantean Oracle vision efficiency, overlap penalties, hero bonus, Wonders, and Relics', () => {
    const o1 = makeUnit('o1', 'oracle', 'player', 0, 0, { state: 'idle', isPromotedHero: true });
    const o2 = makeUnit('o2', 'oracle', 'player', 5, 0, { state: 'idle', isPromotedHero: false });
    const oMoving = makeUnit('o3', 'oracle', 'player', 60, 60, { state: 'move' });

    const soloCtx = createFavorCtx({
      teamPantheon: () => 'atlantean',
      researchedTechs: ['perception', 'horns_of_consecration'],
      chosenMinorGods: ['Theia'],
      units: new Map([['o1', o1]]),
    });
    const soloMetrics = getOracleVisionMetrics(soloCtx, o1);
    expect(soloMetrics.isFullVision).toBe(true);
    expect(soloMetrics.efficiency).toBe(1);
    expect(soloMetrics.favorPerSec).toBeCloseTo(0.9 * 1.15 * 1.25 * 1.1, 4);

    const overlapCtx = createFavorCtx({
      teamPantheon: () => 'atlantean',
      units: new Map([
        ['o1', o1],
        ['o2', o2],
        ['o3', oMoving],
      ]),
      buildings: new Map([['w1', makeBuilding('w1', 'wonder', 'player', 80, 80)]]),
      relicsHeld: 2,
    });
    const movingMetrics = getOracleVisionMetrics(overlapCtx, oMoving);
    expect(movingMetrics.favorPerSec).toBe(0);

    const overlapMetrics = getOracleVisionMetrics(overlapCtx, o1);
    expect(overlapMetrics.efficiency).toBeLessThan(1);

    const breakdown = computeTeamFavorBreakdown(overlapCtx, 'player');
    expect(breakdown.oracleSummary.count).toBe(3);
    // Includes Wonder (+6.0) + 2 Relics (+0.9) + Altar (+0.1) + 2 idle oracles
    expect(breakdown.totalRate).toBeGreaterThan(7.0);
  });
});

describe('Economy, Production, Tech Research & Age Advancement', () => {
  it('deducts resources when training a unit and refunds exact cost on cancelTrainingItem', () => {
    const barracks = makeBuilding('b1', 'barracks', 'player', 0, 0, { selected: true });
    const ctx = createProductionCtx({
      buildings: new Map([['b1', barracks]]),
    });
    const cost = getCivUnitSpec('greek', 'hoplite').cost;
    const beforeFood = ctx.resources.food;
    const beforeGold = ctx.resources.gold;

    trainUnit(ctx, 'hoplite');
    expect(barracks.trainingQueue).toHaveLength(1);
    expect(ctx.resources.food).toBe(beforeFood - (cost.food ?? 0));
    expect(ctx.resources.gold).toBe(beforeGold - (cost.gold ?? 0));

    cancelTrainingItem(ctx, 'b1', 0);
    expect(barracks.trainingQueue).toHaveLength(0);
    expect(ctx.resources.food).toBe(beforeFood);
    expect(ctx.resources.gold).toBe(beforeGold);
  });

  it('enforces population cap, queue max of 5, and Zeus-only Myrmidon restriction', () => {
    const barracks = makeBuilding('b1', 'barracks', 'player', 0, 0);

    // Non-Zeus Greek cannot train Myrmidon
    const poseidonCtx = createProductionCtx({
      majorGodName: 'Poseidon',
      age: 4,
      buildings: new Map([['b1', barracks]]),
    });
    trainUnit(poseidonCtx, 'myrmidon');
    expect(barracks.trainingQueue).toHaveLength(0);

    // Pop cap blocks training
    const popFullCtx = createProductionCtx({
      getPopulation: () => ({ current: 30, cap: 30 }),
      buildings: new Map([['b1', barracks]]),
    });
    trainUnit(popFullCtx, 'hoplite');
    expect(barracks.trainingQueue).toHaveLength(0);

    // Queue caps at 5 items
    const queueCtx = createProductionCtx({
      buildings: new Map([['b1', barracks]]),
    });
    for (let i = 0; i < 7; i++) trainUnit(queueCtx, 'hoplite');
    expect(barracks.trainingQueue).toHaveLength(5);
  });

  it('handles Age 2-4 minor god selection and Age 5 Town Center requirement with exact cost deduction', () => {
    const tc = makeBuilding('tc1', 'town_center', 'player', 0, 0);
    const ctx = createProductionCtx({
      age: 1,
      buildings: new Map([['tc1', tc]]),
    });

    advanceAge(ctx);
    expect(ctx.pendingMinorGodAge).toBe(2);

    const foodBefore = ctx.resources.food;
    chooseMinorGod(ctx, 'Athena');
    expect(ctx.pendingMinorGodAge).toBeNull();
    expect(ctx.advancingToAge).toBe(2);
    expect(ctx.chosenMinorGods).toContain('Athena');
    expect(ctx.resources.food).toBe(foodBefore - (AGE_COSTS[2].food ?? 0));

    // Age 5 requires a constructed Town Center
    const noTcCtx = createProductionCtx({
      age: 4,
      resources: { food: 3000, wood: 3000, gold: 3000, favor: 200 },
      buildings: new Map(),
    });
    advanceAge(noTcCtx);
    expect(noTcCtx.advancingToAge).toBeNull();

    const age5Ctx = createProductionCtx({
      age: 4,
      resources: { food: 3000, wood: 3000, gold: 3000, favor: 200 },
      buildings: new Map([['tc1', tc]]),
    });
    advanceAge(age5Ctx);
    expect(age5Ctx.advancingToAge).toBe(5);
    expect(age5Ctx.resources.food).toBe(3000 - (AGE_COSTS[5].food ?? 0));
    expect(age5Ctx.resources.gold).toBe(3000 - (AGE_COSTS[5].gold ?? 0));
  });

  it('enforces tech prerequisites, required building, and deducts tech cost on researchTech', () => {
    const armory = makeBuilding('a1', 'armory', 'player', 0, 0);
    const ctx = createProductionCtx({
      age: 3,
      buildings: new Map([['a1', armory]]),
    });

    // Bronze weapons requires copper_weapons first
    researchTech(ctx, 'bronze_weapons');
    expect(ctx.activeTechResearch).toBeNull();

    // Copper weapons succeeds and deducts cost
    const cost = TECH_SPECS.copper_weapons.cost;
    const goldBefore = ctx.resources.gold;
    researchTech(ctx, 'copper_weapons');
    expect(ctx.activeTechResearch?.id).toBe('copper_weapons');
    expect(ctx.resources.gold).toBe(goldBefore - (cost.gold ?? 0));
  });
});
