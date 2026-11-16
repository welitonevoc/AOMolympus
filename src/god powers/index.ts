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
};
