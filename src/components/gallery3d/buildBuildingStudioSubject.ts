import * as THREE from 'three';
import { GreekFortressAction } from '../../civilizacao/gregos/greekFortressModel';
import {
  buildGreekArchBuilding,
  getGreekArchGroundTexture,
  GREEK_ARCH_THEMES,
  isGreekArchBuilding,
  resolveGreekArchGod,
} from '../../civilizacao/gregos/greekArchitectureSuite';
import {
  buildAtlanteanFortress as buildAtlanteanFortressStudio,
  ATLANTEAN_FORTRESS_THEMES,
  AtlanteanFortressAction,
} from '../../civilizacao/atlantes/atlanteanFortressModel';
import {
  buildAtlanteanTownCenterStudio,
  ATLANTEAN_TOWN_CENTER_THEMES,
} from '../../civilizacao/atlantes/atlanteanTownCenterModel';
import {
  buildNorseHillFort as buildNorseFortressStudio,
  NORSE_FORTRESS_THEMES,
  NorseFortressAction,
} from '../../civilizacao/nordicos/norseFortressModel';
import {
  buildNorseTownCenterStudio,
  NORSE_TOWN_CENTER_THEMES,
} from '../../civilizacao/nordicos/norseTownCenterModel';
import {
  buildGreekTempleStudio,
  GREEK_TEMPLE_THEMES,
  GreekTempleGodKey,
} from '../../civilizacao/gregos/greekTempleModel';
import {
  buildGreekHouseStudio,
  GREEK_BUILDINGS_THEMES,
} from '../../civilizacao/gregos/greekHouseModel';
import {
  buildGreekTownCenterStudio,
  GREEK_TOWN_CENTER_THEMES,
} from '../../civilizacao/gregos/greekTownCenterModel';
import {
  buildEgyptianTempleStudio,
  EGYPT_TEMPLE_THEMES,
  EgyptianTempleGodKey,
} from '../../civilizacao/egipcios/egyptianTempleModel';
import {
  buildEgyptianArchBuilding,
  EGYPT_ARCH_THEMES,
  getEgyptianArchGroundTexture,
  isEgyptianArchBuilding,
  resolveEgyptianArchGod,
} from '../../civilizacao/egipcios/egyptianArchitectureSuite';
import {
  buildEgyptianTownCenterStudio,
  EGYPTIAN_TOWN_CENTER_THEMES,
} from '../../civilizacao/egipcios/egyptianTownCenterModel';
import {
  createBuildingMesh,
  createUnitMesh,
  MaterialPalette,
} from '../../game/models';
import { AgeLevel, BuildingKind, PantheonId } from '../../game/types';

export interface BuildingStudioBuildContext {
  scene: THREE.Scene;
  environmentGroup: THREE.Group;
  defaultBg: THREE.Color;
  pal: MaterialPalette;
  isSoftwareGl: boolean;
  selectedCiv: PantheonId;
  selectedMajorGod: string;
  selectedBuilding: BuildingKind;
  buildingAge: AgeLevel;
  showHumanScale: boolean;
  getSimTime: () => number;
  fortressActionRef: { current: GreekFortressAction };
  atlanteanFortressActionRef: { current: AtlanteanFortressAction };
  norseFortressActionRef: { current: NorseFortressAction };
  templeActionRef: { current: 'favor' | 'milagre' };
  addPedestal: (radiusTop: number, radiusBottom: number, ringColor: number) => void;
}

export function buildBuildingStudioSubject(ctx: BuildingStudioBuildContext): THREE.Group {
  const {
    scene,
    environmentGroup,
    defaultBg,
    pal,
    isSoftwareGl,
    selectedCiv,
    selectedMajorGod,
    selectedBuilding,
    buildingAge,
    showHumanScale,
    getSimTime,
    fortressActionRef,
    atlanteanFortressActionRef,
    norseFortressActionRef,
    templeActionRef,
    addPedestal,
  } = ctx;

  let group: THREE.Group;

  if (selectedCiv === 'greek' && isGreekArchBuilding(selectedBuilding)) {
    const godKey = resolveGreekArchGod(selectedMajorGod);
    const theme = GREEK_ARCH_THEMES[godKey];

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);

    const groundTex = getGreekArchGroundTexture(godKey, buildingAge >= 4);
    groundTex.userData.shared = true;
    const groundDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(8.8, 9.2, 0.34, 64),
      new THREE.MeshStandardMaterial({
        map: groundTex,
        roughness: 0.78,
        metalness: 0.05,
      })
    );
    groundDisc.position.y = -0.17;
    groundDisc.receiveShadow = !isSoftwareGl;
    environmentGroup.add(groundDisc);

    const auraRing = new THREE.Mesh(
      new THREE.RingGeometry(3.35, 3.72, 64),
      new THREE.MeshBasicMaterial({
        color: theme.glowHex,
        transparent: true,
        opacity: 0.24 + buildingAge * 0.04,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    auraRing.rotation.x = -Math.PI / 2;
    auraRing.position.y = 0.025;
    environmentGroup.add(auraRing);

    const built = buildGreekArchBuilding(
      selectedBuilding,
      godKey,
      buildingAge,
      !isSoftwareGl
    );
    group = built.root;

    // Optional arrow volley when showcasing the Greek Fortress in defense mode
    const isFortress = selectedBuilding === 'fortress';
    const arrowGeo = isFortress ? new THREE.CylinderGeometry(0.016, 0.016, 0.75, 6) : null;
    if (arrowGeo) arrowGeo.rotateX(Math.PI / 2);
    const arrowMat = isFortress ? new THREE.MeshBasicMaterial({ color: theme.goldHex }) : null;
    const activeArrows: Array<{
      mesh: THREE.Mesh;
      start: THREE.Vector3;
      target: THREE.Vector3;
      progress: number;
      speed: number;
    }> = [];
    let volleyTimer = 0;

    if (arrowGeo && arrowMat) {
      group.userData.disposeExtra = () => {
        arrowGeo.dispose();
        arrowMat.dispose();
      };
    }

    let elapsed = 0;
    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const simTime = getSimTime();

      built.flames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 12 + idx) * 0.14,
          1 + Math.cos(elapsed * 15 + idx) * 0.22,
          1 + Math.sin(elapsed * 11 + idx) * 0.14
        );
      });

      built.cranes.forEach((cr, idx) => {
        cr.rotation.y = Math.sin(elapsed * 0.9 + idx) * 0.45;
      });

      built.windmills.forEach((wm) => {
        wm.rotation.z += dt * 1.35;
      });

      built.portalRings.forEach((ring, i) => {
        ring.rotation.z += dt * (i % 2 === 0 ? 1.6 : -1.2);
        ring.scale.setScalar(1 + Math.sin(elapsed * 5 + i) * 0.055);
      });

      if (built.beaconCrystal) {
        built.beaconCrystal.rotation.y += dt * 1.5;
      }
      if (built.metropolisHalo) {
        built.metropolisHalo.rotation.z += dt * 0.8;
      }
      if (built.metropolisCrystal) {
        built.metropolisCrystal.rotation.y += dt * 1.5;
      }

      // Smooth periodic demonstration of the articulated Greek double gate doors
      if (built.gates.length > 0) {
        const shouldOpen = Math.sin(elapsed * 0.85) > 0.0;
        const targetAng = shouldOpen ? 1.28 : 0.0;
        for (const gt of built.gates) {
          gt.currentAngle = THREE.MathUtils.damp(gt.currentAngle, targetAng, 4.5, dt);
          gt.leftPivot.rotation.y = -gt.currentAngle;
          gt.rightPivot.rotation.y = gt.currentAngle;
        }
      }

      auraRing.rotation.z += dt * 0.35;

      if (isFortress && arrowGeo && arrowMat) {
        const act = fortressActionRef.current;
        const ringMat = auraRing.material as THREE.MeshBasicMaterial;
        const targetAura = act === 'bencao' ? 0.78 : 0.24 + buildingAge * 0.04;
        ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetAura, 4, dt);
        auraRing.scale.setScalar(1 + Math.sin(simTime * 3.2) * 0.03);

        if (act === 'defesa') {
          volleyTimer -= dt;
          if (volleyTimer <= 0) {
            volleyTimer = 0.75;
            const count = buildingAge >= 4 ? 8 : 5;
            const originY = 2.6 + buildingAge * 0.32;
            for (let i = 0; i < count; i++) {
              const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
              const dist = 4.6 + Math.random() * 2.8;
              const start = new THREE.Vector3(Math.cos(a) * 1.5, originY, Math.sin(a) * 1.5);
              const target = new THREE.Vector3(Math.cos(a) * dist, 0.05, Math.sin(a) * dist);
              const mesh = new THREE.Mesh(arrowGeo, arrowMat);
              mesh.position.copy(start);
              environmentGroup.add(mesh);
              activeArrows.push({ mesh, start, target, progress: 0, speed: 1.45 + Math.random() * 0.35 });
            }
          }
        }

        for (let i = activeArrows.length - 1; i >= 0; i--) {
          const ar = activeArrows[i];
          ar.progress += dt * ar.speed;
          const p = Math.min(1, ar.progress);
          const pos = new THREE.Vector3().lerpVectors(ar.start, ar.target, p);
          pos.y += Math.sin(p * Math.PI) * 1.35;
          ar.mesh.position.copy(pos);

          const nextP = Math.min(1, p + 0.04);
          const nextPos = new THREE.Vector3().lerpVectors(ar.start, ar.target, nextP);
          nextPos.y += Math.sin(nextP * Math.PI) * 1.35;
          ar.mesh.lookAt(nextPos);

          if (p >= 1) {
            environmentGroup.remove(ar.mesh);
            activeArrows.splice(i, 1);
          }
        }
      }
    };
  } else if (selectedCiv === 'atlantean' && selectedBuilding === 'fortress') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey = (
      rawGod.includes('oranos') || rawGod.includes('urano')
        ? 'oranos'
        : rawGod.includes('gaia')
        ? 'gaia'
        : 'kronos'
    ) as 'kronos' | 'oranos' | 'gaia';
    const theme = ATLANTEAN_FORTRESS_THEMES[godKey] || ATLANTEAN_FORTRESS_THEMES.kronos;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.016);
    addPedestal(3.4, 3.7, theme.orichalcum);

    const effTier = buildingAge >= 4 ? 4 : 3;
    const fortress = buildAtlanteanFortressStudio(godKey, effTier, !isSoftwareGl);
    group = fortress.root;

    const boltGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.85, 6);
    boltGeo.rotateX(Math.PI / 2);
    const boltMat = new THREE.MeshBasicMaterial({ color: theme.boltHex });
    const activeBolts: Array<{ mesh: THREE.Mesh; start: THREE.Vector3; target: THREE.Vector3; progress: number; speed: number }> = [];

    let boltTimer = 0;
    const spawnAtlanteanVolley = (isT4: boolean) => {
      const count = isT4 ? 8 : 6;
      const originY = isT4 ? 3.4 : 3.2;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 4.6 + Math.random() * 2.8;
        const start = new THREE.Vector3(Math.cos(a) * 1.4, originY, Math.sin(a) * 1.4);
        const target = new THREE.Vector3(Math.cos(a) * dist, 0.05, Math.sin(a) * dist);

        const mesh = new THREE.Mesh(boltGeo, boltMat);
        mesh.position.copy(start);
        environmentGroup.add(mesh);

        activeBolts.push({ mesh, start, target, progress: 0, speed: 1.55 + Math.random() * 0.35 });
      }
    };

    let lastTierApplied = effTier;

    group.userData.disposeExtra = () => {
      boltGeo.dispose();
      boltMat.dispose();
    };

    group.userData.animatePose = (dt: number) => {
      const simTime = getSimTime();
      const act = atlanteanFortressActionRef.current;
      const currentT = buildingAge >= 4 ? 4 : 3;
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        fortress.setTier(currentT);
      }

      if (fortress.coreCrystal) {
        fortress.coreCrystal.rotation.y += dt * 1.6;
        fortress.coreCrystal.position.y = 3.15 + Math.sin(simTime * 2.6) * 0.08;
      }

      const targetAura = act === 'bencao' ? 0.78 : currentT === 4 ? 0.25 : 0.0;
      const ringMat = fortress.divineRing.material as THREE.MeshBasicMaterial;
      ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetAura, 4, dt);
      fortress.divineRing.rotation.z += dt * 0.4;
      fortress.divineRing.scale.setScalar(1 + Math.sin(simTime * 3.5) * 0.04);

      if (act === 'defesa') {
        boltTimer -= dt;
        if (boltTimer <= 0) {
          boltTimer = 0.72;
          spawnAtlanteanVolley(currentT === 4);
        }
      }

      for (let i = activeBolts.length - 1; i >= 0; i--) {
        const b = activeBolts[i];
        b.progress += dt * b.speed;
        const p = Math.min(1, b.progress);
        const pos = new THREE.Vector3().lerpVectors(b.start, b.target, p);
        pos.y += Math.sin(p * Math.PI) * 1.25;
        b.mesh.position.copy(pos);

        const nextP = Math.min(1, p + 0.04);
        const nextPos = new THREE.Vector3().lerpVectors(b.start, b.target, nextP);
        nextPos.y += Math.sin(nextP * Math.PI) * 1.25;
        b.mesh.lookAt(nextPos);

        if (p >= 1) {
          environmentGroup.remove(b.mesh);
          activeBolts.splice(i, 1);
        }
      }
    };
  } else if (selectedCiv === 'norse' && selectedBuilding === 'fortress') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey = (
      rawGod.includes('thor')
        ? 'thor'
        : rawGod.includes('loki')
        ? 'loki'
        : rawGod.includes('freyr')
        ? 'freyr'
        : 'odin'
    ) as 'odin' | 'thor' | 'loki' | 'freyr';
    const theme = NORSE_FORTRESS_THEMES[godKey] || NORSE_FORTRESS_THEMES.odin;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.016);
    addPedestal(3.4, 3.7, theme.goldColor);

    const effTier = buildingAge >= 4 ? 4 : 3;
    const fortress = buildNorseFortressStudio(godKey, effTier, !isSoftwareGl);
    group = fortress.root;

    const spearGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.88, 6);
    spearGeo.rotateX(Math.PI / 2);
    const spearMat = new THREE.MeshBasicMaterial({ color: theme.spearHex });
    const activeSpears: Array<{ mesh: THREE.Mesh; start: THREE.Vector3; target: THREE.Vector3; progress: number; speed: number }> = [];

    let volleyTimer = 0;
    const spawnNorseVolley = (isT4: boolean) => {
      const count = isT4 ? 8 : 5;
      const originY = isT4 ? 3.8 : 2.8;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 4.6 + Math.random() * 2.8;
        const start = new THREE.Vector3(Math.cos(a) * 1.5, originY, Math.sin(a) * 1.5);
        const target = new THREE.Vector3(Math.cos(a) * dist, 0.05, Math.sin(a) * dist);

        const mesh = new THREE.Mesh(spearGeo, spearMat);
        mesh.position.copy(start);
        environmentGroup.add(mesh);

        activeSpears.push({ mesh, start, target, progress: 0, speed: 1.45 + Math.random() * 0.35 });
      }
    };

    const SNOW_COUNT = 240;
    const snowPos = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
      snowPos[i * 3] = (Math.random() - 0.5) * 12;
      snowPos[i * 3 + 1] = Math.random() * 5.5;
      snowPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    const snowMat = new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.08, transparent: true, opacity: 0.0 });
    const snowPoints = new THREE.Points(snowGeo, snowMat);
    environmentGroup.add(snowPoints);

    let lastTierApplied = effTier;
    let lastFrostState = false;

    group.userData.disposeExtra = () => {
      spearGeo.dispose();
      spearMat.dispose();
      snowGeo.dispose();
      snowMat.dispose();
    };

    group.userData.animatePose = (dt: number) => {
      const act = norseFortressActionRef.current;
      const currentT = buildingAge >= 4 ? 4 : 3;
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        fortress.setTier(currentT);
      }

      const isFrost = act === 'geada';
      if (isFrost !== lastFrostState) {
        lastFrostState = isFrost;
        fortress.setFrostState(isFrost);
      }

      const targetFrostOpacity = isFrost ? 0.85 : currentT === 4 ? 0.22 : 0.0;
      const ringMat = fortress.frostRing.material as THREE.MeshBasicMaterial;
      ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetFrostOpacity, 4, dt);
      fortress.frostRing.rotation.z += dt * 0.35;

      snowMat.opacity = THREE.MathUtils.damp(snowMat.opacity, isFrost ? 0.9 : 0.0, 4, dt);
      if (snowMat.opacity > 0.02) {
        const sAttr = snowGeo.attributes.position;
        for (let i = 0; i < SNOW_COUNT; i++) {
          let sy = sAttr.getY(i) - dt * 1.4;
          if (sy < 0) sy = 5.5;
          sAttr.setY(i, sy);
        }
        sAttr.needsUpdate = true;
      }

      if (act === 'defesa') {
        volleyTimer -= dt;
        if (volleyTimer <= 0) {
          volleyTimer = 0.72;
          spawnNorseVolley(currentT === 4);
        }
      }

      for (let i = activeSpears.length - 1; i >= 0; i--) {
        const sp = activeSpears[i];
        sp.progress += dt * sp.speed;
        const p = Math.min(1, sp.progress);
        const pos = new THREE.Vector3().lerpVectors(sp.start, sp.target, p);
        pos.y += Math.sin(p * Math.PI) * 1.35;
        sp.mesh.position.copy(pos);

        const nextP = Math.min(1, p + 0.04);
        const nextPos = new THREE.Vector3().lerpVectors(sp.start, sp.target, nextP);
        nextPos.y += Math.sin(nextP * Math.PI) * 1.35;
        sp.mesh.lookAt(nextPos);

        if (p >= 1) {
          environmentGroup.remove(sp.mesh);
          activeSpears.splice(i, 1);
        }
      }
    };
  } else if (selectedCiv === 'greek' && selectedBuilding === 'temple') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey = (
      rawGod.includes('poseidon') ? 'poseidon' : rawGod.includes('hades') ? 'hades' : 'zeus'
    ) as GreekTempleGodKey;
    const theme = GREEK_TEMPLE_THEMES[godKey] || GREEK_TEMPLE_THEMES.zeus;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
    addPedestal(3.6, 4.0, theme.goldHex);

    const effTier = Math.max(1, Math.min(5, buildingAge));
    const temple = buildGreekTempleStudio(godKey, effTier, !isSoftwareGl);
    group = temple.root;

    const miracleBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 2.25, 14, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: theme.glowHex,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    miracleBeam.position.y = 7.0;
    environmentGroup.add(miracleBeam);

    const FAVOR_N = 140;
    const favorPos = new Float32Array(FAVOR_N * 3);
    const favorSpeed = new Float32Array(FAVOR_N);
    for (let i = 0; i < FAVOR_N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 2.8;
      favorPos[i * 3] = Math.cos(a) * r;
      favorPos[i * 3 + 1] = Math.random() * 5.5;
      favorPos[i * 3 + 2] = Math.sin(a) * r;
      favorSpeed[i] = 0.45 + Math.random() * 0.75;
    }
    const favorGeo = new THREE.BufferGeometry();
    favorGeo.setAttribute('position', new THREE.BufferAttribute(favorPos, 3));
    const favorMat = new THREE.PointsMaterial({
      color: theme.glowHex,
      size: 0.11,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const favorPoints = new THREE.Points(favorGeo, favorMat);
    environmentGroup.add(favorPoints);

    let lastTierApplied = effTier;
    let elapsed = 0;

    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const currentT = Math.max(1, Math.min(5, buildingAge));
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        temple.setTier(currentT);
      }

      temple.allFlames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 12 + idx) * 0.14,
          1 + Math.cos(elapsed * 15 + idx) * 0.22,
          1 + Math.sin(elapsed * 11 + idx) * 0.14
        );
      });

      const act = templeActionRef.current;
      const isMiracle = act === 'milagre';

      const beamTarget = isMiracle ? 0.65 : 0.0;
      const mbMat = miracleBeam.material as THREE.MeshBasicMaterial;
      mbMat.opacity = THREE.MathUtils.damp(mbMat.opacity, beamTarget, 4, dt);
      miracleBeam.rotation.y += dt * 1.2;

      const ringTarget = isMiracle ? 0.85 : 0.18 + currentT * 0.04;
      const ringMat = temple.favorRing.material as THREE.MeshBasicMaterial;
      ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, ringTarget, 4, dt);
      temple.favorRing.rotation.z += dt * 0.35;

      const fAttr = favorGeo.attributes.position;
      const speedMult = isMiracle ? 2.8 : 1.0;
      for (let i = 0; i < FAVOR_N; i++) {
        let fy = fAttr.getY(i) + favorSpeed[i] * dt * speedMult;
        if (fy > 6.2) fy = 0.2;
        fAttr.setY(i, fy);
      }
      fAttr.needsUpdate = true;
    };
  } else if (selectedCiv === 'egyptian' && selectedBuilding === 'temple') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey = (
      rawGod.includes('isis') ? 'isis' : rawGod.includes('set') ? 'set' : 'ra'
    ) as EgyptianTempleGodKey;
    const theme = EGYPT_TEMPLE_THEMES[godKey] || EGYPT_TEMPLE_THEMES.ra;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
    addPedestal(3.6, 4.0, theme.goldHex);

    const effTier = Math.max(1, Math.min(5, buildingAge));
    const temple = buildEgyptianTempleStudio(godKey, effTier, !isSoftwareGl);
    group = temple.root;

    const solarBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 2.45, 14, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: theme.glowHex,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    solarBeam.position.y = 7.0;
    environmentGroup.add(solarBeam);

    const FAVOR_N = 140;
    const favorPos = new Float32Array(FAVOR_N * 3);
    const favorSpeed = new Float32Array(FAVOR_N);
    for (let i = 0; i < FAVOR_N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 2.8;
      favorPos[i * 3] = Math.cos(a) * r;
      favorPos[i * 3 + 1] = Math.random() * 5.5;
      favorPos[i * 3 + 2] = Math.sin(a) * r;
      favorSpeed[i] = 0.45 + Math.random() * 0.75;
    }
    const favorGeo = new THREE.BufferGeometry();
    favorGeo.setAttribute('position', new THREE.BufferAttribute(favorPos, 3));
    const favorMat = new THREE.PointsMaterial({
      color: theme.glowHex,
      size: 0.11,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const favorPoints = new THREE.Points(favorGeo, favorMat);
    environmentGroup.add(favorPoints);

    let lastTierApplied = effTier;
    let elapsed = 0;

    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const currentT = Math.max(1, Math.min(5, buildingAge));
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        temple.setTier(currentT);
      }

      temple.allFlames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 12 + idx) * 0.14,
          1 + Math.cos(elapsed * 15 + idx) * 0.22,
          1 + Math.sin(elapsed * 11 + idx) * 0.14
        );
      });

      const act = templeActionRef.current;
      const isMiracle = act === 'milagre';

      const beamTarget = isMiracle ? 0.65 : 0.0;
      const sbMat = solarBeam.material as THREE.MeshBasicMaterial;
      sbMat.opacity = THREE.MathUtils.damp(sbMat.opacity, beamTarget, 4, dt);
      solarBeam.rotation.y += dt * 1.2;

      const ringTarget = isMiracle ? 0.85 : 0.18 + currentT * 0.04;
      const ringMat = temple.favorRing.material as THREE.MeshBasicMaterial;
      ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, ringTarget, 4, dt);
      temple.favorRing.rotation.z += dt * 0.35;

      const fAttr = favorGeo.attributes.position;
      const speedMult = isMiracle ? 2.8 : 1.0;
      for (let i = 0; i < FAVOR_N; i++) {
        let fy = fAttr.getY(i) + favorSpeed[i] * dt * speedMult;
        if (fy > 6.2) fy = 0.2;
        fAttr.setY(i, fy);
      }
      fAttr.needsUpdate = true;
    };
  } else if (selectedCiv === 'egyptian' && isEgyptianArchBuilding(selectedBuilding)) {
    const godKey = resolveEgyptianArchGod(selectedMajorGod);
    const theme = EGYPT_ARCH_THEMES[godKey];

    scene.background = new THREE.Color(theme.bg);
    scene.fog = new THREE.FogExp2(theme.bg, 0.016);

    const groundTex = getEgyptianArchGroundTexture(godKey);
    groundTex.userData.shared = true;
    const groundDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(8.6, 8.9, 0.3, 64),
      new THREE.MeshStandardMaterial({
        map: groundTex,
        roughness: 0.78,
      })
    );
    groundDisc.position.y = -0.15;
    groundDisc.receiveShadow = !isSoftwareGl;
    environmentGroup.add(groundDisc);

    const deityRing = new THREE.Mesh(
      new THREE.RingGeometry(4.2, 4.38, 64),
      new THREE.MeshBasicMaterial({
        color: theme.glow,
        transparent: true,
        opacity: 0.68,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    deityRing.rotation.x = -Math.PI / 2;
    deityRing.position.y = 0.015;
    environmentGroup.add(deityRing);

    const built = buildEgyptianArchBuilding(
      selectedBuilding,
      godKey,
      buildingAge,
      !isSoftwareGl
    );
    group = built.root;

    let elapsed = 0;
    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      built.flames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 12 + idx * 1.7) * 0.14,
          1 + Math.cos(elapsed * 15 + idx * 1.3) * 0.22,
          1 + Math.sin(elapsed * 11 + idx * 1.1) * 0.14
        );
      });
      if (selectedBuilding === 'armory') {
        built.furnaceMat.emissiveIntensity = 1.45 + Math.sin(elapsed * 4.5) * 0.35;
      }
    };
  } else if (selectedCiv === 'greek' && selectedBuilding === 'house') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey = rawGod.includes('poseidon')
      ? 'poseidon'
      : rawGod.includes('hades')
      ? 'hades'
      : 'zeus';
    const theme = GREEK_BUILDINGS_THEMES[godKey] || GREEK_BUILDINGS_THEMES.zeus;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
    addPedestal(2.8, 3.1, theme.goldHex);

    const effTier = Math.max(1, Math.min(5, buildingAge));
    const houseStudio = buildGreekHouseStudio(godKey, effTier, !isSoftwareGl);
    group = houseStudio.root;

    let lastTierApplied = effTier;
    let lastGodApplied = godKey;
    let elapsed = 0;

    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const currentT = Math.max(1, Math.min(5, buildingAge));
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        houseStudio.setTier(currentT);
      }

      const nextRaw = selectedMajorGod.toLowerCase();
      const currentGod = nextRaw.includes('poseidon')
        ? 'poseidon'
        : nextRaw.includes('hades')
        ? 'hades'
        : 'zeus';

      if (currentGod !== lastGodApplied) {
        lastGodApplied = currentGod;
        houseStudio.applyGod(currentGod);
        const newTheme = GREEK_BUILDINGS_THEMES[currentGod] || GREEK_BUILDINGS_THEMES.zeus;
        if (scene.background instanceof THREE.Color) scene.background.setHex(newTheme.bgHex);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(newTheme.bgHex);
      }

      if (houseStudio.auraRing) {
        houseStudio.auraRing.rotation.z += dt * 0.25;
        houseStudio.auraRing.scale.setScalar(1 + Math.sin(elapsed * 2.5) * 0.025);
      }
      houseStudio.M.flames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 12 + idx * 1.5) * 0.12,
          1 + Math.cos(elapsed * 14 + idx * 1.2) * 0.18,
          1 + Math.sin(elapsed * 10 + idx * 1.7) * 0.12
        );
      });
    };
  } else if (selectedCiv === 'greek' && selectedBuilding === 'town_center') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey = rawGod.includes('poseidon')
      ? 'poseidon'
      : rawGod.includes('hades')
      ? 'hades'
      : 'zeus';
    const theme = GREEK_TOWN_CENTER_THEMES[godKey] || GREEK_TOWN_CENTER_THEMES.zeus;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.014);
    addPedestal(4.2, 4.6, theme.goldHex);

    const effTier = Math.max(1, Math.min(5, buildingAge));
    const tcStudio = buildGreekTownCenterStudio(godKey, effTier, !isSoftwareGl);
    group = tcStudio.root;

    let lastTierApplied = effTier;
    let lastGodApplied = godKey;
    let elapsed = 0;

    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const currentT = Math.max(1, Math.min(5, buildingAge));
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        tcStudio.setTier(currentT);
      }

      const nextRaw = selectedMajorGod.toLowerCase();
      const currentGod = nextRaw.includes('poseidon')
        ? 'poseidon'
        : nextRaw.includes('hades')
        ? 'hades'
        : 'zeus';

      if (currentGod !== lastGodApplied) {
        lastGodApplied = currentGod;
        tcStudio.applyGod(currentGod);
        const newTheme = GREEK_TOWN_CENTER_THEMES[currentGod] || GREEK_TOWN_CENTER_THEMES.zeus;
        if (scene.background instanceof THREE.Color) scene.background.setHex(newTheme.bgHex);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(newTheme.bgHex);
      }

      if (tcStudio.auraRing) {
        tcStudio.auraRing.rotation.z += dt * 0.28;
        tcStudio.auraRing.scale.setScalar(
          (1 + (currentT - 1) * 0.11) * (1 + Math.sin(elapsed * 2.2) * 0.02)
        );
      }

      tcStudio.M.flames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 13 + idx) * 0.14,
          1 + Math.cos(elapsed * 16 + idx) * 0.22,
          1 + Math.sin(elapsed * 12 + idx) * 0.14
        );
      });
    };
  } else if (selectedCiv === 'norse' && selectedBuilding === 'town_center') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey = rawGod.includes('thor')
      ? 'thor'
      : rawGod.includes('loki')
      ? 'loki'
      : rawGod.includes('freyr')
      ? 'freyr'
      : 'odin';
    const theme = NORSE_TOWN_CENTER_THEMES[godKey] || NORSE_TOWN_CENTER_THEMES.odin;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
    addPedestal(4.2, 4.6, theme.goldHex);

    const effTier = Math.max(1, Math.min(5, buildingAge));
    const tcStudio = buildNorseTownCenterStudio(godKey, effTier, !isSoftwareGl);
    group = tcStudio.root;

    let lastTierApplied = effTier;
    let lastGodApplied = godKey;
    let elapsed = 0;

    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const currentT = Math.max(1, Math.min(5, buildingAge));
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        tcStudio.setTier(currentT);
      }

      const nextRaw = selectedMajorGod.toLowerCase();
      const currentGod = nextRaw.includes('thor')
        ? 'thor'
        : nextRaw.includes('loki')
        ? 'loki'
        : nextRaw.includes('freyr')
        ? 'freyr'
        : 'odin';

      if (currentGod !== lastGodApplied) {
        lastGodApplied = currentGod;
        tcStudio.applyGod(currentGod);
        const newTheme = NORSE_TOWN_CENTER_THEMES[currentGod] || NORSE_TOWN_CENTER_THEMES.odin;
        if (scene.background instanceof THREE.Color) scene.background.setHex(newTheme.bgHex);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(newTheme.bgHex);
      }

      if (tcStudio.auraRing) {
        tcStudio.auraRing.rotation.z += dt * 0.28;
        tcStudio.auraRing.scale.setScalar(
          (1 + (currentT - 1) * 0.11) * (1 + Math.sin(elapsed * 2.2) * 0.02)
        );
      }

      tcStudio.M.flames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 13 + idx) * 0.14,
          1 + Math.cos(elapsed * 16 + idx) * 0.22,
          1 + Math.sin(elapsed * 12 + idx) * 0.14
        );
      });
    };
  } else if (selectedCiv === 'egyptian' && selectedBuilding === 'town_center') {
    const rawGod = selectedMajorGod
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const godKey = rawGod.includes('isis')
      ? 'isis'
      : rawGod.includes('set')
      ? 'set'
      : 'ra';
    const theme = EGYPTIAN_TOWN_CENTER_THEMES[godKey] || EGYPTIAN_TOWN_CENTER_THEMES.ra;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
    addPedestal(4.2, 4.6, theme.goldHex);

    const effTier = Math.max(1, Math.min(5, buildingAge));
    const tcStudio = buildEgyptianTownCenterStudio(godKey, effTier, !isSoftwareGl);
    group = tcStudio.root;

    let lastTierApplied = effTier;
    let lastGodApplied = godKey;
    let elapsed = 0;

    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const currentT = Math.max(1, Math.min(5, buildingAge));
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        tcStudio.setTier(currentT);
      }

      const nextRaw = selectedMajorGod
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      const currentGod = nextRaw.includes('isis')
        ? 'isis'
        : nextRaw.includes('set')
        ? 'set'
        : 'ra';

      if (currentGod !== lastGodApplied) {
        lastGodApplied = currentGod;
        tcStudio.applyGod(currentGod);
        const newTheme = EGYPTIAN_TOWN_CENTER_THEMES[currentGod] || EGYPTIAN_TOWN_CENTER_THEMES.ra;
        if (scene.background instanceof THREE.Color) scene.background.setHex(newTheme.bgHex);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(newTheme.bgHex);
      }

      if (tcStudio.auraRing) {
        tcStudio.auraRing.rotation.z += dt * 0.28;
        tcStudio.auraRing.scale.setScalar(
          (1 + (currentT - 1) * 0.11) * (1 + Math.sin(elapsed * 2.2) * 0.02)
        );
      }

      tcStudio.M.flames.forEach((fl, idx) => {
        fl.scale.set(
          1 + Math.sin(elapsed * 13 + idx) * 0.14,
          1 + Math.cos(elapsed * 16 + idx) * 0.22,
          1 + Math.sin(elapsed * 12 + idx) * 0.14
        );
      });
    };
  } else if (selectedCiv === 'atlantean' && selectedBuilding === 'town_center') {
    const rawGod = selectedMajorGod.toLowerCase();
    const godKey =
      rawGod.includes('oranos') || rawGod.includes('urano')
        ? 'oranos'
        : rawGod.includes('gaia')
        ? 'gaia'
        : 'kronos';
    const theme = ATLANTEAN_TOWN_CENTER_THEMES[godKey] || ATLANTEAN_TOWN_CENTER_THEMES.kronos;

    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.bgHex, 0.015);
    addPedestal(4.2, 4.6, theme.goldHex);

    const effTier = Math.max(1, Math.min(5, buildingAge));
    const tcStudio = buildAtlanteanTownCenterStudio(godKey, effTier, !isSoftwareGl);
    group = tcStudio.root;

    let lastTierApplied = effTier;
    let lastGodApplied = godKey;
    let elapsed = 0;

    group.userData.animatePose = (dt: number) => {
      elapsed += dt;
      const currentT = Math.max(1, Math.min(5, buildingAge));
      if (currentT !== lastTierApplied) {
        lastTierApplied = currentT;
        tcStudio.setTier(currentT);
      }

      const nextRaw = selectedMajorGod.toLowerCase();
      const currentGod =
        nextRaw.includes('oranos') || nextRaw.includes('urano')
          ? 'oranos'
          : nextRaw.includes('gaia')
          ? 'gaia'
          : 'kronos';

      if (currentGod !== lastGodApplied) {
        lastGodApplied = currentGod;
        tcStudio.applyGod(currentGod);
        const newTheme = ATLANTEAN_TOWN_CENTER_THEMES[currentGod] || ATLANTEAN_TOWN_CENTER_THEMES.kronos;
        if (scene.background instanceof THREE.Color) scene.background.setHex(newTheme.bgHex);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(newTheme.bgHex);
      }

      if (tcStudio.auraRing) {
        tcStudio.auraRing.rotation.z += dt * 0.28;
        tcStudio.auraRing.scale.setScalar(
          (1 + (currentT - 1) * 0.11) * (1 + Math.sin(elapsed * 2.2) * 0.02)
        );
      }

      tcStudio.M.flames.forEach((fl, idx) => {
        fl.scale.set(
          0.85 + Math.sin(elapsed * 10 + idx) * 0.12,
          1.55 + Math.cos(elapsed * 12 + idx) * 0.18,
          0.85 + Math.sin(elapsed * 10 + idx) * 0.12
        );
      });

      tcStudio.M.relics.forEach((rel, idx) => {
        rel.rotation.y += dt * 1.3;
        rel.position.y += Math.sin(elapsed * 3.0 + idx) * 0.0012;
      });

      tcStudio.M.relicRings.forEach((ring, idx) => {
        ring.rotation.z += dt * (idx % 2 === 0 ? 1.1 : -1.1);
      });
    };
  } else {
    scene.background = defaultBg.clone();
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.014);
    addPedestal(3.1, 3.4, 0xd4af37);

    group = createBuildingMesh(
      selectedBuilding,
      'player',
      pal,
      !isSoftwareGl,
      selectedCiv,
      selectedMajorGod,
      buildingAge
    );
  }

  if (showHumanScale) {
    const refVillager = createUnitMesh('villager', 'player', pal, !isSoftwareGl, selectedCiv, selectedMajorGod);
    refVillager.position.set(-2.55, 0, 1.9);
    refVillager.rotation.y = 0.55;
    environmentGroup.add(refVillager);
  }

  return group;
}
