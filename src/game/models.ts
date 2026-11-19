import * as THREE from 'three';
import { AgeLevel, BuildingKind, FaunaKind, MapId, PANTHEONS, PantheonId, ResourceNodeKind, TeamId, UnitKind, WorldSizeId } from './types';
import { createGreekUnitMesh } from '../civilizacao/gregos/gregosModels';
import { createZeusMilitaryUnitMesh, ZeusMilitaryUnitKind } from '../civilizacao/gregos/zeusMilitaryModels';
import { createZeusMythOrHeroMesh, ZeusMythOrHeroKind } from '../civilizacao/gregos/zeusMythAndHeroModels';
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
import { buildZeus, getCachedZeusTextures, animateZeus } from '../civilizacao/gregos/zeusModel';
import { buildPoseidon, getCachedPoseidonTextures, animatePoseidon } from '../civilizacao/gregos/poseidonModel';
import { buildHades, getCachedHadesTextures, animateHades } from '../civilizacao/gregos/hadesModel';
import { buildIsis, getCachedIsisTextures, animateIsis } from '../civilizacao/egipcios/isisModel';
import { buildSet, getCachedSetTextures, animateSet } from '../civilizacao/egipcios/setModel';
import { buildRa, getCachedRaTextures, animateRa } from '../civilizacao/egipcios/raModel';
import { createEgyptianUnitMesh, getEgyptianUnitMarkerSpec } from '../civilizacao/egipcios/egipciosModels';
import { createNorseUnitMesh, getNorseUnitMarkerSpec } from '../civilizacao/nordicos/nordicosModels';
import { createAtlanteanUnitMesh, getAtlanteanUnitMarkerSpec } from '../civilizacao/atlantes/atlantesModels';
import { createNorseBuildingMesh } from '../civilizacao/nordicos/norseBuildingModels';
import { createEgyptianBuildingMesh } from '../civilizacao/egipcios/egyptianBuildingModels';
import { createGreekBuildingMesh } from '../civilizacao/gregos/greekBuildingModels';
import { createAtlanteanBuildingMesh } from '../civilizacao/atlantes/atlanteanBuildingModels';
import {
  createChineseBuildingMesh,
  createChineseDragonTitanMesh,
  createChineseUnitMesh,
  getChineseUnitMarkerSpec,
} from '../civilizacao/chineses/chineseModels';
import { createExpandedBuildingMesh, isExpandedBuildingKind } from './expandedBuildingModels';
import {
  createAoMOakTreeMesh,
  createBiomeTreeMesh,
  getFaunaAccentMaterial,
  getFaunaCoatMaterial,
} from '../textura';
import { getMapBiomeVisuals, getWorldSizeSpec, groundHeightAt as computeGeoGroundHeightAt, WORLD_SIZE_SPECS } from '../maps';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const MAP_HALF_SIZE = 74;
export const PLAYABLE_HALF_SIZE = 58;
export { getWorldSizeSpec, WORLD_SIZE_SPECS };

/**
 * Deterministic heightfield per AoM map biome & WorldSizeId.
 * Delegates to shared mapGeography engine so Mesh, Minimap, NavGrid & Spawners match 100%.
 */
export function groundHeightAt(
  x: number,
  z: number,
  mapId: MapId = 'mediterranean',
  worldSize: WorldSizeId = 'normal'
): number {
  return computeGeoGroundHeightAt(x, z, mapId, worldSize);
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
  style: 'greek' | 'egyptian' | 'norse' | 'atlantean' | 'chinese';
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

    // CHINESES: Fu Xi, Nü Wa, Shennong
    if (mg.includes('fu xi')) {
      return {
        style: 'chinese',
        wallMat: pal.crimson,
        trimMat: pal.gold,
        roofMat: pal.jade,
        armorMat: pal.gold,
        mountMat: pal.ivory,
        titanBodyMat: pal.jade,
        titanCoreMat: pal.goldOre,
      };
    }
    if (mg.includes('nü wa') || mg.includes('nu wa')) {
      return {
        style: 'chinese',
        wallMat: pal.ivory,
        trimMat: pal.jade,
        roofMat: pal.jade,
        armorMat: pal.jade,
        mountMat: pal.ivory,
        titanBodyMat: pal.jade,
        titanCoreMat: pal.crystalGlow,
      };
    }
    if (mg.includes('shennong')) {
      return {
        style: 'chinese',
        wallMat: pal.crimson,
        trimMat: pal.bronze,
        roofMat: pal.gold,
        armorMat: pal.bronze,
        mountMat: pal.furBrown,
        titanBodyMat: pal.ember,
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
      return { style: 'chinese', wallMat: pal.crimson, trimMat: pal.gold, roofMat: pal.jade, armorMat: pal.jade, mountMat: pal.ivory, titanBodyMat: pal.jade, titanCoreMat: pal.goldOre };
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

interface TownCenterVillageMats {
  courtyardEarth: THREE.MeshStandardMaterial;
  sandCourt: THREE.MeshStandardMaterial;
  strawThatch: THREE.MeshStandardMaterial;
  bambooRoof: THREE.MeshStandardMaterial;
  waterBasin: THREE.MeshStandardMaterial;
  flameGlow: THREE.MeshStandardMaterial;
  friezeDark: THREE.MeshStandardMaterial;
  cauldronDark: THREE.MeshStandardMaterial;
}

let cachedTownCenterVillageMats: TownCenterVillageMats | null = null;

function getTownCenterVillageMats(): TownCenterVillageMats {
  if (cachedTownCenterVillageMats) return cachedTownCenterVillageMats;
  cachedTownCenterVillageMats = {
    courtyardEarth: new THREE.MeshStandardMaterial({
      color: 0x6b5338,
      roughness: 0.94,
      metalness: 0.02,
    }),
    sandCourt: new THREE.MeshStandardMaterial({
      color: 0xa68959,
      roughness: 0.92,
      metalness: 0.02,
    }),
    strawThatch: new THREE.MeshStandardMaterial({
      color: 0xc8a968,
      roughness: 0.88,
      metalness: 0.02,
    }),
    bambooRoof: new THREE.MeshStandardMaterial({
      color: 0x9da632,
      roughness: 0.72,
      metalness: 0.08,
    }),
    waterBasin: new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.18,
      metalness: 0.12,
    }),
    flameGlow: new THREE.MeshStandardMaterial({
      color: 0xff7b1a,
      emissive: 0xff4500,
      emissiveIntensity: 1.45,
      roughness: 0.3,
      metalness: 0.05,
    }),
    friezeDark: new THREE.MeshStandardMaterial({
      color: 0x2b241d,
      roughness: 0.85,
      metalness: 0.05,
    }),
    cauldronDark: new THREE.MeshStandardMaterial({
      color: 0x2a2d34,
      roughness: 0.55,
      metalness: 0.65,
    }),
  };
  return cachedTownCenterVillageMats;
}

function buildSimpleTownCenter(
  root: THREE.Group,
  team: TeamId,
  pal: MaterialPalette,
  look: CivLook,
  enableShadows: boolean,
  age: AgeLevel = 1
): void {
  if (age > 1) {
    root.scale.setScalar(1 + (age - 1) * 0.04);
  }
  const village = getTownCenterVillageMats();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const placeMesh = (
    parent: THREE.Object3D,
    mesh: THREE.Mesh,
    x: number,
    y: number,
    z: number
  ) => {
    mesh.position.set(x, y, z);
    if (enableShadows) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    parent.add(mesh);
    return mesh;
  };

  // 1. Low Packed-Earth / Sandy Courtyard Pad (height 0.08u, unobstructed view)
  const courtMat = look.style === 'egyptian' ? village.sandCourt : village.courtyardEarth;
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.35, 0.08, 18), courtMat), 0, 0.04, 0);
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.03, 10), pal.stoneDark), 0.05, 0.085, 0.15);

  // 2. Rustic Wooden Perimeter Fence (12 segments) with 2 Open Gateways
  const fenceRadius = 3.05;
  const gateIndices = new Set([1, 6]);
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 + 0.18;
    const fx = Math.cos(ang) * fenceRadius;
    const fz = Math.sin(ang) * fenceRadius;
    const segGroup = new THREE.Group();
    segGroup.position.set(fx, 0, fz);
    segGroup.rotation.y = -ang + Math.PI / 2;
    root.add(segGroup);

    if (gateIndices.has(i)) {
      // Open gateway with tall timber posts + lintel crossbar
      placeMesh(segGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.52, 6), pal.timber), -0.62, 0.76, 0);
      placeMesh(segGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.52, 6), pal.timber), 0.62, 0.76, 0);
      placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.09, 0.09), pal.timber), 0, 1.48, 0);
      if (look.style === 'atlantean') {
        const eaves = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.12, 0.42), village.bambooRoof);
        eaves.rotation.x = 0.18;
        placeMesh(segGroup, eaves, 0, 1.56, 0);
      }
      if (i === 1) {
        // Neat low team banner hanging under the front-right gateway lintel
        placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.34, 0.04), teamMat), 0, 1.24, 0);
      }
    } else {
      // Three vertical fence stakes + two horizontal wooden rails
      for (const px of [-0.55, 0, 0.55]) {
        placeMesh(segGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.048, 0.74, 6), pal.timber), px, 0.37, 0);
      }
      placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.06, 0.05), pal.timber), 0, 0.56, 0);
      placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.06, 0.05), pal.timber), 0, 0.30, 0);
    }
  }

  // 3. Central Stone-Ring Campfire with 3-Pole / Crossbar Tripod & Cauldron
  const fireX = 0.05;
  const fireZ = 0.15;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    placeMesh(
      root,
      new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), pal.stoneDark),
      fireX + Math.cos(a) * 0.38,
      0.12,
      fireZ + Math.sin(a) * 0.38
    );
  }
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 8), pal.ember), fireX, 0.11, fireZ);
  placeMesh(root, new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.40, 6), village.flameGlow), fireX, 0.32, fireZ);
  placeMesh(root, new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.28, 5), pal.ember), fireX + 0.04, 0.36, fireZ - 0.03);

  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 0.94, 6), pal.timber);
  legL.rotation.z = -0.18;
  placeMesh(root, legL, fireX - 0.34, 0.48, fireZ);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 0.94, 6), pal.timber);
  legR.rotation.z = 0.18;
  placeMesh(root, legR, fireX + 0.34, 0.48, fireZ);
  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.86, 6), pal.timber);
  crossbar.rotation.z = Math.PI / 2;
  placeMesh(root, crossbar, fireX, 0.88, fireZ);
  placeMesh(root, new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), village.cauldronDark), fireX, 0.56, fireZ);

  // 4. Back Main Low Hut (x = -0.35, z = -1.62, max height ~2.05u)
  const mainHut = new THREE.Group();
  mainHut.position.set(-0.35, 0, -1.62);
  root.add(mainHut);

  if (look.style === 'egyptian') {
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.16, 1.48), pal.sandstoneDark), 0, 0.12, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.16, 1.04, 1.32), look.wallMat), 0, 0.70, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.09, 1.36), pal.ivory), 0, 1.12, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.08, 1.40), village.friezeDark), 0, 1.22, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.10, 1.10), pal.timber), 0, 1.26, 0);
    // Stepped mudbrick doorway buttress
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.88, 0.26), look.wallMat), -0.05, 0.54, 0.68);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.68, 0.12), pal.timber), -0.05, 0.44, 0.78);
    // Small roof canopy & leaning wooden ladder + water trough
    for (const [cx, cz] of [[0.38, -0.32], [0.92, -0.32], [0.38, 0.26], [0.92, 0.26]]) {
      placeMesh(mainHut, new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 5), pal.timber), cx, 1.48, cz);
    }
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.72), village.strawThatch);
    canopy.rotation.x = 0.14;
    placeMesh(mainHut, canopy, 0.65, 1.72, -0.03);
    const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.22, 0.06), pal.timber);
    ladder.rotation.x = -0.32;
    placeMesh(mainHut, ladder, 0.56, 0.70, 0.84);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.30, 0.34), pal.sandstoneDark), 1.05, 0.22, 0.62);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.24), village.waterBasin), 1.05, 0.38, 0.62);
  } else if (look.style === 'atlantean') {
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.22, 1.44), look.wallMat), 0, 0.15, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.20, 0.86, 1.28), pal.timber), 0, 0.68, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.64, 1.12), pal.ivory), 0, 0.66, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.10, 1.34), look.trimMat), 0, 1.08, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.74, 0.10), pal.timber), 0, 0.48, 0.64);
    const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.0, 4), village.bambooRoof);
    mainRoof.rotation.y = Math.PI / 4;
    mainRoof.scale.set(2.05, 0.84, 1.30);
    placeMesh(mainHut, mainRoof, 0, 1.54, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.08, 0.09), pal.timber), 0, 1.96, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.42), pal.stoneDark), 1.15, 0.20, 0.48);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.32), village.waterBasin), 1.15, 0.35, 0.48);
  } else {
    const isNorse = look.style === 'norse';
    const baseWallMat = isNorse ? look.wallMat : look.wallMat;
    const roofMat = isNorse ? village.strawThatch : look.roofMat;
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.32, 0.16, 1.40), pal.stoneDark), 0, 0.12, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.90, 1.26), baseWallMat), 0, 0.64, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.10, 1.32), isNorse ? pal.timber : look.trimMat), 0, 1.08, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.74, 0.10), pal.timber), 0, 0.48, 0.64);
    const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.0, 4), roofMat);
    mainRoof.rotation.y = Math.PI / 4;
    mainRoof.scale.set(2.05, 0.88, 1.30);
    placeMesh(mainHut, mainRoof, 0, 1.56, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.08, 0.09), pal.timber), 0, 1.98, 0);
  }

  // 5. Front-Left Secondary Storehouse Hut (x = -1.68, z = 1.05, rotated 0.52 rad)
  const sideHut = new THREE.Group();
  sideHut.position.set(-1.68, 0, 1.05);
  sideHut.rotation.y = 0.52;
  root.add(sideHut);

  if (look.style === 'egyptian') {
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.14, 1.16), pal.sandstoneDark), 0, 0.11, 0);
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.84, 1.04), look.wallMat), 0, 0.58, 0);
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.08, 1.08), pal.ivory), 0, 0.94, 0);
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.08, 0.88), pal.timber), 0, 1.02, 0);
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.56, 0.10), pal.timber), 0, 0.38, 0.53);
  } else {
    const sideRoofMat =
      look.style === 'atlantean'
        ? village.bambooRoof
        : look.style === 'norse'
          ? village.strawThatch
          : look.roofMat;
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.14, 1.14), pal.stoneDark), 0, 0.11, 0);
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.78, 1.02), look.style === 'atlantean' ? pal.ivory : look.wallMat), 0, 0.54, 0);
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.58, 0.10), pal.timber), 0, 0.38, 0.52);
    const sideRoof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.0, 4), sideRoofMat);
    sideRoof.rotation.y = Math.PI / 4;
    sideRoof.scale.set(1.44, 0.74, 1.04);
    placeMesh(sideHut, sideRoof, 0, 1.30, 0);
    placeMesh(sideHut, new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.07, 0.08), pal.timber), 0, 1.66, 0);
  }

  // 6. Right-Side Compact Granary / Kiln / Pavilion (x = 1.82, z = -0.15)
  const rightX = 1.82;
  const rightZ = -0.15;
  if (look.style === 'egyptian') {
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.76, 0.96, 8), look.wallMat), rightX, 0.52, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.60, 0.08, 8), pal.timber), rightX, 1.02, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.56, 0.38, 8), look.wallMat), rightX, 1.24, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 8), pal.sandstoneDark), rightX, 1.48, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.34), pal.sandstoneDark), rightX - 0.66, 0.24, rightZ + 0.36);
    placeMesh(root, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), pal.ember), rightX - 0.66, 0.22, rightZ + 0.44);
    // Side lean-to awning beside kiln
    for (const [ax, az] of [[0.85, -0.95], [1.45, -0.95], [0.85, -0.52], [1.45, -0.52]]) {
      placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.82, 5), pal.timber), ax, 0.45, az);
    }
    const lean = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.06, 0.62), village.strawThatch);
    lean.rotation.x = 0.22;
    placeMesh(root, lean, 1.15, 0.88, -0.74);
  } else if (look.style === 'atlantean') {
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.92, 0.14, 8), pal.stoneDark), rightX, 0.11, rightZ);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      placeMesh(
        root,
        new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, 0.92, 6), pal.timber),
        rightX + Math.cos(a) * 0.68,
        0.62,
        rightZ + Math.sin(a) * 0.68
      );
    }
    placeMesh(root, new THREE.Mesh(new THREE.ConeGeometry(1.04, 0.72, 8), village.bambooRoof), rightX, 1.42, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 6), pal.ivory), rightX, 1.82, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.34, 10), pal.terracotta), 1.05, 0.24, -0.82);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 10), village.waterBasin), 1.05, 0.41, -0.82);
  } else {
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.70, 0.74, 0.84, 12), look.wallMat), rightX, 0.46, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.ConeGeometry(0.94, 0.80, 12), village.strawThatch), rightX, 1.28, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 8), pal.timber), rightX, 1.70, rightZ);
  }

  // 7. Small Courtyard Supply Props (barrels & crates)
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.32, 8), pal.timber), 0.72, 0.24, -1.24);
  placeMesh(root, new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.26), pal.timber), -1.28, 0.20, -1.16);
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.28, 8), pal.terracotta), -1.04, 0.22, -1.02);

  attachGroundMarkers(root, 3.65, pal, team);
  attachHealthBar(root, 3.15, 3.0);
}

export function createBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  pantheon: PantheonId = 'greek',
  majorGod?: string,
  age: AgeLevel = 1
): THREE.Group {
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const look = getCivLook(pantheon, pal, majorGod);

  if (isExpandedBuildingKind(kind)) {
    const built = createExpandedBuildingMesh(kind, team, pal, enableShadows, pantheon, majorGod, age);
    root.add(built.group);
    if (built.beaconCrystal) {
      root.userData.beaconCrystal = built.beaconCrystal;
    }
    if (built.vortexRing) {
      root.userData.vortexRing = built.vortexRing;
    }
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'norse') {
    const built = createNorseBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) {
      root.userData.beaconCrystal = built.beaconCrystal;
    }
    if (built.vortexRing) {
      root.userData.vortexRing = built.vortexRing;
    }
    if (built.metropolisHalo) {
      root.userData.metropolisHalo = built.metropolisHalo;
    }
    if (built.metropolisCrystal) {
      root.userData.metropolisCrystal = built.metropolisCrystal;
    }
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'egyptian') {
    const built = createEgyptianBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) {
      root.userData.beaconCrystal = built.beaconCrystal;
    }
    if (built.vortexRing) {
      root.userData.vortexRing = built.vortexRing;
    }
    if (built.metropolisHalo) {
      root.userData.metropolisHalo = built.metropolisHalo;
    }
    if (built.metropolisCrystal) {
      root.userData.metropolisCrystal = built.metropolisCrystal;
    }
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'greek') {
    const built = createGreekBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) {
      root.userData.beaconCrystal = built.beaconCrystal;
    }
    if (built.vortexRing) {
      root.userData.vortexRing = built.vortexRing;
    }
    if (built.metropolisHalo) {
      root.userData.metropolisHalo = built.metropolisHalo;
    }
    if (built.metropolisCrystal) {
      root.userData.metropolisCrystal = built.metropolisCrystal;
    }
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'atlantean') {
    const built = createAtlanteanBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) {
      root.userData.beaconCrystal = built.beaconCrystal;
    }
    if (built.vortexRing) {
      root.userData.vortexRing = built.vortexRing;
    }
    if (built.metropolisHalo) {
      root.userData.metropolisHalo = built.metropolisHalo;
    }
    if (built.metropolisCrystal) {
      root.userData.metropolisCrystal = built.metropolisCrystal;
    }
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'chinese') {
    const built = createChineseBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) {
      root.userData.beaconCrystal = built.beaconCrystal;
    }
    if (built.vortexRing) {
      root.userData.vortexRing = built.vortexRing;
    }
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (kind === 'town_center') {
    buildSimpleTownCenter(root, team, pal, look, enableShadows, age);
    return root;
  }

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

  if (kind === 'archery_range') {
    // Campo de Tiro (Archery Range): Pitched target pavilion + archery butts + arrow racks
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.36, 4.0), pal.stoneDark), 0, 0.18, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.9, 2.4), look.wallMat), 0, 1.3, -0.55);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.25, 2.7), look.trimMat), 0, 2.35, -0.55);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.45, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 3.15, -0.55);
    // Open front portico pillars
    for (const px of [-1.6, 0, 1.6]) {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.1, 8), look.wallMat), px, 1.3, 0.7);
    }
    // Dual circular straw/painted Archery Targets in front courtyard
    for (const tx of [-1.15, 1.15]) {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), pal.timber), tx, 0.75, 1.45);
      const targetDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 14), pal.ivory);
      targetDisc.rotation.x = Math.PI / 2;
      addPart(targetDisc, tx, 1.15, 1.52);
      const bullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.16, 12), pal.crimson);
      bullseye.rotation.x = Math.PI / 2;
      addPart(bullseye, tx, 1.15, 1.53);
    }
    // Banner standard
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), look.trimMat), 1.85, 2.9, 0.7);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.6, 0.08), teamMat), 2.35, 3.65, 0.7);

    attachGroundMarkers(root, 2.6, pal, team);
    attachHealthBar(root, 4.2, 2.5);
    return root;
  }

  if (kind === 'stable') {
    // Estábulo (Stable): Twin horse stalls + fenced paddock courtyard + hay bales
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.36, 4.4), pal.stoneDark), 0, 0.18, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.0, 2.6), look.wallMat), 0, 1.35, -0.65);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.28, 2.9), look.trimMat), 0, 2.45, -0.65);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 3.3, -0.65);
    // Stall archway dividers
    for (const sx of [-1.4, 0, 1.4]) {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.9, 0.3), pal.timber), sx, 1.3, 0.65);
    }
    // Fenced paddock rails
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.12), pal.timber), 0, 0.85, 1.95);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.4), pal.timber), -2.15, 0.85, 1.3);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.4), pal.timber), 2.15, 0.85, 1.3);
    // Hay bales & drinking trough
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.65), pal.goldOre), -1.35, 0.62, 1.35);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.36, 0.5), pal.stoneDark), 1.15, 0.52, 1.35);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.08), teamMat), 0, 2.85, 0.72);

    attachGroundMarkers(root, 2.8, pal, team);
    attachHealthBar(root, 4.3, 2.6);
    return root;
  }

  if (kind === 'siege_works') {
    // Oficina de Cerco (Siege Works): Reinforced workshop + timber crane gantry + spare siege wheels
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.4, 4.6), pal.stoneDark), 0, 0.2, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 3.0), look.wallMat), -0.55, 1.5, -0.45);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.3, 3.3), look.trimMat), -0.55, 2.7, -0.45);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.5, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, -0.55, 3.55, -0.45);
    // Siege Crane Gantry & Hanging Hook on right courtyard
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.8, 0.24), pal.timber), 1.65, 2.1, -0.35);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 2.6), pal.timber), 1.65, 3.9, 0.45);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), pal.steel), 1.65, 3.15, 1.45);
    addPart(new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), pal.stoneDark), 1.65, 2.35, 1.45);
    // Spare Siege Wheels & Team Standard
    const spareWheel = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 6, 14), pal.timber);
    spareWheel.rotation.y = Math.PI / 4;
    addPart(spareWheel, -1.65, 0.85, 1.55);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.08), teamMat), -0.55, 3.1, 1.15);

    attachGroundMarkers(root, 2.9, pal, team);
    attachHealthBar(root, 4.5, 2.8);
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



  // --- ATLANTEAN / CHINESE / ELDRITCH ARCHITECTURE ---
  if (look.style === 'atlantean') {
    if (kind === 'house') {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.90, 0.16, 1.65), pal.stoneDark), 0, 0.08, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.84, 1.40), look.wallMat), 0, 0.58, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.10, 1.48), look.trimMat), 0, 1.05, 0);
      addPart(new THREE.Mesh(new THREE.SphereGeometry(0.76, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), look.roofMat), 0, 1.09, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.06), teamMat), 0.55, 0.78, 0.72);

      attachGroundMarkers(root, 1.15, pal, team);
      attachHealthBar(root, 2.05, 1.3);
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
  if (kind === 'house') {
    // Compact Mediterranean Cottage: 1.90 x 1.65, low stucco walls + simple pitched roof (~1.72u)
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.90, 0.16, 1.65), pal.stoneDark), 0, 0.08, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.90, 1.42), look.wallMat), 0, 0.61, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.42, 0.72, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 1.38, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.68, 0.12), pal.timber), 0, 0.50, 0.72);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.06), teamMat), 0.56, 0.84, 0.73);

    attachGroundMarkers(root, 1.15, pal, team);
    attachHealthBar(root, 2.05, 1.3);
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

  if (kind === 'fishing_ship' || kind === 'war_trireme' || kind === 'transport_ship') {
    const isWar = kind === 'war_trireme';
    const isTransport = kind === 'transport_ship';
    const hullLen = isWar ? 2.55 : isTransport ? 2.85 : 1.75;
    const hullW = isWar ? 0.88 : isTransport ? 1.18 : 0.72;
    const hullGroup = new THREE.Group();
    root.add(hullGroup);

    const addShipPart = (
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
      if (enableShadows) m.castShadow = true;
      hullGroup.add(m);
      return m;
    };

    // Main curved hull + deck
    addShipPart(new THREE.BoxGeometry(hullW, isTransport ? 0.44 : 0.36, hullLen), pal.timber, 0, 0.32, 0);
    addShipPart(new THREE.BoxGeometry(hullW * 0.88, 0.08, hullLen * 0.9), look.wallMat, 0, isTransport ? 0.56 : 0.52, 0);
    // Prow + bronze ram (for war_trireme) or boarding ramp (for transport_ship) or fishing net boom
    addShipPart(
      new THREE.ConeGeometry(hullW * 0.44, 0.72, 4),
      pal.timber,
      0,
      0.42,
      hullLen * 0.5 + 0.25,
      Math.PI / 2,
      Math.PI / 4,
      0
    );
    if (isWar) {
      addShipPart(
        new THREE.ConeGeometry(0.18, 0.55, 6),
        pal.bronze,
        0,
        0.28,
        hullLen * 0.5 + 0.56,
        Math.PI / 2,
        0,
        0
      );
      // Side shield rows
      for (const sz of [-0.65, -0.2, 0.25, 0.7]) {
        addShipPart(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 8), look.trimMat, -hullW * 0.52, 0.54, sz, 0, 0, Math.PI / 2);
        addShipPart(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 8), look.trimMat, hullW * 0.52, 0.54, sz, 0, 0, Math.PI / 2);
      }
    } else if (isTransport) {
      // Wide troop benches + raised bulwarks + bow disembarkation ramp
      addShipPart(new THREE.BoxGeometry(0.75, 0.08, 0.45), pal.bronze, 0, 0.52, hullLen * 0.52, 0.28, 0, 0);
      addShipPart(new THREE.BoxGeometry(0.16, 0.2, hullLen * 0.72), look.trimMat, -hullW * 0.36, 0.65, -0.1);
      addShipPart(new THREE.BoxGeometry(0.16, 0.2, hullLen * 0.72), look.trimMat, hullW * 0.36, 0.65, -0.1);
    } else {
      // Fishing net & basket on stern
      addShipPart(new THREE.CylinderGeometry(0.22, 0.16, 0.32, 8), pal.bronze, 0, 0.68, -0.45);
      addShipPart(new THREE.BoxGeometry(0.45, 0.14, 0.42), pal.goldOre, 0, 0.72, 0.42);
    }
    // Mast + Square Billowing Sail + Banner Pennant
    addShipPart(new THREE.CylinderGeometry(0.055, 0.07, isWar ? 2.15 : isTransport ? 1.95 : 1.65, 6), pal.timber, 0, isWar ? 1.5 : 1.38, isTransport ? -0.35 : 0);
    addShipPart(new THREE.BoxGeometry(isWar ? 1.48 : isTransport ? 1.35 : 1.05, 0.06, 0.06), pal.timber, 0, isWar ? 2.18 : 1.95, isTransport ? -0.35 : 0);
    addShipPart(
      new THREE.BoxGeometry(isWar ? 1.4 : isTransport ? 1.25 : 0.98, isWar ? 1.15 : 0.95, 0.06),
      teamMat,
      0,
      isWar ? 1.58 : 1.45,
      isTransport ? -0.27 : 0.08
    );
    addShipPart(new THREE.BoxGeometry(0.45, 0.24, 0.05), look.trimMat, 0.22, isWar ? 2.48 : 2.25, isTransport ? -0.35 : 0);

    let waveT = Math.random() * 6.28;
    root.userData.animatePose = (dt: number, moving: boolean) => {
      waveT += dt * (moving ? 4.2 : 2.1);
      hullGroup.position.y = Math.sin(waveT) * 0.06;
      hullGroup.rotation.z = Math.cos(waveT * 0.8) * 0.05;
      hullGroup.rotation.x = moving ? -0.05 : Math.sin(waveT * 0.6) * 0.025;
    };

    attachGroundMarkers(root, isTransport ? 1.42 : isWar ? 1.25 : 1.05, pal, team);
    attachHealthBar(root, isWar ? 2.85 : 2.6, isTransport ? 2.0 : isWar ? 1.85 : 1.45);
    return root;
  }

  const isExplicitEgyptianUnit =
    kind === 'priest' ||
    kind === 'pharaoh' ||
    kind === 'son_of_osiris' ||
    kind === 'egypt_spearman' ||
    kind === 'slinger' ||
    kind === 'axeman' ||
    kind === 'chariot_archer' ||
    kind === 'camel_rider' ||
    kind === 'war_elephant' ||
    kind === 'siege_tower' ||
    kind === 'egypt_catapult' ||
    kind === 'sphinx' ||
    kind === 'wadjet' ||
    kind === 'roc' ||
    kind === 'petsuchos' ||
    kind === 'scarab' ||
    kind === 'avenger' ||
    kind === 'mummy';

  const isGodKind =
    kind === 'zeus' ||
    kind === 'poseidon' ||
    kind === 'hades' ||
    kind === 'atena' ||
    kind === 'ares' ||
    kind === 'hermes' ||
    kind === 'apolo' ||
    kind === 'dionisio' ||
    kind === 'afrodite' ||
    kind === 'hefesto' ||
    kind === 'artemis' ||
    kind === 'isis' ||
    kind === 'set' ||
    kind === 'ra';

  if (isExplicitEgyptianUnit || (look.style === 'egyptian' && !isGodKind)) {
    const egyptMesh = createEgyptianUnitMesh(kind, team, pal, enableShadows);
    root.add(egyptMesh);
    root.userData.egyptMesh = egyptMesh;
    root.userData.animatePose = egyptMesh.userData.animatePose;
    root.userData.leftLeg = egyptMesh.userData.leftLeg;
    root.userData.rightLeg = egyptMesh.userData.rightLeg;
    root.userData.leftArm = egyptMesh.userData.leftArm;
    root.userData.rightArm = egyptMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      egyptMesh.userData.animatePose?.(
        dt,
        state === 'move',
        3.2,
        state === 'attack' ? 0.5 : null,
        state,
        'wood'
      );
    };
    const mSpec = getEgyptianUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

  const isExplicitNorseUnit =
    kind === 'norse_dwarf' ||
    kind === 'ox_cart' ||
    kind === 'hersir' ||
    kind === 'godi' ||
    kind === 'ulfsark' ||
    kind === 'throwing_axeman' ||
    kind === 'raiding_cavalry' ||
    kind === 'huskarl' ||
    kind === 'jarl' ||
    kind === 'portable_ram' ||
    kind === 'norse_ballista' ||
    kind === 'troll' ||
    kind === 'valkyrie' ||
    kind === 'einherjar' ||
    kind === 'frost_giant' ||
    kind === 'mountain_giant' ||
    kind === 'battle_boar' ||
    kind === 'kraken' ||
    kind === 'rock_troll' ||
    kind === 'fire_giant' ||
    kind === 'fenris_wolf' ||
    kind === 'nidhogg' ||
    kind === 'jormungand' ||
    kind === 'fafnir';

  if (isExplicitNorseUnit || ((look.style === 'norse' || pantheon === 'jotunn') && !isGodKind)) {
    const norseMesh = createNorseUnitMesh(kind, team, pal, enableShadows);
    root.add(norseMesh);
    root.userData.norseMesh = norseMesh;
    root.userData.animatePose = norseMesh.userData.animatePose;
    root.userData.leftLeg = norseMesh.userData.leftLeg;
    root.userData.rightLeg = norseMesh.userData.rightLeg;
    root.userData.leftArm = norseMesh.userData.leftArm;
    root.userData.rightArm = norseMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      norseMesh.userData.animatePose?.(
        dt,
        state === 'move',
        3.2,
        state === 'attack' ? 0.5 : null,
        state,
        'wood'
      );
    };
    const mSpec = getNorseUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

  const isExplicitAtlanteanUnit =
    kind === 'citizen' ||
    kind === 'oracle' ||
    kind === 'llama_caravan' ||
    kind === 'murmillo' ||
    kind === 'katapeltes' ||
    kind === 'turma' ||
    kind === 'cheiroballista' ||
    kind === 'arcus' ||
    kind === 'contarius' ||
    kind === 'destroyer' ||
    kind === 'fanatic' ||
    kind === 'fire_siphon' ||
    kind === 'onager' ||
    kind === 'promethean' ||
    kind === 'promethean_offspring' ||
    kind === 'caladria' ||
    kind === 'behemoth' ||
    kind === 'stymphalian_bird' ||
    kind === 'dryad' ||
    kind === 'hekagigantes' ||
    kind === 'argus' ||
    kind === 'lampades' ||
    kind === 'carnivora' ||
    kind === 'tartarian_spawn' ||
    ((kind === 'automaton' || kind === 'satyr') && look.style === 'atlantean');

  if (isExplicitAtlanteanUnit || (look.style === 'atlantean' && !isGodKind && kind !== 'titan')) {
    const atlMesh = createAtlanteanUnitMesh(kind, team, pal, enableShadows);
    root.add(atlMesh);
    root.userData.atlMesh = atlMesh;
    root.userData.animatePose = atlMesh.userData.animatePose;
    root.userData.setHeroVisual = atlMesh.userData.setHeroVisual;
    root.userData.leftLeg = atlMesh.userData.leftLeg;
    root.userData.rightLeg = atlMesh.userData.rightLeg;
    root.userData.leftArm = atlMesh.userData.leftArm;
    root.userData.rightArm = atlMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      atlMesh.userData.animatePose?.(
        dt,
        state === 'move',
        3.2,
        state === 'attack' ? 0.5 : null,
        state,
        'wood'
      );
    };
    const mSpec = getAtlanteanUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

  const isExplicitChineseUnit =
    kind === 'chinese_peasant' ||
    kind === 'kuafu' ||
    kind === 'halberdier' ||
    kind === 'chu_ko_nu' ||
    kind === 'tiger_cavalry' ||
    kind === 'fire_lance' ||
    kind === 'nezha' ||
    kind === 'jiang_ziya' ||
    kind === 'qilin' ||
    kind === 'taotie' ||
    kind === 'yazi' ||
    kind === 'azure_dragon';

  if (isExplicitChineseUnit || (look.style === 'chinese' && !isGodKind && kind !== 'titan')) {
    const chnMesh = createChineseUnitMesh(kind, team, pal, enableShadows);
    root.add(chnMesh);
    root.userData.chnMesh = chnMesh;
    root.userData.animatePose = chnMesh.userData.animatePose;
    root.userData.leftLeg = chnMesh.userData.leftLeg;
    root.userData.rightLeg = chnMesh.userData.rightLeg;
    root.userData.leftArm = chnMesh.userData.leftArm;
    root.userData.rightArm = chnMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      chnMesh.userData.animatePose?.(dt, state === 'move', 3.2, state === 'attack' ? 0.5 : null);
    };
    const mSpec = getChineseUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

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
  } else if (kind === 'hoplite' || kind === 'hipaspist' || kind === 'myrmidon') {
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
    root.userData.setCombatFury = (furyRatio: number) => {
      greekMesh.userData.setCombatFury?.(furyRatio);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      greekMesh.userData.updateBrg?.(dt, state);
    };
    root.userData.animatePose = greekMesh.userData.animatePose;
    attachGroundMarkers(root, kind === 'myrmidon' ? 0.52 : 0.48, pal, team);
    attachHealthBar(root, kind === 'myrmidon' ? 1.95 : 1.88, 1.05);
  } else if (
    look.style === 'greek' &&
    (kind === 'peltast' ||
      kind === 'archer' ||
      kind === 'gastraphetes' ||
      kind === 'cavalry' ||
      kind === 'prodromos' ||
      kind === 'ram' ||
      kind === 'siege')
  ) {
    const zeusMesh = createZeusMilitaryUnitMesh(kind as ZeusMilitaryUnitKind, team, pal, enableShadows, 3);
    root.add(zeusMesh);
    root.userData.leftLeg = zeusMesh.userData.leftLeg;
    root.userData.rightLeg = zeusMesh.userData.rightLeg;
    root.userData.leftArm = zeusMesh.userData.leftArm;
    root.userData.rightArm = zeusMesh.userData.rightArm;
    root.userData.animatePose = zeusMesh.userData.animatePose;
    root.userData.setArmorTier = (tier: 1 | 2 | 3 | 4) => {
      zeusMesh.userData.setArmorTier?.(tier);
    };
    const markerR =
      kind === 'siege' || kind === 'ram'
        ? 0.98
        : kind === 'cavalry' || kind === 'prodromos'
        ? 0.72
        : 0.46;
    const barY =
      kind === 'cavalry' || kind === 'prodromos'
        ? 2.55
        : kind === 'siege' || kind === 'ram'
        ? 2.35
        : 1.92;
    const barW =
      kind === 'siege' || kind === 'ram'
        ? 1.5
        : kind === 'cavalry' || kind === 'prodromos'
        ? 1.4
        : 1.0;
    attachGroundMarkers(root, markerR, pal, team);
    attachHealthBar(root, barY, barW);
  } else if (
    kind === 'jason' ||
    kind === 'odysseus' ||
    kind === 'perseus' ||
    kind === 'bellerophon' ||
    kind === 'hippolyta' ||
    kind === 'theseus' ||
    kind === 'manticore' ||
    kind === 'medusa' ||
    kind === 'hydra' ||
    kind === 'colossus' ||
    kind === 'nymph' ||
    kind === 'pegasus' ||
    kind === 'satyr' ||
    kind === 'automaton' ||
    kind === 'iron_dwarf' ||
    kind === 'phoenix' ||
    (look.style === 'greek' && kind === 'cyclops')
  ) {
    const mythHeroMesh = createZeusMythOrHeroMesh(kind as ZeusMythOrHeroKind, team, pal, enableShadows);
    root.add(mythHeroMesh);
    root.userData.leftLeg = mythHeroMesh.userData.leftLeg;
    root.userData.rightLeg = mythHeroMesh.userData.rightLeg;
    root.userData.leftArm = mythHeroMesh.userData.leftArm;
    root.userData.rightArm = mythHeroMesh.userData.rightArm;
    root.userData.animatePose = mythHeroMesh.userData.animatePose;

    const markerR =
      kind === 'colossus' || kind === 'cyclops' || kind === 'hydra'
        ? 1.15
        : kind === 'manticore' || kind === 'pegasus' || kind === 'bellerophon' || kind === 'phoenix'
        ? 0.86
        : kind === 'medusa' || kind === 'automaton'
        ? 0.72
        : 0.56;
    const barY =
      kind === 'colossus'
        ? 3.7
        : kind === 'cyclops'
        ? 3.45
        : kind === 'hydra' || kind === 'bellerophon' || kind === 'phoenix'
        ? 2.85
        : kind === 'manticore' || kind === 'pegasus'
        ? 2.45
        : 2.25;
    const barW =
      kind === 'colossus' || kind === 'cyclops' || kind === 'hydra'
        ? 1.85
        : kind === 'manticore' || kind === 'bellerophon' || kind === 'phoenix'
        ? 1.45
        : 1.25;
    attachGroundMarkers(root, markerR, pal, team);
    attachHealthBar(root, barY, barW);
  } else if (kind === 'archer' || kind === 'peltast' || kind === 'gastraphetes') {
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

    attachGroundMarkers(root, 0.45, pal, team);
    attachHealthBar(root, 1.88, 1.0);
  } else if (kind === 'cavalry' || kind === 'prodromos') {
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
    const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, kind === 'prodromos' ? 2.4 : 2.0, 6), pal.timber);
    lance.rotation.x = Math.PI / 2.2;
    lance.position.set(0, -0.05, 0.55);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 6), pal.steel);
    tip.rotation.x = Math.PI / 2.2;
    tip.position.set(0, 0.12, kind === 'prodromos' ? 1.72 : 1.52);
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
  } else if (kind === 'siege' || kind === 'ram') {
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
      typhon.titanRoot.scale.setScalar(2.15);
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

      attachGroundMarkers(root, 2.25, pal, team);
      attachHealthBar(root, 9.2, 2.8);
      return root;
    }

    // ==============================================================
    // 2. TITÃ DE POSEIDON: TITÃ CARÍBDIS - COLOSSO DAS PROFUNDEZAS
    // ==============================================================
    if (godKey.includes('poseidon')) {
      const caribTex = getCachedCaribdisTextures();
      const caribdis = buildCharybdisTitan(caribTex);
      caribdis.root.scale.setScalar(2.22);
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

      attachGroundMarkers(root, 2.25, pal, team);
      attachHealthBar(root, 9.2, 2.8);
      return root;
    }

    // ==============================================================
    // 3. TITÃ DE HADES: TITÃ CÉRBERO - GUARDIÃO DO SUBMUNDO
    // ==============================================================
    if (godKey.includes('hades')) {
      const cerbTex = getCachedCerberusTextures();
      const cerberus = buildCerberusTitan(cerbTex);
      cerberus.titanRoot.scale.setScalar(1.94);
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

      attachGroundMarkers(root, 2.25, pal, team);
      attachHealthBar(root, 9.2, 2.8);
      return root;
    }

    // ==============================================================
    // 3B. TITÃ CHINÊS: DRAGÃO CELESTIAL IMPERIAL
    // ==============================================================
    if (
      godKey.includes('fu xi') ||
      godKey.includes('nü wa') ||
      godKey.includes('nu wa') ||
      godKey.includes('shennong') ||
      look.style === 'chinese'
    ) {
      const chnTitan = createChineseDragonTitanMesh(pal, enableShadows);
      root.add(chnTitan);
      root.userData.beaconCrystal = chnTitan.userData.beaconCrystal;
      root.userData.animatePose = chnTitan.userData.animatePose;
      root.userData.updateBrg = chnTitan.userData.updateBrg;
      attachGroundMarkers(root, 2.35, pal, team);
      attachHealthBar(root, 9.5, 3.0);
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
    attachGroundMarkers(root, 2.25, pal, team);
    attachHealthBar(root, 9.2, 2.8);
  } else if (kind === 'zeus') {
    // DEUS MAIOR (~13.1u): Maior entidade do campo de batalha (> Deuses Menores > Titãs)
    const zeusTex = getCachedZeusTextures();
    const zeus = buildZeus(zeusTex);
    const zeusHolder = new THREE.Group();
    zeusHolder.scale.setScalar(5.05);
    zeusHolder.position.y = 0.25;
    zeusHolder.add(zeus.flight);
    root.add(zeusHolder);
    let zPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      zPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'tempestade' : 'raios') : moving ? 'voar' : 'pairar';
      animateZeus(zeus, dt, zPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  } else if (kind === 'poseidon') {
    // DEUS MAIOR (~13.1u): Maior entidade do campo de batalha (> Deuses Menores > Titãs)
    const posTex = getCachedPoseidonTextures();
    const poseidon = buildPoseidon(posTex);
    poseidon.vessel.scale.setScalar(3.82);
    root.add(poseidon.vessel);
    let pPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      pPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'tsunami' : 'golpe') : moving ? 'correnteza' : 'ondas';
      animatePoseidon(poseidon, dt, pPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  } else if (kind === 'hades') {
    // DEUS MAIOR (~13.1u): Maior entidade do campo de batalha (> Deuses Menores > Titãs)
    const hadesTex = getCachedHadesTextures();
    const hades = buildHades(hadesTex);
    hades.vessel.scale.setScalar(3.72);
    root.add(hades.vessel);
    let hPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      hPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'portal' : 'chama') : moving ? 'marcha' : 'reinar';
      animateHades(hades, dt, hPhase, mode, undefined, true);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  } else if (kind === 'artemis') {
    const artemisTex = getCachedArtemisTextures();
    const artemis = buildArtemis(artemisTex);
    artemis.root.scale.setScalar(2.95);
    root.add(artemis.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'raizes' : moving ? 'cacada' : 'vigilia';
      animateArtemis(artemis, dt, aPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'hefesto') {
    const hefTex = getCachedHephaestusTextures();
    const hef = buildHephaestus(hefTex);
    hef.root.scale.setScalar(3.08);
    root.add(hef.root);
    let hPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      hPhase += dt;
      const mode = attackT !== null ? 'martelo' : moving ? 'automato' : 'forja';
      animateHephaestus(hef, dt, hPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'dionisio') {
    const dioTex = getCachedDionysusTextures();
    const dio = buildDionysus(dioTex);
    dio.root.scale.setScalar(3.02);
    root.add(dio.root);
    let dPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      dPhase += dt;
      const mode = attackT !== null ? 'vinhas' : moving ? 'danca' : 'banquete';
      animateDionysus(dio, dt, dPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'afrodite') {
    const afroTex = getCachedAphroditeTextures();
    const afro = buildAphrodite(afroTex);
    afro.root.scale.setScalar(4.45);
    root.add(afro.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'encanto' : moving ? 'danca' : 'graca';
      animateAphrodite(afro, dt, aPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'apolo') {
    const apoTex = getCachedApolloTextures();
    const apo = buildApollo(apoTex);
    apo.root.scale.setScalar(2.98);
    root.add(apo.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'flecha' : moving ? 'voo' : 'pairar';
      animateApollo(apo, dt, aPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'ares') {
    const aresTex = getCachedAresTextures();
    const ares = buildAres(aresTex);
    ares.root.scale.setScalar(2.88);
    root.add(ares.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.6 ? 'sismico' : 'furia') : moving ? 'investida' : 'postura';
      animateAres(ares, dt, aPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'atena') {
    const atenaTex = getCachedAtenaTextures();
    const atena = buildAthena(atenaTex);
    atena.root.scale.setScalar(2.90);
    root.add(atena.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'furia' : 'avanco') : moving ? 'egide' : 'guardia';
      animateAthena(atena, dt, aPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'hermes') {
    const hermesTex = getCachedHermesTextures();
    const hermes = buildHermes(hermesTex);
    hermes.root.scale.setScalar(2.95);
    root.add(hermes.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'relampago' : 'rajada') : moving ? 'velocidade' : 'flutuar';
      animateHermes(hermes, dt, aPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  } else if (kind === 'isis') {
    // DEUSA MAIOR EGÍPCIA (~13.1u): Deusa da Magia e Prosperidade
    const isisTex = getCachedIsisTextures();
    const isis = buildIsis(isisTex);
    const isisHolder = new THREE.Group();
    isisHolder.scale.setScalar(3.85);
    isisHolder.position.y = 0.25;
    isisHolder.add(isis.root);
    root.add(isisHolder);
    let iPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      iPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'sopdet' : 'heka') : moving ? 'ankh' : 'majestade';
      animateIsis(isis, dt, iPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  } else if (kind === 'set') {
    // DEUS MAIOR EGÍPCIO (~13.1u): Deus do Caos e do Deserto
    const setTex = getCachedSetTextures();
    const setGod = buildSet(setTex);
    const setHolder = new THREE.Group();
    setHolder.scale.setScalar(3.85);
    setHolder.position.y = 0.25;
    setHolder.add(setGod.root);
    root.add(setHolder);
    let sPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      sPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'deserto' : 'tempestade') : moving ? 'monstro' : 'senhor';
      animateSet(setGod, dt, sPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  } else if (kind === 'ra') {
    // DEUS MAIOR EGÍPCIO (~13.1u): Deus do Sol e Rei dos Deuses
    const raTex = getCachedRaTextures();
    const raGod = buildRa(raTex);
    const raHolder = new THREE.Group();
    raHolder.scale.setScalar(3.85);
    raHolder.position.y = 0.25;
    raHolder.add(raGod.root);
    root.add(raHolder);
    let rPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      rPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'ira' : 'chuva') : moving ? 'bencao' : 'gloria';
      animateRa(raGod, dt, rPhase, mode);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
    };
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  }

  return root;
}

export function createResourceMesh(
  kind: ResourceNodeKind,
  pal: MaterialPalette,
  enableShadows: boolean,
  mapId: MapId = 'mediterranean',
  variantSeed = 0
): THREE.Group {
  const root = new THREE.Group();
  const bio = getMapBiomeVisuals(mapId);

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
    const useSecondary = Boolean(bio.secondaryTreeStyle && variantSeed % 3 === 1);
    const style = useSecondary ? bio.secondaryTreeStyle! : bio.treeStyle;
    const treeGroup = createBiomeTreeMesh(style, pal, enableShadows, variantSeed);
    root.add(treeGroup);
    root.userData.oakCanopyGroup = treeGroup.userData.oakCanopyGroup;
    root.userData.oakVariant = treeGroup.userData.oakVariant;
    attachGroundMarkers(root, 0.98, pal, 'neutral');
    attachHealthBar(root, 5.9, 1.75);
  } else if (kind === 'berry') {
    const bushMat =
      bio.berryStyle === 'erebus_fungus'
        ? pal.ember
        : bio.berryStyle === 'frost_berry'
        ? pal.iceBlue
        : pal.foliagePine;
    const fruitMat =
      bio.berryStyle === 'desert_date'
        ? pal.goldOre
        : bio.berryStyle === 'frost_berry'
        ? pal.lapis
        : bio.berryStyle === 'jungle_fruit'
        ? pal.gold
        : pal.berryRed;

    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 1), bushMat), 0, 0.48, 0);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), pal.foliageDark), 0.48, 0.4, 0.22);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.52, 1), bushMat), -0.42, 0.38, -0.18);
    const berryGeo = new THREE.SphereGeometry(0.11, 6, 6);
    for (const [bx, by, bz] of [
      [0.22, 0.85, 0.48],
      [-0.3, 0.72, 0.42],
      [0.58, 0.58, 0.35],
      [-0.08, 0.92, -0.3],
      [0.12, 0.62, -0.5],
    ]) {
      add(new THREE.Mesh(berryGeo, fruitMat), bx, by, bz);
    }
    attachGroundMarkers(root, 0.95, pal, 'neutral');
    attachHealthBar(root, 1.55, 1.35);
  } else if (kind === 'fish_spot') {
    // Cardume aquático animado com peixes prateados e anéis de água
    const ripple = add(
      new THREE.Mesh(
        new THREE.TorusGeometry(1.08, 0.055, 8, 24),
        pal.crystalGlow
      ),
      0,
      0.16,
      0
    );
    ripple.rotation.x = Math.PI / 2;
    const school = new THREE.Group();
    root.add(school);
    root.userData.fishSchoolGroup = school;
    const fishBodyGeo = new THREE.ConeGeometry(0.12, 0.42, 6);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const dist = 0.42 + (i % 2) * 0.25;
      const fish = new THREE.Mesh(fishBodyGeo, i % 2 === 0 ? pal.iceBlue : pal.goldOre);
      fish.position.set(Math.cos(ang) * dist, 0.14 + (i % 3) * 0.04, Math.sin(ang) * dist);
      fish.rotation.z = Math.PI / 2;
      fish.rotation.y = -ang;
      school.add(fish);
    }
    attachGroundMarkers(root, 1.35, pal, 'neutral');
    attachHealthBar(root, 1.45, 1.45);
  } else {
    // Gold Mine (biome-tinted rocky outcropping with golden crystalline veins)
    const rockOuterMat =
      bio.rockStyle === 'sandstone'
        ? pal.sandstoneDark
        : bio.rockStyle === 'ice'
        ? pal.iceBlue
        : bio.rockStyle === 'obsidian'
        ? pal.obsidian
        : bio.rockStyle === 'mossy'
        ? pal.foliageDark
        : pal.stoneDark;
    const rockCoreMat =
      bio.rockStyle === 'sandstone'
        ? pal.sandstone
        : bio.rockStyle === 'ice'
        ? pal.marble
        : pal.obsidian;

    const rockBase = add(new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), rockCoreMat), 0, 0.55, 0);
    rockBase.scale.set(1.25, 0.62, 1.15);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), rockOuterMat), -0.95, 0.38, 0.55);
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.82, 0), rockOuterMat), 0.92, 0.35, -0.45);

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

export function createPlentyVaultMesh(
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

  add(new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.0, 0.45, 8), pal.stoneDark), 0, 0.22, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.35, 0.35, 8), pal.marble), 0, 0.62, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 2.6, 8), pal.marble), Math.cos(a) * 1.45, 1.9, Math.sin(a) * 1.45);
  }
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.85, 0.3, 8), pal.gold), 0, 3.25, 0);
  const chest = add(new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.85, 0.85), pal.goldOre), 0, 1.25, 0);
  chest.rotation.y = Math.PI / 4;
  const beacon = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), pal.crystalGlow), 0, 4.25, 0);
  root.userData.beaconCrystal = beacon;
  return root;
}

export function createSettlementMesh(
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();
  const village = getTownCenterVillageMats();
  const add = (m: THREE.Mesh, x: number, y: number, z: number) => {
    m.position.set(x, y, z);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    root.add(m);
    return m;
  };

  // Humble, low-profile pre-construction clearing (max height ~1.05u)
  add(new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.25, 0.08, 16), village.courtyardEarth), 0, 0.04, 0);

  // 8 short wooden survey stakes marking the settlement boundary
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + 0.2;
    const px = Math.cos(ang) * 2.85;
    const pz = Math.sin(ang) * 2.85;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.62, 6), pal.timber), px, 0.31, pz);
  }

  // Stacked timber logs & foundation stones awaiting construction
  for (const [lx, ly, lz] of [
    [-1.25, 0.16, 0.95],
    [-1.12, 0.16, 1.12],
    [-1.18, 0.30, 1.04],
  ]) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.05, 6), pal.timber);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = 0.45;
    add(log, lx, ly, lz);
  }
  add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), pal.stoneDark), 1.28, 0.18, -0.88);
  add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), pal.stoneDark), 1.54, 0.16, -0.70);

  // Unlit central stone firepit ring + low floating beacon crystal
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.10, 0), pal.stoneDark), Math.cos(a) * 0.42, 0.11, Math.sin(a) * 0.42);
  }
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.05, 8), pal.stoneDark), 0, 0.09, 0);
  const beacon = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), pal.goldOre), 0, 0.85, 0);
  root.userData.beaconCrystal = beacon;

  attachGroundMarkers(root, 3.65, pal, 'neutral');
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
  const accentMat = getFaunaAccentMaterial(kind);

  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (enableShadows) m.castShadow = true;
    bodyGroup.add(m);
    return m;
  };

  if (kind === 'gazelle' || kind === 'deer' || kind === 'reindeer' || kind === 'goat') {
    const scale = kind === 'deer' ? 1.08 : kind === 'reindeer' ? 1.12 : kind === 'goat' ? 0.78 : 0.88;
    const leftLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, -0.14, 0.26 * scale, 0.32);
    const rightLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, 0.14, 0.26 * scale, 0.32);
    const backLeftLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, -0.14, 0.26 * scale, -0.32);
    const backRightLeg = part(new THREE.BoxGeometry(0.1, 0.52 * scale, 0.1), coatMat, 0.14, 0.26 * scale, -0.32);
    part(new THREE.BoxGeometry(0.36 * scale, 0.36 * scale, 0.92 * scale), coatMat, 0, 0.68 * scale, 0);
    part(new THREE.BoxGeometry(0.3 * scale, 0.14 * scale, 0.68 * scale), pal.ivory, 0, 0.54 * scale, 0);
    const neck = part(new THREE.BoxGeometry(0.16, 0.46 * scale, 0.18), kind === 'reindeer' ? pal.ivory : coatMat, 0, 0.98 * scale, 0.4);
    neck.rotation.x = 0.32;
    part(new THREE.BoxGeometry(0.18, 0.2, 0.34), coatMat, 0, 1.2 * scale, 0.56);
    const hornMat = kind === 'deer' || kind === 'reindeer' ? pal.ivory : accentMat;
    const hornLen = kind === 'reindeer' ? 0.56 : kind === 'deer' ? 0.46 : 0.32;
    const hL = part(new THREE.ConeGeometry(0.038, hornLen, 5), hornMat, -0.1, 1.44 * scale, 0.48);
    hL.rotation.z = 0.35;
    hL.rotation.x = -0.38;
    const hR = part(new THREE.ConeGeometry(0.038, hornLen, 5), hornMat, 0.1, 1.44 * scale, 0.48);
    hR.rotation.z = -0.35;
    hR.rotation.x = -0.38;
    part(new THREE.BoxGeometry(0.09, 0.11, 0.15), pal.ivory, 0, 0.76 * scale, -0.5);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, kind === 'reindeer' ? 0.52 : kind === 'deer' ? 0.5 : kind === 'goat' ? 0.42 : 0.45, pal, 'neutral');
    attachHealthBar(root, 1.75 * scale, 1.05, true);
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
  } else if (kind === 'aurochs' || kind === 'musk_ox') {
    const isMusk = kind === 'musk_ox';
    const leftLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, -0.26, 0.26, 0.46);
    const rightLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, 0.26, 0.26, 0.46);
    const backLeftLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, -0.26, 0.26, -0.46);
    const backRightLeg = part(new THREE.BoxGeometry(0.16, 0.52, 0.16), coatMat, 0.26, 0.26, -0.46);
    part(new THREE.BoxGeometry(isMusk ? 0.82 : 0.72, isMusk ? 0.72 : 0.65, 1.32), coatMat, 0, 0.82, 0);
    part(new THREE.BoxGeometry(0.68, 0.3, 0.68), isMusk ? accentMat : pal.furBrown, 0, 1.18, 0.26);
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
  } else if (kind === 'camel') {
    const leftLeg = part(new THREE.BoxGeometry(0.12, 0.78, 0.12), coatMat, -0.2, 0.39, 0.44);
    const rightLeg = part(new THREE.BoxGeometry(0.12, 0.78, 0.12), coatMat, 0.2, 0.39, 0.44);
    const backLeftLeg = part(new THREE.BoxGeometry(0.12, 0.78, 0.12), coatMat, -0.2, 0.39, -0.44);
    const backRightLeg = part(new THREE.BoxGeometry(0.12, 0.78, 0.12), coatMat, 0.2, 0.39, -0.44);
    part(new THREE.BoxGeometry(0.52, 0.48, 1.15), coatMat, 0, 0.96, 0);
    // Hump
    part(new THREE.SphereGeometry(0.36, 8, 6), accentMat, 0, 1.34, -0.05);
    const neck = part(new THREE.BoxGeometry(0.18, 0.65, 0.2), coatMat, 0, 1.32, 0.58);
    neck.rotation.x = 0.42;
    part(new THREE.BoxGeometry(0.22, 0.24, 0.4), coatMat, 0, 1.62, 0.82);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.62, pal, 'neutral');
    attachHealthBar(root, 2.05, 1.35, true);
  } else if (kind === 'elephant_wild') {
    const leftLeg = part(new THREE.CylinderGeometry(0.18, 0.21, 0.76, 7), coatMat, -0.36, 0.38, 0.56);
    const rightLeg = part(new THREE.CylinderGeometry(0.18, 0.21, 0.76, 7), coatMat, 0.36, 0.38, 0.56);
    const backLeftLeg = part(new THREE.CylinderGeometry(0.18, 0.21, 0.76, 7), coatMat, -0.36, 0.38, -0.56);
    const backRightLeg = part(new THREE.CylinderGeometry(0.18, 0.21, 0.76, 7), coatMat, 0.36, 0.38, -0.56);
    part(new THREE.BoxGeometry(0.98, 0.88, 1.56), coatMat, 0, 1.14, 0);
    part(new THREE.BoxGeometry(0.68, 0.66, 0.64), coatMat, 0, 1.32, 0.96);
    // Large ears
    part(new THREE.BoxGeometry(0.12, 0.62, 0.48), coatMat, -0.44, 1.34, 0.88);
    part(new THREE.BoxGeometry(0.12, 0.62, 0.48), coatMat, 0.44, 1.34, 0.88);
    // Trunk
    const trunk = part(new THREE.CylinderGeometry(0.09, 0.14, 0.86, 6), coatMat, 0, 0.96, 1.36);
    trunk.rotation.x = 0.28;
    // Ivory tusks
    const tL = part(new THREE.ConeGeometry(0.06, 0.58, 6), accentMat, -0.22, 1.08, 1.38);
    tL.rotation.x = Math.PI / 2.2;
    const tR = part(new THREE.ConeGeometry(0.06, 0.58, 6), accentMat, 0.22, 1.08, 1.38);
    tR.rotation.x = Math.PI / 2.2;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.94, pal, 'neutral');
    attachHealthBar(root, 2.35, 1.65, true);
  } else if (kind === 'hippo') {
    const leftLeg = part(new THREE.CylinderGeometry(0.15, 0.16, 0.36, 7), coatMat, -0.28, 0.18, 0.46);
    const rightLeg = part(new THREE.CylinderGeometry(0.15, 0.16, 0.36, 7), coatMat, 0.28, 0.18, 0.46);
    const backLeftLeg = part(new THREE.CylinderGeometry(0.15, 0.16, 0.36, 7), coatMat, -0.28, 0.18, -0.46);
    const backRightLeg = part(new THREE.CylinderGeometry(0.15, 0.16, 0.36, 7), coatMat, 0.28, 0.18, -0.46);
    part(new THREE.BoxGeometry(0.84, 0.62, 1.38), coatMat, 0, 0.62, 0);
    part(new THREE.BoxGeometry(0.56, 0.44, 0.54), coatMat, 0, 0.66, 0.84);
    part(new THREE.BoxGeometry(0.44, 0.24, 0.28), accentMat, 0, 0.54, 1.12);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.78, pal, 'neutral');
    attachHealthBar(root, 1.55, 1.35, true);
  } else if (kind === 'crocodile') {
    const leftLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, -0.28, 0.08, 0.36);
    const rightLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, 0.28, 0.08, 0.36);
    const backLeftLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, -0.28, 0.08, -0.36);
    const backRightLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, 0.28, 0.08, -0.36);
    part(new THREE.BoxGeometry(0.42, 0.2, 1.18), coatMat, 0, 0.18, 0);
    part(new THREE.BoxGeometry(0.28, 0.14, 0.62), coatMat, 0, 0.16, 0.82);
    part(new THREE.ConeGeometry(0.16, 0.95, 5), accentMat, 0, 0.15, -0.98).rotation.x = -Math.PI / 2;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.62, pal, 'neutral');
    attachHealthBar(root, 0.95, 1.15, true);
  } else if (kind === 'lion') {
    const leftLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, -0.15, 0.22, 0.36);
    const rightLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, 0.15, 0.22, 0.36);
    const backLeftLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, -0.15, 0.22, -0.36);
    const backRightLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, 0.15, 0.22, -0.36);
    part(new THREE.BoxGeometry(0.42, 0.4, 0.98), coatMat, 0, 0.62, 0);
    // Mane & Head
    part(new THREE.DodecahedronGeometry(0.32, 0), accentMat, 0, 0.78, 0.56);
    part(new THREE.BoxGeometry(0.26, 0.24, 0.28), coatMat, 0, 0.76, 0.72);
    const tail = part(new THREE.BoxGeometry(0.08, 0.08, 0.54), coatMat, 0, 0.64, -0.66);
    tail.rotation.x = -0.35;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.54, pal, 'neutral');
    attachHealthBar(root, 1.5, 1.15, true);
  } else if (kind === 'bear') {
    const leftLeg = part(new THREE.BoxGeometry(0.18, 0.44, 0.18), coatMat, -0.24, 0.22, 0.42);
    const rightLeg = part(new THREE.BoxGeometry(0.18, 0.44, 0.18), coatMat, 0.24, 0.22, 0.42);
    const backLeftLeg = part(new THREE.BoxGeometry(0.18, 0.44, 0.18), coatMat, -0.24, 0.22, -0.42);
    const backRightLeg = part(new THREE.BoxGeometry(0.18, 0.44, 0.18), coatMat, 0.24, 0.22, -0.42);
    part(new THREE.BoxGeometry(0.68, 0.58, 1.18), coatMat, 0, 0.72, 0);
    part(new THREE.BoxGeometry(0.42, 0.36, 0.44), coatMat, 0, 0.84, 0.72);
    part(new THREE.BoxGeometry(0.22, 0.18, 0.22), accentMat, 0, 0.76, 0.96);
    part(new THREE.SphereGeometry(0.09, 6, 5), coatMat, -0.16, 1.04, 0.68);
    part(new THREE.SphereGeometry(0.09, 6, 5), coatMat, 0.16, 1.04, 0.68);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.66, pal, 'neutral');
    attachHealthBar(root, 1.65, 1.25, true);
  } else if (kind === 'cow' || kind === 'yak') {
    const isYak = kind === 'yak';
    const leftLeg = part(new THREE.BoxGeometry(0.13, 0.46, 0.13), coatMat, -0.22, 0.23, 0.42);
    const rightLeg = part(new THREE.BoxGeometry(0.13, 0.46, 0.13), coatMat, 0.22, 0.23, 0.42);
    const backLeftLeg = part(new THREE.BoxGeometry(0.13, 0.46, 0.13), coatMat, -0.22, 0.23, -0.42);
    const backRightLeg = part(new THREE.BoxGeometry(0.13, 0.46, 0.13), coatMat, 0.22, 0.23, -0.42);
    part(new THREE.BoxGeometry(isYak ? 0.68 : 0.6, isYak ? 0.62 : 0.54, 1.18), coatMat, 0, 0.72, 0);
    if (!isYak) {
      // Dairy cow patches
      part(new THREE.BoxGeometry(0.62, 0.28, 0.42), accentMat, 0, 0.78, -0.18);
      part(new THREE.BoxGeometry(0.32, 0.16, 0.26), pal.skin, 0, 0.42, -0.22);
    } else {
      // Yak shaggy hump
      part(new THREE.BoxGeometry(0.64, 0.34, 0.68), coatMat, 0, 1.06, 0.24);
    }
    part(new THREE.BoxGeometry(0.36, 0.36, 0.4), coatMat, 0, 0.84, 0.72);
    part(new THREE.BoxGeometry(0.24, 0.18, 0.16), pal.skin, 0, 0.72, 0.94);
    const hL = part(new THREE.ConeGeometry(0.045, isYak ? 0.46 : 0.3, 5), pal.ivory, -0.22, 1.04, 0.72);
    hL.rotation.z = 0.95;
    const hR = part(new THREE.ConeGeometry(0.045, isYak ? 0.46 : 0.3, 5), pal.ivory, 0.22, 1.04, 0.72);
    hR.rotation.z = -0.95;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.62, pal, 'neutral');
    attachHealthBar(root, 1.65, 1.2, true);
  } else if (kind === 'pig' || kind === 'capybara') {
    const isCapy = kind === 'capybara';
    const leftLeg = part(new THREE.BoxGeometry(0.11, 0.24, 0.11), coatMat, -0.15, 0.12, 0.25);
    const rightLeg = part(new THREE.BoxGeometry(0.11, 0.24, 0.11), coatMat, 0.15, 0.12, 0.25);
    const backLeftLeg = part(new THREE.BoxGeometry(0.11, 0.24, 0.11), coatMat, -0.15, 0.12, -0.25);
    const backRightLeg = part(new THREE.BoxGeometry(0.11, 0.24, 0.11), coatMat, 0.15, 0.12, -0.25);
    part(new THREE.BoxGeometry(0.44, 0.38, isCapy ? 0.84 : 0.76), coatMat, 0, 0.4, 0);
    part(new THREE.BoxGeometry(0.32, 0.3, 0.34), coatMat, 0, 0.46, 0.48);
    part(new THREE.BoxGeometry(0.18, 0.14, 0.16), isCapy ? accentMat : pal.skin, 0, 0.4, 0.68);
    if (!isCapy) {
      part(new THREE.BoxGeometry(0.08, 0.12, 0.04), accentMat, -0.12, 0.63, 0.46);
      part(new THREE.BoxGeometry(0.08, 0.12, 0.04), accentMat, 0.12, 0.63, 0.46);
    }

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.46, pal, 'neutral');
    attachHealthBar(root, 1.25, 1.0, true);
  } else if (kind === 'turkey' || kind === 'chicken') {
    const isTurkey = kind === 'turkey';
    const s = isTurkey ? 1.0 : 0.74;
    const leftLeg = part(new THREE.BoxGeometry(0.05, 0.22 * s, 0.05), pal.goldOre, -0.09 * s, 0.11 * s, 0);
    const rightLeg = part(new THREE.BoxGeometry(0.05, 0.22 * s, 0.05), pal.goldOre, 0.09 * s, 0.11 * s, 0);
    part(new THREE.SphereGeometry(0.24 * s, 8, 6), coatMat, 0, 0.35 * s, 0);
    part(new THREE.BoxGeometry(0.12 * s, 0.22 * s, 0.12 * s), coatMat, 0, 0.54 * s, 0.18 * s);
    part(new THREE.ConeGeometry(0.05 * s, 0.14 * s, 4), pal.goldOre, 0, 0.58 * s, 0.3 * s).rotation.x = Math.PI / 2;
    part(new THREE.BoxGeometry(0.04 * s, 0.1 * s, 0.1 * s), pal.berryRed, 0, 0.66 * s, 0.2 * s);
    if (isTurkey) {
      // Fan tail plumage
      const fan = part(new THREE.CylinderGeometry(0.32, 0.08, 0.06, 8, 1, false, -Math.PI * 0.45, Math.PI * 0.9), accentMat, 0, 0.48, -0.26);
      fan.rotation.x = Math.PI / 2.2;
      fan.rotation.z = Math.PI;
    }

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    attachGroundMarkers(root, isTurkey ? 0.36 : 0.28, pal, 'neutral');
    attachHealthBar(root, isTurkey ? 1.1 : 0.9, 0.85, true);
  } else if (kind === 'moose') {
    const scale = 1.24;
    const leftLeg = part(new THREE.BoxGeometry(0.12, 0.62 * scale, 0.12), coatMat, -0.18, 0.31 * scale, 0.38);
    const rightLeg = part(new THREE.BoxGeometry(0.12, 0.62 * scale, 0.12), coatMat, 0.18, 0.31 * scale, 0.38);
    const backLeftLeg = part(new THREE.BoxGeometry(0.12, 0.62 * scale, 0.12), coatMat, -0.18, 0.31 * scale, -0.38);
    const backRightLeg = part(new THREE.BoxGeometry(0.12, 0.62 * scale, 0.12), coatMat, 0.18, 0.31 * scale, -0.38);
    part(new THREE.BoxGeometry(0.48, 0.52, 1.15), coatMat, 0, 0.96, 0);
    part(new THREE.BoxGeometry(0.44, 0.26, 0.46), coatMat, 0, 1.24, 0.28);
    const neck = part(new THREE.BoxGeometry(0.24, 0.48, 0.28), coatMat, 0, 1.18, 0.58);
    neck.rotation.x = 0.4;
    part(new THREE.BoxGeometry(0.26, 0.26, 0.48), coatMat, 0, 1.38, 0.86);
    // Broad palmate moose antlers
    part(new THREE.BoxGeometry(0.44, 0.08, 0.28), accentMat, -0.32, 1.62, 0.74).rotation.z = 0.25;
    part(new THREE.BoxGeometry(0.44, 0.08, 0.28), accentMat, 0.32, 1.62, 0.74).rotation.z = -0.25;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.64, pal, 'neutral');
    attachHealthBar(root, 2.05, 1.25, true);
  } else if (kind === 'zebra') {
    const leftLeg = part(new THREE.BoxGeometry(0.1, 0.58, 0.1), coatMat, -0.16, 0.29, 0.36);
    const rightLeg = part(new THREE.BoxGeometry(0.1, 0.58, 0.1), coatMat, 0.16, 0.29, 0.36);
    const backLeftLeg = part(new THREE.BoxGeometry(0.1, 0.58, 0.1), coatMat, -0.16, 0.29, -0.36);
    const backRightLeg = part(new THREE.BoxGeometry(0.1, 0.58, 0.1), coatMat, 0.16, 0.29, -0.36);
    part(new THREE.BoxGeometry(0.42, 0.42, 1.04), coatMat, 0, 0.78, 0);
    // Black stripes across back
    for (const sz of [-0.32, -0.1, 0.12, 0.34]) {
      part(new THREE.BoxGeometry(0.44, 0.36, 0.08), accentMat, 0, 0.81, sz);
    }
    const neck = part(new THREE.BoxGeometry(0.18, 0.5, 0.22), coatMat, 0, 1.1, 0.46);
    neck.rotation.x = 0.35;
    part(new THREE.BoxGeometry(0.1, 0.46, 0.08), accentMat, 0, 1.15, 0.36).rotation.x = 0.35;
    part(new THREE.BoxGeometry(0.2, 0.22, 0.38), coatMat, 0, 1.32, 0.64);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.54, pal, 'neutral');
    attachHealthBar(root, 1.75, 1.15, true);
  } else if (kind === 'giraffe') {
    const leftLeg = part(new THREE.BoxGeometry(0.11, 1.05, 0.11), coatMat, -0.18, 0.525, 0.36);
    const rightLeg = part(new THREE.BoxGeometry(0.11, 1.05, 0.11), coatMat, 0.18, 0.525, 0.36);
    const backLeftLeg = part(new THREE.BoxGeometry(0.11, 1.05, 0.11), coatMat, -0.18, 0.525, -0.36);
    const backRightLeg = part(new THREE.BoxGeometry(0.11, 1.05, 0.11), coatMat, 0.18, 0.525, -0.36);
    part(new THREE.BoxGeometry(0.46, 0.48, 0.96), coatMat, 0, 1.24, 0);
    part(new THREE.BoxGeometry(0.48, 0.28, 0.32), accentMat, 0, 1.28, -0.1);
    const neck = part(new THREE.BoxGeometry(0.18, 1.28, 0.2), coatMat, 0, 2.02, 0.42);
    neck.rotation.x = 0.18;
    part(new THREE.BoxGeometry(0.2, 0.2, 0.38), coatMat, 0, 2.68, 0.58);
    part(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 5), accentMat, -0.06, 2.84, 0.5);
    part(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 5), accentMat, 0.06, 2.84, 0.5);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.58, pal, 'neutral');
    attachHealthBar(root, 3.15, 1.2, true);
  } else if (kind === 'rhino') {
    const leftLeg = part(new THREE.CylinderGeometry(0.15, 0.17, 0.42, 7), coatMat, -0.28, 0.21, 0.44);
    const rightLeg = part(new THREE.CylinderGeometry(0.15, 0.17, 0.42, 7), coatMat, 0.28, 0.21, 0.44);
    const backLeftLeg = part(new THREE.CylinderGeometry(0.15, 0.17, 0.42, 7), coatMat, -0.28, 0.21, -0.44);
    const backRightLeg = part(new THREE.CylinderGeometry(0.15, 0.17, 0.42, 7), coatMat, 0.28, 0.21, -0.44);
    part(new THREE.BoxGeometry(0.78, 0.64, 1.38), coatMat, 0, 0.68, 0);
    part(new THREE.BoxGeometry(0.48, 0.44, 0.56), coatMat, 0, 0.66, 0.84);
    const mainHorn = part(new THREE.ConeGeometry(0.08, 0.44, 6), accentMat, 0, 0.94, 1.08);
    mainHorn.rotation.x = 0.25;
    part(new THREE.ConeGeometry(0.05, 0.2, 6), accentMat, 0, 0.9, 0.88);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.76, pal, 'neutral');
    attachHealthBar(root, 1.65, 1.35, true);
  } else if (kind === 'tiger') {
    const leftLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, -0.15, 0.22, 0.36);
    const rightLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, 0.15, 0.22, 0.36);
    const backLeftLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, -0.15, 0.22, -0.36);
    const backRightLeg = part(new THREE.BoxGeometry(0.11, 0.44, 0.11), coatMat, 0.15, 0.22, -0.36);
    part(new THREE.BoxGeometry(0.42, 0.4, 1.02), coatMat, 0, 0.62, 0);
    for (const sz of [-0.3, -0.06, 0.18]) {
      part(new THREE.BoxGeometry(0.44, 0.3, 0.08), accentMat, 0, 0.65, sz);
    }
    part(new THREE.BoxGeometry(0.3, 0.26, 0.32), coatMat, 0, 0.74, 0.62);
    const tail = part(new THREE.BoxGeometry(0.08, 0.08, 0.58), coatMat, 0, 0.62, -0.68);
    tail.rotation.x = -0.3;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.54, pal, 'neutral');
    attachHealthBar(root, 1.48, 1.15, true);
  } else if (kind === 'hyena') {
    const leftLeg = part(new THREE.BoxGeometry(0.1, 0.4, 0.1), coatMat, -0.13, 0.2, 0.3);
    const rightLeg = part(new THREE.BoxGeometry(0.1, 0.4, 0.1), coatMat, 0.13, 0.2, 0.3);
    const backLeftLeg = part(new THREE.BoxGeometry(0.1, 0.32, 0.1), coatMat, -0.13, 0.16, -0.3);
    const backRightLeg = part(new THREE.BoxGeometry(0.1, 0.32, 0.1), coatMat, 0.13, 0.16, -0.3);
    const torso = part(new THREE.BoxGeometry(0.34, 0.34, 0.84), coatMat, 0, 0.52, 0);
    torso.rotation.x = 0.16;
    part(new THREE.BoxGeometry(0.14, 0.16, 0.46), accentMat, 0, 0.7, 0.12);
    part(new THREE.BoxGeometry(0.26, 0.24, 0.34), coatMat, 0, 0.68, 0.52);
    part(new THREE.BoxGeometry(0.16, 0.13, 0.18), accentMat, 0, 0.62, 0.72);
    part(new THREE.ConeGeometry(0.06, 0.14, 4), coatMat, -0.1, 0.86, 0.46);
    part(new THREE.ConeGeometry(0.06, 0.14, 4), coatMat, 0.1, 0.86, 0.46);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.46, pal, 'neutral');
    attachHealthBar(root, 1.35, 1.0, true);
  } else if (kind === 'alligator') {
    const leftLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, -0.28, 0.08, 0.38);
    const rightLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, 0.28, 0.08, 0.38);
    const backLeftLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, -0.28, 0.08, -0.38);
    const backRightLeg = part(new THREE.BoxGeometry(0.16, 0.14, 0.16), coatMat, 0.28, 0.08, -0.38);
    part(new THREE.BoxGeometry(0.46, 0.22, 1.24), coatMat, 0, 0.18, 0);
    part(new THREE.BoxGeometry(0.32, 0.16, 0.6), coatMat, 0, 0.16, 0.84);
    part(new THREE.ConeGeometry(0.17, 1.0, 5), accentMat, 0, 0.15, -1.04).rotation.x = -Math.PI / 2;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.64, pal, 'neutral');
    attachHealthBar(root, 0.98, 1.15, true);
  } else if (kind === 'baboon') {
    const leftLeg = part(new THREE.BoxGeometry(0.09, 0.34, 0.09), coatMat, -0.14, 0.17, 0.26);
    const rightLeg = part(new THREE.BoxGeometry(0.09, 0.34, 0.09), coatMat, 0.14, 0.17, 0.26);
    const backLeftLeg = part(new THREE.BoxGeometry(0.09, 0.32, 0.09), coatMat, -0.14, 0.16, -0.24);
    const backRightLeg = part(new THREE.BoxGeometry(0.09, 0.32, 0.09), coatMat, 0.14, 0.16, -0.24);
    const torso = part(new THREE.BoxGeometry(0.34, 0.34, 0.68), coatMat, 0, 0.46, 0);
    torso.rotation.x = -0.18;
    part(new THREE.BoxGeometry(0.26, 0.26, 0.3), coatMat, 0, 0.66, 0.38);
    part(new THREE.BoxGeometry(0.16, 0.14, 0.22), accentMat, 0, 0.62, 0.58);
    const tail = part(new THREE.BoxGeometry(0.06, 0.42, 0.06), coatMat, 0, 0.64, -0.38);
    tail.rotation.x = -0.35;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.backLeftLeg = backLeftLeg;
    root.userData.backRightLeg = backRightLeg;
    attachGroundMarkers(root, 0.42, pal, 'neutral');
    attachHealthBar(root, 1.25, 0.95, true);
  } else if (kind === 'sea_turtle') {
    const shell = part(new THREE.SphereGeometry(0.54, 10, 8), coatMat, 0, 0.22, 0);
    shell.scale.set(1.0, 0.45, 1.25);
    part(new THREE.SphereGeometry(0.18, 7, 6), accentMat, 0, 0.22, 0.74);
    part(new THREE.BoxGeometry(0.44, 0.05, 0.22), accentMat, -0.52, 0.14, 0.32).rotation.y = 0.4;
    part(new THREE.BoxGeometry(0.44, 0.05, 0.22), accentMat, 0.52, 0.14, 0.32).rotation.y = -0.4;
    part(new THREE.BoxGeometry(0.28, 0.05, 0.16), accentMat, -0.4, 0.14, -0.46);
    part(new THREE.BoxGeometry(0.28, 0.05, 0.16), accentMat, 0.4, 0.14, -0.46);
  } else if (kind === 'dolphin') {
    const body = part(new THREE.SphereGeometry(0.32, 10, 8), coatMat, 0, 0.25, 0);
    body.scale.set(0.75, 0.72, 2.35);
    part(new THREE.ConeGeometry(0.08, 0.38, 6), coatMat, 0, 0.22, 0.85).rotation.x = Math.PI / 2;
    const dorsal = part(new THREE.ConeGeometry(0.12, 0.34, 4), accentMat, 0, 0.52, -0.05);
    dorsal.rotation.x = -0.35;
    part(new THREE.BoxGeometry(0.56, 0.05, 0.22), accentMat, 0, 0.25, -0.82);
  } else if (kind === 'whale') {
    const body = part(new THREE.SphereGeometry(0.72, 12, 8), coatMat, 0, 0.38, 0);
    body.scale.set(0.95, 0.78, 2.95);
    part(new THREE.BoxGeometry(0.82, 0.28, 2.2), pal.ivory, 0, 0.16, 0.25);
    part(new THREE.BoxGeometry(1.45, 0.08, 0.48), accentMat, 0, 0.36, -2.15);
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
