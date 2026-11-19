import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CombatManager } from '../combat';
import { UNIT_STATS } from '../types';

describe('CombatManager', () => {
  it('applies distinct passive modifiers per pantheon and caps armor at 0.85', () => {
    const base = UNIT_STATS.hoplite;
    const greek = CombatManager.applyPassiveModifiers(base, 'greek');
    const norse = CombatManager.applyPassiveModifiers(base, 'norse');
    const egyptian = CombatManager.applyPassiveModifiers(base, 'egyptian');
    const atlantean = CombatManager.applyPassiveModifiers(base, 'atlantean');

    expect(greek.maxHp).toBeGreaterThan(base.maxHp);
    expect(norse.speed).toBeGreaterThan(base.speed);
    expect(norse.attack).toBeGreaterThan(base.attack);
    expect(egyptian.attack).toBeGreaterThan(base.attack);
    expect(atlantean.maxHp).toBeGreaterThan(base.maxHp);
    expect(atlantean.attack).toBeGreaterThan(base.attack);
    expect(atlantean.speed).toBeGreaterThan(base.speed);

    const capped = CombatManager.applyPassiveModifiers({ ...base, hackArmor: 0.84, pierceArmor: 0.84, crushArmor: 0.84 }, 'greek');
    expect(capped.hackArmor).toBe(0.85);
    expect(capped.pierceArmor).toBe(0.85);
    expect(capped.crushArmor).toBe(0.85);
  });

  it('reduces damage based on matching armor type (hack, pierce, crush) while honoring minimum floor', () => {
    const dmgLowArmor = CombatManager.calculateDamage(
      { ...UNIT_STATS.hoplite, attack: 20, damageType: 'hack' },
      { kind: 'villager', hackArmor: 0.1 }
    );
    const dmgHighArmor = CombatManager.calculateDamage(
      { ...UNIT_STATS.hoplite, attack: 20, damageType: 'hack' },
      { kind: 'villager', hackArmor: 0.7 }
    );
    const dmgExtremeArmor = CombatManager.calculateDamage(
      { ...UNIT_STATS.hoplite, attack: 20, damageType: 'hack' },
      { kind: 'villager', hackArmor: 0.99 }
    );
    expect(dmgLowArmor).toBeGreaterThan(dmgHighArmor);
    expect(dmgExtremeArmor).toBeGreaterThanOrEqual(1);

    // Pierce attack uses pierceArmor, ignoring high hackArmor
    const pierceDmg = CombatManager.calculateDamage(
      { ...UNIT_STATS.archer, attack: 20, damageType: 'pierce', bonusVsInfantry: undefined },
      { kind: 'hoplite', hackArmor: 0.8, pierceArmor: 0.1 }
    );
    expect(pierceDmg).toBe(18);

    // Crush attack uses crushArmor
    const crushDmg = CombatManager.calculateDamage(
      { ...UNIT_STATS.ram, attack: 20, damageType: 'crush', bonusVsBuilding: undefined },
      { kind: 'house', isBuilding: false, hackArmor: 0.8, crushArmor: 0.2 }
    );
    expect(crushDmg).toBe(16);
  });

  it('applies all bonus counter multipliers (cavalry, infantry, archer, myth, siege, building)', () => {
    const antiCavStats = {
      ...UNIT_STATS.hoplite,
      attack: 12,
      damageType: 'hack' as const,
      bonusVsCavalry: 1.75,
    };
    const vsInf = CombatManager.calculateDamage(antiCavStats, { kind: 'hoplite', hackArmor: 0.2 });
    const vsCav = CombatManager.calculateDamage(antiCavStats, { kind: 'cavalry', hackArmor: 0.2 });
    expect(vsCav).toBeGreaterThan(vsInf);

    const antiInfStats = {
      ...UNIT_STATS.archer,
      attack: 12,
      damageType: 'pierce' as const,
      bonusVsInfantry: 2.0,
    };
    expect(
      CombatManager.calculateDamage(antiInfStats, { kind: 'murmillo', pierceArmor: 0.2 })
    ).toBeGreaterThan(
      CombatManager.calculateDamage(antiInfStats, { kind: 'cavalry', pierceArmor: 0.2 })
    );

    const antiArcherStats = {
      ...UNIT_STATS.cavalry,
      attack: 12,
      damageType: 'hack' as const,
      bonusVsArcher: 2.0,
    };
    expect(
      CombatManager.calculateDamage(antiArcherStats, { kind: 'arcus', hackArmor: 0.2 })
    ).toBeGreaterThan(
      CombatManager.calculateDamage(antiArcherStats, { kind: 'hoplite', hackArmor: 0.2 })
    );

    const antiSiegeStats = {
      ...UNIT_STATS.cavalry,
      attack: 12,
      damageType: 'hack' as const,
      bonusVsSiege: 2.5,
    };
    expect(
      CombatManager.calculateDamage(antiSiegeStats, { kind: 'onager', isSiege: true, hackArmor: 0.2 })
    ).toBeGreaterThan(
      CombatManager.calculateDamage(antiSiegeStats, { kind: 'hoplite', hackArmor: 0.2 })
    );

    const heroStats = {
      ...UNIT_STATS.jason,
      attack: 15,
      damageType: 'hack' as const,
      bonusVsMyth: 3.0,
    };
    const vsHuman = CombatManager.calculateDamage(heroStats, { kind: 'hoplite', isMythic: false, hackArmor: 0.2 });
    const vsMyth = CombatManager.calculateDamage(heroStats, { kind: 'minotaur', isMythic: true, hackArmor: 0.2 });
    expect(vsMyth).toBeGreaterThan(vsHuman * 2);

    const siegeStats = {
      ...UNIT_STATS.hoplite,
      attack: 20,
      damageType: 'crush' as const,
      bonusVsBuilding: 2.5,
    };
    const vsUnit = CombatManager.calculateDamage(siegeStats, { kind: 'hoplite', isBuilding: false, crushArmor: 0.1 });
    const vsBldg = CombatManager.calculateDamage(siegeStats, { kind: 'house', isBuilding: true, crushArmor: 0.1 });
    expect(vsBldg).toBeGreaterThan(vsUnit * 2);
  });

  it('evaluates attack range with unit radii and diplomatic taunt shifts', () => {
    const a = new THREE.Vector3(0, 0, 0);
    const b = new THREE.Vector3(3.8, 0, 0);
    expect(CombatManager.isInRange(a, b, 2.5, 0.7, 0.7)).toBe(true);
    expect(CombatManager.isInRange(a, b, 2.0, 0.5, 0.5)).toBe(false);

    const hostile = CombatManager.processTaunt(30, 'greek', 'norse', 'ally');
    expect(hostile.newRelation).toBe('neutral');
    const war = CombatManager.processTaunt(30, 'greek', 'norse', 'neutral');
    expect(war.newRelation).toBe('enemy');
  });
});
