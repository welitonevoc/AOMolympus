import { RmsGeneratedMap } from './rmsEngine';

let activeRmsMap: RmsGeneratedMap | null = null;

export function setActiveRmsMap(map: RmsGeneratedMap | null) {
  activeRmsMap = map;
}

export function getActiveRmsMap(): RmsGeneratedMap | null {
  return activeRmsMap;
}

export function clearActiveRmsMap() {
  activeRmsMap = null;
}
