import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        title="Instalar Age of Mythology: Olympus como aplicativo"
        className="flex h-7 sm:h-8 items-center gap-1.5 rounded border border-[#d4af37]/45 bg-[#1c2436] px-2.5 text-[11px] sm:text-xs font-semibold text-[#f7e9c3] hover:bg-[#253048] hover:border-[#d4af37] transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5 text-[#d4af37] shrink-0" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Instalar no iPhone ou iPad"
          className="flex h-7 sm:h-8 items-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#141c2c] px-2.5 text-[11px] sm:text-xs font-semibold text-[#f3d27a] hover:bg-[#1e2940] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Share className="h-3.5 w-3.5 shrink-0" />
          <span>Instalar iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-[#d4af37]/40 bg-[#0d1320] p-5 text-left shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[#f7e9c3]">
                  Instalar no iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Fechar"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-[#cbd5e1]">
                <li>
                  1. Toque no botão <strong className="text-white">Compartilhar</strong> na barra do Safari.
                </li>
                <li>
                  2. Role para baixo e selecione <strong className="text-white">Adicionar à Tela de Início</strong>.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-[#d4af37] py-2.5 text-sm font-semibold text-[#0b0e13] hover:bg-[#e3c254] transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
