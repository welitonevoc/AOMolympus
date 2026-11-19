import * as THREE from 'three';
import { AgeLevel, BuildingKind, PantheonId, TeamId } from '../types';
import { createNorseBuildingMesh } from '../../civilizacao/nordicos/norseBuildingModels';
import { createEgyptianBuildingMesh } from '../../civilizacao/egipcios/egyptianBuildingModels';
import { createGreekBuildingMesh } from '../../civilizacao/gregos/greekBuildingModels';
import { createAtlanteanBuildingMesh } from '../../civilizacao/atlantes/atlanteanBuildingModels';
import { createChineseBuildingMesh } from '../../civilizacao/chineses/chineseModels';
import { createExpandedBuildingMesh, isExpandedBuildingKind } from '../expandedBuildingModels';
import { getCivLook, MaterialPalette } from './palette';
import { attachGroundMarkers, attachHealthBar, buildSimpleTownCenter } from './shared';

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
    if (built.beaconCrystal) root.userData.beaconCrystal = built.beaconCrystal;
    if (built.vortexRing) root.userData.vortexRing = built.vortexRing;
    if (built.metropolisHalo) root.userData.metropolisHalo = built.metropolisHalo;
    if (built.metropolisCrystal) root.userData.metropolisCrystal = built.metropolisCrystal;
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'egyptian') {
    const built = createEgyptianBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) root.userData.beaconCrystal = built.beaconCrystal;
    if (built.vortexRing) root.userData.vortexRing = built.vortexRing;
    if (built.metropolisHalo) root.userData.metropolisHalo = built.metropolisHalo;
    if (built.metropolisCrystal) root.userData.metropolisCrystal = built.metropolisCrystal;
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'greek') {
    const built = createGreekBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) root.userData.beaconCrystal = built.beaconCrystal;
    if (built.vortexRing) root.userData.vortexRing = built.vortexRing;
    if (built.metropolisHalo) root.userData.metropolisHalo = built.metropolisHalo;
    if (built.metropolisCrystal) root.userData.metropolisCrystal = built.metropolisCrystal;
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'atlantean') {
    const built = createAtlanteanBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) root.userData.beaconCrystal = built.beaconCrystal;
    if (built.vortexRing) root.userData.vortexRing = built.vortexRing;
    if (built.metropolisHalo) root.userData.metropolisHalo = built.metropolisHalo;
    if (built.metropolisCrystal) root.userData.metropolisCrystal = built.metropolisCrystal;
    attachGroundMarkers(root, built.markerRadius, pal, team);
    attachHealthBar(root, built.barHeight, built.barWidth);
    return root;
  }

  if (look.style === 'chinese') {
    const built = createChineseBuildingMesh(kind, team, pal, enableShadows, age, pantheon, majorGod);
    root.add(built.group);
    if (built.beaconCrystal) root.userData.beaconCrystal = built.beaconCrystal;
    if (built.vortexRing) root.userData.vortexRing = built.vortexRing;
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

  if (kind === 'farm') {
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 4.4), pal.furBrown), 0, 0.07, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.22, 0.16), pal.timber), 0, 0.14, 2.15);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.22, 0.16), pal.timber), 0, 0.14, -2.15);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 4.4), pal.timber), -2.15, 0.14, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 4.4), pal.timber), 2.15, 0.14, 0);
    for (let row = -1.4; row <= 1.45; row += 0.7) {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 0.3), pal.stoneDark), 0, 0.18, row);
      for (let col = -1.35; col <= 1.35; col += 0.55) {
        addPart(new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.58, 5), pal.goldOre), col, 0.48, row);
      }
    }
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
    for (const sx of [-1.2, 1.2]) {
      for (const pz of [-1.1, 1.1]) {
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 6), pal.timber), sx - 0.65, 1.5, pz);
        addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 6), pal.timber), sx + 0.65, 1.5, pz);
      }
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 2.5), sx < 0 ? teamMat : look.roofMat), sx, 2.55, 0);
      addPart(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), pal.timber), sx, 0.85, 0);
    }
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
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.36, 4.0), pal.stoneDark), 0, 0.18, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.9, 2.4), look.wallMat), 0, 1.3, -0.55);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.25, 2.7), look.trimMat), 0, 2.35, -0.55);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.45, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 3.15, -0.55);
    for (const px of [-1.6, 0, 1.6]) {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.1, 8), look.wallMat), px, 1.3, 0.7);
    }
    for (const tx of [-1.15, 1.15]) {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), pal.timber), tx, 0.75, 1.45);
      const targetDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 14), pal.ivory);
      targetDisc.rotation.x = Math.PI / 2;
      addPart(targetDisc, tx, 1.15, 1.52);
      const bullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.16, 12), pal.crimson);
      bullseye.rotation.x = Math.PI / 2;
      addPart(bullseye, tx, 1.15, 1.53);
    }
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), look.trimMat), 1.85, 2.9, 0.7);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.6, 0.08), teamMat), 2.35, 3.65, 0.7);

    attachGroundMarkers(root, 2.6, pal, team);
    attachHealthBar(root, 4.2, 2.5);
    return root;
  }

  if (kind === 'stable') {
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.36, 4.4), pal.stoneDark), 0, 0.18, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.0, 2.6), look.wallMat), 0, 1.35, -0.65);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.28, 2.9), look.trimMat), 0, 2.45, -0.65);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, 0, 3.3, -0.65);
    for (const sx of [-1.4, 0, 1.4]) {
      addPart(new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.9, 0.3), pal.timber), sx, 1.3, 0.65);
    }
    addPart(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.12), pal.timber), 0, 0.85, 1.95);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.4), pal.timber), -2.15, 0.85, 1.3);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.4), pal.timber), 2.15, 0.85, 1.3);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.65), pal.goldOre), -1.35, 0.62, 1.35);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.36, 0.5), pal.stoneDark), 1.15, 0.52, 1.35);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.08), teamMat), 0, 2.85, 0.72);

    attachGroundMarkers(root, 2.8, pal, team);
    attachHealthBar(root, 4.3, 2.6);
    return root;
  }

  if (kind === 'siege_works') {
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.4, 4.6), pal.stoneDark), 0, 0.2, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 3.0), look.wallMat), -0.55, 1.5, -0.45);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.3, 3.3), look.trimMat), -0.55, 2.7, -0.45);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.5, 4), look.roofMat);
    roof.rotation.y = Math.PI / 4;
    addPart(roof, -0.55, 3.55, -0.45);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.8, 0.24), pal.timber), 1.65, 2.1, -0.35);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 2.6), pal.timber), 1.65, 3.9, 0.45);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), pal.steel), 1.65, 3.15, 1.45);
    addPart(new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), pal.stoneDark), 1.65, 2.35, 1.45);
    const spareWheel = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 6, 14), pal.timber);
    spareWheel.rotation.y = Math.PI / 4;
    addPart(spareWheel, -1.65, 0.85, 1.55);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.08), teamMat), -0.55, 3.1, 1.15);

    attachGroundMarkers(root, 2.9, pal, team);
    attachHealthBar(root, 4.5, 2.8);
    return root;
  }

  if (kind === 'fortress') {
    addPart(new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.55, 6.4), pal.stoneDark), 0, 0.275, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.2, 5.0), look.wallMat), 0, 2.15, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.35, 5.3), look.trimMat), 0, 3.9, 0);
    for (const [bx, bz] of [[-2.5, 2.5], [2.5, 2.5], [-2.5, -2.5], [2.5, -2.5]]) {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 5.2, 8), look.wallMat), bx, 2.9, bz);
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.9, 0.45, 8), look.trimMat), bx, 5.65, bz);
      addPart(new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.5, 8), look.roofMat), bx, 6.6, bz);
    }
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.6, 3.0), look.wallMat), 0, 5.1, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.35, 3.25), look.trimMat), 0, 6.55, 0);
    const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.8, 4), look.roofMat);
    keepRoof.rotation.y = Math.PI / 4;
    addPart(keepRoof, 0, 7.55, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.35), pal.obsidian), 0, 1.35, 2.52);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), pal.gold), 0, 8.8, 0);
    addPart(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.88, 0.08), teamMat), 0.7, 9.4, 0);

    attachGroundMarkers(root, 3.6, pal, team);
    attachHealthBar(root, 8.8, 3.2);
    return root;
  }

  if (kind === 'titan_gate') {
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.55, 12), pal.obsidian), 0, 0.275, 0);
    addPart(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.7, 0.35, 12), look.trimMat), 0, 0.65, 0);
    const pL = addPart(new THREE.Mesh(new THREE.BoxGeometry(1.35, 7.2, 1.35), look.wallMat), -2.4, 4.0, 0);
    pL.rotation.z = -0.12;
    const pR = addPart(new THREE.Mesh(new THREE.BoxGeometry(1.35, 7.2, 1.35), look.wallMat), 2.4, 4.0, 0);
    pR.rotation.z = 0.12;
    addPart(new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 1.65), look.trimMat), 0, 7.45, 0);
    addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), pal.ember), 0, 8.35, 0);
    const vortexRing = addPart(new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.22, 12, 28), pal.crystalGlow), 0, 4.2, 0);
    const vortexCore = addPart(new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 1), pal.ember), 0, 4.2, 0);
    root.userData.beaconCrystal = vortexCore;
    root.userData.vortexRing = vortexRing;
    for (const [ox, oz] of [[-3.2, 2.8], [3.2, 2.8], [-3.2, -2.8], [3.2, -2.8]]) {
      addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.38, 2.8, 4), pal.obsidian), ox, 1.7, oz);
      addPart(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 4), teamMat), ox, 3.35, oz);
    }

    attachGroundMarkers(root, 4.0, pal, team);
    attachHealthBar(root, 8.4, 3.5);
    return root;
  }

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

  if (kind === 'house') {
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
