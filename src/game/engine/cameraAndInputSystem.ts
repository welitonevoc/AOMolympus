import * as THREE from 'three';
import { soundEngine } from '../audio';
import {
  BuildingKind,
  FormationId,
  GameHudSnapshot,
  GodPowerId,
  UnitVoiceAction,
} from '../types';
import {
  BuildingEntity,
  FaunaEntity,
  MIN_CAM_DISTANCE,
  RelicEntity,
  ResourceNodeEntity,
  SettlementEntity,
  UnitEntity,
} from './engineTypes';

export interface CameraAndInputContext {
  phase: GameHudSnapshot['phase'];
  container: HTMLElement;
  playableHalfSize: number;
  maxCamDistance: number;
  cameraSensitivity: number;
  projectionMode: '2.5d' | '3d';
  perspCamera: THREE.PerspectiveCamera;
  orthoCamera: THREE.OrthographicCamera;
  keysDown: Set<string>;
  camTarget: THREE.Vector3;
  camDesiredTarget: THREE.Vector3;
  camYaw: number;
  camDesiredYaw: number;
  camDistance: number;
  camDesiredDistance: number;
  camShakeTimer: number;
  camShakeIntensity: number;
  followSelectedHoplite: boolean;
  formation: FormationId;
  activeBuildMode: BuildingKind | null;
  activeGodPowerMode: GodPowerId | null;
  controlGroups: Map<number, string[]>;
  lastControlGroupKey: number;
  lastControlGroupTime: number;
  units: Map<string, UnitEntity>;
  buildings: Map<string, BuildingEntity>;
  nodes: Map<string, ResourceNodeEntity>;
  settlements: Map<string, SettlementEntity>;
  relics: Map<string, RelicEntity>;
  fauna: Map<string, FaunaEntity>;

  setCameraState: (patch: {
    camYaw?: number;
    camDesiredYaw?: number;
    camDistance?: number;
    camDesiredDistance?: number;
    camShakeTimer?: number;
    followSelectedHoplite?: boolean;
    activeCamera?: THREE.Camera;
    lastControlGroupKey?: number;
    lastControlGroupTime?: number;
  }) => void;

  getGroundPointFromEvent: (clientX: number, clientY: number) => THREE.Vector3 | null;
  jumpCameraTo: (x: number, z: number) => void;
  zoomCameraBy: (delta: number) => void;
  centerCameraOnBase: () => void;
  cancelModes: () => void;
  togglePause: () => void;
  setFormation: (f: FormationId) => void;
  toggleAutoScout: () => void;
  triggerSelectedMythSpecial: () => void;
  toggleTownBell: () => void;
  selectIdleVillager: () => void;
  selectIdleMilitary: () => void;
  isNonCombatEconUnit: (u: UnitEntity) => boolean;
  triggerSelectedHopliteAttack: () => void;
  triggerUnitVoice: (units: UnitEntity[], action: UnitVoiceAction) => void;
  notifyStatus: (msg: string) => void;
  emitHudSnapshot: () => void;
}

export function assignControlGroup(ctx: CameraAndInputContext, group: number): void {
  if (group < 1 || group > 9 || ctx.phase !== 'playing') return;
  const selectedIds = [...ctx.units.values()]
    .filter((u) => u.team === 'player' && u.selected && u.hp > 0)
    .map((u) => u.id);
  if (selectedIds.length === 0) {
    ctx.controlGroups.delete(group);
    ctx.emitHudSnapshot();
    return;
  }
  ctx.controlGroups.set(group, selectedIds);
  soundEngine.playSelect();
  ctx.notifyStatus(`Grupo ${group} definido (${selectedIds.length} unidade(s)).`);
  ctx.emitHudSnapshot();
}

export function selectControlGroup(
  ctx: CameraAndInputContext,
  group: number,
  forceFocus = false,
): void {
  if (group < 1 || group > 9 || ctx.phase !== 'playing') return;
  const rawIds = ctx.controlGroups.get(group) ?? [];
  const aliveUnits = rawIds
    .map((id) => ctx.units.get(id))
    .filter((u): u is UnitEntity => Boolean(u && u.team === 'player' && u.hp > 0 && u.state !== 'garrisoned'));
  ctx.controlGroups.set(
    group,
    aliveUnits.map((u) => u.id),
  );
  if (aliveUnits.length === 0) {
    ctx.notifyStatus(`Grupo ${group} está vazio.`);
    ctx.emitHudSnapshot();
    return;
  }
  for (const u of ctx.units.values()) u.selected = false;
  for (const b of ctx.buildings.values()) b.selected = false;
  for (const n of ctx.nodes.values()) n.selected = false;
  for (const s of ctx.settlements.values()) s.selected = false;
  for (const r of ctx.relics.values()) r.selected = false;
  for (const f of ctx.fauna.values()) f.selected = false;

  let sumX = 0;
  let sumZ = 0;
  for (const u of aliveUnits) {
    u.selected = true;
    sumX += u.mesh.position.x;
    sumZ += u.mesh.position.z;
  }
  const now = performance.now();
  const isDoubleTap = ctx.lastControlGroupKey === group && now - ctx.lastControlGroupTime < 380;
  ctx.setCameraState({ lastControlGroupKey: group, lastControlGroupTime: now });
  if (forceFocus || isDoubleTap) {
    ctx.jumpCameraTo(sumX / aliveUnits.length, sumZ / aliveUnits.length);
  }
  ctx.triggerUnitVoice(aliveUnits, 'select');
  ctx.emitHudSnapshot();
}

export function handleWheelZoom(ctx: CameraAndInputContext, e: WheelEvent): void {
  e.preventDefault();
  const prevDist = ctx.camDesiredDistance;
  const nextDist = THREE.MathUtils.clamp(prevDist + e.deltaY * 0.036, MIN_CAM_DISTANCE, ctx.maxCamDistance);
  ctx.setCameraState({ camDesiredDistance: nextDist });

  if (nextDist < prevDist && ctx.phase === 'playing') {
    const pt = ctx.getGroundPointFromEvent(e.clientX, e.clientY);
    if (pt) {
      const pull = Math.min(0.24, ((prevDist - nextDist) / prevDist) * 0.7);
      ctx.camDesiredTarget.x = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(ctx.camDesiredTarget.x, pt.x, pull),
        -ctx.playableHalfSize,
        ctx.playableHalfSize,
      );
      ctx.camDesiredTarget.z = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(ctx.camDesiredTarget.z, pt.z, pull),
        -ctx.playableHalfSize,
        ctx.playableHalfSize,
      );
    }
  }
}

export function handleKeyDownShortcut(ctx: CameraAndInputContext, e: KeyboardEvent): void {
  const activeEl = document.activeElement as HTMLElement | null;
  if (
    activeEl &&
    (activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.tagName === 'SELECT' ||
      activeEl.isContentEditable)
  ) {
    return;
  }
  ctx.keysDown.add(e.code);
  if (e.code === 'Escape') {
    if (ctx.activeBuildMode || ctx.activeGodPowerMode) {
      ctx.cancelModes();
    } else if (ctx.phase === 'playing' || ctx.phase === 'paused') {
      ctx.togglePause();
    }
  } else if (ctx.phase === 'playing') {
    if (e.code === 'Equal' || e.code === 'NumpadAdd') {
      ctx.zoomCameraBy(-6);
    } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
      ctx.zoomCameraBy(6);
    } else if (e.code === 'Home') {
      ctx.centerCameraOnBase();
    } else if (e.code === 'KeyF') {
      const order: FormationId[] = ['box', 'line', 'staggered', 'phalanx', 'wedge'];
      const next = order[(order.indexOf(ctx.formation) + 1) % order.length];
      ctx.setFormation(next);
    } else if (e.code === 'KeyZ') {
      ctx.toggleAutoScout();
    } else if (e.code === 'KeyQ') {
      ctx.triggerSelectedMythSpecial();
    } else if (e.code === 'KeyB') {
      ctx.toggleTownBell();
    } else if (/^Digit[1-9]$/.test(e.code)) {
      const groupNum = Number(e.code.replace('Digit', ''));
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        assignControlGroup(ctx, groupNum);
      } else {
        selectControlGroup(ctx, groupNum);
      }
    } else if (e.code === 'Period') {
      ctx.selectIdleVillager();
    } else if (e.code === 'Comma') {
      ctx.selectIdleMilitary();
    } else if (e.code === 'Space') {
      const hasSelectedCombat = [...ctx.units.values()].some(
        (u) => u.team === 'player' && u.selected && (!ctx.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero)),
      );
      if (hasSelectedCombat) {
        e.preventDefault();
        ctx.triggerSelectedHopliteAttack();
      }
    }
  }
}

export function updateCameraTransform(ctx: CameraAndInputContext, dt: number): void {
  const zoomT = THREE.MathUtils.clamp(
    (ctx.camDistance - MIN_CAM_DISTANCE) / (ctx.maxCamDistance - MIN_CAM_DISTANCE),
    0,
    1,
  );
  const panSpeed = THREE.MathUtils.lerp(22, 46, zoomT) * ctx.cameraSensitivity;
  let moveForward = 0;
  let moveRight = 0;
  if (ctx.keysDown.has('KeyW') || ctx.keysDown.has('ArrowUp')) moveForward += 1;
  if (ctx.keysDown.has('KeyS') || ctx.keysDown.has('ArrowDown')) moveForward -= 1;
  if (ctx.keysDown.has('KeyD') || ctx.keysDown.has('ArrowRight')) moveRight += 1;
  if (ctx.keysDown.has('KeyA') || ctx.keysDown.has('ArrowLeft')) moveRight -= 1;

  let nextDesiredYaw = ctx.camDesiredYaw;
  if (ctx.keysDown.has('KeyQ')) nextDesiredYaw += 1.4 * dt;
  if (ctx.keysDown.has('KeyE')) nextDesiredYaw -= 1.4 * dt;

  let nextFollow = ctx.followSelectedHoplite;
  if (moveForward !== 0 || moveRight !== 0) {
    nextFollow = false;
    const fx = -Math.sin(ctx.camYaw);
    const fz = -Math.cos(ctx.camYaw);
    const rx = Math.cos(ctx.camYaw);
    const rz = -Math.sin(ctx.camYaw);
    ctx.camDesiredTarget.x += (fx * moveForward + rx * moveRight) * panSpeed * dt;
    ctx.camDesiredTarget.z += (fz * moveForward + rz * moveRight) * panSpeed * dt;
    ctx.camDesiredTarget.x = THREE.MathUtils.clamp(
      ctx.camDesiredTarget.x,
      -ctx.playableHalfSize,
      ctx.playableHalfSize,
    );
    ctx.camDesiredTarget.z = THREE.MathUtils.clamp(
      ctx.camDesiredTarget.z,
      -ctx.playableHalfSize,
      ctx.playableHalfSize,
    );
  } else if (nextFollow) {
    const tracked = [...ctx.units.values()].find(
      (u) => u.team === 'player' && u.selected && u.kind === 'hoplite',
    );
    if (tracked) {
      ctx.camDesiredTarget.x = tracked.mesh.position.x;
      ctx.camDesiredTarget.z = tracked.mesh.position.z;
    } else {
      nextFollow = false;
    }
  }

  const dampK = Math.min(1, 1 - Math.exp(-10 * dt));
  ctx.camTarget.lerp(ctx.camDesiredTarget, dampK);
  const nextYaw = THREE.MathUtils.lerp(ctx.camYaw, nextDesiredYaw, dampK);
  const nextDistance = THREE.MathUtils.lerp(ctx.camDistance, ctx.camDesiredDistance, dampK);

  let shakeX = 0;
  let shakeZ = 0;
  let nextShakeTimer = ctx.camShakeTimer;
  if (nextShakeTimer > 0) {
    nextShakeTimer = Math.max(0, nextShakeTimer - dt);
    shakeX = (Math.random() - 0.5) * 2 * ctx.camShakeIntensity;
    shakeZ = (Math.random() - 0.5) * 2 * ctx.camShakeIntensity;
  }

  let activeCamera: THREE.Camera;
  if (ctx.projectionMode === '2.5d') {
    const w = ctx.container.clientWidth || window.innerWidth;
    const h = Math.max(1, ctx.container.clientHeight || window.innerHeight);
    const aspect = w / h;
    const frustumSize = THREE.MathUtils.lerp(18, 58, zoomT);
    ctx.orthoCamera.left = (-frustumSize * aspect) / 2;
    ctx.orthoCamera.right = (frustumSize * aspect) / 2;
    ctx.orthoCamera.top = frustumSize / 2;
    ctx.orthoCamera.bottom = -frustumSize / 2;
    ctx.orthoCamera.updateProjectionMatrix();

    const isoDist = 80;
    const isoElev = isoDist * 0.707;
    const isoHoriz = isoDist * 0.707;

    ctx.orthoCamera.position.set(
      ctx.camTarget.x + Math.sin(nextYaw) * isoHoriz + shakeX,
      ctx.camTarget.y + isoElev,
      ctx.camTarget.z + Math.cos(nextYaw) * isoHoriz + shakeZ,
    );
    ctx.orthoCamera.lookAt(
      ctx.camTarget.x + shakeX * 0.5,
      ctx.camTarget.y + 0.5,
      ctx.camTarget.z + shakeZ * 0.5,
    );
    activeCamera = ctx.orthoCamera;
  } else {
    const elevFactor = THREE.MathUtils.lerp(0.54, 0.94, zoomT);
    const horizFactor = THREE.MathUtils.lerp(0.84, 0.58, zoomT);
    const elev = nextDistance * elevFactor;
    const horiz = nextDistance * horizFactor;

    ctx.perspCamera.position.set(
      ctx.camTarget.x + Math.sin(nextYaw) * horiz + shakeX,
      ctx.camTarget.y + elev,
      ctx.camTarget.z + Math.cos(nextYaw) * horiz + shakeZ,
    );
    ctx.perspCamera.lookAt(
      ctx.camTarget.x + shakeX * 0.5,
      ctx.camTarget.y + 0.8,
      ctx.camTarget.z + shakeZ * 0.5,
    );
    activeCamera = ctx.perspCamera;
  }

  ctx.setCameraState({
    camYaw: nextYaw,
    camDesiredYaw: nextDesiredYaw,
    camDistance: nextDistance,
    camShakeTimer: nextShakeTimer,
    followSelectedHoplite: nextFollow,
    activeCamera,
  });
}
