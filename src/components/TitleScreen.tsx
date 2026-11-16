import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Crown,
  Film,
  Gamepad2,
  Globe,
  HardDrive,
  Info,
  Network,
  Play,
  Power,
  Shield,
  SlidersHorizontal,
  Swords,
  User,
  Users,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import { PortMenuState } from '../game/menuData';
import {
  DifficultyId,
  GameOptionsConfig,
  MapId,
  MatchStartOptions,
  PANTHEONS,
  PantheonId,
} from '../game/types';
import { HopliteUvBuilderModal } from './HopliteUvBuilderModal';
import { PortSubMenus, SkirmishDraft } from './PortSubMenus';

interface TitleScreenProps {
  hasSavedMatch: boolean;
  muted: boolean;
  fps?: number;
  options: GameOptionsConfig;
  onUpdateOptions: (next: GameOptionsConfig) => void;
  onToggleMute: () => void;
  onStartMatch: (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    extras?: MatchStartOptions
  ) => void;
  onLoadSavedMatch: () => void;
  onDeleteSavedMatch: () => void;
}

const COMPACT_MENU_STATES = new Set<PortMenuState>([
  'MAIN_MENU',
  'SUB_LEARN',
  'SUB_CAMPAIGN',
  'SUB_SINGLE_PLAYER',
  'SUB_MULTIPLAYER',
  'SUB_MORE',
  'SUB_MOVIES',
  'UI_EXIT_CONFIRM',
]);

export function TitleScreen({
  hasSavedMatch,
  muted,
  fps = 60,
  options,
  onUpdateOptions,
  onToggleMute,
  onStartMatch,
  onLoadSavedMatch,
  onDeleteSavedMatch,
}: TitleScreenProps) {
  const [menuState, setMenuState] = useState<PortMenuState>('MAIN_MENU');
  const [uvModalOpen, setUvModalOpen] = useState(false);
  const [skirmish, setSkirmish] = useState<SkirmishDraft>({
    pantheon: 'greek',
    minorGod: 'Zeus',
    enemyPantheon: 'egyptian',
    difficulty: options.defaultDifficulty || 'normal',
    mapId: 'mediterranean',
    mapSize: 'normal',
    startingAge: 1,
    startingResources: 'standard',
    revealedMap: false,
    gameType: 'supremacy',
    visibilityMode: 'normal',
    worldSize: 'normal',
    dayNightCycle: true,
    titansEnabled: true,
    treatyMinutes: 0,
  });

  // Escape navigates back cleanly inside port menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menuState === 'SPLASH') {
        soundEngine.unlock();
        setMenuState('MAIN_MENU');
        return;
      }
      if (e.key === 'Escape' && menuState !== 'MAIN_MENU') {
        setMenuState('MAIN_MENU');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuState]);

  const nav = (next: PortMenuState) => {
    soundEngine.unlock();
    soundEngine.playSelect();
    setMenuState(next);
  };

  const launchPreset = (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    extras?: MatchStartOptions
  ) => {
    soundEngine.unlock();
    onStartMatch(pantheon, difficulty, mapId, revealedMap, {
      ...extras,
      gameSpeed: options.gameSpeed,
    });
  };

  // ── SPLASH STATE (matches EngineState::SPLASH) ──
  if (menuState === 'SPLASH') {
    return (
      <div
        onClick={() => nav('MAIN_MENU')}
        className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-[#090c12]/90 p-6 text-center cursor-pointer select-none"
      >
        <div className="rounded-lg border border-[#d4af37]/50 bg-gradient-to-b from-[#1f2633] to-[#10141c] px-10 py-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e5c45e]">
            Age of Mythology · The Titans
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#f3d27a]">
            Age of Mythology: Olympus
          </h1>
          <p className="mt-4 text-xs text-[#cbd5e1]">
            Clique na tela ou pressione qualquer tecla para entrar no Menu Principal...
          </p>
        </div>
      </div>
    );
  }

  const isCompact = COMPACT_MENU_STATES.has(menuState);
  const containerWidth = isCompact ? 'max-w-[390px]' : 'max-w-5xl';

  const renderMenuBtn = (
    label: string,
    onClick: () => void,
    icon?: React.ReactNode,
    highlight = false
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={`flex h-10 w-full items-center justify-center gap-2 rounded border px-4 text-sm font-bold tracking-wide transition-all duration-150 active:translate-y-px cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#f3d27a] ${
        highlight
          ? 'border-[#f5d77f] bg-gradient-to-b from-[#e0bc56] via-[#c79e34] to-[#98721b] text-[#0d1017] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-110'
          : 'border-[#d4af37]/55 bg-gradient-to-b from-[#232f28] via-[#18221e] to-[#101715] text-[#f3efe6] shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] hover:border-[#f3d27a] hover:from-[#2d3e34] hover:to-[#16201c]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(10,14,22,0.18)_0%,rgba(7,9,14,0.72)_100%)] p-3 sm:p-6">
      {/* Top-Right Profile, Sound & Optional FPS strip (like engine_menus.cpp) */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.unlock();
            soundEngine.playSelect();
            setUvModalOpen(true);
          }}
          className="flex h-8 items-center gap-1.5 rounded border border-emerald-400/60 bg-emerald-950/90 px-3 text-xs font-bold text-emerald-200 shadow-lg hover:border-emerald-300 hover:bg-emerald-900 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-[#f3d27a]" />
            <span>Modelo 3D/2.5D</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => nav('UI_PROFILE_SELECT')}
          className="flex h-8 items-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#10141d]/95 px-3 text-xs font-semibold text-[#f3d27a] hover:border-[#f3d27a] cursor-pointer"
        >
          <User className="h-3.5 w-3.5" />
          <span>{options.playerName}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onToggleMute();
            if (muted) {
              soundEngine.unlock();
              soundEngine.playSelect();
            }
          }}
          aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#d4af37]/40 bg-[#10141d]/95 text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-[#f3d27a]" />}
        </button>

        {options.showFps && (
          <div className="rounded border border-white/15 bg-[#10141d]/95 px-2.5 py-1 font-mono-num text-[11px] font-bold text-[#86efac]">
            FPS: {fps}
          </div>
        )}
      </div>

      <HopliteUvBuilderModal
        isOpen={uvModalOpen}
        onClose={() => setUvModalOpen(false)}
        activeMode={options.hopliteRenderMode ?? '3d'}
        activeTier={options.hopliteArmorTier ?? 3}
        onSelectMode={(mode) => onUpdateOptions({ ...options, hopliteRenderMode: mode })}
        onSelectTier={(tier) => onUpdateOptions({ ...options, hopliteArmorTier: tier })}
      />

      <div className={`relative w-full ${containerWidth} max-h-[calc(100vh-1.5rem)] flex flex-col transition-[max-width] duration-200`}>
        {/* Classical AoM: The Titans Logo Pediment */}
        <div className="relative mx-auto flex w-full flex-col items-center">
          <div className="relative flex w-[92%] items-center justify-center">
            <svg
              viewBox="0 0 600 40"
              className="h-8 sm:h-10 w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)]"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pedimentStonePort" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2a3140" />
                  <stop offset="55%" stopColor="#1b202b" />
                  <stop offset="100%" stopColor="#11151d" />
                </linearGradient>
                <linearGradient id="pedimentGoldPort" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8c6a22" />
                  <stop offset="50%" stopColor="#f3d27a" />
                  <stop offset="100%" stopColor="#8c6a22" />
                </linearGradient>
              </defs>
              <polygon
                points="10,38 300,3 590,38"
                fill="url(#pedimentStonePort)"
                stroke="url(#pedimentGoldPort)"
                strokeWidth="2.5"
              />
            </svg>
            <div className="absolute top-1 flex h-7 w-7 rotate-45 items-center justify-center rounded-sm border border-[#f3d27a]/85 bg-gradient-to-b from-[#3d2f14] to-[#171209] shadow-lg">
              <Shield className="h-3.5 w-3.5 -rotate-45 text-[#f3d27a]" />
            </div>
          </div>

          <div className="relative z-10 w-full rounded-t-lg border-x border-t border-[#d4af37]/60 bg-gradient-to-b from-[#232936] via-[#171c26] to-[#12161f] px-5 py-3 text-center shadow-xl">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-[0.06em] text-transparent bg-clip-text bg-gradient-to-b from-[#fff3c4] via-[#e5c45e] to-[#a88227]">
              Age of Mythology: Olympus
            </h1>
            <div className="mt-0.5 text-[11px] font-medium tracking-wider text-[#b6becd]">
              The Titans · {PANTHEONS[skirmish.pantheon].name} ({skirmish.minorGod})
            </div>
          </div>
        </div>

        {/* Framed Stone Columns + Interior */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-b-lg border border-t-0 border-[#d4af37]/50 bg-[#10141c]/95 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
          {/* Left Fluted Column */}
          <div
            aria-hidden="true"
            className="hidden sm:flex w-5 shrink-0 flex-col justify-between border-r border-[#d4af37]/30 bg-[linear-gradient(90deg,#151922_0%,#262d3c_35%,#1a202b_65%,#12161e_100%)]"
          >
            <div className="h-3 border-b border-[#d4af37]/40 bg-[#2b3240]" />
            <div className="flex-1 opacity-35 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_3px,rgba(0,0,0,0.6)_3px,rgba(0,0,0,0.6)_5px)]" />
            <div className="h-3 border-t border-[#d4af37]/40 bg-[#151922]" />
          </div>

          {/* Menu Body */}
          <div className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-5">
            {/* MAIN_MENU — Exact 7 Buttons from uipregamenew.xmb / create_main_menu_fallback */}
            {menuState === 'MAIN_MENU' && (
              <div className="flex flex-col gap-2">
                {renderMenuBtn(
                  'Aprender a Jogar',
                  () => nav('SUB_LEARN'),
                  <BookOpen className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'Campanha',
                  () => nav('SUB_CAMPAIGN'),
                  <Compass className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'Um Jogador',
                  () => nav('SUB_SINGLE_PLAYER'),
                  <Swords className="h-4 w-4 text-[#0d1017]" />,
                  true
                )}
                {renderMenuBtn(
                  'Multijogador',
                  () => nav('SUB_MULTIPLAYER'),
                  <Network className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'Opções',
                  () => nav('UI_OPTIONS_AUDIO'),
                  <SlidersHorizontal className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'Mais',
                  () => nav('SUB_MORE'),
                  <Crown className="h-4 w-4 text-[#f3d27a]" />
                )}
                <div className="pt-1">
                  {renderMenuBtn(
                    'Sair',
                    () => nav('UI_EXIT_CONFIRM'),
                    <Power className="h-4 w-4 text-rose-300" />
                  )}
                </div>
              </div>
            )}

            {/* LearnSubMenu (uipregamenew.xmb) */}
            {menuState === 'SUB_LEARN' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#f3d27a]">
                  Aprender a Jogar
                </div>
                {renderMenuBtn(
                  'Tutorial',
                  () =>
                    launchPreset('greek', 'normal', 'mediterranean', true, {
                      scenarioTitle: 'Tutorial — A Ilha do Aprendizado',
                      startingResources: 'high',
                    }),
                  <Play className="h-4 w-4 text-[#0d1017]" />,
                  true
                )}
                {renderMenuBtn('Cinemática Nórdica', () =>
                  launchPreset('norse', 'normal', 'alfheim', true, {
                    scenarioTitle: 'Introdução Nórdica (Alfheim)',
                    startingAge: 2,
                  })
                )}
                {renderMenuBtn('Cinemática Egípcia', () =>
                  launchPreset('egyptian', 'normal', 'nile', true, {
                    scenarioTitle: 'Introdução Egípcia (Rio Nilo)',
                    startingAge: 2,
                  })
                )}
                {renderMenuBtn('Cinemática Atlante', () =>
                  launchPreset('atlantean', 'normal', 'acropolis', true, {
                    scenarioTitle: 'Introdução Atlante (Titans)',
                    startingAge: 2,
                  })
                )}
                <div className="pt-1">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#f3d27a]" />
                  )}
                </div>
              </div>
            )}

            {/* CampaignSubMenu (uipregamenew.xmb) */}
            {menuState === 'SUB_CAMPAIGN' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#f3d27a]">
                  Campanha
                </div>
                {renderMenuBtn(
                  'Campanha AOM (A Queda do Tridente)',
                  () => nav('UI_CAMPAIGN'),
                  <Compass className="h-4 w-4 text-[#0d1017]" />,
                  true
                )}
                {renderMenuBtn('Campanha dos Titãs (A Nova Atlântida)', () => nav('UI_CAMPAIGN'))}
                {renderMenuBtn(
                  hasSavedMatch ? 'Carregar Jogo Salvo ●' : 'Carregar Jogo Salvo',
                  () => nav('UI_GAME_LIST'),
                  <HardDrive className="h-4 w-4 text-[#f3d27a]" />
                )}
                <div className="pt-1">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#f3d27a]" />
                  )}
                </div>
              </div>
            )}

            {/* SinglePlayerSubMenu (uipregamenew.xmb) */}
            {menuState === 'SUB_SINGLE_PLAYER' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#f3d27a]">
                  Um Jogador
                </div>
                {renderMenuBtn(
                  'Mapa Aleatório (Escaramuça)',
                  () => nav('UI_SINGLE_PLAYER_SETUP'),
                  <Swords className="h-4 w-4 text-[#0d1017]" />,
                  true
                )}
                {renderMenuBtn('Campanha AOM', () => nav('UI_CAMPAIGN'))}
                {renderMenuBtn('Campanha dos Titãs', () => nav('UI_CAMPAIGN'))}
                {renderMenuBtn('Carregar Cenário', () => nav('UI_LOAD_SCENARIO'))}
                {renderMenuBtn(
                  hasSavedMatch ? 'Carregar Jogo Salvo ●' : 'Carregar Jogo Salvo',
                  () => nav('UI_GAME_LIST')
                )}
                {renderMenuBtn('Jogos Gravados', () => nav('UI_RECORDED_GAMES'))}
                <div className="pt-1">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#f3d27a]" />
                  )}
                </div>
              </div>
            )}

            {/* MultiPlayerSubMenu (uipregamenew.xmb) */}
            {menuState === 'SUB_MULTIPLAYER' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#f3d27a]">
                  Multijogador
                </div>
                {renderMenuBtn(
                  'Online (ESO)',
                  () => nav('UI_MP_ESO'),
                  <Globe className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'LAN / IP Direto',
                  () => nav('MULTIPLAYER_LAN'),
                  <Network className="h-4 w-4 text-[#0d1017]" />,
                  true
                )}
                <div className="pt-1">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#f3d27a]" />
                  )}
                </div>
              </div>
            )}

            {/* MoreSubMenu (uipregamenew.xmb) */}
            {menuState === 'SUB_MORE' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#f3d27a]">
                  Mais
                </div>
                {renderMenuBtn('Jogos Gravados', () => nav('UI_RECORDED_GAMES'))}
                {renderMenuBtn(
                  'Editor de Cenários',
                  () => nav('UI_EDITOR'),
                  <Wrench className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'História e Árvore Tech',
                  () => nav('UI_HISTORY'),
                  <BookOpen className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'Filmes e Créditos',
                  () => nav('SUB_MOVIES'),
                  <Film className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'Perfis de Jogador',
                  () => nav('UI_PROFILE_SELECT'),
                  <Users className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn(
                  'Sobre o AOM',
                  () => nav('UI_ABOUT'),
                  <Info className="h-4 w-4 text-[#f3d27a]" />
                )}
                {renderMenuBtn('Verificar Atualizações', () => nav('UI_UPDATES'))}
                <div className="pt-1">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#f3d27a]" />
                  )}
                </div>
              </div>
            )}

            {/* MoviesSubMenu (uipregamenew.xmb) */}
            {menuState === 'SUB_MOVIES' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#f3d27a]">
                  Filmes e Créditos
                </div>
                {renderMenuBtn('Cinemática AOM', () =>
                  launchPreset('greek', 'normal', 'mediterranean', true, {
                    scenarioTitle: 'Cinemática de Abertura — AOM',
                    startingAge: 2,
                  })
                )}
                {renderMenuBtn('Cinemática Titãs', () =>
                  launchPreset('atlantean', 'normal', 'acropolis', true, {
                    scenarioTitle: 'Cinemática de Abertura — The Titans',
                    startingAge: 3,
                  })
                )}
                {renderMenuBtn('Créditos AOM', () => nav('CREDITS'))}
                {renderMenuBtn('Créditos Titãs', () => nav('CREDITS'))}
                <div className="pt-1">
                  {renderMenuBtn(
                    'Voltar',
                    () => nav('SUB_MORE'),
                    <ArrowLeft className="h-4 w-4 text-[#f3d27a]" />
                  )}
                </div>
              </div>
            )}

            {/* Exit Confirmation (exit(false) in uipregamenew.xmb) */}
            {menuState === 'UI_EXIT_CONFIRM' && (
              <div className="flex flex-col gap-3 text-center">
                <div className="font-display text-base font-bold text-[#f3d27a]">
                  Deseja sair para a tela inicial?
                </div>
                <p className="text-xs text-[#cbd5e1]">
                  Você pode retornar ao Menu Principal a qualquer momento.
                </p>
                <div className="flex gap-2 pt-1">
                  {renderMenuBtn('Sim, Sair', () => nav('SPLASH'), undefined, true)}
                  {renderMenuBtn('Cancelar', () => nav('MAIN_MENU'))}
                </div>
              </div>
            )}

            {/* Full-panel sub-screens from AoM-Native-Port */}
            {!isCompact && (
              <PortSubMenus
                menuState={menuState}
                setMenuState={setMenuState}
                options={options}
                onUpdateOptions={onUpdateOptions}
                skirmish={skirmish}
                onUpdateSkirmish={setSkirmish}
                hasSavedMatch={hasSavedMatch}
                onStartMatch={launchPreset}
                onLoadSavedMatch={onLoadSavedMatch}
                onDeleteSavedMatch={onDeleteSavedMatch}
                onBackToMain={() => setMenuState('MAIN_MENU')}
              />
            )}
          </div>

          {/* Right Fluted Column */}
          <div
            aria-hidden="true"
            className="hidden sm:flex w-5 shrink-0 flex-col justify-between border-l border-[#d4af37]/30 bg-[linear-gradient(90deg,#12161e_0%,#1a202b_35%,#262d3c_65%,#151922_100%)]"
          >
            <div className="h-3 border-b border-[#d4af37]/40 bg-[#2b3240]" />
            <div className="flex-1 opacity-35 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_3px,rgba(0,0,0,0.6)_3px,rgba(0,0,0,0.6)_5px)]" />
            <div className="h-3 border-t border-[#d4af37]/40 bg-[#151922]" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mx-auto h-2.5 w-[98%] rounded-b border-x border-b border-[#d4af37]/45 bg-gradient-to-b from-[#252c3b] to-[#10141c] shadow-xl"
        />
      </div>
    </div>
  );
}
