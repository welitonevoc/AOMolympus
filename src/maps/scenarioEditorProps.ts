import * as THREE from 'three';
import { createBiomeTreeMesh } from '../textura';
import {
  createBuildingMesh,
  createFaunaMesh,
  createPlentyVaultMesh,
  createRelicMesh,
  createResourceMesh,
  createSettlementMesh,
  createUnitMesh,
  MaterialPalette,
} from '../game/models';
import { PantheonId, TeamId } from '../game/types';
import { PlacedScenarioObject, PLAYER_COLORS } from './scenarioEditorTypes';

function createEditorPropMesh(propKind: NonNullable<PlacedScenarioObject['propKind']>, accentHex: number): THREE.Group {
  const g = new THREE.Group();
  const marble = new THREE.MeshStandardMaterial({ color: 0xded9cc, roughness: 0.72, metalness: 0.08 });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x4b4a4d, roughness: 0.88, metalness: 0.1 });
  const sandstone = new THREE.MeshStandardMaterial({ color: 0xc9a36a, roughness: 0.84, metalness: 0.05 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0xc59338, roughness: 0.34, metalness: 0.82 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4528, roughness: 0.88, metalness: 0.04 });
  const teamMat = new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.55, metalness: 0.15 });
  const ember = new THREE.MeshStandardMaterial({ color: 0xff6b2b, emissive: 0xff4500, emissiveIntensity: 1.3, roughness: 0.4 });
  const waterGlow = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7, roughness: 0.18, metalness: 0.3 });

  const addPart = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };

  switch (propKind) {
    case 'trojan_horse': {
      // Composite wooden siege horse on wheeled chassis
      addPart(new THREE.BoxGeometry(2.6, 0.28, 1.5), wood, 0, 0.36, 0);
      for (const sx of [-1.05, 1.05]) {
        for (const sz of [-0.72, 0.72]) {
          addPart(new THREE.CylinderGeometry(0.36, 0.36, 0.16, 12), darkStone, sx, 0.36, sz, Math.PI / 2, 0, 0);
        }
        addPart(new THREE.CylinderGeometry(0.18, 0.22, 1.35, 8), wood, sx * 0.75, 1.05, -0.35);
        addPart(new THREE.CylinderGeometry(0.18, 0.22, 1.35, 8), wood, sx * 0.75, 1.05, 0.35);
      }
      addPart(new THREE.BoxGeometry(2.2, 1.05, 1.1), wood, 0, 2.05, 0);
      addPart(new THREE.BoxGeometry(0.75, 1.35, 0.62), wood, 1.05, 2.95, 0, 0, 0, -0.35);
      addPart(new THREE.BoxGeometry(0.95, 0.55, 0.55), wood, 1.55, 3.35, 0, 0, 0, -0.2);
      addPart(new THREE.BoxGeometry(2.26, 0.14, 1.16), bronze, 0, 2.1, 0);
      break;
    }
    case 'hades_gate': {
      addPart(new THREE.BoxGeometry(4.4, 0.35, 1.8), darkStone, 0, 0.18, 0);
      addPart(new THREE.BoxGeometry(0.95, 3.9, 1.2), darkStone, -1.6, 2.1, 0);
      addPart(new THREE.BoxGeometry(0.95, 3.9, 1.2), darkStone, 1.6, 2.1, 0);
      addPart(new THREE.BoxGeometry(4.6, 0.85, 1.45), darkStone, 0, 4.2, 0);
      addPart(new THREE.ConeGeometry(0.45, 1.1, 5), bronze, -1.6, 4.9, 0);
      addPart(new THREE.ConeGeometry(0.45, 1.1, 5), bronze, 1.6, 4.9, 0);
      addPart(new THREE.PlaneGeometry(2.3, 3.4), ember, 0, 2.0, 0);
      break;
    }
    case 'troy_gate':
    case 'troy_wall':
    case 'atlantis_wall': {
      const mat = propKind === 'atlantis_wall' ? marble : sandstone;
      const trim = propKind === 'atlantis_wall' ? bronze : darkStone;
      if (propKind === 'troy_gate') {
        addPart(new THREE.BoxGeometry(1.1, 3.4, 1.2), mat, -1.75, 1.7, 0);
        addPart(new THREE.BoxGeometry(1.1, 3.4, 1.2), mat, 1.75, 1.7, 0);
        addPart(new THREE.BoxGeometry(4.8, 0.9, 1.3), mat, 0, 3.6, 0);
        addPart(new THREE.BoxGeometry(2.3, 2.6, 0.25), wood, 0, 1.35, 0);
        addPart(new THREE.BoxGeometry(2.35, 0.22, 0.32), trim, 0, 1.35, 0);
      } else {
        addPart(new THREE.BoxGeometry(4.0, 2.5, 1.1), mat, 0, 1.25, 0);
        addPart(new THREE.BoxGeometry(4.1, 0.25, 1.25), trim, 0, 2.6, 0);
        for (let i = -1.5; i <= 1.5; i += 1.0) {
          addPart(new THREE.BoxGeometry(0.52, 0.42, 0.32), mat, i, 2.9, 0.42);
        }
      }
      break;
    }
    case 'bridge': {
      addPart(new THREE.BoxGeometry(5.6, 0.42, 2.6), sandstone, 0, 0.65, 0);
      addPart(new THREE.BoxGeometry(5.6, 0.52, 0.26), marble, 0, 1.1, -1.18);
      addPart(new THREE.BoxGeometry(5.6, 0.52, 0.26), marble, 0, 1.1, 1.18);
      for (const px of [-2.2, 0, 2.2]) {
        addPart(new THREE.BoxGeometry(0.55, 1.1, 2.5), darkStone, px, 0.1, 0);
      }
      break;
    }
    case 'osiris_pyramid': {
      addPart(new THREE.ConeGeometry(2.7, 3.4, 4), sandstone, 0, 1.7, 0, 0, Math.PI / 4, 0);
      addPart(new THREE.ConeGeometry(0.56, 0.72, 4), bronze, 0, 3.15, 0, 0, Math.PI / 4, 0);
      addPart(new THREE.BoxGeometry(4.1, 0.28, 4.1), darkStone, 0, 0.14, 0);
      break;
    }
    case 'well_of_urd':
    case 'gaia_pool': {
      const poolMat = propKind === 'gaia_pool' ? new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x059669, emissiveIntensity: 0.75, roughness: 0.2 }) : waterGlow;
      addPart(new THREE.CylinderGeometry(1.7, 1.9, 0.5, 16), darkStone, 0, 0.25, 0);
      addPart(new THREE.CylinderGeometry(1.38, 1.38, 0.14, 16), poolMat, 0, 0.5, 0);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        addPart(new THREE.CylinderGeometry(0.14, 0.18, 1.6, 8), marble, Math.cos(a) * 1.45, 1.0, Math.sin(a) * 1.45);
      }
      break;
    }
    case 'torii_gate': {
      const crimson = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.48, metalness: 0.12 });
      addPart(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 10), crimson, -1.25, 1.6, 0);
      addPart(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 10), crimson, 1.25, 1.6, 0);
      addPart(new THREE.BoxGeometry(3.7, 0.26, 0.42), crimson, 0, 3.2, 0);
      addPart(new THREE.BoxGeometry(4.0, 0.16, 0.52), darkStone, 0, 3.4, 0);
      addPart(new THREE.BoxGeometry(2.8, 0.18, 0.28), crimson, 0, 2.55, 0);
      break;
    }
    case 'dwarven_forge': {
      addPart(new THREE.BoxGeometry(2.6, 1.3, 2.0), darkStone, 0, 0.65, 0);
      addPart(new THREE.CylinderGeometry(0.5, 0.75, 1.5, 8), darkStone, -0.7, 1.85, -0.4);
      addPart(new THREE.BoxGeometry(0.85, 0.45, 0.65), ember, 0.5, 1.0, 0.35);
      addPart(new THREE.BoxGeometry(0.7, 0.45, 0.4), bronze, 0.6, 0.5, 1.2);
      break;
    }
    case 'statue_poseidon':
    case 'statue_major_god':
    case 'statue_cyclops':
    case 'statue_hydra':
    case 'statue_lion': {
      const statueMat = propKind === 'statue_poseidon' || propKind === 'statue_major_god' ? bronze : marble;
      addPart(new THREE.BoxGeometry(1.85, 0.55, 1.85), darkStone, 0, 0.28, 0);
      addPart(new THREE.BoxGeometry(1.45, 0.42, 1.45), marble, 0, 0.74, 0);
      if (propKind === 'statue_lion') {
        addPart(new THREE.BoxGeometry(1.15, 0.65, 0.62), statueMat, 0, 1.28, 0);
        addPart(new THREE.SphereGeometry(0.38, 10, 10), statueMat, 0.58, 1.62, 0);
      } else if (propKind === 'statue_hydra') {
        addPart(new THREE.SphereGeometry(0.58, 10, 10), statueMat, 0, 1.45, 0);
        for (const ox of [-0.4, 0, 0.4]) {
          addPart(new THREE.CylinderGeometry(0.1, 0.15, 1.1, 8), statueMat, ox, 2.15, 0.2, 0.25, 0, ox * -0.4);
        }
      } else {
        addPart(new THREE.CylinderGeometry(0.36, 0.44, 1.45, 10), statueMat, 0, 1.68, 0);
        addPart(new THREE.SphereGeometry(0.3, 10, 10), statueMat, 0, 2.62, 0);
        addPart(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), bronze, 0.55, 2.15, 0.15);
      }
      break;
    }
    case 'columns': {
      addPart(new THREE.BoxGeometry(3.2, 0.26, 1.2), marble, 0, 0.13, 0);
      for (const ox of [-1.1, 0, 1.1]) {
        addPart(new THREE.CylinderGeometry(0.22, 0.26, 2.4, 10), marble, ox, 1.45, 0);
      }
      addPart(new THREE.BoxGeometry(3.1, 0.34, 0.9), marble, 0, 2.75, 0);
      break;
    }
    case 'ruins': {
      addPart(new THREE.BoxGeometry(2.6, 0.22, 2.2), darkStone, 0, 0.11, 0);
      addPart(new THREE.CylinderGeometry(0.22, 0.25, 1.4, 8), marble, -0.8, 0.9, -0.5);
      addPart(new THREE.CylinderGeometry(0.22, 0.25, 0.85, 8), marble, 0.85, 0.62, 0.45);
      addPart(new THREE.CylinderGeometry(0.2, 0.22, 1.5, 8), marble, 0.1, 0.32, 0.2, Math.PI / 2, 0.4, 0);
      break;
    }
    case 'tent': {
      addPart(new THREE.ConeGeometry(1.25, 1.7, 4), teamMat, 0, 0.85, 0, 0, Math.PI / 4, 0);
      addPart(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6), wood, 0, 1.0, 0);
      addPart(new THREE.BoxGeometry(0.45, 0.72, 0.1), darkStone, 0, 0.36, 0.88);
      break;
    }
    case 'torch': {
      addPart(new THREE.CylinderGeometry(0.1, 0.14, 1.6, 8), bronze, 0, 0.8, 0);
      addPart(new THREE.CylinderGeometry(0.28, 0.14, 0.25, 8), darkStone, 0, 1.65, 0);
      addPart(new THREE.ConeGeometry(0.22, 0.55, 8), ember, 0, 2.0, 0);
      break;
    }
    case 'flag': {
      addPart(new THREE.CylinderGeometry(0.06, 0.08, 2.6, 8), wood, 0, 1.3, 0);
      addPart(new THREE.BoxGeometry(0.95, 0.56, 0.06), teamMat, 0.48, 2.22, 0);
      addPart(new THREE.SphereGeometry(0.11, 8, 8), bronze, 0, 2.62, 0);
      break;
    }
    case 'fountain': {
      addPart(new THREE.CylinderGeometry(1.35, 1.5, 0.45, 14), marble, 0, 0.22, 0);
      addPart(new THREE.CylinderGeometry(1.12, 1.12, 0.1, 14), waterGlow, 0, 0.44, 0);
      addPart(new THREE.CylinderGeometry(0.24, 0.36, 1.1, 10), marble, 0, 0.95, 0);
      addPart(new THREE.CylinderGeometry(0.62, 0.22, 0.24, 12), marble, 0, 1.48, 0);
      break;
    }
    case 'fence_wood':
    case 'fence_stone':
    case 'fence_iron': {
      const fMat = propKind === 'fence_stone' ? darkStone : propKind === 'fence_iron' ? bronze : wood;
      addPart(new THREE.BoxGeometry(2.6, 0.82, 0.24), fMat, 0, 0.42, 0);
      for (const px of [-1.15, 0, 1.15]) {
        addPart(new THREE.BoxGeometry(0.22, 1.05, 0.28), fMat, px, 0.52, 0);
      }
      break;
    }
    case 'market_stall': {
      addPart(new THREE.BoxGeometry(1.8, 0.65, 1.1), wood, 0, 0.33, 0);
      for (const sx of [-0.82, 0.82]) {
        addPart(new THREE.CylinderGeometry(0.06, 0.06, 1.65, 6), wood, sx, 0.85, -0.46);
        addPart(new THREE.CylinderGeometry(0.06, 0.06, 1.65, 6), wood, sx, 0.85, 0.46);
      }
      addPart(new THREE.BoxGeometry(2.05, 0.14, 1.35), teamMat, 0, 1.72, 0, 0.14, 0, 0);
      break;
    }
    case 'sign': {
      addPart(new THREE.CylinderGeometry(0.07, 0.08, 1.3, 6), wood, 0, 0.65, 0);
      addPart(new THREE.BoxGeometry(0.95, 0.45, 0.08), wood, 0, 1.15, 0);
      break;
    }
    case 'dig_pile': {
      addPart(new THREE.ConeGeometry(1.15, 0.65, 9), sandstone, 0, 0.32, 0);
      addPart(new THREE.BoxGeometry(0.5, 0.35, 0.5), wood, 0.65, 0.22, 0.35);
      break;
    }
    case 'testing_dummy': {
      addPart(new THREE.CylinderGeometry(0.08, 0.1, 1.7, 8), wood, 0, 0.85, 0);
      addPart(new THREE.BoxGeometry(1.1, 0.14, 0.14), wood, 0, 1.25, 0);
      addPart(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 10), sandstone, 0, 1.15, 0);
      addPart(new THREE.SphereGeometry(0.22, 8, 8), bronze, 0, 1.68, 0);
      break;
    }
    case 'boulder':
    default: {
      addPart(new THREE.DodecahedronGeometry(0.95, 0), darkStone, 0, 0.62, 0, 0.2, 0.5, 0.1);
      addPart(new THREE.DodecahedronGeometry(0.55, 0), darkStone, 0.72, 0.36, 0.35, 0.4, 0.2, 0.3);
      break;
    }
  }

  return g;
}

export function buildPlacedScenarioObjectMesh(
  obj: PlacedScenarioObject,
  pal: MaterialPalette,
  playerPantheons: Record<number, PantheonId>,
  enableShadows: boolean
): THREE.Group {
  const team: TeamId = obj.playerSlot <= 1 ? 'player' : 'enemy';
  const pantheon: PantheonId = playerPantheons[obj.playerSlot] ?? 'greek';
  const colorStr = PLAYER_COLORS[(Math.max(1, obj.playerSlot) - 1) % PLAYER_COLORS.length];
  const accentHex = parseInt(colorStr.replace('#', ''), 16) || 0xd4af37;

  let mesh: THREE.Group;
  if (obj.kindType === 'unit' && obj.unitKind) {
    mesh = createUnitMesh(obj.unitKind, team, pal, enableShadows, pantheon);
  } else if (obj.kindType === 'building' && obj.buildingKind) {
    mesh = createBuildingMesh(obj.buildingKind, team, pal, enableShadows, pantheon);
  } else if (obj.kindType === 'tree') {
    mesh = createBiomeTreeMesh(obj.treeStyle ?? 'oak', pal, enableShadows, Math.abs(Math.round(obj.x * 13 + obj.z * 7)));
  } else if (obj.kindType === 'fauna' && obj.faunaKind) {
    mesh = createFaunaMesh(obj.faunaKind, pal, enableShadows);
  } else if (obj.kindType === 'resource') {
    if (obj.resourceKind === 'relic') {
      mesh = createRelicMesh(pal, enableShadows);
    } else if (obj.resourceKind === 'settlement') {
      mesh = createSettlementMesh(pal, enableShadows);
    } else if (obj.resourceKind === 'plenty_vault') {
      mesh = createPlentyVaultMesh(pal, enableShadows);
    } else if (obj.resourceKind === 'fish_spot') {
      mesh = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.08, 8, 20),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.85, roughness: 0.2 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.12;
      mesh.add(ring);
    } else {
      mesh = createResourceMesh(obj.resourceKind === 'berry' ? 'berry' : 'gold_mine', pal, enableShadows, 'mediterranean', 1);
    }
  } else {
    mesh = createEditorPropMesh(obj.propKind ?? 'boulder', accentHex);
  }

  mesh.scale.setScalar(obj.scale || 1);
  mesh.rotation.y = obj.rotationY || 0;
  mesh.userData.scenarioUid = obj.uid;
  return mesh;
}
