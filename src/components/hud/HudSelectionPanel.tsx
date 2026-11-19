import { Crosshair, Volume2, X } from 'lucide-react';
import { getCivUnitSpec, TECH_SPECS } from '../../game/divineData';
import { AGE_NAMES, GameHudSnapshot, GameOptionsConfig, PANTHEONS } from '../../game/types';
import { AnimatedPortrait } from '../AnimatedPortrait';
import { EraIcon } from '../EraIcon';
import { TechIcon } from '../TechIcon';
import { UnitIcon } from '../UnitIcon';
import { getFaunaCategoryLabel } from './hudTypes';

interface HudSelectionPanelProps {
  hud: GameHudSnapshot;
  options: GameOptionsConfig;
  isProductionBuilding: boolean;
  ageReadinessPct: number;
  onToggleAgeBonuses: () => void;
  onCancelTrainingItem: (buildingId: string, index: number) => void;
}

export function HudSelectionPanel({
  hud,
  options,
  isProductionBuilding,
  ageReadinessPct,
  onToggleAgeBonuses,
  onCancelTrainingItem,
}: HudSelectionPanelProps) {
  const playerPantheon = PANTHEONS[hud.pantheon];

  return (
    <>
      {/* ZONE 3A (CENTER): AoM Player/God Header + Animated Portrait + Unit/Building Specifications */}
      <div className="md:col-span-4 flex flex-col justify-between gap-1.5 md:border-r border-[#c8a962]/20 md:pr-2">
        <div className="flex items-center justify-between gap-1.5 border-b border-[#c8a962]/25 pb-1">
          <span className="text-[10px] font-semibold text-[#f3d27a] truncate">
            {options.playerName} · {hud.majorGodName}
          </span>
          {hud.selection.count > 1 && (
            <span className="font-mono-num text-[10px] font-bold text-[#cbd5e1] shrink-0">
              ×{hud.selection.count}
            </span>
          )}
        </div>

        <div className="flex items-start gap-2">
          {/* Animated AoM Medallion Portrait + HP Bar */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <AnimatedPortrait
              selection={hud.selection}
              pantheon={hud.pantheon}
              primaryColor={playerPantheon.primaryColor}
            />
            {hud.selection.primaryType !== 'none' && hud.selection.maxHp > 0 && (
              <div className="w-[68px]">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/12">
                  <div
                    className={`h-full transition-all ${
                      hud.selection.primaryType === 'resource'
                        ? hud.selection.resourceType === 'gold'
                          ? 'bg-[#facc15]'
                          : hud.selection.resourceType === 'wood'
                          ? 'bg-[#4ade80]'
                          : 'bg-[#fb7185]'
                        : hud.selection.primaryType === 'building' && !hud.selection.isConstructed
                        ? 'bg-[#f59e0b]'
                        : 'bg-[#22c55e]'
                    }`}
                    style={{
                      width: `${Math.max(2, Math.min(100, (hud.selection.hp / hud.selection.maxHp) * 100))}%`,
                    }}
                  />
                </div>
                <div className="mt-0.5 text-center font-mono-num text-[9px] font-semibold text-[#cbd5e1]">
                  {hud.selection.hp}/{hud.selection.maxHp}
                </div>
              </div>
            )}
          </div>

          {/* Unit / Building Specifications Table */}
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <div className="font-display text-xs font-bold text-[#f5e3b0] truncate">{hud.selection.kindLabel}</div>
            <div className="text-[10px] text-[#94a3b8] truncate">
              {hud.selection.taskLabel || hud.selection.roleLabel}
            </div>

            {hud.selection.primaryType !== 'none' && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-white/8 pt-1 text-[10px]">
                {hud.selection.attack !== undefined && hud.selection.attack > 0 && (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#94a3b8]">Atq</span>
                    <span className="font-mono-num font-semibold text-[#fde68a]">{hud.selection.attack}</span>
                  </div>
                )}
                {hud.selection.speed !== undefined && hud.selection.speed > 0 && (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#94a3b8]">Vel</span>
                    <span className="font-mono-num font-semibold">{hud.selection.speed}</span>
                  </div>
                )}
                {hud.selection.hackArmorPct !== undefined && (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#94a3b8]">Corte</span>
                    <span className="font-mono-num font-semibold">{hud.selection.hackArmorPct}%</span>
                  </div>
                )}
                {hud.selection.pierceArmorPct !== undefined && (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#94a3b8]">Perf</span>
                    <span className="font-mono-num font-semibold">{hud.selection.pierceArmorPct}%</span>
                  </div>
                )}
                {hud.selection.crushArmorPct !== undefined && (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#94a3b8]">Esmag</span>
                    <span className="font-mono-num font-semibold">{hud.selection.crushArmorPct}%</span>
                  </div>
                )}
                {hud.selection.range !== undefined && hud.selection.range > 0 && (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#94a3b8]">Alc</span>
                    <span className="font-mono-num font-semibold">{hud.selection.range}</span>
                  </div>
                )}
                {hud.selection.popCost !== undefined && hud.selection.popCost > 0 && (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#94a3b8]">Pop</span>
                    <span className="font-mono-num font-semibold">{hud.selection.popCost}</span>
                  </div>
                )}
              </div>
            )}

            {hud.selection.counterTags && hud.selection.counterTags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {hud.selection.counterTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-[#d4af37]/35 bg-[#1b2232] px-1.5 py-0.5 text-[9px] font-semibold text-[#fde68a]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {hud.selection.isInfiniteResource ? (
              <div className="text-[10px] font-mono-num text-[#7dd3fc]">
                Cardume: ∞ Infinito (Pesca Contínua)
              </div>
            ) : hud.selection.primaryType === 'fauna' &&
              !hud.selection.isCarcass &&
              hud.selection.resourceMaxAmount &&
              hud.selection.resourceMaxAmount > 0 ? (
              <div className="flex flex-col gap-0.5 text-[10px]">
                <div className="font-mono-num text-[#fde68a]">
                  Alimento: {hud.selection.resourceAmount}/{hud.selection.resourceMaxAmount}
                  {hud.selection.canFatten && hud.selection.maxFattenedFood
                    ? ` (engorda até ${hud.selection.maxFattenedFood})`
                    : ''}
                </div>
                {hud.selection.faunaCategory && (
                  <div className="text-[#94a3b8]">
                    Categoria:{' '}
                    <span className="text-[#cbd5e1]">{getFaunaCategoryLabel(hud.selection.faunaCategory)}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {hud.selection.voiceLine && (
          <div
            title={`${hud.selection.voiceLine.cultureLabel} — ${hud.selection.voiceLine.translation}`}
            className={`flex items-center justify-between gap-1.5 text-[10px] ${
              hud.selection.voiceLine.action === 'attack' ? 'text-rose-300' : 'text-[#fde68a]'
            }`}
          >
            <div className="flex items-center gap-1 min-w-0">
              <Volume2 className="h-3 w-3 shrink-0 opacity-80" />
              <span className="italic font-semibold truncate">&ldquo;{hud.selection.voiceLine.phrase}&rdquo;</span>
            </div>
            <span className="text-[9px] text-[#94a3b8] truncate shrink-0 max-w-[46%]">
              {hud.selection.voiceLine.translation}
            </span>
          </div>
        )}
      </div>

      {/* ZONE 3B (RIGHT): AoM Production Queue (Cancel & Refund) / Squad Roster */}
      <div className="md:col-span-3 flex flex-col justify-between gap-1.5">
        <div className="flex items-center justify-between gap-1 border-b border-[#c8a962]/25 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] truncate">
            {isProductionBuilding
              ? 'Fila de Produção'
              : hud.selection.selectedCounts && hud.selection.selectedCounts.length > 0
              ? 'Esquadrão'
              : 'Situação'}
          </span>
          {isProductionBuilding && hud.selection.trainingQueue && (
            <span className="font-mono-num text-[10px] font-bold text-[#f3d27a]">
              {hud.selection.trainingQueue.length}/5
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-1.5">
          {hud.activeTechResearch && (
            <div className="flex items-center gap-2 rounded border border-[#facc15]/40 bg-[#231d10] px-2 py-1">
              <TechIcon techId={hud.activeTechResearch.id} size={22} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#fde68a]">
                  <span className="truncate">{TECH_SPECS[hud.activeTechResearch.id].name}</span>
                  <span className="font-mono-num shrink-0 ml-1">
                    {Math.round((hud.activeTechResearch.progress / Math.max(1, hud.activeTechResearch.total)) * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full bg-[#facc15]"
                    style={{
                      width: `${Math.min(
                        100,
                        (hud.activeTechResearch.progress / Math.max(1, hud.activeTechResearch.total)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {isProductionBuilding ? (
            <>
              {hud.selection.trainingQueue && hud.selection.trainingQueue.length > 0 && hud.selection.buildingId ? (
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-[#d4af37]"
                      style={{
                        width: `${Math.min(
                          100,
                          (hud.selection.trainingQueue[0].progress / Math.max(0.1, hud.selection.trainingQueue[0].total)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[82px] overflow-y-auto">
                    {hud.selection.trainingQueue.map((item, idx) => (
                      <button
                        key={`${item.kind}-${idx}`}
                        type="button"
                        onClick={() => onCancelTrainingItem(hud.selection.buildingId!, idx)}
                        title="Clique para cancelar e reembolsar"
                        className="group flex items-center justify-between gap-1.5 rounded border border-white/10 bg-[#151b28] px-1.5 py-0.5 text-left text-[10px] text-[#e2e8f0] hover:border-rose-400/60 hover:bg-rose-950/40 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          <UnitIcon kind={item.kind} pantheon={hud.pantheon} size={18} />
                          <span className="truncate">
                            {idx === 0 ? '▶ ' : `${idx + 1}. `}
                            {getCivUnitSpec(hud.pantheon, item.kind).name}
                          </span>
                        </span>
                        <X className="h-3 w-3 text-[#94a3b8] group-hover:text-rose-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded border border-white/5 bg-[#121722] px-2 py-2 text-[10px] text-[#64748b]">
                  Fila vazia. Escolha uma unidade à esquerda para treinar.
                </div>
              )}

              <div className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                <Crosshair className="h-3 w-3 text-[#d4af37] shrink-0" />
                <span className="truncate">
                  {hud.selection.rallyPoint
                    ? `Seta: (${hud.selection.rallyPoint.x}, ${hud.selection.rallyPoint.z})`
                    : 'Botão direito define Seta'}
                </span>
              </div>
            </>
          ) : hud.selection.selectedCounts && hud.selection.selectedCounts.length > 0 ? (
            <div className="flex flex-col gap-0.5 max-h-[112px] overflow-y-auto">
              {hud.selection.selectedCounts.map((entry) => (
                <div
                  key={entry.kind}
                  className="flex items-center justify-between gap-1.5 rounded border border-[#c8a962]/20 bg-[#131926] px-1.5 py-0.5 text-[10px] text-[#e2e8f0]"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <UnitIcon kind={entry.kind} pantheon={hud.pantheon} size={18} />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="font-mono-num font-bold text-[#f3d27a] shrink-0">×{entry.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 text-[10px] text-[#94a3b8]">
              <button
                type="button"
                onClick={onToggleAgeBonuses}
                title="Ver progresso e bônus de cada Era"
                className="flex flex-col gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-left hover:border-[#f3d27a] cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-[#e5c45e] font-semibold truncate">
                    <EraIcon age={hud.age} pantheon={hud.pantheon} size={16} active />
                    <span className="truncate">{AGE_NAMES[hud.age]}</span>
                  </span>
                  <span className="font-mono-num text-[9px] text-[#cbd5e1] shrink-0">{ageReadinessPct}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-[#d4af37] transition-[width] duration-150"
                    style={{ width: `${ageReadinessPct}%` }}
                  />
                </div>
              </button>
              <div className="flex items-center justify-between px-0.5">
                <span>Exército</span>
                <span className="font-mono-num text-white">{hud.combatUnitCount}</span>
              </div>
              <div className="flex items-center justify-between px-0.5">
                <span>População</span>
                <span className="font-mono-num text-white">
                  {hud.population}/{hud.populationCap}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
