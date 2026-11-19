import React from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Hand,
  MousePointerClick,
  Swords,
  Users,
  X,
} from 'lucide-react';
import { GameHudSnapshot } from '../../game/types';

interface MobileTouchActionBarProps {
  hud: GameHudSnapshot;
  dockCollapsed: boolean;
  onToggleDock: () => void;
  onSetCameraPanMode: (mode: 'pan' | 'select') => void;
  onSelectIdleVillager: () => void;
  onFocusTownCenter: () => void;
  onSelectCombat: () => void;
  onCancelMode: () => void;
}

/**
 * Ergonomic thumb-zone mobile touch bar (md:hidden) with >= 44x44px hitboxes.
 * Keeps the 3D battlefield unobstructed while giving one-thumb access to camera/select mode,
 * idle villagers, town center, army selection, command dock drawer, and active mode cancel.
 */
export const MobileTouchActionBar: React.FC<MobileTouchActionBarProps> = ({
  hud,
  dockCollapsed,
  onToggleDock,
  onSetCameraPanMode,
  onSelectIdleVillager,
  onFocusTownCenter,
  onSelectCombat,
  onCancelMode,
}) => {
  if (hud.phase !== 'playing') return null;

  const isPanMode = hud.cameraPanMode === 'pan';
  const hasActiveMode = Boolean(hud.activeBuildMode || hud.activeGodPowerMode);

  return (
    <div className="fixed bottom-2 left-2 right-[138px] z-30 md:hidden pointer-events-auto transition-all duration-200">
      <div className="flex items-center gap-1 rounded-xl border border-[#d4af37]/35 bg-[#0b101b]/92 p-1 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => onSetCameraPanMode(isPanMode ? 'select' : 'pan')}
          aria-label={isPanMode ? 'Alternar para Seleção' : 'Alternar para Mover Câmera'}
          className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${
            isPanMode
              ? 'bg-[#d4af37]/20 text-[#f7e9c3] border border-[#d4af37]/50'
              : 'bg-[#151c2c] text-[#cbd5e1] border border-white/10'
          }`}
        >
          {isPanMode ? (
            <Hand className="h-4 w-4 text-[#d4af37]" />
          ) : (
            <MousePointerClick className="h-4 w-4 text-sky-300" />
          )}
          <span className="whitespace-nowrap">{isPanMode ? 'Câmera' : 'Seleção'}</span>
        </button>

        <button
          type="button"
          onClick={onSelectIdleVillager}
          aria-label="Selecionar aldeão ocioso"
          className={`relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border px-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${
            hud.idleVillagerCount > 0
              ? 'border-amber-400/60 bg-amber-950/50 text-amber-200'
              : 'border-white/10 bg-[#151c2c] text-[#cbd5e1]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span className="whitespace-nowrap tabular-nums">
            Ald.{hud.idleVillagerCount > 0 ? ` ${hud.idleVillagerCount}` : ''}
          </span>
        </button>

        <button
          type="button"
          onClick={onFocusTownCenter}
          aria-label="Focar Centro Urbano"
          className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-white/10 bg-[#151c2c] px-1.5 text-[10px] font-semibold text-[#cbd5e1] active:bg-[#222d44] cursor-pointer"
        >
          <Building2 className="h-4 w-4 text-[#d4af37]" />
          <span className="whitespace-nowrap">Base</span>
        </button>

        <button
          type="button"
          onClick={onSelectCombat}
          aria-label="Selecionar exército"
          className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-white/10 bg-[#151c2c] px-1.5 text-[10px] font-semibold text-[#cbd5e1] active:bg-[#222d44] cursor-pointer"
        >
          <Swords className="h-4 w-4 text-rose-300" />
          <span className="whitespace-nowrap">Tropas</span>
        </button>

        {hasActiveMode ? (
          <button
            type="button"
            onClick={onCancelMode}
            aria-label="Cancelar modo ativo"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border border-rose-400/60 bg-rose-950/70 px-2 text-[10px] font-semibold text-rose-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="whitespace-nowrap">Cancelar</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleDock}
            aria-label={dockCollapsed ? 'Abrir comandos' : 'Fechar comandos'}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border border-[#d4af37]/45 bg-[#1b2436] px-2 text-[10px] font-semibold text-[#f7e9c3] cursor-pointer"
          >
            {dockCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="whitespace-nowrap">{dockCollapsed ? 'Comandos' : 'Fechar'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
