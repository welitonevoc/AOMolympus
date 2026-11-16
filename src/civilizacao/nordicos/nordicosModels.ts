import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';

export function createNorseUnitMesh(kind: string, team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  return root;
}
