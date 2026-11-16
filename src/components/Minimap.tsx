import { useEffect, useMemo, useRef, useState } from 'react';
import { Castle, Crosshair, Eye, Maximize2, Minimize2, Swords, Trees } from 'lucide-react';
import { groundHeightAt, MAP_HALF_SIZE, PLAYABLE_HALF_SIZE } from '../game/models';
import { MapId, MAPS, MinimapBlip, PANTHEONS, PantheonId } from '../game/types';

export type MinimapFilterMode = 'all' | 'combat' | 'economy';

interface MinimapProps {
  blips: MinimapBlip[];
  pantheon: PantheonId;
  mapId: MapId;
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

function createTerrainBackdrop(mapId: MapId): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = CANVAS_SIZE;
  off.height = CANVAS_SIZE;
  const ctx = off.getContext('2d');
  if (!ctx) return off;

  const img = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
  const data = img.data;

  const [wr, wg, wb] = hexToRgb(MAPS[mapId].waterColorHex);

  for (let py = 0; py < CANVAS_SIZE; py++) {
    const wz = ((py / CANVAS_SIZE) * 2 - 1) * MAP_HALF_SIZE;
    for (let px = 0; px < CANVAS_SIZE; px++) {
      const wx = ((px / CANVAS_SIZE) * 2 - 1) * MAP_HALF_SIZE;
      const h = groundHeightAt(wx, wz, mapId);

      let r = wr;
      let g = wg;
      let b = wb;

      if (h < -0.15) {
        const depth = Math.min(1, Math.max(0, (-h - 0.15) / 2.2));
        r = Math.round(wr * (1 - depth * 0.35));
        g = Math.round(wg * (1 - depth * 0.35));
        b = Math.round(wb * (1 - depth * 0.3));
      } else if (h < 0.22) {
        if (mapId === 'alfheim' || mapId === 'ghost_lake') {
          r = 148;
          g = 163;
          b = 184;
        } else if (mapId === 'erebus') {
          r = 72;
          g = 38;
          b = 34;
        } else if (mapId === 'jotunheim') {
          r = 165;
          g = 180;
          b = 200;
        } else {
          r = 178;
          g = 156;
          b = 112;
        }
      } else {
        const diagDist = Math.abs(wx + wz) / Math.SQRT2;
        const onRoad = diagDist < 4.5 && Math.hypot(wx, wz) < 50;
        const hillShade = Math.max(-20, Math.min(28, (h - 0.5) * 16));

        if (mapId === 'alfheim' || mapId === 'ghost_lake' || mapId === 'jotunheim') {
          if (onRoad) {
            r = 120 + hillShade * 0.5;
            g = 116 + hillShade * 0.5;
            b = 110 + hillShade * 0.5;
          } else if (h > 1.25) {
            r = 195 + hillShade * 0.8;
            g = 212 + hillShade * 0.8;
            b = 228 + hillShade * 0.7;
          } else {
            r = 96 + hillShade;
            g = 122 + hillShade;
            b = 118 + hillShade;
          }
        } else if (mapId === 'nile' || mapId === 'oasis') {
          const nearWater = mapId === 'oasis' ? Math.hypot(wx, wz) < 18 : Math.abs(wx - wz) / Math.SQRT2 < 10.5;
          if (nearWater) {
            r = 88 + hillShade * 0.8;
            g = 124 + hillShade;
            b = 58 + hillShade * 0.6;
          } else if (onRoad) {
            r = 164 + hillShade * 0.6;
            g = 136 + hillShade * 0.6;
            b = 88 + hillShade * 0.5;
          } else {
            r = 194 + hillShade * 0.7;
            g = 166 + hillShade * 0.7;
            b = 112 + hillShade * 0.5;
          }
        } else if (mapId === 'erebus') {
          if (onRoad) {
            r = 90 + hillShade * 0.6;
            g = 62 + hillShade * 0.5;
            b = 58 + hillShade * 0.5;
          } else {
            r = 70 + hillShade * 0.7;
            g = 52 + hillShade * 0.6;
            b = 54 + hillShade * 0.6;
          }
        } else if (mapId === 'yucatan') {
          if (onRoad) {
            r = 122 + hillShade * 0.5;
            g = 112 + hillShade * 0.5;
            b = 84 + hillShade * 0.4;
          } else {
            r = 46 + hillShade;
            g = 94 + hillShade * 1.1;
            b = 44 + hillShade * 0.6;
          }
        } else if (mapId === 'yellow_river') {
          if (onRoad) {
            r = 148 + hillShade * 0.6;
            g = 132 + hillShade * 0.6;
            b = 94 + hillShade * 0.5;
          } else {
            r = 116 + hillShade;
            g = 128 + hillShade;
            b = 72 + hillShade * 0.6;
          }
        } else if (mapId === 'acropolis') {
          if (onRoad) {
            r = 154 + hillShade * 0.6;
            g = 148 + hillShade * 0.6;
            b = 134 + hillShade * 0.6;
          } else if (h > 1.7) {
            r = 128 + hillShade * 0.6;
            g = 124 + hillShade * 0.6;
            b = 114 + hillShade * 0.6;
          } else {
            r = 76 + hillShade;
            g = 104 + hillShade;
            b = 60 + hillShade * 0.7;
          }
        } else {
          if (onRoad) {
            r = 128 + hillShade * 0.6;
            g = 115 + hillShade * 0.6;
            b = 84 + hillShade * 0.5;
          } else {
            r = 56 + hillShade;
            g = 88 + hillShade * 1.1;
            b = 48 + hillShade * 0.7;
          }
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

  const pad = ((MAP_HALF_SIZE - PLAYABLE_HALF_SIZE) / (MAP_HALF_SIZE * 2)) * CANVAS_SIZE;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.32)';
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, CANVAS_SIZE - pad * 2, CANVAS_SIZE - pad * 2);

  return off;
}

export function Minimap({
  blips,
  pantheon,
  mapId,
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

  const terrainBackdrop = useMemo(() => createTerrainBackdrop(mapId), [mapId]);
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
      mx: ((wx + MAP_HALF_SIZE) / (MAP_HALF_SIZE * 2)) * CANVAS_SIZE,
      my: ((wz + MAP_HALF_SIZE) / (MAP_HALF_SIZE * 2)) * CANVAS_SIZE,
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
    const zoomScale = Math.max(0.45, Math.min(2.1, cameraDistance / 36));
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
  ]);

  const toWorldCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const nz = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return {
      wx: (nx * 2 - 1) * MAP_HALF_SIZE,
      wz: (nz * 2 - 1) * MAP_HALF_SIZE,
    };
  };

  const findHoveredBlip = (wx: number, wz: number): MinimapBlip | null => {
    let closest: MinimapBlip | null = null;
    let bestDist = 7.5; // world-unit hover radius
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
      setHoverInfo(`Mover Câmera (${Math.round(wx)}, ${Math.round(wz)})`);
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

  const displaySizeClass = expanded ? 'h-[204px] w-[204px]' : 'h-[138px] w-[138px]';

  return (
    <div className="relative flex items-stretch gap-1.5 shrink-0 select-none">
      {/* Floating Hover Tooltip above Minimap */}
      {hoverInfo && (
        <div className="pointer-events-none absolute -top-7 right-0 z-30 flex items-center gap-1.5 rounded border border-[#d4af37]/60 bg-[#0d111a]/95 px-2 py-0.5 text-[10px] font-semibold text-[#f3d27a] shadow-lg whitespace-nowrap">
          <Crosshair className="h-3 w-3 text-[#facc15]" />
          <span>{hoverInfo}</span>
        </div>
      )}

      {/* AoM: The Titans Side Filter, Town Center & Expand Strip */}
      <div className="flex flex-col justify-between gap-1 py-0.5">
        {onFocusTownCenter && (
          <button
            type="button"
            onClick={onFocusTownCenter}
            title="Focar próximo Centro da Cidade (Espaço / H)"
            aria-label="Focar Centro da Cidade"
            className="flex h-7 w-7 items-center justify-center rounded border border-[#d4af37]/40 bg-[#171c26] text-[#f3d27a] hover:border-[#f3d27a] hover:bg-[#222a38] cursor-pointer"
          >
            <Castle className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          title="Filtro Padrão: exibir Edifícios, Unidades Aliadas, Inimigos e Recursos"
          aria-label="Mostrar tudo no minimapa"
          className={`flex h-7 w-7 items-center justify-center rounded border transition-colors cursor-pointer ${
            filterMode === 'all'
              ? 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13]'
              : 'border-white/15 bg-[#171c26] text-[#cbd5e1] hover:bg-[#222938]'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('combat')}
          title="Filtro Militar: destacar Unidades Aliadas, Inimigos Revelados e Fortificações"
          aria-label="Filtrar combate no minimapa"
          className={`flex h-7 w-7 items-center justify-center rounded border transition-colors cursor-pointer ${
            filterMode === 'combat'
              ? 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13]'
              : 'border-white/15 bg-[#171c26] text-[#cbd5e1] hover:bg-[#222938]'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('economy')}
          title="Filtro Econômico: destacar Minas de Ouro, Bosques e Fauna"
          aria-label="Filtrar recursos no minimapa"
          className={`flex h-7 w-7 items-center justify-center rounded border transition-colors cursor-pointer ${
            filterMode === 'economy'
              ? 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13]'
              : 'border-white/15 bg-[#171c26] text-[#cbd5e1] hover:bg-[#222938]'
          }`}
        >
          <Trees className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? 'Reduzir tamanho do Minimapa' : 'Expandir Minimapa Tático'}
          aria-label="Alternar tamanho do minimapa"
          className="flex h-7 w-7 items-center justify-center rounded border border-white/15 bg-[#171c26] text-[#e5c45e] hover:border-[#f3d27a] hover:bg-[#222938] cursor-pointer"
        >
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Minimap Canvas + Tactical Entity Legend (Buildings, Allies, Revealed Enemies) */}
      <div className="flex flex-col gap-1">
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
          className={`${displaySizeClass} touch-none cursor-crosshair rounded border-2 border-[#d4af37]/65 bg-[#0b1018] shadow-[0_0_16px_rgba(0,0,0,0.85)] transition-[width,height] duration-150`}
        />
        <div className="flex items-center justify-between gap-2 px-0.5 text-[10px] text-[#cbd5e1]">
          <span
            className="flex items-center gap-1 whitespace-nowrap"
            title="Edifícios Aliados"
          >
            <span className="inline-block h-2 w-2 border border-white/70 bg-[#3b82f6]" />
            <span className="font-mono-num font-semibold">{playerBuildings}</span>
          </span>
          <span
            className="flex items-center gap-1 whitespace-nowrap"
            title="Unidades Aliadas"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#60a5fa]" />
            <span className="font-mono-num font-semibold">{playerUnits}</span>
          </span>
          <span
            className="flex items-center gap-1 whitespace-nowrap"
            title="Inimigos Revelados (Unidades e Construções Visíveis)"
          >
            <span className="inline-block h-2 w-2 rotate-45 bg-[#ef4444]" />
            <span className="font-mono-num font-semibold text-rose-300">{revealedEnemies}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
