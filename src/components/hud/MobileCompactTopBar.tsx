import React from 'react';
import {
  Coins,
  Crown,
  Menu,
  Sparkles,
  Trees,
  Users,
  Wheat,
} from 'lucide-react';
import { AGE_NAMES, AgeLevel, GameHudSnapshot } from '../../game/types';

interface MobileCompactTopBarProps {
  hud: GameHudSnapshot;
  nextAge: AgeLevel | null;
  canAffordNextAge: boolean;
  isAdvancingAge: boolean;
  ageAdvancePct: number;
  onAdvanceAge: () => void;
  onOpenPauseMenu: () => void;
}

const ROMAN_AGE: Record<AgeLevel, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

/**
 * Compact 48px single-row top bar exclusively for mobile viewports (< md).
 * Keeps aggregate sticky chrome under 15% of viewport height so >=85% remains playable 3D canvas.
 */
export const MobileCompactTopBar: React.FC<MobileCompactTopBarProps> = ({
  hud,
  nextAge,
  canAffordNextAge,
  isAdvancingAge,
  ageAdvancePct,
  onAdvanceAge,
  onOpenPauseMenu,
}) => {
  if (hud.phase !== 'playing') return null;

  const popFull = hud.population >= hud.populationCap;

  return (
    <div className="fixed top-0 inset-x-0 z-30 md:hidden pointer-events-none">
      <div className="pointer-events-auto flex h-12 items-center justify-between gap-1 border-b border-[#c8a962]/45 bg-[#0b101b]/92 px-2 shadow-lg backdrop-blur-md">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#fde68a] tabular-nums shrink-0">
            <Wheat className="h-3.5 w-3.5 text-amber-400" />
            <span>{Math.floor(hud.resources.food)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#d6b38c] tabular-nums shrink-0">
            <Trees className="h-3.5 w-3.5 text-emerald-400" />
            <span>{Math.floor(hud.resources.wood)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#facc15] tabular-nums shrink-0">
            <Coins className="h-3.5 w-3.5 text-yellow-400" />
            <span>{Math.floor(hud.resources.gold)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#93c5fd] tabular-nums shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>{Math.floor(hud.resources.favor)}</span>
          </div>
          <div
            className={`flex items-center gap-0.5 text-[11px] font-bold tabular-nums shrink-0 ${
              popFull ? 'text-rose-300' : 'text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {hud.population}/{hud.populationCap}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onAdvanceAge}
            disabled={!nextAge || isAdvancingAge}
            aria-label={nextAge ? `Avançar para ${AGE_NAMES[nextAge]}` : AGE_NAMES[hud.age]}
            className={`flex min-h-[36px] min-w-[44px] items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-bold transition-colors cursor-pointer ${
              isAdvancingAge
                ? 'border-sky-400/70 bg-sky-950/70 text-sky-200'
                : canAffordNextAge
                  ? 'border-[#facc15] bg-[#d4af37]/25 text-[#fef08a] animate-pulse'
                  : 'border-white/15 bg-[#151c2c] text-[#e2e8f0]'
            }`}
          >
            <Crown className="h-3.5 w-3.5 text-[#facc15]" />
            <span className="tabular-nums">
              {isAdvancingAge ? `${Math.round(ageAdvancePct)}%` : ROMAN_AGE[hud.age]}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenPauseMenu}
            aria-label="Abrir menu de pausa"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#c8a962]/45 bg-[#151c2c] text-[#f7e9c3] active:bg-[#232f47] cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {(hud.activeBuildMode || hud.activeGodPowerMode) && (
        <div className="mx-2 mt-1.5 flex items-center justify-center rounded-lg border border-[#facc15]/60 bg-[#0b101b]/92 px-3 py-1 text-[11px] font-semibold text-[#fef08a] shadow-md backdrop-blur-md">
          {hud.activeBuildMode
            ? 'Toque no terreno para posicionar a construção'
            : 'Toque no mapa para lançar o Poder Divino'}
        </div>
      )}
    </div>
  );
};
