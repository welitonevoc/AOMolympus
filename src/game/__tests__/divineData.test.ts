import { describe, expect, it } from 'vitest';
import {
  getAvailableBuildingKinds,
  getCivBuildingSpec,
  getCivUnitSpec,
  TECH_SPECS,
} from '../divineData';
import { AGE_COSTS, BUILDING_STATS, PANTHEONS, PantheonId, UNIT_STATS } from '../types';

const CORE_PANTHEONS: PantheonId[] = ['greek', 'norse', 'egyptian', 'atlantean', 'chinese'];

describe('Civilization & Catalog Data Integrity', () => {
  it('defines metadata and deity for every core pantheon', () => {
    for (const p of CORE_PANTHEONS) {
      expect(PANTHEONS[p]).toBeDefined();
      expect(PANTHEONS[p].name.length).toBeGreaterThan(0);
      expect(PANTHEONS[p].deity.length).toBeGreaterThan(0);
    }
  });

  it('has positive stats for all registered units and buildings', () => {
    for (const [kind, stats] of Object.entries(UNIT_STATS)) {
      expect(stats.maxHp, `unit ${kind} maxHp`).toBeGreaterThan(0);
      expect(stats.speed, `unit ${kind} speed`).toBeGreaterThanOrEqual(0);
      expect(stats.trainTime, `unit ${kind} trainTime`).toBeGreaterThan(0);
    }
    for (const [kind, stats] of Object.entries(BUILDING_STATS)) {
      expect(stats.maxHp, `building ${kind} maxHp`).toBeGreaterThan(0);
      expect(stats.radius, `building ${kind} radius`).toBeGreaterThan(0);
    }
  });

  it('provides valid age progression costs from Age 2 to Age 5', () => {
    for (const age of [2, 3, 4, 5] as const) {
      const cost = AGE_COSTS[age];
      expect(cost).toBeDefined();
      const total = (cost.food ?? 0) + (cost.wood ?? 0) + (cost.gold ?? 0) + (cost.favor ?? 0);
      expect(total).toBeGreaterThan(0);
    }
  });

  it('resolves available buildings and civilization specs cleanly for each pantheon', () => {
    for (const pantheon of CORE_PANTHEONS) {
      const buildings = getAvailableBuildingKinds(pantheon, PANTHEONS[pantheon].deity, [], true);
      expect(buildings.length).toBeGreaterThan(4);
      for (const bKind of buildings) {
        const spec = getCivBuildingSpec(pantheon, bKind, PANTHEONS[pantheon].deity, 1);
        expect(spec.name.length).toBeGreaterThan(0);
      }
      const villagerSpec = getCivUnitSpec(pantheon, 'villager');
      expect(villagerSpec.name.length).toBeGreaterThan(0);
    }
  });

  it('defines valid technology specs with positive research times', () => {
    const techs = Object.values(TECH_SPECS);
    expect(techs.length).toBeGreaterThan(5);
    for (const tech of techs) {
      expect(tech.name.length).toBeGreaterThan(0);
      expect(tech.researchTime).toBeGreaterThan(0);
    }
  });
});
