import * as THREE from 'three';
import type { Dispatch, SetStateAction } from 'react';
import {
  animateMedusaModel as animateStudioMedusa,
  buildMedusa as buildStudioMedusa,
} from '../../civilizacao/gregos/zeusMedusaModel';
import {
  animateColossusModel as animateStudioColossus,
  buildZeusColossus as buildStudioColossus,
} from '../../civilizacao/gregos/zeusColossusModel';
import {
  animateHydraModel as animateStudioHydra,
  buildZeusHydra as buildStudioHydra,
} from '../../civilizacao/gregos/zeusHydraModel';
import {
  animateManticoreModel as animateStudioManticore,
  buildZeusManticore as buildStudioManticore,
} from '../../civilizacao/gregos/zeusManticoreModel';
import {
  animateCyclopsModel as animateStudioCyclops,
  buildZeusCyclops as buildStudioCyclops,
  createCyclopsTextures,
} from '../../civilizacao/gregos/zeusCyclopsModel';
import { PantheonId } from '../../game/types';
import { InspectableUnitId } from '../gallery3dCatalog';

export interface MythUnitStudioBuildContext {
  scene: THREE.Scene;
  selectedCiv: PantheonId;
  selectedUnit: InspectableUnitId;
  getSimTime: () => number;
  addPedestal: (radiusTop: number, radiusBottom: number, ringColor: number) => void;
  spawnSpark: (p: THREE.Vector3) => void;
  medusaModeRef: { current: 'auto' | 'flechas' | 'vigilia' };
  medusaGazeCooldownRef: { current: number };
  setMedusaGazeCooldown: Dispatch<SetStateAction<number>>;
  colossusTierRef: { current: number };
  colossusActionRef: { current: 'slam' | 'marcha' | 'eat_tree' | 'vigilia' };
  hydraActionModeRef: { current: 'combate' | 'vigilia' | 'manual_bite' };
  hydraTargetCountRef: { current: number };
  hydraHeadsRef: { current: number };
  setHydraHeads: Dispatch<SetStateAction<number>>;
  setHydraTotalDamage: Dispatch<SetStateAction<number>>;
  setHydraTotalHits: Dispatch<SetStateAction<number>>;
  manticoreModeRef: { current: 'combate' | 'vigilia' };
  manticoreAutoCastRef: { current: boolean };
  manticoreTargetCountRef: { current: number };
  manticoreFrontlineRef: { current: boolean };
  setManticoreVolleyCooldown: Dispatch<SetStateAction<number>>;
  setManticoreQuillsFired: Dispatch<SetStateAction<number>>;
  setManticorePiercingDamage: Dispatch<SetStateAction<number>>;
  cyclopsModeRef: { current: 'combate' | 'vigilia' };
  cyclopsAutoCastRef: { current: boolean };
  cyclopsIsElderRef: { current: boolean };
  cyclopsTargetIdRef: { current: number };
  setCyclopsThrowCooldown: Dispatch<SetStateAction<number>>;
  setCyclopsIsElder: Dispatch<SetStateAction<boolean>>;
  setCyclopsTotalDamage: Dispatch<SetStateAction<number>>;
  setCyclopsTargetId: Dispatch<SetStateAction<number>>;
  setCyclopsToast: Dispatch<SetStateAction<string | null>>;
}

export function buildMythUnitStudioSubject(ctx: MythUnitStudioBuildContext): THREE.Group | null {
  const {
    scene,
    selectedCiv,
    selectedUnit,
    getSimTime,
    addPedestal,
    spawnSpark,
    medusaModeRef,
    medusaGazeCooldownRef,
    setMedusaGazeCooldown,
    colossusTierRef,
    colossusActionRef,
    hydraActionModeRef,
    hydraTargetCountRef,
    hydraHeadsRef,
    setHydraHeads,
    setHydraTotalDamage,
    setHydraTotalHits,
    manticoreModeRef,
    manticoreAutoCastRef,
    manticoreTargetCountRef,
    manticoreFrontlineRef,
    setManticoreVolleyCooldown,
    setManticoreQuillsFired,
    setManticorePiercingDamage,
    cyclopsModeRef,
    cyclopsAutoCastRef,
    cyclopsIsElderRef,
    cyclopsTargetIdRef,
    setCyclopsThrowCooldown,
    setCyclopsIsElder,
    setCyclopsTotalDamage,
    setCyclopsTargetId,
    setCyclopsToast,
  } = ctx;

  if (selectedCiv !== 'greek') return null;

  if (selectedUnit === 'medusa') {
    scene.background = new THREE.Color(0x080d1a);
    scene.fog = new THREE.FogExp2(0x080d1a, 0.016);
    addPedestal(2.2, 2.4, 0xfacc15);

    const medusaRig = buildStudioMedusa();
    const medusaGroup = new THREE.Group();
    medusaGroup.add(medusaRig.root);

    const targetRoot = new THREE.Group();
    targetRoot.position.set(0, 0, 2.6);
    targetRoot.rotation.y = Math.PI;

    const soldierMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.35,
      metalness: 0.6,
    });
    const stoneTargetMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.88,
      metalness: 0.05,
    });

    const soldierMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.25, 10), soldierMat);
    soldierMesh.position.y = 0.65;
    const soldierHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), soldierMat);
    soldierHead.position.y = 1.45;
    const soldierShield = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 14), soldierMat);
    soldierShield.rotation.z = Math.PI / 2;
    soldierShield.position.set(-0.35, 0.85, 0.1);
    targetRoot.add(soldierMesh, soldierHead, soldierShield);
    medusaGroup.add(targetRoot);

    const gazeGeo = new THREE.ConeGeometry(0.9, 2.8, 16, 1, true);
    gazeGeo.rotateX(-Math.PI / 2);
    gazeGeo.translate(0, 0, 1.4);
    const gazeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const gazeBeam = new THREE.Mesh(gazeGeo, gazeMat);
    gazeBeam.position.set(0, 1.45, 0.1);
    medusaGroup.add(gazeBeam);

    medusaGroup.userData.disposeExtra = () => {
      soldierMat.dispose();
      stoneTargetMat.dispose();
    };

    let gazeTimer = 0;
    let isPetrified = false;

    medusaGroup.userData.triggerGaze = () => {
      if (medusaGazeCooldownRef.current <= 0) {
        gazeTimer = 3.5;
        isPetrified = true;
        setMedusaGazeCooldown(20);
      }
    };

    medusaGroup.userData.animatePose = (dt: number) => {
      const mode = medusaModeRef.current;
      const t = getSimTime();

      if (gazeTimer > 0) {
        gazeTimer -= dt;
        gazeMat.opacity = Math.min(0.75, gazeTimer * 0.8);
        if (gazeTimer <= 0) {
          isPetrified = false;
          gazeMat.opacity = 0;
        }
      } else if (mode === 'auto' && Math.sin(t * 0.28) > 0.94 && medusaGazeCooldownRef.current <= 0) {
        gazeTimer = 3.2;
        isPetrified = true;
        setMedusaGazeCooldown(20);
      }

      if (medusaGazeCooldownRef.current > 0) {
        setMedusaGazeCooldown((prev) => Math.max(0, prev - dt));
      }

      const activeMat = isPetrified ? stoneTargetMat : soldierMat;
      soldierMesh.material = activeMat;
      soldierHead.material = activeMat;
      soldierShield.material = activeMat;

      const bowProgress = (t * 1.4) % 1.0;
      const gazeActive = gazeTimer > 0;
      animateStudioMedusa(medusaRig, t, mode, gazeActive, bowProgress);

      if (gazeActive && Math.random() < 0.4) {
        spawnSpark(new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.0, 2.5));
      }
    };

    return medusaGroup;
  }

  if (selectedUnit === 'colossus') {
    scene.background = new THREE.Color(0x09101c);
    scene.fog = new THREE.FogExp2(0x09101c, 0.016);
    addPedestal(2.8, 3.0, 0xd97706);

    const colossusGroup = new THREE.Group();
    let currentRigTier = colossusTierRef.current;
    let colossusRig = buildStudioColossus({
      teamId: 'player',
      tier: currentRigTier,
      scale: 0.95,
    });
    colossusGroup.add(colossusRig.root);

    const treeRoot = new THREE.Group();
    treeRoot.position.set(1.85, 0, 0.4);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3d22, roughness: 0.8 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.4, 8), woodMat);
    trunk.position.y = 1.2;
    const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), leavesMat);
    foliage1.position.set(0, 2.3, 0);
    foliage1.scale.set(1.1, 0.9, 1.1);
    const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), leavesMat);
    foliage2.position.set(0.15, 2.9, -0.1);
    treeRoot.add(trunk, foliage1, foliage2);
    colossusGroup.add(treeRoot);

    let lastActionProgress = 0;

    colossusGroup.userData.setTier = (t: number) => {
      if (t !== currentRigTier) {
        currentRigTier = t;
        colossusGroup.remove(colossusRig.root);
        colossusRig = buildStudioColossus({
          teamId: 'player',
          tier: currentRigTier,
          scale: 0.95,
        });
        colossusGroup.add(colossusRig.root);
      }
    };

    colossusGroup.userData.animatePose = (dt: number) => {
      const targetTier = colossusTierRef.current;
      if (targetTier !== currentRigTier) {
        colossusGroup.userData.setTier(targetTier);
      }

      const action = colossusActionRef.current;
      const t = getSimTime();

      if (action === 'slam') {
        lastActionProgress = (t * 0.95) % 1.0;
        if (lastActionProgress > 0.58 && lastActionProgress < 0.65) {
          spawnSpark(new THREE.Vector3(0, 0.1, 1.2));
        }
      } else if (action === 'eat_tree') {
        lastActionProgress = (t * 0.85) % 1.0;
        foliage1.rotation.y = Math.sin(t * 5.0) * 0.08;
        if (Math.random() < 0.35) {
          spawnSpark(new THREE.Vector3(1.2 + Math.random() * 0.4, 1.8, 0.3));
        }
      } else if (action === 'marcha') {
        lastActionProgress = (t * 1.2) % 1.0;
      } else {
        lastActionProgress = 0;
      }

      animateStudioColossus(colossusRig, t, dt, action, lastActionProgress);
    };

    return colossusGroup;
  }

  if (selectedUnit === 'hydra') {
    scene.background = new THREE.Color(0x08101e);
    scene.fog = new THREE.FogExp2(0x08101e, 0.016);
    addPedestal(3.2, 3.4, 0x1d4ed8);

    const hydraRig = buildStudioHydra({ teamId: 'player', scale: 0.95 });
    const hydraGroup = new THREE.Group();
    hydraGroup.add(hydraRig.root);

    const enemySoldiersRoot = new THREE.Group();
    enemySoldiersRoot.position.set(0, 0, 2.55);
    const armorMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.65, roughness: 0.35 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc98d62, roughness: 0.5 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.82, roughness: 0.28 });

    const soldierNodes = [-0.92, 0.0, 0.92].map((xOff, idx) => {
      const sGroup = new THREE.Group();
      sGroup.position.set(xOff, 0, idx === 1 ? 0 : -0.22);
      sGroup.rotation.y = Math.PI;

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.75, 10), armorMat);
      torso.position.y = 0.8;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skinMat);
      head.position.y = 1.35;
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 14), bronzeMat);
      shield.rotation.z = Math.PI / 2;
      shield.position.set(-0.32, 0.85, 0.08);
      sGroup.add(torso, head, shield);
      enemySoldiersRoot.add(sGroup);
      return { group: sGroup, isCenter: idx === 1, hitFlash: 0 };
    });
    hydraGroup.add(enemySoldiersRoot);

    let biteTimer = 0;
    let biteImpactDone = false;
    let currentHeadCount = hydraHeadsRef.current;

    hydraGroup.userData.triggerBite = () => {
      biteTimer = 0.01;
      biteImpactDone = false;
    };

    hydraGroup.userData.setHeadCount = (cnt: number) => {
      hydraRig.setHeadCount(cnt);
      currentHeadCount = cnt;
    };

    hydraGroup.userData.animatePose = (dt: number) => {
      const action = hydraActionModeRef.current;
      const targets = hydraTargetCountRef.current;
      const desiredHeads = hydraHeadsRef.current;
      const t = getSimTime();

      if (desiredHeads !== currentHeadCount) {
        hydraGroup.userData.setHeadCount(desiredHeads);
      }

      soldierNodes.forEach((s) => {
        s.group.visible = s.isCenter || targets === 3;
      });

      let biteStrike = 0;
      if (action === 'combate' || action === 'manual_bite') {
        biteTimer += dt * 0.95;
        if (biteTimer >= 1.0) {
          biteTimer %= 1.0;
          biteImpactDone = false;
        }

        if (biteTimer < 0.34) {
          const p = biteTimer / 0.34;
          biteStrike = -0.35 * Math.sin(p * Math.PI * 0.5);
        } else if (biteTimer < 0.62) {
          const p = (biteTimer - 0.34) / 0.28;
          biteStrike = -0.35 + 1.35 * Math.sin(p * Math.PI * 0.5);

          if (p > 0.78 && !biteImpactDone) {
            biteImpactDone = true;
            soldierNodes.forEach((s) => {
              if (s.group.visible) {
                s.hitFlash = 0.25;
                spawnSpark(new THREE.Vector3(s.group.position.x, 0.65, 2.55));
              }
            });

            setHydraTotalHits((h) => h + 1);
            setHydraTotalDamage((prevDmg) => {
              const dmgStep = currentHeadCount * 30 * targets;
              const newDmg = Math.min(1600, prevDmg + dmgStep);
              const autoHeads = Math.min(5, 1 + Math.floor(newDmg / 400));
              if (autoHeads > currentHeadCount) {
                setHydraHeads(autoHeads);
                hydraGroup.userData.setHeadCount(autoHeads);
              }
              return newDmg;
            });
          }
        } else {
          const rem = 1 - (biteTimer - 0.62) / 0.38;
          biteStrike = 1.0 * rem;
        }
      }

      soldierNodes.forEach((s) => {
        if (s.hitFlash > 0) {
          s.hitFlash = Math.max(0, s.hitFlash - dt);
          const knock = Math.sin((s.hitFlash / 0.25) * Math.PI) * 0.18;
          s.group.position.z = (s.isCenter ? 0 : -0.22) + knock;
        } else {
          s.group.position.z = s.isCenter ? 0 : -0.22;
        }
      });

      animateStudioHydra(hydraRig, t, dt, biteStrike, false);
    };

    return hydraGroup;
  }

  if (selectedUnit === 'manticore') {
    scene.background = new THREE.Color(0x0c192e);
    scene.fog = new THREE.FogExp2(0x0c192e, 0.016);
    addPedestal(3.2, 3.4, 0xfacc15);

    const manticoreRig = buildStudioManticore({ teamId: 'player', scale: 0.95 });
    const manticoreGroup = new THREE.Group();
    manticoreRig.root.position.set(0.25, 0, -1.25);
    manticoreGroup.add(manticoreRig.root);

    const hopliteMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.88, roughness: 0.22 });
    const hopliteBlue = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45 });
    const frontlineEscort = new THREE.Group();
    frontlineEscort.position.set(-0.55, 0, 1.35);

    const hTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.75, 10), hopliteBlue);
    hTorso.position.y = 0.8;
    const hCuirass = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.26), hopliteMat);
    hCuirass.position.y = 1.18;
    const hHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), hopliteMat);
    hHead.position.y = 1.62;
    const hShield = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.05, 18), hopliteMat);
    hShield.position.set(-0.12, 1.16, 0.26);
    const hSpear = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.05, 8), hopliteMat);
    hSpear.rotation.x = 0.55;
    hSpear.position.set(0.3, 1.15, 0.25);
    frontlineEscort.add(hTorso, hCuirass, hHead, hShield, hSpear);
    manticoreGroup.add(frontlineEscort);

    const enemyArmor = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.7, roughness: 0.35 });
    const enemyBronze = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.82, roughness: 0.28 });

    const enemyGroup = new THREE.Group();
    enemyGroup.position.set(0, 0, 4.15);

    const soldierOffsets = [
      { x: 0.0, z: 0.0, isolated: true },
      { x: -0.78, z: -0.25, isolated: false },
      { x: 0.78, z: -0.25, isolated: false },
      { x: -0.45, z: 0.48, isolated: false },
      { x: 0.45, z: 0.48, isolated: false },
    ];

    const enemySoldiers = soldierOffsets.map((off) => {
      const s = new THREE.Group();
      s.position.set(off.x, 0, off.z);
      s.rotation.y = Math.PI;

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.72, 10), enemyArmor);
      torso.position.y = 0.78;
      const cuirass = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.48, 0.25), enemyBronze);
      cuirass.position.y = 1.15;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), enemyBronze);
      head.position.y = 1.58;
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 16), enemyBronze);
      shield.rotation.z = Math.PI / 2;
      shield.position.set(-0.3, 1.1, 0.12);
      s.add(torso, cuirass, head, shield);
      enemyGroup.add(s);
      return { root: s, isolated: off.isolated, baseX: off.x, baseZ: off.z, hitFlash: 0 };
    });
    manticoreGroup.add(enemyGroup);

    const activeQuills: Array<{
      mesh: THREE.Mesh;
      start: THREE.Vector3;
      target: THREE.Vector3;
      progress: number;
      speed: number;
      isSpecial: boolean;
    }> = [];

    const quillProjGeo = new THREE.ConeGeometry(0.028, 0.68, 6);
    quillProjGeo.rotateX(Math.PI / 2);
    const basicQuillMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const volleyQuillMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    manticoreGroup.userData.disposeExtra = () => {
      activeQuills.forEach((q) => scene.remove(q.mesh));
      activeQuills.length = 0;
      quillProjGeo.dispose();
      basicQuillMat.dispose();
      volleyQuillMat.dispose();
    };

    const spawnQuill = (targetPos: THREE.Vector3, isSpecial: boolean) => {
      manticoreGroup.updateMatrixWorld(true);
      const start = new THREE.Vector3();
      manticoreRig.tailTipAnchor.getWorldPosition(start);

      const mesh = new THREE.Mesh(quillProjGeo, isSpecial ? volleyQuillMat : basicQuillMat);
      mesh.scale.setScalar(isSpecial ? 1.35 : 1.0);
      mesh.position.copy(start);
      scene.add(mesh);

      activeQuills.push({
        mesh,
        start,
        target: targetPos.clone(),
        progress: 0,
        speed: isSpecial ? 2.75 : 2.35,
        isSpecial,
      });
    };

    let volleyCooldown = 0;
    let volleyCastTimer = 0;
    let volleyFired = false;
    let basicShotTimer = 0;
    let basicShotFired = false;

    manticoreGroup.userData.triggerVolley = () => {
      if (volleyCooldown <= 0 && volleyCastTimer <= 0) {
        volleyCastTimer = 0.95;
        volleyFired = false;
        volleyCooldown = 12.0;
        setManticoreVolleyCooldown(12.0);
      }
    };

    manticoreGroup.userData.animatePose = (dt: number) => {
      const action = manticoreModeRef.current;
      const autoCast = manticoreAutoCastRef.current;
      const targetCount = manticoreTargetCountRef.current;
      const frontlineOn = manticoreFrontlineRef.current;
      const t = getSimTime();

      frontlineEscort.visible = frontlineOn;
      enemySoldiers.forEach((s) => {
        s.root.visible = targetCount === 5 ? true : s.isolated;
      });

      if (volleyCooldown > 0) {
        volleyCooldown = Math.max(0, volleyCooldown - dt);
        setManticoreVolleyCooldown(volleyCooldown);
      } else if (action === 'combate' && autoCast && volleyCastTimer <= 0) {
        manticoreGroup.userData.triggerVolley();
      }

      let tailWhipForward = 0;
      let wingFlap = Math.sin(t * 2.8) * 0.14;
      let jawOpen = Math.max(0, Math.sin(t * 2.2)) * 0.08;

      if (volleyCastTimer > 0) {
        volleyCastTimer -= dt;
        const p = 1 - volleyCastTimer / 0.95;
        if (p < 0.42) {
          const prep = p / 0.42;
          tailWhipForward = -0.35 * prep;
          wingFlap = 0.55 * prep;
          jawOpen = 0.45 * prep;
        } else {
          const snap = (p - 0.42) / 0.58;
          tailWhipForward = -0.35 + 1.45 * Math.sin(Math.min(1, snap * 2.2) * Math.PI * 0.5);
          wingFlap = 0.55 - 0.85 * Math.sin(Math.min(1, snap * 2.0) * Math.PI * 0.5);
          jawOpen = 0.45 * (1 - snap);

          if (!volleyFired) {
            volleyFired = true;
            const visibleSoldiers = enemySoldiers.filter((s) => s.root.visible);
            for (let q = 0; q < 9; q++) {
              const targetSoldier = visibleSoldiers[q % visibleSoldiers.length];
              const spreadX = (q - 4) * (targetCount === 5 ? 0.24 : 0.08);
              const tPos = new THREE.Vector3(
                targetSoldier.baseX + spreadX,
                1.15 + (Math.random() - 0.5) * 0.35,
                4.15 + targetSoldier.baseZ
              );
              spawnQuill(tPos, true);
            }
          }
        }
      } else if (action === 'combate') {
        const prevShot = basicShotTimer;
        basicShotTimer = (basicShotTimer + dt * 0.95) % 1.0;
        if (basicShotTimer < prevShot) basicShotFired = false;

        if (basicShotTimer < 0.35) {
          tailWhipForward = -0.22 * (basicShotTimer / 0.35);
        } else if (basicShotTimer < 0.65) {
          const f = (basicShotTimer - 0.35) / 0.3;
          tailWhipForward = -0.22 + 0.95 * Math.sin(f * Math.PI * 0.5);
          wingFlap = Math.sin(f * Math.PI) * 0.28;
          jawOpen = Math.sin(f * Math.PI) * 0.25;

          if (f > 0.65 && !basicShotFired) {
            basicShotFired = true;
            const visibleSoldiers = enemySoldiers.filter((s) => s.root.visible);
            const tgt = visibleSoldiers[Math.floor(Math.random() * visibleSoldiers.length)];
            spawnQuill(new THREE.Vector3(tgt.baseX, 1.2, 4.15 + tgt.baseZ), false);
          }
        } else {
          const rem = 1 - (basicShotTimer - 0.65) / 0.35;
          tailWhipForward = 0.73 * rem;
        }
      }

      for (let i = activeQuills.length - 1; i >= 0; i--) {
        const q = activeQuills[i];
        q.progress += dt * q.speed;
        const p = Math.min(1, q.progress);
        const pos = new THREE.Vector3().lerpVectors(q.start, q.target, p);
        pos.y += Math.sin(p * Math.PI) * (q.isSpecial ? 0.55 : 0.38);
        q.mesh.position.copy(pos);

        const nextP = Math.min(1, p + 0.05);
        const nextPos = new THREE.Vector3().lerpVectors(q.start, q.target, nextP);
        nextPos.y += Math.sin(nextP * Math.PI) * (q.isSpecial ? 0.55 : 0.38);
        q.mesh.lookAt(nextPos);

        if (p >= 1) {
          setManticoreQuillsFired((c) => c + 1);
          setManticorePiercingDamage((d) => d + (q.isSpecial ? 45 : 28));
          spawnSpark(q.target);

          enemySoldiers.forEach((s) => {
            if (s.root.visible && Math.hypot(s.baseX - q.target.x, 4.15 + s.baseZ - q.target.z) < 0.75) {
              s.hitFlash = 0.22;
            }
          });

          scene.remove(q.mesh);
          activeQuills.splice(i, 1);
        }
      }

      enemySoldiers.forEach((s) => {
        if (s.hitFlash > 0) {
          s.hitFlash = Math.max(0, s.hitFlash - dt);
          s.root.position.z = s.baseZ + Math.sin((s.hitFlash / 0.22) * Math.PI) * 0.16;
        } else {
          s.root.position.z = s.baseZ;
        }
      });

      animateStudioManticore(manticoreRig, t, dt, tailWhipForward, wingFlap, jawOpen, false);
    };

    return manticoreGroup;
  }

  if (selectedUnit === 'cyclops') {
    scene.background = new THREE.Color(0x0c1a30);
    scene.fog = new THREE.FogExp2(0x0c1a30, 0.016);

    const cyclopsTex = createCyclopsTextures();
    const cyclopsGroup = new THREE.Group();

    const arenaFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(8.8, 9.1, 0.34, 72),
      new THREE.MeshStandardMaterial({ map: cyclopsTex.floorTex, roughness: 0.72, metalness: 0.06 })
    );
    arenaFloor.position.y = -0.17;
    arenaFloor.receiveShadow = true;
    cyclopsGroup.add(arenaFloor);

    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });
    for (let i = 0; i < 6; i++) {
      const a = Math.PI + ((i - 2.5) / 5) * Math.PI * 0.85;
      const col = new THREE.Group();
      col.position.set(Math.cos(a) * 7.2, 0, Math.sin(a) * 7.2);

      const baseM = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.15, 0.72), marbleMat);
      baseM.position.y = 0.075;
      const shaftM = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.8, 16), marbleMat);
      shaftM.position.y = 1.55;
      const capM = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.15, 0.66), marbleMat);
      capM.position.y = 3.02;

      col.add(baseM, shaftM, capM);
      cyclopsGroup.add(col);
    }

    const cyclops = buildStudioCyclops({ teamId: 'player', textures: cyclopsTex });
    cyclops.root.position.set(0, 0, -0.65);
    cyclopsGroup.add(cyclops.root);

    const impactLight = new THREE.PointLight(0xef4444, 0, 14);
    cyclopsGroup.add(impactLight);

    interface StudioEnemyUnit {
      id: number;
      name: string;
      type: 'infantry' | 'hero' | 'archer';
      validToThrow: boolean;
      isBackline: boolean;
      root: THREE.Group;
      model: THREE.Group;
      ring: THREE.Mesh;
      baseRingColor: number;
      baseX: number;
      baseZ: number;
      knockdownTimer: number;
    }

    const armyUnits: StudioEnemyUnit[] = [];
    const infMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.72, roughness: 0.32 });
    const archMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.55 });
    const heroArmorMat = new THREE.MeshStandardMaterial({
      color: 0x7e22ce,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.2,
    });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc98d62, roughness: 0.48 });

    const createEnemyUnit = (
      id: number,
      name: string,
      type: 'infantry' | 'hero' | 'archer',
      validToThrow: boolean,
      x: number,
      z: number,
      isBackline = false
    ) => {
      const uRoot = new THREE.Group();
      uRoot.position.set(x, 0, z);
      uRoot.rotation.y = Math.PI;

      const isHero = type === 'hero';
      const bodyMat = isHero ? heroArmorMat : type === 'archer' ? archMat : infMat;
      const sc = isHero ? 1.18 : 1.0;

      const model = new THREE.Group();
      model.scale.setScalar(sc);
      uRoot.add(model);

      const addHitPart = (
        geo: THREE.BufferGeometry,
        mat: THREE.Material,
        pos: [number, number, number],
        rot: [number, number, number] = [0, 0, 0]
      ) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(pos[0], pos[1], pos[2]);
        m.rotation.set(rot[0], rot[1], rot[2]);
        m.castShadow = true;
        m.userData.unitId = id;
        model.add(m);
        return m;
      };

      addHitPart(new THREE.CylinderGeometry(0.08, 0.06, 0.65, 10), skinMat, [-0.12, 0.35, 0]);
      addHitPart(new THREE.CylinderGeometry(0.08, 0.06, 0.65, 10), skinMat, [0.12, 0.35, 0]);
      addHitPart(new THREE.CylinderGeometry(0.18, 0.26, 0.36, 12), bodyMat, [0, 0.78, 0]);
      addHitPart(new THREE.BoxGeometry(0.44, 0.48, 0.25), isHero ? heroArmorMat : bronzeMat, [0, 1.15, 0]);
      addHitPart(new THREE.SphereGeometry(0.14, 14, 14), skinMat, [0, 1.54, 0]);

      if (isHero) {
        addHitPart(new THREE.ConeGeometry(0.18, 0.34, 6), bronzeMat, [0, 1.78, 0]);
      } else if (type === 'archer') {
        addHitPart(new THREE.TorusGeometry(0.38, 0.018, 6, 16, Math.PI), bronzeMat, [-0.28, 1.15, 0.18], [0, Math.PI / 2, 0]);
      } else {
        addHitPart(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 16), bronzeMat, [-0.3, 1.1, 0.12], [0, 0, Math.PI / 2]);
      }

      const ringColor = validToThrow ? (isBackline ? 0x38bdf8 : 0x10b981) : 0xa855f7;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.38, 0.5, 24),
        new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.025;
      uRoot.add(ring);

      const unitObj: StudioEnemyUnit = {
        id,
        name,
        type,
        validToThrow,
        isBackline,
        root: uRoot,
        model,
        ring,
        baseRingColor: ringColor,
        baseX: x,
        baseZ: z,
        knockdownTimer: 0,
      };
      armyUnits.push(unitObj);
      cyclopsGroup.add(uRoot);
      return unitObj;
    };

    createEnemyUnit(1, 'Hoplita 1 (Esquerda)', 'infantry', true, -0.95, 1.85, false);
    createEnemyUnit(2, 'Hoplita 2 (Direita)', 'infantry', true, 0.85, 1.85, false);
    createEnemyUnit(3, 'Herói Imune (Mítico)', 'hero', false, 1.95, 2.15, false);
    createEnemyUnit(4, 'Arqueiro 1', 'archer', true, -1.05, 4.45, true);
    createEnemyUnit(5, 'Arqueiro 2', 'archer', true, -0.35, 4.65, true);
    createEnemyUnit(6, 'Arqueiro 3', 'archer', true, 0.35, 4.65, true);
    createEnemyUnit(7, 'Arqueiro 4', 'archer', true, 1.05, 4.45, true);

    const highlightTargetRing = (targetId: number) => {
      armyUnits.forEach((u) => {
        if (u.id === targetId) {
          (u.ring.material as THREE.MeshBasicMaterial).color.setHex(0xfacc15);
          u.ring.scale.setScalar(1.25);
        } else {
          (u.ring.material as THREE.MeshBasicMaterial).color.setHex(u.baseRingColor);
          u.ring.scale.setScalar(1.0);
        }
      });
    };
    highlightTargetRing(cyclopsTargetIdRef.current);

    const PART_N = 90;
    const partPos = new Float32Array(PART_N * 3).fill(-100);
    const partVel = new Float32Array(PART_N * 3);
    const partLife = new Float32Array(PART_N);
    let partIdx = 0;

    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.16,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    cyclopsGroup.add(new THREE.Points(partGeo, partMat));

    const spawnImpactBurst = (pos: THREE.Vector3, colorHex: number, count = 24) => {
      partMat.color.setHex(colorHex);
      for (let k = 0; k < count; k++) {
        const i = partIdx;
        partIdx = (partIdx + 1) % PART_N;
        partPos[i * 3] = pos.x + (Math.random() - 0.5) * 0.4;
        partPos[i * 3 + 1] = pos.y + 0.15;
        partPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.4;
        partVel[i * 3] = (Math.random() - 0.5) * 6.0;
        partVel[i * 3 + 1] = 2.0 + Math.random() * 4.5;
        partVel[i * 3 + 2] = (Math.random() - 0.5) * 6.0;
        partLife[i] = 0.35 + Math.random() * 0.25;
      }
      impactLight.color.setHex(colorHex);
      impactLight.position.copy(pos);
      impactLight.intensity = 10.0;
    };

    const updateParticles = (dt: number) => {
      for (let i = 0; i < PART_N; i++) {
        if (partLife[i] <= 0) continue;
        partLife[i] -= dt;
        partVel[i * 3 + 1] -= 11.0 * dt;
        partPos[i * 3] += partVel[i * 3] * dt;
        partPos[i * 3 + 1] += partVel[i * 3 + 1] * dt;
        partPos[i * 3 + 2] += partVel[i * 3 + 2] * dt;
        if (partLife[i] <= 0) partPos[i * 3 + 1] = -100;
      }
      partGeo.attributes.position.needsUpdate = true;
    };

    const shockWaves: Array<{ mesh: THREE.Mesh; life: number; max: number; maxScale: number }> = [];
    const spawnShockWave = (x: number, z: number, colorHex: number, maxScale = 4.5) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.85, 48),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.04, z);
      cyclopsGroup.add(ring);
      shockWaves.push({ mesh: ring, life: 0.9, max: 0.9, maxScale });
    };

    const THROW_COOLDOWN_MAX = 20.0;
    let throwCooldown = 0;
    let throwPhase: 'none' | 'grab' | 'windup' | 'flight' = 'none';
    let throwTimer = 0;
    let grabbedUnit: StudioEnemyUnit | null = null;
    const flightStart = new THREE.Vector3();
    const flightTarget = new THREE.Vector3(0, 0.15, 4.55);

    let clubTimer = 0;
    let clubHitDone = false;
    const tmpHandPos = new THREE.Vector3();
    let toastTimeoutId = 0;

    cyclopsGroup.userData.disposeExtra = () => {
      if (toastTimeoutId) window.clearTimeout(toastTimeoutId);
      Object.values(cyclopsTex).forEach((t) => {
        if (t instanceof THREE.Texture) t.dispose();
      });
    };

    const triggerToast = (msg: string) => {
      setCyclopsToast(msg);
      if (toastTimeoutId) window.clearTimeout(toastTimeoutId);
      toastTimeoutId = window.setTimeout(() => setCyclopsToast(null), 2800);
    };

    const startThrowSequence = (unitOverride?: StudioEnemyUnit) => {
      if (throwCooldown > 0 || throwPhase !== 'none') return;

      const targetId = cyclopsTargetIdRef.current;
      const candidate = unitOverride || armyUnits.find((u) => u.id === targetId) || armyUnits[0];

      if (!candidate || !candidate.validToThrow) {
        triggerToast('⚠️ Alvo Inválido! O Ciclope só arremessa soldados humanos!');
        return;
      }

      grabbedUnit = candidate;
      throwPhase = 'grab';
      throwTimer = 0;
      throwCooldown = THROW_COOLDOWN_MAX;
      setCyclopsThrowCooldown(THROW_COOLDOWN_MAX);
    };

    cyclopsGroup.userData.triggerThrow = () => startThrowSequence();

    cyclopsGroup.userData.selectTarget = (uid: number) => {
      const u = armyUnits.find((unit) => unit.id === uid);
      if (!u) return;
      if (!u.validToThrow) {
        triggerToast('⚠️ Herói / Unidade Mítica! O Ciclope só pode arremessar soldados humanos.');
        return;
      }
      setCyclopsTargetId(uid);
      highlightTargetRing(uid);
      if (throwCooldown <= 0 && throwPhase === 'none') {
        startThrowSequence(u);
      } else {
        triggerToast(`🎯 Alvo selecionado: ${u.name} (Aguardando recarga)`);
      }
    };

    cyclopsGroup.userData.toggleElder = () => {
      const nextElder = !cyclops.isElder();
      cyclops.setElderState(nextElder);
      setCyclopsIsElder(nextElder);
      spawnShockWave(0, -0.65, nextElder ? 0xef4444 : 0xfacc15, 4.8);
      spawnImpactBurst(new THREE.Vector3(0, 2.0, -0.65), nextElder ? 0xef4444 : 0xfacc15, 25);
    };

    cyclopsGroup.userData.animatePose = (dt: number) => {
      const action = cyclopsModeRef.current;
      const autoCast = cyclopsAutoCastRef.current;
      const isElderDesired = cyclopsIsElderRef.current;
      const t = getSimTime();

      if (cyclops.isElder() !== isElderDesired) {
        cyclops.setElderState(isElderDesired);
      }

      if (throwCooldown > 0) {
        throwCooldown = Math.max(0, throwCooldown - dt);
        setCyclopsThrowCooldown(throwCooldown);
      } else if (action === 'combate' && autoCast && throwPhase === 'none') {
        startThrowSequence();
      }

      const heavyBreath = Math.sin(t * 2.0) * 0.025;
      let torsoPitch = 0.02;
      let torsoYaw = 0;
      let rootZ = -0.65;

      if (throwPhase !== 'none' && grabbedUnit) {
        throwTimer += dt;

        if (throwPhase === 'grab') {
          const p = Math.min(1, throwTimer / 0.55);
          rootZ = -0.65 + p * 1.15;
          torsoPitch = 0.42 * p;
          torsoYaw = 0.35 * p;

          cyclops.leftArm.arm.rotation.set(-1.35 * p, 0.25, -0.25);
          cyclops.leftArm.elbow.rotation.set(-0.35 * p, 0, 0);
          cyclops.rightArm.arm.rotation.set(-0.25, 0.25, 0.45);
          cyclops.rightArm.elbow.rotation.set(-0.55, 0, 0);

          if (p >= 1) {
            throwPhase = 'windup';
            throwTimer = 0;
          }
        } else if (throwPhase === 'windup') {
          const p = Math.min(1, throwTimer / 0.5);
          rootZ = 0.5 - p * 0.65;
          torsoPitch = 0.42 - 0.65 * p;
          torsoYaw = 0.35 - 0.85 * p;

          cyclops.leftArm.arm.rotation.set(-2.45 * p - 1.35 * (1 - p), -0.2, -0.35);
          cyclops.leftArm.elbow.rotation.set(-0.65 * p, 0, 0);

          cyclops.root.updateMatrixWorld(true);
          cyclops.grabAnchor.getWorldPosition(tmpHandPos);
          grabbedUnit.root.position.copy(tmpHandPos);
          grabbedUnit.model.rotation.set(Math.PI * 0.5, t * 6, 0);

          if (p >= 1) {
            throwPhase = 'flight';
            throwTimer = 0;
            flightStart.copy(tmpHandPos);
            flightTarget.set(0, 0.15, 4.55);
          }
        } else if (throwPhase === 'flight') {
          const p = Math.min(1, throwTimer / 0.55);
          torsoPitch = -0.23 + 0.55 * Math.sin(p * Math.PI * 0.5);
          torsoYaw = -0.5 + 0.95 * Math.sin(p * Math.PI * 0.5);

          cyclops.leftArm.arm.rotation.set(-2.45 + 1.85 * p, 0.3, -0.25);
          cyclops.leftArm.elbow.rotation.set(-0.2, 0, 0);

          const curPos = new THREE.Vector3().lerpVectors(flightStart, flightTarget, p);
          curPos.y += Math.sin(p * Math.PI) * 2.45;
          grabbedUnit.root.position.copy(curPos);
          grabbedUnit.model.rotation.set(p * Math.PI * 4, p * 5, p * 3);

          if (p >= 1) {
            const isElder = cyclops.isElder();
            const blastRadius = isElder ? 2.15 : 1.45;
            const colorHex = isElder ? 0xef4444 : 0xfacc15;

            spawnShockWave(flightTarget.x, flightTarget.z, colorHex, isElder ? 5.6 : 4.0);
            spawnImpactBurst(flightTarget, colorHex, isElder ? 34 : 22);

            let hitCount = 0;
            armyUnits.forEach((u) => {
              const dist = Math.hypot(u.baseX - flightTarget.x, u.baseZ - flightTarget.z);
              if (u === grabbedUnit || dist <= blastRadius) {
                u.knockdownTimer = 3.5;
                hitCount++;
              }
            });

            setCyclopsTotalDamage((prev) => prev + 65 * hitCount);
            grabbedUnit = null;
            throwPhase = 'none';
          }
        }
      } else if (action === 'combate') {
        const prevClub = clubTimer;
        clubTimer = (clubTimer + dt * 0.85) % 1.0;
        if (clubTimer < prevClub) clubHitDone = false;

        rootZ = 0.25;
        if (clubTimer < 0.42) {
          const p = clubTimer / 0.42;
          torsoYaw = -0.35 * p;
          torsoPitch = -0.08 * p;
          cyclops.rightArm.arm.rotation.set(-2.1 * p - 0.35 * (1 - p), 0.15, 0.32);
          cyclops.rightArm.elbow.rotation.set(-0.75 * p, 0, 0);
        } else if (clubTimer < 0.72) {
          const p = (clubTimer - 0.42) / 0.3;
          const slam = Math.sin(p * Math.PI * 0.5);
          torsoYaw = -0.35 + 0.75 * slam;
          torsoPitch = -0.08 + 0.3 * slam;
          cyclops.rightArm.arm.rotation.set(-2.1 + 1.75 * slam, 0.12, 0.25);
          cyclops.rightArm.elbow.rotation.set(-0.75 + 0.55 * slam, 0, 0);

          if (slam > 0.88 && !clubHitDone) {
            clubHitDone = true;
            const isElder = cyclops.isElder();
            const hitPos = new THREE.Vector3(0, 0.45, 1.75);
            spawnImpactBurst(hitPos, isElder ? 0xef4444 : 0xfacc15, isElder ? 22 : 12);
            if (isElder) {
              spawnShockWave(0, 1.75, 0xef4444, 3.4);
              setCyclopsTotalDamage((prev) => prev + 75);
            } else {
              setCyclopsTotalDamage((prev) => prev + 40);
            }
          }
        } else {
          const rem = 1 - (clubTimer - 0.72) / 0.28;
          torsoYaw = 0.4 * rem;
          torsoPitch = 0.22 * rem;
          cyclops.rightArm.arm.rotation.set(-0.35, 0.15, 0.3);
          cyclops.rightArm.elbow.rotation.set(-0.35, 0, 0);
        }

        cyclops.leftArm.arm.rotation.set(-0.45, -0.25, -0.35);
        cyclops.leftArm.elbow.rotation.set(-0.65, 0, 0);
      } else {
        torsoYaw = Math.sin(t * 0.45) * 0.1;
        cyclops.rightArm.arm.rotation.set(-0.35, 0.15, 0.3 + Math.sin(t * 1.5) * 0.02);
        cyclops.rightArm.elbow.rotation.set(-0.42, 0, 0);
        cyclops.leftArm.arm.rotation.set(-0.35, -0.2, -0.32 - Math.cos(t * 1.5) * 0.02);
        cyclops.leftArm.elbow.rotation.set(-0.55, 0, 0);
      }

      // Suppress unused import notice while ensuring helper stays wired if used by subframes
      void animateStudioCyclops;

      cyclops.root.position.z = THREE.MathUtils.damp(cyclops.root.position.z, rootZ, 7, dt);
      cyclops.body.position.y = 1.02 * cyclops.scaleFactor + heavyBreath;
      cyclops.torso.rotation.set(torsoPitch, torsoYaw, 0);
      cyclops.auraRing.rotation.z += dt * 0.45;

      armyUnits.forEach((u) => {
        if (u === grabbedUnit) return;
        if (u.knockdownTimer > 0) {
          u.knockdownTimer = Math.max(0, u.knockdownTimer - dt);
          u.root.position.set(u.baseX, 0.18, u.baseZ + 0.35);
          u.model.rotation.set(-Math.PI * 0.48, 0, 0.25);
        } else {
          u.root.position.set(u.baseX, 0, u.baseZ);
          u.model.rotation.set(0, 0, 0);
        }
      });

      for (let i = shockWaves.length - 1; i >= 0; i--) {
        const sw = shockWaves[i];
        sw.life -= dt;
        const k = Math.max(0, sw.life / sw.max);
        sw.mesh.scale.setScalar(1 + (1 - k) * sw.maxScale);
        (sw.mesh.material as THREE.MeshBasicMaterial).opacity = 0.95 * k;
        if (sw.life <= 0) {
          cyclopsGroup.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          (sw.mesh.material as THREE.Material).dispose();
          shockWaves.splice(i, 1);
        }
      }

      impactLight.intensity = Math.max(0, impactLight.intensity - dt * 22);
      updateParticles(dt);
    };

    return cyclopsGroup;
  }

  return null;
}
