import * as THREE from 'three';
import { BuildingKind, PantheonId, TeamId } from '../../game/types';
import type { MaterialPalette } from '../../game/models';
import { buildProceduralEgyptianTemple } from './egyptianTempleModel';
import {
  buildEgyptianArchBuilding,
  resolveEgyptianArchGod,
} from './egyptianArchitectureSuite';
import { buildProceduralEgyptianTownCenter } from './egyptianTownCenterModel';

// ─── Procedural Egyptian Sandstone, Hieroglyph, Lapis & Gold Textures ───────

const egyptBldgTexCache = new Map<string, THREE.CanvasTexture>();

function makeEgyptBldgTex(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const existing = egyptBldgTexCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  egyptBldgTexCache.set(key, tex);
  return tex;
}

export function getEgyptianSandstoneTex(): THREE.CanvasTexture {
  return makeEgyptBldgTex('egypt_sandstone_v2', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#e5c07b';
    ctx.fillRect(0, 0, w, h);
    // Ashlar sandstone block courses with weathered shading
    const rows = 10;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = (r % 2) * -32;
      while (x < w) {
        const bw = 48 + ((r * 17 + Math.floor(x)) % 36);
        const shadeVar = ((r * 11 + Math.floor(x)) % 6) * 7;
        ctx.fillStyle = `rgb(${229 + shadeVar}, ${192 - shadeVar}, ${123 - shadeVar})`;
        ctx.fillRect(x + 2, r * rh + 2, bw - 4, rh - 4);
        ctx.strokeStyle = '#a67c37';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, r * rh + 2, bw - 4, rh - 4);
        x += bw;
      }
    }
  });
}

export function getHieroglyphFriezeTex(): THREE.CanvasTexture {
  return makeEgyptBldgTex('egypt_hieroglyph_trim_v2', 256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#1b140f';
    ctx.fillRect(0, 0, w, h);
    // Gold top and bottom sacred borders
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, w, 6);
    ctx.fillRect(0, h - 6, w, 6);
    // Detailed Hieroglyphs (Ankh, Eye of Horus, Djed pillar, Scarab, Lotus)
    ctx.fillStyle = '#fbbf24';
    for (let x = 16; x < w; x += 32) {
      ctx.fillRect(x - 4, 12, 8, 40);
      ctx.fillRect(x - 12, 22, 24, 8);
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(x - 2, 18, 4, 28);
      ctx.fillStyle = '#fbbf24';
    }
  });
}

// ─── Egyptian Architectural Materials & Palettes ─────────────────────────────

interface EgyptianMaterials {
  sandstone: THREE.MeshStandardMaterial;
  sandstoneDark: THREE.MeshStandardMaterial;
  goldTrim: THREE.MeshStandardMaterial;
  turquoise: THREE.MeshStandardMaterial;
  lapisRoof: THREE.MeshStandardMaterial;
  hieroglyphTrim: THREE.MeshStandardMaterial;
  ivoryStone: THREE.MeshStandardMaterial;
  timberWood: THREE.MeshStandardMaterial;
  teamBanner: THREE.MeshStandardMaterial;
  goldSolar: THREE.MeshStandardMaterial;
  emberGlow: THREE.MeshStandardMaterial;
  beaconGlow: THREE.MeshStandardMaterial;
  relicGold: THREE.MeshStandardMaterial;
}

function createEgyptianMaterials(team: TeamId, pal: MaterialPalette): EgyptianMaterials {
  const isPlayer = team === 'player';
  const primaryTeamHex = isPlayer ? 0x2563eb : 0xdc2626;

  return {
    sandstone: new THREE.MeshStandardMaterial({
      color: 0xe5c07b,
      map: getEgyptianSandstoneTex(),
      roughness: 0.82,
    }),
    sandstoneDark: new THREE.MeshStandardMaterial({
      color: 0x9c723b,
      roughness: 0.88,
    }),
    goldTrim: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.18,
      metalness: 0.95,
    }),
    turquoise: new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.32,
      metalness: 0.3,
    }),
    lapisRoof: new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.35,
      metalness: 0.35,
    }),
    hieroglyphTrim: new THREE.MeshStandardMaterial({
      color: 0xd9b372,
      map: getHieroglyphFriezeTex(),
      roughness: 0.65,
    }),
    ivoryStone: new THREE.MeshStandardMaterial({
      color: 0xfaf5e8,
      roughness: 0.58,
    }),
    timberWood: new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.85,
    }),
    teamBanner: new THREE.MeshStandardMaterial({
      color: primaryTeamHex,
      roughness: 0.6,
    }),
    goldSolar: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      roughness: 0.12,
      metalness: 0.96,
    }),
    emberGlow: new THREE.MeshStandardMaterial({
      color: pal.ember.color.clone(),
      emissive: pal.ember.emissive.clone(),
      emissiveIntensity: 0.95,
      roughness: 0.3,
    }),
    beaconGlow: new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0f766e,
      emissiveIntensity: 1.35,
      roughness: 0.18,
    }),
    relicGold: new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.15,
      metalness: 0.98,
    }),
  };
}

// ─── Monumental Detail Builders (Lotus columns, Sphinx, Offering Table, Relic) ──

function buildLotusColumn(height: number, mats: EgyptianMaterials): THREE.Group {
  const col = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, height - 0.35, 10),
    mats.sandstone
  );
  shaft.position.y = (height - 0.35) * 0.5;
  col.add(shaft);

  // Lotus bud/bell capital with turquoise & gold rings
  const capital = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.13, 0.38, 10),
    mats.turquoise
  );
  capital.position.y = height - 0.19;
  col.add(capital);

  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.27, 0.08, 10),
    mats.goldTrim
  );
  ring.position.y = height - 0.32;
  col.add(ring);
  return col;
}



function buildCanopicRelicShrine(mats: EgyptianMaterials): THREE.Group {
  const rel = new THREE.Group();
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.42), mats.sandstoneDark);
  pedestal.position.y = 0.14;
  rel.add(pedestal);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), mats.relicGold);
  chest.position.y = 0.38;
  rel.add(chest);

  const anubisTop = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 6), mats.goldTrim);
  anubisTop.position.y = 0.66;
  rel.add(anubisTop);
  return rel;
}

// ─── 1. TOWN CENTER: Delegado ao modelo procedural T1–T5 (egyptianTownCenterModel.ts) ───


// ─── 2. MIGDAL BARRACKS (Quartel Egípcio / Migdal Fortress) ──────────────────

function buildEgyptianBarracks(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.35, 3.4),
    mats.sandstoneDark
  );
  base.position.y = 0.175;
  group.add(base);

  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 2.4, 2.6),
    mats.sandstone
  );
  tower.position.set(0, 0.35 + 1.2, 0);
  group.add(tower);

  // Battlements & defensive corner shields
  for (let x = -1.3; x <= 1.3; x += 0.85) {
    for (const z of [-1.25, 1.25]) {
      const merlon = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.45, 0.28),
        mats.sandstoneDark
      );
      merlon.position.set(x, 0.35 + 2.4 + 0.225, z);
      group.add(merlon);
    }
  }

  const emblem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.09, 12),
    mats.goldTrim
  );
  emblem.rotation.x = Math.PI / 2;
  emblem.position.set(0, 1.5, 1.35);
  group.add(emblem);

  // Khopesh & Spear Rack in front courtyard
  const rackBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.18, 0.45),
    mats.timberWood
  );
  rackBase.position.set(0, 0.42, 1.65);
  group.add(rackBase);

  for (const sx of [-0.4, 0, 0.4]) {
    const spear = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 1.9, 6),
      mats.goldTrim
    );
    spear.position.set(sx, 1.35, 1.65);
    group.add(spear);
  }
}

// ─── 3. GRAND TEMPLE OF RA / ISIS (Templo Sagrado Egípcio) ───────────────────

function buildEgyptianTemple(
  group: THREE.Group,
  _mats: EgyptianMaterials,
  age: number = 1,
  godKey: string = 'ra'
): { beaconCrystal: THREE.Object3D } {
  return buildProceduralEgyptianTemple(group, age, godKey);
}

// ─── 4. FORTRESS (Migdal Citadel / Fortaleza) ───────────────────────────────

function buildEgyptianFortress(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.48, 5.0),
    mats.sandstoneDark
  );
  base.position.y = 0.24;
  group.add(base);

  const keep = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 3.0, 3.4),
    mats.sandstone
  );
  keep.position.set(0, 0.48 + 1.5, 0);
  group.add(keep);

  // Four corner bastions with gold caps & catapult platforms
  for (const [bx, bz] of [
    [-1.9, -1.9],
    [1.9, -1.9],
    [-1.9, 1.9],
    [1.9, 1.9],
  ]) {
    const bastion = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 3.6, 1.2),
      mats.sandstoneDark
    );
    bastion.position.set(bx, 0.48 + 1.8, bz);
    group.add(bastion);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.32, 1.3),
      mats.goldTrim
    );
    cap.position.set(bx, 0.48 + 3.76, bz);
    group.add(cap);
  }
}

// ─── 5. OTHER EGYPTIAN BUILDINGS (House, Armory, Siege, Market, Tower, Farm, Titan Gate) ──

function buildEgyptianHouse(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 1.5), mats.sandstoneDark);
  base.position.y = 0.1;
  group.add(base);

  const walls = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.05, 1.25), mats.sandstone);
  walls.position.y = 0.625;
  group.add(walls);

  const flatRoof = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.14, 1.35), mats.turquoise);
  flatRoof.position.y = 1.22;
  group.add(flatRoof);

  // Small storage jar and palm mat in front
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.32, 8), mats.sandstoneDark);
  jar.position.set(0.5, 0.32, 0.75);
  group.add(jar);
}

function buildEgyptianArmory(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.28, 2.6), mats.sandstoneDark);
  base.position.y = 0.14;
  group.add(base);

  const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.7, 2.0), mats.sandstone);
  hall.position.y = 1.12;
  group.add(hall);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.2, 2.15), mats.goldTrim);
  roof.position.y = 2.07;
  group.add(roof);

  const relic = buildCanopicRelicShrine(mats);
  relic.position.set(-0.8, 0.28, 0.9);
  relic.scale.setScalar(0.7);
  group.add(relic);
}

function buildEgyptianTower(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 0.55, 8), mats.sandstoneDark);
  base.position.y = 0.275;
  group.add(base);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 3.4, 8), mats.sandstone);
  shaft.position.y = 2.25;
  group.add(shaft);

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.9, 0.45, 8), mats.goldTrim);
  platform.position.y = 4.15;
  group.add(platform);

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), mats.emberGlow);
  beacon.position.y = 4.55;
  group.add(beacon);
}

function buildEgyptianMarket(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 2.4), mats.sandstoneDark);
  base.position.y = 0.11;
  group.add(base);

  for (const cx of [-0.9, 0.9]) {
    for (const cz of [-0.7, 0.7]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 1.7, 6), mats.timberWood);
      col.position.set(cx, 0.96, cz);
      group.add(col);
    }
  }

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 2.0), mats.turquoise);
  canopy.position.y = 1.88;
  group.add(canopy);

  const relic = buildCanopicRelicShrine(mats);
  relic.position.set(0, 0.22, 0);
  relic.scale.setScalar(0.75);
  group.add(relic);
}

function buildEgyptianSiegeWorks(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.24, 2.7), mats.sandstoneDark);
  base.position.y = 0.12;
  group.add(base);

  const shed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 2.2), mats.sandstone);
  shed.position.y = 0.99;
  group.add(shed);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.16, 2.35), mats.timberWood);
  roof.position.y = 1.83;
  group.add(roof);
}

function buildEgyptianFarm(group: THREE.Group, mats: EgyptianMaterials): void {
  const soil = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 2.6), mats.sandstoneDark);
  soil.position.y = 0.04;
  group.add(soil);

  // Irrigated Nile water channel down the middle
  const channel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 2.4), mats.turquoise);
  channel.position.y = 0.05;
  group.add(channel);

  for (let r = -2; r <= 2; r++) {
    if (r === 0) continue;
    const crop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.28), mats.goldSolar);
    crop.position.set(0.7, 0.14, r * 0.45);
    group.add(crop);
    const crop2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.28), mats.goldSolar);
    crop2.position.set(-0.7, 0.14, r * 0.45);
    group.add(crop2);
  }
}

function buildEgyptianTitanGate(group: THREE.Group, mats: EgyptianMaterials): { beaconCrystal: THREE.Object3D; vortexRing: THREE.Object3D } {
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.1, 0.55, 12), mats.sandstoneDark);
  plinth.position.y = 0.275;
  group.add(plinth);

  // Circle of 8 golden obelisks guarding the Titan Gate
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.38, 3.0, 4), mats.goldTrim);
    obelisk.position.set(Math.cos(angle) * 1.95, 1.75, Math.sin(angle) * 1.95);
    group.add(obelisk);
  }

  const vortexRing = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.15, 12, 32), mats.beaconGlow);
  vortexRing.rotation.x = Math.PI / 2;
  vortexRing.position.y = 1.35;
  group.add(vortexRing);

  const beaconCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 1), mats.goldSolar);
  beaconCrystal.position.y = 2.6;
  group.add(beaconCrystal);

  return { beaconCrystal, vortexRing };
}

// ─── Main Export: Egyptian Building Dispatcher ───────────────────────────────

export interface EgyptianBuildingBuildResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function createEgyptianBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows = true,
  age = 1,
  pantheon: PantheonId = 'egyptian',
  majorGod?: string
): EgyptianBuildingBuildResult {
  const group = new THREE.Group();
  const mats = createEgyptianMaterials(team, pal);

  let markerRadius = 1.5;
  let barHeight = 2.8;
  let barWidth = 1.7;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  switch (kind) {
    case 'town_center': {
      const effGod = resolveEgyptianArchGod(majorGod || String(pantheon || 'ra'));
      const res = buildProceduralEgyptianTownCenter(group, age, effGod, enableShadows);
      metropolisHalo = res.metropolisHalo;
      metropolisCrystal = res.metropolisCrystal;
      if (res.flames && res.flames.length > 0) {
        group.userData.tcFlames = res.flames;
        group.userData.egyptArchFlames = res.flames;
      }
      group.scale.setScalar(1.0 + (age - 1) * 0.055);
      markerRadius = 3.6 + (age - 1) * 0.22;
      barHeight = 3.8 + (age - 1) * 0.55;
      barWidth = 3.2 + (age - 1) * 0.15;
      break;
    }
    case 'barracks':
    case 'archery_range':
    case 'stable':
    case 'house':
    case 'armory':
    case 'market': {
      const effGod = resolveEgyptianArchGod(majorGod || String(pantheon || 'ra'));
      const built = buildEgyptianArchBuilding(kind, effGod, age, enableShadows, mats.teamBanner);
      group.add(built.root);
      group.scale.setScalar(built.meta.gameplayScale);
      if (built.flames.length > 0) {
        group.userData.egyptArchFlames = built.flames;
      }
      const tierScaleBonus = (built.effectiveTier - built.meta.minTier) * 0.1;
      markerRadius = built.meta.markerRadius * (1 + tierScaleBonus * 0.55);
      barHeight = built.meta.barHeight * (1 + tierScaleBonus * 0.45);
      barWidth = built.meta.barWidth * (1 + tierScaleBonus * 0.25);
      break;
    }
    case 'temple': {
      const effGod = resolveEgyptianArchGod(majorGod || String(pantheon || 'ra'));
      const res = buildEgyptianTemple(group, mats, age, effGod);
      beaconCrystal = res.beaconCrystal;
      group.scale.setScalar(1.2 + (age - 1) * 0.08);
      markerRadius = 2.6 + (age - 1) * 0.15;
      barHeight = 4.4 + (age - 1) * 0.3;
      barWidth = 2.6 + (age - 1) * 0.1;
      break;
    }
    case 'fortress':
      buildEgyptianFortress(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 3.5;
      barHeight = 5.2;
      barWidth = 3.3;
      break;
    case 'siege_works':
      buildEgyptianSiegeWorks(group, mats);
      group.scale.setScalar(1.72);
      markerRadius = 2.75;
      barHeight = 4.2;
      barWidth = 2.6;
      break;
    case 'tower':
      buildEgyptianTower(group, mats);
      group.scale.setScalar(1.88);
      markerRadius = 1.55;
      barHeight = 6.4;
      barWidth = 1.85;
      break;
    case 'farm':
      buildEgyptianFarm(group, mats);
      group.scale.setScalar(1.92);
      markerRadius = 2.25;
      barHeight = 2.4;
      barWidth = 2.05;
      break;
    case 'titan_gate': {
      const res = buildEgyptianTitanGate(group, mats);
      beaconCrystal = res.beaconCrystal;
      vortexRing = res.vortexRing;
      group.scale.setScalar(1.68);
      markerRadius = 4.3;
      barHeight = 6.8;
      barWidth = 3.6;
      break;
    }
  }

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = enableShadows;
      child.receiveShadow = enableShadows;
    }
  });

  return {
    group,
    markerRadius,
    barHeight,
    barWidth,
    beaconCrystal,
    vortexRing,
    metropolisHalo,
    metropolisCrystal,
  };
}
