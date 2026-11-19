import * as THREE from 'three';

export interface SetTextures {
  skinBump: THREE.CanvasTexture;
  nemesTex: THREE.CanvasTexture;
  kiltTex: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export type SetMode = 'senhor' | 'tempestade' | 'deserto' | 'monstro';

export interface SetModel {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legs: {
    L: { hip: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; ankle: THREE.Group };
  };
  rightArm: {
    armRoot: THREE.Group;
    elbow: THREE.Group;
    hand: THREE.Group;
  };
  leftArm: {
    armRoot: THREE.Group;
    elbow: THREE.Group;
    hand: THREE.Group;
  };
  wasOrbitGroup: THREE.Group;
  wasScepter: THREE.Group;
  ankhOrbitGroup: THREE.Group;
  ankhArtifact: THREE.Group;
  materials: {
    skin: THREE.MeshStandardMaterial;
    pureGold: THREE.MeshStandardMaterial;
    lapisBlue: THREE.MeshStandardMaterial;
    turquoise: THREE.MeshStandardMaterial;
    obsidianKohl: THREE.MeshStandardMaterial;
    chaosPurple: THREE.MeshStandardMaterial;
    eyeChaosGlow: THREE.MeshStandardMaterial;
    nemesMat: THREE.MeshStandardMaterial;
    kiltMat: THREE.MeshStandardMaterial;
  };
}

let cachedSetTextures: SetTextures | null = null;

export function getCachedSetTextures(): SetTextures {
  if (cachedSetTextures) return cachedSetTextures;

  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5200; i++) {
      const v = 118 + Math.floor(Math.random() * 16);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  const nemesCanvas = document.createElement('canvas');
  nemesCanvas.width = nemesCanvas.height = 512;
  const nCtx = nemesCanvas.getContext('2d');
  if (nCtx) {
    const stripeH = 16;
    for (let y = 0; y < 512; y += stripeH) {
      const isGold = (y / stripeH) % 2 === 0;
      nCtx.fillStyle = isGold ? '#facc15' : '#7c2d12';
      nCtx.fillRect(0, y, 512, stripeH);
      nCtx.fillStyle = isGold ? '#fef08a' : '#9a3412';
      nCtx.fillRect(0, y, 512, 3);
    }
  }
  const nemesTex = new THREE.CanvasTexture(nemesCanvas);
  nemesTex.wrapS = nemesTex.wrapT = THREE.RepeatWrapping;

  const kiltCanvas = document.createElement('canvas');
  kiltCanvas.width = 512;
  kiltCanvas.height = 256;
  const kCtx = kiltCanvas.getContext('2d');
  if (kCtx) {
    const kGrad = kCtx.createLinearGradient(0, 0, 0, 256);
    kGrad.addColorStop(0, '#7c2d12');
    kGrad.addColorStop(0.7, '#9a3412');
    kGrad.addColorStop(1, '#c2410c');
    kCtx.fillStyle = kGrad;
    kCtx.fillRect(0, 0, 512, 256);

    kCtx.fillStyle = '#facc15';
    kCtx.fillRect(0, 198, 512, 38);
    kCtx.fillStyle = '#451a03';
    kCtx.fillRect(0, 194, 512, 4);
    kCtx.fillRect(0, 236, 512, 4);
  }
  const kiltTex = new THREE.CanvasTexture(kiltCanvas);
  kiltTex.wrapS = kiltTex.wrapT = THREE.RepeatWrapping;

  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    const fGrad = fCtx.createRadialGradient(512, 512, 40, 512, 512, 512);
    fGrad.addColorStop(0, '#c2410c');
    fGrad.addColorStop(0.5, '#7c2d12');
    fGrad.addColorStop(0.85, '#451a03');
    fGrad.addColorStop(1, '#1c0a03');
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 4000; i++) {
      fCtx.fillStyle = i % 2 === 0 ? 'rgba(194, 65, 12, 0.25)' : 'rgba(126, 34, 206, 0.2)';
      fCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 8, 8);
    }

    const cx = 512;
    const cy = 512;
    fCtx.strokeStyle = '#9333ea';
    fCtx.lineWidth = 16;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 420, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#facc15';
    fCtx.lineWidth = 7;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 436, 0, Math.PI * 2);
    fCtx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);

  cachedSetTextures = { skinBump, nemesTex, kiltTex, floorTex };
  return cachedSetTextures;
}

function group(parent: THREE.Group | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D | null,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1]
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}

export function buildSet(textures?: SetTextures): SetModel {
  const tex = textures || getCachedSetTextures();

  const M = {
    skin: new THREE.MeshStandardMaterial({
      color: 0x3d3532,
      roughness: 0.32,
      metalness: 0.15,
      bumpMap: tex.skinBump,
      bumpScale: 0.003,
    }),
    pureGold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x451a03,
      emissiveIntensity: 0.3,
      metalness: 0.95,
      roughness: 0.12,
    }),
    lapisBlue: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.25,
      metalness: 0.5,
      roughness: 0.25,
    }),
    turquoise: new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0e7490,
      emissiveIntensity: 0.45,
      metalness: 0.5,
      roughness: 0.2,
    }),
    obsidianKohl: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.85,
      roughness: 0.22,
    }),
    chaosPurple: new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.45,
      roughness: 0.1,
    }),
    eyeChaosGlow: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf97316,
      emissiveIntensity: 1.75,
      roughness: 0.05,
    }),
    nemesMat: new THREE.MeshStandardMaterial({
      map: tex.nemesTex,
      roughness: 0.45,
      metalness: 0.1,
      side: THREE.DoubleSide,
    }),
    kiltMat: new THREE.MeshStandardMaterial({
      map: tex.kiltTex,
      roughness: 0.48,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
  };

  const root = new THREE.Group();
  const body = group(root, 0, 1.12, 0);

  // Pelve e Pernas
  const pelvis = group(body, 0, 0.88, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.21, 24, 20), M.skin, [0, 0, 0], [0, 0, 0], [1.05, 0.76, 0.8]);

  const legs = {
    L: { hip: new THREE.Group(), ankle: new THREE.Group() },
    R: { hip: new THREE.Group(), ankle: new THREE.Group() },
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.12, -0.04, 0);
    sculpt(hip, new THREE.CylinderGeometry(0.12, 0.085, 0.52, 20), M.skin, [0, -0.25, 0], [0, 0, 0], [1.0, 1, 1.05]);
    sculpt(hip, new THREE.SphereGeometry(0.08, 16, 16), M.skin, [0, -0.5, 0.01]);

    const ankle = group(hip, 0, -0.51, 0);
    sculpt(ankle, new THREE.BoxGeometry(0.075, 0.04, 0.19), M.skin, [0, -0.02, 0.035], [0.15, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.08, 0.012, 0.2), M.pureGold, [0, -0.04, 0.035], [0.15, 0, 0]);
    const strap = new THREE.TorusGeometry(0.05, 0.006, 8, 20);
    strap.rotateX(Math.PI / 2);
    sculpt(ankle, strap, M.pureGold, [0, 0.02, -0.02], [0.1, 0, 0]);
    sculpt(ankle, strap, M.pureGold, [0, 0.06, -0.02], [0.1, 0, 0]);
    legs[side] = { hip, ankle };
  }

  legs.L.hip.rotation.set(-0.15, -0.08, -0.02);
  legs.R.hip.rotation.set(0.1, 0.08, 0.02);

  sculpt(pelvis, new THREE.CylinderGeometry(0.21, 0.25, 0.95, 36, 1, true), M.kiltMat, [0, -0.45, 0]);
  sculpt(pelvis, new THREE.BoxGeometry(0.12, 0.65, 0.02), M.pureGold, [0, -0.3, 0.18], [0.05, 0, 0]);

  const belt = new THREE.TorusGeometry(0.21, 0.025, 12, 36);
  belt.rotateX(Math.PI / 2);
  sculpt(pelvis, belt, M.pureGold, [0, 0.02, 0]);
  sculpt(pelvis, new THREE.OctahedronGeometry(0.035, 0), M.turquoise, [0, 0.02, 0.215]);

  // Tronco
  const torso = group(body, 0, 1.38, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.45),
    new THREE.Vector2(0.2, -0.41),
    new THREE.Vector2(0.16, -0.18),
    new THREE.Vector2(0.21, 0.05),
    new THREE.Vector2(0.27, 0.26),
    new THREE.Vector2(0.24, 0.41),
    new THREE.Vector2(0.11, 0.48),
    new THREE.Vector2(0.01, 0.49),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skin, [0, 0, 0], [0, 0, 0], [1.1, 1.0, 0.75]);

  // Colar Usekh ricamente ornamentado em ouro e lápis-lazúli
  for (let c = 0; c < 5; c++) {
    const colMat = c % 2 === 0 ? M.pureGold : M.lapisBlue;
    const usekh = new THREE.TorusGeometry(0.14 + c * 0.028, 0.015, 8, 36, Math.PI);
    usekh.rotateX(Math.PI / 2);
    sculpt(torso, usekh, colMat, [0, 0.38 - c * 0.025, 0.02 + c * 0.005], [0.2, 0, 0], [1.1, 1, 0.85]);
  }

  // Ornamento peitoral com gema preciosa turquesa emoldurada em ouro
  const peitoralGemGroup = group(torso, 0, 0.24, 0.21);
  sculpt(peitoralGemGroup, new THREE.BoxGeometry(0.095, 0.095, 0.025), M.pureGold);
  sculpt(peitoralGemGroup, new THREE.OctahedronGeometry(0.042, 0), M.turquoise, [0, 0, 0.018]);
  for (const side of [-1, 1]) {
    sculpt(
      peitoralGemGroup,
      new THREE.ConeGeometry(0.015, 0.06, 5),
      M.pureGold,
      [side * 0.07, 0, 0.01],
      [0, 0, (side * -Math.PI) / 2]
    );
  }

  sculpt(torso, new THREE.CylinderGeometry(0.09, 0.11, 0.25, 20), M.skin, [0, 0.51, -0.005], [0.05, 0, 0]);

  // Cabeça bestial de Set
  const head = group(torso, 0, 0.72, 0.025);
  sculpt(head, new THREE.SphereGeometry(0.17, 36, 36), M.skin, [0, 0, 0], [0, 0, 0], [0.92, 1.15, 0.95]);

  const eyeGeo = new THREE.SphereGeometry(0.018, 16, 16);
  sculpt(head, eyeGeo, M.eyeChaosGlow, [-0.048, 0.02, 0.165], [0, 0, 0], [1.12, 0.75, 0.8]);
  sculpt(head, eyeGeo, M.eyeChaosGlow, [0.048, 0.02, 0.165], [0, 0, 0], [1.12, 0.75, 0.8]);
  sculpt(head, new THREE.BoxGeometry(0.052, 0.007, 0.014), M.obsidianKohl, [-0.048, 0.026, 0.175], [0, 0, -0.15]);
  sculpt(head, new THREE.BoxGeometry(0.052, 0.007, 0.014), M.obsidianKohl, [0.048, 0.026, 0.175], [0, 0, 0.15]);

  // Focinho alongado
  const setSnout = group(head, 0, -0.02, 0.14);
  sculpt(setSnout, new THREE.BoxGeometry(0.062, 0.062, 0.32), M.skin, [0, 0, 0.14], [0.05, 0, 0]);
  sculpt(setSnout, new THREE.BoxGeometry(0.068, 0.032, 0.048), M.obsidianKohl, [0, 0.02, 0.28]);

  // Orelhas retas e altas características
  for (const side of [-1, 1]) {
    const earGroup = group(head, side * 0.08, 0.16, -0.02);
    earGroup.rotation.z = side * -0.12;
    sculpt(earGroup, new THREE.BoxGeometry(0.042, 0.36, 0.075), M.skin, [0, 0.14, 0]);
    sculpt(earGroup, new THREE.BoxGeometry(0.025, 0.32, 0.05), M.pureGold, [0, 0.14, 0.01]);
  }

  // Cocar Nemes estendido longamente até os ombros, ricamente emoldurado em ouro e pedras preciosas
  sculpt(head, new THREE.SphereGeometry(0.19, 24, 24), M.nemesMat, [0, 0.04, -0.02], [-0.05, 0, 0], [1.04, 1.08, 1.08]);
  for (const side of [-1, 1]) {
    const lappet = sculpt(
      head,
      new THREE.BoxGeometry(0.095, 0.54, 0.12),
      M.nemesMat,
      [side * 0.18, -0.18, 0.04],
      [0.12, 0, side * -0.22]
    );
    for (let i = 0; i < 6; i++) {
      const gemMat = i % 2 === 0 ? M.pureGold : i === 1 ? M.turquoise : M.lapisBlue;
      sculpt(lappet, new THREE.BoxGeometry(0.1, 0.035, 0.13), gemMat, [0, 0.2 - i * 0.08, 0]);
    }
  }

  // Braços
  function createSetArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const armRoot = group(torso, s * 0.35, 0.32, -0.01);

    sculpt(armRoot, new THREE.SphereGeometry(0.1, 16, 16), M.skin, [0, 0, 0], [0, 0, s * -0.2]);
    sculpt(armRoot, new THREE.CapsuleGeometry(0.06, 0.24, 12, 16), M.skin, [s * 0.015, -0.16, 0], [0, 0, s * 0.05]);
    sculpt(armRoot, new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16), M.pureGold, [s * 0.015, -0.16, 0], [0, 0, s * 0.05]);

    const elbow = group(armRoot, s * 0.03, -0.32, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.055, 0.04, 0.28, 16), M.skin, [0, -0.14, 0]);
    sculpt(elbow, new THREE.CylinderGeometry(0.06, 0.055, 0.12, 20, 1, true), M.pureGold, [0, -0.14, 0]);

    const hand = group(elbow, 0, -0.28, 0);
    sculpt(hand, new THREE.BoxGeometry(0.05, 0.06, 0.025), M.skin, [0, -0.01, 0]);

    return { armRoot, elbow, hand };
  }

  const rightArm = createSetArm(true);
  const leftArm = createSetArm(false);

  rightArm.armRoot.rotation.set(0.15, 0.1, 0.35);
  rightArm.elbow.rotation.set(-0.25, 0, 0.2);
  leftArm.armRoot.rotation.set(0.15, -0.1, -0.35);
  leftArm.elbow.rotation.set(-0.25, 0, -0.2);

  // Cetro Was flutuando em pé à direita
  const wasOrbitGroup = new THREE.Group();
  root.add(wasOrbitGroup);
  const wasScepter = new THREE.Group();
  wasOrbitGroup.add(wasScepter);
  sculpt(wasScepter, new THREE.CylinderGeometry(0.018, 0.018, 2.35, 16), M.pureGold, [0, 0.16, 0]);
  sculpt(wasScepter, new THREE.BoxGeometry(0.065, 0.095, 0.08), M.pureGold, [0, 1.28, 0]);
  sculpt(wasScepter, new THREE.ConeGeometry(0.022, 0.12, 6), M.pureGold, [0, 1.36, -0.035], [0.35, 0, 0]);
  sculpt(wasScepter, new THREE.OctahedronGeometry(0.034, 0), M.turquoise, [0, 1.28, 0.045]);

  // Chave da Vida Ankh flutuando em pé à esquerda
  const ankhOrbitGroup = new THREE.Group();
  root.add(ankhOrbitGroup);
  const ankhArtifact = new THREE.Group();
  ankhOrbitGroup.add(ankhArtifact);
  sculpt(ankhArtifact, new THREE.BoxGeometry(0.055, 0.48, 0.032), M.pureGold, [0, -0.22, 0]);
  sculpt(ankhArtifact, new THREE.TorusGeometry(0.125, 0.026, 12, 36), M.pureGold, [0, 0.22, 0], [0, 0, 0], [0.88, 1.32, 0.75]);

  return {
    root,
    body,
    torso,
    head,
    legs,
    rightArm,
    leftArm,
    wasOrbitGroup,
    wasScepter,
    ankhOrbitGroup,
    ankhArtifact,
    materials: M,
  };
}

export function animateSet(setGod: SetModel, dt: number, t: number, mode: SetMode = 'senhor') {
  const hoverY = Math.sin(t * 1.5) * 0.08;
  setGod.body.position.y = 1.12 + hoverY;

  // Rotação orbital dos artefatos sagrados flutuantes
  const wasX = 1.15 + Math.sin(t * 1.8) * 0.08;
  const wasZ = 0.15 + Math.cos(t * 1.8) * 0.12;
  setGod.wasOrbitGroup.position.set(wasX, 1.25 + Math.sin(t * 2.2) * 0.09, wasZ);
  setGod.wasScepter.rotation.y = t * 1.2;
  setGod.wasScepter.rotation.z = Math.sin(t * 1.5) * 0.06;

  const ankhX = -1.15 - Math.sin(t * 1.6) * 0.08;
  const ankhZ = 0.15 + Math.cos(t * 1.6) * 0.12;
  setGod.ankhOrbitGroup.position.set(ankhX, 1.25 + Math.cos(t * 2.1) * 0.09, ankhZ);
  setGod.ankhArtifact.rotation.y = -t * 1.4;
  setGod.ankhArtifact.rotation.z = -Math.sin(t * 1.5) * 0.06;

  // Lógica das Poses de Set
  if (mode === 'senhor') {
    setGod.rightArm.armRoot.rotation.set(0.15 + Math.sin(t * 2) * 0.04, 0.1, 0.42);
    setGod.rightArm.elbow.rotation.set(-0.25, 0, 0.2);
    setGod.leftArm.armRoot.rotation.set(0.15 + Math.cos(t * 2) * 0.04, -0.1, -0.42);
    setGod.leftArm.elbow.rotation.set(-0.25, 0, -0.2);
  } else if (mode === 'tempestade') {
    setGod.rightArm.armRoot.rotation.set(-0.6, 0.3, 0.95 + Math.sin(t * 5) * 0.1);
    setGod.rightArm.elbow.rotation.set(-0.65, 0.2, 0);
    setGod.leftArm.armRoot.rotation.set(-0.6, -0.3, -0.95 - Math.cos(t * 5) * 0.1);
    setGod.leftArm.elbow.rotation.set(-0.65, -0.2, 0);
  } else if (mode === 'deserto') {
    setGod.rightArm.armRoot.rotation.set(-1.3, 0.2, 0.25);
    setGod.rightArm.elbow.rotation.set(-0.15, 0, 0);
    setGod.leftArm.armRoot.rotation.set(0.4, -0.2, -0.6);
    setGod.leftArm.elbow.rotation.set(-0.4, 0, -0.3);
  } else if (mode === 'monstro') {
    setGod.rightArm.armRoot.rotation.set(-0.8, 0.4, 0.7);
    setGod.rightArm.elbow.rotation.set(-0.9, 0, 0.4);
    setGod.leftArm.armRoot.rotation.set(-0.8, -0.4, -0.7);
    setGod.leftArm.elbow.rotation.set(-0.9, 0, -0.4);
  }
}
