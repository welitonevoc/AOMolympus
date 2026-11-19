import * as THREE from 'three';
import type {
  EditorForestStyle,
  EditorToolId,
  PlacedScenarioObject,
  ScenarioDocument,
} from '../../maps';

export interface EditorSnapshot {
  heightGrid: number[];
  terrainGrid: number[];
  objects: PlacedScenarioObject[];
}

export interface TerrainClipboard {
  cols: number;
  rows: number;
  heights: number[];
  terrains: number[];
}

export type TopMenuId = 'map' | 'edit' | 'scenario' | 'world' | 'terrain' | 'objects' | null;

export const EDITOR_COMMANDS_LIST: {
  tool: EditorToolId;
  label: string;
  enName: string;
  presetForest?: EditorForestStyle;
}[] = [
  { tool: 'elevate', label: 'Alterar Elevação', enName: 'Change elevation' },
  { tool: 'elevate_sample', label: 'Elevação por Amostra', enName: 'Change elevation by sample' },
  { tool: 'smooth', label: 'Suavizar Terreno', enName: 'Smooth' },
  { tool: 'select_move', label: 'Mover Unidade / Objeto', enName: 'Move unit' },
  { tool: 'roughen', label: 'Tornar Áspero', enName: 'Roughen' },
  { tool: 'paint_terrain', label: 'Modificar Terreno', enName: 'Modify terrain' },
  { tool: 'paint_land', label: 'Pintar Terra', enName: 'Paint' },
  { tool: 'paint_forest', label: 'Pintar Floresta de Pinheiros', enName: 'Paint Pine Forest', presetForest: 'nordic_pine' },
  { tool: 'elevate_circular', label: 'Elevação Circular', enName: 'Change elevation circular' },
  { tool: 'paint_water', label: 'Pintar Água', enName: 'Paint Water' },
  { tool: 'edit_water_beautify', label: 'Editar / Embelezar Água', enName: 'Edit Water' },
  { tool: 'paint_cliff', label: 'Pintar Penhasco', enName: 'Paint Cliff' },
];

export const TERRAIN_CODE_COLORS: Record<number, THREE.Color> = {
  0: new THREE.Color(0x165e82),
  1: new THREE.Color(0x587a43),
  2: new THREE.Color(0x8c7758),
  3: new THREE.Color(0xc9ae74),
  4: new THREE.Color(0x746e68),
  5: new THREE.Color(0x3f7b3e),
  6: new THREE.Color(0xdbe5ef),
  7: new THREE.Color(0x3b522c),
  8: new THREE.Color(0x3ea4b3),
  9: new THREE.Color(0xd94814),
  10: new THREE.Color(0x4a4447),
  11: new THREE.Color(0xe6dfd0),
};

export function makeSkyGradientTexture(topHex: string, horizonHex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, topHex);
    grad.addColorStop(0.62, horizonHex);
    grad.addColorStop(1, '#10141c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function sampleGridHeight(doc: ScenarioDocument, wx: number, wz: number): number {
  const gs = doc.gridSize;
  const halfW = doc.widthMeters / 2;
  const halfD = doc.depthMeters / 2;
  const u = Math.max(0, Math.min(1, (wx + halfW) / Math.max(1, doc.widthMeters)));
  const v = Math.max(0, Math.min(1, (wz + halfD) / Math.max(1, doc.depthMeters)));
  const fx = u * (gs - 1);
  const fz = v * (gs - 1);
  const x0 = Math.floor(fx);
  const z0 = Math.floor(fz);
  const x1 = Math.min(gs - 1, x0 + 1);
  const z1 = Math.min(gs - 1, z0 + 1);
  const tx = fx - x0;
  const tz = fz - z0;
  const h00 = doc.heightGrid[z0 * gs + x0] ?? 0.35;
  const h10 = doc.heightGrid[z0 * gs + x1] ?? 0.35;
  const h01 = doc.heightGrid[z1 * gs + x0] ?? 0.35;
  const h11 = doc.heightGrid[z1 * gs + x1] ?? 0.35;
  const hx0 = h00 + (h10 - h00) * tx;
  const hx1 = h01 + (h11 - h01) * tx;
  return hx0 + (hx1 - hx0) * tz + doc.globalElevationOffset;
}
