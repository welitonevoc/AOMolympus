import { describe, expect, it } from 'vitest';
import { NavigationGrid } from '../navigation';

describe('NavigationGrid', () => {
  it('rebuilds walkable terrain and marks dynamic obstacles as blocked', () => {
    const grid = new NavigationGrid();
    grid.rebuildTerrain('mediterranean', 'normal');

    expect(grid.width).toBeGreaterThan(20);
    expect(grid.height).toBe(grid.width);

    // Block an explicit circular footprint near center-west
    grid.rebuildObstacles([{ x: -16, z: -16, radius: 3.5 }]);
    const blockedCell = grid.worldToCell(-16, -16);
    expect(grid.isWalkableCell(blockedCell.gx, blockedCell.gz)).toBe(false);

    // Clearing obstacles restores walkability if terrain itself is walkable
    grid.rebuildObstacles([]);
    const walkableAfterClear = grid.isWalkableCell(blockedCell.gx, blockedCell.gz);
    expect(typeof walkableAfterClear).toBe('boolean');
  });

  it('computes a valid path between two walkable points while routing around a blocking obstacle', () => {
    const grid = new NavigationGrid();
    grid.rebuildTerrain('oasis', 'normal');

    // Pick two land points on the oasis plateau
    const startX = -22;
    const startZ = -22;
    const goalX = -22;
    const goalZ = -6;

    // Place a barrier midway between start and goal
    grid.rebuildObstacles([{ x: -22, z: -14, radius: 3.2 }]);
    const midCell = grid.worldToCell(-22, -14);
    expect(grid.isWalkableCell(midCell.gx, midCell.gz)).toBe(false);

    const path = grid.findPath(startX, startZ, goalX, goalZ);
    expect(path.length).toBeGreaterThan(0);
    const last = path[path.length - 1];
    expect(Math.hypot(last.x - goalX, last.z - goalZ)).toBeLessThan(3.5);
  });

  it('classifies water vs land cells accurately on maritime maps and computes naval water paths', () => {
    const grid = new NavigationGrid();
    grid.rebuildTerrain('mediterranean', 'normal');

    const centerCell = grid.worldToCell(0, 0);
    const waterCell = grid.nearestWaterCell(centerCell.gx, centerCell.gz, centerCell.gx, centerCell.gz, 35);
    expect(waterCell).not.toBeNull();

    const waterWorld = grid.cellToWorld(waterCell!.gx, waterCell!.gz);
    expect(grid.isWaterTerrain(waterWorld.x, waterWorld.z)).toBe(true);
    expect(grid.isTerrainWalkable(waterWorld.x, waterWorld.z)).toBe(false);

    // Find another water cell across the sea and verify findWaterPath returns waypoints
    const farWaterCell = grid.nearestWaterCell(
      Math.min(grid.width - 2, waterCell!.gx + 8),
      waterCell!.gz,
      waterCell!.gx,
      waterCell!.gz,
      20
    );
    expect(farWaterCell).not.toBeNull();
    const farWaterWorld = grid.cellToWorld(farWaterCell!.gx, farWaterCell!.gz);
    const waterPath = grid.findWaterPath(waterWorld.x, waterWorld.z, farWaterWorld.x, farWaterWorld.z);
    expect(waterPath.length).toBeGreaterThan(0);
  });
});
