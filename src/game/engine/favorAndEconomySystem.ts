import * as THREE from 'three';
import { PANTHEONS, PantheonId, ResourceType, TeamId, TechId, UnitKind, UnitStats } from '../types';
import { BuildingEntity, UnitEntity } from './engineTypes';

export interface FavorSystemContext {
  units: Map<string, UnitEntity>;
  buildings: Map<string, BuildingEntity>;
  researchedTechs: TechId[];
  enemyResearchedTechs: TechId[];
  chosenMinorGods: string[];
  enemyAge: number;
  majorGodName: string;
  enemyPantheon: PantheonId;
  resources: Record<ResourceType, number>;
  enemyResources: Record<ResourceType, number>;
  playerCombatFavorRate: number;
  enemyCombatFavorRate: number;
  relicsHeld: number;
  addCombatFavor: (team: TeamId, amount: number) => void;
  teamPantheon: (team: TeamId) => PantheonId;
  unitStats: (kind: UnitKind, team: TeamId) => UnitStats;
  isWorkerKind: (kind: UnitKind) => boolean;
  getUnitRadius: (kind: UnitKind) => number;
  isTeamIsis: (team: TeamId) => boolean;
  isTeamRa: (team: TeamId) => boolean;
}

export interface OracleVisionMetrics {
  los: number;
  efficiency: number;
  isFullVision: boolean;
  favorPerSec: number;
}

export interface TeamFavorBreakdown {
  totalRate: number;
  breakdown: { label: string; rate: number; detail?: string }[];
  prayingCount: number;
  empoweredMonuments: number;
  templeRates: Map<string, number>;
  oracleSummary: { count: number; avgEfficiencyPct: number; fullVisionCount: number };
}

export function getOracleVisionMetrics(
  ctx: FavorSystemContext,
  u: UnitEntity
): OracleVisionMetrics {
  const techs = u.team === 'player' ? ctx.researchedTechs : ctx.enemyResearchedTechs;
  const baseLos = ctx.unitStats('oracle', u.team).los ?? 14;
  const techLos = techs.includes('perception') ? 4 : 0;
  const idleLos = u.state === 'idle' ? 10 : 0;
  const los = baseLos + techLos + idleLos;
  if (u.hp <= 0 || u.state !== 'idle') {
    return { los, efficiency: 0, isFullVision: false, favorPerSec: 0 };
  }

  let efficiency = 1.0;
  for (const other of ctx.units.values()) {
    if (
      other.id === u.id ||
      other.team !== u.team ||
      other.kind !== 'oracle' ||
      other.hp <= 0 ||
      other.state !== 'idle'
    ) {
      continue;
    }
    const otherLos = (ctx.unitStats('oracle', other.team).los ?? 14) + techLos + 10;
    const combined = los + otherLos;
    const d = Math.hypot(
      u.mesh.position.x - other.mesh.position.x,
      u.mesh.position.z - other.mesh.position.z
    );
    if (d < combined) {
      const overlapRatio = 1 - d / Math.max(1, combined);
      efficiency -= overlapRatio * 0.55;
    }
  }

  for (const b of ctx.buildings.values()) {
    const d = Math.hypot(
      u.mesh.position.x - b.mesh.position.x,
      u.mesh.position.z - b.mesh.position.z
    );
    if (d < los * 0.42 + b.radius) {
      efficiency -= 0.14;
    }
  }

  efficiency = THREE.MathUtils.clamp(efficiency, 0.2, 1.0);
  const isFullVision = efficiency >= 0.96;
  const baseRate = u.isPromotedHero ? 0.9 : 0.48;
  let mult = 1.0;
  if (techs.includes('perception')) mult *= 1.15;
  if (techs.includes('horns_of_consecration')) mult *= 1.25;
  const hasTheia =
    u.team === 'player'
      ? ctx.chosenMinorGods.includes('Theia')
      : ctx.teamPantheon('enemy') === 'atlantean' && ctx.enemyAge >= 4;
  if (hasTheia && isFullVision) mult *= 1.1;

  return {
    los,
    efficiency,
    isFullVision,
    favorPerSec: baseRate * efficiency * mult,
  };
}

export function awardNorseCombatFavor(
  ctx: FavorSystemContext,
  team: TeamId,
  kind: UnitKind | undefined,
  fromGreatHall: boolean | undefined,
  damageDealt: number
): void {
  if (!kind || damageDealt <= 0) return;
  if (ctx.teamPantheon(team) !== 'norse') return;
  if (ctx.isWorkerKind(kind) || kind === 'ox_cart' || kind === 'llama_caravan') return;

  const godName = team === 'player' ? ctx.majorGodName : PANTHEONS[ctx.enemyPantheon].deity;
  let gain = Math.min(1.5, damageDealt * 0.011);
  if (kind === 'hersir') gain *= 3.4;
  if (godName.toLowerCase().includes('odin') && fromGreatHall) {
    gain *= 1.25;
  }
  if (gain <= 0) return;

  const pool = team === 'player' ? ctx.resources : ctx.enemyResources;
  pool.favor = Math.min(200, pool.favor + gain);
  ctx.addCombatFavor(team, gain);
}

export function computeTeamFavorBreakdown(
  ctx: FavorSystemContext,
  team: TeamId
): TeamFavorBreakdown {
  const pant = ctx.teamPantheon(team);
  const techs = team === 'player' ? ctx.researchedTechs : ctx.enemyResearchedTechs;
  const godName = team === 'player' ? ctx.majorGodName : PANTHEONS[ctx.enemyPantheon].deity;
  const breakdown: { label: string; rate: number; detail?: string }[] = [];
  const templeRates = new Map<string, number>();

  let totalRate = 0.1;
  breakdown.push({ label: 'Altar Ancestral', rate: 0.1 });

  let prayingCount = 0;
  let empoweredMonuments = 0;
  let oracleCount = 0;
  let oracleEffSum = 0;
  let oracleIdleCount = 0;
  let oracleFullCount = 0;

  if (pant === 'greek') {
    const isZeus = godName.toLowerCase().includes('zeus');
    const hasGoldenApples = techs.includes('golden_apples');
    const prayerMult = (isZeus ? 1.2 : 1.0) * (hasGoldenApples ? 1.2 : 1.0);
    let prayerRate = 0;
    for (const u of ctx.units.values()) {
      if (
        u.team !== team ||
        u.hp <= 0 ||
        u.state !== 'pray' ||
        !u.targetEntityId ||
        !ctx.isWorkerKind(u.kind)
      ) {
        continue;
      }
      const temple = ctx.buildings.get(u.targetEntityId);
      if (!temple || !temple.isConstructed || temple.team !== team || temple.kind !== 'temple') {
        continue;
      }
      const d =
        u.mesh.position.distanceTo(temple.mesh.position) -
        temple.radius -
        ctx.getUnitRadius(u.kind);
      if (d > 2.6) continue;
      const r = (0.24 / (1 + 0.14 * prayingCount)) * prayerMult;
      prayingCount++;
      prayerRate += r;
      templeRates.set(temple.id, (templeRates.get(temple.id) ?? 0) + r);
    }
    totalRate += prayerRate;
    const mods: string[] = [];
    if (isZeus) mods.push('Zeus +20%');
    if (hasGoldenApples) mods.push('Maçãs de Ouro +20%');
    breakdown.push({
      label: `Oração nos Templos (${prayingCount} ald.)`,
      rate: Number(prayerRate.toFixed(2)),
      detail: mods.length > 0 ? mods.join(' · ') : 'Envie aldeões aos Templos',
    });
  } else if (pant === 'egyptian') {
    const isIsis = ctx.isTeamIsis(team);
    const isRa = ctx.isTeamRa(team);
    const hasNecropolis = techs.includes('necropolis');
    let monumentRate = 0;
    let monumentCount = 0;
    for (const b of ctx.buildings.values()) {
      if (b.team !== team || !b.isConstructed || b.kind !== 'monument') continue;
      if (monumentCount >= 5) break;
      monumentCount++;
      let r = 0.75;
      if (isIsis) r *= 1.25;
      if (hasNecropolis) r *= 1.25;
      if ((b.empoweredTimer ?? 0) > 0) {
        empoweredMonuments++;
        if (b.empoweredBy === 'pharaoh') {
          r *= isRa ? 1.9 : 1.65;
        } else {
          r *= isRa ? 1.55 : 1.35;
        }
      }
      monumentRate += r;
    }
    totalRate += monumentRate;
    const mods: string[] = [];
    if (isIsis) mods.push('Ísis +25%');
    if (hasNecropolis) mods.push('Necrópole +25%');
    if (empoweredMonuments > 0) mods.push(`${empoweredMonuments} Energizado(s)`);
    breakdown.push({
      label: `Monumentos (${monumentCount}/5)`,
      rate: Number(monumentRate.toFixed(2)),
      detail: mods.length > 0 ? mods.join(' · ') : 'Faraó e Sacerdotes aumentam a taxa',
    });
  } else if (pant === 'norse') {
    const combatRate = team === 'player' ? ctx.playerCombatFavorRate : ctx.enemyCombatFavorRate;
    totalRate += combatRate;
    const isOdin = godName.toLowerCase().includes('odin');
    breakdown.push({
      label: 'Combate & Bravura',
      rate: Number(combatRate.toFixed(2)),
      detail: isOdin
        ? 'Hersir 3,4× · Odin +25% Grande Salão'
        : 'Tropas & navios geram favor em combate (Hersir 3,4×)',
    });
    if (techs.includes('hammer_of_the_gods')) {
      let hersirCount = 0;
      for (const u of ctx.units.values()) {
        if (u.team === team && u.hp > 0 && u.kind === 'hersir') hersirCount++;
      }
      const hammerRate = hersirCount * 0.48;
      totalRate += hammerRate;
      breakdown.push({
        label: `Martelo dos Deuses (${hersirCount} Hersirs)`,
        rate: Number(hammerRate.toFixed(2)),
        detail: 'Thor: Hersirs geram favor passivo',
      });
    }
  } else if (pant === 'atlantean') {
    let oracleRate = 0;
    for (const u of ctx.units.values()) {
      if (u.team !== team || u.hp <= 0 || u.kind !== 'oracle') continue;
      oracleCount++;
      if (u.state === 'idle') {
        const m = getOracleVisionMetrics(ctx, u);
        oracleIdleCount++;
        oracleEffSum += m.efficiency * 100;
        if (m.isFullVision) oracleFullCount++;
        oracleRate += m.favorPerSec;
      }
    }
    totalRate += oracleRate;
    const avgPct = oracleIdleCount > 0 ? Math.round(oracleEffSum / oracleIdleCount) : 0;
    breakdown.push({
      label: `Oráculos em Vigília (${oracleIdleCount}/${oracleCount})`,
      rate: Number(oracleRate.toFixed(2)),
      detail:
        oracleIdleCount > 0
          ? `Visão média ${avgPct}% (${oracleFullCount} plenos)`
          : 'Deixe Oráculos parados e espaçados',
    });
  }

  let wonders = 0;
  for (const b of ctx.buildings.values()) {
    if (b.team === team && b.isConstructed && b.kind === 'wonder') wonders++;
  }
  if (wonders > 0) {
    const wonderRate = wonders * 6.0;
    totalRate += wonderRate;
    breakdown.push({ label: 'Era das Maravilhas', rate: Number(wonderRate.toFixed(2)) });
  }

  if (team === 'player' && ctx.relicsHeld > 0) {
    const relicRate = ctx.relicsHeld * 0.45;
    totalRate += relicRate;
    breakdown.push({ label: `Relíquias (${ctx.relicsHeld})`, rate: Number(relicRate.toFixed(2)) });
  }

  return {
    totalRate,
    breakdown,
    prayingCount,
    empoweredMonuments,
    templeRates,
    oracleSummary: {
      count: oracleCount,
      avgEfficiencyPct: oracleIdleCount > 0 ? Math.round(oracleEffSum / oracleIdleCount) : 0,
      fullVisionCount: oracleFullCount,
    },
  };
}
