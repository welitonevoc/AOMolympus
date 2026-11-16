import * as THREE from 'three';

export interface TyphonTextures {
  skinBump: THREE.CanvasTexture;
  vortexTex: THREE.CanvasTexture;
  floorTex: THREE.CanvasTexture;
}

export function createTyphonTextures(): TyphonTextures {
  // 1. Bump map de pele titânica esculpida por ventos e relâmpagos
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 7500; i++) {
      const v = 116 + Math.floor(Math.random() * 24);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(5, 5);

  // 2. Textura de Nuvem de Tempestade em Espiral para o Furacão
  const vortexCanvas = document.createElement('canvas');
  vortexCanvas.width = vortexCanvas.height = 512;
  const vCtx = vortexCanvas.getContext('2d');
  if (vCtx) {
    vCtx.fillStyle = '#0f172a';
    vCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 160; i++) {
      const y = Math.random() * 512;
      vCtx.strokeStyle = i % 3 === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.28)';
      vCtx.lineWidth = 2 + Math.random() * 5;
      vCtx.beginPath();
      vCtx.moveTo(0, y);
      vCtx.bezierCurveTo(170, y + 24, 340, y - 24, 512, y);
      vCtx.stroke();
    }
  }
  const vortexTex = new THREE.CanvasTexture(vortexCanvas);
  vortexTex.wrapS = vortexTex.wrapT = THREE.RepeatWrapping;
  vortexTex.repeat.set(3, 2);

  // 3. Piso Celestial
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 512;
  const fCtx = floorCanvas.getContext('2d');
  if (fCtx) {
    fCtx.fillStyle = '#1e293b';
    fCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      fCtx.fillStyle = i % 2 === 0 ? 'rgba(51, 65, 85, 0.35)' : 'rgba(15, 23, 42, 0.55)';
      fCtx.fillRect(Math.random() * 512, Math.random() * 512, 6, 6);
    }
    const cx = 256, cy = 256;
    fCtx.strokeStyle = '#eab308';
    fCtx.lineWidth = 8;
    fCtx.beginPath();
    fCtx.arc(cx, cy, 212, 0, Math.PI * 2);
    fCtx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);

  return { skinBump, vortexTex, floorTex };
}

let _cachedTyphonTex: TyphonTextures | null = null;
export function getCachedTyphonTextures(): TyphonTextures {
  if (!_cachedTyphonTex) _cachedTyphonTex = createTyphonTextures();
  return _cachedTyphonTex;
}

function group(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

function sculpt(
  parent: THREE.Object3D | null,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  pos = [0, 0, 0],
  rot = [0, 0, 0],
  scale = [1, 1, 1]
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

export interface TyphonArm {
  arm: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Group;
  palmAnchor: THREE.Group;
  palmOrb: THREE.Mesh;
}

export interface TyphonTitan {
  titanRoot: THREE.Group;
  hurricaneGroup: THREE.Group;
  funnelMesh: THREE.Mesh;
  cycloneRings: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }>;
  waistSerpents: Array<{ root: THREE.Group; sHead: THREE.Group; side: number }>;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  beardSpikes: Array<{ mesh: THREE.Mesh; baseRx: number; phase: number }>;
  wings: {
    L?: { wingRoot: THREE.Group; innerWing: THREE.Group; outerWing: THREE.Group };
    R?: { wingRoot: THREE.Group; innerWing: THREE.Group; outerWing: THREE.Group };
  };
  rightArm: TyphonArm;
  leftArm: TyphonArm;
  veinBlue: THREE.MeshStandardMaterial;
  veinGold: THREE.MeshStandardMaterial;
}

export function buildTyphonTitan(textures: TyphonTextures): TyphonTitan {
  const stormSkin = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.44,
    metalness: 0.18,
    bumpMap: textures.skinBump,
    bumpScale: 0.0055,
  });

  const stormSkinDark = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    metalness: 0.16,
  });

  const lightningVein = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 3.4,
    roughness: 0.1,
  });

  const goldVein = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: new THREE.Color(0xfacc15),
    emissiveIntensity: 2.8,
    roughness: 0.12,
  });

  const celestialGold = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: new THREE.Color(0x451a03),
    emissiveIntensity: 0.28,
    metalness: 0.94,
    roughness: 0.18,
  });

  const stormBronze = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    emissive: new THREE.Color(0x0c1938),
    emissiveIntensity: 0.25,
    metalness: 0.9,
    roughness: 0.24,
  });

  const wingCloudPrimary = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: new THREE.Color(0x0f172a),
    emissiveIntensity: 0.3,
    roughness: 0.55,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });

  const wingLightningTip = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 1.8,
    roughness: 0.25,
    side: THREE.DoubleSide,
  });

  const eyeLightning = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 4.5,
    roughness: 0.05,
  });

  const vortexCloud = new THREE.MeshStandardMaterial({
    map: textures.vortexTex,
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0369a1),
    emissiveIntensity: 0.65,
    roughness: 0.45,
    transparent: true,
    opacity: 0.84,
    side: THREE.DoubleSide,
  });

  const serpentScale = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    emissive: new THREE.Color(0x0c4a6e),
    emissiveIntensity: 0.45,
    roughness: 0.35,
    metalness: 0.4,
  });

  const titanRoot = new THREE.Group();

  // A. Furacão e Tornado
  const hurricaneGroup = group(titanRoot, 0, 0, 0);

  const funnelGeo = new THREE.CylinderGeometry(1.15, 0.36, 1.85, 40, 20, true);
  const fPos = funnelGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const x = fPos.getX(i);
    const y = fPos.getY(i);
    const z = fPos.getZ(i);
    const normY = (y + 0.925) / 1.85;
    const ang = Math.atan2(z, x);
    const twist = Math.sin(ang * 4 + normY * 8.0) * 0.11 * (0.4 + normY * 0.6);
    const r = Math.sqrt(x * x + z * z) + twist;
    fPos.setXYZ(i, Math.cos(ang) * r, y, Math.sin(ang) * r);
  }
  funnelGeo.computeVertexNormals();
  const funnelMesh = new THREE.Mesh(funnelGeo, vortexCloud);
  funnelMesh.position.y = 0.925;
  hurricaneGroup.add(funnelMesh);

  const innerFunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.22, 1.8, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  innerFunnel.position.y = 0.92;
  hurricaneGroup.add(innerFunnel);

  const cycloneRings: Array<{ mesh: THREE.Mesh; baseY: number; phase: number }> = [];
  for (let r = 0; r < 5; r++) {
    const t = r / 4;
    const rad = 0.48 + t * 0.85;
    const cRing = new THREE.Mesh(
      new THREE.TorusGeometry(rad, 0.035, 8, 36),
      new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0x38bdf8 : 0xfde047,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    cRing.rotation.x = Math.PI / 2 + (r % 2 === 0 ? 0.14 : -0.14);
    cRing.position.y = 0.22 + t * 1.48;
    hurricaneGroup.add(cRing);
    cycloneRings.push({ mesh: cRing, baseY: cRing.position.y, phase: r * 1.3 });
  }

  // Serpentes da cintura
  const waistSerpents: Array<{ root: THREE.Group; sHead: THREE.Group; side: number }> = [];
  for (const side of [-1, 1]) {
    const serpRoot = group(hurricaneGroup, side * 0.72, 1.48, 0.22);
    const serpCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.35, -0.15),
      new THREE.Vector3(side * 0.35, 0.05, 0.12),
      new THREE.Vector3(side * 0.58, 0.42, 0.35),
      new THREE.Vector3(side * 0.42, 0.72, 0.58),
    ]);
    sculpt(serpRoot, new THREE.TubeGeometry(serpCurve, 20, 0.075, 10, false), serpentScale);
    const sHead = group(serpRoot, side * 0.42, 0.72, 0.58);
    sHead.rotation.set(0.35, side * -0.3, 0);
    sculpt(sHead, new THREE.ConeGeometry(0.11, 0.28, 6), serpentScale, [0, 0, 0.1], [Math.PI / 2, 0, 0], [1.1, 1, 0.65]);
    sculpt(sHead, new THREE.SphereGeometry(0.022, 8, 8), eyeLightning, [-0.05, 0.02, 0.14]);
    sculpt(sHead, new THREE.SphereGeometry(0.022, 8, 8), eyeLightning, [0.05, 0.02, 0.14]);
    waistSerpents.push({ root: serpRoot, sHead, side });
  }

  // B. Tronco Titânico
  const body = group(titanRoot, 0, 1.72, 0);
  body.scale.setScalar(1.35);

  const torso = group(body, 0, 0.48, 0);
  const torsoPts = [
    new THREE.Vector2(0.01, -0.45),
    new THREE.Vector2(0.32, -0.4),
    new THREE.Vector2(0.3, -0.2),
    new THREE.Vector2(0.39, 0.04),
    new THREE.Vector2(0.54, 0.29),
    new THREE.Vector2(0.47, 0.45),
    new THREE.Vector2(0.22, 0.52),
    new THREE.Vector2(0.01, 0.53),
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), stormSkin, [0, 0, 0], [0, 0, 0], [1.28, 1.04, 0.82]);

  const pecGeo = new THREE.SphereGeometry(0.27, 24, 24);
  sculpt(torso, pecGeo, stormSkin, [-0.235, 0.23, 0.195], [0.12, -0.22, -0.14], [1.1, 0.9, 0.64]);
  sculpt(torso, pecGeo, stormSkin, [0.235, 0.23, 0.195], [0.12, 0.22, 0.14], [1.1, 0.9, 0.64]);

  const boltVein1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.36, 0.14),
    new THREE.Vector3(-0.22, 0.25, 0.29),
    new THREE.Vector3(-0.08, 0.14, 0.31),
    new THREE.Vector3(-0.15, -0.04, 0.29),
  ]);
  sculpt(torso, new THREE.TubeGeometry(boltVein1, 16, 0.0095, 6, false), lightningVein);

  const boltVein2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.4, 0.36, 0.14),
    new THREE.Vector3(0.22, 0.25, 0.29),
    new THREE.Vector3(0.08, 0.14, 0.31),
    new THREE.Vector3(0.15, -0.04, 0.29),
  ]);
  sculpt(torso, new THREE.TubeGeometry(boltVein2, 16, 0.0095, 6, false), goldVein);

  // Cinturão de ouro
  const beltGeo = new THREE.TorusGeometry(0.34, 0.042, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(torso, beltGeo, celestialGold, [0, -0.38, 0.01], [0.04, 0, 0], [1.18, 1, 0.88]);

  // C. Asas Gigantes de Tempestade
  const wings: TyphonTitan['wings'] = {};
  for (const side of ['L', 'R'] as const) {
    const s = side === 'R' ? 1 : -1;
    const wingRoot = group(torso, s * 0.24, 0.34, -0.22);
    const innerWing = group(wingRoot, 0, 0, 0);
    sculpt(innerWing, new THREE.CylinderGeometry(0.055, 0.042, 0.85, 12), celestialGold, [s * 0.38, 0.22, -0.05], [0, 0, s * -1.08]);

    for (let f = 0; f < 7; f++) {
      const t = f / 6;
      const len = 0.72 + t * 0.42;
      sculpt(
        innerWing,
        new THREE.ConeGeometry(0.095, len, 6),
        f % 3 === 0 ? wingLightningTip : wingCloudPrimary,
        [s * (0.18 + t * 0.56), 0.16 + t * 0.22 - len * 0.42, -0.08],
        [0.12, 0, s * (-0.15 - t * 0.15)],
        [1.1, 1, 0.22]
      );
    }

    const outerWing = group(innerWing, s * 0.76, 0.42, -0.06);
    sculpt(outerWing, new THREE.CylinderGeometry(0.042, 0.018, 1.05, 12), celestialGold, [s * 0.48, -0.08, -0.04], [0, 0, s * -1.72]);

    for (let p = 0; p < 8; p++) {
      const t = p / 7;
      const len = 1.25 - t * 0.28;
      sculpt(
        outerWing,
        new THREE.ConeGeometry(0.105, len, 6),
        p % 2 === 0 ? wingLightningTip : wingCloudPrimary,
        [s * (0.12 + t * 0.82), -0.04 - t * 0.14 - len * 0.44, -0.06],
        [0.15, 0, s * (-0.38 - t * 0.48)],
        [1.15, 1, 0.2]
      );
    }

    wings[side] = { wingRoot, innerWing, outerWing };
  }

  // D. Cabeça Colossal
  const head = group(torso, 0, 0.78, 0.04);
  const skullGeo = new THREE.SphereGeometry(0.23, 36, 36);
  sculpt(head, skullGeo, stormSkin);

  for (const side of [-1, 1]) {
    sculpt(head, new THREE.SphereGeometry(0.024, 16, 16), eyeLightning, [side * 0.06, 0.024, 0.202], [0, 0, 0], [1.2, 0.68, 0.85]);
  }

  const beardSpikes: Array<{ mesh: THREE.Mesh; baseRx: number; phase: number }> = [];
  for (let b = -2; b <= 2; b++) {
    const len = 0.34 - Math.abs(b) * 0.04;
    const spike = sculpt(
      head,
      new THREE.ConeGeometry(0.048, len, 6),
      b === 0 ? wingLightningTip : stormSkinDark,
      [b * 0.045, -0.16 - (2 - Math.abs(b)) * 0.02, 0.19 - Math.abs(b) * 0.02],
      [Math.PI - 0.14, 0, b * 0.08],
      [1, 1, 0.65]
    );
    beardSpikes.push({ mesh: spike, baseRx: Math.PI - 0.14, phase: b * 0.8 });
  }

  const crown = group(head, 0, 0.14, 0);
  const band = new THREE.TorusGeometry(0.22, 0.02, 10, 36);
  band.rotateX(Math.PI / 2);
  sculpt(crown, band, celestialGold, [0, 0, 0], [0.12, 0, 0], [0.96, 1, 1.06]);

  for (const side of [-1, 1]) {
    const hornPts = [
      new THREE.Vector3(side * 0.2, 0.02, 0.02),
      new THREE.Vector3(side * 0.34, 0.16, -0.04),
      new THREE.Vector3(side * 0.38, 0.38, -0.1),
      new THREE.Vector3(side * 0.26, 0.56, -0.06),
    ];
    sculpt(crown, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hornPts), 18, 0.032, 10, false), celestialGold);
    sculpt(crown, new THREE.ConeGeometry(0.032, 0.12, 8), lightningVein, [side * 0.24, 0.6, -0.05], [0.2, 0, side * 0.45]);
  }

  // E. Braços
  function createTyphonArm(isRight: boolean): TyphonArm {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.58, 0.35, -0.01);

    sculpt(
      arm,
      new THREE.SphereGeometry(0.22, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.48),
      celestialGold,
      [s * 0.02, 0.04, 0],
      [0, 0, s * -0.35],
      [1.15, 0.78, 1.18]
    );
    sculpt(arm, new THREE.SphereGeometry(0.19, 20, 20), stormSkin, [0, -0.02, 0], [0, 0, s * -0.25], [1.08, 1.18, 1.08]);
    sculpt(arm, new THREE.CapsuleGeometry(0.125, 0.3, 12, 18), stormSkin, [s * 0.03, -0.2, 0], [0, 0, s * 0.08]);

    const elbow = group(arm, s * 0.054, -0.4, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.118, 0.08, 0.36, 18), stormSkin, [0, -0.17, 0]);

    const bracer = group(elbow, 0, -0.25, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.094, 0.082, 0.14, 24, 1, true), stormBronze);

    const hand = group(elbow, 0, -0.37, 0);
    sculpt(hand, new THREE.BoxGeometry(0.105, 0.11, 0.055), stormSkin, [0, -0.02, 0]);

    const palmAnchor = group(hand, 0, -0.1, 0.06);
    const palmOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 14, 12),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    palmAnchor.add(palmOrb);

    return { arm, elbow, hand, palmAnchor, palmOrb };
  }

  const rightArm = createTyphonArm(true);
  const leftArm = createTyphonArm(false);

  return {
    titanRoot,
    hurricaneGroup,
    funnelMesh,
    cycloneRings,
    waistSerpents,
    body,
    torso,
    head,
    beardSpikes,
    wings,
    rightArm,
    leftArm,
    veinBlue: lightningVein,
    veinGold: goldVein,
  };
}
