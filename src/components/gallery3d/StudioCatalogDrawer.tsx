import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Hammer,
  Layers,
  Map as MapIcon,
  Sparkles,
  Trees,
} from 'lucide-react';
import { AOM_HOPLITE_UV_TIERS, HopliteArmorTier } from '../../civilizacao/gregos/gregosModels';
import { AgeLevel, BuildingKind, FaunaKind, MapId, PANTHEONS, PantheonId, WorldSizeId } from '../../game/types';
import { WORLD_SIZE_SPECS } from '../../maps';
import { EraIcon, getEraSubtitle } from '../EraIcon';
import { GalleryRelicItem, GalleryUtensilItem } from '../gallery3dArtifacts';
import {
  GALLERY_MAP_ITEMS,
  GalleryFaunaItem,
  GalleryFloraItem,
  getBuildingsForCivAndGod,
  getUnitsForCivAndGod,
  InspectableUnitId,
  MAJOR_GODS_BY_CIV,
} from '../gallery3dCatalog';

type GalleryBuildingItem = ReturnType<typeof getBuildingsForCivAndGod>[number];
type GalleryUnitItem = ReturnType<typeof getUnitsForCivAndGod>[number];
type GalleryMapItem = (typeof GALLERY_MAP_ITEMS)[number];
import { GalleryTerrainItem, TerrainGalleryFilter } from '../gallery3dTerrain';
import {
  BUILDING_ERA_SPECS,
  FaunaDietFilter,
  FloraTypeFilter,
  formatHex,
  GalleryCategory,
  MapExpansionFilter,
  RelicPantheonFilter,
  UnitCategoryFilter,
  UtensilCategoryFilter,
} from './studioTypes';

export interface StudioCatalogDrawerProps {
  leftDrawerOpen: boolean;
  setLeftDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  galleryCategory: GalleryCategory;

  selectedCiv: PantheonId;
  handleSelectCiv: (civ: PantheonId) => void;
  selectedMajorGod: string;
  handleSelectMajorGod: (godId: string) => void;

  unitFilter: UnitCategoryFilter;
  setUnitFilter: (filter: UnitCategoryFilter) => void;
  filteredUnits: GalleryUnitItem[];
  selectedUnit: InspectableUnitId;
  setSelectedUnit: (unit: InspectableUnitId) => void;

  currentCivBuildings: GalleryBuildingItem[];
  selectedBuilding: BuildingKind;
  setSelectedBuilding: (b: BuildingKind) => void;
  buildingAge: AgeLevel;
  setBuildingAge: (age: AgeLevel) => void;
  activeTier: 1 | 2 | 3 | 4;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
  showGreekArmorTiers: boolean;

  mapExpansionFilter: MapExpansionFilter;
  setMapExpansionFilter: (f: MapExpansionFilter) => void;
  mapWorldSize: WorldSizeId;
  setMapWorldSize: (sz: WorldSizeId) => void;
  filteredMaps: GalleryMapItem[];
  selectedMap: MapId;
  setSelectedMap: (map: MapId) => void;

  faunaFilter: FaunaDietFilter;
  setFaunaFilter: (f: FaunaDietFilter) => void;
  filteredFauna: GalleryFaunaItem[];
  selectedFauna: FaunaKind;
  setSelectedFauna: (fauna: FaunaKind) => void;

  terrainFilter: TerrainGalleryFilter;
  setTerrainFilter: (f: TerrainGalleryFilter) => void;
  filteredTerrains: GalleryTerrainItem[];
  selectedTerrainId: string;
  setSelectedTerrainId: (id: string) => void;

  floraFilter: FloraTypeFilter;
  setFloraFilter: (f: FloraTypeFilter) => void;
  filteredFlora: GalleryFloraItem[];
  selectedFloraId: string;
  setSelectedFloraId: (id: string) => void;

  utensilFilter: UtensilCategoryFilter;
  setUtensilFilter: (f: UtensilCategoryFilter) => void;
  filteredUtensils: GalleryUtensilItem[];
  selectedUtensilId: string;
  setSelectedUtensilId: (id: string) => void;

  relicPantheonFilter: RelicPantheonFilter;
  setRelicPantheonFilter: (f: RelicPantheonFilter) => void;
  filteredRelics: GalleryRelicItem[];
  selectedRelicId: string;
  setSelectedRelicId: (id: string) => void;
}

export function StudioCatalogDrawer(props: StudioCatalogDrawerProps) {
  const {
    leftDrawerOpen,
    setLeftDrawerOpen,
    galleryCategory,
    selectedCiv,
    handleSelectCiv,
    selectedMajorGod,
    handleSelectMajorGod,
    unitFilter,
    setUnitFilter,
    filteredUnits,
    selectedUnit,
    setSelectedUnit,
    currentCivBuildings,
    selectedBuilding,
    setSelectedBuilding,
    buildingAge,
    setBuildingAge,
    activeTier,
    onSelectTier,
    showGreekArmorTiers,
    mapExpansionFilter,
    setMapExpansionFilter,
    mapWorldSize,
    setMapWorldSize,
    filteredMaps,
    selectedMap,
    setSelectedMap,
    faunaFilter,
    setFaunaFilter,
    filteredFauna,
    selectedFauna,
    setSelectedFauna,
    terrainFilter,
    setTerrainFilter,
    filteredTerrains,
    selectedTerrainId,
    setSelectedTerrainId,
    floraFilter,
    setFloraFilter,
    filteredFlora,
    selectedFloraId,
    setSelectedFloraId,
    utensilFilter,
    setUtensilFilter,
    filteredUtensils,
    selectedUtensilId,
    setSelectedUtensilId,
    relicPantheonFilter,
    setRelicPantheonFilter,
    filteredRelics,
    selectedRelicId,
    setSelectedRelicId,
  } = props;

  return (
    <aside
      className={`absolute top-[92px] sm:top-24 lg:top-20 bottom-16 sm:bottom-20 left-2 sm:left-3 z-20 flex items-start transition-transform duration-200 pointer-events-none ${
        leftDrawerOpen ? 'translate-x-0' : '-translate-x-[calc(100%-2.25rem)]'
      }`}
    >
      <div className="pointer-events-auto flex h-full w-[min(268px,calc(100vw-3.25rem))] sm:w-80 flex-col rounded-xl border border-white/12 bg-[#0d121c]/95 shadow-[0_18px_48px_rgba(0,0,0,0.75)] overflow-hidden">
        {(galleryCategory === 'unit' || galleryCategory === 'building') && (
          <div className="border-b border-white/10 p-3 space-y-2.5 bg-[#111827]/70">
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'greek', name: 'Gregos' },
                  { id: 'egyptian', name: 'Egípcios' },
                  { id: 'norse', name: 'Nórdicos' },
                  { id: 'atlantean', name: 'Atlantes' },
                ] as const
              ).map((civ) => (
                <button
                  key={civ.id}
                  type="button"
                  onClick={() => handleSelectCiv(civ.id)}
                  className={`rounded-md py-1.5 px-1 text-[10px] font-bold border transition cursor-pointer ${
                    selectedCiv === civ.id
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5e3b0]'
                      : 'border-white/10 bg-[#0c111b] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {civ.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1">
              {(MAJOR_GODS_BY_CIV[selectedCiv] || MAJOR_GODS_BY_CIV.greek!).map((god) => {
                const isSel = selectedMajorGod.toLowerCase() === god.id.toLowerCase();
                return (
                  <button
                    key={god.id}
                    type="button"
                    onClick={() => handleSelectMajorGod(god.id)}
                    style={{
                      borderColor: isSel ? god.color : undefined,
                      backgroundColor: isSel ? `${god.color}22` : undefined,
                      color: isSel ? god.color : undefined,
                    }}
                    className={`rounded-md py-1 px-1.5 text-[11px] font-bold border transition cursor-pointer truncate ${
                      isSel
                        ? 'shadow'
                        : 'border-white/10 bg-[#0c111b] text-[#9ca3af] hover:text-white'
                    }`}
                    title={god.title}
                  >
                    {god.name}
                  </button>
                );
              })}
            </div>

            {galleryCategory === 'unit' && (
              <div className="flex items-center gap-1 overflow-x-auto pt-0.5">
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'god', label: 'Deuses' },
                    { id: 'hero', label: 'Heróis' },
                    { id: 'troop', label: 'Tropas' },
                    { id: 'myth', label: 'Míticas' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setUnitFilter(f.id)}
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer whitespace-nowrap ${
                      unitFilter === f.id
                        ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                        : 'bg-[#090d16] text-[#9ca3af] hover:text-white border border-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {galleryCategory === 'map' && (
          <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                Mapas & Biomas ({filteredMaps.length})
              </span>
              <MapIcon className="h-3.5 w-3.5 text-[#d4af37]" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'base', label: 'Clássicos' },
                  { id: 'titans', label: 'Titans' },
                  { id: 'bonus', label: 'Bônus' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMapExpansionFilter(f.id)}
                  className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                    mapExpansionFilter === f.id
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5e3b0]'
                      : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="pt-1">
              <div className="mb-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-sky-300">
                <span>Tamanho do Mapa 3D</span>
                <span className="font-mono-num text-amber-300">{WORLD_SIZE_SPECS[mapWorldSize].dimsLabel}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['normal', 'large', 'giant'] as WorldSizeId[]).map((sz) => {
                  const spec = WORLD_SIZE_SPECS[sz];
                  const active = mapWorldSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setMapWorldSize(sz)}
                      className={`flex flex-col items-center rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                        active
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <span>{spec.label}</span>
                      <span className="font-mono-num text-[9px] opacity-80">{spec.dimsLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {galleryCategory === 'fauna' && (
          <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                Fauna Selvagem ({filteredFauna.length})
              </span>
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'pacific', label: 'Pacífica' },
                  { id: 'aggressive', label: 'Feroz / Retalia' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFaunaFilter(f.id)}
                  className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                    faunaFilter === f.id
                      ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {galleryCategory === 'terrain' && (
          <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                Terreno, Rochas & FX (<span className="font-mono-num">{filteredTerrains.length}</span>)
              </span>
              <Layers className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'rock_cliff', label: 'Rocha' },
                  { id: 'magma', label: 'Magma' },
                  { id: 'dust_snow', label: 'Areia/Neve' },
                  { id: 'water', label: 'Água' },
                  { id: 'rocks_3d', label: 'Rochas 3D' },
                  { id: 'fx', label: 'FX Clima' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTerrainFilter(f.id)}
                  className={`rounded py-1 text-[9px] font-semibold border transition cursor-pointer ${
                    terrainFilter === f.id
                      ? 'border-orange-400/70 bg-orange-500/20 text-orange-200'
                      : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {galleryCategory === 'flora' && (
          <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                Flora & Recursos ({filteredFlora.length})
              </span>
              <Trees className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'tree', label: 'Árvores (10)' },
                  { id: 'resource', label: 'Recursos (5)' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFloraFilter(f.id)}
                  className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                    floraFilter === f.id
                      ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {galleryCategory === 'utensil' && (
          <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                Utensílios & Forja (<span className="font-mono-num">{filteredUtensils.length}</span>)
              </span>
              <Hammer className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'work', label: 'Trabalho' },
                  { id: 'domestic', label: 'Domésticos' },
                  { id: 'ritual', label: 'Ritual' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setUtensilFilter(f.id)}
                  className={`rounded py-1 text-[10px] font-semibold border transition cursor-pointer ${
                    utensilFilter === f.id
                      ? 'border-amber-400/70 bg-amber-500/20 text-amber-200'
                      : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {galleryCategory === 'relic' && (
          <div className="border-b border-white/10 p-3 space-y-2 bg-[#111827]/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5e3b0]">
                Relíquias Sagradas (<span className="font-mono-num">{filteredRelics.length}</span>)
              </span>
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'greek', label: 'Gregos' },
                  { id: 'egyptian', label: 'Egípcios' },
                  { id: 'norse', label: 'Nórdicos' },
                  { id: 'atlantean', label: 'Atlantes' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setRelicPantheonFilter(f.id)}
                  className={`rounded py-1 text-[9px] font-semibold border transition cursor-pointer ${
                    relicPantheonFilter === f.id
                      ? 'border-sky-400/70 bg-sky-500/20 text-sky-200'
                      : 'border-white/10 bg-[#0b0f18] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {galleryCategory === 'unit' &&
            filteredUnits.map((u) => {
              const isSelected = selectedUnit === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUnit(u.id)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5e3b0]'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-display text-xs font-bold truncate">{u.name}</span>
                    <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[#9ca3af]">
                      {u.category === 'god'
                        ? 'Deus'
                        : u.category === 'hero'
                        ? 'Herói'
                        : u.category === 'myth'
                        ? 'Mítico'
                        : 'Tropa'}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-2">{u.role}</span>
                </button>
              );
            })}

          {galleryCategory === 'building' &&
            currentCivBuildings.map((b) => {
              const isSelected = selectedBuilding === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBuilding(b.id)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5e3b0]'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <span className="font-display text-xs font-bold">{b.name}</span>
                  <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-2">{b.role}</span>
                </button>
              );
            })}

          {galleryCategory === 'map' &&
            filteredMaps.map((m) => {
              const isSelected = selectedMap === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMap(m.id)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5e3b0]'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                        style={{ backgroundColor: m.terrainTint }}
                      />
                      <span className="font-display text-xs font-bold truncate">{m.name}</span>
                    </div>
                    <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-[#cbd5e1]">
                      {m.biomeLabel}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{m.subtitle}</span>
                </button>
              );
            })}

          {galleryCategory === 'terrain' &&
            filteredTerrains.map((t) => {
              const isSelected = selectedTerrainId === t.id;
              const kindTag = t.kind === 'surface' ? 'Piso' : t.kind === 'rock' ? 'Rocha 3D' : 'FX';
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTerrainId(t.id)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-orange-400 bg-orange-500/15 text-orange-100'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                        style={{ backgroundColor: t.swatchCss }}
                      />
                      <span className="font-display text-xs font-bold truncate">{t.name}</span>
                    </div>
                    <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-[#cbd5e1]">
                      {kindTag}
                    </span>
                  </div>
                  <span className="mt-0.5 font-mono-num text-[10px] text-[#9ca3af] line-clamp-1">
                    {t.rmConstant}
                  </span>
                </button>
              );
            })}

          {galleryCategory === 'fauna' &&
            filteredFauna.map((f) => {
              const isSelected = selectedFauna === f.kind;
              return (
                <button
                  key={f.kind}
                  type="button"
                  onClick={() => setSelectedFauna(f.kind)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                        style={{ backgroundColor: formatHex(f.coatHex) }}
                      />
                      <span className="font-display text-xs font-bold truncate">{f.labelPt}</span>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 font-mono-num text-[9px] font-semibold ${
                        f.retaliates
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {f.foodAmount} Alimento
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{f.biome}</span>
                </button>
              );
            })}

          {galleryCategory === 'flora' &&
            filteredFlora.map((f) => {
              const isSelected = selectedFloraId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFloraId(f.id)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-display text-xs font-bold truncate">{f.name}</span>
                    <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 font-mono-num text-[9px] text-[#cbd5e1]">
                      {f.category === 'tree' ? 'Árvore' : 'Recurso'}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{f.yieldLabel}</span>
                </button>
              );
            })}

          {galleryCategory === 'utensil' &&
            filteredUtensils.map((u) => {
              const isSelected = selectedUtensilId === u.id;
              const catLabel =
                u.category === 'work' ? 'Trabalho' : u.category === 'ritual' ? 'Ritual' : 'Doméstico';
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUtensilId(u.id)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/15 text-amber-100'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                        style={{ backgroundColor: formatHex(u.accentHex) }}
                      />
                      <span className="font-display text-xs font-bold truncate">{u.name}</span>
                    </div>
                    <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-[#cbd5e1]">
                      {catLabel}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] text-[#9ca3af] line-clamp-1">{u.usage}</span>
                </button>
              );
            })}

          {galleryCategory === 'relic' &&
            filteredRelics.map((r) => {
              const isSelected = selectedRelicId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRelicId(r.id)}
                  className={`w-full flex flex-col items-start rounded-lg border px-3 py-2 text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-sky-400 bg-sky-500/15 text-sky-100'
                      : 'border-white/8 bg-[#121826]/70 text-[#d1d5db] hover:border-white/25 hover:bg-[#192236]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm border border-white/25"
                        style={{ backgroundColor: formatHex(r.auraHex) }}
                      />
                      <span className="font-display text-xs font-bold truncate">{r.name}</span>
                    </div>
                    <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-[#cbd5e1]">
                      {PANTHEONS[r.pantheon].name}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] text-amber-300/90 line-clamp-1">{r.bonusLabel}</span>
                </button>
              );
            })}
        </div>

        {galleryCategory === 'building' && (
          <div className="border-t border-amber-500/25 bg-[#090d16] p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Evolução Arquitetônica (T1–T5)
              </span>
              <span className="font-mono-num text-[10px] text-amber-200">
                {buildingAge === 5 ? 'T5 Metrópole' : `Era ${buildingAge}`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {BUILDING_ERA_SPECS.map((spec) => {
                const isSel = buildingAge === spec.tier;
                return (
                  <button
                    key={spec.tier}
                    type="button"
                    onClick={() => {
                      setBuildingAge(spec.tier);
                      if (spec.tier <= 4) {
                        onSelectTier(spec.tier as 1 | 2 | 3 | 4);
                      }
                    }}
                    title={`${spec.title} — ${getEraSubtitle(spec.tier, selectedCiv)}`}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border py-1 transition cursor-pointer ${
                      isSel
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                        : 'border-white/10 bg-[#101624] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <EraIcon age={spec.tier} pantheon={selectedCiv} size={22} active={isSel} />
                    <span className="font-mono-num text-[9px] font-bold">T{spec.tier}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showGreekArmorTiers && (
          <div className="border-t border-amber-500/25 bg-[#090d16] p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Armadura & UV Grega (T1–T4)
              </span>
              <span className="font-mono-num text-[10px] text-amber-200">
                {AOM_HOPLITE_UV_TIERS[activeTier as HopliteArmorTier]?.name}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {([1, 2, 3, 4] as HopliteArmorTier[]).map((t) => {
                const spec = AOM_HOPLITE_UV_TIERS[t];
                const isSel = activeTier === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onSelectTier(t)}
                    title={`${spec.name}: ${spec.subtitle}`}
                    className={`rounded-md border py-1.5 text-center transition cursor-pointer ${
                      isSel
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                        : 'border-white/10 bg-[#101624] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <span className="font-mono-num text-[11px] font-bold">T{t}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setLeftDrawerOpen((v) => !v)}
        title={leftDrawerOpen ? 'Recolher Catálogo' : 'Abrir Catálogo'}
        className="pointer-events-auto ml-1.5 mt-2 flex h-9 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0d121c]/95 text-[#d4af37] shadow-lg hover:bg-[#172033] cursor-pointer"
      >
        {leftDrawerOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </aside>
  );
}
