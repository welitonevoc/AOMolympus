import * as THREE from 'three';
import { FaunaKind, MapId, ResourceNodeKind } from '../types';
import {
  createBiomeTreeMesh,
  getFaunaAccentMaterial,
  getFaunaCoatMaterial,
} from '../../textura';
import { getMapBiomeVisuals } from '../../maps';
import { MaterialPalette } from './palette';
import { attachGroundMarkers, attachHealthBar, getSculptedGeos, getTownCenterVillageMats } from './shared';

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

  add(new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.25, 0.08, 16), village.courtyardEarth), 0, 0.04, 0);

  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + 0.2;
    const px = Math.cos(ang) * 2.85;
    const pz = Math.sin(ang) * 2.85;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.62, 6), pal.timber), px, 0.31, pz);
  }

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
    part(new THREE.BoxGeometry(0.12, 0.62, 0.48), coatMat, -0.44, 1.34, 0.88);
    part(new THREE.BoxGeometry(0.12, 0.62, 0.48), coatMat, 0.44, 1.34, 0.88);
    const trunk = part(new THREE.CylinderGeometry(0.09, 0.14, 0.86, 6), coatMat, 0, 0.96, 1.36);
    trunk.rotation.x = 0.28;
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
      part(new THREE.BoxGeometry(0.62, 0.28, 0.42), accentMat, 0, 0.78, -0.18);
      part(new THREE.BoxGeometry(0.32, 0.16, 0.26), pal.skin, 0, 0.42, -0.22);
    } else {
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
