import {
  Box,
  Building2,
  Camera,
  Compass,
  Crown,
  Flame,
  Hammer,
  Layers,
  Maximize2,
  Minimize2,
  Moon,
  Mountain,
  RotateCcw,
  Sparkles,
  Sun,
  Trees,
  X,
} from 'lucide-react';
import {
  CameraPreset,
  GalleryCategory,
  LIGHTING_PRESETS,
  LightingMood,
} from './studioTypes';

export interface StudioHeaderBarProps {
  cinemaMode: boolean;
  setCinemaMode: (value: boolean) => void;
  galleryCategory: GalleryCategory;
  setGalleryCategory: (cat: GalleryCategory) => void;
  lightingMood: LightingMood;
  setLightingMood: (mood: LightingMood) => void;
  triggerCameraPreset: (preset: CameraPreset) => void;
  onClose: () => void;
}

const STUDIO_CATEGORY_TABS = [
  { id: 'unit', label: 'Unidades & Deuses', icon: Crown },
  { id: 'building', label: 'Construções', icon: Building2 },
  { id: 'map', label: 'Mapas & Relevo', icon: Mountain },
  { id: 'terrain', label: 'Terreno', icon: Layers },
  { id: 'fauna', label: 'Fauna', icon: Compass },
  { id: 'flora', label: 'Flora & Recursos', icon: Trees },
  { id: 'utensil', label: 'Utensílios', icon: Hammer },
  { id: 'relic', label: 'Relíquias', icon: Sparkles },
] as const;

const CAMERA_PRESET_BUTTONS = [
  { id: 'iso', label: 'Iso' },
  { id: 'front', label: 'Frente' },
  { id: 'side', label: 'Lado' },
  { id: 'top', label: 'Topo' },
] as const;

const LIGHTING_MOOD_BUTTONS = [
  { id: 'studio', label: 'Estúdio', icon: Sparkles },
  { id: 'day', label: 'Dia', icon: Sun },
  { id: 'dusk', label: 'Ocaso', icon: Flame },
  { id: 'night', label: 'Noite', icon: Moon },
] as const;

export function StudioHeaderBar({
  cinemaMode,
  setCinemaMode,
  galleryCategory,
  setGalleryCategory,
  lightingMood,
  setLightingMood,
  triggerCameraPreset,
  onClose,
}: StudioHeaderBarProps) {
  if (cinemaMode) {
    return (
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCinemaMode(false)}
          className="flex items-center gap-2 rounded-lg border border-[#d4af37]/45 bg-[#0e131d]/92 px-3 py-1.5 text-xs font-semibold text-[#f5e3b0] shadow-lg hover:bg-[#182032] cursor-pointer"
        >
          <Minimize2 className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>Mostrar Interface (H)</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Fechar Galeria 3D (Esc)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0e131d]/92 text-[#d1d5db] hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <header className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-20 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 rounded-xl border border-[#d4af37]/30 bg-[#0d121c]/95 px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 text-[#f5e3b0]">
          <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="font-display text-xs sm:text-sm font-bold text-[#f5e3b0] truncate">
            Estúdio 3D · Galeria Mitológica
          </div>
          <div className="text-[10px] text-[#9ca3af] hidden md:block truncate">
            Arraste para orbitar · Scroll para zoom · Botão direito para deslocar
          </div>
        </div>
      </div>

      <nav className="order-3 lg:order-none w-full lg:w-auto flex items-center gap-1 rounded-lg border border-white/10 bg-[#080b12] p-1 overflow-x-auto max-w-full">
        {STUDIO_CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = galleryCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGalleryCategory(tab.id)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#d4af37] text-[#090c12] shadow'
                  : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-1.5">
        <div className="hidden lg:flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#080b12] p-0.5">
          <Camera className="h-3.5 w-3.5 text-[#d4af37] mx-1.5" />
          {CAMERA_PRESET_BUTTONS.map((camBtn) => (
            <button
              key={camBtn.id}
              type="button"
              onClick={() => triggerCameraPreset(camBtn.id)}
              className="rounded px-2 py-1 text-[10px] font-semibold text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              {camBtn.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => triggerCameraPreset('iso')}
            title="Resetar Câmera"
            className="rounded p-1 text-[#d4af37] hover:bg-white/10 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#080b12] p-0.5">
          {LIGHTING_MOOD_BUTTONS.map((m) => {
            const Icon = m.icon;
            const active = lightingMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setLightingMood(m.id)}
                title={`Iluminação: ${LIGHTING_PRESETS[m.id].label}`}
                className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden xl:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCinemaMode(true)}
          title="Modo Cinema (Tecla H)"
          className="flex h-8 items-center gap-1 rounded-lg border border-white/12 bg-[#141a28] px-2.5 text-[11px] font-semibold text-[#d1d5db] hover:border-[#d4af37]/40 hover:text-white cursor-pointer"
        >
          <Maximize2 className="h-3.5 w-3.5 text-[#d4af37]" />
          <span className="hidden sm:inline">Cinema</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Fechar Galeria 3D (Esc)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-[#141a28] text-[#9ca3af] hover:border-rose-400/40 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
