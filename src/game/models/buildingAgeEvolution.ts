import * as THREE from 'three';
import { AgeLevel, ArchStyleId, BuildingKind, PantheonId, TeamId } from '../types';
import { getCivLook, MaterialPalette } from './palette';

export interface BuildingAgeEvolutionResult {
  barHeightDelta: number;
  markerRadiusDelta: number;
  addedFlames: THREE.Object3D[];
  beaconCrystal?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

/**
 * Buildings that already implement full bespoke procedural geometry across
 * Ages (T1-T5 or T3-T5) inside their own dedicated builders.
 */
export function hasBespokeAgeEvolution(style: ArchStyleId, kind: BuildingKind): boolean {
  if (kind === 'wall' || kind === 'gate') return true;
  if (kind === 'town_center') return true;
  if (style === 'greek') {
    return (
      kind === 'house' ||
      kind === 'temple' ||
      kind === 'fortress' ||
      kind === 'barracks' ||
      kind === 'stable' ||
      kind === 'archery_range' ||
      kind === 'siege_works' ||
      kind === 'armory' ||
      kind === 'tower' ||
      kind === 'farm' ||
      kind === 'titan_gate' ||
      kind === 'market'
    );
  }
  if (style === 'egyptian') {
    return (
      kind === 'temple' ||
      kind === 'house' ||
      kind === 'barracks' ||
      kind === 'archery_range' ||
      kind === 'stable' ||
      kind === 'market' ||
      kind === 'armory' ||
      kind === 'siege_works' ||
      kind === 'fortress' ||
      kind === 'tower' ||
      kind === 'farm' ||
      kind === 'titan_gate'
    );
  }
  if (style === 'norse') {
    return kind === 'fortress';
  }
  if (style === 'atlantean') {
    return (
      kind === 'fortress' ||
      kind === 'siege_works' ||
      kind === 'counter_barracks' ||
      kind === 'tower' ||
      kind === 'mirror_tower' ||
      kind === 'farm' ||
      kind === 'titan_gate' ||
      kind === 'market' ||
      kind === 'armory' ||
      kind === 'barracks' ||
      kind === 'stable' ||
      kind === 'archery_range' ||
      kind === 'house'
    );
  }
  return false;
}

interface EvolutionStylePalette {
  plinth: THREE.Material;
  column: THREE.Material;
  trim: THREE.Material;
  metal: THREE.Material;
  glow: THREE.Material;
  divine: THREE.Material;
}

function resolveStylePalette(
  style: ArchStyleId,
  pal: MaterialPalette,
  team: TeamId
): EvolutionStylePalette {
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  switch (style) {
    case 'egyptian':
      return {
        plinth: pal.sandstoneDark,
        column: pal.sandstone,
        trim: pal.turquoise,
        metal: pal.gold,
        glow: pal.ember,
        divine: pal.goldOre,
      };
    case 'norse':
      return {
        plinth: pal.stoneDark,
        column: pal.norseTimber,
        trim: pal.bronze,
        metal: pal.steel,
        glow: pal.iceBlue,
        divine: pal.gold,
      };
    case 'atlantean':
      return {
        plinth: pal.obsidian,
        column: pal.ivory,
        trim: pal.orichalcum,
        metal: pal.orichalcum,
        glow: pal.crystalGlow,
        divine: pal.crystalGlow,
      };
    case 'chinese':
      return {
        plinth: pal.ivory,
        column: pal.crimson,
        trim: pal.jade,
        metal: pal.gold,
        glow: pal.ember,
        divine: pal.goldOre,
      };
    case 'greek':
    default:
      return {
        plinth: pal.stoneDark,
        column: pal.marble,
        trim: teamMat,
        metal: pal.bronze,
        glow: pal.ember,
        divine: pal.gold,
      };
  }
}

/**
 * Applies culturally authentic, grounded Era II -> Era V architectural upgrades
 * to any building mesh that does not already have a bespoke multi-age builder.
 *
 * All parts are positioned in root space around the measured bounding box of
 * `builtGroup` so foundations stay grounded at y = 0 and spires sit cleanly on top.
 */
export function applyBuildingAgeEvolution(
  root: THREE.Group,
  builtGroup: THREE.Group,
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  pantheon: PantheonId,
  age: AgeLevel,
  enableShadows: boolean,
  majorGod?: string
): BuildingAgeEvolutionResult {
  const result: BuildingAgeEvolutionResult = {
    barHeightDelta: 0,
    markerRadiusDelta: 0,
    addedFlames: [],
  };

  const look = getCivLook(pantheon, pal, majorGod);
  if (age <= 1 || hasBespokeAgeEvolution(look.style, kind)) {
    return result;
  }

  const sp = resolveStylePalette(look.style, pal, team);
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Apply a subtle monumental growth to the core building group per Age
  // (stronger on defensive towers, gentler on compact/flat structures)
  const scaleStep =
    kind === 'tower' || kind === 'mirror_tower'
      ? 0.045
      : kind === 'farm'
        ? 0.015
        : kind === 'wonder' || kind === 'titan_gate'
          ? 0.03
          : 0.032;
  const ageOffset = Math.max(0, age - 1);
  const growthFactor = 1 + ageOffset * scaleStep;
  builtGroup.scale.multiplyScalar(growthFactor);
  builtGroup.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(builtGroup);
  if (box.isEmpty()) return result;

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const halfW = Math.max(0.65, size.x * 0.5);
  const halfD = Math.max(0.65, size.z * 0.5);
  const topY = Math.max(1.0, box.max.y);
  const cx = center.x;
  const cz = center.z;

  const evoGroup = new THREE.Group();
  evoGroup.name = `age_evolution_tier_${age}`;

  const addMesh = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx, ry, rz);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    evoGroup.add(m);
    return m;
  };

  // ── SPECIALIZED EVOLUTION 1: DEFENSIVE TOWERS (Vigia -> Guarda -> Balista -> Divina) ──
  if (kind === 'tower' || kind === 'mirror_tower') {
    const r = Math.min(halfW, halfD);

    // Era 2+: Grounded stone/cultural bastion plinth & war banner
    addMesh(new THREE.CylinderGeometry(r * 1.08, r * 1.24, 0.34, 8), sp.plinth, cx, 0.17, cz);
    addMesh(new THREE.CylinderGeometry(0.05, 0.06, topY * 0.62, 6), sp.metal, cx + r * 0.92, topY * 0.36, cz + r * 0.55);
    addMesh(new THREE.BoxGeometry(0.65, 0.42, 0.05), teamMat, cx + r * 0.92 + 0.34, topY * 0.58, cz + r * 0.55);

    // Era 3+: Torre de Guarda — reinforced parapet collar, corner battlements & mounted shields
    if (age >= 3) {
      const collarY = topY * 0.72;
      addMesh(new THREE.BoxGeometry(r * 2.05, 0.28, r * 2.05), sp.plinth, cx, collarY, cz);
      const merlonOff = r * 0.88;
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          addMesh(new THREE.BoxGeometry(0.38, 0.52, 0.38), sp.column, cx + sx * merlonOff, collarY + 0.38, cz + sz * merlonOff);
        }
      }
      // 4 side shields facing outward
      const shieldRadius = Math.max(0.24, r * 0.28);
      addMesh(new THREE.CylinderGeometry(shieldRadius, shieldRadius, 0.08, 12), teamMat, cx, collarY, cz + r * 1.05, Math.PI / 2, 0, 0);
      addMesh(new THREE.CylinderGeometry(shieldRadius, shieldRadius, 0.08, 12), teamMat, cx, collarY, cz - r * 1.05, Math.PI / 2, 0, 0);
      addMesh(new THREE.CylinderGeometry(shieldRadius, shieldRadius, 0.08, 12), sp.metal, cx + r * 1.05, collarY, cz, 0, 0, Math.PI / 2);
      addMesh(new THREE.CylinderGeometry(shieldRadius, shieldRadius, 0.08, 12), sp.metal, cx - r * 1.05, collarY, cz, 0, 0, Math.PI / 2);
    }

    // Era 4+: Torre de Balista — rooftop siege ballista turret + corner armor buttresses + lit braziers
    if (age >= 4) {
      const platformY = topY + 0.14;
      addMesh(new THREE.CylinderGeometry(r * 0.78, r * 0.86, 0.24, 8), sp.metal, cx, platformY, cz);

      // Mounted Siege Ballista (stock, twin torsion prod arms, bowstring, heavy bolt)
      const bY = platformY + 0.32;
      addMesh(new THREE.BoxGeometry(0.22, 0.2, 1.45), pal.timber, cx, bY, cz + 0.12);
      addMesh(new THREE.BoxGeometry(1.55, 0.12, 0.14), age >= 5 ? pal.gold : sp.metal, cx, bY + 0.06, cz + 0.58);
      addMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.36, 8), sp.metal, cx - 0.58, bY + 0.04, cz + 0.58);
      addMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.36, 8), sp.metal, cx + 0.58, bY + 0.04, cz + 0.58);
      addMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 6), pal.steel, cx, bY + 0.14, cz + 0.28, Math.PI / 2, 0, 0);
      addMesh(new THREE.ConeGeometry(0.09, 0.28, 6), pal.gold, cx, bY + 0.14, cz + 1.08, Math.PI / 2, 0, 0);

      // Corner armored buttresses & twin front braziers
      for (const sx of [-1, 1]) {
        const bx = cx + sx * r * 1.02;
        const bz = cz + r * 0.96;
        addMesh(new THREE.CylinderGeometry(0.14, 0.18, 0.65, 6), sp.metal, bx, 0.45, bz);
        const flame = addMesh(new THREE.OctahedronGeometry(0.17, 0), sp.glow, bx, 0.9, bz);
        result.addedFlames.push(flame);
      }
      result.barHeightDelta += 0.75;
    }

    // Era 5: Divine Sentinel Crown & Crystal
    if (age >= 5) {
      const crownY = topY + 1.15;
      const halo = addMesh(new THREE.TorusGeometry(r * 0.72, 0.07, 8, 22), pal.gold, cx, crownY, cz, Math.PI / 2, 0, 0);
      const crystal = addMesh(new THREE.OctahedronGeometry(0.28, 0), sp.divine, cx, crownY + 0.35, cz);
      result.metropolisHalo = halo;
      result.metropolisCrystal = crystal;
      result.barHeightDelta += 0.65;
    }

    root.add(evoGroup);
    result.markerRadiusDelta = ageOffset * 0.08;
    return result;
  }

  // ── SPECIALIZED EVOLUTION 2: FARMS (Rústica -> Irrigada -> Próspera -> Abençoada -> Dourada) ──
  if (kind === 'farm') {
    const fw = halfW * 1.02;
    const fd = halfD * 1.02;

    // Era 2+: Stone/cultural border curb + corner fence posts
    addMesh(new THREE.BoxGeometry(fw * 2.06, 0.16, 0.18), sp.plinth, cx, 0.08, cz + fd);
    addMesh(new THREE.BoxGeometry(fw * 2.06, 0.16, 0.18), sp.plinth, cx, 0.08, cz - fd);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        addMesh(new THREE.CylinderGeometry(0.1, 0.12, 0.68, 6), sp.column, cx + sx * fw, 0.34, cz + sz * fd);
      }
    }

    // Era 3+: Abundant golden grain bales & cultural corner finials
    if (age >= 3) {
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          addMesh(new THREE.ConeGeometry(0.14, 0.28, 6), sp.metal, cx + sx * fw, 0.78, cz + sz * fd);
        }
      }
      addMesh(new THREE.CylinderGeometry(0.26, 0.32, 0.42, 8), pal.goldOre, cx + fw * 0.65, 0.24, cz + fd * 0.62);
      addMesh(new THREE.CylinderGeometry(0.22, 0.28, 0.36, 8), pal.goldOre, cx - fw * 0.65, 0.21, cz + fd * 0.62);
    }

    // Era 4+: Miniature harvest shrine arch & golden irrigation channel
    if (age >= 4) {
      addMesh(new THREE.CylinderGeometry(0.09, 0.11, 1.35, 8), sp.column, cx - 0.55, 0.68, cz - fd * 0.85);
      addMesh(new THREE.CylinderGeometry(0.09, 0.11, 1.35, 8), sp.column, cx + 0.55, 0.68, cz - fd * 0.85);
      addMesh(new THREE.BoxGeometry(1.45, 0.18, 0.32), sp.metal, cx, 1.4, cz - fd * 0.85);
      const flame = addMesh(new THREE.OctahedronGeometry(0.14, 0), sp.glow, cx, 1.66, cz - fd * 0.85);
      result.addedFlames.push(flame);
    }

    // Era 5: Divine Harvest Beacon
    if (age >= 5) {
      const crystal = addMesh(new THREE.OctahedronGeometry(0.24, 0), pal.gold, cx, 2.05, cz - fd * 0.85);
      result.metropolisCrystal = crystal;
      result.barHeightDelta += 0.35;
    }

    root.add(evoGroup);
    return result;
  }

  // ── GENERAL ARCHITECTURAL EVOLUTION (All Military, Economic, Temple, Naval, Monument buildings) ──
  const isCompact = Math.max(halfW, halfD) < 1.35;
  const plinthH = isCompact ? 0.16 : 0.24;

  // Era 2 (Clássica)+: Stepped cultural stone terrace & flanking entry banners
  addMesh(
    new THREE.BoxGeometry(halfW * 2.1, plinthH, halfD * 2.1),
    sp.plinth,
    cx,
    plinthH * 0.5,
    cz
  );
  const poleH = Math.min(3.4, Math.max(1.45, topY * 0.68));
  const bannerW = isCompact ? 0.45 : 0.72;
  const bannerH = isCompact ? 0.32 : 0.48;
  for (const sx of [-1, 1]) {
    const px = cx + sx * (halfW * 0.94);
    const pz = cz + halfD * 0.98;
    addMesh(new THREE.CylinderGeometry(0.045, 0.055, poleH, 6), sp.metal, px, poleH * 0.5, pz);
    addMesh(new THREE.SphereGeometry(0.08, 6, 6), pal.gold, px, poleH + 0.04, pz);
    addMesh(
      new THREE.BoxGeometry(bannerW, bannerH, 0.05),
      teamMat,
      px + sx * (bannerW * 0.5),
      poleH - bannerH * 0.6,
      pz
    );
  }

  // Era 3 (Heroica)+: Reinforced corner columns/buttresses + metallic frieze emblems/shields
  if (age >= 3) {
    const colH = Math.min(topY * 0.72, isCompact ? 1.55 : 2.55);
    const colR = isCompact ? 0.13 : 0.2;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const kx = cx + sx * (halfW * 0.96);
        const kz = cz + sz * (halfD * 0.96);
        addMesh(new THREE.BoxGeometry(colR * 2.6, 0.22, colR * 2.6), sp.plinth, kx, plinthH + 0.11, kz);
        addMesh(new THREE.CylinderGeometry(colR * 0.88, colR, colH, 8), sp.column, kx, plinthH + 0.22 + colH * 0.5, kz);
        addMesh(new THREE.BoxGeometry(colR * 2.5, 0.2, colR * 2.5), sp.metal, kx, plinthH + 0.22 + colH + 0.08, kz);
      }
    }

    // Facade heraldic shields / crests
    const shieldR = isCompact ? 0.22 : 0.34;
    const shieldY = Math.min(topY * 0.6, plinthH + colH * 0.78);
    for (const sx of [-0.48, 0.48]) {
      addMesh(
        new THREE.CylinderGeometry(shieldR, shieldR, 0.08, 12),
        sp.metal,
        cx + sx * halfW,
        shieldY,
        cz + halfD * 1.02,
        Math.PI / 2,
        0,
        0
      );
      addMesh(
        new THREE.CylinderGeometry(shieldR * 0.58, shieldR * 0.58, 0.1, 10),
        teamMat,
        cx + sx * halfW,
        shieldY,
        cz + halfD * 1.03,
        Math.PI / 2,
        0,
        0
      );
    }
  }

  // Era 4 (Mítica)+: Corner mythic finials/obelisks + lit front braziers + gilded roof peak crest
  if (age >= 4) {
    const colH = Math.min(topY * 0.72, isCompact ? 1.55 : 2.55);
    const finialBaseY = plinthH + 0.22 + colH + 0.18;
    const finialH = isCompact ? 0.52 : 0.85;

    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const kx = cx + sx * (halfW * 0.96);
        const kz = cz + sz * (halfD * 0.96);
        if (look.style === 'atlantean') {
          addMesh(new THREE.OctahedronGeometry(isCompact ? 0.18 : 0.26, 0), pal.crystalGlow, kx, finialBaseY + finialH * 0.5, kz);
        } else if (look.style === 'egyptian') {
          addMesh(new THREE.ConeGeometry(isCompact ? 0.18 : 0.26, finialH, 4), pal.gold, kx, finialBaseY + finialH * 0.5, kz, 0, Math.PI / 4, 0);
        } else if (look.style === 'norse') {
          addMesh(new THREE.ConeGeometry(isCompact ? 0.15 : 0.22, finialH, 5), sp.metal, kx, finialBaseY + finialH * 0.45, kz, 0, 0, -sx * 0.28);
        } else {
          addMesh(new THREE.ConeGeometry(isCompact ? 0.18 : 0.26, finialH, 6), pal.gold, kx, finialBaseY + finialH * 0.5, kz);
        }
      }
    }

    // Twin front sacred braziers (animated by engine via tcFlames)
    for (const sx of [-1, 1]) {
      const bx = cx + sx * (halfW * 0.58);
      const bz = cz + halfD * 1.08;
      addMesh(new THREE.CylinderGeometry(0.14, 0.2, 0.55, 8), sp.metal, bx, 0.28 + plinthH, bz);
      const flame = addMesh(
        new THREE.OctahedronGeometry(isCompact ? 0.14 : 0.2, 0),
        sp.glow,
        bx,
        0.72 + plinthH,
        bz
      );
      result.addedFlames.push(flame);
    }

    // Golden architectural roof finial
    addMesh(new THREE.ConeGeometry(isCompact ? 0.22 : 0.34, isCompact ? 0.55 : 0.85, 6), pal.gold, cx, topY + (isCompact ? 0.22 : 0.38), cz);
    result.barHeightDelta += isCompact ? 0.45 : 0.7;
  }

  // Era 5 (Era dos Deuses): Gilded terrace step + celestial halo ring & radiant divine crystal
  if (age >= 5) {
    addMesh(
      new THREE.BoxGeometry(halfW * 2.22, 0.12, halfD * 2.22),
      pal.gold,
      cx,
      0.06,
      cz
    );
    const haloRadius = Math.min(1.35, Math.max(0.42, Math.min(halfW, halfD) * 0.44));
    const haloY = topY + (isCompact ? 0.72 : 1.15);
    const halo = addMesh(
      new THREE.TorusGeometry(haloRadius, isCompact ? 0.05 : 0.08, 8, 22),
      pal.gold,
      cx,
      haloY,
      cz,
      Math.PI / 2,
      0,
      0
    );
    const crystal = addMesh(
      new THREE.OctahedronGeometry(isCompact ? 0.2 : 0.32, 0),
      sp.divine,
      cx,
      haloY + (isCompact ? 0.24 : 0.38),
      cz
    );
    result.metropolisHalo = halo;
    result.metropolisCrystal = crystal;
    result.barHeightDelta += isCompact ? 0.55 : 0.85;
  }

  root.add(evoGroup);
  result.markerRadiusDelta = ageOffset * (isCompact ? 0.06 : 0.1);
  return result;
}
