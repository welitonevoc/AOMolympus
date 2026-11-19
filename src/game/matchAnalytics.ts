import { AgeLevel, BuildingKind, GodPowerId, ResourceType, TeamId, UnitKind } from './types';

export interface MatchTimelineSample {
  timeSec: number;
  playerEco: number;
  enemyEco: number;
  playerArmy: number;
  enemyArmy: number;
  playerPop: number;
  enemyPop: number;
  playerFavor: number;
  enemyFavor: number;
  playerAge: AgeLevel;
  enemyAge: AgeLevel;
}

export interface ReplayEntityTuple {
  id?: string;
  k: string; // UnitKind or BuildingKind
  t: TeamId;
  x: number;
  z: number;
  hp: number; // 0..100 integer pct
}

export interface ReplayKeyframe {
  timeSec: number;
  pRes: Record<ResourceType, number>;
  eRes: Record<ResourceType, number>;
  pAge: AgeLevel;
  eAge: AgeLevel;
  units: ReplayEntityTuple[];
  buildings: ReplayEntityTuple[];
}

export interface ReplayPlaybackState {
  active: boolean;
  playing: boolean;
  speed: 1 | 2 | 4;
  currentTime: number;
  duration: number;
  fogDisabled: boolean;
  perspective: 'all' | 'player' | 'enemy';
  title: string;
}

export type MythSpecialEffectKind =
  | 'petrify'
  | 'throw_aoe'
  | 'cleave_heal'
  | 'flame_cone'
  | 'frost_freeze'
  | 'leap_strike'
  | 'heal_aura'
  | 'poison_nova'
  | 'gold_charge';

export interface MythSpecialAbilitySpec {
  name: string;
  description: string;
  cooldown: number;
  range: number;
  damageMultiplier: number;
  radius: number;
  effect: MythSpecialEffectKind;
  vfxHex: number;
}

export const MYTH_SPECIAL_ABILITIES: Partial<Record<UnitKind, MythSpecialAbilitySpec>> = {
  medusa: {
    name: 'Olhar Petrificante',
    description: 'Transforma o alvo em pedra por 3s e causa dano massivo perfurante.',
    cooldown: 16,
    range: 11,
    damageMultiplier: 2.6,
    radius: 2.4,
    effect: 'petrify',
    vfxHex: 0x34d399,
  },
  cyclops: {
    name: 'Arremesso Titânico',
    description: 'Arremessa o inimigo pelo ar causando impacto em área ao aterrissar.',
    cooldown: 14,
    range: 4.0,
    damageMultiplier: 2.4,
    radius: 4.2,
    effect: 'throw_aoe',
    vfxHex: 0xf59e0b,
  },
  minotaur: {
    name: 'Investida de Chifres',
    description: 'Empurra e derruba inimigos à frente com golpe brutal em cone.',
    cooldown: 12,
    range: 4.5,
    damageMultiplier: 2.1,
    radius: 3.4,
    effect: 'gold_charge',
    vfxHex: 0xfbbf24,
  },
  centaur: {
    name: 'Flecha Solar',
    description: 'Dispara flecha luminosa de longo alcance que perfura alvos próximos.',
    cooldown: 13,
    range: 13.5,
    damageMultiplier: 2.2,
    radius: 3.0,
    effect: 'gold_charge',
    vfxHex: 0xfef08a,
  },
  hydra: {
    name: 'Fúria de Múltiplas Cabeças',
    description: 'Mordida em área que regenera 18% da vida máxima da Hidra.',
    cooldown: 15,
    range: 4.2,
    damageMultiplier: 2.0,
    radius: 4.4,
    effect: 'cleave_heal',
    vfxHex: 0x22c55e,
  },
  manticore: {
    name: 'Saraivada de Espinhos',
    description: 'Dispara uma chuva de espinhos venenosos em área contra múltiplos alvos.',
    cooldown: 14,
    range: 12,
    damageMultiplier: 1.9,
    radius: 4.5,
    effect: 'poison_nova',
    vfxHex: 0xa3e635,
  },
  colossus: {
    name: 'Golpe Sísmico de Bronze',
    description: 'Esmaga o solo causando dano em área e reparando sua armadura.',
    cooldown: 16,
    range: 4.2,
    damageMultiplier: 2.2,
    radius: 4.8,
    effect: 'cleave_heal',
    vfxHex: 0xd97706,
  },
  avenger: {
    name: 'Salto do Vingador',
    description: 'Salta instantaneamente sobre o inimigo golpeando com fúria em arco.',
    cooldown: 11,
    range: 9.5,
    damageMultiplier: 2.0,
    radius: 3.0,
    effect: 'leap_strike',
    vfxHex: 0xf59e0b,
  },
  sphinx: {
    name: 'Redemoinho de Areia',
    description: 'Gira em alta velocidade fatiando todos os inimigos ao redor.',
    cooldown: 13,
    range: 4.0,
    damageMultiplier: 2.1,
    radius: 4.5,
    effect: 'gold_charge',
    vfxHex: 0xfde047,
  },
  scarab: {
    name: 'Estilhaço Ácido',
    description: 'Libera ácido corrosivo contra construções e tropas ao redor.',
    cooldown: 15,
    range: 4.0,
    damageMultiplier: 2.2,
    radius: 4.4,
    effect: 'poison_nova',
    vfxHex: 0x84cc16,
  },
  phoenix: {
    name: 'Sopro Solar da Fênix',
    description: 'Incendeia uma área com fogo celestial causando dano contínuo.',
    cooldown: 14,
    range: 11,
    damageMultiplier: 2.3,
    radius: 5.0,
    effect: 'flame_cone',
    vfxHex: 0xf97316,
  },
  valkyrie: {
    name: 'Bênção de Freya',
    description: 'Cura instantaneamente aliados próximos em um raio sagrado.',
    cooldown: 12,
    range: 7.5,
    damageMultiplier: 1.2,
    radius: 6.5,
    effect: 'heal_aura',
    vfxHex: 0x38bdf8,
  },
  troll: {
    name: 'Pedregulho Esmagador',
    description: 'Arremessa uma rocha pesada que estilhaça no impacto.',
    cooldown: 13,
    range: 10.5,
    damageMultiplier: 2.0,
    radius: 3.4,
    effect: 'throw_aoe',
    vfxHex: 0x94a3b8,
  },
  frost_giant: {
    name: 'Sopro Glacial',
    description: 'Congela um alvo inimigo no lugar e causa dano gélido em área.',
    cooldown: 15,
    range: 5.5,
    damageMultiplier: 2.2,
    radius: 4.0,
    effect: 'frost_freeze',
    vfxHex: 0x38bdf8,
  },
  fire_giant: {
    name: 'Bola de Fogo de Muspel',
    description: 'Lança esferas flamejantes que explodem contra grupos inimigos.',
    cooldown: 14,
    range: 11.5,
    damageMultiplier: 2.4,
    radius: 4.8,
    effect: 'flame_cone',
    vfxHex: 0xef4444,
  },
  fenris_wolf: {
    name: 'Uivo da Matilha',
    description: 'Avança ferozmente sobre a presa com dano amplificado.',
    cooldown: 11,
    range: 7.0,
    damageMultiplier: 2.2,
    radius: 3.2,
    effect: 'leap_strike',
    vfxHex: 0xe2e8f0,
  },
  promethean: {
    name: 'Fissão de Barro',
    description: 'Impacto sísmico em área que regenera o Prometeu.',
    cooldown: 14,
    range: 4.0,
    damageMultiplier: 1.9,
    radius: 3.8,
    effect: 'cleave_heal',
    vfxHex: 0xc2410c,
  },
  automaton: {
    name: 'Sobrecarga de Bronze',
    description: 'Pulso elétrico que causa dano em área e repara autômatos aliados.',
    cooldown: 13,
    range: 4.2,
    damageMultiplier: 1.8,
    radius: 4.2,
    effect: 'heal_aura',
    vfxHex: 0xfbbf24,
  },
  qilin: {
    name: 'Aura Celestial do Qilin',
    description: 'Irradia luz curativa que restaura aliados próximos e queima inimigos.',
    cooldown: 13,
    range: 7.5,
    damageMultiplier: 1.7,
    radius: 6.2,
    effect: 'heal_aura',
    vfxHex: 0x67e8f9,
  },
  azure_dragon: {
    name: 'Tormenta do Dragão Azul',
    description: 'Invoca rajada de raios e vento em cone sobre inimigos.',
    cooldown: 16,
    range: 12,
    damageMultiplier: 2.5,
    radius: 5.5,
    effect: 'flame_cone',
    vfxHex: 0x38bdf8,
  },
  petsuchos: {
    name: 'Raio Solar do Petsuchos',
    description: 'Concentra um feixe solar incandescente sobre o alvo e inimigos próximos.',
    cooldown: 13,
    range: 12.5,
    damageMultiplier: 2.3,
    radius: 3.4,
    effect: 'flame_cone',
    vfxHex: 0xfde047,
  },
  taotie: {
    name: 'Devorar Essência',
    description: 'Golpe devorador em área que recupera grande parte da vida.',
    cooldown: 15,
    range: 4.5,
    damageMultiplier: 2.2,
    radius: 4.2,
    effect: 'cleave_heal',
    vfxHex: 0xf97316,
  },
  yazi: {
    name: 'Golpe Espectral',
    description: 'Teleporta até o alvo aplicando um corte crítico.',
    cooldown: 12,
    range: 9.0,
    damageMultiplier: 2.2,
    radius: 2.8,
    effect: 'leap_strike',
    vfxHex: 0xa855f7,
  },
  mummy: {
    name: 'Maldição das Areias',
    description: 'Libera névoa necrótica que envenena e enfraquece formações inimigas.',
    cooldown: 14,
    range: 9.5,
    damageMultiplier: 2.1,
    radius: 4.6,
    effect: 'poison_nova',
    vfxHex: 0x84cc16,
  },
};

const GOD_POWER_RECAST_BASE: Partial<Record<GodPowerId, { base: number; step: number }>> = {
  lightning: { base: 20, step: 15 },
  prosperity: { base: 25, step: 20 },
  healing: { base: 25, step: 18 },
  frost: { base: 40, step: 25 },
  meteor: { base: 65, step: 45 },
  volcanic_eruption: { base: 65, step: 45 },
  blizzard: { base: 60, step: 40 },
  darkest_night: { base: 40, step: 25 },
  disease: { base: 35, step: 25 },
  maelstrom: { base: 55, step: 35 },
  necromancy: { base: 45, step: 30 },
  black_hole: { base: 70, step: 50 },
  solar_beam: { base: 50, step: 35 },
  walking_woods: { base: 40, step: 25 },
  chaos: { base: 45, step: 30 },
  create_gold: { base: 25, step: 18 },
  flaming_weapons: { base: 45, step: 30 },
  great_hunt: { base: 20, step: 15 },
  lightning_storm: { base: 65, step: 45 },
  locust_swarm: { base: 35, step: 25 },
  pestilence: { base: 35, step: 25 },
  rain: { base: 22, step: 15 },
  restoration: { base: 35, step: 25 },
  sandstorm: { base: 40, step: 25 },
  sentinel: { base: 25, step: 15 },
  spiders: { base: 30, step: 20 },
  tornado: { base: 65, step: 45 },
  traitors: { base: 40, step: 25 },
  tremor: { base: 25, step: 18 },
  undermine: { base: 35, step: 25 },
};

/**
 * Age of Mythology: Retold reusable God Power Favor cost.
 * First cast is always free (0 Favor). Subsequent casts scale in Favor cost.
 * Wonder Age slashes recast Favor cost by 75%!
 */
export function getRetoldRecastFavorCost(
  powerId: GodPowerId,
  usesCount: number,
  wonderAgeActive: boolean
): number {
  if (usesCount <= 0) return 0;
  const spec = GOD_POWER_RECAST_BASE[powerId] ?? { base: 30, step: 20 };
  const raw = spec.base + (usesCount - 1) * spec.step;
  return wonderAgeActive ? Math.max(5, Math.round(raw * 0.25)) : raw;
}

/**
 * Age of Mythology: Retold reusable God Power cooldown.
 * Wonder Age reduces cooldown by 50%!
 */
export function getRetoldCooldown(
  baseCooldown: number,
  usesCount: number,
  wonderAgeActive: boolean
): number {
  const scaled = Math.round(baseCooldown * (1 + Math.min(0.6, usesCount * 0.12)));
  return wonderAgeActive ? Math.max(12, Math.round(scaled * 0.5)) : scaled;
}

/**
 * Builds synthetic demo timeline + replay frames for legacy/demo recorded matches
 * that were saved before the full timeline recorder existed.
 */
export function buildDemoReplayData(durationSec = 480): {
  timeline: MatchTimelineSample[];
  frames: ReplayKeyframe[];
} {
  const steps = Math.max(8, Math.min(28, Math.round(durationSec / 20)));
  const timeline: MatchTimelineSample[] = [];
  const frames: ReplayKeyframe[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = Math.round((i / steps) * durationSec);
    const prog = i / steps;
    const pAge: AgeLevel = prog > 0.72 ? 4 : prog > 0.45 ? 3 : prog > 0.2 ? 2 : 1;
    const eAge: AgeLevel = prog > 0.8 ? 4 : prog > 0.52 ? 3 : prog > 0.25 ? 2 : 1;

    timeline.push({
      timeSec: t,
      playerEco: Math.round(620 + prog * 3400 + Math.sin(i * 0.8) * 140),
      enemyEco: Math.round(640 + prog * 2850 + Math.cos(i * 0.7) * 160),
      playerArmy: Math.round(140 + prog * prog * 2200),
      enemyArmy: Math.round(160 + prog * 1700 * (1 - Math.max(0, prog - 0.75) * 1.4)),
      playerPop: Math.round(9 + prog * 54),
      enemyPop: Math.round(8 + prog * 42 * (1 - Math.max(0, prog - 0.8) * 1.6)),
      playerFavor: Math.round(15 + prog * 165),
      enemyFavor: Math.round(15 + prog * 130),
      playerAge: pAge,
      enemyAge: eAge,
    });

    const pushDist = prog * 54;
    const units: ReplayEntityTuple[] = [
      { k: 'villager', t: 'player', x: -30, z: 32, hp: 100 },
      { k: 'villager', t: 'player', x: -27, z: 38, hp: 100 },
      { k: 'hoplite', t: 'player', x: -28 + pushDist, z: 28 - pushDist, hp: 92 },
      { k: 'toxotes', t: 'player', x: -31 + pushDist * 0.92, z: 26 - pushDist * 0.92, hp: 100 },
      { k: 'hippikon', t: 'player', x: -24 + pushDist * 1.04, z: 24 - pushDist * 1.04, hp: 85 },
      { k: 'villager', t: 'enemy', x: 30, z: -32, hp: 100 },
      { k: 'egypt_spearman', t: 'enemy', x: 26 - prog * 22, z: -26 + prog * 22, hp: Math.max(20, Math.round(100 - prog * 65)) },
      { k: 'chariot_archer', t: 'enemy', x: 29 - prog * 18, z: -24 + prog * 18, hp: Math.max(25, Math.round(100 - prog * 58)) },
    ];
    if (prog > 0.35) {
      units.push({ k: 'minotaur', t: 'player', x: -26 + pushDist, z: 25 - pushDist, hp: 95 });
    }
    const buildings: ReplayEntityTuple[] = [
      { k: 'town_center', t: 'player', x: -34, z: 34, hp: 100 },
      { k: 'house', t: 'player', x: -41, z: 28, hp: 100 },
      { k: 'barracks', t: 'player', x: -26, z: 26, hp: 100 },
      { k: 'temple', t: 'player', x: -40, z: 39, hp: 100 },
      { k: 'town_center', t: 'enemy', x: 34, z: -34, hp: Math.max(12, Math.round(100 - Math.max(0, prog - 0.65) * 240)) },
      { k: 'barracks', t: 'enemy', x: 26, z: -29, hp: Math.max(15, Math.round(100 - Math.max(0, prog - 0.5) * 180)) },
      { k: 'house', t: 'enemy', x: 41, z: -28, hp: 100 },
    ];
    frames.push({
      timeSec: t,
      pRes: { food: Math.round(300 + prog * 1200), wood: Math.round(280 + prog * 950), gold: Math.round(200 + prog * 1100), favor: Math.round(15 + prog * 140) },
      eRes: { food: Math.round(320 + prog * 800), wood: Math.round(300 + prog * 700), gold: Math.round(220 + prog * 750), favor: Math.round(20 + prog * 100) },
      pAge,
      eAge,
      units,
      buildings,
    });
  }

  return { timeline, frames };
}
