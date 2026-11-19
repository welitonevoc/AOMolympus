import { describe, expect, it } from 'vitest';
import { CombatManager } from '../combat';
import { UNIT_STATS } from '../types';

describe('CombatManager', () => {
  it('applies distinct passive modifiers per pantheon', () => {
    const base = UNIT_STATS.hoplite;
    const greek = CombatManager.applyPassiveModifiers(base, 'greek');
    const norse = CombatManager.applyPassiveModifiers(base, 'norse');
    const egyptian = CombatManager.applyPassiveModifiers(base, 'egyptian');

    expect(greek.maxHp).toBeGreaterThan(base.maxHp);
    expect(norse.speed).toBeGreaterThan(base.speed);
    expect(norse.attack).toBeGreaterThan(base.attack);
    expect(egyptian.attack).toBeGreaterThan(base.attack);
  });

  it('reduces damage based on matching armor type while honoring minimum floor', () => {
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
  });

  it('applies bonus damage multipliers against cavalry, myth units, and buildings', () => {
    const antiCavStats = {
      ...UNIT_STATS.hoplite,
      attack: 12,
      damageType: 'hack' as const,
      bonusVsCavalry: 1.75,
    };
    const vsInf = CombatManager.calculateDamage(antiCavStats, { kind: 'hoplite', hackArmor: 0.2 });
    const vsCav = CombatManager.calculateDamage(antiCavStats, { kind: 'cavalry', hackArmor: 0.2 });
    expect(vsCav).toBeGreaterThan(vsInf);

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
});
