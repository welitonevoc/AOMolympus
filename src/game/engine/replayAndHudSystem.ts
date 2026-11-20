import * as THREE from 'three';
import { soundEngine } from '../audio';
import { getRivalPantheon, TECH_SPECS } from '../divineData';
import { getEffectiveMapConfig } from '../../maps';
import {
  buildDemoReplayData,
  getRetoldRecastFavorCost,
  MYTH_SPECIAL_ABILITIES,
  ReplayEntityTuple,
} from '../matchAnalytics';
import { appendRecordedMatch, RecordedMatchRecord } from '../menuData';
import { createBuildingMesh, createUnitMesh, groundHeightAt } from '../models';
import {
  AGE_COSTS,
  AgeLevel,
  BuildingKind,
  CampaignMissionSnapshot,
  FactionScoreEntry,
  FAUNA_STATS,
  MinimapBlip,
  MAPS,
  PANTHEONS,
  ResourceCost,
  ResourceNodeKind,
  ResourceType,
  SelectionSummary,
  TeamId,
  TeamScoreBreakdown,
  UnitKind,
} from '../types';
import {
  AoMEngineContext,
  MAX_TOWN_CENTERS,
  MINIMAP_FOG_SIZE,
  UnitEntity,
} from './engineTypes';

const _projVec = new THREE.Vector3();

export function costValue(cost: ResourceCost): number {
  return (cost.food ?? 0) + (cost.wood ?? 0) + (cost.gold ?? 0) + (cost.favor ?? 0) * 10;
}

export function computeTeamScore(ctx: AoMEngineContext, team: TeamId): TeamScoreBreakdown {
  const res = team === 'player' ? ctx.resources : ctx.enemyResources;
  const teamAge = team === 'player' ? ctx.age : ctx.enemyAge;
  const techs = team === 'player' ? ctx.researchedTechs : ctx.enemyResearchedTechs;

  let economy = (res.food + res.wood + res.gold) * 0.1 + res.favor * 1.0;
  let military = team === 'player' ? ctx.playerDestroyedValue : ctx.enemyDestroyedValue;
  let technology = 0;
  let society = team === 'player' ? ctx.relicsHeld * 120 : 0;

  for (const u of ctx.units.values()) {
    if (u.team !== team || u.hp <= 0) continue;
    const stats = ctx.unitStats(u.kind, team);
    const val = u.kind === 'titan' ? 1200 : costValue(stats.cost);
    if (ctx.isWorkerKind(u.kind) || u.kind === 'ox_cart' || u.kind === 'llama_caravan') {
      economy += val * 0.2;
    } else {
      military += val * 0.2;
    }
  }

  for (const b of ctx.buildings.values()) {
    if (b.team !== team || !b.isConstructed) continue;
    const bStats = ctx.buildingStats(b.kind, team);
    const val = costValue(bStats.cost);
    if (
      b.kind === 'town_center' ||
      b.kind === 'village_center' ||
      b.kind === 'house' ||
      b.kind === 'farm' ||
      b.kind === 'market' ||
      b.kind === 'armory' ||
      b.kind === 'granary' ||
      b.kind === 'storehouse' ||
      b.kind === 'lumber_camp' ||
      b.kind === 'mining_camp' ||
      b.kind === 'economic_guild' ||
      b.kind === 'dock'
    ) {
      economy += val * 0.2;
    } else {
      military += val * 0.2;
    }
    if (b.kind === 'town_center') society += 150;
    else if (b.kind === 'village_center') society += 90;
    else if (b.kind === 'fortress' || b.kind === 'asgard_hill_fort') society += 90;
    else if (b.kind === 'monument') society += 45;
    else if (b.kind === 'wonder') society += 500;
    else if (b.kind === 'titan_gate') society += 300;
  }

  for (let era = 2 as AgeLevel; era <= teamAge; era = (era + 1) as AgeLevel) {
    technology += costValue(AGE_COSTS[era]) * 0.2 + 100;
  }
  if (team === 'player' && ctx.advancingToAge && ctx.ageAdvanceTotal > 0) {
    technology += (ctx.ageAdvanceProgress / ctx.ageAdvanceTotal) * 60;
  }
  const minorCount = team === 'player' ? ctx.chosenMinorGods.length : Math.max(0, teamAge - 1);
  technology += minorCount * 60;

  for (const tid of techs) {
    const spec = TECH_SPECS[tid];
    if (spec) technology += costValue(spec.cost) * 0.2;
  }

  if (team === 'player') {
    let explored = 0;
    for (let i = 0; i < ctx.fogState.length; i++) {
      if (ctx.fogState[i] > 0) explored++;
    }
    const exploredRatio = ctx.fogState.length > 0 ? explored / ctx.fogState.length : 0.2;
    technology += Math.round(exploredRatio * 150);
  } else {
    technology += Math.min(150, Math.round(25 + ctx.elapsedSeconds * 0.24));
  }

  const econRounded = Math.round(economy);
  const milRounded = Math.round(military);
  const techRounded = Math.round(technology);
  const socRounded = Math.round(society);
  return {
    economy: econRounded,
    military: milRounded,
    technology: techRounded,
    society: socRounded,
    total: econRounded + milRounded + techRounded + socRounded,
  };
}

export function captureTimelineSample(ctx: AoMEngineContext) {
  const pScore = computeTeamScore(ctx, 'player');
  const eScore = computeTeamScore(ctx, 'enemy');
  const pPop = ctx.getPopulation('player');
  const ePop = ctx.getPopulation('enemy');
  ctx.timelineHistory.push({
    timeSec: Math.round(ctx.elapsedSeconds),
    playerEco: pScore.economy,
    enemyEco: eScore.economy,
    playerArmy: pScore.military,
    enemyArmy: eScore.military,
    playerPop: pPop.current,
    enemyPop: ePop.current,
    playerFavor: Math.round(ctx.resources.favor),
    enemyFavor: Math.round(ctx.enemyResources.favor),
    playerAge: ctx.age,
    enemyAge: ctx.enemyAge,
  });
  if (ctx.timelineHistory.length > 90) {
    ctx.timelineHistory.shift();
  }
}

export function captureReplayKeyframe(ctx: AoMEngineContext) {
  if (ctx.replayFrames.length >= 120) return;
  const units: ReplayEntityTuple[] = [];
  for (const u of ctx.units.values()) {
    if (u.hp <= 0 || u.state === 'garrisoned') continue;
    units.push({
      id: u.id,
      k: u.kind,
      t: u.team,
      x: Math.round(u.mesh.position.x * 10) / 10,
      z: Math.round(u.mesh.position.z * 10) / 10,
      hp: Math.max(1, Math.round((u.hp / Math.max(1, u.maxHp)) * 100)),
    });
    if (units.length >= 90) break;
  }
  const buildings: ReplayEntityTuple[] = [];
  for (const b of ctx.buildings.values()) {
    if (b.hp <= 0) continue;
    buildings.push({
      id: b.id,
      k: b.kind,
      t: b.team,
      x: Math.round(b.mesh.position.x * 10) / 10,
      z: Math.round(b.mesh.position.z * 10) / 10,
      hp: Math.max(1, Math.round((b.hp / Math.max(1, b.maxHp)) * 100)),
    });
    if (buildings.length >= 55) break;
  }
  ctx.replayFrames.push({
    timeSec: Math.round(ctx.elapsedSeconds),
    pRes: {
      food: Math.round(ctx.resources.food),
      wood: Math.round(ctx.resources.wood),
      gold: Math.round(ctx.resources.gold),
      favor: Math.round(ctx.resources.favor),
    },
    eRes: {
      food: Math.round(ctx.enemyResources.food),
      wood: Math.round(ctx.enemyResources.wood),
      gold: Math.round(ctx.enemyResources.gold),
      favor: Math.round(ctx.enemyResources.favor),
    },
    pAge: ctx.age,
    eAge: ctx.enemyAge,
    units,
    buildings,
  });
}

export function sampleMatchTimelineAndReplay(ctx: AoMEngineContext, simDt: number) {
  if (ctx.timelineHistory.length === 0) {
    captureTimelineSample(ctx);
    captureReplayKeyframe(ctx);
  }
  ctx.timelineSampleTimer += simDt;
  if (ctx.timelineSampleTimer >= 15) {
    ctx.timelineSampleTimer -= 15;
    captureTimelineSample(ctx);
  }
  ctx.replayFrameTimer += simDt;
  if (ctx.replayFrameTimer >= 5) {
    ctx.replayFrameTimer -= 5;
    captureReplayKeyframe(ctx);
  }
}

export function recordCompletedMatch(ctx: AoMEngineContext, result: 'victory' | 'defeat') {
  if (ctx.matchRecorded || ctx.replayMode) return;
  ctx.matchRecorded = true;
  captureTimelineSample(ctx);
  captureReplayKeyframe(ctx);
  const mapSpec = MAPS[ctx.mapId];
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const rec: RecordedMatchRecord = {
    id: `rec_${Date.now()}`,
    title: `${ctx.majorGodName} em ${mapSpec?.name ?? ctx.mapId}`,
    date: dateStr,
    pantheon: ctx.pantheon,
    enemyPantheon: ctx.enemyPantheon,
    mapId: ctx.mapId,
    worldSize: ctx.worldSize,
    difficulty: ctx.difficulty,
    durationSeconds: Math.max(1, Math.round(ctx.elapsedSeconds)),
    result,
    enemiesDefeated: ctx.stats.enemiesDefeated,
    unitsTrained: ctx.stats.unitsTrained,
    timelineHistory: [...ctx.timelineHistory],
    replayFrames: [...ctx.replayFrames],
  };
  appendRecordedMatch(rec);
}

export function startReplay(ctx: AoMEngineContext, record: RecordedMatchRecord) {
  soundEngine.unlock();
  const mapId = record.mapId ?? 'mediterranean';
  const pantheon = record.pantheon ?? 'greek';
  const enemyPantheon = record.enemyPantheon ?? getRivalPantheon(pantheon);
  ctx.pantheon = pantheon;
  ctx.enemyPantheon = enemyPantheon;
  ctx.majorGodName = PANTHEONS[pantheon].deity;
  ctx.difficulty = record.difficulty ?? 'normal';
  ctx.mapId = mapId;
  ctx.worldSize = record.worldSize ?? 'normal';
  ctx.revealedMap = true;
  ctx.clearEntities();
  ctx.clearReplayMeshes();
  ctx.rebuildTerrainForMap(mapId);
  ctx.initFogOfWar();
  ctx.updateFogOfWar(1, true);
  if (ctx.fogMesh) {
    ctx.fogMesh.visible = false;
  }

  const demo =
    record.replayFrames && record.replayFrames.length >= 2
      ? { frames: record.replayFrames, timeline: record.timelineHistory ?? [] }
      : buildDemoReplayData(record.durationSeconds || 300);

  ctx.replayActiveFrames = demo.frames;
  ctx.timelineHistory = demo.timeline;
  const duration = Math.max(
    10,
    ctx.replayActiveFrames[ctx.replayActiveFrames.length - 1]?.timeSec ?? record.durationSeconds ?? 180
  );
  ctx.replayMode = true;
  ctx.replayState = {
    active: true,
    title: record.title,
    playing: true,
    speed: 1,
    currentTime: 0,
    duration,
    fogDisabled: true,
    perspective: 'all',
  };
  ctx.phase = 'playing';
  ctx.camDesiredTarget.set(0, 0, 0);
  ctx.camTarget.set(0, 0, 0);
  ctx.camDesiredDistance = 42;
  applyReplayFrameAtTime(ctx, 0);
  soundEngine.startMatchMusic(pantheon, record.title);
  ctx.notifyStatus(`🎬 Reproduzindo Replay: ${record.title}`);
  ctx.emitHudSnapshot();
}

export function updateReplayPlayback(ctx: AoMEngineContext, dt: number) {
  if (!ctx.replayMode || !ctx.replayState) return;
  if (ctx.replayState.playing) {
    ctx.replayState.currentTime = Math.min(
      ctx.replayState.duration,
      ctx.replayState.currentTime + dt * ctx.replayState.speed
    );
    if (ctx.replayState.currentTime >= ctx.replayState.duration) {
      ctx.replayState.playing = false;
    }
  }
  ctx.elapsedSeconds = ctx.replayState.currentTime;
  applyReplayFrameAtTime(ctx, ctx.replayState.currentTime);
}

export function applyReplayFrameAtTime(ctx: AoMEngineContext, timeSec: number) {
  const frames = ctx.replayActiveFrames;
  if (!frames || frames.length === 0 || !ctx.replayState) return;

  let idxA = 0;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].timeSec <= timeSec) idxA = i;
    else break;
  }
  const idxB = Math.min(frames.length - 1, idxA + 1);
  const frameA = frames[idxA];
  const frameB = frames[idxB];
  const span = Math.max(0.001, frameB.timeSec - frameA.timeSec);
  const alpha = idxA === idxB ? 0 : THREE.MathUtils.clamp((timeSec - frameA.timeSec) / span, 0, 1);

  const showEnemy = ctx.replayState.perspective === 'enemy';
  const srcResA = showEnemy ? frameA.eRes : frameA.pRes;
  const srcResB = showEnemy ? frameB.eRes : frameB.pRes;
  ctx.resources.food = Math.round(THREE.MathUtils.lerp(srcResA.food, srcResB.food, alpha));
  ctx.resources.wood = Math.round(THREE.MathUtils.lerp(srcResA.wood, srcResB.wood, alpha));
  ctx.resources.gold = Math.round(THREE.MathUtils.lerp(srcResA.gold, srcResB.gold, alpha));
  ctx.resources.favor = Math.round(THREE.MathUtils.lerp(srcResA.favor, srcResB.favor, alpha));
  ctx.age = frameA.pAge;
  ctx.enemyAge = frameA.eAge;

  const seenIds = new Set<string>();
  const mapBUnits = new Map<string, ReplayEntityTuple>();
  frameB.units.forEach((u, idx) => {
    const uid = u.id ?? `u_${idx}_${u.k}_${u.t}`;
    mapBUnits.set(uid, u);
  });

  const syncTupleList = (list: ReplayEntityTuple[], isBuilding: boolean) => {
    list.forEach((tup, idx) => {
      const id = tup.id ?? `${isBuilding ? 'b' : 'u'}_${idx}_${tup.k}_${tup.t}`;
      const kind = tup.k;
      const team: TeamId = tup.t;
      const persp = ctx.replayState!.perspective;
      const visibleByPersp =
        persp === 'all' || (persp === 'player' && team === 'player') || (persp === 'enemy' && team === 'enemy');
      seenIds.add(id);

      const nextTup = !isBuilding ? mapBUnits.get(id) : undefined;
      const wx = nextTup ? THREE.MathUtils.lerp(tup.x, nextTup.x, alpha) : tup.x;
      const wz = nextTup ? THREE.MathUtils.lerp(tup.z, nextTup.z, alpha) : tup.z;
      const wy = groundHeightAt(wx, wz, ctx.mapId, ctx.worldSize);

      let rec = ctx.replayEntityMeshes.get(id);
      if (!rec) {
        const teamPantheon = team === 'player' ? ctx.pantheon : ctx.enemyPantheon;
        const teamMajorGod =
          team === 'player' ? ctx.majorGodName : teamPantheon === 'greek' ? 'Poseidon' : undefined;
        const teamAge = team === 'player' ? ctx.age : ctx.enemyAge;
        const mesh = isBuilding
          ? createBuildingMesh(
              kind as BuildingKind,
              team,
              ctx.palette,
              !ctx.isSoftwareGl,
              teamPantheon,
              teamMajorGod,
              teamAge
            )
          : createUnitMesh(kind as UnitKind, team, ctx.palette, !ctx.isSoftwareGl, teamPantheon, teamMajorGod);
        mesh.position.set(wx, wy, wz);
        ctx.scene.add(mesh);
        rec = { mesh, team, kind, isBuilding };
        ctx.replayEntityMeshes.set(id, rec);
      } else {
        if (!isBuilding && nextTup) {
          const dx = nextTup.x - tup.x;
          const dz = nextTup.z - tup.z;
          if (Math.hypot(dx, dz) > 0.1) {
            rec.mesh.rotation.y = Math.atan2(dx, dz);
          }
        }
        rec.mesh.position.set(wx, wy, wz);
      }
      rec.mesh.visible = visibleByPersp;
    });
  };

  syncTupleList(frameA.buildings, true);
  syncTupleList(frameA.units, false);

  for (const [id, rec] of [...ctx.replayEntityMeshes.entries()]) {
    if (!seenIds.has(id)) {
      ctx.scene.remove(rec.mesh);
      ctx.replayEntityMeshes.delete(id);
    }
  }
}

export function projectWorldToScreen(
  ctx: AoMEngineContext,
  worldPos: THREE.Vector3,
  offsetY: number
): { x: number; y: number } | undefined {
  const w = ctx.container.clientWidth || window.innerWidth;
  const h = ctx.container.clientHeight || window.innerHeight;
  _projVec.copy(worldPos);
  _projVec.y += offsetY;
  _projVec.project(ctx.camera);
  if (_projVec.z > 1) return undefined;
  const x = Math.round(((_projVec.x + 1) * 0.5) * w);
  const y = Math.round(((-_projVec.y + 1) * 0.5) * h);
  return { x, y };
}

export function buildSelectionSummary(ctx: AoMEngineContext): SelectionSummary {
  const selUnits = [...ctx.units.values()].filter((u) => u.selected);
  const selBuildings = [...ctx.buildings.values()].filter((b) => b.selected);
  const selNodes = [...ctx.nodes.values()].filter((n) => n.selected);
  const selSettlements = [...ctx.settlements.values()].filter((s) => s.selected);
  const selFauna = [...ctx.fauna.values()].filter((f) => f.selected);
  const selRelics = [...ctx.relics.values()].filter((r) => r.selected);

  if (selUnits.length > 0) {
    const primary = selUnits[0];
    const stats = ctx.unitStats(primary.kind, primary.team);
    const mods = ctx.computeUnitModifiers(primary.kind, primary.team, Boolean(primary.isPromotedHero));
    const totalHp = selUnits.reduce((acc, u) => acc + u.hp, 0);
    const totalMaxHp = selUnits.reduce((acc, u) => acc + u.maxHp, 0);
    const hackPct = Math.round(Math.min(85, (1 - (1 - stats.hackArmor) * mods.hackVulnMult + mods.armorBonus) * 100));
    const piercePct = Math.round(Math.min(85, (1 - (1 - stats.pierceArmor) * mods.pierceVulnMult + mods.armorBonus) * 100));
    const crushPct = Math.round(Math.min(85, (1 - (1 - stats.crushArmor) * mods.crushVulnMult + mods.armorBonus) * 100));
    const isRegent = primary.id === ctx.regentUnitId;
    const taskMap: Record<UnitEntity['state'], string> = {
      idle: 'Em espera',
      move: 'Marchando',
      gather: 'Coletando recursos',
      hunt: 'Caçando fauna',
      return: 'Depositando carga',
      build: 'Construindo',
      pray: 'Orando por Favor Divino',
      empower: 'Energizando Monumento',
      attack: 'Em combate',
      garrisoned: 'Embarcado',
    };
    let unitTaskLabel = taskMap[primary.state];
    let oracleVisionPct: number | undefined;
    let oracleFavorPerSec: number | undefined;
    if (primary.kind === 'transport_ship') {
      unitTaskLabel = `Navio de Transporte (${primary.cargoIds?.length ?? 0}/8 tropas a bordo)`;
    } else if (primary.kind === 'fishing_ship') {
      unitTaskLabel =
        primary.state === 'gather'
          ? `Pescando em cardume (${primary.carryAmount}/20 Alimento)`
          : primary.state === 'return'
          ? `Retornando ao Porto (${primary.carryAmount} Alimento)`
          : 'Barco Pesqueiro pronto para pesca marítima';
    } else if (primary.kind === 'ox_cart') {
      let nearbyGatherers = 0;
      for (const other of ctx.units.values()) {
        if (
          other.team === primary.team &&
          ctx.isWorkerKind(other.kind) &&
          other.mesh.position.distanceTo(primary.mesh.position) <= 10.5
        ) {
          nearbyGatherers++;
        }
      }
      unitTaskLabel =
        nearbyGatherers > 0
          ? `Depósito Móvel Ativo · ${nearbyGatherers} coletor(es) próximos · ${primary.carryAmount} recursos recebidos`
          : primary.state === 'move'
          ? 'Reposicionando Caravana de Recursos'
          : `Depósito Móvel de Recursos (${primary.carryAmount} recursos recebidos)`;
    } else if (primary.kind === 'norse_dwarf' && primary.state === 'gather') {
      unitTaskLabel =
        primary.gatherResourceType === 'gold'
          ? 'Minerando Ouro (+30% Especialização Anã)'
          : 'Coletando recursos (-20% fora de Minas de Ouro)';
    } else if (primary.kind === 'citizen' && (primary.state === 'gather' || primary.state === 'hunt')) {
      unitTaskLabel = 'Coleta Direta Atlante (+55% velocidade, sem retorno a depósito)';
    } else if (primary.kind === 'oracle') {
      const om = ctx.getOracleVisionMetrics(primary);
      oracleVisionPct = Math.round(om.efficiency * 100);
      oracleFavorPerSec = Number(om.favorPerSec.toFixed(2));
      unitTaskLabel =
        primary.state === 'idle'
          ? `Vigília ${oracleVisionPct}% · +${oracleFavorPerSec.toFixed(2)} Favor/s${om.isFullVision ? ' (Visão Plena)' : ' (Sobreposto)'}`
          : primary.isPromotedHero
          ? `${taskMap[primary.state]} (Oráculo Herói ★)`
          : 'Reposicionando Oráculo (pare longe de outros Oráculos para visão plena)';
    } else if (primary.kind === 'llama_caravan') {
      unitTaskLabel =
        primary.tradePhase === 'to_tc'
          ? 'Rota Comercial: levando carga de Ouro à Cidadela'
          : primary.tradePhase === 'to_market'
          ? 'Rota Comercial: retornando ao Mercado Atlante'
          : 'Caravana Comercial Atlante (gera Ouro contínuo)';
    } else if (primary.kind === 'caladria') {
      unitTaskLabel = 'Espírito Curador Alado (cura aliados feridos automaticamente)';
    } else if (primary.kind === 'hersir' && ctx.researchedTechs.includes('hammer_of_the_gods')) {
      unitTaskLabel = `${taskMap[primary.state]} · Martelo dos Deuses (+0,48 Favor/s)`;
    }
    const countsMap = new Map<UnitKind, { kind: UnitKind; name: string; count: number }>();
    let heroPromoteCount = 0;
    const heroPromoteCost: ResourceCost = { food: 0, wood: 0, gold: 0, favor: 0 };
    for (const u of selUnits) {
      const uSpec = ctx.unitStats(u.kind, u.team);
      const existing = countsMap.get(u.kind);
      if (existing) existing.count += 1;
      else countsMap.set(u.kind, { kind: u.kind, name: uSpec.name, count: 1 });
      if (u.team === 'player' && !u.isPromotedHero && uSpec.canPromoteHero) {
        heroPromoteCount++;
        const pCost = ctx.getHeroPromotionCost(u.kind, 'player');
        heroPromoteCost.food = (heroPromoteCost.food ?? 0) + (pCost.food ?? 0);
        heroPromoteCost.wood = (heroPromoteCost.wood ?? 0) + (pCost.wood ?? 0);
        heroPromoteCost.gold = (heroPromoteCost.gold ?? 0) + (pCost.gold ?? 0);
        heroPromoteCost.favor = (heroPromoteCost.favor ?? 0) + (pCost.favor ?? 0);
      }
    }
    const hasHyperionFree = ctx.chosenMinorGods.includes('Hyperion');
    const canPrayAtTemple =
      ctx.pantheon === 'greek' && selUnits.some((u) => u.team === 'player' && ctx.isWorkerKind(u.kind));
    const canEmpowerMonument =
      ctx.pantheon === 'egyptian' &&
      selUnits.some(
        (u) =>
          u.team === 'player' &&
          (u.kind === 'pharaoh' || u.kind === 'son_of_osiris' || (u.kind === 'priest' && ctx.isTeamRa('player')))
      );
    const primaryAttack = primary.isPromotedHero && stats.attack === 0 ? 16 : stats.attack;
    return {
      count: selUnits.length,
      primaryType: 'unit',
      entityId: primary.id,
      unitKind: primary.kind,
      isHero: Boolean(stats.isHero || primary.isPromotedHero),
      isMythic: Boolean(stats.isMythic),
      isGod: Boolean(stats.isGod),
      isMajorGod: Boolean(stats.isMajorGod),
      kindLabel:
        selUnits.length > 1
          ? `${stats.name} (${selUnits.length})`
          : `${stats.name}${primary.isPromotedHero ? ' ★ Herói' : ''}${isRegent ? ' ★ Regente' : ''}`,
      roleLabel: stats.role,
      team: primary.team,
      hp: Math.round(totalHp),
      maxHp: Math.round(totalMaxHp),
      attack: Math.round(primaryAttack * mods.atkMult),
      hackArmorPct: hackPct,
      pierceArmorPct: piercePct,
      crushArmorPct: crushPct,
      speed: Number((stats.speed * mods.speedMult).toFixed(1)),
      range: Number((stats.range + mods.rangeBonus).toFixed(1)),
      popCost: stats.popCost,
      armorLabel: `Corte ${hackPct}% · Perf ${piercePct}% · Esmag ${crushPct}%`,
      taskLabel: unitTaskLabel,
      screenPos: projectWorldToScreen(ctx, primary.mesh.position, 2.2),
      hasVillagerSelected: selUnits.some((u) => u.team === 'player' && ctx.isBuilderKind(u.kind)),
      canPrayAtTemple,
      canEmpowerMonument,
      oracleVisionPct,
      oracleFavorPerSec,
      canPromoteToHero: heroPromoteCount > 0,
      heroPromoteIsFree: heroPromoteCount > 0 && hasHyperionFree,
      heroPromoteCount: heroPromoteCount > 0 ? heroPromoteCount : undefined,
      heroPromoteCost: heroPromoteCount > 0 ? heroPromoteCost : undefined,
      selectedCounts: Array.from(countsMap.values()),
      voiceLine: ctx.voiceLineTimer > 0 && ctx.lastVoiceLine ? ctx.lastVoiceLine : undefined,
      stance: primary.stance ?? 'aggressive',
      autoScout: Boolean(primary.autoScout),
      isNaval: Boolean(stats.isNaval),
      isTransport: primary.kind === 'transport_ship',
      cargoCount: primary.kind === 'transport_ship' ? (primary.cargoIds?.length ?? 0) : undefined,
      cargoMax: primary.kind === 'transport_ship' ? 8 : undefined,
      counterTags: ctx.getCounterTagsForUnit(primary.kind, primary.team),
      damageType: stats.damageType,
    };
  }

  if (selBuildings.length > 0) {
    const b = selBuildings[0];
    const stats = ctx.buildingStats(b.kind, b.team);
    const hackPct = Math.round(stats.hackArmor * 100);
    const piercePct = Math.round(stats.pierceArmor * 100);
    const crushPct = Math.round(stats.crushArmor * 100);
    const tcTier: AgeLevel | undefined =
      b.kind === 'town_center' ? (b.team === 'player' ? ctx.age : ctx.enemyAge) : undefined;
    const tcLabel = tcTier
      ? tcTier >= 5
        ? `${stats.name} (T5 · Metrópole Divina)`
        : `${stats.name} (T${tcTier})`
      : stats.name;
    const bTechs = b.team === 'player' ? ctx.researchedTechs : ctx.enemyResearchedTechs;
    let bAtkMult = 1;
    if (stats.attack) {
      if (bTechs.includes('copper_weapons')) bAtkMult += 0.1;
      if (bTechs.includes('bronze_weapons')) bAtkMult += 0.1;
      if (bTechs.includes('iron_weapons')) bAtkMult += 0.1;
      if (bTechs.includes('watch_tower') && (b.kind === 'tower' || b.kind === 'mirror_tower' || b.kind === 'fortress' || b.kind === 'asgard_hill_fort')) bAtkMult += 0.3;
      if (bTechs.includes('burning_pitch')) bAtkMult += 0.15;
    }
    const favorInfo = b.team === 'player' && b.isConstructed ? ctx.computeTeamFavorBreakdown('player') : null;
    let prayingHere = 0;
    if (b.kind === 'temple' && b.isConstructed) {
      for (const u of ctx.units.values()) {
        if (u.team === b.team && u.hp > 0 && u.state === 'pray' && u.targetEntityId === b.id) {
          prayingHere++;
        }
      }
    }
    const isEmpowered = (b.empoweredTimer ?? 0) > 0;
    const empoweredByLabel = isEmpowered
      ? b.empoweredBy === 'priest'
        ? 'Abençoado por Sacerdote'
        : 'Energizado pelo Faraó'
      : undefined;
    const canCallVillagersToPray =
      b.team === 'player' && b.isConstructed && b.kind === 'temple' && ctx.pantheon === 'greek';
    const canEmpowerSelectedMonument =
      b.team === 'player' && b.isConstructed && b.kind === 'monument' && ctx.pantheon === 'egyptian';
    const isisProtected = b.team === 'player' && b.kind === 'monument' && b.isConstructed && ctx.isTeamIsis('player');
    const garrisonCap = ctx.getGarrisonCapacity(b.kind);
    const garrisonedCount = b.garrisonedUnitIds ? b.garrisonedUnitIds.length : 0;
    const canGarrison = b.team === 'player' && b.isConstructed && garrisonCap > 0;
    const canUngarrison = canGarrison && garrisonedCount > 0;

    return {
      count: 1,
      primaryType: 'building',
      entityId: b.id,
      kindLabel: tcLabel,
      roleLabel: stats.role,
      team: b.team,
      hp: Math.round(b.hp),
      maxHp: b.maxHp,
      attack: stats.attack ? Math.round(stats.attack * bAtkMult) : stats.attack,
      hackArmorPct: hackPct,
      pierceArmorPct: piercePct,
      crushArmorPct: crushPct,
      range: stats.range,
      armorLabel: `Corte ${hackPct}% · Perf ${piercePct}% · Esmag ${crushPct}%`,
      screenPos: projectWorldToScreen(ctx, b.mesh.position, 3.8),
      buildingId: b.id,
      buildingKind: b.kind,
      townCenterTier: tcTier,
      isConstructed: b.isConstructed,
      buildProgress: b.buildProgress,
      trainingQueue: b.trainingQueue.map((q) => ({ ...q })),
      repeatTraining: b.repeatTraining,
      rallyPoint: b.rallyPoint ? { x: Math.round(b.rallyPoint.x), z: Math.round(b.rallyPoint.z) } : null,
      hasVillagerSelected: false,
      canCallVillagersToPray,
      canEmpowerMonument: canEmpowerSelectedMonument,
      prayingCount: b.kind === 'temple' ? prayingHere : undefined,
      templePrayerRatePerSec:
        b.kind === 'temple' && favorInfo ? Number((favorInfo.templeRates.get(b.id) ?? 0).toFixed(2)) : undefined,
      isEmpowered,
      empoweredByLabel,
      isisProtected,
      garrisonedCount: canGarrison ? garrisonedCount : undefined,
      garrisonMaxCapacity: canGarrison ? garrisonCap : undefined,
      canGarrison,
      canUngarrison,
    };
  }

  if (selRelics.length > 0) {
    const r = selRelics[0];
    return {
      count: 1,
      primaryType: 'relic',
      entityId: r.id,
      kindLabel: r.name,
      roleLabel: `${r.bonusLabel} — Aproxime uma unidade com um Templo construído para consagrar.`,
      team: 'neutral',
      hp: 100,
      maxHp: 100,
      taskLabel: r.claimedByTeam ? 'Consagrada' : 'Relíquia sagrada livre',
      hasVillagerSelected: false,
    };
  }

  if (selSettlements.length > 0) {
    const s = selSettlements[0];
    return {
      count: 1,
      primaryType: 'settlement',
      entityId: s.id,
      kindLabel: 'Assentamento Neutro',
      roleLabel: 'Ruína ancestral — envie Aldeões ou construa um Centro da Cidade aqui (máx. 3).',
      team: 'neutral',
      hp: 100,
      maxHp: 100,
      settlementId: s.id,
      hasVillagerSelected: false,
    };
  }

  if (selFauna.length > 0) {
    const f = selFauna[0];
    const fStats = FAUNA_STATS[f.kind];
    const isSetPlayer = ctx.isTeamSet('player');
    const canFatten = Boolean(
      !f.isCarcass && fStats.category === 'herdable' && fStats.maxFattenedFood && f.foodAmount < fStats.maxFattenedFood
    );
    const ownerTag =
      f.ownerTeam === 'player'
        ? f.isSetConverted
          ? 'Animal de Set (Aliado)'
          : 'Rebanho Aliado'
        : f.ownerTeam === 'enemy'
        ? 'Rebanho Inimigo'
        : undefined;
    return {
      count: 1,
      primaryType: 'fauna',
      entityId: f.id,
      faunaKind: f.kind,
      faunaCategory: fStats.category,
      faunaOwnerTeam: f.ownerTeam ?? undefined,
      canFatten,
      maxFattenedFood: fStats.maxFattenedFood,
      canConvertFauna: Boolean(isSetPlayer && !f.isCarcass && !fStats.isAquatic && f.ownerTeam !== 'player'),
      canCommandFauna: Boolean(f.ownerTeam === 'player' && !f.isCarcass && !fStats.isAquatic),
      nonHarvestableFauna: Boolean(fStats.isAquatic),
      kindLabel: f.isCarcass ? `${fStats.name} (Carcaça)` : ownerTag ? `${fStats.name} · ${ownerTag}` : fStats.name,
      roleLabel: f.isCarcass ? 'Carcaça abatida — pronta para coleta contínua de Alimento por Aldeões.' : fStats.role,
      team: f.ownerTeam ?? 'neutral',
      hp: Math.round(f.isCarcass ? f.foodAmount : f.hp),
      maxHp: f.isCarcass ? f.maxFood : f.maxHp,
      attack: fStats.attack > 0 ? fStats.attack : undefined,
      speed: fStats.speed,
      resourceType: fStats.isAquatic ? undefined : 'food',
      resourceAmount: fStats.isAquatic ? undefined : Math.round(f.foodAmount),
      resourceMaxAmount: fStats.isAquatic ? undefined : f.maxFood,
      isCarcass: f.isCarcass,
      screenPos: projectWorldToScreen(ctx, f.mesh.position, 2.5),
      taskLabel: fStats.isAquatic
        ? 'Fauna Marinha Decorativa (ambientação oceânica)'
        : f.isCarcass
        ? `Carne disponível: ${Math.round(f.foodAmount)} / ${f.maxFood}`
        : canFatten
        ? `Engordando: ${Math.round(f.foodAmount)} / ${fStats.maxFattenedFood} · Vida: ${Math.round(f.hp)}/${f.maxHp}`
        : f.ownerTeam === 'player' && f.isSetConverted
        ? `Fera Sagrada de Set — clique direito para mover/atacar · Carne: ${Math.round(f.foodAmount)}`
        : `Alimento: ${Math.round(f.foodAmount)} / ${f.maxFood} · Vida: ${Math.round(f.hp)}/${f.maxHp}`,
      hasVillagerSelected: false,
    };
  }

  if (selNodes.length > 0) {
    const n = selNodes[0];
    const mapCfg = getEffectiveMapConfig(ctx.mapId);
    const labelMap: Record<ResourceNodeKind, string> = {
      berry: 'Fonte Frutífera',
      tree: `Floresta (${mapCfg.floraLabel.split(' e ')[0]})`,
      gold_mine: 'Veio de Ouro',
      fish_spot: n.subLabel ?? 'Cardume de Peixes',
    };
    const resLabel: Record<ResourceType, string> = {
      food: 'Alimento',
      wood: 'Madeira',
      gold: 'Ouro',
      favor: 'Favor',
    };
    const isInfinite = n.kind === 'fish_spot';
    return {
      count: 1,
      primaryType: 'resource',
      entityId: n.id,
      kindLabel: labelMap[n.kind],
      roleLabel: isInfinite
        ? 'Fonte infinita de Alimento coletada por Barcos Pesqueiros a partir de Docas.'
        : `Fonte de ${resLabel[n.resourceType]} — Aldeões colhem continuamente até esgotar.`,
      team: 'neutral',
      hp: Math.round(n.amount),
      maxHp: n.maxAmount,
      resourceType: n.resourceType,
      resourceAmount: Math.round(n.amount),
      resourceMaxAmount: n.maxAmount,
      isInfiniteResource: isInfinite,
      screenPos: projectWorldToScreen(ctx, n.mesh.position, n.kind === 'tree' ? 5.3 : 2.6),
      taskLabel: isInfinite
        ? `${resLabel[n.resourceType]}: Fonte Infinita (Barco Pesqueiro)`
        : `${resLabel[n.resourceType]} restante: ${Math.round(n.amount)} / ${n.maxAmount}`,
      hasVillagerSelected: false,
    };
  }

  return {
    count: 0,
    primaryType: 'none',
    kindLabel: 'Nenhuma seleção',
    roleLabel: 'Clique ou arraste no mapa para selecionar tropas, aldeões, recursos ou animais.',
    team: 'player',
    hp: 0,
    maxHp: 0,
    hasVillagerSelected: false,
  };
}

export function emitHudSnapshot(ctx: AoMEngineContext) {
  const pop = ctx.getPopulation('player');
  const playerScoreBreakdown = computeTeamScore(ctx, 'player');
  const enemyScoreBreakdown = computeTeamScore(ctx, 'enemy');
  let idleVillagerCount = 0;
  let idleMilitaryCount = 0;
  let combatUnitCount = 0;
  for (const u of ctx.units.values()) {
    if (u.team === 'player' && u.hp > 0) {
      if (ctx.isWorkerKind(u.kind)) {
        if (u.state === 'idle') idleVillagerCount++;
      } else if (u.kind !== 'ox_cart' && u.kind !== 'llama_caravan' && u.kind !== 'caladria') {
        combatUnitCount++;
        if (u.state === 'idle') idleMilitaryCount++;
      }
    }
  }

  const blips: MinimapBlip[] = [];
  for (const n of ctx.nodes.values()) {
    if (!ctx.revealedMap && !ctx.isWorldExplored(n.mesh.position.x, n.mesh.position.z)) continue;
    blips.push({
      x: n.mesh.position.x,
      z: n.mesh.position.z,
      category: 'node',
      team: 'neutral',
      color:
        n.kind === 'gold_mine'
          ? '#facc15'
          : n.kind === 'berry'
          ? '#fb7185'
          : n.kind === 'fish_spot'
          ? '#38bdf8'
          : '#2e7d32',
      size: 2.2,
      subKind: n.kind,
      label:
        n.kind === 'gold_mine'
          ? 'Mina de Ouro'
          : n.kind === 'berry'
          ? 'Arbusto de Frutas'
          : n.kind === 'fish_spot'
          ? 'Cardume de Peixes'
          : 'Bosque',
    });
  }
  for (const s of ctx.settlements.values()) {
    if (!ctx.revealedMap && !ctx.isWorldExplored(s.mesh.position.x, s.mesh.position.z)) continue;
    blips.push({
      x: s.mesh.position.x,
      z: s.mesh.position.z,
      category: 'settlement',
      team: 'neutral',
      color: '#fbbf24',
      size: 4.0,
      selected: s.selected,
      subKind: 'settlement',
      label: 'Assentamento Neutro',
    });
  }
  for (const f of ctx.fauna.values()) {
    if (!f.mesh.visible && !ctx.revealedMap) continue;
    blips.push({
      x: f.mesh.position.x,
      z: f.mesh.position.z,
      category: 'fauna',
      team: 'neutral',
      color: '#fb923c',
      size: 1.9,
      selected: f.selected,
      subKind: f.kind,
      label: FAUNA_STATS[f.kind].name,
    });
  }
  for (const r of ctx.relics.values()) {
    if (r.claimedByTeam !== null || (!ctx.revealedMap && !ctx.isWorldExplored(r.mesh.position.x, r.mesh.position.z))) continue;
    blips.push({
      x: r.mesh.position.x,
      z: r.mesh.position.z,
      category: 'relic',
      team: 'neutral',
      color: '#22d3ee',
      size: 3.6,
      selected: r.selected,
      subKind: 'relic',
      label: r.name,
    });
  }
  for (const b of ctx.buildings.values()) {
    if (b.team === 'enemy' && !ctx.revealedMap && !ctx.isWorldExplored(b.mesh.position.x, b.mesh.position.z)) continue;
    const bSpec = ctx.buildingStats(b.kind, b.team);
    blips.push({
      x: b.mesh.position.x,
      z: b.mesh.position.z,
      category: 'building',
      team: b.team,
      color: b.team === 'player' ? '#3b82f6' : '#dc2626',
      size:
        b.kind === 'town_center' || b.kind === 'titan_gate' || b.kind === 'wonder'
          ? 6.2
          : b.kind === 'fortress' || b.kind === 'asgard_hill_fort' || b.kind === 'village_center'
          ? 5.4
          : 4.5,
      selected: b.selected,
      isMajor:
        b.kind === 'town_center' ||
        b.kind === 'village_center' ||
        b.kind === 'fortress' ||
        b.kind === 'asgard_hill_fort' ||
        b.kind === 'wonder' ||
        b.kind === 'titan_gate',
      subKind: b.kind,
      isConstructed: b.isConstructed,
      label: `${bSpec.name} (${b.team === 'player' ? 'Aliado' : 'Inimigo'})`,
    });
  }
  for (const u of ctx.units.values()) {
    if (u.team === 'enemy' && !ctx.revealedMap && !ctx.isWorldVisible(u.mesh.position.x, u.mesh.position.z)) continue;
    const uSpec = ctx.unitStats(u.kind, u.team);
    blips.push({
      x: u.mesh.position.x,
      z: u.mesh.position.z,
      category: 'unit',
      team: u.team,
      color: uSpec.isMajorGod ? '#facc15' : uSpec.isGod ? '#c084fc' : u.team === 'player' ? '#60a5fa' : '#ef4444',
      size: uSpec.isMajorGod ? 6.6 : uSpec.isGod ? 6.0 : u.kind === 'titan' ? 5.6 : uSpec.isHero ? 4.2 : 3.4,
      selected: u.selected,
      subKind: u.kind,
      isHero: Boolean(uSpec.isHero),
      isTitan: u.kind === 'titan' || Boolean(uSpec.isGod),
      label: `${uSpec.name} (${u.team === 'player' ? 'Aliado' : 'Inimigo'})`,
    });
  }

  const favorSummary = ctx.computeTeamFavorBreakdown('player');

  ctx.onHudUpdate({
    phase: ctx.phase,
    pantheon: ctx.pantheon,
    majorGodName: ctx.majorGodName,
    enemyPantheon: ctx.enemyPantheon,
    enemyMajorGodName: PANTHEONS[ctx.enemyPantheon].deity,
    difficulty: ctx.difficulty,
    mapId: ctx.mapId,
    gameType: ctx.gameType,
    visibilityMode: ctx.visibilityMode,
    worldSize: ctx.worldSize,
    revealedMap: ctx.revealedMap,
    dayNightCycle: ctx.dayNightCycle,
    dayTimeLabel: ctx.dayTimeLabel,
    titansEnabled: ctx.titansEnabled,
    treatyRemaining: ctx.treatyRemaining,
    elapsedSeconds: ctx.elapsedSeconds,
    resources: {
      food: Math.floor(ctx.resources.food),
      wood: Math.floor(ctx.resources.wood),
      gold: Math.floor(ctx.resources.gold),
      favor: Math.floor(ctx.resources.favor),
    },
    favorRatePerSec: Number(favorSummary.totalRate.toFixed(2)),
    favorBreakdown: favorSummary.breakdown,
    prayingVillagerCount: favorSummary.prayingCount,
    empoweredMonumentCount: favorSummary.empoweredMonuments,
    oracleVisionSummary: favorSummary.oracleSummary,
    age: ctx.age,
    advancingToAge: ctx.advancingToAge,
    ageAdvanceProgress: ctx.ageAdvanceProgress,
    ageAdvanceTotal: ctx.ageAdvanceTotal,
    pendingMinorGodAge: ctx.pendingMinorGodAge,
    chosenMinorGods: [...ctx.chosenMinorGods],
    unlockedPowers: [...ctx.unlockedPowers],
    researchedTechs: [...ctx.researchedTechs],
    activeTechResearch: ctx.activeTechResearch ? { ...ctx.activeTechResearch } : null,
    activeGodKinds: [...ctx.units.values()]
      .filter((u) => u.team === 'player' && u.hp > 0 && ctx.unitStats(u.kind, 'player').isGod)
      .map((u) => u.kind),
    queuedGodKinds: [...ctx.buildings.values()]
      .filter((b) => b.team === 'player')
      .flatMap((b) => b.trainingQueue.map((q) => q.kind))
      .filter((k) => ctx.unitStats(k, 'player').isGod),
    relicsHeld: ctx.relicsHeld,
    marketRates: { ...ctx.marketRates },
    enemyAge: ctx.enemyAge,
    playerScore: playerScoreBreakdown.total,
    enemyScore: enemyScoreBreakdown.total,
    playerScoreBreakdown,
    enemyScoreBreakdown,
    population: pop.current,
    populationCap: pop.cap,
    playerTownCenterCount: ctx.getTownCenterCount('player'),
    maxTownCenters: MAX_TOWN_CENTERS,
    skyPassageCount: ctx.getBuildingCount('sky_passage', 'player'),
    monumentCount: ctx.getBuildingCount('monument', 'player'),
    wonderCount: ctx.getBuildingCount('wonder', 'player'),
    wonderBonusActive: ctx.hasTeamWonder('player'),
    idleVillagerCount,
    idleMilitaryCount,
    combatUnitCount,
    godPowerCooldowns: { ...ctx.godPowerCooldowns },
    activeBuildMode: ctx.activeBuildMode,
    activeGodPowerMode: ctx.activeGodPowerMode,
    selection: buildSelectionSummary(ctx),
    statusMessage: ctx.statusMessage,
    minimapBlips: blips,
    fogGrid: [...ctx.minimapFogCache],
    fogGridSize: MINIMAP_FOG_SIZE,
    cameraTarget: { x: ctx.camTarget.x, z: ctx.camTarget.z },
    cameraYaw: ctx.camYaw,
    cameraDistance: ctx.camDistance,
    cameraPanMode: ctx.cameraPanMode,
    formation: ctx.formation,
    stats: { ...ctx.stats },
    fps: ctx.fpsEstimate,
    scenarioTitle: ctx.scenarioTitle,
    playerColorHex: ctx.playerColorHex,
    playerCrestId: ctx.playerCrestId,
    multiplayerRoster: ctx.multiplayerRoster,
    projectionMode: ctx.projectionMode,
    hopliteRenderMode: ctx.hopliteRenderMode,
    hopliteArmorTier: ctx.hopliteArmorTier,
    scaleProfile: ctx.globalScaleConfig.profile,
    scaleMultipliers: {
      building: ctx.globalScaleConfig.buildingMultiplier,
      unit: ctx.globalScaleConfig.unitMultiplier,
      fauna: ctx.globalScaleConfig.faunaMultiplier,
      resource: ctx.globalScaleConfig.resourceMultiplier,
    },
    kothState:
      ctx.mapId === 'king_of_the_hill'
        ? {
            owner: ctx.kothOwner,
            playerHold: Math.round(ctx.kothPlayerHold),
            enemyHold: Math.round(ctx.kothEnemyHold),
            targetHold: 90,
          }
        : undefined,
    mapRuleTag:
      ctx.mapId === 'nomad'
        ? 'Nômade'
        : ctx.mapId === 'sudden_death'
        ? 'Morte Súbita'
        : ctx.mapId === 'megalopolis'
        ? 'Megalópole'
        : ctx.mapId === 'king_of_the_hill'
        ? 'Rei da Colina'
        : ctx.mapId === 'valley_of_the_kings'
        ? 'Vale dos Reis'
        : undefined,
    villagerPriority: ctx.villagerPriority,
    aiPersonality: ctx.aiPersonality,
    campaignScenarioId: ctx.campaignScenarioId,
    isSetPlayer: ctx.isTeamSet('player'),
    cinematic: ctx.scenarioTriggerRuntime ? ctx.scenarioTriggerRuntime.getCinematicState() : null,
    controlGroups: Array.from(ctx.controlGroups.entries())
      .filter(([, ids]) =>
        ids.some((id) => {
          const u = ctx.units.get(id);
          return Boolean(u && u.hp > 0);
        })
      )
      .map(([group, ids]) => ({
        group,
        count: ids.filter((id) => {
          const u = ctx.units.get(id);
          return Boolean(u && u.hp > 0);
        }).length,
      }))
      .sort((a, b) => a.group - b.group),
    campaignMissionState: ctx.campaignScript
      ? (() => {
          const st =
            ctx.campaignScript!.stages[
              Math.min(ctx.campaignStageIndex, Math.max(0, ctx.campaignScript!.stages.length - 1))
            ];
          return {
            scenarioId: ctx.campaignScript!.scenarioId,
            title: ctx.campaignScript!.title,
            stageIndex: ctx.campaignStageIndex,
            totalStages: ctx.campaignScript!.stages.length,
            objectives: st
              ? st.objectives.map((o) => {
                  const res = ctx.evaluateCampaignObjective(o.check);
                  return { id: o.id, label: o.label, done: res.done, progressText: res.progressText };
                })
              : [],
            dialogue: ctx.campaignDialogue ? { ...ctx.campaignDialogue } : null,
          } satisfies CampaignMissionSnapshot;
        })()
      : null,
    factionScores: ctx.factions.map((f, idx): FactionScoreEntry => {
      const teamScore = f.team === 'player' ? playerScoreBreakdown.total : enemyScoreBreakdown.total;
      const teamCount = Math.max(1, ctx.factions.filter((x) => x.team === f.team).length);
      const slotUnits = [...ctx.units.values()].filter((u) => u.factionSlot === f.slotIndex && u.hp > 0).length;
      const slotScore = f.isSelf
        ? teamScore
        : Math.round(teamScore / teamCount + slotUnits * 35 + (teamCount > 1 ? (idx % 3) * 18 : 0));
      return {
        slotIndex: f.slotIndex,
        label: f.label,
        teamIndex: f.teamIndex,
        team: f.team,
        pantheon: f.pantheon,
        majorGod: f.majorGod,
        colorHex: f.colorHex,
        crestId: f.crestId,
        age: f.age,
        score: slotScore,
        isHuman: f.isHuman,
        isSelf: f.isSelf,
        defeated: f.defeated,
        aiPersonality: f.aiPersonality,
      };
    }),
    wonderAgeActive: ctx.hasTeamWonder('player'),
    enemyWonderAgeActive: ctx.hasTeamWonder('enemy'),
    godPowerUses: { ...ctx.godPowerUses },
    godPowerRecastCosts: Object.fromEntries(
      ctx.unlockedPowers.map((pid) => [
        pid,
        getRetoldRecastFavorCost(pid, ctx.godPowerUses[pid] ?? 0, ctx.hasTeamWonder('player')),
      ])
    ),
    townBellActive: ctx.townBellActive,
    selectedBuildingGarrison: (() => {
      const sb = ctx.getSelectedPlayerBuilding();
      if (!sb || !sb.isConstructed || !ctx.canGarrisonIn(sb)) return null;
      const count = sb.garrisonedUnitIds?.length ?? 0;
      const capacity = sb.maxGarrisonCapacity ?? ctx.getGarrisonCapacity(sb.kind);
      return {
        buildingId: sb.id,
        count,
        capacity,
        bonusArrows: Math.min(4, Math.floor(count / 2)),
      };
    })(),
    selectedMythAbility: (() => {
      const selMyth = [...ctx.units.values()].find(
        (u) => u.team === 'player' && u.selected && u.hp > 0 && Boolean(MYTH_SPECIAL_ABILITIES[u.kind])
      );
      if (!selMyth) return null;
      const spec = MYTH_SPECIAL_ABILITIES[selMyth.kind]!;
      return {
        unitId: selMyth.id,
        unitKind: selMyth.kind,
        name: spec.name,
        description: spec.description,
        cooldownRemaining: Number((selMyth.specialCooldown ?? 0).toFixed(1)),
        cooldownTotal: spec.cooldown,
        autoCast: selMyth.specialAutoCast !== false,
      };
    })(),
    dragWallPreviewCount: ctx.dragWallPoints.length,
    replayState: ctx.replayState ? { ...ctx.replayState } : null,
    timelineHistory: [...ctx.timelineHistory],
  });
}
