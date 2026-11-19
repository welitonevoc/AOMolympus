import * as THREE from 'three';
import { AgeLevel, TeamId } from '../types';
import { CivLook, MaterialPalette } from './palette';

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

export function buildSimpleTownCenter(
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

  const courtMat = look.style === 'egyptian' ? village.sandCourt : village.courtyardEarth;
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.35, 0.08, 18), courtMat), 0, 0.04, 0);
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.03, 10), pal.stoneDark), 0.05, 0.085, 0.15);

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
      placeMesh(segGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.52, 6), pal.timber), -0.62, 0.76, 0);
      placeMesh(segGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.52, 6), pal.timber), 0.62, 0.76, 0);
      placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.09, 0.09), pal.timber), 0, 1.48, 0);
      if (look.style === 'atlantean') {
        const eaves = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.12, 0.42), village.bambooRoof);
        eaves.rotation.x = 0.18;
        placeMesh(segGroup, eaves, 0, 1.56, 0);
      }
      if (i === 1) {
        placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.34, 0.04), teamMat), 0, 1.24, 0);
      }
    } else {
      for (const px of [-0.55, 0, 0.55]) {
        placeMesh(segGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.048, 0.74, 6), pal.timber), px, 0.37, 0);
      }
      placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.06, 0.05), pal.timber), 0, 0.56, 0);
      placeMesh(segGroup, new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.06, 0.05), pal.timber), 0, 0.30, 0);
    }
  }

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

  const mainHut = new THREE.Group();
  mainHut.position.set(-0.35, 0, -1.62);
  root.add(mainHut);

  if (look.style === 'egyptian') {
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.16, 1.48), pal.sandstoneDark), 0, 0.12, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.16, 1.04, 1.32), look.wallMat), 0, 0.70, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.09, 1.36), pal.ivory), 0, 1.12, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.08, 1.40), village.friezeDark), 0, 1.22, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.10, 1.10), pal.timber), 0, 1.26, 0);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.88, 0.26), look.wallMat), -0.05, 0.54, 0.68);
    placeMesh(mainHut, new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.68, 0.12), pal.timber), -0.05, 0.44, 0.78);
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
    const baseWallMat = look.wallMat;
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

  const rightX = 1.82;
  const rightZ = -0.15;
  if (look.style === 'egyptian') {
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.76, 0.96, 8), look.wallMat), rightX, 0.52, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.60, 0.08, 8), pal.timber), rightX, 1.02, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.56, 0.38, 8), look.wallMat), rightX, 1.24, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 8), pal.sandstoneDark), rightX, 1.48, rightZ);
    placeMesh(root, new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.34), pal.sandstoneDark), rightX - 0.66, 0.24, rightZ + 0.36);
    placeMesh(root, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), pal.ember), rightX - 0.66, 0.22, rightZ + 0.44);
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

  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.32, 8), pal.timber), 0.72, 0.24, -1.24);
  placeMesh(root, new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.26), pal.timber), -1.28, 0.20, -1.16);
  placeMesh(root, new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.28, 8), pal.terracotta), -1.04, 0.22, -1.02);

  attachGroundMarkers(root, 3.65, pal, team);
  attachHealthBar(root, 3.15, 3.0);
}
