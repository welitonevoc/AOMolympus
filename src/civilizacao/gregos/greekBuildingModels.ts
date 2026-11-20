import * as THREE from 'three';
import { BuildingKind, PantheonId, TeamId } from '../../game/types';
import type { MaterialPalette } from '../../game/models';
import { buildGreekFortress as buildProceduralGreekFortress } from './greekFortressModel';
import { buildProceduralGreekTemple } from './greekTempleModel';
import { buildProceduralGreekHouse } from './greekHouseModel';
import { buildProceduralGreekTownCenter } from './greekTownCenterModel';

// ─── Procedural Greek Marble, Terracotta & Bronze Textures ─────────────────

const greekBldgTexCache = new Map<string, THREE.CanvasTexture>();

function makeGreekBldgTex(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const existing = greekBldgTexCache.get(key);
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
  greekBldgTexCache.set(key, tex);
  return tex;
}

export function getGreekMarbleTex(): THREE.CanvasTexture {
  return makeGreekBldgTex('greek_marble_v2', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(170, 175, 185, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo((i * 45) % w, 0);
      ctx.bezierCurveTo(w * 0.5, h * 0.3, w * 0.2, h * 0.7, (i * 65 + 30) % w, h);
      ctx.stroke();
    }
    const rows = 8;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      ctx.strokeStyle = 'rgba(150, 155, 165, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, r * rh);
      ctx.lineTo(w, r * rh);
      ctx.stroke();
    }
  });
}

export function getTerracottaTileTex(): THREE.CanvasTexture {
  return makeGreekBldgTex('greek_terracotta_tile_v2', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#b65436';
    ctx.fillRect(0, 0, w, h);
    const cols = 12;
    const rows = 12;
    const cw = w / cols;
    const ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#9e462b' : '#c85e3d';
        ctx.fillRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);
      }
    }
  });
}

// ─── Greek Materials & Relic Shrines ────────────────────────────────────────

interface GreekMaterials {
  marble: THREE.MeshStandardMaterial;
  marbleDark: THREE.MeshStandardMaterial;
  terracottaRoof: THREE.MeshStandardMaterial;
  bronzeTrim: THREE.MeshStandardMaterial;
  goldTrim: THREE.MeshStandardMaterial;
  stoneGrey: THREE.MeshStandardMaterial;
  timberWood: THREE.MeshStandardMaterial;
  teamBanner: THREE.MeshStandardMaterial;
  olympianGlow: THREE.MeshStandardMaterial;
  relicGold: THREE.MeshStandardMaterial;
  emberGlow: THREE.MeshStandardMaterial;
}

function createGreekMaterials(team: TeamId, _pal: MaterialPalette): GreekMaterials {
  const isPlayer = team === 'player';
  const primaryTeamHex = isPlayer ? 0x2563eb : 0xdc2626;

  return {
    marble: new THREE.MeshStandardMaterial({
      color: 0xf5f0e6,
      map: getGreekMarbleTex(),
      roughness: 0.65,
      metalness: 0.05,
    }),
    marbleDark: new THREE.MeshStandardMaterial({
      color: 0xd1cbd7,
      roughness: 0.75,
    }),
    terracottaRoof: new THREE.MeshStandardMaterial({
      color: 0xb65436,
      map: getTerracottaTileTex(),
      roughness: 0.8,
    }),
    bronzeTrim: new THREE.MeshStandardMaterial({
      color: 0xc9933b,
      roughness: 0.28,
      metalness: 0.85,
    }),
    goldTrim: new THREE.MeshStandardMaterial({
      color: 0xf4c44e,
      roughness: 0.2,
      metalness: 0.94,
    }),
    stoneGrey: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
    }),
    timberWood: new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.84,
    }),
    teamBanner: new THREE.MeshStandardMaterial({
      color: primaryTeamHex,
      roughness: 0.6,
    }),
    olympianGlow: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }),
    relicGold: new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.15,
      metalness: 0.98,
    }),
    emberGlow: new THREE.MeshStandardMaterial({
      color: 0xff7b24,
      emissive: 0xea580c,
      emissiveIntensity: 1.1,
      roughness: 0.3,
    }),
  };
}

function buildDoricColumn(height: number, mats: GreekMaterials): THREE.Group {
  const col = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, height - 0.25, 10),
    mats.marble
  );
  shaft.position.y = (height - 0.25) * 0.5;
  col.add(shaft);

  const capital = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.32), mats.marble);
  capital.position.y = height - 0.125;
  col.add(capital);
  return col;
}

// ─── 1. TOWN CENTER: Delegado ao modelo procedural T1–T5 (greekTownCenterModel.ts) ───


// ─── 2. BARRACKS (Quartel de Hoplitas) ──────────────────────────────────────

function buildGreekBarracks(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 3.4), mats.marbleDark);
  base.position.y = 0.16;
  group.add(base);

  const hall = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 2.6), mats.marble);
  hall.position.set(0, 0.32 + 1.0, 0);
  group.add(hall);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.2, 4), mats.terracottaRoof);
  roof.position.set(0, 0.32 + 2.0 + 0.6, 0);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.14, 14), mats.bronzeTrim);
  shield.rotation.x = Math.PI / 2;
  shield.position.set(0, 1.6, 1.35);
  group.add(shield);

  const dummyPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), mats.timberWood);
  dummyPost.position.set(-1.1, 0.32 + 0.55, 0.9);
  group.add(dummyPost);
  const dummyHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), mats.stoneGrey);
  dummyHead.position.set(-1.1, 0.32 + 1.1, 0.9);
  group.add(dummyHead);
}

// ─── 3. ARCHERY RANGE (Campo de Tiro com Arcos) ─────────────────────────────

function buildGreekArcheryRange(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 3.4), mats.marbleDark);
  base.position.y = 0.16;
  group.add(base);

  const pavilion = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 2.4), mats.marble);
  pavilion.position.set(0, 0.32 + 0.9, 0);
  group.add(pavilion);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.1, 4), mats.terracottaRoof);
  roof.position.set(0, 0.32 + 1.8 + 0.55, 0);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  for (const tx of [-0.9, 0.9]) {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), mats.timberWood);
    stand.position.set(tx, 0.32 + 0.45, 1.1);
    group.add(stand);
    const target = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12), mats.goldTrim);
    target.rotation.x = Math.PI / 2;
    target.position.set(tx, 0.32 + 0.75, 1.12);
    group.add(target);
  }
}

// ─── 4. STABLE (Estábulo) ───────────────────────────────────────────────────

function buildGreekStable(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.32, 3.4), mats.timberWood);
  base.position.y = 0.16;
  group.add(base);

  const barn = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 2.6), mats.marble);
  barn.position.set(0, 0.32 + 0.95, 0);
  group.add(barn);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.1, 4), mats.terracottaRoof);
  roof.position.set(0, 0.32 + 1.9 + 0.55, 0);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const trough = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.5), mats.stoneGrey);
  trough.position.set(0, 0.32 + 0.15, 1.35);
  group.add(trough);

  const hay = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), mats.goldTrim);
  hay.position.set(-1.2, 0.32 + 0.2, 1.25);
  group.add(hay);
}

// ─── 5. ARMORY (Armaria / Forja de Hefesto) ─────────────────────────────────

function buildGreekArmory(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 3.2), mats.stoneGrey);
  base.position.y = 0.16;
  group.add(base);

  const smithy = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.4), mats.marble);
  smithy.position.set(-0.4, 0.32 + 0.9, 0);
  group.add(smithy);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.0, 4), mats.terracottaRoof);
  roof.position.set(-0.4, 0.32 + 1.8 + 0.5, 0);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.2, 8), mats.stoneGrey);
  chimney.position.set(1.1, 0.32 + 1.1, 0);
  group.add(chimney);

  const fire = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mats.emberGlow);
  fire.position.set(1.1, 0.32 + 0.5, 0);
  group.add(fire);

  const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.3), mats.bronzeTrim);
  anvil.position.set(0.9, 0.32 + 0.35, 0.9);
  group.add(anvil);
}

// ─── 6. SIEGE WORKS (Oficina de Cerco) ──────────────────────────────────────

function buildGreekSiegeWorks(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 3.4), mats.stoneGrey);
  base.position.y = 0.16;
  group.add(base);

  const shed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 2.6), mats.timberWood);
  shed.position.set(0, 0.32 + 0.9, 0);
  group.add(shed);

  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), mats.timberWood);
  postL.position.set(-1.1, 0.32 + 1.1, 1.1);
  const postR = postL.clone();
  postR.position.x = 1.1;
  const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), mats.timberWood);
  crossbeam.position.set(0, 0.32 + 2.1, 1.1);
  group.add(postL, postR, crossbeam);
}

// ─── 7. MARKET (Bazar da Ágora) ─────────────────────────────────────────────

function buildGreekMarket(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 3.2), mats.marbleDark);
  base.position.y = 0.16;
  group.add(base);

  for (const cx of [-0.9, 0.9]) {
    for (const cz of [-0.7, 0.7]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), mats.marble);
      col.position.set(cx, 0.32 + 0.8, cz);
      group.add(col);
    }
  }

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 2.2), mats.terracottaRoof);
  canopy.position.set(0, 0.32 + 1.68, 0);
  group.add(canopy);

  const amphora = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.45, 8), mats.terracottaRoof);
  amphora.position.set(0, 0.32 + 0.22, 0);
  group.add(amphora);
}

// ─── Other Greek buildings ──────────────────────────────────────────────────

function buildGreekTemple(
  group: THREE.Group,
  _mats: GreekMaterials,
  age: number = 1,
  godKey: string = 'zeus'
): { beaconCrystal: THREE.Object3D } {
  return buildProceduralGreekTemple(group, age, godKey);
}

function buildGreekFortress(
  group: THREE.Group,
  _mats: GreekMaterials,
  age: number = 3,
  godKey: string = 'zeus'
): { metropolisHalo?: THREE.Object3D; metropolisCrystal?: THREE.Object3D } {
  const tier = Math.max(3, Math.min(5, Math.round(age)));
  const effTier = tier >= 4 ? 4 : 3;
  const fortress = buildProceduralGreekFortress(godKey, effTier, true);
  group.add(fortress.root);
  return {
    metropolisHalo: fortress.divineRing,
    metropolisCrystal: fortress.apexCrystal
  };
}

function buildGreekHouse(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 1.4), mats.marbleDark);
  base.position.y = 0.08;
  group.add(base);
  const walls = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.0, 1.15), mats.marble);
  walls.position.y = 0.58;
  group.add(walls);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.7, 4), mats.terracottaRoof);
  roof.position.y = 1.43;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
}

function buildGreekTower(group: THREE.Group, mats: GreekMaterials): void {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8), mats.stoneGrey);
  base.position.y = 0.25;
  group.add(base);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 3.2, 8), mats.marble);
  shaft.position.y = 2.1;
  group.add(shaft);
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 0.4, 8), mats.bronzeTrim);
  platform.position.y = 3.9;
  group.add(platform);
}

function buildGreekFarm(group: THREE.Group, mats: GreekMaterials): void {
  const soil = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 2.4), mats.timberWood);
  soil.position.y = 0.04;
  group.add(soil);
  for (let r = -2; r <= 2; r++) {
    const crop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.25), mats.goldTrim);
    crop.position.set(0, 0.12, r * 0.42);
    group.add(crop);
  }
}

function buildGreekTitanGate(group: THREE.Group, mats: GreekMaterials): { beaconCrystal: THREE.Object3D; vortexRing: THREE.Object3D } {
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.9, 0.5, 12), mats.stoneGrey);
  plinth.position.y = 0.25;
  group.add(plinth);

  const vortexRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.14, 12, 32), mats.olympianGlow);
  vortexRing.rotation.x = Math.PI / 2;
  vortexRing.position.y = 1.2;
  group.add(vortexRing);

  const beaconCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 1), mats.relicGold);
  beaconCrystal.position.y = 2.4;
  group.add(beaconCrystal);

  return { beaconCrystal, vortexRing };
}

// ─── Main Export: Greek Building Dispatcher ──────────────────────────────────

export interface GreekBuildingBuildResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function createGreekBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows = true,
  age = 1,
  pantheon: PantheonId = 'greek',
  majorGod?: string
): GreekBuildingBuildResult {
  const group = new THREE.Group();
  const mats = createGreekMaterials(team, pal);

  let markerRadius = 1.5;
  let barHeight = 2.8;
  let barWidth = 1.7;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  switch (kind) {
    case 'town_center': {
      const rawGod = (majorGod || String(pantheon || 'zeus')).toLowerCase();
      const effGod = rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus';
      const res = buildProceduralGreekTownCenter(group, age, effGod, enableShadows);
      metropolisHalo = res.metropolisHalo;
      metropolisCrystal = res.metropolisCrystal;
      if (res.flames && res.flames.length > 0) {
        group.userData.tcFlames = res.flames;
      }
      group.scale.setScalar(1.05 + (age - 1) * 0.05);
      markerRadius = 3.6 + (age - 1) * 0.22;
      barHeight = 3.8 + (age - 1) * 0.50;
      barWidth = 3.2 + (age - 1) * 0.15;
      break;
    }
    case 'barracks':
      buildGreekBarracks(group, mats);
      group.scale.setScalar(1.68);
      markerRadius = 2.65;
      barHeight = 4.3;
      barWidth = 2.55;
      break;
    case 'archery_range':
      buildGreekArcheryRange(group, mats);
      group.scale.setScalar(1.68);
      markerRadius = 2.65;
      barHeight = 4.3;
      barWidth = 2.55;
      break;
    case 'stable':
      buildGreekStable(group, mats);
      group.scale.setScalar(1.68);
      markerRadius = 2.65;
      barHeight = 4.3;
      barWidth = 2.55;
      break;
    case 'armory':
      buildGreekArmory(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.5;
      barHeight = 4.2;
      barWidth = 2.4;
      break;
    case 'siege_works':
      buildGreekSiegeWorks(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.7;
      barHeight = 4.1;
      barWidth = 2.5;
      break;
    case 'market':
      buildGreekMarket(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.6;
      barHeight = 3.9;
      barWidth = 2.4;
      break;
    case 'temple': {
      const rawGod = (majorGod || String(pantheon || 'zeus')).toLowerCase();
      const effGod = rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus';
      const res = buildGreekTemple(group, mats, age, effGod);
      beaconCrystal = res.beaconCrystal;
      group.scale.setScalar(1.2 + (age - 1) * 0.08);
      markerRadius = 2.6 + (age - 1) * 0.15;
      barHeight = 4.4 + (age - 1) * 0.3;
      barWidth = 2.6 + (age - 1) * 0.1;
      break;
    }
    case 'fortress': {
      const rawGod = (majorGod || String(pantheon || 'zeus')).toLowerCase();
      const effGod = rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus';
      const res = buildGreekFortress(group, mats, age, effGod);
      metropolisHalo = res.metropolisHalo;
      metropolisCrystal = res.metropolisCrystal;
      group.scale.setScalar(1.22 + (age - 3) * 0.05);
      markerRadius = 3.4 + (age - 3) * 0.25;
      barHeight = 5.0 + (age - 3) * 0.45;
      barWidth = 3.2 + (age - 3) * 0.15;
      break;
    }
    case 'house': {
      const rawGod = (majorGod || String(pantheon || 'zeus')).toLowerCase();
      const effGod = rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus';
      buildProceduralGreekHouse(group, age, effGod, enableShadows);
      group.scale.setScalar(1.22);
      markerRadius = 1.35 + (age - 1) * 0.12;
      barHeight = 2.2 + (age - 1) * 0.25;
      barWidth = 1.4 + (age - 1) * 0.1;
      break;
    }
    case 'tower':
      buildGreekTower(group, mats);
      group.scale.setScalar(1.85);
      markerRadius = 1.5;
      barHeight = 6.2;
      barWidth = 1.8;
      break;
    case 'farm':
      buildGreekFarm(group, mats);
      group.scale.setScalar(1.9);
      markerRadius = 2.2;
      barHeight = 2.3;
      barWidth = 2.0;
      break;
    case 'titan_gate': {
      const res = buildGreekTitanGate(group, mats);
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
