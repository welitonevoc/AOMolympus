import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  FolderOpen,
  Globe,
  Play,
  Plus,
  Save,
  ShieldBan,
  Sparkles,
  Sun,
  Swords,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  AGE_NAMES,
  AgeLevel,
  BUILDING_STATS,
  BuildingKind,
  DifficultyId,
  MapId,
  MAPS,
  PANTHEONS,
  PantheonId,
  UNIT_STATS,
  UnitKind,
  WorldSizeId,
} from '../game/types';
import {
  CustomCampaignDocument,
  DiplomacyStance,
  PLAYER_COLORS,
  SCENARIO_LIGHTING_PRESETS,
  ScenarioDocument,
  ScenarioObjectiveItem,
  ScenarioTriggerConditionType,
  ScenarioTriggerEffectType,
  TERRAIN_PAINT_PALETTE,
  WORLD_SIZE_SPECS,
  deleteScenarioFromStorage,
  loadCustomCampaigns,
  loadSavedScenarios,
  saveCustomCampaignToStorage,
} from '../maps';

export type EditorModalId =
  | null
  | 'new_map'
  | 'save_load'
  | 'player_data'
  | 'scenario_data'
  | 'scenario_summary'
  | 'objectives'
  | 'forbidden_units'
  | 'diplomacy'
  | 'world_lighting'
  | 'world_size'
  | 'world_elevation'
  | 'campaign_maker'
  | 'playtest';

interface ScenarioEditorModalsProps {
  activeModal: EditorModalId;
  onClose: () => void;
  doc: ScenarioDocument;
  onUpdateDoc: (updater: (prev: ScenarioDocument) => ScenarioDocument) => void;
  onGenerateNewMap: (opts: { baseMapId: MapId | 'blank_grass'; worldSize: WorldSizeId; seed: number; maxPlayers: number; title: string }) => void;
  onSaveScenario: () => void;
  onLoadScenario: (loaded: ScenarioDocument) => void;
  onApplyGlobalElevation: (delta: number) => void;
  onResizeMapSides: (widthMeters: number, depthMeters: number) => void;
  onPlaytest: (playAsSlot: number, difficulty: DifficultyId, targetDoc?: ScenarioDocument) => void;
}

const MAJOR_GODS_SIMPLE: Record<PantheonId, string[]> = {
  greek: ['Zeus', 'Poseidon', 'Hades'],
  egyptian: ['Rá', 'Ísis', 'Set'],
  norse: ['Thor', 'Odin', 'Loki', 'Freyr'],
  atlantean: ['Cronos', 'Urano', 'Gaia'],
  chinese: ['Fuxi', 'Nüwa', 'Shennong'],
  aztec: ['Quetzalcoatl', 'Tezcatlipoca', 'Huitzilopochtli'],
  roman: ['Júpiter', 'Marte', 'Minerva'],
  japanese: ['Amaterasu', 'Susanoo', 'Tsukuyomi'],
  eldritch: ['Cthulhu', 'Nyarlathotep', 'Azathoth'],
  celtic: ['Dagda', 'Morrígan', 'Lugh'],
  babylonian: ['Marduk', 'Ishtar', 'Enki'],
  lakota: ['Wakan Tanka', 'Tate', 'Inktomi'],
  jotunn: ['Ymir', 'Surtur', 'Skadi'],
};

const MINOR_GODS_POOL: Record<2 | 3 | 4, string[]> = {
  2: ['Atena', 'Hermes', 'Ares', 'Bast', 'Anúbis', 'Freya', 'Forseti', 'Prometeu', 'Leto', 'Chiyou'],
  3: ['Apolo', 'Dionísio', 'Afrodite', 'Hathor', 'Sekhmet', 'Skadi', 'Njord', 'Hyperion', 'Theia', 'Goumang'],
  4: ['Hefesto', 'Hera', 'Ártemis', 'Osíris', 'Thoth', 'Baldr', 'Tyr', 'Atlas', 'Helios', 'Zhurong'],
};

export const ScenarioEditorModals: React.FC<ScenarioEditorModalsProps> = ({
  activeModal,
  onClose,
  doc,
  onUpdateDoc,
  onGenerateNewMap,
  onSaveScenario,
  onLoadScenario,
  onApplyGlobalElevation,
  onResizeMapSides,
  onPlaytest,
}) => {
  // New Map state
  const [newMapBase, setNewMapBase] = useState<MapId | 'blank_grass'>('blank_grass');
  const [newMapSize, setNewMapSize] = useState<WorldSizeId>('normal');
  const [newMapSeed, setNewMapSeed] = useState<number>(() => Math.floor(1000 + Math.random() * 89999));
  const [newMapPlayers, setNewMapPlayers] = useState<number>(2);
  const [newMapTitle, setNewMapTitle] = useState<string>('Novo Cenário');

  // Saved Scenarios & Campaign Maker state
  const [savedList, setSavedList] = useState<ScenarioDocument[]>(() => loadSavedScenarios());
  const [campaigns, setCampaigns] = useState<CustomCampaignDocument[]>(() => loadCustomCampaigns());
  const [campTitle, setCampTitle] = useState<string>('Campanha do Olimpo');
  const [campDesc, setCampDesc] = useState<string>('Uma série de missões épicas criadas no Editor de Cenários.');
  const [campIntro, setCampIntro] = useState<string>('Nos tempos antigos, heróis ergueram-se para defender os templos dos deuses...');
  const [campCover, setCampCover] = useState<CustomCampaignDocument['coverTheme']>('olympus');
  const [campScenarios, setCampScenarios] = useState<string[]>([]);

  // Player Data / Forbidden / Playtest / Objectives state
  const [activePlayerTab, setActivePlayerTab] = useState<number>(1);
  const [forbiddenSlot, setForbiddenSlot] = useState<number>(1);
  const [playtestSlot, setPlaytestSlot] = useState<number>(1);
  const [playtestDiff, setPlaytestDiff] = useState<DifficultyId>('normal');
  const [elevDelta, setElevDelta] = useState<number>(0.5);
  const [resizeW, setResizeW] = useState<number>(doc.widthMeters);
  const [resizeD, setResizeD] = useState<number>(doc.depthMeters);
  const [newObjTitle, setNewObjTitle] = useState<string>('');
  const [newObjDesc, setNewObjDesc] = useState<string>('');
  const [newObjType, setNewObjType] = useState<ScenarioObjectiveItem['type']>('primary');
  const [newTrigName, setNewTrigName] = useState<string>('');
  const [newTrigCond, setNewTrigCond] = useState<ScenarioTriggerConditionType>('timer_elapsed');
  const [newTrigVal, setNewTrigVal] = useState<number>(30);
  const [newTrigEff, setNewTrigEff] = useState<ScenarioTriggerEffectType>('spawn_reinforcements');
  const [newTrigMsg, setNewTrigMsg] = useState<string>('');

  const summary = useMemo(() => {
    let minH = Infinity;
    let maxH = -Infinity;
    const terrainCounts: Record<number, number> = {};
    for (let i = 0; i < doc.heightGrid.length; i++) {
      const h = (doc.heightGrid[i] ?? 0) + doc.globalElevationOffset;
      if (h < minH) minH = h;
      if (h > maxH) maxH = h;
      const tc = doc.terrainGrid[i] ?? 1;
      terrainCounts[tc] = (terrainCounts[tc] ?? 0) + 1;
    }
    let domCode = 1;
    let domCount = -1;
    for (const [c, cnt] of Object.entries(terrainCounts)) {
      if (cnt > domCount) {
        domCount = cnt;
        domCode = Number(c);
      }
    }
    const domName = TERRAIN_PAINT_PALETTE.find((p) => p.code === domCode)?.label ?? 'Grama Grega';
    const units = doc.objects.filter((o) => o.kindType === 'unit').length;
    const buildings = doc.objects.filter((o) => o.kindType === 'building').length;
    const trees = doc.objects.filter((o) => o.kindType === 'tree').length;
    const goldMines = doc.objects.filter((o) => o.resourceKind === 'gold_mine').length;
    const berries = doc.objects.filter((o) => o.resourceKind === 'berry').length;
    const fauna = doc.objects.filter((o) => o.kindType === 'fauna').length;
    const relics = doc.objects.filter((o) => o.resourceKind === 'relic').length;
    return {
      minH: Number.isFinite(minH) ? minH.toFixed(2) : '0.00',
      maxH: Number.isFinite(maxH) ? maxH.toFixed(2) : '0.00',
      domName,
      units,
      buildings,
      trees,
      goldMines,
      berries,
      fauna,
      relics,
      totalGold: goldMines * 1200,
      totalWood: trees * 150,
      totalFood: berries * 250 + fauna * 180,
    };
  }, [doc]);

  if (!activeModal) return null;

  const activePlayer = doc.players.find((p) => p.slot === activePlayerTab) ?? doc.players[0];

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9_-]+/gi, '_').toLowerCase() || 'cenario'}.aomscn.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ScenarioDocument;
        if (parsed && Array.isArray(parsed.heightGrid) && Array.isArray(parsed.objects)) {
          onLoadScenario(parsed);
          onClose();
        }
      } catch {
        // invalid json ignored
      }
    };
    reader.readAsText(file);
  };

  const cycleDiplomacy = (fromSlot: number, toSlot: number) => {
    if (fromSlot === toSlot) return;
    const key = `${fromSlot}_${toSlot}`;
    const cur = doc.diplomacy[key] ?? 'enemy';
    const next: DiplomacyStance = cur === 'neutral' ? 'ally' : cur === 'ally' ? 'enemy' : 'neutral';
    onUpdateDoc((prev) => ({
      ...prev,
      diplomacy: { ...prev.diplomacy, [key]: next },
    }));
  };

  const toggleForbidden = (slot: number, id: string) => {
    onUpdateDoc((prev) => {
      const cur = prev.forbiddenByPlayer[slot] ?? [];
      const exists = cur.includes(id);
      const next = exists ? cur.filter((x) => x !== id) : [...cur, id];
      return {
        ...prev,
        forbiddenByPlayer: { ...prev.forbiddenByPlayer, [slot]: next },
      };
    });
  };

  const modalTitleMap: Record<Exclude<EditorModalId, null>, string> = {
    new_map: 'Novo Mapa / Gerador de Cenário',
    save_load: 'Salvar, Carregar & Exportar Cenário',
    player_data: 'Dados dos Jogadores (1–12 · Era Inicial Retold)',
    scenario_data: 'Dados do Cenário',
    scenario_summary: 'Resumo do Cenário',
    objectives: 'Objetivos, Dicas & Spotlight (SL)',
    forbidden_units: 'Unidades & Construções Proibidas',
    diplomacy: 'Matriz de Diplomacia (Jogadores 1–12)',
    world_lighting: 'Iluminação & SkyBox do Mundo',
    world_size: 'Tamanho do Mapa (Metros)',
    world_elevation: 'Elevação Global do Terreno',
    campaign_maker: 'Criador de Campanhas (Campaign Maker)',
    playtest: 'Testar Cenário (Playtest 3D)',
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#d4af37]/35 bg-[#0e131d] text-[#f1f5f9] shadow-[0_24px_72px_rgba(0,0,0,0.85)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#131926] px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-wide text-[#f3d27a]">
            {modalTitleMap[activeModal]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-[#1a2234] p-1.5 text-[#cbd5e1] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeModal === 'new_map' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Nome do Cenário</label>
                  <input
                    type="text"
                    value={newMapTitle}
                    onChange={(e) => setNewMapTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#090d16] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Mapa Base (Em Branco ou 31 Mapas Aleatórios)</label>
                  <select
                    value={newMapBase}
                    onChange={(e) => setNewMapBase(e.target.value as MapId | 'blank_grass')}
                    className="w-full rounded-lg border border-white/15 bg-[#090d16] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="blank_grass">Tela em Branco (Terreno Gramado Plano)</option>
                    {(Object.values(MAPS) as typeof MAPS[MapId][]).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.biomeLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Tamanho do Mapa</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['normal', 'large', 'giant'] as WorldSizeId[]).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setNewMapSize(sz)}
                        className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold cursor-pointer ${
                          newMapSize === sz
                            ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f3d27a]'
                            : 'border-white/10 bg-[#090d16] text-[#94a3b8] hover:text-white'
                        }`}
                      >
                        <div>{WORLD_SIZE_SPECS[sz].label}</div>
                        <div className="font-mono text-[10px] opacity-80">{WORLD_SIZE_SPECS[sz].dimsLabel}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Jogadores ({newMapPlayers})</label>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={newMapPlayers}
                    onChange={(e) => setNewMapPlayers(Number(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                  <div className="mt-1 flex justify-between text-[11px] font-mono text-[#94a3b8]">
                    <span>2</span>
                    <span className="text-[#f3d27a] font-bold">{newMapPlayers} jogadores</span>
                    <span>12</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Semente (Seed)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={newMapSeed}
                      onChange={(e) => setNewMapSeed(Number(e.target.value) || 1)}
                      className="w-full rounded-lg border border-white/15 bg-[#090d16] px-3 py-2 font-mono text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setNewMapSeed(Math.floor(1000 + Math.random() * 89999))}
                      className="rounded-lg border border-white/15 bg-[#1a2234] px-2.5 text-xs text-[#cbd5e1] hover:text-white cursor-pointer"
                    >
                      Aleat.
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/15 bg-[#161e2e] px-4 py-2 text-xs font-semibold text-[#cbd5e1] hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onGenerateNewMap({
                      baseMapId: newMapBase,
                      worldSize: newMapSize,
                      seed: newMapSeed,
                      maxPlayers: newMapPlayers,
                      title: newMapTitle.trim() || 'Novo Cenário',
                    });
                    onClose();
                  }}
                  className="rounded-lg bg-[#d4af37] px-5 py-2 text-xs font-bold text-[#0b0f18] hover:bg-[#e5c14d] cursor-pointer"
                >
                  Gerar Novo Mapa 3D
                </button>
              </div>
            </div>
          )}

          {activeModal === 'save_load' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#131926] p-3">
                <div>
                  <div className="text-xs font-bold text-[#f3d27a]">{doc.title}</div>
                  <div className="text-[11px] text-[#94a3b8]">
                    {WORLD_SIZE_SPECS[doc.worldSize].label} ({doc.widthMeters}×{doc.depthMeters}m) · {doc.objects.length} objetos · {doc.maxPlayers} jogadores
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSaveScenario();
                      setSavedList(loadSavedScenarios());
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-[#d4af37] px-3 py-1.5 text-xs font-bold text-[#0b0f18] hover:bg-[#e5c14d] cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Salvar Local</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#1b2436] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#243047] cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Exportar .json</span>
                  </button>
                  <label className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#1b2436] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#243047] cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Importar .json</span>
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#cbd5e1]">Cenários Salvos ({savedList.length})</div>
                {savedList.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-[#0a0e17] p-6 text-center text-xs text-[#94a3b8]">
                    Nenhum cenário salvo ainda. Clique em "Salvar Local" acima para gravar este mapa.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedList.map((scn) => (
                      <div key={scn.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#121826] p-3">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold text-[#f3d27a]">{scn.title}</div>
                          <div className="text-[10px] text-[#94a3b8]">
                            {WORLD_SIZE_SPECS[scn.worldSize].label} · {scn.objects.length} objs · {scn.maxPlayers} jog.
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadScenario(scn);
                              onClose();
                            }}
                            className="rounded-md bg-sky-500/20 border border-sky-400/40 px-2.5 py-1 text-[11px] font-semibold text-sky-200 hover:bg-sky-500/30 cursor-pointer"
                          >
                            <FolderOpen className="h-3.5 w-3.5 inline mr-1" />
                            Abrir
                          </button>
                          <button
                            type="button"
                            onClick={() => setSavedList(deleteScenarioFromStorage(scn.id))}
                            className="rounded-md border border-red-400/30 bg-red-500/15 p-1 text-red-300 hover:bg-red-500/25 cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModal === 'player_data' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {doc.players.map((p) => (
                  <button
                    key={p.slot}
                    type="button"
                    onClick={() => setActivePlayerTab(p.slot)}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                      activePlayerTab === p.slot
                        ? 'border-[#d4af37] bg-[#d4af37]/20 text-white'
                        : 'border-white/10 bg-[#0b0f18] text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.colorHex }} />
                    <span>P{p.slot}</span>
                  </button>
                ))}
              </div>

              {activePlayer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-white/10 bg-[#121826] p-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Nome do Jogador</label>
                    <input
                      type="text"
                      value={activePlayer.name}
                      onChange={(e) =>
                        onUpdateDoc((prev) => ({
                          ...prev,
                          players: prev.players.map((pl) =>
                            pl.slot === activePlayer.slot ? { ...pl, name: e.target.value } : pl
                          ),
                        }))
                      }
                      className="w-full rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Cor do Jogador</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PLAYER_COLORS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() =>
                            onUpdateDoc((prev) => ({
                              ...prev,
                              players: prev.players.map((pl) =>
                                pl.slot === activePlayer.slot ? { ...pl, colorHex: hex } : pl
                              ),
                            }))
                          }
                          className={`h-6 w-6 rounded border cursor-pointer ${
                            activePlayer.colorHex === hex ? 'border-white scale-110' : 'border-white/20'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Panteão & Deus Maior</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={activePlayer.pantheon}
                        onChange={(e) => {
                          const pant = e.target.value as PantheonId;
                          const deity = MAJOR_GODS_SIMPLE[pant]?.[0] ?? PANTHEONS[pant].deity;
                          onUpdateDoc((prev) => ({
                            ...prev,
                            players: prev.players.map((pl) =>
                              pl.slot === activePlayer.slot ? { ...pl, pantheon: pant, majorGod: deity } : pl
                            ),
                          }));
                        }}
                        className="rounded border border-white/15 bg-[#090d16] px-2 py-1.5 text-xs text-white"
                      >
                        {Object.values(PANTHEONS).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={activePlayer.majorGod}
                        onChange={(e) =>
                          onUpdateDoc((prev) => ({
                            ...prev,
                            players: prev.players.map((pl) =>
                              pl.slot === activePlayer.slot ? { ...pl, majorGod: e.target.value } : pl
                            ),
                          }))
                        }
                        className="rounded border border-white/15 bg-[#090d16] px-2 py-1.5 text-xs text-white"
                      >
                        {(MAJOR_GODS_SIMPLE[activePlayer.pantheon] ?? [PANTHEONS[activePlayer.pantheon].deity]).map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">
                      Controle, Visibilidade & Script de IA
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <select
                        value={activePlayer.control}
                        onChange={(e) =>
                          onUpdateDoc((prev) => ({
                            ...prev,
                            players: prev.players.map((pl) =>
                              pl.slot === activePlayer.slot
                                ? { ...pl, control: e.target.value as 'human' | 'ai' | 'none' }
                                : pl
                            ),
                          }))
                        }
                        className="rounded border border-white/15 bg-[#090d16] px-2 py-1.5 text-xs text-white"
                      >
                        <option value="human">Humano</option>
                        <option value="ai">IA</option>
                        <option value="none">Nenhum</option>
                      </select>
                      <select
                        value={activePlayer.visibility}
                        onChange={(e) =>
                          onUpdateDoc((prev) => ({
                            ...prev,
                            players: prev.players.map((pl) =>
                              pl.slot === activePlayer.slot
                                ? { ...pl, visibility: e.target.value as 'normal' | 'hidden' }
                                : pl
                            ),
                          }))
                        }
                        className="rounded border border-white/15 bg-[#090d16] px-2 py-1.5 text-xs text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="hidden">Oculto</option>
                      </select>
                      <select
                        value={activePlayer.aiFile}
                        onChange={(e) =>
                          onUpdateDoc((prev) => ({
                            ...prev,
                            players: prev.players.map((pl) =>
                              pl.slot === activePlayer.slot
                                ? { ...pl, aiFile: e.target.value as typeof activePlayer.aiFile }
                                : pl
                            ),
                          }))
                        }
                        className="rounded border border-white/15 bg-[#090d16] px-2 py-1.5 text-xs text-white"
                      >
                        {(['Standard', 'Aggressive', 'Defensive', 'Boomer', 'Naval', 'Passive'] as const).map((ai) => (
                          <option key={ai} value={ai}>
                            {ai}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Retold Native Starting Age + Minor Gods */}
                  <div className="md:col-span-2 rounded-lg border border-[#d4af37]/30 bg-[#0b101b] p-3 space-y-2">
                    <div className="text-xs font-bold text-[#f3d27a]">
                      Era Inicial & Deuses Menores (Recurso Retold)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#94a3b8] mb-1">Era Inicial</label>
                        <select
                          value={activePlayer.startingAge}
                          onChange={(e) =>
                            onUpdateDoc((prev) => ({
                              ...prev,
                              players: prev.players.map((pl) =>
                                pl.slot === activePlayer.slot
                                  ? { ...pl, startingAge: Number(e.target.value) as AgeLevel }
                                  : pl
                              ),
                            }))
                          }
                          className="w-full rounded border border-white/15 bg-[#090d16] px-2 py-1.5 text-xs text-white"
                        >
                          {([1, 2, 3, 4, 5] as AgeLevel[]).map((a) => (
                            <option key={a} value={a}>
                              {AGE_NAMES[a]}
                            </option>
                          ))}
                        </select>
                      </div>
                      {([2, 3, 4] as const).map((ageTier) => {
                        const field = ageTier === 2 ? 'minorGodAge2' : ageTier === 3 ? 'minorGodAge3' : 'minorGodAge4';
                        return (
                          <div key={ageTier}>
                            <label className="block text-[10px] text-[#94a3b8] mb-1">Deus Menor (Era {ageTier})</label>
                            <select
                              value={activePlayer[field]}
                              disabled={activePlayer.startingAge < ageTier}
                              onChange={(e) =>
                                onUpdateDoc((prev) => ({
                                  ...prev,
                                  players: prev.players.map((pl) =>
                                    pl.slot === activePlayer.slot ? { ...pl, [field]: e.target.value } : pl
                                  ),
                                }))
                              }
                              className="w-full rounded border border-white/15 bg-[#090d16] px-2 py-1.5 text-xs text-white disabled:opacity-40"
                            >
                              {MINOR_GODS_POOL[ageTier].map((mg) => (
                                <option key={mg} value={mg}>
                                  {mg}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Starting Resources & Pop */}
                  <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['food', 'wood', 'gold', 'favor'] as const).map((res) => (
                      <div key={res}>
                        <label className="block text-[10px] uppercase text-[#94a3b8] mb-1">
                          {res === 'food' ? 'Alimento' : res === 'wood' ? 'Madeira' : res === 'gold' ? 'Ouro' : 'Favor'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={99999}
                          value={activePlayer.resources[res]}
                          onChange={(e) =>
                            onUpdateDoc((prev) => ({
                              ...prev,
                              players: prev.players.map((pl) =>
                                pl.slot === activePlayer.slot
                                  ? { ...pl, resources: { ...pl.resources, [res]: Math.max(0, Number(e.target.value) || 0) } }
                                  : pl
                              ),
                            }))
                          }
                          className="w-full rounded border border-white/15 bg-[#090d16] px-2 py-1.5 font-mono text-xs text-white"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[10px] uppercase text-[#94a3b8] mb-1">Pop. Inicial</label>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={activePlayer.startingPop}
                        onChange={(e) =>
                          onUpdateDoc((prev) => ({
                            ...prev,
                            players: prev.players.map((pl) =>
                              pl.slot === activePlayer.slot ? { ...pl, startingPop: Math.max(0, Number(e.target.value) || 0) } : pl
                            ),
                          }))
                        }
                        className="w-full rounded border border-white/15 bg-[#090d16] px-2 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeModal === 'diplomacy' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#cbd5e1]">
                <span>Clique nas células para alternar a postura diplomática da linha (Jogador) em relação à coluna:</span>
                <div className="flex items-center gap-3 font-semibold">
                  <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" /> Aliado</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-slate-200" /> Neutro</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-red-500" /> Inimigo</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center font-mono text-[11px]">
                  <thead>
                    <tr>
                      <th className="p-1.5 text-left text-[#94a3b8]">De \ Para</th>
                      {Array.from({ length: doc.maxPlayers }, (_, i) => i + 1).map((col) => (
                        <th key={col} className="p-1.5 text-[#f3d27a]">P{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: doc.maxPlayers }, (_, i) => i + 1).map((row) => (
                      <tr key={row} className="border-t border-white/10">
                        <td className="p-1.5 text-left font-bold text-white whitespace-nowrap">
                          <span className="inline-block h-2.5 w-2.5 rounded-sm mr-1.5" style={{ backgroundColor: PLAYER_COLORS[row - 1] }} />
                          P{row}
                        </td>
                        {Array.from({ length: doc.maxPlayers }, (_, j) => j + 1).map((col) => {
                          const st = doc.diplomacy[`${row}_${col}`] ?? (row === col ? 'ally' : 'enemy');
                          const bg =
                            row === col
                              ? 'bg-[#1a2234] text-[#64748b] cursor-default'
                              : st === 'ally'
                              ? 'bg-emerald-500/85 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer'
                              : st === 'neutral'
                              ? 'bg-slate-200 text-slate-950 font-bold hover:bg-white cursor-pointer'
                              : 'bg-red-500/85 text-white font-bold hover:bg-red-400 cursor-pointer';
                          return (
                            <td key={col} className="p-1">
                              <button
                                type="button"
                                disabled={row === col}
                                onClick={() => cycleDiplomacy(row, col)}
                                className={`h-7 w-full min-w-[44px] rounded text-[10px] transition ${bg}`}
                              >
                                {row === col ? '—' : st === 'ally' ? 'Aliado' : st === 'neutral' ? 'Neutro' : 'Inimigo'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModal === 'scenario_data' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Título do Cenário</label>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => onUpdateDoc((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Autor</label>
                <input
                  type="text"
                  value={doc.author}
                  onChange={(e) => onUpdateDoc((p) => ({ ...p, author: e.target.value }))}
                  className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={doc.description}
                  onChange={(e) => onUpdateDoc((p) => ({ ...p, description: e.target.value }))}
                  className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Máximo de Jogadores (2–12)</label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={doc.maxPlayers}
                  onChange={(e) => onUpdateDoc((p) => ({ ...p, maxPlayers: Math.max(2, Math.min(12, Number(e.target.value) || 2)) }))}
                  className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 font-mono text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Limite de População</label>
                <input
                  type="number"
                  min={40}
                  max={500}
                  value={doc.populationLimit}
                  onChange={(e) => onUpdateDoc((p) => ({ ...p, populationLimit: Math.max(40, Math.min(500, Number(e.target.value) || 160)) }))}
                  className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 font-mono text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">População Bônus</label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={doc.bonusPopulation}
                  onChange={(e) => onUpdateDoc((p) => ({ ...p, bonusPopulation: Math.max(0, Number(e.target.value) || 0) }))}
                  className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 font-mono text-xs text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <input
                  id="stdVictory"
                  type="checkbox"
                  checked={doc.standardVictory}
                  onChange={(e) => onUpdateDoc((p) => ({ ...p, standardVictory: e.target.checked }))}
                  className="h-4 w-4 accent-[#d4af37]"
                />
                <label htmlFor="stdVictory" className="text-xs text-[#e2e8f0] cursor-pointer">
                  Ativar Condições Padrão de Vitória (Supremacia / Maravilha)
                </label>
              </div>
            </div>
          )}

          {activeModal === 'scenario_summary' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 bg-[#121826] p-3.5 space-y-2">
                <div className="text-xs font-bold text-[#f3d27a]">World Info (Mundo)</div>
                <div className="space-y-1 text-xs text-[#cbd5e1]">
                  <div className="flex justify-between"><span>Tamanho:</span><span className="font-mono text-white">{doc.widthMeters}×{doc.depthMeters}m</span></div>
                  <div className="flex justify-between"><span>Semente (Seed):</span><span className="font-mono text-white">{doc.seed}</span></div>
                  <div className="flex justify-between"><span>Terreno Dominante:</span><span className="text-emerald-300">{summary.domName}</span></div>
                  <div className="flex justify-between"><span>Elevação Min / Max:</span><span className="font-mono text-amber-300">{summary.minH}m / {summary.maxH}m</span></div>
                  <div className="flex justify-between"><span>Iluminação:</span><span className="text-sky-300">{doc.lightingId}</span></div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#121826] p-3.5 space-y-2">
                <div className="text-xs font-bold text-[#f3d27a]">Player Info (Jogadores)</div>
                <div className="space-y-1 text-xs text-[#cbd5e1] max-h-44 overflow-y-auto">
                  {doc.players.slice(0, doc.maxPlayers).map((p) => (
                    <div key={p.slot} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1">
                      <span className="truncate"><span className="inline-block h-2 w-2 rounded-sm mr-1.5" style={{ backgroundColor: p.colorHex }} />{p.name}</span>
                      <span className="font-mono text-[10px] text-[#94a3b8]">Era {p.startingAge} · {p.control.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#121826] p-3.5 space-y-2">
                <div className="text-xs font-bold text-[#f3d27a]">Misc Info (Recursos & Objetos)</div>
                <div className="space-y-1 text-xs text-[#cbd5e1]">
                  <div className="flex justify-between"><span>Unidades / Prédios:</span><span className="font-mono text-white">{summary.units} / {summary.buildings}</span></div>
                  <div className="flex justify-between"><span>Árvores (~Madeira):</span><span className="font-mono text-emerald-300">{summary.trees} ({summary.totalWood})</span></div>
                  <div className="flex justify-between"><span>Minas (~Ouro):</span><span className="font-mono text-amber-300">{summary.goldMines} ({summary.totalGold})</span></div>
                  <div className="flex justify-between"><span>Frutas & Fauna (~Comida):</span><span className="font-mono text-sky-300">{summary.berries + summary.fauna} ({summary.totalFood})</span></div>
                  <div className="flex justify-between"><span>Relíquias Sagradas:</span><span className="font-mono text-[#f3d27a]">{summary.relics}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'objectives' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-lg border border-white/10 bg-[#121826] p-3">
                <input
                  type="text"
                  placeholder="Título do objetivo / dica / SL..."
                  value={newObjTitle}
                  onChange={(e) => setNewObjTitle(e.target.value)}
                  className="rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                />
                <select
                  value={newObjType}
                  onChange={(e) => setNewObjType(e.target.value as ScenarioObjectiveItem['type'])}
                  className="rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="primary">Objetivo Primário</option>
                  <option value="secondary">Objetivo Secundário</option>
                  <option value="hint">Dica (Hint)</option>
                  <option value="spotlight">Spotlight (SL)</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newObjTitle.trim()) return;
                    onUpdateDoc((p) => ({
                      ...p,
                      objectives: [
                        ...p.objectives,
                        {
                          id: `obj_${Date.now()}`,
                          title: newObjTitle.trim(),
                          description: newObjDesc.trim() || newObjTitle.trim(),
                          type: newObjType,
                        },
                      ],
                    }));
                    setNewObjTitle('');
                    setNewObjDesc('');
                  }}
                  className="flex items-center justify-center gap-1 rounded bg-[#d4af37] px-3 py-1.5 text-xs font-bold text-[#0b0f18] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar</span>
                </button>
                <textarea
                  rows={2}
                  placeholder="Texto detalhado exibido ao jogador..."
                  value={newObjDesc}
                  onChange={(e) => setNewObjDesc(e.target.value)}
                  className="md:col-span-3 rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                {doc.objectives.map((o) => (
                  <div key={o.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-[#121826] p-3">
                    <div>
                      <div className="text-xs font-bold text-[#f3d27a]">
                        [{o.type === 'spotlight' ? 'SL' : o.type.toUpperCase()}] {o.title}
                      </div>
                      <div className="mt-0.5 text-xs text-[#cbd5e1]">{o.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateDoc((p) => ({
                          ...p,
                          objectives: p.objectives.filter((x) => x.id !== o.id),
                        }))
                      }
                      className="rounded border border-red-400/30 bg-red-500/15 p-1 text-red-300 hover:bg-red-500/25 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Gatilhos de Cenário (Executados em Tempo Real no Playtest) */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Gatilhos de Cenário ({(doc.triggers ?? []).length}) — Ativos no Playtest
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-lg border border-white/10 bg-[#121826] p-3">
                  <input
                    type="text"
                    placeholder="Nome do gatilho..."
                    value={newTrigName}
                    onChange={(e) => setNewTrigName(e.target.value)}
                    className="rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  />
                  <select
                    value={newTrigCond}
                    onChange={(e) => setNewTrigCond(e.target.value as ScenarioTriggerConditionType)}
                    className="rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="timer_elapsed">Tempo Decorrido (s)</option>
                    <option value="player_unit_count_gte">Tropas do Jogador &gt;=</option>
                    <option value="resources_gold_gte">Ouro do Jogador &gt;=</option>
                    <option value="enemy_buildings_destroyed">Prédios Inimigos Destruídos</option>
                    <option value="enemy_defeated">Inimigo Eliminado</option>
                    <option value="area_entered">Unidade no Centro do Mapa</option>
                  </select>
                  <select
                    value={newTrigEff}
                    onChange={(e) => setNewTrigEff(e.target.value as ScenarioTriggerEffectType)}
                    className="rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="spawn_reinforcements">Criar Reforços (4 Hoplitas)</option>
                    <option value="grant_resources">Conceder Recursos (+250)</option>
                    <option value="announcement">Exibir Anúncio / Mensagem</option>
                    <option value="reveal_map">Revelar Mapa Completo</option>
                    <option value="victory">Disparar Vitória</option>
                    <option value="defeat">Disparar Derrota</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={newTrigVal}
                    onChange={(e) => setNewTrigVal(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="Valor (s / qtd)"
                    className="rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Mensagem exibida ao disparar..."
                    value={newTrigMsg}
                    onChange={(e) => setNewTrigMsg(e.target.value)}
                    className="md:col-span-3 rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const title = newTrigName.trim() || `Gatilho #${(doc.triggers ?? []).length + 1}`;
                      onUpdateDoc((p) => ({
                        ...p,
                        triggers: [
                          ...(p.triggers ?? []),
                          {
                            id: `trig_${Date.now()}`,
                            name: title,
                            active: true,
                            loop: false,
                            conditionType: newTrigCond,
                            conditionValue: newTrigVal,
                            effectType: newTrigEff,
                            effectAmount: newTrigEff === 'spawn_reinforcements' ? 4 : 250,
                            effectMessage: newTrigMsg.trim() || undefined,
                          },
                        ],
                      }));
                      setNewTrigName('');
                      setNewTrigMsg('');
                    }}
                    className="flex items-center justify-center gap-1 rounded bg-amber-500 px-3 py-1.5 text-xs font-bold text-[#0b0f18] cursor-pointer hover:bg-amber-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Criar Gatilho</span>
                  </button>
                </div>

                {(doc.triggers ?? []).length === 0 ? (
                  <div className="rounded-lg border border-white/8 bg-[#0b101b] p-3 text-xs text-[#94a3b8]">
                    Nenhum gatilho personalizado criado. Ao testar o cenário, gatilhos automáticos de briefing, suprimentos e cinemática de abertura são ativados.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(doc.triggers ?? []).map((tr) => (
                      <div key={tr.id} className="flex items-center justify-between gap-3 rounded-lg border border-amber-400/20 bg-[#121826] p-2.5">
                        <div className="text-xs">
                          <span className="font-bold text-amber-200">{tr.name}</span>
                          <span className="ml-2 font-mono text-[10px] text-[#94a3b8]">
                            SE {tr.conditionType} ({tr.conditionValue}) → {tr.effectType}
                          </span>
                          {tr.effectMessage && (
                            <div className="text-[11px] text-[#cbd5e1] mt-0.5">&ldquo;{tr.effectMessage}&rdquo;</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateDoc((p) => ({
                              ...p,
                              triggers: (p.triggers ?? []).filter((x) => x.id !== tr.id),
                            }))
                          }
                          className="rounded border border-red-400/30 bg-red-500/15 p-1 text-red-300 hover:bg-red-500/25 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModal === 'forbidden_units' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-semibold text-[#cbd5e1]">Jogador (1–12):</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={forbiddenSlot}
                  onChange={(e) => setForbiddenSlot(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                  className="w-20 rounded border border-white/15 bg-[#090d16] px-2.5 py-1 font-mono text-xs text-white"
                />
                <span className="text-xs text-[#94a3b8]">
                  Proibidos para P{forbiddenSlot}: {(doc.forbiddenByPlayer[forbiddenSlot] ?? []).length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-[#121826] p-3">
                  <div className="mb-2 text-xs font-bold text-[#f3d27a]">Unidades</div>
                  <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                    {(Object.entries(UNIT_STATS) as [UnitKind, (typeof UNIT_STATS)[UnitKind]][]).map(([k, spec]) => {
                      const blocked = (doc.forbiddenByPlayer[forbiddenSlot] ?? []).includes(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => toggleForbidden(forbiddenSlot, k)}
                          className={`rounded border px-2 py-1 text-left text-[11px] truncate cursor-pointer ${
                            blocked
                              ? 'border-red-400/60 bg-red-500/20 text-red-200 line-through'
                              : 'border-white/10 bg-[#090d16] text-[#cbd5e1] hover:text-white'
                          }`}
                        >
                          {spec.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#121826] p-3">
                  <div className="mb-2 text-xs font-bold text-[#f3d27a]">Construções</div>
                  <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                    {(Object.entries(BUILDING_STATS) as [BuildingKind, (typeof BUILDING_STATS)[BuildingKind]][]).map(([k, spec]) => {
                      const blocked = (doc.forbiddenByPlayer[forbiddenSlot] ?? []).includes(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => toggleForbidden(forbiddenSlot, k)}
                          className={`rounded border px-2 py-1 text-left text-[11px] truncate cursor-pointer ${
                            blocked
                              ? 'border-red-400/60 bg-red-500/20 text-red-200 line-through'
                              : 'border-white/10 bg-[#090d16] text-[#cbd5e1] hover:text-white'
                          }`}
                        >
                          {spec.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'world_lighting' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#121826] p-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.skyBoxEnabled}
                    onChange={(e) => onUpdateDoc((p) => ({ ...p, skyBoxEnabled: e.target.checked }))}
                    className="h-4 w-4 accent-[#d4af37]"
                  />
                  <span>Ativar SkyBox (Céu Atmosférico)</span>
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Azimute (Y / Shift+Y):</span>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={Math.round(doc.sunAzimuthDeg)}
                      onChange={(e) => onUpdateDoc((p) => ({ ...p, sunAzimuthDeg: Number(e.target.value) }))}
                      className="w-28 accent-[#d4af37]"
                    />
                    <span className="font-mono w-10">{Math.round(doc.sunAzimuthDeg)}°</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
                {SCENARIO_LIGHTING_PRESETS.map((preset) => {
                  const active = doc.lightingId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onUpdateDoc((p) => ({
                          ...p,
                          lightingId: preset.id,
                          sunAzimuthDeg: preset.sunAzimuthDeg,
                          sunElevationDeg: preset.sunElevationDeg,
                        }))
                      }
                      className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition cursor-pointer ${
                        active
                          ? 'border-[#d4af37] bg-[#d4af37]/20 text-white'
                          : 'border-white/10 bg-[#121826] text-[#cbd5e1] hover:border-white/25'
                      }`}
                    >
                      <div
                        className="mb-1.5 h-4 w-full rounded"
                        style={{
                          background: `linear-gradient(90deg, ${preset.skyTopHex}, ${preset.skyHorizonHex})`,
                        }}
                      />
                      <span className="text-[11px] font-bold truncate w-full">{doc.skyBoxEnabled ? `SkyBox ${preset.id}` : preset.id}</span>
                      <span className="text-[10px] text-[#94a3b8] truncate w-full">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeModal === 'world_size' && (
            <div className="space-y-4">
              <p className="text-xs text-[#cbd5e1]">
                Ajuste o comprimento lateral do mapa em metros sem apagar o terreno nem os objetos posicionados.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Largura (X) em metros</label>
                  <input
                    type="number"
                    min={100}
                    max={360}
                    step={8}
                    value={resizeW}
                    onChange={(e) => setResizeW(Math.max(100, Math.min(360, Number(e.target.value) || 148)))}
                    className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Profundidade (Z) em metros</label>
                  <input
                    type="number"
                    min={100}
                    max={360}
                    step={8}
                    value={resizeD}
                    onChange={(e) => setResizeD(Math.max(100, Math.min(360, Number(e.target.value) || 148)))}
                    className="w-full rounded border border-white/15 bg-[#090d16] px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResizeMapSides(resizeW, resizeD);
                    onClose();
                  }}
                  className="rounded-lg bg-[#d4af37] px-4 py-2 text-xs font-bold text-[#0b0f18] cursor-pointer"
                >
                  Aplicar Dimensões ({resizeW}×{resizeD}m)
                </button>
              </div>
            </div>
          )}

          {activeModal === 'world_elevation' && (
            <div className="space-y-4">
              <p className="text-xs text-[#cbd5e1]">
                Eleva ou rebaixa toda a malha do terreno de uma só vez. Deslocamento atual:{' '}
                <span className="font-mono text-amber-300">{doc.globalElevationOffset.toFixed(2)}m</span>
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step={0.25}
                  value={elevDelta}
                  onChange={(e) => setElevDelta(Number(e.target.value) || 0)}
                  className="w-28 rounded border border-white/15 bg-[#090d16] px-3 py-2 font-mono text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => onApplyGlobalElevation(Math.abs(elevDelta))}
                  className="rounded-lg bg-emerald-500/25 border border-emerald-400/40 px-4 py-2 text-xs font-bold text-emerald-200 cursor-pointer"
                >
                  Elevar (+{Math.abs(elevDelta)}m)
                </button>
                <button
                  type="button"
                  onClick={() => onApplyGlobalElevation(-Math.abs(elevDelta))}
                  className="rounded-lg bg-amber-500/25 border border-amber-400/40 px-4 py-2 text-xs font-bold text-amber-200 cursor-pointer"
                >
                  Rebaixar (-{Math.abs(elevDelta)}m)
                </button>
              </div>
            </div>
          )}

          {activeModal === 'campaign_maker' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-white/10 bg-[#121826] p-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Título da Campanha</label>
                  <input
                    type="text"
                    value={campTitle}
                    onChange={(e) => setCampTitle(e.target.value)}
                    className="w-full rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Fundo / Capa Temática</label>
                  <select
                    value={campCover}
                    onChange={(e) => setCampCover(e.target.value as CustomCampaignDocument['coverTheme'])}
                    className="w-full rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="olympus">Monte Olimpo (Dourado & Mármore)</option>
                    <option value="egypt">Vale do Nilo (Areia & Sol)</option>
                    <option value="norse">Midgard Glacial (Aurora)</option>
                    <option value="atlantis">Atlântida (Oceano Profundo)</option>
                    <option value="erebus">Submundo de Hades (Brasas)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Sinopse da Campanha</label>
                  <input
                    type="text"
                    value={campDesc}
                    onChange={(e) => setCampDesc(e.target.value)}
                    className="w-full rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Cinemática de Abertura (Texto Introdutório)</label>
                  <textarea
                    rows={2}
                    value={campIntro}
                    onChange={(e) => setCampIntro(e.target.value)}
                    className="w-full rounded border border-white/15 bg-[#090d16] px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="text-[11px] font-semibold text-[#cbd5e1] mb-1">
                    Selecionar Cenários Salvos na Ordem ({campScenarios.length} selecionados)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {savedList.length === 0 ? (
                      <span className="text-[11px] text-[#94a3b8]">Salve ao menos um cenário antes para adicioná-lo à campanha.</span>
                    ) : (
                      savedList.map((scn) => {
                        const included = campScenarios.includes(scn.id);
                        return (
                          <button
                            key={scn.id}
                            type="button"
                            onClick={() =>
                              setCampScenarios((prev) =>
                                prev.includes(scn.id) ? prev.filter((x) => x !== scn.id) : [...prev, scn.id]
                              )
                            }
                            className={`rounded border px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                              included
                                ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f3d27a]'
                                : 'border-white/10 bg-[#090d16] text-[#94a3b8] hover:text-white'
                            }`}
                          >
                            {included ? '✓ ' : '+ '}
                            {scn.title}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const next = saveCustomCampaignToStorage({
                        id: `camp_${Date.now()}`,
                        title: campTitle.trim() || 'Nova Campanha',
                        description: campDesc.trim(),
                        introCinematicText: campIntro.trim(),
                        coverTheme: campCover,
                        scenarioIds: campScenarios.length > 0 ? campScenarios : [doc.id],
                        updatedAt: new Date().toISOString(),
                      });
                      setCampaigns(next);
                    }}
                    className="rounded-lg bg-[#d4af37] px-4 py-1.5 text-xs font-bold text-[#0b0f18] cursor-pointer"
                  >
                    Salvar Campanha Personalizada
                  </button>
                </div>
              </div>

              {campaigns.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#f3d27a]">Campanhas Criadas ({campaigns.length})</div>
                  {campaigns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121826] p-3">
                      <div>
                        <div className="text-xs font-bold text-white">{c.title}</div>
                        <div className="text-[11px] text-[#94a3b8]">
                          {c.description} · {c.scenarioIds.length} missão(ões)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const firstScn = savedList.find((s) => s.id === c.scenarioIds[0]) ?? doc;
                          onPlaytest(1, 'normal', firstScn);
                        }}
                        className="flex items-center gap-1 rounded bg-emerald-500/25 border border-emerald-400/40 px-3 py-1.5 text-xs font-bold text-emerald-200 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Jogar Campanha</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeModal === 'playtest' && (
            <div className="space-y-4">
              <p className="text-xs text-[#cbd5e1]">
                Inicie o cenário diretamente no motor de jogo 3D com o terreno esculpido, água, unidades, construções, recursos, era inicial e objetivos configurados.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Jogar Como Jogador</label>
                  <select
                    value={playtestSlot}
                    onChange={(e) => setPlaytestSlot(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-[#090d16] px-3 py-2 text-xs text-white"
                  >
                    {doc.players.slice(0, doc.maxPlayers).map((p) => (
                      <option key={p.slot} value={p.slot}>
                        P{p.slot} — {p.name} ({PANTHEONS[p.pantheon].name} · Era {p.startingAge})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Dificuldade da IA</label>
                  <select
                    value={playtestDiff}
                    onChange={(e) => setPlaytestDiff(e.target.value as DifficultyId)}
                    className="w-full rounded-lg border border-white/15 bg-[#090d16] px-3 py-2 text-xs text-white"
                  >
                    <option value="easy">Fácil</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difícil</option>
                    <option value="titan">Titã</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/15 bg-[#161e2e] px-4 py-2 text-xs font-semibold text-[#cbd5e1] cursor-pointer"
                >
                  Voltar ao Editor
                </button>
                <button
                  type="button"
                  onClick={() => onPlaytest(playtestSlot, playtestDiff)}
                  className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-5 py-2 text-xs font-bold text-[#0b0f18] hover:bg-[#e5c14d] cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                  <span>Iniciar Playtest 3D</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
