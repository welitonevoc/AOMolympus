import { useState } from 'react';
import { soundEngine } from '../../game/audio';
import {
  getCivBuildingSpec,
  getCivUnitSpec,
  getMinorGodSpec,
  TECH_SPECS,
} from '../../game/divineData';
import { AI_PERSONALITY_LABELS } from '../../game/multiplayerTypes';
import {
  AGE_NAMES,
  AgeLevel,
  GameHudSnapshot,
  GameOptionsConfig,
  PANTHEONS,
  ResourceType,
} from '../../game/types';
import { BuildingIcon } from '../BuildingIcon';
import { EraIcon, getEraSubtitle } from '../EraIcon';
import { TechIcon } from '../TechIcon';
import { UnitIcon } from '../UnitIcon';
import { formatClock, GAME_TYPE_LABELS, InGameDialog } from './hudTypes';

type BuildingSpecItem = ReturnType<typeof getCivBuildingSpec>;
type UnitSpecItem = ReturnType<typeof getCivUnitSpec>;
type TechSpecItem = (typeof TECH_SPECS)[keyof typeof TECH_SPECS];

interface InGameDialogsModalProps {
  hud: GameHudSnapshot;
  options: GameOptionsConfig;
  activeDialog: Exclude<InGameDialog, 'none'>;
  buildingList: BuildingSpecItem[];
  unitList: UnitSpecItem[];
  techList: TechSpecItem[];
  onClose: () => void;
  onUpdateOptions: (next: GameOptionsConfig) => void;
  onExchangeTribute: (from: ResourceType, to: ResourceType, amount: number) => void;
  onSendTribute?: (targetSlot: number, resource: 'food' | 'wood' | 'gold', amount: number) => void;
  onToggleProjectionMode?: () => void;
  onToggleHopliteMode?: () => void;
  onToggleDayNightCycle?: () => void;
  onCycleScaleProfile?: () => void;
}

export function InGameDialogsModal({
  hud,
  options,
  activeDialog,
  buildingList,
  unitList,
  techList,
  onClose,
  onUpdateOptions,
  onExchangeTribute,
  onSendTribute,
  onToggleProjectionMode,
  onToggleHopliteMode,
  onToggleDayNightCycle,
  onCycleScaleProfile,
}: InGameDialogsModalProps) {
  const [tributeFrom, setTributeFrom] = useState<ResourceType>('food');
  const [tributeTo, setTributeTo] = useState<ResourceType>('gold');
  const [musicTrackTick, setMusicTrackTick] = useState(0);

  const playerPantheon = PANTHEONS[hud.pantheon];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/70 p-2.5 sm:p-4">
      <div className="w-full max-w-3xl max-h-[calc(100dvh-1.25rem)] flex flex-col overflow-hidden rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-3.5 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-[#d4af37]/25 pb-2.5 shrink-0">
          <h3 className="font-display text-sm sm:text-lg font-bold text-[#f3d27a] truncate">
            {activeDialog === 'techtree'
              ? `Árvore Tecnológica — ${playerPantheon.name} (${hud.majorGodName})`
              : activeDialog === 'objectives'
              ? 'Objetivos da Partida'
              : activeDialog === 'diplomacy'
              ? 'Status dos Jogadores e Diplomacia'
              : activeDialog === 'tribute'
              ? 'Tributo e Mercado Divino'
              : 'Opções do Jogador'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded border border-[#d4af37]/40 bg-[#181e29] px-3 py-1 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {activeDialog === 'techtree' && (
          <div className="mt-3 space-y-3 flex-1 min-h-0 overflow-y-auto text-xs pr-0.5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as AgeLevel[]).map((era) => {
                const current = hud.age === era;
                const unlocked = hud.age >= era;
                return (
                  <div
                    key={era}
                    className={`flex items-center gap-2 rounded border px-2 py-1.5 ${
                      current
                        ? 'border-[#facc15] bg-[#241e10]'
                        : unlocked
                        ? 'border-[#d4af37]/35 bg-[#161b26]'
                        : 'border-white/10 bg-[#10141c] opacity-75'
                    }`}
                  >
                    <EraIcon age={era} pantheon={hud.pantheon} size={26} active={current} locked={!unlocked} />
                    <div className="min-w-0">
                      <div
                        className={`text-[10px] font-bold truncate ${
                          current ? 'text-[#fde68a]' : unlocked ? 'text-white' : 'text-[#94a3b8]'
                        }`}
                      >
                        {AGE_NAMES[era]}
                      </div>
                      <div className="text-[9px] text-[#9ca3af] truncate">{getEraSubtitle(era, hud.pantheon)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded border border-white/10 bg-[#161b26] p-3">
                <div className="mb-2 font-bold text-[#f3d27a]">Edificações ({playerPantheon.name})</div>
                <div className="space-y-1.5">
                  {buildingList.map((b) => (
                    <div key={b.kind} className="flex items-center justify-between gap-2 rounded bg-[#10141c] px-2 py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <BuildingIcon kind={b.kind} pantheon={hud.pantheon} size={20} />
                        <span className={hud.age >= b.minAge ? 'text-white font-semibold truncate' : 'text-[#64748b] truncate'}>
                          {b.name}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-[#e5c45e] shrink-0">
                        <EraIcon age={b.minAge} pantheon={hud.pantheon} size={15} locked={hud.age < b.minAge} />
                        <span>{AGE_NAMES[b.minAge].replace('Era ', '')}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded border border-white/10 bg-[#161b26] p-3">
                <div className="mb-2 font-bold text-[#f3d27a]">Tropas & Bestas Míticas</div>
                <div className="space-y-1.5">
                  {[...unitList, ...(hud.titansEnabled ? [getCivUnitSpec(hud.pantheon, 'titan')] : [])].map((u) => (
                    <div key={u.kind} className="flex items-center justify-between gap-2 rounded bg-[#10141c] px-2 py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <UnitIcon kind={u.kind} pantheon={hud.pantheon} size={20} />
                        <span
                          className={
                            hud.age >= u.minAge
                              ? u.isMythic
                                ? 'text-[#38bdf8] font-semibold truncate'
                                : 'text-white font-semibold truncate'
                              : 'text-[#64748b] truncate'
                          }
                        >
                          {u.name}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-[#e5c45e] shrink-0">
                        <EraIcon age={u.minAge} pantheon={hud.pantheon} size={15} locked={hud.age < u.minAge} />
                        <span>Atq {u.attack}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded border border-white/10 bg-[#161b26] p-3">
                <div className="mb-2 font-bold text-[#f3d27a]">Tecnologias & Deuses Menores</div>
                <div className="space-y-1.5">
                  {hud.chosenMinorGods.length > 0 && (
                    <div className="rounded border border-[#d4af37]/30 bg-[#1d2230] px-2.5 py-1.5 text-[11px] text-[#fde68a]">
                      Adorados: {hud.chosenMinorGods.map((id) => getMinorGodSpec(id).name).join(' · ')}
                    </div>
                  )}
                  {techList
                    .filter((t) => !t.pantheons || t.pantheons.includes(hud.pantheon))
                    .map((t) => {
                      const done = hud.researchedTechs.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          title={t.description}
                          className="flex items-center justify-between gap-2 rounded bg-[#10141c] px-2 py-1.5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <TechIcon techId={t.id} size={22} className="shrink-0" />
                            <div className="min-w-0">
                              <div className={done ? 'text-emerald-300 font-semibold truncate' : 'text-[#cbd5e1] truncate'}>
                                {t.name}
                              </div>
                              {t.requiresMinorGodLabel && (
                                <div className="text-[9px] text-[#c084fc] truncate">{t.requiresMinorGodLabel}</div>
                              )}
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] text-[#e5c45e] shrink-0">
                            <EraIcon age={t.minAge} pantheon={hud.pantheon} size={15} locked={hud.age < t.minAge} />
                            <span>{done ? 'Concluída' : AGE_NAMES[t.minAge].replace('Era ', '')}</span>
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDialog === 'objectives' && (
          <div className="mt-4 space-y-2.5 text-xs text-[#cbd5e1]">
            <div className="rounded border border-[#d4af37]/30 bg-[#161b26] p-3">
              <div className="font-bold text-[#f3d27a]">Objetivo Principal — {GAME_TYPE_LABELS[hud.gameType]}</div>
              <p className="mt-1">
                {hud.gameType === 'regicide'
                  ? `Proteja seu Regente e elimine o Regente ou todos os Centros da Cidade de ${PANTHEONS[hud.enemyPantheon].name}.`
                  : hud.gameType === 'conquest'
                  ? `Destrua todas as unidades e edificações de ${PANTHEONS[hud.enemyPantheon].name} (${PANTHEONS[hud.enemyPantheon].deity}).`
                  : `Destrua todos os Centros da Cidade de ${PANTHEONS[hud.enemyPantheon].name} (${PANTHEONS[hud.enemyPantheon].deity}) para conquistar a vitória.`}
              </p>
            </div>
            <div className="rounded border border-white/10 bg-[#161b26] p-3">
              <div className="font-bold text-[#e6dfd1]">Objetivos Estratégicos</div>
              <ul className="mt-1 list-disc pl-4 space-y-1 text-[#9ca3af]">
                <li>
                  Expanda sobre os Assentamentos Neutros próximos (TCs ativos: {hud.playerTownCenterCount}/
                  {hud.maxTownCenters}).
                </li>
                <li>
                  Construa um Templo para gerar Favor Divino, guardar Relíquias ({hud.relicsHeld} capturadas) e invocar bestas
                  míticas.
                </li>
                <li>
                  Pesquise melhorias na Armaria e no Quartel e avance até a{' '}
                  {hud.titansEnabled ? 'Era dos Titãs (Era V)' : 'Era Mítica'}.
                </li>
                {hud.treatyRemaining > 0 && (
                  <li className="text-emerald-300">
                    Tratado de Paz ativo: {formatClock(hud.treatyRemaining)} restantes para preparar sua economia.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeDialog === 'diplomacy' && (
          <div className="mt-4 space-y-2 text-xs flex-1 min-h-0 overflow-y-auto pr-0.5">
            <div className="grid grid-cols-12 rounded bg-[#1b2230] px-3 py-2 font-bold text-[#f3d27a]">
              <span className="col-span-4">Jogador</span>
              <span className="col-span-3">Civilização</span>
              <span className="col-span-2">Era</span>
              <span className="col-span-1 text-right">Pts</span>
              <span className="col-span-2 text-right">Postura</span>
            </div>
            {hud.factionScores && hud.factionScores.length > 0 ? (
              hud.factionScores.map((f) => {
                const isAlly = f.team === 'player' && !f.isSelf;
                const persLabel =
                  !f.isHuman && f.aiPersonality ? AI_PERSONALITY_LABELS[f.aiPersonality]?.label.split(' ')[0] : null;
                return (
                  <div
                    key={f.slotIndex}
                    className={`flex flex-col gap-1.5 rounded border px-3 py-2 ${
                      f.isSelf
                        ? 'border-[#d4af37]/60 bg-[#182235] text-white'
                        : 'border-white/10 bg-[#161b26] text-[#cbd5e1]'
                    } ${f.defeated ? 'opacity-50' : ''}`}
                  >
                    <div className="grid grid-cols-12 items-center gap-1">
                      <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0 border border-white/30"
                          style={{ backgroundColor: f.colorHex }}
                        />
                        <span className="font-semibold truncate">{f.label}</span>
                        {persLabel && (
                          <span className="rounded bg-[#0f1624] px-1 py-0.5 text-[9px] text-[#94a3b8] shrink-0">
                            {persLabel}
                          </span>
                        )}
                      </div>
                      <span className="col-span-3 truncate">
                        {PANTHEONS[f.pantheon]?.name ?? f.pantheon} ({f.majorGod})
                      </span>
                      <span className="col-span-2 flex items-center gap-1 min-w-0">
                        <EraIcon age={f.age} pantheon={f.pantheon} size={16} active />
                        <span className="truncate">{AGE_NAMES[f.age].replace('Era ', '')}</span>
                      </span>
                      <span className="col-span-1 text-right font-mono-num font-bold text-[#fde68a]">{f.score}</span>
                      <span
                        className={`col-span-2 text-right font-semibold ${
                          f.defeated
                            ? 'text-slate-400'
                            : f.isSelf
                            ? 'text-[#86efac]'
                            : isAlly
                            ? 'text-[#7dd3fc]'
                            : 'text-[#fca5a5]'
                        }`}
                      >
                        {f.defeated
                          ? 'Derrotado'
                          : f.isSelf
                          ? 'Você'
                          : isAlly
                          ? `Aliado T${f.teamIndex}`
                          : `Inimigo T${f.teamIndex}`}
                      </span>
                    </div>
                    {isAlly && !f.defeated && onSendTribute && (
                      <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-white/8 pt-1.5 text-[10px]">
                        <span className="text-[#94a3b8]">Enviar Tributo (+100):</span>
                        {(
                          [
                            { res: 'food', label: 'Alim' },
                            { res: 'wood', label: 'Mad' },
                            { res: 'gold', label: 'Ouro' },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.res}
                            type="button"
                            disabled={hud.resources[item.res] < 100}
                            onClick={() => onSendTribute(f.slotIndex, item.res, 100)}
                            className="rounded border border-[#d4af37]/45 bg-[#1b2436] px-2 py-0.5 font-semibold text-[#fde68a] hover:bg-[#26324a] disabled:opacity-40 cursor-pointer"
                          >
                            +100 {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                <div className="grid grid-cols-4 items-center rounded border border-white/10 bg-[#161b26] px-3 py-2 text-white">
                  <span className="font-semibold">{options.playerName}</span>
                  <span>
                    {playerPantheon.name} ({hud.majorGodName})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <EraIcon age={hud.age} pantheon={hud.pantheon} size={18} active />
                    <span>{AGE_NAMES[hud.age]}</span>
                  </span>
                  <span className="text-[#86efac] font-semibold">Você</span>
                </div>
                <div className="grid grid-cols-4 items-center rounded border border-white/10 bg-[#161b26] px-3 py-2 text-[#cbd5e1]">
                  <span className="font-semibold">IA ({hud.difficulty.toUpperCase()})</span>
                  <span>
                    {PANTHEONS[hud.enemyPantheon].name} ({PANTHEONS[hud.enemyPantheon].deity})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <EraIcon age={hud.enemyAge} pantheon={hud.enemyPantheon} size={18} active />
                    <span>{AGE_NAMES[hud.enemyAge]}</span>
                  </span>
                  <span className="text-[#fca5a5] font-semibold">Inimigo</span>
                </div>
              </>
            )}
          </div>
        )}

        {activeDialog === 'tribute' && (
          <div className="mt-4 space-y-3 text-xs text-[#cbd5e1]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>Converta excedentes no Mercado Divino com taxas dinâmicas de oferta e procura:</p>
              <div className="flex items-center gap-2 font-mono-num text-[11px] text-[#f3d27a]">
                <span>Alim {(hud.marketRates.food * 100).toFixed(0)}%</span>
                <span>·</span>
                <span>Mad {(hud.marketRates.wood * 100).toFixed(0)}%</span>
                <span>·</span>
                <span>Ouro {(hud.marketRates.gold * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 font-semibold text-[#f3d27a]">Enviar / Converter</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['food', 'wood', 'gold', 'favor'] as ResourceType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTributeFrom(r)}
                      className={`rounded border px-2 py-1.5 font-semibold cursor-pointer ${
                        tributeFrom === r ? 'border-[#f3d27a] bg-[#262f40] text-white' : 'border-white/10 bg-[#171c26]'
                      }`}
                    >
                      {r === 'food' ? 'Alimento' : r === 'wood' ? 'Madeira' : r === 'gold' ? 'Ouro' : 'Favor'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 font-semibold text-[#f3d27a]">Receber</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['food', 'wood', 'gold', 'favor'] as ResourceType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTributeTo(r)}
                      className={`rounded border px-2 py-1.5 font-semibold cursor-pointer ${
                        tributeTo === r ? 'border-[#f3d27a] bg-[#262f40] text-white' : 'border-white/10 bg-[#171c26]'
                      }`}
                    >
                      {r === 'food' ? 'Alimento' : r === 'wood' ? 'Madeira' : r === 'gold' ? 'Ouro' : 'Favor'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              {[50, 100].map((amt) => {
                const baseRate = tributeTo === 'favor' ? 0.25 : tributeFrom === 'favor' ? 2.5 : 0.8;
                const sellFactor = tributeFrom === 'favor' ? 1 : hud.marketRates[tributeFrom];
                const buyFactor = tributeTo === 'favor' ? 1 : hud.marketRates[tributeTo];
                const previewGain =
                  tributeFrom === tributeTo ? 0 : Math.max(1, Math.round(amt * baseRate * (sellFactor / buyFactor)));
                return (
                  <button
                    key={amt}
                    type="button"
                    disabled={tributeFrom === tributeTo || hud.resources[tributeFrom] < amt}
                    onClick={() => onExchangeTribute(tributeFrom, tributeTo, amt)}
                    className="flex-1 rounded border border-[#f5d77f] bg-[#d4af37] py-2 font-bold text-[#0d1017] disabled:opacity-40 cursor-pointer"
                  >
                    Trocar {amt} {previewGain > 0 ? `(→ +${previewGain})` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeDialog === 'player_options' && (
          <div className="mt-3 sm:mt-4 space-y-2 flex-1 min-h-0 overflow-y-auto pr-0.5 text-xs">
            <button
              type="button"
              onClick={() => onUpdateOptions({ ...options, musicEnabled: !options.musicEnabled })}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
            >
              <span>Música Dinâmica</span>
              <span className={options.musicEnabled ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                {options.musicEnabled ? 'LIGADO' : 'DESLIGADO'}
              </span>
            </button>
            {(() => {
              void musicTrackTick;
              const info = soundEngine.getCurrentMusicInfo();
              return (
                <div className="flex w-full items-center justify-between gap-2 rounded border border-[#d4af37]/30 bg-[#141a26] px-4 py-2">
                  <div className="min-w-0 text-left">
                    <div className="font-semibold text-[#f3d27a] truncate">{info.displayTitle}</div>
                    <div className="text-[10px] text-gray-400 truncate">{info.subtitle}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.unlock();
                      soundEngine.skipToNextMusicTrack();
                      setMusicTrackTick((t) => t + 1);
                    }}
                    className="shrink-0 rounded border border-[#d4af37]/45 bg-[#202736] px-2.5 py-1 text-[11px] font-semibold text-[#f3d27a] hover:border-[#f3d27a] cursor-pointer"
                  >
                    Próxima Música
                  </button>
                </div>
              );
            })()}
            <button
              type="button"
              onClick={() => onUpdateOptions({ ...options, sfxEnabled: !options.sfxEnabled })}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
            >
              <span>Efeitos Sonoros</span>
              <span className={options.sfxEnabled ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                {options.sfxEnabled ? 'LIGADO' : 'DESLIGADO'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateOptions({ ...options, showFps: !options.showFps })}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
            >
              <span>Exibir FPS</span>
              <span className={options.showFps ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                {options.showFps ? 'LIGADO' : 'DESLIGADO'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                const next = options.gameSpeed < 0.9 ? 1.0 : options.gameSpeed < 1.3 ? 1.5 : 0.8;
                onUpdateOptions({ ...options, gameSpeed: next });
              }}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-[#f3d27a] cursor-pointer"
            >
              <span>Velocidade do Jogo</span>
              <span className="font-mono-num">{options.gameSpeed.toFixed(1)}x</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const next = options.cameraSensitivity < 0.9 ? 1.0 : options.cameraSensitivity < 1.4 ? 1.5 : 0.5;
                onUpdateOptions({ ...options, cameraSensitivity: next });
              }}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-[#f3d27a] cursor-pointer"
            >
              <span>Sensibilidade da Câmera</span>
              <span className="font-mono-num">{options.cameraSensitivity.toFixed(1)}x</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const nextMode = (hud.projectionMode ?? options.projectionMode) === '2.5d' ? '3d' : '2.5d';
                onUpdateOptions({ ...options, projectionMode: nextMode });
              }}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
            >
              <div className="text-left">
                <div>Projeção do Jogo</div>
                <div className="text-[10px] text-gray-400 font-normal">
                  {(hud.projectionMode ?? options.projectionMode) === '2.5d'
                    ? '2.5D Isométrico (Projeção Ortográfica AoM)'
                    : '3D Perspectiva Livre'}
                </div>
              </div>
              <span
                className={(hud.projectionMode ?? options.projectionMode) === '2.5d' ? 'text-[#f3d27a]' : 'text-sky-400'}
              >
                {(hud.projectionMode ?? options.projectionMode) === '2.5d' ? '2.5D ISOMÉTRICO' : '3D PERSPECTIVA'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                const cur = hud.hopliteRenderMode ?? options.hopliteRenderMode ?? '3d';
                const nextMode =
                  cur === '3d' ? 'brg' : cur === 'brg' ? 'uv2d' : cur === 'uv2d' ? 'sprite' : '3d';
                onUpdateOptions({ ...options, hopliteRenderMode: nextMode });
              }}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
            >
              <div className="text-left">
                <div>Visual do Hoplita</div>
                <div className="text-[10px] text-gray-400 font-normal">
                  {(hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'sprite'
                    ? 'Folha PNG 2.5D (Billboard)'
                    : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'brg'
                    ? '2.5D BRG Vertex-Cache (AoM Nativo)'
                    : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'uv2d'
                    ? '2D Paper-Doll (Atlas UV 64x64)'
                    : 'Modelo 3D Real (Poligonal)'}
                </div>
              </div>
              <span
                className={
                  (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'sprite'
                    ? 'text-amber-400'
                    : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'brg'
                    ? 'text-purple-400'
                    : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'uv2d'
                    ? 'text-sky-400'
                    : 'text-emerald-400'
                }
              >
                {(hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'sprite'
                  ? '2.5D SPRITE'
                  : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'brg'
                  ? '2.5D BRG'
                  : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'uv2d'
                  ? '2D UV'
                  : '3D REAL'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                const nextVal = !(hud.dayNightCycle ?? options.dayNightCycle);
                onUpdateOptions({ ...options, dayNightCycle: nextVal });
              }}
              className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer hover:bg-[#1f2533]"
            >
              <div className="text-left">
                <div>Ciclo Dinâmico Dia &amp; Noite</div>
                <div className="text-[10px] text-gray-400 font-normal">Órbita solar contínua e iluminação dinâmica</div>
              </div>
              <span className={(options.dayNightCycle ?? hud.dayNightCycle) ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                {(options.dayNightCycle ?? hud.dayNightCycle) ? 'LIGADO' : 'DESLIGADO'}
              </span>
            </button>
            {onCycleScaleProfile && (
              <button
                type="button"
                onClick={onCycleScaleProfile}
                className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer hover:bg-[#1f2533]"
              >
                <span>Proporção Global (Edifícios vs Unidades)</span>
                <span className="text-[#f3d27a]">
                  {hud.scaleProfile === 'monumental'
                    ? 'Monumental'
                    : hud.scaleProfile === 'realistic'
                    ? 'Realista'
                    : hud.scaleProfile === 'compact'
                    ? 'Compacta'
                    : 'Clássica'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
