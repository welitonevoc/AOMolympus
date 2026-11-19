import totalWarXsRaw from './Total War I.xs?raw';
import totalWarXmlRaw from './Total War I.xml?raw';

export type TotalWarEnvironment = 'frozen' | 'tropical';

export interface TotalWarXsParams {
  title: string;
  author: string;
  xmlImagePath: string;
  baseTilesNormal: number;
  baseTilesLarge: number;
  playerCircularRadius: number;
  islandSizeRatio: number;
  coastSizeRatio: number;
  innerValleySizeRatio: number;
  connectionWidth: number;
  settlementsPerPlayer: number;
  relicsPerPlayer: number;
  relicMinDistance: number;
  relicMaxDistance: number;
  fishTypes: ('Mahi' | 'Perch' | 'Salmon')[];
  frozenSeaLife: ('Orca' | 'Whale')[];
  tropicalSeaLife: ('Shark')[];
  rawTreasuryResource: number;
  playableTreasuryResource: number;
  startingFavor: number;
  dayDurationSec: number;
  duskDurationSec: number;
  nightDurationSec: number;
  destroyAllOnDefeat: boolean;
}

function extractInt(src: string, regex: RegExp, fallback: number): number {
  const m = src.match(regex);
  if (!m) return fallback;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : fallback;
}

function extractFloat(src: string, regex: RegExp, fallback: number): number {
  const m = src.match(regex);
  if (!m) return fallback;
  const n = Number.parseFloat(m[1]);
  return Number.isFinite(n) ? n : fallback;
}

export function parseTotalWarXsScript(xsText: string, xmlText: string): TotalWarXsParams {
  const titleMatch = xsText.match(/rmSetTriggerEffectParam\("Message",\s*"([^"]+)"\)/);
  const xmlImgMatch = xmlText.match(/imagepath\s*=\s*"([^"]+)"/);

  const baseTilesNormal = extractInt(xsText, /int\s+myTiles\s*=\s*(\d+)/, 9000);
  const baseTilesLarge = extractInt(xsText, /if\(cMapSize\s*==\s*1\)\s*\{\s*myTiles\s*=\s*(\d+)/, 12000);
  const playerCircularRadius = extractFloat(xsText, /rmPlacePlayersCircular\(\s*([0-9.]+)/, 0.42);
  const islandSizeRatio = extractFloat(xsText, /rmSetAreaSize\(myIsland,\s*([0-9.]+)/, 0.34);
  const coastSizeRatio = extractFloat(xsText, /rmSetAreaSize\(myCoast,\s*([0-9.]+)/, 0.28);
  const innerValleySizeRatio = extractFloat(xsText, /rmSetAreaSize\(myInnerValleyA,\s*([0-9.]+)/, 0.22);
  const connectionWidth = extractFloat(xsText, /rmSetConnectionWidth\(myIslandConnection,\s*([0-9.]+)/, 12.0);
  const settlementsPerPlayer = extractInt(xsText, /for\s*\(j=1;\s*<=(\d+)\*cNumberNonGaiaPlayers\)/, 5);
  const relicMinDistance = extractInt(xsText, /rmSetObjectDefMinDistance\(myRelic,\s*(\d+)\)/, 60);
  const relicMaxDistance = extractInt(xsText, /rmSetObjectDefMaxDistance\(myRelic,\s*(\d+)\)/, 90);
  const relicsPerPlayer = extractInt(xsText, /rmPlaceObjectDefPerPlayer\(myRelic,\s*false,\s*(\d+)\)/, 2);

  const rawTreasuryResource = extractInt(
    xsText,
    /rmSetTriggerEffectParam\("ResName","Gold"\);\s*rmSetTriggerEffectParamInt\("Amount",(\d+)\)/,
    10000000
  );
  const startingFavor = extractInt(
    xsText,
    /rmSetTriggerEffectParam\("ResName","Favor"\);\s*rmSetTriggerEffectParamInt\("Amount",(\d+)\)/,
    200
  );

  const dayDurationSec = extractInt(
    xsText,
    /rmSwitchToTrigger\(rmTriggerID\("Day"\)\);\s*rmAddTriggerCondition\("Timer"\);\s*rmSetTriggerConditionParamInt\("Param1",(\d+)\)/,
    700
  );
  const duskDurationSec = extractInt(
    xsText,
    /rmSwitchToTrigger\(rmTriggerID\("Dusk"\)\);\s*rmAddTriggerCondition\("Timer"\);\s*rmSetTriggerConditionParamInt\("Param1",(\d+)\)/,
    100
  );
  const nightDurationSec = extractInt(
    xsText,
    /rmSwitchToTrigger\(rmTriggerID\("Night"\)\);\s*rmAddTriggerCondition\("Timer"\);\s*rmSetTriggerConditionParamInt\("Param1",(\d+)\)/,
    300
  );

  return {
    title: titleMatch?.[1] ?? 'Total War I - by M0nTy_PyTh0n',
    author: 'M0nTy_PyTh0n',
    xmlImagePath: xmlImgMatch?.[1] ?? 'ui\\ui map scenario 256x256',
    baseTilesNormal,
    baseTilesLarge,
    playerCircularRadius,
    islandSizeRatio,
    coastSizeRatio,
    innerValleySizeRatio,
    connectionWidth,
    settlementsPerPlayer,
    relicsPerPlayer,
    relicMinDistance,
    relicMaxDistance,
    fishTypes: ['Mahi', 'Perch', 'Salmon'],
    frozenSeaLife: ['Orca', 'Whale'],
    tropicalSeaLife: ['Shark'],
    rawTreasuryResource,
    // Scaled cleanly for RTS HUD readability while preserving Total War "unlimited war chest" spirit
    playableTreasuryResource: Math.min(50000, Math.max(10000, Math.round(rawTreasuryResource / 200))),
    startingFavor,
    dayDurationSec,
    duskDurationSec,
    nightDurationSec,
    destroyAllOnDefeat: xsText.includes('Player Destroy All Buildings'),
  };
}

export const TOTAL_WAR_XS_SPEC: TotalWarXsParams = parseTotalWarXsScript(totalWarXsRaw, totalWarXmlRaw);

/**
 * Computes circular coastal player spawn coordinates around the central continent
 * matching rmPlacePlayersCircular(0.42, 0.42, 0) from Total War I.xs.
 */
export function computeTotalWarCircularSpawns(
  totalPlayers: number,
  playableHalfSize: number
): { x: number; z: number }[] {
  const count = Math.max(2, totalPlayers);
  const radius = playableHalfSize * (TOTAL_WAR_XS_SPEC.playerCircularRadius * 1.92);
  const pts: { x: number; z: number }[] = [];
  // Start at SW (3*PI/4 in XZ -> x < 0, z > 0) so slot 0 matches (-x, +z) and slot 1 (+x, -z) in 1v1
  const startAngle = (3 * Math.PI) / 4;
  for (let i = 0; i < count; i++) {
    const ang = startAngle + (i / count) * Math.PI * 2;
    pts.push({
      x: Math.cos(ang) * radius,
      z: Math.sin(ang) * radius,
    });
  }
  return pts;
}
