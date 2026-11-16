import * as THREE from 'three';
import { groundHeightAt, PLAYABLE_HALF_SIZE } from './models';
import { MapId } from './types';

export const WATER_WALK_LIMIT = -0.34;
export const MAX_WALKABLE_SLOPE_RAD = 0.68;

export interface ObstacleCircle {
  x: number;
  z: number;
  radius: number;
}

/**
 * Grid-based A* navigation mesh inspired by AoM-Native-Port's NavigationGrid.
 * Separates static terrain hazards (deep water & steep slopes) from dynamic
 * building/resource footprints so destroying one obstacle never unblocks an
 * adjacent overlapping footprint.
 */
export class NavigationGrid {
  public readonly cellSize = 2.0;
  public readonly width: number;
  public readonly height: number;
  private terrainBlocked: Uint8Array;
  private dynamicBlocked: Uint8Array;

  constructor() {
    this.width = Math.round((PLAYABLE_HALF_SIZE * 2) / this.cellSize);
    this.height = this.width;
    this.terrainBlocked = new Uint8Array(this.width * this.height);
    this.dynamicBlocked = new Uint8Array(this.width * this.height);
  }

  public rebuildTerrain(mapId: MapId) {
    this.terrainBlocked.fill(0);
    const step = this.cellSize * 0.5;
    for (let gz = 0; gz < this.height; gz++) {
      for (let gx = 0; gx < this.width; gx++) {
        const wx = -PLAYABLE_HALF_SIZE + (gx + 0.5) * this.cellSize;
        const wz = -PLAYABLE_HALF_SIZE + (gz + 0.5) * this.cellSize;
        const h = groundHeightAt(wx, wz, mapId);
        if (h < WATER_WALK_LIMIT) {
          this.terrainBlocked[gz * this.width + gx] = 1;
          continue;
        }
        const hx1 = groundHeightAt(wx + step, wz, mapId);
        const hx0 = groundHeightAt(wx - step, wz, mapId);
        const hz1 = groundHeightAt(wx, wz + step, mapId);
        const hz0 = groundHeightAt(wx, wz - step, mapId);
        const dhx = (hx1 - hx0) / this.cellSize;
        const dhz = (hz1 - hz0) / this.cellSize;
        const slope = Math.atan(Math.hypot(dhx, dhz));
        if (slope > MAX_WALKABLE_SLOPE_RAD) {
          this.terrainBlocked[gz * this.width + gx] = 1;
        }
      }
    }
  }

  public rebuildObstacles(obstacles: ObstacleCircle[]) {
    this.dynamicBlocked.fill(0);
    for (const obs of obstacles) {
      const r = obs.radius;
      const minGx = Math.max(0, Math.floor((obs.x - r + PLAYABLE_HALF_SIZE) / this.cellSize));
      const maxGx = Math.min(this.width - 1, Math.floor((obs.x + r + PLAYABLE_HALF_SIZE) / this.cellSize));
      const minGz = Math.max(0, Math.floor((obs.z - r + PLAYABLE_HALF_SIZE) / this.cellSize));
      const maxGz = Math.min(this.height - 1, Math.floor((obs.z + r + PLAYABLE_HALF_SIZE) / this.cellSize));

      for (let gz = minGz; gz <= maxGz; gz++) {
        const cz = -PLAYABLE_HALF_SIZE + (gz + 0.5) * this.cellSize;
        for (let gx = minGx; gx <= maxGx; gx++) {
          const cx = -PLAYABLE_HALF_SIZE + (gx + 0.5) * this.cellSize;
          if (Math.hypot(cx - obs.x, cz - obs.z) <= r + this.cellSize * 0.28) {
            this.dynamicBlocked[gz * this.width + gx] = 1;
          }
        }
      }
    }
  }

  public inBounds(gx: number, gz: number): boolean {
    return gx >= 0 && gz >= 0 && gx < this.width && gz < this.height;
  }

  public isWalkableCell(gx: number, gz: number): boolean {
    if (!this.inBounds(gx, gz)) return false;
    const idx = gz * this.width + gx;
    return this.terrainBlocked[idx] === 0 && this.dynamicBlocked[idx] === 0;
  }

  public isTerrainWalkable(wx: number, wz: number): boolean {
    const c = this.worldToCell(wx, wz);
    return this.terrainBlocked[c.gz * this.width + c.gx] === 0;
  }

  public worldToCell(wx: number, wz: number): { gx: number; gz: number } {
    const gx = Math.max(0, Math.min(this.width - 1, Math.floor((wx + PLAYABLE_HALF_SIZE) / this.cellSize)));
    const gz = Math.max(0, Math.min(this.height - 1, Math.floor((wz + PLAYABLE_HALF_SIZE) / this.cellSize)));
    return { gx, gz };
  }

  public cellToWorld(gx: number, gz: number): THREE.Vector3 {
    return new THREE.Vector3(
      -PLAYABLE_HALF_SIZE + (gx + 0.5) * this.cellSize,
      0,
      -PLAYABLE_HALF_SIZE + (gz + 0.5) * this.cellSize
    );
  }

  public nearestWalkableCell(
    gx: number,
    gz: number,
    refGx: number,
    refGz: number,
    maxRing = 8
  ): { gx: number; gz: number } | null {
    if (this.isWalkableCell(gx, gz)) return { gx, gz };
    for (let r = 1; r <= maxRing; r++) {
      let best: { gx: number; gz: number } | null = null;
      let bestDist = Infinity;
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
          const nx = gx + dx;
          const nz = gz + dz;
          if (!this.isWalkableCell(nx, nz)) continue;
          const d = Math.hypot(nx - refGx, nz - refGz);
          if (d < bestDist) {
            bestDist = d;
            best = { gx: nx, gz: nz };
          }
        }
      }
      if (best) return best;
    }
    return null;
  }

  public hasLineOfSight(x0: number, z0: number, x1: number, z1: number): boolean {
    const dist = Math.hypot(x1 - x0, z1 - z0);
    const steps = Math.max(2, Math.ceil(dist / (this.cellSize * 0.45)));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const wx = x0 + (x1 - x0) * t;
      const wz = z0 + (z1 - z0) * t;
      const c = this.worldToCell(wx, wz);
      if (!this.isWalkableCell(c.gx, c.gz)) return false;
    }
    return true;
  }

  /**
   * Computes a collision-free waypoint path from (fromX, fromZ) to (toX, toZ).
   * Uses 8-way A* without diagonal corner-cutting + string-pulling smoothing.
   */
  public findPath(fromX: number, fromZ: number, toX: number, toZ: number): THREE.Vector3[] {
    if (this.hasLineOfSight(fromX, fromZ, toX, toZ)) {
      const endCell = this.worldToCell(toX, toZ);
      if (this.isWalkableCell(endCell.gx, endCell.gz)) {
        return [new THREE.Vector3(toX, 0, toZ)];
      }
    }

    const startRaw = this.worldToCell(fromX, fromZ);
    const goalRaw = this.worldToCell(toX, toZ);
    const start = this.nearestWalkableCell(startRaw.gx, startRaw.gz, goalRaw.gx, goalRaw.gz, 8);
    const goal = this.nearestWalkableCell(goalRaw.gx, goalRaw.gz, startRaw.gx, startRaw.gz, 8);
    if (!start || !goal) {
      return [new THREE.Vector3(toX, 0, toZ)];
    }

    if (start.gx === goal.gx && start.gz === goal.gz) {
      return [new THREE.Vector3(toX, 0, toZ)];
    }

    const total = this.width * this.height;
    const gScore = new Float32Array(total).fill(Infinity);
    const fScore = new Float32Array(total).fill(Infinity);
    const parent = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);

    const startIdx = start.gz * this.width + start.gx;
    const goalIdx = goal.gz * this.width + goal.gx;
    gScore[startIdx] = 0;
    fScore[startIdx] = Math.hypot(goal.gx - start.gx, goal.gz - start.gz);

    const open: number[] = [startIdx];
    const dirs: [number, number, number][] = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, Math.SQRT2],
      [1, -1, Math.SQRT2],
      [-1, 1, Math.SQRT2],
      [-1, -1, Math.SQRT2],
    ];

    let found = false;
    let iterations = 0;
    const maxIterations = 2600;

    while (open.length > 0 && iterations++ < maxIterations) {
      // Pop lowest fScore
      let bestPos = 0;
      let bestF = fScore[open[0]];
      for (let i = 1; i < open.length; i++) {
        const f = fScore[open[i]];
        if (f < bestF) {
          bestF = f;
          bestPos = i;
        }
      }
      const cur = open[bestPos];
      open[bestPos] = open[open.length - 1];
      open.pop();

      if (cur === goalIdx) {
        found = true;
        break;
      }
      if (closed[cur] === 1) continue;
      closed[cur] = 1;

      const cx = cur % this.width;
      const cz = Math.floor(cur / this.width);

      for (const [dx, dz, stepCost] of dirs) {
        const nx = cx + dx;
        const nz = cz + dz;
        if (!this.isWalkableCell(nx, nz)) continue;
        // Prevent diagonal corner clipping across obstacle edges
        if (dx !== 0 && dz !== 0) {
          if (!this.isWalkableCell(cx + dx, cz) || !this.isWalkableCell(cx, cz + dz)) {
            continue;
          }
        }
        const nIdx = nz * this.width + nx;
        if (closed[nIdx] === 1) continue;

        const tentativeG = gScore[cur] + stepCost;
        if (tentativeG < gScore[nIdx]) {
          parent[nIdx] = cur;
          gScore[nIdx] = tentativeG;
          fScore[nIdx] = tentativeG + Math.hypot(goal.gx - nx, goal.gz - nz);
          open.push(nIdx);
        }
      }
    }

    if (!found) {
      return [new THREE.Vector3(toX, 0, toZ)];
    }

    const rawCells: THREE.Vector3[] = [];
    let cur = goalIdx;
    while (cur !== -1 && cur !== startIdx) {
      const gx = cur % this.width;
      const gz = Math.floor(cur / this.width);
      rawCells.push(this.cellToWorld(gx, gz));
      cur = parent[cur];
    }
    rawCells.reverse();

    if (rawCells.length === 0) {
      return [new THREE.Vector3(toX, 0, toZ)];
    }

    // Replace final point with exact world destination if that cell itself was walkable,
    // otherwise append exact destination so units step up to the building/node perimeter.
    if (this.isWalkableCell(goalRaw.gx, goalRaw.gz)) {
      rawCells[rawCells.length - 1].set(toX, 0, toZ);
    } else {
      rawCells.push(new THREE.Vector3(toX, 0, toZ));
    }

    // String-pull smoothing so units follow clean diagonals instead of grid steps
    const smoothed: THREE.Vector3[] = [];
    let anchorX = fromX;
    let anchorZ = fromZ;
    let i = 0;
    while (i < rawCells.length) {
      let furthest = i;
      for (let j = rawCells.length - 1; j > i; j--) {
        if (this.hasLineOfSight(anchorX, anchorZ, rawCells[j].x, rawCells[j].z)) {
          furthest = j;
          break;
        }
      }
      smoothed.push(rawCells[furthest]);
      anchorX = rawCells[furthest].x;
      anchorZ = rawCells[furthest].z;
      i = furthest + 1;
    }

    return smoothed;
  }
}
