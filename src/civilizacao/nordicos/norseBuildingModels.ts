import * as THREE from 'three';
import { BuildingKind, PantheonId, TeamId } from '../../game/types';
import { buildNorseHillFort as buildProceduralNorseHillFort } from './norseFortressModel';

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

// ─── 1. GREAT LONGHOUSE / TENSHU / DRUIDIC HALL / SUN-DANCE LODGE / FROST CITADEL (Town Center T1–T5 Metrópole) ───

function buildNorseLonghouseTownCenter(
  group: THREE.Group,
  mats: NorseMaterials,
  age = 1,
  pantheon: PantheonId = 'norse'
): { metropolisHalo?: THREE.Object3D; metropolisCrystal?: THREE.Object3D } {
  const tier = Math.max(1, Math.min(5, Math.round(age)));
  const isJapanese = pantheon === 'japanese';
  const isCeltic = pantheon === 'celtic';
  const isLakota = pantheon === 'lakota';
  const isJotunn = pantheon === 'jotunn';

  // 1. Dry-Stacked Granite & Slate Plinth Terrace (expands T1 → T5)
  const plinthW = 4.35 + tier * 0.34;
  const stonePlinth = new THREE.Mesh(
    new THREE.BoxGeometry(plinthW, 0.34, plinthW),
    isLakota ? mats.timberWall : mats.graniteStone
  );
  stonePlinth.position.y = 0.17;
  group.add(stonePlinth);

  let deckY = 0.34;
  if (tier >= 2) {
    const upperW = plinthW - 0.56;
    const upperStoneDeck = new THREE.Mesh(
      new THREE.BoxGeometry(upperW, 0.2, upperW),
      isJotunn ? mats.runeGlow : mats.slateStone
    );
    upperStoneDeck.position.y = deckY + 0.1;
    group.add(upperStoneDeck);
    deckY += 0.2;
  }

  // Wide front stone steps leading up to the Hall
  const stepCount = tier >= 3 ? 3 : 2;
  for (let i = 0; i < stepCount; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(1.65 - i * 0.12, 0.12, 0.36),
      mats.graniteStone
    );
    step.position.set(0, 0.08 + i * 0.12, plinthW * 0.5 + 0.1 - i * 0.16);
    group.add(step);
  }

  // Corner stone boulder buttresses around foundation (T2+)
  if (tier >= 2) {
    const cOff = plinthW * 0.44;
    for (const [bx, bz] of [
      [-cOff, -cOff],
      [cOff, -cOff],
      [-cOff, cOff],
      [cOff, cOff],
    ]) {
      addBoulderCluster(group, bx, 0.16, bz, 1.15 + tier * 0.1, mats.graniteStone);
    }
  }

  // 2. Main Hall / Cultural Core (grows from modest T1 Longhouse to Grand T5 Metropolis Citadel)
  const hallW = 2.0 + tier * 0.2;
  const hallH = 1.0 + tier * 0.16;
  const hallL = 2.95 + tier * 0.28;
  const wallMat = isJapanese
    ? mats.slateStone
    : isJotunn
    ? mats.slateStone
    : isLakota
    ? mats.thatchGold
    : mats.timberWall;
  const roofMat = isJapanese
    ? mats.slateStone
    : isCeltic || isLakota
    ? mats.thatchGold
    : mats.shingleRoof;
  const trimMat = isJapanese
    ? mats.teamBanner
    : isJotunn
    ? mats.runeGlow
    : mats.carvedTrim;

  if (isLakota && tier <= 2) {
    // Circular Sacred Earth Lodge
    const lodge = new THREE.Mesh(
      new THREE.CylinderGeometry(hallW * 0.65, hallW * 0.78, hallH, 12),
      mats.thatchGold
    );
    lodge.position.set(0, deckY + hallH * 0.5, -0.1);
    group.add(lodge);
  } else {
    const mainHall = new THREE.Mesh(
      new THREE.BoxGeometry(hallW, hallH, hallL),
      wallMat
    );
    mainHall.position.set(0, deckY + hallH * 0.5, -0.1);
    group.add(mainHall);
  }

  // Carved Rune / Lacquer Trim frieze around top of hall walls (T2+)
  if (tier >= 2 && !(isLakota && tier <= 2)) {
    const frieze = new THREE.Mesh(
      new THREE.BoxGeometry(hallW + 0.08, 0.2, hallL + 0.08),
      trimMat
    );
    frieze.position.set(0, deckY + hallH - 0.08, -0.1);
    group.add(frieze);
  }

  // Exterior Stave Buttresses & Viking Shields (T2+ for Norse/Celtic/Jotunn)
  if (!isLakota && !isJapanese) {
    const ribCount = tier >= 3 ? 3 : 2;
    for (let i = -ribCount; i <= ribCount; i++) {
      const zPos = -0.1 + i * (hallL / (ribCount * 2 + 1));
      for (const side of [-1, 1]) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, hallH + 0.1, 0.13),
          mats.darkBeam
        );
        rib.position.set(side * (hallW * 0.5 + 0.04), deckY + hallH * 0.5, zPos);
        group.add(rib);

        if (tier >= 2 && Math.abs(i) <= ribCount - 1) {
          const shield = buildVikingShield(
            0.18,
            (i + (side > 0 ? 1 : 0)) % 2 === 0 ? mats.teamBanner : mats.shieldAlt,
            tier >= 4 ? mats.bronzeMetal : mats.ironMetal
          );
          shield.position.set(side * (hallW * 0.5 + 0.08), deckY + hallH * 0.58, zPos + 0.2);
          if (side < 0) shield.rotation.y = Math.PI;
          group.add(shield);
        }
      }
    }
  }

  // 3. Roof Tiers: Pitched Stave Roof / Japanese Tenshu Tiers / Lakota Grand Sun-Dance Pavilion
  let roofApexY = deckY + hallH;
  if (isJapanese) {
    // Japanese Tenshu Castle Tiered Pagoda Roofs (1 tier at T1 → 3 tiers at T4-T5)
    const pagodaTiers = tier >= 4 ? 3 : tier >= 2 ? 2 : 1;
    let curY = deckY + hallH;
    for (let pt = 0; pt < pagodaTiers; pt++) {
      const scale = 1 - pt * 0.26;
      if (pt > 0) {
        const story = new THREE.Mesh(
          new THREE.BoxGeometry(hallW * scale * 0.78, 0.68, hallL * scale * 0.74),
          mats.timberWall
        );
        story.position.set(0, curY + 0.34, -0.1);
        group.add(story);
        curY += 0.68;
      }
      const pRoof = buildPitchedStaveRoof(
        (hallW + 0.5) * scale,
        0.58,
        (hallL + 0.45) * scale,
        roofMat,
        mats.darkBeam,
        pt === pagodaTiers - 1 && tier >= 4 ? mats.bronzeMetal : trimMat,
        pt === pagodaTiers - 1
      );
      pRoof.position.set(0, curY, -0.1);
      group.add(pRoof);
      curY += 0.55;
    }
    roofApexY = curY;

    // Crimson Torii Gate at front entrance (T2+)
    if (tier >= 2) {
      for (const side of [-0.65, 0.65]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.1, 1.35, 8),
          mats.teamBanner
        );
        post.position.set(side, deckY + 0.675, plinthW * 0.43);
        group.add(post);
      }
      const kasagi = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.14, 0.16),
        mats.teamBanner
      );
      kasagi.position.set(0, deckY + 1.35, plinthW * 0.43);
      group.add(kasagi);
    }
  } else {
    // Standard Nordic / Celtic / Lakota / Jotunn Roof Progression
    const lowerRoofH = 0.85 + tier * 0.08;
    const lowerRoof = buildPitchedStaveRoof(
      hallW + 0.42,
      lowerRoofH,
      hallL + 0.32,
      roofMat,
      mats.darkBeam,
      tier >= 4 ? mats.bronzeMetal : mats.carvedTrim,
      tier >= 2
    );
    lowerRoof.position.set(0, deckY + hallH, -0.1);
    group.add(lowerRoof);
    roofApexY = deckY + hallH + lowerRoofH;

    // T3+: Upper Raised Jarl Clerestory Tier
    if (tier >= 3) {
      const upperWalls = new THREE.Mesh(
        new THREE.BoxGeometry(1.25 + (tier - 3) * 0.18, 0.48, 2.15 + (tier - 3) * 0.25),
        tier >= 4 ? mats.bronzeMetal : mats.carvedTrim
      );
      upperWalls.position.set(0, deckY + hallH + 0.82, -0.1);
      group.add(upperWalls);

      const upperRoof = buildPitchedStaveRoof(
        1.5 + (tier - 3) * 0.2,
        0.82,
        2.35 + (tier - 3) * 0.28,
        roofMat,
        mats.darkBeam,
        tier >= 4 ? mats.bronzeMetal : mats.carvedTrim,
        true
      );
      upperRoof.position.set(0, deckY + hallH + 1.04, -0.1);
      group.add(upperRoof);
      roofApexY = deckY + hallH + 1.88;
    }
  }

  // Central Smoke-Hole (Ljóri) Chimney Vent with glowing Hearth Ember
  const smokeVent = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.26, 0.44),
    mats.darkBeam
  );
  smokeVent.position.set(0, roofApexY + 0.05, -0.1);
  group.add(smokeVent);

  const hearthEmber = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 10, 10),
    isJotunn ? mats.runeGlow : mats.emberGlow
  );
  hearthEmber.position.set(0, roofApexY + 0.18, -0.1);
  group.add(hearthEmber);

  // 4. Grand Carved Front Portico, Braziers & Banners (scales T1 → T5)
  const porchZ = -0.1 + hallL * 0.5 + 0.28;
  const porchRoof = buildPitchedStaveRoof(
    1.38,
    0.64,
    0.9,
    roofMat,
    mats.darkBeam,
    mats.carvedTrim,
    tier >= 2
  );
  porchRoof.position.set(0, deckY + 0.92, porchZ);
  group.add(porchRoof);

  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 1.0, 8),
      mats.carvedTrim
    );
    pillar.position.set(side * 0.54, deckY + 0.48, porchZ + 0.24);
    group.add(pillar);

    if (tier >= 2) {
      const brazierStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.17, 0.34, 8),
        mats.graniteStone
      );
      brazierStand.position.set(side * 0.94, deckY + 0.17, porchZ + 0.22);
      group.add(brazierStand);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.28, 6),
        isJotunn ? mats.runeGlow : mats.emberGlow
      );
      flame.position.set(side * 0.94, deckY + 0.48, porchZ + 0.22);
      group.add(flame);
    }

    // Clan War-Banner Standard (1 at T1, 2 at T2+)
    if (tier >= 2 || side === -1) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.035, 1.65 + tier * 0.22, 6),
        mats.darkBeam
      );
      pole.position.set(side * 1.38, deckY + (1.65 + tier * 0.22) * 0.5, porchZ + 0.14);
      group.add(pole);

      const banner = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.72, 0.03),
        mats.teamBanner
      );
      banner.position.set(side * 1.38, deckY + 1.2 + tier * 0.2, porchZ + 0.18);
      group.add(banner);
    }
  }

  // Heavy iron-bound portal door
  const doorPortal = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.86, 0.12),
    mats.darkBeam
  );
  doorPortal.position.set(0, deckY + 0.43, -0.1 + hallL * 0.5 + 0.02);
  group.add(doorPortal);

  // 5. Flanking Annexes & Runestones (T3 Left Mead Wing + Runestones; T4 Symmetric Right Armory/War-Hall Wing + 4 Corner Runestones)
  if (tier >= 3) {
    const leftWing = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.85, 1.85),
      wallMat
    );
    leftWing.position.set(-(hallW * 0.5 + 0.52), deckY + 0.425, -0.2);
    group.add(leftWing);

    const leftWingRoof = buildPitchedStaveRoof(
      1.12,
      0.54,
      2.02,
      roofMat,
      mats.darkBeam,
      mats.carvedTrim,
      tier >= 4
    );
    leftWingRoof.position.set(-(hallW * 0.5 + 0.52), deckY + 0.85, -0.2);
    group.add(leftWingRoof);

    for (let b = 0; b < 3; b++) {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.34, 10),
        mats.timberWall
      );
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(hallW * 0.5 + 0.48, deckY + 0.18, -0.75 + b * 0.42);
      group.add(barrel);
    }

    // Two sacred Runestones / Totems / Stonehenge Pillars
    for (const side of [-1, 1]) {
      const runestone = buildRunestoneMonolith(
        1.15 + (tier - 3) * 0.15,
        mats.graniteStone,
        isCeltic ? mats.bronzeMetal : mats.runeGlow
      );
      runestone.position.set(side * (plinthW * 0.36), deckY, -plinthW * 0.36);
      runestone.rotation.y = side * 0.35;
      group.add(runestone);
    }
  }

  if (tier >= 4) {
    // Symmetric Right War-Hall Wing (or Lakota Tipi Pavilion)
    const rightWing = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.85, 1.85),
      wallMat
    );
    rightWing.position.set(hallW * 0.5 + 0.52, deckY + 0.425, -0.2);
    group.add(rightWing);

    const rightWingRoof = buildPitchedStaveRoof(
      1.12,
      0.54,
      2.02,
      roofMat,
      mats.darkBeam,
      mats.bronzeMetal,
      true
    );
    rightWingRoof.position.set(hallW * 0.5 + 0.52, deckY + 0.85, -0.2);
    group.add(rightWingRoof);

    // Front Corner Runestones / Totem Pillars (completing 4-corner sacred perimeter)
    for (const side of [-1, 1]) {
      const frontStone = buildRunestoneMonolith(1.25, mats.graniteStone, mats.runeGlow);
      frontStone.position.set(side * (plinthW * 0.38), deckY, plinthW * 0.36);
      group.add(frontStone);
    }
  }

  // 6. T5 DIVINE VALHALLA METROPOLIS CROWN (Borgund Sky-Spire, Bifrost Rune Halo & Glowing Crystal)
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  if (tier >= 5) {
    const skyTurret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.58, 0.78, 8),
      mats.bronzeMetal
    );
    skyTurret.position.set(0, roofApexY + 0.48, -0.1);
    group.add(skyTurret);

    const skySpire = new THREE.Mesh(
      new THREE.ConeGeometry(0.56, 1.15, 8),
      roofMat
    );
    skySpire.position.set(0, roofApexY + 1.42, -0.1);
    group.add(skySpire);

    const haloY = roofApexY + 2.25;
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.32, 0.075, 10, 32),
      isJotunn ? mats.emberGlow : mats.runeGlow
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, haloY, -0.1);
    halo.userData.baseY = haloY;
    group.add(halo);
    metropolisHalo = halo;

    const crystalY = roofApexY + 2.48;
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      isJapanese || isCeltic ? mats.bronzeMetal : mats.runeGlow
    );
    crystal.position.set(0, crystalY, -0.1);
    crystal.userData.baseY = crystalY;
    group.add(crystal);
    metropolisCrystal = crystal;
  }

  return { metropolisHalo, metropolisCrystal };
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
  _mats: NorseMaterials,
  age: number = 3,
  godKey: string = 'odin'
): { metropolisHalo?: THREE.Object3D; metropolisCrystal?: THREE.Object3D } {
  const effTier = age >= 4 ? 4 : 3;
  const fortress = buildProceduralNorseHillFort(godKey, effTier, true);
  group.add(fortress.root);
  return {
    metropolisHalo: fortress.frostRing
  };
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
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

export function createNorseBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: any,
  enableShadows = true,
  age = 1,
  pantheon: PantheonId = 'norse',
  majorGod?: string
): NorseBuildingBuildResult {
  const group = new THREE.Group();
  const mats = createNorseMaterials(team, pal);

  let markerRadius = 1.45;
  let barHeight = 2.65;
  let barWidth = 1.65;
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let metropolisHalo: THREE.Object3D | undefined;
  let metropolisCrystal: THREE.Object3D | undefined;

  switch (kind) {
    case 'town_center': {
      const res = buildNorseLonghouseTownCenter(group, mats, age, pantheon);
      metropolisHalo = res.metropolisHalo;
      metropolisCrystal = res.metropolisCrystal;
      group.scale.setScalar(1.0 + (age - 1) * 0.055);
      markerRadius = 3.55 + (age - 1) * 0.22;
      barHeight = 3.65 + (age - 1) * 0.58;
      barWidth = 3.0 + (age - 1) * 0.15;
      break;
    }
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
    case 'fortress': {
      const rawGod = (majorGod || String(pantheon || 'odin')).toLowerCase();
      const effGod = rawGod.includes('thor')
        ? 'thor'
        : rawGod.includes('loki')
        ? 'loki'
        : rawGod.includes('freyr')
        ? 'freyr'
        : 'odin';
      const res = buildNorseHillFort(group, mats, age, effGod);
      metropolisHalo = res.metropolisHalo;
      metropolisCrystal = res.metropolisCrystal;
      group.scale.setScalar(1.22 + (age - 3) * 0.05);
      markerRadius = 3.4 + (age - 3) * 0.25;
      barHeight = 5.0 + (age - 3) * 0.45;
      barWidth = 3.2 + (age - 3) * 0.15;
      break;
    }
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
    metropolisHalo,
    metropolisCrystal,
  };
}
