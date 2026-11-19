import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { resolveStudioVillagerCiv } from '../studioVillagerAdapter';
import {
  awardNorseCombatFavor,
  computeTeamFavorBreakdown,
  FavorSystemContext,
} from '../engine/favorAndEconomySystem';
import { UNIT_STATS } from '../types';
import { BuildingEntity, UnitEntity } from '../engine/engineTypes';

describe('resolveStudioVillagerCiv', () => {
  it('routes Greek, Norse, Dwarf, Egyptian, and Atlantean workers to their studio models', () => {
    expect(resolveStudioVillagerCiv('villager', 'greek', 'greek')).toBe('greek');
    expect(resolveStudioVillagerCiv('villager', 'norse', 'norse')).toBe('norse');
    expect(resolveStudioVillagerCiv('norse_dwarf', 'norse', 'norse')).toBe('norse');
    expect(resolveStudioVillagerCiv('villager', 'egyptian', 'egyptian')).toBe('egyptian');
    expect(resolveStudioVillagerCiv('citizen', 'atlantean', 'atlantean')).toBe('atlantean');
    expect(resolveStudioVillagerCiv('villager', 'atlantean', 'atlantean')).toBe('atlantean');
  });

  it('keeps non-studio units and Chinese peasants on their dedicated builders', () => {
    expect(resolveStudioVillagerCiv('hoplite', 'greek', 'greek')).toBeNull();
    expect(resolveStudioVillagerCiv('chinese_peasant', 'chinese', 'chinese')).toBeNull();
    expect(resolveStudioVillagerCiv('villager', 'chinese', 'chinese')).toBeNull();
  });
});

describe('favorAndEconomySystem', () => {
  function makeMockCtx(overrides: Partial<FavorSystemContext> = {}): FavorSystemContext {
    return {
      units: new Map<string, UnitEntity>(),
      buildings: new Map<string, BuildingEntity>(),
      researchedTechs: [],
      enemyResearchedTechs: [],
      chosenMinorGods: [],
      enemyAge: 1,
      majorGodName: 'Odin',
      enemyPantheon: 'greek',
      resources: { food: 100, wood: 100, gold: 100, favor: 0 },
      enemyResources: { food: 100, wood: 100, gold: 100, favor: 0 },
      playerCombatFavorRate: 0,
      enemyCombatFavorRate: 0,
      relicsHeld: 0,
      addCombatFavor: () => {},
      teamPantheon: (team) => (team === 'player' ? 'norse' : 'greek'),
      unitStats: (kind) => UNIT_STATS[kind],
      isWorkerKind: (k) => k === 'villager' || k === 'norse_dwarf' || k === 'citizen',
      getUnitRadius: () => 0.45,
      isTeamIsis: () => false,
      isTeamRa: () => false,
      ...overrides,
    };
  }

  it('awards amplified Norse combat favor for Hersir and Odin Great Hall bonus', () => {
    let tracked = 0;
    const ctx = makeMockCtx({
      addCombatFavor: (_t, amt) => {
        tracked += amt;
      },
    });

    awardNorseCombatFavor(ctx, 'player', 'hersir', true, 50);
    expect(ctx.resources.favor).toBeGreaterThan(2.0);
    expect(tracked).toBeCloseTo(ctx.resources.favor, 5);

    // Villagers do not generate Norse combat favor
    const before = ctx.resources.favor;
    awardNorseCombatFavor(ctx, 'player', 'villager', false, 50);
    expect(ctx.resources.favor).toBe(before);
  });

  it('computes Egyptian monument favor including Isis & empower bonuses', () => {
    const monumentMesh = new THREE.Group();
    const buildings = new Map<string, BuildingEntity>([
      [
        'm1',
        {
          id: 'm1',
          kind: 'monument',
          team: 'player',
          mesh: monumentMesh,
          hp: 500,
          maxHp: 500,
          radius: 1.4,
          selected: false,
          isConstructed: true,
          buildProgress: 1,
          trainingQueue: [],
          repeatTraining: false,
          rallyPoint: null,
          attackTimer: 0,
          empoweredTimer: 5,
          empoweredBy: 'pharaoh',
        },
      ],
    ]);

    const ctx = makeMockCtx({
      buildings,
      majorGodName: 'Ísis',
      teamPantheon: () => 'egyptian',
      isTeamIsis: () => true,
      relicsHeld: 2,
    });

    const result = computeTeamFavorBreakdown(ctx, 'player');
    expect(result.empoweredMonuments).toBe(1);
    // Base altar (0.1) + empowered Isis monument (0.75 * 1.25 * 1.65 = 1.546875) + 2 relics (0.9)
    expect(result.totalRate).toBeCloseTo(0.1 + 0.75 * 1.25 * 1.65 + 0.9, 3);
  });
});
