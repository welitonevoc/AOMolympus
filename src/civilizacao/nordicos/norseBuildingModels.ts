import * as THREE from 'three';
import { BuildingKind, TeamId } from '../../game/types';

// ─── Procedural Wood-and-Stone Nordic Building Textures ─────────────────────

const norseBldgTexCache = new Map<string, THREE.CanvasTexture>();

function makeNorseBldgTex(
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const existing = norseBldgTexCache.get(key);
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
  norseBldgTexCache.set(key, tex);
  return tex;
}

export function getNordicTimberWallTex(): THREE.CanvasTexture {
  return makeNorseBldgTex('nordic_timber_wall_v1', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(0, 0, w, h);
    const planks = 8;
    const ph = h / planks;
    for (let i = 0; i < planks; i++) {
      const y = i * ph;
      ctx.fillStyle = i % 2 === 0 ? '#452e1b' : '#382414';
      ctx.fillRect(0, y, w, ph - 2);
      // Wood grain lines
      ctx.strokeStyle = 'rgba(20, 11, 5, 0.45)';
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 5; g++) {
        ctx.beginPath();
        const gy = y + 4 + g * (ph / 5);
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(w * 0.33, gy + (g % 2 === 0 ? 3 : -3), w * 0.66, gy - 2, w, gy);
        ctx.stroke();
      }
      // Plank seam
      ctx.fillStyle = '#1d1108';
      ctx.fillRect(0, y + ph - 2, w, 2);
      // Iron rivets along plank ends
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(14, y + ph * 0.5, 2.5, 0, Math.PI * 2);
      ctx.arc(w - 14, y + ph * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function getStaveShingleRoofTex(): THREE.CanvasTexture {
  return makeNorseBldgTex('stave_shingle_roof_v1', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#251a12';
    ctx.fillRect(0, 0, w, h);
    const rows = 8;
    const cols = 8;
    const rw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (rw * 0.5);
      for (let c = -1; c <= cols; c++) {
        const x = c * rw + offset;
        const y = r * rh;
        ctx.fillStyle = (r + c) % 2 === 0 ? '#332318' : '#2a1c13';
        ctx.beginPath();
        ctx.moveTo(x + 2, y);
        ctx.lineTo(x + rw - 2, y);
        ctx.lineTo(x + rw - 4, y + rh * 0.72);
        ctx.lineTo(x + rw * 0.5, y + rh - 1);
        ctx.lineTo(x + 4, y + rh * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#140d08';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    // Subtle Nordic moss/frost weathering along top eaves
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(74, 93, 62, 0.22)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(15, 10, 6, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
}

export function getNordicStoneFoundationTex(): THREE.CanvasTexture {
  return makeNorseBldgTex('nordic_stone_foundation_v1', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, w, h);
    const rows = 6;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = (r % 2) * -22;
      while (x < w) {
        const bw = 42 + ((r * 17 + Math.floor(x)) % 26);
        const shade = 68 + ((r * 23 + Math.floor(x)) % 34);
        ctx.fillStyle = `rgb(${shade}, ${shade + 6}, ${shade + 14})`;
        ctx.beginPath();
        ctx.roundRect(x + 2, r * rh + 2, bw - 4, rh - 4, 5);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Lichen / frost speck
        if ((r + Math.floor(x)) % 3 === 0) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.fillRect(x + 6, r * rh + 5, bw * 0.4, 4);
        }
        x += bw;
      }
    }
  });
}

export function getCarvedRuneTrimTex(): THREE.CanvasTexture {
  return makeNorseBldgTex('carved_rune_trim_v1', 256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#2d1c10';
    ctx.fillRect(0, 0, w, h);
    // Upper and lower bronze borders
    ctx.fillStyle = '#b4833e';
    ctx.fillRect(0, 0, w, 6);
    ctx.fillRect(0, h - 6, w, 6);
    // Interlocking Nordic knotwork wave
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x + 16, h - 16);
      ctx.lineTo(x + 32, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, h - 16);
      ctx.lineTo(x + 16, 16);
      ctx.lineTo(x + 32, h - 16);
      ctx.stroke();
    }
    // Glowing cyan/gold Elder Futhark rune accents
    ctx.fillStyle = '#fbbf24';
    for (let x = 16; x < w; x += 32) {
      ctx.fillRect(x - 2, h * 0.5 - 5, 4, 10);
    }
  });
}

// ─── Shared Nordic Architectural Helpers ────────────────────────────────────

interface NorseMaterials {
  timberWall: THREE.MeshStandardMaterial;
  darkBeam: THREE.MeshStandardMaterial;
  carvedTrim: THREE.MeshStandardMaterial;
  shingleRoof: THREE.MeshStandardMaterial;
  thatchGold: THREE.MeshStandardMaterial;
  graniteStone: THREE.MeshStandardMaterial;
  slateStone: THREE.MeshStandardMaterial;
  bronzeMetal: THREE.MeshStandardMaterial;
  ironMetal: THREE.MeshStandardMaterial;
  teamBanner: THREE.MeshStandardMaterial;
  shieldAlt: THREE.MeshStandardMaterial;
  emberGlow: THREE.MeshStandardMaterial;
  runeGlow: THREE.MeshStandardMaterial;
}

function createNorseMaterials(team: TeamId, pal: any): NorseMaterials {
  const isPlayer = team === 'player';
  const primaryTeamHex = isPlayer ? 0x2563eb : 0xdc2626;
  const altShieldHex = isPlayer ? 0xf59e0b : 0x7c2d12;

  return {
    timberWall: new THREE.MeshStandardMaterial({
      color: 0x855836,
      map: getNordicTimberWallTex(),
      roughness: 0.86,
    }),
    darkBeam: new THREE.MeshStandardMaterial({
      color: 0x3b2313,
      roughness: 0.88,
    }),
    carvedTrim: new THREE.MeshStandardMaterial({
      color: 0xb47b44,
      map: getCarvedRuneTrimTex(),
      roughness: 0.65,
      metalness: 0.18,
    }),
    shingleRoof: new THREE.MeshStandardMaterial({
      color: 0x4a3322,
      map: getStaveShingleRoofTex(),
      roughness: 0.84,
    }),
    thatchGold: new THREE.MeshStandardMaterial({
      color: 0x9a7b3e,
      roughness: 0.92,
    }),
    graniteStone: new THREE.MeshStandardMaterial({
      color: 0x788696,
      map: getNordicStoneFoundationTex(),
      roughness: 0.9,
    }),
    slateStone: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.88,
    }),
    bronzeMetal: new THREE.MeshStandardMaterial({
      color: 0xc8963e,
      roughness: 0.36,
      metalness: 0.72,
    }),
    ironMetal: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.45,
      metalness: 0.75,
    }),
    teamBanner: new THREE.MeshStandardMaterial({
      color: primaryTeamHex,
      roughness: 0.65,
    }),
    shieldAlt: new THREE.MeshStandardMaterial({
      color: altShieldHex,
      roughness: 0.68,
    }),
    emberGlow: new THREE.MeshStandardMaterial({
      color: pal?.ember ?? 0xff7b24,
      emissive: pal?.ember ?? 0xea580c,
      emissiveIntensity: 0.85,
      roughness: 0.3,
    }),
    runeGlow: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  };
}

/**
 * Builds a pitched triangular prism roof with overhanging eaves, ridge beam, and rafters.
 */
function buildPitchedStaveRoof(
  width: number,
  height: number,
  length: number,
  roofMat: THREE.Material,
  beamMat: THREE.Material,
  trimMat: THREE.Material,
  withDragonFinials = true
): THREE.Group {
  const roofGroup = new THREE.Group();
  const halfW = width * 0.5;
  const halfL = length * 0.5;
  const slopeLen = Math.hypot(halfW + 0.16, height);
  const slopeAngle = Math.atan2(height, halfW);

  // Left and Right pitched shingle panels
  const panelGeo = new THREE.BoxGeometry(slopeLen, 0.09, length + 0.24);
  const leftPanel = new THREE.Mesh(panelGeo, roofMat);
  leftPanel.position.set(-halfW * 0.5 - 0.04, height * 0.5, 0);
  leftPanel.rotation.z = slopeAngle;
  roofGroup.add(leftPanel);

  const rightPanel = new THREE.Mesh(panelGeo, roofMat);
  rightPanel.position.set(halfW * 0.5 + 0.04, height * 0.5, 0);
  rightPanel.rotation.z = -slopeAngle;
  roofGroup.add(rightPanel);

  // Gable triangular fill walls (front and back)
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-halfW, 0);
  gableShape.lineTo(halfW, 0);
  gableShape.lineTo(0, height);
  gableShape.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, {
    depth: width * 0.04,
    bevelEnabled: false,
  });
  const frontGable = new THREE.Mesh(gableGeo, trimMat);
  frontGable.position.set(0, 0, halfL - width * 0.02);
  roofGroup.add(frontGable);

  const backGable = new THREE.Mesh(gableGeo, trimMat);
  backGable.position.set(0, 0, -halfL - width * 0.02);
  roofGroup.add(backGable);

  // Heavy carved ridge beam along top crest
  const ridgeBeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.14, length + 0.36),
    beamMat
  );
  ridgeBeam.position.set(0, height + 0.03, 0);
  roofGroup.add(ridgeBeam);

  // Crossed Gable Bargeboards & Drakkar Dragon Prows at both ends
  if (withDragonFinials) {
    for (const dir of [-1, 1]) {
      const zPos = dir * (halfL + 0.12);
      // Crossed wind-bargeboards (horn rafters)
      for (const side of [-1, 1]) {
        const barge = new THREE.Mesh(
          new THREE.BoxGeometry(slopeLen + 0.28, 0.08, 0.08),
          beamMat
        );
        barge.position.set(side * (halfW * 0.45), height * 0.55, zPos);
        barge.rotation.z = -side * slopeAngle;
        roofGroup.add(barge);
      }

      // Carved Dragon-head prow rising from the ridge apex
      const prowGroup = new THREE.Group();
      prowGroup.position.set(0, height + 0.08, zPos);

      const neck = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.38, 0.12),
        trimMat
      );
      neck.position.set(0, 0.16, dir * 0.08);
      neck.rotation.x = dir * 0.35;
      prowGroup.add(neck);

      const snout = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.26, 5),
        trimMat
      );
      snout.position.set(0, 0.34, dir * 0.22);
      snout.rotation.x = dir * 1.25;
      prowGroup.add(snout);

      const crest = new THREE.Mesh(
        new THREE.ConeGeometry(0.045, 0.18, 4),
        beamMat
      );
      crest.position.set(0, 0.42, dir * 0.08);
      crest.rotation.x = -dir * 0.3;
      prowGroup.add(crest);

      roofGroup.add(prowGroup);
    }
  }

  return roofGroup;
}

/**
 * Creates a painted round Viking wooden shield with an iron boss & rim.
 */
function buildVikingShield(
  radius: number,
  mainMat: THREE.Material,
  bossMat: THREE.Material
): THREE.Group {
  const sg = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.04, 14),
    mainMat
  );
  disc.rotation.z = Math.PI / 2;
  sg.add(disc);

  const boss = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.32, 8, 8),
    bossMat
  );
  boss.scale.set(0.55, 1, 1);
  boss.position.x = 0.02;
  sg.add(boss);
  return sg;
}

/**
 * Creates a carved Nordic Runestone monolith with glowing Elder Futhark etchings.
 */
function buildRunestoneMonolith(
  scale: number,
  stoneMat: THREE.Material,
  runeMat: THREE.Material
): THREE.Group {
  const rg = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.24 * scale, 0.14 * scale, 7),
    stoneMat
  );
  base.position.y = 0.07 * scale;
  rg.add(base);

  const stele = new THREE.Mesh(
    new THREE.ConeGeometry(0.16 * scale, 0.78 * scale, 5),
    stoneMat
  );
  stele.scale.set(1, 1, 0.55);
  stele.position.y = 0.44 * scale;
  rg.add(stele);

  // Glowing carved rune strip on the front face
  const runeStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.06 * scale, 0.42 * scale, 0.11 * scale),
    runeMat
  );
  runeStrip.position.set(0, 0.38 * scale, 0);
  rg.add(runeStrip);

  return rg;
}

/**
 * Creates a rough dry-stone boulder cluster for Nordic foundation corners.
 */
function addBoulderCluster(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  scale: number,
  stoneMat: THREE.Material
): void {
  const b1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 * scale, 0), stoneMat);
  b1.scale.set(1.2, 0.72, 1.0);
  b1.position.set(x, y + 0.1 * scale, z);
  parent.add(b1);

  const b2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15 * scale, 0), stoneMat);
  b2.scale.set(1.0, 0.65, 1.1);
  b2.position.set(x + 0.16 * scale, y + 0.07 * scale, z + 0.12 * scale);
  parent.add(b2);
}

// ─── 1. GREAT LONGHOUSE (Norse Town Center — Salão Comunal / Grande Casa Longa) ───

function buildNorseLonghouseTownCenter(
  group: THREE.Group,
  mats: NorseMaterials
): void {
  // 1. Massive Dry-Stacked Granite & Slate Plinth Terrace
  const stonePlinth = new THREE.Mesh(
    new THREE.BoxGeometry(5.1, 0.36, 5.1),
    mats.graniteStone
  );
  stonePlinth.position.y = 0.18;
  group.add(stonePlinth);

  const upperStoneDeck = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.18, 4.5),
    mats.slateStone
  );
  upperStoneDeck.position.y = 0.42;
  group.add(upperStoneDeck);

  // Wide front stone steps leading up to the Chieftain's Hall
  for (let i = 0; i < 3; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(1.7 - i * 0.12, 0.12, 0.38),
      mats.graniteStone
    );
    step.position.set(0, 0.08 + i * 0.12, 2.38 - i * 0.18);
    group.add(step);
  }

  // Corner stone boulder buttresses around foundation
  for (const [bx, bz] of [
    [-2.25, -2.25],
    [2.25, -2.25],
    [-2.25, 2.25],
    [2.25, 2.25],
  ]) {
    addBoulderCluster(group, bx, 0.18, bz, 1.35, mats.graniteStone);
  }

  // 2. Main Chieftain's Longhouse Timber Hull (Elongated Nordic Hall)
  const hallW = 2.45;
  const hallH = 1.25;
  const hallL = 3.75;
  const mainHall = new THREE.Mesh(
    new THREE.BoxGeometry(hallW, hallH, hallL),
    mats.timberWall
  );
  mainHall.position.set(0, 0.5 + hallH * 0.5, -0.1);
  group.add(mainHall);

  // Carved Rune Trim frieze around top of hall walls
  const frieze = new THREE.Mesh(
    new THREE.BoxGeometry(hallW + 0.08, 0.22, hallL + 0.08),
    mats.carvedTrim
  );
  frieze.position.set(0, 0.5 + hallH - 0.1, -0.1);
  group.add(frieze);

  // Curved exterior stave ribs / buttress timbers along both long walls
  for (let i = -3; i <= 3; i++) {
    const zPos = -0.1 + i * 0.52;
    for (const side of [-1, 1]) {
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, hallH + 0.12, 0.14),
        mats.darkBeam
      );
      rib.position.set(side * (hallW * 0.5 + 0.05), 0.5 + hallH * 0.5, zPos);
      group.add(rib);

      // Painted Viking Round Shields mounted between stave ribs
      if (Math.abs(i) <= 2) {
        const shield = buildVikingShield(
          0.19,
          (i + (side > 0 ? 1 : 0)) % 2 === 0 ? mats.teamBanner : mats.shieldAlt,
          mats.bronzeMetal
        );
        shield.position.set(side * (hallW * 0.5 + 0.09), 0.5 + hallH * 0.58, zPos + 0.25);
        if (side < 0) shield.rotation.y = Math.PI;
        group.add(shield);
      }
    }
  }

  // 3. Two-Tiered Steeply Pitched Stave Shingle Roof with Drakkar Dragon Prows
  const lowerRoof = buildPitchedStaveRoof(
    hallW + 0.45,
    1.15,
    hallL + 0.35,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  lowerRoof.position.set(0, 0.5 + hallH, -0.1);
  group.add(lowerRoof);

  // Upper raised clerestory roof tier (classic Jarl/King's Great Hall)
  const upperTierWalls = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.45, 2.35),
    mats.carvedTrim
  );
  upperTierWalls.position.set(0, 0.5 + hallH + 0.85, -0.1);
  group.add(upperTierWalls);

  const upperRoof = buildPitchedStaveRoof(
    1.55,
    0.82,
    2.55,
    mats.shingleRoof,
    mats.darkBeam,
    mats.bronzeMetal,
    true
  );
  upperRoof.position.set(0, 0.5 + hallH + 1.06, -0.1);
  group.add(upperRoof);

  // Central Smoke-Hole (Ljóri) Chimney Vent with glowing Hearth Ember
  const smokeVent = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.28, 0.46),
    mats.darkBeam
  );
  smokeVent.position.set(0, 0.5 + hallH + 1.85, -0.1);
  group.add(smokeVent);

  const hearthEmber = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 10),
    mats.emberGlow
  );
  hearthEmber.position.set(0, 0.5 + hallH + 1.98, -0.1);
  group.add(hearthEmber);

  // 4. Grand Carved Front Portico (Chieftain's Entrance)
  const porchRoof = buildPitchedStaveRoof(
    1.45,
    0.68,
    0.95,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  porchRoof.position.set(0, 1.42, 1.95);
  group.add(porchRoof);

  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 1.05, 8),
      mats.carvedTrim
    );
    pillar.position.set(side * 0.56, 0.98, 2.22);
    group.add(pillar);

    // Roaring bronze fire-brazier flanking the entrance steps
    const brazierStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 0.36, 8),
      mats.graniteStone
    );
    brazierStand.position.set(side * 0.92, 0.68, 2.15);
    group.add(brazierStand);

    const brazierBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.11, 0.14, 8),
      mats.bronzeMetal
    );
    brazierBowl.position.set(side * 0.92, 0.9, 2.15);
    group.add(brazierBowl);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.28, 6),
      mats.emberGlow
    );
    flame.position.set(side * 0.92, 1.08, 2.15);
    group.add(flame);

    // Tall Clan War-Banner Standard
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.035, 1.75, 6),
      mats.darkBeam
    );
    pole.position.set(side * 1.35, 1.32, 2.08);
    group.add(pole);

    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.72, 0.03),
      mats.teamBanner
    );
    banner.position.set(side * 1.35, 1.68, 2.12);
    group.add(banner);
  }

  // Heavy iron-bound arched wooden portal door
  const doorPortal = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.88, 0.12),
    mats.darkBeam
  );
  doorPortal.position.set(0, 0.94, 1.78);
  group.add(doorPortal);

  // 5. Side Annexes: Left Mead Storage Wing & Right Winter Provision Granary
  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.85, 1.85),
    mats.timberWall
  );
  leftWing.position.set(-1.62, 0.92, -0.25);
  group.add(leftWing);

  const leftWingRoof = buildPitchedStaveRoof(
    1.12,
    0.56,
    2.02,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    false
  );
  leftWingRoof.position.set(-1.62, 1.35, -0.25);
  group.add(leftWingRoof);

  // Stack of oak Mead Barrels & Supply Crates on the right terrace
  for (let b = 0; b < 3; b++) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.36, 10),
      mats.timberWall
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(1.62, 0.68, -0.75 + b * 0.42);
    group.add(barrel);
  }

  // Two sacred Runestones guarding the rear corners of the Great Longhouse
  for (const side of [-1, 1]) {
    const runestone = buildRunestoneMonolith(1.2, mats.graniteStone, mats.runeGlow);
    runestone.position.set(side * 1.82, 0.5, -1.85);
    runestone.rotation.y = side * 0.35;
    group.add(runestone);
  }
}

// ─── 2. MEAD HALL (Salão de Hidromel / Quartel Militar Nórdico) ─────────────

function buildNorseMeadHall(
  group: THREE.Group,
  mats: NorseMaterials,
  variant: 'infantry' | 'throwing_axemen' | 'raider_cavalry'
): void {
  // 1. Rugged Dry-Stone Foundation Platform
  const stoneBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.65, 0.32, 2.35),
    mats.graniteStone
  );
  stoneBase.position.y = 0.16;
  group.add(stoneBase);

  for (const [bx, bz] of [
    [-1.2, -1.02],
    [1.2, -1.02],
    [-1.2, 1.02],
    [1.2, 1.02],
  ]) {
    addBoulderCluster(group, bx, 0.12, bz, 0.85, mats.graniteStone);
  }

  // 2. Arched Timber Mead Hall Body
  const hallW = 1.68;
  const hallH = 0.92;
  const hallL = 1.82;
  const hallBody = new THREE.Mesh(
    new THREE.BoxGeometry(hallW, hallH, hallL),
    mats.timberWall
  );
  hallBody.position.set(0, 0.32 + hallH * 0.5, -0.08);
  group.add(hallBody);

  // Carved Nordic Knotwork Trim Band
  const trimBand = new THREE.Mesh(
    new THREE.BoxGeometry(hallW + 0.06, 0.16, hallL + 0.06),
    mats.carvedTrim
  );
  trimBand.position.set(0, 0.32 + hallH - 0.08, -0.08);
  group.add(trimBand);

  // Heavy timber buttresses + Viking shields along both eaves
  for (let i = -2; i <= 2; i++) {
    const zPos = -0.08 + i * 0.38;
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, hallH + 0.06, 0.1),
        mats.darkBeam
      );
      post.position.set(side * (hallW * 0.5 + 0.03), 0.32 + hallH * 0.5, zPos);
      group.add(post);

      if (Math.abs(i) <= 1) {
        const shield = buildVikingShield(
          0.14,
          (i + (side > 0 ? 1 : 0)) % 2 === 0 ? mats.teamBanner : mats.shieldAlt,
          mats.bronzeMetal
        );
        shield.position.set(side * (hallW * 0.5 + 0.06), 0.32 + hallH * 0.56, zPos + 0.18);
        if (side < 0) shield.rotation.y = Math.PI;
        group.add(shield);
      }
    }
  }

  // 3. Steeply Pitched Stave Roof with Crossed Wolf/Dragon Gable Horns
  const meadRoof = buildPitchedStaveRoof(
    hallW + 0.34,
    0.88,
    hallL + 0.26,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  meadRoof.position.set(0, 0.32 + hallH, -0.08);
  group.add(meadRoof);

  // Central Mead Hall Hearth Vent
  const vent = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.22, 0.32),
    mats.darkBeam
  );
  vent.position.set(0, 0.32 + hallH + 0.85, -0.08);
  group.add(vent);

  const ember = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 8, 8),
    mats.emberGlow
  );
  ember.position.set(0, 0.32 + hallH + 0.96, -0.08);
  group.add(ember);

  // 4. Grand Front Warrior Portal & Mead Barrels
  const portalArch = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.68, 0.22),
    mats.carvedTrim
  );
  portalArch.position.set(0, 0.66, 0.84);
  group.add(portalArch);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.58, 0.24),
    mats.darkBeam
  );
  door.position.set(0, 0.61, 0.84);
  group.add(door);

  // Great Mead Casks stacked beside the hall
  for (let c = 0; c < 2; c++) {
    const cask = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.28, 9),
      mats.timberWall
    );
    cask.rotation.z = Math.PI / 2;
    cask.position.set(-1.02, 0.46 + c * 0.22, 0.35 - c * 0.15);
    group.add(cask);
  }

  // Variant-specific military yard details
  if (variant === 'infantry') {
    // Weapon rack with Viking battle-axes & training dummy
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.38, 0.12),
      mats.darkBeam
    );
    rack.position.set(0.95, 0.51, 0.55);
    group.add(rack);

    const dummyPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.55, 6),
      mats.darkBeam
    );
    dummyPost.position.set(-0.92, 0.58, 0.78);
    group.add(dummyPost);

    const dummyShield = buildVikingShield(0.14, mats.teamBanner, mats.ironMetal);
    dummyShield.position.set(-0.92, 0.66, 0.84);
    dummyShield.rotation.y = Math.PI / 2;
    group.add(dummyShield);
  } else if (variant === 'throwing_axemen') {
    // Throwing-Axe Target Wheels in front yard
    for (const tx of [-0.85, 0.85]) {
      const targetStand = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.55, 0.08),
        mats.darkBeam
      );
      targetStand.position.set(tx, 0.58, 0.88);
      group.add(targetStand);

      const targetWheel = buildVikingShield(0.18, mats.shieldAlt, mats.teamBanner);
      targetWheel.position.set(tx, 0.68, 0.94);
      targetWheel.rotation.y = Math.PI / 2;
      group.add(targetWheel);
    }
  } else if (variant === 'raider_cavalry') {
    // Raider Stalls & Water Trough on right side
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.18, 0.68),
      mats.darkBeam
    );
    trough.position.set(1.02, 0.41, 0.25);
    group.add(trough);

    const hitchingRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.06, 0.06),
      mats.darkBeam
    );
    hitchingRail.position.set(0.72, 0.62, 0.92);
    group.add(hitchingRail);
  }
}

// ─── 3. NORDIC STAVE TEMPLE (Templo Nórdico / Hof) ──────────────────────────

function buildNorseStaveTemple(
  group: THREE.Group,
  mats: NorseMaterials
): { beaconCrystal: THREE.Object3D } {
  // 1. Two-Tiered Sacred Runic Stone Plinth
  const lowerPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.28, 2.6),
    mats.graniteStone
  );
  lowerPlinth.position.y = 0.14;
  group.add(lowerPlinth);

  const upperPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 0.24, 2.15),
    mats.slateStone
  );
  upperPlinth.position.y = 0.4;
  group.add(upperPlinth);

  // Sacred stone steps leading to the Hof
  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(0.95 - s * 0.08, 0.1, 0.24),
      mats.graniteStone
    );
    step.position.set(0, 0.1 + s * 0.12, 1.25 - s * 0.12);
    group.add(step);
  }

  // 2. Four Sacred Runestones at the Four Cardinal Corners of the Temple Plinth
  for (const [rx, rz] of [
    [-1.08, -1.08],
    [1.08, -1.08],
    [-1.08, 1.08],
    [1.08, 1.08],
  ]) {
    const runestone = buildRunestoneMonolith(0.95, mats.graniteStone, mats.runeGlow);
    runestone.position.set(rx, 0.28, rz);
    runestone.rotation.y = Math.atan2(rx, rz);
    group.add(runestone);
  }

  // 3. Multi-Tiered Borgund-Inspired Stave Church Architecture
  // Tier 1: Outer Ambulatory Stave Gallery & Corner Stave Columns
  const tier1Body = new THREE.Mesh(
    new THREE.BoxGeometry(1.58, 0.78, 1.58),
    mats.timberWall
  );
  tier1Body.position.set(0, 0.52 + 0.39, -0.05);
  group.add(tier1Body);

  for (const [cx, cz] of [
    [-0.78, -0.83],
    [0.78, -0.83],
    [-0.78, 0.73],
    [0.78, 0.73],
  ]) {
    const stavePillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.92, 8),
      mats.carvedTrim
    );
    stavePillar.position.set(cx, 0.52 + 0.44, cz);
    group.add(stavePillar);
  }

  const tier1Roof = buildPitchedStaveRoof(
    1.86,
    0.58,
    1.82,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  tier1Roof.position.set(0, 0.52 + 0.76, -0.05);
  group.add(tier1Roof);

  // Tier 2: Raised Inner Sanctum Nave
  const tier2Body = new THREE.Mesh(
    new THREE.BoxGeometry(1.08, 0.62, 1.08),
    mats.carvedTrim
  );
  tier2Body.position.set(0, 0.52 + 1.22, -0.05);
  group.add(tier2Body);

  const tier2Roof = buildPitchedStaveRoof(
    1.34,
    0.55,
    1.32,
    mats.shingleRoof,
    mats.darkBeam,
    mats.bronzeMetal,
    true
  );
  tier2Roof.position.set(0, 0.52 + 1.5, -0.05);
  group.add(tier2Roof);

  // Crossed Transverse Gable on Tier 2 (giving 4-way Nordic Dragon Prows!)
  const crossRoof = buildPitchedStaveRoof(
    1.28,
    0.52,
    1.32,
    mats.shingleRoof,
    mats.darkBeam,
    mats.bronzeMetal,
    true
  );
  crossRoof.rotation.y = Math.PI / 2;
  crossRoof.position.set(0, 0.52 + 1.5, -0.05);
  group.add(crossRoof);

  // Tier 3: High Runic Turret Spire (Asgard Sky-Spire)
  const spireTurret = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.36, 0.52, 8),
    mats.darkBeam
  );
  spireTurret.position.set(0, 0.52 + 2.02, -0.05);
  group.add(spireTurret);

  const spireCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 0.68, 8),
    mats.shingleRoof
  );
  spireCone.position.set(0, 0.52 + 2.52, -0.05);
  group.add(spireCone);

  // 4. Sacrificial Viking Fire Altar in Front Courtyard
  const altarPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.28, 8),
    mats.graniteStone
  );
  altarPedestal.position.set(0, 0.66, 0.92);
  group.add(altarPedestal);

  const altarFlame = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.15, 0),
    mats.emberGlow
  );
  altarFlame.position.set(0, 0.88, 0.92);
  group.add(altarFlame);

  // 5. Floating Runic Ice/Favor Beacon Crystal above Spire (animated by engine.ts)
  const beaconCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    mats.runeGlow
  );
  beaconCrystal.position.set(0, 3.55, -0.05);
  group.add(beaconCrystal);

  return { beaconCrystal };
}

// ─── 4. NORSE HILL FORT (Forte da Colina / Fortress) ────────────────────────

function buildNorseHillFort(
  group: THREE.Group,
  mats: NorseMaterials
): void {
  // 1. Raised Earth-and-Granite Motte Mound
  const motteMound = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 2.15, 0.48, 12),
    mats.graniteStone
  );
  motteMound.position.y = 0.24;
  group.add(motteMound);

  // 2. Perimeter Sharpened-Log Timber Palisade Wall with 4 Corner Watchtowers
  const palisadeRadius = 1.48;
  const numLogs = 36;
  for (let i = 0; i < numLogs; i++) {
    const angle = (i / numLogs) * Math.PI * 2;
    // Leave opening at front gate (angle near 0)
    if (Math.abs(Math.sin(angle)) < 0.24 && Math.cos(angle) > 0) continue;
    const lx = Math.sin(angle) * palisadeRadius;
    const lz = Math.cos(angle) * palisadeRadius;
    const logH = 0.72 + (i % 3) * 0.05;
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.075, logH, 6),
      mats.darkBeam
    );
    log.position.set(lx, 0.48 + logH * 0.5, lz);
    group.add(log);
  }

  // Four Corner Timber Watchtowers with Viking Shields
  for (const [tx, tz] of [
    [-1.08, -1.08],
    [1.08, -1.08],
    [-1.08, 1.08],
    [1.08, 1.08],
  ]) {
    const towerBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 1.15, 0.56),
      mats.timberWall
    );
    towerBase.position.set(tx, 0.48 + 0.575, tz);
    group.add(towerBase);

    const towerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(0.46, 0.48, 4),
      mats.shingleRoof
    );
    towerRoof.rotation.y = Math.PI / 4;
    towerRoof.position.set(tx, 0.48 + 1.38, tz);
    group.add(towerRoof);
  }

  // 3. Towering Central Jarl's Keep inside the Hill Fort
  const centralKeep = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 1.25, 1.35),
    mats.timberWall
  );
  centralKeep.position.set(0, 0.48 + 0.625, -0.08);
  group.add(centralKeep);

  const keepRoof = buildPitchedStaveRoof(
    1.48,
    0.82,
    1.55,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  keepRoof.position.set(0, 0.48 + 1.25, -0.08);
  group.add(keepRoof);

  // Heavy Iron-Bound Gatehouse Arch at Front
  const gatehouse = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.92, 0.36),
    mats.carvedTrim
  );
  gatehouse.position.set(0, 0.48 + 0.46, 1.45);
  group.add(gatehouse);
}

// ─── 5. OTHER NORDIC BUILDINGS (House, Armory, Siege, Tower, Market, Farm, Titan Gate) ───

function buildNorseHouse(group: THREE.Group, mats: NorseMaterials): void {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.2, 1.02),
    mats.graniteStone
  );
  base.position.y = 0.1;
  group.add(base);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 0.52, 0.82),
    mats.timberWall
  );
  cabin.position.y = 0.46;
  group.add(cabin);

  const roof = buildPitchedStaveRoof(
    1.14,
    0.48,
    0.98,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  roof.position.y = 0.72;
  group.add(roof);

  const shield = buildVikingShield(0.12, mats.teamBanner, mats.bronzeMetal);
  shield.position.set(0, 0.62, 0.44);
   shield.rotation.y = Math.PI / 2;
  group.add(shield);
}

function buildNorseDwarvenArmory(group: THREE.Group, mats: NorseMaterials): void {
  // Heavy Dwarven Granite & Timber Smithy of Nidavellir
  const stoneBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.28, 1.85),
    mats.graniteStone
  );
  stoneBase.position.y = 0.14;
  group.add(stoneBase);

  const forgeHall = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.82, 1.32),
    mats.timberWall
  );
  forgeHall.position.set(-0.28, 0.68, -0.05);
  group.add(forgeHall);

  const forgeRoof = buildPitchedStaveRoof(
    1.42,
    0.62,
    1.48,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  forgeRoof.position.set(-0.28, 1.09, -0.05);
  group.add(forgeRoof);

  // Towering Dwarven Stone Blast Furnace with Molten Gold Glow
  const furnace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.44, 1.55, 8),
    mats.graniteStone
  );
  furnace.position.set(0.55, 0.92, -0.25);
  group.add(furnace);

  const furnaceFire = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 10),
    mats.emberGlow
  );
  furnaceFire.position.set(0.55, 0.56, 0.08);
  group.add(furnaceFire);

  // Runic Dwarven Anvil on stone block
  const anvilBlock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.24, 8),
    mats.darkBeam
  );
  anvilBlock.position.set(0.48, 0.4, 0.52);
  group.add(anvilBlock);

  const anvilTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.14, 0.16),
    mats.ironMetal
  );
  anvilTop.position.set(0.48, 0.56, 0.52);
  group.add(anvilTop);
}

function buildNorseTower(group: THREE.Group, mats: NorseMaterials): void {
  const stoneFnd = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.82, 0.55, 8),
    mats.graniteStone
  );
  stoneFnd.position.y = 0.275;
  group.add(stoneFnd);

  const timberShaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 1.45, 0.88),
    mats.timberWall
  );
  timberShaft.position.y = 1.25;
  group.add(timberShaft);

  const watchGallery = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 0.34, 1.12),
    mats.carvedTrim
  );
  watchGallery.position.y = 2.08;
  group.add(watchGallery);

  const staveRoof = buildPitchedStaveRoof(
    1.28,
    0.68,
    1.28,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  staveRoof.position.y = 2.25;
  group.add(staveRoof);

  for (const side of [-1, 1]) {
    const shield = buildVikingShield(0.16, mats.teamBanner, mats.bronzeMetal);
    shield.position.set(side * 0.58, 2.08, 0);
    if (side < 0) shield.rotation.y = Math.PI;
    group.add(shield);
  }
}

function buildNorseSiegeWorks(group: THREE.Group, mats: NorseMaterials): void {
  const stonePad = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 0.24, 2.15),
    mats.graniteStone
  );
  stonePad.position.y = 0.12;
  group.add(stonePad);

  const workshop = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.85, 1.55),
    mats.timberWall
  );
  workshop.position.set(-0.48, 0.66, -0.1);
  group.add(workshop);

  const roof = buildPitchedStaveRoof(
    1.45,
    0.62,
    1.72,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  roof.position.set(-0.48, 1.08, -0.1);
  group.add(roof);

  // Timber A-frame Gantry Crane & Battering Ram under construction
  const craneBeam = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.12, 0.12),
    mats.darkBeam
  );
  craneBeam.position.set(0.45, 1.25, 0);
  group.add(craneBeam);

  const ramLog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 1.15, 8),
    mats.carvedTrim
  );
  ramLog.rotation.x = Math.PI / 2;
  ramLog.position.set(0.55, 0.58, 0.1);
  group.add(ramLog);
}

function buildNorseMarket(group: THREE.Group, mats: NorseMaterials): void {
  const stonePad = new THREE.Mesh(
    new THREE.BoxGeometry(2.25, 0.22, 1.95),
    mats.graniteStone
  );
  stonePad.position.y = 0.11;
  group.add(stonePad);

  const tradeHall = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.78, 1.15),
    mats.timberWall
  );
  tradeHall.position.set(-0.35, 0.61, -0.2);
  group.add(tradeHall);

  const roof = buildPitchedStaveRoof(
    1.42,
    0.56,
    1.32,
    mats.shingleRoof,
    mats.darkBeam,
    mats.carvedTrim,
    true
  );
  roof.position.set(-0.35, 1.0, -0.2);
  group.add(roof);

  // Ox-Cart & Fur/Amber Trade Stalls in yard
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.08, 0.75),
    mats.teamBanner
  );
  canopy.position.set(0.55, 0.85, 0.25);
  canopy.rotation.z = -0.12;
  group.add(canopy);

  for (let b = 0; b < 3; b++) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.28, 8),
      mats.timberWall
    );
    barrel.position.set(0.55 + (b - 1) * 0.26, 0.36, 0.28);
    group.add(barrel);
  }
}

function buildNorseFarm(group: THREE.Group, mats: NorseMaterials): void {
  const soil = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.08, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x452c16, roughness: 0.96 })
  );
  soil.position.y = 0.04;
  group.add(soil);

  // Low Nordic dry-stone boundary wall around barley field
  for (const [wx, wz, ww, wd] of [
    [0, -1.06, 2.2, 0.12],
    [0, 1.06, 2.2, 0.12],
    [-1.06, 0, 0.12, 2.2],
    [1.06, 0, 0.12, 2.2],
  ]) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(ww, 0.18, wd),
      mats.graniteStone
    );
    wall.position.set(wx, 0.1, wz);
    group.add(wall);
  }

  for (let r = -2; r <= 2; r++) {
    const row = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.14, 0.2),
      mats.thatchGold
    );
    row.position.set(0, 0.12, r * 0.36);
    group.add(row);
  }
}

function buildNorseTitanGate(
  group: THREE.Group,
  mats: NorseMaterials
): { beaconCrystal: THREE.Object3D; vortexRing: THREE.Object3D } {
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(2.35, 2.75, 0.45, 12),
    mats.graniteStone
  );
  plinth.position.y = 0.225;
  group.add(plinth);

  // Circle of 8 Colossal Jotunheim Runestone Monoliths
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const mono = buildRunestoneMonolith(2.2, mats.graniteStone, mats.runeGlow);
    mono.position.set(Math.cos(angle) * 1.95, 0.42, Math.sin(angle) * 1.95);
    mono.rotation.y = -angle + Math.PI / 2;
    group.add(mono);
  }

  const vortexRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.12, 12, 32),
    mats.runeGlow
  );
  vortexRing.rotation.x = Math.PI / 2;
  vortexRing.position.y = 0.62;
  group.add(vortexRing);

  const beaconCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.52, 1),
    mats.runeGlow
  );
  beaconCrystal.position.y = 1.65;
  group.add(beaconCrystal);

  return { beaconCrystal, vortexRing };
}

// ─── Main Export: Norse Building Dispatcher ─────────────────────────────────

export interface NorseBuildingBuildResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
}

export function createNorseBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: any,
  enableShadows = true
): NorseBuildingBuildResult {
  const group = new THREE.Group();
  const mats = createNorseMaterials(team, pal);

  let markerRadius = 1.45;
  let barHeight = 2.65;
  let barWidth = 1.65;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;

  switch (kind) {
    case 'town_center':
      buildNorseLonghouseTownCenter(group, mats);
      group.scale.setScalar(1.06);
      markerRadius = 3.65;
      barHeight = 3.85;
      barWidth = 3.0;
      break;
    case 'barracks':
      buildNorseMeadHall(group, mats, 'infantry');
      group.scale.setScalar(1.72);
      markerRadius = 2.7;
      barHeight = 4.4;
      barWidth = 2.6;
      break;
    case 'archery_range':
      buildNorseMeadHall(group, mats, 'throwing_axemen');
      group.scale.setScalar(1.68);
      markerRadius = 2.65;
      barHeight = 4.3;
      barWidth = 2.55;
      break;
    case 'stable':
      buildNorseMeadHall(group, mats, 'raider_cavalry');
      group.scale.setScalar(1.7);
      markerRadius = 2.7;
      barHeight = 4.35;
      barWidth = 2.6;
      break;
    case 'temple': {
      const res = buildNorseStaveTemple(group, mats);
      beaconCrystal = res.beaconCrystal;
      group.scale.setScalar(1.85);
      markerRadius = 3.0;
      barHeight = 6.6;
      barWidth = 2.8;
      break;
    }
    case 'fortress':
      buildNorseHillFort(group, mats);
      group.scale.setScalar(1.65);
      markerRadius = 3.4;
      barHeight = 5.2;
      barWidth = 3.2;
      break;
    case 'house':
      buildNorseHouse(group, mats);
      group.scale.setScalar(1.48);
      markerRadius = 1.15;
      barHeight = 2.05;
      barWidth = 1.3;
      break;
    case 'armory':
      buildNorseDwarvenArmory(group, mats);
      group.scale.setScalar(1.75);
      markerRadius = 2.6;
      barHeight = 4.3;
      barWidth = 2.5;
      break;
    case 'siege_works':
      buildNorseSiegeWorks(group, mats);
      group.scale.setScalar(1.75);
      markerRadius = 2.75;
      barHeight = 4.2;
      barWidth = 2.6;
      break;
    case 'market':
      buildNorseMarket(group, mats);
      group.scale.setScalar(1.75);
      markerRadius = 2.65;
      barHeight = 4.0;
      barWidth = 2.5;
      break;
    case 'tower':
      buildNorseTower(group, mats);
      group.scale.setScalar(1.95);
      markerRadius = 1.6;
      barHeight = 6.8;
      barWidth = 1.9;
      break;
    case 'farm':
      buildNorseFarm(group, mats);
      group.scale.setScalar(1.95);
      markerRadius = 2.2;
      barHeight = 2.4;
      barWidth = 2.0;
      break;
    case 'titan_gate': {
      const res = buildNorseTitanGate(group, mats);
      beaconCrystal = res.beaconCrystal;
      vortexRing = res.vortexRing;
      group.scale.setScalar(1.65);
      markerRadius = 4.2;
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
  };
}
