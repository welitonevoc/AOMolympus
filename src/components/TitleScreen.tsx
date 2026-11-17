import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Crown,
  Eye,
  EyeOff,
  Film,
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
import { OlympusTitleBackdrop } from './OlympusTitleBackdrop';
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
  const [cinematicView, setCinematicView] = useState(false);
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

  // Sync title / credits soundtrack scene
  useEffect(() => {
    if (menuState === 'CREDITS') {
      soundEngine.setMusicScene('credits');
      return;
    }
    let savedPantheon: PantheonId = skirmish.pantheon;
    try {
      const stored = localStorage.getItem('aom_last_pantheon') as PantheonId | null;
      if (stored && PANTHEONS[stored]) {
        savedPantheon = stored;
      }
    } catch {}
    soundEngine.setMusicScene('title', savedPantheon);
  }, [menuState]);

  // Escape navigates back cleanly inside port menus or exits cinematic showcase
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menuState === 'SPLASH') {
        soundEngine.unlock();
        setMenuState('MAIN_MENU');
        return;
      }
      if (e.key === 'Escape') {
        if (cinematicView) {
          setCinematicView(false);
          return;
        }
        if (menuState !== 'MAIN_MENU') {
          setMenuState('MAIN_MENU');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuState, cinematicView]);

  const nav = (next: PortMenuState) => {
    soundEngine.unlock();
    soundEngine.playSelect();
    setCinematicView(false);
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

  const renderOlympusFiligree = () => (
    <div className="animate-aom-divider mx-auto my-2.5 flex items-center justify-center gap-2 text-[#d4af37]/75">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/45 to-[#d4af37]/80" />
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true">
        <path
          d="M12 1L15.2 6L12 11L8.8 6L12 1Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="rgba(212,175,55,0.22)"
        />
        <path d="M1 6H7M17 6H23" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d4af37]/45 to-[#d4af37]/80" />
    </div>
  );

  // ── SPLASH STATE ──
  if (menuState === 'SPLASH') {
    return (
      <div
        onClick={() => nav('MAIN_MENU')}
        className="fixed inset-0 z-30 flex flex-col items-center justify-end pb-14 p-6 text-center cursor-pointer select-none"
      >
        <OlympusTitleBackdrop paused={uvModalOpen} cinematicMode={true} />

        <div className="relative z-10 animate-aom-crest max-w-xl rounded-xl border border-[#d4af37]/40 bg-[#080d17]/88 px-10 py-8 shadow-[0_28px_72px_rgba(0,0,0,0.85)]">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.05em] text-[#f6e6b8] text-balance">
            Age of Mythology: Olympus
          </h1>
          {renderOlympusFiligree()}
          <p className="mt-2 text-xs tracking-wide text-[#cbd5e1]">
            Clique na tela ou pressione qualquer tecla para continuar
          </p>
        </div>
      </div>
    );
  }

  const isCompact = COMPACT_MENU_STATES.has(menuState);
  const containerWidth = isCompact ? 'max-w-[400px]' : 'max-w-5xl';

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
      className={`group flex min-h-[42px] w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#f3d27a] ${
        highlight
          ? 'border-[#f3d27a]/85 bg-gradient-to-r from-[#d4af37] via-[#e4c158] to-[#c99e28] text-[#090d16] font-bold shadow-[0_8px_24px_rgba(212,175,55,0.28)] hover:brightness-105'
          : 'border-white/10 bg-[#121826]/92 text-[#ece6d9] hover:border-[#d4af37]/60 hover:bg-[#192235] hover:translate-x-0.5'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </span>
      <span
        aria-hidden="true"
        className={`text-xs transition-transform duration-150 group-hover:translate-x-0.5 ${
          highlight ? 'text-[#090d16]/75' : 'text-[#d4af37]/60 group-hover:text-[#f3d27a]'
        }`}
      >
        ›
      </span>
    </button>
  );

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center p-4 sm:p-6 ${
        isCompact && !cinematicView
          ? 'justify-center lg:justify-start lg:pl-12 xl:pl-16'
          : 'justify-center'
      }`}
    >
      {/* Epic Real-Time Animated 3D Mount Olympus Scene */}
      <OlympusTitleBackdrop
        paused={uvModalOpen}
        cinematicMode={isCompact && cinematicView}
      />

      {/* Deeper Contrast Scrim Only When Wide Setup Modals Are Open */}
      {!isCompact && (
        <div className="pointer-events-none fixed inset-0 z-[1] bg-[#050914]/70" />
      )}

      {/* Top-Right Minimal Utility Strip */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0b101b]/92 p-1 shadow-lg">
        <button
          type="button"
          onClick={() => nav('UI_PROFILE_SELECT')}
          title="Selecionar Perfil de Jogador"
          className="flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium text-[#f3d27a] hover:bg-[#182032] cursor-pointer transition-colors whitespace-nowrap shrink-0"
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
          className="flex h-8 w-8 items-center justify-center rounded text-[#cbd5e1] hover:bg-[#182032] hover:text-white cursor-pointer transition-colors"
        >
          {muted ? (
            <VolumeX className="h-4 w-4 text-rose-400" />
          ) : (
            <Volume2 className="h-4 w-4 text-[#d4af37]" />
          )}
        </button>

        {options.showFps && (
          <div className="px-2 font-mono-num text-[11px] font-semibold text-emerald-300 whitespace-nowrap">
            {fps} FPS
          </div>
        )}
      </div>

      {/* Bottom-Right Live Olympus Scene Stage Bar */}
      {isCompact && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-lg border border-[#d4af37]/30 bg-[#0b101b]/92 px-3 py-1.5 shadow-xl">
          <span className="hidden sm:inline text-[11px] font-medium text-[#cbd5e1] whitespace-nowrap">
            Monte Olimpo
          </span>
          <button
            type="button"
            onClick={() => setCinematicView((v) => !v)}
            className="flex h-7 items-center gap-1.5 rounded-md border border-white/15 bg-[#151c2c] px-2.5 text-[11px] font-semibold text-[#e2e8f0] hover:border-[#d4af37]/45 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {cinematicView ? (
              <>
                <Eye className="h-3.5 w-3.5 text-[#d4af37]" />
                <span>Mostrar Menu</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5 text-[#9ca3af]" />
                <span>Vista Livre</span>
              </>
            )}
          </button>
        </div>
      )}

      <HopliteUvBuilderModal
        isOpen={uvModalOpen}
        onClose={() => setUvModalOpen(false)}
        activeMode={options.hopliteRenderMode ?? '3d'}
        activeTier={options.hopliteArmorTier ?? 3}
        onSelectMode={(mode) => onUpdateOptions({ ...options, hopliteRenderMode: mode })}
        onSelectTier={(tier) => onUpdateOptions({ ...options, hopliteArmorTier: tier })}
      />

      {/* Main Architectural Menu Rail / Submenu Container */}
      <div
        className={`relative z-10 w-full ${containerWidth} max-h-[calc(100vh-2rem)] flex flex-col transition-all duration-300 ${
          isCompact && cinematicView
            ? '-translate-x-[120%] opacity-0 pointer-events-none'
            : 'translate-x-0 opacity-100'
        }`}
      >
        <div className="animate-aom-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#d4af37]/38 bg-[#0a0f1a]/92 shadow-[0_28px_72px_rgba(0,0,0,0.85)]">
          {/* Monumental Header Crest */}
          <div className="animate-aom-crest border-b border-white/10 bg-gradient-to-b from-[#131b2b] to-[#0d1320] px-6 pt-5 pb-3.5 text-center">
            <h1 className="font-display text-2xl font-bold tracking-[0.04em] text-[#f7e9c3] text-balance">
              Age of Mythology: Olympus
            </h1>

            {renderOlympusFiligree()}
          </div>

          {/* Menu Body */}
          <div className="relative flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {menuState === 'MAIN_MENU' && (
              <div className="flex flex-col gap-2">
                {hasSavedMatch &&
                  renderMenuBtn(
                    'Continuar Partida Salva',
                    () => {
                      soundEngine.unlock();
                      soundEngine.playSelect();
                      onLoadSavedMatch();
                    },
                    <Play className="h-4 w-4 text-emerald-300" />
                  )}
                {renderMenuBtn(
                  'Um Jogador',
                  () => nav('SUB_SINGLE_PLAYER'),
                  <Swords className="h-4 w-4 text-[#0b0e14]" />,
                  true
                )}
                {renderMenuBtn(
                  'Campanha',
                  () => nav('SUB_CAMPAIGN'),
                  <Compass className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Multijogador',
                  () => nav('SUB_MULTIPLAYER'),
                  <Network className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Aprender a Jogar',
                  () => nav('SUB_LEARN'),
                  <BookOpen className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Opções',
                  () => nav('UI_OPTIONS_AUDIO'),
                  <SlidersHorizontal className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Galeria 3D',
                  () => {
                    soundEngine.unlock();
                    soundEngine.playSelect();
                    setUvModalOpen(true);
                  },
                  <Shield className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Mais',
                  () => nav('SUB_MORE'),
                  <Crown className="h-4 w-4 text-[#d4af37]" />
                )}
                <div className="mt-1 border-t border-white/8 pt-2">
                  {renderMenuBtn(
                    'Sair',
                    () => nav('UI_EXIT_CONFIRM'),
                    <Power className="h-4 w-4 text-rose-300" />
                  )}
                </div>
              </div>
            )}

            {menuState === 'SUB_LEARN' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Aprender a Jogar
                </div>
                {renderMenuBtn(
                  'Tutorial',
                  () =>
                    launchPreset('greek', 'normal', 'mediterranean', true, {
                      scenarioTitle: 'Tutorial — A Ilha do Aprendizado',
                      startingResources: 'high',
                    }),
                  <Play className="h-4 w-4 text-[#0b0e14]" />,
                  true
                )}
                {renderMenuBtn('Introdução Nórdica', () =>
                  launchPreset('norse', 'normal', 'alfheim', true, {
                    scenarioTitle: 'Introdução Nórdica (Alfheim)',
                    startingAge: 2,
                  })
                )}
                {renderMenuBtn('Introdução Egípcia', () =>
                  launchPreset('egyptian', 'normal', 'nile', true, {
                    scenarioTitle: 'Introdução Egípcia (Rio Nilo)',
                    startingAge: 2,
                  })
                )}
                {renderMenuBtn('Introdução Atlante', () =>
                  launchPreset('atlantean', 'normal', 'acropolis', true, {
                    scenarioTitle: 'Introdução Atlante (Titans)',
                    startingAge: 2,
                  })
                )}
                <div className="mt-1 border-t border-white/8 pt-2">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#d4af37]" />
                  )}
                </div>
              </div>
            )}

            {menuState === 'SUB_CAMPAIGN' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Campanha
                </div>
                {renderMenuBtn(
                  'A Queda do Tridente',
                  () => nav('UI_CAMPAIGN'),
                  <Compass className="h-4 w-4 text-[#0b0e14]" />,
                  true
                )}
                {renderMenuBtn('A Nova Atlântida (Titãs)', () => nav('UI_CAMPAIGN'))}
                {renderMenuBtn(
                  hasSavedMatch ? 'Carregar Jogo Salvo' : 'Jogos Salvos',
                  () => nav('UI_GAME_LIST'),
                  <HardDrive className="h-4 w-4 text-[#d4af37]" />
                )}
                <div className="mt-1 border-t border-white/8 pt-2">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#d4af37]" />
                  )}
                </div>
              </div>
            )}

            {menuState === 'SUB_SINGLE_PLAYER' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Um Jogador
                </div>
                {renderMenuBtn(
                  'Escaramuça (Mapa Aleatório)',
                  () => nav('UI_SINGLE_PLAYER_SETUP'),
                  <Swords className="h-4 w-4 text-[#0b0e14]" />,
                  true
                )}
                {renderMenuBtn('Campanhas', () => nav('UI_CAMPAIGN'))}
                {renderMenuBtn('Carregar Cenário', () => nav('UI_LOAD_SCENARIO'))}
                {renderMenuBtn('Carregar Jogo Salvo', () => nav('UI_GAME_LIST'))}
                {renderMenuBtn('Jogos Gravados', () => nav('UI_RECORDED_GAMES'))}
                <div className="mt-1 border-t border-white/8 pt-2">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#d4af37]" />
                  )}
                </div>
              </div>
            )}

            {menuState === 'SUB_MULTIPLAYER' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Multijogador
                </div>
                {renderMenuBtn(
                  'LAN / IP Direto',
                  () => nav('MULTIPLAYER_LAN'),
                  <Network className="h-4 w-4 text-[#0b0e14]" />,
                  true
                )}
                {renderMenuBtn(
                  'Online (ESO)',
                  () => nav('UI_MP_ESO'),
                  <Globe className="h-4 w-4 text-[#d4af37]" />
                )}
                <div className="mt-1 border-t border-white/8 pt-2">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#d4af37]" />
                  )}
                </div>
              </div>
            )}

            {menuState === 'SUB_MORE' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Mais Recursos
                </div>
                {renderMenuBtn('Jogos Gravados', () => nav('UI_RECORDED_GAMES'))}
                {renderMenuBtn(
                  'Editor de Cenários',
                  () => nav('UI_EDITOR'),
                  <Wrench className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'História e Árvore Tech',
                  () => nav('UI_HISTORY'),
                  <BookOpen className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Filmes e Créditos',
                  () => nav('SUB_MOVIES'),
                  <Film className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Perfis de Jogador',
                  () => nav('UI_PROFILE_SELECT'),
                  <Users className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn(
                  'Sobre o Jogo',
                  () => nav('UI_ABOUT'),
                  <Info className="h-4 w-4 text-[#d4af37]" />
                )}
                {renderMenuBtn('Verificar Atualizações', () => nav('UI_UPDATES'))}
                <div className="mt-1 border-t border-white/8 pt-2">
                  {renderMenuBtn(
                    'Menu Principal',
                    () => nav('MAIN_MENU'),
                    <ArrowLeft className="h-4 w-4 text-[#d4af37]" />
                  )}
                </div>
              </div>
            )}

            {menuState === 'SUB_MOVIES' && (
              <div className="flex flex-col gap-2">
                <div className="mb-1 text-center font-display text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                  Filmes e Créditos
                </div>
                {renderMenuBtn('Cinemática de Abertura', () =>
                  launchPreset('greek', 'normal', 'mediterranean', true, {
                    scenarioTitle: 'Cinemática de Abertura — AOM',
                    startingAge: 2,
                  })
                )}
                {renderMenuBtn('Cinemática dos Titãs', () =>
                  launchPreset('atlantean', 'normal', 'acropolis', true, {
                    scenarioTitle: 'Cinemática de Abertura — The Titans',
                    startingAge: 3,
                  })
                )}
                {renderMenuBtn('Créditos', () => nav('CREDITS'))}
                <div className="mt-1 border-t border-white/8 pt-2">
                  {renderMenuBtn(
                    'Voltar',
                    () => nav('SUB_MORE'),
                    <ArrowLeft className="h-4 w-4 text-[#d4af37]" />
                  )}
                </div>
              </div>
            )}

            {menuState === 'UI_EXIT_CONFIRM' && (
              <div className="flex flex-col gap-3 text-center">
                <div className="font-display text-base font-bold text-[#f3d27a]">
                  Voltar para a tela inicial?
                </div>
                <p className="text-xs text-[#94a3b8]">
                  Você poderá retornar ao Menu Principal a qualquer momento.
                </p>
                <div className="flex gap-2 pt-1">
                  {renderMenuBtn('Sim, Sair', () => nav('SPLASH'), undefined, true)}
                  {renderMenuBtn('Cancelar', () => nav('MAIN_MENU'))}
                </div>
              </div>
            )}

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
        </div>
      </div>
    </div>
  );
}
