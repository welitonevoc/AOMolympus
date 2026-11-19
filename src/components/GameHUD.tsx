import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Compass } from 'lucide-react';
import {
  getAvailableBuildingKinds,
  getCivBuildingSpec,
  getCivGodPowerSpec,
  getCivUnitSpec,
  TECH_SPECS,
} from '../game/divineData';
import {
  AGE_COSTS,
  AgeLevel,
  BuildingKind,
  VillagerPriorityPreset,
} from '../game/types';
import { Minimap } from './Minimap';
import { HudCommandGrid } from './hud/HudCommandGrid';
import { HudResourceLedger } from './hud/HudResourceLedger';
import { HudSelectionPanel } from './hud/HudSelectionPanel';
import { HudTopBar } from './hud/HudTopBar';
import { MatchChatAndCinematic } from './hud/MatchChatAndCinematic';
import { MinorGodAgeUpModal } from './hud/MinorGodAgeUpModal';
import { MobileCommandSheet } from './hud/MobileCommandSheet';
import { MobileCompactTopBar } from './hud/MobileCompactTopBar';
import { MobileTouchActionBar } from './hud/MobileTouchActionBar';
import {
  GameHUDProps,
  getUnitKindsForPantheon,
  InGameDialog,
  PausePrompt,
} from './hud/hudTypes';

const InGameDialogsModal = lazy(() =>
  import('./hud/InGameDialogsModal').then((m) => ({ default: m.InGameDialogsModal }))
);
const PauseAndPostGameModals = lazy(() =>
  import('./hud/PauseAndPostGameModals').then((m) => ({ default: m.PauseAndPostGameModals }))
);

export type { GameHUDProps };

export function GameHUD({
  hud,
  muted,
  hasSavedMatch,
  options,
  onUpdateOptions,
  onToggleMute,
  onTogglePause,
  onSaveMatch,
  onLoadSavedMatch,
  onResign,
  onExchangeTribute,
  onStartBuild,
  onTrainUnit,
  onCancelTrainingItem,
  onToggleRepeatTraining,
  onAdvanceAge,
  onChooseMinorGod,
  onCancelMinorGod,
  onResearchTech,
  onActivateGodPower,
  onCancelMode,
  onJumpCamera,
  onFocusTownCenter,
  onZoomCamera,
  onRotateCamera,
  onCenterCamera,
  onSetCameraPanMode,
  onToggleProjectionMode,
  onToggleDayNightCycle,
  onToggleHopliteMode,
  onCycleScaleProfile,
  onSetFormation,
  onStopUnits,
  onMinimapMoveOrder,
  onSelectCombat,
  onSelectIdleVillager,
  onSelectIdleMilitary,
  onOrderVillagersToTarget,
  onOrderVillagerTask,
  onPromoteToHero,
  onTeleportSkyPassage,
  onUngarrisonBuilding,
  onOrderPrayTemple,
  onOrderEmpowerMonument,
  onSpreadOracles,
  inMatchMessages = [],
  onSendMatchChat,
  onSendTribute,
  onSetVillagerPriority,
  onToggleAutoScout,
  onSetUnitStance,
  onSelectControlGroup,
  onAssignControlGroup,
  onEmbarkTransport,
  onDisembarkTransport,
  onSummonSetAnimal,
  onConvertFauna,
  onToggleTownBell,
  onGarrisonSelected,
  onConvertWallToGate,
  onTriggerMythSpecial,
  onToggleMythAutoCast,
  onReplayTogglePlay,
  onReplaySetSpeed,
  onReplaySeek,
  onReplayToggleFog,
  onReplaySetPerspective,
  onSkipCinematic,
  onRestart,
  onReturnTitle,
}: GameHUDProps) {
  const [dockCollapsed, setDockCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showAgeBonuses, setShowAgeBonuses] = useState(false);
  const [showFavorPanel, setShowFavorPanel] = useState(false);
  const [showDuelScore, setShowDuelScore] = useState(true);
  const [showCameraBar, setShowCameraBar] = useState(false);
  const [showMatchChat, setShowMatchChat] = useState(false);
  const [showTimelineOverlay, setShowTimelineOverlay] = useState(false);
  const [activeDialog, setActiveDialog] = useState<InGameDialog>('none');
  const [pausePrompt, setPausePrompt] = useState<PausePrompt>('menu');
  const [failedMinorPortraits, setFailedMinorPortraits] = useState<Record<string, boolean>>({});
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // AoM: Retold Enter shortcut opens match chat / environmental cheat console
  useEffect(() => {
    const onEnterKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || hud.phase !== 'playing') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      e.preventDefault();
      setShowMatchChat(true);
      setTimeout(() => chatInputRef.current?.focus(), 20);
    };
    window.addEventListener('keydown', onEnterKey);
    return () => window.removeEventListener('keydown', onEnterKey);
  }, [hud.phase]);

  // Keyboard shortcuts: H toggles bottom dock, F4 toggles Duel Scoreboard (AoM), F10 opens Menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }
      if (e.code === 'KeyH') {
        setDockCollapsed((prev) => !prev);
      } else if (e.code === 'F4') {
        e.preventDefault();
        setShowDuelScore((prev) => !prev);
      } else if (e.code === 'Escape') {
        setShowAgeBonuses(false);
      } else if (e.code === 'F10') {
        e.preventDefault();
        setPausePrompt('menu');
        onTogglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onTogglePause]);

  // Reset pause prompt whenever game unpauses
  useEffect(() => {
    if (hud.phase === 'playing') {
      setPausePrompt('menu');
    }
  }, [hud.phase]);

  const nextAge = hud.age < 5 ? ((hud.age + 1) as AgeLevel) : null;
  const nextAgeCost = nextAge ? AGE_COSTS[nextAge] : null;
  const canAffordNextAge =
    !hud.advancingToAge &&
    !(nextAge === 5 && hud.activeTechResearch?.id === 'secrets_of_titans') &&
    nextAgeCost != null &&
    hud.resources.food >= (nextAgeCost.food ?? 0) &&
    hud.resources.wood >= (nextAgeCost.wood ?? 0) &&
    hud.resources.gold >= (nextAgeCost.gold ?? 0) &&
    hud.resources.favor >= (nextAgeCost.favor ?? 0);

  const activeMajorGodCount = (hud.activeGodKinds ?? []).filter(
    (k) => k === 'zeus' || k === 'poseidon' || k === 'hades'
  ).length;

  const ageAdvancePct =
    hud.advancingToAge && hud.ageAdvanceTotal > 0
      ? Math.min(100, (hud.ageAdvanceProgress / hud.ageAdvanceTotal) * 100)
      : hud.activeTechResearch?.id === 'secrets_of_titans' && hud.activeTechResearch.total > 0
      ? Math.min(100, (hud.activeTechResearch.progress / hud.activeTechResearch.total) * 100)
      : 0;

  const isAdvancingAge = Boolean(hud.advancingToAge || hud.activeTechResearch?.id === 'secrets_of_titans');
  const ageReadinessPct = (() => {
    if (isAdvancingAge) return Math.round(ageAdvancePct);
    if (!nextAgeCost) return 100;
    const ratios: number[] = [];
    if (nextAgeCost.food) ratios.push(Math.min(1, hud.resources.food / nextAgeCost.food));
    if (nextAgeCost.wood) ratios.push(Math.min(1, hud.resources.wood / nextAgeCost.wood));
    if (nextAgeCost.gold) ratios.push(Math.min(1, hud.resources.gold / nextAgeCost.gold));
    if (nextAgeCost.favor) ratios.push(Math.min(1, hud.resources.favor / nextAgeCost.favor));
    if (ratios.length === 0) return 100;
    return Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
  })();

  const buildingKinds: BuildingKind[] = getAvailableBuildingKinds(
    hud.pantheon,
    hud.majorGodName,
    hud.chosenMinorGods,
    hud.titansEnabled
  );
  const unitKinds = getUnitKindsForPantheon(hud.pantheon, hud.majorGodName);
  const powerIds = Array.from(new Set(hud.unlockedPowers));

  const buildingList = buildingKinds.map((kind) =>
    getCivBuildingSpec(hud.pantheon, kind, hud.majorGodName, hud.age)
  );
  const unitList = unitKinds.map((kind) => getCivUnitSpec(hud.pantheon, kind));
  const powerList = powerIds.map((id) => getCivGodPowerSpec(hud.pantheon, id));
  const techList = Object.values(TECH_SPECS);

  const isProductionBuilding = Boolean(
    hud.selection.primaryType === 'building' &&
      hud.selection.team === 'player' &&
      hud.selection.isConstructed &&
      (hud.selection.buildingKind === 'town_center' ||
        hud.selection.buildingKind === 'village_center' ||
        hud.selection.buildingKind === 'barracks' ||
        hud.selection.buildingKind === 'archery_range' ||
        hud.selection.buildingKind === 'counter_barracks' ||
        hud.selection.buildingKind === 'stable' ||
        hud.selection.buildingKind === 'great_hall' ||
        hud.selection.buildingKind === 'siege_works' ||
        hud.selection.buildingKind === 'market' ||
        hud.selection.buildingKind === 'temple' ||
        hud.selection.buildingKind === 'dock' ||
        hud.selection.buildingKind === 'fortress' ||
        hud.selection.buildingKind === 'asgard_hill_fort')
  );

  const selectedPlayerBuildingKind =
    hud.selection.primaryType === 'building' && hud.selection.team === 'player'
      ? hud.selection.buildingKind
      : undefined;

  const handleMinorPortraitError = (minorGodId: string) => {
    setFailedMinorPortraits((prev) => ({ ...prev, [minorGodId]: true }));
  };

  return (
    <>
      <MobileCompactTopBar
        hud={hud}
        nextAge={nextAge}
        canAffordNextAge={canAffordNextAge}
        isAdvancingAge={isAdvancingAge}
        ageAdvancePct={ageAdvancePct}
        onAdvanceAge={onAdvanceAge}
        onOpenPauseMenu={() => {
          setMobileSheetOpen(false);
          setPausePrompt('menu');
          onTogglePause();
        }}
      />

      <div className="hidden md:block">
        <HudTopBar
          hud={hud}
          options={options}
          muted={muted}
          nextAge={nextAge}
          nextAgeCost={nextAgeCost}
          canAffordNextAge={canAffordNextAge}
          activeMajorGodCount={activeMajorGodCount}
          ageAdvancePct={ageAdvancePct}
          isAdvancingAge={isAdvancingAge}
          ageReadinessPct={ageReadinessPct}
          powerList={powerList}
          showDuelScore={showDuelScore}
          setShowDuelScore={setShowDuelScore}
          showAgeBonuses={showAgeBonuses}
          setShowAgeBonuses={setShowAgeBonuses}
          showCameraBar={showCameraBar}
          setShowCameraBar={setShowCameraBar}
          showTimelineOverlay={showTimelineOverlay}
          setShowTimelineOverlay={setShowTimelineOverlay}
          activeDialog={activeDialog}
          setActiveDialog={setActiveDialog}
          showMatchChat={showMatchChat}
          onToggleMatchChat={() => {
            setShowMatchChat((v) => !v);
            setTimeout(() => chatInputRef.current?.focus(), 20);
          }}
          hasMatchChat={Boolean(onSendMatchChat)}
          inMatchMessageCount={inMatchMessages.length}
          failedMinorPortraits={failedMinorPortraits}
          onMinorPortraitError={handleMinorPortraitError}
          onAdvanceAge={onAdvanceAge}
          onActivateGodPower={onActivateGodPower}
          onCancelMode={onCancelMode}
          onSelectIdleVillager={onSelectIdleVillager}
          onSelectIdleMilitary={onSelectIdleMilitary}
          onReplayTogglePlay={onReplayTogglePlay}
          onReplaySetSpeed={onReplaySetSpeed}
          onReplaySeek={onReplaySeek}
          onReplayToggleFog={onReplayToggleFog}
          onReplaySetPerspective={onReplaySetPerspective}
          onReturnTitle={onReturnTitle}
          onToggleTownBell={onToggleTownBell}
          onSaveMatch={onSaveMatch}
          onToggleMute={onToggleMute}
          onOpenPauseMenu={() => {
            setPausePrompt('menu');
            onTogglePause();
          }}
          onZoomCamera={onZoomCamera}
          onSetCameraPanMode={onSetCameraPanMode}
          onRotateCamera={onRotateCamera}
          onCenterCamera={onCenterCamera}
          onToggleProjectionMode={onToggleProjectionMode}
          onOrderVillagersToTarget={onOrderVillagersToTarget}
          onConvertFauna={onConvertFauna}
        />
      </div>

      {/* AoM: RETOLD ANCHORED COMMAND DOCK (PAINEL H — DESKTOP) */}
      <div
        className={`hidden md:block fixed bottom-0 inset-x-0 z-20 pointer-events-none transition-transform duration-200 ${
          dockCollapsed ? 'translate-y-[calc(100%-24px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Handle + AoM Retold Macro QoL & Control Groups Strip */}
        <div className="flex flex-wrap items-end justify-center gap-1.5 px-1.5">
          {!dockCollapsed && (onSetVillagerPriority || onToggleAutoScout || onSelectControlGroup) && (
            <div className="pointer-events-auto hidden md:flex items-center gap-1.5 rounded-t border border-b-0 border-[#c8a962]/45 bg-[#0d111a]/95 px-2 py-0.5 text-[10px]">
              {onSetVillagerPriority && (
                <div className="flex items-center gap-0.5" title="Prioridade Automática de Aldeões (AoM: Retold)">
                  <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Aldeões:
                  </span>
                  {(
                    [
                      { id: 'manual', label: 'Manual' },
                      { id: 'balanced', label: 'Equil' },
                      { id: 'food', label: 'Alim' },
                      { id: 'wood', label: 'Mad' },
                      { id: 'gold', label: 'Ouro' },
                      { id: 'wonder', label: 'Marav' },
                    ] as { id: VillagerPriorityPreset; label: string }[]
                  ).map((p) => {
                    const active = (hud.villagerPriority ?? 'manual') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSetVillagerPriority(p.id)}
                        className={`rounded-sm px-1.5 py-0.5 font-semibold cursor-pointer transition-colors ${
                          active ? 'bg-[#d4af37] text-[#0b0e14]' : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {onToggleAutoScout && (
                <>
                  <div className="h-3.5 w-px bg-white/15" />
                  <button
                    type="button"
                    onClick={onToggleAutoScout}
                    title="Alternar Auto-Explorar para unidade selecionada ou batedor disponível (Z)"
                    className={`flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-semibold cursor-pointer ${
                      hud.selection.autoScout
                        ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                        : 'border-white/15 bg-[#151c2c] text-[#cbd5e1] hover:border-[#f3d27a]'
                    }`}
                  >
                    <Compass className="h-3 w-3 text-[#38bdf8]" />
                    <span>Auto-Explorar (Z)</span>
                  </button>
                </>
              )}

              {onSelectControlGroup && (
                <>
                  <div className="h-3.5 w-px bg-white/15" />
                  <div
                    className="flex items-center gap-0.5"
                    title="Grupos de Controle (Ctrl+1..9 para definir, 1..9 para selecionar)"
                  >
                    {[1, 2, 3, 4, 5].map((g) => {
                      const entry = hud.controlGroups?.find((cg) => cg.group === g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={(e) => {
                            if (e.ctrlKey || e.metaKey) {
                              onAssignControlGroup?.(g);
                            } else if (entry) {
                              onSelectControlGroup(g, e.shiftKey || e.detail >= 2);
                            } else if (hud.selection.primaryType === 'unit' && hud.selection.team === 'player') {
                              onAssignControlGroup?.(g);
                            }
                          }}
                          title={
                            entry
                              ? `Grupo ${g} (${entry.count} unid.) — Clique para selecionar, clique duplo para focar, Ctrl+Clique para redefinir`
                              : `Grupo ${g} vazio — Clique com unidades selecionadas ou pressione Ctrl+${g}`
                          }
                          className={`flex items-center gap-0.5 rounded-sm border px-1.5 py-0.5 font-mono-num text-[9px] font-bold cursor-pointer ${
                            entry
                              ? 'border-[#d4af37]/65 bg-[#1b2234] text-[#fde68a] hover:bg-[#26314a]'
                              : 'border-white/10 bg-[#111724] text-[#64748b] hover:text-[#cbd5e1]'
                          }`}
                        >
                          <span>{g}</span>
                          {entry && <span className="text-[8px] text-[#38bdf8]">({entry.count})</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setDockCollapsed((p) => !p)}
            className="pointer-events-auto flex items-center gap-1.5 rounded-t border border-b-0 border-[#c8a962]/65 bg-[#0d111a]/96 px-3 py-0.5 text-[10px] font-semibold tracking-wide text-[#f3d27a] shadow hover:bg-[#161e2e] hover:text-white cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span>{dockCollapsed ? 'Painel H — Expandir' : 'Ocultar Painel (H)'}</span>
          </button>
        </div>

        {/* Main AoM: Retold Bottom Strip (Resource Ledger + Command Dock + Diamond Minimap) */}
        <div className="pointer-events-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-1.5 md:gap-2 px-1.5 pb-1.5">
          <HudResourceLedger
            hud={hud}
            showFavorPanel={showFavorPanel}
            setShowFavorPanel={setShowFavorPanel}
            onOrderPrayTemple={onOrderPrayTemple}
            onOrderEmpowerMonument={onOrderEmpowerMonument}
            onSpreadOracles={onSpreadOracles}
            onSelectCombat={onSelectCombat}
          />

          <div className="flex-1 max-w-[990px] grid grid-cols-1 md:grid-cols-12 gap-1.5 md:gap-2 rounded-md border-2 border-[#c8a962]/70 bg-[#0d111a]/96 p-1.5 sm:p-2 shadow-[0_10px_28px_rgba(0,0,0,0.85)]">
            <HudCommandGrid
              hud={hud}
              buildingList={buildingList}
              unitList={unitList}
              techList={techList}
              isProductionBuilding={isProductionBuilding}
              selectedPlayerBuildingKind={selectedPlayerBuildingKind}
              nextAge={nextAge}
              nextAgeCost={nextAgeCost}
              canAffordNextAge={canAffordNextAge}
              onToggleRepeatTraining={onToggleRepeatTraining}
              onOrderVillagerTask={onOrderVillagerTask}
              onOrderPrayTemple={onOrderPrayTemple}
              onPromoteToHero={onPromoteToHero}
              onStartBuild={onStartBuild}
              onOrderVillagersToTarget={onOrderVillagersToTarget}
              onAdvanceAge={onAdvanceAge}
              onSummonSetAnimal={onSummonSetAnimal}
              onOrderEmpowerMonument={onOrderEmpowerMonument}
              onTeleportSkyPassage={onTeleportSkyPassage}
              onGarrisonSelected={onGarrisonSelected}
              onUngarrisonBuilding={onUngarrisonBuilding}
              onConvertWallToGate={onConvertWallToGate}
              onExchangeTribute={onExchangeTribute}
              onTrainUnit={onTrainUnit}
              onResearchTech={onResearchTech}
              onTriggerMythSpecial={onTriggerMythSpecial}
              onToggleMythAutoCast={onToggleMythAutoCast}
              onSetUnitStance={onSetUnitStance}
              onToggleAutoScout={onToggleAutoScout}
              onEmbarkTransport={onEmbarkTransport}
              onDisembarkTransport={onDisembarkTransport}
              onSetFormation={onSetFormation}
              onConvertFauna={onConvertFauna}
              onSpreadOracles={onSpreadOracles}
              onStopUnits={onStopUnits}
              onSelectCombat={onSelectCombat}
              onFocusTownCenter={onFocusTownCenter}
            />

            <HudSelectionPanel
              hud={hud}
              options={options}
              isProductionBuilding={isProductionBuilding}
              ageReadinessPct={ageReadinessPct}
              onToggleAgeBonuses={() => setShowAgeBonuses((v) => !v)}
              onCancelTrainingItem={onCancelTrainingItem}
            />
          </div>

          {/* ZONE 4 (BOTTOM-RIGHT): AoM: The Titans Diamond Minimap */}
          <div className="fixed bottom-[196px] sm:bottom-[228px] right-1.5 z-20 md:static flex items-center justify-end shrink-0">
            <Minimap
              blips={hud.minimapBlips}
              pantheon={hud.pantheon}
              mapId={hud.mapId}
              worldSize={hud.worldSize}
              revealedMap={hud.revealedMap}
              fogGrid={hud.fogGrid}
              fogGridSize={hud.fogGridSize}
              cameraTarget={hud.cameraTarget}
              cameraYaw={hud.cameraYaw}
              cameraDistance={hud.cameraDistance}
              onJumpCamera={onJumpCamera}
              onMoveOrder={onMinimapMoveOrder}
              onFocusTownCenter={onFocusTownCenter}
            />
          </div>
        </div>
      </div>

      {/* FLOATING MINIMAP WHEN DESKTOP DOCK IS COLLAPSED OR ON MOBILE */}
      <div className={`${dockCollapsed ? 'block' : 'block md:hidden'} fixed bottom-2 right-2 z-20`}>
        <Minimap
          blips={hud.minimapBlips}
          pantheon={hud.pantheon}
          mapId={hud.mapId}
          worldSize={hud.worldSize}
          revealedMap={hud.revealedMap}
          fogGrid={hud.fogGrid}
          fogGridSize={hud.fogGridSize}
          cameraTarget={hud.cameraTarget}
          cameraYaw={hud.cameraYaw}
          cameraDistance={hud.cameraDistance}
          onJumpCamera={onJumpCamera}
          onMoveOrder={onMinimapMoveOrder}
          onFocusTownCenter={onFocusTownCenter}
        />
      </div>

      <MobileTouchActionBar
        hud={hud}
        dockCollapsed={!mobileSheetOpen}
        onToggleDock={() => setMobileSheetOpen((prev) => !prev)}
        onSetCameraPanMode={onSetCameraPanMode}
        onSelectIdleVillager={onSelectIdleVillager}
        onFocusTownCenter={onFocusTownCenter}
        onSelectCombat={onSelectCombat}
        onCancelMode={onCancelMode}
      />

      <MobileCommandSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        hud={hud}
        buildingList={buildingList}
        unitList={unitList}
        powerList={powerList}
        techList={techList}
        nextAge={nextAge}
        nextAgeCost={nextAgeCost}
        canAffordNextAge={canAffordNextAge}
        isAdvancingAge={isAdvancingAge}
        ageAdvancePct={ageAdvancePct}
        onStartBuild={onStartBuild}
        onTrainUnit={onTrainUnit}
        onActivateGodPower={onActivateGodPower}
        onResearchTech={onResearchTech}
        onAdvanceAge={onAdvanceAge}
      />

      <MinorGodAgeUpModal
        hud={hud}
        failedMinorPortraits={failedMinorPortraits}
        onMinorPortraitError={handleMinorPortraitError}
        onChooseMinorGod={onChooseMinorGod}
        onCancelMinorGod={onCancelMinorGod}
      />

      {activeDialog !== 'none' && hud.phase === 'playing' && (
        <Suspense fallback={null}>
          <InGameDialogsModal
            hud={hud}
            options={options}
            activeDialog={activeDialog}
            buildingList={buildingList}
            unitList={unitList}
            techList={techList}
            onClose={() => setActiveDialog('none')}
            onUpdateOptions={onUpdateOptions}
            onExchangeTribute={onExchangeTribute}
            onSendTribute={onSendTribute}
            onToggleProjectionMode={onToggleProjectionMode}
            onToggleHopliteMode={onToggleHopliteMode}
            onToggleDayNightCycle={onToggleDayNightCycle}
            onCycleScaleProfile={onCycleScaleProfile}
          />
        </Suspense>
      )}

      {(hud.phase === 'paused' ||
        hud.phase === 'victory' ||
        hud.phase === 'defeat' ||
        showTimelineOverlay) && (
        <Suspense fallback={null}>
          <PauseAndPostGameModals
            hud={hud}
            hasSavedMatch={hasSavedMatch}
            pausePrompt={pausePrompt}
            setPausePrompt={setPausePrompt}
            showTimelineOverlay={showTimelineOverlay}
            setShowTimelineOverlay={setShowTimelineOverlay}
            onOpenPlayerOptions={() => {
              onTogglePause();
              setActiveDialog('player_options');
            }}
            onSaveMatch={onSaveMatch}
            onLoadSavedMatch={onLoadSavedMatch}
            onRestart={onRestart}
            onResign={onResign}
            onReturnTitle={onReturnTitle}
            onTogglePause={onTogglePause}
          />
        </Suspense>
      )}

      <MatchChatAndCinematic
        hud={hud}
        showMatchChat={showMatchChat}
        onCloseMatchChat={() => setShowMatchChat(false)}
        chatInputRef={chatInputRef}
        inMatchMessages={inMatchMessages}
        onSendMatchChat={onSendMatchChat}
        onSkipCinematic={onSkipCinematic}
      />
    </>
  );
}
