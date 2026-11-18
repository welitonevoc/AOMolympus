import { useEffect, useRef, useState } from 'react';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './game/audio';
import { AoMEngine } from './game/engine';
import { multiplayerClient } from './game/multiplayerClient';
import { ChatMessage } from './game/multiplayerTypes';
import {
  DEFAULT_GAME_OPTIONS,
  DifficultyId,
  GameHudSnapshot,
  GameOptionsConfig,
  MapId,
  MatchStartOptions,
  PantheonId,
} from './game/types';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<AoMEngine | null>(null);
  const mpCleanupRef = useRef<(() => void) | null>(null);

  const [phase, setPhase] = useState<'title' | 'playing' | 'paused' | 'victory' | 'defeat'>('title');
  const [hudSnapshot, setHudSnapshot] = useState<GameHudSnapshot | null>(null);
  const [inMatchMessages, setInMatchMessages] = useState<ChatMessage[]>([]);
  const [muted, setMuted] = useState(false);
  const [fps, setFps] = useState(60);
  const [options, setOptions] = useState<GameOptionsConfig>(() => {
    try {
      const saved = localStorage.getItem('aom_options');
      return saved ? { ...DEFAULT_GAME_OPTIONS, ...JSON.parse(saved) } : DEFAULT_GAME_OPTIONS;
    } catch {
      return DEFAULT_GAME_OPTIONS;
    }
  });

  const [hasSavedMatch, setHasSavedMatch] = useState(() => {
    try {
      return Boolean(localStorage.getItem('aom_saved_match'));
    } catch {
      return false;
    }
  });

  const [lastPantheon, setLastPantheon] = useState<PantheonId>(() => {
    try {
      const saved = localStorage.getItem('aom_last_pantheon');
      return (saved as PantheonId) || 'greek';
    } catch {
      return 'greek';
    }
  });

  useEffect(() => {
    soundEngine.applySettings({
      masterVolume: options.masterVolume,
      musicVolume: options.musicVolume,
      sfxVolume: options.sfxVolume,
      musicEnabled: options.musicEnabled && !muted,
      sfxEnabled: options.sfxEnabled && !muted,
    });
  }, [options, muted]);

  useEffect(() => {
    if (phase === 'playing') {
      soundEngine.setMusicPausedDuck(false);
    } else if (phase === 'paused') {
      soundEngine.setMusicPausedDuck(true);
    } else if (phase === 'victory') {
      soundEngine.setMusicScene('victory');
    } else if (phase === 'defeat') {
      soundEngine.setMusicScene('defeat');
    } else if (phase === 'title') {
      soundEngine.setMusicScene('title', lastPantheon);
    }
  }, [phase, lastPantheon]);

  useEffect(() => {
    try {
      localStorage.setItem('aom_options', JSON.stringify(options));
    } catch {}
  }, [options]);

  useEffect(() => {
    const unsub = multiplayerClient.subscribe((st) => {
      setInMatchMessages(st.inMatchMessages);
    });
    return () => {
      unsub();
      if (mpCleanupRef.current) {
        mpCleanupRef.current();
        mpCleanupRef.current = null;
      }
    };
  }, []);

  const handleStartMatch = (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    extras?: MatchStartOptions
  ) => {
    if (!containerRef.current) return;
    if (mpCleanupRef.current) {
      mpCleanupRef.current();
      mpCleanupRef.current = null;
    }
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    const engine = new AoMEngine(
      containerRef.current,
      (snapshot) => {
        setHudSnapshot(snapshot);
        setPhase(snapshot.phase);
        setFps(snapshot.fps ?? 60);
      },
      () => {}
    );

    engineRef.current = engine;
    if (extras?.multiplayerRoster) {
      engine.setOnMultiplayerCommand((cmd) => multiplayerClient.sendMatchCommand(cmd));
      mpCleanupRef.current = multiplayerClient.onRemoteCommand((packet) => {
        engine.applyRemoteCommand(packet.command);
      });
    } else {
      engine.setOnMultiplayerCommand(null);
    }

    setLastPantheon(pantheon);
    try {
      localStorage.setItem('aom_last_pantheon', pantheon);
    } catch {}
    engine.startNewMatch(pantheon, difficulty, mapId, revealedMap, extras);
    engine.applyOptions(options);
    setPhase('playing');
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    engineRef.current.togglePause();
  };

  const handleSaveMatch = () => {
    if (!engineRef.current) return;
    const ok = engineRef.current.saveMatchToStorage();
    if (ok) {
      setHasSavedMatch(true);
    }
  };

  const handleLoadSavedMatch = () => {
    if (!containerRef.current) return;
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    const engine = new AoMEngine(
      containerRef.current,
      (snapshot) => {
        setHudSnapshot(snapshot);
        setPhase(snapshot.phase);
        setFps(snapshot.fps ?? 60);
      },
      () => {}
    );

    engineRef.current = engine;
    const ok = engine.loadMatchFromStorage();
    if (ok) {
      setPhase('playing');
    } else {
      setPhase('title');
    }
  };

  const handleDeleteSavedMatch = () => {
    try {
      localStorage.removeItem('aom_saved_match');
      setHasSavedMatch(false);
    } catch {}
  };

  const handleResign = () => {
    if (mpCleanupRef.current) {
      mpCleanupRef.current();
      mpCleanupRef.current = null;
    }
    if (engineRef.current) {
      engineRef.current.setOnMultiplayerCommand(null);
      engineRef.current.resignMatch();
      engineRef.current.dispose();
      engineRef.current = null;
    }
    setPhase('title');
    setHudSnapshot(null);
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#07090e] select-none font-sans text-white">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* Title Screen Menu */}
      {phase === 'title' && (
        <TitleScreen
          hasSavedMatch={hasSavedMatch}
          muted={muted}
          fps={fps}
          options={options}
          onUpdateOptions={(next) => {
            setOptions(next);
            if (engineRef.current) engineRef.current.applyOptions(next);
          }}
          onToggleMute={() => setMuted(!muted)}
          onStartMatch={handleStartMatch}
          onLoadSavedMatch={handleLoadSavedMatch}
          onDeleteSavedMatch={handleDeleteSavedMatch}
        />
      )}

      {/* Game HUD (Playing, Paused, Victory, Defeat) */}
      {phase !== 'title' && hudSnapshot && (
        <GameHUD
          hud={hudSnapshot}
          muted={muted}
          hasSavedMatch={hasSavedMatch}
          options={options}
          onUpdateOptions={(next) => {
            setOptions(next);
            if (engineRef.current) engineRef.current.applyOptions(next);
          }}
          onToggleMute={() => setMuted(!muted)}
          onTogglePause={handleTogglePause}
          onSaveMatch={handleSaveMatch}
          onLoadSavedMatch={handleLoadSavedMatch}
          onResign={handleResign}
          onExchangeTribute={(f, t, a) => engineRef.current?.exchangeTribute(f, t, a)}
          onStartBuild={(kind) => engineRef.current?.startBuildMode(kind)}
          onTrainUnit={(kind) => engineRef.current?.trainUnit(kind)}
          onCancelTrainingItem={(buildingId, index) => engineRef.current?.cancelTrainingItem(buildingId, index)}
          onToggleRepeatTraining={(id) => engineRef.current?.toggleRepeatTraining(id)}
          onStopUnits={() => engineRef.current?.stopSelectedUnits()}
          onAdvanceAge={() => engineRef.current?.advanceAge()}
          onChooseMinorGod={(id) => engineRef.current?.chooseMinorGod(id)}
          onCancelMinorGod={() => engineRef.current?.cancelMinorGodChoice()}
          onResearchTech={(id) => engineRef.current?.researchTech(id)}
          onActivateGodPower={(id) => engineRef.current?.activateGodPower(id)}
          onCancelMode={() => engineRef.current?.cancelModes()}
          onJumpCamera={(x, z) => engineRef.current?.jumpCameraTo(x, z)}
          onFocusTownCenter={() => engineRef.current?.focusNextTownCenter()}
          onZoomCamera={(delta) => engineRef.current?.zoomCameraBy(delta)}
          onRotateCamera={(rad) => engineRef.current?.rotateCameraBy(rad)}
          onCenterCamera={() => engineRef.current?.centerCameraOnBase()}
          onSetCameraPanMode={(mode) => engineRef.current?.setCameraPanMode(mode)}
          onToggleProjectionMode={() => engineRef.current?.toggleProjectionMode()}
          onToggleDayNightCycle={() => engineRef.current?.toggleDayNightCycle()}
          onToggleHopliteMode={() => engineRef.current?.toggleHopliteRenderMode()}
          onSetHopliteMode={(mode) => engineRef.current?.setHopliteRenderMode(mode)}
          onSetHopliteArmorTier={(tier) => engineRef.current?.setHopliteArmorTier(tier)}
          onCycleScaleProfile={() => engineRef.current?.cycleScaleProfile()}
          onSetFormation={(form) => engineRef.current?.setFormation(form)}
          onMinimapMoveOrder={(x, z) => engineRef.current?.issueMoveCommand(x, z)}
          onSelectCombat={() => engineRef.current?.selectAllCombatUnits()}
          onSelectIdleVillager={() => engineRef.current?.selectIdleVillager()}
          onSelectIdleMilitary={() => engineRef.current?.selectIdleMilitary()}
          onOrderVillagersToTarget={() => engineRef.current?.commandVillagersToSelectedTarget()}
          onOrderVillagerTask={(task) => engineRef.current?.orderSelectedVillagersToTask(task)}
          onPromoteToHero={() => engineRef.current?.promoteSelectedUnitsToHero()}
          onTeleportSkyPassage={(id) => engineRef.current?.teleportSkyPassage(id)}
          onUngarrisonBuilding={(id) => engineRef.current?.ungarrisonBuilding(id)}
          onOrderPrayTemple={(templeId) => engineRef.current?.orderVillagersToPrayAtTemple(templeId)}
          onOrderEmpowerMonument={(buildingId) => engineRef.current?.orderEmpowerMonument(buildingId)}
          onSpreadOracles={() => engineRef.current?.orderOraclesToSpread()}
          onSummonSetAnimal={(kind) => engineRef.current?.summonSetAnimal(kind)}
          onConvertFauna={() => engineRef.current?.convertTargetOrNearestFauna()}
          inMatchMessages={inMatchMessages}
          onSendMatchChat={(channel, text) => multiplayerClient.sendMatchChat(text, channel)}
          onSendTribute={(slotIdx, res, amt) => engineRef.current?.sendAllyTribute(slotIdx, res, amt)}
          onSetVillagerPriority={(preset) => engineRef.current?.setVillagerPriority(preset)}
          onToggleAutoScout={() => engineRef.current?.toggleAutoScout()}
          onSetUnitStance={(stance) => engineRef.current?.setSelectedStance(stance)}
          onSelectControlGroup={(group, forceFocus) => engineRef.current?.selectControlGroup(group, forceFocus)}
          onAssignControlGroup={(group) => engineRef.current?.assignControlGroup(group)}
          onEmbarkTransport={(shipId) => engineRef.current?.embarkSelectedIntoTransport(shipId)}
          onDisembarkTransport={(shipId) => engineRef.current?.disembarkTransport(shipId)}
          onRestart={() => {
            if (hudSnapshot) {
              handleStartMatch(hudSnapshot.pantheon, hudSnapshot.difficulty, hudSnapshot.mapId, hudSnapshot.revealedMap, {
                aiPersonality: hudSnapshot.aiPersonality,
                campaignScenarioId: hudSnapshot.campaignScenarioId,
                scenarioTitle: hudSnapshot.scenarioTitle,
                enemyPantheon: hudSnapshot.enemyPantheon,
                majorGodName: hudSnapshot.majorGodName,
                gameType: hudSnapshot.gameType,
                visibilityMode: hudSnapshot.visibilityMode,
                worldSize: hudSnapshot.worldSize,
                dayNightCycle: hudSnapshot.dayNightCycle,
                titansEnabled: hudSnapshot.titansEnabled,
                gameSpeed: options.gameSpeed,
              });
            }
          }}
          onReturnTitle={handleResign}
        />
      )}
    </div>
  );
}
