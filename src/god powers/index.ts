import chaosPowerXmb from './chaos';
import createGoldPowerXmb from './create gold';
import flamingWeaponsPowerXmb from './flaming weapons';
import frostPowerXmb from './frost';
import greatHuntPowerXmb from './great hunt';
import lightningStormPowerXmb from './lightning storm';
import locustSwarmPowerXmb from './locust swarm';
import meteorPowerXmb from './meteor';
import pestilencePowerXmb from './pestilence';
import rainPowerXmb from './rain';
import restorationPowerXmb from './restoration';
import sandstormPowerXmb from './sandstorm';
import sentinelPowerXmb from './sentinel';
import spidersPowerXmb from './spiders';
import tornadoPowerXmb from './tornado';
import traitorsPowerXmb from './traitors';
import tremorPowerXmb from './tremor';
import underminePowerXmb from './undermine';
import walkingWoodsPowerXmb from './walking woods';
// ── Newly added god powers (complete coverage) ──
import lightningPowerXmb from './lightning';
import healingPowerXmb from './healing';
import volcanicEruptionPowerXmb from './volcanic eruption';
import blackHolePowerXmb from './black hole';
import prosperityPowerXmb from './prosperity';
import blizzardPowerXmb from './blizzard';
import darkestNightPowerXmb from './darkest night';
import diseasePowerXmb from './disease';
import maelstromPowerXmb from './maelstrom';
import necromancyPowerXmb from './necromancy';
import solarBeamPowerXmb from './solar beam';

export interface XmbNode {
  tag: string;
  attributes?: Record<string, string>;
  value?: string;
  children?: readonly XmbNode[];
}

export const XMB_GOD_POWERS = {
  chaos: chaosPowerXmb,
  create_gold: createGoldPowerXmb,
  flaming_weapons: flamingWeaponsPowerXmb,
  frost: frostPowerXmb,
  great_hunt: greatHuntPowerXmb,
  lightning_storm: lightningStormPowerXmb,
  locust_swarm: locustSwarmPowerXmb,
  meteor: meteorPowerXmb,
  pestilence: pestilencePowerXmb,
  rain: rainPowerXmb,
  restoration: restorationPowerXmb,
  sandstorm: sandstormPowerXmb,
  sentinel: sentinelPowerXmb,
  spiders: spidersPowerXmb,
  tornado: tornadoPowerXmb,
  traitors: traitorsPowerXmb,
  tremor: tremorPowerXmb,
  undermine: underminePowerXmb,
  walking_woods: walkingWoodsPowerXmb,
  // ── Complete coverage — previously missing ──
  lightning: lightningPowerXmb,
  healing: healingPowerXmb,
  volcanic_eruption: volcanicEruptionPowerXmb,
  black_hole: blackHolePowerXmb,
  prosperity: prosperityPowerXmb,
  blizzard: blizzardPowerXmb,
  darkest_night: darkestNightPowerXmb,
  disease: diseasePowerXmb,
  maelstrom: maelstromPowerXmb,
  necromancy: necromancyPowerXmb,
  solar_beam: solarBeamPowerXmb,
} as const;

export type XmbGodPowerKey = keyof typeof XMB_GOD_POWERS;

export function getXmbChildValue(node: XmbNode, tagName: string): string | undefined {
  const found = node.children?.find((c) => c.tag === tagName);
  return found?.value;
}

export function getXmbNumber(node: XmbNode, tagName: string, fallback: number): number {
  const raw = getXmbChildValue(node, tagName);
  if (!raw) return fallback;
  const parsed = parseFloat(raw.replace(/f$/i, '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export {
  chaosPowerXmb,
  createGoldPowerXmb,
  flamingWeaponsPowerXmb,
  frostPowerXmb,
  greatHuntPowerXmb,
  lightningStormPowerXmb,
  locustSwarmPowerXmb,
  meteorPowerXmb,
  pestilencePowerXmb,
  rainPowerXmb,
  restorationPowerXmb,
  sandstormPowerXmb,
  sentinelPowerXmb,
  spidersPowerXmb,
  tornadoPowerXmb,
  traitorsPowerXmb,
  tremorPowerXmb,
  underminePowerXmb,
  walkingWoodsPowerXmb,
  // ── New exports ──
  lightningPowerXmb,
  healingPowerXmb,
  volcanicEruptionPowerXmb,
  blackHolePowerXmb,
  prosperityPowerXmb,
  blizzardPowerXmb,
  darkestNightPowerXmb,
  diseasePowerXmb,
  maelstromPowerXmb,
  necromancyPowerXmb,
  solarBeamPowerXmb,
};
