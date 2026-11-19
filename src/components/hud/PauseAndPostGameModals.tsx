import { useState } from 'react';
import { Crown, Flag, RotateCcw, Save, Shield, SlidersHorizontal } from 'lucide-react';
import { AGE_NAMES, GameHudSnapshot, MAPS, PANTHEONS } from '../../game/types';
import { EraIcon } from '../EraIcon';
import { MatchTimelineModal } from '../MatchTimelineModal';
import { formatClock, PausePrompt, PostGameTab } from './hudTypes';

interface PauseAndPostGameModalsProps {
  hud: GameHudSnapshot;
  hasSavedMatch: boolean;
  pausePrompt: PausePrompt;
  setPausePrompt: (prompt: PausePrompt) => void;
  showTimelineOverlay: boolean;
  setShowTimelineOverlay: (show: boolean) => void;
  onOpenPlayerOptions: () => void;
  onSaveMatch: () => void;
  onLoadSavedMatch: () => void;
  onRestart: () => void;
  onResign: () => void;
  onReturnTitle: () => void;
  onTogglePause: () => void;
}

export function PauseAndPostGameModals({
  hud,
  hasSavedMatch,
  pausePrompt,
  setPausePrompt,
  showTimelineOverlay,
  setShowTimelineOverlay,
  onOpenPlayerOptions,
  onSaveMatch,
  onLoadSavedMatch,
  onRestart,
  onResign,
  onReturnTitle,
  onTogglePause,
}: PauseAndPostGameModalsProps) {
  const [postGameTab, setPostGameTab] = useState<PostGameTab>('summary');
  const playerPantheon = PANTHEONS[hud.pantheon];

  return (
    <>
      {/* IN-GAME MENU MODAL */}
      {hud.phase === 'paused' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/75 p-2.5 sm:p-4">
          <div className="w-full max-w-sm max-h-[calc(100dvh-1.25rem)] overflow-y-auto rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-4 sm:p-5 text-center shadow-2xl">
            {pausePrompt === 'menu' && (
              <>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f3d27a]">Menu do Jogo</h2>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  WASD move · Q/E gira · Roda do Mouse zoom · Esc/F10 pausa
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onOpenPlayerOptions}
                    className="flex items-center justify-center gap-2 rounded border border-[#d4af37]/40 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#e5c45e]" />
                    <span>Opções do Jogador</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSaveMatch}
                    className="flex items-center justify-center gap-2 rounded border border-white/15 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5 text-[#e5c45e]" />
                    <span>Salvar Jogo</span>
                  </button>
                  {hasSavedMatch && (
                    <button
                      type="button"
                      onClick={onLoadSavedMatch}
                      className="rounded border border-white/15 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                    >
                      Carregar Jogo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPausePrompt('confirm_restart')}
                    className="rounded border border-white/15 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                  >
                    Reiniciar Partida
                  </button>
                  <button
                    type="button"
                    onClick={() => setPausePrompt('confirm_resign')}
                    className="flex items-center justify-center gap-1.5 rounded border border-rose-500/35 bg-[#241519] px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-[#331d23] cursor-pointer"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Render-se (Resign)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onReturnTitle}
                    className="rounded border border-white/10 bg-transparent px-4 py-2 text-xs font-medium text-[#9ca3af] hover:text-white cursor-pointer"
                  >
                    Voltar ao Menu Principal
                  </button>
                  <button
                    type="button"
                    onClick={onTogglePause}
                    className="mt-1 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#0b0e13] hover:bg-[#e5c45e] cursor-pointer"
                  >
                    Retomar Jogo
                  </button>
                </div>
              </>
            )}

            {pausePrompt === 'confirm_restart' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-[#f3d27a]">Reiniciar a partida?</h3>
                <p className="text-xs text-[#cbd5e1]">O progresso não salvo da batalha atual será perdido.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPausePrompt('menu');
                      onRestart();
                    }}
                    className="flex-1 rounded bg-[#d4af37] py-2 text-xs font-bold text-[#0b0e13] cursor-pointer"
                  >
                    Sim, Reiniciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPausePrompt('menu')}
                    className="flex-1 rounded border border-white/15 bg-[#171c26] py-2 text-xs text-[#e6dfd1] cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              </div>
            )}

            {pausePrompt === 'confirm_resign' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-rose-300">Tem certeza que deseja se render?</h3>
                <p className="text-xs text-[#cbd5e1]">Isso encerrará a partida e exibirá a tela pós-jogo.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPausePrompt('menu');
                      onResign();
                    }}
                    className="flex-1 rounded bg-rose-600 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    Sim, Render-se
                  </button>
                  <button
                    type="button"
                    onClick={() => setPausePrompt('menu')}
                    className="flex-1 rounded border border-white/15 bg-[#171c26] py-2 text-xs text-[#e6dfd1] cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIVE / REPLAY TIMELINE OVERLAY MODAL */}
      {showTimelineOverlay && (
        <MatchTimelineModal
          timeline={hud.timelineHistory ?? []}
          playerName={hud.majorGodName}
          enemyName={hud.enemyMajorGodName}
          playerScore={hud.playerScore}
          enemyScore={hud.enemyScore}
          elapsedSeconds={hud.elapsedSeconds}
          onClose={() => setShowTimelineOverlay(false)}
        />
      )}

      {/* POST-GAME SCREEN (Tabs + Timeline Charts) */}
      {(hud.phase === 'victory' || hud.phase === 'defeat') && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/82 p-2.5 sm:p-4">
          <div
            className={`w-full ${
              postGameTab === 'timeline' ? 'max-w-2xl' : 'max-w-lg'
            } max-h-[calc(100dvh-1.25rem)] overflow-y-auto rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-4 sm:p-6 text-center shadow-2xl transition-all`}
          >
            <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#1b212e]">
              {hud.phase === 'victory' ? (
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#facc15]" />
              ) : (
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[#ef4444]" />
              )}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#f8f4ea]">
              {hud.phase === 'victory' ? 'Vitória Gloriosa' : 'Derrota no Vale'}
            </h2>
            <p className="mt-1 text-xs text-[#9ca3af]">
              {hud.phase === 'victory'
                ? 'A fortaleza rival caiu diante do poder do seu panteão.'
                : `Sua campanha foi encerrada diante das forças de ${PANTHEONS[hud.enemyPantheon].deity}.`}
            </p>

            {/* Post-Game Tabs */}
            <div className="mt-4 flex gap-1.5 border-b border-white/10 pb-2">
              {(
                [
                  { id: 'summary', label: 'Resumo' },
                  { id: 'timeline', label: 'Gráficos' },
                  { id: 'military', label: 'Militar' },
                  { id: 'economy', label: 'Economia' },
                  { id: 'divine', label: 'Divino' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPostGameTab(t.id)}
                  className={`flex-1 rounded border py-1.5 text-xs font-semibold cursor-pointer ${
                    postGameTab === t.id
                      ? 'border-[#f3d27a] bg-[#262f40] text-[#f3d27a]'
                      : 'border-white/10 bg-[#171c26] text-[#cbd5e1]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {postGameTab === 'timeline' && (
              <div className="mt-4 text-left">
                <MatchTimelineModal
                  inline
                  timeline={hud.timelineHistory ?? []}
                  playerName={hud.majorGodName}
                  enemyName={hud.enemyMajorGodName}
                  playerScore={hud.playerScore}
                  enemyScore={hud.enemyScore}
                  elapsedSeconds={hud.elapsedSeconds}
                />
              </div>
            )}

            {postGameTab === 'summary' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Duração</div>
                  <div className="font-mono-num text-base font-bold text-white">
                    {formatClock(hud.elapsedSeconds)}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Era Alcançada</div>
                  <div className="mt-0.5 flex items-center gap-2 text-sm font-bold text-[#f3d27a]">
                    <EraIcon age={hud.age} pantheon={hud.pantheon} size={22} active />
                    <span>{AGE_NAMES[hud.age]}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Mapa</div>
                  <div className="text-sm font-bold text-white">{MAPS[hud.mapId].name}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Panteão</div>
                  <div className="text-sm font-bold text-white">{playerPantheon.name}</div>
                </div>
              </div>
            )}

            {postGameTab === 'military' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Inimigos Derrotados</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.enemiesDefeated}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Unidades Treinadas</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.unitsTrained}</div>
                </div>
              </div>
            )}

            {postGameTab === 'economy' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Edifícios Erguidos</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.buildingsBuilt}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Centros da Cidade</div>
                  <div className="font-mono-num text-base font-bold text-white">
                    {hud.playerTownCenterCount}/{hud.maxTownCenters}
                  </div>
                </div>
              </div>
            )}

            {postGameTab === 'divine' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Poderes Lançados</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.powersCast}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Favor Restante</div>
                  <div className="font-mono-num text-base font-bold text-[#38bdf8]">{hud.resources.favor}</div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onRestart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#0b0e13] hover:bg-[#e5c45e] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={onReturnTitle}
                className="rounded-lg border border-white/15 bg-[#171c26] px-4 py-2.5 text-xs font-semibold text-[#e6dfd1] hover:bg-[#222938] cursor-pointer"
              >
                Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
