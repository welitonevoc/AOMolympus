import * as THREE from 'three';
import { TeamId } from '../types';
import { MaterialPalette } from './palette';

export interface SculptedGeos {
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

export function getSculptedGeos(): SculptedGeos {
  if (_cachedGeos) return _cachedGeos;

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

  const sculptedLimb = new THREE.CapsuleGeometry(0.078, 0.34, 4, 8);
  const heavyLimb = new THREE.CapsuleGeometry(0.13, 0.44, 5, 10);
  const giantLimb = new THREE.CapsuleGeometry(0.22, 0.72, 6, 10);

  const horseBarrel = new THREE.CapsuleGeometry(0.29, 0.85, 6, 12);
  horseBarrel.rotateX(Math.PI / 2);
  const horseNeck = new THREE.CapsuleGeometry(0.14, 0.44, 5, 10);

  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.48, -0.08),
    new THREE.Vector3(0, -0.24, 0.14),
    new THREE.Vector3(0, 0, 0.22),
    new THREE.Vector3(0, 0.24, 0.14),
    new THREE.Vector3(0, 0.48, -0.08),
  ]);
  const compoundBow = new THREE.TubeGeometry(bowCurve, 14, 0.028, 6, false);

  const hornCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.16, 0.08, 0.04),
    new THREE.Vector3(0.26, 0.24, 0.12),
    new THREE.Vector3(0.2, 0.42, 0.2),
  ]);
  const bullHorn = new THREE.TubeGeometry(hornCurve, 10, 0.055, 7, false);

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

export function attachGroundMarkers(group: THREE.Group, radius: number, pal: MaterialPalette, team: TeamId | 'neutral') {
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

export function attachHealthBar(group: THREE.Group, height: number, width: number, withSecondaryBar = false) {
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

export interface TownCenterVillageMats {
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

export function getTownCenterVillageMats(): TownCenterVillageMats {
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
