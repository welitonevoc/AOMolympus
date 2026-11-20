import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Castle,
  Check,
  Crown,
  DoorOpen,
  Hammer,
  LogOut,
  Repeat,
  Shield,
  Sparkles,
  Sun,
  Swords,
  Users,
  X,
} from 'lucide-react';
import {
  AGE_NAMES,
  AgeLevel,
  BuildingKind,
  CombatStance,
  FormationId,
  FORMATIONS,
  FormationSpec,
  GameHudSnapshot,
  GodPowerId,
  ResourceType,
  TechId,
  UnitKind,
} from '../../game/types';
import {
  getCivBuildingSpec,
  getCivGodPowerSpec,
  getCivUnitSpec,
  getEffectiveTechCost,
  TECH_SPECS,
} from '../../game/divineData';
import { BuildingIcon } from '../BuildingIcon';
import { EraIcon } from '../EraIcon';
import { ResourceIcon } from '../ResourceIcon';
import { TechIcon } from '../TechIcon';
import { UnitIcon } from '../UnitIcon';
import {
  getBuildingCategory,
  getBuildingCommandProfile,
  getBuildingExclusiveTechs,
  getBuildingExclusiveUnits,
  getVillagerCultureDetails,
  VillagerBuildCategory,
} from './commandCenterUtils';
import { formatCost } from './hudTypes';

type BuildingStats = ReturnType<typeof getCivBuildingSpec>;
type UnitStats = ReturnType<typeof getCivUnitSpec>;
type TechSpec = (typeof TECH_SPECS)[keyof typeof TECH_SPECS];

interface MobileCommandSheetProps {
  open: boolean;
  onClose: () => void;
  hud: GameHudSnapshot;
  buildingList: BuildingStats[];
  unitList: UnitStats[];
  powerList: ReturnType<typeof getCivGodPowerSpec>[];
  techList: TechSpec[];
  nextAge: AgeLevel | null;
  nextAgeCost: { food?: number; wood?: number; gold?: number; favor?: number } | null;
  canAffordNextAge: boolean;
  isAdvancingAge: boolean;
  ageAdvancePct: number;
  onStartBuild: (kind: BuildingKind) => void;
  onTrainUnit: (kind: UnitKind) => void;
  onActivateGodPower: (id: GodPowerId) => void;
  onResearchTech: (id: TechId) => void;
  onAdvanceAge: () => void;
  onToggleRepeatTraining?: (buildingId: string) => void;
  onOrderVillagerTask?: (task: 'wood' | 'food' | 'gold' | 'hunt' | 'build') => void;
  onOrderPrayTemple?: (templeId?: string) => void;
  onPromoteToHero?: () => void;
  onOrderVillagersToTarget?: () => void;
  onSummonSetAnimal?: (kind: 'baboon' | 'hyena' | 'crocodile' | 'hippo') => void;
  onOrderEmpowerMonument?: (buildingId?: string) => void;
  onTeleportSkyPassage?: (buildingId: string) => void;
  onGarrisonSelected?: (buildingId: string) => void;
  onUngarrisonBuilding?: (buildingId: string) => void;
  onConvertWallToGate?: () => void;
  onExchangeTribute?: (from: ResourceType, to: ResourceType, amount: number) => void;
  onTriggerMythSpecial?: () => void;
  onToggleMythAutoCast?: () => void;
  onSetUnitStance?: (stance: CombatStance) => void;
  onToggleAutoScout?: () => void;
  onSetFormation?: (formation: FormationId) => void;
  onConvertFauna?: () => void;
}

function canAffordCost(
  res: GameHudSnapshot['resources'],
  cost?: { food?: number; wood?: number; gold?: number; favor?: number } | null
): boolean {
  if (!cost) return false;
  return (
    (res?.food ?? 0) >= (cost.food ?? 0) &&
    (res?.wood ?? 0) >= (cost.wood ?? 0) &&
    (res?.gold ?? 0) >= (cost.gold ?? 0) &&
    (res?.favor ?? 0) >= (cost.favor ?? 0)
  );
}

/**
 * Mobile-first contextual Command Center Bottom Sheet (< md).
 * Strictly tailored to the selected villager/builder, building, or military unit.
 */
export const MobileCommandSheet: React.FC<MobileCommandSheetProps> = ({
  open,
  onClose,
  hud,
  buildingList,
  unitList,
  powerList,
  techList,
  nextAge,
  nextAgeCost,
  canAffordNextAge,
  isAdvancingAge,
  ageAdvancePct,
  onStartBuild,
  onTrainUnit,
  onActivateGodPower,
  onResearchTech,
  onAdvanceAge,
  onToggleRepeatTraining,
  onOrderVillagerTask,
  onOrderPrayTemple,
  onPromoteToHero,
  onOrderVillagersToTarget,
  onSummonSetAnimal,
  onOrderEmpowerMonument,
  onTeleportSkyPassage,
  onGarrisonSelected,
  onUngarrisonBuilding,
  onConvertWallToGate,
  onExchangeTribute,
  onTriggerMythSpecial,
  onToggleMythAutoCast,
  onSetUnitStance,
  onSetFormation,
}) => {
  const selectedBuildingKind =
    hud.selection.primaryType === 'building' && hud.selection.team === 'player'
      ? hud.selection.buildingKind
      : undefined;

  const isVillagerSelected = hud.selection.hasVillagerSelected;
  const isMilitaryUnit =
    hud.selection.primaryType === 'unit' &&
    hud.selection.team === 'player' &&
    !isVillagerSelected;

  const villagerCulture = getVillagerCultureDetails(
    hud.pantheon,
    hud.selection.unitKind,
    hud.selection.isHero
  );

  const [villagerTab, setVillagerTab] = useState<VillagerBuildCategory>(villagerCulture.defaultTab);
  const [buildingSubTab, setBuildingSubTab] = useState<'all' | 'units' | 'techs'>('all');
  const [genericTab, setGenericTab] = useState<'build' | 'powers' | 'tech'>('build');

  // Sync default villager build tab when switching worker/builder types
  useEffect(() => {
    if (isVillagerSelected) {
      setVillagerTab(villagerCulture.defaultTab);
    }
  }, [
    isVillagerSelected,
    hud.selection.entityId,
    hud.selection.unitKind,
    hud.selection.isHero,
    villagerCulture.defaultTab,
  ]);

  // Reset building sub-tab whenever the player switches buildings
  useEffect(() => {
    setBuildingSubTab('all');
  }, [selectedBuildingKind, hud.selection.entityId]);

  if (!open || hud.phase !== 'playing') return null;

  const buildingProfile = selectedBuildingKind
    ? getBuildingCommandProfile(selectedBuildingKind, hud.pantheon, hud.majorGodName, hud.age)
    : null;

  const buildingUnits = selectedBuildingKind
    ? getBuildingExclusiveUnits(
        selectedBuildingKind,
        hud.pantheon,
        hud.majorGodName,
        unitList,
        hud.chosenMinorGods
      )
    : [];

  const buildingTechs = selectedBuildingKind
    ? getBuildingExclusiveTechs(
        selectedBuildingKind,
        hud.pantheon,
        hud.majorGodName,
        techList,
        hud.chosenMinorGods
      )
    : [];

  const isFortress =
    selectedBuildingKind === 'fortress' || selectedBuildingKind === 'asgard_hill_fort';
  const isTemple = selectedBuildingKind === 'temple';
  const fortressCap = hud.selection.garrisonMaxCapacity ?? 20;

  const sheetTitle = isVillagerSelected
    ? villagerCulture.title
    : buildingProfile
    ? buildingProfile.title
    : isMilitaryUnit
    ? `${hud.selection.kindLabel || 'Tropa Militar'} · Comandos`
    : 'Central de Comandos';

  const sheetSubtitle = isVillagerSelected
    ? villagerCulture.subtitle
    : buildingProfile
    ? buildingProfile.subtitle
    : isMilitaryUnit
    ? 'Posturas táticas, formações e habilidades'
    : `${AGE_NAMES[hud.age]} · ${hud.majorGodName}`;

  const ecoCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'eco').length;
  const milCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'military').length;
  const defCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'defense').length;
  const divCount = buildingList.filter((b) => getBuildingCategory(b.kind) === 'divine').length;

  const villagerTabs = (
    [
      { id: 'eco' as const, label: 'Eco', count: ecoCount },
      { id: 'military' as const, label: 'Militar', count: milCount },
      { id: 'defense' as const, label: 'Defesa', count: defCount },
      { id: 'divine' as const, label: 'Sagrado', count: divCount },
      { id: 'all' as const, label: 'Todas', count: buildingList.length },
    ] as const
  ).filter((t) => t.id === 'all' || t.count > 0);

  const filteredBuildings = buildingList.filter((b) => {
    if (villagerTab === 'all') return true;
    return getBuildingCategory(b.kind) === villagerTab;
  });

  const formationList = Object.values(FORMATIONS) as FormationSpec[];

  return (
    <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar gaveta de comandos"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
      />

      {/* Bottom Sheet Panel */}
      <div className="relative z-10 flex max-h-[82vh] flex-col rounded-t-3xl border-t-2 border-[#c8a962]/75 bg-[#0d121e]/98 shadow-[0_-12px_40px_rgba(0,0,0,0.85)]">
        {/* Drag Handle & Header */}
        <div className="flex flex-col items-center px-4 pt-2 pb-2 border-b border-white/10">
          <div className="h-1.5 w-10 rounded-full bg-slate-500/70 mb-1.5" />
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isVillagerSelected ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#facc15]/50 bg-[#29200b] shrink-0">
                  <Hammer className="h-4 w-4 text-[#facc15]" />
                </div>
              ) : selectedBuildingKind ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c8a962]/40 bg-[#162030] shrink-0">
                  <BuildingIcon kind={selectedBuildingKind} pantheon={hud.pantheon} size={22} />
                </div>
              ) : isMilitaryUnit ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-400/50 bg-[#2d1219] shrink-0">
                  <Swords className="h-4 w-4 text-rose-300" />
                </div>
              ) : null}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold tracking-wide text-[#f7e9c3] truncate">
                    {sheetTitle}
                  </h2>
                  {isVillagerSelected && (
                    <span className="shrink-0 font-mono-num text-[9px] font-semibold text-[#fde68a] border-l border-[#c8a962]/30 pl-1.5">
                      {villagerCulture.badge}
                    </span>
                  )}
                  {buildingProfile?.eraTag && (
                    <span className="shrink-0 font-mono-num text-[9px] font-bold text-[#fbbf24] border-l border-[#c8a962]/30 pl-1.5">
                      {buildingProfile.eraTag}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{sheetSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {selectedBuildingKind && hud.selection.buildingId && onToggleRepeatTraining && (
                <button
                  type="button"
                  onClick={() => onToggleRepeatTraining(hud.selection.buildingId!)}
                  title="Repetir treinamento"
                  className={`flex min-h-[38px] items-center gap-1 rounded-lg border px-2 text-[10px] font-semibold cursor-pointer ${
                    hud.selection.repeatTraining
                      ? 'border-emerald-400/60 bg-emerald-950/70 text-emerald-300'
                      : 'border-white/15 bg-[#141a27] text-slate-300'
                  }`}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  <span>Repetir</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-white/15 bg-[#151c2c] text-slate-200 active:bg-[#222d44] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Age Up Quick Banner if Town Center */}
          {selectedBuildingKind === 'town_center' && nextAge && nextAgeCost && (
            <div className="mt-2 flex w-full items-center justify-between gap-2 rounded-xl border border-[#d4af37]/60 bg-gradient-to-r from-[#211a0c] via-[#141d2d] to-[#121824] p-2">
              <div className="flex items-center gap-2 min-w-0">
                <EraIcon age={nextAge} pantheon={hud.pantheon} size={24} />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#fef08a] truncate">
                    Avançar para {AGE_NAMES[nextAge]}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-300">
                    {formatCost(nextAgeCost)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onAdvanceAge}
                disabled={!canAffordNextAge || isAdvancingAge}
                className={`shrink-0 min-h-[38px] rounded-lg border px-3 text-xs font-bold cursor-pointer ${
                  isAdvancingAge
                    ? 'border-amber-400/40 bg-amber-950/60 text-amber-200'
                    : canAffordNextAge
                      ? 'border-[#facc15] bg-[#d4af37] text-[#0b0e14] active:bg-[#e5c45e]'
                      : 'border-white/10 bg-[#161c2b] text-slate-500'
                }`}
              >
                {isAdvancingAge ? `Avançando (${Math.round(ageAdvancePct)}%)` : 'Avançar Era'}
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CASE A: VILLAGER / BUILDER SELECTED -> CUSTOMIZED PER TYPE                */}
        {/* ========================================================================= */}
        {isVillagerSelected && (
          <div className="flex flex-col border-b border-white/10 bg-[#0a0f19]">
            {villagerCulture.isCombatBuilder ? (
              <div className="flex items-center gap-1.5 p-2 pb-1.5 border-b border-white/5">
                {onOrderVillagerTask && (
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('build')}
                    className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#d4af37]/50 bg-[#1d2230] px-3 text-[11px] font-semibold text-[#fde68a] cursor-pointer"
                  >
                    <Hammer className="h-3.5 w-3.5 text-[#facc15]" />
                    <span>Obra</span>
                  </button>
                )}
                {onSetUnitStance && (
                  <div className="grid flex-1 grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'aggressive' as CombatStance, label: 'Agressivo' },
                        { id: 'defensive' as CombatStance, label: 'Defensivo' },
                        { id: 'stand_ground' as CombatStance, label: 'Manter' },
                      ] as const
                    ).map((st) => {
                      const active = (hud.selection.stance ?? 'aggressive') === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => onSetUnitStance(st.id)}
                          className={`min-h-[40px] rounded-lg border text-[10px] font-semibold cursor-pointer ${
                            active
                              ? 'border-[#f3d27a] bg-[#2a220e] text-[#fde68a]'
                              : 'border-white/10 bg-[#121927] text-slate-300'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              onOrderVillagerTask && (
                <div className="grid grid-cols-4 gap-1 p-2 pb-1.5 border-b border-white/5">
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('wood')}
                    className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#c8a962]/20 bg-[#121927] text-[10px] font-semibold text-slate-200 active:bg-[#1a2538] cursor-pointer"
                  >
                    <ResourceIcon kind="wood" size={14} />
                    <span>Madeira</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('gold')}
                    className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#c8a962]/20 bg-[#121927] text-[10px] font-semibold text-slate-200 active:bg-[#1a2538] cursor-pointer"
                  >
                    <ResourceIcon kind="gold" size={14} />
                    <span>Ouro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('food')}
                    className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#c8a962]/20 bg-[#121927] text-[10px] font-semibold text-slate-200 active:bg-[#1a2538] cursor-pointer"
                  >
                    <ResourceIcon kind="food" size={14} />
                    <span>Comida</span>
                  </button>
                  {hud.selection.canPrayAtTemple && onOrderPrayTemple ? (
                    <button
                      type="button"
                      onClick={() => onOrderPrayTemple()}
                      className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-sky-400/40 bg-[#0f2438] text-[10px] font-semibold text-sky-200 active:bg-[#153450] cursor-pointer"
                    >
                      <Sun className="h-3.5 w-3.5 text-sky-300" />
                      <span>Orar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOrderVillagerTask('hunt')}
                      className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#c8a962]/20 bg-[#121927] text-[10px] font-semibold text-slate-200 active:bg-[#1a2538] cursor-pointer"
                    >
                      <ResourceIcon kind="hunt" size={14} />
                      <span>Caçar</span>
                    </button>
                  )}
                </div>
              )
            )}

            {/* Contextual Atlantean Citizen Hero Promotion */}
            {hud.selection.canPromoteToHero && onPromoteToHero && (
              <div className="px-2 pt-1.5">
                <button
                  type="button"
                  onClick={onPromoteToHero}
                  className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-lg border border-[#facc15]/60 bg-[#281f0b] px-3 text-[11px] font-bold text-[#fde68a] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-[#facc15]" />
                    <span>Promover a Herói ★</span>
                  </span>
                  <span className="font-mono-num text-[10px]">
                    {hud.selection.heroPromoteIsFree
                      ? 'GRÁTIS'
                      : hud.selection.heroPromoteCost
                      ? formatCost(hud.selection.heroPromoteCost)
                      : ''}
                  </span>
                </button>
              </div>
            )}

            {/* Villager Category Tabs */}
            <div className="flex items-center gap-1 p-2 overflow-x-auto">
              {villagerTabs.map(({ id, label }) => {
                const active = villagerTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setVillagerTab(id)}
                    className={`flex flex-1 min-h-[38px] items-center justify-center rounded-lg border px-2 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'border-[#d4af37]/75 bg-[#d4af37]/20 text-[#fef08a]'
                        : 'border-white/10 bg-[#141c2c] text-slate-300'
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE B: BUILDING SELECTED -> SUB-TABS & CONTEXTUAL BARS                   */}
        {/* ========================================================================= */}
        {selectedBuildingKind && (
          <div className="flex flex-col border-b border-white/10 bg-[#0a0f19]">
            {/* Fortress Defensive Garrison Bar */}
            {isFortress && (
              <div className="m-2 mb-1 flex flex-col gap-1.5 rounded-xl border border-[#f59e0b]/50 bg-[#201508] p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-[#fde68a]">
                    <Castle className="h-4 w-4 text-[#facc15]" />
                    <span>Guarnição do Bastião</span>
                  </span>
                  <span className="font-mono-num font-bold text-[#fde047]">
                    {hud.selection.garrisonedCount ?? 0} / {fortressCap} tropas
                    {(hud.selectedBuildingGarrison?.bonusArrows ?? 0) > 0 && (
                      <span className="ml-1 text-[#67e8f9]">
                        (+{hud.selectedBuildingGarrison!.bonusArrows} flechas)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onGarrisonSelected && hud.selection.buildingId && (
                    <button
                      type="button"
                      onClick={() => onGarrisonSelected(hud.selection.buildingId!)}
                      className="flex flex-1 min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#60a5fa]/60 bg-[#132948] text-[11px] font-bold text-[#dbeafe] active:bg-[#1a3760] cursor-pointer"
                    >
                      <Shield className="h-3.5 w-3.5 text-[#60a5fa]" />
                      <span>Guarnecer</span>
                    </button>
                  )}
                  {hud.selection.canUngarrison && hud.selection.buildingId && onUngarrisonBuilding && (
                    <button
                      type="button"
                      onClick={() => onUngarrisonBuilding(hud.selection.buildingId!)}
                      className="flex flex-1 min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#f59e0b]/70 bg-[#2d1b06] text-[11px] font-bold text-[#fef3c7] active:bg-[#452709] cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-[#fbbf24]" />
                      <span>Liberar ({hud.selection.garrisonedCount})</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Temple Divine Prayer & Set Animals Bar */}
            {isTemple && (
              <div className="m-2 mb-1 flex flex-col gap-1.5 rounded-xl border border-sky-400/40 bg-[#0b1c2b] p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-sky-200">
                    <Sun className="h-4 w-4 text-sky-300" />
                    <span>Favor Divino</span>
                  </span>
                  <span className="font-mono-num font-bold text-[#38bdf8]">
                    +{(hud.favorRatePerSec ?? 0).toFixed(2)}/s Favor
                  </span>
                </div>
                {hud.selection.canCallVillagersToPray && onOrderPrayTemple && (
                  <button
                    type="button"
                    onClick={() => onOrderPrayTemple(hud.selection.buildingId)}
                    className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-sky-400/60 bg-[#11324d] text-[11px] font-bold text-sky-100 active:bg-[#184469] cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5 text-sky-300" />
                    <span>
                      Convocar Aldeões para Orar ({hud.selection.prayingCount ?? 0} orando)
                    </span>
                  </button>
                )}
                {hud.isSetPlayer && onSummonSetAnimal && (
                  <div className="grid grid-cols-4 gap-1 pt-1 border-t border-sky-400/20">
                    {(
                      [
                        { kind: 'baboon', label: 'Babuíno', cost: 8, minAge: 1 },
                        { kind: 'hyena', label: 'Hiena', cost: 12, minAge: 1 },
                        { kind: 'crocodile', label: 'Crocodilo', cost: 16, minAge: 2 },
                        { kind: 'hippo', label: 'Hipopótamo', cost: 22, minAge: 3 },
                      ] as const
                    ).map((animal) => {
                      const locked = hud.age < animal.minAge || hud.resources.favor < animal.cost;
                      return (
                        <button
                          key={animal.kind}
                          type="button"
                          disabled={locked}
                          onClick={() => onSummonSetAnimal(animal.kind)}
                          className={`flex min-h-[38px] flex-col items-center justify-center rounded border py-1 text-[9.5px] font-semibold cursor-pointer ${
                            locked
                              ? 'border-white/10 bg-[#10131b] text-slate-500'
                              : 'border-sky-400/35 bg-[#0e2436] text-sky-200 active:bg-[#163a56]'
                          }`}
                        >
                          <span className="truncate max-w-full px-1">{animal.label}</span>
                          <span className="font-mono-num text-[8.5px] text-amber-300">
                            {hud.age < animal.minAge ? `E${animal.minAge}` : `${animal.cost}F`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tabs if both units and techs exist */}
            {buildingUnits.length > 0 && buildingTechs.length > 0 && (
              <div className="grid grid-cols-3 gap-1 p-2">
                {(
                  [
                    { id: 'all', label: 'Tudo' },
                    { id: 'units', label: `${buildingProfile?.unitTabLabel ?? 'Treinar'} (${buildingUnits.length})` },
                    { id: 'techs', label: `${buildingProfile?.techTabLabel ?? 'Pesquisas'} (${buildingTechs.length})` },
                  ] as const
                ).map(({ id, label }) => {
                  const active = buildingSubTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBuildingSubTab(id)}
                      className={`flex min-h-[38px] items-center justify-center rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'border-[#d4af37]/75 bg-[#d4af37]/20 text-[#fef08a]'
                          : 'border-white/10 bg-[#141c2c] text-slate-300'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE D: NO ENTITY SELECTED -> FALLBACK TABS: CONSTRUIR | PODERES | TECH   */}
        {/* ========================================================================= */}
        {!isVillagerSelected && !selectedBuildingKind && !isMilitaryUnit && (
          <div className="grid grid-cols-3 gap-1 px-3 py-2 border-b border-white/10 bg-[#0a0f19]">
            {(
              [
                { id: 'build', label: 'Construir', icon: Hammer },
                { id: 'powers', label: 'Poderes', icon: Sparkles },
                { id: 'tech', label: 'Pesquisas', icon: BookOpen },
              ] as const
            ).map(({ id, label, icon: Icon }) => {
              const active = genericTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGenericTab(id)}
                  className={`flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'border-[#d4af37]/75 bg-[#d4af37]/20 text-[#fef08a]'
                      : 'border-white/10 bg-[#151c2c] text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCROLLABLE SHEET BODY                                                     */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* CASE A BODY: VILLAGER CATEGORIZED BUILDINGS */}
          {isVillagerSelected && (
            <div className="grid grid-cols-2 gap-2">
              {filteredBuildings.map((b) => {
                const locked = hud.age < b.minAge;
                const affordable = !locked && canAffordCost(hud.resources, b.cost);
                return (
                  <button
                    key={b.kind}
                    type="button"
                    onClick={() => {
                      onStartBuild(b.kind);
                      onClose();
                    }}
                    disabled={locked}
                    className={`flex min-h-[58px] items-center gap-2.5 rounded-xl border p-2 text-left transition-colors cursor-pointer ${
                      locked
                        ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                        : affordable
                          ? 'border-[#c8a962]/50 bg-[#171f31] text-slate-100 active:bg-[#232f48]'
                          : 'border-white/10 bg-[#131927] text-slate-400'
                    }`}
                  >
                    <BuildingIcon kind={b.kind} pantheon={hud.pantheon} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight line-clamp-1">{b.name}</div>
                      <div className="mt-0.5 text-[10px] font-mono-num text-[#e7cf8e]">
                        {locked ? `Era ${b.minAge}` : formatCost(b.cost)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* CASE B BODY: BUILDING EXCLUSIVE UNITS, TECHS & SPECIAL ACTIONS */}
          {selectedBuildingKind && (
            <div className="flex flex-col gap-3">
              {!hud.selection.isConstructed ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-[#1f180c] p-4 text-center">
                  <div className="text-xs font-bold text-amber-300">
                    Estrutura em construção ({Math.round((hud.selection.buildProgress ?? 0) * 100)}%)
                  </div>
                  {onOrderVillagersToTarget && (
                    <button
                      type="button"
                      onClick={() => {
                        onOrderVillagersToTarget();
                        onClose();
                      }}
                      className="flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#d4af37] px-3 text-xs font-bold text-[#0b0e14] active:bg-[#e5c45e] cursor-pointer"
                    >
                      <Hammer className="h-4 w-4" />
                      <span>Enviar Construtores</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Units Section */}
                  {(buildingSubTab === 'all' || buildingSubTab === 'units') &&
                    buildingUnits.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                          <Swords className="h-3.5 w-3.5 text-sky-400" />
                          <span>Unidades Disponíveis ({buildingUnits.length})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {buildingUnits.map((u) => {
                            const locked = hud.age < u.minAge;
                            const affordable = !locked && canAffordCost(hud.resources, u.cost);
                            return (
                              <button
                                key={u.kind}
                                type="button"
                                onClick={() => onTrainUnit(u.kind)}
                                disabled={locked}
                                className={`flex min-h-[58px] items-center gap-2.5 rounded-xl border p-2 text-left transition-colors cursor-pointer ${
                                  locked
                                    ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                                    : affordable
                                      ? 'border-sky-400/40 bg-[#171f31] text-slate-100 active:bg-[#232f48]'
                                      : 'border-white/10 bg-[#131927] text-slate-400'
                                }`}
                              >
                                <UnitIcon kind={u.kind} pantheon={hud.pantheon} size={28} />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold leading-tight line-clamp-1">
                                    {u.name}
                                  </div>
                                  <div className="mt-0.5 text-[10px] font-mono-num text-sky-200">
                                    {locked ? `Era ${u.minAge}` : formatCost(u.cost)}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Techs Section */}
                  {(buildingSubTab === 'all' || buildingSubTab === 'techs') &&
                    buildingTechs.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Tecnologias & Melhorias ({buildingTechs.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {buildingTechs.map((t) => {
                            const locked = hud.age < t.minAge;
                            const researched = hud.researchedTechs.includes(t.id);
                            const effectiveCost = getEffectiveTechCost(t, hud.researchedTechs);
                            const affordable = !locked && !researched && canAffordCost(hud.resources, effectiveCost);

                            return (
                              <button
                                key={t.id}
                                type="button"
                                disabled={locked || researched}
                                onClick={() => onResearchTech(t.id)}
                                className={`flex min-h-[54px] items-center justify-between gap-2.5 rounded-xl border p-2 text-left transition-colors cursor-pointer ${
                                  researched
                                    ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 opacity-60'
                                    : locked
                                      ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                                      : affordable
                                        ? 'border-emerald-400/45 bg-[#172130] text-slate-100 active:bg-[#223147]'
                                        : 'border-white/10 bg-[#131927] text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <TechIcon techId={t.id} size={28} />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate">{t.name}</div>
                                    <div className="text-[10px] text-slate-400 line-clamp-1">
                                      {t.description}
                                    </div>
                                  </div>
                                </div>
                                <span className="shrink-0 text-[10px] font-mono-num font-semibold text-emerald-300">
                                  {researched ? (
                                    <span className="flex items-center gap-1 text-emerald-400">
                                      <Check className="h-3 w-3" /> Concluído
                                    </span>
                                  ) : locked ? (
                                    `Era ${t.minAge}`
                                  ) : (
                                    formatCost(effectiveCost)
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Market Tribute Exchanges */}
                  {selectedBuildingKind === 'market' && onExchangeTribute && (
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { from: 'food' as ResourceType, to: 'gold' as ResourceType, label: 'Ouro' },
                          { from: 'wood' as ResourceType, to: 'gold' as ResourceType, label: 'Ouro' },
                          { from: 'gold' as ResourceType, to: 'food' as ResourceType, label: 'Alim' },
                          { from: 'gold' as ResourceType, to: 'wood' as ResourceType, label: 'Mad' },
                        ] as const
                      ).map((ex) => (
                        <button
                          key={`${ex.from}-${ex.to}`}
                          type="button"
                          onClick={() => onExchangeTribute(ex.from, ex.to, 100)}
                          className="flex min-h-[44px] items-center justify-between rounded-xl border border-[#c8a962]/30 bg-[#151c2c] px-3 text-xs font-semibold text-slate-100 active:bg-[#222d44] cursor-pointer"
                        >
                          <span className="flex items-center gap-1">
                            <ResourceIcon kind={ex.from} size={15} />
                            <span>100 →</span>
                            <ResourceIcon kind={ex.to} size={15} />
                          </span>
                          <span className="text-[#fde68a]">{ex.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sky Passage Teleport */}
                  {selectedBuildingKind === 'sky_passage' && hud.selection.buildingId && onTeleportSkyPassage && (
                    <button
                      type="button"
                      disabled={(hud.skyPassageCount ?? 0) < 2}
                      onClick={() => {
                        onTeleportSkyPassage(hud.selection.buildingId!);
                        onClose();
                      }}
                      className={`flex min-h-[48px] items-center justify-between rounded-xl border px-3 text-xs font-bold cursor-pointer ${
                        (hud.skyPassageCount ?? 0) >= 2
                          ? 'border-[#22d3ee]/70 bg-[#0d2838] text-[#bae6fd]'
                          : 'border-white/10 bg-[#121620] text-slate-500'
                      }`}
                    >
                      <span>Teletransportar Tropas</span>
                      <span className="font-mono-num text-[10px]">
                        {(hud.skyPassageCount ?? 0) >= 2 ? 'Ativo' : 'Requer 2 Portais'}
                      </span>
                    </button>
                  )}

                  {/* Wall to Gate Conversion */}
                  {selectedBuildingKind === 'wall' && onConvertWallToGate && (
                    <button
                      type="button"
                      onClick={() => {
                        onConvertWallToGate();
                        onClose();
                      }}
                      className="flex min-h-[48px] items-center justify-between rounded-xl border border-[#d4af37]/60 bg-[#241e0d] px-3 text-xs font-bold text-[#fde68a] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-[#facc15]" />
                        <span>Converter em Portão</span>
                      </span>
                      <span className="font-mono-num text-[10px]">15M · 10O</span>
                    </button>
                  )}

                  {/* Non-Fortress Garrison (TC / Tower) */}
                  {!isFortress && hud.selection.canGarrison && hud.selection.buildingId && (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-[#60a5fa]/40 bg-[#0f1d32] p-2.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#93c5fd]">
                        <Shield className="h-4 w-4 text-[#60a5fa]" />
                        <span className="font-mono-num text-[#fde047]">
                          {hud.selection.garrisonedCount ?? 0}/{hud.selection.garrisonMaxCapacity ?? 10}
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {onGarrisonSelected && (
                          <button
                            type="button"
                            onClick={() => onGarrisonSelected(hud.selection.buildingId!)}
                            className="min-h-[38px] rounded-lg border border-[#60a5fa]/60 bg-[#132948] px-3 text-xs font-bold text-[#dbeafe] cursor-pointer"
                          >
                            Guarnecer
                          </button>
                        )}
                        {hud.selection.canUngarrison && onUngarrisonBuilding && (
                          <button
                            type="button"
                            onClick={() => onUngarrisonBuilding(hud.selection.buildingId!)}
                            className="min-h-[38px] rounded-lg border border-[#f59e0b]/70 bg-[#2d1b06] px-3 text-xs font-bold text-[#fef3c7] cursor-pointer"
                          >
                            Liberar ({hud.selection.garrisonedCount})
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Monument Empower */}
                  {selectedBuildingKind === 'monument' && hud.selection.canEmpowerMonument && onOrderEmpowerMonument && (
                    <button
                      type="button"
                      onClick={() => {
                        onOrderEmpowerMonument(hud.selection.buildingId);
                        onClose();
                      }}
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#facc15]/65 bg-[#2d230c] px-3 text-xs font-bold text-[#fef08a] cursor-pointer"
                    >
                      <Sun className="h-4 w-4 text-[#facc15]" />
                      <span>Energizar Monumento (Faraó / Sacerdote)</span>
                    </button>
                  )}

                  {buildingUnits.length === 0 &&
                    buildingTechs.length === 0 &&
                    selectedBuildingKind !== 'market' &&
                    selectedBuildingKind !== 'sky_passage' &&
                    selectedBuildingKind !== 'wall' &&
                    selectedBuildingKind !== 'monument' && (
                      <div className="py-6 text-center text-xs text-slate-400">
                        {buildingProfile?.subtitle ?? 'Estrutura de apoio e defesa territorial.'}
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {/* CASE C BODY: MILITARY UNIT ORDERS & FORMATIONS */}
          {isMilitaryUnit && (
            <div className="flex flex-col gap-3">
              {/* Combat Stances */}
              {onSetUnitStance && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    Postura de Combate
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'aggressive' as CombatStance, label: 'Agressivo', desc: 'Persegue inimigos' },
                        { id: 'defensive' as CombatStance, label: 'Defensivo', desc: 'Guarda área' },
                        { id: 'stand_ground' as CombatStance, label: 'Manter Posição', desc: 'Não sai do lugar' },
                      ] as const
                    ).map((s) => {
                      const active = hud.selection.stance === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSetUnitStance(s.id)}
                          className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border p-2 text-center transition-colors cursor-pointer ${
                            active
                              ? 'border-amber-400/80 bg-amber-950/60 text-amber-200'
                              : 'border-white/10 bg-[#141b2a] text-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold">{s.label}</span>
                          <span className="text-[9px] text-slate-400">{s.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Formations */}
              {onSetFormation && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    Formação Tática
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {formationList.map((f) => {
                      const active = hud.formation === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => onSetFormation(f.id)}
                          className={`flex min-h-[48px] flex-col items-start justify-center rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-[#d4af37]/80 bg-[#d4af37]/20 text-[#fef08a]'
                              : 'border-white/10 bg-[#141b2a] text-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold">{f.name}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{f.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mythic Abilities */}
              {hud.selection.isMythic && onTriggerMythSpecial && (
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-[#1f1430] p-3">
                  <button
                    type="button"
                    onClick={onTriggerMythSpecial}
                    className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 text-xs font-bold text-white active:bg-purple-700 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Habilidade Mítica Especial</span>
                  </button>
                  {onToggleMythAutoCast && (
                    <button
                      type="button"
                      onClick={onToggleMythAutoCast}
                      className="min-h-[44px] rounded-lg border border-purple-400/40 bg-[#150d24] px-3 text-xs font-bold text-purple-200 cursor-pointer"
                    >
                      Auto-Cast
                    </button>
                  )}
                </div>
              )}

              {/* Atlantean Hero Promotion */}
              {hud.selection.canPromoteToHero && onPromoteToHero && (
                <button
                  type="button"
                  onClick={onPromoteToHero}
                  className="flex items-center justify-between rounded-xl border border-[#f59e0b]/70 bg-gradient-to-r from-[#291b07] to-[#1c1828] p-3 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-[#facc15]" />
                    <div>
                      <div className="text-xs font-bold text-[#fef08a]">Promover a Herói Atlante</div>
                      <div className="text-[10px] text-slate-300">
                        Aumenta PV, ataque e eficácia extrema contra Seres Míticos
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono-num font-bold text-[#fde047]">
                    {hud.selection.heroPromoteIsFree
                      ? 'Grátis'
                      : hud.selection.heroPromoteCost
                        ? formatCost(hud.selection.heroPromoteCost)
                        : ''}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* CASE D BODY: GENERIC FALLBACK (BUILD / POWERS / TECH) */}
          {!isVillagerSelected && !selectedBuildingKind && !isMilitaryUnit && (
            <>
              {genericTab === 'build' && (
                <div className="grid grid-cols-2 gap-2">
                  {buildingList.map((b) => {
                    const locked = hud.age < b.minAge;
                    const affordable = !locked && canAffordCost(hud.resources, b.cost);
                    return (
                      <button
                        key={b.kind}
                        type="button"
                        onClick={() => {
                          onStartBuild(b.kind);
                          onClose();
                        }}
                        disabled={locked}
                        className={`flex min-h-[58px] items-center gap-2.5 rounded-xl border p-2 text-left transition-colors cursor-pointer ${
                          locked
                            ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                            : affordable
                              ? 'border-[#c8a962]/50 bg-[#171f31] text-slate-100 active:bg-[#232f48]'
                              : 'border-white/10 bg-[#131927] text-slate-400'
                        }`}
                      >
                        <BuildingIcon kind={b.kind} pantheon={hud.pantheon} size={28} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-tight line-clamp-1">{b.name}</div>
                          <div className="mt-0.5 text-[10px] font-mono-num text-[#e7cf8e]">
                            {locked ? `Era ${b.minAge}` : formatCost(b.cost)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {genericTab === 'powers' && (
                <div className="grid grid-cols-1 gap-2">
                  {powerList.map((p) => {
                    const cd = Math.ceil(hud.godPowerCooldowns[p.id] ?? 0);
                    const onCd = cd > 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={onCd}
                        onClick={() => {
                          onActivateGodPower(p.id);
                          onClose();
                        }}
                        className={`flex min-h-[60px] items-center justify-between gap-2.5 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                          onCd
                            ? 'border-white/10 bg-[#111725] text-slate-500'
                            : 'border-amber-400/55 bg-gradient-to-r from-[#1c2336] to-[#261f16] text-amber-100 active:brightness-110'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#fef08a] truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-300 line-clamp-1">{p.description}</div>
                        </div>
                        <span className="shrink-0 rounded-lg border border-amber-400/40 bg-black/30 px-2 py-1 text-[11px] font-bold tabular-nums">
                          {onCd ? `${cd}s` : 'Lançar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {genericTab === 'tech' && (
                <div className="grid grid-cols-1 gap-2">
                  {techList.slice(0, 30).map((t) => {
                    const locked = hud.age < t.minAge;
                    const researched = hud.researchedTechs.includes(t.id);
                    const effectiveCost = getEffectiveTechCost(t, hud.researchedTechs);
                    const affordable = !locked && !researched && canAffordCost(hud.resources, effectiveCost);

                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={locked || researched}
                        onClick={() => onResearchTech(t.id)}
                        className={`flex min-h-[54px] items-center justify-between gap-2.5 rounded-xl border p-2 text-left transition-colors cursor-pointer ${
                          researched
                            ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 opacity-60'
                            : locked
                              ? 'border-white/5 bg-[#101522]/60 text-slate-500'
                              : affordable
                                ? 'border-emerald-400/45 bg-[#172130] text-slate-100 active:bg-[#223147]'
                                : 'border-white/10 bg-[#131927] text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TechIcon techId={t.id} size={28} />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{t.name}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">{t.description}</div>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono-num font-semibold text-emerald-300">
                          {researched ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Check className="h-3 w-3" /> Concluído
                            </span>
                          ) : locked ? (
                            `Era ${t.minAge}`
                          ) : (
                            formatCost(effectiveCost)
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
