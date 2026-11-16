import * as THREE from 'three';
import { DamageType, UnitKind, UnitStats, UNIT_STATS } from './types';

export interface PassiveModifiers {
  hpMultiplier: number;
  attackMultiplier: number;
  speedMultiplier: number;
  armorBonus: number;
}

export class CombatManager {
  /**
   * Get passive stat multipliers based on civilization pantheon.
   * - Greek: +10% Max HP & +0.05 Armor resilience
   * - Norse: +10% Movement speed & +10% Attack speed
   * - Egyptian: +10% Attack power & +5% HP
   * - Atlantean: +5% HP, +5% Attack, +5% Speed & +0.03 Armor
   */
  public static getPantheonPassive(pantheonId: string = 'greek'): PassiveModifiers {
    switch (pantheonId) {
      case 'greek':
        return { hpMultiplier: 1.10, attackMultiplier: 1.0, speedMultiplier: 1.0, armorBonus: 0.05 };
      case 'norse':
        return { hpMultiplier: 1.0, attackMultiplier: 1.10, speedMultiplier: 1.10, armorBonus: 0.0 };
      case 'egyptian':
        return { hpMultiplier: 1.05, attackMultiplier: 1.10, speedMultiplier: 1.0, armorBonus: 0.02 };
      case 'atlantes':
      case 'atlantean':
        return { hpMultiplier: 1.05, attackMultiplier: 1.05, speedMultiplier: 1.05, armorBonus: 0.03 };
      default:
        return { hpMultiplier: 1.0, attackMultiplier: 1.0, speedMultiplier: 1.0, armorBonus: 0.0 };
    }
  }

  /**
   * Apply passive pantheon modifiers to unit stats.
   */
  public static applyPassiveModifiers(stats: UnitStats, pantheonId: string = 'greek'): UnitStats {
    const mod = CombatManager.getPantheonPassive(pantheonId);
    return {
      ...stats,
      maxHp: Math.round(stats.maxHp * mod.hpMultiplier),
      attack: Math.round(stats.attack * mod.attackMultiplier * 10) / 10,
      speed: Math.round(stats.speed * mod.speedMultiplier * 10) / 10,
      hackArmor: Math.min(0.85, (stats.hackArmor ?? 0.2) + mod.armorBonus),
      pierceArmor: Math.min(0.85, (stats.pierceArmor ?? 0.2) + mod.armorBonus),
      crushArmor: Math.min(0.85, (stats.crushArmor ?? 0.1) + mod.armorBonus),
    };
  }

  /**
   * Calculate effective damage dealt by an attacker to a target using statistics defined in types.ts.
   */
  public static calculateDamage(
    attackerStats: UnitStats,
    target: {
      kind: string;
      isBuilding?: boolean;
      isMythic?: boolean;
      isSiege?: boolean;
      hackArmor?: number;
      pierceArmor?: number;
      crushArmor?: number;
    },
    baseDmgOverride?: number
  ): number {
    const rawDmg = baseDmgOverride ?? attackerStats.attack;
    const damageType = attackerStats.damageType ?? 'hack';

    let armorValue = 0.15;
    if (damageType === 'hack') armorValue = target.hackArmor ?? 0.2;
    else if (damageType === 'pierce') armorValue = target.pierceArmor ?? 0.2;
    else if (damageType === 'crush') armorValue = target.crushArmor ?? 0.1;

    let finalDmg = rawDmg * Math.max(0.15, 1 - armorValue);

    if (target.isBuilding && attackerStats.bonusVsBuilding) {
      finalDmg *= attackerStats.bonusVsBuilding;
    }
    if (target.isMythic && attackerStats.bonusVsMyth) {
      finalDmg *= attackerStats.bonusVsMyth;
    }
    if ((target.kind === 'cavalry' || target.kind === 'prodromos') && attackerStats.bonusVsCavalry) {
      finalDmg *= attackerStats.bonusVsCavalry;
    }
    if ((target.kind === 'hoplite' || target.kind === 'hipaspist' || target.kind === 'myrmidon' || target.kind === 'villager') && attackerStats.bonusVsInfantry) {
      finalDmg *= attackerStats.bonusVsInfantry;
    }
    if ((target.kind === 'archer' || target.kind === 'peltast' || target.kind === 'gastraphetes') && attackerStats.bonusVsArcher) {
      finalDmg *= attackerStats.bonusVsArcher;
    }
    if ((target.isSiege || target.kind === 'siege' || target.kind === 'ram') && attackerStats.bonusVsSiege) {
      finalDmg *= attackerStats.bonusVsSiege;
    }

    return Math.max(1, Math.round(finalDmg));
  }

  /**
   * Check if target is within attack range of attacker considering radii.
   */
  public static isInRange(
    attackerPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    attackerRange: number,
    attackerRadius: number = 0.5,
    targetRadius: number = 0.5
  ): boolean {
    const dist = attackerPos.distanceTo(targetPos);
    const effectiveRange = attackerRange + attackerRadius + targetRadius;
    return dist <= effectiveRange;
  }

  /**
   * Retrieve unit stats from UNIT_STATS.
   */
  public static getStats(kind: UnitKind): UnitStats {
    return UNIT_STATS[kind] ?? UNIT_STATS.hoplite;
  }

  /**
   * Process a taunt sent to a target pantheon/team and compute diplomatic shift.
   */
  public static processTaunt(
    tauntId: number,
    senderPantheon: string,
    targetPantheon: string,
    currentRelation: 'ally' | 'neutral' | 'enemy'
  ): { message: TauntMessage; newRelation: 'ally' | 'neutral' | 'enemy'; textAnnouncement: string } {
    const taunt = GAME_TAUNTS[tauntId] ?? GAME_TAUNTS[1];
    let newRelation = currentRelation;

    if (taunt.diplomacyImpact === 'hostile' && currentRelation === 'ally') {
      newRelation = 'neutral';
    } else if (taunt.diplomacyImpact === 'hostile' && currentRelation === 'neutral') {
      newRelation = 'enemy';
    } else if (taunt.diplomacyImpact === 'friendly' && currentRelation === 'enemy') {
      newRelation = 'neutral';
    }

    const textAnnouncement = `[Taunt #${taunt.id}] ${senderPantheon.toUpperCase()} para ${targetPantheon.toUpperCase()}: "${taunt.pt}"`;
    return { message: taunt, newRelation, textAnnouncement };
  }
}

export interface TauntMessage {
  id: number;
  text: string;
  pt: string;
  soundTone: number;
  diplomacyImpact: 'hostile' | 'friendly' | 'neutral';
}

export const GAME_TAUNTS: Record<number, TauntMessage> = {
  1: { id: 1, text: 'Yes!', pt: 'Sim!', soundTone: 520, diplomacyImpact: 'neutral' },
  2: { id: 2, text: 'No!', pt: 'Não!', soundTone: 280, diplomacyImpact: 'neutral' },
  3: { id: 3, text: 'Start the game already!', pt: 'Comecem o jogo logo!', soundTone: 640, diplomacyImpact: 'neutral' },
  4: { id: 4, text: 'Enemy sighted!', pt: 'Inimigo avistado!', soundTone: 760, diplomacyImpact: 'hostile' },
  5: { id: 5, text: 'Sure, blame it on your ISP!', pt: 'Claro, a culpa é da sua conexão!', soundTone: 440, diplomacyImpact: 'neutral' },
  30: { id: 30, text: 'The gods are displeased!', pt: 'Os deuses estão desgostosos!', soundTone: 220, diplomacyImpact: 'hostile' },
  42: { id: 42, text: 'Loneliness...', pt: 'Solidão...', soundTone: 340, diplomacyImpact: 'neutral' },
  48: { id: 48, text: 'Aww, is the baby going to cry?', pt: 'Ah, o bebê vai chorar?', soundTone: 820, diplomacyImpact: 'hostile' },
};

