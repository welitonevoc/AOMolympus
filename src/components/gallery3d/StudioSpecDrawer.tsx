import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EGYPT_TEMPLE_THEMES, EgyptianTempleGodKey } from '../../civilizacao/egipcios/egyptianTempleModel';
import {
  EGYPT_ARCH_BUILDING_META,
  EGYPT_ARCH_ERA_NAMES,
  EGYPT_ARCH_THEMES,
  isEgyptianArchBuilding,
  resolveEgyptianArchGod,
} from '../../civilizacao/egipcios/egyptianArchitectureSuite';
import { AOM_HOPLITE_UV_TIERS, HopliteArmorTier } from '../../civilizacao/gregos/gregosModels';
import { GREEK_TEMPLE_THEMES, GreekTempleGodKey } from '../../civilizacao/gregos/greekTempleModel';
import {
  AgeLevel,
  BUILDING_STATS,
  BuildingKind,
  MapConfig,
  PANTHEONS,
  PantheonId,
  UNIT_STATS,
} from '../../game/types';
import { GalleryRelicItem, GalleryUtensilItem } from '../gallery3dArtifacts';
import {
  GalleryFaunaItem,
  GalleryFloraItem,
  getBuildingsForCivAndGod,
  getUnitsForCivAndGod,
} from '../gallery3dCatalog';

type GalleryBuildingItem = ReturnType<typeof getBuildingsForCivAndGod>[number];
type GalleryUnitItem = ReturnType<typeof getUnitsForCivAndGod>[number];
import { GalleryTerrainItem } from '../gallery3dTerrain';
import {
  BUILDING_ERA_SPECS,
  DioramaMetrics,
  formatHex,
  GalleryCategory,
  SPECIAL_RULE_LABELS,
  WEATHER_LABELS,
} from './studioTypes';

export interface StudioSpecDrawerProps {
  specDrawerOpen: boolean;
  setSpecDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  galleryCategory: GalleryCategory;

  selectedMapCfg: MapConfig;
  dioramaMetrics: DioramaMetrics;
  selectedFaunaCfg: GalleryFaunaItem;
  selectedTerrainItem: GalleryTerrainItem;
  selectedFloraItem: GalleryFloraItem;
  floraVariantSeed: number;
  selectedUtensilCfg: GalleryUtensilItem;
  selectedRelicCfg: GalleryRelicItem;

  selectedCiv: PantheonId;
  selectedMajorGod: string;
  selectedBuilding: BuildingKind;
  buildingAge: AgeLevel;
  activeBuildingInfo: GalleryBuildingItem;
  activeUnitInfo: GalleryUnitItem;
  activeUnitStats: (typeof UNIT_STATS)[keyof typeof UNIT_STATS] | undefined;
  activeBuildingStats: (typeof BUILDING_STATS)[keyof typeof BUILDING_STATS] | undefined;
  showGreekArmorTiers: boolean;
  activeTier: 1 | 2 | 3 | 4;
}

export function StudioSpecDrawer(props: StudioSpecDrawerProps) {
  const {
    specDrawerOpen,
    setSpecDrawerOpen,
    galleryCategory,
    selectedMapCfg,
    dioramaMetrics,
    selectedFaunaCfg,
    selectedTerrainItem,
    selectedFloraItem,
    floraVariantSeed,
    selectedUtensilCfg,
    selectedRelicCfg,
    selectedCiv,
    selectedMajorGod,
    selectedBuilding,
    buildingAge,
    activeBuildingInfo,
    activeUnitInfo,
    activeUnitStats,
    activeBuildingStats,
    showGreekArmorTiers,
    activeTier,
  } = props;

  return (
    <aside
      className={`hidden md:flex absolute top-24 lg:top-20 bottom-20 right-3 z-20 items-start transition-transform duration-200 pointer-events-none ${
        specDrawerOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2.25rem)]'
      }`}
    >
      <button
        type="button"
        onClick={() => setSpecDrawerOpen((v) => !v)}
        title={specDrawerOpen ? 'Recolher Ficha Técnica' : 'Abrir Ficha Técnica'}
        className="pointer-events-auto mr-1.5 mt-2 flex h-9 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0d121c]/95 text-[#d4af37] shadow-lg hover:bg-[#172033] cursor-pointer"
      >
        {specDrawerOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className="pointer-events-auto flex max-h-full w-72 flex-col rounded-xl border border-white/12 bg-[#0d121c]/95 p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.75)] overflow-y-auto space-y-3">
        {galleryCategory === 'map' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  Geografia & Terreno
                </span>
                <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#cbd5e1]">
                  {selectedMapCfg.expansion}
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {selectedMapCfg.name}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {selectedMapCfg.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                <div className="text-[9px] uppercase text-[#9ca3af]">Altitude</div>
                <div className="mt-0.5 font-mono-num text-xs font-bold text-amber-300">
                  {dioramaMetrics.minHeight}..{dioramaMetrics.maxHeight}m
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                <div className="text-[9px] uppercase text-[#9ca3af]">Água/Lava</div>
                <div className="mt-0.5 font-mono-num text-xs font-bold text-sky-300">
                  {dioramaMetrics.waterCoveragePct}%
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                <div className="text-[9px] uppercase text-[#9ca3af]">Bioma</div>
                <div className="mt-0.5 text-[10px] font-bold text-emerald-300 truncate">
                  {dioramaMetrics.effectiveBiome}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-400/25 bg-amber-500/5 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                  Tamanho · {dioramaMetrics.worldSizeLabel}
                </span>
                <span className="font-mono-num text-[10px] font-bold text-[#f5e3b0]">
                  {dioramaMetrics.dimsLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#cbd5e1]">
                <div className="rounded bg-[#090d16]/80 px-2 py-1 flex justify-between">
                  <span className="text-[#9ca3af]">Jogável</span>
                  <span className="font-mono-num font-semibold text-white">{dioramaMetrics.playableDimsLabel}</span>
                </div>
                <div className="rounded bg-[#090d16]/80 px-2 py-1 flex justify-between">
                  <span className="text-[#9ca3af]">Dist. Bases</span>
                  <span className="font-mono-num font-semibold text-sky-300">{dioramaMetrics.baseDistance}m</span>
                </div>
                <div className="rounded bg-[#090d16]/80 px-2 py-1 flex justify-between">
                  <span className="text-[#9ca3af]">Bosques</span>
                  <span className="font-mono-num font-semibold text-emerald-300">{dioramaMetrics.treeClusterCount}</span>
                </div>
                <div className="rounded bg-[#090d16]/80 px-2 py-1 flex justify-between">
                  <span className="text-[#9ca3af]">Ouro / Assent.</span>
                  <span className="font-mono-num font-semibold text-amber-300">
                    {dioramaMetrics.goldMineCount} / {dioramaMetrics.settlementCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  Flora Geográfica
                </div>
                <div className="mt-0.5 text-[#e2e8f0]">{selectedMapCfg.floraLabel}</div>
              </div>
              <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                  Fauna Nativa
                </div>
                <div className="mt-0.5 text-[#e2e8f0]">{selectedMapCfg.faunaLabel}</div>
              </div>
              <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-sky-300">
                  Climas do Mapa
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedMapCfg.weatherPool.map((w) => (
                    <span
                      key={w}
                      className="rounded border border-white/10 bg-[#090d16] px-1.5 py-0.5 text-[10px] text-[#cbd5e1]"
                    >
                      {WEATHER_LABELS[w] ?? w}
                    </span>
                  ))}
                </div>
              </div>
              {selectedMapCfg.specialRule && (
                <div className="rounded-lg border border-amber-400/35 bg-amber-500/10 p-2.5">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                    Regra Especial
                  </div>
                  <div className="mt-0.5 text-[#fde68a]">
                    {SPECIAL_RULE_LABELS[selectedMapCfg.specialRule] ?? selectedMapCfg.specialRule}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-2.5">
              <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">
                Paleta Geológica
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                  <div
                    className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                    style={{ backgroundColor: selectedMapCfg.terrainTint }}
                  />
                  <span className="text-[#9ca3af]">Solo</span>
                </div>
                <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                  <div
                    className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                    style={{ backgroundColor: formatHex(selectedMapCfg.cliffHex) }}
                  />
                  <span className="text-[#9ca3af]">Encosta</span>
                </div>
                <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                  <div
                    className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                    style={{ backgroundColor: formatHex(selectedMapCfg.waterColorHex) }}
                  />
                  <span className="text-[#9ca3af]">Água</span>
                </div>
              </div>
            </div>
          </>
        )}

        {galleryCategory === 'fauna' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Ficha Zoológica 3D
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    selectedFaunaCfg.retaliates
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {selectedFaunaCfg.retaliates ? 'Retalia' : 'Pacífica'}
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {selectedFaunaCfg.labelPt}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {selectedFaunaCfg.role}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                <div className="text-[9px] uppercase text-[#9ca3af]">Vida (HP)</div>
                <div className="font-mono-num text-sm font-bold text-emerald-300">
                  {selectedFaunaCfg.maxHp}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                <div className="text-[9px] uppercase text-[#9ca3af]">Alimento</div>
                <div className="font-mono-num text-sm font-bold text-amber-300">
                  {selectedFaunaCfg.foodAmount}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                <div className="text-[9px] uppercase text-[#9ca3af]">Ataque</div>
                <div className="font-mono-num text-sm font-bold text-rose-300">
                  {selectedFaunaCfg.attack}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                <div className="text-[9px] uppercase text-[#9ca3af]">Velocidade</div>
                <div className="font-mono-num text-sm font-bold text-sky-300">
                  {selectedFaunaCfg.speed.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/8 bg-[#121826]/70 p-2.5 text-[11px]">
              <div className="text-[9px] font-bold uppercase tracking-wider text-sky-300">
                Biomas de Ocorrência
              </div>
              <div className="mt-0.5 text-[#e2e8f0]">{selectedFaunaCfg.biome}</div>
            </div>

            <div className="border-t border-white/10 pt-2.5">
              <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">
                Pelagem & Anatomia
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                  <div
                    className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                    style={{ backgroundColor: formatHex(selectedFaunaCfg.coatHex) }}
                  />
                  <span className="text-[#9ca3af]">Pelagem</span>
                </div>
                <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                  <div
                    className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                    style={{ backgroundColor: formatHex(selectedFaunaCfg.underbellyHex) }}
                  />
                  <span className="text-[#9ca3af]">Ventre</span>
                </div>
                <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                  <div
                    className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                    style={{ backgroundColor: formatHex(selectedFaunaCfg.hornOrTuskHex) }}
                  />
                  <span className="text-[#9ca3af]">Chifre/Presa</span>
                </div>
              </div>
            </div>
          </>
        )}

        {galleryCategory === 'terrain' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
                  {selectedTerrainItem.layerLabel}
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {selectedTerrainItem.name}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {selectedTerrainItem.desc}
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Constante XS / Script (.xs)</div>
                <div className="mt-0.5 font-mono-num text-xs font-bold text-amber-300">
                  {selectedTerrainItem.rmConstant}
                </div>
                <div className="mt-0.5 font-mono-num text-[10px] text-[#9ca3af]">
                  Identificador: &quot;{selectedTerrainItem.xsName}&quot;
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Bioma / Civilização</div>
                <div className="mt-0.5 text-[#e2e8f0]">{selectedTerrainItem.biomeLabel}</div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Movimentação</div>
                  <div
                    className={`mt-0.5 text-[10px] font-semibold ${
                      selectedTerrainItem.passableLabel.includes('Intransponível') ||
                      selectedTerrainItem.passableLabel.includes('Bloqueia')
                        ? 'text-orange-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    {selectedTerrainItem.passableLabel}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Construção</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-[#e2e8f0]">
                    {selectedTerrainItem.buildableLabel}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Navegação / Estado</div>
                  <div className="mt-0.5 text-[#cbd5e1]">{selectedTerrainItem.navigableLabel}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-4 w-6 rounded-sm border border-white/25"
                    style={{ backgroundColor: selectedTerrainItem.swatchCss }}
                  />
                  <span className="font-mono-num text-[10px] text-[#9ca3af]">
                    {selectedTerrainItem.swatchCss}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {galleryCategory === 'flora' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {selectedFloraItem.category === 'tree' ? 'Espécie Botânica' : 'Nó de Recurso & Marco'}
              </span>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {selectedFloraItem.name}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {selectedFloraItem.desc}
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Rendimento</div>
                <div className="mt-0.5 font-mono-num text-xs font-bold text-amber-300">
                  {selectedFloraItem.yieldLabel}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Afinidade Geográfica</div>
                <div className="mt-0.5 text-[#e2e8f0]">{selectedFloraItem.biomeAffinity}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Variação Morfológica</div>
                <div className="mt-0.5 font-mono-num text-xs text-emerald-300">
                  Semente #{floraVariantSeed} (de 5 variações)
                </div>
              </div>
            </div>
          </>
        )}

        {galleryCategory === 'utensil' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Utensílio & Artefato Civil
                </span>
                <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#cbd5e1]">
                  {selectedUtensilCfg.category === 'work'
                    ? 'Trabalho'
                    : selectedUtensilCfg.category === 'ritual'
                    ? 'Ritual'
                    : 'Doméstico'}
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {selectedUtensilCfg.name}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {selectedUtensilCfg.desc}
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Afinidade Cultural</div>
                <div className="mt-0.5 font-semibold text-amber-200">{selectedUtensilCfg.civAffinity}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Função / Uso</div>
                <div className="mt-0.5 text-[#e2e8f0]">{selectedUtensilCfg.usage}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Materiais</div>
                <div className="mt-0.5 text-[#cbd5e1]">{selectedUtensilCfg.materialLabel}</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-[#9ca3af]">Acabamento</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-6 rounded-sm border border-white/25"
                  style={{ backgroundColor: formatHex(selectedUtensilCfg.accentHex) }}
                />
                <span className="font-mono-num text-[#cbd5e1]">
                  {formatHex(selectedUtensilCfg.accentHex)}
                </span>
              </div>
            </div>
          </>
        )}

        {galleryCategory === 'relic' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  {PANTHEONS[selectedRelicCfg.pantheon].name} · {selectedRelicCfg.tierLabel}
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {selectedRelicCfg.name}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {selectedRelicCfg.desc}
              </p>
            </div>

            <div className="rounded-lg border border-amber-400/35 bg-amber-500/10 p-2.5 text-[11px]">
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                Bônus no Templo
              </div>
              <div className="mt-0.5 font-semibold text-[#fde68a]">{selectedRelicCfg.bonusLabel}</div>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="rounded-lg border border-white/10 bg-[#090d16] p-2.5">
                <div className="text-[9px] font-bold uppercase text-[#9ca3af]">Origem Mitológica</div>
                <div className="mt-0.5 text-[#e2e8f0]">{selectedRelicCfg.origin}</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-[#9ca3af]">Aura Mítica</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-6 rounded-sm border border-white/25"
                  style={{ backgroundColor: formatHex(selectedRelicCfg.auraHex) }}
                />
                <span className="font-mono-num text-[#cbd5e1]">
                  {formatHex(selectedRelicCfg.auraHex)}
                </span>
              </div>
            </div>
          </>
        )}

        {galleryCategory === 'building' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                  {PANTHEONS[selectedCiv].name} · {selectedMajorGod}
                </span>
                <span className="font-mono-num rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                  T{buildingAge}
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {activeBuildingInfo.name}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {activeBuildingInfo.role}
              </p>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px]">
              {selectedCiv === 'greek' && selectedBuilding === 'temple' ? (
                (() => {
                  const rawGod = selectedMajorGod.toLowerCase();
                  const godKey = (
                    rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus'
                  ) as GreekTempleGodKey;
                  const info = GREEK_TEMPLE_THEMES[godKey]?.tiers[buildingAge];
                  return (
                    <>
                      <div className="font-bold text-amber-300">
                        {info?.title || `Templo Grego • Tier ${buildingAge}`}
                      </div>
                      <div className="mt-0.5 text-[#fde68a]/90">
                        {info?.sub || BUILDING_ERA_SPECS[buildingAge - 1]?.desc}
                      </div>
                    </>
                  );
                })()
              ) : selectedCiv === 'egyptian' && selectedBuilding === 'temple' ? (
                (() => {
                  const rawGod = selectedMajorGod.toLowerCase();
                  const godKey = (
                    rawGod.includes('isis') ? 'isis' : rawGod.includes('set') ? 'set' : 'ra'
                  ) as EgyptianTempleGodKey;
                  const info = EGYPT_TEMPLE_THEMES[godKey]?.tiers[buildingAge];
                  return (
                    <>
                      <div className="font-bold text-amber-300">
                        {info?.title || `Templo Egípcio • Tier ${buildingAge}`}
                      </div>
                      <div className="mt-0.5 text-[#fde68a]/90">
                        {info?.sub || BUILDING_ERA_SPECS[buildingAge - 1]?.desc}
                      </div>
                    </>
                  );
                })()
              ) : selectedCiv === 'egyptian' && isEgyptianArchBuilding(selectedBuilding) ? (
                (() => {
                  const godKey = resolveEgyptianArchGod(selectedMajorGod);
                  const theme = EGYPT_ARCH_THEMES[godKey];
                  const meta = EGYPT_ARCH_BUILDING_META[selectedBuilding];
                  const effTier = Math.max(meta.minTier, Math.min(5, buildingAge));
                  const eraLabel = EGYPT_ARCH_ERA_NAMES[effTier] || `Era ${effTier}`;
                  return (
                    <>
                      <div className="font-bold text-amber-300">
                        {`${meta.label} ${theme.title} • Tier ${effTier} (${eraLabel})`}
                      </div>
                      <div className="mt-0.5 text-[#fde68a]/90">{theme.subtitle}</div>
                    </>
                  );
                })()
              ) : (
                <>
                  <div className="font-bold text-amber-300">
                    {BUILDING_ERA_SPECS[buildingAge - 1]?.title}
                  </div>
                  <div className="mt-0.5 text-[#fde68a]/90">
                    {BUILDING_ERA_SPECS[buildingAge - 1]?.desc}
                  </div>
                </>
              )}
            </div>

            {activeBuildingStats && (
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">Vida Base</div>
                  <div className="font-mono-num text-sm font-bold text-emerald-300">
                    {activeBuildingStats.maxHp}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">População</div>
                  <div className="font-mono-num text-sm font-bold text-sky-300">
                    +{activeBuildingStats.popBonus ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">Ataque</div>
                  <div className="font-mono-num text-sm font-bold text-rose-300">
                    {activeBuildingStats.attack ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">Raio</div>
                  <div className="font-mono-num text-sm font-bold text-amber-300">
                    {activeBuildingStats.radius.toFixed(1)}m
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {galleryCategory === 'unit' && (
          <>
            <div className="border-b border-white/10 pb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                {PANTHEONS[selectedCiv].name} · {selectedMajorGod}
              </span>
              <h3 className="mt-1 font-display text-base font-bold text-[#f5e3b0]">
                {activeUnitInfo.name}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#cbd5e1]">
                {activeUnitInfo.role}
              </p>
            </div>

            {activeUnitStats && (
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">Vida (HP)</div>
                  <div className="font-mono-num text-sm font-bold text-emerald-300">
                    {activeUnitStats.maxHp}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">Ataque</div>
                  <div className="font-mono-num text-sm font-bold text-rose-300">
                    {activeUnitStats.attack}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">Alcance</div>
                  <div className="font-mono-num text-sm font-bold text-amber-300">
                    {activeUnitStats.range.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#090d16] p-2">
                  <div className="text-[9px] uppercase text-[#9ca3af]">Velocidade</div>
                  <div className="font-mono-num text-sm font-bold text-sky-300">
                    {activeUnitStats.speed.toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {showGreekArmorTiers && (() => {
              const activeSpec =
                AOM_HOPLITE_UV_TIERS[activeTier as HopliteArmorTier] ?? AOM_HOPLITE_UV_TIERS[3];
              return (
                <div className="border-t border-white/10 pt-2.5 space-y-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                    Paleta UV Tier {activeTier} · {activeSpec.name}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(activeSpec.armorHex) }}
                      />
                      <span className="text-[#9ca3af]">Couraça</span>
                    </div>
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(activeSpec.accentHex) }}
                      />
                      <span className="text-[#9ca3af]">Detalhe</span>
                    </div>
                    <div className="rounded border border-white/10 bg-[#090d16] p-1.5">
                      <div
                        className="mb-1 h-3.5 w-full rounded-sm border border-white/20"
                        style={{ backgroundColor: formatHex(activeSpec.greaveHex) }}
                      />
                      <span className="text-[#9ca3af]">Grevas</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </aside>
  );
}
