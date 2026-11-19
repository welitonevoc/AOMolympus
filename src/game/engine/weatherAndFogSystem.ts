import * as THREE from 'three';
import { getMapBiomeVisuals } from '../../maps';
import { MapId, TeamId, TechId, UnitKind, UnitStats } from '../types';
import {
  BuildingEntity,
  FaunaEntity,
  MINIMAP_FOG_SIZE,
  RelicEntity,
  ResourceNodeEntity,
  SettlementEntity,
  UnitEntity,
} from './engineTypes';

export type WeatherKind = 'clear' | 'rain' | 'snow' | 'sandstorm';

export interface FogAndWeatherContext {
  scene: THREE.Scene;
  mapId: MapId;
  revealedMap: boolean;
  fogMesh: THREE.Mesh | null;
  fogTex: THREE.DataTexture | null;
  fogGridSize: number;
  fogState: Uint8Array;
  fogDisplay: Float32Array;
  fogTexData: Uint8Array;
  minimapFogCache: number[] | Uint8Array;
  fogUpdateTimer: number;
  setFogUpdateTimer: (val: number) => void;
  units: Map<string, UnitEntity>;
  buildings: Map<string, BuildingEntity>;
  nodes: Map<string, ResourceNodeEntity>;
  settlements: Map<string, SettlementEntity>;
  relics: Map<string, RelicEntity>;
  fauna: Map<string, FaunaEntity>;
  researchedTechs: TechId[];
  unitStats: (kind: UnitKind, team: TeamId) => UnitStats;
  isWorldVisible: (x: number, z: number) => boolean;
  isWorldExplored: (x: number, z: number) => boolean;
  revealFogCircle: (wx: number, wz: number, radius: number) => void;
  currentWeather: WeatherKind;
  setCurrentWeather: (w: WeatherKind) => void;
  weatherParticles: THREE.Points | null;
  setWeatherParticles: (pts: THREE.Points | null) => void;
  weatherTimer: number;
  setWeatherTimer: (val: number) => void;
  notifyStatus: (msg: string) => void;
}

export function syncMinimapFogCache(ctx: FogAndWeatherContext): void {
  const ratio = ctx.fogGridSize / MINIMAP_FOG_SIZE;
  for (let my = 0; my < MINIMAP_FOG_SIZE; my++) {
    const gy0 = Math.floor(my * ratio);
    const gy1 = Math.min(ctx.fogGridSize - 1, Math.floor((my + 1) * ratio) - 1);
    for (let mx = 0; mx < MINIMAP_FOG_SIZE; mx++) {
      const gx0 = Math.floor(mx * ratio);
      const gx1 = Math.min(ctx.fogGridSize - 1, Math.floor((mx + 1) * ratio) - 1);
      let best = 0;
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const v = ctx.fogState[gy * ctx.fogGridSize + gx];
          if (v > best) best = v;
        }
      }
      ctx.minimapFogCache[my * MINIMAP_FOG_SIZE + mx] = best;
    }
  }
}

export function applyEntityFogVisibility(ctx: FogAndWeatherContext): void {
  for (const u of ctx.units.values()) {
    if (u.team === 'player') {
      u.mesh.visible = true;
    } else {
      const vis = ctx.isWorldVisible(u.mesh.position.x, u.mesh.position.z);
      u.mesh.visible = vis;
      if (!vis) u.selected = false;
    }
  }
  for (const b of ctx.buildings.values()) {
    if (b.team === 'player') {
      b.mesh.visible = true;
    } else {
      const exp = ctx.isWorldExplored(b.mesh.position.x, b.mesh.position.z);
      b.mesh.visible = exp;
      if (!exp) b.selected = false;
    }
  }
  for (const n of ctx.nodes.values()) {
    const exp = ctx.isWorldExplored(n.mesh.position.x, n.mesh.position.z);
    n.mesh.visible = exp;
    if (!exp) n.selected = false;
  }
  for (const s of ctx.settlements.values()) {
    const exp = ctx.isWorldExplored(s.mesh.position.x, s.mesh.position.z);
    s.mesh.visible = exp;
    if (!exp) s.selected = false;
  }
  for (const r of ctx.relics.values()) {
    if (r.claimedByTeam !== null) {
      r.mesh.visible = false;
      r.selected = false;
    } else {
      const exp = ctx.isWorldExplored(r.mesh.position.x, r.mesh.position.z);
      r.mesh.visible = exp;
      if (!exp) r.selected = false;
    }
  }
  for (const f of ctx.fauna.values()) {
    const vis = ctx.isWorldExplored(f.mesh.position.x, f.mesh.position.z);
    f.mesh.visible = vis;
    if (!vis) f.selected = false;
  }
}

export function updateFogOfWar(ctx: FogAndWeatherContext, dt: number, immediate = false): void {
  if (ctx.revealedMap) {
    if (ctx.fogMesh) ctx.fogMesh.visible = false;
    return;
  }
  if (ctx.fogMesh) ctx.fogMesh.visible = true;

  const nextTimer = ctx.fogUpdateTimer + dt;
  ctx.setFogUpdateTimer(nextTimer);
  if (!immediate && nextTimer < 0.08) return;
  const stepDt = immediate ? 1 : Math.min(0.25, nextTimer);
  ctx.setFogUpdateTimer(0);

  for (let i = 0; i < ctx.fogState.length; i++) {
    if (ctx.fogState[i] === 2) ctx.fogState[i] = 1;
  }

  for (const u of ctx.units.values()) {
    if (u.team === 'player') {
      let sight =
        ctx.unitStats(u.kind, 'player').los ??
        (u.kind === 'archer' || u.kind === 'centaur' ? 16 : 14);
      if (u.kind === 'oracle') {
        if (ctx.researchedTechs.includes('perception')) sight += 4;
        if (u.state === 'idle') sight += 10;
      }
      ctx.revealFogCircle(u.mesh.position.x, u.mesh.position.z, sight);
    }
  }
  for (const b of ctx.buildings.values()) {
    if (b.team === 'player') {
      const sight =
        b.kind === 'lighthouse'
          ? 52
          : b.kind === 'obelisk'
            ? 32
            : b.kind === 'wonder'
              ? 28
              : b.kind === 'mirror_tower'
                ? 24
                : b.kind === 'town_center' ||
                    b.kind === 'tower' ||
                    b.kind === 'fortress' ||
                    b.kind === 'asgard_hill_fort'
                  ? 22
                  : b.kind === 'village_center'
                    ? 20
                    : 16;
      ctx.revealFogCircle(b.mesh.position.x, b.mesh.position.z, sight);
    }
  }
  for (const f of ctx.fauna.values()) {
    if (f.ownerTeam === 'player' && !f.isCarcass) {
      ctx.revealFogCircle(f.mesh.position.x, f.mesh.position.z, 11);
    }
  }

  const lerpRate = immediate ? 1 : Math.min(1, stepDt * 9);
  for (let i = 0; i < ctx.fogState.length; i++) {
    const target = ctx.fogState[i];
    const cur = ctx.fogDisplay[i];
    const next = immediate ? target : cur + (target - cur) * lerpRate;
    ctx.fogDisplay[i] = next;

    let alpha = 0;
    if (next <= 1) {
      alpha = Math.round(246 - next * (246 - 132));
    } else {
      alpha = Math.round(132 * Math.max(0, 2 - next));
    }

    const off = i * 4;
    ctx.fogTexData[off] = 6;
    ctx.fogTexData[off + 1] = 9;
    ctx.fogTexData[off + 2] = 16;
    ctx.fogTexData[off + 3] = alpha;
  }

  if (ctx.fogTex) {
    ctx.fogTex.needsUpdate = true;
  }
  applyEntityFogVisibility(ctx);
  syncMinimapFogCache(ctx);
}

export function setWeather(ctx: FogAndWeatherContext, weather: WeatherKind): void {
  ctx.setCurrentWeather(weather);
  if (ctx.weatherParticles) {
    ctx.scene.remove(ctx.weatherParticles);
    ctx.weatherParticles.geometry.dispose();
    (ctx.weatherParticles.material as THREE.Material).dispose();
    ctx.setWeatherParticles(null);
  }

  if (weather === 'clear') return;

  const count = 1200;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 160;
    positions[i + 1] = Math.random() * 60;
    positions[i + 2] = (Math.random() - 0.5) * 160;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  let color = 0x93c5fd;
  let size = 0.28;
  let opacity = 0.42;
  if (weather === 'snow') {
    color = 0xe2e8f0;
    size = 0.42;
    opacity = 0.55;
  } else if (weather === 'sandstorm') {
    color = 0xc27832;
    size = 0.52;
    opacity = 0.38;
  }

  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const particles = new THREE.Points(geo, mat);
  particles.renderOrder = 7;
  ctx.scene.add(particles);
  ctx.setWeatherParticles(particles);
}

export function updateWeather(ctx: FogAndWeatherContext, dt: number): void {
  const nextTimer = ctx.weatherTimer + dt;
  ctx.setWeatherTimer(nextTimer);
  if (nextTimer > 95) {
    ctx.setWeatherTimer(0);
    const pool = getMapBiomeVisuals(ctx.mapId).weatherPool;
    const next = (pool[Math.floor(Math.random() * pool.length)] ?? 'clear') as WeatherKind;
    setWeather(ctx, next);
    const labels: Record<WeatherKind, string> = {
      clear: 'Céu Limpo',
      rain: 'Chuva Intensa',
      snow: 'Nevasca Fria',
      sandstorm: 'Tempestade de Areia',
    };
    ctx.notifyStatus(`Sistema Climático: ${labels[next]}`);
  }

  if (ctx.weatherParticles) {
    const posAttr = ctx.weatherParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const speedY = ctx.currentWeather === 'rain' ? 38 : ctx.currentWeather === 'snow' ? 9 : 16;
    const speedX = ctx.currentWeather === 'sandstorm' ? 14 : 2;

    for (let i = 1; i < arr.length; i += 3) {
      arr[i] -= speedY * dt;
      arr[i - 1] += speedX * dt;
      if (arr[i] < 0) {
        arr[i] = 60;
        arr[i - 1] = (Math.random() - 0.5) * 160;
      }
      if (arr[i - 1] > 80) arr[i - 1] = -80;
    }
    posAttr.needsUpdate = true;
  }
}
