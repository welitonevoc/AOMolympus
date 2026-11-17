import * as THREE from 'three';
import { BuildingKind, TeamId } from '../../game/types';

// ─── Procedural Egyptian Sandstone, Hieroglyph & Gold Textures ──────────────

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
  return makeEgyptBldgTex('egypt_sandstone_v1', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d9b372';
    ctx.fillRect(0, 0, w, h);
    // Ashlar sandstone block courses
    const rows = 8;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = (r % 2) * -28;
      while (x < w) {
        const bw = 52 + ((r * 19 + Math.floor(x)) % 32);
        const shadeVar = ((r * 13 + Math.floor(x)) % 5) * 6;
        ctx.fillStyle = `rgb(${217 + shadeVar}, ${179 + shadeVar}, ${114 + shadeVar})`;
        ctx.fillRect(x + 2, r * rh + 2, bw - 4, rh - 4);
        ctx.strokeStyle = '#b08a4b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, r * rh + 2, bw - 4, rh - 4);
        x += bw;
      }
    }
  }) as unknown as THREE.CanvasTexture;
}

export function getHieroglyphFriezeTex(): THREE.CanvasTexture {
  return makeEgyptBldgTex('egypt_hieroglyph_trim_v1', 256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#1c1510';
    ctx.fillRect(0, 0, w, h);
    // Gold top and bottom borders
    ctx.fillStyle = '#f4c44e';
    ctx.fillRect(0, 0, w, 6);
    ctx.fillRect(0, h - 6, w, 6);
    // Hieroglyph symbols (Ankh, Eye of Horus, Lotus, Djed pillar motifs)
    ctx.fillStyle = '#fde047';
    for (let x = 16; x < w; x += 32) {
      // Simple sacred hieroglyphic carvings
      ctx.fillRect(x - 4, 14, 8, 36);
      ctx.fillRect(x - 10, 24, 20, 8);
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(x - 2, 20, 4, 24);
      ctx.fillStyle = '#fde047';
    }
  });
}

// ─── Shared Egyptian Architectural Materials ────────────────────────────────

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
}

function createEgyptianMaterials(team: TeamId, pal: any): EgyptianMaterials {
  const isPlayer = team === 'player';
  const primaryTeamHex = isPlayer ? 0x2563eb : 0xdc2626;

  return {
    sandstone: new THREE.MeshStandardMaterial({
      color: 0xdfbc7a,
      map: getEgyptianSandstoneTex(),
      roughness: 0.85,
    }),
    sandstoneDark: new THREE.MeshStandardMaterial({
      color: 0x9c7945,
      roughness: 0.88,
    }),
    goldTrim: new THREE.MeshStandardMaterial({
      color: 0xf4c44e,
      roughness: 0.22,
      metalness: 0.92,
    }),
    turquoise: new THREE.MeshStandardMaterial({
      color: 0x0f9e99,
      roughness: 0.35,
      metalness: 0.25,
    }),
    lapisRoof: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.38,
      metalness: 0.32,
    }),
    hieroglyphTrim: new THREE.MeshStandardMaterial({
      color: 0xd9b372,
      map: getHieroglyphFriezeTex(),
      roughness: 0.7,
    }),
    ivoryStone: new THREE.MeshStandardMaterial({
      color: 0xf5f0e2,
      roughness: 0.62,
    }),
    timberWood: new THREE.MeshStandardMaterial({
      color: 0x6e472b,
      roughness: 0.84,
    }),
    teamBanner: new THREE.MeshStandardMaterial({
      color: primaryTeamHex,
      roughness: 0.65,
    }),
    goldSolar: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xb45309,
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.95,
    }),
    emberGlow: new THREE.MeshStandardMaterial({
      color: pal?.ember ?? 0xff7b24,
      emissive: pal?.ember ?? 0xea580c,
      emissiveIntensity: 0.9,
      roughness: 0.3,
    }),
    beaconGlow: new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x14b8a6,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    }),
  };
}

/**
  * Builds a majestic Egyptian Lotus / Papyrus column.
  */
function buildLotusColumn(height: number, mats: EgyptianMaterials): THREE.Group {
  const col = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, height - 0.3, 8),
    mats.sandstone
  );
  shaft.position.y = (height - 0.3) * 0.5;
  col.add(shaft);

  // Bud capital
  const capital = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.35, 8),
    mats.turquoise
  );
  capital.position.y = height - 0.15;
  col.add(capital);
  return col;
}

// ─── 1. PHARAONIC PALACE (Town Center — Palácio do Faraó / Centro da Cidade) ───

function buildEgyptianTownCenter(group: THREE.Group, mats: EgyptianMaterials): void {
  // 1. Massive Sandstone Terraced Base with Batter Walls
  const basePlinth = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.42, 5.2),
    mats.sandstoneDark
  );
  basePlinth.position.y = 0.21;
  group.add(basePlinth);

  const innerCourt = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.18, 4.6),
    mats.sandstone
  );
  innerCourt.position.y = 0.51;
  group.add(innerCourt);

  // Grand Frontal Staircase leading up
  for (let s = 0; s < 4; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(2.1 - s * 0.14, 0.1, 0.32),
      mats.sandstoneDark
    );
    step.position.set(0, 0.05 + s * 0.1, 2.52 - s * 0.16);
    group.add(step);
  }

  // 2. Twin Monumental Entrance Pylons (Towers flanking the main gate)
  for (const side of [-1, 1]) {
    const pylon = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 3.1, 1.45),
      mats.sandstone
    );
    pylon.position.set(side * 1.65, 1.55 + 0.6, 1.35);
    pylon.rotation.y = side * 0.05;
    group.add(pylon);

    // Golden solar disc on top of each pylon
    const pylonCap = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.25, 1.52),
      mats.goldTrim
    );
    pylonCap.position.set(side * 1.65, 3.25 + 0.6, 1.35);
    group.add(pylonCap);
  }

  // 3. Central Pharaonic Hall with Hieroglyph Frieze
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 2.4, 2.8),
    mats.sandstone
  );
  hall.position.set(0, 1.2 + 0.6, -0.4);
  group.add(hall);

  const frieze = new THREE.Mesh(
    new THREE.BoxGeometry(2.46, 0.35, 2.86),
    mats.hieroglyphTrim
  );
  frieze.position.set(0, 2.45 + 0.6, -0.4);
  group.add(frieze);

  const flatRoof = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.24, 3.0),
    mats.turquoise
  );
  flatRoof.position.set(0, 2.75 + 0.6, -0.4);
  group.add(flatRoof);

  // 4. Soaring Golden Solar Obelisk in Courtyard Center
  const obeliskBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.45, 0.65),
    mats.sandstoneDark
  );
  obeliskBase.position.set(0, 0.6 + 0.225, -0.2);
  group.add(obeliskBase);

  const obeliskShaft = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 3.4, 4),
    mats.goldTrim
  );
  obeliskShaft.position.set(0, 0.6 + 0.45 + 1.7, -0.2);
  group.add(obeliskShaft);

  // Glowing golden solar apex on obelisk
  const solarApex = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    mats.goldSolar
  );
  solarApex.position.set(0, 0.6 + 2.45, -0.2);
  group.add(solarApex);

  // 5. Front Portico Lotus Columns & Team Banner Standard
  for (const side of [-1, 1]) {
    const col = buildLotusColumn(2.2, mats);
    col.position.set(side * 0.85, 0.6, 1.45);
    group.add(col);
  }

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6),
    mats.goldTrim
  );
  pole.position.set(0, 0.6 + 1.6, 2.05);
  group.add(pole);

  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.85, 0.04),
    mats.teamBanner
  );
  banner.position.set(0, 0.6 + 2.1, 2.08);
  group.add(banner);
}

// ─── 2. MIGDAL BARRACKS (Quartel Egípcio / Migdal Fortress) ──────────────────

function buildEgyptianBarracks(group: THREE.Group, mats: EgyptianMaterials): void {
  // Sandstone plinth
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.3, 3.2),
    mats.sandstoneDark
  );
  base.position.y = 0.15;
  group.add(base);

  // Migdal Fortified Tower Body (battered sloped walls)
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 2.2, 2.4),
    mats.sandstone
  );
  tower.position.set(0, 0.3 + 1.1, 0);
  group.add(tower);

  // Battlements (Merlons) around roof perimeter
  for (let x = -1.2; x <= 1.2; x += 0.8) {
    for (const z of [-1.15, 1.15]) {
      const merlon = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.42, 0.25),
        mats.sandstoneDark
      );
      merlon.position.set(x, 0.3 + 2.2 + 0.21, z);
      group.add(merlon);
    }
  }

  // Golden Sun Disk emblem on front wall
  const emblem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12),
    mats.goldTrim
  );
  emblem.rotation.x = Math.PI / 2;
  emblem.position.set(0, 1.4, 1.25);
  group.add(emblem);

  // Spear & Shield Rack in front courtyard
  const rackBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.15, 0.4),
    mats.timberWood
  );
  rackBase.position.set(0, 0.37, 1.55);
  group.add(rackBase);

  for (const sx of [-0.35, 0.35]) {
    const spear = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.8, 6),
      mats.goldTrim
    );
    spear.position.set(sx, 1.2, 1.55);
    group.add(spear);
  }
}

// ─── 3. GRAND TEMPLE OF RA / ISIS (Templo Sagrado Egípcio) ───────────────────

function buildEgyptianTemple(group: THREE.Group, mats: EgyptianMaterials): { beaconCrystal: THREE.Object3D } {
  // 1. Terraced Stepped Pyramid / Pylon Temple Base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.35, 4.4),
    mats.sandstoneDark
  );
  base.position.y = 0.175;
  group.add(base);

  const pyramidBody = new THREE.Mesh(
    new THREE.ConeGeometry(3.1, 3.2, 4),
    mats.sandstone
  );
  pyramidBody.position.y = 0.35 + 1.6;
  pyramidBody.rotation.y = Math.PI / 4;
  group.add(pyramidBody);

  // 2. Four Sphinx Guardian Statues at the Base Corners
  for (const [sx, sz] of [
    [-1.6, -1.6],
    [1.6, -1.6],
    [-1.6, 1.6],
    [1.6, 1.6],
  ]) {
    const sphinxBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.45, 1.05),
      mats.sandstoneDark
    );
    sphinxBody.position.set(sx, 0.35 + 0.225, sz);
    group.add(sphinxBody);

    const sphinxHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.45, 0.35),
      mats.goldTrim
    );
    sphinxHead.position.set(sx, 0.35 + 0.65, sz + 0.32);
    group.add(sphinxHead);
  }

  // 3. Golden Solar Beacon Crystal hovering above Pyramid Apex
  const beaconCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.38, 0),
    mats.goldSolar
  );
  beaconCrystal.position.y = 4.2;
  group.add(beaconCrystal);

  return { beaconCrystal };
}

// ─── 4. FORTRESS (Migdal Citadel / Fortaleza) ───────────────────────────────

function buildEgyptianFortress(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.45, 4.8),
    mats.sandstoneDark
  );
  base.position.y = 0.225;
  group.add(base);

  // Massive central keep
  const keep = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.8, 3.2),
    mats.sandstone
  );
  keep.position.set(0, 0.45 + 1.4, 0);
  group.add(keep);

  // Four corner bastions with gold caps
  for (const [bx, bz] of [
    [-1.8, -1.8],
    [1.8, -1.8],
    [-1.8, 1.8],
    [1.8, 1.8],
  ]) {
    const bastion = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 3.4, 1.1),
      mats.sandstoneDark
    );
    bastion.position.set(bx, 0.45 + 1.7, bz);
    group.add(bastion);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.3, 1.2),
      mats.goldTrim
    );
    cap.position.set(bx, 0.45 + 3.55, bz);
    group.add(cap);
  }
}

// ─── 5. OTHER EGYPTIAN BUILDINGS (House, Armory, Siege, Market, Tower, Farm, Titan Gate) ──

function buildEgyptianHouse(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 1.4), mats.sandstoneDark);
  base.position.y = 0.09;
  group.add(base);

  const walls = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.0, 1.15), mats.sandstone);
  walls.position.y = 0.59;
  group.add(walls);

  const flatRoof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 1.25), mats.turquoise);
  flatRoof.position.y = 1.15;
  group.add(flatRoof);
}

function buildEgyptianArmory(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.25, 2.4), mats.sandstoneDark);
  base.position.y = 0.125;
  group.add(base);

  const hall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 1.8), mats.sandstone);
  hall.position.y = 1.05;
  group.add(hall);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.18, 1.95), mats.goldTrim);
  roof.position.y = 1.94;
  group.add(roof);
}

function buildEgyptianTower(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8), mats.sandstoneDark);
  base.position.y = 0.25;
  group.add(base);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 3.2, 8), mats.sandstone);
  shaft.position.y = 2.1;
  group.add(shaft);

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 0.4, 8), mats.goldTrim);
  platform.position.y = 3.9;
  group.add(platform);
}

function buildEgyptianMarket(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.2), mats.sandstoneDark);
  base.position.y = 0.1;
  group.add(base);

  for (const cx of [-0.8, 0.8]) {
    for (const cz of [-0.6, 0.6]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), mats.timberWood);
      col.position.set(cx, 0.9, cz);
      group.add(col);
    }
  }

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 1.8), mats.turquoise);
  canopy.position.y = 1.78;
  group.add(canopy);
}

function buildEgyptianSiegeWorks(group: THREE.Group, mats: EgyptianMaterials): void {
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 2.5), mats.sandstoneDark);
  base.position.y = 0.11;
  group.add(base);

  const shed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 2.0), mats.sandstone);
  shed.position.y = 0.92;
  group.add(shed);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.15, 2.15), mats.timberWood);
  roof.position.y = 1.7;
  group.add(roof);
}

function buildEgyptianFarm(group: THREE.Group, mats: EgyptianMaterials): void {
  const soil = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 2.4), mats.sandstoneDark);
  soil.position.y = 0.04;
  group.add(soil);

  for (let r = -2; r <= 2; r++) {
    const crop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.25), mats.goldSolar);
    crop.position.set(0, 0.12, r * 0.42);
    group.add(crop);
  }
}

function buildEgyptianTitanGate(group: THREE.Group, mats: EgyptianMaterials): { beaconCrystal: THREE.Object3D; vortexRing: THREE.Object3D } {
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.9, 0.5, 12), mats.sandstoneDark);
  plinth.position.y = 0.25;
  group.add(plinth);

  for (let i = 0.0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.8, 4), mats.goldTrim);
    obelisk.position.set(Math.cos(angle) * 1.8, 1.65, Math.sin(angle) * 1.8);
    group.add(obelisk);
  }

  const vortexRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.14, 12, 32), mats.beaconGlow);
  vortexRing.rotation.x = Math.PI / 2;
  vortexRing.position.y = 1.2;
  group.add(vortexRing);

  const beaconCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 1), mats.goldSolar);
  beaconCrystal.position.y = 2.4;
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
}

export function createEgyptianBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: any,
  enableShadows = true
): EgyptianBuildingBuildResult {
  const group = new THREE.Group();
  const mats = createEgyptianMaterials(team, pal);

  let markerRadius = 1.5;
  let barHeight = 2.8;
  let barWidth = 1.7;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;

  switch (kind) {
    case 'town_center':
      buildEgyptianTownCenter(group, mats);
      group.scale.setScalar(1.08);
      markerRadius = 3.7;
      barHeight = 4.0;
      barWidth = 3.1;
      break;
    case 'barracks':
    case 'archery_range':
    case 'stable':
      buildEgyptianBarracks(group, mats);
      group.scale.setScalar(1.65);
      markerRadius = 2.6;
      barHeight = 4.2;
      barWidth = 2.5;
      break;
    case 'temple': {
      const res = buildEgyptianTemple(group, mats);
      beaconCrystal = res.beaconCrystal;
      group.scale.setScalar(1.8);
      markerRadius = 3.0;
      barHeight = 5.6;
      barWidth = 2.8;
      break;
    }
    case 'fortress':
      buildEgyptianFortress(group, mats);
      group.scale.setScalar(1.68);
      markerRadius = 3.4;
      barHeight = 5.0;
      barWidth = 3.2;
      break;
    case 'house':
      buildEgyptianHouse(group, mats);
      group.scale.setScalar(1.45);
      markerRadius = 1.15;
      barHeight = 2.0;
      barWidth = 1.3;
      break;
    case 'armory':
      buildEgyptianArmory(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.5;
      barHeight = 4.2;
      barWidth = 2.4;
      break;
    case 'siege_works':
      buildEgyptianSiegeWorks(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.7;
      barHeight = 4.1;
      barWidth = 2.5;
      break;
    case 'market':
      buildEgyptianMarket(group, mats);
      group.scale.setScalar(1.7);
      markerRadius = 2.6;
      barHeight = 3.9;
      barWidth = 2.4;
      break;
    case 'tower':
      buildEgyptianTower(group, mats);
      group.scale.setScalar(1.85);
      markerRadius = 1.5;
      barHeight = 6.2;
      barWidth = 1.8;
      break;
    case 'farm':
      buildEgyptianFarm(group, mats);
      group.scale.setScalar(1.9);
      markerRadius = 2.2;
      barHeight = 2.3;
      barWidth = 2.0;
      break;
    case 'titan_gate': {
      const res = buildEgyptianTitanGate(group, mats);
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
  };
}
