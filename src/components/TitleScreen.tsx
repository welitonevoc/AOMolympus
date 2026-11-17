import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Crown,
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

  // ── SPLASH STATE ──
  if (menuState === 'SPLASH') {
    return (
      <div
        onClick={() => nav('MAIN_MENU')}
        className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-[#080b11]/92 p-6 text-center cursor-pointer select-none"
      >
        <div className="rounded-xl border border-[#d4af37]/40 bg-[#101520] px-10 py-8 shadow-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#d4af37]">
            Estratégia Mitológica 3D
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#f5e3b0]">
            Age of Mythology: Olympus
          </h1>
          <p className="mt-4 text-xs text-[#94a3b8]">
            Clique na tela ou pressione qualquer tecla para continuar
          </p>
        </div>
      </div>
    );
  }

  const isCompact = COMPACT_MENU_STATES.has(menuState);
  const containerWidth = isCompact ? 'max-w-[380px]' : 'max-w-5xl';

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
      className={`flex h-10 w-full items-center justify-center gap-2.5 rounded-md border px-4 text-sm font-semibold tracking-wide transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#f3d27a] ${
        highlight
          ? 'border-[#e5c45e] bg-[#d4af37] text-[#0b0e14] font-bold hover:bg-[#e3c252]'
          : 'border-white/10 bg-[#151b26] text-[#ece6d9] hover:border-[#d4af37]/55 hover:bg-[#1c2433]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(14,19,30,0.45)_0%,rgba(6,8,13,0.88)_100%)] p-3 sm:p-6">
      {/* Top-Right Minimal Utility Strip */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0f141e]/95 p-1 shadow-lg">
        <button
          type="button"
          onClick={() => nav('UI_PROFILE_SELECT')}
          title="Selecionar Perfil de Jogador"
          className="flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium text-[#f3d27a] hover:bg-[#1b2230] cursor-pointer transition-colors"
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
          className="flex h-7 w-7 items-center justify-center rounded text-[#cbd5e1] hover:bg-[#1b2230] hover:text-white cursor-pointer transition-colors"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-[#d4af37]" />}
        </button>

        {options.showFps && (
          <div className="px-2 font-mono-num text-[11px] font-semibold text-emerald-300">
            {fps} FPS
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

      <div className={`relative w-full ${containerWidth} max-h-[calc(100vh-2rem)] flex flex-col transition-[max-width] duration-200`}>
        {/* Clean Architectural Frame */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#d4af37]/35 bg-[#0f141e]/96 shadow-[0_24px_64px_rgba(0,0,0,0.85)]">
          {/* Header Crest */}
          <div className="border-b border-white/10 bg-[#131926] px-6 py-4 text-center">
            <div className="mx-auto mb-1.5 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d4af37]/85">
              <span className="h-px w-6 bg-[#d4af37]/40" />
              <span>{PANTHEONS[skirmish.pantheon].name} · {skirmish.minorGod}</span>
              <span className="h-px w-6 bg-[#d4af37]/40" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-[0.04em] text-[#f5e3b0]">
              Age of Mythology: Olympus
            </h1>
          </div>

          {/* Menu Body */}
          <div className="relative flex-1 overflow-y-auto px-5 py-5 sm:px-6">
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
