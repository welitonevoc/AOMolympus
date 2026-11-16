import * as THREE from 'three';
import { BuildingKind, FaunaKind, MapId, PANTHEONS, PantheonId, ResourceNodeKind, TeamId, UnitKind } from './types';
import { createGreekUnitMesh } from '../civilizacao/gregos/gregosModels';
import { createRiggedVillagerMesh } from '../civilizacao/gregos/villagerAnimator';
import { buildCharybdisTitan, getCachedCaribdisTextures } from '../civilizacao/gregos/caribdisModel';
import { buildTyphonTitan, getCachedTyphonTextures } from '../civilizacao/gregos/tifaoModel';
import { buildCerberusTitan, getCachedCerberusTextures } from '../civilizacao/gregos/cerberoModel';
import { buildArtemis, getCachedArtemisTextures, animateArtemis } from '../civilizacao/gregos/artemisModel';
import { buildHephaestus, getCachedHephaestusTextures, animateHephaestus } from '../civilizacao/gregos/hefestoModel';
import { buildDionysus, getCachedDionysusTextures, animateDionysus } from '../civilizacao/gregos/dionisioModel';
import { buildAphrodite, getCachedAphroditeTextures, animateAphrodite } from '../civilizacao/gregos/afroditeModel';
import { buildApollo, getCachedApolloTextures, animateApollo } from '../civilizacao/gregos/apoloModel';
import { buildAres, getCachedAresTextures, animateAres } from '../civilizacao/gregos/aresModel';
import { buildAthena, getCachedAtenaTextures, animateAthena } from '../civilizacao/gregos/atenaModel';
import { buildHermes, getCachedHermesTextures, animateHermes } from '../civilizacao/gregos/hermesModel';
import { createAoMOakTreeMesh, getFaunaCoatMaterial } from '../TEXTURA';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const MAP_HALF_SIZE = 74;
export const PLAYABLE_HALF_SIZE = 58;

/**
 * Deterministic heightfield per AoM map biome.
 * Flat plateaus around player base (-34, 34) and enemy base (34, -34),
 * map-specific terrain topography, and shoreline drop beyond PLAYABLE_HALF_SIZE.
 */
export function groundHeightAt(x: number, z: number, mapId: MapId = 'mediterranean'): number {
  const distPlayer = Math.hypot(x + 34, z - 34);
  const distEnemy = Math.hypot(x - 34, z + 34);
  const baseFlatten =
    Math.min(1, Math.max(0, (distPlayer - 11) / 10)) *
    Math.min(1, Math.max(0, (distEnemy - 11) / 10));

  const edgeDist = Math.max(Math.abs(x), Math.abs(z));
  let shoreDrop = 0;
  if (edgeDist > PLAYABLE_HALF_SIZE) {
    const t = Math.min(1, (edgeDist - PLAYABLE_HALF_SIZE) / (MAP_HALF_SIZE - PLAYABLE_HALF_SIZE));
    shoreDrop = -t * t * 4.2;
  }

  if (mapId === 'acropolis') {
    const pPlateau = Math.max(0, 1 - Math.max(0, (distPlayer - 15) / 12)) * 2.1;
    const ePlateau = Math.max(0, 1 - Math.max(0, (distEnemy - 15) / 12)) * 2.1;
    const centerBasin = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.55 * baseFlatten;
    return Math.max(-3.6, 0.35 + pPlateau + ePlateau + centerBasin + shoreDrop);
  }

  if (mapId === 'nile' || mapId === 'yellow_river') {
    const dunes = (Math.sin(x * 0.05 + z * 0.03) * 0.8 + Math.cos(z * 0.07) * 0.35) * baseFlatten;
    const riverDist = Math.abs(x - z) / Math.SQRT2;
    const fordRadius = mapId === 'yellow_river' ? 10.5 : 7.5;
    const fordBlend = Math.min(1, Math.max(0, (Math.hypot(x, z) - fordRadius) / 8));
    const riverDip = riverDist < 8 ? -Math.cos((riverDist / 8) * (Math.PI / 2)) * 1.45 * fordBlend : 0;
    return Math.max(-3.6, 0.42 + dunes + riverDip + shoreDrop);
  }

  if (mapId === 'ghost_lake') {
    const r = Math.hypot(x, z);
    // Flat frozen central lake (walkable ice sheet y ~ 0.12) surrounded by rolling snowy rim
    const rim = Math.max(0, Math.min(1, (r - 19) / 12));
    const hills = (Math.sin(x * 0.07) * Math.cos(z * 0.07) * 1.35 + 0.55) * rim * baseFlatten;
    return Math.max(-3.6, 0.12 + hills + shoreDrop);
  }

  if (mapId === 'oasis') {
    const r = Math.hypot(x, z);
    // Sacred oasis pool in dead center (r < 9.5) with fertile shelf & sand dunes outside
    const pondDip = r < 9.5 ? -Math.cos((r / 9.5) * (Math.PI / 2)) * 1.55 : 0;
    const dunes = (Math.sin(x * 0.06 + z * 0.04) * 0.9 + Math.cos(x * 0.08 - z * 0.05) * 0.4) * baseFlatten;
    return Math.max(-3.6, 0.45 + dunes + pondDip + shoreDrop);
  }

  if (mapId === 'jotunheim') {
    // High snowy mountain ridges flanking the NE-SW valley pass
    const valleyDist = Math.abs(x + z) / Math.SQRT2;
    const ridgeWall = valleyDist > 21 ? Math.min(3.1, (valleyDist - 21) * 0.24) * baseFlatten : 0;
    const frostHills = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.9 * baseFlatten;
    return Math.max(-3.6, 0.42 + ridgeWall + frostHills + shoreDrop);
  }

  if (mapId === 'erebus') {
    const riverDist = Math.abs(x - z) / Math.SQRT2;
    const bridgeBlend = Math.min(1, Math.max(0, (Math.hypot(x, z) - 9.5) / 6));
    const lavaTrench = riverDist < 6.5 ? -Math.cos((riverDist / 6.5) * (Math.PI / 2)) * 1.65 * bridgeBlend : 0;
    const crags = (Math.sin(x * 0.09) * Math.cos(z * 0.08) * 1.45) * baseFlatten;
    return Math.max(-3.6, 0.48 + crags + lavaTrench + shoreDrop);
  }

  if (mapId === 'yucatan') {
    const jungleTerrace =
      (Math.sin(x * 0.06) * Math.cos(z * 0.06) * 1.15 + Math.cos((x - z) * 0.08) * 0.5) * baseFlatten;
    return Math.max(-3.6, 0.4 + jungleTerrace + shoreDrop);
  }

  if (mapId === 'alfheim') {
    const ridges =
      (Math.sin(x * 0.075) * Math.cos(z * 0.075) * 1.9 +
        Math.sin((x - z) * 0.08) * 0.75) *
      baseFlatten;
    return Math.max(-3.6, 0.48 + ridges + shoreDrop);
  }

  const hill =
    (Math.sin(x * 0.065) * Math.cos(z * 0.065) * 1.35 +
      Math.sin((x + z) * 0.09) * 0.55) *
    baseFlatten;

  return Math.max(-3.6, 0.35 + hill + shoreDrop);
}

export interface MaterialPalette {
  marble: THREE.MeshStandardMaterial;
  stoneDark: THREE.MeshStandardMaterial;
  terracotta: THREE.MeshStandardMaterial;
  timber: THREE.MeshStandardMaterial;
  bronze: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  skin: THREE.MeshStandardMaterial;
  tunicPlayer: THREE.MeshStandardMaterial;
  tunicEnemy: THREE.MeshStandardMaterial;
  furBrown: THREE.MeshStandardMaterial;
  cyclopsSkin: THREE.MeshStandardMaterial;
  sandstone: THREE.MeshStandardMaterial;
  sandstoneDark: THREE.MeshStandardMaterial;
  turquoise: THREE.MeshStandardMaterial;
  norseTimber: THREE.MeshStandardMaterial;
  norseSlate: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
  orichalcum: THREE.MeshStandardMaterial;
  obsidian: THREE.MeshStandardMaterial;
  chitin: THREE.MeshStandardMaterial;
  iceBlue: THREE.MeshStandardMaterial;
  jade: THREE.MeshStandardMaterial;
  crimson: THREE.MeshStandardMaterial;
  lapis: THREE.MeshStandardMaterial;
  ember: THREE.MeshStandardMaterial;
  foliagePine: THREE.MeshStandardMaterial;
  foliageDark: THREE.MeshStandardMaterial;
  berryRed: THREE.MeshStandardMaterial;
  goldOre: THREE.MeshStandardMaterial;
  crystalGlow: THREE.MeshStandardMaterial;
  shadowMat: THREE.MeshBasicMaterial;
  ringPlayerMat: THREE.MeshBasicMaterial;
  ringEnemyMat: THREE.MeshBasicMaterial;
}

export function createMaterialPalette(
  marbleTex: THREE.CanvasTexture,
  shadowTex: THREE.CanvasTexture,
  ringPlayerTex: THREE.CanvasTexture,
  ringEnemyTex: THREE.CanvasTexture,
  playerBannerHex: number
): MaterialPalette {
  return {
    marble: new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xf0eadc,
      roughness: 0.7,
      metalness: 0.06,
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      color: 0x5c6066,
      roughness: 0.86,
      metalness: 0.1,
    }),
    terracotta: new THREE.MeshStandardMaterial({
      color: 0xb65436,
      roughness: 0.76,
      metalness: 0.04,
    }),
    timber: new THREE.MeshStandardMaterial({
      color: 0x6e472b,
      roughness: 0.84,
      metalness: 0.03,
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: 0xc9933b,
      roughness: 0.26,
      metalness: 0.88,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xf4c44e,
      roughness: 0.2,
      metalness: 0.94,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0x9aa4b2,
      roughness: 0.24,
      metalness: 0.9,
    }),
    skin: new THREE.MeshStandardMaterial({
      color: 0xd9a782,
      roughness: 0.66,
      metalness: 0.02,
    }),
    tunicPlayer: new THREE.MeshStandardMaterial({
      color: playerBannerHex,
      roughness: 0.6,
      metalness: 0.1,
    }),
    tunicEnemy: new THREE.MeshStandardMaterial({
      color: 0xc82333,
      roughness: 0.6,
      metalness: 0.1,
    }),
    furBrown: new THREE.MeshStandardMaterial({
      color: 0x5a3b26,
      roughness: 0.9,
      metalness: 0.02,
    }),
    cyclopsSkin: new THREE.MeshStandardMaterial({
      color: 0x7b886b,
      roughness: 0.74,
      metalness: 0.04,
    }),
    sandstone: new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xd9b372,
      roughness: 0.85,
      metalness: 0.03,
    }),
    sandstoneDark: new THREE.MeshStandardMaterial({
      color: 0x9c7945,
      roughness: 0.9,
      metalness: 0.04,
    }),
    turquoise: new THREE.MeshStandardMaterial({
      color: 0x0f9e99,
      roughness: 0.4,
      metalness: 0.26,
    }),
    norseTimber: new THREE.MeshStandardMaterial({
      color: 0x4b301e,
      roughness: 0.88,
      metalness: 0.03,
    }),
    norseSlate: new THREE.MeshStandardMaterial({
      color: 0x364152,
      roughness: 0.8,
      metalness: 0.1,
    }),
    ivory: new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xf5f0e2,
      roughness: 0.6,
      metalness: 0.08,
    }),
    orichalcum: new THREE.MeshStandardMaterial({
      color: 0xd98a2b,
      roughness: 0.22,
      metalness: 0.9,
    }),
    obsidian: new THREE.MeshStandardMaterial({
      color: 0x222530,
      roughness: 0.46,
      metalness: 0.42,
    }),
    chitin: new THREE.MeshStandardMaterial({
      color: 0x265c42,
      roughness: 0.28,
      metalness: 0.7,
    }),
    iceBlue: new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.18,
    }),
    jade: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.34,
      metalness: 0.28,
    }),
    crimson: new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.48,
      metalness: 0.22,
    }),
    lapis: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.32,
      metalness: 0.35,
    }),
    ember: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.15,
      roughness: 0.25,
      metalness: 0.15,
    }),
    foliagePine: new THREE.MeshStandardMaterial({
      color: 0x2e5e32,
      roughness: 0.85,
      metalness: 0.02,
    }),
    foliageDark: new THREE.MeshStandardMaterial({
      color: 0x204726,
      roughness: 0.88,
      metalness: 0.02,
    }),
    berryRed: new THREE.MeshStandardMaterial({
      color: 0xd63348,
      roughness: 0.45,
      metalness: 0.05,
    }),
    goldOre: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x92400e,
      emissiveIntensity: 0.48,
      roughness: 0.16,
      metalness: 0.94,
    }),
    crystalGlow: new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x14b8a6,
      emissiveIntensity: 1.4,
      roughness: 0.15,
      metalness: 0.2,
    }),
    shadowMat: new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    }),
    ringPlayerMat: new THREE.MeshBasicMaterial({
      map: ringPlayerTex,
      transparent: true,
      depthWrite: false,
    }),
    ringEnemyMat: new THREE.MeshBasicMaterial({
      map: ringEnemyTex,
      transparent: true,
      depthWrite: false,
    }),
  };
}

// --- SCULPTED REUSABLE 3D GEOMETRIES (Lathe, Tube, Extrude, Capsule) ---
interface SculptedGeos {
  humanTorso: THREE.LatheGeometry;
  armoredCuirass: THREE.LatheGeometry;
  heroCuirass: THREE.LatheGeometry;
  corinthianHelm: THREE.LatheGeometry;
  domedShield: THREE.LatheGeometry;
  sculptedLimb: THREE.CapsuleGeometry;
  heavyLimb: THREE.CapsuleGeometry;
  giantLimb: THREE.CapsuleGeometry;
  horseBarrel: THREE.CapsuleGeometry;
  horseNeck: THREE.CapsuleGeometry;
  compoundBow: THREE.TubeGeometry;
  bullHorn: THREE.TubeGeometry;
  capeMesh: THREE.ExtrudeGeometry;
  greatSwordBlade: THREE.ExtrudeGeometry;
  axeBlade: THREE.ExtrudeGeometry;
  chaliceCup: THREE.LatheGeometry;
}

let _cachedGeos: SculptedGeos | null = null;

function getSculptedGeos(): SculptedGeos {
  if (_cachedGeos) return _cachedGeos;

  // Sculpted athletic human torso profile (waist -> flared chest -> collar)
  const humanTorso = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, -0.34),
      new THREE.Vector2(0.24, -0.32),
      new THREE.Vector2(0.19, -0.1),
      new THREE.Vector2(0.25, 0.18),
      new THREE.Vector2(0.22, 0.32),
      new THREE.Vector2(0.09, 0.36),
    ],
    12
  );

  // Anatomical Bronze/Steel Hoplite Cuirass + pteruges skirt
  const armoredCuirass = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, -0.38),
      new THREE.Vector2(0.29, -0.36),
      new THREE.Vector2(0.22, -0.14),
      new THREE.Vector2(0.29, 0.14),
      new THREE.Vector2(0.27, 0.3),
      new THREE.Vector2(0.11, 0.36),
    ],
    14
  );

  // Heroic broader sculpted breastplate
  const heroCuirass = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, -0.44),
      new THREE.Vector2(0.32, -0.42),
      new THREE.Vector2(0.24, -0.14),
      new THREE.Vector2(0.36, 0.18),
      new THREE.Vector2(0.33, 0.36),
      new THREE.Vector2(0.13, 0.43),
    ],
    14
  );

  // Corinthian / Imperial Dome Helmet
  const corinthianHelm = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.23, -0.12),
      new THREE.Vector2(0.24, 0.02),
      new THREE.Vector2(0.22, 0.14),
      new THREE.Vector2(0.14, 0.22),
      new THREE.Vector2(0.0, 0.25),
    ],
    12
  );

  // Domed concave Hoplon shield
  const domedShield = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.0, 0.1),
      new THREE.Vector2(0.18, 0.08),
      new THREE.Vector2(0.35, 0.03),
      new THREE.Vector2(0.4, 0.0),
      new THREE.Vector2(0.38, -0.03),
    ],
    16
  );

  // Sculpted organic limbs (CapsuleGeometry)
  const sculptedLimb = new THREE.CapsuleGeometry(0.078, 0.34, 4, 8);
  const heavyLimb = new THREE.CapsuleGeometry(0.13, 0.44, 5, 10);
  const giantLimb = new THREE.CapsuleGeometry(0.22, 0.72, 6, 10);

  // Equestrian sculpted horse barrel & neck
  const horseBarrel = new THREE.CapsuleGeometry(0.29, 0.85, 6, 12);
  horseBarrel.rotateX(Math.PI / 2);
  const horseNeck = new THREE.CapsuleGeometry(0.14, 0.44, 5, 10);

  // Curved recurve bow via CatmullRom + TubeGeometry
  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.48, -0.08),
    new THREE.Vector3(0, -0.24, 0.14),
    new THREE.Vector3(0, 0, 0.22),
    new THREE.Vector3(0, 0.24, 0.14),
    new THREE.Vector3(0, 0.48, -0.08),
  ]);
  const compoundBow = new THREE.TubeGeometry(bowCurve, 14, 0.028, 6, false);

  // Curved Minotaur/Titan horn via TubeGeometry
  const hornCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.16, 0.08, 0.04),
    new THREE.Vector3(0.26, 0.24, 0.12),
    new THREE.Vector3(0.2, 0.42, 0.2),
  ]);
  const bullHorn = new THREE.TubeGeometry(hornCurve, 10, 0.055, 7, false);

  // Flowing Heroic Cape via ExtrudeGeometry
  const capeShape = new THREE.Shape();
  capeShape.moveTo(-0.26, 0);
  capeShape.lineTo(0.26, 0);
  capeShape.lineTo(0.42, -0.95);
  capeShape.quadraticCurveTo(0, -1.08, -0.42, -0.95);
  capeShape.closePath();
  const capeMesh = new THREE.ExtrudeGeometry(capeShape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 1,
  });

  // Beveled Greatsword Blade via ExtrudeGeometry
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.045, 0);
  bladeShape.lineTo(0.045, 0);
  bladeShape.lineTo(0.038, 0.88);
  bladeShape.lineTo(0, 1.06);
  bladeShape.lineTo(-0.038, 0.88);
  bladeShape.closePath();
  const greatSwordBlade = new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 1,
  });

  // Beveled Battleaxe Blade
  const axeShape = new THREE.Shape();
  axeShape.moveTo(0, -0.1);
  axeShape.quadraticCurveTo(0.26, -0.26, 0.38, -0.32);
  axeShape.quadraticCurveTo(0.44, 0, 0.38, 0.32);
  axeShape.quadraticCurveTo(0.26, 0.26, 0, 0.1);
  axeShape.closePath();
  const axeBlade = new THREE.ExtrudeGeometry(axeShape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 1,
  });

  // Sacred Relic Chalice
  const chaliceCup = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.24, 0),
      new THREE.Vector2(0.07, 0.12),
      new THREE.Vector2(0.06, 0.32),
      new THREE.Vector2(0.22, 0.44),
      new THREE.Vector2(0.28, 0.68),
      new THREE.Vector2(0.23, 0.68),
      new THREE.Vector2(0.15, 0.46),
      new THREE.Vector2(0.01, 0.42),
    ],
    14
  );

  _cachedGeos = {
    humanTorso,
    armoredCuirass,
    heroCuirass,
    corinthianHelm,
    domedShield,
    sculptedLimb,
    heavyLimb,
    giantLimb,
    horseBarrel,
    horseNeck,
    compoundBow,
    bullHorn,
    capeMesh,
    greatSwordBlade,
    axeBlade,
    chaliceCup,
  };
  return _cachedGeos;
}

function attachGroundMarkers(group: THREE.Group, radius: number, pal: MaterialPalette, team: TeamId | 'neutral') {
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2.2, radius * 2.2), pal.shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  shadow.userData.ignoreRaycast = true;
  group.add(shadow);

  const ringMat = team === 'enemy' ? pal.ringEnemyMat : pal.ringPlayerMat;
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2.5, radius * 2.5), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  ring.visible = false;
  ring.userData.ignoreRaycast = true;
  group.add(ring);
  group.userData.selectionRing = ring;
}

function attachHealthBar(group: THREE.Group, height: number, width: number, withSecondaryBar = false) {
  const barGroup = new THREE.Group();
  barGroup.position.set(0, height, 0);
  barGroup.visible = false;
  barGroup.renderOrder = 999;
  barGroup.userData.ignoreRaycast = true;

  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x0b0e14, side: THREE.DoubleSide, depthTest: false, transparent: true, opacity: 0.92 })
  );
  bg.renderOrder = 999;
  bg.userData.ignoreRaycast = true;
  barGroup.add(bg);

  const fillGeo = new THREE.PlaneGeometry(width - 0.06, 0.13);
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, depthTest: false, transparent: true });
  const fill = new THREE.Mesh(fillGeo, fillMat);
  fill.position.z = 0.01;
  fill.renderOrder = 1000;
  fill.userData.ignoreRaycast = true;
  barGroup.add(fill);

  if (withSecondaryBar) {
    const resBg = new THREE.Mesh(
      new THREE.PlaneGeometry(width, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x0b0e14, side: THREE.DoubleSide, depthTest: false, transparent: true, opacity: 0.92 })
    );
    resBg.position.set(0, -0.18, 0);
    resBg.renderOrder = 999;
    resBg.userData.ignoreRaycast = true;
    barGroup.add(resBg);

    const resFill = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.06, 0.09),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, depthTest: false, transparent: true })
    );
    resFill.position.set(0, -0.18, 0.01);
    resFill.renderOrder = 1000;
    resFill.userData.ignoreRaycast = true;
    barGroup.add(resFill);

    group.userData.hpBarResBg = resBg;
    group.userData.hpBarResFill = resFill;
  }

  group.add(barGroup);
  group.userData.hpBarGroup = barGroup;
  group.userData.hpBarFill = fill;
  group.userData.hpBarWidth = width - 0.06;
}

interface CivLook {
  style: 'greek' | 'egyptian' | 'norse' | 'atlantean';
  wallMat: THREE.Material;
  trimMat: THREE.Material;
  roofMat: THREE.Material;
  armorMat: THREE.Material;
  mountMat: THREE.Material;
  titanBodyMat: THREE.Material;
  titanCoreMat: THREE.Material;
}

function getCivLook(pantheon: PantheonId, pal: MaterialPalette, majorGod?: string): CivLook {
  const style = PANTHEONS[pantheon].archStyle;

  // Customização de estilo e materiais de acordo com o Deus Maior selecionado
  if (majorGod) {
    const mg = majorGod.toLowerCase();
    // GREGOS: Zeus, Poseidon, Hades
    if (mg.includes('zeus')) {
      return {
        style: 'greek',
        wallMat: pal.marble,
        trimMat: pal.gold,
        roofMat: pal.terracotta,
        armorMat: pal.gold,
        mountMat: pal.furBrown,
        titanBodyMat: pal.marble,
        titanCoreMat: pal.goldOre,
      };
    }
    if (mg.includes('poseidon')) {
      return {
        style: 'greek',
        wallMat: pal.marble,
        trimMat: pal.turquoise,
        roofMat: pal.turquoise,
        armorMat: pal.bronze,
        mountMat: pal.sandstone,
        titanBodyMat: pal.orichalcum,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('hades')) {
      return {
        style: 'greek',
        wallMat: pal.obsidian,
        trimMat: pal.stoneDark,
        roofMat: pal.crimson,
        armorMat: pal.steel,
        mountMat: pal.obsidian,
        titanBodyMat: pal.obsidian,
        titanCoreMat: pal.ember,
      };
    }

    // EGÍPCIOS: Rá, Ísis, Set
    if (mg.includes('rá') || mg.includes('ra')) {
      return {
        style: 'egyptian',
        wallMat: pal.sandstone,
        trimMat: pal.gold,
        roofMat: pal.gold,
        armorMat: pal.gold,
        mountMat: pal.sandstone,
        titanBodyMat: pal.gold,
        titanCoreMat: pal.goldOre,
      };
    }
    if (mg.includes('ísis') || mg.includes('isis')) {
      return {
        style: 'egyptian',
        wallMat: pal.sandstone,
        trimMat: pal.turquoise,
        roofMat: pal.lapis,
        armorMat: pal.ivory,
        mountMat: pal.sandstone,
        titanBodyMat: pal.ivory,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('set')) {
      return {
        style: 'egyptian',
        wallMat: pal.sandstoneDark,
        trimMat: pal.ember,
        roofMat: pal.obsidian,
        armorMat: pal.steel,
        mountMat: pal.furBrown,
        titanBodyMat: pal.sandstoneDark,
        titanCoreMat: pal.ember,
      };
    }

    // NÓRDICOS: Odin, Thor, Loki
    if (mg.includes('odin')) {
      return {
        style: 'norse',
        wallMat: pal.norseTimber,
        trimMat: pal.timber,
        roofMat: pal.norseSlate,
        armorMat: pal.steel,
        mountMat: pal.furBrown,
        titanBodyMat: pal.iceBlue,
        titanCoreMat: pal.iceBlue,
      };
    }
    if (mg.includes('thor')) {
      return {
        style: 'norse',
        wallMat: pal.stoneDark,
        trimMat: pal.bronze,
        roofMat: pal.norseSlate,
        armorMat: pal.bronze,
        mountMat: pal.furBrown,
        titanBodyMat: pal.bronze,
        titanCoreMat: pal.goldOre,
      };
    }
    if (mg.includes('loki')) {
      return {
        style: 'norse',
        wallMat: pal.obsidian,
        trimMat: pal.ember,
        roofMat: pal.crimson,
        armorMat: pal.steel,
        mountMat: pal.obsidian,
        titanBodyMat: pal.obsidian,
        titanCoreMat: pal.ember,
      };
    }

    // ATLANTES: Cronos, Urano, Gaia
    if (mg.includes('cronos') || mg.includes('kronos')) {
      return {
        style: 'atlantean',
        wallMat: pal.obsidian,
        trimMat: pal.orichalcum,
        roofMat: pal.crimson,
        armorMat: pal.orichalcum,
        mountMat: pal.ivory,
        titanBodyMat: pal.orichalcum,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('urano') || mg.includes('ouranos')) {
      return {
        style: 'atlantean',
        wallMat: pal.ivory,
        trimMat: pal.turquoise,
        roofMat: pal.turquoise,
        armorMat: pal.crystalGlow,
        mountMat: pal.ivory,
        titanBodyMat: pal.ivory,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('gaia')) {
      return {
        style: 'atlantean',
        wallMat: pal.stoneDark,
        trimMat: pal.jade,
        roofMat: pal.timber,
        armorMat: pal.jade,
        mountMat: pal.furBrown,
        titanBodyMat: pal.jade,
        titanCoreMat: pal.goldOre,
      };
    }
  }

  // Fallbacks de estilo por panteão
  switch (pantheon) {
    case 'greek':
      return { style, wallMat: pal.marble, trimMat: pal.bronze, roofMat: pal.terracotta, armorMat: pal.bronze, mountMat: pal.furBrown, titanBodyMat: pal.bronze, titanCoreMat: pal.goldOre };
    case 'egyptian':
      return { style, wallMat: pal.sandstone, trimMat: pal.turquoise, roofMat: pal.gold, armorMat: pal.ivory, mountMat: pal.sandstone, titanBodyMat: pal.gold, titanCoreMat: pal.crystalGlow };
    case 'norse':
      return { style, wallMat: pal.norseTimber, trimMat: pal.timber, roofMat: pal.norseSlate, armorMat: pal.steel, mountMat: pal.furBrown, titanBodyMat: pal.iceBlue, titanCoreMat: pal.iceBlue };
    case 'atlantean':
      return { style, wallMat: pal.ivory, trimMat: pal.orichalcum, roofMat: pal.turquoise, armorMat: pal.orichalcum, mountMat: pal.ivory, titanBodyMat: pal.orichalcum, titanCoreMat: pal.crystalGlow };
    case 'chinese':
      return { style: 'atlantean', wallMat: pal.ivory, trimMat: pal.gold, roofMat: pal.crimson, armorMat: pal.jade, mountMat: pal.ivory, titanBodyMat: pal.jade, titanCoreMat: pal.goldOre };
    case 'aztec':
      return { style: 'egyptian', wallMat: pal.sandstoneDark, trimMat: pal.jade, roofMat: pal.gold, armorMat: pal.jade, mountMat: pal.furBrown, titanBodyMat: pal.jade, titanCoreMat: pal.ember };
    case 'roman':
      return { style: 'greek', wallMat: pal.marble, trimMat: pal.gold, roofMat: pal.crimson, armorMat: pal.steel, mountMat: pal.furBrown, titanBodyMat: pal.marble, titanCoreMat: pal.crimson };
    case 'japanese':
      return { style: 'norse', wallMat: pal.ivory, trimMat: pal.crimson, roofMat: pal.obsidian, armorMat: pal.crimson, mountMat: pal.obsidian, titanBodyMat: pal.obsidian, titanCoreMat: pal.ember };
    case 'eldritch':
      return { style: 'atlantean', wallMat: pal.obsidian, trimMat: pal.crystalGlow, roofMat: pal.obsidian, armorMat: pal.obsidian, mountMat: pal.obsidian, titanBodyMat: pal.obsidian, titanCoreMat: pal.crystalGlow };
    case 'celtic':
      return { style: 'norse', wallMat: pal.stoneDark, trimMat: pal.jade, roofMat: pal.timber, armorMat: pal.steel, mountMat: pal.furBrown, titanBodyMat: pal.stoneDark, titanCoreMat: pal.jade };
    case 'babylonian':
      return { style: 'egyptian', wallMat: pal.lapis, trimMat: pal.gold, roofMat: pal.gold, armorMat: pal.bronze, mountMat: pal.sandstone, titanBodyMat: pal.lapis, titanCoreMat: pal.goldOre };
    case 'lakota':
      return { style: 'norse', wallMat: pal.sandstone, trimMat: pal.turquoise, roofMat: pal.furBrown, armorMat: pal.furBrown, mountMat: pal.sandstone, titanBodyMat: pal.bronze, titanCoreMat: pal.iceBlue };
    case 'jotunn':
      return { style: 'norse', wallMat: pal.norseSlate, trimMat: pal.iceBlue, roofMat: pal.ember, armorMat: pal.iceBlue, mountMat: pal.stoneDark, titanBodyMat: pal.ember, titanCoreMat: pal.ember };
  }
}

export function createBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  pantheon: PantheonId = 'greek',
  majorGod?: string
): THREE.Group {
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const look = getCivLook(pantheon, pal, majorGod);

  const addPart = (mesh: THREE.Mesh, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z);
    if (enableShadows) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    root.add(mesh);
    return mesh;
  };

  // --- UNIVERSAL SPECIALIZED BUILDINGS (Farm, Armory, Market, Fortress, Titan Gate) ---
  if (kind === 'farm') {
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 4.4), pal.furBrown), 0, 0.07, 0);
    // Raised timber/stone border rails
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.22, 0.16), pal.timber), 0, 0.14, 2.15);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.22, 0.16), pal.timber), 0, 0.14, -2.15);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 4.4), pal.timber), -2.15, 0.14, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 4.4), pal.timber), 2.15, 0.14, 0);
    // Wheat crop rows
    for (let row = -1.4; row <= 1.45; row += 0.7) {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 0.3), pal.stoneDark), 0, 0.18, row);
      for (let col = -1.35; col <= 1.35; col += 0.55) {
        addPart(new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.58, 5), pal.goldOre), col, 0.48, row);
      }
    }
    // Small grain silo/shed corner & banner
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 1.4, 8), look.wallMat), -1.55, 0.8, -1.45);
    addPart(new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.75, 8), look.roofMat), -1.55, 1.85, -1.45);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.06), teamMat), -1.55, 1.1, -0.95);

    attachGroundMarkers(root, 2.2, pal, team);
    attachHealthBar(root, 2.4, 2.0);
    return root;
  }

  if (kind === 'armory') {
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.36, 3.8), pal.stoneDark), 0, 0.18, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.85, 3.2), look.wallMat), 0, 1.25, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.5, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 2.9, 0);
    // Towering forge chimney (height 4.2u) + glowing embers + anvil
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.8, 0.9), pal.stoneDark), -1.3, 2.2, -0.95);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.65), pal.ember), 0, 0.75, 1.55);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.38), pal.steel), 1.05, 0.56, 1.52);
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 12), look.trimMat);
    shield.rotation.x = Math.PI / 2;
    addPart(shield, 0, 1.85, 1.65);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.08), teamMat), 1.4, 1.55, 1.64);

    attachGroundMarkers(root, 2.5, pal, team);
    attachHealthBar(root, 4.2, 2.5);
    return root;
  }

  if (kind === 'market') {
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.32, 4.0), pal.stoneDark), 0, 0.16, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 3.6), look.wallMat), 0, 0.43, 0);
    // Twin merchant canopy stalls
    for (const sx of [-1.2, 1.2]) {
      for (const pz of [-1.1, 1.1]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 6), pal.timber), sx - 0.65, 1.5, pz);
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 6), pal.timber), sx + 0.65, 1.5, pz);
      }
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 2.5), sx < 0 ? teamMat : look.roofMat), sx, 2.55, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), pal.timber), sx, 0.85, 0);
    }
    // Central trade banner & golden scales/amphorae (height 4.2u)
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 8), look.trimMat), 0, 2.2, -1.2);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.08), teamMat), 0.6, 3.55, -1.2);
    addPart(new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), pal.goldOre), 0, 0.8, 0.9);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.72, 8), pal.terracotta), -0.5, 0.82, 1.3);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.72, 8), pal.terracotta), 0.5, 0.82, 1.3);

    attachGroundMarkers(root, 2.6, pal, team);
    attachHealthBar(root, 4.2, 2.5);
    return root;
  }

  if (kind === 'fortress') {
    // MONUMENTAL CITADEL (AoM: The Titans 5x5 Footprint, 4 Towering Bastions, Height 8.2u)
    addPart(new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.55, 6.4), pal.stoneDark), 0, 0.275, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.2, 5.0), look.wallMat), 0, 2.15, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.35, 5.3), look.trimMat), 0, 3.9, 0);
    // 4 Colossal Corner Bastion Towers (height 7.6u with crenellations & roofs)
    for (const [bx, bz] of [[-2.5, 2.5], [2.5, 2.5], [-2.5, -2.5], [2.5, -2.5]]) {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 5.2, 8), look.wallMat), bx, 2.9, bz);
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.9, 0.45, 8), look.trimMat), bx, 5.65, bz);
      addPart(new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.5, 8), look.roofMat), bx, 6.6, bz);
    }
    // Central High Keep & Battlements (reaches 8.2u)
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.6, 3.0), look.wallMat), 0, 5.1, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.35, 3.25), look.trimMat), 0, 6.55, 0);
    const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.8, 4), look.roofMat);
    keepRoof.rotation.y = Math.PI / 4;
    addPart(keepRoof, 0, 7.55, 0);
    // Heavy Portcullis Arch & Faction Battle Standard at 8.8u
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.35), pal.obsidian), 0, 1.35, 2.52);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), pal.gold), 0, 8.8, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.88, 0.08), teamMat), 0.7, 9.4, 0);

    attachGroundMarkers(root, 3.6, pal, team);
    attachHealthBar(root, 8.8, 3.2);
    return root;
  }

  if (kind === 'titan_gate') {
    // COLOSSAL TITAN GATE EXCAVATION (AoM: The Titans Tartarus Portal, Monoliths Height 8.2u)
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.55, 12), pal.obsidian), 0, 0.275, 0);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.7, 0.35, 12), look.trimMat), 0, 0.65, 0);
    // Twin colossal tilted portal monolith pillars (height 7.8u)
    const pL = addPart(new THREE.Mesh(new THREE.BoxGeometry(1.35, 7.2, 1.35), look.wallMat), -2.4, 4.0, 0);
    pL.rotation.z = -0.12;
    const pR = addPart(new THREE.Mesh(new THREE.BoxGeometry(1.35, 7.2, 1.35), look.wallMat), 2.4, 4.0, 0);
    pR.rotation.z = 0.12;
    // Upper lintel crown & Tartarus finial
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 1.65), look.trimMat), 0, 7.45, 0);
    addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), pal.ember), 0, 8.35, 0);
    // Glowing Vortex Ring + Core
    const vortexRing = addPart(new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.22, 12, 28), pal.crystalGlow), 0, 4.2, 0);
    const vortexCore = addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 1), pal.ember), 0, 4.2, 0);
    root.userData.beaconCrystal = vortexCore;
    root.userData.vortexRing = vortexRing;
    // Four perimeter ritual rune obelisks
    for (const [ox, oz] of [[-3.2, 2.8], [3.2, 2.8], [-3.2, -2.8], [3.2, -2.8]]) {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.38, 2.8, 4), pal.obsidian), ox, 1.7, oz);
      addPart(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 4), teamMat), ox, 3.35, oz);
    }

    attachGroundMarkers(root, 4.0, pal, team);
    attachHealthBar(root, 8.4, 3.5);
    return root;
  }

  // --- EGYPTIAN / AZTEC / BABYLONIAN ARCHITECTURE ---
  if (look.style === 'egyptian') {
    if (kind === 'town_center') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.55, 7.0), pal.sandstoneDark), 0, 0.275, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.42, 6.2), look.wallMat), 0, 0.75, 0);
      // Twin monumental gateway pylons (height 4.6u)
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.8, 5.0), look.wallMat), -2.1, 2.7, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.8, 5.0), look.wallMat), 2.1, 2.7, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 4.0), pal.sandstoneDark), 0, 2.2, -0.2);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.32, 5.2), look.trimMat), 0, 4.75, 0);
      // Winged sun disc
      const sunDisc = addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.24, 16), look.roofMat), 0, 5.5, 2.0);
      sunDisc.rotation.x = Math.PI / 2;
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.28, 0.16), look.roofMat), 0, 5.5, 2.0);
      // Twin towering Egyptian obelisks (height 6.8u)
      for (const ox of [-2.85, 2.85]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 4.4, 4), look.wallMat), ox, 2.9, 2.6);
        addPart(new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.75, 4), look.roofMat), ox, 5.45, 2.6);
      }
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), pal.gold), 2.8, 5.8, -2.4);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.08), teamMat), 3.4, 6.6, -2.4);

      attachGroundMarkers(root, 4.0, pal, team);
      attachHealthBar(root, 7.2, 3.4);
      return root;
    }
    if (kind === 'house') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 2.6), pal.sandstoneDark), 0, 0.15, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.3), look.wallMat), 0, 1.2, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 2.5), pal.sandstoneDark), 0, 2.2, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 2.1), look.trimMat), 0, 2.38, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.35, 0.22), pal.timber), 0, 0.98, 1.15);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.08), teamMat), 0.95, 1.6, 1.18);

      attachGroundMarkers(root, 1.8, pal, team);
      attachHealthBar(root, 3.2, 2.0);
      return root;
    }
    if (kind === 'barracks') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 4.2), pal.sandstoneDark), 0, 0.2, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 3.6), look.wallMat), 0, 1.6, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.3, 3.9), look.trimMat), 0, 2.95, 0);
      for (const ox of [-1.85, 1.85]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.58, 3.4, 4), pal.sandstoneDark), ox, 2.1, 1.6);
        addPart(new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.8, 4), look.roofMat), ox, 4.2, 1.6);
      }
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 12), pal.gold);
      shield.rotation.x = Math.PI / 2;
      addPart(shield, 0, 2.1, 1.85);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.1), teamMat), 0, 3.5, 0);

      attachGroundMarkers(root, 2.7, pal, team);
      attachHealthBar(root, 4.4, 2.6);
      return root;
    }
    if (kind === 'temple') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 5.2), pal.sandstoneDark), 0, 0.2, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.35, 4.6), look.wallMat), 0, 0.58, 0);
      const pyrBase = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.4, 4), look.wallMat);
      pyrBase.rotation.y = Math.PI / 4;
      addPart(pyrBase, 0, 2.45, 0);
      const pyrCap = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 4), look.roofMat);
      pyrCap.rotation.y = Math.PI / 4;
      addPart(pyrCap, 0, 4.15, 0);
      for (const [px, pz] of [[-2.0, 2.0], [2.0, 2.0], [-2.0, -2.0], [2.0, -2.0]]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.8, 10), look.wallMat), px, 2.2, pz);
        addPart(new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), look.trimMat), px, 3.65, pz);
      }
      const crystal = addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), pal.crystalGlow), 0, 5.8, 0);
      root.userData.beaconCrystal = crystal;
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.35, 0.08), teamMat), 0, 1.8, 2.15);

      attachGroundMarkers(root, 3.0, pal, team);
      attachHealthBar(root, 6.2, 2.8);
      return root;
    }
    // tower (Watch Tower, Height 7.2u)
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 2.2), pal.sandstoneDark), 0, 0.275, 0);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.05, 4.8, 4), look.wallMat);
    shaft.rotation.y = Math.PI / 4;
    addPart(shaft, 0, 2.95, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.35, 1.65), look.trimMat), 0, 5.4, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 1.8), teamMat), 0, 5.68, 0);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.4, 4), look.roofMat);
    tip.rotation.y = Math.PI / 4;
    addPart(tip, 0, 6.5, 0);

    attachGroundMarkers(root, 1.6, pal, team);
    attachHealthBar(root, 7.4, 1.9);
    return root;
  }

  // --- NORSE / JAPANESE / CELTIC / LAKOTA / JOTUNN ARCHITECTURE ---
  if (look.style === 'norse') {
    if (kind === 'town_center') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.55, 7.0), pal.stoneDark), 0, 0.275, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.4, 4.8), look.wallMat), 0, 1.75, 0);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 3.2, 4), look.roofMat);
      roof.rotation.y = Math.PI / 4;
      addPart(roof, 0, 4.5, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.28, 0.4), look.trimMat), 0, 3.0, 2.45);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.28, 0.4), look.trimMat), 0, 3.0, -2.45);
      addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), pal.gold), 0, 6.3, 0);
      for (const sx of [-1.8, 0, 1.8]) {
        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 12), teamMat);
        sh.rotation.x = Math.PI / 2;
        addPart(sh, sx, 2.2, 2.46);
      }
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), pal.timber), 2.8, 5.5, 2.4);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.08), teamMat), 3.4, 6.3, 2.4);

      attachGroundMarkers(root, 4.0, pal, team);
      attachHealthBar(root, 7.2, 3.4);
      return root;
    }
    if (kind === 'house') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.32, 2.6), pal.stoneDark), 0, 0.16, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 2.2), look.wallMat), 0, 1.05, 0);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.8, 4), look.roofMat);
      roof.rotation.y = Math.PI / 4;
      addPart(roof, 0, 2.65, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.22), look.trimMat), 0, 0.85, 1.15);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.09, 10), teamMat);
      sh.rotation.x = Math.PI / 2;
      addPart(sh, 0.95, 1.35, 1.15);

      attachGroundMarkers(root, 1.8, pal, team);
      attachHealthBar(root, 3.2, 2.0);
      return root;
    }
    if (kind === 'barracks') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.42, 4.2), pal.stoneDark), 0, 0.21, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.2, 3.6), look.wallMat), 0, 1.5, 0);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.1, 4), look.roofMat);
      roof.rotation.y = Math.PI / 4;
      addPart(roof, 0, 3.55, 0);
      for (const [px, pz] of [[-1.95, 1.75], [1.95, 1.75], [-1.95, -1.75], [1.95, -1.75]]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 3.0, 8), look.trimMat), px, 1.7, pz);
      }
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.16), pal.steel), 0, 2.0, 1.85);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.1), teamMat), 0, 3.8, 0);

      attachGroundMarkers(root, 2.7, pal, team);
      attachHealthBar(root, 4.4, 2.6);
      return root;
    }
    if (kind === 'temple') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.42, 5.2), pal.stoneDark), 0, 0.21, 0);
      for (const [px, pz] of [[-1.95, 1.95], [1.95, 1.95], [-1.95, -1.95], [1.95, -1.95]]) {
        addPart(new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.6, 0.5), look.trimMat), px, 1.6, pz);
      }
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.4, 3.0), look.wallMat), 0, 1.6, 0);
      const spire1 = new THREE.Mesh(new THREE.ConeGeometry(2.7, 1.8, 4), look.roofMat);
      spire1.rotation.y = Math.PI / 4;
      addPart(spire1, 0, 3.5, 0);
      const spire2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.6, 4), look.roofMat);
      spire2.rotation.y = Math.PI / 4;
      addPart(spire2, 0, 4.7, 0);
      const crystal = addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), pal.iceBlue), 0, 6.0, 0);
      root.userData.beaconCrystal = crystal;
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.35, 0.08), teamMat), 0, 1.7, 1.55);

      attachGroundMarkers(root, 3.0, pal, team);
      attachHealthBar(root, 6.4, 2.8);
      return root;
    }
    // tower (Norse Watch Tower, Height 7.2u)
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.5, 0.6, 8), pal.stoneDark), 0, 0.3, 0);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.2, 4.2, 8), look.wallMat), 0, 2.7, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.55, 2.3), look.trimMat), 0, 4.95, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 2.4), teamMat), 0, 5.35, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.8, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 6.35, 0);
    addPart(new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), pal.steel), 0, 7.25, 0);

    attachGroundMarkers(root, 1.6, pal, team);
    attachHealthBar(root, 7.4, 1.9);
    return root;
  }

  // --- ATLANTEAN / CHINESE / ELDRITCH ARCHITECTURE ---
  if (look.style === 'atlantean') {
    if (kind === 'town_center') {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.3, 0.55, 8), pal.stoneDark), 0, 0.275, 0);
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.7, 0.4, 8), look.wallMat), 0, 0.75, 0);
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 2.6, 8), look.wallMat), 0, 2.25, 0);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        addPart(
          new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.8, 8), look.trimMat),
          Math.cos(ang) * 2.8,
          2.35,
          Math.sin(ang) * 2.8
        );
      }
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.2, 0.35, 8), look.trimMat), 0, 3.75, 0);
      addPart(new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), look.roofMat), 0, 3.9, 0);
      addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 0), pal.gold), 0, 6.5, 0);
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), look.trimMat), 2.8, 5.2, 2.8);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.08), teamMat), 3.35, 6.1, 2.8);

      attachGroundMarkers(root, 4.0, pal, team);
      attachHealthBar(root, 7.2, 3.4);
      return root;
    }
    if (kind === 'house') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.32, 2.6), pal.stoneDark), 0, 0.16, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 2.2), look.wallMat), 0, 1.05, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 2.4), look.trimMat), 0, 1.88, 0);
      addPart(new THREE.Mesh(new THREE.SphereGeometry(1.25, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), look.roofMat), 0, 1.98, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.08), teamMat), 0.9, 1.3, 1.15);

      attachGroundMarkers(root, 1.8, pal, team);
      attachHealthBar(root, 3.2, 2.0);
      return root;
    }
    if (kind === 'barracks') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.42, 4.2), pal.stoneDark), 0, 0.21, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.9, 2.2, 3.5), look.wallMat), 0, 1.5, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 3.8), look.trimMat), 0, 2.7, 0);
      for (const sx of [-1.8, 1.8]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 3.2, 8), look.wallMat), sx, 1.9, 1.6);
        addPart(new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), look.roofMat), sx, 3.5, 1.6);
      }
      addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), look.trimMat), 0, 2.1, 1.82);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.1), teamMat), 0, 3.5, 0);

      attachGroundMarkers(root, 2.7, pal, team);
      attachHealthBar(root, 4.4, 2.6);
      return root;
    }
    if (kind === 'temple') {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.6, 0.42, 8), pal.stoneDark), 0, 0.21, 0);
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.1, 0.35, 8), look.wallMat), 0, 0.58, 0);
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 2.6, 8), look.wallMat), 0, 1.95, 0);
      for (const [px, pz] of [[-2.0, 2.0], [2.0, 2.0], [-2.0, -2.0], [2.0, -2.0]]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 3.4, 8), look.trimMat), px, 2.3, pz);
        addPart(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.65, 6), look.roofMat), px, 4.3, pz);
      }
      addPart(new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.14, 8, 20), look.trimMat), 0, 3.65, 0);
      const crystal = addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), pal.crystalGlow), 0, 5.8, 0);
      root.userData.beaconCrystal = crystal;
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.35, 0.08), teamMat), 0, 1.75, 1.95);

      attachGroundMarkers(root, 3.0, pal, team);
      attachHealthBar(root, 6.4, 2.8);
      return root;
    }
    // tower (Atlantean Watch Tower, Height 7.2u)
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.55, 8), pal.stoneDark), 0, 0.275, 0);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.88, 1.15, 4.2, 8), look.wallMat), 0, 2.65, 0);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.1, 0.45, 8), look.trimMat), 0, 4.9, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 2.1), teamMat), 0, 5.25, 0);
    addPart(new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), look.roofMat), 0, 5.35, 0);
    addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), pal.crystalGlow), 0, 6.75, 0);

    attachGroundMarkers(root, 1.6, pal, team);
    attachHealthBar(root, 7.4, 1.9);
    return root;
  }

  // --- GREEK / ROMAN ARCHITECTURE (Parthenon/Acropolis Grand Monuments) ---
  if (kind === 'town_center') {
    // Grand 3-Tiered Marble Stylobate Base (Footprint 7.2 x 7.2)
    addPart(new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 7.2), pal.stoneDark), 0, 0.175, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.30, 6.6), look.wallMat), 0, 0.50, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.25, 6.0), look.wallMat), 0, 0.775, 0);
    // Classical Sanctuary Cella Walls
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 4.2), look.wallMat), 0, 2.3, 0);
    // Peristyle Colonnade: 8 Fluted Corinthian Columns (height 3.2u)
    const colGeo = new THREE.CylinderGeometry(0.24, 0.28, 3.2, 10);
    for (const [cx, cz] of [
      [-2.6, 2.6], [0, 2.6], [2.6, 2.6],
      [-2.6, -2.6], [0, -2.6], [2.6, -2.6],
      [-2.6, 0], [2.6, 0]
    ]) {
      addPart(new THREE.Mesh(colGeo, look.wallMat), cx, 2.5, cz);
    }
    // Entablature Architrave & Frieze
    addPart(new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.38, 6.2), look.trimMat), 0, 4.25, 0);
    // Classical Terracotta/Crimson Pitched Pediment Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.2, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 5.5, 0);
    // Golden Lantern Rotunda & Acroterion / Zeus Eagle at 6.8u
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.85, 8), pal.gold), 0, 6.75, 0);
    addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), pal.gold), 0, 7.35, 0);
    // Faction Banner Staff reaching 7.5u
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), look.trimMat), 2.8, 5.6, 2.8);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.08), teamMat), 3.4, 6.5, 2.8);

    attachGroundMarkers(root, 4.0, pal, team);
    attachHealthBar(root, 7.2, 3.4);
  } else if (kind === 'house') {
    // Mediterranean Domus: 3.0 x 2.6, Stucco walls, Arched door, Pitched roof at 2.8u
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.32, 2.6), pal.stoneDark), 0, 0.16, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 2.2), look.wallMat), 0, 1.1, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.16, 2.3), pal.timber), 0, 1.95, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.35, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 2.65, 0);
    // Arched entrance (height 1.35u - perfect for 1.45u soldiers to enter)
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.25, 0.22), pal.timber), 0, 0.9, 1.12);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.08), teamMat), 0.95, 1.45, 1.12);

    attachGroundMarkers(root, 1.8, pal, team);
    attachHealthBar(root, 3.2, 2.0);
  } else if (kind === 'barracks') {
    // Strategeion / Military Barracks: Footprint 4.6 x 4.2, Bastions Height 4.2u
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.42, 4.2), pal.stoneDark), 0, 0.21, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.2, 3.6), pal.stoneDark), 0, 1.5, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.3, 3.9), look.trimMat), 0, 2.7, 0);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 3.4, 8), look.wallMat), -1.8, 1.9, 1.6);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 3.4, 8), look.wallMat), 1.8, 1.9, 1.6);
    addPart(new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.95, 8), look.roofMat), -1.8, 4.0, 1.6);
    addPart(new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.95, 8), look.roofMat), 1.8, 4.0, 1.6);
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 14), look.trimMat);
    crest.rotation.x = Math.PI / 2;
    addPart(crest, 0, 2.0, 1.85);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.1), teamMat), 0, 3.4, 0);

    attachGroundMarkers(root, 2.7, pal, team);
    attachHealthBar(root, 4.4, 2.6);
  } else if (kind === 'temple') {
    // Grand Classical Parthenon Temple: Footprint 5.2 x 5.2, Crystal at 5.8u
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 5.2), pal.stoneDark), 0, 0.2, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.35, 4.6), look.wallMat), 0, 0.58, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.4, 2.8), look.wallMat), 0, 1.95, 0);
    const pGeo = new THREE.CylinderGeometry(0.26, 0.30, 2.8, 12);
    for (const [px, pz] of [[-2.0, 2.0], [2.0, 2.0], [-2.0, -2.0], [2.0, -2.0]]) {
      addPart(new THREE.Mesh(pGeo, look.wallMat), px, 2.1, pz);
    }
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.35, 4.6), pal.gold), 0, 3.65, 0);
    addPart(new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), look.trimMat), 0, 3.82, 0);
    const crystal = addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 0), pal.crystalGlow), 0, 5.8, 0);
    root.userData.beaconCrystal = crystal;
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.35, 0.08), teamMat), 0, 1.8, 2.15);

    attachGroundMarkers(root, 3.0, pal, team);
    attachHealthBar(root, 6.4, 2.8);
  } else {
    // WATCH TOWER (Slender base 2.2x2.2, Soaring vantage platform, Height 7.2u)
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.45, 0.6, 8), pal.stoneDark), 0, 0.3, 0);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.82, 1.12, 4.2, 8), look.wallMat), 0, 2.7, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 2.2), pal.timber), 0, 4.95, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 2.35), teamMat), 0, 5.35, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.7, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 6.35, 0);
    addPart(new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), pal.gold), 0, 7.25, 0);

    attachGroundMarkers(root, 1.6, pal, team);
    attachHealthBar(root, 7.4, 1.9);
  }

  return root;
}

export function createUnitMesh(
  kind: UnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  pantheon: PantheonId = 'greek',
  majorGod?: string
): THREE.Group {
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const geos = getSculptedGeos();
  const look = getCivLook(pantheon, pal, majorGod);

  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (enableShadows) m.castShadow = true;
    root.add(m);
    return m;
  };

  if (kind === 'villager') {
    const villagerMesh = createRiggedVillagerMesh(team, pal, enableShadows);
    root.add(villagerMesh);
    root.userData.villagerMesh = villagerMesh;
    root.userData.animatePose = villagerMesh.userData.animatePose;
    root.userData.leftLeg = villagerMesh.userData.leftLeg;
    root.userData.rightLeg = villagerMesh.userData.rightLeg;
    root.userData.leftArm = villagerMesh.userData.leftArm;
    root.userData.rightArm = villagerMesh.userData.rightArm;
    attachGroundMarkers(root, 0.44, pal, team);
    attachHealthBar(root, 1.85, 1.0);
  } else if (kind === 'hoplite' || kind === 'hipaspist') {
    const greekMesh = createGreekUnitMesh(kind, team, pal, enableShadows);
    root.add(greekMesh);
    root.userData.greekMesh = greekMesh;
    root.userData.leftLeg = greekMesh.userData.leftLeg;
    root.userData.rightLeg = greekMesh.userData.rightLeg;
    root.userData.leftArm = greekMesh.userData.leftArm;
    root.userData.rightArm = greekMesh.userData.rightArm;
    root.userData.isSpriteSheet = greekMesh.userData.isSpriteSheet;
    root.userData.spriteMesh = greekMesh.userData.spriteMesh;
    root.userData.setMode = (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
      greekMesh.userData.setMode?.(mode);
      root.userData.isSpriteSheet = greekMesh.userData.isSpriteSheet;
      root.userData.spriteMesh = greekMesh.userData.spriteMesh;
    };
    root.userData.setArmorTier = (tier: 1 | 2 | 3 | 4) => {
      greekMesh.userData.setArmorTier?.(tier);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      greekMesh.userData.updateBrg?.(dt, state);
    };
    root.userData.animatePose = greekMesh.userData.animatePose;
    attachGroundMarkers(root, 0.48, pal, team);
    attachHealthBar(root, 1.88, 1.05);
  } else if (kind === 'archer') {
    if (look.style === 'greek') {
      // Archer G Toxotes Standard + Archer G Toxotes Head Standard (BANG 3-MTRL 3D procedural model)
      const S = 0.40;
      const Y_OFF = 0.20;
      const tunicMat = team === 'player' ? pal.ivory : teamMat;
      const helmMat = pal.gold;
      const crestMat = pal.berryRed;
      const crestBaseMat = pal.crimson;
      const leatherMat = pal.furBrown;

      const addBox = (
        parent: THREE.Object3D,
        mat: THREE.Material,
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        d: number,
        rx = 0,
        ry = 0,
        rz = 0,
        px = 0,
        py = 0,
        pz = 0,
      ) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), mat);
        m.position.set((x - px) * S, (y - py) * S + (parent === root ? Y_OFF : 0), (z - pz) * S);
        if (rx || ry || rz) m.rotation.set(rx, ry, rz);
        m.castShadow = true;
        m.receiveShadow = true;
        parent.add(m);
        return m;
      };

      const addCylZ = (
        parent: THREE.Object3D,
        mat: THREE.Material,
        x: number,
        y: number,
        z: number,
        r: number,
        h: number,
        px = 0,
        py = 0,
        pz = 0,
      ) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, h * S, 12), mat);
        m.position.set((x - px) * S, (y - py) * S + (parent === root ? Y_OFF : 0), (z - pz) * S);
        m.rotation.x = Math.PI / 2;
        m.castShadow = true;
        m.receiveShadow = true;
        parent.add(m);
        return m;
      };

      const addCylY = (
        parent: THREE.Object3D,
        mat: THREE.Material,
        x: number,
        y: number,
        z: number,
        r: number,
        h: number,
        rx = 0,
      ) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S * 0.85, h * S, 10), mat);
        m.position.set(x * S, y * S + Y_OFF, z * S);
        if (rx) m.rotation.x = rx;
        m.castShadow = true;
        m.receiveShadow = true;
        parent.add(m);
        return m;
      };

      // 1. Head & Helmet (Archer G Toxotes Head Standard)
      addBox(root, pal.skin, 0, 2.32, 0, 0.52, 0.50, 0.48);
      addBox(root, pal.skin, 0, 2.02, 0, 0.18, 0.18, 0.18);
      addBox(root, helmMat, 0, 2.62, 0, 0.62, 0.32, 0.58);
      addBox(root, helmMat, 0, 2.48, 0, 0.68, 0.09, 0.64);
      addBox(root, helmMat, -0.30, 2.24, 0.08, 0.07, 0.30, 0.32);
      addBox(root, helmMat, 0.30, 2.24, 0.08, 0.07, 0.30, 0.32);
      addBox(root, helmMat, 0, 2.30, 0.28, 0.06, 0.20, 0.06);
      addBox(root, crestBaseMat, 0, 2.82, 0, 0.10, 0.08, 0.78);
      addBox(root, crestMat, 0, 3.02, 0, 0.06, 0.34, 0.88);

      // 2. Torso, Tunic, Golden Chest Plate & Medallion, Belt, Skirt & Shoulder Pauldrons
      addBox(root, tunicMat, 0, 1.55, 0, 0.92, 1.05, 0.56);
      addBox(root, helmMat, 0, 1.72, 0.29, 0.56, 0.56, 0.06);
      addCylZ(root, pal.bronze, 0, 1.72, 0.33, 0.16, 0.05);
      addBox(root, leatherMat, 0, 1.08, 0, 0.96, 0.18, 0.60);
      addBox(root, helmMat, 0, 1.08, 0.31, 0.16, 0.12, 0.04);
      addBox(root, teamMat, 0, 0.68, 0, 0.98, 0.52, 0.62);
      addBox(root, helmMat, 0, 0.46, 0, 1.00, 0.08, 0.64);
      addBox(root, helmMat, -0.55, 1.96, 0, 0.28, 0.18, 0.52);
      addBox(root, helmMat, 0.55, 1.96, 0, 0.28, 0.18, 0.52);

      // 3. Legs & Leather Sandals in Archer Stance
      const leftLeg = new THREE.Group();
      const lHipX = -0.28, lHipY = 0.50, lHipZ = 0.08;
      leftLeg.position.set(lHipX * S, lHipY * S + Y_OFF, lHipZ * S);
      addBox(leftLeg, pal.skin, -0.28, 0.28, 0.28, 0.28, 0.58, 0.28, -0.55, 0, 0, lHipX, lHipY, lHipZ);
      addBox(leftLeg, pal.skin, -0.28, -0.28, 0.48, 0.24, 0.58, 0.24, 0.25, 0, 0, lHipX, lHipY, lHipZ);
      addBox(leftLeg, leatherMat, -0.28, -0.60, 0.60, 0.30, 0.10, 0.58, 0, 0, 0, lHipX, lHipY, lHipZ);
      root.add(leftLeg);

      const rightLeg = new THREE.Group();
      const rHipX = 0.28, rHipY = 0.50, rHipZ = -0.08;
      rightLeg.position.set(rHipX * S, rHipY * S + Y_OFF, rHipZ * S);
      addBox(rightLeg, pal.skin, 0.28, 0.28, -0.22, 0.28, 0.58, 0.28, 0.45, 0, 0, rHipX, rHipY, rHipZ);
      addBox(rightLeg, pal.skin, 0.28, -0.28, -0.38, 0.24, 0.58, 0.24, 0, 0, 0, rHipX, rHipY, rHipZ);
      addBox(rightLeg, leatherMat, 0.28, -0.60, -0.48, 0.30, 0.10, 0.58, 0, 0, 0, rHipX, rHipY, rHipZ);
      root.add(rightLeg);

      // 4. Left Arm + Light Shield + 11-Segment Curved Longbow + Bowstring + Nocked Arrow
      const leftArm = new THREE.Group();
      const lShX = -0.62, lShY = 1.86, lShZ = 0.10;
      leftArm.position.set(lShX * S, lShY * S + Y_OFF, lShZ * S);
      addBox(leftArm, pal.skin, -0.62, 1.66, 0.28, 0.22, 0.52, 0.22, -0.9, 0, 0, lShX, lShY, lShZ);
      addBox(leftArm, pal.skin, -0.62, 1.52, 0.68, 0.20, 0.48, 0.20, -1.35, 0, 0, lShX, lShY, lShZ);
      addBox(leftArm, pal.skin, -0.62, 1.52, 0.94, 0.18, 0.18, 0.18, 0, 0, 0, lShX, lShY, lShZ);

      // Light Shield strapped to Left Arm
      addCylZ(leftArm, crestBaseMat, -0.62, 1.32, 0.52, 0.38, 0.08, lShX, lShY, lShZ);
      addCylZ(leftArm, helmMat, -0.62, 1.32, 0.60, 0.10, 0.06, lShX, lShY, lShZ);
      addBox(leftArm, helmMat, -0.62, 1.32, 0.58, 0.70, 0.06, 0.04, 0, 0, 0, lShX, lShY, lShZ);
      addBox(leftArm, helmMat, -0.62, 1.32, 0.58, 0.06, 0.70, 0.04, 0, 0, 0, lShX, lShY, lShZ);

      // 11-Segment Curved Wooden Longbow
      for (let s = 0; s <= 10; s++) {
        const p = -1 + s / 5;
        const bx = -0.62 + Math.abs(p) * 0.24;
        const by = 1.62 + p * 0.98;
        const bz = 0.96 - Math.abs(p) * 0.10;
        addBox(leftArm, pal.timber, bx, by, bz, 0.08, 0.24, 0.08, 0, 0, p * 0.28, lShX, lShY, lShZ);
      }

      // Drawn Bowstring
      const strPts = [
        new THREE.Vector3((-0.62 - lShX) * S, (2.60 - lShY) * S, (0.86 - lShZ) * S),
        new THREE.Vector3((0.22 - lShX) * S, (1.88 - lShY) * S, (0.32 - lShZ) * S),
        new THREE.Vector3((-0.62 - lShX) * S, (0.64 - lShY) * S, (1.06 - lShZ) * S),
      ];
      const strGeo = new THREE.BufferGeometry().setFromPoints(strPts);
      const bowString = new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xeae0c8 }));
      leftArm.add(bowString);

      // Nocked Arrow with Steel Tip & Red Fletching
      addBox(leftArm, pal.ivory, -0.18, 1.74, 0.66, 0.045, 0.045, 1.15, 0.02, -0.38, 0, lShX, lShY, lShZ);
      addBox(leftArm, pal.steel, -0.36, 1.73, 1.18, 0.05, 0.05, 0.18, 0.02, -0.38, 0, lShX, lShY, lShZ);
      addBox(leftArm, crestMat, 0.06, 1.76, 0.26, 0.04, 0.15, 0.13, 0.02, -0.38, 0, lShX, lShY, lShZ);
      root.add(leftArm);

      // 5. Right Arm Drawing the Bowstring
      const rightArm = new THREE.Group();
      const rShX = 0.62, rShY = 1.86, rShZ = 0.05;
      rightArm.position.set(rShX * S, rShY * S + Y_OFF, rShZ * S);
      addBox(rightArm, pal.skin, 0.62, 1.66, 0.05, 0.22, 0.52, 0.22, 0, 0, -0.35, rShX, rShY, rShZ);
      addBox(rightArm, pal.skin, 0.48, 1.62, 0.32, 0.20, 0.46, 0.20, -1.0, 0, -0.35, rShX, rShY, rShZ);
      addBox(rightArm, pal.skin, 0.22, 1.88, 0.32, 0.18, 0.16, 0.16, 0, 0, 0, rShX, rShY, rShZ);
      root.add(rightArm);

      // 6. Back Quiver with 3 Arrows
      addCylY(root, leatherMat, 0.42, 1.72, -0.48, 0.22, 0.72, 0.28);
      addBox(root, pal.ivory, 0.34, 2.28, -0.52, 0.04, 0.52, 0.04);
      addBox(root, pal.ivory, 0.46, 2.30, -0.50, 0.04, 0.52, 0.04);
      addBox(root, pal.ivory, 0.42, 2.28, -0.58, 0.04, 0.52, 0.04);
      addBox(root, crestMat, 0.40, 2.52, -0.52, 0.10, 0.08, 0.10);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
    } else {
      const leftLeg = part(geos.sculptedLimb, pal.furBrown, -0.11, 0.25, 0);
      const rightLeg = part(geos.sculptedLimb, pal.furBrown, 0.11, 0.25, 0);
      part(geos.humanTorso, look.style === 'egyptian' ? pal.ivory : teamMat, 0, 0.84, 0);
      part(new THREE.CylinderGeometry(0.21, 0.23, 0.16, 10), teamMat, 0, 0.68, 0);
      part(new THREE.SphereGeometry(0.18, 10, 8), pal.skin, 0, 1.34, 0);
      part(geos.corinthianHelm, look.style === 'norse' ? pal.steel : look.style === 'atlantean' ? look.trimMat : teamMat, 0, 1.4, 0);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.26, 0.96, 0.12);

      if (look.style === 'norse') {
        const hL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.52, 6), pal.timber);
        hL.rotation.x = Math.PI / 2.2;
        hL.position.set(0, -0.05, 0.2);
        const bL = new THREE.Mesh(geos.axeBlade, pal.steel);
        bL.rotation.y = Math.PI / 2;
        bL.scale.setScalar(0.65);
        bL.position.set(0, 0.05, 0.36);
        leftArm.add(hL, bL);
        root.add(leftArm);

        const rightArm = new THREE.Group();
        rightArm.position.set(0.26, 0.96, 0.08);
        const armR = new THREE.Mesh(geos.sculptedLimb, pal.skin);
        armR.position.y = -0.14;
        const hR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.56, 6), pal.timber);
        hR.rotation.x = Math.PI / 2.2;
        hR.position.set(0, -0.05, 0.24);
        const bR = new THREE.Mesh(geos.axeBlade, pal.steel);
        bR.rotation.y = Math.PI / 2;
        bR.scale.setScalar(0.65);
        bR.position.set(0, 0.06, 0.42);
        rightArm.add(armR, hR, bR);
        root.add(rightArm);

        root.userData.leftLeg = leftLeg;
        root.userData.rightLeg = rightLeg;
        root.userData.leftArm = leftArm;
        root.userData.rightArm = rightArm;
      } else if (look.style === 'egyptian') {
        const armL = new THREE.Mesh(geos.sculptedLimb, pal.skin);
        armL.position.y = -0.14;
        leftArm.add(armL);
        root.add(leftArm);

        const rightArm = new THREE.Group();
        rightArm.position.set(0.26, 0.98, 0.08);
        const armR = new THREE.Mesh(geos.sculptedLimb, pal.skin);
        armR.position.y = -0.14;
        const slingRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.024, 6, 12), pal.furBrown);
        slingRing.position.set(0, 0.14, 0.26);
        const stone = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), pal.gold);
        stone.position.set(0, 0.34, 0.26);
        rightArm.add(armR, slingRing, stone);
        root.add(rightArm);

        root.userData.leftLeg = leftLeg;
        root.userData.rightLeg = rightLeg;
        root.userData.leftArm = leftArm;
        root.userData.rightArm = rightArm;
      } else {
        const quiver = part(new THREE.CylinderGeometry(0.08, 0.07, 0.55, 6), pal.timber, -0.12, 0.96, -0.24);
        quiver.rotation.z = 0.25;
        const armL = new THREE.Mesh(geos.sculptedLimb, pal.skin);
        armL.position.y = -0.14;
        const bow = new THREE.Mesh(geos.compoundBow, look.style === 'atlantean' ? look.trimMat : pal.timber);
        bow.position.set(0.02, 0.02, 0.22);
        const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.65, 5), pal.ivory);
        arrowShaft.rotation.x = Math.PI / 2;
        arrowShaft.position.set(0.02, 0.02, 0.28);
        leftArm.add(armL, bow, arrowShaft);
        root.add(leftArm);

        const rightArm = part(geos.sculptedLimb, pal.skin, 0.26, 0.88, 0.08);
        root.userData.leftLeg = leftLeg;
        root.userData.rightLeg = rightLeg;
        root.userData.leftArm = leftArm;
        root.userData.rightArm = rightArm;
      }
    }

    attachGroundMarkers(root, 0.45, pal, team);
    attachHealthBar(root, 1.88, 1.0);
  } else if (kind === 'cavalry') {
    // Sculpted Mount (Horse / Camel) + Armored Rider with Lance & Cape
    part(geos.horseBarrel, look.mountMat, 0, 0.94, 0);
    if (look.style === 'egyptian') {
      part(new THREE.SphereGeometry(0.32, 10, 8), pal.sandstoneDark, 0, 1.26, -0.05);
    }
    const leftLeg = part(geos.sculptedLimb, look.mountMat, -0.2, 0.34, 0.46);
    const rightLeg = part(geos.sculptedLimb, look.mountMat, 0.2, 0.34, 0.46);
    part(geos.sculptedLimb, look.mountMat, -0.2, 0.34, -0.46);
    part(geos.sculptedLimb, look.mountMat, 0.2, 0.34, -0.46);
    const neck = part(geos.horseNeck, look.mountMat, 0, 1.32, 0.6);
    neck.rotation.x = look.style === 'egyptian' ? 0.26 : 0.42;
    part(new THREE.BoxGeometry(0.22, 0.22, 0.46), look.mountMat, 0, 1.58, 0.86);
    const tail = part(new THREE.ConeGeometry(0.09, 0.56, 6), pal.obsidian, 0, 0.86, -0.82);
    tail.rotation.x = -0.45;
    // Rider
    part(geos.armoredCuirass, teamMat, 0, 1.54, -0.05);
    part(new THREE.SphereGeometry(0.19, 10, 8), pal.skin, 0, 1.98, -0.05);
    part(geos.corinthianHelm, look.armorMat, 0, 2.04, -0.05);
    part(new THREE.BoxGeometry(0.08, 0.2, 0.36), pal.gold, 0, 2.28, -0.05);
    // Flowing Rider Cape
    const cape = part(geos.capeMesh, teamMat, 0, 1.82, -0.26);
    cape.scale.set(0.68, 0.65, 0.8);
    cape.rotation.x = 0.32;

    const rightArm = new THREE.Group();
    rightArm.position.set(0.3, 1.58, 0);
    const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.0, 6), pal.timber);
    lance.rotation.x = Math.PI / 2.2;
    lance.position.set(0, -0.05, 0.55);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 6), pal.steel);
    tip.rotation.x = Math.PI / 2.2;
    tip.position.set(0, 0.12, 1.52);
    rightArm.add(lance, tip);
    root.add(rightArm);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 0.72, pal, team);
    attachHealthBar(root, 2.55, 1.4);
  } else if (kind === 'ajax' || (kind === 'hero' && look.style === 'greek')) {
    // Hero G Ajax Standard + Hero G Ajax Head Standard (BANG 3-MTRL 3D procedural model)
    // Towering Salaminian Hero with 7-Layer Boeotian/Tower Shield, Colossal Spear, Heroic Plumed Helmet & Muscle Cuirass
    const S = kind === 'ajax' ? 0.46 : 0.44;
    const Y_OFF = 0.24;
    const tunicMat = team === 'player' ? pal.ivory : teamMat;
    const helmMat = pal.gold;
    const bronzeMat = pal.bronze;
    const crestMat = kind === 'ajax' ? pal.berryRed : pal.crimson;
    const crestBaseMat = pal.crimson;
    const leatherMat = pal.furBrown;

    const addBox = (
      parent: THREE.Object3D,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      rx = 0,
      ry = 0,
      rz = 0,
      px = 0,
      py = 0,
      pz = 0,
    ) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), mat);
      m.position.set((x - px) * S, (y - py) * S + (parent === root ? Y_OFF : 0), (z - pz) * S);
      if (rx || ry || rz) m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    const addCylZ = (
      parent: THREE.Object3D,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
      r: number,
      h: number,
      px = 0,
      py = 0,
      pz = 0,
    ) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, h * S, 14), mat);
      m.position.set((x - px) * S, (y - py) * S + (parent === root ? Y_OFF : 0), (z - pz) * S);
      m.rotation.x = Math.PI / 2;
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    // 1. Head, Heroic Beard & Corinthian Plumed Helmet (Hero G Ajax Head Standard)
    addBox(root, pal.skin, 0, 2.36, 0, 0.56, 0.52, 0.52);
    addBox(root, pal.skin, 0, 2.04, 0, 0.22, 0.20, 0.22);
    addBox(root, leatherMat, 0, 2.16, 0.20, 0.44, 0.22, 0.20);
    addBox(root, helmMat, 0, 2.66, 0, 0.68, 0.36, 0.64);
    addBox(root, helmMat, 0, 2.50, 0, 0.74, 0.10, 0.70);
    addBox(root, helmMat, -0.32, 2.26, 0.10, 0.08, 0.34, 0.36);
    addBox(root, helmMat, 0.32, 2.26, 0.10, 0.08, 0.34, 0.36);
    addBox(root, helmMat, 0, 2.32, 0.30, 0.07, 0.22, 0.07);
    // Towering Heroic Horsehair Crest with Ivory Stripe
    addBox(root, crestBaseMat, 0, 2.88, 0, 0.14, 0.12, 0.86);
    addBox(root, crestMat, 0, 3.16, 0, 0.10, 0.44, 1.02);
    addBox(root, pal.ivory, 0, 3.04, 0, 0.11, 0.12, 0.94);

    // 2. Broad Muscular Torso, Sculpted Bronze/Gold Cuirass, Medallion, Pteruges Skirt & Heroic Cape
    addBox(root, tunicMat, 0, 1.56, 0, 1.06, 1.10, 0.62);
    addBox(root, helmMat, 0, 1.66, 0.30, 0.88, 0.76, 0.08);
    addBox(root, bronzeMat, -0.22, 1.78, 0.34, 0.36, 0.34, 0.06);
    addBox(root, bronzeMat, 0.22, 1.78, 0.34, 0.36, 0.34, 0.06);
    addCylZ(root, pal.goldOre, 0, 1.78, 0.38, 0.18, 0.06);
    // Studded War Belt & Gold Buckle
    addBox(root, leatherMat, 0, 1.08, 0, 1.10, 0.20, 0.66);
    addBox(root, helmMat, 0, 1.08, 0.34, 0.22, 0.16, 0.06);
    // Pteruges Layered Battle Skirt
    addBox(root, teamMat, 0, 0.68, 0, 1.12, 0.54, 0.68);
    addBox(root, helmMat, 0, 0.44, 0, 1.14, 0.09, 0.70);
    for (let i = -2; i <= 2; i++) {
      addBox(root, leatherMat, i * 0.20, 0.66, 0.35, 0.13, 0.48, 0.04);
      addBox(root, helmMat, i * 0.20, 0.46, 0.36, 0.13, 0.08, 0.05);
    }
    // Ornate Layered Golden Shoulder Pauldrons
    addBox(root, helmMat, -0.64, 1.98, 0, 0.34, 0.24, 0.58);
    addBox(root, helmMat, 0.64, 1.98, 0, 0.34, 0.24, 0.58);
    addCylZ(root, pal.goldOre, -0.42, 1.96, 0.32, 0.11, 0.05);
    addCylZ(root, pal.goldOre, 0.42, 1.96, 0.32, 0.11, 0.05);
    // Flowing Heroic Cape on Back
    addBox(root, team === 'player' ? crestBaseMat : teamMat, 0, 1.32, -0.36, 1.04, 1.48, 0.08, 0.14, 0, 0);

    // 3. Legs with Bronze Greaves (Cnêmides) & Leather War Sandals
    const leftLeg = new THREE.Group();
    const lHipX = -0.30, lHipY = 0.50, lHipZ = 0.06;
    leftLeg.position.set(lHipX * S, lHipY * S + Y_OFF, lHipZ * S);
    addBox(leftLeg, pal.skin, -0.30, 0.28, 0.18, 0.32, 0.58, 0.32, -0.25, 0, 0, lHipX, lHipY, lHipZ);
    addBox(leftLeg, helmMat, -0.30, -0.28, 0.28, 0.28, 0.60, 0.28, 0.12, 0, 0, lHipX, lHipY, lHipZ);
    addBox(leftLeg, bronzeMat, -0.30, 0.02, 0.42, 0.18, 0.18, 0.08, 0, 0, 0, lHipX, lHipY, lHipZ);
    addBox(leftLeg, leatherMat, -0.30, -0.60, 0.36, 0.34, 0.12, 0.62, 0, 0, 0, lHipX, lHipY, lHipZ);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    const rHipX = 0.30, rHipY = 0.50, rHipZ = -0.06;
    rightLeg.position.set(rHipX * S, rHipY * S + Y_OFF, rHipZ * S);
    addBox(rightLeg, pal.skin, 0.30, 0.28, -0.16, 0.32, 0.58, 0.32, 0.25, 0, 0, rHipX, rHipY, rHipZ);
    addBox(rightLeg, helmMat, 0.30, -0.28, -0.26, 0.28, 0.60, 0.28, 0, 0, 0, rHipX, rHipY, rHipZ);
    addBox(rightLeg, bronzeMat, 0.30, 0.02, -0.12, 0.18, 0.18, 0.08, 0, 0, 0, rHipX, rHipY, rHipZ);
    addBox(rightLeg, leatherMat, 0.30, -0.60, -0.34, 0.34, 0.12, 0.62, 0, 0, 0, rHipX, rHipY, rHipZ);
    root.add(rightLeg);

    // 4. Left Arm + Ajax's Iconic 7-Layer Colossal Tower Shield (Sakos de Salamina)
    const leftArm = new THREE.Group();
    const lShX = -0.68, lShY = 1.86, lShZ = 0.08;
    leftArm.position.set(lShX * S, lShY * S + Y_OFF, lShZ * S);
    addBox(leftArm, pal.skin, -0.68, 1.66, 0.16, 0.26, 0.54, 0.26, -0.55, 0, 0, lShX, lShY, lShZ);
    addBox(leftArm, helmMat, -0.68, 1.44, 0.52, 0.24, 0.48, 0.24, -1.15, 0, 0, lShX, lShY, lShZ);
    addBox(leftArm, pal.skin, -0.68, 1.40, 0.78, 0.20, 0.20, 0.20, 0, 0, 0, lShX, lShY, lShZ);

    // Colossal 7-Layer Bronze & Bullhide Tower Shield
    addBox(leftArm, helmMat, -0.82, 1.28, 0.56, 0.14, 1.74, 1.12, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, crestBaseMat, -0.87, 1.28, 0.58, 0.08, 1.56, 0.96, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, helmMat, -0.90, 1.68, 0.60, 0.06, 0.10, 0.98, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, helmMat, -0.90, 0.88, 0.60, 0.06, 0.10, 0.98, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, pal.goldOre, -0.92, 1.28, 0.62, 0.10, 0.36, 0.36, 0, 0.32, 0, lShX, lShY, lShZ);
    root.add(leftArm);

    // 5. Right Arm + Heavy Heroic Spear (Dory Colossal) & Sheathed Xiphos at Hip
    const rightArm = new THREE.Group();
    const rShX = 0.68, rShY = 1.86, rShZ = 0.06;
    rightArm.position.set(rShX * S, rShY * S + Y_OFF, rShZ * S);
    addBox(rightArm, pal.skin, 0.68, 1.66, 0.08, 0.26, 0.54, 0.26, -0.45, 0, -0.18, rShX, rShY, rShZ);
    addBox(rightArm, helmMat, 0.68, 1.42, 0.46, 0.24, 0.50, 0.24, -1.10, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, pal.skin, 0.68, 1.38, 0.74, 0.22, 0.20, 0.20, 0, 0, 0, rShX, rShY, rShZ);
    // Heavy Ash-Wood Spear Shaft + Golden Grip Rings + Steel Spearhead + Bronze Butt-Spike
    addBox(rightArm, pal.timber, 0.68, 1.42, 1.08, 0.09, 0.09, 2.85, 0.08, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, helmMat, 0.68, 1.52, 2.32, 0.13, 0.13, 0.18, 0.08, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, pal.steel, 0.68, 1.55, 2.66, 0.18, 0.10, 0.54, 0.08, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, helmMat, 0.68, 1.30, -0.36, 0.12, 0.12, 0.26, 0.08, 0, 0, rShX, rShY, rShZ);
    root.add(rightArm);

    // Sheathed Xiphos Sword on Left Hip
    addBox(root, crestBaseMat, -0.58, 0.92, -0.08, 0.10, 0.14, 0.76, 0.35, 0, 0);
    addBox(root, helmMat, -0.58, 1.06, 0.28, 0.14, 0.16, 0.14, 0.35, 0, 0);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 0.58, pal, team);
    attachHealthBar(root, 2.25, 1.35);
  } else if (kind === 'hero') {
    // Heroic Golden Champion (Anti-Myth 3x bonus): Flowing Cape, Halo Crown, Greatblade & Embossed Shield
    const leftLeg = part(geos.sculptedLimb, pal.gold, -0.15, 0.3, 0);
    const rightLeg = part(geos.sculptedLimb, pal.gold, 0.15, 0.3, 0);
    part(geos.heroCuirass, pal.gold, 0, 0.96, 0);
    part(new THREE.CylinderGeometry(0.28, 0.33, 0.26, 12), teamMat, 0, 0.62, 0);
    // Ornate Pauldrons
    part(new THREE.SphereGeometry(0.18, 10, 8), pal.gold, -0.35, 1.24, 0);
    part(new THREE.SphereGeometry(0.18, 10, 8), pal.gold, 0.35, 1.24, 0);
    // Flowing Hero Cape
    const cape = part(geos.capeMesh, teamMat, 0, 1.28, -0.25);
    cape.rotation.x = 0.18;
    // Sculpted Head + Winged/Plumed Hero Helm + Radiant Halo
    part(new THREE.SphereGeometry(0.21, 12, 10), pal.skin, 0, 1.54, 0);
    part(geos.corinthianHelm, pal.gold, 0, 1.6, 0);
    part(new THREE.BoxGeometry(0.1, 0.28, 0.5), teamMat, 0, 1.9, -0.02);
    const halo = part(new THREE.TorusGeometry(0.32, 0.032, 8, 20), pal.goldOre, 0, 1.88, -0.1);
    halo.rotation.x = 0.25;

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.38, 1.1, 0.08);
    const shield = new THREE.Mesh(geos.domedShield, pal.gold);
    shield.scale.setScalar(1.15);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.1, -0.08, 0.12);
    const boss = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), pal.crystalGlow);
    boss.position.set(-0.22, -0.08, 0.12);
    leftArm.add(shield, boss);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.38, 1.14, 0);
    const arm = new THREE.Mesh(geos.sculptedLimb, pal.gold);
    arm.position.y = -0.18;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.1), pal.gold);
    guard.position.set(0, -0.24, 0.1);
    const blade = new THREE.Mesh(geos.greatSwordBlade, pal.crystalGlow);
    blade.rotation.x = Math.PI / 2;
    blade.scale.set(1.1, 1.2, 1.1);
    blade.position.set(0, -0.24, 0.12);
    rightArm.add(arm, guard, blade);
    root.add(rightArm);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 0.56, pal, team);
    attachHealthBar(root, 2.25, 1.35);
  } else if (kind === 'siege') {
    // 4-Wheeled Siege Catapult / Onager with Torsion Bar, Throwing Arm & Boulder
    const chassis = part(new THREE.BoxGeometry(1.15, 0.28, 1.75), pal.timber, 0, 0.48, 0);
    part(new THREE.BoxGeometry(1.25, 0.18, 0.35), look.trimMat, 0, 0.65, 0.45);
    part(new THREE.BoxGeometry(1.0, 0.65, 0.12), teamMat, 0, 0.92, 0.85);
    // 4 Spoked Wheels (Left/Right front & back)
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const leftLeg = part(wheelGeo, pal.norseTimber, -0.68, 0.34, 0.6);
    const rightLeg = part(wheelGeo, pal.norseTimber, 0.68, 0.34, 0.6);
    part(wheelGeo, pal.norseTimber, -0.68, 0.34, -0.6);
    part(wheelGeo, pal.norseTimber, 0.68, 0.34, -0.6);
    // Upright A-frame posts + crossbar
    part(new THREE.BoxGeometry(0.14, 0.85, 0.16), pal.timber, -0.5, 0.98, 0.25);
    part(new THREE.BoxGeometry(0.14, 0.85, 0.16), pal.timber, 0.5, 0.98, 0.25);
    part(new THREE.CylinderGeometry(0.1, 0.1, 1.15, 8), look.trimMat, 0, 1.32, 0.25).rotation.z = Math.PI / 2;
    // Throwing arm + glowing stone/fire boulder
    const rightArm = new THREE.Group();
    rightArm.position.set(0, 0.62, 0.25);
    const throwBeam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.45, 0.14), pal.timber);
    throwBeam.rotation.x = -0.62;
    throwBeam.position.set(0, 0.55, -0.38);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.18, 10), look.trimMat);
    cup.position.set(0, 1.1, -0.78);
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), pal.ember);
    boulder.position.set(0, 1.24, -0.78);
    rightArm.add(throwBeam, cup, boulder);
    root.add(rightArm);
    void chassis;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 1.0, pal, team);
    attachHealthBar(root, 2.3, 1.5);
  } else if (kind === 'minotaur') {
    if (look.style === 'norse') {
      // Valkyrie: Winged armored shieldmaiden
      const leftLeg = part(geos.sculptedLimb, pal.steel, -0.14, 0.3, 0);
      const rightLeg = part(geos.sculptedLimb, pal.steel, 0.14, 0.3, 0);
      part(geos.heroCuirass, pal.steel, 0, 0.98, 0);
      part(new THREE.CylinderGeometry(0.26, 0.32, 0.28, 10), teamMat, 0, 0.68, 0);
      part(new THREE.SphereGeometry(0.2, 10, 8), pal.skin, 0, 1.56, 0);
      part(geos.corinthianHelm, pal.gold, 0, 1.62, 0);
      const wL = part(geos.capeMesh, pal.ivory, -0.22, 1.52, -0.22);
      wL.rotation.z = -0.85;
      wL.rotation.y = 0.25;
      const wR = part(geos.capeMesh, pal.ivory, 0.22, 1.52, -0.22);
      wR.rotation.z = 0.85;
      wR.rotation.y = -0.25;

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.34, 1.24, 0.06);
      const shield = new THREE.Mesh(geos.domedShield, pal.gold);
      shield.rotation.z = Math.PI / 2;
      shield.position.set(-0.08, -0.1, 0.12);
      leftArm.add(shield);
      root.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.34, 1.24, 0);
      const arm = new THREE.Mesh(geos.sculptedLimb, pal.steel);
      arm.position.y = -0.18;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6), pal.gold);
      shaft.rotation.x = Math.PI / 2.3;
      shaft.position.set(0, -0.1, 0.5);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 6), pal.iceBlue);
      tip.rotation.x = Math.PI / 2.3;
      tip.position.set(0, 0.1, 1.45);
      rightArm.add(arm, shaft, tip);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.45, 1.45);
    } else if (look.style === 'atlantean') {
      // Automaton / Golem Construct
      const leftLeg = part(geos.heavyLimb, look.trimMat, -0.2, 0.33, 0);
      const rightLeg = part(geos.heavyLimb, look.trimMat, 0.2, 0.33, 0);
      part(geos.heroCuirass, look.trimMat, 0, 1.06, 0);
      part(new THREE.OctahedronGeometry(0.22, 0), pal.crystalGlow, 0, 1.15, 0.28);
      part(new THREE.BoxGeometry(0.58, 0.26, 0.52), teamMat, 0, 0.78, 0);
      part(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 8), look.armorMat, -0.48, 1.45, 0);
      part(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 8), look.armorMat, 0.48, 1.45, 0);
      part(new THREE.CylinderGeometry(0.22, 0.26, 0.38, 6), look.trimMat, 0, 1.72, 0);
      part(new THREE.BoxGeometry(0.32, 0.09, 0.14), pal.crystalGlow, 0, 1.74, 0.18);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.5, 1.28, 0);
      const armL = new THREE.Mesh(geos.heavyLimb, look.trimMat);
      armL.position.y = -0.25;
      const bladeL = new THREE.Mesh(geos.greatSwordBlade, pal.steel);
      bladeL.rotation.x = Math.PI / 2;
      bladeL.scale.set(0.7, 0.7, 0.7);
      bladeL.position.set(0, -0.42, 0.12);
      leftArm.add(armL, bladeL);
      root.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.5, 1.28, 0);
      const armR = new THREE.Mesh(geos.heavyLimb, look.trimMat);
      armR.position.y = -0.25;
      const bladeR = new THREE.Mesh(geos.greatSwordBlade, pal.steel);
      bladeR.rotation.x = Math.PI / 2;
      bladeR.scale.set(0.7, 0.7, 0.7);
      bladeR.position.set(0, -0.42, 0.12);
      rightArm.add(armR, bladeR);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.5, 1.5);
    } else {
      // Sculpted Bull-headed Minotaur / Anubita
      const leftLeg = part(geos.heavyLimb, pal.furBrown, -0.22, 0.34, 0);
      const rightLeg = part(geos.heavyLimb, pal.furBrown, 0.22, 0.34, 0);
      part(geos.heroCuirass, pal.furBrown, 0, 1.12, 0).scale.set(1.25, 1.15, 1.25);
      part(new THREE.BoxGeometry(0.7, 0.34, 0.58), teamMat, 0, 0.78, 0);
      part(new THREE.SphereGeometry(0.28, 10, 8), look.armorMat, -0.48, 1.48, 0);
      part(new THREE.SphereGeometry(0.28, 10, 8), look.armorMat, 0.48, 1.48, 0);
      part(new THREE.BoxGeometry(0.46, 0.44, 0.56), pal.furBrown, 0, 1.78, 0.1);
      // Curved TubeGeometry horns
      const hornL = part(geos.bullHorn, pal.ivory, -0.18, 1.9, 0.14);
      hornL.scale.x = -1;
      part(geos.bullHorn, pal.ivory, 0.18, 1.9, 0.14);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.55, 1.32, 0);
      const arm = new THREE.Mesh(geos.heavyLimb, pal.furBrown);
      arm.position.y = -0.25;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.75, 6), pal.timber);
      handle.rotation.x = Math.PI / 2.5;
      handle.position.set(0, -0.38, 0.55);
      const blade = new THREE.Mesh(geos.axeBlade, pal.steel);
      blade.rotation.y = Math.PI / 2;
      blade.scale.setScalar(1.35);
      blade.position.set(0, -0.18, 1.2);
      rightArm.add(arm, handle, blade);
      root.add(rightArm);
      const leftArm = part(geos.heavyLimb, pal.furBrown, -0.55, 1.05, 0);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.55, 1.6);
    }
  } else if (kind === 'centaur') {
    if (look.style === 'egyptian') {
      // Winged Sphinx
      part(geos.horseBarrel, look.wallMat, 0, 0.88, 0).scale.set(1.2, 1.15, 1.15);
      const leftLeg = part(geos.sculptedLimb, pal.sandstoneDark, -0.24, 0.33, 0.52);
      const rightLeg = part(geos.sculptedLimb, pal.sandstoneDark, 0.24, 0.33, 0.52);
      part(geos.sculptedLimb, pal.sandstoneDark, -0.24, 0.33, -0.52);
      part(geos.sculptedLimb, pal.sandstoneDark, 0.24, 0.33, -0.52);
      part(new THREE.BoxGeometry(0.56, 0.42, 0.56), teamMat, 0, 1.05, 0.45);
      part(new THREE.SphereGeometry(0.26, 10, 8), pal.gold, 0, 1.56, 0.56);
      part(new THREE.BoxGeometry(0.64, 0.44, 0.32), look.trimMat, 0, 1.52, 0.48);
      const wL = part(geos.capeMesh, pal.gold, -0.4, 1.38, -0.05);
      wL.rotation.z = -1.0;
      const wR = part(geos.capeMesh, pal.gold, 0.4, 1.38, -0.05);
      wR.rotation.z = 1.0;

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.55, 1.5);
    } else if (look.style === 'norse') {
      // Mountain Troll
      const leftLeg = part(geos.heavyLimb, pal.stoneDark, -0.24, 0.34, 0);
      const rightLeg = part(geos.heavyLimb, pal.stoneDark, 0.24, 0.34, 0);
      part(new THREE.DodecahedronGeometry(0.64, 1), pal.stoneDark, 0, 1.18, 0);
      part(new THREE.BoxGeometry(0.76, 0.32, 0.58), teamMat, 0, 0.85, 0);
      part(new THREE.SphereGeometry(0.28, 10, 8), pal.cyclopsSkin, 0, 1.76, 0.16);
      part(new THREE.ConeGeometry(0.05, 0.22, 6), pal.ivory, -0.14, 1.72, 0.42);
      part(new THREE.ConeGeometry(0.05, 0.22, 6), pal.ivory, 0.14, 1.72, 0.42);
      const leftArm = part(geos.heavyLimb, pal.stoneDark, -0.58, 1.16, 0.08);
      const rightArm = new THREE.Group();
      rightArm.position.set(0.58, 1.38, 0.08);
      const armR = new THREE.Mesh(geos.heavyLimb, pal.stoneDark);
      armR.position.y = -0.25;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), pal.iceBlue);
      rock.position.set(0, -0.45, 0.3);
      rightArm.add(armR, rock);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.6, 1.55);
    } else {
      // Sculpted Centaur Archer
      part(geos.horseBarrel, look.mountMat, 0, 0.94, 0);
      const leftLeg = part(geos.sculptedLimb, look.mountMat, -0.21, 0.35, 0.48);
      const rightLeg = part(geos.sculptedLimb, look.mountMat, 0.21, 0.35, 0.48);
      part(geos.sculptedLimb, look.mountMat, -0.21, 0.35, -0.48);
      part(geos.sculptedLimb, look.mountMat, 0.21, 0.35, -0.48);
      part(geos.humanTorso, pal.skin, 0, 1.5, 0.36);
      part(new THREE.CylinderGeometry(0.24, 0.27, 0.26, 10), teamMat, 0, 1.32, 0.36);
      part(new THREE.SphereGeometry(0.19, 10, 8), pal.skin, 0, 2.02, 0.36);
      part(geos.corinthianHelm, pal.gold, 0, 2.08, 0.36);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.26, 1.56, 0.45);
      const bow = new THREE.Mesh(geos.compoundBow, pal.gold);
      bow.position.set(0.02, 0.04, 0.24);
      leftArm.add(bow);
      root.add(leftArm);
      const rightArm = part(geos.sculptedLimb, pal.skin, 0.28, 1.48, 0.36);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.75, 1.5);
    }
  } else if (kind === 'cyclops') {
    if (look.style === 'egyptian') {
      // Giant Emerald-Gold Scarab
      const leftLeg = part(geos.heavyLimb, pal.obsidian, -0.68, 0.32, 0.45);
      const rightLeg = part(geos.heavyLimb, pal.obsidian, 0.68, 0.32, 0.45);
      part(geos.heavyLimb, pal.obsidian, -0.68, 0.32, -0.45);
      part(geos.heavyLimb, pal.obsidian, 0.68, 0.32, -0.45);
      const shell = part(new THREE.SphereGeometry(0.95, 14, 10), pal.chitin, 0, 1.05, 0);
      shell.scale.set(1.0, 0.72, 1.3);
      part(new THREE.BoxGeometry(0.32, 0.45, 1.65), pal.gold, 0, 1.46, -0.05);
      part(new THREE.BoxGeometry(0.95, 0.34, 0.36), teamMat, 0, 1.0, 0.92);
      const horn = part(new THREE.ConeGeometry(0.16, 0.78, 8), pal.gold, 0, 1.28, 1.35);
      horn.rotation.x = Math.PI / 2.8;
      part(new THREE.SphereGeometry(0.22, 8, 8), pal.crystalGlow, 0, 1.56, 0.75);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      attachGroundMarkers(root, 1.15, pal, team);
      attachHealthBar(root, 2.75, 1.85);
    } else if (look.style === 'atlantean') {
      // Armored Behemoth
      const leftLeg = part(geos.heavyLimb, pal.obsidian, -0.58, 0.39, 0.65);
      const rightLeg = part(geos.heavyLimb, pal.obsidian, 0.58, 0.39, 0.65);
      part(geos.heavyLimb, pal.obsidian, -0.58, 0.39, -0.65);
      part(geos.heavyLimb, pal.obsidian, 0.58, 0.39, -0.65);
      part(new THREE.BoxGeometry(1.3, 0.95, 1.95), pal.obsidian, 0, 1.15, 0);
      part(new THREE.BoxGeometry(1.12, 0.32, 1.65), look.trimMat, 0, 1.72, -0.08);
      part(new THREE.BoxGeometry(1.36, 0.34, 0.65), teamMat, 0, 1.25, 0.45);
      part(new THREE.BoxGeometry(0.68, 0.6, 0.68), pal.obsidian, 0, 1.32, 1.18);
      const tL = part(new THREE.ConeGeometry(0.1, 0.65, 6), pal.ivory, -0.32, 1.38, 1.56);
      tL.rotation.x = Math.PI / 2.2;
      const tR = part(new THREE.ConeGeometry(0.1, 0.65, 6), pal.ivory, 0.32, 1.38, 1.56);
      tR.rotation.x = Math.PI / 2.2;

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      attachGroundMarkers(root, 1.15, pal, team);
      attachHealthBar(root, 2.85, 1.9);
    } else {
      // Sculpted Cyclops / Frost Giant
      const bodyMat = look.style === 'norse' ? pal.iceBlue : pal.cyclopsSkin;
      const leftLeg = part(geos.giantLimb, look.style === 'norse' ? pal.norseSlate : bodyMat, -0.28, 0.48, 0);
      const rightLeg = part(geos.giantLimb, look.style === 'norse' ? pal.norseSlate : bodyMat, 0.28, 0.48, 0);
      part(geos.heroCuirass, bodyMat, 0, 1.52, 0).scale.set(1.55, 1.45, 1.55);
      part(new THREE.BoxGeometry(0.95, 0.42, 0.76), teamMat, 0, 1.0, 0);
      part(new THREE.SphereGeometry(0.38, 12, 10), bodyMat, 0, 2.42, 0.06);
      part(new THREE.SphereGeometry(0.12, 8, 8), look.style === 'norse' ? pal.iceBlue : pal.gold, 0, 2.45, 0.38);
      const leftArm = part(geos.giantLimb, bodyMat, -0.74, 1.52, 0);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.74, 1.76, 0);
      const arm = new THREE.Mesh(geos.giantLimb, bodyMat);
      arm.position.y = -0.35;
      const club = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.11, 1.7, 8),
        look.style === 'norse' ? pal.crystalGlow : pal.timber
      );
      club.rotation.x = Math.PI / 2.3;
      club.position.set(0, -0.55, 0.65);
      rightArm.add(arm, club);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 1.15, pal, team);
      attachHealthBar(root, 3.55, 1.85);
    }
  } else if (kind === 'titan') {
    // COLOSSAL TITAN (~8.4u tall supreme mythic god-avatar)
    // Customizado especificamente para o Deus Maior selecionado!
    const godKey = (majorGod || 'zeus').toLowerCase();

    // ==============================================================
    // 1. TITÃ DE ZEUS: TITÃ TIFÃO - SENHOR DOS FURACÕES
    // ==============================================================
    if (godKey.includes('zeus')) {
      const typhonTex = getCachedTyphonTextures();
      const typhon = buildTyphonTitan(typhonTex);
      typhon.titanRoot.scale.setScalar(1.85);
      root.add(typhon.titanRoot);
      root.userData.typhon = typhon;

      // Animação procedural completa no loop do jogo (3D e 2.5D)
      let tPhase = 0;
      root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
        tPhase += dt;
        // Rotação contínua do funil ciclônico e anéis de vento
        typhon.funnelMesh.rotation.y += dt * (moving ? 4.8 : 2.4);
        typhon.cycloneRings.forEach((cr) => {
          cr.mesh.rotation.z += dt * 3.2;
          cr.mesh.position.y = cr.baseY + Math.sin(tPhase * 3.6 + cr.phase) * 0.08;
        });
        // Bater majestoso das asas gigantes de tempestade
        const wingFlap = Math.sin(tPhase * (moving ? 3.6 : 1.8)) * 0.24;
        if (typhon.wings.L) typhon.wings.L.wingRoot.rotation.y = -wingFlap;
        if (typhon.wings.R) typhon.wings.R.wingRoot.rotation.y = wingFlap;
        // Serpentes dracônicas da cintura
        typhon.waistSerpents.forEach((ws) => {
          ws.root.rotation.z = Math.sin(tPhase * 2.8 + ws.side) * 0.16;
        });
        // Animação de ataque ou golpe dos braços
        if (attackT !== null) {
          typhon.rightArm.arm.rotation.x = -Math.sin(attackT * Math.PI) * 1.25;
          typhon.leftArm.arm.rotation.x = -Math.sin(attackT * Math.PI) * 0.85;
        } else {
          typhon.rightArm.arm.rotation.x *= 0.88;
          typhon.leftArm.arm.rotation.x *= 0.88;
        }
      };

      root.userData.setMode = (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
        // Suporte a modos 3D e 2.5D
      };
      root.userData.updateBrg = (dt: number, state: string) => {
        root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
      };

      attachGroundMarkers(root, 2.2, pal, team);
      attachHealthBar(root, 8.2, 2.8);
      return root;
    }

    // ==============================================================
    // 2. TITÃ DE POSEIDON: TITÃ CARÍBDIS - COLOSSO DAS PROFUNDEZAS
    // ==============================================================
    if (godKey.includes('poseidon')) {
      const caribTex = getCachedCaribdisTextures();
      const caribdis = buildCharybdisTitan(caribTex);
      caribdis.root.scale.setScalar(1.85);
      root.add(caribdis.root);
      root.userData.caribdis = caribdis;

      // Animação procedural completa no loop do jogo (3D e 2.5D)
      let cPhase = 0;
      root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
        cPhase += dt;
        // Rotação do redemoinho devorador sob Caríbdis
        caribdis.whirlpoolGroup.rotation.y += dt * (moving ? 4.2 : 2.0);
        caribdis.whirlRings.forEach((wr) => {
          wr.mesh.rotation.z += dt * 2.8;
          wr.mesh.position.y = wr.baseY + Math.sin(cPhase * 3.2 + wr.phase) * 0.07;
        });
        // Ondulação dos 4 tentáculos dorsais colossais
        caribdis.backTentacles.forEach((bt) => {
          bt.segs.forEach((seg, sIdx) => {
            seg.pivot.rotation.x = Math.sin(cPhase * 2.4 + seg.phase) * (0.08 + sIdx * 0.04);
            seg.pivot.rotation.z = Math.cos(cPhase * 2.0 + seg.phase) * (0.06 + sIdx * 0.03);
          });
        });
        // Animação de ataque da garra-pinça e mandíbula
        if (attackT !== null) {
          const clawStrike = Math.sin(attackT * Math.PI);
          caribdis.armL.rotation.x = -clawStrike * 1.15;
          caribdis.clawUpper.rotation.z = 0.28 + clawStrike * 0.45;
          caribdis.clawLower.rotation.z = -0.28 - clawStrike * 0.45;
          caribdis.jawPivot.rotation.x = clawStrike * 0.38;
        } else {
          caribdis.armL.rotation.x *= 0.88;
          caribdis.clawUpper.rotation.z = 0.28;
          caribdis.clawLower.rotation.z = -0.28;
          caribdis.jawPivot.rotation.x *= 0.88;
        }
      };

      root.userData.setMode = (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
        // Suporte a modos 3D e 2.5D
      };
      root.userData.updateBrg = (dt: number, state: string) => {
        root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
      };

      attachGroundMarkers(root, 2.2, pal, team);
      attachHealthBar(root, 8.2, 2.8);
      return root;
    }

    // ==============================================================
    // 3. TITÃ DE HADES: TITÃ CÉRBERO - GUARDIÃO DO SUBMUNDO
    // ==============================================================
    if (godKey.includes('hades')) {
      const cerbTex = getCachedCerberusTextures();
      const cerberus = buildCerberusTitan(cerbTex);
      cerberus.titanRoot.scale.setScalar(1.85);
      root.add(cerberus.titanRoot);
      root.userData.cerberus = cerberus;

      // Animação procedural completa no loop do jogo (3D e 2.5D)
      let cerbPhase = 0;
      root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
        cerbPhase += dt;
        const breath = Math.sin(cerbPhase * 2.2) * 0.025;
        cerberus.body.position.y = 1.32 + breath;

        // Pulso vivo das veias de magma e energia de alma
        cerberus.veinMatHell.emissiveIntensity = 2.8 + Math.sin(cerbPhase * 5.0) * 0.8;
        cerberus.veinMatSoul.emissiveIntensity = 2.4 + Math.cos(cerbPhase * 4.5) * 0.7;

        // Movimento independente das três cabeças infernais de cão
        const jawOpen = attackT !== null ? 0.38 : 0.08;
        cerberus.neckCenter.rotation.y = Math.sin(cerbPhase * 1.1) * 0.14;
        cerberus.headCenterObj.jawPivot.rotation.x = jawOpen + Math.max(0, Math.sin(cerbPhase * 3.4)) * 0.18;

        cerberus.neckLeft.rotation.y = 0.34 + Math.cos(cerbPhase * 1.4) * 0.16;
        cerberus.headLeftObj.jawPivot.rotation.x = jawOpen + Math.max(0, Math.cos(cerbPhase * 3.8)) * 0.18;

        cerberus.neckRight.rotation.y = -0.34 + Math.sin(cerbPhase * 1.3 + 1.5) * 0.16;
        cerberus.headRightObj.jawPivot.rotation.x = jawOpen + Math.max(0, Math.sin(cerbPhase * 3.6 + 1.2)) * 0.18;

        // Ondulação da cauda de serpente
        const tailSpeed = moving ? 5.2 : 3.0;
        for (const ts of cerberus.tailSegments) {
          ts.pivot.rotation.y = Math.sin(cerbPhase * tailSpeed - ts.phase) * 0.26;
        }

        // Passos pesados das pernas titânicas ao se mover
        if (moving) {
          const stride = cerbPhase * speed * 2.8;
          const sinS = Math.sin(stride);
          const cosS = Math.cos(stride);
          cerberus.legs.L.hip.rotation.x = -0.18 + sinS * 0.42;
          cerberus.legs.L.knee.rotation.x = 0.24 + Math.max(0, -cosS) * 0.45;
          cerberus.legs.R.hip.rotation.x = -0.18 - sinS * 0.42;
          cerberus.legs.R.knee.rotation.x = 0.24 + Math.max(0, cosS) * 0.45;

          cerberus.rightArm.arm.rotation.x = -0.26 - sinS * 0.35;
          cerberus.leftArm.arm.rotation.x = -0.26 + sinS * 0.35;
        } else {
          cerberus.legs.L.hip.rotation.x *= 0.9;
          cerberus.legs.R.hip.rotation.x *= 0.9;
          cerberus.rightArm.arm.rotation.x *= 0.9;
          cerberus.leftArm.arm.rotation.x *= 0.9;
        }

        // Ataque com garras e mandíbulas
        if (attackT !== null) {
          const strike = Math.sin(attackT * Math.PI);
          cerberus.rightArm.arm.rotation.x = -strike * 1.2;
          cerberus.leftArm.arm.rotation.x = -strike * 0.8;
        }
      };

      root.userData.setMode = (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
        // Suporte a modos 3D e 2.5D
      };
      root.userData.updateBrg = (dt: number, state: string) => {
        root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
      };

      attachGroundMarkers(root, 2.2, pal, team);
      attachHealthBar(root, 8.2, 2.8);
      return root;
    }

    // ==============================================================
    // 4. TITÃS HUMANÓIDES (DEMAIS PANTEÕES)
    // ==============================================================
    const leftLeg = part(geos.giantLimb, look.titanBodyMat, -0.75, 1.55, 0);
    leftLeg.scale.set(2.4, 2.6, 2.4);
    const rightLeg = part(geos.giantLimb, look.titanBodyMat, 0.75, 1.55, 0);
    rightLeg.scale.set(2.4, 2.6, 2.4);

    // Massive armored greaves and colossal feet
    part(new THREE.BoxGeometry(0.85, 0.5, 1.15), look.trimMat, -0.75, 0.25, 0.1);
    part(new THREE.BoxGeometry(0.85, 0.5, 1.15), look.trimMat, 0.75, 0.25, 0.1);

    // Torso e Núcleo Sagrado
    const torso = part(geos.heroCuirass, look.titanBodyMat, 0, 4.4, 0);
    torso.scale.set(4.2, 4.0, 3.8);
    const core = part(new THREE.OctahedronGeometry(0.82, 1), look.titanCoreMat, 0, 4.75, 1.05);
    root.userData.beaconCrystal = core;
    part(new THREE.CylinderGeometry(1.35, 1.6, 0.95, 12), teamMat, 0, 2.85, 0);

    // Ombreiras Colossais
    part(new THREE.DodecahedronGeometry(0.95, 0), look.trimMat, -2.0, 5.75, 0);
    part(new THREE.DodecahedronGeometry(0.95, 0), look.trimMat, 2.0, 5.75, 0);

    // Cabeça do Titã
    part(new THREE.SphereGeometry(0.82, 16, 12), look.titanBodyMat, 0, 6.85, 0.08);
    part(new THREE.BoxGeometry(0.82, 0.24, 0.44), look.titanCoreMat, 0, 6.9, 0.72);

    const leftArm = part(geos.giantLimb, look.titanBodyMat, -2.15, 4.5, 0);
    leftArm.scale.set(2.4, 2.5, 2.4);

    const rightArm = new THREE.Group();
    rightArm.position.set(2.15, 5.3, 0);
    const arm = new THREE.Mesh(geos.giantLimb, look.titanBodyMat);
    arm.scale.set(2.4, 2.5, 2.4);
    arm.position.y = -0.95;
    rightArm.add(arm);

    if (godKey.includes('rá') || godKey.includes('ra')) {
      // TITÃ DE RÁ: Avatar Solar de Hórus-Rá
      // Grande disco solar flamejante sobre a cabeça
      const sunDisc = part(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 24), pal.gold, 0, 8.45, 0);
      sunDisc.rotation.x = Math.PI / 2;
      // Asas solares douradas nas costas
      const wingL = part(new THREE.BoxGeometry(2.8, 4.6, 0.12), pal.goldOre, -1.9, 4.6, -0.9);
      wingL.rotation.y = -0.35;
      const wingR = part(new THREE.BoxGeometry(2.8, 4.6, 0.12), pal.goldOre, 1.9, 4.6, -0.9);
      wingR.rotation.y = 0.35;
      // Cetro solar Ankh de ouro puro
      const ankh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.5, 12), pal.gold);
      ankh.rotation.x = Math.PI / 2.2;
      ankh.position.set(0, -1.2, 0.5);
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 8, 20), pal.gold);
      loop.position.set(0, 3.1, 0);
      ankh.add(loop);
      rightArm.add(ankh);
    } else if (godKey.includes('ísis') || godKey.includes('isis')) {
      // TITÃ DE ÍSIS: Guardiã Alada do Nilo
      // Asas de turquesa e marfim majestosas
      const wingL = part(new THREE.BoxGeometry(3.2, 5.2, 0.12), pal.turquoise, -2.1, 4.8, -0.95);
      wingL.rotation.y = -0.45;
      const wingR = part(new THREE.BoxGeometry(3.2, 5.2, 0.12), pal.turquoise, 2.1, 4.8, -0.95);
      wingR.rotation.y = 0.45;
      // Coroa hathórica com disco lunar/solar
      const hathorDisc = part(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 20), pal.crystalGlow, 0, 8.25, 0);
      hathorDisc.rotation.x = Math.PI / 2;
      // Báculo sagrado de lótus
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 5.4, 12), pal.ivory);
      staff.rotation.x = Math.PI / 2.2;
      staff.position.set(0, -1.2, 0.5);
      const lotus = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 1), pal.crystalGlow);
      lotus.position.set(0, 3.0, 0);
      staff.add(lotus);
      rightArm.add(staff);
    } else if (godKey.includes('set')) {
      // TITÃ DE SET: Besta Titânica do Caos
      // Orelhas retas da Besta do Caos e focinho angular
      part(new THREE.BoxGeometry(0.22, 1.25, 0.35), pal.sandstoneDark, -0.55, 7.7, 0);
      part(new THREE.BoxGeometry(0.22, 1.25, 0.35), pal.sandstoneDark, 0.55, 7.7, 0);
      part(new THREE.BoxGeometry(0.65, 0.45, 0.95), pal.sandstoneDark, 0, 6.75, 0.75);
      // Foice Khopesh colossal de basalto rubro
      const khopesh = new THREE.Mesh(geos.greatSwordBlade, pal.ember);
      khopesh.rotation.x = Math.PI / 2.2;
      khopesh.scale.set(4.6, 4.8, 4.6);
      khopesh.position.set(0, -1.5, 0.5);
      rightArm.add(khopesh);
    } else if (godKey.includes('odin')) {
      // TITÃ DE ODIN: Gigante de Gelo Ymir
      // Barba de gelo esculpida no queixo
      part(new THREE.ConeGeometry(0.48, 1.5, 6), pal.iceBlue, 0, 5.85, 0.65);
      // Manto com asas de corvo de ardósia
      part(new THREE.BoxGeometry(3.0, 4.4, 0.16), pal.norseSlate, 0, 3.8, -0.95);
      // Lança colossal rúnica Gungnir de gelo
      const gungnir = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 6.2, 12), pal.norseTimber);
      gungnir.rotation.x = Math.PI / 2.2;
      gungnir.position.set(0, -1.2, 0.5);
      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.8, 6), pal.iceBlue);
      spearTip.position.set(0, 3.5, 0);
      gungnir.add(spearTip);
      rightArm.add(gungnir);
    } else if (godKey.includes('thor')) {
      // TITÃ DE THOR: Gigante do Trovão Mjölnir
      // Chifres pesados de ferro forjado
      const hL = part(geos.bullHorn, pal.bronze, -0.62, 7.4, 0);
      hL.scale.set(-2.4, 2.4, 2.4);
      const hR = part(geos.bullHorn, pal.bronze, 0.62, 7.4, 0);
      hR.scale.set(2.4, 2.4, 2.4);
      // Martelo de Guerra Monumental Mjölnir
      const hammerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 4.8, 12), pal.norseTimber);
      hammerHandle.rotation.x = Math.PI / 2.2;
      hammerHandle.position.set(0, -1.0, 0.5);
      const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.15, 1.25), pal.steel);
      hammerHead.position.set(0, 2.4, 0);
      hammerHandle.add(hammerHead);
      rightArm.add(hammerHandle);
    } else if (godKey.includes('loki')) {
      // TITÃ DE LOKI: Gigante de Fogo Surtr
      // Chifres de fogo retorcidos
      const hL = part(new THREE.ConeGeometry(0.32, 1.6, 6), pal.ember, -0.7, 7.6, 0);
      hL.rotation.z = -0.55;
      const hR = part(new THREE.ConeGeometry(0.32, 1.6, 6), pal.ember, 0.7, 7.6, 0);
      hR.rotation.z = 0.55;
      // Espada monumental de magma flamejante
      const fireBlade = new THREE.Mesh(geos.greatSwordBlade, pal.ember);
      fireBlade.rotation.x = Math.PI / 2.2;
      fireBlade.scale.set(4.8, 5.2, 4.8);
      fireBlade.position.set(0, -1.6, 0.5);
      rightArm.add(fireBlade);
    } else if (godKey.includes('cronos') || godKey.includes('kronos')) {
      // TITÃ DE CRONOS: Titã Primordial do Tempo
      // Anéis de oricalco flutuantes orbitando o núcleo do peito
      part(new THREE.TorusGeometry(1.2, 0.08, 8, 24), pal.orichalcum, 0, 4.75, 1.05);
      const ring2 = part(new THREE.TorusGeometry(1.5, 0.07, 8, 24), pal.crystalGlow, 0, 4.75, 1.05);
      ring2.rotation.x = Math.PI / 3;
      // Foice colossal do tempo
      const scytheHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.8, 12), pal.obsidian);
      scytheHandle.rotation.x = Math.PI / 2.2;
      scytheHandle.position.set(0, -1.2, 0.5);
      const blade = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.15, 8, 16, Math.PI * 0.75), pal.orichalcum);
      blade.position.set(0.7, 2.9, 0);
      blade.rotation.z = Math.PI / 4;
      scytheHandle.add(blade);
      rightArm.add(scytheHandle);
    } else if (godKey.includes('urano') || godKey.includes('ouranos')) {
      // TITÃ DE URANO: Titã do Vórtice Celeste
      // Anéis de plasma celeste pulsante no peito
      part(new THREE.TorusGeometry(1.35, 0.12, 12, 32), pal.crystalGlow, 0, 4.75, 1.05);
      // Lâmina translúcida de vento estelar
      const plasmaSword = new THREE.Mesh(geos.greatSwordBlade, pal.crystalGlow);
      plasmaSword.rotation.x = Math.PI / 2.2;
      plasmaSword.scale.set(4.6, 5.0, 4.6);
      plasmaSword.position.set(0, -1.5, 0.5);
      rightArm.add(plasmaSword);
    } else if (godKey.includes('gaia')) {
      // TITÃ DE GAIA: Titã Florestal da Mãe Terra
      // Ramos e folhagens brotando nos ombros
      part(new THREE.SphereGeometry(0.95, 10, 8), pal.jade, -2.1, 6.4, 0);
      part(new THREE.SphereGeometry(0.95, 10, 8), pal.jade, 2.1, 6.4, 0);
      part(new THREE.CylinderGeometry(0.3, 0.45, 1.8, 8), pal.timber, -2.1, 5.8, -0.6);
      part(new THREE.CylinderGeometry(0.3, 0.45, 1.8, 8), pal.timber, 2.1, 5.8, -0.6);
      // Clava colossal de madeira viva e rocha
      const club = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.22, 5.2, 10), pal.timber);
      club.rotation.x = Math.PI / 2.2;
      club.position.set(0, -1.2, 0.5);
      const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), pal.stoneDark);
      boulder.position.set(0, 2.6, 0);
      club.add(boulder);
      rightArm.add(club);
    } else {
      // Fallback padrão
      const titanicBlade = new THREE.Mesh(geos.greatSwordBlade, look.titanCoreMat);
      titanicBlade.rotation.x = Math.PI / 2.2;
      titanicBlade.scale.set(4.4, 4.6, 4.4);
      titanicBlade.position.set(0, -1.55, 0.5);
      rightArm.add(titanicBlade);
    }

    root.add(rightArm);
    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 2.2, pal, team);
    attachHealthBar(root, 8.85, 2.8);
  } else if ((kind as any) === 'artemis') {
    const artemisTex = getCachedArtemisTextures();
    const artemis = buildArtemis(artemisTex);
    artemis.root.scale.setScalar(1.25);
    root.add(artemis.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'raizes' : moving ? 'cacada' : 'vigilia';
      animateArtemis(artemis, dt, aPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  } else if ((kind as any) === 'hefesto') {
    const hefTex = getCachedHephaestusTextures();
    const hef = buildHephaestus(hefTex);
    hef.root.scale.setScalar(1.25);
    root.add(hef.root);
    let hPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      hPhase += dt;
      const mode = attackT !== null ? 'martelo' : moving ? 'automato' : 'forja';
      animateHephaestus(hef, dt, hPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  } else if ((kind as any) === 'dionisio') {
    const dioTex = getCachedDionysusTextures();
    const dio = buildDionysus(dioTex);
    dio.root.scale.setScalar(1.25);
    root.add(dio.root);
    let dPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      dPhase += dt;
      const mode = attackT !== null ? 'vinhas' : moving ? 'danca' : 'banquete';
      animateDionysus(dio, dt, dPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  } else if ((kind as any) === 'afrodite') {
    const afroTex = getCachedAphroditeTextures();
    const afro = buildAphrodite(afroTex);
    afro.root.scale.setScalar(1.25);
    root.add(afro.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'encanto' : moving ? 'danca' : 'graca';
      animateAphrodite(afro, dt, aPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  } else if ((kind as any) === 'apolo') {
    const apoTex = getCachedApolloTextures();
    const apo = buildApollo(apoTex);
    apo.root.scale.setScalar(1.25);
    root.add(apo.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'flecha' : moving ? 'voo' : 'pairar';
      animateApollo(apo, dt, aPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  } else if ((kind as any) === 'ares') {
    const aresTex = getCachedAresTextures();
    const ares = buildAres(aresTex);
    ares.root.scale.setScalar(1.25);
    root.add(ares.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.6 ? 'sismico' : 'furia') : moving ? 'investida' : 'postura';
      animateAres(ares, dt, aPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  } else if ((kind as any) === 'atena') {
    const atenaTex = getCachedAtenaTextures();
    const atena = buildAthena(atenaTex);
    atena.root.scale.setScalar(1.25);
    root.add(atena.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'furia' : 'avanco') : moving ? 'egide' : 'guardia';
      animateAthena(atena, dt, aPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  } else if ((kind as any) === 'hermes') {
    const hermesTex = getCachedHermesTextures();
    const hermes = buildHermes(hermesTex);
    hermes.root.scale.setScalar(1.25);
    root.add(hermes.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'relampago' : 'rajada') : moving ? 'velocidade' : 'flutuar';
      animateHermes(hermes, dt, aPhase, mode);
    };
    attachGroundMarkers(root, 1.25, pal, team);
    attachHealthBar(root, 3.4, 1.6);
    return root;
  }

  return root;
}

export function createResourceMesh(
  kind: ResourceNodeKind,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();

  const add = (m: THREE.Mesh, x: number, y: number, z: number) => {
    m.position.set(x, y, z);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    root.add(m);
    return m;
  };

  if (kind === 'tree') {
    const oakGroup = createAoMOakTreeMesh(pal, enableShadows);
    root.add(oakGroup);
    root.userData.oakCanopyGroup = oakGroup.userData.oakCanopyGroup;
    root.userData.oakVariant = oakGroup.userData.oakVariant;
    attachGroundMarkers(root, 0.98, pal, 'neutral');
    attachHealthBar(root, 5.9, 1.75);
  } else if (kind === 'berry') {
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 1), pal.foliagePine), 0, 0.48, 0);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), pal.foliageDark), 0.48, 0.4, 0.22);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.52, 1), pal.foliagePine), -0.42, 0.38, -0.18);
    const berryGeo = new THREE.SphereGeometry(0.1, 6, 6);
    for (const [bx, by, bz] of [
      [0.22, 0.85, 0.48],
      [-0.3, 0.72, 0.42],
      [0.58, 0.58, 0.35],
      [-0.08, 0.92, -0.3],
      [0.12, 0.62, -0.5],
    ]) {
      add(new THREE.Mesh(berryGeo, pal.berryRed), bx, by, bz);
    }
    attachGroundMarkers(root, 0.95, pal, 'neutral');
    attachHealthBar(root, 1.55, 1.35);
  } else {
    // Gold Mine (3.8 x 3.8 rocky outcropping with golden crystalline veins)
    const rockBase = add(new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), pal.obsidian), 0, 0.55, 0);
    rockBase.scale.set(1.25, 0.62, 1.15);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), pal.stoneDark), -0.95, 0.38, 0.55);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.82, 0), pal.stoneDark), 0.92, 0.35, -0.45);

    const mainLode = add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.92, 0), pal.goldOre), 0.15, 1.05, 0.08);
    mainLode.scale.set(1.1, 1.25, 0.95);
    add(new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), pal.gold), -0.52, 0.96, 0.35);
    add(new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 0), pal.goldOre), 0.68, 0.88, 0.52);
    add(new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), pal.gold), 0.35, 1.22, -0.42);
    const spire = add(new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.15, 5), pal.goldOre), -0.15, 1.48, -0.1);
    spire.rotation.z = 0.22;
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), pal.gold), -0.82, 0.28, -0.78);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 0), pal.goldOre), 0.95, 0.26, 0.72);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), pal.gold), -0.15, 0.24, 1.22);
    attachGroundMarkers(root, 1.9, pal, 'neutral');
    attachHealthBar(root, 2.45, 2.0);
  }

  return root;
}

export function createSettlementMesh(
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();
  const add = (m: THREE.Mesh, x: number, y: number, z: number) => {
    m.position.set(x, y, z);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    root.add(m);
    return m;
  };

  add(new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.34, 12), pal.stoneDark), 0, 0.17, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.1, 0.22, 12), pal.marble), 0, 0.44, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.55, 0.18, 12), pal.bronze), 0, 0.56, 0);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.3;
    const px = Math.cos(ang) * 2.65;
    const pz = Math.sin(ang) * 2.65;
    const h = i % 2 === 0 ? 1.55 : 0.95;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, h, 8), pal.marble), px, 0.55 + h * 0.5, pz);
    if (i % 2 === 0) {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.56), pal.bronze), px, 0.55 + h + 0.08, pz);
    }
  }

  add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.55, 8), pal.stoneDark), 0, 0.85, 0);
  const beacon = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), pal.goldOre), 0, 1.65, 0);
  root.userData.beaconCrystal = beacon;

  attachGroundMarkers(root, 3.8, pal, 'neutral');
  return root;
}

export function createRelicMesh(
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptedGeos();
  const add = (m: THREE.Mesh, x: number, y: number, z: number) => {
    m.position.set(x, y, z);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    root.add(m);
    return m;
  };

  add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.92, 0.24, 8), pal.stoneDark), 0, 0.12, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 0.35, 8), pal.marble), 0, 0.4, 0);
  const chalice = add(new THREE.Mesh(geos.chaliceCup, pal.goldOre), 0, 0.95, 0);
  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), pal.crystalGlow);
  orb.position.set(0, 0.84, 0);
  chalice.add(orb);
  root.userData.beaconCrystal = chalice;

  attachGroundMarkers(root, 0.65, pal, 'neutral');
  return root;
}

export function createFaunaMesh(
  kind: FaunaKind,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);
  root.userData.bodyGroup = bodyGroup;

  const coatMat = getFaunaCoatMaterial(kind);

  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (enableShadows) m.castShadow = true;
    bodyGroup.add(m);
    return m;
  };

  if (kind === 'gazelle' || kind === 'deer') {
    const scale = kind === 'deer' ? 1.08 : 0.88;
    const leftLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, -0.14, 0.26 * scale, 0.32);
    const rightLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, 0.14, 0.26 * scale, 0.32);
    const backLeftLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, -0.14, 0.26 * scale, -0.32);
    const backRightLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, 0.14, 0.26 * scale, -0.32);
    part(new THREE.BoxGeometry(0.36 * scale, 0.36 * scale, 0.92 * scale), coatMat, 0, 0.68 * scale, 0);
    part(new THREE.BoxGeometry(0.3 * scale, 0.14 * scale, 0.68 * scale), pal.ivory, 0, 0.54 * scale, 0);
    const neck = part(new THREE.BoxGeometry(0.16, 0.46 * scale, 0.18), coatMat, 0, 0.98 * scale, 0.4);
    neck.rotation.x = 0.32;
    part(new THREE.BoxGeometry(0.18, 0.2, 0.34), coatMat, 0, 1.2 * scale, 0.56);
    const hornMat = kind === 'deer' ? pal.ivory : pal.stoneDark;
    const hL = part(new THREE.ConeGeometry(0.038, kind === 'deer' ? 0.46 : 0.34, 5), hornMat, -0.1, 1.44 * scale, 0.48);
    hL.rotation.z = 0.32;
    hL.rotation.x = -0.35;
    const hR = part(new THREE.ConeGeometry(0.038, kind === 'deer' ? 0.46 : 0.34, 5), hornMat, 0.1, 1.44 * scale, 0.48);
    hR.rotation.z = -0.32;
    hR.rotation.x = -0.35;
    part(new THREE.BoxGeometry(0.09, 0.11, 0.15), pal.ivory, 0, 0.76 * scale, -0.5);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, kind === 'deer' ? 0.50 : 0.45, pal, 'neutral');
    attachHealthBar(root, kind === 'deer' ? 1.85 : 1.5, 1.05, true);
  } else if (kind === 'boar') {
    const leftLeg = part(new THREE.BoxGeometry(0.13, 0.32, 0.13), coatMat, -0.18, 0.16, 0.3);
    const rightLeg = part(new THREE.BoxGeometry(0.13, 0.32, 0.13), coatMat, 0.18, 0.16, 0.3);
    const backLeftLeg = part(new THREE.BoxGeometry(0.13, 0.32, 0.13), coatMat, -0.18, 0.16, -0.3);
    const backRightLeg = part(new THREE.BoxGeometry(0.13, 0.32, 0.13), coatMat, 0.18, 0.16, -0.3);
    part(new THREE.BoxGeometry(0.52, 0.46, 0.92), coatMat, 0, 0.52, 0);
    part(new THREE.BoxGeometry(0.12, 0.16, 0.72), pal.obsidian, 0, 0.8, 0);
    part(new THREE.BoxGeometry(0.38, 0.36, 0.42), coatMat, 0, 0.52, 0.58);
    part(new THREE.BoxGeometry(0.22, 0.16, 0.16), pal.skin, 0, 0.44, 0.82);
    const tL = part(new THREE.ConeGeometry(0.04, 0.22, 5), pal.ivory, -0.14, 0.46, 0.82);
    tL.rotation.x = Math.PI / 3;
    tL.rotation.z = 0.25;
    const tR = part(new THREE.ConeGeometry(0.04, 0.22, 5), pal.ivory, 0.14, 0.46, 0.82);
    tR.rotation.x = Math.PI / 3;
    tR.rotation.z = -0.25;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.55, pal, 'neutral');
    attachHealthBar(root, 1.35, 1.1, true);
  } else if (kind === 'aurochs') {
    const leftLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, -0.26, 0.26, 0.46);
    const rightLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, 0.26, 0.26, 0.46);
    const backLeftLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, -0.26, 0.26, -0.46);
    const backRightLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, 0.26, 0.26, -0.46);
    part(new THREE.BoxGeometry(0.72, 0.65, 1.32), coatMat, 0, 0.82, 0);
    part(new THREE.BoxGeometry(0.64, 0.26, 0.62), pal.furBrown, 0, 1.18, 0.26);
    part(new THREE.BoxGeometry(0.46, 0.44, 0.46), coatMat, 0, 0.92, 0.8);
    const hL = part(new THREE.ConeGeometry(0.06, 0.42, 6), pal.ivory, -0.3, 1.15, 0.84);
    hL.rotation.z = 1.05;
    hL.rotation.x = 0.25;
    const hR = part(new THREE.ConeGeometry(0.06, 0.42, 6), pal.ivory, 0.3, 1.15, 0.84);
    hR.rotation.z = -1.05;
    hR.rotation.x = 0.25;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.72, pal, 'neutral');
    attachHealthBar(root, 1.95, 1.35, true);
  } else {
    // Wolf
    const leftLeg = part(new THREE.BoxGeometry(0.1, 0.38, 0.1), coatMat, -0.13, 0.19, 0.32);
    const rightLeg = part(new THREE.BoxGeometry(0.1, 0.38, 0.1), coatMat, 0.13, 0.19, 0.32);
    const backLeftLeg = part(new THREE.BoxGeometry(0.1, 0.38, 0.1), coatMat, -0.13, 0.19, -0.32);
    const backRightLeg = part(new THREE.BoxGeometry(0.1, 0.38, 0.1), coatMat, 0.13, 0.19, -0.32);
    part(new THREE.BoxGeometry(0.34, 0.34, 0.88), coatMat, 0, 0.54, 0);
    part(new THREE.BoxGeometry(0.26, 0.26, 0.36), coatMat, 0, 0.68, 0.54);
    part(new THREE.BoxGeometry(0.15, 0.13, 0.22), pal.stoneDark, 0, 0.62, 0.78);
    part(new THREE.ConeGeometry(0.055, 0.15, 4), coatMat, -0.09, 0.88, 0.48);
    part(new THREE.ConeGeometry(0.055, 0.15, 4), coatMat, 0.09, 0.88, 0.48);
    const tail = part(new THREE.BoxGeometry(0.11, 0.11, 0.45), pal.stoneDark, 0, 0.56, -0.58);
    tail.rotation.x = -0.45;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.45, pal, 'neutral');
    attachHealthBar(root, 1.35, 1.0, true);
  }

  return root;
}

export type OrderMarkerKind = 'flag' | 'sword' | 'wood' | 'gold' | 'food' | 'build';

export function createOrderMarkerMesh(kind: OrderMarkerKind, pal: MaterialPalette): THREE.Group {
  const root = new THREE.Group();

  if (kind === 'flag') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.14, 12), pal.stoneDark);
    base.position.y = 0.07;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.5, 8), pal.gold);
    pole.position.y = 1.25;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), pal.gold);
    finial.position.y = 2.55;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.62, 0.07), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    cloth.position.set(0.56, 2.08, 0);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.085), pal.tunicPlayer);
    stripe.position.set(0.56, 2.08, 0);
    root.add(base, pole, finial, cloth, stripe);
  } else if (kind === 'sword') {
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.82, 20), glowMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    const swordGroup = new THREE.Group();
    swordGroup.position.y = 1.35;
    swordGroup.rotation.z = Math.PI / 10;

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.35, 0.06), pal.steel);
    blade.position.y = 0.28;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 4), pal.steel);
    tip.rotation.y = Math.PI / 4;
    tip.position.y = 1.12;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.14), pal.gold);
    guard.position.y = -0.36;
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.38, 8), pal.timber);
    grip.position.y = -0.6;
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), glowMat);
    pommel.position.y = -0.82;
    swordGroup.add(blade, tip, guard, grip, pommel);
    root.add(ring, swordGroup);
    root.userData.spinTarget = swordGroup;
  } else if (kind === 'wood') {
    const group = new THREE.Group();
    group.position.y = 1.15;
    group.rotation.z = -Math.PI / 8;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.45, 8), pal.timber);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.38, 0.12), pal.steel);
    head.position.set(0.24, 0.45, 0);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.06), new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
    edge.position.set(0.52, 0.45, 0);
    group.add(handle, head, edge);
    root.add(group);
    root.userData.spinTarget = group;
  } else if (kind === 'gold') {
    const group = new THREE.Group();
    group.position.y = 1.15;
    group.rotation.z = -Math.PI / 10;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 1.45, 8), pal.timber);
    const pickLeft = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.62, 6), pal.gold);
    pickLeft.rotation.z = Math.PI / 2.2;
    pickLeft.position.set(-0.28, 0.56, 0);
    const pickRight = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.62, 6), pal.gold);
    pickRight.rotation.z = -Math.PI / 2.2;
    pickRight.position.set(0.28, 0.56, 0);
    const hub = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.18), pal.steel);
    hub.position.y = 0.58;
    group.add(handle, pickLeft, pickRight, hub);
    root.add(group);
    root.userData.spinTarget = group;
  } else if (kind === 'food') {
    const group = new THREE.Group();
    group.position.y = 1.05;
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 0.48, 10), pal.bronze);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 12), pal.timber);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.24;
    const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), pal.berryRed);
    b1.position.set(-0.14, 0.34, 0.08);
    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), pal.berryRed);
    b2.position.set(0.14, 0.36, -0.05);
    const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    b3.position.set(0, 0.44, 0.12);
    group.add(basket, rim, b1, b2, b3);
    root.add(group);
    root.userData.spinTarget = group;
  } else {
    const group = new THREE.Group();
    group.position.y = 1.15;
    group.rotation.z = Math.PI / 9;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 1.4, 8), pal.timber);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.32, 0.32), pal.bronze);
    head.position.set(0, 0.54, 0);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.34), pal.gold);
    band.position.set(0, 0.54, 0);
    group.add(handle, head, band);
    root.add(group);
    root.userData.spinTarget = group;
  }

  return root;
}
