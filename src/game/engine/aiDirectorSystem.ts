import * as THREE from 'three';
import { soundEngine } from '../audio';
import { TECH_SPECS } from '../divineData';
import { resolveEffectiveMapId } from '../../maps';
import { AGE_COSTS, AGE_NAMES, AgeLevel, FormationId, UnitKind } from '../types';
import { AoMEngineContext, BuildingEntity, MAX_TOWN_CENTERS, ResourceNodeEntity, UnitEntity } from './engineTypes';

function dispatchIdleAiWorkers(ctx: AoMEngineContext) {
  for (const u of ctx.units.values()) {
    if (u.team === 'enemy' && ctx.isWorkerKind(u.kind) && u.state === 'idle') {
      let best: ResourceNodeEntity | null = null;
      let bestScore = 38;
      for (const n of ctx.nodes.values()) {
        if (n.kind === 'fish_spot') continue;
        const d = n.mesh.position.distanceTo(u.mesh.position);
        const score =
          u.kind === 'norse_dwarf' ? (n.resourceType === 'gold' ? d - 16 : d + 8) : d;
        if (score < bestScore) {
          bestScore = score;
          best = n;
        }
      }
      if (best) {
        u.state = 'gather';
        u.targetNodeId = best.id;
        u.gatherResourceType = best.resourceType;
        u.lastGatherPos = best.mesh.position.clone();
        ctx.autoDispatchIdleOxCartToNode('enemy', best.mesh.position);
      }
    }
  }
}

function advanceAiAge(ctx: AoMEngineContext) {
  const ecoAdvanceOffset = ctx.aiPersonality === 'economic' ? -15 : 0;
  if (ctx.enemyAge === 1 && ctx.elapsedSeconds > 75 + ecoAdvanceOffset && ctx.canAfford(ctx.enemyResources, AGE_COSTS[2])) {
    ctx.deductCost(ctx.enemyResources, AGE_COSTS[2]);
    ctx.enemyAge = 2;
    ctx.upgradeTeamTownCenters('enemy', 2);
    soundEngine.playAgeTransitionComplete(2, ctx.enemyPantheon, true);
    ctx.notifyStatus(`⚠️ O inimigo avançou para a ${AGE_NAMES[2]}!`);
  } else if (ctx.enemyAge === 2 && ctx.elapsedSeconds > 165 + ecoAdvanceOffset && ctx.canAfford(ctx.enemyResources, AGE_COSTS[3])) {
    ctx.deductCost(ctx.enemyResources, AGE_COSTS[3]);
    ctx.enemyAge = 3;
    ctx.upgradeTeamTownCenters('enemy', 3);
    soundEngine.playAgeTransitionComplete(3, ctx.enemyPantheon, true);
    ctx.notifyStatus(`⚠️ O inimigo avançou para a ${AGE_NAMES[3]}!`);
  } else if (ctx.enemyAge === 3 && ctx.elapsedSeconds > 260 + ecoAdvanceOffset && ctx.canAfford(ctx.enemyResources, AGE_COSTS[4])) {
    ctx.deductCost(ctx.enemyResources, AGE_COSTS[4]);
    ctx.enemyAge = 4;
    ctx.upgradeTeamTownCenters('enemy', 4);
    soundEngine.playAgeTransitionComplete(4, ctx.enemyPantheon, true);
    ctx.notifyStatus(`⚠️ O inimigo alcançou a ${AGE_NAMES[4]}!`);
  } else if (ctx.enemyAge === 4 && ctx.elapsedSeconds > 380 + ecoAdvanceOffset && ctx.canAfford(ctx.enemyResources, AGE_COSTS[5])) {
    ctx.deductCost(ctx.enemyResources, AGE_COSTS[5]);
    ctx.enemyAge = 5;
    ctx.upgradeTeamTownCenters('enemy', 5);
    soundEngine.playAgeTransitionComplete(5, ctx.enemyPantheon, true);
    ctx.notifyStatus(`⚡ ALERTA: O inimigo ascendeu à ${AGE_NAMES[5]}!`);
  }
}

export function stepEnemyNavalAI(ctx: AoMEngineContext, dt: number) {
  ctx.aiNavalTimer += dt;
  if (ctx.aiNavalTimer < 6.0) return;
  ctx.aiNavalTimer = 0;

  let hasFishOrWater = false;
  for (const n of ctx.nodes.values()) {
    if (n.kind === 'fish_spot') {
      hasFishOrWater = true;
      break;
    }
  }
  const effMap = resolveEffectiveMapId(ctx.mapId);
  if (
    !hasFishOrWater &&
    effMap !== 'islands' &&
    effMap !== 'archipelago' &&
    effMap !== 'mediterranean' &&
    effMap !== 'midgard' &&
    effMap !== 'vinlandsaga' &&
    effMap !== 'total_war'
  ) {
    return;
  }

  const enemyDocks: BuildingEntity[] = [];
  let enemyTc: BuildingEntity | null = null;
  for (const b of ctx.buildings.values()) {
    if (b.team === 'enemy' && b.isConstructed) {
      if (b.kind === 'dock') enemyDocks.push(b);
      else if (b.kind === 'town_center' && !enemyTc) enemyTc = b;
    }
  }

  if (enemyDocks.length === 0 && enemyTc) {
    const dockStats = ctx.buildingStats('dock', 'enemy');
    if (ctx.canAfford(ctx.enemyResources, dockStats.cost)) {
      const baseX = enemyTc.mesh.position.x;
      const baseZ = enemyTc.mesh.position.z;
      for (let r = 10; r <= 34; r += 4) {
        let built = false;
        for (let a = 0; a < 16; a++) {
          const ang = (a / 16) * Math.PI * 2;
          const cx = THREE.MathUtils.clamp(baseX + Math.cos(ang) * r, -ctx.playableHalfSize + 5, ctx.playableHalfSize - 5);
          const cz = THREE.MathUtils.clamp(baseZ + Math.sin(ang) * r, -ctx.playableHalfSize + 5, ctx.playableHalfSize - 5);
          if (ctx.canPlaceBuildingAt('dock', cx, cz, 'enemy')) {
            ctx.deductCost(ctx.enemyResources, dockStats.cost);
            const d = ctx.spawnBuilding('dock', 'enemy', cx, cz, true);
            enemyDocks.push(d);
            ctx.syncNavObstacles();
            built = true;
            break;
          }
        }
        if (built) break;
      }
    }
  }

  if (enemyDocks.length === 0) return;
  const dock = enemyDocks[0];
  const enemyPop = ctx.getPopulation('enemy');

  let enemyFishers = 0;
  let enemyWarships = 0;
  const enemyTransports: UnitEntity[] = [];
  for (const u of ctx.units.values()) {
    if (u.team !== 'enemy' || u.hp <= 0) continue;
    if (u.kind === 'fishing_ship') {
      enemyFishers++;
      if (u.state === 'idle') {
        let bestFish: ResourceNodeEntity | null = null;
        let bestD = Infinity;
        for (const n of ctx.nodes.values()) {
          if (n.kind !== 'fish_spot') continue;
          const d = n.mesh.position.distanceTo(u.mesh.position);
          if (d < bestD) {
            bestD = d;
            bestFish = n;
          }
        }
        if (bestFish) {
          u.state = 'gather';
          u.targetNodeId = bestFish.id;
          u.gatherResourceType = 'food';
          u.lastGatherPos = bestFish.mesh.position.clone();
        }
      }
    } else if (u.kind === 'war_trireme') {
      enemyWarships++;
      if (ctx.treatyRemaining <= 0 && u.state === 'idle') {
        const targetShip = [...ctx.units.values()].find(
          (pu) => pu.team === 'player' && pu.hp > 0 && ctx.unitStats(pu.kind, 'player').isNaval
        );
        const targetDock = [...ctx.buildings.values()].find((pb) => pb.team === 'player' && pb.kind === 'dock');
        if (targetShip) {
          u.state = 'attack';
          u.targetEntityId = targetShip.id;
        } else if (targetDock) {
          u.state = 'attack';
          u.targetEntityId = targetDock.id;
        }
      }
    } else if (u.kind === 'transport_ship') {
      enemyTransports.push(u);
    }
  }

  if (dock.trainingQueue.length === 0 && enemyPop.current + 2 <= enemyPop.cap) {
    if (enemyFishers < 3 && hasFishOrWater) {
      const fStats = ctx.unitStats('fishing_ship', 'enemy');
      if (ctx.canAfford(ctx.enemyResources, fStats.cost)) {
        ctx.deductCost(ctx.enemyResources, fStats.cost);
        dock.trainingQueue.push({ kind: 'fishing_ship', progress: 0, total: fStats.trainTime });
      }
    } else if (enemyWarships < 3 && ctx.enemyAge >= 2) {
      const wStats = ctx.unitStats('war_trireme', 'enemy');
      if (ctx.canAfford(ctx.enemyResources, wStats.cost)) {
        ctx.deductCost(ctx.enemyResources, wStats.cost);
        dock.trainingQueue.push({ kind: 'war_trireme', progress: 0, total: wStats.trainTime });
      }
    } else if (enemyTransports.length < 1 && ctx.enemyAge >= 2) {
      const tStats = ctx.unitStats('transport_ship', 'enemy');
      if (ctx.canAfford(ctx.enemyResources, tStats.cost)) {
        ctx.deductCost(ctx.enemyResources, tStats.cost);
        dock.trainingQueue.push({ kind: 'transport_ship', progress: 0, total: tStats.trainTime });
      }
    }
  }

  if (ctx.treatyRemaining <= 0 && enemyTransports.length > 0) {
    const ship = enemyTransports[0];
    const cargo = ship.cargoIds ?? [];
    if (ship.state === 'idle' && cargo.length === 0) {
      const nearbySoldiers = [...ctx.units.values()]
        .filter(
          (u) =>
            u.team === 'enemy' &&
            u.hp > 0 &&
            u.state === 'idle' &&
            !ctx.isNonCombatEconUnit(u) &&
            !ctx.unitStats(u.kind, 'enemy').isNaval &&
            u.mesh.position.distanceTo(ship.mesh.position) < 28
        )
        .slice(0, 4);
      if (nearbySoldiers.length >= 2) {
        ship.cargoIds = [];
        for (const s of nearbySoldiers) {
          s.state = 'garrisoned';
          s.transportedInId = ship.id;
          s.mesh.visible = false;
          ship.cargoIds.push(s.id);
        }
        const playerTc = ctx.findNearestTownCenter('player', new THREE.Vector3(0, 0, 0));
        if (playerTc) {
          const pCell = ctx.navGrid.worldToCell(playerTc.mesh.position.x, playerTc.mesh.position.z);
          const sCell = ctx.navGrid.worldToCell(ship.mesh.position.x, ship.mesh.position.z);
          const dropWater = ctx.navGrid.nearestWaterCell(pCell.gx, pCell.gz, sCell.gx, sCell.gz, 22);
          if (dropWater) {
            const dw = ctx.navGrid.cellToWorld(dropWater.gx, dropWater.gz);
            ship.state = 'move';
            ship.waypoints = ctx.navGrid.findWaterPath(ship.mesh.position.x, ship.mesh.position.z, dw.x, dw.z);
            ship.targetPos = ship.waypoints.shift() ?? new THREE.Vector3(dw.x, -0.22, dw.z);
            ship.tradeTargetBuildingId = `disembark:${playerTc.mesh.position.x.toFixed(1)},${playerTc.mesh.position.z.toFixed(1)}`;
          }
        }
      }
    }
  }
}

export function stepIndependentAiFactions(ctx: AoMEngineContext, dt: number) {
  if (ctx.factions.length <= 2) return;
  ctx.aiFactionTimer += dt;
  if (ctx.aiFactionTimer < 8.5) return;
  ctx.aiFactionTimer = 0;

  for (const fac of ctx.factions) {
    if (fac.isSelf || fac.isHuman || fac.defeated) continue;
    const mult = fac.aiPersonality === 'economic' ? 1.25 : fac.aiPersonality === 'aggressive' ? 1.1 : 1.0;
    fac.resources.food += 28 * mult;
    fac.resources.wood += 22 * mult;
    fac.resources.gold += 20 * mult;
    fac.resources.favor = Math.min(200, fac.resources.favor + 4.5);

    const ageThresholds: Record<AgeLevel, number> = { 1: 0, 2: 85, 3: 185, 4: 295, 5: 420 };
    const nextAge = (fac.age + 1) as AgeLevel;
    if (nextAge <= 4 && ctx.elapsedSeconds > ageThresholds[nextAge] && ctx.canAfford(fac.resources, AGE_COSTS[nextAge])) {
      ctx.deductCost(fac.resources, AGE_COSTS[nextAge]);
      fac.age = nextAge;
    }

    const facTc = [...ctx.buildings.values()].find(
      (b) => b.factionSlot === fac.slotIndex && b.isConstructed && b.kind === 'town_center'
    );
    if (!facTc) {
      const hasAnyBuilding = [...ctx.buildings.values()].some((b) => b.factionSlot === fac.slotIndex);
      if (!hasAnyBuilding) fac.defeated = true;
      continue;
    }

    const facUnits = [...ctx.units.values()].filter((u) => u.factionSlot === fac.slotIndex && u.hp > 0);
    if (facUnits.length < 10 && facTc.trainingQueue.length === 0) {
      const unitPick: UnitKind =
        fac.aiPersonality === 'aggressive'
          ? fac.pantheon === 'norse'
            ? 'ulfsark'
            : fac.pantheon === 'egyptian'
            ? 'egypt_spearman'
            : 'hoplite'
          : fac.aiPersonality === 'defensive'
          ? 'archer'
          : fac.age >= 2 && fac.resources.favor >= 15
          ? 'minotaur'
          : 'cavalry';
      const uSpec = ctx.unitStats(unitPick, fac.team);
      if (ctx.canAfford(fac.resources, uSpec.cost)) {
        ctx.deductCost(fac.resources, uSpec.cost);
        const spawned = ctx.spawnUnit(
          unitPick,
          fac.team,
          facTc.mesh.position.x + (Math.random() - 0.5) * 6,
          facTc.mesh.position.z + (Math.random() - 0.5) * 6
        );
        spawned.factionSlot = fac.slotIndex;
      }
    }
  }
}

export function stepEnemyAI(ctx: AoMEngineContext, dt: number) {
  const pers = ctx.aiPersonality;
  const rateMult =
    (ctx.difficulty === 'titan' ? 1.55 : ctx.difficulty === 'hard' ? 1.25 : 0.92) *
    (pers === 'economic' ? 1.15 : pers === 'aggressive' ? 1.08 : 1.0);
  ctx.enemyAiTimer += dt * rateMult;
  ctx.enemyWaveTimer -= dt * rateMult * (pers === 'aggressive' ? 1.3 : pers === 'defensive' ? 0.78 : 1.0);

  for (const f of ctx.factions) {
    if (f.isSelf) f.age = ctx.age;
    else if (f.team === 'enemy') f.age = ctx.enemyAge;
  }

  if (ctx.enemyAiTimer >= 3.2) {
    ctx.enemyAiTimer = 0;

    dispatchIdleAiWorkers(ctx);

    ctx.enemyResources.food += 18 * rateMult;
    ctx.enemyResources.wood += 15 * rateMult;
    ctx.enemyResources.gold += 14 * rateMult;

    advanceAiAge(ctx);

    let pInfantry = 0;
    let pCavalry = 0;
    let pArchers = 0;
    let pMyth = 0;
    for (const pu of ctx.units.values()) {
      if (pu.team !== 'player' || pu.hp <= 0 || ctx.isNonCombatEconUnit(pu)) continue;
      const pSpec = ctx.unitStats(pu.kind, 'player');
      if (pSpec.isMythic || pSpec.isGod) pMyth++;
      else if (pSpec.range >= 5) pArchers++;
      else if (pSpec.speed >= 5.2) pCavalry++;
      else pInfantry++;
    }

    const enemyPop = ctx.getPopulation('enemy');
    let hasTemple = false;
    let barracks: BuildingEntity | null = null;
    let archeryRange: BuildingEntity | null = null;
    let stable: BuildingEntity | null = null;
    let siegeWorks: BuildingEntity | null = null;
    let temple: BuildingEntity | null = null;
    let fortress: BuildingEntity | null = null;
    let market: BuildingEntity | null = null;
    let dock: BuildingEntity | null = null;
    let tc: BuildingEntity | null = null;
    let farmCount = 0;
    let towerCount = 0;
    for (const b of ctx.buildings.values()) {
      if (b.team === 'enemy' && b.isConstructed) {
        if (b.kind === 'temple') {
          hasTemple = true;
          temple = b;
        } else if (b.kind === 'barracks') barracks = b;
        else if (b.kind === 'archery_range') archeryRange = b;
        else if (b.kind === 'stable') stable = b;
        else if (b.kind === 'siege_works') siegeWorks = b;
        else if (b.kind === 'fortress') fortress = b;
        else if (b.kind === 'market') market = b;
        else if (b.kind === 'dock') dock = b;
        else if (b.kind === 'farm') farmCount++;
        else if (b.kind === 'tower') towerCount++;
        else if (b.kind === 'town_center') tc = b;
      }
    }

    if (hasTemple) {
      const unclaimedRelic = [...ctx.relics.values()].find((r) => r.claimedByTeam === null);
      if (unclaimedRelic) {
        const enemyHero = [...ctx.units.values()].find(
          (u) => u.team === 'enemy' && u.state === 'idle' && ctx.unitStats(u.kind, 'enemy').isHero
        );
        if (enemyHero) {
          const dRelic = enemyHero.mesh.position.distanceTo(unclaimedRelic.mesh.position);
          if (dRelic <= 2.4) {
            unclaimedRelic.claimedByTeam = 'enemy';
            unclaimedRelic.mesh.visible = false;
            ctx.enemyResources.favor = Math.min(200, ctx.enemyResources.favor + 25);
          } else {
            enemyHero.state = 'move';
            enemyHero.waypoints = ctx.navGrid.findPath(
              enemyHero.mesh.position.x,
              enemyHero.mesh.position.z,
              unclaimedRelic.mesh.position.x,
              unclaimedRelic.mesh.position.z
            );
            enemyHero.targetPos = enemyHero.waypoints.shift() ?? unclaimedRelic.mesh.position.clone();
          }
        }
      }
    }

    const enemyBaseX = tc ? tc.mesh.position.x : ctx.baseOffset;
    const enemyBaseZ = tc ? tc.mesh.position.z : -ctx.baseOffset;

    const enemyHouseStats = ctx.buildingStats('house', 'enemy');
    if (enemyPop.current + 3 >= enemyPop.cap && ctx.canAfford(ctx.enemyResources, enemyHouseStats.cost)) {
      const hx = enemyBaseX + 4 + Math.random() * 8;
      const hz = enemyBaseZ + 10 - Math.random() * 10;
      if (ctx.canPlaceBuildingAt('house', hx, hz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyHouseStats.cost);
        ctx.spawnBuilding('house', 'enemy', hx, hz, true);
        ctx.syncNavObstacles();
      }
    }
    const enemyArcheryStats = ctx.buildingStats('archery_range', 'enemy');
    if (!archeryRange && ctx.enemyAge >= 2 && ctx.canAfford(ctx.enemyResources, enemyArcheryStats.cost)) {
      const ax = enemyBaseX - 12;
      const az = enemyBaseZ + 1;
      if (ctx.canPlaceBuildingAt('archery_range', ax, az, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyArcheryStats.cost);
        ctx.spawnBuilding('archery_range', 'enemy', ax, az, true);
        ctx.syncNavObstacles();
      }
    }
    const enemyStableStats = ctx.buildingStats('stable', 'enemy');
    if (!stable && ctx.enemyAge >= 2 && ctx.canAfford(ctx.enemyResources, enemyStableStats.cost)) {
      const sx = enemyBaseX - 4;
      const sz = enemyBaseZ + 12;
      if (ctx.canPlaceBuildingAt('stable', sx, sz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyStableStats.cost);
        ctx.spawnBuilding('stable', 'enemy', sx, sz, true);
        ctx.syncNavObstacles();
      }
    }
    const enemyTempleStats = ctx.buildingStats('temple', 'enemy');
    if (!hasTemple && ctx.enemyAge >= 2 && ctx.canAfford(ctx.enemyResources, enemyTempleStats.cost)) {
      const tx = enemyBaseX - 6;
      const tz = enemyBaseZ - 4;
      if (ctx.canPlaceBuildingAt('temple', tx, tz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyTempleStats.cost);
        ctx.spawnBuilding('temple', 'enemy', tx, tz, true);
        ctx.syncNavObstacles();
      }
    }
    if (ctx.enemyPantheon === 'atlantean' && !market && ctx.enemyAge >= 2) {
      const enemyMarketStats = ctx.buildingStats('market', 'enemy');
      const mx = enemyBaseX + 6;
      const mz = enemyBaseZ - 5;
      if (ctx.canAfford(ctx.enemyResources, enemyMarketStats.cost) && ctx.canPlaceBuildingAt('market', mx, mz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyMarketStats.cost);
        ctx.spawnBuilding('market', 'enemy', mx, mz, true);
        ctx.syncNavObstacles();
      }
    }
    const maxAiFarms = pers === 'economic' ? 5 : 3;
    const enemyFarmStats = ctx.buildingStats('farm', 'enemy');
    if (farmCount < maxAiFarms && ctx.enemyAge >= 2 && ctx.canAfford(ctx.enemyResources, enemyFarmStats.cost)) {
      const fx = enemyBaseX - 6 + Math.random() * 12;
      const fz = enemyBaseZ + 4 - Math.random() * 12;
      if (ctx.canPlaceBuildingAt('farm', fx, fz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyFarmStats.cost);
        ctx.spawnBuilding('farm', 'enemy', fx, fz, true);
        ctx.syncNavObstacles();
      }
    }
    const maxAiTowers = pers === 'defensive' ? 4 : 1;
    if (towerCount < maxAiTowers && ctx.enemyAge >= 2) {
      const enemyTowerStats = ctx.buildingStats('tower', 'enemy');
      const tx = enemyBaseX - 14 + Math.random() * 12;
      const tz = enemyBaseZ + 16 - Math.random() * 10;
      if (ctx.canAfford(ctx.enemyResources, enemyTowerStats.cost) && ctx.canPlaceBuildingAt('tower', tx, tz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyTowerStats.cost);
        ctx.spawnBuilding('tower', 'enemy', tx, tz, true);
        ctx.syncNavObstacles();
      }
    }
    const enemySiegeStats = ctx.buildingStats('siege_works', 'enemy');
    if (!siegeWorks && ctx.enemyAge >= 3 && ctx.canAfford(ctx.enemyResources, enemySiegeStats.cost)) {
      const swx = enemyBaseX - 15;
      const swz = enemyBaseZ + 10;
      if (ctx.canPlaceBuildingAt('siege_works', swx, swz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemySiegeStats.cost);
        ctx.spawnBuilding('siege_works', 'enemy', swx, swz, true);
        ctx.syncNavObstacles();
      }
    }
    const enemyFortStats = ctx.buildingStats('fortress', 'enemy');
    if (!fortress && ctx.enemyAge >= 3 && ctx.canAfford(ctx.enemyResources, enemyFortStats.cost)) {
      const ftx = enemyBaseX - 10;
      const ftz = enemyBaseZ + 8;
      if (ctx.canPlaceBuildingAt('fortress', ftx, ftz, 'enemy')) {
        ctx.deductCost(ctx.enemyResources, enemyFortStats.cost);
        ctx.spawnBuilding('fortress', 'enemy', ftx, ftz, true);
        ctx.syncNavObstacles();
      }
    }

    if (dock && dock.trainingQueue.length === 0 && enemyPop.current + 2 <= enemyPop.cap) {
      const enemyShips = [...ctx.units.values()].filter((u) => u.team === 'enemy' && ctx.unitStats(u.kind, 'enemy').isNaval);
      const shipPick: UnitKind = enemyShips.length < 2 ? 'fishing_ship' : 'war_trireme';
      const shipSpec = ctx.unitStats(shipPick, 'enemy');
      if (ctx.canAfford(ctx.enemyResources, shipSpec.cost)) {
        ctx.deductCost(ctx.enemyResources, shipSpec.cost);
        dock.trainingQueue.push({ kind: shipPick, progress: 0, total: shipSpec.trainTime });
      }
    }

    const enemyTcCount = ctx.getTownCenterCount('enemy');
    if ((ctx.enemyAge >= 2 || enemyTcCount === 0) && enemyTcCount < MAX_TOWN_CENTERS) {
      const enemyTcCost = ctx.buildingStats('town_center', 'enemy').cost;
      if (enemyTcCount === 0 || ctx.canAfford(ctx.enemyResources, enemyTcCost)) {
        const settlement = ctx.findNearestSettlement(ctx.baseOffset, -ctx.baseOffset, Math.round(52 * ctx.worldScale));
        if (settlement) {
          const enemyBuilders = [...ctx.units.values()]
            .filter((u) => u.team === 'enemy' && ctx.isWorkerKind(u.kind))
            .slice(0, 2);
          if (enemyBuilders.length > 0) {
            if (enemyTcCount === 0) {
              ctx.enemyResources.wood = Math.max(ctx.enemyResources.wood, enemyTcCost.wood ?? 0);
              ctx.enemyResources.gold = Math.max(ctx.enemyResources.gold, enemyTcCost.gold ?? 0);
            }
            ctx.beginTownCenterOnSettlement(settlement, 'enemy', enemyBuilders);
          }
        }
      }
    }

    if (tc && tc.trainingQueue.length === 0) {
      const enemyVillagers = [...ctx.units.values()].filter((u) => u.team === 'enemy' && ctx.isWorkerKind(u.kind)).length;
      const enemyOxCarts = [...ctx.units.values()].filter((u) => u.team === 'enemy' && u.kind === 'ox_cart').length;
      const enemyOracles = [...ctx.units.values()].filter((u) => u.team === 'enemy' && u.kind === 'oracle').length;
      const isEnemyNorse = ctx.enemyPantheon === 'norse' || ctx.enemyPantheon === 'jotunn';
      const isEnemyAtlantean = ctx.enemyPantheon === 'atlantean';
      const isEnemyChinese = ctx.enemyPantheon === 'chinese';
      const targetWorkers = (isEnemyAtlantean ? 4 : 5) + (pers === 'economic' ? 2 : 0);
      if (isEnemyNorse && enemyOxCarts < 2 && enemyPop.current < enemyPop.cap) {
        const oxStats = ctx.unitStats('ox_cart', 'enemy');
        if (ctx.canAfford(ctx.enemyResources, oxStats.cost)) {
          ctx.deductCost(ctx.enemyResources, oxStats.cost);
          tc.trainingQueue.push({ kind: 'ox_cart', progress: 0, total: oxStats.trainTime });
        }
      } else if (isEnemyAtlantean && enemyOracles < 2 && enemyPop.current + 2 <= enemyPop.cap) {
        const oraStats = ctx.unitStats('oracle', 'enemy');
        if (ctx.canAfford(ctx.enemyResources, oraStats.cost)) {
          ctx.deductCost(ctx.enemyResources, oraStats.cost);
          tc.trainingQueue.push({ kind: 'oracle', progress: 0, total: oraStats.trainTime });
        }
      } else if (enemyVillagers < targetWorkers && enemyPop.current < enemyPop.cap) {
        const workerKind: UnitKind = isEnemyAtlantean
          ? 'citizen'
          : isEnemyChinese
          ? Math.random() < 0.3
            ? 'kuafu'
            : 'chinese_peasant'
          : isEnemyNorse && Math.random() < 0.45
          ? 'norse_dwarf'
          : 'villager';
        const villStats = ctx.unitStats(workerKind, 'enemy');
        if (ctx.canAfford(ctx.enemyResources, villStats.cost)) {
          ctx.deductCost(ctx.enemyResources, villStats.cost);
          tc.trainingQueue.push({ kind: workerKind, progress: 0, total: villStats.trainTime });
        }
      }
    }

    if (market && ctx.enemyPantheon === 'atlantean' && market.trainingQueue.length === 0 && enemyPop.current + 1 <= enemyPop.cap) {
      const llamaCount = [...ctx.units.values()].filter((u) => u.team === 'enemy' && u.kind === 'llama_caravan').length;
      if (llamaCount < 2) {
        const lStats = ctx.unitStats('llama_caravan', 'enemy');
        if (ctx.canAfford(ctx.enemyResources, lStats.cost)) {
          ctx.deductCost(ctx.enemyResources, lStats.cost);
          market.trainingQueue.push({ kind: 'llama_caravan', progress: 0, total: lStats.trainTime });
        }
      }
    }

    if (barracks && barracks.trainingQueue.length < 2 && enemyPop.current + 2 <= enemyPop.cap) {
      const choices: UnitKind[] =
        ctx.enemyPantheon === 'egyptian'
          ? ctx.enemyAge >= 2
            ? pCavalry > pInfantry
              ? ['egypt_spearman', 'egypt_spearman', 'slinger', 'axeman']
              : ['egypt_spearman', 'slinger', 'axeman']
            : ['egypt_spearman']
          : ctx.enemyPantheon === 'norse' || ctx.enemyPantheon === 'jotunn'
          ? ctx.enemyAge >= 2
            ? pMyth > 1
              ? ['hersir', 'ulfsark', 'throwing_axeman', 'godi']
              : ['ulfsark', 'throwing_axeman', 'hersir', 'godi']
            : ['ulfsark', 'hersir']
          : ctx.enemyPantheon === 'atlantean'
          ? ctx.enemyAge >= 3
            ? ['murmillo', 'arcus', 'contarius']
            : ['murmillo']
          : ctx.enemyPantheon === 'chinese'
          ? ctx.enemyAge >= 2
            ? pCavalry > pInfantry
              ? ['halberdier', 'halberdier', 'chu_ko_nu', 'fire_lance']
              : ['halberdier', 'chu_ko_nu', 'fire_lance']
            : ['halberdier']
          : ctx.enemyAge >= 2
          ? pInfantry > pCavalry
            ? ['hipaspist', 'hoplite']
            : ['hoplite', 'hipaspist']
          : ['hoplite'];
      const pick = choices[Math.floor(Math.random() * choices.length)];
      const pickStats = ctx.unitStats(pick, 'enemy');
      if (ctx.canAfford(ctx.enemyResources, pickStats.cost)) {
        ctx.deductCost(ctx.enemyResources, pickStats.cost);
        barracks.trainingQueue.push({ kind: pick, progress: 0, total: pickStats.trainTime });
      }
    }

    if (archeryRange && archeryRange.trainingQueue.length < 2 && ctx.enemyAge >= 2 && enemyPop.current + 2 <= enemyPop.cap) {
      const archChoices: UnitKind[] =
        ctx.enemyPantheon === 'egyptian'
          ? ctx.enemyAge >= 3
            ? ['slinger', 'chariot_archer']
            : ['slinger']
          : ctx.enemyPantheon === 'norse' || ctx.enemyPantheon === 'jotunn'
          ? ['throwing_axeman', 'godi']
          : ctx.enemyPantheon === 'atlantean'
          ? ['katapeltes', 'turma', 'cheiroballista']
          : ctx.enemyPantheon === 'chinese'
          ? ctx.enemyAge >= 3
            ? ['chu_ko_nu', 'fire_lance']
            : ['chu_ko_nu']
          : ctx.enemyAge >= 3
          ? pArchers > pInfantry
            ? ['peltast', 'peltast', 'archer', 'gastraphetes']
            : ['peltast', 'archer', 'gastraphetes']
          : ['peltast', 'archer'];
      const archPick = archChoices[Math.floor(Math.random() * archChoices.length)];
      const archStats = ctx.unitStats(archPick, 'enemy');
      if (ctx.canAfford(ctx.enemyResources, archStats.cost)) {
        ctx.deductCost(ctx.enemyResources, archStats.cost);
        archeryRange.trainingQueue.push({ kind: archPick, progress: 0, total: archStats.trainTime });
      }
    }

    if (stable && stable.trainingQueue.length < 2 && ctx.enemyAge >= 2 && enemyPop.current + 3 <= enemyPop.cap) {
      const cavChoices: UnitKind[] =
        ctx.enemyPantheon === 'egyptian' && ctx.enemyAge >= 3
          ? ['chariot_archer', 'camel_rider']
          : ctx.enemyPantheon === 'norse' || ctx.enemyPantheon === 'jotunn'
          ? ctx.enemyAge >= 3
            ? ['raiding_cavalry', 'jarl']
            : ['raiding_cavalry']
          : ctx.enemyPantheon === 'atlantean'
          ? ctx.enemyAge >= 3
            ? ['turma', 'contarius']
            : ['turma']
          : ctx.enemyPantheon === 'chinese'
          ? ['tiger_cavalry']
          : ['cavalry', 'prodromos'];
      const cavPick = cavChoices[Math.floor(Math.random() * cavChoices.length)];
      const cavStats = ctx.unitStats(cavPick, 'enemy');
      if (ctx.canAfford(ctx.enemyResources, cavStats.cost)) {
        ctx.deductCost(ctx.enemyResources, cavStats.cost);
        stable.trainingQueue.push({ kind: cavPick, progress: 0, total: cavStats.trainTime });
      }
    }

    if (siegeWorks && siegeWorks.trainingQueue.length === 0 && ctx.enemyAge >= 3 && enemyPop.current + 4 <= enemyPop.cap) {
      const siegePick: UnitKind =
        ctx.enemyPantheon === 'egyptian'
          ? Math.random() < 0.5
            ? 'siege_tower'
            : 'egypt_catapult'
          : ctx.enemyPantheon === 'norse' || ctx.enemyPantheon === 'jotunn'
          ? Math.random() < 0.5
            ? 'portable_ram'
            : 'norse_ballista'
          : ctx.enemyPantheon === 'atlantean'
          ? ctx.enemyAge >= 4
            ? Math.random() < 0.5
              ? 'fire_siphon'
              : 'onager'
            : 'cheiroballista'
          : ctx.enemyPantheon === 'chinese'
          ? Math.random() < 0.65
            ? 'fire_lance'
            : 'siege'
          : Math.random() < 0.5
          ? 'ram'
          : 'siege';
      const siegeStats = ctx.unitStats(siegePick, 'enemy');
      if (ctx.canAfford(ctx.enemyResources, siegeStats.cost)) {
        ctx.deductCost(ctx.enemyResources, siegeStats.cost);
        siegeWorks.trainingQueue.push({ kind: siegePick, progress: 0, total: siegeStats.trainTime });
      }
    }

    if (fortress && fortress.trainingQueue.length === 0 && ctx.enemyAge >= 3 && enemyPop.current + 4 <= enemyPop.cap) {
      const fortChoices: UnitKind[] =
        ctx.enemyPantheon === 'greek'
          ? ['jason', 'odysseus', 'perseus', 'hippolyta', 'theseus', 'bellerophon', 'siege']
          : ctx.enemyPantheon === 'egyptian'
          ? ['chariot_archer', 'camel_rider', 'war_elephant', 'priest']
          : ctx.enemyPantheon === 'norse' || ctx.enemyPantheon === 'jotunn'
          ? ['huskarl', 'jarl', 'portable_ram', 'norse_ballista', 'hersir', 'godi']
          : ctx.enemyPantheon === 'atlantean'
          ? ctx.enemyAge >= 4
            ? ['destroyer', 'fanatic', 'fire_siphon', 'onager']
            : ['destroyer']
          : ctx.enemyPantheon === 'chinese'
          ? ['nezha', 'jiang_ziya', 'tiger_cavalry', 'fire_lance']
          : ['hero', 'siege'];
      const fortPick = fortChoices[Math.floor(Math.random() * fortChoices.length)];
      const fortPickStats = ctx.unitStats(fortPick, 'enemy');
      if (ctx.canAfford(ctx.enemyResources, fortPickStats.cost)) {
        ctx.deductCost(ctx.enemyResources, fortPickStats.cost);
        fortress.trainingQueue.push({ kind: fortPick, progress: 0, total: fortPickStats.trainTime });
      }
    }

    if (temple && temple.trainingQueue.length === 0 && ctx.enemyAge >= 2 && enemyPop.current + 4 <= enemyPop.cap) {
      const enemyGodsAlive = [...ctx.units.values()].filter((u) => u.team === 'enemy' && ctx.unitStats(u.kind, 'enemy').isGod).length;
      const mythPool: UnitKind[] =
        ctx.enemyPantheon === 'egyptian'
          ? ctx.enemyAge >= 5 && enemyGodsAlive < 1 && Math.random() < 0.35
            ? ['ra', 'isis', 'set']
            : ctx.enemyAge >= 4
            ? ['avenger', 'mummy', 'scarab', 'petsuchos']
            : ctx.enemyAge >= 3
            ? ['roc', 'petsuchos', 'scarab', 'sphinx']
            : ['sphinx', 'wadjet', 'priest']
          : ctx.enemyPantheon === 'norse' || ctx.enemyPantheon === 'jotunn'
          ? ctx.enemyAge >= 4
            ? ['fire_giant', 'fenris_wolf', 'nidhogg', 'jormungand', 'fafnir', 'frost_giant', 'mountain_giant']
            : ctx.enemyAge >= 3
            ? ['frost_giant', 'mountain_giant', 'battle_boar', 'kraken', 'rock_troll', 'valkyrie']
            : ['troll', 'valkyrie', 'einherjar', 'hersir', 'godi']
          : ctx.enemyPantheon === 'atlantean'
          ? ctx.enemyAge >= 4
            ? ['hekagigantes', 'argus', 'lampades', 'tartarian_spawn', 'behemoth', 'satyr', 'stymphalian_bird']
            : ctx.enemyAge >= 3
            ? ['behemoth', 'satyr', 'stymphalian_bird', 'dryad', 'promethean']
            : ['promethean', 'automaton', 'caladria', 'carnivora']
          : ctx.enemyPantheon === 'chinese'
          ? ctx.enemyAge >= 4
            ? ['azure_dragon', 'taotie', 'yazi', 'qilin']
            : ctx.enemyAge >= 3
            ? ['taotie', 'yazi', 'qilin']
            : ['qilin', 'yazi']
          : ctx.enemyAge >= 5 && enemyGodsAlive < 1 && Math.random() < 0.35
          ? ['atena', 'ares', 'apolo', 'poseidon']
          : ctx.enemyAge >= 4
          ? ['cyclops', 'colossus', 'medusa', 'automaton', 'hydra']
          : ctx.enemyAge >= 3
          ? ['centaur', 'manticore', 'hydra', 'satyr', 'phoenix']
          : ['minotaur', 'nymph', 'cyclops'];
      const mythPick = mythPool[Math.floor(Math.random() * mythPool.length)];
      const mythStats = ctx.unitStats(mythPick, 'enemy');
      if (enemyPop.current + mythStats.popCost <= enemyPop.cap && ctx.canAfford(ctx.enemyResources, mythStats.cost)) {
        ctx.deductCost(ctx.enemyResources, mythStats.cost);
        temple.trainingQueue.push({ kind: mythPick, progress: 0, total: mythStats.trainTime });
      }
    }

    const enemyTechOrder = [
      'hunting_dogs',
      'hand_axe',
      'pickaxe',
      'medium_soldiers',
      'copper_weapons',
      'copper_mail',
      'copper_shields',
      'husbandry',
      'plow',
      'omniscience',
      'heavy_soldiers',
      'bronze_weapons',
      'bronze_mail',
      'bronze_shields',
      'ballistics',
      'champion_soldiers',
      'iron_weapons',
      'iron_mail',
      'iron_shields',
      'burning_pitch',
    ] as const;
    for (const tid of enemyTechOrder) {
      if (ctx.enemyResearchedTechs.includes(tid)) continue;
      const tSpec = TECH_SPECS[tid];
      if (ctx.enemyAge < tSpec.minAge) continue;
      if (tSpec.requires && !ctx.enemyResearchedTechs.includes(tSpec.requires)) continue;
      const hasBuilding = [...ctx.buildings.values()].some(
        (b) => b.team === 'enemy' && b.isConstructed && b.kind === tSpec.building
      );
      if (hasBuilding && ctx.canAfford(ctx.enemyResources, tSpec.cost)) {
        ctx.deductCost(ctx.enemyResources, tSpec.cost);
        ctx.enemyResearchedTechs.push(tid);
        break;
      }
    }
  }

  if (ctx.treatyRemaining <= 0 && ctx.enemyWaveTimer <= 0) {
    const baseTimer = ctx.difficulty === 'titan' ? 32 : ctx.difficulty === 'hard' ? 40 : 48;
    ctx.enemyWaveTimer =
      pers === 'aggressive' ? baseTimer * 0.72 : pers === 'defensive' ? baseTimer * 1.25 : baseTimer;
    const minRaidCount = pers === 'defensive' ? 6 : pers === 'aggressive' ? 2 : 3;
    const combatUnits = [...ctx.units.values()].filter(
      (u) =>
        u.team === 'enemy' &&
        (!ctx.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero)) &&
        !ctx.unitStats(u.kind, 'enemy').isNaval &&
        u.state === 'idle'
    );
    if (combatUnits.length >= minRaidCount) {
      const playerTc = ctx.findNearestTownCenter('player', new THREE.Vector3(0, 0, 0));
      const dest = playerTc ? playerTc.mesh.position : new THREE.Vector3(-ctx.baseOffset, 0, ctx.baseOffset);
      const enemyForm: FormationId = ctx.enemyAge >= 3 ? 'line' : 'box';
      ctx.issueFormationMove(combatUnits, dest.x, dest.z, [], enemyForm);
      ctx.notifyStatus('Atenção: Tropas inimigas marchando pelo vale!');
    }
  }

  stepEnemyNavalAI(ctx, dt);
  stepIndependentAiFactions(ctx, dt);
}
