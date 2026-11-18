import * as THREE from 'three';
import { AgeLevel, BuildingKind, PantheonId, TeamId } from '../../game/types';
import type { MaterialPalette } from '../../game/models';

export interface ChineseMarkerSpec {
  markerRadius: number;
  barHeight: number;
  barWidth: number;
}

export interface ChineseBuildingMeshResult {
  group: THREE.Group;
  markerRadius: number;
  barHeight: number;
  barWidth: number;
  beaconCrystal?: THREE.Object3D;
  vortexRing?: THREE.Object3D;
  metropolisHalo?: THREE.Object3D;
  metropolisCrystal?: THREE.Object3D;
}

const CANONICAL_CHINESE_UNIT_MAP: Record<string, string> = {
  chinese_peasant: 'chinese_peasant',
  kuafu: 'kuafu',
  halberdier: 'halberdier',
  chu_ko_nu: 'chu_ko_nu',
  tiger_cavalry: 'tiger_cavalry',
  fire_lance: 'fire_lance',
  nezha: 'nezha',
  jiang_ziya: 'jiang_ziya',
  qilin: 'qilin',
  taotie: 'taotie',
  yazi: 'yazi',
  azure_dragon: 'azure_dragon',
  // Fallbacks for shared unit kinds
  villager: 'chinese_peasant',
  hoplite: 'halberdier',
  hipaspist: 'halberdier',
  myrmidon: 'halberdier',
  peltast: 'chu_ko_nu',
  archer: 'chu_ko_nu',
  gastraphetes: 'chu_ko_nu',
  cavalry: 'tiger_cavalry',
  prodromos: 'tiger_cavalry',
  ram: 'fire_lance',
  siege: 'fire_lance',
  hero: 'jiang_ziya',
  jason: 'nezha',
  ajax: 'nezha',
  perseus: 'nezha',
  bellerophon: 'nezha',
  theseus: 'nezha',
  odysseus: 'jiang_ziya',
  hippolyta: 'jiang_ziya',
  minotaur: 'qilin',
  nymph: 'qilin',
  centaur: 'yazi',
  pegasus: 'yazi',
  satyr: 'yazi',
  medusa: 'yazi',
  cyclops: 'taotie',
  hydra: 'taotie',
  colossus: 'taotie',
  automaton: 'taotie',
  iron_dwarf: 'taotie',
  manticore: 'azure_dragon',
  phoenix: 'azure_dragon',
};

export function getChineseUnitMarkerSpec(kind: string): ChineseMarkerSpec {
  const mapped = CANONICAL_CHINESE_UNIT_MAP[kind] ?? kind;
  switch (mapped) {
    case 'titan':
      return { markerRadius: 2.35, barHeight: 9.6, barWidth: 3.0 };
    case 'azure_dragon':
      return { markerRadius: 1.15, barHeight: 4.1, barWidth: 1.75 };
    case 'taotie':
      return { markerRadius: 1.1, barHeight: 3.2, barWidth: 1.65 };
    case 'kuafu':
      return { markerRadius: 0.95, barHeight: 3.15, barWidth: 1.5 };
    case 'fire_lance':
      return { markerRadius: 0.96, barHeight: 2.55, barWidth: 1.55 };
    case 'tiger_cavalry':
    case 'qilin':
      return { markerRadius: 0.85, barHeight: 2.55, barWidth: 1.4 };
    case 'yazi':
      return { markerRadius: 0.78, barHeight: 2.25, barWidth: 1.3 };
    case 'nezha':
    case 'jiang_ziya':
      return { markerRadius: 0.65, barHeight: 2.45, barWidth: 1.25 };
    default:
      return { markerRadius: 0.5, barHeight: 1.95, barWidth: 1.05 };
  }
}

interface ChineseMaterialSet {
  vermilion: THREE.MeshStandardMaterial;
  jade: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  slateRoof: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
  lacquerDark: THREE.MeshStandardMaterial;
  bronze: THREE.MeshStandardMaterial;
  celestialCyan: THREE.MeshStandardMaterial;
  emberOrange: THREE.MeshStandardMaterial;
  furTiger: THREE.MeshStandardMaterial;
  teamMat: THREE.MeshStandardMaterial;
}

const chineseMatCache = new Map<TeamId, ChineseMaterialSet>();

function getChineseMats(team: TeamId, pal: MaterialPalette): ChineseMaterialSet {
  const existing = chineseMatCache.get(team);
  if (existing) {
    existing.teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
    return existing;
  }
  const created: ChineseMaterialSet = {
    vermilion: new THREE.MeshStandardMaterial({ color: 0x9e231b, roughness: 0.45, metalness: 0.12 }),
    jade: new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.3, metalness: 0.28 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.22, metalness: 0.88 }),
    slateRoof: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.52, metalness: 0.2 }),
    ivory: new THREE.MeshStandardMaterial({ color: 0xf4efe3, roughness: 0.65, metalness: 0.04 }),
    lacquerDark: new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.5, metalness: 0.25 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.34, metalness: 0.72 }),
    celestialCyan: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.15,
      roughness: 0.2,
    }),
    emberOrange: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.25,
      roughness: 0.25,
    }),
    furTiger: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.78, metalness: 0.05 }),
    teamMat: team === 'player' ? pal.tunicPlayer : pal.tunicEnemy,
  };
  chineseMatCache.set(team, created);
  return created;
}

function attachPoseAnimator(
  group: THREE.Group,
  leftLeg: THREE.Object3D | null,
  rightLeg: THREE.Object3D | null,
  leftArm: THREE.Object3D | null,
  rightArm: THREE.Object3D | null,
  customTick?: (t: number, dt: number, moving: boolean, attackT: number | null) => void
) {
  let walkPhase = Math.random() * 6.28;
  group.userData.leftLeg = leftLeg;
  group.userData.rightLeg = rightLeg;
  group.userData.leftArm = leftArm;
  group.userData.rightArm = rightArm;
  group.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    walkPhase += dt * (moving ? Math.max(4.5, speed * 1.45) : 1.6);
    const swing = moving ? Math.sin(walkPhase) * 0.58 : 0;
    if (leftLeg) leftLeg.rotation.x = swing;
    if (rightLeg) rightLeg.rotation.x = -swing;
    if (leftArm) leftArm.rotation.x = -swing * 0.65;
    if (rightArm) {
      rightArm.rotation.x = attackT !== null ? -Math.sin(attackT * Math.PI) * 1.25 : swing * 0.65;
    }
    customTick?.(walkPhase, dt, moving, attackT);
  };
}

export function createChineseUnitMesh(
  kind: string,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const mapped = CANONICAL_CHINESE_UNIT_MAP[kind] ?? kind;
  const cm = getChineseMats(team, pal);
  const group = new THREE.Group();

  const addPart = (
    parent: THREE.Object3D,
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
    parent.add(m);
    return m;
  };

  if (mapped === 'azure_dragon') {
    // Serpentine Floating Celestial Azure Dragon
    const bodyGroup = new THREE.Group();
    group.add(bodyGroup);
    const segments: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const r = i === 0 ? 0.42 : Math.max(0.14, 0.38 - i * 0.036);
      const seg = addPart(
        bodyGroup,
        new THREE.SphereGeometry(r, 12, 10),
        i % 2 === 0 ? cm.jade : cm.celestialCyan,
        0,
        2.35 + Math.sin(i * 0.85) * 0.25,
        0.95 - i * 0.48
      );
      seg.scale.set(1, 0.9, 1.3);
      segments.push(seg);
      if (i > 0 && i < 6) {
        addPart(bodyGroup, new THREE.ConeGeometry(0.08, 0.34, 4), cm.gold, 0, seg.position.y + r + 0.12, seg.position.z);
      }
    }
    // Dragon Head + Antlers + Whiskers
    addPart(bodyGroup, new THREE.BoxGeometry(0.56, 0.46, 0.82), cm.jade, 0, 2.55, 1.38);
    addPart(bodyGroup, new THREE.BoxGeometry(0.42, 0.2, 0.46), cm.gold, 0, 2.38, 1.82);
    addPart(bodyGroup, new THREE.ConeGeometry(0.07, 0.58, 5), cm.gold, -0.22, 2.95, 1.2, -0.35, 0, 0.25);
    addPart(bodyGroup, new THREE.ConeGeometry(0.07, 0.58, 5), cm.gold, 0.22, 2.95, 1.2, -0.35, 0, -0.25);
    addPart(bodyGroup, new THREE.SphereGeometry(0.24, 10, 10), cm.emberOrange, 0, 2.42, 2.05);
    // Claws + Team Ribbon
    addPart(bodyGroup, new THREE.BoxGeometry(0.9, 0.12, 0.26), cm.teamMat, 0, 2.05, 0.65);

    attachPoseAnimator(group, null, null, null, null, (t, _dt, moving, attackT) => {
      bodyGroup.position.y = Math.sin(t * 1.4) * 0.16;
      segments.forEach((seg, idx) => {
        seg.position.x = Math.sin(t * (moving ? 2.2 : 1.5) - idx * 0.65) * 0.24;
      });
      if (attackT !== null) {
        bodyGroup.rotation.x = Math.sin(attackT * Math.PI) * 0.22;
      } else {
        bodyGroup.rotation.x = 0;
      }
    });
    return group;
  }

  if (mapped === 'taotie') {
    // Heavy Bronze-Mask Beast (Taotie)
    const body = addPart(group, new THREE.BoxGeometry(1.18, 0.96, 1.32), cm.bronze, 0, 1.15, 0);
    body.scale.set(1.05, 1, 1.1);
    addPart(group, new THREE.BoxGeometry(0.92, 0.72, 0.62), cm.lacquerDark, 0, 1.42, 0.72);
    // Glowing Crimson/Amber Mask Eyes & Tusks
    addPart(group, new THREE.SphereGeometry(0.11, 8, 8), cm.emberOrange, -0.24, 1.54, 1.03);
    addPart(group, new THREE.SphereGeometry(0.11, 8, 8), cm.emberOrange, 0.24, 1.54, 1.03);
    addPart(group, new THREE.ConeGeometry(0.1, 0.44, 5), cm.ivory, -0.3, 1.22, 1.02, Math.PI / 2.6, 0, 0.18);
    addPart(group, new THREE.ConeGeometry(0.1, 0.44, 5), cm.ivory, 0.3, 1.22, 1.02, Math.PI / 2.6, 0, -0.18);
    // Swept Bronze Horns
    addPart(group, new THREE.ConeGeometry(0.14, 0.75, 6), cm.gold, -0.45, 1.88, 0.56, -0.35, 0, 0.45);
    addPart(group, new THREE.ConeGeometry(0.14, 0.75, 6), cm.gold, 0.45, 1.88, 0.56, -0.35, 0, -0.45);
    addPart(group, new THREE.BoxGeometry(0.84, 0.24, 0.8), cm.teamMat, 0, 1.66, -0.08);
    const legGeo = new THREE.BoxGeometry(0.32, 0.78, 0.34);
    const lLeg = addPart(group, legGeo, cm.lacquerDark, -0.42, 0.42, 0.38);
    const rLeg = addPart(group, legGeo, cm.lacquerDark, 0.42, 0.42, 0.38);
    addPart(group, legGeo, cm.lacquerDark, -0.42, 0.42, -0.42);
    addPart(group, legGeo, cm.lacquerDark, 0.42, 0.42, -0.42);
    attachPoseAnimator(group, lLeg, rLeg, null, null);
    return group;
  }

  if (mapped === 'qilin') {
    // Scaled Horned Celestial Steed (Qilin)
    addPart(group, new THREE.BoxGeometry(0.64, 0.62, 1.38), cm.jade, 0, 1.02, 0);
    addPart(group, new THREE.BoxGeometry(0.46, 0.52, 0.42), cm.gold, 0, 1.46, 0.62, -0.4, 0, 0);
    addPart(group, new THREE.BoxGeometry(0.36, 0.34, 0.56), cm.jade, 0, 1.68, 0.86);
    addPart(group, new THREE.ConeGeometry(0.08, 0.56, 6), cm.celestialCyan, -0.1, 1.98, 0.88, -0.3, 0, 0.14);
    addPart(group, new THREE.ConeGeometry(0.08, 0.56, 6), cm.celestialCyan, 0.1, 1.98, 0.88, -0.3, 0, -0.14);
    addPart(group, new THREE.BoxGeometry(0.7, 0.18, 0.72), cm.teamMat, 0, 1.24, -0.05);
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.82, 6);
    const lLeg = addPart(group, legGeo, cm.gold, -0.24, 0.41, 0.48);
    const rLeg = addPart(group, legGeo, cm.gold, 0.24, 0.41, 0.48);
    addPart(group, legGeo, cm.gold, -0.24, 0.41, -0.48);
    addPart(group, legGeo, cm.gold, 0.24, 0.41, -0.48);
    attachPoseAnimator(group, lLeg, rLeg, null, null);
    return group;
  }

  if (mapped === 'yazi') {
    // Draconic Wolf-Jackal Assassin (Yazi)
    addPart(group, new THREE.BoxGeometry(0.54, 0.48, 1.22), cm.lacquerDark, 0, 0.84, 0);
    addPart(group, new THREE.BoxGeometry(0.38, 0.34, 0.52), cm.vermilion, 0, 1.05, 0.72);
    addPart(group, new THREE.ConeGeometry(0.08, 0.44, 5), cm.gold, -0.16, 1.32, 0.62, -0.2, 0, 0.2);
    addPart(group, new THREE.ConeGeometry(0.08, 0.44, 5), cm.gold, 0.16, 1.32, 0.62, -0.2, 0, -0.2);
    // Blade crest along back
    addPart(group, new THREE.BoxGeometry(0.08, 0.24, 0.9), cm.gold, 0, 1.18, -0.05);
    addPart(group, new THREE.BoxGeometry(0.58, 0.14, 0.55), cm.teamMat, 0, 0.94, 0);
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.64, 6);
    const lLeg = addPart(group, legGeo, cm.lacquerDark, -0.2, 0.34, 0.42);
    const rLeg = addPart(group, legGeo, cm.lacquerDark, 0.2, 0.34, 0.42);
    addPart(group, legGeo, cm.lacquerDark, -0.2, 0.34, -0.42);
    addPart(group, legGeo, cm.lacquerDark, 0.2, 0.34, -0.42);
    attachPoseAnimator(group, lLeg, rLeg, null, null);
    return group;
  }

  if (mapped === 'fire_lance') {
    // Wheeled Gunpowder Artillery Cart
    addPart(group, new THREE.BoxGeometry(1.05, 0.45, 1.45), pal.timber, 0, 0.58, 0);
    addPart(group, new THREE.BoxGeometry(1.1, 0.18, 0.8), cm.teamMat, 0, 0.86, -0.1);
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.14, 12);
    addPart(group, wheelGeo, cm.lacquerDark, -0.62, 0.38, 0.35, 0, 0, Math.PI / 2);
    addPart(group, wheelGeo, cm.lacquerDark, 0.62, 0.38, 0.35, 0, 0, Math.PI / 2);
    addPart(group, wheelGeo, cm.lacquerDark, -0.62, 0.38, -0.45, 0, 0, Math.PI / 2);
    addPart(group, wheelGeo, cm.lacquerDark, 0.62, 0.38, -0.45, 0, 0, Math.PI / 2);
    // Triple Bronze Gunpowder Barrels + Ember Tip
    addPart(group, new THREE.CylinderGeometry(0.14, 0.18, 1.55, 10), cm.bronze, 0, 1.08, 0.35, Math.PI / 2.3, 0, 0);
    addPart(group, new THREE.CylinderGeometry(0.1, 0.12, 1.35, 8), cm.gold, -0.22, 1.0, 0.35, Math.PI / 2.3, 0, 0);
    addPart(group, new THREE.CylinderGeometry(0.1, 0.12, 1.35, 8), cm.gold, 0.22, 1.0, 0.35, Math.PI / 2.3, 0, 0);
    addPart(group, new THREE.SphereGeometry(0.15, 8, 8), cm.emberOrange, 0, 1.24, 1.08);
    attachPoseAnimator(group, null, null, null, null);
    return group;
  }

  if (mapped === 'tiger_cavalry') {
    // Armored Horse + Tiger-Bannered Rider
    addPart(group, new THREE.BoxGeometry(0.56, 0.56, 1.34), cm.furTiger, 0, 0.94, 0);
    addPart(group, new THREE.BoxGeometry(0.6, 0.24, 0.9), cm.teamMat, 0, 1.02, -0.05);
    addPart(group, new THREE.BoxGeometry(0.32, 0.44, 0.36), cm.furTiger, 0, 1.34, 0.58, -0.4, 0, 0);
    addPart(group, new THREE.BoxGeometry(0.28, 0.26, 0.45), cm.gold, 0, 1.56, 0.78);
    const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.76, 6);
    const lLeg = addPart(group, legGeo, cm.lacquerDark, -0.2, 0.38, 0.45);
    const rLeg = addPart(group, legGeo, cm.lacquerDark, 0.2, 0.38, 0.45);
    addPart(group, legGeo, cm.lacquerDark, -0.2, 0.38, -0.45);
    addPart(group, legGeo, cm.lacquerDark, 0.2, 0.38, -0.45);
    // Rider
    addPart(group, new THREE.BoxGeometry(0.42, 0.58, 0.3), cm.vermilion, 0, 1.54, -0.04);
    addPart(group, new THREE.SphereGeometry(0.17, 10, 8), pal.skin, 0, 1.98, 0);
    addPart(group, new THREE.ConeGeometry(0.22, 0.2, 8), cm.gold, 0, 2.12, 0);
    const rArm = new THREE.Group();
    rArm.position.set(0.28, 1.72, 0);
    addPart(rArm, new THREE.CylinderGeometry(0.035, 0.04, 1.9, 6), pal.timber, 0, 0, 0.45, Math.PI / 2.2, 0, 0);
    addPart(rArm, new THREE.BoxGeometry(0.06, 0.34, 0.24), cm.teamMat, 0, 0.35, -0.15);
    group.add(rArm);
    attachPoseAnimator(group, lLeg, rLeg, null, rArm);
    return group;
  }

  // Humanoid Chinese Units: chinese_peasant, kuafu, halberdier, chu_ko_nu, nezha, jiang_ziya
  const isKuafu = mapped === 'kuafu';
  const isNezha = mapped === 'nezha';
  const isJiang = mapped === 'jiang_ziya';
  const isCrossbow = mapped === 'chu_ko_nu';
  const isHalberd = mapped === 'halberdier';

  const scale = isKuafu ? 1.58 : isNezha || isJiang ? 1.14 : 1.0;
  const bodyRoot = new THREE.Group();
  bodyRoot.scale.setScalar(scale);
  group.add(bodyRoot);

  const legGeo = new THREE.BoxGeometry(0.16, 0.56, 0.16);
  const lLeg = addPart(bodyRoot, legGeo, cm.lacquerDark, -0.13, 0.3, 0);
  const rLeg = addPart(bodyRoot, legGeo, cm.lacquerDark, 0.13, 0.3, 0);

  const tunicMat = isNezha
    ? cm.vermilion
    : isJiang
    ? cm.ivory
    : isKuafu
    ? cm.bronze
    : isHalberd || isCrossbow
    ? cm.jade
    : cm.teamMat;

  addPart(bodyRoot, new THREE.BoxGeometry(0.46, 0.62, 0.28), tunicMat, 0, 0.88, 0);
  addPart(bodyRoot, new THREE.BoxGeometry(0.48, 0.16, 0.3), cm.teamMat, 0, 0.66, 0);
  addPart(bodyRoot, new THREE.SphereGeometry(0.18, 10, 8), isKuafu ? cm.bronze : pal.skin, 0, 1.38, 0);

  if (mapped === 'chinese_peasant') {
    // Wide Conical Straw Hat
    addPart(bodyRoot, new THREE.ConeGeometry(0.36, 0.18, 10), pal.goldOre, 0, 1.52, 0);
  } else if (isHalberd || isCrossbow) {
    // Imperial Lacquered Helmet
    addPart(bodyRoot, new THREE.ConeGeometry(0.24, 0.22, 8), cm.gold, 0, 1.54, 0);
  } else if (isKuafu) {
    // Heavy Bronze Braids & Shoulder Guard
    addPart(bodyRoot, new THREE.BoxGeometry(0.64, 0.16, 0.34), cm.gold, 0, 1.16, 0);
  } else if (isNezha) {
    // Twin Hair Buns + Flowing Red Ribbon + Wind-Fire Wheels under feet
    addPart(bodyRoot, new THREE.SphereGeometry(0.08, 8, 8), cm.lacquerDark, -0.16, 1.54, 0);
    addPart(bodyRoot, new THREE.SphereGeometry(0.08, 8, 8), cm.lacquerDark, 0.16, 1.54, 0);
    addPart(bodyRoot, new THREE.TorusGeometry(0.34, 0.04, 6, 16), cm.vermilion, 0, 1.15, -0.12);
    const wheelL = addPart(bodyRoot, new THREE.TorusGeometry(0.18, 0.05, 6, 14), cm.emberOrange, -0.2, 0.22, 0, 0, Math.PI / 2, 0);
    const wheelR = addPart(bodyRoot, new THREE.TorusGeometry(0.18, 0.05, 6, 14), cm.emberOrange, 0.2, 0.22, 0, 0, Math.PI / 2, 0);
    wheelL.name = 'nezha_wheel_l';
    wheelR.name = 'nezha_wheel_r';
  } else if (isJiang) {
    // Imperial Taoist Crown & White Beard
    addPart(bodyRoot, new THREE.CylinderGeometry(0.14, 0.18, 0.22, 8), cm.gold, 0, 1.58, 0);
    addPart(bodyRoot, new THREE.ConeGeometry(0.09, 0.26, 6), cm.ivory, 0, 1.24, 0.16, Math.PI, 0, 0);
  }

  const lArm = new THREE.Group();
  lArm.position.set(-0.3, 1.12, 0);
  addPart(lArm, new THREE.BoxGeometry(0.14, 0.48, 0.14), tunicMat, 0, -0.22, 0);
  bodyRoot.add(lArm);

  const rArm = new THREE.Group();
  rArm.position.set(0.3, 1.12, 0);
  addPart(rArm, new THREE.BoxGeometry(0.14, 0.48, 0.14), tunicMat, 0, -0.22, 0);
  bodyRoot.add(rArm);

  if (isHalberd) {
    addPart(rArm, new THREE.CylinderGeometry(0.03, 0.035, 1.75, 6), pal.timber, 0, -0.15, 0.3, Math.PI / 2.6, 0, 0);
    addPart(rArm, new THREE.BoxGeometry(0.05, 0.34, 0.16), cm.gold, 0, 0.48, 0.65);
  } else if (isCrossbow) {
    addPart(rArm, new THREE.BoxGeometry(0.18, 0.14, 0.56), pal.timber, -0.1, -0.22, 0.32);
    addPart(rArm, new THREE.BoxGeometry(0.62, 0.06, 0.08), cm.gold, -0.1, -0.22, 0.5);
  } else if (isNezha) {
    addPart(rArm, new THREE.CylinderGeometry(0.03, 0.035, 1.7, 6), cm.gold, 0, -0.12, 0.32, Math.PI / 2.5, 0, 0);
    addPart(rArm, new THREE.ConeGeometry(0.08, 0.35, 6), cm.emberOrange, 0, 0.54, 0.62, Math.PI / 2.5, 0, 0);
  } else if (isJiang) {
    addPart(rArm, new THREE.CylinderGeometry(0.035, 0.04, 1.65, 6), cm.gold, 0, -0.15, 0.25, Math.PI / 3, 0, 0);
    addPart(rArm, new THREE.OctahedronGeometry(0.14, 0), cm.celestialCyan, 0, 0.48, 0.52);
  } else if (isKuafu) {
    addPart(rArm, new THREE.CylinderGeometry(0.08, 0.06, 1.2, 6), pal.timber, 0, -0.25, 0.3, Math.PI / 2.5, 0, 0);
  } else {
    addPart(rArm, new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6), pal.timber, 0, -0.22, 0.2, Math.PI / 3, 0, 0);
  }

  attachPoseAnimator(group, lLeg, rLeg, lArm, rArm);
  return group;
}

export function createChineseDragonTitanMesh(pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const cm = getChineseMats('player', pal);
  const root = new THREE.Group();

  const addPart = (
    parent: THREE.Object3D,
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
    parent.add(m);
    return m;
  };

  // Colossal Imperial Celestial Dragon Titan (~8.8u tall)
  const titanPivot = new THREE.Group();
  root.add(titanPivot);

  const segments: THREE.Mesh[] = [];
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const radius = 1.05 - t * 0.65;
    const y = 2.0 + Math.sin(t * Math.PI * 1.4) * 3.8 + t * 2.2;
    const z = 1.2 - t * 3.4;
    const x = Math.sin(t * Math.PI * 2.0) * 0.75;
    const seg = addPart(
      titanPivot,
      new THREE.SphereGeometry(radius, 14, 10),
      i % 2 === 0 ? cm.jade : cm.gold,
      x,
      y,
      z
    );
    segments.push(seg);
    addPart(titanPivot, new THREE.ConeGeometry(0.22, 0.95, 4), cm.vermilion, x, y + radius + 0.35, z);
  }

  // Colossal Crowned Dragon Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 6.9, 1.9);
  titanPivot.add(headGroup);
  addPart(headGroup, new THREE.BoxGeometry(1.75, 1.35, 2.25), cm.jade, 0, 0, 0);
  addPart(headGroup, new THREE.BoxGeometry(1.3, 0.55, 1.45), cm.gold, 0, -0.45, 0.95);
  addPart(headGroup, new THREE.ConeGeometry(0.24, 1.85, 6), cm.gold, -0.68, 1.28, -0.35, -0.45, 0, 0.3);
  addPart(headGroup, new THREE.ConeGeometry(0.24, 1.85, 6), cm.gold, 0.68, 1.28, -0.35, -0.45, 0, -0.3);
  addPart(headGroup, new THREE.SphereGeometry(0.24, 10, 10), cm.emberOrange, -0.52, 0.25, 1.12);
  addPart(headGroup, new THREE.SphereGeometry(0.24, 10, 10), cm.emberOrange, 0.52, 0.25, 1.12);

  // Orbiting Dragon Pearl (Crystal Beacon)
  const pearl = addPart(headGroup, new THREE.OctahedronGeometry(0.62, 1), cm.celestialCyan, 0, -0.15, 2.15);
  root.userData.beaconCrystal = pearl;

  // Forelimbs with massive golden claws
  const leftArm = addPart(titanPivot, new THREE.BoxGeometry(0.65, 2.2, 0.65), cm.jade, -1.35, 4.1, 0.8, 0.3, 0, -0.2);
  const rightArm = addPart(titanPivot, new THREE.BoxGeometry(0.65, 2.2, 0.65), cm.jade, 1.35, 4.1, 0.8, 0.3, 0, 0.2);

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, _speed: number, attackT: number | null) => {
    phase += dt * (moving ? 3.2 : 1.7);
    titanPivot.position.y = Math.sin(phase) * 0.22;
    segments.forEach((seg, idx) => {
      seg.position.x = Math.sin(phase - idx * 0.55) * 0.72;
    });
    pearl.rotation.y += dt * 2.4;
    if (attackT !== null) {
      headGroup.rotation.x = Math.sin(attackT * Math.PI) * 0.45;
      rightArm.rotation.x = -Math.sin(attackT * Math.PI) * 1.1;
      leftArm.rotation.x = -Math.sin(attackT * Math.PI) * 0.85;
    } else {
      headGroup.rotation.x *= 0.9;
      rightArm.rotation.x = 0.3;
      leftArm.rotation.x = 0.3;
    }
  };
  root.userData.updateBrg = (dt: number, state: string) => {
    root.userData.animatePose?.(dt, state === 'move', 2.0, state === 'attack' ? 0.5 : null);
  };

  return root;
}

export function createChineseBuildingMesh(
  kind: BuildingKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  age: AgeLevel = 1,
  _pantheon: PantheonId = 'chinese',
  _majorGod?: string
): ChineseBuildingMeshResult {
  const cm = getChineseMats(team, pal);
  const group = new THREE.Group();
  let beaconCrystal: THREE.Object3D | undefined;
  let vortexRing: THREE.Object3D | undefined;
  let markerRadius = 2.4;
  let barHeight = 4.2;
  let barWidth = 2.4;

  const add = (
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
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    group.add(m);
    return m;
  };

  const addPagodaRoof = (w: number, d: number, y: number, roofMat: THREE.Material, levels = 1) => {
    for (let i = 0; i < levels; i++) {
      const s = Math.pow(0.74, i);
      const curY = y + i * 1.25;
      // Wide upturned eaves
      add(new THREE.BoxGeometry(w * s * 1.18, 0.22, d * s * 1.18), roofMat, 0, curY, 0);
      add(new THREE.ConeGeometry(Math.max(w, d) * s * 0.72, 1.05, 4), roofMat, 0, curY + 0.58, 0, 0, Math.PI / 4, 0);
      // Golden corner finial tips
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          add(
            new THREE.ConeGeometry(0.12, 0.42, 4),
            cm.gold,
            sx * w * s * 0.58,
            curY + 0.18,
            sz * d * s * 0.58,
            0,
            0,
            -sx * 0.35
          );
        }
      }
      if (i < levels - 1) {
        add(new THREE.BoxGeometry(w * s * 0.68, 1.05, d * s * 0.68), cm.vermilion, 0, curY + 0.7, 0);
      }
    }
  };

  if (kind === 'town_center') {
    const roofLevels = age >= 3 ? 3 : 2;
    add(new THREE.BoxGeometry(6.8, 0.55, 6.2), cm.ivory, 0, 0.28, 0);
    add(new THREE.BoxGeometry(5.6, 2.0, 5.0), cm.vermilion, 0, 1.55, 0);
    // Vermilion lacquered columns around porch
    for (const cx of [-2.95, -1.5, 1.5, 2.95]) {
      for (const cz of [-2.65, 2.65]) {
        add(new THREE.CylinderGeometry(0.14, 0.16, 2.1, 8), cm.vermilion, cx, 1.55, cz);
      }
    }
    addPagodaRoof(6.2, 5.6, 2.65, cm.jade, roofLevels);
    add(new THREE.BoxGeometry(1.15, 1.35, 0.14), cm.teamMat, 0, 1.55, 2.55);
    beaconCrystal = add(new THREE.OctahedronGeometry(0.45, 0), cm.gold, 0, 2.65 + roofLevels * 1.25 + 0.35, 0);
    markerRadius = 3.9;
    barHeight = 6.8;
    barWidth = 3.2;
  } else if (kind === 'house') {
    add(new THREE.BoxGeometry(2.7, 0.25, 2.5), cm.ivory, 0, 0.12, 0);
    add(new THREE.BoxGeometry(2.2, 1.25, 2.0), cm.ivory, 0, 0.85, 0);
    add(new THREE.BoxGeometry(2.3, 1.25, 0.15), cm.vermilion, 0, 0.85, 1.02);
    addPagodaRoof(2.55, 2.35, 1.55, cm.slateRoof, 1);
    add(new THREE.BoxGeometry(0.55, 0.55, 0.1), cm.teamMat, 0, 0.85, 1.1);
    markerRadius = 1.65;
    barHeight = 3.1;
    barWidth = 1.7;
  } else if (kind === 'farm') {
    add(new THREE.BoxGeometry(3.4, 0.12, 3.4), pal.timber, 0, 0.06, 0);
    for (let r = -1.1; r <= 1.1; r += 0.55) {
      add(new THREE.BoxGeometry(3.0, 0.14, 0.26), pal.foliagePine, 0, 0.2, r);
    }
    add(new THREE.BoxGeometry(0.95, 0.9, 0.95), cm.vermilion, -1.0, 0.52, -1.0);
    addPagodaRoof(1.15, 1.15, 1.0, cm.slateRoof, 1);
    markerRadius = 2.0;
    barHeight = 2.2;
    barWidth = 1.8;
  } else if (kind === 'temple') {
    add(new THREE.BoxGeometry(4.4, 0.45, 4.4), cm.ivory, 0, 0.22, 0);
    add(new THREE.BoxGeometry(3.5, 1.85, 3.5), cm.vermilion, 0, 1.35, 0);
    addPagodaRoof(4.0, 4.0, 2.35, cm.jade, 2);
    beaconCrystal = add(new THREE.OctahedronGeometry(0.45, 0), cm.celestialCyan, 0, 5.2, 0);
    add(new THREE.BoxGeometry(0.85, 0.9, 0.12), cm.teamMat, 0, 1.35, 1.78);
    markerRadius = 2.7;
    barHeight = 5.6;
    barWidth = 2.6;
  } else if (kind === 'fortress') {
    add(new THREE.BoxGeometry(5.6, 0.65, 5.6), cm.ivory, 0, 0.32, 0);
    add(new THREE.BoxGeometry(4.8, 2.5, 4.8), cm.slateRoof, 0, 1.85, 0);
    for (const sx of [-2.2, 2.2]) {
      for (const sz of [-2.2, 2.2]) {
        add(new THREE.BoxGeometry(1.1, 3.3, 1.1), cm.vermilion, sx, 1.95, sz);
        add(new THREE.ConeGeometry(0.95, 0.9, 4), cm.gold, sx, 4.05, sz, 0, Math.PI / 4, 0);
      }
    }
    addPagodaRoof(4.4, 4.4, 3.15, cm.vermilion, 2);
    add(new THREE.BoxGeometry(1.2, 1.25, 0.14), cm.teamMat, 0, 1.95, 2.45);
    markerRadius = 3.2;
    barHeight = 6.2;
    barWidth = 2.9;
  } else if (kind === 'tower') {
    add(new THREE.BoxGeometry(2.1, 0.5, 2.1), cm.ivory, 0, 0.25, 0);
    add(new THREE.BoxGeometry(1.5, 4.2, 1.5), cm.vermilion, 0, 2.4, 0);
    addPagodaRoof(2.2, 2.2, 4.55, cm.slateRoof, 1);
    add(new THREE.BoxGeometry(0.65, 0.65, 0.12), cm.teamMat, 0, 3.2, 0.8);
    markerRadius = 1.65;
    barHeight = 6.2;
    barWidth = 1.9;
  } else if (kind === 'titan_gate') {
    add(new THREE.BoxGeometry(6.8, 0.6, 6.8), cm.ivory, 0, 0.3, 0);
    add(new THREE.CylinderGeometry(0.45, 0.55, 5.2, 10), cm.vermilion, -2.2, 2.9, 0);
    add(new THREE.CylinderGeometry(0.45, 0.55, 5.2, 10), cm.vermilion, 2.2, 2.9, 0);
    add(new THREE.BoxGeometry(5.6, 0.65, 1.1), cm.gold, 0, 5.5, 0);
    addPagodaRoof(5.4, 2.2, 5.9, cm.jade, 1);
    vortexRing = add(new THREE.TorusGeometry(1.9, 0.16, 10, 28), cm.celestialCyan, 0, 2.95, 0);
    beaconCrystal = add(new THREE.OctahedronGeometry(0.6, 0), cm.gold, 0, 2.95, 0);
    markerRadius = 4.2;
    barHeight = 7.4;
    barWidth = 3.5;
  } else {
    // barracks, archery_range, stable, siege_works, armory, market
    const roofColor =
      kind === 'archery_range' || kind === 'stable'
        ? cm.jade
        : kind === 'armory' || kind === 'siege_works'
        ? cm.slateRoof
        : cm.vermilion;
    add(new THREE.BoxGeometry(3.8, 0.35, 3.4), cm.ivory, 0, 0.18, 0);
    add(new THREE.BoxGeometry(3.1, 1.65, 2.7), cm.vermilion, 0, 1.18, 0);
    addPagodaRoof(3.55, 3.15, 2.05, roofColor, 1);
    add(new THREE.BoxGeometry(0.8, 0.85, 0.12), cm.teamMat, 0, 1.15, 1.38);
    markerRadius = 2.4;
    barHeight = 4.1;
    barWidth = 2.3;
  }

  return {
    group,
    markerRadius,
    barHeight,
    barWidth,
    beaconCrystal,
    vortexRing,
  };
}
