import * as THREE from 'three';
import { BuildingKind, PantheonId, TeamId } from '../../game/types';
import type { MaterialPalette } from '../../game/models';
import { buildAtlanteanFortress as buildProceduralAtlanteanFortress } from './atlanteanFortressModel';
import { buildProceduralAtlanteanTownCenter } from './atlanteanTownCenterModel';

// ─── Procedural Atlantean Obsidian & Orichalcum Textures ─────────────────────

const atlanteanBldgTexCache = new Map<string, THREE.CanvasTexture>();

function makeAtlanteanBldgTex(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const existing = atlanteanBldgTexCache.get(key);
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
  atlanteanBldgTexCache.set(key, tex);
  return tex;
}

export function getAtlanteanObsidianTex(): THREE.CanvasTexture {
  return makeAtlanteanBldgTex('atlantean_obsidian_v2', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1e222b';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i * 50) % h);
      ctx.lineTo(w, (i * 50 + 40) % h);
      ctx.stroke();
    }
  });
}

// ─── Atlantean Materials & Crystal Shrines ──────────────────────────────────

interface AtlanteanMaterials {
  obsidian: THREE.MeshStandardMaterial;
  obsidianDark: THREE.MeshStandardMaterial;
  orichalcum: THREE.MeshStandardMaterial;
  turquoiseDome: THREE.MeshStandardMaterial;
  ivoryStone: THREE.MeshStandardMaterial;
  teamBanner: THREE.MeshStandardMaterial;
  crystalGlow: THREE.MeshStandardMaterial;
  relicGold: THREE.MeshStandardMaterial;
  plasmaEmber: THREE.MeshStandardMaterial;
}

function createAtlanteanMaterials(team: TeamId, _pal: MaterialPalette): AtlanteanMaterials {
  const isPlayer = team === 'player';
  const primaryTeamHex = isPlayer ? 0x2563eb : 0xdc2626;

  return {
    obsidian: new THREE.MeshStandardMaterial({
      color: 0x222530,
      map: getAtlanteanObsidianTex(),
      roughness: 0.4,
      metalness: 0.5,
    }),
    obsidianDark: new THREE.MeshStandardMaterial({
      color: 0x14171f,
      roughness: 0.5,
      metalness: 0.6,
    }),
    orichalcum: new THREE.MeshStandardMaterial({
      color: 0xd98a2b,
      roughness: 0.2,
      metalness: 0.92,
    }),
    turquoiseDome: new THREE.MeshStandardMaterial({
      color: 0x0f9e99,
      roughness: 0.25,
      metalness: 0.35,
    }),
    ivoryStone: new THREE.MeshStandardMaterial({
      color: 0xf5f0e2,
      roughness: 0.55,
    }),
    teamBanner: new THREE.MeshStandardMaterial({
      color: primaryTeamHex,
      roughness: 0.6,
    }),
    crystalGlow: new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x14b8a6,
      emissiveIntensity: 1.4,
      roughness: 0.15,
    }),
    relicGold: new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.15,
      metalness: 0.98,
    }),
    plasmaEmber: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    }),
  };
}

// ─── 1. TOWN CENTER: Delegado ao modelo procedural T1–T5 (atlanteanTownCenterModel.ts) ───


// ─── 2. BARRACKS ────────────────────────────────────────────────────────────

function buildAtlanteanBarracks(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 3.4), mats.obsidianDark);
  base.position.y = 0.16;
  group.add(base);

  const hall = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 2.6), mats.obsidian);
  hall.position.set(0, 0.32 + 1.0, 0);
  group.add(hall);

  const domeRoof = new THREE.Mesh(new THREE.SphereGeometry(1.2, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mats.turquoiseDome);
  domeRoof.position.set(0, 0.32 + 2.0, 0);
  group.add(domeRoof);

  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.3), mats.orichalcum);
  rack.position.set(0, 0.32 + 0.2, 1.35);
  group.add(rack);
  const glyph = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), mats.crystalGlow);
  glyph.position.set(0, 0.32 + 2.9, 0);
  group.add(glyph);
}

// ─── 3. ARCHERY RANGE ───────────────────────────────────────────────────────

function buildAtlanteanArcheryRange(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 3.4), mats.obsidianDark);
  base.position.y = 0.16;
  group.add(base);

  const hall = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.9, 2.4), mats.obsidian);
  hall.position.set(0, 0.32 + 0.95, 0);
  group.add(hall);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.1, 4), mats.turquoiseDome);
  roof.position.set(0, 0.32 + 1.9 + 0.55, 0);
  group.add(roof);

  for (const tx of [-0.9, 0.9]) {
    const target = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 16), mats.crystalGlow);
    target.position.set(tx, 0.32 + 0.8, 1.3);
    group.add(target);
  }
}

// ─── 4. STABLE ──────────────────────────────────────────────────────────────

function buildAtlanteanStable(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.32, 3.4), mats.obsidianDark);
  base.position.y = 0.16;
  group.add(base);

  const barn = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 2.6), mats.obsidian);
  barn.position.set(0, 0.32 + 0.95, 0);
  group.add(barn);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.1, 4), mats.turquoiseDome);
  roof.position.set(0, 0.32 + 1.9 + 0.55, 0);
  group.add(roof);

  const basin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.28, 0.6), mats.orichalcum);
  basin.position.set(0, 0.32 + 0.14, 1.35);
  group.add(basin);
}

// ─── 5. ARMORY ──────────────────────────────────────────────────────────────

function buildAtlanteanArmory(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 3.2), mats.obsidianDark);
  base.position.y = 0.16;
  group.add(base);

  const forge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.4), mats.obsidian);
  forge.position.set(-0.4, 0.32 + 0.9, 0);
  group.add(forge);

  const plasmaChimney = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.2, 8), mats.orichalcum);
  plasmaChimney.position.set(1.1, 0.32 + 1.1, 0);
  group.add(plasmaChimney);

  const plasmaCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), mats.plasmaEmber);
  plasmaCore.position.set(1.1, 0.32 + 0.6, 0);
  group.add(plasmaCore);
}

// ─── 6. SIEGE WORKS ─────────────────────────────────────────────────────────

function buildAtlanteanSiegeWorks(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 3.4), mats.obsidianDark);
  base.position.y = 0.16;
  group.add(base);

  const shed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 2.6), mats.obsidian);
  shed.position.set(0, 0.32 + 0.9, 0);
  group.add(shed);

  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), mats.orichalcum);
  postL.position.set(-1.1, 0.32 + 1.1, 1.1);
  const postR = postL.clone();
  postR.position.x = 1.1;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), mats.orichalcum);
  beam.position.set(0, 0.32 + 2.1, 1.1);
  group.add(postL, postR, beam);
}

// ─── Other Atlantean buildings ──────────────────────────────────────────────

function buildAtlanteanMarket(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 3.2), mats.obsidianDark);
  base.position.y = 0.16;
  group.add(base);
  for (const cx of [-0.9, 0.9]) {
    for (const cz of [-0.7, 0.7]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), mats.orichalcum);
      col.position.set(cx, 0.32 + 0.8, cz);
      group.add(col);
    }
  }
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 2.2), mats.turquoiseDome);
  canopy.position.set(0, 0.32 + 1.68, 0);
  group.add(canopy);
}

function buildAtlanteanTemple(group: THREE.Group, mats: AtlanteanMaterials): { beaconCrystal: THREE.Object3D } {
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 4.6), mats.obsidianDark);
  base.position.y = 0.2;
  group.add(base);
  const sanctuary = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.6, 3.0), mats.ivoryStone);
  sanctuary.position.y = 0.4 + 1.3;
  group.add(sanctuary);
  const beaconCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), mats.crystalGlow);
  beaconCrystal.position.y = 4.4;
  group.add(beaconCrystal);
  return { beaconCrystal };
}

function buildAtlanteanFortress(
  group: THREE.Group,
  _mats: AtlanteanMaterials,
  age: number = 3,
  godKey: string = 'kronos'
): { metropolisHalo?: THREE.Object3D; metropolisCrystal?: THREE.Object3D } {
  const effTier = age >= 4 ? 4 : 3;
  const fortress = buildProceduralAtlanteanFortress(godKey, effTier, true);
  group.add(fortress.root);
  return {
    metropolisHalo: fortress.divineRing,
    metropolisCrystal: fortress.coreCrystal
  };
}

function buildAtlanteanHouse(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 1.4), mats.obsidianDark);
  base.position.y = 0.08;
  group.add(base);
  const walls = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.0, 1.15), mats.ivoryStone);
  walls.position.y = 0.58;
  group.add(walls);
  const roof = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.turquoiseDome);
  roof.position.y = 1.08;
  group.add(roof);
}

function buildAtlanteanTower(group: THREE.Group, mats: AtlanteanMaterials): void {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8), mats.obsidianDark);
  base.position.y = 0.25;
  group.add(base);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 3.2, 8), mats.obsidian);
  shaft.position.y = 2.1;
  group.add(shaft);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), mats.crystalGlow);
  crystal.position.y = 3.9;
  group.add(crystal);
}

function buildAtlanteanFarm(group: THREE.Group, mats: AtlanteanMaterials): void {
  const soil = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 2.4), mats.obsidianDark);
  soil.position.y = 0.04;
  group.add(soil);
  const crystalGlowPlot = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.2), mats.crystalGlow);
  crystalGlowPlot.position.y = 0.1;
  group.add(crystalGlowPlot);
}

function buildAtlanteanTitanGate(group: THREE.Group, mats: AtlanteanMaterials): { beaconCrystal: THREE.Object3D; vortexRing: THREE.Object3D } {
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.9, 0.5, 12), mats.obsidianDark);
  plinth.position.y = 0.25;
  group.add(plinth);
  const vortexRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.14, 12, 32), mats.crystalGlow);
  vortexRing.rotation.x = Math.PI / 2;
  vortexRing.position.y = 1.2;
  group.add(vortexRing);
  const beaconCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 1), mats.relicGold);
  beaconCrystal.position.y = 2.4;
  group.add(beaconCrystal);
  return { beaconCrystal, vortexRing };
}

// ─── Main Export: Atlantean Building Dispatcher ──────────────────────────────

export interface AtlanteanBuildingBuildResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function createAtlanteanBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows = true,
  age = 1,
  pantheon: PantheonId = 'atlantean',
  majorGod?: string
): AtlanteanBuildingBuildResult {
  const group = new THREE.Group();
  const mats = createAtlanteanMaterials(team, pal);

  let markerRadius = 1.5;
  let barHeight = 2.8;
  let barWidth = 1.7;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  switch (kind) {
    case 'town_center': {
      const rawGod = (majorGod || String(pantheon || 'kronos')).toLowerCase();
      const effGod =
        rawGod.includes('oranos') || rawGod.includes('urano')
          ? 'oranos'
          : rawGod.includes('gaia')
          ? 'gaia'
          : 'kronos';
      const res = buildProceduralAtlanteanTownCenter(group, age, effGod, enableShadows);
      metropolisHalo = res.metropolisHalo;
      metropolisCrystal = res.metropolisCrystal;
      if (res.flames && res.flames.length > 0) {
        group.userData.tcFlames = res.flames;
        group.userData.atlanteanFlames = res.flames;
      }
      if (res.relics && res.relics.length > 0) {
        group.userData.atlanteanRelics = res.relics;
      }
      if (res.relicRings && res.relicRings.length > 0) {
        group.userData.atlanteanRelicRings = res.relicRings;
      }
      group.scale.setScalar(1.0 + (age - 1) * 0.055);
      markerRadius = 3.6 + (age - 1) * 0.22;
      barHeight = 3.8 + (age - 1) * 0.55;
      barWidth = 3.2 + (age - 1) * 0.15;
      break;
    }
    case 'barracks':
      buildAtlanteanBarracks(group, mats);
      group.scale.setScalar(1.68);
      markerRadius = 2.65;
      barHeight = 4.3;
      barWidth = 2.55;
      break;
    case 'archery_range':
      buildAtlanteanArcheryRange(group, mats);
      group.scale.setScalar(1.68);
      markerRadius = 2.65;
      barHeight = 4.3;
      barWidth = 2.55;
      break;
    case 'stable':
      buildAtlanteanStable(group, mats);
      group.scale.setScalar(1.68);
      markerRadius = 2.65;
      barHeight = 4.3;
      barWidth = 2.55;
      break;
    case 'armory':
      buildAtlanteanArmory(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.5;
      barHeight = 4.2;
      barWidth = 2.4;
      break;
    case 'siege_works':
      buildAtlanteanSiegeWorks(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.7;
      barHeight = 4.1;
      barWidth = 2.5;
      break;
    case 'market':
      buildAtlanteanMarket(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.6;
      barHeight = 3.9;
      barWidth = 2.4;
      break;
    case 'temple': {
      const res = buildAtlanteanTemple(group, mats);
      beaconCrystal = res.beaconCrystal;
      group.scale.setScalar(1.8);
      markerRadius = 3.0;
      barHeight = 5.6;
      barWidth = 2.8;
      break;
    }
    case 'fortress': {
      const rawGod = (majorGod || String(pantheon || 'kronos')).toLowerCase();
      const effGod =
        rawGod.includes('oranos') || rawGod.includes('urano')
          ? 'oranos'
          : rawGod.includes('gaia')
          ? 'gaia'
          : 'kronos';
      const res = buildAtlanteanFortress(group, mats, age, effGod);
      metropolisHalo = res.metropolisHalo;
      metropolisCrystal = res.metropolisCrystal;
      group.scale.setScalar(1.22 + (age - 3) * 0.05);
      markerRadius = 3.4 + (age - 3) * 0.25;
      barHeight = 5.0 + (age - 3) * 0.45;
      barWidth = 3.2 + (age - 3) * 0.15;
      break;
    }
    case 'house':
      buildAtlanteanHouse(group, mats);
      group.scale.setScalar(1.45);
      markerRadius = 1.15;
      barHeight = 2.0;
      barWidth = 1.3;
      break;
    case 'tower':
      buildAtlanteanTower(group, mats);
      group.scale.setScalar(1.85);
      markerRadius = 1.5;
      barHeight = 6.2;
      barWidth = 1.8;
      break;
    case 'farm':
      buildAtlanteanFarm(group, mats);
      group.scale.setScalar(1.9);
      markerRadius = 2.2;
      barHeight = 2.3;
      barWidth = 2.0;
      break;
    case 'titan_gate': {
      const res = buildAtlanteanTitanGate(group, mats);
      beaconCrystal = res.beaconCrystal;
      vortexRing = res.vortexRing;
      group.scale.setScalar(1.65);
      markerRadius = 4.2;
      barHeight = 6.5;
      barWidth = 3.5;
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
