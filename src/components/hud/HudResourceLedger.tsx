import { Crown, Eye, Sparkles, Sun, X } from 'lucide-react';
import type { GameHudSnapshot } from '../../game/types';
import { ResourceIcon } from '../ResourceIcon';
import { formatClock } from './hudTypes';

interface HudResourceLedgerProps {
  hud: GameHudSnapshot;
  showFavorPanel: boolean;
  setShowFavorPanel: (updater: boolean | ((prev: boolean) => boolean)) => void;
  onOrderPrayTemple?: (templeId?: string) => void;
  onOrderEmpowerMonument?: (buildingId?: string) => void;
  onSpreadOracles?: () => void;
  onSelectCombat: () => void;
}

export function HudResourceLedger({
  hud,
  showFavorPanel,
  setShowFavorPanel,
  onOrderPrayTemple,
  onOrderEmpowerMonument,
  onSpreadOracles,
  onSelectCombat,
}: HudResourceLedgerProps) {
  return (
    <div className="relative md:w-[164px] shrink-0 rounded-md border-2 border-[#c8a962]/70 bg-[#0d111a]/96 px-2 py-1 md:px-2.5 md:py-2 text-xs shadow-[0_10px_28px_rgba(0,0,0,0.85)]">
      {showFavorPanel && (
        <div className="absolute bottom-full left-0 mb-2 w-[min(288px,92vw)] rounded-md border-2 border-[#38bdf8]/65 bg-[#0b101b]/98 p-2.5 text-[11px] text-[#f3efe6] shadow-[0_12px_32px_rgba(0,0,0,0.9)] z-30">
          <div className="flex items-center justify-between gap-2 border-b border-[#38bdf8]/30 pb-1.5">
            <div className="flex items-center gap-1.5 font-display text-xs font-bold text-[#7dd3fc]">
              <ResourceIcon kind="favor" size={16} />
              <span>Favor Divino</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono-num text-[10px] font-bold text-[#38bdf8]">
                +{(hud.favorRatePerSec ?? 0).toFixed(2)}/s
              </span>
              <button
                type="button"
                onClick={() => setShowFavorPanel(false)}
                className="rounded p-0.5 text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <p className="mt-1.5 text-[10px] leading-snug text-[#cbd5e1]">
            {hud.pantheon === 'greek'
              ? 'Gregos: Envie aldeões para orar nos Templos (Zeus +20%, Afrodite/Maçãs de Ouro +20%).'
              : hud.pantheon === 'egyptian'
              ? 'Egípcios: Construa até 5 Monumentos passivos. Faraó e Sacerdotes de Rá energizam; Ísis cura e protege.'
              : hud.pantheon === 'norse'
              ? 'Nórdicos: Unidades e navios geram favor em combate (Hersir 3,4×, Odin +25% no Grande Salão, Bragi +1 por Ulfsark abatido).'
              : hud.pantheon === 'chinese'
              ? 'Chineses: Templos, Jardins/Monumentos e bestas sagradas (Qilin) irradiam energia Yin-Yang gerando Favor.'
              : 'Atlantes: Oráculos parados e espaçados geram favor conforme alcance de visão (Leto +15%, Réia +25%, Teia +10%).'}
          </p>

          <div className="mt-2 space-y-1 border-t border-white/10 pt-1.5">
            {(hud.favorBreakdown ?? []).map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="flex items-start justify-between gap-2 text-[10px]">
                <div className="min-w-0">
                  <div className="font-semibold text-[#e2e8f0] truncate">{item.label}</div>
                  {item.detail && <div className="text-[9px] text-[#94a3b8] leading-tight">{item.detail}</div>}
                </div>
                <span className="font-mono-num font-bold text-[#7dd3fc] shrink-0">+{item.rate.toFixed(2)}/s</span>
              </div>
            ))}
          </div>

          {hud.pantheon === 'greek' && onOrderPrayTemple && (
            <button
              type="button"
              onClick={() => onOrderPrayTemple()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#38bdf8]/60 bg-[#0d2638] px-2 py-1 text-[10px] font-bold text-[#bae6fd] hover:bg-[#13354e] cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-[#38bdf8]" />
              <span>Enviar Aldeão p/ Orar no Templo</span>
            </button>
          )}
          {hud.pantheon === 'egyptian' && onOrderEmpowerMonument && (
            <button
              type="button"
              onClick={() => onOrderEmpowerMonument()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#facc15]/60 bg-[#26200b] px-2 py-1 text-[10px] font-bold text-[#fef08a] hover:bg-[#362c0e] cursor-pointer"
            >
              <Sun className="h-3 w-3 text-[#facc15]" />
              <span>Energizar Monumento (Faraó/Sacerdote)</span>
            </button>
          )}
          {hud.pantheon === 'atlantean' && onSpreadOracles && (
            <button
              type="button"
              onClick={onSpreadOracles}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#38bdf8]/60 bg-[#0d2638] px-2 py-1 text-[10px] font-bold text-[#bae6fd] hover:bg-[#13354e] cursor-pointer"
            >
              <Eye className="h-3 w-3 text-[#38bdf8]" />
              <span>Espalhar Oráculos p/ Visão Plena</span>
            </button>
          )}
        </div>
      )}

      <div className="flex md:flex-col justify-between gap-1.5 overflow-x-auto">
        <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Alimento">
          <div className="flex items-center gap-1.5">
            <ResourceIcon kind="food" size={18} />
            <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Alim</span>
          </div>
          <span className="font-mono-num font-bold text-white">{hud.resources.food}</span>
        </div>
        <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Madeira">
          <div className="flex items-center gap-1.5">
            <ResourceIcon kind="wood" size={18} />
            <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Mad</span>
          </div>
          <span className="font-mono-num font-bold text-white">{hud.resources.wood}</span>
        </div>
        <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Ouro">
          <div className="flex items-center gap-1.5">
            <ResourceIcon kind="gold" size={18} />
            <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Ouro</span>
          </div>
          <span className="font-mono-num font-bold text-[#fde68a]">{hud.resources.gold}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowFavorPanel((v) => !v)}
          title="Favor Divino — Clique para ver fontes e comandos de geração de Favor"
          className={`flex items-center justify-between gap-1.5 rounded px-1 -mx-1 py-0.5 whitespace-nowrap cursor-pointer transition-colors ${
            showFavorPanel ? 'bg-[#0e2638] ring-1 ring-[#38bdf8]/60' : 'hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <ResourceIcon kind="favor" size={18} />
            <span className="hidden md:inline text-[10px] font-medium text-[#7dd3fc]">Favor</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono-num text-[9px] text-[#38bdf8]">+{(hud.favorRatePerSec ?? 0).toFixed(1)}</span>
            <span className="font-mono-num font-bold text-[#7dd3fc]">{hud.resources.favor}</span>
          </div>
        </button>
        <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="População">
          <div className="flex items-center gap-1.5">
            <ResourceIcon kind="pop" size={18} />
            <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Pop</span>
          </div>
          <span className="font-mono-num font-bold text-white">
            {hud.population}/{hud.populationCap}
          </span>
        </div>
      </div>

      <div className="mt-1.5 hidden md:flex items-center justify-between gap-1 border-t border-[#c8a962]/25 pt-1.5 text-[10px] text-[#94a3b8]">
        <button
          type="button"
          onClick={onSelectCombat}
          title={`Selecionar todo o Exército (${hud.combatUnitCount})`}
          className="flex items-center gap-1 text-[#cbd5e1] hover:text-[#f3d27a] cursor-pointer"
        >
          <ResourceIcon kind="army" size={16} />
          <span className="font-mono-num font-semibold">{hud.combatUnitCount}</span>
        </button>
        <span className="flex items-center gap-1 font-mono-num" title="Relíquias">
          <ResourceIcon kind="relic" size={16} />
          <span>{hud.relicsHeld}</span>
        </span>
        {hud.wonderBonusActive ? (
          <span
            title="Era das Maravilhas Ativa (+Favor, +20% Unidades Míticas, -20% Recarga)"
            className="flex items-center gap-0.5 rounded bg-[#2d2207] px-1 py-0.5 text-[9px] font-bold text-[#fde047] border border-[#facc15]/50"
          >
            <Crown className="h-2.5 w-2.5" />
            <span>Marav.</span>
          </span>
        ) : (
          <span className="font-mono-num">{formatClock(hud.elapsedSeconds)}</span>
        )}
      </div>
    </div>
  );
}
