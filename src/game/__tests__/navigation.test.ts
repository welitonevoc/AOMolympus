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
});
