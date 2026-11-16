import React, { useState } from 'react';
import { AOM_HOPLITE_UV_TIERS, HopliteArmorTier } from '../civilizacao/gregos/gregosModels';

export interface HopliteArmorTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: HopliteArmorTier;
  onSelectTier: (tier: HopliteArmorTier) => void;
}

export const HopliteArmorTierModal: React.FC<HopliteArmorTierModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
}) => {
  const [selectedTier, setSelectedTier] = useState<HopliteArmorTier>(currentTier);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectTier(selectedTier);
    onClose();
  };

  const activeSpec = AOM_HOPLITE_UV_TIERS[selectedTier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-600/50 rounded-xl shadow-2xl overflow-hidden text-stone-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border-b border-amber-600/30">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-amber-400 font-serif">
                Arsenal Olímpico — Inspetor de Tiers do Hoplita
              </h2>
              <p className="text-xs text-stone-400">
                Gerencie as texturas UV globais e esquemas de armadura de infantaria pesada
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 transition-colors p-1 rounded-lg hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Tier Selection List */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">
              Selecione o Tier de Armadura
            </label>
            <div className="space-y-2">
              {([1, 2, 3, 4] as HopliteArmorTier[]).map((t) => {
                const spec = AOM_HOPLITE_UV_TIERS[t];
                const isSelected = selectedTier === t;
                return (
                  <div
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-stone-800/50 border-stone-700/60 hover:bg-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          T{t}
                        </span>
                        <span className="text-sm font-medium text-stone-200">{spec.name}</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-1">{spec.subtitle}</p>
                    </div>
                    {isSelected && (
                      <span className="text-amber-400 text-sm font-bold">●</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Spec Details & Color Palette Preview */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                Identificador UV / Mapeamento
              </span>
              <div className="text-sm font-mono text-amber-300 bg-stone-900 px-2.5 py-1 rounded border border-stone-800 mt-1">
                {activeSpec.id}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                Caminho da Textura
              </span>
              <div
                className="text-xs font-mono text-stone-300 truncate bg-stone-900 px-2.5 py-1.5 rounded border border-stone-800 mt-1"
                title={activeSpec.url}
              >
                {activeSpec.url}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1.5">
                Paleta de Cores Hexadecimais
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-stone-900 p-2 rounded border border-stone-800">
                  <div
                    className="w-full h-6 rounded mb-1 border border-black/30"
                    style={{ backgroundColor: `#${activeSpec.armorHex.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="text-stone-400 font-mono">Couraça</span>
                </div>
                <div className="bg-stone-900 p-2 rounded border border-stone-800">
                  <div
                    className="w-full h-6 rounded mb-1 border border-black/30"
                    style={{ backgroundColor: `#${activeSpec.accentHex.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="text-stone-400 font-mono">Detalhe</span>
                </div>
                <div className="bg-stone-900 p-2 rounded border border-stone-800">
                  <div
                    className="w-full h-6 rounded mb-1 border border-black/30"
                    style={{ backgroundColor: `#${activeSpec.greaveHex.toString(16).padStart(6, '0')}` }}
                  />
                  <span className="text-stone-400 font-mono">Grevas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-stone-950 border-t border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-sm font-semibold text-stone-950 bg-amber-500 hover:bg-amber-400 transition-colors rounded-lg shadow-lg shadow-amber-500/20"
          >
            Aplicar Tier Global
          </button>
        </div>
      </div>
    </div>
  );
};
