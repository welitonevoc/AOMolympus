import * as THREE from 'three';
import { TeamId, UnitKind } from '../types';
import { buildCharybdisTitan, getCachedCaribdisTextures } from '../../civilizacao/gregos/caribdisModel';
import { buildTyphonTitan, getCachedTyphonTextures } from '../../civilizacao/gregos/tifaoModel';
import { buildCerberusTitan, getCachedCerberusTextures } from '../../civilizacao/gregos/cerberoModel';
import { buildArtemis, getCachedArtemisTextures, animateArtemis } from '../../civilizacao/gregos/artemisModel';
import { buildHephaestus, getCachedHephaestusTextures, animateHephaestus } from '../../civilizacao/gregos/hefestoModel';
import { buildDionysus, getCachedDionysusTextures, animateDionysus } from '../../civilizacao/gregos/dionisioModel';
import { buildAphrodite, getCachedAphroditeTextures, animateAphrodite } from '../../civilizacao/gregos/afroditeModel';
import { buildApollo, getCachedApolloTextures, animateApollo } from '../../civilizacao/gregos/apoloModel';
import { buildAres, getCachedAresTextures, animateAres } from '../../civilizacao/gregos/aresModel';
import { buildAthena, getCachedAtenaTextures, animateAthena } from '../../civilizacao/gregos/atenaModel';
import { buildHermes, getCachedHermesTextures, animateHermes } from '../../civilizacao/gregos/hermesModel';
import { buildZeus, getCachedZeusTextures, animateZeus } from '../../civilizacao/gregos/zeusModel';
import { buildPoseidon, getCachedPoseidonTextures, animatePoseidon } from '../../civilizacao/gregos/poseidonModel';
import { buildHades, getCachedHadesTextures, animateHades } from '../../civilizacao/gregos/hadesModel';
import { buildIsis, getCachedIsisTextures, animateIsis } from '../../civilizacao/egipcios/isisModel';
import { buildSet, getCachedSetTextures, animateSet } from '../../civilizacao/egipcios/setModel';
import { buildRa, getCachedRaTextures, animateRa } from '../../civilizacao/egipcios/raModel';
import { createChineseDragonTitanMesh } from '../../civilizacao/chineses/chineseModels';
import { CivLook, MaterialPalette } from './palette';
import { attachGroundMarkers, attachHealthBar, getSculptedGeos } from './shared';

export function buildTitanUnitRoot(
  root: THREE.Group,
  team: TeamId,
  pal: MaterialPalette,
  look: CivLook,
  enableShadows: boolean,
  majorGod?: string
): THREE.Group {
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const geos = getSculptedGeos();
  const godKey = (majorGod || 'zeus').toLowerCase();

  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (enableShadows) m.castShadow = true;
    root.add(m);
    return m;
  };

  if (godKey.includes('zeus')) {
    const typhonTex = getCachedTyphonTextures();
    const typhon = buildTyphonTitan(typhonTex);
    typhon.titanRoot.scale.setScalar(2.15);
    root.add(typhon.titanRoot);
    root.userData.typhon = typhon;

    let tPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      tPhase += dt;
      typhon.funnelMesh.rotation.y += dt * (moving ? 4.8 : 2.4);
      typhon.cycloneRings.forEach((cr) => {
        cr.mesh.rotation.z += dt * 3.2;
        cr.mesh.position.y = cr.baseY + Math.sin(tPhase * 3.6 + cr.phase) * 0.08;
      });
      const wingFlap = Math.sin(tPhase * (moving ? 3.6 : 1.8)) * 0.24;
      if (typhon.wings.L) typhon.wings.L.wingRoot.rotation.y = -wingFlap;
      if (typhon.wings.R) typhon.wings.R.wingRoot.rotation.y = wingFlap;
      typhon.waistSerpents.forEach((ws) => {
        ws.root.rotation.z = Math.sin(tPhase * 2.8 + ws.side) * 0.16;
      });
      if (attackT !== null) {
        typhon.rightArm.arm.rotation.x = -Math.sin(attackT * Math.PI) * 1.25;
        typhon.leftArm.arm.rotation.x = -Math.sin(attackT * Math.PI) * 0.85;
      } else {
        typhon.rightArm.arm.rotation.x *= 0.88;
        typhon.leftArm.arm.rotation.x *= 0.88;
      }
    };

    root.userData.setMode = (_mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
      // 3D & 2.5D support
    };

    attachGroundMarkers(root, 2.25, pal, team);
    attachHealthBar(root, 9.2, 2.8);
    return root;
  }

  if (godKey.includes('poseidon')) {
    const caribTex = getCachedCaribdisTextures();
    const caribdis = buildCharybdisTitan(caribTex);
    caribdis.root.scale.setScalar(2.22);
    root.add(caribdis.root);
    root.userData.caribdis = caribdis;

    let cPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      cPhase += dt;
      caribdis.whirlpoolGroup.rotation.y += dt * (moving ? 4.2 : 2.0);
      caribdis.whirlRings.forEach((wr) => {
        wr.mesh.rotation.z += dt * 2.8;
        wr.mesh.position.y = wr.baseY + Math.sin(cPhase * 3.2 + wr.phase) * 0.07;
      });
      caribdis.backTentacles.forEach((bt) => {
        bt.segs.forEach((seg, sIdx) => {
          seg.pivot.rotation.x = Math.sin(cPhase * 2.4 + seg.phase) * (0.08 + sIdx * 0.04);
          seg.pivot.rotation.z = Math.cos(cPhase * 2.0 + seg.phase) * (0.06 + sIdx * 0.03);
        });
      });
      if (attackT !== null) {
        const clawStrike = Math.sin(attackT * Math.PI);
        caribdis.armL.rotation.x = -clawStrike * 1.15;
        caribdis.clawUpper.rotation.z = 0.28 + clawStrike * 0.45;
        caribdis.clawLower.rotation.z = -0.28 - clawStrike * 0.45;
        caribdis.jawPivot.rotation.x = clawStrike * 0.38;
      } else {
        caribdis.armL.rotation.x *= 0.88;
        caribdis.clawUpper.rotation.z = 0.28;
        caribdis.clawLower.rotation.z = -0.28;
        caribdis.jawPivot.rotation.x *= 0.88;
      }
    };

    root.userData.setMode = (_mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
      // 3D & 2.5D support
    };

    attachGroundMarkers(root, 2.25, pal, team);
    attachHealthBar(root, 9.2, 2.8);
    return root;
  }

  if (godKey.includes('hades')) {
    const cerbTex = getCachedCerberusTextures();
    const cerberus = buildCerberusTitan(cerbTex);
    cerberus.titanRoot.scale.setScalar(1.94);
    root.add(cerberus.titanRoot);
    root.userData.cerberus = cerberus;

    let cerbPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
      cerbPhase += dt;
      const breath = Math.sin(cerbPhase * 2.2) * 0.025;
      cerberus.body.position.y = 1.32 + breath;

      cerberus.veinMatHell.emissiveIntensity = 2.8 + Math.sin(cerbPhase * 5.0) * 0.8;
      cerberus.veinMatSoul.emissiveIntensity = 2.4 + Math.cos(cerbPhase * 4.5) * 0.7;

      const jawOpen = attackT !== null ? 0.38 : 0.08;
      cerberus.neckCenter.rotation.y = Math.sin(cerbPhase * 1.1) * 0.14;
      cerberus.headCenterObj.jawPivot.rotation.x = jawOpen + Math.max(0, Math.sin(cerbPhase * 3.4)) * 0.18;

      cerberus.neckLeft.rotation.y = 0.34 + Math.cos(cerbPhase * 1.4) * 0.16;
      cerberus.headLeftObj.jawPivot.rotation.x = jawOpen + Math.max(0, Math.cos(cerbPhase * 3.8)) * 0.18;

      cerberus.neckRight.rotation.y = -0.34 + Math.sin(cerbPhase * 1.3 + 1.5) * 0.16;
      cerberus.headRightObj.jawPivot.rotation.x = jawOpen + Math.max(0, Math.sin(cerbPhase * 3.6 + 1.2)) * 0.18;

      const tailSpeed = moving ? 5.2 : 3.0;
      for (const ts of cerberus.tailSegments) {
        ts.pivot.rotation.y = Math.sin(cerbPhase * tailSpeed - ts.phase) * 0.26;
      }

      if (moving) {
        const stride = cerbPhase * speed * 2.8;
        const sinS = Math.sin(stride);
        const cosS = Math.cos(stride);
        cerberus.legs.L.hip.rotation.x = -0.18 + sinS * 0.42;
        cerberus.legs.L.knee.rotation.x = 0.24 + Math.max(0, -cosS) * 0.45;
        cerberus.legs.R.hip.rotation.x = -0.18 - sinS * 0.42;
        cerberus.legs.R.knee.rotation.x = 0.24 + Math.max(0, cosS) * 0.45;

        cerberus.rightArm.arm.rotation.x = -0.26 - sinS * 0.35;
        cerberus.leftArm.arm.rotation.x = -0.26 + sinS * 0.35;
      } else {
        cerberus.legs.L.hip.rotation.x *= 0.9;
        cerberus.legs.R.hip.rotation.x *= 0.9;
        cerberus.rightArm.arm.rotation.x *= 0.9;
        cerberus.leftArm.arm.rotation.x *= 0.9;
      }

      if (attackT !== null) {
        const strike = Math.sin(attackT * Math.PI);
        cerberus.rightArm.arm.rotation.x = -strike * 1.2;
        cerberus.leftArm.arm.rotation.x = -strike * 0.8;
      }
    };

    root.userData.setMode = (_mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
      // 3D & 2.5D support
    };

    attachGroundMarkers(root, 2.25, pal, team);
    attachHealthBar(root, 9.2, 2.8);
    return root;
  }

  if (
    godKey.includes('fu xi') ||
    godKey.includes('nü wa') ||
    godKey.includes('nu wa') ||
    godKey.includes('shennong') ||
    look.style === 'chinese'
  ) {
    const chnTitan = createChineseDragonTitanMesh(pal, enableShadows);
    root.add(chnTitan);
    root.userData.beaconCrystal = chnTitan.userData.beaconCrystal;
    root.userData.animatePose = chnTitan.userData.animatePose;
    attachGroundMarkers(root, 2.35, pal, team);
    attachHealthBar(root, 9.5, 3.0);
    return root;
  }

  const leftLeg = part(geos.giantLimb, look.titanBodyMat, -0.75, 1.55, 0);
  leftLeg.scale.set(2.4, 2.6, 2.4);
  const rightLeg = part(geos.giantLimb, look.titanBodyMat, 0.75, 1.55, 0);
  rightLeg.scale.set(2.4, 2.6, 2.4);

  part(new THREE.BoxGeometry(0.85, 0.5, 1.15), look.trimMat, -0.75, 0.25, 0.1);
  part(new THREE.BoxGeometry(0.85, 0.5, 1.15), look.trimMat, 0.75, 0.25, 0.1);

  const torso = part(geos.heroCuirass, look.titanBodyMat, 0, 4.4, 0);
  torso.scale.set(4.2, 4.0, 3.8);
  const core = part(new THREE.OctahedronGeometry(0.82, 1), look.titanCoreMat, 0, 4.75, 1.05);
  root.userData.beaconCrystal = core;
  part(new THREE.CylinderGeometry(1.35, 1.6, 0.95, 12), teamMat, 0, 2.85, 0);

  part(new THREE.DodecahedronGeometry(0.95, 0), look.trimMat, -2.0, 5.75, 0);
  part(new THREE.DodecahedronGeometry(0.95, 0), look.trimMat, 2.0, 5.75, 0);

  part(new THREE.SphereGeometry(0.82, 16, 12), look.titanBodyMat, 0, 6.85, 0.08);
  part(new THREE.BoxGeometry(0.82, 0.24, 0.44), look.titanCoreMat, 0, 6.9, 0.72);

  const leftArm = part(geos.giantLimb, look.titanBodyMat, -2.15, 4.5, 0);
  leftArm.scale.set(2.4, 2.5, 2.4);

  const rightArm = new THREE.Group();
  rightArm.position.set(2.15, 5.3, 0);
  const arm = new THREE.Mesh(geos.giantLimb, look.titanBodyMat);
  arm.scale.set(2.4, 2.5, 2.4);
  arm.position.y = -0.95;
  rightArm.add(arm);

  if (godKey.includes('rá') || godKey.includes('ra')) {
    const sunDisc = part(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 24), pal.gold, 0, 8.45, 0);
    sunDisc.rotation.x = Math.PI / 2;
    const wingL = part(new THREE.BoxGeometry(2.8, 4.6, 0.12), pal.goldOre, -1.9, 4.6, -0.9);
    wingL.rotation.y = -0.35;
    const wingR = part(new THREE.BoxGeometry(2.8, 4.6, 0.12), pal.goldOre, 1.9, 4.6, -0.9);
    wingR.rotation.y = 0.35;
    const ankh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.5, 12), pal.gold);
    ankh.rotation.x = Math.PI / 2.2;
    ankh.position.set(0, -1.2, 0.5);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 8, 20), pal.gold);
    loop.position.set(0, 3.1, 0);
    ankh.add(loop);
    rightArm.add(ankh);
  } else if (godKey.includes('ísis') || godKey.includes('isis')) {
    const wingL = part(new THREE.BoxGeometry(3.2, 5.2, 0.12), pal.turquoise, -2.1, 4.8, -0.95);
    wingL.rotation.y = -0.45;
    const wingR = part(new THREE.BoxGeometry(3.2, 5.2, 0.12), pal.turquoise, 2.1, 4.8, -0.95);
    wingR.rotation.y = 0.45;
    const hathorDisc = part(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 20), pal.crystalGlow, 0, 8.25, 0);
    hathorDisc.rotation.x = Math.PI / 2;
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 5.4, 12), pal.ivory);
    staff.rotation.x = Math.PI / 2.2;
    staff.position.set(0, -1.2, 0.5);
    const lotus = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 1), pal.crystalGlow);
    lotus.position.set(0, 3.0, 0);
    staff.add(lotus);
    rightArm.add(staff);
  } else if (godKey.includes('set')) {
    part(new THREE.BoxGeometry(0.22, 1.25, 0.35), pal.sandstoneDark, -0.55, 7.7, 0);
    part(new THREE.BoxGeometry(0.22, 1.25, 0.35), pal.sandstoneDark, 0.55, 7.7, 0);
    part(new THREE.BoxGeometry(0.65, 0.45, 0.95), pal.sandstoneDark, 0, 6.75, 0.75);
    const khopesh = new THREE.Mesh(geos.greatSwordBlade, pal.ember);
    khopesh.rotation.x = Math.PI / 2.2;
    khopesh.scale.set(4.6, 4.8, 4.6);
    khopesh.position.set(0, -1.5, 0.5);
    rightArm.add(khopesh);
  } else if (godKey.includes('odin')) {
    part(new THREE.ConeGeometry(0.48, 1.5, 6), pal.iceBlue, 0, 5.85, 0.65);
    part(new THREE.BoxGeometry(3.0, 4.4, 0.16), pal.norseSlate, 0, 3.8, -0.95);
    const gungnir = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 6.2, 12), pal.norseTimber);
    gungnir.rotation.x = Math.PI / 2.2;
    gungnir.position.set(0, -1.2, 0.5);
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.8, 6), pal.iceBlue);
    spearTip.position.set(0, 3.5, 0);
    gungnir.add(spearTip);
    rightArm.add(gungnir);
  } else if (godKey.includes('thor')) {
    const hL = part(geos.bullHorn, pal.bronze, -0.62, 7.4, 0);
    hL.scale.set(-2.4, 2.4, 2.4);
    const hR = part(geos.bullHorn, pal.bronze, 0.62, 7.4, 0);
    hR.scale.set(2.4, 2.4, 2.4);
    const hammerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 4.8, 12), pal.norseTimber);
    hammerHandle.rotation.x = Math.PI / 2.2;
    hammerHandle.position.set(0, -1.0, 0.5);
    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.15, 1.25), pal.steel);
    hammerHead.position.set(0, 2.4, 0);
    hammerHandle.add(hammerHead);
    rightArm.add(hammerHandle);
  } else if (godKey.includes('loki')) {
    const hL = part(new THREE.ConeGeometry(0.32, 1.6, 6), pal.ember, -0.7, 7.6, 0);
    hL.rotation.z = -0.55;
    const hR = part(new THREE.ConeGeometry(0.32, 1.6, 6), pal.ember, 0.7, 7.6, 0);
    hR.rotation.z = 0.55;
    const fireBlade = new THREE.Mesh(geos.greatSwordBlade, pal.ember);
    fireBlade.rotation.x = Math.PI / 2.2;
    fireBlade.scale.set(4.8, 5.2, 4.8);
    fireBlade.position.set(0, -1.6, 0.5);
    rightArm.add(fireBlade);
  } else if (godKey.includes('cronos') || godKey.includes('kronos')) {
    part(new THREE.TorusGeometry(1.2, 0.08, 8, 24), pal.orichalcum, 0, 4.75, 1.05);
    const ring2 = part(new THREE.TorusGeometry(1.5, 0.07, 8, 24), pal.crystalGlow, 0, 4.75, 1.05);
    ring2.rotation.x = Math.PI / 3;
    const scytheHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.8, 12), pal.obsidian);
    scytheHandle.rotation.x = Math.PI / 2.2;
    scytheHandle.position.set(0, -1.2, 0.5);
    const blade = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.15, 8, 16, Math.PI * 0.75), pal.orichalcum);
    blade.position.set(0.7, 2.9, 0);
    blade.rotation.z = Math.PI / 4;
    scytheHandle.add(blade);
    rightArm.add(scytheHandle);
  } else if (godKey.includes('urano') || godKey.includes('ouranos')) {
    part(new THREE.TorusGeometry(1.35, 0.12, 12, 32), pal.crystalGlow, 0, 4.75, 1.05);
    const plasmaSword = new THREE.Mesh(geos.greatSwordBlade, pal.crystalGlow);
    plasmaSword.rotation.x = Math.PI / 2.2;
    plasmaSword.scale.set(4.6, 5.0, 4.6);
    plasmaSword.position.set(0, -1.5, 0.5);
    rightArm.add(plasmaSword);
  } else if (godKey.includes('gaia')) {
    part(new THREE.SphereGeometry(0.95, 10, 8), pal.jade, -2.1, 6.4, 0);
    part(new THREE.SphereGeometry(0.95, 10, 8), pal.jade, 2.1, 6.4, 0);
    part(new THREE.CylinderGeometry(0.3, 0.45, 1.8, 8), pal.timber, -2.1, 5.8, -0.6);
    part(new THREE.CylinderGeometry(0.3, 0.45, 1.8, 8), pal.timber, 2.1, 5.8, -0.6);
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.22, 5.2, 10), pal.timber);
    club.rotation.x = Math.PI / 2.2;
    club.position.set(0, -1.2, 0.5);
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), pal.stoneDark);
    boulder.position.set(0, 2.6, 0);
    club.add(boulder);
    rightArm.add(club);
  } else {
    const titanicBlade = new THREE.Mesh(geos.greatSwordBlade, look.titanCoreMat);
    titanicBlade.rotation.x = Math.PI / 2.2;
    titanicBlade.scale.set(4.4, 4.6, 4.4);
    titanicBlade.position.set(0, -1.55, 0.5);
    rightArm.add(titanicBlade);
  }

  root.add(rightArm);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  attachGroundMarkers(root, 2.25, pal, team);
  attachHealthBar(root, 9.2, 2.8);
  return root;
}

export function buildGodAvatarUnitRoot(
  root: THREE.Group,
  kind: UnitKind,
  team: TeamId,
  pal: MaterialPalette
): THREE.Group | null {
  const bindUpdateBrg = () => {
    // God avatars are driven directly via animatePose in unitSimulationSystem
  };

  if (kind === 'zeus') {
    const zeusTex = getCachedZeusTextures();
    const zeus = buildZeus(zeusTex);
    const zeusHolder = new THREE.Group();
    zeusHolder.scale.setScalar(5.05);
    zeusHolder.position.y = 0.25;
    zeusHolder.add(zeus.flight);
    root.add(zeusHolder);
    let zPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      zPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'tempestade' : 'raios') : moving ? 'voar' : 'pairar';
      animateZeus(zeus, dt, zPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  }
  if (kind === 'poseidon') {
    const posTex = getCachedPoseidonTextures();
    const poseidon = buildPoseidon(posTex);
    poseidon.vessel.scale.setScalar(3.82);
    root.add(poseidon.vessel);
    let pPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      pPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'tsunami' : 'golpe') : moving ? 'correnteza' : 'ondas';
      animatePoseidon(poseidon, dt, pPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  }
  if (kind === 'hades') {
    const hadesTex = getCachedHadesTextures();
    const hades = buildHades(hadesTex);
    hades.vessel.scale.setScalar(3.72);
    root.add(hades.vessel);
    let hPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      hPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'portal' : 'chama') : moving ? 'marcha' : 'reinar';
      animateHades(hades, dt, hPhase, mode, undefined, true);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  }
  if (kind === 'artemis') {
    const artemisTex = getCachedArtemisTextures();
    const artemis = buildArtemis(artemisTex);
    artemis.root.scale.setScalar(2.95);
    root.add(artemis.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'raizes' : moving ? 'cacada' : 'vigilia';
      animateArtemis(artemis, dt, aPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'hefesto') {
    const hefTex = getCachedHephaestusTextures();
    const hef = buildHephaestus(hefTex);
    hef.root.scale.setScalar(3.08);
    root.add(hef.root);
    let hPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      hPhase += dt;
      const mode = attackT !== null ? 'martelo' : moving ? 'automato' : 'forja';
      animateHephaestus(hef, dt, hPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'dionisio') {
    const dioTex = getCachedDionysusTextures();
    const dio = buildDionysus(dioTex);
    dio.root.scale.setScalar(3.02);
    root.add(dio.root);
    let dPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      dPhase += dt;
      const mode = attackT !== null ? 'vinhas' : moving ? 'danca' : 'banquete';
      animateDionysus(dio, dt, dPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'afrodite') {
    const afroTex = getCachedAphroditeTextures();
    const afro = buildAphrodite(afroTex);
    afro.root.scale.setScalar(4.45);
    root.add(afro.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'encanto' : moving ? 'danca' : 'graca';
      animateAphrodite(afro, dt, aPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'apolo') {
    const apoTex = getCachedApolloTextures();
    const apo = buildApollo(apoTex);
    apo.root.scale.setScalar(2.98);
    root.add(apo.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? 'flecha' : moving ? 'voo' : 'pairar';
      animateApollo(apo, dt, aPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'ares') {
    const aresTex = getCachedAresTextures();
    const ares = buildAres(aresTex);
    ares.root.scale.setScalar(2.88);
    root.add(ares.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.6 ? 'sismico' : 'furia') : moving ? 'investida' : 'postura';
      animateAres(ares, dt, aPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'atena') {
    const atenaTex = getCachedAtenaTextures();
    const atena = buildAthena(atenaTex);
    atena.root.scale.setScalar(2.90);
    root.add(atena.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'furia' : 'avanco') : moving ? 'egide' : 'guardia';
      animateAthena(atena, dt, aPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'hermes') {
    const hermesTex = getCachedHermesTextures();
    const hermes = buildHermes(hermesTex);
    hermes.root.scale.setScalar(2.95);
    root.add(hermes.root);
    let aPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      aPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'relampago' : 'rajada') : moving ? 'velocidade' : 'flutuar';
      animateHermes(hermes, dt, aPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.55, pal, team);
    attachHealthBar(root, 11.2, 3.0);
    return root;
  }
  if (kind === 'isis') {
    const isisTex = getCachedIsisTextures();
    const isis = buildIsis(isisTex);
    const isisHolder = new THREE.Group();
    isisHolder.scale.setScalar(3.85);
    isisHolder.position.y = 0.25;
    isisHolder.add(isis.root);
    root.add(isisHolder);
    let iPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      iPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'sopdet' : 'heka') : moving ? 'ankh' : 'majestade';
      animateIsis(isis, dt, iPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  }
  if (kind === 'set') {
    const setTex = getCachedSetTextures();
    const setGod = buildSet(setTex);
    const setHolder = new THREE.Group();
    setHolder.scale.setScalar(3.85);
    setHolder.position.y = 0.25;
    setHolder.add(setGod.root);
    root.add(setHolder);
    let sPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      sPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'deserto' : 'tempestade') : moving ? 'monstro' : 'senhor';
      animateSet(setGod, dt, sPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  }
  if (kind === 'ra') {
    const raTex = getCachedRaTextures();
    const raGod = buildRa(raTex);
    const raHolder = new THREE.Group();
    raHolder.scale.setScalar(3.85);
    raHolder.position.y = 0.25;
    raHolder.add(raGod.root);
    root.add(raHolder);
    let rPhase = 0;
    root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
      rPhase += dt;
      const mode = attackT !== null ? (attackT > 0.5 ? 'ira' : 'chuva') : moving ? 'bencao' : 'gloria';
      animateRa(raGod, dt, rPhase, mode);
    };
    bindUpdateBrg();
    attachGroundMarkers(root, 2.95, pal, team);
    attachHealthBar(root, 13.8, 3.4);
    return root;
  }

  return null;
}
