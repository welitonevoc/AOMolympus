import {
  Compass,
  Eye,
  Flame,
  Layers,
  Pause,
  Play,
  Shield,
  Shuffle,
  Skull,
  Sparkles,
  Sun,
  Trees,
  Users,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import { AtlanteanFortressAction } from '../../civilizacao/atlantes/atlanteanFortressModel';
import {
  ATLANTEAN_ARCH_BUILDING_META,
  isAtlanteanArchBuilding,
  resolveAtlanteanArchGod,
} from '../../civilizacao/atlantes/atlanteanArchitectureSuite';
import {
  EGYPT_ARCH_BUILDING_META,
  isEgyptianArchBuilding,
  resolveEgyptianArchGod,
} from '../../civilizacao/egipcios/egyptianArchitectureSuite';
import { GreekFortressAction } from '../../civilizacao/gregos/greekFortressModel';
import { NorseFortressAction } from '../../civilizacao/nordicos/norseFortressModel';
import { AgeLevel, BuildingKind, MapId, PantheonId, WorldSizeId } from '../../game/types';
import { rollTotalWarVariant, rollUnknownMapVariant, WORLD_SIZE_SPECS } from '../../maps';
import { GalleryFloraItem } from '../gallery3dCatalog';
import { GalleryTerrainItem } from '../gallery3dTerrain';
import { GalleryCategory } from './studioTypes';

export interface StudioWorldBottomControlsProps {
  galleryCategory: Exclude<GalleryCategory, 'unit'>;
  selectedCiv: PantheonId;
  selectedMajorGod: string;
  setSelectedMajorGod: (god: string) => void;
  selectedBuilding: BuildingKind;
  buildingAge: AgeLevel;
  setBuildingAge: (age: AgeLevel) => void;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
  fortressAction: GreekFortressAction;
  setFortressAction: (a: GreekFortressAction) => void;
  atlanteanFortressAction: AtlanteanFortressAction;
  setAtlanteanFortressAction: (a: AtlanteanFortressAction) => void;
  norseFortressAction: NorseFortressAction;
  setNorseFortressAction: (a: NorseFortressAction) => void;
  templeAction: 'favor' | 'milagre';
  setTempleAction: (a: 'favor' | 'milagre') => void;
  focusDivine: boolean;
  setFocusDivine: React.Dispatch<React.SetStateAction<boolean>>;
  showHumanScale: boolean;
  setShowHumanScale: React.Dispatch<React.SetStateAction<boolean>>;

  selectedMap: MapId;
  mapWorldSize: WorldSizeId;
  setMapWorldSize: (sz: WorldSizeId) => void;
  mapWireframe: boolean;
  setMapWireframe: React.Dispatch<React.SetStateAction<boolean>>;
  mapShowFlora: boolean;
  setMapShowFlora: React.Dispatch<React.SetStateAction<boolean>>;
  mapShowFauna: boolean;
  setMapShowFauna: React.Dispatch<React.SetStateAction<boolean>>;
  setMapSeedTick: React.Dispatch<React.SetStateAction<number>>;

  faunaAnim: 'idle' | 'walk' | 'run';
  setFaunaAnim: (a: 'idle' | 'walk' | 'run') => void;

  artifactAuraActive: boolean;
  setArtifactAuraActive: React.Dispatch<React.SetStateAction<boolean>>;

  selectedTerrainItem: GalleryTerrainItem;
  terrainVariantSeed: number;
  setTerrainVariantSeed: React.Dispatch<React.SetStateAction<number>>;
  terrainFxActive: boolean;
  setTerrainFxActive: React.Dispatch<React.SetStateAction<boolean>>;
  terrainWireframe: boolean;
  setTerrainWireframe: React.Dispatch<React.SetStateAction<boolean>>;
  terrainRedTide: boolean;
  setTerrainRedTide: React.Dispatch<React.SetStateAction<boolean>>;

  selectedFloraItem: GalleryFloraItem;
  floraVariantSeed: number;
  setFloraVariantSeed: React.Dispatch<React.SetStateAction<number>>;
  floraWind: boolean;
  setFloraWind: React.Dispatch<React.SetStateAction<boolean>>;
}

export function StudioWorldBottomControls(props: StudioWorldBottomControlsProps) {
  const {
    galleryCategory,
    selectedCiv,
    selectedMajorGod,
    setSelectedMajorGod,
    selectedBuilding,
    buildingAge,
    setBuildingAge,
    onSelectTier,
    fortressAction,
    setFortressAction,
    atlanteanFortressAction,
    setAtlanteanFortressAction,
    norseFortressAction,
    setNorseFortressAction,
    templeAction,
    setTempleAction,
    focusDivine,
    setFocusDivine,
    showHumanScale,
    setShowHumanScale,
    selectedMap,
    mapWorldSize,
    setMapWorldSize,
    mapWireframe,
    setMapWireframe,
    mapShowFlora,
    setMapShowFlora,
    mapShowFauna,
    setMapShowFauna,
    setMapSeedTick,
    faunaAnim,
    setFaunaAnim,
    artifactAuraActive,
    setArtifactAuraActive,
    selectedTerrainItem,
    terrainVariantSeed,
    setTerrainVariantSeed,
    terrainFxActive,
    setTerrainFxActive,
    terrainWireframe,
    setTerrainWireframe,
    terrainRedTide,
    setTerrainRedTide,
    selectedFloraItem,
    floraVariantSeed,
    setFloraVariantSeed,
    floraWind,
    setFloraWind,
  } = props;

  if (galleryCategory === 'building' && selectedCiv === 'greek' && selectedBuilding === 'temple') {
    return (
      <>
        {(
          [
            { id: 'Zeus', label: '⚡ Zeus', active: 'bg-gradient-to-r from-amber-300 to-blue-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Poseidon', label: '🔱 Poseidon', active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
            { id: 'Hades', label: '💀 Hades', active: 'bg-gradient-to-r from-orange-500 to-purple-800 text-white font-black shadow-lg shadow-orange-500/30 ring-1 ring-orange-400' },
          ] as const
        ).map((g) => {
          const isSel = selectedMajorGod.toLowerCase() === g.id.toLowerCase();
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        {(
          [
            { tier: 1, label: 'T1 • Altar' },
            { tier: 2, label: 'T2 • Santuário' },
            { tier: 3, label: 'T3 • Heroico' },
            { tier: 4, label: 'T4 • Mítico' },
            { tier: 5, label: 'T5 • Maravilha' },
          ] as const
        ).map((t) => (
          <button
            key={t.tier}
            type="button"
            onClick={() => {
              setBuildingAge(t.tier);
              if (t.tier <= 4) {
                onSelectTier(t.tier as 1 | 2 | 3 | 4);
              }
            }}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              buildingAge === t.tier
                ? t.tier === 5
                  ? 'bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-200'
                  : 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
            }`}
          >
            <span>{t.label}</span>
          </button>
        ))}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setTempleAction('favor')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            templeAction === 'favor'
              ? 'bg-sky-400 text-slate-950 shadow'
              : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gerando Favor Divino</span>
        </button>
        <button
          type="button"
          onClick={() => setTempleAction('milagre')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            templeAction === 'milagre'
              ? 'bg-amber-400 text-slate-950 shadow ring-1 ring-amber-300 font-black'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Invocar Milagre Supremo</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setFocusDivine((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            focusDivine
              ? 'bg-sky-500 text-slate-950 shadow font-black'
              : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{focusDivine ? 'Visão Geral' : 'Focar Estátua Divina'}</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building' && selectedCiv === 'egyptian' && selectedBuilding === 'temple') {
    return (
      <>
        {(
          [
            { id: 'Rá', label: '☀️ Rá', active: 'bg-gradient-to-r from-amber-300 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Ísis', label: '🪷 Ísis', active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
            { id: 'Set', label: '🏜️ Set', active: 'bg-gradient-to-r from-red-600 to-orange-700 text-white font-black shadow-lg shadow-red-500/30 ring-1 ring-orange-400' },
          ] as const
        ).map((g) => {
          const isSel = resolveEgyptianArchGod(selectedMajorGod) === resolveEgyptianArchGod(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        {(
          [
            { tier: 1, label: 'T1 • Altar' },
            { tier: 2, label: 'T2 • Santuário' },
            { tier: 3, label: 'T3 • Pilones' },
            { tier: 4, label: 'T4 • Esfinge' },
            { tier: 5, label: 'T5 • Pirâmide' },
          ] as const
        ).map((t) => (
          <button
            key={t.tier}
            type="button"
            onClick={() => {
              setBuildingAge(t.tier);
              if (t.tier <= 4) {
                onSelectTier(t.tier as 1 | 2 | 3 | 4);
              }
            }}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              buildingAge === t.tier
                ? t.tier === 5
                  ? 'bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-200'
                  : 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
            }`}
          >
            <span>{t.label}</span>
          </button>
        ))}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setTempleAction('favor')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            templeAction === 'favor'
              ? 'bg-sky-400 text-slate-950 shadow'
              : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gerando Favor Divino</span>
        </button>
        <button
          type="button"
          onClick={() => setTempleAction('milagre')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            templeAction === 'milagre'
              ? 'bg-amber-400 text-slate-950 shadow ring-1 ring-amber-300 font-black'
              : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Sopro Solar</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setFocusDivine((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            focusDivine
              ? 'bg-sky-500 text-slate-950 shadow font-black'
              : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{focusDivine ? 'Visão Geral' : 'Focar Estátua / Ápice'}</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building' && selectedCiv === 'egyptian' && isEgyptianArchBuilding(selectedBuilding)) {
    const meta = EGYPT_ARCH_BUILDING_META[selectedBuilding];
    const allTiers: Array<{ tier: AgeLevel; label: string }> = [
      { tier: 1, label: 'T1 • Arcaico' },
      { tier: 2, label: 'T2 • Clássico' },
      { tier: 3, label: 'T3 • Heroico' },
      { tier: 4, label: 'T4 • Mítico' },
      { tier: 5, label: 'T5 • Imperial' },
    ];
    const tiers = allTiers.filter((item) => item.tier >= meta.minTier);
    const effTier = Math.max(meta.minTier, Math.min(5, buildingAge));

    return (
      <>
        {(
          [
            { id: 'Ra', label: '☀️ Rá', active: 'bg-gradient-to-r from-amber-300 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Isis', label: '🪷 Ísis', active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
            { id: 'Set', label: '🐺 Set', active: 'bg-gradient-to-r from-orange-600 to-purple-800 text-white font-black shadow-lg shadow-orange-500/30 ring-1 ring-orange-400' },
          ] as const
        ).map((g) => {
          const isSel = resolveEgyptianArchGod(selectedMajorGod) === g.id.toLowerCase();
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        {tiers.map((t) => {
          const isSel = effTier === t.tier;
          return (
            <button
              key={t.tier}
              type="button"
              onClick={() => {
                setBuildingAge(t.tier);
                if (t.tier <= 4) {
                  onSelectTier(t.tier as 1 | 2 | 3 | 4);
                }
              }}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel
                  ? t.tier === 5
                    ? 'bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-200'
                    : 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                  : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{t.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setFocusDivine((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            focusDivine
              ? 'bg-teal-500 text-slate-950 shadow font-black'
              : 'border border-teal-400/40 text-teal-200 hover:bg-teal-500/20'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{focusDivine ? 'Visão Geral' : 'Focar Detalhe'}</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building' && selectedCiv === 'greek' && selectedBuilding === 'fortress') {
    const god = selectedMajorGod.toLowerCase();
    const activeColor =
      god === 'poseidon'
        ? 'bg-teal-400 text-slate-950 shadow'
        : god === 'hades'
        ? 'bg-orange-500 text-white shadow'
        : 'bg-amber-400 text-slate-950 shadow';
    const inactiveColor =
      god === 'poseidon'
        ? 'border border-teal-400/30 text-teal-200 hover:bg-teal-400/15'
        : god === 'hades'
        ? 'border border-orange-400/30 text-orange-200 hover:bg-orange-400/15'
        : 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15';

    return (
      <>
        {(
          [
            { id: 'Zeus', label: 'Zeus', icon: Zap, active: 'bg-gradient-to-r from-amber-300 to-blue-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Poseidon', label: 'Poseidon', icon: Waves, active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
            { id: 'Hades', label: 'Hades', icon: Skull, active: 'bg-gradient-to-r from-orange-500 to-purple-800 text-white font-black shadow-lg shadow-orange-500/30 ring-1 ring-orange-400' },
          ] as const
        ).map((g) => {
          const Icon = g.icon;
          const isSel = selectedMajorGod.toLowerCase() === g.id.toLowerCase();
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => {
            setBuildingAge(3);
            onSelectTier(3);
          }}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            buildingAge <= 3
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
              : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
          }`}
        >
          <span>T3 • Era Heroica</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setBuildingAge(4);
            onSelectTier(4);
          }}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            buildingAge >= 4
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
              : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
          }`}
        >
          <span>T4 • Era Mítica</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        {(
          [
            { id: 'guarnicao', label: 'Guarnição Ativa', icon: Shield },
            { id: 'defesa', label: 'Disparo de Flechas', icon: Sparkles },
            { id: 'bencao', label: 'Aura Divina', icon: Sun },
          ] as const
        ).map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => setFortressAction(act.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                fortressAction === act.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{act.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building' && selectedCiv === 'atlantean' && selectedBuilding === 'fortress') {
    const god = selectedMajorGod.toLowerCase();
    const activeColor =
      god === 'gaia'
        ? 'bg-emerald-500 text-slate-950 shadow'
        : god === 'oranos' || god === 'urano'
        ? 'bg-amber-400 text-slate-950 shadow'
        : 'bg-sky-400 text-slate-950 shadow';
    const inactiveColor =
      god === 'gaia'
        ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
        : god === 'oranos' || god === 'urano'
        ? 'border border-amber-400/30 text-amber-200 hover:bg-amber-400/15'
        : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

    return (
      <>
        {(
          [
            { id: 'Kronos', label: '⏳ Kronos', active: 'bg-gradient-to-r from-sky-400 to-indigo-700 text-white font-black shadow-lg shadow-sky-500/30 ring-1 ring-sky-300' },
            { id: 'Oranos', label: '🌪️ Oranos', active: 'bg-gradient-to-r from-amber-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Gaia', label: '🌿 Gaia', active: 'bg-gradient-to-r from-emerald-400 to-emerald-800 text-white font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' },
          ] as const
        ).map((g) => {
          const isSel =
            god === g.id.toLowerCase() ||
            (g.id === 'Oranos' && god === 'urano') ||
            (g.id === 'Kronos' && god === 'cronos');
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => {
            setBuildingAge(3);
            onSelectTier(3);
          }}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            buildingAge <= 3
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
              : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
          }`}
        >
          <span>T3 • Palácio (3 Cúpulas)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setBuildingAge(4);
            onSelectTier(4);
          }}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            buildingAge >= 4
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
              : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
          }`}
        >
          <span>T4 • Cidadela Imperial</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        {(
          [
            { id: 'guarnicao', label: 'Guarnição Ativa', icon: Shield },
            { id: 'defesa', label: 'Rajada de Oricalco', icon: Sparkles },
            { id: 'bencao', label: 'Aura de Atlântida', icon: Sun },
          ] as const
        ).map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => setAtlanteanFortressAction(act.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                atlanteanFortressAction === act.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{act.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building' && selectedCiv === 'atlantean' && isAtlanteanArchBuilding(selectedBuilding)) {
    const meta = ATLANTEAN_ARCH_BUILDING_META[selectedBuilding];
    const allTiers: Array<{ tier: AgeLevel; label: string }> = [
      { tier: 1, label: 'T1 • Arcaico' },
      { tier: 2, label: 'T2 • Clássico' },
      { tier: 3, label: 'T3 • Heroico' },
      { tier: 4, label: 'T4 • Mítico' },
      { tier: 5, label: 'T5 • Imperial' },
    ];
    const tiers = allTiers.filter((item) => item.tier >= meta.minTier);
    const effTier = Math.max(meta.minTier, Math.min(5, buildingAge));
    const curAtlGod = resolveAtlanteanArchGod(selectedMajorGod);

    return (
      <>
        {(
          [
            { id: 'Cronos', key: 'kronos', label: '⏳ Kronos', active: 'bg-gradient-to-r from-sky-400 to-indigo-700 text-white font-black shadow-lg shadow-sky-500/30 ring-1 ring-sky-300' },
            { id: 'Urano', key: 'oranos', label: '🌪️ Oranos', active: 'bg-gradient-to-r from-amber-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Gaia', key: 'gaia', label: '🌿 Gaia', active: 'bg-gradient-to-r from-emerald-400 to-emerald-800 text-white font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' },
          ] as const
        ).map((g) => {
          const isSel = curAtlGod === g.key;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        {tiers.map((t) => {
          const isSel = effTier === t.tier;
          return (
            <button
              key={t.tier}
              type="button"
              onClick={() => {
                setBuildingAge(t.tier);
                if (t.tier <= 4) {
                  onSelectTier(t.tier as 1 | 2 | 3 | 4);
                }
              }}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel
                  ? t.tier === 5
                    ? 'bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-200'
                    : 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                  : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{t.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setFocusDivine((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            focusDivine
              ? 'bg-sky-500 text-slate-950 shadow font-black'
              : 'border border-sky-400/40 text-sky-200 hover:bg-sky-500/20'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{focusDivine ? 'Visão Geral' : 'Focar Detalhe'}</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building' && selectedCiv === 'norse' && selectedBuilding === 'fortress') {
    const god = selectedMajorGod.toLowerCase();
    const activeColor =
      god === 'thor'
        ? 'bg-red-500 text-white shadow'
        : god === 'loki'
        ? 'bg-emerald-500 text-slate-950 shadow'
        : god === 'freyr'
        ? 'bg-yellow-400 text-slate-950 shadow'
        : 'bg-sky-400 text-slate-950 shadow';
    const inactiveColor =
      god === 'thor'
        ? 'border border-red-400/30 text-red-200 hover:bg-red-400/15'
        : god === 'loki'
        ? 'border border-emerald-400/30 text-emerald-200 hover:bg-emerald-400/15'
        : god === 'freyr'
        ? 'border border-yellow-400/30 text-yellow-200 hover:bg-yellow-400/15'
        : 'border border-sky-400/30 text-sky-200 hover:bg-sky-400/15';

    return (
      <>
        {(
          [
            { id: 'Odin', label: '🐺 Odin', active: 'bg-gradient-to-r from-sky-400 to-blue-700 text-white font-black shadow-lg shadow-sky-500/30 ring-1 ring-sky-300' },
            { id: 'Thor', label: '🔨 Thor', active: 'bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 font-black shadow-lg shadow-red-500/30 ring-1 ring-amber-300' },
            { id: 'Loki', label: '🐍 Loki', active: 'bg-gradient-to-r from-emerald-400 to-emerald-800 text-white font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' },
            { id: 'Freyr', label: '🌾 Freyr', active: 'bg-gradient-to-r from-amber-300 to-lime-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-lime-400' },
          ] as const
        ).map((g) => {
          const isSel = god === g.id.toLowerCase();
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => {
            setBuildingAge(3);
            onSelectTier(3);
          }}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            buildingAge <= 3
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
              : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
          }`}
        >
          <span>T3 • Hill Fort Heroico</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setBuildingAge(4);
            onSelectTier(4);
          }}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            buildingAge >= 4
              ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
              : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
          }`}
        >
          <span>T4 • Cidadela de Valhalla</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        {(
          [
            { id: 'guarnicao', label: 'Guarnição Ativa', icon: Shield },
            { id: 'defesa', label: 'Saraivada de Lanças', icon: Sparkles },
            { id: 'geada', label: 'Geada de Fim de Inverno', icon: Sun },
          ] as const
        ).map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => setNorseFortressAction(act.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                norseFortressAction === act.id ? activeColor : inactiveColor
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{act.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building' && selectedBuilding === 'town_center' && (selectedCiv === 'norse' || selectedCiv === 'egyptian' || selectedCiv === 'atlantean' || selectedCiv === 'greek')) {
    const normGod = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    const curGod = normGod(selectedMajorGod);

    const godButtons =
      selectedCiv === 'norse'
        ? ([
            { id: 'Odin', match: ['odin'], label: '🐺 Odin', active: 'bg-gradient-to-r from-sky-400 to-blue-700 text-white font-black shadow-lg shadow-sky-500/30 ring-1 ring-sky-300' },
            { id: 'Thor', match: ['thor'], label: '🔨 Thor', active: 'bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 font-black shadow-lg shadow-red-500/30 ring-1 ring-amber-300' },
            { id: 'Loki', match: ['loki'], label: '🔥 Loki', active: 'bg-gradient-to-r from-emerald-400 to-orange-700 text-white font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' },
            { id: 'Freyr', match: ['freyr', 'frey'], label: '🌿 Freyr', active: 'bg-gradient-to-r from-amber-300 to-lime-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-lime-400' },
          ] as const)
        : selectedCiv === 'egyptian'
        ? ([
            { id: 'Rá', match: ['ra'], label: '☀️ Rá', active: 'bg-gradient-to-r from-amber-300 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Ísis', match: ['isis'], label: '🪷 Ísis', active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
            { id: 'Set', match: ['set', 'seth'], label: '🏜️ Set', active: 'bg-gradient-to-r from-red-600 to-orange-700 text-white font-black shadow-lg shadow-red-500/30 ring-1 ring-orange-400' },
          ] as const)
        : selectedCiv === 'atlantean'
        ? ([
            { id: 'Cronos', match: ['cronos', 'kronos'], label: '⏳ Kronos', active: 'bg-gradient-to-r from-sky-400 to-indigo-700 text-white font-black shadow-lg shadow-sky-500/30 ring-1 ring-sky-300' },
            { id: 'Urano', match: ['urano', 'oranos'], label: '🌪️ Oranos', active: 'bg-gradient-to-r from-amber-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Gaia', match: ['gaia'], label: '🌿 Gaia', active: 'bg-gradient-to-r from-emerald-400 to-emerald-800 text-white font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' },
          ] as const)
        : ([
            { id: 'Zeus', match: ['zeus'], label: '⚡ Zeus', active: 'bg-gradient-to-r from-amber-300 to-blue-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' },
            { id: 'Poseidon', match: ['poseidon'], label: '🔱 Poseidon', active: 'bg-gradient-to-r from-teal-300 to-sky-600 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-teal-300' },
            { id: 'Hades', match: ['hades'], label: '💀 Hades', active: 'bg-gradient-to-r from-orange-500 to-purple-800 text-white font-black shadow-lg shadow-orange-500/30 ring-1 ring-orange-400' },
          ] as const);

    const tierLabels: Record<AgeLevel, string> =
      selectedCiv === 'norse'
        ? { 1: 'T1 • Acampamento', 2: 'T2 • Salão Longo', 3: 'T3 • Jarl', 4: 'T4 • Fortaleza', 5: 'T5 • Valhalla' }
        : selectedCiv === 'egyptian'
        ? { 1: 'T1 • Aldeia', 2: 'T2 • Pátio', 3: 'T3 • Hipóstilo', 4: 'T4 • Obeliscos', 5: 'T5 • Pirâmide' }
        : selectedCiv === 'atlantean'
        ? { 1: 'T1 • Posto', 2: 'T2 • Ágora', 3: 'T3 • Cidadela', 4: 'T4 • Oricalco', 5: 'T5 • Metrópole' }
        : { 1: 'T1 • Vila', 2: 'T2 • Pólis', 3: 'T3 • Ágora', 4: 'T4 • Acrópole', 5: 'T5 • Olímpico' };

    return (
      <>
        {godButtons.map((g) => {
          const isSel = (g.match as readonly string[]).includes(curGod);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedMajorGod(g.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSel ? g.active : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/20 mx-1" />

        {([1, 2, 3, 4, 5] as AgeLevel[]).map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => {
              setBuildingAge(age);
              if (age <= 4) onSelectTier(age as 1 | 2 | 3 | 4);
            }}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              buildingAge === age
                ? age === 5
                  ? 'bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 text-slate-950 shadow-lg font-black ring-1 ring-amber-200'
                  : 'bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md font-black'
                : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
            }`}
          >
            <span>{tierLabels[age]}</span>
          </button>
        ))}

        <div className="h-4 w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'building') {
    return (
      <>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] px-1">
          Era:
        </span>
        {([1, 2, 3, 4, 5] as AgeLevel[]).map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => {
              setBuildingAge(age);
              if (age <= 4) onSelectTier(age as 1 | 2 | 3 | 4);
            }}
            className={`rounded-lg px-2.5 py-1 font-mono-num text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              buildingAge === age
                ? 'bg-[#d4af37] text-[#090c12]'
                : 'border border-white/10 text-[#cbd5e1] hover:bg-white/10'
            }`}
          >
            {age === 5 ? 'T5 Metrópole' : `T${age}`}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'map') {
    return (
      <>
        <div className="flex items-center rounded-lg border border-amber-400/35 bg-[#090d16] p-0.5">
          {(['normal', 'large', 'giant'] as WorldSizeId[]).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setMapWorldSize(sz)}
              title={`Tamanho ${WORLD_SIZE_SPECS[sz].label} (${WORLD_SIZE_SPECS[sz].dimsLabel})`}
              className={`rounded-md px-2 py-1 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                mapWorldSize === sz
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-[#cbd5e1] hover:text-white'
              }`}
            >
              {WORLD_SIZE_SPECS[sz].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMapWireframe((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            mapWireframe
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'border border-white/12 text-[#cbd5e1] hover:bg-white/10'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Malha Relevo</span>
        </button>
        <button
          type="button"
          onClick={() => setMapShowFlora((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            mapShowFlora
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Trees className="h-3.5 w-3.5" />
          <span>Flora & Minas</span>
        </button>
        <button
          type="button"
          onClick={() => setMapShowFauna((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            mapShowFauna
              ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Fauna Local</span>
        </button>
        {(selectedMap === 'land_unknown' || selectedMap === 'the_unknown' || selectedMap === 'total_war') && (
          <button
            type="button"
            onClick={() => {
              if (selectedMap === 'total_war') {
                rollTotalWarVariant('total_war');
              } else {
                rollUnknownMapVariant(selectedMap);
              }
              setMapSeedTick((t) => t + 1);
            }}
            className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>{selectedMap === 'total_war' ? 'Alternar Bioma' : 'Sortear Semente'}</span>
          </button>
        )}
      </>
    );
  }

  if (galleryCategory === 'fauna') {
    return (
      <>
        {(
          [
            { id: 'idle', label: 'Parado', icon: Pause },
            { id: 'walk', label: 'Caminhar', icon: Play },
            { id: 'run', label: 'Correr / Galope', icon: Wind },
          ] as const
        ).map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setFaunaAnim(a.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                faunaAnim === a.id
                  ? 'bg-emerald-400 text-slate-950 shadow'
                  : 'border border-white/12 text-[#cbd5e1] hover:bg-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{a.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'utensil') {
    return (
      <>
        <button
          type="button"
          onClick={() => setArtifactAuraActive((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            artifactAuraActive
              ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Brasas / Efeitos</span>
        </button>
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'relic') {
    return (
      <>
        <button
          type="button"
          onClick={() => setArtifactAuraActive((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            artifactAuraActive
              ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Aura Sagrada</span>
        </button>
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  if (galleryCategory === 'terrain') {
    return (
      <>
        <button
          type="button"
          onClick={() => setTerrainVariantSeed((s) => (s + 1) % 6)}
          className="flex items-center gap-1 rounded-lg border border-orange-400/40 bg-orange-500/20 px-2.5 py-1.5 text-xs font-bold text-orange-200 hover:bg-orange-500/30 cursor-pointer whitespace-nowrap"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span className="font-mono-num">Relevo #{terrainVariantSeed}</span>
        </button>
        <button
          type="button"
          onClick={() => setTerrainFxActive((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            terrainFxActive
              ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Fluxo &amp; FX</span>
        </button>
        {selectedTerrainItem.kind !== 'fx' && (
          <button
            type="button"
            onClick={() => setTerrainWireframe((v) => !v)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              terrainWireframe
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50'
                : 'border border-white/12 text-[#9ca3af] hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Malha</span>
          </button>
        )}
        {selectedTerrainItem.filterGroup === 'water' && (
          <button
            type="button"
            onClick={() => setTerrainRedTide((v) => !v)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              terrainRedTide
                ? 'bg-red-600/35 text-red-200 border border-red-400/60'
                : 'border border-white/12 text-[#9ca3af] hover:text-white'
            }`}
          >
            <Waves className="h-3.5 w-3.5" />
            <span>RED TIDE</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowHumanScale((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            showHumanScale
              ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Escala Aldeão</span>
        </button>
      </>
    );
  }

  // Flora & Resources controls
  return (
    <>
      <button
        type="button"
        onClick={() => setFloraVariantSeed((s) => (s + 1) % 5)}
        className="flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 cursor-pointer whitespace-nowrap"
      >
        <Shuffle className="h-3.5 w-3.5" />
        <span className="font-mono-num">Variante #{floraVariantSeed}</span>
      </button>
      {selectedFloraItem.category === 'tree' && (
        <button
          type="button"
          onClick={() => setFloraWind((v) => !v)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            floraWind
              ? 'bg-teal-500/25 text-teal-200 border border-teal-400/50'
              : 'border border-white/12 text-[#9ca3af] hover:text-white'
          }`}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>Brisa na Copa</span>
        </button>
      )}
      <button
        type="button"
        onClick={() => setShowHumanScale((v) => !v)}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
          showHumanScale
            ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
            : 'border border-white/12 text-[#9ca3af] hover:text-white'
        }`}
      >
        <Users className="h-3.5 w-3.5" />
        <span>Escala Aldeão</span>
      </button>
    </>
  );
}
