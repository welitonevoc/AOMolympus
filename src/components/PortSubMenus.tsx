import { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  Compass,
  Eye,
  EyeOff,
  Film,
  Gamepad2,
  Globe,
  HardDrive,
  History,
  Info,
  Keyboard,
  Map as MapIcon,
  Network,
  Play,
  Plus,
  RefreshCw,
  Save,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Trash2,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import {
  CAMPAIGN_BOOKS,
  CUSTOM_SCENARIOS,
  HOTKEYS_LIST,
  loadCampaignProgress,
  loadProfilesFromStorage,
  loadRecordedMatches,
  PortMenuState,
  RecordedMatchRecord,
  saveProfilesToStorage,
} from '../game/menuData';
import {
  GOD_POWERS,
  TECH_SPECS,
  getCivBuildingSpec,
  getCivGodPowerSpec,
  getCivUnitSpec,
} from '../game/divineData';
import {
  AGE_NAMES,
  AgeLevel,
  AoMScaleProfile,
  AOM_SCALE_PROFILES,
  BuildingKind,
  DifficultyId,
  GameOptionsConfig,
  GameTypeId,
  MapConfig,
  MapId,
  MAPS,
  MatchStartOptions,
  PANTHEONS,
  PantheonId,
  TechId,
  UnitKind,
  VisibilityMode,
  WorldSizeId,
} from '../game/types';
import { EraIcon, getEraSubtitle } from './EraIcon';
import { MultiplayerOnlineHub } from './MultiplayerOnlineHub';
import { SkirmishSetupFlow } from './SkirmishSetupFlow';
import { TechIcon } from './TechIcon';

export interface SkirmishDraft {
  pantheon: PantheonId;
  minorGod: string;
  enemyPantheon: PantheonId;
  difficulty: DifficultyId;
  mapId: MapId;
  mapSize: 'small' | 'normal' | 'large';
  startingAge: AgeLevel;
  startingResources: 'standard' | 'high' | 'abundant';
  revealedMap: boolean;
  gameType: GameTypeId;
  visibilityMode: VisibilityMode;
  worldSize: WorldSizeId;
  dayNightCycle: boolean;
  titansEnabled: boolean;
  treatyMinutes: number;
}

interface PortSubMenusProps {
  menuState: PortMenuState;
  setMenuState: (s: PortMenuState) => void;
  options: GameOptionsConfig;
  onUpdateOptions: (next: GameOptionsConfig) => void;
  skirmish: SkirmishDraft;
  onUpdateSkirmish: (next: SkirmishDraft) => void;
  hasSavedMatch: boolean;
  onStartMatch: (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    extras?: MatchStartOptions
  ) => void;
  onLoadSavedMatch: () => void;
  onDeleteSavedMatch: () => void;
  onBackToMain: () => void;
}

const DIFFICULTIES: { id: DifficultyId; label: string; desc: string }[] = [
  { id: 'easy', label: 'Fácil', desc: 'IA mais passiva, ideal para aprender civilizações.' },
  { id: 'normal', label: 'Normal', desc: 'Ritmo equilibrado para explorar, construir e expandir.' },
  { id: 'hard', label: 'Difícil', desc: 'Inimigo fortifica torres e lança incursões mais cedo.' },
  { id: 'titan', label: 'Titã', desc: 'Economia inimiga acelerada e cercos mitológicos intensos.' },
];

export function PortSubMenus({
  menuState,
  setMenuState,
  options,
  onUpdateOptions,
  skirmish,
  onUpdateSkirmish,
  hasSavedMatch,
  onStartMatch,
  onLoadSavedMatch,
  onDeleteSavedMatch,
  onBackToMain,
}: PortSubMenusProps) {
  const [selectedBookId, setSelectedBookId] = useState<'trident' | 'titans'>('trident');
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(1); // Omens default
  const [campaignDiff, setCampaignDiff] = useState<DifficultyId>('normal');
  const [campaignProgress] = useState(() => loadCampaignProgress());

  const [profiles, setProfiles] = useState<string[]>(() => loadProfilesFromStorage());
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(options.playerName);

  const [recordedMatches] = useState<RecordedMatchRecord[]>(() => loadRecordedMatches());
  const [selectedRecordedIdx, setSelectedRecordedIdx] = useState(0);
  const [selectedCustomScnIdx, setSelectedCustomScnIdx] = useState(0);
  const [editorMap, setEditorMap] = useState<MapId>('mediterranean');
  const [editorPantheon, setEditorPantheon] = useState<PantheonId>('greek');
  const [historyCiv, setHistoryCiv] = useState<PantheonId>('greek');
  const [techTreeCiv, setTechTreeCiv] = useState<PantheonId>(skirmish.pantheon);
  const [updateCheckMsg, setUpdateCheckMsg] = useState<string | null>(null);
  const [musicTrackTick, setMusicTrackTick] = useState(0);
  const [mapFilter, setMapFilter] = useState<'all' | 'titans' | 'base' | 'bonus'>('all');

  const clickSound = () => {
    soundEngine.unlock();
    soundEngine.playSelect();
  };

  const navTo = (state: PortMenuState) => {
    clickSound();
    setMenuState(state);
  };

  const renderPanelHeader = (title: string, subtitle: string, backState?: PortMenuState) => (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4af37]/30 pb-3">
      <div>
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#f3d27a]">
          {title}
        </h2>
        <p className="text-xs text-[#9ca3af]">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {backState && (
          <button
            type="button"
            onClick={() => navTo(backState)}
            className="flex h-9 items-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#181e29] px-3.5 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] hover:bg-[#222a38] cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#e5c45e]" />
            <span>Voltar</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            clickSound();
            onBackToMain();
          }}
          className="flex h-9 items-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#181e29] px-3.5 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] hover:bg-[#222a38] cursor-pointer whitespace-nowrap"
        >
          <span>Menu Principal</span>
        </button>
      </div>
    </div>
  );

  const SPECIAL_RULE_LABELS: Record<NonNullable<MapConfig['specialRule']>, string> = {
    nomad: 'Nômade',
    megalopolis: 'Megalópole',
    sudden_death: 'Morte Súbita',
    koth_vault: 'Cofre Central',
    land_unknown: 'Aleatório',
    the_unknown: 'Aleatório',
    valley_guardians: 'Guardiões do Vale',
    sea_of_worms: 'Mar de Vermes',
  };

  const renderMapPicker = (
    selectedMapId: MapId,
    onSelectMap: (id: MapId) => void,
    compact = false
  ) => {
    const allMaps = Object.values(MAPS);
    const filteredMaps =
      mapFilter === 'all' ? allMaps : allMaps.filter((m) => m.expansion === mapFilter);
    const selectedCfg = MAPS[selectedMapId];
    const filterTabs: { id: 'all' | 'titans' | 'base' | 'bonus'; label: string }[] = [
      { id: 'all', label: `Todos (${allMaps.length})` },
      { id: 'titans', label: `The Titans (${allMaps.filter((m) => m.expansion === 'titans').length})` },
      { id: 'base', label: `Originais (${allMaps.filter((m) => m.expansion === 'base').length})` },
      { id: 'bonus', label: `Extras (${allMaps.filter((m) => m.expansion === 'bonus').length})` },
    ];

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-[#f3d27a]">
            <MapIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Mapa: {selectedCfg.name}</span>
            {selectedCfg.specialRule && (
              <span className="rounded border border-[#d4af37]/45 bg-[#1f2838] px-1.5 py-0.5 text-[10px] text-[#fde68a]">
                {SPECIAL_RULE_LABELS[selectedCfg.specialRule]}
              </span>
            )}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {filterTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  clickSound();
                  setMapFilter(t.id);
                }}
                className={`rounded border px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                  mapFilter === t.id
                    ? 'border-[#d4af37] bg-[#d4af37] text-[#0b0e14]'
                    : 'border-white/10 bg-[#0e131c] text-[#cbd5e1] hover:border-[#d4af37]/45'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-1.5 overflow-y-auto pr-1 ${
            compact
              ? 'grid-cols-2 sm:grid-cols-3 max-h-40'
              : 'grid-cols-2 sm:grid-cols-4 max-h-44'
          }`}
        >
          {filteredMaps.map((m) => {
            const active = selectedMapId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  clickSound();
                  onSelectMap(m.id);
                }}
                title={`${m.name} — ${m.biomeLabel} (${m.floraLabel} · ${m.faunaLabel})`}
                className={`flex items-center justify-between gap-1 rounded border px-2 py-1.5 text-left text-[11px] font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-[#d4af37] bg-[#1f2838] text-white font-semibold'
                    : 'border-white/8 bg-[#161c28] text-[#cbd5e1] hover:border-[#d4af37]/40'
                }`}
              >
                <span className="truncate">{m.name}</span>
                {m.expansion === 'titans' && (
                  <span className="shrink-0 text-[9px] font-bold text-[#38bdf8]">TT</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded border border-white/8 bg-[#0e131c] px-2.5 py-2 text-[11px] text-[#cbd5e1]">
          <div className="text-[#94a3b8] leading-snug">{selectedCfg.subtitle}</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[#e2e8f0]">
            <span><strong className="text-[#f3d27a]">Bioma:</strong> {selectedCfg.biomeLabel}</span>
            <span><strong className="text-[#86efac]">Flora:</strong> {selectedCfg.floraLabel}</span>
            <span><strong className="text-[#fdba74]">Fauna:</strong> {selectedCfg.faunaLabel}</span>
          </div>
        </div>
      </div>
    );
  };

  // ── 1. UI_CAMPAIGN (uicampaign.xmb) ──
  if (menuState === 'UI_CAMPAIGN') {
    const book = CAMPAIGN_BOOKS.find((b) => b.id === selectedBookId) ?? CAMPAIGN_BOOKS[0];
    const unlockedCount = Math.max(book.scenarios.length, campaignProgress[book.id] || 1);
    const activeScn = book.scenarios[selectedScenarioIdx] ?? book.scenarios[0];

    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader('CAMPANHA', 'Selecione o livro, cenário e dificuldade da missão')}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Campaign selector + Scenario list */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex gap-2">
              {CAMPAIGN_BOOKS.map((b) => {
                const active = b.id === book.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      clickSound();
                      setSelectedBookId(b.id);
                      setSelectedScenarioIdx(0);
                    }}
                    className={`flex-1 rounded border px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'border-[#f3d27a] bg-[#262f40] text-[#f3d27a]'
                        : 'border-white/10 bg-[#151a24] text-[#cbd5e1] hover:border-[#d4af37]/45'
                    }`}
                  >
                    <div className="font-display font-bold truncate">{b.title}</div>
                    <div className="text-[10px] text-[#9ca3af]">
                      {b.scenarios.length} cenários
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1 rounded border border-[#d4af37]/25 bg-[#121620] p-2 max-h-64 overflow-y-auto">
              {book.scenarios.map((scn, idx) => {
                const active = idx === selectedScenarioIdx;
                const unlocked = idx < unlockedCount;
                return (
                  <button
                    key={scn.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      clickSound();
                      setSelectedScenarioIdx(idx);
                    }}
                    className={`flex items-center justify-between gap-2 rounded px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#d4af37] text-[#0d1017] font-bold'
                        : unlocked
                        ? 'text-[#e6dfd1] hover:bg-[#1f2634]'
                        : 'text-[#64748b] cursor-not-allowed'
                    }`}
                  >
                    <span className="truncate">
                      {scn.index}. {scn.title}
                    </span>
                    <span className="text-[10px] opacity-80 shrink-0">{scn.region}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Regional map card + Briefing + Difficulty + Start */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4 rounded border border-[#d4af37]/25 bg-[#131822] p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e5c45e]">
                    {book.title} · Região: {activeScn.region}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#f8f4ea]">
                    {activeScn.index}. {activeScn.title}
                  </h3>
                </div>
                <span className="rounded border border-[#d4af37]/40 bg-[#1a202c] px-2.5 py-1 text-xs text-[#f3d27a]">
                  {PANTHEONS[activeScn.pantheon].name} ({PANTHEONS[activeScn.pantheon].deity}) ·{' '}
                  {MAPS[activeScn.mapId].name}
                </span>
              </div>

              <div className="rounded border border-white/10 bg-[#0f131b] p-3 text-xs leading-relaxed text-[#cbd5e1]">
                {activeScn.briefing}
              </div>

              <div>
                <div className="mb-1.5 text-xs font-semibold text-[#e6dfd1]">Dificuldade da Missão</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        clickSound();
                        setCampaignDiff(d.id);
                      }}
                      className={`rounded border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        campaignDiff === d.id
                          ? 'border-[#f3d27a] bg-[#262f40] text-[#f3d27a]'
                          : 'border-white/10 bg-[#161b26] text-[#cbd5e1] hover:border-[#d4af37]/45'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
              <span className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
                <span>Era Inicial:</span>
                <EraIcon age={activeScn.startingAge} pantheon={activeScn.pantheon} size={18} active />
                <strong className="text-[#f3efe6]">{AGE_NAMES[activeScn.startingAge]}</strong>
              </span>
              <button
                type="button"
                onClick={() =>
                  onStartMatch(
                    activeScn.pantheon,
                    campaignDiff,
                    activeScn.mapId,
                    Boolean(activeScn.revealedMap),
                    {
                      startingAge: activeScn.startingAge,
                      enemyPantheon: activeScn.enemyPantheon,
                      scenarioTitle: activeScn.title,
                      gameSpeed: options.gameSpeed,
                    }
                  )
                }
                className="flex h-11 items-center gap-2 rounded border border-[#f5d77f] bg-gradient-to-b from-[#e0bc56] via-[#c79e34] to-[#98721b] px-6 text-sm font-bold text-[#0d1017] hover:brightness-110 cursor-pointer whitespace-nowrap"
              >
                <Swords className="h-4 w-4" />
                <span>Iniciar Cenário</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2 & 3. UI_GOD_PICKER / UI_SINGLE_PLAYER_SETUP (Fluxo em 2 Etapas) ──
  if (menuState === 'UI_GOD_PICKER' || menuState === 'UI_SINGLE_PLAYER_SETUP') {
    return (
      <SkirmishSetupFlow
        key={menuState}
        initialStep="god"
        skirmish={skirmish}
        options={options}
        hasSavedMatch={hasSavedMatch}
        difficulties={DIFFICULTIES}
        onUpdateSkirmish={onUpdateSkirmish}
        onStartMatch={onStartMatch}
        onLoadSavedMatch={onLoadSavedMatch}
        onBackSubMenu={() => navTo('SUB_SINGLE_PLAYER')}
        onBackToMain={onBackToMain}
      />
    );
  }

  // ── 4. OPTIONS (5 Tabs matching engine_options_menu.cpp) ──
  if (
    menuState === 'UI_OPTIONS_AUDIO' ||
    menuState === 'UI_OPTIONS_VIDEO' ||
    menuState === 'UI_OPTIONS_GAMEPLAY' ||
    menuState === 'UI_OPTIONS_NETWORK' ||
    menuState === 'UI_OPTIONS_CONTROLS'
  ) {
    const tabs: { id: PortMenuState; label: string; icon: typeof Volume2 }[] = [
      { id: 'UI_OPTIONS_AUDIO', label: 'ÁUDIO', icon: Volume2 },
      { id: 'UI_OPTIONS_VIDEO', label: 'VÍDEO', icon: Eye },
      { id: 'UI_OPTIONS_GAMEPLAY', label: 'GAMEPLAY', icon: Gamepad2 },
      { id: 'UI_OPTIONS_NETWORK', label: 'REDE', icon: Network },
      { id: 'UI_OPTIONS_CONTROLS', label: 'CONTROLES', icon: Keyboard },
    ];

    const stepPct = (val: number) => (val >= 1 ? 0 : Math.min(1, Math.round((val + 0.1) * 10) / 10));

    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader('CONFIGURAÇÕES', 'Áudio, Vídeo, Gameplay, Rede e Controles')}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-2.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = menuState === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => navTo(t.id)}
                className={`flex items-center gap-1.5 rounded border px-3.5 py-2 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
                  active
                    ? 'border-[#d4af37] bg-[#1f2838] text-[#f3d27a]'
                    : 'border-white/10 bg-[#151a24] text-[#cbd5e1] hover:border-[#d4af37]/45'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mx-auto flex w-full max-w-xl flex-col gap-2 rounded-lg border border-white/10 bg-[#131823] p-4">
          {menuState === 'UI_OPTIONS_AUDIO' && (
            <>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, masterVolume: stepPct(options.masterVolume) });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] hover:border-[#f3d27a]/60 cursor-pointer"
              >
                <span>Volume Geral</span>
                <span className="font-mono-num">{Math.round(options.masterVolume * 100)}%</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, musicVolume: stepPct(options.musicVolume) });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] hover:border-[#f3d27a]/60 cursor-pointer"
              >
                <span>Volume da Música</span>
                <span className="font-mono-num">{Math.round(options.musicVolume * 100)}%</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, sfxVolume: stepPct(options.sfxVolume) });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] hover:border-[#f3d27a]/60 cursor-pointer"
              >
                <span>Volume dos Efeitos</span>
                <span className="font-mono-num">{Math.round(options.sfxVolume * 100)}%</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, musicEnabled: !options.musicEnabled });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Música Ativada</span>
                <span className={options.musicEnabled ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                  {options.musicEnabled ? 'LIGADO' : 'DESLIGADO'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !options.sfxEnabled;
                  onUpdateOptions({ ...options, sfxEnabled: next });
                  if (next) soundEngine.playSelect();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Efeitos Sonoros Ativados</span>
                <span className={options.sfxEnabled ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                  {options.sfxEnabled ? 'LIGADO' : 'DESLIGADO'}
                </span>
              </button>
              {(() => {
                void musicTrackTick;
                const info = soundEngine.getCurrentMusicInfo();
                return (
                  <div className="mt-1 flex items-center justify-between gap-2 rounded border border-[#d4af37]/30 bg-[#141a25] px-4 py-2.5 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-[#f3d27a] truncate">{info.displayTitle}</div>
                      <div className="text-[11px] text-[#94a3b8] truncate">{info.subtitle}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.unlock();
                        soundEngine.skipToNextMusicTrack();
                        setMusicTrackTick((t) => t + 1);
                      }}
                      className="shrink-0 rounded border border-[#d4af37]/45 bg-[#202838] px-3 py-1.5 text-[11px] font-semibold text-[#f3d27a] hover:border-[#f3d27a] cursor-pointer"
                    >
                      Próxima Faixa
                    </button>
                  </div>
                );
              })()}
            </>
          )}

          {menuState === 'UI_OPTIONS_VIDEO' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const next =
                    options.graphicsQuality === 'low'
                      ? 'medium'
                      : options.graphicsQuality === 'medium'
                      ? 'high'
                      : 'low';
                  onUpdateOptions({ ...options, graphicsQuality: next });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] cursor-pointer"
              >
                <span>Qualidade Gráfica</span>
                <span>
                  {options.graphicsQuality === 'high'
                    ? 'Alta'
                    : options.graphicsQuality === 'medium'
                    ? 'Média'
                    : 'Baixa'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, showFps: !options.showFps });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Exibir FPS</span>
                <span className={options.showFps ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                  {options.showFps ? 'LIGADO' : 'DESLIGADO'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = options.projectionMode === '2.5d' ? '3d' : '2.5d';
                  onUpdateOptions({ ...options, projectionMode: next });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Projeção da Câmera</span>
                <span className={options.projectionMode === '2.5d' ? 'text-[#f3d27a]' : 'text-sky-400'}>
                  {options.projectionMode === '2.5d' ? '2.5D Isométrico (AoM)' : '3D Perspectiva Livre'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const cur = options.hopliteRenderMode ?? '3d';
                  const next =
                    cur === '3d'
                      ? 'brg'
                      : cur === 'brg'
                      ? 'uv2d'
                      : cur === 'uv2d'
                      ? 'sprite'
                      : '3d';
                  onUpdateOptions({ ...options, hopliteRenderMode: next });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Modo Visual do Hoplita</span>
                <span
                  className={
                    options.hopliteRenderMode === 'sprite'
                      ? 'text-amber-400'
                      : options.hopliteRenderMode === 'brg'
                      ? 'text-purple-400'
                      : options.hopliteRenderMode === 'uv2d'
                      ? 'text-sky-400'
                      : 'text-emerald-400'
                  }
                >
                  {options.hopliteRenderMode === 'sprite'
                    ? '2.5D Sprite (Folha PNG)'
                    : options.hopliteRenderMode === 'brg'
                    ? '2.5D BRG UV (AoM Nativo)'
                    : options.hopliteRenderMode === 'uv2d'
                    ? '2D Paper-Doll (Atlas UV 64x64)'
                    : '3D UV Real (Atlas AoM 64x64)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const cur = options.hopliteArmorTier ?? 3;
                  const next = (cur >= 4 ? 1 : cur + 1) as 1 | 2 | 3 | 4;
                  onUpdateOptions({ ...options, hopliteArmorTier: next });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Armadura &amp; UV Infantaria Grega (T1–T4)</span>
                <span className="text-[#f3d27a]">
                  {options.hopliteArmorTier === 1
                    ? 'Tier 1: Padrão (map_01)'
                    : options.hopliteArmorTier === 2
                    ? 'Tier 2: Médio (map_02)'
                    : options.hopliteArmorTier === 4
                    ? 'Tier 4: Campeão Prata (map_04)'
                    : 'Tier 3: Pesado Ouro (map_03)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const profiles: AoMScaleProfile[] = ['classic_aom', 'monumental', 'realistic', 'compact'];
                  const cur = options.scaleProfile ?? 'classic_aom';
                  const next = profiles[(profiles.indexOf(cur) + 1) % profiles.length];
                  const cfg = AOM_SCALE_PROFILES[next];
                  onUpdateOptions({
                    ...options,
                    scaleProfile: next,
                    buildingScaleMultiplier: cfg.buildingMultiplier,
                    unitScaleMultiplier: cfg.unitMultiplier,
                  });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Proporção Global (Edifícios vs Unidades)</span>
                <span className="text-[#f3d27a]">
                  {options.scaleProfile === 'monumental'
                    ? 'Monumental (1.55x / 0.88x)'
                    : options.scaleProfile === 'realistic'
                    ? 'Realista (1.80x / 0.78x)'
                    : options.scaleProfile === 'compact'
                    ? 'Compacta (1.15x / 1.0x)'
                    : 'Clássica AoM (1.35x / 0.95x)'}
                </span>
              </button>
              <div className="flex h-11 items-center justify-between rounded border border-white/10 bg-[#151310] px-4 text-sm text-[#cbd5e1]">
                <span>Resolução</span>
                <span>Nativa da Tela ({typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Auto'})</span>
              </div>
            </>
          )}

          {menuState === 'UI_OPTIONS_GAMEPLAY' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const next: DifficultyId =
                    options.defaultDifficulty === 'normal'
                      ? 'hard'
                      : options.defaultDifficulty === 'hard'
                      ? 'titan'
                      : 'normal';
                  onUpdateOptions({ ...options, defaultDifficulty: next });
                  onUpdateSkirmish({ ...skirmish, difficulty: next });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] cursor-pointer"
              >
                <span>Dificuldade Padrão</span>
                <span>
                  {options.defaultDifficulty === 'normal'
                    ? 'Normal'
                    : options.defaultDifficulty === 'hard'
                    ? 'Difícil'
                    : 'Titã'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, showTips: !options.showTips });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Dicas de Jogo</span>
                <span className={options.showTips ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                  {options.showTips ? 'Ativadas' : 'Desativadas'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = options.gameSpeed < 0.9 ? 1.0 : options.gameSpeed < 1.3 ? 1.5 : 0.8;
                  onUpdateOptions({ ...options, gameSpeed: next });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] cursor-pointer"
              >
                <span>Velocidade do Jogo</span>
                <span className="font-mono-num">{options.gameSpeed.toFixed(1)}x</span>
              </button>
            </>
          )}

          {menuState === 'UI_OPTIONS_NETWORK' && (
            <>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, upnpEnabled: !options.upnpEnabled });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">UPnP</span>
                <span className={options.upnpEnabled ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                  {options.upnpEnabled ? 'Ativado' : 'Desativado'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextPort = options.networkPort >= 2305 ? 2300 : options.networkPort + 1;
                  onUpdateOptions({ ...options, networkPort: nextPort });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] cursor-pointer"
              >
                <span>Porta Padrão</span>
                <span className="font-mono-num">{options.networkPort}</span>
              </button>
              <button
                type="button"
                onClick={() => navTo('UI_MP_ESO')}
                className="flex h-11 items-center justify-center gap-2 rounded border border-[#d4af37]/55 bg-[#2a1f12] text-sm font-bold text-[#f3d27a] hover:bg-[#3a2a18] cursor-pointer"
              >
                <Network className="h-4 w-4" />
                <span>Abrir Lobbies Online (6x6)</span>
              </button>
            </>
          )}

          {menuState === 'UI_OPTIONS_CONTROLS' && (
            <>
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, virtualJoystick: !options.virtualJoystick });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold cursor-pointer"
              >
                <span className="text-[#e6dfd1]">Joystick Virtual / Controle Touch</span>
                <span className={options.virtualJoystick ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                  {options.virtualJoystick ? 'ATIVADO' : 'DESATIVADO'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next =
                    options.cameraSensitivity < 0.9 ? 1.0 : options.cameraSensitivity < 1.4 ? 1.5 : 0.5;
                  onUpdateOptions({ ...options, cameraSensitivity: next });
                  clickSound();
                }}
                className="flex h-11 items-center justify-between rounded border border-white/15 bg-[#171d29] px-4 text-sm font-semibold text-[#f3d27a] cursor-pointer"
              >
                <span>Sensibilidade Touch / Câmera</span>
                <span className="font-mono-num">{options.cameraSensitivity.toFixed(1)}x</span>
              </button>
              <button
                type="button"
                onClick={() => navTo('UI_HOTKEYS')}
                className="flex h-11 items-center justify-center gap-2 rounded border border-[#d4af37]/40 bg-[#1a202c] text-sm font-semibold text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
              >
                <Keyboard className="h-4 w-4 text-[#e5c45e]" />
                <span>Ver Atalhos de Teclado (Hotkeys)</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── 5, 6, 7. GLOBAL ONLINE MULTIPLAYER HUB (6x6 / UP TO 12 PLAYERS, CRESTS, COLORS, CHAT) ──
  if (
    menuState === 'MULTIPLAYER_LAN' ||
    menuState === 'UI_HOST_GAME_DIALOG' ||
    menuState === 'MULTIPLAYER_LOBBY' ||
    menuState === 'UI_MP_ESO'
  ) {
    return (
      <MultiplayerOnlineHub
        initialMode={menuState === 'UI_HOST_GAME_DIALOG' ? 'private' : 'global'}
        options={options}
        skirmish={skirmish}
        onUpdateOptions={onUpdateOptions}
        onStartMatch={onStartMatch}
        onBack={() => navTo('SUB_MULTIPLAYER')}
      />
    );
  }

  // ── 8. UI_PROFILE_SELECT (uiprofileselect.xmb) ──
  if (menuState === 'UI_PROFILE_SELECT') {
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader(
          'SELECIONAR PERFIL DE JOGADOR',
          `Perfil ativo: ${options.playerName}`,
          'SUB_MORE'
        )}

        <div className="mx-auto grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded border border-[#d4af37]/25 bg-[#131822] p-3">
            <h3 className="text-xs font-bold text-[#f3d27a]">Perfis Disponíveis</h3>
            <div className="flex flex-col gap-1.5">
              {profiles.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    clickSound();
                    setSelectedProfile(p);
                  }}
                  className={`flex items-center justify-between rounded border px-3 py-2 text-xs font-semibold cursor-pointer ${
                    selectedProfile === p
                      ? 'border-[#f3d27a] bg-[#262f40] text-white'
                      : 'border-white/10 bg-[#171c26] text-[#cbd5e1]'
                  }`}
                >
                  <span>{p}</span>
                  {options.playerName === p && <span className="text-[10px] text-[#86efac]">ATIVO</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded border border-white/10 bg-[#131822] p-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-[#f3d27a]">Criar Novo Perfil</h3>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Nome do perfil..."
                  className="flex-1 rounded border border-white/15 bg-[#0e121a] px-2.5 py-1.5 text-xs text-white focus:border-[#f3d27a] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newProfileName.trim();
                    if (!trimmed || profiles.includes(trimmed)) return;
                    const next = [...profiles, trimmed];
                    setProfiles(next);
                    saveProfilesToStorage(next);
                    setSelectedProfile(trimmed);
                    setNewProfileName('');
                    clickSound();
                  }}
                  className="flex items-center gap-1 rounded border border-[#d4af37]/50 bg-[#1d2536] px-2.5 py-1.5 text-xs font-semibold text-[#f3d27a] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateOptions({ ...options, playerName: selectedProfile });
                  clickSound();
                }}
                className="flex items-center justify-center gap-1.5 rounded border border-[#f5d77f] bg-[#d4af37] py-2 text-xs font-bold text-[#0d1017] cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Ativar Perfil "{selectedProfile}"</span>
              </button>
              <button
                type="button"
                disabled={profiles.length <= 1}
                onClick={() => {
                  if (profiles.length <= 1) return;
                  const next = profiles.filter((p) => p !== selectedProfile);
                  setProfiles(next);
                  saveProfilesToStorage(next);
                  const fallback = next[0];
                  setSelectedProfile(fallback);
                  if (options.playerName === selectedProfile) {
                    onUpdateOptions({ ...options, playerName: fallback });
                  }
                  clickSound();
                }}
                className="flex items-center justify-center gap-1.5 rounded border border-white/15 bg-[#181e29] py-2 text-xs text-[#fca5a5] disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir Perfil Selecionado</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 9. UI_GAME_LIST & UI_LOAD_SCENARIO ──
  if (menuState === 'UI_GAME_LIST' || menuState === 'UI_LOAD_SCENARIO') {
    const activePreset = CUSTOM_SCENARIOS[selectedCustomScnIdx] ?? CUSTOM_SCENARIOS[0];
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader(
          menuState === 'UI_GAME_LIST' ? 'CARREGAR JOGO SALVO' : 'CARREGAR CENÁRIO',
          menuState === 'UI_GAME_LIST'
            ? 'Gerencie partidas salvas localmente no navegador'
            : 'Cenários prontos inspirados nas campanhas e mapas clássicos',
          'SUB_SINGLE_PLAYER'
        )}

        {menuState === 'UI_GAME_LIST' ? (
          <div className="mx-auto flex w-full max-w-lg flex-col gap-3 rounded border border-[#d4af37]/25 bg-[#131822] p-4">
            {hasSavedMatch ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded border border-[#d4af37]/40 bg-[#1a2230] p-3">
                  <div className="flex items-center gap-2.5">
                    <Save className="h-5 w-5 text-[#f3d27a]" />
                    <div>
                      <div className="text-sm font-bold text-white">Partida Salva ({options.playerName})</div>
                      <div className="text-xs text-[#9ca3af]">Armazenamento Local · Pronto para retomar</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clickSound();
                      onLoadSavedMatch();
                    }}
                    className="flex-1 rounded border border-[#f5d77f] bg-[#d4af37] py-2 text-xs font-bold text-[#0d1017] cursor-pointer"
                  >
                    Carregar Jogo Selecionado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clickSound();
                      onDeleteSavedMatch();
                    }}
                    className="rounded border border-rose-500/40 bg-[#2a1518] px-4 py-2 text-xs font-semibold text-rose-200 cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#9ca3af]">
                Nenhum jogo salvo encontrado. Durante uma partida, clique em "Salvar" para gravar seu progresso.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 flex flex-col gap-1.5 rounded border border-[#d4af37]/25 bg-[#131822] p-2.5">
              {CUSTOM_SCENARIOS.map((scn, idx) => (
                <button
                  key={scn.id}
                  type="button"
                  onClick={() => {
                    clickSound();
                    setSelectedCustomScnIdx(idx);
                  }}
                  className={`rounded border px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                    idx === selectedCustomScnIdx
                      ? 'border-[#f3d27a] bg-[#262f40] text-white'
                      : 'border-white/10 bg-[#171c26] text-[#cbd5e1]'
                  }`}
                >
                  <div>{scn.title}</div>
                  <div className="text-[10px] text-[#e5c45e]">
                    {MAPS[scn.mapId].name} · {PANTHEONS[scn.pantheon].name}
                  </div>
                </button>
              ))}
            </div>
            <div className="md:col-span-7 flex flex-col justify-between gap-3 rounded border border-white/10 bg-[#131822] p-4">
              <div>
                <h3 className="font-display text-base font-bold text-[#f3d27a]">{activePreset.title}</h3>
                <p className="mt-1.5 text-xs text-[#cbd5e1]">{activePreset.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#9ca3af]">
                  <div>Civilização: <strong className="text-white">{PANTHEONS[activePreset.pantheon].name}</strong></div>
                  <div>Adversário: <strong className="text-white">{PANTHEONS[activePreset.enemyPantheon].name}</strong></div>
                  <div className="flex items-center gap-1.5">
                    <span>Era Inicial:</span>
                    <EraIcon age={activePreset.startingAge} pantheon={activePreset.pantheon} size={16} active />
                    <strong className="text-white">{AGE_NAMES[activePreset.startingAge]}</strong>
                  </div>
                  <div>Mapa: <strong className="text-white">{MAPS[activePreset.mapId].name}</strong></div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onStartMatch(
                    activePreset.pantheon,
                    activePreset.difficulty,
                    activePreset.mapId,
                    activePreset.revealedMap,
                    {
                      startingAge: activePreset.startingAge,
                      startingResources: activePreset.startingResources,
                      enemyPantheon: activePreset.enemyPantheon,
                      scenarioTitle: activePreset.title,
                      gameSpeed: options.gameSpeed,
                    }
                  )
                }
                className="flex h-10 items-center justify-center gap-2 rounded border border-[#f5d77f] bg-[#d4af37] text-xs font-bold text-[#0d1017] cursor-pointer"
              >
                <Play className="h-4 w-4" />
                <span>Carregar Cenário</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 10. UI_RECORDED_GAMES ──
  if (menuState === 'UI_RECORDED_GAMES') {
    const rec = recordedMatches[selectedRecordedIdx] ?? recordedMatches[0];
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader(
          'JOGOS GRAVADOS',
          'Histórico de partidas concluídas e replays de estatísticas',
          'SUB_SINGLE_PLAYER'
        )}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 flex flex-col gap-1.5 rounded border border-[#d4af37]/25 bg-[#131822] p-2.5 max-h-64 overflow-y-auto">
            {recordedMatches.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  clickSound();
                  setSelectedRecordedIdx(i);
                }}
                className={`flex items-center justify-between rounded border px-3 py-2 text-left text-xs cursor-pointer ${
                  i === selectedRecordedIdx
                    ? 'border-[#f3d27a] bg-[#262f40] text-white'
                    : 'border-white/10 bg-[#171c26] text-[#cbd5e1]'
                }`}
              >
                <span className="font-semibold truncate">{m.title}</span>
                <span className={m.result === 'victory' ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                  {m.result === 'victory' ? 'Vitória' : 'Derrota'}
                </span>
              </button>
            ))}
          </div>
          {rec && (
            <div className="md:col-span-6 flex flex-col justify-between gap-3 rounded border border-white/10 bg-[#131822] p-4 text-xs">
              <div>
                <h3 className="font-display text-base font-bold text-[#f3d27a]">{rec.title}</h3>
                <div className="mt-2 space-y-1 text-[#cbd5e1]">
                  <div>Data: {rec.date}</div>
                  <div>Panteão: {PANTHEONS[rec.pantheon].name} · Mapa: {MAPS[rec.mapId].name}</div>
                  <div>Duração: {Math.floor(rec.durationSeconds / 60)}m {rec.durationSeconds % 60}s</div>
                  <div>Unidades Treinadas: {rec.unitsTrained} · Inimigos Derrotados: {rec.enemiesDefeated}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onStartMatch(rec.pantheon, rec.difficulty, rec.mapId, false, {
                    scenarioTitle: `Revanche: ${rec.title}`,
                    gameSpeed: options.gameSpeed,
                  })
                }
                className="rounded border border-[#f5d77f] bg-[#d4af37] py-2 text-xs font-bold text-[#0d1017] cursor-pointer"
              >
                Jogar Mesma Configuração
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 11. UI_EDITOR ──
  if (menuState === 'UI_EDITOR') {
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader(
          'EDITOR DE CENÁRIOS',
          'Modo Sandbox com Mapa Revelado e recursos abundantes para testar exércitos e construções',
          'SUB_MORE'
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded border border-[#d4af37]/25 bg-[#131822] p-4">
          <div>
            <div className="mb-1.5 text-xs font-bold text-[#f3d27a]">Terreno Base</div>
            {renderMapPicker(editorMap, setEditorMap, true)}
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold text-[#f3d27a]">Civilização de Teste</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PANTHEONS).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    clickSound();
                    setEditorPantheon(p.id);
                  }}
                  className={`rounded border px-3 py-2 text-xs font-semibold cursor-pointer ${
                    editorPantheon === p.id ? 'border-[#f3d27a] bg-[#262f40] text-white' : 'border-white/10 bg-[#171c26] text-[#cbd5e1]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() =>
                onStartMatch(editorPantheon, 'normal', editorMap, true, {
                  startingAge: 4,
                  startingResources: 'abundant',
                  scenarioTitle: 'Editor Sandbox',
                  gameSpeed: options.gameSpeed,
                })
              }
              className="flex items-center gap-2 rounded border border-[#f5d77f] bg-[#d4af37] px-5 py-2 text-xs font-bold text-[#0d1017] cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              <span>Abrir Mapa no Modo Sandbox</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 12. UI_HISTORY & UI_TECHTREE ──
  if (menuState === 'UI_HISTORY' || menuState === 'UI_TECHTREE') {
    const unitKinds: UnitKind[] = [
      'villager',
      'hoplite',
      'hipaspist',
      'myrmidon',
      'peltast',
      'archer',
      'gastraphetes',
      'cavalry',
      'prodromos',
      'jason',
      'ajax',
      'odysseus',
      'hippolyta',
      'theseus',
      'perseus',
      'bellerophon',
      'hero',
      'ram',
      'siege',
      'cyclops',
      'minotaur',
      'centaur',
      'nymph',
      'pegasus',
      'manticore',
      'hydra',
      'satyr',
      'phoenix',
      'colossus',
      'automaton',
      'iron_dwarf',
      'medusa',
      'titan',
      'zeus',
      'poseidon',
      'hades',
      'atena',
      'ares',
      'hermes',
      'apolo',
      'dionisio',
      'afrodite',
      'hefesto',
      'artemis',
    ];
    const buildingKinds: BuildingKind[] = [
      'town_center',
      'house',
      'farm',
      'barracks',
      'archery_range',
      'stable',
      'siege_works',
      'armory',
      'market',
      'temple',
      'tower',
      'fortress',
      'titan_gate',
    ];
    const techList = Object.values(TECH_SPECS).filter(
      (tech) => !tech.pantheons || tech.pantheons.includes(techTreeCiv)
    );
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader(
          menuState === 'UI_TECHTREE' ? 'ÁRVORE TECNOLÓGICA' : 'HISTÓRIA E MITOLOGIA',
          'Panteões, Edificações, Tropas, Heróis, Unidades Míticas e Tecnologias',
          'SUB_MORE'
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {Object.values(PANTHEONS).map((p) => {
              const selected = (menuState === 'UI_TECHTREE' ? techTreeCiv : historyCiv) === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    clickSound();
                    if (menuState === 'UI_TECHTREE') setTechTreeCiv(p.id);
                    else setHistoryCiv(p.id);
                  }}
                  className={`rounded border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                    selected ? 'border-[#f3d27a] bg-[#262f40] text-[#f3d27a]' : 'border-white/10 bg-[#171c26] text-[#cbd5e1]'
                  }`}
                >
                  {p.name} ({p.deity})
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => navTo(menuState === 'UI_TECHTREE' ? 'UI_HISTORY' : 'UI_TECHTREE')}
            className="rounded border border-[#d4af37]/40 bg-[#181e29] px-3 py-1.5 text-xs font-semibold text-[#f3d27a] cursor-pointer shrink-0"
          >
            {menuState === 'UI_TECHTREE' ? 'Ver História' : 'Ver Árvore Tech'}
          </button>
        </div>

        {menuState === 'UI_HISTORY' ? (
          <div className="rounded border border-[#d4af37]/25 bg-[#131822] p-4 text-xs leading-relaxed text-[#cbd5e1] space-y-2">
            <h3 className="font-display text-base font-bold text-[#f3d27a]">
              {PANTHEONS[historyCiv].name} — Panteão de {PANTHEONS[historyCiv].deity}
            </h3>
            <p>{PANTHEONS[historyCiv].bonusLabel}</p>
            <p className="text-[#9ca3af]">
              Arquitetura: {PANTHEONS[historyCiv].architectureLabel}. Deuses Menores: {PANTHEONS[historyCiv].minorGods}.
            </p>
            <p>
              Poder Favorecido: <strong className="text-[#38bdf8]">{getCivGodPowerSpec(historyCiv, PANTHEONS[historyCiv].favoredGodPower).name}</strong>.
            </p>
            <p>
              Em Age of Mythology: Olympus (Divine Edition), 13 civilizações evoluem através das 4 Eras clássicas até a Era V (Titãs),
              escolhendo Deuses Menores a cada avanço para desbloquear novos milagres e unidades míticas.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {/* Faixa de todas as 5 Eras da Civilização selecionada */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as AgeLevel[]).map((era) => (
                <div
                  key={era}
                  className="flex items-center gap-2 rounded border border-[#d4af37]/30 bg-[#141a26] px-2.5 py-2"
                >
                  <EraIcon age={era} pantheon={techTreeCiv} size={30} active />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#f3d27a] truncate">
                      {AGE_NAMES[era].replace('Era ', '')}
                    </div>
                    <div className="text-[10px] text-[#cbd5e1] truncate">{getEraSubtitle(era, techTreeCiv)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded border border-[#d4af37]/25 bg-[#131822] p-3">
              <h4 className="mb-2 text-xs font-bold text-[#f3d27a]">Edificações ({buildingKinds.length})</h4>
              <div className="space-y-1.5 text-xs">
                {buildingKinds.map((bk) => {
                  const spec = getCivBuildingSpec(techTreeCiv, bk);
                  return (
                    <div key={bk} className="flex items-center justify-between gap-2 rounded border border-white/10 bg-[#171c26] px-2.5 py-1.5">
                      <span className="font-semibold text-white truncate">{spec.name}</span>
                      <span className="flex items-center gap-1 text-[#9ca3af] shrink-0">
                        <EraIcon age={spec.minAge} pantheon={techTreeCiv} size={15} />
                        <span>{AGE_NAMES[spec.minAge].replace('Era ', '')}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded border border-[#d4af37]/25 bg-[#131822] p-3">
              <h4 className="mb-2 text-xs font-bold text-[#f3d27a]">Tropas & Míticos ({unitKinds.length})</h4>
              <div className="space-y-1.5 text-xs">
                {unitKinds.map((uk) => {
                  const spec = getCivUnitSpec(techTreeCiv, uk);
                  return (
                    <div key={uk} className="flex items-center justify-between gap-2 rounded border border-white/10 bg-[#171c26] px-2.5 py-1.5">
                      <span className={spec.isMythic ? 'font-semibold text-[#38bdf8] truncate' : spec.isHero ? 'font-semibold text-[#facc15] truncate' : 'font-semibold text-white truncate'}>
                        {spec.name}
                      </span>
                      <span className="flex items-center gap-1 text-[#9ca3af] shrink-0">
                        <EraIcon age={spec.minAge} pantheon={techTreeCiv} size={15} />
                        <span>Atq {spec.attack}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded border border-[#d4af37]/25 bg-[#131822] p-3">
              <h4 className="mb-2 text-xs font-bold text-[#f3d27a]">Tecnologias ({techList.length})</h4>
              <div className="space-y-1.5 text-xs">
                {techList.map((tech: typeof TECH_SPECS[TechId]) => (
                  <div key={tech.id} className="flex items-start gap-2 rounded border border-white/10 bg-[#171c26] px-2 py-1.5">
                    <TechIcon techId={tech.id} size={26} className="shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-white truncate">{tech.name}</span>
                        <span className="flex items-center gap-1 text-[10px] text-[#e5c45e] shrink-0">
                          <EraIcon age={tech.minAge} pantheon={techTreeCiv} size={14} />
                          <span>
                            {tech.requiresMinorGodLabel ? `${tech.requiresMinorGodLabel} · ` : ''}
                            {AGE_NAMES[tech.minAge].replace('Era ', '')}
                          </span>
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9ca3af] leading-snug">{tech.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 13. UI_HOTKEYS ──
  if (menuState === 'UI_HOTKEYS') {
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader('ATALHOS DE TECLADO (HOTKEYS)', 'Referência de controles em batalha', 'UI_OPTIONS_CONTROLS')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
          {HOTKEYS_LIST.map((hk) => (
            <div key={hk.key} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-[#131822] px-3 py-2 text-xs">
              <span className="text-[#cbd5e1]">{hk.action}</span>
              <span className="rounded border border-[#d4af37]/40 bg-[#1d2536] px-2 py-0.5 font-mono-num font-bold text-[#f3d27a] shrink-0">
                {hk.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 14. CREDITS / UI_ABOUT / UI_UPDATES ──
  if (menuState === 'CREDITS') {
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader('CRÉDITOS', 'Age of Mythology: Olympus', 'SUB_MOVIES')}
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2 rounded border border-white/10 bg-[#131823] p-5 text-center text-xs text-[#cbd5e1]">
          <p className="font-display text-base font-bold text-[#f3d27a]">Age of Mythology: Olympus</p>
          <p className="text-white">Estratégia em Tempo Real Mitológica 3D</p>
          <div className="my-2 h-px bg-white/10" />
          <p>Motor 3D WebGL · Navegação A* · Névoa de Guerra &amp; Ciclo Dia/Noite</p>
          <p>13 Panteões · 39 Deuses Maiores · 10 Mapas · Poderes Divinos · Era dos Deuses &amp; Titãs</p>
          <p className="text-[#f3d27a]">
            Trilha Sonora Dinâmica · Temas por Panteão, Modo Padrão/Calmo e Créditos: &ldquo;Gary&apos;s Reserve&rdquo;
          </p>
        </div>
      </div>
    );
  }

  if (menuState === 'UI_ABOUT') {
    return (
      <div className="flex flex-col gap-4">
        {renderPanelHeader('SOBRE O JOGO', 'Informações da versão', 'SUB_MORE')}
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5 rounded border border-white/10 bg-[#131823] p-5 text-xs leading-relaxed text-[#cbd5e1]">
          <div className="flex justify-between font-bold text-[#f3d27a]">
            <span>Age of Mythology: Olympus</span>
            <span className="font-mono-num">v1.0.0</span>
          </div>
          <p>
            Estratégia em tempo real 3D com campanhas, escaramuças, seletor de deuses,
            árvore tecnológica, editor sandbox e partidas salvas localmente.
          </p>
        </div>
      </div>
    );
  }

  // UI_UPDATES
  return (
    <div className="flex flex-col gap-4">
      {renderPanelHeader('VERIFICAR ATUALIZAÇÕES', 'Status da versão local', 'SUB_MORE')}
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded border border-[#d4af37]/30 bg-[#131822] p-5 text-center text-xs text-[#cbd5e1]">
        <Info className="h-6 w-6 text-[#f3d27a]" />
        <p>{updateCheckMsg ?? 'Versão atual: Age of Mythology: Olympus v1.0.0 — Todos os módulos carregados.'}</p>
        <button
          type="button"
          onClick={() => {
            clickSound();
            setUpdateCheckMsg('Você já está utilizando a versão mais recente disponível.');
          }}
          className="rounded border border-[#f5d77f] bg-[#d4af37] px-4 py-2 font-bold text-[#0d1017] cursor-pointer"
        >
          Verificar Agora
        </button>
      </div>
    </div>
  );
}
