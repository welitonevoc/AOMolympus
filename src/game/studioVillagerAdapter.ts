import * as THREE from 'three';
import { PantheonId, TeamId, UnitKind } from './types';
import { buildGreekVillager } from '../civilizacao/gregos/greekVillagerModel';
import { buildNorseWorker } from '../civilizacao/nordicos/norseVillagerModel';
import { buildEgyptianLaborer } from '../civilizacao/egipcios/egyptianVillagerModel';
import {
  buildAtlanteanCitizen,
  buildAtlanteanLlama,
  AtlanteanLlamaInstance
} from '../civilizacao/atlantes/atlanteanVillagerModel';

export type StudioVillagerCiv = 'greek' | 'norse' | 'egyptian' | 'atlantean';
type StudioToolMode = 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir';

interface StudioArmRig {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
}

interface StudioLegRig {
  hip: THREE.Group;
  knee: THREE.Group;
  ankle: THREE.Group;
}

interface StudioVillagerRig {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: { L: StudioLegRig; R: StudioLegRig };
  rightArm: StudioArmRig;
  leftArm: StudioArmRig;
  setToolMode: (task: StudioToolMode) => void;
  setHeroState?: (isHero: boolean) => void;
  isFemale: boolean;
  isDwarf?: boolean;
  baseHipY: number;
}

const genderCounters: Record<StudioVillagerCiv, number> = {
  greek: 0,
  norse: 0,
  egyptian: 0,
  atlantean: 0
};

function normalizeGodKey(majorGod?: string): string {
  return (majorGod || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function resolveGreekGod(majorGod?: string): 'zeus' | 'poseidon' | 'hades' {
  const g = normalizeGodKey(majorGod);
  if (g.includes('poseidon')) return 'poseidon';
  if (g.includes('hades')) return 'hades';
  return 'zeus';
}

function resolveNorseGod(majorGod?: string): 'odin' | 'thor' | 'loki' | 'freyr' {
  const g = normalizeGodKey(majorGod);
  if (g.includes('thor')) return 'thor';
  if (g.includes('loki')) return 'loki';
  if (g.includes('freyr') || g.includes('frey')) return 'freyr';
  return 'odin';
}

function resolveEgyptianGod(majorGod?: string): 'ra' | 'isis' | 'set' {
  const g = normalizeGodKey(majorGod);
  if (g.includes('isis')) return 'isis';
  if (g === 'set' || g.includes('seth')) return 'set';
  return 'ra';
}

function resolveAtlanteanGod(majorGod?: string): 'kronos' | 'oranos' | 'gaia' {
  const g = normalizeGodKey(majorGod);
  if (g.includes('oranos') || g.includes('urano')) return 'oranos';
  if (g.includes('gaia')) return 'gaia';
  return 'kronos';
}

export function resolveStudioVillagerCiv(
  kind: UnitKind,
  lookStyle: string,
  pantheon: PantheonId
): StudioVillagerCiv | null {
  if (kind === 'norse_dwarf') return 'norse';
  if (kind === 'citizen') return 'atlantean';
  if (kind !== 'villager') return null;

  if (lookStyle === 'greek' || pantheon === 'greek') return 'greek';
  if (lookStyle === 'norse' || pantheon === 'norse' || pantheon === 'jotunn') return 'norse';
  if (lookStyle === 'egyptian' || pantheon === 'egyptian') return 'egyptian';
  if (lookStyle === 'atlantean' || pantheon === 'atlantean') return 'atlantean';
  return null;
}

export interface StudioVillagerGameplayResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
}

/**
 * Wraps the high-detail 3D Studio villager models (Greek, Norse + Dwarf,
 * Egyptian, Atlantean Citizen + Pack Llama) into a gameplay-ready unit mesh
 * with full RTS animation state mapping, dynamic tool switching, team visual
 * distinction, and Atlantean Hero promotion support.
 */
export function createStudioVillagerGameplayMesh(
  civ: StudioVillagerCiv,
  kind: UnitKind,
  team: TeamId,
  teamMat: THREE.Material,
  enableShadows: boolean,
  majorGod?: string
): StudioVillagerGameplayResult {
  const wrapper = new THREE.Group();
  const modelHolder = new THREE.Group();
  wrapper.add(modelHolder);

  // Align studio model height (~2.12u grounded) cleanly with gameplay military & building scale (~1.70u)
  const MODEL_SCALE = 0.80;
  modelHolder.scale.setScalar(MODEL_SCALE);
  // In all 4 studio villager rigs, pelvis is at y=+0.88 inside `body` and sandal/boot soles
  // sit at y=-0.126 inside `body`, so `body.position.y = 0.126 * scaleY` plants feet flush at y=0.
  const GROUNDED_BODY_Y_FACTOR = 0.126;

  let rig: StudioVillagerRig;
  let llama: AtlanteanLlamaInstance | null = null;
  let markerRadius = 0.44;
  let barHeight = 1.98;
  let barWidth = 1.0;

  if (civ === 'greek') {
    const isFemale = genderCounters.greek++ % 2 === 1;
    const godKey = resolveGreekGod(majorGod);
    const built = buildGreekVillager(isFemale, godKey, enableShadows);
    rig = {
      root: built.root,
      body: built.body,
      torso: built.torso,
      head: built.head,
      legs: built.legs,
      rightArm: built.rightArm,
      leftArm: built.leftArm,
      setToolMode: built.setToolMode,
      isFemale: built.isFemale,
      baseHipY: GROUNDED_BODY_Y_FACTOR * built.heightScale
    };
    modelHolder.add(built.root);
  } else if (civ === 'norse') {
    const godKey = resolveNorseGod(majorGod);
    const role: 'homem' | 'mulher' | 'anao' =
      kind === 'norse_dwarf'
        ? 'anao'
        : genderCounters.norse++ % 2 === 1
          ? 'mulher'
          : 'homem';
    const built = buildNorseWorker(role, godKey, enableShadows);
    rig = {
      root: built.root,
      body: built.body,
      torso: built.torso,
      head: built.head,
      legs: built.legs,
      rightArm: built.rightArm,
      leftArm: built.leftArm,
      setToolMode: built.setToolMode,
      isFemale: built.isFemale,
      isDwarf: built.isDwarf,
      baseHipY: GROUNDED_BODY_Y_FACTOR * built.baseHipY
    };
    modelHolder.add(built.root);
    if (role === 'anao') {
      markerRadius = 0.42;
      barHeight = 1.52;
      barWidth = 0.96;
    }
  } else if (civ === 'egyptian') {
    const isFemale = genderCounters.egyptian++ % 2 === 1;
    const godKey = resolveEgyptianGod(majorGod);
    const built = buildEgyptianLaborer(isFemale, godKey, enableShadows);
    rig = {
      root: built.root,
      body: built.body,
      torso: built.torso,
      head: built.head,
      legs: built.legs,
      rightArm: built.rightArm,
      leftArm: built.leftArm,
      setToolMode: built.setToolMode,
      isFemale: built.isFemale,
      baseHipY: GROUNDED_BODY_Y_FACTOR * built.heightScale
    };
    modelHolder.add(built.root);
  } else {
    // Atlantean Citizen + Companion Pack Llama
    const isFemale = genderCounters.atlantean++ % 2 === 1;
    const godKey = resolveAtlanteanGod(majorGod);
    const built = buildAtlanteanCitizen(isFemale, godKey, enableShadows);
    rig = {
      root: built.root,
      body: built.body,
      torso: built.torso,
      head: built.head,
      legs: built.legs,
      rightArm: built.rightArm,
      leftArm: built.leftArm,
      setToolMode: built.setToolMode,
      setHeroState: built.setHeroState,
      isFemale: built.isFemale,
      baseHipY: GROUNDED_BODY_Y_FACTOR * built.heightScale
    };
    modelHolder.add(built.root);

    llama = buildAtlanteanLlama(godKey, enableShadows);
    llama.root.position.set(-0.74, 0, -0.34);
    llama.root.scale.setScalar(0.84);
    modelHolder.add(llama.root);

    markerRadius = 0.56;
    barHeight = 2.02;
    barWidth = 1.1;
  }

  // Immediately ground the villager's feet at y = 0 before the first animation tick
  rig.body.position.y = rig.baseHipY;

  // Subtle team-color shoulder sash on enemy villagers for crisp battlefield readability even in mirror matchups
  if (team === 'enemy') {
    const enemySash = new THREE.Mesh(
      new THREE.TorusGeometry(0.195, 0.028, 8, 18),
      teamMat
    );
    enemySash.position.set(0, 0.24, 0);
    enemySash.rotation.set(0.45, 0, 0.62);
    if (enableShadows) enemySash.castShadow = true;
    rig.torso.add(enemySash);
  }

  let animTime = Math.random() * Math.PI * 2;
  let lastToolMode: StudioToolMode | null = null;
  const applyToolMode = (mode: StudioToolMode) => {
    if (lastToolMode !== mode) {
      lastToolMode = mode;
      rig.setToolMode(mode);
    }
  };
  applyToolMode('vigilia');

  wrapper.userData.leftLeg = rig.legs.L.hip;
  wrapper.userData.rightLeg = rig.legs.R.hip;
  wrapper.userData.leftArm = rig.leftArm.arm;
  wrapper.userData.rightArm = rig.rightArm.arm;

  if (rig.setHeroState) {
    wrapper.userData.setHeroVisual = (isHero: boolean) => {
      rig.setHeroState?.(isHero);
    };
  }

  wrapper.userData.animatePose = (
    dt: number,
    moving: boolean,
    speed = 2.8,
    attackT: number | null = null,
    state = 'idle',
    resourceType: 'wood' | 'gold' | 'food' | null = null,
    carryAmount = 0
  ) => {
    const safeDt = Math.min(0.06, Math.max(0.001, dt));
    animTime += safeDt;

    const isCarrying = carryAmount > 0 || state === 'return';
    const isAttacking = state === 'attack' || attackT !== null;
    const isBuilding = state === 'build';
    const isGathering = state === 'gather' || state === 'hunt';
    const isWalking = moving || state === 'move' || state === 'return';

    let desiredTool: StudioToolMode = 'vigilia';
    if (isBuilding) {
      desiredTool = 'construir';
    } else if (isAttacking) {
      desiredTool = 'madeira';
    } else if (isGathering) {
      if (resourceType === 'gold') desiredTool = 'ouro';
      else if (resourceType === 'food') desiredTool = 'fruta';
      else desiredTool = 'madeira';
    } else if (isCarrying) {
      desiredTool = 'fruta';
    } else if (isWalking) {
      desiredTool = 'andar';
    }
    applyToolMode(desiredTool);

    const breath = Math.sin(animTime * 2.3) * 0.016;
    let bodyYOffset = 0;
    let pitch = 0;
    let torsoYaw = 0;

    if ((moving && !isAttacking) || (isWalking && !isGathering && !isBuilding && !isAttacking)) {
      const strideRate = Math.max(4.4, Math.min(9.5, speed * 2.15));
      const stride = animTime * strideRate;
      const sinS = Math.sin(stride);
      const cosS = Math.cos(stride);

      bodyYOffset = Math.abs(cosS) * 0.022;
      pitch = 0.06;
      torsoYaw = sinS * 0.08;

      rig.legs.L.hip.rotation.set(-0.12 + sinS * 0.38, 0, 0);
      rig.legs.L.knee.rotation.set(0.18 + Math.max(0, -cosS) * 0.36, 0, 0);
      rig.legs.R.hip.rotation.set(-0.12 - sinS * 0.38, 0, 0);
      rig.legs.R.knee.rotation.set(0.18 + Math.max(0, cosS) * 0.36, 0, 0);

      if (isCarrying) {
        // Hold resource basket steadily in left arm while walking back to dropsite
        rig.leftArm.arm.rotation.set(-0.56, -0.24, -0.22);
        rig.leftArm.elbow.rotation.set(-1.02, -0.18, 0.18);
        rig.rightArm.arm.rotation.set(-0.2 - sinS * 0.28, 0.08, 0.14);
        rig.rightArm.elbow.rotation.set(-0.32, 0, 0.08);
      } else {
        rig.rightArm.arm.rotation.set(-0.15 - sinS * 0.36, 0.08, 0.14);
        rig.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
        rig.leftArm.arm.rotation.set(-0.15 + sinS * 0.36, -0.08, -0.14);
        rig.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
      }

      rig.head.rotation.set(0, Math.sin(stride * 0.5) * 0.04, 0);
    } else if (isBuilding || isAttacking || (isGathering && desiredTool !== 'fruta')) {
      const swingSpeed = isAttacking ? 7.2 : isBuilding ? 5.6 : 4.1;
      const strike =
        attackT !== null
          ? Math.sin(attackT * Math.PI * 2)
          : Math.sin(animTime * swingSpeed);

      pitch = 0.14 + strike * 0.16;
      torsoYaw = -0.16 + strike * 0.28;

      rig.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
      rig.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
      rig.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
      rig.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

      rig.legs.L.hip.rotation.set(-0.22, -0.1, -0.06);
      rig.legs.L.knee.rotation.set(0.28, 0, 0);
      rig.legs.R.hip.rotation.set(0.18, 0.1, 0.06);
      rig.legs.R.knee.rotation.set(0.22, 0, 0);
      rig.head.rotation.set(0.08 + strike * 0.05, 0, 0);
    } else if (isGathering && desiredTool === 'fruta') {
      const pick = Math.sin(animTime * 3.6);
      pitch = 0.22 + pick * 0.08;
      torsoYaw = pick * 0.18;

      rig.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
      rig.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

      rig.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
      rig.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

      rig.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
      rig.legs.L.knee.rotation.set(0.26, 0, 0);
      rig.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
      rig.legs.R.knee.rotation.set(0.22, 0, 0);
      rig.head.rotation.set(0.14, pick * 0.08, 0);
    } else {
      // Idle / vigil pose
      rig.rightArm.arm.rotation.set(-0.14, 0.08, 0.16 + Math.sin(animTime * 1.8) * 0.02);
      rig.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
      if (isCarrying) {
        rig.leftArm.arm.rotation.set(-0.54, -0.26, -0.22);
        rig.leftArm.elbow.rotation.set(-1.02, -0.18, 0.18);
      } else {
        rig.leftArm.arm.rotation.set(-0.14, -0.08, -0.16 - Math.cos(animTime * 1.8) * 0.02);
        rig.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);
      }

      rig.legs.L.hip.rotation.set(-0.1, -0.06, -0.04);
      rig.legs.L.knee.rotation.set(0.14, 0, 0);
      rig.legs.R.hip.rotation.set(0.08, 0.06, 0.04);
      rig.legs.R.knee.rotation.set(0.12, 0, 0);
      rig.head.rotation.set(0, Math.sin(animTime * 0.7) * 0.12, 0);
    }

    modelHolder.position.y = bodyYOffset * MODEL_SCALE;
    rig.body.position.y = rig.baseHipY + breath;
    rig.body.rotation.set(pitch, torsoYaw, 0);

    // Animate Atlantean companion pack Llama in sync with the Citizen
    if (llama) {
      if (isWalking) {
        const llamaStride = animTime * Math.max(4.6, Math.min(9.0, speed * 2.05));
        llama.body.position.y = 0.82 + Math.abs(Math.sin(llamaStride)) * 0.035;
        llama.neck.rotation.x = 0.08 + Math.sin(llamaStride) * 0.09;
        llama.head.rotation.y = Math.cos(llamaStride * 0.5) * 0.08;
        llama.legs.forEach((leg) => {
          leg.pivot.rotation.x = Math.sin(llamaStride + leg.phase) * 0.34;
        });
      } else {
        llama.body.position.y = 0.82 + Math.sin(animTime * 2.1) * 0.012;
        llama.neck.rotation.x = Math.sin(animTime * 1.4) * 0.05;
        llama.head.rotation.y = Math.sin(animTime * 0.9) * 0.14;
        llama.legs.forEach((leg) => {
          leg.pivot.rotation.x *= 0.85;
        });
      }
    }
  };

  return {
    group: wrapper,
    markerRadius,
    barHeight,
    barWidth
  };
}
