import * as THREE from 'three';

export interface IsisTextures {
  skinBump: THREE.CanvasTexture;
  floorTex?: THREE.CanvasTexture;
}

export type IsisMode = 'majestade' | 'heka' | 'ankh' | 'sopdet';

export interface IsisModel {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Group;
  legs: {
    L: { hip: THREE.Group; ankle: THREE.Group };
    R: { hip: THREE.Group; ankle: THREE.Group };
  };
  rightArm: {
    armRoot: THREE.Group;
    elbow: THREE.Group;
    hand: THREE.Group;
    wingPivot: THREE.Group;
  };
  leftArm: {
    armRoot: THREE.Group;
    elbow: THREE.Group;
    hand: THREE.Group;
    wingPivot: THREE.Group;
  };
  wings: {
    L: THREE.Group;
    R: THREE.Group;
  };
  staff: THREE.Group;
  magicNode: THREE.Group;
  crown: THREE.Group;
  tyetSymbol: THREE.Group;
  ankhAura: THREE.Mesh;
  materials: {
    obsidianSkin: THREE.MeshStandardMaterial;
    pureGold: THREE.MeshStandardMaterial;
    darkGold: THREE.MeshStandardMaterial;
    lapisBlue: THREE.MeshStandardMaterial;
    magicCyan: THREE.MeshStandardMaterial;
    magicGreen: THREE.MeshStandardMaterial;
    waterMagic: THREE.MeshBasicMaterial;
    dressMaterial: THREE.MeshStandardMaterial;
  };
}

let cachedIsisTextures: IsisTextures | null = null;

export function getCachedIsisTextures(): IsisTextures {
  if (cachedIsisTextures) return cachedIsisTextures;

  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      const v = 125 + Math.floor(Math.random() * 6);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#1c1917';
    fCtx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 4000; i++) {
      fCtx.fillStyle = i % 2 === 0 ? 'rgba(41, 37, 36, 0.4)' : 'rgba(68, 64, 60, 0.2)';
      fCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 8, 8);
    }

    fCtx.strokeStyle = '#eab308';
    fCtx.lineWidth = 14;
    fCtx.beginPath();
    fCtx.arc(512, 512, 420, 0, Math.PI * 2);
    fCtx.stroke();
    fCtx.strokeStyle = '#0284c7';
    fCtx.lineWidth = 6;
    fCtx.beginPath();
    fCtx.arc(512, 512, 440, 0, Math.PI * 2);
    fCtx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);

  cachedIsisTextures = { skinBump, floorTex };
  return cachedIsisTextures;
}

function group(parent: THREE.Object3D, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D,
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
  parent.add(m);
  return m;
}

function buildVolumetricWing(
  parent: THREE.Group,
  isRight: boolean,
  M: IsisModel['materials']
): THREE.Group {
  const wingPivot = group(parent, 0, 0, -0.04);

  if (isRight) {
    wingPivot.rotation.z = -Math.PI / 2;
  } else {
    wingPivot.rotation.z = -Math.PI / 2;
    wingPivot.scale.x = -1;
  }

  // 3 Camadas de Penas: Coberteiras (Ouro), Secundárias (Lápis-lazúli), Primárias (Obsidiana/Borda Ouro)
  const layers = [
    { r: 0.15, len: 0.35, count: 18, mat: M.pureGold, zOffset: 0.02 },
    { r: 0.35, len: 0.7, count: 26, mat: M.lapisBlue, zOffset: 0.0 },
    { r: 0.65, len: 1.15, count: 34, mat: M.obsidianSkin, edge: M.pureGold, zOffset: -0.02 },
  ];

  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      const a = (i / (layer.count - 1)) * (Math.PI * 0.58);
      const px = Math.cos(a) * layer.r;
      const py = Math.sin(a) * layer.r;

      const featherGroup = group(wingPivot, px, py, layer.zOffset);
      featherGroup.rotation.z = a + Math.PI / 2;

      const featherGeo = new THREE.CylinderGeometry(0.008, 0.035, layer.len, 5);
      sculpt(featherGroup, featherGeo, layer.mat, [0, layer.len / 2, 0], [0, 0, 0], [1, 1, 0.15]);

      if (layer.edge) {
        const edgeGeo = new THREE.CylinderGeometry(0.012, 0.042, layer.len * 1.02, 3);
        sculpt(featherGroup, edgeGeo, layer.edge, [0, layer.len / 2, -0.005], [0, 0, 0], [1, 1, 0.1]);
      }
    }
  });

  return wingPivot;
}

function buildTyet(M: IsisModel['materials']): THREE.Group {
  const tyet = new THREE.Group();
  sculpt(tyet, new THREE.TorusGeometry(0.25, 0.06, 12, 24), M.magicCyan, [0, 0.35, 0]);
  sculpt(tyet, new THREE.BoxGeometry(0.75, 0.12, 0.1), M.magicCyan, [0, 0.1, 0]);
  sculpt(tyet, new THREE.BoxGeometry(0.12, 0.65, 0.1), M.magicCyan, [0, -0.28, 0]);
  sculpt(tyet, new THREE.CylinderGeometry(0.05, 0.05, 0.5), M.magicCyan, [0.25, -0.2, 0], [0, 0, 0.25]);
  sculpt(tyet, new THREE.CylinderGeometry(0.05, 0.05, 0.5), M.magicCyan, [-0.25, -0.2, 0], [0, 0, -0.25]);
  return tyet;
}

export function buildAnkh(M: IsisModel['materials']): THREE.Group {
  const ankh = new THREE.Group();
  sculpt(ankh, new THREE.TorusGeometry(0.06, 0.015, 8, 16), M.magicGreen, [0, 0.1, 0]);
  sculpt(ankh, new THREE.BoxGeometry(0.18, 0.03, 0.03), M.magicGreen, [0, 0.02, 0]);
  sculpt(ankh, new THREE.BoxGeometry(0.03, 0.15, 0.03), M.magicGreen, [0, -0.07, 0]);
  return ankh;
}

export function buildIsis(tex?: IsisTextures): IsisModel {
  const textures = tex || getCachedIsisTextures();

  const M = {
    obsidianSkin: new THREE.MeshStandardMaterial({
      color: 0x09090b,
      emissive: 0x050505,
      roughness: 0.18,
      metalness: 0.65,
      bumpMap: textures.skinBump,
      bumpScale: 0.002,
    }),
    pureGold: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x451a03,
      emissiveIntensity: 0.35,
      metalness: 1.0,
      roughness: 0.12,
    }),
    darkGold: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.9,
      roughness: 0.25,
    }),
    lapisBlue: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2,
      metalness: 0.4,
      roughness: 0.3,
    }),
    magicCyan: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x2dd4bf,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    }),
    magicGreen: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x10b981,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    }),
    waterMagic: new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    dressMaterial: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    }),
  };

  const root = new THREE.Group();
  const body = group(root, 0, 1.15, 0);

  // Pelve, Pernas e Vestido
  const pelvis = group(body, 0, 0.92, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.21, 24, 20), M.dressMaterial, [0, 0, 0], [0, 0, 0], [1.05, 0.75, 0.8]);

  const legs = {
    L: { hip: group(pelvis), ankle: group(pelvis) },
    R: { hip: group(pelvis), ankle: group(pelvis) },
  };

  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.11, -0.04, 0);
    sculpt(hip, new THREE.CylinderGeometry(0.12, 0.08, 0.52, 20), M.obsidianSkin, [0, -0.25, 0], [0, 0, 0], [1.0, 1, 1.05]);
    sculpt(hip, new THREE.SphereGeometry(0.08, 16, 16), M.obsidianSkin, [0, -0.5, 0.01]);

    const ankle = group(hip, 0, -0.51, 0);
    sculpt(ankle, new THREE.BoxGeometry(0.075, 0.04, 0.19), M.obsidianSkin, [0, -0.02, 0.035], [0.15, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.08, 0.012, 0.2), M.pureGold, [0, -0.04, 0.035], [0.15, 0, 0]);
    const strap = new THREE.TorusGeometry(0.05, 0.006, 8, 20);
    strap.rotateX(Math.PI / 2);
    sculpt(ankle, strap, M.pureGold, [0, 0.02, -0.02], [0.1, 0, 0]);
    sculpt(ankle, strap, M.pureGold, [0, 0.06, -0.02], [0.1, 0, 0]);
    legs[side] = { hip, ankle };
  }

  legs.L.hip.rotation.set(-0.15, -0.08, -0.02);
  legs.R.hip.rotation.set(0.1, 0.08, 0.02);

  sculpt(pelvis, new THREE.CylinderGeometry(0.205, 0.24, 0.95, 36, 1, true), M.dressMaterial, [0, -0.45, 0]);
  sculpt(pelvis, new THREE.BoxGeometry(0.12, 0.65, 0.02), M.pureGold, [0, -0.3, 0.18], [0.05, 0, 0]);

  const belt = new THREE.TorusGeometry(0.21, 0.025, 12, 36);
  belt.rotateX(Math.PI / 2);
  sculpt(pelvis, belt, M.pureGold, [0, 0.02, 0]);

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
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.obsidianSkin, [0, 0, 0], [0, 0, 0], [1.1, 1.0, 0.75]);

  for (let c = 0; c < 6; c++) {
    const colMat = c % 2 === 0 ? M.pureGold : M.lapisBlue;
    const usekh = new THREE.TorusGeometry(0.14 + c * 0.028, 0.015, 8, 36, Math.PI);
    usekh.rotateX(Math.PI / 2);
    sculpt(torso, usekh, colMat, [0, 0.38 - c * 0.025, 0.02 + c * 0.005], [0.2, 0, 0], [1.1, 1, 0.85]);
  }

  const chestBird = group(torso, 0, 0.05, 0.19);
  chestBird.rotation.x = -0.1;
  sculpt(chestBird, new THREE.SphereGeometry(0.04, 12, 12), M.pureGold);
  sculpt(chestBird, new THREE.ConeGeometry(0.08, 0.25, 4), M.pureGold, [0, -0.05, 0], [0, 0, 0], [1, 1, 0.2]);
  for (const side of [-1, 1]) {
    sculpt(
      chestBird,
      new THREE.ConeGeometry(0.05, 0.25, 4),
      M.pureGold,
      [side * 0.12, 0.05, 0],
      [0, 0, side * -1.2],
      [1, 1, 0.2]
    );
  }

  sculpt(torso, new THREE.CylinderGeometry(0.09, 0.11, 0.25, 20), M.obsidianSkin, [0, 0.51, -0.005], [0.05, 0, 0]);

  // Cabeça
  const head = group(torso, 0, 0.72, 0.025);
  sculpt(head, new THREE.SphereGeometry(0.17, 36, 36), M.obsidianSkin, [0, 0, 0], [0, 0, 0], [0.92, 1.15, 0.95]);

  sculpt(head, new THREE.BoxGeometry(0.015, 0.06, 0.03), M.obsidianSkin, [0, 0.005, 0.165], [-0.15, 0, 0]);
  sculpt(head, new THREE.SphereGeometry(0.012, 12, 12), M.obsidianSkin, [0, -0.025, 0.175], [0, 0, 0], [1, 0.8, 1]);
  sculpt(head, new THREE.SphereGeometry(0.018, 16, 16), M.pureGold, [-0.045, 0.02, 0.155], [0, 0, 0], [1.1, 0.75, 0.8]);
  sculpt(head, new THREE.SphereGeometry(0.018, 16, 16), M.pureGold, [0.045, 0.02, 0.155], [0, 0, 0], [1.1, 0.75, 0.8]);

  sculpt(head, new THREE.SphereGeometry(0.18, 24, 24), M.darkGold, [0, 0.04, -0.02], [-0.05, 0, 0], [1.02, 1.05, 1.05]);
  for (const side of [-1, 1]) {
    const hairLock = sculpt(
      head,
      new THREE.BoxGeometry(0.08, 0.38, 0.09),
      M.darkGold,
      [side * 0.14, -0.1, 0.03],
      [0.1, 0, side * -0.15]
    );
    for (let i = 0; i < 4; i++) {
      sculpt(hairLock, new THREE.BoxGeometry(0.085, 0.02, 0.095), M.pureGold, [0, 0.1 - i * 0.06, 0]);
    }
  }

  // Coroa Hathórica
  const crown = group(head, 0, 0.22, 0);
  sculpt(crown, new THREE.CylinderGeometry(0.15, 0.16, 0.06, 24), M.pureGold, [0, -0.02, 0]);
  sculpt(crown, new THREE.ConeGeometry(0.03, 0.1, 4), M.pureGold, [0, 0.02, 0.15], [Math.PI / 2, 0, 0]);

  const sunDisk = sculpt(
    crown,
    new THREE.SphereGeometry(0.16, 24, 24),
    M.pureGold,
    [0, 0.22, 0],
    [0, 0, 0],
    [1, 1, 0.4]
  );
  const diskAura = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    })
  );
  sunDisk.add(diskAura);

  for (const side of [-1, 1]) {
    const hornCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.08, 0, 0),
      new THREE.Vector3(side * 0.25, 0.15, 0),
      new THREE.Vector3(side * 0.22, 0.38, 0),
    ]);
    sculpt(crown, new THREE.TubeGeometry(hornCurve, 16, 0.028, 8, false), M.pureGold);
  }

  // Braços e Asas Volumétricas
  function createIsisArmAndWing(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const armRoot = group(torso, s * 0.35, 0.32, -0.01);

    sculpt(armRoot, new THREE.SphereGeometry(0.1, 16, 16), M.obsidianSkin, [0, 0, 0], [0, 0, s * -0.2]);
    sculpt(armRoot, new THREE.CapsuleGeometry(0.06, 0.24, 12, 16), M.obsidianSkin, [s * 0.015, -0.16, 0], [0, 0, s * 0.05]);
    sculpt(armRoot, new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16), M.pureGold, [s * 0.015, -0.16, 0], [0, 0, s * 0.05]);

    const elbow = group(armRoot, s * 0.03, -0.32, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.055, 0.04, 0.28, 16), M.obsidianSkin, [0, -0.14, 0]);
    sculpt(elbow, new THREE.CylinderGeometry(0.06, 0.055, 0.12, 20, 1, true), M.pureGold, [0, -0.14, 0]);

    const hand = group(elbow, 0, -0.28, 0);
    sculpt(hand, new THREE.BoxGeometry(0.05, 0.06, 0.025), M.obsidianSkin, [0, -0.01, 0]);

    const wingPivot = buildVolumetricWing(armRoot, isRight, M);
    return { armRoot, elbow, hand, wingPivot };
  }

  const rightArm = createIsisArmAndWing(true);
  const leftArm = createIsisArmAndWing(false);
  const wings = { R: rightArm.wingPivot, L: leftArm.wingPivot };

  // Cetro de Lótus
  const staff = group(rightArm.hand, 0, -0.03, 0.03);
  sculpt(staff, new THREE.CylinderGeometry(0.015, 0.015, 2.2, 12), M.pureGold, [0, 0.1, 0]);
  const lotus = group(staff, 0, 1.25, 0);
  sculpt(lotus, new THREE.ConeGeometry(0.06, 0.15, 6), M.lapisBlue, [0, 0, 0], [Math.PI, 0, 0]);

  const magicNode = group(staff, 0, 1.3, 0);

  // Elementos Mágicos Escondidos no Torso
  const tyetSymbol = buildTyet(M);
  tyetSymbol.position.set(0, 0.2, -0.35);
  tyetSymbol.scale.setScalar(0.01);
  torso.add(tyetSymbol);

  const ankhAura = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  body.add(ankhAura);

  return {
    root,
    body,
    torso,
    legs,
    rightArm,
    leftArm,
    wings,
    staff,
    magicNode,
    crown,
    tyetSymbol,
    ankhAura,
    materials: M,
  };
}

export function animateIsis(isis: IsisModel, dt: number, t: number, mode: IsisMode = 'majestade') {
  const hoverY = Math.sin(t * 1.5) * 0.1;
  isis.body.position.y = 1.15 + hoverY;
  isis.crown.rotation.y = Math.sin(t) * 0.05;

  if (mode === 'majestade') {
    isis.rightArm.armRoot.rotation.set(-0.2, 0.2, 1.35 + Math.sin(t * 2) * 0.05);
    isis.rightArm.elbow.rotation.set(0, 0, 0.6);
    isis.leftArm.armRoot.rotation.set(-0.2, -0.2, -1.35 - Math.cos(t * 2) * 0.05);
    isis.leftArm.elbow.rotation.set(0, 0, -0.6);
  } else if (mode === 'heka') {
    isis.rightArm.armRoot.rotation.set(-1.2, 0.2, 0.3);
    isis.rightArm.elbow.rotation.set(0, 0, 0);
    isis.leftArm.armRoot.rotation.set(-0.2, -0.2, -1.6);
    isis.leftArm.elbow.rotation.set(0, 0, -0.2);
  } else if (mode === 'sopdet') {
    isis.rightArm.armRoot.rotation.set(-0.5, 0.1, 2.4 + Math.sin(t * 3) * 0.05);
    isis.rightArm.elbow.rotation.set(0, 0, 0.2);
    isis.leftArm.armRoot.rotation.set(-0.5, -0.1, -2.4 - Math.cos(t * 3) * 0.05);
    isis.leftArm.elbow.rotation.set(0, 0, -0.2);
  } else if (mode === 'ankh') {
    isis.rightArm.armRoot.rotation.set(-0.8, -0.6, 0.3);
    isis.rightArm.elbow.rotation.set(-1.5, 0, 0);
    isis.leftArm.armRoot.rotation.set(-0.8, 0.6, -0.3);
    isis.leftArm.elbow.rotation.set(-1.5, 0, 0);
  }

  // Tyet Magic Pulse
  if (mode === 'heka') {
    isis.tyetSymbol.scale.setScalar(1.5 + Math.sin(t * 4) * 0.2);
    isis.tyetSymbol.rotation.y += dt * 2;
  } else {
    isis.tyetSymbol.scale.setScalar(0.01);
  }

  // Ankh Aura Pulse
  if (mode === 'ankh') {
    (isis.ankhAura.material as THREE.Material).opacity = 0.35 + Math.sin(t * 4) * 0.15;
    isis.ankhAura.scale.setScalar(1 + Math.sin(t * 5) * 0.05);
  } else {
    (isis.ankhAura.material as THREE.Material).opacity = 0;
  }
}
