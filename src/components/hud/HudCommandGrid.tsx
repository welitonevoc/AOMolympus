import React, { useState } from 'react';
import {
  Anchor,
  Castle,
  Check,
  Compass,
  Crown,
  DoorOpen,
  Eye,
  GripHorizontal,
  Hammer,
  HelpCircle,
  Info,
  LayoutGrid,
  Lock,
  LogOut,
  Repeat,
  Shield,
  Sparkles,
  Square,
  StretchHorizontal,
  Sun,
  Swords,
} from 'lucide-react';
import {
  getCivBuildingSpec,
  getCivUnitSpec,
  getEffectiveTechCost,
  TECH_SPECS,
} from '../../game/divineData';
import {
  AGE_NAMES,
  AgeLevel,
  BuildingKind,
  CombatStance,
  FormationId,
  FORMATIONS,
  GameHudSnapshot,
  ResourceType,
  TechId,
  UnitKind,
} from '../../game/types';
import { BuildingIcon } from '../BuildingIcon';
import { EraIcon } from '../EraIcon';
import { ResourceIcon } from '../ResourceIcon';
import { TechIcon } from '../TechIcon';
import { UnitIcon } from '../UnitIcon';
import {
  getBuildingCategory,
  getBuildingExclusiveTechs,
  getBuildingExclusiveUnits,
  getVillagerCultureDetails,
  VillagerBuildCategory,
} from './commandCenterUtils';
import { formatCost } from './hudTypes';

type BuildingSpecItem = ReturnType<typeof getCivBuildingSpec>;
type UnitSpecItem = ReturnType<typeof getCivUnitSpec>;
type TechSpecItem = (typeof TECH_SPECS)[keyof typeof TECH_SPECS];

interface HudCommandGridProps {
  hud: GameHudSnapshot;
  buildingList: BuildingSpecItem[];
  unitList: UnitSpecItem[];
  techList: TechSpecItem[];
  isProductionBuilding: boolean;
  selectedPlayerBuildingKind?: BuildingKind;
  nextAge: AgeLevel | null;
  nextAgeCost: { food?: number; wood?: number; gold?: number; favor?: number } | null;
  canAffordNextAge: boolean;
  onToggleRepeatTraining: (buildingId: string) => void;
  onOrderVillagerTask?: (task: 'wood' | 'food' | 'gold' | 'hunt' | 'build') => void;
  onOrderPrayTemple?: (templeId?: string) => void;
  onPromoteToHero?: () => void;
  onStartBuild: (kind: BuildingKind) => void;
  onOrderVillagersToTarget?: () => void;
  onAdvanceAge: () => void;
  onSummonSetAnimal?: (kind: 'baboon' | 'hyena' | 'crocodile' | 'hippo') => void;
  onOrderEmpowerMonument?: (buildingId?: string) => void;
  onTeleportSkyPassage?: (buildingId: string) => void;
  onGarrisonSelected?: (buildingId: string) => void;
  onUngarrisonBuilding?: (buildingId: string) => void;
  onConvertWallToGate?: () => void;
  onExchangeTribute: (from: ResourceType, to: ResourceType, amount: number) => void;
  onTrainUnit: (kind: UnitKind) => void;
  onResearchTech: (techId: TechId) => void;
  onTriggerMythSpecial?: () => void;
  onToggleMythAutoCast?: () => void;
  onSetUnitStance?: (stance: CombatStance) => void;
  onToggleAutoScout?: () => void;
  onEmbarkTransport?: (shipId?: string) => void;
  onDisembarkTransport?: (shipId: string) => void;
  onSetFormation: (formation: FormationId) => void;
  onConvertFauna?: () => void;
  onSpreadOracles?: () => void;
  onStopUnits: () => void;
  onSelectCombat: () => void;
  onFocusTownCenter: () => void;
}

export function HudCommandGrid({
  hud,
  buildingList,
  unitList,
  techList,
  isProductionBuilding,
  selectedPlayerBuildingKind,
  nextAge,
  nextAgeCost,
  canAffordNextAge,
  onToggleRepeatTraining,
  onOrderVillagerTask,
  onOrderPrayTemple,
  onPromoteToHero,
  onStartBuild,
  onOrderVillagersToTarget,
  onAdvanceAge,
  onSummonSetAnimal,
  onOrderEmpowerMonument,
  onTeleportSkyPassage,
  onGarrisonSelected,
  onUngarrisonBuilding,
  onConvertWallToGate,
  onExchangeTribute,
  onTrainUnit,
  onResearchTech,
  onTriggerMythSpecial,
  onToggleMythAutoCast,
  onSetUnitStance,
  onToggleAutoScout,
  onEmbarkTransport,
  onDisembarkTransport,
  onSetFormation,
  onConvertFauna,
  onSpreadOracles,
  onStopUnits,
  onSelectCombat,
  onFocusTownCenter,
}: HudCommandGridProps) {
  // Local state for categorized tabs to keep the command center compact ("enxugar a barra")
  const [villagerTab, setVillagerTab] = useState<VillagerBuildCategory>('all');
  const [buildingSubTab, setBuildingSubTab] = useState<'all' | 'units' | 'techs'>('all');

  // Culture-specific details for villager selection
  const villagerCulture = getVillagerCultureDetails(
    hud.pantheon,
    hud.selection.unitKind,
    hud.selection.isHero
  );

  // Buildings filtered by the active category tab
  const filteredBuildings = buildingList.filter((b) => {
    if (villagerTab === 'all') return true;
    return getBuildingCategory(b.kind) === villagerTab;
  });

  // Category counts for badges
  const ecoCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'eco').length;
  const milCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'military').length;
  const defCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'defense').length;
  const divCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'divine').length;

  // Header Title calculation
  const getHeaderTitle = () => {
    if (hud.selection.hasVillagerSelected) {
      return villagerCulture.title;
    }
    if (selectedPlayerBuildingKind) {
      if (selectedPlayerBuildingKind === 'fortress' || selectedPlayerBuildingKind === 'asgard_hill_fort') {
        if (hud.pantheon === 'egyptian') return 'Fortaleza Migdol (Bastião Real)';
        if (hud.pantheon === 'norse') return 'Forte da Colina (Hill Fort)';
        if (hud.pantheon === 'atlantean') return 'Palácio Atlante (Cidadela)';
        return 'Fortaleza Helênica (Bastião)';
      }
      if (selectedPlayerBuildingKind === 'temple') {
        return `Templo Sagrado de ${hud.majorGodName}`;
      }
      if (selectedPlayerBuildingKind === 'barracks' || selectedPlayerBuildingKind === 'counter_barracks') {
        if (selectedPlayerBuildingKind === 'counter_barracks') return 'Quartel de Contra-Ataque';
        if (hud.pantheon === 'greek') return 'Academia Militar';
        if (hud.pantheon === 'norse') return 'Quartel Nórdico';
        return 'Quartel de Infantaria';
      }
      if (selectedPlayerBuildingKind === 'archery_range') {
        if (hud.pantheon === 'egyptian') return 'Campo de Fundeiros & Arquearia';
        return 'Campo de Arquearia';
      }
      if (selectedPlayerBuildingKind === 'stable') {
        return 'Estábulo (Cavalaria)';
      }
      if (selectedPlayerBuildingKind === 'great_hall') {
        return 'Grande Salão Nórdico';
      }
      if (selectedPlayerBuildingKind === 'siege_works') {
        return 'Oficina de Cerco';
      }
      return getCivBuildingSpec(hud.pantheon, selectedPlayerBuildingKind, hud.majorGodName, hud.age).name;
    }
    if (hud.selection.primaryType === 'unit' && hud.selection.team === 'player') {
      return 'Ordens & Formações';
    }
    return 'Central de Comandos';
  };

  return (
    <div className="md:col-span-5 flex flex-col justify-between gap-1.5 md:border-r border-[#c8a962]/20 md:pr-2">
      {/* HEADER STRIP */}
      <div className="flex items-center justify-between gap-1.5 border-b border-[#c8a962]/25 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {selectedPlayerBuildingKind && !hud.selection.hasVillagerSelected ? (
            <BuildingIcon kind={selectedPlayerBuildingKind} pantheon={hud.pantheon} size={20} />
          ) : hud.selection.hasVillagerSelected ? (
            <Hammer className="h-4 w-4 text-[#facc15] shrink-0" />
          ) : null}
          <span className="font-display text-[11px] font-bold uppercase tracking-wider text-[#f3d27a] truncate">
            {getHeaderTitle()}
          </span>

          {selectedPlayerBuildingKind === 'town_center' && hud.selection.townCenterTier && (
            <span
              title={
                hud.selection.townCenterTier >= 5
                  ? 'Centro da Cidade T5 — Metrópole Divina'
                  : `Centro da Cidade Nível T${hud.selection.townCenterTier}`
              }
              className={`shrink-0 rounded border px-1 py-0.5 font-mono-num text-[9px] font-bold tracking-wider ${
                hud.selection.townCenterTier >= 5
                  ? 'border-[#facc15]/70 bg-[#2b2108] text-[#fde047]'
                  : 'border-[#c8a962]/45 bg-[#192030] text-[#e2d4ad]'
              }`}
            >
              {hud.selection.townCenterTier >= 5 ? 'T5 METRÓPOLE' : `T${hud.selection.townCenterTier}`}
            </span>
          )}

          {(selectedPlayerBuildingKind === 'fortress' || selectedPlayerBuildingKind === 'asgard_hill_fort') && (
            <span className="shrink-0 rounded border border-[#f59e0b]/50 bg-[#261909] px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-[#fde68a]">
              Era III+
            </span>
          )}

          {selectedPlayerBuildingKind === 'monument' && hud.monumentCount !== undefined && (
            <span className="shrink-0 rounded border border-[#c8a962]/45 bg-[#192030] px-1 py-0.5 font-mono-num text-[9px] font-bold text-[#fde68a]">
              {hud.monumentCount}/5
            </span>
          )}
          {selectedPlayerBuildingKind === 'sky_passage' && hud.skyPassageCount !== undefined && (
            <span className="shrink-0 rounded border border-[#22d3ee]/45 bg-[#0e2230] px-1 py-0.5 font-mono-num text-[9px] font-bold text-[#67e8f9]">
              {hud.skyPassageCount} Portais
            </span>
          )}
        </div>

        {isProductionBuilding && hud.selection.buildingId && (
          <button
            type="button"
            onClick={() => onToggleRepeatTraining(hud.selection.buildingId!)}
            title="Repetir treinamento automaticamente"
            className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap cursor-pointer ${
              hud.selection.repeatTraining
                ? 'border-emerald-400/60 bg-emerald-950/60 text-emerald-300'
                : 'border-[#c8a962]/30 bg-[#141a27] text-[#cbd5e1] hover:border-[#f3d27a]'
            }`}
          >
            <Repeat className="h-3 w-3" />
            <span>Repetir</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CASE A: VILLAGER SELECTED -> CUSTOMIZED PER VILLAGER TYPE & CATEGORIZED   */}
      {/* ========================================================================= */}
      {hud.selection.hasVillagerSelected ? (
        <div className="flex flex-1 flex-col justify-between gap-1.5">
          {/* Villager Cultural Trait Badge */}
          <div className="flex items-center justify-between gap-1 rounded bg-[#161d2b] px-2 py-0.5 text-[10px]">
            <span className="text-[#94a3b8] truncate">{villagerCulture.subtitle}</span>
            <span className="shrink-0 rounded border border-[#facc15]/40 bg-[#29200b] px-1.5 py-0.2 font-semibold text-[#fde68a] text-[9px]">
              {villagerCulture.badge}
            </span>
          </div>

          {/* Quick Gather Task Icons */}
          {onOrderVillagerTask && (
            <div className="grid grid-cols-5 gap-1">
              <button
                type="button"
                onClick={() => onOrderVillagerTask('wood')}
                title="Colher Madeira"
                className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#4ade80] hover:bg-[#16261d] hover:text-white cursor-pointer"
              >
                <ResourceIcon kind="wood" size={15} />
                <span className="hidden sm:inline">Mad</span>
              </button>
              <button
                type="button"
                onClick={() => onOrderVillagerTask('gold')}
                title="Minerar Ouro"
                className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#facc15] hover:bg-[#26200d] hover:text-white cursor-pointer"
              >
                <ResourceIcon kind="gold" size={15} />
                <span className="hidden sm:inline">Ouro</span>
              </button>
              <button
                type="button"
                onClick={() => onOrderVillagerTask('food')}
                title="Colher Alimento"
                className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#ef4444] hover:bg-[#261215] hover:text-white cursor-pointer"
              >
                <ResourceIcon kind="food" size={15} />
                <span className="hidden sm:inline">Alim</span>
              </button>
              <button
                type="button"
                onClick={() => onOrderVillagerTask('hunt')}
                title="Caçar Animais"
                className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#f59e0b] hover:bg-[#26190d] hover:text-white cursor-pointer"
              >
                <ResourceIcon kind="hunt" size={15} />
                <span className="hidden sm:inline">Caça</span>
              </button>
              <button
                type="button"
                onClick={() => onOrderVillagerTask('build')}
                title="Concluir / Reparar Construção Próxima"
                className="flex items-center justify-center gap-1 rounded border border-[#d4af37]/50 bg-[#1d2230] py-1 text-[10px] font-semibold text-[#fde68a] hover:border-[#fde047] hover:bg-[#2a2715] cursor-pointer"
              >
                <Hammer className="h-3.5 w-3.5 text-[#facc15]" />
                <span className="hidden sm:inline">Obra</span>
              </button>
            </div>
          )}

          {/* Contextual Action: Pray at Temple (Greeks) */}
          {hud.selection.canPrayAtTemple && onOrderPrayTemple && (
            <button
              type="button"
              onClick={() => onOrderPrayTemple()}
              title="Enviar aldeões selecionados para orar no Templo e gerar Favor Divino"
              className="flex items-center justify-between gap-2 rounded border border-[#38bdf8]/55 bg-[#0e2234] px-2 py-0.5 text-[10px] font-bold text-[#bae6fd] hover:border-[#7dd3fc] hover:bg-[#143047] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#38bdf8] shrink-0" />
                <span>Orar no Templo (Gerar Favor)</span>
              </span>
              <span className="font-mono-num text-[9px] text-[#7dd3fc]">+Favor</span>
            </button>
          )}

          {/* Contextual Action: Promote to Hero (Atlanteans) */}
          {hud.selection.canPromoteToHero && onPromoteToHero && (
            <button
              type="button"
              onClick={onPromoteToHero}
              title="Promover Cidadãos Atlantes selecionados a Herói (★)"
              className="flex items-center justify-between gap-2 rounded border border-[#facc15]/60 bg-[#281f0b] px-2 py-0.5 text-[10px] font-bold text-[#fde68a] hover:border-[#fde047] hover:bg-[#382b10] cursor-pointer"
            >
              <span className="flex items-center gap-1 truncate">
                <Crown className="h-3 w-3 text-[#facc15] shrink-0" />
                <span>
                  Promover a Herói ★
                  {(hud.selection.heroPromoteCount ?? 0) > 1 ? ` (×${hud.selection.heroPromoteCount})` : ''}
                </span>
              </span>
              {hud.selection.heroPromoteIsFree ? (
                <span className="font-mono-num text-[9px] font-bold text-emerald-300 shrink-0">
                  GRÁTIS (Hipérion)
                </span>
              ) : hud.selection.heroPromoteCost ? (
                <span className="font-mono-num text-[9px] text-[#fef08a] shrink-0">
                  {formatCost(hud.selection.heroPromoteCost)}
                </span>
              ) : null}
            </button>
          )}

          {/* CATEGORY TABS TO CLEAN UP / ENXUGAR A BARRA */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[9px] font-semibold border-b border-white/8">
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'eco', label: `Econômicas (${ecoCount})` },
                { id: 'military', label: `Militares (${milCount})` },
                { id: 'defense', label: `Defesa (${defCount})` },
                { id: 'divine', label: `Sagradas (${divCount})` },
              ] as const
            ).map((tab) => {
              const active = villagerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVillagerTab(tab.id)}
                  className={`rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#d4af37] text-[#0b0e14] font-bold shadow-xs'
                      : 'bg-[#141a27] text-[#94a3b8] hover:text-[#f3d27a]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Norse Gatherer info if military tab is selected */}
          {hud.pantheon === 'norse' && villagerTab === 'military' && (
            <div className="flex items-center gap-1 rounded bg-[#1f1910] border border-[#f59e0b]/40 px-2 py-0.5 text-[9px] text-[#fde68a]">
              <Info className="h-3 w-3 text-[#facc15] shrink-0" />
              <span>Dica Retold: Guerreiros nórdicos (Ulfsark / Infantaria) erguem quartéis e fortificações!</span>
            </div>
          )}

          {/* Categorized Buildings Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-[88px] sm:max-h-[120px] overflow-y-auto pr-0.5">
            {filteredBuildings.map((b) => {
              const tcAtMax = b.kind === 'town_center' && hud.playerTownCenterCount >= hud.maxTownCenters;
              const monAtMax = b.kind === 'monument' && (hud.monumentCount ?? 0) >= 5;
              const wonderAtMax = b.kind === 'wonder' && (hud.wonderCount ?? 0) >= 1;
              const locked = hud.age < b.minAge || tcAtMax || monAtMax || wonderAtMax;
              const active = hud.activeBuildMode === b.kind;
              const countTag =
                b.kind === 'town_center'
                  ? `${hud.playerTownCenterCount}/${hud.maxTownCenters}`
                  : b.kind === 'monument'
                  ? `${hud.monumentCount ?? 0}/5`
                  : b.kind === 'wonder'
                  ? `${hud.wonderCount ?? 0}/1`
                  : null;
              return (
                <button
                  key={b.kind}
                  type="button"
                  disabled={locked}
                  onClick={() => onStartBuild(b.kind)}
                  title={`${b.name} — ${b.role}${formatCost(b.cost) ? ` (${formatCost(b.cost)})` : ''}`}
                  className={`group flex items-center gap-1.5 rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-emerald-400 bg-emerald-950/80 text-white'
                      : locked
                      ? 'border-white/8 bg-[#10141e] text-[#64748b] opacity-65 cursor-not-allowed'
                      : b.kind === 'fortress' || b.kind === 'asgard_hill_fort'
                      ? 'border-[#f59e0b]/60 bg-[#241a0b] text-[#fde68a] hover:border-[#facc15] hover:bg-[#32230e]'
                      : b.kind === 'titan_gate' || b.kind === 'wonder'
                      ? 'border-[#f59e0b]/55 bg-[#22190b] text-[#fde68a] hover:border-[#facc15] hover:bg-[#2d210e]'
                      : 'border-[#c8a962]/28 bg-[#131926] text-[#f3efe6] hover:border-[#f3d27a] hover:bg-[#1c2438]'
                  }`}
                >
                  <BuildingIcon kind={b.kind} pantheon={hud.pantheon} size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold leading-tight truncate">{b.name}</span>
                      {countTag && <span className="font-mono-num text-[8px] text-[#e5c45e] shrink-0">{countTag}</span>}
                    </div>
                    <span className="block font-mono-num text-[9px] text-[#94a3b8] leading-tight truncate">
                      {tcAtMax
                        ? 'Máx. 3 TCs'
                        : monAtMax
                        ? 'Máx. 5 Mon.'
                        : wonderAtMax
                        ? '1 Maravilha'
                        : hud.age < b.minAge
                        ? AGE_NAMES[b.minAge]
                        : formatCost(b.cost)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : selectedPlayerBuildingKind ? (
        /* ========================================================================= */
        /* CASE B: PLAYER BUILDING SELECTED -> STRICTLY THAT BUILDING'S UNITS & TECH */
        /* ========================================================================= */
        !hud.selection.isConstructed ? (
          <div className="flex flex-1 flex-col justify-center gap-2 rounded border border-[#f59e0b]/35 bg-[#1a1610] p-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#fbbf24]">
              <BuildingIcon kind={selectedPlayerBuildingKind} pantheon={hud.pantheon} size={24} />
              <span>Estrutura em construção ({Math.round((hud.selection.buildProgress ?? 0) * 100)}%)</span>
            </div>
            {onOrderVillagersToTarget && (
              <button
                type="button"
                onClick={onOrderVillagersToTarget}
                className="flex items-center justify-center gap-1.5 rounded bg-[#d4af37] px-2.5 py-1.5 text-[11px] font-bold text-[#0b0e14] hover:bg-[#e5c45e] cursor-pointer"
              >
                <Hammer className="h-3.5 w-3.5" />
                <span>Enviar Aldeões para Concluir</span>
              </button>
            )}
          </div>
        ) : (
          (() => {
            // Strictly get units and techs belonging to this building
            const buildingUnits = getBuildingExclusiveUnits(
              selectedPlayerBuildingKind,
              hud.pantheon,
              hud.majorGodName,
              unitList,
              hud.chosenMinorGods
            );

            const buildingTechs = getBuildingExclusiveTechs(
              selectedPlayerBuildingKind,
              hud.pantheon,
              hud.majorGodName,
              techList,
              hud.chosenMinorGods
            );

            const isFortress =
              selectedPlayerBuildingKind === 'fortress' || selectedPlayerBuildingKind === 'asgard_hill_fort';
            const isTemple = selectedPlayerBuildingKind === 'temple';
            const showAgeUp = selectedPlayerBuildingKind === 'town_center' && nextAge && nextAgeCost;
            const showMarket = selectedPlayerBuildingKind === 'market';
            const showSkyPassage = selectedPlayerBuildingKind === 'sky_passage';

            // Filter by subtab if both units and techs exist
            const showUnits = buildingSubTab === 'all' || buildingSubTab === 'units';
            const showTechs = buildingSubTab === 'all' || buildingSubTab === 'techs';

            return (
              <div className="flex flex-1 flex-col gap-1.5 max-h-[96px] sm:max-h-[148px] overflow-y-auto pr-0.5">
                {/* 1. FORTRESS RETOLD GARRISON & DEFENSE BAR */}
                {isFortress && (
                  <div className="flex flex-col gap-1 rounded border border-[#f59e0b]/50 bg-[#201508] p-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 font-semibold text-[#fde68a]">
                        <Castle className="h-3.5 w-3.5 text-[#facc15]" />
                        <span>Bastião Defensivo (Retold)</span>
                      </span>
                      <span className="font-mono-num font-bold text-[#fde047]">
                        {hud.selection.garrisonedCount ?? 0} / 20 tropas
                        {(hud.selectedBuildingGarrison?.bonusArrows ?? 0) > 0 && (
                          <span className="ml-1 text-[#67e8f9]">
                            (+{hud.selectedBuildingGarrison!.bonusArrows} flechas)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {onGarrisonSelected && hud.selection.buildingId && (
                        <button
                          type="button"
                          onClick={() => onGarrisonSelected(hud.selection.buildingId!)}
                          className="flex flex-1 items-center justify-center gap-1 rounded border border-[#60a5fa]/60 bg-[#132948] px-2 py-0.5 text-[9.5px] font-bold text-[#dbeafe] hover:bg-[#1a3760] cursor-pointer"
                        >
                          <Shield className="h-3 w-3 text-[#60a5fa]" />
                          <span>Guarnecer Tropas</span>
                        </button>
                      )}
                      {hud.selection.canUngarrison && hud.selection.buildingId && onUngarrisonBuilding && (
                        <button
                          type="button"
                          onClick={() => onUngarrisonBuilding(hud.selection.buildingId!)}
                          className="flex flex-1 items-center justify-center gap-1 rounded border border-[#f59e0b]/70 bg-[#2d1b06] px-2 py-0.5 text-[9.5px] font-bold text-[#fef3c7] hover:bg-[#452709] cursor-pointer"
                        >
                          <LogOut className="h-3 w-3 text-[#fbbf24]" />
                          <span>Liberar ({hud.selection.garrisonedCount})</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. TEMPLE DIVINE ACTIONS BAR */}
                {isTemple && (
                  <div className="flex flex-col gap-1 rounded border border-[#38bdf8]/45 bg-[#0b1c2b] p-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 font-semibold text-[#bae6fd]">
                        <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
                        <span>Favor Sagrado de {hud.majorGodName}</span>
                      </span>
                      <span className="font-mono-num font-bold text-[#fde047]">
                        {Math.floor(hud.resources.favor)} Favor
                      </span>
                    </div>

                    {/* Greek Villagers Call to Pray */}
                    {hud.selection.canCallVillagersToPray && onOrderPrayTemple && (
                      <button
                        type="button"
                        onClick={() => onOrderPrayTemple(hud.selection.buildingId)}
                        className="flex items-center justify-between gap-2 rounded border border-[#38bdf8]/65 bg-[#0d2638] px-2 py-1 text-[10px] font-bold text-[#bae6fd] hover:border-[#7dd3fc] hover:bg-[#13364f] cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Sparkles className="h-3.5 w-3.5 text-[#38bdf8] shrink-0" />
                          <span>Chamar Aldeões para Orar</span>
                        </span>
                        <span className="font-mono-num text-[9px] text-[#7dd3fc] shrink-0">
                          {hud.selection.prayingCount ?? 0} ald. · +{(hud.selection.templePrayerRatePerSec ?? 0).toFixed(2)}/s
                        </span>
                      </button>
                    )}

                    {/* Egyptian Set Animals */}
                    {hud.isSetPlayer && onSummonSetAnimal && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-0.5">
                        {(
                          [
                            { kind: 'baboon', label: 'Babuíno', cost: 8, minAge: 1 },
                            { kind: 'hyena', label: 'Hiena', cost: 12, minAge: 1 },
                            { kind: 'crocodile', label: 'Crocodilo', cost: 16, minAge: 2 },
                            { kind: 'hippo', label: 'Hipopótamo', cost: 22, minAge: 3 },
                          ] as const
                        ).map((sa) => {
                          const locked = hud.age < sa.minAge || hud.resources.favor < sa.cost;
                          return (
                            <button
                              key={sa.kind}
                              type="button"
                              disabled={locked}
                              onClick={() => onSummonSetAnimal(sa.kind)}
                              className={`flex flex-col items-start rounded border px-1.5 py-0.5 text-left transition-colors cursor-pointer ${
                                locked
                                  ? 'border-white/10 bg-[#10131b] text-[#64748b] cursor-not-allowed'
                                  : 'border-amber-400/50 bg-[#2b1d0b] text-amber-100 hover:border-amber-300 hover:bg-[#3a270f]'
                              }`}
                            >
                              <span className="text-[9.5px] font-semibold leading-tight truncate w-full">{sa.label}</span>
                              <span className="font-mono-num text-[8.5px] text-amber-300">
                                {hud.age < sa.minAge ? AGE_NAMES[sa.minAge] : `${sa.cost} Fav`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. TOWN CENTER AGE UP */}
                {showAgeUp && nextAge && nextAgeCost && (
                  <button
                    type="button"
                    disabled={!canAffordNextAge || Boolean(hud.advancingToAge)}
                    onClick={onAdvanceAge}
                    className={`flex items-center justify-between gap-2 rounded border px-2 py-1 text-left text-[11px] font-bold cursor-pointer ${
                      canAffordNextAge
                        ? 'border-[#e5c45e] bg-[#2a210f] text-[#fde68a] hover:bg-[#382c14]'
                        : 'border-white/10 bg-[#121620] text-[#64748b] cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <EraIcon age={nextAge} pantheon={hud.pantheon} size={18} locked={!canAffordNextAge} />
                      <span>Evoluir: {AGE_NAMES[nextAge]}</span>
                    </span>
                    <span className="font-mono-num text-[10px] shrink-0">{formatCost(nextAgeCost)}</span>
                  </button>
                )}

                {/* 4. SUB-TABS TO TIDY UP WHEN BOTH UNITS AND TECHS ARE PRESENT */}
                {buildingUnits.length > 0 && buildingTechs.length > 0 && (
                  <div className="flex items-center gap-1 border-b border-white/8 pb-0.5 text-[9px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setBuildingSubTab('all')}
                      className={`rounded px-1.5 py-0.5 cursor-pointer ${
                        buildingSubTab === 'all'
                          ? 'bg-[#d4af37] text-[#0b0e14] font-bold'
                          : 'bg-[#141a27] text-[#94a3b8] hover:text-[#f3d27a]'
                      }`}
                    >
                      Todos ({buildingUnits.length + buildingTechs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuildingSubTab('units')}
                      className={`rounded px-1.5 py-0.5 cursor-pointer ${
                        buildingSubTab === 'units'
                          ? 'bg-[#d4af37] text-[#0b0e14] font-bold'
                          : 'bg-[#141a27] text-[#94a3b8] hover:text-[#f3d27a]'
                      }`}
                    >
                      {isFortress
                        ? `Tropas de Cerco & Elite (${buildingUnits.length})`
                        : isTemple
                        ? `Míticas & Invocação (${buildingUnits.length})`
                        : `Treinar Unidades (${buildingUnits.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuildingSubTab('techs')}
                      className={`rounded px-1.5 py-0.5 cursor-pointer ${
                        buildingSubTab === 'techs'
                          ? 'bg-[#d4af37] text-[#0b0e14] font-bold'
                          : 'bg-[#141a27] text-[#94a3b8] hover:text-[#f3d27a]'
                      }`}
                    >
                      {isFortress
                        ? `Tecnologias do Bastião (${buildingTechs.length})`
                        : isTemple
                        ? `Pesquisas Sagradas (${buildingTechs.length})`
                        : `Pesquisas (${buildingTechs.length})`}
                    </button>
                  </div>
                )}

                {/* 5. UNITS GRID */}
                {showUnits && buildingUnits.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {buildingUnits.map((u) => {
                      const ageLocked = hud.age < u.minAge;
                      const minorGodLocked = Boolean(
                        u.requiresMinorGod && !u.requiresMinorGod.some((mg) => hud.chosenMinorGods.includes(mg))
                      );
                      const alreadyActive = Boolean(u.isMajorGod && hud.activeGodKinds?.includes(u.kind));
                      const alreadyQueued = Boolean(u.isMajorGod && hud.queuedGodKinds?.includes(u.kind));
                      const locked = ageLocked || minorGodLocked || alreadyActive || alreadyQueued;
                      return (
                        <button
                          key={u.kind}
                          type="button"
                          disabled={locked}
                          onClick={() => onTrainUnit(u.kind)}
                          title={`${u.name} — ${u.role}${formatCost(u.cost) ? ` (${formatCost(u.cost)})` : ''}`}
                          className={`flex items-center gap-1.5 rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                            alreadyActive
                              ? 'border-[#facc15]/50 bg-[#231d0c] text-[#fde68a] cursor-default'
                              : locked
                              ? 'border-white/8 bg-[#10141e] text-[#64748b] opacity-65 cursor-not-allowed'
                              : u.isMajorGod
                              ? 'border-[#facc15]/60 bg-[#241c0b] text-[#fef08a] hover:border-[#fde047]'
                              : u.isGod
                              ? 'border-[#c084fc]/50 bg-[#1d152b] text-[#f3e8ff] hover:border-[#c084fc]'
                              : u.isMythic
                              ? 'border-[#38bdf8]/40 bg-[#10202e] text-[#f3efe6] hover:border-[#38bdf8]'
                              : u.isHero
                              ? 'border-[#f59e0b]/40 bg-[#221910] text-[#fde68a] hover:border-[#f59e0b]'
                              : 'border-[#c8a962]/28 bg-[#131926] text-[#f3efe6] hover:border-[#f3d27a] hover:bg-[#1c2438]'
                          }`}
                        >
                          <UnitIcon kind={u.kind} pantheon={hud.pantheon} size={22} />
                          <div className="min-w-0 flex-1">
                            <span className="block text-[10px] font-semibold leading-tight truncate">{u.name}</span>
                            <span className="block font-mono-num text-[9px] text-[#94a3b8] leading-tight truncate">
                              {ageLocked
                                ? AGE_NAMES[u.minAge]
                                : minorGodLocked
                                ? `Req: ${u.requiresMinorGodLabel ?? 'Deus'}`
                                : alreadyActive
                                ? 'Em Campo'
                                : alreadyQueued
                                ? 'Invocando...'
                                : formatCost(u.cost)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 6. TECHNOLOGIES GRID */}
                {showTechs && buildingTechs.length > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {buildingTechs.map((t) => {
                      const researched = hud.researchedTechs.includes(t.id);
                      const activeNow = hud.activeTechResearch?.id === t.id;
                      const missingPrereq = t.requires && !hud.researchedTechs.includes(t.requires);
                      const ageLocked = hud.age < t.minAge;
                      const effectiveCost = getEffectiveTechCost(t, hud.researchedTechs);
                      const disabled =
                        researched || activeNow || Boolean(hud.activeTechResearch) || Boolean(missingPrereq) || ageLocked;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => onResearchTech(t.id)}
                          title={`${t.name}${t.requiresMinorGodLabel ? ` (${t.requiresMinorGodLabel})` : ''} — ${t.description}`}
                          className={`flex items-center justify-between gap-1.5 rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                            researched
                              ? 'border-emerald-500/35 bg-[#10241c] text-emerald-200 cursor-default'
                              : activeNow
                              ? 'border-[#facc15] bg-[#262010] text-[#fde68a]'
                              : disabled
                              ? 'border-white/8 bg-[#10141e] text-[#64748b] cursor-not-allowed'
                              : t.category === 'mythic' || isTemple
                              ? 'border-[#a855f7]/45 bg-[#1c1528] text-[#f3e8ff] hover:border-[#c084fc] hover:bg-[#261c36]'
                              : 'border-[#c8a962]/30 bg-[#171d2c] text-[#f3efe6] hover:border-[#d4af37] hover:bg-[#20293d]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <TechIcon techId={t.id} size={22} className="shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold leading-tight truncate">{t.name}</div>
                              <div className="font-mono-num text-[9px] text-[#94a3b8] leading-tight truncate">
                                {researched
                                  ? 'Concluída'
                                  : ageLocked
                                  ? AGE_NAMES[t.minAge]
                                  : missingPrereq
                                  ? `Req: ${TECH_SPECS[t.requires!].name}`
                                  : formatCost(effectiveCost)}
                              </div>
                            </div>
                          </div>
                          {researched ? (
                            <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          ) : ageLocked || missingPrereq ? (
                            <Lock className="h-3 w-3 text-[#64748b] shrink-0" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 7. MARKET DIRECT TRIBUTE EXCHANGES */}
                {showMarket && (
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('food', 'gold', 100)}
                      className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <ResourceIcon kind="food" size={14} />
                        <span>100 →</span>
                        <ResourceIcon kind="gold" size={14} />
                      </span>
                      <span className="text-[#fde68a]">Ouro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('wood', 'gold', 100)}
                      className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <ResourceIcon kind="wood" size={14} />
                        <span>100 →</span>
                        <ResourceIcon kind="gold" size={14} />
                      </span>
                      <span className="text-[#fde68a]">Ouro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('gold', 'food', 100)}
                      className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <ResourceIcon kind="gold" size={14} />
                        <span>100 →</span>
                        <ResourceIcon kind="food" size={14} />
                      </span>
                      <span className="text-[#fca5a5]">Alim</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('gold', 'wood', 100)}
                      className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <ResourceIcon kind="gold" size={14} />
                        <span>100 →</span>
                        <ResourceIcon kind="wood" size={14} />
                      </span>
                      <span className="text-[#86efac]">Mad</span>
                    </button>
                  </div>
                )}

                {/* 8. SKY PASSAGE TELEPORT */}
                {showSkyPassage && hud.selection.buildingId && onTeleportSkyPassage && (
                  <button
                    type="button"
                    disabled={(hud.skyPassageCount ?? 0) < 2}
                    onClick={() => onTeleportSkyPassage(hud.selection.buildingId!)}
                    title={
                      (hud.skyPassageCount ?? 0) < 2
                        ? 'Construa ao menos 2 Passagens Celestes para teleportar tropas'
                        : 'Teletransportar tropas aliadas próximas para outra Passagem Celeste'
                    }
                    className={`flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${
                      (hud.skyPassageCount ?? 0) >= 2
                        ? 'border-[#22d3ee]/70 bg-[#0d2838] text-[#bae6fd] hover:border-[#67e8f9] hover:bg-[#12384e]'
                        : 'border-white/10 bg-[#121620] text-[#64748b] cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <BuildingIcon kind="sky_passage" pantheon={hud.pantheon} size={20} />
                      <span>Teletransportar Tropas</span>
                    </span>
                    <span className="font-mono-num text-[9px]">
                      {(hud.skyPassageCount ?? 0) >= 2 ? 'Ativo' : 'Requer 2 Portais'}
                    </span>
                  </button>
                )}

                {/* 9. WALL TO GATE CONVERSION */}
                {hud.selection.buildingKind === 'wall' && hud.selection.isConstructed && onConvertWallToGate && (
                  <button
                    type="button"
                    onClick={onConvertWallToGate}
                    className="flex items-center justify-between gap-2 rounded border border-[#d4af37]/60 bg-[#241e0d] px-2.5 py-1.5 text-[10px] font-bold text-[#fde68a] hover:bg-[#352b12] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <DoorOpen className="h-3.5 w-3.5 text-[#facc15]" />
                      <span>Converter em Portão</span>
                    </span>
                    <span className="font-mono-num text-[9px] text-[#cbd5e1]">15M · 10O</span>
                  </button>
                )}

                {/* 10. NON-FORTRESS GARRISON BAR */}
                {!isFortress && hud.selection.canGarrison && hud.selection.buildingId && (
                  <div className="flex flex-col gap-1 rounded border border-[#60a5fa]/35 bg-[#0f1d32] p-1.5">
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="flex items-center gap-1.5 font-semibold text-[#93c5fd]">
                        <Shield className="h-3.5 w-3.5 text-[#60a5fa]" />
                        <span>Guarnição</span>
                      </span>
                      <span className="font-mono-num text-[10px] font-bold text-[#fde047]">
                        {hud.selection.garrisonedCount ?? 0} / {hud.selection.garrisonMaxCapacity ?? 10}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {onGarrisonSelected && (
                        <button
                          type="button"
                          onClick={() => onGarrisonSelected(hud.selection.buildingId!)}
                          className="flex flex-1 items-center justify-center gap-1 rounded border border-[#60a5fa]/60 bg-[#132948] px-2 py-0.5 text-[9.5px] font-bold text-[#dbeafe] hover:bg-[#1a3760] cursor-pointer"
                        >
                          <Shield className="h-3 w-3 text-[#60a5fa]" />
                          <span>Guarnecer</span>
                        </button>
                      )}
                      {hud.selection.canUngarrison && onUngarrisonBuilding && (
                        <button
                          type="button"
                          onClick={() => onUngarrisonBuilding(hud.selection.buildingId!)}
                          className="flex flex-1 items-center justify-center gap-1 rounded border border-[#f59e0b]/70 bg-[#2d1b06] px-2 py-0.5 text-[9.5px] font-bold text-[#fef3c7] hover:bg-[#452709] cursor-pointer"
                        >
                          <LogOut className="h-3 w-3 text-[#fbbf24]" />
                          <span>Liberar ({hud.selection.garrisonedCount})</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 11. MONUMENT EMPOWER STATUS */}
                {selectedPlayerBuildingKind === 'monument' && (
                  <div className="flex flex-col gap-1 rounded border border-[#facc15]/35 bg-[#1b170d] p-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                      <span className={`font-semibold ${hud.selection.isEmpowered ? 'text-[#fde047]' : 'text-[#94a3b8]'}`}>
                        {hud.selection.isEmpowered ? hud.selection.empoweredByLabel : 'Aguardando Energização'}
                      </span>
                      {hud.selection.isisProtected && (
                        <span className="rounded border border-emerald-400/50 bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                          Ísis: Escudo Divino
                        </span>
                      )}
                    </div>
                    {hud.selection.canEmpowerMonument && onOrderEmpowerMonument && (
                      <button
                        type="button"
                        onClick={() => onOrderEmpowerMonument(hud.selection.buildingId)}
                        className="flex items-center justify-center gap-1.5 rounded border border-[#facc15]/65 bg-[#2d230c] px-2 py-1 text-[10px] font-bold text-[#fef08a] hover:bg-[#3e3010] cursor-pointer"
                      >
                        <Sun className="h-3.5 w-3.5 text-[#facc15]" />
                        <span>Energizar Monumento (Faraó / Sacerdote)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* EMPTY BUILDING FALLBACK */}
                {buildingUnits.length === 0 &&
                  buildingTechs.length === 0 &&
                  !showMarket &&
                  !showAgeUp &&
                  !showSkyPassage &&
                  selectedPlayerBuildingKind !== 'monument' &&
                  selectedPlayerBuildingKind !== 'wall' && (
                    <div className="flex items-center gap-2 rounded border border-[#c8a962]/20 bg-[#121824] px-2.5 py-2 text-[11px] text-[#cbd5e1]">
                      <BuildingIcon kind={selectedPlayerBuildingKind} pantheon={hud.pantheon} size={24} />
                      <span className="leading-snug">
                        {selectedPlayerBuildingKind === 'house'
                          ? hud.pantheon === 'atlantean'
                            ? 'Mansão Atlante: +10 de Limite Populacional com alta resistência.'
                            : hud.pantheon === 'norse'
                            ? 'Casa Nórdica: +8 de Limite Populacional.'
                            : 'Habitação civil: +6 de Limite Populacional.'
                          : selectedPlayerBuildingKind === 'farm'
                          ? 'Fonte infinita de Alimento para Aldeões.'
                          : selectedPlayerBuildingKind === 'granary'
                          ? 'Ponto de entrega de Alimento e melhorias de caça/fazenda.'
                          : selectedPlayerBuildingKind === 'storehouse'
                          ? 'Ponto de entrega de Madeira e Ouro.'
                          : selectedPlayerBuildingKind === 'lumber_camp'
                          ? 'Campo Madeireiro egípcio: entrega de Madeira.'
                          : selectedPlayerBuildingKind === 'mining_camp'
                          ? 'Campo de Mineração egípcio: entrega de Ouro.'
                          : selectedPlayerBuildingKind === 'obelisk'
                          ? 'Obelisco Vigia: revela ampla área do mapa ao redor.'
                          : selectedPlayerBuildingKind === 'lighthouse'
                          ? 'Farol do Nilo: ilumina vasta extensão do mapa contra névoa de guerra.'
                          : selectedPlayerBuildingKind === 'wonder'
                          ? 'Maravilha Divina: ativa a Era das Maravilhas (+Favor, +20% Míticas).'
                          : 'Estrutura defensiva e de apoio territorial.'}
                      </span>
                    </div>
                  )}
              </div>
            );
          })()
        )
      ) : hud.selection.primaryType === 'unit' && hud.selection.team === 'player' ? (
        /* ========================================================================= */
        /* CASE C: MILITARY / HERO / MYTHIC / NAVAL / GOD UNIT SELECTED              */
        /* ========================================================================= */
        <div className="flex flex-1 flex-col justify-between gap-1.5">
          {hud.selectedMythAbility && (
            <div className="flex items-center justify-between gap-2 rounded border border-[#d4af37]/55 bg-[#1e180a] px-2 py-1.5">
              <button
                type="button"
                disabled={hud.selectedMythAbility.cooldownRemaining > 0}
                onClick={() => onTriggerMythSpecial?.()}
                title={`${hud.selectedMythAbility.name} (Tecla Q) — ${hud.selectedMythAbility.description}`}
                className="relative flex flex-1 items-center gap-2 text-left cursor-pointer disabled:opacity-65"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-[#facc15]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#fde68a]">
                    <span className="truncate">{hud.selectedMythAbility.name} [Q]</span>
                    <span className="font-mono-num text-[9px] text-[#cbd5e1]">
                      {hud.selectedMythAbility.cooldownRemaining > 0
                        ? `${hud.selectedMythAbility.cooldownRemaining}s`
                        : 'Pronta'}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-black/50">
                    <div
                      className="h-full bg-[#facc15] transition-all duration-150"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            (1 -
                              hud.selectedMythAbility.cooldownRemaining /
                                Math.max(1, hud.selectedMythAbility.cooldownTotal)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
              {onToggleMythAutoCast && (
                <button
                  type="button"
                  onClick={onToggleMythAutoCast}
                  title="Alternar Disparo Automático em Combate"
                  className={`rounded border px-1.5 py-0.5 text-[9px] font-bold cursor-pointer ${
                    hud.selectedMythAbility.autoCast
                      ? 'border-[#facc15] bg-[#d4af37] text-[#0b0e14]'
                      : 'border-white/15 bg-white/5 text-[#94a3b8]'
                  }`}
                >
                  AUTO
                </button>
              )}
            </div>
          )}

          {onSetUnitStance && (
            <div className="flex items-center gap-1" role="group" aria-label="Postura de Combate">
              {(
                [
                  { id: 'aggressive', label: 'Agressivo', title: 'Persegue e ataca inimigos próximos' },
                  { id: 'defensive', label: 'Defensivo', title: 'Defende área local e retorna à posição' },
                  { id: 'stand_ground', label: 'Manter', title: 'Mantém posição fixa sem perseguir' },
                ] as { id: CombatStance; label: string; title: string }[]
              ).map((st) => {
                const active = (hud.selection.stance ?? 'aggressive') === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onSetUnitStance(st.id)}
                    title={st.title}
                    className={`flex-1 rounded border py-1 text-[9px] font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'border-[#f3d27a] bg-[#2a220e] text-[#fde68a]'
                        : 'border-[#c8a962]/25 bg-[#131926] text-[#cbd5e1] hover:border-[#f3d27a]'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
              {onToggleAutoScout && !hud.selection.isNaval && (
                <button
                  type="button"
                  onClick={onToggleAutoScout}
                  title="Auto-Explorar (Tecla Z)"
                  className={`rounded border px-1.5 py-1 text-[9px] font-semibold cursor-pointer ${
                    hud.selection.autoScout
                      ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                      : 'border-[#c8a962]/25 bg-[#131926] text-[#38bdf8] hover:border-[#38bdf8]'
                  }`}
                >
                  <Compass className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {hud.selection.isTransport && hud.selection.entityId && (
            <div className="flex flex-col gap-1 rounded border border-[#38bdf8]/45 bg-[#0e2030] p-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 font-semibold text-[#7dd3fc]">
                  <Anchor className="h-3 w-3" />
                  <span>Transporte Naval</span>
                </span>
                <span className="font-mono-num font-bold text-[#fde68a]">
                  {hud.selection.cargoCount ?? 0}/{hud.selection.cargoMax ?? 8} tropas
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {onEmbarkTransport && (
                  <button
                    type="button"
                    onClick={() => onEmbarkTransport(hud.selection.entityId)}
                    className="rounded border border-[#38bdf8]/55 bg-[#133046] px-1.5 py-1 text-[9px] font-bold text-[#bae6fd] hover:bg-[#1a415e] cursor-pointer"
                  >
                    Embarcar Tropas
                  </button>
                )}
                {onDisembarkTransport && (
                  <button
                    type="button"
                    disabled={(hud.selection.cargoCount ?? 0) === 0}
                    onClick={() => onDisembarkTransport(hud.selection.entityId!)}
                    className="rounded border border-[#f59e0b]/60 bg-[#2d1e0a] px-1.5 py-1 text-[9px] font-bold text-[#fde68a] hover:bg-[#3f2a0e] disabled:opacity-45 cursor-pointer"
                  >
                    Desembarcar Margem
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="mb-1 text-[10px] text-[#94a3b8]">Formação do Esquadrão</div>
            <div className="grid grid-cols-5 gap-1" role="group" aria-label="Formação das tropas">
              {(['box', 'line', 'staggered', 'phalanx', 'wedge'] as FormationId[]).map((fid) => {
                const active = hud.formation === fid;
                const spec = FORMATIONS[fid];
                const Icon =
                  fid === 'box'
                    ? LayoutGrid
                    : fid === 'line'
                    ? StretchHorizontal
                    : fid === 'staggered'
                    ? GripHorizontal
                    : fid === 'phalanx'
                    ? Shield
                    : Swords;
                return (
                  <button
                    key={fid}
                    type="button"
                    onClick={() => onSetFormation(fid)}
                    title={`${spec.name} (Tecla F) — ${spec.description}`}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded border px-1 py-1.5 text-[9px] font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'border-[#d4af37] bg-[#d4af37] text-[#0b0e14]'
                        : 'border-[#c8a962]/25 bg-[#131926] text-[#cbd5e1] hover:border-[#f3d27a] hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-full text-[8.5px]">{spec.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {hud.selection.canPromoteToHero && onPromoteToHero && (
            <button
              type="button"
              onClick={onPromoteToHero}
              title="Promover soldados Atlantes selecionados a Herói (★ bônus vs unidades míticas)"
              className="flex items-center justify-between gap-2 rounded border border-[#facc15]/70 bg-gradient-to-r from-[#2c210b] to-[#1e1708] px-2.5 py-1.5 text-[11px] font-bold text-[#fef08a] shadow hover:border-[#fde047] hover:from-[#3b2c0e] hover:to-[#281e0a] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Crown className="h-3.5 w-3.5 text-[#facc15] shrink-0" />
                <span>
                  Promover a Herói ★
                  {(hud.selection.heroPromoteCount ?? 0) > 1 ? ` (×${hud.selection.heroPromoteCount})` : ''}
                </span>
              </span>
              {hud.selection.heroPromoteIsFree ? (
                <span className="font-mono-num text-[9px] font-bold text-emerald-300 shrink-0">
                  GRÁTIS (Hipérion)
                </span>
              ) : hud.selection.heroPromoteCost ? (
                <span className="font-mono-num text-[9px] text-[#fde68a] shrink-0">
                  {formatCost(hud.selection.heroPromoteCost)}
                </span>
              ) : null}
            </button>
          )}

          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={onStopUnits}
              title="Parar unidades selecionadas"
              className="flex items-center justify-center gap-1 rounded border border-rose-400/40 bg-rose-950/40 px-2 py-1.5 text-[11px] font-semibold text-rose-200 hover:border-rose-400 hover:bg-rose-950/70 cursor-pointer"
            >
              <Square className="h-3 w-3 shrink-0" />
              <span>Parar</span>
            </button>
            <button
              type="button"
              onClick={onSelectCombat}
              title="Selecionar todo o Exército"
              className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1.5 text-[11px] font-semibold text-[#cbd5e1] hover:border-[#f3d27a] hover:text-white cursor-pointer"
            >
              <ResourceIcon kind="army" size={16} />
              <span>Exército</span>
            </button>
            <button
              type="button"
              onClick={onFocusTownCenter}
              title="Ir para o Centro da Cidade"
              className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1.5 text-[11px] font-semibold text-[#cbd5e1] hover:border-[#f3d27a] hover:text-white cursor-pointer"
            >
              <BuildingIcon kind="town_center" pantheon={hud.pantheon} size={16} />
              <span>Centro</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE D: EMPTY / RESOURCE / FAUNA / SETTLEMENT / ENEMY SELECTION           */
        /* ========================================================================= */
        <div className="flex flex-1 flex-col justify-between gap-2">
          <p className="text-[11px] leading-snug text-[#94a3b8]">
            {hud.selection.primaryType === 'settlement'
              ? 'Assentamento neutro: envie Aldeões para fundar um novo Centro da Cidade.'
              : hud.selection.nonHarvestableFauna
              ? 'Fauna marinha decorativa: compõe a vida oceânica do mapa e não fornece recursos.'
              : hud.selection.canCommandFauna
              ? 'Animal sob seu comando: clique com o botão direito para mover, pastorear ou atacar.'
              : hud.selection.primaryType === 'resource' || hud.selection.primaryType === 'fauna'
              ? hud.selection.isInfiniteResource
                ? 'Cardume infinito: selecione Barcos de Pesca ou Aldeões para coleta contínua de alimento.'
                : 'Selecione Aldeões ou clique abaixo para enviar trabalhadores automaticamente.'
              : 'Selecione um Aldeão para construir, uma Estrutura para treinar/pesquisar ou Tropas para comandar.'}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {(hud.selection.primaryType === 'fauna' || hud.selection.primaryType === 'resource') &&
              !hud.selection.nonHarvestableFauna &&
              onOrderVillagersToTarget && (
                <button
                  type="button"
                  onClick={onOrderVillagersToTarget}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded bg-[#d4af37] px-2.5 py-1.5 text-[11px] font-bold text-[#0b0e14] hover:bg-[#e5c45e] cursor-pointer"
                >
                  <Hammer className="h-3.5 w-3.5" />
                  <span>
                    {hud.selection.primaryType === 'fauna'
                      ? hud.selection.isCarcass
                        ? 'Colher Carne'
                        : hud.selection.faunaCategory === 'herdable' && hud.selection.faunaOwnerTeam === 'player'
                        ? 'Abater p/ Carne'
                        : 'Caçar Animal'
                      : 'Colher Recurso'}
                  </span>
                </button>
              )}
            {hud.selection.canConvertFauna && onConvertFauna && (
              <button
                type="button"
                onClick={onConvertFauna}
                className="flex flex-1 items-center justify-center gap-1.5 rounded border border-amber-400/60 bg-[#2a1c0b] px-2.5 py-1.5 text-[11px] font-bold text-amber-200 hover:bg-[#3c270e] cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Converter (Set)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onFocusTownCenter}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#c8a962]/30 bg-[#131926] px-2.5 py-1.5 text-[11px] font-semibold text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer"
            >
              <BuildingIcon kind="town_center" pantheon={hud.pantheon} size={16} />
              <span>Centro</span>
            </button>
            <button
              type="button"
              onClick={onSelectCombat}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#c8a962]/30 bg-[#131926] px-2.5 py-1.5 text-[11px] font-semibold text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer"
            >
              <ResourceIcon kind="army" size={16} />
              <span>Exército</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
