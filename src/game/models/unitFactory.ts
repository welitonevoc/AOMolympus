import * as THREE from 'three';
import { PantheonId, TeamId, UnitKind } from '../types';
import { createGreekUnitMesh } from '../../civilizacao/gregos/gregosModels';
import { createZeusMilitaryUnitMesh, ZeusMilitaryUnitKind } from '../../civilizacao/gregos/zeusMilitaryModels';
import { createZeusMythOrHeroMesh, ZeusMythOrHeroKind } from '../../civilizacao/gregos/zeusMythAndHeroModels';
import { createRiggedVillagerMesh } from '../../civilizacao/gregos/villagerAnimator';
import { createEgyptianUnitMesh, getEgyptianUnitMarkerSpec } from '../../civilizacao/egipcios/egipciosModels';
import { createNorseUnitMesh, getNorseUnitMarkerSpec } from '../../civilizacao/nordicos/nordicosModels';
import { createAtlanteanUnitMesh, getAtlanteanUnitMarkerSpec } from '../../civilizacao/atlantes/atlantesModels';
import { createChineseUnitMesh, getChineseUnitMarkerSpec } from '../../civilizacao/chineses/chineseModels';
import { getCivLook, MaterialPalette } from './palette';
import { attachGroundMarkers, attachHealthBar, getSculptedGeos } from './shared';
import { buildGodAvatarUnitRoot, buildTitanUnitRoot } from './titanAndGodFactory';

export function createUnitMesh(
  kind: UnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  pantheon: PantheonId = 'greek',
  majorGod?: string
): THREE.Group {
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const geos = getSculptedGeos();
  const look = getCivLook(pantheon, pal, majorGod);

  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (enableShadows) m.castShadow = true;
    root.add(m);
    return m;
  };

  if (kind === 'fishing_ship' || kind === 'war_trireme' || kind === 'transport_ship') {
    const isWar = kind === 'war_trireme';
    const isTransport = kind === 'transport_ship';
    const hullLen = isWar ? 2.55 : isTransport ? 2.85 : 1.75;
    const hullW = isWar ? 0.88 : isTransport ? 1.18 : 0.72;
    const hullGroup = new THREE.Group();
    root.add(hullGroup);

    const addShipPart = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
      rx = 0,
      ry = 0,
      rz = 0
    ) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      if (rx || ry || rz) m.rotation.set(rx, ry, rz);
      if (enableShadows) m.castShadow = true;
      hullGroup.add(m);
      return m;
    };

    addShipPart(new THREE.BoxGeometry(hullW, isTransport ? 0.44 : 0.36, hullLen), pal.timber, 0, 0.32, 0);
    addShipPart(new THREE.BoxGeometry(hullW * 0.88, 0.08, hullLen * 0.9), look.wallMat, 0, isTransport ? 0.56 : 0.52, 0);
    addShipPart(
      new THREE.ConeGeometry(hullW * 0.44, 0.72, 4),
      pal.timber,
      0,
      0.42,
      hullLen * 0.5 + 0.25,
      Math.PI / 2,
      Math.PI / 4,
      0
    );
    if (isWar) {
      addShipPart(
        new THREE.ConeGeometry(0.18, 0.55, 6),
        pal.bronze,
        0,
        0.28,
        hullLen * 0.5 + 0.56,
        Math.PI / 2,
        0,
        0
      );
      for (const sz of [-0.65, -0.2, 0.25, 0.7]) {
        addShipPart(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 8), look.trimMat, -hullW * 0.52, 0.54, sz, 0, 0, Math.PI / 2);
        addShipPart(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 8), look.trimMat, hullW * 0.52, 0.54, sz, 0, 0, Math.PI / 2);
      }
    } else if (isTransport) {
      addShipPart(new THREE.BoxGeometry(0.75, 0.08, 0.45), pal.bronze, 0, 0.52, hullLen * 0.52, 0.28, 0, 0);
      addShipPart(new THREE.BoxGeometry(0.16, 0.2, hullLen * 0.72), look.trimMat, -hullW * 0.36, 0.65, -0.1);
      addShipPart(new THREE.BoxGeometry(0.16, 0.2, hullLen * 0.72), look.trimMat, hullW * 0.36, 0.65, -0.1);
    } else {
      addShipPart(new THREE.CylinderGeometry(0.22, 0.16, 0.32, 8), pal.bronze, 0, 0.68, -0.45);
      addShipPart(new THREE.BoxGeometry(0.45, 0.14, 0.42), pal.goldOre, 0, 0.72, 0.42);
    }
    addShipPart(new THREE.CylinderGeometry(0.055, 0.07, isWar ? 2.15 : isTransport ? 1.95 : 1.65, 6), pal.timber, 0, isWar ? 1.5 : 1.38, isTransport ? -0.35 : 0);
    addShipPart(new THREE.BoxGeometry(isWar ? 1.48 : isTransport ? 1.35 : 1.05, 0.06, 0.06), pal.timber, 0, isWar ? 2.18 : 1.95, isTransport ? -0.35 : 0);
    addShipPart(
      new THREE.BoxGeometry(isWar ? 1.4 : isTransport ? 1.25 : 0.98, isWar ? 1.15 : 0.95, 0.06),
      teamMat,
      0,
      isWar ? 1.58 : 1.45,
      isTransport ? -0.27 : 0.08
    );
    addShipPart(new THREE.BoxGeometry(0.45, 0.24, 0.05), look.trimMat, 0.22, isWar ? 2.48 : 2.25, isTransport ? -0.35 : 0);

    let waveT = Math.random() * 6.28;
    root.userData.animatePose = (dt: number, moving: boolean) => {
      waveT += dt * (moving ? 4.2 : 2.1);
      hullGroup.position.y = Math.sin(waveT) * 0.06;
      hullGroup.rotation.z = Math.cos(waveT * 0.8) * 0.05;
      hullGroup.rotation.x = moving ? -0.05 : Math.sin(waveT * 0.6) * 0.025;
    };

    attachGroundMarkers(root, isTransport ? 1.42 : isWar ? 1.25 : 1.05, pal, team);
    attachHealthBar(root, isWar ? 2.85 : 2.6, isTransport ? 2.0 : isWar ? 1.85 : 1.45);
    return root;
  }

  const isExplicitEgyptianUnit =
    kind === 'priest' ||
    kind === 'pharaoh' ||
    kind === 'son_of_osiris' ||
    kind === 'egypt_spearman' ||
    kind === 'slinger' ||
    kind === 'axeman' ||
    kind === 'chariot_archer' ||
    kind === 'camel_rider' ||
    kind === 'war_elephant' ||
    kind === 'siege_tower' ||
    kind === 'egypt_catapult' ||
    kind === 'sphinx' ||
    kind === 'wadjet' ||
    kind === 'roc' ||
    kind === 'petsuchos' ||
    kind === 'scarab' ||
    kind === 'avenger' ||
    kind === 'mummy';

  const isGodKind =
    kind === 'zeus' ||
    kind === 'poseidon' ||
    kind === 'hades' ||
    kind === 'atena' ||
    kind === 'ares' ||
    kind === 'hermes' ||
    kind === 'apolo' ||
    kind === 'dionisio' ||
    kind === 'afrodite' ||
    kind === 'hefesto' ||
    kind === 'artemis' ||
    kind === 'isis' ||
    kind === 'set' ||
    kind === 'ra';

  if (isExplicitEgyptianUnit || (look.style === 'egyptian' && !isGodKind)) {
    const egyptMesh = createEgyptianUnitMesh(kind, team, pal, enableShadows);
    root.add(egyptMesh);
    root.userData.egyptMesh = egyptMesh;
    root.userData.animatePose = egyptMesh.userData.animatePose;
    root.userData.leftLeg = egyptMesh.userData.leftLeg;
    root.userData.rightLeg = egyptMesh.userData.rightLeg;
    root.userData.leftArm = egyptMesh.userData.leftArm;
    root.userData.rightArm = egyptMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      egyptMesh.userData.animatePose?.(
        dt,
        state === 'move',
        3.2,
        state === 'attack' ? 0.5 : null,
        state,
        'wood'
      );
    };
    const mSpec = getEgyptianUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

  const isExplicitNorseUnit =
    kind === 'norse_dwarf' ||
    kind === 'ox_cart' ||
    kind === 'hersir' ||
    kind === 'godi' ||
    kind === 'ulfsark' ||
    kind === 'throwing_axeman' ||
    kind === 'raiding_cavalry' ||
    kind === 'huskarl' ||
    kind === 'jarl' ||
    kind === 'portable_ram' ||
    kind === 'norse_ballista' ||
    kind === 'troll' ||
    kind === 'valkyrie' ||
    kind === 'einherjar' ||
    kind === 'frost_giant' ||
    kind === 'mountain_giant' ||
    kind === 'battle_boar' ||
    kind === 'kraken' ||
    kind === 'rock_troll' ||
    kind === 'fire_giant' ||
    kind === 'fenris_wolf' ||
    kind === 'nidhogg' ||
    kind === 'jormungand' ||
    kind === 'fafnir';

  if (isExplicitNorseUnit || ((look.style === 'norse' || pantheon === 'jotunn') && !isGodKind)) {
    const norseMesh = createNorseUnitMesh(kind, team, pal, enableShadows);
    root.add(norseMesh);
    root.userData.norseMesh = norseMesh;
    root.userData.animatePose = norseMesh.userData.animatePose;
    root.userData.leftLeg = norseMesh.userData.leftLeg;
    root.userData.rightLeg = norseMesh.userData.rightLeg;
    root.userData.leftArm = norseMesh.userData.leftArm;
    root.userData.rightArm = norseMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      norseMesh.userData.animatePose?.(
        dt,
        state === 'move',
        3.2,
        state === 'attack' ? 0.5 : null,
        state,
        'wood'
      );
    };
    const mSpec = getNorseUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

  const isExplicitAtlanteanUnit =
    kind === 'citizen' ||
    kind === 'oracle' ||
    kind === 'llama_caravan' ||
    kind === 'murmillo' ||
    kind === 'katapeltes' ||
    kind === 'turma' ||
    kind === 'cheiroballista' ||
    kind === 'arcus' ||
    kind === 'contarius' ||
    kind === 'destroyer' ||
    kind === 'fanatic' ||
    kind === 'fire_siphon' ||
    kind === 'onager' ||
    kind === 'promethean' ||
    kind === 'promethean_offspring' ||
    kind === 'caladria' ||
    kind === 'behemoth' ||
    kind === 'stymphalian_bird' ||
    kind === 'dryad' ||
    kind === 'hekagigantes' ||
    kind === 'argus' ||
    kind === 'lampades' ||
    kind === 'carnivora' ||
    kind === 'tartarian_spawn' ||
    ((kind === 'automaton' || kind === 'satyr') && look.style === 'atlantean');

  if (isExplicitAtlanteanUnit || (look.style === 'atlantean' && !isGodKind && kind !== 'titan')) {
    const atlMesh = createAtlanteanUnitMesh(kind, team, pal, enableShadows);
    root.add(atlMesh);
    root.userData.atlMesh = atlMesh;
    root.userData.animatePose = atlMesh.userData.animatePose;
    root.userData.setHeroVisual = atlMesh.userData.setHeroVisual;
    root.userData.leftLeg = atlMesh.userData.leftLeg;
    root.userData.rightLeg = atlMesh.userData.rightLeg;
    root.userData.leftArm = atlMesh.userData.leftArm;
    root.userData.rightArm = atlMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      atlMesh.userData.animatePose?.(
        dt,
        state === 'move',
        3.2,
        state === 'attack' ? 0.5 : null,
        state,
        'wood'
      );
    };
    const mSpec = getAtlanteanUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

  const isExplicitChineseUnit =
    kind === 'chinese_peasant' ||
    kind === 'kuafu' ||
    kind === 'halberdier' ||
    kind === 'chu_ko_nu' ||
    kind === 'tiger_cavalry' ||
    kind === 'fire_lance' ||
    kind === 'nezha' ||
    kind === 'jiang_ziya' ||
    kind === 'qilin' ||
    kind === 'taotie' ||
    kind === 'yazi' ||
    kind === 'azure_dragon';

  if (isExplicitChineseUnit || (look.style === 'chinese' && !isGodKind && kind !== 'titan')) {
    const chnMesh = createChineseUnitMesh(kind, team, pal, enableShadows);
    root.add(chnMesh);
    root.userData.chnMesh = chnMesh;
    root.userData.animatePose = chnMesh.userData.animatePose;
    root.userData.leftLeg = chnMesh.userData.leftLeg;
    root.userData.rightLeg = chnMesh.userData.rightLeg;
    root.userData.leftArm = chnMesh.userData.leftArm;
    root.userData.rightArm = chnMesh.userData.rightArm;
    root.userData.updateBrg = (dt: number, state: string) => {
      chnMesh.userData.animatePose?.(dt, state === 'move', 3.2, state === 'attack' ? 0.5 : null);
    };
    const mSpec = getChineseUnitMarkerSpec(kind);
    attachGroundMarkers(root, mSpec.markerRadius, pal, team);
    attachHealthBar(root, mSpec.barHeight, mSpec.barWidth);
    return root;
  }

  if (kind === 'villager') {
    const villagerMesh = createRiggedVillagerMesh(team, pal, enableShadows);
    root.add(villagerMesh);
    root.userData.villagerMesh = villagerMesh;
    root.userData.animatePose = villagerMesh.userData.animatePose;
    root.userData.leftLeg = villagerMesh.userData.leftLeg;
    root.userData.rightLeg = villagerMesh.userData.rightLeg;
    root.userData.leftArm = villagerMesh.userData.leftArm;
    root.userData.rightArm = villagerMesh.userData.rightArm;
    attachGroundMarkers(root, 0.44, pal, team);
    attachHealthBar(root, 1.85, 1.0);
  } else if (kind === 'hoplite' || kind === 'hipaspist' || kind === 'myrmidon') {
    const greekMesh = createGreekUnitMesh(kind, team, pal, enableShadows);
    root.add(greekMesh);
    root.userData.greekMesh = greekMesh;
    root.userData.leftLeg = greekMesh.userData.leftLeg;
    root.userData.rightLeg = greekMesh.userData.rightLeg;
    root.userData.leftArm = greekMesh.userData.leftArm;
    root.userData.rightArm = greekMesh.userData.rightArm;
    root.userData.isSpriteSheet = greekMesh.userData.isSpriteSheet;
    root.userData.spriteMesh = greekMesh.userData.spriteMesh;
    root.userData.setMode = (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => {
      greekMesh.userData.setMode?.(mode);
      root.userData.isSpriteSheet = greekMesh.userData.isSpriteSheet;
      root.userData.spriteMesh = greekMesh.userData.spriteMesh;
    };
    root.userData.setArmorTier = (tier: 1 | 2 | 3 | 4) => {
      greekMesh.userData.setArmorTier?.(tier);
    };
    root.userData.setCombatFury = (furyRatio: number) => {
      greekMesh.userData.setCombatFury?.(furyRatio);
    };
    root.userData.updateBrg = (dt: number, state: string) => {
      greekMesh.userData.updateBrg?.(dt, state);
    };
    root.userData.animatePose = greekMesh.userData.animatePose;
    attachGroundMarkers(root, kind === 'myrmidon' ? 0.52 : 0.48, pal, team);
    attachHealthBar(root, kind === 'myrmidon' ? 1.95 : 1.88, 1.05);
  } else if (
    look.style === 'greek' &&
    (kind === 'peltast' ||
      kind === 'archer' ||
      kind === 'gastraphetes' ||
      kind === 'cavalry' ||
      kind === 'prodromos' ||
      kind === 'ram' ||
      kind === 'siege')
  ) {
    const zeusMesh = createZeusMilitaryUnitMesh(kind as ZeusMilitaryUnitKind, team, pal, enableShadows, 3);
    root.add(zeusMesh);
    root.userData.leftLeg = zeusMesh.userData.leftLeg;
    root.userData.rightLeg = zeusMesh.userData.rightLeg;
    root.userData.leftArm = zeusMesh.userData.leftArm;
    root.userData.rightArm = zeusMesh.userData.rightArm;
    root.userData.animatePose = zeusMesh.userData.animatePose;
    root.userData.setArmorTier = (tier: 1 | 2 | 3 | 4) => {
      zeusMesh.userData.setArmorTier?.(tier);
    };
    const markerR =
      kind === 'siege' || kind === 'ram'
        ? 0.98
        : kind === 'cavalry' || kind === 'prodromos'
        ? 0.72
        : 0.46;
    const barY =
      kind === 'cavalry' || kind === 'prodromos'
        ? 2.55
        : kind === 'siege' || kind === 'ram'
        ? 2.35
        : 1.92;
    const barW =
      kind === 'siege' || kind === 'ram'
        ? 1.5
        : kind === 'cavalry' || kind === 'prodromos'
        ? 1.4
        : 1.0;
    attachGroundMarkers(root, markerR, pal, team);
    attachHealthBar(root, barY, barW);
  } else if (
    kind === 'jason' ||
    kind === 'odysseus' ||
    kind === 'perseus' ||
    kind === 'bellerophon' ||
    kind === 'hippolyta' ||
    kind === 'theseus' ||
    kind === 'manticore' ||
    kind === 'medusa' ||
    kind === 'hydra' ||
    kind === 'colossus' ||
    kind === 'nymph' ||
    kind === 'pegasus' ||
    kind === 'satyr' ||
    kind === 'automaton' ||
    kind === 'iron_dwarf' ||
    kind === 'phoenix' ||
    (look.style === 'greek' && kind === 'cyclops')
  ) {
    const mythHeroMesh = createZeusMythOrHeroMesh(kind as ZeusMythOrHeroKind, team, pal, enableShadows);
    root.add(mythHeroMesh);
    root.userData.leftLeg = mythHeroMesh.userData.leftLeg;
    root.userData.rightLeg = mythHeroMesh.userData.rightLeg;
    root.userData.leftArm = mythHeroMesh.userData.leftArm;
    root.userData.rightArm = mythHeroMesh.userData.rightArm;
    root.userData.animatePose = mythHeroMesh.userData.animatePose;

    const markerR =
      kind === 'colossus' || kind === 'cyclops' || kind === 'hydra'
        ? 1.15
        : kind === 'manticore' || kind === 'pegasus' || kind === 'bellerophon' || kind === 'phoenix'
        ? 0.86
        : kind === 'medusa' || kind === 'automaton'
        ? 0.72
        : 0.56;
    const barY =
      kind === 'colossus'
        ? 3.7
        : kind === 'cyclops'
        ? 3.45
        : kind === 'hydra' || kind === 'bellerophon' || kind === 'phoenix'
        ? 2.85
        : kind === 'manticore' || kind === 'pegasus'
        ? 2.45
        : 2.25;
    const barW =
      kind === 'colossus' || kind === 'cyclops' || kind === 'hydra'
        ? 1.85
        : kind === 'manticore' || kind === 'bellerophon' || kind === 'phoenix'
        ? 1.45
        : 1.25;
    attachGroundMarkers(root, markerR, pal, team);
    attachHealthBar(root, barY, barW);
  } else if (kind === 'archer' || kind === 'peltast' || kind === 'gastraphetes') {
    const leftLeg = part(geos.sculptedLimb, pal.furBrown, -0.11, 0.25, 0);
    const rightLeg = part(geos.sculptedLimb, pal.furBrown, 0.11, 0.25, 0);
    part(geos.humanTorso, look.style === 'egyptian' ? pal.ivory : teamMat, 0, 0.84, 0);
    part(new THREE.CylinderGeometry(0.21, 0.23, 0.16, 10), teamMat, 0, 0.68, 0);
    part(new THREE.SphereGeometry(0.18, 10, 8), pal.skin, 0, 1.34, 0);
    part(geos.corinthianHelm, look.style === 'norse' ? pal.steel : look.style === 'atlantean' ? look.trimMat : teamMat, 0, 1.4, 0);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.26, 0.96, 0.12);

    if (look.style === 'norse') {
      const hL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.52, 6), pal.timber);
      hL.rotation.x = Math.PI / 2.2;
      hL.position.set(0, -0.05, 0.2);
      const bL = new THREE.Mesh(geos.axeBlade, pal.steel);
      bL.rotation.y = Math.PI / 2;
      bL.scale.setScalar(0.65);
      bL.position.set(0, 0.05, 0.36);
      leftArm.add(hL, bL);
      root.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.26, 0.96, 0.08);
      const armR = new THREE.Mesh(geos.sculptedLimb, pal.skin);
      armR.position.y = -0.14;
      const hR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.56, 6), pal.timber);
      hR.rotation.x = Math.PI / 2.2;
      hR.position.set(0, -0.05, 0.24);
      const bR = new THREE.Mesh(geos.axeBlade, pal.steel);
      bR.rotation.y = Math.PI / 2;
      bR.scale.setScalar(0.65);
      bR.position.set(0, 0.06, 0.42);
      rightArm.add(armR, hR, bR);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
    } else if (look.style === 'egyptian') {
      const armL = new THREE.Mesh(geos.sculptedLimb, pal.skin);
      armL.position.y = -0.14;
      leftArm.add(armL);
      root.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.26, 0.98, 0.08);
      const armR = new THREE.Mesh(geos.sculptedLimb, pal.skin);
      armR.position.y = -0.14;
      const slingRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.024, 6, 12), pal.furBrown);
      slingRing.position.set(0, 0.14, 0.26);
      const stone = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), pal.gold);
      stone.position.set(0, 0.34, 0.26);
      rightArm.add(armR, slingRing, stone);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
    } else {
      const quiver = part(new THREE.CylinderGeometry(0.08, 0.07, 0.55, 6), pal.timber, -0.12, 0.96, -0.24);
      quiver.rotation.z = 0.25;
      const armL = new THREE.Mesh(geos.sculptedLimb, pal.skin);
      armL.position.y = -0.14;
      const bow = new THREE.Mesh(geos.compoundBow, look.style === 'atlantean' ? look.trimMat : pal.timber);
      bow.position.set(0.02, 0.02, 0.22);
      const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.65, 5), pal.ivory);
      arrowShaft.rotation.x = Math.PI / 2;
      arrowShaft.position.set(0.02, 0.02, 0.28);
      leftArm.add(armL, bow, arrowShaft);
      root.add(leftArm);

      const rightArm = part(geos.sculptedLimb, pal.skin, 0.26, 0.88, 0.08);
      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
    }

    attachGroundMarkers(root, 0.45, pal, team);
    attachHealthBar(root, 1.88, 1.0);
  } else if (kind === 'cavalry' || kind === 'prodromos') {
    part(geos.horseBarrel, look.mountMat, 0, 0.94, 0);
    if (look.style === 'egyptian') {
      part(new THREE.SphereGeometry(0.32, 10, 8), pal.sandstoneDark, 0, 1.26, -0.05);
    }
    const leftLeg = part(geos.sculptedLimb, look.mountMat, -0.2, 0.34, 0.46);
    const rightLeg = part(geos.sculptedLimb, look.mountMat, 0.2, 0.34, 0.46);
    part(geos.sculptedLimb, look.mountMat, -0.2, 0.34, -0.46);
    part(geos.sculptedLimb, look.mountMat, 0.2, 0.34, -0.46);
    const neck = part(geos.horseNeck, look.mountMat, 0, 1.32, 0.6);
    neck.rotation.x = look.style === 'egyptian' ? 0.26 : 0.42;
    part(new THREE.BoxGeometry(0.22, 0.22, 0.46), look.mountMat, 0, 1.58, 0.86);
    const tail = part(new THREE.ConeGeometry(0.09, 0.56, 6), pal.obsidian, 0, 0.86, -0.82);
    tail.rotation.x = -0.45;
    part(geos.armoredCuirass, teamMat, 0, 1.54, -0.05);
    part(new THREE.SphereGeometry(0.19, 10, 8), pal.skin, 0, 1.98, -0.05);
    part(geos.corinthianHelm, look.armorMat, 0, 2.04, -0.05);
    part(new THREE.BoxGeometry(0.08, 0.2, 0.36), pal.gold, 0, 2.28, -0.05);
    const cape = part(geos.capeMesh, teamMat, 0, 1.82, -0.26);
    cape.scale.set(0.68, 0.65, 0.8);
    cape.rotation.x = 0.32;

    const rightArm = new THREE.Group();
    rightArm.position.set(0.3, 1.58, 0);
    const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, kind === 'prodromos' ? 2.4 : 2.0, 6), pal.timber);
    lance.rotation.x = Math.PI / 2.2;
    lance.position.set(0, -0.05, 0.55);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 6), pal.steel);
    tip.rotation.x = Math.PI / 2.2;
    tip.position.set(0, 0.12, kind === 'prodromos' ? 1.72 : 1.52);
    rightArm.add(lance, tip);
    root.add(rightArm);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 0.72, pal, team);
    attachHealthBar(root, 2.55, 1.4);
  } else if (kind === 'ajax' || (kind === 'hero' && look.style === 'greek')) {
    const S = kind === 'ajax' ? 0.46 : 0.44;
    const Y_OFF = 0.24;
    const tunicMat = team === 'player' ? pal.ivory : teamMat;
    const helmMat = pal.gold;
    const bronzeMat = pal.bronze;
    const crestMat = kind === 'ajax' ? pal.berryRed : pal.crimson;
    const crestBaseMat = pal.crimson;
    const leatherMat = pal.furBrown;

    const addBox = (
      parent: THREE.Object3D,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      rx = 0,
      ry = 0,
      rz = 0,
      px = 0,
      py = 0,
      pz = 0,
    ) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), mat);
      m.position.set((x - px) * S, (y - py) * S + (parent === root ? Y_OFF : 0), (z - pz) * S);
      if (rx || ry || rz) m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    const addCylZ = (
      parent: THREE.Object3D,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
      r: number,
      h: number,
      px = 0,
      py = 0,
      pz = 0,
    ) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, h * S, 14), mat);
      m.position.set((x - px) * S, (y - py) * S + (parent === root ? Y_OFF : 0), (z - pz) * S);
      m.rotation.x = Math.PI / 2;
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    addBox(root, pal.skin, 0, 2.36, 0, 0.56, 0.52, 0.52);
    addBox(root, pal.skin, 0, 2.04, 0, 0.22, 0.20, 0.22);
    addBox(root, leatherMat, 0, 2.16, 0.20, 0.44, 0.22, 0.20);
    addBox(root, helmMat, 0, 2.66, 0, 0.68, 0.36, 0.64);
    addBox(root, helmMat, 0, 2.50, 0, 0.74, 0.10, 0.70);
    addBox(root, helmMat, -0.32, 2.26, 0.10, 0.08, 0.34, 0.36);
    addBox(root, helmMat, 0.32, 2.26, 0.10, 0.08, 0.34, 0.36);
    addBox(root, helmMat, 0, 2.32, 0.30, 0.07, 0.22, 0.07);
    addBox(root, crestBaseMat, 0, 2.88, 0, 0.14, 0.12, 0.86);
    addBox(root, crestMat, 0, 3.16, 0, 0.10, 0.44, 1.02);
    addBox(root, pal.ivory, 0, 3.04, 0, 0.11, 0.12, 0.94);

    addBox(root, tunicMat, 0, 1.56, 0, 1.06, 1.10, 0.62);
    addBox(root, helmMat, 0, 1.66, 0.30, 0.88, 0.76, 0.08);
    addBox(root, bronzeMat, -0.22, 1.78, 0.34, 0.36, 0.34, 0.06);
    addBox(root, bronzeMat, 0.22, 1.78, 0.34, 0.36, 0.34, 0.06);
    addCylZ(root, pal.goldOre, 0, 1.78, 0.38, 0.18, 0.06);
    addBox(root, leatherMat, 0, 1.08, 0, 1.10, 0.20, 0.66);
    addBox(root, helmMat, 0, 1.08, 0.34, 0.22, 0.16, 0.06);
    addBox(root, teamMat, 0, 0.68, 0, 1.12, 0.54, 0.68);
    addBox(root, helmMat, 0, 0.44, 0, 1.14, 0.09, 0.70);
    for (let i = -2; i <= 2; i++) {
      addBox(root, leatherMat, i * 0.20, 0.66, 0.35, 0.13, 0.48, 0.04);
      addBox(root, helmMat, i * 0.20, 0.46, 0.36, 0.13, 0.08, 0.05);
    }
    addBox(root, helmMat, -0.64, 1.98, 0, 0.34, 0.24, 0.58);
    addBox(root, helmMat, 0.64, 1.98, 0, 0.34, 0.24, 0.58);
    addCylZ(root, pal.goldOre, -0.42, 1.96, 0.32, 0.11, 0.05);
    addCylZ(root, pal.goldOre, 0.42, 1.96, 0.32, 0.11, 0.05);
    addBox(root, team === 'player' ? crestBaseMat : teamMat, 0, 1.32, -0.36, 1.04, 1.48, 0.08, 0.14, 0, 0);

    const leftLeg = new THREE.Group();
    const lHipX = -0.30, lHipY = 0.50, lHipZ = 0.06;
    leftLeg.position.set(lHipX * S, lHipY * S + Y_OFF, lHipZ * S);
    addBox(leftLeg, pal.skin, -0.30, 0.28, 0.18, 0.32, 0.58, 0.32, -0.25, 0, 0, lHipX, lHipY, lHipZ);
    addBox(leftLeg, helmMat, -0.30, -0.28, 0.28, 0.28, 0.60, 0.28, 0.12, 0, 0, lHipX, lHipY, lHipZ);
    addBox(leftLeg, bronzeMat, -0.30, 0.02, 0.42, 0.18, 0.18, 0.08, 0, 0, 0, lHipX, lHipY, lHipZ);
    addBox(leftLeg, leatherMat, -0.30, -0.60, 0.36, 0.34, 0.12, 0.62, 0, 0, 0, lHipX, lHipY, lHipZ);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    const rHipX = 0.30, rHipY = 0.50, rHipZ = -0.06;
    rightLeg.position.set(rHipX * S, rHipY * S + Y_OFF, rHipZ * S);
    addBox(rightLeg, pal.skin, 0.30, 0.28, -0.16, 0.32, 0.58, 0.32, 0.25, 0, 0, rHipX, rHipY, rHipZ);
    addBox(rightLeg, helmMat, 0.30, -0.28, -0.26, 0.28, 0.60, 0.28, 0, 0, 0, rHipX, rHipY, rHipZ);
    addBox(rightLeg, bronzeMat, 0.30, 0.02, -0.12, 0.18, 0.18, 0.08, 0, 0, 0, rHipX, rHipY, rHipZ);
    addBox(rightLeg, leatherMat, 0.30, -0.60, -0.34, 0.34, 0.12, 0.62, 0, 0, 0, rHipX, rHipY, rHipZ);
    root.add(rightLeg);

    const leftArm = new THREE.Group();
    const lShX = -0.68, lShY = 1.86, lShZ = 0.08;
    leftArm.position.set(lShX * S, lShY * S + Y_OFF, lShZ * S);
    addBox(leftArm, pal.skin, -0.68, 1.66, 0.16, 0.26, 0.54, 0.26, -0.55, 0, 0, lShX, lShY, lShZ);
    addBox(leftArm, helmMat, -0.68, 1.44, 0.52, 0.24, 0.48, 0.24, -1.15, 0, 0, lShX, lShY, lShZ);
    addBox(leftArm, pal.skin, -0.68, 1.40, 0.78, 0.20, 0.20, 0.20, 0, 0, 0, lShX, lShY, lShZ);
    addBox(leftArm, helmMat, -0.82, 1.28, 0.56, 0.14, 1.74, 1.12, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, crestBaseMat, -0.87, 1.28, 0.58, 0.08, 1.56, 0.96, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, helmMat, -0.90, 1.68, 0.60, 0.06, 0.10, 0.98, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, helmMat, -0.90, 0.88, 0.60, 0.06, 0.10, 0.98, 0, 0.32, 0, lShX, lShY, lShZ);
    addBox(leftArm, pal.goldOre, -0.92, 1.28, 0.62, 0.10, 0.36, 0.36, 0, 0.32, 0, lShX, lShY, lShZ);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    const rShX = 0.68, rShY = 1.86, rShZ = 0.06;
    rightArm.position.set(rShX * S, rShY * S + Y_OFF, rShZ * S);
    addBox(rightArm, pal.skin, 0.68, 1.66, 0.08, 0.26, 0.54, 0.26, -0.45, 0, -0.18, rShX, rShY, rShZ);
    addBox(rightArm, helmMat, 0.68, 1.42, 0.46, 0.24, 0.50, 0.24, -1.10, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, pal.skin, 0.68, 1.38, 0.74, 0.22, 0.20, 0.20, 0, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, pal.timber, 0.68, 1.42, 1.08, 0.09, 0.09, 2.85, 0.08, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, helmMat, 0.68, 1.52, 2.32, 0.13, 0.13, 0.18, 0.08, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, pal.steel, 0.68, 1.55, 2.66, 0.18, 0.10, 0.54, 0.08, 0, 0, rShX, rShY, rShZ);
    addBox(rightArm, helmMat, 0.68, 1.30, -0.36, 0.12, 0.12, 0.26, 0.08, 0, 0, rShX, rShY, rShZ);
    root.add(rightArm);

    addBox(root, crestBaseMat, -0.58, 0.92, -0.08, 0.10, 0.14, 0.76, 0.35, 0, 0);
    addBox(root, helmMat, -0.58, 1.06, 0.28, 0.14, 0.16, 0.14, 0.35, 0, 0);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 0.58, pal, team);
    attachHealthBar(root, 2.25, 1.35);
  } else if (kind === 'hero') {
    const leftLeg = part(geos.sculptedLimb, pal.gold, -0.15, 0.3, 0);
    const rightLeg = part(geos.sculptedLimb, pal.gold, 0.15, 0.3, 0);
    part(geos.heroCuirass, pal.gold, 0, 0.96, 0);
    part(new THREE.CylinderGeometry(0.28, 0.33, 0.26, 12), teamMat, 0, 0.62, 0);
    part(new THREE.SphereGeometry(0.18, 10, 8), pal.gold, -0.35, 1.24, 0);
    part(new THREE.SphereGeometry(0.18, 10, 8), pal.gold, 0.35, 1.24, 0);
    const cape = part(geos.capeMesh, teamMat, 0, 1.28, -0.25);
    cape.rotation.x = 0.18;
    part(new THREE.SphereGeometry(0.21, 12, 10), pal.skin, 0, 1.54, 0);
    part(geos.corinthianHelm, pal.gold, 0, 1.6, 0);
    part(new THREE.BoxGeometry(0.1, 0.28, 0.5), teamMat, 0, 1.9, -0.02);
    const halo = part(new THREE.TorusGeometry(0.32, 0.032, 8, 20), pal.goldOre, 0, 1.88, -0.1);
    halo.rotation.x = 0.25;

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.38, 1.1, 0.08);
    const shield = new THREE.Mesh(geos.domedShield, pal.gold);
    shield.scale.setScalar(1.15);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.1, -0.08, 0.12);
    const boss = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), pal.crystalGlow);
    boss.position.set(-0.22, -0.08, 0.12);
    leftArm.add(shield, boss);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.38, 1.14, 0);
    const arm = new THREE.Mesh(geos.sculptedLimb, pal.gold);
    arm.position.y = -0.18;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.1), pal.gold);
    guard.position.set(0, -0.24, 0.1);
    const blade = new THREE.Mesh(geos.greatSwordBlade, pal.crystalGlow);
    blade.rotation.x = Math.PI / 2;
    blade.scale.set(1.1, 1.2, 1.1);
    blade.position.set(0, -0.24, 0.12);
    rightArm.add(arm, guard, blade);
    root.add(rightArm);

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 0.56, pal, team);
    attachHealthBar(root, 2.25, 1.35);
  } else if (kind === 'siege' || kind === 'ram') {
    const chassis = part(new THREE.BoxGeometry(1.15, 0.28, 1.75), pal.timber, 0, 0.48, 0);
    part(new THREE.BoxGeometry(1.25, 0.18, 0.35), look.trimMat, 0, 0.65, 0.45);
    part(new THREE.BoxGeometry(1.0, 0.65, 0.12), teamMat, 0, 0.92, 0.85);
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const leftLeg = part(wheelGeo, pal.norseTimber, -0.68, 0.34, 0.6);
    const rightLeg = part(wheelGeo, pal.norseTimber, 0.68, 0.34, 0.6);
    part(wheelGeo, pal.norseTimber, -0.68, 0.34, -0.6);
    part(wheelGeo, pal.norseTimber, 0.68, 0.34, -0.6);
    part(new THREE.BoxGeometry(0.14, 0.85, 0.16), pal.timber, -0.5, 0.98, 0.25);
    part(new THREE.BoxGeometry(0.14, 0.85, 0.16), pal.timber, 0.5, 0.98, 0.25);
    part(new THREE.CylinderGeometry(0.1, 0.1, 1.15, 8), look.trimMat, 0, 1.32, 0.25).rotation.z = Math.PI / 2;

    const rightArm = new THREE.Group();
    rightArm.position.set(0, 0.62, 0.25);
    const throwBeam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.45, 0.14), pal.timber);
    throwBeam.rotation.x = -0.62;
    throwBeam.position.set(0, 0.55, -0.38);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.18, 10), look.trimMat);
    cup.position.set(0, 1.1, -0.78);
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), pal.ember);
    boulder.position.set(0, 1.24, -0.78);
    rightArm.add(throwBeam, cup, boulder);
    root.add(rightArm);
    void chassis;

    root.userData.leftLeg = leftLeg;
    root.userData.rightLeg = rightLeg;
    root.userData.rightArm = rightArm;
    attachGroundMarkers(root, 1.0, pal, team);
    attachHealthBar(root, 2.3, 1.5);
  } else if (kind === 'minotaur') {
    if (look.style === 'norse') {
      const leftLeg = part(geos.sculptedLimb, pal.steel, -0.14, 0.3, 0);
      const rightLeg = part(geos.sculptedLimb, pal.steel, 0.14, 0.3, 0);
      part(geos.heroCuirass, pal.steel, 0, 0.98, 0);
      part(new THREE.CylinderGeometry(0.26, 0.32, 0.28, 10), teamMat, 0, 0.68, 0);
      part(new THREE.SphereGeometry(0.2, 10, 8), pal.skin, 0, 1.56, 0);
      part(geos.corinthianHelm, pal.gold, 0, 1.62, 0);
      const wL = part(geos.capeMesh, pal.ivory, -0.22, 1.52, -0.22);
      wL.rotation.z = -0.85;
      wL.rotation.y = 0.25;
      const wR = part(geos.capeMesh, pal.ivory, 0.22, 1.52, -0.22);
      wR.rotation.z = 0.85;
      wR.rotation.y = -0.25;

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.34, 1.24, 0.06);
      const shield = new THREE.Mesh(geos.domedShield, pal.gold);
      shield.rotation.z = Math.PI / 2;
      shield.position.set(-0.08, -0.1, 0.12);
      leftArm.add(shield);
      root.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.34, 1.24, 0);
      const arm = new THREE.Mesh(geos.sculptedLimb, pal.steel);
      arm.position.y = -0.18;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6), pal.gold);
      shaft.rotation.x = Math.PI / 2.3;
      shaft.position.set(0, -0.1, 0.5);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 6), pal.iceBlue);
      tip.rotation.x = Math.PI / 2.3;
      tip.position.set(0, 0.1, 1.45);
      rightArm.add(arm, shaft, tip);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.45, 1.45);
    } else if (look.style === 'atlantean') {
      const leftLeg = part(geos.heavyLimb, look.trimMat, -0.2, 0.33, 0);
      const rightLeg = part(geos.heavyLimb, look.trimMat, 0.2, 0.33, 0);
      part(geos.heroCuirass, look.trimMat, 0, 1.06, 0);
      part(new THREE.OctahedronGeometry(0.22, 0), pal.crystalGlow, 0, 1.15, 0.28);
      part(new THREE.BoxGeometry(0.58, 0.26, 0.52), teamMat, 0, 0.78, 0);
      part(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 8), look.armorMat, -0.48, 1.45, 0);
      part(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 8), look.armorMat, 0.48, 1.45, 0);
      part(new THREE.CylinderGeometry(0.22, 0.26, 0.38, 6), look.trimMat, 0, 1.72, 0);
      part(new THREE.BoxGeometry(0.32, 0.09, 0.14), pal.crystalGlow, 0, 1.74, 0.18);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.5, 1.28, 0);
      const armL = new THREE.Mesh(geos.heavyLimb, look.trimMat);
      armL.position.y = -0.25;
      const bladeL = new THREE.Mesh(geos.greatSwordBlade, pal.steel);
      bladeL.rotation.x = Math.PI / 2;
      bladeL.scale.set(0.7, 0.7, 0.7);
      bladeL.position.set(0, -0.42, 0.12);
      leftArm.add(armL, bladeL);
      root.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.5, 1.28, 0);
      const armR = new THREE.Mesh(geos.heavyLimb, look.trimMat);
      armR.position.y = -0.25;
      const bladeR = new THREE.Mesh(geos.greatSwordBlade, pal.steel);
      bladeR.rotation.x = Math.PI / 2;
      bladeR.scale.set(0.7, 0.7, 0.7);
      bladeR.position.set(0, -0.42, 0.12);
      rightArm.add(armR, bladeR);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.5, 1.5);
    } else {
      const leftLeg = part(geos.heavyLimb, pal.furBrown, -0.22, 0.34, 0);
      const rightLeg = part(geos.heavyLimb, pal.furBrown, 0.22, 0.34, 0);
      part(geos.heroCuirass, pal.furBrown, 0, 1.12, 0).scale.set(1.25, 1.15, 1.25);
      part(new THREE.BoxGeometry(0.7, 0.34, 0.58), teamMat, 0, 0.78, 0);
      part(new THREE.SphereGeometry(0.28, 10, 8), look.armorMat, -0.48, 1.48, 0);
      part(new THREE.SphereGeometry(0.28, 10, 8), look.armorMat, 0.48, 1.48, 0);
      part(new THREE.BoxGeometry(0.46, 0.44, 0.56), pal.furBrown, 0, 1.78, 0.1);
      const hornL = part(geos.bullHorn, pal.ivory, -0.18, 1.9, 0.14);
      hornL.scale.x = -1;
      part(geos.bullHorn, pal.ivory, 0.18, 1.9, 0.14);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.55, 1.32, 0);
      const arm = new THREE.Mesh(geos.heavyLimb, pal.furBrown);
      arm.position.y = -0.25;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.75, 6), pal.timber);
      handle.rotation.x = Math.PI / 2.5;
      handle.position.set(0, -0.38, 0.55);
      const blade = new THREE.Mesh(geos.axeBlade, pal.steel);
      blade.rotation.y = Math.PI / 2;
      blade.scale.setScalar(1.35);
      blade.position.set(0, -0.18, 1.2);
      rightArm.add(arm, handle, blade);
      root.add(rightArm);
      const leftArm = part(geos.heavyLimb, pal.furBrown, -0.55, 1.05, 0);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.55, 1.6);
    }
  } else if (kind === 'centaur') {
    if (look.style === 'egyptian') {
      part(geos.horseBarrel, look.wallMat, 0, 0.88, 0).scale.set(1.2, 1.15, 1.15);
      const leftLeg = part(geos.sculptedLimb, pal.sandstoneDark, -0.24, 0.33, 0.52);
      const rightLeg = part(geos.sculptedLimb, pal.sandstoneDark, 0.24, 0.33, 0.52);
      part(geos.sculptedLimb, pal.sandstoneDark, -0.24, 0.33, -0.52);
      part(geos.sculptedLimb, pal.sandstoneDark, 0.24, 0.33, -0.52);
      part(new THREE.BoxGeometry(0.56, 0.42, 0.56), teamMat, 0, 1.05, 0.45);
      part(new THREE.SphereGeometry(0.26, 10, 8), pal.gold, 0, 1.56, 0.56);
      part(new THREE.BoxGeometry(0.64, 0.44, 0.32), look.trimMat, 0, 1.52, 0.48);
      const wL = part(geos.capeMesh, pal.gold, -0.4, 1.38, -0.05);
      wL.rotation.z = -1.0;
      const wR = part(geos.capeMesh, pal.gold, 0.4, 1.38, -0.05);
      wR.rotation.z = 1.0;

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.55, 1.5);
    } else if (look.style === 'norse') {
      const leftLeg = part(geos.heavyLimb, pal.stoneDark, -0.24, 0.34, 0);
      const rightLeg = part(geos.heavyLimb, pal.stoneDark, 0.24, 0.34, 0);
      part(new THREE.DodecahedronGeometry(0.64, 1), pal.stoneDark, 0, 1.18, 0);
      part(new THREE.BoxGeometry(0.76, 0.32, 0.58), teamMat, 0, 0.85, 0);
      part(new THREE.SphereGeometry(0.28, 10, 8), pal.cyclopsSkin, 0, 1.76, 0.16);
      part(new THREE.ConeGeometry(0.05, 0.22, 6), pal.ivory, -0.14, 1.72, 0.42);
      part(new THREE.ConeGeometry(0.05, 0.22, 6), pal.ivory, 0.14, 1.72, 0.42);
      const leftArm = part(geos.heavyLimb, pal.stoneDark, -0.58, 1.16, 0.08);
      const rightArm = new THREE.Group();
      rightArm.position.set(0.58, 1.38, 0.08);
      const armR = new THREE.Mesh(geos.heavyLimb, pal.stoneDark);
      armR.position.y = -0.25;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), pal.iceBlue);
      rock.position.set(0, -0.45, 0.3);
      rightArm.add(armR, rock);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.6, 1.55);
    } else {
      part(geos.horseBarrel, look.mountMat, 0, 0.94, 0);
      const leftLeg = part(geos.sculptedLimb, look.mountMat, -0.21, 0.35, 0.48);
      const rightLeg = part(geos.sculptedLimb, look.mountMat, 0.21, 0.35, 0.48);
      part(geos.sculptedLimb, look.mountMat, -0.21, 0.35, -0.48);
      part(geos.sculptedLimb, look.mountMat, 0.21, 0.35, -0.48);
      part(geos.humanTorso, pal.skin, 0, 1.5, 0.36);
      part(new THREE.CylinderGeometry(0.24, 0.27, 0.26, 10), teamMat, 0, 1.32, 0.36);
      part(new THREE.SphereGeometry(0.19, 10, 8), pal.skin, 0, 2.02, 0.36);
      part(geos.corinthianHelm, pal.gold, 0, 2.08, 0.36);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.26, 1.56, 0.45);
      const bow = new THREE.Mesh(geos.compoundBow, pal.gold);
      bow.position.set(0.02, 0.04, 0.24);
      leftArm.add(bow);
      root.add(leftArm);
      const rightArm = part(geos.sculptedLimb, pal.skin, 0.28, 1.48, 0.36);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 0.82, pal, team);
      attachHealthBar(root, 2.75, 1.5);
    }
  } else if (kind === 'cyclops') {
    if (look.style === 'egyptian') {
      const leftLeg = part(geos.heavyLimb, pal.obsidian, -0.68, 0.32, 0.45);
      const rightLeg = part(geos.heavyLimb, pal.obsidian, 0.68, 0.32, 0.45);
      part(geos.heavyLimb, pal.obsidian, -0.68, 0.32, -0.45);
      part(geos.heavyLimb, pal.obsidian, 0.68, 0.32, -0.45);
      const shell = part(new THREE.SphereGeometry(0.95, 14, 10), pal.chitin, 0, 1.05, 0);
      shell.scale.set(1.0, 0.72, 1.3);
      part(new THREE.BoxGeometry(0.32, 0.45, 1.65), pal.gold, 0, 1.46, -0.05);
      part(new THREE.BoxGeometry(0.95, 0.34, 0.36), teamMat, 0, 1.0, 0.92);
      const horn = part(new THREE.ConeGeometry(0.16, 0.78, 8), pal.gold, 0, 1.28, 1.35);
      horn.rotation.x = Math.PI / 2.8;
      part(new THREE.SphereGeometry(0.22, 8, 8), pal.crystalGlow, 0, 1.56, 0.75);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      attachGroundMarkers(root, 1.15, pal, team);
      attachHealthBar(root, 2.75, 1.85);
    } else if (look.style === 'atlantean') {
      const leftLeg = part(geos.heavyLimb, pal.obsidian, -0.58, 0.39, 0.65);
      const rightLeg = part(geos.heavyLimb, pal.obsidian, 0.58, 0.39, 0.65);
      part(geos.heavyLimb, pal.obsidian, -0.58, 0.39, -0.65);
      part(geos.heavyLimb, pal.obsidian, 0.58, 0.39, -0.65);
      part(new THREE.BoxGeometry(1.3, 0.95, 1.95), pal.obsidian, 0, 1.15, 0);
      part(new THREE.BoxGeometry(1.12, 0.32, 1.65), look.trimMat, 0, 1.72, -0.08);
      part(new THREE.BoxGeometry(1.36, 0.34, 0.65), teamMat, 0, 1.25, 0.45);
      part(new THREE.BoxGeometry(0.68, 0.6, 0.68), pal.obsidian, 0, 1.32, 1.18);
      const tL = part(new THREE.ConeGeometry(0.1, 0.65, 6), pal.ivory, -0.32, 1.38, 1.56);
      tL.rotation.x = Math.PI / 2.2;
      const tR = part(new THREE.ConeGeometry(0.1, 0.65, 6), pal.ivory, 0.32, 1.38, 1.56);
      tR.rotation.x = Math.PI / 2.2;

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      attachGroundMarkers(root, 1.15, pal, team);
      attachHealthBar(root, 2.85, 1.9);
    } else {
      const bodyMat = look.style === 'norse' ? pal.iceBlue : pal.cyclopsSkin;
      const leftLeg = part(geos.giantLimb, look.style === 'norse' ? pal.norseSlate : bodyMat, -0.28, 0.48, 0);
      const rightLeg = part(geos.giantLimb, look.style === 'norse' ? pal.norseSlate : bodyMat, 0.28, 0.48, 0);
      part(geos.heroCuirass, bodyMat, 0, 1.52, 0).scale.set(1.55, 1.45, 1.55);
      part(new THREE.BoxGeometry(0.95, 0.42, 0.76), teamMat, 0, 1.0, 0);
      part(new THREE.SphereGeometry(0.38, 12, 10), bodyMat, 0, 2.42, 0.06);
      part(new THREE.SphereGeometry(0.12, 8, 8), look.style === 'norse' ? pal.iceBlue : pal.gold, 0, 2.45, 0.38);
      const leftArm = part(geos.giantLimb, bodyMat, -0.74, 1.52, 0);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.74, 1.76, 0);
      const arm = new THREE.Mesh(geos.giantLimb, bodyMat);
      arm.position.y = -0.35;
      const club = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.11, 1.7, 8),
        look.style === 'norse' ? pal.crystalGlow : pal.timber
      );
      club.rotation.x = Math.PI / 2.3;
      club.position.set(0, -0.55, 0.65);
      rightArm.add(arm, club);
      root.add(rightArm);

      root.userData.leftLeg = leftLeg;
      root.userData.rightLeg = rightLeg;
      root.userData.leftArm = leftArm;
      root.userData.rightArm = rightArm;
      attachGroundMarkers(root, 1.15, pal, team);
      attachHealthBar(root, 3.55, 1.85);
    }
  } else if (kind === 'titan') {
    return buildTitanUnitRoot(root, team, pal, look, enableShadows, majorGod);
  } else if (isGodKind) {
    const builtGod = buildGodAvatarUnitRoot(root, kind, team, pal);
    if (builtGod) return builtGod;
  }

  return root;
}
