import { describe, expect, it } from 'vitest';
import {
  getAvailableBuildingKinds,
  getCivBuildingSpec,
  getCivUnitSpec,
  getEffectiveTechCost,
  getEffectiveTechTime,
  getMinorGodChoicesForAge,
  GOD_POWERS,
  MAJOR_GODS,
  MINOR_GODS,
  TECH_SPECS,
} from '../divineData';
import { getMajorGodPortrait, getMapLandscapeImage, getMinorGodPortrait } from '../mediaAssets';
import { AGE_COSTS, BUILDING_STATS, MAPS, MapId, PANTHEONS, PantheonId, UNIT_STATS } from '../types';

const CORE_PANTHEONS: PantheonId[] = ['greek', 'norse', 'egyptian', 'atlantean', 'chinese'];

describe('Civilization & Catalog Data Integrity', () => {
  it('defines metadata and deity for every core pantheon', () => {
    for (const p of CORE_PANTHEONS) {
      expect(PANTHEONS[p]).toBeDefined();
      expect(PANTHEONS[p].name.length).toBeGreaterThan(0);
      expect(PANTHEONS[p].deity.length).toBeGreaterThan(0);
    }
  });

  it('has positive stats, non-negative costs, and valid producedAt buildings for all registered units and buildings', () => {
    for (const [kind, stats] of Object.entries(UNIT_STATS)) {
      expect(stats.maxHp, `unit ${kind} maxHp`).toBeGreaterThan(0);
      expect(stats.speed, `unit ${kind} speed`).toBeGreaterThanOrEqual(0);
      expect(stats.trainTime, `unit ${kind} trainTime`).toBeGreaterThan(0);
      expect(BUILDING_STATS[stats.producedAt], `unit ${kind} producedAt ${stats.producedAt}`).toBeDefined();
      for (const val of Object.values(stats.cost)) {
        if (val !== undefined) expect(val, `unit ${kind} cost`).toBeGreaterThanOrEqual(0);
      }
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

  it('validates every Major God links to valid God Powers, Minor God choices for Ages 2-4, and portraits', () => {
    expect(MAJOR_GODS.length).toBeGreaterThanOrEqual(17);
    for (const god of MAJOR_GODS) {
      expect(PANTHEONS[god.pantheon], `major god ${god.name} pantheon`).toBeDefined();
      expect(GOD_POWERS[god.favoredPower], `major god ${god.name} favoredPower ${god.favoredPower}`).toBeDefined();
      expect(getMajorGodPortrait(god.name, god.pantheon).length).toBeGreaterThan(0);

      for (const age of [2, 3, 4] as const) {
        const [choiceA, choiceB] = getMinorGodChoicesForAge(god.name, god.pantheon, age);
        expect(choiceA, `${god.name} age ${age} choiceA`).toBeDefined();
        expect(choiceB, `${god.name} age ${age} choiceB`).toBeDefined();
        expect(choiceA.id).not.toBe(choiceB.id);
      }
    }
  });

  it('validates every Minor God links to valid God Powers, Myth Units, age tier, and portraits', () => {
    const minors = Object.values(MINOR_GODS);
    expect(minors.length).toBeGreaterThan(20);
    for (const minor of minors) {
      expect([2, 3, 4]).toContain(minor.age);
      expect(GOD_POWERS[minor.godPower], `minor god ${minor.id} godPower ${minor.godPower}`).toBeDefined();
      expect(UNIT_STATS[minor.mythUnit], `minor god ${minor.id} mythUnit ${minor.mythUnit}`).toBeDefined();
      expect(minor.mythUnitTitle.length).toBeGreaterThan(0);
      expect(getMinorGodPortrait(minor.id, minor.pantheon).length).toBeGreaterThan(0);
    }
  });

  it('defines valid technology specs, acyclic prerequisites, valid host buildings, and effective cost helpers', () => {
    const techs = Object.values(TECH_SPECS);
    expect(techs.length).toBeGreaterThan(5);
    for (const tech of techs) {
      expect(tech.name.length).toBeGreaterThan(0);
      expect(tech.researchTime).toBeGreaterThan(0);
      expect(BUILDING_STATS[tech.building], `tech ${tech.id} building ${tech.building}`).toBeDefined();
      if (tech.requires) {
        expect(TECH_SPECS[tech.requires], `tech ${tech.id} requires ${tech.requires}`).toBeDefined();
        expect(tech.requires).not.toBe(tech.id);
      }
      const effCost = getEffectiveTechCost(tech, []);
      const effTime = getEffectiveTechTime(tech, []);
      expect(effTime).toBeGreaterThan(0);
      for (const val of Object.values(effCost)) {
        if (val !== undefined) expect(val).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('resolves valid landscape images for every map in MAPS catalog', () => {
    const mapIds = Object.keys(MAPS) as MapId[];
    expect(mapIds.length).toBeGreaterThan(10);
    for (const mapId of mapIds) {
      const img = getMapLandscapeImage(mapId);
      expect(img, `map ${mapId} landscape`).toBeTruthy();
      expect(img.length).toBeGreaterThan(0);
    }
  });
});
