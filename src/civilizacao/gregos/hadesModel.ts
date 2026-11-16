import * as THREE from 'three';

export interface HadesProceduralTextures {
  skinBump: THREE.CanvasTexture;
  tunicTex: THREE.CanvasTexture;
  obsidianTex: THREE.CanvasTexture;
  smokeTex: THREE.CanvasTexture;
}

export interface HadesMaterials {
  skinAsh: THREE.MeshStandardMaterial;
  skinShade: THREE.MeshStandardMaterial;
  necroticVein: THREE.MeshStandardMaterial;
  tartarusVein: THREE.MeshStandardMaterial;
  hairObsidian: THREE.MeshStandardMaterial;
  hairAshStreak: THREE.MeshStandardMaterial;
  blackIron: THREE.MeshStandardMaterial;
  tarnishedGold: THREE.MeshStandardMaterial;
  boneSkull: THREE.MeshStandardMaterial;
  soulCore: THREE.MeshStandardMaterial;
  tunic: THREE.MeshStandardMaterial;
  shadowCloak: THREE.MeshStandardMaterial;
  eyeSpectral: THREE.MeshStandardMaterial;
  shadowVortex: THREE.MeshStandardMaterial;
}

export interface HadesMeshHierarchy {
  vessel: THREE.Group;
  shadowBaseGroup: THREE.Group;
  shadowCone: THREE.Mesh;
  groundAuraRing: THREE.Mesh;
  orbitingWisps: Array<{
    mesh: THREE.Mesh;
    radius: number;
    height: number;
    speed: number;
    phase: number;
  }>;
  body: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  beardTip: THREE.Mesh;
  legs: Record<string, { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group }>;
  rightArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftArm: { arm: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  bident: THREE.Group;
  bidentHead: THREE.Group;
  soulOrb: THREE.Mesh;
  soulRing1: THREE.Mesh;
  soulRing2: THREE.Mesh;
  bidentAnchor: THREE.Group;
  bidentGlow: THREE.Mesh;
  hairStrands: Array<{ mesh: THREE.Mesh; phase: number }>;
  skirtMesh: THREE.Mesh;
  skirtBase: Float32Array;
  cape: THREE.Mesh;
  capeBase: Float32Array;
}

/* ==========================================================================
   1. TEXTURAS PROCEDURAIS PBR (PELE DE CINZA PÁLIDA, OBSIDIANA E VESTES)
   ========================================================================== */
export function createHadesProceduralTextures(): HadesProceduralTextures {
  // 1.1 Bump map de pele marmórea/cinzenta
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = skinCanvas.height = 256;
  const sCtx = skinCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#808080';
    sCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6500; i++) {
      const v = 122 + Math.floor(Math.random() * 14);
      sCtx.fillStyle = `rgb(${v},${v},${v})`;
      sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
  }
  const skinBump = new THREE.CanvasTexture(skinCanvas);
  skinBump.wrapS = skinBump.wrapT = THREE.RepeatWrapping;
  skinBump.repeat.set(4, 4);

  // 1.2 Túnica Real do Submundo (obsidiana e carmesim profundo com borda de bronze e runas)
  const tunicCanvas = document.createElement('canvas');
  tunicCanvas.width = 512;
  tunicCanvas.height = 256;
  const tCtx = tunicCanvas.getContext('2d');
  if (tCtx) {
    const grad = tCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.55, '#181024');
    grad.addColorStop(1, '#3b0718');
    tCtx.fillStyle = grad;
    tCtx.fillRect(0, 0, 512, 256);

    // Textura de trama sombria
    tCtx.strokeStyle = 'rgba(147, 51, 234, 0.14)';
    tCtx.lineWidth = 2;
    for (let y = 12; y < 200; y += 20) {
      tCtx.beginPath();
      tCtx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) {
        tCtx.lineTo(x + 16, y + 6);
        tCtx.lineTo(x + 32, y);
      }
      tCtx.stroke();
    }

    // Barra ornamentada de bronze envelhecido e runas necromânticas verdes
    tCtx.fillStyle = '#78350f';
    tCtx.fillRect(0, 204, 512, 36);
    tCtx.fillStyle = '#050508';
    tCtx.fillRect(0, 202, 512, 3);
    tCtx.fillRect(0, 240, 512, 3);
    for (let x = 0; x < 512; x += 32) {
      tCtx.strokeStyle = '#10b981';
      tCtx.lineWidth = 2.5;
      tCtx.beginPath();
      tCtx.moveTo(x + 16, 209);
      tCtx.lineTo(x + 25, 222);
      tCtx.lineTo(x + 16, 235);
      tCtx.lineTo(x + 7, 222);
      tCtx.closePath();
      tCtx.stroke();
    }
  }
  const tunicTex = new THREE.CanvasTexture(tunicCanvas);
  tunicTex.wrapS = tunicTex.wrapT = THREE.RepeatWrapping;

  // 1.3 Chão e Pilares de Obsidiana e Basalto Rachado com veios de energia
  const obsCanvas = document.createElement('canvas');
  obsCanvas.width = obsCanvas.height = 512;
  const oCtx = obsCanvas.getContext('2d');
  if (oCtx) {
    oCtx.fillStyle = '#0b0c12';
    oCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2400; i++) {
      oCtx.fillStyle = i % 2 === 0 ? 'rgba(30, 32, 48, 0.25)' : 'rgba(2, 2, 5, 0.45)';
      oCtx.fillRect(Math.random() * 512, Math.random() * 512, 8, 8);
    }
    // Fissuras arcanas brilhando sutilmente
    for (let i = 0; i < 24; i++) {
      oCtx.strokeStyle = i % 3 === 0 ? 'rgba(16, 185, 129, 0.28)' : 'rgba(126, 34, 206, 0.24)';
      oCtx.lineWidth = 1.8;
      oCtx.beginPath();
      let cx = Math.random() * 512, cy = Math.random() * 512;
      oCtx.moveTo(cx, cy);
      for (let s = 0; s < 6; s++) {
        cx += (Math.random() - 0.5) * 70;
        cy += (Math.random() - 0.5) * 70;
        oCtx.lineTo(cx, cy);
      }
      oCtx.stroke();
    }
  }
  const obsidianTex = new THREE.CanvasTexture(obsCanvas);
  obsidianTex.wrapS = obsidianTex.wrapT = THREE.RepeatWrapping;
  obsidianTex.repeat.set(3, 3);

  // 1.4 Textura procedural de névoa/fumaça sombria
  const smokeCanvas = document.createElement('canvas');
  smokeCanvas.width = smokeCanvas.height = 256;
  const smCtx = smokeCanvas.getContext('2d');
  if (smCtx) {
    smCtx.fillStyle = '#07070c';
    smCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 750; i++) {
      const r = 6 + Math.random() * 24;
      const grd = smCtx.createRadialGradient(
        Math.random() * 256, Math.random() * 256, 1,
        Math.random() * 256, Math.random() * 256, r
      );
      grd.addColorStop(0, i % 4 === 0 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(88, 28, 135, 0.22)');
      grd.addColorStop(1, 'rgba(5, 5, 8, 0)');
      smCtx.fillStyle = grd;
      smCtx.fillRect(0, 0, 256, 256);
    }
  }
  const smokeTex = new THREE.CanvasTexture(smokeCanvas);
  smokeTex.wrapS = smokeTex.wrapT = THREE.RepeatWrapping;
  smokeTex.repeat.set(2, 2);

  return { skinBump, tunicTex, obsidianTex, smokeTex };
}

/* ==========================================================================
   2. HELPERS DE GEOMETRIA E MATERIAIS DO SUBMUNDO
   ========================================================================== */
function group(parent?: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
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

export function createHadesMaterials(textures: HadesProceduralTextures): HadesMaterials {
  return {
    skinAsh: new THREE.MeshStandardMaterial({
      color: 0x8b95a5,          // Pele pálida de cinza e mármore frio
      roughness: 0.42,
      metalness: 0.12,
      bumpMap: textures.skinBump,
      bumpScale: 0.004
    }),
    skinShade: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.46,
      metalness: 0.12,
      bumpMap: textures.skinBump,
      bumpScale: 0.004
    }),
    necroticVein: new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: new THREE.Color(0x059669),
      emissiveIntensity: 2.3,
      roughness: 0.2
    }),
    tartarusVein: new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: new THREE.Color(0x7e22ce),
      emissiveIntensity: 2.1,
      roughness: 0.2
    }),
    hairObsidian: new THREE.MeshStandardMaterial({
      color: 0x0f111a,
      roughness: 0.45,
      metalness: 0.18
    }),
    hairAshStreak: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.44,
      metalness: 0.2
    }),
    blackIron: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      emissive: new THREE.Color(0x09090b),
      metalness: 0.92,
      roughness: 0.26
    }),
    tarnishedGold: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: new THREE.Color(0x291202),
      emissiveIntensity: 0.25,
      metalness: 0.88,
      roughness: 0.28
    }),
    boneSkull: new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.55,
      metalness: 0.08
    }),
    soulCore: new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 3.2,
      roughness: 0.1
    }),
    tunic: new THREE.MeshStandardMaterial({
      map: textures.tunicTex,
      color: 0xffffff,
      roughness: 0.62,
      metalness: 0.1,
      side: THREE.DoubleSide
    }),
    shadowCloak: new THREE.MeshStandardMaterial({
      color: 0x09070e,
      emissive: new THREE.Color(0x1e0826),
      emissiveIntensity: 0.35,
      roughness: 0.65,
      metalness: 0.15,
      side: THREE.DoubleSide
    }),
    eyeSpectral: new THREE.MeshStandardMaterial({
      color: 0xa7f3d0,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 3.8,
      roughness: 0.05
    }),
    shadowVortex: new THREE.MeshStandardMaterial({
      map: textures.smokeTex,
      color: 0x1e1b4b,
      emissive: new THREE.Color(0x3b0764),
      emissiveIntensity: 0.7,
      roughness: 0.85,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide
    })
  };
}

/* ==========================================================================
   3. CONSTRUÇÃO DE HADES + VÓRTICE DE SOMBRAS + BIDENTE REAL DO SUBMUNDO
   ========================================================================== */
export function buildHades(textures: HadesProceduralTextures): HadesMeshHierarchy {
  const M = createHadesMaterials(textures);

  // Grupo raiz deslizando sobre o chão de obsidiana (y = 0)
  const vessel = new THREE.Group();

  // ------------------------------------------------------------------------
  // A. VÓRTICE DE FUMAÇA SOMBRIA E ALMAS ORBITANTES SOB OS PÉS
  // ------------------------------------------------------------------------
  const shadowBaseGroup = group(vessel, 0, 0, 0);

  // Cone invertido / coluna espiralada de fumaça sombria que sustenta Hades
  const smokeGeo = new THREE.CylinderGeometry(0.42, 1.05, 1.25, 36, 16, true);
  const smPos = smokeGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < smPos.count; i++) {
    const x = smPos.getX(i), y = smPos.getY(i), z = smPos.getZ(i);
    const normY = (y + 0.625) / 1.25;
    const ang = Math.atan2(z, x);
    const swirl = Math.sin(ang * 5 - normY * 6.5) * 0.08 * (1 - normY * 0.35);
    const r = Math.sqrt(x * x + z * z) + swirl;
    smPos.setXYZ(i, Math.cos(ang) * r, y, Math.sin(ang) * r);
  }
  smokeGeo.computeVertexNormals();
  const shadowCone = new THREE.Mesh(smokeGeo, M.shadowVortex);
  shadowCone.position.y = 0.58;
  shadowBaseGroup.add(shadowCone);

  // Aura necromântica interna verde-violeta
  const innerMist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.72, 1.15, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  innerMist.position.y = 0.55;
  shadowBaseGroup.add(innerMist);

  // Anel rúnico espectral na base do solo
  const groundAuraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 1.18, 48),
    new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  groundAuraRing.rotation.x = -Math.PI / 2;
  groundAuraRing.position.y = 0.03;
  shadowBaseGroup.add(groundAuraRing);

  // Espíritos / Orbes de Almas orbitando ao redor de Hades
  const orbitingWisps: Array<{
    mesh: THREE.Mesh;
    radius: number;
    height: number;
    speed: number;
    phase: number;
  }> = [];
  for (let i = 0; i < 6; i++) {
    const wisp = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x34d399 : 0xc084fc,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    shadowBaseGroup.add(wisp);
    orbitingWisps.push({
      mesh: wisp,
      radius: 0.75 + (i % 3) * 0.22,
      height: 0.35 + i * 0.36,
      speed: (i % 2 === 0 ? 1.8 : -1.5),
      phase: (i / 6) * Math.PI * 2
    });
  }

  // ------------------------------------------------------------------------
  // B. CORPO ESGUIO, IMPONENTE E ESCULPIDO DE HADES (y = 1.12)
  // ------------------------------------------------------------------------
  const body = group(vessel, 0, 1.12, 0);

  // Pelve e Pernas esguias e musculosas parcialmente envoltas na névoa
  const pelvis = group(body, 0, 0.94, 0);
  sculpt(pelvis, new THREE.SphereGeometry(0.24, 22, 20), M.skinAsh, [0, 0, 0], [0, 0, 0], [1.08, 0.75, 0.8]);

  const legs: Record<string, { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group }> = {};
  for (const side of ['L', 'R']) {
    const s = side === 'R' ? 1 : -1;
    const hip = group(pelvis, s * 0.16, -0.04, 0);

    // Coxa esguia e definida
    sculpt(hip, new THREE.CylinderGeometry(0.138, 0.098, 0.52, 20), M.skinAsh, [0, -0.25, 0], [0, 0, 0], [1.0, 1, 1.06]);
    const quadGeo = new THREE.SphereGeometry(0.106, 16, 16);
    sculpt(hip, quadGeo, M.skinAsh, [s * 0.02, -0.22, 0.048], [0, 0, 0], [0.92, 1.85, 0.84]);

    // Joelho
    sculpt(hip, new THREE.SphereGeometry(0.088, 16, 16), M.skinAsh, [0, -0.52, 0.014]);

    // Panturrilha e Grevas de Ferro Negro e Bronze
    const knee = group(hip, 0, -0.53, 0);
    sculpt(knee, new THREE.CylinderGeometry(0.088, 0.054, 0.48, 18), M.skinAsh, [0, -0.24, 0]);
    sculpt(knee, new THREE.SphereGeometry(0.084, 16, 16), M.skinAsh, [0, -0.17, -0.038], [0, 0, 0], [0.95, 1.65, 0.94]);
    sculpt(knee, new THREE.CylinderGeometry(0.086, 0.058, 0.36, 14, 1, false, -0.85, 1.7), M.blackIron, [0, -0.24, 0.01]);

    // Pé com bota/sandália sombria
    const ankle = group(knee, 0, -0.48, 0.02);
    sculpt(ankle, new THREE.BoxGeometry(0.092, 0.05, 0.22), M.blackIron, [0, -0.02, 0.04], [0.22, 0, 0]);
    sculpt(ankle, new THREE.BoxGeometry(0.098, 0.016, 0.23), M.tarnishedGold, [0, -0.046, 0.04], [0.22, 0, 0]);
    legs[side] = { hip, knee, ankle };
  }

  // Postura flutuante aristocrática e sombria
  legs.R.hip.rotation.set(0.14, 0.05, 0.04);
  legs.R.knee.rotation.set(0.18, 0, 0);
  legs.L.hip.rotation.set(-0.32, -0.06, -0.04);
  legs.L.knee.rotation.set(0.52, 0, 0);

  // ------------------------------------------------------------------------
  // C. TRONCO ESCULPIDO (ALTO, ESGUIO-MUSCULOSO COM VEIAS NECROMÂNTICAS)
  // ------------------------------------------------------------------------
  const torso = group(body, 0, 1.38, 0);

  const torsoPts = [
    new THREE.Vector2(0.01, -0.46),
    new THREE.Vector2(0.24, -0.42), // Quadril estreito
    new THREE.Vector2(0.21, -0.21), // Cintura aristocrática
    new THREE.Vector2(0.27, 0.04),  // Costelas definidas
    new THREE.Vector2(0.38, 0.29),  // Ombros largos
    new THREE.Vector2(0.33, 0.45),  // Clavícula
    new THREE.Vector2(0.14, 0.52),  // Pescoço
    new THREE.Vector2(0.01, 0.53)
  ];
  sculpt(torso, new THREE.LatheGeometry(torsoPts, 36), M.skinAsh, [0, 0, 0], [0, 0, 0], [1.16, 1.04, 0.70]);

  // Peitorais esculpidos
  const pecGeo = new THREE.SphereGeometry(0.205, 24, 24);
  sculpt(torso, pecGeo, M.skinAsh, [-0.18, 0.24, 0.155], [0.12, -0.22, -0.14], [1.04, 0.85, 0.56]);
  sculpt(torso, pecGeo, M.skinAsh, [0.18, 0.24, 0.155], [0.12, 0.22, 0.14], [1.04, 0.85, 0.56]);

  // Veias necromânticas brilhando em verde-esmeralda e violeta no peito direito (exposto)
  const chestVein1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.33, 0.34, 0.08),
    new THREE.Vector3(0.22, 0.27, 0.22),
    new THREE.Vector3(0.13, 0.19, 0.24),
    new THREE.Vector3(0.16, 0.09, 0.23)
  ]);
  sculpt(torso, new THREE.TubeGeometry(chestVein1, 16, 0.0065, 6, false), M.necroticVein);

  const chestVein2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.27, 0.22),
    new THREE.Vector3(0.27, 0.15, 0.20),
    new THREE.Vector3(0.21, 0.04, 0.21)
  ]);
  sculpt(torso, new THREE.TubeGeometry(chestVein2, 12, 0.005, 6, false), M.tartarusVein);

  // Abdômen esculpido (6-pack) e oblíquos
  const abGeo = new THREE.SphereGeometry(0.082, 16, 16);
  [
    { y: 0.045, sx: 0.96, sy: 0.75, z: 0.198 },
    { y: -0.075, sx: 0.92, sy: 0.78, z: 0.194 },
    { y: -0.195, sx: 0.84, sy: 0.84, z: 0.184 }
  ].forEach(lvl => {
    sculpt(torso, abGeo, M.skinAsh, [-0.068, lvl.y, lvl.z], [0, -0.1, 0], [lvl.sx, lvl.sy, 0.46]);
    sculpt(torso, abGeo, M.skinAsh, [0.068, lvl.y, lvl.z], [0, 0.1, 0], [lvl.sx, lvl.sy, 0.46]);
  });

  const obliqueGeo = new THREE.CapsuleGeometry(0.074, 0.23, 10, 16);
  sculpt(torso, obliqueGeo, M.skinAsh, [-0.235, -0.11, 0.08], [0.1, 0, -0.18], [0.85, 1, 0.85]);
  sculpt(torso, obliqueGeo, M.skinAsh, [0.235, -0.11, 0.08], [0.1, 0, 0.18], [0.85, 1, 0.85]);

  // Dorsais, Trapézio e Pescoço esguio
  const latGeo = new THREE.SphereGeometry(0.225, 20, 20);
  sculpt(torso, latGeo, M.skinAsh, [-0.20, 0.18, -0.11], [0, 0, -0.25], [1.0, 1.35, 0.64]);
  sculpt(torso, latGeo, M.skinAsh, [0.20, 0.18, -0.11], [0, 0, 0.25], [1.0, 1.35, 0.64]);

  const trapGeo = new THREE.SphereGeometry(0.205, 18, 18);
  sculpt(torso, trapGeo, M.skinAsh, [-0.175, 0.43, -0.04], [0, 0, 0.42], [1.1, 0.65, 0.74]);
  sculpt(torso, trapGeo, M.skinAsh, [0.175, 0.43, -0.04], [0, 0, -0.42], [1.1, 0.65, 0.74]);

  sculpt(torso, new THREE.CylinderGeometry(0.115, 0.145, 0.27, 20), M.skinAsh, [0, 0.55, -0.01], [0.08, 0, 0], [1, 1, 1.04]);

  // ------------------------------------------------------------------------
  // D. ROSTO ARISTOCRÁTICO, SÓBRIO E MACABRO + ELMO DAS TREVAS (KYNEE)
  // ------------------------------------------------------------------------
  const head = group(torso, 0, 0.78, 0.036);

  // Crânio alongado com bochechas encovadas, maçãs salientes e queixo pontiagudo
  const skullGeo = new THREE.SphereGeometry(0.205, 36, 36);
  const sPos = skullGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < sPos.count; i++) {
    let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
    y *= 1.26; // Face aristocrática alongada
    x *= 0.85; // Rosto fino e encovado
    if (y < 0.03 && y > -0.06 && z > 0) { x *= 1.14; z *= 1.08; } // Maçãs do rosto afiladas
    if (y <= -0.06 && y > -0.14 && z > 0) { x *= 0.84; }          // Bochechas encovadas (gaunt)
    if (y <= -0.14 && z > -0.01) { x *= 0.78; z *= 1.12; }         // Queixo fino e angular
    if (z < -0.12) z *= 0.92;
    sPos.setXYZ(i, x, y, z);
  }
  skullGeo.computeVertexNormals();
  sculpt(head, skullGeo, M.skinAsh);

  // Maçãs do rosto angulosas e sombras sub-zigomáticas
  const cheekGeo = new THREE.BoxGeometry(0.058, 0.042, 0.062);
  sculpt(head, cheekGeo, M.skinAsh, [-0.074, -0.008, 0.155], [0.15, -0.48, -0.22]);
  sculpt(head, cheekGeo, M.skinAsh, [0.074, -0.008, 0.155], [0.15, 0.48, 0.22]);

  // Nariz fino, reto e aristocrático
  sculpt(head, new THREE.BoxGeometry(0.024, 0.096, 0.052), M.skinAsh, [0, 0.006, 0.198], [-0.15, 0, 0]);
  sculpt(head, new THREE.ConeGeometry(0.018, 0.036, 10), M.skinAsh, [0, -0.044, 0.214], [1.45, 0, 0]);

  // Sobrancelhas severas e arqueadas de soberano implacável
  const browRidge = new THREE.CapsuleGeometry(0.015, 0.068, 8, 12);
  sculpt(head, browRidge, M.skinShade, [-0.05, 0.048, 0.184], [0.12, 0.25, 1.26]);
  sculpt(head, browRidge, M.skinShade, [0.05, 0.048, 0.184], [0.12, -0.25, -1.26]);

  const eyebrow = new THREE.CapsuleGeometry(0.012, 0.068, 8, 12);
  sculpt(head, eyebrow, M.hairObsidian, [-0.05, 0.055, 0.193], [0.12, 0.25, 1.22], [1.1, 1, 0.85]);
  sculpt(head, eyebrow, M.hairObsidian, [0.05, 0.055, 0.193], [0.12, -0.25, -1.22], [1.1, 1, 0.85]);

  // Olhos espectrais brilhando em verde-esmeralda frio nas órbitas sombreadas
  const eyeGeo = new THREE.SphereGeometry(0.019, 16, 16);
  sculpt(head, eyeGeo, M.eyeSpectral, [-0.05, 0.025, 0.178], [0, 0, 0], [1.15, 0.64, 0.8]);
  sculpt(head, eyeGeo, M.eyeSpectral, [0.05, 0.025, 0.178], [0, 0, 0], [1.15, 0.64, 0.8]);

  const eyelidGeo = new THREE.BoxGeometry(0.048, 0.013, 0.028);
  sculpt(head, eyelidGeo, M.skinShade, [-0.05, 0.034, 0.188], [0.18, 0.22, -0.2]);
  sculpt(head, eyelidGeo, M.skinShade, [0.05, 0.034, 0.188], [0.18, -0.22, 0.2]);

  // Lábios finos e sérios
  sculpt(head, new THREE.CapsuleGeometry(0.01, 0.044, 8, 12), M.skinShade, [0, -0.095, 0.192], [0, 0, Math.PI / 2], [1, 1, 0.75]);

  // Barba pontiaguda de monarca sombrio (cavanhaque real afilado + bigode fino)
  const stacheL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.008, -0.072, 0.20),
    new THREE.Vector3(-0.045, -0.084, 0.192),
    new THREE.Vector3(-0.062, -0.125, 0.172)
  ]);
  const stacheR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.008, -0.072, 0.20),
    new THREE.Vector3(0.045, -0.084, 0.192),
    new THREE.Vector3(0.062, -0.125, 0.172)
  ]);
  sculpt(head, new THREE.TubeGeometry(stacheL, 12, 0.013, 8, false), M.hairObsidian);
  sculpt(head, new THREE.TubeGeometry(stacheR, 12, 0.013, 8, false), M.hairObsidian);

  // Cavanhaque longo e pontiagudo em ferro/obsidiana com mechas cinzas
  const goateeGeo = new THREE.ConeGeometry(0.044, 0.28, 14);
  goateeGeo.rotateX(Math.PI);
  const beardTip = sculpt(head, goateeGeo, M.hairObsidian, [0, -0.23, 0.175], [-0.14, 0, 0], [0.95, 1, 0.78]);
  sculpt(head, goateeGeo, M.hairAshStreak, [0, -0.21, 0.168], [-0.12, 0, 0], [0.72, 0.9, 0.72]);

  // Cabelos longos e lisos/ondulados negros com mechas cinzentas caindo pelas costas
  sculpt(head, new THREE.SphereGeometry(0.208, 24, 24), M.hairObsidian, [0, 0.055, -0.02], [-0.1, 0, 0], [0.96, 1.04, 1.06]);
  const hairStrands: Array<{ mesh: THREE.Mesh; phase: number }> = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 1.55 + Math.PI * 0.72;
    const r = 0.18;
    const sx = Math.sin(angle) * r;
    const sz = Math.cos(angle) * r - 0.01;
    const sy = 0.085 + Math.cos(angle * 2) * 0.02;
    const len = 0.56 + (i % 3) * 0.08;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const flare = 1 + t * 0.34;
      pts.push(new THREE.Vector3(
        sx * flare + Math.sin(t * Math.PI * 2.0 + i) * 0.026,
        sy - t * len,
        sz * flare - t * 0.15
      ));
    }
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.031 * (1 - 0.15 * (i % 2)), 8, false);
    const strand = sculpt(head, tube, i % 4 === 0 ? M.hairAshStreak : M.hairObsidian);
    hairStrands.push({ mesh: strand, phase: i * 0.42 });
  }

  // COROA-ELMO DAS TREVAS (KYNEE) — Ferro Negro, Pontas Góticas e Chifres Curvos
  const crown = group(head, 0, 0.125, 0.008);
  crown.rotation.x = 0.14;

  // Diadema frontal de ferro negro e bronze envelhecido
  const crownBase = new THREE.CylinderGeometry(0.198, 0.192, 0.055, 32, 1, true);
  sculpt(crown, crownBase, M.blackIron, [0, 0, 0], [0, 0, 0], [0.94, 1, 1.06]);

  // Pontas de coroa macabra ao redor da cabeça (pontas frontais mais altas)
  for (let i = 0; i < 9; i++) {
    const ang = ((i - 4) / 4) * Math.PI * 0.75;
    const isCenter = i === 4;
    const hSpike = isCenter ? 0.22 : (0.14 - Math.abs(i - 4) * 0.015);
    sculpt(
      crown,
      new THREE.ConeGeometry(isCenter ? 0.028 : 0.02, hSpike, 5),
      isCenter ? M.tarnishedGold : M.blackIron,
      [Math.sin(ang) * 0.186, 0.025 + hSpike * 0.45, Math.cos(ang) * 0.208],
      [0.12, ang, 0],
      [0.85, 1, 0.45]
    );
  }
  // Gema espectral incrustada no centro da coroa
  sculpt(crown, new THREE.OctahedronGeometry(0.022, 0), M.soulCore, [0, 0.015, 0.214], [0, 0, 0], [0.75, 1.35, 0.6]);

  // Chifres sombrios curvados para trás nas laterais do Elmo das Trevas
  for (const side of [-1, 1]) {
    const hornCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.185, 0.02, 0.02),
      new THREE.Vector3(side * 0.245, 0.11, -0.06),
      new THREE.Vector3(side * 0.215, 0.24, -0.18),
      new THREE.Vector3(side * 0.155, 0.31, -0.26)
    ]);
    sculpt(crown, new THREE.TubeGeometry(hornCurve, 16, 0.022, 8, false), M.blackIron);
    sculpt(crown, new THREE.ConeGeometry(0.022, 0.09, 8), M.tarnishedGold, [side * 0.145, 0.33, -0.28], [-0.85, 0, side * 0.35]);
  }

  // ------------------------------------------------------------------------
  // E. BRAÇOS MUSCULOSOS + OMBREIRA DE CRÂNIO ESCULPIDO NO OMBRO ESQUERDO
  // ------------------------------------------------------------------------
  function createHadesArm(isRight: boolean) {
    const s = isRight ? 1 : -1;
    const arm = group(torso, s * 0.43, 0.35, -0.01);

    // Deltoide
    sculpt(arm, new THREE.SphereGeometry(0.14, 20, 20), M.skinAsh, [0, 0, 0], [0, 0, s * -0.25], [1.04, 1.15, 1.04]);

    // Bíceps e Tríceps
    sculpt(arm, new THREE.CapsuleGeometry(0.09, 0.28, 12, 18), M.skinAsh, [s * 0.024, -0.185, 0], [0, 0, s * 0.08]);
    sculpt(arm, new THREE.SphereGeometry(0.084, 16, 16), M.skinAsh, [s * 0.016, -0.175, 0.044], [0, 0, s * 0.08], [0.92, 1.45, 0.92]);
    sculpt(arm, new THREE.SphereGeometry(0.082, 16, 16), M.skinAsh, [s * 0.05, -0.185, -0.038], [0, 0, s * 0.08], [0.95, 1.4, 0.9]);

    // Antebraço
    const elbow = group(arm, s * 0.044, -0.37, 0);
    sculpt(elbow, new THREE.CylinderGeometry(0.085, 0.054, 0.34, 18), M.skinAsh, [0, -0.16, 0], [0, 0, 0], [1.04, 1, 0.95]);
    sculpt(elbow, new THREE.SphereGeometry(0.068, 14, 14), M.skinAsh, [s * 0.018, -0.09, 0.02], [0, 0, 0], [0.95, 1.5, 0.95]);

    // Braçadeira pontiaguda de Ferro Negro e Bronze
    const bracer = group(elbow, 0, -0.26, 0);
    sculpt(bracer, new THREE.CylinderGeometry(0.068, 0.059, 0.11, 24, 1, true), M.blackIron, [0, 0, 0], [0, 0, 0], [1.05, 1, 0.96]);
    const bRing = new THREE.TorusGeometry(0.065, 0.006, 8, 24);
    bRing.rotateX(Math.PI / 2);
    sculpt(bracer, bRing, M.tarnishedGold, [0, 0.05, 0], [0, 0, 0], [1.05, 1, 0.96]);
    sculpt(bracer, bRing, M.tarnishedGold, [0, -0.05, 0], [0, 0, 0], [1.05, 1, 0.96]);
    // Espigão lateral na braçadeira
    sculpt(bracer, new THREE.ConeGeometry(0.016, 0.075, 6), M.blackIron, [s * 0.078, 0.01, -0.01], [0, 0, -s * 1.35]);

    // Mão com dedos articulados
    const hand = group(elbow, 0, -0.35, 0);
    sculpt(hand, new THREE.BoxGeometry(0.072, 0.082, 0.036), M.skinAsh, [0, -0.02, 0]);
    const fingerGeo = new THREE.CapsuleGeometry(0.01, 0.04, 6, 8);
    for (let f = 0; f < 4; f++) {
      const fx = (f - 1.5) * 0.017;
      sculpt(hand, fingerGeo, M.skinAsh, [fx, -0.065, 0.018], [isRight ? 1.25 : 0.35, 0, 0]);
    }
    sculpt(hand, fingerGeo, M.skinAsh, [-s * 0.04, -0.032, 0.022], [0.6, 0, -s * 0.65], [1.1, 0.9, 1.1]);

    return { arm, elbow, hand };
  }

  const rightArm = createHadesArm(true);
  const leftArm = createHadesArm(false);

  // OMBREIRA DE CRÂNIO ESCULPIDO NO OMBRO ESQUERDO
  const skullPauldron = group(leftArm.arm, -0.04, 0.05, 0);
  skullPauldron.rotation.set(0.08, 0.15, 0.32);

  // Placa base de ferro negro
  sculpt(
    skullPauldron,
    new THREE.SphereGeometry(0.185, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
    M.blackIron,
    [0, 0.02, 0],
    [0, 0, 0],
    [1.12, 0.78, 1.16]
  );

  // Crânio esculpido sobre a ombreira
  const skullMotif = group(skullPauldron, -0.03, 0.08, 0.04);
  skullMotif.rotation.set(0.25, -0.35, 0.15);
  sculpt(skullMotif, new THREE.SphereGeometry(0.085, 16, 16), M.boneSkull, [0, 0.02, 0], [0, 0, 0], [0.95, 1.05, 1.05]);
  sculpt(skullMotif, new THREE.BoxGeometry(0.072, 0.055, 0.065), M.boneSkull, [0, -0.035, 0.035]);
  // Órbitas oculares brilhando em verde necromântico
  sculpt(skullMotif, new THREE.SphereGeometry(0.018, 10, 10), M.eyeSpectral, [-0.026, 0.0, 0.072]);
  sculpt(skullMotif, new THREE.SphereGeometry(0.018, 10, 10), M.eyeSpectral, [0.026, 0.0, 0.072]);
  // Chifres laterais na ombreira
  sculpt(skullMotif, new THREE.ConeGeometry(0.02, 0.13, 6), M.tarnishedGold, [-0.095, 0.04, -0.01], [0, 0, 0.75]);
  sculpt(skullMotif, new THREE.ConeGeometry(0.02, 0.13, 6), M.tarnishedGold, [0.095, 0.04, -0.01], [0, 0, -0.75]);

  // ------------------------------------------------------------------------
  // F. BIDENTE REAL DE HADES (DUAS PONTAS CURVAS + NÚCLEO DE ALMAS APRISIONADO)
  // ------------------------------------------------------------------------
  const bident = new THREE.Group();
  rightArm.hand.add(bident);
  bident.position.set(0, -0.04, 0.035);

  // Haste longa de ferro negro e bronze envelhecido (2.92 unidades)
  sculpt(bident, new THREE.CylinderGeometry(0.025, 0.028, 2.92, 18), M.blackIron, [0, 0.18, 0]);

  // Anéis ornamentais de bronze ao longo da haste
  for (const ry of [-0.65, -0.15, 0.45, 1.15, 1.52]) {
    sculpt(bident, new THREE.CylinderGeometry(0.034, 0.034, 0.045, 16), M.tarnishedGold, [0, ry, 0]);
  }

  // Ponteira inferior em forma de lança funerária
  sculpt(bident, new THREE.ConeGeometry(0.045, 0.25, 8), M.blackIron, [0, -1.40, 0], [Math.PI, 0, 0], [1, 1, 0.5]);

  // Cabeça Dupla do Bidente de Hades
  const bidentHead = group(bident, 0, 1.62, 0);

  // Base em cálice gótico de bronze e ferro
  sculpt(bidentHead, new THREE.CylinderGeometry(0.072, 0.032, 0.16, 16), M.tarnishedGold, [0, 0.04, 0]);

  // Arco duplo em U profundo sustentando as duas pontas
  const forkArc = new THREE.TorusGeometry(0.24, 0.026, 12, 32, Math.PI);
  forkArc.rotateZ(Math.PI);
  sculpt(bidentHead, forkArc, M.blackIron, [0, 0.26, 0], [0, 0, 0], [1.0, 0.85, 0.65]);

  // Núcleo de Alma Aprisionada flutuando e girando ENTRE as duas pontas do Bidente
  const soulOrb = sculpt(bidentHead, new THREE.OctahedronGeometry(0.088, 1), M.soulCore, [0, 0.34, 0], [0, 0, 0], [0.85, 1.25, 0.85]);
  const soulRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.009, 8, 32),
    new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  soulRing1.position.set(0, 0.34, 0);
  bidentHead.add(soulRing1);

  const soulRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.175, 0.008, 8, 32),
    new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  soulRing2.position.set(0, 0.34, 0);
  soulRing2.rotation.x = Math.PI / 3;
  bidentHead.add(soulRing2);

  // As Duas Pontas Longas e Farpadas do Bidente
  for (const side of [-1, 1]) {
    const prong = group(bidentHead, side * 0.24, 0.26, 0);

    // Lâmina vertical longa afiada
    sculpt(prong, new THREE.CylinderGeometry(0.015, 0.032, 0.62, 10), M.blackIron, [0, 0.31, 0], [0, 0, 0], [1, 1, 0.45]);
    // Ponta superior longa e ameaçadora
    sculpt(prong, new THREE.ConeGeometry(0.052, 0.32, 6), M.tarnishedGold, [0, 0.76, 0], [0, 0, side * -0.05], [1, 1, 0.32]);
    // Farpa externa em gancho
    sculpt(prong, new THREE.ConeGeometry(0.028, 0.14, 6), M.blackIron, [side * 0.032, 0.48, 0], [0, 0, -side * 2.35], [0.85, 1, 0.4]);
    // Filete de energia necromântica na lâmina
    sculpt(prong, new THREE.BoxGeometry(0.008, 0.42, 0.026), M.necroticVein, [0, 0.36, 0]);
  }

  // Âncora de disparo entre as pontas do Bidente
  const bidentAnchor = group(bidentHead, 0, 0.52, 0);
  const bidentGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 12),
    new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    })
  );
  bidentAnchor.add(bidentGlow);

  // ------------------------------------------------------------------------
  // G. VESTES DO SUBMUNDO (FAIXA SOBRE O OMBRO ESQUERDO, SAIOTE E MANTO ESFARRAPADO)
  // ------------------------------------------------------------------------
  const garments = group(torso, 0, 0, 0);

  // Faixa da túnica sombria cruzando o ombro esquerdo (deixando o peito direito e veias visíveis)
  const sashCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.20, -0.42, 0.20),
    new THREE.Vector3(-0.24, 0.05, 0.22),
    new THREE.Vector3(-0.22, 0.44, 0.12),
    new THREE.Vector3(-0.20, 0.46, -0.12),
    new THREE.Vector3(-0.16, 0.05, -0.20),
    new THREE.Vector3(-0.13, -0.42, -0.16)
  ]);
  const sashGeo = new THREE.TubeGeometry(sashCurve, 32, 0.105, 12, false);
  sashGeo.scale(1.15, 1, 0.48);
  sculpt(garments, sashGeo, M.tunic);

  // Cinto de Ferro Negro e Bronze com fivela de gema do Tártaro
  const beltGeo = new THREE.TorusGeometry(0.255, 0.026, 12, 36);
  beltGeo.rotateX(Math.PI / 2);
  sculpt(garments, beltGeo, M.blackIron, [0, -0.36, 0.01], [0.06, 0, -0.04], [1.06, 1, 0.82]);

  const buckle = group(garments, 0, -0.36, 0.215);
  sculpt(buckle, new THREE.BoxGeometry(0.11, 0.095, 0.025), M.tarnishedGold);
  sculpt(buckle, new THREE.OctahedronGeometry(0.032, 0), M.tartarusVein, [0, 0, 0.016]);

  // Saiote / Túnica inferior com barra irregular / esfarrapada e runas
  const skirtGeo = new THREE.CylinderGeometry(0.265, 0.56, 0.92, 48, 22, true);
  const skPos = skirtGeo.attributes.position as THREE.BufferAttribute;
  const skirtBase = new Float32Array(skPos.array.length);
  for (let i = 0; i < skPos.count; i++) {
    let x = skPos.getX(i), y = skPos.getY(i), z = skPos.getZ(i);
    const angle = Math.atan2(z, x);
    const normY = (0.46 - y) / 0.92;
    const pleat = Math.sin(angle * 11) * 0.032 * (0.25 + normY * 0.95);
    // Borda inferior esfarrapada (pontas irregulares)
    const tatterY = Math.sin(angle * 7) * 0.065 * Math.pow(Math.max(0, normY), 2);
    const r = Math.sqrt(x * x + z * z) + pleat;
    x = Math.cos(angle) * r * 1.05;
    z = Math.sin(angle) * r * 0.83 - normY * 0.08;
    y += tatterY;
    skPos.setXYZ(i, x, y, z);
    skirtBase[i * 3] = x;
    skirtBase[i * 3 + 1] = y;
    skirtBase[i * 3 + 2] = z;
  }
  skirtGeo.computeVertexNormals();
  const skirtMesh = sculpt(garments, skirtGeo, M.tunic, [0, -0.80, 0], [0.04, 0, 0]);

  // Manto das Sombras Esfarrapado (ondula como fumaça densa na barra inferior)
  const capeGeo = new THREE.PlaneGeometry(1.38, 1.96, 26, 34);
  const cPos = capeGeo.attributes.position as THREE.BufferAttribute;
  const capeBase = new Float32Array(cPos.array.length);
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i), y = cPos.getY(i);
    const normY = Math.max(0, Math.min(1, (0.98 - y) / 1.96));
    const archZ = -0.17 - Math.cos((x / 0.69) * Math.PI * 0.5) * 0.08;
    const z = archZ - normY * 0.54;
    const fx = x * (0.64 + normY * 0.78);
    // Pontas esfarrapadas na base do manto
    const tatter = Math.sin(x * 11) * 0.11 * Math.pow(normY, 2.2);
    const fy = y + tatter;
    cPos.setXYZ(i, fx, fy, z);
    capeBase[i * 3] = fx;
    capeBase[i * 3 + 1] = fy;
    capeBase[i * 3 + 2] = z;
  }
  capeGeo.computeVertexNormals();
  const cape = sculpt(garments, capeGeo, M.shadowCloak, [0, -0.46, -0.04]);

  return {
    vessel, shadowBaseGroup, shadowCone, groundAuraRing, orbitingWisps,
    body, torso, head, beardTip, legs,
    rightArm, leftArm,
    bident, bidentHead, soulOrb, soulRing1, soulRing2, bidentAnchor, bidentGlow,
    hairStrands,
    skirtMesh, skirtBase,
    cape, capeBase
  };
}

/* ==========================================================================
   4. AMBIENTE DO TEMPLO DE OBSIDIANA NO SUBMUNDO (CHÃO, RUNAS, PILARES E BRASEIROS)
   ========================================================================== */
export interface HadesUnderworldEnvironment {
  ground: THREE.Mesh;
  runeRings: THREE.Mesh[];
  pillarFlames: Array<{ f1: THREE.Mesh; f2: THREE.Mesh; phase: number }>;
}

export function createHadesUnderworldEnvironment(
  scene: THREE.Scene | THREE.Group,
  textures: HadesProceduralTextures
): HadesUnderworldEnvironment {
  // Chão de Obsidiana do Submundo
  const groundMat = new THREE.MeshStandardMaterial({
    map: textures.obsidianTex,
    color: 0x334155,
    roughness: 0.38,
    metalness: 0.45
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(7.6, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Anéis arcanos concêntricos no chão de obsidiana
  const runeRings: THREE.Mesh[] = [];
  const ringConfigs: Array<[number, number, number]> = [
    [3.4, 0.05, 0x10b981],
    [4.15, 0.035, 0x9333ea],
    [4.95, 0.025, 0xb45309]
  ];
  for (const [r, w, col] of ringConfigs) {
    const rg = new THREE.Mesh(
      new THREE.RingGeometry(r, r + w, 72),
      new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );
    rg.rotation.x = -Math.PI / 2;
    rg.position.y = 0.012;
    scene.add(rg);
    runeRings.push(rg);
  }

  // 8 Pilares de Basalto Rachado com Braseiros de Chama Espectral Verde-Violeta
  const basaltMat = new THREE.MeshStandardMaterial({
    map: textures.obsidianTex,
    color: 0x3f3f46,
    roughness: 0.65,
    metalness: 0.25
  });
  const bronzeBrazierMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    metalness: 0.85,
    roughness: 0.3
  });
  const greenFlameMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  const purpleFlameMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const pillarFlames: Array<{ f1: THREE.Mesh; f2: THREE.Mesh; phase: number }> = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.22;
    const dist = 5.65;
    const pGroup = group(scene, Math.cos(a) * dist, 0, Math.sin(a) * dist);

    // Base escalonada de basalto
    sculpt(pGroup, new THREE.BoxGeometry(0.72, 0.18, 0.72), basaltMat, [0, 0.09, 0]);
    sculpt(pGroup, new THREE.CylinderGeometry(0.30, 0.35, 0.16, 12), basaltMat, [0, 0.26, 0]);

    // Fuste octogonal sombrio
    sculpt(pGroup, new THREE.CylinderGeometry(0.24, 0.28, 2.65, 8), basaltMat, [0, 1.66, 0]);
    sculpt(pGroup, new THREE.TorusGeometry(0.27, 0.025, 8, 16), bronzeBrazierMat, [0, 1.65, 0], [Math.PI / 2, 0, 0]);

    // Capitel e Braseiro de ferro/bronze
    sculpt(pGroup, new THREE.BoxGeometry(0.66, 0.16, 0.66), basaltMat, [0, 3.06, 0]);
    sculpt(pGroup, new THREE.CylinderGeometry(0.34, 0.20, 0.18, 12), bronzeBrazierMat, [0, 3.22, 0]);

    // Chama espectral no topo do braseiro
    const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.52, 10), greenFlameMat);
    f1.position.y = 3.52;
    pGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 8), purpleFlameMat);
    f2.position.y = 3.46;
    pGroup.add(f2);

    pillarFlames.push({ f1, f2, phase: i * 0.85 });
  }

  return { ground, runeRings, pillarFlames };
}
