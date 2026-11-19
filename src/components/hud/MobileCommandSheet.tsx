import React, { useState } from 'react';
import {
  BookOpen,
  Crown,
  Hammer,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import { getCivGodPowerSpec } from '../../game/divineData';
import {
  AGE_NAMES,
  AgeLevel,
  BuildingKind,
  BuildingStats,
  GameHudSnapshot,
  GodPowerId,
  TechId,
  TechSpec,
  UnitKind,
  UnitStats,
} from '../../game/types';
import { formatCost } from './hudTypes';

type SheetTab = 'build' | 'train' | 'powers' | 'tech';

interface MobileCommandSheetProps {
  open: boolean;
  onClose: () => void;
  hud: GameHudSnapshot;
  buildingList: BuildingStats[];
  unitList: UnitStats[];
  powerList: ReturnType<typeof getCivGodPowerSpec>[];
  techList: TechSpec[];
  nextAge: AgeLevel | null;
  nextAgeCost: { food?: number; wood?: number; gold?: number; favor?: number } | null;
  canAffordNextAge: boolean;
  isAdvancingAge: boolean;
  ageAdvancePct: number;
  onStartBuild: (kind: BuildingKind) => void;
  onTrainUnit: (kind: UnitKind) => void;
  onActivateGodPower: (id: GodPowerId) => void;
  onResearchTech: (id: TechId) => void;
  onAdvanceAge: () => void;
}

function canAffordCost(
  res: GameHudSnapshot['resources'],
  cost: { food?: number; wood?: number; gold?: number; favor?: number },
): boolean {
  return (
    res.food >= (cost.food ?? 0) &&
    res.wood >= (cost.wood ?? 0) &&
    res.gold >= (cost.gold ?? 0) &&
    res.favor >= (cost.favor ?? 0)
  );
}

/**
 * Touch-first bottom sheet command drawer for smartphones (< md).
 * Uses >= 44px hitboxes, drag handle affordance, category tabs, and auto-dismiss on placement actions.
 */
export const MobileCommandSheet: React.FC<MobileCommandSheetProps> = ({
  open,
  onClose,
  hud,
  buildingList,
  unitList,
  powerList,
  techList,
  nextAge,
  nextAgeCost,
  canAffordNextAge,
  isAdvancingAge,
  ageAdvancePct,
  onStartBuild,
  onTrainUnit,
  onActivateGodPower,
  onResearchTech,
  onAdvanceAge,
}) => {
  const [tab, setTab] = useState<SheetTab>('build');

  if (!open || hud.phase !== 'playing') return null;

  const visibleTechs = techList.filter((t) => {
    if (t.pantheons && !t.pantheons.includes(hud.pantheon)) return false;
    if (hud.researchedTechs.includes(t.id)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar gaveta de comandos"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
      />

      {/* Bottom Sheet Panel */}
      <div className="relative z-10 flex max-h-[70vh] flex-col rounded-t-3xl border-t-2 border-[#c8a962]/75 bg-[#0d121e]/98 shadow-[0_-12px_40px_rgba(0,0,0,0.85)]">
        {/* Drag Handle & Header */}
        <div className="flex flex-col items-center px-4 pt-2.5 pb-2 border-b border-white/10">
          <div className="h-1.5 w-10 rounded-full bg-slate-500/70 mb-2" />
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold tracking-wide text-[#f7e9c3]">
                Central de Comandos
              </h2>
              <p className="text-[11px] text-slate-400">
                {hud.selection.primaryType !== 'none' && hud.selection.kindLabel
                  ? hud.selection.kindLabel
                  : `${AGE_NAMES[hud.age]} · ${hud.majorGodName}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/15 bg-[#151c2c] text-slate-200 active:bg-[#222d44] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Age Up Quick Banner */}
          {nextAge && (
            <button
              type="button"
              onClick={() => {
                onAdvanceAge();
                if (canAffordNextAge) onClose();
              }}
              disabled={isAdvancingAge}
              className={`mt-2 flex w-full min-h-[44px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer ${
                isAdvancingAge
                  ? 'border-sky-400/60 bg-sky-950/50 text-sky-200'
                  : canAffordNextAge
                    ? 'border-[#facc15] bg-[#d4af37]/20 text-[#fef08a]'
                    : 'border-white/10 bg-[#141a29] text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Crown className="h-4 w-4 text-[#facc15] shrink-0" />
                <span className="truncate text-xs font-bold">
                  {isAdvancingAge
                    ? `Avançando Era (${Math.round(ageAdvancePct)}%)`
                    : `Avançar para ${AGE_NAMES[nextAge]}`}
                </span>
              </div>
              {nextAgeCost && !isAdvancingAge && (
                <span className="text-[10px] font-mono-num shrink-0">
                  {formatCost(nextAgeCost)}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 gap-1 px-3 py-2 border-b border-white/10 bg-[#0a0f19]">
          {(
            [
              { id: 'build', label: 'Construir', icon: Hammer },
              { id: 'train', label: 'Treinar', icon: Swords },
              { id: 'powers', label: 'Poderes', icon: Sparkles },
              { id: 'tech', label: 'Pesquisas', icon: BookOpen },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'border-[#d4af37]/75 bg-[#d4af37]/20 text-[#fef08a]'
                    : 'border-white/10 bg-[#151c2c] text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {tab === 'build' && (
            <div className="grid grid-cols-2 gap-2">
              {buildingList.map((b) => {
                const locked = hud.age < b.minAge;
                const affordable = !locked && canAffordCost(hud.resources, b.cost);
                return (
                  <button
                    key={b.kind}
                    type="button"
                    onClick={() => {
                      onStartBuild(b.kind);
                      onClose();
                    }}
                    disabled={locked}
                    className={`flex min-h-[58px] flex-col justify-between rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                      locked
                        ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                        : affordable
                          ? 'border-[#c8a962]/50 bg-[#171f31] text-slate-100 active:bg-[#232f48]'
                          : 'border-white/10 bg-[#131927] text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight line-clamp-1">
                      {b.name}
                    </span>
                    <span className="mt-1 text-[10px] font-mono-num text-[#e7cf8e]">
                      {locked ? `Era ${b.minAge}` : formatCost(b.cost)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'train' && (
            <div className="grid grid-cols-2 gap-2">
              {unitList.map((u) => {
                const locked = hud.age < u.minAge;
                const affordable = !locked && canAffordCost(hud.resources, u.cost);
                return (
                  <button
                    key={u.kind}
                    type="button"
                    onClick={() => onTrainUnit(u.kind)}
                    disabled={locked}
                    className={`flex min-h-[58px] flex-col justify-between rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                      locked
                        ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                        : affordable
                          ? 'border-sky-400/40 bg-[#171f31] text-slate-100 active:bg-[#232f48]'
                          : 'border-white/10 bg-[#131927] text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight line-clamp-1">
                      {u.name}
                    </span>
                    <span className="mt-1 text-[10px] font-mono-num text-sky-200">
                      {locked ? `Era ${u.minAge}` : formatCost(u.cost)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'powers' && (
            <div className="grid grid-cols-1 gap-2">
              {powerList.map((p) => {
                const cd = Math.ceil(hud.godPowerCooldowns[p.id] ?? 0);
                const onCd = cd > 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={onCd}
                    onClick={() => {
                      onActivateGodPower(p.id);
                      onClose();
                    }}
                    className={`flex min-h-[60px] items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      onCd
                        ? 'border-white/10 bg-[#111725] text-slate-500'
                        : 'border-amber-400/55 bg-gradient-to-r from-[#1c2336] to-[#261f16] text-amber-100 active:brightness-110'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#fef08a] truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-1">{p.description}</div>
                    </div>
                    <span className="shrink-0 rounded-lg border border-amber-400/40 bg-black/30 px-2 py-1 text-[11px] font-bold tabular-nums">
                      {onCd ? `${cd}s` : 'Lançar'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'tech' && (
            <div className="grid grid-cols-1 gap-2">
              {visibleTechs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Todas as tecnologias disponíveis já foram pesquisadas.
                </div>
              ) : (
                visibleTechs.slice(0, 24).map((t) => {
                  const locked = hud.age < t.minAge;
                  const affordable = !locked && canAffordCost(hud.resources, t.cost);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={locked}
                      onClick={() => onResearchTech(t.id)}
                      className={`flex min-h-[56px] items-center justify-between gap-2 rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                        locked
                          ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                          : affordable
                            ? 'border-emerald-400/45 bg-[#172130] text-slate-100 active:bg-[#223147]'
                            : 'border-white/10 bg-[#131927] text-slate-400'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {t.description}
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono-num text-emerald-300">
                        {locked ? `Era ${t.minAge}` : formatCost(t.cost)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
