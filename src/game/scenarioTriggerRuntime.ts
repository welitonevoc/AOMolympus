import type { ScenarioDocument, ScenarioCinematicKeyframe, ScenarioTriggerDef } from '../maps/scenarioEditorTypes';
import type { TeamId, UnitKind } from './types';

export interface ScenarioTriggerRuntimeContext {
  elapsedSeconds: number;
  playerResources: { food: number; wood: number; gold: number; favor: number };
  getPlayerUnitCount: () => number;
  getEnemyBuildingCount: () => number;
  getEnemyUnitCount: () => number;
  hasPlayerUnitInArea: (x: number, z: number, radius: number) => boolean;
  spawnUnit: (kind: UnitKind, team: TeamId, x: number, z: number) => void;
  grantResources: (res: { food?: number; wood?: number; gold?: number; favor?: number }) => void;
  revealFullMap: () => void;
  notifyStatus: (msg: string) => void;
  speakNarration?: (speaker: string, text: string) => void;
  setCameraTarget: (x: number, z: number, zoom?: number) => void;
  triggerVictory: (reason: string) => void;
  triggerDefeat: (reason: string) => void;
}

export interface ActiveCinematicOverlay {
  active: boolean;
  title: string;
  subtitle: string;
  progress: number; // 0..1
}

/**
 * Executes Scenario Editor triggers (conditions + effects + loopable cooldowns)
 * and intro/event cinematic camera tracks in real time during Scenario Playtest.
 */
export class ScenarioTriggerRuntime {
  private doc: ScenarioDocument;
  private triggers: ScenarioTriggerDef[];
  private firedIds = new Set<string>();
  private lastFiredAt = new Map<string, number>();

  private cinematicFrames: ScenarioCinematicKeyframe[] = [];
  private cinematicActive = false;
  private cinematicElapsed = 0;
  private cinematicTotalDuration = 0;
  private cinematicTitle = '';
  private currentSubtitle = '';
  private lastSpokenCaption = '';

  constructor(doc: ScenarioDocument, playAsSlot: number) {
    this.doc = doc;
    this.triggers =
      doc.triggers && doc.triggers.length > 0
        ? doc.triggers.map((t) => ({ ...t }))
        : buildDefaultScenarioTriggers(doc, playAsSlot);

    const frames =
      doc.cinematics && doc.cinematics.length > 0
        ? doc.cinematics
        : buildDefaultIntroCinematic(doc, playAsSlot);

    if (frames.length > 0) {
      this.cinematicFrames = frames;
      this.cinematicTitle = doc.title || 'Cenário Personalizado';
      this.cinematicTotalDuration = frames.reduce((acc, f) => acc + Math.max(1.2, f.durationSec), 0);
      this.cinematicActive = true;
      this.cinematicElapsed = 0;
      this.currentSubtitle = frames[0]?.caption ?? '';
    }
  }

  public skipCinematic(): void {
    this.cinematicActive = false;
    this.currentSubtitle = '';
  }

  public getCinematicState(): ActiveCinematicOverlay {
    if (!this.cinematicActive || this.cinematicTotalDuration <= 0) {
      return { active: false, title: '', subtitle: '', progress: 1 };
    }
    return {
      active: true,
      title: this.cinematicTitle,
      subtitle: this.currentSubtitle,
      progress: Math.min(1, this.cinematicElapsed / this.cinematicTotalDuration),
    };
  }

  public update(dt: number, ctx: ScenarioTriggerRuntimeContext): void {
    // 1. Update Cinematic Camera Track
    if (this.cinematicActive && this.cinematicFrames.length > 0) {
      this.cinematicElapsed += dt;
      if (this.cinematicElapsed >= this.cinematicTotalDuration) {
        this.cinematicActive = false;
        this.currentSubtitle = '';
      } else {
        let acc = 0;
        for (let i = 0; i < this.cinematicFrames.length; i++) {
          const cur = this.cinematicFrames[i];
          const dur = Math.max(1.2, cur.durationSec);
          if (this.cinematicElapsed <= acc + dur) {
            const localT = (this.cinematicElapsed - acc) / dur;
            const smooth = localT * localT * (3 - 2 * localT);
            const next = this.cinematicFrames[Math.min(this.cinematicFrames.length - 1, i + 1)];
            const camX = cur.x + (next.x - cur.x) * smooth;
            const camZ = cur.z + (next.z - cur.z) * smooth;
            const camZoom = cur.zoom + (next.zoom - cur.zoom) * smooth;
            ctx.setCameraTarget(camX, camZ, camZoom);
            this.currentSubtitle = cur.caption;
            if (cur.caption && cur.caption !== this.lastSpokenCaption) {
              this.lastSpokenCaption = cur.caption;
              ctx.speakNarration?.('Narrador', cur.caption);
            }
            break;
          }
          acc += dur;
        }
      }
    }

    // 2. Evaluate Scenario Triggers
    for (const trig of this.triggers) {
      if (!trig.active) continue;
      if (!trig.loop && this.firedIds.has(trig.id)) continue;
      if (trig.loop) {
        const last = this.lastFiredAt.get(trig.id) ?? -Infinity;
        const interval = Math.max(5, trig.conditionValue || 20);
        if (ctx.elapsedSeconds - last < interval) continue;
      }

      if (this.evaluateCondition(trig, ctx)) {
        this.executeEffect(trig, ctx);
        this.firedIds.add(trig.id);
        this.lastFiredAt.set(trig.id, ctx.elapsedSeconds);
      }
    }
  }

  private evaluateCondition(trig: ScenarioTriggerDef, ctx: ScenarioTriggerRuntimeContext): boolean {
    switch (trig.conditionType) {
      case 'timer_elapsed':
        return ctx.elapsedSeconds >= Math.max(0.5, trig.conditionValue);
      case 'player_unit_count_gte':
        return ctx.getPlayerUnitCount() >= Math.max(1, trig.conditionValue);
      case 'enemy_buildings_destroyed':
        return ctx.elapsedSeconds > 4 && ctx.getEnemyBuildingCount() === 0;
      case 'enemy_defeated':
        return ctx.elapsedSeconds > 4 && ctx.getEnemyBuildingCount() === 0 && ctx.getEnemyUnitCount() === 0;
      case 'resources_gold_gte':
        return ctx.playerResources.gold >= trig.conditionValue;
      case 'area_entered':
        return ctx.hasPlayerUnitInArea(trig.areaX ?? 0, trig.areaZ ?? 0, trig.areaRadius ?? 10);
      default:
        return false;
    }
  }

  private executeEffect(trig: ScenarioTriggerDef, ctx: ScenarioTriggerRuntimeContext): void {
    switch (trig.effectType) {
      case 'announcement':
        if (trig.effectMessage) {
          ctx.notifyStatus(`📜 ${trig.effectMessage}`);
          ctx.speakNarration?.('Narrador', trig.effectMessage);
        }
        break;
      case 'grant_resources': {
        const amt = Math.max(50, trig.effectAmount || 250);
        ctx.grantResources({ food: amt, wood: amt, gold: amt, favor: Math.round(amt * 0.12) });
        ctx.notifyStatus(trig.effectMessage || `🎁 Gatilho "${trig.name}": +${amt} recursos concedidos!`);
        break;
      }
      case 'spawn_reinforcements': {
        const count = Math.max(1, Math.min(12, trig.effectAmount || 4));
        const unitKind: UnitKind = trig.effectUnitKind || 'hoplite';
        const team: TeamId = trig.effectTeam === 'enemy' ? 'enemy' : 'player';
        const bx = trig.areaX ?? (team === 'player' ? -18 : 18);
        const bz = trig.areaZ ?? (team === 'player' ? 18 : -18);
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2;
          ctx.spawnUnit(unitKind, team, bx + Math.cos(ang) * 3.2, bz + Math.sin(ang) * 3.2);
        }
        ctx.notifyStatus(
          trig.effectMessage ||
            `⚔️ Gatilho "${trig.name}": ${count}x reforços chegaram ao campo de batalha!`
        );
        break;
      }
      case 'reveal_map':
        ctx.revealFullMap();
        ctx.notifyStatus(trig.effectMessage || `👁️ Gatilho "${trig.name}": Mapa revelado!`);
        break;
      case 'victory':
        ctx.triggerVictory(trig.effectMessage || `Objetivo do cenário "${this.doc.title}" concluído!`);
        break;
      case 'defeat':
        ctx.triggerDefeat(trig.effectMessage || `Falha no objetivo do cenário "${this.doc.title}".`);
        break;
    }
  }
}

function buildDefaultScenarioTriggers(doc: ScenarioDocument, playAsSlot: number): ScenarioTriggerDef[] {
  const primary = doc.objectives.find((o) => o.type === 'primary') ?? doc.objectives[0];
  const secondary = doc.objectives.find((o) => o.type === 'secondary');
  const playerObj = doc.objects.find((o) => o.playerSlot === playAsSlot);

  const list: ScenarioTriggerDef[] = [
    {
      id: 'auto_intro_briefing',
      name: 'Briefing Inicial',
      active: true,
      loop: false,
      conditionType: 'timer_elapsed',
      conditionValue: 2,
      effectType: 'announcement',
      effectMessage: primary
        ? `${primary.title}: ${primary.description}`
        : `Cenário "${doc.title}" iniciado — lidere suas forças à vitória!`,
    },
  ];

  if (secondary) {
    list.push({
      id: 'auto_secondary_hint',
      name: 'Objetivo Secundário',
      active: true,
      loop: false,
      conditionType: 'timer_elapsed',
      conditionValue: 20,
      effectType: 'announcement',
      effectMessage: `Objetivo Secundário — ${secondary.title}: ${secondary.description}`,
    });
  }

  if (playerObj) {
    list.push({
      id: 'auto_supply_drop',
      name: 'Suprimentos de Campanha',
      active: true,
      loop: false,
      conditionType: 'timer_elapsed',
      conditionValue: 60,
      effectType: 'grant_resources',
      effectAmount: 200,
      effectMessage: 'Caravana aliada chegou: +200 Alimento, Madeira e Ouro!',
    });
  }

  if (!doc.standardVictory) {
    list.push({
      id: 'auto_conquest_victory',
      name: 'Vitória do Cenário',
      active: true,
      loop: false,
      conditionType: 'enemy_defeated',
      conditionValue: 0,
      effectType: 'victory',
      effectMessage: `Todas as forças inimigas foram derrotadas em "${doc.title}"!`,
    });
  }

  return list;
}

function buildDefaultIntroCinematic(doc: ScenarioDocument, playAsSlot: number): ScenarioCinematicKeyframe[] {
  const playerAnchor = doc.objects.find((o) => o.playerSlot === playAsSlot);
  const enemyAnchor = doc.objects.find(
    (o) => o.playerSlot > 0 && o.playerSlot !== playAsSlot && doc.diplomacy[`${playAsSlot}_${o.playerSlot}`] !== 'ally'
  );
  const primary = doc.objectives.find((o) => o.type === 'primary') ?? doc.objectives[0];

  const px = playerAnchor?.x ?? -20;
  const pz = playerAnchor?.z ?? 20;
  const ex = enemyAnchor?.x ?? 20;
  const ez = enemyAnchor?.z ?? -20;

  return [
    {
      id: 'intro_1',
      x: (px + ex) * 0.5,
      z: (pz + ez) * 0.5,
      zoom: 58,
      durationSec: 2.6,
      caption: `${doc.title} — ${doc.description || 'Prepare seu exército para a batalha.'}`,
    },
    {
      id: 'intro_2',
      x: px,
      z: pz,
      zoom: 42,
      durationSec: 2.4,
      caption: primary ? `Objetivo: ${primary.title} — ${primary.description}` : 'Suas forças aguardam suas ordens.',
    },
  ];
}
