import { useEffect, useMemo, useRef, useState } from 'react';
import { Castle, Crosshair, Eye, Maximize2, Minimize2, Swords, Trees } from 'lucide-react';
import { getWorldSizeSpec, groundHeightAt } from '../game/models';
import { getActiveTotalWarState, getActiveUnknownState, getEffectiveMapConfig, getMapBiomeVisuals, resolveEffectiveMapId } from '../textura/maps';
import { MapId, MinimapBlip, PANTHEONS, PantheonId, WorldSizeId } from '../game/types';

export type MinimapFilterMode = 'all' | 'combat' | 'economy';

interface MinimapProps {
  blips: MinimapBlip[];
  pantheon: PantheonId;
  mapId: MapId;
  worldSize?: WorldSizeId;
  revealedMap?: boolean;
  fogGrid?: number[];
  fogGridSize?: number;
  cameraTarget: { x: number; z: number };
  cameraYaw: number;
  cameraDistance?: number;
  onJumpCamera: (worldX: number, worldZ: number) => void;
  onMoveOrder: (worldX: number, worldZ: number) => void;
  onFocusTownCenter?: () => void;
}

interface MinimapPing {
  wx: number;
  wz: number;
  color: string;
  createdAt: number;
}

const CANVAS_SIZE = 280; // Crisp 2x HiDPI internal canvas resolution

function hexToRgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function createTerrainBackdrop(mapId: MapId, worldSize: WorldSizeId = 'normal'): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = CANVAS_SIZE;
  off.height = CANVAS_SIZE;
  const ctx = off.getContext('2d');
  if (!ctx) return off;

  const sizeSpec = getWorldSizeSpec(worldSize);
  const mapHalfSize = sizeSpec.mapHalfSize;
  const playableHalfSize = sizeSpec.playableHalfSize;
  const worldScale = sizeSpec.worldScale;

  const img = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
  const data = img.data;

  const cfg = getEffectiveMapConfig(mapId);
  const bio = getMapBiomeVisuals(mapId);
  const eff = resolveEffectiveMapId(mapId);

  const [wr, wg, wb] = hexToRgb(cfg.waterColorHex);
  const [br, bg, bb] = hexToRgb(bio.terrainPalette[0]);
  const [rr, rg, rb] = hexToRgb(bio.terrainPalette[1]);
  const [sr, sg, sb] = hexToRgb(bio.terrainPalette[2]);
  const [hr, hg, hb] = hexToRgb(bio.terrainPalette[3]);
  const [fr, fg, fb] = hexToRgb(bio.fertileHex);

  for (let py = 0; py < CANVAS_SIZE; py++) {
    const wz = ((py / CANVAS_SIZE) * 2 - 1) * mapHalfSize;
    for (let px = 0; px < CANVAS_SIZE; px++) {
      const wx = ((px / CANVAS_SIZE) * 2 - 1) * mapHalfSize;
      const h = groundHeightAt(wx, wz, mapId, worldSize);

      let r = wr;
      let g = wg;
      let b = wb;

      if (h < -0.34) {
        const depth = Math.min(1, Math.max(0, (-h - 0.34) / 2.2));
        r = Math.round(wr * (1 - depth * 0.35));
        g = Math.round(wg * (1 - depth * 0.35));
        b = Math.round(wb * (1 - depth * 0.3));
      } else if (h < 0.08) {
        // Walkable shallow reefs / fords / wet banks
        r = Math.round(sr * 0.65 + wr * 0.35);
        g = Math.round(sg * 0.65 + wg * 0.35);
        b = Math.round(sb * 0.65 + wb * 0.35);
      } else if (h < 0.22) {
        r = sr;
        g = sg;
        b = sb;
      } else {
        const diagDist = Math.abs(wx + wz) / Math.SQRT2;
        const onRoad = diagDist < 4.5 * worldScale && Math.hypot(wx, wz) < 50 * worldScale;
        const hillShade = Math.max(-20, Math.min(28, (h - 0.5) * 16));

        if (onRoad) {
          r = rr + hillShade * 0.55;
          g = rg + hillShade * 0.55;
          b = rb + hillShade * 0.55;
        } else if (h > 1.35) {
          r = hr + hillShade * 0.75;
          g = hg + hillShade * 0.75;
          b = hb + hillShade * 0.7;
        } else if (
          ((eff === 'nile' || eff === 'yellow_river' || eff === 'highland') && Math.abs(wx - wz) / Math.SQRT2 < 10.5 * worldScale) ||
          (eff === 'oasis' && Math.hypot(wx, wz) < 17 * worldScale)
        ) {
          r = fr + hillShade * 0.8;
          g = fg + hillShade * 0.9;
          b = fb + hillShade * 0.6;
        } else {
          r = br + hillShade * 0.85;
          g = bg + hillShade * 0.95;
          b = bb + hillShade * 0.75;
        }
      }

      const idx = (py * CANVAS_SIZE + px) * 4;
      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);

  const pad = ((mapHalfSize - playableHalfSize) / (mapHalfSize * 2)) * CANVAS_SIZE;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.32)';
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, CANVAS_SIZE - pad * 2, CANVAS_SIZE - pad * 2);

  return off;
}

export function Minimap({
  blips,
  pantheon,
  mapId,
  worldSize = 'normal',
  revealedMap = false,
  fogGrid,
  fogGridSize = 32,
  cameraTarget,
  cameraYaw,
  cameraDistance = 36,
  onJumpCamera,
  onMoveOrder,
  onFocusTownCenter,
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filterMode, setFilterMode] = useState<MinimapFilterMode>('all');
  const [expanded, setExpanded] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<string | null>(null);
  const [pings, setPings] = useState<MinimapPing[]>([]);

  const sizeSpec = getWorldSizeSpec(worldSize);
  const mapHalfSize = sizeSpec.mapHalfSize;
  const unknownSeed = getActiveUnknownState(mapId)?.seed ?? 0;
  const totalWarSeed = mapId === 'total_war' ? getActiveTotalWarState().seed : 0;
  const terrainBackdrop = useMemo(() => createTerrainBackdrop(mapId, worldSize), [mapId, worldSize, unknownSeed, totalWarSeed]);
  const playerColor = PANTHEONS[pantheon].primaryColor;

  // Summarize allied buildings, allied units, and revealed enemies (buildings + units)
  const { playerBuildings, playerUnits, revealedEnemies } = useMemo(() => {
    let pBuildings = 0;
    let pUnits = 0;
    let eTotal = 0;
    for (const b of blips) {
      if (b.category === 'building') {
        if (b.team === 'player') pBuildings++;
        else if (b.team === 'enemy') eTotal++;
      } else if (b.category === 'unit') {
        if (b.team === 'player') pUnits++;
        else if (b.team === 'enemy') eTotal++;
      }
    }
    return { playerBuildings: pBuildings, playerUnits: pUnits, revealedEnemies: eTotal };
  }, [blips]);

  // Clean up expired visual pings
  useEffect(() => {
    if (pings.length === 0) return;
    const timer = window.setInterval(() => {
      const now = performance.now();
      setPings((prev) => prev.filter((p) => now - p.createdAt < 750));
    }, 50);
    return () => window.clearInterval(timer);
  }, [pings.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(terrainBackdrop, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const toMini = (wx: number, wz: number) => ({
      mx: ((wx + mapHalfSize) / (mapHalfSize * 2)) * CANVAS_SIZE,
      my: ((wz + mapHalfSize) / (mapHalfSize * 2)) * CANVAS_SIZE,
    });

    const showEconomy = filterMode === 'all' || filterMode === 'economy';
    const showCombat = filterMode === 'all' || filterMode === 'combat';

    // 1. Explored Resource Nodes
    if (showEconomy) {
      for (const blip of blips) {
        if (blip.category !== 'node') continue;
        const { mx, my } = toMini(blip.x, blip.z);
        ctx.fillStyle = blip.color;
        ctx.beginPath();
        ctx.arc(mx, my, blip.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Neutral Settlements (gold diamond outline) & Relics (cyan/gold star)
    for (const blip of blips) {
      if (blip.category === 'settlement') {
        const { mx, my } = toMini(blip.x, blip.z);
        const r = blip.size + 1;
        ctx.strokeStyle = blip.selected ? '#ffffff' : '#fbbf24';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, my - r);
        ctx.lineTo(mx + r, my);
        ctx.lineTo(mx, my + r);
        ctx.lineTo(mx - r, my);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (blip.category === 'relic') {
        const { mx, my } = toMini(blip.x, blip.z);
        const r = blip.size;
        ctx.fillStyle = '#22d3ee';
        ctx.strokeStyle = blip.selected ? '#ffffff' : '#facc15';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(mx, my - r);
        ctx.lineTo(mx + r, my);
        ctx.lineTo(mx, my + r);
        ctx.lineTo(mx - r, my);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 3. Fog of War Canvas Overlay (covers unexplored smoke & dimmed explored mist)
    if (!revealedMap && fogGrid && fogGrid.length >= fogGridSize * fogGridSize) {
      let fogOff = fogCanvasRef.current;
      if (!fogOff || fogOff.width !== fogGridSize || fogOff.height !== fogGridSize) {
        fogOff = document.createElement('canvas');
        fogOff.width = fogGridSize;
        fogOff.height = fogGridSize;
        fogCanvasRef.current = fogOff;
      }
      const fctx = fogOff.getContext('2d');
      if (fctx) {
        const img = fctx.createImageData(fogGridSize, fogGridSize);
        const d = img.data;
        for (let i = 0; i < fogGridSize * fogGridSize; i++) {
          const v = fogGrid[i];
          const off = i * 4;
          d[off] = 6;
          d[off + 1] = 9;
          d[off + 2] = 16;
          d[off + 3] = v === 2 ? 0 : v === 1 ? 132 : 242;
        }
        fctx.putImageData(img, 0, 0);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(fogOff, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.restore();
      }
    }

    // 4. Allied & Revealed Enemy Buildings (drawn above fog so revealed enemy bases & player structures stand out clearly)
    for (const blip of blips) {
      if (blip.category !== 'building') continue;
      if (filterMode === 'combat' && blip.team === 'player' && !blip.isMajor) continue;
      const { mx, my } = toMini(blip.x, blip.z);
      const s = blip.size * 2.1;

      ctx.save();
      if (blip.isConstructed === false) {
        ctx.globalAlpha = 0.72;
      }
      ctx.fillStyle = blip.team === 'player' ? playerColor : '#dc2626';
      ctx.strokeStyle = blip.selected ? '#facc15' : blip.team === 'player' ? '#e2e8f0' : '#fca5a5';
      ctx.lineWidth = blip.selected ? 2.6 : 1.4;
      ctx.fillRect(mx - s / 2, my - s / 2, s, s);
      ctx.strokeRect(mx - s / 2, my - s / 2, s, s);

      // Major buildings (Town Center, Fortress, Titan Gate) get an inner crown dot
      if (blip.isMajor) {
        ctx.fillStyle = blip.team === 'player' ? '#facc15' : '#fef08a';
        ctx.fillRect(mx - 2.5, my - 2.5, 5, 5);
      }
      ctx.restore();
    }

    // 5. Visible Fauna
    if (showEconomy) {
      for (const blip of blips) {
        if (blip.category !== 'fauna') continue;
        const { mx, my } = toMini(blip.x, blip.z);
        ctx.fillStyle = blip.selected ? '#ffffff' : blip.color;
        ctx.beginPath();
        ctx.arc(mx, my, blip.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Allied Units & Revealed Enemy Units
    if (showCombat) {
      for (const blip of blips) {
        if (blip.category !== 'unit') continue;
        const { mx, my } = toMini(blip.x, blip.z);

        if (blip.team === 'player') {
          if (blip.selected) {
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(mx, my, blip.size + 2.4, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = blip.isTitan ? '#a855f7' : blip.isHero ? '#facc15' : '#60a5fa';
          ctx.strokeStyle = '#0b0e13';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(mx, my, blip.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          // Revealed Enemy Unit (crimson diamond)
          const r = blip.size + 1.0;
          ctx.fillStyle = blip.isTitan ? '#f43f5e' : '#ef4444';
          ctx.strokeStyle = '#fef2f2';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mx, my - r);
          ctx.lineTo(mx + r, my);
          ctx.lineTo(mx, my + r);
          ctx.lineTo(mx - r, my);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // 7. Interactive Click / Order Pings
    const now = performance.now();
    for (const p of pings) {
      const age = Math.min(1, (now - p.createdAt) / 750);
      const { mx, my } = toMini(p.wx, p.wz);
      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.2 * (1 - age * 0.5);
      ctx.globalAlpha = 1 - age;
      ctx.beginPath();
      ctx.arc(mx, my, 4 + age * 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Camera Viewport Frustum Reticle + Center Crosshair
    const cam = toMini(cameraTarget.x, cameraTarget.z);
    const zoomScale = Math.max(0.4, Math.min(2.1, (cameraDistance / 36) / sizeSpec.worldScale));
    ctx.save();
    ctx.translate(cam.mx, cam.my);
    ctx.rotate(-cameraYaw);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-22 * zoomScale, -16 * zoomScale);
    ctx.lineTo(22 * zoomScale, -16 * zoomScale);
    ctx.lineTo(15 * zoomScale, 16 * zoomScale);
    ctx.lineTo(-15 * zoomScale, 16 * zoomScale);
    ctx.closePath();
    ctx.stroke();

    // Subtle center focus dot inside camera frustum
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [
    blips,
    cameraTarget,
    cameraYaw,
    cameraDistance,
    terrainBackdrop,
    playerColor,
    revealedMap,
    fogGrid,
    fogGridSize,
    filterMode,
    pings,
    mapHalfSize,
    sizeSpec.worldScale,
  ]);

  const toWorldCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // Invert the CSS +45deg diamond rotation back into local canvas space
    const lx = (dx + dy) * Math.SQRT1_2;
    const ly = (-dx + dy) * Math.SQRT1_2;
    const side = el.offsetWidth || rect.width / Math.SQRT2;
    const nx = Math.max(0, Math.min(1, lx / side + 0.5));
    const nz = Math.max(0, Math.min(1, ly / side + 0.5));
    return {
      wx: (nx * 2 - 1) * mapHalfSize,
      wz: (nz * 2 - 1) * mapHalfSize,
    };
  };

  const findHoveredBlip = (wx: number, wz: number): MinimapBlip | null => {
    let closest: MinimapBlip | null = null;
    let bestDist = 7.5 * sizeSpec.worldScale; // world-unit hover radius
    for (const b of blips) {
      if (b.category === 'node' && filterMode === 'combat') continue;
      if (b.category === 'unit' && filterMode === 'economy') continue;
      const d = Math.hypot(b.x - wx, b.z - wz);
      if (d < bestDist) {
        bestDist = d;
        closest = b;
      }
    }
    return closest;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const { wx, wz } = toWorldCoords(e);

    if (e.button === 2) {
      e.preventDefault();
      setPings((prev) => [...prev.slice(-4), { wx, wz, color: '#4ade80', createdAt: performance.now() }]);
      onMoveOrder(wx, wz);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setPings((prev) => [...prev.slice(-4), { wx, wz, color: '#facc15', createdAt: performance.now() }]);
    onJumpCamera(wx, wz);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { wx, wz } = toWorldCoords(e);
    if (isDragging) {
      onJumpCamera(wx, wz);
    }
    const hit = findHoveredBlip(wx, wz);
    if (hit?.label) {
      setHoverInfo(hit.label);
    } else {
      setHoverInfo(`(${Math.round(wx)}, ${Math.round(wz)})`);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const handlePointerLeave = () => {
    setHoverInfo(null);
  };

  const wrapperSizeClass = expanded
    ? 'h-[172px] w-[176px] sm:h-[208px] sm:w-[212px]'
    : 'h-[112px] w-[116px] sm:h-[140px] sm:w-[144px] lg:h-[154px] lg:w-[158px]';
  const diamondSizeClass = expanded
    ? 'h-[120px] w-[120px] sm:h-[144px] sm:w-[144px]'
    : 'h-[78px] w-[78px] sm:h-[96px] sm:w-[96px] lg:h-[106px] lg:w-[106px]';

  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${wrapperSizeClass}`}>
      {/* Floating Hover Tooltip above Minimap */}
      {hoverInfo && (
        <div className="pointer-events-none absolute -top-7 right-1 z-30 flex items-center gap-1 rounded border border-[#c8a962]/65 bg-[#0e121a]/95 px-2 py-0.5 text-[10px] font-semibold text-[#f3d27a] shadow-lg whitespace-nowrap">
          <Crosshair className="h-3 w-3 text-[#facc15]" />
          <span>{hoverInfo}</span>
        </div>
      )}

      {/* AoM: The Titans 45-degree Diamond Map Frame */}
      <div className="relative flex items-center justify-center">
        <div
          className={`${diamondSizeClass} rotate-45 overflow-hidden rounded-[4px] border-2 border-[#c8a962]/85 bg-[#0b1018] shadow-[0_0_18px_rgba(0,0,0,0.88)] ring-1 ring-black/70 transition-[width,height] duration-150`}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onContextMenu={(e) => e.preventDefault()}
            title="Clique esquerdo ou arraste para mover a câmera · Clique direito para enviar tropas"
            className="h-full w-full touch-none cursor-crosshair block"
          />
        </div>
      </div>

      {/* Top-Left Corner: Compact Ally / Enemy Entity Tally */}
      <div
        className="pointer-events-none absolute top-0.5 left-0.5 flex flex-col gap-0.5 text-[9px] text-[#cbd5e1]"
        title="Resumo tático no mapa"
      >
        <span className="flex items-center gap-1 font-mono-num">
          <span className="inline-block h-1.5 w-1.5 bg-[#60a5fa]" />
          <span>{playerBuildings + playerUnits}</span>
        </span>
        {revealedEnemies > 0 && (
          <span className="flex items-center gap-1 font-mono-num text-rose-300">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-[#ef4444]" />
            <span>{revealedEnemies}</span>
          </span>
        )}
      </div>

      {/* Top-Right Corner Circular Button: Expand / Shrink */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        title={expanded ? 'Reduzir Minimapa' : 'Expandir Minimapa'}
        aria-label="Alternar tamanho do minimapa"
        className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#c8a962]/70 bg-[#181d27] text-[#e5c45e] shadow hover:border-[#f3d27a] hover:bg-[#232b3a] cursor-pointer"
      >
        {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
      </button>

      {/* Bottom-Left Corner Circular Buttons (AoM Style): Focus TC + All Filter */}
      <div className="absolute bottom-0.5 left-0.5 flex items-center gap-1">
        {onFocusTownCenter && (
          <button
            type="button"
            onClick={onFocusTownCenter}
            title="Focar Centro da Cidade"
            aria-label="Focar Centro da Cidade"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#c8a962]/75 bg-[#181d27] text-[#f3d27a] shadow hover:border-[#f5d77f] hover:bg-[#242c3d] cursor-pointer"
          >
            <Castle className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          title="Mostrar tudo no minimapa"
          aria-label="Mostrar tudo no minimapa"
          className={`flex h-6 w-6 items-center justify-center rounded-full border shadow transition-colors cursor-pointer ${
            filterMode === 'all'
              ? 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13]'
              : 'border-[#c8a962]/50 bg-[#181d27] text-[#cbd5e1] hover:bg-[#242c3d]'
          }`}
        >
          <Eye className="h-3 w-3" />
        </button>
      </div>

      {/* Bottom-Right Corner Circular Buttons (AoM Style): Combat + Economy Filters */}
      <div className="absolute bottom-0.5 right-0.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setFilterMode('combat')}
          title="Filtrar Combate no minimapa"
          aria-label="Filtrar combate no minimapa"
          className={`flex h-6 w-6 items-center justify-center rounded-full border shadow transition-colors cursor-pointer ${
            filterMode === 'combat'
              ? 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13]'
              : 'border-[#c8a962]/50 bg-[#181d27] text-[#cbd5e1] hover:bg-[#242c3d]'
          }`}
        >
          <Swords className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('economy')}
          title="Filtrar Recursos no minimapa"
          aria-label="Filtrar recursos no minimapa"
          className={`flex h-6 w-6 items-center justify-center rounded-full border shadow transition-colors cursor-pointer ${
            filterMode === 'economy'
              ? 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13]'
              : 'border-[#c8a962]/50 bg-[#181d27] text-[#cbd5e1] hover:bg-[#242c3d]'
          }`}
        >
          <Trees className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
