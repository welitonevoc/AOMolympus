import * as THREE from 'three';
import { createGreekUnitMesh } from '../../civilizacao/gregos/gregosModels';
import {
  animateZeusHoplite,
  buildZeusHoplite,
  createZeusHopliteArena,
  getCachedZeusHopliteTextures,
  HopliteTierId,
  ZeusHopliteAction,
} from '../../civilizacao/gregos/zeusHopliteModel';
import {
  animatePoseidonHoplite,
  buildPoseidonHoplite,
  createPoseidonHopliteArena,
  getCachedPoseidonHopliteTextures,
  PoseidonHopliteAction,
} from '../../civilizacao/gregos/poseidonHopliteModel';
import {
  animateHadesHoplite,
  buildHadesHoplite,
  createHadesHopliteArena,
  getCachedHadesHopliteTextures,
  HadesHopliteAction,
} from '../../civilizacao/gregos/hadesHopliteModel';
import {
  buildGreekVillager,
  GOD_VILLAGER_THEMES,
  GreekVillagerInstance,
} from '../../civilizacao/gregos/greekVillagerModel';
import {
  buildNorseWorker,
  NORSE_GOD_THEMES,
  NorseWorkerInstance,
  NorseWorkerRole,
  NorseWorkerTask,
} from '../../civilizacao/nordicos/norseVillagerModel';
import {
  ATLANTEAN_GOD_THEMES,
  AtlanteanAction,
  AtlanteanCitizenInstance,
  AtlanteanLlamaInstance,
  buildAtlanteanCitizen,
  buildAtlanteanLlama,
} from '../../civilizacao/atlantes/atlanteanVillagerModel';
import {
  buildEgyptianLaborer,
  EGYPTIAN_GOD_THEMES,
  EgyptianLaborerAction,
  EgyptianLaborerInstance,
} from '../../civilizacao/egipcios/egyptianVillagerModel';
import { createUnitMesh, MaterialPalette } from '../../game/models';
import { PantheonId, UnitKind } from '../../game/types';
import { InspectableUnitId } from '../gallery3dCatalog';

export interface HumanUnitStudioBuildContext {
  scene: THREE.Scene;
  environmentGroup: THREE.Group;
  defaultBg: THREE.Color;
  pal: MaterialPalette;
  isSoftwareGl: boolean;
  selectedCiv: PantheonId;
  selectedMajorGod: string;
  selectedUnit: InspectableUnitId;
  activeTier: 1 | 2 | 3 | 4;
  getSimTime: () => number;
  addPedestal: (radiusTop: number, radiusBottom: number, ringColor: number) => void;
  spawnSpark: (p: THREE.Vector3) => void;
  hopliteActionRef: { current: ZeusHopliteAction };
  villagerGenderRef: { current: 'homem' | 'mulher' | 'ambos' };
  villagerTaskRef: { current: 'vigilia' | 'andar' | 'madeira' | 'ouro' | 'fruta' | 'construir' };
  norseWorkerModeRef: { current: NorseWorkerRole | 'todos' };
  norseWorkerTaskRef: { current: NorseWorkerTask };
  egyptianLaborerGenderRef: { current: 'homem' | 'mulher' | 'ambos' };
  egyptianLaborerTaskRef: { current: EgyptianLaborerAction };
  atlanteanCitizenModeRef: { current: 'todos' | 'homem' | 'mulher' };
  atlanteanCitizenTaskRef: { current: AtlanteanAction };
  atlanteanIsHeroRef: { current: boolean };
  myrmidonFuryRef: { current: boolean };
}

function markHopliteTexShared(texBag: Record<string, unknown>): void {
  for (const val of Object.values(texBag)) {
    if (val instanceof THREE.Texture) {
      val.userData.shared = true;
    }
  }
}

export function buildHumanUnitStudioSubject(ctx: HumanUnitStudioBuildContext): THREE.Group | null {
  const {
    scene,
    environmentGroup,
    defaultBg,
    pal,
    isSoftwareGl,
    selectedCiv,
    selectedMajorGod,
    selectedUnit,
    activeTier,
    getSimTime,
    addPedestal,
    spawnSpark,
    hopliteActionRef,
    villagerGenderRef,
    villagerTaskRef,
    norseWorkerModeRef,
    norseWorkerTaskRef,
    egyptianLaborerGenderRef,
    egyptianLaborerTaskRef,
    atlanteanCitizenModeRef,
    atlanteanCitizenTaskRef,
    atlanteanIsHeroRef,
    myrmidonFuryRef,
  } = ctx;

  if (selectedCiv === 'greek' && selectedUnit === 'hoplite') {
    if (selectedMajorGod === 'Poseidon') {
      scene.background = new THREE.Color(0x062336);
      scene.fog = new THREE.FogExp2(0x062336, 0.02);

      const pTex = getCachedPoseidonHopliteTextures();
      markHopliteTexShared(pTex as unknown as Record<string, unknown>);
      const hopliteRig = buildPoseidonHoplite(pTex, (activeTier as HopliteTierId) || 3);
      const group = hopliteRig.root;
      group.scale.setScalar(0.95);
      const arena = createPoseidonHopliteArena(pTex);
      environmentGroup.add(arena);

      group.userData.setArmorTier = (tier: number) => {
        hopliteRig.setTier(tier as HopliteTierId);
      };
      group.userData.animatePose = (dt: number) => {
        animatePoseidonHoplite(
          hopliteRig,
          dt,
          getSimTime(),
          hopliteActionRef.current as PoseidonHopliteAction,
          (p) => spawnSpark(p)
        );
      };
      return group;
    }

    if (selectedMajorGod === 'Hades') {
      scene.background = new THREE.Color(0x090712);
      scene.fog = new THREE.FogExp2(0x090712, 0.022);

      const hTex = getCachedHadesHopliteTextures();
      markHopliteTexShared(hTex as unknown as Record<string, unknown>);
      const hopliteRig = buildHadesHoplite(hTex, (activeTier as HopliteTierId) || 3);
      const group = hopliteRig.root;
      group.scale.setScalar(0.95);
      const { arena, torches } = createHadesHopliteArena(hTex);
      environmentGroup.add(arena);

      group.userData.setArmorTier = (tier: number) => {
        hopliteRig.setTier(tier as HopliteTierId);
      };
      group.userData.animatePose = (dt: number) => {
        const simTime = getSimTime();
        torches.forEach((tr) => {
          tr.mesh.scale.set(
            1 + Math.sin(simTime * 11 + tr.phase) * 0.15,
            1 + Math.cos(simTime * 13 + tr.phase) * 0.22,
            1
          );
        });
        animateHadesHoplite(
          hopliteRig,
          dt,
          simTime,
          hopliteActionRef.current as HadesHopliteAction,
          (p) => spawnSpark(p)
        );
      };
      return group;
    }

    scene.background = new THREE.Color(0x132644);
    scene.fog = new THREE.FogExp2(0x132644, 0.02);

    const hTex = getCachedZeusHopliteTextures();
    markHopliteTexShared(hTex as unknown as Record<string, unknown>);
    const hopliteRig = buildZeusHoplite(hTex, (activeTier as HopliteTierId) || 3);
    const group = hopliteRig.root;
    group.scale.setScalar(0.95);
    const arena = createZeusHopliteArena(hTex);
    environmentGroup.add(arena);

    group.userData.setArmorTier = (tier: number) => {
      hopliteRig.setTier(tier as HopliteTierId);
    };
    group.userData.animatePose = (dt: number) => {
      animateZeusHoplite(hopliteRig, dt, getSimTime(), hopliteActionRef.current, (p) => spawnSpark(p));
    };
    return group;
  }

  if (selectedCiv === 'greek' && selectedUnit === 'villager') {
    const godKey = (
      selectedMajorGod === 'Poseidon'
        ? 'poseidon'
        : selectedMajorGod === 'Hades'
        ? 'hades'
        : 'zeus'
    ) as 'zeus' | 'poseidon' | 'hades';
    const theme = GOD_VILLAGER_THEMES[godKey] || GOD_VILLAGER_THEMES.zeus;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
    addPedestal(2.2, 2.4, theme.accentHex);

    const maleVillager = buildGreekVillager(false, godKey, !isSoftwareGl);
    const femaleVillager = buildGreekVillager(true, godKey, !isSoftwareGl);
    const villagerRoot = new THREE.Group();
    villagerRoot.add(maleVillager.root);
    villagerRoot.add(femaleVillager.root);

    const animateStudioVillager = (
      v: GreekVillagerInstance,
      _dt: number,
      t: number,
      offsetX: number,
      phaseOffset: number,
      task: string
    ) => {
      if (!v.root.visible) return;

      let vx = offsetX;
      let vz = 0;
      let vy = 0;
      let yaw = 0;
      let pitch = 0;
      let torsoYaw = 0;
      const breath = Math.sin(t * 2.3 + phaseOffset) * 0.018;

      if (task === 'andar') {
        const a = t * 0.95 + phaseOffset;
        const R = v.isFemale ? 1.6 : 2.0;
        vx = Math.cos(a) * R;
        vz = Math.sin(a) * R;
        yaw = -a;
        pitch = 0.06;

        const stride = t * 5.6 + phaseOffset;
        const sinS = Math.sin(stride);
        const cosS = Math.cos(stride);
        vy = Math.abs(cosS) * 0.04;
        torsoYaw = sinS * 0.08;

        v.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
        v.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
        v.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
        v.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

        v.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
        v.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
        v.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
        v.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
      } else if (task === 'madeira' || task === 'ouro' || task === 'construir') {
        vx = offsetX;
        vz = 0.25;
        yaw = v.isFemale ? -0.22 : 0.22;

        const speed = task === 'construir' ? 5.2 : 3.8;
        const swing = (t * speed + phaseOffset) % (Math.PI * 2);
        const strike = Math.sin(swing);

        pitch = 0.14 + strike * 0.16;
        torsoYaw = -0.18 + strike * 0.28;

        v.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
        v.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
        v.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
        v.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

        v.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
        v.legs.L.knee.rotation.set(0.28, 0, 0);
        v.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
        v.legs.R.knee.rotation.set(0.22, 0, 0);

        if (strike > 0.92) {
          spawnSpark(new THREE.Vector3(vx, 0.6, 0.8));
        }
      } else if (task === 'fruta') {
        vx = offsetX;
        vz = 0.28;
        yaw = v.isFemale ? -0.20 : 0.20;

        const pick = Math.sin(t * 3.4 + phaseOffset);
        pitch = 0.22 + pick * 0.08;
        torsoYaw = pick * 0.18;

        v.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
        v.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

        v.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
        v.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

        v.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
        v.legs.L.knee.rotation.set(0.26, 0, 0);
        v.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
        v.legs.R.knee.rotation.set(0.22, 0, 0);
      } else {
        vx = offsetX;
        vz = 0;
        yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (v.isFemale ? -0.14 : 0.14);

        v.rightArm.arm.rotation.set(-0.14, 0.08, 0.16 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
        v.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
        v.leftArm.arm.rotation.set(-0.14, -0.08, -0.16 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
        v.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

        v.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
        v.legs.L.knee.rotation.set(0.16, 0, 0);
        v.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
        v.legs.R.knee.rotation.set(0.14, 0, 0);
      }

      v.root.position.set(vx, vy, vz);
      v.root.rotation.set(0, yaw, 0);
      v.body.position.y = 1.00 * v.heightScale + breath;
      v.body.rotation.set(pitch, torsoYaw, 0);
    };

    villagerRoot.userData.animatePose = (dt: number) => {
      const currentGender = villagerGenderRef.current;
      const currentTask = villagerTaskRef.current;

      maleVillager.root.visible = currentGender === 'ambos' || currentGender === 'homem';
      femaleVillager.root.visible = currentGender === 'ambos' || currentGender === 'mulher';

      maleVillager.setToolMode(currentTask);
      femaleVillager.setToolMode(currentTask);

      const maleOffset = currentGender === 'ambos' ? -0.58 : 0;
      const femaleOffset = currentGender === 'ambos' ? 0.58 : 0;

      const t = getSimTime();
      animateStudioVillager(maleVillager, dt, t, maleOffset, 0, currentTask);
      animateStudioVillager(femaleVillager, dt, t, femaleOffset, 1.4, currentTask);
    };

    return villagerRoot;
  }

  if (selectedCiv === 'norse' && (selectedUnit === 'villager' || selectedUnit === 'norse_dwarf')) {
    const godKey =
      selectedMajorGod.toLowerCase() === 'thor'
        ? 'thor'
        : selectedMajorGod.toLowerCase() === 'loki'
        ? 'loki'
        : selectedMajorGod.toLowerCase() === 'freyr'
        ? 'freyr'
        : 'odin';
    const theme = NORSE_GOD_THEMES[godKey] || NORSE_GOD_THEMES.odin;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
    addPedestal(2.4, 2.6, theme.ringHex);

    const norseMan = buildNorseWorker('homem', godKey, !isSoftwareGl);
    const norseWoman = buildNorseWorker('mulher', godKey, !isSoftwareGl);
    const norseDwarf = buildNorseWorker('anao', godKey, !isSoftwareGl);

    const norseWorkerRoot = new THREE.Group();
    norseWorkerRoot.add(norseMan.root, norseWoman.root, norseDwarf.root);

    const animateStudioNorseWorker = (
      w: NorseWorkerInstance,
      _dt: number,
      t: number,
      slotOffsetX: number,
      phaseOffset: number,
      currentTask: NorseWorkerTask,
      currentMode: string
    ) => {
      if (!w.root.visible) return;

      let vx = slotOffsetX;
      let vz = 0;
      let vy = 0;
      let yaw = 0;
      let pitch = 0;
      let torsoYaw = 0;
      const breath = Math.sin(t * 2.3 + phaseOffset) * 0.016;

      if (currentTask === 'andar') {
        const a = t * 0.95 + phaseOffset;
        const R = w.isDwarf ? 1.6 : w.isFemale ? 1.9 : 2.2;
        vx = Math.cos(a) * R;
        vz = Math.sin(a) * R;
        yaw = -a;
        pitch = 0.06;

        const stepFreq = w.isDwarf ? 7.2 : 5.6;
        const stride = t * stepFreq + phaseOffset;
        const sinS = Math.sin(stride);
        const cosS = Math.cos(stride);
        vy = Math.abs(cosS) * 0.04;
        torsoYaw = sinS * 0.09;

        w.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
        w.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
        w.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
        w.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

        w.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
        w.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
        w.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
        w.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
      } else if (currentTask === 'madeira' || currentTask === 'ouro' || currentTask === 'construir') {
        vx = currentMode === 'todos' ? slotOffsetX : 0;
        vz = 0.25;
        yaw = currentMode === 'todos' ? -slotOffsetX * 0.45 : 0;

        const speed = w.isDwarf && currentTask === 'ouro' ? 5.6 : currentTask === 'construir' ? 5.0 : 3.9;
        const swing = (t * speed + phaseOffset) % (Math.PI * 2);
        const strike = Math.sin(swing);

        pitch = 0.14 + strike * 0.16;
        torsoYaw = -0.18 + strike * 0.28;

        w.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
        w.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
        w.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
        w.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

        w.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
        w.legs.L.knee.rotation.set(0.28, 0, 0);
        w.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
        w.legs.R.knee.rotation.set(0.22, 0, 0);

        if (strike > 0.92) {
          spawnSpark(new THREE.Vector3(vx, 0.5, 0.8));
        }
      } else if (currentTask === 'fruta') {
        vx = currentMode === 'todos' ? slotOffsetX : 0;
        vz = 0.28;
        yaw = currentMode === 'todos' ? -slotOffsetX * 0.45 : 0;

        const pick = Math.sin(t * 3.4 + phaseOffset);
        pitch = 0.22 + pick * 0.08;
        torsoYaw = pick * 0.18;

        w.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
        w.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

        w.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
        w.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

        w.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
        w.legs.L.knee.rotation.set(0.26, 0, 0);
        w.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
        w.legs.R.knee.rotation.set(0.22, 0, 0);
      } else {
        vx = currentMode === 'todos' ? slotOffsetX : 0;
        vz = currentMode === 'todos' && w.isDwarf ? 0.18 : 0;
        yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (currentMode === 'todos' ? -slotOffsetX * 0.18 : 0);

        w.rightArm.arm.rotation.set(-0.14, 0.08, 0.18 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
        w.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
        w.leftArm.arm.rotation.set(-0.14, -0.08, -0.18 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
        w.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

        w.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
        w.legs.L.knee.rotation.set(0.16, 0, 0);
        w.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
        w.legs.R.knee.rotation.set(0.14, 0, 0);
      }

      w.root.position.set(vx, vy, vz);
      w.root.rotation.set(0, yaw, 0);
      w.body.position.y = w.baseHipY + breath;
      w.body.rotation.set(pitch, torsoYaw, 0);
    };

    norseWorkerRoot.userData.animatePose = (dt: number) => {
      const currentMode = norseWorkerModeRef.current;
      const currentTask = norseWorkerTaskRef.current;

      const isSpecificDwarfUnit = selectedUnit === 'norse_dwarf';
      const effMode = isSpecificDwarfUnit && currentMode === 'todos' ? 'anao' : currentMode;

      norseMan.root.visible = effMode === 'todos' || effMode === 'homem';
      norseWoman.root.visible = effMode === 'todos' || effMode === 'mulher';
      norseDwarf.root.visible = effMode === 'todos' || effMode === 'anao';

      norseMan.setToolMode(currentTask);
      norseWoman.setToolMode(currentTask);
      norseDwarf.setToolMode(currentTask);

      const t = getSimTime();
      animateStudioNorseWorker(norseMan, dt, t, -0.82, 0, currentTask, effMode);
      animateStudioNorseWorker(norseDwarf, dt, t, 0.0, 0.9, currentTask, effMode);
      animateStudioNorseWorker(norseWoman, dt, t, 0.82, 1.8, currentTask, effMode);
    };

    return norseWorkerRoot;
  }

  if (selectedCiv === 'egyptian' && selectedUnit === 'villager') {
    const godKey = (
      selectedMajorGod.toLowerCase() === 'isis' || selectedMajorGod.toLowerCase() === 'ísis'
        ? 'isis'
        : selectedMajorGod.toLowerCase() === 'set'
        ? 'set'
        : 'ra'
    ) as 'ra' | 'isis' | 'set';
    const theme = EGYPTIAN_GOD_THEMES[godKey] || EGYPTIAN_GOD_THEMES.ra;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
    addPedestal(2.2, 2.4, theme.accentHex);

    const maleLaborer = buildEgyptianLaborer(false, godKey, !isSoftwareGl);
    const femaleLaborer = buildEgyptianLaborer(true, godKey, !isSoftwareGl);
    const laborerRoot = new THREE.Group();
    laborerRoot.add(maleLaborer.root, femaleLaborer.root);

    const animateStudioEgyptianLaborer = (
      v: EgyptianLaborerInstance,
      _dt: number,
      t: number,
      offsetX: number,
      phaseOffset: number,
      task: EgyptianLaborerAction
    ) => {
      if (!v.root.visible) return;

      let vx = offsetX;
      let vz = 0;
      let vy = 0;
      let yaw = 0;
      let pitch = 0;
      let torsoYaw = 0;
      const breath = Math.sin(t * 2.3 + phaseOffset) * 0.018;

      if (task === 'andar') {
        const a = t * 0.95 + phaseOffset;
        const R = v.isFemale ? 1.6 : 2.0;
        vx = Math.cos(a) * R;
        vz = Math.sin(a) * R;
        yaw = -a;
        pitch = 0.06;

        const stride = t * 5.6 + phaseOffset;
        const sinS = Math.sin(stride);
        const cosS = Math.cos(stride);
        vy = Math.abs(cosS) * 0.04;
        torsoYaw = sinS * 0.08;

        v.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
        v.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
        v.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
        v.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

        v.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
        v.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
        v.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
        v.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
      } else if (task === 'madeira' || task === 'ouro' || task === 'construir') {
        vx = offsetX;
        vz = 0.25;
        yaw = v.isFemale ? -0.22 : 0.22;

        const speed = task === 'construir' ? 5.2 : 3.8;
        const swing = (t * speed + phaseOffset) % (Math.PI * 2);
        const strike = Math.sin(swing);

        pitch = 0.14 + strike * 0.16;
        torsoYaw = -0.18 + strike * 0.28;

        v.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
        v.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
        v.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
        v.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

        v.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
        v.legs.L.knee.rotation.set(0.28, 0, 0);
        v.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
        v.legs.R.knee.rotation.set(0.22, 0, 0);

        if (strike > 0.92) {
          spawnSpark(new THREE.Vector3(vx, 0.6, 0.8));
        }
      } else if (task === 'fruta') {
        vx = offsetX;
        vz = 0.28;
        yaw = v.isFemale ? -0.20 : 0.20;

        const pick = Math.sin(t * 3.4 + phaseOffset);
        pitch = 0.22 + pick * 0.08;
        torsoYaw = pick * 0.18;

        v.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
        v.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

        v.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
        v.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

        v.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
        v.legs.L.knee.rotation.set(0.26, 0, 0);
        v.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
        v.legs.R.knee.rotation.set(0.22, 0, 0);
      } else {
        vx = offsetX;
        vz = 0;
        yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (v.isFemale ? -0.14 : 0.14);

        v.rightArm.arm.rotation.set(-0.14, 0.08, 0.16 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
        v.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
        v.leftArm.arm.rotation.set(-0.14, -0.08, -0.16 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
        v.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

        v.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
        v.legs.L.knee.rotation.set(0.16, 0, 0);
        v.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
        v.legs.R.knee.rotation.set(0.14, 0, 0);
      }

      v.root.position.set(vx, vy, vz);
      v.root.rotation.set(0, yaw, 0);
      v.body.position.y = 1.00 * v.heightScale + breath;
      v.body.rotation.set(pitch, torsoYaw, 0);
    };

    laborerRoot.userData.animatePose = (dt: number) => {
      const currentGender = egyptianLaborerGenderRef.current;
      const currentTask = egyptianLaborerTaskRef.current;

      maleLaborer.root.visible = currentGender === 'ambos' || currentGender === 'homem';
      femaleLaborer.root.visible = currentGender === 'ambos' || currentGender === 'mulher';

      maleLaborer.setToolMode(currentTask);
      femaleLaborer.setToolMode(currentTask);

      const maleOffset = currentGender === 'ambos' ? -0.58 : 0;
      const femaleOffset = currentGender === 'ambos' ? 0.58 : 0;

      const t = getSimTime();
      animateStudioEgyptianLaborer(maleLaborer, dt, t, maleOffset, 0, currentTask);
      animateStudioEgyptianLaborer(femaleLaborer, dt, t, femaleOffset, 1.4, currentTask);
    };

    return laborerRoot;
  }

  if (selectedCiv === 'atlantean' && (selectedUnit === 'villager' || selectedUnit === 'citizen')) {
    const godKey = (
      selectedMajorGod.toLowerCase() === 'urano' || selectedMajorGod.toLowerCase() === 'oranos'
        ? 'oranos'
        : selectedMajorGod.toLowerCase() === 'gaia'
        ? 'gaia'
        : 'kronos'
    ) as 'kronos' | 'oranos' | 'gaia';
    const theme = ATLANTEAN_GOD_THEMES[godKey] || ATLANTEAN_GOD_THEMES.kronos;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.02);
    addPedestal(2.4, 2.6, theme.ringHex);

    const atlanteanMan = buildAtlanteanCitizen(false, godKey, !isSoftwareGl);
    const atlanteanWoman = buildAtlanteanCitizen(true, godKey, !isSoftwareGl);
    const atlanteanLlama = buildAtlanteanLlama(godKey, !isSoftwareGl);

    const atlanteanRoot = new THREE.Group();
    atlanteanRoot.add(atlanteanMan.root, atlanteanWoman.root, atlanteanLlama.root);

    const animateStudioAtlanteanCitizen = (
      c: AtlanteanCitizenInstance,
      dt: number,
      t: number,
      offsetX: number,
      phaseOffset: number,
      task: AtlanteanAction,
      mode: string,
      isHero: boolean
    ) => {
      if (!c.root.visible) return;

      let vx = offsetX;
      let vz = 0;
      let vy = 0;
      let yaw = 0;
      let pitch = 0;
      let torsoYaw = 0;
      const breath = Math.sin(t * 2.3 + phaseOffset) * 0.016;

      if (task === 'andar') {
        const a = t * 0.92 + phaseOffset * 0.4;
        const R = c.isFemale ? 1.6 : 2.0;
        vx = Math.cos(a) * R;
        vz = Math.sin(a) * R;
        yaw = -a;
        pitch = 0.06;

        const stride = t * 5.6 + phaseOffset;
        const sinS = Math.sin(stride);
        const cosS = Math.cos(stride);
        vy = Math.abs(cosS) * 0.04;
        torsoYaw = sinS * 0.08;

        c.legs.L.hip.rotation.x = -0.12 + sinS * 0.36;
        c.legs.L.knee.rotation.x = 0.18 + Math.max(0, -cosS) * 0.36;
        c.legs.R.hip.rotation.x = -0.12 - sinS * 0.36;
        c.legs.R.knee.rotation.x = 0.18 + Math.max(0, cosS) * 0.36;

        c.rightArm.arm.rotation.set(-0.15 - sinS * 0.35, 0.08, 0.14);
        c.rightArm.elbow.rotation.set(-0.25, 0, 0.08);
        c.leftArm.arm.rotation.set(-0.15 + sinS * 0.35, -0.08, -0.14);
        c.leftArm.elbow.rotation.set(-0.25, 0, -0.08);
      } else if (task === 'madeira' || task === 'ouro' || task === 'construir') {
        vx = mode === 'todos' ? offsetX : -0.25;
        vz = 0.25;
        yaw = mode === 'todos' ? -offsetX * 0.42 : 0.15;

        const speed = isHero ? 5.2 : 3.9;
        const swing = (t * speed + phaseOffset) % (Math.PI * 2);
        const strike = Math.sin(swing);

        pitch = 0.14 + strike * 0.16;
        torsoYaw = -0.18 + strike * 0.28;

        c.rightArm.arm.rotation.set(-1.35 + strike * 0.95, 0.18, 0.25);
        c.rightArm.elbow.rotation.set(-0.65 + strike * 0.35, 0.1, 0.1);
        c.leftArm.arm.rotation.set(-0.65 + strike * 0.35, -0.25, -0.22);
        c.leftArm.elbow.rotation.set(-0.85, -0.15, 0.15);

        c.legs.L.hip.rotation.set(-0.22, -0.10, -0.06);
        c.legs.L.knee.rotation.set(0.28, 0, 0);
        c.legs.R.hip.rotation.set(0.18, 0.10, 0.06);
        c.legs.R.knee.rotation.set(0.22, 0, 0);

        if (strike > 0.92) {
          spawnSpark(new THREE.Vector3(vx, 0.6, 0.8));
        }
      } else if (task === 'fruta') {
        vx = mode === 'todos' ? offsetX : -0.25;
        vz = 0.28;
        yaw = mode === 'todos' ? -offsetX * 0.42 : 0.15;

        const pick = Math.sin(t * 3.4 + phaseOffset);
        pitch = 0.22 + pick * 0.08;
        torsoYaw = pick * 0.18;

        c.leftArm.arm.rotation.set(-0.55, -0.28, -0.24);
        c.leftArm.elbow.rotation.set(-1.05, -0.2, 0.2);

        c.rightArm.arm.rotation.set(-0.95 - pick * 0.35, 0.22 - pick * 0.25, 0.22);
        c.rightArm.elbow.rotation.set(-0.55 - pick * 0.45, 0.15, 0.15);

        c.legs.L.hip.rotation.set(-0.18, -0.08, -0.04);
        c.legs.L.knee.rotation.set(0.26, 0, 0);
        c.legs.R.hip.rotation.set(0.16, 0.08, 0.04);
        c.legs.R.knee.rotation.set(0.22, 0, 0);
      } else {
        vx = offsetX;
        vz = 0;
        yaw = Math.sin(t * 0.45 + phaseOffset) * 0.12 + (mode === 'todos' ? -offsetX * 0.14 : 0);

        c.rightArm.arm.rotation.set(-0.14, 0.08, 0.16 + Math.sin(t * 1.8 + phaseOffset) * 0.02);
        c.rightArm.elbow.rotation.set(-0.32, 0.06, 0.08);
        c.leftArm.arm.rotation.set(-0.14, -0.08, -0.16 - Math.cos(t * 1.8 + phaseOffset) * 0.02);
        c.leftArm.elbow.rotation.set(-0.32, -0.06, -0.08);

        c.legs.L.hip.rotation.set(-0.12, -0.08, -0.04);
        c.legs.L.knee.rotation.set(0.16, 0, 0);
        c.legs.R.hip.rotation.set(0.10, 0.08, 0.04);
        c.legs.R.knee.rotation.set(0.14, 0, 0);
      }

      c.root.position.set(vx, vy, vz);
      c.root.rotation.set(0, yaw, 0);
      c.body.position.y = 1.00 * c.heightScale + breath;
      c.body.rotation.set(pitch, torsoYaw, 0);

      if (isHero) {
        c.heroGroundAura.rotation.z += dt * 1.6;
        c.heroGroundAura.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
      }
    };

    const animateStudioLlama = (
      llama: AtlanteanLlamaInstance,
      _dt: number,
      t: number,
      task: AtlanteanAction,
      mode: string
    ) => {
      let lx = mode === 'todos' ? 0.95 : 0.65;
      let lz = -0.10;
      let ly = 0;
      let yaw = -0.22 + Math.sin(t * 0.6) * 0.08;

      if (task === 'andar') {
        const a = t * 0.92 - 0.55;
        const R = 1.85;
        lx = Math.cos(a) * R;
        lz = Math.sin(a) * R;
        yaw = -a;

        const stride = t * 6.4;
        ly = Math.abs(Math.cos(stride)) * 0.04;
        for (const lg of llama.legs) {
          lg.pivot.rotation.x = Math.sin(stride + lg.phase) * 0.36;
        }
      } else {
        for (const lg of llama.legs) {
          lg.pivot.rotation.x = 0;
        }
        llama.head.rotation.y = Math.sin(t * 1.4) * 0.18;
        llama.head.rotation.x = Math.cos(t * 1.1) * 0.08;
      }

      llama.root.position.set(lx, ly, lz);
      llama.root.rotation.set(0, yaw, 0);
    };

    let lastHeroState = false;

    atlanteanRoot.userData.animatePose = (dt: number) => {
      const currentMode = atlanteanCitizenModeRef.current;
      const currentTask = atlanteanCitizenTaskRef.current;
      const isHero = atlanteanIsHeroRef.current;

      if (isHero !== lastHeroState) {
        lastHeroState = isHero;
        atlanteanMan.setHeroState(isHero);
        atlanteanWoman.setHeroState(isHero);
      }

      atlanteanMan.root.visible = currentMode === 'todos' || currentMode === 'homem';
      atlanteanWoman.root.visible = currentMode === 'todos' || currentMode === 'mulher';
      atlanteanLlama.root.visible = true;

      atlanteanMan.setToolMode(currentTask);
      atlanteanWoman.setToolMode(currentTask);

      const manX = currentMode === 'todos' ? -0.78 : -0.28;
      const womanX = currentMode === 'todos' ? 0.12 : -0.28;

      const t = getSimTime();
      animateStudioAtlanteanCitizen(atlanteanMan, dt, t, manX, 0, currentTask, currentMode, isHero);
      animateStudioAtlanteanCitizen(atlanteanWoman, dt, t, womanX, 1.3, currentTask, currentMode, isHero);
      animateStudioLlama(atlanteanLlama, dt, t, currentTask, currentMode);
    };

    return atlanteanRoot;
  }

  if (selectedCiv === 'greek' && (selectedUnit === 'hipaspist' || selectedUnit === 'myrmidon')) {
    scene.background = defaultBg.clone();
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.015);
    addPedestal(1.5, 1.65, 0xd4af37);

    const group = createGreekUnitMesh(selectedUnit, 'player', pal, !isSoftwareGl, activeTier);
    group.userData.setArmorTier?.(activeTier);
    group.userData.setMode?.('3d');
    if (selectedUnit === 'myrmidon') {
      group.userData.setCombatFury?.(myrmidonFuryRef.current ? 1.0 : 0.0);
    }
    return group;
  }

  return null;
}

export function buildGenericUnitStudioSubject(
  ctx: Pick<
    HumanUnitStudioBuildContext,
    'scene' | 'defaultBg' | 'pal' | 'isSoftwareGl' | 'selectedUnit' | 'selectedCiv' | 'selectedMajorGod' | 'activeTier' | 'addPedestal'
  >
): THREE.Group {
  const {
    scene,
    defaultBg,
    pal,
    isSoftwareGl,
    selectedUnit,
    selectedCiv,
    selectedMajorGod,
    activeTier,
    addPedestal,
  } = ctx;

  scene.background = defaultBg.clone();
  scene.fog = new THREE.FogExp2(0x0b0e14, 0.015);
  addPedestal(1.55, 1.72, 0xd4af37);

  const group = createUnitMesh(
    selectedUnit as UnitKind,
    'player',
    pal,
    !isSoftwareGl,
    selectedCiv,
    selectedMajorGod
  );
  group.userData.setArmorTier?.(activeTier);
  group.userData.setMode?.('3d');
  if (selectedUnit === 'titan') {
    group.scale.setScalar(0.28);
    group.position.y = -0.04;
  }
  return group;
}
