import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Download,
  FileCode2,
  Layers,
  Paintbrush,
  Play,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  Trash2,
  Undo2,
  Upload,
  Wrench,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import {
  DifficultyId,
  MapId,
  MatchStartOptions,
  PANTHEONS,
  PantheonId,
  WorldSizeId,
} from '../game/types';
import {
  compileRmsScript,
  RMS_SCRIPT_LIBRARY,
  RmsGeneratedMap,
  RmsTerrainCode,
  WORLD_SIZE_SPECS,
} from '../maps';
import { generateMythRMConstantsTxt } from '../textura/terreno';

interface RmsMapLabProps {
  defaultPantheon?: PantheonId;
  defaultDifficulty?: DifficultyId;
  gameSpeed?: number;
  onBack: () => void;
  onStartMatch: (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    extras?: MatchStartOptions
  ) => void;
}

type WorkbenchTab = 'xs' | 'xml' | 'audit';
type BrushToolId = 'raise' | 'water' | 'road' | 'gold' | 'forest' | 'settlement' | 'fauna' | 'relic';

interface VisualBrushStroke {
  tool: BrushToolId;
  u: number;
  v: number;
  radiusFrac: number;
}

const BRUSH_TOOLS: { id: BrushToolId; label: string; color: string; isObject: boolean }[] = [
  { id: 'raise', label: 'Elevar', color: '#a8a29e', isObject: false },
  { id: 'water', label: 'Água', color: '#38bdf8', isObject: false },
  { id: 'road', label: 'Estrada', color: '#d4af37', isObject: false },
  { id: 'forest', label: 'Bosque', color: '#22c55e', isObject: false },
  { id: 'gold', label: 'Ouro', color: '#facc15', isObject: true },
  { id: 'settlement', label: 'Assent.', color: '#e2e8f0', isObject: true },
  { id: 'fauna', label: 'Fauna', color: '#fb923c', isObject: true },
  { id: 'relic', label: 'Relíquia', color: '#c084fc', isObject: true },
];

const PREVIEW_RES = 512;

const BIOME_PALETTES: Record<
  RmsGeneratedMap['biome'],
  {
    water: [number, number, number];
    land: [number, number, number];
    road: [number, number, number];
    sand: [number, number, number];
    high: [number, number, number];
    fertile: [number, number, number];
    snow: [number, number, number];
    forest: [number, number, number];
  }
> = {
  temperate: {
    water: [20, 92, 128],
    land: [86, 120, 65],
    road: [162, 144, 106],
    sand: [206, 184, 134],
    high: [128, 132, 114],
    fertile: [74, 136, 58],
    snow: [226, 236, 245],
    forest: [44, 86, 46],
  },
  frozen: {
    water: [20, 62, 94],
    land: [152, 174, 194],
    road: [116, 128, 144],
    sand: [188, 204, 218],
    high: [224, 236, 246],
    fertile: [104, 138, 152],
    snow: [238, 245, 252],
    forest: [46, 82, 74],
  },
  desert: {
    water: [22, 126, 152],
    land: [208, 166, 98],
    road: [176, 132, 72],
    sand: [228, 194, 124],
    high: [168, 108, 56],
    fertile: [112, 146, 62],
    snow: [232, 224, 204],
    forest: [76, 114, 48],
  },
  savannah: {
    water: [34, 118, 132],
    land: [186, 144, 74],
    road: [156, 120, 62],
    sand: [216, 180, 112],
    high: [162, 106, 54],
    fertile: [118, 144, 56],
    snow: [228, 222, 200],
    forest: [88, 118, 42],
  },
  tropical: {
    water: [14, 122, 148],
    land: [66, 116, 58],
    road: [148, 132, 92],
    sand: [214, 194, 138],
    high: [96, 126, 76],
    fertile: [52, 132, 54],
    snow: [222, 234, 238],
    forest: [32, 82, 38],
  },
  volcanic: {
    water: [148, 34, 28],
    land: [68, 54, 52],
    road: [98, 84, 78],
    sand: [52, 44, 44],
    high: [108, 68, 54],
    fertile: [88, 54, 44],
    snow: [148, 142, 142],
    forest: [58, 42, 36],
  },
};

const PLAYER_COLORS = [
  '#38bdf8',
  '#f87171',
  '#4ade80',
  '#facc15',
  '#c084fc',
  '#fb923c',
  '#2dd4bf',
  '#f472b6',
  '#a3e635',
  '#818cf8',
  '#fbbf24',
  '#e2e8f0',
];

const TERRAIN_LABELS: Record<RmsTerrainCode, string> = {
  0: 'Água',
  1: 'Terra',
  2: 'Estrada / Ponte',
  3: 'Areia / Praia',
  4: 'Colina / Rocha',
  5: 'Vale Fértil',
  6: 'Neve / Gelo',
  7: 'Bosque',
};

const BIOME_LABELS: Record<RmsGeneratedMap['biome'], string> = {
  temperate: 'Temperado',
  frozen: 'Ártico / Gélido',
  desert: 'Deserto',
  savannah: 'Savana',
  tropical: 'Tropical',
  volcanic: 'Vulcânico',
};

export function RmsMapLab({
  defaultPantheon = 'greek',
  defaultDifficulty = 'normal',
  gameSpeed = 1,
  onBack,
  onStartMatch,
}: RmsMapLabProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(RMS_SCRIPT_LIBRARY[0].id);
  const [xsDraft, setXsDraft] = useState<string>(RMS_SCRIPT_LIBRARY[0].xsCode);
  const [xmlDraft, setXmlDraft] = useState<string>(RMS_SCRIPT_LIBRARY[0].xmlCode);
  const [committedXs, setCommittedXs] = useState<string>(RMS_SCRIPT_LIBRARY[0].xsCode);
  const [committedXml, setCommittedXml] = useState<string>(RMS_SCRIPT_LIBRARY[0].xmlCode);
  const [customTitle, setCustomTitle] = useState<string>(RMS_SCRIPT_LIBRARY[0].name);

  const [seed, setSeed] = useState<number>(42107);
  const [playerCount, setPlayerCount] = useState<number>(RMS_SCRIPT_LIBRARY[0].recommendedPlayers);
  const [worldSize, setWorldSize] = useState<WorldSizeId>('large');
  const [pantheon, setPantheon] = useState<PantheonId>(defaultPantheon);
  const [difficulty, setDifficulty] = useState<DifficultyId>(defaultDifficulty);

  const [activeTab, setActiveTab] = useState<WorkbenchTab>('xs');
  const [showAreas, setShowAreas] = useState<boolean>(true);
  const [showObjects, setShowObjects] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [brushMode, setBrushMode] = useState<boolean>(false);
  const [brushTool, setBrushTool] = useState<BrushToolId>('raise');
  const [brushRadius, setBrushRadius] = useState<number>(0.075);
  const [brushStrokes, setBrushStrokes] = useState<VisualBrushStroke[]>([]);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [hoverText, setHoverText] = useState<string>('Passe o cursor no mapa para inspecionar altitude, terreno e objetos.');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeTemplate = useMemo(
    () => RMS_SCRIPT_LIBRARY.find((t) => t.id === selectedTemplateId) ?? RMS_SCRIPT_LIBRARY[0],
    [selectedTemplateId]
  );

  const compiled = useMemo(
    () =>
      compileRmsScript({
        xsCode: committedXs,
        xmlCode: committedXml,
        seed,
        worldSize,
        playerCount,
        scriptId: selectedTemplateId,
        title: customTitle,
      }),
    [committedXs, committedXml, seed, worldSize, playerCount, selectedTemplateId, customTitle]
  );

  const { map, xmlMeta, syntaxError } = compiled;
  const hasUnappliedEdits = xsDraft !== committedXs || xmlDraft !== committedXml;

  const objectCounts = useMemo(() => {
    const counts = {
      settlement: 0,
      gold: 0,
      tree: 0,
      berry: 0,
      fauna: 0,
      fish: 0,
      relic: 0,
    };
    for (const o of map.objects) {
      if (o.category === 'settlement') counts.settlement++;
      else if (o.category === 'gold') counts.gold++;
      else if (o.category === 'tree') counts.tree++;
      else if (o.category === 'berry') counts.berry++;
      else if (o.category === 'fauna' || o.category === 'marine_decor') counts.fauna++;
      else if (o.category === 'fish') counts.fish++;
      else if (o.category === 'relic') counts.relic++;
    }
    return counts;
  }, [map.objects]);

  // Render topographic preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = ctx.createImageData(PREVIEW_RES, PREVIEW_RES);
    const data = img.data;
    const pal = BIOME_PALETTES[map.biome] ?? BIOME_PALETTES.temperate;
    const half = map.mapHalfSize;

    for (let py = 0; py < PREVIEW_RES; py++) {
      const wz = ((py / (PREVIEW_RES - 1)) * 2 - 1) * half;
      for (let px = 0; px < PREVIEW_RES; px++) {
        const wx = ((px / (PREVIEW_RES - 1)) * 2 - 1) * half;
        const h = map.sampleHeight(wx, wz);
        const code = map.sampleTerrainCode(wx, wz);

        let r: number;
        let g: number;
        let b: number;

        if (h < -0.32 || code === 0) {
          const depth = Math.min(1, Math.max(0, (-h - 0.25) / 2.2));
          r = pal.water[0] * (1 - depth * 0.42);
          g = pal.water[1] * (1 - depth * 0.38);
          b = pal.water[2] * (1 - depth * 0.32);
        } else if (h < 0.08) {
          r = pal.sand[0] * 0.62 + pal.water[0] * 0.38;
          g = pal.sand[1] * 0.62 + pal.water[1] * 0.38;
          b = pal.sand[2] * 0.62 + pal.water[2] * 0.38;
        } else {
          // Subtle directional hillshade from height neighbors
          const hx = map.sampleHeight(wx + 1.8, wz);
          const hz = map.sampleHeight(wx, wz + 1.8);
          const shade = Math.max(-24, Math.min(28, (h - hx) * 26 + (h - hz) * 22 + (h - 0.6) * 14));
          const base =
            code === 2
              ? pal.road
              : code === 3
              ? pal.sand
              : code === 4
              ? pal.high
              : code === 5
              ? pal.fertile
              : code === 6
              ? pal.snow
              : code === 7
              ? pal.forest
              : h > 1.35
              ? pal.high
              : pal.land;
          r = base[0] + shade;
          g = base[1] + shade;
          b = base[2] + shade;
        }

        const idx = (py * PREVIEW_RES + px) * 4;
        data[idx] = Math.max(0, Math.min(255, Math.round(r)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
        data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    const toPx = (wx: number, wz: number) => ({
      x: ((wx / half) * 0.5 + 0.5) * PREVIEW_RES,
      y: ((wz / half) * 0.5 + 0.5) * PREVIEW_RES,
    });

    // Playable boundary frame
    const pad = ((map.mapHalfSize - map.playableHalfSize) / (map.mapHalfSize * 2)) * PREVIEW_RES;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.38)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad, pad, PREVIEW_RES - pad * 2, PREVIEW_RES - pad * 2);

    // Optional coordinate grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        const p = (i / 8) * PREVIEW_RES;
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, PREVIEW_RES);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, p);
        ctx.lineTo(PREVIEW_RES, p);
        ctx.stroke();
      }
    }

    // Optional Areas & Connections overlay
    if (showAreas) {
      ctx.save();
      for (const area of map.areas) {
        if (!area.built || area.name.toLowerCase().includes('beauty')) continue;
        const c = toPx(area.centerX, area.centerZ);
        const rPx = (area.radiusWorld / (half * 2)) * PREVIEW_RES;
        ctx.beginPath();
        ctx.arc(c.x, c.y, Math.max(4, rPx), 0, Math.PI * 2);
        ctx.strokeStyle =
          area.terrainCode === 0 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(243, 210, 122, 0.35)';
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const conn of map.connections) {
        for (const seg of conn.segments) {
          const p1 = toPx(seg.x1, seg.z1);
          const p2 = toPx(seg.x2, seg.z2);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Optional Resources & Fauna overlay
    if (showObjects) {
      for (const obj of map.objects) {
        if (obj.category === 'town_center' || obj.category === 'decor') continue;
        const p = toPx(obj.x, obj.z);
        if (obj.category === 'tree') {
          ctx.fillStyle = 'rgba(22, 101, 52, 0.85)';
          ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        } else if (obj.category === 'gold') {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#422006';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (obj.category === 'berry') {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (obj.category === 'settlement') {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(p.x - 4.5, p.y - 4.5, 9, 9);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x - 4.5, p.y - 4.5, 9, 9);
        } else if (obj.category === 'relic') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - 5.5);
          ctx.lineTo(p.x + 4.5, p.y);
          ctx.lineTo(p.x, p.y + 5.5);
          ctx.lineTo(p.x - 4.5, p.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else if (obj.category === 'fish') {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (obj.category === 'fauna' || obj.category === 'marine_decor') {
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Player spawn badges (always drawn on top)
    for (const pl of map.players) {
      const p = toPx(pl.x, pl.z);
      const col = PLAYER_COLORS[(pl.slot - 1) % PLAYER_COLORS.length];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(9, 14, 26, 0.88)';
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = col;
      ctx.stroke();

      ctx.fillStyle = col;
      ctx.font = 'bold 10px ui-monospace, SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${pl.slot}`, p.x, p.y + 0.5);
    }

    // Visual Brush preview strokes overlay
    if (brushStrokes.length > 0) {
      ctx.save();
      for (const st of brushStrokes) {
        const meta = BRUSH_TOOLS.find((t) => t.id === st.tool);
        if (!meta) continue;
        const cx = st.u * PREVIEW_RES;
        const cy = st.v * PREVIEW_RES;
        const rad = meta.isObject ? 7 : Math.max(8, st.radiusFrac * PREVIEW_RES * 0.65);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fillStyle = `${meta.color}55`;
        ctx.fill();
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [map, showAreas, showObjects, showGrid, brushStrokes]);

  const handleSelectTemplate = (tplId: string) => {
    const tpl = RMS_SCRIPT_LIBRARY.find((t) => t.id === tplId);
    if (!tpl) return;
    soundEngine.playSelect();
    setSelectedTemplateId(tpl.id);
    setXsDraft(tpl.xsCode);
    setXmlDraft(tpl.xmlCode);
    setCommittedXs(tpl.xsCode);
    setCommittedXml(tpl.xmlCode);
    setCustomTitle(tpl.name);
    setPlayerCount(tpl.recommendedPlayers);
  };

  const handleRunScript = () => {
    soundEngine.playSelect();
    setCommittedXs(xsDraft);
    setCommittedXml(xmlDraft);
  };

  const handleRandomSeed = () => {
    soundEngine.playSelect();
    setSeed(Math.floor(Math.random() * 899999) + 10000);
  };

  const handleRestoreTemplate = () => {
    soundEngine.playSelect();
    setXsDraft(activeTemplate.xsCode);
    setXmlDraft(activeTemplate.xmlCode);
    setCommittedXs(activeTemplate.xsCode);
    setCommittedXml(activeTemplate.xmlCode);
    setCustomTitle(activeTemplate.name);
  };

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    let nextXs = xsDraft;
    let nextXml = xmlDraft;
    let importedName = customTitle;

    for (const file of files) {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith('.xs')) {
        nextXs = text;
        importedName = file.name.replace(/\.xs$/i, '');
      } else if (file.name.toLowerCase().endsWith('.xml')) {
        nextXml = text;
      }
    }
    setXsDraft(nextXs);
    setXmlDraft(nextXml);
    setCommittedXs(nextXs);
    setCommittedXml(nextXml);
    setCustomTitle(importedName);
    soundEngine.playSelect();
    e.target.value = '';
  };

  const handleDownloadXs = () => {
    const blob = new Blob([xsDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTitle.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'custom_map'}.xs`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recordBrushAtEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const u = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
    setBrushStrokes((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.tool === brushTool && Math.hypot(last.u - u, last.v - v) < 0.045) {
        return prev;
      }
      return [...prev.slice(-47), { tool: brushTool, u, v, radiusFrac: brushRadius }];
    });
  };

  const handleApplyBrushToXs = () => {
    if (brushStrokes.length === 0) return;
    soundEngine.playSelect();
    const lines: string[] = [
      '  // === PINTURA VISUAL RMS ===',
    ];
    brushStrokes.forEach((st, idx) => {
      const fx = st.u.toFixed(3);
      const fz = st.v.toFixed(3);
      const size = Math.max(0.008, st.radiusFrac * st.radiusFrac * 2.2).toFixed(4);
      if (st.tool === 'raise' || st.tool === 'water' || st.tool === 'road' || st.tool === 'forest') {
        const terrain =
          st.tool === 'water'
            ? 'GreekWater'
            : st.tool === 'road'
            ? 'GreekRoadA'
            : st.tool === 'forest'
            ? 'ForestFloorPine'
            : 'GreekCliffA';
        const elev = st.tool === 'water' ? '-2.2' : st.tool === 'raise' ? '3.4' : '1.2';
        lines.push(`  int brushArea${idx} = rmCreateArea("brush_${st.tool}_${idx}");`);
        lines.push(`  rmSetAreaLocation(brushArea${idx}, ${fx}, ${fz});`);
        lines.push(`  rmSetAreaSize(brushArea${idx}, ${size}, ${size});`);
        lines.push(`  rmSetAreaTerrainType(brushArea${idx}, "${terrain}");`);
        lines.push(`  rmSetAreaBaseHeight(brushArea${idx}, ${elev});`);
        lines.push(`  rmBuildArea(brushArea${idx});`);
      } else {
        const proto =
          st.tool === 'gold'
            ? 'Gold Mine'
            : st.tool === 'settlement'
            ? 'Settlement'
            : st.tool === 'relic'
            ? 'Relic'
            : 'Deer';
        const count = st.tool === 'fauna' ? 4 : 1;
        lines.push(`  int brushObj${idx} = rmCreateObjectDef("brush_obj_${idx}");`);
        lines.push(`  rmAddObjectDefItem(brushObj${idx}, "${proto}", ${count}, 2.0);`);
        lines.push(`  rmPlaceObjectDefAtLoc(brushObj${idx}, 0, ${fx}, ${fz}, 1);`);
      }
    });
    lines.push('  // === FIM PINTURA VISUAL ===');
    const block = `\n${lines.join('\n')}\n`;

    const stripRegex = /\n?\s*\/\/ === PINTURA VISUAL RMS ===[\s\S]*?\/\/ === FIM PINTURA VISUAL ===\n?/g;
    const cleaned = xsDraft.replace(stripRegex, '\n');
    const lastBrace = cleaned.lastIndexOf('}');
    const nextXs =
      lastBrace >= 0
        ? `${cleaned.slice(0, lastBrace)}${block}${cleaned.slice(lastBrace)}`
        : `${cleaned}${block}`;

    setXsDraft(nextXs);
    setCommittedXs(nextXs);
    setBrushStrokes([]);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (brushMode && isPainting) {
      recordBrushAtEvent(e);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const u = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const wx = (u * 2 - 1) * map.mapHalfSize;
    const wz = (v * 2 - 1) * map.mapHalfSize;
    const h = map.sampleHeight(wx, wz);
    const code = map.sampleTerrainCode(wx, wz);

    let nearestLabel = '';
    let bestD = 7.5;
    for (const obj of map.objects) {
      const d = Math.hypot(obj.x - wx, obj.z - wz);
      if (d < bestD) {
        bestD = d;
        nearestLabel = ` · Objeto: ${obj.subLabel || obj.proto}`;
      }
    }
    setHoverText(
      `Pos (${wx.toFixed(0)}, ${wz.toFixed(0)}) · Alt ${h.toFixed(2)} · ${TERRAIN_LABELS[code]}${nearestLabel}`
    );
  };

  const launchMap = (sandbox: boolean) => {
    soundEngine.unlock();
    soundEngine.playSelect();
    onStartMatch(pantheon, difficulty, 'rms_custom', sandbox, {
      worldSize,
      matchSeed: seed,
      gameSpeed,
      scenarioTitle: map.title || customTitle,
      startingAge: sandbox ? 4 : 1,
      startingResources: sandbox ? 'abundant' : 'standard',
      rmsConfig: {
        scriptId: selectedTemplateId,
        title: map.title || customTitle,
        xsCode: xsDraft,
        xmlCode: xmlDraft,
        seed,
        playerCount,
      },
    });
  };

  const lineCount = xsDraft.split('\n').length;

  return (
    <div className="flex flex-col gap-3.5 text-[#ece6d9]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#f3d27a]">
            Laboratório de Mapas Aleatórios (.xs / .xml)
          </h2>
          <p className="text-[11px] sm:text-xs text-[#94a3b8]">
            Motor procedural AoM: Retold com áreas, restrições, conexões, compilador .xs ao vivo e auditoria de equilíbrio
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playSelect();
            onBack();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#141b2a] px-3 py-1.5 text-xs font-semibold text-[#e2e8f0] hover:border-[#d4af37]/50 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Top Controls Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 rounded-lg border border-white/10 bg-[#101624] p-2.5">
        <div className="md:col-span-5 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#94a3b8]">Script RMS (.xs)</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="h-9 rounded-md border border-white/12 bg-[#0b101b] px-2.5 text-xs font-semibold text-[#f3d27a] focus:border-[#d4af37] focus:outline-none cursor-pointer"
          >
            {RMS_SCRIPT_LIBRARY.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} — {tpl.sourceLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#94a3b8]">Jogadores</label>
          <select
            value={playerCount}
            onChange={(e) => {
              soundEngine.playSelect();
              setPlayerCount(Number(e.target.value));
            }}
            className="h-9 rounded-md border border-white/12 bg-[#0b101b] px-2 text-xs font-semibold text-[#ece6d9] tabular-nums focus:border-[#d4af37] focus:outline-none cursor-pointer"
          >
            {[2, 4, 6, 8, 12].map((n) => (
              <option key={n} value={n}>
                {n} Jogadores ({n / 2}v{n / 2})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#94a3b8]">Tamanho do Mundo</label>
          <select
            value={worldSize}
            onChange={(e) => {
              soundEngine.playSelect();
              setWorldSize(e.target.value as WorldSizeId);
            }}
            className="h-9 rounded-md border border-white/12 bg-[#0b101b] px-2 text-xs font-semibold text-[#ece6d9] focus:border-[#d4af37] focus:outline-none cursor-pointer"
          >
            {(['normal', 'large', 'giant'] as WorldSizeId[]).map((ws) => (
              <option key={ws} value={ws}>
                {WORLD_SIZE_SPECS[ws].label} ({WORLD_SIZE_SPECS[ws].dimsLabel})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#94a3b8]">Semente Determinística</label>
          <div className="flex gap-1.5">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Math.max(1, Number(e.target.value) || 1))}
              className="h-9 w-full rounded-md border border-white/12 bg-[#0b101b] px-2.5 font-mono text-xs font-semibold text-[#f3d27a] tabular-nums focus:border-[#d4af37] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleRandomSeed}
              title="Gerar nova semente aleatória"
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#d4af37]/45 bg-[#1b2436] px-2.5 text-xs font-semibold text-[#f3d27a] hover:bg-[#232f46] cursor-pointer transition-colors"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nova</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Live Topographic Preview */}
        <div className="lg:col-span-5 flex flex-col gap-2 rounded-lg border border-white/10 bg-[#0d1320] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-[#f3d27a] truncate">
              {map.title || customTitle}
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setShowAreas((v) => !v)}
                className={`rounded border px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                  showAreas
                    ? 'border-[#d4af37]/60 bg-[#232b3e] text-[#f3d27a]'
                    : 'border-white/10 bg-[#121826] text-[#94a3b8]'
                }`}
              >
                Áreas
              </button>
              <button
                type="button"
                onClick={() => setShowObjects((v) => !v)}
                className={`rounded border px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                  showObjects
                    ? 'border-[#d4af37]/60 bg-[#232b3e] text-[#f3d27a]'
                    : 'border-white/10 bg-[#121826] text-[#94a3b8]'
                }`}
              >
                Recursos
              </button>
              <button
                type="button"
                onClick={() => setShowGrid((v) => !v)}
                className={`rounded border px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                  showGrid
                    ? 'border-[#d4af37]/60 bg-[#232b3e] text-[#f3d27a]'
                    : 'border-white/10 bg-[#121826] text-[#94a3b8]'
                }`}
              >
                Grade
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSelect();
                  setBrushMode((v) => !v);
                }}
                className={`flex items-center gap-1 rounded border px-2 py-0.5 font-semibold transition-colors cursor-pointer ${
                  brushMode
                    ? 'border-[#facc15] bg-[#d4af37] text-[#0b0e14]'
                    : 'border-[#d4af37]/40 bg-[#171f30] text-[#f3d27a] hover:bg-[#222d44]'
                }`}
              >
                <Paintbrush className="h-3 w-3" />
                <span>Pincel</span>
              </button>
            </div>
          </div>

          {brushMode && (
            <div className="flex flex-col gap-1.5 rounded-md border border-[#d4af37]/35 bg-[#111827] p-2">
              <div className="flex flex-wrap items-center gap-1">
                {BRUSH_TOOLS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBrushTool(t.id)}
                    className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                      brushTool === t.id
                        ? 'border-[#facc15] bg-[#2a3346] text-white'
                        : 'border-white/10 bg-[#0d1320] text-[#cbd5e1] hover:border-white/25'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-[#94a3b8]">
                  <span>Raio:</span>
                  {[
                    { label: 'P', val: 0.045 },
                    { label: 'M', val: 0.075 },
                    { label: 'G', val: 0.115 },
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setBrushRadius(r.val)}
                      className={`rounded px-1.5 py-0.5 font-bold cursor-pointer ${
                        brushRadius === r.val ? 'bg-[#d4af37] text-[#0b0e14]' : 'bg-white/10 text-[#cbd5e1]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={brushStrokes.length === 0}
                    onClick={() => setBrushStrokes((s) => s.slice(0, -1))}
                    className="flex items-center gap-1 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[#cbd5e1] disabled:opacity-40 cursor-pointer"
                    title="Desfazer último traço"
                  >
                    <Undo2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={brushStrokes.length === 0}
                    onClick={() => setBrushStrokes([])}
                    className="flex items-center gap-1 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[#cbd5e1] disabled:opacity-40 cursor-pointer"
                    title="Limpar traços"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={brushStrokes.length === 0}
                    onClick={handleApplyBrushToXs}
                    className="rounded border border-[#f5d77f] bg-[#d4af37] px-2 py-0.5 font-bold text-[#0b0e14] disabled:opacity-40 cursor-pointer"
                  >
                    Gerar Código .xs ({brushStrokes.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative mx-auto w-full max-w-[440px] aspect-square overflow-hidden rounded-md border border-[#d4af37]/30 bg-[#070b13]">
            <canvas
              ref={canvasRef}
              width={PREVIEW_RES}
              height={PREVIEW_RES}
              onMouseDown={(e) => {
                if (!brushMode) return;
                setIsPainting(true);
                recordBrushAtEvent(e);
              }}
              onMouseUp={() => setIsPainting(false)}
              onMouseMove={handleCanvasMove}
              onMouseLeave={() => {
                setIsPainting(false);
                setHoverText('Passe o cursor no mapa para inspecionar altitude, terreno e objetos.');
              }}
              className={`h-full w-full block ${brushMode ? 'cursor-cell' : 'cursor-crosshair'}`}
            />
          </div>

          {/* Inspector & Compact Metadata */}
          <div className="font-mono text-[11px] text-[#cbd5e1] tabular-nums truncate">
            {hoverText}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/8 pt-2 text-[11px] text-[#94a3b8] tabular-nums">
            <span>
              Bioma: <strong className="text-[#e2e8f0]">{BIOME_LABELS[map.biome]}</strong> ·{' '}
              {map.logicalSizeMeters}×{map.logicalSizeMeters}m · {map.durationMs}ms
            </span>
            <span>Ouro · Assent. · Relíquia · Fauna · Pesca</span>
          </div>
        </div>

        {/* Right: Tabbed Workbench */}
        <div className="lg:col-span-7 flex flex-col rounded-lg border border-white/10 bg-[#0d1320] overflow-hidden">
          {/* Tabs Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-2 pt-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('xs')}
                className={`flex items-center gap-1.5 rounded-t-md border-t border-x px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'xs'
                    ? 'border-[#d4af37]/40 bg-[#0d1320] text-[#f3d27a]'
                    : 'border-transparent text-[#94a3b8] hover:text-white'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Script .xs</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('xml')}
                className={`flex items-center gap-1.5 rounded-t-md border-t border-x px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'xml'
                    ? 'border-[#d4af37]/40 bg-[#0d1320] text-[#f3d27a]'
                    : 'border-transparent text-[#94a3b8] hover:text-white'
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Metadados .xml & Gatilhos ({map.triggers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 rounded-t-md border-t border-x px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'audit'
                    ? 'border-[#d4af37]/40 bg-[#0d1320] text-[#f3d27a]'
                    : 'border-transparent text-[#94a3b8] hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Validação & Equilíbrio</span>
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 pb-1.5 pr-1 text-[11px] text-[#94a3b8] tabular-nums">
              {syntaxError ? (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Erro linha {syntaxError.line}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Compilado ({lineCount} linhas)
                </span>
              )}
            </div>
          </div>

          {/* Tab 1: Script .xs Editor */}
          {activeTab === 'xs' && (
            <div className="flex flex-1 flex-col gap-2 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRunScript}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      hasUnappliedEdits
                        ? 'border-[#f3d27a] bg-[#2a3346] text-[#f3d27a]'
                        : 'border-white/15 bg-[#161e2e] text-[#e2e8f0] hover:border-[#d4af37]/50'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 text-[#d4af37]" />
                    <span>{hasUnappliedEdits ? 'Executar Alterações' : 'Recompilar Script'}</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xs,.xml"
                    multiple
                    onChange={handleImportFiles}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-md border border-white/12 bg-[#141b2a] px-2.5 py-1.5 text-xs font-medium text-[#cbd5e1] hover:border-[#d4af37]/45 hover:text-white cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Importar .xs / .xml</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadXs}
                    className="flex items-center gap-1.5 rounded-md border border-white/12 bg-[#141b2a] px-2.5 py-1.5 text-xs font-medium text-[#cbd5e1] hover:border-[#d4af37]/45 hover:text-white cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Baixar .xs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const txt = generateMythRMConstantsTxt();
                      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'MythRMConstants.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Gera o arquivo MythRMConstants.txt (equivalente a GenerateRMConstants + GenerateTRConstants no user.cfg)"
                    className="flex items-center gap-1.5 rounded-md border border-[#d4af37]/35 bg-[#192234] px-2.5 py-1.5 text-xs font-medium text-[#f3d27a] hover:bg-[#222e46] cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>MythRMConstants.txt</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRestoreTemplate}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#94a3b8] hover:text-[#f3d27a] cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restaurar</span>
                </button>
              </div>

              {syntaxError && (
                <div className="flex items-start gap-2 rounded-md border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-semibold">Erro de sintaxe na linha {syntaxError.line}:</span>{' '}
                    {syntaxError.message}
                  </div>
                </div>
              )}

              <textarea
                value={xsDraft}
                onChange={(e) => setXsDraft(e.target.value)}
                spellCheck={false}
                className="min-h-[300px] lg:min-h-[350px] flex-1 w-full resize-none rounded-md border border-white/10 bg-[#070b13] p-3 font-mono text-[11.5px] leading-relaxed text-[#dbeafe] focus:border-[#d4af37]/60 focus:outline-none"
              />
            </div>
          )}

          {/* Tab 2: XML & Triggers */}
          {activeTab === 'xml' && (
            <div className="flex flex-1 flex-col gap-3 p-3 overflow-y-auto max-h-[430px]">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#f3d27a]">
                  <span>Definição XML (&lt;mapinfo&gt;)</span>
                  <button
                    type="button"
                    onClick={handleRunScript}
                    className="text-[11px] text-[#94a3b8] hover:text-[#f3d27a] cursor-pointer"
                  >
                    Aplicar XML
                  </button>
                </div>
                <textarea
                  value={xmlDraft}
                  onChange={(e) => setXmlDraft(e.target.value)}
                  spellCheck={false}
                  rows={4}
                  className="w-full resize-none rounded-md border border-white/10 bg-[#070b13] p-2.5 font-mono text-[11px] text-[#dbeafe] focus:border-[#d4af37]/60 focus:outline-none"
                />
                <div className="mt-1.5 text-[11px] text-[#94a3b8]">
                  Nome: <span className="text-[#e2e8f0]">{xmlMeta.displayNameID || '—'}</span> · Imagem:{' '}
                  <span className="font-mono text-[#e2e8f0]">{xmlMeta.imagepath || '—'}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-2.5">
                <div className="mb-2 text-xs font-semibold text-[#f3d27a]">
                  Gatilhos Detectados no Script ({map.triggers.length})
                </div>

                {/* Triggers Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5 text-xs">
                  <div className="rounded border border-white/8 bg-[#111827] p-2.5">
                    <div className="text-[11px] text-[#94a3b8]">Mensagem Inicial</div>
                    <div className="mt-0.5 font-medium text-[#ece6d9]">
                      {map.triggersSummary.introMessage || 'Nenhuma mensagem configurada'}
                    </div>
                  </div>
                  <div className="rounded border border-white/8 bg-[#111827] p-2.5 tabular-nums">
                    <div className="text-[11px] text-[#94a3b8]">Recursos Concedidos (Escala Jogável)</div>
                    <div className="mt-0.5 font-medium text-[#ece6d9]">
                      {map.triggersSummary.grantResources
                        ? `${map.triggersSummary.grantResources.food.toLocaleString('pt-BR')} Comida · ${map.triggersSummary.grantResources.gold.toLocaleString('pt-BR')} Ouro · ${map.triggersSummary.grantResources.favor} Favor`
                        : 'Recursos padrão da partida'}
                    </div>
                  </div>
                  <div className="rounded border border-white/8 bg-[#111827] p-2.5 tabular-nums">
                    <div className="text-[11px] text-[#94a3b8]">Ciclo Dia / Noite</div>
                    <div className="mt-0.5 font-medium text-[#ece6d9]">
                      {map.triggersSummary.lightingCycle
                        ? `Dia ${map.triggersSummary.lightingCycle.daySec}s · Entardecer ${map.triggersSummary.lightingCycle.duskSec}s · Noite ${map.triggersSummary.lightingCycle.nightSec}s`
                        : 'Ciclo padrão do motor'}
                    </div>
                  </div>
                  <div className="rounded border border-white/8 bg-[#111827] p-2.5">
                    <div className="text-[11px] text-[#94a3b8]">Regra de Derrota</div>
                    <div className="mt-0.5 font-medium text-[#ece6d9]">
                      {map.triggersSummary.destroyAllOnDefeat
                        ? 'Destrói todas as unidades e estruturas ao ser derrotado'
                        : 'Padrão (Supremacia)'}
                    </div>
                  </div>
                </div>

                {map.triggers.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {map.triggers.map((tr) => (
                      <div
                        key={tr.id}
                        className="flex items-center justify-between rounded border border-white/8 bg-[#0b101b] px-2.5 py-1.5 text-[11px]"
                      >
                        <span className="font-mono font-semibold text-[#f3d27a]">{tr.name}</span>
                        <span className="text-[#94a3b8] tabular-nums">
                          {tr.conditions.length} cond. · {tr.effects.length} efeitos
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Fairness & Debug Logs */}
          {activeTab === 'audit' && (
            <div className="flex flex-1 flex-col gap-3 p-3 overflow-y-auto max-h-[430px]">
              {/* Entity Count Summary */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded border border-white/10 bg-[#111827] px-3 py-2 text-xs text-[#cbd5e1] tabular-nums">
                <span className="flex items-center gap-1.5 font-semibold text-[#f3d27a]">
                  <Layers className="h-3.5 w-3.5" />
                  Entidades:
                </span>
                <span>{objectCounts.settlement} Assent.</span>
                <span>{objectCounts.gold} Ouro</span>
                <span>{objectCounts.tree} Árvores</span>
                <span>{objectCounts.berry} Frutas</span>
                <span>{objectCounts.fauna} Fauna</span>
                <span>{objectCounts.fish} Pesca</span>
                <span>{objectCounts.relic} Relíquias</span>
              </div>

              {/* Per-Player Fairness Table */}
              <div>
                <div className="mb-1.5 text-xs font-semibold text-[#f3d27a]">
                  Auditoria de Equilíbrio por Jogador (Distância ao Recurso Mais Próximo)
                </div>
                <div className="overflow-x-auto rounded border border-white/10">
                  <table className="w-full text-left text-[11.5px] tabular-nums">
                    <thead className="bg-[#111827] text-[#94a3b8]">
                      <tr>
                        <th className="px-2.5 py-1.5 font-semibold">Jogador</th>
                        <th className="px-2.5 py-1.5 font-semibold">Base</th>
                        <th className="px-2.5 py-1.5 font-semibold">Ouro</th>
                        <th className="px-2.5 py-1.5 font-semibold">Comida</th>
                        <th className="px-2.5 py-1.5 font-semibold">Madeira</th>
                        <th className="px-2.5 py-1.5 font-semibold">Assent.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6 bg-[#090e1a]">
                      {map.fairness.map((row) => (
                        <tr key={row.slot}>
                          <td className="px-2.5 py-1.5 font-mono font-semibold text-[#f3d27a]">
                            P{row.slot}
                          </td>
                          <td className="px-2.5 py-1.5">
                            {row.onLand ? (
                              <span className="text-emerald-400">Terra firme</span>
                            ) : (
                              <span className="text-rose-400">Água</span>
                            )}
                          </td>
                          <td className="px-2.5 py-1.5 text-[#e2e8f0]">
                            {row.nearestGoldDist !== null ? `${row.nearestGoldDist}u` : '—'}
                          </td>
                          <td className="px-2.5 py-1.5 text-[#e2e8f0]">
                            {row.nearestFoodDist !== null ? `${row.nearestFoodDist}u` : '—'}
                          </td>
                          <td className="px-2.5 py-1.5 text-[#e2e8f0]">
                            {row.nearestWoodDist !== null ? `${row.nearestWoodDist}u` : '—'}
                          </td>
                          <td className="px-2.5 py-1.5 text-[#e2e8f0]">
                            {row.nearestSettlementDist !== null ? `${row.nearestSettlementDist}u` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* debugRandomMaps Log Output */}
              <div>
                <div className="mb-1.5 text-xs font-semibold text-[#f3d27a]">
                  Log de Validação (debugRandomMaps)
                </div>
                <div className="flex flex-col gap-1 rounded border border-white/10 bg-[#070b13] p-2.5 font-mono text-[11px] max-h-[165px] overflow-y-auto">
                  {map.logs.map((entry, idx) => (
                    <div
                      key={idx}
                      className={
                        entry.level === 'error'
                          ? 'text-rose-400'
                          : entry.level === 'warn'
                          ? 'text-amber-300'
                          : 'text-[#cbd5e1]'
                      }
                    >
                      <span className="text-[#64748b]">[{entry.stage}]</span> {entry.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Launch Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d4af37]/30 bg-[#101624] px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-[#94a3b8]">Civilização:</label>
            <select
              value={pantheon}
              onChange={(e) => setPantheon(e.target.value as PantheonId)}
              className="h-8 rounded border border-white/12 bg-[#0b101b] px-2 text-xs font-semibold text-[#ece6d9] cursor-pointer"
            >
              {Object.values(PANTHEONS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-[#94a3b8]">IA:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyId)}
              className="h-8 rounded border border-white/12 bg-[#0b101b] px-2 text-xs font-semibold text-[#ece6d9] cursor-pointer"
            >
              <option value="easy">Fácil</option>
              <option value="normal">Normal</option>
              <option value="hard">Difícil</option>
              <option value="titan">Titã</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => launchMap(true)}
            className="flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-[#161f31] px-3.5 text-xs font-semibold text-[#e2e8f0] hover:border-[#d4af37]/50 hover:text-white transition-colors cursor-pointer"
          >
            <Wrench className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Abrir no Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => launchMap(false)}
            className="flex h-9 items-center gap-1.5 rounded-md border border-[#f5d77f] bg-gradient-to-r from-[#d4af37] via-[#e4c158] to-[#c99e28] px-5 text-xs font-bold text-[#090d16] shadow-[0_6px_20px_rgba(212,175,55,0.28)] hover:brightness-105 transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Jogar Este Mapa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
