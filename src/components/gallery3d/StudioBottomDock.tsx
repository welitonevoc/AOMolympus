import { Eye, RotateCw } from 'lucide-react';
import { GalleryCategory } from './studioTypes';
import {
  StudioUnitBottomControls,
  StudioUnitBottomControlsProps,
} from './StudioUnitBottomControls';
import {
  StudioWorldBottomControls,
  StudioWorldBottomControlsProps,
} from './StudioWorldBottomControls';

export interface StudioBottomDockProps {
  galleryCategory: GalleryCategory;
  isGodUnit: boolean;
  focusDivine: boolean;
  setFocusDivine: React.Dispatch<React.SetStateAction<boolean>>;
  autoRotate3D: boolean;
  setAutoRotate3D: React.Dispatch<React.SetStateAction<boolean>>;
  zoomPercent: number;
  adjustZoom: (factor: number) => void;
  unitControlsProps: StudioUnitBottomControlsProps;
  worldControlsProps: Omit<StudioWorldBottomControlsProps, 'galleryCategory'>;
}

export function StudioBottomDock({
  galleryCategory,
  isGodUnit,
  focusDivine,
  setFocusDivine,
  autoRotate3D,
  setAutoRotate3D,
  zoomPercent,
  adjustZoom,
  unitControlsProps,
  worldControlsProps,
}: StudioBottomDockProps) {
  return (
    <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 rounded-xl border border-white/15 bg-[#0d121c]/95 px-2 py-1.5 sm:px-2.5 sm:py-2 shadow-[0_16px_42px_rgba(0,0,0,0.85)] max-w-[96vw] overflow-x-auto">
      {galleryCategory === 'unit' ? (
        <StudioUnitBottomControls {...unitControlsProps} />
      ) : (
        <StudioWorldBottomControls {...worldControlsProps} galleryCategory={galleryCategory} />
      )}

      {isGodUnit && (
        <button
          type="button"
          onClick={() => setFocusDivine((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            focusDivine
              ? 'bg-sky-500 text-slate-950 shadow'
              : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{focusDivine ? 'Visão Geral' : 'Focar Rosto/Arma'}</span>
        </button>
      )}

      <div className="h-5 w-px bg-white/15 mx-0.5 shrink-0" />

      <button
        type="button"
        onClick={() => setAutoRotate3D((v) => !v)}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
          autoRotate3D
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'border border-white/10 text-[#9ca3af] hover:text-white'
        }`}
      >
        <RotateCw className="h-3.5 w-3.5" />
        <span>Girar 360°</span>
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => adjustZoom(1.22)}
          title="Afastar (-)"
          className="flex h-7 w-7 items-center justify-center rounded bg-[#1a2232] text-[#f5e3b0] font-bold hover:bg-[#253046] cursor-pointer"
        >
          -
        </button>
        <span className="font-mono-num text-[11px] text-[#cbd5e1] min-w-[2.6rem] text-center">
          {zoomPercent}%
        </span>
        <button
          type="button"
          onClick={() => adjustZoom(0.82)}
          title="Aproximar (+)"
          className="flex h-7 w-7 items-center justify-center rounded bg-[#1a2232] text-[#f5e3b0] font-bold hover:bg-[#253046] cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
